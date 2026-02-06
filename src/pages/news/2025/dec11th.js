module.exports = [
  {
    element: "h1",
    textContent: "Site updates list added",
    style: {
      fontSize: "2em",
      marginBottom: "0.5em",
      textAlign: "center",
    },
  },
  {
    element: "p",
    children: [
      {
        element: "span",
        textContent: "We just added a big feature: ",
      },
      {
        element: "a",
        href: "/updates",
        textContent: "See the site realtime update history.",
      },
    ],
    style: {
      fontWeight: "bold",
      fontSize: "1.05em",
      marginBottom: "1em",
    },
  },
  {
    element: "p",
    textContent:
      "This feature just lets you see update messages without having to go to the official source code.",
  },
  {
    element: "p",
    textContent:
      'Sometimes the messages are just "Commit" or "Updates", cause im always adding stuff and I don\'t really want to spend time figuring out a short message for these commits.',
  },
  {
    element: "p",
    children: [
      {
        element: "b",
        textContent: "Spoiler alert:",
      },
      ' This can give some big spoilers - since updates roll out monthly unless the commit has "Immediate:" at the beginning of it.',
    ],
  },
];
