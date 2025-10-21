document.title = "Random Rants + | Sign in";

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
      placeholder: "Enter your username",
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
      placeholder: "Enter your password",
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
        textContent: "Sign into your RR+ Account",
      },
      { element: "br" },
      {
        element: "span",
        textContent: "Sign in to unlock all the features of Random Rants +",
      },
      signInArea,
    ],
  },
];

elements.appendElements(
  elements.body,
  elements.createElementsFromJSON(elementJSON)
);

var loader = require("./loadingscreen.js");

var goButton = elements.getGPId("goButton");
var usernameInput = elements.getGPId("username_input");
var passwordInput = elements.getGPId("password_input");

async function logIn() {
  var loadingScreen = loader.doLoadingScreen();
  goButton.disabled = true;
  try {
    await accountHelper.loginToAccount(
      usernameInput.value,
      passwordInput.value
    );
    window.location.href = gotoHref;
  } catch (e) {
    dialog.alert(e);
  }
  goButton.disabled = false;
  loadingScreen.remove();
}

goButton.addEventListener("click", logIn);

usernameInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    passwordInput.focus();
  }
});

passwordInput.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    logIn();
  }
});
