var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.

var elementJSON = [
  {
    element: "div",
    children: require("./elementjson/main.js"),
  },
];

var elementObjects = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, elementObjects);

try {
  require("./interface"); //Interface will use elements.getGPId(), don't worry about having to share certian variables.
} catch (e) {
  window.alert("Random Rants + encountered an unknown error. " + e);
}
