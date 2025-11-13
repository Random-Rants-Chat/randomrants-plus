var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sws = require("./sharedwebsocket.js");

var messageSendButton = elements.getGPId("messageSendButton");
var messageInputBox = elements.getGPId("messageInputBox");

var addEmojiDiv = elements.getGPId("addEmojiDiv");

var myChatHistory = [];
var chatHistoryNumber = 0;

function sendMessageFromTextBox() {
  var message = messageInputBox.value;
  var messageTrimmed = message.trim();
  if (messageTrimmed.length < 1) {
    return;
  }
  myChatHistory.push(message); // Add to chat history.
  myChatHistory = myChatHistory.slice(-100); // Keep only the last 100 messages to try to avoid memory overflow.
  chatHistoryNumber = myChatHistory.length; // Reset to latest message position.
  if (messageTrimmed.startsWith("@")) {
    var splitMessage = messageTrimmed.split(" ");
    var targetUsername = splitMessage[0].slice(1); //Remove the @ symbol.
    var privateMessage = splitMessage.slice(1).join(" ");

    if (!targetUsername) {
      return;
    }
    if (!privateMessage) {
      return;
    }
    if (privateMessage.trim().length < 1) {
      return;
    }

    addEmojiDiv.hidden = true;
    sws.send(
      JSON.stringify({
        type: "postMessagePrivate",
        message: privateMessage,
        targetUser: targetUsername,
      }),
    );

    return;
  }

  addEmojiDiv.hidden = true;
  sws.send(
    JSON.stringify({
      type: "postMessage",
      message,
    }),
  );
}

messageSendButton.addEventListener("click", function () {
  sendMessageFromTextBox();
  messageInputBox.value = "";
});

messageInputBox.addEventListener("input", function () {
  sws.send(
    JSON.stringify({
      type: "typing",
    }),
  );
});

messageInputBox.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    sendMessageFromTextBox();
    messageInputBox.value = "";
    e.preventDefault();
    return;
  }

  if (e.key === "ArrowUp") {
    if (chatHistoryNumber > 0) {
      chatHistoryNumber--;
      messageInputBox.value = myChatHistory[chatHistoryNumber];
    }
    e.preventDefault();
    return;
  }

  if (e.key === "ArrowDown") {
    if (chatHistoryNumber < myChatHistory.length) {
      chatHistoryNumber++;
      messageInputBox.value = myChatHistory[chatHistoryNumber] || "";
    }
    e.preventDefault();
    return;
  }
});
