# Copilot instructions — Playlore

Self-contained on purpose. GitHub's own guidance warns that instructions telling the
model to go read another file "may not have the intended results", and link-following
works only in VS Code (behind `chat.includeReferencedInstructions`), not on github.com.
So the rules are restated here. `CLAUDE.md` and `AGENTS.md` hold the same rules in
fuller form; `docs/` holds the depth. Nothing here may contradict them.

## The project

Thai-language game walkthroughs, **one folder per game** — `games/ffx/` (Final Fantasy X) is
the reference implementation. Static HTML opened straight from disk over `file://`. There
is no server, no build step and no package install; editing a file and reopening it in
the browser is the whole development loop.

## Never do these

- **No `fetch` / `XHR` / ES module `import`** — `file://` blocks them. Reading a
  stylesheet via the CSSOM also throws `SecurityError`. Use `localStorage`.
- **No external images, no remote scripts.** Vector art is inline `<svg>`.
- **No `<style>` blocks, and no inline `style=` that sets `font-size`.**
- **No hardcoded hex colours inside an `<svg>`** — use `var(--ink)`, `var(--cyan)`,
  `currentColor`. A hardcoded colour disappears in dark mode.
- **No `" · "` separator, and no bare `·`** in page text. The house separator is
  `" – "` (spaced en dash).
- **No compass directions** in Thai page text. A player cannot tell north in-game — use
  landmarks plus left/right relative to the direction they are walking.
- **Never remove or rename a `data-k` value.** Those are checkbox keys whose ticked state
  lives in the reader's `localStorage`; changing one erases progress they earned by
  playing. Count them before and after every edit.
- **Never delete or reword existing content because it looks wrong.** Verify it first. If
  it is wrong, correct it and say so. If you cannot verify, leave it and report it.
- **Never commit unless explicitly asked.**

## Always do these

- **Prose in Thai; technical and in-game terms in English**, never translated —
  `Sphere Grid`, `Overdrive`, `Save Sphere`, and every item, place and character name.
- **Every bullet is a complete sentence that stands on its own**, understandable by a
  reader with zero prior context who will not click anything to find out what you meant.
- **A place name is not a location** — name the kind of place (`the city of Luca`), the
  route inward (building, floor, room), and how to travel there now.
- **Two independent sources for every game fact** before writing it — a location, a
  price, a stat, a trigger, a resistance. If it cannot be verified, mark it unverified or
  leave it out. Never guess.
- **Check `docs/verified-facts/` before searching.** An entry marked `confirmed` already
  has two sources and a date; reuse it instead of searching again, and append whatever
  you newly verify.
- **Keep everything inline in the scene where it happens.** A stage page reads top to
  bottom like a novel in play order — a pickup is ticked where the player walks past it,
  a boss block sits where the boss appears. Nothing is gathered into a section at the
  bottom except pure lookup tables.
- **Prove it by running the harness**, never by reasoning: `node tools/verify-all.js`.
  After changing checkbox counts, also run `node tools/sync-totals.js`.

## Fetching sources

`jegged.com` and `game8.co` fetch cleanly. `finalfantasy.fandom.com` returns HTTP 402;
`gamerguides.com`, `strategywiki.org` and `gamefaqs.gamespot.com` return 403 — reach
those through web-search result extraction rather than a direct fetch.

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
