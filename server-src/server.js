require("dotenv").config({ silent: true, quiet: true });
require("./initcounters.js");
var Busboy = require("busboy");
var http = require("http");
var https = require("https");
var fs = require("fs");
var ws = require("ws");
var path = require("path");
var JSZip = require("jszip");
var URL = require("url");
var wssHandler = require("./wss-handler.js");
var contentRange = require("content-range");
var encryptor = require("../encrypt");
var gvbbaseStorage = require("./waityourturn-storage.js"); //Supabase storage module.
var cons = require("./constants.js");
var bcrypt = require("bcryptjs");
var crypto = require("crypto");
var scratchCloudWss = require("./scratch-cloud.js");
var userMediaDirectory = "./usermedia";
var usersOnlineSockets = {};
var wssServerOptions = {
  //Options to prevent abuse.
  maxPayload: 1024 * 10,
  maxpayload: 1024 * 10,
};
try {
  fs.rmSync(userMediaDirectory, { directory: true, recursive: true });
} catch (e) {}
try {
  fs.mkdirSync(userMediaDirectory);
} catch (e) {
  console.log("Failed to make user media directory." + e);
}
var storage = new gvbbaseStorage(
  process.env.sbBucket,
  process.env.sbURL,
  process.env.sbAPIKey
);
var wss = wssHandler.wss;
var messageChatNumber = 0;
var commandHandler = require("./commands.js");
var usernameSafeChars = cons.USERNAME_CHAR_SET;
function closeUserFromUserSocket(username) {
  //Since the site has auto reconnect, this is basically a reload function.
  try {
    var sockets = usersOnlineSockets[username.toLowerCase().trim()];
    if (sockets) {
      sockets.forEach((socket) => {
        if (socket._rrIsReady) {
          socket.send(
            JSON.stringify({
              type: "userInfoChanged",
            })
          );
          socket.close(); //Ghost sockets would be closed anyways.
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
}
function getIPFromRequest(req) {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
}
async function checkServer() {
  try {
    try {
      await storage.downloadFile("server_check.txt");
      return true;
    } catch (e) {
      await storage.uploadFile(
        "server_check.txt",
        "used to check the servers with.",
        "text/plain"
      );
      return true;
    }
  } catch (e) {
    return false;
  }
}
function generateRandomStuff(randomLength = 8) {
  var timeComponent = Date.now().toString(36);
  var safeCharacters = "23456789abcdefghijkmnpqrstuvwxy";
  var randomComponent = "";

  for (var i = 0; i < randomLength; i++) {
    const randomIndex = Math.floor(Math.random() * safeCharacters.length);
    randomComponent += safeCharacters.charAt(randomIndex);
  }
  return `${timeComponent}z${randomComponent}`;
}
function setNoCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  /*res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );*/
}

async function doesUsernameExist(username) {
  if (!username) {
    return false;
  }
  if (typeof username !== "string") {
    return false;
  }
  if (username.trim().toLowerCase() !== username) {
    return false;
  }
  var i = 0;
  while (i < username.length) {
    if (usernameSafeChars.indexOf(username[i]) < 0) {
      return false;
    }
    i += 1;
  }
  try {
    var json = JSON.parse(
      (await storage.downloadFile(`user-${username}.json`)).toString()
    );
    if (json.destroyed) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

async function getUserProfilePicture(username) {
  var pfp = null;
  try {
    pfp = await storage.downloadFile(`user-${username}-profile`);
  } catch (e) {
    pfp = fs.readFileSync("template/default_pfp.png");
  }
  return pfp;
}
async function getUserProfilePictureResponse(username, req, res) {
  try {
    await storage.downloadFileResponseProxy(
      `user-${username}-profile`,
      {},
      res,
      ["content-type"]
    );
  } catch (e) {
    var pfp = fs.readFileSync("template/default_pfp.png");
    res.setHeader("content-type", "image/png");
    res.end(pfp);
  }
}

function waitBusboyFile(req, options) {
  return new Promise((accept, reject) => {
    var busboy = Busboy({ headers: req.headers, ...options });
    var fileBuffer = null;
    var fileInfo = {};
    busboy.on("file", (uname, file, uinfo) => {
      var chunks = [];

      file.on("data", (chunk) => {
        chunks.push(chunk);
      });

      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
        fileInfo = uinfo;
      });
    });

    busboy.on("finish", async () => {
      accept({
        buffer: fileBuffer,
        mimeType: fileInfo.mimeType,
      });
    });

    req.pipe(busboy);
  });
}

function generateRandom(length) {}

async function uploadUserProfilePicture(username, buffer, type) {
  if (buffer.length > cons.MAX_PROFILE_PICTURE_SIZE) {
    await storage.deleteFile(`user-${username}-profile`);
    return;
  }
  await storage.uploadFile(`user-${username}-profile`, buffer, type);
}

async function setUserProfilePicture(username) {
  var pfp = null;
  try {
    pfp = await storage.downloadFile(`user-${username}-profile`);
  } catch (e) {
    pfp = fs.readFileSync("template/default_pfp.png");
  }
  return pfp;
}

function checkUsername(username) {
  if (!username) {
    return false;
  }
  if (typeof username !== "string") {
    return false;
  }
  username = username.trim();
  if (username.indexOf(" ") > -1) {
    return false;
  }
  if (username.length < cons.MIN_USERNAME_LENGTH) {
    return false;
  }
  if (username.length > cons.MAX_USERNAME_LENGTH) {
    return false;
  }
  var i = 0;
  while (i < username.length) {
    if (usernameSafeChars.indexOf(username[i]) < 0) {
      return false;
    }
    i += 1;
  }
  return true;
}

function checkPassword(password) {
  if (!password) {
    return false;
  }
  if (typeof password !== "string") {
    return false;
  }
  password = password.trim();
  if (password.length < cons.MIN_PASSWORD_LENGTH) {
    return false;
  }
  if (password.length > cons.MAX_PASSWORD_LENGTH) {
    return false;
  }
  return true;
}

function generateSessionId() {
  return crypto.randomBytes(12).toString("base64");
}
function generateSessionObject(tokenString) {
  // This is the new, minimal, secure object structure
  return {
    id: tokenString,
    created: Date.now(), // CRITICAL: For reliable sorting/slicing
  };
}

async function validateUserCookie(decryptedUserdata) {
  if (!decryptedUserdata) {
    return {
      success: false,
      error: true,
      message: "Not signed in or account cookie is invalid",
    };
  }

  if (!checkUsername(decryptedUserdata.username)) {
    return {
      success: false,
      error: true,
      message: "Username isn't valid",
    };
  }

  if (!decryptedUserdata.session) {
    return {
      success: false,
      error: true,
      message: "No session",
    };
  }

  var username = decryptedUserdata.username.trim().toLowerCase();

  try {
    try {
      await storage.getFileStatus(`user-${username}.json`);
    } catch (e) {
      return {
        success: false,
        error: true,
        message:
          "Account user does not exist, or there was an internal server error.",
      };
    }
    var data = await storage.downloadFile(`user-${username}.json`);
    var json = JSON.parse(data);
    if (json.destroyed) {
      return {
        success: false,
        error: true,
        message: "This account was deactivated!",
      };
    }

    var color = "#000000";
    if (typeof json.color == "string") {
      color = json.color;
    }
    var font = "Arial";
    if (typeof json.font == "string") {
      font = json.font;
    }
    var displayName = username;
    if (typeof json.displayName == "string") {
      displayName = json.displayName;
    }

    if (!Array.isArray(json.sessions)) {
      json.sessions = [];
    }
    const currentSessionToken = decryptedUserdata.session;
    const isValidSession = json.sessions.some(
      (session) => session.id === currentSessionToken
    );
    if (isValidSession) {
      return {
        color,
        font,
        displayName,
        success: true,
        valid: true,
      };
    } else {
      return {
        success: false,
        error: true,
        message: "Session cookie is invalid.",
      };
    }
  } catch (e) {
    console.log(`Error validating session cookie ${e}.`);
    return {
      success: false,
      error: true,
      message: "Unknown server error.",
    };
  }
}

async function destroySessionCookie(decryptedUserdata) {
  if (!decryptedUserdata) {
    return false;
  }

  if (!checkUsername(decryptedUserdata.username)) {
    return false;
  }

  if (!decryptedUserdata.session) {
    return false;
  }

  var username = decryptedUserdata.username.trim().toLowerCase();
  var currentSession = decryptedUserdata.session;

  try {
    try {
      await storage.getFileStatus(`user-${username}.json`);
    } catch (e) {
      return false;
    }
    var data = await storage.downloadFile(`user-${username}.json`);
    var json = JSON.parse(data);
    if (!Array.isArray(json.sessions)) {
      json.sessions = [];
    }
    var sessions = json.sessions;
    const sessionIndex = sessions.findIndex(
      (session) => session.id === currentSession
    );
    if (sessionIndex > -1) {
      sessions.splice(sessionIndex, 1);
      json.sessions = sessions;
      await storage.uploadFile(
        `user-${username}.json`,
        JSON.stringify(json),
        "application/json"
      );
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(`Error destroying session cookie ${e}.`);
    return false;
  }
}

async function validateUser(username, password) {
  if (!username) {
    return {
      success: false,
      error: true,
      message: "Username must not be empty.",
    };
  }
  if (!password) {
    return {
      success: false,
      error: true,
      message: "Password must not be empty.",
    };
  }
  if (typeof username !== "string") {
    return {
      success: false,
      error: true,
      message: "Username is not string type.",
    };
  }
  if (typeof password !== "string") {
    return {
      success: false,
      error: true,
      message: "Password is not string type.",
    };
  }
  username = username.trim();
  password = password.trim();
  if (password.length < cons.MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Password must be greather than " +
        cons.MIN_PASSWORD_LENGTH +
        " characters.",
    };
  }
  if (password.length > cons.MAX_PASSWORD_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Password must be less than " +
        cons.MAX_PASSWORD_LENGTH +
        " characters.",
    };
  }
  if (username.indexOf(" ") > -1) {
    return {
      success: false,
      error: true,
      message: "Username must not contain spaces.",
    };
  }
  if (username.length < cons.MIN_USERNAME_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Username must be greather than " +
        cons.MIN_USERNAME_LENGTH +
        " characters.",
    };
  }
  if (username.length > cons.MAX_USERNAME_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Username must be less than " +
        cons.MAX_USERNAME_LENGTH +
        " characters.",
    };
  }
  var i = 0;
  while (i < username.length) {
    if (usernameSafeChars.indexOf(username[i]) < 0) {
      return {
        success: false,
        error: true,
        message: 'Username cant contain the character "' + username[i] + '"',
      };
    }
    i += 1;
  }
  var username = username.toLowerCase();
  try {
    try {
      await storage.getFileStatus(`user-${username}.json`);
    } catch (e) {
      return {
        success: false,
        error: true,
        message:
          "Account user does not exist, or there was an internal server error.",
      };
    }
    var data = await storage.downloadFile(`user-${username}.json`);
    var json = JSON.parse(data);

    if (json.destroyed) {
      return {
        success: false,
        error: true,
        message: "This account was deactivated!",
      };
    }

    if (await bcrypt.compare(password, json.password)) {
      var sessionString = generateSessionId();
      var newSession = generateSessionObject(sessionString);
      if (!Array.isArray(json.sessions)) {
        json.sessions = [];
      }
      json.sessions.push(newSession);
      json.sessions.sort((a, b) => a.created - b.created);
      json.sessions = json.sessions.slice(-cons.MAX_USER_SESSIONS);
      await storage.uploadFile(
        `user-${username}.json`,
        JSON.stringify(json),
        "application/json"
      );
      return {
        success: true,
        valid: true,
        session: sessionString, // Return the string for the cookie
      };
    } else {
      return {
        success: false,
        valid: false,
        error: true,
        message: "Invalid password for this account.",
      };
    }
  } catch (e) {
    return { success: false, error: true, message: e.toString() };
  }
}
async function createUser(username, password) {
  if (!username) {
    return {
      success: false,
      error: true,
      message: "Username must not be empty.",
    };
  }
  if (!password) {
    return {
      success: false,
      error: true,
      message: "Password must not be empty.",
    };
  }
  if (typeof username !== "string") {
    return {
      success: false,
      error: true,
      message: "Username is not string type.",
    };
  }
  if (typeof password !== "string") {
    return {
      success: false,
      error: true,
      message: "Password is not string type.",
    };
  }
  username = username.trim();
  password = password.trim();
  if (password.length < cons.MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Password must be greather than " +
        cons.MIN_PASSWORD_LENGTH +
        " characters.",
    };
  }
  if (password.length > cons.MAX_PASSWORD_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Password must be less than " +
        cons.MAX_PASSWORD_LENGTH +
        " characters.",
    };
  }
  if (username.indexOf(" ") > -1) {
    return {
      success: false,
      error: true,
      message: "Username must not contain spaces.",
    };
  }
  if (username.length < cons.MIN_USERNAME_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Username must be greather than " +
        cons.MIN_USERNAME_LENGTH +
        " characters.",
    };
  }
  if (username.length > cons.MAX_USERNAME_LENGTH) {
    return {
      success: false,
      error: true,
      message:
        "Username must be less than " +
        cons.MAX_USERNAME_LENGTH +
        " characters.",
    };
  }
  var username = username.toLowerCase();
  var i = 0;
  while (i < username.length) {
    if (usernameSafeChars.indexOf(username[i]) < 0) {
      return {
        success: false,
        error: true,
        message: 'Username cant contain the character "' + username[i] + '"',
      };
    }
    i += 1;
  }
  try {
    try {
      await storage.getFileStatus(`user-${username}.json`);
      return {
        success: false,
        error: true,
        message: "Account already exists!",
      };
    } catch (e) {
      var sessionString = generateSessionId();
      var newSession = generateSessionObject(sessionString);

      await storage.uploadFile(
        `user-${username}.json`,
        JSON.stringify({
          password: await bcrypt.hash(password, cons.BCRYPT_SALT_ROUNDS),
          bio: "",
          sessions: [newSession],
        }),
        "application/json"
      );
      return {
        success: true,
        valid: true,
        session: sessionString,
      };
    }
  } catch (e) {
    return {
      success: false,
      error: true,
      message: "Strange error trying to create user.",
    };
  }
}

