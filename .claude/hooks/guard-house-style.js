#!/usr/bin/env node
'use strict';
/*
 * guard-house-style.js — PreToolUse hook on Edit and Write. BLOCKS.
 *
 * WHAT IT ENFORCES
 * Six house rules for this walkthrough repo. Each one is cheap to break by
 * accident and expensive to find later, which is why it is a hook and not a
 * line in a style guide:
 *
 *  1. NO MIDDOT. The inline separator in page text is the spaced en dash " - ".
 *     A middot renders almost identically at body size, so a stray one survives
 *     proofreading and then looks wrong next to every other page.
 *
 *  2. NO <style> BLOCK in a game page. These pages are opened straight off disk
 *     with file:// and share one stylesheet. A per-page <style> block silently
 *     forks the design system: the page keeps working, so nobody notices until
 *     the two copies have drifted apart.
 *
 *  3. NO INLINE style= THAT SETS font-size. Same reason - type scale belongs to
 *     the shared stylesheet. Note this checks the HTML style="..." ATTRIBUTE
 *     only. A bare SVG presentation attribute like font-size="14" inside a
 *     diagram is explicitly allowed by the project rules and must not trip.
 *
 *  4. NO HARDCODED HEX COLOUR ON AN SVG PAINT ATTRIBUTE. The reader toggles dark
 *     mode. A hex colour does not follow the theme, so the shape turns invisible
 *     against the dark background - a bug the author never sees because they
 *     authored in light mode. Use a theme token: var(--ink), var(--cyan),
 *     currentColor, and so on.
 *
 *  5. NO INTERNAL AGENT CODENAMES. The repo owner runs a subagent team whose
 *     members have private codenames. Those are orchestration labels, not
 *     something other people reading this repo should ever see. See the long
 *     comment on CODENAME DETECTION below - this rule is deliberately narrow,
 *     because the repo is FULL of legitimate game items that collide with the
 *     codenames (Phoenix Down, Dragon Fang, Dragon Scale, Coral Sword, Mega
 *     Phoenix, Auto-Phoenix).
 *
 *  6. NO COMPASS DIRECTIONS in Thai page text. Final Fantasy X gives the player
 *     no compass and no minimap north, so "go north" is unusable instruction.
 *     The house style is landmark plus left/right relative to the way the player
 *     is walking.
 *
 * HOW "INTRODUCES" IS DECIDED  (this is the important design decision)
 * The hook compares a BEFORE text against an AFTER text and only complains when
 * the number of violations goes UP:
 *     Edit  -> before = old_string,          after = new_string
 *     Write -> before = the file on disk,    after = content
 * Absolute scanning was rejected. The repo already contains pre-existing
 * violations that must not become landmines:
 *   - games/ffx/_to_delete/*.html are legacy pages full of middots, <style> blocks and
 *     inline font-size, kept until they are deleted.
 *   - games/ffx/stages/02-baaj-ruins.html contains the words for north/south/east/west inside
 *     a sentence that EXPLAINS the guide never uses compass directions.
 * With absolute scanning, any edit that merely touched one of those lines would
 * be blocked with no way forward. With delta scanning, carrying an existing
 * violation along untouched is fine and adding a new one is blocked.
 *
 * ON FAILURE
 * Blocking is the whole point of this hook, so a detected violation exits 2 with
 * a deny decision. Anything unexpected (bad JSON, unreadable file, a regex
 * blowing up) fails OPEN via runHook() - it logs to stderr and allows the write.
 */

const fs = require('fs');
const path = require('path');
const io = require(path.join(__dirname, '_hook-io.js'));

const HOOK_NAME = 'guard-house-style';

/* The owner's private subagent codenames. Never allowed to reach the repo. */
/* The words themselves are deliberately NOT in this file.
 * This repository is public, and a hook whose job is to stop private orchestration
 * codenames from reaching a public repo cannot itself publish the list. The names live
 * in `.claude/hooks/codenames.local.json` (git-ignored), shaped as `["name", ...]`.
 * If that file is absent — which is the normal state for anyone who clones this repo —
 * the list is empty and this particular check simply does nothing. Every other check in
 * this hook still runs. To enable it, create the file with your own list. */
function loadCodenames() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, "codenames.local.json"), "utf8");
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter(s => typeof s === "string" && s).map(s => s.toLowerCase()) : [];
  } catch (e) {
    // No file at all is the normal state for a fresh clone: the list is git-ignored.
    if (e && e.code === 'ENOENT') return [];
    // Anything else is a defect. Let it surface as a hook failure rather than silently
    // returning an empty list, because an empty list disables this check completely and
    // nobody would ever find out. That silence already cost one debugging session.
    throw e;
  }
}
const CODENAMES = loadCodenames();
const CODENAME_ALT = CODENAMES.join('|');

