var elements = require("../../gp2/elements.js");
var sws = require("./sharedwebsocket.js");

var emojiReactions = {};

var emojiReactionsContainer = elements.getGPId("emojiReactions");
var emojiReactionButtonsContainer = elements.getGPId("emojiReactionButtons");

var INITIAL_EMOJIS = 150;
var MAX_SAFE_LIMIT = 600;

function createFloatingEmoji(emojiText, spawnAnywhere = false, spawnAt) {
  try {
    var boundingBox = emojiReactionsContainer.getBoundingClientRect();
    if (MAX_SAFE_LIMIT < emojiReactionsContainer.children.length) {
      return;
    }
    var emoji = document.createElement("div");
    emoji.textContent = emojiText;
    emoji.style.position = "absolute";
    emoji.style.fontSize = `${200 + Math.random() * 100}%`;

    var startX = Math.random() * (boundingBox.width - 40);
    var offsetX = (Math.random() - 0.5) * 25;

    var startY = spawnAnywhere
      ? Math.random() * boundingBox.height
      : boundingBox.height - 50;
    if (spawnAt) {
      startX = spawnAt.x;
      startY = spawnAt.y;
    }
    var endY = -100;

    emoji.style.left = `${startX}px`;
    emoji.style.top = `${startY}px`;
    emoji.style.opacity = `${0.6 + Math.random() * 0.4}`;
    emoji.style.transformOrigin = "center";
    emoji.style.userSelect = "none";
    emoji.style.outline = "none";
    emoji.style.willChange = "transform, top, left";
    var animationRunning = true;

    emojiReactionsContainer.appendChild(emoji);

    emoji.animate(
      [
        {
          scale: "0",
          opacity: 0,
        },
        {
          scale: "1.1",
          opacity: 1,
        },
        {
          scale: "1",
          opacity: 1,
        },
      ],
      {
        easing: "ease-out",
        duration: 500,
      }
    );

    var startTime = performance.now();
    var now = performance.now();
    var lastTimestamp = startTime;
    var duration = 1000 + Math.random() * 2000;
    var SPEED = 120;
    var offset = Math.random() * 1;
    var lastTime = performance.now();
    var elapsedFrameTime = 0;
    var elapsed = 0;

    function animate() {
      if (!animationRunning) {
        return;
      }
      elapsedFrameTime = performance.now() - lastTime;
      lastTime = performance.now();
      //if (elapsedFrameTime < Infinity) {
      elapsed += elapsedFrameTime;
      //}
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
  } catch (e) {
    window.alert(e);
  }
}

function floatingEmojiSpawn(emoji) {
  createFloatingEmoji(emoji, false);
}
emojiReactions.onReaction = floatingEmojiSpawn;

Array.from(emojiReactionButtonsContainer.children).forEach((emojiButton) => {
  emojiButton.addEventListener("click", function () {
    sws.send(
      JSON.stringify({
        type: "reaction",
        emoji: this.textContent,
      })
    );
  });
});

module.exports = emojiReactions;
