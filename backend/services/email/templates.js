// Branded HTML + plain-text email templates. Every template returns { subject, html, text }.
// To add a new email: write a template here, then add one line in notifications.js.
const BRAND = { green: '#14532d', gold: '#f59e0b', soft: '#eaf5ee', ink: '#17151a', text: '#26352f', muted: '#6b7a73' };

// Everything that comes from a user (names, property titles, chat messages) is escaped,
// so nobody can inject HTML or links into an email we send.
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';

const p = (html) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${BRAND.text};">${html}</p>`;
const button = (label, url) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="border-radius:8px;background:${BRAND.green};">
      <a href="${esc(url)}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${esc(label)}</a>
    </td></tr>
  </table>`;
const linkFallback = (url) => `
  <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${BRAND.muted};">If the button doesn't work, copy and paste this link into your browser:</p>
  <p style="margin:0 0 16px;font-size:12px;line-height:1.6;word-break:break-all;"><a href="${esc(url)}" style="color:${BRAND.green};">${esc(url)}</a></p>`;

function layout({ preheader, heading, body, footer }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8fb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="background:${BRAND.green};border-radius:14px 14px 0 0;padding:22px 28px;text-align:center;">
          <span style="font-size:26px;font-weight:bold;letter-spacing:-0.5px;color:#ffffff;">Home<span style="color:${BRAND.gold};">Finder</span></span>
        </td></tr>
        <tr><td style="background:#ffffff;padding:32px 28px 12px;border-left:1px solid #e9ecef;border-right:1px solid #e9ecef;">
          <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:${BRAND.green};">${esc(heading)}</h1>
          ${body}
        </td></tr>
        <tr><td style="background:#ffffff;padding:0 28px 28px;border:1px solid #e9ecef;border-top:0;border-radius:0 0 14px 14px;">
          <div style="border-top:3px solid ${BRAND.gold};width:48px;margin:8px 0 16px;"></div>
          <p style="margin:0;font-size:12px;line-height:1.6;color:${BRAND.muted};">${footer || 'You are receiving this email because of activity on your HomeFinder account.'}</p>
        </td></tr>
        <tr><td style="padding:16px 8px;text-align:center;font-size:11px;color:${BRAND.muted};">&copy; ${new Date().getFullYear()} HomeFinder. All rights reserved.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

const verifyEmail = ({ name, url, hours }) => ({
  subject: 'Verify your email to activate your HomeFinder account',
  html: layout({
    preheader: 'One click to activate your account.',
    heading: `Welcome, ${esc(firstName(name))}!`,
    body: p('Thanks for joining HomeFinder. Please confirm your email address to activate your account.')
      + button('Verify my email', url)
      + p(`This link works for <strong>${esc(hours)} hours</strong> and can be used once.`)
      + linkFallback(url),
    footer: "If you didn't create a HomeFinder account, you can safely ignore this email - nothing will happen.",
  }),
  text: `Welcome to HomeFinder, ${firstName(name)}!\n\nConfirm your email to activate your account:\n${url}\n\nThis link works for ${hours} hours and can be used once.\nIf you didn't create an account, ignore this email.`,
});

const welcome = ({ name, url }) => ({
  subject: `Welcome to HomeFinder, ${firstName(name)}!`,
  html: layout({
    preheader: 'Your email is verified - start exploring homes.',
    heading: `You're all set, ${esc(firstName(name))}!`,
    body: p('Your email is verified and your HomeFinder account is ready. Here is what you can do:')
      + `<ul style="margin:0 0 8px;padding-left:20px;font-size:15px;line-height:1.9;color:${BRAND.text};">
          <li>Browse homes to <strong>buy</strong>, <strong>rent</strong> or student accommodation near your campus</li>
          <li>Save favourites and see every property on the map</li>
          <li>Chat live with owners, or reach them on WhatsApp</li>
          <li>List your own property in minutes</li>
        </ul>`
      + button('Start exploring', url),
  }),
  text: `You're all set, ${firstName(name)}!\n\nYour email is verified and your HomeFinder account is ready.\nStart exploring: ${url}`,
});