/*
 * CODENAME DETECTION - the exact rule, and why it is this narrow.
 *
 * The naive check ("does the text contain the codename as a substring") is useless here.
 * This is a Final Fantasy X guide: `Dragon Fang`, `Dragon Scale`, `Phoenix Down`,
 * `Mega Phoenix`, `Auto-Phoenix` and `Coral Sword` are real item and ability
 * names that appear hundreds of times in legitimate prose. A check that fires on
 * those would be turned off within a day, which is worse than no check.
 *
 * Worse, the obvious refinement - "flag a codename inside a data-k value" - is
 * ALSO wrong here. The repo already ships data-k="s04-phoenix", "s11-phoenix"
 * and "s11-megaphoenix": those are checkbox keys for Phoenix Down pickups, and
 * their ticked state is live reader progress.
 *
 * So the rule is: a codename must appear as a COMPLETE token on its own, in a
 * position that can only be a machine identifier or an authorship attribution.
 * Never in prose. Concretely, a violation is one of:
 *
 *   (a) IDENTIFIER ATTRIBUTE, whole-token match. One of a fixed list of
 *       attributes that hold identifiers and never hold sentences (data-k, id,
 *       class, name, for, slot, part, data-page, plus explicitly attributional
 *       ones like data-agent/data-author/data-owner). The attribute value is
 *       split on whitespace and a token must equal a codename EXACTLY.
 *         data-k="<codename>"      -> BLOCKED (whole value is the codename)
 *         class="note <codename>"  -> BLOCKED (whole token in the class list)
 *         data-k="s04-phoenix"     -> allowed (token is "s04-phoenix")
 *         data-k="s11-megaphoenix" -> allowed
 *       Deliberately NOT a generic data-* sweep: data-note holds Thai prose and
 *       would drag item names back in.
 *
 *   (b) ATTRIBUTION PHRASE. An authorship or ownership keyword immediately
 *       followed by a codename: "author: <codename>", "agent=<codename>",
 *       "@<codename>", "Co-authored-by: <codename>". A negative lookahead for
 *       a following Capitalised word keeps item names out, so "by Phoenix Down"
 *       and "by Dragon Fang" still pass.
 *
 *   (c) EXACT-ONLY COMMENT. A comment whose entire body is a codename and
 *       nothing else: <!-- <codename> -->, or a // <codename> line. A comment such as
 *       <!-- Dragon Fang table --> is untouched, because the body is not just
 *       the codename.
 *
 *   (d) FILE PATH. A path segment whose stem is exactly a codename, e.g.
 *       <codename>.md, notes/<codename>.js, .claude/agents/<codename>/. Checked against the
 *       target path itself, not the content. A hyphenated name like
 *       coral-sword.html is allowed, since that is a plausible real page.
 *
 * Verified against the whole existing repo: zero matches. Every current
 * occurrence of these words is legitimate game text or a prefixed data-k key.
 */
const IDENTIFIER_ATTRS = [
  'data-k', 'id', 'class', 'name', 'for', 'slot', 'part', 'data-page', 'data-prefix',
  'data-agent', 'data-author', 'data-owner', 'data-by', 'data-reviewer',
];
const IDENTIFIER_ATTR_RE = new RegExp(
  '\\b(?:' + IDENTIFIER_ATTRS.join('|') + ')\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\')',
  'gi'
);
const ATTRIBUTION_RE = new RegExp(
  '(?:@|\\b(?:author|authored|agent|subagent|owner|owned|reviewer|reviewed|assignee|assigned|maintainer|delegated|handoff|by|signed-off-by|co-authored-by)\\b)' +
    '\\s*[:=-]?\\s*(?:' + CODENAME_ALT + ')\\b(?!\\s+[A-Z])',
  'gi'
);
const EXACT_HTML_COMMENT_RE = new RegExp('<!--\\s*(?:' + CODENAME_ALT + ')\\s*-->', 'gi');
const EXACT_LINE_COMMENT_RE = new RegExp('(?:^|\\n)[ \\t]*(?://|#)[ \\t]*(?:' + CODENAME_ALT + ')[ \\t]*(?=\\r?\\n|$)', 'gi');

/** Matches for codename rule (a): a codename as a whole token in an identifier attribute. */
function findCodenameIdentifiers(text) {
  const out = [];
  const re = new RegExp(IDENTIFIER_ATTR_RE.source, IDENTIFIER_ATTR_RE.flags);
  let m;
  while ((m = re.exec(text)) !== null) {
    const value = m[1] !== undefined ? m[1] : m[2];
    if (!value) continue;
    const tokens = value.trim().split(/\s+/);
    if (tokens.some((t) => CODENAMES.includes(t.toLowerCase()))) {
      out.push({ text: m[0], index: m.index });
    }
  }
  return out;
}

