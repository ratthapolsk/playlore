'use strict';
/*
 * _hook-io.js — shared plumbing for the repo's Claude Code hooks.
 *
 * NOT A HOOK ITSELF. The leading underscore marks it as a library that the three
 * real hooks (guard-house-style.js, guard-checkbox-keys.js, verify-after-edit.js)
 * require. Nothing in settings.json points here.
 *
 * WHY THIS FILE EXISTS
 * Every hook has to do the same four fiddly things, and each one has a way to go
 * wrong silently on this machine specifically:
 *
 *  1. Read a JSON object from stdin. Chunks arrive as Buffers and a multi-byte
 *     UTF-8 character (all Thai text is 3 bytes) can be split across a chunk
 *     boundary. We concatenate Buffers and decode once, never decode per chunk.
 *
 *  2. Write a JSON answer to stdout. This repo lives at a path containing Thai
 *     characters and the pages are Thai prose, so hook messages quote Thai text
 *     back to the agent. Windows console/pipe code pages can mangle raw UTF-8 on
 *     the way out, so we escape every non-ASCII character to a \uXXXX sequence.
 *     That is still valid JSON and the reader decodes it back to the identical
 *     string, so the message survives regardless of code page.
 *
 *  3. Decide whether a file sits "under a game folder". The repo is one folder per
 *     game (games/ffx/ = Final Fantasy X) plus infrastructure folders. Several house
 *     rules apply only to game pages, not to, say, a file under .claude/.
 *
 *  4. Fail open. A crashing hook that blocked every Edit would halt all work on
 *     the repo, which is far worse than the rule it was meant to enforce. Every
 *     hook wraps its body in runHook() below: any thrown error is printed to
 *     stderr (visible in the hook debug log) and the tool call is ALLOWED.
 *     The one deliberate exception is a rule violation, which exits 2 on purpose.
 *
 * Hook contract used here (verified against https://code.claude.com/docs/en/hooks):
 *   - stdin: JSON with tool_name, tool_input, cwd, hook_event_name, ...
 *   - PreToolUse deny: print {"hookSpecificOutput":{"hookEventName":"PreToolUse",
 *     "permissionDecision":"deny","permissionDecisionReason":"..."}} and exit 2.
 *     Exit 2 blocks on its own; the JSON supplies the reason text.
 *   - Exit 0 = allow. Stderr on exit 0 reaches only the debug log, never the
 *     agent, so anything the agent must read goes on stdout as JSON.
 */

const fs = require('fs');
const path = require('path');

/* Folders at the repo root that are infrastructure, not a game. Anything else
 * with at least one sub-path segment is treated as a game folder. */
const NON_GAME_ROOT_DIRS = new Set([
  '.claude', '.git', '.github', '.vscode',
  'docs', 'tools', 'scripts', 'node_modules', 'vendor', 'assets',
]);

/** Read all of stdin as one UTF-8 string, decoding only after every byte arrived. */
function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c, 'utf8')));
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    process.stdin.on('error', reject);
  });
}

