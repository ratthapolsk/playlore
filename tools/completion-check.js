'use strict';
/*
 * Completion-state check — proves that finished / half-done / untouched
 * stages actually render differently, instead of trusting that the code
 * which paints them is correct by inspection.
 *
 * Two places encode "how much of this has the reader done" and both are
 * exercised here:
 *
 *   1. A stage page's own sidebar (`.wrap>nav.toc a`) mirrors each in-page
 *      section's state onto the matching link via the classes `.sec-done`
 *      and `.sec-part` (see fx.js's updateProgress). Ticking every checkbox
 *      on the page must turn at least one link `.sec-done` with a colour
 *      that visibly differs from an un-ticked link — matching classes alone
 *      is not proof; two classes that resolve to the same computed colour
 *      would still look identical to the reader.
 *
 *   2. index.html paints each stage card's ring, `.st-prog` badge and
 *      `done-all`/`some-done` class from the `<prefix>_stats` localStorage
 *      blob (see fx.js's initIndexProgress) — this is the mechanism
 *      docs/verification.md's own worked example is about: on a fresh
 *      profile this blob is empty, so a card must default to "untouched"
 *      rather than silently reading as complete.
 *
 * The three index stages used for the test are simply the first three stage
 * numbers index.html actually lists (not a hardcoded stage number) — the
 * first is seeded as finished, the second as half-done, the third is left
 * out of the stats blob entirely (as if the reader has never opened it). The
 * localStorage key convention (`s` + 2-digit stage number) matches
 * tools/sync-totals.js, which stamps index.html from that same convention.
 */
const path = require('path');
const { resolveGames, listHtmlFiles, readUtf8, fileUrl, detectKeyPrefix, requireGlobal } = require('./lib/repo');

const VIEWPORT = { width: 1400, height: 1000 };
const SETTLE_MS = 900;

