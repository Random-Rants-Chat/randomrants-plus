document.title = "Random Rants + | Sign up";

require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper");
var dialog = require("../dialogs.js");

var params = new URLSearchParams(window.location.search);
var gotoHref = "/myaccount";
if (params.get("href")) {
  gotoHref = params.get("href");
}

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
  elements.createElementsFromJSON(elementJSON)
);

var goButton = elements.getGPId("goButton");
var usernameInput = elements.getGPId("username_input");
var passwordInput = elements.getGPId("password_input");
var loader = require("./loadingscreen.js");

async function signUp() {
  var loadingScreen = loader.doLoadingScreen();
  goButton.disabled = true;
  try {
    await accountHelper.signupAccount(usernameInput.value, passwordInput.value);
    window.location.href = gotoHref;
  } catch (e) {
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
    signUp();
  }
});
