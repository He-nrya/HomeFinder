const router = require('express').Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Property = require('../models/Property');
const { protect, resolveUser, bearer } = require('../middleware/auth');
const { uploadBuffer, destroy } = require('../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 8 },
  fileFilter: (_, f, cb) => cb(null, f.mimetype.startsWith('image/')),
});
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// optional login so owners/admins can see their own pending listings
const viewer = async (req) => {
  try { return (await resolveUser(bearer(req))).user || null; } catch { return null; }
};

const body = (b) => {
  const out = {};
  ['title', 'description', 'category', 'type', 'nearby', 'university', 'distanceToCampus', 'contactPhone', 'whatsapp'].forEach((k) => { if (b[k] !== undefined) out[k] = b[k]; });
  ['price', 'bedrooms', 'bathrooms', 'parking'].forEach((k) => { if (b[k] !== undefined && b[k] !== '') out[k] = Number(b[k]); });
  if (b.features !== undefined) out.features = String(b.features).split(',').map((s) => s.trim()).filter(Boolean);
  if (b.address !== undefined) {
    out.location = { address: b.address, city: b.city || 'Abuja', lat: b.lat ? Number(b.lat) : undefined, lng: b.lng ? Number(b.lng) : undefined };
  }
  return out;
};

router.get('/', async (req, res, next) => {
  try {
    const { category, type, q, minPrice, maxPrice, bedrooms, university, sort = 'new', featured, page = 1, limit = 9 } = req.query;
    const f = { status: 'approved' };
    if (category) f.category = category;
    if (type) f.type = type;
    if (university) f.university = university;
    if (featured) f.featured = true;
    if (bedrooms) f.bedrooms = bedrooms === '4' ? { $gte: 4 } : Number(bedrooms);
    if (minPrice || maxPrice) f.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    if (q) { const r = new RegExp(esc(q), 'i'); f.$or = [{ title: r }, { 'location.address': r }, { 'location.city': r }, { university: r }]; }
    const sorts = { new: { createdAt: -1 }, 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, popular: { views: -1 } };
    const p = Math.max(1, Number(page)), l = Math.min(50, Number(limit));
    const [items, total] = await Promise.all([
      Property.find(f).sort(sorts[sort] || sorts.new).skip((p - 1) * l).limit(l),
      Property.countDocuments(f),
    ]);
    res.json({ items, total, page: p, pages: Math.ceil(total / l) });
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Property.find({ owner: req.user._id }).sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.get('/favorites', protect, async (req, res, next) => {
  try { res.json(await Property.find({ _id: { $in: req.user.favorites }, status: 'approved' })); } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const prop = await Property.findById(req.params.id).populate('owner', 'name phone accountType');
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    const u = await viewer(req);
    const canSee = prop.status === 'approved' || (u && (u.role === 'admin' || prop.owner._id.equals(u._id)));
    if (!canSee) return res.status(404).json({ message: 'Property not found' });
    if (prop.status === 'approved') { prop.views += 1; await prop.save(); }
    res.json(prop);
  } catch (e) { next(e); }
});

router.post('/', protect, upload.array('images', 8), async (req, res, next) => {
  try {
    const data = body(req.body);
    const images = await Promise.all((req.files || []).map((f) => uploadBuffer(f.buffer)));
    const auto = req.user.role === 'admin' || process.env.AUTO_APPROVE === 'true';
    const prop = await Property.create({
      ...data, images, owner: req.user._id,
      status: auto ? 'approved' : 'pending', verified: req.user.role === 'admin',
      whatsapp: data.whatsapp || data.contactPhone,
    });
    res.status(201).json(prop);
  } catch (e) { next(e); }
});

router.put('/:id', protect, upload.array('images', 8), async (req, res, next) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'admin' && !prop.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not your listing' });
    Object.assign(prop, body(req.body));
    if (req.body.removeImages) {
      const rm = JSON.parse(req.body.removeImages);
      await Promise.all(rm.map(destroy));
      prop.images = prop.images.filter((i) => !rm.includes(i.publicId));
    }
    const added = await Promise.all((req.files || []).map((f) => uploadBuffer(f.buffer)));
    prop.images.push(...added);
    if (req.user.role !== 'admin') prop.status = process.env.AUTO_APPROVE === 'true' ? 'approved' : 'pending';
    await prop.save();
    res.json(prop);
  } catch (e) { next(e); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'admin' && !prop.owner.equals(req.user._id)) return res.status(403).json({ message: 'Not your listing' });
    await Promise.all(prop.images.map((i) => destroy(i.publicId)));
    await prop.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

router.post('/:id/favorite', protect, async (req, res, next) => {
  try {
    const id = req.params.id;
    const has = req.user.favorites.some((f) => f.equals(id));
    req.user.favorites = has ? req.user.favorites.filter((f) => !f.equals(id)) : [...req.user.favorites, id];
    await req.user.save();
    res.json({ favorites: req.user.favorites });
  } catch (e) { next(e); }
});
module.exports = router;
