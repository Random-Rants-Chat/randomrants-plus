document.title = "Random Rants + | History";

require("../cookiewarning");
require("./stylesheet.js");
var menuBar = require("../menu.js");
var elements = require("../gp2/elements.js");
var accountHelper = require("../accounthelper/index.js");
var dialog = require("../dialogs.js");
require("./navigate-loader.js");

var randomRantsHistory = [
  // History
  {
    element: "h2",
    textContent: "The story of Random Rants, before glitch shut down",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    children: [
      { element: "strong", textContent: "Random Rants", children: [] },
      {
        element: "span",
        textContent: " started as a janky unsecure chat app.",
      },
    ],
    style: { fontSize: "1.1em", marginBottom: "0.5em" },
  },
  {
    element: "p",
    children: [
      {
        element: "em",
        textContent: "(RIP - The old site is gone now, quite sad)",
      },
    ],
    style: { fontSize: "1em", marginBottom: "0.3em" },
  },
  {
    element: "p",
    textContent:
      'I met a person in middle school (during 7th grade), in my elective class. Saw him using scratch, and I was like "yeah I use it too," and then switched topics and showed him an site called Macre\'s Chat.',
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      'That person was Im_CatmanYT (That\'s his name on scratch), so he started to use the chat site with his friends, and soon enough he said "yo, make me a site thats like this but better".',
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "He gave me a google doc with a list of things to do. I did those during class, (Sorry & Not-Sorry teachers) and slowly it became what he called Random Rants.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "The next grade (8th), is when it became truly popular around my school, but it was more like a spike - it went up, then dropped back down very quickly to barely nobody.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "People started to ask for more sound triggers, these were done by using things like [vineboom] in chat. Later I added an whole soundboard, everyone could trigger the sounds on everyones chromebook at once in sync, without posting chat messages flodded with [vineboom].",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      'The time it got popular is when I started so share it with the "Cool kids", usually they called me a "Discord moderator", but then were shut up about that stuff when they learned I\'m the "Coolest computer site programmer".',
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Also the popular spike happened again sometime again during 8th grade, but this time it was different, instead of enjoyment, it was a big spam of people being rude other people, not expected.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "But later, Im_CatmanYT said that people were joining their room in Random Rants. The rooms in Random Rants were fully public. If someone joined a room, anyone else hopping on the site would automatically select that room. You could change it, but you can't turn it off.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      'To fix this problem, I suggested "why don\'t we completley remake the site, more secure, and unlisted rooms" and called it Random Rants +, Im_CatmanYT agreed, and slowly the development shifted from Random Rants, to Random Rants +.',
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      'When the site was somewhat usable, I added a message dialog on Random Rants pretty much like "yo, try Ranodm Rants +", so it was quite a supprise to Im_CatmanYT.',
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "So thats how Random Rants, and Random Rants + was floating around school.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },

  // Shutdown
  {
    element: "h2",
    textContent: "Why Random Rants went down",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Both sites lived on Glitch. When Glitch pulled the plug on app hosting, it all went down.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "I put Random Rants + back on Render, but why I left Random Rants behind is because it has lack of Security.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Since Random Rants has reused code from unsecure chat sites I made when I was younger and inexperienced, it was less secure.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants is not forever gone, you can download the source code from GitHub and run it yourself. (if you're brave enough)",
    style: { fontSize: "1.1em", marginBottom: "1.5em", fontStyle: "italic" },
    children: [],
  },
  {
    element: "p",
    textContent: "Problems included with Random Rants:",
    style: { fontSize: "1.1em", fontWeight: "bold", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "ul",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [
      {
        element: "li",
        textContent: "All rooms were public - People could just jump in",
        children: [],
      },
      {
        element: "li",
        textContent:
          "IP grabbing is too easy - Hackers and normal programmers could just inject code to send your IP to them.",
        children: [],
      },
      {
        element: "li",
        textContent:
          "The site kept selecting rooms with people in them - There was barely any privacy, someone could be watching silently.",
        children: [],
      },
      {
        element: "li",
        textContent:
          "The server's code was way too simple - The computers did all the work, not the server. The server was only responsible for taking a message sent into it, and then broadcasting it to everyone. This means it was a perfect target for hackers, since they could send messages and manipulate people connected to the site.",
        children: [],
      },
    ],
  },

  {
    element: "h2",
    textContent: "What has came before Random Rants",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Gvbvdxx Chat was the real origin, Random Rants was the most edited version of it. Gvbvdxx Chat was made when I was inexperienced, and most those problems carried over from one to another.",
    style: { fontSize: "1.1em", marginBottom: "1em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants and the other chatting sites before it had no accounts. Type a username, even if someone in the room had it, and you were in.",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "My school even tried to block Random Rants because of the chaos it was unleashing in school, but they have only done it to the old Glitch URL, which doesn't even matter anymore since it was already going away.",
    style: { fontSize: "1.1em", marginBottom: "1.5em" },
    children: [],
  },

  // Evolution History
  {
    element: "h2",
    textContent: "How it all went",
    style: { fontSize: "1.8em", marginTop: "1.2em", marginBottom: "0.5em" },
    children: [],
  },
  {
    element: "p",
    textContent:
      "Random Rants didn’t just pop out of nowhere. It’s the result of a messy chain of chat apps, each one built on top of spaghetti code from the last. Here’s the glow-up history:",
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
              ' - A site I made to "show off" my JavaScript programming skills on Scratch. The word "gvbvdxx" was kid me smashing the keyboard for my username on Scratch, and that random word just stuck with me ever since. It was used a lot to get me talking to other Scratchers, just basically people on scratch, but eventually Scratch Moderation caught up and banned me. This site was the first few bans I recieved on scratch for. Later things improved, but then antoher site I made caused my scratch account to ban, then dissapear forever. A hacker somewhat inspired me to make admin commands (the hacker hacked in his own commands, then I added offical ones to the site) and quite scared me into making my future sites more locked down and secure. That hacker hopped in as "user123", completley unknown person, swearing and posting stuff not allowed on scratch, and leaking everyones IPs. It had a bug which allowed execution of code by typing in HTML, I always used innerHTML to insert text via code, but later I learned textContent is safer.',
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
              ' - This was an attempt to teach one of the Scratchers I met (we actually talked through a site called Kosmi) how to program JavaScript, but then I gave up and did most of it for him, this was a cloned version of Gvbvdxx Chat, with more admin commands, different UI and notifcation sounds, and a recolored UI. It still had all of the security problems, but the hacker that hacked Gvbvdxx Chat was "gone".',
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
              " - Im_CatmanYT suggested this site in person to me. The real first chat app, stil had most of Gvbvdxx Chat's problems, but one of them was fixed, I put a special & secure message parser code, that fixes a huge code injection problem, but admin commands were added to run code later on, at that point I didn't really care much because the hacker that hacked the first chat site I made was pretty much gone. This app was popular around my school, and also had sound triggers like [vineboom] which you can trigger in chat, but then people asked for more sounds, and then the real true soundboard was added. It also had full on voice & video chat, and screensharing was way better because it used WebRTC (used best for sending video and audio streams in web browsers), rather than rapidly sending blurry and compressed images.",
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
              " - I talked to Im_CatmanYT about the old site and its security problems, and this was my solution. This is the true remake, and your on it right now! It doesn't rely on the old Gvbvdxx Chat code, rather is a complete rewrite, some things have been added, like safe commands from Gvbvdxx Chat, Macre's Chat, and Random Rants, for throwback purposes. You can see more info in the about page. I'm not listing all the cool stuff here, as its listed there.",
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
