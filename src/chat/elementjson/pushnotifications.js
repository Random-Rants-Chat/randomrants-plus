var isWindows = navigator.userAgent.indexOf("Windows") > -1;
var isChromeOS = navigator.userAgent.indexOf("CrOS") > -1;

module.exports = {
  element: "div",
  gid: "activatePushDialog",
  hidden: true,
  style: {
    zIndex: 10,
  },
  className: "normalLevelDialog",
  children: [
    {
      element: "div",
      className: "dialogBackground",
    },
    {
      element: "div",
      className: "whiteBox centerMiddle popupDialogAnimation",
      children: [
        {
          element: "span",
          style: {
            fontWeight: "bold",
            fontSize: "30px",
          },
          textContent:
            "Activate push notifcations? "
        },
        {
          element: "div",
          className: "sep1",
        },
        {
          element: "p",
          textContent:
            "If you activate push notifcations, you'll recieve notifcations even when you're off the site.",
        },
        {
          element: "button",
          className: "roundborder divButton",
          textContent: "Activate notifications!",
          gid: "activatePushButton",
        },
        {
          element: "div",
          className: "sep1",
        },
        {
          element: "div",
          className: "divButton",
          textContent: "I don't want it",
          gid: "pushPromptCloseButton",
        },
        {
          element: "div",
          className: "divButton",
          textContent: "Never ask me again",
          gid: "pushPromptCloseButtonNoShow",
        },
      ],
    },
  ],
};
