require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js"); //Menu bar.
var elements = require("../gp2/elements.js"); //Based on gvbvdxx-pack-2's element module.
var accountHelper = require("../accounthelper/index.js"); //Utilites for accounts.
var dialog = require("../dialogs.js"); //Dialog boxes.

var elementJSON = [];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body,pageElements);
