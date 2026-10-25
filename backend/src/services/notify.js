'use strict';
/**
 * Optional e-mail notifications via SMTP (real backend service; not faked in the browser).
 * Enabled only when SMTP_* env vars are set AND the admin turned notifications on in Settings.
 * WhatsApp notifications are NOT implemented (they need the WhatsApp Business API); the number
 * is stored in settings for future use.
 */
const env = require('../config/env');
const settings = require('../models/settings');

let transport; // undefined = not tried, null = unavailable
function getTransport() {
  if (transport !== undefined) return transport;
  transport = null;
  if (!env.smtp.host || !env.smtp.from) return null;
  try {
    const nodemailer = require('nodemailer');
    transport = nodemailer.createTransport({
      host: env.smtp.host, port: env.smtp.port, secure: env.smtp.secure,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
    });
  } catch (e) { console.warn('[notify] nodemailer not installed; e-mail disabled'); }
  return transport;
}

const line = (k, v) => (v ? `${k}: ${v}\n` : '');

async function newLead(kind, row) {
  try {
    const t = getTransport();
    if (!t) return;
    const s = (await settings.getAll()).lead;
    const enabled = kind === 'visit' ? s.notifyVisit : s.notifyEnquiry;
    if (enabled && s.email) {
      const body = kind === 'visit'
        ? line('Name', row.customer_name) + line('Phone', row.phone) + line('Email', row.email) + line('Property', row.property_title) +
          line('Date', row.preferred_date && String(row.preferred_date).slice(0, 10)) + line('Time', row.preferred_time) + line('Message', row.message)
        : line('Name', row.customer_name) + line('Phone', row.phone) + line('Email', row.email) + line('About', row.subject) + line('Message', row.message);
      await t.sendMail({ from: env.smtp.from, to: s.email, subject: kind === 'visit' ? 'New visit request' : 'New enquiry', text: body });
    }
    if (s.autoReply && row.email) {
      await t.sendMail({ from: env.smtp.from, to: row.email, subject: 'We received your request', text: s.autoReply });
    }
  } catch (e) { console.error('[notify] failed:', e.message); }
}

module.exports = { newLead };
