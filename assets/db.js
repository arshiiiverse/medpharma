/* =========================================================
   Medpharma — Supabase client (REST + Auth over fetch, no SDK)
   MPDB.enabled is false when assets/config.js is empty; the
   store and admin panel then fall back to browser storage.
   ========================================================= */
window.MPDB = (function () {
  'use strict';
  const cfg = window.MP_CONFIG || {};
  const base = String(cfg.supabaseUrl || '').replace(/\/+$/, '');
  const key = String(cfg.supabaseKey || '');
  const enabled = !!(base && key);

  /* ---------- Session (admin only) ---------- */
  const SKEY = 'mp-session';
  let session = null;
  try { session = JSON.parse(sessionStorage.getItem(SKEY)); } catch (_) { session = null; }
  function setSession(s) {
    session = s ? { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at || (Math.floor(Date.now() / 1000) + (s.expires_in || 3600)), email: (s.user && s.user.email) || (session && session.email) } : null;
    try { s ? sessionStorage.setItem(SKEY, JSON.stringify(session)) : sessionStorage.removeItem(SKEY); } catch (_) {}
  }

  async function raw(path, { method = 'GET', body, token, headers = {} } = {}) {
    const h = { apikey: key, 'Content-Type': 'application/json', ...headers };
    if (token) h.Authorization = 'Bearer ' + token;
    let res;
    try {
      res = await fetch(base + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    } catch (_) {
      throw new Error('Could not reach the server. Check your internet connection and try again.');
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.error_description || data.msg || data.error)) || `Request failed (${res.status})`;
      const err = new Error(msg); err.status = res.status; throw err;
    }
    return data;
  }

  async function freshToken() {
    if (!session) return null;
    if (session.expires_at - 60 > Date.now() / 1000) return session.access_token;
    try {
      const s = await raw('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } });
      setSession(s);
      return session.access_token;
    } catch (_) { setSession(null); return null; }
  }

  async function api(path, opts = {}) {
    const token = opts.auth ? await freshToken() : null;
    if (opts.auth && !token) { const e = new Error('Your admin session has expired. Please sign in again.'); e.status = 401; throw e; }
    return raw(path, { ...opts, token });
  }
  const rpc = (fn, args, auth) => api(`/rest/v1/rpc/${fn}`, { method: 'POST', body: args, auth });
  const q = encodeURIComponent;

  /* ---------- Row <-> app object mapping ---------- */
  const toProduct = r => ({
    id: r.id, name: r.name, brand: r.brand, pack: r.pack, cat: r.cat, price: r.price, mrp: r.mrp, stock: r.stock,
    rating: +r.rating, reviews: r.reviews, sold: r.sold, isNew: r.is_new, rx: r.rx, active: r.active, img: r.img,
    desc: r.description, highlights: r.highlights || [], use: r.usage
  });
  const fromProduct = p => ({
    name: p.name, brand: p.brand, pack: p.pack, cat: p.cat, price: p.price, mrp: p.mrp, stock: p.stock,
    rating: p.rating ?? 4.5, reviews: p.reviews ?? 0, sold: p.sold ?? 0, is_new: !!p.isNew, rx: !!p.rx, active: p.active !== false,
    img: p.img, description: p.desc || '', highlights: p.highlights || [], usage: p.use || ''
  });
  const toSettings = r => r ? ({ freeShipping: r.free_shipping, shippingFee: r.shipping_fee, announcement: r.announcement }) : null;
  const toOrder = r => ({
    id: r.id, date: r.created_at, status: r.status, manual: true, items: r.items, subtotal: r.subtotal, shipping: r.shipping,
    total: r.total, name: r.name, phone: r.phone, address: r.address, city: r.city, pin: r.pin, pay: r.pay
  });
  const toBooking = r => ({ id: r.id, created: r.created_at, type: r.type, title: r.title, price: r.price, when: r.when_text, name: r.name, phone: r.phone, status: r.status });
  const toMessage = r => ({ ticket: r.ticket, date: r.created_at, topic: r.topic, name: r.name, email: r.email, phone: r.phone, order: r.order_ref, message: r.message, status: r.status });

  return {
    enabled,

    /* ---------- Public (shoppers) ---------- */
    async catalog() { return (await api('/rest/v1/products?select=*&order=id')).map(toProduct); },
    async settings() { const r = await api('/rest/v1/settings?select=*&id=eq.1'); return toSettings(r && r[0]); },
    async placeOrder(o) {
      return rpc('place_order', { p_items: o.items.map(i => ({ id: i.id, q: i.q })), p_name: o.name, p_phone: o.phone, p_address: o.address, p_city: o.city, p_pin: o.pin, p_pay: o.pay });
    },
    async myOrders(refs) { return refs.length ? (await rpc('my_orders', { p_refs: refs })).map(toOrder) : []; },
    async cancelOrder(id, phone) { return rpc('cancel_order', { p_id: id, p_phone: phone }); },
    async addBooking(b) { return rpc('add_booking', { p_type: b.type, p_title: b.title, p_price: b.price, p_when: b.when, p_name: b.name || '', p_phone: b.phone }); },
    async addMessage(m) { return rpc('add_message', { p_topic: m.topic, p_name: m.name, p_email: m.email, p_phone: m.phone || '', p_order: m.order || '', p_message: m.message }); },

    /* ---------- Admin ---------- */
    signedIn: () => !!session,
    email: () => session && session.email,
    async signIn(email, password) {
      let s;
      try { s = await raw('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } }); }
      catch (e) { throw new Error(e.status === 400 ? 'Incorrect email or password.' : e.message); }
      setSession(s);
      const ok = await rpc('is_admin', {}, true);
      if (!ok) { setSession(null); throw new Error('This account is not an admin. Add its email to the admins table in Supabase.'); }
      return true;
    },
    async signOut() {
      const token = session && session.access_token;
      setSession(null);
      if (token) { try { await raw('/auth/v1/logout', { method: 'POST', token }); } catch (_) {} }
    },
    async adminProducts() { return (await api('/rest/v1/products?select=*&order=id', { auth: true })).map(toProduct); },
    async saveProduct(p) {
      if (p.id) return api(`/rest/v1/products?id=eq.${q(p.id)}`, { method: 'PATCH', body: fromProduct(p), auth: true, headers: { Prefer: 'return=minimal' } });
      return api('/rest/v1/products', { method: 'POST', body: fromProduct(p), auth: true, headers: { Prefer: 'return=minimal' } });
    },
    async patchProduct(id, fields) {
      const body = {};
      if ('stock' in fields) body.stock = fields.stock;
      if ('active' in fields) body.active = fields.active;
      return api(`/rest/v1/products?id=eq.${q(id)}`, { method: 'PATCH', body, auth: true, headers: { Prefer: 'return=minimal' } });
    },
    async deleteProduct(id) { return api(`/rest/v1/products?id=eq.${q(id)}`, { method: 'DELETE', auth: true }); },
    async orders() { return (await api('/rest/v1/orders?select=*&order=created_at.desc&limit=500', { auth: true })).map(toOrder); },
    async setOrderStatus(id, status) { return api(`/rest/v1/orders?id=eq.${q(id)}`, { method: 'PATCH', body: { status }, auth: true, headers: { Prefer: 'return=minimal' } }); },
    async bookings() { return (await api('/rest/v1/bookings?select=*&order=created_at.desc&limit=500', { auth: true })).map(toBooking); },
    async setBookingStatus(id, status) { return api(`/rest/v1/bookings?id=eq.${q(id)}`, { method: 'PATCH', body: { status }, auth: true, headers: { Prefer: 'return=minimal' } }); },
    async messages() { return (await api('/rest/v1/messages?select=*&order=created_at.desc&limit=500', { auth: true })).map(toMessage); },
    async setMessageStatus(ticket, status) { return api(`/rest/v1/messages?ticket=eq.${q(ticket)}`, { method: 'PATCH', body: { status }, auth: true, headers: { Prefer: 'return=minimal' } }); },
    async saveSettings(s) { return api('/rest/v1/settings?id=eq.1', { method: 'PATCH', body: { free_shipping: s.freeShipping, shipping_fee: s.shippingFee, announcement: s.announcement }, auth: true, headers: { Prefer: 'return=minimal' } }); }
  };
})();
