var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.

var elementJSON = require("./elementjson/main.js").concat([
  {
    element: "style", //Patch so i could use element.hidden = true; to hide things.
    textContent: "[hidden] { display: none !important; opacity: 0; pointer-events: none; }"
  },
]);

var elementObjects = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, elementObjects);

try {
  require("./interface"); //Interface will use elements.getGPId(), don't worry about having to share certian variables.
} catch (e) {
  window.alert("Random Rants + encountered an unknown error. " + e);
}
