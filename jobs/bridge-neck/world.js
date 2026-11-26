// bridge-neck (YogaFlow 42) - CHALKBOARD style (kit from roll-to-side, YogaFlow 39).
// NEVER TURN YOUR HEAD IN BRIDGE: s1 bridge, the head turns (red). s2 weight on the shoulders, neck bent. s3 the head
// turns under load, neck zigzag. s4 eyes up (green). s5 press feet+arms, lift hips. s6 lower hips first, then turn.
// s7 orange end card, s8 brand. Time only from hf-seek.
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
function arrow(x0, y0, x1, y1, c, k, w = 14) {
  if (k <= 0) return;
  const ex = lerp(x0, x1, cl(k)), ey = lerp(y0, y1, cl(k)), A = Math.atan2(y1 - y0, x1 - x0), h = w * 2.6;
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex, ey); x.stroke();
  x.beginPath(); x.moveTo(ex - h * Math.cos(A - 0.5), ey - h * Math.sin(A - 0.5)); x.lineTo(ex, ey); x.lineTo(ex - h * Math.cos(A + 0.5), ey - h * Math.sin(A + 0.5)); x.stroke();
  x.restore();
}
// a curved chalk arrow around centre (X,Y) from angle a0 to a1, drawn to fraction k
function arcArrow(X, Y, r, a0, a1, c, k, w = 12) {
  if (k <= 0) return;
  const e = lerp(a0, a1, cl(k)), dir = Math.sign(a1 - a0) || 1;
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.arc(X, Y, r, a0, e, dir < 0); x.stroke();
  const ex = X + Math.cos(e) * r, ey = Y + Math.sin(e) * r, A = e + dir * Math.PI / 2, h = w * 2.6;
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
// dizzy spirals circling above a head
function dizzy(X, Y, k, u) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k); x.strokeStyle = RED; x.lineWidth = 8; x.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const A = u * 4 + i * 2.1, cx = X + Math.cos(A) * 90, cy = Y - 40 + Math.sin(A) * 26;
    x.beginPath();
    for (let j = 0; j <= 30; j++) { const a = j * 0.42, r = 4 + j * 0.9; const px = cx + Math.cos(a + u * 6) * r, py = cy + Math.sin(a + u * 6) * r * 0.8; j ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
  }
  x.restore();
}
// small wiggle marks around a hand or a foot
function wiggle(X, Y, k, u, c = GREEN) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k); x.strokeStyle = c; x.lineWidth = 7; x.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const A = -Math.PI / 2 + (i - 1) * 0.6 + 0.12 * Math.sin(u * 20 + i), r0 = 42, r1 = 70 + 8 * Math.sin(u * 16 + i * 2);
    x.beginPath(); x.moveTo(X + Math.cos(A) * r0, Y + Math.sin(A) * r0); x.lineTo(X + Math.cos(A) * r1, Y + Math.sin(A) * r1); x.stroke();
  }
  x.restore();
}