async function validateUserCookiePassword(decryptedUserdata, password) {
  if (!decryptedUserdata) {
    return {
      success: false,
      error: true,
      message: "Not signed in or account cookie is invalid",
    };
  }

  if (!checkUsername(decryptedUserdata.username)) {
    return {
      success: false,
      error: true,
      message: "Username isn't valid",
    };
  }

  if (!decryptedUserdata.session) {
    return {
      success: false,
      error: true,
      message: "No session",
    };
  }

  var username = decryptedUserdata.username.trim().toLowerCase();

  try {
    try {
      await storage.getFileStatus(`user-${username}.json`);
    } catch (e) {
      return {
        success: false,
        error: true,
        message:
          "Account user does not exist, or there was an internal server error.",
      };
    }
    var data = await storage.downloadFile(`user-${username}.json`);
    var json = JSON.parse(data);

    if (json.destroyed) {
      return {
        success: false,
        error: true,
        message: "This account was deactivated!",
      };
    }

    var color = "#000000";
    if (typeof json.color == "string") {
      color = json.color;
    }
    var displayName = username;
    if (typeof json.displayName == "string") {
      displayName = json.displayName;
    }

    if (!Array.isArray(json.sessions)) {
      json.sessions = [];
    }
    const currentSessionToken = decryptedUserdata.session;
    const isValidSession = json.sessions.some(
      (session) => session.id === currentSessionToken
    );
    if (isValidSession) {
      if (await bcrypt.compare(password, json.password)) {
        return {
          color,
          displayName,
          success: true,
          valid: true,
        };
      } else {
        return {
          success: false,
          error: true,
          message: "Password is invalid",
        };
      }
    } else {
      return {
        success: false,
        error: true,
        message: "Session cookie is invalid.",
      };
    }
  } catch (e) {
    console.log(`Error validating session cookie ${e}.`);
    return {
      success: false,
      error: true,
      message: "Unknown server error.",
    };
  }
}

async function destroyAccount(username) {
  var data = await storage.downloadFile(`user-${username}.json`);
  var json = JSON.parse(data);

  json = {
    destroyed: true,
    color: "#d40000",
    displayName: "[DEACTIVATED]",
    password: "",
    sessions: [],
  };

  await storage.uploadFile(
    `user-${username}.json`,
    JSON.stringify(json),
    "application/json"
  );
  try {
    await storage.deleteFile(`user-${username}-profile`);
  } catch (e) {}
  try {
    await storage.deleteFile(`userlist-${username}.json`);
  } catch (e) {}
}

async function updateUserPassword(username, newPassword, oldPassword) {
  var data = await storage.downloadFile(`user-${username}.json`);
  var json = JSON.parse(data);

  var valid = await bcrypt.compare(oldPassword, json.password);
  if (!valid) {
    return;
  }

  json.password = await bcrypt.hash(newPassword, cons.BCRYPT_SALT_ROUNDS);

  var sessionString = generateSessionId();
  var newSession = generateSessionObject(sessionString);

  json.sessions = [newSession];

  await storage.uploadFile(
    `user-${username}.json`,
    JSON.stringify(json),
    "application/json"
  );
  return sessionString;
}
function doHTTPRequest(options, httpModule) {
  var _this = this;
  return new Promise((resolve, reject) => {
    var req = httpModule.request(options, (res) => {
      var data = [];
      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", () => {
        resolve({
          data: Buffer.concat(data),
          statusCode: res.statusCode,
          response: res,
        });
      });
    });

    req.end();
  });
}
function waitForBody(req) {
  return new Promise((accept, reject) => {
    var data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      accept(Buffer.concat(data));
    });
    req.on("error", () => {
      reject();
    });
  });
}
var mimeTypes = require("./mime.js");

function runStaticStuff(req, res, otheroptions) {
  var url = URL.parse(req.url);
  var pathname = url.pathname;

  setNoCorsHeaders(res);

  var file = path.join("./public/", pathname);
  if (file.split(".").length < 2) {
    var _lastfile = file.toString();
    file += ".html";
    if (!fs.existsSync(file)) {
      file = path.join(_lastfile, "/index.html");
    }
  }

  if (!fs.existsSync(file)) {
    file = "errors/404.html";
    res.statusCode = 404;
  }
  if (otheroptions) {
    if (typeof otheroptions.status == "number") {
      file = "errors/" + otheroptions.status + ".html";
      res.statusCode = otheroptions.status;
    }
  }

  var extension = file.split(".").pop().toLowerCase();

  var mime = mimeTypes[extension];
  if (mime) {
    res.setHeader("content-type", mime);
  }
  if (extension == "html" || extension == "js") {
    res.setHeader("Content-Type", mime + "; charset=utf-8");
    res.end(fs.readFileSync(file, { encoding: "utf-8" }));
  } else {
    fs.createReadStream(file).pipe(res);
  }
}
function getCookie(name, cookies) {
  try {
    var nameEQ = name + "=";
    var ca = cookies.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
  } catch (e) {}
  return null;
}

function insertPropsToString(txt, props) {
  var i = 0;
  var output = "";
  while (i < txt.length) {
    if (txt[i] == "[") {
      i += 1;
      var name = "";
      while (i < txt.length && txt[i] !== "]") {
        name += txt[i];
        i += 1;
      }
      if (props[name]) {
        output += props[name];
      } else {
        output += "[" + name + "]";
      }
    } else {
      if (txt[i] == "{") {
        i += 1;
        var name = "";
        while (i < txt.length && txt[i] !== "}") {
          name += txt[i];
          i += 1;
        }
        if (props[name]) {
          output += props[name].split("\n").join("<br>");
        } else {
          output += "{" + name + "}";
        }
      } else {
        if (txt[i] == "*") {
          i += 1;
          var name = "";
          while (i < txt.length && txt[i] !== "*") {
            name += txt[i];
            i += 1;
          }
          if (props[name]) {
            output += JSON.stringify(props[name]);
          } else {
            output += "*" + name + "*";
          }
        } else {
          output += txt[i];
        }
      }
    }
    i += 1;
  }
  return output;
}

var serverAvailable = false;
async function checkServerLoop() {
  serverAvailable = await checkServer();
  setTimeout(checkServerLoop, 3000);
}

function getCookieFromRequest(req) {
  return req.headers.cookie;
}

var writingMailTo = {};

function waitAsync(time) {
  return new Promise((accept) => {
    setTimeout(accept, time);
  });
}

async function writeMail(username, mailinfo, senderUsername) {
  //Returns true if successfull.
  try {
    //Wait if the mail is still being written to.
    if (typeof writingMailTo[username] !== "undefined") {
      while (writingMailTo[username] < 0) {
        await waitAsync(1);
      }
    }
    var profileFile = `user-${username}.json`;
    if (typeof writingMailTo[username] == "undefined") {
      writingMailTo[username] = 0;
    }
    writingMailTo[username] += 1;
    var profileRaw = await storage.downloadFile(profileFile);
    var json = JSON.parse(profileRaw.toString());
    if (!Array.isArray(json.mail)) {
      json.mail = [];
    }
    if (typeof senderUsername == "string") {
      if (Array.isArray(json.mailBlacklist)) {
        if (json.mailBlacklist.indexOf(senderUsername) > -1) {
          return false;
        }
      }
    }
    var time = new Date();
    json.mail.unshift({
      //Like push function, but adds to the first of the array.
      new: true,
      type: mailinfo.type,
      values: mailinfo.values,
      time: {
        year: time.getFullYear(),
        month: time.getMonth(),
        day: time.getDay(),
        hour: time.getHours(),
        minute: time.getMinutes(),
        second: time.getSeconds(),
      },
    });
    json.mail = json.mail.slice(0, cons.MAX_MAIL_SIZE); //Cut out any mail older than MAX_MAIL_SIZE variable indexes old.
    await storage.uploadFile(
      profileFile,
      JSON.stringify(json),
      "application/json"
    );
    writingMailTo[username] -= 1;
    if (writingMailTo[username] < 0) {
      writingMailTo[username] = 0;
    }
    return true;
  } catch (e) {
    writingMailTo[username] -= 1;
    if (writingMailTo[username] < 0) {
      writingMailTo[username] = 0;
    }
    return false;
  }
}
async function writeMailAsRead(username) {
  //Returns true if successfull.
  try {
    //Wait if the mail is still being written to.
    if (typeof writingMailTo[username] !== "undefined") {
      while (writingMailTo[username] < 0) {
        await waitAsync(1);
      }
    }
    var profileFile = `user-${username}.json`;
    if (typeof writingMailTo[username] == "undefined") {
      writingMailTo[username] = 0;
    }
    writingMailTo[username] += 1;
    var profileRaw = await storage.downloadFile(profileFile);
    var json = JSON.parse(profileRaw.toString());
    if (!Array.isArray(json.mail)) {
      json.mail = [];
    }
    for (var message of json.mail) {
      message.new = false;
    }
    await storage.uploadFile(
      profileFile,
      JSON.stringify(json),
      "application/json"
    );
    writingMailTo[username] -= 1;
    if (writingMailTo[username] < 0) {
      writingMailTo[username] = 0;
    }
    return true;
  } catch (e) {
    writingMailTo[username] -= 1;
    if (writingMailTo[username] < 0) {
      writingMailTo[username] = 0;
    }
    return false;
  }
}

async function clearMail(username) {
  //Returns true if successfull.
  try {
    //Wait if the mail is still being written to.
    if (typeof writingMailTo[username] !== "undefined") {
      while (writingMailTo[username] < 0) {
        await waitAsync(1);
      }
    }
    var profileFile = `user-${username}.json`;
    if (typeof writingMailTo[username] == "undefined") {
      writingMailTo[username] = 0;
    }
    writingMailTo[username] += 1;
    var profileRaw = await storage.downloadFile(profileFile);
    var json = JSON.parse(profileRaw.toString());
    json.mail = [];
    await storage.uploadFile(
      profileFile,
      JSON.stringify(json),
      "application/json"
    );
    writingMailTo[username] -= 1;
    if (writingMailTo[username] < 0) {
      writingMailTo[username] = 0;
    }
    return true;
  } catch (e) {
    writingMailTo[username] -= 1;
    if (writingMailTo[username] < 0) {
      writingMailTo[username] = 0;
    }
    return false;
  }
}

function isGuestAccount(userdata) {
  if (userdata.guestID) {
    return true;
  } else {
    return false;
  }
}

var roomWebsockets = {};
var defaultRooms = [];
var defaultRoomNames = [];

async function getRoomInfo(id) {
  var defaultRoomIndex = defaultRooms.indexOf(id);
  if (defaultRoomIndex > -1) {
    return {
      name: defaultRoomNames[defaultRoomIndex],
      owners: [],
    };
  }
  try {
    var info = await storage.downloadFile(`room-${id}-info.json`);
    return JSON.parse(info.toString());
  } catch (e) {
    return null;
  }
}

function generateGuestUsername() {
  return `Guest${Math.round(Date.now() * 10)}`;
}

function getFormattedTime() {
  const now = new Date();

  let hours = now.getHours();
  const minutes = now.getMinutes();

  // Determine AM/PM suffix
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour format to 12-hour format
  hours = hours % 12;
  if (hours === 0) hours = 12; // Handle midnight as 12 instead of 0

  // Format minutes to always be two digits
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // Return formatted time as "10:00 PM"
  return `${hours}:${formattedMinutes} ${ampm}`;
}

