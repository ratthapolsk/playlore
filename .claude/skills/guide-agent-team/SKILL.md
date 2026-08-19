---
name: guide-agent-team
description: Runs a multi-agent pass over a game folder in this repo — splitting stage pages across agents, writing the briefs, and verifying every claim before accepting it. Use when orchestrating parallel work on a walkthrough (many pages at once, a fact-check sweep, a QA pass, a whole new game), when deciding which agent owns which file, when two agents disagree, or when the user says "แบ่งงานให้ agent", "รันทีม", "run the team on X", "parallel pass", "fan out over the pages". Enforces one file one owner, report-never-edit for other people's files, routing fact work only to agents with web tools, and includes a reusable brief template.
---

# Run a multi-agent pass over a game

## 0. First decide whether to fan out at all

**The default is one agent, or none.** A multi-agent pass is for work that is genuinely
wide — many pages at once, a sweep across a whole game folder — not for a task a single
pass can hold. One agent with a batched brief costs far less than one agent per item and
usually answers better, because it sees how the pieces relate, and the item that only makes
sense beside another item is exactly what a narrow brief drops.

Every agent re-reads this repo's context from nothing. **The setup cost is paid per agent,
not per question**, so five narrow agents pay it five times to answer what one agent could
have answered once.

Fan out only when both are true: the pieces are **independent** (no agent needs another's
answer) and they are **too large for one** (one agent would run out of room, or they need
different tools). Before spawning N agents, ask what a single well-batched agent would
miss. If the honest answer is "nothing", spawn one.

**Scale to the evidence already in hand.** When the person asking has already tested
something on their own console, the pass is small: fill the gaps they could not see, and
catch the places where a correct observation has picked up a wrong explanation. It is not a
reason to re-derive what they watched happen.

Fanning out across 30 stage pages is the only practical way to build a game folder. It is also
the fastest way to lose content, duplicate work, and ship two pages that contradict each
other. These rules exist because each failure has already happened here. `CLAUDE.md` §7.

**Never write a subagent's private codename into any file in this repository** — briefs, page
comments, reports, commit messages, anything committed. The animal codenames in the user's
agent configuration are internal orchestration labels, not for publication; other people read
and maintain this repo. When an artifact must name a responsible party, use a neutral role:
Developer, Reviewer, Solution Architect, QA, Project Manager, Technical Writer — or add no
attribution at all. Codenames are fine in chat and in session todos; never in a file.

---

## The five rules

**1. One file, one owner. Always.**

Never let two agents write the same file. Give every agent an explicit *"you own exactly these
files"* line naming full paths, and an explicit *"you own nothing else"* line. Two agents
editing one page do not merge — the second write wins and the first agent's work is gone with
no error and no diff to notice it in.

Shared assets (`style.css`, `app.js`, `fx.js`, `art.css`, `art.js`, `gimmicks.css`,
`gimmicks.js`) get **one owner for the whole run**, or no owner at all. A stage-page agent
never edits a shared asset; it reports what it needs.

**2. An agent that finds a problem in someone else's file reports it, never edits it.**

This is the rule that keeps rule 1 from quietly failing. A helpful cross-file fix is
indistinguishable from a collision. The report must carry: the file, the location, the current
text, the proposed text, and the evidence. The orchestrator verifies it and applies it — after
the owning agent has finished, never while it is running.

**3. Role agents have no web tools.**

The role-based agents in this environment — the Developer, Technical Writer, UX and Analyst
roles — have file and shell tools only, with no `WebSearch` and no `WebFetch`. Check the agent
definition before dispatching; do not assume. **Any task that needs a game fact verified must
go to an agent that has web search and fetch.** A brief that says "write the boss block for
Yunalesca" sent to an agent without web access produces a confident, plausible, unverifiable
boss block — the exact failure this repo cannot absorb.

Split the work accordingly: fact-gathering agents (web tools) produce a verified fact sheet;
writing agents (file tools) turn that sheet into Thai prose and markup and are told explicitly
*"every fact you need is in this brief — if something is missing, report it, do not fill it
in."*

**4. Verify every agent's claim against the source of truth before accepting it.**

Not the agent's summary of what it did — the file, the harness output, the source page.
An agent reporting "added 9 checkboxes, all verified" is a claim, not a result.

`grep -c 'data-k="' <file>` is the result. `node tools/verify-all.js <game>` is the result.

**Agents in this repo have contradicted each other on a game mechanic. The orchestrator
settled it with a search, not by picking the more confident answer.** Confidence is not
evidence and it does not correlate with correctness — an agent that guessed states its guess
in exactly the same tone as an agent that checked. When two reports disagree:

- Do not average them, and do not pick the one with more detail.
- Go to the sources yourself, with the `game-fact-check` skill.
- Tell both agents the resolution and the evidence, so neither carries the wrong belief into
  its next page.
- If neither is confirmable, the fact is written as unverified or left out — never quietly
  resolved in favour of whoever answered first.

**5. Give self-contained specs. A vague brief produces confident, wrong output.**

The agent doing the work cannot see your reasoning, the other briefs, or this conversation.
Everything it needs is in its brief or it is not there. Use the template below.

