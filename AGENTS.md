# AGENTS.md — Playlore

Read by Codex, Cursor, Jules, GitHub Copilot's coding agent, VS Code chat and others.
This file is deliberately **self-contained**: the AGENTS.md format has no import
mechanism, and several tools do not follow Markdown links. `CLAUDE.md` is the fuller
version of the same rules; `docs/` holds the depth. Nothing here may contradict them.

## What this repo is

A collection of hand-written game walkthroughs. **One folder per game** — `games/ffx/` (Final
Fantasy X, 35 pages) is the reference implementation. Copy what it does.

Pages are static HTML opened straight from disk over `file://`. **No server, no build
step, no package install, no bundler.** Editing a file and reopening it in the browser is
the entire development loop.

## Layout

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

## Hard constraints

- **No `fetch` / `XHR` / ES module `import`.** `file://` blocks them. Reading a
  stylesheet through the CSSOM also throws `SecurityError` there. Anything dynamic uses
  `localStorage`.
- **No external images, no remote scripts.** Vector art is inline `<svg>`.
- **One CDN exception:** each page links Google Fonts for the display face, allowed only
  because it degrades silently — offline the browser falls back and the page stays fully
  readable. The test for any new remote resource: unplug the network, reload, and the
  page must still be complete.
- **No `<style>` blocks. No inline `style=` setting `font-size`.** Styling lives in the
  shared stylesheet, or as presentational SVG attributes inside a diagram.
- **Never hardcode a hex colour inside an `<svg>`.** Use theme tokens (`var(--ink)`,
  `var(--cyan)`, `currentColor`). The reader toggles dark mode and a hardcoded colour
  vanishes.
- **Content must be readable with JavaScript doing nothing** — visible on load, never
  revealed by an animation.

## Language

- **Prose is Thai. Technical and in-game terms stay in English** and are never
  translated: `Sphere Grid`, `Overdrive`, `Break Damage Limit`, `Save Sphere`, plus every
  item, place and character name. A player is looking at an English screen — translating
  the term makes it unfindable.
- **The inline separator is `" – "` (spaced en dash).** `" · "` is forbidden, and so is a
  bare `·` anywhere in page text.
- **Every bullet is a complete sentence that stands alone.** Terse is fine, clipped is
  not. One bullet, one idea.
- **Cold-reader rule.** Assume zero prior context and that the reader will not click
  anything to find out what you meant. Define every ID, code and abbreviation on first
  use. Never refer to "the section above" or an external doc.
- **A place name is not a location.** Say what kind of place it is (`the city of
  Luca`), the route inward (building, then floor, then room), and how to travel there now.
  A reader of this guide took `Luca` for a person’s name. Fix the class, not the one line
  that was reported.
- **No compass directions.** A player cannot tell north in-game. Use landmarks plus
  left/right relative to the direction of travel.

## Content model

A stage page is **read top to bottom like a novel**, in strict play order: enter the
scene → where to go → what to do → what it unlocks → what you get, with the characters'
mood carried through. The checklist supports the prose; it is not the spine.

**Everything is inline, in the scene where it happens.** A pickup is ticked where the
player walks past it, a boss block sits where the boss appears, a puzzle walkthrough sits
in the room. Nothing is gathered into an "items" or "bosses" section at the bottom — only
pure lookup tables (fiend list, glossary) belong at the end.

Three kinds of checkbox, equally valid: **items**, **milestones** (`.pick milestone` —
story beats and one-time actions), and **preparation** (`.prep`).

**Never pad a checklist.** When a scene genuinely has nothing to collect, say so in one
`data-note` line so the reader stops hunting, and use milestones instead.

## Accuracy — the rule that outranks the others

The reader has finished these games and spots a wrong number instantly.

- **Never guess.** Every game fact — a location, a stat, a price, a trigger, a resistance
  — needs **two independent sources** before it is written.
- Name the primary version and hold to it (`games/ffx/` is HD Remaster / International).
- If it cannot be verified, mark it unverified or leave it out. Never state it as fact.
- **Never delete or reword existing content because it looks wrong.** Verify first; if it
  is wrong, correct it and say so; if you cannot verify, leave it and report it. Content
  loss is the one unrecoverable mistake here.
- Fetch notes: `jegged.com` and `game8.co` fetch cleanly. `finalfantasy.fandom.com`
  returns HTTP 402; `gamerguides.com`, `strategywiki.org` and `gamefaqs.gamespot.com`
  return 403 — use web-search result extraction for those, never a direct fetch.

