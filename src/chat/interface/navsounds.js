var sounds = require("./sounds.js");

const clickableClasses = [
  "divButton",
  "emojiDialogCategoryButton",
  "emojiDialogButton",
]; //Handling for div button styles.

document.addEventListener("click", (e) => {
  var el = e.target;

  while (el && el !== document.body) {
    var style = getComputedStyle(el);
    var classList = el.classList;
    var isClickable =
      typeof el.onclick === "function" ||
      el.getAttribute("onclick") !== null ||
      style.cursor === "pointer" ||
      el.getAttribute("role") === "button" ||
      clickableClasses.some((cls) => {
        return Array.from(classList).indexOf(cls) > -1;
      }) ||
      el.tabIndex >= 0;

    if (isClickable) {
      sounds.play("select", 1);
      return;
    }

    el = el.parentElement;
  }
});

// Global input listener for typing sound
document.addEventListener("input", (e) => {
  var el = e.target;

  // Check if typing is happening in editable fields
  var isTypingTarget =
    el.matches("input[type='text'], textarea, input[type='search']") ||
    el.isContentEditable;

  if (isTypingTarget) {
    sounds.play("type", 1);
  }
});
