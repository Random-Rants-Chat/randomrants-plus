require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var shtml = require("../safehtmlencode.js");

var randomDialogText = require("../randomquotes.txt");
var randomQuotes = randomDialogText.split("\n");

function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

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
    element: "img",
    src: "images/person1.svg",
    style: {
      position: "fixed",
      bottom: "0px",
      left: "0px",
    },
  },
  {
    element: "img",
    src: "images/person2.svg",
    style: {
      position: "fixed",
      bottom: "0px",
      right: "0px",
      transform: "scale(-1, 1)",
    },
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
        style: {
          maxWidth: "calc(100vw - 200px)",
          minWidth: "300px",
          textWrap: "balance",
        },
        children: [
          { element: "br" },
          {
            element: "span",
            className: "fadeIn delay-3",
            style: {
              fontSize: "40px",
              textAlign: "center",
              color: "black",
            },
            innerHTML: shtml.getMessageHTML(
              returnRandomValueFromArray(randomQuotes).trim()
            ),
          },
          {
            element: "br",
          },
          {
            element: "span",
            className: "headerText bounceIn",
            gid: "mainHeader",
            textContent: "Welcome to Random Rants +",
          },
          { element: "br" },
          {
            element: "span",
            className: "fadeIn delay-1",
            gid: "description1",
            textContent:
              "Built for peak Chromebook chaos, Random Rants + turns class into a digital free-for-all.",
          },
          { element: "br" },
          {
            element: "span",
            className: "fadeIn delay-2",
            gid: "description2",
            textContent:
              "Group chat, memes, and a soundboard loud enough to get you kicked off WiFi — it's all here.",
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
  .delay-3 {
    animation-delay: 1.5s;
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