---

## Sequencing a pass

**Fan out only over genuinely independent units.** One stage page is independent. "Stage 19
and the airship section of the index" is not — that is one unit with two files, and it goes to
one agent.

A workable order for a whole game:

1. **Facts first.** Web-enabled agents produce a verified fact sheet per stage — pickups with
   locations, bosses with HP and mechanics, missable windows, drop and steal tables, with
   sources named and unverified items flagged. Nothing is written into a page yet.
2. **Pages in parallel.** One agent per stage page, each handed its own fact sheet and the
   `stage-page` skill. Neighbour links are decided by the orchestrator up front, not
   negotiated between agents, so page `NN`'s "next" and page `NN+1`'s "previous" always agree.
3. **Index and reference pages after**, once the stage pages exist and their checkbox counts
   are real.
4. **Verification pass**, run by the orchestrator, not by the agents who wrote the pages —
   `node tools/verify-all.js`, then `node tools/sync-totals.js`, then `verify-all.js` again.
5. **Cross-page consistency review** — a reviewer agent that reads and reports but owns no
   page, checking that terminology, the version claim, and cross-references agree across the
   folder.

Keep every batch's file ownership disjoint. When a fix has to cross a boundary, it goes back
through the orchestrator.

---

## The brief template

Every brief has these sections. A brief missing any of them is not ready to send.

```text
## File ownership
You own exactly: <absolute path(s)>
You own nothing else. Do not create, edit, rename or delete any other file — not the
shared assets, not the index, not another stage page.
If you find a problem in a file you do not own, REPORT it with file, location, current
text, proposed text and evidence. Do not edit it.

## Task
<What this page covers, in play order: the scene boundaries, the bosses, the puzzles,
the payoff. Name the stage number, the file slug and the neighbouring pages.>

Read and follow the `stage-page` skill. It defines the content model, the markup and the
house style. Do not invent an alternative structure.

## Facts you may use
<The verified fact sheet, inline. Each fact with its two sources.>
Anything not in this list is NOT verified. If you need a fact that is missing, REPORT it
and leave a clearly marked gap — never fill it in from memory or inference.
<If the agent has web tools, say so and require the two-source rule from the
`game-fact-check` skill instead.>

## The honest-count rule
Never pad a checklist. If a scene genuinely has nothing to collect, say so in one
`data-note` line so the reader stops hunting, and build the checklist from milestones
(`.pick milestone`) instead. Do not invent pickups, do not split one pickup into several
checkboxes, do not add a checkbox for something the game does automatically.
A short honest list beats a padded one.

## House style
- Prose is Thai. In-game and technical terms stay in English (Sphere Grid, Overdrive,
  Save Sphere, NavMap). Never translate them.
- Inline separator is " – " (spaced en dash). A bare "·" is forbidden anywhere in page text.
- Every bullet is a complete sentence that stands on its own. One bullet, one idea.
- No compass directions. Describe movement by landmark and by left/right relative to the
  way the player is walking.
- Cold-reader rule: define every ID, code, abbreviation and number on first use. Never
  point at "the section above" or an external doc.
- No <style> blocks, no inline style= setting font-size, no hardcoded hex colours, no CDN
  links, no fetch/XHR. The page opens from file://.
- The page must be readable with JavaScript doing nothing.
- Primary version for this game: <version>. Every fact is about that version. Call out a
  difference in another release only where it genuinely differs, and say which is which.

## data-k accounting
Prefix for this page: `<sNN->`. Keys are lowercase, hyphenated, unique in the file, and
named after the thing, not its position (`s27-sun`, never `s27-item3`).
These keys are reader progress in localStorage. Renaming or removing one erases it.
Count before and after: `grep -c 'data-k="' <file>` — report BOTH numbers.
Never remove a key. If you believe an existing key is wrong, report it; do not renumber it.

## Done means
- Every section in the page has content; no placeholder text remains.
- `nav.toc` is a direct child of `.wrap`, and every link resolves to a section id on the
  page. Every section containing checkboxes has its `<span class="sec-count" data-count>`.
- `grep -c 'data-k="' <file>` reported before and after.
- `node tools/verify-all.js <game>` run, and its output pasted into your report.
- Your report lists: sections written, checkbox count before/after, every fact you could
  not verify, and every problem you found in a file you do not own.
- You did NOT commit. Not even when it is finished and verified.
```

---

## Accepting an agent's work

Do not accept a report at face value. Before marking a unit done:

1. Open the file. Confirm the sections exist and the placeholders are gone.
2. `grep -c 'data-k="' <file>` yourself — compare to the reported numbers.
3. Run the harness yourself; do not rely on pasted output alone if anything else looks off.
4. Spot-check two facts against sources, choosing the two most checkable numbers on the page.
5. Read the "could not verify" list. An empty list on a dense page is itself a warning sign —
   real work on a real game always produces a few unresolved items.
6. Collect every cross-file report and apply the verified ones yourself, after the owning
   agent has finished.

Then, and only then, the unit is done — and still nothing is committed. `CLAUDE.md` §8.
