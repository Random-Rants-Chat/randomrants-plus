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
      className: "whiteBox centerMiddle popupDialogAnimation",
      children: [
        {
          element: "div",
          style: {
            position: "fixed",
            width: "32px",
            height: "32px",
            transform: "translate(0px, -100%)",
          },
          children: [
            {
              element: "div",
              className: "loader2",
            },
          ],
        },
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
          ],
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent: "Looks like Random Rants + lost its connection.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "This could appear if your internet connection is bad, or we're updating things behind the scenes.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "If this keeps popping up, you may be getting rate limited, or our hosting service is still trying to catch up.",
        },
      ],
    },
  ],
};
