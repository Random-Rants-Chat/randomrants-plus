require("../cookiewarning");
require("./stylesheet.js");
require("./navigate-loader.js");

document.title = "Random Rants + | Credits";

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");

// Refined helper function
function generateLicenseElement(license) {
  // 1. Prepare children array safely
  var licenseChildren = [
    {
      element: "strong",
      textContent: `${license.name || "Unknown Package"} (v${license.version || "?"})`,
    },
    { element: "br" },
  ];

  // 2. Only add Author if it exists
  if (license.author) {
    licenseChildren.push({
      element: "span",
      textContent: `By ${license.author}`,
    });
    licenseChildren.push({ element: "br" });
  }

  // 3. Only add Source if it exists
  if (license.source) {
    var sourceChild;
    // Check if it's a URL or just text
    if (license.source.startsWith("http")) {
      sourceChild = {
        element: "a",
        href: license.source,
        target: "_blank",
        textContent: "Source Code Repository",
        style: { color: "#4dabf7", textDecoration: "underline" }, // Make link distinct
      };
    } else {
      sourceChild = {
        element: "span",
        textContent: "Source: " + license.source,
      };
    }
    licenseChildren.push(sourceChild);
    licenseChildren.push({ element: "br" });
  }

  // 4. Add License Type and Text
  licenseChildren.push(
    {
      element: "span",
      textContent: `License: ${license.license || "Unknown"}`,
    },
    {
      element: "div", // Use div for text block to separate it
      textContent: license.licenseText || "No license text provided.",
      style: {
        marginTop: "5px",
        fontSize: "0.8em",
        opacity: "0.8",
        borderLeft: "2px solid #555",
        paddingLeft: "10px",
      },
    },
    { element: "hr", style: { opacity: "0.2", margin: "10px 0" } }, // Separator line
  );

  return {
    element: "div",
    style: { marginBottom: "15px" },
    children: licenseChildren,
  };
}

var contentArray = [
  // Title and intro
  require("./sitenews-notice.js"),
  {
    element: "h1",
    textContent: "Random Rants + Credits",
    style: { fontSize: "2.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "span",
    textContent: "Dig into the stuff that was used to make Random Rants +.",
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants + wouldn't be possible without these open-source projects:",
    style: { marginBottom: "10px" },
    children: [],
  },

  // Tech Stack List
  {
    element: "div",
    style: {
      backgroundColor: "rgba(0, 0, 0, 0.3)", // Semi-transparent is safer for themes
      border: "1px solid rgba(255, 255, 255, 0.1)",
      color: "#ffffff",
      padding: "15px",
      borderRadius: "8px",
      fontSize: "0.9em",
      fontFamily: "monospace",
      marginBottom: "30px",
    },
    children: [
      {
        element: "ul",
        style: { margin: "0", paddingLeft: "20px" },
        children: [
          {
            element: "li",
            children: [
              { element: "strong", textContent: "Node.js & HTTP Module: " },
              { element: "span", textContent: "Backend server logic." },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "Webpack: " },
              {
                element: "span",
                textContent: "Bundling our chaotic code for the UI.",
              },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "Socket.io / Websockets: " },
              {
                element: "span",
                textContent: "Real-time communication (Chat).",
              },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "Simple-Peer / WebRTC: " },
              { element: "span", textContent: "P2P Video and Screen Sharing." },
            ],
          },
          {
            element: "li",
            children: [
              { element: "strong", textContent: "GvbvdxxMod2: " },
              {
                element: "span",
                textContent:
                  "My modified version of TurboWarp for the mini-games.",
              },
            ],
          },
        ],
      },
    ],
  },

  // Automated License List
  {
    element: "h2",
    textContent: "Open Source Licenses",
    style: { fontSize: "1.5em", marginBottom: "10px" },
    children: [],
  },
  {
    element: "div",
    style: {
      backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent
      border: "1px solid rgba(255, 255, 255, 0.1)",
      padding: "15px",
      borderRadius: "8px",
      fontSize: "0.9em",
      fontFamily: "monospace",
      maxHeight: "500px", // Scrollable so the page isn't 10 miles long
      overflowY: "auto",
      color: "#ffffff",
    },
    children: [
      {
        element: "div",
        GPWhenCreated: async function (elm) {
          elements.setInnerJSON(elm, [
            {
              element: "span",
              textContent: "Loading license data...",
              style: { fontStyle: "italic", opacity: "0.7" },
            },
          ]);

          try {
            var response = await fetch("/licenses.json");
            if (!response.ok) {
              throw new Error("HTTP " + response.status);
            }
            var json = await response.json();

            // Sort them alphabetically by name because it looks nicer
            json.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

            var arrayContent = json.map(generateLicenseElement);
            elements.setInnerJSON(elm, arrayContent);
          } catch (e) {
            console.error(e);
            elements.setInnerJSON(elm, [
              {
                element: "div",
                style: {
                  color: "#ff6b6b", // Red error color
                  fontWeight: "bold",
                },
                children: [
                  {
                    element: "span",
                    textContent: "Error loading licenses file.",
                  },
                  { element: "br" },
                  { element: "span", textContent: "Details: " + e.message },
                ],
              },
            ]);
          }
        },
      },
    ],
  },
];

var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter",
    children: contentArray,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
