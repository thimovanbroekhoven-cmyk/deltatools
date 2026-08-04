/* ==========================================================================
   Celine Beaumont — quick-add mini-popup for the cart drawer's
   "People also bought" upsell cards (like icon-amsterdam).

   Instead of the "Add +" button instantly adding a default variant, it opens
   a small popup where the shopper picks colour (image swatches) and size,
   then adds the chosen variant to the cart. Self-contained: it fetches the
   product JSON from /products/{handle}.js on demand, so the drawer markup only
   needs the existing product link — no big variant blobs embedded per card.

   Loaded once from snippets/cart-drawer.liquid. Uses event delegation on the
   document so it keeps working after the drawer re-renders. Fully reversible:
   delete this file + its <script> tag.
   ========================================================================== */
(function () {
  if (window.__lsbUpsellInit) return;
  window.__lsbUpsellInit = true;

  var CURRENCY = (window.Shopify && Shopify.currency && Shopify.currency.active) || 'USD';
  var LANG = document.documentElement.lang || 'en';

  function money(cents) {
    try {
      return new Intl.NumberFormat(LANG, { style: 'currency', currency: CURRENCY }).format(cents / 100);
    } catch (e) {
      return (cents / 100).toFixed(2);
    }
  }

  // ---- one shared popup, appended to <body> so it survives drawer re-renders
  var overlay = document.createElement('div');
  overlay.className = 'lsb-qa-overlay';
  overlay.innerHTML =
    '<div class="lsb-qa" role="dialog" aria-modal="true" aria-label="Choose options">' +
    '  <button type="button" class="lsb-qa__close" aria-label="Close">&times;</button>' +
    '  <div class="lsb-qa__head">' +
    '    <img class="lsb-qa__img" alt="" width="60" height="75">' +
    '    <div>' +
    '      <p class="lsb-qa__title"></p>' +
    '      <p class="lsb-qa__price"></p>' +
    '    </div>' +
    '  </div>' +
    '  <div class="lsb-qa__options"></div>' +
    '  <div class="lsb-qa__error" hidden></div>' +
    '  <button type="button" class="lsb-qa__add button">Add to cart</button>' +
    '</div>';
  document.body.appendChild(overlay);

  var dialog = overlay.querySelector('.lsb-qa');
  var imgEl = overlay.querySelector('.lsb-qa__img');
  var titleEl = overlay.querySelector('.lsb-qa__title');
  var priceEl = overlay.querySelector('.lsb-qa__price');
  var optionsEl = overlay.querySelector('.lsb-qa__options');
  var errEl = overlay.querySelector('.lsb-qa__error');
  var addBtn = overlay.querySelector('.lsb-qa__add');
  var closeBtn = overlay.querySelector('.lsb-qa__close');

  var product = null;      // fetched product JSON
  var selected = {};       // { position: value }
  var colorPos = null;

  function open() {
    overlay.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
  }
  function close() {
    overlay.classList.remove('is-open');
    document.documentElement.style.overflow = '';
  }
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

  function isColour(name) {
    name = (name || '').toLowerCase();
    return name.indexOf('color') >= 0 || name.indexOf('colour') >= 0 || name.indexOf('kleur') >= 0;
  }

  function variantImage(v) {
    if (v && v.featured_image && v.featured_image.src) return v.featured_image.src;
    return product.featured_image || (product.images && product.images[0]) || '';
  }

  // First variant matching a colour value (available preferred) → its image.
  function colourImage(val) {
    var idx = colorPos - 1;
    var v = product.variants.find(function (v) { return v.available && v.options[idx] === val; })
         || product.variants.find(function (v) { return v.options[idx] === val; });
    return v ? variantImage(v) : (product.featured_image || '');
  }

  function currentVariant() {
    return product.variants.find(function (v) {
      return product.options.every(function (opt, i) {
        return v.options[i] === selected[i + 1];
      });
    });
  }

  // Is there any available variant with this value at a given option position,
  // holding all *other* currently-selected options fixed?
  function comboAvailable(pos, val) {
    return product.variants.some(function (v) {
      if (!v.available) return false;
      for (var i = 0; i < product.options.length; i++) {
        var p = i + 1;
        var want = (p === pos) ? val : selected[p];
        if (want != null && v.options[i] !== want) return false;
      }
      return true;
    });
  }

  function refresh() {
    var v = currentVariant();
    // price
    if (v) {
      var html = money(v.price);
      if (v.compare_at_price && v.compare_at_price > v.price) {
        html = '<s>' + money(v.compare_at_price) + '</s>' + money(v.price);
      }
      priceEl.innerHTML = html;
    }
    // colour image in the header
    if (colorPos && selected[colorPos]) imgEl.src = colourImage(selected[colorPos]);
    // reflect active states + disable impossible sizes
    optionsEl.querySelectorAll('[data-opt-pos]').forEach(function (el) {
      var pos = parseInt(el.getAttribute('data-opt-pos'), 10);
      var val = el.getAttribute('data-opt-val');
      var active = selected[pos] === val;
      el.classList.toggle('is-active', active);
      if (el.classList.contains('lsb-qa__size')) {
        el.disabled = !comboAvailable(pos, val);
      }
    });
    // add button state
    addBtn.disabled = !(v && v.available);
    addBtn.textContent = v ? (v.available ? 'Add to cart' : 'Sold out') : 'Unavailable';
  }

  function buildOptions() {
    optionsEl.innerHTML = '';
    colorPos = null;
    product.options.forEach(function (opt) {
      // Shopify product JSON: options is an array of { name, position, values }
      if (isColour(opt.name)) colorPos = opt.position;
    });

    product.options.forEach(function (opt) {
      var group = document.createElement('div');
      group.className = 'lsb-qa__optgroup';
      var label = document.createElement('span');
      label.className = 'lsb-qa__optlabel';
      label.textContent = opt.name;
      group.appendChild(label);

      var colour = isColour(opt.name);
      var wrap = document.createElement('div');
      wrap.className = colour ? 'lsb-qa__swatches' : 'lsb-qa__sizes';

      opt.values.forEach(function (val) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = colour ? 'lsb-qa__swatch' : 'lsb-qa__size';
        btn.setAttribute('data-opt-pos', opt.position);
        btn.setAttribute('data-opt-val', val);
        btn.setAttribute('aria-label', opt.name + ': ' + val);
        if (colour) {
          var im = document.createElement('img');
          im.src = colourImage(val);
          im.alt = val; im.loading = 'lazy';
          btn.title = val;
          btn.appendChild(im);
        } else {
          btn.textContent = val;
        }
        btn.addEventListener('click', function () {
          selected[opt.position] = val;
          refresh();
        });
        wrap.appendChild(btn);
      });
      group.appendChild(wrap);
      optionsEl.appendChild(group);
    });
  }

  function addToCart() {
    var v = currentVariant();
    if (!v || !v.available) return;
    errEl.hidden = true;
    var original = addBtn.textContent;
    addBtn.disabled = true;
    addBtn.textContent = 'Adding…';

    var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    var drawer = document.querySelector('cart-drawer');
    var body = { items: [{ id: v.id, quantity: 1 }] };
    if (drawer) {
      body.sections = ['cart-drawer', 'cart-icon-bubble'];
      body.sections_url = window.location.pathname;
    }

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/javascript' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (!res.ok) {
          errEl.textContent = res.data.description || res.data.message || 'Could not add to cart.';
          errEl.hidden = false;
          return;
        }
        if (drawer && res.data.sections) drawer.renderContents(res.data);
        close();
      })
      .catch(function () {
        errEl.textContent = 'Something went wrong. Please try again.';
        errEl.hidden = false;
      })
      .finally(function () {
        addBtn.disabled = false;
        addBtn.textContent = original;
      });
  }
  addBtn.addEventListener('click', addToCart);

  function seedSelection() {
    selected = {};
    var first = product.variants.find(function (v) { return v.available; }) || product.variants[0];
    if (!first) return;
    product.options.forEach(function (opt, i) { selected[opt.position] = first.options[i]; });
  }

  function openForProduct(url, btn) {
    var jsonUrl = url.split('?')[0].replace(/\/$/, '') + '.js';
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = '…'; }
    fetch(jsonUrl, { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (p) {
        product = p;
        // Default-variant product (no real choices) → add straight away.
        if (!product.variants || product.variants.length <= 1 ||
            (product.options.length === 1 && product.options[0].values.length === 1)) {
          var v = (product.variants && (product.variants.find(function (v) { return v.available; }) || product.variants[0]));
          if (v) {
            selected = {}; // add directly
            var root = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
            var drawer = document.querySelector('cart-drawer');
            var body = { items: [{ id: v.id, quantity: 1 }] };
            if (drawer) { body.sections = ['cart-drawer', 'cart-icon-bubble']; body.sections_url = window.location.pathname; }
            fetch(root + 'cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/javascript' },
              body: JSON.stringify(body)
            }).then(function (r) { return r.json(); }).then(function (d) {
              if (drawer && d.sections) drawer.renderContents(d);
            });
          }
          return;
        }
        titleEl.textContent = product.title;
        imgEl.src = product.featured_image || (product.images && product.images[0]) || '';
        imgEl.alt = product.title;
        errEl.hidden = true;
        seedSelection();
        buildOptions();
        refresh();
        open();
      })
      .catch(function () { /* fall back: let the link/browser handle it */ })
      .finally(function () { if (btn) { btn.disabled = false; btn.textContent = label; } });
  }

  // Delegated: intercept the upsell "Add +" button anywhere in the drawer.
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.cart-drawer__upsell-add');
    if (!btn) return;
    var card = btn.closest('.cart-drawer__upsell-card');
    if (!card) return;
    var link = card.querySelector('.cart-drawer__upsell-title') || card.querySelector('a[href]');
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    openForProduct(link.getAttribute('href'), btn);
  }, true);
})();
