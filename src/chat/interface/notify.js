var notify = {};

(async function () {
  notify.permission = await Notification.requestPermission();
})();

var lastNotifcation = null;

notify.sendIfNotOnScreen = function (tag, message, title = "Random Rants +") {
  if (document.visibilityState !== "visible") {
    if (lastNotifcation) {
      try {
        lastNotifcation.close();
      } catch (e) {}
    }
    lastNotifcation = new Notification(title, {
      icon: "favicon.png",
      tag: tag,
      body: message,
    });
  }
};

module.exports = notify;
