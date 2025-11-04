var elements = require("../../gp2/elements.js");
var AElement = require("../../gp2/aelement.js");
var accountHelper = require("../../accounthelper/index.js");
var RTNotifications = require("./notifications/index.js");
var KnownUserList = require("./userlist-menu.js");

var elementJSON = [];

elements.appendElements(
  elements.getGPId("menuBar"),
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
  var params = new URLSearchParams(window.location.search);
  var signInButton = elements.getGPId("menu_signIn");

  signInButton.addEventListener("click", () => {
    if (params.get("href")) {
      AElement.openLink("/signin?href=" + params.get("href"));
      return;
    }
    AElement.openLink("/signin");
  });

  var signUpButton = elements.getGPId("menu_signUp");

  signUpButton.addEventListener("click", () => {
    if (params.get("href")) {
      AElement.openLink("/signup?href=" + params.get("href"));
      return;
    }
    AElement.openLink("/signup");
  });
}

function handleUserAccountButtons() {
  var myAccountButton = elements.getGPId("menu_myAccount");

  myAccountButton.addEventListener("click", () => {
    AElement.openInNewTab("/myaccount");
  });
}

var validated = accountHelper.getCurrentValidationState();
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
          outline: "none",
          borderRadius: "20px",
          backgroundColor: "var(--profile-background)",
          imageRendering: "pixelated",
          top: "0px",
          width: "36px",
          height: "36px",
          borderStyle: "solid",
          borderWidth: "2px",
          borderColor: "var(--profile-border-color)",
        },
        src: accountHelper.getProfilePictureURL(validated.username),
      },
      {
        element: "div",
        style: {
          display: "flex",
          flexDirection: "column",
          marginLeft: "5px",
        },
        children: [
          {
            element: "span",
            style: {
              alignContent: "center",
              fontWeight: "bold",
              color: validated.color || "#000000",
              fontSize: "15px",
              fontFamily: validated.font,
            },
            textContent: validated.displayName,
          },
          {
            element: "span",
            style: {
              alignContent: "center",
              color: "#000000",
              fontSize: "9.5px",
            },
            textContent: "Account Settings & Customization",
          },
        ],
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
    elements.getGPId("menuBar"),
    elements.createElementsFromJSON([
      KnownUserList.getMenuItem(),
      RTNotifications.getMenuItem(),
      myAccountButton,
    ])
  );
  RTNotifications.startup();
  handleUserAccountButtons();
} else {
  elements.appendElements(
    elements.getGPId("menuBar"),
    elements.createElementsFromJSON([signInButton, signUpButton])
  );
  handleSignedOutAccountButtons();
}
