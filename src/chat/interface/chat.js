var elements = require("../../gp2/elements.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");

var mainScreen = elements.getGPId("mainScreen");
var loadingScreen = elements.getGPId("loadingChatMain");

var noCurrentRoom = elements.getGPId("noCurrentRoom");

var menuBar = elements.getGPId("menuBar");

var validState = accountHelper.getCurrentValidationState();

var manageRoomsDivButton = elements.getGPId("manageRoomsDivButton");
var roomSelect = require("./roomselect.js");
require("./menubar.js");

if (!currentRoom) {
  loadingScreen.hidden = true;
  mainScreen.hidden = false;
  noCurrentRoom.hidden = false;
  manageRoomsDivButton.onclick = function () {
    roomSelect.show();
  };
  require("./accountnotice.js");
  require("./updatecheck.js");
} else {
  require("./chatinterface.js");
}
