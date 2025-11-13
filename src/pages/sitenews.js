document.title = "Random Rants + | Site news";

require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

var siteNews = [
  {
    element: "p",
    textContent: "Written September 16th, 2025",
    style: {
      fontSize: "19px",
      fontWeight: "bold",
      textAlign: "center",
    },
  },
  {
    element: "div",
    children: require("./news/2025/sep16th.js"),
  },
  {
    element: "hr",
  },
  {
    element: "p",
    textContent: "Written September 12th, 2025",
    style: {
      fontSize: "19px",
      fontWeight: "bold",
      textAlign: "center",
    },
  },
  {
    element: "div",
    children: require("./news/2025/sep12th.js"),
  },
  {
    element: "hr",
  },
  {
    element: "p",
    textContent: "Written September 2nd, 2025",
    style: {
      fontSize: "19px",
      fontWeight: "bold",
      textAlign: "center",
    },
  },
  {
    element: "div",
    children: require("./news/2025/sep2nd.js"),
  },
];

var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter",
    children: siteNews,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
