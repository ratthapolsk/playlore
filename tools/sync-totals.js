'use strict';
/*
 * Stamp each stage's real checkbox count into index.html as `data-total`.
 *
 * index.html shows overall progress, but on its own its denominator only
 * ever came from localStorage's `<prefix>_stats` blob, and a stage page only
 * writes into that blob the FIRST TIME the reader opens it. On a fresh
 * profile nothing has been written yet, so the overall bar counted only the
 * stages the reader happened to visit — it could read as nearly full while
 * most of the game was still untouched.
 *
 * The fix is this script: it reads every stage page's real, current
 * checkbox count directly from disk and writes it onto the matching `<li>`
 * in index.html as `data-total`, so the denominator is correct even for a
 * stage the reader has never opened (see fx.js's initIndexProgress, which
 * reads this attribute as its fallback).
 *
 * This is a WRITER, not a check — unlike every other tool in tools/, it is
 * deliberately not part of tools/verify-all.js's pass/fail run, because a
 * "verify" step should never mutate the repo as a side effect. Re-run it by
 * hand whenever checkboxes are added to or removed from a stage page:
 *
 *   node tools/sync-totals.js            every game
 *   node tools/sync-totals.js ffx        one game
 *
 * It is idempotent: running it again with no content changes rewrites
 * index.html to the same bytes (verified in the acceptance run — see
 * docs/verification.md).
 */
const path = require('path');
const { resolveGames, listHtmlFiles, readUtf8, writeUtf8 } = require('./lib/repo');

async function run(gameArg) {
  const games = resolveGames(gameArg);
  const lines = [];

  for (const game of games) {
    const idxPath = path.join(game.dir, 'index.html');
    let s = readUtf8(idxPath);

    const totals = {};
    for (const f of listHtmlFiles(game.dir).filter(f => /(?:^|\/)\d\d-/.test(f))) {
      const pageSrc = readUtf8(path.join(game.dir, f));
      const page = (pageSrc.match(/data-page="([^"]+)"/) || [])[1];
      if (!page) continue;
      totals[page] = (pageSrc.match(/data-k="/g) || []).length;
    }

    let stamped = 0, grand = 0;
    s = s.replace(/<li(\s+data-total="\d+")?>(\s*<span class="st-n">(\d+)<\/span>)/g, (m, old, rest, n) => {
      const key = 's' + String(n).padStart(2, '0');
      if (!(key in totals)) return m;
      stamped++;
      grand += totals[key];
      return `<li data-total="${totals[key]}">${rest}`;
    });

    writeUtf8(idxPath, s);
    lines.push(`${game.name}: stamped ${stamped} stage cards, grand total = ${grand} checkboxes`);
    lines.push('  ' + Object.entries(totals).sort().map(([k, v]) => k + '=' + v).join('  '));
  }

  return { pass: true, lines };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = 0;
  }).catch(e => {
    console.error('sync-totals.js error:', e.message);
    process.exitCode = 1;
  });
}
