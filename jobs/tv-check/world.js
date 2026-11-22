// tv-check (Hidden Cam 15) - COMIC ART style: cream page, one panel per line that slams in, thick black ink outlines,
// flat bold colours, halftone shading, onomatopoeia bursts. Same story, words and timing as world.flat.js.bak.
// Time only from hf-seek.
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

const cv = document.getElementById("world");
const x = cv.getContext("2d");

// ===================== STYLE KIT: COMIC ART =====================
// copy kept in ~/jarvis-admin/tmp/studio/style-kits/style-comic-art.js (reuse for any reel / RB showcase)
const RED = "#e8202a", GREEN = "#17b866", VIOLET = "#6c55ff", ORANGE = "#ff7a00", YELLOW = "#ffd21a", WHITE = "#ffffff";
const INK = "#111111", PAPER = "#fbf1d8", NIGHT = "#161a3d";
const CX = 510, TAU = Math.PI * 2;
const PX0 = 50, PY0 = 545, PW = 900, PH = 670; // the panel (inside the Instagram safe zone)
const FONT = (px) => `italic 900 ${px}px Inter, Arial, sans-serif`;
let curU = 0;
const hs = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function circ(X, Y, r) { x.beginPath(); x.arc(X, Y, r, 0, TAU); }
function ink(lw = 10) { x.strokeStyle = INK; x.lineWidth = lw; x.lineJoin = "round"; x.lineCap = "round"; }
// flat fill + black ink outline
function shape(path, color, lw = 10) { path(); x.fillStyle = color; x.fill(); ink(lw); path(); x.stroke(); }
// halftone dots in a box; dot size grows toward one corner (dir: "br" bottom-right, "b" bottom, "c" from centre out)
function halftone(X, Y, w, h, color, gap = 22, maxR = 7, dir = "br", a = 1) {
  x.save(); x.globalAlpha *= a; x.fillStyle = color;
  for (let j = 0, py = Y; py < Y + h + gap; py += gap, j++) {
    for (let px = X + (j % 2) * gap / 2; px < X + w + gap; px += gap) {
      let k;
      if (dir === "b") k = (py - Y) / h;
      else if (dir === "c") k = Math.hypot((px - X - w / 2) / (w / 2), (py - Y - h / 2) / (h / 2)) * 0.75;
      else k = ((px - X) / w + (py - Y) / h) / 2;
      const r = maxR * cl(k);
      if (r > 0.6) { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
    }
  }
  x.restore();
}
// halftone shading clipped to any path
// box = [X, Y, w, h] of the shape (in current coordinates) so the dots grade across the object itself
function shade(path, box, color = INK, a = 0.28, gap = 16, maxR = 6, dir = "br") {
  x.save(); path(); x.clip();
  const [X, Y, w, h] = box;
  halftone(X, Y, w, h, color, gap, maxR, dir, a); x.restore();
}
// the page behind the panel: cream paper with a soft red halftone in the corners
function page(bg = PAPER, dots = "#f2b9a8") {
  x.fillStyle = bg; x.fillRect(0, 0, 1080, 1920);
  halftone(0, 0, 1080, 1920, dots, 30, 9, "c", 0.55);
}
// the panel: offset ink drop + coloured ground + halftone; returns nothing, caller clips with panelClip()
function panelBg(bg) {
  x.fillStyle = INK; x.fillRect(PX0 + 16, PY0 + 16, PW, PH);
  x.fillStyle = bg; x.fillRect(PX0, PY0, PW, PH);
  halftone(PX0, PY0, PW, PH, mix(bg, INK, 0.22), 22, 8, "br", 0.9);
}
function panelClip() { x.beginPath(); x.rect(PX0, PY0, PW, PH); x.clip(); }
function panelBorder() { ink(14); x.lineCap = "butt"; x.strokeRect(PX0, PY0, PW, PH); }
// big kinetic comic words: ink drop shadow, thick ink stroke, flat colour, each word pops with a small tilt
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((Ln) => { x.font = FONT(100); return Math.min(maxPx, (800 / x.measureText(Ln).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((Ln, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = Ln.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.3, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.1, curU);
      const s = 0.3 + 0.7 * k, rot = (wi % 2 ? 1 : -1) * 0.035;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 30); x.rotate(rot); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = INK; x.fillText(p, 8, 9);
      x.lineWidth = Math.max(8, px * 0.13); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, YELLOW, flashK * 0.7) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.08;
  });
  x.restore();
}
// caption box label: colour box, ink border, white ink-stroked letters; pops in
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 46, s = 0.5 + 0.5 * cl(back(0, 1, a));
  x.translate(X, Y); x.rotate(-0.03); x.scale(s, s); x.globalAlpha = cl(a * 2);
  x.fillStyle = INK; x.fillRect(-w / 2 + 7, -px * 0.75 + 7, w, px * 1.5);
  x.fillStyle = color; x.fillRect(-w / 2, -px * 0.75, w, px * 1.5); ink(6); x.strokeRect(-w / 2, -px * 0.75, w, px * 1.5);
  x.lineWidth = 7; x.strokeText(txt, 0, 3); x.fillStyle = WHITE; x.fillText(txt, 0, 3);
  x.restore();
}
// onomatopoeia burst: yellow star with ink outline and red letters, pops with overshoot then holds
function burst(txt, X, Y, k, rot = -0.12, px = 92, fillC = YELLOW, txtC = RED) {
  if (k <= 0.01) return;
  const s = k;
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  x.font = FONT(px); const w = x.measureText(txt).width;
  const R1 = w * 0.62 + 40, R2 = R1 * 0.72, n = 14;
  const star = () => { x.beginPath(); for (let i = 0; i <= n * 2; i++) { const an = (i / (n * 2)) * TAU, r = (i % 2 ? R2 : R1) * (1 + (hs(i + px) - 0.5) * 0.18); const yy = Math.sin(an) * r * 0.62; i ? x.lineTo(Math.cos(an) * r, yy) : x.moveTo(Math.cos(an) * r, yy); } x.closePath(); };
  x.save(); x.translate(10, 12); star(); x.fillStyle = INK; x.fill(); x.restore();
  shape(star, fillC, 9);
  x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  x.lineWidth = px * 0.16; x.strokeStyle = INK; x.strokeText(txt, 0, 4); x.fillStyle = txtC; x.fillText(txt, 0, 4);
  x.restore();
}
const pop = (u, t0, hold = 99) => (u < t0 ? 0 : back(t0, t0 + 0.28, u) * (1 - sm(t0 + hold, t0 + hold + 0.2, u)));
// speed lines from a point (motion / impact)
function speed(X, Y, r0, r1, n, a, seed = 1, color = INK) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; ink(6); x.strokeStyle = color;
  for (let i = 0; i < n; i++) { const an = (i / n) * TAU + hs(i + seed) * 0.2, rr0 = r0 * (0.9 + hs(i * 3 + seed) * 0.3); x.beginPath(); x.moveTo(X + Math.cos(an) * rr0, Y + Math.sin(an) * rr0); x.lineTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); x.stroke(); }
  x.restore();
}
// ===================== end of kit =====================

