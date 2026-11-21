// Small, dependency-free input checks. Everything is type-checked first so that
// objects like {"$gt": ""} sent in a JSON body can never reach a MongoDB query.
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const normEmail = (v) => str(v, 254).toLowerCase();
const isEmail = (v) => typeof v === 'string' && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const isPhone = (v) => typeof v === 'string' && /^\+?[\d\s\-()]{7,20}$/.test(v);

// bcrypt only uses the first 72 bytes, so longer passwords are rejected instead of silently cut.
function passwordProblem(pw) {
  if (typeof pw !== 'string' || !pw) return 'Password is required';
  if (pw.length < 8) return 'Password must be at least 8 characters';
  if (Buffer.byteLength(pw) > 72) return 'Password is too long (72 characters maximum)';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain both letters and numbers';
  return null;
}

module.exports = { str, normEmail, isEmail, isPhone, passwordProblem };
