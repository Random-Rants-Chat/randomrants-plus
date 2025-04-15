var websocket = null;
var sws = {};

function openWebsocket (url,onmessage,onopen,onclose) {
  if (websocket) {
    websocket.onclose = function () {};
    websocket.onmessage = function () {};
    websocket.onopen = function () {};
    websocket.close();
  }
  websocket = new WebSocket(url);
  websocket.onclose = function () {
    if (onclose) {
      onclose();
    }
    openWebsocket(url,onmessage,onopen,onclose);
  };
  websocket.onopen = onopen;
  websocket.onmessage = onmessage;
}

function closeWebsocket () {
  if (websocket) {
    websocket.onclose = function () {};
    websocket.onmessage = function () {};
    websocket.onopen = function () {};
    websocket.close();
  }
}

function sendWebsocket (d) {
  if (websocket) {
    websocket.send(d);
  }
}

sws.open = openWebsocket;
sws.close = closeWebsocket;
sws.send = sendWebsocket;

module.exports = sws;