const mongoose = require('mongoose');
const propertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['sale', 'rent', 'student'], required: true, index: true },
  type: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  location: {
    address: { type: String, required: true },
    city: { type: String, default: 'Abuja' },
    lat: Number, lng: Number,
  },
  bedrooms: { type: Number, default: 1 },
  bathrooms: { type: Number, default: 1 },
  parking: { type: Number, default: 0 },
  features: [String],
  nearby: String,
  university: String,
  distanceToCampus: String,
  images: [{ url: String, publicId: String }],
  contactPhone: { type: String, required: true },
  whatsapp: String,
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  views: { type: Number, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
module.exports = mongoose.model('Property', propertySchema);
