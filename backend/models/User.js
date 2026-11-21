const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  accountType: { type: String, enum: ['Tenant', 'Students', 'Home Seeker', 'Buyer', 'Landlord', 'Seller'], required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, required: true, minlength: 6, select: false },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  blocked: { type: Boolean, default: false },

  // --- email verification / password reset ---
  // New accounts start unverified. Accounts that existed before this feature are marked
  // verified once at server start (see server.js), so nobody gets locked out.
  emailVerified: { type: Boolean, default: false },
  verifySentAt: Date,
  resetSentAt: Date,
  // Only the SHA-256 hash of each token is stored, never the token itself.
  verifyTokenHash: { type: String, select: false },
  verifyTokenExpires: { type: Date, select: false },
  resetTokenHash: { type: String, select: false },
  resetTokenExpires: { type: Date, select: false },
  // Logins issued before this moment stop working (used after a password reset).
  passwordChangedAt: Date,
}, { timestamps: true });

userSchema.index({ verifyTokenHash: 1 }, { sparse: true });
userSchema.index({ resetTokenHash: 1 }, { sparse: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matches = function (pw) { return bcrypt.compare(pw, this.password); };
module.exports = mongoose.model('User', userSchema);
