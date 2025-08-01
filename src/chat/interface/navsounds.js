var sounds = require("./sounds.js");

document.addEventListener("click", e => {
  let el = e.target;

  // Traverse up to find nearest element with cursor:pointer or click handler
  while (el && el !== document.body) {
    const hasClickHandler =
      typeof el.onclick === "function" || el.getAttribute("onclick") !== null;

    const isPointer = getComputedStyle(el).cursor === "pointer";

    if (hasClickHandler || isPointer) {
      sounds.play("select",1);
      break;
    }

    el = el.parentElement;
  }
});


// Global keydown listener for typing sound
document.addEventListener("keydown", (e) => {
  const el = e.target;

  // Check if typing is happening in editable fields
  const isTypingTarget =
    el.matches("input[type='text'], textarea, input[type='search']") ||
    el.isContentEditable;

  if (isTypingTarget) {
    sounds.play("type", 1);
  }
});
