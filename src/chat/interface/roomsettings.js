var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var accountHelper = require("../../accounthelper");
var userState = require("./userstate.js");
const dialog = require("../../dialogs.js");

var globalTheme = require("./globaltheme.js");

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
  try {
    var response = await fetch(accountHelper.getServerURL() + "/rooms/perms", {
      method: "POST",
      body: JSON.stringify({
        id: userState.roomID,
        type: name,
        level: level,
      }),
    });
  } catch (e) {
    console.error(e);
  }
}

async function updateThemeSetting(index) {
  try {
    var response = await fetch(accountHelper.getServerURL() + "/rooms/theme", {
      method: "POST",
      body: JSON.stringify({
        id: userState.roomID,
        index: index,
      }),
    });
  } catch (e) {
    console.error(e);
  }
}

async function updateAllowGuests(allow) {
  try {
    var response = await fetch(
      accountHelper.getServerURL() +
        "/rooms/changeallowguests/" +
        userState.roomID,
      {
        method: "POST",
        body: JSON.stringify({
          allowGuests: allow,
        }),
      },
    );
  } catch (e) {
    console.error(e);
  }
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
    gid: "roomSettingsDialogBox",
    style: {
      overflowY: "auto",
      maxHeight: "calc(100vh - 100px)",
      maxWidth: "calc(100vw - 300px)",
      minWidth: "360px",
      minHeight: "360px",
    },
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

      {
        element: "div",
        className: "tipsTextBox",
        children: [
          {
            element: "p",
            textContent:
              "Tips: Rename your room to something quick and easy to remember. ",
          },
          {
            element: "p",
            textContent:
              "Destorying the room will remove it, so use it wisely! ",
          },
          {
            element: "p",
            textContent:
              "Guests are people that aren't signed in, you can turn allow guest users off if you don't want them in this room.",
          },
          {
            element: "p",
            textContent:
              "Owner and ownership get the same permissions, also ownership behaves like admins or co-owners. ",
          },
          {
            element: "p",
            textContent:
              "If someones got ownership. They can do the same thing as a room owner, but they can't take permissions from the room owner. ",
          },
          {
            element: "p",
            textContent:
              "The block list lets you ban, or block people from your room (even if they are on the allow or ownership list). Use this if you end up with someone you don't want in your room. ",
          },
          {
            element: "p",
            textContent:
              "The allow list (if not empty) lets you allow only certian users. You can also turn off guest users if you don't want them in. ",
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
        dangerouslySetInnerHTML: "&nbsp;",
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
              this.disabled = true;
              var response = await fetch(
                accountHelper.getServerURL() + "/rooms/rename",
                {
                  method: "POST",
                  body: JSON.stringify({
                    name: this.value,
                    id: userState.roomID,
                  }),
                },
              );
              this.disabled = false;
            },
          },
        ],
      },

      {
        element: "br",
      },

      {
        element: "span",
        textContent: "Theme:",
      },

      {
        element: "span",
        dangerouslySetInnerHTML: "&nbsp;",
      },

      {
        element: "select",
        className: "inputText1 roundborder",
        gid: "roomSettings_theme",
        style: {
          width: "200px",
          height: "30px",
        },
        children: globalTheme.getThemeNames().map((name, i) => {
          return {
            element: "option",
            textContent: name,
            value: i.toString(),
          };
        }),
        eventListeners: [
          {
            event: "change",
            func: async function () {
              this.disabled = true;
              await updateThemeSetting(+this.value);
              this.disabled = false;
            },
          },
        ],
      },
      {
        element: "br",
      },

      {
        element: "span",
        textContent: "Description:",
      },
      {
        element: "span",
        dangerouslySetInnerHTML: "&nbsp;",
      },
      {
        element: "br",
      },
      {
        element: "textarea",
        type: "text",
        className: "inputText1 roundborder",
        gid: "roomSettingsDescription",
        style: {
          width: "calc(100% - 8px)",
          height: "150px",
        },
        eventListeners: [
          {
            event: "change",
            func: async function () {
              this.disabled = true;
              var response = await fetch(
                accountHelper.getServerURL() + "/rooms/description",
                {
                  method: "POST",
                  body: JSON.stringify({
                    description: this.value,
                    id: userState.roomID,
                  }),
                },
              );
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

      //App area reactions permission

      {
        element: "span",
        textContent: "Media area reactions:",
      },

      {
        element: "select",
        className: "inputText1 roundborder",
        gid: "roomPerms_reactions",
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
              await updatePermissionSetting("reactions", this.value);
              this.disabled = false;
            },
          },
        ],
      },
      {
        element: "br",
      },

      //Command permission

      {
        element: "span",
        textContent: "Commands:",
      },

      {
        element: "select",
        className: "inputText1 roundborder",
        gid: "roomPerms_commands",
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
              await updatePermissionSetting("commands", this.value);
              this.disabled = false;
            },
          },
        ],
      },
      {
        element: "br",
      },

      {
        element: "br",
      },

      {
        element: "div",
        gid: "roomSettingsPermissionSettings",
        children: [
          {
            element: "div",
            className: "sep1",
          },
          {
            element: "span",
            style: {
              fontWeight: "bold",
              fontSize: "20px",
            },
            textContent: "Users with admin/ownership:",
          },
          {
            element: "br",
          },
          {
            element: "div",
            style: {
              height: "23px",
            },
            className: "divButton roundborder",
            title: "Click to add ownership via a username.",
            gid: "addOwnershipUsernameButton",
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
                textContent: "Promote from username",
              },
            ],
          },
          {
            element: "br",
          },
          {
            element: "div",
            gid: "ownershipUsersContainer",
            className: "usersContainerRoomSettings",
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
            style: {
              fontWeight: "bold",
              fontSize: "20px",
            },
            textContent: "Blocked users:",
          },
          {
            element: "br",
          },
          {
            element: "div",
            style: {
              height: "23px",
            },
            className: "divButton roundborder",
            title: "Click to block a user from this room.",
            gid: "addBanUserButton",
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
                textContent: "Block from username",
              },
            ],
          },
          {
            element: "br",
          },
          {
            element: "div",
            gid: "blockedUsersContainer",
            className: "usersContainerRoomSettings",
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
            style: {
              fontWeight: "bold",
              fontSize: "20px",
            },
            textContent: "Allow list:",
          },
          {
            element: "br",
          },
          {
            element: "span",
            textContent: "Allow guest users:",
          },
          {
            element: "input",
            type: "checkbox",
            checked: true,
            gid: "roomSettingAllowGuests",
            eventListeners: [
              {
                event: "change",
                func: async function () {
                  this.disabled = true;
                  await updateAllowGuests(this.checked);
                  this.disabled = false;
                },
              },
            ],
          },
          {
            element: "br",
          },
          {
            element: "span",
            style: {
              color: "#cc0606",
              fontWeight: "bold",
            },
            gid: "guestUsersWarning",
            children: [
              "Guest users have the ability to bypass the allow list no matter what, turn guest users off if you don't want them in here.",
              {
                element: "br",
              },
            ],
          },
          {
            element: "div",
            style: {
              height: "23px",
            },
            className: "divButton roundborder",
            title: "Click to add a user to the allow list.",
            gid: "addAllowUserButton",
            children: [
              {
                element: "img",
                style: {
                  height: "100%",
                },
                src: "images/check.svg",
              },
              {
                element: "span",
                textContent: "Allow from username",
              },
            ],
          },
          {
            element: "br",
          },
          {
            element: "div",
            gid: "allowedUsersContainer",
            className: "usersContainerRoomSettings",
          },
          {
            element: "br",
          },
        ],
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
        textContent: "Destroy Room",
        eventListeners: [
          {
            event: "click",
            func: async function () {
              const dialogResponse = await dialogs.confirm(
                'This WILL make the room vanish. Click "Ok" to destroy.',
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
                    },
                  );

                  if (!response.ok) {
                    dialogs.alert(
                      `Room destorying failed, the server said: ${response.status}.\n` +
                        "Maybe someone demoted you without you knowing, or your session got expired.",
                    );
                    return;
                  }
                  dialogDiv.hidden = true;
                } catch (e) {
                  console.error("Room destroy error:", e);
                  dialogs.alert(
                    "The room failed to destroy with this weird error:\n" + e,
                  );
                }
              }
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
        element: "br",
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
]);
dialogDiv.hidden = true;
elements.appendElements(dialogDiv, dom);
document.body.append(dialogDiv);

