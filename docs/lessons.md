# Lessons — Traps Already Paid For

This document exists to answer one question before you spend tokens finding out the hard
way: **has someone already been burned by this?** It is not a second design system and not
a second verification manual — [`design-system.md`](design-system.md) is the authority on
CSS classes and tokens, [`verification.md`](verification.md) is the authority on what the
harness checks and why, [`verified-facts/README.md`](verified-facts/README.md) is the
authority on the fact-verification protocol, and [`content-model.md`](content-model.md) is
the authority on how a page is written. This document cross-links to all four rather than
restating them, and instead collects the *mistakes* — organised by the kind of mistake, not
by which file it happened in, so it keeps being useful as more games are added.

**Every lesson here is written as a general rule first, with the incident that taught it as
the illustration second** — per the project's own rule that a concept must not be locked to
one game. Where a rule only makes sense next to a Final Fantasy X (`games/ffx/`) example, the
example is there to make the rule concrete, not to limit it to that folder. A second game
folder that copies the shared script/stylesheet pattern inherits every trap below unless it
is specifically guarded against.

Each entry states, in order: **what was tried – what actually happened – what the fix is.**
A distinctive symptom gets its own "how to recognise it" line.

---

## 1. CSS behaviour that surprises

The full worked catalogue of CSS incidents (16 of them, each with the exact rule that broke
and the exact rule that fixed it) lives in [`design-system.md` §4](design-system.md). This
section states the *general mechanism* behind the ones most likely to recur in a second
game's stylesheet, plus one that has not been written down there yet.

- **A stacking context on a purely structural wrapper caps every descendant beneath it.**
  Once an element establishes its own stacking context (for example, by being given its own
  `z-index`), nothing inside it can ever visually rise above content outside that element,
  no matter how high a descendant's own `z-index` is set — a descendant cannot "break out" of
  its ancestor's stacking level. Give a layout wrapper a `z-index` only when it genuinely
  needs one. (`games/ffx/assets/css/style.css` §4 trap 1: `.wrap` once had a `z-index`, and a
  tooltip inside it could never appear above the sticky progress bar.)

- **A long `:not()` exclusion chain adds to a selector's specificity — forgetting to add a
  new state to the list lets a plain rule silently outrank it.** Every argument inside a
  `:not()` counts toward that rule's own specificity, so a broad rule with several `:not()`
  clauses can end up more specific than a narrower, more "important-looking" rule that
  targets one state directly, with no warning at compile time or in the browser console.
  Whenever a new highlighted/active state is introduced, it has to be added to every
  exclusion list that a plain colour rule already carries, or the new state's colour gets
  silently reset. (`games/ffx/assets/css/style.css` §4 trap 3: a highlighted sidebar link's
  white text on a purple background measured as low as 1.01:1 contrast across 29 files
  because `:not(.active)` was missing from one rule.)

- **Spanning "every row" of an implicit grid needs `span <a large number>`, not `-1`.** The
  `-1` grid-line index only refers to the end of the grid's *explicit* rows; if every row in
  the layout is implicit (no `grid-template-rows` declared, which is the common case for a
  content list of unknown length), `1 / -1` collapses back down to a single row. A related
  trap sits right next to it: forcing a spanning item's height down to `0` to "shrink it back
  to content" can collide with a `flex-wrap: wrap` rule declared elsewhere on the same
  element, scattering its children sideways into their own columns instead of stacking them.
  (`games/ffx/assets/css/style.css` §4 trap 4/5: the sticky sidebar rail needed `grid-row:
  1/span 999` — `1/-1` reproduced the original bug exactly.)

- **A shorthand property declared a second time anywhere later in the cascade resets every
  side/value it does not explicitly restate.** Writing `padding: 11px 16px 11px 54px` and
  later writing `padding: 8px 16px` over the same selector does not "adjust two sides" — it
  silently wipes the other two back to the new shorthand's defaults. Write a property's full
  shorthand once, in one place, with every side stated explicitly, so nothing later in the
  file can quietly change one side without the diff making that obvious. (`games/ffx/assets/css/style.css`
  §4 trap 6: a reset `padding-left` let checkbox label text run underneath the checkbox
  graphic.)

