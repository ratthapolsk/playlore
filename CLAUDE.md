# Playlore — project instructions

Multi-game collection of hand-written game walkthroughs. Each game is one folder of
static HTML opened directly from disk (`file://`). One folder per game; `games/ffx/` (Final
Fantasy X) is the reference implementation — when in doubt, copy what it does.

**Read before working:** [`docs/content-model.md`](docs/content-model.md) (how a page is
written), [`docs/design-system.md`](docs/design-system.md) (classes and tokens),
[`docs/verification.md`](docs/verification.md) (how to prove work is done),
[`docs/lessons.md`](docs/lessons.md) (traps already paid for — do not rediscover them).

---

## 1. Layout

```
games/<game>/          one folder per game
  index.html           the hub page — the file a reader opens, and the only HTML at this level
  stages/              NN-*.html — the walkthrough itself, in play order
  reference/           ref-*.html — lookup pages (gear, abilities, side quests, …)
  assets/css/          style.css, art.css, gimmicks.css
  assets/js/           app.js, fx.js, art.js, gimmicks.js
  _to_delete/          optional; a leading underscore makes every tool ignore it
docs/                  how the project works — read by agents, written in English
tools/                 the verification harness
.claude/               skills and enforcement hooks
```

Relative links follow from that, and getting one wrong produces a page that still opens
but has no stylesheet — which reads as a design problem rather than a path problem:

- from `index.html` → `stages/NN-x.html` – `reference/ref-x.html` – `assets/css/style.css`
- from `stages/` → `../assets/css/style.css` – `../index.html` – `../reference/ref-x.html` – a sibling stage as plain `NN-x.html`
- from `reference/` → `../assets/…` – `../index.html` – `../stages/NN-x.html` – a sibling reference page as plain `ref-x.html`

**Nothing in `tools/` hardcodes a game name.** A game is any folder under `games/` that
contains an `index.html`, and every check takes an optional game argument.

## 2. Hard constraints

The site is opened as a local file. There is no server, no build step, no package
install, no network at runtime.

- **No** `fetch`/`XHR`/`import` — `file://` blocks them, and CSSOM reads on a `file://`
  stylesheet throw `SecurityError`. Anything dynamic reads from `localStorage`.
- **No external images and no remote scripts.** Vector art is inline `<svg>`.
- **One CDN exception, and only one:** every page links Google Fonts for the display
  face. It is allowed because it **degrades silently** — offline, the browser falls back
  and the page is fully readable. Nothing else may depend on the network. If you add a
  remote resource, the test is: unplug the network, reload, and the page must still be
  complete.
- **No** `<style>` blocks in an HTML page and **no** inline `style=` that sets
  `font-size`. All styling lives in the shared stylesheet, or as presentational SVG
  attributes inside a diagram.
- Never hardcode a hex colour in a diagram — use the theme tokens
  (`var(--ink)`, `var(--cyan)`, `currentColor`, …). The reader toggles dark mode and a
  hardcoded colour disappears.
- Every page must work with JavaScript doing nothing: content is visible on load, never
  revealed by an animation.

## 3. Language

**Two audiences, two languages, and the split is by reader — not by file type.**

