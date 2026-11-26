// pigeon-hip (YogaFlow 47) - CHALKBOARD style (kit from child-pose, YogaFlow 45).
// NEVER LET YOUR HIP HANG IN PIGEON: when the front-leg hip floats off the mat, support it instead of hanging:
// a block or folded blanket under that hip, front foot flexed, hips square to the front; if it is still too much,
// the figure-four stretch lying on the back.
// s1 side view facing left: pigeon, the hip floats high (red gap). s2 drops in, the hip floats above the mat.
// s3 the body tips sideways (shoulders slide), a twist arrow and strain on the front knee. s4 a block slides under the
// hip, the hip settles on it (green). s5 the front foot flexes, a level line through the hips, arrow to the front.
// s6 lying on the back, ankle crossed over the other knee. s7 end card, s8 brand. Time only from hf-seek.
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
function curl(X, Y, r, c, k, w = 12) {   // a twisting arrow around a joint
  if (k <= 0) return;
  const a0 = -Math.PI * 0.2, a1 = a0 + Math.PI * 1.5 * cl(k);
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round";
  x.beginPath(); x.ellipse(X, Y, r, r * 0.45, 0, a0, a1); x.stroke();
  const ex = X + Math.cos(a1) * r, ey = Y + Math.sin(a1) * r * 0.45, A = a1 + Math.PI / 2, h = w * 2.4;
  x.beginPath(); x.moveTo(ex - h * Math.cos(A - 0.6), ey - h * Math.sin(A - 0.6) * 0.6); x.lineTo(ex, ey); x.lineTo(ex - h * Math.cos(A + 0.6), ey - h * Math.sin(A + 0.6) * 0.6); x.stroke();
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
function floorLine(X0, X1, Y, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X0, Y + 3); x.lineTo(X1, Y); x.stroke();
  x.globalAlpha = a * 0.45; x.lineWidth = 6;
  x.beginPath(); x.moveTo(X0 + 10, Y + 34); x.lineTo(X1 - 10, Y + 32); x.stroke();
  x.restore();
}
function block(X, Y, s, c, a = 1, w = 116, h = 82) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 10 * s; x.lineJoin = "round";
  x.fillStyle = "rgba(8,6,34,1)"; rr(X - (w / 2) * s, Y - h * s, w * s, h * s, 10 * s); x.fill(); x.stroke();
  x.globalAlpha = a * 0.5; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(X - (w / 2 - 18) * s, Y - (h - 22) * s); x.lineTo(X + (w / 2 - 18) * s, Y - (h - 22) * s); x.stroke();
  x.restore();
}

