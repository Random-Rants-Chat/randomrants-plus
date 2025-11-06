var elements = require("./gp2/elements.js");
var AElement = require("./gp2/aelement.js");
var accountHelper = require("./accounthelper/index.js");

function getHrefURLOrNormalURL (normalURL) {
  var params = new URLSearchParams(window.location.search);
  if (params.get("href")) {
    return (normalURL+"?href=" + params.get("href"));
  }
  return normalURL;
}

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
  element: "a",
  className: "menuBarItem",
  textContent: "Sign in",
  gid: "menu_signIn",
  href: getHrefURLOrNormalURL("./signin"),
};
var signUpButton = {
  element: "a",
  className: "menuBarItem",
  textContent: "Sign up",
  gid: "menu_signUp",
  href: getHrefURLOrNormalURL("./signup"),
};

var myAccountButton = {
  element: "div",
  className: "menuBarItem",
  gid: "menu_myAccount",
};

(async function () {
  var validated = await accountHelper.checkSessionCookie();
  if (validated) {
    myAccountButton = {
      element: "a",
      gid: "menu_myAccount",
      className: "menuBarItemUsername",
      href: "./myaccount",
      style: {
        display: "flex",
      },
      children: [
        {
          element: "img",
          style: {
            outline: "none",
            borderRadius: "20px",
            backgroundColor: "#969696",
            imageRendering: "pixelated",
            top: "0px",
            width: "36px",
            height: "36px",
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: "#767676",
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
      elements.getGPId("menu_bar"),
      elements.createElementsFromJSON([myAccountButton])
    );
  } else {
    elements.appendElements(
      elements.getGPId("menu_bar"),
      elements.createElementsFromJSON([signInButton, signUpButton])
    );
  }
})();
