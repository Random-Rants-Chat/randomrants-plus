var sounds = require("./sounds.js");


document.body.addEventListener("click", e => {
    setTimeout(() => {
        const el = e.target;

        // Only trigger if it has a click handler or looks clickable
        const isClickable =
            typeof el.onclick === "function" ||
            el.getAttribute("onclick") ||
            getComputedStyle(el).cursor === "pointer";

        if (isClickable) {
            sounds.play("select", 1);
        }
    },10);
});

// Global keydown listener for typing sound
document.addEventListener("keydown", e => {
  const el = e.target;

  // Check if typing is happening in editable fields
  const isTypingTarget =
    el.matches("input[type='text'], textarea, input[type='search']") ||
    el.isContentEditable;

  if (isTypingTarget) {
    sounds.play("type", 1);
  }
});

