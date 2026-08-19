# Design System — page tokens and classes

This document extracts the full visual design system that every game folder shares, using the FFX
stylesheet at `games/ffx/assets/css/style.css` (~1,690 lines) as the reference implementation, plus
`games/ffx/assets/css/art.css` and `games/ffx/assets/css/gimmicks.css` (two supplementary files
that load after style.css). The goal is for whoever builds the next game to learn the class
vocabulary and the token system without having to read the whole CSS file. This document covers
**visual structure only** — rules about content / play order / `data-k` live in
[`content-model.md`](content-model.md) and in the root [`CLAUDE.md`](../CLAUDE.md). Read both
alongside this one; neither replaces the other.

Every markup example in this document is copied from a real file in `games/ffx/` (mostly from
`games/ffx/stages/27-zanarkand-ruins.html`, `games/ffx/stages/28-sin-assault.html`,
`games/ffx/index.html`, and `games/ffx/reference/ref-gear.html`) — not an invented example. Copy,
paste, and adapt it directly.

---

## 1. Token system

All tokens are declared as CSS custom properties on `:root` (the light-mode values), then
overridden as a second set under `[data-theme="dark"]` (the dark-mode values). The single most
important rule in the whole file: **never write a new hex/rgba colour directly on a page** — every
colour must come from one of these variables. See section 5 (What not to do).

### 1.1 Surfaces

| Token | What it's for | Light-mode value | Dark-mode value |
|---|---|---|---|
| `--bg` | The bottom colour stop of the whole-page background gradient | `#f1f4fa` | `#05070e` |
| `--bg2` | The top colour stop of the background gradient (paired with `--bg`) | `#e6ecf7` | `#0a0f1c` |
| `--panel` | The standard translucent glass surface for every card / pill / badge. Always paired with `backdrop-filter:blur(var(--blur))` | `rgba(255,255,255,.94)` | `rgba(19,26,40,.78)` |
| `--panel-solid` | A 100%-opaque surface, used only where translucency would hurt readability — e.g. the tooltip bubble, the command-palette box, the numeral inside `.steps li::before`'s circle | `#ffffff` | `#0e1422` |
| `--panel2` | A second, fainter translucent layer than `--panel`. Used for secondary surfaces — the progress-bar track, a `.chk` row's background, the count pill's background | `rgba(255,255,255,.72)` | `rgba(255,255,255,.05)` |
| `--line` | The standard 1px border colour for every card / button / input | `rgba(18,34,72,.16)` | `rgba(255,255,255,.14)` |
| `--line-soft` | A divider fainter than `--line`, used for heading rules / row dividers in `dl.kv` / the `border-bottom` of `h2` | `rgba(18,34,72,.09)` | `rgba(255,255,255,.08)` |

### 1.2 Text

| Token | What it's for | Light | Dark |
|---|---|---|---|
| `--ink` | The primary text colour (headings, body copy, `<b>`/`<strong>`) | `#0c1220` | `#eef2fb` |
| `--ink-soft` | A slightly dimmer secondary text colour, used for the prose inside `.story` and for `dd` inside `dl.kv` | `#1e2c42` | `#cfd9ec` |
| `--muted` | The tertiary text colour (labels, the eyebrow, table headers, secondary copy) | `#55637a` | `#93a1b8` |

### 1.3 Accent hues — surfaces/graphics only, never text

This group of tokens only clears the 3:1 contrast bar for non-text graphics/borders. They can be
used for a badge/pill background, a left accent border, a glowing box-shadow, an SVG icon's
fill/stroke, a progress-bar fill, and the watermark icon inside `.callout::after`.

| Token | Light | Dark |
|---|---|---|
| `--gold` | `#b3760a` | `#ffcc66` |
| `--gold-dim` | `#c99a34` (a secondary gold tone, used for the hover border) | `#c9a04a` |
| `--blue` | `#2563eb` | `#6aa9ff` |
| `--green` | `#12855f` | `#3ee08f` |
| `--red` | `#d6335a` | `#ff5f7e` |
| `--purple` | `#7038d8` | `#b388ff` |
| `--cyan` | `#0891a8` | `#43e6e0` |

### 1.4 The `-text` variables — same hues, but cleared for text (4.5:1)

| Token | Light | Dark |
|---|---|---|
| `--gold-text` | `#8a5a04` | `var(--gold)` |
| `--cyan-text` | `#06707f` | `var(--cyan)` |
| `--green-text` | `#0f7350` | `var(--green)` |
| `--red-text` | `#b3123c` | `var(--red)` |
| `--purple-text` | `#5b21b6` | `var(--purple)` |

**The rule for choosing between them (the single most important rule in this token section):** use
the plain colour tokens (`--gold`, `--cyan`, `--green`, `--red`, `--purple`) only when the colour is
painted onto a surface / graphic / shadow — a badge background, a card's left accent border, a
progress-bar fill, an SVG icon. Use the `-text` variables (`--gold-text`, `--cyan-text`,
`--green-text`, `--red-text`, `--purple-text`) every time the colour is **actual readable body
text** — a link, a status label ("permanently missable" / "safe"), a small label, or the lettering
inside a badge. The reason: measured contrast showed the plain colours fail the AA 4.5:1 bar for
text in light mode — gold measures 3.66:1 and cyan measures 3.59:1 on white, and status badges like
`.b-miss`/`.b-boss`/`.hp` measured as low as 2.99:1–3.75:1 before the fix. In dark mode the `-text`
variables alias straight back to the plain colour
(`[data-theme="dark"]{--gold-text:var(--gold);...}`), because the dark background already gives
plenty of contrast and doesn't need the colour dimmed.

### 1.5 Hero/story/boss colour slots (legacy component slots)

This group of variables is a pair of gradient stops for one specific component's background
gradient each — they are not meant for general use.

