var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");

var roomSelect = require("./roomselect.js");

var menuBar = elements.getGPId("menuBar");

var menuItems = [
  {
    element: "img",
    src: "images/appicon.svg",
  },
  {
    element: "div",
    className: "menuBarItem",
    textContent: "Random Rants +",
    eventListeners: [
      {
        event: "click",
        func: function () {
          window.location.href = "/";
        },
      },
    ],
  },
  {
    element: "div",
    className: "menuBarItem",
    textContent: "Manage rooms",
    eventListeners: [
      {
        event: "click",
        func: function () {
          roomSelect.show();
        },
      },
    ],
  },
];

var menuDOM = elements.createElementsFromJSON(menuItems);
elements.appendElements(menuBar, menuDOM);
