/* =========================================================================
   FFX Guide — Vector Art layer (art.js)
   Every graphic here is inline SVG authored in JS, no image files, no CDN.
   Colour discipline: everything below is monochrome line art driven by
   currentColor / CSS custom properties (var(--ink), var(--line)...), so it
   stays legible in both themes automatically — the only multi-hue element
   left is window.ART.ring()'s progress indicator, which the site's colour
   rule explicitly exempts ("progress fill" carries hue). No per-item
   rainbow colouring, and no purely-decorative mark with no job to do —
   every piece here either identifies a stage, orients the reader between
   sections, or signals progress.
   ========================================================================= */
(function () {
  "use strict";

  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* run a feature in isolation — one broken selector must not take the rest
     of the art layer down on any of the 35 pages this script runs on */
  function safe(fn) {
    try { fn(); } catch (e) { if (window.console && console.warn) console.warn("[art]", e); }
  }

  /* ---------- shared small helpers ---------------------------------------- */

  // emoji in the source HTML may or may not carry a trailing variation
  // selector (U+FE0F); stripping it from both sides of the lookup makes the
  // icon map robust regardless of which form a given page used.
  function stripVS(s) { return s.replace(/️/g, ""); }

  function ico(inner) {
    return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }

  // FNV-1a string hash -> 32-bit unsigned seed
  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // mulberry32 PRNG — small, deterministic, good enough for decorative geometry
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* =========================================================================
     1. ICON REPLACEMENT — h2 > span.ic emoji -> crisp stroke SVG
     ========================================================================= */
  var star = ico('<path d="M12 3.5 14.4 8.9 20.3 9.5 15.9 13.5 17.2 19.3 12 16.3 6.8 19.3 8.1 13.5 3.7 9.5 9.6 8.9Z"/>');

  var ICONS_RAW = {
    "❗": ico('<path d="M12 3.5 21 19.5H3z"/><line x1="12" y1="9.5" x2="12" y2="14.3"/><circle cx="12" cy="17" r=".6" fill="currentColor" stroke="none"/>'),
    "▶": ico('<path d="M7 4.5 19 12 7 19.5Z"/>'),
    "🌀": ico('<path d="M12 12c0-2.2 1.8-4 4-4 2.8 0 5 2.2 5 5s-2.2 5-5 5c-3.3 0-6-2.7-6-6s2.7-6 6-6"/>'),
    "⚔️": ico('<line x1="5" y1="19" x2="19" y2="5"/><line x1="19" y1="19" x2="5" y2="5"/><line x1="9" y1="15" x2="6" y2="18"/><line x1="15" y1="15" x2="18" y2="18"/>'),
    "📦": ico('<path d="M3 8 12 4l9 4-9 4-9-4Z"/><path d="M3 8v9l9 4 9-4V8"/><path d="M12 12v9"/>'),
    "👾": ico('<path d="M5 20v-7a7 7 0 0 1 14 0v7"/><path d="M5 20l2-2 2 2 2-2 2 2 2-2 2 2"/><circle cx="9.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="12" r="1" fill="currentColor" stroke="none"/>'),
    "🪞": ico('<ellipse cx="12" cy="9" rx="6" ry="7"/><line x1="12" y1="16" x2="12" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/>'),
    "🗡️": ico('<line x1="12" y1="3" x2="12" y2="15"/><line x1="8" y1="9" x2="16" y2="9"/><rect x="10.3" y="15" width="3.4" height="4" rx="1"/><circle cx="12" cy="21" r="1" fill="currentColor" stroke="none"/>'),
    "🦋": ico('<line x1="12" y1="5" x2="12" y2="19"/><ellipse cx="7.5" cy="9.5" rx="4.2" ry="3.2" transform="rotate(-18 7.5 9.5)"/><ellipse cx="16.5" cy="9.5" rx="4.2" ry="3.2" transform="rotate(18 16.5 9.5)"/><ellipse cx="8.5" cy="15" rx="3" ry="2.2" transform="rotate(-12 8.5 15)"/><ellipse cx="15.5" cy="15" rx="3" ry="2.2" transform="rotate(12 15.5 15)"/>'),
    "🔱": ico('<line x1="12" y1="6" x2="12" y2="21"/><path d="M8 3v6M12 2v7M16 3v6"/><path d="M6 9c0 2 2.5 3 6 3s6-1 6-3"/>'),
    "🌍": ico('<circle cx="12" cy="12" r="8.5"/><ellipse cx="12" cy="12" rx="3.4" ry="8.5"/><line x1="3.5" y1="12" x2="20.5" y2="12"/><path d="M4.8 7.5h14.4M4.8 16.5h14.4"/>'),
    "🏛️": ico('<path d="M4 9 12 4l8 5"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="6" y1="10.5" x2="6" y2="18"/><line x1="10" y1="10.5" x2="10" y2="18"/><line x1="14" y1="10.5" x2="14" y2="18"/><line x1="18" y1="10.5" x2="18" y2="18"/><line x1="4" y1="19.5" x2="20" y2="19.5"/>'),
    "⛩️": ico('<path d="M3 8c3-1.3 15-1.3 18 0"/><line x1="4" y1="8" x2="4" y2="20"/><line x1="20" y1="8" x2="20" y2="20"/><line x1="5.5" y1="11" x2="18.5" y2="11"/>'),
    "🙏": ico('<path d="M12 4v16"/><path d="M12 4c-1.5 2-5 3-5 8 0 4 2.5 7 5 8"/><path d="M12 4c1.5 2 5 3 5 8 0 4-2.5 7-5 8"/>'),
    "🗿": ico('<path d="M9 21V11c0-4 1.4-7 3-7s3 3 3 7v10"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="10.3" y1="12" x2="10.3" y2="12.6"/><line x1="13.7" y1="12" x2="13.7" y2="12.6"/><line x1="6" y1="21" x2="18" y2="21"/>'),
    "💀": ico('<path d="M6 12a6 6 0 0 1 12 0v3.5c0 1-.6 1.5-1 1.5v2H7v-2c-.4 0-1-.5-1-1.5Z"/><circle cx="9.3" cy="12.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.7" cy="12.5" r="1.2" fill="currentColor" stroke="none"/><line x1="10" y1="19" x2="10" y2="21"/><line x1="14" y1="19" x2="14" y2="21"/>'),
    "⚙️": ico('<circle cx="12" cy="12" r="3"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6"/><circle cx="12" cy="12" r="7"/>'),
    "🌟": ico('<path d="M12 3c.6 3.6 2.4 5.4 6 6-3.6.6-5.4 2.4-6 6-.6-3.6-2.4-5.4-6-6 3.6-.6 5.4-2.4 6-6Z"/><path d="M19 16.5c.25 1.1.9 1.75 2 2-1.1.25-1.75.9-2 2-.25-1.1-.9-1.75-2-2 1.1-.25 1.75-.9 2-2Z"/>'),
    "⏳": ico('<line x1="6" y1="3" x2="18" y2="3"/><line x1="6" y1="21" x2="18" y2="21"/><path d="M7 3c0 4.2 3 5.8 5 7 2-1.2 5-2.8 5-7"/><path d="M7 21c0-4.2 3-5.8 5-7 2 1.2 5 2.8 5 7"/>'),
    "🔮": ico('<circle cx="12" cy="10.5" r="6"/><path d="M6.5 20h11M8 22h8"/><path d="M9 8.3c0-1.7 1.3-3 3-3"/>'),
    "🎭": ico('<path d="M4 8.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5v3c0 3-1.8 5-4 5s-4-2-4-5Z"/><path d="M12 8.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5v3c0 3-1.8 5-4 5s-4-2-4-5Z"/><circle cx="6.6" cy="9.3" r=".6" fill="currentColor" stroke="none"/><circle cx="9.4" cy="9.3" r=".6" fill="currentColor" stroke="none"/><circle cx="14.6" cy="9.3" r=".6" fill="currentColor" stroke="none"/><circle cx="17.4" cy="9.3" r=".6" fill="currentColor" stroke="none"/><path d="M6 13c.7.8 2.3.8 3-.2"/><path d="M14.5 13.6c.6-.9 2.2-1 3-.2"/>'),
    "👥": ico('<circle cx="8.5" cy="7.5" r="3"/><path d="M3 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6"/><circle cx="16.5" cy="9" r="2.4"/><path d="M14 20c.4-2.8 2.4-4.8 5-4.8 2.3 0 4.2 1.6 4.7 3.8"/>'),
    "🎬": ico('<rect x="3.5" y="9.5" width="17" height="11" rx="1.5"/><path d="M3.5 9.5 5 5l16 2.4-1.2 4.1"/><path d="M8 6l1.4 3.5M13 6.8l1.4 3.5M18 7.6l1.2 3.3"/>'),
    "🐤": ico('<circle cx="10" cy="14.2" r="5.3"/><circle cx="15.2" cy="9" r="3.1"/><path d="M18 8.2 21 7.2 19.1 9.9Z"/><circle cx="16.2" cy="8.2" r=".55" fill="currentColor" stroke="none"/><path d="M7.6 17.2c.8.9 2 .9 2.8 0"/>'),
    "🏁": ico('<line x1="5" y1="3" x2="5" y2="21"/><path d="M5 4h13l-3 3.5 3 3.5H5Z"/><path d="M8 4v7M11 4v7M14 4.3v6.7"/>'),
    "★": star,
    "⭐": star,
    "💰": ico('<path d="M9.4 6.6c-3 1-4.6 4-4.6 7 0 4.4 3.2 7.4 7.2 7.4s7.2-3 7.2-7.4c0-3-1.6-6-4.6-7"/><path d="M9.4 6.6c.9-.9 1.7-1.6 2.6-2.6.9 1 1.7 1.7 2.6 2.6"/><path d="M12 10.5v7M10.3 12h3.2M10.3 16h3.4"/>'),
    "🔵": ico('<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/>'),
    "🏟️": ico('<ellipse cx="12" cy="13" rx="9" ry="5.5"/><ellipse cx="12" cy="13" rx="5.5" ry="3.2"/><path d="M3 13c0 3 4 5.5 9 5.5s9-2.5 9-5.5"/>'),
    "❄️": ico('<line x1="12" y1="3" x2="12" y2="21"/><line x1="4.5" y1="7.5" x2="19.5" y2="16.5"/><line x1="19.5" y1="7.5" x2="4.5" y2="16.5"/><path d="M12 6.5 9.8 8M12 6.5 14.2 8M12 17.5 9.8 16M12 17.5 14.2 16"/>'),
    "💥": ico('<path d="M12 3 13.8 9 20 7.5 16 12.4 20 17 13.6 15.7 12 21 10.4 15.7 4 17 8 12.4 4 7.5 10.2 9Z"/>'),
    "📖": ico('<path d="M12 6c-1.8-1.4-4.4-2-7.5-2v13c3.1 0 5.7.6 7.5 2 1.8-1.4 4.4-2 7.5-2V4c-3.1 0-5.7.6-7.5 2Z"/><path d="M12 6v13"/>'),
    "🎯": ico('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>'),
    "➕": ico('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    "🛡️": ico('<path d="M12 3.5 19 6.5v5.2c0 5-3 8-7 9.3-4-1.3-7-4.3-7-9.3V6.5Z"/><path d="M9 12l2.2 2.2L15.5 9.6"/>'),
    "🔰": ico('<path d="M12 3.5 20 8v5c0 4.5-3.4 7.4-8 9.5-4.6-2.1-8-5-8-9.5V8Z"/><path d="M9 13l3-3 3 3M9 17l3-3 3 3"/>'),
    "⚡": ico('<path d="M13 3 6 13.5h5L10 21l8-11h-5Z"/>'),
    "🏅": ico('<circle cx="12" cy="14.5" r="5.5"/><path d="M9.5 4 8 10M14.5 4 16 10"/><path d="M12 12l1 2.4h2.4l-2 1.6.8 2.4-2.2-1.5-2.2 1.5.8-2.4-2-1.6H11Z"/>'),
    "📍": ico('<path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4" fill="currentColor" stroke="none"/>'),
    "✨": ico('<path d="M9 3c.5 2.6 1.7 3.8 4.3 4.3-2.6.5-3.8 1.7-4.3 4.3-.5-2.6-1.7-3.8-4.3-4.3C7.3 6.8 8.5 5.6 9 3Z"/><path d="M18 12c.3 1.6 1 2.3 2.6 2.6-1.6.3-2.3 1-2.6 2.6-.3-1.6-1-2.3-2.6-2.6 1.6-.3 2.3-1 2.6-2.6Z"/><circle cx="16.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/>'),
    "🔥": ico('<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3 1.8-4.7 2.7-6.7.5 1.4 1.3 2.2 2.2 2.6-.2-2.6.6-5.3 3.1-7.2-.6 2.6 0 4.4 1.6 6 1.4 1.4 3 2.8 3 5.3 0 3.6-2.1 6.2-6.1 6.2Z"/>'),
    "🩸": ico('<path d="M12 3c3 4.5 6 8.4 6 11.5a6 6 0 0 1-12 0C6 11.4 9 7.5 12 3Z"/>'),
    "🔗": ico('<path d="M9 15 15 9"/><path d="M8.5 12.5 6 15a3 3 0 0 0 4.2 4.2l2.6-2.6"/><path d="M15.5 11.5 18 9a3 3 0 0 0-4.2-4.2l-2.6 2.6"/>'),
    "🧪": ico('<path d="M10 3h4M10 3v6.5L5.6 17a3 3 0 0 0 2.6 4.5h7.6a3 3 0 0 0 2.6-4.5L14 9.5V3"/><path d="M8 15h8"/>')
  };
  var ICONS = {};
  Object.keys(ICONS_RAW).forEach(function (k) { ICONS[stripVS(k)] = ICONS_RAW[k]; });

  function replaceIcons() {
    var spans = document.querySelectorAll("h2 > span.ic");
    spans.forEach(function (el) {
      var key = stripVS((el.textContent || "").trim());
      var svg = ICONS[key];
      if (svg) { el.innerHTML = svg; } // unmapped emoji is left exactly as-is, never blanked
    });
  }

  /* =========================================================================
     2. PER-STAGE SIGIL — deterministic seeded geometry (monochrome).
        Distinctiveness comes from shape only, never from colour, so the same
        stage always renders the same mark and no two pages fight for hue.
     ========================================================================= */
  function buildSigil(seedStr, size) {
    size = size || 64;
    var rnd = mulberry32(hashSeed(seedStr));
    var cx = size / 2, cy = size / 2, R = size * 0.34;
    var sides = 5 + Math.floor(rnd() * 4); // 5..8
    var rot = rnd() * Math.PI * 2;
    var pts = [];
    for (var i = 0; i < sides; i++) {
      var a = rot + i * (Math.PI * 2 / sides);
      pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]);
    }
    var poly = pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    var dots = pts.map(function (p) {
      return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (size * 0.026).toFixed(1) + '" fill="currentColor" stroke="none"/>';
    }).join("");
    var chordCount = 1 + Math.floor(rnd() * 2); // 1..2 — a refined mark, not a tangle
    var chords = "";
    for (var c = 0; c < chordCount; c++) {
      var i1 = Math.floor(rnd() * sides);
      var i2 = (i1 + 2 + Math.floor(rnd() * (sides - 3))) % sides;
      var p1 = pts[i1], p2 = pts[i2];
      var mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2;
      var dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.sqrt(dx * dx + dy * dy) || 1;
      var bend = (rnd() - 0.5) * size * 0.12;
      var nx = -dy / len, ny = dx / len;
      var qx = mx + nx * bend, qy = my + ny * bend;
      chords += '<path d="M' + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " Q" + qx.toFixed(1) + " " + qy.toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + '"/>';
    }
    return '<svg class="art-sigil-svg" viewBox="0 0 ' + size + " " + size + '" fill="none" stroke="currentColor" ' +
      'stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<polygon points="' + poly + '" opacity=".8"/>' + chords + dots + "</svg>";
  }

  function stageSeedFromPage(page) {
    var m = /^s(\d{2})$/.exec(page || "");
    if (m) return parseInt(m[1], 10);
    if (page === "primer") return 31; // shares the deterministic sigil system, its own fixed slot
    return null;
  }

  function injectHeroSigil() {
    var page = document.body.dataset.page;
    var n = stageSeedFromPage(page);
    if (n === null) return; // reference pages / index carry no stage identity
    var hero = document.querySelector("header.hero");
    if (!hero) return;
    var mark = document.createElement("div");
    mark.className = "art-hero-sigil";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = buildSigil(page, 72);
    hero.appendChild(mark);
  }

  function injectIndexMiniSigils() {
    if (document.body.dataset.page) return; // only index.html has no data-page at all
    var items = document.querySelectorAll("ol.stages li");
    items.forEach(function (li) {
      var a = li.querySelector("a.nm");
      if (!a) return;
      var m = /^(\d{2})-/.exec(a.getAttribute("href") || "");
      if (!m) return;
      var stagePage = "s" + m[1];
      var mini = document.createElement("span");
      mini.className = "art-sigil-mini";
      mini.setAttribute("aria-hidden", "true");
      mini.innerHTML = buildSigil(stagePage, 18);
      // nested INSIDE the link (not as a sibling of it) so it stays inline
      // before the title text even where ol.stages li becomes a flex column
      // (the >=880px bento grid) — a sibling span would become its own row.
      a.insertBefore(mini, a.firstChild);
    });
  }

  /* =========================================================================
     3. SECTION DIVIDER — a hairline that fades at both ends and swells to a
        faceted diamond at the centre. Monochrome, matches the site's own
        h2 hairline language. Inserted between top-level <section>s only.
     ========================================================================= */
  function dividerSVG() {
    return '<svg viewBox="0 0 600 22" preserveAspectRatio="none" aria-hidden="true"><defs>' +
      '<linearGradient id="artDivGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
      '<stop offset="0%" stop-color="currentColor" stop-opacity="0"/>' +
      '<stop offset="45%" stop-color="currentColor" stop-opacity=".8"/>' +
      '<stop offset="55%" stop-color="currentColor" stop-opacity=".8"/>' +
      '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
      "</linearGradient></defs>" +
      '<line x1="0" y1="11" x2="600" y2="11" stroke="url(#artDivGrad)" stroke-width="1"/>' +
      '<polygon points="300,4 312,11 300,18 288,11" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".6"/>' +
      "</svg>";
  }

  function injectDividers() {
    var wrap = document.querySelector(".wrap");
    if (!wrap) return;
    var sections = wrap.querySelectorAll(":scope > section");
    for (var i = 0; i < sections.length - 1; i++) {
      var div = document.createElement("div");
      div.className = "art-divider";
      div.setAttribute("aria-hidden", "true");
      div.innerHTML = dividerSVG();
      sections[i].insertAdjacentElement("afterend", div);
    }
  }

  /* =========================================================================
     4. FOOTER WAVE — a single thin drifting hairline above <footer>, full
        width of the viewport (deliberately breaks out of .wrap). Monochrome.
     ========================================================================= */
  function footerWaveSVG() {
    var tile = 1200, h = 40;
    var d = "M0 26 C 100 10,200 40,300 24 S 500 8,600 24 S 800 40,900 24 S 1100 8,1200 24";
    return '<svg class="art-wave-svg" viewBox="0 0 ' + (tile * 2) + " " + h + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1"/>' +
      '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" transform="translate(' + tile + ',0)"/>' +
      "</svg>";
  }

  function injectFooterWave() {
    var footer = document.querySelector("footer");
    if (!footer || !footer.parentNode) return;
    var band = document.createElement("div");
    band.className = "art-footer-wave";
    band.setAttribute("aria-hidden", "true");
    band.innerHTML = footerWaveSVG();
    footer.parentNode.insertBefore(band, footer);
  }

  /* =========================================================================
     5. INDEX HERO PANORAMA — quiet monochrome silhouette (ridges + airship +
        drifting spheres) in 3 parallax layers. Index page only. This is the
        page's only hero art (no separate crest mark) — see the fade mask
        below and the redrawn airship: every stroke here has to earn its
        place on its own, not lean on a matching mark elsewhere.
     ========================================================================= */
  function panoramaSVG() {
    return '<svg class="art-pano-svg" viewBox="0 0 1000 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>' +
      // vertical fade used to soften the ridges' top edge instead of a hard cut line
      '<linearGradient id="artPanoFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset="68%" stop-color="#fff" stop-opacity="0"/>' +
      '<stop offset="88%" stop-color="#fff" stop-opacity="1"/>' +
      '<stop offset="100%" stop-color="#fff" stop-opacity="1"/>' +
      "</linearGradient>" +
      '<mask id="artPanoFade"><rect x="0" y="0" width="1000" height="380" fill="url(#artPanoFadeGrad)"/></mask>' +
      "</defs>" +
      // ridges pushed well below the subtitle, so their crest never crosses the
      // hero text, and masked to fade out softly at the top instead of a hard line
      '<g class="art-layer-back" mask="url(#artPanoFade)" fill="none" stroke="currentColor" stroke-width="1" opacity=".5">' +
      '<path d="M0 300 L120 285 L240 305 L360 278 L480 300 L600 282 L720 302 L840 288 L1000 296"/>' +
      "</g>" +
      '<g class="art-layer-mid" mask="url(#artPanoFade)" fill="none" stroke="currentColor" stroke-width="1" opacity=".7">' +
      '<path d="M0 350 L150 335 L300 352 L450 330 L600 348 L760 332 L900 350 L1000 338"/>' +
      "</g>" +
      '<g class="art-layer-front" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" opacity=".8">' +
      // airship, redrawn legible at small scale: elongated envelope, tail fins,
      // hanging gondola + engine nacelles, tilted off-axis so it reads as a
      // small, distant, moving shape instead of a symmetric static blob
      '<g transform="translate(660,118) rotate(-8)">' +
      '<ellipse cx="0" cy="0" rx="22" ry="6"/>' +
      '<path d="M16 -3 L25 -9 L21 -1 Z"/><path d="M16 3 L25 9 L21 1 Z"/>' +
      '<line x1="-6" y1="5" x2="-6" y2="9"/><line x1="6" y1="5" x2="6" y2="9"/>' +
      '<rect x="-7" y="9" width="14" height="5" rx="1.2"/>' +
      '<circle cx="-9" cy="13" r="1.4"/><circle cx="9" cy="13" r="1.4"/>' +
      "</g>" +
      '<circle cx="130" cy="90" r="9"/><circle cx="230" cy="150" r="5"/><circle cx="850" cy="110" r="7"/>' +
      "</g></svg>";
  }

  function injectIndexPanorama() {
    if (document.body.dataset.page) return; // index.html only
    var hero = document.querySelector("header.hero");
    if (!hero) return;
    var pano = document.createElement("div");
    pano.className = "art-index-panorama";
    pano.setAttribute("aria-hidden", "true");
    pano.innerHTML = panoramaSVG();
    hero.insertBefore(pano, hero.firstChild);

    if (reduced) return; // static silhouette only, no scroll-driven motion
    var back = pano.querySelector(".art-layer-back");
    var mid = pano.querySelector(".art-layer-mid");
    var front = pano.querySelector(".art-layer-front");
    var ticking = false;
    function apply() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (back) back.style.transform = "translateY(" + (y * 0.06).toFixed(1) + "px)";
      if (mid) mid.style.transform = "translateY(" + (y * 0.12).toFixed(1) + "px)";
      if (front) front.style.transform = "translateY(" + (y * 0.2).toFixed(1) + "px)";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(apply); ticking = true; }
    }, { passive: true });
    apply();
  }

  /* =========================================================================
     6. window.ART — the one global this file exposes. ring() returns a
        gradient-stroked progress ring; "progress fill" is the one place the
        site's colour-discipline rule explicitly allows a multi-stop hue, so
        it mirrors the sticky progress bar's own cyan->purple->gold recipe.
     ========================================================================= */
  var ringCounter = 0;
  window.ART = {
    ring: function (percent, size) {
      size = size || 48;
      var r = size / 2 - 3.5;
      var c = 2 * Math.PI * r;
      var pct = Math.max(0, Math.min(100, Number(percent) || 0));
      var offset = c * (1 - pct / 100);
      var gid = "artRingGrad" + (ringCounter++);
      return '<svg class="art-ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size + '" aria-hidden="true"><defs>' +
        '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
        '<stop offset="0%" style="stop-color:var(--cyan)"/>' +
        '<stop offset="55%" style="stop-color:var(--purple)"/>' +
        '<stop offset="100%" style="stop-color:var(--gold)"/>' +
        "</linearGradient></defs>" +
        '<circle class="art-ring-track" cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" style="stroke:var(--line)" stroke-width="3"/>' +
        '<circle class="art-ring-fill" cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + r + '" fill="none" stroke="url(#' + gid + ')" stroke-width="3" ' +
        'stroke-linecap="round" stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + offset.toFixed(2) + '" ' +
        'transform="rotate(-90 ' + (size / 2) + " " + (size / 2) + ')"/></svg>';
    }
  };

  /* ---------- run everything -------------------------------------------- */
  safe(replaceIcons);
  safe(injectHeroSigil);
  safe(injectIndexMiniSigils);
  safe(injectDividers);
  safe(injectFooterWave);
  safe(injectIndexPanorama);
})();
