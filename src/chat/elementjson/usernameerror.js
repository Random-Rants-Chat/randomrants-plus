module.exports = {
  element: "div",
  gid: "usernameErrorScreen",
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
          textContent: "You're already in this room",
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
              src: "images/alreadyonline.svg",
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
                    "Looks like you're already in this room! Maybe try checking your tabs - and devices.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent: "After doing that, then hit the button below.",
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  className: "divButton roundborder",
                  textContent: "Reconnect anyway",
                  gid: "reconnectUsernameError",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
