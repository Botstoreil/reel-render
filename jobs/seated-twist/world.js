// seated-twist (YogaFlow 40) - CHALKBOARD style (kit from roll-to-side, YogaFlow 39).
// NEVER CRANK YOUR TWIST WITH YOUR ARMS: sit tall, inhale and lengthen, exhale and turn from the belly, then the chest,
// head last, the hand only rests on the knee. Front view, seated cross-legged. The twist reads through three marks
// that slide sideways: navel, sternum, face. s1-s3 red (arm pulls, over-turns, strain in the low back), s4-s6 green,
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
  const b = boardC.getContext("2d"), r = rng(7);
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
// a flat "turning" arrow: the front half of an ellipse around the body at height Y, from right to left, drawn to k
function turnArrow(X, Y, rx, ry, c, k, w = 12) {
  if (k <= 0) return;
  const a0 = 0.15, a1 = Math.PI - 0.15, e = lerp(a0, a1, cl(k));
  x.save(); x.strokeStyle = c; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.ellipse(X, Y, rx, ry, 0, a0, e); x.stroke();
  const ex = X + Math.cos(e) * rx, ey = Y + Math.sin(e) * ry;
  const tx = -Math.sin(e) * rx, ty = Math.cos(e) * ry, A = Math.atan2(ty, tx), h = w * 2.6;
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
// red jagged strain burst
function strain(X, Y, r, k, u) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k); x.strokeStyle = RED; x.lineWidth = 9; x.lineJoin = "round";
  x.beginPath();
  for (let i = 0; i <= 24; i++) {
    const A = (i / 24) * Math.PI * 2, R = r * (i % 2 ? 0.62 : 1) * (1 + 0.06 * Math.sin(u * 18 + i));
    const px = X + Math.cos(A) * R * (0.6 + 0.4 * k), py = Y + Math.sin(A) * R * 0.75 * (0.6 + 0.4 * k);
    i ? x.lineTo(px, py) : x.moveTo(px, py);
  }
  x.stroke(); x.restore();
}
function mat(X, Y, w, a = 1, c = VIOLET) {
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 8; x.lineCap = "round";
  x.beginPath(); x.moveTo(X - w / 2, Y + 4); x.lineTo(X + w / 2, Y); x.stroke();
  x.globalAlpha = a * 0.5; x.beginPath(); x.moveTo(X - w / 2 + 10, Y + 20); x.lineTo(X + w / 2 - 6, Y + 17); x.stroke(); x.restore();
}

