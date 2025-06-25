var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");

var sharedAppInterface = elements.getGPId("sharedAppInterface");
var chatInterfaceRight = elements.getGPId("chatInterfaceRight");

function resizeStuff() {
  var chatAreaWidth = (window.innerWidth/2)-50;
  if (chatAreaWidth < 350) {
    chatAreaWidth = 350;
  }
  sharedAppInterface.style.width = `calc(100vw - ${chatAreaWidth}px)`;
  chatInterfaceRight.style.width = chatAreaWidth+"px";
}

resizeStuff();
window.addEventListener("resize",resizeStuff);