var elements = require("../../../gp2/elements.js");
var dialogs = require("../../../dialogs.js");
var sws = require("../sharedwebsocket.js");
var audio = require("../../../audio.js");
var sounds = require("../sounds.js");
var clientSettings = require("../clientsettings.js");
var accountHelper = require("../../../accounthelper/index.js");
var notify = require("../notify.js");
var sws = require("./sws.js");
var isSecure = require("../is-secure.js");
var roomSelect = require("../roomselect.js");

class RealTimeNotifications {
  constructor() {
    this.menuElement = null;
    this.notificationDiv = null;
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
                element: "span",
                style: {
                  fontSize: "30px",
                  fontWeight: "bold",
                },
                textContent: "Notifications",
              },

              {
                element: "div",
                className: "divButton roundborder",
                textContent: "Close",
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
                style: {
                  margin: "8px 0",
                  padding: "8px",
                  backgroundColor: "#fffae6",
                  border: "1px solid #f0e68c",
                  borderRadius: "6px",
                  fontSize: "14px",
                  color: "#665500",
                  width: "fit-content",
                  height: "fit-content",
                },
                children: [
                  {
                    element: "b",
                    textContent: "Tips:",
                  },
                  {
                    element: "p",
                    textContent:
                      "You'll recive notifications here from certain things, such as invites to chatrooms.",
                  },
                  {
                    element: "p",
                    textContent:
                      "To dismiss your notifications, use the Remove All button, or for a single one just click the Remove button.",
                  },
                ],
              },

              {
                element: "br",
              },

              {
                element: "div",
                className: "sep1",
              },

              {
                element: "br",
              },

              {
                element: "div",
                className: "divButton roundborder",
                textContent: "Remove all",
                eventListeners: [
                  {
                    event: "click",
                    func: function () {
                      sws.send(
                        JSON.stringify({
                          type: "readAll",
                        })
                      );
                    },
                  },
                ],
              },
              {
                element: "br",
              },

              {
                element: "div",
                className: "notificationsDiv",
                GPWhenCreated: function (elm) {
                  _this.notificationDiv = elm;
                },
              },

              {
                element: "br",
              },

              {
                element: "div",
                className: "sep1",
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
                      _this.dialogElement.hidden = true;
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ])[0];
  }
  getMenuItem() {
    var _this = this;
    return {
      element: "div",
      className: "menuBarItem",
      style: {
        padding: "0px 0px",
      },
      children: [
        {
          element: "img",
          className: "notificationImage",
          src: "images/notification.svg",
        },
        {
          element: "div",
          style: {
            width: "40px",
            height: "40px",
            pointerEvents: "none",
            position: "relative",
          },
          children: [
            {
              element: "div",
              className: "notificationDot",
              hidden: true,
              gid: "rt_notification_dot",
            },
          ],
        },
      ],
      eventListeners: [
        {
          event: "click",
          func: function () {
            _this.dialogElement.hidden = false;
          },
        },
      ],
    };
  }
  startup() {
    this.notificationDot = elements.getGPId("rt_notification_dot");
    this.notifications = [];
    sws.open(
      (isSecure() ? "wss://" : "ws://") +
        window.location.host +
        "/notifications",
      this.onMessage.bind(this)
    );
  }
  onMessage(e) {
    var data = e.data;
    var json = JSON.parse(data);
    try {
      if (json.type == "current") {
        this.notifications = json.notifications;
        this.notifications = this.notifications.slice(-100);
        this.loadNotifications();
      }
      if (json.type == "new") {
        this.notifications.push(json.notification);
        this.notifications = this.notifications.slice(-100);
        this.loadNotifications();
        var notification = json.notification;
        if (clientSettings.getSetting("UI_SOUNDS")) {
          sounds.play("notificationBell", 1);
        }
        if (
          notification.type == "test" &&
          clientSettings.getSetting("BELL_NOTIFCATIONS")
        ) {
          notify.sendIfNotOnScreen(
            "Testing",
            "Test notification",
            "New notification received"
          );
        }
        if (
          notification.type == "invite" &&
          clientSettings.getSetting("BELL_NOTIFCATIONS")
        ) {
          notify.sendIfNotOnScreen(
            "Chatroom Invitation",
            "@" +
              notification.from +
              ' has invited you to the chat room "' +
              notification.roomName +
              '"',
            "Invited to " + notification.roomName
          );
        }
      }
    } catch (e) {
      dialogs.alert(e);
    }
  }

  createNotificationDivJSON(notification) {
    var _this = this;
    return {
      element: "div",
      className: "notificationContainer",
    };
  }

  removeNotification(notification) {
    sws.send(
      JSON.stringify({
        type: "read",
        id: notification.id,
      })
    );
  }

  getRemoveButtonNotification(notification) {
    return {
      element: "div",
      className: "divButton roundborder",
      textContent: "Remove notification",
      eventListeners: [
        {
          event: "click",
          func: function () {
            sws.send(
              JSON.stringify({
                type: "read",
                id: notification.id,
              })
            );
          },
        },
      ],
    };
  }

  loadNotifications() {
    this.notificationDot.textContent = this.notifications.length;
    this.notificationDot.hidden = false;
    if (this.notifications.length < 1) {
      this.notificationDot.textContent = "";
      this.notificationDot.hidden = true;
    }
    var _this = this;
    elements.setInnerJSON(
      this.notificationDiv,
      this.notifications.map((notification) => {
        var div = _this.createNotificationDivJSON(notification);
        if (notification.type == "test") {
          div.children = [
            "Test notification",
            this.getRemoveButtonNotification(notification),
          ];
        }
        if (notification.type == "invite") {
          div.children = [
            {
              element: "span",
              style: {
                fontSize: "30px",
                fontWeight: "bold",
              },
              textContent: "Invited to " + notification.roomName,
            },
            {
              element: "br",
            },
            {
              element: "span",
              style: {
                fontWeight: "bold",
                color: "#007bff",
              },
              textContent: notification.from,
            },
            {
              element: "span",
              textContent: ' has invited you to join the chatroom "',
            },
            {
              element: "span",
              style: {
                fontWeight: "bold",
                color: "#007bff",
              },
              textContent: notification.roomName,
            },
            {
              element: "span",
              textContent: '"',
            },
            {
              element: "br",
            },
            {
              element: "span",
              textContent:
                "Click to remove this notifcation and also open your room list.",
            },
            {
              element: "br",
            },
            this.getRemoveButtonNotification(notification),
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Manage Rooms",
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    roomSelect.show();
                    _this.dialogElement.hidden = true;
                    _this.removeNotification(notification);
                  },
                },
              ],
            },
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Join room",
              eventListeners: [
                {
                  event: "click",
                  func: function () {
                    window.location.href = "/chat#" + notification.roomID;
                    _this.removeNotification(notification);
                  },
                },
              ],
            },
          ];
        }
        return div;
      })
    );
  }
}

module.exports = new RealTimeNotifications();
