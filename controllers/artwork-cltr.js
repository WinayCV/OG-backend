const { validationResult } = require("express-validator");
const Artwork = require("../models/artwork-model");
const watermark = require("../config/watermark");
const _ = require("lodash");
const { uploadToS3, deleteFromS3 } = require("../config/aws");

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
      const uploadResult = await uploadToS3(file, userId);
      images.push(uploadResult);
    }

    body.images = images;
    const output = await body.save();
    res.json(body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

artworkCltr.all = async (req, res) => {
  try {
    const artwork = await Artwork.find({ status: "active" });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error });
  }
};
artworkCltr.one = async (req, res) => {
  const id = req.params.id;
  try {
    const artwork = await Artwork.findOne({ _id: id });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error });
  }
};
artworkCltr.list = async (req, res) => {
  const id = req.user.id;

  try {
    const artwork = await Artwork.find({ artist: id });
    res.json(artwork);
  } catch (error) {
    res.status(500).json({ error });
  }
};
artworkCltr.delete = async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  try {
    if (req.user.role == "artist") {
      const result = await Artwork.find({ artist: userId, _id: id });
      if (result.length != 0) {
        const artwork = await Artwork.findByIdAndDelete(id);
        return res.json({ msg: "Artwork deleted successfully" });
      }
      return res.json({ msg: "Cannot perform delete" });
    }
    if (req.user.role == "admin") {
      const artwork = await Artwork.findByIdAndDelete(id);
      res.json({ msg: "Artwork deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};
artworkCltr.edit = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const id = req.params.id;
  const files = req.files;
  const userId = req.user.id;
  const body = _.pick(req.body, [
    "title",
    "description",
    "searchtag",
    "deleteImages",
  ]);
  let images = [];
  try {
    //converting delete images id into an array if only one id is sent
    if (req.body.deleteImages) {
      if (!Array.isArray(req.body.deleteImages)) {
        body.deleteImages = [req.body.deleteImages];
      }
      const artwork = await Artwork.findOne({ _id: id });

      if (!artwork) {
        return res.status(404).json({ msg: "Artwork not found" });
      }
      // getting the id to be of the image to be deleted
      const oldImages = body.deleteImages.map(async (imageId) => {
        const id = imageId;
        const result = await Artwork.findOne({
          images: { $elemMatch: { _id: id } },
        });
        if (result) {
          return result.images.find((image) => {
            return image._id == id;
          });
        } else {
          return res.status(404).json({ msg: "image not found" });
        }
      });
      //array of objects of images to be deleted [{url,key,_id}]
      const resolvedImages = await Promise.all(oldImages);
      //deleting the images from aws using key
      if (resolvedImages) {
        for (const file of resolvedImages) {
          const result = await deleteFromS3(file.key);
          const idToRemove = file._id;
          if (result) {
            const output = await Artwork.findByIdAndUpdate(
              id,
              { $pull: { images: { _id: idToRemove } } },
              { new: true }
            );
          }
        }
      }
    }
    // Applying the watermark to the files
    const watermarkImages = await watermark.addWatermark(files);

    const filesData = await Promise.all(watermarkImages);
    // uplaoding to AWS
    for (const file of filesData) {
      const uploadResult = await uploadToS3(file, userId);
      images.push(uploadResult);
    }
    const updateObj = {
      $set: body,
      $push: { images: { $each: images } },
    };

    const editArtwork = await Artwork.findByIdAndUpdate(id, updateObj, {
      new: true,
      runValidators: true,
    });

    res.json(editArtwork);
  } catch (error) {
    res.status(500).json({ error });
  }
};
module.exports = artworkCltr;
