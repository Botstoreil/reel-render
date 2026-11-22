// vents (Hidden Cam 14) - GLOW SKETCH style: dark paper, neon strokes that draw themselves on, hand jitter that boils
// at 8 fps. Same story, words and timing as the flat version (world.flat.js.bak). Time only from hf-seek.
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
function vent(X, Y, w, h, p, rim = VIOLET, inside = null) {
  if (p <= 0) return;
  const box = R(X - w / 2, Y - h / 2, w, h, 22);
  fill(box, "#090a1c", cl(p * 3));
  if (inside) { x.save(); x.beginPath(); x.rect(X - w / 2 + 10, Y - h / 2 + 10, w - 20, h - 20); x.clip(); inside(); x.restore(); }
  const n = Math.max(4, Math.round(h / 52)), gap = (h - 40) / n;
  for (let i = 0; i < n; i++) {
    const y = Y - h / 2 + 24 + i * gap, q = cl(p * 1.9 - 0.15 - i * (0.7 / n));
    const sl = R(X - w / 2 + 24, y, w - 48, gap * 0.55, 6);
    fill(sl, "#121433", q > 0 ? (inside ? 0.45 : 1) : 0);
    draw(sl, mix(rim, "#05060c", 0.35), 4, q, Y + i * 13, { closed: true, blur: 10, amp: 1.6 });
  }
  draw(box, rim, 10, cl(p * 1.2), X * 3 + Y, { closed: true });
}
function camIcon(X, Y, s, p, color = RED, blink = 1) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  fill(R(-90, -55, 180, 110, 22), "#1a0812", cl(p * 3));
  draw(R(-90, -55, 180, 110, 22), color, 8, p, 11, { closed: true });
  draw(C(0, 0, 38), color, 7, cl(p * 1.4 - 0.3), 12);
  fill(C(0, 0, 18, 0, 1), color, cl(p * 2 - 1));
  fill(C(64, -36, 10, 0, 1), color, cl(p * 2 - 1) * blink);
  x.restore();
}
function lens(X, Y, s, p, color = RED) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  fill(C(0, 0, 30, 0, 1), "#12060e", cl(p * 3));
  draw(C(0, 0, 30), color, 6, p, 21);
  fill(C(0, 0, 12, 0, 1), color, cl(p * 2 - 0.8));
  fill(C(-6, -6, 4, 0, 1), WHITE, cl(p * 2 - 1));
  x.restore();
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
function phone(X, Y, s, p, rot = 0, lamp = 0) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  fill(R(-80, -150, 160, 300, 28), "#100e2c", cl(p * 3));
  draw(R(-80, -150, 160, 300, 28), VIOLET, 8, p, 41, { closed: true });
  draw(R(-62, -118, 124, 236, 14), mix(VIOLET, BG, 0.4), 4, cl(p * 1.4 - 0.3), 42, { closed: true, blur: 8 });
  if (lamp > 0) { x.save(); x.globalCompositeOperation = "lighter"; x.globalAlpha = lamp; x.shadowColor = WHITE; x.shadowBlur = 60; x.fillStyle = WHITE; x.beginPath(); x.arc(0, -120, 16, 0, TAU); x.fill(); x.restore(); }
  x.restore();
}
function lampProp(X, Y, s, p, c = VIOLET) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  const shade = [[-70, -40], [70, -40], [45, -140], [-45, -140]];
  fill(shade, "#14123a", cl(p * 3));
  draw(shade, c, 10, p, 51, { closed: true });
  draw(L(0, -40, 0, 90), c, 10, cl(p * 1.5 - 0.3), 52);
  draw(R(-60, 90, 120, 26, 12), c, 10, cl(p * 1.5 - 0.5), 53, { closed: true });
  hatch(-70, -140, 140, 100, c, cl(p * 1.3 - 0.3), 54, 26, 0.35);
  x.restore();
}
function charger(X, Y, s, p, c = VIOLET) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  fill(R(-60, -70, 120, 140, 20), "#14123a", cl(p * 3));
  draw(R(-60, -70, 120, 140, 20), c, 10, p, 61, { closed: true });
  draw(L(-25, -70, -25, -110), c, 10, cl(p * 1.5 - 0.4), 62); draw(L(25, -70, 25, -110), c, 10, cl(p * 1.5 - 0.5), 63);
  draw(L(-24, 19, 24, 19), c, 14, cl(p * 1.5 - 0.5), 64);
  x.restore();
}
function furn(kind, X, Y, s, p, c) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  const sd = X * 0.7;
  if (kind === "bed") {
    draw(R(-110, -10, 220, 60, 12), c, 9, p, sd, { closed: true });
    draw(R(-110, -60, 60, 50, 12), c, 9, cl(p * 1.4 - 0.2), sd + 1, { closed: true });
    draw(L(-110, 50, -110, 80), c, 9, cl(p * 2 - 1), sd + 2); draw(L(110, 50, 110, 80), c, 9, cl(p * 2 - 1), sd + 3);
  } else if (kind === "shower") {
    draw([[-60, 90], [-60, -80], [20, -80], [20, -50]], c, 9, p, sd);
    draw(L(-20, -50, 60, -50), c, 9, cl(p * 1.4 - 0.3), sd + 1);
    for (let i = 0; i < 4; i++) draw(L(-10 + i * 20, -30, -16 + i * 20, 10), c, 6, cl(p * 2 - 0.8 - i * 0.1), sd + 2 + i);
  } else {
    draw(R(-120, -20, 240, 60, 16), c, 9, p, sd, { closed: true });
    draw(R(-120, -70, 240, 50, 16), c, 9, cl(p * 1.4 - 0.2), sd + 1, { closed: true });
    draw(R(-150, -40, 40, 80, 14), c, 9, cl(p * 1.6 - 0.5), sd + 2, { closed: true });
    draw(R(110, -40, 40, 80, 14), c, 9, cl(p * 1.6 - 0.5), sd + 3, { closed: true });
  }
  x.restore();
}
function walker(X, Y, s, p, ph) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  const sw = Math.sin(ph) * 0.5;
  draw(C(0, -150, 34), WHITE, 13, p, 71, { blur: 14 });
  draw(L(0, -112, 0, 10), WHITE, 13, p, 72, { blur: 14 });
  [sw, -sw].forEach((an, i) => draw(L(0, 10, Math.sin(an) * 90, 10 + Math.cos(an) * 90), WHITE, 13, p, 73 + i, { blur: 14 }));
  [-sw, sw].forEach((an, i) => draw(L(0, -90, Math.sin(an) * 70, -90 + Math.cos(an) * 70), WHITE, 13, p, 75 + i, { blur: 14 }));
  x.restore();
}
function beamTo(x0, y0, x1, y1, w, a, c) {
  if (a <= 0) return;
  const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy), nx = -dy / Ln, ny = dx / Ln;
  x.save(); x.globalCompositeOperation = "lighter"; x.globalAlpha = 0.32 * a;
  const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = gr; x.beginPath(); x.moveTo(x0 + nx * 12, y0 + ny * 12); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 12, y0 - ny * 12); x.closePath(); x.fill();
  x.restore();
  draw(L(x0 + nx * 12, y0 + ny * 12, x1 + nx * w, y1 + ny * w), c, 3, a, x0 + 1, { a: 0.5, blur: 10 });
  draw(L(x0 - nx * 12, y0 - ny * 12, x1 - nx * w, y1 - ny * w), c, 3, a, x0 + 2, { a: 0.5, blur: 10 });
}

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  NOW = t; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.shadowBlur = 0;
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  const dark = id === "s4" ? sm(at("s4", "off") - 0.05, at("s4", "lights"), u) : id === "s5" ? 1 : id === "s7" ? 0.6 : 0;
  paper(dark);
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);

  if (id === "s1") {
    const a = pr(-0.05, 0.7);
    const peek = sm(at("s1", "small") - 0.1, at("s1", "cameras") + 0.1, u);
    vent(CX, 880, 560, 460, a, peek > 0.5 ? RED : VIOLET, () => {
      camIcon(CX + 60, lerp(1100, 900, peek), 1.1, pr(at("s1", "small") - 0.1, 0.5), RED, 0.5 + 0.5 * Math.sin(u * 14));
    });
    tag("COMMON SPOT", CX, 1190, RED, sm(at("s1", "common") - 0.1, at("s1", "common") + 0.15, u));
  }
  if (id === "s2") {
    const l = pr(at("s2", "lamps") - 0.2, 0.3), c = pr(at("s2", "chargers") - 0.2, 0.3);
    lampProp(200, 820, 1, pr(-0.05, 0.6), l >= 1 ? GREEN : VIOLET);
    charger(470, 850, 0.9, pr(0.05, 0.6), c >= 1 ? GREEN : VIOLET);
    vent(770, 780, 260, 230, pr(0.15, 0.6), u > at("s2", "vent") - 0.1 ? RED : VIOLET);
    stamp("v", 200, 590, 0.6, pr(at("s2", "lamps") - 0.15, 0.35), GREEN);
    stamp("v", 470, 590, 0.6, pr(at("s2", "chargers") - 0.15, 0.35), GREEN);
    const wk = sm(at("s2", "walk") - 0.1, at("s2", "vent") + 0.3, u);
    walker(lerp(90, 920, wk), 1120, 0.75, pr(at("s2", "walk") - 0.35, 0.35), u * 9);
    tag("MISSED", 770, 945, RED, sm(at("s2", "vent") - 0.05, at("s2", "vent") + 0.2, u));
  }
  if (id === "s3") {
    const sl = pr(at("s3", "between") - 0.1, 0.5);
    vent(CX, 860, 640, 540, pr(-0.05, 0.5), RED, () => {
      x.fillStyle = "#04030a"; x.fillRect(0, 0, 1080, 1920);
      for (let X = CX - 300, i = 0; X < CX + 320; X += 40, i++) draw(L(X, 590, X, 1130), RED, 2, pr(0.1 + i * 0.02, 0.4), 90 + i, { a: 0.25, blur: 4 });
    });
    const gy = 590 + 24 + 3 * ((540 - 40) / Math.round(540 / 52)) - 18;
    lens(CX + 120, gy, 1.1, pr(at("s3", "lens") - 0.1, 0.3));
    draw(C(CX + 120, gy, 70, -Math.PI / 2, 1.15), RED, 6, sl, 99, { amp: 4 });
    tag("TINY LENS", CX + 120, gy + 130, RED, sm(at("s3", "tiny") - 0.05, at("s3", "tiny") + 0.2, u), 40);
  }
  if (id === "s4") {
    const on = sm(at("s4", "shine") - 0.1, at("s4", "flashlight"), u);
    vent(CX, 800, 560, 440, pr(-0.05, 0.5), on > 0.5 ? GREEN : VIOLET);
    const sw = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.15, u), sa = 1 - sm(at("s4", "shine") - 0.3, at("s4", "shine"), u);
    if (sa > 0) { // light switch flips off
      x.save(); x.globalAlpha = sa; fill(R(835, 485, 90, 150, 16), "#1c1850");
      draw(R(835, 485, 90, 150, 16), VIOLET, 6, pr(-0.05, 0.4), 111, { closed: true, a: sa });
      fill(R(862, lerp(510, 566, sw), 36, 44, 8), sw > 0.5 ? "#555" : "#ffe9a8", sa); x.restore();
    }
    const ph = sm(at("s4", "shine") - 0.2, at("s4", "flashlight"), u);
    const PX = lerp(1000, 700, ph), PY = lerp(1500, 1250, ph);
    beamTo(PX - 30, PY - 130, CX, 800, 260, on * (0.8 + 0.2 * Math.sin(u * 7)), WHITE);
    phone(PX, PY, 0.9, pr(at("s4", "shine") - 0.35, 0.4), -0.5, on);
  }
  if (id === "s5") {
    const gr = x.createRadialGradient(CX, 820, 0, CX, 820, 460); gr.addColorStop(0, "rgba(255,255,255,0.22)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    const G = sm(at("s5", "glint") - 0.1, at("s5", "glint") + 0.1, u), Wr = sm(at("s5", "wire") - 0.15, at("s5", "belong"), u);
    vent(CX, 820, 700, 600, pr(-0.05, 0.5), GREEN, () => {
      x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
      if (Wr > 0) {
        const pts = []; for (let i = 0; i <= 40; i++) { const k = i / 40; pts.push([lerp(CX - 330, CX + 110, k), 1080 - 260 * k + 40 * Math.sin(k * 9)]); }
        draw(pts, RED, 10, Wr, 121, { amp: 3 });
      }
    });
    if (G > 0) {
      const p = 0.7 + 0.3 * Math.sin(u * 16);
      x.save(); x.globalCompositeOperation = "lighter"; x.globalAlpha = G; x.shadowColor = WHITE; x.shadowBlur = 70 * p; x.fillStyle = WHITE; x.beginPath(); x.arc(CX + 130, 700, 14 * p + 6, 0, TAU); x.fill(); x.restore();
      for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + u; draw(L(CX + 130 + Math.cos(an) * 34, 700 + Math.sin(an) * 34, CX + 130 + Math.cos(an) * (60 + 20 * p), 700 + Math.sin(an) * (60 + 20 * p)), WHITE, 5, G, 130 + i, { blur: 14 }); }
      tag("GLINT", CX + 130, 580, GREEN, G, 40);
    }
    tag("WIRE", CX - 200, 1180, RED, Wr, 40);
  }
  if (id === "s6") {
    const a = pr(-0.05, 0.5);
    draw(R(130, 560, 760, 700, 24), VIOLET, 7, a, 141, { closed: true });
    hatch(130, 560, 760, 700, VIOLET, a, 150, 60, 0.12);
    vent(CX, 580, 200, 70, a, GREEN);
    [["bed", 280, 1050], ["shower", 760, 1080], ["couch", 520, 900]].forEach(([k, X, Y]) => {
      const w = at("s6", k);
      beamTo(CX, 610, X, Y - 40, 70, sm(w - 0.15, w + 0.1, u), GREEN);
      furn(k, X, Y, 0.9, pr(w - 0.12, 0.35), GREEN);
    });
  }
  if (id === "s7") {
    vent(CX, 860, 520, 420, 0.6, GREEN);
    beamTo(820, 1300, CX, 860, 240, 0.8, WHITE);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER SKIP", "THE VENTS"], RED, 380, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "never") - 0.1);
  if (id === "s2") {
    const sw = at("s2", "then") - 0.1;
    words(["LAMP. CHARGER."], GREEN, 380, at("s2", "lamps") - 0.15, 1 - sm(sw - 0.1, sw, u), 130);
    words(["VENT? SKIPPED"], RED, 380, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s2", "vent")), at("s2", "vent") - 0.05);
  }
  if (id === "s3") words(["FITS IN", "THE SLATS"], RED, 340, 0.0, 1, 140, flash(u, at("s3", "slats")) * 0.6);
  if (id === "s4") {
    const sw = at("s4", "shine") - 0.15;
    words(["LIGHTS OFF"], GREEN, 360, at("s4", "off") - 0.1, 1 - sm(sw - 0.1, sw, u), 140);
    words(["LIGHT THE SLATS"], GREEN, 360, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s4", "flashlight")) * 0.6);
  }
  if (id === "s5") words(["GLINT? WIRE?"], GREEN, 360, 0.0, 1, 140, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") words(["WHAT DOES IT FACE"], GREEN, 380, 0.0, 1, 120);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["LIGHT EVERY VENT"], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["EVERY ROOM"], ORANGE, 880, at("s7", "every", 2) - 0.05, 1, 150, flash(u, at("s7", "room")), at("s7", "room") - 0.05);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    draw(C(CX, 560, 110), VIOLET, 12, pr(0.0, 0.45), 161);
    fill(C(CX, 560, 46, 0, 1), VIOLET, pr(0.3, 0.2));
    draw(C(CX, 560, 150, u * 3, 0.23), GREEN, 10, 1, 162, { amp: 2 });
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150, 0, 0.6);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["vents-glow-sketch"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
