// FIX: Destructure the required module to get the specific components needed.
// This mirrors the 'import { Jimp, loadFont } from "jimp"' behavior.
const JimpModule = require("jimp");
const { Jimp, loadFont } = JimpModule;
const fonts = require("@jimp/plugin-print/fonts");
// Jimp is the constructor class (new Jimp(config))
// loadFont is the function (await loadFont(Jimp.FONT_...))

const crypto = require("crypto");

// The font constants (like FONT_SANS_32_BLACK) are exposed on the Jimp class itself.
const NOISE_WORDS = [
  "cat",
  "dog",
  "sun",
  "moon",
  "star",
  "tree",
  "rant",
  "robot",
];

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateAlphabetRandom() {
  var i = 0;
  var text = "";
  while (i < 100) {
    text += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    i += 1;
  }
  return text;
}

const BG_COLORS = [
  "#910000",
  "#914b00",
  "#918d00",
  "#1b9100",
  "#00915e",
  "#002491",
  "#660091",
];

async function generateImage(code) {
  const width = 200;
  const height = 50;

  const backgroundColor = JimpModule.cssColorToHex(
    BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
  );
  const colorWhite = 0xffffffff;

  try {
    const config = {
      width: width,
      height: height,
      color: backgroundColor,
    };

    // 1. Instantiation: Use the destructured 'Jimp' constructor with the config object
    const image = new Jimp(config);

    // 2. Font Loading: Use the destructured 'loadFont' function
    // Pass constants from the Jimp class (like in the docs)
    const mainFont = await loadFont(fonts.SANS_32_WHITE);
    const noiseFont = await loadFont(fonts.SANS_16_WHITE);
    const noiseFont2 = await loadFont(fonts.SANS_16_BLACK);

    // 3. Add Background Noise Text
    for (let i = 0; i < 20; i++) {
      const noiseWord =
        NOISE_WORDS[Math.floor(Math.random() * NOISE_WORDS.length)];
      const x = (i % 5) * 50;
      const y = Math.round(i / 5) * 16;

      image.print({
        font: noiseFont,
        x: x,
        y: y,
        text: noiseWord,
        opacity: 0.5,
      });
      if (x == 0) {
        image.print({
          font: noiseFont2,
          x: x,
          y: y,
          text: generateAlphabetRandom(),
          opacity: 0.5,
        });
      }
    }

    image.opacity(0.5);

    // 4. Print the Main CAPTCHA Code
    await image.print({
      font: mainFont,
      x: 20,
      y: 8,
      text: code,
    });

    //image.rotate((Math.random() - 0.5) * 10);

    for (let i = 0; i < 600; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      image.setPixelColor(
        JimpModule.cssColorToHex(
          BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
        ),
        x,
        y,
      );
    }

    // 6. Convert to compressed JPEG and return the Buffer
    return await image.getBuffer("image/jpeg", { quality: 30 });
  } catch (error) {
    // Log the error to see if any new problems arise
    console.error("Error in generateCaptchaJPG:", error);
    throw new Error("Failed to generate CAPTCHA image.");
  }
}

function generateCode(length = 8) {
  return crypto
    .randomBytes(length / 2)
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
}

module.exports = {
  generateImage,
  generateCode,
};
