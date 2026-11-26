// child-pose (YogaFlow 45) - CHALKBOARD style (kit from lunge-knee, YogaFlow 44).
// NEVER FORCE CHILD'S POSE: when the hips do not reach the heels, support the pose instead of pushing:
// a folded blanket between hips and heels, knees wide so the belly sinks between them, forehead on a block, arms relaxed.
// s1 side view: kneeling upright, folds into child's pose, the hips stay high (red). s2 hips hang in the air, pushed down.
// s3 knees and ankles strain, not restful. s4 a folded blanket slides onto the heels, the hips settle on it (green).
// s5 top view: knees open wide, the belly sinks between them. s6 side: a block under the forehead, arms move back and relax.
// s7 end card, s8 brand. Time only from hf-seek.
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
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function line2(A, B, c, k, w = 12) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.setLineDash([2, 26]);
  x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(lerp(A[0], B[0], cl(k)), lerp(A[1], B[1], cl(k))); x.stroke(); x.restore();
}

// ---------- side view child's pose, facing left. Origin = floor under the heels, y up = negative ----------
// k = knee on the floor (front), a = ankle/heel (back), shins lie on the floor; foot lies flat behind the ankle.
const K = [-230, -24], A = [50, -22];
const Q = {};
Q.kneel = { head: [-185, -700], sh: [-180, -610], hip: [-190, -320], k: K, a: A, e: [-170, -460], h: [-160, -330] };
// tight: folded forward, hips stay high above the heels, head hovering
Q.tight = { head: [-370, -205], sh: [-262, -250], hip: [0, -245], k: K, a: A, e: [-430, -120], h: [-560, -16] };
// pushed down: hips forced lower, everything bunched
Q.push = { head: [-378, -160], sh: [-270, -205], hip: [12, -182], k: K, a: A, e: [-438, -100], h: [-560, -16] };
// hips resting on the blanket on the heels; the head still hovers
Q.blank = { head: [-380, -165], sh: [-265, -178], hip: [25, -150], k: K, a: A, e: [-440, -92], h: [-560, -16] };
// forehead on the block, arms back alongside the legs
// r2: arms stay forward and soften down to the floor (moving them back along the body tangled with the legs)
Q.rest = { head: [-388, -124], sh: [-268, -165], hip: [25, -150], k: K, a: A, e: [-430, -40], h: [-570, -16] };
function childP(X, Y, p, s, color, o = {}) {
  const jit = o.shake || 0;
  const fixed = { k: 1, a: 1 };
  // slow breathing on the upper body so no shot is frozen while the voice talks
  const br = { head: 1, sh: 1, e: 0.5, hip: 0.4 };
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s + (fixed[j] ? 0 : jit * (j === "hip" ? 1 : 0.6)) - (br[j] || 0) * 5 * s * (0.5 + 0.5 * Math.sin(curU * 2.6))];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const legC = o.leg || color, armC = o.arm || color;
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(legC, 26 * s, off, "hip", "k", "a");
    limb(color, 32 * s, off, "hip", "sh");
    limb(armC, 22 * s, off, "sh", "e", "h");
  }
  x.globalAlpha = a;
  const [ax, ay] = W2("a");
  x.strokeStyle = legC; x.lineWidth = 20 * s; x.beginPath(); x.moveTo(ax, ay + 4 * s); x.lineTo(ax + 78 * s, ay + 10 * s); x.stroke();
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(hx - 4 * s, hy - 3 * s, 40 * s, Math.PI * 0.9, Math.PI * 2.2); x.stroke();
  x.restore();
  return W2;
}
function floorLine(X0, X1, Y, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X0, Y + 3); x.lineTo(X1, Y); x.stroke();
  x.globalAlpha = a * 0.45; x.lineWidth = 6;
  x.beginPath(); x.moveTo(X0 + 10, Y + 34); x.lineTo(X1 - 10, Y + 32); x.stroke();
  x.restore();
}
function blanket(X, Y, s, c, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 9 * s; x.lineJoin = "round";
  x.fillStyle = "rgba(8,6,34,1)"; rr(X - 110 * s, Y - 54 * s, 220 * s, 54 * s, 18 * s); x.fill(); x.stroke();
  x.globalAlpha = a * 0.6; x.lineWidth = 6 * s;
  for (const yy of [-36, -18]) { x.beginPath(); x.moveTo(X - 90 * s, Y + yy * s); x.lineTo(X + 94 * s, Y + yy * s); x.stroke(); }
  x.restore();
}
function block(X, Y, s, c, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 10 * s; x.lineJoin = "round";
  x.fillStyle = "rgba(8,6,34,1)"; rr(X - 58 * s, Y - 82 * s, 116 * s, 82 * s, 10 * s); x.fill(); x.stroke();
  x.globalAlpha = a * 0.5; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(X - 40 * s, Y - 60 * s); x.lineTo(X + 40 * s, Y - 60 * s); x.stroke();
  x.restore();
}

