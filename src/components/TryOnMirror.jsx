import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Bookmark, Check, Camera, X, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import TryOnHistory from "./TryOnHistory";
import TryOnShareSheet from "./TryOnShareSheet";

const MONK_SCALE = [
  "#f6ede4","#f3e7db","#f7ead0","#eadaba","#d7bd96",
  "#a07850","#825c43","#604134","#3a312a","#292420",
];

const SHADES = {
  lips: [
    { name: "Pillow Talk",  hex: "#C97B6A" },
    { name: "Velvet Teddy", hex: "#B5755A" },
    { name: "Ruby Woo",     hex: "#C8102E" },
    { name: "Rouge Noir",   hex: "#7B2D3A" },
    { name: "Mehr",         hex: "#A85C6E" },
    { name: "Heroine",      hex: "#6B2B5C" },
    { name: "Honey Love",   hex: "#C9A07A" },
    { name: "Night Moth",   hex: "#3D1A24" },
    { name: "Twig",         hex: "#9B6B5A" },
    { name: "Whirl",        hex: "#A0685A" },
  ],
  gloss: [
    { name: "Crystal",      hex: "#FFFFFF" },
    { name: "Ballet",       hex: "#FFD0D8" },
    { name: "Peachy",       hex: "#FFD0B0" },
    { name: "Berry Shine",  hex: "#D47090" },
    { name: "Gold Honey",   hex: "#FFD870" },
    { name: "Rose Glaze",   hex: "#E8A0B0" },
  ],
  liner: [
    { name: "Noir",         hex: "#0A0A0A" },
    { name: "Brown Ink",    hex: "#3A1E0A" },
    { name: "Smoke",        hex: "#2A2A3A" },
    { name: "Forest",       hex: "#1A2A1A" },
    { name: "Plum",         hex: "#3A0A3A" },
    { name: "Mahogany",     hex: "#4A1A10" },
  ],
  eyes: [
    { name: "Champagne",  hex: "#D4B886" },
    { name: "Bronze",     hex: "#8B6F47" },
    { name: "Taupe",      hex: "#8B7D6B" },
    { name: "Forest",     hex: "#2C4A3B" },
    { name: "Gold",       hex: "#C9A961" },
    { name: "Rose Gold",  hex: "#C08A82" },
    { name: "Mauve",      hex: "#9B7B8A" },
    { name: "Obsidian",   hex: "#1A1A2E" },
    { name: "Copper",     hex: "#B87333" },
    { name: "Mulberry",   hex: "#7B2D5C" },
  ],
  mascara: [
    { name: "Noir",         hex: "#0A0A0A" },
    { name: "Brown",        hex: "#2C1810" },
    { name: "Navy Night",   hex: "#0A0A1E" },
    { name: "Forest Black", hex: "#0A140A" },
  ],
  face: [
    { name: "Peach",          hex: "#F4A460" },
    { name: "Berry",          hex: "#C2548A" },
    { name: "Coral",          hex: "#E8735A" },
    { name: "Rose",           hex: "#D4829A" },
    { name: "Bronzer",        hex: "#8B6B4A" },
    { name: "Sun Kiss",       hex: "#C4883A" },
    { name: "Highlight",      hex: "#FFE4B5" },
    { name: "Glow",           hex: "#D4AF78" },
    { name: "Freckles",       hex: "#9B6040", type: "freckles" },
    { name: "Sun Freckles",   hex: "#B06528", type: "freckles" },
    { name: "Faint Freckles", hex: "#C8976A", type: "freckles" },
  ],
  lenses: [
    { name: "Icy Blue",   hex: "#5EB8E8" },
    { name: "Sea Green",  hex: "#3DAA9A" },
    { name: "Hazel",      hex: "#9B7220" },
    { name: "Amber",      hex: "#D48800" },
    { name: "Violet",     hex: "#8855B8" },
    { name: "Pearl Grey", hex: "#9BB0BA" },
    { name: "Aqua",       hex: "#18A89A" },
    { name: "Honey",      hex: "#CC9030" },
  ],
  hair: [
    { name: "Raven",      hex: "#1A1212" },
    { name: "Chestnut",   hex: "#6E3B1E" },
    { name: "Auburn",     hex: "#922B1A" },
    { name: "Copper",     hex: "#C26030" },
    { name: "Golden",     hex: "#C8A844" },
    { name: "Strawberry", hex: "#CC4840" },
    { name: "Platinum",   hex: "#E8DEC8" },
    { name: "Ash Brown",  hex: "#7A7060" },
  ],
};

// ── Landmark groups ──────────────────────────────────────────────────────────
const LIP_OUTER  = [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146];

// Two-surface lip shapes — upper + lower fill separately (no teeth bleed-through)
const LIP_UPPER_OUT = [61,185,40,39,37,0,267,269,270,409,291];
const LIP_UPPER_IN  = [78,191,80,81,82,13,312,311,310,415,308];
const LIP_LOWER_OUT = [291,375,321,405,314,17,84,181,91,146,61];
const LIP_LOWER_IN  = [308,324,318,402,317,14,87,178,88,95,78];

const L_IRIS_C = 468, L_IRIS_B = [469,470,471,472];
const R_IRIS_C = 473, R_IRIS_B = [474,475,476,477];
const R_LOWER   = [7,163,144,145,153,154,155];
const L_LOWER   = [249,390,373,374,380,381,382];
const R_UPPER   = [33,246,161,160,159,158,157,173,133];
const L_UPPER   = [263,466,388,387,386,385,384,398,362];
const HAIR_BOUNDARY = [454,356,389,251,284,332,297,338,10,109,67,103,54,21,162,127,234];

const sr = (n) => { const x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };

function objCover(W, H, vW, vH) {
  if (vW / vH > W / H) {
    const scale = H / vH;
    return { scale, ox: (W - vW * scale) / 2, oy: 0 };
  }
  const scale = W / vW;
  return { scale, ox: 0, oy: (H - vH * scale) / 2 };
}

