// lunge-knee (YogaFlow 44) - CHALKBOARD style (kit from chaturanga-elbows, YogaFlow 43).
// NEVER KNEEL ON A BARE KNEE: in a low lunge on a hard floor, pad the back knee (fold the mat end or a folded blanket)
// and set the knee a little behind the hip so you rest just above the kneecap.
// s1 side view: low lunge sinks, back knee drops onto the bare floor (red). s2 kneecap on the hard floor, nothing under it.
// s3 it presses and aches, she rushes out of the pose. s4 the mat end folds under the back knee (green).
// s5 or a folded blanket slides under it. s6 the knee moves a little behind the hip, rest just above the kneecap.
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

// ---------- side view low lunge, facing left. Origin = floor under the hip, y up = negative ----------
// L = front leg (left of picture, foot flat, shin vertical), R = back leg (knee down, top of the foot on the floor).
const Q = {};
Q.high = { head: [-30, -655], sh: [-18, -560], hip: [0, -255], kL: [-215, -250], fL: [-245, 0], kR: [40, -78], fR: [300, -6], eL: [-80, -420], hL: [-185, -300], eR: [-60, -428], hR: [-168, -306] };
Q.mid = { head: [-30, -630], sh: [-18, -535], hip: [0, -232], kL: [-222, -232], fL: [-245, 0], kR: [30, -48], fR: [300, -6], eL: [-80, -396], hL: [-190, -284], eR: [-60, -404], hR: [-172, -290] };
// knee straight down on the bare floor, right under the hip
Q.low = { head: [-30, -598], sh: [-18, -503], hip: [0, -200], kL: [-230, -210], fL: [-250, 0], kR: [15, 0], fR: [300, -6], eL: [-82, -368], hL: [-195, -262], eR: [-62, -376], hR: [-178, -268] };
// rushing out: hips up, back knee lifted off the floor
Q.out = { head: [-40, -660], sh: [-28, -565], hip: [10, -275], kL: [-205, -262], fL: [-245, 0], kR: [70, -112], fR: [300, -6], eL: [-60, -430], hL: [-150, -330], eR: [-40, -436], hR: [-132, -336] };
const PAD = 64; // knee centre height on the folded mat (two 24px layers + the limb half width)
const onPad = (p, h, dx = 0) => ({ ...p, kR: [p.kR[0] + dx, p.kR[1] - h], fR: [p.fR[0] + dx, p.fR[1]] });
function lungeP(X, Y, p, s, color, o = {}) {
  const jit = o.shake || 0;
  const fixed = { fL: 1, fR: 1 };
  // r2: slow breathing on the upper body so no shot is frozen while the voice talks
  const br = { head: 1, sh: 1, eL: 0.8, eR: 0.8, hL: 0.4, hR: 0.4, hip: 0.5 };
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s + (fixed[j] ? 0 : (j === "kR" ? jit * 0.3 : jit)) + (br[j] || 0) * 6 * s * Math.sin(curU * 2.6)];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const far = mix(color, "#24432f", 0.4);
  const backC = o.back || color;
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(far, 22 * s, off, "sh", "eR", "hR");
    limb(backC, 24 * s, off, "hip", "kR", "fR");
    limb(color, 30 * s, off, "sh", "hip");
    limb(color, 24 * s, off, "hip", "kL", "fL");
    limb(color, 22 * s, off, "sh", "eL", "hL");
  }
  x.globalAlpha = a;
  // feet: front foot flat forward, back foot lying flat behind
  const [flx, fly] = W2("fL"), [frx, fry] = W2("fR");
  x.strokeStyle = color; x.lineWidth = 20 * s; x.beginPath(); x.moveTo(flx + 6 * s, fly - 4 * s); x.lineTo(flx - 70 * s, fly - 2 * s); x.stroke();
  x.strokeStyle = backC; x.beginPath(); x.moveTo(frx, fry); x.lineTo(frx + 60 * s, fry + 2 * s); x.stroke();
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(hx - 4 * s, hy - 3 * s, 40 * s, Math.PI * 0.9, Math.PI * 2.2); x.stroke();
  // kneecap (front of the back knee)
  if (o.cap) {
    const [kx, ky] = W2("kR");
    x.globalAlpha = a; x.fillStyle = o.cap; x.beginPath(); x.ellipse(kx - 12 * s, ky - 10 * s, 13 * s, 11 * s, 0, 0, Math.PI * 2); x.fill();
  }
  x.restore();
  return W2;
}
function floorBoards(X0, X1, Y, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X0, Y + 3); x.lineTo(X1, Y); x.stroke();
  x.globalAlpha = a * 0.45; x.lineWidth = 6;
  x.beginPath(); x.moveTo(X0 + 10, Y + 34); x.lineTo(X1 - 10, Y + 32); x.stroke();
  for (let i = 0; i < 7; i++) { const xx = X0 + 70 + i * ((X1 - X0 - 140) / 6) + (i % 2) * 30; x.beginPath(); x.moveTo(xx, Y + 8); x.lineTo(xx, Y + 30); x.stroke(); }
  x.restore();
}
// yoga mat seen from the side; the back end (from the hinge) folds over on top, k = 0 flat, 1 folded
function matSide(X, Y, s, k, c, a = 1) {
  // r2: a thick band (was a 12px line that did not read as a mat), fold clearly two layers
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 24 * s; x.lineCap = "round";
  const L = X - 430 * s, H = X + 150 * s, E = 260 * s, Y0 = Y - 12 * s;
  x.beginPath(); x.moveTo(L, Y0); x.lineTo(H, Y0); x.stroke();
  const th = Math.PI * cl(k);
  const flap = () => { x.beginPath(); x.moveTo(H, Y0); for (let i = 1; i <= 16; i++) { const d = (E * i) / 16; x.lineTo(H + d * Math.cos(th), Y0 - d * Math.sin(th) - 26 * s * cl(k)); } x.stroke(); };
  flap();
  // r3: no dark inner stroke (it split the band into two thin lines on the sheets)
  if (k > 0.9) { x.lineWidth = 10 * s; x.beginPath(); x.arc(H + 6 * s, Y0 - 13 * s, 14 * s, -Math.PI / 2, Math.PI / 2); x.stroke(); }
  x.restore();
}
function blanket(X, Y, s, c, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 9 * s; x.lineJoin = "round";
  rr(X - 120 * s, Y - 54 * s, 240 * s, 54 * s, 18 * s); x.stroke();
  x.globalAlpha = a * 0.6; x.lineWidth = 6 * s;
  for (const yy of [-36, -18]) { x.beginPath(); x.moveTo(X - 100 * s, Y + yy * s); x.lineTo(X + 104 * s, Y + yy * s); x.stroke(); }
  x.restore();
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

  const FY = 1110, PX = 540, SC = 0.85;   // floor high enough that every tag clears the caption pills (1240+)
  const shk = (k) => k * 5 * Math.sin(u * 47) + k * 3 * Math.sin(u * 71);
  if (id === "s1") {
    // the lunge sinks; at "drop" the back knee lands on the bare hard floor
    const Sk = sm(0.1, 1.4, u), Dr = on("s1", "drop", u, 0.05, 0.35);
    floorBoards(140, 960, FY, 1);
    const J = lungeP(PX, FY, pose(pose(Q.high, Q.mid, Sk), Q.low, Dr), SC, VIOLET, { back: Dr > 0.5 ? RED : VIOLET, cap: on("s1", "bare", u, 0.05, 0.2) > 0 ? RED : null });
    const [kx, ky] = J("kR");
    tag("LOW LUNGE", 290, 690, VIOLET, on("s1", "lunge", u, 0.05, 0.2), 44);
    tag("HARD FLOOR", 300, FY + 95, VIOLET, on("s1", "hard", u, 0.05, 0.2), 42);
    arrow(kx + 150, ky - 230, kx + 30, ky - 70, RED, on("s1", "drop", u, 0.0, 0.3), 12);
    ring(kx - 12, ky - 10, 58, RED, on("s1", "kneecap", u, 0.05, 0.3), 9);
    tag("BARE KNEE", 790, FY + 95, RED, on("s1", "bare", u, 0.05, 0.2), 42);
  }
  if (id === "s2") {
    // kneecap right on the hard floor, nothing under it
    floorBoards(140, 960, FY, 1);
    const J = lungeP(PX, FY, Q.low, SC, VIOLET, { back: RED, cap: RED });
    const [kx, ky] = J("kR");
    ring(kx - 12, ky - 10, 58 + 4 * Math.sin(u * 8), RED, on("s2", "kneecap", u, 0.05, 0.3), 9);
    tag("KNEECAP", 800, 860, RED, on("s2", "kneecap", u), 44);
    arrow(800, 900, kx + 30, ky - 50, RED, on("s2", "kneecap", u, 0.0, 0.35), 12);
    const Fl = on("s2", "floor", u, 0.05, 0.3);
    line2([kx - 120, FY + 18], [kx + 110, FY + 18], RED, Fl, 10);
    const No = on("s2", "nothing", u, 0.05, 0.3);
    cross(kx - 10, FY + 80, 30, No);
    tag("NOTHING UNDER IT", 300, 690, RED, No, 38);
  }
  if (id === "s3") {
    // it presses and aches, then she rushes out of the pose
    const Ru = on("s3", "rush", u, 0.05, 0.3);
    const Ak = on("s3", "presses", u, 0.1, 0.3) * (1 - Ru);
    floorBoards(140, 960, FY, 1);
    const J = lungeP(PX, FY, pose(Q.low, Q.out, Ru), SC, VIOLET, { back: RED, cap: RED, shake: shk(on("s3", "aches", u, 0.1, 0.2) * (1 - Ru)) });
    const [kx, ky] = J("kR");
    strain(kx - 12, ky - 10, Ak, u, 48);
    tag("PRESSES", 300, 760, RED, on("s3", "presses", u, 0.05, 0.2) * (1 - Ru), 44);
    tag("ACHES", 800, 780, RED, on("s3", "aches", u, 0.05, 0.2) * (1 - Ru), 46);
    arrow(kx + 10, ky - 120, kx + 10, ky - 260, RED, Ru, 12);
    tag("OUT OF THE POSE", 820, 760, RED, on("s3", "out", u, 0.05, 0.2), 36);
    cross(820, 900, 46, on("s3", "pose", u, 0.05, 0.4));
  }
  if (id === "s4") {
    // the back end of the mat folds over under the back knee
    const Mi = sm(0.0, 0.35, u);
    const Fo = on("s4", "fold", u, 0.05, 0.9);
    const Lf = sm(0.0, 0.3, u) * (1 - on("s4", "back", u, 0.05, 0.35));
    const Dn = on("s4", "back", u, 0.05, 0.35);
    floorBoards(140, 960, FY, 1);
    matSide(PX, FY, SC, Fo, GREEN, Mi);
    const p = Dn > 0 ? onPad(Q.low, lerp(110, PAD, Dn)) : onPad(Q.low, 110 * Lf);
    const J = lungeP(PX, FY, p, SC, Dn > 0.5 ? GREEN : VIOLET, { cap: Dn > 0.5 ? GREEN : null });
    const [kx, ky] = J("kR");
    tag("MAT", 860, FY + 95, GREEN, Mi, 42);
    arrow(PX + 400, FY - 170, PX + 200, FY - 120, GREEN, on("s4", "fold", u, 0.0, 0.3), 12);
    tag("FOLD THE MAT", 330, 700, GREEN, on("s4", "fold", u, 0.05, 0.2), 44);
    ring(kx - 12, ky - 10, 58, GREEN, Dn, 9);
    check(800, 760, 0.55, sm(at("s4", "knee") + 0.05, at("s4", "knee") + 0.35, u));
  }
  if (id === "s5") {
    // or: a folded blanket slides in under the back knee
    const Sl = on("s5", "slide", u, 0.05, 0.75);
    const Up = sm(0.0, 0.3, u) * (1 - on("s5", "under", u, 0.05, 0.35));
    const Dn = on("s5", "under", u, 0.05, 0.35);
    floorBoards(140, 960, FY, 1);
    const kx0 = PX + 15 * SC;
    blanket(lerp(kx0 + 460, kx0 - 10, Sl), FY, SC, GREEN, sm(0.0, 0.2, u));
    const h = Dn > 0 ? lerp(90, 54, Dn) : 90 * Up;
    const J = lungeP(PX, FY, onPad(Q.low, h), SC, Dn > 0.5 ? GREEN : VIOLET, { cap: Dn > 0.5 ? GREEN : null });
    const [kx, ky] = J("kR");
    tag("FOLDED BLANKET", 300, 690, GREEN, on("s5", "blanket", u, 0.05, 0.2), 40);
    tag("EXTRA PADDING", 600, FY + 95, GREEN, on("s5", "padding", u, 0.05, 0.2), 42);
    check(820, 840, 0.55, sm(at("s5", "padding"), at("s5", "padding") + 0.3, u));
  }
  if (id === "s6") {
    // the knee moves a little behind the hip; she rests just above the kneecap
    const Bh = on("s6", "behind", u, 0.05, 0.5);
    const Ab = on("s6", "above", u, 0.05, 0.3);
    floorBoards(140, 960, FY, 1);
    matSide(PX, FY, SC, 1, GREEN, 1);
    const p = onPad(Q.low, PAD, 85 * Bh);
    const J = lungeP(PX, FY, p, SC, GREEN);
    const [hx, hy] = J("hip"), [kx, ky] = J("kR");
    line2([hx, hy], [hx, FY - 10], VIOLET, on("s6", "hip", u, 0.1, 0.35), 10);
    tag("HIP", hx - 110, hy - 40, VIOLET, on("s6", "hip", u, 0.05, 0.2), 40);
    arrow(kx - 60, FY + 70, kx + 40, FY + 70, GREEN, on("s6", "behind", u, 0.0, 0.4), 12);
    tag("BEHIND THE HIP", 770, 700, GREEN, on("s6", "behind", u, 0.05, 0.2), 40);
    const tx = lerp(kx, hx, 0.2), ty = lerp(ky, hy, 0.2);
    ring(tx, ty, 44, GREEN, Ab, 9);
    tag("ABOVE KNEECAP", 800, 830, GREEN, Ab, 38);
    check(290, 760, 0.5, sm(at("s6", "kneecap"), at("s6", "kneecap") + 0.3, u));
  }
  if (id === "s7") {
    matSide(CX + 20, 1190, 0.45, 1, GREEN, 0.85);
    lungeP(CX + 20, 1190, onPad(Q.low, PAD, 85), 0.45, GREEN, { a: 0.85 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER KNEEL ON", "A BARE KNEE"], RED, 335, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "bare")))); underline(495,760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["BARE KNEE,", "HARD FLOOR"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "nothing")) * 0.6);
  if (id === "s3") words(["IT PRESSES", "AND ACHES"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "aches")) * 0.6);
  if (id === "s4") words(["FOLD THE MAT", "UNDER IT"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "fold")) * 0.6);
  if (id === "s5") words(["OR A FOLDED", "BLANKET"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "blanket")) * 0.6);
  if (id === "s6") words(["KNEE BEHIND", "YOUR HIP"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "behind")) * 0.6);
  if (id === "s7") {
    words(["PAD THE KNEE."], ORANGE, 520, 0.0, 1, 150, flash(u, 0.05));
    words(["THEN SINK IN."], ORANGE, 720, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "sink")));
    underline(830, 700, sm(at("s7", "sink"), at("s7", "sink") + 0.4, u), ORANGE);
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
window.__hf.buildReady["lunge-knee-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
