// brake-before-turn (Apex 08, TikTok) - GLOW SKETCH style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-glow-sketch.js):
// dark paper, neon strokes that draw themselves on, hand jitter that boils at 8 fps.
// Story: top-down road with a right-hand bend. Wrong: brake hard mid-turn, the bike stands up and runs wide to the edge.
// Right: brake on the straight, set the speed, look through, gentle throttle, the bike holds its line. Time only from hf-seek.
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
let NOW = 0, curU = 0;
const hs = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const boil = () => Math.floor(NOW * 8);
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}
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
function draw(pts, color, w, p = 1, seed = 1, o = {}) {
  if (p <= 0 || pts.length < 2) return;
  p = Math.min(1, p);
  const amp = o.amp ?? 2.4, closed = !!o.closed, a = o.a ?? 1;
  const A = prep(pts, closed, seed, amp), B = prep(pts, closed, seed + 91, amp * 1.8);
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.globalCompositeOperation = "lighter";
  x.globalAlpha = a * 0.8; x.shadowColor = color; x.shadowBlur = o.blur ?? 24; x.strokeStyle = color; x.lineWidth = w;
  const head = trace(A, p); x.stroke();
  x.shadowBlur = 0; x.globalAlpha = a * 0.4; x.lineWidth = Math.max(1.5, w * 0.32); trace(B, p); x.stroke();
  x.globalAlpha = a * 0.9; x.strokeStyle = mix(color, WHITE, 0.6); x.lineWidth = Math.max(1.5, w * 0.28); trace(A, p); x.stroke();
  if (p < 0.995 && !o.noTip) { x.globalAlpha = a; x.shadowColor = WHITE; x.shadowBlur = 26; x.fillStyle = WHITE; x.beginPath(); x.arc(head[0], head[1], w * 0.5 + 4, 0, TAU); x.fill(); }
  x.restore();
}
function fill(pts, color, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.closePath(); x.fill(); x.restore();
}
function paper(dark) {
  x.fillStyle = BG; x.fillRect(0, 0, 1080, 1920);
  const gr = x.createRadialGradient(CX, 860, 60, CX, 860, 1050); gr.addColorStop(0, "#121638"); gr.addColorStop(1, "rgba(5,6,12,0)");
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  const f = boil(); x.fillStyle = "rgba(200,210,255,0.05)";
  for (let i = 0; i < 420; i++) x.fillRect(hs(i * 3.1 + f * 0.37) * 1080, hs(i * 7.7 + f * 0.91) * 1920, 2, 2);
  if (dark > 0) { x.fillStyle = `rgba(1,1,6,${0.7 * dark})`; x.fillRect(0, 0, 1080, 1920); }
}
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
  X = Math.min(Math.max(X, 40 + w / 2), 930 - w / 2);
  fill(R(X - w / 2, Y - px * 0.75, w, px * 1.5, px * 0.7), "rgba(5,6,12,0.88)", a);
  draw(R(X - w / 2, Y - px * 0.75, w, px * 1.5, px * 0.7), color, 5, a, X + Y, { closed: true, blur: 16 });
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  x.shadowColor = color; x.shadowBlur = 18; x.fillStyle = color; x.fillText(txt, X, Y + 3); x.restore();
}
const pr = (t0, dur = 0.5) => cl((curU - t0) / dur);
function stamp(kind, X, Y, s, p, color) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw(C(0, 0, 80), color, 16, cl(p * 1.6), 31 + X);
  const q = cl(p * 1.6 - 0.6);
  if (kind === "x") { draw(L(-40, -40, 40, 40), color, 16, q * 2, 32); draw(L(40, -40, -40, 40), color, 16, q * 2 - 1, 33); }
  else draw([[-42, 4], [-12, 34], [44, -30]], color, 16, q, 34);
  x.restore();
}
// ===================== end of kit =====================

