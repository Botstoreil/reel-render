// second-side (YogaFlow 23) - GLOW SKETCH style.
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

// ---------- second-side (YogaFlow 23) story ----------
const mirror = (p) => { const o = {}; for (const j in p) o[j] = [-p[j][0], p[j][1]]; return o; };
const LUNGE2 = mirror(P.lunge);
// a small breath counter: n dots, the first k lit
function dots(X, Y, n, k, c, a = 1) {
  for (let i = 0; i < n; i++) {
    const cx = X + (i - (n - 1) / 2) * 52, on = cl(k - i);
    draw(C(cx, Y, 16), mix(c, BG, 0.4), 5, a, 300 + i, { a, blur: 8, amp: 1 });
    if (on > 0) { fill(C(cx, Y, 13, 0, 1), c, a * on); }
  }
}
function card(X, Y, w, h, c, p, seed) {
  fill(R(X, Y, w, h, 26), "rgba(10,10,30,0.88)", cl(p * 3));
  draw(R(X, Y, w, h, 26), c, 7, p, seed, { closed: true });
}
function line(txt, X, Y, c, k, px = 50) {
  if (k <= 0) return;
  x.save(); x.font = FONT(px); x.textAlign = "left"; x.textBaseline = "middle"; x.shadowColor = c; x.shadowBlur = 16; x.fillStyle = c;
  const n = Math.ceil(txt.length * cl(k)); x.fillText(txt.slice(0, n), X, Y); x.restore();
}

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
    // side 1 done (check), side 2 mat stays empty and gets a red question mark
    floor(1290, pr(-0.05, 0.5));
    mat(290, 1260, 300, pr(0.0, 0.4), VIOLET, 11);
    person(290, 1260, P.lunge, 0.85, VIOLET, pr(0.05, 0.6), 12);
    tag("SIDE 1", 290, 760, VIOLET, sm(at("s1", "one-sided") - 0.1, at("s1", "one-sided") + 0.2, u), 44);
    stamp("v", 290, 900, 0.55, pr(at("s1", "pose") - 0.1, 0.4), GREEN);
    const F = sm(at("s1", "second") - 0.15, at("s1", "side") + 0.1, u);
    mat(740, 1260, 300, pr(0.1, 0.4), F > 0.5 ? RED : DIM, 13);
    tag("SIDE 2", 740, 760, RED, F, 44);
    tag("?", 740, 1000, RED, sm(at("s1", "forget") - 0.1, at("s1", "forget") + 0.2, u), 110);
  }
  if (id === "s2") {
    // a long flow as a strip of poses; the marker runs along it and loses its place
    const a = pr(-0.05, 0.4);
    card(70, 820, 880, 420, VIOLET, a, 21);
    const seq = [P.stand, P.lunge, P.lowlunge, P.sit, P.stand, LUNGE2];
    seq.forEach((p, i) => { const X = 155 + i * 142; person(X, 1150, p, 0.42, DIM, pr(0.0 + i * 0.06, 0.4), 22 + i * 10); });
    const run = sm(0.05, at("s2", "middle") + 0.1, u);
    const mx = lerp(150, 700, run);
    draw(L(mx, 860, mx, 1200), ORANGE, 8, a, 29, { amp: 1.5 });
    const Lt = sm(at("s2", "lose") - 0.1, at("s2", "track") + 0.15, u);
    tag("WHICH SIDE?", mx, 1350, RED, Lt, 44);
    tag("?", mx, 740, RED, Lt, 90);
    tag("LONG FLOW", CX, 820, VIOLET, sm(at("s2", "long") - 0.1, at("s2", "flow") + 0.1, u), 40);
  }
  if (id === "s3") {
    // a seesaw tips: side 1 heavy, side 2 light; the student leaves leaning
    const a = pr(-0.05, 0.4);
    const tip = 0.2 * sm(at("s3", "feeling") - 0.2, at("s3", "uneven") + 0.2, u);
    const cx = CX, cy = 1120, Ln = 380;
    const lx = cx - Math.cos(tip) * Ln, ly = cy + Math.sin(tip) * Ln, rx = cx + Math.cos(tip) * Ln, ry = cy - Math.sin(tip) * Ln;
    draw([[cx - 60, cy + 120], [cx, cy], [cx + 60, cy + 120]], VIOLET, 9, a, 31, { closed: true });
    draw(L(lx, ly, rx, ry), ORANGE, 12, a, 32);
    tag("SIDE 1", lx + 40, ly - 70, VIOLET, a, 40);
    tag("SIDE 2", rx - 40, ry - 70, RED, sm(at("s3", "students") - 0.1, at("s3", "leave") + 0.1, u), 40);
    floor(1430, a);
    const Lv = sm(at("s3", "leave") - 0.1, at("s3", "class") + 0.4, u);
    person(lerp(CX, 820, Lv), 1430, pose(P.stand, P.lean, sm(at("s3", "uneven") - 0.2, at("s3", "uneven") + 0.2, u)), 0.55, ORANGE, pr(0.0, 0.5), 35);
    tag("UNEVEN", CX, 760, RED, sm(at("s3", "uneven") - 0.1, at("s3", "uneven") + 0.15, u), 54);
  }
  if (id === "s4") {
    // the class plan: both sides written in
    const a = pr(-0.05, 0.4);
    card(110, 620, 800, 640, GREEN, a, 41);
    tag("CLASS PLAN", CX, 620, GREEN, cl(a * 2), 42);
    line("1. LUNGE - SIDE 1", 170, 760, VIOLET, sm(at("s4", "write") - 0.05, at("s4", "both") + 0.2, u));
    line("2. LUNGE - SIDE 2", 170, 870, GREEN, sm(at("s4", "both") - 0.05, at("s4", "sides") + 0.3, u));
    line("3. TWIST - SIDE 1", 170, 980, VIOLET, sm(at("s4", "into") - 0.05, at("s4", "your") + 0.25, u));
    line("4. TWIST - SIDE 2", 170, 1090, GREEN, sm(at("s4", "class") - 0.05, at("s4", "plan") + 0.25, u));
    stamp("v", 820, 1180, 0.45, pr(at("s4", "plan") - 0.05, 0.4), GREEN);
    floor(1430, a);
    person(CX, 1430, P.stand, 0.45, GREEN, pr(0.0, 0.5), 45);
  }
  if (id === "s5") {
    // the same pose on both sides, the same breath count under each
    floor(1300, pr(-0.05, 0.5));
    mat(290, 1270, 300, pr(0.0, 0.4), GREEN, 51); person(290, 1270, P.lunge, 0.8, GREEN, pr(0.0, 0.5), 52);
    mat(740, 1270, 300, pr(0.05, 0.4), GREEN, 53); person(740, 1270, LUNGE2, 0.8, GREEN, pr(0.05, 0.5), 54);
    const B = sm(at("s5", "number") - 0.1, at("s5", "side") + 0.2, u) * 5;
    dots(290, 1380, 5, B, GREEN); dots(740, 1380, 5, B, GREEN);
    tag("5 BREATHS", 290, 780, GREEN, sm(at("s5", "breaths") - 0.1, at("s5", "breaths") + 0.15, u), 40);
    tag("5 BREATHS", 740, 780, GREEN, sm(at("s5", "each") - 0.1, at("s5", "each") + 0.15, u), 40);
  }
  if (id === "s6") {
    // teacher says it out loud; an arrow carries the flow to side 2
    floor(1310, pr(-0.05, 0.5));
    person(220, 1280, with_(P.stand, { eR: [80, -330], hR: [150, -390] }), 0.85, GREEN, pr(-0.05, 0.5), 61);
    bubble("SAME FLOW, SECOND SIDE", 600, 720, GREEN, sm(at("s6", "same") - 0.25, at("s6", "flow") + 0.1, u), 260, 900, 42);
    tag("OUT LOUD", 260, 560, VIOLET, sm(at("s6", "out") - 0.1, at("s6", "loud") + 0.1, u), 40);
    const S2 = sm(at("s6", "second") - 0.15, at("s6", "side") + 0.2, u);
    mat(560, 1280, 220, 1, VIOLET, 62); person(560, 1280, P.lunge, 0.6, VIOLET, pr(0.05, 0.5), 63);
    arrow(660, 1050, 730, 1050, GREEN, S2, 64);
    mat(850, 1280, 220, S2, GREEN, 65); person(850, 1280, LUNGE2, 0.6, GREEN, S2, 66);
  }
  if (id === "s7") {
    mat(330, 1180, 240, 0.6, GREEN); person(330, 1180, P.lunge, 0.55, GREEN, 1, 71, { a: 0.7 });
    mat(700, 1180, 240, 0.6, GREEN); person(700, 1180, LUNGE2, 0.55, GREEN, 1, 72, { a: 0.7 });
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER FORGET", "THE SECOND SIDE"], RED, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "never") - 0.1);
  if (id === "s2") words(["EASY TO", "LOSE TRACK"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "lose")) * 0.6);
  if (id === "s3") words(["THEY LEAVE", "UNEVEN"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "uneven")) * 0.6);
  if (id === "s4") words(["WRITE BOTH", "SIDES DOWN"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "both")) * 0.6);
  if (id === "s5") words(["SAME BREATHS", "EACH SIDE"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "same")) * 0.6);
  if (id === "s6") words(["SAY IT", "OUT LOUD"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "loud")) * 0.6, at("s6", "loud") - 0.05);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["FIRST SIDE."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["THEN SECOND."], ORANGE, 880, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "second")), at("s7", "second") - 0.05);
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
window.__hf.buildReady["second-side-glow-sketch"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