| Token | Used for | Light | Dark |
|---|---|---|---|
| `--hero1`, `--hero2` | The background gradient of `header.hero` | `#e9eefb` / `#eef1f8` | `#0b1120` / `#05070e` |
| `--heroglow` | The circular glow behind the hero, **and** the mouse-following spotlight (`body::before`) | `rgba(112,56,216,.09)` | `rgba(139,92,246,.28)` |
| `--story1`, `--story2` | The background gradient of `.story` | `rgba(112,56,216,.06)` / `rgba(112,56,216,.01)` | `rgba(139,92,246,.10)` / `rgba(139,92,246,.015)` |
| `--boss1`, `--boss2` | The background gradient of `.boss` | `rgba(214,51,90,.07)` / `rgba(255,255,255,.5)` | `rgba(255,95,126,.10)` / `rgba(255,255,255,.02)` |
| `--pbarbg` | Declared and used in `.pbar`'s base rule (`background:var(--pbarbg)`), but a later `.pbar{background:...}` rule further down the same file — same selector, same specificity, the "sticky bar rides on the page rather than sitting in its own box" rule — overrides it via plain cascade order (last rule of equal specificity wins), painting a gradient built from `var(--bg)` instead. No `!important` is involved on either side. Editing this token currently produces no visible change — check which `.pbar` rule wins in the cascade before assuming it does | `rgba(246,248,253,.72)` | `rgba(5,7,14,.62)` |

### 1.6 Effects (shadow / glow / blur / background particles)

| Token | What it's for |
|---|---|
| `--shadow` | The standard drop shadow under a card/button |
| `--shadow-lg` | A deeper shadow, used on hover or for large overlay boxes (command palette, toast) |
| `--glow` | A thin inset highlight along a card's top edge, giving it a raised-surface feel |
| `--ring` | The colour of `::selection`, and of the focus outline in a few places |
| `--orb1`/`--orb2`/`--orb3` | The colours of the floating aurora blobs in the background (`.fx-bg .o1/.o2/.o3`) — very faint in light mode, far more vivid in dark mode |
| `--grid-line` | A faint background grid line |
| `--star` | The twinkling star dots inside `.fx-stars` |
| `--blur` | The standard `backdrop-filter:blur()` radius — 16px in light mode, 18px in dark mode |

### 1.7 Corner radius

| Token | Value | Used for |
|---|---|---|
| `--r-sm` | 10px | Declared but **no rule in the current file actually uses it** — treat it as reserved, not dead |
| `--r-md` | 14px | Medium-sized components — e.g. `.callout`, `.chk`, `.prep`/`.skill`, the numbered circle in `.steps` |
| `--r-lg` | 20px | Large panels — e.g. `.card`, `.boss`, `.puz`, `.pick`, `.tbl-wrap`, `.primer-link`, the tiles inside `.guidebar`/`ol.stages` |
| `--r-xl` | 28px | The largest full-screen overlay chrome — e.g. the command-palette box (`.fx-pal .box`) |

### 1.8 Fonts

| Token | Used for |
|---|---|
| `--f-body` | All Thai body copy — stays on the system font stack (Segoe UI / Leelawadee UI / Noto Sans Thai) because the webfonts tried for Thai were too thin to read at body size |
| `--f-disp` | The display font (Space Grotesk), used for almost every heading / label / numeral on the site (`h2`, `h2 .num`, `.boss::before`, `.puz h4`, `.steps li::before`, every part of `ol.stages`, etc.) |
| `--f-title` | Used in exactly one place, `.hero h1` — currently identical to `--f-disp`. Kept as a separate variable in case the hero title should ever use a different font from other headings without touching anything else |

### 1.9 Variables JavaScript sets

`--mx` and `--my` (default `50% 0%`) are overwritten by `fx.js` via `setProperty` in real time,
tracking the mouse position to drive the mouse-following spotlight in `body::before` — a page
should never set this pair of variables itself. Leave it to the script.

---

## 2. Class vocabulary

Ordered the way they actually appear scanning a stage page from top to bottom.

### `.wrap`

**What it's for:** The page's main content column. There is **exactly one per page**, a direct
child of `<body>` (after `.pbar`, if the page has one). Max width 940px, centred with
`margin:0 auto`. Horizontal padding is 22px (16px at ≤760px screens); the final `padding-bottom` is
64px at every screen size. If the page has a `nav.toc` anywhere inside it, at ≥1120px screens
`.wrap` turns into a two-column CSS grid up to 1260px wide — see section 3 (Layout structure) for
the detail.

**When not to use it:** Never nest two `.wrap`s in one page, and never put a page-level element
like `header.hero`/`.pbar` inside `.wrap` — both components sit outside `.wrap` in every real page,
without exception.

```html
<div class="wrap">
  <nav class="toc">...</nav>
  <div class="story">...</div>
  <section id="walk">...</section>
</div>
```

### `.hero`

**What it's for:** The full-width header on every page (`<header class="hero">`), always outside
`.wrap`. The standard structure is: `.eyebrow` (a small label giving context, e.g. "which stage
number"), `<h1>` (with a `<span>` wrapping the trailing words so they get an accent colour separate
from the rest of the title), `.badges` whose child `.badge` elements must each carry exactly one
status colour class (`.b-aeon` purple / `.b-key` gold / `.b-miss` red / `.b-boss` deep red /
`.b-quest` cyan), and `.navbtns`, a row of buttons to the previous stage / the hub page / the next
stage (the middle button, which goes to the hub page, needs the extra class `.home` to get the cyan
colour).

**When not to use it:** Only once per page, as the header. Never nest `.hero` inside another
section.

```html
<header class="hero">
  <div class="eyebrow">Final Fantasy X – ด่าน 27/30</div>
  <h1>Zanarkand Ruins <span>(ซากเมือง – Yunalesca)</span></h1>
  <div class="badges">
    <span class="badge b-boss">Spectral Keeper – Yunalesca</span>
    <span class="badge b-key">Cloister + Sun Crest</span>
    <span class="badge b-miss">Sun Crest พลาดง่าย</span>
  </div>
  <div class="navbtns">
    <a href="26-gagazet-cave.html">‹ Gagazet Cave</a>
    <a class="home" href="../index.html">≡ หน้ารวม</a>
    <a href="28-sin-assault.html">บุก Sin ›</a>
  </div>
</header>
```

### `.pbar`

**What it's for:** The progress bar pinned to the top of the page (`position:sticky;top:0`),
counting every ticked checkbox on the page via `app.js`. It needs all 4 parts present exactly as in
the example, or the script can't find the elements: `<b data-progress="all">` (the done/total
count), `.pbar-track` > `.pbar-fill` (the fill bar whose width JS animates), and the
`<button class="rst" data-reset>` button (clears every checkbox on the page). Exactly one per page,
a direct child of `<body>`, placed before `.wrap`.

