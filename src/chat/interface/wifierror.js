var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");
var sws = require("./sharedwebsocket.js");

var noWifiScreen = elements.getGPId("offlineErrorScreen");
var offline = false;

setInterval(() => {
  if (!navigator.onLine) {
    if (!offline) {
      offline = true;
      noWifiScreen.hidden = false;
      sws.close();
    }
  } else {
    if (offline) {
      offline = false;
      noWifiScreen.hidden = true;
      sws.openLast();
    }
  }
}, 100);
