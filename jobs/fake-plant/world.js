// fake-plant (Hidden Cam 24) - COMIC ART style (kit from tv-check / style-kits/style-comic-art.js): cream page, one panel per line,
// flat bold colours, halftone shading, onomatopoeia bursts.
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
  x.beginPath(); x.rect(X, Y, w, h); x.clip();
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
const LEAVES = [[-1.15, 250], [-0.8, 300], [-0.45, 320], [-0.15, 290], [0.18, 310], [0.5, 300], [0.85, 280], [1.2, 230], [-0.3, 220], [0.35, 230]];
// fake plant, origin = bottom centre of the pot. o: part (leaves spread), lens, wire, hole, light, leaf colour, lensC
function plant(X, Y, s, a = 1, o = {}) {
  if (a <= 0) return;
  const leafC = o.leaf || GREEN, part = o.part || 0;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  // wire out of the back of the pot
  if ((o.wire || 0) > 0) {
    ink(14); x.beginPath(); const N = 30;
    for (let i = 0; i <= N * o.wire; i++) { const k = i / N; const px = 50 + 230 * k, py = -50 - 70 * k + 18 * Math.sin(k * 7); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke(); x.strokeStyle = RED; x.lineWidth = 7; x.stroke();
  }
  // leaves (back to front) from the top of the pot
  LEAVES.forEach(([an0, len], i) => {
    const an = an0 + Math.sign(an0 || 1) * part * (Math.abs(an0) < 0.5 ? 0.45 : 0.15);
    const ex = Math.sin(an) * len * 0.55, ey = -150 - Math.cos(an) * len * 0.55;
    ink(8); x.beginPath(); x.moveTo(0, -150); x.lineTo(Math.sin(an) * len * 0.3, -150 - Math.cos(an) * len * 0.3); x.stroke();
    const leaf = () => { x.beginPath(); x.ellipse(ex, ey, 34, len * 0.42, an, 0, TAU); };
    shape(leaf, i % 2 ? leafC : mix(leafC, "#0b5e34", 0.35), 7);
    x.save(); leaf(); x.clip(); ink(4); x.beginPath(); x.moveTo(ex - Math.sin(an) * len * 0.38, ey + Math.cos(an) * len * 0.38); x.lineTo(ex + Math.sin(an) * len * 0.38, ey - Math.cos(an) * len * 0.38); x.stroke(); x.restore();
  });
  // hidden lens between the leaves
  if ((o.lens || 0) > 0) {
    x.save(); x.globalAlpha *= cl(o.lens * 2);
    shape(() => circ(18, -270, 26), INK, 5);
    shape(() => circ(18, -270, 13), o.lensC || RED, 3);
    circ(12, -276, 5); x.fillStyle = WHITE; x.fill();
    x.restore();
  }
  // tiny light at the base of the leaves
  // pot
  const pot = () => { x.beginPath(); x.moveTo(-95, -150); x.lineTo(95, -150); x.lineTo(68, 0); x.lineTo(-68, 0); x.closePath(); };
  shape(pot, o.pot || "#d4663a", 10); shade(pot, [-95, -150, 190, 150], INK, 0.35, 14, 6);
  shape(() => rr(-108, -170, 216, 36, 10), o.pot || "#d4663a", 10);
  if ((o.hole || 0) > 0) { x.save(); x.globalAlpha *= cl(o.hole * 2); shape(() => circ(-28, -78, 12), INK, 3); x.restore(); }
  if ((o.light || 0) > 0) { // tiny light at the base of the leaves, drawn over the rim so it is never hidden
    x.save(); x.globalAlpha *= cl(o.light * 1.5); x.shadowColor = "#ff2a2a"; x.shadowBlur = 30 * o.light;
    shape(() => circ(-40, -192, 15), mix("#551111", "#ff2a2a", o.light), 4); x.restore();
  }
  x.restore();
}
const lensPos = (X, Y, s) => [X + 18 * s, Y - 270 * s];
function shelf(X, Y, w, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a;
  shape(() => rr(X - w / 2, Y, w, 34, 6), "#b0732f", 9); shade(() => rr(X - w / 2, Y, w, 34, 6), [X - w / 2, Y, w, 34], INK, 0.3, 12, 5, "b");
  ink(9); x.beginPath(); x.moveTo(X - w / 2 + 30, Y + 34); x.lineTo(X - w / 2 + 30, Y + 80); x.moveTo(X + w / 2 - 30, Y + 34); x.lineTo(X + w / 2 - 30, Y + 80); x.stroke();
  x.restore();
}
function furn(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  ink(10); x.beginPath(); x.moveTo(-110, 50); x.lineTo(-110, 80); x.moveTo(110, 50); x.lineTo(110, 80); x.stroke();
  shape(() => rr(-110, -10, 220, 60, 12), c, 9); shade(() => rr(-110, -10, 220, 60, 12), [-110, -10, 220, 60]);
  shape(() => rr(-110, -60, 60, 50, 12), WHITE, 9);
  x.restore();
}
function door(X, Y, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a;
  shape(() => rr(X, Y, 230, 560, 6), "#3b2a4f", 10);
  shape(() => { x.beginPath(); x.moveTo(X + 20, Y + 20); x.lineTo(X + 120, Y + 60); x.lineTo(X + 120, Y + 520); x.lineTo(X + 20, Y + 545); x.closePath(); }, "#b0732f", 9);
  shade(() => rr(X, Y, 230, 560, 6), [X, Y, 230, 560], INK, 0.3, 16, 6);
  x.restore();
}
function peeker(X, Y, a = 1, look = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a;
  shape(() => rr(X - 60, Y + 70, 120, 200, 40), "#ff9f43", 9);
  shape(() => circ(X, Y, 62), "#f2c59b", 9);
  shape(() => circ(X + 22 + look * 6, Y - 6, 10), INK, 2);
  ink(6); x.beginPath(); x.moveTo(X - 40, Y - 60); x.quadraticCurveTo(X, Y - 85, X + 45, Y - 55); x.stroke();
  x.restore();
}
function magnifier(X, Y, s, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  ink(30); x.beginPath(); x.moveTo(70, 70); x.lineTo(160, 160); x.stroke();
  x.strokeStyle = "#6b4a2a"; x.lineWidth = 18; x.stroke();
  x.save(); x.globalAlpha *= 0.28; circ(0, 0, 100); x.fillStyle = WHITE; x.fill(); x.restore();
  ink(12); circ(0, 0, 100); x.stroke();
  x.strokeStyle = VIOLET; x.lineWidth = 6; circ(0, 0, 100); x.stroke();
  x.save(); x.globalAlpha *= 0.8; x.strokeStyle = WHITE; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 70, -2.6, -1.7); x.stroke(); x.restore();
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
function beamTo(x0, y0, x1, y1, w, a, c = "#fff3a0") {
  if (a <= 0) return;
  const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy), nx = -dy / Ln, ny = dx / Ln;
  const cone = () => { x.beginPath(); x.moveTo(x0 + nx * 14, y0 + ny * 14); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 14, y0 - ny * 14); x.closePath(); };
  x.save(); x.globalAlpha *= 0.55 * a; cone(); x.fillStyle = c; x.fill(); x.restore();
  x.save(); x.globalAlpha *= 0.8 * a; ink(5); x.setLineDash([26, 16]); cone(); x.stroke(); x.restore();
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
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(p * 1.3, p * 1.3); x.rotate(0.2);
  const star = () => { x.beginPath(); for (let i = 0; i <= 8; i++) { const an = (i / 8) * TAU, r = i % 2 ? 14 : 62; i ? x.lineTo(Math.cos(an) * r, Math.sin(an) * r) : x.moveTo(Math.cos(an) * r, Math.sin(an) * r); } x.closePath(); };
  shape(star, WHITE, 6);
  x.restore();
}

