#!/usr/bin/env node
// validate.js — HTML travel guide validation script
// Usage: node validate.js travel-guide.html

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2] || 'travel-guide.html';
const fullPath = path.resolve(__dirname, filePath);

let html = '';
let errors = [];
let warnings = [];
let passes = [];

function pass(msg) { passes.push('  [PASS] ' + msg); }
function fail(msg) { errors.push('  [FAIL] ' + msg); }
function warn(msg) { warnings.push('  [WARN] ' + msg); }

// ── Read file ────────────────────────────────────────────────────────────────
if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}
html = fs.readFileSync(fullPath, 'utf8');

// ── 1. Required sections ─────────────────────────────────────────────────────
console.log('\n[1] Required sections');

const sections = [
  { name: 'Route Overview',      patterns: [/id=["']route-overview["']/i, /class=["'][^"']*route-overview[^"']*["']/i] },
  { name: 'Daily Itinerary',     patterns: [/id=["']itinerary["']/i, /id=["']daily-itinerary["']/i, /class=["'][^"']*itinerary[^"']*["']/i] },
  { name: '10 Days content',     patterns: [/dag\s*[1-9]|day\s*[1-9]|giorno\s*[1-9]/i] },
  { name: 'All 10 days present', check: () => {
    let count = 0;
    for (let i = 1; i <= 10; i++) {
      if (new RegExp(`dag\\s*${i}|day\\s*${i}|giorno\\s*${i}|Dag ${i}|Day ${i}`, 'i').test(html)) count++;
    }
    return { ok: count >= 10, detail: `Found ${count}/10 days` };
  }},
  { name: 'Interactive Map',     patterns: [/id=["']map["']/i, /id=["'][^"']*map[^"']*["']/i, /leaflet|mapbox|google.*maps/i] },
  { name: 'Highlights section',  patterns: [/id=["']highlights["']/i, /highlights/i] },
  { name: 'Practical Tips',      patterns: [/id=["']tips["']/i, /id=["']practical["']/i, /praktisch|practical.tips/i] },
];

for (const s of sections) {
  if (s.check) {
    const result = s.check();
    result.ok ? pass(`${s.name} — ${result.detail}`) : fail(`${s.name} — ${result.detail}`);
  } else {
    const found = s.patterns.some(p => p.test(html));
    found ? pass(s.name) : fail(s.name + ' not found');
  }
}

// ── 2. Links and image references ────────────────────────────────────────────
console.log('\n[2] Links and image references');

const localLinks = [...html.matchAll(/href=["'](?!https?:\/\/|mailto:|tel:|#|javascript:)([^"']+)["']/gi)]
  .map(m => m[1]);
const localImages = [...html.matchAll(/src=["'](?!https?:\/\/|data:)([^"']+)["']/gi)]
  .map(m => m[1])
  .filter(src => !src.startsWith('//'));

if (localLinks.length === 0) {
  pass('No broken local link hrefs');
} else {
  for (const link of localLinks) {
    const linkPath = path.resolve(__dirname, link);
    fs.existsSync(linkPath) ? pass(`Link exists: ${link}`) : fail(`Broken local link: ${link}`);
  }
}

if (localImages.length === 0) {
  pass('No local image src references (using remote/inline)');
} else {
  for (const img of localImages) {
    const imgPath = path.resolve(__dirname, img);
    fs.existsSync(imgPath) ? pass(`Image exists: ${img}`) : fail(`Missing image: ${img}`);
  }
}

// ── 3. JavaScript syntax check ───────────────────────────────────────────────
console.log('\n[3] JavaScript syntax');

const scriptBlocks = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(m => m[1].trim())
  .filter(s => s.length > 0);

if (scriptBlocks.length === 0) {
  warn('No inline script blocks found');
} else {
  const tmpFile = path.join(__dirname, '.tmp_validate_script.js');
  let allOk = true;
  for (let i = 0; i < scriptBlocks.length; i++) {
    fs.writeFileSync(tmpFile, scriptBlocks[i]);
    const { execSync } = require('child_process');
    try {
      execSync(`node --check "${tmpFile}"`, { stdio: 'pipe' });
      pass(`Script block ${i + 1}/${scriptBlocks.length} — syntax OK`);
    } catch (e) {
      fail(`Script block ${i + 1} syntax error: ${e.stderr?.toString().split('\n')[0] || e.message}`);
      allOk = false;
    }
  }
  try { fs.unlinkSync(tmpFile); } catch {}
}

// ── 4. scrollTo naming conflicts ─────────────────────────────────────────────
console.log('\n[4] scrollTo / browser built-in conflicts');

// Check for elements with id="scrollTo" (conflicts with window.scrollTo)
const conflictIds = ['scrollTo', 'scrollBy', 'scrollX', 'scrollY', 'scroll',
  'focus', 'blur', 'open', 'close', 'print', 'stop', 'find', 'name', 'status',
  'location', 'history', 'document', 'window', 'navigator', 'screen'];

let conflictFound = false;
for (const id of conflictIds) {
  const pattern = new RegExp(`id=["']${id}["']`, 'i');
  if (pattern.test(html)) {
    fail(`Element id="${id}" conflicts with browser built-in window.${id}`);
    conflictFound = true;
  }
}
if (!conflictFound) pass('No browser built-in naming conflicts in element IDs');

// Check JS uses scrollTo correctly (not as element reference)
const scrollToUsage = [...html.matchAll(/document\.getElementById\(['"]scrollTo['"]\)/g)];
if (scrollToUsage.length > 0) {
  fail(`getElementById('scrollTo') used — element id "scrollTo" conflicts with window.scrollTo()`);
} else {
  pass('scrollTo navigation pattern is safe');
}

// Check anchor-based scroll navigation
const scrollAnchors = [...html.matchAll(/href=["']#([^"']+)["']/gi)].map(m => m[1]);
const definedIds = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(m => m[1]);
let brokenAnchors = 0;
for (const anchor of scrollAnchors) {
  if (!definedIds.includes(anchor)) {
    fail(`Anchor #${anchor} has no matching id="${anchor}" element`);
    brokenAnchors++;
  }
}
if (brokenAnchors === 0 && scrollAnchors.length > 0) pass(`All ${scrollAnchors.length} anchor links have matching IDs`);
if (scrollAnchors.length === 0) warn('No anchor navigation links found');

// ── 5. Mobile responsiveness ─────────────────────────────────────────────────
console.log('\n[5] Mobile responsiveness');

const hasViewport = /meta[^>]+name=["']viewport["'][^>]*content=["'][^"']*width=device-width[^"']*["']/i.test(html);
hasViewport ? pass('viewport meta tag present with width=device-width') : fail('Missing: <meta name="viewport" content="width=device-width, initial-scale=1">');

const hasResponsiveCSS = /(@media[^{]*max-width|@media[^{]*min-width)/i.test(html);
hasResponsiveCSS ? pass('Responsive media queries present') : fail('No responsive @media queries found');

const hasFlexOrGrid = /(display\s*:\s*flex|display\s*:\s*grid)/i.test(html);
hasFlexOrGrid ? pass('Flex/Grid layout used') : warn('No flex/grid layout detected');

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(50));

if (passes.length) { console.log(`\nPassed (${passes.length}):`); passes.forEach(p => console.log(p)); }
if (warnings.length) { console.log(`\nWarnings (${warnings.length}):`); warnings.forEach(w => console.log(w)); }
if (errors.length) { console.log(`\nFailed (${errors.length}):`); errors.forEach(e => console.log(e)); }

console.log(`\nResult: ${errors.length === 0 ? '✓ ALL CHECKS PASS' : `✗ ${errors.length} FAILURE(S)`}`);
process.exit(errors.length > 0 ? 1 : 0);
