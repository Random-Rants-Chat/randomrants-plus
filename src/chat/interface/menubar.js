var elements = require("../../gp2/elements.js");
var AElement = require("../../gp2/aelement.js");
var accountHelper = require("../../accounthelper");

var roomSelect = require("./roomselect.js");
var clientSettings = require("./clientsettings.js");

var menuBar = elements.getGPId("menuBar");

var menuItems = [
  {
    element: "div",
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
    eventListeners: [
      {
        event: "click",
        func: function () {
          AElement.openLink("/");
        },
      },
    ],
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
  {
    element: "div",
    className: "menuBarItem",
    textContent: "Quick join",
    eventListeners: [
      {
        event: "click",
        func: function () {
          AElement.openLink("/join");
        },
      },
    ],
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
