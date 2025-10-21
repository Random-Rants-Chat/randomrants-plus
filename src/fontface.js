var elements = require("./gp2/elements.js");
var fontList = require("./fontlist.js");

function getGHFileURL(username, repo, commitID, file) {
  return `https://cdn.jsdelivr.net/gh/${username}/${repo}@${commitID}/${file}`;
}

var repoURL = getGHFileURL(
  "Random-Rants-Chat",
  "randomrants-new-fonts",
  "4d837ee",
  "fonts/"
);

var pageElements = elements.createElementsFromJSON([
  {
    element: "style",
    textContent: fontList
      .map((font) => {
        return `@font-face {font-family: ${font.family};src: url(${repoURL + font.file});}`;
      })
      .join(" "),
  },
]);
elements.appendElements(elements.body, pageElements);

(async function () {
  //Just to appear faster, load every font.
  for (var font of fontList) {
    await fetch(repoURL + font.file);
    await (function () {
      return new Promise((r) => setTimeout(r, 50));
    })();
  }
})();
