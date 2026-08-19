#!/usr/bin/env node
'use strict';
/*
 * verify-after-edit.js — PostToolUse hook on Edit and Write. ADVISORY ONLY, NEVER BLOCKS.
 *
 * WHAT IT REPORTS
 * After a game page has been written, it re-reads the file from disk and checks
 * two things that are invisible on screen but break the page or the reader's
 * saved progress:
 *
 *  1. TAG BALANCE for div, section, ul, ol, li, dl, p, span and table.
 *     These pages are opened straight off disk with file:// and there is no
 *     build step and no validator in the loop. A browser silently repairs an
 *     unclosed <div>, so the author sees a page that looks fine while the
 *     sidebar or the checklist has quietly been re-parented somewhere else.
 *     Counting opens against closes catches it at the moment it is introduced.
 *
 *  2. DUPLICATE data-k VALUES. A data-k is the localStorage key for one
 *     checkbox. Two checkboxes sharing a key are permanently wired together:
 *     ticking either one ticks both, so the reader cannot record that they
 *     collected one item but not the other. Keys are required to be unique
 *     within a file.
 *
 * WHY IT DOES NOT BLOCK
 * A real edit often lands in several steps. Closing one section in edit 1 and
 * opening the next in edit 2 leaves the file legitimately unbalanced in between.
 * A blocking check would make that ordinary workflow impossible, so this hook
 * only reports. PostToolUse cannot block anyway - the tool has already run - so
 * the finding is returned as a systemMessage with exit code 0.
 *
 * READ THE WARNING AS A PROMPT TO LOOK, NOT AS A VERDICT
 * If the edit is mid-sequence, finish the sequence and the next run will come
 * back clean. If it is not, the page has a real structural bug.
 *
 * ON FAILURE
 * Fails open through runHook(): a crash logs to stderr and says nothing.
 */

const path = require('path');
const io = require(path.join(__dirname, '_hook-io.js'));

const HOOK_NAME = 'verify-after-edit';

/* Tags whose balance is worth counting on these pages. */
const BALANCED_TAGS = ['div', 'section', 'ul', 'ol', 'li', 'dl', 'p', 'span', 'table'];

/**
 * Remove the regions where an angle bracket is not markup: comments, and the
 * bodies of <script> and <style>. A JS string such as "<div>" inside a script
 * would otherwise be counted as an open tag.
 */
function stripNonMarkup(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ');
}

/** Count opening and closing occurrences of one tag. Self-closing forms do not count as opens. */
function countTag(html, tag) {
  const openRe = new RegExp('<' + tag + '(?=[\\s/>])[^>]*>', 'gi');
  const closeRe = new RegExp('</' + tag + '\\s*>', 'gi');
  let open = 0;
  let m;
  while ((m = openRe.exec(html)) !== null) {
    if (!/\/>$/.test(m[0])) open++;
  }
  const close = (html.match(closeRe) || []).length;
  return { open, close };
}

function findDuplicateKeys(html) {
  const re = /data-k\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  const seen = new Map();
  let m;
  while ((m = re.exec(html)) !== null) {
    const key = (m[1] !== undefined ? m[1] : m[2]).trim();
    if (!key) continue;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([key, n]) => ({ key, count: n }));
}

io.runHook(HOOK_NAME, async (hookInput) => {
  const toolName = hookInput.tool_name;
  if (toolName !== 'Edit' && toolName !== 'Write') return io.allow();

  const toolInput = hookInput.tool_input || {};
  const filePath = toolInput.file_path;
  if (!filePath) return io.allow();

  const projectDir = io.resolveProjectDir(hookInput, filePath);
  if (!io.isGameFolderHtml(projectDir, filePath)) return io.allow();

  const relPath = io.relativePosixPath(projectDir, filePath);
  const raw = io.readFileOrNull(filePath);
  if (raw === null) return io.allow(); // nothing on disk to inspect

  const html = stripNonMarkup(raw);

  const unbalanced = [];
  for (const tag of BALANCED_TAGS) {
    const { open, close } = countTag(html, tag);
    if (open !== close) {
      unbalanced.push({ tag, open, close, delta: open - close });
    }
  }
  const duplicates = findDuplicateKeys(html);

  if (unbalanced.length === 0 && duplicates.length === 0) return io.allow();

  const totalKeys = new Set(
    [...html.matchAll(/data-k\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((m) => (m[1] !== undefined ? m[1] : m[2]))
  ).size;

  const parts = [];
  parts.push('ADVISORY from ' + HOOK_NAME + ' (not a block, the write already happened): ' + relPath);
  parts.push('');

  if (unbalanced.length > 0) {
    parts.push('Tag balance is off:');
    unbalanced.forEach((u) => {
      const verdict =
        u.delta > 0
          ? u.delta + ' unclosed <' + u.tag + '>'
          : -u.delta + ' stray </' + u.tag + '>';
      parts.push('    - <' + u.tag + '>: ' + u.open + ' opening, ' + u.close + ' closing  -> ' + verdict);
    });
    parts.push('');
    parts.push('    A browser silently repairs this, so the page will still render - usually with a');
    parts.push('    section re-parented somewhere it does not belong. If this edit is one step of a');
    parts.push('    multi-step change, finish the sequence and this will resolve itself.');
  }

  if (duplicates.length > 0) {
    if (unbalanced.length > 0) parts.push('');
    parts.push('Duplicate data-k values (' + totalKeys + ' unique keys in the file):');
    duplicates.forEach((d) => parts.push('    - data-k="' + d.key + '" appears ' + d.count + ' times'));
    parts.push('');
    parts.push('    Two checkboxes sharing a key are wired together in the reader\'s localStorage:');
    parts.push('    ticking one ticks the other, so they cannot record collecting one item but not');
    parts.push('    the other. Give each checkbox its own key.');
  }

  io.warnAndAllow(parts.join('\n'));
});
