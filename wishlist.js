/* =========================================================
   ARIA — WISHLIST
   Load on every page. Also powers wishlist.html.
   Saved in localStorage under "ariaWishlist"
   (the cart uses "ariaCart", same idea).
   ========================================================= */
(function () {
  'use strict';

  var WL_KEY = 'ariaWishlist';
  var CART_KEY = 'ariaCart';

  var HEART_SVG =
    '<svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="1.5">' +
    '<path d="M12 21s-7.5-4.6-10-9.1C.5 8.4 2.3 5 5.8 5c2 0 3.4 1.1 4.2 2.4C10.8 6.1 12.2 5 14.2 5c3.5 0 5.3 3.4 3.8 6.9C19.5 16.4 12 21 12 21z"></path></svg>';

  /* ---------- load wishlist.css automatically ---------- */
  (function () {
    var script = document.currentScript;
    if (document.querySelector('link[href*="wishlist.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = script && script.src
      ? script.src.replace(/wishlist\.js.*$/, 'wishlist.css')
      : 'wishlist.css';
    document.head.appendChild(link);
  })();

  /* ---------- storage helpers ---------- */
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function makeId(name) {            /* same formula your cart uses */
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  function currentPage() {
    return location.pathname.split('/').pop() || 'index.html';
  }
  function money(value) {
    return '₹' + Number(value).toLocaleString('en-IN');
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function itemFromCard(card) {
    var nameEl = card.querySelector('.product-card__name');
    var priceEl = card.querySelector('.product-card__price');
    var imgEl = card.querySelector('.product-card__image') || card.querySelector('img');
    if (!nameEl) return null;

    var name = nameEl.textContent.trim();
    return {
      id: makeId(name),
      name: name,
      price: priceEl ? Number(priceEl.textContent.replace(/[^0-9.]/g, '')) || 0 : 0,
      image: imgEl ? imgEl.src : '',
      page: currentPage()
    };
  }

  /* ---------- toast ---------- */
  var toastEl = null;
  var toastTimer = null;

  function toast(message) {
    /* pages that already have their own toast show it themselves */
    if (document.querySelector('[data-toast]')) return;

    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'wl-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  /* ---------- hearts on product cards ---------- */
  function ensureHearts() {
    document.querySelectorAll('.product-card').forEach(function (card) {
      if (card.querySelector('.btn-wishlist')) return;
      var wrap = card.querySelector('.product-card__image-wrap');
      var nameEl = card.querySelector('.product-card__name');
      if (!wrap || !nameEl) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-wishlist btn-wishlist--injected';
      btn.setAttribute('aria-label', 'Add ' + nameEl.textContent.trim() + ' to wishlist');
      btn.innerHTML = HEART_SVG;
      wrap.insertBefore(btn, wrap.firstChild);
    });
  }

  function syncHearts() {
    var ids = read(WL_KEY).map(function (i) { return i.id; });

    document.querySelectorAll('.btn-wishlist').forEach(function (btn) {
      var card = btn.closest('.product-card');
      var nameEl = card && card.querySelector('.product-card__name');
      if (!nameEl) return;

      var name = nameEl.textContent.trim();
      var active = ids.indexOf(makeId(name)) !== -1;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.setAttribute('aria-label',
        (active ? 'Remove ' : 'Add ') + name + (active ? ' from wishlist' : ' to wishlist'));
    });
  }

  /* ---------- nav icon + badges ---------- */
  function updateBadges() {
    var count = read(WL_KEY).length;

    document.querySelectorAll('a[aria-label="Wishlist"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') a.setAttribute('href', 'wishlist.html');

      if (!a.querySelector('[data-wishlist-count]')) {
        var badge = document.createElement('span');
        badge.className = 'wl-badge';
        badge.setAttribute('data-wishlist-count', '');
        a.appendChild(badge);
      }
    });

    document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
      el.textContent = count;
      el.classList.toggle('is-visible', count > 0);
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  /* ---------- clicking a heart ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-wishlist');
    if (!btn) return;

    var card = btn.closest('.product-card');
    if (!card) return;
    var item = itemFromCard(card);
    if (!item) return;

    var list = read(WL_KEY);
    var index = -1;
    list.forEach(function (i, n) { if (i.id === item.id) index = n; });

    if (index === -1) {
      list.push(item);
      toast(item.name + ' added to wishlist');
    } else {
      list.splice(index, 1);
      toast(item.name + ' removed from wishlist');
    }
    write(WL_KEY, list);

    /* run after any other script that also reacts to the heart,
       so our saved list always wins */
    setTimeout(function () {
      syncHearts();
      updateBadges();
    }, 0);
  });

  /* =======================================================
     wishlist.html page
     ======================================================= */
  var grid = document.getElementById('wishlistGrid');

  function addToCart(item) {
    var cart = read(CART_KEY);
    var existing = null;
    cart.forEach(function (c) { if (c.id === item.id) existing = c; });

    if (existing) {
      existing.quantity = (Number(existing.quantity) || 0) + 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });
    }
    write(CART_KEY, cart);
  }

  function updateCartBadges() {
    var count = read(CART_KEY).reduce(function (t, i) {
      return t + (Number(i.quantity) || 0);
    }, 0);

    document.querySelectorAll('#cartBadge, [data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.classList.toggle('is-visible', count > 0);
    });
  }

  function renderPage() {
    var list = read(WL_KEY);
    var countEl = document.getElementById('wlCount');
    var emptyEl = document.getElementById('wlEmpty');
    var toolbar = document.getElementById('wlToolbar');

    if (countEl) countEl.textContent = list.length + (list.length === 1 ? ' item' : ' items');
    if (emptyEl) emptyEl.hidden = list.length > 0;
    if (toolbar) toolbar.hidden = list.length === 0;

    grid.innerHTML = '';

    list.forEach(function (item) {
      var link = item.page + '?find=' + encodeURIComponent(item.name);
      var card = document.createElement('article');
      card.className = 'wl-card';
      card.setAttribute('data-id', item.id);

      card.innerHTML =
        '<a class="wl-card__media" href="' + esc(link) + '">' +
          '<img src="' + esc(item.image) + '" alt="' + esc(item.name) + '" loading="lazy">' +
        '</a>' +
        '<button type="button" class="wl-card__remove" data-act="remove" aria-label="Remove ' + esc(item.name) + '">&times;</button>' +
        '<div class="wl-card__body">' +
          '<h3 class="wl-card__name">' + esc(item.name) + '</h3>' +
          '<p class="wl-card__price">' + money(item.price) + '</p>' +
          '<button type="button" class="wl-btn wl-btn--primary" data-act="cart">Move to Cart</button>' +
          '<a class="wl-card__view" href="' + esc(link) + '">View in store</a>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  function setupPage() {
    renderPage();
    updateCartBadges();

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var card = btn.closest('.wl-card');
      var id = card.getAttribute('data-id');
      var list = read(WL_KEY);
      var item = null;
      list.forEach(function (i) { if (i.id === id) item = i; });
      if (!item) return;

      if (btn.getAttribute('data-act') === 'remove') {
        write(WL_KEY, list.filter(function (i) { return i.id !== id; }));
        toast(item.name + ' removed from wishlist');
      }

      if (btn.getAttribute('data-act') === 'cart') {
        addToCart(item);
        write(WL_KEY, list.filter(function (i) { return i.id !== id; }));
        toast(item.name + ' moved to your cart');
        updateCartBadges();
      }

      renderPage();
      updateBadges();
    });

    var addAll = document.getElementById('wlAddAll');
    if (addAll) {
      addAll.addEventListener('click', function () {
        var list = read(WL_KEY);
        if (!list.length) return;
        list.forEach(addToCart);
        write(WL_KEY, []);
        toast('All items moved to your cart');
        updateCartBadges();
        renderPage();
        updateBadges();
      });
    }

    var clearAll = document.getElementById('wlClear');
    if (clearAll) {
      clearAll.addEventListener('click', function () {
        if (!read(WL_KEY).length) return;
        if (!confirm('Remove everything from your wishlist?')) return;
        write(WL_KEY, []);
        renderPage();
        updateBadges();
      });
    }
  }

  /* newsletter form on wishlist.html / search.html */
  function setupNewsletter() {
    var form = document.querySelector('[data-aria-newsletter]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      toast('Thank you for subscribing!');
      form.reset();
    });
  }

  /* ---------- start ---------- */
  function init() {
    ensureHearts();
    syncHearts();
    updateBadges();
    setupNewsletter();
    if (grid) setupPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* keep other open tabs in sync */
  window.addEventListener('storage', function (e) {
    if (e.key !== WL_KEY) return;
    syncHearts();
    updateBadges();
    if (grid) renderPage();
  });
})();