const { createSocialDivJSON } = require("./object-generator.js");

const HUE_SAT = ["0deg", "50%"];

const PROFILE_PICTURE = "images/creators/mop3000.png";
const USERNAME = "MOP 3000";
const ALT_NAME = "Username in Scratch: Im_CatmanYT"; //MOP3000 doesn't prefer using real name so use scratch name.

const DESCRIPTION = [
  "I met him in real life, and he’s the original spark behind Random Rants. He’s the one who first pitched the idea for the platform.",
  "He acts as our Lead Creative Director, coming up with most of the site's unique features and 'goofy' admin commands.",
  "When he’s not brainstorming new ideas for the chat, he’s a dedicated 2D animator with over 200 projects on Scratch.",
  "He handles our QA and testing—if the mobile version is acting up or a command needs balancing, he’s usually the first to spot it.",
  "From 'Cheese Storms' to 'Australian Mode,' he’s the mind behind the personality and fun that makes this project what it is."
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