- **`transform` on an ancestor changes the containing block for a `position: fixed`
  descendant.** Per the CSS spec, once any ancestor has a `transform` (even a purely
  decorative parallax effect), a `position: fixed` element inside it stops being pinned to
  the viewport and starts being pinned to that ancestor instead, behaving like
  `position: absolute`. Anything meant to stay pinned to the screen — a floating home button,
  a toast — must live outside every ancestor that ever receives a `transform`, not just the
  ones that have one today. (`games/ffx/assets/css/style.css` §4 trap 15: a floating
  "back to hub" button had to be inserted as a direct child of `<body>`, entirely outside the
  hero element that gets a scroll-driven parallax transform.)

- **`100vw` counts the scrollbar's width in, in most browsers.** A full-bleed breakout
  technique built from `width: 100vw; margin-left: 50%; transform: translateX(-50%)`
  measures itself against the *layout* viewport width, which does not subtract the space a
  vertical scrollbar takes up — so the moment a page is tall enough to actually have a
  scrollbar, the element becomes wider than the visible area and the whole page gains
  horizontal overflow. Use `width: 100%` (relative to its containing block) instead of
  `100vw` for anything meant to fill the visible page exactly. (`games/ffx/assets/css/style.css`
  §4 trap 16: measured up to 145px of horizontal overflow from this exact pattern.)

- **`overflow-x: hidden` on `body` alone does not stop a document from growing past the
  viewport.** When `<html>` is left at its default `overflow: visible`, the *body's*
  `overflow` value propagates up to become the viewport's own overflow behaviour, and the
  body element itself reverts to `visible` — so a rule that looks like it clips the page is,
  in the browser's actual box model, clipping nothing at all. Set `overflow-x: hidden` on
  **both** `html` and `body` to actually stop the propagation and make the rule mean what it
  looks like it means. How to recognise it: a page reports a few pixels of
  `document.scrollWidth` overflow that hiding every visibly-suspect child element, one at a
  time, never manages to isolate to a real box — because there isn't one; the propagation
  itself is the cause, and it stays invisible to the eye (the propagated `hidden` still
  suppresses the scrollbar) right up until it silently defeats any measurement that trusts
  `body`'s own computed overflow. Anything that genuinely needs to scroll sideways (a wide
  table) should do so inside its own scrolling container, never by relying on the page-level
  rule being loose. (`games/ffx/assets/css/style.css` §51 — not yet copied into
  `design-system.md`.)

The remaining incidents recorded in `design-system.md` §4 (margin collapsing straight
through an unpadded wrapper, `!important` needed purely because of `<link>` load order,
`overflow: hidden` on a decorative box accidentally clipping a tooltip that needed to escape
it, and re-declaring `position` while only meaning to add a `z-index`) are each a specific
case of the two families above — cascade/specificity surprises, and containing-block or
clipping-context surprises. Read the full worked trace there before touching any of those
mechanisms again.

---

## 2. Measuring things wrongly

A number read from a page that is mid-animation, mid-transition, or genuinely empty is not
the number a reader will ever actually see. These are the ways this repo's own verification
harness got a real measurement wrong before it got it right — general enough to apply to any
check written against an animated, script-driven page, not just this one.

