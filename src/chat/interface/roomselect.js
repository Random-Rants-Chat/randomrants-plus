var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");
var dialog = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var rs = {};

var validState = accountHelper.getCurrentValidationState();

async function getRooms() {
  var rooms = [];
  if (validState) {
    var realRooms = await accountHelper.getJoinedRooms();
    for (var room of realRooms) {
      rooms.push(room);
    }
  }
  return rooms;
}

function doJoinCodeScreen(code) {
  var div = document.createElement("div");
  var joinHref =
    window.location.protocol + "//" + window.location.host + "/join";

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
            fontSize: "50px",
            fontWeight: "bold",
          },
          className: "typingEffect",
          textContent: code,
        },
        {
          element: "br",
        },
        {
          element: "span",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "Join this room!",
        },
        {
          element: "br",
        },
        {
          element: "a",
          href: joinHref,
          textContent: joinHref,
          style: {
            fontSize: "20px",
            fontWeight: "bold",
          },
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            'Someone dropped a fresh join code. Go to the link above or click "Quick join" on your menu bar and type this wacky code.',
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "This code will self destruct after a period of inactivity, use it or lose it.",
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
                div.remove();
              },
            },
          ],
        },
      ],
    },
  ]);
  elements.appendElements(div, dom);
  document.body.append(div);

  return {
    remove: function () {
      div.remove();
    },
  };
}

