'use strict';
/*
 * Sidebar-rail check — does every long page carry the sticky in-page table of
 * contents?
 *
 * The rail is styled by the selector `.wrap > nav.toc` — a DIRECT child of
 * .wrap — at `position: sticky` (see style.css, the `@media(min-width:1120px)`
 * block). A page whose <nav class="toc"> ends up anywhere else in the markup
 * (wrapped in one extra <div>, moved outside .wrap, ...) silently renders with
 * no sidebar at all: nothing errors, the nav links still work, the page just
 * quietly loses the rail. Reading position:sticky from computed style is the
 * only reliable way to catch that — a visual glance at one screenshot can miss
 * it depending on scroll position.
 *
 * index.html is exempt by design: it is the landing page (a grid of stage
 * cards), not a long narrative page, and the site's own scaffold never gives
 * it a <nav class="toc"> at all (confirmed: it is the one page every game
 * folder is guaranteed to have, per listGames() in lib/repo.js, and it has no
 * in-page sections to build a contents list from). Every OTHER page that
 * declares a <nav class="toc"> is expected to render it as the rail.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, fileUrl, requireGlobal } = require('./lib/repo');

const VIEWPORT = { width: 1400, height: 900 };

async function run(gameArg) {
  const { chromium } = requireGlobal('playwright');
  const games = resolveGames(gameArg);
  const lines = [];
  const bad = [];
  let checked = 0;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    for (const game of games) {
      const files = listHtmlFiles(game.dir).filter(f => f !== 'index.html');
      for (const f of files) {
        checked++;
        await page.goto(fileUrl(path.join(game.dir, f)));
        await page.waitForTimeout(350);
        const r = await page.evaluate(() => {
          const nav = document.querySelector('nav.toc');
          if (!nav) return { has: false };
          const cs = getComputedStyle(nav);
          const box = nav.getBoundingClientRect();
          return {
            has: true,
            directChildOfWrap: !!nav.parentElement && nav.parentElement.classList.contains('wrap'),
            position: cs.position,
            gridColumn: cs.gridColumn,
            left: Math.round(box.left),
            width: Math.round(box.width),
            links: nav.querySelectorAll('a').length,
          };
        });
        const isRail = r.has && r.directChildOfWrap && r.position === 'sticky';
        if (!isRail) bad.push(`${game.name}/${f}  ${JSON.stringify(r)}`);
      }
    }
  } finally {
    await browser.close();
  }

  const pass = bad.length === 0;
  if (pass) {
    lines.push(`sidebar-check: PASS — every long page (${checked} checked, index.html exempt) has the sidebar rail`);
  } else {
    lines.push('NO SIDEBAR RAIL (' + bad.length + '):');
    lines.push(...bad);
    lines.push(`sidebar-check: FAIL — ${bad.length} of ${checked} pages are missing the rail`);
  }
  return { pass, lines, checked, missing: bad.length };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ pass, lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = pass ? 0 : 1;
  }).catch(e => {
    console.error('sidebar-check.js error:', e.message);
    process.exitCode = 1;
  });
}