const passwordReset = ({ name, url, minutes }) => ({
  subject: 'Reset your HomeFinder password',
  html: layout({
    preheader: 'Use this link to choose a new password.',
    heading: 'Reset your password',
    body: p(`Hi ${esc(firstName(name))}, we received a request to reset the password for your HomeFinder account.`)
      + button('Choose a new password', url)
      + p(`This link expires in <strong>${esc(minutes)} minutes</strong> and can be used once.`)
      + linkFallback(url),
    footer: "If you didn't ask for this, you can ignore this email - your password will stay the same.",
  }),
  text: `Hi ${firstName(name)},\n\nWe received a request to reset your HomeFinder password.\nChoose a new password: ${url}\n\nThis link expires in ${minutes} minutes and can be used once.\nIf you didn't ask for this, ignore this email.`,
});

const passwordChanged = ({ name, when, url }) => ({
  subject: 'Your HomeFinder password was changed',
  html: layout({
    preheader: 'Security notice: your password was just changed.',
    heading: 'Your password was changed',
    body: p(`Hi ${esc(firstName(name))}, this is a confirmation that the password for your HomeFinder account was changed on <strong>${esc(when)}</strong>.`)
      + p('All devices were signed out. If this was you, no action is needed.')
      + p("<strong>Didn't do this?</strong> Reset your password right away so only you have access:")
      + button('Secure my account', url),
    footer: 'This is a security notice sent to the email address on your account.',
  }),
  text: `Hi ${firstName(name)},\n\nYour HomeFinder password was changed on ${when}. All devices were signed out.\nIf this was you, no action is needed.\nIf it wasn't, reset your password now: ${url}`,
});

const newInquiry = ({ ownerName, propertyTitle, senderName, preview, url }) => ({
  subject: `New enquiry about "${String(propertyTitle).slice(0, 60)}"`,
  html: layout({
    preheader: `${firstName(senderName)} sent you a message about your property.`,
    heading: 'You have a new enquiry',
    body: p(`Hi ${esc(firstName(ownerName))}, <strong>${esc(senderName)}</strong> is interested in your property <strong>${esc(propertyTitle)}</strong>.`)
      + `<blockquote style="margin:0 0 16px;padding:12px 16px;background:${BRAND.soft};border-left:4px solid ${BRAND.gold};font-size:14px;line-height:1.7;color:${BRAND.text};">${esc(preview)}</blockquote>`
      + button('Reply on HomeFinder', url)
      + p('Quick replies lead to more serious buyers and tenants.'),
    footer: 'You get this email because someone messaged you about one of your listings. We send at most one email per conversation every 15 minutes.',
  }),
  text: `Hi ${firstName(ownerName)},\n\n${senderName} is interested in "${propertyTitle}":\n\n"${preview}"\n\nReply on HomeFinder: ${url}`,
});

const listingStatus = ({ ownerName, propertyTitle, approved, url }) => ({
  subject: approved ? `Your listing "${String(propertyTitle).slice(0, 60)}" is now live` : `Update on your listing "${String(propertyTitle).slice(0, 60)}"`,
  html: layout({
    preheader: approved ? 'Your property is now visible to everyone.' : 'Your listing needs changes before it can go live.',
    heading: approved ? 'Your listing is live' : 'Your listing was not approved',
    body: approved
      ? p(`Good news, ${esc(firstName(ownerName))}! <strong>${esc(propertyTitle)}</strong> has been approved and is now visible to buyers and tenants.`) + button('View my listing', url)
      : p(`Hi ${esc(firstName(ownerName))}, we could not approve <strong>${esc(propertyTitle)}</strong> yet. Please check that the photos, price and description are accurate, then edit and resubmit it.`) + button('Edit my listing', url),
  }),
  text: approved
    ? `Good news, ${firstName(ownerName)}! "${propertyTitle}" is now live: ${url}`
    : `Hi ${firstName(ownerName)}, we could not approve "${propertyTitle}" yet. Please review and resubmit it: ${url}`,
});

module.exports = { esc, verifyEmail, welcome, passwordReset, passwordChanged, newInquiry, listingStatus };
