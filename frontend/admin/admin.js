/* Swapnajatra admin CMS. All data lives in PostgreSQL behind the authenticated /api/admin API.
   Auth = server-side session cookie (HttpOnly) + per-session CSRF token. Nothing sensitive is stored in the browser. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
let csrf = '', me = null;

/* ---------- tiny DOM helper (text is always set via textContent => no XSS) ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c !== null && c !== undefined && c !== false) el.append(c.nodeType ? c : document.createTextNode(String(c)));
  return el;
}
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');
const money = (n) => '৳' + Number(n || 0).toLocaleString('en-IN');
let toastT;
function toast(msg, bad) { const t = $('#toast'); t.textContent = msg; t.classList.toggle('bad', !!bad); t.classList.add('o'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('o'), 3500); }

/* ---------- API ---------- */
async function api(method, path, body) {
  const opt = { method, credentials: 'same-origin', headers: {} };
  if (method !== 'GET') opt.headers['X-CSRF-Token'] = csrf;
  if (body instanceof FormData) opt.body = body;
  else if (body !== undefined) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
  const r = await fetch('/api' + path, opt);
  let j = null; try { j = await r.json(); } catch (_) { /* no body */ }
  if (r.status === 401 && !path.startsWith('/auth/login')) { showLogin(); throw new Error('Session expired. Please log in again.'); }
  if (!r.ok) { const e = new Error((j && j.error) || 'Request failed'); e.details = j && j.details; e.status = r.status; throw e; }
  return j;
}
const A = (p) => '/admin' + p;
const qs = (o) => { const p = new URLSearchParams(); for (const [k, v] of Object.entries(o)) if (v !== '' && v != null) p.set(k, v); const s = p.toString(); return s ? '?' + s : ''; };
function fail(e) { toast(e.details ? 'Please fix: ' + Object.entries(e.details).map(([k, v]) => `${k} (${typeof v === 'string' ? v : 'invalid'})`).join(', ') : e.message, true); }

/* ---------- auth ---------- */
function showLogin() { csrf = ''; me = null; $('#app').hidden = true; $('#login').hidden = false; $('#lp').value = ''; setTimeout(() => $('#lu').focus(), 30); }
async function showApp() { $('#login').hidden = true; $('#app').hidden = false; route(); }
$('#lpT').onclick = () => { const p = $('#lp'); const s = p.type === 'password'; p.type = s ? 'text' : 'password'; $('#lpT').textContent = s ? 'Hide' : 'Show'; };
$('#loginForm').onsubmit = async (e) => {
  e.preventDefault(); $('#lerr').textContent = ''; $('#lbtn').disabled = true;
  try { const r = await api('POST', '/auth/login', { email: $('#lu').value.trim(), password: $('#lp').value }); csrf = r.csrf; me = r.user; $('#lp').value = ''; showApp(); }
  catch (x) { $('#lerr').textContent = x.message; }
  finally { $('#lbtn').disabled = false; }
};
$('#logout').onclick = async () => { try { await api('POST', '/auth/logout'); } catch (_) { /* ignore */ } showLogin(); };

/* ---------- navigation ---------- */
const VIEWS = [['overview', 'Overview'], ['content', 'Website Content'], ['properties', 'Properties'], ['projects', 'Projects'], ['services', 'Services'], ['team', 'Team'], ['visits', 'Visit Requests'], ['enquiries', 'Enquiries'], ['settings', 'Settings'], ['account', 'Admin Account']];
const nav = $('#nav');
VIEWS.forEach(([k, l]) => nav.append(h('button', { class: 'navb', 'data-v': k, type: 'button', onclick: () => { location.hash = '#/' + k; closeSide(); } }, l)));
const closeSide = () => { $('#side').classList.remove('open'); $('#scrim').classList.remove('open'); };
$('#burger').onclick = () => { $('#side').classList.add('open'); $('#scrim').classList.add('open'); };
$('#scrim').onclick = closeSide;
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSide(); });
window.addEventListener('hashchange', () => { if (!$('#app').hidden) route(); });

