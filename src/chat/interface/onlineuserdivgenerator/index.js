var elements = require("../../../gp2/elements.js");
var accountHelper = require("../../../accounthelper");
var shtml = require("../safehtmlencode.js");

function generateDiv (username,displayName,time,userColor,isOwner,camEnabled,micEnabled) {
  var pfp = accountHelper.getProfilePictureURL(username);
  if (!username) {
    pfp = accountHelper.getProfilePictureURL("");
  }
  var ownerNoteThing = {
    element:"div"
  };
  
  var camAndMicIcons = [];
  
  if (camEnabled) {
    camAndMicIcons.push({
      element: "img",
      src:"images/cam.svg",
      style: {
        height: "23px"
      }
    });
  }
  
  if (micEnabled) {
    camAndMicIcons.push({
      element: "img",
      src:"images/mic.svg",
      style: {
        height: "23px"
      }
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
            alignItems: "center"
          },
          children: ([
            {
              element: "img",
              className: "profile profilePictureMessage",
              src: pfp
            },
            {
              element: "span",
              className: "usernameSpan",
              style: {
                color: userColor
              },
              textContent: displayName
            }
          ]).concat(camAndMicIcons)
        }
      ]
    }
  ]);
  
  return dom[0];
}

module.exports = generateDiv;