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

if (!isSecure()) {
  console.warn("[INSECURE PROTOCOL DETECTED] If you are using the link from a deployment, add https:// to the begining and not http://. \n"+
  "This is because Random Rants + relies on secure content for parts of the site, please change your protocol to HTTPS if possible/"+
  "\nRandom Rants + is may not work correctly with the http protocol unless changes to the site settings are made.");
}

require("./appwindow.js");
require("./wifierror.js");

var mainScreen = elements.getGPId("mainScreen");
var loadingScreen = elements.getGPId("loadingChatMain");
var chatInterface = elements.getGPId("chatInterface");
var reconnectingScreen = elements.getGPId("reconnectingScreen");
var messageInputBox = elements.getGPId("messageInputBox");
var messageSendButton = elements.getGPId("messageSendButton");
var messageAttachFilesButton = elements.getGPId("messageAttachFilesButton");
var userMessagesBox = elements.getGPId("userMessagesBox");
var sharedAppInterface = elements.getGPId("sharedAppInterface");
var usernameErrorScreen = elements.getGPId("usernameErrorScreen");
var reconnectUsernameError = elements.getGPId("reconnectUsernameError");
var userMessagesContainer = elements.getGPId("userMessagesContainer");
var rrLoadingStatusText = elements.getGPId("rrLoadingStatusText");
var usersOnlineContainer = elements.getGPId("usersOnlineContainer");
var showSoundboardButton = elements.getGPId("showSoundboardButton");
var toggleCameraButton = elements.getGPId("toggleCameraButton");
var roomErrorScreen = elements.getGPId("roomErrorScreen");

var userOnlineViewBox = elements.getGPId("userOnlineViewBox");
var toggleMessageAndOnlineView = elements.getGPId("toggleMessageAndOnlineView");
var toggleMessageAndOnlineViewText = elements.getGPId("toggleMessageAndOnlineViewText");

var showRoomSettingsButton = elements.getGPId("showRoomSettingsButton");

var toggleOnlineView = false;
var isOffline = false;

function updateToggleOnlineViewText() {
  if (toggleOnlineView) {
    toggleMessageAndOnlineViewText.textContent = "View chat messages";
  } else {
    toggleMessageAndOnlineViewText.textContent = "View online users";
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
  } else {
    userOnlineViewBox.hidden = true;
    messageInputBox.hidden = false;
    messageSendButton.hidden = false;
    userMessagesBox.hidden = false;
    messageAttachFilesButton.hidden = false;
  }
  updateToggleOnlineViewText();
}

toggleMessageAndOnlineView.addEventListener(
  "click",
  toggleMessageAndOnlineViewClicked
);

reconnectingScreen.hidden = true;