// ---------- road geometry: up the page, then a right-hand bend ----------
const HW = 105;                       // half road width
const RX = 400, Y0 = 1240, YB = 900;  // straight x, bottom, bend start
const RAD = 250, OCX = RX + RAD, OCY = YB; // bend centre
const L1 = Y0 - YB, ARC = RAD * Math.PI / 2, L3 = 420, LEN = L1 + ARC + L3;
const S0 = -320;                      // road runs off the bottom of the frame
const BS = 0.8;                       // bike scale
const SB = L1 + ARC * 0.36;          // where the wrong-way rider brakes
function pathAt(s) {
  if (s <= L1) return [RX, Y0 - s, 0];
  if (s <= L1 + ARC) { const th = Math.PI + (s - L1) / RAD; return [OCX + RAD * Math.cos(th), OCY + RAD * Math.sin(th), th - Math.PI]; }
  return [OCX + (s - L1 - ARC), OCY - RAD, Math.PI / 2];
}
function wideAt(s) {
  if (s <= SB) return pathAt(s);
  const [bx, by, br] = pathAt(SB), d = s - SB;
  return [bx + Math.sin(br) * d, by - Math.cos(br) * d, br * (1 - 0.25 * cl(d / 200))];
}
function pts(f, s0, s1, off = 0, step = 18) {
  const out = [];
  for (let s = s0; s <= s1 + 0.01; s += step) { const [px, py, r] = f(Math.min(s, s1)); out.push([px + Math.cos(r) * off, py + Math.sin(r) * off]); }
  if (out.length < 2) { const [px, py, r] = f(s1); out.push([px + Math.cos(r) * off, py + Math.sin(r) * off]); }
  return out;
}
// the road: dark asphalt band, neon edges (outer edge can flash red), dashed centre line
function road(p, edgeC = VIOLET, outerHot = 0) {
  if (p <= 0) return;
  const c = pts(pathAt, S0, LEN);
  x.save(); x.lineCap = "butt"; x.lineJoin = "round"; x.globalAlpha = cl(p * 2);
  x.strokeStyle = "#0b0e28"; x.lineWidth = HW * 2; x.beginPath(); c.forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.stroke();
  x.restore();
  draw(pts(pathAt, S0, LEN, HW), edgeC, 9, p, 201, { noTip: p > 0.98 });
  draw(pts(pathAt, S0, LEN, -HW), outerHot > 0.05 ? mix(edgeC, RED, outerHot) : edgeC, 9 + 6 * outerHot, p, 202, { noTip: p > 0.98 });
  for (let s = S0 + 30, i = 0; s < LEN - 40; s += 90, i++) draw(pts(pathAt, s, s + 40, 0, 20), mix(VIOLET, BG, 0.45), 5, cl(p * 1.6 - ((s - S0) / (LEN - S0)) * 0.6), 210 + i, { blur: 8, amp: 1.2, noTip: true });
}
// top-down motorcycle: tyres, body, bars, rider shoulders, helmet; rear light glow `brake`
function bike(X, Y, rot, c, brake = 0, s = BS) {
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  if (brake > 0) {
    x.save(); x.globalCompositeOperation = "lighter"; x.globalAlpha = brake; x.shadowColor = RED; x.shadowBlur = 60;
    x.fillStyle = RED; x.beginPath(); x.arc(0, 112, 22, 0, TAU); x.fill(); x.restore();
  }
  fill(R(-34, -70, 68, 160, 30), "#120f30");
  draw(R(-15, 62, 30, 66, 13), c, 7, 1, 301, { closed: true, blur: 14, amp: 1.4 });
  draw(R(-13, -128, 26, 62, 12), c, 7, 1, 302, { closed: true, blur: 14, amp: 1.4 });
  draw(R(-34, -70, 68, 160, 30), c, 9, 1, 303, { closed: true, amp: 1.6 });
  draw(L(-62, -58, 62, -58), c, 8, 1, 304, { amp: 1.2 });
  draw([[-40, 4], [-56, -54]], c, 7, 1, 305, { amp: 1.2, blur: 12 });
  draw([[40, 4], [56, -54]], c, 7, 1, 306, { amp: 1.2, blur: 12 });
  fill(C(0, 0, 28, 0, 1), "#0b0a20");
  draw(C(0, 0, 28), WHITE, 7, 1, 307, { blur: 16, amp: 1.2 });
  draw([[-18, -14], [0, -24], [18, -14]], WHITE, 8, 1, 308, { amp: 1 });
  x.restore();
}
// speed lines trailing a bike
function streaks(X, Y, rot, a, c = WHITE) {
  if (a <= 0) return;
  for (let i = 0; i < 5; i++) {
    const o = (i - 2) * 22, l = 75 + 35 * hs(i + boil());
    const bx = X + Math.cos(rot) * o - Math.sin(rot) * 125, by = Y + Math.sin(rot) * o + Math.cos(rot) * 125;
    draw(L(bx, by, bx - Math.sin(rot) * l, by + Math.cos(rot) * l), c, 4, 1, 400 + i, { a: 0.6 * a, blur: 10, noTip: true });
  }
}
// speed gauge (left of the road), needle v 0..1
function gauge(v, c, a) {
  if (a <= 0) return;
  const GX = 170, GY = 1070, r = 88;
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  fill(C(GX, GY, r + 14, 0, 1), "rgba(5,6,12,0.85)", a);
  draw(C(GX, GY, r, a0, 0.7), mix(c, BG, 0.3), 8, a, 501, { blur: 14, noTip: true });
  const an = lerp(a0, a1, cl(v));
  draw(C(GX, GY, r, a0, 0.7 * cl(v)), c, 12, a, 502, { blur: 20, noTip: true });
  draw(L(GX, GY, GX + Math.cos(an) * (r - 18), GY + Math.sin(an) * (r - 18)), WHITE, 7, a, 503, { amp: 1 });
  fill(C(GX, GY, 12, 0, 1), WHITE, a);
  x.save(); x.globalAlpha = a; x.font = FONT(30); x.textAlign = "center"; x.textBaseline = "middle"; x.shadowColor = c; x.shadowBlur = 14; x.fillStyle = c;
  x.fillText("SPEED", GX, GY + r - 4); x.restore();
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
  paper(id === "s7" ? 0.55 : 0);
  let shake = 0;
  if (id === "s3") { const e = at("s3", "edge"); shake = sm(e - 0.05, e + 0.02, u) * (1 - sm(e + 0.1, e + 0.7, u)) * Math.sin(u * 70) * 12; }
  x.save(); x.translate(CX + shake, 900 - shake * 0.5); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    const s = lerp(-80, 90, cl(u / d));
    const [bx, by, br] = pathAt(s);
    road(pr(-0.05, 0.8));
    // the corner gets marked as soon as the voice names it
    const k = sm(at("s1", "corner") - 0.05, at("s1", "corner") + 0.3, u);
    draw(C(OCX, OCY, RAD + HW + 36, Math.PI * 1.04, 0.2), RED, 8, k, 601, { amp: 3 });
    tag("TIGHT CORNER", 235, 640, RED, k, 40);
    streaks(bx, by, br, 0.6);
    bike(bx, by, br, VIOLET, 0);
    gauge(0.85, RED, pr(0.2, 0.4));
  }
  if (id === "s2") {
    const reach = at("s2", "middle");
    const s = u < reach ? lerp(90, SB, sm(0, reach, u) * 0.6 + cl(u / reach) * 0.4) : SB + 25 * sm(reach, d, u);
    const [bx, by, br] = pathAt(s);
    const Bk = sm(reach - 0.1, reach + 0.05, u);
    road(1);
    if (Bk > 0) draw(pts(pathAt, SB - 10, s + 1, 0, 10), RED, 10, 1, 611, { a: 0.8, amp: 2, noTip: true });
    streaks(bx, by, br, 1 - Bk * 0.6);
    bike(bx, by, br, Bk > 0.5 ? RED : VIOLET, Bk * (0.75 + 0.25 * Math.sin(u * 30)));
    gauge(0.88 - 0.12 * Bk, RED, 1);
    tag("TOO FAST", 760, 1080, RED, sm(at("s2", "fast") - 0.05, at("s2", "fast") + 0.2, u) * (1 - Bk), 42);
    tag("BRAKE!", bx + 230, by + 80, RED, Bk, 46);
  }
  if (id === "s3") {
    const e = at("s3", "edge");
    const run = 262;
    const k = sm(0, e, u);
    const s = SB + 25 + (run - 25) * k;
    const [bx, by, br] = wideAt(s);
    const hot = sm(e - 0.05, e + 0.05, u);
    road(1, VIOLET, hot);
    draw(pts(pathAt, SB, L1 + ARC, 0, 16), mix(VIOLET, BG, 0.2), 5, pr(0.0, 0.5), 621, { a: 0.5, noTip: true });
    draw(pts(wideAt, SB, s, 0, 10), RED, 10, 1, 622, { a: 0.85, amp: 2, noTip: true });
    bike(bx, by, br, RED, 0.6 * (1 - hot));
    tag("STANDS UP", 760, 1080, RED, sm(at("s3", "stands") - 0.05, at("s3", "stands") + 0.2, u), 42);
    tag("RUNS WIDE", 220, 740, RED, sm(at("s3", "wide") - 0.05, at("s3", "wide") + 0.2, u), 42);
    stamp("x", bx - 170, by + 40, 0.6, pr(e + 0.15, 0.4), RED);
    gauge(0.72, RED, 1);
  }
  if (id === "s4") {
    const k = cl(u / d);
    const s = lerp(-60, 250, 1 - Math.pow(1 - k, 2));
    const [bx, by, br] = pathAt(s);
    road(1, VIOLET);
    // brake zone on the straight
    const z0 = 20, z1 = 220, Z = sm(at("s4", "braking") - 0.1, at("s4", "braking") + 0.2, u);
    const zone = R(RX - HW + 10, Y0 - z1, HW * 2 - 20, z1 - z0, 18);
    fill(zone, "rgba(70,255,154,0.10)", Z);
    draw(zone, GREEN, 7, Z, 631, { closed: true });
    tag("BRAKE ZONE", 760, 1140, GREEN, Z, 42);
    const St = sm(at("s4", "straight") - 0.1, at("s4", "straight") + 0.15, u);
    draw(L(RX, by - 130, RX, by - 290), GREEN, 8, St, 632, { amp: 2 });
    draw([[RX - 24, by - 262], [RX, by - 298], [RX + 24, by - 262]], GREEN, 8, St, 633, { amp: 1.5 });
    tag("STILL STRAIGHT", 760, 1010, VIOLET, St, 40);
    bike(bx, by, br, GREEN, 0.7 * sm(at("s4", "braking") - 0.05, at("s4", "braking") + 0.1, u) * (1 - sm(at("s4", "straight"), d, u)));
    gauge(lerp(0.85, 0.42, sm(at("s4", "braking"), at("s4", "straight"), u)), GREEN, 1);
  }
  if (id === "s5") {
    const s = lerp(250, L1 + 30, sm(0, d, u) * 0.5 + cl(u / d) * 0.5);
    const [bx, by, br] = pathAt(s);
    road(1, VIOLET);
    tag("SPEED SET", 760, 1100, GREEN, sm(at("s5", "speed") - 0.05, at("s5", "speed") + 0.2, u), 42);
    const Lk = sm(at("s5", "look") - 0.15, at("s5", "through") + 0.35, u);
    const ahead = pts(pathAt, s + 120, L1 + ARC + 160, 0, 16);
    draw(ahead, GREEN, 8, Lk, 641, { amp: 2.5 });
    // head turns toward the exit: a small sight arrow from the helmet
    draw(L(bx + 8, by - 32, bx + 72, by - 120), GREEN, 6, Lk, 642, { a: 0.8, blur: 14 });
    tag("LOOK THROUGH", 760, 870, GREEN, Lk, 40);
    bike(bx, by, br, GREEN, 0);
    gauge(0.42, GREEN, 1);
  }
  if (id === "s6") {
    const s = lerp(L1 + 30, L1 + ARC + 170, sm(0, d, u) * 0.4 + cl(u / d) * 0.6);
    const [bx, by, br] = pathAt(s);
    road(1, VIOLET);
    draw(pts(pathAt, L1 - 60, s - 30, 0, 12), GREEN, 11, 1, 651, { a: 0.9, amp: 2, noTip: true });
    const Th = sm(at("s6", "throttle") - 0.05, at("s6", "gently") + 0.2, u);
    tag("GENTLE THROTTLE", 740, 1120, GREEN, Th, 38);
    const Ln = sm(at("s6", "line") - 0.1, at("s6", "line") + 0.2, u);
    tag("HOLDS ITS LINE", 740, 1010, VIOLET, Ln, 40);
    stamp("v", 720, 890, 0.6, pr(at("s6", "holds"), 0.4), GREEN);
    streaks(bx, by, br, 0.35, GREEN);
    bike(bx, by, br, GREEN, 0);
    gauge(lerp(0.42, 0.6, Th), GREEN, 1);
  }
  if (id === "s7") {
    road(1, VIOLET);
    draw(pts(pathAt, 0, L1 + ARC + 200, 0, 14), GREEN, 10, 1, 661, { a: 0.6, noTip: true });
    const [bx, by, br] = pathAt(L1 + ARC + 200 + 40 * cl(u / d));
    bike(bx, by, br, GREEN, 0);
  }
  if (id === "s8") paper(0.2);
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER BRAKE", "IN THE CORNER"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "brakes") - 0.1);
  if (id === "s2") {
    const sw = at("s2", "brake") - 0.15;
    words(["TOO FAST"], RED, 370, 0.0, 1 - sm(sw - 0.1, sw, u), 140, flash(u, at("s2", "fast")) * 0.6);
    words(["BRAKE MID-TURN"], RED, 370, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s2", "middle")) * 0.7);
  }
  if (id === "s3") {
    const sw = at("s3", "runs") - 0.15;
    words(["BIKE STANDS UP"], RED, 370, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["RUNS WIDE"], RED, 370, sw, sm(sw - 0.05, sw, u), 150, flash(u, at("s3", "edge")) * 0.7);
  }
  if (id === "s4") {
    const sw = at("s4", "while") - 0.15;
    words(["BRAKE EARLY"], GREEN, 370, 0.0, 1 - sm(sw - 0.1, sw, u), 140, flash(u, at("s4", "early")) * 0.6);
    words(["BIKE STRAIGHT"], GREEN, 370, sw, sm(sw - 0.05, sw, u), 135, flash(u, at("s4", "straight")) * 0.6);
  }
  if (id === "s5") {
    const sw = at("s5", "then") - 0.15;
    words(["SET YOUR SPEED"], GREEN, 370, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["LOOK THROUGH"], GREEN, 370, sw, sm(sw - 0.05, sw, u), 135, flash(u, at("s5", "look")) * 0.6);
  }
  if (id === "s6") {
    const sw = at("s6", "and") - 0.15;
    words(["ROLL ON GENTLY"], VIOLET, 370, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["HOLDS ITS LINE"], GREEN, 370, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s6", "line")) * 0.6);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const sw = at("s7", "brake") - 0.1;
    words(["SLOW IN"], ORANGE, 860, 0.0, 1 - sm(sw - 0.1, sw, u), 150, flash(u, 0.05));
    words(["SMOOTH OUT"], ORANGE, 1040, at("s7", "smooth") - 0.05, 1 - sm(sw - 0.1, sw, u), 150, flash(u, at("s7", "smooth")));
    words(["BRAKE BEFORE"], ORANGE, 860, sw, sm(sw - 0.05, sw, u), 150, flash(u, at("s7", "brake")));
    words(["THE BEND"], ORANGE, 1040, at("s7", "the") - 0.05, sm(sw - 0.05, sw, u), 160, flash(u, at("s7", "bend")), at("s7", "bend") - 0.05);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.6)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    // a wheel badge that draws itself on
    draw(C(CX, 470, 110), ORANGE, 12, pr(0.0, 0.45), 701);
    draw(C(CX, 470, 64), VIOLET, 8, pr(0.15, 0.4), 702);
    for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU + u * 2; draw(L(CX + Math.cos(an) * 22, 470 + Math.sin(an) * 22, CX + Math.cos(an) * 62, 470 + Math.sin(an) * 62), VIOLET, 6, pr(0.3, 0.3), 703 + i, { blur: 12, noTip: true }); }
    draw(C(CX, 470, 150, u * 3, 0.23), GREEN, 10, 1, 710, { amp: 2 });
    words([c1], WHITE, 710, 0.15, 1, 130);
    words([c2], ORANGE, 860, 0.3, 1, 170, flash(u, at("s8", "apex")) * 0.5, 0.6);
    tag("3 FREE RIDES A MONTH", CX, 1020, GREEN, sm(at("s8", "three") - 0.05, at("s8", "three") + 0.2, u), 46);
    if (BRAND.sub) tag(BRAND.sub, CX, 1120, VIOLET, sm(at("s8", "free") - 0.05, at("s8", "free") + 0.2, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["brake-before-turn-glow"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
