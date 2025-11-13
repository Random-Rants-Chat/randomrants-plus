module.exports = [
  {
    element: "div",
    className: "pageLoadingScreen",
    children: [
      {
        element: "div",
        className: "loader2Container",
        children: [
          {
            element: "div",
            className: "loader2",
          },
        ],
      },
      {
        element: "span",
        style: {
          textAlign: "center",
          fontWeight: "bold",
        },
        gid: "rrLoadingScreenText",
      },
      {
        element: "span",
        gid: "randomFactSpan",
        hidden: true,
        style: {
          textAlign: "center",
        },
        textContent: "",
      },
      //{ element: "br" },
      {
        element: "span",
        style: {
          textAlign: "center",
        },
        gid: "rrLoadingStatusText",
        textContent: "",
      },
      { element: "br" },
      {
        element: "span",
        style: {
          textAlign: "center",
        },
        hidden: true,
        GPWhenCreated: function (elm) {
          setTimeout(() => {
            elm.hidden = false;
          }, 4000);
        },
        textContent:
          "Note: Long loading times are normal if some of our servers are still spinning up.",
      },
    ],
  },
];
