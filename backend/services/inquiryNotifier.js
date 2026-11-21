const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const mail = require('./email/notifications');

const COOLDOWN_MS = Number(process.env.INQUIRY_EMAIL_COOLDOWN_MIN || 15) * 60 * 1000;

// Atomically claims the right to send an email for this conversation.
// Two messages arriving at the same moment can't both get it.
async function claimSlot(room, propertyId, enquirerId) {
  const cutoff = new Date(Date.now() - COOLDOWN_MS);
  try {
    await Inquiry.findOneAndUpdate(
      { room, $or: [{ lastNotifiedAt: { $exists: false } }, { lastNotifiedAt: { $lt: cutoff } }] },
      { $set: { lastNotifiedAt: new Date(), property: propertyId, enquirer: enquirerId }, $inc: { notifiedCount: 1 } },
      { upsert: true, new: true },
    );
    return true;
  } catch (e) {
    if (e && e.code === 11000) return false; // the conversation exists and was emailed recently
    throw e;
  }
}

// Called after every saved chat message. Emails the property owner when a visitor writes to them.
async function handleNewMessage({ room, sender, text, onlineUserIds = [] }) {
  try {
    const [propertyId, enquirerId] = String(room).split(':');
    if (!sender._id.equals(enquirerId)) return; // owner replies don't trigger an enquiry email
    const property = await Property.findById(propertyId).populate('owner', 'name email blocked emailVerified');
    const owner = property && property.owner;
    if (!owner || owner.blocked || !owner.emailVerified) return;
    if (owner._id.equals(sender._id)) return; // writing to yourself
    if (onlineUserIds.includes(String(owner._id))) return; // owner is in the chat right now and sees it live

    if (!(await claimSlot(room, property._id, sender._id))) return;
    const sent = await mail.sendNewInquiryEmail({ owner, property, sender, message: text });
    if (!sent) await Inquiry.updateOne({ room }, { $unset: { lastNotifiedAt: '' } }); // let the next message retry
  } catch (e) {
    console.error('[inquiry-notify] failed:', e.message);
  }
}

module.exports = { handleNewMessage };
