var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var accountHelper = require("../../accounthelper");
var userState = require("./userstate.js");

var rs = {};

var roomPermissionOptions = [
  {
    element: "option",
    textContent: "Everyone",
    value: "everyone",
  },
  {
    element: "option",
    textContent: "Owner & ownership",
    value: "owner",
  },
  {
    element: "option",
    textContent: "Nobody (Off completley)",
    value: "none",
  },
];

async function updatePermissionSetting(name, level) {
  var response = await fetch(accountHelper.getServerURL() + "/rooms/perms", {
    method: "POST",
    body: JSON.stringify({
      id: userState.roomID,
      type: name,
      level: level,
    }),
  });
}

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
        style: {
          margin: "8px 0",
          padding: "8px",
          backgroundColor: "#fffae6",
          border: "1px solid #f0e68c",
          borderRadius: "6px",
          fontSize: "14px",
          color: "#665500",
        },
        textContent:
          "💡 Tips: Rename your room to something cool and easy to remember. " +
          "Destroying the room nukes everything inside, so use it wisely!",
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
                element: "div",
                className: "sep1",
              },
              {
                element: "span",
                textContent: "Room info",
                style: {
                  fontWeight: "bold",
                  fontSize: "20px",
                },
              },
              {
                element: "br",
              },
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
                  height: "25px",
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
                element: "br",
              },

              {
                element: "div",
                className: "sep1",
              },

              {
                element: "span",
                textContent: "Room permissions",
                style: {
                  fontWeight: "bold",
                  fontSize: "20px",
                },
              },

              {
                element: "br",
              },

              //Soundboard permission

              {
                element: "span",
                textContent: "Soundboard:",
              },

              {
                element: "select",
                className: "inputText1 roundborder",
                gid: "roomPerms_soundboard",
                style: {
                  width: "200px",
                  height: "30px",
                },
                children: roomPermissionOptions,
                eventListeners: [
                  {
                    event: "change",
                    func: async function () {
                      this.disabled = true;
                      await updatePermissionSetting("soundboard", this.value);
                      this.disabled = false;
                    },
                  },
                ],
              },
              {
                element: "br",
              },

              //Media permission

              {
                element: "span",
                textContent: "Starting media:",
              },

              {
                element: "select",
                className: "inputText1 roundborder",
                gid: "roomPerms_media",
                style: {
                  width: "200px",
                  height: "30px",
                },
                children: roomPermissionOptions,
                eventListeners: [
                  {
                    event: "change",
                    func: async function () {
                      this.disabled = true;
                      await updatePermissionSetting("media", this.value);
                      this.disabled = false;
                    },
                  },
                ],
              },
              {
                element: "br",
              },

              {
                element: "div",
                className: "sep1",
              },

              {
                element: "span",
                textContent: "Dangerous",
                style: {
                  fontWeight: "bold",
                  fontSize: "20px",
                },
              },

              {
                element: "br",
              },

              {
                element: "div",
                style: {
                  color: "#cc0606", //Dark red-ish color.
                },
                children: [
                  {
                    element: "span",
                    textContent: "Don't mess with these unless you ",
                  },
                  {
                    element: "span",
                    style: {
                      fontWeight: "bold",
                    },
                    textContent: "really", //REALLY tell the user this is actually dangerous! (for the room, and may cause emotional damage)
                  },
                  {
                    element: "span",
                    textContent: " know what you're doing!",
                  },
                ],
              },

              {
                element: "br",
              },

              {
                element: "div",
                className: "divButton roundborder",
                textContent: "💥 Destroy Room",
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      const dialogResponse = await dialogs.confirm(
                        "⚠️ You're about to nuke the room. This *will* make everyone vanish. Are you really sure?\n\nClick OK to unleash chaos, or Cancel if your conscience kicks in."
                      );

                      if (dialogResponse) {
                        try {
                          const response = await fetch(
                            accountHelper.getServerURL() + "/rooms/destroy",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                id: userState.roomID,
                              }),
                            }
                          );

                          if (!response.ok) {
                            dialogs.alert(
                              `🚫 Room self-destruct failed! Server said: ${response.status}.\n` +
                                "Maybe someone demoted you behind your back, or your session poofed."
                            );
                          }
                        } catch (e) {
                          console.error("Room destroy error:", e);
                          dialogs.alert(
                            "💥 The room failed to explode due to an unknown error:\n" +
                              e
                          );
                        }
                      }
                    },
                  },
                ],
              },

              {
                element: "div",
                className: "sep1",
              },

              {
                element: "div",
                className: "divButton roundborder",
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

rs.updatePermission = function (name, value) {
  elements.getGPId("roomPerms_" + name).value = value;
};

module.exports = rs;
