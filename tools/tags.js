'use strict';
/*
 * Tag-balance check — no browser needed, pure text scan.
 *
 * For a fixed set of element types, counts opening tags against closing tags.
 * An unbalanced pair (e.g. one more <section> than </section>) means a stray
 * or missing close tag, which silently breaks everything nested after it —
 * the browser's HTML parser recovers from it in a way that rarely matches
 * what the author intended, so it never throws and never shows up by eye.
 *
 * The open-tag pattern MUST use the literal character class "[ >]", not the
 * regex shorthand "\s". A bash heredoc that generated an earlier version of
 * this file ate one level of backslash escaping, which silently turned
 * "<div[ >]" into "<div[s>]" — a class that matches a literal "s" or ">"
 * instead of whitespace-or->. That broken class still matched real tags often
 * enough (many opening tags are immediately followed by an attribute whose
 * first letter happens not to be "s") that it looked like it worked, while
 * actually reporting false mismatches on files where it didn't. Keep this
 * character class written out literally — do not "simplify" it to \s.
 *
 * Also checks:
 *   - duplicate `data-k` values (two checkboxes sharing a key means ticking
 *     one silently ticks the other, and the reader can never tell why);
 *   - a bare "·" anywhere in the page text (the project's separator convention
 *     is " – ", en dash with spaces — see CLAUDE.md/README.md; a bare middle
 *     dot is the mark of an un-converted separator).
 */
const path = require('path');
const { resolveGames, listHtmlFiles, readUtf8 } = require('./lib/repo');

const TAGS = ['div', 'section', 'ul', 'ol', 'li', 'table', 'dl', 'p', 'span', 'h2', 'h3', 'h4'];

function checkFile(absPath, fileName) {
  const s = readUtf8(absPath);
  const bad = [];
  for (const t of TAGS) {
    const o = (s.match(new RegExp('<' + t + '[ >]', 'g')) || []).length;
    const c = (s.match(new RegExp('</' + t + '>', 'g')) || []).length;
    if (o !== c) bad.push(t + ' open=' + o + ' close=' + c);
  }
  const keys = s.match(/data-k="[^"]+"/g) || [];
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  const hasForbiddenDot = /·/.test(s);
  const ok = bad.length === 0 && dupes.length === 0 && !hasForbiddenDot;
  return {
    file: fileName,
    ok,
    tagMismatches: bad,
    keyCount: keys.length,
    duplicateKeys: [...new Set(dupes)],
    hasForbiddenDot,
  };
}

async function run(gameArg) {
  const games = resolveGames(gameArg);
  const lines = [];
  let anyBad = false;
  let totalFiles = 0;
  let grandKeys = 0;

  for (const game of games) {
    const files = listHtmlFiles(game.dir);
    for (const f of files) {
      totalFiles++;
      const r = checkFile(path.join(game.dir, f), f);
      grandKeys += r.keyCount;
      if (!r.ok) anyBad = true;
      lines.push(
        [
          game.name + '/' + f,
          r.tagMismatches.length ? 'MISMATCH: ' + r.tagMismatches.join(', ') : 'tags ok',
          '| data-k=' + r.keyCount,
          r.duplicateKeys.length ? '| DUPLICATE KEYS: ' + r.duplicateKeys.join(',') : '',
          r.hasForbiddenDot ? '| HAS FORBIDDEN " · "' : '',
        ]
          .filter(Boolean)
          .join(' ')
      );
    }
  }

  const summary = anyBad
    ? `tags: FAIL — ${totalFiles} files checked, ${grandKeys} data-k total, see mismatches above`
    : `tags: PASS — ${totalFiles} files tag-balanced, ${grandKeys} data-k total, no duplicates, no forbidden separator`;
  lines.push(summary);
  return { pass: !anyBad, lines, totalFiles, grandKeys };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ pass, lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = pass ? 0 : 1;
  }).catch(e => {
    console.error('tags.js error:', e.message);
    process.exitCode = 1;
  });
}
