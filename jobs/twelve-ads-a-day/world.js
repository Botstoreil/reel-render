// twelve-ads-a-day: Right Brothers reel 02 (Flat Vector 2D canvas). One app -> a grid of 12 ad variants
// (different hooks, colours, styles) that fills one by one, then the winners are kept. Demo app = YogaFlow (Ofir's own).
// Hooks on the tiles come from YogaFlow's real store screenshots. Time only from hf-seek.
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
const T0 = (id) => S[id][0] + LEAD;

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", BG = "#080622";
const CREAM = "#f3eee4", DKG = "#2c4a3b";
const CX = 510;
const cv = document.getElementById("world");
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;

function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function glow(c, b) { x.shadowColor = c; x.shadowBlur = b; }
function noGlow() { x.shadowBlur = 0; }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
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
      const s = 0.4 + 0.6 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.globalAlpha = a * o;
      glow(color, 30 + 40 * flashK); x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
      x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * cl(a);
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.9)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function room() {
  const gr = x.createRadialGradient(CX, 820, 80, CX, 820, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
}

// ---------- yoga figure ----------
const POSE = {
  mountain: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  warrior: { head: [0, -390], sh: [0, -315], hip: [0, -170], kL: [-120, -95], fL: [-150, 0], kR: [80, -90], fR: [170, 0], eL: [-90, -318], hL: [-175, -320], eR: [90, -318], hR: [175, -320] },
  tree: { head: [0, -420], sh: [0, -345], hip: [0, -200], kL: [0, -100], fL: [0, 0], kR: [85, -135], fR: [8, -122], eL: [-45, -420], hL: [-8, -505], eR: [45, -420], hR: [8, -505] },
};
const PL = [POSE.mountain, POSE.warrior, POSE.tree];
function blend(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function stick(X, Y, p, s, c, g = 0) {
  const P = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = c; x.fillStyle = c; if (g) glow(c, g);
  const limb = (...js) => { x.beginPath(); js.forEach((j, i) => { const [px, py] = P(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  x.lineWidth = 30 * s; limb("hip", "kR", "fR"); limb("sh", "eR", "hR"); limb("hip", "kL", "fL"); limb("sh", "eL", "hL");
  x.lineWidth = 38 * s; limb("sh", "hip");
  const [hx, hy] = P("head"); x.beginPath(); x.arc(hx, hy, 38 * s, 0, Math.PI * 2); x.fill();
  x.restore();
}

// ---------- 12 ad variants: [hook line 1, line 2, bg, fg, style] (hooks from YogaFlow's store screenshots) ----------
const V = [
  ["56", "POSES", CREAM, DKG, "flat"],
  ["DAILY", "HABIT", "#1b1440", VIOLET, "neon"],
  ["SAFE", "PRACTICE", "#ff7a3a", WHITE, "bold"],
  ["FLOW FOR", "YOUR MOOD", "#2f5d45", "#e9f5e1", "chalk"],
  ["FOR", "TEACHERS", "#f6d34a", "#1b1b1b", "bold"],
  ["BREATHE", "IN", "#0f2a3d", "#5fd1ff", "neon"],
  ["TREE", "POSE", "#fbe3ec", "#b0305a", "flat"],
  ["FIND YOUR", "FLOW", "#2a2a2a", "#ffffff", "outline"],
  ["POSE", "LIBRARY", "#e7f0ff", "#2950c8", "flat"],
  ["WARRIOR", "II", "#3b1d5e", "#ffb3f0", "neon"],
  ["NEW TO", "YOGA?", "#dff5e8", "#1f7a4a", "outline"],
  ["START", "TODAY", "#ff4d6d", WHITE, "bold"],
];
const TW = 172, TH = 290;
const cellX = (i) => 225 + (i % 4) * 190, cellY = (i) => 625 + Math.floor(i / 4) * 310;
function tile(i, cx, cy, s, a, t, o = {}) {
  if (a <= 0 || s <= 0) return;
  const [h1, h2, bg, fg, st] = V[i];
  x.save(); x.globalAlpha = cl(a); x.translate(cx, cy); x.scale(s, s);
  if (o.ring) { glow(o.ring, 40); x.strokeStyle = o.ring; x.lineWidth = 10; rr(-TW / 2 - 10, -TH / 2 - 10, TW + 20, TH + 20, 30); x.stroke(); noGlow(); }
  x.save(); rr(-TW / 2, -TH / 2, TW, TH, 22); x.clip();
  x.fillStyle = bg; x.fillRect(-TW / 2, -TH / 2, TW, TH);
  if (st === "chalk") { x.globalAlpha *= 0.25; x.strokeStyle = fg; x.lineWidth = 2; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(-TW / 2, -100 + k * 40); x.lineTo(TW / 2, -90 + k * 40); x.stroke(); } x.globalAlpha /= 0.25; }
  if (st === "bold") { x.fillStyle = "rgba(255,255,255,0.18)"; x.beginPath(); x.arc(40, 30, 90, 0, Math.PI * 2); x.fill(); }
  // the pose, gently flowing
  const ph = (t * 0.5 + i * 0.37) % 3, seg = Math.floor(ph), k = sm(0.6, 1, ph - seg);
  const p = blend(PL[(i + seg) % 3], PL[(i + seg + 1) % 3], k);
  if (st === "outline") { x.save(); stick(0, 110, p, 0.3, fg); stick(0, 110, p, 0.3, bg); x.restore(); x.save(); x.globalAlpha *= 1; stick(0, 110, p, 0.22, fg); x.restore(); }
  else stick(0, 110, p, 0.3, fg, st === "neon" ? 18 : 0);
  // the hook
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = fg; if (st === "neon") glow(fg, 16);
  const fit = (s1, max) => { x.font = FONT(100); return Math.min(max, (TW - 26) / x.measureText(s1).width * 100); };
  x.font = FONT(fit(h1, 40)); x.fillText(h1, 0, -100);
  x.font = FONT(fit(h2, 40)); x.fillText(h2, 0, -60);
  noGlow();
  if (o.dim) { x.fillStyle = `rgba(8,6,34,${0.72 * o.dim})`; x.fillRect(-TW / 2, -TH / 2, TW, TH); }
  x.restore();
  x.restore();
}
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; glow(c, 30); x.strokeStyle = c; x.fillStyle = "rgba(8,6,34,0.9)"; x.lineWidth = 14;
  x.beginPath(); x.arc(0, 0, 44, 0, Math.PI * 2); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-22, 2); x.lineTo(-6, 18); x.lineTo(24, -16); x.stroke(); x.restore();
}
function appIcon(X, Y, s, a, t) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(WHITE, 40); x.fillStyle = CREAM; rr(-130, -130, 260, 260, 60); x.fill(); noGlow();
  stick(0, 95, blend(POSE.mountain, POSE.tree, 0.5 + 0.5 * Math.sin(t * 2)), 0.36, DKG);
  x.restore();
}
const WIN = [2, 5, 10];

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  room();

  if (id === "s1") {
    // one app icon, then 12 copies burst out of it
    const burst = sm(at("s1", "twelve") - 0.05, at("s1", "ads") + 0.2, u);
    appIcon(CX, 900, back(0, 0.35, u) * (1 - 0.35 * burst), 1, t);
    for (let i = 0; i < 12; i++) {
      const an = -Math.PI / 2 + i * Math.PI / 6, r = 330 * burst;
      tile(i, CX + Math.cos(an) * r * 1.05, 900 + Math.sin(an) * r * 1.2, 0.42 * burst, burst, t);
    }
    // one day: a sun arc
    const dy = sm(at("s1", "day") - 0.15, at("s1", "day") + 0.2, u);
    if (dy > 0) { x.save(); x.globalAlpha = dy; glow(ORANGE, 30); x.strokeStyle = ORANGE; x.lineWidth = 10; x.beginPath(); x.arc(CX, 1360, 520, Math.PI * 1.15, Math.PI * (1.15 + 0.7 * dy)); x.stroke(); x.restore(); }
  }
  if (id === "s2") {
    // one ad, one performance line that climbs, then drops
    const fail = sm(at("s2", "stops") - 0.1, at("s2", "working") + 0.1, u);
    const over = sm(at("s2", "start") - 0.15, at("s2", "over") + 0.1, u);
    tile(0, CX, 760, 1.25, 1 - 0.6 * over, t, { dim: fail * 0.8 });
    // chart
    const cx0 = 200, cy0 = 1290, cw = 620, prog = cl(u / (at("s2", "working") + 0.3));
    x.save(); x.strokeStyle = "rgba(255,255,255,0.25)"; x.lineWidth = 4; x.beginPath(); x.moveTo(cx0, cy0 - 230); x.lineTo(cx0, cy0); x.lineTo(cx0 + cw, cy0); x.stroke();
    glow(fail > 0.3 ? RED : GREEN, 20); x.strokeStyle = mix(GREEN, RED, fail); x.lineWidth = 10; x.lineCap = "round"; x.beginPath();
    const N = 40;
    for (let k = 0; k <= N * prog; k++) { const q = k / N; const v = q < 0.5 ? q * 1.6 : 0.8 - (q - 0.5) * 1.5; const px = cx0 + q * cw, py = cy0 - 220 * cl(v, 0.02, 1); k ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke(); x.restore();
    tag("1 AD = 1 GUESS", CX, 470, RED, sm(at("s2", "guess") - 0.2, at("s2", "guess") + 0.1, u), 50);
    tag("BACK TO ZERO", CX, 1100, RED, over, 48);
  }
  if (["s3", "s4", "s5"].includes(id)) {
    const t3 = t - T0("s3"), span = at("s3", "styles") + 0.3;
    const keep = id === "s3" ? 0 : sm(T0("s4") + at("s4", "keep") - 0.2, T0("s4") + at("s4", "winners") + 0.1, t);
    for (let i = 0; i < 12; i++) {
      const t0 = 0.05 + i * (span / 12);
      const s = back(t0, t0 + 0.3, t3), a = sm(t0, t0 + 0.1, t3);
      const win = WIN.includes(i);
      tile(i, cellX(i), cellY(i), 0.98 * s * (win ? 1 + 0.06 * keep : 1), a, t, { dim: win ? 0 : keep, ring: win && keep > 0.3 ? GREEN : null });
      if (id !== "s3" && !win) {
        // test meter under each tile
        const m = sm(T0("s4") - 0.05, T0("s4") + at("s4", "all") + 0.2, t);
        const val = [0.35, 0.5, 0, 0.3, 0.45, 0, 0.25, 0.4, 0.3, 0.5, 0, 0.2][i];
        x.save(); x.globalAlpha = 1 - keep * 0.7; x.fillStyle = "rgba(255,255,255,0.15)"; rr(cellX(i) - 80, cellY(i) + 152, 160, 12, 6); x.fill();
        x.fillStyle = VIOLET; rr(cellX(i) - 80, cellY(i) + 152, 160 * val * m + 1, 12, 6); x.fill(); x.restore();
      }
      if (id !== "s3" && win) {
        const m = sm(T0("s4") - 0.05, T0("s4") + at("s4", "all") + 0.2, t);
        x.save(); x.fillStyle = "rgba(255,255,255,0.15)"; rr(cellX(i) - 80, cellY(i) + 152, 160, 12, 6); x.fill();
        glow(GREEN, 16); x.fillStyle = GREEN; rr(cellX(i) - 80, cellY(i) + 152, 160 * 0.95 * m + 1, 12, 6); x.fill(); x.restore();
        check(cellX(i) + 62, cellY(i) - 120, back(0, 1, keep) * 0.9, keep);
      }
    }
    if (id === "s3") {
      tag("NEW HOOKS", 300, 1180, GREEN, sm(at("s3", "hooks") - 0.15, at("s3", "hooks") + 0.1, u) * (1 - sm(at("s3", "colors") - 0.1, at("s3", "colors"), u)), 52);
      tag("NEW COLORS", 520, 1180, GREEN, sm(at("s3", "colors") - 0.1, at("s3", "colors") + 0.1, u) * (1 - sm(at("s3", "styles") - 0.1, at("s3", "styles"), u)), 52);
      tag("NEW STYLES", 720, 1180, GREEN, sm(at("s3", "styles") - 0.1, at("s3", "styles") + 0.1, u), 52);
    }
  }

  if (id === "s1") {
    words(["ONE APP."], WHITE, 300, 0.0, 1, 130);
    words(["12 ADS. ONE DAY."], RED, 440, at("s1", "twelve") - 0.05, 1, 130, flash(u, at("s1", "twelve")));
  }
  if (id === "s2") words(["ONE AD ONLY"], RED, 330, 0.0, 1, 140, flash(u, at("s2", "stops")) * 0.6);
  if (id === "s3") words(["12 VARIANTS"], VIOLET, 330, 0.0, 1, 140, flash(u, at("s3", "variants")) * 0.5);
  if (id === "s4") words(["KEEP THE WINNERS"], GREEN, 330, 0.0, 1, 130, flash(u, at("s4", "winners")) * 0.5);
  if (id === "s5") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.78)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["MORE ADS."], ORANGE, 640, 0.0, 1, 160, flash(u, 0.05));
    words(["MORE CHANCES."], ORANGE, 830, at("s5", "more", 2) - 0.05, 1, 150, flash(u, at("s5", "win")));
  }
  if (id === "s6") {
    const [c1 = "ANIMATED ADS", c2 = "FOR YOUR APP"] = BRAND.cta || [];
    words([c1], WHITE, 560, 0.05, 1, 140);
    words([c2], VIOLET, 720, 0.2, 1, 140);
    tag("COMMENT “APP”", CX, 940, GREEN, sm(at("s6", "comment") - 0.15, at("s6", "comment") + 0.1, u), 70);
    if (BRAND.sub) tag("FOR A FREE SAMPLE AD", CX, 1090, WHITE, sm(at("s6", "free") - 0.2, at("s6", "free"), u), 54);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["twelve-ads-a-day-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
