var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");
var shtml = require("../../safehtmlencode.js");
var cacheBust = require("./cachebust.js");

function generateDiv(username, removeFunction) {
  var pfp = accountHelper.getProfilePictureURL(username);
  var ownerNoteThing = {
    element: "div",
  };

  var icons = [];
  if (removeFunction) {
    icons.push({
      element: "div",
      style: {
        height: "23px",
      },
      className: "divButton roundborder",
      title: "Click to unban this user.",
      children: [
        {
          element: "span",
          textContent: "Remove",
        },
      ],
      eventListeners: [
        {
          event: "click",
          func: function () {
            removeFunction();
            this.disabled = true;
            this.innerHTML = "";
            this.className = "loader";
            this.src = "";
            this.style.width = "23px";
          },
        },
      ],
    });
  }

  var dom = elements.createElementsFromJSON([
    {
      element: "div",
      children: [
        {
          element: "div",
          className: "onlineUserContainer",
          style: {
            alignItems: "center",
          },
          children: [
            {
              element: "img",
              className: "profile profilePictureMessage",
              src: cacheBust(pfp),
            },
            {
              element: "div",
              style: {
                display: "flex",
                flexDirection: "column",
              },
              children: [
                {
                  element: "span",
                  className: "usernameSpan",
                  style: {
                    color: "red",
                  },
                  textContent: username,
                },
              ],
            },
            {
              element: "div",
              style: {
                display: "flex",
              },
              children: [
                {
                  element: "div",
                  style: {
                    marginLeft: "auto",
                    display: "flex",
                  },
                  children: icons,
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  return dom[0];
}

module.exports = generateDiv;
