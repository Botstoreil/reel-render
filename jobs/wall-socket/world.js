// wall-socket (Hidden Cam 30) - COMIC ART style (kit from fake-plant / style-kits/style-comic-art.js): cream page, one panel per line,
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
function shape(path, color, lw = 10) { path(); x.fillStyle = color; x.fill(); ink(lw); path(); x.stroke(); }
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
function shade(path, box, color = INK, a = 0.28, gap = 16, maxR = 6, dir = "br") {
  x.save(); path(); x.clip();
  const [X, Y, w, h] = box;
  halftone(X, Y, w, h, color, gap, maxR, dir, a); x.restore();
}
function page(bg = PAPER, dots = "#f2b9a8") {
  x.fillStyle = bg; x.fillRect(0, 0, 1080, 1920);
  halftone(0, 0, 1080, 1920, dots, 30, 9, "c", 0.55);
}
function panelBg(bg) {
  x.fillStyle = INK; x.fillRect(PX0 + 16, PY0 + 16, PW, PH);
  x.fillStyle = bg; x.fillRect(PX0, PY0, PW, PH);
  halftone(PX0, PY0, PW, PH, mix(bg, INK, 0.22), 22, 8, "br", 0.9);
}
function panelClip() { x.beginPath(); x.rect(PX0, PY0, PW, PH); x.clip(); }
function panelBorder() { ink(14); x.lineCap = "butt"; x.strokeRect(PX0, PY0, PW, PH); }
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
function speed(X, Y, r0, r1, n, a, seed = 1, color = INK) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; ink(6); x.strokeStyle = color;
  for (let i = 0; i < n; i++) { const an = (i / n) * TAU + hs(i + seed) * 0.2, rr0 = r0 * (0.9 + hs(i * 3 + seed) * 0.3); x.beginPath(); x.moveTo(X + Math.cos(an) * rr0, Y + Math.sin(an) * rr0); x.lineTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); x.stroke(); }
  x.restore();
}
// ===================== end of kit =====================

