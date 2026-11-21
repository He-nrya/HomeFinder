const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const bearer = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
};
const resolveUser = async (token) => {
  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    return { user: user && !user.blocked ? user : null };
  } catch { return { user: null }; }
};
const protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    if (!h.startsWith('Bearer ')) return res.status(401).json({ message: 'Please log in' });
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || user.blocked) return res.status(401).json({ message: 'Account unavailable' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Session expired, please log in again' }); }
};
const adminOnly = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ message: 'Admins only' });
module.exports = { sign, protect, adminOnly, bearer, resolveUser };