// ---------- one frame ----------
const PANEL = { s1: "#8fd3ff", s2: "#ffe27a", s3: "#ffb0bd", s4: "#b6f2c8", s5: "#c9c2ff" };
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.setLineDash([]);
  x.clearRect(0, 0, 1080, 1920);
  if (id === "s8") return cta(u);

  const dark = id === "s6" ? sm(-0.05, at("s6", "torch"), u) : id === "s7" ? 1 : 0;
  page(dark > 0.5 ? "#e9dcc0" : PAPER);
  const slam = sm(-LEAD, 0.2 - LEAD, u), sgn = IDS.indexOf(id) % 2 ? 1 : -1;
  const z = 1 + 0.03 * cl(u / Math.max(1, d));
  x.save();
  x.translate(CX, 880); x.scale(1 + 0.1 * (1 - slam), 1 + 0.1 * (1 - slam)); x.rotate(sgn * 0.05 * (1 - slam)); x.translate(-CX, -880);
  const bg = PANEL[id] || mix("#ffe27a", NIGHT, dark);
  panelBg(bg);

  let inner = () => {}, over = () => {};
  if (id === "s1") {
    const B = sm(at("s1", "bed") - 0.15, at("s1", "bed") + 0.1, u);
    const [lx, ly] = lensPos(700, 880, 0.62);
    inner = () => {
      furn("bed", 300, 1040, 1.25, 1, B > 0.5 ? RED : VIOLET);
      beamTo(lx, ly, 300, 1030, 150, B, "#ff8a95");
      shelf(700, 880, 340);
      plant(700, 880, 0.62, 1, { lens: B, part: 0.3 * B });
    };
    over = () => tag("FACING THE BED", 640, 1140, RED, sm(at("s1", "never") - 0.1, at("s1", "never") + 0.15, u), 42);
  }
  if (id === "s2") {
    const P = sm(at("s2", "hide") - 0.2, at("s2", "hide") + 0.2, u), L = sm(at("s2", "small") - 0.1, at("s2", "camera") + 0.05, u);
    const [lx, ly] = lensPos(CX, 1170, 1.2);
    inner = () => {
      speed(lx, ly, 120, 700, 26, 0.3 * L, 3);
      plant(CX, 1170, 1.2, 1, { part: P, lens: L });
    };
    over = () => { tag("SMALL CAMERA", lx + 150, ly - 150, RED, L, 42); };
  }
  if (id === "s3") {
    const look = sm(at("s3", "look") - 0.1, at("s3", "door") + 0.2, u);
    const X1 = sm(at("s3", "won't") - 0.05, at("s3", "won't") + 0.2, u);
    const [lx, ly] = lensPos(740, 960, 0.5);
    inner = () => {
      door(70, 600);
      peeker(250, 760, sm(-0.05, 0.3, u), look);
      if (look > 0) { x.save(); x.globalAlpha *= look; ink(6); x.setLineDash([22, 16]); x.beginPath(); x.moveTo(285, 755); x.lineTo(lx, ly); x.stroke(); x.restore(); }
      shelf(740, 960, 280);
      plant(740, 960, 0.5, 1, { lens: 0 });
    };
    over = () => {
      stamp("x", 560, 700, back(at("s3", "won't") - 0.05, at("s3", "won't") + 0.25, u) * 0.55, X1 > 0.05 ? 1 : 0, RED);
      tag("LENS STAYS HIDDEN", 640, 1150, RED, sm(at("s3", "lens") - 0.1, at("s3", "lens") + 0.15, u), 40);
    };
  }
  if (id === "s4") {
    const m1 = sm(at("s4", "closely") - 0.2, at("s4", "pot"), u), m2 = sm(at("s4", "base") - 0.25, at("s4", "base") + 0.05, u);
    const MX = lerp(lerp(CX + 330, CX - 40, m1), CX - 10, m2), MY = lerp(lerp(1130, 1080, m1), 900, m2);
    inner = () => { plant(CX - 20, 1240, 1.9, 1, {}); };
    over = () => {
      magnifier(MX, MY, 1.15, sm(-0.05, 0.3, u));
      tag("POT", CX + 250, 1120, GREEN, sm(at("s4", "pot") - 0.1, at("s4", "pot") + 0.15, u), 46);
      tag("LEAF BASE", CX + 250, 820, GREEN, sm(at("s4", "base") - 0.1, at("s4", "base") + 0.15, u), 46);
    };
  }
  if (id === "s5") {
    const Wr = sm(at("s5", "wires") - 0.1, at("s5", "wires") + 0.35, u), H = sm(at("s5", "hole") - 0.15, at("s5", "hole") + 0.1, u), Lt = sm(at("s5", "light") - 0.15, at("s5", "light") + 0.1, u);
    inner = () => { plant(CX - 60, 1150, 1.45, 1, { wire: Wr, hole: H, light: Lt * (0.7 + 0.3 * Math.sin(u * 18)) }); };
    over = () => {
      tag("WIRES?", CX + 280, 870, GREEN, Wr, 46);
      tag("HOLE?", CX - 320, 1060, GREEN, H, 46);
      tag("LIGHT?", CX - 320, 860, GREEN, Lt, 46);
    };
  }
  if (id === "s6") {
    const on = sm(at("s6", "torch") - 0.1, at("s6", "torch") + 0.1, u);
    const G = sm(at("s6", "glint") - 0.12, at("s6", "glint"), u);
    const [lx, ly] = lensPos(CX - 40, 1180, 1.3);
    inner = () => {
      plant(CX - 40, 1180, 1.3, 1, { lens: 0.35 + 0.65 * G, lensC: GREEN, part: 0.25 * on });
      beamTo(840, 1020, lx, ly, 160, on * (0.85 + 0.15 * Math.sin(u * 7)));
      glint(lx, ly, G, u);
    };
    over = () => {
      phone(850, 1130, 0.7, sm(-0.05, 0.25, u), -0.4, on);
      burst("GLINT!", 300, 650, pop(u, at("s6", "glint") - 0.05, 0.9), -0.12, 84);
    };
  }
  if (id === "s7") {
    inner = () => speed(CX, 840, 260, 900, 40, 0.35, 9, "#ffd21a");
  }

  x.save(); panelClip();
  x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40);
  inner();
  x.restore();
  panelBorder();
  x.save(); x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40); over(); x.restore();
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE FAKE PLANT"], RED, 375, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["PERFECT", "HIDING SPOT"], RED, 375, 0.0, 1, 135, flash(u, at("s2", "camera")) * 0.6);
  if (id === "s3") words(["A QUICK LOOK", "MISSES IT"], RED, 375, 0.0, 1, 135, flash(u, at("s3", "lens")) * 0.6);
  if (id === "s4") words(["LOOK UP CLOSE"], GREEN, 380, 0.0, 1, 135, flash(u, at("s4", "base")) * 0.6);
  if (id === "s5") words(["WIRE. HOLE.", "LIGHT."], GREEN, 375, 0.0, 1, 135, flash(u, at("s5", "light")) * 0.6);
  if (id === "s6") words(["TORCH THROUGH", "THE LEAVES"], GREEN, 375, 0.0, 1, 130, flash(u, at("s6", "glint")) * 0.6);
  if (id === "s7") {
    words(["CHECK UP CLOSE"], ORANGE, 700, 0.0, 1, 140, flash(u, 0.05));
    words(["LOOK FOR A GLINT"], ORANGE, 890, at("s7", "look") - 0.05, 1, 130, flash(u, at("s7", "glint")));
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
window.__hf.buildReady["fake-plant-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
