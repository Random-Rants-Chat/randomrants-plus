var ws = require("ws");
var fakeIO = require("./iows.js");
var hosts = {};
var tempNumberIdThing = 0;

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
        io.close();
        if (io.endFunction) {
          io.endFunction();
        }
      }
    });

    socket.on("disconnect", () => {
      connectedCount -= 1;
      if (connectedCount < 1) {
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
  var host = hosts[key];
  host = fakeIoCreate();
  host.endFunction = function () {
    delete hosts[key];
  };
  hosts[key] = host;
  return key;
}

async function handleHTTP(req, res) {
  var url = decodeURIComponent(req.url);
  var urlsplit = url.split("/");

  if (urlsplit[1] == "webrtc") {
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
      return true;
    }
    return false;
  }

  return false;
}

async function handleUpgrade(request, socket, head) {
  var url = decodeURIComponent(request.url);
  var urlsplit = url.split("/");
  var method = urlsplit[1];
  var hostkey = urlsplit[2];
  var host = hosts[hostkey];
  if (method == "webrtc" && host) {
    var wss = host.wss;

    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit("connection", ws, request);
    });
    return true;
  }

  return false;
}

module.exports = {
  handleHTTP,
  handleUpgrade,
};
