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
var wss = wssHandler.wss;
var encryptor = require("../encrypt");
var gvbbaseStorage = require("./storage.js"); //Supabase storage module.
var cons = require("./constants.js");
var storage = new gvbbaseStorage(process.env.sbBucket, process.env.sbURL, process.env.sbAPIKey);
var messageChatNumber = 0;
var adminKey = process.env.adminKey;
var contentRange = require("content-range");
var appealURL = process.env.formURL;
var mailWs = new ws.WebSocketServer({ noServer: true });
var commandHandler = require("./commands.js");
if (!adminKey) {
  adminKey = false;
}
var usernameSafeChars = cons.USERNAME_CHAR_SET;
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
function generateRandomStuff(id) {
  var key = {
    0: "a",
    1: "1",
    2: "b",
    3: "2",
    4: "c",
    5: "3",
    6: "d",
    7: "4",
    8: "e",
    9: "5",
    e: "f",
    _: "z",
  };
  var gennumberid = id;
  var output = "";
  var str = gennumberid.toString();
  var i = 0;
  while (i < str.length) {
    //Use the numbers of the id to make the rest of the key.
    output += key[str[i]];
    i += 1;
  }

  var str = "_";
  var i = 0;
  while (i < 10) {
    str += Math.round(Math.random() * 9);
    i += 1;
  }
  var i = 0;
  while (i < str.length) {
    //Use the numbers of the id to make the rest of the key.
    output += key[str[i]];
    i += 1;
  }
  return output;
}
function setNoCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  /*res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );*/
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
async function getUserProfilePictureResponse (username,req,res) {
  try{
    await storage.downloadFileResponseProxy(`user-${username}-profile`,{},res,["content-type"]);
  }catch(e){
    var pfp = fs.readFileSync("template/default_pfp.png");
    res.setHeader("content-type","image/png");
    res.end(pfp);
  }
}

