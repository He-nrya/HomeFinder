// One function per email the app can send. Each one:
//   1) builds the message from a template, 2) sends it through Brevo,
//   3) NEVER throws - a failed email is logged and returns false, it must not break signup or chat.
//
// To add a new notification later:  write a template in templates.js, then add one line below.
const { sendEmail } = require('./brevo');
const t = require('./templates');

const frontendUrl = () => {
  const url = process.env.FRONTEND_URL || (process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || '').split(',')[0] || 'http://localhost:5173';
  return url.trim().replace(/\/+$/, '');
};
const verifyLink = (token) => `${frontendUrl()}/verify-email?token=${token}`;
const resetLink = (token) => `${frontendUrl()}/reset-password?token=${token}`;

const to = (user) => ({ email: user.email, name: user.name });

const define = (label, build) => async (...args) => {
  try {
    const mail = build(...args);
    if (!mail) return false;
    await sendEmail(mail);
    return true;
  } catch (e) {
    console.error(`[email:${label}] failed:`, e.message);
    return false;
  }
};

const sendVerificationEmail = define('verify', (user, url, hours) => ({ to: to(user), ...t.verifyEmail({ name: user.name, url, hours }), tags: ['verify-email'] }));

const sendWelcomeEmail = define('welcome', (user) => ({ to: to(user), ...t.welcome({ name: user.name, url: frontendUrl() }), tags: ['welcome'] }));

const sendPasswordResetEmail = define('reset', (user, url, minutes) => ({ to: to(user), ...t.passwordReset({ name: user.name, url, minutes }), tags: ['password-reset'] }));

const sendPasswordChangedEmail = define('password-changed', (user) => ({
  to: to(user),
  ...t.passwordChanged({
    name: user.name,
    when: new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Africa/Lagos' }) + ' (WAT)',
    url: `${frontendUrl()}/forgot-password`,
  }),
  tags: ['security'],
}));

const sendNewInquiryEmail = define('inquiry', ({ owner, property, sender, message }) => ({
  to: to(owner),
  ...t.newInquiry({
    ownerName: owner.name,
    propertyTitle: property.title,
    senderName: sender.name,
    preview: String(message).slice(0, 300),
    url: `${frontendUrl()}/dashboard?tab=messages`,
  }),
  tags: ['inquiry'],
}));

const sendListingStatusEmail = define('listing-status', ({ owner, property, approved }) => ({
  to: to(owner),
  ...t.listingStatus({
    ownerName: owner.name,
    propertyTitle: property.title,
    approved,
    url: approved ? `${frontendUrl()}/property/${property._id}` : `${frontendUrl()}/dashboard`,
  }),
  tags: ['listing-status'],
}));

module.exports = {
  frontendUrl, verifyLink, resetLink,
  sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendPasswordChangedEmail,
  sendNewInquiryEmail, sendListingStatusEmail,
};
