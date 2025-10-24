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

  let fullURL = urlOrDomain;

  const protocolSeparatorIndex = fullURL.indexOf("://");
  let hasExplicitProtocol = false;

  if (protocolSeparatorIndex > 0) {
    const protocolPart = fullURL
      .substring(0, protocolSeparatorIndex)
      .toLowerCase();

    if (protocolPart.indexOf("/") === -1 && protocolPart.indexOf(" ") === -1) {
      hasExplicitProtocol = true;
    }
  }

  if (!hasExplicitProtocol) {
    fullURL = "https://" + fullURL;
  }

  try {
    const urlObject = new URL(fullURL);
    const protocol = urlObject.protocol.toLowerCase();

    const safeProtocols = ["http:", "https:", "mailto:"];

    if (safeProtocols.includes(protocol)) {
      return !!urlObject.hostname;
    }

    const dangerousProtocols = ["javascript:", "data:", "vbscript:", "file:"];
    if (dangerousProtocols.includes(protocol)) {
      return false;
    }

    return false;
  } catch (e) {
    return false;
  }
}

function getMessageHTML(inputstr, noBracketCode, otherBracketCodes = {}) {
  //This is pretty much the one from the original random rants, here because i don't feel like having to rewrite the whole thing.
  var input_str; //store input
  var text_input; //store input after beging trim()med
  var output_html = ""; //store output
  var counter;

  var linkfixes = inputstr.split(" ");
  var newinputstr = [];
  for (var word of linkfixes) {
    if (
      word.startsWith("data:") ||
      word.startsWith("http://") ||
      word.startsWith("https://") ||
      word.startsWith("file://") ||
      word.startsWith("ws://") ||
      word.startsWith("wss://") ||
      word.startsWith("www.")
    ) {
      if (word.startsWith("www.")) {
        newinputstr.push(`[link url=https://${word}]${word}[/link]`);
      } else {
        if (word.startsWith("data:")) {
          newinputstr.push(`[download url=${word}]Data: URL[/download]`);
        } else {
          newinputstr.push(`[link url=${word}]${word}[/link]`);
        }
      }
    } else {
      newinputstr.push(word);
    }
  }

  input_str = newinputstr.join(" "); //get input and store it in input_str
  text_input = input_str;

  var endText = "";
  var colorsText = false;
  var colorCount = 0;
  var colors = [
    "#ff0000",
    "#ff6600",
    "#ffb300",
    "#ffe600",
    "#d9ff00",
    "#9dff00",
    "#55ff00",
    "#0dff00",
    "#00ff40",
    "#00ff88",
    "#00ffcc",
    "#00eeff",
    "#00aaff",
    "#0066ff",
    "#0026ff",
    "#3700ff",
    "#8800ff",
    "#dd00ff",
    "#ff00e1",
    "#ff00a6",
    "#ff006a",
    "#ff0033",
    "#ff0000",
  ];
  if (text_input.length > 0) {
    output_html += ""; //begin by creating paragraph
    for (counter = 0; counter < text_input.length; counter++) {
      switch (text_input[counter]) {
        case "\n":
          if (text_input[counter + 1] === "\n") {
            output_html += "\n";
            counter++;
          } else output_html += "";
          break;

        case "[":
          var index = 0;
          var data = text_input.slice(counter, text_input.length);
          var type = "";
          var valname = "";
          var value = "";
          var counterOffset = 0;
          var valid = false;
          var addHTML = true;
          var nextCheck = true;
          index += 1;
          counterOffset += 1;
          while (index < data.length && data[index] !== " ") {
            if (index == data.length) {
              addHTML = false;
              nextCheck = false;
              break;
            }
            if (data[index] == "]") {
              nextCheck = false;
              break;
            }
            counterOffset += 1;
            type += data[index];
            index += 1;
          }
          if (nextCheck) {
            counterOffset += 1;
            index += 1;
            while (index < data.length && data[index] !== "=") {
              if (index == data.length) {
                addHTML = false;
                nextCheck = false;
                break;
              }
              if (data[index] == "]") {
                nextCheck = false;
                break;
              }
              counterOffset += 1;
              valname += data[index];
              index += 1;
            }
            if (nextCheck) {
              counterOffset += 1;
              index += 1;
              while (index < data.length && data[index] !== "]") {
                if (index == data.length) {
                  addHTML = false;
                  nextCheck = false;
                  break;
                }
                counterOffset += 1;
                value += data[index];
                index += 1;
              }
            }
          }

          if (addHTML) {
            if (!noBracketCode) {
              if (otherBracketCodes[type]) {
                valid = true;
                output_html += otherBracketCodes(type, valname, value);
              }
              if (type == "search") {
                valid = true;
                output_html += `<a href="https://google.com/search?q=${encodeURIComponent(
                  value
                )}" style="color: var(--link-text-color);" target="_blank">Google Search "${value}"</a>`;
              }
              if (type == "emoji") {
                if (isSafeURLOrDomain(value)) {
                  valid = true;
                  output_html += `<img src="${value}" imageisemoji="true" ondragstart="return false;" style="image-rendering:pixelated;object-fit:contain;height:40px;" ondragend="return false;">`;
                }
              }
              if (type == "image") {
                if (isSafeURLOrDomain(value)) {
                  valid = true;
                  output_html += `<img src="${value}" style="image-rendering:pixelated;">`;
                }
              }
              if (type == "audio") {
                if (isSafeURLOrDomain(value)) {
                  valid = true;
                  output_html += `<audio src="${value}" controls></audio>`;
                }
              }
              if (type == "video") {
                if (isSafeURLOrDomain(value)) {
                  valid = true;
                  output_html += `<video src="${value.trim()}" controls></video>`;
                }
              }
              if (type == "bold") {
                valid = true;
                output_html += `<b>`;
                endText += "</b>";
              }
              if (type == "/bold") {
                valid = true;
                output_html += `</b>`;
              }
              if (type == "color") {
                valid = true;
                output_html += `<span style="color:${value.trim()};">`;
              }
              if (type == "/color") {
                valid = true;
                output_html += `</span>`;
              }
              if (type == "font") {
                valid = true;
                output_html += `<span style="font-family:${value.trim()};">`;
              }
              if (type == "/font") {
                valid = true;
                output_html += `</span>`;
              }
              if (type == "link") {
                if (isSafeURLOrDomain(value)) {
                  valid = true;
                  output_html += `<a href="${value.trim()}" style="color: var(--link-text-color);" target="_blank">`;
                }
              }
              if (type == "/link") {
                valid = true;
                output_html += `</a>`;
              }
              if (type == "button") {
                if (isSafeURLOrDomain(value)) {
                  valid = true;
                  output_html += `<a href="${value.trim()}" style="color: var(--link-text-color);" target="_blank">`;
                }
              }
              if (type == "/button") {
                valid = true;
                output_html += `</a>`;
              }
              if (type == "skull") {
                valid = true;
                output_html += "💀";
              }
              if (type == "sus" || type == "eyebrow") {
                valid = true;
                output_html += "🤨";
              }
              if (type == "br") {
                valid = true;
                output_html += "<br>";
              }
              if (type == "nerd") {
                valid = true;
                output_html += "🤓";
              }
              if (type == "moai") {
                valid = true;
                output_html += "🗿";
              }
              if (type == "cat") {
                valid = true;
                output_html += "😺";
              }
              if (type == "cool" || type == "sunglasses") {
                valid = true;
                output_html += "😎";
              }

              if (type == "blur") {
                valid = true;
                output_html += `<span style="filter: blur(5px);cursor:pointer;" onclick="this.style.filter = '';this.style.cursor = '';">`;
              }
              if (type == "/blur") {
                valid = true;
                output_html += `</span>`;
              }

              if (type == "colors") {
                valid = true;
                colorsText = true;
                output_html += `<span>`;
              }
              if (type == "/colors") {
                valid = true;
                colorsText = false;
                output_html += `</span>`;
              }
              if (type == "year") {
                valid = true;
                colorsText = false;
                output_html += new Date().getFullYear();
              }
              if (type == "i") {
                valid = true;
                output_html += `<i>`;
              }
              if (type == "/i") {
                valid = true;
                output_html += `</i>`;
              }
            }

            if (valid) {
              counter += counterOffset;
              //window.alert(`DEBUG: type:${type} value name:${valname} value:${value}`);
              type = type.toLowerCase();
            } else {
              if (colorsText) {
                colorCount += 1;
                if (colorCount >= colors.length - 1) {
                  colorCount = 0;
                }
                output_html += `<span style="color:${colors[colorCount]};">${text_input[counter]}</span>`;
              } else {
                output_html += text_input[counter];
              }
            }
          }
          break;

        case " ":
          output_html += "&nbsp;";
          break;

        case "\t":
          if (text_input[counter - 1] != "\t") output_html += " ";
          break;

        case "&":
          output_html += "&amp;";
          break;

        case '"':
          output_html += "&quot;";
          break;

        case ">":
          output_html += "&gt;";
          break;
        case "<":
          output_html += "&lt;";
          break;
        default:
          if (colorsText) {
            colorCount += 1;
            if (colorCount >= colors.length - 1) {
              colorCount = 0;
            }
            output_html += `<span style="color:${colors[colorCount]};">${text_input[counter]}</span>`;
          } else {
            output_html += text_input[counter];
          }
      }
    }
    output_html += ""; //finally close paragraph
  }
  output_html += endText;
  return output_html; // display output html
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

function getBracketCodeJSON(inputText = "", triggerBracketCodes = {}) {
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

        if (name == "dance" && !exists) {
          exists = true;

          var newElm = run(true, "/dance");
          newElm.className = "danceBracket";
          elm.children.push(newElm);
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
                width: "40px",
                height: "40px",
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

module.exports = {
  getSafeHTML,
  getMessageHTML,
  bracketCodeRemoval,
  getBracketCodeJSON,
};
