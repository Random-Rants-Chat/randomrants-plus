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
      textContent: "Sign up!",
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
        textContent: "Sign Up",
      },
      {element:"br"},
      {
        element: "span",
        textContent: "Create a Random Rants + account to access more features of the website.",
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

async function signUp() {
  goButton.disabled = true;
  try{
    await accountHelper.signupAccount(usernameInput.value,passwordInput.value);
    window.location.href = "/";
  }catch(e){
    dialog.alert(e);
  }
  goButton.disabled = false; 
}

goButton.addEventListener("click",signUp);

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