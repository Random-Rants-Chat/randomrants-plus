function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}
var randomTexts = require("../../randomdialog.txt");
module.exports = function () {
  return returnRandomValueFromArray(randomTexts.split("\n")).trim();
};
