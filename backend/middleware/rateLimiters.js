const rateLimit = require('express-rate-limit');
const { normEmail } = require('../utils/validate');

const MIN = 60 * 1000;
const HOUR = 60 * MIN;

// Per-IP limits stop one machine hammering an endpoint; per-email limits stop many
// machines hammering one person's account. Numbers are easy to tune here.
const make = ({ windowMs, max, message, byEmail = false, skipSuccessfulRequests = false }) => {
  const options = { windowMs, max, skipSuccessfulRequests, standardHeaders: 'draft-7', legacyHeaders: false, message: { message } };
  if (byEmail) options.keyGenerator = (req) => `email:${normEmail(req.body && req.body.email) || req.ip}`;
  return rateLimit(options);
};

const tooMany = 'Too many attempts. Please wait a while and try again.';

module.exports = {
  signup: make({ windowMs: HOUR, max: 20, message: 'Too many sign-up attempts from this network. Please try again later.' }),
  login: make({ windowMs: 15 * MIN, max: 60, message: tooMany }),
  loginByEmail: make({ windowMs: 15 * MIN, max: 8, byEmail: true, skipSuccessfulRequests: true, message: 'Too many failed logins for this account. Try again in 15 minutes, or reset your password.' }),
  verify: make({ windowMs: HOUR, max: 40, message: tooMany }),
  resend: make({ windowMs: HOUR, max: 15, message: tooMany }),
  resendByEmail: make({ windowMs: HOUR, max: 3, byEmail: true, message: 'We already sent several emails to this address. Please check your inbox and spam folder, or try again in an hour.' }),
  forgot: make({ windowMs: HOUR, max: 15, message: tooMany }),
  forgotByEmail: make({ windowMs: HOUR, max: 3, byEmail: true, message: 'We already sent several emails to this address. Please check your inbox and spam folder, or try again in an hour.' }),
  reset: make({ windowMs: HOUR, max: 20, message: tooMany }),
};
