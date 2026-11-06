/* =========================================================
   Medpharma — start-up
   Loads the live catalogue and settings (when a backend is
   configured), then runs app.js and the page's own script.
   Uses the last saved copy straight away when there is one, and
   refreshes it in the background, so pages open instantly.
   ========================================================= */
(function () {
  'use strict';
  const cores = [], pages = [];
  let started = false;
  window.MPBoot = { core: fn => (started ? fn() : cores.push(fn)) };
  window.MPReady = fn => (started ? fn() : pages.push(fn));

  const read = k => { try { return JSON.parse(localStorage.getItem('mp-cache-' + k)); } catch (_) { return null; } };
  const write = (k, v) => { try { localStorage.setItem('mp-cache-' + k, JSON.stringify(v)); } catch (_) {} };

  function apply(products, settings) {
    const D = window.MP_DATA;
    if (Array.isArray(products) && products.length) {
      const all = products.map(p => Object.assign({ isNew: false, rx: false, stock: 0, highlights: [] }, p));
      D.ALL_PRODUCTS.splice(0, D.ALL_PRODUCTS.length, ...all);
      D.PRODUCTS.splice(0, D.PRODUCTS.length, ...all.filter(p => p.active !== false));
    }
    if (settings) Object.assign(D.SETTINGS, settings);
  }

  async function fetchLive() {
    const [products, settings] = await Promise.all([MPDB.catalog(), MPDB.settings()]);
    write('products', products); write('settings', settings);
    return { products, settings };
  }

  async function load() {
    if (!window.MPDB || !MPDB.enabled) return;              // demo mode: data.js already has everything
    if (document.body && document.body.dataset.page === 'admin') return;   // admin loads its own data
    const cached = read('products');
    if (cached && cached.length) {
      apply(cached, read('settings'));
      fetchLive().catch(e => console.warn('[Medpharma] Using saved catalogue:', e.message));
      return;
    }
    try {
      const live = await Promise.race([fetchLive(), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000))]);
      apply(live.products, live.settings);
    } catch (e) {
      console.warn('[Medpharma] Could not load live catalogue, showing built-in one:', e.message);
    }
  }

  const loading = load();
  function start() {
    loading.then(() => {
      started = true;
      cores.splice(0).forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
      pages.splice(0).forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0);
})();
