/**
 * Diagnostic: Shows per-feature separation between shape types
 * Run: node diagnose.mjs
 */
import fs from 'fs';

const dataset = JSON.parse(fs.readFileSync('measurements.json', 'utf-8'))
  .filter(r => r.ratioL > 0 && r.rf > 0 && r.rj > 0);

const SHAPES = ['heart', 'oblong', 'oval', 'round', 'square'];
const FEATURES = ['ratioL', 'rf', 'rj', 'rjf', 'jawAngle'];

// Per-shape stats
const stats = {};
for (const s of SHAPES) {
  const rows = dataset.filter(r => r.expected === s);
  stats[s] = {};
  for (const f of FEATURES) {
    const vals = rows.map(r => r[f] || (f === 'rjf' ? r.rj/r.rf : 0)).filter(v => v > 0);
    const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
    const std  = Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length);
    const min  = Math.min(...vals);
    const max  = Math.max(...vals);
    stats[s][f] = { mean, std, min, max, n: vals.length };
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  FEATURE SEPARATION ANALYSIS');
console.log('  Higher std = more spread = more discriminating');
console.log('═══════════════════════════════════════════════════════════════\n');

for (const f of FEATURES) {
  const means = SHAPES.map(s => stats[s][f].mean);
  const spread = Math.max(...means) - Math.min(...means);
  const avgStd = SHAPES.reduce((a,s) => a + stats[s][f].std, 0) / SHAPES.length;
  const separability = spread / avgStd; // signal-to-noise ratio

  console.log(`── ${f.padEnd(10)} (separability score: ${separability.toFixed(2)}) ──`);
  for (const s of SHAPES) {
    const st = stats[s][f];
    const bar = '█'.repeat(Math.round(st.mean * 20));
    console.log(`  ${s.padEnd(8)}: mean=${st.mean.toFixed(4)}  std=${st.std.toFixed(4)}  range=[${st.min.toFixed(3)}, ${st.max.toFixed(3)}]`);
  }
  console.log(`  → Between-shape range: ${spread.toFixed(4)}  AvgStd: ${avgStd.toFixed(4)}\n`);
}

// Summary ranking
console.log('══ FEATURE RANKING BY DISCRIMINATING POWER ══════════════════');
const ranked = FEATURES.map(f => {
  const means = SHAPES.map(s => stats[s][f].mean);
  const spread = Math.max(...means) - Math.min(...means);
  const avgStd = SHAPES.reduce((a,s) => a + stats[s][f].std, 0) / SHAPES.length;
  return { f, score: spread / avgStd };
}).sort((a, b) => b.score - a.score);

ranked.forEach((r, i) => {
  console.log(`  ${i+1}. ${r.f.padEnd(12)}: ${r.score.toFixed(3)} ${r.score > 0.5 ? '✓ USEFUL' : '✗ TOO SIMILAR'}`);
});

console.log('\n══ RECOMMENDATION ════════════════════════════════════════════');
const useful = ranked.filter(r => r.score > 0.5).map(r => r.f);
const useless = ranked.filter(r => r.score <= 0.5).map(r => r.f);
if (useful.length > 0) {
  console.log(`  ✓ Keep: ${useful.join(', ')}`);
}
if (useless.length > 0) {
  console.log(`  ✗ Problematic (shapes too similar): ${useless.join(', ')}`);
  console.log(`  → Consider changing landmarks for these measurements.`);
}
