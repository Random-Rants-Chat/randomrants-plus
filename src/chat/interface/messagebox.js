var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sws = require("./sharedwebsocket.js");

var messageSendButton = elements.getGPId("messageSendButton");
var messageInputBox = elements.getGPId("messageInputBox");

var myChatHistory = [];
var chatHistoryNumber = 0;

function sendMessageFromTextBox() {
  var message = messageInputBox.value;
  if (message.trim().length < 1) {
    return;
  }
  sws.send(
    JSON.stringify({
      type: "postMessage",
      message,
    })
  );
  myChatHistory.push(message); // Add to chat history.
  myChatHistory = myChatHistory.slice(-100); // Keep only the last 100 messages to try to avoid memory overflow.
  chatHistoryNumber = myChatHistory.length; // Reset to latest message position.
}

messageSendButton.addEventListener("click", function () {
  sendMessageFromTextBox();
  messageInputBox.value = "";
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

  sws.send(
    JSON.stringify({
      type: "typing",
    })
  );
});
