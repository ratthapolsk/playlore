# tools/ — verification harness

Every check here works on any game folder under the repo root (a game folder is a
direct child directory that contains `index.html`). Run `node tools/verify-all.js` to
run everything at once — see the usage examples there. Every tool also runs standalone
as `node tools/<name>.js [game]`, where `[game]` is optional and defaults to every game
folder found.

Checks that launch a browser (`tblfit.js`, `sidebar-check.js`, `stability.js`,
`dark-check2.js`, `completion-check.js`) need Playwright, and `dark-check2.js` also needs
`pngjs`. Both are expected to be installed **globally**, not as a repo dependency (this
repo intentionally has no `package.json`/`node_modules` — see CLAUDE.md). If a plain
`node tools/<name>.js` can't find them, set `NODE_PATH` to your global npm root first
(`NODE_PATH=$(npm root -g) node tools/tblfit.js`, or on Windows PowerShell
`$env:NODE_PATH = npm root -g`); the tools also try to locate the global install
themselves as a fallback, so this is normally not needed.

`tools/lib/repo.js` is shared plumbing, not a check on its own: it defines what counts
as a "game folder", resolves every path from the repo root (never from whatever
directory the tool happened to be launched from), builds correct `file://` URLs for
Windows paths that contain spaces and Thai characters, and detects each game's
localStorage key prefix by reading its own script instead of assuming "ffx". Read it
before adding a new check.

## tools/verify-all.js

Runs every check below and prints one PASS/FAIL summary with a non-zero exit code if
anything failed. `node tools/verify-all.js` checks every game; `node tools/verify-all.js
ffx` checks one; add `--fast` to skip the checks that need a browser. Structural checks
(no browser) always report first, so a broken tag or a duplicate `data-k` is visible
immediately instead of waiting behind several minutes of browser checks.
`tools/sync-totals.js` is deliberately **not** included — it writes to `index.html`
rather than checking anything, and a verify step must never mutate the repo as a side
effect.

## tools/tags.js

Scans every page's raw HTML (no browser) for three things: unbalanced tags (an open
count that doesn't match its close count, for `div`, `section`, `ul`, `ol`, `li`,
`table`, `dl`, `p`, `span`, `h2`, `h3`, `h4`), duplicate `data-k` checkbox keys, and a
bare `·` anywhere in the page (the project's separator is `" – "`, never `" · "`). Run:
`node tools/tags.js [game]`. A failure means either a stray/missing closing tag broke the
document structure somewhere after it, or two checkboxes silently share one saved-state
key, or a separator needs converting to the house style.

## tools/tblfit.js

Loads every page in a real browser and measures whether each `<table>` fills the
`.tbl-wrap` card it sits inside, instead of leaving a dead strip of empty card down one
side. Run: `node tools/tblfit.js [game]`. A failure lists the file, which table on the
page, and how many pixels of the card are going unused — worth a look at the table's
column widths or the card's own width calculation.

## tools/sidebar-check.js

Loads every page except `index.html` (the landing page, which never has one) and checks
that the in-page table of contents renders as the sticky sidebar rail: a `<nav
class="toc">` that is a **direct child** of `.wrap` and computes to `position: sticky`.
Run: `node tools/sidebar-check.js [game]`. A failure means the sidebar silently
disappeared on that page — nothing errors, the links still work, the reader just loses
the rail — usually because the nav ended up wrapped in an extra element or moved outside
`.wrap`.

## tools/stability.js

Loads every page (or the ones named on the command line), waits past the reveal
animation, scrolls through it, and measures cumulative layout shift, invisible text
(content stuck below 0.9 opacity while still taking up space), horizontal overflow, and
whether the shared controls (theme toggle, floating buttons, and — when present — the
reset button, in-page nav, prev/next nav) have a real, tappable hit target. Run:
`node tools/stability.js [game] [file...]`. A failure means the reader experiences the
page jumping under them, text they can't read, a sideways scrollbar, or a button that
looks clickable but isn't.

## tools/dark-check2.js

Ticks about half the checkboxes on the game's most checkbox-heavy page, then measures
the contrast of the sidebar's three completion-state colours (done / partial /
untouched) from the **actual painted pixels** of a screenshot, in both light and dark
theme, after waiting 1.5s for the colour transition to finish. Run:
`node tools/dark-check2.js [game]`. A failure (ratio below 4.5:1, WCAG AA for normal
text) means a reader with the theme in question genuinely cannot read that state's
colour against its background — see docs/verification.md for why this one measures
pixels instead of computed CSS colours.

## tools/completion-check.js

Proves — rather than assumes — that a finished stage, a half-done stage, and a stage the
reader has never opened actually render as three visibly different things: on the stage
page's own sidebar (ticking every box must produce a `.sec-done` link in a different
colour from an untouched one) and on `index.html`'s stage cards (seeding a mix of
finished/half/absent stats must produce three distinct card states). Run:
`node tools/completion-check.js [game]`. A failure means the visual state a reader relies
on to see their own progress doesn't actually track their progress.

## tools/density.js

A pure text scan (no browser, always passes) reporting KB of page content per checkbox
for every numbered stage page, flagged against the game's own median. This is a survey
for a human to read, not a gate — CLAUDE.md is explicit that some scenes genuinely have
nothing to collect. Run: `node tools/density.js [game]`. Use it to spot a stage that
looks unusually thin and decide by reading the page whether that's the honest truth or a
missed pickup.

## tools/gloss-survey.js

A pure text scan (no browser, always passes) reporting which pages' glossary section
(`<section id="gloss">`) wraps its `<dl class="kv">` in the canonical `.card`, and which
still have a bare `<dl>`. Run: `node tools/gloss-survey.js [game]`. Use the "needs the
card wrapper" list to find pages that drifted from the shared pattern.

## tools/sync-totals.js

Not a check — a writer. Reads every stage page's real, current checkbox count and stamps
it onto the matching `<li data-total="...">` in `index.html`, so the overall progress bar
on the landing page has a correct denominator even for a stage the reader has never
opened. Run this by hand after adding or removing checkboxes on a stage page:
`node tools/sync-totals.js [game]`. It is idempotent — running it again with no content
changes leaves `index.html` byte-for-byte unchanged.
