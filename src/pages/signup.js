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
      {
        element: "p",
        style: { fontSize: "0.9em", color: "#b22222", marginTop: "0.5em", marginBottom: "1em" },
        children: [
          {
            element: "span",
            textContent: "Please review the "
          },
          {
            element: "a",
            href: "/about",
            target: "_blank",
            rel: "noopener noreferrer",
            textContent: "About & Safety page",
            style: { color: "#b22222", textDecoration: "underline" }
          },
          {
            element: "span",
            textContent: " before signing up to understand important warnings and community guidelines."
          },
          {
            element: "br"
          },
          {
            element: "span",
            textContent: "PLEASE READ!! The: "
          },
          {
            element: "a",
            href: "/security",
            target: "_blank",
            rel: "noopener noreferrer",
            textContent: "Security & Privacy Notice",
            style: { color: "#b22222", textDecoration: "underline" }
          },
          {
            element: "span",
            textContent: " before deciding your username and password, and carelessly joining the site."
          }
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
