async function getCommitURL() {
  var response = await fetch("/external/other.json");
  var data = await response.json();
  return data.commitsURL;
}

async function getCommits() {
  var response = await fetch(await getCommitURL());
  var data = await response.json();
  return data;
}

function formatSystemTime(dateInput) {
  // Ensure we have a Date object
  const date = new Date(dateInput);

  // Formatting options
  const options = {
    weekday: 'long', // "Wed"
    month: 'long',   // "Dec"
    day: 'numeric',   // "10"
    hour: 'numeric',  // "2" or "14" (based on system)
    minute: '2-digit' // "39"
    // hour12 is intentionally omitted to use system preference
  };

  return date.toLocaleString('default', options);
}

document.title = "Random Rants + | Updates";

require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");
require("./navigate-loader.js");

async function showCommits(containerDiv) {
  elements.setInnerJSON(containerDiv, [
    {
      element: "div",
      textContent: "Loading...",
    },
  ]);
  var commits = await getCommits();
  elements.setInnerJSON(
    containerDiv,
    commits.map((commitData) => {
      return {
        element: "div",
        children: [
          {
            element: "div",
            style: {
              padding: "10px 10px",
              background: "rgba(0,0,0,0.5)",
              color: "rgba(255,255,255,1)",
              margin: "5px",
              borderRadius: "10px",
            },
            children: [
              {
                element: "div",
                style: {
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px"
                },
                children: [
                  {
                    element: "a",
                    target: "_blank",
                    href: commitData.author.html_url,
                    className: "commitLink",
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "fit-content",
                      height: "fit-content",
                      padding: "5px 5px",
                    },
                    children: [
                      {
                        element: "img",
                        style: {
                            objectFit: "contain",
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%"
                        },
                        src: commitData.committer.avatar_url,
                      },
                      {
                          element: "span",
                          textContent: commitData.commit.committer.name,
                          style: {
                            fontWeight: "bold",
                            fontSize: "20px"
                          }
                      },
                    ]
                  },
                  {
                    element: "div",
                    style: {
                      marginRight: "auto"
                    }
                  },
                  {
                          element: "span",
                          textContent: "Commited on: "+formatSystemTime(new Date(commitData.commit.committer.date)),
                          style: {
                            fontSize: "10px"
                          }
                      },
                ],
              },
              {
                    element: "a",
                    textContent: commitData.commit.message,
                    target: "_blank",
                    href: commitData.html_url,
                    className: "commitLink"
                },
            ],
          },
        ],
      };
    }),
  );
}

var randomRantsUpdates = [
  {
    element: "h2",
    textContent: "Updates",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Spoiler alert: Updates happen monthly, but these are updated whenever we save the code online.",
  },
  {
    element: "p",
    textContent:
      "Get update information directly from GitHub, the update messages are probably very confusing. Sorted by latest at top and earliest at bottom.",
  },
  {
    element: "div",
    className: "button2",
    textContent: "Refresh",
    eventListeners: [
      {
        event: "click",
        func: () => window.location.reload(),
      },
    ],
  },
  {
    element: "div",
    GPWhenCreated: showCommits,
  },
];

var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter",
    children: randomRantsUpdates,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
