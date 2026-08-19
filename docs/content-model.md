# How to Write a Stage Page — the Content Model of This Guide Collection

This document explains what the "style" of this guide collection is, structurally — so
that the next game reads the same way once it's written, not just looks the same
through shared CSS. Classes and tokens live in [`design-system.md`](design-system.md);
overall rules live in [`../CLAUDE.md`](../CLAUDE.md).

---

## 1. The one principle everything else builds on

**A stage page is read top to bottom in one pass, like a novel — not a database to
search.**

The person reading this guide is playing the game right now. They don't want "a list of
the items in stage 12" — they want to know **where am I right now, and what do I do
next**. So the order of content on the page has to match the order the player's hands
actually move in the game.

The shape of one scene is **enter the scene → where to go → what to do → what it
unlocks → what you get**, with the characters' mood carried through the whole way. That
isn't decoration — it's what lets the reader tell where they are in the story.

**The checklist is support, not the spine.** If you strip every checklist off the page
and a player can still follow it all the way through to the end of the stage, the page
is written correctly. If removing the checklist leaves the reader lost, that page has
hidden too much of its content inside the checklist.

## 2. Everything is inline in the scene where it happens — nothing is piled up at the bottom

This is the rule that most clearly separates this guide collection from a typical
walkthrough.

- **A pickup is ticked at the exact spot the player walks past it**, not inside an
  "items in this stage" box at the bottom of the page.
- **A boss block sits exactly where the boss appears**, with the preparation block
  immediately before it.
- **A puzzle walkthrough sits in the room the puzzle is in**, not gathered under an
  "all puzzles" heading.

The practical reason: the player scrolls the page in step with the character walking.
If the pickup for this exact moment sits another 2,000 pixels further down, they will
walk right past it without noticing — and only realize it once it's too late to go back
for it.

**The only thing allowed at the bottom of the page is a lookup table** — something the
reader jumps to occasionally rather than reading in sequence, such as a monster table
for the stage, or a glossary.

## 3. There are three kinds of checkbox, and all three carry equal weight

People tend to assume a checkbox exists only to tick off items, which turns a stage
with no pickups into a page with nothing to tick at all — even though the player *does*
plenty of things in that stage.

1. **Items** – anything that goes into the inventory. Use `.pick`.
2. **Milestones** – a one-time action that changes the state of the game: a boss
   defeated, a character joining the party, a conversation that unlocks something
   later. Use `.pick milestone`.
3. **Preparation** – something the player must do *before* the action starts: equip a
   status-guard ability, set the party lineup, save to a fresh slot. Use `.prep`.

**A game's opening stage and its final stage often have no pickups at all**, and that's
true to the game — not a gap in the guide. What those stages are actually made of is
milestones and preparation.

## 4. Never pad a checklist to make it look bigger

When a scene genuinely has nothing to collect, **say so directly with a one-line
`data-note`** stating that the scene has no chests, so the reader stops hunting for one
— then build the checklist out of milestones and preparation instead.

A checklist that is short but true beats a long one padded with filler, because the
moment a reader ticks everything off and then discovers they still missed something,
they stop trusting the checklist for the entire guide.

**To measure whether a page is abnormally thin**, run `node tools/verify-all.js`, which
measures checkbox count against page size and compares it to the game-wide median. A
page that's off by several multiples is worth going to look at — but the result means
"go check it," not "go pad it out." Some pages genuinely turn out to be thin, and
that's fine.

## 5. A checkbox label has to be actionable the moment you read it

One label must state all three of **what you get – where it is – how to get it**
without the reader having to scroll off to read anything else.

