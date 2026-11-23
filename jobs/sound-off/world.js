// sound-off: Right Brothers reel 06 (Flat Vector 2D canvas, same look as reels 02, 04, 05).
// An ad where a presenter talks the whole time; the viewer is muted, so nothing lands. Fix: big captions on every
// line, and the app on screen doing what the voice says. Demo app = YogaFlow (Ofir's own). Time only from hf-seek.
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
const flowPose = (t) => { const ph = (t * 0.7) % 3, seg = Math.floor(ph), k = sm(0.5, 1, ph - seg); const L = [POSE.mountain, POSE.warrior, POSE.tree]; return blend(L[seg % 3], L[(seg + 1) % 3], k); };

// ---------- the phone ----------
const PW = 420, PH = 680, PY = 860;
const SX = CX - PW / 2, SY = PY - PH / 2;
function phone(drawScreen, o = {}) {
  x.save();
  glow(o.ring || "#6b63c8", o.ring ? 40 : 18);
  x.fillStyle = "#14112e"; rr(SX - 16, SY - 16, PW + 32, PH + 32, 54); x.fill();
  x.lineWidth = 6; x.strokeStyle = o.ring || "#3a3480"; x.stroke(); noGlow();
  x.save(); rr(SX, SY, PW, PH, 40); x.clip();
  drawScreen();
  x.restore();
  x.restore();
}
// a presenter talking to camera (head + shoulders), mouth moves while `talk` > 0
function presenter(t, talk = 1) {
  x.save();
  x.fillStyle = "#2d2a52"; x.fillRect(SX, SY, PW, PH);
  x.fillStyle = "#4a3fa0"; rr(CX - 150, SY + 430, 300, 300, 120); x.fill();       // shoulders
  x.fillStyle = "#f0c9a8"; rr(CX - 34, SY + 370, 68, 80, 20); x.fill();          // neck
  x.beginPath(); x.ellipse(CX, SY + 290, 95, 115, 0, 0, Math.PI * 2); x.fill();  // head
  x.fillStyle = "#2b1d14"; x.beginPath(); x.ellipse(CX, SY + 210, 100, 55, 0, Math.PI, Math.PI * 2); x.fill(); // hair
  x.fillStyle = "#1b1b1b"; x.beginPath(); x.arc(CX - 35, SY + 280, 9, 0, Math.PI * 2); x.arc(CX + 35, SY + 280, 9, 0, Math.PI * 2); x.fill();
  const m = talk * (0.35 + 0.65 * Math.abs(Math.sin(t * 17) * Math.sin(t * 5.3)));
  x.fillStyle = "#7a2b2b"; x.beginPath(); x.ellipse(CX, SY + 345, 26, 4 + 18 * m, 0, 0, Math.PI * 2); x.fill();
  x.restore();
}
// sound waves coming out of the phone (right side), fade with a
function waves(t, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 9; x.lineCap = "round"; glow(VIOLET, 20);
  for (let i = 0; i < 3; i++) { const ph = (t * 1.6 + i / 3) % 1; x.globalAlpha = a * (1 - ph);
    x.beginPath(); x.arc(SX + PW + 10, PY - 120, 40 + ph * 110, -0.6, 0.6); x.stroke(); }
  x.restore();
}
function muteIcon(X, Y, s, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(RED, 30); x.fillStyle = "rgba(8,6,34,0.92)"; x.strokeStyle = RED; x.lineWidth = 10;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill(); x.stroke();
  x.fillStyle = RED; x.beginPath(); x.moveTo(-40, -18); x.lineTo(-18, -18); x.lineTo(8, -42); x.lineTo(8, 42); x.lineTo(-18, 18); x.lineTo(-40, 18); x.closePath(); x.fill();
  x.lineCap = "round"; x.beginPath(); x.moveTo(22, -20); x.lineTo(50, 20); x.moveTo(50, -20); x.lineTo(22, 20); x.stroke();
  x.restore();
}
// big caption inside the phone: the words of the line, one at a time
function phoneCap(txt, a, col = WHITE, y = SY + 470) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(50);
  const fpx = Math.min(50, ((PW - 80) / x.measureText(txt).width) * 50);
  x.font = FONT(fpx); x.textAlign = "center"; x.textBaseline = "middle";
  const w = Math.min(PW - 30, x.measureText(txt).width + 40);
  x.fillStyle = "rgba(0,0,0,0.75)"; rr(CX - w / 2, y - 42, w, 84, 20); x.fill();
  x.fillStyle = col; x.fillText(txt, CX, y + 2);
  x.restore();
}
function appScreen(t) {
  x.save();
  x.fillStyle = CREAM; x.fillRect(SX, SY, PW, PH);
  x.fillStyle = DKG; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = FONT(62); x.fillText("56 POSES", CX, SY + 90);
  x.font = FONT(30); x.fillStyle = "#5c7a6b"; x.fillText("FLOW FOR YOUR MOOD", CX, SY + 145);
  stick(CX, SY + 520, flowPose(t), 0.55, DKG);
  x.restore();
}

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  room();

  if (id === "s1") {
    phone(() => presenter(t, 1));
    waves(t, 1);
    tag("TALK TALK TALK", CX, 1110, VIOLET, sm(at("s1", "whole") - 0.2, at("s1", "time"), u) * (1 - sm(at("s1", "never") - 0.1, at("s1", "never") + 0.1, u)), 44);
    muteIcon(CX, 1100, 0.8 * back(at("s1", "sound") - 0.1, at("s1", "sound") + 0.25, u), sm(at("s1", "sound") - 0.1, at("s1", "sound"), u));
    words(["YOUR AD TALKS."], WHITE, 300, -0.2, 1, 130);
    words(["NEVER RELY ON SOUND."], RED, 440, at("s1", "never") - 0.05, 1, 110, flash(u, at("s1", "never")));
  }
  if (id === "s2") {
    // the viewer's phone is muted: waves die, a mute badge sits on the phone, a thumb keeps scrolling
    const off = sm(at("s2", "sound") - 0.15, at("s2", "off") + 0.05, u);
    phone(() => presenter(t, 1));
    waves(t, 1 - off);
    muteIcon(SX + PW - 20, SY + 40, 0.75 + 0.15 * flash(u, at("s2", "off")), 1);
    const th = sm(at("s2", "scroll") - 0.3, at("s2", "scroll"), u);
    if (th > 0) { x.save(); x.globalAlpha = th; x.fillStyle = "#f0c9a8"; const ty = 1080 - 60 * Math.abs(Math.sin(u * 4)); rr(CX + 60, ty, 90, 200, 45); x.fill(); x.restore(); }
    tag("SOUND OFF", CX, 1110, RED, off, 50);
    words(["MUTED"], RED, 330, -0.2, 1, 150, flash(u, at("s2", "off")) * 0.6);
  }
  if (id === "s3") {
    // mouth moves, nothing reaches the viewer: question marks
    const q = sm(at("s3", "means") - 0.2, at("s3", "message"), u);
    phone(() => {
      presenter(t, 1);
      x.save(); x.globalAlpha = q; x.fillStyle = RED; x.font = FONT(110); x.textAlign = "center"; glow(RED, 20);
      x.fillText("?", SX + 70, SY + 190); x.fillText("?", SX + PW - 70, SY + 150); x.fillText("?", SX + PW - 90, SY + 420); x.restore();
    });
    muteIcon(SX + PW - 20, SY + 40, 0.75, 1);
    tag("NO WORDS", CX, 1110, RED, sm(at("s3", "words") - 0.2, at("s3", "words") + 0.05, u) * (1 - q), 50);
    tag("NO MESSAGE", CX, 1110, RED, q, 50);
    words(["NO MESSAGE"], RED, 330, -0.2, 1, 150, flash(u, at("s3", "message")) * 0.6);
  }
  if (id === "s4") {
    // same presenter, still muted, but now big captions carry every line
    phone(() => {
      presenter(t, 1);
      const c1 = sm(at("s4", "put") - 0.1, at("s4", "put"), u), c2 = sm(at("s4", "every") - 0.1, at("s4", "every"), u);
      phoneCap("BIG CAPTIONS", c1 * (1 - c2), "#ffe14d");
      phoneCap("EVERY LINE", c2, "#ffe14d");
    }, { ring: GREEN });
    muteIcon(SX + PW - 20, SY + 40, 0.75, 1);
    tag("READS ON MUTE", CX, 1110, GREEN, sm(at("s4", "line") - 0.2, at("s4", "line") + 0.1, u), 46);
    words(["BIG CAPTIONS"], GREEN, 330, -0.3, 1, 140, flash(u, at("s4", "captions")) * 0.5);
  }
  if (id === "s5") {
    // cut to the app doing the thing, with the caption saying it
    phone(() => { appScreen(t * 1.4); phoneCap("FOLLOW ALONG", sm(-0.2, 0.1, u), WHITE, SY + 600); }, { ring: GREEN });
    tag("SAY IT. SHOW IT.", CX, 455, GREEN, sm(at("s5", "doing") - 0.2, at("s5", "doing") + 0.05, u), 44);
    words(["SHOW THE APP"], VIOLET, 330, -0.3, 1, 140, flash(u, at("s5", "app")) * 0.5);
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
window.__hf.buildReady["sound-off-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
