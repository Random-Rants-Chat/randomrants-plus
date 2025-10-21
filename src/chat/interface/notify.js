var notify = {};

(async function () {
  notify.permission = await Notification.requestPermission();
})();

var lastNotifcation = null;

notify.sendIfOnScreen = function (tag, message) {
  if (document.visibilityState !== "visible") {
    lastNotifcation = new Notification("Random Rants +", {
      icon: "favicon.png",
      tag: tag,
      body: message,
    });
  }
};

module.exports = notify;
