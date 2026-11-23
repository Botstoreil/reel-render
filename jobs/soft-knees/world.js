// soft-knees (YogaFlow 30) - KRAFT CUTOUT style (canvas kit from latecomer, YogaFlow 29). Time only from hf-seek.
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

const RED = "#d8402f", GREEN = "#2f9e5a", AMBER = "#e07a1f", INK = "#3b2a1a", KRAFT = "#e8d6b4", CARD = "#f6ecd8", VIOLET = "#6a55d8";
const CX = 510;
const cv = document.getElementById("world");
// KRAFT CUTOUT style: brown kraft paper, every shape a flat paper cutout (solid fill, dark-brown ink edge, a soft drop
// shadow as if it lies on the paper), red = wrong, green = right, amber = the rule.
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function shadow(on = true) { if (on) { x.shadowColor = "rgba(60,35,10,0.35)"; x.shadowBlur = 6; x.shadowOffsetX = 6; x.shadowOffsetY = 7; } else { x.shadowColor = "rgba(0,0,0,0)"; x.shadowBlur = 0; x.shadowOffsetX = 0; x.shadowOffsetY = 0; } }
function paper() {
  x.fillStyle = KRAFT; x.fillRect(0, 0, 1080, 1920);
  // fibre speckle, fixed seed so it does not shimmer
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  x.fillStyle = "rgba(90,60,25,0.10)";
  for (let i = 0; i < 900; i++) x.fillRect(rnd() * 1080, rnd() * 1920, 2 + rnd() * 5, 1.5);
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
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.rotate((wi % 2 ? 1 : -1) * 0.015); x.globalAlpha = a * o;
      shadow(); x.lineJoin = "round"; x.lineWidth = 16; x.strokeStyle = (color === CARD || color === "#b6a8ff") ? INK : CARD; x.strokeText(p, 0, 0); // round 2: same-colour outline glued the letters shadow(false);
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
  shadow(); x.fillStyle = color; rr(-w / 2, -px * 0.75, w, px * 1.5, 10); x.fill(); shadow(false);
  x.fillStyle = CARD; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  shadow(); x.fillStyle = c; x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fill(); shadow(false);
  x.strokeStyle = CARD; x.lineWidth = 18; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); }
  else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke(); x.restore();
}
function arrow(x0, y0, x1, y1, c, k = 1, w = 16) {
  if (k <= 0) return;
  const ex = lerp(x0, x1, k), ey = lerp(y0, y1, k), an = Math.atan2(ey - y0, ex - x0);
  x.save(); shadow(); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = w; x.lineCap = "round";
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(ex - Math.cos(an) * 20, ey - Math.sin(an) * 20); x.stroke();
  x.beginPath(); x.moveTo(ex, ey); x.lineTo(ex - Math.cos(an - 0.5) * 50, ey - Math.sin(an - 0.5) * 50); x.lineTo(ex - Math.cos(an + 0.5) * 50, ey - Math.sin(an + 0.5) * 50); x.closePath(); x.fill();
  shadow(false); x.restore();
}

