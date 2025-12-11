var elements = require("../../gp2/elements.js");
var AElement = require("../../gp2/aelement.js");
var { isSafeURLOrDomain } = require("../../safehtmlencode.js");
var emojiURLs = require("../../emoji-urls.js");

var imageViewer = require("./viewers/image.js");
var videoViewer = require("./viewers/video.js");
var audioViewer = require("./viewers/audio.js");

var cacheBuster = Date.now();

function generateBrowserThumbnail(videoFile, timeInSeconds = 2) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.src = videoFile;

    video.onloadeddata = () => {
      video.currentTime = timeInSeconds;
    };

    video.onseeked = () => {
      var canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      var ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL("image/webp", 0.5));
      video.src = "";
      video.remove();
    };

    video.onerror = (err) => {
      reject(new Error("Video loading error: " + err.message));
      video.src = "";
      video.remove();
    };
  });
}

var coolEmojiStuff = {
  skull: "💀",
  skullbones: "☠️",
  cry: "😭",
  fire: "🔥",
  santa: "🎅",
  lantern: "🎃",
  thumbsup: "👍",
  thumbsdown: "👎",
  game: "🎮",
  moai: "🗿",
  cap: "🧢",
  rolling: "🙄",
  grin: "😀",
  cat: "😺",
  lol: "🤣"
};

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

        if (coolEmojiStuff[name]) {
          exists = true;
          elm.children.push({
            element: "span",
            textContent: coolEmojiStuff[name],
          });
        }

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
                pointerEvents: "none",
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
            (function (value) {
              elm.children.push({
                element: "button",
                className: "roundborder",
                style: {
                  padding: "4px 4px",
                  textAlign: "center",
                  fontSize: "10px",
                },
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      imageViewer.showImage(value);
                    },
                  },
                ],
                children: [
                  {
                    element: "img",
                    src: value.trim(),
                    style: {
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      pointerEvents: "none",
                    },
                  },
                  {
                    element: "br",
                  },
                  {
                    element: "b",
                    textContent: "Image",
                  },
                ],
              });
            })(value);
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "video" && !exists) {
          exists = true;
          if (isSafeURLOrDomain(value.trim())) {
            (function (value) {
              elm.children.push({
                element: "button",
                className: "roundborder",
                style: {
                  padding: "4px 4px",
                  textAlign: "center",
                  fontSize: "10px",
                },
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      videoViewer.showVideo(value);
                    },
                  },
                ],
                children: [
                  {
                    element: "img",
                    GPWhenCreated: async function (elm) {
                      elm.src = "images/video-file.svg";
                      try {
                        elm.src = await generateBrowserThumbnail(value.trim());
                      } catch (e) {
                        elm.src = "images/video-file.svg";
                        console.warn(e);
                      }
                    },
                    style: {
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      pointerEvents: "none",
                    },
                  },
                  {
                    element: "br",
                  },
                  {
                    element: "b",
                    textContent: "Video",
                  },
                ],
              });
            })(value);
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "audio" && !exists) {
          exists = true;
          if (isSafeURLOrDomain(value.trim())) {
            (function (value) {
              elm.children.push({
                element: "button",
                className: "roundborder",
                style: {
                  padding: "4px 4px",
                  textAlign: "center",
                  fontSize: "10px",
                },
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      audioViewer.showAudio(value);
                    },
                  },
                ],
                children: [
                  {
                    element: "img",
                    src: "images/audio-file.svg",
                    style: {
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      pointerEvents: "none",
                    },
                  },
                  {
                    element: "br",
                  },
                  {
                    element: "b",
                    textContent: "Audio",
                  },
                ],
              });
            })(value);
          }
          elm.children.push({
            element: "span",
            textContent: "",
          });
        }

        if (name == "download" && !exists) {
          exists = true;
          if (isSafeURLOrDomain(value.trim())) {
            (function (value) {
              elm.children.push({
                element: "button",
                className: "roundborder",
                style: {
                  padding: "4px 4px",
                  textAlign: "center",
                  fontSize: "10px",
                  maxWidth: "60px",
                  textWrap: "wrap",
                },
                eventListeners: [
                  {
                    event: "click",
                    func: async function () {
                      var a = document.createElement("a");
                      a.href = value.trim();
                      a.download = decodeURIComponent(
                        value.trim().split("/").pop(),
                      );
                      a.target = "_blank";
                      a.click();
                      a.remove();
                    },
                  },
                ],
                children: [
                  {
                    element: "img",
                    src: "images/download.svg",
                    style: {
                      width: "40px",
                      height: "40px",
                      objectFit: "contain",
                      pointerEvents: "none",
                    },
                  },
                  {
                    element: "br",
                  },
                  {
                    element: "b",
                    textContent:
                      'Download "' + value.trim().split("/").pop() + '"',
                  },
                ],
              });
            })(value);
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

module.exports = getBracketCodeJSON;
