'use strict';
/*
 * Table-fill check — does every <table> fill the .tbl-wrap card it sits in?
 *
 * A table narrower than its card is not a visual nitpick here: .tbl-wrap is
 * the component that gives a table its border, rounded corners and horizontal
 * scroll — a table that stops short of the card's edge leaves a dead strip of
 * empty card down one side, which reads as a rendering bug even though
 * nothing actually overflowed.
 *
 * "unused" is card width minus the table's own rendered width. A few pixels
 * of unused space is normal — border rounding and sub-pixel layout land
 * differently between rows — so the check only reports a table once the gap
 * is big enough to notice while reading (> 12px), matching the original
 * hand-tuned threshold that first caught this class of bug.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, fileUrl, requireGlobal } = require('./lib/repo');

const VIEWPORT = { width: 1280, height: 900 };
const GAP_THRESHOLD = 12;

async function run(gameArg) {
  const { chromium } = requireGlobal('playwright');
  const games = resolveGames(gameArg);
  const lines = [];
  const violations = [];
  let totalTables = 0;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    for (const game of games) {
      const files = listHtmlFiles(game.dir);
      for (const f of files) {
        await page.goto(fileUrl(path.join(game.dir, f)));
        await page.waitForTimeout(500);
        const rows = await page.evaluate(() =>
          [...document.querySelectorAll('.tbl-wrap')].map((w, i) => {
            const t = w.querySelector('table');
            if (!t) return null;
            const ww = w.clientWidth, tw = t.getBoundingClientRect().width;
            return { i, cols: t.rows[0] ? t.rows[0].cells.length : 0, gap: Math.round(ww - tw), ww: Math.round(ww) };
          }).filter(Boolean)
        );
        totalTables += rows.length;
        rows
          .filter(x => x.gap > GAP_THRESHOLD)
          .forEach(x => violations.push(`${game.name}/${f} tbl#${x.i} cols=${x.cols} unused=${x.gap}px of ${x.ww}`));
      }
    }
  } finally {
    await browser.close();
  }

  lines.push('tables checked: ' + totalTables);
  const pass = violations.length === 0;
  if (pass) {
    lines.push(`tblfit: PASS — all ${totalTables} tables fill their card`);
  } else {
    lines.push('NOT FILLING (' + violations.length + '):');
    lines.push(...violations);
    lines.push(`tblfit: FAIL — ${violations.length} of ${totalTables} tables leave more than ${GAP_THRESHOLD}px unused`);
  }
  return { pass, lines, totalTables, violations: violations.length };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ pass, lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = pass ? 0 : 1;
  }).catch(e => {
    console.error('tblfit.js error:', e.message);
    process.exitCode = 1;
  });
}
