require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");

var elementJSON = [
  {
    element: "div",
    className: "scrolling-container",
    gid: "scrollingContainer",
    children: [
      {
        element: "div",
        className: "scrolling-content",
        gid: "scrollingContent",
      },
    ],
  },
  {
    element: "div",
    style: {
      transform: "translate(-50%, -50%)",
      position: "fixed",
      top: "50%",
      left: "50%",
      display: "flex"
    },
    children: [
      {
        element: "img",
        src: "images/person1.svg",
        style: {
          transform: "translate(0px, 100px) scale(1, 1)",
          padding: "40px"
        },
      },
      {
        element: "img",
        src: "images/person2.svg",
        style: {
          transform: "translate(0px, 100px) scale(-1, 1)",
          padding: "40px"
        },
      },
    ],
  },
  {
    element: "div",
    style: {
      transform: "translate(-50%, -50%)",
      position: "fixed",
      top: "50%",
      left: "50%",
    },
    children: [
      {
        element: "div",
        className: "fadeIn",
        gid: "mainCenter",
        children: [
          {
            element: "span",
            className: "headerText bounceIn",
            gid: "mainHeader",
            textContent: "Welcome to Random Rants Plus",
          },
          { element: "br" },
          {
            element: "span",
            className: "fadeIn delay-1",
            gid: "description1",
            textContent:
              "Random Rants + is the next generation of Random Rants, aimed towards having new functions and is more like an actual social media site.",
          },
          { element: "br" },
          {
            element: "span",
            className: "fadeIn delay-2",
            gid: "description2",
            textContent:
              "Random Rants + also aims for the fun of the original Random Rants, so you don't get as bored easily.",
          },
        ],
      },
    ],
  },
];

elements.appendElements(
  elements.body,
  elements.createElementsFromJSON(elementJSON)
);

var style = document.createElement("style");
style.textContent = `
  .fadeIn {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 1s forwards;
  }
  .bounceIn {
    animation: bounceIn 1.2s;
  }
  .delay-1 {
    animation-delay: 0.5s;
  }
  .delay-2 {
    animation-delay: 1s;
  }
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes fadeIn {
    from {
      transform: translate(0px, 100px) scale(2, 2);
      opacity: 0;
    }
    to {
      transform: translate(0px, 80px) scale(1, 1);
      opacity: 1;
    }
  }
  @keyframes fadeIn2 {
    from {
      transform: translate(0px, 100px) scale(-2, 2);
      opacity: 0;
    }
    to {
      transform: translate(0px, 80px) scale(-1, 1);
      opacity: 1;
    }
  }
  
  @keyframes rotating {
    0% {
      transform: translate(0px, 100px) scale(1, 1) rotate(-0.1deg);
    }
    50% {
      transform: translate(0px, 100px) scale(1, 1) rotate(0.1deg);
    }
    100% {
      transform: translate(0px, 100px) scale(1, 1) rotate(-0.1deg);
    }
  }
  
  @keyframes rotating2 {
    0% {
      transform: translate(0px, 100px) scale(-1, 1) rotate(-0.1deg);
    }
    50% {
      transform: translate(0px, 100px) scale(-1, 1) rotate(0.1deg);
    }
    100% {
      transform: translate(0px, 100px) scale(-1, 1) rotate(-0.1deg);
    }
  }
  
  @keyframes bounceIn {
    0%, 20%, 40%, 60%, 80%, 100% {
      transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    }
    0% {
      opacity: 0;
      transform: scale3d(0.3, 0.3, 0.3);
    }
    20% {
      transform: scale3d(1.1, 1.1, 1.1);
    }
    40% {
      transform: scale3d(0.9, 0.9, 0.9);
    }
    60% {
      opacity: 1;
      transform: scale3d(1.03, 1.03, 1.03);
    }
    80% {
      transform: scale3d(0.97, 0.97, 0.97);
    }
    100% {
      opacity: 1;
      transform: scale3d(1, 1, 1);
    }
  }
`;
document.head.appendChild(style);
