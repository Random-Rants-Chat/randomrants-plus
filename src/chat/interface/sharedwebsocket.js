var websocket = null;
var sws = {
  isOpen: false,
};

function openWebsocket (url,onmessage,onopen,onclose) {
  if (websocket) {
    websocket.onclose = function () {};
    websocket.onmessage = function () {};
    websocket.onopen = function () {};
    websocket.close();
  }
  sws.isOpen = false;
  websocket = new WebSocket(url);
  websocket.onclose = function () {
    if (onclose) {
      onclose();
    }
    sws.isOpen = false;
    openWebsocket(url,onmessage,onopen,onclose);
  };
  websocket.onopen = function (e) {
    sws.isOpen = true;
    if (onopen) {
      onopen(e);
    }
  };
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
  if (sws.isOpen) {
    websocket.send(d);
  }
}

sws.open = openWebsocket;
sws.close = closeWebsocket;
sws.send = sendWebsocket;

module.exports = sws;