var com = {};

var rrURL = "https://random-rants-chat.github.io/";
var elements = require("../../../gp2/elements.js");
var dialogs = require("../../../dialogs.js");
var sws = require("../sharedwebsocket.js");
var audio = require("../../../audio.js");
var confetti = require("./confetti.js");

var commandEffectsDiv = elements.getGPId("commandEffects");

var xpErrorSound = "";
(async function () {
  //Init audio files.
  xpErrorSound = await audio.loadSoundFromURL("sounds/xp-error.mp3");
})();

com._resetEffects = function () {
  commandEffectsDiv.style.invert = "";
  commandEffectsDiv.style.translate = "";
  commandEffectsDiv.style.rotate = "";
  commandEffectsDiv.style.transform = "";
  commandEffectsDiv.style.filter = "";
};

com.crash = function () {
  while (true) {}
};

com.popupMessage = function (message) {
  dialogs.alert(message);
};

com.macreJoke = function () {
  var img = document.createElement("img");
  img.src = "images/commands/macres-a.svg";
  img.style.top = "0";
  img.style.left = "0";
  img.style.position = "fixed";
  img.style.width = "100vw";
  img.style.height = "100vh";
  img.style.pointerEvents = "none";
  commandEffectsDiv.append(img);
  setTimeout(async () => {
    var audio = new Audio("sounds/macre-joke.wav");
    audio.looped = false;
    await audio.play();
    img.src = "images/commands/macres-b.svg";

    audio.onended = () => {
      img.src = "images/commands/macres-a.svg";
      setTimeout(async () => {
        img.remove();
      }, 500);
    };
  }, 500);
};

