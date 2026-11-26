// triangle-floor (YogaFlow 46) - CHALKBOARD style (kit from child-pose, YogaFlow 45).
// NEVER FORCE TRIANGLE TO THE FLOOR: reaching the hand to the floor crunches the bottom side waist, turns the chest to
// the mat and rounds the back. Instead: hand on the shin or a block, both sides of the waist long, shoulders stacked,
// top arm to the ceiling. Front view of a person in a wide stance, front leg on screen-left.
// s1 stands wide (arms out), folds over the front leg and forces the hand to the floor (red).
// s2 reach for the floor, the bottom side waist crunches (bent red line). s3 chest turns to the mat, the back rounds.
// s4 hand comes up to the shin, then onto a block (green). s5 both sides of the waist long: two parallel straight lines.
// s6 shoulders stacked on one vertical line, top arm reaches to the ceiling. s7 end card, s8 brand. Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const back = (a, b, x) => { const t = cl((x - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };
const on = (id, w, u, a = 0.1, b = 0.15, n = 1) => sm(at(id, w, n) - a, at(id, w, n) + b, u);

const RED = "#ff8f8f", GREEN = "#a6f2b4", VIOLET = "#f4f1e6", ORANGE = "#ffc078", WHITE = "#ffffff", BG = "#24432f";
const CX = 510;
const cv = document.getElementById("world");
const out = cv.getContext("2d");
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mk = () => { const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; return c; };
const boardC = mk(); {
  const b = boardC.getContext("2d"), r = rng(5);
  b.fillStyle = BG; b.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 46; i++) { b.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.022})`; b.beginPath(); b.ellipse(r() * 1080, r() * 1920, 80 + r() * 220, 30 + r() * 90, r() * 3, 0, Math.PI * 2); b.fill(); }
  b.strokeStyle = "rgba(244,241,230,0.10)"; b.lineWidth = 8; b.beginPath(); b.moveTo(60, 1470); b.lineTo(1020, 1462); b.stroke();
  b.fillStyle = "#7a5230"; b.fillRect(0, 0, 1080, 26); b.fillRect(0, 0, 26, 1920); b.fillRect(1054, 0, 26, 1920); b.fillRect(0, 1860, 1080, 60);
  b.fillStyle = "#5c3d22"; b.fillRect(0, 1860, 1080, 10);
  b.fillStyle = "#f4f1e6"; b.fillRect(300, 1872, 70, 14); b.fillStyle = "#ffc078"; b.fillRect(420, 1874, 50, 12);
}
const grainC = mk(); {
  const g = grainC.getContext("2d"), r = rng(11);
  for (let i = 0; i < 90000; i++) { g.fillStyle = `rgba(0,0,0,${0.35 + r() * 0.55})`; g.fillRect(Math.floor(r() * 1080), Math.floor(r() * 1920), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); }
}
const inkC = mk(), ink = inkC.getContext("2d");
const BR = [0x24, 0x43, 0x2f];
function boardOf(v) {
  if (typeof v !== "string") return v;
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  if (0.3 * r + 0.59 * g + 0.11 * b >= 70) return v;
  return `rgba(${BR[0]},${BR[1]},${BR[2]},${a})`;
}
const x = new Proxy(ink, {
  get(t, k) { const v = t[k]; return typeof v === "function" ? v.bind(t) : v; },
  set(t, k, v) { if (k === "fillStyle" || k === "strokeStyle") v = boardOf(v); t[k] = v; return true; },
});
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (820 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.05, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.32, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.12, curU);
      const s = 0.4 + 0.6 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.rotate((((wi + li * 3) * 7919) % 13 - 6) * 0.007); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
      x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
}
function underline(cy, w, k, c) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineWidth = 12; x.lineCap = "round";
  x.beginPath(); x.moveTo(CX - w / 2, cy); x.quadraticCurveTo(CX, cy + 14, lerp(CX - w / 2, CX + w / 2, k), cy - 4); x.stroke(); x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * cl(a);
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.rotate(((txt.length * 37) % 7 - 3) * 0.008); x.scale(s, s);
  x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.3); x.fill();
  x.lineWidth = 6; x.strokeStyle = color; x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function ring(X, Y, r, c, a, w = 9) { if (a <= 0) return; x.save(); x.globalAlpha = cl(a); x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2 * cl(a * 1.2)); x.stroke(); x.restore(); }
function arrow(x0, y0, x1, y1, c, k, w = 14) {
  if (k <= 0) return;
  const ex = lerp(x0, x1, cl(k)), ey = lerp(y0, y1, cl(k)), A = Math.atan2(y1 - y0, x1 - x0), h = w * 2.6;
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex, ey); x.stroke();
  x.beginPath(); x.moveTo(ex - h * Math.cos(A - 0.5), ey - h * Math.sin(A - 0.5)); x.lineTo(ex, ey); x.lineTo(ex - h * Math.cos(A + 0.5), ey - h * Math.sin(A + 0.5)); x.stroke();
  x.restore();
}
function cross(X, Y, r, k, c = RED) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineWidth = 20; x.lineCap = "round";
  const a = cl(k * 2), b = cl(k * 2 - 1);
  x.beginPath(); x.moveTo(X - r, Y - r); x.lineTo(lerp(X - r, X + r, a), lerp(Y - r, Y + r, a)); x.stroke();
  if (b > 0) { x.beginPath(); x.moveTo(X + r, Y - r); x.lineTo(lerp(X + r, X - r, b), lerp(Y - r, Y + r, b)); x.stroke(); }
  x.restore();
}
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.strokeStyle = c; x.lineWidth = 20;
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2 * cl(a * 1.3)); x.stroke(); x.beginPath(); x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); x.stroke(); x.restore();
}
function strain(X, Y, k, u, r = 44) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k); x.strokeStyle = RED; x.lineWidth = 8; x.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const A = i * Math.PI / 3 + 0.3, r0 = r + 6 * Math.sin(u * 18 + i), r1 = r0 + 40 * k;
    x.beginPath(); x.moveTo(X + Math.cos(A) * r0, Y + Math.sin(A) * r0);
    x.lineTo(X + Math.cos(A + 0.12) * (r0 + r1) / 2, Y + Math.sin(A + 0.12) * (r0 + r1) / 2);
    x.lineTo(X + Math.cos(A) * r1, Y + Math.sin(A) * r1); x.stroke();
  }
  x.restore();
}
function dashed(A, B, c, k, w = 10) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.setLineDash([2, 24]);
  x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(lerp(A[0], B[0], cl(k)), lerp(A[1], B[1], cl(k))); x.stroke(); x.restore();
}
function floorLine(X0, X1, Y, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X0, Y + 3); x.lineTo(X1, Y); x.stroke();
  x.globalAlpha = a * 0.45; x.lineWidth = 6;
  x.beginPath(); x.moveTo(X0 + 10, Y + 34); x.lineTo(X1 - 10, Y + 32); x.stroke();
  x.restore();
}
function block(X, Y, s, c, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 10 * s; x.lineJoin = "round";
  x.fillStyle = "rgba(8,6,34,1)"; rr(X - 58 * s, Y - 120 * s, 116 * s, 120 * s, 10 * s); x.fill(); x.stroke();
  x.globalAlpha = a * 0.5; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(X - 40 * s, Y - 96 * s); x.lineTo(X + 40 * s, Y - 96 * s); x.stroke();
  x.restore();
}

// ---------- triangle pose, front view. Origin = floor midway between the feet, y up = negative. ----------
// Params (interpolated, not joints): tl = torso tilt from vertical toward the front leg (rad), dx/dy = pelvis shift,
// c = bottom-side waist crunch 0..1, rot = chest turned to the mat 0..1, rnd = back rounding 0..1,
// hb = bottom hand point, ta = top arm screen angle (rad; -PI/2 = straight up).
const FF = [-330, 0], FB = [330, 0];
const TP = {
  up:    { tl: 0.0,  dx: 0,  dy: 0,  c: 0, rot: 0,   rnd: 0, hb: [-420, -800], ta: 0 },
  reach: { tl: 1.38, dx: 10, dy: 40, c: 0.3, rot: 0.15, rnd: 0.2, hb: [-400, -110], ta: -2.0 },
  force: { tl: 1.52, dx: 30, dy: 70, c: 1, rot: 0.25, rnd: 0.35, hb: [-400, -6], ta: -2.3 },
  bad:   { tl: 1.52, dx: 30, dy: 70, c: 1, rot: 1, rnd: 1, hb: [-400, -6], ta: -2.75 },
  shin:  { tl: 1.2,  dx: 0,  dy: 0,  c: 0, rot: 0, rnd: 0, hb: [-185, -205], ta: -1.75 },
  blk:   { tl: 1.25, dx: 0,  dy: 0,  c: 0, rot: 0, rnd: 0, hb: [-420, -175], ta: -1.75 },
  good:  { tl: 1.25, dx: 0,  dy: 0,  c: 0, rot: 0, rnd: 0, hb: [-420, -175], ta: -1.30 },
};
function tp(a, b, k) { const o = {}; for (const j in a) o[j] = Array.isArray(a[j]) ? [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)] : lerp(a[j], b[j], k); return o; }
function joints(p) {
  const P0 = [p.dx, -470 + p.dy];
  const A = [-Math.sin(p.tl), -Math.cos(p.tl)], N = [-Math.cos(p.tl), Math.sin(p.tl)];   // N = toward the floor side
  const add = (P, V, k) => [P[0] + V[0] * k, P[1] + V[1] * k];
  const L = 330 - 70 * p.c, hw = 46, sw = 72 * (1 - 0.55 * p.rot);
  const sc = add(P0, A, L);
  const J = { P0, A, N, sc };
  J.hipB = add(P0, N, hw); J.hipT = add(P0, N, -hw);
  J.shB = add(sc, N, sw); J.shT = add(sc, N, -sw);
  J.head = add(add(sc, A, 118), N, 55 * p.rot);
  // bottom side waist bows in when crunched; the back (top side) bulges out when rounded
  J.cB = add(add(P0, A, L / 2), N, hw + 10 - 95 * p.c);
  J.cT = add(add(P0, A, L / 2), N, -hw - 10 - 90 * p.rnd);
  J.hb = p.hb; J.eb = [lerp(J.shB[0], p.hb[0], 0.5) - 14, lerp(J.shB[1], p.hb[1], 0.5)];
  J.ht = [J.shT[0] + Math.cos(p.ta) * 330, J.shT[1] + Math.sin(p.ta) * 330];
  J.et = [lerp(J.shT[0], J.ht[0], 0.5), lerp(J.shT[1], J.ht[1], 0.5)];
  J.fF = FF; J.fB = FB;
  return J;
}
// draws the person at screen X,Y (floor point) with scale s. col: { body, legs, sideB, sideT, arm }
function tri(X, Y, p, s, col, o = {}) {
  const J0 = joints(p);
  const br = 5 * Math.sin(curU * 2.6) * (1 - (o.still || 0));
  const jit = o.shake || 0;
  const S2 = (P, moving = true) => [X + P[0] * s + (moving ? jit : 0), Y + P[1] * s - (moving ? br : 0)];
  const J = {}; for (const k of ["P0", "sc", "hipB", "hipT", "shB", "shT", "head", "cB", "cT", "eb", "et", "ht"]) J[k] = S2(J0[k]);
  J.hb = S2(J0.hb, false); J.fF = S2(J0.fF, false); J.fB = S2(J0.fB, false);
  const a = o.a ?? 1;
  if (a <= 0) return J;
  const body = col.body || VIOLET;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const seg = (c, w, ...P) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); P.forEach((q, i) => (i ? x.lineTo(q[0], q[1]) : x.moveTo(q[0], q[1]))); x.stroke(); };
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    const sh = (q) => [q[0] + off, q[1] - off];
    seg(col.legs || body, 28 * s, sh(J.hipB), sh(J.fF));
    seg(col.legs || body, 28 * s, sh(J.hipT), sh(J.fB));
  }
  x.globalAlpha = a;
  // feet: front foot points left, back foot angled in
  seg(col.legs || body, 20 * s, J.fF, [J.fF[0] - 70 * s, J.fF[1] + 2]);
  seg(col.legs || body, 20 * s, J.fB, [J.fB[0] + 40 * s, J.fB[1] - 10 * s]);
  // torso: filled, then the two sides of the waist drawn on their own so they can turn red / green
  x.fillStyle = "rgba(8,6,34,1)";
  x.beginPath(); x.moveTo(J.hipB[0], J.hipB[1]); x.quadraticCurveTo(J.cB[0], J.cB[1], J.shB[0], J.shB[1]); x.lineTo(J.shT[0], J.shT[1]);
  x.quadraticCurveTo(J.cT[0], J.cT[1], J.hipT[0], J.hipT[1]); x.closePath(); x.fill();
  const curve = (c, w, A0, C, B0) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(A0[0], A0[1]); x.quadraticCurveTo(C[0], C[1], B0[0], B0[1]); x.stroke(); };
  curve(col.sideB || body, 14 * s, J.hipB, J.cB, J.shB);
  curve(col.sideT || body, 14 * s, J.hipT, J.cT, J.shT);
  seg(body, 14 * s, J.shB, J.shT); seg(body, 14 * s, J.hipB, J.hipT);
  // arms
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    const sh = (q) => [q[0] + off, q[1] - off];
    seg(col.arm || body, 22 * s, sh(J.shB), sh(J.eb), sh(J.hb));
    seg(col.armT || col.arm || body, 22 * s, sh(J.shT), sh(J.et), sh(J.ht));
  }
  x.globalAlpha = a;
  x.strokeStyle = body; x.lineWidth = 14 * s; x.beginPath(); x.arc(J.head[0], J.head[1], 44 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(J.head[0] - 4 * s, J.head[1] - 3 * s, 42 * s, Math.PI * 0.9, Math.PI * 2.2); x.stroke();
  x.restore();
  return J;
}

const P = { sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] } };
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const far = mix(color, "#24432f", 0.4);
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(far, 22 * s, off, "sh", "eR", "hR");
    limb(color, 28 * s, off, "sh", "hip");
    limb(color, 22 * s, off, "hip", "kL", "fL"); limb(color, 22 * s, off, "sh", "eL", "hL");
    limb(color, 22 * s, off, "hip", "kR", "fR");
  }
  x.globalAlpha = a;
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.restore();
  return W2;
}

function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  const FY = 1180, PX = 580, SC = 0.7;   // top hand at full reach stays below the title (~y 520); tags stay above the caption pills
  const shk = (k) => k * 5 * Math.sin(u * 47) + k * 3 * Math.sin(u * 71);
  const BX = PX - 420 * SC;   // block x on the floor, outside the front foot
  if (id === "s1") {
    // wide stance, arms out; folds over the front leg and forces the hand all the way to the floor
    const Fo = sm(0.6, 1.9, u), Fc = on("s1", "force", u, 0.05, 1.4);
    floorLine(110, 980, FY, 1);
    const p = tp(tp(TP.up, TP.reach, Fo), TP.force, Fc);
    const J = tri(PX, FY, p, SC, { body: VIOLET, sideB: Fc > 0.5 ? RED : VIOLET, arm: Fc > 0.5 ? RED : VIOLET }, { shake: shk(on("s1", "floor", u, 0.05, 0.3) * 0.5) });
    tag("TRIANGLE POSE", 760, 640, VIOLET, on("s1", "triangle", u, 0.0, 0.2), 42);
    arrow(J.hb[0] + 40, J.hb[1] - 230, J.hb[0] + 10, J.hb[1] - 40, RED, on("s1", "down", u, 0.05, 0.4), 13);
    ring(J.hb[0], J.hb[1], 48, RED, on("s1", "floor", u, 0.05, 0.3), 9);
    tag("FLOOR", J.hb[0] + 30, FY - 160 - 120, RED, on("s1", "floor", u, 0.05, 0.2), 42);
  }
  if (id === "s2") {
    // reaching for the floor; at "crunches" the bottom side of the waist folds up short and bent
    const Cr = on("s2", "crunches", u, 0.05, 0.45);
    floorLine(110, 980, FY, 1);
    const p = tp(tp(TP.reach, TP.force, sm(0.0, 0.9, u)), { ...TP.force, c: 1 }, 0);
    p.c = lerp(0.25, 1, Cr);
    const J = tri(PX, FY, p, SC, { body: VIOLET, sideB: RED, arm: RED }, { shake: shk(Cr * 0.5) });
    ring(J.hb[0], J.hb[1], 48, RED, on("s2", "floor", u, 0.05, 0.3), 9);
    tag("REACH", J.hb[0] + 40, FY - 280, RED, on("s2", "reach", u, 0.05, 0.2), 44);
    strain(J.cB[0], J.cB[1], on("s2", "crunches", u, 0.05, 0.3), u, 40);
    tag("SIDE WAIST", 790, 640, RED, on("s2", "side", u, 0.05, 0.2), 40);
    arrow(780, 690, J.cB[0] + 60, J.cB[1] - 20, RED, on("s2", "waist", u, 0.05, 0.4), 11);
    tag("CRUNCH", 790, 920, RED, on("s2", "crunches", u, 0.05, 0.2), 44);
  }
  if (id === "s3") {
    // chest turns down to the mat (shoulders narrow, head drops, top arm falls), then the back rounds
    const Tu = on("s3", "turns", u, 0.05, 0.6), Ro = on("s3", "round", u, 0.4, 0.4);
    floorLine(110, 980, FY, 1);
    const p = { ...TP.force, rot: lerp(0.25, 1, Tu), rnd: lerp(0.35, 1, Ro), ta: lerp(-2.3, -2.75, Tu) };
    const J = tri(PX, FY, p, SC, { body: VIOLET, sideB: RED, sideT: Ro > 0.3 ? RED : VIOLET, arm: RED, armT: Tu > 0.5 ? RED : VIOLET }, { shake: shk(Ro * 0.4) });
    arrow(J.sc[0] + 10, J.sc[1] - 10, J.sc[0] + 10, FY - 40, RED, on("s3", "mat", u, 0.1, 0.4), 12);
    tag("CHEST TO THE MAT", 330, 640, RED, on("s3", "chest", u, 0.05, 0.2), 38);
    ring(J.cT[0], J.cT[1], 58 + 4 * Math.sin(u * 8), RED, on("s3", "back", u, 0.05, 0.3), 9);
    tag("ROUNDED BACK", 760, 780, RED, on("s3", "back", u, 0.05, 0.2), 40);
    cross(830, 960, 42, on("s3", "round", u, 0.05, 0.4));
  }
  if (id === "s4") {
    // the hand comes up from the floor to the shin, then a block slides in and the hand moves onto it
    const Sh = on("s4", "shin", u, 0.7, 0.2), Bl = on("s4", "block", u, 0.35, 0.25);
    floorLine(110, 980, FY, 1);
    const bk = on("s4", "or", u, 0.1, 0.3);
    block(lerp(BX - 260, BX, bk), FY, SC * 1.3, GREEN, bk);
    const p = tp(tp({ ...TP.force, rot: 0.6, rnd: 0.6, ta: -2.5 }, TP.shin, Sh), TP.blk, Bl);
    const J = tri(PX, FY, p, SC, { body: Sh > 0.5 ? GREEN : VIOLET, arm: GREEN });
    ring(J.hb[0], J.hb[1], 46, GREEN, Math.max(on("s4", "shin", u, 0.05, 0.3) * (1 - Bl), Bl), 9);
    tag("SHIN", 330 + 0 * J.hb[0], 980, GREEN, on("s4", "shin", u, 0.05, 0.2) * (1 - Bl * 0.6), 44);
    tag("OR A BLOCK", 760, 700, GREEN, on("s4", "block", u, 0.05, 0.2), 42);
    check(800, 880, 0.5, sm(at("s4", "block") + 0.1, at("s4", "block") + 0.4, u));
  }
  if (id === "s5") {
    // both sides of the waist long: two straight parallel green lines, ruler marks along them
    floorLine(110, 980, FY, 1);
    block(BX, FY, SC * 1.3, GREEN, 1);
    const Lo = on("s5", "long", u, 0.05, 0.4);
    const p = { ...TP.blk, c: 0, ta: -1.75 };
    const J = tri(PX, FY, p, SC, { body: VIOLET, sideB: Lo > 0.3 ? GREEN : VIOLET, sideT: Lo > 0.3 ? GREEN : VIOLET, arm: VIOLET });
    const Bo = on("s5", "both", u, 0.05, 0.4);
    ring(J.cB[0], J.cB[1], 42, GREEN, Bo, 8); ring(J.cT[0], J.cT[1], 42, GREEN, on("s5", "sides", u, 0.05, 0.4), 8);
    const ext = (A0, B0, k) => [lerp(A0[0], B0[0], k), lerp(A0[1], B0[1], k)];
    dashed(ext(J.hipB, J.shB, -0.25), ext(J.hipB, J.shB, 1.25), GREEN, on("s5", "straight", u, 0.05, 0.5), 9);
    dashed(ext(J.hipT, J.shT, -0.25), ext(J.hipT, J.shT, 1.25), GREEN, on("s5", "straight", u, 0.05, 0.5), 9);
    tag("BOTH SIDES LONG", 400, 640, GREEN, on("s5", "long", u, 0.05, 0.2), 40);
    check(810, 880, 0.5, sm(at("s5", "line"), at("s5", "line") + 0.3, u));
  }
  if (id === "s6") {
    // shoulders stack on one vertical line, then the top arm reaches up to the ceiling
    floorLine(110, 980, FY, 1);
    block(BX, FY, SC * 1.3, GREEN, 1);
    const Up = on("s6", "reach", u, 0.05, 0.7);
    const p = { ...TP.blk, ta: lerp(-1.75, -1.30, Up) };
    const J = tri(PX, FY, p, SC, { body: GREEN, armT: Up > 0.4 ? GREEN : VIOLET });
    const St = on("s6", "stack", u, 0.0, 0.4);
    ring(J.shT[0], J.shT[1], 34, GREEN, St, 8); ring(J.shB[0], J.shB[1], 34, GREEN, on("s6", "shoulders", u, 0.05, 0.3), 8);
    dashed([J.hb[0], J.hb[1]], [J.ht[0], J.ht[1]], GREEN, on("s6", "shoulders", u, 0.05, 0.6), 9);
    tag("STACKED", 820, 760, GREEN, on("s6", "shoulders", u, 0.05, 0.2), 42);
    arrow(J.ht[0] + 70, J.ht[1] + 90, J.ht[0] + 70, J.ht[1] - 10, GREEN, on("s6", "ceiling", u, 0.05, 0.35), 11);
    tag("TO THE CEILING", 760, 600, GREEN, on("s6", "ceiling", u, 0.05, 0.2), 38);
    check(820, 920, 0.5, sm(at("s6", "ceiling") + 0.1, at("s6", "ceiling") + 0.4, u));
  }
  if (id === "s7") {
    const s = 0.4, X = CX + 60, Y = 1210;
    block(X - 420 * s, Y, s * 1.3, GREEN, 0.85);
    tri(X, Y, TP.good, s, { body: GREEN }, { a: 0.85 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER FORCE TRIANGLE", "TO THE FLOOR"], RED, 335, 0.0, 1, 130, Math.max(flash(u, 0.05), flash(u, at("s1", "force")))); underline(475, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["SIDE WAIST", "CRUNCHES"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "crunches")) * 0.6);
  if (id === "s3") words(["CHEST DOWN", "BACK ROUNDS"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "round")) * 0.6);
  if (id === "s4") words(["HAND ON SHIN", "OR A BLOCK"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "block")) * 0.6);
  if (id === "s5") words(["BOTH SIDES", "LONG"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "long")) * 0.6);
  if (id === "s6") words(["STACK YOUR", "SHOULDERS"], GREEN, 320, 0.0, 1, 150, flash(u, at("s6", "stack")) * 0.6);
  if (id === "s7") {
    words(["LENGTH FIRST."], ORANGE, 520, 0.0, 1, 150, flash(u, 0.05));
    words(["DEPTH LATER."], ORANGE, 720, at("s7", "depth") - 0.05, 1, 150, flash(u, at("s7", "later")));
    underline(830, 700, sm(at("s7", "later"), at("s7", "later") + 0.4, u), ORANGE);
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = VIOLET; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.arc(0, 0, 120, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = GREEN; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 155, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    person(CX, 560 + 95 * k, P.sit, 0.62 * Math.max(0.01, k), VIOLET);
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}
function frame(t) {
  drawInk(t);
  ink.setTransform(1, 0, 0, 1, 0, 0);
  ink.save(); ink.globalCompositeOperation = "destination-out"; ink.drawImage(grainC, 0, 0); ink.restore();
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.drawImage(boardC, 0, 0);
  out.drawImage(inkC, 0, 0);
  const { u } = sceneOf(t);
  const e = sm(-LEAD, 0.3 - LEAD, u);
  if (e > 0 && e < 1) {
    const ex = lerp(-260, 1340, e), ey = lerp(1250, 600, e);
    out.save();
    const sg = out.createLinearGradient(ex - 700, 0, ex, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0.10)");
    out.fillStyle = sg; out.translate(ex, ey); out.rotate(-0.42); out.fillRect(-700, -110, 700, 220);
    out.fillStyle = "#3b3b46"; out.fillRect(-10, -120, 120, 240); out.fillStyle = "#b07a45"; out.fillRect(60, -120, 70, 240);
    out.restore();
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["triangle-floor-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
