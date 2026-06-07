var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");
var sws = require("./sharedwebsocket.js");

var noWifiScreen = elements.getGPId("offlineErrorScreen");
var offline = false;

var isLocalhost = 
  //This is *specifically* because im using an Raspberry PI 5 to work on Random Rants +.
  //My parents are evil, they disabled internet and enabling it just to test would make
  //Random Rants + spin forever trying to load resources from online.
  window.location.hostname == "localhost" ||
  window.location.hostname == "0.0.0.0";

setInterval(() => {
  if (!isLocalhost && !navigator.onLine) {
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
