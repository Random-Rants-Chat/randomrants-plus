var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");

var roomSelect = require("./roomselect.js");

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
          window.location.href = "/";
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
          window.location.href = "/join";
        },
      },
    ],
  },
];

var menuDOM = elements.createElementsFromJSON(menuItems);
elements.appendElements(menuBar, menuDOM);

require("./usermenu.js");
