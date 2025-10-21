module.exports = {
  element: "div",
  gid: "tooManyErrorScreen",
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
          textContent: "There is too many of you!",
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
                    "There is way too many people of the same IP or your account using Random Rants +, please try again later or close some Random Rants + tabs.",
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
                  gid: "reconnectTooManyError",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
