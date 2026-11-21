const router = require('express').Router();
const Message = require('../models/Message');
const Property = require('../models/Property');
const { protect } = require('../middleware/auth');

const canAccess = async (user, room) => {
  const [propertyId, enquirerId] = String(room).split(':');
  if (!propertyId || !enquirerId) return false;
  if (user._id.equals(enquirerId) || user.role === 'admin') return true;
  const p = await Property.findById(propertyId).select('owner');
  return !!p && p.owner.equals(user._id);
};

router.get('/inbox', protect, async (req, res, next) => {
  try {
    const mine = await Property.find({ owner: req.user._id }).select('_id');
    const rooms = await Message.aggregate([
      { $match: req.user.role === 'admin' ? {} : { $or: [{ property: { $in: mine.map((p) => p._id) } }, { enquirer: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: '$room', property: { $first: '$property' }, last: { $first: '$text' }, at: { $first: '$createdAt' }, from: { $first: '$senderName' } } },
      { $sort: { at: -1 } }, { $limit: 50 },
    ]);
    const props = await Property.find({ _id: { $in: rooms.map((r) => r.property) } }).select('title');
    const titles = Object.fromEntries(props.map((p) => [p._id.toString(), p.title]));
    res.json(rooms.map((r) => ({ room: r._id, title: titles[r.property.toString()] || 'Property', last: r.last, from: r.from, at: r.at })));
  } catch (e) { next(e); }
});

router.get('/:room', protect, async (req, res, next) => {
  try {
    if (!(await canAccess(req.user, req.params.room))) return res.status(403).json({ message: 'Not allowed' });
    res.json(await Message.find({ room: req.params.room }).sort({ createdAt: 1 }).limit(200));
  } catch (e) { next(e); }
});
router.canAccess = canAccess;
module.exports = router;
