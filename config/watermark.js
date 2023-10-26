const Jimp = require("jimp");

async function addWatermark(files) {
  // adding watermark
  const watermarkImages = files.map(async (file) => {
    const baseImage = await Jimp.read(file.buffer);
    const srcImage = await Jimp.read("config/watermark/og.jpeg");
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    baseImage.print(font, 50, 10, "Online Gallery");
    const width = Jimp.AUTO; // Let Jimp automatically adjust the width
    const height = baseImage.getHeight(); // Specify the desired height

    srcImage.resize(width, height).invert();
    // Calculate the center coordinates for the srcImage
    const x = (baseImage.getWidth() - srcImage.getWidth()) / 4;
    const y = (baseImage.getHeight() - srcImage.getHeight()) / 2;
    // Composite the source image onto the base image
    baseImage.composite(srcImage, x, y, {
      mode: Jimp.BLEND_SCREEN,
      opacitySource: 0.25,
      opacityDest: 1,
    });

    await baseImage.writeAsync(`images/${file.originalname}`);

    return { ...file, buffer: await baseImage.getBufferAsync(Jimp.AUTO) };
  });
  return Promise.all(watermarkImages);
}

module.exports = {
  addWatermark,
};
