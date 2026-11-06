/* =========================================================
   Medpharma — admin panel
   Reads and writes the same localStorage keys as the store
   (mp-products, mp-orders, mp-bookings, mp-messages, mp-settings),
   so changes here show up on the shop in this browser.
   ========================================================= */
(function () {
  'use strict';
  const D = window.MP_DATA;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rupee = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const catName = id => (D.CATEGORIES.find(c => c.id === id) || {}).name || id;
  const fmtDate = d => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  const store = {
    get(k, f) { try { const v = localStorage.getItem('mp-' + k); return v ? JSON.parse(v) : f; } catch (_) { return f; } },
    set(k, v) { try { localStorage.setItem('mp-' + k, JSON.stringify(v)); } catch (_) { toast('Could not save — browser storage is blocked'); } },
    del(k) { try { localStorage.removeItem('mp-' + k); } catch (_) {} }
  };

  /* ================= DATA ================= */
  const products = () => store.get('products', null) || D.DEFAULT_PRODUCTS.map(p => ({ ...p }));
  const saveProducts = list => store.set('products', list);
  const orders = () => store.get('orders', []).filter(o => Array.isArray(o.items));
  const saveOrders = list => store.set('orders', list);
  const productById = (list, id) => list.find(p => p.id === +id);

  // Same rule as the customer's "My orders" page
  const STATUSES = [['placed', 'Order placed'], ['packed', 'Packed'], ['out', 'Out for delivery'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled']];
  function statusOf(o) {
    if (o.status === 'cancelled') return 'cancelled';
    if (o.manual) return o.status;
    const mins = (Date.now() - new Date(o.date)) / 60000;
    return mins < 2 ? 'placed' : mins < 5 ? 'packed' : mins < 10 ? 'out' : 'delivered';
  }
  const statusLabel = s => (STATUSES.find(x => x[0] === s) || [s, s])[1];
  const chip = s => `<span class="st st-${s}">${esc(statusLabel(s) || s)}</span>`;

  /* ================= UI HELPERS ================= */
  let toastTimer;
  function toast(msg) {
    $('#toast-text').textContent = msg;
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
  }

  let lastFocus = null;
  function openModal(title, sub, html, wide) {
    lastFocus = document.activeElement;
    $('#modal-title').textContent = title;
    $('#modal-sub').textContent = sub || '';
    $('#modal-body').innerHTML = html;
    $('#modal').classList.toggle('wide', !!wide);
    $('#modal').classList.add('open');
    $('#modal').setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('show');
    document.body.classList.add('locked');
    setTimeout(() => { const f = $('#modal-body input, #modal-body select, #modal-body button'); (f || $('#modal .close')).focus(); }, 50);
  }
  function closeModal() {
    $('#modal').classList.remove('open');
    $('#modal').setAttribute('aria-hidden', 'true');
    $('#overlay').classList.remove('show');
    document.body.classList.remove('locked');
    if (lastFocus) lastFocus.focus();
  }
  function confirmBox(title, text, okLabel, onOk) {
    openModal(title, '', `<p style="color:var(--ink-soft)">${text}</p>
      <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:22px">
        <button type="button" class="btn btn-outline btn-sm" data-close>Cancel</button>
        <button type="button" class="btn btn-danger btn-sm" id="confirm-ok">${esc(okLabel)}</button>
      </div>`);
    $('#confirm-ok').addEventListener('click', () => { closeModal(); onOk(); });
  }
  $('#overlay').addEventListener('click', closeModal);
  document.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#modal').classList.contains('open')) closeModal();
    if (e.key === 'Tab' && $('#modal').classList.contains('open')) {
      const f = $$('button, input, select, textarea, a[href]', $('#modal')).filter(x => !x.disabled && x.offsetParent);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ================= AUTH (demo gate) ================= */
  const signedIn = () => { try { return sessionStorage.getItem('mp-admin') === '1'; } catch (_) { return false; } };
  function showApp() { $('#login').hidden = true; $('#shell').hidden = false; route(); }
  function showLogin() { $('#shell').hidden = true; $('#login').hidden = false; $('#l-user').focus(); }

  $('#login-form').addEventListener('submit', e => {
    e.preventDefault();
    if ($('#l-user').value.trim().toLowerCase() === 'admin' && $('#l-pass').value === 'medpharma') {
      try { sessionStorage.setItem('mp-admin', '1'); } catch (_) {}
      $('#login-err').textContent = '';
      showApp();
      toast('Welcome back, Admin');
    } else {
      $('#login-err').textContent = 'Incorrect username or password. Use the demo login shown below.';
      $('#l-pass').select();
    }
  });
  $('#logout').addEventListener('click', e => {
    e.preventDefault();
    try { sessionStorage.removeItem('mp-admin'); } catch (_) {}
    location.hash = '';
    showLogin();
  });

  // Mobile sidebar
  function setSide(open) { $('#side').classList.toggle('open', open); $('#overlay').classList.toggle('show', open); $('#menu-btn').setAttribute('aria-expanded', String(open)); }
  $('#menu-btn').addEventListener('click', () => setSide(!$('#side').classList.contains('open')));
  $('#overlay').addEventListener('click', () => setSide(false));

  /* ================= ROUTER ================= */
  const VIEWS = { dashboard: ['Dashboard', dashboard], orders: ['Orders', ordersView], products: ['Products', productsView], bookings: ['Bookings', bookingsView], messages: ['Messages', messagesView], settings: ['Settings', settingsView] };
  function route() {
    if (!signedIn()) return showLogin();
    const key = VIEWS[location.hash.slice(1)] ? location.hash.slice(1) : 'dashboard';
    const [title, render] = VIEWS[key];
    $('#view-title').textContent = title;
    document.title = `${title} — Medpharma Admin`;
    $$('.side [data-view]').forEach(a => { if (a.dataset.view === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    setSide(false);
    render($('#view'));
    updatePills();
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  function updatePills() {
    const pending = orders().filter(o => !['delivered', 'cancelled'].includes(statusOf(o))).length;
    const low = products().filter(p => p.active !== false && p.stock <= 5).length;
    const open = store.get('messages', []).filter(m => m.status !== 'resolved' && m.message).length;
    [['#pill-orders', pending], ['#pill-stock', low], ['#pill-msgs', open]].forEach(([s, n]) => { $(s).hidden = !n; $(s).textContent = n; });
  }

  /* ================= DASHBOARD ================= */
  function dashboard(el) {
    const os = orders(), live = os.filter(o => statusOf(o) !== 'cancelled');
    const ps = products(), bookings = store.get('bookings', []);
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const units = {};
    live.forEach(o => o.items.forEach(i => { units[i.id] = (units[i.id] || 0) + i.q; }));
    const pending = os.filter(o => ['placed', 'packed', 'out'].includes(statusOf(o))).length;
    const low = ps.filter(p => p.active !== false && p.stock <= 5);

    // Revenue by day, last 14 days
    const days = [...Array(14)].map((_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 13 + i); return d; });
    const byDay = days.map(d => live.filter(o => { const t = new Date(o.date); return t >= d && t < new Date(d.getTime() + 864e5); }).reduce((s, o) => s + o.total, 0));
    const max = Math.max(...byDay, 1);
    const W = 620, H = 200, bw = W / 14;
    const chart = `<svg class="chart" viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="Revenue for the last 14 days">
      ${[0.25, 0.5, 0.75, 1].map(f => `<line x1="0" x2="${W}" y1="${H - f * H + 4}" y2="${H - f * H + 4}" stroke="#e3ebe8" stroke-dasharray="3 4"/>`).join('')}
      ${byDay.map((v, i) => { const h = Math.max(v ? 4 : 0, v / max * (H - 10)); return `<rect x="${i * bw + 6}" y="${H - h + 4}" width="${bw - 12}" height="${h}" rx="5" fill="${i === 13 ? '#1fb07d' : '#37d39b'}"><title>${days[i].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${rupee(v)}</title></rect>`; }).join('')}
      ${days.map((d, i) => i % 2 ? '' : `<text x="${i * bw + bw / 2}" y="${H + 20}" text-anchor="middle">${d.getDate()}/${d.getMonth() + 1}</text>`).join('')}
    </svg>`;

    // Sales by category
    const byCat = D.CATEGORIES.map(c => ({ c, v: live.reduce((s, o) => s + o.items.filter(i => (productById(ps, i.id) || {}).cat === c.id).reduce((a, i) => a + i.price * i.q, 0), 0) })).sort((a, b) => b.v - a.v);
    const catMax = Math.max(...byCat.map(x => x.v), 1);
    const top = Object.entries(units).map(([id, q]) => ({ p: productById(ps, id), q })).filter(x => x.p).sort((a, b) => b.q - a.q).slice(0, 5);

    el.innerHTML = `
      ${os.length ? '' : `<div class="box" style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><b>No orders yet.</b> <span style="color:var(--muted)">Place an order in the store, or load sample data to see the dashboard in action.</span></div><button class="btn btn-dark btn-sm" id="seed">Load sample data</button></div>`}
      <div class="kpis">
        <div class="kpi"><span class="ic" style="background:var(--mint-tint)">💰</span><div><b>${rupee(revenue)}</b><span>Revenue</span></div></div>
        <div class="kpi"><span class="ic" style="background:#e6f1ff">📦</span><div><b>${live.length}</b><span>Orders · ${pending} in progress</span></div></div>
        <div class="kpi"><span class="ic" style="background:#fff6e2">🧾</span><div><b>${rupee(live.length ? revenue / live.length : 0)}</b><span>Avg. order value</span></div></div>
        <div class="kpi"><span class="ic" style="background:#efe6ff">🧪</span><div><b>${bookings.length}</b><span>Lab & doctor bookings</span></div></div>
        <div class="kpi"><span class="ic" style="background:#fff1ec">⚠️</span><div><b>${low.length}</b><span>Low-stock products</span></div></div>
      </div>
      <div class="two-col">
        <div class="box"><div class="box-head"><div><h2>Revenue</h2><p>Last 14 days · ${rupee(byDay.reduce((a, b) => a + b, 0))}</p></div></div>${chart}</div>
        <div class="box"><div class="box-head"><div><h2>Sales by category</h2><p>All time</p></div></div>
          <div class="bars">${byCat.map(({ c, v }) => `<div class="bar-row"><span>${esc(c.name)}</span><div class="track"><div class="fill" style="width:${v / catMax * 100}%"></div></div><b>${rupee(v)}</b></div>`).join('')}</div>
        </div>
      </div>
      <div class="two-col">
        <div class="box"><div class="box-head"><div><h2>Recent orders</h2></div><a class="link-arrow" href="#orders">All orders →</a></div>
          ${os.length ? `<div class="table-wrap"><table class="t"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th class="num">Total</th></tr></thead><tbody>
            ${os.slice(0, 6).map(o => `<tr><td><span class="name">${esc(o.id)}</span><div class="sub">${fmtDate(o.date)}</div></td><td>${esc(o.name)}<div class="sub">${esc(o.city)}</div></td><td>${chip(statusOf(o))}</td><td class="num"><b>${rupee(o.total)}</b></td></tr>`).join('')}
          </tbody></table></div>` : '<p class="empty-a">No orders yet.</p>'}
        </div>
        <div class="box"><div class="box-head"><div><h2>Top products</h2><p>By units sold</p></div></div>
          ${top.length ? `<div class="table-wrap"><table class="t"><tbody>${top.map(({ p, q }) => `<tr><td><img class="thumb-s" src="${esc(p.img)}" alt="" /></td><td><span class="name">${esc(p.name)}</span><div class="sub">${esc(p.brand)}</div></td><td class="num"><b>${q}</b> sold</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty-a">No sales yet.</p>'}
          ${low.length ? `<p style="margin-top:14px;font-size:.85rem;color:var(--coral);font-weight:700">⚠️ Low stock: ${low.map(p => `${esc(p.name)} (${p.stock})`).join(', ')} · <a class="link-arrow" href="#products">Restock →</a></p>` : ''}
        </div>
      </div>`;
    const seed = $('#seed');
    if (seed) seed.addEventListener('click', () => { loadSample(); route(); toast('Sample data loaded'); });
  }

  /* ================= ORDERS ================= */
  let orderFilter = { q: '', status: '' };
  function ordersView(el) {
    el.innerHTML = `
      <div class="box">
        <div class="toolbar-a">
          <input class="input search grow" id="o-q" type="search" placeholder="Search order ID, customer or phone…" value="${esc(orderFilter.q)}" aria-label="Search orders" />
          <select class="select-a" id="o-status" aria-label="Filter by status"><option value="">All statuses</option>${STATUSES.map(([k, l]) => `<option value="${k}" ${orderFilter.status === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
        </div>
        <div id="o-table"></div>
      </div>`;
    const draw = () => {
      const q = orderFilter.q.toLowerCase();
      const list = orders().filter(o => (!orderFilter.status || statusOf(o) === orderFilter.status) && (!q || `${o.id} ${o.name} ${o.phone}`.toLowerCase().includes(q)));
      $('#o-table').innerHTML = list.length ? `<div class="table-wrap"><table class="t">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Status</th><th class="num">Total</th><th></th></tr></thead>
        <tbody>${list.map(o => `<tr>
          <td><span class="name">${esc(o.id)}</span><div class="sub">${fmtDate(o.date)}</div></td>
          <td>${esc(o.name)}<div class="sub">+91 ${esc(o.phone)} · ${esc(o.city)}</div></td>
          <td>${o.items.reduce((a, i) => a + i.q, 0)}</td>
          <td><span class="sub" style="color:var(--ink-soft)">${esc(o.pay)}</span></td>
          <td><select data-status="${esc(o.id)}" aria-label="Status for ${esc(o.id)}">${STATUSES.map(([k, l]) => `<option value="${k}" ${statusOf(o) === k ? 'selected' : ''}>${l}</option>`).join('')}</select></td>
          <td class="num"><b>${rupee(o.total)}</b></td>
          <td><div class="actions-a"><button class="icon-s" data-view-order="${esc(o.id)}" aria-label="View order ${esc(o.id)}">👁</button></div></td>
        </tr>`).join('')}</tbody></table></div>
        <p style="font-size:.8rem;color:var(--muted);margin-top:10px">${list.length} order${list.length === 1 ? '' : 's'} · changing a status updates the customer's “My orders” page.</p>`
        : `<div class="empty-a"><b>No orders found</b>${orders().length ? 'Try a different search or status.' : 'Orders placed in the store will appear here.'}</div>`;
    };
    $('#o-q').addEventListener('input', e => { orderFilter.q = e.target.value; draw(); });
    $('#o-status').addEventListener('change', e => { orderFilter.status = e.target.value; draw(); });
    el.onchange = e => {
      const s = e.target.closest('[data-status]'); if (!s) return;
      const list = store.get('orders', []), o = list.find(x => x.id === s.dataset.status);
      o.status = s.value; o.manual = true;
      saveOrders(list); updatePills();
      toast(`${o.id} marked as ${statusLabel(s.value).toLowerCase()}`);
    };
    el.onclick = e => {
      const v = e.target.closest('[data-view-order]'); if (!v) return;
      const o = orders().find(x => x.id === v.dataset.viewOrder), ps = products();
      openModal(`Order ${o.id}`, `${fmtDate(o.date)} · ${statusLabel(statusOf(o))}`, `
        <div class="order-summary" style="margin-top:0">
          <div class="sum-row"><span>Customer</span><b>${esc(o.name)}</b></div>
          <div class="sum-row"><span>Phone</span><span>+91 ${esc(o.phone)}</span></div>
          <div class="sum-row"><span>Address</span><span style="text-align:right">${esc(o.address)}, ${esc(o.city)} ${esc(o.pin)}</span></div>
          <div class="sum-row"><span>Payment</span><span>${esc(o.pay)}</span></div>
        </div>
        <div class="table-wrap" style="margin-top:14px"><table class="t"><tbody>
          ${o.items.map(i => { const p = productById(ps, i.id) || { name: 'Removed product', img: '' }; return `<tr><td>${p.img ? `<img class="thumb-s" src="${esc(p.img)}" alt="" />` : ''}</td><td class="name">${esc(p.name)}</td><td>× ${i.q}</td><td class="num">${rupee(i.price * i.q)}</td></tr>`; }).join('')}
        </tbody></table></div>
        <div class="order-summary">
          <div class="sum-row"><span>Subtotal</span><span>${rupee(o.subtotal)}</span></div>
          <div class="sum-row"><span>Delivery</span><span>${o.shipping ? rupee(o.shipping) : 'FREE'}</span></div>
          <div class="sum-row total"><span>Total</span><span>${rupee(o.total)}</span></div>
        </div>`, true);
    };
    draw();
  }

  /* ================= PRODUCTS ================= */
  let prodFilter = { q: '', cat: '' };
  const IMAGES = [...new Set(D.DEFAULT_PRODUCTS.map(p => p.img).concat(D.CATEGORIES.map(c => c.img)))];

  function productsView(el) {
    el.innerHTML = `
      <div class="box">
        <div class="toolbar-a">
          <input class="input search grow" id="p-q" type="search" placeholder="Search products or brands…" value="${esc(prodFilter.q)}" aria-label="Search products" />
          <select class="select-a" id="p-cat" aria-label="Filter by category"><option value="">All categories</option>${D.CATEGORIES.map(c => `<option value="${c.id}" ${prodFilter.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
          <button class="btn btn-dark btn-sm" id="p-add">+ Add product</button>
        </div>
        <div id="p-table"></div>
      </div>`;
    const draw = () => {
      const q = prodFilter.q.toLowerCase();
      const list = products().filter(p => (!prodFilter.cat || p.cat === prodFilter.cat) && (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)));
      $('#p-table').innerHTML = list.length ? `<div class="table-wrap"><table class="t">
        <thead><tr><th></th><th>Product</th><th>Category</th><th class="num">Price</th><th class="num">MRP</th><th class="num">Stock</th><th>Visible</th><th></th></tr></thead>
        <tbody>${list.map(p => `<tr>
          <td><img class="thumb-s" src="${esc(p.img)}" alt="" /></td>
          <td><span class="name">${esc(p.name)}</span>${p.rx ? ' <span class="st st-packed">Rx</span>' : ''}${p.isNew ? ' <span class="st st-delivered">New</span>' : ''}<div class="sub">${esc(p.brand)} · ${esc(p.pack)}</div></td>
          <td>${esc(catName(p.cat))}</td>
          <td class="num"><b>${rupee(p.price)}</b></td>
          <td class="num sub">${rupee(p.mrp)}</td>
          <td class="num"><label class="sr-only" for="st-${p.id}">Stock for ${esc(p.name)}</label><input class="stock ${p.stock <= 5 ? 'low' : ''}" id="st-${p.id}" type="number" min="0" value="${p.stock}" data-stock="${p.id}" /></td>
          <td><label class="switch"><input type="checkbox" data-active="${p.id}" ${p.active !== false ? 'checked' : ''} aria-label="Show ${esc(p.name)} in store" /><span></span></label></td>
          <td><div class="actions-a"><a class="icon-s" href="product.html?id=${p.id}" target="_blank" rel="noopener" aria-label="Open in store">↗</a><button class="icon-s" data-edit="${p.id}" aria-label="Edit ${esc(p.name)}">✎</button><button class="icon-s danger" data-del="${p.id}" aria-label="Delete ${esc(p.name)}">🗑</button></div></td>
        </tr>`).join('')}</tbody></table></div>
        <p style="font-size:.8rem;color:var(--muted);margin-top:10px">${list.length} product${list.length === 1 ? '' : 's'} · stock and visibility save instantly.</p>`
        : '<div class="empty-a"><b>No products found</b>Try a different search or category.</div>';
    };
    $('#p-q').addEventListener('input', e => { prodFilter.q = e.target.value; draw(); });
    $('#p-cat').addEventListener('change', e => { prodFilter.cat = e.target.value; draw(); });
    $('#p-add').addEventListener('click', () => productForm(null, draw));
    el.onchange = e => {
      const list = products();
      const s = e.target.closest('[data-stock]');
      if (s) { const p = productById(list, s.dataset.stock); p.stock = Math.max(0, Math.floor(+s.value || 0)); saveProducts(list); s.classList.toggle('low', p.stock <= 5); updatePills(); toast(`${p.name}: stock ${p.stock}`); }
      const a = e.target.closest('[data-active]');
      if (a) { const p = productById(list, a.dataset.active); p.active = a.checked; saveProducts(list); toast(`${p.name} ${a.checked ? 'is visible' : 'is hidden'} in the store`); }
    };
    el.onclick = e => {
      const ed = e.target.closest('[data-edit]');
      if (ed) productForm(productById(products(), ed.dataset.edit), draw);
      const del = e.target.closest('[data-del]');
      if (del) {
        const p = productById(products(), del.dataset.del);
        confirmBox('Delete product?', `<b>${esc(p.name)}</b> will be removed from the store. Past orders keep their history. Tip: use the Visible switch to hide it instead.`, 'Delete', () => {
          saveProducts(products().filter(x => x.id !== p.id)); draw(); updatePills(); toast(`${p.name} deleted`);
        });
      }
    };
    draw();
  }

  function productForm(p, done) {
    const isNew = !p;
    p = p || { name: '', brand: '', pack: '', cat: D.CATEGORIES[0].id, price: '', mrp: '', stock: 25, img: IMAGES[0], desc: '', highlights: [], use: '', isNew: true, rx: false, rating: 4.5, reviews: 0, sold: 0, active: true };
    openModal(isNew ? 'Add product' : 'Edit product', isNew ? 'New products appear in the store straight away.' : esc(p.name), `
      <form id="pf" novalidate>
        <div class="form-grid two">
          <div class="field full"><label for="pf-name">Product name</label><input id="pf-name" value="${esc(p.name)}" /><p class="err">Please enter a product name.</p></div>
          <div class="field"><label for="pf-brand">Brand</label><input id="pf-brand" value="${esc(p.brand)}" /><p class="err">Please enter a brand.</p></div>
          <div class="field"><label for="pf-pack">Pack size</label><input id="pf-pack" value="${esc(p.pack)}" placeholder="e.g. 60 tablets" /><p class="err">Please enter a pack size.</p></div>
          <div class="field"><label for="pf-cat">Category</label><select id="pf-cat">${D.CATEGORIES.map(c => `<option value="${c.id}" ${p.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
          <div class="field"><label for="pf-stock">Stock</label><input id="pf-stock" type="number" min="0" value="${p.stock}" /><p class="err">Stock must be 0 or more.</p></div>
          <div class="field"><label for="pf-price">Selling price (₹)</label><input id="pf-price" type="number" min="1" value="${p.price}" /><p class="err">Enter a price above 0.</p></div>
          <div class="field"><label for="pf-mrp">MRP (₹)</label><input id="pf-mrp" type="number" min="1" value="${p.mrp}" /><p class="err">MRP must be at least the selling price.</p></div>
          <div class="field full"><label>Image</label>
            <div class="img-pick">${IMAGES.map(src => `<label><input type="radio" name="pf-img" value="${src}" ${p.img === src ? 'checked' : ''} /><img src="${src}" alt="${src.split('/').pop()}" /></label>`).join('')}</div>
          </div>
          <div class="field full"><label for="pf-desc">Description</label><textarea id="pf-desc">${esc(p.desc)}</textarea><p class="err">Please add a short description.</p></div>
          <div class="field full"><label for="pf-hl">Key benefits (one per line)</label><textarea id="pf-hl">${esc((p.highlights || []).join('\n'))}</textarea></div>
          <div class="field full"><label for="pf-use">How to use</label><input id="pf-use" value="${esc(p.use)}" /></div>
          <div class="field full check-row">
            <label><input type="checkbox" id="pf-new" ${p.isNew ? 'checked' : ''} /> Mark as new</label>
            <label><input type="checkbox" id="pf-rx" ${p.rx ? 'checked' : ''} /> Prescription required</label>
            <label><input type="checkbox" id="pf-active" ${p.active !== false ? 'checked' : ''} /> Visible in store</label>
          </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px">
          <button type="button" class="btn btn-outline btn-sm" data-close>Cancel</button>
          <button type="submit" class="btn btn-dark btn-sm">${isNew ? 'Add product' : 'Save changes'}</button>
        </div>
      </form>`, true);

    $('#pf').addEventListener('submit', e => {
      e.preventDefault();
      const v = id => $('#' + id).value.trim();
      const price = +v('pf-price'), mrp = +v('pf-mrp'), stock = +v('pf-stock');
      const rules = [['pf-name', v('pf-name').length >= 2], ['pf-brand', v('pf-brand').length >= 2], ['pf-pack', !!v('pf-pack')],
        ['pf-stock', v('pf-stock') !== '' && stock >= 0], ['pf-price', price > 0], ['pf-mrp', mrp >= price && mrp > 0], ['pf-desc', v('pf-desc').length >= 10]];
      rules.forEach(([id, ok]) => $('#' + id).closest('.field').classList.toggle('invalid', !ok));
      const bad = rules.find(r => !r[1]);
      if (bad) { $('#' + bad[0]).focus(); return; }
      const list = products();
      const data = {
        name: v('pf-name'), brand: v('pf-brand'), pack: v('pf-pack'), cat: v('pf-cat'), price, mrp, stock: Math.floor(stock),
        img: $('input[name="pf-img"]:checked').value, desc: v('pf-desc'), use: v('pf-use') || 'Use as directed on the label.',
        highlights: v('pf-hl').split('\n').map(s => s.trim()).filter(Boolean),
        isNew: $('#pf-new').checked, rx: $('#pf-rx').checked, active: $('#pf-active').checked
      };
      if (isNew) list.push({ ...p, ...data, id: Math.max(0, ...list.map(x => x.id), ...D.DEFAULT_PRODUCTS.map(x => x.id)) + 1 });
      else Object.assign(productById(list, p.id), data);
      saveProducts(list);
      closeModal(); done(); updatePills();
      toast(isNew ? `${data.name} added to the store` : 'Changes saved');
    });
    $('#pf').addEventListener('input', e => { const f = e.target.closest('.field.invalid'); if (f) f.classList.remove('invalid'); });
  }

  /* ================= BOOKINGS ================= */
  function bookingsView(el) {
    const list = store.get('bookings', []);
    el.innerHTML = `<div class="box">${list.length ? `<div class="table-wrap"><table class="t">
      <thead><tr><th>Ref</th><th>Type</th><th>Booking</th><th>When</th><th class="num">Fee</th><th>Status</th></tr></thead>
      <tbody>${list.map((b, i) => `<tr>
        <td class="name">${esc(b.id)}<div class="sub">${b.created ? fmtDate(b.created) : ''}</div></td>
        <td>${b.type === 'lab' ? '🧪 Lab test' : '👩‍⚕️ Doctor'}</td>
        <td>${esc(b.title)}</td>
        <td>${esc(b.when)}</td>
        <td class="num"><b>${rupee(b.price)}</b></td>
        <td><select data-booking="${i}" aria-label="Status for ${esc(b.id)}">${['confirmed', 'completed', 'cancelled'].map(s => `<option value="${s}" ${(b.status || 'confirmed') === s ? 'selected' : ''}>${s[0].toUpperCase() + s.slice(1)}</option>`).join('')}</select></td>
      </tr>`).join('')}</tbody></table></div>` : '<div class="empty-a"><b>No bookings yet</b>Lab test and doctor bookings from the store appear here.</div>'}</div>`;
    el.onchange = e => {
      const s = e.target.closest('[data-booking]'); if (!s) return;
      const all = store.get('bookings', []); all[+s.dataset.booking].status = s.value; store.set('bookings', all);
      toast(`${all[+s.dataset.booking].id} marked ${s.value}`);
    };
    el.onclick = null;
  }

  /* ================= MESSAGES ================= */
  function messagesView(el) {
    const list = store.get('messages', []).filter(m => m.message);
    el.innerHTML = `<div class="box"><div style="display:grid;gap:12px">${list.length ? list.map((m, i) => `
      <article class="msg">
        <div class="msg-head">
          <div><b>${esc(m.name)} · ${esc(m.topic)}</b><span>${esc(m.email)}${m.phone ? ' · +91 ' + esc(m.phone) : ''}${m.order ? ' · Order ' + esc(m.order) : ''} · ${fmtDate(m.date)} · ${esc(m.ticket)}</span></div>
          <span class="st st-${m.status === 'resolved' ? 'resolved' : 'open'}">${m.status === 'resolved' ? 'Resolved' : 'Open'}</span>
        </div>
        <p>${esc(m.message)}</p>
        <div class="actions-a" style="justify-content:flex-start">
          <a class="btn btn-outline btn-sm" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Re: ' + m.topic + ' (' + m.ticket + ')')}">Reply by email</a>
          <button class="btn btn-sm ${m.status === 'resolved' ? 'btn-outline' : 'btn-dark'}" data-resolve="${esc(m.ticket)}">${m.status === 'resolved' ? 'Reopen' : 'Mark resolved'}</button>
        </div>
      </article>`).join('') : '<div class="empty-a"><b>No messages yet</b>Messages sent from the Contact page appear here.</div>'}</div></div>`;
    el.onclick = e => {
      const r = e.target.closest('[data-resolve]'); if (!r) return;
      const all = store.get('messages', []), m = all.find(x => x.ticket === r.dataset.resolve);
      m.status = m.status === 'resolved' ? 'open' : 'resolved';
      store.set('messages', all); messagesView(el); updatePills();
      toast(`${m.ticket} ${m.status === 'resolved' ? 'resolved' : 'reopened'}`);
    };
    el.onchange = null;
  }

  /* ================= SETTINGS ================= */
  function settingsView(el) {
    const s = Object.assign({}, D.SETTINGS, store.get('settings', {}));
    el.innerHTML = `
      <div class="box">
        <div class="box-head"><div><h2>Store settings</h2><p>Changes apply to the shop immediately.</p></div></div>
        <form id="sf" novalidate>
          <div class="form-grid two">
            <div class="field"><label for="sf-free">Free delivery above (₹)</label><input id="sf-free" type="number" min="0" value="${s.freeShipping}" /><p class="err">Enter 0 or more.</p></div>
            <div class="field"><label for="sf-fee">Delivery fee (₹)</label><input id="sf-fee" type="number" min="0" value="${s.shippingFee}" /><p class="err">Enter 0 or more.</p></div>
            <div class="field full"><label for="sf-ann">Announcement bar</label><input id="sf-ann" maxlength="120" value="${esc(s.announcement)}" /><p class="err">Keep it between 5 and 120 characters.</p></div>
          </div>
          <button class="btn btn-dark btn-sm" type="submit" style="margin-top:16px">Save settings</button>
        </form>
      </div>
      <div class="box">
        <div class="box-head"><div><h2>Data</h2><p>Everything is stored in this browser.</p></div></div>
        <div class="actions-a" style="justify-content:flex-start;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" id="export">⬇ Export data (JSON)</button>
          <button class="btn btn-outline btn-sm" id="seed2">Load sample data</button>
        </div>
      </div>
      <div class="box danger-zone">
        <div class="box-head"><div><h2>Danger zone</h2><p>These actions can't be undone.</p></div></div>
        <div class="actions-a" style="justify-content:flex-start;flex-wrap:wrap">
          <button class="btn btn-outline btn-sm" id="reset-cat">Reset product catalogue</button>
          <button class="btn btn-danger btn-sm" id="wipe">Delete all orders, bookings & messages</button>
        </div>
      </div>`;
    $('#sf').addEventListener('submit', e => {
      e.preventDefault();
      const free = $('#sf-free').value, fee = $('#sf-fee').value, ann = $('#sf-ann').value.trim();
      const ok = [['sf-free', free !== '' && +free >= 0], ['sf-fee', fee !== '' && +fee >= 0], ['sf-ann', ann.length >= 5]];
      ok.forEach(([id, good]) => $('#' + id).closest('.field').classList.toggle('invalid', !good));
      if (ok.some(x => !x[1])) return;
      store.set('settings', { freeShipping: +free, shippingFee: +fee, announcement: ann });
      toast('Settings saved — refresh the store to see them');
    });
    $('#export').addEventListener('click', () => {
      const data = { exported: new Date().toISOString(), settings: store.get('settings', {}), products: products(), orders: orders(), bookings: store.get('bookings', []), messages: store.get('messages', []) };
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      a.download = `medpharma-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#seed2').addEventListener('click', () => { loadSample(); updatePills(); toast('Sample data loaded'); });
    $('#reset-cat').addEventListener('click', () => confirmBox('Reset catalogue?', 'All product edits, added products and stock levels go back to the original catalogue.', 'Reset catalogue', () => { store.del('products'); updatePills(); toast('Catalogue reset'); }));
    $('#wipe').addEventListener('click', () => confirmBox('Delete all data?', 'All orders, bookings and messages in this browser will be permanently deleted.', 'Delete everything', () => { ['orders', 'bookings', 'messages'].forEach(store.del); updatePills(); toast('All orders, bookings and messages deleted'); }));
    el.onclick = el.onchange = null;
  }

  /* ================= SAMPLE DATA ================= */
  function loadSample() {
    const ps = products().filter(p => p.active !== false);
    const names = ['Asha Verma', 'Rohan Gupta', 'Simran Kaur', 'Karan Malhotra', 'Neha Sharma', 'Aman Sethi', 'Priya Bansal', 'Harpreet Singh', 'Ritika Jain', 'Vikas Arora'];
    const cities = [['Chandigarh', '1600'], ['Mohali', '1400'], ['Panchkula', '1341']];
    const rnd = n => Math.floor(Math.random() * n);
    const out = [];
    for (let i = 0; i < 32; i++) {
      const date = new Date(Date.now() - rnd(14 * 24) * 3600e3 - rnd(3600e3));
      const items = [...new Map([...Array(1 + rnd(3))].map(() => { const p = ps[rnd(ps.length)]; return [p.id, { id: p.id, q: 1 + rnd(2), price: p.price }]; })).values()];
      const subtotal = items.reduce((s, it) => s + it.price * it.q, 0);
      const shipping = subtotal >= 499 ? 0 : 49;
      const [city, pre] = cities[rnd(3)];
      const ageH = (Date.now() - date) / 3600e3;
      out.push({
        id: 'MP-' + (date.getTime().toString(36).toUpperCase().slice(-6)), date: date.toISOString(), manual: true,
        status: rnd(12) === 0 ? 'cancelled' : ageH > 24 ? 'delivered' : ['placed', 'packed', 'out'][rnd(3)],
        items, subtotal, shipping, total: subtotal + shipping, name: names[rnd(names.length)], phone: '98' + String(10000000 + rnd(89999999)),
        address: `House ${1 + rnd(400)}, Sector ${1 + rnd(60)}`, city, pin: pre + String(rnd(99)).padStart(2, '0'), pay: rnd(2) ? 'Cash on delivery' : 'UPI on delivery'
      });
    }
    out.sort((a, b) => new Date(b.date) - new Date(a.date));
    saveOrders([...orders(), ...out].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 100));
    const bookings = [...Array(8)].map((_, i) => {
      const lab = i % 2 === 0, t = lab ? D.LAB_TESTS[rnd(D.LAB_TESTS.length)] : D.DOCTORS[rnd(D.DOCTORS.length)];
      const spec = lab ? null : D.SPECS.find(s => s.id === t.spec);
      return { id: (lab ? 'LAB-' : 'DOC-') + Math.random().toString(36).slice(2, 8).toUpperCase(), type: lab ? 'lab' : 'consult', title: lab ? t.name : `${t.name} (${spec.name})`, price: lab ? t.price : spec.fee, when: `${1 + rnd(28)} Nov, ${['8–9 AM', '10–11 AM', '5:30 pm', '7:00 pm'][rnd(4)]}`, status: ['confirmed', 'completed'][rnd(2)], created: new Date(Date.now() - rnd(7) * 864e5).toISOString() };
    });
    store.set('bookings', [...store.get('bookings', []), ...bookings]);
    const msgs = [
      ['Order help', 'Hi, my order has not arrived yet. Can you please check the status?'],
      ['Prescription', 'I uploaded my prescription yesterday but nobody has called me back.'],
      ['Returns & refunds', 'I received the wrong pack size of sunscreen. How can I exchange it?'],
      ['Lab test booking', 'Can I reschedule my full body checkup to Sunday morning?']
    ].map(([topic, message], i) => ({ ticket: 'TKT-' + Math.random().toString(36).slice(2, 8).toUpperCase(), topic, message, name: names[i], email: names[i].split(' ')[0].toLowerCase() + '@example.com', phone: '', order: '', status: i === 3 ? 'resolved' : 'open', date: new Date(Date.now() - rnd(3) * 864e5 - rnd(36e5)).toISOString() }));
    store.set('messages', [...msgs, ...store.get('messages', [])]);
  }

  /* ================= START ================= */
  signedIn() ? showApp() : showLogin();
})();
