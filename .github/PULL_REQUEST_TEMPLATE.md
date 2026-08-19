<!--
Thanks for contributing. This template is short on purpose – please fill it in rather
than deleting it. The rules behind each question are explained in CONTRIBUTING.md.
-->

## What changed, and why

<!-- A couple of sentences. If you corrected something that was wrong, say what it used
     to say, so the mistake is visible in the history rather than quietly erased. -->

**Game folder affected:** <!-- e.g. games/ffx – or "none, tooling only" -->

---

## Sources

<!-- Required if this pull request adds or changes any fact about a game: an item
     location, a stat, a price, a trigger, a resistance, a missable window.
     Two genuinely independent URLs minimum. A wiki and a site that copied that wiki
     count as one source. Delete this section only if no game fact changed. -->

- Source 1:
- Source 2:
- Game version these sources describe: <!-- e.g. HD Remaster / International -->

- [ ] I appended this fact to `docs/verified-facts/<game>.md` in the documented entry
      format, with both URLs, the date and the version.

<!-- If your evidence is your own console rather than a website, say so here and
     describe what you observed. A player's own game outranks any website. -->

---

## Checkbox keys (`data-k`)

<!-- Required if you added, removed or moved a checkbox. These keys are the storage
     keys for a reader's ticked progress: renaming or removing one silently erases
     progress somebody earned by playing. Delete this section if you touched none. -->

- `data-k` count before: <!-- grep -o 'data-k="[^"]*"' <file> | wc -l -->
- `data-k` count after:
- [ ] No existing key was renamed or removed. If one was, I explained why above.
- [ ] I ran `node tools/sync-totals.js` so the landing page's progress total is correct.

---

## Verification

- [ ] `node tools/verify-all.js` passes on my machine.

<!-- If a check fails and you believe the harness is wrong rather than the content,
     say so here and explain why. That is a legitimate outcome – see the
     "suspect the harness first" rule in CONTRIBUTING.md – but it needs to be stated,
     not assumed. -->
