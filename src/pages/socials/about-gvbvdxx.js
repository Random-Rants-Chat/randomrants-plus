/*
  Gvbvdxx's profile on Random Rants + about page
*/

const { createSocialDivJSON } = require("./object-generator.js");

const HUE_SAT = ["43deg", "70%"];

const PROFILE_PICTURE = "images/creators/gvbvdxx.svg";
const USERNAME = "Gvbvdxx";
const ALT_NAME = "Jason Glen Evans (he/him)";

const DESCRIPTION = [
  "That's me! Formerly a creator in the Scratch community, I eventually transitioned to independent web development to build more advanced, unconstrained platforms.",
  "I'm a self-taught programmer with a deep passion for computer science and full-stack engineering. This project is the result of countless hours of research and development.",
  "I started with block-based coding and moved into JavaScript and Node.js. Now, I focus on building real-time applications and exploring network protocols.",
  "I'm the lead developer for Random Rants +. While I use AI tools like Gemini to help optimize certain functions, the core architecture and logic are entirely my own work.",
  "Currently developing under hardware constraints—I use cloud-based IDEs and school Chromebooks to keep the project moving while I'm away from my main dev environment.",
];

const SOCIAL_LINKS = [
  {
    src: "images/social/youtube.svg",
    href: "https://youtube.com/@gvbvdxx",
  },
  {
    src: "images/social/itch-io.svg",
    href: "https://gvbvdxx.itch.io",
  },
  {
    src: "images/social/github.svg",
    href: "https://github.com/gvbvdxxalt2",
  },
  {
    src: "images/social/discord.svg",
    href: "http://discord.com/users/1160668172228247623",
  },
];

module.exports = createSocialDivJSON(
  HUE_SAT,
  PROFILE_PICTURE,
  USERNAME,
  ALT_NAME,
  SOCIAL_LINKS,
  DESCRIPTION,
);
