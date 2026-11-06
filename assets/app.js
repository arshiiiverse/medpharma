/* =========================================================
   Medpharma — shared app code (every page loads this)
   Header, footer, cart, wishlist, checkout and booking forms.
   Exposes window.MP for page scripts.
   ========================================================= */
(function () {
  'use strict';
  const { CATEGORIES, PRODUCTS, LAB_TESTS, SPECS, DOCTORS } = window.MP_DATA;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ================= HELPERS ================= */
  const FREE_SHIPPING = 499, SHIPPING_FEE = 49, MAX_QTY = 10;
  const rupee = n => '₹' + n.toLocaleString('en-IN');
  const discount = p => Math.round((1 - p.price / p.mrp) * 100);
  const byId = id => PRODUCTS.find(p => p.id === +id);
  const catById = id => CATEGORIES.find(c => c.id === id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const productUrl = p => `product.html?id=${p.id}`;
  const page = document.body.dataset.page || '';

  const store = {
    get(k, fallback) { try { const v = localStorage.getItem('mp-' + k); return v ? JSON.parse(v) : fallback; } catch (_) { return fallback; } },
    set(k, v) { try { localStorage.setItem('mp-' + k, JSON.stringify(v)); } catch (_) { /* storage blocked */ } }
  };

  const ICON = {
    search: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>',
    cart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>',
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"/></svg>',
    tick: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M5 12l5 5L20 7"/></svg>'
  };

  /* ================= SHARED HEADER & FOOTER ================= */
  const catOptions = sel => CATEGORIES.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${c.name}</option>`).join('');
  const params = new URLSearchParams(location.search);

  function headerHTML() {
    const q = page === 'catalog' ? esc(params.get('q') || '') : '';
    const cat = page === 'catalog' ? params.get('cat') : '';
    const nav = [
      ['catalog.html', 'All Products', ''],
      ['catalog.html?tag=under', 'Under ₹500', ''],
      ['catalog.html?tag=new', 'New Arrivals', 'var(--mint-dark)'],
      ['catalog.html?sort=popular', 'Best Selling', 'var(--blue)'],
      ['catalog.html?tag=offer', 'Offers 20%+', 'var(--coral)']
    ];
    const here = location.pathname.split('/').pop() + location.search;
    return `
      <a href="#main" class="skip">Skip to content</a>
      <div class="strip"><div class="wrap">
        <p>🚚 <b>Free delivery</b> on orders above ₹${FREE_SHIPPING} · Delivered within 24 hours</p>
        <p class="hide-sm strip-links"><a href="lab-tests.html">Lab Tests</a> · <a href="doctors.html">Doctors</a> · <a href="orders.html">Track Order</a> · <a href="faq.html">Help</a></p>
      </div></div>
      <header class="header">
        <div class="wrap">
          <div class="header-row">
            <a href="index.html" class="logo" aria-label="Medpharma home"><img src="assets/logo-mark.svg" alt="" width="38" height="38" /><span>Med<span class="p">pharma</span></span></a>
            <form class="search" role="search" action="catalog.html" method="get">
              <label class="sr-only" for="search-cat">Category</label>
              <select id="search-cat" name="cat"><option value="">All Categories</option>${catOptions(cat)}</select>
              <span class="divider"></span>
              <label class="sr-only" for="search-input">Search products</label>
              <input id="search-input" name="q" type="search" value="${q}" placeholder="Search medicines, vitamins, skincare…" autocomplete="off" />
              <button type="submit" aria-label="Search">${ICON.search}</button>
            </form>
            <div class="header-right">
              <div class="location">
                <span class="pin">${ICON.pin}</span>
                <span>Deliver to
                  <label class="sr-only" for="city">Delivery city</label>
                  <select id="city"><option>Chandigarh</option><option>Mohali</option><option>Panchkula</option></select>
                </span>
              </div>
              <button class="icon-btn mobile-search-btn" id="mobile-search-btn" aria-label="Open search" aria-expanded="false" aria-controls="mobile-search">${ICON.search}</button>
              <button class="icon-btn" id="wish-btn" data-open="wishlist" aria-label="Open wishlist">${ICON.heart.replace('width="16" height="16"', 'width="19" height="19"')}<span class="count" id="wish-count">0</span></button>
              <button class="icon-btn" id="cart-btn" data-open="cart" aria-label="Open cart">${ICON.cart}<span class="count" id="cart-count">0</span></button>
            </div>
          </div>
          <div class="mobile-search" id="mobile-search">
            <form class="search" role="search" action="catalog.html" method="get">
              <label class="sr-only" for="m-search-cat">Category</label>
              <select id="m-search-cat" name="cat"><option value="">All</option>${catOptions(cat)}</select>
              <span class="divider"></span>
              <label class="sr-only" for="m-search-input">Search products</label>
              <input id="m-search-input" name="q" type="search" value="${q}" placeholder="Search products…" autocomplete="off" />
              <button type="submit" aria-label="Search">${ICON.search}</button>
            </form>
          </div>
          <div class="nav-row">
            <div class="cat-menu">
              <button type="button" class="cat-menu-btn" id="cat-menu-btn" aria-expanded="false" aria-controls="cat-menu-list">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                Categories
                <svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <ul class="cat-menu-list" id="cat-menu-list" hidden>
                ${CATEGORIES.map(c => `<li><a href="catalog.html?cat=${c.id}" ${here === 'catalog.html?cat=' + c.id ? 'aria-current="page"' : ''}><img src="${c.img}" alt="" width="36" height="36" loading="lazy" /><span>${c.name}<small>${PRODUCTS.filter(p => p.cat === c.id).length} products</small></span></a></li>`).join('')}
                <li class="all"><a href="catalog.html">View all products →</a></li>
              </ul>
            </div>
            <nav class="cat-nav" aria-label="Shop">
              ${nav.map(([href, label, dot]) => `<a href="${href}" ${href === here ? 'aria-current="page"' : ''}>${dot ? `<span class="dot" style="background:${dot}"></span>` : ''}${label}</a>`).join('')}
              <a href="lab-tests.html" ${here === 'lab-tests.html' ? 'aria-current="page"' : ''}>🧪 Lab Tests</a>
              <a href="doctors.html" ${here === 'doctors.html' ? 'aria-current="page"' : ''}>🩺 Consult a Doctor</a>
            </nav>
          </div>
        </div>
      </header>`;
  }

  function footerHTML() {
    return `
      <footer><div class="wrap">
        <div class="foot">
          <div class="about">
            <a href="index.html" class="logo"><img src="assets/logo-mark.svg" alt="" width="38" height="38" /><span>Med<span class="p">pharma</span></span></a>
            <p>A concept online pharmacy — designed and built by <a href="https://arshiiiverse.github.io" style="color:var(--mint)">Arshdeep Kaur</a>. Medpharma here is a fictional demo store; no real orders are placed.</p>
          </div>
          <div><h4>Shop</h4><ul>
            <li><a href="catalog.html">All products</a></li>
            <li><a href="catalog.html?sort=popular">Best sellers</a></li>
            <li><a href="catalog.html?tag=offer">Offers</a></li>
            <li><button type="button" data-open="wishlist">Wishlist</button></li>
            <li><a href="orders.html">My orders</a></li>
          </ul></div>
          <div><h4>Services</h4><ul>
            <li><a href="lab-tests.html">Lab tests</a></li>
            <li><a href="doctors.html">Doctor consultation</a></li>
            <li><button type="button" data-open="rx">Upload prescription</button></li>
            <li><a href="orders.html#track">Track an order</a></li>
          </ul></div>
          <div><h4>Company</h4><ul>
            <li><a href="about.html">About us</a></li>
            <li><a href="contact.html">Contact</a></li>
            <li><a href="faq.html">FAQs</a></li>
            <li><a href="legal.html">Privacy &amp; terms</a></li>
            <li><a href="https://github.com/arshiiiverse/medpharma">Source code</a></li>
          </ul></div>
        </div>
        <div class="copyright">
          <p>© ${new Date().getFullYear()} Medpharma (concept) · Photos from <a href="https://stocksnap.io" rel="noopener">StockSnap</a> (CC0).</p>
          <p>Designed &amp; developed by Arshdeep Kaur</p>
        </div>
      </div></footer>`;
  }

  /* ================= DRAWERS & MODALS MARKUP ================= */
  const closeBtn = label => `<button class="close" data-close aria-label="${label}">✕</button>`;

  function overlaysHTML() {
    return `
      <div class="overlay" id="overlay"></div>
      <aside class="drawer" id="cart" role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden="true">
        <div class="drawer-head"><h2 id="cart-title">Your cart</h2>${closeBtn('Close cart')}</div>
        <div class="drawer-body" id="cart-body"></div>
        <div class="drawer-foot" id="cart-foot"></div>
      </aside>
      <aside class="drawer" id="wishlist" role="dialog" aria-modal="true" aria-labelledby="wish-title" aria-hidden="true">
        <div class="drawer-head"><h2 id="wish-title">Your wishlist</h2>${closeBtn('Close wishlist')}</div>
        <div class="drawer-body" id="wish-body"></div>
        <div class="drawer-foot" id="wish-foot"></div>
      </aside>

      <div class="modal" id="checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title" aria-hidden="true">
        <div class="modal-head"><div><h2 id="checkout-title">Checkout</h2><p>Delivery within 24 hours across the Tricity.</p></div>${closeBtn('Close checkout')}</div>
        <div class="modal-body">
          <form id="checkout-form" novalidate>
            <div class="form-grid two">
              <div class="field"><label for="co-name">Full name</label><input id="co-name" autocomplete="name" /><p class="err">Please enter your name.</p></div>
              <div class="field"><label for="co-phone">Mobile number</label><input id="co-phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" placeholder="10-digit number" /><p class="err">Enter a valid 10-digit Indian mobile number.</p></div>
              <div class="field full"><label for="co-address">Address</label><textarea id="co-address" autocomplete="street-address" placeholder="House no., sector, landmark"></textarea><p class="err">Please enter your delivery address.</p></div>
              <div class="field"><label for="co-city">City</label><select id="co-city"><option>Chandigarh</option><option>Mohali</option><option>Panchkula</option></select></div>
              <div class="field"><label for="co-pin">PIN code</label><input id="co-pin" inputmode="numeric" maxlength="6" placeholder="e.g. 160017" /><p class="err">We deliver to PIN codes starting 160, 140 or 134.</p></div>
              <div class="field full"><label>Payment method</label>
                <div class="radio-cards">
                  <label><input type="radio" name="pay" value="Cash on delivery" checked /> Cash on delivery</label>
                  <label><input type="radio" name="pay" value="UPI on delivery" /> UPI on delivery</label>
                </div>
              </div>
            </div>
            <div class="order-summary" id="co-summary"></div>
            <button type="submit" class="btn btn-dark btn-block" style="margin-top:16px">Place order</button>
            <p class="note">Demo store — no payment is taken and nothing is shipped.</p>
          </form>
          <div class="success" hidden></div>
        </div>
      </div>

      <div class="modal" id="rx" role="dialog" aria-modal="true" aria-labelledby="rx-title" aria-hidden="true">
        <div class="modal-head"><div><h2 id="rx-title">Upload prescription</h2><p>A pharmacist will call you within 30 minutes to confirm your order.</p></div>${closeBtn('Close')}</div>
        <div class="modal-body">
          <form id="rx-form" novalidate>
            <div class="form-grid">
              <div class="field">
                <label class="dropzone" id="dropzone" for="rx-file" tabindex="0">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin:0 auto 8px"><path d="M12 16V4m0 0l-4 4m4-4l4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
                  <b>Click to upload</b> or drag &amp; drop<br /><small>JPG, PNG or PDF · max 5 MB</small>
                  <input id="rx-file" type="file" accept="image/*,application/pdf" />
                </label>
                <div class="preview" id="rx-preview"></div>
                <p class="err">Please add a photo or PDF of your prescription (max 5 MB).</p>
              </div>
              <div class="form-grid two">
                <div class="field"><label for="rx-name">Patient name</label><input id="rx-name" autocomplete="name" /><p class="err">Please enter the patient's name.</p></div>
                <div class="field"><label for="rx-phone">Mobile number</label><input id="rx-phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" /><p class="err">Enter a valid 10-digit mobile number.</p></div>
              </div>
            </div>
            <button type="submit" class="btn btn-dark btn-block" style="margin-top:18px">Submit prescription</button>
            <p class="note">Demo — your file stays in your browser and is never uploaded.</p>
          </form>
          <div class="success" hidden></div>
        </div>
      </div>

      <div class="modal" id="lab" role="dialog" aria-modal="true" aria-labelledby="lab-title" aria-hidden="true">
        <div class="modal-head"><div><h2 id="lab-title">Book a lab test</h2><p>Home sample collection · reports in 24–48 hours.</p></div>${closeBtn('Close')}</div>
        <div class="modal-body">
          <form id="lab-form" novalidate>
            <div class="form-grid two">
              <div class="field full"><label for="lab-test">Test</label>
                <select id="lab-test">${LAB_TESTS.map(t => `<option value="${t.id}">${t.name} (${t.params} test${t.params > 1 ? 's' : ''}) — ${rupee(t.price)}</option>`).join('')}</select>
              </div>
              <div class="field"><label for="lab-date">Date</label><input id="lab-date" type="date" /><p class="err">Choose a date from tomorrow onwards.</p></div>
              <div class="field"><label for="lab-phone">Mobile number</label><input id="lab-phone" inputmode="numeric" maxlength="10" /><p class="err">Enter a valid 10-digit mobile number.</p></div>
              <div class="field full"><label>Collection slot</label><div class="slots" id="lab-slots"></div><p class="err">Please pick a time slot.</p></div>
              <div class="field full"><label for="lab-address">Collection address</label><textarea id="lab-address" placeholder="House no., sector, city"></textarea><p class="err">Please enter the collection address.</p></div>
            </div>
            <button type="submit" class="btn btn-dark btn-block" style="margin-top:18px">Confirm booking</button>
          </form>
          <div class="success" hidden></div>
        </div>
      </div>

      <div class="modal" id="consult" role="dialog" aria-modal="true" aria-labelledby="consult-title" aria-hidden="true">
        <div class="modal-head"><div><h2 id="consult-title">Book a video consultation</h2><p>Talk to a verified doctor from home.</p></div>${closeBtn('Close')}</div>
        <div class="modal-body">
          <form id="consult-form" novalidate>
            <div class="form-grid two">
              <div class="field full"><label>Speciality</label>
                <div class="radio-cards">${SPECS.map((s, i) => `<label><input type="radio" name="spec" value="${s.id}" ${i ? '' : 'checked'} /> ${s.name} · ${rupee(s.fee)}</label>`).join('')}</div>
              </div>
              <div class="field full"><label for="c-doctor">Doctor</label><select id="c-doctor"></select></div>
              <div class="field"><label for="c-name">Patient name</label><input id="c-name" autocomplete="name" /><p class="err">Please enter the patient's name.</p></div>
              <div class="field"><label for="c-phone">Mobile number</label><input id="c-phone" inputmode="numeric" maxlength="10" /><p class="err">Enter a valid 10-digit mobile number.</p></div>
              <div class="field full"><label>Available slots</label><div class="slots" id="c-slots"></div><p class="err">Please pick a time slot.</p></div>
              <div class="field full"><label for="c-symptoms">Symptoms (optional)</label><textarea id="c-symptoms" placeholder="Briefly describe how you're feeling"></textarea></div>
            </div>
            <button type="submit" class="btn btn-dark btn-block" style="margin-top:18px">Book consultation</button>
          </form>
          <div class="success" hidden></div>
        </div>
      </div>

      <div class="toast" id="toast" role="status" aria-live="polite"><span class="tick">✓</span><span id="toast-text"></span></div>`;
  }

  $('#mp-header').outerHTML = headerHTML();
  $('#mp-footer').outerHTML = footerHTML();
  document.body.insertAdjacentHTML('beforeend', overlaysHTML());

  /* ================= TOAST ================= */
  let toastTimer;
  function toast(msg, action) {
    $('#toast-text').innerHTML = esc(msg) + (action ? ` <button type="button" id="toast-action">${esc(action.label)}</button>` : '');
    if (action) $('#toast-action').addEventListener('click', action.run);
    $('#toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2800);
  }

  /* ================= STATE ================= */
  let cart = store.get('cart', {});
  const wished = new Set(store.get('wish', []).filter(id => byId(id)));
  Object.keys(cart).forEach(id => { if (!byId(id)) delete cart[id]; });
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

  /* ================= PRODUCT CARD (used by every page) ================= */
  function buyControl(p) {
    const q = cart[p.id] || 0;
    return q
      ? `<div class="stepper" aria-label="Quantity of ${esc(p.name)}"><button type="button" data-dec="${p.id}" aria-label="Remove one">−</button><span>${q}</span><button type="button" data-inc="${p.id}" aria-label="Add one">+</button></div>`
      : `<button type="button" class="add" data-add="${p.id}">${ICON.plus}Add</button>`;
  }
  function wishButton(p) {
    return `<button type="button" class="wish" data-wish="${p.id}" aria-pressed="${wished.has(p.id)}" aria-label="Save ${esc(p.name)} to wishlist">${ICON.heart}</button>`;
  }
  function cardHTML(p, n = 0) {
    return `
      <article class="card" style="animation-delay:${Math.min(n, 12) * 35}ms">
        <div class="thumb">
          ${p.isNew ? '<span class="badge new">New</span>' : `<span class="badge">-${discount(p)}%</span>`}
          ${p.rx ? '<span class="badge rx" title="Prescription required">Rx</span>' : ''}
          ${wishButton(p)}
          <a href="${productUrl(p)}" tabindex="-1" aria-hidden="true"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy" width="560" height="373" /></a>
        </div>
        <div class="info">
          <p class="meta">${esc(p.brand)}</p>
          <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
          <p class="pack">${esc(p.pack)}</p>
          <p class="rating"><span class="stars" aria-hidden="true">★</span> ${p.rating} <span style="color:var(--muted)">(${p.reviews.toLocaleString('en-IN')})</span></p>
          <div class="price-row">
            <p class="price"><b>${rupee(p.price)}</b><s>${rupee(p.mrp)}</s></p>
            <span data-buy="${p.id}">${buyControl(p)}</span>
          </div>
        </div>
      </article>`;
  }

  /* ================= CART ================= */
  function totals() {
    const items = Object.entries(cart).map(([id, q]) => ({ p: byId(id), q }));
    const subtotal = items.reduce((s, i) => s + i.p.price * i.q, 0);
    const mrp = items.reduce((s, i) => s + i.p.mrp * i.q, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
    return { items, subtotal, savings: mrp - subtotal, shipping, total: subtotal + shipping };
  }

  function setBadge(el, n) {
    el.textContent = n;
    el.classList.toggle('show', n > 0);
  }

  function saveCart(bump) {
    store.set('cart', cart);
    const n = cartCount(), el = $('#cart-count');
    setBadge(el, n);
    if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    $('#cart-btn').setAttribute('aria-label', `Open cart, ${n} item${n === 1 ? '' : 's'}`);
    renderCart();
    $$('[data-buy]').forEach(slot => { slot.innerHTML = buyControl(byId(slot.dataset.buy)); });
    emit('mp:cart', { cart });
  }

  function setQty(id, qty, bump = true) {
    id = +id;
    if (qty <= 0) delete cart[id];
    else cart[id] = Math.min(qty, MAX_QTY);
    saveCart(bump);
  }

  function addToCart(id, qty = 1, silent) {
    const p = byId(id), have = cart[p.id] || 0;
    if (have >= MAX_QTY) { toast(`Maximum ${MAX_QTY} per item`); return false; }
    setQty(p.id, have + qty);
    if (!silent) toast(`${p.name} added to cart`, { label: 'View cart', run: () => openPanel('cart') });
    return true;
  }

  const emptyState = (icon, title, text) => `
    <div class="drawer-empty">
      <div class="ic">${icon}</div>
      <p><b style="color:var(--ink)">${title}</b></p>
      <p style="margin-top:4px">${text}</p>
      <a class="btn btn-dark" style="margin-top:18px" href="catalog.html">Browse products</a>
    </div>`;

  function renderCart() {
    const t = totals();
    if (!t.items.length) {
      $('#cart-body').innerHTML = emptyState(ICON.cart.replace(/20/g, '30'), 'Your cart is empty', 'Add medicines and wellness products to get started.');
      $('#cart-foot').innerHTML = '';
      return;
    }
    const left = FREE_SHIPPING - t.subtotal;
    $('#cart-body').innerHTML = `
      <div class="ship-bar">
        ${left > 0 ? `Add <b>${rupee(left)}</b> more for <b>free delivery</b>` : '🎉 You’ve unlocked <b>free delivery</b>'}
        <div class="track"><div class="fill" style="width:${Math.min(100, t.subtotal / FREE_SHIPPING * 100)}%"></div></div>
      </div>
      ${t.items.map(({ p, q }) => `
        <div class="line-item">
          <a href="${productUrl(p)}"><img src="${p.img}" alt="" /></a>
          <div>
            <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
            <p class="sub">${esc(p.pack)} · ${rupee(p.price)} each</p>
            ${p.rx ? '<p class="sub" style="color:var(--blue)">Prescription required</p>' : ''}
          </div>
          <div class="right">
            <b>${rupee(p.price * q)}</b>
            <div class="qty"><button type="button" data-dec="${p.id}" aria-label="Decrease quantity">−</button><span>${q}</span><button type="button" data-inc="${p.id}" aria-label="Increase quantity">+</button></div>
            <button type="button" class="remove" data-remove="${p.id}">Remove</button>
          </div>
        </div>`).join('')}`;
    $('#cart-foot').innerHTML = `
      <div class="sum-row"><span>Subtotal</span><span>${rupee(t.subtotal)}</span></div>
      <div class="sum-row"><span>You save</span><span class="save">${rupee(t.savings)}</span></div>
      <div class="sum-row"><span>Delivery</span><span>${t.shipping ? rupee(t.shipping) : 'FREE'}</span></div>
      <div class="sum-row total"><span>Total</span><span>${rupee(t.total)}</span></div>
      <button type="button" class="btn btn-mint btn-block" data-open="checkout">Proceed to checkout</button>`;
  }

  /* ================= WISHLIST ================= */
  function saveWish() {
    store.set('wish', [...wished]);
    setBadge($('#wish-count'), wished.size);
    $('#wish-btn').setAttribute('aria-label', `Open wishlist, ${wished.size} item${wished.size === 1 ? '' : 's'}`);
    $$('[data-wish]').forEach(b => b.setAttribute('aria-pressed', String(wished.has(+b.dataset.wish))));
    renderWish();
    emit('mp:wish', { wished });
  }

  function toggleWish(id) {
    id = +id;
    const on = !wished.has(id);
    on ? wished.add(id) : wished.delete(id);
    saveWish();
    toast(on ? 'Saved to wishlist' : 'Removed from wishlist', on ? { label: 'View', run: () => openPanel('wishlist') } : null);
  }

  function renderWish() {
    const items = [...wished].map(byId).filter(Boolean);
    if (!items.length) {
      $('#wish-body').innerHTML = emptyState(ICON.heart.replace(/16/g, '30'), 'Your wishlist is empty', 'Tap the ♡ on any product to save it for later.');
      $('#wish-foot').innerHTML = '';
      return;
    }
    $('#wish-body').innerHTML = items.map(p => `
      <div class="line-item">
        <a href="${productUrl(p)}"><img src="${p.img}" alt="" /></a>
        <div>
          <h3><a href="${productUrl(p)}">${esc(p.name)}</a></h3>
          <p class="sub">${esc(p.pack)}</p>
          <p class="sub"><b style="color:var(--ink)">${rupee(p.price)}</b> <s>${rupee(p.mrp)}</s> · ${discount(p)}% off</p>
        </div>
        <div class="right">
          <button type="button" class="move" data-move="${p.id}">${cart[p.id] ? 'In cart ✓' : 'Move to cart'}</button>
          <button type="button" class="remove" data-unwish="${p.id}">Remove</button>
        </div>
      </div>`).join('');
    const total = items.reduce((s, p) => s + p.price, 0);
    $('#wish-foot').innerHTML = `
      <div class="sum-row"><span>${items.length} saved item${items.length === 1 ? '' : 's'}</span><span>${rupee(total)}</span></div>
      <button type="button" class="btn btn-mint btn-block" data-move-all>Add all to cart</button>
      <button type="button" class="btn btn-outline btn-block btn-sm" data-clear-wish>Clear wishlist</button>`;
  }

  /* ================= PANELS ================= */
  let openId = null, lastFocus = null;
  const overlay = $('#overlay');

  function openPanel(id, opts = {}) {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === 'checkout' && !cartCount()) { toast('Your cart is empty'); return; }
    const switching = !!openId;            // e.g. cart -> checkout: keep the original focus target
    if (switching) closePanel(true);
    if (id === 'checkout') prepareCheckout();
    if (['lab', 'consult', 'rx'].includes(id)) resetForm(id);
    if (id === 'consult') {
      makeSlots($('#c-slots'), 'c-slot', consultSlots());
      const doc = DOCTORS.find(d => d.id === +opts.doctor);
      const spec = doc ? doc.spec : opts.spec;
      if (spec) { const r = $(`#consult-form input[name="spec"][value="${spec}"]`); if (r) r.checked = true; }
      fillDoctors(doc ? doc.id : '');
    }
    if (id === 'lab' && opts.test) $('#lab-test').value = opts.test;
    if (!switching) lastFocus = document.activeElement;
    openId = id;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    overlay.classList.add('show');
    document.body.classList.add('locked');
    setTimeout(() => { const f = el.querySelector('.close'); if (f) f.focus(); }, 60);
  }

  function closePanel(silent) {
    if (!openId) return;
    const el = document.getElementById(openId);
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    openId = null;
    if (!silent) {
      overlay.classList.remove('show');
      document.body.classList.remove('locked');
      if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
      lastFocus = null;
    }
  }

  overlay.addEventListener('click', () => { closePanel(); emit('mp:overlay'); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closePanel();
    if (e.key === 'Tab' && openId) {
      const f = $$('button, input, select, textarea, a[href], [tabindex="0"]', document.getElementById(openId)).filter(x => !x.disabled && x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ================= GLOBAL CLICKS ================= */
  document.addEventListener('click', e => {
    const t = e.target.closest('button, a');
    if (!t) return;
    const d = t.dataset;
    if (d.add) addToCart(d.add);
    if (d.inc) { if ((cart[d.inc] || 0) >= MAX_QTY) toast(`Maximum ${MAX_QTY} per item`); else setQty(d.inc, (cart[d.inc] || 0) + 1); }
    if (d.dec) setQty(d.dec, (cart[d.dec] || 0) - 1);
    if (d.remove) {
      const id = +d.remove, q = cart[id];
      setQty(id, 0, false);
      toast(`${byId(id).name} removed`, { label: 'Undo', run: () => setQty(id, q) });
    }
    if (d.wish) toggleWish(d.wish);
    if (d.unwish) { wished.delete(+d.unwish); saveWish(); }
    if (d.move) { if (!cart[d.move]) addToCart(d.move, 1, true); wished.delete(+d.move); saveWish(); toast('Moved to cart', { label: 'View cart', run: () => openPanel('cart') }); }
    if ('moveAll' in d) {
      let n = 0;
      [...wished].forEach(id => { if (!cart[id]) { cart[id] = 1; n++; } });
      wished.clear(); saveWish(); saveCart(true);
      toast(n ? `${n} item${n === 1 ? '' : 's'} added to cart` : 'All items were already in your cart');
      openPanel('cart');
    }
    if ('clearWish' in d) {
      const backup = [...wished];
      wished.clear(); saveWish();
      toast('Wishlist cleared', { label: 'Undo', run: () => { backup.forEach(id => wished.add(id)); saveWish(); } });
    }
    if ('close' in d) closePanel();
    if (d.open) { e.preventDefault(); openPanel(d.open, { test: d.test, spec: d.spec, doctor: d.doctor }); }
  });

  // Categories dropdown
  const menuBtn = $('#cat-menu-btn'), menuList = $('#cat-menu-list');
  function setMenu(open) { menuList.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); }
  menuBtn.addEventListener('click', () => setMenu(menuList.hidden));
  document.addEventListener('click', e => { if (!e.target.closest('.cat-menu')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menuList.hidden) { setMenu(false); menuBtn.focus(); } });

  // Fade the edge of the quick-links row while there is more to scroll
  const navEl = $('.cat-nav');
  const fade = () => navEl.classList.toggle('more', navEl.scrollLeft + navEl.clientWidth < navEl.scrollWidth - 4);
  navEl.addEventListener('scroll', fade, { passive: true });
  window.addEventListener('resize', fade);
  fade();

  // Mobile search toggle + city sync
  $('#mobile-search-btn').addEventListener('click', () => {
    const open = $('#mobile-search').classList.toggle('open');
    $('#mobile-search-btn').setAttribute('aria-expanded', String(open));
    if (open) $('#m-search-input').focus();
  });
  const city = $('#city');
  city.value = store.get('city', 'Chandigarh');
  city.addEventListener('change', () => { store.set('city', city.value); toast(`Delivering to ${city.value}`); emit('mp:city', city.value); });

  /* ================= FORMS ================= */
  const isPhone = v => /^[6-9]\d{9}$/.test(v.trim());
  document.addEventListener('input', e => {
    if (e.target.matches('input[inputmode="numeric"]')) e.target.value = e.target.value.replace(/\D/g, '');
    const field = e.target.closest('.field.invalid');
    if (field) field.classList.remove('invalid');
  });
  function check(el, ok) {
    el.closest('.field').classList.toggle('invalid', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    return ok;
  }
  function firstInvalidFocus(form) {
    const bad = form.querySelector('.field.invalid input:not([type=radio]):not([type=file]), .field.invalid select, .field.invalid textarea, .field.invalid .dropzone, .field.invalid input[type=radio]');
    if (bad) bad.focus();
  }
  const ref = prefix => prefix + '-' + Date.now().toString(36).toUpperCase().slice(-6);
  function saveBooking(b) { store.set('bookings', [{ ...b, created: new Date().toISOString() }, ...store.get('bookings', [])].slice(0, 30)); }

  // Doctor dropdown follows the chosen speciality
  function fillDoctors(selected) {
    const spec = $('#consult-form input[name="spec"]:checked').value;
    $('#c-doctor').innerHTML = '<option value="">First available doctor</option>' +
      DOCTORS.filter(d => d.spec === spec).map(d => `<option value="${d.id}" ${d.id === selected ? 'selected' : ''}>${d.name} · ${d.exp} yrs · ★ ${d.rating}</option>`).join('');
  }
  $('#consult-form').addEventListener('change', e => { if (e.target.name === 'spec') fillDoctors(''); });

  function showSuccess(modalId, html) {
    const m = document.getElementById(modalId);
    m.querySelector('form').hidden = true;
    const s = m.querySelector('.success');
    s.innerHTML = `<div class="tick-big">${ICON.tick}</div>${html}<div><button type="button" class="btn btn-dark" style="margin-top:20px" data-close>Done</button></div>`;
    s.hidden = false;
    s.querySelector('button').focus();
  }
  function resetForm(modalId) {
    const m = document.getElementById(modalId);
    m.querySelector('form').hidden = false;
    m.querySelector('.success').hidden = true;
    $$('.field.invalid', m).forEach(x => x.classList.remove('invalid'));
  }
  function makeSlots(container, name, slots) {
    container.innerHTML = slots.map(s => `<label><input type="radio" name="${name}" value="${s}" /><span>${s}</span></label>`).join('');
  }
  function consultSlots() {
    const now = new Date(), out = [];
    const start = new Date(now); start.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
    for (let i = 0; i < 8; i++) {
      const d = new Date(start.getTime() + i * 30 * 60000);
      if (d.getDate() !== now.getDate() || d.getHours() >= 23) break;
      out.push('Today ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }));
    }
    return out.length >= 3 ? out : out.concat(['Tomorrow 9:00 am', 'Tomorrow 9:30 am', 'Tomorrow 10:00 am']).slice(0, 6);
  }
  makeSlots($('#lab-slots'), 'lab-slot', ['7–8 AM', '8–9 AM', '9–10 AM', '10–11 AM', '4–5 PM', '5–6 PM']);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  $('#lab-date').min = iso(tomorrow);
  $('#lab-date').value = iso(tomorrow);

  // ---- Checkout ----
  function prepareCheckout() {
    resetForm('checkout');
    const t = totals(), n = cartCount();
    $('#co-city').value = city.value;
    $('#co-summary').innerHTML = `
      <div class="sum-row"><span>${n} item${n === 1 ? '' : 's'}</span><span>${rupee(t.subtotal)}</span></div>
      <div class="sum-row"><span>Delivery</span><span>${t.shipping ? rupee(t.shipping) : 'FREE'}</span></div>
      <div class="sum-row total"><span>To pay</span><span>${rupee(t.total)}</span></div>
      ${t.items.some(i => i.p.rx) ? '<p style="font-size:.8rem;color:var(--blue)">Your cart has a prescription item — our pharmacist will ask for it on delivery.</p>' : ''}`;
  }
  $('#checkout-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const ok = [
      check($('#co-name'), $('#co-name').value.trim().length >= 2),
      check($('#co-phone'), isPhone($('#co-phone').value)),
      check($('#co-address'), $('#co-address').value.trim().length >= 8),
      check($('#co-pin'), /^(160|140|134)\d{3}$/.test($('#co-pin').value))
    ].every(Boolean);
    if (!ok) { firstInvalidFocus(f); return; }
    const t = totals();
    const order = {
      id: ref('MP'), date: new Date().toISOString(), status: 'placed',
      items: t.items.map(i => ({ id: i.p.id, q: i.q, price: i.p.price })),
      subtotal: t.subtotal, shipping: t.shipping, total: t.total,
      name: $('#co-name').value.trim(), phone: $('#co-phone').value, address: $('#co-address').value.trim(),
      city: $('#co-city').value, pin: $('#co-pin').value, pay: f.pay.value
    };
    store.set('orders', [order, ...store.get('orders', [])].slice(0, 20));
    const eta = new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    const first = esc(order.name.split(' ')[0]);
    const html = `<h3>Order placed, ${first}!</h3><p>${rupee(t.total)} · ${esc(order.pay)}<br />Arriving by <b>${eta}</b> in ${esc(order.city)}.</p><span class="ref">Order ID ${order.id}</span><p style="margin-top:12px"><a class="link-arrow" href="orders.html">Track this order →</a></p>`;
    cart = {};
    saveCart(false);
    showSuccess('checkout', html);
    f.reset();
  });

  // ---- Prescription ----
  let rxFile = null;
  const dz = $('#dropzone'), rxInput = $('#rx-file'), rxField = dz.closest('.field');
  function takeFile(file) {
    if (!file) return;
    if (!/^image\/|application\/pdf/.test(file.type) || file.size > 5 * 1024 * 1024) {
      rxFile = null; $('#rx-preview').classList.remove('show'); rxField.classList.add('invalid'); return;
    }
    rxFile = file;
    rxField.classList.remove('invalid');
    const thumb = file.type.startsWith('image/') ? `<img src="${URL.createObjectURL(file)}" alt="Prescription preview" />` : '<span class="file-ic">PDF</span>';
    $('#rx-preview').innerHTML = `${thumb}<div><p class="name">${esc(file.name)}</p><p style="font-size:.78rem;color:var(--muted)">${(file.size / 1024).toFixed(0)} KB · ready</p></div><button type="button" class="remove" id="rx-remove" style="margin-left:auto">Remove</button>`;
    $('#rx-preview').classList.add('show');
    $('#rx-remove').addEventListener('click', () => { rxFile = null; rxInput.value = ''; $('#rx-preview').classList.remove('show'); });
  }
  rxInput.addEventListener('change', () => takeFile(rxInput.files[0]));
  dz.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rxInput.click(); } });
  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('drag'); }));
  dz.addEventListener('drop', e => takeFile(e.dataTransfer.files[0]));
  $('#rx-form').addEventListener('submit', e => {
    e.preventDefault();
    rxField.classList.toggle('invalid', !rxFile);
    const ok = [!!rxFile, check($('#rx-name'), $('#rx-name').value.trim().length >= 2), check($('#rx-phone'), isPhone($('#rx-phone').value))].every(Boolean);
    if (!ok) { firstInvalidFocus(e.target); return; }
    showSuccess('rx', `<h3>Prescription received</h3><p>Thanks, ${esc($('#rx-name').value.trim().split(' ')[0])}. A pharmacist will call <b>+91 ${esc($('#rx-phone').value)}</b> within 30 minutes.</p><span class="ref">Ref ${ref('RX')}</span>`);
    e.target.reset(); rxFile = null; $('#rx-preview').classList.remove('show');
  });

  // ---- Lab test ----
  $('#lab-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, slot = f.querySelector('input[name="lab-slot"]:checked');
    $('#lab-slots').closest('.field').classList.toggle('invalid', !slot);
    const ok = [
      check($('#lab-date'), !!$('#lab-date').value && $('#lab-date').value >= $('#lab-date').min),
      check($('#lab-phone'), isPhone($('#lab-phone').value)),
      !!slot,
      check($('#lab-address'), $('#lab-address').value.trim().length >= 8)
    ].every(Boolean);
    if (!ok) { firstInvalidFocus(f); return; }
    const test = LAB_TESTS.find(x => x.id === +$('#lab-test').value);
    const day = new Date($('#lab-date').value + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    const id = ref('LAB');
    saveBooking({ id, type: 'lab', title: test.name, price: test.price, when: `${day}, ${slot.value}` });
    showSuccess('lab', `<h3>Lab test booked</h3><p><b>${esc(test.name)}</b> · ${rupee(test.price)}<br />Sample collection on ${day}, ${esc(slot.value)}.<br />${esc(test.fasting)}.</p><span class="ref">Booking ${id}</span>`);
    f.reset(); $('#lab-date').value = iso(tomorrow);
  });

  // ---- Consultation ----
  $('#consult-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, slot = f.querySelector('input[name="c-slot"]:checked');
    $('#c-slots').closest('.field').classList.toggle('invalid', !slot);
    const ok = [check($('#c-name'), $('#c-name').value.trim().length >= 2), check($('#c-phone'), isPhone($('#c-phone').value)), !!slot].every(Boolean);
    if (!ok) { firstInvalidFocus(f); return; }
    const spec = SPECS.find(s => s.id === f.spec.value);
    const doc = DOCTORS.find(d => d.id === +$('#c-doctor').value);
    const who = doc ? doc.name : `First available ${spec.name.toLowerCase()}`;
    const id = ref('DOC');
    saveBooking({ id, type: 'consult', title: `${who} (${spec.name})`, price: spec.fee, when: slot.value });
    showSuccess('consult', `<h3>Consultation booked</h3><p>${esc(who)} · ${esc(spec.name)} · ${rupee(spec.fee)}<br /><b>${esc(slot.value)}</b> — we’ll send the video link to +91 ${esc($('#c-phone').value)}.</p><span class="ref">Booking ${id}</span>`);
    f.reset();
  });

  // Open a panel straight from the URL, e.g. index.html#lab
  const hashPanel = location.hash.slice(1);
  if (['cart', 'wishlist', 'lab', 'consult', 'rx'].includes(hashPanel)) setTimeout(() => openPanel(hashPanel), 150);

  /* ================= INIT ================= */
  saveCart(false);
  saveWish();

  window.MP = { CATEGORIES, PRODUCTS, LAB_TESTS, SPECS, DOCTORS, rupee, discount, byId, catById, esc, cardHTML, buyControl, wishButton, addToCart, setQty, toggleWish, openPanel, toast, store, cart: () => cart, wished, productUrl, city: () => city.value };
})();