**When not to use it:** A page with no checklist at all (e.g. a pure reference page) doesn't need a
`.pbar`.

```html
<div class="pbar"><div class="inner">
  <span>เก็บของ</span>
  <div class="pbar-track"><div class="pbar-fill"></div></div>
  <span><b data-progress="all">0/0</b></span>
  <button class="rst" data-reset>ล้าง</button>
</div></div>
```

### `nav.toc`

**What it's for:** An in-page table of contents with scroll-spy (JS adds the `.active` class to the
link for whichever section is currently in view). Each `<a>` must point at the `#id` of a real
`<section>` on the page. **It must be the first direct child of `.wrap`** (`.wrap > nav.toc`) and
nothing else — otherwise the sidebar rail won't work. See trap 4.

**When not to use it:** A short reference page with no sections worth jumping between can skip it,
but every main stage page of a game always has a `nav.toc`.

```html
<div class="wrap">
<nav class="toc">
  <a href="#miss">พลาดแล้วหายไหม</a>
  <a href="#walk">เดินเรื่องตามลำดับเล่น</a>
  <a href="#fiends">มอนสเตอร์</a>
  <a href="#gloss">ศัพท์ควรรู้</a>
</nav>
```

### `.story`

**What it's for:** A prose box for atmosphere/story — a purple accent border on the left. It's the
component that "reads like a novel." Two special CSS rules matter here: (1) the very first `.story`
that is a direct child of `.wrap` (the opening-scene story) gets a larger font-size and more
padding than any other `.story` on the same page, and (2) a `.story` that comes right after an
`<h3>` (`h3+.story`) is demoted to plain, light text with no border and no background (it reads as
"a small mood beat for the sub-scene," not another card).

**When not to use it:** Never put mechanical/pathing instructions inside `.story` (use `ol.steps`
instead) — `.story` is only for atmosphere/story.

```html
<div class="story"><b>เนื้อเรื่อง:</b> สุดปลายทางแสวงบุญ คณะก้าวข้ามหิมะบนยอด Gagazet ลงมาเจอ
สิ่งที่ Tidus เฝ้าฝันจะได้เห็นมาตลอด — <b>Zanarkand</b> บ้านเกิดของเขา ...</div>
```

### `.card` + `<h4>`

**What it's for:** A general-purpose information box for anything that doesn't fit `.story` /
`.boss` / `.callout` — summaries, mechanic explanations, timeline tables, etc. The box heading is
always `<h4>` (never `<h3>`). It commonly has a `dl.kv` inside it to show term/definition data.

**When not to use it:** If you need to signal that this is a boss, a puzzle, or a warning, use
`.boss`/`.puz`/`.callout` instead — `.card` is a "neutral box" that carries no status meaning of its
own.

```html
<div class="card" id="endgame-timeline"><h4>ลำดับปิดเกม — สามด่านสุดท้ายรวดเดียว</h4>
<dl class="kv">
<dt>ด่าน 28 – บุก Sin</dt><dd>ครีบซ้าย/ขวา → Sinspawn Genais → แกน Sin → Overdrive Sin ...</dd>
</dl></div>
```

### `dl.kv`

**What it's for:** A two-column term/definition list (`dt` on the left / `dd` on the right). Used
in the glossary box at the end of a page (`#gloss`) and in various spec/timeline blocks. Below
620px screens it stacks vertically instead (dt on top, dd underneath). Each row has a thin divider
above it (except the first row).

**When not to use it:** If it's a table with more than 2 columns, or many repeating rows of the
same kind of data, use a plain `<table>` instead (see `.tbl-wrap` below).

```html
<dl class="kv">
  <dt>Final Summoning / Final Aeon</dt>
  <dd>พิธีสูงสุดของศาสนา Yevon — ซัมมอนเนอร์ต้องเลือกผู้พิทักษ์ที่ตัวเองรักที่สุดมาสังเวย...</dd>
  <dt>Yu Yevon</dt>
  <dd>ตัวตนอมตะที่ซ่อนอยู่ในแกนกลางของ Sin ...</dd>
</dl>
```

### `.callout` + `.tip` / `.warn` / `.secret`

**What it's for:** A short highlight box. It must always carry exactly one child class alongside
`.callout` — `.tip` (green, friendly advice/extra info), `.warn` (red, danger warning/permanently
missable item), `.secret` (purple, secret content/advanced option). Each variant has a matching
watermark icon in the corner (checkmark / warning triangle / burst star) drawn with a CSS mask —
not an image you need to attach yourself.

**When not to use it:** A long ordinary paragraph doesn't need a box — `.callout` exists only for
text you want to stand out from the narrative flow. Don't overuse it until every paragraph is a
coloured box.

```html
<div class="callout warn"><b>⚠️ อันตรายที่สุดของทั้งเกมสำหรับสายเก็บครบ — <span class="it">Sun
Crest</span>:</b> มันคือชิ้นส่วนที่ปลดพลัง <span class="it">Caladbolg</span> ...</div>

<div class="callout tip"><b>ที่เหลือใจเย็นได้:</b> หีบ Sphere/Gil ในซากเมืองและโดม...</div>

<div class="callout secret"><b>ตอนนี้คือช่วง "อิสระเต็มที่" ของทั้งเกม:</b> ได้เรือบินแล้ว...</div>
```

### `.hn` and `.sec-count`

