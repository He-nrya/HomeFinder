const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sign, protect } = require('../middleware/auth');
const rl = require('../middleware/rateLimiters');
const { createToken, sha256, isTokenShape } = require('../utils/tokens');
const { str, normEmail, isEmail, isPhone, passwordProblem } = require('../utils/validate');
const mail = require('../services/email/notifications');

const VERIFY_MINUTES = 24 * 60; // verification link lifetime
const RESET_MINUTES = 60;       // password-reset link lifetime
const COOLDOWN_MS = 60 * 1000;  // minimum gap between two emails to the same person
const ACCOUNT_TYPES = User.schema.path('accountType').enumValues;
// Used so a login for an unknown email takes as long as a real one (no account-guessing by timing).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

const clean = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, accountType: u.accountType, role: u.role, favorites: u.favorites, emailVerified: u.emailVerified });
const coolingDown = (date) => !!date && Date.now() - date.getTime() < COOLDOWN_MS;
const logFail = (label) => (e) => console.error(`[auth:${label}]`, e.message);

async function sendVerification(user) {
  const token = createToken(VERIFY_MINUTES);
  await User.updateOne({ _id: user._id }, { $set: { verifyTokenHash: token.hash, verifyTokenExpires: token.expires, verifySentAt: new Date() } });
  return mail.sendVerificationEmail(user, mail.verifyLink(token.raw), VERIFY_MINUTES / 60);
}

async function sendReset(user) {
  const token = createToken(RESET_MINUTES);
  // A new request replaces the previous token, so only the newest link ever works.
  await User.updateOne({ _id: user._id }, { $set: { resetTokenHash: token.hash, resetTokenExpires: token.expires, resetSentAt: new Date() } });
  return mail.sendPasswordResetEmail(user, mail.resetLink(token.raw), RESET_MINUTES);
}

// ---------- sign up ----------
router.post('/signup', rl.signup, async (req, res, next) => {
  try {
    const b = req.body || {};
    const name = str(b.name, 80);
    const email = normEmail(b.email);
    const phone = str(b.phone, 30);
    const accountType = str(b.accountType, 30);
    const problem =
      name.length < 2 ? 'Please enter your full name'
        : !isEmail(email) ? 'Please enter a valid email address'
          : !isPhone(phone) ? 'Please enter a valid phone number'
            : !ACCOUNT_TYPES.includes(accountType) ? 'Please choose an account type'
              : passwordProblem(b.password);
    if (problem) return res.status(400).json({ message: problem });

    let user = await User.findOne({ email });
    if (user && (user.emailVerified || user.blocked)) {
      return res.status(409).json({ message: 'An account with this email already exists. Try logging in.', code: 'EMAIL_EXISTS' });
    }
    if (user) {
      // The email was registered but never verified, so nobody legitimately owns it yet.
      // Let this sign-up replace the details: a stranger's earlier attempt must not leave
      // a password they chose on an account the real owner is about to verify.
      user.set({ name, phone, accountType, password: b.password });
      await user.save();
    } else {
      user = await User.create({ name, email, phone, accountType, password: b.password, emailVerified: false });
    }

    const emailSent = await sendVerification(user);
    // No token is returned: the user must verify before they can log in.
    res.status(201).json({ message: 'Account created. Check your email to verify your address.', email, emailSent });
  } catch (e) {
    if (e && e.code === 11000) return res.status(409).json({ message: 'An account with this email already exists. Try logging in.', code: 'EMAIL_EXISTS' });
    next(e);
  }
});

// ---------- verify email (POST so email scanners that only *open* links can't use up the token) ----------
router.post('/verify-email', rl.verify, async (req, res, next) => {
  try {
    const token = (req.body || {}).token;
    const invalid = { message: 'This verification link is invalid, has expired, or was already used. If you have already verified, just log in.', code: 'TOKEN_INVALID' };
    if (!isTokenShape(token)) return res.status(400).json(invalid);

    // One atomic step: find the matching, unexpired token AND consume it. Two clicks can't both succeed.
    const user = await User.findOneAndUpdate(
      { verifyTokenHash: sha256(token), verifyTokenExpires: { $gt: new Date() }, emailVerified: false },
      { $set: { emailVerified: true }, $unset: { verifyTokenHash: '', verifyTokenExpires: '' } },
      { new: true },
    );
    if (!user) return res.status(400).json(invalid);

    mail.sendWelcomeEmail(user); // runs in the background; never rejects
    res.json({ message: 'Email verified. You can now log in.' });
  } catch (e) { next(e); }
});

