# Page skeletons

Copied from the live `games/ffx/` files. Substitute `ffx` with the new game's storage prefix
everywhere it appears in a `localStorage` key, and translate the Thai display text to suit
the game. Keep the class names, the attribute names and the ordering exactly.

**Depth matters for every asset link and every `../` in this file.** `index.html` sits at the
game root; a stage page sits one level down in `stages/`; a reference page sits one level down
in `reference/`. Copying a stage/reference page's links onto the index page (or the reverse)
still opens — unstyled or with a dead "หน้ารวม" link — because the browser silently fails to
resolve the relative path instead of erroring.

---

## Stage page

Source: `games/ffx/stages/27-zanarkand-ruins.html`. One level down from the game root, so every
asset link and the link home each carry one `../`.

```html
<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>27 — Zanarkand Ruins (Yunalesca)</title><meta name="color-scheme" content="dark light"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="../assets/css/style.css"><link rel="stylesheet" href="../assets/css/art.css"><link rel="stylesheet" href="../assets/css/gimmicks.css"><script>try{document.documentElement.setAttribute("data-theme",localStorage.getItem("ffx_theme")||"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}</script></head>
<body data-page="s27">
<header class="hero">
  <div class="eyebrow">Final Fantasy X – ด่าน 27/30</div>
  <h1>Zanarkand Ruins <span>(ซากเมือง – Yunalesca)</span></h1>
  <div class="badges"><span class="badge b-boss">Spectral Keeper – Yunalesca</span><span class="badge b-key">Cloister + Sun Crest</span><span class="badge b-miss">Sun Crest พลาดง่าย</span></div>
  <div class="navbtns"><a href="26-gagazet-cave.html">‹ Gagazet Cave</a><a class="home" href="../index.html">≡ หน้ารวม</a><a href="28-sin-assault.html">บุก Sin ›</a></div>
</header>
<div class="pbar"><div class="inner"><span>เก็บของ</span><div class="pbar-track"><div class="pbar-fill"></div></div><span><b data-progress="all">0/0</b></span><button class="rst" data-reset>ล้าง</button></div></div>
<div class="wrap">
<nav class="toc">
  <a href="#miss">พลาดแล้วหายไหม</a>
  <a href="#walk">เดินเรื่องตามลำดับเล่น</a>
  <a href="#cloister">วิหาร (Cloister)</a>
  <a href="#keeper">บอส Spectral Keeper</a>
  <a href="#fiends">มอนสเตอร์</a>
  <a href="#gloss">ศัพท์ควรรู้</a>
</nav>

<div class="story"><b>เนื้อเรื่อง:</b> …</div>

<section id="miss">
  <h2><span class="ic">❗</span> พลาดแล้วหายถาวรไหม?</h2>
  …
</section>

<section id="walk">
  <h2><span class="ic">▶</span> เดินเรื่องตามลำดับเล่น <span class="sec-count" data-count>0/0</span></h2>
  …
</section>

  <div class="navbtns"><a href="26-gagazet-cave.html">‹ Gagazet Cave</a><a class="home" href="../index.html">≡ หน้ารวม</a><a href="28-sin-assault.html">บุก Sin ›</a></div>
</div>
<script defer src="../assets/js/app.js"></script><script defer src="../assets/js/fx.js"></script><script defer src="../assets/js/art.js"></script><script defer src="../assets/js/gimmicks.js"></script></body></html>
```

### Notes on the parts that break quietly

- The asset `<link>`/`<script>` paths and the `home` link all carry exactly one `../`, because
  the file lives in `stages/`. A sibling stage (`26-gagazet-cave.html`, `28-sin-assault.html`) is
  a **plain filename with no folder prefix** — both files live in the same `stages/` folder. A
  link to a lookup page instead goes the other way, one level down: `../reference/ref-gear.html`.
- `data-progress="all"` and `.pbar-fill` are written by `app.js` on load and on every tick.
  Ship them with the literal text `0/0` and width unset — the page must be readable with
  JavaScript doing nothing (`CLAUDE.md` §1).
- `data-reset` is the "clear this page" button. `app.js` binds it by that attribute; renaming
  it leaves a button that does nothing, which the harness reports as a dead control.
- `<span class="sec-count" data-count>0/0</span>` goes in the `<h2>` of **every section that
  contains checkboxes**, and nowhere else. `app.js` fills it per section and mirrors the
  state onto the matching sidebar link. A section without checkboxes deliberately stays
  unmarked — marking story and glossary sections "complete" drowns the signal.
