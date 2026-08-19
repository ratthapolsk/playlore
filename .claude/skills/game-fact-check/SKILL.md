---
name: game-fact-check
description: Verifies a game fact before it is written into a walkthrough page — item locations, boss HP and resistances, drop and steal tables, prices, triggers, missable windows, version differences. Use before writing any number or claim into a guide, when two sources disagree, when a fact cannot be confirmed, or when the user says "เช็กข้อมูล", "หาข้อมูล", "ตรวจสอบว่าจริงไหม", "verify this fact", "is this right". Covers the two-source rule, which sites fetch cleanly (jegged.com, game8.co) and which block automated fetching and need web-search extraction instead (finalfantasy.fandom.com returns 402; gamerguides.com, strategywiki.org, gamefaqs.gamespot.com return 403), how to handle disagreement, and how to report a contradiction in existing content instead of editing it away.
---

# Verify a game fact

**The reader has finished this game and notices a wrong number instantly.** Accuracy is the
rule that outranks everything else in this repo — `CLAUDE.md` §4. A page that is beautiful and
wrong is worse than no page.

**Never guess.** Not about an item location, a stat, a trigger, a price, a boss resistance, a
drop rate, or which version a behaviour belongs to. If you find yourself reasoning from what
would "make sense" for the game, stop: that is guessing with extra steps.

---

## The two-source rule

**Every fact is verified against at least two independent sources before it is written.**

Independent means genuinely separate — not a wiki and a site that mirrors that wiki, not two
pages of the same guide, not two search results that both quote the same original. If both
sources trace back to the same author, you have one source.

For a number the reader will check against their screen — boss HP, a drop rate, a price, a
required item count — two sources is the floor, not the target. When a third is cheap, get it.

### Pin the version first

State which release you are verifying against **before** you search, and search for that
release. `games/ffx/` is **HD Remaster / International**; PS2-original differences are called out
only where they genuinely differ. A correct fact about the wrong version is a wrong fact.

The clearest example already in the repo: in `ffx/27-zanarkand-ruins.html`, missing Sun Crest
means facing Dark Bahamut (HP 4,000,000) to get it back — but the North American PS2 release
has no Dark Aeons, so older guides describe returning for it freely. Both statements are true
about different releases. The page says which one it means and warns the reader not to trust
the older guides. Do that, rather than picking one and dropping the other.

---

## Which sources work, and how to reach them

This is measured behaviour for this environment, not a ranking of quality.

**Fetch cleanly — use `WebFetch` directly:**

| Source | Notes |
|---|---|
| `jegged.com` | Detailed walkthrough with item-by-item room coverage. Strong for pickup locations and route order. |
| `game8.co` | Structured boss pages, drop and steal tables, stat blocks. Strong for numbers. |

**Refuse automated fetching — do not call `WebFetch` on these:**

| Source | Response |
|---|---|
| `finalfantasy.fandom.com` | HTTP 402 |
| `gamerguides.com` | HTTP 403 |
| `strategywiki.org` | HTTP 403 |
| `gamefaqs.gamespot.com` | HTTP 403 |

For those four, use **web-search result extraction**: run a `WebSearch` narrow enough that the
answer appears in the result snippets, and read the fact out of the snippet. A search result
snippet from a blocked source counts as a source; a fetch attempt that returned 402 or 403
does not — an error page is not evidence, and must never be reported as "could not confirm,
so probably false".

Do not try to work around a block with a proxy, a cache view, or a mirror. A mirror is not an
independent source anyway.

**Search phrasing that works.** Put the game, the release and the exact in-game noun in the
query, in English, spelled as the game spells it: `FFX HD Remaster Spectral Keeper HP steal
drop`. In-game proper nouns are the highest-signal search terms available; the Thai prose is
for the page, never for the query.

---

## When sources disagree

**Never silently choose.** Picking the more confident-sounding source and moving on is the
failure mode this rule exists to prevent.

Two acceptable resolutions:

1. **State both and pick the better-supported one**, saying why in the page text — a third
   source agrees with it, or one source is explicitly about a different release. The reader
   who owns the other version needs to know the other number exists.

2. **Write it as unverified.** The established convention for a table cell with no agreed
   value is `—`, plus a `data-note` line stating that `—` means "no confirmed data", not
   "nothing there":

   ```html
   <p data-note>ช่องที่ใส่ "—" คือช่องที่ยังไม่มีข้อมูลดรอป/ขโมยที่ยืนยันตรงกันระหว่างแหล่งอ้างอิง จึงเว้นไว้แทนการกรอกมั่ว ไม่ได้แปลว่ามอนตัวนั้นไม่มีของ</p>
   ```

   In prose, mark the doubt in the sentence itself rather than in a comment the reader never
   sees. An HTML comment is not a disclosure.

**Never state it as fact and never quietly drop the doubt.** Leaving the fact out entirely is
always available and always better than a confident wrong number.

Common causes of a real disagreement, worth checking before you call it unresolvable: the two
sources describe different releases; one describes a New Game Plus or post-game state; one
lists a rare drop and the other the common drop; one gives a value before a difficulty or
version rebalance.

---

## When existing content contradicts what you found

**Never delete or reword existing content because it looks wrong.** `CLAUDE.md` §4. Content
loss is the one unrecoverable mistake in this repo.

The order is fixed:

1. **Verify to the two-source standard first.** Your recollection of the game is not a source,
   however strong. A page written by someone who checked two sources outranks an agent's
   confident memory.
2. **If it is wrong and you own the file: correct it, and say so explicitly in your report** —
   what it said, what it says now, and the two sources. A silent correction is
   indistinguishable from a silent corruption when someone reviews the diff later.
3. **If it is wrong and you do not own the file: report it, do not edit it.** One file, one
   owner. Give the file, the line, the current text, the correct text and your sources, and
   let the orchestrator apply it.
4. **If you cannot verify it: leave it and report it.** Unverified is not the same as wrong.
   Flag it as needing a check; do not remove it.

The same applies to a `data-k` key that looks wrong. Those keys are reader progress in
`localStorage` — renaming one is indistinguishable, from the reader's side, from deleting
their save. Report, never renumber.

---

## Reporting a verified fact

When you hand a fact back, give the orchestrator enough to accept it without repeating your
work:

- The claim, stated exactly as it should appear.
- The release it applies to.
- Both sources, named, with what each said. Say which were fetched and which were read from
  search snippets.
- Any disagreement you found and how you resolved it.
- An explicit list of anything you could **not** verify, so it can be marked unverified or
  cut rather than quietly shipped.

If you have no web tools, say so and stop. Do not answer a fact question from memory and do
not infer it from other pages in the repo — a page repeating an unverified number does not
make it verified. Escalate to an agent that has search access. `CLAUDE.md` §7.
