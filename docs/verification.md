# Verification

This document explains what each harness in `tools/` proves, what threshold it uses and
why, how to run it, how to add a new check, and the "suspect the harness first"
principle – which has already caught a real false positive from the harness itself.

The principle behind every entry here is the sentence in `README.md`: **"verifying that
work is actually done means running the harness, not reading the code and drawing your
own conclusion."** Every number in this document comes from an actual run of `tools/`
against the real `games/ffx/`, never from an estimate based on reading the code.

## How to run

```
node tools/verify-all.js            all games (every top-level folder that has an index.html)
node tools/verify-all.js ffx        one game only
node tools/verify-all.js --fast     skip the checks that need a browser (faster, but checks less)
```

`verify-all.js` runs the checks that don't need a browser (`tags`, `density`,
`gloss-survey`) first, because they finish in a fraction of a second, then the checks
that open Chromium through Playwright (`tblfit`, `sidebar-check`, `dark-check2`,
`completion-check`, `stability`), which are much slower – a full run against the whole
of `games/ffx/` (36 HTML files as last measured) takes around four to five minutes,
most of it spent in `stability.js`, which has to load every page and wait out its
reveal-animation window one page at a time. If you just want a quick read while
iterating, use `--fast` to skip the browser checks for now.

`tools/sync-totals.js` is not part of `verify-all.js`, because it is a **writer**, not a
check (it edits `index.html`) – a verify step must never mutate a file as a side effect.
Run it separately after adding or removing a checkbox on a stage page:
`node tools/sync-totals.js [game]`. It is idempotent – running it again with no content
changes leaves `index.html` byte-for-byte unchanged.

## What each check verifies, its threshold, and why

### tags.js – unbalanced tags, duplicate data-k, the forbidden separator

Counts opening tags (`<div`, `<section`, `<table`, …) against closing tags (`</div>`,
…) for the main element types on every page. A mismatched count means a tag went
missing or a stray one was left behind somewhere – the browser's parser "repairs" the
structure on its own, silently, according to its own parsing rules, and the result
rarely matches what the author actually intended, with no error visible anywhere. The
threshold is **must match exactly, zero tolerance** – this is plain syntax, correct or
not, with no "close enough".

It also checks for duplicate `data-k` values (two checkboxes sharing one key, so ticking
one silently ticks the other with no way for the reader to tell), and for a bare `·`
anywhere in the page text that is not part of the project's `" – "` separator convention
(see `CLAUDE.md`/`README.md`).

**A trap that actually happened:** the opening-tag pattern must be written as the literal
character class `[ >]` (a space or a `>`) – **never as the regex shorthand `\s`**. Once, a
bash heredoc that generated the file ate one level of backslash escaping without anyone
noticing, turning `[ >]` into `[s>]` (a class matching a literal `s` or `>`). The result
was that the check reported false mismatches across every file – always write this
character class out literally, never "shorten" it to `\s`.

### tblfit.js – does every table fill its card?

Opens every page in a real browser and measures whether each `<table>` fills the width
of the `.tbl-wrap` card it sits inside (the card that gives a table its rounded border
and horizontal scroll). A table narrower than its card leaves a dead strip of empty card
down one side, which reads as a layout bug even though nothing has actually overflowed.

**Threshold:** more than **12px** of unused space counts as a fail – this number came
from hand-tuning during the session that first caught this class of bug. A few pixels of
slack is normal, from rounding of the rounded border landing slightly differently between
rows, but past 12px it is visible to the naked eye when actually reading the page.

### sidebar-check.js – the sticky sidebar rail must be present on every long page

The stage-page sidebar is rendered by the selector `.wrap > nav.toc` (it must be a
**direct child** of `.wrap`) at `position: sticky`. If `<nav class="toc">` ends up
wrapped in one more element, or moved outside `.wrap`, that page silently loses its
sidebar with no error at all – the links inside it still work, the reader simply has no
side menu. The threshold is that **all three conditions must hold at once** (direct
child of `.wrap`, has an `nav.toc`, and computed `position` is `sticky`) for a page to
count as passing.

`index.html` (the landing page) is deliberately exempt, because it is a grid of stage
cards rather than a long, narrative page, and by the project's own scaffold it never has
a `<nav class="toc">` in the first place – actual result against `games/ffx/`: 35 pages
checked (every page except `index.html`), all 34 passed.

### stability.js – layout shift, invisible text, horizontal scroll, dead controls

**Layout shift (CLS):** the pass threshold is CLS **≤ 0.1** after the page has finished
loading. That 0.1 is the boundary for a "good" score under the widely-used Core Web
Vitals standard – but the stronger reason comes from the project's own rule: `CLAUDE.md`
requires that "every page must work with JavaScript doing nothing: content is visible on
load, never revealed by an animation." When a page is static like that, content appears
all at once from the start, so there is barely ever a legitimate reason for layout to
shift after first paint – if it happens, it's a real bug, not intended behaviour. 0.1
leaves a little headroom for a font swap or sub-pixel rounding without masking a real
problem.