**What it's for:** `.hn` is a round numeral badge in front of an `<h3>`, replacing the ①②③
circled-numeral characters (which can't be styled) — written as `<span class="hn">1</span>` leading
the heading text (don't type parentheses or a period yourself). There's a smaller variant, `.hn.sm`
(cyan-purple instead of gold-red), for a lower sub-heading level. `.sec-count` is the
"collected/total" number pill at the end of each section's `<h2>`. **It must carry an empty
`data-count` attribute**, because `app.js` finds the element with `querySelector('[data-count]')`
and fills in the content itself — don't type the starting number yourself (just put `0/0` as a
placeholder).

```html
<h3><span class="hn">1</span>ทางเข้าซาก — เมืองในฝันที่ตายไปแล้ว</h3>

<h2><span class="ic">▶</span> เดินเรื่องตามลำดับเล่น <span class="sec-count" data-count>0/0</span></h2>
```

### `.pick` and `.pick.milestone`

**What it's for:** The inline-pickup box for this scene — placed exactly where the player walks
past the real thing, never collected together at the bottom of the page. Always `<h4>` +
`<ul class="chklist">` inside. The corner badge (Thai: "เก็บของ", "pick up") comes from CSS
`content` automatically — **don't type it yourself**. If what's collected is an "event" rather than
a physical item (a boss falls, a character joins, an important conversation happens), add the
`.milestone` class (`<div class="pick milestone">`); the colour switches to purple and the corner
badge switches to "จุดสำคัญ" ("milestone") automatically too.

**When not to use it:** If it's something to do **before** a fight (not a collectible), use `.prep`
instead. If it's a new skill/move gained permanently, use `.skill` instead — `.pick` is reserved
for checklists whose ticks genuinely count as collected items/events.

```html
<div class="pick"><h4>เก็บของในฉากนี้</h4><ul class="chklist">
  <li class="chk"><input type="checkbox" data-k="s27-fortune"><span class="lbl">
    <span class="it">Fortune Sphere</span> — กลางทางเดินช่วงแรกของซากเมือง</span></li>
</ul></div>

<div class="pick milestone"><h4>เหตุการณ์สำคัญของฉากนี้</h4><ul class="chklist">
  <li class="chk"><input type="checkbox" data-k="s28-highbridge"><span class="lbl">ฉาก
  <b>Highbridge</b> — เลือกจุดหมาย <b>Highbridge</b> บน NavMap แล้วคุยกับ Grand Maester Mika
  จนจบฉาก</span></li>
</ul></div>
```

### `.prep`

**What it's for:** The "prepare before this fight" box — always placed right before a `.boss`
block. The corner badge (Thai: "เตรียมตัว", "prepare") also comes from CSS `content`. Normally
`<h4>` + `<ul><li>` inside, listing what to prepare (status-ward armour, mechanic knowledge ahead
of time). **It is not a checklist** — no checkboxes inside.

```html
<div class="prep"><h4>เตรียมตัวก่อนสู้</h4>
  <ul>
    <li><b>เกราะติด <span class="it">Berserk Ward</span> หรือ <span class="it">Berserkproof</span></b>
    — ท่า Berserk Tail ของมันทำให้คนของเราคุมไม่ได้ ...</li>
  </ul>
</div>
```

### `.skill`

**What it's for:** The "gained skill/new move" box — looks like `.prep` but purple instead of red,
with the corner badge reading "ได้สกิล" ("gained skill"). Used when the scene permanently teaches a
character a new move/system (e.g. how to use an Aeon for the first time, a new Overdrive move).

**When not to use it:** If it's something you can tick as collected, use `.pick` instead. `.skill`
is only for explaining a mechanic — no checkbox.

```html
<div class="skill"><h4>ได้สกิล/ท่าใหม่</h4><ul>
  <li><b>Aeon ใช้ยังไง (เปิดใช้ครั้งแรกในด่านนี้):</b> ในการต่อสู้ ให้เลือกคำสั่ง <b>Summon</b>
  ในเมนูของ Yuna แล้วเลือก Aeon ที่ต้องการ ...</li>
</ul></div>
```

### `.chklist` and `li.chk` (+ `input[data-k]` + `.lbl`)

**What it's for:** `.chklist` is a `<ul>` laid out as a CSS grid (single column by default,
expanding to 2 columns automatically at ≥1100px screens). Each child is an `<li class="chk">`,
which must have exactly 2 sibling parts in this fixed structure:

```html
<li class="chk">
  <input type="checkbox" data-k="s27-fortune">
  <span class="lbl"><span class="it">Fortune Sphere</span> — คำอธิบายตำแหน่ง</span>
</li>
```

**What you need to know before touching this component's CSS:** the checkbox you actually see on
screen is **not** the `<input>` — the `<input>` is stretched to cover the whole row with
`position:absolute;inset:0` and made invisible (`opacity:0`) so the entire row is a clickable
target. The square box you see is drawn entirely by `.chk::after` (a pseudo-element) — don't try to
style `input[type=checkbox]` directly, it isn't visually rendered anyway, and don't wrap it in a
`<label>` either, since the whole row is already a click target from the stretched input. `data-k`
is the key used to store the ticked state in `localStorage` — the naming rules (prefix per page,
never delete/rename an existing key) live in [`CLAUDE.md`](../CLAUDE.md) section 5, not this
document. When a checkbox is ticked, `app.js` adds the `.done` class to the `<li class="chk">`
itself (strikethrough text, dimmed background) — don't add this class yourself.

**When not to use it:** If it isn't a list of things to tick off as collected (e.g. steps that must
be done in order), use `ol.steps` instead.

### `.boss` + `.hp`

