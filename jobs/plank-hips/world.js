// plank-hips (YogaFlow 38) - CHALKBOARD style (kit from tree-foot, YogaFlow 37).
// NEVER LET YOUR HIPS SAG: in plank keep one straight line head to heels; if you shake, knees down and keep the line.
// s1 plank, hips sink (red arrow). s2 lower back arches like a hammock (red curve). s3 shaking, strain on the lower back.
// s4 hips rise to one straight line (green line head to heels). s5 belly in, press the floor away. s6 shake, knees down,
// the line kept. s7 orange end card, s8 brand. Time only from hf-seek.
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
const on = (id, w, u, a = 0.1, b = 0.15) => sm(at(id, w) - a, at(id, w) + b, u);

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
function dot(X, Y, r, a, c) { if (a <= 0) return; x.save(); x.globalAlpha = cl(a); x.fillStyle = c; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.fill(); x.restore(); }
// a chalk arrow from (x0,y0) toward (x1,y1), drawn to fraction k
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
// jagged strain marks around a point
function strain(X, Y, k, u) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k); x.strokeStyle = RED; x.lineWidth = 9; x.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const A = i * Math.PI / 3 + 0.3, r0 = 50 + 6 * Math.sin(u * 18 + i), r1 = r0 + 45 * k;
    x.beginPath(); x.moveTo(X + Math.cos(A) * r0, Y + Math.sin(A) * r0);
    x.lineTo(X + Math.cos(A + 0.12) * (r0 + r1) / 2, Y + Math.sin(A + 0.12) * (r0 + r1) / 2);
    x.lineTo(X + Math.cos(A) * r1, Y + Math.sin(A) * r1); x.stroke();
  }
  x.restore();
}

// ---------- chalk stick people: joints in px, y up = negative, origin on the floor; standing leg = L ----------
const P = {
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-10, -98], fL: [-16, 0], kR: [14, -98], fR: [24, 0], eL: [-55, -290], hL: [-4, -320], eR: [55, -290], hR: [4, -320] },
};
// foot pressed into the side of the standing knee (wrong)
P.knee = Object.assign({}, P.stand, { kR: [120, -135], fR: [6, -100] });
// same, standing knee pushed in sideways by the foot
P.kneeBent = Object.assign({}, P.knee, { kL: [-34, -98], fR: [-16, -100], kR: [100, -135] });
// foot on the calf, below the knee (right)
P.calf = Object.assign({}, P.stand, { kR: [118, -112], fR: [4, -55] });
// foot high on the inner thigh (right)
P.tree = Object.assign({}, P.stand, { kR: [140, -100], fR: [8, -150] });
P.treeTall = Object.assign({}, P.tree, { head: [0, -425], sh: [0, -348] });
P.sit = { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] };
// side-view plank people: head left, hands under shoulders. Origin = floor under the hands' centre line, y up = negative.
const Q = {};
Q.plank = { head: [-338, -222], sh: [-260, -200], eL: [-262, -100], hL: [-262, 0], eR: [-246, -100], hR: [-246, 0], hip: [60, -109], kL: [220, -63], fL: [372, -18], kR: [232, -61], fR: [384, -16] };
Q.sag = Object.assign({}, Q.plank, { head: [-336, -226], hip: [60, -38], kL: [220, -36], kR: [232, -34] });
Q.knees = Object.assign({}, Q.plank, { head: [-338, -226], hip: [40, -74], kL: [196, -12], fL: [330, -70], kR: [208, -12], fR: [342, -68] });
function plankP(X, Y, p, s, color, o = {}) {
  const jit = o.shake ? o.shake : 0;
  const fixed = { hL: 1, hR: 1, fL: 1, fR: 1 }; // hands and feet stay on the floor; the body shakes
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s + (fixed[j] ? 0 : jit)];
  const a = o.a ?? 1;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const far = mix(color, "#24432f", 0.4);
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(far, 22 * s, off, "sh", "eR", "hR"); limb(far, 22 * s, off, "hip", "kR", "fR");
    limb(color, 30 * s, off, "sh", "hip");
    limb(color, 22 * s, off, "hip", "kL", "fL"); limb(color, 22 * s, off, "sh", "eL", "hL");
  }
  x.globalAlpha = a;
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.arc(hx + 4 * s, hy - 3 * s, 40 * s, 0.4, Math.PI * 1.7); x.stroke();
  x.restore();
  return W2;
}
function line2(A, B, c, k, w = 12) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.setLineDash([2, 26]);
  x.beginPath(); x.moveTo(A[0], A[1]); x.lineTo(lerp(A[0], B[0], cl(k)), lerp(A[1], B[1], cl(k))); x.stroke(); x.restore();
}
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const far = mix(color, "#24432f", 0.4);
  const lift = o.lift || color;
  for (const off of [0, 5 * s]) {
    x.globalAlpha = a * (off ? 0.55 : 1);
    limb(far, 22 * s, off, "sh", "eR", "hR");
    limb(color, 28 * s, off, "sh", "hip");
    limb(color, 22 * s, off, "hip", "kL", "fL"); limb(color, 22 * s, off, "sh", "eL", "hL");
    limb(lift, 22 * s, off, "hip", "kR", "fR");
  }
  x.globalAlpha = a;
  const [fx, fy] = W2("fR");
  x.fillStyle = lift; x.beginPath(); x.ellipse(fx, fy, 22 * s, 14 * s, 0, 0, Math.PI * 2); x.fill();
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
// a big side-view leg for s2: hip, knee, shin at angle th (0 = straight down, + = foot back)
function bigLeg(HX, HY, th, color) {
  const KX = HX, KY = HY + 300, FX = KX - Math.sin(th) * 290, FY2 = KY + Math.cos(th) * 290;
  x.save(); x.lineCap = "round"; x.lineJoin = "round";
  for (const off of [0, 6]) {
    x.globalAlpha = off ? 0.5 : 1; x.strokeStyle = color; x.lineWidth = 46;
    x.beginPath(); x.moveTo(HX + off, HY - off); x.lineTo(KX + off, KY - off); x.lineTo(FX + off, FY2 - off); x.stroke();
  }
  x.globalAlpha = 1; x.lineWidth = 34; x.beginPath(); x.moveTo(FX, FY2); x.lineTo(FX - 90, FY2 + 6); x.stroke();
  x.fillStyle = "#14113a"; x.strokeStyle = color; x.lineWidth = 10; x.beginPath(); x.arc(KX, KY, 40, 0, Math.PI * 2); x.fill(); x.stroke();
  x.restore();
  return [KX, KY];
}

