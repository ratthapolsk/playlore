---
name: new-game-guide
description: Scaffolds a new game's walkthrough folder in this repo — picks the folder name, copies the shared assets, rewrites the per-game storage prefix, builds index.html with the stage list, and generates one stage page per chapter. Use when adding a game to the collection, when the user names a game and wants a guide for it, or says "เพิ่มเกมใหม่", "สร้างโฟลเดอร์เกม/ไกด์ใหม่", "new game", "scaffold a guide", "start a walkthrough for X". Encodes the wiring that is easy to get subtly wrong: the theme-boot script in <head>, the localStorage prefix, body data-page, data-k prefixes, script load order, and the nav.toc placement the sidebar silently depends on.
---

# Scaffold a new game guide

This skill takes you from "the user names a game" to a working skeleton that opens from
`file://` and passes the verification harness. It does **not** write walkthrough content —
that is the `stage-page` skill.

**Language:** this file is configuration and is English. **Everything it tells you to write
into a page is Thai prose with in-game terms left in English** (`Sphere Grid`, `Overdrive`,
`Save Sphere`). See `CLAUDE.md` §2.

**Reference implementation:** `games/ffx/`. When any question is not answered here, open a
`games/ffx/*.html` file and copy what it does. Do not invent an alternative.

**Layout, verified against the tree on disk:**

```
games/<game>/
  index.html      the hub page, and the only HTML at the game root
  stages/         NN-*.html — the walkthrough, in play order
  reference/      ref-*.html — lookup pages
  assets/css/     style.css, art.css, gimmicks.css
  assets/js/      app.js, fx.js, art.js, gimmicks.js
  _to_delete/     optional, ignored by every tool (leading underscore)
```

---

## Step 0 — Decide four things before creating any file

Settle these with the user in one short message, then proceed. Do not stall the pipeline
waiting for a reply on anything you can pick a safe default for.

1. **Primary version — decide this first, because every later fact depends on it.**
   `games/ffx/` is **HD Remaster / International**, and PS2-original differences are called out
   only where they genuinely differ. A guide that mixes versions is wrong for every reader.
   Pick the version the user is actually playing, write it into the index footer, and state
   it in the brief given to every agent that writes a page. Once picked, **every fact is
   verified against that version** — a drop table or a boss HP from a different release is
   a wrong number, not a close-enough one.

2. **Folder name** — short, lowercase, no spaces, the way a player abbreviates the game:
   `ffx`, `ff7r`, `bloodborne`. This name becomes the storage prefix in Step 2, so it must be
   unique across every game folder in the repo. The folder itself is created at
   `games/<name>/` (e.g. `games/ff7r/`) — the name and the path are two different things, and
   Step 2's rewrite table and Step 6's verification command both need the plain name, not the
   path.

3. **Storage prefix** — normally the folder name. Everything the reader ticks is saved
   under it. Changing it later erases reader progress, so choose once.

4. **Chapter list** — the ordered list of stages, in play order, each with: number, file
   slug, Thai display name, a one-line "what happens here", and the payoff tags (a summon
   earned, an airship, a puzzle, a permanently missable item). This list is the input to
   both the index and the stage pages. Get it from a walkthrough table of contents and
   verify the ordering against a second source before generating 30 files from it — see the
   `game-fact-check` skill.

Name the file slugs the way `games/ffx/stages/` does: `NN-place-payoff.html`, zero-padded, the
payoff in the slug when there is one — `04-besaid-aeon-valefor.html`,
`18-al-bhed-home-missable.html`, `19-airship-get-evrae.html`. The slug is how the owner finds a
file in a directory listing. These files live in `stages/`, not at the game root.

---

## Step 1 — Create the folder tree and copy the asset set

