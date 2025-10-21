async function fetchAsJSON(url, options) {
  var a = await fetch(url, options);
  var b = await a.json();

  return b;
}

var audioEngine = require("../audio.js");

var elements = require("../gp2/elements.js");
var emojiContainer = elements.getGPId("emojiContainer");

var EMOJIS = [
  "😂",
  "🤣",
  "💀",
  "🤨",
  "😎",
  "🤪",
  "🤨",
  "😭",
  "🤫",
  "😝",
  "🗣️",
  "🔊",
  "🎙️",
];
var EMOJISound = null;

(async function () {
  var soundURLS = await fetchAsJSON("external/uisound.json");
  EMOJISound = await audioEngine.loadSoundFromURL(soundURLS.select);
})();

var INITIAL_EMOJIS = 150;
var MAX_SAFE_LIMIT = 600;

function createFloatingEmoji(spawnAnywhere = false, spawnAt) {
  if (MAX_SAFE_LIMIT < emojiContainer.children.length) {
    return;
  }
  var emoji = document.createElement("div");
  emoji.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  emoji.style.position = "absolute";
  emoji.style.fontSize = `${200 + Math.random() * 100}%`;

  var startX = Math.random() * window.innerWidth;
  var offsetX = (Math.random() - 0.5) * 100;

  var startY = spawnAnywhere
    ? Math.random() * window.innerHeight
    : window.innerHeight + 30 + Math.random() * 50;
  if (spawnAt) {
    startX = spawnAt.x;
    startY = spawnAt.y;
  }
  var endY = -50;

  emoji.style.left = `${startX}px`;
  emoji.style.top = `${startY}px`;
  emoji.style.opacity = `${0.6 + Math.random() * 0.4}`;
  emoji.style.transformOrigin = "center";
  emoji.style.cursor = "pointer";
  emoji.style.userSelect = "none";
  emoji.style.outline = "none";
  emoji.style.willChange = "transform, top, left";
  var animationRunning = true;
  if (spawnAnywhere) {
    var anim = emoji.animate(
      [{ transform: "scale(0)" }, { transform: "scale(1)" }],
      {
        duration: 350,
        iterations: 1,
        easing: "ease-out",
      }
    );
  }

  emoji.onclick = function () {
    animationRunning = false;
    if (audioEngine.running) {
      var sound = new audioEngine.Player(EMOJISound);
      sound.play();
    }
    emoji.onclick = null;
    emoji.style.pointerEvents = "none";
    var animation = emoji.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(3.5)", opacity: "0", filter: "brightness(5)" },
      ],
      {
        duration: 350,
        iterations: 1,
        easing: "ease-out",
      }
    );
    animation.addEventListener("finish", () => {
      emoji.remove();
    });
  };

  emojiContainer.appendChild(emoji);

  var startTime = performance.now();
  var now = performance.now();
  var lastTimestamp = startTime;
  var duration = 1000 + Math.random() * 2000;
  var SPEED = 120;
  var offset = Math.random() * 5;
  var lastTime = performance.now();
  var elapsedFrameTime = 0;
  var elapsed = 0;

  function animate() {
    if (!animationRunning) {
      return;
    }
    elapsedFrameTime = performance.now() - lastTime;
    lastTime = performance.now();
    if (elapsedFrameTime < 250) {
      elapsed += elapsedFrameTime;
    }
    var distanceMoved = (elapsed / 1000) * SPEED;
    var currentY = startY - distanceMoved;
    var currentX = startX + offsetX * (elapsed / duration);

    emoji.style.left = `${currentX}px`;
    emoji.style.top = `${currentY}px`;
    emoji.style.transform = `rotate(${Math.sin(elapsed / 400 + offset) * 10}deg)`;

    if (currentY < endY) {
      emoji.remove();
    } else {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// Spawn a bunch initially across the screen
for (let i = 0; i < INITIAL_EMOJIS; i++) {
  createFloatingEmoji(true);
}

// New emojis rise from the bottom after
setInterval(() => {
  if (document.visibilityState !== "visible") {
    return;
  }
  var x = 0;
  while (x < window.innerWidth) {
    if (document.visibilityState === "visible") {
      createFloatingEmoji(false, {
        x,
        y: window.innerHeight + 30 + Math.random() * 70,
      });
    }
    x += 120;
  }
}, 400);