// ---------- props (flat colour + ink + halftone) ----------
// wall socket, origin = centre of the plate (240 x 240 at s=1). o: plate colour, pin (pinhole), lensC, cut (plate slides off to show the camera board), shine (new and glossy)
function socket(X, Y, s, a = 1, o = {}) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  const cut = o.cut || 0;
  if (cut > 0) { // camera board behind the cover
    shape(() => rr(-110, -110, 220, 220, 10), "#1f8a4c", 8);
    shade(() => rr(-110, -110, 220, 220, 10), [-110, -110, 220, 220], INK, 0.35, 14, 5);
    ink(5); x.strokeStyle = YELLOW; x.beginPath(); x.moveTo(-80, 60); x.lineTo(-20, 60); x.lineTo(-20, 20); x.moveTo(80, -60); x.lineTo(30, -60); x.lineTo(30, -20); x.stroke();
    shape(() => rr(-34, -34, 68, 68, 8), "#333344", 6);
    shape(() => circ(0, 0, 22), INK, 4); shape(() => circ(0, 0, 11), RED, 3);
    circ(-5, -5, 4); x.fillStyle = WHITE; x.fill();
  }
  x.save(); x.translate(cut * 260, -cut * 40); x.rotate(cut * 0.35);
  const plate = () => rr(-120, -120, 240, 240, 26);
  x.save(); x.translate(9, 11); plate(); x.fillStyle = INK; x.fill(); x.restore();
  shape(plate, o.plate || "#f4f1e6", 10);
  shade(plate, [-120, -120, 240, 240], INK, o.shine ? 0.12 : 0.3, 14, 6);
  shape(() => circ(0, 0, 82), mix(o.plate || "#f4f1e6", INK, 0.08), 7);
  shape(() => circ(-38, 0, 17), INK, 4);
  shape(() => circ(38, 0, 17), INK, 4);
  if ((o.pin || 0) > 0) {
    x.save(); x.globalAlpha *= cl(o.pin * 2);
    shape(() => circ(0, -46, 7), INK, 2);
    circ(0, -46, 3.2); x.fillStyle = o.lensC || RED; x.fill();
    x.restore();
  }
  if (o.shine) { // gloss streaks
    x.save(); x.globalAlpha *= 0.9; x.strokeStyle = WHITE; x.lineWidth = 12; x.lineCap = "round";
    x.beginPath(); x.moveTo(-92, -40); x.lineTo(-40, -92); x.moveTo(-92, 0); x.lineTo(0, -92); x.stroke(); x.restore();
  }
  x.restore();
  x.restore();
}
const pinPos = (X, Y, s) => [X, Y - 46 * s];
function bed(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  ink(10); x.beginPath(); x.moveTo(-110, 50); x.lineTo(-110, 80); x.moveTo(110, 50); x.lineTo(110, 80); x.stroke();
  shape(() => rr(-130, -110, 26, 190, 8), "#b0732f", 8);
  shape(() => rr(-110, -10, 220, 60, 12), c, 9); shade(() => rr(-110, -10, 220, 60, 12), [-110, -10, 220, 60]);
  shape(() => rr(-104, -58, 64, 48, 14), WHITE, 9);
  x.restore();
}
function floor(Y) {
  x.fillStyle = "#c98f52"; x.fillRect(PX0, Y, PW, 400);
  halftone(PX0, Y, PW, 400, "#8a5a2a", 20, 7, "b", 0.8);
  ink(10); x.beginPath(); x.moveTo(PX0, Y); x.lineTo(PX0 + PW, Y); x.stroke();
  shape(() => rr(PX0 - 10, Y - 26, PW + 20, 26, 2), WHITE, 7); // skirting board
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
function glint(X, Y, a, u, s = 1.3) {
  if (a <= 0) return;
  const p = 0.85 + 0.15 * Math.sin(u * 16);
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(p * s, p * s); x.rotate(0.2);
  const star = () => { x.beginPath(); for (let i = 0; i <= 8; i++) { const an = (i / 8) * TAU, r = i % 2 ? 14 : 62; i ? x.lineTo(Math.cos(an) * r, Math.sin(an) * r) : x.moveTo(Math.cos(an) * r, Math.sin(an) * r); } x.closePath(); };
  shape(star, WHITE, 6);
  x.restore();
}
function magnifier(X, Y, s, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  ink(30); x.beginPath(); x.moveTo(70, 70); x.lineTo(160, 160); x.stroke();
  x.strokeStyle = "#6b4a2a"; x.lineWidth = 18; x.stroke();
  x.save(); x.globalAlpha *= 0.28; circ(0, 0, 100); x.fillStyle = WHITE; x.fill(); x.restore();
  ink(12); circ(0, 0, 100); x.stroke();
  x.strokeStyle = RED; x.lineWidth = 6; circ(0, 0, 100); x.stroke();
  x.restore();
}
// a guest kneeling on one knee, facing right, holding the phone forward. origin = floor under the back knee
function kneeler(X, Y, s, a = 1, shirt = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  const leg = (pts, c) => { ink(46); x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); x.stroke(); x.strokeStyle = c; x.lineWidth = 30; x.stroke(); };
  leg([[-110, -6], [0, -20], [40, -120]], "#2c3e8f");          // back leg: foot, knee on floor, hip
  leg([[40, -120], [160, -140], [170, -10]], "#2c3e8f");       // front leg: hip, knee up, foot
  shape(() => rr(140, -24, 70, 26, 10), INK, 4);               // front shoe
  shape(() => rr(-10, -330, 100, 230, 40), shirt, 9);          // torso
  shade(() => rr(-10, -330, 100, 230, 40), [-10, -330, 100, 230], INK, 0.3, 14, 6);
  ink(40); x.beginPath(); x.moveTo(60, -300); x.lineTo(170, -250); x.lineTo(240, -260); x.stroke();
  x.strokeStyle = shirt; x.lineWidth = 26; x.stroke();         // arm forward
  shape(() => circ(250, -262, 20), "#f2c59b", 6);               // hand
  shape(() => circ(45, -390, 62), "#f2c59b", 9);               // head
  shape(() => circ(78, -396, 10), INK, 2);                     // eye
  shape(() => { x.beginPath(); x.arc(45, -400, 64, Math.PI * 1.02, Math.PI * 1.85); x.closePath(); }, "#4a2c1a", 7); // hair
  x.restore();
}
// reception bell on a desk
function bell(X, Y, s, a = 1, ring = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  shape(() => rr(-150, 0, 300, 40, 10), "#b0732f", 9);
  shape(() => { x.beginPath(); x.ellipse(0, -6, 120, 22, 0, 0, TAU); }, "#d9d9e0", 7);
  const dome = () => { x.beginPath(); x.moveTo(-100, -10); x.bezierCurveTo(-100, -150, 100, -150, 100, -10); x.closePath(); };
  shape(dome, YELLOW, 9); shade(dome, [-100, -130, 200, 120], INK, 0.3, 14, 6);
  shape(() => rr(-10, -160, 20, 40, 6), "#d9d9e0", 6);
  shape(() => circ(0, -168, 16), "#d9d9e0", 6);
  if (ring > 0) { x.save(); x.globalAlpha *= ring; ink(8); for (const sg of [-1, 1]) { x.beginPath(); x.arc(0, -110, 150, sg > 0 ? -0.7 : Math.PI + 0.3, sg > 0 ? -0.3 : Math.PI + 0.7); x.stroke(); x.beginPath(); x.arc(0, -110, 190, sg > 0 ? -0.6 : Math.PI + 0.25, sg > 0 ? -0.25 : Math.PI + 0.6); x.stroke(); } x.restore(); }
  x.restore();
}
function box3(X, Y, s, a = 1) { // a shipping box with a fake cover inside
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  shape(() => rr(-150, -100, 300, 200, 8), "#c99a5b", 9); shade(() => rr(-150, -100, 300, 200, 8), [-150, -100, 300, 200], INK, 0.3, 14, 6);
  shape(() => { x.beginPath(); x.moveTo(-150, -100); x.lineTo(-200, -160); x.lineTo(-90, -160); x.lineTo(-40, -100); x.closePath(); }, "#ddb27a", 8);
  shape(() => { x.beginPath(); x.moveTo(150, -100); x.lineTo(200, -160); x.lineTo(90, -160); x.lineTo(40, -100); x.closePath(); }, "#ddb27a", 8);
  x.restore();
}

