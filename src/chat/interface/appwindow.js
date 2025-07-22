var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sharedAppInterface = elements.getGPId("sharedAppInterface");
var chatInterfaceRight = elements.getGPId("chatInterfaceRight");

function resizeStuff() {
  var isSmallWidth = window.innerWidth < 1000;
  var isPortrait = window.innerHeight > window.innerWidth;

  if (isSmallWidth && isPortrait) {
    // Full width chat for portrait mobile
    sharedAppInterface.style.display = "none";
    chatInterfaceRight.style.display = "block";
    chatInterfaceRight.style.width = "100vw";
    sharedAppInterface.style.width = "0px";
  } else if (isSmallWidth && !isPortrait) {
    // Hide chat in landscape mobile, app interface takes over.
    sharedAppInterface.style.display = "block";
    chatInterfaceRight.style.display = "none";
    sharedAppInterface.style.width = "100vw";
  } else {
    // Normal behavior
    sharedAppInterface.style.display = "block";
    chatInterfaceRight.style.display = "block";
    let chatAreaWidth = (window.innerWidth / 2) - 50;
    if (chatAreaWidth < 350) {
      chatAreaWidth = 350;
    }
    sharedAppInterface.style.width = `calc(100vw - ${chatAreaWidth}px)`;
    chatInterfaceRight.style.width = chatAreaWidth + "px";
  }
}

resizeStuff();
window.addEventListener("resize", resizeStuff);