// ---------- front-view seated, cross-legged chalk person. Origin on the floor, y up = negative. ----------
// o.tb belly turn, o.tc chest turn, o.th head turn (0..1 = a full healthy twist to the viewer's left; >1 = forced),
// o.arm 0..1 arms move into the twist (front hand to the opposite knee, back hand to the floor behind),
// o.pull 0..1 the front elbow straightens and levers (wrong), o.slump 0..1 shorter spine, head drops.
function seated(X, Y, s, color, o = {}) {
  const { tb = 0, tc = 0, th = 0, arm = 0, pull = 0, slump = 0, a = 1 } = o;
  const P = (p) => [X + p[0] * s, Y + p[1] * s];
  const far = mix(color, BG, 0.45);
  const neckY = -335 + 50 * slump, headY = neckY - 82 + 16 * slump;
  const shift = -30 * Math.min(1.4, tc);
  const w = 150 * (1 - 0.45 * cl(tc));
  const shN = [shift + w, neckY + 12], shF = [shift - w, neckY + 12 + 8 * cl(tc)]; // viewer-right shoulder comes to the front
  const hip = [0, -80];
  const knL = [-150, -55], knR = [150, -55];
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const line = (c, wd, ...pts) => { x.strokeStyle = c; x.lineWidth = wd * s; x.beginPath(); pts.forEach((p, i) => { const [px, py] = P(p); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  // legs (crossed shins)
  line(color, 24, hip, knL, [45, -24]);
  line(color, 24, hip, knR, [-45, -30]);
  // back arm (viewer left): rests on the left knee, moves behind to the floor
  const eF = [lerp(-168, -215, arm), lerp(-195, -160, arm)], hF = [lerp(-150, -250, arm), lerp(-72, -14, arm)];
  line(arm > 0.5 ? far : color, 22, shF, eF, hF);
  // torso: the spine and a shoulder line that narrows as the chest turns
  line(color, 30, hip, [shift * 0.5, -200 + 25 * slump], [shift, neckY]);
  line(color, 26, shF, [shift, neckY], shN);
  // belly band and chest band (front halves of ellipses) with the navel and sternum marks
  const band = (cy, rx, t, c) => {
    const [bx, by] = P([shift * (cy < -200 ? 1 : 0.4), cy]);
    x.strokeStyle = mix(c, BG, 0.25); x.lineWidth = 7 * s; x.beginPath(); x.ellipse(bx, by, rx * s, 20 * s, 0, 0.1, Math.PI - 0.1); x.stroke();
    const mx = bx - Math.sin(Math.min(1.5, t) * 1.0) * rx * 0.85 * s, my = by + Math.cos(Math.min(1.5, t)) * 20 * s;
    x.fillStyle = c; x.beginPath(); x.arc(mx, my, 13 * s, 0, Math.PI * 2); x.fill();
  };
  band(-160 + 20 * slump, 105, tb, color);
  band(neckY + 70, 120, tc, color);
  // front arm (viewer right): rests on its own knee, crosses to the opposite (viewer-left) knee
  const eN0 = [168, -195], hN0 = [150, -72];
  const eN1 = [lerp(30, 120, pull), lerp(-185, -150, pull)], hN1 = [-140, -78];
  line(color, 22, shN, [lerp(eN0[0], eN1[0], arm), lerp(eN0[1], eN1[1], arm)], [lerp(hN0[0], hN1[0], arm), lerp(hN0[1], hN1[1], arm)]);
  // head: circle, a nose and two eyes that slide with the head turn
  const [hx, hy] = P([shift * 1.1, headY]);
  x.strokeStyle = color; x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 55 * s, 0, Math.PI * 2); x.stroke();
  const fx = -Math.sin(Math.min(1.5, th) * 1.0) * 36 * s;
  x.fillStyle = color;
  for (const d of [-18, 18]) { x.beginPath(); x.arc(hx + fx + d * s * (1 - 0.35 * cl(th)), hy - 8 * s, 6.5 * s, 0, Math.PI * 2); x.fill(); }
  x.lineWidth = 7 * s; x.beginPath(); x.moveTo(hx + fx, hy + 2 * s); x.lineTo(hx + fx - 10 * s * cl(th), hy + 18 * s); x.stroke();
  x.restore();
  return { P, knL: P(knL), hand: P([lerp(hN0[0], hN1[0], arm), lerp(hN0[1], hN1[1], arm)]), elbow: P([lerp(eN0[0], eN1[0], arm), lerp(eN0[1], eN1[1], arm)]),
    head: [hx, hy], chest: P([shift, neckY + 70]), belly: P([shift * 0.4, -160]), low: P([0, -115]), neck: P([shift, neckY]) };
}
// front-view seated person for the brand card
const PB = { sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] } };
function person(X, Y, p, s, color) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = color;
  const limb = (w, ...js) => { x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  limb(28 * s, "sh", "hip"); limb(22 * s, "hip", "kL", "fL"); limb(22 * s, "hip", "kR", "fR"); limb(22 * s, "sh", "eL", "hL"); limb(22 * s, "sh", "eR", "hR");
  const [hx, hy] = W2("head"); x.lineWidth = 14 * s; x.beginPath(); x.arc(hx, hy, 42 * s, 0, Math.PI * 2); x.stroke();
  x.restore();
}

