var Peer = require("simple-peer");
var iocli = require("./fakeio.js");
var accountHelper = require("../accounthelper/index.js");

function isSecure() {
  var urlinfo = new URL(window.location.href);
  if (urlinfo.protocol == "https:") {
    return true;
  }
  return false;
}

function getWSSURI(id) {
  return (
    (isSecure() ? "wss://" : "ws://") + window.location.host + "/webrtc/" + id
  );
}

var configstuff = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:vpn.mikedev101.cc:3478" },
    {
      urls: "turn:vpn.mikedev101.cc:3478",
      username: "free",
      credential: "free",
    },
    { urls: "stun:freeturn.net:3478" },
    { urls: "stun:freeturn.net:5349" },
    { urls: "turn:freeturn.net:3478", username: "free", credential: "free" },
    { urls: "turn:freeturn.net:5349", username: "free", credential: "free" },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
    {
      urls: "turn:turn.bistri.com:80",
      credential: "homeo",
      username: "homeo",
    },
    {
      urls: "turn:turn.anyfirewall.com:443?transport=tcp",
      credential: "webrtc",
      username: "webrtc",
    },
  ],
  iceTransportPolicy: "all",
};

function debugFunction(text) {
  var elm = document.createElement("span");
  elm.style.color = "grey";
  elm.textContent = text;
  document.body.append(elm);
}

function importScript(src) {
  return new Promise((accept, reject) => {
    var script = document.createElement("script");
    script.src = src;
    script.onload = accept;
    script.onerror = reject;
  });
}

async function httprequest(url, method, body) {
  var a = await fetch(url, { method: method, body: body });
  var b = await a.text();
  return {
    text: b,
    response: a,
  };
}

class HostInfo {
  constructor(json) {
    this.json = json;
    this.key = json.key;
  }
  get wsURL() {
    return getWSSURI(this.key);
  }
}

class ScreenShareHost {
  constructor(stream, host, autoconnect, disconnectfunc) {
    this.stream = stream;
    this.host = host;
    this.connectionURL = host.wsURL;
    this.autoconnect = autoconnect;
    this.ondisconnect = disconnectfunc || (() => {});
    this.wasClosedConnection = false;
    if (autoconnect) {
      this.connect();
    }
  }

  connect() {
    var t = this;
    t.fakeio = new iocli(t.connectionURL);
    var fakeio = t.fakeio;

    fakeio.on("connection", () => {
      t.init(fakeio);
    });
    fakeio.on("disconnect", () => {
      t.ondisconnect();
    });
  }

  closeConnection() {
    this.wasClosedConnection = true;
    if (this.fakeio) {
      this.fakeio.close();
    }
    this.connectionList.forEach((connection) => {
      try {
        connection.peer.close();
      } catch (e) {}
      try {
        connection.peer.destroy();
      } catch (e) {}
      try {
        connection.peer.removeAllListeners();
      } catch (e) {}
      clearInterval(connection.idleinterval);
    });
    clearInterval(this.tickinterval);
  }

  init(socket) {
    if (this.wasClosedConnection) {
      return; // Do not initialize if we're already closed
    }
    try {
      socket.emit("newHost");
      this.connectionList = [];
      clearInterval(this.tickinterval);
      this.tickinterval = setInterval(() => {
        socket.emit("tick");
      }, 200);
      var numberid = 0;

      socket.on("socketDisconnection", (socketId) => {
        var newList = [];
        for (var connection of this.connectionList) {
          if (socketId == connection.socketId) {
            try {
              connection.peer.close();
            } catch (e) {}
            try {
              connection.peer.destroy();
            } catch (e) {}
            try {
              connection.peer.removeAllListeners();
            } catch (e) {}
            clearInterval(connection.idleinterval);
          } else {
            newList.push(connection);
          }
        }
        this.connectionList = newList;
      });

      socket.on("newConnection", (socketId, SocketConfig) => {
        numberid += 1;
        var connection = {
          socketId: socketId,
          peer: null,
          offer: "",
          answer: "",
          numberid: numberid,
        };

        const peerConnectionInit = () => {
          if (connection.peer) {
            try {
              connection.peer.close();
            } catch (e) {}
            try {
              connection.peer.destroy();
            } catch (e) {}
            try {
              connection.peer.removeAllListeners();
            } catch (e) {}
          }
          clearInterval(connection.idleinterval);

          connection.peer = new Peer({
            initiator: true,
            config: SocketConfig,
            stream: this.stream,
          });

          connection.peer.on("signal", (offer) => {
            connection.offer = JSON.stringify(offer);
            socket.emit("newOffer", connection);
          });

          connection.peer.on("iceStateChange", (state) => {
            //debugFunction(state);
            if (
              (state === "disconnected" || state === "failed") &&
              !this.wasClosedConnection
            ) {
              socket.emit("retryPeerConnection", connection.socketId);
              peerConnectionInit();
            }
          });

          connection.peer.on("icecandidate", (candidate) => {
            console.log("connection.peer.on icecandidate emitted");
            if (candidate) {
              socket.emit("newCandidate", {
                socketId: connection.socketId,
                candidate,
              }); // Emit candidate directly
            }
          });

          connection.idleinterval = setInterval(() => {
            if (connection.peer.connected) {
              connection.peer.send("keep-alive");
            }
          }, 100);
        };

        peerConnectionInit();
        socket.on("recreatePeer", peerConnectionInit);

        socket.on("newAnswer", (answer) => {
          if (answer.socketId === connection.socketId) {
            connection.answer = answer;
            connection.peer.signal(connection.answer.answer);
          }
        });

        this.connectionList.push(connection);
      });
    } catch (e) {
      console.error("failed to intialize", e);
    }
  }
}

