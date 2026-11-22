// more-than-screenshots: Right Brothers reel 01 (Flat Vector 2D canvas). A still App Store screenshot vs the same
// screen as an animated ad. Demo app = YogaFlow (Ofir's own app; its real store screenshot in assets/store.png).
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
const T0 = (id) => S[id][0] + LEAD; // absolute time a line's voice starts

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", BG = "#080622";
// YogaFlow's own palette (from its store screenshots)
const CREAM = "#f3eee4", DKG = "#2c4a3b", SAGE = "#6f9a78", INH = "#3a8fd6", EXH = "#e8873a", CARD = "#ffffff";
const CX = 510;
const cv = document.getElementById("world");
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const SERIF = (px) => `700 ${px}px Georgia, "DejaVu Serif", serif`;

const img = new Image();
img.src = "assets/store.png";

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
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.88)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function room() {
  const gr = x.createRadialGradient(CX, 820, 80, CX, 820, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
}

// ---------- phone: frame + clipped screen; inner() draws in screen units (width 400) ----------
function phone(cx, top, w, color, inner, a = 1) {
  if (a <= 0) return;
  const h = w * 2.165, r = w * 0.13, bz = w * 0.035;
  x.save(); x.globalAlpha = a;
  glow(color, 50); x.fillStyle = "#101018"; rr(cx - w / 2, top, w, h, r); x.fill(); noGlow();
  x.lineWidth = 6; x.strokeStyle = color; x.stroke();
  x.save(); rr(cx - w / 2 + bz, top + bz, w - 2 * bz, h - 2 * bz, r - bz); x.clip();
  x.translate(cx - w / 2 + bz, top + bz); const k = (w - 2 * bz) / 400; x.scale(k, k);
  inner((h - 2 * bz) / k);
  x.restore();
  x.fillStyle = "#101018"; rr(cx - w * 0.16, top + bz + 8, w * 0.32, w * 0.06, w * 0.03); x.fill();
  x.restore();
}

// ---------- the "store screenshot" (real image), optional grey + offset ----------
function still(H, grey, dy) {
  x.fillStyle = CREAM; x.fillRect(0, 0, 400, H);
  if (img.complete && img.naturalWidth) {
    const ih = 400 * img.naturalHeight / img.naturalWidth;
    x.save(); if (grey > 0) x.filter = `grayscale(${grey}) brightness(${1 - 0.35 * grey})`;
    x.drawImage(img, 0, (H - ih) / 2 + dy, 400, ih); x.restore();
  }
}

// ---------- the animated ad, same screen, YogaFlow palette. tau = seconds into the ad ----------
const POSE = {
  mountain: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  warrior: { head: [0, -390], sh: [0, -315], hip: [0, -170], kL: [-120, -95], fL: [-150, 0], kR: [80, -90], fR: [170, 0], eL: [-90, -318], hL: [-175, -320], eR: [90, -318], hR: [175, -320] },
  tree: { head: [0, -420], sh: [0, -345], hip: [0, -200], kL: [0, -100], fL: [0, 0], kR: [85, -135], fR: [8, -122], eL: [-45, -420], hL: [-8, -505], eR: [45, -420], hR: [8, -505] },
};
function blend(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function stick(X, Y, p, s, c) {
  const P = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = c; x.fillStyle = c;
  const limb = (...js) => { x.beginPath(); js.forEach((j, i) => { const [px, py] = P(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  x.lineWidth = 30 * s; limb("hip", "kR", "fR"); limb("sh", "eR", "hR"); limb("hip", "kL", "fL"); limb("sh", "eL", "hL");
  x.lineWidth = 38 * s; limb("sh", "hip");
  const [hx, hy] = P("head"); x.beginPath(); x.arc(hx, hy, 38 * s, 0, Math.PI * 2); x.fill();
  x.restore();
}
function ad(H, tau) {
  x.fillStyle = CREAM; x.fillRect(0, 0, 400, H);
  // soft moving light behind
  const g = x.createRadialGradient(200 + 60 * Math.sin(tau * 1.3), 300, 10, 200, 300, 420);
  g.addColorStop(0, "#fffaf0"); g.addColorStop(1, CREAM); x.fillStyle = g; x.fillRect(0, 0, 400, H);
  x.textAlign = "center"; x.textBaseline = "middle";
  // hook: counter 0 -> 56 (the app's own number, from its store page) + "POSES"
  const n = Math.round(56 * sm(0.1, 1.2, tau));
  const hk = back(0, 0.35, tau);
  x.save(); x.translate(200, 110); x.scale(hk, hk);
  x.fillStyle = DKG; x.font = SERIF(84); x.fillText(`${n} poses`, 0, 0);
  x.fillStyle = SAGE; x.font = SERIF(34); x.globalAlpha = sm(0.9, 1.3, tau); x.fillText("fully explained", 0, 62);
  x.restore();
  // hero: one figure flowing mountain -> warrior -> tree -> mountain
  const ph = (tau * 0.62) % 3, seg = Math.floor(ph), k = sm(0.55, 1, ph - seg);
  const order = [POSE.mountain, POSE.warrior, POSE.tree, POSE.mountain];
  const p = blend(order[seg], order[seg + 1], k);
  const names = ["Mountain Pose", "Warrior II", "Tree Pose"];
  const cardA = sm(0.3, 0.7, tau);
  x.save(); x.globalAlpha = cardA; x.translate(0, (1 - cardA) * 40);
  x.shadowColor = "rgba(44,74,59,0.18)"; x.shadowBlur = 30; x.fillStyle = CARD; rr(30, 210, 340, 400, 34); x.fill(); x.shadowBlur = 0;
  // breathing ring
  const inh = Math.sin(tau * 2.4) > 0, br = 0.5 + 0.5 * Math.sin(tau * 2.4);
  x.strokeStyle = inh ? INH : EXH; x.globalAlpha = cardA * 0.35; x.lineWidth = 10;
  x.beginPath(); x.arc(200, 400, 120 + 26 * br, 0, Math.PI * 2); x.stroke(); x.globalAlpha = cardA;
  stick(200, 510, p, 0.55, DKG);
  const nm = names[(k > 0.5 ? seg + 1 : seg) % 3];
  x.fillStyle = "#1b1b1b"; x.font = "800 30px Inter, Arial, sans-serif"; x.fillText(nm, 200, 552);
  x.fillStyle = inh ? INH : EXH; x.font = "800 24px Inter, Arial, sans-serif"; x.fillText(inh ? "Inhale" : "Exhale", 200, 588);
  x.restore();
  // pose cards pop in below
  const cards = [["Child's Pose", POSE.mountain], ["Warrior II", POSE.warrior], ["Tree Pose", POSE.tree]];
  cards.forEach(([label, pp], i) => {
    const a = back(2.2 + i * 0.25, 2.55 + i * 0.25, tau), o = sm(2.2 + i * 0.25, 2.35 + i * 0.25, tau);
    if (o <= 0) return;
    const cx = 75 + i * 125;
    x.save(); x.globalAlpha = o; x.translate(cx, 700); x.scale(a, a);
    x.shadowColor = "rgba(44,74,59,0.18)"; x.shadowBlur = 20; x.fillStyle = CARD; rr(-55, -70, 110, 140, 20); x.fill(); x.shadowBlur = 0;
    stick(0, 25, pp, 0.17, DKG);
    x.restore();
  });
  // call to action button pulses
  const ba = sm(3.4, 3.7, tau), pul = 1 + 0.04 * Math.sin(tau * 8) * ba;
  if (ba > 0) {
    x.save(); x.globalAlpha = ba; x.translate(200, 830); x.scale(pul, pul);
    x.fillStyle = DKG; rr(-140, -36, 280, 72, 36); x.fill();
    x.fillStyle = CREAM; x.font = "800 30px Inter, Arial, sans-serif"; x.fillText("Try YogaFlow", 0, 2);
    x.restore();
  }
  // progress bar of the 6 s ad
  x.fillStyle = "rgba(44,74,59,0.15)"; x.fillRect(30, H - 30, 340, 8);
  x.fillStyle = DKG; x.fillRect(30, H - 30, 340 * cl(tau / 6), 8);
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  room();
  const adStart = T0("s3");
  const tau = t - adStart;

  if (id === "s1") {
    const a = sm(0.15, 0.6, u), w = 380;
    phone(CX, 560 + (1 - a) * 80, w, WHITE, (H) => still(H, 0, 0), a);
  }
  if (id === "s2") {
    const sc = sm(at("s2", "scroll") - 0.05, at("s2", "past") + 0.15, u), ret = sm(at("s2", "still") - 0.25, at("s2", "still") + 0.1, u);
    const dy = -1200 * sc * (1 - ret) ;
    const grey = sm(at("s2", "still") - 0.1, at("s2", "screen"), u);
    phone(CX, 560, 380, mix(WHITE, RED, grey), (H) => {
      // the feed: other grey posts around the screenshot
      x.fillStyle = "#1c1c24"; x.fillRect(0, 0, 400, H);
      for (let i = -2; i <= 2; i++) if (i) { x.fillStyle = "#2c2c38"; rr(10, i * (H + 20) + dy + 10, 380, H - 20, 20); x.fill(); }
      x.save(); x.translate(0, dy); still(H, grey, 0); x.restore();
    });
    // a thumb swiping up
    const sw = sm(at("s2", "scroll") - 0.2, at("s2", "scroll") + 0.3, u) * (1 - ret);
    if (sw > 0) {
      x.save(); x.globalAlpha = sw; glow(RED, 20); x.strokeStyle = RED; x.lineWidth = 12; x.lineCap = "round";
      const y0 = 1150 - 300 * sm(at("s2", "scroll"), at("s2", "past") + 0.2, u);
      x.beginPath(); x.moveTo(820, y0 + 160); x.lineTo(820, y0); x.moveTo(785, y0 + 40); x.lineTo(820, y0); x.lineTo(855, y0 + 40); x.stroke(); x.restore();
    }
    tag("SCROLLED PAST", 300, 1080, RED, sm(at("s2", "past") - 0.1, at("s2", "past") + 0.15, u) * (1 - ret), 46);
    tag("NOTHING MOVES", 330, 1080, RED, sm(at("s2", "screen") - 0.15, at("s2", "screen") + 0.1, u), 46);
  }
  if (["s3", "s4", "s5"].includes(id)) {
    const grow = sm(adStart - 0.1, adStart + 0.4, t);
    const w = lerp(380, 430, grow);
    const flip = sm(at("s3", "now") - 0.2, at("s3", "now") + 0.15, id === "s3" ? u : 9);
    phone(CX, lerp(560, 470, grow), w, mix(WHITE, GREEN, flip), (H) => {
      if (flip < 1) still(H, 1 - flip, 0);
      if (flip > 0) { x.save(); x.globalAlpha = flip; ad(H, Math.max(0, tau - at("s3", "now"))); x.restore(); }
    });
    if (id === "s3") tag("SAME SCREEN", 280, 1160, VIOLET, sm(0, 0.15, u) * (1 - flip), 46);
    if (id === "s4") {
      tag("HOOK", 190, 620, GREEN, sm(at("s4", "hook") - 0.1, at("s4", "hook") + 0.1, u), 46);
      tag("MOTION", 860, 830, GREEN, sm(at("s4", "motion") - 0.15, at("s4", "motion") + 0.1, u), 46);
      tag("BENEFIT", 200, 1060, GREEN, sm(at("s4", "benefit") - 0.15, at("s4", "benefit") + 0.1, u), 46);
      const six = sm(at("s4", "six") - 0.15, at("s4", "six") + 0.1, u);
      tag("6 SEC", 840, 1150, GREEN, six, 50);
    }
  }
  if (id === "s6") {
    phone(CX, 520, 300, VIOLET, (H) => ad(H, 1.8 + u), 0.35);
  }

  if (id === "s1") {
    words(["YOUR APP DESERVES"], WHITE, 330, 0.0, 1, 110);
    words(["MORE THAN", "SCREENSHOTS"], RED, 470, at("s1", "more") - 0.05, 1, 120, flash(u, at("s1", "screenshots")));
  }
  if (id === "s2") words(["A STILL SCREEN"], RED, 380, 0.0, 1, 130, flash(u, at("s2", "still")) * 0.6);
  if (id === "s3") words(["NOW IT MOVES"], GREEN, 340, at("s3", "now") - 0.1, 1, 140, flash(u, at("s3", "moves")) * 0.5);
  if (id === "s4") words(["6 SECOND AD"], GREEN, 340, 0.0, 1, 130);
  if (id === "s5") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.6)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["STOP THE SCROLL."], ORANGE, 640, 0.0, 1, 140, flash(u, 0.05));
    words(["SHOW THE APP."], ORANGE, 830, at("s5", "show") - 0.05, 1, 150, flash(u, at("s5", "app")));
  }
  if (id === "s6") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "ANIMATED ADS", c2 = "FOR YOUR APP"] = BRAND.cta || [];
    words([c1], WHITE, 520, 0.05, 1, 140);
    words([c2], VIOLET, 680, 0.2, 1, 140);
    const cm = sm(at("s6", "comment") - 0.15, at("s6", "comment") + 0.1, u);
    tag("COMMENT “APP”", CX, 900, GREEN, cm, 70);
    if (BRAND.sub) tag("FOR A FREE SAMPLE AD", CX, 1050, WHITE, sm(at("s6", "free") - 0.2, at("s6", "free"), u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["more-than-screenshots-2d"] = (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
