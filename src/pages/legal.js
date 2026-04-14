require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");
require("../sw.js");

document.title = "Random Rants + | Legal";

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");

var randomRantsLegal = [
  // Title and intro
  require("./sitenews-notice.js"),

  // --- TL;DR SECTION ---
  {
    element: "div",
    style: {
      border: "3px dashed var(--main-text-color)",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "30px",
      backgroundColor: "rgba(0, 0, 0, 0.05)",
    },
    children: [
      {
        element: "h2",
        textContent: "The Simple Version",
        style: { marginTop: "0", fontSize: "1.8em" },
      },
      {
        element: "p",
        textContent:
          "Legal text is a headache. Here’s the deal in plain English:",
        style: { fontStyle: "italic", marginBottom: "10px" },
      },
      {
        element: "ul",
        children: [
          {
            element: "li",
            children: [
              { element: "strong", textContent: "13+ ONLY." },
              {
                element: "span",
                textContent:
                  " If you're under 13, you legally can't be here. It’s a COPPA thing. Please close the tab.",
              },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "STORAGE ISN'T FOREVER." },
              {
                element: "span",
                textContent:
                  " We clear out old files to keep the server fast. Don't use this as your only backup.",
              },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "PLAY FAIR." },
              {
                element: "span",
                textContent:
                  " We're on a free hosting tier. If you try to crash the site or spam it, we'll have to IP ban you to keep it running for everyone else.",
              },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "YOUR DATA." },
              {
                element: "span",
                textContent:
                  " We see IPs and usernames for security. We don't sell it, we just use it to keep the lights on.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    element: "hr",
    style: { margin: "20px 0", border: "1px solid #ccc" },
  },

  // --- HEADER & DISCLAIMER ---
  {
    element: "h1",
    textContent: "Legal, Safety & Terms",
    style: { fontSize: "2.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "span",
    textContent:
      "The boring stuff we have to say so the site doesn't get taken down.",
    children: [],
  },
  { element: "br" },
  { element: "br" },

  // Developer Note
  {
    element: "div",
    style: {
      backgroundColor: "rgba(255, 215, 0, 0.15)",
      padding: "10px",
      borderRadius: "5px",
      borderLeft: "3px solid orange",
      fontSize: "0.9em",
      marginBottom: "15px",
    },
    children: [
      {
        element: "strong",
        textContent: "A Note from the Developer: ",
      },
      {
        element: "span",
        textContent:
          "I’m a 15-year-old student building this in my \"spare time.\" I’ve put a massive amount of work into this site, so please don't try to break it. I'm doing my best to keep the server stable and secure for everyone.",
      },
    ],
  },

  {
    element: "p",
    textContent:
      "By using Random Rants +, you agree to these terms. If you don't agree, you can't hang out here.",
    style: { fontSize: "1.1em", marginBottom: "1em", fontWeight: "bold" },
    children: [],
  },

  // 1. Age Restriction
  {
    element: "h2",
    textContent: "1. Age Requirement (13+ Only)",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "You must be at least 13 years old to use this site. No exceptions.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "If we find out you are under 13, your account and data will be deleted immediately to comply with COPPA laws.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },

  // 2. User Content & Responsibility
  {
    element: "h2",
    textContent: "2. Content & Common Sense",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
  },
  {
    element: "p",
    textContent:
      "Random Rants + is a place to hang out and talk. We (Gvbvdxx & MOP-3000) didn't write your messages, upload your files, or start your streams—you did. You’re responsible for what you do here.",
  },

  // 3. Forbidden Content
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "3. The 'Keep Us Online' Rules",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
      },
      {
        element: "p",
        textContent:
          "We want to keep this site open and unfiltered, but we host on Render. If someone breaks their terms, they delete our whole project. To keep the lights on, the following is strictly banned:",
      },
      {
        element: "ul",
        children: [
          { element: "li", textContent: "Illegal content (Obviously)." },
          { element: "br" },
          {
            element: "li",
            textContent:
              "Pirated movies or software (Don't kill our bandwidth).",
          },
          { element: "br" },
          {
            element: "li",
            textContent:
              "Malware, phishing, or anything that messes with other users.",
          },
          { element: "br" },
          {
            element: "li",
            textContent: "Doxxing (Keep private info private).",
          },
        ],
      },
      {
        element: "h3",
        textContent: "Server Integrity",
        style: { fontSize: "1.2em", color: "#b22222" },
      },
      {
        element: "p",
        textContent:
          "This runs on a free tier and we have zero budget. If we see you trying to DDoS us, spamming requests, or attempting to crash the server for fun, we will IP ban you immediately. It's not personal, we just need the site to actually work.",
        style: { fontWeight: "bold" },
      },
    ],
  },

  // 4. File Storage
  {
    element: "h2",
    textContent: "4. How Uploads Work",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
  },
  {
    element: "p",
    textContent:
      "When you send a file, it hits our server so others can see it. To keep things organized, our system renames your file to a unique ID (like attachment-x8d9s.file). The data stays the same, we just give it a cleaner label.",
  },
  {
    element: "p",
    textContent:
      "Note: We don't have infinite space. If a file hasn't been touched in a while, our 'janitor' script deletes it. Don't use us as your only cloud storage!",
  },

  // 5. Privacy Policy
  {
    element: "h2",
    textContent: "5. Your Privacy",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
  },
  {
    element: "p",
    textContent:
      "We aren't a corporation and we have no interest in your data. We only keep what's necessary for the site to function: your username (so people know who you are) and your IP address (to keep the server secure and deal with trolls). We never sell this stuff.",
  },

  // 6. Hosting
  {
    element: "h2",
    textContent: "6. Hosting & Third Parties",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "This site is hosted on Render. By using this site, you also agree to comply with Render's Acceptable Use Policy.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    children: [
      {
        element: "span",
        textContent: "You can read their policy ",
      },
      {
        element: "a",
        href: "https://render.com/acceptable-use", // UPDATED LINK
        textContent: "here",
        target: "_blank",
        style: {
          color: "var(--link-color, blue)",
          textDecoration: "underline",
        },
      },
      {
        element: "span",
        textContent: ".",
      },
    ],
  },

  // 7. DMCA
  {
    element: "h2",
    textContent: "7. DMCA & Contact",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "If you see a file that belongs to you (Copyright Infringement), or see something illegal, please contact the site owners immediately so we can remove it.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "You can reach out to Gvbvdxx via GitHub or the contact methods on the About page.",
    style: { fontSize: "1em", marginBottom: "1em" },
    children: [],
  },
];

var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter", // Using the same class as About page for consistent styling
    children: randomRantsLegal,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
