// pen-cam (Hidden Cam 29) - GLOW SKETCH style (kit copied from power-strip). Time only from hf-seek.
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
function fill(pts, color, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.closePath(); x.fill(); x.restore();
}
function hatch(X, Y, w, h, color, p, seed, gap = 30, a = 0.5) {
  if (p <= 0) return;
  x.save(); x.beginPath(); x.rect(X, Y, w, h); x.clip();
  const n = Math.ceil((w + h) / gap);
  for (let i = 0; i < n; i++) { const q = cl(p * 1.6 - (i / n) * 0.6); if (q <= 0) continue; const s = X + i * gap; draw(L(s, Y, s - h, Y + h), color, 3, q, seed + i, { a, blur: 8, amp: 1.5 }); }
  x.restore();
}
function paper(dark) {
  x.fillStyle = BG; x.fillRect(0, 0, 1080, 1920);
  const gr = x.createRadialGradient(CX, 820, 60, CX, 820, 1050); gr.addColorStop(0, "#121638"); gr.addColorStop(1, "rgba(5,6,12,0)");
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
function bed(X, Y, s, p, c) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw(R(-110, -10, 220, 60, 12), c, 9, p, 301, { closed: true });
  draw(R(-110, -60, 60, 50, 12), c, 9, cl(p * 1.4 - 0.2), 302, { closed: true });
  draw(L(-110, 50, -110, 80), c, 9, cl(p * 2 - 1), 303); draw(L(110, 50, 110, 80), c, 9, cl(p * 2 - 1), 304);
  x.restore();
}
// pen standing upright, local units: tip at y=+200, cap top at y=-200. Clip on the right side of the cap.
// Lens hole on the cap face at (0,-150), right beside the clip. o.lens = lens visibility, o.lc = its colour,
// o.usb = cap pulled off (0..1) showing a USB plug where the top was.
const PEN_LENS = [0, -150];
function pen(X, Y, s, p, c, rot = 0, o = {}) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  const capOff = (o.usb ?? 0) * 120;
  const barrel = R(-26, -110, 52, 270, 14);
  fill(barrel, "#110f2e", cl(p * 3));
  draw(barrel, c, 8, cl(p * 1.2), 501, { closed: true });
  draw([[-26, 160], [0, 205], [26, 160]], c, 8, cl(p * 1.5 - 0.3), 502); // tip cone
  draw(L(-14, 40, -14, 120), mix(c, BG, 0.3), 4, cl(p * 1.5 - 0.4), 503, { blur: 8, amp: 1.2 }); // grip lines
  draw(L(14, 40, 14, 120), mix(c, BG, 0.3), 4, cl(p * 1.5 - 0.4), 504, { blur: 8, amp: 1.2 });
  if (capOff > 1) { // USB plug revealed under the cap
    const ub = R(-16, -150, 32, 40, 4);
    fill(ub, "#1c1850", 1); draw(ub, GREEN, 6, 1, 520, { closed: true, blur: 14 });
    draw(L(-6, -140, -6, -126), GREEN, 4, 1, 521, { blur: 6, amp: 0.6 }); draw(L(6, -140, 6, -126), GREEN, 4, 1, 522, { blur: 6, amp: 0.6 });
  }
  x.save(); x.translate(0, -capOff);
  const cap = R(-30, -200, 60, 100, 18);
  fill(cap, "#16133a", cl(p * 3));
  draw(cap, c, 8, cl(p * 1.3 - 0.1), 505, { closed: true });
  draw([[30, -186], [48, -178], [48, -60], [36, -48]], c, 7, cl(p * 1.6 - 0.5), 506); // clip
  if ((o.lens ?? 0) > 0) lens(PEN_LENS[0], PEN_LENS[1], 0.42, o.lens, o.lc || RED);
  x.restore();
  x.restore();
}
const penLens = (X, Y, s, rot = 0) => [X + (Math.cos(rot) * PEN_LENS[0] - Math.sin(rot) * PEN_LENS[1]) * s, Y + (Math.sin(rot) * PEN_LENS[0] + Math.cos(rot) * PEN_LENS[1]) * s];
function cup(X, Y, s, p, c) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  const b = [[-70, -60], [70, -60], [56, 90], [-56, 90]];
  fill(b, "#0e0c26", cl(p * 3));
  draw(b, c, 8, p, 531, { closed: true });
  x.restore();
}
function desk(X0, X1, Y, p) {
  if (p <= 0) return;
  draw(L(X0, Y, X1, Y), VIOLET, 9, p, 541);
  draw(L(X0 + 30, Y, X0 + 30, Y + 190), VIOLET, 9, cl(p * 1.5 - 0.4), 542);
  draw(L(X1 - 30, Y, X1 - 30, Y + 190), VIOLET, 9, cl(p * 1.5 - 0.5), 543);
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
function check(X, Y, s, p, color) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw([[-30, 2], [-8, 26], [32, -24]], color, 12, p, 551 + X);
  x.restore();
}
function cross(X, Y, s, p, color) {
  if (p <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  draw(L(-26, -26, 26, 26), color, 12, cl(p * 2), 561); draw(L(26, -26, -26, 26), color, 12, cl(p * 2 - 1), 562);
  x.restore();
}
// side view of a desk with one drawer that slides out to the right (open 0..1)
function drawer(X, Y, open, p, c) {
  if (p <= 0) return;
  const top = R(X - 260, Y - 20, 520, 26, 6);
  draw(top, VIOLET, 8, p, 571, { closed: true });
  draw(L(X - 230, Y + 6, X - 230, Y + 300), VIOLET, 8, cl(p * 1.4 - 0.3), 572);
  const dx = open * 230;
  const box = [[X - 200 + dx, Y + 40], [X - 200 + dx, Y + 170], [X + 200 + dx, Y + 170], [X + 200 + dx, Y + 40]];
  fill(box.concat([[X - 200 + dx, Y + 40]]), "#0f0d2a", cl(p * 3));
  draw(box, c, 8, cl(p * 1.3 - 0.2), 573);
  draw(L(X + 200 + dx, Y + 40, X + 200 + dx, Y + 170), c, 10, cl(p * 1.4 - 0.3), 574);
  draw(L(X + 212 + dx, Y + 90, X + 212 + dx, Y + 122), c, 10, cl(p * 1.6 - 0.5), 575); // handle
  draw(L(X - 230, Y + 210, X + 230, Y + 210), mix(VIOLET, BG, 0.4), 5, cl(p * 1.4 - 0.4), 576, { blur: 8 });
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
  paper(id === "s7" ? 0.6 : 0);
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);

  if (id === "s1") {
    const B = sm(at("s1", "bed") - 0.15, at("s1", "bed") + 0.1, u);
    bed(260, 900, 1.3, pr(-0.05, 0.6), B > 0.5 ? RED : VIOLET);
    desk(560, 960, 1040, pr(0.0, 0.5));
    cup(760, 975, 0.7, pr(0.05, 0.5), VIOLET);
    pen(760, 830, 0.85, pr(0.05, 0.6), B > 0.5 ? RED : VIOLET, -0.08, { lens: B });
    const [lx, ly] = penLens(760, 830, 0.85, -0.08);
    beamTo(lx, ly, 260, 900, 140, B * (0.8 + 0.2 * Math.sin(u * 7)), RED);
    tag("AIMED AT THE BED", 560, 640, RED, sm(at("s1", "never") - 0.1, at("s1", "never") + 0.15, u));
  }
  if (id === "s2") {
    const c1 = pr(at("s2", "cheap") - 0.15, 0.35), c2 = pr(at("s2", "everywhere") - 0.2, 0.35);
    [300, 510, 720].forEach((px, i) => pen(px, 930, 0.95, pr(-0.05 + i * 0.08, 0.5), c1 > 0.5 ? RED : VIOLET, 0, { lens: c1 }));
    camIcon(CX, 620, 0.7, c1, RED, 0.5 + 0.5 * Math.sin(u * 14));
    tag("CHEAP", 330, 1170, RED, c1, 44);
    tag("SOLD EVERYWHERE", 690, 1170, RED, c2, 40);
  }
  if (id === "s3") {
    const PX = CX, PY = 930, PS = 1.5;
    const h = sm(at("s3", "hole") - 0.15, at("s3", "hole") + 0.1, u);
    pen(PX, PY, PS, pr(-0.05, 0.5), VIOLET, 0, { lens: h });
    const [lx, ly] = penLens(PX, PY, PS);
    draw(C(lx, ly, 56, -Math.PI / 2, 1.15), RED, 7, pr(at("s3", "tiny") - 0.1, 0.4), 99, { amp: 4 });
    tag("NEXT TO THE CLIP", 730, 560, RED, sm(at("s3", "clip") - 0.15, at("s3", "clip") + 0.1, u), 40);
    draw([[700, 600], [660, 620], [600, ly - 10]], RED, 6, pr(at("s3", "clip") - 0.05, 0.3), 98);
  }
  if (id === "s4") {
    const lift = sm(at("s4", "pick") - 0.1, at("s4", "up") + 0.2, u);
    const PY = lerp(980, 880, lift), PS = lerp(0.95, 1.4, lift), rot = lerp(-0.08, 0.35, lift);
    desk(260, 760, 1160, pr(-0.05, 0.4) * (1 - lift * 0.6));
    pen(CX, PY, PS, pr(-0.05, 0.5), GREEN, rot, { lens: 0.6, lc: GREEN });
    const [lx, ly] = penLens(CX, PY, PS, rot);
    const look = sm(at("s4", "look") - 0.1, at("s4", "clip"), u);
    draw(C(lx + 10, ly - 10, 110), GREEN, 9, look, 140, { amp: 3 }); // magnifier ring
    draw(L(lx + 88, ly + 70, lx + 170, ly + 160), GREEN, 14, cl(look * 2 - 1), 141);
    tag("CLIP + TOP", lx + 250, ly - 150, GREEN, sm(at("s4", "top") - 0.15, at("s4", "top") + 0.1, u), 44);
  }
  if (id === "s5") {
    const PX = CX + 40, PY = 760, PS = 1.35, rot = -Math.PI / 2; // lying flat, cap on the left
    const a1 = sm(at("s5", "hole") - 0.15, at("s5", "hole") + 0.1, u);
    const a2 = sm(at("s5", "usb") - 0.25, at("s5", "usb") + 0.1, u);
    const a3 = sm(at("s5", "write") - 0.35, at("s5", "write"), u);
    pen(PX, PY, PS, pr(-0.05, 0.5), GREEN, rot, { lens: 1, lc: a1 > 0.5 ? RED : GREEN, usb: a2 });
    const [lx, ly] = penLens(PX, PY, PS, rot);
    if (a2 < 0.5) draw(C(lx, ly, 44), RED, 6, a1, 150, { amp: 3 });
    tag("TINY HOLE", 300, 600, RED, a1, 42);
    tag("USB PORT", 300, 930, GREEN, a2, 42);
    // the pen tip drags across paper and leaves no ink
    const s = sm(at("s5", "pen") - 0.1, at("s5", "write") + 0.2, u);
    draw(R(560, 1000, 380, 170, 10), VIOLET, 5, a3, 160, { closed: true, blur: 10 });
    draw([[600, 1110], [660, 1070], [720, 1120], [780, 1075]], mix(VIOLET, BG, 0.6), 4, s * a3, 161, { a: 0.35, blur: 4 });
    cross(880, 1085, 0.9, sm(at("s5", "write") - 0.05, at("s5", "write") + 0.3, u), RED);
    tag("WON'T WRITE", 750, 940, RED, a3, 42);
  }
  if (id === "s6") {
    const DX = 470, DY = 900;
    const open = 1 - sm(at("s6", "drawer") + 0.1, at("s6", "drawer") + 0.45, u);
    const drop = sm(at("s6", "put") - 0.25, at("s6", "drawer") + 0.05, u);
    const inside = open < 0.6 ? 1 : 0;
    const PX = lerp(700, 650, drop), PY = lerp(640, 990, drop);
    if (!inside) pen(PX, PY, 0.6, pr(-0.05, 0.4), drop > 0.6 ? GREEN : RED, lerp(0.3, Math.PI / 2, drop), { lens: 1 - drop, lc: RED });
    drawer(DX, DY, open, pr(-0.05, 0.5), open < 0.5 ? GREEN : VIOLET);
    tag("OUT OF SIGHT", DX, 700, GREEN, sm(at("s6", "drawer") + 0.35, at("s6", "drawer") + 0.6, u), 48);
  }
  if (id === "s7") {
    drawer(470, 1010, 0, 0.7, GREEN);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE PEN"], RED, 400, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "never") - 0.1);
  if (id === "s2") words(["PEN CAMERAS"], RED, 400, 0.0, 1, 140, flash(u, at("s2", "cheap")) * 0.6);
  if (id === "s3") words(["TINY HOLE"], RED, 400, 0.0, 1, 140, flash(u, at("s3", "hole")) * 0.6, at("s3", "hole") - 0.05);
  if (id === "s4") words(["PICK IT UP"], GREEN, 400, 0.0, 1, 140, flash(u, at("s4", "pick")) * 0.6);
  if (id === "s5") words(["LOOK FOR"], GREEN, 400, 0.0, 1, 140, flash(u, at("s5", "look")) * 0.6);
  if (id === "s6") words(["IN A DRAWER"], GREEN, 400, at("s6", "put") - 0.15, 1, 140, flash(u, at("s6", "drawer")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CHECK THE PEN"], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["PUT IT AWAY"], ORANGE, 880, at("s7", "put") - 0.05, 1, 150, flash(u, at("s7", "away")), at("s7", "away") - 0.05);
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
window.__hf.buildReady["pen-cam-glow-sketch"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
