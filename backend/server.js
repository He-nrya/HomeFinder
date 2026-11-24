require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const User = require('./models/User');
const Message = require('./models/Message');
const Inquiry = require('./models/Inquiry');
const chatRoutes = require('./routes/chat');
const { resolveUser } = require('./middleware/auth');
const { handleNewMessage } = require('./services/inquiryNotifier');

// Fail fast with a clear message instead of crashing later with a confusing one.
['MONGODB_URI', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) { console.error(`Missing required environment variable: ${key}`); process.exit(1); }
});
if ((process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') && !process.env.BREVO_API_KEY) {
  console.error('WARNING: BREVO_API_KEY is not set - verification and password-reset emails will NOT be sent.');
}

const app = express();
const server = http.createServer(app);
const origins = (process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
const frontendDist = path.resolve(__dirname, '../frontend/dist');

app.set('trust proxy', 1); // Render sits behind a proxy (needed so rate limits see the real visitor IP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      scriptSrc: ["'self'", 'https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.google.com'],
      connectSrc: ["'self'", 'https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.google.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://res.cloudinary.com', 'https://*.googleapis.com', 'https://*.gstatic.com', 'https://*.google.com'],
    },
  },
}));
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_, res) => res.json({ ok: true }));
// Rate limits for the sensitive auth endpoints live inside routes/auth.js (middleware/rateLimiters.js),
// so ordinary calls such as /auth/me are not counted against them.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/chat', chatRoutes);

app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (error) => { if (error) next(error); });
});
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => { // eslint-disable-line
  console.error(err);
  const status = err.name === 'ValidationError' || err.name === 'MulterError' ? 400 : err.status || 500; // MulterError = e.g. photo too large
  res.status(status).json({ message: status === 500 ? 'Server error' : err.message });
});

/* ---------- Socket.io real-time chat ---------- */
const io = new Server(server, { cors: { origin: origins, credentials: true } });
io.use(async (socket, next) => {
  try {
    const r = await resolveUser(socket.handshake.auth?.token || '');
    if (!r.user) return next(new Error('unauthorized'));
    socket.user = r.user;
    socket.data.userId = String(r.user._id);
    next();
  } catch { next(new Error('unauthorized')); }
});
io.on('connection', (socket) => {
  socket.on('join', async (room, ack) => {
    if (await chatRoutes.canAccess(socket.user, room)) { socket.join(room); ack?.({ ok: true }); } else ack?.({ ok: false });
  });
  socket.on('message', async ({ room, text }, ack) => {
    try {
      text = String(text || '').trim().slice(0, 1000);
      if (!text || !socket.rooms.has(room)) return ack?.({ ok: false });
      const [property, enquirer] = room.split(':');
      const msg = await Message.create({ room, property, enquirer, sender: socket.user._id, senderName: socket.user.name, text });
      io.to(room).emit('message', msg);
      ack?.({ ok: true });

      // Email the property owner about a new enquiry (skipped if they are watching the chat right now).
      const inRoom = await io.in(room).fetchSockets();
      handleNewMessage({ room, sender: socket.user, text, onlineUserIds: inRoom.map((s) => s.data.userId) });
    } catch { ack?.({ ok: false }); }
  });
  socket.on('typing', ({ room }) => socket.to(room).emit('typing', { room, name: socket.user.name }));
});

// Accounts that existed before email verification was added are marked verified once, so nobody is locked out.
async function verifyExistingAccounts() {
  const r = await User.updateMany({ emailVerified: { $exists: false } }, { $set: { emailVerified: true } });
  if (r.modifiedCount) console.log(`Marked ${r.modifiedCount} existing account(s) as email-verified`);
}

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => Promise.all([User.init(), Inquiry.init()])) // make sure the unique indexes exist before serving traffic
  .then(verifyExistingAccounts)
  .then(() => server.listen(port, () => console.log(`API + sockets on :${port}`)))
  .catch((e) => { console.error('Startup failed:', e.message); process.exit(1); });