- **Reading a colour mid-transition produces a value that exists in neither the "before" nor
  the "after" state.** If a stylesheet puts a CSS transition on a colour/background change,
  sampling it right after the state change (at, say, 300ms) can catch the colour mid-fade —
  a number that is true of no real moment any reader ever sees. Wait for the transition's
  full duration before reading, not an arbitrary short delay chosen for speed.
  (`tools/dark-check2.js`: waits 1.5 seconds after ticking a checkbox before reading pixel
  colour, matching the stylesheet's own transition length.)

- **Computing contrast by hand from stacked, semi-transparent CSS layers gets the wrong
  answer, even when every individual layer's declared colour is correct.** When a component
  sits on top of several translucent panels stacked over an animated gradient, blending those
  layers by hand, one at a time, systematically pulls the result toward whichever colour is
  underneath (in this case toward white, even in dark mode) — enough to make a colour that
  had already been checked and confirmed correct measure as a near-total failure. **This is
  the sign that the check is wrong, not the page** — see "suspect the harness first" in
  [`verification.md`](verification.md). The fix is to stop modelling the layer stack
  entirely: screenshot the actual rendered element and read the darkest/lightest pixels the
  browser genuinely painted, and compute contrast from those two pixels directly.
  (`tools/dark-check2.js`: a colour already known correct measured 1.54:1 by hand-computed
  layering; reading real pixels resolved it.)

- **A fixed timeout is not a safe stand-in for "the thing finished changing" when two
  different mechanisms both delay the result.** One script may recompute a piece of state
  once per user-input event (so a page with 231 checkboxes runs that recomputation 231 times
  before settling), and the resulting change may *also* be styled with a CSS transition on
  top of that. A short guessed wait can pass on an ordinary page and still false-fail on
  whichever page happens to have the most inputs, because both delays stack. Poll for the
  actual condition the check cares about — not a guessed duration, and not merely "the value
  stopped changing between two reads," because two reads taken *before* a transition has even
  started also look identical and settled. If the underlying styling really is broken, the
  correct behaviour is a timeout, not a false pass. (`tools/completion-check.js`: a 400ms
  wait passed on ordinary pages and reported a false failure only on the game's
  checkbox-heaviest page; the fix polls until a ticked link and an unticked link render
  genuinely different colours.)

- **A value driven by a CSS transition needs its starting frame actually committed to the
  page before the final value is set, or the browser coalesces both writes into a single
  paint and there is no "from" state to animate from.** Setting an element's target style
  immediately after computing it (the natural first approach) can make the transition simply
  snap to the end value instead of animating, because the browser never painted the starting
  value as a separate frame. Force the starting frame to commit — for example, two nested
  `requestAnimationFrame` callbacks — before writing the final value.
  (`games/ffx/assets/js/fx.js`, `renderIndexSummary`: the progress-bar fill is set to `0%`,
  then the real percentage is written only after two rAF callbacks, so the width-transition
  has an actual starting frame to animate from.)

- **An empty or never-populated data source must be actively checked to confirm it reads as
  "nothing recorded" — never assumed to.** A check (or the code it is checking) that quietly
  treats "no data yet" the same as "everything is fine" turns a genuine gap into a silent
  pass. The corresponding good pattern is to seed exactly that case on purpose and assert it
  renders as the honest "untouched" state, not as complete or as an error.
  (`tools/completion-check.js` deliberately leaves one stage entirely out of the
  progress-stats blob, "as if the reader had never opened it," and requires the resulting
  card to render as unfinished — proving the untouched path is real, not merely assumed.) A
  related, more general guard for the same failure shape: `tools/lib/repo.js`'s
  `resolveGames()` raises a loud, named error when asked for a folder that is not a
  recognised game, instead of silently returning zero folders to check — a check that quietly
  examines nothing and a check that genuinely finds nothing to complain about produce the
  same "PASS" on the outside, so the failure mode worth designing against is exactly that:
  make the empty/not-found case loud, whatever kind of check you are writing.

---

## 3. Verification interacting with the page

The safest way to check a UI is to drive it exactly the way a reader would — but the act of
driving it can itself change the very thing being measured, and a check that does not account
for its own side effects will confidently report the wrong cause.

- **Ticking every checkbox on a page can trigger a completion effect that then covers up the
  very thing being measured.** A script listening for "every item on this page is now ticked"
  is a reasonable thing for a page to have, and a check that ticks every box to test the
  "fully done" visual state will trigger it too — in this repo, a full-screen celebration
  overlay. The overlay's own colours got read instead of the sidebar's, producing a
  believable-looking but wrong failure (the rail measured as one specific colour at 100%
  ticked and a different one at 50%, on every single page — which reads exactly like a real
  CSS bug). The fix was to tick only a majority of the boxes on the page (60%), leaving the
  rest untouched — this avoids triggering the "fully complete" celebration at all, and
  incidentally also gives the check the two things it actually needs to compare: one done
  link and one not-done link on the same page. (`tools/completion-check.js`.) **General
  lesson: before scripting "do the maximally thorough version of the user action" into a
  check, ask what else that exact endpoint (100% done, every field filled, every step
  completed) is wired to trigger** — a completion celebration, an autosave, a redirect — and
  either account for its side effect or deliberately stop short of triggering it.

- **Anchor a text/DOM scan on a stable structural marker (an element `id`), never on visible
  heading text.** The same human-readable text can legitimately appear twice on one page — a
  section's own heading, and a same-worded shortcut link in the page's top navigation that
  jumps to it. A scan that searches for the heading's text picks up whichever occurrence
  comes first, silently reading the wrong part of the file with no error. Search from
  `<section id="...">` instead. (`tools/gloss-survey.js`: an earlier version searched from the
  glossary heading text and read the in-page nav link's surrounding markup instead of the
  actual glossary section.)

- **An element that matches a selector but was deliberately hidden by another script must not
  count as "the control."** When two affordances that do the same thing exist by design (a
  markup-baked "back to hub" link and a script-injected floating home button, with the first
  one intentionally hidden the moment the second one is added, so a reader only ever sees
  one), a check that finds the hidden instance and reports it as an unusably small or
  non-existent hit target is technically correct about that one DOM node and wrong about the
  actual page. Filter to visible instances of a selector before judging whether a control is
  usable; an instance that is not visible on the current page is not a bug by itself.
  (`tools/stability.js`, working with `games/ffx/assets/js/fx.js`'s `injectHomeButton`, which
  sets `.navbtns .home` to `display: none` once the floating `.fx-home` pin exists.)

- **A text-generation step in the pipeline that produces a check can silently corrupt the
  check itself, with no error anywhere in the chain.** An intermediate templating step (in
  this case, a shell heredoc) ate one level of backslash escaping while generating an earlier
  version of a check, turning the literal character class `[ >]` (a space or a `>`) into
  `[s>]` (a literal letter `s` or a `>`). The corrupted pattern still matched enough real
  opening tags to look like it worked in casual testing — because many tag names are
  immediately followed by an attribute whose first letter happens not to be `s` — while
  quietly reporting false mismatches on the files where it didn't. Write a character class
  meant to match whitespace out literally (`[ >]`); never "simplify" it to a shorthand like
  `\s` that depends on an escaping layer surviving a generation step unchanged. How to
  recognise it: a syntax-level check that sometimes passes and sometimes fails on files that
  are structurally identical is more likely testing something incidental about the file's
  content (which letter follows a tag) than the thing it claims to test. (`tools/tags.js`.)

---

## 4. Facts and sources

The full protocol (the two-source rule, the `confirmed`/`single-source`/`disputed`/
`superseded` status ladder, and the entry format) lives in
[`verified-facts/README.md`](verified-facts/README.md). These are the specific ways it has
already gone wrong in practice.

- **Meeting the "two independent sources" bar is not sufficient on its own — a new entry must
  also be checked against the entries already in the same file.** Two outside sources can
  agree with each other and both still be wrong, and the file's own existing content can be
  the thing that would have caught it. On 2026-08-16, an entry claiming a particular
  monster-capture requirement needed only "one of each fiend" was marked `confirmed` on two
  agreeing outside sources, while a different entry already in the same file stated a
  contradicting quota for a related requirement ("capture 4 of each" of one fiend type) — a
  direct contradiction that nobody checked for before publishing. The wrong figure reached a
  live guide page and made the task look far smaller than it actually was, before a later
  research pass caught the contradiction. **Grep the ledger for the terms a new entry
  touches, every time, even when the new sources feel solid.**

- **A blocked fetch (HTTP 402 or 403) is evidence of nothing about the underlying fact.**
  Several otherwise-good source sites in this project refuse automated fetch requests
  outright. Reporting "could not fetch this source, so the fact is probably false" treats an
  access error as if it were data, which it is not. For a domain known to block automated
  fetches, use search-result-snippet extraction instead of a direct fetch, and record in the
  entry that it was read that way. (Sites confirmed to fetch cleanly:
  `jegged.com`, `game8.co`. Sites confirmed to block direct fetches:
  `finalfantasy.fandom.com` returns 402; `gamerguides.com`, `strategywiki.org` and
  `gamefaqs.gamespot.com` return 403.)

- **A tool's own paraphrase or summary of a source is not the source, and does not count as a
  second, independent data point.** A fetch-and-summarise pass over one guide page rendered a
  figure ("ten of every fiend") that contradicted both what that same source page and two
  other independent sources actually stated. Treating the summary as a third, disagreeing
  position would have been wrong — it was a bad paraphrase of a source that, read directly,
  agreed with the other two. Log the discrepancy so it is not rediscovered, but do not let an
  AI-generated summary of a page stand in for reading the page.

- **Two agents can each state a wrong fact with identical confidence — confidence is not
  evidence and does not correlate with correctness.** An agent that guessed states its guess
  in exactly the same tone as an agent that actually checked two sources, so when two agents'
  claims disagree, the resolution is never "pick the one that sounds more sure" or "average
  them." Go back to the sources yourself. (A Blitzball-mechanic disagreement between two
  agents in this repo was settled this way on 2026-08-15 — see the "Two agents in this repo
  contradicted each other" note in `docs/verified-facts/ffx.md`.)

- **The same fact stated in two different places eventually drifts and contradicts itself,**
  the moment one of the two copies is corrected and the other is not. A stage page and a
  reference page (or two stage pages) that each restate the same number independently are two
  places a future correction has to remember to touch; a stage page linking to the reference
  page's single authoritative copy is one. (`docs/content-model.md` §9: "the same fact written
  in two places is a fact that will eventually contradict itself, which has already happened
  once in this repo.")

- **A player's own console outranks every website.** The moment someone actually playing
  reports something different from a recorded fact, the fact — not the player — is wrong
  until it is re-verified.

- **Never delete an entry to correct it.** Mark the old one `superseded`, write the new one,
  and say which pages were written against the old value, so it stays visible which published
  content might still carry the stale number. Deleting the old entry hides that trail
  entirely.

---

## 5. Working with agents

- **One file, one owner, always.** Two agents editing the same file do not merge — the second
  write silently wins, and the first agent's work is gone with no error and no diff to notice
  it by. Every agent needs an explicit "you own exactly these files, and nothing else" line,
  including for shared assets (a stylesheet or shared script gets one owner for the whole run,
  or no owner at all).

- **An agent that finds a problem in a file it does not own reports it — file, location,
  current text, proposed text, evidence — and never edits it.** A "helpful" cross-file fix is
  indistinguishable, after the fact, from an ownership collision. The orchestrating agent
  applies a verified cross-file fix only after the owning agent has finished its own work,
  never while it is still running.

- **Check an agent's actual tool list before assigning it fact-finding work — do not assume
  from its role.** A role built for implementation or writing rather than research can ship
  with file/shell tools only and no web search or fetch at all. An agent without web access
  does not refuse a fact-finding task; it produces confident, plausible, unverifiable content
  that reads identically to verified content until someone actually checks it — which is the
  exact failure a fact-heavy project cannot absorb.

- **Verify a claim against the source of truth, never against the agent's own summary of what
  it did.** "Added 9 checkboxes, all verified" is a claim, not a result. Counting the keys
  yourself (`grep -c 'data-k="' <file>`), or the verification harness's own output, is the
  result.

- **A convention baked into a reference implementation can itself conflict with a hard project
  rule — report the conflict, do not resolve it unilaterally while doing an unrelated task.**
  This repo's reference game folder links a Google Fonts stylesheet in every page's `<head>`,
  while the project's own hard rule forbids CDN links and remote fonts (the Fonts link is a
  deliberately tolerated exception because it degrades silently offline — see the root project
  instructions). An agent scaffolding a second game folder should copy the reference `<head>`
  verbatim and flag the discrepancy up, rather than "fixing" it as a side effect — removing it
  changes every existing page's typography at once, a decision with a far larger blast radius
  than the task that noticed it.

