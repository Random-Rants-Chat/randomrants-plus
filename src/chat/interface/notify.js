var notify = {};

var lastNotifcation = null;
var asked = false;

notify.requestPermission = async function () {
  try {
    notify.permission = await Notification.requestPermission();
    asked = true;
  } catch (e) {}
};

notify.sendIfNotOnScreen = function (tag, body, title = "Random Rants +") {
  if (document.visibilityState !== "visible") {
    if (lastNotifcation) {
      try {
        lastNotifcation.close();
      } catch (e) {}
    }
    try {
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "NOTIFY",
          payload: {
            title,
            body,
            tag,
            data: {
              targetURL: window.location.href,
            },
          },
        });
      } else {
        lastNotifcation = new Notification(title, {
          icon: "favicon.png",
          tag: tag,
          body: message,
        });
      }
    } catch (e) {}
  }
};

module.exports = notify;
