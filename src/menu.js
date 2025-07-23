var elements = require("./gp2/elements.js");

var elementJSON = [
  {
    element: "div",
    className: "menuBar",
    gid:"menu_bar",
    children: [
      {
        element: "img",
        src: "images/appicon.svg"
      },
      //Home button
      {
        element: "div",
        className: "menuBarItem",
        textContent: "Random Rants +",
        eventListeners: [
          {
            event: "click",
            func: function () {
              window.location.href = "/";
            }
          }
        ]
      },
      //Chat button.
      {
        element: "div",
        className: "menuBarItem",
        textContent: "Chat",
        eventListeners: [
          {
            event: "click",
            func: function () {
              window.location.href = "/chat";
            }
          }
        ]
      },
      //Quick join button.
      {
        element: "div",
        className: "menuBarItem",
        textContent: "Quick join",
        eventListeners: [
          {
            event: "click",
            func: function () {
              window.location.href = "/join";
            }
          }
        ]
      },
      //About button.
      {
        element: "div",
        className: "menuBarItem",
        textContent: "About",
        eventListeners: [
          {
            event: "click",
            func: function () {
              window.location.href = "/about";
            }
          }
        ]
      },
    ],
  },
  { //Since using position:fixed removes spacing, manually just add it by using a invisible div element.
    element: "div",
    style: {
      width: "100%",
      height: "40px"
    }
  }
];

elements.appendElements(
  elements.body,
  elements.createElementsFromJSON(elementJSON)
);

require("./user-menu.js");