function terminateGhostSockets(ws) {
  var isAlive = true;
  var terminated = false;

  function heartbeat() {
    isAlive = true;
  }

  ws.on("pong", heartbeat);

  var interval = setInterval(() => {
    if (!isAlive) {
      if (!terminated) {
        terminated = true;
        clearInterval(interval);
        ws.terminate();
        //ws.emit("close");
      }
      return;
    }

    isAlive = false;
    try {
      ws.ping();
    } catch (err) {
      if (!terminated) {
        terminated = true;
        clearInterval(interval);
        ws.terminate();
        //ws.emit("close");
      }
    }
  }, 1500); // Check every 1500 miliseconds.

  ws.on("close", () => {
    if (!terminated) {
      terminated = true;
      clearInterval(interval);
    }
  });

  try {
    ws.ping();
  } catch (err) {
    // Socket might already be broken
    if (!terminated) {
      terminated = true;
      clearInterval(interval);
      ws.terminate();
    }
  }
}

var noRoomWss = new ws.WebSocketServer({ noServer: true, ...wssServerOptions });

noRoomWss.on("connection", (ws, request) => {
  ws.send(
    JSON.stringify({
      type: "doesNotExist",
    })
  );
  var timeout = setTimeout(() => {
    ws.close();
  }, 4000);
  ws.on("close", () => {
    clearTimeout(timeout);
  });
});

var noRoomWss = new ws.WebSocketServer({ noServer: true, ...wssServerOptions });

noRoomWss.on("connection", (ws, request) => {
  ws.send(
    JSON.stringify({
      type: "doesNotExist",
    })
  );
  var timeout = setTimeout(() => {
    ws.close();
  }, 4000);
  ws.on("close", () => {
    clearTimeout(timeout);
  });
});

var roomStillLoadingWss = new ws.WebSocketServer({
  noServer: true,
  ...wssServerOptions,
});

roomStillLoadingWss.on("connection", (ws, request) => {
  ws.send(
    JSON.stringify({
      type: "roomStillLoading",
    })
  );
  var timeout = setTimeout(() => {
    ws.close();
  }, 4000);
  ws.on("close", () => {
    clearTimeout(timeout);
  });
});

var _websocketIDCounter = 0;
function generateWebsocketID() {
  _websocketIDCounter += 1;
  return _websocketIDCounter + "_" + Math.round(Math.random() * 9999999);
}

var notifyWSS = new ws.WebSocketServer({ noServer: true, ...wssServerOptions });
var notificationsForUsers = {};
var notificationUserTimeouts = {};
notifyWSS.on("connection", (ws, request) => {
  (async function () {
    var usercookie = getCookie("account", getCookieFromRequest(request));
    if (usercookie) {
      var decryptedUserdata = encryptor.decrypt(usercookie);
      decryptedUserdata.username = (decryptedUserdata.username || "")
        .toLowerCase()
        .trim();
      var validation = await validateUserCookie(decryptedUserdata);
      if (validation.valid) {
        ws._rrUsername = decryptedUserdata.username.toLowerCase().trim();
        ws._rrDisplayName = validation.displayName;
      } else {
        ws.terminate();
        return;
      }
    } else {
      ws.terminate();
      return;
    }
    terminateGhostSockets(ws);
    if (!notificationsForUsers[ws._rrUsername]) {
      notificationsForUsers[ws._rrUsername] = [];
    }
    clearTimeout(notificationUserTimeouts[ws._rrUsername]);
    notificationUserTimeouts[ws._rrUsername] = undefined;
    ws.on("message", (data) => {
      var json = JSON.parse(data.toString());
      if (json.type == "read") {
        if (typeof json.id == "number") {
          notificationsForUsers[ws._rrUsername] = notificationsForUsers[
            ws._rrUsername
          ].filter((n) => json.id !== n.id);
          for (var client of notifyWSS.clients) {
            if (client._rrUsername == ws._rrUsername) {
              client.send(
                JSON.stringify({
                  type: "current",
                  notifications: notificationsForUsers[ws._rrUsername],
                })
              );
            }
          }
        }
      }
      if (json.type == "readAll") {
        notificationsForUsers[ws._rrUsername] = [];
        for (var client of notifyWSS.clients) {
          if (client._rrUsername == ws._rrUsername) {
            client.send(
              JSON.stringify({
                type: "current",
                notifications: notificationsForUsers[ws._rrUsername],
              })
            );
          }
        }
      }
    });
    ws.on("close", () => {
      notificationUserTimeouts[ws._rrUsername] = setTimeout(
        () => {
          notificationsForUsers[ws._rrUsername] = undefined;
          notificationUserTimeouts[ws._rrUsername] = undefined;
        },
        1000 * 60 * 10
      ); //10 Minutes before all notifications are cleared.
    });
    ws.send(
      JSON.stringify({
        type: "current",
        notifications: notificationsForUsers[ws._rrUsername],
      })
    );
  })();
});
function sendNotify(username, notifyjson = {}) {
  if (!notificationsForUsers[username]) {
    notificationsForUsers[username] = [];
  }
  var notifyContent = {
    id: Date.now(),
    ...notifyjson,
  };
  notificationsForUsers[username].push(notifyContent);
  notificationsForUsers[username] = notificationsForUsers[username].slice(
    -cons.MAX_NOTIFICATIONS
  );
  for (var client of notifyWSS.clients) {
    if (client._rrUsername == username.trim()) {
      client.send(
        JSON.stringify({
          type: "new",
          notification: notifyContent,
        })
      );
    }
  }
}

