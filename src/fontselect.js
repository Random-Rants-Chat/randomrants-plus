var elements = require("./gp2/elements.js");
var fontSelectStylesheet = require("./fontselect.css");
var importedFontList = require("./fontlist.js");

var fontSelector = {
  ask: function (fontList = importedFontList, defaultValue) {
    return new Promise((accept, reject) => {
      var onFontClick = function () {};
      var previewText = "[Preview] ABCDEFGHIJKLMNOPQRSTUVWXYZ 1234567890";
      var dialog = elements.appendElementsFromJSON(document.body, [
        {
          element: "div",
          className: "fontSelectDialog",
          gid: "fontSelectDialog",
          children: [
            {
              element: "style",
              innerHTML: fontSelectStylesheet,
            },
            {
              element: "div",
              className: "fontSelectDialogBackground",
            },
            {
              element: "div",
              className: "fontSelectDialogBox",
              children: [
                {
                  element: "span",
                  className: "fontSelectHeader",
                  textContent: "Choose a font",
                },
                {
                  element: "br",
                },
                {
                  element: "span",
                  textContent: previewText,
                  gid: "fontSelectPreview",
                  style: {
                    fontSize: "20px",
                    fontWeight: "bold",
                    minWidth: "430px",
                  },
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  className: "fontSelectOptionContainer",
                  children: fontList.map((font) => {
                    return {
                      element: "div",
                      children: [
                        {
                          element: "div",
                          className: "fontSelectOption",
                          gid: "fontSelect_" + font.family,
                          textContent: font.name,
                          style: {
                            fontFamily: font.family,
                          },
                          eventListeners: [
                            {
                              event: "click",
                              func: function () {
                                onFontClick(this);
                              },
                            },
                          ],
                        },
                      ],
                    };
                  }),
                },
                {
                  element: "br",
                },
                {
                  element: "button",
                  className: "fontSelectButton",
                  textContent: "OK",
                  gid: "fontSelectOkButton",
                },
                {
                  element: "button",
                  className: "fontSelectButton",
                  textContent: "Cancel",
                  gid: "fontSelectCancelButton",
                },
              ],
            },
          ],
        },
      ])[0];
      var fontSelectDialog = elements.getGPId("fontSelectDialog");
      var previewSpan = elements.getGPId("fontSelectPreview");
      var selectedFont = fontList[0].family;
      var fontElements = {};
      fontList.forEach((font) => {
        fontElements[font.family] = elements.getGPId(
          "fontSelect_" + font.family
        );
        elements.disposeGPId("fontSelect_" + font.family);
      });
      //window.alert(Object.keys(fontElements));
      function updateFontListSelection() {
        previewSpan.style.fontFamily = selectedFont;
        fontList.forEach((font) => {
          var elm = fontElements[font.family];
          if (elm) {
            elm.removeAttribute("selected");
          }
        });
        var elm = fontElements[selectedFont];
        if (elm) {
          elm.setAttribute("selected", "");
        }
      }
      updateFontListSelection();
      onFontClick = function (elm) {
        selectedFont = elm.style.fontFamily;
        updateFontListSelection();
      };

      var okButton = elements.getGPId("fontSelectOkButton");
      var cancelButton = elements.getGPId("fontSelectCancelButton");

      okButton.addEventListener("click", function () {
        fontSelectDialog.remove();
        accept(selectedFont);
      });
      cancelButton.addEventListener("click", function () {
        fontSelectDialog.remove();
        accept(null);
      });

      if (defaultValue) {
        if (fontElements[defaultValue]) {
          selectedFont = defaultValue;
          updateFontListSelection();
        }
      }
    });
  },
};

module.exports = fontSelector;
