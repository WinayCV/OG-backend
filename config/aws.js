// aws-upload.js
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

// Configure the AWS SDK with your credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadToS3(file, userId) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${userId}/${uuidv4()}-${file.originalname}`,
    Body: file.buffer,
    ACL: "public-read",
  };

  const data = await s3.upload(params).promise();
  return { url: data.Location, key: data.Key };
}
//for deleting image i have to pass the key
async function deleteFromS3(key) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log("image deleted");
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { uploadToS3, deleteFromS3 };
