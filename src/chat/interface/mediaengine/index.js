var elements = require("../../../gp2/elements.js");
var dialog = require("../../../dialogs.js");
var sws = require("../sharedwebsocket.js");

var noInstantPlayNotice =
  "This media is not instant play, you need to manually create an room/server and join it. \nDo you still want to continue?";

async function fetchAsJSON(url, otherStuff) {
  var f = await fetch(url, otherStuff);
  var text = await f.text();
  var json = JSON.parse(text);

  return json;
}
async function fetchAsText(url, otherStuff) {
  var f = await fetch(url, otherStuff);
  var text = await f.text();

  return text;
}

var chooseMediaButton = elements.getGPId("chooseMediaButton");
var mediaContentDiv = elements.getGPId("mediaContentDiv");
var screenshareClientObject = null;
var screenshareCode = null;
var screenshareStream = null;
var mediaVideo = null;
mediaContentDiv.hidden = true;
function waitForCam() {
  return new Promise((accept, reject) => {
    navigator.getUserMedia(
      {
        video: true,
      },
      accept,
      reject
    );
  });
}
function stopScreenshareStream() {
  screenshareRunning = false;
  if (!screenshareStream) {
    return;
  }
  try {
    screenshareStream.getTracks().forEach((track) => {
      if (track) {
        track.stop();
      }
    });
  } catch (e) {
    console.warn(
      `Failed to stop screenshare stream, screenshare stream must be closed manually.`
    );
  }
  screenshareStream = null;
}
function hideMediaContent() {
  var a = [];
  for (var c of mediaContentDiv.children) {
    a.push(c);
  }
  for (var c of a) {
    c.remove();
  }
  mediaContentDiv.hidden = true;
}
function removeMediaDivContent() {
  var a = [];
  for (var c of mediaContentDiv.children) {
    a.push(c);
  }
  for (var c of a) {
    c.remove();
  }
}

function getMediaPlayingMenuBar() {
  return {
    element: "div",
    className: "mediaContentMenuBar",
    children: [
      {
        element: "div",
        className: "mediaContentItem mediaContentItemClickable",
        textContent: "Stop",
        title: "Stop the currently playing media",
        eventListeners: [
          {
            event: "click",
            func: function () {
              sws.send(
                JSON.stringify({
                  type: "media",
                  command: "mediaResetRequest",
                })
              );
              stopScreenshareStream();
            },
          },
        ],
      },
      {
        element: "div",
        className: "mediaContentItem mediaContentItemClickable",
        title: "This will try to mute or unmute the media, if supported.",
        GPWhenCreated: function (elm) {
          if (mediaVideo) {
            if (mediaVideo.muted) {
              elm.textContent = "Unmute";
            } else {
              elm.textContent = "Mute";
            }
          } else {
            elm.hidden = true;
          }
        },
        eventListeners: [
          {
            event: "click",
            func: function () {
              if (mediaVideo) {
                mediaVideo.muted = !mediaVideo.muted;
                if (mediaVideo.muted) {
                  this.textContent = "Unmute";
                } else {
                  this.textContent = "Mute";
                }
              } else {
                dialog.alert("Option unavailible for this type of media.");
              }
            },
          },
        ],
      },
    ],
  };
}

function createMediaScreenshareVideo(code) {
  if (code !== screenshareCode) {
    if (screenshare) {
      try {
        screenshare.closeConnection();
        stopScreenshareStream();
      } catch (e) {
        console.warn(`Error stopping screenshare`, e);
      }
    }
  }

  if (screenshareClientObject) {
    try {
      screenshareClientObject.closeConnection();
    } catch (e) {
      console.warn(`Error stopping screenshareClientObject`, e);
    }
  }

  removeMediaDivContent();
  var div = document.createElement("div");
  div.style.width = "100%";
  div.style.height = "100%";

  var dom = elements.createElementsFromJSON([
    {
      element: "video",
      className: "screenshareVideo",
      gid: "ssVideo",
      muted: true,
      GPWhenCreated: function (elm) {
        //this function is used to get the element as soon as its values and everything else is applied.
        mediaVideo = elm;
      },
    },
    getMediaPlayingMenuBar(),
  ]);

  var videoElement = elements.getGPId("ssVideo");

  screenshareClientObject = window.screenShareClient.connectTo(
    code,
    true,
    function (stream) {
      videoElement.srcObject = stream;
      videoElement.play();
    },
    () => {
      videoElement.pause();
      videoElement.remove();
      mediaVideo = null;
    }
  );

  elements.appendElements(div, dom);

  mediaContentDiv.append(div);
}

