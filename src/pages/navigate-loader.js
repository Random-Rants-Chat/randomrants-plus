var loader = require("./loadingscreen.js");

var isLoading = true;
var loadingScreen = loader.doLoadingScreen();

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", () => {
    if (isLoading) {
      isLoading = false;
      loadingScreen.remove();
    }
  });
});

navigation.addEventListener("navigate", (event) => {
  var destinationUrl = event.destination.url;
  var navigationType = event.navigationType;

  if (!isLoading) {
    isLoading = true;
    document.body.append(loadingScreen); //Now truly show it.
  }
});

navigation.addEventListener("navigatesuccess", (event) => {
  if (isLoading) {
    isLoading = false;
    loadingScreen.remove();
  }
});

navigation.addEventListener("navigateerror", (event) => {
  if (isLoading) {
    isLoading = false;
    loadingScreen.remove();
  }
});
