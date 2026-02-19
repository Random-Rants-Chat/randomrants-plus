module.exports = [
  {
    element: "h1",
    textContent: "Version History Integration",
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
        textContent: "New System Feature: ",
      },
      {
        element: "a",
        href: "/updates",
        textContent: "Real-time deployment logs.",
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
      "This integration allows users to monitor development progress directly through the UI, removing the need to audit the raw source code repository.",
  },
  {
    element: "p",
    textContent:
      "Please note that some automated commit messages may appear brief (e.g., 'Update' or 'Patch') due to our high-frequency iteration cycle and rapid prototyping phase.",
  },
  {
    element: "p",
    children: [
      {
        element: "b",
        textContent: "Technical Note:",
      },
      ' These logs reflect the staging environment. Standard updates are pushed on a monthly cycle, while critical patches marked "Immediate:" are deployed to the production server instantly.',
    ],
  },
];
