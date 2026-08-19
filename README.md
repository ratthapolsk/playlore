# Playlore

*Where players leave what they learned.*

A collection of hand-written game walkthroughs, delivered as static HTML pages you open
directly from disk. There is no server, no build step, and nothing to install.

The guide currently in the collection is **Final Fantasy X** (HD Remaster / International),
written in Thai.

## Reading a guide

1. Clone or download this repository:
   `git clone https://github.com/ratthapolsk/playlore.git`
2. Open `games/ffx/index.html` in a browser.

That's the whole setup – no dependencies, no local server, and no internet connection
needed to read (the one exception is a Google Fonts request for the display typeface,
which degrades silently if you're offline – the page stays fully readable). Every
checklist you tick is saved to that browser's `localStorage`, so your progress persists
between sessions on the same machine. Ticking a box on one computer does not carry over
to another.

## Features

Everything below works from a `file://` URL with no server, no build step and no installed
dependency. None of it is specific to any one game – a new guide folder inherits all of it.

### While you read

- **Checklists that remember.** Every item, milestone and preparation step is a checkbox
  whose ticked state is saved to your browser's `localStorage`, so a guide resumes where
  you left it. Each page shows its own count, and the hub shows a completion ring per
  stage plus an overall total.
- **Section-level progress in the sidebar.** Each entry in a page's table of contents
  carries its own `done/total` count and changes colour once that section is finished, so
  you can see what is left without scrolling the page.
- **Export and import your progress.** Progress lives in one browser only, so a built-in
  export produces a single blob you can carry to another browser or machine and import
  there. It doubles as the backup if you ever clear site data.
- **Page search from the keyboard.** `Ctrl`+`K` – or `/` – opens a palette that filters
  every page in the guide as you type; `Esc` closes it.
- **Keyboard navigation.** `←` and `→` move to the previous and next stage, `t` toggles
  the theme, and `?` lists the shortcuts.
- **Light and dark theme, remembered between visits.** Every colour – including the ones
  inside diagrams – is a theme token rather than a fixed value, so illustrations stay
  legible in both.
- **Inline glossary tooltips.** Terms a returning player may have forgotten are explained
  on hover, in a bubble that keeps itself inside the window instead of running off the
  edge.
- **It works with JavaScript switched off.** All content is present on load; scripts add
  progress tracking and polish, never the text itself.
- **It works offline.** The only network request any page makes is a Google Fonts
  stylesheet for the display typeface, and it degrades silently – the page stays complete
  without it.

### How it presents itself

- **Diagrams are inline SVG drawn from theme tokens.** There are no image files to load
  and nothing that breaks in dark mode. Decorative art is generated procedurally from the
  page's own name, so each stage gets a consistent sigil of its own without shipping a
  single asset.
- **Optional sound effects, synthesized at runtime.** Short tones are generated through
  the Web Audio API rather than shipped as audio files. They stay off until you turn them
  on.
- **Motion respects `prefers-reduced-motion`.** Ambient animation and reveal effects stop
  when your system asks for them to.
- **Room for per-game tools.** A guide can ship its own widget panel beside the shared
  ones – a cipher translator, a damage calculator, a route planner – without touching the
  shared scripts.

### Underneath

- **Three kinds of checkbox.** Items are only one of them: story milestones and
  preparation steps carry equal weight, so a stage with no pickups still gets a truthful
  checklist rather than a padded one.
- **Permanent losses are warned about before the point they happen**, and every warning
  says plainly whether something is gone for good or merely something to come back for.
- **A ledger of verified facts.** Any game fact checked against two independent sources is
  recorded in [`docs/verified-facts/`](docs/verified-facts/) with both URLs and the date,
  so a fact is researched once and reused rather than re-argued.
- **A harness, not a proofread.** `node tools/verify-all.js` measures tag balance,
  duplicate or lost checklist keys, table layout, sidebar presence, layout shift after
  load, invisible text, horizontal overflow, dead controls and colour contrast in both
  themes, across every game folder.
- **A new game is scaffolded, not hand-built.** The wiring that is easy to get subtly
  wrong – the storage-key namespace, theme boot order, script load order – is generated
  rather than copied.

## What makes these guides different

Most walkthroughs are reference material – a list of items in a stage, sorted for
lookup. These are written to be *read*, top to bottom, in the order you'll actually
play:

- **Strict play order.** A page unfolds the same way the stage does – enter the scene,
  where to go, what to do, what it unlocks, what you get – so it reads like a story
  while you play.
- **Everything inline, nothing piled at the bottom.** A pickup is checked off exactly
  where you'd walk past it in-game, a boss fight sits where the boss appears, and a
  puzzle's solution sits in the room the puzzle is in. Nothing is gathered into a
  separate "items" or "bosses" section – the only exception is a pure lookup table, such
  as a monster list or a glossary, which belongs at the end because you jump to it
  rather than read it in sequence.
- **Every fact is checked twice.** An item's location, a stat, a price, a boss's
  resistance – every number in a guide is verified against at least two independent
  sources before it is written down. If something can't be verified, it is marked as
  unverified or left out, never stated as fact.
- **Correctness is measured, not assumed.** A verification harness (see below) checks
  structural and visual details a human proofreader would miss – broken tags, duplicate
  save keys, layout that shifts after load, and colour contrast in both light and dark
  mode.

More detail on how a page is structured lives in
[`docs/content-model.md`](docs/content-model.md).

## Language

The repository's own files – documentation, tooling, agent configuration, commit
messages – are written in English. A guide's *content* is written in whatever language
its players are: the FFX guide is in Thai, with in-game terms (item, place, character
and ability names) left in English because that's what appears on screen. A guide for a
different audience is welcome to be written in a different language.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to propose a fix, verify a game fact, or
add a new game. Every game folder is self-contained, and a new one is generated from a
skill rather than hand-built, so the wiring (storage keys, theme boot order, script
load order) doesn't get subtly broken.

## Verification

`node tools/verify-all.js` is how a change is proven done, not read-and-assumed. It
checks tag balance, duplicate or missing checklist keys, table layout, sidebar
presence, layout shift, and colour contrast, across every game folder (pass a folder
name to check one game only). Some of its checks open a real browser via Playwright,
which needs to be installed globally – see [`tools/README.md`](tools/README.md).

## Licence

Code and guide content are licensed separately – see [LICENSE](LICENSE) for details.

## Disclaimer

This is an unofficial, fan-made project. It is not affiliated with, endorsed by, or
sponsored by any game's publisher or developer. All game titles, characters and
trademarks referenced belong to their respective owners.
