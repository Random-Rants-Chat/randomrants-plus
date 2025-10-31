var isSecure = require("./is-secure.js");
var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");
var sws = require("./sharedwebsocket.js");
var messageElementGenerator = require("./messagedivgenerator");
var onlineUserElementGenerator = require("./onlineuserdivgenerator");
var addScript = require("./addscript.js");
var sounds = require("./sounds.js");
var notify = require("./notify.js");
var mediaEngine = require("./mediaengine");
var fetchUtils = require("./fetchutils.js");
var soundboard = require("./soundboard.js");
var handleErrors = require("./baderror.js");
var cameras = require("./cameras");
var browserCommands = require("./commands");
var microphones = require("./microphones");
var updateManager = require("./updatecheck.js");
var userState = require("./userstate.js");
var roomSettings = require("./roomsettings.js");
var shtml = require("../../safehtmlencode.js");
var typingnotice = require("./typingnotice.js");
var bannedUserDivGen = require("./banneduserdiv.js");
var allowUserDivGen = require("./allowuserdiv.js");

if (!isSecure()) {
  console.warn(
    "It seems your using HTTP, if you're using localhost then you can safely ignore this.\nIf you're using a deploy service, then its better to use HTTPS."
  );
}

require("./appwindow.js");
require("./wifierror.js");
require("./navsounds.js");

var mainScreen = elements.getGPId("mainScreen");
var loadingScreen = elements.getGPId("loadingChatMain");
var chatInterface = elements.getGPId("chatInterface");
var reconnectingScreen = elements.getGPId("reconnectingScreen");
var messageInputBox = elements.getGPId("messageInputBox");
var messageSendButton = elements.getGPId("messageSendButton");
var messageAttachFilesButton = elements.getGPId("messageAttachFilesButton");
var messageAddEmojiButton = elements.getGPId("messageAddEmojiButton");
var userMessagesBox = elements.getGPId("userMessagesBox");
var sharedAppInterface = elements.getGPId("sharedAppInterface");
var usernameErrorScreen = elements.getGPId("usernameErrorScreen");
var tooManyErrorScreen = elements.getGPId("tooManyErrorScreen");
var reconnectUsernameError = elements.getGPId("reconnectUsernameError");
var reconnectTooManyError = elements.getGPId("reconnectTooManyError");
var userMessagesContainer = elements.getGPId("userMessagesContainer");
var rrLoadingStatusText = elements.getGPId("rrLoadingStatusText");
var usersOnlineContainer = elements.getGPId("usersOnlineContainer");
var ownershipUsersContainer = elements.getGPId("ownershipUsersContainer");
var addOwnershipUsernameButton = elements.getGPId("addOwnershipUsernameButton");
var showSoundboardButton = elements.getGPId("showSoundboardButton");
var toggleCameraButton = elements.getGPId("toggleCameraButton");
var roomErrorScreen = elements.getGPId("roomErrorScreen");
var guestErrorScreen = elements.getGPId("guestErrorScreen");
var banRoomError = elements.getGPId("banRoomError");
var notAllowedError = elements.getGPId("notAllowedError");
var typingNoticeDiv = elements.getGPId("typingNoticeDiv");
var userOnlineViewBox = elements.getGPId("userOnlineViewBox");
var toggleMessageAndOnlineView = elements.getGPId("toggleMessageAndOnlineView");
var toggleMessageAndOnlineViewText = elements.getGPId(
  "toggleMessageAndOnlineViewText"
);
var chatDialogsDiv = elements.getGPId("chatDialogsDiv");

var showRoomSettingsButton = elements.getGPId("showRoomSettingsButton");
var showRoomSettingsButton2 = elements.getGPId("showRoomSettingsButton2");

var addBanUserButton = elements.getGPId("addBanUserButton");
var blockedUsersContainer = elements.getGPId("blockedUsersContainer");
var addAllowUserButton = elements.getGPId("addAllowUserButton");
var allowedUsersContainer = elements.getGPId("allowedUsersContainer");

