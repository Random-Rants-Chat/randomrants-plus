require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js"); //Menu bar.
var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.
var accountHelper = require("../accounthelper/index.js"); //Utilites for accounts.
var dialog = require("../dialogs.js"); //Dialog boxes.

var elementJSON = [
  {
    element: "div",
    className: "centeredDialog",
    children: [
      {
        element: "span",
        className: "headerText",
        textContent: "🚪 Quick Join Portal"
      },
      {
        element: "br"
      },
      {
        element: "div",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        },
        children: [
          {
            element: "span",
            textContent: "Room code:"
          },
          {
            element: "div",
            style: {
              width: "4px"
            }
          },
          {
            element: "input",
            className: "inputText1",
            gid: "joinCodeInput"
          },
          {
            element: "div",
            style: {
              width: "4px"
            }
          },
          {
            element: "div",
            className: "button2",
            textContent: "Beam me in",
            gid: "joinCodeButton"
          },
        ]
      },
      {
        element: "br",
      },
      {
        element: "span",
        textContent: "Type the wacky code from your friend's screen to teleport into their chaos chamber (aka chat room). No time to explain—GO!"
      }
    ]
  }
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body,pageElements);

var joinCodeInput = elements.getGPId("joinCodeInput");
var joinCodeButton = elements.getGPId("joinCodeButton");

async function joinToRoom () {
  var response = await fetch(accountHelper.getServerURL()+"/quickjoin/code/"+joinCodeInput.value);
  if (!response.ok) {
    dialog.alert("💥 Error " + response.status + "! That code might’ve exploded or expired.");
    return;
  }
  var text = await response.text();
  window.location.href = "/chat#"+text;
}

joinCodeInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    joinToRoom();
  }
});

joinCodeButton.addEventListener("click", () => {
  joinToRoom();  
});