var roomSettingsDialogBox = elements.getGPId("roomSettingsDialogBox");

var showRoomSettingsButton = elements.getGPId("showRoomSettingsButton");

showRoomSettingsButton.addEventListener("click", function () {
  roomSettingsDialogBox.scrollTo(0, 0);
  dialogDiv.hidden = false;
});

var showRoomSettingsButton2 = elements.getGPId("showRoomSettingsButton2");
var roomSettingsPermissionSettings = elements.getGPId(
  "roomSettingsPermissionSettings",
);
showRoomSettingsButton2.addEventListener("click", function () {
  dialogDiv.hidden = false;
  roomSettingsDialogBox.scrollTo(0, roomSettingsPermissionSettings.offsetTop);
});

var roomSettingsNameInput = elements.getGPId("roomSettingsName");

rs.changeRoomName = function (name) {
  roomSettingsNameInput.value = name;
};

var roomSettingsDescription = elements.getGPId("roomSettingsDescription");

rs.changeRoomDescription = function (description) {
  roomSettingsDescription.value = description;
};

rs.updatePermission = function (name, value) {
  elements.getGPId("roomPerms_" + name).value = value;
};

var roomSettingAllowGuests = elements.getGPId("roomSettingAllowGuests");
var guestUsersWarning = elements.getGPId("guestUsersWarning");

rs.updateAllowGuests = function (value) {
  roomSettingAllowGuests.checked = value;
  guestUsersWarning.hidden = !value;
};

var roomSettingTheme = elements.getGPId("roomSettings_theme");

rs.updateTheme = function (index) {
  globalTheme.setTheme(index);
  roomSettingTheme.value = index.toString();
};

module.exports = rs;
