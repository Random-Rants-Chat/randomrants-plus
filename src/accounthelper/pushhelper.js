//This file goes along with accounthelper.js
//Use accounthelper to get the full functions.
var pushNotificationHelper = {};
var _registerResolves = [];
var _registerRejects = [];
(async function () {
  pushNotificationHelper.registered = false;
  pushNotificationHelper.attempting = false;
  pushNotificationHelper.supported = false;
  if (!("serviceWorker" in navigator)) return;
  pushNotificationHelper.supported = true;
  pushNotificationHelper.attempting = true;
  try {
    var registration = await navigator.serviceWorker.register("/sw.bundle.js");
    console.log("ServiceWorker Registered: ", registration);
    pushNotificationHelper.registered = true;
  } catch (e) {
    window.alert("ServiceWorker Couldn't Register: " + e);
  }
  if (pushNotificationHelper.registered) {
    pushNotificationHelper.registration = registration;
    for (var resolve of _registerResolves) {
      resolve(registration);
    }
  } else {
    for (var rejects of _registerRejects) {
      rejects();
    }
  }
  _registerRejects = [];
  _registerResolves = [];
  pushNotificationHelper.attempting = false;
})();

pushNotificationHelper.register = function () {
  return new Promise((resolve, reject) => {
    if (pushNotificationHelper.attempting) {
      _registerRejects.push(resolve);
      _registerRejects.push(reject);
    } else {
      if (pushNotificationHelper.registration) {
        resolve(pushNotificationHelper.registration);
      } else {
        reject();
      }
    }
  });
};

pushNotificationHelper.getSubscription = async function () {
  var registration = pushNotificationHelper.registration;
  if (!registration) {
    return;
  }
  var subscription = await registration.pushManager.getSubscription();
  return subscription;
};

pushNotificationHelper.__subscribe = async function (publicKey) {
  var registration = pushNotificationHelper.registration;
  if (!registration) {
    return;
  }
  var subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: publicKey,
  });
  return subscription;
};

pushNotificationHelper.subscribe = async () => {
  window.alert(
    "pushNotificationHelper.subscribe needs to be overriden by accounthelper.",
  );
};

pushNotificationHelper.__unsubscribe = async function () {
  var registration = pushNotificationHelper.registration;
  if (!registration) {
    return;
  }
  var subscription = await pushNotificationHelper.getSubscription();
  var successful = await subscription.unsubscribe();
  if (!successful) {
    throw new Error("Unsubscribe was unsuccessful");
  }
};

pushNotificationHelper.unsubscribe = async () => {
  window.alert(
    "pushNotificationHelper.unsubscribe needs to be overriden by accounthelper.",
  );
};

module.exports = pushNotificationHelper;