async function route() {
  const key = (location.hash.replace(/^#\//, '') || 'overview').split('/')[0];
  const v = VIEWS.find(x => x[0] === key) || VIEWS[0];
  $('#title').textContent = v[1];
  document.querySelectorAll('.navb[data-v]').forEach(b => b.classList.toggle('a', b.dataset.v === v[0]));
  const view = $('#view'); view.replaceChildren(h('p', { class: 'empty' }, 'Loading…'));
  try { const node = await RENDER[v[0]](); view.replaceChildren(node); view.focus({ preventScroll: true }); }
  catch (e) { if (!$('#app').hidden) view.replaceChildren(h('p', { class: 'empty' }, e.message)); }
}

/* ---------- form fields ---------- */
function pill(text, cls) { return h('span', { class: 'pill ' + (cls || '') }, text); }
const statusCls = (s) => ({ Available: 'ok', published: 'ok', active: 'ok', Completed: 'ok', Confirmed: 'ok', Sold: 'bad', Rented: 'warn', draft: 'warn', disabled: 'warn', New: 'warn', Cancelled: 'bad', Archived: '' }[s] || '');

/** field spec: {k,label,type,options,full,required,hint,placeholder} */
function buildField(f, val, ctx) {
  const id = 'f_' + (ctx.prefix || '') + f.k, wrap = h('div', { class: f.full ? 'full' : '' });
  let input;
  const lab = () => h('label', { for: id }, f.label + (f.required ? ' *' : ''));
  if (f.type === 'bool') {
    input = h('input', { type: 'checkbox', id }); input.checked = !!val;
    wrap.append(h('label', { class: 'chk', for: id }, input, f.label));
    ctx.get[f.k] = () => input.checked;
  } else if (f.type === 'images' || f.type === 'image') {
    const state = { urls: f.type === 'images' ? [...(val || [])] : (val ? [val] : []) };
    wrap.append(h('label', {}, f.label), uploader(state, f.type === 'images'));
    ctx.get[f.k] = () => (f.type === 'images' ? state.urls : (state.urls[0] || ''));
  } else {
    if (f.type === 'select') { input = h('select', { id }, f.options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; const op = h('option', { value: v }, l); if (String(val ?? '') === String(v)) op.selected = true; return op; })); }
    else if (f.type === 'textarea' || f.type === 'list') { input = h('textarea', { id, rows: f.rows || 4 }); input.value = f.type === 'list' ? (val || []).join('\n') : (val ?? ''); }
    else { input = h('input', { id, type: f.type === 'number' ? 'number' : f.type || 'text', min: f.type === 'number' ? 0 : undefined, step: f.step, list: f.list, placeholder: f.placeholder, autocomplete: 'off' }); input.value = val ?? ''; }
    if (f.hint) wrap.append(lab(), input, h('small', { class: 'err', style: 'color:var(--mut)' }, f.hint)); else wrap.append(lab(), input);
    ctx.get[f.k] = () => (f.type === 'list' ? input.value.split(/\n|,/).map(s => s.trim()).filter(Boolean) : f.type === 'number' ? (input.value === '' ? 0 : Number(input.value)) : input.value);
  }
  return wrap;
}

function uploader(state, multiple) {
  const box = h('div'), list = h('div', { class: 'imgs' }), msg = h('p', { class: 'err' });
  const input = h('input', { type: 'file', accept: 'image/jpeg,image/png,image/gif,image/webp', multiple: multiple || undefined, 'aria-label': 'Upload image' });
  const draw = () => list.replaceChildren(...state.urls.map((u, i) => h('div', { class: 'thumb' }, h('img', { src: u, alt: 'Preview' }),
    h('button', { type: 'button', 'aria-label': 'Remove image', onclick: () => { state.urls.splice(i, 1); draw(); } }, '×'))));
  input.onchange = async () => {
    msg.textContent = '';
    for (const file of [...input.files]) {
      try { const fd = new FormData(); fd.append('file', file); const r = await api('POST', A('/uploads'), fd); if (multiple) state.urls.push(r.url); else state.urls = [r.url]; draw(); }
      catch (e) { msg.textContent = file.name + ': ' + e.message; }
    }
    input.value = '';
  };
  draw(); box.append(list, input, msg, h('small', { style: 'color:var(--mut)' }, multiple ? 'JPG, PNG, GIF or WebP, up to 5 MB each. Removing an image deletes the file when you save.' : 'Uploading a new image replaces the old one when you save. Remove to clear.'));
  return box;
}

function buildForm(fields, values, prefix) {
  const ctx = { get: {}, prefix }; const grid = h('div', { class: 'grid' });
  fields.forEach(f => grid.append(buildField(f, values ? values[f.k] : f.def, ctx)));
  return { grid, collect: () => Object.fromEntries(Object.entries(ctx.get).map(([k, fn]) => [k, fn()])) };
}

