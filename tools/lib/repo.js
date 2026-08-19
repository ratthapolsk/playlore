'use strict';
/* Shared helpers for every check in tools/. Every check resolves paths through
 * here so that:
 *  - a check behaves the same no matter which directory it is launched from
 *    (paths are always resolved from the REPO ROOT, never from process.cwd());
 *  - "which folders are a game" is defined in exactly one place, so a new game
 *    folder is picked up by every check without editing each one;
 *  - Windows paths that contain spaces and Thai characters
 *    (this repo lives under `...\เดสก์ท็อป\...`) turn into a correctly
 *    percent-encoded `file://` URL via Node's own `url.pathToFileURL`, instead
 *    of hand-built string concatenation (`'file:///' + dir + file`), which
 *    breaks the moment a path segment is non-ASCII or contains a space.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// Games live under this directory, one folder each. Kept as a single constant
// so the layout is stated in exactly one place -- nothing else in tools/ knows
// where games are. Games used to sit at the repo root; if that layout ever
// comes back, or a game is temporarily placed at the root, listGames() below
// still finds it.
const GAMES_DIR = 'games';

// Directories that are never a "game" even though they are directories:
// tooling and documentation live beside the games, not inside them.
const EXCLUDED_ROOT_DIRS = new Set(['docs', 'tools', GAMES_DIR]);

/**
 * A game folder is a direct child of the repo root that:
 *   - is not one of the tooling/doc folders above,
 *   - does not start with "." (VCS/editor metadata: .git, .github, .claude, ...)
 *     or "_" (a folder the author is staging for deletion, e.g. games/ffx/_to_delete —
 *     see the requirement that _-prefixed folders are excluded),
 *   - contains an index.html (the one file every game scaffold produces).
 * Returns [{ name, dir }], sorted by name for stable, repeatable output.
 */
function listGames(repoRoot = REPO_ROOT) {
  const found = new Map();

  const scan = (parentAbs, relPrefix) => {
    if (!fs.existsSync(parentAbs)) return;
    for (const d of fs.readdirSync(parentAbs, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const name = d.name;
      if (name.startsWith('.') || name.startsWith('_')) continue;
      if (!relPrefix && EXCLUDED_ROOT_DIRS.has(name)) continue;
      const dir = path.join(parentAbs, name);
      if (!fs.existsSync(path.join(dir, 'index.html'))) continue;
      if (!found.has(name)) found.set(name, { name, dir });
    }
  };

  // canonical location first, then the repo root as a fallback
  scan(path.join(repoRoot, GAMES_DIR), GAMES_DIR);
  scan(repoRoot, '');

  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Resolve which game(s) a check should run against from an optional CLI arg:
 * no arg -> every game folder; a folder name -> just that one (loud error if
 * it isn't actually a game folder, instead of silently checking nothing).
 */
function resolveGames(arg, repoRoot = REPO_ROOT) {
  const all = listGames(repoRoot);
  if (!arg) return all;
  const found = all.find(g => g.name === arg);
  if (!found) {
    const names = all.map(g => g.name).join(', ') || '(none found)';
    throw new Error(`"${arg}" is not a game folder (expected ${GAMES_DIR}/${arg}/index.html to exist under ${repoRoot}). Known games: ${names}`);
  }
  return [found];
}

/**
 * Every live .html page of a game, as a path RELATIVE to the game folder
 * (e.g. "index.html", "stages/07-....html", "reference/ref-gear.html").
 *
 * Recursive, because pages are now sorted into stages/ and reference/ — but
 * it deliberately skips any directory whose name starts with "_" or "." so
 * that games/ffx/_to_delete/ (content staged for removal) is never swept into a
 * count, and so editor/VCS metadata is ignored. assets/ contains no .html and
 * costs nothing to walk.
 *
 * Callers join the result onto the game dir; returning a relative path keeps
 * report lines short and stable regardless of where the repo lives on disk.
 */
function listHtmlFiles(gameDir) {
  const out = [];
  const walk = (absDir, relDir) => {
    for (const d of fs.readdirSync(absDir, { withFileTypes: true })) {
      const rel = relDir ? relDir + '/' + d.name : d.name;
      if (d.isDirectory()) {
        if (d.name.startsWith('_') || d.name.startsWith('.')) continue;
        walk(path.join(absDir, d.name), rel);
      } else if (d.isFile() && d.name.endsWith('.html')) {
        out.push(rel);
      }
    }
  };
  walk(gameDir, '');
  return out.sort();
}

/** Build a correct file:// URL for an absolute path that may contain spaces
 * and non-ASCII characters. */
function fileUrl(absPath) {
  return pathToFileURL(absPath).href;
}

function readUtf8(absPath) {
  return fs.readFileSync(absPath, 'utf8');
}

function writeUtf8(absPath, content) {
  fs.writeFileSync(absPath, content, 'utf8');
}

/**
 * The localStorage key prefix a game's own script uses for reader progress
 * (e.g. "ffx" for ffx/fx.js's `ffx_theme` / `ffx_stats` / `ffx_<page>` keys —
 * see README.md's "ความคืบหน้าของผู้อ่านเก็บไว้ที่ไหน" section). Detected by
 * reading the game's own script rather than hardcoded as "ffx", so a second
 * game folder with a different prefix (the new-game-guide scaffold assigns a
 * fresh one per game precisely so two games' saved progress never collide)
 * works with this harness unmodified. Falls back to the folder name if no
 * script declares one.
 */
function detectKeyPrefix(gameDir) {
  // Scripts moved from the game root into assets/js/ when the repo was
  // restructured. Look in both, newest layout first, so this keeps working
  // either way and nothing has to know which layout a game uses.
  const candidates = [];
  for (const script of ['fx.js', 'app.js']) {
    candidates.push(path.join(gameDir, 'assets', 'js', script));
    candidates.push(path.join(gameDir, script));
  }
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const m = readUtf8(p).match(/['"`](\w+)_theme['"`]/);
    if (m) return m[1];
  }

  /* Falling back to the folder name is a GUESS, and a silent one used to be a
   * real trap: it happens to be right for ffx only because that game's storage
   * prefix equals its folder name by coincidence. A game whose author picks a
   * different prefix would have been reported under the wrong key with no
   * warning, and every localStorage-seeded check would then quietly test
   * nothing. Say so instead of pretending to know. */
  const guess = path.basename(gameDir);
  console.warn(
    `  warning: could not read a "<prefix>_theme" literal from ${guess}'s scripts ` +
    `(looked in assets/js/ and the game root) — falling back to the folder name ` +
    `"${guess}" as the localStorage prefix. If that is wrong, every check that seeds ` +
    `localStorage is testing the wrong keys.`
  );
  return guess;
}

/**
 * require() a package that is installed globally (playwright, pngjs) rather
 * than as a local dependency of this repo — this repo intentionally has no
 * package.json / node_modules (see CLAUDE.md: "no build step, no package
 * install"), so these tools are the only thing in the repo that needs them.
 * Tries a plain require() first (works when the caller already exported
 * NODE_PATH=$(npm root -g)); if that fails, asks npm directly for its global
 * root and requires from there, so the checks work without depending on the
 * caller's shell having that env var set correctly.
 */
function requireGlobal(name) {
  try {
    return require(name);
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return require(path.join(globalRoot, name));
  }
}

module.exports = {
  REPO_ROOT,
  listGames,
  resolveGames,
  listHtmlFiles,
  fileUrl,
  readUtf8,
  writeUtf8,
  detectKeyPrefix,
  requireGlobal,
};
