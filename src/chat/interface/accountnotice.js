var elements = require("../../gp2/elements.js");
var dialogs = require("../../dialogs.js");
var accountHelper = require("../../accounthelper");

var noAccountNoticeDialog = elements.getGPId("noAccountNoticeDialog");
var continueAsGuestButton = elements.getGPId("continueAsGuestButton");

if (!accountHelper.getCurrentValidationState()) {
  noAccountNoticeDialog.hidden = false;
}

continueAsGuestButton.addEventListener("click", () => {
  noAccountNoticeDialog.hidden = true;
});
