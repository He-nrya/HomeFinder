const mongoose = require('mongoose');

// One document per chat conversation (room = "<propertyId>:<enquirerUserId>").
// It only exists to remember WHEN the owner was last emailed, so one chatty visitor
// can't flood an owner's inbox. The unique index on `room` makes the check atomic.
const inquirySchema = new mongoose.Schema({
  room: { type: String, required: true, unique: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  enquirer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastNotifiedAt: Date,
  notifiedCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
