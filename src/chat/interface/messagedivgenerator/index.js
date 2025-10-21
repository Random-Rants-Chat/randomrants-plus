var elements = require("../../../gp2/elements.js");
var accountHelper = require("../../../accounthelper");
var shtml = require("../../../safehtmlencode.js");
var cacheBust = require("../cachebust.js");

function generateMessageDiv(
  username,
  displayName,
  messageContent,
  isServerMessage,
  userColor,
  userFont
) {
  var pfp = accountHelper.getProfilePictureURL(username);
  var color = userColor;
  if (isServerMessage) {
    color = "var(--server-notifcation-color)";
    pfp = "images/warningsign.svg";
  }
  var noUndefinedUsername = displayName;
  if (username) {
    noUndefinedUsername = "Click here to reply to this user";
  }
  var realUserStyles = " ";
  if (username) {
    realUserStyles += "replyableUsernameSpan";
  }
  var dom = elements.createElementsFromJSON([
    {
      element: "div",
      children: [
        {
          element: "div",
          className: "messageContainer",
          children: [
            {
              element: "div",
              children: [
                {
                  element: "img",
                  className: "profile profilePictureMessage",
                  src: cacheBust(pfp),
                },
              ],
            },
            {
              element: "span",
              className: "usernameSpan" + realUserStyles,
              textContent: displayName + ":",
              title: noUndefinedUsername,
              style: {
                color: color,
                fontFamily: userFont || "Arial",
              },
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    if (!username) {
                      return;
                    }
                    var messageInputBox = elements.getGPId("messageInputBox");
                    var message = messageInputBox.value;
                    var messageTrimmed = message.trim();
                    if (messageTrimmed.startsWith("@")) {
                      var splitMessage = messageTrimmed.split(" ");
                      var targetUsername = splitMessage[0].slice(1); //Remove the @ symbol.
                      var privateMessage = splitMessage.slice(1).join(" ");

                      messageInputBox.value =
                        "@" + username + " " + privateMessage;
                    } else {
                      messageInputBox.value =
                        "@" + username + " " + messageInputBox.value;
                    }
                  },
                },
              ],
            },
            {
              element: "span", //I don't know how else to add a whitespace.
              className: "usernameSpan",
              dangerouslySetInnerHTML: "&nbsp;",
            },
            {
              element: "span",
              className: "messageSpan",
              children: [messageContent],
            },
          ],
        },
      ],
    },
  ]);

  return dom[0]; //Since there is only one element in the array (message container), just return the first of it.
}

module.exports = generateMessageDiv;
