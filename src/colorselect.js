var elements = require("./gp2/elements.js");
var colorSelectStylesheet = require("./colorselect.css");
var {
  hslToRgb,
  rgbToHsl,
  rgbToHex,
  hexToRgb,
  hexToHsl,
  hslToHex,
  getRainbowHexes,
  getBlackWhiteHexes,
} = require("./colorutil.js");

var colorSelector = {
  ask: function (defaultValue) {
    return new Promise((accept, reject) => {
      var setColorDiv = function () {};
      var dialog = elements.appendElementsFromJSON(document.body, [
        {
          element: "div",
          className: "colorSelectDialog",
          gid: "colorSelectDialog",
          children: [
            {
              element: "style",
              innerHTML: colorSelectStylesheet,
            },
            {
              element: "div",
              className: "colorSelectDialogBackground",
            },
            {
              element: "div",
              className: "colorSelectDialogBox",
              children: [
                {
                  element: "span",
                  className: "colorSelectHeader",
                  textContent: "Choose a color",
                },
                {
                  element: "br",
                },
                {
                  element: "div",
                  style: {
                    display: "flex",
                  },
                  children: [
                    {
                      element: "div",
                      className: "colorSelectPreviewBox",
                      gid: "colorSelectPreview",
                      textContent: "Preview",
                    },
                    {
                      element: "div",
                      style: {
                        display: "block",
                      },
                      children: [
                        {
                          element: "button",
                          className: "colorSelectButton",
                          textContent: "Normal",
                          eventListeners: [
                            {
                              event: "click",
                              func: function () {
                                elements.getGPId("colorSelectHSL").hidden =
                                  true;
                                elements.getGPId("colorSelectRGB").hidden =
                                  true;
                                elements.getGPId("colorSelectCursor").hidden =
                                  false;
                              },
                            },
                          ],
                        },
                        {
                          element: "button",
                          className: "colorSelectButton",
                          textContent: "HSL",
                          eventListeners: [
                            {
                              event: "click",
                              func: function () {
                                elements.getGPId("colorSelectHSL").hidden =
                                  false;
                                elements.getGPId("colorSelectRGB").hidden =
                                  true;
                                elements.getGPId("colorSelectCursor").hidden =
                                  true;
                              },
                            },
                          ],
                        },
                        {
                          element: "button",
                          className: "colorSelectButton",
                          textContent: "RGB",
                          eventListeners: [
                            {
                              event: "click",
                              func: function () {
                                elements.getGPId("colorSelectHSL").hidden =
                                  true;
                                elements.getGPId("colorSelectRGB").hidden =
                                  false;
                                elements.getGPId("colorSelectCursor").hidden =
                                  true;
                              },
                            },
                          ],
                        },
                        {
                          element: "br",
                        },
                        {
                          element: "div",
                          gid: "colorSelectHSL",
                          hidden: true,
                          children: [
                            {
                              element: "span",
                              className: "colorSelectLabel",
                              textContent: "Hue: ",
                            },
                            {
                              element: "input",
                              gid: "colorSelectHueInput",
                              type: "range",
                              min: 0,
                              max: 360,
                              value: 0,
                            },
                            {
                              element: "br",
                            },
                            {
                              element: "span",
                              className: "colorSelectLabel",
                              textContent: "Saturation: ",
                            },
                            {
                              element: "input",
                              gid: "colorSelectSaturationInput",
                              type: "range",
                              min: 0,
                              max: 100,
                              value: 100,
                            },
                            {
                              element: "br",
                            },
                            {
                              element: "span",
                              className: "colorSelectLabel",
                              textContent: "Lightness: ",
                            },
                            {
                              element: "input",
                              gid: "colorSelectLightnessInput",
                              type: "range",
                              min: 0,
                              max: 100,
                              value: 50,
                            },
                          ],
                        },
                        {
                          element: "div",
                          gid: "colorSelectRGB",
                          hidden: true,
                          children: [
                            {
                              element: "span",
                              className: "colorSelectLabel",
                              textContent: "Red: ",
                            },
                            {
                              element: "input",
                              gid: "colorSelectRedInput",
                              type: "range",
                              min: 0,
                              max: 255,
                              value: 0,
                            },
                            {
                              element: "br",
                            },
                            {
                              element: "span",
                              className: "colorSelectLabel",
                              textContent: "Green: ",
                            },
                            {
                              element: "input",
                              gid: "colorSelectGreenInput",
                              type: "range",
                              min: 0,
                              max: 255,
                              value: 0,
                            },
                            {
                              element: "br",
                            },
                            {
                              element: "span",
                              className: "colorSelectLabel",
                              textContent: "Blue: ",
                            },
                            {
                              element: "input",
                              gid: "colorSelectBlueInput",
                              type: "range",
                              min: 0,
                              max: 255,
                              value: 0,
                            },
                          ],
                        },
                        {
                          element: "div",
                          gid: "colorSelectCursor",
                          children: [
                            {
                              element: "div",
                              style: {
                                display: "flex",
                              },
                              children: [
                                {
                                  element: "div",
                                  style: {
                                    width: "125px",
                                    height: "fit-content",
                                    marginRight: "10px",
                                  },
                                  children: [
                                    {
                                      element: "div",
                                      className: "colorSelectDropContainer",
                                      children: [
                                        {
                                          element: "div",
                                          className: "colorSelectDrop",
                                          gid: "colorSelectDrop",
                                        },
                                      ],
                                    },
                                    {
                                      element: "canvas",
                                      width: "125",
                                      height: "125",
                                      gid: "colorSelectCursorCanvas",
                                      className: "colorSelectCursorCanvas",
                                    },
                                    {
                                      element: "br",
                                    },
                                    {
                                      element: "span",
                                      style: {
                                        width: "125px",
                                        fontSize: "12px",
                                      },
                                      textContent:
                                        "Click in the square to choose a color.",
                                    },
                                  ],
                                },
                                {
                                  element: "div",
                                  children: [
                                    {
                                      element: "span",
                                      className: "colorSelectLabel",
                                      textContent: "Hue: ",
                                    },
                                    {
                                      element: "input",
                                      gid: "colorSelectHueInput2",
                                      type: "range",
                                      min: 0,
                                      max: 360,
                                      value: 0,
                                    },
                                  ],
                                },
                              ],
                            },
                            {
                              element: "br",
                            },
                          ],
                        },
                        /*{
                          element: "input",
                          type: "color",
                          gid: "colorSelectInput",
                          style: {
                            width: "100%",
                          },
                        },
                        { element: "br" },*/
                      ],
                    },
                  ],
                },
                {
                  element: "span",
                  className: "colorSelectLabel",
                  textContent: "Hex: ",
                },
                {
                  element: "input",
                  type: "text",
                  className: "colorSelectTextInput",
                  gid: "colorSelectInput",
                  value: "#ffffff",
                },
                {
                  element: "br",
                },
                /*{
                  element: "div",
                  className: "colorSelectPickRainbowContainer2",
                  children: [*/
                {
                  element: "div",
                  className: "colorSelectPickRainbowContainer",
                  children: getRainbowHexes(20)
                    .concat(getBlackWhiteHexes(20))
                    .map((hex) => {
                      return {
                        element: "div",
                        className: "colorSelectColorDiv",
                        style: {
                          background: hex,
                        },
                        backgroundHex: hex,
                        eventListeners: [
                          {
                            event: "click",
                            func: function () {
                              setColorDiv(this);
                            },
                          },
                        ],
                      };
                    }),
                },
                /*],
                },*/
                {
                  element: "br",
                },
                {
                  element: "button",
                  className: "colorSelectButton",
                  textContent: "OK",
                  gid: "colorSelectOkButton",
                },
                {
                  element: "button",
                  className: "colorSelectButton",
                  textContent: "Cancel",
                  gid: "colorSelectCancelButton",
                },
              ],
            },
          ],
        },
      ])[0];

      var previewDiv = elements.getGPId("colorSelectPreview");

      var hueInput = elements.getGPId("colorSelectHueInput");
      var hueInput2 = elements.getGPId("colorSelectHueInput2");
      var saturationInput = elements.getGPId("colorSelectSaturationInput");
      var lightnessInput = elements.getGPId("colorSelectLightnessInput");

      var redInput = elements.getGPId("colorSelectRedInput");
      var greenInput = elements.getGPId("colorSelectGreenInput");
      var blueInput = elements.getGPId("colorSelectBlueInput");

      var colorDrop = elements.getGPId("colorSelectDrop");
      var cvs = elements.getGPId("colorSelectCursorCanvas");
      var ctx = cvs.getContext("2d");

      var colorInput = elements.getGPId("colorSelectInput");

      var currentHSL = { h: 0, s: 0, l: 0 };

      function mapPosToHSL(hue, x, y, width, height) {
        const s = (x / width) * 100;
        const l = 100 + (y / height) * -100;
        return { h: hue, s, l };
      }
      function SLToPos(s, l, width, height) {
        const colorX = (s / 100) * width;
        const colorY = (1 - l / 100) * height;
        return { x: colorX, y: colorY };
      }

      function drawCanvasSelect() {
        var x = 0;
        var y = 0;
        var hue = currentHSL.h;
        var resolutionX = 2;
        var resolutionY = 2;

        while (y < cvs.height) {
          x = 0;
          while (x < cvs.width) {
            var hsl = mapPosToHSL(hue, x, y, cvs.width, cvs.height);
            ctx.fillStyle = hslToHex(hsl.h, hsl.s, hsl.l);
            ctx.fillRect(x, y, resolutionX, resolutionY);
            x += resolutionX;
          }
          y += resolutionY;
        }
      }

      function adjustColorPickerCursor(moving) {
        var colorPos = SLToPos(
          currentHSL.s,
          currentHSL.l,
          cvs.width,
          cvs.height
        );
        var color = getHex();

        colorDrop.style.backgroundColor = color;
        colorDrop.style.left = colorPos.x + "px";
        colorDrop.style.top = colorPos.y + "px";
        if (!moving) {
          colorDrop.style.transition = "left 0.3s, top 0.3s";
        } else {
          colorDrop.style.transition = "0s";
        }
      }

      function updateHSL(moving) {
        currentHSL = {
          h: +hueInput.value,
          s: +saturationInput.value,
          l: +lightnessInput.value,
        };
        var rgb = hslToRgb(currentHSL.h, currentHSL.s, currentHSL.l);
        var hex = hslToHex(currentHSL.h, currentHSL.s, currentHSL.l);
        previewDiv.style.backgroundColor = hex;
        colorInput.value = hex;
        redInput.value = rgb.r;
        greenInput.value = rgb.g;
        blueInput.value = rgb.b;
        hueInput2.value = hueInput.value;

        drawCanvasSelect();
        adjustColorPickerCursor(moving);
      }
      function updateHSLRGB() {
        var hsl = rgbToHsl(
          +redInput.value,
          +greenInput.value,
          +blueInput.value
        );
        hueInput.value = hsl.h;
        saturationInput.value = hsl.s;
        lightnessInput.value = hsl.l;
        hueInput2.value = hsl.h;
        updateHSL();
      }
      function setHSL(h, s, l) {
        hueInput.value = h;
        saturationInput.value = s;
        lightnessInput.value = l;
        updateHSL();
      }
      function getHex() {
        return hslToHex(currentHSL.h, currentHSL.s, currentHSL.l);
      }

      updateHSL();

      hueInput.addEventListener("input", updateHSL);
      hueInput2.addEventListener("input", function () {
        hueInput.value = hueInput2.value;
        updateHSL();
      });
      saturationInput.addEventListener("input", updateHSL);
      lightnessInput.addEventListener("input", updateHSL);

      redInput.addEventListener("input", updateHSLRGB);
      greenInput.addEventListener("input", updateHSLRGB);
      blueInput.addEventListener("input", updateHSLRGB);

      function adjustPickerPosition(offsetX, offsetY, moving) {
        var clickX = Math.max(0, Math.min(cvs.width, offsetX));
        var clickY = Math.max(0, Math.min(cvs.height, offsetY));

        var hsl = mapPosToHSL(
          currentHSL.h,
          clickX,
          clickY,
          cvs.width,
          cvs.height
        );
        hueInput.value = hsl.h;
        saturationInput.value = hsl.s;
        lightnessInput.value = hsl.l;
        updateHSL(moving);
      }

      cvs.addEventListener("click", function (e) {
        adjustPickerPosition(e.offsetX, e.offsetY, false);
        e.preventDefault();
      });

      cvs.addEventListener("touchmove", function (e) {
        var boundingBox = cvs.getBoundingClientRect();
        var touchX = e.touches[0].clientX;
        var touchY = e.touches[0].clientY;

        var x = touchX - boundingBox.x;
        var y = touchY - boundingBox.y;

        adjustPickerPosition(x, y, true);
        e.preventDefault();
      });
      var mousedown = false;
      cvs.addEventListener("mousedown", function (e) {
        mousedown = true;
        adjustPickerPosition(e.offsetX, e.offsetY, true);
        e.preventDefault();
      });

      var colorSelectDialog = elements.getGPId("colorSelectDialog");

      colorSelectDialog.addEventListener("mouseup", function (e) {
        mousedown = false;
        e.preventDefault();
      });
      colorSelectDialog.addEventListener("mousemove", function (e) {
        if (mousedown) {
          var boundingBox = cvs.getBoundingClientRect();

          var x = e.clientX - boundingBox.x;
          var y = e.clientY - boundingBox.y;
          adjustPickerPosition(x, y, true);
          e.preventDefault();
        }
      });

      colorInput.addEventListener("change", () => {
        var hsl = hexToHsl(colorInput.value);
        setHSL(hsl.h, hsl.s, hsl.l);
      });

      setColorDiv = function (elm) {
        try {
          var hsl = hexToHsl(elm.getAttribute("backgroundHex"));
          setHSL(hsl.h, hsl.s, hsl.l);
        } catch (e) {
          window.alert(e);
        }
      };

      var okButton = elements.getGPId("colorSelectOkButton");
      var cancelButton = elements.getGPId("colorSelectCancelButton");

      okButton.addEventListener("click", () => {
        colorSelectDialog.remove();
        accept(getHex());
      });

      cancelButton.addEventListener("click", () => {
        colorSelectDialog.remove();
        accept(null);
      });

      if (defaultValue) {
        var hsl = hexToHsl(defaultValue);
        setHSL(hsl.h, hsl.s, hsl.l);
      }
    });
  },
};

module.exports = colorSelector;
