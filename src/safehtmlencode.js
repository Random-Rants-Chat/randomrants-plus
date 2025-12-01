var dialogs = require("./dialogs.js");
var emojiURLs = require("./emoji-urls");

var cacheBuster = Math.round(Date.now());

function getSafeHTML(unsafeText) {
  var safeText = "";
  var i = 0;
  while (i < unsafeText.length) {
    switch (unsafeText[i]) {
      case "\n":
        safeText += "<br>";
        break;
      case " ":
        if (unsafeText[i + 1] == " ") {
          safeText += "&nbsp;";
        } else {
          safeText += " ";
        }
        break;
      case "\t":
        if (unsafeText[i - 1] != "\t") safeText += " ";
        break;
      case "&":
        safeText += "&amp;";
        break;
      case '"':
        safeText += "&quot;";
        break;
      case ">":
        safeText += "&gt;";
        break;
      case "<":
        safeText += "&lt;";
        break;
      default:
        safeText += unsafeText[i]; //Part of text seems safe to just put plain.
    }
    i += 1;
  }
  return safeText;
}

function isSafeURLOrDomain(urlOrDomain) {
  if (!urlOrDomain || typeof urlOrDomain !== "string") {
    return false;
  }

  const trimmed = urlOrDomain.trim();

  // Check for dangerous protocols early (case-insensitive)
  const dangerousProtocols = [
    "javascript:",
    "data:",
    "vbscript:",
    "file:",
    "blob:",
  ];
  const lowerURL = trimmed.toLowerCase();
  for (const dangerous of dangerousProtocols) {
    if (lowerURL.startsWith(dangerous)) {
      return false;
    }
  }

  // Allow relative paths (starting with / or ./)
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    // Reject if contains null bytes or suspicious patterns
    if (trimmed.includes("\0") || trimmed.includes("\\")) {
      return false;
    }
    return true;
  }

  // Handle URLs with explicit protocols
  const protocolSeparatorIndex = trimmed.indexOf("://");
  let fullURL = trimmed;
  let hasExplicitProtocol = false;

  if (protocolSeparatorIndex > 0) {
    const protocolPart = trimmed.substring(0, protocolSeparatorIndex).toLowerCase();

    // Verify protocol part doesn't contain invalid characters
    if (
      /^[a-z][a-z0-9+.-]*$/.test(protocolPart) &&
      protocolPart.indexOf("/") === -1 &&
      protocolPart.indexOf(" ") === -1
    ) {
      hasExplicitProtocol = true;
    }
  }

  // If no explicit protocol, assume https:// for domain-like URLs
  if (!hasExplicitProtocol) {
    // Check if it looks like a domain (contains . and no spaces/special chars)
    if (
      /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(
        trimmed
      )
    ) {
      fullURL = "https://" + trimmed;
    } else {
      // Not a valid domain and no protocol - reject
      return false;
    }
  }

  try {
    const urlObject = new URL(fullURL);
    const protocol = urlObject.protocol.toLowerCase();

    const safeProtocols = ["http:", "https:", "mailto:"];

    if (!safeProtocols.includes(protocol)) {
      return false;
    }

    // For mailto, just ensure it has content after the colon
    if (protocol === "mailto:") {
      return urlObject.pathname.length > 0;
    }

    // For http/https, ensure hostname exists and is valid
    if (!urlObject.hostname) {
      return false;
    }

    // Additional check: reject URLs with suspicious substrings
    if (
      fullURL.includes("\0") ||
      fullURL.includes("\\") ||
      fullURL.includes("<") ||
      fullURL.includes(">")
    ) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
}

function bracketCodeRemoval(text) {
  var i = 0;
  var removing = false;
  var newText = "";
  while (i < text.length) {
    if (text[i] == "[") {
      removing = true;
    } else {
      if (text[i] == "]") {
        removing = false;
      } else {
        if (!removing) {
          newText += text[i];
        }
      }
    }

    i += 1;
  }

  return newText;
}

var elements = require("./gp2/elements.js");

