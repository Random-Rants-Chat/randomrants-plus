
module.exports = [
  {
    element: "div",
    className: "pageLoadingScreen",
    children: [
      {
        element: "div",
        className: "loader",
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
    ],
  },
];