**Invisible text:** an element that has real text content but whose computed opacity is
below **0.9** while still `display`-ed (not `display:none`) counts as a fail – 0.9 rather
than 1.0 leaves room for the anti-aliasing of text that is genuinely fully opaque;
anything visibly below that is usually a reveal animation stuck mid-way, never finishing.

**Horizontal overflow:** more than **1px** counts as real overflow – this number is
deliberately strict, because a guide page should never need a sideways scroll to read at
all. The 1px is only headroom for sub-pixel rounding, not a real tolerance for anything
else.

**Dead controls:** the buttons/links the shared script (`fx.js`) injects into **every
page unconditionally** (the theme toggle, the two floating buttons) must have a real hit
target of at least **20×20 CSS px**. Controls that only exist on some pages (the reset
button, in-page sidebar links, prev/next navigation) are only checked when they are
**actually visible on that page** – their absence on a page with no checklist or no
sidebar is not a bug.

**A trap hit while porting this script:** `.navbtns .home` (the back-to-index link baked
into the markup) is deliberately hidden with `display:none` via JavaScript the moment
`fx.js` injects the floating `.fx-home` button in its place (a comment in `fx.js` says
outright: "exactly one home affordance per page"). An earlier version of the check that
only looked at the first instance of the selector would find this hidden element and
report a false "dead button" immediately. The ported version skips any instance that
isn't visible first, and only checks whether the visible instance has a usable hit
target.

### dark-check2.js – completion-state colour contrast, measured from real pixels, not calculated by hand

This is the single most important worked example of the **"suspect the harness first"**
principle.

During the session this work was done in, the contrast of the sidebar's colours
(the done/partial/untouched states) was once computed by hand from the CSS background
declared in the stylesheet. The result said one link colour – **one that had already
been checked and confirmed correct** – "failed" at a contrast of only 1.54:1. The cause
was that the sidebar and the page background are several layers of semi-transparent
panels stacked over an animated gradient; blending those layers by hand, one layer at a
time, skewed the result far too close to white – **even in dark mode**.

A contradiction like that (a tool says it's broken, while you already know it's correct)
is the warning sign that **the tool itself is wrong, not the stylesheet** – a lesson that
generalises well beyond this one check: when a harness's result conflicts with something
you already know to be correct, suspect the harness first, always. Do not rush to "fix"
the real code just because the harness said so.

The fix in `dark-check2.js` was to stop calculating anything by hand at all, and instead
**screenshot the actual element and read the darkest and lightest pixels the browser
really painted** to compute contrast from those two pixels directly – no modelling, no
assumption about how the layers blend. **The pass threshold is 4.5:1**, the standard
WCAG AA threshold for normal-sized text.

**A timing trap:** colour readings must wait **1.5 seconds** after the state change that
produces them (ticking a checkbox), because `style.css` puts a CSS transition on the
colour change – reading too soon (say, at 300ms) would catch a colour mid-fade, a value
that **exists in neither the "before" nor the "after" state**.

