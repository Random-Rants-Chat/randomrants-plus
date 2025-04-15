var notify = {};

(async function () {
  notify.permission = await Notification.requestPermission();
})();

var lastNotifcation = null;

notify.sendIfOnScreen = function (tag, message) {
  if (document.visibilityState !== "visible") {
    if (lastNotifcation) {
      lastNotifcation.close();
    }
    lastNotifcation = new Notification("Random Rants +", {
      icon: "favicon.png",
      vibrate: [150, 60, 150],
      tag: tag,
      body: message,
    });
  }
};

module.exports = notify;
