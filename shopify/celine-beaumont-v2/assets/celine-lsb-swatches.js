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
    function showInGallery(v) {
      if (!gallery || !prefix || !v || !v.media_id) return;
      var id = prefix + '-' + v.media_id;
      if (typeof gallery.setActiveMedia === 'function') {
        try { gallery.setActiveMedia(id, true); return; } catch (e) {}
      }
      var viewer = gallery.querySelector('[id^="GalleryViewer"]');
      if (!viewer) return;
      var media = viewer.querySelector('[data-media-id="' + id + '"]');
      if (!media) return;
      viewer.querySelectorAll('[data-media-id]').forEach(function (el) { el.classList.remove('is-active'); });
      media.classList.add('is-active');
      if (media.parentElement.firstChild !== media) media.parentElement.prepend(media);
      if (viewer.slider && typeof viewer.resetPages === 'function') {
        try { viewer.resetPages(); } catch (e) {}
      }
      var thumbs = gallery.querySelector('[id^="GalleryThumbnails"]');
      if (thumbs) {
        var t = thumbs.querySelector('[data-target="' + id + '"]');
        if (t) {
          if (t.parentElement.firstChild !== t) t.parentElement.prepend(t);
          thumbs.querySelectorAll('button').forEach(function (b) { b.removeAttribute('aria-current'); });
          var tb = t.querySelector('button');
          if (tb) tb.setAttribute('aria-current', 'true');
        }
      }
      try { media.parentElement.scrollTo({ left: media.offsetLeft }); } catch (e) {}
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
    function findSizeChart() {
      var el = document.querySelector(
        '[class*="kiwi" i],[id*="kiwi" i],[class*="size-chart" i],[class*="sizechart" i],[class*="size_chart" i]'
      );
      if (el) return el.closest('.shopify-block') || el.closest('[id^="shopify-block"]') || el;
      var nodes = document.querySelectorAll('a, button, summary');
      for (var i = 0; i < nodes.length; i++) {
        var t = (nodes[i].textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
        if (t === 'size chart' || t === 'size guide' || t === 'maattabel') {
          return nodes[i].closest('.shopify-block') || nodes[i].closest('[id^="shopify-block"]') || nodes[i];
        }
      }
      return null;
    }
    function placeSizeChart() {
      var node = findSizeChart();
      if (!node || node === container || container.contains(node)) return !!node;
      if (container.nextElementSibling === node) return true;
      container.insertAdjacentElement('afterend', node);
      return true;
    }
    if (!placeSizeChart()) {
      var tries = 0;
      var mo = new MutationObserver(function () {
        if (placeSizeChart() || ++tries > 40) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      window.setTimeout(function () { mo.disconnect(); }, 12000);
    }

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