function paintCategory(canvas, category, shade, landmarks, intensity, isMirrored, videoW, videoH) {
  if (!canvas || !shade || !landmarks?.length) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const vW = videoW > 0 ? videoW : W;
  const vH = videoH > 0 ? videoH : H;
  const { scale, ox, oy } = objCover(W, H, vW, vH);

  const pt = (i) => {
    const rx = landmarks[i].x * vW * scale + ox;
    const ry = landmarks[i].y * vH * scale + oy;
    return { x: isMirrored ? W - rx : rx, y: ry };
  };

  const alpha = intensity / 100;

  if (category === "lips") {
    // ── Mouth-open guard ────────────────────────────────────────────────
    // When the jaw drops, the inner-boundary fill inverts into a ring around the opening.
    // Skip rendering entirely until the mouth closes (< 38% of outer lip height).
    const mouthGap = Math.hypot(pt(13).x - pt(14).x, pt(13).y - pt(14).y);
    const lipHt    = Math.max(Math.hypot(pt(0).x - pt(17).x, pt(0).y - pt(17).y), 1);
    if (mouthGap / lipHt > 0.38) return;
    // ── Normal-blend canvas for lips ─────────────────────────────────────
    // Overline: push each outer boundary point outward from the lip centroid.
    // Feathering: two-pass draw — blurred halo first, then main fill.
    const lipAllPts = [...LIP_UPPER_OUT, ...LIP_LOWER_OUT].map(i => pt(i));
    const lipCx = lipAllPts.reduce((s,p) => s+p.x, 0) / lipAllPts.length;
    const lipCy = lipAllPts.reduce((s,p) => s+p.y, 0) / lipAllPts.length;
    const faceW = Math.abs(pt(454).x - pt(234).x);
    const overAmt = faceW * 0.013; // overline expansion ~1.3% of face width

    // Expand outer landmark away from centroid (for overline + symmetry correction)
    const expPt = (idx) => {
      const { x, y } = pt(idx);
      const dx = x - lipCx, dy = y - lipCy;
      const len = Math.hypot(dx, dy) || 1;
      return { x: x + (dx/len) * overAmt, y: y + (dy/len) * overAmt };
    };

    // Draw one lip surface: outer (overlined) edge → inner edge (reversed) → close
    const drawSurface = (outerIdxs, innerIdxs) => {
      ctx.beginPath();
      outerIdxs.forEach((idx, i) => {
        const { x, y } = expPt(idx);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      [...innerIdxs].reverse().forEach(idx => {
        const { x, y } = pt(idx); // inner stays tight — keeps teeth clear
        ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
    };

    ctx.fillStyle = shade.hex;

    // Pass 1 — feathered halo: wide blur softens the edge into skin
    ctx.filter    = "blur(5px)";
    ctx.globalAlpha = alpha * 0.50;
    drawSurface(LIP_UPPER_OUT, LIP_UPPER_IN);
    drawSurface(LIP_LOWER_OUT, LIP_LOWER_IN);

    // Pass 2 — main fill: tight blur keeps crisp centre, soft outer edge
    ctx.filter    = "blur(1.2px)";
    ctx.globalAlpha = alpha * 0.92;
    drawSurface(LIP_UPPER_OUT, LIP_UPPER_IN);
    drawSurface(LIP_LOWER_OUT, LIP_LOWER_IN);

    // Pass 3 — SSS rim: warm light scatters through the lip boundary (subsurface scattering approximation)
    // Shifts color toward a warmer, slightly lighter version at the edges to simulate translucent skin
    const sssR = parseInt(shade.hex.slice(1,3),16);
    const sssG = parseInt(shade.hex.slice(3,5),16);
    const sssB = parseInt(shade.hex.slice(5,7),16);
    ctx.filter = "blur(5px)";
    ctx.globalAlpha = alpha * 0.20;
    ctx.fillStyle = `rgb(${Math.min(255,sssR+50)},${Math.min(255,sssG+15)},${Math.min(255,sssB+8)})`;
    drawSurface(LIP_UPPER_OUT, LIP_UPPER_IN);
    drawSurface(LIP_LOWER_OUT, LIP_LOWER_IN);

    ctx.filter = "none"; ctx.globalAlpha = 1;

  } else if (category === "gloss") {
    // Mouth-open guard: same threshold prevents gloss bleeding on open mouth
    const mouthGapG = Math.hypot(pt(13).x - pt(14).x, pt(13).y - pt(14).y);
    const lipHtG    = Math.max(Math.hypot(pt(0).x - pt(17).x, pt(0).y - pt(17).y), 1);
    if (mouthGapG / lipHtG > 0.38) return;
    // ── Screen-blend canvas for gloss ───────────────────────────────────
    // Three specular points along the lower lip curvature — not a single centred dot.
    // Base wet sheen is subtle; the curved highlight array creates realistic depth.
    const allLipPts = LIP_OUTER.map(i => pt(i));
    const lipCx  = allLipPts.reduce((s,p) => s+p.x, 0) / allLipPts.length;
    const lipTop = Math.min(...allLipPts.map(p => p.y));
    const lipBot = Math.max(...allLipPts.map(p => p.y));
    const lipH   = lipBot - lipTop;
    const lipL   = Math.min(...allLipPts.map(p => p.x));
    const lipR   = Math.max(...allLipPts.map(p => p.x));
    const lipW   = lipR - lipL;
    const r = parseInt(shade.hex.slice(1,3), 16);
    const g = parseInt(shade.hex.slice(3,5), 16);
    const b = parseInt(shade.hex.slice(5,7), 16);

    ctx.save();

    // Clip to both lip surfaces so gloss never bleeds onto teeth
    ctx.beginPath();
    LIP_UPPER_OUT.forEach((idx,i) => { const {x,y}=pt(idx); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
    [...LIP_UPPER_IN].reverse().forEach(idx => { const {x,y}=pt(idx); ctx.lineTo(x,y); });
    ctx.closePath();
    const {x:lx0, y:ly0} = pt(LIP_LOWER_OUT[0]);
    ctx.moveTo(lx0, ly0);
    LIP_LOWER_OUT.slice(1).forEach(idx => { const {x,y}=pt(idx); ctx.lineTo(x,y); });
    [...LIP_LOWER_IN].reverse().forEach(idx => { const {x,y}=pt(idx); ctx.lineTo(x,y); });
    ctx.closePath();
    ctx.clip();

    // Base wet sheen — very diffuse, colour-tinted
    ctx.filter = "blur(2px)";
    const gy = lipTop + lipH * 0.44;
    const baseGrad = ctx.createRadialGradient(lipCx, gy, lipW*0.01, lipCx, gy, lipW*0.28);
    baseGrad.addColorStop(0,    `rgba(255,255,255,${alpha * 0.35})`);
    baseGrad.addColorStop(0.55, `rgba(${r},${g},${b},${alpha * 0.12})`);
    baseGrad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = baseGrad; ctx.globalAlpha = 1;
    ctx.fillRect(lipL-4, lipTop-4, lipW+8, lipH+8);

    // Three curved specular reflections following the lower lip surface
    // Landmark 405 = lower-left, 17 = centre-bottom, 181 = lower-right
    const specPts  = [pt(405), pt(17), pt(181)];
    const specBri  = [0.50, 0.82, 0.50]; // centre brightest, taper to sides
    // Canvas2D specular is now the soft diffuse base — WebGL adds the crisp Blinn-Phong highlight
    ctx.filter = "blur(5px)";
    specPts.forEach((sp, i) => {
      const sg = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, lipW * 0.090);
      sg.addColorStop(0,    `rgba(255,255,255,${alpha * 0.28 * specBri[i]})`);
      sg.addColorStop(0.48, `rgba(255,255,255,${alpha * 0.05 * specBri[i]})`)
      sg.addColorStop(1,    `rgba(255,255,255,0)`);
      ctx.fillStyle = sg;
      ctx.fillRect(lipL-4, lipTop-4, lipW+8, lipH+8);
    });
    ctx.filter = "none";

    ctx.restore();

  } else if (category === "liner") {
    const faceW = Math.abs(pt(454).x - pt(234).x);
    ctx.strokeStyle = shade.hex;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    const drawEyeLiner = (lmIdxs, outerIdx, innerIdx, lowerIdxs) => {
      // Pass 1 — feather halo: wide soft bloom integrates liner into skin naturally
      ctx.lineWidth = 4.5;
      ctx.globalAlpha = alpha * 0.22;
      ctx.filter = "blur(3.5px)";
      ctx.beginPath();
      lmIdxs.forEach((idx,i) => { const {x,y}=pt(idx); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.stroke();
      // Pass 2 — crisp main line, slightly tapered from inner to outer corner
      ctx.lineWidth = 2.0;
      ctx.globalAlpha = alpha * 0.84;
      ctx.filter = "blur(0.5px)";
      ctx.beginPath();
      lmIdxs.forEach((idx,i) => { const {x,y}=pt(idx); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.stroke();
      // Pass 3 — inner corner taper: subtle thickening at the lash root
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = alpha * 0.38;
      ctx.filter = "blur(0.8px)";
      ctx.beginPath();
      lmIdxs.slice(0, 3).forEach((idx,i) => { const {x,y}=pt(idx); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
      ctx.stroke();
      // Wing — extrapolates the lash-line angle with a slight upward lift
      const outer = pt(outerIdx), inner = pt(innerIdx);
      const dx = outer.x - inner.x, dy = outer.y - inner.y;
      const len = Math.hypot(dx, dy) || 1;
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = alpha * 0.72;
      ctx.filter = "blur(1px)";
      ctx.beginPath();
      ctx.moveTo(outer.x, outer.y);
      ctx.lineTo(outer.x + (dx/len)*faceW*0.058, outer.y + (dy/len)*faceW*0.016 - faceW*0.034);
      ctx.stroke();
      // Lower waterline — outer 62% of lower lash at medium+ intensity
      if (alpha > 0.52 && lowerIdxs && lowerIdxs.length > 1) {
        const half = Math.ceil(lowerIdxs.length * 0.62);
        ctx.lineWidth = 1.1;
        ctx.globalAlpha = alpha * 0.30;
        ctx.filter = "blur(1.8px)";
        ctx.beginPath();
        lowerIdxs.slice(0, half).forEach((idx,i) => { const {x,y}=pt(idx); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); });
        ctx.stroke();
      }
    };
    drawEyeLiner(R_UPPER, 33, 133, R_LOWER);
    drawEyeLiner(L_UPPER, 263, 362, L_LOWER);

    ctx.filter = "none"; ctx.globalAlpha = 1;

  } else if (category === "eyes") {
    // Soft-light canvas — sheer gradient shadow, no opaque block
    const er = parseInt(shade.hex.slice(1,3), 16);
    const eg = parseInt(shade.hex.slice(3,5), 16);
    const eb = parseInt(shade.hex.slice(5,7), 16);

    const paintLidShadow = (outerIdx, innerIdx) => {
      const o = pt(outerIdx), n = pt(innerIdx);
      const cx = (o.x + n.x) / 2;
      const ew = Math.abs(o.x - n.x) * 1.32;
      const eh = ew * 0.58;
      const cy = (o.y + n.y) / 2 - eh * 0.28;

      const grad = ctx.createRadialGradient(
        cx, cy + eh*0.12, ew*0.04,
        cx, cy - eh*0.18, ew*0.68
      );
      grad.addColorStop(0,    `rgba(${er},${eg},${eb},${alpha * 0.72})`);
      grad.addColorStop(0.42, `rgba(${er},${eg},${eb},${alpha * 0.28})`);
      grad.addColorStop(1,    `rgba(${er},${eg},${eb},0)`);

      ctx.save();
      ctx.filter = `blur(${Math.max(5, Math.round(ew * 0.14))}px)`;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, ew/2, eh/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    };

    const paintCornerSmudge = (cornerIdx, outerIdx, innerIdx) => {
      const c  = pt(cornerIdx);
      const ew = Math.abs(pt(outerIdx).x - pt(innerIdx).x);
      const smGrad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, ew*0.30);
      smGrad.addColorStop(0,   `rgba(${er},${eg},${eb},${alpha * 0.48})`);
      smGrad.addColorStop(1,   `rgba(${er},${eg},${eb},0)`);
      ctx.save();
      ctx.filter = `blur(${Math.max(3, Math.round(ew * 0.09))}px)`;
      ctx.fillStyle = smGrad;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, ew*0.30, ew*0.18, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    };

    paintLidShadow(33, 133);
    paintLidShadow(263, 362);
    paintCornerSmudge(33, 33, 133);
    paintCornerSmudge(263, 263, 362);

  } else if (category === "mascara") {
    const drawLash = (lmIdxs) => {
      for (let pass = 0; pass < 3; pass++) {
        ctx.lineWidth = 2.5 + pass * 1.8;
        ctx.globalAlpha = alpha * (0.88 - pass * 0.22);
        ctx.beginPath();
        lmIdxs.forEach((idx,i) => {
          const {x,y} = pt(idx);
          const yOff = pass * 1.2;
          i === 0 ? ctx.moveTo(x, y-yOff) : ctx.lineTo(x, y-yOff);
        });
        ctx.stroke();
      }
    };
    ctx.strokeStyle = shade.hex;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.filter = "blur(1.2px)";
    drawLash(R_UPPER); drawLash(L_UPPER);
    ctx.filter = "none"; ctx.globalAlpha = 1;

  } else if (category === "face") {
    if (shade.type === "freckles") {
      const noseBridge = pt(6), noseTip = pt(4), lCheek = pt(116), rCheek = pt(345);
      const faceW = Math.abs(pt(454).x - pt(234).x), bw = faceW * 0.22;
      ctx.fillStyle = shade.hex;
      const zones = [
        { cx:(noseBridge.x+noseTip.x)/2, cy:(noseBridge.y*0.4+noseTip.y*0.6), rx:bw*0.95, ry:bw*0.55, n:35 },
        { cx:lCheek.x, cy:lCheek.y, rx:bw*0.72, ry:bw*0.48, n:22 },
        { cx:rCheek.x, cy:rCheek.y, rx:bw*0.72, ry:bw*0.48, n:22 },
      ];
      zones.forEach(({ cx, cy, rx, ry, n }, zi) => {
        for (let i = 0; i < n; i++) {
          const seed = zi*200+i, angle = sr(seed)*Math.PI*2, rad = Math.sqrt(sr(seed+0.37));
          const fx = cx+rx*rad*Math.cos(angle), fy = cy+ry*rad*Math.sin(angle);
          ctx.globalAlpha = alpha*(0.18+sr(seed+0.53)*0.44);
          ctx.beginPath(); ctx.arc(fx, fy, 0.9+sr(seed+0.71)*2.2, 0, Math.PI*2); ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
    } else {
      const lEdge = pt(234), rEdge = pt(454), faceW = Math.abs(rEdge.x - lEdge.x);
      const lInner = pt(133), rInner = pt(362);
      const lc = { x: lEdge.x+faceW*0.30, y: lInner.y+faceW*0.07 };
      const rc = { x: rEdge.x-faceW*0.30, y: rInner.y+faceW*0.07 };
      const rw = faceW*0.17, rh = rw*0.60;
      ctx.fillStyle = shade.hex; ctx.globalAlpha = alpha*0.44; ctx.filter = "blur(16px)";
      ctx.beginPath(); ctx.ellipse(lc.x,lc.y,rw,rh,-0.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(rc.x,rc.y,rw,rh, 0.2,0,Math.PI*2); ctx.fill();
      ctx.filter = "none"; ctx.globalAlpha = 1;
    }

  } else if (category === "lenses") {
    if (!landmarks || landmarks.length < 478) return;
    const lr = parseInt(shade.hex.slice(1,3), 16);
    const lg = parseInt(shade.hex.slice(3,5), 16);
    const lb = parseInt(shade.hex.slice(5,7), 16);

    const paintIris = (ci, bi) => {
      const c = pt(ci);
      let sumR = 0;
      for (const bidx of bi) { const p = pt(bidx); sumR += Math.hypot(p.x-c.x, p.y-c.y); }
      const radius = sumR / bi.length; // exact iris radius, no inflation

      ctx.save();
      // Clip to iris circle so colour never bleeds onto the whites
      ctx.beginPath();
      ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
      ctx.clip();

      // Layered iris gradient: transparent pupil → inner transition ring → full color zone →
      // outer color fade → limbal boundary. On color-blend canvas luminance is preserved so the
      // natural pupil stays dark and iris texture shows through; only hue/saturation shifts.
      const grad = ctx.createRadialGradient(c.x, c.y, radius * 0.18, c.x, c.y, radius);
      grad.addColorStop(0,    `rgba(${lr},${lg},${lb},0)`);
      grad.addColorStop(0.22, `rgba(${lr},${lg},${lb},0)`);
      grad.addColorStop(0.32, `rgba(${lr},${lg},${lb},${alpha * 0.62})`);
      grad.addColorStop(0.48, `rgba(${lr},${lg},${lb},${alpha * 0.92})`);
      grad.addColorStop(0.72, `rgba(${lr},${lg},${lb},${alpha * 0.92})`);
      grad.addColorStop(0.86, `rgba(${lr},${lg},${lb},${alpha * 0.55})`);
      grad.addColorStop(0.95, `rgba(${lr},${lg},${lb},${alpha * 0.18})`);
      grad.addColorStop(1.0,  `rgba(${lr},${lg},${lb},0)`);
      ctx.fillStyle = grad;
      ctx.globalAlpha = 1;
      ctx.fillRect(c.x - radius - 2, c.y - radius - 2, radius * 2 + 4, radius * 2 + 4);

      // Inner iris spoke variation: faint radial streaks add texture depth on the color canvas
      // (visible because color blend mode preserves luminance — the streaks shift hue only)
      const spokeGrad = ctx.createRadialGradient(c.x, c.y, radius * 0.30, c.x, c.y, radius * 0.78);
      spokeGrad.addColorStop(0,   `rgba(${Math.min(255,lr+40)},${Math.min(255,lg+30)},${Math.min(255,lb+20)},${alpha * 0.28})`);
      spokeGrad.addColorStop(0.5, `rgba(${lr},${lg},${lb},${alpha * 0.10})`);
      spokeGrad.addColorStop(1,   `rgba(${lr},${lg},${lb},0)`);
      ctx.fillStyle = spokeGrad;
      ctx.fillRect(c.x - radius - 2, c.y - radius - 2, radius * 2 + 4, radius * 2 + 4);
      ctx.restore();
    };

    paintIris(L_IRIS_C, L_IRIS_B);
    paintIris(R_IRIS_C, R_IRIS_B);

  } else if (category === "hair") {
    const topHead = pt(10), lEdge = pt(234), rEdge = pt(454);
    const faceW = Math.abs(rEdge.x - lEdge.x), hairCx = (lEdge.x + rEdge.x) / 2;
    ctx.save();
    ctx.beginPath();
    const fp = pt(HAIR_BOUNDARY[0]); ctx.moveTo(fp.x, fp.y);
    for (let k = 1; k < HAIR_BOUNDARY.length; k++) { const p = pt(HAIR_BOUNDARY[k]); ctx.lineTo(p.x, p.y); }
    ctx.lineTo(-10,-10); ctx.lineTo(W+10,-10);
    ctx.closePath(); ctx.clip();
    const gradCy = topHead.y - faceW*0.30;
    const ao = Math.round(alpha*0.55*255).toString(16).padStart(2,"0");
    const grad = ctx.createRadialGradient(hairCx, gradCy, 0, hairCx, gradCy, faceW*0.90);
    grad.addColorStop(0,    shade.hex + ao);
    grad.addColorStop(0.65, shade.hex + ao);
    grad.addColorStop(1,    shade.hex + "00");
    ctx.fillStyle = grad; ctx.globalAlpha = 1;
    ctx.fillRect(-10,-10, W+20, topHead.y+10);
    ctx.restore(); ctx.globalAlpha = 1;
  }
}

// ── WebGL Blinn-Phong Gloss Shader ─────────────────────────────────────────
// Vertex shader: full-screen quad — fragment shader does all the work
const GLOSS_VS = `
  attribute vec4 a_pos;
  void main() { gl_Position = a_pos; }
`;
// Fragment shader: per-pixel Blinn-Phong specular + Fresnel rim on lip ellipse
const GLOSS_FS = `
  precision mediump float;
  uniform vec2  u_res;    // canvas size in px
  uniform vec2  u_cen;    // lip centroid, 0-1 UV space
  uniform vec2  u_rad;    // ellipse half-radii in UV
  uniform vec3  u_col;    // gloss tint (0-1)
  uniform float u_alpha;  // intensity
  uniform float u_rough;  // 0=mirror, 1=matte
  void main() {
    // Fragment UV — flip Y because WebGL origin is bottom-left
    vec2 uv   = vec2(gl_FragCoord.x, u_res.y - gl_FragCoord.y) / u_res;
    vec2 d    = (uv - u_cen) / u_rad;
    float len = length(d);
    // Soft ellipse mask — discard outside lip boundary
    float mask = smoothstep(1.0, 0.50, len);
    if (mask < 0.01) { gl_FragColor = vec4(0.0); return; }
    // Approximate surface normal from lip curvature:
    // lips are convex vertically (strong Y curve) and gentle horizontally
    vec3 N = normalize(vec3(-d.x * 1.1, d.y * 2.6, 1.0));
    vec3 V = vec3(0.0, 0.0, 1.0);         // view direction (toward camera)
    vec3 L = normalize(vec3(-0.22, 0.62, 0.75)); // vanity-mirror light
    vec3 H = normalize(L + V);             // Blinn-Phong halfway vector
    // Specular lobe — shininess controlled by roughness
    float sh   = mix(8.0, 200.0, 1.0 - u_rough);
    float spec = pow(max(dot(N, H), 0.0), sh);
    // Fresnel: edges of lip catch more light (wet-rim effect)
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0) * 0.22;
    float tot  = (spec + fres) * mask * u_alpha;
    // Blend specular peak toward white
    vec3 outC  = mix(u_col, vec3(1.0), spec * 0.68);
    gl_FragColor = vec4(outC * tot, tot);
  }
`;

function initGlossGL(canvas) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
  if (!gl) return null;
  const comp = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, comp(gl.VERTEX_SHADER,   GLOSS_VS));
  gl.attachShader(prog, comp(gl.FRAGMENT_SHADER, GLOSS_FS));
  gl.linkProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  return {
    gl, prog, buf,
    posLoc: gl.getAttribLocation(prog,  "a_pos"),
    uRes:   gl.getUniformLocation(prog, "u_res"),
    uCen:   gl.getUniformLocation(prog, "u_cen"),
    uRad:   gl.getUniformLocation(prog, "u_rad"),
    uCol:   gl.getUniformLocation(prog, "u_col"),
    uAlpha: gl.getUniformLocation(prog, "u_alpha"),
    uRough: gl.getUniformLocation(prog, "u_rough"),
  };
}

function paintGlossGL(glCtx, canvas, shade, landmarks, intensity, isMirrored, vW, vH) {
  if (!glCtx || !canvas) return;
  const { gl, prog, buf, posLoc, uRes, uCen, uRad, uCol, uAlpha, uRough } = glCtx;
  const W = canvas.width, H = canvas.height;
  gl.viewport(0, 0, W, H);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  if (!shade || !landmarks?.length) return;

  const vw = vW > 0 ? vW : W, vh = vH > 0 ? vH : H;
  const { scale, ox, oy } = objCover(W, H, vw, vh);
  const pt = (i) => {
    const rx = landmarks[i].x * vw * scale + ox;
    const ry = landmarks[i].y * vh * scale + oy;
    return { x: (isMirrored ? W - rx : rx) / W, y: ry / H };
  };
  const pts = LIP_OUTER.map(i => pt(i));
  const cx = pts.reduce((s,p)=>s+p.x,0)/pts.length;
  const cy = pts.reduce((s,p)=>s+p.y,0)/pts.length;
  const xs = pts.map(p=>p.x), ys = pts.map(p=>p.y);
  const rX = (Math.max(...xs) - Math.min(...xs)) * 0.56;
  const rY = (Math.max(...ys) - Math.min(...ys)) * 0.60;

  const r = parseInt(shade.hex.slice(1,3),16)/255;
  const g = parseInt(shade.hex.slice(3,5),16)/255;
  const b = parseInt(shade.hex.slice(5,7),16)/255;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(uRes, W, H);
  gl.uniform2f(uCen, cx, cy);
  gl.uniform2f(uRad, rX, rY);
  // Brighten the tint slightly so highlights read on dark shades
  gl.uniform3f(uCol, Math.min(r*1.2+0.12,1), Math.min(g*1.2+0.12,1), Math.min(b*1.2+0.12,1));
  // Scale down so WebGL highlight is a crisp accent, not a full balloon specular
  gl.uniform1f(uAlpha, (intensity/100) * 0.32);
  gl.uniform1f(uRough, 0.48); // sh≈100 — tight enough to read, soft enough to look wet not plastic
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

// Wet catch-light for colored contact lenses — drawn on the screen canvas so it brightens naturally
function paintLensGlint(sCanvas, landmarks, intensity, isMirrored, vW, vH) {
  if (!sCanvas || !landmarks?.length || landmarks.length < 478) return;
  const ctx = sCanvas.getContext("2d");
  const W = sCanvas.width, H = sCanvas.height;
  const vw = vW > 0 ? vW : W, vh = vH > 0 ? vH : H;
  const { scale, ox, oy } = objCover(W, H, vw, vh);
  const pt = (i) => {
    const rx = landmarks[i].x * vw * scale + ox;
    const ry = landmarks[i].y * vh * scale + oy;
    return { x: isMirrored ? W - rx : rx, y: ry };
  };
  const alpha = intensity / 100;
  const drawGlint = (ci, bi) => {
    const c = pt(ci);
    let sumR = 0;
    for (const bidx of bi) { const p = pt(bidx); sumR += Math.hypot(p.x-c.x, p.y-c.y); }
    const radius = sumR / bi.length;
    ctx.save();
    ctx.beginPath(); ctx.arc(c.x, c.y, radius * 0.95, 0, Math.PI * 2); ctx.clip();
    // Primary catch-light: upper-left offset (ceiling/window ambient reflection)
    const gx = c.x - radius * 0.28, gy = c.y - radius * 0.30, gr = radius * 0.24;
    const glint = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    glint.addColorStop(0,    `rgba(255,255,255,${alpha * 0.82})`);
    glint.addColorStop(0.32, `rgba(255,255,255,${alpha * 0.26})`);
    glint.addColorStop(1,    `rgba(255,255,255,0)`);
    ctx.fillStyle = glint; ctx.filter = "blur(0.5px)"; ctx.globalAlpha = 1;
    ctx.fillRect(c.x-radius-2, c.y-radius-2, radius*2+4, radius*2+4);
    // Secondary micro-glint: lower-right (secondary ambient bounce, much dimmer)
    const gx2 = c.x + radius * 0.38, gy2 = c.y + radius * 0.32, gr2 = radius * 0.10;
    const glint2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, gr2);
    glint2.addColorStop(0,   `rgba(255,255,255,${alpha * 0.28})`);
    glint2.addColorStop(1,   `rgba(255,255,255,0)`);
    ctx.fillStyle = glint2; ctx.filter = "blur(0.8px)";
    ctx.fillRect(c.x-radius-2, c.y-radius-2, radius*2+4, radius*2+4);
    ctx.filter = "none";
    ctx.restore();
  };
  drawGlint(L_IRIS_C, L_IRIS_B);
  drawGlint(R_IRIS_C, R_IRIS_B);
}

// Lens depth — drawn on the multiply canvas so it darkens naturally (no colour shift)
// Adds a limbal ring (dark boundary at iris edge) + upper lid shadow to create 3D lens depth.
function paintLensDepth(mCanvas, landmarks, intensity, isMirrored, vW, vH) {
  if (!mCanvas || !landmarks?.length || landmarks.length < 478) return;
  const ctx = mCanvas.getContext("2d");
  const W = mCanvas.width, H = mCanvas.height;
  const vw = vW > 0 ? vW : W, vh = vH > 0 ? vH : H;
  const { scale, ox, oy } = objCover(W, H, vw, vh);
  const pt = (i) => {
    const rx = landmarks[i].x * vw * scale + ox;
    const ry = landmarks[i].y * vh * scale + oy;
    return { x: isMirrored ? W - rx : rx, y: ry };
  };
  const alpha = intensity / 100;
  const addDepth = (ci, bi) => {
    const c = pt(ci);
    let sumR = 0;
    for (const bidx of bi) { const p = pt(bidx); sumR += Math.hypot(p.x-c.x, p.y-c.y); }
    const radius = sumR / bi.length;
    ctx.save();
    ctx.beginPath(); ctx.arc(c.x, c.y, radius, 0, Math.PI * 2); ctx.clip();
    // Limbal ring: thin dark annulus at iris edge that defines the lens boundary
    const limbal = ctx.createRadialGradient(c.x, c.y, radius * 0.80, c.x, c.y, radius);
    limbal.addColorStop(0,    `rgba(0,0,0,0)`);
    limbal.addColorStop(0.50, `rgba(0,0,0,${alpha * 0.40})`);
    limbal.addColorStop(1,    `rgba(0,0,0,${alpha * 0.70})`);
    ctx.fillStyle = limbal; ctx.globalAlpha = 1;
    ctx.fillRect(c.x - radius - 2, c.y - radius - 2, radius * 2 + 4, radius * 2 + 4);
    // Upper lid shadow: darkens the top arc of the iris (eyelid casts shadow onto lens surface)
    const shadowCy = c.y - radius * 0.80;
    const lidShadow = ctx.createRadialGradient(c.x, shadowCy, 0, c.x, shadowCy, radius * 1.05);
    lidShadow.addColorStop(0,    `rgba(0,0,0,${alpha * 0.26})`);
    lidShadow.addColorStop(0.50, `rgba(0,0,0,${alpha * 0.10})`);
    lidShadow.addColorStop(1,    `rgba(0,0,0,0)`);
    ctx.fillStyle = lidShadow;
    ctx.fillRect(c.x - radius - 2, c.y - radius - 2, radius * 2 + 4, c.y - radius * 0.10);
    ctx.restore();
  };
  addDepth(L_IRIS_C, L_IRIS_B);
  addDepth(R_IRIS_C, R_IRIS_B);
}

// Zone-based finishing — Canvas 2D approximation of PBR zone masks.
// Mirrors what Banuba/DeepAR do with per-zone roughness, SSS, and specular:
//   • T-zone (nose bridge):  higher specular, more shine  → screen canvas
//   • Brow bone:             elongated catch-light         → screen canvas
//   • Cheekbone:             warm golden highlight         → screen canvas
//   • Jaw + temple:          soft depth darkening          → multiply canvas
// Each zone is anchored to specific MediaPipe landmarks so it tracks the face.
function paintZoneFinish(sCanvas, mCanvas, landmarks, isMirrored, vW, vH) {
  if (!sCanvas || !mCanvas || !landmarks?.length) return;
  const W = sCanvas.width, H = sCanvas.height;
  const vw = vW > 0 ? vW : W, vh = vH > 0 ? vH : H;
  const { scale, ox, oy } = objCover(W, H, vw, vh);
  const pt = (i) => {
    const rx = landmarks[i].x * vw * scale + ox;
    const ry = landmarks[i].y * vh * scale + oy;
    return { x: isMirrored ? W - rx : rx, y: ry };
  };
  const faceW = Math.abs(pt(454).x - pt(234).x);
  const sCtx = sCanvas.getContext("2d");

  // T-zone: nose bridge — skin produces more oil/shine here
  const nb = pt(6);
  const nz = sCtx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, faceW * 0.10);
  nz.addColorStop(0, "rgba(255,255,255,0.08)");
  nz.addColorStop(1, "rgba(255,255,255,0)");
  sCtx.fillStyle = nz;
  sCtx.fillRect(nb.x - faceW*0.11, nb.y - faceW*0.11, faceW*0.22, faceW*0.22);

  // Brow bone highlights — elongated horizontal catch-light above each eye
  const rEyeW = Math.abs(pt(33).x - pt(133).x);
  const lEyeW = Math.abs(pt(263).x - pt(362).x);
  [[pt(66), rEyeW], [pt(296), lEyeW]].forEach(([b, ew]) => {
    const bg = sCtx.createRadialGradient(b.x, b.y - ew*0.10, 0, b.x, b.y - ew*0.10, ew*0.44);
    bg.addColorStop(0, "rgba(255,255,255,0.10)");
    bg.addColorStop(1, "rgba(255,255,255,0)");
    sCtx.filter = "blur(2px)";
    sCtx.fillStyle = bg;
    sCtx.beginPath();
    sCtx.ellipse(b.x, b.y - ew*0.10, ew*0.44, ew*0.12, 0, 0, Math.PI*2);
    sCtx.fill();
  });

  // Cheekbone highlights — warm angled glow at lateral orbital rim
  [pt(50), pt(280)].forEach(ck => {
    const cg = sCtx.createRadialGradient(ck.x, ck.y, 0, ck.x, ck.y, faceW * 0.13);
    cg.addColorStop(0, "rgba(255,238,210,0.11)");
    cg.addColorStop(1, "rgba(255,238,210,0)");
    sCtx.filter = "blur(7px)";
    sCtx.fillStyle = cg;
    sCtx.beginPath();
    sCtx.ellipse(ck.x, ck.y, faceW*0.13, faceW*0.068, -0.28, 0, Math.PI*2);
    sCtx.fill();
  });
  sCtx.filter = "none"; sCtx.globalAlpha = 1;

  // Jaw + temple contour: soft multiply darkening for depth/sculpt
  const mCtx = mCanvas.getContext("2d");
  mCtx.filter = "blur(12px)";
  [pt(172), pt(397), pt(234), pt(454)].forEach(p => {
    const cg = mCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, faceW * 0.10);
    cg.addColorStop(0, "rgba(15,8,4,0.11)");
    cg.addColorStop(1, "rgba(15,8,4,0)");
    mCtx.fillStyle = cg;
    mCtx.beginPath();
    mCtx.arc(p.x, p.y, faceW * 0.10, 0, Math.PI*2);
    mCtx.fill();
  });
  mCtx.filter = "none";
}

// Canvas blend assignments:
//   lipCanvas       → lips                          (normal — feathered alpha blend into skin)
//   multiplyCanvas  → liner, mascara, face          (multiply)
//   screenCanvas    → gloss (diffuse base)          (screen)
//   colorCanvas     → hair, lenses                  (color — recolors iris, preserves natural luminance)
//   softLightCanvas → eyes                          (soft-light — sheer shadow)
//   webglCanvas     → gloss (Blinn-Phong specular)  (screen — real fragment shader)
function paintAllEffects(lipCanvas, mCanvas, sCanvas, cCanvas, eCanvas, landmarks, effects, intensity, isMirrored, vW, vH) {
  for (const c of [lipCanvas, mCanvas, sCanvas, cCanvas, eCanvas]) {
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
  }
  if (!landmarks?.length) return;
  if (effects.lips)    paintCategory(lipCanvas, "lips",    effects.lips,    landmarks, intensity, isMirrored, vW, vH);
  if (effects.gloss)   paintCategory(sCanvas,   "gloss",   effects.gloss,   landmarks, intensity, isMirrored, vW, vH);
  if (effects.liner)   paintCategory(mCanvas,   "liner",   effects.liner,   landmarks, intensity, isMirrored, vW, vH);
  if (effects.eyes)    paintCategory(eCanvas,   "eyes",    effects.eyes,    landmarks, intensity, isMirrored, vW, vH);
  if (effects.mascara) paintCategory(mCanvas,   "mascara", effects.mascara, landmarks, intensity, isMirrored, vW, vH);
  if (effects.face)    paintCategory(mCanvas,   "face",    effects.face,    landmarks, intensity, isMirrored, vW, vH);
  if (effects.lenses) {
    paintCategory(cCanvas, "lenses", effects.lenses, landmarks, intensity, isMirrored, vW, vH);
    paintLensDepth(mCanvas, landmarks, intensity, isMirrored, vW, vH); // limbal ring + lid shadow on multiply
    paintLensGlint(sCanvas, landmarks, intensity, isMirrored, vW, vH); // wet catch-light on screen
  }
  if (effects.hair)    paintCategory(cCanvas,   "hair",    effects.hair,    landmarks, intensity, isMirrored, vW, vH);
  // Zone-based finishing: auto-applied whenever any effect is active
  if (Object.values(effects).some(Boolean)) paintZoneFinish(sCanvas, mCanvas, landmarks, isMirrored, vW, vH);
}

const EMPTY_EFFECTS = { lips:null, gloss:null, liner:null, eyes:null, mascara:null, face:null, lenses:null, hair:null };
const TAB_LABELS    = { lips:"Lips", gloss:"Gloss", liner:"Liner", eyes:"Eyes", mascara:"Lash", face:"Face", lenses:"Lens", hair:"Hair" };

export default function TryOnMirror({ onClose }) {
  const [browseCategory, setBrowseCategory] = useState("lips");
  const [effects,      setEffects]      = useState(EMPTY_EFFECTS);
  const [facing,       setFacing]       = useState("user");
  const [intensity,    setIntensity]    = useState(75);
  const [monkTone,     setMonkTone]     = useState(2);
  const [mpState,      setMpState]      = useState("loading");
  const [view,         setView]         = useState("live");
  const [justSaved,    setJustSaved]    = useState(false);
  const [historyKey,   setHistoryKey]   = useState(0);
  const [capturedUrl,  setCapturedUrl]  = useState(null);

  const videoRef       = useRef(null);
  const streamRef      = useRef(null);
  const lipRef         = useRef(null);  // lips: normal blend — feathered into skin
  const multiplyRef    = useRef(null);
  const screenRef      = useRef(null);
  const colorRef       = useRef(null);
  const softLightRef   = useRef(null);
  const webglRef       = useRef(null);  // 6th canvas — WebGL Blinn-Phong gloss
  const glossGLRef     = useRef(null);  // compiled WebGL program + uniforms
  const containerRef   = useRef(null);
  const faceMeshRef    = useRef(null);
  const landmarksRef   = useRef(null);
  const rafIdRef       = useRef(null);
  const busyRef        = useRef(false);
  const paintParamsRef = useRef({ effects, intensity, facing });
  useEffect(() => { paintParamsRef.current = { effects, intensity, facing }; }, [effects, intensity, facing]);

  // MediaPipe init
  useEffect(() => {
    const loadScript = (src) => new Promise((res,rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement("script");
      s.src = src; s.crossOrigin = "anonymous"; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
    const init = async () => {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js");
        await new Promise(r => setTimeout(r, 150));
        if (!window.FaceMesh) throw new Error("unavailable");
        const fm = new window.FaceMesh({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` });
        fm.setOptions({ maxNumFaces:1, refineLandmarks:true, minDetectionConfidence:0.5, minTrackingConfidence:0.5 });
        fm.onResults((results) => {
          busyRef.current = false;
          const lms = results.multiFaceLandmarks?.[0] ?? null;
          landmarksRef.current = lms;
          const { effects, intensity, facing } = paintParamsRef.current;
          const vid = videoRef.current;
          paintAllEffects(
            lipRef.current, multiplyRef.current, screenRef.current, colorRef.current, softLightRef.current,
            lms, effects, intensity, facing === "user", vid?.videoWidth ?? 0, vid?.videoHeight ?? 0
          );
          paintGlossGL(glossGLRef.current, webglRef.current, effects.gloss, lms, intensity, facing === "user", vid?.videoWidth ?? 0, vid?.videoHeight ?? 0);
        });
        faceMeshRef.current = fm; setMpState("ready");
      } catch { setMpState("error"); }
    };
    init();
    return () => { faceMeshRef.current?.close?.(); };
  }, []);

  // Compile WebGL gloss shader once on mount
  useEffect(() => {
    const canvas = webglRef.current; if (!canvas) return;
    const glCtx = initGlossGL(canvas);
    if (glCtx) glossGLRef.current = glCtx;
  }, []);

  // RAF loop
  useEffect(() => {
    if (mpState !== "ready") return;
    const loop = async () => {
      const video = videoRef.current;
      if (!busyRef.current && video?.readyState >= 2) {
        busyRef.current = true;
        try { await faceMeshRef.current.send({ image: video }); }
        catch { busyRef.current = false; }
      }
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [mpState]);

  // Redraw on param change
  useEffect(() => {
    const vid = videoRef.current;
    paintAllEffects(
      lipRef.current, multiplyRef.current, screenRef.current, colorRef.current, softLightRef.current,
      landmarksRef.current, effects, intensity, facing === "user",
      vid?.videoWidth ?? 0, vid?.videoHeight ?? 0
    );
    paintGlossGL(glossGLRef.current, webglRef.current, effects.gloss, landmarksRef.current, intensity, facing === "user", vid?.videoWidth ?? 0, vid?.videoHeight ?? 0);
  }, [effects, intensity, facing, mpState]);

  // Canvas sizing — 5 × Canvas2D + 1 × WebGL
  useEffect(() => {
    const resize = () => {
      const box = containerRef.current; if (!box) return;
      for (const ref of [lipRef, multiplyRef, screenRef, colorRef, softLightRef, webglRef]) {
        if (ref.current) { ref.current.width = box.offsetWidth; ref.current.height = box.offsetHeight; }
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Camera stream
  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
      .then((s) => {
        if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      }).catch(() => {});
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const toggleShade = (shade) => {
    setEffects(prev => ({
      ...prev,
      [browseCategory]: prev[browseCategory]?.name === shade.name ? null : shade,
    }));
  };

  const capture = () => {
    const video     = videoRef.current;
    const container = containerRef.current;
    if (!video?.videoWidth || !container) return;

    const CW = container.offsetWidth * 2;
    const CH = container.offsetHeight * 2;
    const c  = document.createElement("canvas");
    c.width = CW; c.height = CH;
    const ctx = c.getContext("2d");

    const vw = video.videoWidth, vh = video.videoHeight;
    const { scale: cs, ox, oy } = objCover(CW, CH, vw, vh);
    const dw = vw*cs, dh = vh*cs;
    if (facing === "user") {
      ctx.save(); ctx.scale(-1,1); ctx.drawImage(video, -ox-dw, oy, dw, dh); ctx.restore();
    } else {
      ctx.drawImage(video, ox, oy, dw, dh);
    }

    const lC = document.createElement("canvas"); lC.width = CW; lC.height = CH;
    const mC = document.createElement("canvas"); mC.width = CW; mC.height = CH;
    const sC = document.createElement("canvas"); sC.width = CW; sC.height = CH;
    const hC = document.createElement("canvas"); hC.width = CW; hC.height = CH;
    const eC = document.createElement("canvas"); eC.width = CW; eC.height = CH;
    paintAllEffects(lC, mC, sC, hC, eC, landmarksRef.current, effects, intensity, facing === "user", vw, vh);

    ctx.save(); ctx.globalCompositeOperation = "source-over"; ctx.drawImage(lC, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "multiply";    ctx.drawImage(mC, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "screen";      ctx.drawImage(sC, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "color";       ctx.drawImage(hC, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = "soft-light";  ctx.drawImage(eC, 0, 0); ctx.restore();

    setCapturedUrl(c.toDataURL("image/jpeg", 0.92));
    setView("preview");
  };

  const saveLook = async () => {
    const shade = effects[browseCategory];
    if (!shade) return;
    try {
      await base44.entities.TryOnLook.create({ category: browseCategory, shade_name: shade.name, shade_hex: shade.hex });
      setJustSaved(true); setTimeout(() => setJustSaved(false), 1500);
    } catch {}
  };

  const shades       = SHADES[browseCategory] ?? [];
  const browsedShade = effects[browseCategory];
  const anyEffect    = Object.values(effects).some(Boolean);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex flex-col bg-black">

      {/* Camera area */}
      <div ref={containerRef} className="relative flex-1 overflow-hidden">
        <video
          ref={(el) => { videoRef.current = el; if (el && streamRef.current) el.srcObject = streamRef.current; }}
          autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: facing === "user" ? "scaleX(-1)" : "none" }}
        />
        {/* lip canvas: normal blend — sits directly on video, feathered edges alpha-blend into skin */}
        <canvas ref={lipRef}       className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "normal" }} />
        <canvas ref={multiplyRef}  className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "multiply" }} />
        <canvas ref={screenRef}    className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />
        <canvas ref={colorRef}     className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "color" }} />
        <canvas ref={softLightRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "soft-light" }} />
        {/* WebGL canvas — Blinn-Phong fragment shader: surface normals, specular lobe, Fresnel rim */}
        <canvas ref={webglRef}     className="absolute inset-0 w-full h-full pointer-events-none" style={{ mixBlendMode: "screen" }} />

        {mpState === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none">
            <div className="w-7 h-7 border-2 border-[#C8B06A] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[9px] tracking-[0.3em] uppercase text-white/60">Loading face tracking…</p>
          </div>
        )}

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-2 pointer-events-none">
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center pointer-events-auto"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
            <X size={16} color="white" />
          </button>
          <div className="text-center">
            <p className="text-[8px] tracking-[0.35em] uppercase text-white/40">The Muse</p>
            <p className="font-serif text-base text-white font-light leading-tight">Studio</p>
          </div>
          <div className="flex gap-2 pointer-events-auto">
            <button onClick={() => { setView("saved"); setHistoryKey(k => k+1); }}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
              <Bookmark size={14} color="white" />
            </button>
            <button onClick={() => setFacing(f => f === "user" ? "environment" : "user")}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)" }}>
              <RefreshCw size={14} color="white" />
            </button>
          </div>
        </div>

        {/* Active effect dots */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none">
          {Object.entries(effects).map(([cat, shade]) => shade ? (
            <div key={cat} className="flex flex-col items-center gap-0.5">
              <div className="w-6 h-6 rounded-full"
                style={{ background: shade.hex, border: "2px solid rgba(255,255,255,0.6)", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
              <span className="text-[6px] tracking-[0.08em] uppercase text-white/50">{TAB_LABELS[cat]||cat}</span>
            </div>
          ) : null)}
        </div>

        {/* Intensity slider */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-auto">
          <SlidersHorizontal size={12} color="rgba(255,255,255,0.4)" />
          <div className="relative h-32 flex items-center justify-center">
            <input type="range" min={15} max={100} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              style={{ appearance:"slider-vertical", WebkitAppearance:"slider-vertical", writingMode:"vertical-lr", direction:"rtl", width:"2px", height:"128px", cursor:"pointer", accentColor:"#C8B06A" }} />
          </div>
          <span className="text-[8px] text-white/35">{intensity}%</span>
        </div>

        {/* Shutter */}
        <button onClick={capture}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-10"
          style={{ background:"rgba(255,255,255,0.95)", border:"3px solid #043927", boxShadow:"0 2px 16px rgba(0,0,0,0.35)" }}>
          <Camera size={22} color="#043927" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="bg-[#0A1A12] flex-shrink-0 px-4 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)" }}>

        {/* Scrollable category tabs */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto hide-scrollbar pb-0.5">
          {Object.keys(SHADES).map((cat) => (
            <button key={cat} onClick={() => setBrowseCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[9px] tracking-[0.15em] uppercase font-light transition-all relative ${
                browseCategory === cat ? "bg-[#C8B06A] text-[#0A1A12]" : "text-white/40"
              }`}
              style={browseCategory !== cat ? { background: "rgba(255,255,255,0.06)" } : {}}>
              {TAB_LABELS[cat]||cat}
              {effects[cat] && browseCategory !== cat && (
                <span className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: effects[cat].hex, boxShadow: "0 0 3px rgba(0,0,0,0.4)" }} />
              )}
            </button>
          ))}
        </div>

        {/* Shade carousel */}
        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-2.5">
          <button onClick={() => setEffects(prev => ({ ...prev, [browseCategory]: null }))}
            className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: !browsedShade ? "2px solid #C8B06A" : "1px solid rgba(255,255,255,0.15)" }}>
              <X size={13} color="rgba(255,255,255,0.35)" />
            </div>
            <span className="text-[7px] text-white/30">None</span>
          </button>

          {shades.map((shade) => (
            <button key={shade.name} onClick={() => toggleShade(shade)}
              className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full transition-all relative" style={{
                background: shade.hex,
                border: browsedShade?.name === shade.name ? "2.5px solid #C8B06A" : "1px solid rgba(255,255,255,0.12)",
                transform: browsedShade?.name === shade.name ? "scale(1.14)" : "scale(1)",
                boxShadow: browsedShade?.name === shade.name ? "0 0 10px rgba(200,176,106,0.45)" : "none",
              }}>
                {shade.type === "freckles" && (
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] opacity-60">✦</span>
                )}
              </div>
              <span className="text-[7px] text-white/35 whitespace-nowrap">{shade.name}</span>
            </button>
          ))}
        </div>

        {/* Monk scale + clear + save */}
        <div className="flex items-center gap-2">
          <span className="text-[7px] tracking-[0.12em] uppercase text-white/25 flex-shrink-0">Tone</span>
          <div className="flex gap-1.5 overflow-x-auto hide-scrollbar flex-1">
            {MONK_SCALE.map((hex, i) => (
              <button key={i} onClick={() => setMonkTone(i)}
                className="flex-shrink-0 w-[18px] h-[18px] rounded-full transition-all"
                style={{ background: hex, border: monkTone===i ? "2px solid #C8B06A" : "1px solid rgba(255,255,255,0.12)", transform: monkTone===i ? "scale(1.2)" : "scale(1)" }} />
            ))}
          </div>
          {anyEffect && (
            <button onClick={() => setEffects(EMPTY_EFFECTS)}
              className="flex-shrink-0 px-2 py-1.5 rounded-full text-[8px] tracking-[0.1em] uppercase text-white/40"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Clear
            </button>
          )}
          {browsedShade && (
            <button onClick={saveLook}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] tracking-[0.15em] uppercase"
              style={{ background: "rgba(200,176,106,0.12)", color: "#C8B06A", border: "1px solid rgba(200,176,106,0.25)" }}>
              {justSaved ? <><Check size={10}/> Saved</> : <><Bookmark size={10}/> Save</>}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {view === "preview" && capturedUrl && (
          <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ type:"spring", damping:26, stiffness:220 }}
            className="absolute inset-0 bg-[#0A1A12] z-50">
            <TryOnShareSheet
              capturedUrl={capturedUrl}
              shade={effects[browseCategory] || Object.values(effects).find(Boolean)}
              category={browseCategory}
              onRetake={() => { setCapturedUrl(null); setView("live"); }}
              onDone={() => { setCapturedUrl(null); setView("live"); }}
            />
          </motion.div>
        )}
        {view === "saved" && (
          <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }}
            transition={{ type:"spring", damping:26, stiffness:220 }}
            className="absolute inset-0 bg-[#0A1A12] z-50 overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-14 pb-4">
              <h2 className="font-serif text-xl text-[#FDF5E6] font-light">Saved Looks</h2>
              <button onClick={() => setView("live")}><X size={20} color="#C8B06A" /></button>
            </div>
            <TryOnHistory refreshKey={historyKey} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}