// ---------- side view pigeon, facing left. Origin = floor under the hip, y up = negative ----------
// kf = front knee on the floor ahead, ff = front foot under the body (shin across the mat),
// bk/bf = back knee and foot stretched long behind, sh/head = upright torso, e/h = arm with the hand on the floor.
const Q = {};
Q.sit = { head: [-110, -650], sh: [-90, -560], hip: [-10, -150], kf: [-250, -22], ff: [70, -22], bk: [250, -22], bf: [470, -18], e: [-150, -360], h: [-190, -20] };
Q.hang = { head: [-150, -720], sh: [-120, -630], hip: [-30, -260], kf: [-250, -22], ff: [70, -22], bk: [250, -22], bf: [470, -18], e: [-190, -420], h: [-230, -20] };
Q.tip = { head: [-215, -660], sh: [-185, -575], hip: [-50, -240], kf: [-250, -22], ff: [70, -22], bk: [250, -22], bf: [470, -18], e: [-235, -330], h: [-270, -20] };
Q.kneel = { head: [-20, -560], sh: [0, -470], hip: [60, -220], kf: [-90, -22], ff: [180, -18], bk: [160, -22], bf: [400, -18], e: [-80, -280], h: [-150, -20] };
Q.block = { head: [-110, -680], sh: [-90, -590], hip: [-10, -190], kf: [-250, -22], ff: [70, -22], bk: [250, -22], bf: [470, -18], e: [-150, -390], h: [-190, -20] };
function pigeon(X, Y, p, s, color, o = {}) {
  const jit = o.shake || 0;
  const fixed = { kf: 1, ff: 1, bk: 1, bf: 1, h: 1 };
  const br = { head: 1, sh: 1, e: 0.5 };
  const W2 = (j) => [X + p[j][0] * s + (fixed[j] ? 0 : jit), Y + p[j][1] * s - (br[j] || 0) * 6 * s * (0.5 + 0.5 * Math.sin(curU * 2.6))];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const fC = o.front || color, bC = o.backLeg || color;
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(mix(bC, "#24432f", 0.25), 24 * s, off, "hip", "bk", "bf");
    limb(fC, 26 * s, off, "hip", "kf", "ff");
    limb(color, 32 * s, off, "hip", "sh");
    limb(color, 22 * s, off, "sh", "e", "h");
  }
  x.globalAlpha = a;
  // front foot: pointed (lying flat) or flexed (toes pulled up)
  const [fx, fy] = W2("ff"), fl = o.flex || 0;
  x.strokeStyle = o.footC || fC; x.lineWidth = 18 * s;
  x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + lerp(70, 18, fl) * s, fy - lerp(4, 62, fl) * s); x.stroke();
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(hx - 4 * s, hy - 3 * s, 40 * s, Math.PI * 0.9, Math.PI * 2.2); x.stroke();
  x.restore();
  return W2;
}
// lying on the back, figure four: head left, the right foot on the floor, the left ankle crossed over the right knee
function figure4(X, Y, s, color, k, a = 1) {
  const p = {
    head: [-430, -52], sh: [-340, -40], hip: [0, -40], e: [-250, -30], h: [-140, -26],
    kR: [190, -250], fR: [300, -20],
    kL: [lerp(170, 60, k), lerp(-250, -330, k)], fL: [lerp(300, 175, k), lerp(-20, -260, k)],
  };
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s - (j === "sh" || j === "head" ? 4 * s * Math.sin(curU * 2.6) : 0)];
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(mix(color, "#24432f", 0.25), 24 * s, off, "hip", "kR", "fR");
    limb(color, 32 * s, off, "hip", "sh");
    limb(color, 22 * s, off, "sh", "e", "h");
    limb(color, 26 * s, off, "hip", "kL", "fL");
  }
  x.globalAlpha = a;
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.restore();
  return W2;
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

  const FY = 1110, PX = 470, SC = 0.72;   // r2: was 0.85, the head ran into the title   // floor high enough that every tag clears the caption pills (1240+)
  const shk = (k) => k * 5 * Math.sin(u * 47) + k * 3 * Math.sin(u * 71);
  const gap = (J, c, k) => { const [hx, hy] = J("hip"); line2([hx, hy + 24], [hx, FY - 8], c, k, 10); };
  if (id === "s1") {
    // settles into pigeon; the front-leg hip stays high in the air
    const Fo = sm(0.0, 1.0, u), Ai = on("s1", "air", u, 0.05, 0.3);
    floorLine(110, 980, FY, 1);
    const J = pigeon(PX, FY, pose(Q.kneel, Q.hang, Fo), SC, VIOLET, { front: Ai > 0.5 ? RED : VIOLET });
    const [hx, hy] = J("hip");
    tag("PIGEON POSE", 300, 690, VIOLET, on("s1", "pigeon", u, 0.05, 0.2), 44);
    gap(J, RED, on("s1", "hang", u, 0.05, 0.4));
    ring(hx, hy, 58 + 4 * Math.sin(u * 8), RED, on("s1", "hip", u, 0.05, 0.3), 9);
    tag("HIP IN THE AIR", 780, 760, RED, Ai, 42);
  }
  if (id === "s2") {
    // drops into pigeon, the hip floats high off the mat
    const Dr = on("s2", "drop", u, 0.05, 0.6), Fl = on("s2", "floats", u, 0.05, 0.3);
    floorLine(110, 980, FY, 1);
    const J = pigeon(PX, FY, pose(Q.kneel, Q.hang, Dr), SC, VIOLET, { front: RED });
    const [hx, hy] = J("hip");
    gap(J, RED, Fl);
    ring(hx, hy, 58 + 4 * Math.sin(u * 8), RED, Fl, 9);
    tag("FLOATS", hx + 170, hy - 30, RED, Fl, 44);
    tag("OFF THE MAT", hx + 170, FY + 95, RED, on("s2", "mat", u, 0.05, 0.2), 40);
    arrow(hx - 120, FY - 30, hx - 120, hy + 30, RED, on("s2", "high", u, 0.05, 0.4), 12);
  }
  if (id === "s3") {
    // the weight tips sideways; the twist goes into the front knee
    const Ti = on("s3", "sideways", u, 0.1, 0.5), Tw = on("s3", "twist", u, 0.05, 0.6), Kn = on("s3", "knee", u, 0.05, 0.3);
    floorLine(110, 980, FY, 1);
    const J = pigeon(PX, FY, pose(Q.hang, Q.tip, Ti), SC, VIOLET, { front: RED, shake: shk(Kn * 0.7) });
    const [kx, ky] = J("kf"), [sx, sy] = J("sh");
    arrow(sx + 40, sy - 60, sx - 110, sy - 20, RED, on("s3", "weight", u, 0.05, 0.4), 12);
    tag("TIPS SIDEWAYS", 760, 700, RED, on("s3", "sideways", u, 0.05, 0.2), 40);
    curl(kx, ky - 40, 70, RED, Tw, 11);
    strain(kx, ky - 30, Kn, u, 50);
    tag("FRONT KNEE", kx + 60, FY + 95, RED, Kn, 42);
    cross(800, 860, 46, sm(at("s3", "knee") + 0.2, at("s3", "knee") + 0.6, u));
  }
  if (id === "s4") {
    // a block slides under that hip; the hip settles onto it
    const Sl = on("s4", "slide", u, 0.05, 0.9), Dn = on("s4", "under", u, 0.05, 0.5);
    floorLine(110, 980, FY, 1);
    const bx = PX - 10 * SC;
    block(lerp(bx + 460, bx, Sl), FY, SC, GREEN, sm(0.0, 0.2, u), 150, 116);
    const J = pigeon(PX, FY, pose(Q.hang, Q.block, Dn), SC, Dn > 0.5 ? GREEN : VIOLET, { front: Dn > 0.5 ? GREEN : RED });
    const [hx, hy] = J("hip");
    tag("BLOCK", bx + 200, FY + 95, GREEN, on("s4", "block", u, 0.05, 0.2), 44);
    tag("OR A BLANKET", 300, 700, GREEN, on("s4", "blanket", u, 0.05, 0.2), 40);
    arrow(hx + 120, hy - 200, hx + 40, hy - 40, GREEN, on("s4", "hip", u, 0.0, 0.4), 12);
    check(800, 760, 0.55, sm(at("s4", "hip"), at("s4", "hip") + 0.3, u));
  }
  if (id === "s5") {
    // the front foot flexes; a level line through the hips, facing the front
    const Fx = on("s5", "flex", u, 0.05, 0.5), Sq = on("s5", "square", u, 0.05, 0.4);
    floorLine(110, 980, FY, 1);
    block(PX - 10 * SC, FY, SC, GREEN, 1, 150, 116);
    const J = pigeon(PX, FY, Q.block, SC, GREEN, { flex: Fx, footC: Fx > 0.5 ? GREEN : VIOLET });
    const [fx, fy] = J("ff"), [hx, hy] = J("hip");
    ring(fx + 20, fy - 30, 56, GREEN, on("s5", "foot", u, 0.05, 0.3), 9);
    tag("FLEX THE FOOT", fx + 110, FY + 95, GREEN, on("s5", "flex", u, 0.05, 0.2), 40);
    line2([hx - 200, hy], [hx + 200, hy], GREEN, on("s5", "hips", u, 0.05, 0.5), 10);
    arrow(hx - 210, hy - 40, hx - 380, hy - 40, GREEN, Sq, 12);
    tag("HIPS SQUARE", 300, 700, GREEN, Sq, 42);
    check(800, 700, 0.5, sm(at("s5", "front", 2), at("s5", "front", 2) + 0.3, u));
  }
  if (id === "s6") {
    // still too much: lying on the back, the ankle crosses over the other knee
    const Li = on("s6", "lie", u, 0.05, 0.3), Cr = on("s6", "cross", u, 0.05, 0.8);
    floorLine(110, 980, FY, 1);
    const J = figure4(PX + 60, FY, SC, Cr > 0.5 ? GREEN : VIOLET, Cr, Li);
    const [ax, ay] = J("fL");
    tag("TOO MUCH?", 300, 690, ORANGE, on("s6", "still", u, 0.05, 0.2) * (1 - Li), 44);
    tag("ON YOUR BACK", 300, 690, GREEN, on("s6", "back", u, 0.05, 0.2), 42);
    ring(ax, ay, 54, GREEN, on("s6", "ankle", u, 0.05, 0.3), 9);
    tag("ANKLE OVER KNEE", 700, 820, GREEN, on("s6", "ankle", u, 0.05, 0.2), 38);
    check(800, 640, 0.5, sm(at("s6", "knee"), at("s6", "knee") + 0.3, u));
  }
  if (id === "s7") {
    const s = 0.48, X = CX + 40, Y = 1200;   // r2: was 0.7, covered PROTECT THE KNEE
    block(X - 10 * s, Y, s, GREEN, 0.85, 150, 116);
    pigeon(X, Y, Q.block, s, GREEN, { a: 0.85, flex: 1 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER LET YOUR HIP", "HANG IN PIGEON"], RED, 335, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")))); underline(495, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["ONE HIP", "FLOATS"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "floats")) * 0.6);
  if (id === "s3") words(["THE TWIST GOES", "INTO THE KNEE"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "twist")) * 0.6);
  if (id === "s4") words(["A BLOCK UNDER", "THAT HIP"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "block")) * 0.6);
  if (id === "s5") words(["FLEX THE FOOT.", "HIPS SQUARE."], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "square")) * 0.6);
  if (id === "s6") words(["OR LIE", "ON YOUR BACK"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "back")) * 0.6);
  if (id === "s7") {
    words(["SUPPORT THE HIP."], ORANGE, 520, 0.0, 1, 150, flash(u, 0.05));
    words(["PROTECT THE KNEE."], ORANGE, 720, at("s7", "protect") - 0.05, 1, 150, flash(u, at("s7", "knee")));
    underline(830, 700, sm(at("s7", "knee"), at("s7", "knee") + 0.4, u), ORANGE);
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
window.__hf.buildReady["pigeon-hip-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
