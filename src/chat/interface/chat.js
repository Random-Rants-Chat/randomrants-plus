var elements = require("../../gp2/elements.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");

var mainScreen = elements.getGPId("mainScreen");
var loadingScreen = elements.getGPId("loadingChatMain");

var noCurrentRoom = elements.getGPId("noCurrentRoom");

var menuBar = elements.getGPId("menuBar");

var validState = accountHelper.getCurrentValidationState();

require("./menubar.js");

if (!currentRoom) {
  loadingScreen.hidden = true;
  mainScreen.hidden = false;
  noCurrentRoom.hidden = false;
  require("./updatecheck.js");
} else {
  require("./chatinterface.js");
}