/** JSON.stringify, then escape every non-ASCII char so the bytes on stdout are pure ASCII. */
function jsonAscii(value) {
  return JSON.stringify(value).replace(
    /[\u0080-\uFFFF]/g,
    (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')
  );
}

/** Strip a UTF-8 BOM if one is present, so offsets and comparisons line up. */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Read a file as UTF-8, or return null when it does not exist / cannot be read. */
function readFileOrNull(filePath) {
  try {
    return stripBom(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Best guess at the repo root, in order of trustworthiness:
 *   1. CLAUDE_PROJECT_DIR, which Claude Code sets for hook processes.
 *   2. Walk up from the file being edited looking for CLAUDE.md or .git.
 *   3. The cwd reported in the hook payload.
 */
function resolveProjectDir(hookInput, filePath) {
  const fromEnv = process.env.CLAUDE_PROJECT_DIR;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  if (filePath) {
    let dir = path.dirname(path.resolve(filePath));
    for (let i = 0; i < 40; i++) {
      if (fs.existsSync(path.join(dir, 'CLAUDE.md')) || fs.existsSync(path.join(dir, '.git'))) return dir;
      const up = path.dirname(dir);
      if (up === dir) break;
      dir = up;
    }
  }
  if (hookInput && hookInput.cwd) return hookInput.cwd;
  return process.cwd();
}

/** Repo-relative path with forward slashes, e.g. "games/ffx/stages/04-besaid.html". */
function relativePosixPath(projectDir, filePath) {
  const rel = path.relative(projectDir, path.resolve(filePath));
  return rel.split(path.sep).join('/');
}

/**
 * True when the file is an .html page inside a game folder (games/ffx/..., and any
 * future game). A page directly at the repo root, or under .claude/ / docs/ /
 * tools/, is not a game page.
 */
function isGameFolderHtml(projectDir, filePath) {
  if (!/\.html?$/i.test(filePath)) return false;
  const rel = relativePosixPath(projectDir, filePath);
  if (rel.startsWith('../')) return false; // outside the repo entirely
  const segments = rel.split('/');
  if (segments.length < 2) return false; // sits at the repo root
  return !NON_GAME_ROOT_DIRS.has(segments[0]) && !segments[0].startsWith('.');
}

function isHtml(filePath) {
  return /\.html?$/i.test(filePath || '');
}

/**
 * Pull the file path and the "before"/"after" text out of an Edit or Write call.
 *
 * "before" is what the rule checkers compare against so that a violation which
 * ALREADY existed is not blamed on this edit. See the guard hooks for why that
 * matters: the repo's legacy games/ffx/_to_delete/ pages are full of old violations and
 * one live page mentions the compass words while explaining that it never uses
 * them. Blocking every edit that merely touches such a line would make the hook
 * an obstacle instead of a guard.
 *
 *   Edit  -> before = old_string,          after = new_string
 *   Write -> before = current file on disk, after = content   (before = "" if new file)
 */
function extractEditPayload(hookInput) {
  const toolName = hookInput.tool_name;
  const toolInput = hookInput.tool_input || {};
  const filePath = toolInput.file_path;
  if (!filePath) return null;

  if (toolName === 'Edit') {
    return {
      toolName,
      filePath,
      before: typeof toolInput.old_string === 'string' ? toolInput.old_string : '',
      after: typeof toolInput.new_string === 'string' ? toolInput.new_string : '',
      replaceAll: toolInput.replace_all === true,
      isWholeFile: false,
    };
  }
  if (toolName === 'Write') {
    const onDisk = readFileOrNull(filePath);
    return {
      toolName,
      filePath,
      before: onDisk === null ? '' : onDisk,
      after: typeof toolInput.content === 'string' ? toolInput.content : '',
      replaceAll: false,
      isWholeFile: true,
    };
  }
  return null;
}

/** Count non-overlapping matches of a global regex. */
function countMatches(text, regex) {
  if (!text) return 0;
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  let n = 0;
  while (re.exec(text) !== null) n++;
  return n;
}

/** All matches of a global regex, as {text, index}. */
function findMatches(text, regex) {
  if (!text) return [];
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ text: m[0], index: m.index });
    if (m.index === re.lastIndex) re.lastIndex++; // guard against zero-width matches
  }
  return out;
}

/** 1-based line number of a character offset. */
function lineNumberAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

/** A single-line snippet around an offset, for quoting the offending text back. */
function snippetAt(text, index, matchLength, radius = 45) {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + matchLength + radius);
  const lead = start > 0 ? '...' : '';
  const tail = end < text.length ? '...' : '';
  return lead + text.slice(start, end).replace(/\s+/g, ' ').trim() + tail;
}

/** Format up to `limit` matches as "line N: ...quoted text..." bullets. */
function describeMatches(text, matches, limit = 4) {
  return matches.slice(0, limit).map((m) => {
    const where = 'line ' + lineNumberAt(text, m.index);
    return '    - ' + where + ': ' + snippetAt(text, m.index, m.text.length);
  });
}

/** Block the tool call: emit the deny decision and exit 2. */
function denyPreToolUse(reason) {
  process.stdout.write(
    jsonAscii({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
  // Also on stderr: exit-2 stderr is surfaced to the agent, so the actionable
  // text reaches it even if the JSON path changes.
  process.stderr.write(reason + '\n');
  process.exit(2);
}

/** Emit a non-blocking advisory message and exit 0 (used by the PostToolUse hook). */
function warnAndAllow(message) {
  process.stdout.write(jsonAscii({ systemMessage: message }));
  process.stderr.write(message + '\n');
  process.exit(0);
}

/** Allow the tool call with nothing to say. */
function allow() {
  process.exit(0);
}

/**
 * Run a hook body with fail-open protection.
 * `body` receives the parsed hook input. Any throw -> log to stderr, exit 0.
 */
async function runHook(hookName, body) {
  try {
    const raw = await readStdin();
    let hookInput;
    try {
      hookInput = JSON.parse(raw);
    } catch {
      process.stderr.write(`[${hookName}] could not parse hook stdin as JSON; allowing.\n`);
      process.exit(0);
    }
    await body(hookInput);
    process.exit(0);
  } catch (err) {
    // Fail open. A broken hook must never wedge the repo.
    process.stderr.write(`[${hookName}] crashed, allowing the action: ${(err && err.stack) || err}\n`);
    process.exit(0);
  }
}

module.exports = {
  readStdin,
  jsonAscii,
  stripBom,
  readFileOrNull,
  resolveProjectDir,
  relativePosixPath,
  isGameFolderHtml,
  isHtml,
  extractEditPayload,
  countMatches,
  findMatches,
  lineNumberAt,
  snippetAt,
  describeMatches,
  denyPreToolUse,
  warnAndAllow,
  allow,
  runHook,
};
