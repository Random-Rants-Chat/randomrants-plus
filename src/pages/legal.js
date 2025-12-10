require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");

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
        textContent: "TL;DR (The Short Version)",
        style: { marginTop: "0", fontSize: "1.8em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Don't want to read the scary legal text below? Here is the simple version:",
        style: { fontStyle: "italic", marginBottom: "10px" },
        children: [],
      },
      {
        element: "ul",
        children: [
          {
            element: "li",
            children: [
              { element: "strong", textContent: "YOU MUST BE 13+." },
              {
                element: "span",
                textContent:
                  " If you are under 13, you legally cannot be here. Please close the tab.",
              },
            ],
          },
          { element: "br" },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "FILES ARE TEMPORARY." },
              {
                element: "span",
                textContent:
                  " We delete old files to save space. Don't use this as permanent cloud storage.",
              },
            ],
          },
          { element: "br" },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "DON'T KILL THE SERVER." },
              {
                element: "span",
                textContent:
                  " We run on a free tier. If you spam requests or try to crash the site, we will IP BAN you instantly.",
              },
            ],
          },
          { element: "br" },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "YOUR DATA." },
              {
                element: "span",
                textContent:
                  " We can see your IP address and username. We don't sell it, but we have it.",
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
      backgroundColor: "rgba(255, 215, 0, 0.15)", // Subtle highlight
      padding: "10px",
      borderRadius: "5px",
      borderLeft: "3px solid orange",
      fontSize: "0.9em",
      marginBottom: "15px",
    },
    children: [
      {
        element: "strong",
        textContent: "Developer Note: ",
      },
      {
        element: "span",
        textContent:
          "This site is maintained by a 15-year-old student. Most of this legal page was machine-generated to keep things safe. Please don't kill this site, I sacrificed my homework to build it.",
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

  // 2. Liability
  {
    element: "h2",
    textContent: "2. We aren't responsible for user content",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants + is a platform for users to chat. The creators (Gvbvdxx & Im_CatmanYT) are not responsible for what you say, the files you upload, or the streams you broadcast.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "You are responsible for your own actions. If you break the law here, that's on you, not us.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },

  // 3. Forbidden Content & Server Safety
  {
    element: "div",
    className: "yellowBoxedText",
    children: [
      {
        element: "h2",
        textContent: "3. The 'Don't Get Us Banned' Rules",
        style: { fontSize: "1.5em", marginTop: "1.2em" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "We like having no filters, but we host this site on Render. If you break their rules, our server gets deleted. So, the following is strictly prohibited:",
        style: { fontSize: "1em", marginBottom: "0.5em" },
        children: [],
      },
      {
        element: "ul",
        children: [
          {
            element: "li",
            textContent: "Illegal content of any kind.",
            children: [],
          },
          { element: "br" },
          {
            element: "li",
            textContent:
              "Copyright infringement (Don't upload pirated movies).",
            children: [],
          },
          { element: "br" },
          {
            element: "li",
            textContent: "Malware, phishing links, or hacking tools.",
            children: [],
          },
          { element: "br" },
          {
            element: "li",
            textContent:
              "Doxxing (Sharing other people's real-life private info).",
            children: [],
          },
        ],
      },
      {
        element: "h3", // Sub-header for Server Safety
        textContent: "Server Safety & IP Bans",
        style: {
          fontSize: "1.2em",
          marginTop: "1em",
          marginBottom: "0.5em",
          color: "#b22222",
        }, // Dark red warning color
        children: [],
      },
      {
        element: "p",
        textContent:
          "This site runs on a free tier. We have limited resources. If we check the request logs and see you are intentionally trying to crash the server, spamming requests, or attempting to DDoS us, we will permanently ban your IP address.",
        style: { fontSize: "1em", fontWeight: "bold" },
        children: [],
      },
      {
        element: "p",
        textContent:
          "Users with Ownership also have the right to ban you from rooms if you break these rules.",
        style: { fontSize: "1em", marginTop: "1em" },
        children: [],
      },
    ],
  },

  // 4. File Storage
  {
    element: "h2",
    textContent: "4. How Files & Uploads Work",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "When you attach a file, it is uploaded to our server to make downloading faster for everyone else in the room. Here is how that works:",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "ul",
    children: [
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Renaming: " },
          {
            element: "span",
            textContent:
              "To prevent errors, we rename your file to a generated ID (like ",
          },
          { element: "code", textContent: "attachment-x8d9s.file" },
          {
            element: "span",
            textContent:
              "), but the content inside remains exactly what you uploaded.",
          },
        ],
      },
      { element: "br" },
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Temporary Storage: " },
          {
            element: "span",
            textContent:
              "We don't have infinite storage. Files are automatically deleted from the server if they haven't been requested/downloaded for a while. Save your important stuff elsewhere.",
          },
        ],
      },
    ],
  },

  // 5. Privacy Policy
  {
    element: "h2",
    textContent: "5. Privacy Policy",
    style: { fontSize: "1.5em", marginTop: "1.2em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "We aren't a big corporation selling your data. Here is exactly what we collect:",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "ul",
    children: [
      {
        element: "li",
        textContent: "Your Username & Display Name (To show who you are).",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Your IP Address (Automatically collected for connection, security logs, and banning bad actors).",
        children: [],
      },
    ],
  },
  {
    element: "p",
    textContent: "We do not sell your personal data to third parties.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
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
