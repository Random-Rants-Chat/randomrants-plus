var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sws = require("./sharedwebsocket.js");

var typingNoticeDiv = elements.getGPId("typingNoticeDiv");

var typingMessages = {};

var typingnote = {
  activateTypingMessage: function (username, displayName, color) {
    if (typingMessages[username]) {
      var typingMessage = typingMessages[username];
      typingMessage.resetTimeout();
      return;
    }
    var typingMessageText = elements.createElementsFromJSON([
      {
        element: "div",
        className: "userTypingText",
        style: {
          color,
        },
        children: [
          {
            element: "span",
            textContent: displayName + " is typing...",
          },
          {
            element: "div",
          },
        ],
      },
    ])[0];

    var typingMessage = {
      remove: function () {
        if (typeof typingMessage.timeout !== "undefined") {
          clearTimeout(typingMessage.timeout);
        }
        typingMessageText.remove();
        typingMessages[username] = undefined;
      },
      resetTimeout: function () {
        if (typeof typingMessage.timeout !== "undefined") {
          clearTimeout(typingMessage.timeout);
        }
        typingMessage.timeout = setTimeout(() => {
          typingMessage.timeout = null;
          typingMessage.remove();
        }, 1500);
        typingMessageText.animate(
          [
            { transform: "translate(0px, -3.5px)" },
            { transform: "translate(0px, 0px)" },
          ],
          {
            duration: 70,
            easing: "ease-out",
          }
        );
      },
    };
    typingNoticeDiv.append(typingMessageText);

    typingMessage.resetTimeout();

    typingMessages[username] = typingMessage;
  },
};

module.exports = typingnote;