Create `games/<name>/` with the same subfolders as `games/ffx/`: an `index.html` at the root,
plus `stages/`, `reference/`, `assets/css/` and `assets/js/`. Copy all seven shared assets from
`games/ffx/assets/` into the matching subfolder of the new game — they are shared by convention,
not by reference, because each game folder holds its own copy: a page opened from `file://` can
only load a relative path on the same disk, never a shared location outside its own game folder.

```
assets/css/style.css   assets/css/art.css   assets/css/gimmicks.css
assets/js/app.js       assets/js/fx.js      assets/js/art.js   assets/js/gimmicks.js
```

`app.js` drives the checkboxes and progress counters. `fx.js` drives the theme toggle,
scroll-spy and the index progress readout. `art.js` and `gimmicks.js` are the inline-SVG art
and the page toys. Copy all of them into `assets/js/` (or `assets/css/` for the two
stylesheets); a page that loads only some of them fails the dead-controls check in the harness.

---

## Step 2 — Rewrite the storage prefix (do not skip this)

**The shared JavaScript hardcodes the string `ffx_` as the localStorage prefix.** Every game
folder is served from the same `file://` origin, so two games that both ship the stock
`app.js` write to the same keys: the reader's chapter-1 ticks in one game appear as ticks in
the other, and the settings panel's export/import sweeps both games' keys into one blob.

After copying, replace `ffx_` with `<prefix>_` in **exactly these places**, verified against
the current files:

| File | Line | Literal to rewrite |
|---|---|---|
| `assets/js/app.js` | 3 | `var KEY = 'ffx_' + PAGE;` |
| `assets/js/app.js` | 16, 18 | `'ffx_stats'` (read and write) |
| `assets/js/fx.js` | 136 | `lsSet('ffx_theme', theme)` |
| `assets/js/fx.js` | 749, 777 | `'ffx_stats'`, `'ffx_' + key` |
| `assets/js/gimmicks.js` | 84, 551 | `'ffx_sfx'` |
| `assets/js/gimmicks.js` | 467, 479, 486 | `'ffx_stats'`, the `indexOf('ffx_')` export/import filter |
| `assets/js/gimmicks.js` | 792 | `'ffx_hint_shown'` |

Line numbers drift as the files change — grep for the literal rather than trusting the row.
The scripts now live under `assets/js/`, not at the game root, so the check must walk the whole
game folder rather than globbing one directory:

```bash
grep -rn "ffx_" games/<newgame>/      # must return nothing when you are done
```

The theme-boot script in every page's `<head>` (Step 3) reads `<prefix>_theme` and must match
what `fx.js` writes. If the two disagree, the toggle appears to work and the choice is lost on
every navigation.

---

## Step 3 — The page skeleton

Every page in the folder — index, stage pages, reference pages — starts from this skeleton.
Copy the `<head>` **verbatim** from the file at the matching depth rather than retyping it: the
asset links inside it have a different number of `../` depending on where the new page lives,
and copying the wrong one still opens — unstyled, because the browser silently fails to find
`style.css` at the wrong relative path — which looks like a design problem, not a path problem.

- **Index page** (`index.html`, at the game root) — copy from `games/ffx/index.html`. Its
  asset links have no `../`: `href="assets/css/style.css"`, `src="assets/js/fx.js"`.
- **Stage or reference page** (one level down, in `stages/` or `reference/`) — copy from a file
  such as `games/ffx/stages/27-zanarkand-ruins.html`. Its asset links each need one `../`:
  `href="../assets/css/style.css"`, `src="../assets/js/app.js"`.

The full skeleton with both variants, plus the reference-page variant, is in
[references/page-skeleton.md](references/page-skeleton.md).

Four things in it are load-bearing and break quietly when wrong:

**1. The theme-boot script must be the last thing in `<head>`, inline, and not deferred.**

```html
<script>try{document.documentElement.setAttribute("data-theme",localStorage.getItem("ffx_theme")||"light")}catch(e){document.documentElement.setAttribute("data-theme","light")}</script>
```

