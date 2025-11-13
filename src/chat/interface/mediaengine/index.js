var elements = require("../../../gp2/elements.js");
var dialog = require("../../../dialogs.js");
var sws = require("../sharedwebsocket.js");
var userState = require("../userstate.js");
var uploadFileAsURL = require("../uploadfiles.js");
var accountHelper = require("../../../accounthelper/index.js");
var loadingStream = require("../loadingstream.js");

var screenShareClient = require("../../../webrtc/");

var isSecure = require("../is-secure.js");

function getScratchCloudURI() {
  return (
    (isSecure() ? "wss://" : "ws://") + window.location.host + "/scratchcloud/"
  );
}

var movingMediaTexts = [
  "Loading up the shrek videos...",
  "Finishing up with Jason touch...",
  "Turning on the virtual televisions...",
  "Loading in the cat videos...",
  "Getting the virtual popcorn ready...",
  "Depolying your video frames...",
  "Loading 100 virtual adapters...",
  "Booting the one server that breaks after 1 second...",
  "Starting entertainment overloads...",
  "Loading the scribble masterpeice...",
  "Starting a war against the server and your computer...",
  "Starting the anti-grounder... Failed - grounded too soon.",
  "Streaming videos at 0.01 FPS...",
  "Trying to keep the lag away... Failed.",
  "Streaming your screenshare of youtube videos.",
  "Popping some virtual popcorn...",
];

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
  return navigator.mediaDevices.getUserMedia({
    video: true,
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
      `Failed to stop screenshare stream, screenshare stream must be closed manually.`,
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
                }),
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

  videoElement.srcObject = loadingStream;

  try {
    videoElement.play();
  } catch (e) {}

  screenshareClientObject = screenShareClient.connectTo(
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
    },
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
      element: "iframe",
      className: "mediaEmbed",
      gid: "mEmbed",
      src: url,
      GPWhenCreated: function (elm) {
        //this function is used to get the element as soon as its values and everything else is applied.
        embedMediaElement = elm;
        elm.onload = function () {
          var validationState = accountHelper.getCurrentValidationState();
          var win = elm.contentWindow;
          if (validationState) {
            win.postMessage(
              {
                type: "RRUserInfo",
                username: validationState.username.trim(),
                displayName: validationState.displayName.trim(),
                color: validationState.color,
                font: validationState.font,
              },
              "*",
            );
          }
        };
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
  if (screenShareClient) {
    try {
      stopScreenshareStream();
      screenshareStream = stream;
      var loadingMediaDiv = doLoadingMediaScreen();

      async function loadScreenshare(force) {
        try {
          if (!force) {
            if (!screenshareRunning) {
              return;
            }
          }
          screenshare = await screenShareClient.newHost(
            screenshareStream,
            true,
            function () {
              screenshareCode = null;
              setTimeout(() => {
                loadScreenshare();
              }, 500);
            },
          );
          await (function () {
            return new Promise((accept) => {
              setTimeout(accept, 500);
            });
          })();
          if (loadingMediaDiv) {
            loadingMediaDiv.remove();
            loadingMediaDiv = null;
          }
          if (screenshareStream) {
            screenshareStream.getTracks().forEach((track) => {
              track.addEventListener("ended", () => {
                sws.send(
                  JSON.stringify({
                    type: "media",
                    command: "mediaResetRequest",
                  }),
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
            }),
          );
          if (force) {
            screenshareRunning = true;
          }
        } catch (e) {
          if (loadingMediaDiv) {
            loadingMediaDiv.remove();
            loadingMediaDiv = null;
          }
          dialog.alert(e);
        }
      }
      sws.send(
        JSON.stringify({
          type: "media",
          command: "mediaResetRequest",
        }),
      );
      loadScreenshare(true);
      screenshareCode = null;
    } catch (e) {
      dialog.alert(
        "Screenshare failed, does your current web browser support screen sharing?",
      );
    }
  } else {
    dialog.alert(
      "The external screenshare runtime script is currently unavailible, please refresh your page to fix this error.",
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
    if (screenShareClient) {
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

function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

function doLoadingMediaScreen() {
  var div = document.createElement("div");
  var stopAnimating = null;

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
        overflow: "unset",
      },
      children: [
        {
          element: "div",
          style: {
            position: "fixed",
            width: "32px",
            height: "32px",
            transform: "translate(0px, -100%)",
            overflow: "none",
          },
          children: [
            {
              element: "div",
              className: "loader2",
            },
          ],
        },
        {
          element: "span",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "Starting up",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "Your content is starting soon... While that is happening you should grab some virtual (or real) popcorn.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          style: {
            fontWeight: "bold",
          },
          GPWhenCreated: function (elm) {
            var anim = null;
            var stopped = false;
            stopAnimating = function () {
              anim.cancel();
              stopped = true;
            };
            function loopAnimation() {
              anim = elm.animate([{ opacity: "1" }, { opacity: "0" }], {
                duration: 200,
                iterations: 1,
                easing: "ease-out",
              });

              anim.addEventListener("finish", () => {
                elm.textContent = returnRandomValueFromArray(movingMediaTexts);
                anim = elm.animate([{ opacity: "0" }, { opacity: "1" }], {
                  duration: 200,
                  iterations: 1,
                  easing: "ease-out",
                });

                anim.addEventListener("finish", () => {
                  if (!stopped) {
                    setTimeout(loopAnimation, 2500);
                  }
                });
              });
            }

            loopAnimation();
          },
        },
      ],
    },
  ]);
  elements.appendElements(div, dom);
  document.body.append(div);

  return {
    remove: function () {
      div.remove();
      stopAnimating();
    },
  };
}

async function doMediaSelect() {
  if (!userState.permissions.media) {
    dialog.alert(userState.noPermissionDialog);
    return;
  }
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
          overflow: "auto",
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
            element: "div",
            style: {
              margin: "8px 0",
              padding: "10px",
              backgroundColor: "#fff8d1",
              border: "1px solid #ffd700",
              borderRadius: "6px",
              fontSize: "14px",
              color: "#444",
              lineHeight: "1.4",
            },
            textContent:
              "Tip: This area can only play one thing at a time.\n" +
              "Choose a app or method that best fits what you want to share.",
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
                element: "div",
                children: [
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
                              "Camera request failed, does your current browser support camera?\nCheck and see if your camera is blocked.",
                            );
                          }
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/cast.svg",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent: "Show & tell Camera (WebRTC)",
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
                          try {
                            var stream =
                              await navigator.mediaDevices.getDisplayMedia({
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
                              "Screenshare failed, does your current web browser support screen sharing?",
                            );
                          }
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/cast.svg",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent: "Screenshare (WebRTC)",
                        },
                      ]),
                    ],
                  },
                  //No more NES, cause the glitch me servers going down and also the nintendo may get on me for piracy if it still exists. (im just 14 years old at this time, please nintendo don't sue me)
                  /*{
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
                            "randomrants" +
                            Math.round(Math.random() * 100000000);
                          try {
                            var json = {
                              owner: "unused",
                              public: false,
                              info: "Used for random rants +",
                              name: nesid,
                              chatEnabled: false,
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
                              `Unknown error happened when trying to start NES Media: ` +
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
                        },userState.on("permissionUpdate", (name,value) => {
      if (name == "soundboard") {
        showSoundboardButton.hidden = !value; //Show soundboard button IF has permission to play the soundboard.
      }
    });
                        {
                          element: "span",
                          textContent:
                            "Nintendo Entertainment System (Emulator)",
                        },
                      ]),
                    ],
                  },*/
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
                          var embedURL = await dialog.prompt(
                            "Type a link to embed to.\nCertian websites may block embedding for security purposes.\nClick cancel or type nothing to cancel.",
                          );
                          if (embedURL) {
                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaResetRequest",
                              }),
                            );
                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaEmbedRunning",
                                url: embedURL,
                              }),
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
                    element: "div",
                    className: "divButton roundborder",
                    eventListeners: [
                      {
                        event: "click",
                        func: async function (e) {
                          e.preventDefault();
                          div.remove();
                          div = null;
                          var input = document.createElement("input");
                          input.onchange = async function () {
                            if (input.files[0]) {
                              var file = input.files[0];
                              var loadingMediaDiv = doLoadingMediaScreen();
                              var url = await uploadFileAsURL(file);
                              loadingMediaDiv.remove();
                              if (url) {
                                sws.send(
                                  JSON.stringify({
                                    type: "media",
                                    command: "mediaResetRequest",
                                  }),
                                );
                                sws.send(
                                  JSON.stringify({
                                    type: "media",
                                    command: "mediaEmbedRunning",
                                    url: url,
                                  }),
                                );
                              }
                            }
                          };
                          input.type = "file";
                          input.accept = "video/*, audio/*";
                          input.click();
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/file.svg",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent:
                            "Play video/audio (Short files recommended)",
                        },
                      ]),
                    ],
                  },

                  //This is not going to die (i hope), i'm just working on making it work with render.com

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

                          try {
                            const response = await fetch(
                              "https://randomrants-rt-paint-server.onrender.com/room/create",
                            );
                            const { roomId } = await response.json();

                            loadingMediaDiv.remove();

                            const embedURL = `https://random-rants-chat.github.io/randomrants-paint-realtime/?server=${encodeURIComponent(
                              "wss://randomrants-rt-paint-server.onrender.com/" +
                                roomId,
                            )}`;

                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaResetRequest",
                              }),
                            );
                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaEmbedRunning",
                                url: embedURL,
                              }),
                            );
                          } catch (err) {
                            loadingMediaDiv.remove();
                            dialog.alert(
                              "Error creating collaborative canvas room:\n" +
                                err,
                            );
                          }
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/draw.svg",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent:
                            "Collaborative canvas (Modified gvbpaint)",
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

                          var loadingMediaDiv = doLoadingMediaScreen();

                          try {
                            loadingMediaDiv.remove();
                            var username = "player";
                            if (accountHelper.getCurrentValidationState()) {
                              username =
                                accountHelper.getCurrentValidationState()
                                  .username;
                            }
                            const embedURL = `https://random-rants-chat.github.io/taco-shoot-minigame/?n=${Math.round(Date.now())}&cloud_host=${getScratchCloudURI()}&username=${encodeURIComponent(username)}&id=${Math.round(Date.now())}`;

                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaResetRequest",
                              }),
                            );
                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaEmbedRunning",
                                url: embedURL,
                              }),
                            );
                          } catch (err) {
                            loadingMediaDiv.remove();
                            dialog.alert("Error creating game room:\n" + err);
                          }
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/tacoshoot.png",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent:
                            "Taco Shoot (Edit of griffpatch's taco burp)",
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

                          var loadingMediaDiv = doLoadingMediaScreen();

                          try {
                            var response = await fetch(
                              "https://randomrants-minigame-cloud.onrender.com/",
                            );
                            loadingMediaDiv.remove();
                            var username = "player";
                            if (accountHelper.getCurrentValidationState()) {
                              username =
                                accountHelper.getCurrentValidationState()
                                  .username;
                            }
                            const embedURL = `https://random-rants-chat.github.io/taco-shoot-minigame/?n=${Math.round(Date.now())}&cloud_host=${getScratchCloudURI()}&username=${encodeURIComponent(username)}&id=${Math.round(Date.now())}&project=${encodeURIComponent("isolation-fixed")}`;

                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaResetRequest",
                              }),
                            );
                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaEmbedRunning",
                                url: embedURL,
                              }),
                            );
                          } catch (err) {
                            loadingMediaDiv.remove();
                            dialog.alert("Error creating game room:\n" + err);
                          }
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/isolation.svg",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent: "Isolation (by colinmacc)",
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

                          var loadingMediaDiv = doLoadingMediaScreen();

                          try {
                            var response = await fetch(
                              "https://randomrants-minigame-cloud.onrender.com/",
                            );
                            loadingMediaDiv.remove();
                            var username = "player";
                            if (accountHelper.getCurrentValidationState()) {
                              username =
                                accountHelper.getCurrentValidationState()
                                  .username;
                            }
                            const embedURL = `https://random-rants-chat.github.io/taco-shoot-minigame/?n=${Math.round(Date.now())}&cloud_host=${getScratchCloudURI()}&username=${encodeURIComponent(username)}&id=${Math.round(Date.now())}&project=${encodeURIComponent("multiplayermonopolyjunior-fixed")}`;

                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaResetRequest",
                              }),
                            );
                            sws.send(
                              JSON.stringify({
                                type: "media",
                                command: "mediaEmbedRunning",
                                url: embedURL,
                              }),
                            );
                          } catch (err) {
                            loadingMediaDiv.remove();
                            dialog.alert("Error creating game room:\n" + err);
                          }
                        },
                      },
                    ],
                    children: [
                      surroundFlexboxDiv([
                        {
                          element: "img",
                          src: "images/multiplayermonopolyjunior.png",
                          style: { height: "25px" },
                        },
                        {
                          element: "span",
                          textContent:
                            "Multiplayer Monopoly Junior (by RokCoder)",
                        },
                      ]),
                    ],
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
                          div = null;
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

userState.on("permissionUpdate", (name, value) => {
  if (name == "media") {
    chooseMediaButton.hidden = !value; //Show button IF has permission to do so.
  }
});
module.exports = mediaHelper;
