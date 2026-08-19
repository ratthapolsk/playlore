# Verified-facts ledger — protocol

A game fact costs real tokens to verify: two independent sources, often three or four
fetches because half the good guide sites refuse automated requests. Verifying the same
fact again next month is pure waste. This directory is the memory that stops that.

**One file per game**, named after its folder — `ffx.md` covers `games/ffx/`.

---

## The protocol

**Before searching for a game fact, grep the ledger.**

```
grep -i "no encounters" docs/verified-facts/ffx.md
```

Then act on the entry's **status**:

| status | meaning | what you do |
|---|---|---|
| `confirmed` | two or more independent sources agree, both recorded | **Use it. Do not search again.** |
| `single-source` | only one source found it | Search for a second source, then upgrade the entry. |
| `disputed` | sources genuinely conflict, and both positions are recorded | Do not silently pick one. Read the entry, and if you resolve it, upgrade it with the deciding source. |
| `superseded` | a later entry corrected this one | Read the newer entry. The old one stays so it is obvious which pages were written against the wrong value. |
| *(no entry)* | never verified | Search, then **append a new entry**. |

**After verifying anything new, append it.** An agent that verifies a fact and does not
record it has spent the tokens and thrown away the result.

## What "proven" means here — the bar an entry must clear

An entry may only be marked `confirmed` if **all** of these hold. If any fails, it is
`single-source` or `disputed`, never `confirmed`.

1. **Two or more sources that are genuinely independent.** A wiki and a site that
   visibly copied that wiki are one source. A forum post agreeing with a guide is not a
   second source.
2. **Both source URLs are written into the entry.** "I checked two sources" with no URLs
   is not a record, it is a claim.
3. **The date and the game version are written down.** A fact can be true for HD
   Remaster and false for the PS2 original.
4. **The fact is stated as a value, not as a vibe.** `Purifying Salt ×30` is checkable.
   "You need a lot of Purifying Salt" is not.

**Never mark something `confirmed` because it sounds right, because a previous agent
said so, or because it is in the guide already.** The guide is what we are trying to
make correct — it is not evidence about the game.

## When play contradicts the ledger

If the person actually playing reports something different from an entry, the entry is
**wrong until re-verified**, not the player. Change its status to `disputed`, record what
they observed, and re-check. Their console is a better source than any website.

## Never delete an entry

Correcting a fact means adding a new entry and marking the old one `superseded`, with a
line saying which pages were written against the old value. Deleting it hides the fact
that pages may still carry the wrong number.

## Entry format

```markdown
### <the question, phrased the way someone would search for it>
- **Answer:** <the value, specific and checkable>
- **Status:** confirmed
- **Version:** HD Remaster / International
- **Verified:** 2026-08-15
- **Sources:**
  - https://…
  - https://…
- **Notes:** <anything that changes how the fact is used — a version difference, a
  common misconception it corrects, a page in this repo that depends on it>
```

## Sources that cannot be fetched directly

Recorded once here so nobody rediscovers it: `jegged.com` and `game8.co` fetch cleanly.
`finalfantasy.fandom.com` returns **HTTP 402**. `gamerguides.com`, `strategywiki.org`
and `gamefaqs.gamespot.com` return **HTTP 403**. Those four still work as sources — use
web-search result extraction rather than a direct fetch, and say so in the entry.

## Check a new entry against this file before marking it `confirmed`

Two agreeing outside sources are **not** sufficient on their own. Before adding an entry,
`grep` the ledger for the terms it touches. If an existing entry contradicts the new one,
that contradiction is evidence — **resolve it, do not overwrite it**, and record which
side won and why.

This rule exists because it was broken. On 2026-08-16 an entry claiming "Species Conquest
needs one of each fiend" was marked `confirmed` on two outside sources, while the
`No Encounters` entry already in the same file said "capture **4 of each** Drake-type
fiend" — a Species Conquest quota, and a direct contradiction. The wrong figure reached a
published page and was given to the reader as an answer before a research agent caught
it. One `grep` would have prevented it.
