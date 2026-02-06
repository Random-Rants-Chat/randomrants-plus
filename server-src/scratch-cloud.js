//Script that mocks the turbowarp cloud server, without large memory heaps.

var ws = require("ws");

var wssServerOptions = {
  noServer: true,
  maxPayload: 1024 * 1024,
};

const MAX_CLOUD_VALUE_SIZE = 40000;
const MAX_CLOUD_NAME_SIZE = 300;
const DESTROY_TIMEOUT = 1000 * 60 * 10; //Ten minutes before destroy.

const DEBUG_LOGS = false; //Enable to get debug logs.

function getIPFromRequest(req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
}

function labelRequest(req) {
  return `[Mini TurboWarp Cloud Server] [${getIPFromRequest(req)}]: `;
}

class AllowMethods {
  static handshake = true; //This is used to tell what username is connecting, and the project (or room id), to connect to.
  static set = true; //Set cloud variable method.
  static create = true; //Get cloud variable method.
  static rename = true; //Rename cloud variable method.
  static delete = false; //Delete cloud variable method.
}

class ConnectionError {
  static Error = 4000;
  static Username = 4002;
  static Overloaded = 4003;
  static Timeout = 4010;
}

function terminateGhostSockets(ws) {
  var isAlive = true;
  var terminated = false;

  function heartbeat() {
    isAlive = true;
  }

  ws.on("pong", heartbeat);

  var interval = setInterval(() => {
    if (!isAlive) {
      if (!terminated) {
        terminated = true;
        clearInterval(interval);
        ws.terminate();
        //ws.emit("close");
      }
      return;
    }

    isAlive = false;
    try {
      ws.ping();
    } catch (err) {
      if (!terminated) {
        terminated = true;
        clearInterval(interval);
        ws.terminate();
        //ws.emit("close");
      }
    }
  }, 1500); // Check every 1500 miliseconds.

  ws.on("close", () => {
    if (!terminated) {
      terminated = true;
      clearInterval(interval);
    }
  });

  try {
    ws.ping();
  } catch (err) {
    // Socket might already be broken
    if (!terminated) {
      terminated = true;
      clearInterval(interval);
      ws.terminate();
    }
  }
}

var cloudRooms = new Map();

var wss = new ws.WebSocketServer(wssServerOptions);

function createEmptyCloudRoom() {
  return {
    variables: new Map(),
    clients: [],
  };
}

