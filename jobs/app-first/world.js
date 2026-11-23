// app-first: Right Brothers reel 05 (Flat Vector 2D canvas, same look as reels 02 and 04).
// BEFORE: a phone plays an ad with a logo, slow music and a long intro; the app shows up at 0:20, people scroll away.
// AFTER: the app is on screen at 0:01; show what it does, then why. Demo app = YogaFlow (Ofir's own). Time only from hf-seek.
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

// ---------- the phone that plays the ad ----------
const PW = 360, PH = 620, PY = 840;           // phone centre y; screen spans ~530..1150
const SX = CX - PW / 2, SY = PY - PH / 2;
function phone(drawScreen, o = {}) {
  x.save();
  x.translate(o.dx || 0, o.dy || 0);
  glow(o.ring || "#6b63c8", o.ring ? 40 : 18);
  x.fillStyle = "#14112e"; rr(SX - 16, SY - 16, PW + 32, PH + 32, 54); x.fill();
  x.lineWidth = 6; x.strokeStyle = o.ring || "#3a3480"; x.stroke(); noGlow();
  x.save(); rr(SX, SY, PW, PH, 40); x.clip();
  drawScreen();
  x.restore();
  x.restore();
}
// progress bar of the ad + the moment the app appears
function progress(p, appAt, col, a = 1) {
  if (a <= 0) return;
  const bx = SX + 30, bw = PW - 60, by = SY + PH - 40;
  x.save(); x.globalAlpha = a;
  x.fillStyle = "rgba(255,255,255,0.25)"; rr(bx, by, bw, 10, 5); x.fill();
  x.fillStyle = WHITE; rr(bx, by, Math.max(10, bw * cl(p)), 10, 5); x.fill();
  glow(col, 16); x.fillStyle = col; x.beginPath(); x.arc(bx + bw * appAt, by + 5, 14, 0, Math.PI * 2); x.fill(); noGlow();
  x.restore();
}
function appScreen(t, a = 1, pop = 1) {
  x.save(); x.globalAlpha = a;
  x.fillStyle = CREAM; x.fillRect(SX, SY, PW, PH);
  x.fillStyle = DKG; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = FONT(48); x.fillText("56 POSES", CX, SY + 90);
  x.font = FONT(26); x.fillStyle = "#5c7a6b"; x.fillText("FLOW FOR YOUR MOOD", CX, SY + 140);
  stick(CX, SY + 520, flowPose(t), 0.62 * pop, DKG);
  x.restore();
}
function logoScreen(u, a = 1) {
  x.save(); x.globalAlpha = a;
  x.fillStyle = "#24204a"; x.fillRect(SX, SY, PW, PH);
  const k = sm(at("s2", "logo") - 0.2, at("s2", "logo") + 0.3, u);
  glow(WHITE, 20); x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 8;
  x.beginPath(); x.arc(CX, SY + 260, 80 * (0.6 + 0.4 * k), 0, Math.PI * 2 * k); x.stroke(); noGlow();
  x.fillStyle = "rgba(255,255,255,0.8)"; x.font = FONT(34); x.textAlign = "center"; x.textBaseline = "middle";
  x.globalAlpha = a * k; x.fillText("LOGO", CX, SY + 260);
  // slow music notes drifting up
  const m = sm(at("s2", "music") - 0.2, at("s2", "music") + 0.1, u);
  x.globalAlpha = a * m; x.fillStyle = VIOLET; x.font = FONT(56);
  for (let i = 0; i < 3; i++) { const yy = SY + 470 - ((u * 25 + i * 45) % 120); x.fillText("♪", CX - 90 + i * 90, yy); }
  x.restore();
}
function feedPost(a = 1) {
  x.save(); x.globalAlpha = a;
  x.fillStyle = "#2a2a35"; x.fillRect(SX, SY, PW, PH);
  x.fillStyle = "rgba(255,255,255,0.12)"; rr(SX + 30, SY + 60, PW - 60, 300, 24); x.fill();
  rr(SX + 30, SY + 390, PW - 120, 26, 13); x.fill(); rr(SX + 30, SY + 430, PW - 180, 26, 13); x.fill();
  x.restore();
}

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  room();

  if (id === "s1") {
    // the ad plays; the app dot sits far at the end of the bar (0:20 of a 0:22 ad)
    const p = sm(0, at("s1", "twenty") + 0.2, u) * 0.85;
    phone(() => { logoScreen(at("s2", "music") + 1, 1); progress(p, 0.9, GREEN); });
    tag("APP AT 0:20", 760, 1060, RED, sm(at("s1", "second") - 0.15, at("s1", "twenty"), u), 46);
    words(["APP AT 0:20?"], WHITE, 300, -0.2, 1, 130);
    words(["NEVER HIDE IT."], RED, 440, at("s1", "never") - 0.05, 1, 140, flash(u, at("s1", "never")));
  }
  if (id === "s2") {
    // BEFORE: logo, slow music, a long red intro on the bar
    const lg = sm(at("s2", "long") - 0.15, at("s2", "intro") + 0.2, u);
    phone(() => { logoScreen(u, 1); progress(0.1 + 0.3 * cl(u / 2.2), 0.9, GREEN);
      x.save(); glow(RED, 16); x.fillStyle = RED; rr(SX + 30, SY + PH - 40, (PW - 60) * 0.88 * lg, 10, 5); x.fill(); x.restore(); });
    tag("LOGO", 830, 640, RED, sm(at("s2", "logo") - 0.15, at("s2", "logo") + 0.1, u), 42);
    tag("SLOW MUSIC", 830, 760, RED, sm(at("s2", "music") - 0.2, at("s2", "music") + 0.1, u), 42);
    tag("LONG INTRO", CX, 1210, RED, lg, 46);
    words(["BEFORE"], RED, 330, -0.2, 1, 150, flash(u, 0.1) * 0.5);
  }
  if (id === "s3") {
    // a thumb flicks: the ad slides up and out, the next post takes its place
    const sc = sm(at("s3", "scroll") - 0.1, at("s3", "away") + 0.15, u);
    phone(() => {
      x.save(); x.translate(0, -PH * sc); logoScreen(5, 1); progress(0.4, 0.9, GREEN); x.restore();
      x.save(); x.translate(0, PH * (1 - sc)); feedPost(1); x.restore();
    });
    // thumb
    const th = sm(at("s3", "scroll") - 0.35, at("s3", "scroll") - 0.05, u) * (1 - sm(at("s3", "away") + 0.1, at("s3", "away") + 0.4, u));
    if (th > 0) { x.save(); x.globalAlpha = th; x.fillStyle = "#f0c9a8"; glow("#000", 20);
      const ty = 1080 - 260 * sc; rr(CX + 40, ty, 90, 200, 45); x.fill(); x.restore(); }
    tag("NEVER SAW THE APP", CX, 1210, RED, sm(at("s3", "see") - 0.15, at("s3", "app") + 0.1, u), 44);
    words(["SCROLLED AWAY"], RED, 330, -0.2, 1, 140, flash(u, at("s3", "scroll")) * 0.6);
  }
  if (id === "s4") {
    // AFTER: the app fills the screen from 0:01
    const k = back(-0.3, 0.15, u);
    phone(() => { appScreen(t, 1, 0.85 + 0.15 * k); progress(0.05 + 0.1 * cl(u / 2), 0.04, GREEN); }, { ring: GREEN });
    tag("APP AT 0:01", 760, 1060, GREEN, sm(at("s4", "first") - 0.2, at("s4", "second") + 0.05, u), 46);
    words(["AFTER"], GREEN, 330, -0.3, 1, 150, flash(u, at("s4", "app")) * 0.5);
  }
  if (id === "s5") {
    // show what it does (the pose flows), then why (one benefit)
    const why = sm(at("s5", "why") - 0.2, at("s5", "why") + 0.05, u);
    phone(() => { appScreen(t * 1.4, 1, 1);
      if (why > 0) { x.save(); x.globalAlpha = why; x.fillStyle = "rgba(44,74,59,0.92)"; rr(SX + 30, SY + 200, PW - 60, 90, 22); x.fill();
        x.fillStyle = CREAM; x.font = FONT(36); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("PRACTICE SAFELY", CX, SY + 247); x.restore(); }
    }, { ring: GREEN });
    tag("WHAT IT DOES", 780, 640, VIOLET, sm(at("s5", "show") - 0.25, at("s5", "does"), u), 40);
    tag("THEN WHY", 780, 1000, GREEN, why, 44);
    words(["SHOW. THEN TELL."], VIOLET, 330, -0.2, 1, 130, flash(u, at("s5", "tell")) * 0.4);
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
window.__hf.buildReady["app-first-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