**What it's for:** The boss-fight block. It gets a "BOSS" badge in the top-right corner from CSS
`content` (don't type it yourself). Standard structure: `<h3>` boss name + `<span class="hp">` the
HP value, tacked onto the end of the same `h3`; `.lore` (a paragraph explaining why this fight
happens, led by `<b>`); plain `<p>` paragraphs for mechanics/how to win; and closing with a
`<p class="drops">` summarising Steal/Drop/AP.

**When not to use it:** If it's just a generic random encounter, put it in the monster table at the
end of the page instead — `.boss` is reserved for named fights with their own scripted mechanics.

```html
<div class="boss" id="keeper"><h3>Spectral Keeper <span class="hp">HP 52,000</span></h3>
  <div class="lore"><b>ทำไมต้องสู้:</b> ผู้พิทักษ์วิญญาณเฝ้าประตูสู่ Yunalesca ...</div>
  <p><b>กลไกสนาม:</b> ตัวละคร 3 คนยืนแยกบนแท่นลอยคนละแท่น ...</p>
  <p class="drops"><b>Steal:</b> Ether (rare: Turbo Ether) – <b>Drop:</b> Lv.4 Key Sphere</p>
</div>
```

### `.puz`

**What it's for:** The puzzle-solving block (a Cloister of Trials or another room puzzle). It gets
a "CLOISTER" badge in the top-right corner from CSS automatically, the same mechanism as `.boss`.
Inside is an `<h4>` heading + `ol.steps` walking through the steps, often paired with a `.pmap` to
diagram positions in the room.

**When not to use it:** General travel directions that aren't a room puzzle — a bare `ol.steps`
inside `.story` or an ordinary section is enough; don't wrap it in `.puz`.

```html
<div class="puz" id="cloister"><h4>Cloister of Trials (Zanarkand) — วิธีแก้ทีละขั้น</h4>
  <ol class="steps">
    <li>เดินเข้าไปเหยียบสวิตช์หน้าประตูทางเข้าเพื่อเริ่มปริศนา ...</li>
  </ol>
</div>
```

### `.pmap`

**What it's for:** A grid-table diagram of positions in a room, used in place of directional prose
(the "no compass directions" rule lives in CLAUDE.md — `.pmap` is the tool that makes that rule
actually followable). Set the column/row count via a custom property on `.pmap`'s own `style`
attribute (`--cols`, `--rows`), then place each point as `<span class="pnode">` with `--x`/`--y`
(counted from 1) and a sequence number via `data-n`. The starting point gets the `.is-start` class
(green border); the destination gets `.is-goal` (gold border). The room name goes on `.pmap` itself
via `data-room`.

**When not to use it:** If the route is a straight line with no branching choices, describe it in
text with `ol.steps` — no need to draw a map.

```html
<div class="pmap" style="--cols:5;--rows:4" data-room="ห้องแรก">
  <span class="pnode is-start" style="--x:3;--y:4" data-n="1">หน้าประตูทางเข้า</span>
  <span class="pnode" style="--x:5;--y:3" data-n="2">ริมขวาห้อง</span>
  <span class="pnode is-goal" style="--x:1;--y:1" data-n="5">มุมซ้ายบนสุด ใกล้หน้าจอ</span>
</div>
```

### `ol.steps`

**What it's for:** An ordered list of steps with a faint vertical connecting line and a circled
number leading each `<li>` (counted automatically with a CSS counter — don't type the numbers
yourself). Usable both in general contexts and inside `.puz`.

**When not to use it:** A list with no inherent order (e.g. pickups that don't care about sequence)
should use a plain `<ul>`, not `ol.steps`.

```html
<ol class="steps">
  <li>เดินตามเส้นทางซากเมืองเข้าไป – กลางทางเดินมีหีบ <span class="it">Fortune Sphere</span> ...</li>
  <li>ศัตรูช่วงนี้เป็น <b>Fallen Monk</b> ...</li>
</ol>
```

### `ol.stages` + `.st-n` + `.gtag` variants

**What it's for:** Used only in a game's `index.html` (the stage hub page), as a list of one card
per stage. Per-`<li>` structure: `data-total="N"` (the actual checkbox count for that page — needed
so the progress ring can compute correctly even if the player has never opened that page yet; this
number is kept in sync with `node tools/sync-totals.js`, per CLAUDE.md), a `<span class="st-n">`
stage number, an `<a class="nm">` clickable stage-name link (the whole card is clickable via this
link's `::after` overlay), a `<span class="ds">` short description, and a `<span class="get">`
wrapping one or more `<span class="gtag">` with a colour class matching its meaning: `.gt-aeon`
(purple, gains an Aeon), `.gt-key` (gold, a key item/weapon/main-story beat), `.gt-quest` (cyan, a
quest/puzzle), `.gt-miss` (red, a permanently-missable item). At ≥880px screens the list turns into
a 3-column bento grid (see section 3).

**When not to use it:** Never use `ol.stages` on an individual stage page — it exists for the hub
page only.

```html
<ol class="stages">
  <li data-total="8"><span class="st-n">27</span><a class="nm" href="stages/27-zanarkand-ruins.html">
    Zanarkand Ruins</a><span class="ds">Cloister – Yunalesca</span><span class="get">
    <span class="gtag gt-key">Sun Crest</span><span class="gtag gt-miss">พลาดง่าย</span></span></li>
</ol>
```

### `.it`, `.nm`, `.n` — item names / table row headers

**What it's for:** All three classes produce the same visual result (bold + primary text colour +
a thin gold underline), but are used in different contexts: `.it` is used in checklist prose/labels
for an item name (`<span class="it">Fortune Sphere</span>`); `.nm`/`.n` are used in a table `<td>`
for a row header (item/skill/character name, or a Roman numeral) — `.nm` and `.n` are two class
names that produce an identical result (`td .n,td .nm{color:var(--gold);font-weight:700}` in the
base rule). Either works in a table context, but in the real files `.n` tends to be used for
columns that are "short row headers" (character names, Roman numerals) and `.nm` for "item/ability
name" columns — pick whichever matches what's already used in that kind of table, and don't mix
both names in the same table without a reason. The same tables commonly also carry
`.item`/`class="item"` (cyan, the column naming a material used) alongside `td .miss`/`td .safe`
(red/green, for a status column reading "permanently missable"/"safe").

```html
<tr><td class="nm">Caladbolg (Tidus)</td><td>สัดส่วน HP</td><td>เลือดเต็ม = แรงเต็ม 100%</td></tr>

<tr><td class="n">XIX</td><td>Al Bhed Home — ซ้ายทางเข้า ตรงข้าม Save Sphere</td>
<td class="miss">หายถาวร!</td></tr>

<tr><td class="n">I</td><td>Salvage Ship — ท้ายเรือ</td><td class="safe">กู้ได้</td></tr>
```

### `.term[data-tip]`

**What it's for:** A game-specific term with a tooltip explanation on hover/focus. **The page
author does not type `data-tip` themselves** — just write a plain
`<span class="term" title="explanation">term</span>`, and `app.js` (the `initTermTooltips`
function) moves the `title` value into `data-tip` automatically on page load (removing `title` and
adding `tabindex="0"` so it's keyboard-focusable too). The reason for the move: if `title` were left
in place, the browser's own native tooltip would show up layered on top of the tooltip `style.css`
draws itself (a floating box via `::after`).

**When not to use it:** A term already explained in the same sentence doesn't need wrapping again —
use it only for words a reader might genuinely have forgotten the meaning of (game-specific
system/mechanic names).

```html
<span class="term" title="ดวงวิญญาณเรืองแสงของผู้ตาย ล่องลอยอยู่ทั่ว Spira">pyreflies</span>
```

### `.tbl-wrap`

**What it's for:** A card frame around a `<table>` (border, rounded corners, shadow, horizontal
scroll when it overflows). **The page author does not write `<div class="tbl-wrap">` themselves —
just write a plain, bare `<table>`**, and `fx.js` (the `wrapTables` function) wraps every `<table>`
on the page with `.tbl-wrap` automatically on load. If `.tbl-wrap` is already wrapped around it by
hand, the script skips it (it checks whether the parent already has this class), so it won't
double-wrap — but doing it by hand isn't necessary either.

**When not to use it:** No exceptions — always write a bare `<table>` and let the script wrap it.

```html
<table><tr><th>ชื่อ</th><th>ลักษณะ</th><th>วิธีจัดการ</th></tr>
<tr><td><b>Fallen Monk (Rifle)</b></td><td>พระ machina undead ถือไรเฟิล</td>
<td><b>ขว้าง Phoenix Down ฆ่าทันที</b></td></tr>
</table>
```

### `data-note`

**What it's for:** An attribute (not a class), placed on a `<p>` to shrink the font size and tone
the colour down to secondary/fine-print text — replacing what used to be an inline
`style="font-size:..."` directly on the page in older files (now forbidden — see section 5). Used
for a legend explaining symbols, a note flagging uncertain data, or a light-touch warning.

```html
<p data-note>🔑 <b>บิน/ลอย</b>=ใช้ Wakka หรือเวท (ประชิดพลาด) – <b>เกราะ/armored</b>=Armor Break
หรืออาวุธ Piercing (Auron/Kimahri) ...</p>
```

### Progress-status classes (JS adds these itself — never type them in HTML)

These six classes **never appear in any source HTML file**, because they are classes/elements the
scripts create or add at runtime, driven by data in `localStorage`. Understanding who adds what,
and where, matters for the next game — its markup has to be wired so the scripts can find the right
elements:

- **`.sec-done` / `.sec-part`** — `app.js` adds these to an `<a>` inside `nav.toc` when its href
  points at a `<section id="...">` whose checkboxes are fully done / partially done, respectively.
  (A section with no checkboxes at all — pure story or a glossary section — is deliberately left
  untouched: "done" has no meaning for that kind of section.) At ≥1120px screens, a link carrying
  `.sec-done` also shows a trailing done/total number via `content:attr(data-sec-count)`, and
  `app.js` sets `data-sec-count` too.
- **`.done-all` / `.some-done`** — `fx.js` adds these only to `<li>` elements inside `ol.stages` in
  a game's `index.html`, based on the done/total ratio read from `data-total` plus `localStorage`
  data.
- **`.ring`** — the whole `<span class="ring">` element is created from scratch by `fx.js` (not
  just a class being added), then inserted as the first child of each `<li>` in `ol.stages`. It's
  drawn as a progress ring around `.st-n` using a `conic-gradient` whose percentage JS computes live
  and writes directly via inline `style.background`.
- **`.st-prog`** — like `.ring`, `<span class="st-prog">` is created and inserted by `fx.js`,
  showing that stage's "done/total" number in the corner of the card.

---

## 3. Layout structure

### `.wrap` becomes a two-column grid + a pinned sidebar at 1120px

At ≥1120px screens, the rule `.wrap:has(nav.toc){max-width:1260px;display:grid;
grid-template-columns:230px minmax(0,1fr);gap:0 60px}` fires **only when `.wrap` has a `nav.toc`
anywhere inside it** (the `:has()` selector looks arbitrarily deep into descendants, not just
direct children). Once that condition is true, every child of `.wrap` is automatically pushed into
column 2 via `.wrap:has(nav.toc)>*{grid-column:2}`.

A separate rule is what actually turns `nav.toc` into the **pinned left sidebar rail**:
`.wrap>nav.toc{grid-column:1;grid-row:1/span 999;position:sticky;top:96px;...}` — this selector
uses the `>` combinator, meaning **it only matches a direct child of `.wrap`**. If `nav.toc` is
wrapped inside another element (e.g.
`<div class="wrap"><header><nav class="toc">...</nav></header>...</div>`), the result is:
`.wrap:has(nav.toc)` still matches and still switches on two-column grid mode (because `:has()`
doesn't care about depth), but `.wrap>nav.toc` fails to match at all — the `<header>` wrapper (which
is now the "direct child") gets pushed into column 2 along with everything else. The end result is
the page rendering as effectively a single column (everything, including the TOC, piled into
column 2), with an empty 230px-wide left column that has nothing in it — a "silent page that
renders with no sidebar," as described above. `nav.toc` must always be written as the first direct
child of `.wrap`, with no wrapper in between.

### `ol.stages` becomes a bento grid at 880px

At ≥880px screens, `ol.stages{grid-template-columns:repeat(3,minmax(0,1fr))}` turns the vertical
list into a 3-column tile grid, and each `<li>` switches to `display:flex;flex-direction:column`
(from letting content float via `position:absolute` on narrower screens). `.st-n` (the stage
number) switches from `position:absolute` to `position:static` and moves into the normal flow;
`.get` (the `.gtag` label column) switches from absolute to static the same way. The first card of
each `<ol class="stages">` (one list per group — "early game"/"mid game"/"late game") is
deliberately made double-width via `:first-child{grid-column:span 2}` — an intentional visual beat,
not a bug.

---

## 4. Traps — what actually broke, and how it was fixed

This list is collected from the explanatory comments inside `games/ffx/assets/css/style.css`,
`games/ffx/assets/css/art.css`, and `games/ffx/assets/css/gimmicks.css`, recording what was tried,
what broke, and how it was fixed — written down so whoever comes later doesn't walk into the same
bug again.

1. **A `z-index` on `.wrap` caps every descendant underneath it.** `.wrap` was once given its own
   stacking context (by setting a `z-index` on it). What broke: a tooltip inside `.wrap` could
   never float above the sticky progress bar (`z-index:20`), no matter how high the tooltip's own
   `z-index` was set, because a descendant inside one stacking context can never "break out" above
   its own ancestor's level. The fix: `.wrap` deliberately has no `z-index` at all.

2. **Gradient text on item names broke into a solid block.** An inset box-shadow, then a
   `background-clip:text` gradient, were both tried to give item names a "metallic ink" look. What
   broke: once `background-clip` got reset from somewhere else in the file, the gradient that used
   to clip to the letter shapes instead painted as a solid coloured box on top of all the text,
   making the item name completely invisible. The fix: use heavy `font-weight` plus a real
   `text-decoration:underline` instead (`.chk .it, td .item, td .n, td .nm`) — never touch
   `background-clip` again.

3. **A long `:not()` chain in the link-colour rule silently outran `.active`'s specificity.** The
   rule `a:not(.navbtns a):not(.gt):not(.nm):not(.active):not(.sec-done):not(.sec-part){color:
   var(--purple)}` measures specificity (0,4,2), because every argument inside a `:not()` counts
   toward the rule's own specificity. Without `:not(.active)` in that list, this purple rule would
   silently beat `nav.toc a.active`, which only measures (0,2,2) — no error, no warning. The
   result: a highlighted TOC link's purple gradient background would lose its white text, measuring
   contrast as low as 1.01:1 across 29 files. The fix: always add `:not(.active)` to the exclusion
   list whenever a new highlight state is added to links — and for the exact same reason,
   `.sec-done`/`.sec-part` must also be in the exclusion list of both the plain link-colour rule
   (the main colour section) and the `--cyan-text` rule (the accessibility section), or the sidebar
   link's "section done" state gets silently reset back to its normal colour as if nothing had
   happened.

4. **`grid-row` for the sidebar rail broke three times in a row.**
   - First attempt: `grid-row:1`. What broke: the rail's full height became the thing that set
     row 1's height, so the first content block, being shorter than the rail, ended up with as
     much as 567px of empty space beside it.
   - Second attempt: `grid-row:1/-1` (hoping to "span every row"). What broke: `-1` only refers to
     the end of the **explicit grid**, but every row in this layout is purely **implicit** (no
     `grid-template-rows` is declared), so `1/-1` collapsed right back down to a single row — the
     exact same problem as the first attempt.
   - The actual fix: `grid-row:1/span 999`. `span 999` forces the span across implicit rows for
     real, no matter how many rows there end up being.

5. **`height:0` collided with `flex-wrap:wrap`, scattering the menu horizontally.** `height:0` was
   tried on the rail to "fix" its excess height. What broke: `nav.toc`'s base rule already had
   `flex-wrap:wrap`, and once the height was 0, each link got pushed to wrap into its own column one
   at a time, scattering the whole menu sideways instead of stacking it vertically. The fix: never
   shrink the height to 0, and set `flex-wrap:nowrap` on the sidebar variant of `nav.toc` instead.

6. **The `padding` shorthand wiped out a previously-set `padding-left`.** The checkbox in
   `.pick .chk` is positioned absolutely at `left:17px`, 23px wide, so the label needs enough
   `padding-left` to clear that box. What broke: at one point a `padding` shorthand was written a
   second time over the same rule, resetting the left side back down to just 14px, so the label
   text ran and overlapped underneath the checkbox. The fix: write a single shorthand that states
   all four sides explicitly in one place (`.pick .chk{padding:11px 16px 11px 54px}`), so no other
   rule can come along later and change just one side without anyone noticing.

7. **`!important` was needed to defeat the site's own scroll-driven reveal animation.** There used
   to be a reveal system that let content gradually appear as the page was scrolled to (`.rv`
   starting at `opacity:0`, then faded in by JS). What broke: the very first section of a page
   already sits at the top of the viewport as soon as the page finishes loading, so the
   scroll-based timeline always computed its progress as 0 and never revealed it at all — readers
   saw an empty gap up to 615px tall exactly where the first content block should be. A game guide
   has to be readable while playing; content must never disappear or arrive late. The fix: force
   `opacity:1!important;transform:none!important;filter:none!important` to permanently disable the
   reveal system. `!important` is necessary because the reveal script writes opacity/transform
   values directly via inline style, which always beats a plain rule unless it's marked
   `!important`.

8. **`!important` is necessary because of file load order.**
   `.art-hero-crest{display:none!important}` in style.css needs `!important` because `art.css` and
   `gimmicks.css` are `<link>`ed **after** style.css on every HTML page. When two rules have equal
   specificity, whichever file loads later always wins by cascade order — `!important` is the only
   way for style.css to guarantee this element stays hidden no matter what art.css or gimmicks.css
   declares over it.

9. **A class JS attaches to `.boss` itself made a hide-boss rule wipe out every boss on the site.**
   `gimmicks.js` attaches the `gm-wipe` class directly onto the `.boss` element itself (not a child
   wrapper), to trigger a scene-transition effect before a boss fight. What broke: a rule once
   existed that hid `.boss.gm-wipe` entirely, to turn that effect off — the result was every one of
   the site's 53 boss cards disappearing the instant gimmicks.js attached this class. The fix: hide
   only the overlay pseudo-element that effect draws (`.boss.gm-wipe::after`, `.gm-screen-tint`),
   then force `.boss.gm-wipe{display:block!important;opacity:1!important}` to guarantee the boss
   card itself can never again be hidden by its own effect script's class.

10. **Adding `z-index` to an element that is already positioned must not re-declare `position`.**
    While making the whole `ol.stages li` card clickable via `a.nm::after` (a full-card overlay),
    `.st-n`/`.get`/`.ring` needed to be lifted above that overlay with a higher `z-index`. A mistake
    was made by re-declaring `position:relative` on this set of elements while setting the
    `z-index`. What broke: `.get` (the top-right award-label column) was already positioned with
    `position:absolute` from another rule; re-declaring `position:relative` over it pushed it back
    into the normal flow instead, and combined with the card's `overflow:hidden`, the award label
    got clipped away by 63px on a desktop screen. The fix: set only `z-index:3;pointer-events:none`
    on an element that's already positioned elsewhere — don't re-declare `position` again. An
    element that's already positioned accepts a new `z-index` immediately without touching
    `position`.

11. **Margin collapses straight through a wrapper that has no padding (a spacing leak).**
    `section>*:last-child{margin-bottom:0}` was meant to be enough to strip the last child's excess
    margin in every section. What broke: the actual measured gap between sections came out at
    96–163px, when only 64px was intended, because CSS margin "collapses through" any wrapper that
    has no padding/border of its own, all the way up until it hits an ancestor with something solid
    in the way — resetting just one level wasn't enough. The fix: reset `margin-bottom` again one
    level deeper (`section>*:last-child>*:last-child`, and deeper still beyond that), because the
    cross-level collapse can recur at every level that has no padding in between.

12. **A 2-column table looks "split apart" if left to stretch full-width.** `table{width:auto}`
    (letting a table shrink to fit its content) was tried to fix stretched 2-column tables. What
    broke: it genuinely fixed the 2-column case, but it also made every table shrink to its text,
    including wide tables (e.g. a 4-column Attribute table), which now came out shorter than the
    right edge of the card wrapping it, leaving a bare strip of card background visible. The fix:
    default every table to stretch full-width (`.tbl-wrap>table{width:100%}`), then handle "the
    table looks split apart" as a specific case instead — the selector
    `:has(tr>*:nth-child(2):last-child)` (meaning "any row where the 2nd cell is also the last
    cell" = the table has exactly 2 columns) forces a 38%/62% split, but only on tables that
    genuinely have two columns, instead of relying on guessing from content-based shrinking.

13. **A row divider in `dl.kv` must be set on both `<dt>` and `<dd>` together.** `.kv` is a
    two-column CSS grid where `dt`/`dd` are two separate grid items. Setting `border-top` on only
    `.kv dt` draws the divider across just the left half of the row, cutting off on the right half
    (because `dd` is a separate grid item with no divider of its own). The fix: always set
    `border-top` on both `.kv dt` and `.kv dd` together.

14. **A `.term` tooltip got cut off by the `.callout` it was sitting inside.** `.callout` used to
    set `overflow:hidden` to stop the left accent bar from spilling outside its rounded corners.
    What broke: 38 of the site's 209 `.term` instances turned out to sit inside some `.callout`
    box, and the tooltip for those terms, which should float above the box, was instead completely
    clipped away by the parent box's `overflow:hidden` — invisible entirely. The fix: change to
    `.callout{overflow:visible}`, since both the accent bar and the watermark icon already sit
    naturally within the box's padding boundary and never needed `overflow:hidden`'s help in the
    first place.

15. **A `transform` on an ancestor changes how `position:fixed` behaves.** `fx.js` applies a
    parallax `transform` to `header.hero` while scrolling. Per the CSS spec, an ancestor with a
    `transform` becomes the containing block for a `position:fixed` descendant instead of the
    viewport, making `fixed` behave like `position:absolute` relative to that ancestor instead.
    This is why the floating, screen-pinned "back to hub" button (`.fx-home`) **must never live in
    the hero's markup**, or it would float along with the hero's scroll instead of actually staying
    pinned in place. The fix: `fx.js` inserts `.fx-home` as a direct child of `<body>` (entirely
    outside the hero), and hides a fallback link inside `.wrap` (which is never transformed)
    instead — if a page is opened in a way the script can't run, the fallback link inside `.wrap`
    is still there to click back to the hub.

16. **`100vw` counts the scrollbar's width in, causing horizontal overflow.**
    `.art-footer-wave` used to use a full-bleed breakout technique with
    `width:100vw;margin-left:50%;transform:translateX(-50%)`. What broke: in most browsers, the
    `100vw` unit counts the width of the vertical scrollbar into the measurement. Once a page
    actually had a scrollbar, this element ended up wider than the real visible area, pushing the
    whole page to overflow horizontally by as much as 145px. The fix: constrain it with
    `width:100%!important;max-width:100%!important;margin-left:0!important;transform:none!important;
    overflow:hidden!important` instead of relying on `100vw`.

---

## 5. What not to do, and why

This set of rules is a project-wide hard constraint (sourced from the root
[`CLAUDE.md`](../CLAUDE.md)) — this document covers only the aspects that directly affect the
design system.

- **Never put a `<style>` block in an HTML file.** All styling must live only in the shared
  `style.css`/`art.css`/`gimmicks.css`. Reason: these pages open straight from `file://` with no
  build step to merge files together. If every page had its own `<style>`, colour tokens/dark mode
  would drift out of sync the moment someone edited the theme without knowing an override was
  hiding somewhere else.
- **Never set `font-size` via an inline `style=` attribute.** Use `data-note` or an existing class
  instead. Reason: font sizes scattered across inline styles in dozens of files is exactly what
  made it necessary to consolidate everything into `[data-note]` in the shared stylesheet in the
  first place (see section 27 of style.css) — doing it the old way again would bring the same
  problem back.
- **Never write a fixed hex colour inside an SVG diagram.** Only use a theme token (`var(--ink)`,
  `var(--cyan)`, `currentColor`). Reason: readers can switch between dark/light mode at any time. A
  fixed hex colour won't change with the theme and instantly becomes an invisible/unreadable spot
  the moment the theme doesn't match the hardcoded colour. (A real example of this mechanism in the
  system: `.callout::after`/`.story::after` use `-webkit-mask-image` with an SVG data-URI painted
  with `stroke='black'`/`fill='black'` inside the SVG itself, but masking makes the colour that
  actually renders on screen come from `background:var(--green)`/`var(--red)`/etc. outside the SVG
  instead — this technique is the "standard" way the whole file lets icons switch colour with the
  theme without needing two copies of the SVG file.)
- **Never introduce a new colour that isn't an existing token.** The whole system follows the rule
  "colour carries meaning, it isn't decoration" (recorded directly in the comment heading the
  colour section of style.css) — purple is the single lead colour, gold is a sparingly-used
  highlight, red/green are reserved strictly for "you'll lose this" and "you already got this." If
  the next game needs a new meaningful colour (e.g. an element/character-class colour the original
  system doesn't have), add it as a new token in section 1 of this file (with a light/dark pair,
  and a `-text` variant if it'll be used as text colour) — never paste a new hex value straight
  into a page. That's what lets the new colour switch between dark/light mode the same way every
  other colour in the system does.

---

*This document covers visual structure only, not content-writing rules — read
[`content-model.md`](content-model.md) alongside it for play-order/checklist/`data-k` rules, and
read [`verification.md`](verification.md) for how to check whether a newly-built page passes
standard.*
