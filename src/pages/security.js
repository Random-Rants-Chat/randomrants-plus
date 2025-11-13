document.title = "Random Rants + | Security & Privacy Notice";

require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

var randomRantsSecurity = [
  {
    element: "h1",
    textContent: "Security & Privacy",
    style: { fontSize: "2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants + was made for fun first, not bank account security. Here are some things to read and follow to stay secure.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "What to Know",
        style: { fontSize: "1.5em", marginTop: "0.5em" },
        children: [],
      },
      {
        element: "ul",
        children: [
          {
            element: "li",
            textContent:
              "Database is locked with an API key - All your stuff, like rooms and accounts, are locked behind this API key. While I do my best to prevent exposing this key to the public, the risk still exists.",
          },
          {
            element: "li",
            textContent:
              "No site admin report button - Whatever is posted in a room, is what only the room owners can see, they can clear the whole chat out or ban someone, but moderation is managed by the room owners.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "Room owners can run the room however they want - Pick a room that fits what you like best.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "Sometimes one file can overwrite another (Race condition) - If someone were to send a edit request for one thing (like a room or account), and then send another at the same time, there is a chance that one may beat the other and cause a overwrite. This is something that's complicated to fix, so it's not likely I would fix this.",
            children: [],
          },
          {
            element: "li",
            textContent:
              "No password reset option - If you forget your password, you're locked out your account forever!",
            style: { color: "darkred", fontWeight: "bold" },
            children: [],
          },
        ],
      },
    ],
  },
  {
    element: "h2",
    textContent: "Things you should do",
    style: { fontSize: "1.5em", marginTop: "0.5em" },
  },
  {
    element: "ul",
    children: [
      {
        element: "li",
        textContent:
          'Use a unique password - Don\'t reuse passwords from other sites, and make sure it can\'t be easily guessed. (Avoid things like "abc123" or "a1b2c3")',
      },
      {
        element: "li",
        textContent:
          "Don't send super personal info through rooms - Do what it says, because if someone's account was hacked, they could be a hacker pretending to be them.",
      },
      {
        element: "li",
        textContent:
          "Sign out when you're done - When you're done with Random Rants +, make sure you sign out if you're on a shared device.",
      },
      {
        element: "li",
        textContent:
          "Check devices, and extensions - There may be malware wanting to steal cookies, if they steal them then they have access to your account.",
      },
    ],
  },
  {
    element: "h2",
    textContent: "Our Privacy Policy",
    style: {
      fontSize: "1.8em",
      marginTop: "1.5em",
      marginBottom: "0.5em",
      borderTop: "2px solid #ccc",
      paddingTop: "1em",
    },
  },
  {
    element: "p",
    textContent: "Last Updated: Wednesday, October 8, 2025",
    style: { fontStyle: "italic", marginBottom: "1.5em", color: "#555" },
  },
  {
    element: "p",
    textContent:
      "This explains how we store your data. So you can understand what we see on our end, and what we don't.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
  },
  {
    element: "h3",
    textContent: "Data That Is Kept Private",
    style: { fontSize: "1.5em", marginTop: "1em", marginBottom: "0.5em" },
  },
  {
    element: "ul",
    style: { fontSize: "1.1em", lineHeight: "1.6" },
    children: [
      {
        element: "li",
        style: { marginBottom: "0.5em" },
        children: [
          {
            element: "strong",
            textContent: "Realtime Video & Audio streams: ",
          },
          {
            element: "span",
            textContent:
              "To start a connection, your device has to make a digital handshake with the WebRTC signaling server, this server we own, but is stored in RAM memory.",
          },
          {
            element: "span",
            textContent:
              "We can't see this RAM memory, and what's stored is temporary.",
          },
          {
            element: "span",
            textContent:
              "This server can't see the video or audio streams, just minimal connection data.",
          },
          {
            element: "span",
            textContent:
              " (We use different STUN/TURN servers for WebRTC video & audio streaming, that means servers like Google's)",
          },
        ],
      },
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Chat Messages: " },
          {
            element: "span",
            textContent:
              "To send the messages, we do have to pass these through our servers, but they are stored temporarily in RAM memory. ",
          },
          {
            element: "span",
            textContent:
              "We never log or store any of your messages anywhere else. We can't look at data stored in RAM memory directly off the server.",
          },
        ],
      },
    ],
  },
  {
    element: "h3",
    textContent: "Data That We Store",
    style: { fontSize: "1.5em", marginTop: "1.5em", marginBottom: "0.5em" },
  },
  {
    element: "p",
    textContent:
      "For the site to function, we must store some basic information in our Supabase project. In the event of a security issue, or an fix or improvement, an administrator may need to view this data. This is what we store:",
    style: { fontSize: "1.1em", marginBottom: "1em" },
  },
  {
    element: "ul",
    style: { fontSize: "1.1em", lineHeight: "1.6" },
    children: [
      {
        element: "li",
        style: { marginBottom: "0.5em" },
        children: [
          { element: "strong", textContent: "Account Info: " },
          {
            element: "span",
            textContent:
              "Your username, display name, hashed password, joined room list, and profile picture URL.",
          },
        ],
      },
      {
        element: "li",
        style: { marginBottom: "0.5em" },
        children: [
          { element: "strong", textContent: "Room Info: " },
          {
            element: "span",
            textContent:
              "We store the Room ID, the Room Name you set, and other settings you configure for that room (like the block list).",
          },
        ],
      },
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Uploaded Files: " },
          {
            element: "span",
            textContent:
              "Files you upload are temporarily stored in the node js server disk so other users can view them. These files are automatically deleted after a set period after no requests are made to them.",
          },
        ],
      },
    ],
  },
  {
    element: "p",
    children: [
      { element: "span", textContent: "We will " },
      { element: "strong", textContent: "never" },
      {
        element: "span",
        textContent:
          " look at your stored data unless it is absolutely necessary for managing this site's security and stability. We will ",
      },
      { element: "strong", textContent: "never" },
      {
        element: "span",
        textContent:
          " sell your data or share it with any sketchy people or companies.",
      },
    ],
    style: {
      fontSize: "1.1em",
      fontWeight: "bold",
      marginTop: "2em",
      textAlign: "center",
    },
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
