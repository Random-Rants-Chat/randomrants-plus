var com = {};

var rrURL = "https://random-rants-chat.github.io/";
var elements = require("../../../gp2/elements.js");
var dialogs = require("../../../dialogs.js");
var sws = require("../sharedwebsocket.js");

com.crash = function () {
  while (true) {};
};

com.popupMessage = function (message) {
  dialogs.alert(message);
};

com.macreJoke = function () {
  var img = document.createElement("img");
  img.src = rrURL+"macres-a.svg";
  img.style.top = "0";
  img.style.left = "0";
  img.style.position = "fixed";
  img.style.width = "100vw";
  img.style.height = "100vh";
  img.style.pointerEvents = "none";
  document.body.append(img);
  setTimeout(async () => {
    var audio = new Audio(
      rrURL+"pause-or-balls-which-one.wav"
    );
    audio.looped = false;
    await audio.play();
    img.src = rrURL+"macres-b.svg";

    audio.onended = () => {
      img.src = rrURL+"macres-a.svg";
      setTimeout(async () => {
        img.remove();
      }, 500);
    };
  }, 500);
};

com.luigJoke = async function () {
  var video = document.createElement("video");
  video.src = rrURL+"luig.mp4";
  video.style.top = "0";
  video.style.left = "0";
  video.style.position = "fixed";
  video.style.width = "100vw";
  video.style.height = "100vh";
  await video.play();
  document.body.append(video);
  video.onended = () => {
    video.remove();
  };
};

com.spin = function () {
  var rotatedeg = 0;
  var chat = document.body;
  var int = setInterval(() => {
    var spd = (360 * 2 - rotatedeg) / 5;
    if (spd > 30) {
      spd = 30;
    }
    if (spd < -30) {
      spd = -30;
    }
    rotatedeg += spd;
    chat.style.rotate = rotatedeg + "deg";
    if (rotatedeg + 0.2 > 360 * 2) {
      chat.style.rotate = "";

      clearInterval(int);
    }
  }, 1000 / 60);
};

com.popcat = function (time) {
  var ms = 1000;
    if (Number(time)) {
      ms = Number(time) * 1000;
    }
    if (ms > 7000) {
      ms = 7000;
    }
    var img = document.createElement("img");
    var mouthOpen = false;
    img.style.top = "0";
    img.style.left = "0";
    img.style.position = "fixed";
    img.style.width = "100vw";
    img.style.height = "100vh";
    img.style.objectFit = "contain";
    img.style.pointerEvents = "none";
    document.body.append(img);
    var interval = setInterval(() => {
      mouthOpen = !mouthOpen;
      if (mouthOpen) {
        img.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/pop-cat2.png?v=1713969814980";
        var popcat = document.createElement("audio");
        popcat.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/infographic-pop-8-197875.mp3?v=1713915310573";
        popcat.play();
      } else {
        img.src =
          "https://cdn.glitch.global/fa5e6d1e-8b42-4a21-81e8-03fd7cd6401a/pop-cat.png?v=1713969813552";
      }
    }, 1000 * 0.06);
    setTimeout(() => {
      clearInterval(interval);
      img.remove();
    }, ms);
};

com.kick = function () {
  sws.close();
  window.location.href = "/chat";
};

module.exports = com;
