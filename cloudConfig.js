const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Integrating our backend with cloudinary services
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Define Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust-dev',
      allowedFormats: ["png", "jpeg", "jpg"]
    },
  });


module.exports = { cloudinary, storage };