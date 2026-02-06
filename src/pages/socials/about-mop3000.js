const { createSocialDivJSON } = require("./object-generator.js");

const HUE_SAT = ["0deg", "50%"];

const PROFILE_PICTURE = "images/creators/mop3000.png";
const USERNAME = "MOP 3000";
const ALT_NAME = "Username in Scratch: Im_CatmanYT"; //MOP3000 doesn't prefer using real name so use scratch name.

const DESCRIPTION = [
  "I met him in real life. Came up with the idea of Random Rants.",
  "Is a 2D animator and obsessed with animation.",
];

const SOCIAL_LINKS = [
  {
    src: "images/social/scratch.svg",
    href: "https://scratch.mit.edu/users/Im_CatmanYT",
  },
  {
    src: "images/social/youtube.svg",
    href: "https://www.youtube.com/@mop-3000",
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
