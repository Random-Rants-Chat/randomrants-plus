var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sharedAppInterface = elements.getGPId("sharedAppInterface");
var chatInterfaceRight = elements.getGPId("chatInterfaceRight");

function isProbablyPhone() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspectRatio = h / w;

  // Detect "phone-like" screen: tall and narrow
  return (
    (w <= 600 && aspectRatio >= 1.6) || // e.g. 360x640, 390x844, etc.
    (h <= 600 && (1 / aspectRatio) >= 1.6) // landscape version of above
  );
}

function resizeStuff() {
  const isMobile = isProbablyPhone();
  const isPortrait = window.innerHeight > window.innerWidth;

  if (isMobile && isPortrait) {
    // Full width chat for portrait mobile
    sharedAppInterface.style.display = "none";
    chatInterfaceRight.style.display = "block";
    chatInterfaceRight.style.width = "100vw";
    sharedAppInterface.style.width = "0px";
  } else if (isMobile && !isPortrait) {
    // Hide chat in landscape mobile, app interface takes over.
    sharedAppInterface.style.display = "block";
    chatInterfaceRight.style.display = "none";
    sharedAppInterface.style.width = "100vw";
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