/* ---------- generic list + form (properties / projects / services) ---------- */
function crudView(cfg) {
  const root = h('div'); let page = 1; const filt = {};
  async function list() {
    root.replaceChildren();
    const bar = h('div', { class: 'bar' });
    bar.append(h('div', { class: 'grow' }, h('label', { for: 'q' }, 'Search'), h('input', { id: 'q', value: filt.q || '', placeholder: cfg.searchHint, onkeydown: (e) => { if (e.key === 'Enter') { filt.q = e.target.value; page = 1; list(); } } })));
    (cfg.filters || []).forEach(f => bar.append(h('div', {}, h('label', { for: 'fl_' + f.k }, f.label),
      h('select', { id: 'fl_' + f.k, onchange: (e) => { filt[f.k] = e.target.value; page = 1; list(); } }, [['', 'All'], ...f.options].map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; const op = h('option', { value: v }, l); if ((filt[f.k] || '') === v) op.selected = true; return op; })))));
    bar.append(h('div', { class: 'fix' }, h('button', { class: 'btn o', type: 'button', onclick: () => { filt.q = $('#q').value; page = 1; list(); } }, 'Search')));
    bar.append(h('div', { class: 'fix' }, h('button', { class: 'btn', type: 'button', onclick: () => form(null) }, '+ Add ' + cfg.noun)));
    root.append(...(cfg.top ? [cfg.top()] : []), bar);
    let data;
    try { data = await api('GET', A(cfg.path) + qs({ ...filt, page, limit: 20 })); } catch (e) { root.append(h('p', { class: 'empty' }, e.message)); return; }
    if (!data.items.length) { root.append(h('div', { class: 'tw' }, h('p', { class: 'empty' }, `No ${cfg.noun}s found.`))); return; }
    const tbl = h('table', {}, h('thead', {}, h('tr', {}, cfg.cols.map(c => h('th', {}, c.label)), h('th', {}, 'Actions'))),
      h('tbody', {}, data.items.map(it => h('tr', {}, cfg.cols.map(c => h('td', {}, c.render(it))), h('td', {}, h('div', { class: 'row' },
        h('button', { class: 'btn o sm', type: 'button', onclick: () => form(it) }, 'Edit'),
        ...(cfg.quick ? cfg.quick(it, patch) : []),
        h('button', { class: 'btn d sm', type: 'button', onclick: () => del(it) }, 'Delete')))))));
    root.append(h('div', { class: 'tw' }, tbl));
    const pages = Math.max(1, Math.ceil(data.total / data.limit));
    root.append(h('div', { class: 'pager' }, `${data.total} total · page ${data.page} of ${pages}`,
      h('button', { class: 'btn o sm', type: 'button', disabled: page <= 1, onclick: () => { page--; list(); } }, '‹ Prev'),
      h('button', { class: 'btn o sm', type: 'button', disabled: page >= pages, onclick: () => { page++; list(); } }, 'Next ›')));
  }
  async function patch(it, body, okMsg) { try { await api('PATCH', A(cfg.path + '/' + it.id), body); toast(okMsg || 'Saved'); list(); } catch (e) { fail(e); } }
  async function del(it) {
    if (!confirm(`Delete this ${cfg.noun} permanently?\n\n"${it.title}"\n\nThis cannot be undone.`)) return;
    try { await api('DELETE', A(cfg.path + '/' + it.id)); toast('Deleted'); list(); } catch (e) { fail(e); }
  }
  function form(it) {
    root.replaceChildren();
    const f = buildForm(cfg.fields, it || Object.fromEntries(cfg.fields.map(x => [x.k, x.def])), 'c');
    const save = h('button', { class: 'btn', type: 'submit' }, it ? 'Save changes' : 'Create ' + cfg.noun);
    root.append(h('form', { class: 'card', novalidate: true, onsubmit: async (e) => {
      e.preventDefault(); save.disabled = true;
      try { if (it) await api('PUT', A(cfg.path + '/' + it.id), f.collect()); else await api('POST', A(cfg.path), f.collect()); toast('Saved to database'); list(); }
      catch (x) { fail(x); } finally { save.disabled = false; }
    } }, h('h2', {}, (it ? 'Edit ' : 'Add ') + cfg.noun), f.grid, h('div', { class: 'actions' }, save, h('button', { class: 'btn o', type: 'button', onclick: list }, 'Cancel'))));
    window.scrollTo(0, 0);
  }
  list(); return root;
}

const TYPES = ['Apartment', 'Villa', 'House', 'Penthouse', 'Commercial', 'Land'];
const PUB = [['draft', 'Draft'], ['published', 'Published']];
const imgCell = (it) => ((it.images && it.images[0]) ? h('img', { src: it.images[0], alt: '', style: 'width:56px;height:42px;object-fit:cover;border-radius:6px' }) : '—');

/* ---------- views ---------- */
const RENDER = {};

RENDER.overview = async () => {
  /* dashboard v1 */
  const s = await api('GET', A('/stats'));
  const none = { items: [] };
  const [enq, vis] = await Promise.all([api('GET', A('/enquiries?page=1&limit=5')).catch(() => none), api('GET', A('/visit-requests?page=1&limit=5')).catch(() => none)]);
  const SV = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    building: '<rect x="5" y="3" width="10" height="18" rx="1"/><path d="M15 9h4v12h-4M8 7h4M8 11h4M8 15h4"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8 11h8M8 14h5"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    brief: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'
  };
  const icon = (k, cls) => { const e = h('span', { class: 'dico ' + cls }); e.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + SV[k] + '</svg>'; return e; };
  const sd = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
  const big = [['Total properties', s.total_properties, 'home', 'ic-b', '#/properties'], ['Total projects', s.total_projects, 'building', 'ic-i', '#/projects'], ['New enquiries', s.new_enquiries, 'chat', 'ic-g', '#/enquiries'], ['Pending visits', s.pending_visits, 'cal', 'ic-o', '#/visits']];
  const mini = [['Available properties', s.available_properties, 'check', 'ic-g'], ['Featured properties', s.featured_properties, 'star', 'ic-o'], ['Services', s.total_services, 'brief', 'ic-i']];
  const root = h('div', { class: 'dash' });
  root.append(h('div', { class: 'dstats' }, big.map(([l, n, ic, c, href]) => h('a', { class: 'dcard', href }, icon(ic, c), h('div', {}, h('span', { class: 'dl' }, l), h('b', {}, n))))));
  root.append(h('div', { class: 'dmini' }, mini.map(([l, n, ic, c]) => h('div', { class: 'dm' }, icon(ic, c + ' sm'), h('div', {}, h('b', {}, n), h('span', {}, l))))));
  if (s.demo_properties > 0) root.append(h('div', { class: 'note warn' }, `${s.demo_properties} DEMO DATA sample properties are in the database and visible on the public site. `,
    h('button', { class: 'btn d sm', type: 'button', onclick: async () => { if (!confirm('Remove all DEMO DATA properties?')) return; try { const r = await api('DELETE', A('/demo-data')); toast(`Removed ${r.removed} demo properties`); route(); } catch (e) { fail(e); } } }, 'Remove demo data')));
  const panel = (title, href, head, rows, empty) => h('section', { class: 'dpanel' },
    h('div', { class: 'dph' }, h('h2', {}, title), h('a', { class: 'dva', href }, 'View all →')),
    rows.length ? h('div', { class: 'tw' }, h('table', { class: 'dt' }, h('thead', {}, h('tr', {}, head.map(x => h('th', {}, x)))), h('tbody', {}, rows))) : h('p', { class: 'empty' }, empty));
  const who = (x) => h('td', {}, h('b', {}, x.customer_name || '—'), h('br'), h('span', { class: 'dsub' }, x.phone || ''));
  const eRows = (enq.items || []).map(x => h('tr', {}, who(x), h('td', {}, x.subject || '—'), h('td', {}, sd(x.created_at)), h('td', {}, pill(x.status, statusCls(x.status))), h('td', {}, h('a', { class: 'dview', href: '#/enquiries' }, 'View'))));
  const vRows = (vis.items || []).map(x => h('tr', {}, who(x), h('td', {}, x.property_title || '—'), h('td', {}, sd(x.preferred_date || x.created_at)), h('td', {}, pill(x.status, statusCls(x.status))), h('td', {}, h('a', { class: 'dview', href: '#/visits' }, 'View'))));
  root.append(h('div', { class: 'dpanels' },
    panel('Recent enquiries', '#/enquiries', ['Customer', 'About', 'Date', 'Status', ''], eRows, 'No enquiries yet.'),
    panel('Recent visit requests', '#/visits', ['Customer', 'Property', 'Visit date', 'Status', ''], vRows, 'No visit requests yet.')));
  root.append(h('p', { style: 'color:var(--mut);font-size:13px' }, 'All numbers are live counts from the database. Available = published and not sold/rented.'));
  return root;
};

