var elements = require("../../gp2/elements.js");
var currentRoom = require("./getroom.js");
var userState = require("./userstate.js");
var roomSelect = require("./roomselect.js");

var inviteUsersToCurRoomButton = elements.getGPId("inviteUsersToCurRoomButton");

inviteUsersToCurRoomButton.addEventListener("click", () => {
  roomSelect.inviteUsersPrompt(currentRoom, userState.roomName);
});