function waitBusboyFile(req) {
  return new Promise((accept, reject) => {
    var busboy = Busboy({ headers: req.headers });
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
    var color = "#000000";
    if (typeof json.color == "string") {
      color = json.color;
    }
    var displayName = username;
    if (typeof json.displayName == "string") {
      displayName = json.displayName;
    }

    if (json.password == password) {
      return {
        success: true,
        valid: true,
        color,
        displayName
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
      await storage.uploadFile(
        `user-${username}.json`,
        JSON.stringify({
          password: password,
          bio: "",
        }),
        "application/json"
      );
      return {
        success: true,
        valid: true,
      };
    }
  } catch (e) {
    return { success: false, error: true, message: e.toString() };
  }
}
async function updateUserPassword(username, newPassword) {
  var data = await storage.downloadFile(`user-${username}.json`);
  var json = JSON.parse(data);
  json.password = newPassword;

  await storage.uploadFile(
    `user-${username}.json`,
    JSON.stringify(json),
    "application/json"
  );
}
async function addProjectToUserList(username, newProjectID) {
  try {
    var data = await storage.downloadFile(`user-projects-${username}.json`);
  } catch (e) {
    await storage.uploadFile(
      `user-projects-${username}.json`,
      JSON.stringify([{ id: newProjectID, title: "Untitled Game" }]),
      "application/json"
    );
    return;
  }
  var json = JSON.parse(data);

  json.push({ id: newProjectID, title: "Untitled Game" });

  await storage.uploadFile(
    `user-projects-${username}.json`,
    JSON.stringify(json),
    "application/json"
  );
}
async function updateProjectToUserList(username, ProjectID, newTitle) {
  try {
    var data = await storage.downloadFile(`user-projects-${username}.json`);
  } catch (e) {
    await storage.uploadFile(
      `user-projects-${username}.json`,
      JSON.stringify([{ id: ProjectID, title: newTitle }]),
      "application/json"
    );
    return;
  }
  var json = JSON.parse(data);

  for (var obj of json) {
    if (obj.id == ProjectID) {
      obj.title = newTitle;
    }
  }

  await storage.uploadFile(
    `user-projects-${username}.json`,
    JSON.stringify(json),
    "application/json"
  );
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
async function increaseIdAndGetId(file) {
  try {
    await storage.getFileStatus(file);
  } catch (e) {
    await storage.uploadFile(file, "0", "text/plain");
  }
  var current = await storage.downloadFile(file);
  var currentId = Number(current.toString());
  currentId += 1;
  var id = currentId;
  await storage.uploadFile(file, currentId.toString(), "text/plain");
  return id;
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

var projectCountFile = "projects.txt";

function getProjectFileName(projectid) {
  return `project-${projectid}.gb2`;
}
function getProjectInfoFileName(projectid) {
  return `projectInfo-${projectid}.json`;
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

function makeDefaultProjectInfo(ownerUsername) {
  return {
    shared: false,
    owner: ownerUsername,
    comments: [],
  };
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

function createBan(username, reason) {
  var bans = JSON.parse(
    fs.readFileSync("lists/banlist.json", { encoding: "utf-8" })
  );
  bans[username] = {
    reason: reason,
  };
  fs.writeFileSync("lists/banlist.json", JSON.stringify(bans, null, "  "), {
    encoding: "utf-8",
  });
}

function removeBan(username, reason) {
  var bans = JSON.parse(
    fs.readFileSync("lists/banlist.json", { encoding: "utf-8" })
  );
  bans[username] = undefined;
  fs.writeFileSync("lists/banlist.json", JSON.stringify(bans, null, "  "), {
    encoding: "utf-8",
  });
}

function getCookieFromRequest(req) {
  return req.headers.cookie;
}

function hasAdmin(req) {
  var admin = false;
  var cookie = getCookie("admin", getCookieFromRequest(req));
  if (cookie == adminKey) {
    admin = true;
  }
  if (!adminKey) {
    //So if somebody forgets the key in the env exists, just always set it to false.
    admin = false;
  }
  return admin;
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
  return `Guest${Math.round(Math.random() * 10000)}`;
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

async function startRoomWSS(roomid) {
  var wss = new ws.WebSocketServer({ noServer: true });
  roomWebsockets[roomid.toString()] = "loading";
  var info = await getRoomInfo(roomid);
  if (!info) {
    return;
  }
  wss._rrRoomMessages = [];
  wss._rrPeopleCount = 0;
  function sendOnlineList() {
    var userlist = [];
    for (var cli of wss.clients) {
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
        isOwner: cli._rrIsOwner,
        isRealOwner: cli._rrIsRealOwner,
        micEnabled: isMicEnabled,
        camEnabled: isCamEnabled
      });
    }
    var onlist = JSON.stringify({
      type: "onlineList",
      list: userlist,
    });
    wss.clients.forEach((cli) => {
      cli.send(onlist);
    });
  }
  function sendRoomChatMessage(displayName, message) {
    messageChatNumber += 1;
    wss._rrRoomMessages.push({
      displayName,
      isServer: true,
      message: message,
    });
    wss._rrRoomMessages = wss._rrRoomMessages.slice(-100);
    wss.clients.forEach((cli) => {
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
  var currentScreenshareCode = null;
  var currentMediaEmbedURL = "";
  var currentScreensharingWebsocket = null;
  var connectionIDCount = 0;
  wss._rrCommandHandler = new commandHandler(wss);
  wss.on("connection", (ws, request) => {
    ws._rrConnectionID = connectionIDCount;
    connectionIDCount += 1;
    (async function () {
      ws._rrIsOwner = false;
      ws._rrIsRealOwner = false;
      var usercookie = getCookie("account", getCookieFromRequest(request));
      var displayName = generateGuestUsername();
      ws._rrUserColor = "#000000";
      if (usercookie) {
        var decryptedUserdata = encryptor.decrypt(usercookie);
        for (var cli of wss.clients) {
          if (cli._rrUsername && cli._rrLoggedIn) {
            if (cli._rrUsername.toLowerCase() == decryptedUserdata.username) {
              ws.send(JSON.stringify({ type: "usernameExists" }));
              ws.close();
              return;
            }
          }
        }
        var validation = await validateUser(
          decryptedUserdata.username,
          decryptedUserdata.password
        );
        if (validation.valid) {
          ws._rrLoggedIn = true;
          displayName = validation.displayName;
          ws._rrDisplayName = validation.displayName;
          ws._rrUserData = decryptedUserdata;
          ws._rrUsername = decryptedUserdata.username;
          ws._rrUserColor = validation.color;
          if (info.owners.indexOf(decryptedUserdata.username) > -1) {
            ws._rrIsOwner = true;
            if (info.owners.indexOf(decryptedUserdata.username) == 0) {
              ws._rrIsRealOwner = true;
            }
          }
        } else {
          ws._rrLoggedIn = false;
          ws._rrDisplayName = displayName;
        }
      } else {
        ws._rrLoggedIn = false;
        ws._rrDisplayName = displayName;
      }
      ws._rrDisplayName = displayName;
      ws._rrJoinTime = getFormattedTime();
      ws._rrCameraCode = null;
      ws._rrOtherCams = {};
      ws._rrMicCode = null;
      ws._rrOtherMics = {};
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
      ws.on("pong", () => {
        clearTimeout(ws._rrkeepAliveTimeout);
        ws._rrkeepAliveTimeout = setTimeout(() => {
          try {
            ws.close();
          } catch (e) {}
        }, 10000);
      });
      ws.on("message", (data) => {
        try {
          var json = JSON.parse(data.toString());
        } catch (e) {
          console.log(`Websocket json decode error: ${e}`);
          return;
        }
        try {
          if (json.type == "playSoundboard") {
            for (var client of wss.clients) {
              client.send(
                JSON.stringify({
                  type: "playSoundboard",
                  index: json.index,
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
          if (json.type == "changeColor") {
            if (typeof json.color == "string") {
              ws._rrUserColor = json.color;
            }
          }
          if (json.type == "refresh" && ws._rrIsOwner) {
            for (var client of wss.clients) {
              client.close();
            }
            wss.close();
            roomWebsockets[roomid.toString()] = undefined;
            startRoomWSS(roomid);
          }
          if (json.type == "media") {
            if (json.command == "mediaResetRequest") {
              currentScreenshareCode = null;
              currentScreensharingWebsocket = null;
              currentMediaEmbedURL = null;
              wss.clients.forEach((cli) => {
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
            if (json.command == "screenshareRunning") {
              currentScreenshareCode = json.code;
              currentScreensharingWebsocket = ws._rrConnectionID;
              wss.clients.forEach((cli) => {
                cli.send(
                  JSON.stringify({
                    type: "media",
                    command: "screenshareRun",
                    code: currentScreenshareCode,
                  })
                );
              });
            }
            if (json.command == "mediaEmbedRunning") {
              if (typeof json.url !== "string") {
                return;
              }
              if (json.url.length < 1) {
                return;
              }
              currentMediaEmbedURL = json.url;
              wss.clients.forEach((cli) => {
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
              cli.send(
                JSON.stringify({
                  type: "userIsTyping",
                  displayName: displayName,
                  username: ws._rrUsername,
                  color: ws._rrUserColor
                })
              );
            });
          }
          if (json.type == "postMessage") {
            if (typeof json.message == "string") {
              messageChatNumber += 1;
              wss._rrRoomMessages.push({
                displayName: displayName,
                username: ws._rrUsername,
                message: json.message,
                color: ws._rrUserColor,
              });
              wss._rrRoomMessages = wss._rrRoomMessages.slice(-100);
              wss.clients.forEach((cli) => {
                cli.send(
                  JSON.stringify({
                    type: "newMessage",
                    message: json.message,
                    username: ws._rrUsername,
                    displayName: displayName,
                    color: ws._rrUserColor,
                  })
                );
              });
              if (ws._rrLoggedIn && ws._rrIsOwner) {
                wss._rrCommandHandler.handleMessage(ws,json.message);
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
          type: "roomName",
          name: info.name,
          id: roomid,
        })
      );
      sendOnlineList();
      sendRoomChatMessage(
        "[Random Rants +]",
        `${displayName} has joined the room.`
      );
      ws._rrPeopleCount += 1;
      ws.on("close", () => {
        clearTimeout(ws._rrkeepAliveTimeout);
        ws._rrPeopleCount -= 1;
        sendOnlineList();
        sendRoomChatMessage(
          "[Random Rants +]",
          `${displayName} has left the room.`
        );
        if (ws._rrConnectionID == currentScreensharingWebsocket) {
          currentScreenshareCode = null;
          currentScreensharingWebsocket = null;
          wss.clients.forEach((cli) => {
            cli.send(
              JSON.stringify({
                type: "media",
                command: "screenshareStop",
              })
            );
          });
        }
      });
    })();
  });
  
  wss._rrReloadUserlist = function () {
    sendOnlineList();
  };
  
  wss._rrRefreshRoom = function () {
    for (var client of wss.clients) {
      client.close();
    }
    wss.close();
    roomWebsockets[roomid.toString()] = undefined;
    startRoomWSS(roomid);
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
    
    
    for (let client of wss.clients) {
      let wasOwner = client._rrIsOwner;
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
      
      client.send(
        JSON.stringify({
          type: "roomName",
          name: info.name,
          id: roomid,
        })
      );
    }

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
                  isSelf: isSelf
                })
              );
            }
            
            if (
              client._rrOtherMics[client2._rrConnectionID] !==
              client2._rrMicCode
            ) {
              client._rrOtherMics[client2._rrConnectionID] =
                client2._rrMicCode;
              client.send(
                JSON.stringify({
                  type: "microphoneUpdate",
                  id: client2._rrConnectionID,
                  code: client._rrOtherMics[client2._rrConnectionID],
                  displayName: client2._rrDisplayName,
                  username: client2._rrUsername,
                  color: client2._rrUserColor,
                  isSelf: isSelf
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
      client.ping();
      client.send(JSON.stringify({ type: "keepAlive" }));
    }
  },100);

  roomWebsockets[roomid.toString()] = wss;
  return wss;
}

var fileUploads = {};
var fileUploadCount = 0;
var fileUploadTypes = {};

const server = http.createServer(async function (req, res) {
  setNoCorsHeaders(res);

  var url = decodeURIComponent(req.url);
  var urlsplit = url.split("/");

  var usercookie = getCookie("account", getCookieFromRequest(req));

  if (usercookie) {
    var decryptedUserdata = encryptor.decrypt(usercookie);
  }

  if (urlsplit[1] == "uploads") {
    if (urlsplit[2] == "file" && req.method == "POST") {
      (async function () {
        try {
          var size = 0;
          if (req.headers["content-length"] > cons.MAX_IMAGE_SIZE) {
            size = parseInt(req.headers["content-length"], 10);
          }

          if (size > cons.MAX_IMAGE_SIZE) {
            res.statusCode = 413;
            res.end("File is too big.");
            return;
          }
          var fileInfo = await waitBusboyFile(req);
          if (fileInfo.buffer.length > cons.MAX_IMAGE_SIZE) {
            res.statusCode = 413;
            res.end("File is too big.");
            return;
          }
          var id = fileUploadCount + "z" + Math.round(Math.random() * 100000);
          fileUploads[id] = fileInfo.buffer;
          fileUploadTypes[id] = fileInfo.mimeType;
          fileUploadCount += 1;
          res.end(JSON.stringify({ id }));
          setInterval(() => {
            fileUploadTypes[id] = null;
            fileUploads[id] = null;
          }, 1000 * 60 * (60 * 2)); //should be two hours
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
        var data = fileUploads[id];

        // Get the file length
        var fileLength = data.length;

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

            // Slice the data for the requested byte range
            var chunk = data.slice(start, end + 1);

            // Set headers for partial content response
            res.statusCode = 206; // Partial Content
            res.setHeader("Content-Type", type); // Correct MIME type for audio
            res.setHeader(
              "Content-Range",
              `bytes ${start}-${end}/${fileLength}`
            );
            res.setHeader("Content-Length", chunk.length);
            res.setHeader("Accept-Ranges", "bytes"); // Inform the client we support ranges

            // Send the chunk of data for the requested range
            res.end(chunk);
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
        res.end(data);
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
          var roomCount = JSON.parse(
            fs.readFileSync("counters/rooms.json").toString()
          );
          roomCount.count += 1;
          var roomNumber = roomCount.count;
          fs.writeFileSync("counters/rooms.json", JSON.stringify(roomCount));
          var roomId = generateRandomStuff(roomNumber);

          if (!decryptedUserdata) {
            res.statusCode = 401;
            res.end("");
            return;
          }
          var stuff = await validateUser(
            decryptedUserdata.username,
            decryptedUserdata.password
          );
          if (!stuff.valid) {
            res.statusCode = 401;
            res.end("");
            return;
          }

          var roomInfo = {
            name: decryptedUserdata.username+"'s Room",
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
          if (json.name.length > 100) {
            res.statusCode = 400;
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
            roomData.name = name;
            await storage.uploadFile(
              `room-${json.id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              roomWebsockets[id]._rrUpdateRoomInfo();
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
    if (urlsplit[2] == "addowner" && req.method == "POST") {
      (async function () {
        try {
          if (!decryptedUserdata) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());

          if (typeof json.who !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }
          var id = urlsplit[3];
          if (!id) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
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
            `room-${id}-info.json`
          );
          var roomData = JSON.parse(roomBuffer.toString());
          if (roomData.owners.indexOf(decryptedUserdata.username) > -1) {
            if (roomData.owners.indexOf(json.who) < 0) {
              roomData.owners.push(json.who);
            }
            await storage.uploadFile(
              `room-${id}-info.json`,
              JSON.stringify(roomData),
              "application/json"
            );
            if (roomWebsockets[id]) {
              try{
                await roomWebsockets[id]._rrUpdateRoomInfo();
                roomWebsockets[id]._rrSendChatMessage("[Random Rants +]",`${json.who} is now an owner.`);
              }catch(e){
                
              }
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          console.log(e);
          res.statusCode = 500;
          res.end("");
        }
      })();
      return;
    }
    if (urlsplit[2] == "removeowner" && req.method == "POST") {
      (async function () {
        try {
          if (!decryptedUserdata) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var body = await waitForBody(req);
          var json = JSON.parse(body.toString());

          if (typeof json.who !== "string") {
            res.statusCode = 400;
            res.end("");
            return;
          }
          var id = urlsplit[3];
          if (!id) {
            res.statusCode = 400;
            res.end("");
            return;
          }
          if (defaultRooms.indexOf(id) > -1) {
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
            `room-${id}-info.json`
          );
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
              try{
                await roomWebsockets[id]._rrUpdateRoomInfo();
                roomWebsockets[id]._rrSendChatMessage("[Random Rants +]",`${json.who} is no longer an owner.`);
              }catch(e){
                
              }
            }
            res.end("");
          } else {
            res.statusCode = 401;
            res.end("");
            return;
          }
        } catch (e) {
          console.log(e);
          res.statusCode = 500;
          res.end("");
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
      var decrypted = {};
      try {
        try {
          var accountcookie = getCookie("account", getCookieFromRequest(req));
          if (!accountcookie) {
            res.end(
              JSON.stringify({
                message: "No account cookie.",
                error: true,
                valid: false,
                success: false,
              })
            );
            return;
          } else {
            decrypted = encryptor.decrypt(
              getCookie("account", getCookieFromRequest(req))
            );
            if (!decrypted) {
              res.end(
                JSON.stringify({
                  message: "Broken account cookie.",
                  error: true,
                  valid: false,
                  success: false,
                })
              );
              return;
            }
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
        var stuff = await validateUser(decrypted.username, decrypted.password);
        var infoJson = {
          username: decrypted.username,
          ...stuff,
        };
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
            password: json.password,
          });
          writeMail(json.username, {
            type: "welcome",
            values: {},
          });
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader("Set-Cookie", `account=${value}; Path=/;`);
        }
        res.end(JSON.stringify(stuff));
      });
      return;
    }
    if (urlsplit[2] == "picture" && req.method == "GET") {
      getUserProfilePictureResponse(urlsplit[3].split('?')[0],req,res);
      return;
    }
    if (urlsplit[2] == "picture" && req.method == "POST") {
      try{
        var body = await waitForBody(req);
        var decrypted = encryptor.decrypt(
          getCookie("account", getCookieFromRequest(req))
        );
        var stuff = await validateUser(decrypted.username, decrypted.password);
        if (stuff.valid) {
          try {
            if (!body) {
              await storage.deleteFile(`user-${decrypted.username}-profile`);
              res.end("");
              return;
            }
            var buffer = Buffer.from(body.toString(), "base64");
            if (buffer.length > cons.MAX_PROFILE_PICTURE_SIZE) {
              await storage.deleteFile(`user-${decrypted.username}-profile`);
              res.end("");
              return;
            }
            await uploadUserProfilePicture(
              decrypted.username,
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
      }catch(e){
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

    if (urlsplit[2] == "profile" && req.method == "POST") {
      if (!decryptedUserdata) {
        runStaticStuff(req, res, {
          status: 403,
        });
        return;
      }
      var body = await waitForBody(req);
      var bodyJson = JSON.parse(body.toString());
      var stuff = await validateUser(
        decryptedUserdata.username,
        decryptedUserdata.password
      );
      if (!stuff.valid) {
        runStaticStuff(req, res, {
          status: 403,
        });
        return;
      }
      var profileUsername = decryptedUserdata.username;
      var profileFile = `user-${profileUsername}.json`;
      try {
        var profileRaw = await storage.downloadFile(profileFile);
        var profileJson = JSON.parse(profileRaw.toString());
        if (typeof bodyJson.bio == "string") {
          profileJson.bio = bodyJson.bio.slice(0, cons.MAX_BIO_SIZE);
        }
        await storage.uploadFile(
          profileFile,
          JSON.stringify(profileJson),
          "application/json"
        );
        res.end("");
      } catch (e) {
        runStaticStuff(req, res, {
          status: 500,
        });
        return;
      }
      return;
    }
    if (urlsplit[2] == "writemail" && req.method == "POST") {
      if (decryptedUserdata) {
        var stuff = await validateUser(
          decryptedUserdata.username,
          decryptedUserdata.password
        );
        if (!stuff.valid) {
          runStaticStuff(req, res, {
            status: 403,
          });
          return;
        }
        var body = await waitForBody(req);
        var json = JSON.parse(body.toString());
        if (typeof json.username == "string") {
          if (typeof json.message == "string") {
            var success = await writeMail(
              json.username.toLowerCase(),
              {
                type: "written",
                values: {
                  from: decryptedUserdata.username,
                  message: json.message.slice(0, 250),
                },
              },
              decryptedUserdata.username.toLowerCase()
            );
            res.end(JSON.stringify({ success: success }));
            return;
          }
        }
        res.statusCode = 400;
        res.end("");
      } else {
        res.end("");
      }
      return;
    }
    if (urlsplit[2] == "myrooms" && req.method == "GET") {
      if (decryptedUserdata) {
        try {
          var stuff = await validateUser(
            decryptedUserdata.username,
            decryptedUserdata.password
          );
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var profileFile = `user-${decryptedUserdata.username}.json`;
          var profileRaw = await storage.downloadFile(profileFile);
          var json = JSON.parse(profileRaw.toString());
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
                });
              }
            }
            roomlistreal.push({
              name: room.name,
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

            var stuff = await validateUser(
              decryptedUserdata.username,
              decryptedUserdata.password
            );
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
                    room.invited = undefined;
                  }
                }
              } else {
                rooms.push({ name: json.name, id: json.id });
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

            var stuff = await validateUser(
              decryptedUserdata.username,
              decryptedUserdata.password
            );
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

            var stuff = await validateUser(
              decryptedUserdata.username,
              decryptedUserdata.password
            );
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

            var stuff = await validateUser(
              decryptedUserdata.username,
              decryptedUserdata.password
            );
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
            if (profilejson.displayName.length > 100) {
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

            var stuff = await validateUser(
              decryptedUserdata.username,
              decryptedUserdata.password
            );
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
    if (urlsplit[2] == "mail" && req.method == "GET") {
      //Get current mail for user.
      if (decryptedUserdata) {
        try {
          var stuff = await validateUser(
            decryptedUserdata.username,
            decryptedUserdata.password
          );
          if (!stuff.valid) {
            runStaticStuff(req, res, {
              status: 403,
            });
            return;
          }
          var profileFile = `user-${decryptedUserdata.username}.json`;
          var profileRaw = await storage.downloadFile(profileFile);
          var json = JSON.parse(profileRaw.toString());
          //Check if mail is array.
          if (Array.isArray(json.mail)) {
            //Although maybe should add filters to the mail to prevent unknown mail types from appearing, this is the best way to do so.
            res.end(
              JSON.stringify(
                {
                  mail: json.mail,
                },
                null,
                "  "
              )
            );
          } else {
            res.end(
              JSON.stringify(
                {
                  mail: [],
                },
                null,
                "  "
              )
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
            password: json.password,
          });
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader("Set-Cookie", `account=${value}; Path=/;`);
        }
        res.end(JSON.stringify(stuff));
      });
      return;
    }
    if (urlsplit[2] == "passwordchange" && req.method == "POST") {
      var body = "";
      req.on("data", (d) => {
        body += d;
      });
      req.on("end", async () => {
        var json = JSON.parse(body);
        var decrypted = encryptor.decrypt(
          getCookie("account", getCookieFromRequest(req))
        );
        var valid = await validateUser(decrypted.username, decrypted.password);
        var resp = {};
        if (valid.valid) {
          try {
            if (json.newPassword.length < cons.MIN_PASSWORD_LENGTH) {
              resp = {
                success: false,
                error: true,
                message:
                  "Password must be greather than " +
                  cons.MIN_PASSWORD_LENGTH +
                  " characters.",
              };
            }
            if (json.newPassword.length > cons.MAX_PASSWORD_LENGTH) {
              resp = {
                success: false,
                error: true,
                message:
                  "Password must be less than " +
                  cons.MAX_PASSWORD_LENGTH +
                  " characters.",
              };
            }
            if (!resp.error) {
              await updateUserPassword(decrypted.username, json.newPassword);
              resp.success = true;
              var value = encryptor.encrypt({
                username: decrypted.username.toLowerCase(),
                password: json.newPassword,
              });
              res.setHeader("Set-Cookie", `account=${value}; Path=/;`);
            }
          } catch (e) {
            resp.success = false;
            resp.error = e;
          }
        } else {
          resp.success = false;
        }
        res.end(JSON.stringify(resp));
      });
      return;
    }
  }

  if (urlsplit[1]) {
    var adminFiles = ["admin.html", "admin", "admin.js"];
    var safeurl = urlsplit[1].toLowerCase();
    safeurl = URL.parse(urlsplit[1].toLowerCase()).pathname;
    if (adminFiles.indexOf(safeurl) > -1) {
      var admin = hasAdmin(req);
      if (!admin) {
        runStaticStuff(req, res, {
          status: 403,
        });
        return;
      }
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

server.on("upgrade", async function upgrade(request, socket, head) {
  var url = decodeURIComponent(request.url);
  var urlsplit = url.split("/");
  var id = urlsplit[1];
  var wss = null;
  if (id) {
    id = id.toLowerCase();
    var roomWs = roomWebsockets[id.toString()];
    if (roomWs) {
      if (roomWs == "loading") {
        wss = new ws.WebSocketServer({ noServer: true });
        wss.on("connection", (ws, request) => {
          ws.close();
        });
      } else {
        wss = roomWs;
      }
    } else {
      wss = await startRoomWSS(id);
      if (!wss) {
        wss = new ws.WebSocketServer({ noServer: true });

        wss.on("connection", (ws, request) => {
          ws.close();
        });
      }
    }
  } else {
    wss = new ws.WebSocketServer({ noServer: true });

    wss.on("connection", (ws, request) => {
      ws.close();
    });
  }

  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

(async function () {
  await checkServerLoop(); //when it loops back, it accepts the promise.
  server.listen(3000);
})();
