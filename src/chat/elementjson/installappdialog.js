var isWindows = navigator.userAgent.indexOf("Windows") > -1;
var isChromeOS = navigator.userAgent.indexOf("CrOS") > -1;

module.exports = {
  element: "div",
  gid: "installAppDialog",
  hidden: true,
  style: {
    zIndex: 10,
  },
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
            "Wanna add the Random Rants+ icon on to your " +
            (isChromeOS ? "Chromebook?" : "device?"),
        },
        {
          element: "div",
          className: "sep1",
        },
        {
          element: "p",
          textContent:
            "You could install the icon to access Random Rants + faster.",
        },
        ...(isWindows
          ? [
              {
                element: "p",
                style: { fontSize: "12px", opacity: 0.7 },
                textContent:
                  "Dear Windows users: You may get an RR+ app someday, but just don't hold your breath.",
              },
            ]
          : []),
        {
          element: "button",
          className: "roundborder divButton",
          textContent: "Give me the icon",
          gid: "installAppIconButton",
        },
        {
          element: "div",
          className: "sep1",
        },
        {
          element: "div",
          className: "divButton",
          textContent: "I don't want it",
          gid: "installAppDialogCloseButton",
        },
        {
          element: "div",
          className: "divButton",
          textContent: "Never ask me again",
          gid: "installAppDialogCloseButtonNoShow",
        },
      ],
    },
  ],
};
