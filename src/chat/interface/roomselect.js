var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");
var dialog = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var rs = {};

var validState = accountHelper.getCurrentValidationState();

async function getRooms() {
  var rooms = [];
  if (validState) {
    rooms = await accountHelper.getJoinedRooms();
  }
  return rooms;
}

async function doRoomSelect() {
  try {
    var div = document.createElement("div");
    
    var addButtonJSON = {
        element: "div",
        className: "roomButton roomButtonClickable",
        eventListeners: [
          {
            event: "click",
            func: async function () {
              try{
                var a = await fetch(accountHelper.getServerURL()+"/rooms/create",{method:"POST"});
                if (a.ok) {
                  var json = await a.json();
                  window.location.hash = "#"+encodeURIComponent(json.id);
                  window.location.reload();
                } else {
                  dialog.alert(`Bad request status when trying to create room, you may need to log in or sign up to use this feature.`);
                }
              }catch(e){
                dialog.alert(`Error when trying to create room! Message: ${e}`);
                console.error(e);
              }
            }
          },
        ],
        children: [
          {
            element: "span",
            className: "roomAddButton",
            textContent: "+",
          },
        ],
      };
    
    var roomSelectChildren = [];
    
    if (validState) {
      roomSelectChildren.push(addButtonJSON);
    } else {
      roomSelectChildren.push({
        element: "div",
        className: "roomButton",
        children: [
          {
            element: "span",
            textContent: "⚠ You can't manage or join any rooms because you aren't logged in. If you have just logged in you may need to reload your page.",
          },
        ],
      });
    }
    
    var dialogBG = document.createElement("div");
    var loadingSpinnerDiv = document.createElement("div");
    var loadingSpinnerCDiv = document.createElement("div");
    dialogBG.className = "dialogBackground";
    loadingSpinnerDiv.className = "loader";
    loadingSpinnerCDiv.append(loadingSpinnerDiv);
    loadingSpinnerCDiv.className = "centerMiddle";
    dialogBG.append(loadingSpinnerCDiv);
    document.body.append(dialogBG);
    try{
      var rooms = await getRooms();
      dialogBG.remove();
      if (!rooms) {
        dialog.alert("Failed to retrieve rooms.");
        return;
      }
    }catch(e){
      dialogBG.remove();
      dialog.alert("Failed to retrieve rooms.");
      return;
    }
    rooms.forEach((room) => {
      var removeButton =           {
            element: "div",
            className: "divButton",
            textContent: "Remove from list",
            eventListeners: [
              {
                event:"click",
                func: async function (e) {
                  e.preventDefault();
                  var accepted = await dialog.confirm("Remove this room?\nThis room will NOT be deleted from the site.");
                  if (accepted) {
                    try{
                      await accountHelper.removeJoinedRoom(room.id);
                      div.remove();
                      doRoomSelect();
                    }catch(err){
                      dialog.alert(`Error removing this room ${err}`);
                    }
                  }
                }
              }
            ]
          };
      var roomExtraStuff = [];
      if (room.invited) {
        roomExtraStuff.push({
          element: "span",
          className: "roomTextButton",
          style: {
            fontSize: "30px",
            color: "yellow",
            fontWeight: "bold"
          },
          textContent: "(Invited)"
        });
      }
      if (room.id == currentRoom) {
        roomExtraStuff.push({
          element: "span",
          className: "roomTextButton",
          style: {
            fontSize: "30px",
            color: "green",
            fontWeight: "bold"
          },
          textContent: "*"
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
                padding: "4px 4px",
              },
              children:[
                {
                  element: "img",
                  className: "profile",
                  style: {
                    height: "32px",
                    maxWidth: "32px",
                  },
                  src: accountHelper.getProfilePictureURL(userInList.username)
                },
                {
                  element: "span",
                  style: {
                    fontWeight:"bold",
                    color: userInList.color
                  },
                  textContent: userInList.display
                }
              ]
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
            element: "br"
          },
          {
            element: "span",
            className: "roomTextButton",
            style: {
              fontSize: "20px",
            },
            textContent: "Users online: "+usersOnline,
          },
          {
            element: "br"
          },
          {
            element: "div",
            style: {
              display:"flex",
              width: "100%",
              height: "fit-content"
            },
            children: userPFPs
          },
          {
            element: "div",
            className: "divButton",
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
                  window.location.hash = "#"+encodeURIComponent(room.id);
                  window.location.reload();
                }
              }
            ]
          },
          {
            element: "div",
            className: "divButton",
            textContent: "Invite someone to this room",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  try{
                    var inviteTarget = await dialog.prompt("Who do you want to invite to this room? Enter username:");
                    if (!inviteTarget) {
                      return;
                    }
                    var response = await fetch(accountHelper.getServerURL()+"/account/inviteroom",{method:"POST",body: JSON.stringify({
                      id: room.id,
                      name: room.name,
                      username: inviteTarget
                    })});
                    if (!response.ok) {
                      dialog.alert("Failed to invite this user, make sure you properly typed the username.");
                    }
                  }catch(e){
                    dialog.alert(`Failed to invite a user to room. Error Message: ${e}`);
                  }
                }
              }
            ]
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
            element: "span",
            textContent:
              '- Click the "Join room" button on a room to join it. Or to invite someone, click the "Invite someone to this room" button. If you want to remove a room from the list, click the "Remove from list" button.',
          },
          {
            element: "br",
          },
          {
            element: "div",
            className: "roomSelect",
            children: roomSelectChildren,
          },
          {
            element: "div",
            className: "divButton",
            textContent: "Close",
            eventListeners: [
              {
                event: "click",
                func: function () {
                  div.remove();
                }
              }
            ]
          }
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
