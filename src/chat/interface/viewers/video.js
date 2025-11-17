var elements = require("../../../gp2/elements.js");
var dialogs = require("../../../dialogs.js");
var sws = require("../sharedwebsocket.js");
var audio = require("../../../audio.js");
var sounds = require("../sounds.js");
var clientSettings = require("../clientsettings.js");
var accountHelper = require("../../../accounthelper/index.js");
var notify = require("../notify.js");
var isSecure = require("../is-secure.js");
var roomSelect = require("../roomselect.js");
var LoadingScreen = require("../mini-loader.js");

class VideoViewerDialog {
  constructor() {
    this.menuElement = null;
    this.notificationDiv = null;
    this.videoElement = null;
    var _this = this;

    this.dialogElement = elements.appendElementsFromJSON(document.body, [
      {
        element: "div",
        hidden: true,
        children: [
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
              maxHeight: "calc(100svh - 100px)",
              maxWidth: "calc(100svw - 300px)",
              minWidth: "50px",
              minHeight: "50px",
            },
            children: [
              {
                element: "div",
                style: {
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  height: "100%",
                },
                children: [
                  {
                    element: "div",
                    style: {
                      display: "block",
                      width: "100%",
                    },
                    children: [
                      {
                        element: "span",
                        style: {
                          fontSize: "30px",
                          fontWeight: "bold",
                          textAlign: "center",
                        },
                        textContent: "Attached video",
                      },
                    ],
                  },

                  {
                    element: "div",
                    style: {
                      borderRadius: "6px",
                      background: "black",
                      flexGrow: "1",
                      flexShrink: "0",
                      overflow: "auto",
                      maxHeight: "calc(100svh - 250px)",
                      minHeight: "32px",
                      justifyContent: "center",
                    },
                    children: [
                      {
                        element: "video",
                        src: "",
                        style: {
                          width: "100%",
                          height: "100%",
                        },
                        controls: true,
                        muted: true,
                        looped: true,
                        GPWhenCreated: async function (elm) {
                          _this.videoElement = elm;
                        },
                      },
                    ],
                  },

                  {
                    element: "div",
                    style: {
                      display: "flex",
                      alignItems: "center",
                    },
                    children: [
                      {
                        element: "div",
                        className: "divButton roundborder",
                        textContent: "Download",
                        style: {
                          margin: "2px",
                        },
                        eventListeners: [
                          {
                            event: "click",
                            func: function () {
                              var a = document.createElement("a");
                              a.href = _this.videoElement.src;
                              a.download = decodeURIComponent(
                                _this.videoElement.src.split("/").pop(),
                              );
                              a.target = "_blank";
                              a.click();
                              a.remove();
                            },
                          },
                        ],
                      },
                      {
                        element: "div",
                        className: "divButton roundborder",
                        textContent: "Close",
                        style: {
                          margin: "2px",
                        },
                        eventListeners: [
                          {
                            event: "click",
                            func: function () {
                              _this.dialogElement.hidden = true;
                              _this.videoElement.src = "";
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
        ],
      },
    ])[0];
  }
  async showVideo(src) {
    var videoElement = this.videoElement;
    var dialogElement = this.dialogElement;
    dialogElement.hidden = false;

    try {
      videoElement.src = src;
      videoElement.looped = true;
      videoElement.muted = true;
      videoElement.controls = true;
      await videoElement.load();
      await videoElement.play();
    } catch (e) {
      console.warn("Error loading video: " + e);
    }
  }
}

module.exports = new VideoViewerDialog();