var emojiReactionButtonsContainer = elements.getGPId("emojiReactionButtons");

var toggleOnlineView = false;
var isOffline = false;

function updateToggleOnlineViewText() {
  if (toggleOnlineView) {
    toggleMessageAndOnlineView.innerHTML =
      '<img src="images/chaticon.svg" height="17">' + "View chat messages";
  } else {
    toggleMessageAndOnlineView.innerHTML =
      '<img src="images/profile.svg" height="17">' + "View online users";
  }
}

function toggleMessageAndOnlineViewClicked() {
  toggleOnlineView = !toggleOnlineView;
  if (toggleOnlineView) {
    userOnlineViewBox.hidden = false;
    messageInputBox.hidden = true;
    messageSendButton.hidden = true;
    userMessagesBox.hidden = true;
    messageAttachFilesButton.hidden = true;
    messageAddEmojiButton.hidden = true;
    typingNoticeDiv.hidden = true;
    chatDialogsDiv.hidden = true;
  } else {
    userOnlineViewBox.hidden = true;
    messageInputBox.hidden = false;
    messageSendButton.hidden = false;
    userMessagesBox.hidden = false;
    messageAttachFilesButton.hidden = false;
    messageAddEmojiButton.hidden = false;
    typingNoticeDiv.hidden = false;
    chatDialogsDiv.hidden = false;
  }
  updateToggleOnlineViewText();
}

updateToggleOnlineViewText();

toggleMessageAndOnlineView.addEventListener(
  "click",
  toggleMessageAndOnlineViewClicked
);

reconnectingScreen.hidden = true;

var emojiReactions = require("./emojireactions.js");
var clientSettings = require("./clientsettings.js");
var KnownUserList = require("./userlist-menu.js");

