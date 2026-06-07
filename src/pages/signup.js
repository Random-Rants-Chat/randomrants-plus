document.title = "Random Rants + | Sign up";

require("../mobile-viewport-fix");
require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");
require("../sw.js");

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper");
var dialog = require("../dialogs.js");
var BotCheckDiv = require("./botcheckdiv.js");

var LEGALDAILOG = `
Please don't lie, we're doing this kind of stuff because of laws, not us.
If you decide to lie, your risking a data deletion, and also legally getting us in trouble.
`;


var LEGALDAILOG2 = `
Do you actually agree to following our Terms of Use & Privacy Policy?
You need to check that (we have a short version at the top for quick reading).
If you break them, we may IP ban you.
`;

var params = new URLSearchParams(window.location.search);
var gotoHref = "/myaccount";
if (params.get("href")) {
  gotoHref = params.get("href");
}

var botCheck = new BotCheckDiv();
var signInArea = {
  element: "div",
  children: [
    {
      element: "span",
      textContent: "Username:",
    },
    {
      element: "input",
      type: "text",
      gid: "username_input",
      className: "inputText1",
      placeholder: "Enter a username",
    },
    { element: "br" },
    {
      element: "span",
      textContent: "Password:",
    },
    {
      element: "input",
      type: "password",
      gid: "password_input",
      className: "inputText1",
      placeholder: "Enter a password",
    },
    {
      element: "br",
    },
    {
      element: "div",
      children: [
        {
          element: "span",
          textContent: "I'm 13+ ",
        },
        {
          element: "span",
          textContent: "(required):",
          style: {
            color: "rgba(200, 0, 0, 1)",
            fontWeight: "bold"
          }
        },
        {
          element: "input",
          type: "checkbox",
          gid: "age_checkbox",
          style: { marginLeft: "2px" },
          eventListeners: [
            {
              event: "input",
              func: function () {
                if (this.value) {
                  dialog.alert(LEGALDAILOG.trim());
                }
              }
            }
          ]
        },
      ],
    },
    {
      element: "div",
      children: [
        {
          element: "span",
          textContent: "I agree to the Terms of Use & Privacy Policy ",
        },
        {
          element: "span",
          textContent: "(required):",
          style: {
            color: "rgba(200, 0, 0, 1)",
            fontWeight: "bold"
          }
        },
        {
          element: "input",
          type: "checkbox",
          gid: "legal_checkbox",
          style: { marginLeft: "2px" },
        },
      ],
    },
    botCheck.jsonElement,
    {
      element: "div",
      className: "button",
      textContent: "Lets go",
      gid: "goButton",
    },
  ],
};
var elementJSON = [
  {
    element: "div",
    className: "centeredDialog",
    children: [
      require("./sitenews-notice.js"),
      {
        element: "span",
        className: "headerText",
        textContent: "Create Your RR+ Account",
      },
      { element: "br" },
      {
        element: "span",
        textContent:
          "Join to save rooms, customize how you look, and create your own rooms.",
      },
      require("./legal-note-elm.js"),
      {
        element: "p",
        style: {
          fontSize: "0.9em",
          color: "#b22222",
          marginTop: "0.5em",
          marginBottom: "1em",
        },
        children: [
          {
            element: "span",
            textContent: "Look at the ",
          },
          {
            element: "a",
            href: "/about",
            target: "_blank",
            rel: "noopener noreferrer",
            textContent: "About & Safety page",
            style: { color: "#b22222", textDecoration: "underline" },
          },
          {
            element: "span",
            textContent: " and ",
          },
          {
            element: "a",
            href: "/security",
            target: "_blank",
            rel: "noopener noreferrer",
            textContent: "Security & Privacy Notice",
            style: { color: "#b22222", textDecoration: "underline" },
          },
          {
            element: "span",
            textContent: " before you sign up.",
          },
        ],
      },
      signInArea,
    ],
  },
];

elements.appendElements(
  elements.body,
  elements.createElementsFromJSON(elementJSON),
);

var goButton = elements.getGPId("goButton");
var usernameInput = elements.getGPId("username_input");
var passwordInput = elements.getGPId("password_input");
var ageCheckbox = elements.getGPId("age_checkbox");
var legalCheckbox = elements.getGPId("legal_checkbox");
var loader = require("./loadingscreen.js");

async function signUp() {
  if (!ageCheckbox.checked) {
    dialog.alert(
      'Did you forget to check "I\'m 13+?"\nYou must agree to what it says.\nIt\'s a legal thing.',
    );
    return;
  }
  if (!legalCheckbox.checked) {
    dialog.alert(LEGALDAILOG2.trim());
    return;
  }

  var loadingScreen = loader.doLoadingScreen();
  goButton.disabled = true;
  try {
    await accountHelper.signupAccount(
      usernameInput.value,
      passwordInput.value,
      botCheck.getCheckID(),
    );
    window.location.href = gotoHref;
  } catch (e) {
    botCheck.reset();
    dialog.alert(e);
  }
  goButton.disabled = false;
  loadingScreen.remove();
}

goButton.addEventListener("click", signUp);

usernameInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    passwordInput.focus();
  }
});

passwordInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    botCheck.handleTabTo();
  }
});
