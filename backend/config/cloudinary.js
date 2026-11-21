const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'homefinder', resource_type: 'image' }, (err, r) =>
        err ? reject(err) : resolve({ url: r.secure_url, publicId: r.public_id }))
      .end(buffer);
  });
const destroy = (publicId) => (publicId ? cloudinary.uploader.destroy(publicId).catch(() => {}) : null);
module.exports = { uploadBuffer, destroy };
