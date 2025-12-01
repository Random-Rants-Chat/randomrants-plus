module.exports = {
  element: "div",
  gid: "resyncingConnectionScreen",
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
          textContent: "Resyncing your room...",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            "The server bugged and made two different connection points with the same room data and is correcting itself.",
        },
        {
          element: "br",
        },
        {
          element: "span",
          textContent:
            'Please wait while you are connecting to the correct connection point.',
        }
      ],
    },
  ],
};
