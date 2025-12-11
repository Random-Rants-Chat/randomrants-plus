var elements = require("./gp2/elements.js");
var AElement = require("./gp2/aelement.js");

var elementJSON = [
  {
    element: "div",
    className: "menuBar",
    gid: "menu_bar",
    children: [
      //Home button
      {
        element: "a",
        className: "menuBarItemLogo",
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
      //Chat button.
      {
        element: "a",
        className: "menuBarItem",
        textContent: "Chat",
        href: "./chat",
      },
      //Quick join button.
      {
        element: "a",
        className: "menuBarItem",
        textContent: "Quick join",
        href: "./join",
      },
      //About button.
      {
        element: "a",
        className: "menuBarItem",
        textContent: "About",
        href: "./about",
      },
      //News button.
      {
        element: "a",
        className: "menuBarItem",
        textContent: "Site News",
        href: "./sitenews",
      },
      //Updates button.
      {
        element: "a",
        className: "menuBarItem",
        textContent: "Updates",
        href: "./updates",
      },
      //Documentary button.
      {
        element: "a",
        className: "menuBarItem",
        textContent: "Site Documentary",
        href: "https://randomrants-docs.onrender.com",
        target: "_blank",
      },
    ],
  },
  {
    element: "div",
    style: {
      width: "100%",
      height: "40px",
    },
  },
];

elements.appendElements(
  elements.body,
  elements.createElementsFromJSON(elementJSON),
);

require("./user-menu.js");
