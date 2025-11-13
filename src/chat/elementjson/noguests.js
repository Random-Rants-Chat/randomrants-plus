module.exports = {
  element: "div",
  gid: "guestErrorScreen",
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
          textContent: "No guest users are allowed here",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "This room doesn't want any guests in it. You'll need a Random Rants + account to get in.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            'Why? Someone must have turned off "Allow Guest users" in the room settings.',
        },
        {
          element: "br",
        },
        {
          element: "a",
          style: {
            all: "unset",
          },
          href:
            "./signin?href=" +
            encodeURIComponent(window.location.pathname + window.location.hash),
          children: [
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Sign in",
            },
          ],
        },

        {
          element: "a",
          style: {
            all: "unset",
          },
          href:
            "./signup?href=" +
            encodeURIComponent(window.location.pathname + window.location.hash),
          children: [
            {
              element: "div",
              className: "divButton roundborder",
              textContent: "Sign up",
            },
          ],
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
