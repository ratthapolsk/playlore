/*
 * FFX Guide — GIMMICK layer.
 * Owns exactly two files: gimmicks.js + gimmicks.css. Never touches
 * style.css / app.js / fx.js / art.js / any .html file.
 *
 * Integration contract (built by other developers, may not exist yet):
 *   - window.FFX = { pages, toast(msg,ms), theme(), page, reduced }
 *   - window.ART = { ring(percent,size), ... } (inline-SVG ornament helper)
 *   - document events: ffx:ready, ffx:theme, ffx:check, ffx:complete
 * Every use of FFX/ART below is feature-detected and has a graceful
 * fallback, per the "never assume a dependency is loaded" instruction.
 *
 * The only global this file creates is window.FFXGimmicks (a marker/guard
 * object). Everything else lives inside this closure.
 */
(function(){
  'use strict';
  if (window.FFXGimmicks) return; // idempotency guard (defensive; scripts load once anyway)
  window.FFXGimmicks = { loaded: true };

  /* ============================ 1. small utils =========================== */

  function reducedMotion(){
    if (window.FFX && typeof FFX.reduced !== 'undefined') return !!FFX.reduced;
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function isDark(){
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function debounce(fn, wait){
    var t;
    return function(){
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function(){ fn.apply(ctx, args); }, wait);
    };
  }

  // Small self-contained fallback toast — only used when FFX.toast is unavailable,
  // so a first-run visit (before fx.js is confirmed working) still surfaces messages.
  var fallbackToastEl = null;
  function fallbackToast(msg){
    if (!fallbackToastEl){
      fallbackToastEl = document.createElement('div');
      fallbackToastEl.className = 'gm-toast';
      document.body.appendChild(fallbackToastEl);
    }
    fallbackToastEl.textContent = msg;
    fallbackToastEl.classList.add('gm-show');
    clearTimeout(fallbackToastEl._hideTimer);
    fallbackToastEl._hideTimer = setTimeout(function(){
      fallbackToastEl.classList.remove('gm-show');
    }, 2800);
  }
  function toast(msg){
    if (window.FFX && typeof FFX.toast === 'function'){
      try { FFX.toast(msg); return; } catch(e){ /* fall through to local toast */ }
    }
    fallbackToast(msg);
  }

  function copyText(text){
    function legacy(){
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      try { document.execCommand('copy'); } catch(e){ /* clipboard unavailable, silently ignore */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).catch(legacy);
    } else {
      legacy();
    }
  }

  /* =================== 2. Web Audio synthesized SFX (opt-in) ============== */
  // Persisted default OFF — localStorage['ffx_sfx'] === '1' enables sound.

  var audioCtx = null;
  function sfxEnabled(){
    try { return localStorage.getItem('ffx_sfx') === '1'; } catch(e){ return false; }
  }
  function getAudioCtx(){
    if (!audioCtx){
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { audioCtx = new AC(); } catch(e){ return null; }
    }
    if (audioCtx.state === 'suspended'){ audioCtx.resume(); }
    return audioCtx;
  }
  function tone(freq, startOffset, dur, type, peakGain){
    var ctx = getAudioCtx();
    if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    var t0 = ctx.currentTime + startOffset;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peakGain || 0.14, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function sfxChime(){ if (sfxEnabled()){ tone(880,0,.18,'sine',.12); tone(1320,.05,.2,'sine',.08); } }
  function sfxFanfare(){
    if (!sfxEnabled()) return;
    [523.25,659.25,783.99,1046.5].forEach(function(f,i){ tone(f, i*0.11, .35, 'triangle', .1); });
  }
  function sfxLowHit(){ if (sfxEnabled()){ tone(90,0,.26,'sawtooth',.16); tone(60,.02,.3,'sine',.12); } }
  function sfxSwoosh(){ if (sfxEnabled()){ tone(220,0,.1,'square',.07); tone(440,.05,.13,'square',.05); } }

  /* ================== 3. per-stage accent hue (gimmick #7) ================ */
  // Constrained to the site's own violet <-> cyan brand hues so this stays a
  // single accent family, not a per-stage rainbow: --purple is ~262deg,
  // --cyan is ~189deg in both themes. Stage 01 leans violet, stage 30 leans
  // cyan; non-numbered pages (primer/ref*) fall back to a stable hash within
  // the same band. This value only drives *our* .gm-* effects — the site's
  // own --purple/--cyan/--gold tokens are never touched.
  var HUE_VIOLET = 262, HUE_CYAN = 188;
  var gmHue = HUE_VIOLET;

  function computeStageHue(pageId){
    if (!pageId) return HUE_VIOLET;
    var m = /^s(\d{1,2})$/.exec(pageId);
    if (m){
      var n = parseInt(m[1], 10);
      var t = Math.max(0, Math.min(1, (n - 1) / 29)); // 30 stages, s01..s30
      return Math.round(HUE_VIOLET - t * (HUE_VIOLET - HUE_CYAN));
    }
    var hash = 0;
    for (var i = 0; i < pageId.length; i++){ hash = (hash * 31 + pageId.charCodeAt(i)) >>> 0; }
    return HUE_CYAN + (hash % (HUE_VIOLET - HUE_CYAN));
  }

  function applyStageHue(){
    var pageId = document.body ? document.body.dataset.page : null;
    gmHue = computeStageHue(pageId);
    document.documentElement.style.setProperty('--gm-hue', String(gmHue));
  }

  /* ==================== 4. pyreflies canvas (gimmick #1) =================== */

  var canvas = null, ctx = null, W = 0, H = 0, DPR = 1;
  var ambient = [];
  var burstParticles = [];
  var rafId = null, lastTs = 0;

  function ambientCount(){
    // Density is a taste choice (calm, ambient), not a perf cap — perf is not
    // a constraint here, but "premium" still means restrained, not busy.
    return Math.max(16, Math.min(46, Math.round((W * H) / 32000)));
  }

  function makeAmbient(){
    var x = Math.random() * W;
    return {
      baseX: x, x: x, y: Math.random() * H,
      phase: Math.random() * Math.PI * 2,
      speed: 0.12 + Math.random() * 0.22,
      driftR: 16 + Math.random() * 30,
      rise: 3 + Math.random() * 5,
      r: 1.3 + Math.random() * 2.1,
      alpha: (isDark() ? 0.22 : 0.14) + Math.random() * (isDark() ? 0.2 : 0.12),
      hueOffset: (Math.random() - 0.5) * 18
    };
  }

  function seedAmbient(){
    ambient.length = 0;
    var n = ambientCount();
    for (var i = 0; i < n; i++){ ambient.push(makeAmbient()); }
  }

  function resizeCanvas(){
    if (!canvas) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedAmbient();
  }

  function setupPyreflies(){
    if (reducedMotion()) return; // particles disabled entirely under reduced motion
    canvas = document.createElement('canvas');
    canvas.className = 'gm-pyre';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 200));
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) stopLoop(); else startLoop();
    });
    startLoop();
  }

  function drawGlow(x, y, r, alpha, hueOffset){
    if (alpha <= 0 || r <= 0) return;
    var h = (gmHue + hueOffset + 360) % 360;
    var dark = isDark();
    var s = dark ? 46 : 34;
    var lCore = dark ? 80 : 30;
    var lEdge = dark ? 60 : 46;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'hsla(' + h + ',' + s + '%,' + lCore + '%,' + alpha + ')');
    g.addColorStop(1, 'hsla(' + h + ',' + s + '%,' + lEdge + '%,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateAmbient(dt){
    for (var i = 0; i < ambient.length; i++){
      var p = ambient[i];
      p.phase += dt * p.speed;
      p.x = p.baseX + Math.sin(p.phase) * p.driftR;
      p.y -= dt * p.rise;
      if (p.y < -24){ p.y = H + 24; p.baseX = Math.random() * W; p.phase = Math.random() * Math.PI * 2; }
      drawGlow(p.x, p.y, p.r, p.alpha, p.hueOffset);
    }
  }

  function updateBursts(dt){
    for (var i = burstParticles.length - 1; i >= 0; i--){
      var p = burstParticles[i];
      p.life -= dt;
      if (p.life <= 0){ burstParticles.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 26 * dt;
      p.vx *= (1 - 1.5 * dt);
      var a = Math.max(0, p.life / p.maxLife);
      drawGlow(p.x, p.y, p.r * a, p.alpha * a, p.hueOffset);
    }
  }

  function loop(ts){
    if (document.hidden){ rafId = null; return; }
    var dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000);
    lastTs = ts;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = isDark() ? 'lighter' : 'multiply';
    updateAmbient(dt);
    updateBursts(dt);
    rafId = requestAnimationFrame(loop);
  }

  function startLoop(){
    if (!canvas || reducedMotion()) return;
    if (rafId == null){ lastTs = 0; rafId = requestAnimationFrame(loop); }
  }
  function stopLoop(){
    if (rafId != null){ cancelAnimationFrame(rafId); rafId = null; }
  }

  function spawnBurstParticle(x, y){
    var ang = Math.random() * Math.PI * 2;
    var speed = 40 + Math.random() * 100;
    var life = 0.6 + Math.random() * 0.55;
    return {
      x: x, y: y,
      vx: Math.cos(ang) * speed * (0.3 + Math.random() * 0.7),
      vy: Math.sin(ang) * speed * (0.3 + Math.random() * 0.7) - 34,
      life: life, maxLife: life,
      r: 1.6 + Math.random() * 2.3,
      alpha: (isDark() ? 0.55 : 0.4) + Math.random() * 0.3,
      hueOffset: (Math.random() - 0.5) * 24
    };
  }

  function burst(x, y, count){
    if (!canvas || reducedMotion()) return;
    count = Math.min(30, count || 18);
    if (burstParticles.length > 160){ burstParticles.splice(0, burstParticles.length - 160); }
    for (var i = 0; i < count; i++){ burstParticles.push(spawnBurstParticle(x, y)); }
    startLoop();
  }

  function burstShower(big){
    if (!canvas || reducedMotion()) return;
    var waves = big ? 8 : 5;
    for (var i = 0; i < waves; i++){
      (function(i){
        setTimeout(function(){
          burst(Math.random() * W, Math.random() * H * 0.45, big ? 24 : 16);
        }, i * 130);
      })(i);
    }
  }

  /* ==================== 5. Al Bhed cipher (gimmick #4) ===================== */
  // Standard FFX Al Bhed substitution alphabet, ENGLISH -> AL BHED direction
  // (this is how every published "Al Bhed alphabet" table is conventionally
  // listed: English letter -> its Al Bhed glyph). The reverse map below is
  // therefore the AL BHED -> ENGLISH direction — both are labelled explicitly
  // in the panel UI so the direction is never ambiguous to the reader.
  var EN_TO_AB = {
    A:'Y',B:'P',C:'L',D:'T',E:'A',F:'V',G:'K',H:'R',I:'E',J:'Z',K:'G',L:'M',M:'S',
    N:'H',O:'U',P:'B',Q:'X',R:'N',S:'C',T:'D',U:'I',V:'J',W:'F',X:'Q',Y:'O',Z:'W'
  };
  var AB_TO_EN = {};
  Object.keys(EN_TO_AB).forEach(function(k){ AB_TO_EN[EN_TO_AB[k]] = k; });

  function cipher(text, map){
    return text.replace(/[a-zA-Z]/g, function(ch){
      var isLower = ch === ch.toLowerCase();
      var mapped = map[ch.toUpperCase()] || ch.toUpperCase();
      return isLower ? mapped.toLowerCase() : mapped;
    });
  }
  function toAlBhed(text){ return cipher(text, EN_TO_AB); }
  function toEnglish(text){ return cipher(text, AB_TO_EN); }

  function initAlbhedHover(){
    var els = document.querySelectorAll('.albhed');
    els.forEach(function(el){
      if (el.dataset.gmAbInit) return;
      el.dataset.gmAbInit = '1';
      var original = el.textContent;
      var timer = null;
      function reset(){
        if (timer){ clearTimeout(timer); timer = null; }
        el.textContent = original;
        el.classList.remove('gm-decoding');
      }
      function play(){
        if (reducedMotion()) return; // leave text as-is, skip the flourish entirely
        if (timer) clearTimeout(timer);
        var chars = original.split('');
        var scrambled = toAlBhed(original).split('');
        el.classList.add('gm-decoding');
        el.textContent = scrambled.join('');
        var i = 0;
        var stepDelay = Math.max(26, Math.min(65, 550 / Math.max(1, chars.length)));
        function step(){
          if (i >= chars.length){ el.textContent = original; el.classList.remove('gm-decoding'); timer = null; return; }
          el.textContent = chars.slice(0, i + 1).join('') + scrambled.slice(i + 1).join('');
          i++;
          timer = setTimeout(step, stepDelay);
        }
        timer = setTimeout(step, 240);
      }
      el.addEventListener('mouseenter', play);
      el.addEventListener('focus', play);
      el.addEventListener('mouseleave', reset);
      el.addEventListener('blur', reset);
    });
  }

  /* ============ 6. floating panel plumbing (shared by both FABs) ========== */

  var openPanels = []; // [{panel, fab}]

  function openPanel(panel, fab){
    panel.classList.add('gm-open');
    if (fab) fab.classList.add('gm-fab-active');
    if (!openPanels.some(function(p){ return p.panel === panel; })){
      openPanels.push({ panel: panel, fab: fab });
    }
  }
  function closePanel(panel){
    panel.classList.remove('gm-open');
    openPanels = openPanels.filter(function(p){
      if (p.panel === panel){ if (p.fab) p.fab.classList.remove('gm-fab-active'); return false; }
      return true;
    });
  }
  function togglePanel(panel, fab){
    if (panel.classList.contains('gm-open')) closePanel(panel); else openPanel(panel, fab);
  }
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && openPanels.length){
      openPanels.slice().forEach(function(p){ closePanel(p.panel); });
    }
  });
  document.addEventListener('click', function(e){
    openPanels.slice().forEach(function(p){
      var inside = p.panel.contains(e.target) || (p.fab && p.fab.contains(e.target));
      if (!inside) closePanel(p.panel);
    });
  });

  /* ==================== 7. Al Bhed translator FAB + panel ================== */

  function buildAlbhedWidget(){
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'gm-fab gm-albhed-fab';
    fab.setAttribute('aria-label', 'เปิดตัวแปลภาษา Al Bhed');
    fab.textContent = 'AB';
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.className = 'gm-panel gm-albhed-panel';
    panel.innerHTML =
      '<div class="gm-panel-head">' +
        '<span class="gm-panel-title">ตัวแปลภาษา Al Bhed</span>' +
        '<button type="button" class="gm-panel-close" aria-label="ปิด">✕</button>' +
      '</div>' +
      '<div class="gm-ab-dirs">' +
        '<button type="button" class="gm-ab-dir gm-ab-dir-active" data-dir="toab">อังกฤษ → Al Bhed</button>' +
        '<button type="button" class="gm-ab-dir" data-dir="toen">Al Bhed → อังกฤษ</button>' +
      '</div>' +
      '<textarea class="gm-ab-input" rows="3" placeholder="พิมพ์ข้อความที่นี่ (a-z)…"></textarea>' +
      '<div class="gm-ab-out-label">ผลลัพธ์</div>' +
      '<textarea class="gm-ab-output" rows="3" readonly></textarea>' +
      '<button type="button" class="gm-ab-copy">คัดลอกผลลัพธ์</button>' +
      '<p class="gm-ab-hint">ใช้อักษรละติน A–Z เท่านั้น อักขระอื่น (เช่น ช่องว่าง/เว้นวรรค) จะคงเดิม — เลือกทิศทางการแปลด้านบนได้อิสระ</p>';
    document.body.appendChild(panel);

    var dirBtns = panel.querySelectorAll('.gm-ab-dir');
    var input = panel.querySelector('.gm-ab-input');
    var output = panel.querySelector('.gm-ab-output');
    var dir = 'toab';
    function refresh(){ output.value = dir === 'toab' ? toAlBhed(input.value) : toEnglish(input.value); }
    dirBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        dirBtns.forEach(function(b){ b.classList.remove('gm-ab-dir-active'); });
        btn.classList.add('gm-ab-dir-active');
        dir = btn.dataset.dir;
        refresh();
      });
    });
    input.addEventListener('input', refresh);
    panel.querySelector('.gm-panel-close').addEventListener('click', function(){ closePanel(panel); });
    panel.querySelector('.gm-ab-copy').addEventListener('click', function(){
      if (!output.value){ toast('ยังไม่มีผลลัพธ์ให้คัดลอก'); return; }
      copyText(output.value);
      toast('คัดลอกผลลัพธ์แล้ว');
    });

    fab.addEventListener('click', function(){ togglePanel(panel, fab); });
    return { fab: fab, panel: panel };
  }

  /* ======================= 8. Save Sphere FAB + panel ======================= */

  var STAGE_ORDER = [
    's01','s02','s03','s04','s05','s06','s07','s08','s09','s10',
    's11','s12','s13','s14','s15','s16','s17','s18','s19','s20',
    's21','s22','s23','s24','s25','s26','s27','s28','s29','s30'
  ];
  var STAGE_NAMES = {
    s01:"Zanarkand (บทเปิด)", s02:"Baaj Temple", s03:"Salvage Ship", s04:"Besaid",
    s05:"S.S. Liki", s06:"Kilika", s07:"S.S. Winno", s08:"Luca",
    s09:"Mi'ihen Highroad", s10:"Mushroom Rock", s11:"Djose Temple", s12:"Moonflow",
    s13:"Guadosalam", s14:"Thunder Plains", s15:"Macalania Woods", s16:"Macalania Temple",
    s17:"Bikanel Desert", s18:"Al Bhed Home", s19:"Airship / Evrae", s20:"Bevelle Temple",
    s21:"Via Purifico", s22:"Calm Lands", s23:"Cavern of Stolen Fayth", s24:"Remiem Temple",
    s25:"Mt. Gagazet (ทางขึ้นเขา)", s26:"Mt. Gagazet Cave", s27:"Zanarkand Ruins",
    s28:"บุก Sin", s29:"ภายใน Sin", s30:"Dream's End"
  };

  function readStats(){
    try {
      var raw = localStorage.getItem('ffx_stats');
      if (!raw) return null;
      var obj = JSON.parse(raw);
      return (obj && typeof obj === 'object') ? obj : null;
    } catch(e){ return null; }
  }

  function collectExport(){
    var out = {};
    try {
      for (var i = 0; i < localStorage.length; i++){
        var k = localStorage.key(i);
        if (k && k.indexOf('ffx_') === 0){ out[k] = localStorage.getItem(k); }
      }
    } catch(e){ /* localStorage unavailable — export stays empty */ }
    return out;
  }
  function applyImport(obj){
    Object.keys(obj).forEach(function(k){
      if (k.indexOf('ffx_') === 0){
        try { localStorage.setItem(k, obj[k]); } catch(e){ /* quota or disabled storage, skip key */ }
      }
    });
  }

  // Renders a percent ring via the shared ART helper (window.ART.ring) when
  // available, falling back to our own flat .gm-bar otherwise. ART.ring's
  // exact return shape isn't known at build time (art.js ships separately),
  // so this defensively accepts either a DOM node or an HTML string.
  function renderRing(container, percent, size){
    container.innerHTML = '';
    if (window.ART && typeof ART.ring === 'function'){
      try {
        var out = ART.ring(percent, size);
        if (out && typeof out === 'object' && out.nodeType){ container.appendChild(out); return true; }
        if (typeof out === 'string' && out.trim()){ container.innerHTML = out; return true; }
      } catch(e){ /* fall through to bar fallback below */ }
    }
    return false;
  }

  function buildSaveSphereWidget(){
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'gm-fab gm-savesphere-fab';
    fab.setAttribute('aria-label', 'เปิด Save Sphere ดูความคืบหน้ารวมทุกด่าน');
    fab.innerHTML =
      '<span class="gm-savesphere-icon"><svg viewBox="0 0 48 48" width="24" height="24" aria-hidden="true">' +
        '<defs><radialGradient id="gmSaveGrad" cx="35%" cy="30%" r="75%">' +
          '<stop offset="0%" stop-color="hsl(var(--gm-hue,262) 25% 96%)"/>' +
          '<stop offset="60%" stop-color="hsl(var(--gm-hue,262) 38% 68%)"/>' +
          '<stop offset="100%" stop-color="hsl(var(--gm-hue,262) 30% 38%)"/>' +
        '</radialGradient></defs>' +
        '<circle cx="24" cy="24" r="17" fill="url(#gmSaveGrad)"/>' +
        '<circle cx="24" cy="24" r="19.5" fill="none" stroke="hsl(var(--gm-hue,262) 30% 55% / .5)" stroke-width="1"/>' +
      '</svg></span>';
    document.body.appendChild(fab);

    var panel = document.createElement('div');
    panel.className = 'gm-panel gm-savesphere-panel';
    panel.innerHTML =
      '<div class="gm-panel-head">' +
        '<span class="gm-panel-title">Save Sphere — ความคืบหน้าทั้งหมด</span>' +
        '<button type="button" class="gm-panel-close" aria-label="ปิด">✕</button>' +
      '</div>' +
      '<div class="gm-ss-overall"><span class="gm-ss-ring"></span>รวมทั้งเกม <b class="gm-ss-pct">0%</b>' +
        '<div class="gm-bar gm-ss-overall-bar"><div class="gm-bar-fill gm-ss-overall-fill" style="width:0%"></div></div>' +
      '</div>' +
      '<div class="gm-ss-body"></div>' +
      '<label class="gm-ss-sfx"><input type="checkbox" class="gm-sfx-check"> เปิดเสียงเอฟเฟกต์ (ปิดอยู่โดยค่าเริ่มต้น)</label>' +
      '<div class="gm-ss-io">' +
        '<div class="gm-ss-io-row">' +
          '<button type="button" class="gm-ss-export">ส่งออกความคืบหน้า</button>' +
          '<button type="button" class="gm-ss-import-btn">นำเข้า</button>' +
        '</div>' +
        '<textarea class="gm-ss-io-area" rows="3" placeholder="กดส่งออกเพื่อสร้างข้อความ JSON หรือวางข้อความที่เคยส่งออกไว้แล้วกดนำเข้า"></textarea>' +
      '</div>';
    document.body.appendChild(panel);

    panel.querySelector('.gm-panel-close').addEventListener('click', function(){ closePanel(panel); });

    var sfxBox = panel.querySelector('.gm-sfx-check');
    sfxBox.checked = sfxEnabled();
    sfxBox.addEventListener('change', function(){
      try { localStorage.setItem('ffx_sfx', sfxBox.checked ? '1' : '0'); } catch(e){ /* storage disabled, toggle still works this session */ }
      if (sfxBox.checked) sfxChime();
    });

    panel.querySelector('.gm-ss-export').addEventListener('click', function(){
      var area = panel.querySelector('.gm-ss-io-area');
      area.value = JSON.stringify(collectExport(), null, 2);
      area.focus(); area.select();
      toast('สร้างข้อความ JSON แล้ว — คัดลอกไปเก็บไว้ได้เลย');
    });
    panel.querySelector('.gm-ss-import-btn').addEventListener('click', function(){
      var area = panel.querySelector('.gm-ss-io-area');
      var text = area.value.trim();
      if (!text){ toast('วางข้อความ JSON ก่อนกดนำเข้า'); return; }
      try {
        var obj = JSON.parse(text);
        if (!obj || typeof obj !== 'object') throw new Error('not an object');
        applyImport(obj);
        toast('นำเข้าความคืบหน้าแล้ว — รีเฟรชหน้าเพื่อดูผลล่าสุด');
        renderSaveSphere(panel);
      } catch(e){
        toast('ข้อความ JSON ไม่ถูกต้อง นำเข้าไม่สำเร็จ');
      }
    });

    fab.addEventListener('click', function(){
      togglePanel(panel, fab);
      if (panel.classList.contains('gm-open')) renderSaveSphere(panel);
    });
    return { fab: fab, panel: panel };
  }

  function renderSaveSphere(panel){
    var stats = readStats();
    var body = panel.querySelector('.gm-ss-body');
    var overallRing = panel.querySelector('.gm-ss-ring');
    var overallLabel = panel.querySelector('.gm-ss-pct');
    var overallFill = panel.querySelector('.gm-ss-overall-fill');

    if (!stats){
      body.innerHTML = '<p class="gm-ss-empty">ยังไม่พบข้อมูลความคืบหน้ารวม — เข้าไปติ๊กเช็กลิสต์ในแต่ละด่านก่อน แล้วกลับมาดูที่นี่อีกครั้ง</p>';
      overallLabel.textContent = '0%';
      overallFill.style.width = '0%';
      if (!renderRing(overallRing, 0, 34)) overallRing.innerHTML = '';
      return;
    }

    var doneSum = 0, totalSum = 0;
    var rowsHtml = '';
    STAGE_ORDER.forEach(function(code){
      var s = stats[code];
      var d = (s && typeof s.d === 'number') ? s.d : 0;
      var t = (s && typeof s.t === 'number') ? s.t : 0;
      doneSum += d; totalSum += t;
      var pct = t ? Math.round(d / t * 100) : 0;
      rowsHtml += '<div class="gm-stage-row" data-code="' + code + '">' +
        '<span class="gm-stage-ring"></span>' +
        '<span class="gm-stage-name">' + (STAGE_NAMES[code] || code) + '</span>' +
        '<div class="gm-bar gm-stage-fallback-bar" hidden><div class="gm-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="gm-stage-frac">' + d + '/' + t + '</span>' +
      '</div>';
    });
    body.innerHTML = rowsHtml;

    // Fill in a ring per row (ART.ring if available, else reveal the flat fallback bar).
    body.querySelectorAll('.gm-stage-row').forEach(function(row){
      var code = row.dataset.code;
      var s = stats[code];
      var d = (s && typeof s.d === 'number') ? s.d : 0;
      var t = (s && typeof s.t === 'number') ? s.t : 0;
      var pct = t ? Math.round(d / t * 100) : 0;
      var ringSlot = row.querySelector('.gm-stage-ring');
      if (!renderRing(ringSlot, pct, 18)){
        row.querySelector('.gm-stage-fallback-bar').hidden = false;
      }
    });

    var overallPct = totalSum ? Math.round(doneSum / totalSum * 100) : 0;
    overallLabel.textContent = overallPct + '%';
    overallFill.style.width = overallPct + '%';
    renderRing(overallRing, overallPct, 34);
  }

  /* =============== 9. sphere grid tick + overdrive (ffx events) =========== */

  function triggerNodeRing(row){
    if (!row) return;
    row.classList.remove('gm-node');
    void row.offsetWidth; // force reflow so the animation restarts if re-triggered quickly
    row.classList.add('gm-node');
    setTimeout(function(){ row.classList.remove('gm-node'); }, 900);
  }

  function initChecklistFx(){
    document.addEventListener('ffx:check', function(e){
      var d = e.detail || {};
      if (!d.checked) return;
      var row = (d.el && d.el.closest) ? d.el.closest('.chk') : null;
      triggerNodeRing(row);
      var rect = (d.el && d.el.getBoundingClientRect) ? d.el.getBoundingClientRect() : null;
      var x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      var y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      burst(x, y, 16);
      sfxChime();
    });
  }

  var overdriveShown = false;
  function showOverdrive(){
    if (overdriveShown) return; // fires once per page load, not on every re-render
    overdriveShown = true;

    if (!reducedMotion()){
      var flash = document.createElement('div');
      flash.className = 'gm-charge-flash';
      document.body.appendChild(flash);
      setTimeout(function(){ flash.remove(); }, 700);
      burstShower(false);
    }

    var banner = document.createElement('div');
    banner.className = 'gm-overdrive-banner';
    banner.innerHTML =
      '<div class="gm-ov-title">OVERDRIVE READY</div>' +
      '<div class="gm-ov-sub">เก็บครบทั้งด่านแล้ว</div>';
    document.body.appendChild(banner);
    setTimeout(function(){ banner.classList.add('gm-out'); }, 2600);
    setTimeout(function(){ banner.remove(); }, 3000);

    sfxFanfare();
  }
  function initOverdrive(){
    document.addEventListener('ffx:complete', function(){ showOverdrive(); });
  }

  /* ==================== 10. boss battle-transition wipe ==================== */

  function triggerBossWipe(el){
    if (!reducedMotion()){
      el.classList.add('gm-wipe');
      var tint = document.createElement('div');
      tint.className = 'gm-screen-tint';
      document.body.appendChild(tint);
      setTimeout(function(){ tint.remove(); }, 750);
    }
    sfxLowHit();
  }

  function initBossWipe(){
    var bosses = document.querySelectorAll('.boss');
    if (!bosses.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35){
          var el = entry.target;
          if (el.dataset.gmWiped) return;
          el.dataset.gmWiped = '1';
          io.unobserve(el);
          triggerBossWipe(el);
        }
      });
    }, { threshold: [0, 0.35, 1] });
    bosses.forEach(function(el){ io.observe(el); });
  }

  /* =============== 11. Jecht Shot + Konami-style easter eggs =============== */

  var BLITZBALL_SVG =
    '<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">' +
      '<circle cx="20" cy="20" r="18" fill="#f4f1e8" stroke="#1b2436" stroke-width="1.4"/>' +
      '<path d="M20 4 L27 10 L24 18 L16 18 L13 10 Z" fill="#1b2436"/>' +
      '<path d="M20 36 L13 30 L16 22 L24 22 L27 30 Z" fill="#1b2436"/>' +
      '<circle cx="20" cy="20" r="18" fill="none" stroke="#1b2436" stroke-width=".6" opacity=".5"/>' +
    '</svg>';

  function spawnJechtBall(){
    var ball = document.createElement('div');
    ball.className = 'gm-jecht-ball';
    ball.innerHTML = BLITZBALL_SVG;
    document.body.appendChild(ball);
    var cleanup = function(){ if (ball.parentNode) ball.remove(); };
    ball.addEventListener('animationend', cleanup);
    setTimeout(cleanup, 1400); // fallback in case animationend doesn't fire
  }

  function triggerJechtShot(){
    if (!reducedMotion()){
      spawnJechtBall();
      var flash = document.createElement('div');
      flash.className = 'gm-impact-flash';
      document.body.appendChild(flash);
      setTimeout(function(){ flash.remove(); }, 450);
    }
    sfxSwoosh();
    toast('เจ๊ะ! Jecht Shot!');
  }

  function triggerKonamiBonus(){
    if (!reducedMotion()) burstShower(true);
    toast('โค้ดลับ! ✨ ฝนหิ่งห้อยวิญญาณเต็มจอ — ของขวัญเล็ก ๆ จากทีมพัฒนา');
  }

  function isTypingTarget(el){
    if (!el) return false;
    var tag = el.tagName ? el.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function initEasterEggs(){
    var JECHT_WORD = 'jecht';
    var jechtBuffer = '';
    var KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    var konamiIdx = 0;

    document.addEventListener('keydown', function(e){
      if (isTypingTarget(e.target)) return; // never hijack typing in inputs/textareas

      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey){
        var widget = albhedWidget;
        if (widget){ e.preventDefault(); togglePanel(widget.panel, widget.fab); }
      }

      if (/^[a-zA-Z]$/.test(e.key)){
        jechtBuffer = (jechtBuffer + e.key.toLowerCase()).slice(-JECHT_WORD.length);
        if (jechtBuffer === JECHT_WORD){ jechtBuffer = ''; triggerJechtShot(); }
      }

      var expected = KONAMI[konamiIdx];
      var got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (got === expected){
        konamiIdx++;
        if (konamiIdx === KONAMI.length){ konamiIdx = 0; triggerKonamiBonus(); }
      } else {
        konamiIdx = (got === KONAMI[0]) ? 1 : 0;
      }
    });
  }

  /* ========================= 12. first-visit hint =========================== */

  function showFirstVisitHint(){
    var KEY = 'ffx_hint_shown';
    try { if (localStorage.getItem(KEY) === '1') return; } catch(e){ return; }
    setTimeout(function(){
      toast('เกร็ดลับ: กด "?" เปิดตัวแปลภาษา Al Bhed, กดลูกแก้ว Save Sphere (มุมซ้ายล่าง) ดูความคืบหน้าทั้งเกม, หรือลองพิมพ์ "jecht" ที่ไหนก็ได้ในหน้านี้');
      try { localStorage.setItem(KEY, '1'); } catch(e){ /* storage disabled, hint will just show again next visit */ }
    }, 1500);
  }

  /* ============================== 13. boot ================================= */

  var albhedWidget = null;

  function init(){
    applyStageHue();
    setupPyreflies();
    initChecklistFx();
    initOverdrive();
    initBossWipe();
    initAlbhedHover();
    albhedWidget = buildAlbhedWidget();
    buildSaveSphereWidget();
    initEasterEggs();
    showFirstVisitHint();
  }

  function whenReady(fn){
    if (window.FFX){ fn(); }
    else { document.addEventListener('ffx:ready', fn, { once: true }); }
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ whenReady(init); });
  } else {
    whenReady(init);
  }
})();