// ---------- resend verification email ----------
router.post('/resend-verification', rl.resend, rl.resendByEmail, async (req, res, next) => {
  try {
    const email = normEmail((req.body || {}).email);
    if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
    const user = await User.findOne({ email });
    if (user && !user.emailVerified && !user.blocked && !coolingDown(user.verifySentAt)) {
      sendVerification(user).catch(logFail('resend')); // background: same response time whether or not the account exists
    }
    // Same answer in every case, so this endpoint can't be used to find out who has an account.
    res.json({ message: 'If that email belongs to an account that still needs verifying, we have sent a new link. Check your inbox and spam folder.' });
  } catch (e) { next(e); }
});

// ---------- login ----------
router.post('/login', rl.login, rl.loginByEmail, async (req, res, next) => {
  try {
    const b = req.body || {};
    const email = normEmail(b.email);
    const password = typeof b.password === 'string' ? b.password : '';
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    const passwordOk = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !passwordOk) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.blocked) return res.status(403).json({ message: 'This account has been suspended' });
    if (!user.emailVerified) {
      // Only revealed after the password is correct, so strangers learn nothing.
      return res.status(403).json({ message: 'Please verify your email address before logging in.', code: 'EMAIL_NOT_VERIFIED', email: user.email });
    }
    res.json({ token: sign(user._id), user: clean(user) });
  } catch (e) { next(e); }
});

// ---------- forgot password ----------
router.post('/forgot-password', rl.forgot, rl.forgotByEmail, async (req, res, next) => {
  try {
    const email = normEmail((req.body || {}).email);
    if (!isEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address' });
    const user = await User.findOne({ email });
    if (user && !user.blocked && !coolingDown(user.resetSentAt)) {
      sendReset(user).catch(logFail('forgot'));
    }
    res.json({ message: 'If an account exists for that email, we have sent a password reset link. It expires in 60 minutes.' });
  } catch (e) { next(e); }
});

// ---------- reset password ----------
router.post('/reset-password', rl.reset, async (req, res, next) => {
  try {
    const { token, password } = req.body || {};
    const invalid = { message: 'This reset link is invalid, has expired, or was already used. Please request a new one.', code: 'TOKEN_INVALID' };
    if (!isTokenShape(token)) return res.status(400).json(invalid);
    const problem = passwordProblem(password);
    if (problem) return res.status(400).json({ message: problem });

    const hashed = await bcrypt.hash(password, 12);
    // Atomic and single-use: the token is matched, checked for expiry and consumed in one step.
    // Receiving the email also proves the mailbox is theirs, so the account counts as verified.
    const before = await User.findOneAndUpdate(
      { resetTokenHash: sha256(token), resetTokenExpires: { $gt: new Date() } },
      {
        $set: { password: hashed, passwordChangedAt: new Date(), emailVerified: true },
        $unset: { resetTokenHash: '', resetTokenExpires: '', verifyTokenHash: '', verifyTokenExpires: '' },
      },
      { new: false }, // returns the account as it was, so we know if it was unverified
    );
    if (!before) return res.status(400).json(invalid);

    mail.sendPasswordChangedEmail(before);
    if (!before.emailVerified) mail.sendWelcomeEmail(before);
    res.json({ message: 'Password updated. You can now log in with your new password.' });
  } catch (e) { next(e); }
});

// ---------- current user ----------
router.get('/me', protect, (req, res) => res.json({ user: clean(req.user) }));

router.put('/me', protect, async (req, res, next) => {
  try {
    const name = str((req.body || {}).name, 80);
    const phone = str((req.body || {}).phone, 30);
    if (name) req.user.name = name;
    if (phone) {
      if (!isPhone(phone)) return res.status(400).json({ message: 'Please enter a valid phone number' });
      req.user.phone = phone;
    }
    await req.user.save();
    res.json({ user: clean(req.user) });
  } catch (e) { next(e); }
});

module.exports = router;
