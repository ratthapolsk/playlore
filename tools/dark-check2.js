'use strict';
/*
 * Contrast check — sidebar completion-state colours, measured from ACTUAL
 * PAINTED PIXELS, in both light and dark theme.
 *
 * This exists because computing contrast from CSS backgrounds by hand kept
 * going wrong: the sidebar rail and the page are stacked layers of
 * semi-transparent panels over an animated gradient, and blending those
 * layers by hand pulled the result toward white even in dark mode — which
 * made a colour that had already been audited and was actually fine "fail"
 * at 1.54:1. That mismatch was the tell that the HARNESS was wrong, not the
 * stylesheet: when a check result contradicts something already known to be
 * correct, suspect the check before touching the page (see
 * docs/verification.md's "suspect the harness first" principle for the full
 * story). The fix here is to stop modelling the stack at all: screenshot the
 * actual element, read the darkest and lightest pixels the browser really
 * painted inside it, and rate contrast from those two pixels directly.
 *
 * Colour readings are taken 1.5s after the state change that produces them
 * (ticking checkboxes). style.css transitions colour on state change; reading
 * at, say, 300ms samples a colour mid-fade that exists in neither the
 * "before" nor the "after" state and reports a number that is true of no real
 * moment a reader ever sees.
 *
 * The three states checked are the sidebar link classes style.css defines:
 * `.sec-done` (section fully ticked), `.sec-part` (partially ticked) and the
 * plain, unticked link. WCAG AA for normal text is 4.5:1 — that is the pass
 * threshold used here.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, readUtf8, fileUrl, detectKeyPrefix, requireGlobal } = require('./lib/repo');

const VIEWPORT = { width: 1400, height: 1000 };
const CONTRAST_MIN = 4.5;
const SETTLE_MS = 1500;

const L = ([r, g, b]) => {
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrastRatio = (a, b) => {
  const [hi, lo] = [L(a), L(b)].sort((x, y) => y - x);
  return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
};

/* The page with the richest signal for this check: the one with the most
 * data-k checkboxes in the game folder, since ticking half of a large set is
 * the most likely way to actually produce all three link states (done /
 * partial / untouched) on the same page. Picking by content rather than a
 * hardcoded filename is what lets this check run unmodified on a second game
 * folder with different page names. */
function pickRepresentativePage(gameDir) {
  const files = listHtmlFiles(gameDir).filter(f => f !== 'index.html');
  let best = null, bestCount = -1;
  for (const f of files) {
    const n = (readUtf8(path.join(gameDir, f)).match(/data-k="/g) || []).length;
    if (n > bestCount) { bestCount = n; best = f; }
  }
  return { file: best, count: bestCount };
}

async function run(gameArg) {
  const { chromium } = requireGlobal('playwright');
  const { PNG } = requireGlobal('pngjs');
  const games = resolveGames(gameArg);
  const lines = [];
  const failures = [];
  let checkedPairs = 0;

  const browser = await chromium.launch();
  try {
    for (const game of games) {
      const { file, count } = pickRepresentativePage(game.dir);
      if (!file || count === 0) {
        lines.push(`${game.name}: no page with checkboxes found — skipped`);
        continue;
      }
      const prefix = detectKeyPrefix(game.dir);
      lines.push(`\n${game.name} (sampled from ${file}, ${count} checkboxes)`);

      for (const theme of ['light', 'dark']) {
        const ctx = await browser.newContext({ viewport: VIEWPORT });
        const page = await ctx.newPage();
        await page.addInitScript(({ theme, prefix }) => { try { localStorage.setItem(prefix + '_theme', theme); } catch (e) {} }, { theme, prefix });
        await page.goto(fileUrl(path.join(game.dir, file)));
        await page.waitForTimeout(600);
        await page.evaluate(() => {
          const bs = [...document.querySelectorAll('input[type=checkbox][data-k]')];
          bs.slice(0, Math.ceil(bs.length * 0.5)).forEach(x => { x.checked = true; x.dispatchEvent(new Event('change', { bubbles: true })); });
        });
        await page.waitForTimeout(SETTLE_MS);

        lines.push('  === ' + theme.toUpperCase());
        for (const [label, sel] of [
          ['done (ครบ)', '.wrap>nav.toc a.sec-done'],
          ['partial (บางส่วน)', '.wrap>nav.toc a.sec-part'],
          ['untouched (ยังไม่แตะ)', '.wrap>nav.toc a:not(.sec-done):not(.sec-part)'],
        ]) {
          const loc = page.locator(sel).first();
          if (!(await loc.count())) { lines.push('    ' + label.padEnd(24) + '(none on this page)'); continue; }
          const buf = await loc.screenshot();
          const png = PNG.sync.read(buf);
          let dark = [255, 255, 255], light = [0, 0, 0];
          for (let i = 0; i < png.data.length; i += 4) {
            const px = [png.data[i], png.data[i + 1], png.data[i + 2]];
            if (L(px) < L(dark)) dark = px;
            if (L(px) > L(light)) light = px;
          }
          const css = await loc.evaluate(el => getComputedStyle(el).color);
          const ratio = contrastRatio(dark, light);
          const pass = ratio >= CONTRAST_MIN;
          checkedPairs++;
          if (!pass) failures.push(`${game.name}/${theme}/${label}: ${ratio}:1 (css color ${css})`);
          lines.push('    ' + label.padEnd(24) + css.padEnd(20) + 'painted contrast ' + ratio + ':1  ' + (pass ? 'PASS' : 'FAIL'));
        }
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }

  const pass = failures.length === 0;
  lines.push(
    pass
      ? `\ndark-check2: PASS — ${checkedPairs} state/theme readings all >= ${CONTRAST_MIN}:1`
      : `\ndark-check2: FAIL — ${failures.length} of ${checkedPairs} readings below ${CONTRAST_MIN}:1:\n  ${failures.join('\n  ')}`
  );
  return { pass, lines, checkedPairs, failed: failures.length };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ pass, lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = pass ? 0 : 1;
  }).catch(e => {
    console.error('dark-check2.js error:', e.message);
    process.exitCode = 1;
  });
}
