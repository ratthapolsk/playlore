# Contributing

This repository is a collection of hand-written game walkthroughs. Each game is a folder
of static HTML that a reader opens straight off their own disk – there is no server, no
build step, and nothing is installed to read a guide. A guide's job is to be correct and
to be readable while somebody is holding a controller in their other hand.

Contributions are welcome. Please read this page first, because two of the rules here
are stricter than in most projects: **every game fact needs two independent sources**,
and **checkbox keys are user data that must never be renamed**. Everything else is
ordinary.

---

## 1. Run it locally

```
git clone https://github.com/ratthapolsk/playlore.git
cd playlore
```

Then open `games/ffx/index.html` in a browser – double-click it, or drag it into a
window. It loads over `file://` and works offline. There is nothing to install and
nothing to build, so if you only want to read or edit prose, you are already done.

The repository is laid out like this:

```
games/<game>/index.html        the landing page, one card per stage
games/<game>/stages/           one page per chapter, read in order
games/<game>/reference/        lookup pages (gear, side quests, fiend lists)
games/<game>/assets/css|js/    the shared stylesheet and scripts for that game
docs/                          how to write a page, the design system, the fact ledger
tools/                         the verification harness
```

### Installing the verification harness

The harness is the only part of this project that needs anything installed. It needs
**Node.js 22 or newer** plus **Playwright and pngjs installed globally** – this
repository deliberately has no `package.json` and no `node_modules`, so these tools are
installed on your machine rather than into the repo:

```
npm install --global playwright pngjs
playwright install chromium
node tools/verify-all.js
```

`node tools/verify-all.js ffx` checks a single game, and `--fast` skips the checks that
open a browser. A full run over the FFX guide takes roughly four minutes.

If a check reports that it cannot find `playwright` or `pngjs`, point Node at your
global package root and run it again – on Linux and macOS that is
`NODE_PATH=$(npm root -g) node tools/verify-all.js`, and in PowerShell it is
`$env:NODE_PATH = npm root -g`. The tools also try to locate the global install
themselves, so this is usually unnecessary. Full details are in
[`tools/README.md`](tools/README.md).

---

## 2. The four kinds of contribution

Each one has a different path through this document, so find yours before reading on.

### Correcting a wrong fact

This is the most valuable contribution and the easiest to make. If you noticed a wrong
number, a wrong location, or a wrong trigger, open a **Fact correction** issue. You do
not need to know how to write HTML to do this, and you do not need to open a pull
request. If you would rather fix it yourself, the fix must carry two independent sources
and a ledger entry – see section 3.

**Never delete or reword existing content just because it looks wrong.** Verify it
first. If it is wrong, correct it and say plainly in the pull request that it was wrong
and what it used to say. If you cannot verify it, leave the text alone and report it in
an issue instead. Content loss is the one unrecoverable mistake in this repository.

### Filling a gap in an existing guide

Adding a scene that is missing, expanding a thin stage page, or writing a boss block.
Read [`docs/content-model.md`](docs/content-model.md) before you write a line – it
explains the narrative shape a stage page has to follow, and a page that ignores it will
need rewriting rather than reviewing. Every new fact still needs its two sources, and if
you add or remove a checkbox you must follow the `data-k` contract in section 5.

### Adding a whole new game

See section 9. Do not hand-build a new game folder.

### Improving the tooling or the design

Changes to `tools/`, to a game's stylesheet, or to the shared scripts. Read
[`docs/verification.md`](docs/verification.md) for how the harness is structured and how
to add a check, and [`docs/design-system.md`](docs/design-system.md) for the token and
class vocabulary. The hard constraints in [`CLAUDE.md`](CLAUDE.md) apply to any change
here: no network at runtime, no build step, no external images, no `<style>` block in a
page, and no hardcoded colour where a theme token belongs.

---

## 3. The two-source rule is the price of entry

The people who read these guides have finished these games. They notice a wrong number
instantly, and one wrong number costs the whole guide its credibility.

**A pull request that adds or changes any fact about a game must do two things.**

1. **Cite two genuinely independent sources in the pull request body.** Two URLs
   minimum. A wiki and a site that visibly copied that wiki are one source, not two. A
   forum post agreeing with a guide is not a second source.
2. **Append the fact to the ledger at `docs/verified-facts/<game>.md`**, in the entry
   format that [`docs/verified-facts/README.md`](docs/verified-facts/README.md)
   specifies. The ledger is the project's memory: it exists so that nobody spends the
   same research twice, and a fact that was verified but not written down has been paid
   for and thrown away.

**Before you start searching, grep the ledger** – the answer may already be recorded:

