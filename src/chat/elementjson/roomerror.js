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
          textContent: "Oops! This room vanished into the void.",
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
                  textContent:
                    "Maybe it just poofed, or maybe it was never really here. 👻",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent:
                    "If you used Quick Join, the room might've been nuked moments ago. " +
                    "If you were hanging out in there and see this, well... RIP room. 💥",
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
                    "This room was removed from your room list. Hopefully you don't run into this error ever again!",
                },
                {
                  element: "br"
                },
                {
                  element: "div",
                  className: "divButton roundborder",
                  textContent: "Find another room",
                  title: "Back to chat home—go explore other chaos zones!",
                  eventListeners: [
                    {
                      event: "click",
                      func: function () {
                        window.location.href = "/chat"; //Goes to chat home page
                      }
                    }
                  ]
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
