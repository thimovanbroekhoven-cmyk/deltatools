/* ==========================================================================
   Celine Beaumont — colour swatches + main-gallery sync for the purchase
   module (snippets/celine-limited-stock-bundle.liquid).

   Lets shoppers browse every colour as an image swatch (like icon-amsterdam)
   and updates the main product photo when a colour is picked. Self-contained:
   it drives the module's existing <select> dropdowns by setting their value
   and dispatching a native 'change' event, so the module's own price/thumb
   logic keeps working — this file never reaches into the module's internals.
   Loaded from that snippet with a deferred <script>. Fully reversible: delete
   this file + its <script> tag and the [data-lsb-swatches] container.
   ========================================================================== */
(function () {
  function initSwatches(root) {
    var variants = [];
    try {
      variants = JSON.parse(root.querySelector('[data-lsb-variants]').textContent);
    } catch (e) {}
    if (!variants.length) return;

    var fallbackImg = root.dataset.fallbackImg || '';
    var container = root.querySelector('[data-lsb-swatches]');
    if (!container) return;

    // Which option position is the colour? Match a select's label; else 1.
    var colorPos = null;
    root.querySelectorAll('.lsb-select').forEach(function (s) {
      if (colorPos) return;
      var name = (s.getAttribute('aria-label') || '').toLowerCase();
      if (name.indexOf('color') >= 0 || name.indexOf('colour') >= 0 || name.indexOf('kleur') >= 0) {
        colorPos = parseInt(s.dataset.optPosition, 10);
      }
    });
    if (!colorPos) colorPos = 1;

    function activeOption() {
      var c = root.querySelector('.lsb-option__radio:checked');
      return c ? c.value : 'bundle';
    }
    function activeRows() {
      var opt = root.querySelector('[data-lsb-option="' + activeOption() + '"]');
      return opt ? Array.prototype.slice.call(opt.querySelectorAll('.lsb-row')) : [];
    }
    function rowVariant(row) {
      var selects = row.querySelectorAll('.lsb-select');
      if (!selects.length) return variants[0];
      var values = Array.prototype.map.call(selects, function (s) { return s.value; });
      return variants.find(function (v) {
        return v.options.length === values.length && v.options.every(function (o, i) { return o === values[i]; });
      });
    }

    // --- main product gallery -------------------------------------------
    var gallery = document.querySelector('media-gallery');
    var prefix = null;
    if (gallery) {
      var any = gallery.querySelector('[data-media-id]');
      if (any) {
        var dm = any.getAttribute('data-media-id');
        prefix = dm.substring(0, dm.lastIndexOf('-'));
      }
    }

    // Swap the main product photo to a variant's featured media. Prefer the
    // theme's native <media-gallery> API (Dawn's setActiveMedia): it correctly
    // drives the MOBILE slider — prepend + slider.resetPages() + scroll — which
    // a plain is-active/prepend does not, so the hero image really changes on a
    // phone. Only fall back to manual activation if the element hasn't upgraded.
    // Bump a Shopify CDN image URL to a hero-sized width.
    function bigImg(url) {
      if (!url) return url;
      if (/([?&])width=\d+/.test(url)) return url.replace(/([?&])width=\d+/, '$1width=1200');
      return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'width=1200';
    }
    // The currently visible hero <img> in the gallery viewer.
    function heroImg() {
      if (!gallery) return null;
      var viewer = gallery.querySelector('[id^="GalleryViewer"]') || gallery;
      var slide = viewer.querySelector('.product__media-item.is-active')
               || viewer.querySelector('.product__media-item')
               || viewer.querySelector('li');
      return slide ? slide.querySelector('img') : null;
    }
    function showInGallery(v) {
      if (!v) return;
      var id = (prefix && v.media_id) ? prefix + '-' + v.media_id : null;
      // If this colour's photo IS a slide in the gallery, use Dawn's native
      // API (keeps the mobile slider + thumbnails in sync).
      if (id && gallery) {
        var viewer = gallery.querySelector('[id^="GalleryViewer"]');
        if (viewer && viewer.querySelector('[data-media-id="' + id + '"]') && typeof gallery.setActiveMedia === 'function') {
          try { gallery.setActiveMedia(id, true); return; } catch (e) {}
        }
      }
      // Otherwise the theme hides variant photos from the gallery
      // (hide_variants), so there is no slide to switch to — swap the visible
      // hero image straight to this colour's photo instead.
      var img = heroImg();
      if (img && v.image) {
        img.removeAttribute('srcset');
        img.src = bigImg(v.image);
      }
    }

    function currentColor() {
      var rows = activeRows();
      if (!rows.length) return null;
      var sel = rows[0].querySelector('.lsb-select[data-opt-position="' + colorPos + '"]');
      return sel ? sel.value : null;
    }
    function syncActive() {
      var cur = currentColor();
      container.querySelectorAll('.lsb-swatch').forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-color') === cur);
      });
    }

    // --- build the swatches ---------------------------------------------
    var sample = root.querySelector('.lsb-select[data-opt-position="' + colorPos + '"]');
    if (!sample) return; // default-variant product: nothing to browse
    var values = Array.prototype.map.call(sample.options, function (o) { return o.value; });
    if (values.length < 2) return; // only one colour

    values.forEach(function (val) {
      var rep = variants.find(function (v) { return v.available && v.options[colorPos - 1] === val; })
             || variants.find(function (v) { return v.options[colorPos - 1] === val; });
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lsb-swatch';
      btn.setAttribute('data-color', val);
      btn.setAttribute('aria-label', val);
      btn.title = val;
      var img = document.createElement('img');
      img.src = (rep && rep.image) ? rep.image : fallbackImg;
      img.alt = val;
      img.loading = 'lazy';
      img.width = 48;
      img.height = 60;
      btn.appendChild(img);
      btn.addEventListener('click', function () {
        activeRows().forEach(function (row) {
          var sel = row.querySelector('.lsb-select[data-opt-position="' + colorPos + '"]');
          if (sel && sel.value !== val) {
            sel.value = val;
            // Let the module's own listeners update the row thumb + price.
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        syncActive();
        var rows = activeRows();
        showInGallery(rows.length ? rowVariant(rows[0]) : rep);
      });
      container.appendChild(btn);
    });
    container.hidden = false;
    syncActive();

    // --- move the size chart directly under the colour swatches ----------
    // The size chart is a Shopify app block (Kiwi) that renders elsewhere in
    // the product column. The shopper asked for it right under the colour
    // strip, so we relocate its DOM node to sit immediately after the swatches.
    // The app injects asynchronously, so we retry via a MutationObserver until
    // it appears, then stop. Moving the node keeps the app's own click handler.
    var infoCol = root.closest('.product__info-container, .product__info-wrapper, [id^="ProductInfo"]') || document;
    function findSizeChart() {
      // The size chart is the product column's only Shopify APP block, which
      // Shopify wraps in .shopify-block / [id^="shopify-block-"]. That wrapper
      // is the most reliable handle (the app's inner class names can change).
      var blocks = infoCol.querySelectorAll('.shopify-block, [id^="shopify-block-"]');
      for (var i = 0; i < blocks.length; i++) {
        if (!blocks[i].contains(root) && !root.contains(blocks[i])) return blocks[i];
      }
      // Fallbacks: a Kiwi-flavoured element, or anything reading "size chart".
      var el = document.querySelector(
        '[class*="kiwi" i],[id*="kiwi" i],[class*="size-chart" i],[class*="sizechart" i],[class*="size_chart" i]'
      );
      if (el) return el.closest('.shopify-block, [id^="shopify-block-"]') || el;
      var nodes = infoCol.querySelectorAll('a, button, summary, span, div');
      for (var j = 0; j < nodes.length; j++) {
        var t = (nodes[j].textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (t === 'size chart' || t === 'size guide' || t === 'maattabel') {
          return nodes[j].closest('.shopify-block, [id^="shopify-block-"]') || nodes[j];
        }
      }
      return null;
    }
    function placeSizeChart() {
      var node = findSizeChart();
      if (!node || node === container || container.contains(node) || node.contains(container)) return !!node;
      if (container.nextElementSibling === node) return true;
      container.insertAdjacentElement('afterend', node);
      return true;
    }
    if (!placeSizeChart()) {
      var tries = 0;
      var mo = new MutationObserver(function () {
        if (placeSizeChart() || ++tries > 60) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(function () { mo.disconnect(); }, 15000);
    }
    // Belt-and-braces: the app may inject after our observer window; retry on a
    // few timers too. placeSizeChart is idempotent, so extra calls are cheap.
    [400, 1200, 3000].forEach(function (ms) { window.setTimeout(placeSizeChart, ms); });

    // Keep the swatch highlight + main photo in sync when the dropdowns or the
    // single/2-pack option change (whether by the shopper or by a swatch click).
    root.querySelectorAll('.lsb-select').forEach(function (s) {
      s.addEventListener('change', function () {
        syncActive();
        var row = s.closest('.lsb-row');
        if (row) showInGallery(rowVariant(row));
      });
    });
    root.querySelectorAll('.lsb-option__radio').forEach(function (r) {
      r.addEventListener('change', syncActive);
    });
  }

  function boot() {
    document.querySelectorAll('[data-lsb-root]').forEach(initSwatches);
  }
  // Run after the module's own inline script has initialised the dropdowns.
  if (document.readyState === 'loading') {
    window.addEventListener('load', boot);
  } else {
    boot();
  }
})();
