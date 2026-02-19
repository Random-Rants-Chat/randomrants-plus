module.exports = [
  {
    element: "h1",
    textContent: "Live Update Feed Added",
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
        textContent: "New Feature: ",
      },
      {
        element: "a",
        href: "/updates",
        textContent: "Check out the live dev logs here.",
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
      "I've added a way for you to see exactly what’s changing on the site in real-time. This feed pulls directly from my work, so you don't have to go digging through GitHub to see what's new.",
  },
  {
    element: "p",
    textContent:
      "Keep in mind that some of these messages might be pretty short (like 'Update' or 'Patch'). I'm usually pushing code pretty fast, so I don't always stop to write a full paragraph for every small tweak.",
  },
  {
    element: "p",
    children: [
      {
        element: "b",
        textContent: "Quick Note:",
      },
      ' These logs show what I\'m working on right now. Most updates roll out monthly, but if you see a message starting with "Immediate:", that means the fix is live on the site right this second.',
    ],
  },
];
