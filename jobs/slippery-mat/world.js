// slippery-mat (YogaFlow 31) - RISOGRAPH PRINT style: cream paper, flat ink shapes, a misregistered second ink under every
// shape, halftone dots. pink = wrong, teal = right, yellow = the rule. Canvas kit from soft-knees (YogaFlow 30). Time only from hf-seek.
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

const PINK = "#f0436e", TEAL = "#0f8f86", YEL = "#f5b40a", BLUE = "#3550c8", INK = "#1f2440", PAPER = "#f4ecdb", MAT = "#7f6fd6";
const CX = 510;
const cv = document.getElementById("world");
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
// riso misregistration: a hard-edged offset print of a second ink under the shape (no blur)
function mis(on = true, c = "rgba(240,67,110,0.45)") { if (on) { x.shadowColor = c; x.shadowBlur = 0; x.shadowOffsetX = 7; x.shadowOffsetY = 5; } else { x.shadowColor = "rgba(0,0,0,0)"; x.shadowOffsetX = 0; x.shadowOffsetY = 0; } }
const OFF_BLUE = "rgba(53,80,200,0.40)";
function paper() {
  x.fillStyle = PAPER; x.fillRect(0, 0, 1080, 1920);
  // halftone dots, denser toward the bottom (fixed grid, no shimmer)
  x.fillStyle = "rgba(53,80,200,0.10)";
  for (let Y = 30; Y < 1920; Y += 34) for (let X = (Y / 34) % 2 ? 17 : 0; X < 1080; X += 34) { const r = 2 + 4 * (Y / 1920); x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.fill(); }
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (840 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.05, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.32, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.12, curU);
      const s = (0.4 + 0.6 * k) * (1 + 0.06 * flashK);
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.globalAlpha = a * o;
      // second ink printed off-register behind the word, then the word with a paper outline
      x.fillStyle = color === PINK ? "rgba(53,80,200,0.55)" : "rgba(240,67,110,0.5)"; x.fillText(p, 7, 6);
      x.lineJoin = "round"; x.lineWidth = 14; x.strokeStyle = color === PAPER ? INK : PAPER; x.strokeText(p, 0, 0);
      x.fillStyle = color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 48, s = 0.6 + 0.4 * a;
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s); x.rotate(-0.02);
  mis(true, color === PINK ? OFF_BLUE : undefined); x.fillStyle = color; rr(-w / 2, -px * 0.75, w, px * 1.5, 10); x.fill(); mis(false);
  x.fillStyle = PAPER; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  mis(true, c === PINK ? OFF_BLUE : undefined); x.fillStyle = c; x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fill(); mis(false);
  x.strokeStyle = PAPER; x.lineWidth = 18; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); }
  else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke(); x.restore();
}
function arrow(x0, y0, x1, y1, c, k = 1, w = 16) {
  if (k <= 0) return;
  const ex = lerp(x0, x1, k), ey = lerp(y0, y1, k), an = Math.atan2(ey - y0, ex - x0);
  x.save(); mis(true, c === PINK ? OFF_BLUE : undefined); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = w; x.lineCap = "round";
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex - Math.cos(an) * 20, ey - Math.sin(an) * 20); x.stroke();
  x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex - Math.cos(an - 0.5) * 50, ey - Math.sin(an - 0.5) * 50); x.lineTo(ex - Math.cos(an + 0.5) * 50, ey - Math.sin(an + 0.5) * 50); x.closePath(); x.fill();
  mis(false); x.restore();
}
function drop(X, Y, r, a, c = "#3fa9e0") {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; mis(true, OFF_BLUE); x.fillStyle = c; x.beginPath();
  x.moveTo(X, Y - r * 1.8); x.quadraticCurveTo(X + r, Y - r * 0.4, X + r, Y); x.arc(X, Y, r, 0, Math.PI); x.quadraticCurveTo(X - r, Y - r * 0.4, X, Y - r * 1.8); x.fill();
  mis(false); x.restore();
}

