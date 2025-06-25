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
          textContent: "You're already in this room!",
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
                    "It looks like this username is already active in the room. Maybe you’ve got another tab open, or it’s your evil twin logging in from a different device.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent:
                    "Try closing any other open tabs or apps using this room. If all else fails, press the button below to try forcing your way back in.",
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  className: "divButton roundborder",
                  textContent: "Reconnect anyway",
                  title: "Attempt to reconnect with your username",
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
