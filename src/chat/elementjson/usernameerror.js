module.exports = {
  element: "div",
  gid: "usernameErrorScreen",
  hidden: true,
  style: {
    zIndex: 10
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
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "You seem to be already online in this room",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "Please try closing other tabs that have the same room open, and check any other devices that are currently online.",
        },
        {
          element: "br",
        },
        {
          element: "div",
          className: "divButton roundborder",
          textContent: "Reconnect now.",
          gid: "reconnectUsernameError",
        },
      ],
    },
  ],
};