It runs before first paint and stamps `data-theme` on `<html>`, so a reader who chose dark
mode never sees a white flash. Substitute your prefix for `ffx`. The `catch` branch matters:
when `localStorage` throws — private browsing, storage disabled — the page still gets a theme
instead of rendering unstyled. **The default is `light`**, in both branches. Moving this
script to the end of `<body>`, adding `defer`, or moving it into `fx.js` reintroduces the
flash; none of those are caught by the harness, so get it right here.

**2. `<body data-page="...">` namespaces the checkbox storage.**

```html
<body data-page="s27">
```

`app.js` reads it as `document.body.dataset.page` and stores that page's ticks under
`<prefix>_<data-page>`. Stage pages use `s01`…`s30` — zero-padded, matching the file number.
Reference pages use their own short tag (`refside`, `refgear`, `refabil`, `primer`).
**A page with no `data-page` gets the fallback `'x'`, and `app.js` then deliberately skips
writing that page's stats, so the index progress bar silently stops counting it.** The index
itself is the one page that correctly has a bare `<body>`, because it has no checkboxes.

**3. Script load order at the end of `<body>`, all `defer`, and all pointing into `assets/js/`:**

```html
<!-- stage or reference page, one level down -->
<script defer src="../assets/js/app.js"></script><script defer src="../assets/js/fx.js"></script><script defer src="../assets/js/art.js"></script><script defer src="../assets/js/gimmicks.js"></script></body></html>
```

```html
<!-- index.html, at the game root — no ../, and no app.js (no checkboxes on this page) -->
<script defer src="assets/js/fx.js"></script><script defer src="assets/js/art.js"></script><script defer src="assets/js/gimmicks.js"></script></body></html>
```

`app.js` first — it restores the ticked state and populates the per-section counters that
`fx.js` then mirrors onto the sidebar. `index.html` omits `app.js` (no checkboxes) and keeps
the other three in the same order.

**4. `nav.toc` must be a *direct* child of `.wrap`.**

```html
<div class="wrap">
<nav class="toc">
  <a href="#miss">พลาดแล้วหายไหม</a>
  <a href="#walk">เดินเรื่องตามลำดับเล่น</a>
</nav>
```

At the desktop breakpoint `style.css` turns `.wrap:has(nav.toc)` into a two-column grid and
pushes every child into column 2, then places `.wrap > nav.toc` into column 1 as the sticky
rail. `:has()` matches a nav nested at any depth, but the placement rule uses the child
combinator. **Wrap the nav in one extra `<div>` and the layout still switches to two columns
while the nav stays in the content column — the sidebar does not render and nothing errors.**
Each `<a href="#id">` must point at a real `<section id="...">` on the page; `fx.js` scroll-spy
and `app.js`'s per-section tick marks both look the link up by that href.

---

## Step 4 — Build `index.html`

Copy `games/ffx/index.html` and edit. It is the only page with a bare `<body>` and no `app.js`.

Each stage is one `<li>` carrying `data-total`, which is the number of checkboxes on that
stage's page. It is the denominator of the index progress readout. The link points into
`stages/`, because `index.html` sits at the game root and the stage files do not:

```html
<li data-total="12"><span class="st-n">1</span><a class="nm" href="stages/01-zanarkand-intro.html">Zanarkand (บทเปิด)</a><span class="ds">tutorial – Sinspawn Ammes</span><span class="get"><span class="gtag gt-quest">เรียนระบบ</span></span></li>
```

Any link to a lookup page — the `guidebar` block, the "อ้างอิง" links — points into `reference/`
the same way: `href="reference/ref-sidequests.html"`.

Set `data-total="0"` on every stage while scaffolding — the pages have no checkboxes yet.
**Never hand-count it.** Once the pages have content, run `node tools/sync-totals.js` and let
it write the real numbers. Group the stages under `<h3 class="sec">` headings the way `games/ffx/`
splits ต้นเกม / กลางเกม / ปลายเกม, and adapt the labels to the game's own act structure
rather than forcing three.