// ---------- top view (s5): looking down on child's pose, head up the screen ----------
function topView(Wd, sinkK, color, legC) {
  const shY = 690, hipY = 960, kneeY = 800;
  x.save(); x.lineCap = "round"; x.lineJoin = "round";
  // mat
  x.globalAlpha = 0.45; x.strokeStyle = VIOLET; x.lineWidth = 8; rr(CX - 260, 500, 520, 640, 18); x.stroke();
  x.globalAlpha = 1;
  const br = 4 * Math.sin(curU * 2.6);
  // shins + feet (big toes together behind the hips)
  for (const sd of [-1, 1]) {
    x.strokeStyle = legC; x.lineWidth = 26;
    x.beginPath(); x.moveTo(CX + sd * Wd, kneeY); x.lineTo(CX + sd * 34, 1050); x.lineTo(CX + sd * 16, 1095); x.stroke();
  }
  // torso: on top of the thighs when the knees are together, sinking between them when wide
  const tw = lerp(170, 130, sinkK);
  x.fillStyle = "rgba(8,6,34,1)"; rr(CX - tw / 2, shY - 20 + br, tw, hipY - shY + 30, 60); x.fill();
  // thighs drawn over the torso edge once the belly sinks between them
  const thighs = () => { for (const sd of [-1, 1]) { x.strokeStyle = legC; x.lineWidth = 30; x.beginPath(); x.moveTo(CX + sd * 50, hipY); x.lineTo(CX + sd * Wd, kneeY); x.stroke(); } };
  if (sinkK < 0.5) thighs();
  x.strokeStyle = color; x.lineWidth = 12; rr(CX - tw / 2, shY - 20 + br, tw, hipY - shY + 30, 60); x.stroke();
  if (sinkK >= 0.5) thighs();
  // arms forward past the head, head between them
  for (const sd of [-1, 1]) { x.strokeStyle = color; x.lineWidth = 22; x.beginPath(); x.moveTo(CX + sd * 70, shY + br); x.lineTo(CX + sd * 66, 545); x.stroke(); }
  x.strokeStyle = color; x.lineWidth = 14; x.beginPath(); x.arc(CX, 630 + br, 44, 0, Math.PI * 2); x.stroke();
  x.restore();
  return { knee: (sd) => [CX + sd * Wd, kneeY], belly: [CX, 830 + br] };
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

  const FY = 1110, PX = 610, SC = 0.85;   // floor high enough that every tag clears the caption pills (1240+)
  const shk = (k) => k * 5 * Math.sin(u * 47) + k * 3 * Math.sin(u * 71);
  if (id === "s1") {
    // kneeling upright, folds forward into child's pose; the hips stay high; at "force" a push down on the hips
    const Fo = sm(0.15, 1.3, u), Fc = on("s1", "force", u, 0.05, 0.35);
    floorLine(140, 960, FY, 1);
    const J = childP(PX, FY, pose(pose(Q.kneel, Q.tight, Fo), Q.push, Fc * 0.4), SC, VIOLET, { leg: Fc > 0.5 ? RED : VIOLET, shake: shk(Fc * 0.6) });
    const [hx, hy] = J("hip"), [ax, ay] = J("a");
    tag("CHILD'S POSE", 300, 690, VIOLET, on("s1", "pose", u, 0.05, 0.2), 44);
    tag("TIGHT", 820, 760, RED, on("s1", "tight", u, 0.05, 0.2), 46);
    arrow(hx, hy - 220, hx, hy - 40, RED, Fc, 14);
    line2([hx, hy + 20], [ax - 10, ay - 30], RED, on("s1", "heels", u, 0.05, 0.3), 10);
    ring(ax, ay, 46, RED, on("s1", "heels", u, 0.05, 0.3), 9);
    tag("HEELS", ax + 120, FY + 95, RED, on("s1", "heels", u, 0.05, 0.2), 42);
  }
  if (id === "s2") {
    // hips hang in the air above the heels, then they get pushed down anyway
    const Pu = on("s2", "push", u, 0.05, 0.4);
    floorLine(140, 960, FY, 1);
    const J = childP(PX, FY, pose(Q.tight, Q.push, Pu), SC, VIOLET, { leg: RED, shake: shk(Pu * 0.8) });
    const [hx, hy] = J("hip"), [ax, ay] = J("a");
    const Ai = on("s2", "air", u, 0.05, 0.3);
    line2([hx, hy + 20], [ax - 10, ay - 30], RED, on("s2", "hang", u, 0.05, 0.4), 10);
    tag("GAP", hx + 150, (hy + ay) / 2, RED, on("s2", "hang", u, 0.05, 0.2), 44);
    ring(hx, hy, 60 + 4 * Math.sin(u * 8), RED, Ai, 9);
    tag("HIPS IN THE AIR", 330, 700, RED, Ai, 40);
    arrow(hx, hy - 240, hx, hy - 50, RED, Pu, 14);
    arrow(hx + 50, hy - 240, hx + 50, hy - 50, RED, on("s2", "them", u, 0.05, 0.4), 14);
    tag("PUSH", 820, 720, RED, Pu, 46);
  }
  if (id === "s3") {
    // knees and ankles strain; not restful
    floorLine(140, 960, FY, 1);
    const Co = on("s3", "complain", u, 0.1, 0.2);
    const J = childP(PX, FY, Q.push, SC, VIOLET, { leg: RED, shake: shk(Co * 0.7) });
    const [kx, ky] = J("k"), [ax, ay] = J("a");
    strain(kx, ky, on("s3", "knees", u, 0.05, 0.3), u, 44);
    tag("KNEES", kx + 40, FY + 95, RED, on("s3", "knees", u, 0.05, 0.2), 42);
    strain(ax, ay, on("s3", "ankles", u, 0.05, 0.3), u, 44);
    tag("ANKLES", ax + 120, FY + 95, RED, on("s3", "ankles", u, 0.05, 0.2), 42);
    const Re = on("s3", "restful", u, 0.05, 0.2);
    tag("NOT RESTFUL", 330, 700, RED, on("s3", "stops", u, 0.05, 0.2), 42);
    cross(800, 720, 46, Re);
  }
  if (id === "s4") {
    // a folded blanket slides onto the heels, the hips settle onto it
    const Sl = on("s4", "tuck", u, 0.05, 0.9);
    const Dn = on("s4", "hips", u, 0.05, 0.5);
    floorLine(140, 960, FY, 1);
    const bx = PX + 20 * SC;
    blanket(lerp(bx + 420, bx, Sl), FY - 44 * SC, SC, GREEN, sm(0.0, 0.2, u));
    const J = childP(PX, FY, pose(Q.tight, Q.blank, Dn), SC, Dn > 0.5 ? GREEN : VIOLET);
    const [hx, hy] = J("hip");
    tag("FOLDED BLANKET", 330, 700, GREEN, on("s4", "blanket", u, 0.05, 0.2), 40);
    arrow(hx, hy - 200, hx, hy - 50, GREEN, on("s4", "hips", u, 0.0, 0.4), 12);
    tag("HIPS", hx - 140, hy - 120, GREEN, on("s4", "hips", u, 0.05, 0.2), 42);
    tag("HEELS", bx + 120, FY + 95, GREEN, on("s4", "heels", u, 0.05, 0.2), 42);
    check(820, 760, 0.55, sm(at("s4", "heels"), at("s4", "heels") + 0.3, u));
  }
  if (id === "s5") {
    // top view: the knees open wide and the belly sinks between them
    const Op = on("s5", "open", u, 0.05, 0.9);
    const Sk = on("s5", "sink", u, 0.05, 0.4);
    const Wd = lerp(62, 230, Op);
    const T = topView(Wd, Sk, Sk > 0.5 ? GREEN : VIOLET, Op > 0.5 ? GREEN : VIOLET);
    const Wi = on("s5", "wide", u, 0.0, 0.35);
    for (const sd of [-1, 1]) { const [kx, ky] = T.knee(sd); arrow(kx - sd * 10, ky, kx + sd * 90, ky, GREEN, Wi, 12); }
    tag("KNEES WIDE", 510, 1195, GREEN, on("s5", "wide", u, 0.05, 0.2), 44);
    ring(T.belly[0], T.belly[1], 80, GREEN, on("s5", "belly", u, 0.05, 0.3), 9);
    tag("BELLY SINKS", 800, 560, GREEN, on("s5", "sink", u, 0.05, 0.2), 38);
    check(230, 600, 0.5, sm(at("s5", "between"), at("s5", "between") + 0.3, u));
  }
  if (id === "s6") {
    // a block comes up under the forehead, then the arms move back and relax
    const Bl = on("s6", "forehead", u, 0.1, 0.6);
    const Dn = on("s6", "block", u, 0.05, 0.4);
    const Ar = on("s6", "arms", u, 0.05, 0.6);
    floorLine(140, 960, FY, 1);
    blanket(PX + 20 * SC, FY - 44 * SC, SC, GREEN, 1);
    const bkx = PX - 388 * SC;
    block(lerp(bkx - 300, bkx, Bl), FY, SC, GREEN, Bl);
    const head = pose(Q.blank, Q.rest, Dn);
    const p = { ...head, e: Q.blank.e, h: Q.blank.h };
    const pp = pose(p, { ...head, e: Q.rest.e, h: Q.rest.h }, Ar);
    const J = childP(PX, FY, pp, SC, GREEN);
    const [hx, hy] = J("head"), [ex, ey] = J("e");
    ring(ex, ey, 52, GREEN, on("s6", "relax", u, 0.05, 0.3), 8);
    tag("BLOCK", bkx, FY + 95, GREEN, on("s6", "block", u, 0.05, 0.2), 44);
    ring(hx, hy, 66, GREEN, on("s6", "forehead", u, 0.05, 0.3), 9);
    tag("FOREHEAD", 300, 760, GREEN, on("s6", "forehead", u, 0.05, 0.2), 42);
    tag("ARMS RELAX", 780, 760, GREEN, on("s6", "relax", u, 0.05, 0.2), 40);
    check(800, 620, 0.5, sm(at("s6", "relax"), at("s6", "relax") + 0.3, u));
  }
  if (id === "s7") {
    const s = 0.75, X = CX + 120, Y = 1180;   // r2: was 0.5, too small to read behind the card
    blanket(X + 20 * s, Y - 44 * s, s, GREEN, 0.85);
    block(X - 388 * s, Y, s, GREEN, 0.85);
    childP(X, Y, Q.rest, s, GREEN, { a: 0.85 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER FORCE", "CHILD'S POSE"], RED, 335, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "force")))); underline(495, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["HIPS IN", "THE AIR"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "push")) * 0.6);
  if (id === "s3") words(["KNEES AND ANKLES", "COMPLAIN"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "complain")) * 0.6);
  if (id === "s4") words(["BLANKET BETWEEN", "HIPS AND HEELS"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "blanket")) * 0.6);
  if (id === "s5") words(["OPEN YOUR", "KNEES WIDE"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "wide")) * 0.6);
  if (id === "s6") words(["FOREHEAD", "ON A BLOCK"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "block")) * 0.6);
  if (id === "s7") {
    words(["SUPPORT THE POSE."], ORANGE, 520, 0.0, 1, 150, flash(u, 0.05));
    words(["THEN REST."], ORANGE, 720, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "rest")));
    underline(830, 700, sm(at("s7", "rest"), at("s7", "rest") + 0.4, u), ORANGE);
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
window.__hf.buildReady["child-pose-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
