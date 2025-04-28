var styles = require("./chat-styles.css"); //Imported as text.
//Elements will be processed by gp2/elements.js
module.exports = [
  //Page stylesheet, but as an element.
  {
    element: "style",
    textContent: styles
  },
  //Loading screen.
  {
    element: "div",
    gid: "loadingChatMain",
    children: require("./loadingchat.js")
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
      require("./reconnecting.js")
    ]
  },
  require("./usernameerror.js"),
  require("./noguests.js"),
  require("./update.js")
];