var elements = require("./gp2/elements.js");
var accountHelper = require("./accounthelper/index.js");

var elementJSON = [
  {
    element: "div",
    className: "userMenuBar",
    gid: "userMenuBar",
    children: [],
  },
];

elements.appendElements(
  elements.getGPId("menu_bar"),
  elements.createElementsFromJSON(elementJSON)
);

var signInButton = {
  element: "div",
  className: "menuBarItem",
  textContent: "Sign in",
  gid: "menu_signIn",
};
var signUpButton = {
  element: "div",
  className: "menuBarItem",
  textContent: "Sign up",
  gid: "menu_signUp",
};

var myAccountButton = {
  element: "div",
  className: "menuBarItem",
  gid: "menu_myAccount",
};

function handleSignedOutAccountButtons() {
  var signInButton = elements.getGPId("menu_signIn");

  signInButton.addEventListener("click", () => {
    window.location.href = "/signin";
  });

  var signUpButton = elements.getGPId("menu_signUp");

  signUpButton.addEventListener("click", () => {
    window.location.href = "/signup";
  });
}

function handleUserAccountButtons() {
  var myAccountButton = elements.getGPId("menu_myAccount");

  myAccountButton.addEventListener("click", () => {
    window.location.href = "/myaccount";
  });
}

(async function () {
  var validated = await accountHelper.checkSessionCookie();
  if (validated) {
    myAccountButton = {
      element: "div",
      gid: "menu_myAccount",
      className: "menuBarItemUsername",
      style: {
        display: "flex",
      },
      children: [
        {
          element: "img",
          style: {
            height: "40px",
            maxWidth: "40px",
          },
          src: accountHelper.getProfilePictureURL(validated.username)
        },
        {
          element: "span",
          style: {
            alignContent: "center",
            fontWeight: "bold",
            color: validated.color || "#000000",
          },
          textContent: validated.username,
        },
        {
          element: "div",
          style: {
            width: "10px",
          },
        },
      ],
    };
    elements.appendElements(
      elements.getGPId("menu_bar"),
      elements.createElementsFromJSON([myAccountButton])
    );
    handleUserAccountButtons();
  } else {
    elements.appendElements(
      elements.getGPId("menu_bar"),
      elements.createElementsFromJSON([signInButton, signUpButton])
    );
    handleSignedOutAccountButtons();
  }
})();