// ---------- side-profile figure (faces screen-right) ----------
const STAND = { head: [0, -410], sh: [0, -335], hip: [0, -195], kn: [0, -98], ft: [0, 0], el: [6, -262], hd: [10, -190] };
// forward fold, knees LOCKED: knee pushed back behind the ankle-hip line, torso hanging
const LOCKED = { head: [70, -60], sh: [62, -120], hip: [8, -205], kn: [-22, -100], ft: [0, 0], el: [72, -62], hd: [74, -6] };
// forward fold, SOFT knees: knees bent forward, hips back, chest toward the thighs
const SOFT = { head: [78, -78], sh: [70, -140], hip: [-24, -190], kn: [26, -100], ft: [0, 0], el: [74, -70], hd: [70, -6] };
// deeper: chest down over the legs
const DEEP = { head: [58, -56], sh: [58, -122], hip: [-24, -188], kn: [26, -100], ft: [0, 0], el: [66, -58], hd: [64, -4] };
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
// round 2: the fold read too small at 1.45; scale 2.0 (s1 grows from 1.25 while standing so the head stays under the title)
const FX = 470, FY = 1180; let SC = 2.0;
const P = (p, j) => [FX + p[j][0] * SC, FY + p[j][1] * SC];
function figure(p, c = VIOLET, legC = null) {
  x.save(); x.lineCap = "round"; x.lineJoin = "round";
  const seg = (col, w, ...js) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [a, b] = P(p, j); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.stroke(); };
  shadow();
  const [fx, fy] = P(p, "ft");
  x.strokeStyle = legC || c; x.lineWidth = 34; x.beginPath(); x.moveTo(fx - 18, fy - 6); x.lineTo(fx + 62, fy - 6); x.stroke(); // foot
  seg(legC || c, 40, "hip", "kn", "ft");
  seg(c, 52, "sh", "hip");
  seg(c, 30, "sh", "el", "hd");
  const [hx, hy] = P(p, "head"); x.fillStyle = c; x.beginPath(); x.arc(hx, hy, 58, 0, Math.PI * 2); x.fill();
  shadow(false);
  x.restore();
}
function floor() { x.save(); shadow(); x.fillStyle = "#c9a876"; rr(110, FY + 10, 820, 26, 6); x.fill(); shadow(false); x.restore(); }
function mat(c = "#7d6bd8") { x.save(); shadow(); x.fillStyle = c; rr(250, FY - 4, 480, 18, 6); x.fill(); shadow(false); x.restore(); }
function ring(X, Y, r, c, a) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 12; x.setLineDash([22, 14]); x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke(); x.restore(); }

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  SC = 2.0;
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  paper();
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    floor(); mat();
    const F = sm(0.1, at("s1", "fold") + 0.2, u);
    const L = sm(at("s1", "lock") - 0.15, at("s1", "lock") + 0.15, u);
    SC = lerp(1.25, 2.0, F);
    figure(pose(STAND, LOCKED, F), VIOLET, L > 0.5 ? RED : null);
    tag("FORWARD FOLD", 700, 560, VIOLET, sm(at("s1", "forward") - 0.1, at("s1", "fold") + 0.1, u) * (1 - L), 42);
    const [kx, ky] = P(LOCKED, "kn");
    ring(kx, ky, 70, RED, L);
  }
  if (id === "s2") {
    floor(); mat();
    const Pu = sm(at("s2", "push") - 0.1, at("s2", "straight") + 0.1, u);
    const lk = pose(SOFT, LOCKED, 0.6 + 0.4 * Pu);
    figure(lk, VIOLET, RED);
    const [kx, ky] = P(lk, "kn");
    arrow(kx + 150, ky, kx + 30, ky, RED, sm(at("s2", "lock") - 0.1, at("s2", "knees") + 0.1, u));
    tag("LOCKED KNEES", 300, 640, RED, sm(at("s2", "lock") - 0.05, at("s2", "back") + 0.1, u), 44);
  }
  if (id === "s3") {
    floor(); mat();
    figure(LOCKED, VIOLET, RED);
    const [kx, ky] = P(LOCKED, "kn"), [hx, hy] = P(LOCKED, "hip");
    const Pl = sm(at("s3", "pull") - 0.1, at("s3", "lands") + 0.1, u);
    const pulse = 1 + 0.12 * Math.sin(u * 12);
    x.save(); x.globalAlpha = 0.85 * Pl; x.fillStyle = RED; x.beginPath(); x.arc(kx - 10, ky, 44 * pulse, 0, Math.PI * 2); x.fill(); x.restore();
    tag("BACK OF THE KNEE", 300, 640, RED, sm(at("s3", "back") - 0.1, at("s3", "knee") + 0.1, u), 42);
    const Hm = sm(at("s3", "hamstrings") - 0.3, at("s3", "hamstrings"), u);
    // hamstring band along the back of the thigh, greyed out with an X: the stretch is not there
    if (Hm > 0) { x.save(); x.globalAlpha = 0.6 * Hm; x.strokeStyle = CARD; x.lineWidth = 12; x.setLineDash([16, 12]); x.beginPath(); x.moveTo(hx - 28, hy + 30); x.lineTo(kx - 26, ky - 30); x.stroke(); x.restore(); }
    tag("HAMSTRINGS", 230, 880, INK, Hm, 40);
    mark("x", 230, 990, back(at("s3", "hamstrings"), at("s3", "hamstrings") + 0.3, u) * 0.4, Hm, RED);
  }
  if (id === "s4") {
    floor(); mat();
    const B = sm(at("s4", "small") - 0.1, at("s4", "bend") + 0.2, u);
    const p = pose(LOCKED, SOFT, B);
    figure(p, VIOLET, B > 0.5 ? GREEN : RED);
    const [kx, ky] = P(p, "kn");
    ring(kx, ky, 70, GREEN, B);
    tag("SMALL BEND", 300, 640, GREEN, sm(at("s4", "bend") - 0.1, at("s4", "bend") + 0.15, u), 46);
  }
  if (id === "s5") {
    floor(); mat();
    figure(SOFT, VIOLET, GREEN);
    const [hx, hy] = P(SOFT, "hip"), [fx, fy] = P(SOFT, "ft");
    const Wt = sm(at("s5", "weight") - 0.1, at("s5", "over") + 0.1, u);
    arrow(fx + 22, hy - 90, fx + 22, fy - 40, GREEN, Wt, 14);
    const Md = sm(at("s5", "middle") - 0.1, at("s5", "feet") + 0.1, u);
    x.save(); x.globalAlpha = Md; shadow(); x.fillStyle = GREEN; x.beginPath(); x.ellipse(fx + 22, fy + 2, 46, 14, 0, 0, Math.PI * 2); x.fill(); shadow(false); x.restore();
    tag("MIDDLE OF THE FEET", 520, 620, GREEN, Md, 42);
    void hx;
  }
  if (id === "s6") {
    floor(); mat();
    const Dp = sm(at("s6", "chest") - 0.1, at("s6", "legs") + 0.1, u);
    figure(pose(SOFT, DEEP, Dp), Dp > 0.5 ? GREEN : VIOLET, GREEN);
    tag("CHEST OVER LEGS", 520, 620, GREEN, sm(at("s6", "chest") - 0.05, at("s6", "down") + 0.1, u), 44);
    mark("v", 790, 820, back(at("s6", "legs") - 0.1, at("s6", "legs") + 0.25, u) * 0.5, u > at("s6", "legs") - 0.1 ? 1 : 0, GREEN);
  }
  if (id === "s7") { floor(); }
  x.restore();

  if (id === "s1") words(["NEVER LET", "THE KNEES LOCK"], RED, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["LEGS PUSHED", "STRAIGHT BACK"], RED, 340, 0.0, 1, 140, flash(u, at("s2", "lock")) * 0.6);
  if (id === "s3") words(["THE PULL LANDS", "IN THE KNEE"], RED, 340, 0.0, 1, 140, flash(u, at("s3", "knee")) * 0.6);
  if (id === "s4") words(["CUE A", "SMALL BEND"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "bend")) * 0.6);
  if (id === "s5") words(["WEIGHT OVER", "MID-FOOT"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "middle")) * 0.6);
  if (id === "s6") words(["CHEST FOLDS", "OVER THE LEGS"], GREEN, 340, 0.0, 1, 140, flash(u, at("s6", "legs")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(59,42,26,0.45)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SOFT KNEES."], AMBER, 700, 0.0, 1, 160, flash(u, 0.05));
    words(["THEN FOLD."], AMBER, 890, at("s7", "then") - 0.05, 1, 160, flash(u, at("s7", "fold")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(59,42,26,0.6)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k); shadow();
    x.fillStyle = VIOLET; rr(-120, -120, 240, 240, 54); x.fill(); shadow(false);
    x.fillStyle = CARD; x.beginPath(); x.arc(0, -42, 26, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.moveTo(-70, 70); x.lineTo(0, -8); x.lineTo(70, 70); x.closePath(); x.fill();
    x.restore();
    words([c1], CARD, 800, 0.15, 1, 130);
    words([c2], "#b6a8ff", 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["soft-knees-kraft"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
