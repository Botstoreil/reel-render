// pose-names (YogaFlow 25) - COMIC ART style (kit from fake-plant / style-kits/style-comic-art.js): cream page, one panel per line,
// flat bold colours, halftone shading, onomatopoeia bursts. Time only from hf-seek.
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
const INK = "#111111", PAPER = "#fbf1d8";
const CX = 510, TAU = Math.PI * 2;
const PX0 = 50, PY0 = 545, PW = 900, PH = 670;
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
  X = Math.min(X, 920 - w / 2); X = Math.max(X, 80 + w / 2);
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
// ===================== end of kit =====================

// ---------- comic yoga people (feet on the floor at Y, facing screen-right; sx=-1 faces left) ----------
const STAND = { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-30, -262], hL: [-34, -188], eR: [30, -262], hR: [34, -188] };
const SCRATCH = Object.assign({}, STAND, { eR: [95, -360], hR: [40, -450] }); // hand to the head
const TALK = Object.assign({}, STAND, { eR: [90, -300], hR: [170, -330] }); // teacher: open hand toward the class
const FOLD = { head: [120, -80], sh: [80, -150], hip: [-20, -240], kL: [-15, -120], fL: [-25, 0], kR: [5, -120], fR: [5, 0], eL: [100, -75], hL: [115, 0], eR: [110, -75], hR: [130, 0] };
const DOG = { head: [150, -95], sh: [105, -160], hip: [-25, -310], kL: [-95, -150], fL: [-165, 0], kR: [-80, -150], fR: [-145, 0], eL: [150, -78], hL: [190, 0], eR: [160, -76], hR: [205, 0] };
const ARMSUP = Object.assign({}, STAND, { eL: [-40, -440], hL: [-30, -560], eR: [40, -440], hR: [30, -560] });
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
const SKIN = "#f2c59b", PANTS = "#2b2d55";
function person(X, Y, p, s, shirt, o = {}) {
  const sx = o.sx ?? 1;
  const W2 = (j) => [X + p[j][0] * s * sx, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha *= a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, w, ...js) => {
    const path = () => { x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); };
    path(); x.strokeStyle = INK; x.lineWidth = w * s + 14; x.stroke();
    path(); x.strokeStyle = c; x.lineWidth = w * s; x.stroke();
  };
  const back2 = mix(shirt, INK, 0.25);
  limb(mix(PANTS, INK, 0.2), 38, "hip", "kR", "fR"); limb(back2, 32, "sh", "eR", "hR");
  limb(shirt, 56, "sh", "hip");
  limb(PANTS, 38, "hip", "kL", "fL"); limb(shirt, 32, "sh", "eL", "hL");
  ["hL", "hR"].forEach((j) => { const [hx, hy] = W2(j); shape(() => circ(hx, hy, 15 * s + 4), SKIN, 6); });
  const [hx, hy] = W2("head"), R = 46 * s;
  shape(() => circ(hx, hy, R), SKIN, 8);
  x.save(); circ(hx, hy, R); x.clip(); x.fillStyle = o.hair || "#3a2416"; x.fillRect(hx - R, hy - R, 2 * R, R * 0.75); x.restore();
  ink(8); circ(hx, hy, R); x.stroke();
  const look = (o.look ?? 1) * sx;
  x.fillStyle = INK; circ(hx + look * R * 0.42, hy + R * 0.05, R * 0.13); x.fill(); circ(hx + look * R * 0.05, hy + R * 0.05, R * 0.13); x.fill();
  if (o.mouth) { ink(5); x.beginPath(); x.arc(hx + look * R * 0.25, hy + R * 0.45, R * 0.18, 0, TAU); x.stroke(); }
  x.restore();
  return W2;
}
function mat(X, Y, w, c = VIOLET, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a;
  shape(() => rr(X - w / 2, Y - 6, w, 26, 8), c, 7);
  x.restore();
}
function floor(Y) { x.fillStyle = "#e7c79a"; x.fillRect(0, Y + 18, 1080, 600); halftone(0, Y + 18, 1080, 400, "#c99a62", 18, 6, "b", 0.8); ink(8); x.beginPath(); x.moveTo(0, Y + 18); x.lineTo(1080, Y + 18); x.stroke(); }
// comic speech bubble: white body, ink outline, tail to the speaker (tx, ty); lines = [[text, colour, px], ...]
function speech(lines, X, Y, a, tx, ty) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const ws = lines.map(([t, , px]) => { x.font = FONT(px); return x.measureText(t).width; });
  const w = Math.max(...ws) + 80, h = lines.reduce((s, [, , px]) => s + px * 1.2, 0) + 44;
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 70 + w / 2);
  const s = 0.4 + 0.6 * cl(back(0, 1, a));
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = cl(a * 2);
  const dx = (tx - X) * 0.75, dy = (ty - Y) * 0.75;
  const body = () => rr(-w / 2, -h / 2, w, h, 40);
  const tail = () => { x.beginPath(); x.moveTo(-34, h / 2 - 8); x.lineTo(dx, dy); x.lineTo(20, h / 2 - 8); x.closePath(); };
  x.save(); x.translate(8, 10); body(); x.fillStyle = INK; x.fill(); x.restore();
  shape(tail, WHITE, 8); shape(body, WHITE, 9);
  x.fillStyle = WHITE; x.fillRect(-30, h / 2 - 16, 46, 14);
  let y = -h / 2 + 22;
  lines.forEach(([t, c, px]) => { x.font = FONT(px); y += px * 0.6; x.lineJoin = "round"; x.lineWidth = px * 0.12; x.strokeStyle = INK; x.strokeText(t, 0, y); x.fillStyle = c; x.fillText(t, 0, y); y += px * 0.6; });
  x.restore();
}
function sight(x0, y0, x1, y1, k, c = INK) {
  if (k <= 0) return;
  x.save(); ink(6); x.strokeStyle = c; x.setLineDash([20, 14]);
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); x.stroke(); x.restore();
}
function arrow(X0, Y0, X1, Y1, k, c) {
  if (k <= 0) return;
  const X = lerp(X0, X1, k), Y = lerp(Y0, Y1, k), an = Math.atan2(Y1 - Y0, X1 - X0);
  x.save(); x.lineCap = "round";
  for (const [col, w] of [[INK, 26], [c, 14]]) {
    x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(X0, Y0); x.lineTo(X, Y); x.stroke();
    x.beginPath(); x.moveTo(X + Math.cos(an + 2.5) * 40, Y + Math.sin(an + 2.5) * 40); x.lineTo(X, Y); x.lineTo(X + Math.cos(an - 2.5) * 40, Y + Math.sin(an - 2.5) * 40); x.stroke();
  }
  x.restore();
}