wss.on("connection", (client, request) => {
  if (DEBUG_LOGS) {
    console.log(labelRequest(request) + "Client connection opened.");
  }

  var handshake_timeout = setTimeout(() => {
    client.close(ConnectionError.Timeout, "Handshake timeout.");
  }, 10000); //Ten seconds.

  var currentID, currentCloudRoom, currentUser;
  var isOpen = true;

  client._connectionid = wss.clients.length + "_" + Date.now();

  function processMessage(json) {
    if (!isOpen) {
      return;
    }
    var method = json.method;

    if (!AllowMethods[method]) {
      client.close(
        ConnectionError.Error,
        "Method isn't allowed or doesn't exist."
      );
      return;
    }

    if (method == "handshake") {
      if (currentCloudRoom) {
        client.close(
          ConnectionError.Error,
          "Can't use the handshake method twice."
        );
        return;
      }
      clearTimeout(handshake_timeout);
      var projectID = "" + json.project_id;
      var user = "" + json.user;

      if (DEBUG_LOGS) {
        console.log(
          labelRequest(request) +
            `Handshake for ID: ${projectID} Username: ${user}`
        );
      }

      var room;
      if (cloudRooms.has(projectID)) {
        room = cloudRooms.get(projectID);
      } else {
        room = createEmptyCloudRoom();
        cloudRooms.set(projectID, room);
        room.startDestroyTimeout = function () {
          room.destroyTimeout = setTimeout(() => {
            console.log("Room disposed");
            cloudRooms.delete(projectID);
            room = null;
          }, DESTROY_TIMEOUT);
        };
      }

      currentID = projectID;
      currentUser = user;
      currentCloudRoom = room;

      room.clients.push(client);
      clearTimeout(room.destroyTimeout);

      for (var name of room.variables.keys()) {
        client.send(
          JSON.stringify({
            method: "set",
            name,
            value: room.variables.get(name),
          })
        );
      }

      return;
    }

    if (!currentCloudRoom) {
      client.close(ConnectionError.Error);
      return;
    }

    //set method.

    if (method == "set") {
      var name = "" + json.name;
      var value = "" + json.value;
      if (name.length > MAX_CLOUD_NAME_SIZE) {
        client.close(ConnectionError.Overloaded, "Variable name is too large");
        return;
      }
      if (value.length > MAX_CLOUD_VALUE_SIZE) {
        client.close(ConnectionError.Overloaded, "Variable value is too large");
        return;
      }
      currentCloudRoom.variables.set(name, value);
      for (var cli of currentCloudRoom.clients) {
        if (cli._connectionid !== client._connectionid) {
          cli.send(
            JSON.stringify({
              method: "set",
              name,
              value,
            })
          );
        }
      }
      return;
    }

    //create method.

    if (method == "create") {
      var name = "" + json.name;
      if (name.length > MAX_CLOUD_NAME_SIZE) {
        client.close(ConnectionError.Overloaded, "Variable name is too large");
        return;
      }
      currentCloudRoom.variables.set(name, "");
      for (var cli of currentCloudRoom.clients) {
        if (cli._connectionid !== client._connectionid) {
          cli.send(
            JSON.stringify({
              method: "set",
              name,
              value: "",
            })
          );
        }
      }
      return;
    }

    //rename method.

    if (method == "rename") {
      var name = "" + json.name;
      if (name.length > MAX_CLOUD_NAME_SIZE) {
        client.close(ConnectionError.Overloaded, "Variable name is too large");
        return;
      }
      var new_name = "" + json.new_name;
      if (new_name.length > MAX_CLOUD_NAME_SIZE) {
        client.close(
          ConnectionError.Overloaded,
          "New variable name is too large"
        );
        return;
      }
      var value = "" + currentCloudRoom.variables.get(name);

      currentCloudRoom.variables.delete(name);
      for (var cli of currentCloudRoom.clients) {
        if (cli._connectionid !== client._connectionid) {
          cli.send(
            JSON.stringify({
              method: "delete",
              name,
            })
          );
        }
      }
      currentCloudRoom.variables.set(new_name, value);
      for (var cli of currentCloudRoom.clients) {
        if (cli._connectionid !== client._connectionid) {
          cli.send(
            JSON.stringify({
              method: "set",
              name: new_name,
              value,
            })
          );
        }
      }
      return;
    }

    //delete method.

    if (method == "delete") {
      var name = "" + json.name;
      if (name.length > MAX_CLOUD_NAME_SIZE) {
        client.close(ConnectionError.Overloaded);
        return;
      }
      currentCloudRoom.variables.delete(name);
      for (var cli of currentCloudRoom.clients) {
        if (cli._connectionid !== client._connectionid) {
          cli.send(
            JSON.stringify({
              method: "delete",
              name,
            })
          );
        }
      }
      return;
    }
    client.close(ConnectionError.Error);
    reutrn;
  }
  client.on("message", (data) => {
    var methodQuery = [];
    try {
      var lines = data.toString().split("\n");
      lines = lines.filter((l) => l.trim().length !== 0);
      for (var line of lines) {
        methodQuery.push(JSON.parse(line));
      }
    } catch (e) {
      if (DEBUG_LOGS) {
        console.log(labelRequest(request) + `Error parsing json: ${e}`);
      }
      client.close(ConnectionError.Error, "Error parsing JSON message.");
    }
    for (var methodJSON of methodQuery) {
      processMessage(methodJSON);
    }
  });

  client.on("close", (code, reason) => {
    if (DEBUG_LOGS) {
      console.log(
        labelRequest(request) +
          `Connection closed. Code: ${code} Reason: ${reason || "(None)"}`
      );
    }

    isOpen = false;
    clearTimeout(handshake_timeout);
    if (currentCloudRoom) {
      currentCloudRoom.clients = currentCloudRoom.clients.filter(
        (cli) => cli._connectionid !== client._connectionid
      );
      if (currentCloudRoom.clients.length == 0) {
        currentCloudRoom.startDestroyTimeout();
      }
    }
  });
});

module.exports = wss;
