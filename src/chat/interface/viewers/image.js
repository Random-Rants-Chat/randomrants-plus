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

class ImageViewerDialog {
  constructor() {
    this.menuElement = null;
    this.notificationDiv = null;
    this.imageElement = null;
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
                        textContent: "Attached image",
                      },
                    ],
                  },

                  {
                    element: "div",
                    style: {
                      padding: "8px",
                      borderRadius: "6px",
                      background: "black",
                      flexGrow: "1",
                      flexShrink: "0",
                      overflow: "auto",
                      maxHeight: "calc(100svh - 250px)",
                      minHeight: "300px",
                      justifyContent: "center",
                    },
                    children: [
                      {
                        element: "img",
                        src: "",
                        style: {
                          pointerEvents: "none",
                          objectFit: "contain",
                          minWidth: "300px",
                          minHeight: "300px",
                          position: "relative",
                        },
                        GPWhenCreated: function (elm) {
                          _this.imageElement = elm;
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
                              a.href = _this.imageElement.src;
                              a.download = decodeURIComponent(
                                _this.imageElement.src.split("/").pop()
                              );
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
                              _this.imageElement.src = "";
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
  showImage(src) {
    this.imageElement.src = src;
    this.dialogElement.hidden = false;
  }
}

module.exports = new ImageViewerDialog();
