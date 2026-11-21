// mirror-myth: 2D Canvas reel (flat neon illustrations + kinetic text). Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const END = S.s8[0] + S.s8[1];
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
const CX = 510; // content centre, left of the right-side buttons
const cv = document.getElementById("world");
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;

function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function glow(c, b) { x.shadowColor = c; x.shadowBlur = b; }
function noGlow() { x.shadowBlur = 0; }

// ---------- kinetic text: each word pops in on its own beat ----------
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
      noGlow(); x.lineWidth = 3; x.strokeStyle = "rgba(0,0,0,0.35)"; x.strokeText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
}
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}
// pill label under / over an object
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * a;
  x.translate(X, Y); x.scale(s, s);
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}

// ---------- props ----------
function room(dark) {
  const gr = x.createRadialGradient(CX, 820, 80, CX, 820, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  // bathroom tiles
  x.save(); x.globalAlpha = 0.16 * (1 - dark); x.strokeStyle = VIOLET; x.lineWidth = 2;
  for (let X = -20; X < 1100; X += 120) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, 1920); x.stroke(); }
  for (let Y = 40; Y < 1920; Y += 120) { x.beginPath(); x.moveTo(0, Y); x.lineTo(1080, Y); x.stroke(); }
  x.restore();
  if (dark > 0) { x.fillStyle = `rgba(2,1,10,${0.72 * dark})`; x.fillRect(0, 0, 1080, 1920); }
}
function mirror(X, Y, w, h, t, a = 1, rim = VIOLET) {
  x.save(); x.globalAlpha = a;
  glow(rim, 40); x.lineWidth = 14; x.strokeStyle = rim; rr(X - w / 2, Y - h / 2, w, h, 36); x.stroke(); noGlow();
  const g = x.createLinearGradient(X - w / 2, Y - h / 2, X + w / 2, Y + h / 2);
  g.addColorStop(0, "#2c3a78"); g.addColorStop(0.5, "#1a2252"); g.addColorStop(1, "#3a4a8e");
  x.fillStyle = g; rr(X - w / 2 + 8, Y - h / 2 + 8, w - 16, h - 16, 30); x.fill();
  // moving sheen
  x.save(); rr(X - w / 2 + 8, Y - h / 2 + 8, w - 16, h - 16, 30); x.clip();
  const off = ((t * 90) % (w * 2)) - w;
  x.globalAlpha = a * 0.22; x.fillStyle = WHITE;
  x.beginPath(); x.moveTo(X - w / 2 + off, Y + h / 2); x.lineTo(X - w / 2 + off + 70, Y + h / 2); x.lineTo(X - w / 2 + off + 70 + h * 0.6, Y - h / 2); x.lineTo(X - w / 2 + off + h * 0.6, Y - h / 2); x.fill();
  x.globalAlpha = a * 0.1;
  x.beginPath(); x.moveTo(X - w / 2 + off + 110, Y + h / 2); x.lineTo(X - w / 2 + off + 135, Y + h / 2); x.lineTo(X - w / 2 + off + 135 + h * 0.6, Y - h / 2); x.lineTo(X - w / 2 + off + 110 + h * 0.6, Y - h / 2); x.fill();
  x.restore(); x.restore();
}
// finger from below, tip at (X,Y); refl = mirrored finger meeting tip to tip
function finger(X, Y, s, a, color = "#f2c7a5", refl = 0) {
  if (a <= 0) return;
  const one = (dir, alpha, tint) => {
    x.save(); x.globalAlpha = alpha; x.translate(X, Y); x.scale(s, s * dir);
    x.fillStyle = tint; glow("rgba(255,200,170,0.5)", 18);
    rr(-34, 0, 68, 330, 34); x.fill(); noGlow();
    x.fillStyle = "rgba(255,255,255,0.75)"; rr(-22, 10, 44, 54, 18); x.fill(); // nail
    x.strokeStyle = "rgba(120,70,60,0.5)"; x.lineWidth = 4;
    x.beginPath(); x.moveTo(-20, 150); x.lineTo(20, 150); x.moveTo(-20, 250); x.lineTo(20, 250); x.stroke();
    x.restore();
  };
  if (refl > 0) one(-1, a * refl * 0.45, "#c9a3b8");
  one(1, a, color);
}
function camIcon(X, Y, s, a, color = RED, blink = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(color, 30); x.fillStyle = "#1c0c18"; x.lineWidth = 8; x.strokeStyle = color;
  rr(-90, -55, 180, 110, 22); x.fill(); x.stroke();
  x.beginPath(); x.arc(0, 0, 38, 0, Math.PI * 2); x.stroke();
  x.fillStyle = color; x.beginPath(); x.arc(0, 0, 18, 0, Math.PI * 2); x.fill();
  x.globalAlpha = a * blink; x.beginPath(); x.arc(64, -36, 10, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  glow(color, 30); x.strokeStyle = color; x.lineWidth = 22;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.beginPath();
  if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); }
  else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
  x.stroke(); noGlow(); x.restore();
}
function phone(X, Y, s, a, rot = 0, lamp = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  glow(VIOLET, 26); x.fillStyle = "#14123a"; x.strokeStyle = VIOLET; x.lineWidth = 8;
  rr(-80, -150, 160, 300, 28); x.fill(); x.stroke(); noGlow();
  x.fillStyle = "#26225e"; rr(-62, -118, 124, 236, 14); x.fill();
  x.fillStyle = WHITE; x.globalAlpha = a * 0.9; rr(-30, -138, 60, 10, 5); x.fill();
  if (lamp > 0) { x.globalAlpha = a; glow(WHITE, 60 * lamp); x.fillStyle = WHITE; x.beginPath(); x.arc(0, -90, 16, 0, Math.PI * 2); x.fill(); noGlow(); }
  x.restore();
}
function eye(X, Y, s, a, hands = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(WHITE, 20); x.fillStyle = "#f1f0ff"; x.beginPath(); x.ellipse(0, 0, 110, 60, 0, 0, Math.PI * 2); x.fill(); noGlow();
  x.fillStyle = "#3a2fb8"; x.beginPath(); x.arc(0, 0, 44, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#06051a"; x.beginPath(); x.arc(0, 0, 22, 0, Math.PI * 2); x.fill();
  x.fillStyle = WHITE; x.beginPath(); x.arc(-14, -14, 9, 0, Math.PI * 2); x.fill();
  // cupped hands close in from the sides
  const o = lerp(230, 150, hands);
  x.fillStyle = "#f2c7a5"; glow("rgba(255,200,170,0.5)", 16);
  [-1, 1].forEach((d) => { x.save(); x.translate(d * o, 0); x.scale(d, 1); x.beginPath(); x.ellipse(0, 0, 46, 130, -0.12, 0, Math.PI * 2); x.fill(); x.restore(); });
  noGlow(); x.restore();
}
function bed(X, Y, s, a, on) {
  if (a <= 0) return;
  const c = on > 0.5 ? RED : VIOLET;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 20 + 30 * on); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#15123c";
  rr(-110, -10, 220, 60, 12); x.fill(); x.stroke();
  rr(-110, -60, 60, 50, 12); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-110, 50); x.lineTo(-110, 80); x.moveTo(110, 50); x.lineTo(110, 80); x.stroke();
  noGlow(); x.restore();
}
function shower(X, Y, s, a, on) {
  if (a <= 0) return;
  const c = on > 0.5 ? RED : VIOLET;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 20 + 30 * on); x.strokeStyle = c; x.lineWidth = 10; x.lineCap = "round";
  x.beginPath(); x.moveTo(-60, 90); x.lineTo(-60, -80); x.lineTo(20, -80); x.lineTo(20, -50); x.stroke();
  x.beginPath(); x.moveTo(-20, -50); x.lineTo(60, -50); x.stroke();
  x.lineWidth = 6; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-10 + i * 20, -30); x.lineTo(-16 + i * 20, 10); x.stroke(); }
  noGlow(); x.restore();
}

