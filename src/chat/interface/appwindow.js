var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sharedAppInterface = elements.getGPId("sharedAppInterface");
var chatInterfaceRight = elements.getGPId("chatInterfaceRight");

function resizeStuff() {
  const isMobile = window.innerWidth <= 768; // adjust threshold as needed
  const isPortrait = window.innerHeight > window.innerWidth;

  if (isMobile && isPortrait) {
    // Full width chat for portrait mobile
    sharedAppInterface.style.display = "none";
    chatInterfaceRight.style.display = "block";
    chatInterfaceRight.style.width = "100vw";
  } else if (isMobile && !isPortrait) {
    // Hide chat in landscape mobile
    sharedAppInterface.style.display = "block";
    chatInterfaceRight.style.display = "none";
  } else {
    // Default behavior for tablets/desktops
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