- **Anything an agent reads is English.** That is `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
  `README.md`, `CONTRIBUTING.md`, `.github/**`, `.cursor/rules/*.mdc`, everything under
  `docs/`, every `.claude/skills/*/SKILL.md`, hook source and comments, and commit messages.
  English is denser, less ambiguous, and every one of these files exists to be executed
  rather than enjoyed.
- **A guide's content is written in the language that guide is for.** The Final Fantasy X
  guide is Thai; a contributor may add a guide in another language. This is the **only**
  place non-English prose belongs, and it has its own stricter conventions below.
- **`README.md` is English**, like every other repo-level file. The project is public, so
  the front door has to be readable by anyone who finds it.

### Guide-page prose

- **Prose is Thai. Technical and in-game terms stay in English** — item, place,
  character, ability, mechanic and system names are never translated
  (`Sphere Grid`, `Overdrive`, `Break Damage Limit`, `Save Sphere`, `NavMap`).
  Translating them makes sentences longer and *less* recognisable to a player who is
  looking at an English screen.
- **Inline separator is `" – "` (spaced en dash). `" · "` is forbidden**, and so is a
  bare `·` anywhere in page text.
- **Every bullet is a complete sentence that stands on its own.** Terse is fine; clipped
  is not. One bullet, one idea — do not chain three thoughts with "และ".
- **Cold-reader rule.** Assume the reader has zero prior context and will not click
  anything to find out what you meant. Define every ID, code, abbreviation and number on
  first use. Never point at "the section above", a ticket, or an external doc.
- **A place name is not a location.** Say what kind of place it is (`the city of
  Luca`), the route inward (building, then floor, then room), and how to travel there now.
  A reader of this guide took `Luca` for a person’s name. Fix the class, not the one line
  that was reported.
- **No compass directions.** A player cannot tell north in-game. Describe movement by
  landmark and by left/right *relative to the way the player is walking*.

## 4. Content model — the thing that makes these guides different

A stage page is **read top to bottom like a novel**, in strict play order: enter the
scene → where to go → what to do → what it unlocks → what you get, with the characters'
mood carried through. The checklist is support, not the spine.

**Everything is inline, in the scene where it happens.** A pickup is ticked at the
moment the player walks past it; a boss block sits where the boss appears; a puzzle
walkthrough sits in the room. Nothing is collected into a "items" or "bosses" section at
the bottom. Only pure lookup tables (fiend list, glossary) belong at the end.

Three kinds of checkbox, all equally valid:

1. **Items** — anything picked up.
2. **Milestones** — story beats and one-time actions (a boss cleared, a character
   joining, a conversation that gates something later). Use `.pick milestone`.
3. **Preparation** — what to do before a fight. Use `.prep`.

**Never pad a checklist.** Some scenes genuinely contain nothing to collect. When that
is the truth, say so in one `data-note` line so the reader stops hunting, and build the
checklist from milestones instead. A short honest list beats a padded one.

Full detail, including the anatomy of a stage page: [`docs/content-model.md`](docs/content-model.md).

## 5. Accuracy — the rule that outranks everything else

The reader has finished these games and notices a wrong number instantly.

- **Never guess.** Every fact about a game — an item location, a stat, a trigger, a
  price, a boss resistance — is verified against **at least two independent sources**
  before it is written.
- **Name the primary version** and stick to it (`games/ffx/` is HD Remaster / International;
  PS2-original differences are called out only where they genuinely differ).
- If something cannot be verified, **write it as unverified or leave it out.** Never
  state it as fact and never quietly drop the doubt.
- **Never delete or reword existing content because it looks wrong.** Verify first. If
  it is wrong, correct it *and say so*. If you cannot verify, leave it and report it.
  Content loss is the one unrecoverable mistake here.
- Fetch notes: `jegged.com` and `game8.co` fetch cleanly. `finalfantasy.fandom.com`
  returns HTTP 402, and `gamerguides.com` / `strategywiki.org` / `gamefaqs.gamespot.com`
  return 403 — use web-search result extraction for those, never a direct fetch.

## 6. `data-k` — the checkbox keys are user data

Each checkbox carries `data-k="<prefix>-<slug>"` and its ticked state lives in the
reader's `localStorage`. **Renaming or removing a key silently erases progress they
earned by playing.**

- Prefix by page: `s07-`, `s22-`, `rs-` (side quests), `rg-` (gear), …
- Keys are unique within a file.
- **Every game folder needs its own `localStorage` namespace.** All games are served from
  the same `file://` origin, so they share one `localStorage`. The shared scripts
  currently hardcode the `ffx_` prefix in about a dozen places across `app.js`, `fx.js`
  and `gimmicks.js` (`ffx_<page>`, `ffx_stats`, `ffx_theme`, `ffx_sfx`, `ffx_hint_shown`,
  plus an `indexOf('ffx_')` filter in the export function). Copying those files into a
  second game unchanged makes chapter 1 of the new game share its ticks with chapter 1 of
  FFX, and makes the export blob merge both games. Rewrite the prefix when scaffolding,
  and gate it with `grep -rn "ffx_" <newgame>/*.js` returning nothing.
- **Count keys before and after every edit and report both numbers.** Never remove one.
- After adding or removing checkboxes on a stage page, re-run `node tools/sync-totals.js`
  so the index's overall progress denominator stays correct.

