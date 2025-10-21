var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sharedAppInterface = elements.getGPId("sharedAppInterface");
var chatInterfaceRight = elements.getGPId("chatInterfaceRight");

function debounce(func, delay = 60) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function resizeStuff() {
  var screenWidth = window.innerWidth;
  var isPortrait = window.innerHeight > screenWidth;

  // Phone-specific rules
  if (screenWidth < 768) {
    if (isPortrait) {
      // Full width chat for portrait mobile
      sharedAppInterface.style.display = "none";
      chatInterfaceRight.style.display = "block";
      chatInterfaceRight.style.width = "100vw";
    } else {
      // Hide chat in landscape mobile
      sharedAppInterface.style.display = "block";
      chatInterfaceRight.style.display = "none";
      sharedAppInterface.style.width = "100vw";
    }
  }
  // Tablet and Desktop rule (everything 768px and wider)
  else {
    // Normal split-view behavior
    sharedAppInterface.style.display = "block";
    chatInterfaceRight.style.display = "block";

    let chatAreaWidth = screenWidth / 2 - 50;
    if (chatAreaWidth < 350) {
      chatAreaWidth = 350;
    }
    sharedAppInterface.style.width = `calc(100vw - ${chatAreaWidth}px)`;
    chatInterfaceRight.style.width = chatAreaWidth + "px";
  }
}

resizeStuff();
window.addEventListener("resize", resizeStuff);
