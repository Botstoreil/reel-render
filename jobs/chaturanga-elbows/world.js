// chaturanga-elbows (YogaFlow 43) - CHALKBOARD style (kit from plank-hips, YogaFlow 38).
// NEVER FLARE YOUR ELBOWS: lowering from plank, hug the elbows in toward the ribs, point them back, stop halfway;
// too hard -> knees down first, elbows still in.
// s1 side view plank lowers, then TOP VIEW: elbows flare out (red). s2 elbows out to the sides, shoulders loaded.
// s3 shoulder front squeezed, the body shakes. s4 top view: elbows hug in to the ribs (green). s5 side view: elbows
// point back, stop halfway (line at elbow height). s6 knees down, then lower with elbows in. s7 end card, s8 brand.
// Time only from hf-seek.
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

// ---------- side view: head left, hands under the shoulders in plank. Origin = floor under the hands, y up = negative ----------
const Q = {};
Q.plank = { head: [-338, -222], sh: [-260, -200], eL: [-262, -100], hL: [-262, 0], eR: [-246, -100], hR: [-246, 0], hip: [60, -109], kL: [220, -63], fL: [372, -18], kR: [232, -61], fR: [384, -16] };
// halfway down (chaturanga): shoulders forward and down to elbow height, elbows bent and pointing back toward the feet
Q.low = { head: [-372, -118], sh: [-300, -98], eL: [-196, -100], hL: [-262, 0], eR: [-182, -100], hR: [-246, 0], hip: [40, -66], kL: [216, -40], fL: [372, -18], kR: [228, -38], fR: [384, -16] };
// knees on the mat, body straight from head to knees
Q.knees = { head: [-338, -226], sh: [-260, -200], eL: [-262, -100], hL: [-262, 0], eR: [-246, -100], hR: [-246, 0], hip: [40, -74], kL: [196, -12], fL: [330, -70], kR: [208, -12], fR: [342, -68] };
Q.kneesLow = { head: [-372, -112], sh: [-300, -92], eL: [-196, -96], hL: [-262, 0], eR: [-182, -96], hR: [-246, 0], hip: [30, -46], kL: [196, -12], fL: [330, -70], kR: [208, -12], fR: [342, -68] };
function plankP(X, Y, p, s, color, o = {}) {
  const jit = o.shake ? o.shake : 0;
  const fixed = { hL: 1, hR: 1, fL: 1, fR: 1, kL: 0, kR: 0 };
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s + (fixed[j] ? 0 : jit)];
  const a = o.a ?? 1;
  const arm = o.arm || color;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const far = mix(color, "#24432f", 0.4);
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(mix(arm, "#24432f", 0.4), 22 * s, off, "sh", "eR", "hR"); limb(far, 22 * s, off, "hip", "kR", "fR");
    limb(color, 30 * s, off, "sh", "hip");
    limb(color, 22 * s, off, "hip", "kL", "fL"); limb(arm, 22 * s, off, "sh", "eL", "hL");
  }
  x.globalAlpha = a;
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(hx + 4 * s, hy - 3 * s, 40 * s, 0.4, Math.PI * 1.7); x.stroke();
  x.restore();
  return W2;
}
function mat(X, Y, w, a = 1, c = VIOLET) {
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X - w / 2, Y + 4); x.lineTo(X + w / 2, Y); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.moveTo(X - w / 2 + 10, Y + 20); x.lineTo(X + w / 2 - 6, Y + 17); x.stroke(); x.restore();
}

