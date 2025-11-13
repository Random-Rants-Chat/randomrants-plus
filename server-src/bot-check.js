// FIX: Destructure the required module to get the specific components needed.
// This mirrors the 'import { Jimp, loadFont } from "jimp"' behavior.
const JimpModule = require('jimp');
const { Jimp, loadFont } = JimpModule; 
const fonts = require("@jimp/plugin-print/fonts");
// Jimp is the constructor class (new Jimp(config))
// loadFont is the function (await loadFont(Jimp.FONT_...))

const crypto = require('crypto');

// The font constants (like FONT_SANS_32_BLACK) are exposed on the Jimp class itself.
const NOISE_WORDS = ['apple', 'banana', 'cat', 'dog', 'sun', 'moon', 'star', 'tree', 'rant', 'robot'];

async function generateCaptchaJPG(code) {
    const width = 200;
    const height = 50;
    
    const backgroundColor = 0xcc9966ff; 
    const colorWhite = 0xffffffff;      
    
    try {
        const config = {
            width: width,
            height: height,
            color: backgroundColor
        };
        
        // 1. Instantiation: Use the destructured 'Jimp' constructor with the config object
        const image = await new Jimp(config); 
        
        // 2. Font Loading: Use the destructured 'loadFont' function
        // Pass constants from the Jimp class (like in the docs)
        const mainFont = await loadFont(fonts.SANS_32_BLACK);
        const noiseFont = await loadFont(fonts.SANS_16_WHITE);

        // 3. Add Background Noise Text
        image.opacity(0.3); 
        for (let i = 0; i < 20; i++) { 
            const noiseWord = NOISE_WORDS[Math.floor(Math.random() * NOISE_WORDS.length)];
            const x = Math.floor(Math.random() * (width - 50));
            const y = Math.floor(Math.random() * (height - 15));
            
            image.print({
                font: noiseFont, 
                x: x, 
                y: y, 
                text: noiseWord 
            });
        }
        
        image.opacity(1.0); 

        // 4. Print the Main CAPTCHA Code
        await image.print({
            font: mainFont, 
            x: 30, 
            y: 8, 
            text: code,
            horizontalAlign: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
            // Include maximum width/height constraints for alignment/wrapping
            maxWidth: width,
            maxHeight: height
        });

		image.rotate((Math.random() - 0.5)*10);
        
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            image.setPixelColor(colorWhite, x, y); 
        }

        // 6. Convert to compressed JPEG and return the Buffer
        return await image.getBuffer('image/jpeg', { quality: 30 });

    } catch (error) {
        // Log the error to see if any new problems arise
        console.error('Error in generateCaptchaJPG:', error);
        throw new Error('Failed to generate CAPTCHA image.');
    }
}

function generateCaptchaCode(length = 7) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
}

module.exports = { 
    generateCaptchaJPG,
    generateCaptchaCode
};