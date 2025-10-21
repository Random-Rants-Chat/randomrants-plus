var elements = require("../../gp2/elements.js");
var fetchUtils = require("./fetchutils.js");

var messageInputBox = elements.getGPId("messageInputBox");
var messageAddEmojiButton = elements.getGPId("messageAddEmojiButton");
var addEmojiDiv = elements.getGPId("addEmojiDiv");
var emojiDialogCloseButton = elements.getGPId("emojiDialogCloseButton");
var emojiDialogContainer = elements.getGPId("emojiDialogContainer");
var emojiDialogCategories = elements.getGPId("emojiDialogCategory");

var emojiJSONURL = "emojis/data-by-group.json";

var randomRantsEmojiURL = "/emojis/rantemojis.json";
var timestamp = Math.round(Date.now());
var prefixURLS = require("../../emoji-urls.js");

var searchSlug = "SEARCHEMOJIS";

addEmojiDiv.hidden = true;

messageAddEmojiButton.addEventListener("click", () => {
  addEmojiDiv.hidden = !addEmojiDiv.hidden;
});
emojiDialogCloseButton.addEventListener("click", () => {
  addEmojiDiv.hidden = true;
});

function insertEmoji(inputElement, emoji) {
  const start = inputElement.selectionStart;
  const end = inputElement.selectionEnd;
  const currentValue = inputElement.value;

  // Insert the emoji at the end of the selection
  inputElement.value =
    currentValue.substring(0, end) + emoji + currentValue.substring(end);

  // Set the new caret position immediately after the inserted emoji
  inputElement.selectionStart = inputElement.selectionEnd = end + emoji.length;

  // Focus the input element
  inputElement.focus();
}

var emojiJSON = [];
var selectedCategory = null;

function mapToButtons(emojiArray) {
  return emojiArray.map((emojiInfo) => {
    return {
      element: "div",
      className: "divButton roundborder emojiDialogButton",
      children: emojiInfo.src
        ? [
            {
              element: "img",
              src: emojiInfo.src,
              lazy: true,
              style: {
                //imageRendering: "pixelated",
                height: "40px",
                maxWidth: "40px",
                objectFit: "contain",
              },
            },
          ]
        : [{ element: "span", textContent: emojiInfo.emoji }],
      emojiContent: emojiInfo.path
        ? `[emoji src=${emojiInfo.path}@${emojiInfo.emojiURL}]`
        : emojiInfo.emoji,
      title: emojiInfo.name,
      eventListeners: [
        {
          event: "click",
          func: function () {
            insertEmoji(messageInputBox, this.getAttribute("emojiContent"));
          },
        },
      ],
    };
  });
}

function existsNoCaseSensitive(term, finder) {
  return term.toLowerCase().trim().indexOf(finder.trim().toLowerCase()) > -1;
}

function lettersAndNumbersOnly(ogText) {
  var lettersAndNumbers =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  var text = "";
  for (var letter of ogText) {
    if (lettersAndNumbers.indexOf(letter) > -1) {
      text += letter;
    }
  }
  return text;
}