- **Never let an internal orchestration codename reach a file that ships with the repository**
  — source, docs, commit messages, configuration, anything a future maintainer reads. Use a
  neutral role name (Developer, Reviewer, QA, Project Manager, Technical Writer, ...) instead,
  or no attribution at all. Codenames are fine in chat and in session-local notes; never in a
  committed artefact.

---

## 6. Wiring a new page or a new game — shared state and boot order

The general shape behind every entry here: a static, no-build site's shared script and
stylesheet layer is itself a form of state, and each trap below is a case of "a second copy of
the shared files behaves differently from the first because something inside them was not
actually generic yet."

- **A storage-key prefix hardcoded into shared scripts means every folder that shares one
  `file://` origin and copies those scripts unmodified writes to the same browser storage
  keys.** Two game folders that both ship an unmodified copy of the same checklist script
  will silently merge reader progress — chapter-1 ticks in one game appear as ticks in the
  other, and a "export all my progress" feature sweeps both games' data into one blob. The
  fix is not "rename the prefix" in the abstract; it is "grep every copied script for the
  literal old prefix and confirm zero remaining matches," because the same short prefix
  string tends to appear in more call sites than intuition suggests (in this repo, one
  four-character prefix appears in roughly a dozen places across three shared scripts).

- **A script that must run before first paint (to avoid a flash of the wrong theme) breaks
  silently, not loudly, if it is deferred, moved to the end of the document, or folded into an
  external file.** The page still renders; the reader who chose dark mode just sees a flash of
  the light theme (or whichever default is coded) for a fraction of a second on every page
  load. No structural check and no colour-contrast check catches this, because by the time
  either one reads the page, the theme has already been corrected — the invariant only exists
  in the window between "browser starts painting" and "the boot script runs," which no
  after-the-fact check can observe. An inline, non-deferred script placed last in `<head>` is
  the only reliable way to guarantee it runs first; the requirement needs a comment at the
  exact point it is enforced, not only in a document someone might not open before editing
  that script.