async function startRoomWSS(roomid) {
  var wss = new ws.WebSocketServer({ noServer: true, ...wssServerOptions });
  roomWebsockets[roomid.toString()] = "loading";
  var info = await getRoomInfo(roomid);
  if (!info) {
    roomWebsockets[roomid.toString()] = undefined;
    return "NO_ROOM";
  }
  info = applyNewRoomPermissionValues(info); //Apply the new permission stuff if not done yet.
  wss._rrRoomPermissions = info.permissions;
  wss._rrRoomMessages = [];
  wss._rrPeopleCount = 0;
  function hasPermission(permName, ws) {
    //Not ready, h o p e f u l l y this does not break things when not ready.
    if (!ws._rrIsReady) {
      return false;
    }
    //Everyone is definite true.
    if (wss._rrRoomPermissions[permName] == "everyone") {
      return true;
    }
    //Owner needs to check if has the ownership.
    if (wss._rrRoomPermissions[permName] == "owner" && ws._rrIsOwner) {
      return true;
    }
    //None or an invalid value is false.
    return false;
  }
  wss._rrHasPermission = hasPermission; //For the command handler.
  function checkBanAndUserList(ws) {
    if (!ws._rrUsername) {
      if (!info.allowGuests) {
        ws.send(
          JSON.stringify({
            type: "noGuests",
          })
        );
        ws._rrBlockedConnection = true;
        ws._rrCloseAndTerminate();
        return true;
      }
    }

    var banned = false;
    if (info.banList.indexOf(ws._rrUsername) > -1) {
      banned = true;
    }
    if (ws._rrIsRealOwner) {
      banned = false;
    }
    if (banned) {
      ws.send(
        JSON.stringify({
          type: "banned",
        })
      );
      ws._rrBlockedConnection = true;
      ws._rrCloseAndTerminate();
      return true;
    }
    return false;

    var allowed = true;
    if (info.allowList.indexOf(ws._rrUsername) < 0) {
      allowed = false;
    }
    if (info.allowList.length < 1) {
      allowed = true;
    }
    if (ws._rrIsRealOwner) {
      allowed = true;
    }
    if (!allowed) {
      ws.send(
        JSON.stringify({
          type: "notInAllowList",
        })
      );
      ws._rrBlockedConnection = true;
      ws._rrCloseAndTerminate();
      return true;
    }
  }
  var _currentOnlineListMessage = "";
  var _currentOnlineListMessageOwner = "";
  function sendOnlineList() {
    var userlist = [];
    for (var cli of wss.clients) {
      if (cli._rrIsReady) {
        var isMicEnabled = false;
        if (cli._rrMicCode) {
          isMicEnabled = true;
        }

        var isCamEnabled = false;
        if (cli._rrCameraCode) {
          isCamEnabled = true;
        }
        userlist.push({
          username: cli._rrUsername,
          displayName: cli._rrDisplayName,
          time: cli._rrJoinTime,
          color: cli._rrUserColor,
          font: cli._rrUserFont,
          isOwner: cli._rrIsOwner,
          isRealOwner: cli._rrIsRealOwner,
          micEnabled: isMicEnabled,
          camEnabled: isCamEnabled,
        });
      }
    }
    var onlist = JSON.stringify({
      //this verison of the message is sent to owners.
      type: "onlineList",
      list: userlist,
      owners: info.owners, //First owner can't be removed.
      allowed: info.allowList,
      bans: info.banList,
    });
    var onlistNonOwner = JSON.stringify({
      type: "onlineList",
      list: userlist,
    });
    _currentOnlineListMessage = onlistNonOwner;
    _currentOnlineListMessageOwner = onlist;
    wss.clients.forEach((cli) => {
      if (!cli._rrIsReady) {
        return;
      }
      if (cli._rrIsOwner) {
        cli.send(onlist);
      } else {
        cli.send(onlistNonOwner);
      }
    });
  }
  function sendRoomChatMessage(displayName, message, dontStore) {
    if (!dontStore) {
      messageChatNumber += 1;
      wss._rrRoomMessages.push({
        displayName,
        isServer: true,
        message: message,
      });
    }
    wss._rrRoomMessages = wss._rrRoomMessages.slice(-cons.MAX_STORED_MESSAGES);
    wss.clients.forEach((cli) => {
      if (!cli._rrIsReady) {
        return;
      }
      cli.send(
        JSON.stringify({
          type: "newMessage",
          message: message,
          isServer: true,
          displayName,
        })
      );
    });
  }

  function sendPermData(ws) {
    //Permission update needs to check permissions for each socket.
    var socketPerms = {};
    for (var name of Object.keys(wss._rrRoomPermissions)) {
      socketPerms[name] = hasPermission(name, ws);
    }
    ws.send(
      JSON.stringify({
        type: "roomPermissions",
        perms: socketPerms,
      })
    );

    if (ws._rrIsOwner) {
      //Specifically for the room settings, send permission levels.
      ws.send(
        JSON.stringify({
          type: "roomPermissionSettings",
          perms: wss._rrRoomPermissions,
        })
      );
    }
  }

  var currentScreenshareCode = null;
  var currentMediaEmbedURL = "";
  var currentScreensharingWebsocket = null;
  var connectionIDCount = 0;
  wss._rrCommandHandler = new commandHandler(wss);
  wss.on("connection", (ws, request) => {
    ws._rrCloseAndTerminate = function () {
      try {
        var terminateTimeout = setTimeout(() => {
          ws.terminate();
        }, 70);
        ws.on("close", () => {
          clearTimeout(terminateTimeout);
        });
        ws.close();
      } catch (e) {}
    };
    ws._rrConnectionID = connectionIDCount;
    ws._rrLastMessageTime = Date.now();
    connectionIDCount += 1;
    (async function () {
      ws.server = wss;
      ws._rrWsID = generateWebsocketID();
      ws._rrIsOwner = false;
      ws._rrIsRealOwner = false;
      var usercookie = getCookie("account", getCookieFromRequest(request));
      var displayName = generateGuestUsername();
      ws._rrUserColor = "#000000";
      ws._rrUserFont = "Arial";
      ws._rrRenameDisplayName = function (newName) {
        displayName = newName;
        ws._rrDisplayName = newName;
      };
      if (usercookie) {
        var decryptedUserdata = encryptor.decrypt(usercookie);
        decryptedUserdata.username = (decryptedUserdata.username || "")
          .toLowerCase()
          .trim();
        var validation = await validateUserCookie(decryptedUserdata);
        for (var cli of wss.clients) {
          if (cli._rrUsername && cli._rrLoggedIn) {
            if (cli._rrUsername.toLowerCase() == decryptedUserdata.username) {
              ws.send(JSON.stringify({ type: "usernameExists" }));
              ws.close();
              return;
            }
          }
        }
        if (validation.valid) {
          ws._rrLoggedIn = true;
          displayName = validation.displayName;
          ws._rrDisplayName = validation.displayName;
          ws._rrUserData = decryptedUserdata;
          ws._rrUsername = decryptedUserdata.username;
          ws._rrUserColor = validation.color;
          ws._rrUserFont = validation.font;
          if (info.owners.indexOf(decryptedUserdata.username) > -1) {
            ws._rrIsOwner = true;
            if (info.owners.indexOf(decryptedUserdata.username) == 0) {
              ws._rrIsRealOwner = true;
            }
          }
          var userOnlineSockets = usersOnlineSockets[ws._rrUsername];
          var isArray = Array.isArray(userOnlineSockets);
          if (isArray) {
            if (
              usersOnlineSockets[ws._rrUsername].length >=
              cons.MAX_SOCKETS_PER_USER
            ) {
              ws._rrIsReady = false;
              ws.send(
                JSON.stringify({
                  type: "tooManyConnections",
                })
              );
              setTimeout(() => {
                try {
                  ws.terminate();
                } catch (e) {}
              }, 100);
              return;
            }
          }
          if (!isArray) {
            usersOnlineSockets[ws._rrUsername] = [ws];
          } else {
            usersOnlineSockets[ws._rrUsername].push(ws);
          }
        } else {
          ws._rrLoggedIn = false;
          ws._rrDisplayName = displayName;
        }
      } else {
        ws._rrLoggedIn = false;
        ws._rrDisplayName = displayName;
      }
      if (!ws._rrLoggedIn) {
        var userID = "IP " + getIPFromRequest(request);

        ws._rrGuestID = userID;

        var userOnlineSockets = usersOnlineSockets[userID];
        var isArray = Array.isArray(userOnlineSockets);
        if (isArray) {
          if (
            usersOnlineSockets[userID].length >= cons.MAX_SOCKETS_PER_GUEST_IP
          ) {
            ws._rrIsReady = false;
            ws.send(
              JSON.stringify({
                type: "tooManyConnections",
              })
            );
            setTimeout(() => {
              try {
                ws.terminate();
              } catch (e) {}
            }, 100);
            return;
          }
        }
        if (!isArray) {
          usersOnlineSockets[userID] = [ws];
        } else {
          usersOnlineSockets[userID].push(ws);
        }
      }
      ws._rrDisplayName = displayName;
      ws._rrJoinTime = getFormattedTime();
      ws._rrCameraCode = null;
      ws._rrOtherCams = {};
      ws._rrMicCode = null;
      ws._rrOtherMics = {};

      if (checkBanAndUserList(ws)) {
        return; //If the function returns true, then it terminates the connection.
      }

      ws._rrIsReady = true;
      ws.send(
        JSON.stringify({
          type: "media",
          command: "reset",
        })
      );
      var lastMicCode = null;
      var lastCamCode = null;
      //Initial send media content if neccesary
      var _isMediaRunning = false;
      if (currentScreenshareCode) {
        ws.send(
          JSON.stringify({
            type: "media",
            command: "screenshareRun",
            code: currentScreenshareCode,
          })
        );
        _isMediaRunning = true;
      }
      if (currentMediaEmbedURL) {
        ws.send(
          JSON.stringify({
            type: "media",
            command: "mediaEmbedRun",
            url: currentMediaEmbedURL,
          })
        );
        _isMediaRunning = true;
      }
      if (!_isMediaRunning) {
      }
      ws._rrkeepAliveTimeout = null;
      terminateGhostSockets(ws);
      ws.on("message", (data) => {
        try {
          var json = JSON.parse(data.toString());
        } catch (e) {
          console.log(`Websocket json decode error: ${e}`);
          return;
        }
        try {
          if (json.type == "reaction" && hasPermission("reactions", ws)) {
            if (typeof json.emoji !== "string") {
              return;
            }
            if (json.emoji.length > 140) {
              //It should be pretty small for it.
              return;
            }
            for (var client of wss.clients) {
              client.send(
                JSON.stringify({
                  type: "reaction",
                  username: ws._rrUsername,
                  displayName: ws._rrDisplayName,
                  color: ws._rrUserColor,
                  font: ws._rrUserFont,
                  emoji: json.emoji,
                })
              );
            }
          }
          if (json.type == "onlineList") {
            if (ws._rrIsOwner) {
              ws.send(_currentOnlineListMessageOwner);
            } else {
              ws.send(_currentOnlineListMessage);
            }
          }
          if (json.type == "typing") {
            for (var client of wss.clients) {
              client.send(
                JSON.stringify({
                  type: "typing",
                  username: ws._rrUsername,
                  displayName: ws._rrDisplayName,
                  color: ws._rrUserColor,
                  font: ws._rrUserFont,
                })
              );
            }
          }
          if (
            json.type == "playSoundboard" &&
            hasPermission("soundboard", ws)
          ) {
            for (var client of wss.clients) {
              client.send(
                JSON.stringify({
                  type: "playSoundboard",
                  index: json.index,
                  mult: json.mult,
                  displayName: ws._rrDisplayName,
                  username: ws._rrUsername,
                })
              );
            }
          }
          if (
            json.type == "stopSoundboard" &&
            hasPermission("soundboard", ws)
          ) {
            for (var client of wss.clients) {
              client.send(
                JSON.stringify({
                  type: "stopSoundboard",
                })
              );
            }
          }
          if (json.type == "setCameraCode") {
            if (typeof json.code == "string") {
              ws._rrCameraCode = json.code;
            } else {
              ws._rrCameraCode = null;
            }
            if (ws._rrCameraCode !== lastCamCode) {
              sendOnlineList();
              lastCamCode = ws._rrCameraCode;
            }
          }
          if (json.type == "setMicrophoneCode") {
            if (typeof json.code == "string") {
              ws._rrMicCode = json.code;
            } else {
              ws._rrMicCode = null;
            }
            if (ws._rrMicCode !== lastMicCode) {
              sendOnlineList();
              lastMicCode = ws._rrMicCode;
            }
          }
          if (json.type == "refresh" && ws._rrIsOwner) {
            for (var client of wss.clients) {
              client.terminate();
            }
            wss.close();
            roomWebsockets[roomid.toString()] = undefined;
          }
          if (json.type == "media") {
            function resetMediaValues() {
              currentScreenshareCode = null;
              currentScreensharingWebsocket = null;
              currentMediaEmbedURL = null;
            }
            if (json.command == "mediaResetRequest") {
              resetMediaValues();
              wss.clients.forEach((cli) => {
                if (!cli._rrIsReady) {
                  return;
                }
                var fromSelf = false;
                if (cli == ws) {
                  fromSelf = true;
                }
                cli.send(
                  JSON.stringify({
                    type: "media",
                    command: "reset",
                    fromSelf,
                  })
                );
              });
            }
            if (
              json.command == "screenshareRunning" &&
              hasPermission("media", ws)
            ) {
              resetMediaValues();
              currentScreenshareCode = json.code;
              currentScreensharingWebsocket = ws._rrConnectionID;
              currentMediaEmbedURL = null;
              wss.clients.forEach((cli) => {
                if (!cli._rrIsReady) {
                  return;
                }
                cli.send(
                  JSON.stringify({
                    type: "media",
                    command: "screenshareRun",
                    code: currentScreenshareCode,
                  })
                );
              });
            }
            if (
              json.command == "mediaEmbedRunning" &&
              hasPermission("media", ws)
            ) {
              if (typeof json.url !== "string") {
                return;
              }
              if (json.url.length < 1) {
                return;
              }
              if (json.url.length > 700) {
                return;
              }
              resetMediaValues();
              currentScreenshareCode = null;
              currentMediaEmbedURL = json.url;
              wss.clients.forEach((cli) => {
                if (!cli._rrIsReady) {
                  return;
                }
                cli.send(
                  JSON.stringify({
                    type: "media",
                    command: "mediaEmbedRun",
                    url: currentMediaEmbedURL,
                  })
                );
              });
            }
          }
          if (json.type == "isTyping") {
            wss.clients.forEach((cli) => {
              if (!cli._rrIsReady) {
                return;
              }
              cli.send(
                JSON.stringify({
                  type: "userIsTyping",
                  displayName: displayName,
                  username: ws._rrUsername,
                  color: ws._rrUserColor,
                  font: ws._rrUserFont,
                })
              );
            });
          }
          if (json.type == "postMessagePrivate") {
            if (
              typeof json.message == "string" &&
              typeof json.targetUser == "string"
            ) {
              var targetUser = json.targetUser.trim();
              if (!checkUsername(targetUser)) {
                ws.send(
                  JSON.stringify({
                    type: "newMessage",
                    message: "The username to send to is invalid.",
                    isServer: true,
                    displayName: "[Notice]",
                  })
                );
                return;
              }
              if (json.message.length > cons.MAX_MESSAGE_SIZE) {
                ws.send(
                  JSON.stringify({
                    type: "newMessage",
                    message:
                      "The private message you tried to post is too long.[br]The message was not posted.",
                    isServer: true,
                    displayName: "[Notice]",
                  })
                );
                return;
              }
              var messageJson = JSON.stringify({
                type: "newMessage",
                message:
                  "[color css=yellow]For [bold]@" +
                  targetUser +
                  "[/bold]: [/color]" +
                  json.message,
                username: ws._rrUsername,
                displayName: displayName,
                color: ws._rrUserColor,
                font: ws._rrUserFont,
              });
              var wasSent = false;
              wss.clients.forEach((cli) => {
                if (!cli._rrIsReady) {
                  return;
                }
                if (cli._rrUsername == targetUser) {
                  if (cli._rrUsername !== ws._rrUsername) {
                    cli.send(messageJson);
                  }
                  wasSent = true;
                }
              });

              if (wasSent) {
                ws.send(messageJson); //Display the message to the sender so that they know it posted.
              } else {
                ws.send(
                  JSON.stringify({
                    type: "newMessage",
                    message:
                      "The private message wasn't sent because the username was not found in this room.",
                    isServer: true,
                    displayName: "[Notice]",
                  })
                );
              }
            }
          }
          if (json.type == "postMessage") {
            var commandResult = null;
            if (hasPermission("commands", ws)) {
              commandResult = wss._rrCommandHandler.handleMessage(
                ws,
                json.message
              );
            }
            if (commandResult !== commandHandler.HIDE_MESSAGE) {
              if (typeof json.message == "string") {
                if (json.message.length > cons.MAX_MESSAGE_SIZE) {
                  ws.send(
                    JSON.stringify({
                      type: "newMessage",
                      message:
                        "The message you tried to post is too long.[br]The message was not posted.",
                      isServer: true,
                      displayName: "[Notice]",
                    })
                  );
                  return;
                }
                wss.clients.forEach((cli) => {
                  if (!cli._rrIsReady) {
                    return;
                  }
                  cli.send(
                    JSON.stringify({
                      type: "newMessage",
                      message: json.message,
                      username: ws._rrUsername,
                      displayName: displayName,
                      color: ws._rrUserColor,
                      font: ws._rrUserFont,
                    })
                  );
                });

                if (!json.message.trim().startsWith(";")) {
                  //Filter out command messages in history.
                  messageChatNumber += 1;
                  wss._rrRoomMessages.push({
                    displayName: displayName,
                    username: ws._rrUsername,
                    message: json.message,
                    color: ws._rrUserColor,
                    font: ws._rrUserFont,
                  });
                  ws._rrLastMessagePosted = json.message;
                  wss._rrRoomMessages = wss._rrRoomMessages.slice(-50);
                }
              }
            }
          }
        } catch (e) {
          console.log(`Websocket message script error: ${e}`);
        }
      });
      ws.send(JSON.stringify({ type: "ready" }));
      ws.send(
        JSON.stringify({
          type: "messages",
          messages: wss._rrRoomMessages,
        })
      );
      if (info.owners.indexOf(ws._rrUsername) > -1) {
        ws.send(
          JSON.stringify({
            type: "isOwner",
            isOwner: true,
          })
        );
        ws._rrIsOwner = true;
      } else {
        ws.send(
          JSON.stringify({
            type: "isOwner",
            isOwner: false,
          })
        );
      }

      ws.send(
        JSON.stringify({
          type: "allowGuests",
          allow: info.allowGuests,
        })
      );

      ws.send(
        JSON.stringify({
          type: "roomName",
          name: info.name,
          description: info.description || "",
          id: roomid,
        })
      );
      ws.send(
        JSON.stringify({
          type: "updateTheme",
          index: info.theme || 0,
        })
      );
      sendOnlineList();
      sendPermData(ws);
      sendRoomChatMessage(
        "[Notice]",
        `[font family=${ws._rrUserFont}]${displayName}[/font] has joined the room.`,
        true
      );
      if (wss._rrEndRoomTimeout) {
        clearTimeout(wss._rrEndRoomTimeout); //Clear the timeout after a new websocket hops in.
        wss._rrEndRoomTimeout = null;
      }
      wss._rrPeopleCount += 1;
      ws.on("close", () => {
        clearTimeout(ws._rrkeepAliveTimeout);
        wss._rrPeopleCount -= 1;
        if (wss._rrPeopleCount < 1) {
          wss._rrPeopleCount = 0;
          if (wss._rrEndRoomTimeout) {
            //Avoid any double timeouts.
            clearTimeout(wss._rrEndRoomTimeout);
          }
          wss._rrEndRoomTimeout = setTimeout(
            wss._rrEndRoom,
            cons.ROOM_CLEANUP_TIMEOUT
          ); //Destory the room websocket, but not the room data after the period of inactivity.
        }
        sendOnlineList();
        sendRoomChatMessage(
          "[Notice]",
          `[font family=${ws._rrUserFont}]${displayName}[/font] has left the room.`,
          true
        );
        if (ws._rrConnectionID == currentScreensharingWebsocket) {
          currentScreenshareCode = null;
          currentScreensharingWebsocket = null;
          wss.clients.forEach((cli) => {
            if (!cli._rrIsReady) {
              return;
            }
            cli.send(
              JSON.stringify({
                type: "media",
                command: "screenshareStop",
              })
            );
          });
        }
        var userID = ws._rrLoggedIn ? ws._rrUsername : ws._rrGuestID;
        var userOnlineSockets = usersOnlineSockets[userID];
        if (Array.isArray(userOnlineSockets)) {
          var newUserOnlineSockets = userOnlineSockets.filter((socket) => {
            if (socket._rrWsID == ws._rrWsID) {
              return false;
            } else {
              return true;
            }
          });
          if (newUserOnlineSockets.length < 1) {
            usersOnlineSockets[userID] = undefined;
            //Filter out undefined values.
            var newVal = {};
            for (var socketUsername of Object.keys(usersOnlineSockets)) {
              if (usersOnlineSockets[socketUsername]) {
                newVal[socketUsername] = usersOnlineSockets[socketUsername];
              }
            }
            usersOnlineSockets = newVal;
          } else {
            usersOnlineSockets[userID] = newUserOnlineSockets;
          }
        }
      });
    })();
  });

  wss._rrEndRoom = function () {
    wss._rrStopRoom();
    roomWebsockets[roomid.toString()] = undefined;
  };

  wss._rrEndRoomTimeout = setTimeout(wss._rrEndRoom, cons.ROOM_CLEANUP_TIMEOUT);

  wss._rrStopRoom = function () {
    for (var client of wss.clients) {
      client._rrCloseAndTerminate();
    }
    wss.close();
    clearInterval(wss._rrKeepAliveInterval);
    if (wss._rrEndRoomTimeout) {
      //Avoid any double timeouts.
      clearTimeout(wss._rrEndRoomTimeout);
    }
    roomWebsockets[roomid.toString()] = undefined;
  };

  wss._rrReloadUserlist = function () {
    sendOnlineList();
  };

  wss._rrRefreshRoom = function () {
    wss._rrStopRoom();
    roomWebsockets[roomid.toString()] = undefined;
  };

  wss._rrKickUser = function (username) {
    for (var client of wss.clients) {
      if (client._rrUsername == username) {
        client.close();
        return;
      }
    }
  };

  wss._rrUpdateRoomInfo = async function () {
    info = await getRoomInfo(roomid);

    for (var client of wss.clients) {
      client.send(
        JSON.stringify({
          type: "roomName",
          name: info.name,
          description: info.description || "",
          id: roomid,
        })
      );
      client.send(
        JSON.stringify({
          type: "updateTheme",
          index: info.theme || 0,
        })
      );
    }
    for (var client of wss.clients) {
      var wasOwner = client._rrIsOwner;
      client._rrIsOwner = false;
      client._rrIsRealOwner = false;

      if (client._rrUsername && info.owners.includes(client._rrUsername)) {
        client._rrIsOwner = true;
        if (info.owners[0] === client._rrUsername) {
          client._rrIsRealOwner = true;
        }
      }

      if (wasOwner !== client._rrIsOwner) {
        client.send(
          JSON.stringify({
            type: "isOwner",
            isOwner: client._rrIsOwner,
          })
        );
      }
    }

    //Reload permission stuff.
    info = applyNewRoomPermissionValues(info);
    wss._rrRoomPermissions = info.permissions;

    //Send permission data and check ban and user lists.
    wss.clients.forEach((ws) => {
      if (!ws._rrIsReady) {
        return;
      }
      if (checkBanAndUserList(ws)) {
        return;
      }
      sendPermData(ws);
      ws.send(
        JSON.stringify({
          type: "allowGuests",
          allow: info.allowGuests,
        })
      );
    });

    sendOnlineList();
  };

  wss._rrSendChatMessage = sendRoomChatMessage;

  wss._rrCameraUpdateInterval = setInterval(() => {
    for (var client of wss.clients) {
      if (client._rrIsReady) {
        for (var client2 of wss.clients) {
          var isSelf = false;
          if (client2._rrConnectionID == client._rrConnectionID) {
            isSelf = true;
          }

          if (client2._rrIsReady) {
            if (
              client._rrOtherCams[client2._rrConnectionID] !==
              client2._rrCameraCode
            ) {
              client._rrOtherCams[client2._rrConnectionID] =
                client2._rrCameraCode;
              client.send(
                JSON.stringify({
                  type: "cameraUpdate",
                  id: client2._rrConnectionID,
                  code: client._rrOtherCams[client2._rrConnectionID],
                  displayName: client2._rrDisplayName,
                  username: client2._rrUsername,
                  color: client2._rrUserColor,
                  font: client2._rrUserFont,
                  isSelf: isSelf,
                })
              );
            }

            if (
              client._rrOtherMics[client2._rrConnectionID] !==
              client2._rrMicCode
            ) {
              client._rrOtherMics[client2._rrConnectionID] = client2._rrMicCode;
              client.send(
                JSON.stringify({
                  type: "microphoneUpdate",
                  id: client2._rrConnectionID,
                  code: client._rrOtherMics[client2._rrConnectionID],
                  displayName: client2._rrDisplayName,
                  username: client2._rrUsername,
                  color: client2._rrUserColor,
                  font: client2._rrUserFont,
                  isSelf: isSelf,
                })
              );
            }
          }
        }
      }
    }
  }, 1000 / 30);

  wss._rrKeepAliveInterval = setInterval(() => {
    for (var client of wss.clients) {
      client.send(JSON.stringify({ type: "keepAlive" }));
    }
  }, 100);

  roomWebsockets[roomid.toString()] = wss;
  return wss;
}

