var ws = require("ws");
var wss = new ws.WebSocketServer({ noServer: true });

wss.on("connection", (ws, request) => {});

module.exports = {
  wss: wss,
};
