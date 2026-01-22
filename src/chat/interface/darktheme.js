var ClientSettings = require("./clientsettings.js");

var themeMain = document.body;
var darkThemeID = "DARK_THEME";

themeMain.setAttribute("data-theme", ClientSettings.getSetting(darkThemeID) ? "dark" : "none");

ClientSettings.addSettingChangeFunction(darkThemeID, (value) => {
	themeMain.setAttribute("data-theme", value ? "dark" : "none");
});