#!/usr/bin/env node
'use strict';
/*
 * guard-checkbox-keys.js — PreToolUse hook on Edit and Write. BLOCKS.
 *
 * WHAT IT ENFORCES
 * A data-k attribute value is a checkbox key. Every checkbox on a walkthrough
 * page carries one, and the reader's ticked state is stored against that exact
 * string in their browser localStorage.
 *
 * WHY THIS IS A HOOK AND NOT A NOTE IN A STYLE GUIDE
 * Renaming or deleting a data-k value silently destroys progress the reader
 * earned by actually playing the game. Their tick is still in localStorage under
 * the old key, but no checkbox claims that key any more, so the box comes back
 * empty and they have no way to tell which of the 405 items they had already
 * collected. There is no undo: the site has no server and no backup of their
 * state. It is the one unrecoverable mistake in this repo, it is completely
 * invisible in review because the page still looks right, and it happens by
 * accident whenever an agent rewrites a checklist block "more cleanly".
 *
 * THE RULE
 *   - Removing a data-k value  -> BLOCKED.
 *   - Renaming a data-k value  -> BLOCKED (that is a removal plus an addition).
 *   - Adding a data-k value    -> always allowed.
 *   - Reordering / moving one  -> allowed, because the key still exists.
 *
 * HOW THE COMPARISON IS DONE
 * Preferred path: read the real file from disk and SIMULATE the edit, then
 * compare the key set of the whole file before against the whole file after.
 * This is what makes "moved, not deleted" work. Comparing old_string against
 * new_string alone would flag a key as lost whenever an edit cuts it from one
 * block while another part of the same file still carries it.
 *
 * Fallback path: if the file cannot be read, or old_string does not actually
 * occur in it (the edit would fail anyway), compare the keys inside old_string
 * against the keys inside new_string. Same rule, narrower evidence.
 *
 * SCOPE NOTE
 * The brief specified this hook for Edit. It also covers Write on a file that
 * already exists, because a Write that drops keys destroys reader progress in
 * exactly the same way, and the house rule in CLAUDE.md is stated without a tool
 * qualifier. A Write that creates a brand new file has no previous keys and is
 * never blocked.
 *
 * ON FAILURE
 * A detected key loss exits 2 and blocks, which is the point. Anything
 * unexpected fails OPEN through runHook().
 */

const path = require('path');
const io = require(path.join(__dirname, '_hook-io.js'));

const HOOK_NAME = 'guard-checkbox-keys';

const DATA_K_RE = /data-k\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/** Every data-k value in a piece of text, in document order, duplicates kept. */
function extractKeys(text) {
  if (!text) return [];
  const re = new RegExp(DATA_K_RE.source, DATA_K_RE.flags);
  const keys = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const value = (m[1] !== undefined ? m[1] : m[2]).trim();
    if (value) keys.push(value);
  }
  return keys;
}

/**
 * Reproduce what the Edit tool will do to the file, so we can diff whole-file
 * key sets. Returns null when old_string does not occur (the edit would fail).
 */
function applyEdit(content, oldString, newString, replaceAll) {
  if (oldString === '') return null; // creation-style edit; nothing to simulate
  if (!content.includes(oldString)) return null;
  if (replaceAll) return content.split(oldString).join(newString);
  const at = content.indexOf(oldString);
  return content.slice(0, at) + newString + content.slice(at + oldString.length);
}

io.runHook(HOOK_NAME, async (hookInput) => {
  const toolName = hookInput.tool_name;
  if (toolName !== 'Edit' && toolName !== 'Write') return io.allow();

  const toolInput = hookInput.tool_input || {};
  const filePath = toolInput.file_path;
  if (!filePath) return io.allow();

  const projectDir = io.resolveProjectDir(hookInput, filePath);
  const relPath = io.relativePosixPath(projectDir, filePath);
  const onDisk = io.readFileOrNull(filePath);

  let keysBefore;
  let keysAfter;
  let evidence; // how the comparison was made, quoted in the block message

  if (toolName === 'Write') {
    if (onDisk === null) return io.allow(); // new file: no existing progress to lose
    keysBefore = extractKeys(onDisk);
    keysAfter = extractKeys(typeof toolInput.content === 'string' ? toolInput.content : '');
    evidence = 'whole file on disk vs the content this Write would put there';
  } else {
    const oldString = typeof toolInput.old_string === 'string' ? toolInput.old_string : '';
    const newString = typeof toolInput.new_string === 'string' ? toolInput.new_string : '';
    const simulated = onDisk === null ? null : applyEdit(onDisk, oldString, newString, toolInput.replace_all === true);
    if (simulated !== null) {
      keysBefore = extractKeys(onDisk);
      keysAfter = extractKeys(simulated);
      evidence = 'whole file before vs the whole file after applying this edit';
    } else {
      keysBefore = extractKeys(oldString);
      keysAfter = extractKeys(newString);
      evidence = 'the replaced text vs the replacement text';
    }
  }

  const afterSet = new Set(keysAfter);
  const lost = [...new Set(keysBefore)].filter((k) => !afterSet.has(k));

  if (lost.length === 0) return io.allow();

  const added = [...new Set(keysAfter)].filter((k) => !new Set(keysBefore).has(k));

  const parts = [];
  parts.push('BLOCKED by ' + HOOK_NAME + ': ' + relPath);
  parts.push('');
  parts.push(
    'This ' + toolName + ' would remove or rename ' + lost.length + ' checkbox key(s). Nothing was written.'
  );
  parts.push('');
  parts.push('A data-k value is the localStorage key for one checkbox. Deleting or renaming it');
  parts.push('erases the tick a reader earned by playing, with no undo and no way for them to');
  parts.push('tell which entries they had already collected.');
  parts.push('');
  parts.push('Keys that would be LOST:');
  lost.forEach((k) => parts.push('    - data-k="' + k + '"'));
  if (added.length > 0) {
    parts.push('');
    parts.push('Keys this edit adds (adding is always fine, and a rename shows up here as the new name):');
    added.slice(0, 12).forEach((k) => parts.push('    + data-k="' + k + '"'));
    if (added.length > 12) parts.push('    + ... and ' + (added.length - 12) + ' more');
  }
  parts.push('');
  parts.push('Key count: ' + new Set(keysBefore).size + ' before -> ' + afterSet.size + ' after');
  parts.push('Compared using: ' + evidence);
  parts.push('');
  parts.push('If you meant to RENAME a key, do not: keep the original data-k value and change the');
  parts.push('visible label instead. If the checkbox is genuinely gone from the game, say so in');
  parts.push('your report and let the orchestrator decide - do not drop the key silently.');

  io.denyPreToolUse(parts.join('\n'));
});
