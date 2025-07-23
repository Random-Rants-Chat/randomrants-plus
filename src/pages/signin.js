require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper");
var dialog = require("../dialogs.js");
var signInArea = {
  element:"div",
  children: [
    {
      element:"span",
      textContent: "Username:"
    },
    {
      element:"input",
      type: "text",
      gid: "username_input",
      className: "inputText1"
    },
    {element: "br"},
    {
      element:"span",
      textContent: "Password:"
    },
    {
      element:"input",
      type: "password",
      gid: "password_input",
      className: "inputText1"
    },
    {
      element: "div",
      className: "button",
      textContent: "Sign in!",
      gid: "goButton"
    },
  ]
}
var elementJSON = [
  {
    element: "div",
    className: "centeredDialog",
    children: [
      {
        element: "span",
        className: "headerText",
        textContent: "Sign In",
      },
      {element:"br"},
      {
        element: "span",
        textContent: "Log in to your Random Rants + account to use more features.",
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

async function logIn() {
  goButton.disabled = true;
  try{
    await accountHelper.loginToAccount(usernameInput.value,passwordInput.value);
    window.location.href = "/";
  }catch(e){
    dialog.alert(e);
  }
  goButton.disabled = false; 
}

goButton.addEventListener("click",logIn);

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
