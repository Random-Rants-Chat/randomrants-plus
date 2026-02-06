const { createSocialDivJSON } = require("./object-generator.js");

const HUE_SAT = ["43deg", "70%"];

const PROFILE_PICTURE = "images/creators/gvbvdxx.svg";
const USERNAME = "Gvbvdxx";
const ALT_NAME = "Jason Glen Evans";

const DESCRIPTION = [
  "Thats me! The one that used to be on the Scratch community, sadly banned from it after creating a lot of chat sites.",
  "Obsessed with code, computers, and programming! Sacrificed education, homework, and classwork to make this site.",
  "Started out making Scratch projects, learned javascript, then I created a bunch of websites, this is one of them.",
  "Responsible for almost everything here, ChatGPT & Google Gemini helped with some programming, but I did most of the programming work.",
  "Sadly grounded (until I decide to actually do work), so I use a school Chromebook to develop sites with online devboxes and IDEs.",
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