RENDER.properties = () => crudView({
  noun: 'property', path: '/properties', searchHint: 'Title, location or address',
  filters: [{ k: 'listing_type', label: 'Buy / Rent', options: [['buy', 'Buy'], ['rent', 'Rent']] }, { k: 'property_type', label: 'Type', options: TYPES },
    { k: 'status', label: 'Status', options: ['Available', 'Sold', 'Rented'] }, { k: 'publish_status', label: 'Publishing', options: PUB }, { k: 'featured', label: 'Featured', options: [['true', 'Featured'], ['false', 'Not featured']] }],
  cols: [{ label: 'Image', render: imgCell }, { label: 'Title', render: (p) => h('b', {}, p.title, p.is_demo ? ' ' : '', p.is_demo ? pill('DEMO', 'warn') : '') }, { label: 'Location', render: (p) => p.location },
    { label: 'Type', render: (p) => `${p.property_type} · ${p.listing_type === 'rent' ? 'Rent' : 'Buy'}` }, { label: 'Price', render: (p) => money(p.price) + (p.listing_type === 'rent' ? '/mo' : '') + (Number(p.discount_percent) > 0 ? ' (−' + Number(p.discount_percent) + '% off)' : '') },
    { label: 'Status', render: (p) => h('span', {}, pill(p.status, statusCls(p.status)), ' ', pill(p.publish_status, statusCls(p.publish_status)), p.featured ? [' ', pill('★ Featured', 'ok')] : '') }],
  quick: (p, patch) => [
    h('button', { class: 'btn o sm', type: 'button', onclick: () => patch(p, { publish_status: p.publish_status === 'published' ? 'draft' : 'published' }, p.publish_status === 'published' ? 'Unpublished' : 'Published') }, p.publish_status === 'published' ? 'Unpublish' : 'Publish'),
    h('button', { class: 'btn o sm', type: 'button', onclick: () => patch(p, { featured: !p.featured }) }, p.featured ? 'Unfeature' : 'Feature')],
  fields: [
    { k: 'title', label: 'Title', required: true, full: true }, { k: 'property_type', label: 'Property type', type: 'select', options: TYPES, def: 'Apartment' },
    { k: 'listing_type', label: 'Buy / Rent', type: 'select', options: [['buy', 'Buy'], ['rent', 'Rent']], def: 'buy' },
    { k: 'location', label: 'Location (area)', required: true, list: 'areas', hint: 'e.g. Gulshan, Banani, Uttara' }, { k: 'address', label: 'Address' },
    { k: 'price', label: 'Price (৳) — monthly rent if Rent', type: 'number', def: 0 }, { k: 'discount_percent', label: 'Discount % (optional — 0 means no discount)', type: 'number', def: 0, hint: 'If you enter e.g. 10, the website shows 10% off with the old price struck through.' }, { k: 'area', label: 'Area (sq ft)', type: 'number', def: 0 },
    { k: 'bedrooms', label: 'Bedrooms', type: 'number', def: 0 }, { k: 'bathrooms', label: 'Bathrooms', type: 'number', def: 0 },
    { k: 'description', label: 'Description', type: 'textarea', full: true, rows: 5 }, { k: 'features', label: 'Features (one per line, e.g. Lift, Parking)', type: 'list', full: true, def: [] },
    { k: 'images', label: 'Images (first image is the cover)', type: 'images', full: true, def: [] },
    { k: 'status', label: 'Availability status', type: 'select', options: ['Available', 'Sold', 'Rented'], def: 'Available' },
    { k: 'publish_status', label: 'Publishing (only Published appears on the website)', type: 'select', options: PUB, def: 'draft' }, { k: 'featured', label: 'Featured property', type: 'bool', def: false }],
  top: () => h('datalist', { id: 'areas' }, ['Gulshan', 'Banani', 'Baridhara', 'Bashundhara', 'Dhanmondi', 'Uttara'].map(a => h('option', { value: a }))),
});

