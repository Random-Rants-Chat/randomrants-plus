var styles = require("./style.css");
var elements = require("../gp2/elements.js");

var curMonth = (new Date()).getMonth();

var theme = "";
if (curMonth == 11) {
    theme = "christmas";
}
if (curMonth == 9) {
    theme = "spooky";
}
document.body.setAttribute("data-theme", theme);

//Background image for christmas:
if (theme == "christmas") {
    elements.appendElementsFromJSON(document.body, [
        {
            element: "div",
            className: "christmasBG"
        }
    ]);
}