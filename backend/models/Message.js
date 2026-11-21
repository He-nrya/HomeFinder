const mongoose = require('mongoose');
// room = "<propertyId>:<enquirerUserId>"
const messageSchema = new mongoose.Schema({
  room: { type: String, index: true, required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  enquirer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  text: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });
module.exports = mongoose.model('Message', messageSchema);