function findCodenames(text) {
  /* An empty list must DISABLE this check, never widen it.
   * Three of the four patterns below interpolate the codename list into a regex as an
   * alternation. With no names the alternation is the empty string, so (?:) matches
   * everywhere and the attribution pattern collapses to "the word by followed by any
   * lowercase word" - which appears in almost every document in this repo. That empty
   * state is the NORMAL one for anyone who clones this repository, because the list
   * file is git-ignored. Without this guard the hook would block nearly every edit
   * they make and blame a codename that was never there. */
  if (CODENAMES.length === 0) return [];
  return [
    ...findCodenameIdentifiers(text),
    ...io.findMatches(text, ATTRIBUTION_RE),
    ...io.findMatches(text, EXACT_HTML_COMMENT_RE),
    ...io.findMatches(text, EXACT_LINE_COMMENT_RE),
  ].sort((a, b) => a.index - b.index);
}

/*
 * SVG hex colour. Scoped to the paint/colour ATTRIBUTES rather than to the span
 * between <svg> and </svg>, for two concrete reasons:
 *   - An Edit's new_string is usually a fragment. It can sit inside a diagram
 *     without containing the <svg> tag at all, so tag-scoped matching would miss
 *     exactly the case this rule exists for.
 *   - Tag-scoped matching produces false positives on fragment references, since
 *     href="#abc" is three hex-looking characters. Attribute scoping cannot
 *     confuse a link with a colour.
 * In this repo every fill=/stroke= attribute is inside an inline SVG diagram
 * (checked: 190 of them, all var(--token)), so attribute scoping is equivalent
 * to "inside <svg>" in practice while also working on fragments.
 */
const HEX = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])';
const SVG_PAINT_ATTRS = 'fill|stroke|stop-color|flood-color|lighting-color|color';
const SVG_HEX_ATTR_RE = new RegExp('\\b(?:' + SVG_PAINT_ATTRS + ')\\s*=\\s*["\']?\\s*' + HEX, 'gi');
const SVG_HEX_IN_STYLE_RE = new RegExp(
  '\\bstyle\\s*=\\s*["\'][^"\']*\\b(?:' + SVG_PAINT_ATTRS + ')\\s*:\\s*' + HEX,
  'gi'
);

function findSvgHex(text) {
  return [...io.findMatches(text, SVG_HEX_ATTR_RE), ...io.findMatches(text, SVG_HEX_IN_STYLE_RE)].sort(
    (a, b) => a.index - b.index
  );
}

/* The six rules. `applies` gates by file kind; `find` returns every match. */
const RULES = [
  {
    id: 'middot-separator',
    headline: 'Forbidden separator - middot "\u00b7"',
    why: 'The house inline separator is the spaced en dash " \u2013 ". A middot looks almost identical at body size, so a stray one survives proofreading and then reads as wrong beside every other page.',
    fix: 'Replace each "\u00b7" with " \u2013 " (space, EN DASH U+2013, space).',
    applies: (ctx) => ctx.isHtml,
    find: (text) => io.findMatches(text, /\u00b7/g),
  },
  {
    id: 'style-block',
    headline: '<style> block inside a game page',
    why: 'Pages are opened from disk over file:// and share one stylesheet. A per-page <style> block forks the design system quietly: the page still works, so the two copies drift apart unnoticed.',
    fix: 'Move the declarations into the shared stylesheet (the game folder\'s style.css) and reference them with a class.',
    applies: (ctx) => ctx.isGamePage,
    find: (text) => io.findMatches(text, /<style[\s>]/gi),
  },
  {
    id: 'inline-font-size',
    headline: 'Inline style= attribute that sets font-size',
    why: 'The type scale belongs to the shared stylesheet. An inline font-size overrides it for one element only, which is how pages end up with six slightly different body sizes.',
    fix: 'Delete the font-size from the style attribute and use an existing class. A bare SVG presentation attribute such as font-size="14" inside a diagram is fine and is not what this rule targets.',
    applies: (ctx) => ctx.isHtml,
    find: (text) =>
      io.findMatches(text, /\bstyle\s*=\s*"[^"]*font-size[^"]*"|\bstyle\s*=\s*'[^']*font-size[^']*'/gi),
  },
  {
    id: 'svg-hardcoded-hex',
    headline: 'Hardcoded hex colour on an SVG paint attribute',
    why: 'The reader toggles dark mode. A hex colour does not follow the theme, so the shape becomes invisible against the dark background - and the author never sees it, because they authored in light mode.',
    fix: 'Use a theme token instead: var(--ink), var(--muted), var(--cyan), var(--gold), var(--line), or currentColor.',
    applies: (ctx) => ctx.isHtml,
    find: findSvgHex,
  },
  {
    id: 'internal-codename',
    headline: 'Internal agent codename used as an identifier or an attribution',
    why: 'These are the repo owner\'s private subagent labels. They are orchestration bookkeeping, meaningless and confusing to anyone else who reads or maintains this repository.',
    fix: 'Use a neutral role name instead - Developer, Reviewer, QA, PM, Designer, Technical Writer - or drop the attribution entirely. In-game names such as Phoenix Down, Dragon Fang, Dragon Scale and Coral Sword are unaffected by this rule; only a codename standing alone as an identifier or an attribution triggers it.',
    applies: () => true,
    find: findCodenames,
  },
  {
    id: 'compass-direction',
    headline: 'Compass direction in Thai page text',
    why: 'The game gives the player no compass and no fixed map north, so an instruction to go north cannot be followed at the screen.',
    fix: 'Describe the move by landmark plus left/right relative to the way the player is walking - for example "\u0e40\u0e25\u0e35\u0e49\u0e22\u0e27\u0e0b\u0e49\u0e32\u0e22\u0e17\u0e35\u0e48\u0e40\u0e2a\u0e32\u0e2b\u0e34\u0e19" rather than "\u0e44\u0e1b\u0e17\u0e32\u0e07\u0e17\u0e34\u0e28\u0e40\u0e2b\u0e19\u0e37\u0e2d".',
    applies: (ctx) => ctx.isGamePage,
    find: (text) => io.findMatches(text, /\u0e17\u0e34\u0e28(?:\u0e40\u0e2b\u0e19\u0e37\u0e2d|\u0e43\u0e15\u0e49|\u0e15\u0e30\u0e27\u0e31\u0e19\u0e2d\u0e2d\u0e01|\u0e15\u0e30\u0e27\u0e31\u0e19\u0e15\u0e01)/g),
  },
];

