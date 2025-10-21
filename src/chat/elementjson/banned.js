module.exports = {
  element: "div",
  gid: "banRoomError",
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
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "🚫 Blocked from this room 🚫",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "The owner or someone with ownership decided to block you from this room.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "If it was a mistake, then ask the person that owns the ban hammer to undo the ban.",
        },
        {
          element: "br",
        },
        {
          element: "div",
          className: "divButton roundborder",
          textContent: "Find another room",
          eventListeners: [
            {
              event: "click",
              func: function () {
                window.location.href = "/chat";
              },
            },
          ],
        },
      ],
    },
  ],
};