var embedMediaElement = null;

function createEmbedURLMedia(url) {
  removeMediaDivContent();
  if (embedMediaElement) {
    embedMediaElement.src = "about:blank";
    embedMediaElement.remove();
  }
  var div = document.createElement("div");
  div.style.width = "100%";
  div.style.height = "100%";

  var dom = elements.createElementsFromJSON([
    {
      element: "embed",
      className: "mediaEmbed",
      gid: "mEmbed",
      src: url,
      GPWhenCreated: function (elm) {
        //this function is used to get the element as soon as its values and everything else is applied.
        embedMediaElement = elm;
      },
    },
    getMediaPlayingMenuBar(),
  ]);

  elements.appendElements(div, dom);

  mediaContentDiv.append(div);
}

function surroundFlexboxDiv(c) {
  return {
    element: "div",
    style: { display: "flex" },
    children: c,
  };
}

var screenshareRunning = false;
var screenshare = null;

function screenshareStopFunction() {
  screenshareRunning = false;
  if (screenshareClientObject) {
    try {
      screenshareClientObject.closeConnection();
    } catch (e) {
      console.warn(`Error stopping screenshareClientObject`, e);
    }
  }
  if (screenshare) {
    try {
      screenshare.closeConnection();
    } catch (e) {
      console.warn(`Error stopping screenshare`, e);
    }
  }
  screenshareCode = null;
}

async function startScreenshareButton(stream) {
  if (window.screenShareClient) {
    try {
      stopScreenshareStream();
      screenshareStream = stream;

      async function loadScreenshare(force) {
        try {
          if (!force) {
            if (!screenshareRunning) {
              return;
            }
          }
          screenshare = await window.screenShareClient.newHost(
            screenshareStream,
            true,
            function () {
              screenshareCode = null;
              loadScreenshare();
            }
          );
          if (screenshareStream) {
            screenshareStream.getTracks().forEach((track) => {
              track.addEventListener("ended", () => {
                sws.send(
                  JSON.stringify({
                    type: "media",
                    command: "mediaResetRequest",
                  })
                );
              });
            });
          }
          screenshareCode = screenshare.host.key;
          sws.send(
            JSON.stringify({
              type: "media",
              command: "screenshareRunning",
              code: screenshare.host.key,
            })
          );
          if (force) {
            screenshareRunning = true;
          }
        } catch (e) {
          window.alert(e);
        }
      }
      sws.send(
        JSON.stringify({
          type: "media",
          command: "mediaResetRequest",
        })
      );
      loadScreenshare(true);
      screenshareCode = null;
    } catch (e) {
      dialog.alert(
        "Screenshare failed, does your current web browser support screen sharing?"
      );
    }
  } else {
    dialog.alert(
      "The external screenshare runtime script is currently unavailible, please refresh your page to fix this error."
    );
  }
}

function mediaStopScreenshare() {
  stopScreenshareStream();
  screenshareStopFunction();
}

function messageHandler(json) {
  if (json.command == "screenshareRun") {
    hideMediaContent();
    mediaContentDiv.hidden = false;
    if (window.screenShareClient) {
      createMediaScreenshareVideo(json.code);
    }
  }
  if (json.command == "mediaEmbedRun") {
    hideMediaContent();
    mediaContentDiv.hidden = false;
    createEmbedURLMedia(json.url);
  }
  if (json.command == "reset") {
    hideMediaContent();
    mediaContentDiv.hidden = true;
    mediaVideo = null;
    if (embedMediaElement) {
      embedMediaElement.src = "about:blank";
      embedMediaElement.remove();
      embedMediaElement = null;
    }
  }
}

function doLoadingMediaScreen() {
  var div = document.createElement("div");

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
          textContent: "Starting media...",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent: "This media is currently starting...",
        },
      ],
    },
  ]);
  elements.appendElements(div, dom);
  document.body.append(div);

  return div;
}

