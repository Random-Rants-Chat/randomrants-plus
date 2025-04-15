module.exports = [
  {
    element: "div",
    className: "pageLoadingScreen",
    children: [
      {
        element: "div",
        className: "loader",
      },
      { element: "br" },
      {
        element: "span",
        gid: "randomFactSpan",
        style: {
          textAlign: "center",
        },
        textContent: "",
      },
      {
        element: "span",
        style: {
          textAlign: "center",
          fontWeight: "bold",
        },
        gid: "rrLoadingStatusText",
        textContent: "",
      },
      { element: "br" },
      {
        element: "span",
        style: {
          textAlign: "center",
          fontWeight: "bold",
        },
        textContent:
          "Random Rants + is currently loading resources, this may take a while to complete.",
      },
    ],
  },
];