```
grep -i "no encounters" docs/verified-facts/ffx.md
```

Every entry carries a status, and the status tells you what to do:

| status | what it means | what you do |
|---|---|---|
| `confirmed` | Two or more independent sources agree, and both URLs are recorded in the entry. | Use it. Do not search again. |
| `single-source` | Only one source was ever found. | Find a second source, then upgrade the entry. |
| `disputed` | Sources genuinely conflict, and both positions are written down. | Do not quietly pick a side. If you resolve it, record the deciding source. |
| `superseded` | A later entry corrected this one. | Read the newer entry. The old one stays so it is visible which pages were written against the wrong value. |
| *(no entry)* | Never verified. | Search, then append a new entry. |

**`confirmed` is never awarded on confidence.** It requires two independent sources,
both URLs written into the entry, plus the date and the game version, and the fact
stated as a checkable value rather than an impression. A fact can be true for one
release of a game and false for another, which is why the version is part of the record.
The guide itself is never evidence – the guide is the thing being corrected.

If something cannot be verified, write it as unverified or leave it out. Never state it
as fact, and never quietly drop the doubt.

**Some sites block automated requests**, which is worth knowing before you waste time:
`jegged.com` and `game8.co` can be fetched directly, while `finalfantasy.fandom.com`
returns HTTP 402, and `gamerguides.com`, `strategywiki.org` and `gamefaqs.gamespot.com`
return HTTP 403. Those four are still perfectly good sources – reach them through a web
search result rather than a direct fetch, and say so in the ledger entry.

---

## 4. A player's own console outranks any website

If you saw something in your own game that contradicts the guide, **you are the better
source.** Guide sites copy each other and inherit each other's mistakes; your save file
does not.

Open a **Fact correction** issue, choose "I saw this in my own game", and describe what
you actually observed – what you did, what happened, and which version and platform you
were playing. That report is enough on its own; you are not expected to go and find URLs
to back up your own eyes.

A maintainer will mark the affected ledger entry `disputed`, record what you observed,
and re-verify. Until that happens the entry is treated as wrong, not you.

---

## 5. The `data-k` contract – those attributes are somebody's save file

Every checkbox on a guide page carries a `data-k="<prefix>-<slug>"` attribute, and the
reader's ticked state is stored in their browser's `localStorage` under that exact
string.

**Renaming or removing a `data-k` value silently destroys progress that somebody earned
by playing the game.** Their tick is still in `localStorage` under the old key, but no
checkbox claims that key any more, so the box comes back empty and they have no way to
tell which items they had already collected. There is no server and no backup, so there
is no undo. It is invisible in review, because the page still looks completely correct.

The rules are short:

- **Adding a new key is always fine.** Use the page's existing prefix (`s07-`, `s22-`,
  `rs-` for side quests, `rg-` for gear) and keep the value unique within the file.
- **Renaming a key is a removal plus an addition, and is not allowed.** If a label's
  wording needs fixing, change the label text and leave the key alone.
- **Removing a key is not allowed** unless the thing it describes turned out not to
  exist, in which case say so explicitly in the pull request.
- **Moving or reordering a checkbox is fine**, because the key still exists.

**Count the keys before and after your edit, and put both numbers in the pull request.**
On any platform with `grep`:

```
grep -o 'data-k="[^"]*"' games/ffx/stages/09-miihen-highroad.html | wc -l
```

After adding or removing a checkbox, run `node tools/sync-totals.js` so the landing
page's overall progress bar keeps a correct denominator. It only writes when a count
actually changed, so running it on unchanged content leaves the file byte-for-byte
identical.

---

## 6. Run the harness before you open a pull request

A visual or structural claim is never made by reasoning about the code. It is measured:

```
node tools/verify-all.js
```

The harness checks tag balance, duplicate and lost `data-k` keys, the forbidden
separator, whether every table fills its card, sidebar presence, layout shift, invisible
text, horizontal overflow, dead controls, and colour contrast in both light and dark
themes. It exits non-zero if anything failed.
[`docs/verification.md`](docs/verification.md) explains what each check proves and why
its threshold is the number it is.

### When it fails

1. **Read the failing check's section in `docs/verification.md` first.** Each threshold
   has a stated reason, and the reason usually tells you what the real defect is.
2. **When a harness result contradicts something you already know to be fine, suspect
   the harness first.** That has been the correct call every time so far in this
   repository – the worked example is `dark-check2.js`, which once reported a contrast
   failure on a colour that was already known to be correct, because it was blending
   semi-transparent layers by hand instead of reading the pixels the browser actually
   painted. Do not "fix" correct code because a tool said so. If the harness is the
   thing that is wrong, fix the harness, and say so in the pull request.