## Reuse verified knowledge

**Before searching for a game fact, grep the ledger:**

```bash
grep -i "no encounters" docs/verified-facts/ffx.md
```

An entry marked `confirmed` carries two independent source URLs and a date — use it and
do not search again. `single-source` or `disputed` still needs work. No entry means
search, then **append what you found**. Verifying a fact and not recording it spends the
tokens and throws away the result.

`confirmed` is never awarded on confidence. It requires two genuinely independent sources
with both URLs written down, plus the date and game version. The guide itself is not
evidence — it is what is being corrected. **A player's own console outranks every
website.** Protocol: `docs/verified-facts/README.md`.

## `data-k` — checkbox keys are user data

Each checkbox carries `data-k="<prefix>-<slug>"`, and its ticked state lives in the
reader's `localStorage`. **Renaming or removing a key silently erases progress they
earned by playing.**

- Prefix per page: `s07-`, `s22-`, `rs-`, `rg-`.
- Keys are unique within a file.
- **Count keys before and after every edit and report both numbers.** Never remove one.
- **Each game folder needs its own `localStorage` namespace.** All games share one
  `file://` origin. The shared scripts hardcode the `ffx_` prefix in about a dozen places
  across `app.js`, `fx.js` and `gimmicks.js`. Copying them into a second game unchanged
  makes both games share ticks. Rewrite the prefix, and gate it with
  `grep -rn "ffx_" <newgame>/*.js` returning nothing.
- After changing checkbox counts, run `node tools/sync-totals.js`.

## Verification — "done" means measured

Never claim a visual or structural result from reasoning.

```bash
node tools/verify-all.js          # whole repo
node tools/verify-all.js ffx      # one game
node tools/verify-all.js --fast   # skip the browser checks
```

It checks tag balance, duplicate and lost `data-k`, the forbidden separator, table fill,
sidebar presence, layout shift, invisible text, horizontal overflow, dead controls and
colour contrast in both themes. Details: `docs/verification.md`.

**When a harness result contradicts something you already know is fine, suspect the
harness first.** That has been the right call every time in this repo.

## Working with subagents

- **One file, one owner.** Never let two agents write the same file.
- An agent that finds a problem in someone else's file **reports it, never edits it**.
- **Check an agent type's tool list before assigning fact work** — several specialised
  types ship without web access and will fill the gap from memory instead of searching.
- **Verify every agent's claim before accepting it.** Two agents in this repo once
  contradicted each other on a game mechanic; the orchestrator settled it with a search,
  not by picking the more confident answer.

## Language — split by reader, not by file type

- **Anything an agent reads is English**: `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`,
  `.github/copilot-instructions.md`, `.cursor/rules/*.mdc`, everything under `docs/`,
  every `SKILL.md`, hook source and comments, and commit messages.
- **A guide's content is written in the language that guide is for.** The Final Fantasy X
  guide is Thai; a contributor may add a guide in another language. This is the only
  place non-English prose belongs.

## Keep concepts portable — nothing hardcoded to one game

This repo holds **many** games. State the general rule and use a game as the
illustration, never the reverse. Tools discover game folders rather than naming one. A
concept that cannot be taken apart cannot be reused, so split rules until each stands
alone. Where something genuinely is game-specific — the `ffx_` `localStorage` prefix
hardcoded in the shared scripts is the live example — **say so out loud** and mark it as
work a second game must redo. The test: could a second game adopt this rule, tool or
document **without editing it**?

## Git

**Do not commit unless explicitly asked**, even when the work is finished and verified.
"The work is done" is not permission.

When you are asked, follow the `git-ship` skill in `.claude/skills/git-ship/`. Its two
load-bearing steps are the ones that get skipped otherwise: **`node tools/verify-all.js`
must exit zero before anything is committed**, and afterwards the **documentation sweep** —
re-read `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `README.md`, `.github/copilot-instructions.md`,
`.cursor/rules/*.mdc`, `docs/` and the skills, and confirm each still describes the repo as
it now is. Report both steps to the user **even when they find nothing**, because
"checked and clean" and "forgot to check" look identical in silence.

## Adding a new game

Use the `new-game-guide` skill in `.claude/skills/`. It encodes decisions that are easy
to get subtly wrong — theme-boot ordering, the `localStorage` prefix, `data-page`, script
load order, and the fact that `nav.toc` must be a **direct child** of `.wrap` or the
sidebar silently does not render.
