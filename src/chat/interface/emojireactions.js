const REACTION_EMOJIS = [
  // Original Emojis
  "👍",
  "😂",
  "🔥",
  "❤️",
  "🤯",
  "🤔",
  "💀",
  "🎉",
  "🗿",
  "🤣",
  "👋",
  "🤡",
  "🥲",
  "😭",
  "🗣",
  "💯",
  "👑",
  "✨",
  "🤠",
  "🙌",
  "😬",
  "😝",
  "🧢",
  "💔",
  "🥀",
  "👏",
  "🤩",
  "🥳",
  "🥰",
  "👀",
  "🙏",
  "🫡",
  "😱",
  "😡",
  "🤮",
  "🥺",
  "😢",
  "🤓",
  "😎",
  "😐",
  "🤨",
  "🍿",
  "✍️",
  "✅",
  "❌",
  "👻",
  "🎃",
  "🍉",
  "🙏",

  // Random Rants + (rrp)
  "[emoji src=images/doge.png@rrp]",
  "[emoji src=images/surprised_pikachu.png@rrp]",
  "[emoji src=images/thisisfine.png@rrp]",
  "[emoji src=images/popcat.gif@rrp]",
  "[emoji src=images/amogus.png@rrp]",
  "[emoji src=images/Stonks.png@rrp]",
  "[emoji src=images/drakehotline-approve.png@rrp]",
  "[emoji src=images/drakehotline-disapprove.png@rrp]",
  "[emoji src=images/cat-jam.gif@rrp]",
  "[emoji src=images/parrot-party.gif@rrp]",
  "[emoji src=images/grumpy-cat.png@rrp]",
  "[emoji src=images/crying-cat.png@rrp]",
  "[emoji src=images/unoreverse.png@rrp]",
  "[emoji src=images/crying-cat-thumbs-up.png@rrp]",
  "[emoji src=images/elmofire.png@rrp]",
  "[emoji src=images/hashbrowncat.png@rrp]",
  "[emoji src=images/sadsponge.png@rrp]",

  // Random Rants (rr)
  "[emoji src=img/guy_pointing.svg@rr]",
  "[emoji src=img/mrbeaast.svg@rr]",
  "[emoji src=img/obama.svg@rr]",
  "[emoji src=img/whatthe.jpg@rr]",
  "[emoji src=img/anotherthing.svg@rr]",
  "[emoji src=img/sad.svg@rr]",
  "[emoji src=img/thing.svg@rr]",
  "[emoji src=img/dance.gif@rr]",
  "[emoji src=img/sonk.png@rr]",
  "[emoji src=img/2.png@rr]",
  "[emoji src=img/smw-bored.png@rr]",
  "[emoji src=img/smw-grin.png@rr]",
  "[emoji src=img/smw-laugh.gif@rr]",
  "[emoji src=img/smw-smile.png@rr]",
  "[emoji src=img/smw-straightface.png@rr]",
  "[emoji src=img/smw-uhoh.png@rr]",
  "[emoji src=img/smw-uhoh2.png@rr]",

  // Gvbvdxx Chat (gc)
  "[emoji src=SONIC_SCREAM.png@gc]",
  "[emoji src=ARVSM_XD.png@gc]",
  "[emoji src=ARVSM_DIE.png@gc]",
  "[emoji src=DE_AIBO_1.png@gc]",
  "[emoji src=DE_AIBO_2.png@gc]",
  "[emoji src=DE_AIBO_4.png@gc]",
  "[emoji src=DE_AIBO_5.png@gc]",
  "[emoji src=DE_AIBO_6.png@gc]",
  "[emoji src=DE_AIBO_7.png@gc]",
  "[emoji src=MSG_2.png@gc]",
  "[emoji src=MSG_3.png@gc]",
  "[emoji src=MSG_4.png@gc]",
  "[emoji src=MSG_5.png@gc]",
  "[emoji src=MSG_6.png@gc]",
  "[emoji src=MSG_7.png@gc]",
  "[emoji src=MSG_8.png@gc]",
  "[emoji src=MSG_9.png@gc]",
];

var elements = require("../../gp2/elements.js");
var sws = require("./sharedwebsocket.js");
var shtml = require("../../safehtmlencode.js");

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
    elements.setInnerJSON(emoji, [shtml.getBracketCodeJSON(emojiText)]);
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

function mapAllEmojiReactions(reactions) {
  return reactions.map((emoji) => {
    return {
      element: "div",
      className: "divButton roundborder reactionButtonAnimation",
      eventListeners: [
        {
          event: "click",
          func: function () {
            sws.send(
              JSON.stringify({
                type: "reaction",
                emoji: this.getAttribute("realContent"),
              })
            );
          },
        },
      ],
      style: {
        margin: "0px 2px",
        userSelect: "none",
        flexShrink: 0,
        position: "relative",
        padding: "4px",
        fontSize: "30px",
      },
      children: [
        {
          element: "div",
          style: {
            width: "40px",
            height: "40px",
          },
        },
        {
          element: "div",
          style: {
            textAlign: "center",
            lineHeight: "40px",
            position: "absolute",
            top: "4px",
            left: "4px",
            width: "40px",
            height: "40px",
          },
          className: "reactionButtonImage",
          children: [shtml.getBracketCodeJSON(emoji, {}, 40)],
        },
      ],
      realContent: emoji,
    };
  });
}

elements.setInnerJSON(
  emojiReactionButtonsContainer,
  mapAllEmojiReactions(REACTION_EMOJIS)
);

module.exports = emojiReactions;
