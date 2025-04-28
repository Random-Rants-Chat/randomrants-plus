require("../cookiewarning");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");

var elementJSON = [
  {
    element: "div",
    className: "scrolling-container",
    children: [
      {
        element: "div",
        className: "scrolling-content",
      },
    ]
  },
  {
    element: "div",
    className: "centerHorizontal",
    children: [
      {
        element: "span",
        className: "headerText",
        textContent: "Welcome to Random Rants Plus",
      },
      {element:"br"},
      {
        element: "span",
        textContent: "Random Rants + is the next generation of Random Rants, aimed towards having new functions and is more like an actual social media site.",
      },
      {element:"br"},
      {
        element: "span",
        textContent: "Random Rants + also aims for the fun of the original Random Rants, so you don't get as bored easily.",
      },
    ],
  },
];

elements.appendElements(
  elements.body,
  elements.createElementsFromJSON(elementJSON)
);