// ---------- side-view chalk people: head left, origin on the floor, y up = negative ----------
const Q = {};
// on the back, knees bent, feet flat, arms along the floor, hips DOWN
Q.down = { head: [-340, -46], sh: [-262, -42], eL: [-140, -26], hL: [-20, -22], eR: [-150, -30], hR: [-30, -26], hip: [60, -40], kL: [190, -220], fL: [260, -22], kR: [200, -216], fR: [270, -20] };
// bridge: head + shoulders on the floor, hips lifted, shins vertical over the feet
Q.up = Object.assign({}, Q.down, { sh: [-262, -50], hip: [20, -240], kL: [230, -262], kR: [240, -258] });
// a red zigzag across the neck (strain)
function zig(X0, Y0, X1, Y1, k, c = RED) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k); x.strokeStyle = c; x.lineWidth = 9; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath();
  for (let i = 0; i <= 6; i++) { const t = i / 6, px = lerp(X0, X1, t), py = lerp(Y0, Y1, t) + (i % 2 ? -18 : 18) * (i && i < 6 ? 1 : 0); i ? x.lineTo(px, py) : x.moveTo(px, py); }
  x.stroke(); x.restore();
}
// down-pressing marks under a hand or a foot
function press(X, Y, k, c = GREEN) {
  if (k <= 0) return;
  arrow(X, Y - 150, X, Y - 40, c, k, 12);
}
function body(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
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
  // face: turn 0 = profile, nose up at the ceiling; turn 1 = face toward us (head turned to the side)
  const tn = cl(o.turn ?? 0);
  x.globalAlpha = a * (1 - tn); x.lineWidth = 12 * s;
  x.beginPath(); x.moveTo(hx + 6 * s, hy - 42 * s); x.lineTo(hx + 2 * s, hy - 62 * s); x.lineTo(hx + 20 * s, hy - 46 * s); x.stroke();
  x.globalAlpha = a * tn; x.fillStyle = color;
  x.beginPath(); x.arc(hx - 15 * s, hy - 8 * s, 7 * s, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(hx + 15 * s, hy - 8 * s, 7 * s, 0, Math.PI * 2); x.fill();
  x.lineWidth = 8 * s; x.beginPath(); x.arc(hx, hy + 8 * s, 14 * s, 0.3, Math.PI - 0.3); x.stroke();
  x.restore();
  return W2;
}
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
// front-view seated person for the brand card
const P = { sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] } };
function person(X, Y, p, s, color) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = color;
  const limb = (w, ...js) => { x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  limb(28 * s, "sh", "hip"); limb(22 * s, "hip", "kL", "fL"); limb(22 * s, "hip", "kR", "fR"); limb(22 * s, "sh", "eL", "hL"); limb(22 * s, "sh", "eR", "hR");
  const [hx, hy] = W2("head"); x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.restore();
}
function mat(X, Y, w, a = 1, c = VIOLET) {
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X - w / 2, Y + 4); x.lineTo(X + w / 2, Y); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.moveTo(X - w / 2 + 10, Y + 20); x.lineTo(X + w / 2 - 6, Y + 17); x.stroke(); x.restore();
}
// a calm wave above the body; snap > 0 turns it into a red jagged line
function calmWave(X0, X1, Y, u, a, snap) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineWidth = 10; x.lineCap = "round"; x.lineJoin = "round";
  x.strokeStyle = snap > 0.5 ? RED : GREEN;
  x.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, px = lerp(X0, X1, t);
    const soft = 22 * Math.sin(t * Math.PI * 4 + u * 3), jag = (i % 2 ? 1 : -1) * 60 * (0.6 + 0.4 * Math.sin(i * 7.3));
    const py = Y + lerp(soft, jag, cl(snap));
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  }
  x.stroke(); x.restore();
}

