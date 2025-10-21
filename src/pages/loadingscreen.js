var elements = require("../gp2/elements.js");
var dialog = require("../dialogs.js");

var preloadedLoader = new Image();
preloadedLoader.src = "images/appicon.svg";

function doLoadingScreen() {
  var div = document.createElement("div");
  var stopAnimating = null;

  var dom = elements.createElementsFromJSON([
    //Background
    {
      element: "div",
      className: "dialogBackground",
      style: {
        zIndex: "9999999999",
      },
    },
    //Dialog box
    {
      element: "div",
      className: "centerMiddle",
      style: {
        zIndex: "9999999999",
      },
      children: [
        {
          element: "div",
          className: "loader2Container",
          children: [
            {
              element: "div",
              className: "loader2",
            },
          ],
        },
      ],
    },
  ]);
  elements.appendElements(div, dom);
  document.body.append(div);

  return div;
}

module.exports = {
  doLoadingScreen,
};