// ---------- one frame ----------
const PANEL = { s1: "#8fd3ff", s2: "#ffe27a", s3: "#ffb0bd", s4: "#b6f2c8", s5: "#c9c2ff", s6: "#b6f2c8", s7: "#ffe27a" };
const FY = 1110; // floor line inside the panel (inner coordinates, +40 on screen)
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
  panelBg(PANEL[id]);

  let inner = () => {}, over = () => {};
  if (id === "s1") {
    // teacher calls only the Sanskrit name; the new student on the right has no idea
    const B = sm(at("s1", "cue") - 0.2, at("s1", "cue") + 0.1, u);
    const Q = pop(u, at("s1", "alone") - 0.05);
    inner = () => {
      floor(FY);
      mat(230, FY, 260, VIOLET); mat(760, FY, 260, RED);
      person(230, FY, pose(STAND, TALK, B), 0.62, VIOLET, { mouth: B > 0.5 });
      person(760, FY, STAND, 0.55, "#ff9f43", { sx: -1 });
    };
    over = () => {
      speech([["ADHO MUKHA", INK, 50], ["SVANASANA!", INK, 50]], 470, 700, B, 280, 860);
      burst("???", 800, 760, Q, 0.1, 70);
      tag("NEW STUDENT", 760, 1150, RED, sm(at("s1", "students") - 0.1, at("s1", "students") + 0.15, u), 40);
    };
  }
  if (id === "s2") {
    // close on the beginner: hand to the head, question marks
    const Sc = sm(at("s2", "don't") - 0.1, at("s2", "know") + 0.1, u);
    inner = () => {
      floor(FY + 60);
      person(CX - 60, FY + 60 + 220, pose(STAND, SCRATCH, Sc), 1.25, "#ff9f43", { look: -1 });
    };
    over = () => {
      burst("?", 760, 700, pop(u, at("s2", "beginners") + 0.15), 0.15, 110);
      burst("?", 820, 900, pop(u, at("s2", "names") - 0.05), -0.2, 90);
      tag("BEGINNER", 240, 690, RED, sm(at("s2", "beginners") - 0.05, at("s2", "beginners") + 0.2, u), 46);
    };
  }
  if (id === "s3") {
    // they freeze, then look sideways and copy the neighbour (who is guessing too)
    const Fr = pop(u, at("s3", "freeze") - 0.05, at("s3", "copy") - at("s3", "freeze"));
    const Cp = sm(at("s3", "copy") - 0.1, at("s3", "person") + 0.1, u);
    const sh = (i) => (Fr > 0.05 ? Math.sin(u * 60 + i) * 4 : 0);
    inner = () => {
      floor(FY);
      [200, 470].forEach((X, i) => { mat(X, FY, 220, RED); });
      mat(760, FY, 220, VIOLET);
      person(760, FY, ARMSUP, 0.55, VIOLET, { look: -1 });
      person(200 + sh(1), FY, pose(STAND, ARMSUP, 0.5 * sm(at("s3", "next") - 0.1, at("s3", "them"), u)), 0.55, RED, { look: Cp > 0.3 ? 1 : 0.3 });
      person(470 + sh(2), FY, pose(STAND, ARMSUP, 0.6 * sm(at("s3", "person"), at("s3", "them") + 0.1, u)), 0.55, RED, { look: Cp > 0.3 ? 1 : 0.3 });
      sight(215, FY - 225, 730, FY - 230, Cp, RED);
      sight(485, FY - 225, 735, FY - 228, Cp, RED);
    };
    over = () => {
      burst("FREEZE!", 330, 700, Fr, -0.1, 70, YELLOW, RED);
      tag("COPYING", 330, 1150, RED, sm(at("s3", "copy") - 0.05, at("s3", "copy") + 0.2, u), 44);
      stamp("x", 860, 700, back(at("s3", "next") - 0.05, at("s3", "next") + 0.25, u) * 0.5, u > at("s3", "next") - 0.05 ? 1 : 0, RED);
    };
  }
  if (id === "s4") {
    // teacher says both names: English first, Sanskrit with it
    const E = sm(at("s4", "english") - 0.15, at("s4", "english") + 0.1, u), Sk = sm(at("s4", "sanskrit") - 0.15, at("s4", "sanskrit") + 0.1, u);
    inner = () => {
      floor(FY);
      mat(220, FY, 260, GREEN); mat(770, FY, 240, GREEN);
      person(220, FY, TALK, 0.62, GREEN, { mouth: true });
      person(770, FY, STAND, 0.55, "#ff9f43", { sx: -1 });
    };
    over = () => {
      const L = [["DOWNWARD DOG", GREEN, 64]];
      if (Sk > 0.02) L.push(["ADHO MUKHA SVANASANA", INK, 34 * Sk + 0.01]);
      speech(L, 500, 700, E, 270, 860);
      tag("ENGLISH", 760, 860, GREEN, sm(at("s4", "name") - 0.1, at("s4", "name") + 0.15, u), 40);
      stamp("v", 860, 1000, back(at("s4", "one") - 0.05, at("s4", "one") + 0.25, u) * 0.45, u > at("s4", "one") - 0.05 ? 1 : 0, GREEN);
    };
  }
  if (id === "s5") {
    // cue the shape: hands come down to the mat, then the hips lift
    const Hd = sm(at("s5", "hands") - 0.1, at("s5", "down") + 0.15, u), Hp = sm(at("s5", "hips") - 0.1, at("s5", "up") + 0.2, u);
    const P = Hp > 0 ? pose(FOLD, DOG, Hp) : pose(STAND, FOLD, Hd);
    const s = 0.95, X0 = CX - 10;
    inner = () => {
      floor(FY);
      mat(X0 + 20, FY, 460, GREEN);
      person(X0, FY, P, s, VIOLET);
    };
    over = () => {
      const hx = X0 + P.hL[0] * s, hip = [X0 + P.hip[0] * s, FY + P.hip[1] * s];
      tag("HANDS DOWN", 760, 1150, GREEN, sm(at("s5", "hands") - 0.05, at("s5", "hands") + 0.2, u), 42);
      arrow(hx + 60, FY - 210, hx + 60, FY - 70, sm(at("s5", "hands"), at("s5", "down") + 0.1, u), GREEN);
      tag("HIPS UP", 260, 680, VIOLET, sm(at("s5", "hips") - 0.05, at("s5", "hips") + 0.2, u), 46);
      arrow(hip[0] - 120, FY - 120, hip[0] - 120, FY - 330, sm(at("s5", "hips"), at("s5", "up") + 0.15, u), VIOLET);
    };
  }
  if (id === "s6") {
    // teacher demonstrates once; the class sees it and follows
    const Dm = sm(-0.05, at("s6", "once"), u), Ev = sm(at("s6", "everyone") - 0.05, at("s6", "sees") + 0.15, u);
    inner = () => {
      floor(FY);
      mat(250, FY, 380, GREEN); mat(600, FY, 230, VIOLET); mat(840, FY, 230, VIOLET);
      person(230, FY, pose(STAND, DOG, Dm), 0.62, GREEN);
      person(610, FY, pose(STAND, DOG, Ev), 0.45, "#ff9f43", { look: -1 });
      person(850, FY, pose(STAND, DOG, sm(at("s6", "sees") - 0.1, at("s6", "pose") + 0.1, u)), 0.45, VIOLET, { look: -1 });
    };
    over = () => {
      tag("DEMO", 250, 700, GREEN, sm(at("s6", "show") - 0.05, at("s6", "show") + 0.2, u), 46);
      stamp("v", 820, 720, back(at("s6", "pose") - 0.1, at("s6", "pose") + 0.2, u) * 0.5, u > at("s6", "pose") - 0.1 ? 1 : 0, GREEN);
    };
  }
  if (id === "s7") inner = () => speed(CX, 840, 260, 900, 40, 0.35, 9, "#ff7a00");

  x.save(); panelClip();
  x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40);
  inner();
  x.restore();
  panelBorder();
  x.save(); x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); x.translate(0, 40); over(); x.restore();
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER CUE ONLY", "IN SANSKRIT"], RED, 375, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["THEY DON'T", "KNOW THE NAMES"], RED, 375, 0.0, 1, 135, flash(u, at("s2", "names")) * 0.6);
  if (id === "s3") words(["SO THEY FREEZE", "AND COPY"], RED, 375, 0.0, 1, 135, flash(u, at("s3", "freeze")) * 0.6);
  if (id === "s4") words(["ENGLISH +", "SANSKRIT"], GREEN, 375, 0.0, 1, 135, flash(u, at("s4", "sanskrit")) * 0.6);
  if (id === "s5") words(["HANDS DOWN.", "HIPS UP."], GREEN, 375, 0.0, 1, 135, flash(u, at("s5", "hips")) * 0.6);
  if (id === "s6") words(["SHOW IT ONCE"], GREEN, 380, 0.0, 1, 135, flash(u, at("s6", "once")) * 0.6);
  if (id === "s7") {
    words(["NAME IT."], ORANGE, 700, 0.0, 1, 150, flash(u, 0.05));
    words(["THEN SHOW IT."], ORANGE, 890, at("s7", "then") - 0.05, 1, 140, flash(u, at("s7", "show")));
  }
}
// s8 brand card: violet halftone page, comic letters, a figure in downward dog in the badge
function cta(u) {
  page(VIOLET, "#4b36d6");
  speed(CX, 560, 170, 1100, 36, 0.35 * sm(0, 0.3, u), 5);
  const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
  const k = back(0.0, 0.35, u);
  x.save(); x.translate(CX, 560); x.scale(k, k);
  shape(() => circ(0, 0, 150), WHITE, 12);
  mat(0, 60, 220, GREEN);
  person(-10, 60, DOG, 0.5, VIOLET);
  x.restore();
  words([c1], WHITE, 800, 0.15, 1, 130);
  words([c2], YELLOW, 950, 0.3, 1, 150);
  if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["pose-names-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
