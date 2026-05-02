/**
 * PTIT-VR Face Shape Hyper-Parameter Sweep (Data-Driven)
 * =========================================================
 * Automatically computes centroids and ranges from your measurements.json,
 * then sweeps weights and signature thresholds to find best config per shape.
 *
 * Usage: node sweep.mjs
 */

import fs from 'fs';
import path from 'path';

// ── Load Data ────────────────────────────────────────────────────────────────
const dataPath = path.join(process.cwd(), 'measurements.json');
if (!fs.existsSync(dataPath)) {
  console.error('ERROR: measurements.json not found.');
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const dataset = raw.filter(r => r.ratioL > 0 && r.rf > 0 && r.rj > 0 && r.jawAngle > 0);

const SHAPES = ['heart', 'oblong', 'oval', 'round', 'square'];
console.log(`Loaded ${dataset.length} valid measurements.\n`);

// ── Step 1: Compute per-shape averages (centroids) from data ─────────────────
const sums = {};
const counts = {};
SHAPES.forEach(s => {
  sums[s]   = { ratioL: 0, rf: 0, rj: 0, rjf: 0, angle: 0 };
  counts[s] = 0;
});

for (const m of dataset) {
  const s = m.expected;
  if (!sums[s]) continue;
  sums[s].ratioL += m.ratioL;
  sums[s].rf     += m.rf;
  sums[s].rj     += m.rj;
  sums[s].rjf    += (m.rjf || m.rj / m.rf);
  sums[s].angle  += m.jawAngle;
  counts[s]++;
}

const CENTROIDS = {};
console.log('── Computed Centroids from Data ──────────────────────────');
for (const s of SHAPES) {
  const n = counts[s];
  CENTROIDS[s] = {
    ratioL: sums[s].ratioL / n,
    rf:     sums[s].rf     / n,
    rj:     sums[s].rj     / n,
    rjf:    sums[s].rjf    / n,
    angle:  sums[s].angle  / n,
  };
  console.log(`  ${s.padEnd(8)}: L=${CENTROIDS[s].ratioL.toFixed(3)} rf=${CENTROIDS[s].rf.toFixed(3)} rj=${CENTROIDS[s].rj.toFixed(3)} rjf=${CENTROIDS[s].rjf.toFixed(3)} ang=${CENTROIDS[s].angle.toFixed(1)}°  (n=${n})`);
}

// ── Step 2: Compute global ranges from data (5th-95th percentile) ────────────
const allVals = { ratioL: [], rf: [], rj: [], angle: [] };
for (const m of dataset) {
  allVals.ratioL.push(m.ratioL);
  allVals.rf.push(m.rf);
  allVals.rj.push(m.rj);
  allVals.angle.push(m.jawAngle);
}
const pct = (arr, p) => { const s = [...arr].sort((a,b)=>a-b); return s[Math.floor(s.length * p / 100)]; };
const RANGES = {
  ratioL: { min: pct(allVals.ratioL,  2), max: pct(allVals.ratioL, 98) },
  rf:     { min: pct(allVals.rf,       2), max: pct(allVals.rf,    98) },
  rj:     { min: pct(allVals.rj,       2), max: pct(allVals.rj,    98) },
  angle:  { min: pct(allVals.angle,    2), max: pct(allVals.angle, 98) },
};

console.log('\n── Data Ranges (2nd–98th percentile) ────────────────────');
for (const [k, r] of Object.entries(RANGES)) {
  console.log(`  ${k.padEnd(8)}: ${r.min.toFixed(3)} → ${r.max.toFixed(3)}`);
}

const norm = (val, r) => Math.max(0, Math.min(1, (val - r.min) / (r.max - r.min)));

// Precompute normalized centroids once
const NORM_CENTROIDS = {};
for (const [s, c] of Object.entries(CENTROIDS)) {
  NORM_CENTROIDS[s] = {
    ratioL: norm(c.ratioL, RANGES.ratioL),
    rf:     norm(c.rf,     RANGES.rf),
    rj:     norm(c.rj,     RANGES.rj),
    rjf:    c.rjf,
    angle:  norm(c.angle,  RANGES.angle),
  };
}

// Precompute normalized measurements
const normDataset = dataset.map(m => ({
  expected: m.expected,
  ratioL:   norm(m.ratioL,   RANGES.ratioL),
  rf:       norm(m.rf,       RANGES.rf),
  rj:       norm(m.rj,       RANGES.rj),
  rjf:      m.rjf || m.rj / m.rf,
  angle:    norm(m.jawAngle, RANGES.angle),
  // raw for thresholds
  rawRf:    m.rf,
  rawRj:    m.rj,
  rawRjf:   m.rjf || m.rj / m.rf,
  rawL:     m.ratioL,
}));

// ── Step 3: Sweep ────────────────────────────────────────────────────────────
const W_RATIOL  = [2, 4, 6, 8, 10];
const W_RF      = [4, 6, 8, 10];
const W_RJ      = [2, 4, 6];
const W_RJF     = [2, 4, 6];
const W_ANGLE   = [1, 2, 3];

// Compute sensible threshold ranges from data
const heartRjAvg = CENTROIDS.heart.rj;
const narrowRfAvg = (CENTROIDS.oval.rf + CENTROIDS.oblong.rf) / 2;
const narrowRjAvg = (CENTROIDS.oval.rj + CENTROIDS.oblong.rj) / 2;
const oblongL = CENTROIDS.oblong.ratioL;
const ovalL   = CENTROIDS.oval.ratioL;

const HEART_THS = [heartRjAvg - 0.03, heartRjAvg, heartRjAvg + 0.02, heartRjAvg + 0.05].map(v => +v.toFixed(3));
const NRW_RF    = [narrowRfAvg - 0.03, narrowRfAvg, narrowRfAvg + 0.03, narrowRfAvg + 0.06].map(v => +v.toFixed(3));
const NRW_RJ    = [narrowRjAvg - 0.03, narrowRjAvg, narrowRjAvg + 0.03, narrowRjAvg + 0.06].map(v => +v.toFixed(3));
const L_SPLIT   = [ovalL + (oblongL - ovalL) * 0.25, ovalL + (oblongL - ovalL) * 0.5, ovalL + (oblongL - ovalL) * 0.75].map(v => +v.toFixed(4));

const HEART_RJF_THS = [1.06, 1.076, 1.09, 1.10];

console.log('\n── Threshold search ranges ───────────────────────────────');
console.log('  heartRjTh:', HEART_THS);
console.log('  narrowRfTh:', NRW_RF);
console.log('  narrowRjTh:', NRW_RJ);
console.log('  lengthSplit:', L_SPLIT);
console.log('  heartRjfTh:', HEART_RJF_THS);

const totalCombos = W_RATIOL.length * W_RF.length * W_RJ.length * W_RJF.length *
  W_ANGLE.length * HEART_THS.length * NRW_RF.length * NRW_RJ.length *
  L_SPLIT.length * HEART_RJF_THS.length;

console.log(`\nTesting ${totalCombos.toLocaleString()} combinations on ${normDataset.length} faces...\n`);

const bestPerShape = {};
SHAPES.forEach(s => bestPerShape[s] = { acc: 0, config: null });
let bestOverall = { acc: -1, config: null, breakdown: null };

let done = 0;
const reportEvery = Math.max(1, Math.floor(totalCombos / 40));

for (const wL    of W_RATIOL)
for (const wRf   of W_RF)
for (const wRj   of W_RJ)
for (const wRjf  of W_RJF)
for (const wA    of W_ANGLE)
for (const hRjTh of HEART_THS)
for (const hRjfTh of HEART_RJF_THS)
for (const nRf   of NRW_RF)
for (const nRj   of NRW_RJ)
for (const ls    of L_SPLIT) {

  const correct = { heart: 0, oblong: 0, oval: 0, round: 0, square: 0 };
  const total   = { heart: 0, oblong: 0, oval: 0, round: 0, square: 0 };

  for (const m of normDataset) {
    if (!total[m.expected] !== undefined) {
      if (total[m.expected] === undefined) continue;
    }
    total[m.expected]++;

    // Score each shape
    const scores = {};
    for (const [s, nc] of Object.entries(NORM_CENTROIDS)) {
      scores[s] = Math.sqrt(
        wL   * (m.ratioL - nc.ratioL) ** 2 +
        wRf  * (m.rf     - nc.rf)     ** 2 +
        wRj  * (m.rj     - nc.rj)     ** 2 +
        wRjf * (m.rjf    - nc.rjf)    ** 2 +
        wA   * (m.angle  - nc.angle)  ** 2
      );
    }

    // Bonuses
    if (m.rawRjf < hRjfTh && m.rawRj > hRjTh) scores.heart  /= 10;
    if (m.rawRf  < nRf    && m.rawRj < nRj)    { scores.oval /= 10; scores.oblong /= 10; }

    const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    let winner = sorted[0][0];

    // Narrow tiebreaker
    if (m.rawRf < nRf && m.rawRj < nRj) {
      winner = m.rawL > ls ? 'oblong' : 'oval';
    }

    if (winner === m.expected) correct[m.expected]++;
  }

  const totalAll   = SHAPES.reduce((s, k) => s + (total[k]   || 0), 0);
  const correctAll = SHAPES.reduce((s, k) => s + (correct[k] || 0), 0);
  const overallAcc = totalAll > 0 ? correctAll / totalAll : 0;

  // Track per-shape bests
  for (const s of SHAPES) {
    if (total[s] === 0) continue;
    const acc = correct[s] / total[s];
    if (acc > bestPerShape[s].acc) {
      bestPerShape[s] = { acc, config: { wL, wRf, wRj, wRjf, wA, hRjTh, hRjfTh, nRf, nRj, ls } };
    }
  }

  if (overallAcc > bestOverall.acc) {
    bestOverall = {
      acc: overallAcc,
      config: { wL, wRf, wRj, wRjf, wA, hRjTh, hRjfTh, nRf, nRj, ls },
      breakdown: Object.fromEntries(SHAPES.map(s => [
        s, total[s] ? `${correct[s]}/${total[s]} (${(correct[s]/total[s]*100).toFixed(1)}%)` : 'n/a'
      ]))
    };
  }

  done++;
  if (done % reportEvery === 0) {
    process.stdout.write(`  ${Math.round(done/totalCombos*100)}% done | Best overall: ${(bestOverall.acc*100).toFixed(1)}%\r`);
  }
}

// ── Output ────────────────────────────────────────────────────────────────────
console.log('\n\n════════════════════════════════════════════════════════════');
console.log('  SWEEP RESULTS');
console.log('════════════════════════════════════════════════════════════\n');

const c = bestOverall.config;
console.log(`BEST OVERALL: ${(bestOverall.acc*100).toFixed(1)}% accuracy`);
console.log(`  Weights:  ratioL=${c.wL}  rf=${c.wRf}  rj=${c.wRj}  rjf=${c.wRjf}  angle=${c.wA}`);
console.log(`  Heart:    rjf < ${c.hRjfTh}  AND  rj > ${c.hRjTh}`);
console.log(`  Narrow:   rf < ${c.nRf}  AND  rj < ${c.nRj}`);
console.log(`  Split:    ratioL > ${c.ls} → Oblong, else Oval`);
console.log(`  Breakdown:`, bestOverall.breakdown);

console.log('\n── Best Config Per Shape ────────────────────────────────────');
for (const s of SHAPES) {
  const b = bestPerShape[s];
  const bc = b.config;
  if (!bc) { console.log(`  ${s.toUpperCase()}: no data`); continue; }
  console.log(`\n  ${s.toUpperCase().padEnd(8)} → ${(b.acc*100).toFixed(1)}%`);
  console.log(`    Weights: L=${bc.wL} rf=${bc.wRf} rj=${bc.wRj} rjf=${bc.wRjf} angle=${bc.wA}`);
  console.log(`    Heart: rjf<${bc.hRjfTh} & rj>${bc.hRjTh}  |  Narrow: rf<${bc.nRf} & rj<${bc.nRj}  |  Split: ${bc.ls}`);
}

// Save
const output = {
  meta: { dataset_size: dataset.length, valid: normDataset.length },
  computed_centroids: CENTROIDS,
  computed_ranges: RANGES,
  bestOverall,
  bestPerShape
};
fs.writeFileSync(path.join(process.cwd(), 'best_params.json'), JSON.stringify(output, null, 2));
console.log('\n✅ Full results saved to best_params.json');