- Section `id`s must match the `nav.toc` hrefs exactly.

---

## Index page

Source: `games/ffx/index.html`. Sits at the game root, so its asset links have **no** `../`. It
is the only page with a bare `<body>` and no `app.js`.

```html
<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FFX — คู่มือรวม (30 ด่าน)</title><meta name="color-scheme" content="dark light"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="assets/css/style.css"><link rel="stylesheet" href="assets/css/art.css"><link rel="stylesheet" href="assets/css/gimmicks.css"><script>try{document.documentElement.setAttribute("data-theme",localStorage.getItem("ffx_theme")||"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}</script></head>
<body>
<header class="hero">
  <div class="eyebrow">Final Fantasy X – Complete Walkthrough</div>
  <h1>คู่มือรวม <span>FFX</span> — 30 ด่าน</h1>
  <p>…หนึ่งประโยคบอกว่าไกด์นี้ครอบคลุมอะไร…</p>
</header>
<div class="wrap">
  <div class="guidebar">
    <a href="reference/ref-sidequests.html"><span class="gi">อ้างอิง</span><span class="gt">Side Quest / ล่าอาวุธ</span></a>
  </div>
  <div class="callout tip"><b>ป้ายสี:</b> <span class="gtag gt-aeon">Aeon</span> ได้เทพอัญเชิญ – <span class="gtag gt-key">ของสำคัญ</span> – <span class="gtag gt-quest">puzzle/เควส</span> – <span class="gtag gt-miss">พลาดง่าย</span> ของหายถาวร</div>

  <h3 class="sec">ต้นเกม</h3>
  <ol class="stages">
    <li data-total="12"><span class="st-n">1</span><a class="nm" href="stages/01-zanarkand-intro.html">Zanarkand (บทเปิด)</a><span class="ds">tutorial – Sinspawn Ammes</span><span class="get"><span class="gtag gt-quest">เรียนระบบ</span></span></li>
  </ol>

  <div class="callout warn"><b>ของหายถาวรจริง (ห้ามพลาด):</b> …</div>
  <footer>Final Fantasy X (PS2 / HD Remaster) – คู่มือภาษาไทย – ข้อมูล: …</footer>
</div>
<script defer src="assets/js/fx.js"></script><script defer src="assets/js/art.js"></script><script defer src="assets/js/gimmicks.js"></script></body></html>
```

Every `<a>` into the folder tree — a stage card, the `guidebar` link — carries the subfolder
name (`stages/…`, `reference/…`) because `index.html` is the one page these subfolders are
*below*, not beside.

`data-total` on each `<li>` is the checkbox count of that stage's page. Scaffold with `0` and
let `node tools/sync-totals.js` write the real value.

---

## Reference page

A lookup page (`ref-sidequests.html`, `ref-gear.html`, `ref-abilities.html`) lives in
`reference/` — the same depth as a stage page in `stages/` — so it follows the **Stage page**
skeleton above verbatim for every asset link and the `../index.html` home link, with its own
`data-page` tag and its own `data-k` prefix:

```html
<body data-page="refside">   <!-- checkbox keys: rs-… -->
<body data-page="refgear">   <!-- checkbox keys: rg-… -->
```

A sibling reference page is a plain filename, no folder prefix (`ref-gear.html` from inside
`ref-abilities.html`) — both live in the same `reference/` folder. When a lookup table cites a
specific stage, that link goes the other way, one level down: `../stages/04-besaid-aeon-valefor.html`.

It loads `app.js` only if it actually has checkboxes. `ref-sidequests.html` does;
`ref-abilities.html` and `ref-gear.html` do not and omit it.

---

## `data-k` prefix table, as used in `games/ffx/`

| Page kind | `data-page` | `data-k` prefix | Example |
|---|---|---|---|
| Stage `NN` | `sNN` | `sNN-` | `data-k="s27-sun"` |
| Side quests | `refside` | `rs-` | `data-k="rs-…"` |
| Gear | `refgear` | `rg-` | `data-k="rg-…"` |
| Story primer | `primer` | — (no checkboxes) | |

Keys are lowercase, hyphenated, and unique within the file. The suffix names the thing, not
its position: `s27-sun` for Sun Crest, `s28-highbridge` for the Highbridge scene. A positional
key like `s27-item3` breaks the moment an item is inserted above it.

**Keys are user data.** They are the localStorage keys holding progress the reader earned by
playing. Renaming or removing one erases it. Count them before and after every edit and report
both numbers — `CLAUDE.md` §5.
