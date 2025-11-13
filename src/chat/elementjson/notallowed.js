module.exports = {
  element: "div",
  gid: "notAllowedError",
  hidden: true,
  style: {
    zIndex: 10,
  },
  className: "normalLevelDialog",
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
          textContent: "You're not on this rooms allow list",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "This room has an Allow list, and it seems you didn't make it there. :/",
        },
        {
          element: "br",
        },
        {
          element: "a",
          style: {
            all: "unset",
          },
          href: "./chat",
          children: [
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Find another room",
            },
          ],
        },
      ],
    },
  ],
};