function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  const FY = 1170, PX = 500, SC = 1.05;
  const shk = (k) => k * 5 * Math.sin(u * 47) + k * 3 * Math.sin(u * 71);
  if (id === "s1") {
    // a student holds plank, then the hips sink toward the mat
    const Sg = on("s1", "sag", u, 0.15, 0.45);
    mat(PX, FY, 760, 1);
    const J = plankP(PX, FY, pose(Q.plank, Q.sag, Sg), SC, Sg > 0.5 ? RED : VIOLET);
    const [hx, hy] = J("hip");
    tag("PLANK", 300, 760, VIOLET, on("s1", "plank", u), 46);
    arrow(hx, hy - 230, hx, hy - 50, RED, on("s1", "sag", u, 0.05, 0.35), 14);
    tag("HIPS SAG", 700, 820, RED, on("s1", "sag", u), 44);
  }
  if (id === "s2") {
    // the sagging body: lower back curves like a hammock between shoulders and knees
    const Ar = on("s2", "arches", u, 0.1, 0.4);
    mat(PX, FY, 760, 1);
    const J = plankP(PX, FY, Q.sag, SC, RED);
    const [sx, sy] = J("sh"), [hx, hy] = J("hip"), [kx, ky] = J("kL");
    arrow(hx, hy - 200, hx, hy - 40, RED, on("s2", "drop", u, 0.05, 0.3), 12);
    if (Ar > 0) {
      x.save(); x.strokeStyle = RED; x.lineWidth = 12; x.lineCap = "round"; x.setLineDash([2, 24]);
      x.beginPath(); x.moveTo(sx, sy - 40); x.quadraticCurveTo(hx, hy + 60 * Ar - 10, lerp(sx, kx, Ar), lerp(sy, ky, Ar) - 40); x.stroke(); x.restore();
    }
    tag("BACK ARCHES", 640, 760, RED, on("s2", "arches", u), 44);
    tag("LIKE A HAMMOCK", 640, 870, RED, on("s2", "hammock", u), 40);
  }
  if (id === "s3") {
    // shaking, strain on the lower back, the core does nothing
    const Hd = on("s3", "harder", u, 0.1, 0.3);
    const Ld = on("s3", "load", u, 0.1, 0.3);
    mat(PX, FY, 760, 1);
    const J = plankP(PX, FY, Q.sag, SC, RED, { shake: shk(Hd) });
    const [sx, sy] = J("sh"), [hx, hy] = J("hip");
    tag("HARDER HOLD", 360, 760, RED, Hd, 42);
    strain(lerp(sx, hx, 0.7), lerp(sy, hy, 0.7) - 20, Ld, u);
    tag("BACK TAKES IT", 700, 860, RED, on("s3", "back", u), 40);
    cross(lerp(sx, hx, 0.45), lerp(sy, hy, 0.45) + 70, 36, sm(at("s3", "core"), at("s3", "core") + 0.4, u));
  }
  if (id === "s4") {
    // the right way: hips rise into one straight line from head to heels
    const Up = on("s4", "instead", u, 0.1, 0.6);
    mat(PX, FY, 760, 1, GREEN);
    const J = plankP(PX, FY, pose(Q.sag, Q.plank, Up), SC, GREEN);
    const [hx, hy] = J("head"), [fx, fy] = J("fL");
    const A = [hx - 20, hy - 70], B = [fx + 20, fy - 70];
    const Ln = sm(at("s4", "line") - 0.1, at("s4", "heels") + 0.2, u);
    line2(A, B, VIOLET, Ln, 14);
    tag("HEAD", 230, 820, GREEN, on("s4", "head", u), 44);
    tag("HEELS", 830, 900, GREEN, on("s4", "heels", u), 44);
    check(760, 700, 0.6, sm(at("s4", "heels"), at("s4", "heels") + 0.3, u));
  }
  if (id === "s5") {
    // belly in (arrow up under the belly), hands press the floor away (arrows down at the hands)
    mat(PX, FY, 760, 1, GREEN);
    const J = plankP(PX, FY, Q.plank, SC, GREEN);
    const [sx, sy] = J("sh"), [hx, hy] = J("hip"), [ax, ay] = J("hL");
    const bx = lerp(sx, hx, 0.55), by = lerp(sy, hy, 0.55);
    const bl = on("s5", "belly", u, 0.05, 0.3), pr = on("s5", "press", u, 0.05, 0.3);
    const pz = 8 * Math.sin(u * 8);
    arrow(bx, by + 150, bx, by + 30 + pz, GREEN, bl, 12);
    tag("BELLY IN", 640, 760, GREEN, bl, 44);
    arrow(ax + 70, ay - 240, ax + 70, ay - 60 - pz, VIOLET, pr, 12);
    tag("PRESS THE FLOOR", 560, 880, VIOLET, pr, 40);
  }
  if (id === "s6") {
    // shaking? knees down, the line from head to knees stays straight
    const Sh = on("s6", "shaking", u, 0.05, 0.2) * (1 - on("s6", "drop", u, 0.1, 0.2));
    const Dn = on("s6", "drop", u, 0.1, 0.5);
    mat(PX, FY, 760, 1, GREEN);
    const J = plankP(PX, FY, pose(Q.plank, Q.knees, Dn), SC, GREEN, { shake: shk(Sh) });
    const [hx, hy] = J("head"), [kx, ky] = J("kL");
    tag("SHAKING?", 330, 760, VIOLET, on("s6", "shaking", u), 44);
    tag("KNEES DOWN", 720, 880, GREEN, on("s6", "knees", u), 44);
    ring(kx, ky, 46, GREEN, on("s6", "knees", u), 9);
    line2([hx - 20, hy - 70], [kx + 20, ky - 70], VIOLET, sm(at("s6", "line") - 0.1, at("s6", "line") + 0.4, u), 14);
  }
  if (id === "s7") {
    mat(CX, 1220, 400, 0.7, GREEN);
    plankP(CX - 30, 1220, Q.plank, 0.55, GREEN, { a: 0.8 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER LET YOUR", "HIPS SAG"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "sag")))); underline(530, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["HIPS DROP,", "BACK ARCHES"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "hammock")) * 0.6);
  if (id === "s3") words(["YOUR BACK TAKES", "THE LOAD"], RED, 340, 0.0, 1, 140, flash(u, at("s3", "load")) * 0.6);
  if (id === "s4") words(["ONE STRAIGHT", "LINE"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "line")) * 0.6);
  if (id === "s5") words(["BELLY IN,", "PUSH AWAY"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "press")) * 0.6);
  if (id === "s6") words(["SHAKING?", "KNEES DOWN"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "knees")) * 0.6);
  if (id === "s7") {
    words(["ONE STRAIGHT LINE"], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["KNEES DOWN IS FINE"], ORANGE, 840, at("s7", "knees") - 0.05, 1, 150, flash(u, at("s7", "knees")));
    underline(950, 700, sm(at("s7", "knees"), at("s7", "knees") + 0.4, u), ORANGE);
  }
  if (false) {
  if (id === "s1") {
    // a student lifts the foot into tree pose and parks it on the side of the standing knee
    const L = on("s1", "tree", u, 0.2, 0.4);
    const K = on("s1", "knee", u, 0.15, 0.1);
    mat(PX, FY, 340, 1);
    const J = person(PX, FY, pose(P.stand, P.knee, L), SC, K > 0.5 ? RED : VIOLET, { lift: L > 0.5 ? RED : VIOLET });
    const [kx, ky] = J("kL");
    ring(kx, ky, 62 + 6 * Math.sin(u * 9), RED, on("s1", "press", u), 10);
    tag("TREE POSE", 760, 700, VIOLET, on("s1", "tree", u), 44);
    tag("FOOT ON KNEE", 760, 820, RED, K, 42);
    arrow(760, 860, kx + 80, ky - 20, RED, on("s1", "knee", u, 0, 0.3), 10);
  }
  if (id === "s2") {
    // big side-view leg: the knee hinges forward and back (green), never sideways (red X)
    const F = at("s2", "forward"), B = at("s2", "back"), N = at("s2", "not");
    const fwd = sm(F - 0.1, F + 0.25, u) * (1 - sm(B - 0.2, B + 0.1, u));
    const bk = sm(B - 0.2, B + 0.2, u) * (1 - sm(N - 0.1, N + 0.25, u));
    const side = sm(N - 0.05, N + 0.2, u);
    const [kx, ky] = bigLeg(CX - 60, 560, 0.4 * fwd - 0.8 * bk, side > 0.5 ? ORANGE : VIOLET);
    // green hinge arrows
    arrow(kx - 60, ky + 230, kx - 200, ky + 150, GREEN, on("s2", "forward", u, 0.05, 0.25), 12);
    arrow(kx + 60, ky + 230, kx + 200, ky + 150, GREEN, on("s2", "back", u, 0.05, 0.25), 12);
    tag("FORWARD", 220, 1080, GREEN, on("s2", "forward", u), 40);
    tag("BACK", 760, 1080, GREEN, on("s2", "back", u), 40);
    // red sideways push with an X
    arrow(kx + 330, ky, kx + 70, ky, RED, side, 16);
    cross(kx + 230, ky - 110, 50, sm(at("s2", "sideways"), at("s2", "sideways") + 0.4, u));
    tag("NOT SIDEWAYS", 700, 700, RED, sm(at("s2", "sideways") - 0.1, at("s2", "sideways") + 0.15, u), 42);
  }
  if (id === "s3") {
    // the foot pushes in from the side; the standing knee bends inward; strain marks on the joint
    const Pu = on("s3", "push", u, 0.1, 0.3);
    const Sd = on("s3", "side", u, 0.1, 0.3);
    const St = on("s3", "strain", u, 0.15, 0.3);
    const pulse = 0.5 + 0.5 * Math.sin(u * 12);
    mat(PX, FY, 340, 1);
    const J = person(PX, FY, pose(P.knee, P.kneeBent, Sd * (0.7 + 0.3 * pulse * St)), SC, RED);
    const [kx, ky] = J("kL"), [fx, fy] = J("fR");
    arrow(fx + 190, fy, fx + 30, fy, RED, Pu, 14);
    tag("PUSHED SIDEWAYS", 680, 700, RED, Sd, 40);
    strain(kx, ky, St, u);
    tag("JOINT STRAIN", 720, 840, RED, on("s3", "joint", u), 42);
    ring(kx, ky, 58, RED, on("s3", "joint", u), 10);
  }
  if (id === "s4") {
    // the right way: foot slides down to the calf, below the knee
    const Pl = on("s4", "place", u, 0.1, 0.5);
    mat(PX, FY, 340, 1, GREEN);
    const J = person(PX, FY, pose(P.knee, P.calf, Pl), SC, GREEN);
    const [kx, ky] = J("kL"), [fx, fy] = J("fR");
    ring(kx, ky, 46, RED, (1 - Pl) * 0.9, 8);
    dot(fx, fy, 16, on("s4", "calf", u), WHITE);
    ring(fx, fy, 50 + 4 * Math.sin(u * 6), GREEN, on("s4", "calf", u), 10);
    tag("ON THE CALF", 740, 860, GREEN, on("s4", "calf", u), 44);
    tag("BELOW THE KNEE", 740, 980, VIOLET, on("s4", "below", u), 40);
    check(780, 700, 0.6, sm(at("s4", "knee"), at("s4", "knee") + 0.3, u));
  }
  if (id === "s5") {
    // or higher: foot lifts to the inner thigh, above the knee
    const Hi = on("s5", "higher", u, 0.1, 0.6);
    mat(PX, FY, 340, 1, GREEN);
    const J = person(PX, FY, pose(P.calf, P.tree, Hi), SC, GREEN);
    const [fx, fy] = J("fR");
    ring(fx, fy, 50 + 4 * Math.sin(u * 6), GREEN, on("s5", "thigh", u), 10);
    tag("INNER THIGH", 760, 760, GREEN, on("s5", "inner", u), 44);
    tag("HIPS READY?", 760, 880, VIOLET, on("s5", "hips", u), 42);
  }
  if (id === "s6") {
    // press foot and leg into each other, then stand tall
    const Ta = on("s6", "stand", u, 0.1, 0.4);
    mat(PX, FY, 340, 1, GREEN);
    const J = person(PX, FY, pose(P.tree, P.treeTall, Ta), SC, GREEN);
    const [fx, fy] = J("fR"), [hx, hy] = J("head");
    const pr = on("s6", "press", u, 0.05, 0.25), lg = on("s6", "leg", u, 0.05, 0.25);
    const pz = 8 * Math.sin(u * 8);
    arrow(fx + 150, fy - 30, fx + 36 + pz, fy - 10, GREEN, pr, 12);
    arrow(fx - 140, fy + 10, fx - 36 - pz, fy + 10, GREEN, lg, 12);
    tag("PRESS", 790, 900, GREEN, pr, 44);
    arrow(hx, hy - 66, hx, hy - 66 - 90 * Ta, VIOLET, Ta > 0.02 ? 1 : 0, 12);
    tag("STAND TALL", 760, 700, VIOLET, on("s6", "tall", u), 44);
  }
  if (id === "s7") {
    mat(CX, 1200, 240, 0.7, GREEN);
    person(CX, 1200, P.tree, 0.45, GREEN, { a: 0.8 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER PRESS", "ON YOUR KNEE"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "knee")))); underline(530, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["BENDS FORWARD", "AND BACK ONLY"], RED, 340, 0.0, 1, 140, flash(u, at("s2", "sideways")) * 0.6);
  if (id === "s3") words(["SIDE PRESSURE", "STRAINS THE KNEE"], RED, 340, 0.0, 1, 140, flash(u, at("s3", "strain")) * 0.6);
  if (id === "s4") words(["FOOT ON", "YOUR CALF"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "calf")) * 0.6);
  if (id === "s5") words(["OR HIGHER, ON", "THE INNER THIGH"], GREEN, 340, 0.0, 1, 140, flash(u, at("s5", "thigh")) * 0.6);
  if (id === "s6") words(["PRESS IN,", "STAND TALL"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "tall")) * 0.6);
  if (id === "s7") {
    words(["ABOVE OR BELOW."], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["NEVER ON IT."], ORANGE, 840, at("s7", "never") - 0.05, 1, 150, flash(u, at("s7", "never")));
    underline(950, 700, sm(at("s7", "never"), at("s7", "never") + 0.4, u), ORANGE);
  }
  } // end of the unused tree-foot blocks
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
window.__hf.buildReady["plank-hips-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