// ---------- props (flat colour + ink + halftone) ----------
function tv(X, Y, w, h, a = 1, rim = VIOLET, screenK = 0.3) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a;
  ink(12); x.beginPath(); x.moveTo(X - w * 0.18, Y + h / 2 + 30); x.lineTo(X, Y + h / 2); x.lineTo(X + w * 0.18, Y + h / 2 + 30); x.stroke();
  const body = () => rr(X - w / 2, Y - h / 2, w, h, 18);
  shape(body, rim, 11); shade(body, [X - w / 2, Y - h / 2, w, h], INK, 0.3, 18, 7);
  const sx = X - w / 2 + 24, sy = Y - h / 2 + 24, sw = w - 48, sh = h - 64;
  const scr = () => rr(sx, sy, sw, sh, 8);
  shape(scr, mix("#20234a", "#4f74ff", screenK), 7);
  x.save(); scr(); x.clip();
  x.globalAlpha *= 0.45; x.fillStyle = WHITE; x.beginPath(); x.moveTo(sx + sw * 0.58, sy); x.lineTo(sx + sw * 0.72, sy); x.lineTo(sx + sw * 0.47, sy + sh); x.lineTo(sx + sw * 0.33, sy + sh); x.fill();
  x.restore();
  shade(scr, [sx, sy, sw, sh], INK, 0.35, 16, 7);
  circ(X + w / 2 - 50, Y + h / 2 - 20, 8); x.fillStyle = RED; x.fill(); ink(3); x.stroke();
  x.restore();
}
function mbox(X, Y, w, a = 1, rim = VIOLET, lensAt = -1, lensK = 0) {
  if (a <= 0) return;
  const h = w * 0.26;
  x.save(); x.globalAlpha *= a;
  const body = () => rr(X - w / 2, Y - h / 2, w, h, 14);
  shape(body, rim, 9); shade(body, [X - w / 2, Y - h / 2, w, h], INK, 0.3, 14, 6, "b");
  for (let i = 0; i < 5; i++) {
    const hx = X - w / 2 + w * 0.18 + i * w * 0.12, hy = Y, r = Math.max(9, w * 0.016);
    if (i === lensAt && lensK > 0) {
      circ(hx, hy, r * 1.35); x.fillStyle = mix("#111111", RED, lensK); x.fill(); ink(4); x.stroke();
      x.save(); circ(hx - r * 0.35, hy - r * 0.35, r * 0.4); x.fillStyle = WHITE; x.globalAlpha *= lensK; x.fill(); x.restore();
    } else { circ(hx, hy, r); x.fillStyle = INK; x.fill(); }
  }
  [[GREEN, 40], ["#3aa0ff", 72]].forEach(([c, dx]) => { circ(X + w / 2 - dx, Y, Math.max(7, w * 0.012)); x.fillStyle = c; x.fill(); ink(3); x.stroke(); });
  x.restore();
}
function cabinet(X, Y, w, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a;
  const body = () => rr(X - w / 2, Y, w, 150, 12);
  shape(body, "#b0732f", 10); shade(body, [X - w / 2, Y, w, 150], INK, 0.3, 16, 7, "b");
  ink(8); x.beginPath(); x.moveTo(X, Y + 20); x.lineTo(X, Y + 130); x.stroke();
  x.restore();
}
function phone(X, Y, s, a, rot = 0, lamp = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  shape(() => rr(-80, -150, 160, 300, 28), "#2a2a35", 9);
  shape(() => rr(-62, -118, 124, 236, 14), VIOLET, 5);
  shade(() => rr(-62, -118, 124, 236, 14), [-62, -118, 124, 236], INK, 0.3, 14, 6);
  if (lamp > 0) { circ(0, -134, 12); x.fillStyle = mix("#555555", "#fff6b0", lamp); x.fill(); ink(4); x.stroke(); }
  x.restore();
}
// flat comic light cone: pale yellow, ink edges
function beamTo(x0, y0, x1, y1, w, a, c = "#fff3a0") {
  if (a <= 0) return;
  const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy), nx = -dy / Ln, ny = dx / Ln;
  const cone = () => { x.beginPath(); x.moveTo(x0 + nx * 14, y0 + ny * 14); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 14, y0 - ny * 14); x.closePath(); };
  x.save(); x.globalAlpha *= 0.55 * a; cone(); x.fillStyle = c; x.fill(); x.restore();
  x.save(); x.globalAlpha *= 0.8 * a; ink(5); x.setLineDash([26, 16]); cone(); x.stroke(); x.restore();
}
function furn(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  if (kind === "bed") {
    ink(10); x.beginPath(); x.moveTo(-110, 50); x.lineTo(-110, 80); x.moveTo(110, 50); x.lineTo(110, 80); x.stroke();
    shape(() => rr(-110, -10, 220, 60, 12), c, 9); shade(() => rr(-110, -10, 220, 60, 12), [-110, -10, 220, 60]);
    shape(() => rr(-110, -60, 60, 50, 12), WHITE, 9);
  } else {
    shape(() => rr(-120, -20, 240, 60, 16), c, 9); shade(() => rr(-120, -20, 240, 60, 16), [-120, -20, 240, 60]);
    shape(() => rr(-120, -70, 240, 50, 16), c, 9);
    shape(() => rr(-150, -40, 40, 80, 14), c, 9); shape(() => rr(110, -40, 40, 80, 14), c, 9);
  }
  x.restore();
}
function plug(X, Y, s, a, c = VIOLET, pull = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  shape(() => rr(-70, -70, 140, 140, 20), WHITE, 9);
  circ(-22, 0, 10); x.fillStyle = INK; x.fill(); circ(22, 0, 10); x.fill();
  const dy = 40 + pull * 220;
  ink(12); x.beginPath(); x.moveTo(0, dy + 80); x.lineTo(0, dy + 300); x.stroke();
  shape(() => rr(-45, dy, 90, 80, 16), c, 9);
  x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  shape(() => circ(0, 0, 80), color, 10);
  x.beginPath();
  if (kind === "x") { x.moveTo(-36, -36); x.lineTo(36, 36); x.moveTo(36, -36); x.lineTo(-36, 36); }
  else { x.moveTo(-38, 4); x.lineTo(-10, 32); x.lineTo(40, -28); }
  x.strokeStyle = INK; x.lineWidth = 30; x.stroke(); x.strokeStyle = WHITE; x.lineWidth = 16; x.stroke();
  x.restore();
}
function glint(X, Y, a, u) {
  if (a <= 0) return;
  const p = 0.85 + 0.15 * Math.sin(u * 16);
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(p, p); x.rotate(0.2);
  const star = () => { x.beginPath(); for (let i = 0; i <= 8; i++) { const an = (i / 8) * TAU, r = i % 2 ? 14 : 62; i ? x.lineTo(Math.cos(an) * r, Math.sin(an) * r) : x.moveTo(Math.cos(an) * r, Math.sin(an) * r); } x.closePath(); };
  shape(star, WHITE, 6);
  x.restore();
}

