'use strict';
/*
 * Glossary-markup survey — which glossary sections use the canonical
 * "carded" pattern (a `.card` wrapping the `<dl class="kv">`), and which are
 * a bare `<dl>` that still needs the wrapper?
 *
 * The search is anchored at `<section id="gloss"` and everything up to that
 * section's closing tag — NOT at the glossary heading text ("ศัพท์ควรรู้" /
 * "should-know terms"). The same heading text also appears in a page's own
 * top navigation link (a jump-to-glossary shortcut), and an earlier version
 * of this script that searched from the heading text picked up that nav
 * link's surrounding markup instead of the actual glossary section, so it
 * read the wrong part of the file. Anchoring on the section id sidesteps
 * that entirely.
 *
 * This is a survey (pure text scan, no browser), not a hard gate: it always
 * exits 0 so it can run as part of the fast group in verify-all.js, but it
 * prints every non-canonical page so a human can decide whether to convert
 * it — see docs/verification.md for why markup surveys like this and
 * tools/density.js stay informational instead of failing the build.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, readUtf8 } = require('./lib/repo');

async function run(gameArg) {
  const games = resolveGames(gameArg);
  const lines = [];
  let cardedTotal = 0, bareTotal = 0, oddTotal = 0;

  for (const game of games) {
    const carded = [], bare = [], odd = [];
    for (const f of listHtmlFiles(game.dir)) {
      const s = readUtf8(path.join(game.dir, f));
      const i = s.indexOf('<section id="gloss"');
      if (i < 0) {
        if (/ศัพท์ควรรู้/.test(s)) odd.push(f + ' (glossary heading text present but no <section id="gloss">)');
        continue;
      }
      const end = s.indexOf('</section>', i);
      const body = s.slice(i, end < 0 ? undefined : end);
      const dls = (body.match(/<dl class="kv">/g) || []).length;
      const inCard = /<div class="card">\s*(<p\b[^>]*>[\s\S]*?<\/p>\s*)?<dl class="kv">/.test(body);
      (inCard ? carded : bare).push(f + '  dl=' + dls);
    }
    cardedTotal += carded.length; bareTotal += bare.length; oddTotal += odd.length;

    lines.push(`\n${game.name}`);
    lines.push('  in a card (canonical): ' + carded.length);
    carded.forEach(x => lines.push('    ' + x));
    lines.push('  bare <dl>, needs the card wrapper: ' + bare.length);
    bare.forEach(x => lines.push('    ' + x));
    if (odd.length) { lines.push('  odd: ' + odd.length); odd.forEach(x => lines.push('    ' + x)); }
  }

  lines.push(`\ngloss-survey: INFO — ${cardedTotal} canonical, ${bareTotal} need conversion, ${oddTotal} odd; survey only, never fails the build`);
  return { pass: true, lines, carded: cardedTotal, bare: bareTotal, odd: oddTotal };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = 0;
  }).catch(e => {
    console.error('gloss-survey.js error:', e.message);
    process.exitCode = 1;
  });
}