/** A codename used as a file name is a leak regardless of what the file contains. */
function findCodenameInPath(relPath) {
  const offenders = [];
  for (const segment of relPath.split('/')) {
    if (!segment) continue;
    const stem = segment.replace(/\.[^.]+$/, '').toLowerCase();
    if (CODENAMES.includes(stem)) offenders.push(segment);
  }
  return offenders;
}

io.runHook(HOOK_NAME, async (hookInput) => {
  const payload = io.extractEditPayload(hookInput);
  if (!payload) return io.allow(); // not an Edit/Write we understand

  const { filePath, before, after, toolName } = payload;
  const projectDir = io.resolveProjectDir(hookInput, filePath);
  const relPath = io.relativePosixPath(projectDir, filePath);

  const ctx = {
    isHtml: io.isHtml(filePath),
    isGamePage: io.isGameFolderHtml(projectDir, filePath),
  };

  const problems = [];

  // Path-level codename check first: no before/after delta applies to a file name.
  const pathOffenders = findCodenameInPath(relPath);
  if (pathOffenders.length > 0) {
    problems.push({
      rule: RULES.find((r) => r.id === 'internal-codename'),
      newCount: pathOffenders.length,
      oldCount: 0,
      lines: pathOffenders.map((s) => '    - path segment: "' + s + '"'),
    });
  }

  // Content rules, delta-scored so a pre-existing violation is not blamed here.
  for (const rule of RULES) {
    if (!rule.applies(ctx)) continue;
    const afterMatches = rule.find(after);
    if (afterMatches.length === 0) continue;
    const beforeCount = rule.find(before).length;
    if (afterMatches.length <= beforeCount) continue; // carried along, not introduced
    problems.push({
      rule,
      newCount: afterMatches.length - beforeCount,
      oldCount: beforeCount,
      lines: io.describeMatches(after, afterMatches),
    });
  }

  if (problems.length === 0) return io.allow();

  const beforeLabel = toolName === 'Write' ? 'the file currently on disk' : 'the text being replaced';
  const parts = [];
  parts.push('BLOCKED by ' + HOOK_NAME + ': ' + relPath);
  parts.push('');
  parts.push(
    'This ' +
      toolName +
      ' would introduce ' +
      problems.reduce((n, p) => n + p.newCount, 0) +
      ' house-rule violation(s). Nothing was written.'
  );
  problems.forEach((p, i) => {
    parts.push('');
    parts.push(
      '[' +
        (i + 1) +
        '] ' +
        p.rule.headline +
        '  (' +
        p.newCount +
        ' new; ' +
        p.oldCount +
        ' already present in ' +
        beforeLabel +
        ')'
    );
    parts.push('    Why: ' + p.rule.why);
    parts.push('    Fix: ' + p.rule.fix);
    parts.push(...p.lines);
  });
  parts.push('');
  parts.push('Correct the text above and retry. Only newly introduced violations are counted, so');
  parts.push('an existing one that this edit merely carries along will not block you.');

  io.denyPreToolUse(parts.join('\n'));
});