RENDER.projects = () => crudView({
  noun: 'project', path: '/projects', searchHint: 'Title or location',
  filters: [{ k: 'status', label: 'Status', options: ['Upcoming', 'Ongoing', 'Completed'] }, { k: 'publish_status', label: 'Publishing', options: PUB }],
  cols: [{ label: 'Image', render: imgCell }, { label: 'Title', render: (p) => h('b', {}, p.title) }, { label: 'Location', render: (p) => p.location || '—' }, { label: 'Type', render: (p) => p.project_type || '—' },
    { label: 'Status', render: (p) => h('span', {}, pill(p.status), ' ', pill(p.publish_status, statusCls(p.publish_status))) }],
  quick: (p, patch) => [h('button', { class: 'btn o sm', type: 'button', onclick: () => patch(p, { publish_status: p.publish_status === 'published' ? 'draft' : 'published' }, 'Updated') }, p.publish_status === 'published' ? 'Unpublish' : 'Publish')],
  fields: [{ k: 'title', label: 'Title', required: true, full: true }, { k: 'location', label: 'Location' }, { k: 'project_type', label: 'Project type', placeholder: 'e.g. Residential, Commercial' },
    { k: 'status', label: 'Project status', type: 'select', options: ['Upcoming', 'Ongoing', 'Completed'], def: 'Upcoming' }, { k: 'publish_status', label: 'Publishing', type: 'select', options: PUB, def: 'draft' },
    { k: 'sort_order', label: 'Display order (lower first)', type: 'number', def: 0 }, { k: 'description', label: 'Description', type: 'textarea', full: true, rows: 5 },
    { k: 'images', label: 'Project images', type: 'images', full: true, def: [] }],
});

RENDER.services = () => crudView({
  noun: 'service', path: '/services', searchHint: 'Title or description', filters: [{ k: 'status', label: 'Status', options: [['active', 'Enabled'], ['disabled', 'Disabled']] }],
  cols: [{ label: 'Order', render: (s) => s.sort_order }, { label: 'Title', render: (s) => h('b', {}, s.title) }, { label: 'Description', render: (s) => h('span', { class: 'msg' }, s.description || '—') }, { label: 'Status', render: (s) => pill(s.status === 'active' ? 'Enabled' : 'Disabled', statusCls(s.status)) }],
  quick: (s, patch) => [h('button', { class: 'btn o sm', type: 'button', onclick: () => patch(s, { status: s.status === 'active' ? 'disabled' : 'active' }, 'Updated') }, s.status === 'active' ? 'Disable' : 'Enable')],
  fields: [{ k: 'title', label: 'Title (English)', required: true, full: true }, { k: 'title_bn', label: 'Title (বাংলা)', full: true }, { k: 'description', label: 'Description (English)', type: 'textarea', full: true, rows: 3 },
    { k: 'description_bn', label: 'Description (বাংলা)', type: 'textarea', full: true, rows: 3 }, { k: 'cta_label', label: 'Link text (English)', placeholder: 'Explore properties →' }, { k: 'cta_label_bn', label: 'Link text (বাংলা)' },
    { k: 'cta_href', label: 'Link target', def: '#contact', hint: '#properties, #contact, or a full https:// link' }, { k: 'icon', label: 'Icon / emoji (optional)' },
    { k: 'sort_order', label: 'Display order (lower first)', type: 'number', def: 0 }, { k: 'status', label: 'Status', type: 'select', options: [['active', 'Enabled'], ['disabled', 'Disabled']], def: 'active' },
    { k: 'image', label: 'Image (optional)', type: 'image', full: true, def: '' }],
});

/* team v1 */
RENDER.team = () => crudView({
  noun: 'team member', path: '/team', searchHint: 'Name or designation', filters: [{ k: 'status', label: 'Status', options: [['active', 'Shown'], ['hidden', 'Hidden']] }],
  cols: [{ label: 'Order', render: (m) => m.sort_order },
    { label: 'Photo', render: (m) => (m.photo ? h('img', { src: m.photo, alt: '', style: 'width:42px;height:42px;border-radius:50%;object-fit:cover;display:block' }) : '—') },
    { label: 'Name', render: (m) => h('b', {}, m.name) }, { label: 'Designation', render: (m) => m.role || '—' },
    { label: 'Status', render: (m) => pill(m.status === 'active' ? 'Shown' : 'Hidden', statusCls(m.status === 'active' ? 'active' : 'disabled')) }],
  quick: (m, patch) => [h('button', { class: 'btn o sm', type: 'button', onclick: () => patch(m, { status: m.status === 'active' ? 'hidden' : 'active' }, 'Updated') }, m.status === 'active' ? 'Hide' : 'Show')],
  fields: [{ k: 'name', label: 'Name (English)', required: true, full: true }, { k: 'name_bn', label: 'Name (বাংলা)', full: true },
    { k: 'role', label: 'Designation (English)', placeholder: 'Managing Director' }, { k: 'role_bn', label: 'Designation (বাংলা)' },
    { k: 'sort_order', label: 'Display order (lower first)', type: 'number', def: 0 }, { k: 'status', label: 'Status', type: 'select', options: [['active', 'Shown on website'], ['hidden', 'Hidden']], def: 'active' },
    { k: 'photo', label: 'Photo (portrait, face in the middle)', type: 'image', full: true, def: '' }],
});

