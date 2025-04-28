var microphones = {};

var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var microphoneUsageTexts = elements.getGPId("microphoneUsageTexts");

function createAudioElement() {
  var audio = document.createElement("audio");
  return audio;
}

var userMicrophones = {};

microphones.start = function (id, code, displayName, userColor, isSelf) {
  var ssc = window.screenShareClient;
  if (ssc) {
    if (userMicrophones[id]) {
      microphones.end(id);
    }
    var userMicrophone = {};
    var audioElement = createAudioElement();
    userMicrophone.audioElement = audioElement;
    userMicrophone.isSelf = isSelf;

    var span = document.createElement("span");
    span.className = "isTalkingSpan";
    span.style.color = userColor;
    span.textContent = `${displayName} is talking.`;
    span.style.pointerEvents = "none";

    userMicrophone.span = span;
    microphoneUsageTexts.append(span);

    userMicrophone.ss = window.screenShareClient.connectTo(
      code,
      true,
      function (stream) {
        if (!isSelf) {
          audioElement.srcObject = stream;
          try {
            audioElement.play();
          } catch (e) {}
        }
      },
      () => {}
    );

    userMicrophones[id] = userMicrophone;
  }
};

microphones.end = function (id) {
  var ssc = window.screenShareClient;
  if (ssc) {
    if (!userMicrophones[id]) {
      return;
    }
    var userMicrophone = userMicrophones[id];
    try {
      userMicrophone.ss.closeConnection();
    } catch (e) {}

    userMicrophone.audioElement.pause(); //Pause audio.

    //Remove the src object and other stuff.
    userMicrophone.audioElement.removeAttribute("src"); // empty source
    userMicrophone.audioElement.srcObject = null;
    userMicrophone.audioElement.load();

    //To avoid memory leaks, all elements will be removed.
    userMicrophone.audioElement.remove();
    userMicrophone.span.remove();

    //Dispose of the userMicrophone.
    userMicrophones[id] = undefined;

    //Just to make sure its actually disposed, filter out any empty values in userMicrophones.
    var newObjects = {};
    for (var id of Object.keys(userMicrophones)) {
      if (userMicrophones[id]) {
        newObjects[id] = userMicrophones[id];
      }
    }
    userMicrophones = newObjects;
  }
};

microphones.endAll = function () {
  for (var id of Object.keys(userMicrophones)) {
    microphones.end(id);
  }
};

microphones.tick = function () {
  for (var id of Object.keys(userMicrophones)) {
    if (userMicrophones[id]) {
      var userMicrophone = userMicrophones[id];

      if (!userMicrophone.isSelf) {
        try {
          userMicrophone.audioElement.play();
        } catch (e) {}
      }
    }
  }
};

module.exports = microphones;