// ---------- top view (camera above, head at the top): k = 0 elbows hugging the ribs, 1 = elbows flared out ----------
function topP(X, Y, k, s, color, o = {}) {
  const a = o.a ?? 1, jit = o.shake || 0, arm = o.arm || color;
  const P = (dx, dy) => [X + dx * s, Y + dy * s];
  const J = {
    head: P(0, -92), shL: P(-86, 0), shR: P(86, 0),
    hL: P(-112, 96), hR: P(112, 96),
    eL: P(lerp(-104, -236, k), lerp(176, 70, k) + jit), eR: P(lerp(104, 236, k), lerp(176, 70, k) - jit),
    hip: P(0, 290), fL: P(-34, 560), fR: P(34, 560),
  };
  J.shL[1] += jit * 0.6; J.shR[1] -= jit * 0.6;
  if (o.mat !== false) {
    x.save(); x.globalAlpha = a * 0.6; x.strokeStyle = o.matC || VIOLET; x.lineWidth = 7;
    rr(X - 290 * s, Y - 170 * s, 580 * s, 790 * s, 18 * s); x.stroke(); x.restore();
  }
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const seg = (c, w, ...ps) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); ps.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.stroke(); };
  // legs
  seg(color, 24 * s, P(-36, 280), J.fL); seg(color, 24 * s, P(36, 280), J.fR);
  // torso outline (seen from above)
  x.strokeStyle = color; x.lineWidth = 14 * s; rr(X - 86 * s, Y - 18 * s + jit * 0.6, 172 * s, 316 * s, 64 * s); x.stroke();
  x.globalAlpha = a * 0.45; x.lineWidth = 8 * s; x.beginPath(); x.moveTo(X, Y + 20 * s); x.lineTo(X, Y + 250 * s); x.stroke(); x.globalAlpha = a;
  // arms: shoulder -> elbow -> hand
  seg(arm, 24 * s, J.shL, J.eL, J.hL); seg(arm, 24 * s, J.shR, J.eR, J.hR);
  x.fillStyle = arm;
  for (const h of [J.hL, J.hR]) { x.beginPath(); x.ellipse(h[0], h[1], 22 * s, 30 * s, 0, 0, Math.PI * 2); x.fill(); }
  for (const e of [J.eL, J.eR]) { x.beginPath(); x.arc(e[0], e[1], 15 * s, 0, Math.PI * 2); x.fill(); }
  // head (top of the head, hair line)
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(J.head[0], J.head[1], 46 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(J.head[0], J.head[1] + 4 * s, 30 * s, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
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

  const FY = 1170, PX = 520, SC = 1.05;   // side view
  const TX = CX, TY = 640, TS = 1.0;      // top view
  const shk = (k) => k * 5 * Math.sin(u * 47) + k * 3 * Math.sin(u * 71);
  if (id === "s1") {
    // side view: plank lowers; at "never" cut to the top view and the elbows flare out
    const Nv = at("s1", "never");
    if (u < Nv - 0.05) {
      const Lo = on("s1", "lowering", u, 0.0, 0.9);
      mat(PX, FY, 760, 1);
      plankP(PX, FY, pose(Q.plank, Q.low, Lo), SC, VIOLET);
      tag("LOWERING", 300, 800, VIOLET, on("s1", "lowering", u, 0.05, 0.2), 46);
    } else {
      const Fl = on("s1", "flare", u, 0.1, 0.35);
      const J = topP(TX, TY, Fl, TS, VIOLET, { arm: Fl > 0.4 ? RED : VIOLET });
      tag("TOP VIEW", 250, 1020, VIOLET, sm(Nv, Nv + 0.2, u), 40);
      arrow(J.eR[0] - 40, J.eR[1] + 60, J.eR[0] + 110, J.eR[1] + 20, RED, on("s1", "flare", u, 0.0, 0.3), 12);
      arrow(J.eL[0] + 40, J.eL[1] + 60, J.eL[0] - 110, J.eL[1] + 20, RED, on("s1", "flare", u, 0.0, 0.3), 12);
      tag("ELBOWS OUT", 760, 1080, RED, on("s1", "out", u), 42);
    }
  }
  if (id === "s2") {
    // top view, elbows wide to the sides; the weight lands in the shoulders
    const J = topP(TX, TY, 1, TS, VIOLET, { arm: RED });
    const Sd = on("s2", "sides", u, 0.05, 0.3), Sh = on("s2", "shoulders", u, 0.05, 0.3), Wt = on("s2", "weight", u, 0.05, 0.3);
    line2([J.eL[0] - 30, J.eL[1]], [J.eR[0] + 30, J.eR[1]], RED, Sd, 10);
    tag("TO THE SIDES", 760, 1000, RED, Sd, 40);
    ring(J.shL[0], J.shL[1], 50 + 4 * Math.sin(u * 8), RED, Sh, 9);
    ring(J.shR[0], J.shR[1], 50 + 4 * Math.sin(u * 8), RED, Sh, 9);
    arrow(J.shR[0] + 150, J.shR[1] - 150, J.shR[0] + 40, J.shR[1] - 40, RED, Wt, 12);
    arrow(J.shL[0] - 150, J.shL[1] - 150, J.shL[0] - 40, J.shL[1] - 40, RED, Wt, 12);
    tag("SHOULDERS LOADED", 560, 1120, RED, Wt, 40);
  }
  if (id === "s3") {
    // side view: lowering with elbows out, front of the shoulder squeezed, the body shakes
    const Sq = on("s3", "squeezed", u, 0.1, 0.3), Sk = on("s3", "shaky", u, 0.1, 0.25);
    const Lo = sm(0, 1.2, u);
    mat(PX, FY, 760, 1);
    const J = plankP(PX, FY, pose(Q.plank, Q.low, Lo * (1 - 0.25 * Sk * (0.5 + 0.5 * Math.sin(u * 9)))), SC, RED, { shake: shk(Sk) });
    const [sx, sy] = J("sh");
    ring(sx - 10, sy + 10, 56, RED, on("s3", "front", u, 0.05, 0.3), 9);
    strain(sx - 10, sy + 10, Sq, u, 52);
    tag("FRONT OF SHOULDER", 560, 800, RED, on("s3", "shoulder", u), 40);
    tag("SHAKY", 760, 920, RED, Sk, 46);
  }
  if (id === "s4") {
    // top view: the elbows come in and hug the ribs
    const Hg = on("s4", "hug", u, 0.1, 0.6);
    const J = topP(TX, TY, 1 - Hg, TS, VIOLET, { arm: Hg > 0.5 ? GREEN : RED, matC: GREEN });
    arrow(TX + 330, TY + 110, J.eR[0] + 40, J.eR[1] - 10, GREEN, on("s4", "elbows", u, 0.05, 0.3), 12);
    arrow(TX - 330, TY + 110, J.eL[0] - 40, J.eL[1] - 10, GREEN, on("s4", "elbows", u, 0.05, 0.3), 12);
    const Rb = on("s4", "ribs", u, 0.05, 0.3);
    if (Rb > 0) {
      x.save(); x.globalAlpha = Rb; x.strokeStyle = GREEN; x.lineWidth = 7; x.lineCap = "round";
      for (let i = 0; i < 3; i++) { const yy = TY + 110 + i * 34; x.beginPath(); x.moveTo(TX - 56, yy); x.quadraticCurveTo(TX, yy - 16, TX + 56, yy); x.stroke(); }
      x.restore();
    }
    tag("TO THE RIBS", 760, 1020, GREEN, Rb, 44);
    check(770, 860, 0.55, sm(at("s4", "ribs") + 0.1, at("s4", "ribs") + 0.4, u));
  }
  if (id === "s5") {
    // side view: elbows point back toward the feet; stop halfway (shoulders at elbow height)
    const Lo = sm(0.1, 1.1, u);
    const Hw = on("s5", "halfway", u, 0.1, 0.3);
    mat(PX, FY, 760, 1, GREEN);
    const J = plankP(PX, FY, pose(Q.plank, Q.low, Lo), SC, GREEN);
    const [ex, ey] = J("eL"), [sx, sy] = J("sh");
    arrow(ex - 10, ey - 50, ex + 150, ey - 50, VIOLET, on("s5", "back", u, 0.05, 0.3), 12);
    tag("ELBOWS BACK", 720, 840, GREEN, on("s5", "back", u), 44);
    line2([sx - 120, sy], [ex + 330, sy], VIOLET, Hw, 12);
    tag("HALFWAY", 300, 900, GREEN, Hw, 46);
    check(800, 700, 0.55, sm(at("s5", "down") , at("s5", "down") + 0.3, u));
  }
  if (id === "s6") {
    // too hard? knees down first, then lower with the elbows still in
    const Dn = on("s6", "knees", u, 0.1, 0.5);
    const Lo = on("s6", "keep", u, 0.1, 0.8);
    mat(PX, FY, 760, 1, GREEN);
    const base = pose(Q.plank, Q.knees, Dn);
    const J = plankP(PX, FY, pose(base, Q.kneesLow, Lo), SC, GREEN);
    const [kx, ky] = J("kL"), [ex, ey] = J("eL");
    tag("TOO HARD?", 300, 780, VIOLET, on("s6", "too", u, 0.05, 0.2), 44);
    ring(kx, ky, 46, GREEN, on("s6", "knees", u), 9);
    tag("KNEES DOWN", 740, 880, GREEN, on("s6", "knees", u), 44);
    ring(ex, ey, 42, VIOLET, on("s6", "elbows", u), 8);
  }
  if (id === "s7") {
    topP(CX, 1000, 0, 0.42, GREEN, { a: 0.8, matC: GREEN });
  }
  x.restore();

  if (id === "s1") { words(["NEVER FLARE", "YOUR ELBOWS"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "flare")))); underline(530, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["ELBOWS OUT,", "SHOULDERS PAY"], RED, 330, 0.0, 1, 140, flash(u, at("s2", "weight")) * 0.6);
  if (id === "s3") words(["SQUEEZED", "AND SHAKY"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "squeezed")) * 0.6);
  if (id === "s4") words(["HUG YOUR", "ELBOWS IN"], GREEN, 330, 0.0, 1, 150, flash(u, at("s4", "hug")) * 0.6);
  if (id === "s5") words(["POINT BACK,", "STOP HALFWAY"], GREEN, 340, 0.0, 1, 140, flash(u, at("s5", "halfway")) * 0.6);
  if (id === "s6") words(["KNEES DOWN,", "ELBOWS IN"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "knees")) * 0.6);
  if (id === "s7") {
    words(["ELBOWS IN."], ORANGE, 520, 0.0, 1, 150, flash(u, 0.05));
    words(["POINT THEM BACK."], ORANGE, 720, at("s7", "point") - 0.05, 1, 150, flash(u, at("s7", "point")));
    underline(830, 700, sm(at("s7", "point"), at("s7", "point") + 0.4, u), ORANGE);
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
window.__hf.buildReady["chaturanga-elbows-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
