function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}
var randomTexts = require("../../randomquotes.txt");
var randomTextsArray = (""+randomTexts).trim().split("\n");
console.log(randomTextsArray);
module.exports = function () {
  return returnRandomValueFromArray(randomTextsArray).trim();
};
