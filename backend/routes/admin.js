const router = require('express').Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Message = require('../models/Message');
const { destroy } = require('../config/cloudinary');
const mail = require('../services/email/notifications');
const { protect, adminOnly } = require('../middleware/auth');
router.use(protect, adminOnly);

router.get('/stats', async (_, res, next) => {
  try {
    const [users, properties, pending, messages, byCategory, recent] = await Promise.all([
      User.countDocuments(), Property.countDocuments(), Property.countDocuments({ status: 'pending' }), Message.countDocuments(),
      Property.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email accountType createdAt'),
    ]);
    res.json({ users, properties, pending, messages, byCategory, recent });
  } catch (e) { next(e); }
});

router.get('/users', async (_, res, next) => { try { res.json(await User.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.put('/users/:id', async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'User not found' });
    if (u._id.equals(req.user._id)) return res.status(400).json({ message: "You can't change your own account here" });
    if (req.body.blocked !== undefined) u.blocked = !!req.body.blocked;
    if (['user', 'admin'].includes(req.body.role)) u.role = req.body.role;
    await u.save(); res.json(u);
  } catch (e) { next(e); }
});
router.delete('/users/:id', async (req, res, next) => {
  try {
    if (req.user._id.equals(req.params.id)) return res.status(400).json({ message: "You can't delete yourself" });
    const props = await Property.find({ owner: req.params.id });
    await Promise.all(props.flatMap((p) => p.images.map((i) => destroy(i.publicId))));
    await Property.deleteMany({ owner: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and their listings deleted' });
  } catch (e) { next(e); }
});

router.get('/properties', async (req, res, next) => {
  try {
    const f = req.query.status ? { status: req.query.status } : {};
    res.json(await Property.find(f).sort({ createdAt: -1 }).populate('owner', 'name email'));
  } catch (e) { next(e); }
});
router.put('/properties/:id', async (req, res, next) => {
  try {
    const p = await Property.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Property not found' });
    const previousStatus = p.status;
    ['status', 'verified', 'featured'].forEach((k) => { if (req.body[k] !== undefined) p[k] = req.body[k]; });
    await p.save();
    if (p.status !== previousStatus && ['approved', 'rejected'].includes(p.status)) {
      const owner = await User.findById(p.owner).select('name email');
      if (owner) mail.sendListingStatusEmail({ owner, property: p, approved: p.status === 'approved' }); // background, never throws
    }
    res.json(p);
  } catch (e) { next(e); }
});
module.exports = router;
