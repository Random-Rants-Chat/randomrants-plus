require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");
require("../sw.js");

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
      "Random Rants + is a community-driven project for hanging out with your friends online.",
    style: { fontSize: "1.1em" },
    children: [],
  },
  {
    element: "p",
    textContent: "Whenever you've got something on your mind, just share it here with the crew!",
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
          "Anyone looking for a creative space to talk and hang out online.",
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Students that need a break, or those wanting to explore the potential of the open web.",
      },
      { element: "br" },
      {
        element: "li",
        textContent: "People who enjoy high-energy, spontaneous digital spaces.",
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
          "File Uploads — Share your favorite media, memes, or creative assets directly in the chat.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Screen Sharing — Share your window with the room. One stream at a time ensures everyone is tuned into the same content.",
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
          "Soundboard — Use meme sounds and goofy audio reactions. Elements are synced for the whole room, though owners can manage audio permissions.",
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
          "Video & Voice Chat — Express yourself and hang out in real-time. It’s all the fun of a standard social chat with a goofy twist."",
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

  // Profiles section
  {
    element: "h2",
    textContent: "Profiles",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Everyone that has signed up for Random Rants + has a profile. It's how you stand out in the crowd.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "To keep things chill and private, your profile is unlisted—it only shows up when you actually join a room.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent: "Customize your identity so people know it's you:", 
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "ul",
    children: [
      {
        element: "li",
        textContent:
          "Username — Your permanent ID. Choose wisely, because Random Rants + uses this to track your legacy.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Display Name — Your nickname. Change it whenever! We allow almost any character, so go wild with the symbols.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "User Color — Pick a color that pops when you enter a room.",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Profile Picture — Put a picture that identifies you (doesn't have to be your face, obviously).",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Profile Font — Make your name stand out with custom display fonts. Change it whenever the vibe shifts.",
        children: [],
      },
    ],
  },

  // Privacy & Ownership
  {
    element: "h2",
    textContent: "Rooms & Spaces", // "Spaces" sounds a bit more modern/professional
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Every room is private by default. You won't find a public list here—instead, you share your space through the URL, Quick Join codes, or by inviting people by their username.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "Ownership & Control",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "When you create a room, you're the boss. You have full ownership, and you can grant permissions to anyone you trust.",
        style: { fontSize: "1em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Admins can manage other admins, but the original room creator is permanent. It's your space, your rules.",
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
        textContent: "User-moderated rooms, users get to run rooms however they want.",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "We support open expression for all users, provided the content remains within our community safety guidelines.",
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
        textContent: "Start Media Function",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "The 'Start Media' button acts as an interactive virtual display. Use it to share your screen or broadcast digital content to the room.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "This tool is built for collaborative use. Room owners can manage permissions, lock the function to ownership only, or disable it entirely.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "The 'Embed Sites' feature allows you to view specific URLs within your session; please note that these views are private to your browser.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Explore various interactive modes, including shared creative canvases and integrated TurboWarp cloud mini-games.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Video and audio streams (cameras, microphones, and screenshares) utilize direct P2P WebRTC connections to ensure user privacy.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Volume Notice: The soundboard and media functions allow for sudden audio changes; please monitor your volume settings for the best experience.",
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
        textContent: "Community & Culture", // A bit cleaner for scanners
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "This project started as a space built by students, for students—giving people a place to hang out and explore the open internet on their own terms.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "The platform provides the tools, but the vibe is set by the community. Every room has its own personality.",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "If a room isn't your style or feels 'sus,' you can just hop out and remove it from your list. You're in control of your experience.",
        style: { fontSize: "1em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Humor is subjective. Laugh at what's funny, ignore the cringe, and keep it moving.",
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
          "Random Rants + has a pretty unique story behind how it was built—",
      },
      {
        element: "a",
        href: "./history",
        textContent: "check out the project timeline here.",
      },
    ],
  },
  {
    element: "p",
    style: { fontSize: "1em", marginBottom: "1em" },
    children: [
      {
        element: "span",
        textContent: "Shoutouts to everyone who helped are ",
      },
      {
        element: "a",
        href: "./credits",
        textContent: "listed here.",
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
