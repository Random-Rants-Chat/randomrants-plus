var elements = require("../../gp2/elements.js");
var accountHelper = require("../../accounthelper");
var getRandomDialog = require("./randomfact.js");

var randomFactSpan = elements.getGPId("randomFactSpan");
randomFactSpan.textContent = getRandomDialog();

(async function () {
  var validated = await accountHelper.checkSessionCookie();
  require("./chat.js");
})();