**A `file://` trap:** if a future check ever needs to know which CSS rule wins the
cascade on a page opened via `file://`, it must **never use
`document.styleSheets`/`sheet.cssRules`** – a stylesheet loaded over `file://` is opaque
to the CSSOM (it throws `SecurityError`). Use the DevTools Protocol instead
(`CSS.getMatchedStylesForNode` via Playwright's `page.context().newCDPSession()`). This
trap does not apply to any of the 9 checks actually ported so far (none of them need to
know about the cascade), but it's recorded here to warn whoever adds a new check that
might need to touch this in the future.

### completion-check.js – proves the three progress states actually render differently

This check does not assume the code that paints "finished / half-done / untouched" is
correct – it simulates the real situation and **measures the rendered result** at two
places:

1. The stage page's own sidebar – tick every checkbox on the page and at least one
   sidebar link must get the class `.sec-done`, with a colour that is **actually
   different** from a link that is genuinely unfinished (checking the computed colour,
   not just that the class name differs, because two different class names can resolve
   to the exact same colour without anyone noticing).
2. The stage cards on `index.html` – simulate 3 states (finished / half-done / never
   opened) through `localStorage`, and the three resulting cards must actually differ
   (class, the done/total number, and the progress ring `.ring`). The three stages used
   for the test are simply the first three real stages that `index.html` lists, not a
   hardcoded stage number, so this works on a new game folder whose stage count differs
   from `ffx`.

The pass threshold is that **the three states must differ in a way that is actually
measurable** (different class, different count, or different ring). If two of the three
states (or more) come out identical, the UI is not actually telling the reader their
progress.

### density.js and gloss-survey.js – survey reports, not pass/fail gates

Neither of these has a fail threshold; both always return PASS, because they are surveys
meant for a human to act on, not a fixed rule:

- `density.js` reports the ratio of content KB to checkbox count for every stage page,
  and flags any page more than 2.2x away from the median – it doesn't fail because
  `CLAUDE.md` states plainly that "some scenes genuinely contain nothing to collect." A
  short or empty checklist can be the honest truth, not a mistake. A flagged page is one
  that **deserves an actual read** to tell whether it's short because that's genuinely
  how the scene is, or because a pickup was missed somewhere.
- `gloss-survey.js` reports which pages wrap their glossary section
  (`<section id="gloss">`) in the standard `.card`, and which are still a bare, unwrapped
  `<dl>`.

**A trap hit with `gloss-survey.js`:** the search has to start from
**`<section id="gloss">`**, not from the heading text ("ศัพท์ควรรู้" / "Terms worth
knowing"), because that same heading text also appears in the page's own top nav (a
jump-to-glossary shortcut link). The first version of this script, which searched from
the heading text, ended up reading the wrong part of the file without realising it –
anchoring on the section's id sidesteps that entirely.

## File paths, spaces and non-ASCII characters

A checkout can live under a path containing both spaces and non-ASCII characters – the
reference checkout sits on a Thai-language desktop. Building a URL by hand-concatenating
strings like `'file:///' + dir + file` breaks the moment it hits a path segment that is
not ASCII or contains a space. `tools/lib/repo.js` solves this by using Node's own
`url.pathToFileURL()`, which percent-encodes correctly on its own, and every path used in
`tools/` is resolved as an absolute path from the repo root, never relying on whatever
directory the user happened to run it from. Every file read/write specifies `utf8`
explicitly, so non-ASCII text round-trips without any character getting mangled.

## How to add a new check

1. Create `tools/<name>.js`, `require('./lib/repo')`, and use `resolveGames(gameArg)` to
   get the list of games to check (never hardcode a game's path).
2. Export an `async function run(gameArg)` that always returns `{ pass, lines }` – `pass`
   is a `boolean`, `lines` is an array of text lines to print (the check itself decides
   pass/fail; `verify-all.js` never interprets the result).
3. Add a CLI entry point at the end of the file, the same way every file in `tools/`
   does (`if (require.main === module) { ... }`), so it can be run on its own with
   `node tools/<name>.js [game]`.
4. If the check needs a browser, add it to `BROWSER_CHECKS` in `tools/verify-all.js`; if
   not, add it to `FAST_CHECKS` instead.
5. If the check is a survey with no fixed pass/fail rule, like `density.js` /
   `gloss-survey.js`, always return `pass: true` and explain in a comment why it should
   not be a pass/fail gate.
6. Test it against the real `games/ffx/` first, and read the result yourself against what you
   can actually see on the page – if the result conflicts with something you already
   know to be correct, go back and re-read "suspect the harness first" above.

## Most recent results, confirmed by an actual run against `games/ffx/`

Measured 2026-08-17, immediately after the repository was restructured into
`games/<game>/{stages,reference,assets}`, by running `node tools/verify-all.js ffx` and
reading its output — not by estimating from the code.

- **tags** – 36 HTML files, all tag-balanced, **657 `data-k` keys**, no duplicates, no
  forbidden separator.
- **tblfit** – **84 tables**, every one filling its card.
- **sidebar-check** – **35 long pages** all carry the sidebar rail; `index.html` is
  exempt by design, because it is itself the menu.
- **dark-check2** – all **6 readings** (3 completion states × 2 themes) clear 4.5:1.
- **completion-check** – finished, half-done and untouched render as genuinely different
  things, both on the stage sidebar and on the landing-page cards.
- **stability** – 36 pages, no layout shift, invisible text, horizontal overflow or dead
  control beyond threshold.

**Result: PASS on all 8 checks.**

Two things about this run are worth keeping, because both were mistakes the harness
itself made rather than faults it found:

- The first run after the restructure **passed in 2 ms with nothing checked**. The file
  walker was still non-recursive, so it found zero pages under the new `stages/` and
  `reference/` folders and reported success over an empty set. **A check that finishes
  suspiciously fast has usually found nothing** — read the file count, never just the
  word PASS.
- `completion-check` then reported a real-looking failure: a finished sidebar link and an
  unfinished one rendering the same colour. The cause was the check itself. It ticked
  **every** checkbox, which fires `ffx:complete`, which triggers the Overdrive
  celebration animation — and the colours were read while a full-screen flash sat over
  the page. Ticking 60% instead, and waiting for the two colours to actually diverge
  rather than for a guessed number of milliseconds, made it correct. **A verification
  step that interacts with the page can change the thing it is measuring.**

