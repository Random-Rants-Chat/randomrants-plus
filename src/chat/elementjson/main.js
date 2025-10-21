require("../../fontface.js");
var styles = require("./chat-styles.css"); //Imported as text.
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
          require("./reconnecting.js"),
        ],
      },
      require("./accountnotice.js"),
      require("./usernameerror.js"),
      require("./roomerror.js"),
      require("./noguests.js"),
      require("./notallowed.js"),
      require("./banned.js"),
      require("./update.js"),
      require("./offlineerror.js"),
      require("./installappdialog.js"),
      require("./toomanyconnections.js"),
    ],
  },
];