// ---------- one frame ----------
const PANEL = { s1: "#8fd3ff", s2: "#ffe27a", s3: "#ffb0bd", s6: "#b6f2c8" };
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.setLineDash([]);
  x.clearRect(0, 0, 1080, 1920);
  if (id === "s8") return cta(u);

  const dark = id === "s4" ? sm(at("s4", "off") - 0.05, at("s4", "off") + 0.12, u) : id === "s5" || id === "s7" ? 1 : 0;
  page(dark > 0.5 ? "#e9dcc0" : PAPER);
  // panel slams in on every new line
  const slam = sm(-LEAD, 0.2 - LEAD, u), sgn = IDS.indexOf(id) % 2 ? 1 : -1;
  const z = 1 + 0.03 * cl(u / Math.max(1, d));
  x.save();
  x.translate(CX, 880); x.scale(1 + 0.1 * (1 - slam), 1 + 0.1 * (1 - slam)); x.rotate(sgn * 0.05 * (1 - slam)); x.translate(-CX, -880);
  const bg = PANEL[id] || mix("#ffe27a", NIGHT, dark);
  panelBg(bg);

  // content: draws twice-safe closures, inner (clipped to the panel) and over (breaks out of the panel)
  let inner = () => {}, over = () => {};
  if (id === "s1") {
    const a = 1;
    const T = sm(at("s1", "tv") - 0.1, at("s1", "tv") + 0.1, u), B = sm(at("s1", "boxes") - 0.1, at("s1", "boxes") + 0.1, u);
    inner = () => {
      speed(CX, 760, 360, 900, 28, 0.25);
      tv(CX, 760, 680, 400, a, T > 0.5 ? RED : VIOLET, 0.25);
      cabinet(CX, 1010, 720, a);
      mbox(CX - 170, 990, 260, a, B > 0.5 ? RED : VIOLET);
      mbox(CX + 170, 990, 260, a, B > 0.5 ? RED : VIOLET);
    };
    over = () => tag("SKIPPED", CX, 1170, RED, sm(at("s1", "skip") - 0.05, at("s1", "skip") + 0.2, u));
  }
  if (id === "s2") {
    const H = sm(at("s2", "holes") - 0.1, at("s2", "holes") + 0.15, u), Lt = sm(at("s2", "lights") - 0.1, at("s2", "lights") + 0.15, u), Wr = sm(at("s2", "wires") - 0.1, at("s2", "wires") + 0.4, u);
    const LK = sm(at("s2", "lens") - 0.1, at("s2", "blends") + 0.1, u);
    inner = () => {
      if (Wr > 0) { ink(14); x.beginPath(); const N = 40; for (let i = 0; i <= N * Wr; i++) { const k = i / N; const X = lerp(CX + 300, CX + 380, k), Y = 880 + 330 * k + 30 * Math.sin(k * 8); i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke();
        x.strokeStyle = VIOLET; x.lineWidth = 7; x.stroke(); }
      mbox(CX, 820, 780, 1, LK > 0.5 ? RED : VIOLET, 2, LK);
      if (LK > 0.3) speed(CX - 390 + 780 * 0.18 + 2 * 780 * 0.12, 820, 60, 160, 16, LK);
    };
    over = () => {
      tag("HOLES", CX - 230, 650, VIOLET, H, 40);
      tag("LIGHTS", CX + 230, 650, VIOLET, Lt, 40);
      tag("WIRES", CX + 250, 1060, VIOLET, Wr, 40);
      tag("ONE IS A LENS", CX - 120, 1000, RED, LK, 42);
    };
  }
  if (id === "s3") {
    const Bd = back(at("s3", "bed") - 0.1, at("s3", "bed") + 0.25, u), Cc = back(at("s3", "couch") - 0.1, at("s3", "couch") + 0.25, u);
    const fk = sm(at("s3", "faces") - 0.1, at("s3", "faces") + 0.2, u);
    inner = () => {
      tv(CX, 640, 440, 260, 1, VIOLET, 0.25);
      beamTo(CX, 700, 320, 1030, 120, fk * sm(at("s3", "bed") - 0.15, at("s3", "bed"), u), "#ff8a95");
      beamTo(CX, 700, 720, 1060, 120, fk * sm(at("s3", "couch") - 0.15, at("s3", "couch"), u), "#ff8a95");
      if (u > at("s3", "bed") - 0.1) furn("bed", 320, 1080, Bd * 1.1, 1, RED);
      if (u > at("s3", "couch") - 0.1) furn("couch", 720, 1100, Cc * 0.95, 1, RED);
    };
  }
  if (id === "s4") {
    const on = sm(at("s4", "shine") - 0.1, at("s4", "flashlight"), u);
    const sweep = sm(at("s4", "across") - 0.2, at("s4", "panel") + 0.4, u);
    const tx = lerp(CX - 300, CX + 300, sweep), ty = lerp(700, 910, sm(0.2, 0.5, sweep));
    const ph = sm(at("s4", "shine") - 0.25, at("s4", "phone"), u);
    const PXp = lerp(1000, 760, ph), PYp = lerp(1500, 1250, ph);
    inner = () => {
      tv(CX, 700, 640, 380, 1, on > 0.5 ? GREEN : VIOLET, 0);
      cabinet(CX, 930, 700, 1);
      mbox(CX - 165, 910, 250, 1, sweep > 0.4 ? GREEN : VIOLET);
      mbox(CX + 165, 910, 250, 1, sweep > 0.8 ? GREEN : VIOLET);
      beamTo(PXp - 30, PYp - 130, tx, ty, 200, on * (0.85 + 0.15 * Math.sin(u * 7)));
    };
    over = () => {
      phone(PXp, PYp, 0.9, ph, -0.5, on);
      burst("CLICK!", 300, 640, pop(u, at("s4", "off") - 0.05, 0.75), -0.14, 84);
    };
  }
  if (id === "s5") {
    const m = sm(at("s5", "move") - 0.3, at("s5", "light") + 0.5, u);
    const sw = 0.5 + 0.5 * Math.sin(m * Math.PI * 1.5);
    const lx = lerp(CX - 260, CX + 260, sw);
    const BW = 780, lensX = CX - BW / 2 + BW * 0.18 + 2 * BW * 0.12;
    const G = sm(at("s5", "glint") - 0.1, at("s5", "glint") + 0.1, u);
    inner = () => {
      beamTo(lerp(300, 760, sw) - 20, 1140, lx, 820, 170, 1);
      mbox(CX, 820, BW, 1, GREEN, 2, 0.4);
      x.save(); x.globalAlpha = 0.6; x.fillStyle = WHITE; x.beginPath(); x.ellipse(lx, 790, 70, 18, -0.2, 0, TAU); x.fill(); x.restore();
      glint(lensX, 820, G, u);
    };
    over = () => {
      tag("STAYS PUT", lensX, 680, GREEN, sm(at("s5", "stays") - 0.05, at("s5", "stays") + 0.2, u), 40);
      phone(lerp(300, 760, sw), 1260, 0.8, sm(-0.05, 0.25, u), -0.3, 1);
      burst("WAIT!", 720, 640, pop(u, at("s5", "glint") - 0.05, 0.9), 0.12, 84);
    };
  }
  if (id === "s6") {
    const P = sm(at("s6", "unplug") - 0.05, at("s6", "unplug") + 0.5, u);
    const R = sm(at("s6", "turn") - 0.05, at("s6", "wall") + 0.1, u);
    inner = () => {
      plug(290, 760, 1, 1, P > 0.5 ? GREEN : VIOLET, P);
      x.fillStyle = "#e6d3b0"; x.fillRect(600, 560, 340, 50); ink(8); x.beginPath(); x.moveTo(600, 610); x.lineTo(950, 610); x.stroke();
      halftone(600, 560, 340, 50, "#9c8a66", 14, 4, "b");
      x.save(); x.translate(770, 820); x.rotate(lerp(0, Math.PI, R)); mbox(0, 0, 300, 1, R > 0.5 ? GREEN : VIOLET); x.restore();
    };
    over = () => {
      stamp("v", 290, 620, back(at("s6", "unplug") + 0.2, at("s6", "unplug") + 0.5, u) * 0.6, P > 0.6 ? 1 : 0, GREEN);
      burst("YANK!", 300, 1110, pop(u, at("s6", "unplug") + 0.05, 0.8), 0.1, 80);
      tag("FACE THE WALL", 730, 1010, GREEN, sm(at("s6", "wall") - 0.1, at("s6", "wall") + 0.2, u), 40);
    };
  }
  if (id === "s7") {
    inner = () => speed(CX, 840, 260, 900, 40, 0.35, 9, "#ffd21a");
  }

  x.save(); x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40);
  x.save(); panelClip(); inner(); x.restore();
  x.restore();
  panelBorder();
  x.save(); x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40); over(); x.restore();
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER SKIP", "THE TV"], RED, 375, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["A LENS", "BLENDS RIGHT IN"], RED, 375, 0.0, 1, 125, flash(u, at("s2", "blends")) * 0.6);
  if (id === "s3") words(["IT FACES", "THE BED"], RED, 375, 0.0, 1, 135, flash(u, at("s3", "bed")) * 0.6);
  if (id === "s4") {
    const sw = at("s4", "shine") - 0.15;
    words(["LIGHTS OFF"], GREEN, 380, at("s4", "off") - 0.1, 1 - sm(sw - 0.1, sw, u), 135);
    words(["SWEEP EVERY PANEL"], GREEN, 380, sw, sm(sw - 0.05, sw, u), 120, flash(u, at("s4", "flashlight")) * 0.6);
  }
  if (id === "s5") words(["GLINT", "STAYS PUT?"], GREEN, 375, 0.0, 1, 135, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") {
    const sw = at("s6", "turn") - 0.15;
    words(["UNPLUG IT"], GREEN, 380, 0.0, 1 - sm(sw - 0.1, sw, u), 135);
    words(["OR TURN IT"], GREEN, 380, sw, sm(sw - 0.05, sw, u), 135);
  }
  if (id === "s7") {
    words(["LIGHTS OFF."], ORANGE, 700, 0.0, 1, 150, flash(u, 0.05));
    words(["LIGHT ON THE SCREEN"], ORANGE, 890, at("s7", "light", 2) - 0.05, 1, 115, flash(u, at("s7", "screen")));
  }
}
// s8 brand card: violet halftone page, comic letters, lens badge
function cta(u) {
  page(VIOLET, "#4b36d6");
  speed(CX, 560, 170, 1100, 36, 0.35 * sm(0, 0.3, u), 5);
  const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
  const k = back(0.0, 0.35, u);
  x.save(); x.translate(CX, 560); x.scale(k, k);
  shape(() => circ(0, 0, 120), WHITE, 12);
  shape(() => circ(0, 0, 70), INK, 6);
  shape(() => circ(0, 0, 36), RED, 5);
  circ(-14, -14, 10); x.fillStyle = WHITE; x.fill();
  x.restore();
  words([c1], WHITE, 800, 0.15, 1, 130);
  words([c2], YELLOW, 950, 0.3, 1, 150);
  if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["tv-check-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
