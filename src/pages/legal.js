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
  {
    element: "div",
    style: {
      border: "3px dashed var(--main-text-color)", // Dashed border fits the "sketchy/draft" vibe
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "30px",
      backgroundColor: "rgba(0, 0, 0, 0.05)" // Slightly darker/lighter background
    },
    children: [
      {
        element: "h2",
        textContent: "TL;DR (The Short Version)",
        style: { marginTop: "0", fontSize: "1.8em" },
        children: []
      },
      {
        element: "p",
        textContent: "Don't want to read the scary legal text below? Here is the simple version:",
        style: { fontStyle: "italic", marginBottom: "10px" },
        children: []
      },
      {
        element: "ul",
        children: [
          {
            element: "li",
            children: [
                { element: "strong", textContent: "YOU MUST BE 13+." },
                { element: "span", textContent: " If you are under 13, you legally cannot be here. Please close the tab." }
            ]
          },
          { element: "br" },
          {
            element: "li",
            children: [
                { element: "strong", textContent: "DON'T KILL THE SERVER." },
                { element: "span", textContent: " If you post illegal stuff, malware, or pirated movies, our host will delete the entire site. Don't be that guy." }
            ]
          },
          { element: "br" },
          {
            element: "li",
            children: [
                { element: "strong", textContent: "NO DOXXING." },
                { element: "span", textContent: " Don't share people's real addresses or private info. That gets you banned instantly." }
            ]
          },
          { element: "br" },
          {
            element: "li",
            children: [
                { element: "strong", textContent: "YOUR DATA." },
                { element: "span", textContent: " We can see your IP address and username. (if you sign up) We don't sell it, but we have it." }
            ]
          }
        ]
      }
    ]
  },
  {
      element: "hr", // A line to separate the short version from the long version
      style: { margin: "20px 0", border: "1px solid #ccc" }
  },
  {
    element: "h1",
    textContent: "Legal, Safety & Terms",
    style: { fontSize: "2.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "span",
    textContent: "The boring stuff we have to say so the site doesn't get taken down.",
    children: [],
  },
  {
    element: "p",
    textContent:
      "By using Random Rants +, you agree to these terms. If you don't agree, you can't hang out here.",
    style: { fontSize: "1.1em", marginBottom: "1em", fontWeight: "bold" },
    children: [],
  },

  // Age Restriction (Critical for COPPA)
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

  // Disclaimer of Liability
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

  // Forbidden Content (Yellow Box for visibility)
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
            textContent: "Copyright infringement (Don't upload pirated movies).",
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
            textContent: "Doxxing (Sharing other people's real-life private info).",
            children: [],
          },
        ],
      },
      {
        element: "p",
        textContent:
          "Users with Ownership have the right to ban you if you break these rules. We reserve the right to remove any content that threatens the safety of the site.",
        style: { fontSize: "1em", marginTop: "1em" },
        children: [],
      },
    ],
  },

  // Privacy Policy
  {
    element: "h2",
    textContent: "4. Privacy Policy",
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
        textContent:
          "Your Username & Display Name (To show who you are).",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Your IP Address (Automatically collected for connection and security purposes).",
        children: [],
      },
      { element: "br" },
      {
        element: "li",
        textContent:
          "Uploaded Files (Stored temporarily or permanently depending on room settings).",
        children: [],
      },
    ],
  },
  {
    element: "p",
    textContent:
      "We do not sell your personal data to third parties.",
    style: { fontSize: "1em", marginBottom: "0.5em" },
    children: [],
  },

  // Hosting Provider
  {
    element: "h2",
    textContent: "5. Hosting & Third Parties",
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
            textContent: "You can read their policy "
        },
        {
            element: "a",
            href: "https://render.com/acceptable-use-policy",
            textContent: "here",
            target: "_blank",
            style: { color: "var(--link-color, blue)", textDecoration: "underline" }
        },
        {
            element: "span",
            textContent: "."
        }
    ],
  },

    // Contact / DMCA
    {
        element: "h2",
        textContent: "6. DMCA & Contact",
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