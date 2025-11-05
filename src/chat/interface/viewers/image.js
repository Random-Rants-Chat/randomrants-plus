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
              overflowY: "auto",
              maxHeight: "calc(100vh - 100px)",
              maxWidth: "calc(100vw - 300px)",
              minWidth: "360px",
              minHeight: "360px",
            },
            children: [
              {
                element: "div",
                style: {
                  display: "flex",
                  flexDirection: "column",
                },
                children: [
                  {
                    element: "div",
                    style: {
                      display: "block",
                    },
                    children: [
                      {
                        element: "span",
                        style: {
                          fontSize: "30px",
                          fontWeight: "bold",
                        },
                        textContent: "Attached image",
                      },
                    ],
                  },

                  {
                    element: "div",
                    style: {
                      margin: "8px 0",
                      padding: "8px",
                      backgroundColor: "#fffae6",
                      border: "1px solid #f0e68c",
                      borderRadius: "6px",
                      fontSize: "14px",
                      color: "#665500",
                      flexGrow: "1",
                    },
                    children: [],
                  },

                  {
                    element: "div",
                    style: {
                      display: "flex",
                    },
                    children: [
                      {
                        element: "div",
                        className: "divButton roundborder",
                        textContent: "Download",
                        style: {
                          flexGrow: "1",
                        },
                        eventListeners: [
                          {
                            event: "click",
                            func: function () {
                              _this.dialogElement.hidden = true;
                            },
                          },
                        ],
                      },
                      {
                        element: "div",
                        className: "divButton roundborder",
                        textContent: "Close",
                        style: {
                          flexGrow: "1",
                        },
                        eventListeners: [
                          {
                            event: "click",
                            func: function () {
                              _this.dialogElement.hidden = true;
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
  showImage() {
    dialogElement.hidden = true;
  }
}

module.exports = new ImageViewerDialog();