/* ---------- enquiries & visit requests ---------- */
function leadsView(cfg) {
  const root = h('div'); let page = 1; const filt = {};
  async function load() {
    root.replaceChildren();
    const bar = h('div', { class: 'bar' },
      h('div', { class: 'grow' }, h('label', { for: 'q' }, 'Search'), h('input', { id: 'q', value: filt.q || '', placeholder: cfg.searchHint, onkeydown: (e) => { if (e.key === 'Enter') { filt.q = e.target.value; page = 1; load(); } } })),
      h('div', {}, h('label', { for: 'st' }, 'Status'), h('select', { id: 'st', onchange: (e) => { filt.status = e.target.value; page = 1; load(); } }, [['', 'All'], ...cfg.statuses.map(s => [s, s])].map(([v, l]) => { const o = h('option', { value: v }, l); if ((filt.status || '') === v) o.selected = true; return o; }))),
      h('div', {}, h('label', { for: 'df' }, 'From'), h('input', { id: 'df', type: 'date', value: filt.from || '', onchange: (e) => { filt.from = e.target.value; page = 1; load(); } })),
      h('div', {}, h('label', { for: 'dt' }, 'To'), h('input', { id: 'dt', type: 'date', value: filt.to || '', onchange: (e) => { filt.to = e.target.value; page = 1; load(); } })),
      h('div', { class: 'fix' }, h('button', { class: 'btn o', type: 'button', onclick: () => { filt.q = $('#q').value; page = 1; load(); } }, 'Search')));
    root.append(bar);
    let data; try { data = await api('GET', A(cfg.path) + qs({ ...filt, page, limit: 20 })); } catch (e) { root.append(h('p', { class: 'empty' }, e.message)); return; }
    if (!data.items.length) { root.append(h('div', { class: 'tw' }, h('p', { class: 'empty' }, 'Nothing here yet.'))); return; }
    root.append(h('div', { class: 'tw' }, h('table', {}, h('thead', {}, h('tr', {}, cfg.cols.map(c => h('th', {}, c.label)), h('th', {}, 'Status'), h('th', {}, ''))),
      h('tbody', {}, data.items.map(it => h('tr', {}, cfg.cols.map(c => h('td', {}, c.render(it))),
        h('td', {}, h('select', { 'aria-label': 'Status', onchange: async (e) => { try { await api('PATCH', A(cfg.path + '/' + it.id), { status: e.target.value }); toast('Status updated'); } catch (x) { fail(x); load(); } } },
          cfg.statuses.map(s => { const o = h('option', { value: s }, s); if (s === it.status) o.selected = true; return o; }))),
        h('td', {}, h('button', { class: 'btn d sm', type: 'button', onclick: async () => { if (!confirm('Delete this entry permanently?')) return; try { await api('DELETE', A(cfg.path + '/' + it.id)); toast('Deleted'); load(); } catch (x) { fail(x); } } }, 'Delete'))))))));
    const pages = Math.max(1, Math.ceil(data.total / data.limit));
    root.append(h('div', { class: 'pager' }, `${data.total} total · page ${data.page} of ${pages}`,
      h('button', { class: 'btn o sm', type: 'button', disabled: page <= 1, onclick: () => { page--; load(); } }, '‹ Prev'),
      h('button', { class: 'btn o sm', type: 'button', disabled: page >= pages, onclick: () => { page++; load(); } }, 'Next ›')));
  }
  load(); return root;
}
const contact = (x) => h('div', {}, h('b', {}, x.customer_name), h('br'), h('a', { href: 'tel:' + String(x.phone).replace(/[^\d+]/g, '') }, x.phone), x.email ? [h('br'), h('a', { href: 'mailto:' + x.email }, x.email)] : '');
RENDER.enquiries = () => leadsView({ path: '/enquiries', statuses: ['New', 'Contacted', 'Completed', 'Archived'], searchHint: 'Name, phone, email or message',
  cols: [{ label: 'Customer', render: contact }, { label: 'About', render: (x) => x.subject || '—' }, { label: 'Message', render: (x) => h('div', { class: 'msg' }, x.message) }, { label: 'Received', render: (x) => fmtDate(x.created_at) }] });
RENDER.visits = () => leadsView({ path: '/visit-requests', statuses: ['New', 'Confirmed', 'Completed', 'Cancelled'], searchHint: 'Customer or property',
  cols: [{ label: 'Customer', render: contact }, { label: 'Property', render: (x) => x.property_title || '—' }, { label: 'Preferred', render: (x) => `${x.preferred_date} · ${x.preferred_time || '—'} · ${x.visitors} visitor(s)` },
    { label: 'Message', render: (x) => h('div', { class: 'msg' }, x.message || '—') }, { label: 'Requested', render: (x) => fmtDate(x.created_at) }] });

