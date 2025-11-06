var elements = require("../../gp2/elements.js");
var AElement = require("../../gp2/aelement.js");
var accountHelper = require("../../accounthelper/index.js");
var RTNotifications = require("./notifications/index.js");
var KnownUserList = require("./userlist-menu.js");

function getHrefURLOrNormalURL (normalURL) {
  var params = new URLSearchParams(window.location.search);
  if (params.get("href")) {
    return (normalURL+"?href=" + params.get("href"));
  }
  return normalURL;
}

var elementJSON = [];

elements.appendElements(
  elements.getGPId("menuBar"),
  elements.createElementsFromJSON(elementJSON)
);

var signInButton = {
  element: "a",
  className: "menuBarItem",
  textContent: "Sign in",
  gid: "menu_signIn",
  href: getHrefURLOrNormalURL("./signin")
};
var signUpButton = {
  element: "a",
  className: "menuBarItem",
  textContent: "Sign up",
  gid: "menu_signUp",
  href: getHrefURLOrNormalURL("./signup")
};

var myAccountButton = {};

var validated = accountHelper.getCurrentValidationState();
if (validated) {
  myAccountButton = {
    element: "a",
    href: "./myaccount",
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
} else {
  elements.appendElements(
    elements.getGPId("menuBar"),
    elements.createElementsFromJSON([signInButton, signUpButton])
  );
}
