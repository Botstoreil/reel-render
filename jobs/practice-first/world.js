// practice-first: CHALKBOARD style (style test 22.11, YogaFlow 22). Everything is chalk on a green slate: dark fills
// become board colour, every stroke gets chalk grain, words sit slightly crooked, and an eraser wipes the board at the
// start of each line. Time only from hf-seek.
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

// chalk colours (the old neon names are kept so the story code stays the same)
const RED = "#ff8f8f", GREEN = "#a6f2b4", VIOLET = "#f4f1e6", ORANGE = "#ffc078", WHITE = "#ffffff", YELLOW = "#fff09a", BG = "#24432f";
const CX = 510;
const cv = document.getElementById("world");
const out = cv.getContext("2d");
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mk = () => { const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; return c; };
const boardC = mk(); {
  const b = boardC.getContext("2d"), r = rng(3);
  b.fillStyle = BG; b.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 46; i++) { b.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.022})`; b.beginPath(); b.ellipse(r() * 1080, r() * 1920, 80 + r() * 220, 30 + r() * 90, r() * 3, 0, Math.PI * 2); b.fill(); }
  // a faint floor line drawn long ago, half erased
  b.strokeStyle = "rgba(244,241,230,0.10)"; b.lineWidth = 8; b.beginPath(); b.moveTo(60, 1470); b.lineTo(1020, 1462); b.stroke();
  b.fillStyle = "#7a5230"; b.fillRect(0, 0, 1080, 26); b.fillRect(0, 0, 26, 1920); b.fillRect(1054, 0, 26, 1920); b.fillRect(0, 1860, 1080, 60);
  b.fillStyle = "#5c3d22"; b.fillRect(0, 1860, 1080, 10);
  b.fillStyle = "#f4f1e6"; b.fillRect(300, 1872, 70, 14); b.fillStyle = "#ffc078"; b.fillRect(420, 1874, 50, 12);
}
const grainC = mk(); {
  const g = grainC.getContext("2d"), r = rng(9);
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
function glow(c, b) { x.shadowBlur = 0; }
function noGlow() { x.shadowBlur = 0; }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (840 / x.measureText(L).width) * 100); });
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
// a chalk underline that draws itself under the title
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
function bubble(txt, X, Y, color, a, tx, ty, px = 52) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 70, h = px * 1.8, s = back(0, 1, a);
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#14113a"; x.strokeStyle = color; x.lineWidth = 8;
  rr(-w / 2, -h / 2, w, h, 34); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-24, h / 2 - 4); x.lineTo((tx - X) * 0.35, (ty - Y) * 0.35); x.lineTo(16, h / 2 - 4); x.fill(); x.stroke();
  x.fillStyle = "#14113a"; x.fillRect(-26, h / 2 - 12, 44, 10);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}

// ---------- chalk stick people: joints in px, y up = negative, origin on the floor ----------
const P = {
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] },
  warrior: { head: [0, -400], sh: [0, -330], hip: [0, -170], kL: [-120, -100], fL: [-140, 0], kR: [100, -80], fR: [200, 0], eL: [-110, -330], hL: [-210, -330], eR: [110, -330], hR: [210, -330] },
  shrug: { head: [0, -400], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-90, -280], hL: [-110, -360], eR: [90, -280], hR: [110, -360] },
};
P.wobbly = Object.assign({}, P.warrior, { kL: [-80, -95], hip: [10, -160], eL: [-100, -290], hL: [-190, -250], eR: [100, -290], hR: [190, -250] });
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
// drawn the way a teacher draws on a board: a double chalk line per limb (slightly offset), an open circle head
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, off, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px + off, py - off) : x.moveTo(px + off, py - off); }); x.stroke(); };
  const far = mix(color, "#24432f", 0.4);
  for (const off of [0, 5 * s]) {
    const k = off ? 0.55 : 1;
    x.globalAlpha = a * k;
    limb(far, 22 * s, off, "hip", "kR", "fR"); limb(far, 22 * s, off, "sh", "eR", "hR");
    limb(color, 28 * s, off, "sh", "hip");
    limb(color, 22 * s, off, "hip", "kL", "fL"); limb(color, 22 * s, off, "sh", "eL", "hL");
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
function ring(X, Y, r, c, a) { if (a <= 0) return; x.save(); x.globalAlpha = cl(a); x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke(); x.restore(); }
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.strokeStyle = c; x.lineWidth = 20;
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2 * cl(a * 1.3)); x.stroke(); x.beginPath(); x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); x.stroke(); x.restore();
}
function qmark(X, Y, a, c = ORANGE, px = 90) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = c;
  const s = back(0, 1, a); x.translate(X, Y); x.rotate(0.12); x.scale(s, s); x.fillText("?", 0, 0); x.restore();
}
function clock(X, Y, r, a, late, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.strokeStyle = c; x.lineWidth = 10; x.lineCap = "round";
  x.fillStyle = "#14113a"; x.beginPath(); x.arc(0, 0, r, 0, Math.PI * 2); x.fill(); x.stroke();
  for (let i = 0; i < 12; i++) { const A = (i / 12) * Math.PI * 2; x.lineWidth = 6; x.beginPath(); x.moveTo(Math.cos(A) * r * 0.82, Math.sin(A) * r * 0.82); x.lineTo(Math.cos(A) * r * 0.92, Math.sin(A) * r * 0.92); x.stroke(); }
  x.lineWidth = 10;
  const m = -Math.PI / 2 + late * Math.PI * 4, h = -Math.PI / 2 + late * Math.PI / 3;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(m) * r * 0.8, Math.sin(m) * r * 0.8); x.stroke();
  x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(h) * r * 0.5, Math.sin(h) * r * 0.5); x.stroke(); x.restore();
}
// a week drawn as a chalk grid: 7 day boxes, the first `n` get ticked
function week(X, Y, n, a) {
  if (a <= 0) return;
  const days = ["M", "T", "W", "T", "F", "S", "S"], w = 110, g = 12, x0 = X - (7 * w + 6 * g) / 2;
  x.save(); x.globalAlpha = cl(a);
  days.forEach((dname, i) => {
    const bx = x0 + i * (w + g), on = cl(n - i);
    x.fillStyle = "#14113a"; x.strokeStyle = on > 0.5 ? GREEN : VIOLET; x.lineWidth = 6;
    rr(bx, Y, w, 140, 8); x.fill(); x.stroke();
    x.font = FONT(36); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = VIOLET; x.fillText(dname, bx + w / 2, Y + 32);
    if (on > 0) { x.save(); x.globalAlpha = cl(a) * on; x.strokeStyle = GREEN; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.moveTo(bx + 28, Y + 92); x.lineTo(bx + 48, Y + 114); x.lineTo(bx + 84, Y + 70); x.stroke(); x.restore(); }
  });
  x.restore();
}
// notes written straight on the board, letter by letter, with a chalk box around them
function notebook(X, Y, lines, k, a) {
  if (a <= 0) return;
  const w = 640, h = 520;
  x.save(); x.globalAlpha = cl(a); x.fillStyle = "#14113a"; x.strokeStyle = VIOLET; x.lineWidth = 7;
  rr(X - w / 2, Y, w, h, 10); x.fill(); x.stroke();
  x.globalAlpha = cl(a); x.font = FONT(42); x.textAlign = "left"; x.textBaseline = "alphabetic"; x.fillStyle = GREEN;
  lines.forEach((L, i) => {
    const f = cl(k * lines.length - i); if (f <= 0) return;
    const n = Math.ceil(L.length * f); x.fillText(L.slice(0, n), X - w / 2 + 50, Y + (i + 1) * 104 - 18);
  });
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

  const xs = [230, 520, 810];
  if (id === "s1") {
    const N = sm(at("s1", "new") - 0.1, at("s1", "new") + 0.2, u);
    const Np = sm(at("s1", "practiced") - 0.1, at("s1", "practiced") + 0.15, u);
    person(320, 1400, P.shrug, 0.9, Np > 0.5 ? ORANGE : VIOLET);
    const s = back(at("s1", "new") - 0.1, at("s1", "new") + 0.3, u);
    x.save(); x.globalAlpha = N; x.translate(720, 1000); x.scale(s, s); x.fillStyle = "#14113a"; x.strokeStyle = VIOLET; x.lineWidth = 7; rr(-190, -230, 380, 460, 12); x.fill(); x.stroke(); x.restore();
    if (N > 0) person(720, 1150, P.warrior, 0.6 * s, VIOLET, { a: N });
    tag("NEW POSE", 720, 720, VIOLET, N, 42);
    // NOT PRACTICED is circled and crossed out in red chalk
    tag("NOT PRACTICED", 720, 1300, RED, Np, 42);
    const Xk = sm(at("s1", "practiced") + 0.05, at("s1", "practiced") + 0.35, u);
    if (Xk > 0) { x.save(); x.strokeStyle = RED; x.lineWidth = 14; x.lineCap = "round"; x.beginPath(); x.moveTo(560, 820); x.lineTo(lerp(560, 880, Xk), lerp(820, 1180, Xk)); x.stroke(); x.restore(); }
  }
  if (id === "s2") {
    const Sg = at("s2", "struggle");
    xs.forEach((X, i) => {
      mat(X, 1340, 250, 1);
      const k = sm(Sg - 0.3 + i * 0.1, Sg + i * 0.1, u);
      person(X, 1340, pose(P.warrior, P.wobbly, k), 0.55, k > 0.5 ? ORANGE : VIOLET);
      qmark(X - 50, 1150, k);
    });
    person(860, 880, P.shrug, 0.42, VIOLET);
    qmark(860, 640, sm(at("s2", "know") - 0.1, at("s2", "know") + 0.15, u), RED, 80);
    tag("WHERE?", 300, 820, ORANGE, sm(at("s2", "where") - 0.1, at("s2", "where") + 0.1, u), 48);
  }
  if (id === "s3") {
    person(320, 1400, P.shrug, 0.9, ORANGE);
    bubble("UMM... KIND OF... THERE?", 560, 760, RED, sm(at("s3", "vague") - 0.2, at("s3", "vague") + 0.1, u), 360, 950, 40);
    const L = sm(at("s3", "late") - 0.2, at("s3", "late") + 0.3, u);
    clock(760, 1150, 120, sm(at("s3", "late") - 0.3, at("s3", "late") - 0.1, u), L, RED);
    tag("LATE", 760, 1330, RED, L, 48);
    tag("VAGUE", 260, 960, RED, sm(at("s3", "vague") - 0.1, at("s3", "vague") + 0.1, u), 46);
  }
  if (id === "s4") {
    const k = sm(at("s4", "practice") - 0.1, at("s4", "teach") + 0.2, u);
    week(CX, 620, k * 7, 1);
    mat(CX, 1400, 440, 1, GREEN);
    person(CX, 1400, P.warrior, 1.05, GREEN);
    tag("YOU FIRST", CX, 1510, GREEN, sm(at("s4", "yourself") - 0.1, at("s4", "yourself") + 0.1, u), 44);
  }
  if (id === "s5") {
    const k = sm(at("s5", "write") - 0.1, at("s5", "step") + 0.3, u);
    notebook(CX, 560, ["1. FEET WIDE", "2. KNEE OVER ANKLE", "3. ARMS LONG", "4. HIPS FEEL TIGHT"], k, 1);
    mat(CX, 1420, 360, 1, GREEN);
    person(CX, 1420, P.warrior, 0.72, GREEN);
    tag("EACH STEP", CX, 1510, GREEN, sm(at("s5", "each") - 0.1, at("s5", "each") + 0.1, u), 42);
  }
  if (id === "s6") {
    const F = sm(at("s6", "friend") - 0.15, at("s6", "friend") + 0.15, u);
    const G = sm(at("s6", "small") - 0.15, at("s6", "group") + 0.15, u);
    person(200, 1360, P.stand, 0.6, GREEN);
    bubble("KNEE OVER ANKLE", 380, 700, GREEN, F, 220, 1000, 38);
    mat(470, 1360, 230, 1, GREEN); person(470, 1360, P.warrior, 0.5, GREEN, { a: F });
    tag("A FRIEND", 470, 1450, GREEN, F, 38);
    [700, 860].forEach((X, i) => { mat(X, 1360, 170, G, GREEN); person(X, 1360, P.warrior, 0.38, GREEN, { a: sm(at("s6", "small") - 0.15 + i * 0.1, at("s6", "group") + i * 0.1, u) }); });
    tag("SMALL GROUP", 780, 1450, GREEN, G, 38);
    check(780, 1000, 0.6, sm(at("s6", "group"), at("s6", "group") + 0.2, u));
  }
  if (id === "s7") {
    mat(CX, 1260, 300, 0.7, GREEN);
    person(CX, 1260, P.warrior, 0.5, GREEN, { a: 0.8 });
  }
  x.restore();

  if (id === "s1") { words(["NEVER TEACH A POSE", "YOU HAVEN'T PRACTICED"], RED, 330, 0.0, 1, 120, Math.max(flash(u, 0.05), flash(u, at("s1", "never")))); underline(470, 760, sm(0.4, 0.9, u), RED); }
  if (id === "s2") words(["YOU WON'T KNOW", "WHERE THEY STRUGGLE"], RED, 330, 0.0, 1, 120, flash(u, at("s2", "struggle")) * 0.6);
  if (id === "s3") words(["VAGUE", "AND LATE"], RED, 330, 0.0, 1, 150, flash(u, at("s3", "vague")) * 0.6);
  if (id === "s4") { words(["PRACTICE IT", "FOR A WEEK"], GREEN, 330, 0.0, 1, 150, flash(u, at("s4", "week")) * 0.6); }
  if (id === "s5") words(["WRITE IT DOWN"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "write")) * 0.6);
  if (id === "s6") words(["TRY IT", "ON A FRIEND"], GREEN, 330, 0.0, 1, 150, flash(u, at("s6", "friend")) * 0.6);
  if (id === "s7") {
    words(["PRACTICE FIRST."], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["TEACH SECOND."], ORANGE, 880, at("s7", "teach") - 0.05, 1, 150, flash(u, at("s7", "second")));
    underline(990, 700, sm(at("s7", "second"), at("s7", "second") + 0.4, u), ORANGE);
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
window.__hf.buildReady["practice-first-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
