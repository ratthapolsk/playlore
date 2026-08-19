---
name: stage-page
description: Writes or expands one stage page of a game walkthrough in this repo — the narrative content model where the page reads top to bottom like a novel in strict play order and every pickup, boss and puzzle is inline in the scene where it happens. Use when writing a new stage/chapter page, filling in an empty scaffolded page, expanding or rewriting an existing one, adding a boss block or a checklist, or when the user says "เขียนด่าน", "เติมเนื้อหาหน้านี้", "write stage NN", "fill in the walkthrough for X". Covers the three checkbox kinds (items, milestones, prep), the never-pad-a-checklist rule, the data-k accounting, and the two-source accuracy discipline.
---

# Write one stage page

This is the skill that makes these guides different from every other walkthrough. Read it
fully before writing markup.

**Language:** this file is configuration and is English. **Everything you write into the page
is Thai prose, with in-game terms left in English** — item, place, character, ability and
mechanic names are never translated (`Sphere Grid`, `Overdrive`, `Break Damage Limit`,
`Save Sphere`, `NavMap`). Translating them makes the sentence longer and *less* recognisable
to a player who is looking at an English screen. `CLAUDE.md` §2.

**Reference implementation:** `ffx/27-zanarkand-ruins.html` and `ffx/28-sin-assault.html`.
Read one of them before writing. Copy-paste markup blocks are in
[references/markup-library.md](references/markup-library.md).

---

## 1. The content model

**A stage page is read top to bottom like a novel, in strict play order:**

> enter the scene → where to go → what to do → what it unlocks → what you get

with the characters' mood carried through. The reader is following along while playing. They
scroll down as they walk forward. The checklist is support, not the spine.

**Everything is inline, in the scene where it happens.** A pickup is ticked at the moment the
player walks past it. A boss block sits where the boss appears. A puzzle walkthrough sits in
the room the puzzle is in. Preparation advice sits immediately before the fight it prepares
for, not in a general "tips" section.

**Nothing is gathered into an "items" or "bosses" section at the bottom.** A reader who has to
scroll to a summary table to find out what was in the room they just left has been failed by
the page. The only things that belong at the end are **pure lookup tables** — the fiend list,
the glossary — because those are consulted, not read.

So the section order of a real page follows the playthrough:

1. `#miss` — "พลาดแล้วหายถาวรไหม?" when this stage has anything permanently missable. This
   is the one section that jumps ahead of play order, because it exists to stop a reader
   losing something before they reach it. Omit the section entirely when nothing here is
   missable — do not write a section that says "nothing".
2. `#walk` — the walkthrough itself, in play order, with `<h3><span class="hn">N</span>…</h3>`
   numbering each scene. Every pickup, boss, puzzle, prep block and mood beat lives inside
   this section, in the scene where it occurs.
3. Optional dedicated sections for a set-piece big enough to want its own sidebar link — a
   Cloister puzzle, a long boss, a minigame. It still sits at the point in play order where
   the player meets it.
4. `#fiends` — the fiend lookup table.
5. `#gloss` — the glossary of terms used on the page.

### Carrying the mood

Each scene opens with a `.story` block. Two kinds, both used in `games/ffx/`:

- `<div class="story"><b>เนื้อเรื่อง:</b> …</div>` — what is happening in the plot.
- `<div class="story">💬 <b>บรรยากาศตอนนี้:</b> …</div>` — what the party is feeling right
  now, at this exact point, before the reader walks into the next room.

This is what makes the page readable rather than a list. It is not decoration: a reader who
knows *why* the party is walking into the dome remembers the route through it. Write it in
the present, from inside the scene.

### No compass directions

A player cannot tell north in-game. Describe movement by landmark, and by left/right
**relative to the way the player is walking** or to the camera the game gives at that point.
`ffx/26-gagazet-cave.html` states this convention to the reader in a `data-note` line; reuse
that wording rather than inventing a new one. `CLAUDE.md` §2.

