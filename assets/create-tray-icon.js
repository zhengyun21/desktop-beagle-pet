const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const assetsDir = path.join(__dirname);

async function createTrayIcon() {
    try {
        const sourceImage = path.join(assetsDir, 'bg3.png');
        const targetImage = path.join(assetsDir, 'tray-icon.png');

        const image = await loadImage(sourceImage);
        const canvas = createCanvas(16, 16);
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 16, 16);
        ctx.drawImage(image, 0, 0, 16, 16);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(targetImage, buffer);

        console.log('Tray icon created successfully!');
    } catch (err) {
        console.error('Error creating tray icon:', err);
    }
}

createTrayIcon();
