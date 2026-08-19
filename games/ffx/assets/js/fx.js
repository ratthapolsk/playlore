/*
 * fx.js — FFX guide core engine (injects its own DOM, no HTML file is edited).
 * Loaded with `defer` on every page, in the order: app.js, fx.js, art.js,
 * gimmicks.js. app.js already wrote its DOM (checklist counters etc.) by the
 * time this file runs; art.js/gimmicks.js run after this file and read
 * window.FFX + the ffx:* events this file dispatches.
 * Vanilla JS, no build step, no external libs — this file must run straight
 * from file://.
 */
(function(){
  'use strict';

  /* ---------- environment ---------- */
  var reduced = false;
  try { reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  var supportsVT = !reduced && (typeof window.ViewTimeline === 'function');
  var EASE_SETTLE = 'cubic-bezier(.16,1,.3,1)'; // the "settles into place" ease used across the choreography

  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }

  /* ---------- command-palette page data ----------
   * Hand-verified against index.html (30 stage <li> entries + guidebar refs
   * + story primer + the hub itself). Hard-coded because file:// has no fetch. */
  var SPECIAL_K = {
    'index.html': '⌂',
    '00-story-primer.html': '00',
    'ref-sidequests.html': 'Q',
    'ref-abilities.html': 'A',
    'ref-gear.html': 'G'
  };
  var PAGES = [
    {n:null, file:'index.html', title:'คู่มือรวม FFX — 30 ด่าน', sub:'Final Fantasy X – Complete Walkthrough'},
    {n:null, file:'00-story-primer.html', title:'📖 เข้าใจเนื้อเรื่อง FFX ใน 10 นาที (Story Primer)', sub:'เล่นมานานแล้วยังงงเนื้อเรื่อง? อ่านหน้านี้ก่อน — Sin/Yevon/แสวงบุญ/fayth/ความจริง Final Summoning + ปมตัวละคร'},
    {n:null, file:'ref-sidequests.html', title:'Side Quest / ล่าอาวุธ / 99999 / Arena / ตัวแปลภาษา', sub:'อ้างอิง'},
    {n:null, file:'ref-abilities.html', title:'สกิล/เวท + คอมโบ', sub:'อ้างอิง'},
    {n:null, file:'ref-gear.html', title:'อาวุธ/เกราะ + Tier + Attribute', sub:'อ้างอิง'},
    {n:1, file:'01-zanarkand-intro.html', title:'Zanarkand (บทเปิด)', sub:'tutorial – Sinspawn Ammes'},
    {n:2, file:'02-baaj-ruins.html', title:'Baaj Temple', sub:'Tidus ตื่น – Geosgaeno/Klikk'},
    {n:3, file:'03-salvage-ship.html', title:'Salvage Ship', sub:'เจอ Rikku – Tros'},
    {n:4, file:'04-besaid-aeon-valefor.html', title:'Besaid', sub:'Cloister – Kimahri'},
    {n:5, file:'05-ss-liki.html', title:'S.S. Liki', sub:'Sinspawn Echuilles'},
    {n:6, file:'06-kilika-aeon-ifrit.html', title:'Kilika', sub:'Cloister – Geneaux'},
    {n:7, file:'07-ss-winno-jecht-shot.html', title:'S.S. Winno', sub:'ฝึก Jecht Shot'},
    {n:8, file:'08-luca-auron-joins.html', title:'Luca', sub:'ทัวร์ Blitzball – Oblitzerator'},
    {n:9, file:'09-miihen-highroad.html', title:"Mi'ihen Highroad", sub:'Chocobo Eater'},
    {n:10, file:'10-mushroom-rock.html', title:'Mushroom Rock', sub:"Operation Mi'ihen – Sinspawn Gui"},
    {n:11, file:'11-djose-aeon-ixion.html', title:'Djose Temple', sub:'Cloister'},
    {n:12, file:'12-moonflow-rikku-joins.html', title:'Moonflow', sub:'Extractor – Shoopuf'},
    {n:13, file:'13-guadosalam-farplane.html', title:'Guadosalam', sub:'Farplane – Seymour ขอแต่งงาน'},
    {n:14, file:'14-thunder-plains.html', title:'Thunder Plains', sub:'Qactuar – หลบฟ้าผ่า'},
    {n:15, file:'15-macalania-woods.html', title:'Macalania Woods', sub:'Spherimorph'},
    {n:16, file:'16-macalania-temple-aeon-shiva.html', title:'Macalania Temple', sub:'Cloister – Seymour – Anima – Wendigo'},
    {n:17, file:'17-bikanel-desert.html', title:'Bikanel Desert', sub:'Zu – Cactuar'},
    {n:18, file:'18-al-bhed-home-missable.html', title:'Al Bhed Home', sub:'Home ถูกทำลาย'},
    {n:19, file:'19-airship-get-evrae.html', title:'Airship / Evrae', sub:'Evrae'},
    {n:20, file:'20-bevelle-aeon-bahamut.html', title:'Bevelle Temple', sub:'Cloister – งานแต่ง'},
    {n:21, file:'21-via-purifico.html', title:'Via Purifico', sub:'Isaaru – Evrae Altana – Seymour Natus'},
    {n:22, file:'22-calm-lands-monster-arena.html', title:'Calm Lands', sub:'Defender X'},
    {n:23, file:'23-cavern-aeon-yojimbo.html', title:'Cavern of Stolen Fayth', sub:'เสริม – ต่อราคา'},
    {n:24, file:'24-remiem-aeon-magus-sisters.html', title:'Remiem Temple', sub:'เสริม – Belgemine'},
    {n:25, file:'25-gagazet-trail.html', title:'Mt. Gagazet (ทางขึ้นเขา)', sub:'Biran&Yenke – Seymour Flux'},
    {n:26, file:'26-gagazet-cave.html', title:'Mt. Gagazet Cave', sub:'Sanctuary Keeper'},
    {n:27, file:'27-zanarkand-ruins.html', title:'Zanarkand Ruins', sub:'Cloister – Yunalesca'},
    {n:28, file:'28-sin-assault.html', title:'บุก Sin', sub:'ครีบ Sin – Genais – Overdrive Sin'},
    {n:29, file:'29-inside-sin.html', title:'ภายใน Sin', sub:'Seymour Omnis'},
    {n:30, file:'30-dreams-end-final.html', title:"Dream's End", sub:'Jecht – Yu Yevon 🎬'}
  ];

  function kOf(p){
    if(typeof p.n === 'number') return (p.n<10?'0':'')+p.n;
    return SPECIAL_K[p.file] || '•';
  }

  /* ================= DOM injection ================= */

  /* animated space backdrop — position:fixed in style.css, so it always fills
   * the current viewport at any scroll position (no seam, no layout shift) */
  function injectBg(){
    var bg = document.createElement('div');
    bg.className = 'fx-bg';
    bg.innerHTML = '<span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span><div class="fx-grid"></div><div class="fx-stars"></div>';
    document.body.appendChild(bg);
    var noise = document.createElement('div');
    noise.className = 'fx-noise';
    document.body.appendChild(noise);
  }

  /* thin top scroll-progress line */
  function injectScrollBar(){
    var el = document.createElement('div');
    el.className = 'fx-scroll';
    document.body.appendChild(el);
    return el;
  }

  function injectToast(){
    var el = document.createElement('div');
    el.className = 'fx-toast';
    document.body.appendChild(el);
    var hideTimer = null;
    return function toast(msg, ms){
      el.textContent = msg;
      el.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function(){ el.classList.remove('show'); }, ms || 2200);
    };
  }

  /* theme toggle — reads the CURRENT data-theme (already set to a saved value,
   * or "light" by default, by the inline bootstrap script in <head>) and only
   * ever flips it; never derives a default from prefers-color-scheme. */
  function injectThemeToggle(){
    var btn = document.getElementById('themeToggle');
    if(btn){
      /* a page still shipping its own legacy button/inline script — replace it
       * wholesale (cloneNode drops old listeners) so fx.js is the single owner */
      var fresh = btn.cloneNode(false);
      btn.parentNode.replaceChild(fresh, btn);
      btn = fresh;
    } else {
      btn = document.createElement('button');
      btn.id = 'themeToggle';
      document.body.appendChild(btn);
    }
    btn.setAttribute('aria-label', 'สลับธีมมืด/สว่าง');

    function currentTheme(){
      return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }
    function paintIcon(){
      btn.textContent = currentTheme() === 'dark' ? '☀️' : '🌙';
    }
    function applyTheme(theme){
      document.documentElement.setAttribute('data-theme', theme);
      lsSet('ffx_theme', theme);
      paintIcon();
      document.dispatchEvent(new CustomEvent('ffx:theme', {detail:{theme: theme}}));
    }
    function doToggle(){
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      if(!reduced && typeof document.startViewTransition === 'function'){
        var rect = btn.getBoundingClientRect();
        var x = rect.left + rect.width/2, y = rect.top + rect.height/2;
        var endRadius = Math.hypot(Math.max(x, innerWidth-x), Math.max(y, innerHeight-y));
        var trans = document.startViewTransition(function(){ applyTheme(next); });
        trans.ready.then(function(){
          document.documentElement.animate(
            { clipPath: ['circle(0px at '+x+'px '+y+'px)', 'circle('+endRadius+'px at '+x+'px '+y+'px)'] },
            { duration: 520, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
          );
        });
      } else {
        applyTheme(next);
      }
    }
    paintIcon();
    btn.addEventListener('click', doToggle);
    return { theme: currentTheme, toggle: doToggle };
  }

  /* floating "home" pin, top-left, mirroring #themeToggle — a direct child of
   * <body> (never inside header.hero, which carries the parallax transform:
   * a transformed ancestor becomes the containing block for position:fixed
   * descendants, which is exactly why this can't live inline in the hero).
   * Not injected on index.html itself (you're already home). Visual styling
   * (glass pill, size, position) lives in style.css under `.fx-home` — this
   * only owns the DOM/behaviour side. */
  function injectHomeButton(){
    if(!document.body.dataset.page) return; // no data-page = index.html itself
    var a = document.createElement('a');
    a.className = 'fx-home';
    a.href = 'index.html';
    a.textContent = '≡ หน้ารวม';
    document.body.appendChild(a);
    // exactly one home affordance per page now that the floating one exists —
    // hidden via inline style set from JS only, so a page opened with the
    // script blocked still has its original, always-visible links home
    [].slice.call(document.querySelectorAll('.navbtns .home')).forEach(function(el){
      el.style.display = 'none';
    });
  }

  function injectFabTop(){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fx-fab fx-top';
    btn.setAttribute('aria-label', 'เลื่อนขึ้นบนสุด');
    btn.textContent = '↑';
    document.body.appendChild(btn);
    btn.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    return btn;
  }

  function injectFabSearch(onOpen){
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'fx-fab fx-search';
    btn.setAttribute('aria-label', 'เปิดแผนที่จุดหมาย (ค้นหา)');
    btn.textContent = '⌘K';
    document.body.appendChild(btn);
    btn.addEventListener('click', onOpen);
    return btn;
  }

  /* command palette — themed as the airship Fahrenheit's destination map */
  function injectPalette(pages){
    var pal = document.createElement('div');
    pal.className = 'fx-pal';
    pal.setAttribute('role', 'dialog');
    pal.setAttribute('aria-modal', 'true');
    pal.setAttribute('aria-label', 'แผนที่จุดหมาย — Fahrenheit');
    pal.innerHTML =
      '<div class="box">' +
        '<input type="text" placeholder="แผนที่จุดหมาย — Fahrenheit: พิมพ์ค้นหาด่าน/หน้า (ไทย/อังกฤษ)" autocomplete="off" spellcheck="false" aria-label="ค้นหาด่านหรือหน้าอ้างอิง">' +
        '<ul></ul>' +
        '<div class="hint">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> เลือกด่าน</span>' +
          '<span><kbd>Enter</kbd> ไปหน้านั้น</span>' +
          '<span><kbd>Esc</kbd> ปิด</span>' +
          '<span><kbd>Ctrl</kbd> + <kbd>K</kbd> หรือ <kbd>/</kbd> เปิดแผนที่จุดหมาย</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(pal);

    var input = pal.querySelector('input');
    var list = pal.querySelector('ul');
    var items = [];
    var selIndex = 0;

    function filter(q){
      q = (q || '').trim().toLowerCase();
      if(!q) return pages.slice();
      var tokens = q.split(/\s+/);
      return pages.filter(function(p){
        var hay = (p.title + ' ' + (p.sub || '') + ' ' + p.file).toLowerCase();
        return tokens.every(function(t){ return hay.indexOf(t) !== -1; });
      });
    }

    function buildItem(p){
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = p.file;
      var k = document.createElement('span');
      k.className = 'k';
      k.textContent = kOf(p);
      var sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = p.sub || '';
      a.appendChild(k);
      a.appendChild(document.createTextNode(' ' + p.title + ' '));
      a.appendChild(sub);
      li.appendChild(a);
      return li;
    }

    function render(pageList){
      items = pageList;
      list.innerHTML = '';
      if(!items.length){
        var empty = document.createElement('li');
        var span = document.createElement('span');
        span.style.cssText = 'display:block;padding:14px 15px;color:var(--muted);font-size:13.5px';
        span.textContent = 'ไม่พบหน้าที่ค้นหา ลองคำอื่น...';
        empty.appendChild(span);
        list.appendChild(empty);
        return;
      }
      items.forEach(function(p, i){
        var li = buildItem(p);
        if(i === selIndex) li.className = 'sel';
        li.addEventListener('mouseenter', function(){ selIndex = i; updateSel(); });
        list.appendChild(li);
      });
    }

    function updateSel(){
      [].forEach.call(list.children, function(li, i){ li.classList.toggle('sel', i === selIndex); });
      var sel = list.children[selIndex];
      if(sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
    }

    function open(){
      pal.classList.add('open');
      input.value = '';
      selIndex = 0;
      render(filter(''));
      setTimeout(function(){ input.focus(); }, 0);
    }
    function close(){ pal.classList.remove('open'); }
    function isOpen(){ return pal.classList.contains('open'); }

    input.addEventListener('input', function(){
      selIndex = 0;
      render(filter(input.value));
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){ e.preventDefault(); selIndex = Math.min(selIndex+1, items.length-1); updateSel(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); selIndex = Math.max(selIndex-1, 0); updateSel(); }
      else if(e.key === 'Enter'){ e.preventDefault(); var p = items[selIndex]; if(p) location.href = p.file; }
      else if(e.key === 'Escape'){ close(); }
    });
    pal.addEventListener('click', function(e){ if(e.target === pal) close(); });
    document.addEventListener('keydown', function(e){
      if((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)){
        e.preventDefault();
        isOpen() ? close() : open();
      } else if(e.key === '/' && !isOpen()){
        var el = document.activeElement;
        var tag = el ? el.tagName : '';
        var typing = tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable);
        if(!typing){ e.preventDefault(); open(); }
      } else if(e.key === 'Escape' && isOpen()){
        close();
      }
    });

    return { open: open, close: close, isOpen: isOpen };
  }

  /* ================= behaviors ================= */

  function wrapTables(){
    [].slice.call(document.querySelectorAll('table')).forEach(function(t){
      if(t.parentElement && t.parentElement.classList.contains('tbl-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'tbl-wrap';
      t.parentNode.insertBefore(wrap, t);
      wrap.appendChild(t);
    });
  }

  /* `.term[title]` -> `.term[data-tip]` so the OS tooltip stops appearing and
   * style.css's own `.term[data-tip]::after` bubble takes over; tabindex so
   * keyboard users can focus a term and trigger the same ::after via :focus-visible */
  function initTermTooltips(){
    [].slice.call(document.querySelectorAll('.term[title]')).forEach(function(el){
      var tip = el.getAttribute('title');
      if(tip) el.setAttribute('data-tip', tip);
      el.removeAttribute('title');
      if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });
  }

  /* Keep a tooltip inside the window.
   *
   * The bubble is a ::after centred on its term with left:50% + translateX(-50%),
   * and CSS has no way to know how close to an edge that term sits. Measured
   * across the site: fine at 1440px, but 20 tooltips hang off the edge at 900px
   * and 60 at 390px. Two more failure modes hide behind that one:
   *
   *   - A term that WRAPS onto a second line has a bounding rect spanning the
   *     whole column, so "centre on the term" centres on the wrong point. Anchor
   *     on the first line box instead (getClientRects()[0]).
   *   - A term high on the page opens its bubble upward, underneath the sticky
   *     .pbar, where it cannot be read. The old rule flipped only
   *     `:first-of-type` downward, which is a guess about position rather than a
   *     measurement of it, so any other term near the top still opened upward.
   *
   * Both are solved by measuring at the moment the tooltip is asked for, and
   * feeding the correction back to CSS as --tip-dx plus a .tip-down class. */
  function initTooltipFit(){
    var PAD = 10;   // keep this much clear of the window edge

    function fit(el){
      el.style.removeProperty('--tip-dx');
      el.classList.remove('tip-down');

      var after = getComputedStyle(el, '::after');
      var w = parseFloat(after.width), h = parseFloat(after.height);
      if(!w || !h) return;

      // first line box, not the union: a wrapped term's union is the whole column
      var rects = el.getClientRects();
      var box = rects.length ? rects[0] : el.getBoundingClientRect();
      var vw = document.documentElement.clientWidth;

      var centre = box.left + box.width / 2;
      var dx = 0;
      if(centre - w / 2 < PAD)          dx = PAD - (centre - w / 2);
      else if(centre + w / 2 > vw - PAD) dx = (vw - PAD) - (centre + w / 2);
      if(dx) el.style.setProperty('--tip-dx', Math.round(dx) + 'px');

      // would opening upward put the bubble under the sticky bar (or off-screen)?
      var bar = document.querySelector('.pbar');
      var barBottom = bar ? bar.getBoundingClientRect().bottom : 0;
      if(box.top - h - PAD < barBottom + 4) el.classList.add('tip-down');
    }

    /* Measured on demand rather than up front: a tooltip's size depends on the
     * text it holds and on the current window width, and both change. */
    ['pointerenter', 'focus'].forEach(function(evt){
      document.addEventListener(evt, function(e){
        var el = e.target && e.target.closest && e.target.closest('.term[data-tip]');
        if(el) fit(el);
      }, true);
    });
  }

  /* the two keyframes shared by every reveal in the choreography below */
  function revealFrames(){
    return [
      { opacity: 0, transform: 'translateY(32px) scale(.96)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' }
    ];
  }

  /* fires cb(alreadyVisible) exactly once — synchronously-checked "already on
   * screen" (load, or the result of an in-page anchor jump) passes true so
   * callers can skip the animation and show final state instantly; a later
   * IntersectionObserver hit (genuine scroll-into-view) passes false so
   * callers play the full choreography. This is also the fallback trigger
   * for browsers without the Scroll-driven Animations API (ViewTimeline). */
  var pendingReveals = []; // not-yet-visible {el, cb, isVisible} entries, re-checked on hashchange
  function watchOnce(el, cb){
    function isVisible(){
      var r = el.getBoundingClientRect();
      return r.top < innerHeight && r.bottom > 0;
    }
    if(isVisible()){ requestAnimationFrame(function(){ cb(true); }); return; }
    var entryRec = { el: el, cb: cb, isVisible: isVisible };
    pendingReveals.push(entryRec);
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          requestAnimationFrame(function(){ cb(false); });
          io.unobserve(entry.target);
          pendingReveals = pendingReveals.filter(function(p){ return p !== entryRec; });
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
  }
  /* nav.toc uses plain <a href="#id"> links — a click fires `hashchange` once
   * the browser lands on the target. Whatever that jump brought on screen
   * must be revealed instantly (never mid fade/stagger), so every element
   * still pending gets re-checked and force-shown if the jump put it in view. */
  window.addEventListener('hashchange', function(){
    requestAnimationFrame(function(){
      pendingReveals.slice().forEach(function(entryRec){
        if(entryRec.isVisible()){
          pendingReveals = pendingReveals.filter(function(p){ return p !== entryRec; });
          entryRec.cb(true);
        }
      });
    });
  });

  /* snaps an element to its fully-revealed state with ZERO transition time —
   * used whenever content is already on screen the instant we decide its
   * fate, so it is never caught mid-fade the moment it becomes readable */
  function instantShow(el){
    el.style.transition = 'none';
    el.style.opacity = '1';
    el.style.transform = 'none';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.style.transition = ''; }); });
  }

  /* Splits a heading's OWN text into <span class="fx-word"> word tokens for a
   * staggered reveal, while leaving every existing child ELEMENT untouched
   * (h2's .ic/.num/.sec-count badges, .hn, the hero's gradient-highlight
   * <span> — none of those are markup this file owns, so none of them are
   * rewrapped or recursed into). Thai script has no spaces between words, so
   * a Thai run becomes one token; that is the honest vanilla-JS reading of
   * "word by word" without pulling in a segmentation library.
   * All the split words for one text run share ONE wrapper <span> — h2 is
   * `display:flex;gap:12px`, and without a single wrapper every word/space
   * would become its own flex item and inherit that 12px gap, blowing the
   * spacing apart. Text stays 100% selectable/copyable either way. */
  function splitHeadingWords(el){
    if(el.dataset.fxSplit) return [];
    el.dataset.fxSplit = '1';
    var words = [];
    [].slice.call(el.childNodes).forEach(function(node){
      if(node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      var wrapper = document.createElement('span');
      wrapper.className = 'fx-words';
      node.textContent.split(/(\s+)/).forEach(function(part){
        if(part === '') return;
        if(/^\s+$/.test(part)){ wrapper.appendChild(document.createTextNode(part)); return; }
        var w = document.createElement('span');
        w.className = 'fx-word';
        w.style.display = 'inline-block';
        w.textContent = part;
        wrapper.appendChild(w);
        words.push(w);
      });
      el.replaceChild(wrapper, node);
    });
    return words;
  }

  function revealHeadingWords(h){
    if(reduced) return; // fully disabled under prefers-reduced-motion — text stays put, never hidden
    var words = splitHeadingWords(h);
    if(!words.length) return;
    // hide via the SAME `.rv` class the block-level reveal uses (never an inline
    // style) so these words are covered by style.css's own `rvFailsafe` CSS
    // animation the moment they're marked, exactly like every other reveal target
    words.forEach(function(w){ w.classList.add('rv'); });

    if(supportsVT){
      words.forEach(function(w, i){
        w.classList.add('in');
        w.animate(revealFrames(), {
          fill: 'both', easing: EASE_SETTLE,
          timeline: new window.ViewTimeline({ subject: h }),
          rangeStart: 'entry ' + Math.min(90, i*4) + '%',
          rangeEnd: 'entry ' + Math.min(100, 40 + i*4) + '%'
        });
      });
      return;
    }
    watchOnce(h, function(alreadyVisible){
      words.forEach(function(w, i){
        w.classList.add('in');
        if(alreadyVisible){ instantShow(w); }
        else { w.animate(revealFrames(), { duration: 520, easing: EASE_SETTLE, fill: 'both', delay: i*35 }); }
      });
    });
  }

  /* JS-level safety net, complementing style.css's `rvFailsafe` CSS animation.
   * Verified empirically (headless-browser test, not just reasoned about): a
   * plain `.rv`-hidden element WITH NO script animation ever attached to it is
   * correctly rescued by rvFailsafe alone (CSS animations outrank a normal
   * declaration, inline style included). BUT an element that DOES have an
   * active WAAPI animation (ViewTimeline or the timed fallback) sitting on it —
   * whether legitimately holding it off-screen or stuck there by a bug —
   * outranks rvFailsafe in the effect stack and blocks it from ever firing.
   * That gap is real and rvFailsafe alone cannot close it, so: once, well
   * after rvFailsafe's own 2.5s window, sweep every `.rv`/word element that is
   * ACTUALLY on screen right now but still sitting at low opacity, cancel
   * whatever animation is holding it there, and snap it visible. */
  function initRevealFailsafe(){
    setTimeout(function(){
      [].slice.call(document.querySelectorAll('.rv, .fx-word')).forEach(function(el){
        var r = el.getBoundingClientRect();
        var onScreen = r.top < innerHeight && r.bottom > 0;
        if(!onScreen) return; // not on screen — correctly still hidden, nothing to rescue
        var op = parseFloat(getComputedStyle(el).opacity);
        if(isNaN(op) || op >= 0.5) return;
        if(el.getAnimations){ el.getAnimations().forEach(function(a){ a.cancel(); }); }
        el.classList.add('in');
        instantShow(el);
      });
    }, 3500);
  }

  /* Per-element scroll choreography: combined translate+scale+opacity, eased
   * to settle, staggered per sibling. Scroll-LINKED (scrubs with the scroll
   * position) via ViewTimeline where supported; a one-shot IO+rAF-triggered
   * WAAPI play otherwise. Also keeps toggling the original `.rv`/`.in`
   * classes — style.css's `h2::after`/`section.in h2::after` underline-grow
   * effect (and the CSS-only fallback if script animation ever fails) both
   * key off `.in`, so that mechanism must keep firing regardless of the
   * fancier motion layered on top of it. */
  function initReveal(){
    var sel = 'section, .card, .story, .boss, .callout, .puz, .chklist, .tbl-wrap, ol.stages li, .guidebar a';
    var els = [].slice.call(document.querySelectorAll(sel));
    if(els.length){
      var siblingIndex = new Map();
      els.forEach(function(el){
        el.classList.add('rv');
        var i = siblingIndex.get(el.parentElement) || 0;
        siblingIndex.set(el.parentElement, i+1);
        var stagger = Math.min(i, 10);
        el.style.transitionDelay = reduced ? '0ms' : (stagger*60) + 'ms';

        if(reduced){ el.classList.add('in'); return; }

        if(supportsVT){
          el.animate(revealFrames(), {
            fill: 'both', easing: EASE_SETTLE,
            timeline: new window.ViewTimeline({ subject: el }),
            rangeStart: 'entry ' + (stagger*6) + '%',
            rangeEnd: 'entry ' + Math.min(100, 55 + stagger*6) + '%'
          });
        }
        watchOnce(el, function(alreadyVisible){
          el.classList.add('in');
          if(supportsVT) return; // the ViewTimeline already reflects true current progress, incl. instant for on-screen elements
          if(alreadyVisible){ instantShow(el); }
          else { el.animate(revealFrames(), { duration: 700, easing: EASE_SETTLE, fill: 'both', delay: stagger*60 }); }
        });
      });
    }

    [].slice.call(document.querySelectorAll('h2, .hero h1')).forEach(revealHeadingWords);
  }

  function initScrollSpy(){
    var links = [].slice.call(document.querySelectorAll('nav.toc a[href^="#"]'));
    if(!links.length) return function(){};
    var map = links.map(function(a){
      return { a: a, sec: document.getElementById(a.getAttribute('href').slice(1)) };
    }).filter(function(m){ return m.sec; });
    if(!map.length) return function(){};
    return function update(){
      var y = window.scrollY + 120; // offset for the sticky progress bar/header
      var current = map[0];
      map.forEach(function(m){ if(m.sec.offsetTop <= y) current = m; });
      map.forEach(function(m){ m.a.classList.toggle('active', m === current); });
    };
  }

  /* Hero depth: content moves at a different rate than the (fixed) backdrop,
   * and fades/blurs slightly as it leaves — transform/opacity/filter only,
   * so it costs nothing layout-wise; skipped entirely under reduced motion. */
  function initHeroParallax(){
    var hero = document.querySelector('header.hero');
    if(!hero || reduced) return function(){};
    var heroH = hero.offsetHeight || 1;
    return function update(scrollTop){
      var y = Math.min(scrollTop * 0.35, heroH * 0.6);
      var leave = Math.min(1, scrollTop / (heroH * 0.9));
      hero.style.transform = 'translate3d(0,' + (-y) + 'px,0)';
      hero.style.opacity = String(1 - leave*0.65);
      hero.style.filter = leave > 0.02 ? 'blur(' + (leave*6) + 'px)' : '';
    };
  }

  /* Sticky "current section" strip: pins directly under the real .pbar and
   * reuses the SAME .pbar/.inner/.sec-count classes so it automatically
   * shares whatever glass treatment .pbar has (today: soft gradient + a
   * 1px centre-fade hairline, no hard border) without duplicating that
   * look in JS. Only appears on stage pages (needs .pbar + at least one
   * <section><h2>). */
  function initSectionStrip(){
    var pbar = document.querySelector('.pbar');
    var sections = [].slice.call(document.querySelectorAll('section')).filter(function(s){ return s.querySelector('h2'); });
    if(!pbar || !sections.length) return function(){};

    var strip = document.createElement('div');
    strip.className = 'pbar';
    strip.id = 'fxSectionStrip';
    strip.innerHTML = '<div class="inner"><b></b><span class="sec-count"></span></div>';
    pbar.parentNode.insertBefore(strip, pbar.nextSibling);
    var titleEl = strip.querySelector('b');
    var countEl = strip.querySelector('.sec-count');

    function position(){ strip.style.top = pbar.offsetHeight + 'px'; }
    position();
    window.addEventListener('resize', position, { passive: true });

    /* only the fx-word wrappers + any leftover raw text nodes carry real
     * heading words — .ic/.num/.sec-count/.hn are skipped so the strip
     * doesn't repeat the icon glyph or an unrelated done/total badge */
    function extractTitle(h2){
      var out = '';
      [].slice.call(h2.childNodes).forEach(function(node){
        if(node.nodeType === Node.TEXT_NODE){ out += node.textContent; }
        else if(node.classList && node.classList.contains('fx-words')){ out += node.textContent; }
      });
      return out.trim().replace(/\s+/g, ' ');
    }

    var lastIndex = -1;
    return function update(){
      var y = window.scrollY + pbar.offsetHeight + strip.offsetHeight + 20;
      var idx = 0;
      sections.forEach(function(s, i){ if(s.offsetTop <= y) idx = i; });
      if(idx === lastIndex) return;
      lastIndex = idx;
      var h2 = sections[idx].querySelector('h2');
      var title = h2 ? extractTitle(h2) : '';
      var countText = (idx+1) + '/' + sections.length;
      if(reduced){
        titleEl.textContent = title;
        countEl.textContent = countText;
        return;
      }
      strip.animate([{opacity:1},{opacity:0}], {duration:140, easing:'ease'}).onfinish = function(){
        titleEl.textContent = title;
        countEl.textContent = countText;
        strip.animate([{opacity:0},{opacity:1}], {duration:180, easing:'ease'});
      };
    };
  }

  function initSpotlight(){
    if(reduced) return;
    var raf = null, mx = 0, my = 0;
    function apply(){
      document.documentElement.style.setProperty('--mx', mx + 'px');
      document.documentElement.style.setProperty('--my', my + 'px');
      raf = null;
    }
    window.addEventListener('pointermove', function(e){
      mx = e.clientX; my = e.clientY;
      if(!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* single rAF-throttled scroll handler drives the scroll bar, back-to-top
   * visibility, scroll-spy, hero parallax and the section strip together
   * (one listener, no per-feature scroll listeners racing each other) */
  function initScrollHandler(scrollBarEl, fabTop, updateSpy, updateParallax, updateStrip){
    var ticking = false;
    function update(){
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop || 0;
      var height = doc.scrollHeight - doc.clientHeight;
      scrollBarEl.style.width = (height > 0 ? Math.min(scrollTop/height*100, 100) : 0) + '%';
      fabTop.classList.toggle('show', scrollTop > 600);
      updateSpy();
      updateParallax(scrollTop);
      updateStrip();
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if(!ticking){ requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  function initKeyboardNav(paletteApi, toggleTheme, toast){
    document.addEventListener('keydown', function(e){
      if(e.ctrlKey || e.metaKey || e.altKey) return; // never hijack browser/system shortcuts
      var el = document.activeElement;
      var tag = el ? el.tagName : '';
      var typing = tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable);
      if(typing || paletteApi.isOpen()) return;

      if(e.key === 'ArrowLeft' || e.key === 'ArrowRight'){
        var nav = document.querySelector('.navbtns');
        if(!nav) return;
        var links = nav.querySelectorAll('a');
        if(!links.length) return;
        var href = (e.key === 'ArrowLeft' ? links[0] : links[links.length-1]).getAttribute('href');
        if(href) location.href = href;
      } else if(e.key === 't'){
        toggleTheme();
      } else if(e.key === '?'){
        toast('⌨️ ←/→ ก่อนหน้า–ถัดไป · t สลับธีม · Ctrl+K หรือ / ค้นหา · Esc ปิดหน้าต่าง', 4200);
      }
    });
  }

  /* index.html only: per-stage completion (ring/done-all) + overall summary card */
  function initIndexProgress(){
    var lis = [].slice.call(document.querySelectorAll('ol.stages li'));
    if(!lis.length) return; // not on index.html, nothing to do

    var stats = {};
    try { stats = JSON.parse(lsGet('ffx_stats') || '{}'); } catch(e){ stats = {}; }

    var totalDone = 0, totalKnown = 0;
    lis.forEach(function(li){
      var numEl = li.querySelector('.st-n');
      if(!numEl) return;
      var n = parseInt(numEl.textContent, 10);
      if(!n) return;
      var key = 's' + (n < 10 ? '0' : '') + n;
      var s = stats[key];
      var done = 0, total = 0;

      /* `data-total` is stamped into index.html from the stage file's real
       * checkbox count, so a stage the reader has NEVER opened still counts
       * toward the denominator. Without it the overall bar divided by "stages
       * visited so far" and read as near-complete on a fresh profile. */
      var declared = parseInt(li.dataset.total || '0', 10) || 0;

      if(s && typeof s.t === 'number' && s.t > 0){
        /* the stage page itself is authoritative once visited — it knows its
         * own live checkbox count, which may differ from the stamped value if
         * the guide gained checkboxes since index.html was last regenerated */
        done = s.d || 0; total = s.t;
      } else {
        total = declared;
        /* a stage ticked before ffx_stats existed for it still has its raw
         * per-key blob, so its done-count is recoverable */
        var raw = null;
        try { raw = JSON.parse(lsGet('ffx_' + key) || 'null'); } catch(e){ raw = null; }
        if(raw){ done = Object.keys(raw).filter(function(k){ return raw[k]; }).length; }
      }
      if(total > 0 && done > total) done = total;   // stale blob, fewer boxes now
      totalDone += done;
      totalKnown += total;

      var oldRing = li.querySelector('.ring');
      if(oldRing) oldRing.remove();
      var oldTag = li.querySelector('.st-prog');
      if(oldTag) oldTag.remove();
      li.classList.remove('done-all', 'some-done');

      if(total > 0){
        var pct = Math.round(done/total*100);
        /* The ring is drawn at EVERY percentage including 100. It used to be
         * skipped at 100% (only a border tint marked a finished stage) and it
         * used to sit behind the opaque .st-n badge at exactly the badge's
         * size, so it was invisible at every percentage. It is now a halo
         * ring AROUND the badge — see style.css section 50. */
        var ring = document.createElement('span');
        ring.className = 'ring';
        ring.style.background = 'conic-gradient(var(--green) ' + pct + '%, transparent ' + pct + '%)';
        li.insertBefore(ring, li.firstChild);

        /* Colour alone does not tell the reader HOW MUCH is left, so every
         * card carries its own count. */
        var tag = document.createElement('span');
        tag.className = 'st-prog';
        tag.textContent = done + '/' + total;
        li.appendChild(tag);

        if(done >= total) li.classList.add('done-all');
        else if(done > 0) li.classList.add('some-done');
      }
    });

    // totalKnown === 0 means no stage has ever recorded a checklist size yet
    // (a fresh profile, or one that only ever visited ref/story pages) — a
    // "0/0" widget is a dead control, so show nothing at all instead of an
    // empty shell. The card appears on the very next visit once any one
    // stage's checklist has actually been opened at least once.
    if(totalKnown > 0) renderIndexSummary(totalDone, totalKnown);
  }

  function renderIndexSummary(totalDone, totalKnown){
    var wrap = document.querySelector('.wrap');
    if(!wrap) return;
    var pct = Math.round(totalDone/totalKnown*100);
    var card = document.createElement('div');
    card.className = 'card';
    card.innerHTML =
      '<h2><span class="ic">🧭</span> ความคืบหน้าการเดินทาง' +
      '<span class="sec-count" data-count><b>' + totalDone + '</b>/' + totalKnown + '</span></h2>' +
      '<div class="pbar-track"><div class="pbar-fill" style="width:0%"></div></div>';
    wrap.insertBefore(card, wrap.firstChild);
    if(reduced){
      card.querySelector('.pbar-fill').style.width = pct + '%';
      return;
    }
    var fill = card.querySelector('.pbar-fill');
    // two rAFs so the browser commits width:0% before the real value is set,
    // otherwise the CSS width-transition on .pbar-fill never has a "from" state to animate from
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ fill.style.width = pct + '%'; }); });
  }

  /* Any "done / total" or "done/total" counter animates up from 0 on first
   * reveal instead of snapping to its final value (ease-out, ~600ms). Reads
   * the value app.js already rendered (app.js runs before this file), then
   * replays it as a count-up. */
  function animateCountUp(renderFn, finalValue, duration){
    if(reduced || finalValue <= 0){ renderFn(finalValue); return; }
    duration = duration || 600;
    var start = performance.now();
    function tick(now){
      var t = Math.min(1, (now-start)/duration);
      var eased = 1 - Math.pow(1-t, 3); // ease-out cubic
      renderFn(Math.round(finalValue * eased));
      if(t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ================= checklist priority tagging ================= */

  /* Rule table — edit here to tune classification. Evaluated top-to-bottom,
   * first match wins (a lost Primer is pri-miss even though "any Primer" is
   * also a pri-key signal). Every regex reads the row's OWN `.lbl` text only,
   * plus (pri-miss's Primer case) the page's own missable badge/callout, and
   * (pri-side's fallback) the enclosing <section>'s <h2> text. */
  var PRI_MISS_RE = /หายถาวร|พลาดถาวร|พลาดแล้วหาย|⚠/;
  var PRI_KEY_RE = /Crest|Sigil|Aeon|Overdrive|Celestial|อาวุธเทพ|Jecht Sphere|Destruction Sphere|Rod of Wisdom|Primer|เข้าทีม/i;
  var PRI_KEY_SPHERE_RE = /Lv\.?\s*[34]\s*Key Sphere/i; // only Lv.3/Lv.4 — Lv.1/Lv.2 stay unclassified
  var PRI_SIDE_RE = /เควส|มินิเกม|แข่ง|ดวล|Belgemine|Blitzball|Remiem|Cactuar|Butterfly|หลบฟ้าผ่า/i;
  var PRI_SIDE_SECTION_RE = /เควส|เสริม/;

  /* extracts Al Bhed Primer volume tokens after the word "Primer" — handles
   * both a single volume ("Primer Vol. II") and a dash/slash/comma-separated
   * run ("Primer XIX – XX – XXI") the way the missable badges write them */
  function primerVolumesIn(text){
    var vols = [];
    var re = /Primer\s+(?:Vol\.?\s*)?([IVXL]+(?:\s*[–\-,\/]\s*[IVXL]+)*)/gi;
    var m;
    while((m = re.exec(text))){
      m[1].split(/[–\-,\/]/).forEach(function(tok){
        var t = tok.trim().toUpperCase();
        if(t) vols.push(t);
      });
    }
    return vols;
  }

  function classifyChecklistRows(){
    var rows = [].slice.call(document.querySelectorAll('.chk'));
    var counts = { miss: 0, key: 0, side: 0 };

    // a Primer volume only counts as "permanently lost" if THIS page's own
    // missable badge/callout says so explicitly — never inferred elsewhere
    var lostPrimerVols = [];
    [].slice.call(document.querySelectorAll('.badge.b-miss, .callout.warn')).forEach(function(el){
      var t = el.textContent || '';
      if(PRI_MISS_RE.test(t)) lostPrimerVols = lostPrimerVols.concat(primerVolumesIn(t));
    });

    rows.forEach(function(row){
      if(row.classList.contains('pri-miss')){ counts.miss++; return; }
      if(row.classList.contains('pri-key')){ counts.key++; return; }
      if(row.classList.contains('pri-side')){ counts.side++; return; }
      // no pre-existing class — an author can pin a row by hand; anything
      // already tagged in the HTML is left completely alone, only counted

      var lblEl = row.querySelector('.lbl');
      var label = lblEl ? (lblEl.textContent || '') : '';
      var section = row.closest('section');
      var h2El = section ? section.querySelector('h2') : null;
      var sectionHeading = h2El ? (h2El.textContent || '') : '';

      var isMiss = PRI_MISS_RE.test(label) ||
        (/Primer/i.test(label) && primerVolumesIn(label).some(function(v){ return lostPrimerVols.indexOf(v) !== -1; }));
      var isKey = !isMiss && (PRI_KEY_RE.test(label) || PRI_KEY_SPHERE_RE.test(label));
      var isSide = !isMiss && !isKey && (PRI_SIDE_RE.test(label) || PRI_SIDE_SECTION_RE.test(sectionHeading));

      if(isMiss){ row.classList.add('pri-miss'); counts.miss++; }
      else if(isKey){ row.classList.add('pri-key'); counts.key++; }
      else if(isSide){ row.classList.add('pri-side'); counts.side++; }
    });

    window.FFX = window.FFX || {};
    window.FFX.priCounts = counts;
  }

  function initCounters(){
    var targets = [].slice.call(document.querySelectorAll('[data-progress="all"], [data-count]'));
    if(!targets.length) return;

    function play(el){
      if(el.dataset.fxCounted) return;
      el.dataset.fxCounted = '1';
      if(el.hasAttribute('data-progress')){
        var m = /^(\d+)\s*\/\s*(\d+)$/.exec((el.textContent || '').trim());
        if(!m) return;
        var total = m[2];
        animateCountUp(function(v){ el.textContent = v + ' / ' + total; }, parseInt(m[1], 10));
      } else {
        var m2 = /^(\d+)\/(\d+)$/.exec((el.textContent || '').trim());
        if(!m2) return;
        var tot = m2[2];
        animateCountUp(function(v){ el.innerHTML = '<b>' + v + '</b>/' + tot; }, parseInt(m2[1], 10));
      }
    }

    targets.forEach(function(el){
      watchOnce(el, function(alreadyVisible){
        // already on screen at arrival (load, or the result of an anchor jump) —
        // app.js already rendered the correct final value there, so leave it:
        // a number still mid-count the instant the page becomes readable is
        // exactly the kind of competing "chrome" a narrative page must avoid
        if(alreadyVisible){ el.dataset.fxCounted = '1'; return; }
        play(el);
      });
    });
  }

  /* ================= boot ================= */

  function boot(){
    injectBg();
    var scrollBarEl = injectScrollBar();
    var toast = injectToast();
    var themeApi = injectThemeToggle();
    injectHomeButton();
    var fabTop = injectFabTop();
    var paletteApi = injectPalette(PAGES);
    injectFabSearch(paletteApi.open);

    initTermTooltips();
    initTooltipFit();
    wrapTables();
    initReveal();
    initRevealFailsafe();
    var updateSpy = initScrollSpy();
    var updateParallax = initHeroParallax();
    var updateStrip = initSectionStrip();
    initScrollHandler(scrollBarEl, fabTop, updateSpy, updateParallax, updateStrip);
    initSpotlight();
    initKeyboardNav(paletteApi, themeApi.toggle, toast);
    initIndexProgress();
    initCounters();
    // static rows: tag once on DOMContentLoaded, never re-tag afterwards
    document.addEventListener('DOMContentLoaded', classifyChecklistRows);

    document.dispatchEvent(new CustomEvent('ffx:theme', { detail: { theme: themeApi.theme() } }));

    window.FFX = {
      pages: PAGES,
      toast: toast,
      theme: themeApi.theme,
      page: document.body.dataset.page || 'index',
      reduced: reduced
    };

    document.dispatchEvent(new CustomEvent('ffx:ready'));
  }

  if(document.body){ boot(); } else { document.addEventListener('DOMContentLoaded', boot); }
})();
