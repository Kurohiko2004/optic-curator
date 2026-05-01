/**
 * PTIT-VR Face Geometry Utilities
 * Extracted from FaceDetectPage.jsx
 */

export const TRACKED_IDS = [10, 152, 234, 454, 132, 361, 54, 284, 150, 379];

/**
 * Helper to determine if two values are approximately equal 
 * (within 12% for natural facial variations)
 */
export const isApproxEqual = (a, b) => Math.abs(a - b) / Math.max(a, b) < 0.12;

/**
 * Categorize face shape based on biological proportions and geometric measurements.
 * 
 * @param {number} L - Vertical length from hairline to chin
 * @param {number} Wf - Forehead width
 * @param {number} Wc - Cheekbone width (baseline)
 * @param {number} Wj - Jawline width
 * @param {number} angleLeft - Left jaw angle in degrees
 * @param {number} angleRight - Right jaw angle in degrees
 * @returns {object} { shape, process, ratioL, rf, rj, jawAngle }
 */
export const categorizeFaceShape = (L, Wf, Wc, Wj, angleLeft, angleRight) => {
  if (Wc === 0) return { shape: "Unknown", process: [] };
  
  const ratioL = L / Wc; 
  const rf = Wf / Wc;    
  const rj = Wj / Wc;    
  const jawAngle = (angleLeft + angleRight) / 2;
  const isSharpJaw = jawAngle <= 122; // Relaxed for MediaPipe noise

  let primary = "Oval";
  let process = [];

  // 1. PEAR CHECK (Geometric Absolute)
  if (Wj > Wc && Wj > Wf) {
    primary = "Pear";
    process.push("Jaw is widest point => PEAR");
  } 
  // 2. UNIFORM / ROUND / SQUARE (High Jaw Ratio)
  else if (rj >= 0.835) {
    if (isSharpJaw) {
      primary = "Square";
      process.push(`Wide Jaw (${rj.toFixed(2)}) & Sharp Angle (${jawAngle.toFixed(1)}) => SQUARE`);
    } else {
      primary = "Round";
      process.push(`Wide Jaw (${rj.toFixed(2)}) & Soft Angle (${jawAngle.toFixed(1)}) => ROUND`);
    }
  }
  // 3. HEART CHECK (Narrower Jaw, Wide Forehead)
  else if (rf >= 0.76 && rj < 0.835) {
    primary = "Heart";
    process.push(`Forehead (${rf.toFixed(2)}) > Jaw (${rj.toFixed(2)}) => HEART`);
  }
  // 4. TAPERED (Narrow Jaw, Narrow Forehead)
  else {
    // Distinguish Oval vs Oblong by Length
    if (ratioL >= 1.19) {
      primary = "Oblong";
      process.push(`Narrow face & High Length (${ratioL.toFixed(2)}) => OBLONG`);
    } else if (rf < 0.72 && rj < 0.78) {
      primary = "Diamond";
      process.push("Double tapered => DIAMOND");
    } else {
      primary = "Oval";
      process.push(`Narrow face & Balanced Length (${ratioL.toFixed(2)}) => OVAL`);
    }
  }

  return { shape: primary, process, ratioL, rf, rj, jawAngle };
};