/* ---------- website content (hero, about, services text, footer, contact) ---------- */
RENDER.content = async () => {
  const [c, s] = await Promise.all([api('GET', A('/content')), api('GET', A('/settings'))]);
  const ctx = { get: {}, prefix: 'ct' };
  const txt = (key, label, o = {}) => [buildField({ k: key, label: label + ' (English)', type: o.type || 'text', full: true, rows: o.rows }, c[key].value, ctx),
    buildField({ k: key + '_bn', label: label + ' (বাংলা)', type: o.type || 'text', full: true, rows: o.rows }, c[key].value_bn, ctx)];
  const img = (key, label) => buildField({ k: key, label, type: 'image', full: true }, c[key].value, ctx);
  const cs = buildForm([{ k: 'address', label: 'Office address (one line per row)', type: 'textarea', full: true, rows: 3 }, { k: 'phone1', label: 'Phone 1' }, { k: 'phone2', label: 'Phone 2' }, { k: 'phone3', label: 'Phone 3' },
    { k: 'email', label: 'Email', type: 'email' }, { k: 'hours', label: 'Office hours (one line per row, e.g. Sun – Thu: 9:00 AM – 6:00 PM)', type: 'textarea', full: true, rows: 2 }], s.company, 'co');
  const section = (title, ...kids) => h('div', { class: 'card' }, h('h2', {}, title), h('div', { class: 'grid' }, ...kids.flat()));
  const btn = h('button', { class: 'btn', type: 'submit' }, 'Save all changes');
  return h('form', { novalidate: true, onsubmit: async (e) => {
    e.preventDefault(); btn.disabled = true;
    try {
      const body = {};
      for (const k of Object.keys(c)) { const isImg = k.endsWith('_image'); body[k] = { value: ctx.get[k]() }; if (!isImg) body[k].value_bn = ctx.get[k + '_bn'](); }
      await api('PUT', A('/content'), body);
      await api('PUT', A('/settings'), { company: cs.collect() });
      toast('Saved. The public website now shows these changes.');
    } catch (x) { fail(x); } finally { btn.disabled = false; }
  } },
  h('div', { class: 'note' }, 'Leave a Bangla field empty to show the English text in Bangla mode. Changes apply to the public website immediately after saving.'),
  section('Board of Directors', txt('board_subtitle', 'Subtitle (leave empty to hide)', { type: 'textarea', rows: 3 }), img('board_image', 'Banner background image (if empty, the Hero image is used)')),
  section('Hero', txt('hero_heading', 'Heading'), txt('hero_subtitle', 'Subtitle', { type: 'textarea', rows: 3 }), txt('hero_button', 'Button text'), img('hero_image', 'Hero background image (optional)')),
  section('About (section appears only when you add content)', txt('about_heading', 'Heading'), txt('about_description', 'Description', { type: 'textarea', rows: 5 }), img('about_image', 'About image')),
  section('Owner / Chairman (shown on the home page, left side)', txt('owner_name', 'Name'), txt('owner_title', 'Designation'), txt('owner_message', 'Short message (optional)', { type: 'textarea', rows: 3 }), img('owner_image', 'Photo (square or portrait, face in the middle)')),
  section('Hero registration details (below the buttons)', txt('hc_reg', 'Company registration no.'), txt('hc_reg_note', 'Registration note'), txt('hc_tin', 'TIN number'), txt('hc_tin_note', 'TIN note'), txt('hc_lic', 'Trade licence no.'), txt('hc_lic_note', 'Licence note (e.g. validity)'), txt('hc_inc', 'Date of incorporation'), txt('hc_inc_note', 'Incorporation note'), h('p', { class: 'full', style: 'color:var(--mut);font-size:13px' }, 'Leave a number empty to hide that item on the home page.')),
  section('Have land? banner (below Services)', img('land_image', 'Background photo (wide landscape, e.g. an architectural photo you own or license)')),
  section('Services background', img('services_image', 'Background photo (shown blurred behind the service cards)')),
  section('Properties page', txt('properties_eyebrow', 'Small top text (e.g. DISCOVER YOUR NEXT ADDRESS)'), txt('properties_heading', 'Heading (e.g. Properties)'), txt('properties_subtitle', 'Subtitle', { type: 'textarea', rows: 3 }), img('properties_image', 'Background photo (top banner)')),
  section('Home loan calculator', txt('emi_eyebrow', 'Small top text (e.g. PLAN YOUR DREAM HOME)'), txt('emi_heading', 'Title (e.g. Home Loan Calculator)'), txt('emi_subtitle', 'Subtitle', { type: 'textarea', rows: 3 }), img('emi_image', 'Background photo (top banner)')),
  section('Services section', txt('services_heading', 'Heading'), txt('services_description', 'Description', { type: 'textarea', rows: 3 }), h('p', { class: 'full', style: 'color:var(--mut);font-size:13px' }, 'Individual services are managed under “Services”.')),
  section('Contact page', txt('contact_subtitle', 'Subtitle under "Contact Us"', { type: 'textarea', rows: 3 }), txt('contact_location', 'Our Location text (e.g. Prime location in Gulshan)'), txt('contact_support', 'Quick Support text (e.g. We usually respond within 24 hours)'), img('contact_image', 'Background photo (right side)')),
  h('div', { class: 'card' }, h('h2', {}, 'Contact & office'), cs.grid),
  section('Footer', txt('footer_description', 'Description'), txt('footer_copyright', 'Copyright text'), h('p', { class: 'full', style: 'color:var(--mut);font-size:13px' }, 'Social links are managed under “Settings”.')),
  h('div', { class: 'actions' }, btn));
};

