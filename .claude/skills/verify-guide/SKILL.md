---
name: verify-guide
description: Proves a walkthrough page or game folder is actually correct by running the repo's verification harness (node tools/verify-all.js) and reading its failures properly, then re-running node tools/sync-totals.js when checkbox counts changed. Use before claiming any page is done, after editing or generating HTML in a game folder, when a check fails and you need to know what it means, or when the user says "ตรวจ", "verify", "รัน harness", "เช็กให้หน่อยว่าถูกไหม", "is this done". States the principle that a visual or structural claim is never made from reasoning, and the corollary that a harness result contradicting something known-good means suspect the harness first.
---

# Prove the work

**"Done" means measured, not believed.** `CLAUDE.md` §6.

Never claim a visual or structural result from reasoning. You cannot tell by reading HTML
whether the sidebar renders, whether text is invisible against its background in dark mode,
whether a table overflows horizontally, or whether a control is wired to anything. Those are
runtime facts. Run the harness and report what it printed.

This applies to your own edits and to anything you are asked to review. "The markup looks
right" is not a result. "`verify-all.js ffx` passed with 0 failures" is.

---

## Run it

```bash
node tools/verify-all.js            # whole repo
node tools/verify-all.js ffx        # one game folder
```

Run the single-game form while iterating, and the whole-repo form once before handing off —
a shared asset edit in one folder can break a different game.

After adding or removing checkboxes on any page:

```bash
node tools/sync-totals.js
```

This rewrites the `data-total` attribute on each `<li>` in every game's `index.html` from the
real checkbox count of the page it links to. `data-total` is the denominator of the index
progress readout, so skipping this leaves the reader looking at `7/12` on a page that has
nine checkboxes. **Never hand-edit `data-total`** — let the tool write it, then re-run
`verify-all.js`.

If `tools/verify-all.js` is not on disk yet, say so plainly and report which checks you were
able to run by hand instead. Do not silently skip verification and do not substitute your own
one-off script for the harness — a check that only ran once, in one agent's head, is not a
harness.

---

## What each failure means

The harness checks tag balance, duplicate or lost `data-k`, the forbidden separator, table
fill, sidebar presence, layout shift, invisible text, horizontal overflow, dead controls, and
colour contrast in both themes. `docs/verification.md` holds the thresholds and how to add a
check; this is what to *do* when one fires.

**Tag balance.** One more `<section>` than `</section>`, or a stray `</div>`. The browser's
parser recovers from it in a way that rarely matches what you intended, so it never throws
and never shows up by eye — everything nested after the break silently lands in the wrong
place. Find the unbalanced element type the check names, then bisect the file. Do not "fix"
it by adding a closing tag at the end of the file; find where the nesting actually went
wrong.

**Duplicate `data-k`.** Two checkboxes share a key, so ticking one silently ticks the other
and the reader can never work out why. Rename the *newer* one. Never renumber the older key —
it already holds reader progress.

**Lost `data-k`.** A key that existed before your edit is gone. This is the one unrecoverable
failure: that key is a reader's saved progress. Restore it. If you believe the checkbox
genuinely should not exist, report it and leave it in place — `CLAUDE.md` §4.

**Forbidden separator.** A bare `·` in page text. The project separator is `" – "` — spaced
en dash. A middle dot is the mark of an unconverted separator. Replace it; do not add an
exception.

**Table fill.** A table has empty cells that carry no meaning. Either fill the value, or put
`—` in it *and* add the `data-note` line saying `—` means "no confirmed data", not "nothing
there". An unexplained blank cell reads as "this fiend drops nothing", which is a wrong fact.

**Sidebar presence.** `nav.toc` is missing, or not a direct child of `.wrap`. At the desktop
breakpoint `.wrap:has(nav.toc)` becomes a two-column grid — `:has()` matches at any depth —
but the rail placement rule is `.wrap > nav.toc`, a child combinator. Nest the nav one level
deeper and the page switches to two columns while the nav stays in the content column: the
sidebar does not render, and nothing errors. Move the `<nav class="toc">` back to being an
immediate child of `.wrap`.

**Layout shift.** Something moves after load. Usually an image or SVG without reserved
dimensions, or content revealed by script rather than present on load. Every page must be
readable with JavaScript doing nothing — `CLAUDE.md` §1.

**Invisible text.** Text whose colour matches its background in one of the two themes. Almost
always a hardcoded hex colour instead of a theme token. Replace it with `var(--ink)`,
`var(--cyan)`, `currentColor` or the appropriate token, and check both themes — a colour that
is legible in light mode and gone in dark mode is the standard shape of this bug.

**Horizontal overflow.** The page scrolls sideways, usually from a wide table or a long
unbroken code-like string. Fix it in the shared stylesheet or by letting the wide element
scroll inside its own container — never by adding an inline `style=` that sets `font-size`,
which the project forbids.

**Dead controls.** A button or input that no script is bound to. Usually a renamed attribute:
`app.js` binds the reset button by `data-reset`, the progress readout by
`data-progress="all"`, the per-section counter by `data-count`, and the checkboxes by
`data-k`. Restore the attribute name rather than rewriting the script.

**Colour contrast, both themes.** Text that is technically visible but below the contrast
threshold. Same cause and same fix as invisible text.

---

## When a result contradicts what you know

**When a harness result contradicts something you already know to be fine, suspect the
harness first.** That has been the correct call every time so far in this repo, and the code
carries the scars: `tools/tags.js` documents an earlier version whose open-tag pattern was
generated through a bash heredoc that ate one level of backslash escaping, silently turning
the character class `[ >]` into `[s>]`. The broken check still matched most real tags — enough
to look like it worked — while reporting false mismatches on some files. A comment now tells
the next reader never to "simplify" that class.

So when a check fails on a page you have good reason to believe is correct:

1. **Reproduce it on a file you are certain about.** Run the same check against a known-good
   `games/ffx/` page. If it fails there too, the harness is wrong.
2. **Read the check's source before touching the page.** The bug is usually in a pattern, a
   path resolution, or an escaping layer — not in the thing it is accusing.
3. **Never make the page worse to satisfy a check.** Do not delete content, drop a `data-k`,
   or flatten markup to get a green result. A green harness over a damaged page is the worst
   outcome available.
4. **Fix the harness, then re-run everything.** A harness bug that produced false passes may
   have been hiding real failures elsewhere, so re-run the whole repo, not just the file that
   caught it.
5. **Write the trap down.** Add the explanation to `docs/lessons.md` and, when the fix is a
   line that looks wrong-but-is-right, a comment at the line itself. The point of the lessons
   file is that nobody pays for the same trap twice.

The mirror-image case still holds: a check that *passes* is not proof the page is good. The
harness checks structure and rendering, never whether a boss's HP is the right number. Facts
are verified by the `game-fact-check` skill, not by this one.

---

## What to report

State the command you ran, its result, and the numbers — not "verified".

- The exact commands and whether each passed.
- `data-k` count before and after your edit, per file you touched.
- Whether `sync-totals.js` changed any `data-total`, and which.
- Every check you could not run and why.
- Anything you found wrong in content you did not own, reported rather than edited.

**Do not commit**, even when everything passes — `CLAUDE.md` §8.
