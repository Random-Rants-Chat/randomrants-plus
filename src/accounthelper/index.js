var lastValidationState = null;
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

async function loginToAccount(username, password) {
  var sendJSON = {
    username: username,
    password: password,
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

async function signupAccount(username, password) {
  var sendJSON = {
    username: username,
    password: password,
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
};
