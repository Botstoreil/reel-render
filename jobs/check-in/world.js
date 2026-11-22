// check-in (YogaFlow 18) - GLOW SKETCH style. Same story, words and timing as world.flat.js.bak.
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

const RED = "#ff3b4e", GREEN = "#46ff9a", VIOLET = "#9d8cff", ORANGE = "#ff7a26", WHITE = "#ffffff", BG = "#05060c";
const CX = 510, TAU = Math.PI * 2;
const cv = document.getElementById("world");
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;

// ===================== STYLE KIT: GLOW SKETCH =====================
// copy kept in ~/jarvis-admin/tmp/studio/style-kits/style-glow-sketch.js (reuse for any reel / RB showcase)
let NOW = 0, curU = 0;
const hs = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const boil = () => Math.floor(NOW * 8);
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}
// shapes -> point lists
const L = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];
function R(X, Y, w, h, r = 0) {
  if (r <= 0) return [[X, Y], [X + w, Y], [X + w, Y + h], [X, Y + h]];
  const c = [[X + w - r, Y + r, -Math.PI / 2], [X + w - r, Y + h - r, 0], [X + r, Y + h - r, Math.PI / 2], [X + r, Y + r, Math.PI]];
  const out = [];
  c.forEach(([cx, cy, a0]) => { for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } });
  return out;
}
function C(cx, cy, r, a0 = -Math.PI / 2, turns = 1.07) {
  const n = Math.max(14, Math.round(r / 5)), out = [];
  for (let i = 0; i <= n * turns; i++) { const a = a0 + (i / n) * TAU; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return out;
}
function prep(pts, closed, seed, amp) {
  const P = closed ? pts.concat([pts[0], pts[1] || pts[0]]) : pts;
  const out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const [ax, ay] = P[i], [bx, by] = P[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 26));
    for (let j = 0; j < n; j++) { const k = j / n; out.push([ax + (bx - ax) * k, ay + (by - ay) * k]); }
  }
  out.push(P[P.length - 1]);
  const f = boil();
  return out.map(([px, py], i) => { const q = seed * 31.7 + i * 7.3 + f * 13.1; return [px + (hs(q) - 0.5) * 2 * amp, py + (hs(q + 5.7) - 0.5) * 2 * amp]; });
}
function trace(pts, p) {
  let tot = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); tot += d; }
  const lim = tot * p; let acc = 0, head = pts[0];
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (acc + seg[i - 1] >= lim) { const k = seg[i - 1] ? (lim - acc) / seg[i - 1] : 1; head = [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; x.lineTo(head[0], head[1]); break; }
    x.lineTo(pts[i][0], pts[i][1]); acc += seg[i - 1]; head = pts[i];
  }
  return head;
}
// one hand-drawn neon stroke: glow line + second sketch line + hot core + a pen tip while it draws on
function draw(pts, color, w, p = 1, seed = 1, o = {}) {
  if (p <= 0) return;
  p = Math.min(1, p);
  const amp = o.amp ?? 2.4, closed = !!o.closed, a = o.a ?? 1;
  const A = prep(pts, closed, seed, amp), B = prep(pts, closed, seed + 91, amp * 1.8);
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.globalCompositeOperation = "lighter";
  x.globalAlpha = a * 0.8; x.shadowColor = color; x.shadowBlur = o.blur ?? 24; x.strokeStyle = color; x.lineWidth = w;
  const head = trace(A, p); x.stroke();
  x.shadowBlur = 0; x.globalAlpha = a * 0.4; x.lineWidth = Math.max(1.5, w * 0.32); trace(B, p); x.stroke();
  x.globalAlpha = a * 0.9; x.strokeStyle = mix(color, WHITE, 0.6); x.lineWidth = Math.max(1.5, w * 0.28); trace(A, p); x.stroke();
  if (p < 0.995) { x.globalAlpha = a; x.shadowColor = WHITE; x.shadowBlur = 26; x.fillStyle = WHITE; x.beginPath(); x.arc(head[0], head[1], w * 0.5 + 4, 0, TAU); x.fill(); }
  x.restore();
}
// flat dim fill under a shape (no jitter) so objects separate from the paper
function fill(pts, color, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.closePath(); x.fill(); x.restore();
}
// diagonal hatching inside a rect, lines draw on one after another
function hatch(X, Y, w, h, color, p, seed, gap = 30, a = 0.5) {
  if (p <= 0) return;
  x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
  const n = Math.ceil((w + h) / gap);
  for (let i = 0; i < n; i++) { const q = cl(p * 1.6 - (i / n) * 0.6); if (q <= 0) continue; const s = X + i * gap; draw(L(s, Y, s - h, Y + h), color, 3, q, seed + i, { a, blur: 8, amp: 1.5 }); }
  x.restore();
}
// paper: near-black blue, soft vignette, grain that boils with the lines
function paper(dark) {
  x.fillStyle = BG; x.fillRect(0, 0, 1080, 1920);
  const gr = x.createRadialGradient(CX, 820, 60, CX, 820, 1050); gr.addColorStop(0, "#121638"); gr.addColorStop(1, "rgba(5,6,12,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  const f = boil(); x.fillStyle = "rgba(200,210,255,0.05)";
  for (let i = 0; i < 420; i++) x.fillRect(hs(i * 3.1 + f * 0.37) * 1080, hs(i * 7.7 + f * 0.91) * 1920, 2, 2);
  if (dark > 0) { x.fillStyle = `rgba(1,1,6,${0.7 * dark})`; x.fillRect(0, 0, 1080, 1920); }
}
// kinetic words: each word pops in, solid neon fill + a sketched outline that boils
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0, underline = -1) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((Ln) => { x.font = FONT(100); return Math.min(maxPx, (840 / x.measureText(Ln).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  const f = boil();
  lines.forEach((Ln, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = Ln.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.32, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.12, curU);
      const s = 0.4 + 0.6 * k, rot = (hs(wi * 3.3 + li) - 0.5) * 0.06;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.rotate(rot); x.scale(s, s); x.globalAlpha = a * o;
      x.shadowColor = color; x.shadowBlur = 28 + 40 * flashK; x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
      x.fillText(p, 0, 0);
      x.shadowBlur = 0; x.lineWidth = 3; x.strokeStyle = mix(color, WHITE, 0.7); x.globalAlpha = a * o * 0.8;
      x.strokeText(p, (hs(f + wi) - 0.5) * 6, (hs(f * 1.7 + wi) - 0.5) * 6);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    if (li === lines.length - 1 && underline >= 0) draw([[CX - full / 2 - 10, y + px * 1.1], [CX, y + px * 1.16], [CX + full / 2 + 10, y + px * 1.06]], color, 9, sm(underline, underline + 0.35, curU) * a, 77 + li, { amp: 3 });
    y += px * 1.08;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px); const w = x.measureText(txt).width + 50; x.restore();
  fill(R(X - w / 2, Y - px * 0.75, w, px * 1.5, px * 0.7), "rgba(5,6,12,0.88)", a);
  draw(R(X - w / 2, Y - px * 0.75, w, px * 1.5, px * 0.7), color, 5, a, X + Y, { closed: true, blur: 16 });
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  x.shadowColor = color; x.shadowBlur = 18; x.fillStyle = color; x.fillText(txt, X, Y + 3); x.restore();
}
const pr = (t0, dur = 0.5) => cl((curU - t0) / dur);
// ===================== end of kit =====================

// ---------- props (all line drawings) ----------
// pictogram people: joints in px, y up = negative, origin on the floor (same poses as the flat version)
const P = {
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] },
  lunge: { head: [0, -400], sh: [0, -330], hip: [0, -170], kL: [-110, -110], fL: [-130, 0], kR: [90, -70], fR: [190, 0], eL: [-30, -450], hL: [-20, -560], eR: [30, -450], hR: [20, -560] },
  lowlunge: { head: [-10, -350], sh: [-10, -280], hip: [10, -130], kL: [-110, -100], fL: [-130, 0], kR: [110, -10], fR: [200, 0], eL: [-70, -200], hL: [-100, -120], eR: [-40, -200], hR: [-80, -115] },
  lean: { head: [40, -385], sh: [20, -315], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-20, -245], hL: [-30, -175], eR: [50, -245], hR: [40, -175] },
};
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function with_(p, ch) { return Object.assign({}, p, ch); }
function walkPose(sw) { return with_(P.stand, { fL: [-24 + 40 * sw, 0], fR: [24 - 40 * sw, 0], kL: [-14 + 20 * sw, -98], kR: [14 - 20 * sw, -98] }); }
// a neon stick figure that draws itself on (prog 0..1)
function person(X, Y, p, s, color, prog = 1, seed = 1, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  if (prog <= 0) return W2;
  const a = o.a ?? 1, w = 15 * s + 5, far = mix(color, BG, 0.4);
  const pts = (...js) => js.map(W2);
  const [hx, hy] = W2("head"), r = 42 * s;
  draw(pts("hip", "kR", "fR"), far, w, cl(prog * 1.5 - 0.3), seed + 1, { a, blur: 12 });
  draw(pts("sh", "eR", "hR"), far, w, cl(prog * 1.5 - 0.4), seed + 2, { a, blur: 12 });
  draw([[hx + (W2("sh")[0] - hx) * 0.45, hy + r], W2("sh"), W2("hip")], color, w * 1.25, cl(prog * 1.5 - 0.1), seed + 3, { a });
  draw(pts("hip", "kL", "fL"), color, w, cl(prog * 1.5 - 0.3), seed + 4, { a });
  draw(pts("sh", "eL", "hL"), color, w, cl(prog * 1.5 - 0.4), seed + 5, { a });
  fill(C(hx, hy, r, 0, 1), "#0b0c1e", a * cl(prog * 3));
  draw(C(hx, hy, r), color, w, cl(prog * 1.5), seed + 6, { a });
  if (o.closed) {
    const arcP = (cx) => { const out = []; for (let i = 0; i <= 8; i++) { const an = 0.25 + (i / 8) * (Math.PI - 0.5); out.push([cx + Math.cos(an) * 10 * s, hy - 4 * s + Math.sin(an) * 10 * s]); } return out; };
    draw(arcP(hx - 14 * s), color, 4, cl(prog * 2 - 1), seed + 7, { a, blur: 8, amp: 1 });
    draw(arcP(hx + 14 * s), color, 4, cl(prog * 2 - 1), seed + 8, { a, blur: 8, amp: 1 });
  }
  return W2;
}
function mat(X, Y, w, p = 1, c = VIOLET, seed = 3) {
  if (p <= 0) return;
  fill(R(X - w / 2, Y, w, 22, 11), mix(c, BG, 0.75), cl(p * 3));
  draw(R(X - w / 2, Y, w, 22, 11), c, 6, p, seed + X, { closed: true, blur: 14, amp: 1.6 });
}
// speech bubble with a sketched tail toward (tx, ty); a draws it on
function bubble(txt, X, Y, color, a, tx, ty, px = 52) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px); const w = x.measureText(txt).width + 76; x.restore();
  const h = px * 1.9;
  X = Math.min(X, 940 - w / 2); X = Math.max(X, 60 + w / 2);
  const box = R(X - w / 2, Y - h / 2, w, h, 36);
  const ex = X + (tx - X) * 0.4, ey = Y + h / 2 + Math.max(40, (ty - Y - h / 2) * 0.5);
  fill(box, "rgba(10,10,30,0.92)", cl(a * 2));
  fill([[X - 30, Y + h / 2 - 2], [ex, ey], [X + 20, Y + h / 2 - 2]], "rgba(10,10,30,0.92)", cl(a * 2));
  draw(box, color, 7, a, X + Y, { closed: true, blur: 18 });
  draw([[X - 30, Y + h / 2], [ex, ey], [X + 20, Y + h / 2]], color, 7, cl(a * 1.5 - 0.5), X + Y + 1, { blur: 18 });
  x.save(); x.globalAlpha = cl(a * 1.6 - 0.3); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  x.shadowColor = color; x.shadowBlur = 20; x.fillStyle = color; x.fillText(txt, X, Y + 3); x.restore();
}
function ring(X, Y, r, c, p, a = 1, seed = 5) { if (p > 0 && a > 0) draw(C(X, Y, r), c, 8, p, seed, { a, amp: 3 }); }
// wall clock; hands at h (0..12) and m (0..60)
function clock(X, Y, r, p, c, h, m) {
  if (p <= 0) return;
  fill(C(X, Y, r, 0, 1), "#0d1028", cl(p * 3));
  draw(C(X, Y, r), c, 9, p, 201);
  for (let i = 0; i < 12; i += 3) { const an = (i / 12) * TAU; draw(L(X + Math.sin(an) * r * 0.78, Y - Math.cos(an) * r * 0.78, X + Math.sin(an) * r * 0.9, Y - Math.cos(an) * r * 0.9), c, 5, cl(p * 2 - 1), 202 + i, { blur: 8, amp: 1 }); }
  const hand = (an, Ln, sd) => draw(L(X, Y, X + Math.sin(an) * Ln, Y - Math.cos(an) * Ln), c, 9, cl(p * 2 - 0.8), sd, { amp: 1 });
  hand((h / 12) * TAU, r * 0.5, 215); hand((m / 60) * TAU, r * 0.78, 216);
}
// eye with a slash: something you can't see
function blindEye(X, Y, s, p, c) {
  if (p <= 0) return;
  const up = [], lo = [];
  for (let i = 0; i <= 16; i++) { const k = i / 16, ex = -90 + 180 * k, ey = -80 * k * (1 - k) * 2; up.push([X + ex * s, Y + ey * s]); lo.push([X + ex * s, Y - ey * s]); }
  draw(up, c, 10, p, 221); draw(lo, c, 10, p, 222);
  draw(C(X, Y, 26 * s), c, 9, cl(p * 1.4 - 0.3), 223);
  draw(L(X - 80 * s, Y - 70 * s, X + 80 * s, Y + 70 * s), c, 12, cl(p * 2 - 1), 224);
}
// lips zipped: a closed mouth line with stitches
function zipped(X, Y, s, p, c) {
  if (p <= 0) return;
  draw(L(X - 40 * s, Y, X + 40 * s, Y), c, 7, p, 231, { blur: 12, amp: 1 });
  for (let i = -2; i <= 2; i++) draw(L(X + i * 15 * s, Y - 11 * s, X + i * 15 * s, Y + 11 * s), c, 5, cl(p * 2 - 0.6 - i * 0.08), 232 + i, { blur: 10, amp: 1 });
}
function arrow(x0, y0, x1, y1, c, p, seed) {
  if (p <= 0) return;
  draw(L(x0, y0, x1, y1), c, 12, p, seed);
  const an = Math.atan2(y1 - y0, x1 - x0), hd = (q) => [x1 - Math.cos(an + q) * 40, y1 - Math.sin(an + q) * 40];
  draw([hd(0.6), [x1, y1], hd(-0.6)], c, 12, cl(p * 2 - 1), seed + 1);
}
function stamp(kind, X, Y, s, p, color) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw(C(0, 0, 80), color, 16, cl(p * 1.6), 31 + X);
  const q = cl(p * 1.6 - 0.6);
  if (kind === "x") { draw(L(-40, -40, 40, 40), color, 16, q * 2, 32); draw(L(40, -40, -40, 40), color, 16, q * 2 - 1, 33); }
  else draw([[-42, 4], [-12, 34], [44, -30]], color, 16, q, 34);
  x.restore();
}
// a soft floor line under the scene so people stand on something
function floor(Y, p, c = VIOLET) { draw([[60, Y], [CX, Y + 6], [1020, Y]], mix(c, BG, 0.55), 4, p, 241 + Y, { blur: 8, amp: 2 }); }

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  NOW = t; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.shadowBlur = 0;
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  paper(id === "s7" ? 0.6 : 0);
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);
  const DIM = mix(VIOLET, BG, 0.25);

  if (id === "s1") {
    // a class on mats; a new face walks in at the edge (NEW); the teacher is about to start
    floor(1290, pr(-0.05, 0.5));
    const Nw = sm(0.0, at("s1", "class") + 0.1, u);
    [330, 620, 880].forEach((X, i) => { mat(X, 1260, 220, pr(0.0 + i * 0.05, 0.4)); person(X, 1260, P.sit, 0.6, DIM, pr(0.05 + i * 0.06, 0.5), 10 + i * 10); });
    person(lerp(-60, 130, Nw), 1260, walkPose(Math.sin(u * 9) * (1 - Nw) * 0.9), 0.6, ORANGE, pr(-0.05, 0.4), 50);
    tag("NEW", 130, 960, ORANGE, sm(at("s1", "faces") - 0.05, at("s1", "faces") + 0.2, u), 40);
    person(CX, 860, P.stand, 0.5, GREEN, pr(0.1, 0.5), 60);
    const Ck = sm(at("s1", "check") - 0.15, at("s1", "check") + 0.15, u);
    bubble("LET'S BEGIN", 700, 560, RED, sm(at("s1", "start") - 0.15, at("s1", "start") + 0.15, u) * (1 - Ck), CX, 640, 46);
    tag("CHECK IN FIRST", 700, 560, GREEN, Ck, 44);
  }
  if (id === "s2") {
    // one student; three hidden things light up on the body, then fade: you can't see them
    floor(1405, pr(-0.05, 0.5));
    const Sp = person(CX, 1400, P.stand, 1.7, VIOLET, pr(-0.05, 0.7), 70);
    const fade = 1 - sm(at("s2", "can't") - 0.1, at("s2", "see") + 0.1, u);
    const [kx, ky] = Sp("kL"), [hx, hy] = Sp("hip"), [sx, sy] = Sp("sh");
    const I = pr(at("s2", "injury") - 0.1, 0.3), Pg = pr(at("s2", "pregnancy") - 0.1, 0.3), Bk = pr(at("s2", "sore") - 0.1, 0.3);
    ring(kx, ky, 60, ORANGE, I, fade, 81); tag("INJURY", kx - 210, ky, ORANGE, Math.min(1, I * 2) * fade, 40);
    ring(hx + 10, (hy + sy) / 2 + 60, 72, ORANGE, Pg, fade, 82); tag("PREGNANCY", hx + 250, (hy + sy) / 2 + 60, ORANGE, Math.min(1, Pg * 2) * fade, 40);
    ring(hx, hy - 30, 60, ORANGE, Bk, fade, 83); tag("SORE BACK", hx - 240, hy - 120, ORANGE, Math.min(1, Bk * 2) * fade, 40);
    blindEye(CX, 560, 0.95, pr(at("s2", "can't") - 0.1, 0.45), RED);
  }
  if (id === "s3") {
    // the new student sits among others, lips zipped; the room is watching
    floor(1250, pr(-0.05, 0.5));
    const ps = [200, 500, 800].map((X, i) => { mat(X, 1220, 230, pr(0.0, 0.4), VIOLET, 90 + i); return person(X, 1220, P.sit, 0.8, i === 1 ? ORANGE : DIM, pr(0.02 + i * 0.05, 0.5), 91 + i * 10); });
    const [ex, ey] = ps[1]("head");
    zipped(ex, ey + 14, 0.65, pr(at("s3", "say") - 0.15, 0.4), RED);
    bubble("...", ex, ey - 210, VIOLET, sm(at("s3", "few") - 0.15, at("s3", "few") + 0.2, u), ex, ey - 40, 60);
    const Fr = sm(at("s3", "front") - 0.15, at("s3", "room") + 0.1, u);
    [0, 2].forEach((i) => { const [qx, qy] = ps[i]("head"); tag("?", qx, qy - 110, RED, Fr * 0.9, 40); });
    tag("IN FRONT OF EVERYONE", CX, 1420, RED, Fr, 40);
  }
  if (id === "s4") {
    // clock shows early; teacher walks over and greets the new student by name
    floor(1310, pr(-0.05, 0.5));
    clock(840, 600, 100, pr(-0.05, 0.5), GREEN, 5.75, 45 + 15 * sm(0, d, u));
    tag("EARLY", 840, 760, GREEN, sm(at("s4", "early") - 0.1, at("s4", "early") + 0.15, u), 40);
    const Wk = sm(at("s4", "and") - 0.1, at("s4", "greet") + 0.3, u);
    const sw = Math.sin(u * 9) * (Wk > 0.02 && Wk < 0.98 ? 0.9 : 0);
    const G = sm(at("s4", "greet") - 0.05, at("s4", "greet") + 0.25, u);
    const wave = with_(walkPose(sw), { eR: [70, -360], hR: [lerp(38, 90, G), lerp(-185, -470 + 20 * Math.sin(u * 14), G)] });
    person(lerp(150, 380, Wk), 1280, wave, 0.9, GREEN, pr(0.0, 0.5), 110);
    person(720, 1280, P.stand, 0.9, ORANGE, pr(0.1, 0.5), 120);
    bubble("HI, MAYA!", 380, 760, GREEN, sm(at("s4", "name") - 0.3, at("s4", "name") + 0.05, u), 400, 880, 52);
  }
  if (id === "s5") {
    // teacher leans in, a small quiet bubble; the rest of the room is far and dim
    floor(1310, pr(-0.05, 0.5));
    [170, 870].forEach((X, i) => person(X, 1050, P.sit, 0.4, mix(VIOLET, BG, 0.5), pr(0.05, 0.5), 130 + i * 10, { a: 0.7 }));
    person(400, 1280, pose(P.stand, P.lean, sm(0, 0.4, u)), 0.9, GREEN, pr(-0.05, 0.5), 150);
    person(640, 1280, P.stand, 0.9, ORANGE, pr(0.05, 0.5), 160);
    bubble("ANYTHING I SHOULD KNOW?", CX, 720, GREEN, sm(at("s5", "anything") - 0.25, at("s5", "know") + 0.1, u), 450, 900, 40);
    tag("QUIETLY", 280, 560, GREEN, sm(at("s5", "quietly") - 0.1, at("s5", "quietly") + 0.15, u), 40);
  }
  if (id === "s6") {
    // plan card: full lunge -> arrow -> easier option, then a check
    const a = pr(-0.05, 0.5);
    fill(R(90, 640, 840, 760, 30), "rgba(10,10,30,0.85)", cl(a * 3));
    draw(R(90, 640, 840, 760, 30), VIOLET, 7, a, 171, { closed: true });
    hatch(90, 640, 840, 760, VIOLET, a, 172, 70, 0.1);
    tag("PLAN", CX, 640, VIOLET, cl(a * 2), 40);
    mat(300, 1240, 260, pr(0.05, 0.4), VIOLET, 173); person(300, 1240, P.lunge, 0.85, VIOLET, pr(0.1, 0.6), 180);
    const E = sm(at("s6", "easier") - 0.15, at("s6", "option") + 0.2, u);
    arrow(470, 1000, 575, 1000, GREEN, E, 190);
    mat(740, 1240, 260, E, GREEN, 191); person(740, 1240, P.lowlunge, 0.85, GREEN, E, 195);
    tag("EASIER OPTION", 740, 1330, GREEN, E, 38);
    stamp("v", 740, 760, 0.55, pr(at("s6", "before") - 0.1, 0.4), GREEN);
  }
  if (id === "s7") {
    mat(CX, 1130, 260, 0.6, GREEN);
    person(CX, 1130, P.sit, 0.5, GREEN, 1, 200, { closed: true, a: 0.7 });
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER START", "WITHOUT A CHECK-IN"], RED, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "never") - 0.1);
  if (id === "s2") words(["YOU CAN'T", "SEE IT"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "see")) * 0.6);
  if (id === "s3") words(["FEW SAY IT", "OUT LOUD"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "loud")) * 0.6);
  if (id === "s4") words(["ARRIVE EARLY"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "early")) * 0.6, at("s4", "early") - 0.05);
  if (id === "s5") words(["ASK QUIETLY"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "quietly")) * 0.6, at("s5", "quietly") - 0.05);
  if (id === "s6") words(["PLAN AN", "EASIER OPTION"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "easier")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["ASK EARLY."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["ASK QUIETLY."], ORANGE, 880, at("s7", "ask", 2) - 0.05, 1, 150, flash(u, at("s7", "quietly")), at("s7", "quietly") - 0.05);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    draw(C(CX, 560, 120), VIOLET, 12, pr(0.0, 0.45), 261);
    draw(C(CX, 560, 155, u * 3, 0.23), GREEN, 10, 1, 262, { amp: 2 });
    person(CX, 560 + 95, P.sit, 0.62, VIOLET, pr(0.1, 0.5), 270, { closed: true });
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150, 0, 0.6);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["check-in-glow-sketch"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