function reloadEmojis() {
  elements.removeAllChildren(emojiDialogContainer);

  if (selectedCategory == searchSlug) {
    var emojiDialogTextInput = elements.getGPId("emojiDialogTextInput");
    var emojis = [];
    emojiJSON.forEach((group) => {
      if (group.emojis) {
        emojis = emojis.concat(group.emojis);
      }
    });
    var imageOnlyMode = emojiDialogTextInput.value.length < 1;
    var termToFind = lettersAndNumbersOnly(emojiDialogTextInput.value);
    if (imageOnlyMode) {
      var foundEmojis = emojis.filter((emoji) => emoji.src);
      foundEmojis = [];
    } else {
      var foundEmojis = emojis.filter((emoji) => {
        if (emoji.tags) {
          for (var tag of emoji.tags) {
            if (existsNoCaseSensitive(lettersAndNumbersOnly(tag), termToFind)) {
              return true;
            }
          }
        }
        return existsNoCaseSensitive(
          lettersAndNumbersOnly(emoji.name),
          termToFind
        );
      });
    }
    var alreadyExists = [];
    foundEmojis = foundEmojis.filter((emoji) => {
      //To avoid duplicate emojis in search results, filter out already added ones.
      if (alreadyExists.indexOf(emoji.name || emoji.emoji) < 0) {
        alreadyExists.push(emoji.name || emoji.emoji);
        return true;
      }
      return false;
    });
    if (foundEmojis.length < 1) {
      if (emojiDialogTextInput.value.length < 1) {
        elements.appendElementsFromJSON(emojiDialogContainer, [
          {
            element: "div",
            style: {
              textAlign: "center",
              display: "block",
              fontWeight: "bold",
              marginTop: "10px",
              height: "fit-content",
            },
            textContent: "Type something in emoji search to begin searching",
          },
        ]);
      } else {
        elements.appendElementsFromJSON(emojiDialogContainer, [
          {
            element: "span",
            style: {
              textAlign: "center",
              display: "block",
              fontWeight: "bold",
              marginTop: "10px",
              height: "fit-content",
            },
            textContent: "No emojis found!",
          },
        ]);
      }
    }
    if (foundEmojis) {
      elements.appendElementsFromJSON(
        emojiDialogContainer,
        mapToButtons(foundEmojis)
      );
    }
    return;
  }

  var currentGroup = emojiJSON.find((group) => group.slug == selectedCategory);
  if (currentGroup) {
    elements.appendElementsFromJSON(
      emojiDialogContainer,
      mapToButtons(currentGroup.emojis)
    );
  }
}
function updateSelectedCategory() {
  for (var button of emojiDialogCategories.children) {
    button.removeAttribute("selected");
  }
  elements
    .getGPId("emojisGroupButton_" + selectedCategory)
    .setAttribute("selected", "");

  reloadEmojis();
}

function debounce(func, delay = 60) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function emojisLoaded(preferedCategory) {
  var categories = emojiJSON.map((group) => {
    if (group.slug == searchSlug) {
      return {
        element: "div",
        gid: "emojisGroupButton_" + searchSlug,
        children: [
          {
            element: "span",
            textContent: "Search:",
          },
          {
            element: "input",
            placeholder: "Search for emojis here",
            className: "emojiDialogTextInput",
            gid: "emojiDialogTextInput",
          },
        ],
        className: "emojiDialogCategoryButton",
        eventListeners: [
          {
            event: "click",
            func: function () {
              selectedCategory = searchSlug;
              updateSelectedCategory();
              elements.getGPId("emojiDialogTextInput").focus();
            },
          },
          {
            event: "input",
            func: debounce(function () {
              selectedCategory = searchSlug;
              updateSelectedCategory();
            }, 100),
          },
        ],
      };
    }
    return {
      element: "div",
      gid: "emojisGroupButton_" + group.slug,
      textContent: group.name,
      className: "emojiDialogCategoryButton",
      eventListeners: [
        {
          event: "click",
          func: function () {
            selectedCategory = group.slug;
            updateSelectedCategory();
          },
        },
      ],
    };
  });

  elements.appendElementsFromJSON(emojiDialogCategories, categories);

  selectedCategory = emojiJSON[preferedCategory].slug;
  updateSelectedCategory();
}

(async function () {
  try {
    emojiJSON = [];

    var rantEmojis = await fetchUtils.fetchAsJSON(randomRantsEmojiURL);
    var allRantEmojis = [];
    rantEmojis.forEach((emojiGroup) => {
      emojiGroup.emojis = emojiGroup.emojis.map((emoji) => {
        allRantEmojis.push(emoji);
        if (emoji.emojiURL) {
          emoji.path = emoji.src;
          emoji.src =
            prefixURLS[emoji.emojiURL] + emoji.src + "?v=" + timestamp;
        }
        return emoji;
      });
    });
    emojiJSON.push({
      slug: "all_image_emojis",
      name: "All image-emojis",
      emojis: allRantEmojis,
    });
    emojiJSON.push({ slug: searchSlug });
    emojiJSON = emojiJSON.concat(rantEmojis);
    emojiJSON = emojiJSON.concat(await fetchUtils.fetchAsJSON(emojiJSONURL)); //Load normal text emojis.
    emojisLoaded(0);
  } catch (e) {
    emojiJSON = [];
    console.error("Emojis failed to load: " + e);
    emojiDialogCategories.textContent =
      "Emojis failed to load, try again later. Error: " + e;
  }
})();