// ---------- one frame ----------
let curU = 0;
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  // slow push-in per line + a small punch on each cut
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  const dark = id === "s4" ? sm(at("s4", "off") - 0.05, at("s4", "lights"), u) : id === "s5" ? 1 : id === "s6" || id === "s7" ? 0.6 : 0;
  room(dark);
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);

  if (id === "s1") {
    const a = sm(-0.05, 0.3, u);
    mirror(CX, 840, 520, 640, t, a);
    const tip = at("s1", "fingernail") + 0.45;
    finger(CX, lerp(1250, 860, sm(0, tip, u)), 1, a, undefined, sm(tip - 0.05, tip + 0.2, u));
    const r = sm(tip, tip + 0.6, u);
    if (r > 0 && r < 1) { x.save(); x.globalAlpha = 1 - r; x.strokeStyle = WHITE; x.lineWidth = 6; glow(WHITE, 20); x.beginPath(); x.arc(CX, 860, 30 + 140 * r, 0, Math.PI * 2); x.stroke(); x.restore(); }
    const q = back(at("s1", "camera") - 0.1, at("s1", "camera") + 0.25, u);
    if (u > at("s1", "camera") - 0.1) { x.save(); x.font = FONT(220); x.textAlign = "center"; x.textBaseline = "middle"; glow(RED, 40); x.fillStyle = RED; x.translate(CX + 170, 640); x.rotate(0.15 + 0.05 * Math.sin(u * 6)); x.scale(q, q); x.fillText("?", 0, 0); x.restore(); }
  }
  if (id === "s2") {
    const a = sm(-0.05, 0.25, u), b = sm(at("s2", "normal") - 0.25, at("s2", "normal"), u);
    [[300, "NORMAL", 0], [720, "SPY", 1]].forEach(([X, lab, i]) => {
      const sl = back(0.05 + i * 0.12, 0.45 + i * 0.12, u);
      x.save(); x.translate(X, 860); x.scale(sl, sl); x.translate(-X, -860);
      mirror(X, 860, 340, 480, t + i, a);
      x.save(); x.beginPath(); x.rect(X - 170, 620, 340, 480); x.clip();
      finger(X, lerp(1120, 900, sm(0.2, at("s2", "trick") + 0.35, u)), 0.62, a, undefined, sm(at("s2", "trick") + 0.3, at("s2", "trick") + 0.5, u));
      x.restore();
      x.restore();
      tag(lab, X, 570, i ? RED : VIOLET, b);
      tag("NO GAP", X, 1160, RED, sm(at("s2", "fails") - 0.1, at("s2", "fails") + 0.15, u), 40);
    });
    const e = back(at("s2", "proves") - 0.1, at("s2", "proves") + 0.25, u);
    if (u > at("s2", "proves") - 0.1) { x.save(); x.font = FONT(170); x.textAlign = "center"; x.textBaseline = "middle"; glow(RED, 40); x.fillStyle = RED; x.translate(510, 860); x.scale(e, e); x.fillText("=", 0, 0); x.restore(); }
  }
  if (id === "s3") {
    mirror(CX, 840, 520, 640, t, 1);
    // x-ray scan: below the line the glass is see-through and the camera shows
    const sy = lerp(520, 1160, sm(at("s3", "camera") - 0.1, at("s3", "behind") + 0.2, u));
    x.save(); x.beginPath(); x.rect(CX - 252, 528, 504, sy - 528); x.clip();
    x.fillStyle = "rgba(10,4,20,0.92)"; x.fillRect(CX - 252, 528, 504, 624);
    x.strokeStyle = "rgba(255,42,58,0.25)"; x.lineWidth = 2;
    for (let X = CX - 240; X < CX + 252; X += 40) { x.beginPath(); x.moveTo(X, 528); x.lineTo(X, 1152); x.stroke(); }
    camIcon(CX, 800, 1.4, 1, RED, 0.5 + 0.5 * Math.sin(u * 14));
    x.restore();
    if (sy < 1160) { x.save(); glow(RED, 40); x.fillStyle = RED; x.fillRect(CX - 262, sy - 5, 524, 10); x.restore(); }
    const k = sm(at("s3", "never") - 0.15, at("s3", "never") + 0.1, u);
    x.save(); x.globalAlpha = k; finger(250, 1010, 0.45, 1); x.restore();
    stamp("x", 250, 1050, back(at("s3", "never"), at("s3", "never") + 0.3, u) * 0.9, k, RED);
  }
  if (id === "s4") {
    const lampOn = sm(at("s4", "flat") - 0.1, at("s4", "flat") + 0.15, u);
    if (lampOn > 0) { x.save(); const gr = x.createRadialGradient(CX, 860, 0, CX, 860, 420); gr.addColorStop(0, `rgba(255,255,255,${0.55 * lampOn})`); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 300, 1080, 1100); x.restore(); }
    mirror(CX, 840, 520, 640, t, 1, lampOn > 0.5 ? GREEN : VIOLET);
    // light switch flips off
    const sw = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.15, u), sa = 1 - sm(at("s4", "phone") - 0.3, at("s4", "phone"), u);
    if (sa > 0) { x.save(); x.globalAlpha = sa; x.translate(870, 640); glow(VIOLET, 20); x.fillStyle = "#1c1850"; x.strokeStyle = VIOLET; x.lineWidth = 6; rr(-45, -75, 90, 150, 16); x.fill(); x.stroke(); x.fillStyle = sw > 0.5 ? "#555" : "#ffe9a8"; rr(-18, lerp(-50, 6, sw), 36, 44, 8); x.fill(); x.restore(); }
    const ph = sm(at("s4", "put") - 0.1, at("s4", "flat"), u);
    phone(lerp(1000, CX, ph), lerp(1100, 860, ph), lerp(1, 0.9, ph), sm(at("s4", "put") - 0.15, at("s4", "put"), u), lerp(0.5, 0, ph), lampOn);
  }
  if (id === "s5") {
    // close on the lit glass: a lens shows as a bright dot
    const gr = x.createRadialGradient(CX, 760, 0, CX, 760, 460); gr.addColorStop(0, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    mirror(CX, 790, 700, 760, t, 1, GREEN);
    x.fillStyle = gr; x.fillRect(CX - 340, 420, 680, 740);
    const L = sm(at("s5", "lens") - 0.15, at("s5", "lens") + 0.1, u), B = sm(at("s5", "bright") - 0.1, at("s5", "bright") + 0.1, u);
    if (L > 0) {
      x.save(); x.globalAlpha = L; glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 8;
      x.beginPath(); x.arc(660, 620, 46, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(660, 620, 24, 0, Math.PI * 2); x.stroke(); x.restore();
    }
    if (B > 0) {
      const p = 0.7 + 0.3 * Math.sin(u * 16);
      x.save(); x.globalAlpha = B; glow(WHITE, 70 * p); x.fillStyle = WHITE; x.beginPath(); x.arc(660, 620, 14 * p + 6, 0, Math.PI * 2); x.fill();
      x.strokeStyle = WHITE; x.lineWidth = 5; for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + u; x.beginPath(); x.moveTo(660 + Math.cos(an) * 34, 620 + Math.sin(an) * 34); x.lineTo(660 + Math.cos(an) * (60 + 20 * p), 620 + Math.sin(an) * (60 + 20 * p)); x.stroke(); }
      x.restore();
      tag("LENS", 660, 500, VIOLET, B, 40);
    }
    eye(CX - 40, 1060, 0.95, sm(-0.05, 0.25, u), sm(at("s5", "hands") - 0.1, at("s5", "eyes"), u));
  }
  if (id === "s6") {
    // side view: wall with the mirror, a hollow behind it, and what it faces
    const a = sm(-0.05, 0.25, u);
    x.save(); x.globalAlpha = a;
    x.fillStyle = "#231f5e"; x.fillRect(150, 520, 90, 640); // wall
    glow(VIOLET, 30); x.fillStyle = "#9ab0ff"; x.fillRect(240, 640, 24, 300); noGlow(); // mirror edge-on
    x.restore();
    const hb = sm(at("s6", "behind") - 0.15, at("s6", "behind") + 0.15, u);
    if (hb > 0) {
      x.save(); x.globalAlpha = hb; x.setLineDash([18, 12]); x.lineDashOffset = -u * 60; glow(GREEN, 24); x.strokeStyle = GREEN; x.lineWidth = 6;
      rr(140, 640, 110, 300, 14); x.stroke(); x.restore();
      tag("CHECK", 195, 590, GREEN, hb, 40);
    }
    const f = sm(at("s6", "faces") - 0.2, at("s6", "faces") + 0.2, u);
    if (f > 0) {
      x.save(); x.globalAlpha = 0.35 * f; const gr = x.createLinearGradient(264, 790, 900, 790); gr.addColorStop(0, GREEN); gr.addColorStop(1, "rgba(61,255,138,0)");
      x.fillStyle = gr; x.beginPath(); x.moveTo(264, 660); x.lineTo(264, 920); x.lineTo(lerp(264, 900, f), 1160); x.lineTo(lerp(264, 900, f), 480); x.closePath(); x.fill(); x.restore();
    }
    const b1 = back(at("s6", "bed") - 0.1, at("s6", "bed") + 0.2, u), b2 = back(at("s6", "shower") - 0.1, at("s6", "shower") + 0.2, u);
    bed(700, 1010, b1, u > at("s6", "bed") - 0.1 ? 1 : 0, b1);
    shower(720, 680, b2, u > at("s6", "shower") - 0.1 ? 1 : 0, b2);
  }
  if (id === "s7" || id === "s8") {
    const lit = sm(-0.1, 0.4, t - S.s7[0]);
    const gr = x.createRadialGradient(CX, 860, 0, CX, 860, 420); gr.addColorStop(0, `rgba(255,255,255,${0.35 * lit})`); gr.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = gr; x.fillRect(0, 300, 1080, 1100);
    mirror(CX, 840, 520, 640, t, id === "s8" ? 0.35 : 0.7, GREEN);
    if (id === "s7") phone(CX, 860, 0.9, 0.8, 0, 1);
  }
  x.restore();

  // ---------- screen text (safe zone, above the captions) ----------
  if (id === "s1") {
    const T = 0.0, fk = Math.max(flash(u, 0.05), flash(u, at("s1", "never")));
    words(["NEVER TRUST", "THE NAIL TEST"], RED, 360, T, 1, 140, fk);
  }
  if (id === "s2") {
    const sw = at("s2", "proves") - 0.1;
    words(["THE GAP TRICK"], RED, 380, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["PROVES NOTHING"], RED, 380, sw, sm(sw - 0.05, sw, u), 130, flash(u, sw + 0.1));
  }
  if (id === "s3") {
    const sw = at("s3", "never") - 0.1;
    words(["CAMERA BEHIND"], RED, 380, at("s3", "behind") - 0.15, 1 - sm(sw - 0.1, sw, u), 130);
    words(["TEST NEVER SEES IT"], RED, 380, sw, sm(sw - 0.05, sw, u), 120);
  }
  if (id === "s4") {
    const sw = at("s4", "phone") - 0.15;
    words(["LIGHTS OFF"], GREEN, 380, at("s4", "off") - 0.1, 1 - sm(sw - 0.1, sw, u), 140);
    words(["LIGHT ON GLASS"], GREEN, 380, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s4", "flat")) * 0.6);
  }
  if (id === "s5") {
    const sw = at("s5", "look") - 0.1;
    words(["CUP YOUR EYES"], VIOLET, 330, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["FIND THE DOT"], VIOLET, 330, sw, sm(sw - 0.05, sw, u), 140, flash(u, at("s5", "bright")) * 0.6);
  }
  if (id === "s6") {
    const sw = at("s6", "whether") - 0.1;
    words(["CHECK BEHIND IT"], GREEN, 380, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["WHAT DOES IT FACE"], GREEN, 380, sw, sm(sw - 0.05, sw, u), 120);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SKIP THE NAIL"], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["USE THE LIGHT"], ORANGE, 880, at("s7", "use") - 0.05, 1, 150, flash(u, at("s7", "light")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    // lens badge with a sweeping scan ring
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 110, 0, Math.PI * 2); x.stroke();
    x.fillStyle = VIOLET; x.beginPath(); x.arc(0, 0, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = GREEN; glow(GREEN, 30); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 150, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["mirror-myth-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
