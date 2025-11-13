var websocket = null;
var reconnectTimeout = null;
var sws = {
  isOpen: false,
  CANCEL_RECONNECT: "CANCEL_RECONNECT",
  _lastOpen: null,
};

function openWebsocket(url, onmessage, onopen, onclose) {
  sws._lastOpen = [url, onmessage, onopen, onclose];
  if (websocket) {
    websocket.onclose = function () {};
    websocket.onmessage = function () {};
    websocket.onopen = function () {};
    websocket.close();
  }
  clearTimeout(reconnectTimeout);
  sws.isOpen = false;
  websocket = new WebSocket(url);
  websocket.onclose = async function () {
    sws.isOpen = false;
    var result = null;
    if (onclose) {
      result = await onclose();
    }
    if (result !== sws.CANCEL_RECONNECT) {
      reconnectTimeout = setTimeout(() => {
        openWebsocket(url, onmessage, onopen, onclose);
      }, 500);
    }
  };
  websocket.onopen = function (e) {
    sws.isOpen = true;
    if (onopen) {
      onopen(e);
    }
  };
  websocket.onmessage = onmessage;
}

function closeWebsocket() {
  if (websocket) {
    websocket.onclose = function () {};
    websocket.onmessage = function () {};
    websocket.onopen = function () {};
    websocket.close();
  }
  sws.isOpen = false;
  clearTimeout(reconnectTimeout);
}

function sendWebsocket(d) {
  if (sws.isOpen) {
    websocket.send(d);
  }
}

function openLastWebsocket() {
  var args = sws._lastOpen;
  if (!args) {
    return;
  }
  openWebsocket(args[0], args[1], args[2], args[3]);
}

sws.open = openWebsocket;
sws.close = closeWebsocket;
sws.send = sendWebsocket;
sws.openLast = openLastWebsocket;

module.exports = sws;
