---
name: git-ship
description: Commit and push work in this walkthrough repo — branch, verify, stage, commit, push, then re-check that the agent-instruction files and docs still describe reality. Use when the user asks to commit, push, ship, or "git ship", says "commit ให้หน่อย", "push ขึ้นไป", or asks for a PR. Enforces the never-commit-unasked rule, the verification gate, and the closing documentation sweep that keeps CLAUDE.md, AGENTS.md, GEMINI.md, README.md and the editor rule files from drifting away from the repo they describe.
---

# git-ship

Ship work: branch → **verify** → stage → commit → push → **documentation sweep**.

Two steps here exist because they were skipped before and cost real rework: the
**verification gate** (step 3) and the **documentation sweep** (step 7). Neither is
optional, and both are reported to the user even when they find nothing.

## 0. Confirm you were actually asked

`CLAUDE.md` §9: **do not commit unless explicitly asked**, even when the work is finished
and verified. "The work is done" is not permission. If nobody asked, stop here and report
that the work is ready to ship instead.

## 1. Look before touching anything

```bash
git status
git log --oneline -3
git branch --show-current
```

Read the diff of anything you did not write yourself this session. You are about to make
it permanent.

## 2. Branch

Never commit on the default branch. If you are standing on it, branch first:

```bash
git checkout -b <type>/<kebab-slug>
```

`type` is one of `feat` `fix` `content` `chore`. Use `content` for guide-writing work,
since most changes here are prose and data rather than code.

## 3. Verification gate — run it, do not reason about it

```bash
node tools/verify-all.js            # whole repo
node tools/verify-all.js <game>     # one game folder
```

**A non-zero exit means you do not commit.** Fix it, or if the harness itself is wrong,
fix the harness — but do not ship red.

If checkbox counts changed anywhere, also run:

```bash
node tools/sync-totals.js
```

and include its output in the commit if it changed anything.

**If a harness result contradicts something you know is fine, suspect the harness first.**
That has been the correct call every time in this repo — see `docs/lessons.md`.

## 4. Stage deliberately

Stage the files this change actually touched. **Do not reach for `git add -A`** unless you
have just read `git status` and every listed file belongs to this change.

Things that must never be staged: secrets or credentials of any kind, and the private
agent codenames the owner uses in chat. A hook blocks the codenames in file content, but
a hook does not read commit messages — **you do**.

## 5. Commit

```
<type>(<scope>): <summary in English>

<body: why, not what — the diff already says what>

Co-Authored-By: <as the session specifies> <noreply@anthropic.com>
```

Scope is the game folder or the area — `ffx`, `docs`, `tools`, `hooks`.

**Commit messages are English**, like every other artefact an agent reads.

## 6. Push

```bash
git push -u origin <branch>
```

Report the PR URL back to the user.

## 7. Documentation sweep — always, and always reported

Work reshapes the repo while the documents that describe it stay still. Nobody notices
until someone reads a map that no longer matches the ground. **This is the step that gets
skipped, so it is written as a required step rather than a suggestion.**

Derive the list rather than trusting a frozen one, so it keeps working when files are
added:

```bash
# every agent-instruction file at the repo root and in editor config
ls CLAUDE.md AGENTS.md GEMINI.md README.md 2>/dev/null
ls .github/copilot-instructions.md .cursor/rules/*.mdc 2>/dev/null
ls docs/*.md docs/verified-facts/*.md .claude/skills/*/SKILL.md
```

Then check each against what actually changed:

| File | What to check |
|---|---|
| `CLAUDE.md` | It is the source of truth. Any rule the session established, any constraint discovered, any new directory or tool — is it here? Does anything here now contradict the code? |
| `AGENTS.md` | Carries the same rules for Codex, Cursor, Jules and Copilot's agent. It is deliberately self-contained, so a rule added to `CLAUDE.md` must be reflected here too, not linked. |
| `GEMINI.md` | Thin — it `@`-imports `AGENTS.md`. Usually needs no change; confirm the import path still resolves. |
| `.github/copilot-instructions.md` | Also deliberately self-contained, because GitHub warns against instructions that send the model to read another file. Same rules restated. |
| `.cursor/rules/*.mdc` | Frontmatter still valid, and `alwaysApply` still set for the always-on rule. |
| `README.md` | Written **in English** — the project is public, so the front door has to be readable by anyone who finds it. Check the feature list, the folder layout and the "how to open it" steps still match the repo. |
| `docs/*.md` | Written **in English for agents**. A new class, check, threshold or content rule belongs in the matching document. |
| `docs/verified-facts/*.md` | Every fact verified this session recorded, with two sources and a date. **A fact verified and not written down was paid for and thrown away.** |
| `.claude/skills/*/SKILL.md` | If this session found a way of working worth repeating — or a mistake worth never repeating — it belongs in the relevant skill. |
| `.claude/hooks/*` | If a rule became non-negotiable, consider whether it should be enforced rather than requested. An instruction is a request; a hook is a guarantee. |

**Language rule while sweeping:** anything an agent reads is **English**
(`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, the Copilot and Cursor files, everything under
`docs/`, every `SKILL.md`, and commit messages). Anything a human reads may be Thai —
today that is the guide pages themselves under each game folder. `README.md` is the
exception among human-facing files: it is English, because the repository is public.

**What slips most often:** adding a script under `tools/` and not describing it; setting a
new rule mid-session and writing it into one file instead of all the agent-instruction
files; and verifying a game fact without appending it to the ledger.

If anything is out of date, fix it **on the same branch** and commit on top. If nothing
is, **say so out loud** — the user cannot tell "checked and clean" apart from "forgot to
check".

## Closing checklist

- [ ] The user actually asked to commit
- [ ] Not on the default branch
- [ ] `node tools/verify-all.js` exits zero
- [ ] `node tools/sync-totals.js` re-run if checkbox counts moved
- [ ] No secrets, no credentials, no private codenames — in the files **or** the message
- [ ] Every staged file belongs to this change
- [ ] Documentation sweep done **and reported**, including when it found nothing

## Notes

- No branch name given? Derive one from the change and say what you chose.
- Unrelated uncommitted changes present? Warn the user and leave them unstaged.
- **Never force push**, and never skip hooks or signing, without an explicit instruction.
