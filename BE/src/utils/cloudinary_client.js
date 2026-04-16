const path = require('path');
const { v2: cloudinary } = require('cloudinary');

require('dotenv').config({
  path: path.join(__dirname, '../../.env')
});

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function uploadBufferToCloudinary(buffer, folder = 'scope-tour/user-profile') {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      reject(new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBufferToCloudinary
};