- **A per-page identifier read from optional markup needs a loud failure mode for the missing
  case, not a quiet fallback value.** If a page is missing the attribute that identifies it to
  the shared script, and the script silently substitutes a shared placeholder value instead of
  erroring, a downstream aggregator that treats "nothing recorded under this page's real
  identifier" as "this page contributes zero to the total" can end up dropping that entire
  page from a sitewide count with no error anywhere in the chain — the page still works for
  the reader looking directly at it, it just vanishes from anything that sums across pages.

- **Load order between shared scripts can encode a genuine data dependency, not merely
  convention.** A script that mirrors already-computed state onto the page (for example,
  colouring a navigation link based on how much of a section is complete) has to run strictly
  after the script that actually computes that state (restoring ticked checkboxes and
  recomputing section counts), or it reads an empty/stale value on the very first paint of a
  page. Preserve the documented script order when scaffolding a new page from a template
  rather than assuming any order works because the browser loads all `defer`red scripts
  eventually.

- **A nav/sidebar element whose CSS placement rule requires it to be a *direct* child of its
  container silently stops working the moment it is wrapped in one more element while
  scaffolding a new page.** The page still renders, every link inside the misplaced element
  still works, and nothing throws an error anywhere — the only symptom is an empty column
  where the sidebar rail should have been, because the CSS rule that turns it into a sticky
  rail is written with the direct-child combinator (`>`) specifically so it does not also
  match content nested one level deeper by accident. Whichever combinator governs a
  layout-critical placement rule, match the exact markup depth it expects when copying a page
  skeleton, not just the general shape.

