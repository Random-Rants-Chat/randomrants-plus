var styles = require("./style.css");
var elements = require("../gp2/elements.js");

var pageElements = elements.createElementsFromJSON([
  {
    element: "style",
    textContent: styles,
  },
]);
elements.appendElements(elements.body, pageElements);

require("../fontface.js");
