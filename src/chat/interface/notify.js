var notify = {};

var lastNotifcation = null;

notify.requestPermission = async function () {
  try{
    notify.permission = await Notification.requestPermission();
  }catch(e){}
};

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
