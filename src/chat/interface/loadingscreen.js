var elements = require("../../gp2/elements.js");
var currentRoom = require("./getroom.js");
var accountHelper = require("../../accounthelper");

var rrLoadingScreenText = elements.getGPId("rrLoadingScreenText"); //Gets the loading screen text element.
var randomFactSpan = elements.getGPId("randomFactSpan");

var loadingScreenTextScroll = require("./loadingscreentexts.js");

function returnRandomValueFromArray(array) {
  return array[Math.round(Math.random() * (array.length - 1))];
}

function loopAnimation() {
  var anim = rrLoadingScreenText.animate(
    [{ opacity: "1" }, { opacity: "0", transform: "translateY(-10px)" }],
    {
      duration: 350,
      iterations: 1,
      easing: "ease-out",
    },
  );

  anim.addEventListener("finish", () => {
    rrLoadingScreenText.textContent = returnRandomValueFromArray(
      loadingScreenTextScroll,
    );
    var anim2 = rrLoadingScreenText.animate(
      [{ opacity: "0", transform: "translateY(10px)" }, { opacity: "1" }],
      {
        duration: 350,
        iterations: 1,
        easing: "ease-out",
      },
    );

    anim2.addEventListener("finish", () => {
      setTimeout(loopAnimation, 2500);
    });
  });
}

loopAnimation();