async function doMediaSelect() {
  try {
    var div = document.createElement("div");

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
        style: {
          overflow: "auto"
        },
        children: [
          {
            element: "span",
            style: {
              fontSize: "30px",
              fontWeight: "bold",
            },
            textContent: "Start media",
          },
          {
            element: "br",
          },
          {
            element: "div",
            className: "divButton roundborder",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  div.remove();
                  div = null;
                  try {
                    var stream = await waitForCam();
                    startScreenshareButton(stream);
                  } catch (e) {
                    dialog.alert(
                      "Camera request failed, does your current browser support camera?\nCheck and see if your camera is blocked."
                    );
                  }
                },
              },
            ],
            children: [
              surroundFlexboxDiv([
                {
                  element: "img",
                  src: "images/screenshare.svg",
                  style: { height: "25px" },
                },
                { element: "span", textContent: "Camera share (WebRTC)" },
              ]),
            ],
          },
          {
            element: "div",
            className: "divButton roundborder",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  div.remove();
                  div = null;
                  try {
                    var stream = await navigator.mediaDevices.getDisplayMedia({
                      video: {
                        displaySurface: "browser",
                        cursor: "always",
                      },
                      audio: {
                        suppressLocalAudioPlayback: false,
                        echoCancellation: false,
                        noiseSuppression: false,
                        sampleRate: 44100,
                      },
                      preferCurrentTab: false,
                      selfBrowserSurface: "include",
                      systemAudio: "include",
                      surfaceSwitching: "include",
                      monitorTypeSurfaces: "include",
                    });
                    startScreenshareButton(stream);
                  } catch (e) {
                    dialog.alert(
                      "Screenshare failed, does your current web browser support screen sharing?"
                    );
                  }
                },
              },
            ],
            children: [
              surroundFlexboxDiv([
                {
                  element: "img",
                  src: "images/screenshare.svg",
                  style: { height: "25px" },
                },
                { element: "span", textContent: "Screenshare (WebRTC)" },
              ]),
            ],
          },
          {
            element: "div",
            className: "divButton roundborder",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  div.remove();
                  div = null;

                  var loadingMediaDiv = doLoadingMediaScreen();
                  var nesid =
                    "randomrants" + Math.round(Math.random() * 100000000);
                  try {
                    var json = {
                      owner: "unused",
                      public: false,
                      info: "Used for random rants +",
                      name: nesid,
                      chatEnabled: false
                    };

                    var status = await fetchAsText(
                      `https://gvbneslive-api.glitch.me/rooms/create`,
                      {
                        method: "POST",
                        body: JSON.stringify(json),
                      }
                    );

                    if (status.startsWith("Error")) {
                      throw new Error(status);
                    }

                    loadingMediaDiv.remove();
                  } catch (e) {
                    loadingMediaDiv.remove();
                    dialog.alert(
                      `Unknown error happened when trying to start NES Media: `+
                      e
                    );
                    return;
                  }

                  sws.send(
                    JSON.stringify({
                      type: "media",
                      command: "mediaResetRequest",
                    })
                  );
                  sws.send(
                    JSON.stringify({
                      type: "media",
                      command: "mediaEmbedRunning",
                      url:
                        "https://gvb-nes-live.glitch.me/?room=" +
                        encodeURIComponent(nesid),
                    })
                  );
                },
              },
            ],
            children: [
              surroundFlexboxDiv([
                {
                  element: "img",
                  src: "images/nes.png",
                  style: { height: "25px" },
                },
                {
                  element: "span",
                  textContent: "Nintendo Entertainment System (Emulator)",
                },
              ]),
            ],
          },
          {
            element: "div",
            className: "divButton roundborder",
            eventListeners: [
              {
                event: "click",
                func: async function (e) {
                  e.preventDefault();
                  div.remove();
                  div = null;
                  var embedURL = await dialog.prompt("Type a link to embed to.\nCertian websites may block embedding for security purposes.\nClick cancel or type nothing to cancel.");
                  if (embedURL) {
                    sws.send(
                      JSON.stringify({
                        type: "media",
                        command: "mediaResetRequest",
                      })
                    );
                    sws.send(
                      JSON.stringify({
                        type: "media",
                        command: "mediaEmbedRunning",
                        url: embedURL,
                      })
                    );
                  }
                },
              },
            ],
            children: [
              surroundFlexboxDiv([
                {
                  element: "img",
                  src: "images/link.svg",
                  style: { height: "25px" },
                },
                {
                  element: "span",
                  textContent: "Embed",
                },
              ]),
            ],
          },
          {
            element: "br",
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
                  div = null;
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

var mediaHelper = {
  onMessage: messageHandler,
  onReconnect: function () {
    stopScreenshareStream();
  },
};

chooseMediaButton.addEventListener("click", (e) => {
  e.preventDefault();
  doMediaSelect();
});

module.exports = mediaHelper;
