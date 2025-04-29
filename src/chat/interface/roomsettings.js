var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var accountHelper = require("../../accounthelper");
var userState = require("./userstate.js");

var rs = {};

var dialogDiv = document.createElement("div");
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
        element: "div",
        className: "sep1",
      },
      {
        element: "div",
        style: {
          display: "flex",
        },
        children: [
          {
            element: "img",
            src: "images/settings.svg",
            style: {
              height: "100%",
              padding: "10px 10px",
            },
          },
          {
            element: "div",
            style: {
              padding: "10px 10px",
            },
            children: [
              {
                element: "span",
                textContent: "Name:",
              },
              {
                element: "span",
                innerHTML: "&nbsp;",
              },
              {
                element: "input",
                type: "text",
                className: "inputText1 roundborder",
                gid: "roomSettingsName",
                style: {
                  width: "200px",
                  height: "25px"
                },
                eventListeners: [
                  {
                    event: "change",
                    func: async function () {
                      var response = await fetch(
                        accountHelper.getServerURL() + "/rooms/rename",
                        {
                          method: "POST",
                          body: JSON.stringify({
                            name: this.value,
                            id: userState.roomID,
                          }),
                        }
                      );
                    },
                  },
                ],
              },

              {
                element: "div",
                className: "divButton",
                textContent: "Close",
                eventListeners: [
                  {
                    event: "click",
                    func: function () {
                      dialogDiv.hidden = true;
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);
dialogDiv.hidden = true;
elements.appendElements(dialogDiv, dom);
document.body.append(dialogDiv);

var showRoomSettingsButton = elements.getGPId("showRoomSettingsButton");

showRoomSettingsButton.addEventListener("click", function () {
  dialogDiv.hidden = false;
});

var roomSettingsNameInput = elements.getGPId("roomSettingsName");

rs.changeRoomName = function (name) {
  roomSettingsNameInput.value = name;
};

module.exports = rs;