### Cold-reader rule

Assume the reader has zero prior context and will not click anything to find out what you
meant. Define every ID, code, abbreviation and number on first use. Never point at "the
section above", a ticket, or an external doc. Use `<span class="term" title="…">` for a term
that needs a one-line gloss and `<span class="it">` for an item name.

---

## 2. The three kinds of checkbox

All three are equally valid and all three use `<li class="chk">` with a `data-k` key. What
differs is the container and its heading.

**1. Items** — anything picked up.

```html
<div class="pick"><h4>เก็บของในฉากนี้</h4><ul class="chklist">
  <li class="chk"><input type="checkbox" data-k="s27-fortune"><span class="lbl"><span class="it">Fortune Sphere</span> — กลางทางเดินช่วงแรกของซากเมือง</span></li>
</ul></div>
```

**2. Milestones** — story beats and one-time actions: a boss cleared, a character joining, a
conversation that gates something later. Use `.pick milestone`.

```html
<div class="pick milestone"><h4>เหตุการณ์สำคัญของฉากนี้</h4><ul class="chklist">
  <li class="chk"><input type="checkbox" data-k="s28-fayth-bahamut"><span class="lbl">คุยกับ <b>Fayth ของ Bahamut</b> ในห้องของเขาให้จบ — ตอบ <b>"I think so"</b> แล้วเลือก <b>"Defeat Yu Yevon"</b></span></li>
</ul></div>
```

**3. Preparation** — what to do before a fight. Use `.prep`, placed immediately above the
boss block it prepares for.

```html
<div class="prep"><h4>เตรียมตัวก่อนสู้</h4>
  <ul>
    <li><b>เกราะติด <span class="it">Berserk Ward</span> หรือ <span class="it">Berserkproof</span></b> — ท่า Berserk Tail ของมันทำให้คนของเราคุมไม่ได้</li>
  </ul>
</div>
```

Note that in `games/ffx/` the `.prep` list uses plain `<li>`, not `<li class="chk">` with a
checkbox — preparation is advice the reader reads before the fight, not progress they keep.
Match the reference implementation. If a stage genuinely needs a tickable pre-fight shopping
list, that is a decision to raise with the owner, not to introduce silently on one page.

### Never pad a checklist

**Some scenes genuinely contain nothing to collect.** When that is the truth, say so in one
`data-note` line so the reader stops hunting, and build the checklist from milestones
instead.

```html
<p data-note>🔑 ด่านนี้เป็นบทสอนระบบ ศัตรูทั้งหมดเป็นฉากบังคับ ไม่มีของหายากให้ฟาร์ม</p>
```

A short honest list beats a padded one. Padding shows up three ways, all of which have to be
resisted:

- Inventing a pickup that is not there, to make the count look respectable.
- Splitting one pickup into several checkboxes ("open the chest", "take the item").
- Adding a checkbox for something the game does automatically, which the reader cannot fail
  to do and therefore cannot usefully tick.

The honest count is the point. A reader who ticks 3/3 and knows that is everything trusts the
page; a reader who ticks 8/8 and later finds a fourth real item does not.

---

## 3. `data-k` — the keys are user data

Each checkbox carries `data-k="<prefix>-<slug>"` and its ticked state lives in the reader's
`localStorage`. **Renaming or removing a key silently erases progress they earned by
playing.** `CLAUDE.md` §5.

- Prefix by page: stage `NN` uses `sNN-`, side quests `rs-`, gear `rg-`.
- The slug names the thing, not its position — `s27-sun` for Sun Crest, not `s27-item3`. A
  positional key breaks the moment something is inserted above it.
- Keys are unique within the file.
- **Count keys before and after every edit and report both numbers.** Never remove one.

```bash
grep -c 'data-k="' ffx/27-zanarkand-ruins.html     # before, and again after
```

When you add or remove checkboxes, the index's per-stage `data-total` is now stale. Run
`node tools/sync-totals.js` — see the `verify-guide` skill.

