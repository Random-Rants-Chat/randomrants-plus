function surroundFlexboxDiv(c) {
  return {
    element: "div",
    style: { display: "flex" },
    children: c,
  };
}

var reactionEmojis = [
  "👍",
  "😂",
  "🔥",
  "❤️",
  "🤯",
  "🤔",
  "💀",
  "🎉",
  "🗿",
  "🤣",
  "👋",
  "🤡",
  "🥲",
  "😭",
  "🗣",
  "💯",
  "👑",
  "✨",
  "🤠",
  "🙌",
  "😬",
  "😝",
  "🧢",
  "💔",
  "🥀",
  "[emoji src=images/hashbrowncat.png@rrp]",
  "[emoji src=images/sadsponge.png@rrp]",
  "[emoji src=images/thisisfine.png@rrp]",
];

var chatEmojis = require("../../chat-emojis.js");
var shtml = require("../../safehtmlencode.js");

var chatInputPlaceholders = [
  "Enter your random rant here",
  "Type a rant to tell us",
  "Write a random rant here",
  "Tap or click and type your random rant here",
  "Write your random rants here",
  "Be creative, write a rant here",
  "Write random rants here",
  "Write a message here",
];

function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
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
                  gid: "emojiReactions",
                  style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    background:
                      "radial-gradient(hsl(var(--accent-default-hue), var(--accent-default-saturation), 75%), transparent 80%)",
                  },
                },
                {
                  element: "div",
                  className: "middleChatDiv",
                  children: [
                    {
                      element: "div",
                      className: "divButton roundborder chooseMediaButton",
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
                  gid: "emojiReactionButtons",
                  style: {
                    position: "absolute",
                    left: "50%",
                    bottom: "0px",
                    maxWidth: "100%",
                    width: "fit-content",
                    minWidth: "10px",
                    height: "fit-content",
                    display: "flex",
                    flexDirection: "row",
                    overflowX: "auto",
                    overflowY: "hidden",
                    transform: "translate(-50%, 0px)",
                    paddingBottom: "4px",
                  },
                  children: reactionEmojis.map((emoji) => {
                    return {
                      element: "div",
                      className:
                        "divButton roundborder reactionButtonAnimation",
                      style: {
                        margin: "0px 2px",
                        userSelect: "none",
                        flexShrink: 0,
                        position: "relative",
                        padding: "4px",
                        fontSize: "30px",
                      },
                      children: [
                        {
                          element: "div",
                          style: {
                            width: "40px",
                            height: "40px",
                          },
                        },
                        {
                          element: "div",
                          style: {
                            textAlign: "center",
                            lineHeight: "40px",
                            position: "absolute",
                            top: "4px",
                            left: "4px",
                            width: "40px",
                            height: "40px",
                          },
                          className: "reactionButtonImage",
                          children: [shtml.getBracketCodeJSON(emoji, {}, 40)],
                        },
                      ],
                      realContent: emoji,
                    };
                  }),
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
            flexDirection: "column",
          },
        },
      ],
    },
  ],
};
var rightSide = {
  element: "div",
  className: "chatInterfaceRight",
  gid: "chatInterfaceRight",
  children: [
    {
      element: "div",
      className: "chatInterfaceButtonBox",
      gid: "userButtonBox",
      children: [
        {
          element: "div",
          style: {
            display: "flex",
            flexGrow: "1",
            width: "100%",
          },
          children: [
            {
              element: "button",
              className: "roundborder chatInterfaceButton",
              gid: "toggleCameraButton",
              title: "Toggle camera",
            },
            {
              element: "button",
              className: "roundborder chatInterfaceButton",
              gid: "toggleMicrophoneButton",
              title: "Toggle microphone",
            },
          ],
        },
        {
          element: "button",
          className: "roundborder chatInterfaceButton",
          gid: "showSoundboardButton",
          children: [
            {
              element: "img",
              src: "images/speaker.svg",
            },
            {
              element: "span",
              textContent: "Meme Soundboard",
            },
          ],
        },
        {
          element: "button",
          className: "roundborder chatInterfaceButton",
          gid: "showRoomSettingsButton",
          hidden: true,
          children: [
            {
              element: "img",
              src: "images/settings.svg",
            },
            {
              element: "span",
              textContent: "Room Settings",
            },
          ],
        },
        {
          element: "div",
          style: {
            display: "flex",
            flexGrow: "1",
            width: "100%",
          },
          children: [
            {
              element: "button",
              className: "roundborder chatInterfaceButton",
              gid: "toggleMessageAndOnlineView",
            },
          ],
        },
      ],
    },
    {
      element: "div",
      className: "chatInterfaceMessagesBox",
      gid: "userMessagesBox",
      children: [{ element: "div", gid: "userMessagesContainer" }],
    },
    {
      element: "div",
      className: "chatInterfaceOnlineViewBox",
      hidden: true,
      gid: "userOnlineViewBox",
      children: [
        {
          element: "span",
          style: { fontWeight: "bold", fontSize: "15px" },
          textContent: "Users online in this room:",
        },
        { element: "hr" },
        { element: "div", gid: "usersOnlineContainer" },
        { element: "hr" },
        {
          element: "button",
          className: "roundborder chatInterfaceButton",
          gid: "showRoomSettingsButton2",
          hidden: true,
          children: [
            {
              element: "img",
              src: "images/settings.svg",
            },
            {
              element: "span",
              textContent: "More permission settings",
            },
          ],
        },
      ],
    },
    {
      element: "div",
      gid: "chatDialogsDiv",
      children: [
        {
          element: "div",
          gid: "typingNoticeDiv",
          className: "typingNoticeDiv",
          children: [],
        },
        {
          element: "div",
          gid: "addEmojiDiv",
          children: [
            {
              element: "div",
              className: "emojiDialogBox",
              children: [
                {
                  element: "div",
                  className: "divButton roundborder",
                  style: {
                    width: "100%",
                    textAlign: "center",
                    padding: "5px 0px",
                  },
                  textContent: "Close",
                  gid: "emojiDialogCloseButton",
                },
                {
                  element: "div",
                  className: "emojiDialogCategoryContainerScroller",
                  children: [
                    {
                      element: "div",
                      className: "emojiDialogCategoryContainer",
                      gid: "emojiDialogCategory",
                      children: [],
                    },
                  ],
                },
                {
                  element: "div",
                  className: "emojiDialogContainer",
                  children: [
                    {
                      element: "div",
                      className: "emojiDialogContainer2",
                      gid: "emojiDialogContainer",
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    surroundFlexboxDiv([
      {
        element: "input",
        type: "text",
        className: "textBoxColors chatInterfaceMessageTextBox roundborder",
        gid: "messageInputBox",
        style: {
          flexGrow: 1,
        },
        placeholder: returnRandomValueFromArray(chatInputPlaceholders),
        eventListeners: [
          {
            event: "input",
            func: function () {
              this.placeholder = returnRandomValueFromArray(
                chatInputPlaceholders
              );
            },
          },
        ],
      },
      {
        element: "div",
        className: "chatInterfaceMessageSendButton roundborder",
        textContent: "Send",
        gid: "messageSendButton",
        style: {
          flexShrink: 0,
        },
      },
      {
        element: "div",
        className: "chatInterfaceMessageSendButton roundborder",
        children: [
          {
            element: "img",
            src: "images/attach.svg",
            style: {
              height: "25px",
            },
          },
        ],
        gid: "messageAttachFilesButton",
        style: {
          flexShrink: 0,
        },
      },
      {
        element: "div",
        className: "chatInterfaceMessageSendButton roundborder",
        children: [
          {
            element: "img",
            src: "images/emojiadd.svg",
            style: {
              height: "25px",
            },
          },
        ],
        gid: "messageAddEmojiButton",
        style: {
          flexShrink: 0,
        },
      },
    ]),
  ],
};

module.exports = {
  element: "div",
  gid: "chatInterface",
  hidden: true,
  children: [leftSide, rightSide, require("./noaudio.js")],
};