// ---------- one frame ----------
const PANEL = { s1: "#8fd3ff", s2: "#ffe27a", s3: "#ffb0bd", s4: "#b6f2c8", s6: "#c9c2ff" };
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.setLineDash([]);
  x.clearRect(0, 0, 1080, 1920);
  if (id === "s8") return cta(u);

  const dark = id === "s5" ? 1 : 0;
  page(PAPER);
  const slam = sm(-LEAD, 0.2 - LEAD, u), sgn = IDS.indexOf(id) % 2 ? 1 : -1;
  const z = 1 + 0.03 * cl(u / Math.max(1, d));
  x.save();
  x.translate(CX, 880); x.scale(1 + 0.1 * (1 - slam), 1 + 0.1 * (1 - slam)); x.rotate(sgn * 0.05 * (1 - slam)); x.translate(-CX, -880);
  const bg = PANEL[id] || mix("#ffe27a", NIGHT, dark * 0.85);
  panelBg(bg);

  let inner = () => {}, over = () => {};
  if (id === "s1") {
    const B = sm(at("s1", "bed") - 0.15, at("s1", "bed") + 0.1, u);
    const SK = sm(at("s1", "socket") - 0.1, at("s1", "low") + 0.15, u);
    const [px, py] = pinPos(770, 1080, 0.55);
    inner = () => {
      floor(1130);
      bed(300, 1020, 1.4, 1, B > 0.5 ? RED : VIOLET);
      beamTo(px, py, 330, 1000, 140, B, "#ff8a95");
      socket(770, 1080, 0.55, 1, { pin: B });
      if (SK > 0 && B < 0.5) { x.save(); x.globalAlpha *= SK * (1 - B * 2); ink(8); x.strokeStyle = RED; circ(770, 1080, 95 + 8 * Math.sin(u * 10)); x.stroke(); x.restore(); }
    };
    over = () => tag("FACING THE BED", 560, 760, RED, sm(at("s1", "never") - 0.1, at("s1", "never") + 0.15, u), 42);
  }
  if (id === "s2") {
    const BX = sm(at("s2", "sold") - 0.2, at("s2", "sold") + 0.15, u);
    const C = sm(at("s2", "built") - 0.05, at("s2", "into") + 0.25, u);
    inner = () => {
      box3(CX - 10, 1130, 1.1, 1);
      x.save(); x.translate(0, -230 * BX);
      socket(CX - 90, 1060, 1.05, 1, { cut: C * 0.75 });
      x.restore();
      speed(CX - 90, 830, 140, 520, 24, 0.3 * C, 3);
    };
    over = () => {
      tag("FAKE COVER", CX - 90, 1150, RED, sm(at("s2", "fake") - 0.1, at("s2", "fake") + 0.15, u), 44);
      tag("CAMERA INSIDE", CX + 200, 650, RED, sm(at("s2", "covers") - 0.15, at("s2", "covers") + 0.1, u), 40);
    };
  }
  if (id === "s3") {
    const P = sm(at("s3", "pinhole") - 0.1, at("s3", "pinhole") + 0.15, u);
    const H = sm(at("s3", "plug") - 0.1, at("s3", "plug") + 0.15, u);
    const S3 = 2.2, SX = CX - 30, SY = 950;
    const [px, py] = pinPos(SX, SY, S3);
    inner = () => {
      socket(SX, SY, S3, 1, { pin: P });
      if (H > 0) { x.save(); x.globalAlpha *= H; x.strokeStyle = RED; x.lineWidth = 8; x.setLineDash([16, 12]); circ(SX - 38 * S3, SY, 52); x.stroke(); circ(SX + 38 * S3, SY, 52); x.stroke(); x.restore(); }
    };
    over = () => {
      magnifier(lerp(px + 260, px, P), lerp(py - 120, py, P), 0.85, sm(at("s3", "hide") - 0.2, at("s3", "hide"), u));
      tag("PINHOLE", px + 250, py - 140, RED, P, 46);
    };
  }
  if (id === "s4") {
    const K = back(at("s4", "kneel") - 0.05, at("s4", "kneel") + 0.3, u);
    const on = sm(at("s4", "torch") - 0.1, at("s4", "torch") + 0.1, u);
    const sx = 820, sy = 1060, ss = 0.6;
    const [px, py] = pinPos(sx, sy, ss);
    const hx = 230 + 250 * 0.85, hy = 1130 - 262 * 0.85 + 40 * (1 - K);
    inner = () => {
      floor(1130);
      socket(sx, sy, ss, 1, {});
      x.save(); x.globalAlpha *= cl(K); x.translate(0, 40 * (1 - cl(K))); kneeler(230, 1130, 0.85, 1, GREEN); x.restore();
      phone(hx + 18, hy - 40, 0.42, cl(K), 1.35, on);
      beamTo(hx + 50, hy - 20, px, py, 110, on * (0.85 + 0.15 * Math.sin(u * 7)));
    };
    over = () => {
      tag("KNEEL DOWN", 300, 680, GREEN, sm(at("s4", "kneel") - 0.05, at("s4", "down") + 0.1, u), 46);
      tag("TORCH STRAIGHT ON", 600, 790, GREEN, sm(at("s4", "straight") - 0.1, at("s4", "straight") + 0.15, u), 40);
    };
  }
  if (id === "s5") {
    const G = sm(at("s5", "back") - 0.15, at("s5", "back") + 0.05, u);
    const S5 = 1.9, SX = CX - 40, SY = 980;
    const [px, py] = pinPos(SX, SY, S5);
    inner = () => {
      socket(SX, SY, S5, 1, { pin: 1, lensC: GREEN, plate: "#cfcbbd" });
      beamTo(920, 1180, px, py, 210, 0.75 + 0.15 * Math.sin(u * 7));
      glint(px, py, G, u, 1.5);
    };
    over = () => {
      burst("GLINT!", 300, 680, pop(u, at("s5", "glint") - 0.05, 2), -0.12, 84);
      tag("SMALL + BRIGHT", 640, 1150, GREEN, sm(at("s5", "small") - 0.1, at("s5", "bright") + 0.1, u), 44);
    };
  }
  if (id === "s6") {
    const T = sm(at("s6", "tell") - 0.12, at("s6", "tell") + 0.12, u);
    const N = sm(at("s6", "newer") - 0.15, at("s6", "newer") + 0.1, u);
    const G0 = 1 - sm(0.25, 0.45, u);
    inner = () => {
      x.save(); x.globalAlpha *= 1 - T; x.translate(-400 * T, 0);
      socket(310, 960, 0.95, 1, { plate: "#e2d3a4" });
      socket(700, 960, 0.95, 1, { plate: "#ffffff", shine: true, pin: 1 });
      glint(700, 960 - 46 * 0.95, G0, u, 0.9);
      x.restore();
      if (T > 0) { x.save(); x.globalAlpha *= T; x.translate(400 * (1 - T), 0); bell(CX - 60, 1110, 1.5, 1, flash(u, at("s6", "front") + 0.1)); x.restore(); }
    };
    over = () => {
      x.save(); x.globalAlpha *= 1 - T;
      tag("OLD", 310, 1140, VIOLET, sm(at("s6", "rest") - 0.15, at("s6", "rest") + 0.1, u), 44);
      tag("NEWER?", 700, 1140, VIOLET, N, 44);
      x.restore();
      tag("TELL THE FRONT DESK", CX, 680, GREEN, sm(at("s6", "front") - 0.1, at("s6", "front") + 0.15, u), 40);
      stamp("v", 800, 860, back(at("s6", "desk") - 0.05, at("s6", "desk") + 0.25, u) * 0.6, T > 0.5 ? 1 : 0, GREEN);
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
  if (id === "s1") words(["NEVER IGNORE", "THE WALL SOCKET"], RED, 375, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["FAKE SOCKET", "COVERS"], RED, 375, 0.0, 1, 135, flash(u, at("s2", "fake")) * 0.6);
  if (id === "s3") words(["LENS IN", "A PINHOLE"], RED, 375, 0.0, 1, 135, flash(u, at("s3", "pinhole")) * 0.6);
  if (id === "s4") words(["KNEEL AND", "SHINE A TORCH"], GREEN, 375, 0.0, 1, 135, flash(u, at("s4", "torch")) * 0.6);
  if (id === "s5") words(["WATCH FOR", "A GLINT"], GREEN, 375, 0.0, 1, 135, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") words(["NOT SURE?", "TELL THE DESK"], VIOLET, 375, 0.0, 1, 130, flash(u, at("s6", "tell")) * 0.6);
  if (id === "s7") {
    words(["CHECK LOW SOCKETS"], ORANGE, 700, 0.0, 1, 140, flash(u, 0.05));
    words(["WATCH FOR A GLINT"], ORANGE, 890, at("s7", "watch") - 0.05, 1, 130, flash(u, at("s7", "glint")));
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
window.__hf.buildReady["wall-socket-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