async function startHost(
  stream,
  autoconnect,
  disconnectfunction,
  retryattempts,
  err,
) {
  try {
    var att = retryattempts;
    var req = await httprequest(
      accountHelper.getServerURL() + "/webrtc/newhost",
      "POST",
      "{}",
    );
    var json = JSON.parse(req.text);
    var hostInfo = new HostInfo(json);
    return new ScreenShareHost(
      stream,
      hostInfo,
      autoconnect,
      disconnectfunction,
    );
  } catch (e) {
    if (typeof att == "number") {
      att += 1;
    } else {
      att = 1;
    }
    if (att > 10) {
      throw err;
      return;
    }
    return await startHost(stream, autoconnect, disconnectfunction, att, e); //retry
  }
}

class ScreenSharePeer {
  constructor(id, autoconnect, onstream, ondisconnect) {
    this.hostid = id;
    this.host = new HostInfo({ key: id });
    this.connectionURL = this.host.wsURL;
    this.autoconnect = autoconnect;
    this.onstream = onstream || (() => {});
    this.ondisconnect = ondisconnect || (() => {});
    this.wasClosedConnection = false;
    if (autoconnect) {
      this.connect();
    }
  }

  connect() {
    this.fakeio = new iocli(this.connectionURL);
    this.init(this.fakeio);
    this.fakeio.on("disconnect", this.ondisconnect);
  }

  closeConnection() {
    this.wasClosedConnection = true;
    if (this.fakeio) {
      this.fakeio.close();
    }
    if (this.peer) {
      try {
        this.peer.close();
      } catch (e) {}
      try {
        this.peer.destroy();
      } catch (e) {}
      try {
        this.peer.removeAllListeners();
      } catch (e) {}
    }
    clearInterval(this.idleinterval);
  }

  init(socket) {
    if (this.wasClosedConnection) {
      return; // Do not initialize if we're already closed
    }
    try {
      let peer = null;
      const initPeer = () => {
        if (peer) {
          try {
            peer.close();
          } catch (e) {}
          try {
            peer.destroy();
          } catch (e) {}
          try {
            peer.removeAllListeners();
          } catch (e) {}
        }
        clearInterval(this.idleinterval);

        peer = new Peer({
          initiator: false,
          config: configstuff,
        });
        this.peer = peer;

        this.idleinterval = setInterval(() => {
          if (peer.connected) {
            peer.send("keep-alive");
          }
          socket.emit("tick");
        }, 200);

        peer.on("signal", (answer) => {
          socket.emit("newAnswer", {
            answer: JSON.stringify(answer),
            socketId: socket.id,
          });
        });

        peer.on("stream", (stream) => {
          this.onstream(stream);
        });

        peer.on("iceStateChange", (state) => {
          //debugFunction(state);
          if (
            (state === "disconnected" || state === "failed") &&
            !this.wasClosedConnection
          ) {
            socket.emit("retryPeerConnection", socket.id);
            initPeer();
          }
        });

        socket.on("newCandidate", (data) => {
          console.log("socket.on icecandidate emitted");
          peer
            .addIceCandidate(new RTCIceCandidate(data.candidate)) // Use candidate directly
            .catch((error) =>
              console.error("Error adding ICE candidate:", error),
            );
        });
      };

      initPeer();
      socket.on("hostReady", () => socket.emit("startHandshake", configstuff));
      socket.on("recreatePeer", initPeer);
      socket.on("newOffer", (connection) => peer.signal(connection.offer));
    } catch (e) {
      console.error("failed to intialize", e);
    }
  }
}

function connectTo(id, autoconnect, onstream, ondisconnect) {
  if (!id) throw new Error("Id is required");
  return new ScreenSharePeer(id, autoconnect, onstream, ondisconnect);
}

module.exports = {
  newHost: startHost,
  HostInfo: HostInfo,
  ScreenShareHost: ScreenShareHost,
  connectTo: connectTo,
  iceServers: configstuff.iceServers,
};
