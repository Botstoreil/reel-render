// private-fix (YogaFlow 19) - COMIC ART style. Same story, words and timing as world.flat.js.bak. Time only from hf-seek.
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
// people: joints in px, y up = negative, origin on the floor (same poses as the flat version)
const P = {
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] },
  lunge: { head: [0, -400], sh: [0, -330], hip: [0, -170], kL: [-110, -110], fL: [-130, 0], kR: [90, -70], fR: [190, 0], eL: [-30, -450], hL: [-20, -560], eR: [30, -450], hR: [20, -560] },
  lean: { head: [-40, -385], sh: [-20, -315], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-50, -245], hL: [-40, -175], eR: [20, -245], hR: [30, -175] },
};
P.risky = Object.assign({}, P.lunge, { kL: [-200, -95], hip: [-40, -160], sh: [-50, -320], head: [-55, -390], eL: [-80, -440], hL: [-70, -550], eR: [-20, -440], hR: [-30, -550] });
P.stiff = Object.assign({}, P.risky, { eL: [-70, -250], hL: [-70, -170], eR: [-30, -250], hR: [-30, -170] });
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function with_(p, ch) { return Object.assign({}, p, ch); }
function walkPose(sw) { return with_(P.stand, { fL: [-24 + 40 * sw, 0], fR: [24 - 40 * sw, 0], kL: [-14 + 20 * sw, -98], kR: [14 - 20 * sw, -98] }); }
// comic figure: thick ink outline round every limb, flat colour inside, far limbs darker
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha *= a; x.lineCap = "round"; x.lineJoin = "round";
  const [hx, hy] = W2("head"), [sx, sy] = W2("sh");
  const far = mix(color, INK, 0.3), w = 34 * s, ol = Math.max(9, 14 * s);
  const limb = (c, lw, pts) => {
    const path = () => { x.beginPath(); pts.forEach(([px, py], i) => (i ? x.lineTo(px, py) : x.moveTo(px, py))); };
    path(); x.strokeStyle = INK; x.lineWidth = lw + ol; x.stroke();
    path(); x.strokeStyle = c; x.lineWidth = lw; x.stroke();
  };
  limb(far, w, ["hip", "kR", "fR"].map(W2)); limb(far, w, ["sh", "eR", "hR"].map(W2));
  limb(color, w * 1.3, [[lerp(hx, sx, 0.55), lerp(hy, sy, 0.55)], [sx, sy], W2("hip")]);
  limb(color, w, ["hip", "kL", "fL"].map(W2)); limb(color, w, ["sh", "eL", "hL"].map(W2));
  shape(() => circ(hx, hy, 42 * s), color, ol * 0.75);
  if (o.blush) { x.globalAlpha *= o.blush; x.fillStyle = RED; circ(hx - 18 * s, hy + 12 * s, 11 * s); x.fill(); circ(hx + 18 * s, hy + 12 * s, 11 * s); x.fill(); }
  if (o.sweat) { x.globalAlpha = a * o.sweat; shape(() => { x.beginPath(); x.moveTo(hx + 52 * s, hy - 40 * s); x.quadraticCurveTo(hx + 70 * s, hy - 5 * s, hx + 52 * s, hy); x.quadraticCurveTo(hx + 34 * s, hy - 5 * s, hx + 52 * s, hy - 40 * s); }, "#8fd3ff", 5); }
  x.restore();
  return W2;
}
function mat(X, Y, w, a = 1, c = VIOLET) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.fillStyle = INK; x.fillRect(X - w / 2 + 6, Y + 6, w, 24); shape(() => rr(X - w / 2, Y, w, 24, 10), c, 7); x.restore();
}
function floorLine(Y) { x.save(); ink(7); x.beginPath(); x.moveTo(PX0, Y); x.lineTo(PX0 + PW, Y); x.stroke(); halftone(PX0, Y, PW, 200, INK, 18, 5, "b", 0.18); x.restore(); }
function ring(X, Y, r, c, a) { if (a <= 0) return; x.save(); x.globalAlpha *= a; x.lineWidth = 22; x.strokeStyle = INK; circ(X, Y, r); x.stroke(); x.lineWidth = 11; x.strokeStyle = c; x.stroke(); x.restore(); }
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
// speech balloon: white ellipse, ink outline + drop, tail toward (tx, ty), ink letters
function bubble(txt, X, Y, a, tx, ty, px = 44, color = INK) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px); const w = x.measureText(txt).width + 60, h = px * 1.8;
  X = Math.min(X, 930 - w / 2 - 20); X = Math.max(X, 70 + w / 2 + 20);
  const s = 0.5 + 0.5 * cl(back(0, 1, a));
  x.translate(X, Y); x.scale(s, s); x.globalAlpha *= cl(a * 2);
  const ex = (tx - X) * 0.5, ey = Math.max(h / 2 + 40, (ty - Y) * 0.5);
  const tail = () => { x.beginPath(); x.moveTo(-34, h / 2 - 10); x.lineTo(ex, ey); x.lineTo(10, h / 2 - 8); x.closePath(); };
  const body = () => { x.beginPath(); x.ellipse(0, 0, w / 2 + 24, h / 2 + 8, 0, 0, TAU); };
  x.save(); x.translate(8, 9); x.fillStyle = INK; body(); x.fill(); tail(); x.fill(); x.restore();
  x.fillStyle = WHITE; ink(9); tail(); x.fill(); x.stroke(); body(); x.fill(); x.stroke();
  x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 0, 3);
  x.restore();
}
// stage spotlight from the panel top onto (X, Y)
function spot(X, Y, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= 0.6 * a;
  x.fillStyle = "#fff3a0"; x.beginPath(); x.moveTo(X - 30, PY0 - 60); x.lineTo(X + 30, PY0 - 60); x.lineTo(X + 230, Y); x.lineTo(X - 230, Y); x.closePath(); x.fill();
  x.restore();
  x.save(); x.globalAlpha *= a; x.fillStyle = "#fff3a0"; x.beginPath(); x.ellipse(X, Y, 230, 30, 0, 0, TAU); x.fill(); ink(6); x.stroke(); x.restore();
}
function padlock(X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  x.lineCap = "round"; x.strokeStyle = INK; x.lineWidth = 34; x.beginPath(); x.arc(0, -40, 50, Math.PI, 0); x.stroke();
  x.strokeStyle = "#c9c9d6"; x.lineWidth = 18; x.stroke();
  x.fillStyle = INK; x.fillRect(-74, -34, 160, 130);
  shape(() => rr(-80, -40, 160, 130, 18), c, 10);
  shade(() => rr(-80, -40, 160, 130, 18), [-80, -40, 160, 130], INK, 0.3, 14, 5);
  shape(() => circ(0, 15, 16), INK, 4);
  x.restore();
}
// cue waves out of a mouth
function waves(X, Y, a, u) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; ink(9);
  for (let i = 0; i < 3; i++) { const r = 26 + i * 24 + ((u * 60) % 24); x.beginPath(); x.arc(X, Y, r, -0.6, 0.6); x.stroke(); }
  x.restore();
}
// teacher standing at (TX, Y) pointing the right arm at (tx, ty)
function pointer(TX, Y, s, tx, ty, k, c) {
  const rx = (tx - TX) / s, ry = (ty - Y) / s, Ln = Math.hypot(rx, ry + 335);
  const dx = rx / Ln, dy = (ry + 335) / Ln;
  const p = with_(P.stand, { eR: [lerp(34, dx * 90, k), lerp(-260, -335 + dy * 90, k)], hR: [lerp(38, dx * 190, k), lerp(-185, -335 + dy * 190, k)] });
  return person(TX, Y, p, s, c);
}
// a helping hand (sleeve + palm) reaching in from the left to (hx, hy)
function hand(hx, hy, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; x.lineCap = "round";
  x.beginPath(); x.moveTo(hx - 260, hy + 50); x.lineTo(hx - 20, hy + 4); x.strokeStyle = INK; x.lineWidth = 50; x.stroke(); x.strokeStyle = GREEN; x.lineWidth = 34; x.stroke();
  shape(() => { x.beginPath(); x.ellipse(hx, hy, 38, 30, -0.2, 0, TAU); }, "#ffd2b0", 8);
  x.restore();
}

