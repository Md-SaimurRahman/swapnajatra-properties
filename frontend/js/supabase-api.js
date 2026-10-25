/* Swapnajatra — Supabase API shim v1
 * The website and admin panel were written to talk to "/api/...". This file answers those
 * calls with Supabase instead, so the design and the rest of the code stay exactly the same.
 * Needs: supabase-js (loaded before), window.SWP_SUPABASE = { url, key } (supabase-config.js).
 */
(function () {
  'use strict';
  var CFG = window.SWP_SUPABASE;
  if (!CFG || !CFG.url || !CFG.key || !window.supabase) { console.error('[swp] Supabase is not configured'); return; }
  var realFetch = window.fetch.bind(window);
  var sb = window.supabase.createClient(CFG.url, CFG.key, {
    global: { fetch: realFetch },
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'swp-admin-auth' }
  });
  var BUCKET = 'uploads';
  var PUBLIC_BASE = CFG.url.replace(/\/$/, '') + '/storage/v1/object/public/' + BUCKET + '/';
  var DEF = {"SETTINGS":{"company":{"name":"SWAPNAJATRA PROPERTIES LTD.","tagline":"HONESTY • EFFICIENCY • TRUST","address":"Kohinoor Tower-03, Road #7\nHouse #7-SW(E), 3rd Floor\nGulshan-1, Dhaka","email":"","phone1":"01310 094 907","phone2":"01726 191 921","phone3":"01870 763 179","hours":""},"social":{"whatsapp":"8801310094907","facebook":"","linkedin":"","youtube":"","maps":""},"brand":{"title":"Swapnajatra Properties Ltd.","logo":"","favicon":"","defaultImage":""},"prefs":{"lang":"en","theme":"light","showWa":true,"showMenu":true},"prop":{"listing":"buy","type":"","perPage":12,"featured":true,"sold":true,"rented":true},"lead":{"email":"","waNumber":"","notifyEnquiry":false,"notifyVisit":false,"autoReply":""},"site":{"status":"online","message":"Our website is under maintenance. Please check back soon."}},"CONTENT":{"hero_heading":["Property Decisions Made With Confidence.","আপনার মনের মতো একটি ঠিকানা খুঁজে নিন।"],"hero_subtitle":["From residential and commercial land to flats, joint-venture development, land-share construction and property management — Swapnajatra Properties Ltd. provides practical real-estate solutions with professionalism, transparency and trust.","স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড আপনাকে জমি, ফ্ল্যাট ও যৌথ উদ্যোগ প্রকল্প কেনা-বেচা ও নির্মাণে সাহায্য করে — স্বচ্ছ কাগজপত্র ও সৎ পরামর্শসহ।"],"hero_button":["Explore properties","প্রপার্টি দেখুন"],"hc_reg":["C-213667",""],"hc_reg_note":["Registrar of Joint Stock Companies (Companies Act, 1994)","যৌথ মূলধনী কোম্পানি ও ফার্মসমূহের নিবন্ধক (কোম্পানি আইন, ১৯৯৪)"],"hc_tin":["122113154693",""],"hc_tin_note":["National Board of Revenue","জাতীয় রাজস্ব বোর্ড"],"hc_lic":["TRAD/DNCC/015629/2026",""],"hc_lic_note":["Dhaka North City Corporation · valid till 30 Jun 2027","ঢাকা উত্তর সিটি কর্পোরেশন · ৩০ জুন ২০২৭ পর্যন্ত বৈধ"],"hc_inc":["01 September 2026","০১ সেপ্টেম্বর ২০২৬"],"hc_inc_note":["Private limited by shares","শেয়ারভিত্তিক প্রাইভেট লিমিটেড"],"hero_image":["",""],"emi_image":["",""],"emi_eyebrow":["",""],"emi_heading":["",""],"emi_subtitle":["",""],"contact_image":["",""],"contact_subtitle":["",""],"contact_location":["",""],"contact_support":["",""],"properties_image":["",""],"properties_eyebrow":["",""],"properties_heading":["",""],"properties_subtitle":["",""],"services_image":["",""],"board_image":["",""],"about_heading":["",""],"about_description":["",""],"about_image":["",""],"owner_name":["Md. Helal Uddin","মোঃ হেলাল উদ্দিন"],"owner_title":["Chairman","চেয়ারম্যান"],"owner_message":["",""],"owner_image":["",""],"land_image":["",""],"services_heading":["Real-estate solutions under one trusted roof.",""],"services_description":["From buying and selling to development, land consultancy and ongoing property care — our core services are built around practical support and clear communication.",""],"footer_description":["Honesty · Efficiency · Trust","সততা · দক্ষতা · বিশ্বাস"],"footer_copyright":["© 2026 Swapnajatra Properties Ltd. All rights reserved.","© ২০২৬ স্বপ্নযাত্রা প্রপার্টিজ লিমিটেড। সর্বস্বত্ব সংরক্ষিত।"]},"IMG":["hero_image","about_image","owner_image","land_image","board_image","services_image","properties_image","contact_image","emi_image"],"IMGS":{"brand":["logo","favicon","defaultImage"]}};

  /* ---------- small helpers ---------- */
  function HttpErr(status, msg, details) { var e = new Error(msg); e.status = status; e.details = details; return e; }
  function bad(errors) { return HttpErr(400, 'Validation failed', errors); }
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  /* "/uploads/abc.jpg" (old local path) -> full public Supabase URL. Applied to every response. */
  var OLD = /^\/uploads\/([A-Za-z0-9._-]+)$/;
  function fixUrls(v) {
    if (typeof v === 'string') { var m = OLD.exec(v); return m ? PUBLIC_BASE + m[1] : v; }
    if (Array.isArray(v)) return v.map(fixUrls);
    if (v && typeof v === 'object') { var o = {}; for (var k in v) o[k] = fixUrls(v[k]); return o; }
    return v;
  }
  function ownFile(url) {            // name of a file we uploaded to our bucket, else null
    if (typeof url !== 'string') return null;
    var s = fixUrls(url);
    if (s.indexOf(PUBLIC_BASE) !== 0) return null;
    var n = s.slice(PUBLIC_BASE.length);
    return /^[A-Za-z0-9._-]+$/.test(n) ? n : null;
  }
  async function removeFiles(urls) {
    var names = (urls || []).map(ownFile).filter(Boolean);
    if (names.length) { try { await sb.storage.from(BUCKET).remove(names); } catch (e) { /* ignore */ } }
  }
  var removedBetween = function (before, after) { var a = (after || []).map(fixUrls); return (before || []).filter(function (u) { return a.indexOf(fixUrls(u)) < 0; }); };

  function slugify(s) {
    var b = String(s || '').toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{M}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 80);
    return b || 'item';
  }
  async function uniqueSlug(table, title) {
    var base = slugify(title), slug = base, n = 1;
    for (;;) {
      var r = await sb.from(table).select('id').eq('slug', slug).limit(1);
      if (r.error) throw dbErr(r.error);
      if (!r.data.length) return slug;
      slug = base + '-' + (++n);
    }
  }
  function dbErr(e) {
    var msg = (e && e.message) || 'Request failed';
    if (e && (e.code === 'PGRST301' || e.code === 'PGRST303' || /JWT/i.test(msg))) return HttpErr(401, 'Session expired. Please log in again.');
    if (e && e.code === '42501') return HttpErr(403, 'You do not have permission for this.');
    if (/too_many/.test(msg)) return HttpErr(429, 'Too many submissions. Please try again later or call us.');
    if (/invalid_/.test(msg)) return HttpErr(400, 'Please check the details you entered.');
    return HttpErr(500, msg);
  }
  async function need(q) { var r = await q; if (r.error) throw dbErr(r.error); return r; }

  /* ---------- validator (same rules as the old backend) ---------- */
  var CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/, BD_PHONE = /^(\+?88)?01[3-9]\d{8}$/, DATE = /^\d{4}-\d{2}-\d{2}$/;
  var text = function (v) { return String(v).replace(CTRL, '').trim(); };
  function isSafeUrl(v, rel) {
    if (rel && /^\/uploads\/[A-Za-z0-9._-]+$/.test(v)) return true;
    try { var u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch (_) { return false; }
  }
  function one(v, r, key, errors) {
    var s;
    switch (r.type) {
      case 'str':
        if (typeof v !== 'string' && typeof v !== 'number') { errors[key] = 'Must be text'; return; }
        s = text(v); var max = r.max || 500;
        if (s.length > max) { errors[key] = 'Max ' + max + ' characters'; return; }
        if (r.min && s.length < r.min) { errors[key] = r.min === 1 ? 'Required' : 'Min ' + r.min + ' characters'; return; }
        return s;
      case 'int': case 'num':
        if (v === '' || v === null) return r.default !== undefined ? r.default : 0;
        var n = Number(v);
        if (!isFinite(n) || (r.type === 'int' && Math.floor(n) !== n)) { errors[key] = 'Must be a number'; return; }
        if (r.min !== undefined && n < r.min) { errors[key] = 'Min ' + r.min; return; }
        if (r.max !== undefined && n > r.max) { errors[key] = 'Max ' + r.max; return; }
        return n;
      case 'bool':
        if (v === true || v === 'true' || v === 1 || v === '1') return true;
        if (v === false || v === 'false' || v === 0 || v === '0') return false;
        errors[key] = 'Must be true or false'; return;
      case 'enum': s = text(v); if (r.values.indexOf(s) < 0) { errors[key] = 'Invalid value'; return; } return s;
      case 'strarr':
        if (!Array.isArray(v)) { errors[key] = 'Must be a list'; return; }
        if (v.length > (r.maxItems || 50)) { errors[key] = 'Max ' + (r.maxItems || 50) + ' items'; return; }
        var out = [];
        for (var i = 0; i < v.length; i++) {
          if (typeof v[i] !== 'string') { errors[key] = 'Must be a list of text'; return; }
          s = text(v[i]); if (!s) continue;
          if (s.length > (r.itemMax || 200)) { errors[key] = 'An item is too long'; return; }
          if (r.urls && !isSafeUrl(s, true)) { errors[key] = 'Invalid image URL'; return; }
          out.push(s);
        }
        return out;
      case 'email': s = text(v); if (s && (!EMAIL.test(s) || s.length > 254)) { errors[key] = 'Invalid email address'; return; } return s;
      case 'phone': s = text(v); if (!BD_PHONE.test(s.replace(/[\s-]/g, ''))) { errors[key] = 'Enter a valid Bangladeshi mobile number'; return; } return s;
      case 'url': case 'img':
        s = text(v);
        if (s.length > 1000) { errors[key] = 'Too long'; return; }
        if (s && !isSafeUrl(s, r.type === 'img')) { errors[key] = 'Must be a valid http(s) URL'; return; }
        return s;
      case 'date': s = text(v); if (!DATE.test(s) || isNaN(Date.parse(s + 'T00:00:00Z'))) { errors[key] = 'Invalid date (YYYY-MM-DD)'; return; } return s;
    }
    errors[key] = 'Unsupported type';
  }
  function clean(input, schema, partial) {
    var data = {}, errors = {}, src = input && typeof input === 'object' ? input : {};
    Object.keys(schema).forEach(function (key) {
      var r = schema[key], v = src[key];
      if (v === undefined) { if (r.required && !partial) errors[key] = 'Required'; return; }
      if ((v === null || v === '') && !r.required && r.type === 'enum') return;
      if ((v === null || v === '') && !r.required && r.type !== 'bool' && r.type !== 'int' && r.type !== 'num' && r.type !== 'strarr') { data[key] = ''; return; }
      if (r.type === 'str' && r.required && !r.min) r = Object.assign({}, r, { min: 1 });
      var out = one(v, r, key, errors);
      if (out !== undefined && !errors[key]) data[key] = out;
    });
    return { ok: !Object.keys(errors).length, data: data, errors: errors };
  }

  /* ---------- table definitions (same fields as the old backend) ---------- */
  var CTA = /^(#[A-Za-z0-9_-]*|https?:\/\/.+)$/;
  var T = {
    properties: { table: 'properties', files: ['images'], slug: true, search: ['title', 'location', 'address'],
      filters: { listing_type: 1, property_type: 1, status: 1, publish_status: 1, featured: 'bool' }, order: [['created_at', false]],
      schema: {
        title: { type: 'str', required: true, max: 200 }, property_type: { type: 'str', required: true, max: 60 },
        listing_type: { type: 'enum', required: true, values: ['buy', 'rent'] }, location: { type: 'str', required: true, max: 120 },
        address: { type: 'str', max: 300 }, price: { type: 'num', min: 0, max: 100000000000 }, discount_percent: { type: 'num', min: 0, max: 99 },
        area: { type: 'int', min: 0, max: 10000000 }, bedrooms: { type: 'int', min: 0, max: 100 }, bathrooms: { type: 'int', min: 0, max: 100 },
        description: { type: 'str', max: 5000 }, features: { type: 'strarr', maxItems: 40, itemMax: 60 },
        images: { type: 'strarr', maxItems: 20, itemMax: 1000, urls: true }, status: { type: 'enum', values: ['Available', 'Sold', 'Rented'] },
        publish_status: { type: 'enum', values: ['draft', 'published'] }, featured: { type: 'bool' } } },
    projects: { table: 'projects', files: ['images'], slug: true, search: ['title', 'location'],
      filters: { status: 1, publish_status: 1 }, order: [['sort_order', true], ['created_at', false]],
      schema: {
        title: { type: 'str', required: true, max: 200 }, location: { type: 'str', max: 200 }, description: { type: 'str', max: 5000 },
        images: { type: 'strarr', maxItems: 20, itemMax: 1000, urls: true }, status: { type: 'enum', values: ['Upcoming', 'Ongoing', 'Completed'] },
        project_type: { type: 'str', max: 80 }, publish_status: { type: 'enum', values: ['draft', 'published'] }, sort_order: { type: 'int', min: 0, max: 100000 } } },
    services: { table: 'services', files: ['image'], search: ['title', 'description'], filters: { status: 1 }, order: [['sort_order', true], ['id', true]],
      schema: {
        title: { type: 'str', required: true, max: 200 }, title_bn: { type: 'str', max: 300 }, description: { type: 'str', max: 1000 },
        description_bn: { type: 'str', max: 1000 }, image: { type: 'img' }, icon: { type: 'str', max: 16 }, cta_label: { type: 'str', max: 80 },
        cta_label_bn: { type: 'str', max: 80 }, cta_href: { type: 'str', max: 300 }, status: { type: 'enum', values: ['active', 'disabled'] },
        sort_order: { type: 'int', min: 0, max: 100000 } }, extra: function (d, errors) { if (d.cta_href && !CTA.test(d.cta_href)) errors.cta_href = 'Use #section or an http(s) link'; } },
    team: { table: 'team_members', files: ['photo'], search: ['name', 'role'], filters: { status: 1 }, order: [['sort_order', true], ['id', true]],
      schema: {
        name: { type: 'str', required: true, max: 150 }, name_bn: { type: 'str', max: 200 }, role: { type: 'str', max: 120 }, role_bn: { type: 'str', max: 160 },
        photo: { type: 'img' }, status: { type: 'enum', values: ['active', 'hidden'] }, sort_order: { type: 'int', min: 0, max: 100000 } } },
    enquiries: { table: 'enquiries', lead: ['New', 'Contacted', 'Completed', 'Archived'], search: ['customer_name', 'phone', 'email', 'subject', 'message'],
      filters: { status: 1, source: 1 }, order: [['created_at', false]] },
    'visit-requests': { table: 'visit_requests', lead: ['New', 'Confirmed', 'Completed', 'Cancelled'], search: ['customer_name', 'phone', 'email', 'property_title'],
      filters: { status: 1 }, order: [['created_at', false]] }
  };
  var ENQ = {
    customer_name: { type: 'str', required: true, min: 2, max: 100 }, phone: { type: 'phone', required: true }, email: { type: 'email' },
    subject: { type: 'str', max: 200 }, source: { type: 'enum', values: ['contact', 'list_property', 'property'] }, message: { type: 'str', required: true, min: 2, max: 2000 } };
  var VIS = {
    customer_name: { type: 'str', required: true, min: 2, max: 100 }, phone: { type: 'phone', required: true }, email: { type: 'email' },
    property_title: { type: 'str', max: 200 }, preferred_date: { type: 'date', required: true }, preferred_time: { type: 'str', required: true, max: 60 },
    visitors: { type: 'int', min: 1, max: 50, default: 1 }, message: { type: 'str', max: 2000 } };
  var SETSCHEMA = {
    company: { name: { type: 'str', required: true, max: 150 }, tagline: { type: 'str', max: 150 }, address: { type: 'str', required: true, max: 500 }, email: { type: 'email' },
      phone1: { type: 'str', max: 30 }, phone2: { type: 'str', max: 30 }, phone3: { type: 'str', max: 30 }, hours: { type: 'str', max: 200 } },
    social: { whatsapp: { type: 'str', max: 20 }, facebook: { type: 'url' }, linkedin: { type: 'url' }, youtube: { type: 'url' }, maps: { type: 'url' } },
    brand: { title: { type: 'str', max: 150 }, logo: { type: 'img' }, favicon: { type: 'img' }, defaultImage: { type: 'img' } },
    prefs: { lang: { type: 'enum', values: ['en', 'bn'] }, theme: { type: 'enum', values: ['light', 'dark'] }, showWa: { type: 'bool' }, showMenu: { type: 'bool' } },
    prop: { listing: { type: 'enum', values: ['buy', 'rent'] }, type: { type: 'str', max: 60 }, perPage: { type: 'int', min: 1, max: 60 }, featured: { type: 'bool' }, sold: { type: 'bool' }, rented: { type: 'bool' } },
    lead: { email: { type: 'email' }, waNumber: { type: 'str', max: 20 }, notifyEnquiry: { type: 'bool' }, notifyVisit: { type: 'bool' }, autoReply: { type: 'str', max: 1000 } },
    site: { status: { type: 'enum', values: ['online', 'maintenance'] }, message: { type: 'str', max: 500 } } };
  var PUBLIC_GROUPS = ['company', 'social', 'brand', 'prefs', 'prop', 'site'];

  /* ---------- settings & content ---------- */
  function mergeSettings(rows, onlyPublic) {
    var stored = {}; (rows || []).forEach(function (r) { stored[r.key] = r.value; });
    var out = {};
    Object.keys(DEF.SETTINGS).forEach(function (g) { if (!onlyPublic || PUBLIC_GROUPS.indexOf(g) >= 0) out[g] = Object.assign({}, DEF.SETTINGS[g], stored[g] || {}); });
    return out;
  }
  function mergeContent(rows) {
    var stored = {}; (rows || []).forEach(function (r) { stored[r.key] = r; });
    var out = {};
    Object.keys(DEF.CONTENT).forEach(function (k) { var s = stored[k]; out[k] = s ? { value: s.value, value_bn: s.value_bn } : { value: DEF.CONTENT[k][0], value_bn: DEF.CONTENT[k][1] }; });
    return out;
  }
  var getSettings = async function () { return mergeSettings((await need(sb.from('settings').select('key,value'))).data, false); };
  var getContent = async function () { return mergeContent((await need(sb.from('site_content').select('key,value,value_bn'))).data); };

  /* ---------- auth ---------- */
  async function adminUser() {
    var s = (await sb.auth.getSession()).data.session;
    if (!s) return null;
    var r = await sb.from('admin_profiles').select('user_id,name,role,created_at').eq('user_id', s.user.id).maybeSingle();
    if (r.error || !r.data) return null;
    return { id: r.data.user_id, name: r.data.name, email: s.user.email, role: r.data.role, last_login: s.user.last_sign_in_at, created_at: r.data.created_at };
  }
  async function requireAdmin() { var u = await adminUser(); if (!u) throw HttpErr(401, 'Not authenticated'); return u; }

  /* ---------- route handlers ---------- */
  async function listRows(def, q) {
    var limit = Math.min(Math.max(parseInt(q.limit, 10) || 20, 1), 100), page = Math.max(parseInt(q.page, 10) || 1, 1);
    var qb = sb.from(def.table).select('*', { count: 'exact' });
    if (q.q) {
      var s = String(q.q).slice(0, 100).replace(/[,()*\\]/g, ' ').replace(/[%_]/g, function (m) { return '\\' + m; });
      qb = qb.or(def.search.map(function (c) { return c + '.ilike.%' + s + '%'; }).join(','));
    }
    Object.keys(def.filters).forEach(function (k) {
      var v = q[k]; if (v === undefined || v === '') return;
      qb = qb.eq(k, def.filters[k] === 'bool' ? (v === 'true' || v === '1') : String(v).slice(0, 100));
    });
    if (DATE.test(q.from || '')) qb = qb.gte('created_at', q.from);
    if (DATE.test(q.to || '')) { var d = new Date(q.to + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1); qb = qb.lt('created_at', d.toISOString().slice(0, 10)); }
    def.order.forEach(function (o) { qb = qb.order(o[0], { ascending: o[1] }); });
    var r = await need(qb.range((page - 1) * limit, page * limit - 1));
    return { items: r.data, total: r.count || 0, page: page, limit: limit };
  }
  async function getRow(def, id) { var r = await need(sb.from(def.table).select('*').eq('id', id).maybeSingle()); return r.data; }
  var fileUrls = function (def, row) { return (def.files || []).reduce(function (a, f) { var v = row && row[f]; return a.concat(Array.isArray(v) ? v : v ? [v] : []); }, []); };
  function validateRow(def, body, partial) {
    var v = clean(body, def.schema, partial);
    if (def.extra) def.extra(v.data, v.errors);
    if (Object.keys(v.errors).length) throw bad(v.errors);
    return v.data;
  }
  async function crud(def, method, id, q, body) {
    if (!id) {
      if (method === 'GET') return listRows(def, q);
      if (method === 'POST') {
        var data = validateRow(def, body, false);
        if (def.slug) data.slug = await uniqueSlug(def.table, data.title);
        return (await need(sb.from(def.table).insert(data).select().single())).data;
      }
      throw HttpErr(405, 'Method not allowed');
    }
    id = Number(id); if (!Number.isInteger(id) || id < 1) throw HttpErr(404, 'Not found');
    var before = await getRow(def, id);
    if (!before) throw HttpErr(404, 'Not found');
    if (method === 'GET') return before;
    if (method === 'PUT' || method === 'PATCH') {
      var d2 = validateRow(def, body, method === 'PATCH');
      var row = Object.keys(d2).length ? (await need(sb.from(def.table).update(d2).eq('id', id).select().single())).data : before;
      await removeFiles(removedBetween(fileUrls(def, before), fileUrls(def, row)));
      return row;
    }
    if (method === 'DELETE') {
      await need(sb.from(def.table).delete().eq('id', id));
      await removeFiles(fileUrls(def, before));
      return { ok: true };
    }
    throw HttpErr(405, 'Method not allowed');
  }
  async function leadRoute(def, method, id, q, body) {
    if (!id) { if (method === 'GET') return listRows(def, q); throw HttpErr(405, 'Method not allowed'); }
    id = Number(id); if (!Number.isInteger(id) || id < 1) throw HttpErr(404, 'Not found');
    if (method === 'GET') { var r = await getRow(def, id); if (!r) throw HttpErr(404, 'Not found'); return r; }
    if (method === 'PATCH') {
      var v = clean(body, { status: { type: 'enum', required: true, values: def.lead } }, false);
      if (!v.ok) throw bad(v.errors);
      var u = await need(sb.from(def.table).update({ status: v.data.status }).eq('id', id).select().maybeSingle());
      if (!u.data) throw HttpErr(404, 'Not found');
      return u.data;
    }
    if (method === 'DELETE') { await need(sb.from(def.table).delete().eq('id', id)); return { ok: true }; }
    throw HttpErr(405, 'Method not allowed');
  }

  function sniff(b) {
    if (b.length > 12 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return ['jpg', 'image/jpeg'];
    if (b.length > 12 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return ['png', 'image/png'];
    if (b.length > 12 && String.fromCharCode(b[0], b[1], b[2], b[3]) === 'GIF8') return ['gif', 'image/gif'];
    if (b.length > 12 && String.fromCharCode(b[0], b[1], b[2], b[3]) === 'RIFF' && String.fromCharCode(b[8], b[9], b[10], b[11]) === 'WEBP') return ['webp', 'image/webp'];
    return null;
  }
  function randHex(n) { var a = new Uint8Array(n); crypto.getRandomValues(a); return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }

  function passwordProblem(pw, identity) {
    if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters';
    if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain letters and numbers';
    if (identity && pw.toLowerCase() === String(identity).toLowerCase()) return 'Password must not equal your email';
    return null;
  }

  async function handle(method, path, q, body) {
    var m, seg = path.replace(/^\/+|\/+$/g, '').split('/');

    /* ----- public ----- */
    if (seg[0] === 'bootstrap' && method === 'GET') {
      var b = (await need(sb.rpc('public_bootstrap'))).data;
      return { settings: mergeSettings(b.settings, true), content: mergeContent(b.content), services: b.services, projects: b.projects, properties: b.properties, team: b.team };
    }
    if (seg[0] === 'enquiries' && method === 'POST') {
      if (body && typeof body.website === 'string' && body.website.trim()) return { ok: true };           // honeypot
      var v = clean(body, ENQ, false); if (!v.ok) throw bad(v.errors);
      await need(sb.rpc('submit_enquiry', { p: Object.assign({}, v.data, { property_id: body.property_id || null }) }));
      return { ok: true };
    }
    if (seg[0] === 'visit-requests' && method === 'POST') {
      if (body && typeof body.website === 'string' && body.website.trim()) return { ok: true };
      var v2 = clean(body, VIS, false); if (!v2.ok) throw bad(v2.errors);
      var earliest = new Date(Date.now() - 36 * 3600 * 1000).toISOString().slice(0, 10);
      if (v2.data.preferred_date < earliest) throw bad({ preferred_date: 'Choose a date from today onwards' });
      await need(sb.rpc('submit_visit', { p: Object.assign({}, v2.data, { property_id: body.property_id || null }) }));
      return { ok: true };
    }

    /* ----- auth ----- */
    if (seg[0] === 'auth') {
      if (seg[1] === 'login' && method === 'POST') {
        var email = body && typeof body.email === 'string' ? body.email.trim() : '', pw = body && typeof body.password === 'string' ? body.password : '';
        if (!email || !pw || email.length > 254 || pw.length > 200) throw HttpErr(400, 'Enter your username and password');
        if (email.indexOf('@') < 0) email = email.toLowerCase().replace(/\s+/g, '') + '@swapnajatra.com';   // short username -> login email
        var r = await sb.auth.signInWithPassword({ email: email, password: pw });
        if (r.error) throw HttpErr(401, 'Incorrect username or password');
        var u = await adminUser();
        if (!u) { await sb.auth.signOut(); throw HttpErr(403, 'This account is not an admin'); }
        return { user: u, csrf: 'supabase' };
      }
      if (seg[1] === 'me' && method === 'GET') return { user: await requireAdmin(), csrf: 'supabase' };
      if (seg[1] === 'logout' && method === 'POST') { await sb.auth.signOut(); return { ok: true }; }
      throw HttpErr(404, 'Not found');
    }

    /* ----- admin ----- */
    if (seg[0] === 'admin') {
      var me = await requireAdmin();
      var res = seg[1], id = seg[2];
      if (T[res] && T[res].lead) return leadRoute(T[res], method, id, q, body);
      if (T[res]) return crud(T[res], method, id, q, body);

      if (res === 'content') {
        if (method === 'GET') return getContent();
        if (method === 'PUT') {
          var errors = {}, rows = [], IMG = DEF.IMG, before = await getContent();
          Object.keys(body || {}).forEach(function (k) {
            if (!DEF.CONTENT[k]) { errors[k] = 'Unknown content key'; return; }
            var isImg = IMG.indexOf(k) >= 0;
            var rr = clean(body[k], { value: { type: isImg ? 'img' : 'str', max: 5000 }, value_bn: { type: 'str', max: 5000 } }, true);
            if (!rr.ok) errors[k] = rr.errors; else rows.push([k, rr.data]);
          });
          if (Object.keys(errors).length) throw bad(errors);
          var up = rows.map(function (x) {
            var k = x[0], d = x[1], isImg = IMG.indexOf(k) >= 0;
            return { key: k, value: d.value !== undefined ? d.value : before[k].value, value_bn: isImg ? '' : (d.value_bn !== undefined ? d.value_bn : before[k].value_bn) };
          });
          if (up.length) await need(sb.from('site_content').upsert(up, { onConflict: 'key' }));
          var after = await getContent();
          await removeFiles(IMG.filter(function (k) { return fixUrls(before[k].value) !== fixUrls(after[k].value); }).map(function (k) { return before[k].value; }));
          return after;
        }
      }
      if (res === 'settings') {
        if (method === 'GET') return getSettings();
        if (method === 'PUT') {
          var errs = {}, cl = {};
          Object.keys(body || {}).forEach(function (g) {
            if (!SETSCHEMA[g]) { errs[g] = 'Unknown settings group'; return; }
            var rr = clean(body[g], SETSCHEMA[g], true); if (!rr.ok) errs[g] = rr.errors; else cl[g] = rr.data;
          });
          if (Object.keys(errs).length) throw bad(errs);
          var bef = await getSettings(), upd = [];
          Object.keys(cl).forEach(function (g) {
            var merged = Object.assign({}, bef[g], cl[g]);
            if (g === 'social' && merged.whatsapp) merged.whatsapp = String(merged.whatsapp).replace(/\D/g, '');
            upd.push({ key: g, value: merged });
          });
          if (upd.length) await need(sb.from('settings').upsert(upd, { onConflict: 'key' }));
          var aft = await getSettings(), old = [];
          Object.keys(DEF.IMGS).forEach(function (g) { DEF.IMGS[g].forEach(function (k) { if (fixUrls(bef[g][k]) !== fixUrls(aft[g][k])) old.push(bef[g][k]); }); });
          await removeFiles(old);
          return aft;
        }
      }
      if (res === 'uploads' && method === 'POST') {
        var file = body instanceof FormData ? body.get('file') : null;
        if (!file) throw HttpErr(400, 'No file uploaded');
        if (file.size > 5 * 1024 * 1024) throw HttpErr(413, 'File is too large (max 5 MB)');
        var kind = sniff(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
        if (!kind) throw HttpErr(415, 'Only JPG, PNG, GIF or WebP images are allowed');
        var name = randHex(16) + '.' + kind[0];
        var up2 = await sb.storage.from(BUCKET).upload(name, file, { contentType: kind[1], upsert: false });
        if (up2.error) throw HttpErr(500, 'Upload failed: ' + up2.error.message);
        return { url: PUBLIC_BASE + name };
      }
      if (res === 'stats' && method === 'GET') return (await need(sb.rpc('admin_stats'))).data;
      if (res === 'demo-data' && method === 'DELETE') {
        var dd = await need(sb.from('properties').delete().eq('is_demo', true).select('images'));
        await removeFiles(dd.data.reduce(function (a, x) { return a.concat(x.images || []); }, []));
        return { removed: dd.data.length };
      }
      if (res === 'account') {
        if (!id && method === 'GET') return { user: me };
        if (!id && method === 'PUT') {
          var av = clean(body, { name: { type: 'str', required: true, max: 100 }, email: { type: 'str', required: true, min: 3, max: 120 }, current_password: { type: 'str', required: true, max: 200 } }, false);
          if (!av.ok) throw bad(av.errors);
          var chk = await sb.auth.signInWithPassword({ email: me.email, password: av.data.current_password });
          if (chk.error) throw bad({ current_password: 'Current password is incorrect' });
          if (av.data.email.toLowerCase() !== me.email.toLowerCase()) throw bad({ email: 'To change the login email, ask your developer (it is changed in Supabase).' });
          await need(sb.from('admin_profiles').update({ name: av.data.name }).eq('user_id', me.id));
          return { user: await adminUser() };
        }
        if (id === 'password' && method === 'PUT') {
          var cur = body && body.current_password, np = body && body.new_password, cf = body && body.confirm_password;
          if (typeof cur !== 'string' || typeof np !== 'string') throw bad({ new_password: 'Required' });
          if (np !== cf) throw bad({ confirm_password: 'Passwords do not match' });
          var chk2 = await sb.auth.signInWithPassword({ email: me.email, password: cur });
          if (chk2.error) throw bad({ current_password: 'Current password is incorrect' });
          var prob = passwordProblem(np, me.email); if (prob) throw bad({ new_password: prob });
          var pu = await sb.auth.updateUser({ password: np });
          if (pu.error) throw bad({ new_password: pu.error.message });
          return { ok: true, csrf: 'supabase' };
        }
      }
    }
    throw HttpErr(404, 'Not found');
  }

  /* ---------- intercept fetch('/api/...') ---------- */
  window.fetch = async function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '', u;
    try { u = new URL(url, location.href); } catch (_) { return realFetch(input, init); }
    if (u.origin !== location.origin || !/^\/api(\/|$)/.test(u.pathname)) return realFetch(input, init);
    var m = [null, u.pathname.replace(/^\/api/, '') || '/', u.search.slice(1)];
    init = init || {};
    var method = (init.method || (input && input.method) || 'GET').toUpperCase();
    var q = {}; new URLSearchParams(m[2]).forEach(function (v, k) { q[k] = v; });
    var body;
    if (init.body instanceof FormData) body = init.body;
    else if (typeof init.body === 'string' && init.body) { try { body = JSON.parse(init.body); } catch (_) { body = undefined; } }
    var status = 200, payload;
    try { payload = fixUrls(await handle(method, m[1] || '/', q, body)); }
    catch (e) {
      status = e.status || 500;
      payload = { error: e.message || 'Request failed' };
      if (e.details) payload.details = e.details;
      if (!e.status) console.error('[swp]', e);
    }
    return new Response(JSON.stringify(payload), { status: status, headers: { 'Content-Type': 'application/json' } });
  };
  window.SWP_SB = sb;
})();
