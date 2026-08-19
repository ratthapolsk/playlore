'use strict';
/*
 * Checkbox-density survey — no browser needed, pure text scan.
 *
 * A stage page with a lot of prose but almost no checkboxes is where a reader
 * picks something up in-game with nowhere to tick it. Ratio = KB of page
 * content per checkbox; a high ratio means a thin checklist relative to how
 * much the page talks about.
 *
 * This is informational, not a pass/fail gate: CLAUDE.md is explicit that
 * "some scenes genuinely contain nothing to collect" and a page is allowed to
 * have a short, honest checklist (or none at all, backed by a one-line
 * data-note) rather than a padded one. So this survey always reports PASS —
 * its job is to hand a human the outliers to *look at*, not to fail a build
 * over a page that is legitimately thin on purpose. Only files that look like
 * numbered stage pages (start with two digits, e.g. "04-besaid...") are
 * scored — reference/glossary pages (ref-*.html) and the landing page
 * (index.html) are a different shape by design and would only add noise.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, readUtf8 } = require('./lib/repo');

const FLAG_MULTIPLE = 2.2;

async function run(gameArg) {
  const games = resolveGames(gameArg);
  const lines = [];

  for (const game of games) {
    const files = listHtmlFiles(game.dir).filter(f => /(?:^|\/)\d\d-/.test(f));
    const rows = files.map(f => {
      const s = readUtf8(path.join(game.dir, f));
      const keys = (s.match(/data-k="/g) || []).length;
      const kb = Math.round(s.length / 1024);
      return { f, keys, kb, ratio: keys ? +(kb / keys).toFixed(1) : Infinity };
    });
    if (!rows.length) continue;

    const med = [...rows].map(r => r.ratio).filter(Number.isFinite).sort((a, b) => a - b);
    const median = med.length ? med[Math.floor(med.length / 2)] : 0;
    lines.push(`\n${game.name} — median = ${median} KB of page per checkbox`);
    lines.push(['stage'.padEnd(40), 'boxes  KB   KB/box'].join(' '));
    rows
      .sort((a, b) => b.ratio - a.ratio)
      .forEach(r => {
        const flag = !Number.isFinite(r.ratio)
          ? '  <-- no checkboxes at all (fine if the page has a data-note explaining why)'
          : median > 0 && r.ratio > median * FLAG_MULTIPLE
            ? '  <-- thin, ' + Math.round(r.ratio / median) + 'x the median'
            : '';
        lines.push([r.f.padEnd(40), String(r.keys).padStart(3), String(r.kb).padStart(5), String(r.ratio).padStart(7)].join(' ') + flag);
      });
  }

  lines.push('\ndensity: INFO — survey only, review outliers above; never fails the build');
  return { pass: true, lines };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = 0;
  }).catch(e => {
    console.error('density.js error:', e.message);
    process.exitCode = 1;
  });
}