// ---------- one frame ----------
const PANEL = { s1: "#8fd3ff", s2: "#ffb0bd", s3: "#ffe27a", s4: "#b6f2c8", s5: "#c9c2ff", s6: "#b6f2c8" };
const DIMP = mix(VIOLET, WHITE, 0.45);
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.setLineDash([]);
  x.clearRect(0, 0, 1080, 1920);
  if (id === "s8") return cta(u);

  page(PAPER);
  const slam = sm(-LEAD, 0.2 - LEAD, u), sgn = IDS.indexOf(id) % 2 ? 1 : -1;
  const z = 1 + 0.03 * cl(u / Math.max(1, d));
  x.save();
  x.translate(CX, 880); x.scale(1 + 0.1 * (1 - slam), 1 + 0.1 * (1 - slam)); x.rotate(sgn * 0.05 * (1 - slam)); x.translate(-CX, -880);
  panelBg(PANEL[id] || NIGHT);

  let inner = () => {}, over = () => {};
  const FY = 1120; // floor line in content coords (shows at ~1160 on screen, inside the panel)
  if (id === "s1") {
    // three lunges; the middle knee shoots past the toes; the teacher points and calls them out under a spotlight
    const Rk = sm(at("s1", "risky") - 0.1, at("s1", "risky") + 0.15, u);
    const Cl = sm(at("s1", "call") - 0.1, at("s1", "out") + 0.1, u);
    const xs = [250, 500, 750];
    inner = () => {
      floorLine(FY + 24);
      spot(500, FY + 10, Cl);
      xs.forEach((X, i) => { mat(X, FY, 230, 1, i === 1 && Rk > 0.5 ? ORANGE : VIOLET); person(X, FY, i === 1 ? P.risky : P.lunge, 0.5, i === 1 ? (Rk > 0.5 ? ORANGE : VIOLET) : DIMP, { sweat: i === 1 ? Cl : 0 }); });
      ring(500 - 200 * 0.5, FY - 95 * 0.5, 44 + 4 * Math.sin(u * 10), RED, Rk);
      pointer(880, 900, 0.42, 560, 950, Cl, RED);
    };
    over = () => {
      tag("RISKY KNEE", 500, 600, ORANGE, Rk * (1 - Cl), 40);
      bubble("HEY YOU! YOUR KNEE!", 520, 610, Cl, 860, 740, 42, RED);
    };
  }
  if (id === "s2") {
    // under the spotlight the student locks up stiff, blushes, trembles
    const St = sm(at("s2", "stiff") - 0.15, at("s2", "stiff") + 0.15, u);
    const Em = sm(at("s2", "embarrassed") - 0.1, at("s2", "embarrassed") + 0.2, u);
    const tr = St * Math.sin(u * 60) * 5;
    inner = () => {
      floorLine(FY + 34);
      spot(CX, FY + 20, 1);
      speed(CX - 20, 820, 330, 900, 30, 0.3 * St, 3);
      mat(CX, FY + 10, 360, 1);
      person(CX + 30 + tr, FY + 10, pose(P.risky, P.stiff, St), 0.85, St > 0.5 ? ORANGE : VIOLET, { blush: Em, sweat: St });
    };
    over = () => {
      tag("SINGLED OUT", CX, 575, RED, sm(at("s2", "singled") - 0.1, at("s2", "singled") + 0.15, u), 42);
      tag("STIFF", 220, 660, ORANGE, St, 44);
      tag("EMBARRASSED", 740, 660, RED, Em, 40);
    };
  }
  if (id === "s3") {
    // a helping hand tries to adjust the stiff body: a padlock appears, the hand bounces off
    const Sp0 = { X: CX + 80, s: 0.85 };
    const kx = Sp0.X - 200 * Sp0.s, ky = FY + 10 - 95 * Sp0.s;
    const H = sm(at("s3", "harder") - 0.4, at("s3", "harder"), u), Bo = sm(at("s3", "harder"), at("s3", "adjust") + 0.2, u);
    const hx = lerp(lerp(150, kx - 50, H), 190, Bo * 0.7);
    inner = () => {
      floorLine(FY + 34);
      mat(Sp0.X, FY + 10, 360, 1);
      person(Sp0.X, FY + 10, P.stiff, Sp0.s, ORANGE, { sweat: 1 });
      hand(hx, ky, sm(-0.05, 0.2, u));
      padlock(kx + 20, ky - 220, back(at("s3", "harder") - 0.05, at("s3", "harder") + 0.3, u) * 0.75, 1, RED);
    };
    over = () => {
      tag("STIFF BODY", CX, 600, ORANGE, sm(at("s3", "stiff") - 0.1, at("s3", "body") + 0.1, u), 42);
      burst("BONK!", 240, 1060, pop(u, at("s3", "harder") + 0.02, 0.8), -0.12, 70);
    };
  }
  if (id === "s4") {
    // teacher cues the whole room, no name; the middle front knee settles back
    const Cu = sm(at("s4", "cue") - 0.2, at("s4", "cue") + 0.1, u);
    const Fx = sm(at("s4", "whole") - 0.1, at("s4", "room") + 0.4, u);
    const xs = [430, 650, 870];
    inner = () => {
      floorLine(FY + 24);
      person(180, FY, P.stand, 0.6, GREEN);
      waves(215, FY - 395 * 0.6, Cu, u);
      xs.forEach((X, i) => {
        mat(X, FY, 210, 1, GREEN);
        const k = i === 1 ? cl(Fx * 0.6) : 0;
        person(X, FY, pose(i === 1 ? P.risky : P.lunge, P.lunge, k), 0.45, i === 1 ? ORANGE : GREEN);
      });
    };
    over = () => {
      bubble("KNEE OVER ANKLE!", 560, 650, Cu, 230, 880, 44);
      tag("NO NAME", 800, 790, GREEN, sm(at("s4", "without") - 0.1, at("s4", "name") + 0.1, u), 42);
    };
  }
  if (id === "s5") {
    // still needs help: teacher walks over, leans in, small quiet balloon
    const Wk = sm(at("s5", "walk") - 0.15, at("s5", "over") + 0.3, u);
    const sw = Math.sin(u * 9) * (Wk > 0.02 && Wk < 0.98 ? 0.9 : 0);
    const tp = pose(walkPose(sw), P.lean, sm(at("s5", "say") - 0.2, at("s5", "say"), u));
    inner = () => {
      floorLine(FY + 24);
      mat(400, FY, 300, 1);
      person(400, FY, pose(P.risky, P.lunge, 0.6), 0.7, ORANGE);
      person(lerp(960, 700, Wk), FY, tp, 0.7, GREEN);
    };
    over = () => {
      tag("STILL STUCK?", 330, 610, ORANGE, sm(at("s5", "still") - 0.1, at("s5", "help") + 0.1, u), 40);
      bubble("psst... knee back a bit", 620, 700, sm(at("s5", "quietly") - 0.25, at("s5", "quietly") + 0.05, u), 690, 860, 34);
    };
  }
  if (id === "s6") {
    // first a check on what works (strong arms), then the change (knee back)
    const Ch = sm(at("s6", "change") - 0.1, at("s6", "isn't") + 0.4, u);
    const Wo = sm(at("s6", "working") - 0.15, at("s6", "working") + 0.1, u);
    let kx = 0, ky = 0;
    inner = () => {
      floorLine(FY + 34);
      mat(CX - 40, FY + 10, 360, 1, GREEN);
      const Sp = person(CX - 40, FY + 10, pose(pose(P.risky, P.lunge, 0.6), P.lunge, Ch), 0.85, Ch > 0.9 ? GREEN : VIOLET);
      [kx, ky] = Sp("kL");
      ring(kx, ky, 50, YELLOW, Ch * (1 - sm(0.9, 1, Ch) * 0.5));
    };
    over = () => {
      stamp("v", 790, 640, back(at("s6", "working") - 0.1, at("s6", "working") + 0.25, u) * 0.6, Wo, GREEN);
      tag("STRONG ARMS!", 790, 770, GREEN, Wo, 38);
      burst("NICE!", 230, 640, pop(u, at("s6", "working") - 0.05, 0.9), -0.1, 70, YELLOW, GREEN);
      tag("THEN: KNEE BACK", 240, 830, ORANGE, sm(at("s6", "change") - 0.1, at("s6", "change") + 0.15, u), 34);
    };
  }
  if (id === "s7") {
    inner = () => { speed(CX, 840, 260, 900, 40, 0.35, 9, YELLOW); };
  }

  x.save(); panelClip();
  x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40);
  inner();
  x.restore();
  panelBorder();
  x.save(); x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40); over(); x.restore();
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER CALL THEM OUT", "IN FRONT OF EVERYONE"], RED, 360, 0.0, 1, 120, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["THEY GO STIFF"], RED, 375, 0.0, 1, 140, flash(u, at("s2", "stiff")) * 0.6);
  if (id === "s3") words(["HARDER", "TO ADJUST"], RED, 375, 0.0, 1, 140, flash(u, at("s3", "harder")) * 0.6);
  if (id === "s4") words(["CUE THE", "WHOLE ROOM"], GREEN, 375, 0.0, 1, 140, flash(u, at("s4", "whole")) * 0.6);
  if (id === "s5") words(["THEN SAY IT", "QUIETLY"], GREEN, 375, 0.0, 1, 140, flash(u, at("s5", "quietly")) * 0.6);
  if (id === "s6") words(["PRAISE FIRST"], GREEN, 380, 0.0, 1, 140, flash(u, at("s6", "working")) * 0.6);
  if (id === "s7") {
    words(["CUE THE ROOM."], ORANGE, 700, 0.0, 1, 150, flash(u, 0.05));
    words(["THEN WHISPER."], ORANGE, 890, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "whisper")));
  }
}
// s8 brand card: violet halftone page, comic letters, a calm seated figure in a badge
function cta(u) {
  page(VIOLET, "#4b36d6");
  speed(CX, 560, 170, 1100, 36, 0.35 * sm(0, 0.3, u), 5);
  const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
  const k = back(0.0, 0.35, u);
  x.save(); x.translate(CX, 560); x.scale(k, k);
  x.fillStyle = INK; circ(8, 10, 130); x.fill();
  shape(() => circ(0, 0, 130), WHITE, 12);
  person(0, 85, P.sit, 0.62, GREEN);
  x.restore();
  words([c1], WHITE, 800, 0.15, 1, 130);
  words([c2], YELLOW, 950, 0.3, 1, 150);
  if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["private-fix-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