function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  const FY = 1170, SC = 1.3; // r2: above the caption pill (~1265-1320)
  if (id === "s1") {
    // sitting in a twist; on "crank" the arm levers the body round, hunched
    const Cr = on("s1", "crank", u, 0.05, 0.35);
    mat(CX, FY, 760, 1);
    const B = seated(CX, FY, SC, Cr > 0.3 ? RED : VIOLET, { tb: 0.2 * Cr, tc: 1.15 * Cr, th: 1.25 * Cr, arm: 0.3 + 0.7 * Cr, pull: Cr, slump: 0.6 });
    tag("TWIST", 230, 800, VIOLET, on("s1", "twist", u) * (1 - Cr), 46);
    arrow(B.hand[0] + 20, B.hand[1] - 10, B.elbow[0] + 40, B.elbow[1] - 10, RED, on("s1", "crank", u, 0.0, 0.3), 14);
    tag("ARM DOES IT", 780, 900, RED, on("s1", "arms", u), 42);
  }
  if (id === "s2") {
    // pulling on the knee forces the spine past its range
    const Fo = on("s2", "forces", u, 0.05, 0.5);
    const Pl = 0.5 + 0.5 * Math.sin(u * 9);
    mat(CX, FY, 760, 1);
    const B = seated(CX, FY, SC, RED, { tb: 0.2, tc: 1.15 + 0.3 * Fo, th: 1.25 + 0.25 * Fo, arm: 1, pull: 1, slump: 0.6 });
    arrow(B.hand[0] + 20, B.hand[1] - 10, B.elbow[0] + 40 + 10 * Pl, B.elbow[1] - 10, RED, on("s2", "pulling", u, 0.05, 0.3), 14);
    ring(B.knL[0], B.knL[1], 46, RED, on("s2", "knee", u), 8);
    tag("PULLING", 230, 760, RED, on("s2", "pulling", u), 42);
    turnArrow(B.chest[0], B.chest[1], 230, 46, RED, on("s2", "spine", u, 0.05, 0.4), 12);
    tag("TOO FAR", 790, 800, RED, on("s2", "past", u), 46);
  }
  if (id === "s3") {
    // the strain lands in the low back
    const St = on("s3", "strain", u, 0.05, 0.3);
    mat(CX, FY, 760, 1);
    const B = seated(CX, FY, SC, RED, { tb: 0.2, tc: 1.45, th: 1.5, arm: 1, pull: 1, slump: 0.6 });
    strain(B.low[0], B.low[1], 95, St, u);
    tag("LOWER BACK", 790, 900, RED, on("s3", "lower", u), 42);
    cross(230, 770, 46, sm(at("s3", "back"), at("s3", "back") + 0.4, u));
  }
  if (id === "s4") {
    // untwisted, sit tall, inhale and lengthen up through the spine
    const Tl = on("s4", "tall", u, 0.05, 0.4);
    const Ln = on("s4", "lengthen", u, 0.05, 0.5);
    mat(CX, FY, 760, 1, GREEN);
    const B = seated(CX, FY, SC, GREEN, { slump: 0.6 * (1 - Tl) - 0.25 * Ln });
    tag("SIT TALL", 230, 820, GREEN, on("s4", "tall", u), 44);
    tag("INHALE", 790, 820, VIOLET, on("s4", "breathe", u), 44);
    arrow(B.neck[0] + 110, B.belly[1], B.neck[0] + 110, B.neck[1] - 120, GREEN, Ln, 14);
  }
  if (id === "s5") {
    // exhale, the belly turns first, then the chest; the arms follow, no pulling
    const Bl = on("s5", "belly", u, 0.1, 0.5);
    const Ch = on("s5", "chest", u, 0.1, 0.6);
    mat(CX, FY, 760, 1, GREEN);
    const B = seated(CX, FY, SC, GREEN, { slump: -0.25, tb: 0.9 * Bl + 0.1 * Ch, tc: 0.35 * Bl + 0.6 * Ch, th: 0.3 * Ch, arm: 0.5 * Bl + 0.5 * Ch });
    tag("EXHALE", 230, 760, VIOLET, on("s5", "breathe", u) * (1 - Ch), 44);
    turnArrow(B.belly[0], B.belly[1], 200, 40, GREEN, Bl, 12);
    tag("1. BELLY", 790, 1000, GREEN, on("s5", "belly", u), 42);
    turnArrow(B.chest[0], B.chest[1], 230, 46, GREEN, Ch, 12);
    tag("2. CHEST", 790, 840, GREEN, on("s5", "chest", u), 42);
  }
  if (id === "s6") {
    // the head turns last; the front hand only rests on the knee
    const Hd = on("s6", "turn", u, 0.05, 0.5);
    const Hn = on("s6", "hand", u, 0.05, 0.3);
    mat(CX, FY, 760, 1, GREEN);
    const B = seated(CX, FY, SC, GREEN, { slump: -0.25, tb: 1, tc: 0.95, th: 0.3 + 0.7 * Hd, arm: 1 });
    tag("3. HEAD LAST", 230, 760, GREEN, on("s6", "head", u), 42);
    turnArrow(B.head[0], B.head[1] + 30, 120, 30, GREEN, Hd * (1 - Hn), 10);
    ring(B.hand[0], B.hand[1], 52, VIOLET, Hn, 8);
    tag("JUST RESTS", 790, 980, VIOLET, on("s6", "rests", u), 42);
    check(830, 1120, 0.45, sm(at("s6", "knee"), at("s6", "knee") + 0.3, u));
  }
  if (id === "s7") {
    mat(CX, 1210, 480, 0.7, GREEN);
    x.save(); x.globalAlpha = 0.85; seated(CX, 1210, 0.5, GREEN, { slump: -0.25, tb: 1, tc: 0.95, th: 1, arm: 1 }); x.restore();
  }
  x.restore();

  if (id === "s1") { words(["NEVER CRANK", "YOUR TWIST"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "crank")))); underline(530, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["FORCED", "TOO FAR"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "forces")) * 0.6);
  if (id === "s3") words(["STRAIN IN", "YOUR LOW BACK"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "strain")) * 0.6);
  if (id === "s4") words(["SIT TALL,", "BREATHE IN"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "tall")) * 0.6);
  if (id === "s5") words(["TURN FROM", "THE BELLY"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "belly")) * 0.6);
  if (id === "s6") words(["HEAD", "TURNS LAST"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "head")) * 0.6);
  if (id === "s7") {
    words(["GROW TALL FIRST"], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["THEN TURN"], ORANGE, 840, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "then")));
    underline(950, 700, sm(at("s7", "then"), at("s7", "then") + 0.4, u), ORANGE);
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = VIOLET; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.arc(0, 0, 120, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = GREEN; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 155, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    person(CX, 560 + 95 * k, PB.sit, 0.62 * Math.max(0.01, k), VIOLET);
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
window.__hf.buildReady["seated-twist-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
