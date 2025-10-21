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
          textContent: "You're offline!",
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
                    "Looks like you went offline. Random Rants + can't rant properly if you're offline!",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent:
                    "Please connect to Wi-Fi with internet access to contine the rants. We should automatically continue, if not then click the reload button.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
