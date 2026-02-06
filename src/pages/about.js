require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");

document.title = "Random Rants + | About";

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

const CREATOR_SOCIALS = require("./socials");

var randomRantsAbout = [
  // Title and intro
  require("./sitenews-notice.js"),
  require("./legal-note-elm.js"),
  {
    element: "h1",
    textContent: "About Random Rants +",
    style: { fontSize: "2.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "span",
    textContent: "The page nobody reads, but you should.",
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants + is the goofy site that lets you hang out with your friends online.",
    style: { fontSize: "1.1em" },
    children: [],
  },
  {
    element: "p",
    textContent: "Whenever you feel bored, just rant here with your friends!",
    style: { fontSize: "1.1em", lineHeight: "0px", marginBottom: "1em" },
  },

  //Created by:
  {
    element: "h2",
    textContent: "Created by",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "div",
    children: CREATOR_SOCIALS,
  },

  // Audience
  {
    element: "h2",
    textContent: "Who this is made for",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "ul",
    children: [
      {
        element: "li",
        textContent:
          "Anyone looking for ways to talk online or enjoy online hangouts",
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Students that need a break, or wanting to escape school and enter the world of internet",
      },
      { element: "br" },
      {
        element: "li",
        textContent: "People that enjoy small bursts of chaos.",
      },
    ],
  },

  // Features
  {
    element: "h2",
    textContent: "Things you can do",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "ul",
    children: [
      {
        element: "li",
        textContent:
          "Video & Voice chat - Scream loud, and make goofy faces. Just like your adverage online chats.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Screen Sharing — Only one screenshare per room, so expect battles between screensharing content.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          'Chat + Commands — Owners and users with ownership get special commands, list them all with ";help".',
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Soundboard — Meme sounds, and goofy noises. All synced to everyone in the chatroom. Its all you need for laughter, unless the owner shuts it down.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Owner & Ownership permissions — Owners can give out ownership. Ownership has the same permissions as owner. Owner permissions let you edit the room settings, and run commands. Ownership users can't remove the room owner. The room owner gets to keep their permissions.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "File Uploads — Drop anything you want, memes or cursed content. Whatever it is, its up to you.",
        children: [],
      },
    ],
  },

  //Profiles
  {
    element: "h2",
    textContent: "Profiles",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Everyone that has signed up for Random Rants + has a profile.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },

  {
    element: "p",
    textContent:
      "Your profile is unlisted, but it can be seen when you join a room.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },

  {
    element: "p",
    textContent: "You can customize your profile in these ways: ",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },

  {
    element: "ul",
    children: [
      {
        element: "li",
        textContent:
          "Username - You're locked to the one you have once you sign up. Pretty much how Random Rants + identifies you.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Display Name - This is basically a nickname for your account, change it any time. It allows almost any character. (Including spaces)",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "User Color - This will appear as your color when you join a room, change it any time you want.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Profile picture - Put a picture that identifies you, it doesn't need to be your face. Change any time you want.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Profile font - Make your display name pop! Choose from a selection of display name fonts. Change it whenever you feel like it.",
        children: [],
      },
      { element: "br" },
    ],
  },

  // Privacy & Ownership
  {
    element: "h2",
    textContent: "Rooms/Chatrooms",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Every room is unlisted, and stuck to it. share it through the URL, Quick Join codes, or inviting through the username.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "Ownership & Owner Control",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "You have ownership when you make your own rooms, and you can hand it out to anyone you want.",
        style: { fontSize: "1em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Users with ownership can remove others with ownership, but the room creator can't be removed.",
        style: { fontSize: "1em" },
        children: [],
      },
    ],
  },

  // Moderation
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "No filters, and barely no moderation.",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "We dont censor any user content, pretty much simple as that.",
        style: { fontSize: "1em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Moderation can be done by users with ownership. They can block/ban users from their rooms, or clear the whole chat.",
        style: { fontSize: "1em" },
        children: [],
      },
    ],
  },

  // Media and sharing
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "Start media button",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "This is pretty much a interactive virtual television. You can plug in your screen or start some other content.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Anyone can put anything in there. If an user with ownership doesn't want anyone doing anything, they can remove the function completley, or lock it to ownership only.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "You can start embeded sites, but those only open the url you typed, everything else is different for other users.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "There is also other cool modes, like scratch cloud mini-games (we use modified TurboWarp) for your room, and also a shared painting canvas.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Video streams (cameras, microphones, screenshares, etc) go straight to WebRTC, no sus servers watching your face or screen.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Beware: The soundboard and this media function allow sudden loud sounds, turn down your volume before someone plays something loud, unless you like blowing your eardrums.",
        style: {
          fontSize: "1em",
          fontWeight: "bold",
          color: "#b22222",
          marginBottom: "1em",
        },
        children: [],
      },
    ],
  },

  // Teen jokes and culture
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "Teen jokes & Teen goofyness",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "This place started as a place made by Middle Schoolers - for Middle Schoolers to escape school and hop into the world of internet.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "The website doesn't have much of this content itself, but the user content may differ for everyone.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "If something feels too sus or crosses a line, you can hop out the room and remove it from you list.",
        style: { fontSize: "1em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Humor is different for everyone, laugh at what you think is funny, and keep rolling your eyes at the cringe stuff.",
        style: { fontSize: "1em", marginBottom: "1em" },
        children: [],
      },
    ],
  },

  {
    element: "p",
    style: { fontSize: "1em", marginBottom: "1em" },
    children: [
      {
        element: "span",
        textContent:
          "Also, Random Rants + also has a big history of how it was created - ",
      },
      {
        element: "a",
        href: "./history",
        textContent: "click here to read it.",
      },
    ],
  },
  {
    element: "p",
    style: { fontSize: "1em", marginBottom: "1em" },
    children: [
      {
        element: "span",
        textContent: "Credits can be found ",
      },
      {
        element: "a",
        href: "./credits",
        textContent: "here.",
      },
    ],
  },
];

var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter",
    children: randomRantsAbout,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
