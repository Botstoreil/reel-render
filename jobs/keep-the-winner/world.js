// keep-the-winner: Right Brothers reel 04 (Flat Vector 2D canvas, same look as reel 02).
// A winning ad (demo app = YogaFlow, Ofir's own) gets swapped for a new one that flops; then the winner
// comes back and only one thing changes per variant (hook, colour). Time only from hf-seek.
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

// ---------- yoga figure (the demo app's idea: a flowing pose) ----------
const POSE = {
  mountain: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  warrior: { head: [0, -390], sh: [0, -315], hip: [0, -170], kL: [-120, -95], fL: [-150, 0], kR: [80, -90], fR: [170, 0], eL: [-90, -318], hL: [-175, -320], eR: [90, -318], hR: [175, -320] },
  tree: { head: [0, -420], sh: [0, -345], hip: [0, -200], kL: [0, -100], fL: [0, 0], kR: [85, -135], fR: [8, -122], eL: [-45, -420], hL: [-8, -505], eR: [45, -420], hR: [8, -505] },
};
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

// ---------- ad tiles: {h1, h2, bg, fg, pose: "warrior" flow | "static" mountain} ----------
const WINNER = { h1: "SAFE", h2: "PRACTICE", bg: "#ff7a3a", fg: WHITE, flow: true };
const NEWAD = { h1: "POSE", h2: "LIBRARY", bg: "#e7f0ff", fg: "#2950c8", flow: false };
const VAR_HOOK = { h1: "NO MORE", h2: "BAD KNEES", bg: "#ff7a3a", fg: WHITE, flow: true };
const VAR_COLOR = { h1: "SAFE", h2: "PRACTICE", bg: "#3b1d5e", fg: "#ffb3f0", flow: true };
const TW = 172, TH = 290;
function tile(A, cx, cy, s, a, t, o = {}) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(cx, cy); x.rotate(o.rot || 0); x.scale(s, s);
  if (o.ring) { glow(o.ring, 40); x.strokeStyle = o.ring; x.lineWidth = 10; rr(-TW / 2 - 10, -TH / 2 - 10, TW + 20, TH + 20, 30); x.stroke(); noGlow(); }
  x.save(); rr(-TW / 2, -TH / 2, TW, TH, 22); x.clip();
  x.fillStyle = A.bg; x.fillRect(-TW / 2, -TH / 2, TW, TH);
  x.fillStyle = "rgba(255,255,255,0.16)"; x.beginPath(); x.arc(40, 30, 90, 0, Math.PI * 2); x.fill();
  let p;
  if (A.flow) { const ph = (t * 0.6) % 3, seg = Math.floor(ph), k = sm(0.55, 1, ph - seg); const L = [POSE.mountain, POSE.warrior, POSE.tree]; p = blend(L[seg % 3], L[(seg + 1) % 3], k); }
  else p = POSE.mountain;
  stick(0, 110, p, 0.3, A.fg);
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = A.fg;
  const fit = (s1, max) => { x.font = FONT(100); return Math.min(max, (TW - 26) / x.measureText(s1).width * 100); };
  x.font = FONT(fit(A.h1, 40)); x.fillText(A.h1, 0, -100);
  x.font = FONT(fit(A.h2, 40)); x.fillText(A.h2, 0, -60);
  if (o.dim) { x.fillStyle = `rgba(8,6,34,${0.72 * o.dim})`; x.fillRect(-TW / 2, -TH / 2, TW, TH); }
  x.restore();
  x.restore();
}
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; glow(c, 30); x.strokeStyle = c; x.fillStyle = "rgba(8,6,34,0.9)"; x.lineWidth = 14;
  x.beginPath(); x.arc(0, 0, 44, 0, Math.PI * 2); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-22, 2); x.lineTo(-6, 18); x.lineTo(24, -16); x.stroke(); x.restore();
}
function cross(X, Y, s, a, c = RED) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; glow(c, 30); x.strokeStyle = c; x.fillStyle = "rgba(8,6,34,0.9)"; x.lineWidth = 14;
  x.beginPath(); x.arc(0, 0, 44, 0, Math.PI * 2); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-18, -18); x.lineTo(18, 18); x.moveTo(18, -18); x.lineTo(-18, 18); x.stroke(); x.restore();
}
// results chart: shape(q) in 0..1, drawn up to prog
function chart(cx0, cy0, cw, ch, prog, shape, color) {
  x.save(); x.strokeStyle = "rgba(255,255,255,0.25)"; x.lineWidth = 4; x.beginPath(); x.moveTo(cx0, cy0 - ch); x.lineTo(cx0, cy0); x.lineTo(cx0 + cw, cy0); x.stroke();
  glow(color, 20); x.strokeStyle = color; x.lineWidth = 10; x.lineCap = "round"; x.beginPath();
  const N = 40;
  for (let k = 0; k <= N * cl(prog); k++) { const q = k / N; const px = cx0 + q * cw, py = cy0 - ch * cl(shape(q), 0.03, 1); k ? x.lineTo(px, py) : x.moveTo(px, py); }
  x.stroke(); x.restore();
}
const UP = (q) => 0.1 + 0.8 * q;
const FLOP = (q) => 0.15 + 0.25 * Math.sin(q * 3) * (1 - q);

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  room();

  if (id === "s1") {
    // the winner pops in, its results climb; at "kill" a red X threatens it
    tile(WINNER, CX, 780, 1.5 * back(0, 0.35, u), 1, t, { ring: sm(at("s1", "working") - 0.2, at("s1", "working"), u) > 0.5 ? GREEN : null });
    chart(250, 1180, 520, 150, sm(0.1, at("s1", "working") + 0.1, u), UP, GREEN);
    tag("WORKING", 800, 700, GREEN, sm(at("s1", "working") - 0.15, at("s1", "working") + 0.1, u), 46);
    cross(CX, 780, 1.8 * back(at("s1", "kill") - 0.1, at("s1", "kill") + 0.25, u), sm(at("s1", "kill") - 0.1, at("s1", "kill"), u));
    words(["YOUR AD WORKS."], WHITE, 300, 0.0, 1, 120);
    words(["NEVER KILL IT."], RED, 430, at("s1", "never") - 0.05, 1, 140, flash(u, at("s1", "never")));
  }
  if (id === "s2") {
    // bored: the winner slides out to the left, a new ad slides in from the right
    const sw = sm(at("s2", "swap") - 0.15, at("s2", "something") + 0.1, u);
    const yawn = sm(at("s2", "bored") - 0.2, at("s2", "bored") + 0.1, u);
    tile(WINNER, CX - 700 * sw, 780, 1.5, 1 - 0.3 * sw, t, { rot: -0.25 * sw, dim: 0.5 * sw });
    tile(NEWAD, CX + 700 * (1 - sw), 780, 1.5, sw, t, { rot: 0.25 * (1 - sw) });
    tag("BORED OF IT", CX, 1130, RED, yawn * (1 - sm(at("s2", "swap") - 0.1, at("s2", "swap"), u)), 52);
    tag("SWAPPED", CX, 1130, RED, sm(at("s2", "swap") - 0.05, at("s2", "swap") + 0.15, u), 52);
    words(["SWAP IT?"], RED, 330, 0.0, 1, 150, flash(u, at("s2", "swap")) * 0.6);
  }
  if (id === "s3") {
    // the new ad flops: its chart sinks red, the tile goes grey, question marks
    const fl = sm(at("s3", "flops") - 0.2, at("s3", "flops") + 0.1, u);
    const gs = sm(at("s3", "back") - 0.15, at("s3", "guessing") + 0.1, u);
    tile(NEWAD, CX, 740 + 15 * fl, 1.45 - 0.1 * fl, 1, t, { dim: 0.6 * fl });
    chart(250, 1190, 520, 110, sm(-0.2, at("s3", "flops") + 0.2, u), FLOP, RED);
    cross(CX + 150, 560, back(at("s3", "flops") - 0.1, at("s3", "flops") + 0.25, u), fl);
    tag("BACK TO GUESSING", CX, 1030, RED, gs, 48);
    words(["IT FLOPS."], RED, 330, 0.0, 1, 150, flash(u, at("s3", "flops")));
  }
  if (id === "s4") {
    // the winner comes back with a green ring; "change one thing" with a single violet dial
    const k = back(-0.3, 0.1, u);
    tile(WINNER, CX, 780, 1.2 + 0.3 * k, 1, t, { ring: GREEN });
    check(CX + 150, 590, back(at("s4", "winner") - 0.1, at("s4", "winner") + 0.25, u) * 0.9, sm(at("s4", "winner") - 0.1, at("s4", "winner"), u));
    tag("CHANGE 1 THING", CX, 1130, VIOLET, sm(at("s4", "change") - 0.15, at("s4", "change") + 0.1, u), 50);
    words(["KEEP THE WINNER"], GREEN, 330, -0.3, 1, 130, flash(u, at("s4", "winner")) * 0.5);
  }
  if (id === "s5") {
    // three tiles side by side: the winner, a new hook, a new colour. Same pose = same idea.
    const a1 = sm(at("s5", "hook") - 0.2, at("s5", "hook"), u), a2 = sm(at("s5", "color") - 0.2, at("s5", "color"), u);
    const same = sm(at("s5", "same") - 0.15, at("s5", "same") + 0.1, u);
    tile(WINNER, 245, 800, 1.2, 1, t, { ring: GREEN });
    tile(VAR_HOOK, 510, 800, 1.2 * back(at("s5", "hook") - 0.2, at("s5", "hook") + 0.15, u), a1, t, { ring: same > 0.5 ? GREEN : null });
    tile(VAR_COLOR, 775, 800, 1.2 * back(at("s5", "color") - 0.2, at("s5", "color") + 0.15, u), a2, t, { ring: same > 0.5 ? GREEN : null });
    tag("NEW HOOK", 510, 1060, VIOLET, a1 * (1 - same), 34);
    tag("NEW COLOR", 790, 1060, VIOLET, a2 * (1 - same), 34);
    tag("SAME IDEA", CX, 1110, GREEN, same, 56);
    words(["ONE CHANGE EACH"], VIOLET, 330, 0.0, 1, 130, flash(u, at("s5", "works")) * 0.4);
  }
  if (id === "s6") {
    const [c1 = "ANIMATED ADS", c2 = "FOR YOUR APP"] = BRAND.cta || [];
    words([c1], WHITE, 560, 0.05, 1, 140);
    words([c2], VIOLET, 720, 0.2, 1, 140);
    tag("COMMENT “APP”", CX, 940, GREEN, sm(at("s6", "comment") - 0.15, at("s6", "comment") + 0.1, u), 70);
    tag("FOR A FREE SAMPLE AD", CX, 1090, WHITE, sm(at("s6", "free") - 0.2, at("s6", "free"), u), 54);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["keep-the-winner-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