function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  const FY = 1170, PX = 520, SC = 1.05;
  // head turn sway: a quick look to the side and back
  const neckOf = (J) => { const [hx, hy] = J("head"), [sx, sy] = J("sh"); return [(hx + sx) / 2, (hy + sy) / 2 - 20]; };
  if (id === "s1") {
    // in bridge, then the head turns to look around (red)
    const Tn = on("s1", "turn", u, 0.05, 0.3);
    mat(PX, FY, 800, 1);
    const J = body(PX, FY, Q.up, SC, Tn > 0.5 ? RED : VIOLET, { turn: Tn });
    const [hx, hy] = J("head");
    tag("BRIDGE POSE", 640, 820, VIOLET, on("s1", "bridge", u) * (1 - Tn), 46);
    arcArrow(hx, hy, 90, -2.6, -0.4, RED, on("s1", "turn", u, 0.05, 0.4), 11);
    tag("LOOKING AROUND", 640, 820, RED, on("s1", "look", u), 44);
  }
  if (id === "s2") {
    // weight pressing onto the shoulders, the neck bent between head and shoulders
    mat(PX, FY, 800, 1);
    const J = body(PX, FY, Q.up, SC, VIOLET);
    const [sx, sy] = J("sh"), [nx, ny] = neckOf(J);
    const Wt = on("s2", "weight", u, 0.05, 0.3);
    arrow(sx + 30, sy - 330, sx + 30, sy - 90, RED, Wt, 16);
    arrow(sx + 130, sy - 300, sx + 130, sy - 110, RED, Wt, 12);
    tag("WEIGHT ON SHOULDERS", 650, 740, RED, on("s2", "shoulders", u), 40);
    ring(nx, ny, 58, RED, on("s2", "neck", u, 0.05, 0.4), 9);
    tag("NECK BENT", 300, 1300, RED, on("s2", "bent", u), 44);
  }
  if (id === "s3") {
    // the head turns under that load: neck zigzag, cross
    const Tn = on("s3", "turn", u, 0.05, 0.3);
    mat(PX, FY, 800, 1);
    const J = body(PX, FY, Q.up, SC, Tn > 0.5 ? RED : VIOLET, { turn: Tn });
    const [hx, hy] = J("head"), [nx, ny] = neckOf(J), [sx, sy] = J("sh");
    arcArrow(hx, hy, 90, -2.6, -0.4, RED, Tn, 11);
    zig(nx - 50, ny - 10, nx + 50, ny - 10, on("s3", "twist", u, 0.05, 0.3));
    tag("TWIST", 300, 1300, RED, on("s3", "twist", u), 46);
    arrow(sx + 80, sy - 320, sx + 80, sy - 100, RED, on("s3", "load", u, 0.05, 0.3), 16);
    tag("UNDER LOAD", 640, 760, RED, on("s3", "load", u), 44);
    cross(800, 950, 40, sm(at("s3", "load"), at("s3", "load") + 0.4, u));
  }
  if (id === "s4") {
    // the right way: head still, eyes straight up at the ceiling
    mat(PX, FY, 800, 1, GREEN);
    const J = body(PX, FY, Q.up, SC, GREEN);
    const [hx, hy] = J("head");
    const Ey = on("s4", "eyes", u, 0.05, 0.4);
    x.save(); x.setLineDash([18, 16]); arrow(hx + 4, hy - 80, hx + 4, hy - 420, GREEN, Ey, 10); x.restore();
    tag("EYES UP", 420, 680, GREEN, on("s4", "ceiling", u), 46);
    tag("HEAD STILL", 640, 1300, VIOLET, on("s4", "instead", u), 42);
    check(800, 900, 0.55, sm(at("s4", "ceiling"), at("s4", "ceiling") + 0.3, u));
  }
  if (id === "s5") {
    // hips down; press feet and arms into the floor; lift the hips
    const Lf = on("s5", "lift", u, 0.05, 0.6);
    mat(PX, FY, 800, 1, GREEN);
    const J = body(PX, FY, pose(Q.down, Q.up, Lf), SC, GREEN);
    const [fx, fy] = J("fL"), [ax, ay] = J("hL"), [px, py] = J("hip");
    const Pr = on("s5", "press", u, 0.05, 0.3);
    press(fx, fy, Pr); press(ax, ay, on("s5", "arms", u, 0.05, 0.3));
    tag("FEET DOWN", 760, 1300, GREEN, on("s5", "feet", u), 42);
    tag("ARMS DOWN", 330, 1300, GREEN, on("s5", "arms", u), 42);
    arrow(px, py - 60, px, py - 230, VIOLET, Lf, 14);
    tag("LIFT HIPS", 790, 760, GREEN, on("s5", "hips", u), 44);
  }
  if (id === "s6") {
    // to look around: lower the hips all the way first, then turn the head
    const Lw = on("s6", "lower", u, 0.05, 0.7);
    const Tn = on("s6", "turn", u, 0.05, 0.3);
    mat(PX, FY, 800, 1, GREEN);
    const J = body(PX, FY, pose(Q.up, Q.down, Lw), SC, GREEN, { turn: Tn });
    const [px, py] = J("hip"), [hx, hy] = J("head");
    arrow(px, py - 230 * (1 - Lw) - 200, px, py - 60, VIOLET, Lw, 14);
    tag("1. HIPS DOWN", 790, 760, GREEN, on("s6", "lower", u), 42);
    arcArrow(hx, hy, 90, -2.6, -0.4, GREEN, Tn, 11);
    tag("2. THEN TURN", 330, 1300, GREEN, on("s6", "then", u), 42);
    check(820, 950, 0.55, sm(at("s6", "turn"), at("s6", "turn") + 0.3, u));
  }
  if (id === "s7") {
    mat(CX, 1235, 560, 0.7, GREEN);
    body(CX + 20, 1235, Q.up, 0.62, GREEN, { a: 0.8 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER TURN", "YOUR HEAD"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "turn")))); underline(530, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["WEIGHT ON", "YOUR NECK"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "neck")) * 0.6);
  if (id === "s3") words(["TURN = TWIST", "UNDER LOAD"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "twist")) * 0.6);
  if (id === "s4") words(["EYES ON", "THE CEILING"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "ceiling")) * 0.6);
  if (id === "s5") words(["PRESS DOWN,", "LIFT HIPS"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "lift")) * 0.6);
  if (id === "s6") words(["COME DOWN,", "THEN TURN"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "turn")) * 0.6);
  if (id === "s7") {
    words(["HEAD STILL IN BRIDGE"], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["COME DOWN, THEN LOOK"], ORANGE, 840, at("s7", "come") - 0.05, 1, 150, flash(u, at("s7", "come")));
    underline(950, 700, sm(at("s7", "come"), at("s7", "come") + 0.4, u), ORANGE);
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
window.__hf.buildReady["bridge-neck-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