function getBracketCodeJSON(
  inputText = "",
  triggerBracketCodes = {},
  IMAGE_EMOJI_SIZE = 40,
) {
  var linkfixes = inputText.split(" ");
  var newinputstr = [];
  for (var word of linkfixes) {
    if (
      word.startsWith("http://") ||
      word.startsWith("https://") ||
      word.startsWith("www.")
    ) {
      if (word.startsWith("www.")) {
        newinputstr.push(`[link url=https://${word}]${word}[/link]`);
      } else {
        newinputstr.push(`[link url=${word}]${word}[/link]`);
      }
    } else {
      newinputstr.push(word);
    }
  }

  inputText = newinputstr.join(" ");

  var i = 0;

  function run(mode, endName) {
    var elm = {
      element: "span",
      children: [],
    };

    function addChar(char) {
      var lastChild = elm.children[elm.children.length - 1];
      if (lastChild) {
        lastChild.textContent += char;
      } else {
        elm.children.push({
          element: "span",
          textContent: char,
        });
      }
    }

    while (i < inputText.length) {
      var char = inputText[i];
      if (char == "[") {
        i += 1;
        var bracketInside = "";
        while (char !== "]") {
          if (i > inputText.length) {
            elm.children = [];
            elm.textContent = inputText;
            return elm;
          }
          var char = inputText[i];
          if (char !== "]") {
            bracketInside += char;
          }
          i += 1;
        }
        var splitSpaces = bracketInside.split(" ");
        var valueName = "";
        var value = "";
        if (splitSpaces[1]) {
          var v = splitSpaces[1].split("=");
          valueName = v[0];
          value = v.splice(1, v.length).join("=");
        }
        var name = splitSpaces[0].trim();
        //console.log(name);
        //console.log(valueName);
        //console.log(value);

        if (mode) {
          if (name == endName) {
            //console.log("close reached ",name);
            return elm;
          }
        }

        var exists = false;

        if (name == "bold" && !exists) {
          exists = true;

          var newElm = run(true, "/bold");
          newElm.style = {
            fontWeight: "bold",
          };
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }
        if (name == "italic" && !exists) {
          exists = true;

          var newElm = run(true, "/italic");
          newElm.style = {
            fontStyle: "italic",
          };
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }
        if (name == "large" && !exists) {
          exists = true;

          var newElm = run(true, "/large");
          newElm.style = {
            fontWeight: "bold",
            fontSize: "30px",
          };
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }
        if (name == "color" && !exists) {
          exists = true;

          var newElm = run(true, "/color");
          newElm.style = {
            color: value,
          };
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }
        if (name == "blur" && !exists) {
          exists = true;

          var newElm = run(true, "/blur");
          newElm.style = {
            filter: "blur(5px)",
            cursor: "pointer",
          };
          newElm.eventListeners = [
            {
              event: "click",
              func: function () {
                this.style.filter = "";
                this.style.cursor = "";
              },
            },
          ];
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }
        if (name == "font" && !exists) {
          exists = true;

          var newElm = run(true, "/font");
          newElm.style = {
            fontFamily: value,
          };
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "dancingemoji" && !exists) {
          exists = true;

          var url = value.trim();
          if (value.indexOf("@") > -1) {
            var split = value.trim().split("@");
            url = split[0];
            var urlReference = value.trim().split("@")[1];
            url = emojiURLs[urlReference] + url + "?v=" + cacheBuster;
          }
          if (isSafeURLOrDomain(url)) {
            elm.children.push({
              element: "span",
              className: "danceBracketContainer",
              children: [
                {
                  element: "img",
                  style: {
                    objectFit: "contain",
                    width: IMAGE_EMOJI_SIZE + "px",
                    height: IMAGE_EMOJI_SIZE + "px",
                  },
                  className: "danceBracket",
                  src: url,
                },
              ],
            });
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "link" && !exists) {
          exists = true;

          var newElm = run(true, "/link");
          newElm.element = "a";
          if (isSafeURLOrDomain(value.trim())) {
            newElm.href = value.trim();
          }
          newElm.target = "_blank";
          newElm.style = {
            color: "var(--link-text-color)",
          };
          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "button" && !exists) {
          exists = true;

          var newElm = run(true, "/button");
          newElm.element = "button";
          newElm.className = "roundborder";
          var url = "";
          if (isSafeURLOrDomain(value.trim())) {
            url = value.trim();
          }
          newElm.eventListeners = [
            {
              event: "click",
              func: function () {
                var a = document.createElement("a");
                a.href = url;
                a.target = "_blank";
                a.click();
              },
            },
          ];

          elm.children.push(newElm);
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "emoji" && !exists) {
          exists = true;
          var url = value.trim();
          if (value.indexOf("@") > -1) {
            var split = value.trim().split("@");
            url = split[0];
            var urlReference = value.trim().split("@")[1];
            url = emojiURLs[urlReference] + url + "?v=" + cacheBuster;
          }
          if (isSafeURLOrDomain(url)) {
            elm.children.push({
              element: "img",
              style: {
                objectFit: "contain",
                width: IMAGE_EMOJI_SIZE + "px",
                height: IMAGE_EMOJI_SIZE + "px",
              },
              src: url,
            });
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "image" && !exists) {
          exists = true;
          if (isSafeURLOrDomain(value.trim())) {
            elm.children.push({
              element: "img",
              src: value.trim(),
            });
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "video" && !exists) {
          exists = true;
          if (isSafeURLOrDomain(value.trim())) {
            elm.children.push({
              element: "video",
              controls: true,
              src: value.trim(),
            });
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "audio" && !exists) {
          exists = true;
          if (isSafeURLOrDomain(value.trim())) {
            elm.children.push({
              element: "video",
              controls: true,
              src: value.trim(),
            });
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "br" && !exists) {
          exists = true;
          elm.children.push({
            element: "br",
          });
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "year" && !exists) {
          exists = true;
          addChar(new Date().getFullYear());
        }
        for (var trigBracket of Object.keys(triggerBracketCodes)) {
          if (name == trigBracket.trim() && !exists) {
            exists = true;
            triggerBracketCodes[trigBracket.trim()]();
          }
        }
        if (!exists) {
          i -= 1;
          addChar("[");
          i -= bracketInside.length;
        }
      } else {
        addChar(char);
        i += 1;
      }
    }
    return elm;
  }
  var output = run(inputText);
  return output;
}

function getMessageHTML(inputstr, noBracketCode, otherBracketCodes = {}) {
  if (noBracketCode) {
    return getSafeHTML(inputstr);
  }
  var div = elements.createElementsFromJSON([getBracketCodeJSON(inputstr)])[0];
  var inner = div.innerHTML;
  div.remove();
  return inner;
}

module.exports = {
  getSafeHTML,
  getMessageHTML,
  bracketCodeRemoval,
  getBracketCodeJSON,
  isSafeURLOrDomain,
};
