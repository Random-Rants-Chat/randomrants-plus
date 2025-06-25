var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");
var sws = require("./sharedwebsocket.js");

var noWifiScreen = elements.getGPId("offlineErrorScreen");

setInterval(() => {
  noWifiScreen.hidden = navigator.onLine;
},100);