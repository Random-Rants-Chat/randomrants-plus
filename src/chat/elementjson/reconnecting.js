module.exports = {
  element: "div",
  gid: "reconnectingScreen",
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
      className: "whiteBox centerMiddle",
      children: [
        {
          element: "div",
          style: { display: "flex" },
          children: [
            {
              element: "span",
              style: {
                fontSize: "30px",
                fontWeight: "bold",
              },
              textContent: "Reconnecting...",
            },
            {
              element: "div",
              className: "loader",
              style: { width: "15px", height: "15px" },
            },
          ],
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "You have lost connection to the room. Please wait while I will try to reconnect you.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "If the server is currently under maintainence, you may see this screen a lot.",
        },
      ],
    },
  ],
};