(async function () {
  try {
    updateManager.addUpdateListener("interface", () => {
      isOffline = true;
      sws.close();
    });

    var externalThings = await fetchUtils.fetchAsJSON("external/other.json");

    rrLoadingStatusText.textContent =
      "Loading realtime video & audio mayhem...";
    var webrtcError =
      "Realtime video & audio logic failed - No goofy cameras, microphones, or screenshares will ever happen.\nTry reloading if you need them, else they probably blocked for you.";
    try {
      var rtcScripts = await fetchUtils.fetchAsJSON(
        "external/webrtc-helper.json"
      );
      for (var script of rtcScripts) {
        await addScript(script);
      }
    } catch (e) {
      dialogs.alert(webrtcError);
    }

    rrLoadingStatusText.textContent = "Loading in the UI beeps and boops...";
    try {
      await sounds.load();
    } catch (e) {
      dialogs.alert(
        "UI Sounds gave up. No more clicks, beeps and boops, just plain silence."
      );
    }

    try {
      rrLoadingStatusText.textContent = "Initializing meme sounds...";
      await soundboard.load(externalThings, function (current, max) {
        var percent = (current / max) * 100;
        rrLoadingStatusText.textContent =
          "Loading meme sounds (" + Math.round(percent) + "%)";
      });
    } catch (e) {
      //dialogs.alert(e);
      dialogs.alert(
        "Soundboard completley failed to load, no more goofy sounds for you! Blame your schools firewall."
      );
    }

    rrLoadingStatusText.textContent = "Loading known user list...";

    try {
      await KnownUserList.fetchUserList();
    } catch (e) {
      console.error(e);
      dialogs.alert(
        "Something went wrong while trying to load your known user list."
      );
    }

    rrLoadingStatusText.textContent = "Connecting to the rant room...";

    if (!window.screenShareClient) {
      dialogs.alert(webrtcError);
    }

    setInterval(() => {
      microphones.tick();
    }, 100);

    async function changeOwnershipUser(promoting, username) {
      if (promoting) {
        var response = await fetch(
          accountHelper.getServerURL() + "/rooms/addowner/" + currentRoom,
          {
            body: JSON.stringify({
              who: username,
            }),
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
      } else {
        var response = await fetch(
          accountHelper.getServerURL() + "/rooms/removeowner/" + currentRoom,
          {
            body: JSON.stringify({
              who: username,
            }),
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
      }
    }

    async function changeBanUser(banning, username) {
      if (banning) {
        var response = await fetch(
          accountHelper.getServerURL() + "/rooms/addban/" + currentRoom,
          {
            body: JSON.stringify({
              username,
            }),
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
      } else {
        var response = await fetch(
          accountHelper.getServerURL() + "/rooms/removeban/" + currentRoom,
          {
            body: JSON.stringify({
              username,
            }),
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
      }
    }

    async function changeAllowListUser(allowing, username) {
      if (allowing) {
        var response = await fetch(
          accountHelper.getServerURL() + "/rooms/addallowlist/" + currentRoom,
          {
            body: JSON.stringify({
              username,
            }),
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
      } else {
        var response = await fetch(
          accountHelper.getServerURL() +
            "/rooms/removeallowlist/" +
            currentRoom,
          {
            body: JSON.stringify({
              username,
            }),
            method: "POST",
          }
        );
        if (!response.ok) {
          throw new Error(await response.text());
        }
      }
    }

    function putMessage(
      username,
      displayName,
      message,
      isNew,
      isServerMessage,
      userColor,
      userFont,
      recent = true
    ) {
      var willScroll = false;
      if (
        userMessagesBox.scrollTop + userMessagesBox.offsetHeight + 2 >=
        userMessagesBox.scrollHeight
      ) {
        willScroll = true;
      }

      if (isNew) {
        var messageJsonElements = shtml.getBracketCodeJSON(message, {
          vineboom: browserCommands._bracket_vineboom_sound,
          badtothebone: browserCommands._bracket_badtothebone_sound,
        });
      } else {
        var messageJsonElements = shtml.getBracketCodeJSON(message, {
          vineboom: function () {},
          badtothebone: function () {},
        });
      }

      var messageElement = messageElementGenerator(
        username,
        displayName,
        messageJsonElements,
        isServerMessage,
        userColor,
        userFont
      );
      userMessagesContainer.append(messageElement);

      if (isNew) {
        messageElement.animate(
          [
            { transform: "translate(0px, -10px)", opacity: "0" },
            { transform: "translate(0px, 0px)" },
          ],
          {
            duration: 120,
            easing: "ease-in",
          }
        );
      }

      //Scroll to message element.
      if (willScroll) {
        function scanDiv(d) {
          for (var element of d.children) {
            (function (c) {
              var storedscrollheight = userMessagesBox.scrollHeight;
              c.addEventListener("load", () => {
                if (
                  userMessagesBox.scrollTop +
                    userMessagesBox.offsetHeight +
                    2 >=
                  storedscrollheight
                ) {
                  userMessagesBox.scrollTo(0, userMessagesBox.scrollHeight);
                }
              });
              scanDiv(c);
            })(element);
          }
        }
        scanDiv(messageElement);
        userMessagesBox.scrollTo(0, userMessagesBox.scrollHeight);
      }
    }

    addOwnershipUsernameButton.addEventListener("click", async function () {
      var response = await KnownUserList.getUserPrompt("Add co-owner");
      if (!response) {
        return;
      }
      try {
        await changeOwnershipUser(true, response);
      } catch (e) {
        dialogs.alert(
          "❌ Failed to give ownership (admin powers). Please try again later and check your spelling.\n" +
            e
        );
        console.error(e);
      }
    });

    addBanUserButton.addEventListener("click", async function () {
      var response = await KnownUserList.getUserPrompt("Block/ban user");
      if (!response) {
        return;
      }
      try {
        await changeBanUser(true, response);
      } catch (e) {
        dialogs.alert(
          "❌ Failed to block/ban user, please try again later and check your spelling.\n" +
            e
        );
        console.error(e);
      }
    });

    addAllowUserButton.addEventListener("click", async function () {
      var response = await KnownUserList.getUserPrompt("Allow an user");
      if (!response) {
        return;
      }
      try {
        await changeAllowListUser(true, response);
      } catch (e) {
        dialogs.alert(
          "❌ Failed to edit the allow list, please try again later and check your spelling.\n" +
            e
        );
        console.error(e);
      }
    });

    function onMessage(e) {
      try {
        var json = JSON.parse(e.data);
        if (json.type == "allowGuests") {
          roomSettings.updateAllowGuests(json.allow);
        }
        if (json.type == "reaction") {
          emojiReactions.onReaction(json.emoji);
        }
        if (json.type == "roomPermissions") {
          //Room permissions recieved, update the user state to reflect them.
          var perms = json.perms;
          for (var name of Object.keys(perms)) {
            userState.updatePermission(name, perms[name]);
          }
        }
        if (json.type == "roomPermissionSettings") {
          //Used to apply new room permission values to room settings screen.
          var perms = json.perms;
          for (var name of Object.keys(perms)) {
            roomSettings.updatePermission(name, perms[name]);
          }
        }
        if (json.type == "cameraUpdate") {
          if (json.code) {
            cameras.show(
              json.id,
              json.code,
              json.displayName,
              json.color,
              json.font
            );
          } else {
            cameras.hide(json.id);
          }
        }
        if (json.type == "microphoneUpdate") {
          if (json.code) {
            microphones.start(
              json.id,
              json.code,
              json.displayName,
              json.color,
              json.font,
              json.isSelf
            ); //Add isSelf so the audio will not play for yourself to avoid interference.
          } else {
            microphones.end(json.id);
          }
        }
        if (json.type == "ready") {
          loadingScreen.hidden = true;
          mainScreen.hidden = false;
          chatInterface.hidden = false;
          reconnectingScreen.hidden = true;
          userState.isOwner = false;
          addOwnershipUsernameButton.hidden = true;
          addBanUserButton.hidden = true;
          addAllowUserButton.hidden = true;
          showRoomSettingsButton2.hidden = true;
        }
        if (json.type == "isOwner") {
          userState.isOwner = json.isOwner;
          showRoomSettingsButton.hidden = !json.isOwner;
          addOwnershipUsernameButton.hidden = !json.isOwner;
          addBanUserButton.hidden = !json.isOwner;
          addAllowUserButton.hidden = !json.isOwner;
          showRoomSettingsButton2.hidden = !json.isOwner;
        }
        if (json.type == "messages") {
          //This also clears messages and rewrites them.
          var a = [];
          for (var e of userMessagesContainer.children) {
            a.push(e);
          }
          for (var e of a) {
            e.remove();
          }
          if (json.messages.length > 0) {
            elements.appendElementsFromJSON(userMessagesContainer, [
              {
                element: "div",
                className: "messageCategorySeparator",
                textContent: "Previous messages:",
              },
            ]);
          }
          for (var messageData of json.messages) {
            putMessage(
              messageData.username,
              messageData.displayName,
              messageData.message,
              false,
              messageData.isServer,
              messageData.color,
              messageData.font,
              false
            );
          }
          if (json.messages.length > 0) {
            elements.appendElementsFromJSON(userMessagesContainer, []);
          }
          elements.appendElementsFromJSON(userMessagesContainer, [
            {
              element: "div",
              className: "messageCategorySeparator",
              textContent: "Messages:",
            },
          ]);
        }
        if (json.type == "sendKeepAlive") {
          sws.send(
            JSON.stringify({
              type: "keepAlive",
              timestamp: Date.now(),
            })
          );
        }
        if (json.type == "newMessage") {
          putMessage(
            json.username,
            json.displayName,
            json.message,
            true,
            json.isServer,
            json.color,
            json.font
          );
          if (clientSettings.getSetting("INTERFACE_SOUNDS")) {
            sounds.play("notify", 1);
          }
          if (clientSettings.getSetting("CHAT_NOTIFY")) {
            notify.sendIfNotOnScreen(
              "New message",
              `${json.displayName}: ${shtml.bracketCodeRemoval(json.message)}`,
              "New message"
            );
          }
        }
        if (json.type == "usernameExists") {
          usernameErrorScreen.hidden = false;
          sws.close();
        }
        if (json.type == "tooManyConnections") {
          tooManyErrorScreen.hidden = false;
          sws.close();
        }
        if (json.type == "doesNotExist") {
          roomErrorScreen.hidden = false;
          sws.close();
          (async function () {
            await accountHelper.removeJoinedRoom(currentRoom);
          })();
        }
        if (json.type == "notInAllowList") {
          notAllowedError.hidden = false;
          sws.close();
          (async function () {
            await accountHelper.removeJoinedRoom(currentRoom);
          })();
        }
        if (json.type == "banned") {
          banRoomError.hidden = false;
          sws.close();
          (async function () {
            await accountHelper.removeJoinedRoom(currentRoom);
          })();
        }
        if (json.type == "noGuests") {
          guestErrorScreen.hidden = false;
          sws.close();
        }
        if (json.type == "roomStillLoading") {
          rrLoadingStatusText.textContent =
            "The server isn't ready yet, still connecting to rant room...";
        }
        if (json.type == "roomName") {
          roomSettings.changeRoomName(json.name);
          roomSettings.changeRoomDiscription(json.discription);
          userState.roomID = json.id;
          (async function () {
            await fetch(accountHelper.getServerURL() + "/account/addroom", {
              method: "POST",
              body: JSON.stringify({
                id: json.id,
                name: json.name,
                discription: json.discription,
              }),
            });
          })();
          document.title = "Random Rants + | Chatroom [" + json.name + "]";
        }
        if (json.type == "onlineList") {
          var a = [];
          for (var e of usersOnlineContainer.children) {
            a.push(e);
          }
          for (var e of a) {
            e.remove();
          }
          var a = [];
          for (var e of ownershipUsersContainer.children) {
            a.push(e);
          }
          for (var e of a) {
            e.remove();
          }
          var a = [];
          for (var e of blockedUsersContainer.children) {
            a.push(e);
          }
          for (var e of a) {
            e.remove();
          }
          var a = [];
          for (var e of allowedUsersContainer.children) {
            a.push(e);
          }
          for (var e of a) {
            e.remove();
          }
          json.list.forEach((userInfo) => {
            var onlineUser = onlineUserElementGenerator(
              userInfo.username,
              userInfo.displayName,
              userInfo.time,
              userInfo.color,
              userInfo.font,
              userInfo.isOwner,
              userInfo.camEnabled,
              userInfo.micEnabled,
              userInfo.isRealOwner,
              userState.isOwner,
              async function (promoting) {
                await changeOwnershipUser(promoting, userInfo.username);
              },
              false,
              async function () {
                await changeBanUser(true, userInfo.username);
              }
            );
            usersOnlineContainer.append(onlineUser);
          });
          if (json.owners) {
            json.owners.forEach((username, i) => {
              var onlineUser = onlineUserElementGenerator(
                null,
                username,
                "",
                "#000000",
                "Arial",
                true,
                false,
                false,
                i == 0, //If first one than its true owner.
                userState.isOwner,
                async function (promoting) {
                  await changeOwnershipUser(promoting, username);
                },
                true
              );
              ownershipUsersContainer.append(onlineUser);
            });
          }
          if (json.bans) {
            if (json.bans.length < 1) {
              var span = document.createElement("span");
              span.textContent =
                'Nobody\'s banned. Add your "enemies" or "misbehaving" users here.';
              blockedUsersContainer.append(span);
            }
            json.bans.forEach((username, i) => {
              var funct = async function () {
                await changeBanUser(false, username);
              };
              if (!userState.isOwner) {
                funct = null;
              }
              var bannedUser = bannedUserDivGen(username, funct);
              blockedUsersContainer.append(bannedUser);
            });
          }
          if (json.allowed) {
            if (json.allowed.length < 1) {
              var span = document.createElement("span");
              span.textContent =
                "The allow list is empty - Everyone could hop on!";
              allowedUsersContainer.append(span);
            } else {
              var span = document.createElement("span");
              span.textContent =
                "Only these users and the room creator can join the room:";
              allowedUsersContainer.append(span);
            }
            json.allowed.forEach((username, i) => {
              var funct = async function () {
                await changeAllowListUser(false, username);
              };
              if (!userState.isOwner) {
                funct = null;
              }
              var allowedUser = allowUserDivGen(username, funct);
              allowedUsersContainer.append(allowedUser);
            });
          }
        }
        if (json.type == "media") {
          mediaEngine.onMessage(json);
        }
        if (json.type == "playSoundboard") {
          if (!userState.permissions.soundboard) {
            return;
          }
          soundboard.playSound(json.index, json.mult, json.displayName);
        }
        if (json.type == "stopSoundboard") {
          soundboard.stopAll();
        }
        if (json.type == "updateTheme") {
          roomSettings.updateTheme(json.index);
        }
        if (json.type == "commandToClient") {
          if (browserCommands[json.cType]) {
            browserCommands[json.cType].call(browserCommands, json.args);
          }
        }
        if (json.type == "typing") {
          typingnotice.activateTypingMessage(
            json.username,
            json.displayName,
            json.color,
            json.font
          );
        }
      } catch (e) {
        console.error(e);
        dialogs.alert(
          `Websocket server message decode or handling event error!${"\n"}Please tell the developer to fix, or try reloading page if this error presists. Error message: ${e}`
        );
      }
    }

    soundboard.onSoundButtonClick = function (index, mult) {
      if (!userState.permissions.soundboard) {
        dialogs.alert(userState.noPermissionDialog);
        return;
      }

      sws.send(
        JSON.stringify({
          type: "playSoundboard",
          index,
          mult,
        })
      );
    };

    soundboard.onSoundStopClick = function () {
      if (!userState.permissions.soundboard) {
        dialogs.alert(userState.noPermissionDialog);
        return;
      }

      sws.send(
        JSON.stringify({
          type: "stopSoundboard",
        })
      );
    };

    function onOpen() {
      cameras.hideAll();
      microphones.endAll();
    }

    function onCloseReconnect() {
      cameras.hideAll();
      microphones.endAll();
      usernameErrorScreen.hidden = true;
      reconnectingScreen.hidden = false;
      mediaEngine.onReconnect();
    }

    function openConnection() {
      usernameErrorScreen.hidden = true;
      reconnectingScreen.hidden = true;
      tooManyErrorScreen.hidden = true;
      //Support for localhost http.
      sws.open(
        (isSecure() ? "wss://" : "ws://") +
          window.location.host +
          "/" +
          currentRoom,
        onMessage,
        onOpen,
        onCloseReconnect
      );
    }
    if (!isOffline) {
      //Is offline does not actually mean it, its just used to stop connecting when there is an update.
      openConnection();
    }
    reconnectUsernameError.addEventListener("click", openConnection);
    reconnectTooManyError.addEventListener("click", openConnection);

    require("./messagebox.js");
    require("./emojidialog.js");

    require("./attachfiles.js");

    showSoundboardButton.addEventListener("click", () => {
      soundboard.show();
    });

    userState.on("permissionUpdate", (name, value) => {
      if (name == "soundboard") {
        showSoundboardButton.hidden = !value; //Show soundboard button IF has permission to play the soundboard.
      }
      if (name == "reactions") {
        emojiReactionButtonsContainer.style.display = !value ? "none" : "flex";
      }
    });

    require("./my-camera.js");
    require("./my-microphone.js");

    require("./chatappinterface.js");
    require("./accountnotice.js");
  } catch (e) {
    handleErrors(e);
  }
})();
