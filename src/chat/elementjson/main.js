require("../../fontface.js");
var styles = require("./chat-styles.css"); //Imported as text.
var elements = require("../../gp2/elements.js");
//Elements will be processed by gp2/elements.js
module.exports = [
  {
    //Container for effects like color inversion.
    element: "div",
    gid: "commandEffects",
    style: {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100vw",
      height: "100vh",
    },
    children: [
      //Page stylesheet, but as an element.
      {
        element: "style",
        textContent: styles,
      },
      //Loading screen.
      {
        element: "div",
        gid: "loadingChatMain",
        children: require("./loadingchat.js"),
      },
      //After loading. No need for module for container div because its pretty small anyways.
      {
        element: "div",
        gid: "mainScreen",
        hidden: true, //There is a class defined for hidden, so it will use display block if hidden.
        children: [
          require("./noroom.js"),
          require("./chatinterface.js"),
          require("./chatmenu.js"),
        ],
      },
    ],
  },
];
//Dialogs.
elements.appendElementsFromJSON(document.body, [
  //Low level dialogs, not really important.
  require("./accountnotice.js"),
  require("./installappdialog.js"),

  //Medium level dialogs, important notices.
  require("./reconnecting.js"),

  require("./usernameerror.js"),
  require("./roomerror.js"),
  require("./noguests.js"),
  require("./notallowed.js"),
  require("./toomanyconnections.js"),

  //High level dialogs, these need to be to front.
  require("./update.js"),
  require("./offlineerror.js"),
]);
