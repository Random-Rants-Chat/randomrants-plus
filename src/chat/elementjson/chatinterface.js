function surroundFlexboxDiv(c) {
  return {
    element: "div",
    style: { display: "flex" },
    children: c,
  };
}

var leftSide = {
  element: "div",
  className: "chatInterfaceLeft",
  gid: "sharedAppInterface",
  children: [
    {
      element: "div",
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
      },
      children: [
        {
          element: "div",
          className: "leftSideCameraContent",
          gid: "camerasVideosDiv",
          children: [],
        },
        {
          element: "div",
          className: "leftSideOtherContent",
          children: [
            {
              element: "div",
              className: "leftSideOtherContentContainer",
              children: [
                {
                  element: "div",
                  className: "middleChatDiv",
                  children: [
                    {
                      element: "div",
                      className: "divButton roundborder",
                      gid: "chooseMediaButton",
                      children: [
                        surroundFlexboxDiv([
                          {
                            element: "img",
                            src: "images/play.svg",
                            style: { height: "25px" },
                          },
                          { element: "span", textContent: "Choose media" },
                        ]),
                      ],
                    },
                  ],
                },
                {
                  element: "div",
                  gid: "mediaContentDiv",
                  hidden: true,
                  className: "mediaContentDiv",
                },
              ],
            },
          ],
        },
        
        {
          element: "div",
          gid: "microphoneUsageTexts",
          style: {
            fontWeight: "bold",
            position: "absolute",
            bottom: "0px",
            right: "0px",
            display: "flex",
            flexDirection: "column"
          }
        },
      ],
    },
  ],
};
var rightSide = {
  element: "div",
  className: "chatInterfaceRight",
  children: [
    {
      element: "div",
      className: "chatInterfaceButtonBox",
      gid: "userButtonBox",
      children: [
        {
          element: "button",
          className: "roundborder",
          gid: "toggleMessageAndOnlineView",
          textContent: "View online users",
        },
        {
          element: "button",
          className: "roundborder",
          gid: "showSoundboardButton",
          textContent: "Soundboard",
        },
        {
          element: "button",
          className: "roundborder",
          gid: "showRoomSettingsButton",
          textContent: "Room settings",
          hidden: true
        },
        {
          element: "button",
          className: "roundborder",
          gid: "toggleCameraButton",
          title: "Toggle camera",
        },
        {
          element: "button",
          className: "roundborder",
          gid: "toggleMicrophoneButton",
          title: "Toggle microphone",
        },
      ],
    },
    {
      element: "div",
      className: "chatInterfaceMessagesBox",
      gid: "userMessagesBox",
      children: [
        {
          element: "div",
          children: [
            {
              element: "span",
              style: {
                fontWeight: "bold",
              },
              textContent: "Messages:",
            },
          ],
        },
        { element: "div", gid: "userMessagesContainer" },
      ],
    },
    surroundFlexboxDiv([
      {
        element: "input",
        type: "text",
        className: "textBoxColors chatInterfaceMessageTextBox roundborder",
        gid: "messageInputBox",
        placeholder: "Write your small random rant here.",
      },
      {
        //Add a bit of spacing between the text box and the send button
        element: "div",
        style: {
          width: "2px",
        },
      },
      {
        element: "div",
        className: "chatInterfaceMessageSendButton roundborder",
        textContent: "Send",
        gid: "messageSendButton",
      },
      {
        //Add a bit of spacing between the text box and the send button
        element: "div",
        style: {
          width: "2px",
        },
      },
      {
        element: "div",
        className: "chatInterfaceMessageSendButton roundborder",
        textContent: "Attach Files",
        gid: "messageAttachFilesButton",
      },
    ]),
    {
      element: "div",
      className: "chatInterfaceOnlineViewBox",
      hidden: true,
      gid: "userOnlineViewBox",
      children: [
        {
          element: "span",
          style: { fontWeight: "bold" },
          textContent: "Users online in this room:",
        },
        { element: "hr" },
        { element: "div", gid: "usersOnlineContainer" },
      ],
    },
  ],
};

module.exports = {
  element: "div",
  gid: "chatInterface",
  hidden: true,
  children: [leftSide, rightSide, require("./noaudio.js")],
};
