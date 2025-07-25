var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var sws = require("./sharedwebsocket.js");

var toggleButton = elements.getGPId("toggleCameraButton");

function startRunningStream() {
  return navigator.mediaDevices.getUserMedia({
    video: true,
  });
}

var contentRunning = false;
var contentSS = null;
var contentStream = null;

function setButtonText(t) {
  var buttonTexts = {
    starting: "Enabling camera...",
    stop: "Disable camera",
    start: "Enable camera",
  };
  toggleButton.textContent = buttonTexts[t];
}

setButtonText("start");
toggleButton.addEventListener("click", async () => {
  if (toggleButton.disabled) {
    return;
  }
  if (contentStream) {
    contentStream.getTracks().forEach((track) => {
      if (track) {
        track.stop();
      }
    });
  }
  if (!contentRunning) {
    setButtonText("starting");
    try {
      toggleButton.disabled = true;
      var stream = await startRunningStream();
    } catch (e) {
      toggleButton.disabled = false;
      dialogs.alert(`Unable to start camera because ${e}.`);
      setButtonText("start");
      return;
    }

    contentRunning = true;

    async function doCamera() {
      if (!contentRunning) {
        return;
      }

      contentSS = await window.screenShareClient.newHost(
        contentStream,
        true,
        function () {
          contentSS = null;
          doCamera();
        },
      );
    }
    contentStream = stream;
    try {
      toggleButton.disabled = true;
      await doCamera();
      setButtonText("stop");
      toggleButton.disabled = false;
    } catch (e) {
      toggleButton.disabled = false;
      contentStream.getTracks().forEach((track) => {
        if (track) {
          track.stop();
        }
      });
      contentStream = null;
      dialogs.alert("Camera internal server error: " + e);
      setButtonText("start");
    }
  } else {
    contentRunning = false;
    contentSS.closeConnection();
    sws.send(
      JSON.stringify({
        type: "setCameraCode",
        code: null,
      }),
    );

    contentStream.getTracks().forEach((track) => {
      if (track) {
        track.stop();
      }
    });
    contentStream = null;
    setButtonText("start");
  }
});

setInterval(() => {
  if (contentRunning) {
    if (!contentSS) {
      return;
    }
    sws.send(
      JSON.stringify({
        type: "setCameraCode",
        code: contentSS.host.key,
      }),
    );
  }
}, 1000 / 20);
