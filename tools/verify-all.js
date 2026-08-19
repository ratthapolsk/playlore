'use strict';
/*
 * verify-all.js — runs every check in tools/ and prints one PASS/FAIL summary.
 *
 * Usage:
 *   node tools/verify-all.js            all games
 *   node tools/verify-all.js ffx        one game
 *   node tools/verify-all.js --fast     skip the checks that need a browser
 *   node tools/verify-all.js ffx --fast  both together, either order
 *
 * Checks run in two groups. The FAST group is a pure text/regex scan of the
 * HTML on disk and reports in well under a second; the BROWSER group launches
 * Chromium via Playwright to measure things text alone cannot answer
 * (rendered width, computed colour, painted pixels, layout shift over time)
 * and takes tens of seconds to a few minutes depending on how many pages
 * exist. Fast checks are run and reported FIRST so a structural break (a
 * mismatched tag, a duplicate data-k) is visible immediately instead of
 * waiting behind a slow browser run to find out. --fast skips the browser
 * group entirely, for a quick sanity pass while iterating.
 *
 * tools/sync-totals.js is deliberately NOT in this list: it writes to
 * index.html rather than checking anything, and a "verify" step must never
 * mutate the repo as a side effect. Run it by hand instead — see its own
 * comment and README.md.
 *
 * tools/density.js and tools/gloss-survey.js always return pass:true — they
 * are surveys for a human to read, not correctness gates (see their own
 * comments for why). They still run here and still print, because "everyone
 * runs the harness and reads what it says" beats "some checks are hidden
 * from the normal run".
 */
const path = require('path');
const { resolveGames } = require('./lib/repo');

const FAST_CHECKS = [
  { name: 'tags', mod: './tags' },
  { name: 'density', mod: './density' },
  { name: 'gloss-survey', mod: './gloss-survey' },
];
const BROWSER_CHECKS = [
  { name: 'tblfit', mod: './tblfit' },
  { name: 'sidebar-check', mod: './sidebar-check' },
  { name: 'dark-check2', mod: './dark-check2' },
  { name: 'completion-check', mod: './completion-check' },
  { name: 'stability', mod: './stability' },
];

function parseArgs(argv) {
  let game, fast = false;
  for (const a of argv) {
    if (a === '--fast') fast = true;
    else if (!game) game = a;
    else throw new Error(`unrecognised argument "${a}"`);
  }
  return { game, fast };
}

async function runGroup(checks, gameArg, lines, results) {
  for (const check of checks) {
    const { run } = require(check.mod);
    const t0 = Date.now();
    let result;
    try {
      result = await run(gameArg);
    } catch (e) {
      result = { pass: false, lines: [`${check.name} threw: ${e.message}`] };
    }
    const ms = Date.now() - t0;
    lines.push(`\n${'='.repeat(70)}\n${check.name}  (${ms}ms)\n${'='.repeat(70)}`);
    lines.push(...result.lines);
    results.push({ name: check.name, pass: result.pass, ms });
  }
}

async function main() {
  const { game, fast } = parseArgs(process.argv.slice(2));
  // fail loud and early if the game name doesn't exist, instead of every
  // sub-check discovering that independently and repeating the same error
  resolveGames(game);

  const lines = [];
  const results = [];

  await runGroup(FAST_CHECKS, game, lines, results);
  if (!fast) {
    await runGroup(BROWSER_CHECKS, game, lines, results);
  } else {
    lines.push('\n(--fast: skipped ' + BROWSER_CHECKS.map(c => c.name).join(', ') + ')');
  }

  console.log(lines.join('\n'));

  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY' + (game ? ` (${game})` : ' (all games)'));
  console.log('='.repeat(70));
  let anyFail = false;
  for (const r of results) {
    if (!r.pass) anyFail = true;
    console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(20)} ${r.ms}ms`);
  }
  console.log('='.repeat(70));
  console.log(anyFail ? 'RESULT: FAIL' : 'RESULT: PASS');
  process.exitCode = anyFail ? 1 : 0;
}

main().catch(e => {
  console.error('verify-all.js error:', e.message);
  process.exitCode = 1;
});
