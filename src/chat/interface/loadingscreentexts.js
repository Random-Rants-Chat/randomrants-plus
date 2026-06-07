var randomTexts = require("../../randomquotes.txt");
var randomTextsArray =
  (""+randomTexts)
  .trim()
  .split("\n")
  .map((i) => i.trim())
  .filter((i) => i.length !== 0);

module.exports = randomTextsArray;