async function doRoomSelect() {
  try {
    var div = document.createElement("div");

    var addButtonJSON = { element: "div" };

    var roomSelectChildren = [];

    if (validState) {
      roomSelectChildren.push(addButtonJSON);
    } else {
      roomSelectChildren.push({
        element: "div",
        className: "roomButton",
        style: {
          fontSize: "23px",
        },
        children: [
          {
            element: "span",
            textContent:
              "You're not signed in, so you can't save or make rooms.",
          },
          {
            element: "br",
          },
          {
            element: "span",
            textContent:
              "Just signed in? Refresh this page to unlock everything here.",
          },
        ],
      });
    }

    var dialogBG = document.createElement("div");
    var loadingSpinnerDiv = document.createElement("div");
    var loadingSpinnerContainerDiv = document.createElement("div");
    var loadingSpinnerCDiv = document.createElement("div");
    loadingSpinnerContainerDiv.className = "loader2Container";
    dialogBG.className = "dialogBackground";
    loadingSpinnerDiv.className = "loader2";
    loadingSpinnerContainerDiv.append(loadingSpinnerDiv);
    loadingSpinnerCDiv.append(loadingSpinnerContainerDiv);
    loadingSpinnerCDiv.className = "centerMiddle";
    dialogBG.append(loadingSpinnerCDiv);
    document.body.append(dialogBG);
    try {
      var rooms = await getRooms();
      dialogBG.remove();
      if (!rooms) {
        dialog.alert("Failed to retrieve rooms.");
        return;
      }
    } catch (e) {
      dialogBG.remove();
      dialog.alert("Failed to retrieve rooms.");
      return;
    }
    rooms.forEach((room) => {
      var removeButton = {
        element: "div",
        className: "divButton roundborder",
        textContent: "Remove from list",
        eventListeners: [
          {
            event: "click",
            func: async function (e) {
              e.preventDefault();
              var accepted = await dialog.confirm(
                "Remove this room?\nThis room will NOT be deleted from the site."
              );
              if (accepted) {
                try {
                  await accountHelper.removeJoinedRoom(room.id);
                  div.remove();
                  doRoomSelect();
                } catch (err) {
                  dialog.alert("Error removing this room ${err}");
                }
              }
            },
          },
        ],
      };
      var roomExtraStuff = [];
      if (room.invited) {
        roomExtraStuff.push({
          element: "span",
          className: "roomTextButton",
          style: {
            fontSize: "30px",
            color: "yellow",
            fontWeight: "bold",
          },
          textContent: "(Invited)",
        });
      }
      if (room.id == currentRoom) {
        roomExtraStuff.push({
          element: "span",
          className: "roomTextButton",
          style: {
            fontSize: "30px",
            color: "green",
            fontWeight: "bold",
          },
          textContent: "*",
        });
      }
      var usersOnline = "(Unknown)";
      var userPFPs = [];
      if (!room.isDefault) {
        usersOnline = room.users;
        for (var userInList of room.userList) {
          if (userInList.username) {
            userPFPs.push({
              element: "div",
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "2px 4px",
              },
              children: [
                {
                  element: "img",
                  className: "profile",
                  style: {
                    height: "32px",
                    maxWidth: "32px",
                  },
                  src: accountHelper.getProfilePictureURL(userInList.username),
                },
                {
                  element: "span",
                  style: {
                    fontWeight: "bold",
                    color: userInList.color,
                    fontFamily: userInList.font,
                  },
                  textContent: userInList.display,
                },
              ],
            });
          }
        }
      }
      var obj = {
        element: "div",
        className: "roomButton",
        children: roomExtraStuff.concat([
          {
            element: "span",
            className: "roomTextButton",
            style: {
              fontSize: "30px",
            },
            textContent: room.name,
          },
          { element: "br" },
          {
            element: "span",
            className: "roomTextButton",
            style: {
              fontSize: "20px",
            },
            textContent: "Room ID: " + room.id,
          },
          {
            element: "br",
          },
          {
            element: "span",
            className: "roomTextButton",
            style: {
              fontSize: "20px",
            },
            textContent: "Users online: " + usersOnline,
          },
          {
            element: "br",
          },
          {
            element: "div",
            style: {
              display: "flex",
              width: "100%",
              height: "fit-content",
            },
            children: userPFPs,
          },
          {
            element: "div",
            className: "divButton roundborder",
            textContent: "Join room",
            eventListeners: [
              {
                event: "click",
                func: function (e) {
                  e.preventDefault();

                  if (room.id == currentRoom) {
                    div.remove();
                    return;
                  }
                  window.location.hash = "#" + encodeURIComponent(room.id);
                  window.location.reload();
                },
              },
            ],
          },
          {
            element: "div",
            className: "divButton roundborder",
            textContent: "Invite someone to this room",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  try {
                    var inviteTarget = await dialog.prompt(
                      "Who do you want to invite to this room?\nType their username to bring them in!"
                    );
                    if (!inviteTarget) {
                      return;
                    }
                    var response = await fetch(
                      accountHelper.getServerURL() + "/account/inviteroom",
                      {
                        method: "POST",
                        body: JSON.stringify({
                          id: room.id,
                          name: room.name,
                          username: inviteTarget,
                        }),
                      }
                    );
                    if (!response.ok) {
                      dialog.alert(
                        "Invite error. That username doesn’t exist... or maybe it escaped through a portal. Check it and try again!" +
                          "\n" +
                          "Server said: " +
                          response.status
                      );
                    }
                  } catch (e) {
                    dialog.alert(
                      "Failed to invite a user to room. Error Message: ${e}"
                    );
                  }
                },
              },
            ],
          },
          {
            element: "div",
            className: "divButton roundborder",
            textContent: "Create join code",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  try {
                    var response = await fetch(
                      accountHelper.getServerURL() + "/quickjoin/code",
                      {
                        method: "POST",
                        body: JSON.stringify({
                          id: room.id,
                        }),
                      }
                    );
                    if (!response.ok) {
                      dialog.alert(
                        "Got error " +
                          response.status +
                          ". Unable to create join code, maybe the room was just deleted?"
                      );
                      return;
                    }
                    var json = await response.json();
                    doJoinCodeScreen(json.code);
                  } catch (e) {
                    dialog.alert(
                      "Failed to create join code. Error Message: ${e}"
                    );
                  }
                },
              },
            ],
          },
        ]),
      };
      if (!room.isDefault) {
        obj.children.push(removeButton);
      }
      roomSelectChildren.push(obj);
    });

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
            textContent: "Manage rooms",
          },
          {
            element: "br",
          },
          {
            element: "span",
            textContent: "Tips:",
            style: {
              fontWeight: "bold",
            },
          },
          {
            element: "ul",
            children: [
              {
                element: "li",
                textContent:
                  'Click "🚪 Summon a room" to create your very own room.',
              },
              {
                element: "li",
                textContent: 'Click "Join room" to hop into a room.',
              },
              {
                element: "li",
                textContent:
                  'Use "Invite someone" to bring a friend in via username.',
              },
              {
                element: "li",
                textContent:
                  'Hit "Remove from list" to remove that room from the list.',
              },
              {
                element: "li",
                textContent:
                  'Use "Create join code" to bring friends in through a join code.',
              },
            ],
          },
          {
            element: "div",
            className: "divButton roundborder",
            textContent: "🚪 Summon a room",
            eventListeners: [
              {
                event: "click",
                func: async function () {
                  try {
                    var a = await fetch(
                      accountHelper.getServerURL() + "/rooms/create",
                      { method: "POST" }
                    );
                    if (a.ok) {
                      var json = await a.json();
                      window.location.hash = "#" + encodeURIComponent(json.id);
                      window.location.reload();
                    } else {
                      dialog.alert(
                        "Couldn't create the room, maybe sign in or sign up first?"
                      );
                    }
                  } catch (e) {
                    dialog.alert(`Something went wrong: ${e}`);
                    console.error(e);
                  }
                },
              },
            ],
          },
          {
            element: "div",
            className: "roomSelect",
            children: roomSelectChildren,
          },
          {
            element: "div",
            className: "divButton roundborder",
            textContent: "Close",
            eventListeners: [
              {
                event: "click",
                func: function () {
                  div.remove();
                },
              },
            ],
          },
        ],
      },
    ]);
    elements.appendElements(div, dom);
    document.body.append(div);
  } catch (e) {
    window.alert(e);
  }
}

rs.show = doRoomSelect;

module.exports = rs;