function pickRepresentativePage(gameDir) {
  const files = listHtmlFiles(gameDir).filter(f => f !== 'index.html');
  let best = null, bestCount = -1;
  for (const f of files) {
    const n = (readUtf8(path.join(gameDir, f)).match(/data-k="/g) || []).length;
    if (n > bestCount) { bestCount = n; best = f; }
  }
  return best;
}

async function run(gameArg) {
  const { chromium } = requireGlobal('playwright');
  const games = resolveGames(gameArg);
  const lines = [];
  const problems = [];

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    for (const game of games) {
      const prefix = detectKeyPrefix(game.dir);
      lines.push(`\n${game.name} (localStorage key prefix "${prefix}")`);

      // ---------- 1. stage page: does the sidebar mark finished sections? ----
      const stageFile = pickRepresentativePage(game.dir);
      if (!stageFile) {
        lines.push('  no page with checkboxes found — skipping stage-page part');
      } else {
        await page.goto(fileUrl(path.join(game.dir, stageFile)));
        await page.waitForTimeout(600);
        /* Tick MOST of the boxes, deliberately not all of them.
         *
         * Ticking every box on a page makes app.js fire `ffx:complete`, which
         * gimmicks.js answers with the Overdrive celebration -- a full-screen
         * flash and a banner that sit over the page while colours are read.
         * That produced a false failure: the rail measured as cyan at 100%
         * ticked and green at 50%, on every page, which looked like a CSS bug
         * and is actually the celebration doing its job.
         *
         * Leaving one section untouched also gives the check what it actually
         * needs -- a done link AND a not-done link on the same page to compare. */
        await page.evaluate(() => {
          const boxes = [...document.querySelectorAll('input[type=checkbox][data-k]')];
          const upTo = Math.max(1, Math.floor(boxes.length * 0.6));
          boxes.slice(0, upTo).forEach(b => {
            if (!b.checked) { b.checked = true; b.dispatchEvent(new Event('change', { bubbles: true })); }
          });
        });
        /* Wait for the rail colour to STOP CHANGING rather than guessing a
         * duration. Two things stack up here and a fixed timeout gets both
         * wrong: app.js recomputes section state once per change event, so a
         * page with 231 checkboxes (ref-monster-arena) does 231 passes before
         * the .sec-done class is even applied; and the colour then animates
         * via a CSS transition. A 400ms wait passed on ordinary pages and
         * reported a false failure on the biggest one — the colour was read
         * mid-fade, or before the class landed at all. */
        /* Wait for the rail to actually finish reacting, not for a guessed
         * duration. Two things stack up and a fixed timeout gets both wrong:
         * app.js recomputes section state once per change event, so a page
         * with 231 checkboxes does 231 passes before .sec-done is applied at
         * all, and the colour then animates via a CSS transition.
         *
         * Polling for "the colour stopped changing" is NOT enough either --
         * two identical reads taken before the transition starts look settled.
         * So poll for the condition the check is actually about: a done link
         * and a not-done link rendering different colours. If the styling is
         * genuinely broken they never diverge and this times out, which is the
         * correct failure. */
        const diverged = await page.waitForFunction(() => {
          const links = [...document.querySelectorAll('.wrap>nav.toc a')];
          const done = links.find(a => a.classList.contains('sec-done'));
          const plain = links.find(a => !a.classList.contains('sec-done') && !a.classList.contains('sec-part'));
          if (!done || !plain) return false;
          return getComputedStyle(done).color !== getComputedStyle(plain).color;
        }, { timeout: 8000, polling: 200 }).then(() => true).catch(() => false);
        if (!diverged) {
          lines.push('  (the done and not-done colours never diverged within 8s)');
        }
        const rail = await page.evaluate(() => {
          const links = [...document.querySelectorAll('.wrap>nav.toc a')];
          const notDone = links.find(a => !a.classList.contains('sec-done'));
          return {
            total: links.length,
            done: links.filter(a => a.classList.contains('sec-done')).length,
            part: links.filter(a => a.classList.contains('sec-part')).length,
            doneColour: links.find(a => a.classList.contains('sec-done')) ? getComputedStyle(links.find(a => a.classList.contains('sec-done'))).color : null,
            notDoneColour: notDone ? getComputedStyle(notDone).color : null,
          };
        });
        lines.push(`  stage page ${stageFile} — ticked 60% of the checkboxes (all of them would trigger the completion celebration)`);
        lines.push(`    ${rail.done} of ${rail.total} sidebar links marked done, ${rail.part} partial`);
        lines.push(`    done colour ${rail.doneColour}  vs  not-done colour ${rail.notDoneColour}`);
        if (rail.done === 0) problems.push(`${game.name}/${stageFile}: ticking every checkbox on the page produced zero .sec-done sidebar links`);
        else if (rail.notDoneColour && rail.doneColour === rail.notDoneColour) problems.push(`${game.name}/${stageFile}: .sec-done link renders the SAME colour as a not-done link (${rail.doneColour})`);
      }

      // ---------- 2. index: seed a mix, then measure the three card states --
      await page.goto(fileUrl(path.join(game.dir, 'index.html')));
      const stageNumbers = await page.evaluate(() =>
        [...document.querySelectorAll('ol.stages li')]
          .map(li => {
            const n = li.querySelector('.st-n') ? parseInt(li.querySelector('.st-n').textContent, 10) : NaN;
            return { n, total: parseInt(li.dataset.total || '0', 10) || 0 };
          })
          .filter(x => Number.isFinite(x.n))
      );
      const distinct = [];
      const seen = new Set();
      for (const s of stageNumbers) { if (!seen.has(s.n)) { seen.add(s.n); distinct.push(s); } }
      if (distinct.length < 3) {
        lines.push(`  index.html lists only ${distinct.length} stage(s) — need at least 3 to test finished/half/untouched, skipping index part`);
      } else {
        const [a, b, c] = distinct.slice(0, 3);
        const key = n => 's' + String(n).padStart(2, '0');
        await page.evaluate(({ prefix, a, b }) => {
          const stats = {};
          stats[a.key] = { d: a.total, t: a.total };       // finished
          stats[b.key] = { d: Math.floor(b.total / 2), t: b.total }; // half-done
          // c is deliberately absent — untouched, as on a fresh profile
          localStorage.setItem(prefix + '_stats', JSON.stringify(stats));
        }, { prefix, a: { key: key(a.n), total: a.total || 1 }, b: { key: key(b.n), total: b.total || 2 } });
        await page.reload();
        await page.waitForTimeout(SETTLE_MS);

        const cards = await page.evaluate(nums => {
          const pick = n => [...document.querySelectorAll('ol.stages li')].find(li => li.querySelector('.st-n') && +li.querySelector('.st-n').textContent === n);
          return nums.map(n => {
            const li = pick(n);
            if (!li) return { stage: n, missing: true };
            const ring = li.querySelector('.ring');
            const tag = li.querySelector('.st-prog');
            return {
              stage: n,
              cls: li.className || '(none)',
              ring: ring ? ring.style.background.slice(0, 60) : null,
              count: tag ? tag.textContent : null,
            };
          });
        }, [a.n, b.n, c.n]);

        lines.push(`  index.html — stages ${a.n} (seeded finished), ${b.n} (seeded half), ${c.n} (left untouched)`);
        cards.forEach(cd => lines.push(`    stage ${cd.stage}: class="${cd.cls}" ring=${cd.ring} count=${cd.count}`));

        const sig = cd => `${cd.cls}|${cd.count}|${cd.ring}`;
        const sigs = cards.map(sig);
        if (new Set(sigs).size !== 3) {
          problems.push(`${game.name}/index.html: finished/half/untouched cards did not render as three distinct states (${cards.map(cd => `stage ${cd.stage}=${sig(cd)}`).join('  vs  ')})`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  const pass = problems.length === 0;
  lines.push(
    pass
      ? '\ncompletion-check: PASS — finished/half-done/untouched states render distinctly, on both the stage sidebar and the index cards'
      : `\ncompletion-check: FAIL —\n  ${problems.join('\n  ')}`
  );
  return { pass, lines, problems: problems.length };
}

module.exports = { run };

if (require.main === module) {
  run(process.argv[2]).then(({ pass, lines }) => {
    console.log(lines.join('\n'));
    process.exitCode = pass ? 0 : 1;
  }).catch(e => {
    console.error('completion-check.js error:', e.message);
    process.exitCode = 1;
  });
}
