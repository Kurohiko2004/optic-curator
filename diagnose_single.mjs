/**
 * Single-image diagnostic: compare browser vs Colab geometry for oval (2).jpg
 * 
 * Since we can't run MediaPipe in Node.js easily, this script:
 * 1. Reads the exported measurements.json (which has ratioL, rf, rj, angle)
 * 2. Shows the per-shape averages so you can compare with Colab centroids
 * 3. Flags the exact mismatch between the two systems
 *
 * Usage: node diagnose_single.mjs
 */

import fs from 'fs';

const data = JSON.parse(fs.readFileSync('measurements.json', 'utf-8'));
const SHAPES = ['heart', 'oblong', 'oval', 'round', 'square'];

// Colab centroids from stress test
const COLAB = {
  heart:  { ratioL: 1.183, rf: 0.859, rj: 0.931, angle: 97.3  },
  oblong: { ratioL: 1.260, rf: 0.846, rj: 0.938, angle: 93.6  },
  oval:   { ratioL: 1.184, rf: 0.850, rj: 0.932, angle: 99.6  },
  round:  { ratioL: 1.137, rf: 0.841, rj: 0.938, angle: 105.0 },
  square: { ratioL: 1.150, rf: 0.839, rj: 0.951, angle: 107.5 },
};

console.log('\n════════════════════════════════════════════════════════');
console.log('  BROWSER vs COLAB — FEATURE AVERAGES PER SHAPE');
console.log('════════════════════════════════════════════════════════\n');
console.log('Shape     Feature    Browser-Avg   Colab-Centroid   Ratio(B/C)');
console.log('─────────────────────────────────────────────────────────────');

for (const s of SHAPES) {
  const rows = data.filter(r => r.expected === s && r.ratioL > 0);
  if (rows.length === 0) { console.log(`${s}: no data`); continue; }

  const avg = (key) => rows.reduce((a, r) => a + (r[key] || 0), 0) / rows.length;
  const avgL  = avg('ratioL');
  const avgRf = avg('rf');
  const avgRj = avg('rj');
  const avgA  = avg('jawAngle');

  const c = COLAB[s];
  const fmt = (b, c) => `${b.toFixed(4).padStart(10)}   ${c.toFixed(4).padStart(14)}   ${(b/c).toFixed(3).padStart(9)}`;

  console.log(`\n${s.toUpperCase().padEnd(10)}(n=${rows.length})`);
  console.log(`  ratioL:  ${fmt(avgL,  c.ratioL)}`);
  console.log(`  rf:      ${fmt(avgRf, c.rf)}`);
  console.log(`  rj:      ${fmt(avgRj, c.rj)}`);
  console.log(`  angle:   ${fmt(avgA,  c.angle)}`);
}

console.log('\n════════════════════════════════════════════════════════');
console.log('  RATIO INTERPRETATION');
console.log('  Ratio=1.0 → perfect match, >1.0 → browser higher');
console.log('════════════════════════════════════════════════════════\n');

// Check if the measurements.json has valid angle values
const sampleAngles = data.slice(0, 5).map(r => r.jawAngle);
console.log('Sample jawAngle values from first 5 entries:', sampleAngles.map(a => a?.toFixed(2)));
console.log('(Expected ~93-107° if chin-apex formula is working correctly)');
