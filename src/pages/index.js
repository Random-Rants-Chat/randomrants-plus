window.title = "Random Rants +";

require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var shtml = require("../safehtmlencode.js");
var accountHelper = require("../accounthelper/index.js");
var dialogs = require("../dialogs.js");
var { rainbowHexes } = require("../colorutil.js");
require("./navigate-loader.js");

var randomDialogText = require("../randomquotes.txt");
var randomQuotes = randomDialogText.trim().split("\n");

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
    element: "div",
    gid: "emojiContainer",
    style: {
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: "0px",
      left: "0px",
      overflow: "hidden",
    },
  },
  {
    element: "img",
    gid: "person1",
    src: "images/person-dialog.svg",
    style: {
      position: "fixed",
      bottom: "-20px",
      left: "0px",
      pointerEvents: "none",
      userSelect: "none",
      filter: "drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.2))",
    },
  },
  {
    element: "img",
    gid: "person2",
    src: "images/person-dialog.svg",
    style: {
      position: "fixed",
      bottom: "-20px",
      right: "0px",
      transform: "scale(-1, 1)",
      pointerEvents: "none",
      userSelect: "none",
      filter: "drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.2))",
    },
  },
  {
    element: "img",
    GPWhenCreated: function (elm) {
      var anim = elm.animate(
        [
          { transform: "translateY(300px)" },
          { transform: "translateY(-10px)" },
          { transform: "translateY(0px)" },
        ],
        {
          duration: 700,
          iterations: 1,
          easing: "ease-out",
        }
      );
      anim.addEventListener("finish", () => {
        elm.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: "rotate(3deg)" },
            { transform: "rotate(-3deg)" },
            { transform: "rotate(0deg)" },
          ],
          {
            duration: 600,
            iterations: Infinity,
            easing: "ease-out",
          }
        );
      });
    },
    src: "images/person1.svg",
    style: {
      position: "fixed",
      bottom: "-20px",
      left: "0px",
      pointerEvents: "none",
      userSelect: "none",
      filter: "drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.2))",
    },
  },
  {
    element: "img",
    GPWhenCreated: function (elm) {
      var anim = elm.animate(
        [
          { transform: "translateY(300px) scale(-1, 1)" },
          { transform: "translateY(-10px) scale(-1, 1)" },
          { transform: "translateY(0px) scale(-1, 1)" },
        ],
        {
          duration: 800,
          iterations: 1,
          easing: "ease-out",
        }
      );
      anim.addEventListener("finish", () => {
        elm.animate(
          [
            { transform: "rotate(0deg) scale(-1, 1)" },
            { transform: "rotate(3deg) scale(-1, 1)" },
            { transform: "rotate(-3deg) scale(-1, 1)" },
            { transform: "rotate(0deg) scale(-1, 1)" },
          ],
          {
            duration: 800,
            iterations: Infinity,
            easing: "ease-out",
          }
        );
      });
    },
    src: "images/person2.svg",
    style: {
      position: "fixed",
      bottom: "-20px",
      right: "0px",
      transform: "scale(-1, 1)",
      pointerEvents: "none",
      userSelect: "none",
      filter: "drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.2))",
    },
  },
  {
    element: "div",
    style: {
      transform: "translate(-50%, -50%)",
      position: "fixed",
      top: "calc(50% + 50px)",
      left: "50%",
      backgroundColor: "#ffffff",
      borderRadius: "5px",
      boxShadow: "0 0px 30px black",
      padding: "15px 15px",
      zIndex: "100",

      maxWidth: "90vw", // Set a maximum width based on viewport width (e.g., 90% of the viewport)
      maxHeight: "90vh",
      minWidth: "325px",

      display: "inline-block",
      overflowWrap: "break-word",
    },
    children: [
      {
        element: "div",
        style: {
          position: "fixed",
        },
        children: [
          {
            element: "img",
            src: "images/person3.svg", //Two random rant characters (just for the home page) looking down at the text below.
            style: {
              position: "fixed",
              left: "50%",
              top: "1px",
              pointerEvents: "none",
              userSelect: "none",
              transform: "translate(-50%, -100%)",
              transformOrigin: "bottom",
              filter: "drop-shadow(4px 4px 3px rgba(0, 0, 0, 0.2))",
            },
            GPWhenCreated: function (elm) {
              elm.animate(
                [
                  {
                    transform: "translate(-50%, -100%) scale(1.2, 0)",
                  },
                  {
                    transform: "translate(-50%, -100%) scale(1, 1)",
                  },
                ],
                {
                  duration: 900,
                  easing: "ease-out",
                }
              );
            },
          },
        ],
      },
      require("./sitenews-notice.js"),
      {
        element: "div",
        className: "fadeIn",
        gid: "mainCenter",
        style: {
          textAlign: "center",
        },
        children: [
          {
            element: "div",
            className: "fadeIn delay-3",
            style: {
              fontSize: "40px",
              color: returnRandomValueFromArray(rainbowHexes),
              fontFamily: "Fredoka",
              overflowWrap: "break-word",
              //display: "inline",
            },

            textContent: returnRandomValueFromArray(randomQuotes).trim(),
          },
          {
            element: "br",
          },
          {
            element: "div",
            style: {
              //display: "flex",
              alignContent: "center",
              textAlign: "center",
              justifyContent: "center",
            },
            className: "headerText",
            children: [
              {
                element: "img",
                src: "images/welcometo.svg",
                style: {
                  maxHeight: "70px",
                  width: "100%",
                },
              },
            ],
          },
          { element: "br" },
          //For people that always look at the center of the site for stuff, here is some "useful" links that you may need.

          {
            element: "div",
            style: {
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
            },
            children: [
              {
                element: "div",
                className: "button2",
                textContent: "Rant now!!",
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      if (!accountHelper.getCurrentValidationState()) {
                        if (
                          await dialogs.confirm(
                            "Are you sure you want to enter chat without an Random Rants + account?"
                          )
                        ) {
                          window.location.href = "/chat";
                        }
                      } else {
                        window.location.href = "/chat";
                      }
                    },
                  },
                ],
              },
              {
                element: "div",
                className: "button2",
                textContent: "Join a code",
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      if (!accountHelper.getCurrentValidationState()) {
                        if (
                          await dialogs.confirm(
                            "Are you sure you want to join someones room without an Random Rants + account?"
                          )
                        ) {
                          window.location.href = "/join";
                        }
                      } else {
                        window.location.href = "/join";
                      }
                    },
                  },
                ],
              },
              {
                element: "div",
                className: "button2",
                textContent: "About us",
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      window.location.href = "/about";
                    },
                  },
                ],
              },
            ],
          },
          {
            element: "div",
            gid: "userAccountStuffA",
            hidden: true,
            children: [
              {
                element: "div",
                style: {
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                },
                children: [
                  {
                    element: "div",
                    className: "button2",
                    textContent: "Sign In",
                    eventListeners: [
                      {
                        event: "click",
                        func: function () {
                          window.location.href = "/signin";
                        },
                      },
                    ],
                  },
                  {
                    element: "div",
                    className: "button2",
                    textContent: "Sign Up",
                    eventListeners: [
                      {
                        event: "click",
                        func: function () {
                          window.location.href = "/signup";
                        },
                      },
                    ],
                  },
                ],
              },
              { element: "br" },
            ],
          },
          {
            element: "div",
            gid: "customizeStuffDiv",
            hidden: true,
            children: [
              {
                element: "div",
                style: {
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                },
                children: [
                  {
                    element: "div",
                    className: "button2",
                    textContent: "My account & customization",
                    eventListeners: [
                      {
                        event: "click",
                        func: function () {
                          window.location.href = "/myaccount";
                        },
                      },
                    ],
                  },
                ],
              },
              { element: "br" },
            ],
          },
          {
            element: "span",
            className: "fadeIn delay-1",
            gid: "description1",
            textContent:
              "Random Rants +, made both for maximum goofiness and your digital escape from school.",
          },
          { element: "br" },
          {
            element: "span",
            className: "fadeIn delay-2",
            gid: "description2",
            textContent:
              "Talk loud as possible, play a meme sound, or type the craziest rants, it's all here.",
          },
          { element: "br" },
          {
            element: "div",
            hidden: true,
            gid: "userAccountStuffB",
            children: [
              {
                element: "span",
                className: "fadeIn delay-3",
                gid: "description3",
                children: [
                  {
                    element: "a",
                    textContent: "Sign in",
                    href: "/signin",
                  },
                  " or ",
                  {
                    element: "a",
                    textContent: "Sign up",
                    href: "/signup",
                  },
                  ", jump into a room, and rant like there is no end.",
                  " Whether its behind a Teachers back, or during research time, Random Rants + is ",
                  {
                    element: "span",
                    style: { fontWeight: "bold" },
                    textContent: "your",
                  },
                  " digital space.",
                ],
              },
            ],
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
style.textContent = require("./index-styles.css");
document.head.appendChild(style);

//Animate persons.

var person1 = elements.getGPId("person1");

var p1Animation = person1.animate(
  [
    { transform: "translateY(300px)" },
    { transform: "translateY(-10px)" },
    { transform: "translateY(0px)" },
  ],
  {
    duration: 700,
    iterations: 1,
    easing: "ease-out",
  }
);
p1Animation.addEventListener("finish", () => {
  person1.animate(
    [
      { transform: "translateY(0px)" },
      { transform: "translateY(-10px)  scale(1.2, 0.8) rotate(-2deg)" },
      { transform: "translateY(10px) scale(1.5, 0.6) rotate(2deg)" },
      { transform: "translateY(0px)" },
    ],
    {
      duration: 700,
      iterations: Infinity,
      easing: "ease-out",
    }
  );
});

var person2 = elements.getGPId("person2");

var p2Animation = person2.animate(
  [
    { transform: "translateY(300px) scale(-1, 1)" },
    { transform: "translateY(-10px) scale(-1, 1)" },
    { transform: "translateY(0px) scale(-1, 1)" },
  ],
  {
    duration: 900,
    iterations: 1,
    easing: "ease-out",
  }
);

p2Animation.addEventListener("finish", () => {
  person2.animate(
    [
      { transform: "translateY(0px) scale(-1, 1)" },
      { transform: "translateY(-10px) scale(-1.2, 0.8) rotate(-2deg)" },
      { transform: "translateY(10px) scale(-1.5, 0.6) rotate(2deg)" },
      { transform: "translateY(0px) scale(-1, 1)" },
    ],
    {
      duration: 800,
      iterations: Infinity,
      easing: "ease-out",
    }
  );
});

require("./floatingemojis.js");

//Sign in and sign up stuff shows when not logged in.

var userAccountStuffA = elements.getGPId("userAccountStuffA");
var userAccountStuffB = elements.getGPId("userAccountStuffB");
var customizeStuffDiv = elements.getGPId("customizeStuffDiv");

function showSignStuff() {
  userAccountStuffA.hidden = false;
  userAccountStuffB.hidden = false;
}

(async function () {
  var validated = await accountHelper.checkSessionCookie();
  if (!validated) {
    showSignStuff();
  } else {
    customizeStuffDiv.hidden = false;
  }
})();