/* ---------- settings ---------- */
const SCHEMA = [
  ['company', 'Company information', [['name', 'Company name'], ['tagline', 'Tagline'], ['address', 'Office address', 'textarea'], ['email', 'Email', 'email'], ['phone1', 'Phone 1'], ['phone2', 'Phone 2'], ['phone3', 'Phone 3'], ['hours', 'Office information / hours']]],
  ['social', 'Social & contact links', [['whatsapp', 'WhatsApp number (with country code, e.g. 8801310094907)'], ['facebook', 'Facebook URL', 'url'], ['linkedin', 'LinkedIn URL', 'url'], ['youtube', 'YouTube URL', 'url'], ['instagram', 'Instagram URL', 'url'], ['maps', 'Google Maps URL', 'url']]],
  ['brand', 'Branding', [['title', 'Website title'], ['logo', 'Logo', 'image'], ['favicon', 'Favicon', 'image'], ['defaultImage', 'Default property image', 'image']]],
  ['prefs', 'Website preferences', [['lang', 'Default language', 'select', [['en', 'English'], ['bn', 'বাংলা']]], ['theme', 'Default theme', 'select', [['light', 'Light'], ['dark', 'Dark']]], ['showWa', 'Show WhatsApp button', 'bool'], ['showMenu', 'Show ☰ admin menu on the public site (admin stays reachable at /admin/)', 'bool']]],
  ['prop', 'Property settings', [['listing', 'Default listing type', 'select', [['buy', 'Buy'], ['rent', 'Rent']]], ['type', 'Default property type', 'select', [['', 'Any'], ...TYPES]], ['perPage', 'Properties shown per page', 'number'], ['featured', 'Show featured badge and list featured first', 'bool'], ['sold', 'Show sold properties', 'bool'], ['rented', 'Show rented properties', 'bool']]],
  ['lead', 'Lead settings', [['email', 'Notification email', 'email'], ['waNumber', 'WhatsApp notification number (stored only — see note)'], ['notifyEnquiry', 'E-mail me new enquiries', 'bool'], ['notifyVisit', 'E-mail me new visit requests', 'bool'], ['autoReply', 'Auto-reply message (e-mailed to customers who give an email)', 'textarea']]],
  ['site', 'Maintenance mode', [['status', 'Website status', 'select', [['online', 'Online'], ['maintenance', 'Maintenance mode']]], ['message', 'Maintenance message', 'textarea']]],
];
RENDER.settings = async () => {
  const s = await api('GET', A('/settings')); const forms = {};
  const root = h('form', { novalidate: true });
  for (const [g, title, fs] of SCHEMA) {
    const fields = fs.map(([k, label, type, opts]) => ({ k, label, type: type === 'textarea' ? 'textarea' : type, options: opts, full: type === 'textarea', rows: 3 }));
    forms[g] = buildForm(fields, s[g], g);
    root.append(h('div', { class: 'card' }, h('h2', {}, title),
      g === 'lead' ? h('div', { class: 'note warn' }, 'E-mail notifications are sent by the server and work only if SMTP is configured in the server environment (see README). WhatsApp notifications are not implemented; the number is only stored.') : '',
      forms[g].grid));
  }
  const btn = h('button', { class: 'btn', type: 'submit' }, 'Save settings');
  root.onsubmit = async (e) => { e.preventDefault(); btn.disabled = true; try { await api('PUT', A('/settings'), Object.fromEntries(Object.entries(forms).map(([g, f]) => [g, f.collect()]))); toast('Settings saved'); } catch (x) { fail(x); } finally { btn.disabled = false; } };
  root.append(h('div', { class: 'actions' }, btn)); return root;
};

/* ---------- account ---------- */
RENDER.account = async () => {
  const { user } = await api('GET', A('/account'));
  const prof = buildForm([{ k: 'name', label: 'Name', def: user.name }, { k: 'email', label: 'Username / email (used to log in)' }, { k: 'current_password', label: 'Current password (required to confirm)', type: 'password', full: true }], { name: user.name, email: user.email, current_password: '' }, 'pf');
  const pw = buildForm([{ k: 'current_password', label: 'Current password', type: 'password' }, { k: 'new_password', label: 'New password (min 10 characters, letters and numbers)', type: 'password' }, { k: 'confirm_password', label: 'Confirm new password', type: 'password' }], { current_password: '', new_password: '', confirm_password: '' }, 'pw');
  const clear = (f) => f.grid.querySelectorAll('input[type=password]').forEach(i => { i.value = ''; });
  return h('div', {},
    h('form', { class: 'card', novalidate: true, onsubmit: async (e) => { e.preventDefault(); try { const r = await api('PUT', A('/account'), prof.collect()); me = r.user; toast('Profile updated'); clear(prof); } catch (x) { fail(x); } } },
      h('h2', {}, 'Profile'), prof.grid, h('p', { style: 'color:var(--mut);font-size:13px;margin-top:8px' }, `Last login: ${fmtDate(user.last_login)}`), h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'submit' }, 'Update profile'))),
    h('form', { class: 'card', novalidate: true, onsubmit: async (e) => { e.preventDefault(); try { const r = await api('PUT', A('/account/password'), pw.collect()); csrf = r.csrf; toast('Password changed. Other sessions were signed out.'); clear(pw); } catch (x) { fail(x); } } },
      h('h2', {}, 'Change password'), pw.grid, h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'submit' }, 'Change password'))));
};

/* ---------- start: ask the server whether we already have a valid session ---------- */
(async () => {
  try { const r = await api('GET', '/auth/me'); csrf = r.csrf; me = r.user; showApp(); } catch (_) { showLogin(); }
})();
})();
