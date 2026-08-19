'use strict';
/*
 * Stability harness — layout shift, invisible text, dead controls, load time.
 *
 * usage:
 *   node tools/stability.js                 every page of every game
 *   node tools/stability.js ffx              every page of one game
 *   node tools/stability.js ffx 04-besaid-aeon-valefor.html ref-gear.html
 *                                             only the named pages of one game
 *
 * Every page here is a static document that CLAUDE.md requires to "work with
 * JavaScript doing nothing: content is visible on load, never revealed by an
 * animation" — so on a page that follows that rule, cumulative layout shift
 * (CLS) after first paint should be close to zero. This harness treats
 * anything above 0.1 as a failure: 0.1 is the boundary Core Web Vitals uses
 * for a "good" score, and it leaves headroom for font-swap/sub-pixel rounding
 * without masking a real bug — on pages with no ads, no lazy images and no
 * dynamically-sized content, a shift past that means something is genuinely
 * moving after the reader has started reading it.
 *
 * Invisible text: any element with real text whose computed opacity sits
 * below 0.9 while still laid out (not display:none) is content the reader
 * cannot read even though it occupies space — almost always a reveal
 * animation that got stuck instead of finishing. 0.9, not 1.0, leaves room
 * for the antialiasing of fully-opaque text; anything visibly under that is a
 * transition that never completed.
 *
 * Horizontal overflow: the page must never need a sideways scroll to read;
 * more than 1px is treated as real overflow, not sub-pixel rounding noise.
 *
 * Dead controls: interactive elements the shared script (fx.js) injects on
 * EVERY page — the theme toggle and the two floating action buttons — must
 * exist and have a real, tappable hit target (>= 20x20 CSS px). Page-scoped
 * controls (the reset button, in-page nav links, prev/next nav) are only
 * checked for a workable hit target WHEN VISIBLY PRESENT: their absence on a
 * page that structurally has none of them (e.g. a reset button on a page with
 * no checklist) is expected, not a bug, and so is an element matching the
 * selector that fx.js has deliberately hidden — e.g. `.navbtns .home` is
 * intentionally set to `display:none` once fx.js injects the floating
 * `.fx-home` pin, so there is exactly one home affordance per page instead of
 * two (see fx.js's injectHomeButton). A control only counts as "dead" if a
 * VISIBLE instance of it renders with an unusably small hit target.
 *
 * The 2600ms initial wait matches the site's own reveal failsafe (see
 * fx.js's initRevealFailsafe): CLS is measured from first paint, but reading
 * the DOM before that failsafe has run would catch a page still mid-reveal
 * and misreport it as broken.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, fileUrl, requireGlobal } = require('./lib/repo');

const VIEWPORT = { width: 1280, height: 820 };
const CLS_THRESHOLD = 0.1;
const HSCROLL_THRESHOLD = 1;
const MIN_HIT_TARGET = 20;

// Injected by fx.js on every page — absence is always a real bug.
const ALWAYS_PRESENT_CONTROLS = ['#themeToggle', '.fx-fab.fx-search', '.fx-fab.fx-top'];
// Only exist on pages of the right shape (checklist, in-page toc, prev/next
// nav) — absence is fine, but if present they must be a real, usable control.
const OPTIONAL_CONTROLS = ['.rst', 'nav.toc a', '.navbtns a'];

async function checkPage(page, label) {
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__shifts = [];
    new PerformanceObserver(l => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__cls += e.value;
        if (e.value > 0.01) window.__shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime) });
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });

  const t0 = Date.now();
  await page.goto(label.url);
  await page.waitForTimeout(2600); // past the reveal failsafe
  await page.evaluate(() => window.scrollTo(0, 1200));
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(900);

  const r = await page.evaluate(() => {
    const hidden = [...document.querySelectorAll('p,li,h2,h3,td,.lbl,.story,.chk')]
      .filter(e => e.textContent.trim().length > 8)
      .filter(e => { const s = getComputedStyle(e); return +s.opacity < 0.9 && s.display !== 'none'; })
      .slice(0, 5).map(e => e.tagName + '.' + (e.className || '').split(' ')[0]);
    return {
      cls: +window.__cls.toFixed(4),
      shifts: window.__shifts.slice(0, 4),
      hidden,
      hScroll: document.documentElement.scrollWidth - window.innerWidth,
    };
  });

  const dead = [];
  for (const sel of ALWAYS_PRESENT_CONTROLS) {
    const n = await page.locator(sel).count();
    if (!n) { dead.push(sel + ' (absent — expected on every page)'); continue; }
    const box = await page.locator(sel).first().boundingBox().catch(() => null);
    if (!box || box.width < MIN_HIT_TARGET || box.height < MIN_HIT_TARGET) {
      dead.push(sel + ' (hit target ' + (box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'none') + ')');
    }
  }
  for (const sel of OPTIONAL_CONTROLS) {
    const locator = page.locator(sel);
    const n = await locator.count();
    if (!n) continue; // not every page has these — fine
    const boxes = [];
    for (let i = 0; i < n; i++) {
      const el = locator.nth(i);
      if (!(await el.isVisible())) continue; // e.g. .navbtns .home, deliberately hidden once .fx-home exists
      boxes.push(await el.boundingBox().catch(() => null));
    }
    if (!boxes.length) continue; // every match is intentionally hidden — not a bug
    const ok = boxes.some(b => b && b.width >= MIN_HIT_TARGET && b.height >= MIN_HIT_TARGET);
    if (!ok) dead.push(sel + ' (visible instance has no usable hit target)');
  }

  const pass = r.cls <= CLS_THRESHOLD && r.hidden.length === 0 && r.hScroll <= HSCROLL_THRESHOLD && dead.length === 0 && errs.length === 0;

  const parts = [
    label.name.padEnd(48),
    'CLS=' + r.cls,
    '| invisible text:', r.hidden.length ? r.hidden.join(',') : 'none',
    '| h-overflow:', r.hScroll > HSCROLL_THRESHOLD ? r.hScroll + 'px' : 'none',
    '| controls:', dead.length ? dead.join(', ') : 'ok',
    '| load+settle ' + (Date.now() - t0) + 'ms',
    errs.length ? '| JS ERR: ' + errs[0] : '',
  ];
  const line = parts.filter(Boolean).join(' ');
  const shiftLine = r.shifts.length ? '   shifts: ' + JSON.stringify(r.shifts) : null;
  return { pass, line, shiftLine };
}

async function run(gameArg, fileArgs) {
  const { chromium } = requireGlobal('playwright');
  const games = resolveGames(gameArg);
  const lines = [];
  let checked = 0;
  let failed = 0;

  const browser = await chromium.launch();
  try {
    for (const game of games) {
      const files = fileArgs && fileArgs.length ? fileArgs : listHtmlFiles(game.dir);
      for (const f of files) {
        const ctx = await browser.newContext({ viewport: VIEWPORT });
        const page = await ctx.newPage();
        checked++;
        const { pass, line, shiftLine } = await checkPage(page, { name: game.name + '/' + f, url: fileUrl(path.join(game.dir, f)) });
        if (!pass) failed++;
        lines.push(line);
        if (shiftLine) lines.push(shiftLine);
        await ctx.close();
      }
    }
  } finally {
    await browser.close();
  }

  const pass = failed === 0;
  lines.push(
    pass
      ? `stability: PASS — ${checked} pages, no layout shift / invisible text / overflow / dead controls beyond threshold`
      : `stability: FAIL — ${failed} of ${checked} pages have a stability problem, see above`
  );
  return { pass, lines, checked, failed };
}

module.exports = { run };

if (require.main === module) {
  const [gameArg, ...fileArgs] = process.argv.slice(2);
  run(gameArg, fileArgs).then(({ pass, lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = pass ? 0 : 1;
  }).catch(e => {
    console.error('stability.js error:', e.message);
    process.exitCode = 1;
  });
}
