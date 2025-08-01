require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

var randomRantsSecurity = [
  {
    element: "h1",
    textContent: "Security & Privacy Notice",
    style: { fontSize: "2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants + is still in development, and some security systems are either basic or incomplete. While we do our best to protect your experience, please understand the risks before sharing anything sensitive.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "Current Limitations",
        style: { fontSize: "1.5em", marginTop: "0.5em" },
        children: [],
      },
      {
        element: "ul",
        children: [
          {
            element: "li",
            textContent:
              "Passwords are not stored with strong hashing — don't reuse passwords from other sites.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "Account cookies are not securely signed or encrypted. Avoid using the site on shared devices.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "There's no system for reporting or blocking users (yet).",
            children: [],
          },
          {
            element: "li",
            textContent:
              "Room moderation is manual — owners and ownership users control the environment.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "The backend server script is over 2000 lines of code. This makes it harder to patch security issues quickly, especially since we rely on scrolling and Ctrl+F to find parts of the code.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "Account recovery is not possible — there is no email or backup system. If you forget your password, you will be locked out of your account.",
            style: { color: "darkred", fontWeight: "bold" },
            children: [],
          },
        ],
      },
    ],
  },
  {
    element: "p",
    textContent:
      "This platform is a personal, experimental project — mostly for fun. If you’re worried about privacy or account safety, you might want to wait until stronger security is added.",
    style: { fontSize: "1em", fontStyle: "italic", marginTop: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "We recommend using a unique, throwaway password, and avoiding sensitive topics or private info in chat.",
    style: { fontSize: "1em", fontWeight: "bold", marginTop: "0.5em" },
    children: [],
  },
];


var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter",
    children: randomRantsSecurity,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
