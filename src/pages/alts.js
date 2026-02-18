async function getTunnels() {
  try {
    var response = await fetch("/tunnels.json");
    var data = await response.json();
    return data;
  } catch (e) {
    window.alert("Unable to parse or load external/other.json: " + e);
    console.error(e);
    return "";
  }
}

document.title = "Random Rants + | Alternative Links";

require("../cookiewarning");
require("./stylesheet.js");
require("../sw.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");
require("./navigate-loader.js");

async function showAltLinks(containerDiv) {
  try {
    elements.setInnerJSON(containerDiv, [
      {
        element: "div",
        textContent: "Loading...",
      },
    ]);
	var tunnels = await getTunnels();
    elements.setInnerJSON(
      containerDiv,
      tunnels.map((tunnel) => {
		  return {
			  element: "div",
			  children: [
				  {
					element: "a",
					textContent: tunnel.url,
					href: tunnel.url,
					target: "_blank",
					  style: {
						  fontSize: "20px",
						  fontWeight: "bold"
					  }
				  },
				  {
					  element: "br"
				  },
				  {
					  element: "br"
				  }
				]
		  };
	  })
    );
  } catch (e) {
    dialog.alert("Unable to load updates: " + e);
    console.error(e);
  }
}

var randomRantsUpdates = [
  {
    element: "h2",
    textContent: "Alternative links",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Alternative links to satisfy your ranting needs",
  },
  {
    element: "p",
    textContent:
      "These links expire in 60 minutes, if they break then get new links, refresh to get the latest working ones.",
  },
  {
    element: "div",
    className: "button2",
    textContent: "Refresh",
    eventListeners: [
      {
        event: "click",
        func: () => showAltLinks(elements.getGPId("containerDiv")),
      },
    ],
  },
  {
    element: "div",
    GPWhenCreated: showAltLinks,
	gid: "containerDiv"
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
