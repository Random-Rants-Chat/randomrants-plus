var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var roomSettings = {};

function doRoomSettingsScreen() {
  var div = document.createElement("div");

  var dom = elements.createElementsFromJSON([
    //Background
    {
      element: "div",
      className: "dialogBackground",
    },
    //Dialog box
    {
      element: "div",
      className: "whiteBox centerMiddle popupDialogAnimation",
      children: [
        {
          element: "span",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "Room settings",
        },
        {
          element: "hr",
        },
      ],
    },
  ]);
  elements.appendElements(div, dom);
  document.body.append(div);

  return div;
}