var fileUploads = {};
var fileUploadCount = 0;
var fileUploadTypes = {};
var fileUploadTimeouts = {};

var roomPermNames = [
  //These are kinda hardcoded into the logic of the server, so be careful and make sure you account for code before editing this!
  "soundboard",
  "media",
  "commands",
  "reactions",
];

var roomPermValues = [
  //Just for validation.
  "everyone",
  "owner",
  "none",
];

var roomDefaultPerms = {
  //names and values must be ones from above
  soundboard: "everyone",
  reactions: "everyone",
  media: "everyone",
  commands: "everyone",
};

function applyNewRoomPermissionValues(roomInfo) {
  //So no need to manually edit all the room files, just add it automatically.
  var roomPerms = roomInfo.permissions;
  if (roomPerms) {
    //Condition passes, then room permissions must be checked and new default values must be applied.

    for (var name of roomPermNames) {
      if (typeof roomPerms[name] !== "string") {
        //Room permission does not exist, or is invalid type.
        roomPerms[name] = roomDefaultPerms[name]; //Set it to the default value.
      }
    }
  } else {
    //Room permission doesn't exist at all, just set it to defaults.

    //Could just use JSON.parse(JSON.stringify(defaultRoomPerms)) to safely copy the values, but this method feels better.
    var roomPerms = {}; //Create empty object
    for (var name of roomPermNames) {
      roomPerms[name] = roomDefaultPerms[name]; //Set to the default value.
    }

    roomInfo.permissions = roomPerms; //Actually set the value.
  }

  //Allow and ban list need to be defined as array type.

  if (!Array.isArray(roomInfo.allowList)) {
    roomInfo.allowList = [];
  }

  if (!Array.isArray(roomInfo.banList)) {
    roomInfo.banList = [];
  }

  //Allow guests is enabled by default.

  if (typeof roomInfo.allowGuests !== "boolean") {
    roomInfo.allowGuests = true;
  }

  return roomInfo; //Return it just because.
}

var quickJoinRooms = {};
var quickJoinRoomTimeouts = {};
var quickJoinCodeNumber = 0;
function generateSafeJoinCode(length = 8) {
  const safeCharacters = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * safeCharacters.length);
    code += safeCharacters.charAt(randomIndex);
  }

  return code;
}

function getMediaFolderSizeSync() {
  var size = 0;
  for (var file of fs.readdirSync(userMediaDirectory)) {
    try {
      var stat = fs.statSync(path.join(userMediaDirectory, file));
      size += stat.size;
    } catch (e) {
      console.log("Failed to read file " + file + " stat", e);
    }
  }
  return size;
}

var rateLimitUsers = {};
var DEBUG_RATE_LIMIT = false;

function applyRateLimit(req) {
  const usercookie = getCookie("account", getCookieFromRequest(req));
  const ip = getIPFromRequest(req);
  const id = usercookie ? "user_" + usercookie : "ip_" + ip;

  const now = Date.now();
  const entry = rateLimitUsers[id] || {
    count: 0,
    lastReset: now,
    blockedUntil: 0,
  };

  if (now < entry.blockedUntil) {
    return true;
  }

  if (now - entry.lastReset >= 60 * 1000) {
    if (DEBUG_RATE_LIMIT) {
      console.log(`[RateLimit Debug] ${id} → ${entry.count} req/minute`);
    }
    entry.count = 0;
    entry.lastReset = now;
  }

  entry.count++;

  if (entry.count > cons.MAX_REQUESTS_PER_MINUTE) {
    entry.blockedUntil = now + 30000;
    rateLimitUsers[id] = entry;
    return true;
  }

  if (DEBUG_RATE_LIMIT) {
    console.log(
      `[RateLimit Debug] Total requests made per minute: ${entry.count}`
    );
  }

  rateLimitUsers[id] = entry;
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const id of Object.keys(rateLimitUsers)) {
    const entry = rateLimitUsers[id];
    if (
      entry.count === 0 &&
      now - entry.lastReset > 5000 &&
      now > entry.blockedUntil
    ) {
      if (DEBUG_RATE_LIMIT) {
        console.log(
          `[RateLimit Debug] Cleaning up idle entry for ${id}, total requests handled: ${entry.totalRequests}`
        );
      }
      delete rateLimitUsers[id];
    }
  }
}, 10000);

