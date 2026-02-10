var lastValidationState = null;
var pushNotificationHelper = require("./pushhelper.js");
var cookieManager = {
  getAccountCookie() {
    return this.getCookie("account");
  },
  signoutAccountCookie() {
    return this.setCookie("account", "");
  },
  setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  },
  getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },
};

function getServerURL() {
  return new URL(window.location.href).origin;
}

async function checkSessionCookie() {
  try {
    var request = await fetch(getServerURL() + "/account/session", {
      method: "GET",
    });
    var json = await request.json();
    if (json.valid) {
      lastValidationState = json;
      return json;
    }
    lastValidationState = null;
    return false;
  } catch (e) {
    lastValidationState = null;
    return false;
  }
}

async function loginToAccount(username, password, robot_check_id) {
  var sendJSON = {
    username: username,
    password: password,
    robot_check_id,
  };
  var request = await fetch(getServerURL() + "/account/login", {
    method: "POST",
    body: JSON.stringify(sendJSON),
  });
  var json = await request.json();
  if (!json.valid) {
    throw new Error(json.message);
  }
}

async function signupAccount(username, password, robot_check_id) {
  var sendJSON = {
    username: username,
    password: password,
    robot_check_id,
  };
  var request = await fetch(getServerURL() + "/account/signup", {
    method: "POST",
    body: JSON.stringify(sendJSON),
  });
  var json = await request.json();
  if (!json.valid) {
    throw new Error(json.message);
  }
}

async function logoutOfAccount() {
  var request = await fetch(getServerURL() + "/account/logout", {
    method: "POST",
  });
}

function getProfilePictureURL(username) {
  return getServerURL() + "/account/picture/" + username;
}

function loginToAdmin() {
  var pr = window.prompt("Admin key:");
  cookieManager.setCookie("admin", pr);
}

function openLink(href, newTab) {
  var a = document.createElement("a");
  a.href = href;
  if (newTab) {
    a.target = "_blank";
  }
  a.click();
}

async function getJoinedRooms() {
  var a = await fetch(getServerURL() + "/account/myrooms");
  if (a.ok) {
    var b = await a.json();
    return b.rooms;
  } else {
    return [];
  }
}

async function removeJoinedRoom(id) {
  var a = await fetch(getServerURL() + "/account/removeroom", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
  return;
}

async function hasNewMail() {
  try {
    var a = await fetch(getServerURL() + "/account/mail");
    if (a.ok) {
      var json = await a.json();
      if (json.mail) {
        for (var message of json.mail) {
          if (message.new) {
            return true;
          }
        }
      }
      return false;
    }
    return false;
  } catch (e) {
    return false;
  }
}
function getCurrentValidationState() {
  return lastValidationState;
}

async function getPublicKey() {
  var response = await fetch(getServerURL() + "/webpush/key");
  var key = await response.text();
  return key.trim();
}

async function uploadPushSubscription(subscription) {
  var response = await fetch(getServerURL() + '/webpush/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error("Issue when sending subscription. Error: " +  await response.text());
      }
}

async function uploadRemovePushSubscription(subscription) {
  var response = await fetch(getServerURL() + '/webpush/unsubscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error("Issue when sending to remove subscription. Error: " +  await response.text());
      }
}

pushNotificationHelper.subscribe = async function (retry = false) {
  var subscription = await pushNotificationHelper.getSubscription();
  if (subscription && !retry) {
    return; //Already subscribed
  }
  var publicKey = await getPublicKey();
  subscription = await pushNotificationHelper.__subscribe(publicKey);
  await uploadPushSubscription(subscription);
};

pushNotificationHelper.unsubscribe = async function () {
  var subscription = await pushNotificationHelper.getSubscription();
  if (!subscription) {
    return; //No subscription
  }
  await pushNotificationHelper.__unsubscribe();
  await uploadRemovePushSubscription(subscription);
};

module.exports = {
  cookieManager,
  getServerURL,
  checkSessionCookie,
  loginToAccount,
  signupAccount,
  logoutOfAccount,
  getProfilePictureURL,
  loginToAdmin,
  openLink,
  hasNewMail,
  getCurrentValidationState,
  getJoinedRooms,
  removeJoinedRoom,
  getPublicKey,
  pushNotificationHelper
};
