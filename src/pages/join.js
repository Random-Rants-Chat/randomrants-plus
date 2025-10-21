document.title = "Random Rants + | Quick Join";

require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js"); //Menu bar.
var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.
var accountHelper = require("../accounthelper/index.js"); //Utilites for accounts.
var dialog = require("../dialogs.js"); //Dialog boxes.
require("./navigate-loader.js");

var elementJSON = [
  {
    element: "div",
    gid: "emojiContainer",
    style: {
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: "0px",
      left: "0px",
      overflow: "hidden",
    },
  },
  {
    element: "div",
    className: "centeredDialogSolid",
    GPWhenCreated: function (elm) {
      elm.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(0)",
          },
          {
            transform: "translate(-50%, -50%) scale(0)",
          },
          {
            transform: "translate(-50%, -50%) scale(1)",
          },
        ],
        {
          duration: 700,
          iterations: 1,
          easing: "ease-out",
        }
      );
    },
    children: [
      require("./sitenews-notice.js"),
      {
        element: "span",
        className: "headerText",
        textContent: "Quick Join",
      },
      {
        element: "br",
      },
      {
        element: "div",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        children: [
          {
            element: "span",
            textContent: "Room code:",
          },
          {
            element: "div",
            style: {
              width: "4px",
            },
          },
          {
            element: "input",
            className: "inputText1",
            gid: "joinCodeInput",
          },
          {
            element: "div",
            style: {
              width: "4px",
            },
          },
          {
            element: "div",
            className: "button2",
            textContent: "Join this code",
            gid: "joinCodeButton",
          },
        ],
      },
      {
        element: "br",
      },
      {
        element: "span",
        textContent: "Type the wacky code from your friends screen.",
      },
      {
        element: "br",
      },
      {
        element: "span",
        textContent:
          "The code would self destruct after 15 minutes of inactivity. Think fast!",
      },
    ],
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);

var joinCodeInput = elements.getGPId("joinCodeInput");
var joinCodeButton = elements.getGPId("joinCodeButton");

async function joinToRoom() {
  var joinCodeString = joinCodeInput.value.toUpperCase();

  var response = await fetch(
    accountHelper.getServerURL() + "/quickjoin/code/" + joinCodeString
  );
  if (!response.ok) {
    dialog.alert(
      "💥 Error " +
        response.status +
        "! That code might’ve exploded or expired."
    );
    return;
  }
  var text = await response.text();
  window.location.href = "/chat#" + text;
}

joinCodeInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    joinToRoom();
  }
});

joinCodeInput.addEventListener("input", (event) => {
  joinCodeInput.value = joinCodeInput.value.toUpperCase();
});

joinCodeButton.addEventListener("click", () => {
  joinToRoom();
});

require("./floatingemojis.js");