The payoff tags are `<span class="gtag gt-…">`: `gt-aeon` for a summon or equivalent
permanent unlock, `gt-key` for a key item or vehicle, `gt-quest` for a puzzle or side
activity, `gt-miss` for something permanently missable. Keep the legend callout at the top of
the index and rewrite its wording for the new game — a tag the reader has no key for is a
cold-reader failure.

The footer names the primary version from Step 0 and the sources the guide was built from.

---

## Step 5 — Generate one stage page per chapter

Each page gets the skeleton from Step 3 plus:

- `<title>NN — Place (payoff)</title>`
- a `header.hero` with the eyebrow `<Game> – ด่าน NN/<total>`, an `<h1>`, `.badges` for the
  bosses and payoffs, and `.navbtns` linking previous / index / next
- the `.pbar` progress bar block
- `nav.toc` as a direct child of `.wrap`, with one link per section
- a `<section>` per major beat, each with a real `id`
- a closing `.navbtns` repeat before `</div>`

Generate the sections **empty but present**, in play order, with the honest section set for
that chapter. Do not seed placeholder checkboxes — an empty page is honest, a padded page
teaches the next agent to pad. The `stage-page` skill fills them in.

Wire the navigation both ways as you generate: page `NN`'s "next" link and page `NN+1`'s
"previous" link must be created together, or the last page of each batch ends up a dead end.

A stage page (in `stages/`) links out four ways, each at a different depth — get any of these
wrong and the link is dead even though the file it points to exists:

| Target | From a stage page |
|---|---|
| shared CSS/JS | `../assets/css/style.css`, `../assets/js/app.js` |
| the hub | `../index.html` |
| a sibling stage | plain filename, no folder: `26-gagazet-cave.html` |
| a lookup page | `../reference/ref-sidequests.html` |

A reference page (in `reference/`) follows the same rule at the same depth: `../assets/…`,
`../index.html`, a sibling reference page as a plain filename (`ref-gear.html`), and — when the
lookup table cites a specific stage — `../stages/04-besaid-aeon-valefor.html`.

---

## Step 6 — Prove it before handing off

```bash
node tools/verify-all.js <newgame>
node tools/sync-totals.js
```

**Verify the scaffold, not just the verdict.** Always pass the explicit `<newgame>` name — a name
that does not match a real `games/<newgame>/index.html` fails loudly, which is safe. Omitting it
checks *every* game folder the harness can find, and if none resolve yet (for example, `games/`
exists but the new game's `index.html` has not been written yet — it is only created in Step 4)
that is legitimately zero folders, and `RESULT: PASS` still prints in a few milliseconds, because
zero files trivially satisfy every check. That has already happened once, during the move to
`games/`. Before trusting a fast PASS, read the `tags` check's own summary line near the top of
the output: `tags: PASS — N files tag-balanced, M data-k total, …`. Confirm `N` equals the number
of pages you actually generated (index + every stage + every reference page); a PASS with `N` at
`0`, or far below what Step 5 produced, means nothing was checked, not that everything is clean.

Then state, in your report: the folder name, the storage prefix, the primary version, the
number of pages generated, the file count the harness actually reported, and anything you could
not verify. See the `verify-guide` skill for what each failure means.

**Do not commit.** Even when it is finished and verified — `CLAUDE.md` §8.

---

## The Google Fonts link is deliberate — copy it, do not "fix" it

`games/ffx/`'s `<head>` links Google Fonts (`fonts.googleapis.com`). That looks like it
breaks the no-CDN rule, and an earlier version of this skill told you to report it as a
conflict. **It is not a conflict.** `CLAUDE.md` now states the exception explicitly: the
font link is the one permitted remote resource, allowed because it **degrades silently** —
offline the browser falls back and the page stays completely readable.

Copy the head verbatim. The test to apply to any *other* remote resource you are tempted
to add: unplug the network, reload, and the page must still be complete.
