document.title = "Random Rants + | History";

require("../cookiewarning");
require("./stylesheet.js");
require("../sw.js");

var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");
require("./navigate-loader.js");

var randomRantsHistory = [
  // History
  {
    element: "h2",
    textContent: "The Evolution: From Prototype to Plus",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    children: [
      { element: "strong", textContent: "Random Rants", children: [] },
      {
        element: "span",
        textContent: " started as a basic experimental chat application.",
      },
    ],
    style: { fontSize: "1.1em", marginBottom: "0.5em" },
  },
  {
    element: "p",
    children: [
      {
        element: "em",
        textContent: "(Note: The legacy Glitch site has been decommissioned.)",
      },
    ],
    style: { fontSize: "1em", marginBottom: "0.3em" },
  },
  {
    element: "p",
    textContent:
      "I met a fellow developer on Scratch. We bonded over coding projects, and I showed him an early prototype I called Macre's Chat.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "That person was Im_CatmanYT. He started testing the site with his group and eventually challenged me to build a more robust version with better features.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "He provided a roadmap of features. I spent my spare time at school perfecting the code, and slowly it evolved into the original Random Rants.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "The next year, the user base spiked significantly at my school before stabilizing. It was my first real experience with managing a high-traffic site.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Users started requesting audio triggers like [vineboom]. To optimize performance, I replaced chat-based triggers with a full synchronized soundboard that kept everyone's experience in sync without flooding the database.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      'When the site went viral locally, I had to deal with the usual "Discord moderator" jokes. People eventually realized I was actually building the platform from scratch, which was a pretty great feeling.',
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "With a bigger audience came new challenges. We saw a spike in low-quality content and spam, which wasn't the vibe we wanted for the community.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "We also realized the room system needed a privacy overhaul. In the old version, rooms were public by default, meaning anyone could join a session uninvited.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "To solve the privacy and security issues, I proposed a complete ground-up remake with private, unlisted rooms. We called it Random Rants +, and development officially shifted to this new architecture.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Once the new engine was stable, I added a migration notice to the old site to help users move over to the more secure Plus version.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "And that's the journey of how we moved from a simple chat app to a more secure, private digital space.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },

  // Shutdown
  {
    element: "h2",
    textContent: "Project Migration",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Both versions originally lived on Glitch. When they changed their hosting policy, the original apps went offline.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "I successfully migrated Random Rants + to Render. I chose not to bring back the original version because it relied on legacy code that didn't meet my current security standards.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Because the original site used experimental code from my earlier projects, it wasn't as robust as the current platform.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "However, the original source code is still on GitHub for anyone interested in the technical history or running a local instance.",
    style: { fontSize: "1.1em", marginBottom: "1.5em", fontStyle: "italic" },
    children: [],
  },
  {
    element: "p",
    textContent: "Technical Challenges & Security Improvements:",
    style: { fontSize: "1.1em", fontWeight: "bold", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "ul",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [
      {
        element: "li",
        textContent:
          "Public Access — Early versions lacked private room controls, allowing anyone to join any session.",
        children: [],
      },
      {
        element: "li",
        textContent:
          "Network Privacy — Previous builds had vulnerabilities that exposed user connection data. I've since moved to a secure, encrypted architecture.",
        children: [],
      },
      {
        element: "li",
        textContent:
          "Session Security — The old system auto-selected active rooms, which compromised user privacy. This is now fully controlled by the user.",
        children: [],
      },
      {
        element: "li",
        textContent:
          "Server Architecture — The original server was too basic, relying on 'Client-Side' logic which was easy to manipulate. Random Rants + uses a robust 'Server-Side' validation system to prevent unauthorized message injection and protect users.",
        children: [],
      },
    ],
  },

  {
    element: "h2",
    textContent: "Project Origins",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Gvbvdxx Chat was the real prototype. Random Rants was the first major iteration, but since I built it while still learning the ropes, many early design flaws carried over from one version to the next.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Legacy versions relied on a simple guest-entry system with no formal accounts. This was easy to use but lacked the robust identity verification and security features that Random Rants + has today.",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "The site became so popular that it even caught the attention of the network admins. They tried to restrict the old Glitch URL, but by then, the project had already evolved into a new, more secure architecture.",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [],
  },

  // Evolution History
  {
    element: "h2",
    textContent: "The Evolution of the Project",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants didn’t just pop out of nowhere. It’s the result of constant iteration and learning from previous builds. Here’s the development history:",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "ul",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Gvbvdxx Chat", children: [] },
          {
            element: "span",
            textContent:
              '- My first experiment. "Gvbvdxx" was my dev handle. This site taught me my first big lessons in security. After an unauthorized user exploited a vulnerability to disrupt the chat, I realized I needed to stop using innerHTML and switch to textContent to prevent script injection. This pushed me to become a much better programmer.',
            children: [],
          },
        ],
      },
      { element: "br" },
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Macre's chat", children: [] },
          {
            element: "span",
            textContent:
              "- An educational version created to help a peer learn JavaScript. It was a fork of Gvbvdxx Chat with a recolored UI and new notification sounds, though it still shared the same early-stage architecture.",
            children: [],
          },
        ],
      },
      { element: "br" },
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Random Rants", children: [] },
          {
            element: "span",
            textContent:
              "- The first version to go wide. I implemented a secure message parser to fix data entry vulnerabilities. This version introduced the synchronized soundboard and moved to WebRTC for high-performance voice and video sharing, which is far more efficient than traditional image-based streaming.",
            children: [],
          },
        ],
      },
      { element: "br" },
      {
        element: "li",
        children: [
          { element: "strong", textContent: "Random Rants +", children: [] },
          {
            element: "span",
            textContent:
              "- The ultimate solution to previous security flaws. This is a ground-up rewrite that doesn't rely on legacy code. It includes optimized features and 'Legacy Commands' as a throwback to the original versions. It's built to be faster, cleaner, and much more secure.",
            children: [],
          },
        ],
      },
    ],
  },
  {
    element: "p",
    textContent:
      "As you can see, Gvbvdxx Chat was the root of the chat sites, Random Rants + could basically be called Gvbvdxx Chat 2 (cause yes, Gvbvdxx Chat is also by me).",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [],
  },
];

var elementJSON = [
  {
    element: "div",
    className: "aboutDivCenter",
    children: randomRantsHistory,
  },
];

var pageElements = elements.createElementsFromJSON(elementJSON);
elements.appendElements(elements.body, pageElements);
