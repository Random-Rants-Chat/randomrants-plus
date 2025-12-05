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

var month = (new Date()).getMonth();
if (month == 11) {
  document.body.setAttribute("christmas-theme", "");
}