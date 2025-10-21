var elements = require("../../../gp2/elements.js");
var accountHelper = require("../../../accounthelper");
var shtml = require("../../../safehtmlencode.js");
var cacheBust = require("../cachebust.js");

function generateDiv(
  username,
  displayName,
  time,
  userColor,
  userFont,
  isOwner,
  camEnabled,
  micEnabled,
  isRealOwner,
  isAbleToChangeOwnership,
  changeOwnershipFunction,
  forceOwnershipChangable,
  blockUserFunction
) {
  var pfp = accountHelper.getProfilePictureURL(username);
  if (!username) {
    pfp = accountHelper.getProfilePictureURL(displayName);
  }
  var ownerNoteThing = {
    element: "div",
  };

  var icons = [];

  if (camEnabled) {
    icons.push({
      element: "img",
      src: "images/cam.svg",
      style: {
        height: "23px",
      },
      title: "This person is sharing their camera.",
    });
  }

  if (micEnabled) {
    icons.push({
      element: "img",
      src: "images/mic.svg",
      style: {
        height: "23px",
        padding: "4px 2px",
      },
      title: "This person is sharing their microphone.",
    });
  }

  if (isRealOwner) {
    icons.push({
      element: "img",
      src: "images/crown.svg",
      className: "ownerKeyIcon",
      style: {
        height: "23px",
        padding: "4px 2px",
      },
      title: "This person is the real owner of this room.",
    });
  } else {
    if (
      (isAbleToChangeOwnership || forceOwnershipChangable) &&
      blockUserFunction &&
      username
    ) {
      icons.push({
        element: "div",
        style: {
          height: "23px",
        },
        className: "divButton roundborder",
        title: "Click to block/ban this user.",
        children: [
          {
            element: "img",
            style: {
              height: "100%",
            },
            src: "images/redcancel.svg",
          },
          {
            element: "span",
            textContent: "Block/Ban",
          },
        ],
        eventListeners: [
          {
            event: "click",
            func: function () {
              blockUserFunction();
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
    if (isAbleToChangeOwnership && (username || forceOwnershipChangable)) {
      if (isOwner) {
        icons.push({
          element: "div",
          style: {
            height: "23px",
          },
          className: "divButton roundborder",
          title: "Click to remove ownership to this user.",
          children: [
            {
              element: "img",
              style: {
                height: "100%",
              },
              src: "images/removecrown.svg",
            },
            {
              element: "span",
              textContent: "Demote",
            },
          ],
          eventListeners: [
            {
              event: "click",
              func: function () {
                changeOwnershipFunction(false);
                this.disabled = true;
                this.innerHTML = "";
                this.className = "loader";
                this.src = "";
                this.style.width = "23px";
              },
            },
          ],
        });
      } else {
        icons.push({
          element: "div",
          style: {
            height: "23px",
          },
          className: "divButton roundborder",
          title: "Click to add ownership to this user.",
          children: [
            {
              element: "img",
              style: {
                height: "100%",
              },
              src: "images/addcrown.svg",
            },
            {
              element: "span",
              textContent: "Promote",
            },
          ],
          eventListeners: [
            {
              event: "click",
              func: function () {
                changeOwnershipFunction(true);
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
    } else {
      if (isOwner) {
        icons.push({
          element: "img",
          src: "images/crown.svg",
          style: {
            height: "23px",
            padding: "4px 2px",
          },
          title: "This person has ownership of this room.",
        });
      }
    }
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
                    color: userColor,
                    fontFamily: userFont || "Arial",
                  },
                  textContent: displayName,
                },
                {
                  element: "span",
                  style: {
                    color: userColor,
                    fontSize: "10px",
                    fontFamily: userFont || "Arial",
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
                    width: "6px",
                  },
                },
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