(async function () {
  try {
        
    updateManager.addUpdateListener("interface", () => {
      isOffline = true;
      sws.close();
    })

    var externalThings = await fetchUtils.fetchAsJSON("external/other.json");

    rrLoadingStatusText.textContent = "Injecting WebRTC chaos modules...";
    try {
      var rtcScripts = await fetchUtils.fetchAsJSON(
        "external/webrtc-helper.json"
      );
      for (var script of rtcScripts) {
        await addScript(script);
      }
    } catch (e) {
      dialogs.alert(
        "WebRTC scripts refused to load.\nThat means no screen sharing, no live chaos cams, and no mic mayhem."
      );
    }

    rrLoadingStatusText.textContent = "Unpacking UI bleeps and bloops...";
    await sounds.load();

    rrLoadingStatusText.textContent = "Loading soundboard insanity...";
    await soundboard.load(
      externalThings.soundboardURL,
      function (current, max) {
        var percent = (current / max) * 100;
        rrLoadingStatusText.textContent =
          "Prepping soundboard overload… (" + Math.round(percent) + "%)";
      }
    );

    rrLoadingStatusText.textContent = "Staring intensely at the websocket handshake...";

    setInterval(() => {
      microphones.tick();
    }, 100);

    function putMessage(
      username,
      displayName,
      message,
      isNew,
      isServerMessage,
      userColor,
      recent = true
    ) {
      var willScroll = false;
      if (
        userMessagesBox.scrollTop + userMessagesBox.offsetHeight + 2 >=
        userMessagesBox.scrollHeight
      ) {
        willScroll = true;
      }

      var messageElement = messageElementGenerator(
        username,
        displayName,
        shtml.getMessageHTML(message),
        isServerMessage,
        userColor
      );
      userMessagesContainer.append(messageElement);

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

    function onMessage(e) {
      try {
        var json = JSON.parse(e.data);
        if (json.type == "cameraUpdate") {
          if (json.code) {
            cameras.show(json.id,json.code,json.displayName, json.color); 
          } else {
            cameras.hide(json.id); 
          }
        }
        if (json.type == "microphoneUpdate") {
          if (json.code) {
            microphones.start(json.id,json.code,json.displayName,json.color,json.isSelf); //Add isSelf so the audio will not play for yourself to avoid interference. 
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
        }
        if (json.type == "isOwner") {
          userState.isOwner = json.isOwner;
          showRoomSettingsButton.hidden = !json.isOwner;
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
          for (var messageData of json.messages) {
            putMessage(
              messageData.username,
              messageData.displayName,
              messageData.message,
              false,
              messageData.isServer,
              messageData.color,
              false
            );
          }
        }
        if (json.type == "sendKeepAlive") {
          sws.send(
            JSON.stringify({
              type: "keepAlive",
              timestamp: Date.now()
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
            json.color
          );
          sounds.play("notify", 1);
          notify.sendIfOnScreen(
            "New message!",
            `${json.displayName}: ${json.message}`
          );
        }
        if (json.type == "usernameExists") {
          usernameErrorScreen.hidden = false;
          sws.close();
        }
        if (json.type == "doesNotExist") {
          roomErrorScreen.hidden = false;
          sws.close();
          (async function () {
            await accountHelper.removeJoinedRoom(currentRoom);
          })();
        }
        if (json.type == "roomStillLoading") {
          rrLoadingStatusText.textContent = "Waiting for server to actually load the room...";
        }
        if (json.type == "roomName") {
          roomSettings.changeRoomName(json.name);
          userState.roomID = json.id;
          (async function () {
            await fetch(accountHelper.getServerURL() + "/account/addroom", {
              method: "POST",
              body: JSON.stringify({
                id: json.id,
                name: json.name,
              }),
            });
          })();
        }
        if (json.type == "onlineList") {
          var a = [];
          for (var e of usersOnlineContainer.children) {
            a.push(e);
          }
          for (var e of a) {
            e.remove();
          }
          json.list.forEach((userInfo) => {
            
            async function changeOwnershipUser (promoting) {
              if (promoting) {
                await fetch(accountHelper.getServerURL() + "/rooms/addowner/" + currentRoom, {
                  body: JSON.stringify({
                    who: userInfo.username
                  }),
                  method: "POST"
                });
              } else {
                await fetch(accountHelper.getServerURL() + "/rooms/removeowner/" + currentRoom, {
                  body: JSON.stringify({
                    who: userInfo.username
                  }),
                  method: "POST"
                })
              }
            }
            
            var onlineUser = onlineUserElementGenerator(
              userInfo.username,
              userInfo.displayName,
              userInfo.time,
              userInfo.color,
              userInfo.isOwner,
              userInfo.camEnabled,
              userInfo.micEnabled,
              userInfo.isRealOwner,
              userState.isOwner,
              changeOwnershipUser
            );
            usersOnlineContainer.append(onlineUser);
          })
        }
        if (json.type == "media") {
          mediaEngine.onMessage(json);
        }
        if (json.type == "playSoundboard") {
          soundboard.playSound(json.index,json.mult);
        }
        if (json.type == "stopSoundboard") {
          soundboard.stopAll();
        }
        if (json.type == "commandToClient") {
          if (browserCommands[json.cType]) {
            browserCommands[json.cType].call(browserCommands,json.args);
          }
        }
      } catch (e) {
        dialogs.alert(
          `Websocket server message decode or handling event error!${"\n"}Please tell the developer to fix, or try reloading page if this error presists. Error message: ${e}`
        );
      }
    }

    soundboard.onSoundButtonClick = function (index,mult) {
      sws.send(
        JSON.stringify({
          type: "playSoundboard",
          index,
          mult
        })
      );
    };
    
    soundboard.onSoundStopClick = function () {
      sws.send(
        JSON.stringify({
          type: "stopSoundboard"
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
      //Support for localhost http.
      sws.open(
          (isSecure() ? ("wss://") : "ws://") + window.location.host + "/" + currentRoom,
        onMessage,
        onOpen,
        onCloseReconnect
      );
    }
    if (!isOffline) { //Is offline does not actually mean it, its just used to stop connecting when there is an update.
      openConnection();
    }
    reconnectUsernameError.addEventListener("click", openConnection);
    
    require("./messagebox.js");

    require("./attachfiles.js");

    showSoundboardButton.addEventListener("click", () => {
      soundboard.show();
    });

    require("./my-camera.js");
    require("./my-microphone.js");
    
    require("./chatappinterface.js");
  } catch (e) {
    handleErrors(e);
  }
})();
