var sounds = require("./sounds.js");

const clickableClasses = ["divButton"]; //Handling for div button styles.

document.addEventListener("click", (e) => {
  let el = e.target;

  while (el && el !== document.body) {
    const style = getComputedStyle(el);
    const isClickable =
      typeof el.onclick === "function" ||
      el.getAttribute("onclick") !== null ||
      style.cursor === "pointer" ||
      el.getAttribute("role") === "button" ||
      clickableClasses.some(cls => el.classList.contains(cls)) ||
      el.tabIndex >= 0;

    if (isClickable) {
      sounds.play("select",1);
      return;
    }

    el = el.parentElement;
  }
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