3. **`density.js` and `gloss-survey.js` never fail.** They are surveys for a human to
   read, not gates. A page flagged as thin by `density.js` means "go and read that page",
   not "go and pad that page" – some scenes genuinely contain nothing to collect, and a
   short honest checklist is correct.

---

## 7. Why continuous integration matters here

This repository carries enforcement hooks under `.claude/hooks/` that block a bad edit
at the moment it is made: one refuses to remove or rename a `data-k` value, one blocks
house-style violations such as a stray middot or a per-page `<style>` block, and one
reports tag imbalance and duplicate keys after every write.

**Those hooks only run on a maintainer's own machine.** They are wired into a local
editor's tooling, they are not a git hook, and they never see your pull request. That
makes the GitHub Actions workflow in `.github/workflows/verify.yml` the only thing that
holds a contributed change to the same standard as a maintainer's own. It runs
`node tools/verify-all.js` on every pull request and fails the check when the harness
fails.

So please run the harness locally before you push. CI will catch it either way, but a
local run takes four minutes and saves you a round trip.

---

## 8. House style, briefly

The full content model is in [`docs/content-model.md`](docs/content-model.md) and the
class and token vocabulary is in [`docs/design-system.md`](docs/design-system.md). Read
the first one before writing guide content. The short version:

- **Repository-level files are written in English** – this page, the README, everything
  under `docs/` and `tools/`, and all code comments.
- **A guide's own prose is written in whatever language that guide is for.** The FFX
  guide is written in Thai.
- **In-game and technical terms are never translated**, whatever the guide's language.
  `Sphere Grid`, `Overdrive`, `Save Sphere` and `Break Damage Limit` stay in English,
  because the player is looking at an English screen while they read.
- **The inline separator is `" – "`, a spaced en dash.** A bare middot is forbidden
  anywhere in page text, and the harness fails the build if it finds one.
- **Every bullet is a complete sentence that stands on its own.** Terse is fine; clipped
  is not. One bullet carries one idea, rather than three chained together.
- **Assume the reader has zero prior context and will not click anything to find out
  what you meant.** Define every abbreviation and code on first use, and never point at
  "the section above" or an external document.
- **No compass directions.** A player cannot tell which way is north while playing, so
  describe movement by landmark and by left or right relative to the way they are
  walking.
- **A page is read top to bottom in play order**, and everything sits inline in the
  scene where it happens – a pickup is ticked where the player walks past it, and a boss
  block sits where the boss appears. Only pure lookup tables belong at the bottom of a
  page.

---

## 9. Adding a whole new game

Do not hand-build a new game folder. Use the `new-game-guide` skill in
`.claude/skills/new-game-guide/`, which scaffolds the folder, copies the shared assets,
wires the scripts in the order they have to load, and generates the stage index from a
list of chapters. The scaffold encodes several decisions – theme boot order, script load
order, the placement of `nav.toc` that the sidebar silently depends on – that are easy to
get subtly wrong and produce a page that looks fine while being broken.

**Every game needs its own `localStorage` prefix, and this is the trap that catches
people.** All games are opened from the same `file://` origin, so every game shares one
`localStorage`. The shared scripts currently hardcode the `ffx_` prefix in fifteen
places across three files (`app.js`, `fx.js` and `gimmicks.js`), including the filter in
the progress-export function. Copying those files into a second game unchanged makes
chapter 1 of the new game share its ticks with chapter 1 of FFX, and merges both games
into one export blob.

Rewrite the prefix when you scaffold, then prove it with a grep that must return
nothing:

```
grep -rn "ffx_" games/<newgame>/assets/js/
```

Before writing any content, open a **New game proposal** issue so that two people do not
start the same guide in parallel.

---

## 10. Opening the pull request

The pull request template asks for five things, and they map onto the rules above:

- What changed and why.
- Two source URLs, if any game fact was added or changed.
- The `data-k` count before and after, if you touched a checkbox.
- Confirmation that `node tools/verify-all.js` passes.
- Which game folder is affected.

Keep a pull request to one game folder and one kind of change where you can. A fact
correction reviewed on its own gets checked properly; the same correction buried in a
fifty-file restyle does not.

---

## 11. Code of conduct

Be straightforward and assume good faith. Disagreements about a game fact are settled by
sources and by what actually happens on a console, never by who argued more confidently
– being corrected is how the guide gets better, and pointing out a mistake is a
contribution rather than an attack. Harassment, personal attacks and deliberately
wasting other people's time are not welcome here, and a maintainer may close or block
without further discussion.