const server = http.createServer(async function (req, res) {
  setNoCorsHeaders(res);

  if (applyRateLimit(req)) {
    res.writeHead(429, { "Content-Type": "text/html; charset=utf-8" });
    res.end(
      `<!DOCTYPE HTML><h1>Yikes!</h1><br><span>It seems like you hit our request limit, try again later.</span><script>setTimeout(() => {window.location.reload();},1000);</script>`
    );
    return;
  }

  var ip = getIPFromRequest(req);

  var url = decodeURIComponent(req.url);
  var urlsplit = url.split("/");

  var usercookie = getCookie("account", getCookieFromRequest(req));
  if (usercookie) {
    var decryptedUserdata = encryptor.decrypt(usercookie);
    if (!decryptedUserdata) {
      res.setHeader("Set-Cookie", "account=; Max-Age=0; Path=/; SameSite=None");
    }
  }

  if (decryptedUserdata) {
    var hasInvalid = false;
    try {
      if (!checkUsername(decryptedUserdata.username)) {
        hasInvalid = true;
      }
      if (!decryptedUserdata.session) {
        hasInvalid = true;
      }
      decryptedUserdata.username = decryptedUserdata.username.toLowerCase();
      decryptedUserdata.username = decryptedUserdata.username.trim();
    } catch (e) {
      hasInvalid = true;
    }

    if (hasInvalid) {
      res.setHeader(
        "Set-Cookie",
        `account=; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
      );
      decryptedUserdata = null;
    }
  }

  if (urlsplit[1] == "client") {
    if (urlsplit[2] == "version") {
      try {
        res.end(fs.readFileSync("wpstatic/version.json"));
      } catch (e) {
        res.statusCode = 404;
        res.end("No version info was found.");
      }
      return;
    }
    if (urlsplit[2] == "time") {
      res.end(JSON.stringify({ serverTime: Date.now() }));
    }
    res.statusCode = 404;
    res.end("");
    return;
  }

  if (urlsplit[1] == "quickjoin") {
    if (urlsplit[2] == "code" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (typeof json.id !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }

          var roomBuffer = await storage.downloadFile(
            `room-${json.id}-info.json`
          );
          var qjCode = generateSafeJoinCode();
          quickJoinRooms[qjCode] = json.id;
          quickJoinRoomTimeouts[qjCode] = setTimeout(
            () => {
              quickJoinRooms[qjCode] = undefined;
              quickJoinRoomTimeouts[qjCode] = null;
            },
            15 * 60 * 1000
          ); //15 minutes before code expires.
          res.end(
            JSON.stringify({
              code: qjCode,
            })
          );
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }

    if (urlsplit[2] == "code" && urlsplit[3]) {
      var qjCode = urlsplit[3];
      if (quickJoinRooms[qjCode]) {
        clearTimeout(quickJoinRoomTimeouts[qjCode]);
        quickJoinRoomTimeouts[qjCode] = setTimeout(
          () => {
            quickJoinRooms[qjCode] = undefined;
            quickJoinRoomTimeouts[qjCode] = null;
          },
          15 * 60 * 1000
        );
        res.end(quickJoinRooms[qjCode]);
      } else {
        res.statusCode = 404;
        res.end("Code not found");
      }
      return;
    }
  }

  if (urlsplit[1] == "uploads") {
    if (urlsplit[2] == "file" && req.method == "POST") {
      (async function () {
        try {
          var size = 0;
          if (req.headers["content-length"] > cons.MAX_FILE_MEDIA_SIZE) {
            size = parseInt(req.headers["content-length"], 10);
          }

          if (size > cons.MAX_FILE_MEDIA_SIZE) {
            res.statusCode = 413;
            res.end("File is too big.");
            return;
          }
          var fileInfo = await waitBusboyFile(req, {
            limits: {
              fileSize: cons.MAX_MEDIA_SIZE,
              files: 1,
            },
          });
          if (fileInfo.buffer.length > cons.MAX_FILE_MEDIA_SIZE) {
            res.statusCode = 413;
            res.end("File is too big.");
            return;
          }
          if (
            fileInfo.buffer.length + getMediaFolderSizeSync() >
            cons.MAX_MEDIA_FOLDER_SIZE
          ) {
            res.statusCode = 413;
            res.end(
              "User media folder is too large, please wait for some files to expire."
            );
            console.log("Warning: the user media folder is hitting limits");
            return;
          }
          var id = generateRandomStuff();
          fs.writeFileSync(
            path.join(userMediaDirectory, id + ".media"),
            fileInfo.buffer
          );
          fileUploadTypes[id] = fileInfo.mimeType;
          fileUploadCount += 1;
          res.end(JSON.stringify({ id }));
          fileUploadTimeouts[id] = setTimeout(
            () => {
              fileUploadTypes[id] = null;
              fileUploadTimeouts[id] = null;
              fs.rmSync(path.join(userMediaDirectory, id + ".media"));
            },
            1000 * 60 * 10
          ); //should be 10 minutes
        } catch (e) {
          res.statusCode = 500;
          res.end("Server error");
        }
      })();
      return;
    }
    if (urlsplit[2] == "file" && req.method == "GET") {
      var id = urlsplit[3];
      if (fileUploadTypes[id]) {
        var type = fileUploadTypes[id];
        var filePath = path.join(userMediaDirectory, id + ".media");

        clearTimeout(fileUploadTimeouts[id]);
        fileUploadTimeouts[id] = setTimeout(
          () => {
            fileUploadTypes[id] = null;
            fileUploadTimeouts[id] = null;
            fs.rmSync(path.join(userMediaDirectory, id + ".media"));
          },
          1000 * 60 * 10
        );
        var fileStat = fs.statSync(filePath);
        // Get the file length
        var fileLength = fileStat.size;

        // Check if the 'Range' header is present in the request
        var range = req.headers["range"];
        if (range) {
          try {
            // Parse the range manually if it ends with a dash
            var rangeParts = range.split("=")[1].split("-");
            var start = parseInt(rangeParts[0], 10);
            var end = rangeParts[1]
              ? parseInt(rangeParts[1], 10)
              : fileLength - 1;

            // Handle case where the end is beyond file length
            if (end >= fileLength) {
              end = fileLength - 1;
            }

            if (start >= fileLength || start > end) {
              res.statusCode = 416; // Range Not Satisfiable
              res.setHeader("Content-Range", `bytes */${fileLength}`);
              res.end();
              return;
            }

            // Set headers for partial content response
            res.statusCode = 206; // Partial Content
            res.setHeader("Content-Type", type); // Correct MIME type for audio
            res.setHeader(
              "Content-Range",
              `bytes ${start}-${end}/${fileLength}`
            );
            res.setHeader("Content-Length", end - start + 1);
            res.setHeader("Accept-Ranges", "bytes"); // Inform the client we support ranges

            var stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);

            stream.on("error", (streamErr) => {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end("Internal Server Error while streaming file content.");
              } else {
                res.destroy();
              }
            });
            return;
          } catch (e) {
            // Handle errors parsing the Range header
            res.statusCode = 416; // Range Not Satisfiable
            res.setHeader("Content-Range", `bytes */${fileLength}`);
            res.end();
            return;
          }
        }

        // If no Range header is present, return the full file
        res.setHeader("Content-Type", type);
        res.setHeader("Content-Length", fileLength);
        var stream = fs.createReadStream(filePath);
        stream.pipe(res);

        stream.on("error", (streamErr) => {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end("Internal Server Error while streaming file content.");
          } else {
            res.destroy();
          }
        });
        return;
      } else {
        res.statusCode = 404;
        res.end("File was expired or deleted.");
        return;
      }
    }
  }

  if (urlsplit[1] == "rooms") {
    if (urlsplit[2] == "create" && req.method == "POST") {
      (async function () {
        try {
          var roomId = generateRandomStuff();

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          var roomInfo = {
            name: decryptedUserdata.username + "'s chatroom",
            owners: [decryptedUserdata.username.toLowerCase()],
          };

          await storage.uploadFile(
            `room-${roomId}-info.json`,
            JSON.stringify(roomInfo),
            "application/json"
          );

          res.end(
            JSON.stringify({
              id: roomId,
            })
          );
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "rename" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof json.name !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (json.name.length < 1) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (json.name.length > cons.MAX_ROOM_NAME_SIZE) {
            json.name = json.name.slice(0, cons.MAX_ROOM_NAME_SIZE);
          }
          if (defaultRooms.indexOf(json.id) > -1) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (typeof json.id !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("");
            return;
          }
          var roomBuffer = await storage.downloadFile(
            `room-${json.id}-info.json`
          );
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData.name = json.name;
            await storage.uploadFile(
              `room-${json.id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[json.id]) {
              roomWebsockets[json.id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "description" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof json.description !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (json.description.length < 1) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (json.description.length > cons.MAX_ROOM_DESCRIPTION_SIZE) {
            json.description = json.description.slice(
              0,
              cons.MAX_ROOM_DESCRIPTION_SIZE
            );
          }
          if (defaultRooms.indexOf(json.id) > -1) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (typeof json.id !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("");
            return;
          }
          var roomBuffer = await storage.downloadFile(
            `room-${json.id}-info.json`
          );
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData.description = json.description;
            await storage.uploadFile(
              `room-${json.id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[json.id]) {
              roomWebsockets[json.id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "perms" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof json.id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(json.id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.type !== "string") {
            res.statusCode = 400;
            res.end("Room type must be string");
            return;
          }
          if (typeof json.level !== "string") {
            res.statusCode = 400;
            res.end("Room permission level must be string.");
            return;
          }

          if (roomPermNames.indexOf(json.type) < 0) {
            res.statusCode = 400;
            res.end("Room type is not a valid value");
            return;
          }
          if (roomPermValues.indexOf(json.level) < 0) {
            res.statusCode = 400;
            res.end("Room level is not a valid value");
            return;
          }

          var roomBuffer = await storage.downloadFile(
            `room-${json.id}-info.json`
          );
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            //Edit room permission value.
            roomData.permissions[json.type] = json.level;

            await storage.uploadFile(
              `room-${json.id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[json.id]) {
              roomWebsockets[json.id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "theme" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof json.id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(json.id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.index !== "number") {
            res.statusCode = 400;
            res.end("Room theme index must be number");
            return;
          }

          var roomBuffer = await storage.downloadFile(
            `room-${json.id}-info.json`
          );
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            roomData.theme = json.index;

            await storage.uploadFile(
              `room-${json.id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[json.id]) {
              roomWebsockets[json.id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "addban" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          var id = urlsplit[3];
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.username !== "string") {
            res.statusCode = 400;
            res.end("Username must be type string");
            return;
          }

          var targetUsername = json.username.toLowerCase().trim();

          if (!checkUsername(targetUsername)) {
            res.statusCode = 400;
            res.end("Username isn't valid.");
            return;
          }

          if (!(await doesUsernameExist(targetUsername))) {
            res.statusCode = 404;
            res.end("User not found.");
            return;
          }

          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            if (roomData.owners[0] == targetUsername) {
              res.statusCode = 400;
              res.end("The room owner can't be banned");
              return;
            }
            if (roomData.banList.indexOf(targetUsername) < 0) {
              roomData.banList.push(targetUsername);
            }

            var ownerindex = roomData.owners.indexOf(targetUsername); //Remove ownership if banning an ownership user.
            if (ownerindex > -1) {
              roomData.owners.splice(ownerindex, 1);
            }

            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              roomWebsockets[id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You don't have ownership or owner.");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("Technical server error");
          console.log(e);
        }
      })();
      return;
    }
    if (urlsplit[2] == "removeban" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          var id = urlsplit[3];
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }

          if (typeof id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.username !== "string") {
            res.statusCode = 400;
            res.end("Username must be type string");
            return;
          }

          var targetUsername = json.username.toLowerCase().trim();

          if (!checkUsername(targetUsername)) {
            res.statusCode = 400;
            res.end("Username isn't valid.");
            return;
          }

          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            var banIndex = roomData.banList.indexOf(targetUsername);
            if (banIndex > -1) {
              roomData.banList.splice(banIndex, 1);
            }

            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              roomWebsockets[id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You don't have ownership or owner.");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("Technical server error.");
          console.log(e);
        }
      })();
      return;
    }
    if (urlsplit[2] == "changeallowguests" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          var id = urlsplit[3];
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }

          if (typeof id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.allowGuests !== "boolean") {
            res.statusCode = 400;
            res.end("allowGuests must be type boolean");
            return;
          }

          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            roomData.allowGuests = json.allowGuests;

            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              roomWebsockets[id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You don't have ownership or owner.");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("Technical server error");
          console.log(e);
        }
      })();
      return;
    }
    if (urlsplit[2] == "addallowlist" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          var id = urlsplit[3];
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }

          if (typeof id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.username !== "string") {
            res.statusCode = 400;
            res.end("Username must be type string");
            return;
          }

          var targetUsername = json.username.toLowerCase().trim();

          if (!checkUsername(targetUsername)) {
            res.statusCode = 400;
            res.end("Username isn't valid.");
            return;
          }

          if (!(await doesUsernameExist(targetUsername))) {
            res.statusCode = 404;
            res.end("User not found.");
            return;
          }

          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            if (roomData.owners[0] == targetUsername) {
              res.statusCode = 400;
              res.end("The room owner is always allowed, no need to add it!");
              return;
            }

            if (roomData.allowList.indexOf(targetUsername) < 0) {
              roomData.allowList.push(targetUsername);
            }

            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              roomWebsockets[id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You don't have ownership or owner.");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("Technical server error");
          console.log(e);
        }
      })();
      return;
    }
    if (urlsplit[2] == "removeallowlist" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          var id = urlsplit[3];
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }

          if (typeof id !== "string") {
            res.statusCode = 400;
            res.end("Room ID must be string");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end(
              "Room ID is from a default room ID, these can't be edited!"
            );
            return;
          }

          if (typeof json.username !== "string") {
            res.statusCode = 400;
            res.end("Username must be type string");
            return;
          }

          var targetUsername = json.username.toLowerCase().trim();

          if (!checkUsername(targetUsername)) {
            res.statusCode = 400;
            res.end("Username isn't valid.");
            return;
          }

          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            roomData = applyNewRoomPermissionValues(roomData); //Get up-to-date room permission data. (so code below does not fail)

            var banIndex = roomData.allowList.indexOf(targetUsername);
            if (banIndex > -1) {
              roomData.allowList.splice(banIndex, 1);
            }

            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              roomWebsockets[id]._rrUpdateRoomInfo();
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You don't have ownership or owner.");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("Technical server error.");
          console.log(e);
        }
      })();
      return;
    }
    if (urlsplit[2] == "destroy" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (defaultRooms.indexOf(json.id) > -1) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (typeof json.id !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("");
            return;
          }
          var roomBuffer = await storage.downloadFile(
            `room-${json.id}-info.json`
          );
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            try {
              await storage.deleteFile(`room-${json.id}-info.json`);
              if (roomWebsockets[json.id]) {
                roomWebsockets[json.id]._rrStopRoom();
                roomWebsockets[json.id] = undefined;
              }
              res.end("");
            } catch (e) {
              res.statusCode = 500;
              res.end("");
            }
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "addowner" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof json.who !== "string") {
            res.statusCode = 400;
            res.end("The property who must be string");
            return;
          }
          var id = urlsplit[3];
          if (!id) {
            res.statusCode = 400;
            res.end("Room id not provided");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end("Room is one of the default rooms");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't logged in");
            return;
          }
          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            if (roomData.owners.indexOf(json.who) < 0) {
              if (await doesUsernameExist(json.who)) {
                roomData.owners.push(json.who);
              } else {
                res.statusCode = 401;
                res.end("");
                return;
              }
            }
            for (var i in roomData.owners) {
              roomData.owners[i] = roomData.owners[i].toLowerCase();
            }
            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              try {
                await roomWebsockets[id]._rrUpdateRoomInfo();
                roomWebsockets[id]._rrSendChatMessage(
                  "[Notice]",
                  `${json.who} is now an owner.`
                );
              } catch (e) {}
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You aren't an owner or have ownership.");
            return;
          }
        } catch (e) {
          console.log(e);
          res.statusCode = 500;
          res.end("Technical server error");
        }
      })();
      return;
    }
    if (urlsplit[2] == "removeowner" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());
          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          if (typeof json.who !== "string") {
            res.statusCode = 400;
            res.end("Property who must be string");
            return;
          }
          var id = urlsplit[3];
          if (!id) {
            res.statusCode = 400;
            res.end("Room Id is not valid");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.statusCode = 400;
            res.end("Room can't be one of default room");
            return;
          }

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("You aren't signed in");
            return;
          }
          var roomBuffer = await storage.downloadFile(`room-${id}-info.json`);
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            var ownerIndex = roomData.owners.indexOf(json.who);
            if (ownerIndex > 0) {
              roomData.owners.splice(ownerIndex, 1);
            }
            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              try {
                await roomWebsockets[id]._rrUpdateRoomInfo();
                roomWebsockets[id]._rrSendChatMessage(
                  "[Notice]",
                  `${json.who} is no longer an owner.`
                );
              } catch (e) {}
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("You don't have ownership or is the owner of this room.");
            return;
          }
        } catch (e) {
          console.log(e);
          res.statusCode = 500;
          res.end("Technical server error");
        }
      })();
      return;
    }
    if (urlsplit[2] == "exists" && req.method == "GET") {
      (async function () {
        try {
          var id = urlsplit[3];
          if (!id) {
            res.end(JSON.stringify({ exists: false }));
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
            res.end(JSON.stringify({ exists: true }));
            return;
          }
          var file = await storage.downloadFile(`room-${id}-info.json`);
          var json = JSON.parse(file.toString());
          res.end(JSON.stringify({ exists: true }));
        } catch (e) {
          res.end(JSON.stringify({ exists: false }));
        }
      })();
      return;
    }
  }

  if (urlsplit[1] == "account") {
    if (urlsplit[2] == "session" && req.method == "GET") {
      try {
        try {
          if (!decryptedUserdata) {
            res.end(
              JSON.stringify({
                message: "No account cookie.",
                error: true,
                valid: false,
                success: false,
              })
            );
            return;
          }
        } catch (e) {
          res.end(
            JSON.stringify({
              message: "Unknown error when trying to decode cookie.",
              error: true,
              valid: false,
              success: false,
            })
          );
          return;
        }
        var stuff = await validateUserCookie(decryptedUserdata);
        var infoJson = {
          username: decryptedUserdata.username,
          ...stuff,
        };
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Set-Cookie",
          `account=${usercookie}; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
        );
        res.end(JSON.stringify(infoJson));
        return;
      } catch (e) {
        res.end(
          JSON.stringify({
            message: e.toString(),
            error: true,
            valid: false,
            success: false,
          })
        );
        return;
      }
    }
    if (urlsplit[2] == "signup" && req.method == "POST") {
      var body = "";
      req.on("data", (d) => {
        body += d;
      });
      req.on("end", async () => {
        var json = JSON.parse(body);
        if (typeof json.username !== "string") {
          res.statusCode = 404;
          res.end("");
          return;
        }
        if (typeof json.password !== "string") {
          res.statusCode = 404;
          res.end("");
          return;
        }
        var stuff = await createUser(
          json.username.toLowerCase(),
          json.password
        );
        if (stuff.valid) {
          var value = encryptor.encrypt({
            username: json.username.toLowerCase().trim(),
            session: stuff.session,
          });
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader(
            "Set-Cookie",
            `account=${value}; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
          );
        }
        res.end(
          JSON.stringify({
            valid: stuff.valid,
            error: stuff.error,
            message: stuff.message,
          })
        );
      });
      return;
    }
    if (urlsplit[2] == "picture" && req.method == "GET") {
      getUserProfilePictureResponse(urlsplit[3].split("?")[0], req, res);
      return;
    }
    if (urlsplit[2] == "picture" && req.method == "POST") {
      try {
        var body = await waitForBody(req);
        var stuff = await validateUserCookie(decryptedUserdata);
        if (stuff.valid) {
          try {
            if (body.length < 1) {
              await storage.deleteFile(
                `user-${decryptedUserdata.username}-profile`
              );
              res.end("");
              return;
            }
            var buffer = Buffer.from(body.toString(), "base64");
            if (buffer.length > cons.MAX_PROFILE_PICTURE_SIZE) {
              await storage.deleteFile(
                `user-${decryptedUserdata.username}-profile`
              );
              res.end("");
              return;
            }
            await uploadUserProfilePicture(
              decryptedUserdata.username,
              buffer,
              req.headers["content-type"]
            );
            res.end("");
            return;
          } catch (e) {
            res.statusCode = 500;
          }
        } else {
          res.statusCode = 400;
        }
        res.end("");
        return;
      } catch (e) {
        res.end("");
        return;
      }
    }
    if (urlsplit[2] == "profile" && req.method == "GET") {
      var profileUsername = urlsplit[3];
      var profileFile = `user-${profileUsername}.json`;
      try {
        await storage.getFileStatus(profileFile);
      } catch (e) {
        runStaticStuff(req, res, {
          status: 404,
        });
        return;
      }
      try {
        var profileRaw = await storage.downloadFile(profileFile);
        var profileJson = JSON.parse(profileRaw.toString());
        res.end(
          JSON.stringify({
            bio: profileJson.bio,
          })
        );
      } catch (e) {
        runStaticStuff(req, res, {
          status: 500,
        });
        return;
      }
      return;
    }
    if (urlsplit[2] == "myuserlist" && req.method == "GET") {
      if (decryptedUserdata) {
        try {
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          try {
            var userListFile = `userlist-${decryptedUserdata.username}.json`;
            var userListRawText = await storage.downloadFile(userListFile);
            var json = JSON.parse(userListRawText.toString());
            res.end(
              JSON.stringify({
                users: json.map((usr) => usr.username),
              })
            );
          } catch (e) {
            res.end(
              JSON.stringify({
                users: [],
              })
            );
            return;
          }
        } catch (e) {
          runStaticStuff(req, res, {
            status: 500,
          });
        }
      } else {
        runStaticStuff(req, res, {
          status: 403,
        });
      }
      return;
    }
    if (urlsplit[2] == "adduserlist" && req.method == "POST") {
      if (decryptedUserdata) {
        try {
          var body = await waitForBody(req);
          var bodyJson = JSON.parse(body.toString());
          if (typeof bodyJson.username !== "string") {
            res.statusCode = 400;
            res.end("Username property must be type of string.");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var userListFile = `userlist-${decryptedUserdata.username}.json`;
          try {
            var userListRawText = await storage.downloadFile(userListFile);
          } catch (e) {
            var userListRawText = "[]";
          }
          var json = JSON.parse(userListRawText.toString());
          var safeUsername = bodyJson.username.trim().toLowerCase();
          if (
            !(
              checkUsername(safeUsername) &&
              (await doesUsernameExist(safeUsername))
            )
          ) {
            res.statusCode = 404;
            res.end("Username doesn't exist or invalid");
            return;
          }
          if (safeUsername == decryptedUserdata.username) {
            res.statusCode = 400;
            res.end("You can't add yourself!");
            return;
          }
          if (!json.find((usr) => usr.username == safeUsername)) {
            json.push({ username: safeUsername });
          }
          if (json.length > cons.MAX_USERLIST_SIZE) {
            res.statusCode = 400;
            res.end(
              "Too many trusted usernames stored, remove some to add more."
            );
            return;
          }
          await storage.uploadFile(
            userListFile,
            JSON.stringify(json),
            "application/json"
          );
          res.end("");
        } catch (e) {
          runStaticStuff(req, res, {
            status: 500,
          });
        }
      } else {
        runStaticStuff(req, res, {
          status: 403,
        });
      }
      return;
    }
    if (urlsplit[2] == "removeuserlist" && req.method == "POST") {
      if (decryptedUserdata) {
        try {
          var body = await waitForBody(req);
          var bodyJson = JSON.parse(body.toString());
          if (typeof bodyJson.username !== "string") {
            res.statusCode = 400;
            res.end("Username property must be type of string.");
            return;
          }
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var userListFile = `userlist-${decryptedUserdata.username}.json`;
          try {
            var userListRawText = await storage.downloadFile(userListFile);
          } catch (e) {
            var userListRawText = "[]";
          }
          var json = JSON.parse(userListRawText.toString());
          var safeUsername = bodyJson.username.trim().toLowerCase();

          if (!checkUsername(safeUsername)) {
            res.statusCode = 404;
            res.end("Username isn't invalid");
            return;
          }

          json = json.filter((usr) => usr.username !== safeUsername);
          await storage.uploadFile(
            userListFile,
            JSON.stringify(json),
            "application/json"
          );
          res.end("");
        } catch (e) {
          runStaticStuff(req, res, {
            status: 500,
          });
        }
      } else {
        runStaticStuff(req, res, {
          status: 403,
        });
      }
      return;
    }
    if (urlsplit[2] == "myrooms" && req.method == "GET") {
      if (decryptedUserdata) {
        try {
          var stuff = await validateUserCookie(decryptedUserdata);
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var profileFile = `user-${decryptedUserdata.username}.json`;
          var profileRaw = await storage.downloadFile(profileFile);
          var json = JSON.parse(profileRaw.toString());
          if (!Array.isArray(json.rooms)) {
            json.rooms = [];
          }
          var roomlistreal = [];
          for (var room of json.rooms) {
            var userCount = 0;
            var onlineUsernames = [];
            if (typeof roomWebsockets[room.id] == "object") {
              var roomwss = roomWebsockets[room.id];
              for (var cli of roomwss.clients) {
                userCount += 1;
                onlineUsernames.push({
                  username: cli._rrUsername,
                  display: cli._rrDisplayName,
                  color: cli._rrUserColor,
                  font: cli._rrUserFont,
                });
              }
            }
            roomlistreal.push({
              name: room.name,
              description: room.description || "",
              id: room.id,
              invited: room.invited,
              users: userCount,
              userList: onlineUsernames,
            });
          }
          // Sort invited rooms to the top
          roomlistreal.sort((a, b) => {
            // true should come before false, so convert to 1 or 0
            return (b.invited === true ? 1 : 0) - (a.invited === true ? 1 : 0);
          });
          if (Array.isArray(json.rooms)) {
            res.end(
              JSON.stringify({
                rooms: roomlistreal,
              })
            );
          } else {
            res.end(
              JSON.stringify({
                rooms: [],
              })
            );
          }
        } catch (e) {
          runStaticStuff(req, res, {
            status: 500,
          });
        }
      } else {
        runStaticStuff(req, res, {
          status: 403,
        });
      }
      return;
    }
    if (urlsplit[2] == "addroom" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            var body = await waitForBody(req);
            var json = JSON.parse(body.toString());

            if (typeof json.name !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }
            if (typeof json.id !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }
            if (typeof json.description !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }

            var stuff = await validateUserCookie(decryptedUserdata);
            if (!stuff.valid) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            var profileFile = `user-${decryptedUserdata.username}.json`;
            var profileRaw = await storage.downloadFile(profileFile);
            var profilejson = JSON.parse(profileRaw.toString());
            var rooms = [];
            if (Array.isArray(profilejson.rooms)) {
              rooms = profilejson.rooms;
            }
            if (defaultRooms.indexOf(json.id) < 0) {
              var roomAlreadyExists = false;
              for (var room of rooms) {
                if (room.id == json.id) {
                  roomAlreadyExists = true;
                }
              }
              if (roomAlreadyExists) {
                for (var room of rooms) {
                  if (room.id == json.id) {
                    room.name = json.name;
                    room.description = json.description;
                    room.invited = undefined;
                  }
                }
              } else {
                rooms.push({
                  name: json.name,
                  description: json.description,
                  id: json.id,
                });
              }
            }
            profilejson.rooms = rooms;

            await storage.uploadFile(
              profileFile,
              JSON.stringify(profilejson),
              "application/json"
            );

            res.end("");
          } catch (e) {
            runStaticStuff(req, res, {
              status: 500,
            });
          }
        } else {
          runStaticStuff(req, res, {
            status: 403,
          });
        }
      })();
      return;
    }
    if (urlsplit[2] == "inviteroom" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            var body = await waitForBody(req);
            var json = JSON.parse(body.toString());

            if (typeof json.name !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }
            if (typeof json.id !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }
            if (typeof json.username !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }

            if (!checkUsername(json.username)) {
              res.statusCode = 400;
              res.end("");
              return;
            }

            if (
              decryptedUserdata.username.toLowerCase() ==
              json.username.toLowerCase()
            ) {
              res.statusCode = 400;
              res.end("");
              return;
            }

            var stuff = await validateUserCookie(decryptedUserdata);
            if (!stuff.valid) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            var profileFile = `user-${json.username.toLowerCase()}.json`;
            var profileRaw = await storage.downloadFile(profileFile);
            var profilejson = JSON.parse(profileRaw.toString());
            var rooms = [];
            if (Array.isArray(profilejson.rooms)) {
              rooms = profilejson.rooms;
            }
            if (defaultRooms.indexOf(json.id) < 0) {
              var roomAlreadyExists = false;
              for (var room of rooms) {
                if (room.id == json.id) {
                  roomAlreadyExists = true;
                }
              }
              if (roomAlreadyExists) {
                for (var room of rooms) {
                  if (room.id == json.id) {
                    room.name = json.name;
                    room.invited = true;
                  }
                }
              } else {
                rooms.push({ name: json.name, id: json.id, invited: true });
              }
            }
            profilejson.rooms = rooms;
            sendNotify(json.username.toLowerCase().trim(), {
              type: "invite",
              from: decryptedUserdata.username.toLowerCase().trim(),
              roomName: json.name,
              roomID: json.id,
            });
            await storage.uploadFile(
              profileFile,
              JSON.stringify(profilejson),
              "application/json"
            );

            res.end("");
          } catch (e) {
            runStaticStuff(req, res, {
              status: 500,
            });
          }
        } else {
          runStaticStuff(req, res, {
            status: 403,
          });
        }
      })();
      return;
    }
    if (urlsplit[2] == "setcolor" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            var body = await waitForBody(req);
            var json = JSON.parse(body.toString());

            if (typeof json.color !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }
            if (json.color.length > 20) {
              res.statusCode = 400;
              res.end("");
              return;
            }

            var stuff = await validateUserCookie(decryptedUserdata);
            if (!stuff.valid) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            var profileFile = `user-${decryptedUserdata.username}.json`;
            var profileRaw = await storage.downloadFile(profileFile);
            var profilejson = JSON.parse(profileRaw.toString());
            profilejson.color = json.color;
            await storage.uploadFile(
              profileFile,
              JSON.stringify(profilejson),
              "application/json"
            );
            closeUserFromUserSocket(decryptedUserdata.username);
            res.end("");
          } catch (e) {
            runStaticStuff(req, res, {
              status: 500,
            });
          }
        } else {
          runStaticStuff(req, res, {
            status: 403,
          });
        }
      })();
      return;
    }
    if (urlsplit[2] == "setfont" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            var body = await waitForBody(req);
            var json = JSON.parse(body.toString());

            if (typeof json.font !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }
            if (json.font.length > 20) {
              res.statusCode = 400;
              res.end("");
              return;
            }

            var stuff = await validateUserCookie(decryptedUserdata);
            if (!stuff.valid) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            var profileFile = `user-${decryptedUserdata.username}.json`;
            var profileRaw = await storage.downloadFile(profileFile);
            var profilejson = JSON.parse(profileRaw.toString());
            profilejson.font = json.font;
            await storage.uploadFile(
              profileFile,
              JSON.stringify(profilejson),
              "application/json"
            );
            closeUserFromUserSocket(decryptedUserdata.username);
            res.end("");
          } catch (e) {
            runStaticStuff(req, res, {
              status: 500,
            });
          }
        } else {
          runStaticStuff(req, res, {
            status: 403,
          });
        }
      })();
      return;
    }
    if (urlsplit[2] == "displayname" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            var body = await waitForBody(req);
            var json = JSON.parse(body.toString());

            if (typeof json.displayName !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }

            var stuff = await validateUserCookie(decryptedUserdata);
            if (!stuff.valid) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            var profileFile = `user-${decryptedUserdata.username}.json`;
            var profileRaw = await storage.downloadFile(profileFile);
            var profilejson = JSON.parse(profileRaw.toString());
            profilejson.displayName = json.displayName;
            if (profilejson.displayName.length > cons.MAX_DISPLAY_NAME_SIZE) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            if (profilejson.displayName.length < cons.MIN_DISPLAY_NAME_SIZE) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            await storage.uploadFile(
              profileFile,
              JSON.stringify(profilejson),
              "application/json"
            );
            closeUserFromUserSocket(decryptedUserdata.username);
            res.end("");
          } catch (e) {
            runStaticStuff(req, res, {
              status: 500,
            });
          }
        } else {
          runStaticStuff(req, res, {
            status: 403,
          });
        }
      })();
      return;
    }
    if (urlsplit[2] == "removeroom" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            var body = await waitForBody(req);
            var json = JSON.parse(body.toString());

            if (typeof json.id !== "string") {
              res.statusCode = 400;
              res.end("");
              return;
            }

            var stuff = await validateUserCookie(decryptedUserdata);
            if (!stuff.valid) {
              runStaticStuff(req, res, {
                status: 403,
              });
              return;
            }
            var profileFile = `user-${decryptedUserdata.username}.json`;
            var profileRaw = await storage.downloadFile(profileFile);
            var profilejson = JSON.parse(profileRaw.toString());
            var rooms = [];
            if (Array.isArray(profilejson.rooms)) {
              rooms = profilejson.rooms;
            }
            var newRooms = [];
            for (var room of rooms) {
              if (room.id !== json.id) {
                newRooms.push(room);
              }
            }
            profilejson.rooms = newRooms;
            await storage.uploadFile(
              profileFile,
              JSON.stringify(profilejson),
              "application/json"
            );
            res.end("");
          } catch (e) {
            runStaticStuff(req, res, {
              status: 500,
            });
          }
        } else {
          runStaticStuff(req, res, {
            status: 403,
          });
        }
      })();
      return;
    }
    if (urlsplit[2] == "login" && req.method == "POST") {
      var body = "";
      req.on("data", (d) => {
        body += d;
      });
      req.on("end", async () => {
        var json = JSON.parse(body);
        if (typeof json.username !== "string") {
          res.statusCode = 404;
          res.end("");
          return;
        }
        if (typeof json.password !== "string") {
          res.statusCode = 404;
          res.end("");
          return;
        }
        var stuff = await validateUser(
          json.username.toLowerCase(),
          json.password
        );
        if (stuff.valid) {
          var value = encryptor.encrypt({
            username: json.username.toLowerCase().trim(),
            session: stuff.session,
          });
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader(
            "Set-Cookie",
            `account=${value}; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
          );
        }
        res.end(JSON.stringify(stuff));
      });
      return;
    }
    if (urlsplit[2] == "logout" && req.method == "POST") {
      (async function () {
        if (decryptedUserdata) {
          try {
            await destroySessionCookie(decryptedUserdata);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader(
              "Set-Cookie",
              `account=; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
            );
            res.end("Successfully & safely logged out.");
          } catch (e) {
            res.statusCode = 500;
            res.end("Error logging out.");
          }
        } else {
          res.end("Already signed out.");
        }
      })();
      return;
    }
    if (urlsplit[2] == "destroy" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          if (!decryptedUserdata) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "No session was provided",
              })
            );
            return;
          }
          var validation = await validateUserCookie(decryptedUserdata);
          if (!validation.valid) {
            res.statusCode = 403;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "Session isn't valid.",
              })
            );
            return;
          }

          var json = JSON.parse(body.toString());
          if (typeof json.password !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "password must be string.",
              })
            );
            return;
          }

          var session = await validateUserCookiePassword(
            decryptedUserdata,
            json.password
          );

          if (!session) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "Password isn't correct.",
              })
            );
            return;
          }

          await destroyAccount(decryptedUserdata.username);

          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader(
            "Set-Cookie",
            `account=; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
          );
          closeUserFromUserSocket(decryptedUserdata.username);

          res.end(JSON.stringify({ success: true }));

          return;
        } catch (e) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              error: true,
              message: "Unknown server error",
            })
          );
        }
      })();
      return;
    }
    if (urlsplit[2] == "passwordchange" && req.method == "POST") {
      (async function () {
        try {
          var body = await waitForBody(req);
          if (!decryptedUserdata) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "No session was provided",
              })
            );
            return;
          }
          var validation = await validateUserCookie(decryptedUserdata);
          if (!validation.valid) {
            res.statusCode = 403;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "Session isn't valid.",
              })
            );
            return;
          }

          var json = JSON.parse(body.toString());
          if (typeof json.oldPassword !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "oldPassword must be string.",
              })
            );
            return;
          }
          if (typeof json.newPassword !== "string") {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "newPassword must be string.",
              })
            );
            return;
          }

          var session = await updateUserPassword(
            decryptedUserdata.username.trim(),
            json.newPassword,
            json.oldPassword
          );
          if (!session) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                success: false,
                error: true,
                message: "Old password isn't correct.",
              })
            );
            return;
          }

          var value = encryptor.encrypt({
            username: decryptedUserdata.username.trim().toLowerCase(),
            session,
          });
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader(
            "Set-Cookie",
            `account=${value}; Path=/; HttpOnly; Secure; Max-Age=999999999; SameSite=None`
          );
          closeUserFromUserSocket(decryptedUserdata.username);

          res.end(JSON.stringify({ success: true }));

          return;
        } catch (e) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              error: true,
              message: "Unknown server error",
            })
          );
        }
      })();
      return;
    }
  }

  if (serverAvailable) {
    runStaticStuff(req, res);
  } else {
    runStaticStuff(req, res, {
      status: 503,
    });
  }
});

