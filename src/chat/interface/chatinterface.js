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
var microphones = require("./microphones");

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

var userOnlineViewBox = elements.getGPId("userOnlineViewBox");
var toggleMessageAndOnlineView = elements.getGPId("toggleMessageAndOnlineView");

var toggleOnlineView = false;

function updateToggleOnlineViewText() {
  if (toggleOnlineView) {
    toggleMessageAndOnlineView.textContent = "View chat messages";
  } else {
    toggleMessageAndOnlineView.textContent = "View online users";
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
    var externalThings = await fetchUtils.fetchAsJSON("external/other.json");

    rrLoadingStatusText.textContent = "Loading WebRTC client scripts...";
    try {
      var rtcScripts = await fetchUtils.fetchAsJSON(
        "external/webrtc-helper.json"
      );
      for (var script of rtcScripts) {
        await addScript(script);
      }
    } catch (e) {
      dialogs.alert(
        "Failed to load WebRTC scripts!\nYou won't be able to do anything like screensharing, real time cameras and mics, and any video/audio calling features."
      );
    }

    rrLoadingStatusText.textContent = "Loading UI sounds...";
    await sounds.load();

    rrLoadingStatusText.textContent = "Loading Soundboard sounds...";
    await soundboard.load(
      externalThings.soundboardURL,
      function (current, max) {
        var percent = (current / max) * 100;
        rrLoadingStatusText.textContent =
          "Loading Soundboard sounds... (" + Math.round(percent) + "%)";
      }
    );

    rrLoadingStatusText.textContent = "Waiting for websocket connection...";

    setInterval(() => {
      sws.send(
        JSON.stringify({
          type: "keepAlive",
        })
      );
      
      microphones.tick();
    }, 100);

    function putMessage(
      username,
      displayName,
      message,
      isNew,
      isServerMessage,
      userColor
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
        message,
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
            microphones.start(json.id,json.code,json.displayName,json.color); 
          } else {
            microphones.end(json.id); 
          }
        }
        if (json.type == "ready") {
          loadingScreen.hidden = true;
          mainScreen.hidden = false;
          chatInterface.hidden = false;
          reconnectingScreen.hidden = true;
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
              messageData.color
            );
          }
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
        if (json.type == "roomName") {
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
          for (var userInfo of json.list) {
            var onlineUser = onlineUserElementGenerator(
              userInfo.username,
              userInfo.displayName,
              userInfo.time,
              userInfo.color,
              userInfo.isOwner,
              userInfo.camEnabled,
              userInfo.micEnabled
            );
            usersOnlineContainer.append(onlineUser);
          }
        }
        if (json.type == "media") {
          mediaEngine.onMessage(json);
        }
        if (json.type == "playSoundboard") {
          soundboard.playSound(json.index);
        }
      } catch (e) {
        dialogs.alert(
          `Websocket server message decode or handling event error!${"\n"}Please tell the developer to fix, or try reloading page if this error presists. Error message: ${e}`
        );
      }
    }

    soundboard.onSoundButtonClick = function (index) {
      sws.send(
        JSON.stringify({
          type: "playSoundboard",
          index,
        })
      );
    };

    function onOpen() {
      cameras.hideAll();
      microphones.endAll();
    }

    function onCloseReconnect() {
      usernameErrorScreen.hidden = true;
      reconnectingScreen.hidden = false;
      mediaEngine.onReconnect();
    }

    function openConnection() {
      usernameErrorScreen.hidden = true;
      reconnectingScreen.hidden = true;
      sws.open(
        "wss://" + window.location.host + "/" + currentRoom,
        onMessage,
        onOpen,
        onCloseReconnect
      );
    }
    openConnection();
    reconnectUsernameError.addEventListener("click", openConnection);
    var myChatHistory = [];
    var chatHistoryNumber = 0;

    function sendMessageFromTextBox() {
      var message = messageInputBox.value;
      if (message.trim().length < 1) {
        return;
      }
      sws.send(
        JSON.stringify({
          type: "postMessage",
          message,
        })
      );
      myChatHistory.push(message); // Add to chat history.
      myChatHistory = myChatHistory.slice(-100); // Keep only the last 100 messages to try to avoid memory overflow.
      chatHistoryNumber = myChatHistory.length; // Reset to latest message position.
    }

    messageSendButton.addEventListener("click", function () {
      sendMessageFromTextBox();
      messageInputBox.value = "";
    });

    messageInputBox.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        sendMessageFromTextBox();
        messageInputBox.value = "";
        e.preventDefault();
      }

      if (e.key === "ArrowUp") {
        if (chatHistoryNumber > 0) {
          chatHistoryNumber--;
          messageInputBox.value = myChatHistory[chatHistoryNumber];
        }
        e.preventDefault();
      }

      if (e.key === "ArrowDown") {
        if (chatHistoryNumber < myChatHistory.length) {
          chatHistoryNumber++;
          messageInputBox.value = myChatHistory[chatHistoryNumber] || "";
        }
        e.preventDefault();
      }
    });

    async function uploadFileAsURL(blob) {
      try {
        const formData = new FormData();
        formData.append("file", blob, blob.name); // Append the file as "file" field
        var fileurl = accountHelper.getServerURL() + "/uploads/" + "file";
        var a = await fetch(fileurl, { method: "POST", body: formData });
        var b = await a.json();
        return `${fileurl}/${b.id}`;
      } catch (e) {
        return "";
      }
    }
    var ogAttachText = messageAttachFilesButton.textContent;
    messageAttachFilesButton.addEventListener("click", async function () {
      var buttonChoose = await dialogs.displayButtonChooser(
        "What type of file do you want to attach?",
        ["Cancel", "Image", "Audio", "Video", "File download link"]
      );

      var acceptTypes = "";

      if (buttonChoose == 0) {
        return;
      }
      if (buttonChoose == 1) {
        acceptTypes = "image/*";
      }
      if (buttonChoose == 2) {
        acceptTypes = "audio/*";
      }
      if (buttonChoose == 3) {
        acceptTypes = "video/*";
      }
      if (buttonChoose == 4) {
        acceptTypes = "";
      }

      var input = document.createElement("input");
      input.onchange = async function () {
        if (input.files[0]) {
          messageAttachFilesButton.disabled = true;
          messageAttachFilesButton.textContent = "Uploading files...";
          var fileCount = 0;
          for (var file of input.files) {
            try {
              var fileurl = await uploadFileAsURL(file);
              if (buttonChoose == 1) {
                messageInputBox.value += `[image url=${fileurl}]`;
              }
              if (buttonChoose == 2) {
                messageInputBox.value += `[audio url=${fileurl}]`;
              }
              if (buttonChoose == 3) {
                messageInputBox.value += `[video url=${fileurl}]`;
              }
              if (buttonChoose == 4) {
                if (!messageInputBox.value.endsWith(" ")) {
                  messageInputBox.value += " ";
                }
                messageInputBox.value += fileurl;
              }
            } catch (e) {
              dialogs.alert("Failed to upload file: " + e);
            }
            fileCount += 1;
            var amount = fileCount + 1 + "/" + input.files.length;
            messageAttachFilesButton.textContent =
              "Uploading files... (" + amount + ")";
          }
          messageAttachFilesButton.disabled = false;
          messageAttachFilesButton.textContent = ogAttachText;
        }
      };
      input.type = "file";
      input.accept = acceptTypes;
      input.multiple = true;
      input.click();
    });

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
