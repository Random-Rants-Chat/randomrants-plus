module.exports = {
  element: "div",
  gid: "offlineErrorScreen",
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
          textContent: "⚠️ Uh-oh! You're offline!",
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
              src: "images/nowifi.svg",
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
                    "Looks like your WiFi ragequit. Without it, Random Rants+ can’t spread chaos properly.",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent: "Reconnect to the internet to resume the madness. Still no luck? Try moving closer to your router—or offer it a snack. 🍪"
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