---

## 7. Shell, tooling and path traps

- **A repo path containing spaces and non-ASCII characters breaks a hand-built `file://` URL
  the moment string concatenation reaches the non-ASCII segment.** Building a URL as
  `'file:///' + dir + file` works fine in a plain ASCII path and fails silently or loudly
  depending on the tool the moment the path contains, for example, Thai characters or a space.
  Build it with the platform's own encoder instead (Node's `url.pathToFileURL()`, used
  throughout `tools/lib/repo.js`), which percent-encodes correctly on its own.

- **On a path like that, a search tool can fail silently instead of erroring.** A search
  issued against an *absolute* path containing non-ASCII characters can return "no matches"
  for a term that is definitely present, while the identical search issued as a path relative
  to an already-resolved working directory succeeds normally. How to recognise it: before
  concluding that a pattern genuinely does not appear anywhere in a file, sanity-check the
  same search tool against a term you already know is present in that exact file — a
  suspiciously fast "no matches" on a path with spaces or non-ASCII segments is a reason to
  suspect the search, not the file.

- **A templating or text-generation step in a pipeline can silently change a regular
  expression's meaning, with no error surfacing anywhere downstream.** See the `tags.js`
  entry under "Verification interacting with the page" above for the specific incident (a
  shell heredoc eating one level of backslash escaping). The general lesson: any regex that
  passes through an intermediate generation layer before landing in its final file needs its
  literal, on-disk output re-read and re-verified — never trusted just because the source
  template looked correct.