- Bad: `Lv.2 Key Sphere`
- Good: `Lv.2 Key Sphere — รางวัลจากบททดสอบ Dodger Chocobo ของครูฝึกโชโกโบที่ Calm Lands`
  (Thai for: "Lv.2 Key Sphere — the reward for the Chocobo Trainer's Dodger Chocobo
  trial at the Calm Lands.")

The bad version states only what you get. The good version states what, where, and how
in the same label, because the reader will come back to this page later during an
end-game pickup sweep, by which point they've forgotten all the context of the scene —
all they see is the label itself.

## 6. Give directions with a landmark — never with a compass direction

**A player cannot tell where north is.** The game has no compass on screen, so writing
"walk east" hands the reader information they have no way to use.

Give directions with **a visible landmark plus left/right relative to the direction the
character is currently walking**.

- Bad: `หีบอยู่มุมตะวันออกเฉียงเหนือของแผนที่` (Thai for: "the chest is in the
  northeast corner of the map") — a compass bearing the player has no way to check
  in-game.
- Good: `เดินตามทางลาดลงไปจนสุด พอเห็นผนังหินที่มีสัญลักษณ์สลัก ให้หันไปทางซ้ายมือ
  หีบวางอยู่ติดผนัง` (Thai for: "Follow the ramp down to the end. Once you see the
  stone wall with the carved symbol, turn left — the chest is against the wall.") —
  landmark plus a relative direction, verifiable purely from what's on screen.

If there's genuinely no way around it, anchor to something that **cannot rotate with
the camera** — for example `"ฝั่งเดียวกับที่เดินเข้ามา"` (Thai for: "the same side you
walked in from") or `"ฝั่งตรงข้ามกับ Save Sphere"` (Thai for: "the side opposite the
Save Sphere").

## 7. A permanent loss must be warned about before the point it happens

A warning placed *after* the point where the loss has already happened is worth exactly
as much as no warning at all.

- The warning block must sit **above** the step that causes the loss, far enough above
  it that a reader scrolling quickly still sees it.
- It must state clearly whether missing it means the item is **truly gone for good**,
  or just **something to come back for later** — the two cases lead the reader to very
  different decisions.
- A point of no return must name **the exact action that locks it in**, not just the
  name of an area, because the reader needs to know whether they can walk in and look
  around, or whether stepping in ends it right there.

## 8. Writing tone

- **Write like you're telling a friend the story, not drafting an official manual** —
  but never trade clarity away for charm.
- **Mood is allowed, and should be written**, but keep it inside the narrative block,
  separate from the actionable steps. A reader in a hurry must be able to skip the mood
  and go straight to the steps.
- **Never spoil beyond the scene currently being described.** This guide is read
  alongside a first playthrough, and revealing stage 27's twist back at stage 13 ruins
  the game for the reader. If it has to be mentioned at all, say only something as
  vague as `"เรื่องนี้จะเฉลยที่ด่าน 27"` (Thai for: "this gets revealed in stage 27").
- **One bullet, one idea, and it has to be a sentence that stands on its own when read
  out of context.** Short is fine; cutting it down to a clipped phrase is not.
- **Every in-game term stays in English**, because the reader is looking at a screen
  that's written in English — translating `Sphere Grid` into Thai means they can't find
  it on their own screen.

## 9. A reference page is not the same thing as a stage page

Reference pages (weapons/armor, skills, side quests) are **the only place content is
allowed to be grouped by topic**, because the reader opens one already knowing what
they want to look up — they are not reading it in play order.

But two things still have to hold: **every table needs a line explaining what its
numbers mean**, and **every entry has to say where it comes from**, not just state that
it exists.

A stage page and a reference page must link to each other instead of duplicating
content — the same fact written in two places is a fact that will eventually contradict
itself, which has already happened once in this repo.

## 10. The shape of one stage page, summarized

```
hero            stage title + a badge stating what this stage's headline content is
nav.toc         in-page table of contents (must be a direct child of .wrap, or the sidebar breaks)
callout warn    permanent losses in this stage, if any — always sits at the very top
story           opens the scene, sets the mood, states where this scene falls in the story

section scene 1   story → ol.steps → .pick / .prep / .skill inserted exactly where they happen
section scene 2   ...any scene with a boss gets a .prep block followed right after by .boss
section scene n   ...any scene with a puzzle gets .puz / .pmap right there in that room

section table    monster list for the stage (a lookup table — allowed at the bottom)
section gloss    terms worth knowing (a lookup table — allowed at the bottom)
```

## 11. Checklist before calling it done

1. Read the whole page in one pass without skipping, then ask: **can a player follow
   this all the way to the end of the stage?**
2. Mentally strip out every checklist, then ask: **can they still follow it?**
3. Every checkbox sits **in the scene where it happens**, not piled up at the bottom of
   the page.
4. Every loss warning sits **before** the point where the loss happens.
5. There are no compass directions anywhere.
6. Every number **has two independent sources**, and has been logged in
   [`verified-facts/`](verified-facts/).
7. `node tools/verify-all.js` passes, and not a single `data-k` was lost.

## 12. The word "พลาด" is reserved for permanent loss only

Every stage page carries a heading **`"พลาดแล้วหายถาวรไหม?"`** (Thai for: "If you miss
it, is it gone for good?"). Because of that heading, this guide collection reads the
word **`"พลาด"`** (Thai for: "missed") as automatically meaning "didn't get it in time,
and it's gone for good" — never use it for something the player can still go back and
collect.

- For something that is **genuinely gone for good** – use the word **`พลาด`** freely.
- For something the player **just walked past and can still come back for** – use
  `"คนเดินผ่านโดยไม่รู้ตัว"` (Thai for: "easy to walk right past without noticing") or
  `"มองข้ามบ่อย"` (Thai for: "often overlooked"). Never use `พลาด` for this case.
- For something that's **simply not unlocked yet** – use `"ติดล็อก"` (Thai for:
  "locked") and state the unlock condition, since this is neither of the two cases
  above.

**Why this one word gets such strict treatment:** the reader decides, based on that
single word, whether to stop the story right now and backtrack for the item. If we call
something recoverable "พลาด," they waste time backtracking for nothing. If we describe
something permanently lost with a softer word, they lose the item outright — **getting
it wrong either way costs the reader something real.**

On a page that mixes both cases, state at the very top which sense the page is using —
the way `games/ffx/reference/ref-monster-arena.html` does.

## 13. A place name is not a location — say what kind of place it is, and how to reach it

A reader of this collection read the line **"Jupiter Crest — Luca, the Besaid Aurochs
locker room"** and took **Luca** for a person's name. Nothing in the line said it was a
city. The fact was correct and completely unusable.

A player mid-game does not carry the world map in their head, and a player returning
after years carries less. **A bare proper noun tells them nothing.** Every location
reference therefore states three things:

1. **What kind of place it is.** `the city of Luca`, `Bikanel island`, `Mt. Gagazet`. The
   category word is what turns a name into a place.
2. **The route inward**, one level at a time: `Luca Stadium` → `the basement` → `the
   Besaid Aurochs locker room` → `the back of the room`. Stop at the level the player can
   actually see on screen.
3. **How to travel there, and whether they still can.** On foot during which chapter, by
   airship afterwards, or not at all. "Luca is an ordinary NavMap destination, so you can
   fly back whenever" answers a question the reader would otherwise have to go and test.

The test: **could a reader who has never heard the name find it without asking anyone?**
If the line only works for someone who already knows the map, it is not finished.

**Fix the class, not the reported instance.** When a reader reports one bad location line,
every location line gets the same treatment in the same pass. This repo has already paid
for that lesson twice — once with an ability that was wrong for two characters and fixed
only for the one that was reported, and once here.
