const { validationResult } = require("express-validator");
const Artwork = require("../models/artwork-model");
const watermark = require("../config/watermark");
const _ = require("lodash");
const { uploadToS3 } = require("../config/aws");

const artworkCltr = {};

artworkCltr.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const files = req.files; // using multer for file uploads
    let images = [];
    artworkFile = _.pick(req.body, [
      "title",
      "description",
      "artist",
      "searchTag",
      "status",
      "images",
    ]);
    // store tags has array of ids
    const body = await Artwork(artworkFile);
    const userId = req.user.id;
    body.artist = userId;
    // adding new serachTags
    const tags = artworkFile.searchTag.map(async (tag) => {
      const result = await Artwork.findOne({
        searchTag: { $elemMatch: { name: { $regex: tag, $options: "i" } } },
      });
      if (!result) {
        return { name: tag }; // Return an object with the tag name if it doesn't exist
      } else {
        return result.searchTag.find(
          (t) => t.name.toLowerCase() === tag.toLowerCase()
        ); // Return the existing search tag object if it exists
      }
    });
    const resolvedTags = await Promise.all(tags);
    body.searchTag = resolvedTags;

    // Applying the watermark to the files
    const watermarkImages = await watermark.addWatermark(files);
    const filesData = await Promise.all(watermarkImages);
    // uplaoding to AWS
    for (const file of filesData) {
      const uploadResult = await uploadToS3(file, process.env.AWS_BUCKET_NAME);
      images.push(uploadResult);
    }

    body.images = images;
    const output = await body.save();
    res.json(body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = artworkCltr;
