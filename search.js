/* =========================================================
   ARIA — SEARCH
   Load on every page. Does 4 things:
   1. Makes the nav search icon open a search box
   2. Powers search.html (results page)
   3. "suits" -> jumps straight to Ethnic > Suits
   4. On category pages, highlights / filters what was searched
   ========================================================= */
(function () {
  'use strict';

  /* ---------- load search.css automatically ---------- */
  (function () {
    var script = document.currentScript;
    if (document.querySelector('link[href*="search.css"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = script && script.src
      ? script.src.replace(/search\.js.*$/, 'search.css')
      : 'search.css';
    document.head.appendChild(link);
  })();


  /* =======================================================
     SECTIONS  (what the website is made of)
     page    = file to open
     anchor  = section id on that page (ethnic / footwear)
     filter  = words used to filter cards (western / accessories)
     kw      = words people may type
     ======================================================= */
  var SECTIONS = [
    /* ---- Ethnic ---- */
    { label: 'Lehengas', where: 'Ethnic Wear', page: 'ethnic.html', anchor: 'lehenga-heading',
      kw: ['lehenga', 'lehengas', 'lehanga', 'lehnga', 'ghagra', 'bridal'] },
    { label: 'Suits', where: 'Ethnic Wear', page: 'ethnic.html', anchor: 'kurta-heading',
      kw: ['suit', 'suits', 'salwar', 'salwar suit', 'plazzo', 'palazzo', 'kurta', 'kurti', 'kurti set', 'anarkali', 'sharara'] },
    { label: 'Sarees', where: 'Ethnic Wear', page: 'ethnic.html', anchor: 'mens-heading',
      kw: ['saree', 'sarees', 'sari', 'saris', 'banarasi', 'silk saree'] },
    { label: 'Most Loved', where: 'Ethnic Wear', page: 'ethnic.html', anchor: 'sarees-heading',
      kw: ['most loved', 'popular', 'bestseller', 'best seller', 'trending'] },
    { label: 'Ethnic Wear', where: 'Collection', page: 'ethnic.html', anchor: '',
      kw: ['ethnic', 'ethnic wear', 'traditional', 'indian', 'festive', 'wedding'] },

    /* ---- Footwear ---- */
    { label: 'Heels', where: 'Footwear', page: 'footwear.html', anchor: 'heels-heading',
      kw: ['heel', 'heels', 'stiletto', 'stilettos', 'pumps', 'slingback', 'platform'] },
    { label: 'Boots', where: 'Footwear', page: 'footwear.html', anchor: 'boots-heading',
      kw: ['boot', 'boots', 'ankle boots', 'knee high'] },
    { label: 'Sneakers', where: 'Footwear', page: 'footwear.html', anchor: 'sneakers-heading',
      kw: ['sneaker', 'sneakers', 'trainers', 'high tops', 'canvas'] },
    { label: 'Footwear', where: 'Collection', page: 'footwear.html', anchor: '',
      kw: ['footwear', 'shoe', 'shoes'] },

    /* ---- Western ---- */
    { label: 'Dresses', where: 'Western Wear', page: 'western.html', filter: 'dress',
      kw: ['dress', 'dresses', 'gown', 'cocktail', 'bodycon'] },
    { label: 'Tops', where: 'Western Wear', page: 'western.html', filter: 'top|halter|corset|bustier|peplum|knit|vest',
      kw: ['top', 'tops', 'shirt', 'crop top', 'corset', 'halter', 'bustier', 'peplum'] },
    { label: 'Denim', where: 'Western Wear', page: 'western.html', filter: 'denim',
      kw: ['denim', 'jeans', 'shorts'] },
    { label: 'Skirts', where: 'Western Wear', page: 'western.html', filter: 'skirt|skort',
      kw: ['skirt', 'skirts', 'skort', 'mini skirt'] },
    { label: 'Jackets', where: 'Western Wear', page: 'western.html', filter: 'jacket',
      kw: ['jacket', 'jackets', 'outerwear', 'coat'] },
    { label: 'Western Wear', where: 'Collection', page: 'western.html', anchor: '',
      kw: ['western', 'western wear', 'clothes', 'clothing'] },

    /* ---- Accessories ---- */
    { label: 'Handbags', where: 'Accessories', page: 'accessories.html', filter: 'bag|clutch|handbag',
      kw: ['bag', 'bags', 'handbag', 'handbags', 'purse', 'clutch', 'shoulder bag'] },
    { label: 'Sunglasses', where: 'Accessories', page: 'accessories.html', filter: 'sunglass',
      kw: ['sunglass', 'sunglasses', 'glasses', 'eyewear', 'shades'] },
    { label: 'Jewellery', where: 'Accessories', page: 'accessories.html', filter: 'bangle|earring|necklace|ring|bracelet|anklet|jhumka|watch',
      kw: ['jewellery', 'jewelry', 'jewel'] },
    { label: 'Earrings', where: 'Accessories', page: 'accessories.html', filter: 'earring|jhumka',
      kw: ['earring', 'earrings', 'jhumka', 'jhumkas'] },
    { label: 'Bangles & Bracelets', where: 'Accessories', page: 'accessories.html', filter: 'bangle|bracelet',
      kw: ['bangle', 'bangles', 'bracelet', 'bracelets'] },
    { label: 'Necklaces', where: 'Accessories', page: 'accessories.html', filter: 'necklace',
      kw: ['necklace', 'necklaces', 'pendant'] },
    { label: 'Watches', where: 'Accessories', page: 'accessories.html', filter: 'watch',
      kw: ['watch', 'watches'] },
    { label: 'Accessories', where: 'Collection', page: 'accessories.html', anchor: '',
      kw: ['accessories', 'accessory'] },

    /* ---- Sale + other pages ---- */
    { label: 'Sale', where: 'Collection', page: 'sale.html', anchor: '',
      kw: ['sale', 'discount', 'offer', 'offers', 'deal', 'deals', 'clearance', 'final stock'] },
    { label: 'Contact Us', where: 'Help', page: 'contact.html', anchor: '',
      kw: ['contact', 'help', 'support', 'email', 'address'] },
    { label: 'Your Wishlist', where: 'Account', page: 'wishlist.html', anchor: '',
      kw: ['wishlist', 'favourites', 'favorites', 'saved'] },
    { label: 'Your Cart', where: 'Account', page: 'cart.html', anchor: '',
      kw: ['cart', 'basket', 'bag items', 'checkout'] }
  ];


  /* =======================================================
     PRODUCTS  [page, section id, section name, [names]]
     ======================================================= */
  var PRODUCTS = [
    ['ethnic.html', 'sarees-heading', 'Most Loved', ["Noor-e-Gul Lehenga", "White Plazzo Suit", "Mehfil-e-Noor Blue lehanga", "Midnight Elegance Suit", "Royal Rose Charm", "Imperial Blue Radiance", "Bottle green Modern saree", "Royal blue charm-Saree"]],
    ['ethnic.html', 'lehenga-heading', 'Lehengas', ["Ivory bloom lehanga", "Opulent Green Aura", "Sequin party Lehenga", "Gold sequin Lehenga", "Noor-e-kamal", "Husn-e-Mayur", "Magenta Banarsi Lehanga", "Fiery Grace Lehenga", "White radiance lehanga", "Royal Patchwork Multicolor Lehenga", "Chic Black sequin lehenga", "Haldi-themed yellow lehenga", "Lavender fishcut lehenga", "Royal-violet glow lehenga", "Gulabi-Shobha", "Floral print lehenga", "Violet net lehenga", "Bottle-green fishcut lehenga", "Pink floral lehenga"]],
    ['ethnic.html', 'kurta-heading', 'Suits', ["Elegant yellow suit", "Simply perfect!", "Pastel elegance", "Teal glow salwar-suit", "Orange party-wear plazzo suit", "Shahi black suit", "Lavender salwar-suit", "Moonlit mint", "Peacock shade plazzo suit", "Regal Gold Grace", "Majestic Brown Glow", "Blush Glow Ensemble", "Light-blue printed kurti-set", "Anarkali set", "Rose Mist Ensemble", "Classic kurti set", "Crystal Wave Charm", "Black Stardust Ensemble", "Lilac Radiance Set", "Pearl Garden Glow"]],
    ['ethnic.html', 'mens-heading', 'Sarees', ["Rani Banarasi Bloom Saree", "Royal Amethyst Zari Saree", "Midnight Stardust Sequin Saree", "Burgundy Bloom Embellished Saree", "Emerald Heritage Silk Saree", "Forest Luxe Saree", "Angelic Grace", "Classic floral print", "Golden Tangerine", "Blue banarsi silk saree", "Luxury Maroon Satin Saree", "Royal Dark Mustard Yellow Shimmer Saree", "Sapphire Grace", "Blush aura", "Lavender muse", "Mocha Royale"]],
    ['footwear.html', 'heels-heading', 'Heels', ["Luna Silver Stilettos", "Roselle Heels", "Seraphine Heels", "Ocean Strap Heels", "Blush Flower Heels", "Ivory Pointed Heels", "Leopard Slingback Heels", "White Platform Heels", "Butterfly Embellished Heels", "Classic Black Pumps", "YSL Rouge Heels", "Mocha Brown Heels"]],
    ['footwear.html', 'boots-heading', 'Boots', ["Noir Leather Boots", "Midnight Buckle Boots", "Ivory Luxe Ankle Boots", "Espresso Knee-High Boots", "Burgundy Patent Boots", "Ruby Lace-Up Boots", "Black Glitter Boots", "Mocha Lace-Up Boots"]],
    ['footwear.html', 'sneakers-heading', 'Sneakers', ["Cocoa Classic Sneakers", "Burgundy Retro Sneakers", "Ivory Canvas High-Tops", "Forest Green Street Sneakers", "Burgundy Vintage Sneakers", "Cloud Runner Sneakers", "Midnight Chunky Sneakers", "Ice Blue Platform Sneakers"]],
    ['western.html', '', 'Western Wear', ["Denim Wrap Halter Top", "Mocha Bodycon Dress", "Belted Denim Flare Dress", "Leather Lace-Up Corset Top", "Sheer Lace Trim Top", "Burgundy Leather Mini Skirt", "Scarlet Satin Cocktail Dress", "Distressed Denim Shorts", "Retro Layered Striped Crop Top", "Vintage Long Sleeve Knit Top", "Striped Collared Knit Vest", "Tie-Front Denim Crop Jacket", "Chestnut Wrap Mini Skort", "Vintage Floral Tie-Strap Bustier", "Burgundy Lace-Up Corset", "Tartan Collared Fitted Peplum Top"]],
    ['accessories.html', '', 'Accessories', ["Indigo Luxe Shoulder Bag", "Teal Kashmiri Bangle set", "Burgundy Mini Shoulder Bag", "Gold Pearl Watch set", "Gold Charm Anklet", "Floral Pearl Clutcher", "Celeste Heart Layered Necklace", "Ivory Edge Square Sunglasses", "Vintage Charm Black Sunglasses", "Royal Jhumka Drop Earrings", "Golden Bloom Statement Ring", "Ethnic Bangle Set", "Royal Gold Bracelet Set", "Coach handbag", "Golden Pearl Earrings", "White grace handbag"]],
    ['sale.html', '', 'Sale', ["Denim Wrap Halter Top", "Scarlet Satin Cocktail Dress", "Noor-e-gul lehenga", "Blush Rose Embroidered Set", "Vintage Long Sleeve Knit Top", "Retro Layered Striped Crop Top", "Gold Pearl Watch set", "Leopard Slingback Heels"]]
  ];

  var POPULAR = ['Suits', 'Lehengas', 'Sarees', 'Dresses', 'Heels', 'Sneakers', 'Handbags', 'Sunglasses', 'Sale'];


  /* =======================================================
     Matching
     ======================================================= */
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* lower-case, remove punctuation, unify spelling variants */
  function norm(s) {
    return String(s).toLowerCase()
      .replace(/lehanga|lehnga/g, 'lehenga')
      .replace(/banarsi/g, 'banarasi')
      .replace(/plazzo/g, 'palazzo')
      .replace(/jewelry/g, 'jewellery')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /* suits -> suit, dresses -> dress, heels -> heel */
  function stem(w) {
    if (w.length > 3 && /ies$/.test(w)) return w.slice(0, -3) + 'y';
    if (w.length > 3 && /(sses|ches|shes|xes)$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/(ss|us)$/.test(w)) return w.slice(0, -1);
    return w;
  }

  function tokens(s) {
    var n = norm(s);
    return n ? n.split(' ').map(stem) : [];
  }

  /* prepare keyword text once */
  SECTIONS.forEach(function (s) {
    s.kwN = s.kw.concat([s.label]).map(function (k) { return tokens(k).join(' '); });
  });

  function sectionUrl(s) {
    var url = s.page;
    if (s.filter) {
      url += '?filter=' + encodeURIComponent(s.filter) + '&label=' + encodeURIComponent(s.label);
    }
    if (s.anchor) url += '#' + s.anchor;
    return url;
  }

  function productUrl(p) {
    return p.page + '?find=' + encodeURIComponent(p.name) + (p.anchor ? '#' + p.anchor : '');
  }

  function run(query) {
    var qt = tokens(query);
    var result = { sections: [], products: [], exact: null };
    if (!qt.length) return result;
    var qs = qt.join(' ');

    /* sections */
    SECTIONS.forEach(function (s) {
      var best = 0;
      s.kwN.forEach(function (k) {
        if (k === qs) best = Math.max(best, 100);
        else if (qs.length >= 2 && k.indexOf(qs) === 0) best = Math.max(best, 70);
        else if (qs.length >= 3 && (' ' + k).indexOf(' ' + qs) !== -1) best = Math.max(best, 50);
        else if (qs.length >= 3 && k.indexOf(qs) !== -1) best = Math.max(best, 30);
      });
      if (best) result.sections.push({ s: s, score: best });
    });
    result.sections.sort(function (a, b) { return b.score - a.score; });
    if (result.sections.length && result.sections[0].score === 100) {
      result.exact = result.sections[0].s;
    }
    result.sections = result.sections.slice(0, 6).map(function (x) { return x.s; });

    /* products */
    var seen = {};
    PRODUCTS.forEach(function (g) {
      var labelT = tokens(g[2]);
      g[3].forEach(function (name) {
        var nameT = tokens(name);
        function inList(list, t) {
          return list.some(function (w) { return w.indexOf(t) === 0; });
        }
        var inName = qt.every(function (t) { return inList(nameT, t); });
        var inAny = qt.every(function (t) { return inList(nameT, t) || inList(labelT, t); });
        if (!inAny) return;

        var key = g[0] + '|' + name.toLowerCase();
        if (seen[key]) return;
        seen[key] = true;

        result.products.push({
          name: name, page: g[0], anchor: g[1], label: g[2], score: inName ? 2 : 1
        });
      });
    });
    result.products.sort(function (a, b) { return b.score - a.score; });
    result.products = result.products.slice(0, 60);

    return result;
  }

  /* open the best section if the search is an exact match, else go to results */
  function go(query) {
    query = query.trim();
    if (!query) return;
    var r = run(query);
    if (r.exact) {
      location.href = sectionUrl(r.exact);
    } else {
      location.href = 'search.html?q=' + encodeURIComponent(query);
    }
  }


  /* =======================================================
     Search box (opens from the nav search icon)
     ======================================================= */
  var overlay = null;
  var input = null;
  var list = null;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'asr';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="asr__backdrop" data-close></div>' +
      '<div class="asr__panel" role="dialog" aria-modal="true" aria-label="Search ARIA">' +
        '<form class="asr__form" autocomplete="off">' +
          '<svg viewBox="0 0 24 24" class="asr__icon" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
          '<input class="asr__input" type="search" placeholder="Search suits, heels, handbags…" aria-label="Search">' +
          '<button type="button" class="asr__close" data-close aria-label="Close search">&times;</button>' +
        '</form>' +
        '<div class="asr__list" role="list"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    input = overlay.querySelector('.asr__input');
    list = overlay.querySelector('.asr__list');

    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeOverlay();
      var chip = e.target.closest('[data-q]');
      if (chip) go(chip.getAttribute('data-q'));
    });

    overlay.querySelector('.asr__form').addEventListener('submit', function (e) {
      e.preventDefault();
      go(input.value);
    });

    input.addEventListener('input', function () { renderSuggestions(input.value); });

    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeOverlay();
      if (e.key === 'ArrowDown') {
        var first = list.querySelector('a');
        if (first) { e.preventDefault(); first.focus(); }
      }
    });

    list.addEventListener('keydown', function (e) {
      var links = Array.prototype.slice.call(list.querySelectorAll('a'));
      var i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && i < links.length - 1) { e.preventDefault(); links[i + 1].focus(); }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (i > 0) links[i - 1].focus(); else input.focus();
      }
    });
  }

  function renderSuggestions(q) {
    q = q.trim();
    if (!q) {
      list.innerHTML =
        '<p class="asr__label">Popular searches</p><div class="asr__chips">' +
        POPULAR.map(function (p) {
          return '<button type="button" class="asr__chip" data-q="' + esc(p) + '">' + esc(p) + '</button>';
        }).join('') + '</div>';
      return;
    }

    var r = run(q);
    var html = '';

    r.sections.slice(0, 4).forEach(function (s) {
      html += '<a class="asr__item" href="' + esc(sectionUrl(s)) + '">' +
        '<span class="asr__title">' + esc(s.label) + '</span>' +
        '<span class="asr__meta">Section · ' + esc(s.where) + '</span></a>';
    });
    r.products.slice(0, 5).forEach(function (p) {
      html += '<a class="asr__item" href="' + esc(productUrl(p)) + '">' +
        '<span class="asr__title">' + esc(p.name) + '</span>' +
        '<span class="asr__meta">' + esc(p.label) + '</span></a>';
    });

    if (!html) {
      html = '<p class="asr__empty">No matches for “' + esc(q) + '”. Try “suits”, “heels” or “handbags”.</p>';
    } else {
      html += '<a class="asr__item asr__item--all" href="search.html?q=' + encodeURIComponent(q) + '">See all results for “' + esc(q) + '” →</a>';
    }
    list.innerHTML = html;
  }

  function openOverlay() {
    if (!overlay) buildOverlay();
    overlay.hidden = false;
    document.body.classList.add('asr-open');
    input.value = '';
    renderSuggestions('');
    setTimeout(function () { input.focus(); }, 30);
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('asr-open');
  }

  /* nav search icon */
  document.querySelectorAll('a[aria-label="Search"]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href || href === '#') a.setAttribute('href', 'search.html');
  });

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[aria-label="Search"]');
    if (!a) return;
    e.preventDefault();

    var pageInput = document.getElementById('searchInput');
    if (pageInput) {                      /* already on search.html */
      window.scrollTo({ top: 0, behavior: 'smooth' });
      pageInput.focus();
    } else {
      openOverlay();
    }
  });


  /* =======================================================
     search.html (results page)
     ======================================================= */
  var resultsEl = document.getElementById('searchResults');

  function renderResults(q) {
    var summary = document.getElementById('searchSummary');
    q = q.trim();

    if (!q) {
      summary.textContent = 'Type something above, or pick a popular search.';
      resultsEl.innerHTML = '';
      return;
    }

    var r = run(q);
    var total = r.sections.length + r.products.length;
    summary.innerHTML = total
      ? total + (total === 1 ? ' result' : ' results') + ' for “<strong>' + esc(q) + '</strong>”'
      : 'No results for “<strong>' + esc(q) + '</strong>”';

    var html = '';

    if (r.sections.length) {
      html += '<h2 class="sp-heading">Sections</h2><div class="sp-sections">';
      r.sections.forEach(function (s) {
        html += '<a class="sp-section" href="' + esc(sectionUrl(s)) + '">' +
          '<span class="sp-section__where">' + esc(s.where) + '</span>' +
          '<span class="sp-section__label">' + esc(s.label) + '</span>' +
          '<span class="sp-section__go">Open section →</span></a>';
      });
      html += '</div>';
    }

    if (r.products.length) {
      html += '<h2 class="sp-heading">Products</h2><div class="sp-products">';
      r.products.forEach(function (p) {
        html += '<a class="sp-product" href="' + esc(productUrl(p)) + '">' +
          '<span class="sp-product__name">' + esc(p.name) + '</span>' +
          '<span class="sp-product__meta">' + esc(p.label) + '</span>' +
          '<span class="sp-product__go">View →</span></a>';
      });
      html += '</div>';
    }

    if (!total) {
      html = '<div class="sp-empty"><p>We couldn’t find that. Try one of these:</p>' + chipsHtml() + '</div>';
    }
    resultsEl.innerHTML = html;
  }

  function chipsHtml() {
    return '<div class="sp-chips">' + POPULAR.map(function (p) {
      return '<button type="button" class="sp-chip" data-q="' + esc(p) + '">' + esc(p) + '</button>';
    }).join('') + '</div>';
  }

  function setupResultsPage() {
    var form = document.getElementById('searchForm');
    var field = document.getElementById('searchInput');
    var chips = document.getElementById('searchChips');
    if (chips) chips.innerHTML = chipsHtml();

    function submit(q) {
      q = q.trim();
      if (!q) { renderResults(''); return; }
      var r = run(q);
      if (r.exact) { location.href = sectionUrl(r.exact); return; }   /* jump to the section */
      history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(q));
      renderResults(q);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submit(field.value);
    });

    document.addEventListener('click', function (e) {
      var chip = e.target.closest('.sp-chip');
      if (!chip) return;
      field.value = chip.getAttribute('data-q');
      submit(field.value);
    });

    var q = new URLSearchParams(location.search).get('q') || '';
    field.value = q;
    renderResults(q);
    if (!q) field.focus();
  }


  /* =======================================================
     Category pages: highlight / filter what was searched
     ======================================================= */
  function applySearchTarget() {
    var params = new URLSearchParams(location.search);
    var find = params.get('find');
    var filter = params.get('filter');
    var label = params.get('label');
    if (!find && !filter) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.product-card'));
    if (!cards.length) return;

    function nameOf(card) {
      var el = card.querySelector('.product-card__name');
      return el ? el.textContent.trim().toLowerCase() : '';
    }

    /* filter cards by keyword (western / accessories) */
    if (filter) {
      var terms = filter.toLowerCase().split('|');
      var shown = 0;
      cards.forEach(function (card) {
        var n = nameOf(card);
        var ok = terms.some(function (t) { return n.indexOf(t) !== -1; });
        card.hidden = !ok;
        if (ok) shown++;
      });

      var gridEl = document.querySelector('[data-product-grid]') ||
                   document.querySelector('.arrivals__grid') || cards[0].parentNode;
      var banner = document.createElement('div');
      banner.className = 'search-banner';
      banner.innerHTML = (shown
        ? 'Showing <strong>' + shown + '</strong> ' + esc(label || 'matching') + (shown === 1 ? ' item' : ' items')
        : 'Nothing matched “' + esc(label || filter) + '” on this page') +
        ' <a href="' + esc(location.pathname.split('/').pop() || 'index.html') + '">Show all</a>';
      gridEl.parentNode.insertBefore(banner, gridEl);
    }

    /* highlight one product */
    if (find) {
      var target = null;
      cards.forEach(function (card) {
        if (!target && nameOf(card) === find.toLowerCase()) target = card;
      });
      if (target) {
        target.classList.add('search-hit');
        setTimeout(function () {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    }
  }


  /* ---------- start ---------- */
  function init() {
    if (resultsEl) setupResultsPage();
    applySearchTarget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();