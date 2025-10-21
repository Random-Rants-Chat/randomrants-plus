module.exports = {
  element: "div",
  gid: "roomErrorScreen",
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
          textContent:
            "This room no longer exists, or has never existed at all!",
        },
        {
          element: "div",
          className: "sep1",
        },
        {
          element: "div",
          style: {
            display: "flex",
          },
          children: [
            {
              element: "img",
              src: "images/roomerror.svg",
              style: {
                height: "100%",
                padding: "10px 10px",
              },
            },
            {
              element: "div",
              style: {
                padding: "10px 10px",
              },
              children: [
                {
                  element: "span",
                  textContent: "Maybe this room was never here.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent:
                    "If you used quick join, the room was existing but then disapeared right after." +
                    "If you're seeing this inside a room, then it must of been destroyed moments ago.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  style: {
                    fontStyle: "italic",
                    color: "#666",
                    display: "block",
                    marginBottom: "10px",
                  },
                  textContent:
                    "This room was (hopefully) removed from your room list.",
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
                        window.location.href = "/chat"; //Goes to chat home page
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