## 7. Reuse verified knowledge — do not pay for the same fact twice

Verifying a game fact costs several fetches, and half the good guide sites block
automated requests. **Before searching, check the ledger:**

```bash
grep -i "no encounters" docs/verified-facts/ffx.md
```

An entry marked `confirmed` carries two independent source URLs and a date — **use it
and do not search again**. An entry marked `single-source` or `disputed` still needs
work. No entry means search, and then **append what you found** — an agent that verifies
a fact and does not record it has spent the tokens and thrown away the result.

`confirmed` is a high bar and is never awarded on confidence: it requires two genuinely
independent sources, both URLs written down, plus the date and the game version. The
guide itself is never evidence — it is the thing being corrected.

**A player's own console outranks every website.** If the person playing reports
something different from an entry, the entry is wrong until re-verified. Protocol and
format: [`docs/verified-facts/README.md`](docs/verified-facts/README.md).

## 8. Verification — "done" means measured, not believed

Never claim a visual or structural result from reasoning. Run the harness:

```
node tools/verify-all.js            # whole repo
node tools/verify-all.js ffx        # one game
```

It checks tag balance, duplicate/lost `data-k`, the forbidden separator, table fill,
sidebar presence, layout shift, invisible text, horizontal overflow, dead controls,
and colour contrast in both themes. See [`docs/verification.md`](docs/verification.md)
for what each threshold means and how to add a check.

**When a harness result contradicts something you already know to be fine, suspect the
harness first.** That has been the correct call every time so far — see
[`docs/lessons.md`](docs/lessons.md).

## 9. Working with subagents

- **One file, one owner.** Never let two agents write the same file. Give each agent an
  explicit "you own exactly these files" line.
- An agent that finds a problem in **someone else's** file **reports it, never edits
  it**. The orchestrator applies cross-file fixes after verifying.
- **Check an agent type's tool list before assigning it fact work.** Several specialised
  agent types ship without web access, and an agent that cannot search will confidently
  fill the gap from memory. Any task that requires verifying a game fact must go to an
  agent that actually has web tools.
- **Verify every agent's claim against the source of truth before accepting it.** Agents
  have contradicted each other on facts in this repo; the orchestrator settles it with a
  search, not by picking the more confident answer.
- Give agents self-contained specs. A vague brief produces confident, wrong output.

## 10. Keep concepts portable — nothing hardcoded to one game

This repo exists to hold **many** games. Every rule, tool, document and skill is written
for the collection, not for `games/ffx/`.

- **State the general rule, then use a game as the illustration.** "A stage page reads in
  play order" is portable; "FFX stage pages read in play order" is not.
- **Never hardcode a game folder name in a tool.** Tools discover game folders (a direct
  child of the repo root containing an `index.html`) and take one as an optional argument.
- **A concept that cannot be taken apart cannot be reused.** If a rule only makes sense
  as part of a larger blob, split it until each piece stands alone and can be adopted,
  replaced or dropped on its own.
- **Where something genuinely is game-specific, say so out loud** and mark it as work a
  second game must redo. The `ffx_` `localStorage` prefix in the shared scripts is the
  live example — it is hardcoded today, it is documented as hardcoded, and the scaffolding
  skill gates on it.

The test: could a second game adopt this rule, tool or document **without editing it**?
If not, it is either genuinely specific — and labelled so — or it needs re-levelling.

## 11. Git

**Do not commit unless explicitly asked**, even when the work is finished and verified.
"The work is done" is not permission.

When you *are* asked, use the **`git-ship`** skill. It carries the two steps that get
skipped otherwise: the **verification gate** (`node tools/verify-all.js` must exit zero
before anything is committed) and the closing **documentation sweep** — re-reading
`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `README.md`, the Copilot and Cursor rule files,
`docs/`, and the skills, to confirm they still describe the repo as it now is. Both steps
are reported to the user **even when they find nothing**, because "checked and clean" and
"forgot to check" look identical in silence.

---

## Adding a new game

Invoke the `new-game-guide` skill. It scaffolds the folder, wires the shared assets,
and generates the stage index from a list of chapters. Do not hand-build a new game
folder — the scaffold encodes decisions (theme boot order, script wiring, key prefixes)
that are easy to get subtly wrong.
