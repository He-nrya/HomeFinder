const crypto = require('crypto');

const sha256 = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

// raw  -> goes into the email link (never stored)
// hash -> stored in MongoDB, so a database leak does not expose usable links
function createToken(minutes) {
  const raw = crypto.randomBytes(32).toString('hex'); // 256 bits of randomness
  return { raw, hash: sha256(raw), expires: new Date(Date.now() + minutes * 60 * 1000) };
}

const isTokenShape = (v) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);

module.exports = { createToken, sha256, isTokenShape };
