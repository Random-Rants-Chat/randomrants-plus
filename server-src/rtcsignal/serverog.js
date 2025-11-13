var http = require("http");
var https = require("https");
var fs = require("fs");
var ws = require("ws");
var path = require("path");
var URL = require("url");
var fakeIO = require("./fakeio-server.js");
var hosts = {};
var tempNumberIdThing = 0;
function setNoCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  /*res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );*/
}
function runStaticStuff(req, res, forceStatus) {
  var url = URL.parse(req.url);
  var pathname = url.pathname;

  setNoCorsHeaders(res);

  var file = path.join("./static/", pathname);
  if (pathname == "/") {
    file = "static/index.html";
  }
  if (file.split(".").length < 2) {
    file += ".html";
  }

  if (!fs.existsSync(file)) {
    file = "errors/404.html";
    res.statusCode = 404;
  }

  if (typeof forceStatus !== "undefined") {
    file = "errors/" + forceStatus + ".html";
    res.statusCode = forceStatus;
  }

  fs.createReadStream(file).pipe(res);
}
function waitForBody(req) {
  return new Promise((accept, reject) => {
    var data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      accept(Buffer.concat(data));
    });
    req.on("error", () => {
      reject();
    });
  });
}
function createRandomCharsString(length) {
  var keys = "ABCDEFGHIJKLKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  var key = "";
  var i = 0;
  while (i < length) {
    key += keys[Math.round(Math.random() * (keys.length - 1))];
    i += 1;
  }
  return key;
}
function fakeIoCreate() {
  //io module was having problems, so remade a smaller api that is closer to the original.
  var connectedUsers = [];
  var hostId = null;
  var waits = [];
  var io = fakeIO({ noServer: true });
  var connectedCount = 0;
  io.on("connection", (socket) => {
    connectedCount += 1;
    const connectedUser = {
      id: socket.id,
      number: connectedUsers.length + 1,
    };
    connectedUsers.push(connectedUser);

    socket.on("newHost", () => {
      if (!hostId) {
        hostId = socket.id;
        for (var user of connectedUsers) {
          io.to(user.id).emit("hostReady");
        }
      }
    });

    socket.on("retryPeerConnection", (socketId) => {
      if (io.to(socketId)) {
        io.to(socketId).emit("recreatePeer");
      }
    });

    if (hostId) {
      socket.emit("hostReady");
    }

    socket.on("startHandshake", (iceServs) => {
      if (io.to(hostId)) {
        io.to(hostId).emit("newConnection", socket.id, iceServs);
      }
    });

    socket.on("end", () => {
      if (socket.id == hostId) {
        for (var wait of waits) {
          clearInterval(wait);
        }
        io.close();
        if (io.endFunction) {
          io.endFunction();
        }
      }
    });

    socket.on("disconnect", () => {
      connectedCount -= 1;
      if (connectedCount < 1) {
        clearInterval();
        io.close();
        if (io.endFunction) {
          io.endFunction();
        }
      }
      if (io.to(hostId)) {
        io.to(hostId).emit("socketDisconnection", socket.id);
      }
      var i = 0;
      connectedUsers = connectedUsers
        .filter((connectedUser) => {
          return connectedUser.id !== socket.id;
        })
        .map((connectedUser) => {
          i++;
          return {
            id: connectedUser.id,
            number: (connectedUser.number = i),
          };
        });
    });

    socket.on("newOffer", (data) => {
      if (!io.to(data.socketId)) {
        return;
      }
      io.to(data.socketId).emit("newOffer", data);
    });

    socket.on("newAnswer", (answer) => {
      if (!io.to(hostId)) {
        return;
      }
      io.to(hostId).emit("newAnswer", answer);
    });

    socket.on("tick", () => {
      //Do nothing here.
    });

    socket.on("newCandidate", (s) => {
      if (!io.to(s.socketId)) {
        return;
      }
      io.to(s.socketId).emit("newCandidate", s);
    });
  });
  return io;
}
function newHostThing(val) {
  tempNumberIdThing += 1;
  var key = tempNumberIdThing.toString() + createRandomCharsString(10);
  if (val) {
    key = val;
  }
  hosts[key] = fakeIoCreate();
  hosts[key].endFunction = function () {
    hosts[key] = undefined;
    var newHosts = {};
    for (var hostid of Object.keys(hosts)) {
      if (hosts[hostid]) {
        newHosts[hostid] = hosts[hostid];
      }
    }
    hosts = newHosts;
  };
  return key;
}
const server = http.createServer(async function (req, res) {
  var url = decodeURIComponent(req.url);
  var urlsplit = url.split("/");

  setNoCorsHeaders(res);
  if (urlsplit[1] == "wake") {
    res.end("");
    return;
  }

  if (urlsplit[1] == "api") {
    if (urlsplit[2] == "newhost" && req.method == "POST") {
      var body = await waitForBody(req);
      try {
        var json = JSON.parse(body.toString());
        var key = newHostThing();
        res.end(
          JSON.stringify({
            key: key,
          }),
        );
      } catch (e) {
        res.end("Failed to create new server!\n" + e);
      }
      return;
    }
    runStaticStuff(req, res, 403);
    return;
  }

  runStaticStuff(req, res);
});

const wsServer = new ws.WebSocketServer({
  noServer: true,
});
wsServer.on("connection", function (socket) {
  socket.on("message", function (msg) {
    wsServer.clients.forEach(function (client) {
      client.send(msg);
    });
  });
  socket.on("close", function () {});
});

server.on("upgrade", function upgrade(request, socket, head) {
  var url = decodeURIComponent(request.url);
  var urlsplit = url.split("/");
  var hostkey = urlsplit[1];
  if (hosts[hostkey]) {
    var wss = hosts[hostkey].wss;

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  } else {
    var wss = new ws.WebSocketServer({ noServer: true });
    wss.on("connection", (ws) => {
      ws.close();
    });

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
  }
});

server.listen(8080);
console.log("Server started!");