If you believe an existing key is wrong, **report it, do not renumber it.** Changing a key to
a "better" one is indistinguishable, from the reader's side, from deleting their progress.

---

## 4. Accuracy — the rule that outranks everything else

The reader has finished this game and notices a wrong number instantly.

- **Never guess.** Every fact — an item location, a stat, a trigger, a price, a boss
  resistance, an HP value — is verified against **at least two independent sources** before
  it is written. Use the `game-fact-check` skill; it lists which sources fetch cleanly and
  which need web-search extraction instead.
- **Write to the primary version** named for this game (`games/ffx/` is HD Remaster /
  International). Call out a PS2-original difference only where it genuinely differs, and say
  which version you mean. `ffx/27-zanarkand-ruins.html` does this for Dark Bahamut guarding
  Sun Crest, and explicitly tells the reader that older guides describing the NA PS2 release
  are not wrong, just about a different version.
- **If something cannot be verified, write it as unverified or leave it out.** Never state it
  as fact and never quietly drop the doubt. The established convention for a table cell with
  no confirmed value is `—` plus a `data-note` explaining that `—` means "not confirmed", not
  "nothing there":

  ```html
  <p data-note>ช่องที่ใส่ "—" คือช่องที่ยังไม่มีข้อมูลดรอป/ขโมยที่ยืนยันตรงกันระหว่างแหล่งอ้างอิง จึงเว้นไว้แทนการกรอกมั่ว ไม่ได้แปลว่ามอนตัวนั้นไม่มีของ</p>
  ```

- **Never delete or reword existing content because it looks wrong.** Verify first. If it is
  wrong, correct it *and say so in your report*. If you cannot verify it, leave it and report
  it. Content loss is the one unrecoverable mistake here. `CLAUDE.md` §4.

---

## 5. House style, non-negotiable

These are enforced by the harness or by the reader, and every one of them has been paid for
already:

- **The inline separator is `" – "` (spaced en dash).** `" · "` is forbidden, and so is a bare
  `·` anywhere in page text. The harness fails on it.
- **Every bullet is a complete sentence that stands on its own.** Terse is fine; clipped is
  not. One bullet, one idea — do not chain three thoughts with "และ".
- **No `<style>` blocks and no inline `style=` that sets `font-size`.** All styling lives in
  the shared stylesheet. `CLAUDE.md` §1.
- **Never hardcode a hex colour in a diagram.** Use the theme tokens (`var(--ink)`,
  `var(--cyan)`, `currentColor`). The reader toggles dark mode and a hardcoded colour
  disappears.
- **No `fetch`/`XHR`/`import`, no CDN links, no external images.** The page opens from
  `file://`. Vector art is inline `<svg>`.
- **The page must work with JavaScript doing nothing.** Content is visible on load, never
  revealed by an animation. Ship `data-progress="all"` with the literal text `0/0`.
- **Add `<span class="sec-count" data-count>0/0</span>` to the `<h2>` of every section that
  contains checkboxes**, and to no other section. `app.js` fills it in and mirrors the state
  onto the sidebar link.
- **`nav.toc` stays a direct child of `.wrap`**, with one `<a href="#id">` per section that
  actually exists. Nest it one level deeper and the desktop sidebar silently stops rendering.

---

## 6. Before you say the page is done

1. `grep -c 'data-k="' <file>` — report the before and after counts.
2. Every `nav.toc` link resolves to a section `id` on the page, and every section with
   checkboxes has its `sec-count` span.
3. `node tools/verify-all.js <game>` passes. Never claim a visual or structural result from
   reasoning — run it. See the `verify-guide` skill.
4. `node tools/sync-totals.js` if the checkbox count changed.
5. In your report, list: sections written, checkbox count before/after, every fact you could
   not verify against two sources, and anything in the existing content you believe is wrong
   but did not change.

**Do not commit.** `CLAUDE.md` §8.