- **Never hardcode a module or game's location inside a tool.** Resolve it by a structural
  signal instead — in this repo, "a direct child folder of the games directory that contains
  an `index.html`" — read from a single, documented constant, so a folder that moves, or
  briefly needs to sit somewhere else, is still found by every tool without editing each one
  individually. Fail loudly and by name when an expected folder genuinely is not found, rather
  than silently returning an empty list and letting the caller interpret "nothing to check" as
  "everything passed."

- **A repository that deliberately ships no package manifest** (a hard "no build step, no
  package install" constraint, so the site keeps opening from plain `file://` with nothing to
  set up) **means any tool that genuinely needs a real dependency has to find it by a fallback
  path, not a local install.** A headless-browser driver or an image-decoding library used only
  by the verification tooling has to be installed globally and located either through an
  environment variable or a runtime fallback that asks the package manager directly for its
  global install location. A "cannot find module" error from a tool built this way means the
  global install or the environment variable is missing, not that the tool itself is broken.

- **A hook that exists to keep something out of a public repository must not contain that
  something.** A house-style hook here blocked a set of private orchestration labels from
  reaching committed files — by holding the complete list in a plain array in its own
  source. That was invisible while the repository was private and self-defeating the moment
  it went public: publishing the guard publishes exactly what the guard protects. The list
  now lives in a git-ignored local file that the hook loads if present; absent, that single
  check no-ops and every other check still runs. **Before a repository goes public, read
  the enforcement code as an attacker would, not as its author.**

- **One colour cannot carry three meanings.** A red status class meant "gone for good"
  everywhere in this collection, and it had also been used for "you must do something
  first" and for "this is the largest number in the column". A reader hunting for
  permanently-missable content read the prerequisites as losses and said the flags were
  wrong. They were. Status needs three levels — nothing required, something required but
  nothing losable, and genuinely losable — and the middle one has to exist or it gets
  written as one of the extremes.

- **A correct fact can still be unusable.** "Jupiter Crest — Luca, the Besaid Aurochs
  locker room" is accurate, and a reader took **Luca** for a person's name. Nothing said it
  was a city, which building to enter, or how to travel there. **Verifying a fact and
  writing a usable line are two separate jobs**; the harness checks structure and the
  ledger checks truth, and neither one catches a line that is true and unreadable.

- **When a player contradicts the reference, the reference is what gets re-checked.** A
  player reported meeting a fiend in an area the project's primary reference does not list
  it in. Two other sources confirmed the player and showed the primary reference's list was
  simply incomplete. Treat a report from someone with the game running as evidence that
  outranks a website, and re-verify rather than explain it away.

- **A trick is only as good as its timing, and timing is the part that gets dropped.** A
  documented prize-reroll shortcut said "save before taking the prize." The prize list is
  actually rolled when the menu is opened, so a reader following that line saves too late
  and the shortcut does nothing. **When writing a save-and-reload technique, state the exact
  moment the game decides**, because that moment is the whole technique.

- **A guard that fails silently is worse than no guard, because everyone believes it is
  working.** A house-style hook loaded its blocklist inside `try { ... } catch { return [] }`.
  The loader referenced `fs` without importing it, so it threw on every run, the catch
  swallowed it, and the list was empty every time. Two opposite symptoms followed from that
  one fault: with an empty list the blocklist was interpolated into a regex as an empty
  alternation, which matched almost everything and blocked innocent edits; and once that was
  guarded, the check matched nothing at all and waved real violations straight through.
  **Catch only the error you actually expect — a missing file — and let every other failure
  surface.** A hook that crashes gets fixed the same day; one that quietly does nothing does
  not.

- **A shell heredoc eats one level of backslash, so a regex written through one is not the
  regex you tested.** Debugging the hook above, three probes reported that its pattern
  matched nothing. The probes were wrong, not the hook: `\s` had arrived as `s` and `\b`
  had vanished entirely, so the test regex bore no relation to the real one. This repo had
  already recorded the same trap once. **Write anything containing escapes to a real file
  and run that file** — and when a test and the thing it tests disagree, suspect the test
  first.
