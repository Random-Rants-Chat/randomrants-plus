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
        gid: "menu_homeButton"
      },
      //Spacing between home button.
      {
        element:"div",
        style: {
          width: "15px"
        }
      },
      //Chat button.
      {
        element: "div",
        className: "menuBarItem",
        textContent: "Chat",
        gid: "menu_chatButton"
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


var homeMenuButton = elements.getGPId("menu_homeButton");

homeMenuButton.addEventListener("click", () => {
  window.location.href = "/";
});

var chatMenuButton = elements.getGPId("menu_chatButton");

chatMenuButton.addEventListener("click", () => {
  window.location.href = "/chat";
});