var invalidRoomIdWss = (wss = new ws.WebSocketServer({
  noServer: true,
  ...wssServerOptions,
}));

invalidRoomIdWss.on("connection", (ws, request) => {
  ws.send(JSON.stringify({ type: "invalidRoomId" }));
  var timeout = setTimeout(() => {
    ws.close();
  }, 1000);
  ws.on("close", () => {
    clearTimeout(timeout);
  });
});

var directCloseWss = new ws.WebSocketServer({
  noServer: true,
  ...wssServerOptions,
});
wss.on("connection", (ws, request) => {
  ws.close();
});

server.on("upgrade", async function upgrade(request, socket, head) {
  if (applyRateLimit(request)) {
    const response = [
      "HTTP/1.1 429 Too Many Requests", // Status line
      "Content-Type: text/plain", // Header
      "Connection: close", // Tell the client to close the connection
      "", // Empty line signifies end of headers
      "WebSocket upgrade rejected", // Body of the response
    ].join("\r\n");

    socket.end(response);
    return;
  }

  var url = decodeURIComponent(request.url);
  var urlsplit = url.split("/");
	var method = urlsplit[1];
  var id = urlsplit[2];
  var wss = null;
  try {
    if (method == "notifications") {
      notifyWSS.handleUpgrade(request, socket, head, function done(ws) {
        notifyWSS.emit("connection", ws, request);
      });
      return;
    }
    if (method == "scratchcloud") {
      scratchCloudWss.handleUpgrade(request, socket, head, function done(ws) {
        scratchCloudWss.emit("connection", ws, request);
      });
      return;
    }
    if (id && method == "room") {
      id = id.toLowerCase();
      var roomWs = roomWebsockets[id.toString()];
      if (roomWs) {
        if (roomWs == "loading") {
          wss = roomStillLoadingWss;
        } else {
          wss = roomWs;
        }
      } else {
        roomWebsockets[id] = roomStillLoadingWss;
        try {
          wss = await startRoomWSS(id);
          if (wss == "NO_ROOM") {
            wss = noRoomWss;
            roomWebsockets[id] = undefined;
          } else {
            roomWebsockets[id] = wss;
          }
        } catch (e) {
          console.log("Room failed to load: ", e);
          wss = directCloseWss;
        }
      }
    } else {
      wss = invalidRoomIdWss;
    }
  } catch (e) {
    console.log("Got strange error from processing websocket request: ", e);
    wss = directCloseWss;
  }

  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});
/*
//Simple debugging to see if the detection is working.
function debugLogOnlineSockets() {
  for (var onlinePerson of Object.keys(usersOnlineSockets)) {
    console.log(
      "[" + onlinePerson + "]: " + usersOnlineSockets[onlinePerson].length
    );
  }
}
setInterval(() => {
  debugLogOnlineSockets();
}, 2000);*/

/*setInterval(() => {
  for (var username of Object.keys(notificationsForUsers)) {
    sendNotify(username, {
      type: "test",
    });
    console.log("Send to: " + username);
  }
}, 5000);*/

var serverPort = 3000;
if (process.env.serverPort) {
  serverPort = Number(process.env.serverPort);
}
if (process.env.PORT) {
  serverPort = Number(process.env.PORT);
}
(async function () {
  await checkServerLoop(); //when it loops back, it accepts the promise.
  server.listen(serverPort, () => {
	console.log("Server active on http://localhost:" + serverPort);
  });
})();
