var elements = require("../../../gp2/elements.js");
var accountHelper = require("../../../accounthelper");
var shtml = require("../../../safehtmlencode.js");
var cacheBust = require("../cachebust.js");

function generateMessageDiv(
  username,
  displayName,
  messageHTML,
  isServerMessage,
  userColor
) {
  var pfp = accountHelper.getProfilePictureURL(username);
  var color = userColor;
  if (isServerMessage) {
    color = "var(--server-notifcation-color)";
    pfp = "images/warningsign.svg";
  }
  var noUndefinedUsername = displayName;
  if (username) {
    noUndefinedUsername = username;
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
              className: "usernameSpan",
              textContent: displayName + ":",
              title: noUndefinedUsername,
              style: {
                color: color,
              },
            },
            {
              element: "span", //I don't know how else to add a whitespace.
              className: "usernameSpan",
              innerHTML: "&nbsp;",
            },
            {
              element: "span",
              className: "messageSpan",
              innerHTML: messageHTML,
            },
          ],
        },
      ],
    },
  ]);

  return dom[0]; //Since there is only one element in the array (message container), just return the first of it.
}

module.exports = generateMessageDiv;
