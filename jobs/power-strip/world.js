// power-strip (Hidden Cam 23) - GLOW SKETCH style (kit from vents / style-kits/style-glow-sketch.js). Time only from hf-seek.
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
function lens(X, Y, s, p, color = RED) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  fill(C(0, 0, 30, 0, 1), "#12060e", cl(p * 3));
  draw(C(0, 0, 30), color, 6, p, 21);
  fill(C(0, 0, 12, 0, 1), color, cl(p * 2 - 0.8));
  fill(C(-6, -6, 4, 0, 1), WHITE, cl(p * 2 - 1));
  x.restore();
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
function phone(X, Y, s, p, rot = 0, lamp = 0) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  fill(R(-80, -150, 160, 300, 28), "#100e2c", cl(p * 3));
  draw(R(-80, -150, 160, 300, 28), VIOLET, 8, p, 41, { closed: true });
  draw(R(-62, -118, 124, 236, 14), mix(VIOLET, BG, 0.4), 4, cl(p * 1.4 - 0.3), 42, { closed: true, blur: 8 });
  if (lamp > 0) { x.save(); x.globalCompositeOperation = "lighter"; x.globalAlpha = lamp; x.shadowColor = WHITE; x.shadowBlur = 60; x.fillStyle = WHITE; x.beginPath(); x.arc(0, -120, 16, 0, TAU); x.fill(); x.restore(); }
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
function bed(X, Y, s, p, c) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw(R(-110, -10, 220, 60, 12), c, 9, p, 301, { closed: true });
  draw(R(-110, -60, 60, 50, 12), c, 9, cl(p * 1.4 - 0.2), 302, { closed: true });
  draw(L(-110, 50, -110, 80), c, 9, cl(p * 2 - 1), 303); draw(L(110, 50, 110, 80), c, 9, cl(p * 2 - 1), 304);
  x.restore();
}
// power strip seen from the front: long body, 4 sockets, a switch on the right end, a tiny lens hole on the LEFT end
// (local x = -188). o.lens = how visible the hole is, o.lc = hole colour.
function strip(X, Y, s, p, c, rot = 0, o = {}) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  const body = R(-210, -50, 420, 100, 26);
  fill(body, "#110f2e", cl(p * 3));
  draw(body, c, 9, cl(p * 1.2), 201, { closed: true });
  [-120, -45, 30, 105].forEach((sx, i) => {
    const q = cl(p * 1.8 - 0.3 - i * 0.12);
    draw(R(sx - 26, -26, 52, 52, 12), mix(c, BG, 0.25), 5, q, 210 + i, { closed: true, blur: 10, amp: 1.6 });
    draw(L(sx - 9, -10, sx - 9, 10), mix(c, BG, 0.25), 5, q, 220 + i, { blur: 6, amp: 1 });
    draw(L(sx + 9, -10, sx + 9, 10), mix(c, BG, 0.25), 5, q, 230 + i, { blur: 6, amp: 1 });
  });
  const sw = R(150, -22, 40, 44, 8);
  fill(sw, o.on === false ? "#333" : "#ff5a6a", cl(p * 2 - 1) * 0.8);
  draw(sw, c, 5, cl(p * 2 - 1), 240, { closed: true, blur: 10 });
  if ((o.lens ?? 0) > 0) lens(-188, 0, 0.42, o.lens, o.lc || RED);
  x.restore();
}
// world position of the lens hole for a strip at (X, Y, s, rot)
const lensAt = (X, Y, s, rot = 0) => [X + Math.cos(rot) * -188 * s, Y + Math.sin(rot) * -188 * s];
function stamp(kind, X, Y, s, p, color) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw(C(0, 0, 80), color, 16, cl(p * 1.6), 31 + X);
  const q = cl(p * 1.6 - 0.6);
  if (kind === "x") { draw(L(-40, -40, 40, 40), color, 16, q * 2, 32); draw(L(40, -40, -40, 40), color, 16, q * 2 - 1, 33); }
  else draw([[-42, 4], [-12, 34], [44, -30]], color, 16, q, 34);
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
function glint(X, Y, G, u) {
  if (G <= 0) return;
  const p = 0.7 + 0.3 * Math.sin(u * 16);
  x.save(); x.globalCompositeOperation = "lighter"; x.globalAlpha = G; x.shadowColor = WHITE; x.shadowBlur = 70 * p; x.fillStyle = WHITE; x.beginPath(); x.arc(X, Y, 14 * p + 6, 0, TAU); x.fill(); x.restore();
  for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + u; draw(L(X + Math.cos(an) * 34, Y + Math.sin(an) * 34, X + Math.cos(an) * (60 + 20 * p), Y + Math.sin(an) * (60 + 20 * p)), WHITE, 5, G, 130 + i, { blur: 14 }); }
}
function wall(X, p) {
  if (p <= 0) return;
  draw(L(X, 560, X, 1260), VIOLET, 9, p, 401);
  hatch(X, 560, 200, 700, VIOLET, p, 410, 40, 0.18);
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
    const B = sm(at("s1", "bed") - 0.15, at("s1", "bed") + 0.1, u);
    bed(300, 780, 1.4, pr(-0.05, 0.6), B > 0.5 ? RED : VIOLET);
    strip(700, 1110, 0.9, pr(0.0, 0.6), VIOLET, 0, { lens: B });
    const [lx, ly] = lensAt(700, 1110, 0.9);
    beamTo(lx, ly, 300, 790, 150, B * (0.8 + 0.2 * Math.sin(u * 7)), RED);
    tag("AIMED AT THE BED", CX, 1300, RED, sm(at("s1", "never") - 0.1, at("s1", "never") + 0.15, u));
  }
  if (id === "s2") {
    const c1 = pr(at("s2", "chargers") - 0.15, 0.35), c2 = pr(at("s2", "power") - 0.15, 0.35);
    charger(290, 900, 1.1, pr(-0.05, 0.6), c1 > 0.5 ? RED : VIOLET);
    strip(690, 920, 0.62, pr(0.05, 0.6), c2 > 0.5 ? RED : VIOLET, 0, { lens: c2 });
    camIcon(290, 650, 0.6, c1, RED, 0.5 + 0.5 * Math.sin(u * 14));
    camIcon(690, 650, 0.6, c2, RED, 0.5 + 0.5 * Math.sin(u * 14 + 1));
    tag("CHARGER", 290, 1130, RED, c1, 40);
    tag("POWER STRIP", 690, 1130, RED, c2, 40);
  }
  if (id === "s3") {
    const SX = CX + 40, SY = 880, SS = 1.5;
    const h = sm(at("s3", "hole") - 0.15, at("s3", "hole") + 0.1, u);
    strip(SX, SY, SS, pr(-0.05, 0.5), VIOLET, 0, { lens: h });
    const [lx, ly] = lensAt(SX, SY, SS);
    draw(C(lx, ly, 62, -Math.PI / 2, 1.15), RED, 7, pr(at("s3", "side") - 0.1, 0.4), 99, { amp: 4 });
    beamTo(lx, ly, lx + 40, 600, 70, sm(at("s3", "lens") - 0.1, at("s3", "lens") + 0.1, u) * 0.7, RED);
    tag("TINY LENS", lx + 60, ly + 160, RED, sm(at("s3", "lens") - 0.1, at("s3", "lens") + 0.15, u), 44);
  }
  if (id === "s4") {
    const on = sm(at("s4", "shine") - 0.1, at("s4", "torch"), u);
    const SX = CX + 20, SY = 860, SS = 1.35;
    strip(SX, SY, SS, pr(-0.05, 0.5), on > 0.5 ? GREEN : VIOLET, 0, { lens: 0.5 + 0.5 * on, lc: on > 0.5 ? GREEN : RED });
    const sw = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.15, u), sa = 1 - sm(at("s4", "shine") - 0.3, at("s4", "shine"), u);
    if (sa > 0) { // light switch flips off
      x.save(); x.globalAlpha = sa; fill(R(780, 560, 90, 150, 16), "#1c1850");
      draw(R(780, 560, 90, 150, 16), VIOLET, 6, pr(-0.05, 0.4), 111, { closed: true, a: sa });
      fill(R(807, lerp(585, 641, sw), 36, 44, 8), sw > 0.5 ? "#555" : "#ffe9a8", sa); x.restore();
    }
    const ph = sm(at("s4", "shine") - 0.2, at("s4", "torch"), u);
    const PX = lerp(980, 780, ph), PY = lerp(1500, 1280, ph);
    const sweep = sm(at("s4", "across") - 0.1, d - 0.1, u);
    const [lx] = lensAt(SX, SY, SS);
    beamTo(PX - 30, PY - 130, lerp(SX + 220, lx, sweep), SY, 200, on * (0.8 + 0.2 * Math.sin(u * 7)), WHITE);
    phone(PX, PY, 0.85, pr(at("s4", "shine") - 0.35, 0.4), -0.5, on);
  }
  if (id === "s5") {
    const SX = CX + 20, SY = 880, SS = 1.45;
    const G = sm(at("s5", "back") - 0.1, at("s5", "glint") + 0.05, u);
    const [lx, ly] = lensAt(SX, SY, SS);
    beamTo(820, 1300, lx, ly, 220, 0.8, WHITE);
    strip(SX, SY, SS, pr(-0.05, 0.4), GREEN, 0, { lens: 1, lc: GREEN });
    phone(820, 1300, 0.85, 1, -0.5, 1);
    glint(lx, ly, G * (1 + 0.4 * flash(u, at("s5", "glint"))), u);
    tag("GLINT = LENS", lx + 90, ly - 170, GREEN, G, 44);
  }
  if (id === "s6") {
    const SX = 500, SY = 900, SS = 0.95;
    const un = sm(at("s6", "unplug") - 0.05, at("s6", "unplug") + 0.25, u);
    const rot = Math.PI * sm(at("s6", "turn") - 0.05, at("s6", "face"), u);
    const faced = sm(at("s6", "wall") - 0.2, at("s6", "wall"), u);
    wall(880, pr(-0.05, 0.5));
    bed(170, 860, 0.8, pr(-0.05, 0.5), faced > 0.5 ? VIOLET : RED);
    // wall socket + plug + cord (cord fades after the unplug, before the turn)
    draw(R(850, 860, 30, 80, 8), VIOLET, 5, pr(0.0, 0.4), 420, { closed: true, blur: 10 });
    const ca = 1 - sm(at("s6", "unplug") + 0.3, at("s6", "turn") - 0.05, u);
    const PLX = lerp(822, 740, un);
    if (ca > 0) {
      draw([[SX + 210 * SS, SY], [lerp(SX + 210 * SS, PLX, 0.5), SY + 60], [PLX - 26, SY]], VIOLET, 6, pr(0.0, 0.5), 421, { a: ca });
      fill(R(PLX - 26, SY - 22, 52, 44, 10), "#1c1850", ca); draw(R(PLX - 26, SY - 22, 52, 44, 10), un > 0.5 ? GREEN : VIOLET, 6, 1, 422, { closed: true, a: ca });
    }
    strip(SX, SY, SS, pr(-0.05, 0.5), faced > 0.5 ? GREEN : VIOLET, rot, { lens: 1, lc: faced > 0.5 ? GREEN : RED, on: un < 0.5 });
    const [lx, ly] = lensAt(SX, SY, SS, rot);
    const before = 1 - sm(at("s6", "turn") - 0.1, at("s6", "turn") + 0.1, u);
    beamTo(lx, ly, 200, 860, 110, before * 0.8, RED);
    beamTo(lx, ly, 880, SY, 70, faced * 0.8, GREEN);
    tag("FACES THE WALL", 500, 1200, GREEN, faced, 44);
  }
  if (id === "s7") {
    wall(880, 0.7);
    strip(560, 900, 1.0, 0.7, GREEN, Math.PI, { lens: 1, lc: GREEN });
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE POWER STRIP"], RED, 400, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "never") - 0.1);
  if (id === "s2") words(["HIDDEN INSIDE"], RED, 400, 0.0, 1, 140, flash(u, at("s2", "power")) * 0.6);
  if (id === "s3") words(["TINY DARK HOLE"], RED, 400, 0.0, 1, 140, flash(u, at("s3", "lens")) * 0.6, at("s3", "hole") - 0.05);
  if (id === "s4") {
    const sw = at("s4", "shine") - 0.15;
    words(["LIGHTS OFF"], GREEN, 400, at("s4", "off") - 0.1, 1 - sm(sw - 0.1, sw, u), 140);
    words(["TORCH ACROSS IT"], GREEN, 400, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s4", "torch")) * 0.6);
  }
  if (id === "s5") words(["LOOK FOR A GLINT"], GREEN, 400, 0.0, 1, 130, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") {
    const sw = at("s6", "turn") - 0.1;
    words(["UNPLUG IT"], GREEN, 400, at("s6", "unplug") - 0.15, 1 - sm(sw - 0.1, sw, u), 140);
    words(["FACE THE WALL"], GREEN, 400, sw, sm(sw - 0.05, sw, u), 140, flash(u, at("s6", "wall")) * 0.6);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CHECK THE STRIP"], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["TURN IT AWAY"], ORANGE, 880, at("s7", "turn") - 0.05, 1, 150, flash(u, at("s7", "away")), at("s7", "away") - 0.05);
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
window.__hf.buildReady["power-strip-glow-sketch"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
