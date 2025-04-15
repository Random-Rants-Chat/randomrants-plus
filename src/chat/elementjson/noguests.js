module.exports = {
  element: "div",
  gid: "guestErrorScreen",
  hidden: true,
  style: {
    zIndex: 10
  },
  children: [
    {
      element: "div",
      className: "dialogBackground",
    },
    {
      element: "div",
      className: "whiteBox centerMiddle",
      children: [
        {
          element: "span",
          style: {
            fontSize: "30px",
            fontWeight: "bold",
          },
          textContent: "This room does not allow guest users",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "Sign in or sign up to a Random Rants + account to join this room.",
        },
        {
          element: "br",
        },
        {
          element: "div",
          className: "divButton roundborder",
          textContent: "Go to home.",
          gid: "goToHome",
        },
      ],
    },
  ],
};