// ---------- side-profile figure (faces screen-right), feet at the origin ----------
const STAND = { head: [0, -410], sh: [0, -335], hip: [0, -195], kn: [0, -98], ft: [0, 0], el: [30, -270], hd: [78, -262] };
// down dog: hands far forward on the mat, hips high, head between the arms
const DOG = { head: [238, -78], sh: [218, -128], hip: [118, -238], kn: [52, -112], ft: [0, 0], el: [262, -64], hd: [300, 0] };
// hands slid forward: arms longer reach, shoulders sink, hips drop
const SLID = { head: [270, -62], sh: [248, -104], hip: [132, -206], kn: [58, -100], ft: [0, 0], el: [312, -50], hd: [376, 0] };
// plank: one straight line, hands under the shoulders
const PLANK = { head: [338, -168], sh: [296, -136], hip: [150, -84], kn: [70, -44], ft: [0, 0], el: [298, -68], hd: [300, 0] };
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
let FX = 230, SC = 1.7; const FY = 1180;
const P = (p, j) => [FX + p[j][0] * SC, FY + p[j][1] * SC];
function figure(p, c = BLUE, armC = null, a = 1, shake = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const sh = (j) => { const [X, Y] = P(p, j); return (j === "sh" || j === "head") ? [X + shake, Y] : [X, Y]; };
  const seg = (col, w, ...js) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [A, B] = sh(j); i ? x.lineTo(A, B) : x.moveTo(A, B); }); x.stroke(); };
  mis(true);
  const [fx, fy] = P(p, "ft");
  x.strokeStyle = c; x.lineWidth = 32; x.beginPath(); x.moveTo(fx - 14, fy - 6); x.lineTo(fx + 50, fy - 6); x.stroke(); // foot
  seg(c, 40, "hip", "kn", "ft");
  seg(c, 52, "sh", "hip");
  seg(armC || c, 30, "sh", "el", "hd");
  const [hx, hy] = sh("head"); x.fillStyle = c; x.beginPath(); x.arc(hx, hy, 56, 0, Math.PI * 2); x.fill();
  mis(false);
  x.restore();
}
function floor() { x.save(); mis(true, OFF_BLUE); x.fillStyle = "#d9c9a6"; rr(90, FY + 10, 860, 26, 6); x.fill(); mis(false); x.restore(); }
const MAT0 = 150, MAT1 = 800;
function mat() { x.save(); mis(true); x.fillStyle = MAT; rr(MAT0, FY - 4, MAT1 - MAT0, 18, 6); x.fill(); mis(false); x.restore(); }
// towel lying flat on the front (hand) end of the mat, side view
function towelFlat(X0, X1, Y, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; mis(true, OFF_BLUE); x.fillStyle = TEAL; rr(X0, Y - 22, X1 - X0, 24, 8); x.fill(); mis(false);
  x.fillStyle = PAPER; for (let X = X0 + 28; X < X1 - 10; X += 46) x.fillRect(X, Y - 20, 12, 20); x.restore();
}
// folded towel stack (front view of the folds)
function towelStack(X, Y, a = 1, s = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); mis(true, OFF_BLUE);
  for (let i = 0; i < 3; i++) { x.fillStyle = i % 2 ? "#13a89c" : TEAL; rr(-70, -26 - i * 26, 140, 28, 10); x.fill(); }
  mis(false); x.fillStyle = PAPER; x.fillRect(-70, -48, 140, 6); x.restore();
}
function ring(X, Y, r, c, a) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 12; x.setLineDash([22, 14]); x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke(); x.restore(); }
function heat(a, u) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = 0.8 * a; x.strokeStyle = PINK; x.lineWidth = 10; x.lineCap = "round";
  for (let i = 0; i < 3; i++) { const X0 = 700 + i * 70; x.beginPath(); for (let k = 0; k <= 20; k++) { const Y = 760 - k * 9; const X = X0 + 14 * Math.sin(k * 0.7 + u * 6 + i); k ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
  x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  FX = 230; SC = 1.7;
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  paper();
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    floor(); mat();
    figure(DOG, BLUE);
    heat(sm(0.0, at("s1", "room"), u), u);
    tag("WARM ROOM", 300, 640, PINK, sm(0.0, at("s1", "room") + 0.1, u), 42);
    const Sw = sm(at("s1", "sweaty") - 0.1, at("s1", "hands") + 0.1, u);
    const [hx, hy] = P(DOG, "hd");
    for (let i = 0; i < 3; i++) drop(hx - 40 + i * 40, hy - 90 - ((u * 120 + i * 30) % 60), 13, Sw);
    const L = sm(at("s1", "slippery") - 0.1, at("s1", "mat") + 0.1, u);
    ring(hx, hy - 10, 80, PINK, L);
  }
  if (id === "s2") {
    floor(); mat();
    const Sl = sm(at("s2", "slide") - 0.15, at("s2", "forward") + 0.3, u);
    const p = pose(DOG, SLID, Sl);
    figure(p, BLUE, Sl > 0.3 ? PINK : null);
    const [hx, hy] = P(p, "hd");
    arrow(hx - 120, hy - 40, hx + 60, hy - 40, PINK, sm(at("s2", "slide") - 0.1, at("s2", "forward") + 0.1, u));
    tag("DOWN DOG", 300, 640, BLUE, sm(0.0, at("s2", "dog") + 0.1, u) * (1 - Sl), 44);
    tag("HANDS SLIDING", 330, 640, PINK, Sl, 44);
    for (let i = 0; i < 2; i++) drop(hx - 20 + i * 44, hy - 70, 11, 1 - Sl * 0.3);
  }
  if (id === "s3") {
    floor(); mat();
    const Tn = sm(at("s3", "shoulders") - 0.15, at("s3", "tense") + 0.1, u);
    figure(SLID, BLUE, PINK, 1, Tn * 6 * Math.sin(u * 40));
    const [hx, hy] = P(SLID, "hd"), [sx, sy] = P(SLID, "sh");
    const G = sm(at("s3", "grip") - 0.1, at("s3", "harder") + 0.1, u);
    // grip lines: short strokes squeezing in toward the hand
    if (G > 0) { x.save(); x.globalAlpha = G; x.strokeStyle = PINK; x.lineWidth = 9; x.lineCap = "round";
      for (const [a, b] of [[-1, -1], [1, -1], [0, -1.3]]) { x.beginPath(); x.moveTo(hx + a * 70, hy - 40 + b * 50); x.lineTo(hx + a * 40, hy - 30 + b * 28); x.stroke(); } x.restore(); }
    tag("GRIP HARDER", 300, 640, PINK, sm(at("s3", "grip") - 0.1, at("s3", "harder"), u) * (1 - Tn), 44);
    const pulse = 1 + 0.12 * Math.sin(u * 12);
    if (Tn > 0) { x.save(); x.globalAlpha = 0.8 * Tn; x.fillStyle = PINK; x.beginPath(); x.arc(sx, sy, 46 * pulse, 0, Math.PI * 2); x.fill(); x.restore(); }
    tag("TENSE SHOULDERS", 360, 640, PINK, Tn, 44);
    mark("x", 820, 860, back(at("s3", "tense"), at("s3", "tense") + 0.3, u) * 0.45, Tn, PINK);
  }
  if (id === "s4") {
    floor(); mat();
    FX = 260; SC = 1.4;
    figure(STAND, BLUE);
    const Tw = sm(at("s4", "towel") - 0.15, at("s4", "towel") + 0.25, u);
    towelStack(870, FY + 8 - (1 - back(at("s4", "towel") - 0.15, at("s4", "towel") + 0.3, u)) * 220, Tw);
    tag("TOWEL BY EVERY MAT", 560, 640, TEAL, sm(at("s4", "next") - 0.1, at("s4", "every") + 0.1, u), 44);
    ring(870, FY - 30, 95, TEAL, sm(at("s4", "every") - 0.05, at("s4", "mat") + 0.1, u));
  }
  if (id === "s5") {
    floor(); mat();
    FX = 260; SC = 1.4;
    figure(STAND, BLUE, TEAL);
    const [hx, hy] = P(STAND, "hd");
    const Wp = sm(0.0, at("s5", "hands"), u);
    // towel wiped over the hands
    x.save(); x.globalAlpha = Wp; x.translate(hx + 18 * Math.sin(u * 14), hy + 6); x.rotate(0.15); mis(true, OFF_BLUE); x.fillStyle = TEAL; rr(-60, -34, 120, 68, 12); x.fill(); mis(false);
    x.fillStyle = PAPER; x.fillRect(-60, -6, 120, 8); x.restore();
    tag("DRY HANDS FIRST", 560, 600, TEAL, sm(0.0, at("s5", "hands") + 0.1, u), 44);
    tag("DOWN DOG", 470, 760, BLUE, sm(at("s5", "down") - 0.1, at("s5", "dog") + 0.05, u), 40);
    tag("PLANK", 760, 760, BLUE, sm(at("s5", "plank") - 0.1, at("s5", "plank") + 0.1, u), 40);
    mark("v", 820, 900, back(at("s5", "plank"), at("s5", "plank") + 0.3, u) * 0.45, u > at("s5", "plank") ? 1 : 0, TEAL);
  }
  if (id === "s6") {
    floor(); mat();
    const [hx0] = P(DOG, "hd");
    const Ly = back(at("s6", "lay") - 0.05, at("s6", "towel") + 0.25, u);
    const La = sm(at("s6", "lay") - 0.05, at("s6", "lay") + 0.1, u);
    x.save(); x.translate(0, -(1 - Ly) * 260); towelFlat(hx0 - 130, MAT1 - 10, FY - 2, La); x.restore();
    const Fa = sm(at("s6", "top") - 0.25, at("s6", "top") + 0.05, u);
    x.save(); x.translate(0, -22); figure(DOG, BLUE, TEAL, Fa); x.restore();
    tag("TOWEL ON TOP OF THE MAT", 520, 620, TEAL, sm(at("s6", "towel") - 0.05, at("s6", "top") + 0.1, u), 40);
    ring(hx0, FY - 50, 90, TEAL, sm(at("s6", "mat") - 0.15, at("s6", "mat") + 0.1, u));
  }
  if (id === "s7") { floor(); mat(); }
  x.restore();

  if (id === "s1") words(["NEVER IGNORE A", "SLIPPERY MAT"], PINK, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "slippery"))));
  if (id === "s2") words(["THE HANDS", "SLIDE FORWARD"], PINK, 340, 0.0, 1, 140, flash(u, at("s2", "slide")) * 0.6);
  if (id === "s3") words(["GRIP HARDER,", "SHOULDERS TENSE"], PINK, 340, 0.0, 1, 140, flash(u, at("s3", "tense")) * 0.6);
  if (id === "s4") words(["A TOWEL BY", "EVERY MAT"], TEAL, 340, 0.0, 1, 150, flash(u, at("s4", "towel")) * 0.6);
  if (id === "s5") words(["DRY THE HANDS", "FIRST"], TEAL, 340, 0.0, 1, 150, flash(u, at("s5", "dry")) * 0.6);
  if (id === "s6") words(["OR LAY IT ON", "THE MAT"], TEAL, 340, 0.0, 1, 150, flash(u, at("s6", "top")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(31,36,64,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["DRY HANDS."], YEL, 700, 0.0, 1, 160, flash(u, 0.05));
    words(["STEADY POSE."], YEL, 890, at("s7", "steady") - 0.05, 1, 160, flash(u, at("s7", "pose")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(31,36,64,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k); mis(true);
    x.fillStyle = MAT; rr(-120, -120, 240, 240, 54); x.fill(); mis(false);
    x.fillStyle = PAPER; x.beginPath(); x.arc(0, -42, 26, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.moveTo(-70, 70); x.lineTo(0, -8); x.lineTo(70, 70); x.closePath(); x.fill();
    x.restore();
    words([c1], PAPER, 800, 0.15, 1, 130);
    words([c2], "#b6a8ff", 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, TEAL, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["slippery-mat-riso"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
