var elements = require("../../gp2/elements.js");
var AElement = require("../../gp2/aelement.js");
var accountHelper = require("../../accounthelper");

var roomSelect = require("./roomselect.js");
var clientSettings = require("./clientsettings.js");

var menuBar = elements.getGPId("menuBar");

var menuItems = [
  {
    element: "a",
    className: "menuBarItemLogo",
    children: [
      {
        element: "img",
        src: "images/randomrants-plus.svg",
        style: {
          height: "100%",
        },
      },
    ],
    href: "./",
    GPWhenCreated: function (el) {
      el.addEventListener("mouseenter", () => {
        el.classList.remove("returning");
        void el.offsetWidth; // restart animation
        el.classList.add("is-bouncing");
      });

      el.addEventListener("mouseleave", () => {
        const cs = getComputedStyle(el);
        el.style.transform =
          cs.transform === "none" ? "scale(1)" : cs.transform;
        el.classList.remove("is-bouncing");

        requestAnimationFrame(() => {
          el.classList.add("returning");
          el.style.transform = "scale(1)";
        });

        el.addEventListener("transitionend", function onEnd(e) {
          if (e.propertyName !== "transform") return;
          el.style.transform = "";
          el.classList.remove("returning");
          el.removeEventListener("transitionend", onEnd);
        });
      });
    },
  },
  {
    element: "a",
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
  {
    element: "a",
    className: "menuBarItem",
    textContent: "Quick join",
    href: "./join",
  },
  //Command Docs button.
  {
    element: "a",
    className: "menuBarItem",
    textContent: "Command Docs",
    href: "https://randomrants-docs.onrender.com/commands/",
  },
  {
    element: "div",
    style: {
      marginRight: "auto",
    },
  },
  {
    element: "div",
    className: "menuBarItem",
    style: {
      padding: "0px 0px",
      width: "40px",
    },
    children: [
      {
        element: "img",
        className: "notificationImage",
        src: "images/settings.svg",
      },
    ],
    eventListeners: [
      {
        event: "click",
        func: function () {
          clientSettings.openMenu();
        },
      },
    ],
  },
];

var menuDOM = elements.createElementsFromJSON(menuItems);
elements.appendElements(menuBar, menuDOM);

require("./usermenu.js");
