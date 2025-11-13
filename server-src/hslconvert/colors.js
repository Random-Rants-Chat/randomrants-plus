//Hex values for rainbow:
var rainbowHexes = [
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

//Gets rainbow hexes
function getRainbowHexes(hueBy = 10, saturation = 100, lightness = 50) {
  var hue = -hueBy;
  var hexes = [];
  while (hue < 360) {
    hue += hueBy;
    if (hue > 360) {
      hue = 360;
    }
    hexes.push(hslToHex(hue, saturation, lightness));
  }
  return hexes;
}
//Gets black & white hexes
function getBlackWhiteHexes(lightnessBy = 20) {
  var lightness = -lightnessBy;
  var hexes = [];
  while (lightness < 100) {
    lightness += lightnessBy;
    if (lightness > 100) {
      lightness = 100;
    }
    hexes.push(hslToHex(0, 0, 100 - lightness));
  }
  return hexes;
}

/**
 * Converts an HSL color value to RGB.
 * Works with CSS HSL values (h: 0-360, s: 0-100, l: 0-100).
 * Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * @param   {number}  h       The hue (0-360)
 * @param   {number}  s       The saturation (0-100)
 * @param   {number}  l       The lightness (0-100)
 * @return  {object}          The RGB representation {r, g, b}
 */
function hslToRgb(h, s, l) {
  // Convert HSL to the [0, 1] range
  s /= 100;
  l /= 100;
  h /= 360;

  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts an RGB color value to HSL.
 * Returns HSL values in the CSS format (h: 0-360, s: 0-100, l: 0-100).
 * Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * @param   {number}  r       The red color value (0-255)
 * @param   {number}  g       The green color value (0-255)
 * @param   {number}  b       The blue color value (0-255)
 * @return  {object}          The HSL representation {h, s, l}
 */
function rgbToHsl(r, g, b) {
  ((r /= 255), (g /= 255), (b /= 255));
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Converts an RGB color value to a HEX string.
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {string}          The HEX color string
 */
function rgbToHex(r, g, b) {
  const toHex = (c) => ("0" + Math.round(c).toString(16)).slice(-2);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Converts a HEX color string to an RGB object.
 * Handles 3-digit and 6-digit hex codes.
 *
 * @param   {string}  hex     The hex color string (e.g., "#F00" or "#FF0000")
 * @return  {object|null}     The RGB representation {r, g, b} or null if invalid
 */
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts a HEX color string to an HSL object.
 *
 * @param   {string}  hex     The hex color string
 * @return  {object|null}     The HSL representation {h, s, l} in CSS format or null if invalid
 */
function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Converts an HSL color value to a HEX string.
 *
 * @param   {number}  h       The hue (0-360)
 * @param   {number}  s       The saturation (0-100)
 * @param   {number}  l       The lightness (0-100)
 * @return  {string}          The HEX color string
 */
function hslToHex(h, s, l) {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

module.exports = {
  hslToRgb,
  rgbToHsl,
  rgbToHex,
  hexToRgb,
  hexToHsl,
  hslToHex,
  rainbowHexes,
  getRainbowHexes,
  getBlackWhiteHexes,
};