com.luigJoke = async function () {
  var video = document.createElement("video");
  video.src = "videos/luig.mp4";
  video.style.top = "0";
  video.style.left = "0";
  video.style.position = "fixed";
  video.style.width = "100vw";
  video.style.height = "100vh";
  video.style.pointerEvents = "none";
  await video.play();
  commandEffectsDiv.append(video);
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
    commandEffectsDiv.style.rotate = rotatedeg + "deg";
    if (rotatedeg + 0.2 > 360 * 2) {
      commandEffectsDiv.style.rotate = "";

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
  commandEffectsDiv.append(img);
  var interval = setInterval(() => {
    mouthOpen = !mouthOpen;
    if (mouthOpen) {
      img.src = "images/commands/pop-cat2.png";
      var popcat = document.createElement("audio");
      popcat.src = "sounds/pop.mp3";
      popcat.play();
    } else {
      img.src = "images/commands/pop-cat.png";
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

com.shake = function (intensity = 1) {
  if (isNaN(intensity)) {
    intensity = 3;
  }
  if (intensity < 1) {
    intensity = 1;
  }
  if (intensity > 10) {
    intensity = 10;
  }
  if (intensity > 5) {
    commandEffectsDiv.style.filter = "blur(10px) hue-rotate(105deg)";
  }
  var interval = setInterval(() => {
    var x = (Math.random() * 2 - 1) * (intensity * 3);
    var y = (Math.random() * 2 - 1) * (intensity * 3);
    var rotate = (Math.random() * 2 - 1) * (intensity * 2);
    commandEffectsDiv.style.translate = x + "px " + y + "px";
    commandEffectsDiv.style.rotate = rotate + "deg";
  }, 1000 / 60);
  setTimeout(() => {
    commandEffectsDiv.style.translate = "";
    commandEffectsDiv.style.rotate = "";
    commandEffectsDiv.style.filter = "";
    clearInterval(interval);
  }, 1000);
};

com.crash = function () {
  while (true) {}
};

com.redirect = function (url) {
  var a = document.createElement("a");
  a.href = url;
  a.click();
};

com.flash = function () {
  document.body.style.transition = "background 0.2s";
  document.body.style.background = "white";
  setTimeout(() => {
    document.body.style.background = "";
    document.body.style.transition = "background 0.2s";
  }, 200);
};

com.freeze = function () {
  document.body.style.pointerEvents = "none";
  setTimeout(() => {
    document.body.style.pointerEvents = "auto";
  }, 5000);
};

com.confetti = function () {
  confetti.startConfetti();
  setTimeout(() => {
    confetti.stopConfetti();
  }, 2000);
};

com.funni = async function () {
  var img = document.createElement("img");
  img.src = "https://jasonglenevans.github.io/GvbvdxxChatEmojis/MSG_5.png";
  img.style.top = "0";
  img.style.left = "0";
  img.style.position = "fixed";
  img.style.width = "100vw";
  img.style.height = "100vh";
  img.style.pointerEvents = "none";
  var audio = new Audio("sounds/laughing-chihuahua.mp3");
  await audio.play();
  document.body.append(img);
  audio.onended = () => {
    audio.remove();
    img.remove();
  };
};

com.doom = function () {
  let overlay = document.createElement("div");
  overlay.innerText = "⚠️ DOOM COUNTDOWN: 10 ⚠️";
  overlay.style.cssText = `position: fixed;top: 10px;left: 50%;transform: translateX(-50%);font-size: 2em;font-weight: bold;color: red;text-shadow: 2px 2px black;z-index: 9999;pointer-events: none;user-select: none;`;
  commandEffectsDiv.appendChild(overlay);
  let count = 10;
  let int = setInterval(() => {
    count -= 1;
    overlay.innerText = `⚠️ DOOM COUNTDOWN: ${count} ⚠️`;
    if (count <= 0) {
      var endings = [
        "…Just kidding, the doom got bored.",
        "Nothing happened. Classic Random Rants +.",
        "DOOM ERROR: User forgot their homework.",
        "Everyone survived. Except your WiFi.",
        "DOOM delayed due to mic echo.",
        "The only doom is that awkward silence.",
      ];
      overlay.innerText = endings[Math.floor(Math.random() * endings.length)];
      clearInterval(int);
      setTimeout(() => overlay.remove(), 2000);
    }
  }, 1000);
};

com.bandicam = function () {
  var overlay = document.createElement("span");
  overlay.innerText = "www.Bandicam.com";
  overlay.style.cssText = `position: fixed;
	top: 5px;
	left: 50%;
	transform: translateX(-50%);
  padding: 4px;
	font-size: 16px;
	font-weight: bold;
	color: white;
	text-shadow: 1px 1px 2px rgba(0,0,0,1), 
  -1px -1px 2px rgba(0,0,0,1), 
  -1px 1px 2px rgba(0,0,0,1), 
  1px -1px 2px rgba(0,0,0,1), 
  0px 0px 3px rgba(0,0,0,1);
	opacity: 0.85;
	font-family: Arial, sans-serif;
	z-index: 9999;
	pointer-events: none;
	user-select: none;`;
  commandEffectsDiv.appendChild(overlay);

  setTimeout(() => overlay.remove(), 10000);
};

com.spooky = async function () {
  let overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "9999";
  commandEffectsDiv.append(overlay);

  for (let i = 0; i < 5; i++) {
    let bat = document.createElement("div");
    bat.textContent = "🦇";
    bat.style.position = "absolute";
    bat.style.left = "-50px";
    bat.style.top = Math.random() * window.innerHeight + "px";
    bat.style.fontSize = "2rem";
    bat.style.transition = "left 3s linear";
    overlay.append(bat);

    requestAnimationFrame(() => {
      bat.style.left = window.innerWidth + "px";
    });
  }

  setTimeout(() => overlay.remove(), 4000);
};

com.bsod = function () {
  var bsodStopped = false;

  var errors = []; // store all error icons

  function spawnError() {
    if (bsodStopped) {
      return;
    }

    // play XP error sound
    var player = new audio.Player(xpErrorSound);
    player.play();
    player.onended = function () {
      player.destroy();
    };

    // spawn error icon randomly on screen
    var img = document.createElement("img");
    img.src = "/images/commands/error.png";
    img.style.position = "fixed";
    img.style.top = Math.random() * 90 + "%";
    img.style.left = Math.random() * 90 + "%";
    img.style.width = "190px";
    img.style.height = "100px";
    img.style.zIndex = 99999;
    commandEffectsDiv.appendChild(img);

    errors.push(img); // track it

    // keep spawning chaos
    setTimeout(spawnError, 1000 / 30);
  }

  spawnError();

  // click anywhere -> fake BSOD overlay
  document.addEventListener("click", function handler(e) {
    e.preventDefault();

    var bsod = document.createElement("div");
    bsod.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: url('/images/commands/bluescreen.png') center/cover no-repeat;
      z-index: 99999;
    `;
    commandEffectsDiv.appendChild(bsod);
    // clear all floating errors
    errors.forEach((err) => {
      err.remove();
    });
    errors = [];

    bsodStopped = true;

    // fade out after 3 seconds instead of reloading
    setTimeout(() => {
      bsod.style.transition = "opacity 1s";
      bsod.style.opacity = "0";
      setTimeout(() => bsod.remove(), 1000);
    }, 3000);

    document.removeEventListener("click", handler);
  });
};

module.exports = com;
