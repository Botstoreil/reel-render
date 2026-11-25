// flip-flops (Apex 27, TikTok) - CUT-PAPER style: flat paper pieces with drop shadows, moved at 15 fps like stop-motion.
// Side close-up of a rider's lower leg next to the bike: rear wheel, hot muffler, footpeg, gear lever, a traffic light.
// Wrong: flip-flop, foot down at the lights, the sandal slips, toes hit the road, the calf swings onto the hot pipe.
// Right: riding shoes that cover the ankle, hard sole grips the road, foot on the gear lever, light shoes that breathe.
// Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const L2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const RED = "#ff5a52", GREEN = "#4dff9a", VIOLET = "#9b7bff", ORANGE = "#ffa733", WHITE = "#fff8ea", INK = "#1a1a22";
const SKIN = "#e7ad82", SHORTS = "#c49a5c", PANTS = "#3a3f55", JACKET = "#263047", BIKE = "#2a3442", METAL = "#b8bec8";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };

// one paper piece: fill with a soft cast shadow, like cut card lying on card
let STEP = 0;
function paper(build, fill, o = {}) {
  const { sh = 1, a = 1, j = 1 } = o;
  if (a <= 0) return;
  x.save(); x.globalAlpha = a;
  const jx = (rnd(STEP * 7 + j) - 0.5) * 2.2, jy = (rnd(STEP * 11 + j) - 0.5) * 2.2;  // stop-motion jitter
  x.translate(jx, jy);
  x.shadowColor = `rgba(0,0,0,${0.38 * sh})`; x.shadowOffsetX = 6 * sh; x.shadowOffsetY = 8 * sh; x.shadowBlur = 9 * sh;
  build(); x.fillStyle = fill; x.fill();
  x.restore();
}
function limb(p, q, w, c, j) {
  paper(() => { x.beginPath(); const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
    x.moveTo(p[0] + nx, p[1] + ny); x.lineTo(q[0] + nx, q[1] + ny); x.arc(q[0], q[1], w / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
    x.lineTo(p[0] - nx, p[1] - ny); x.arc(p[0], p[1], w / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true); x.closePath(); }, c, { j });
}

// ---------- text (screen space) ----------
let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (830 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.06, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.53;
    parts.forEach((p, i) => {
      const s0 = t0 + wi * 0.07, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - kk) * 30); x.scale(0.5 + 0.5 * kk, 0.5 + 0.5 * kk); x.globalAlpha = a * o;
      x.lineWidth = Math.max(12, px * 0.16); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// paper label (screen space, clamped to the safe zone)
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1200);
  x.translate(X, Y); x.rotate(-0.03 + 0.06 * rnd(txt.length)); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.shadowColor = "rgba(0,0,0,0.45)"; x.shadowOffsetX = 6; x.shadowOffsetY = 8; x.shadowBlur = 8;
  x.fillStyle = INK; rr(-w / 2, -h / 2, w, h, 10); x.fill();
  x.shadowColor = "transparent"; x.strokeStyle = color; x.lineWidth = 6; rr(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 7); x.stroke();
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s); x.rotate(-0.12);
  x.shadowColor = "rgba(0,0,0,0.45)"; x.shadowOffsetX = 6; x.shadowOffsetY = 8; x.shadowBlur = 8;
  x.fillStyle = INK; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill();
  x.shadowColor = "transparent"; x.strokeStyle = c; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 64, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 20; x.lineCap = "round"; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke(); x.restore();
}
function banner(c) {
  paper(() => { x.save(); x.translate(540, 372); x.rotate(-0.015); rr(-500, -142, 1000, 284, 14); x.restore(); }, "#f2e3c4", { j: 900 });
  x.save(); x.translate(540, 372); x.rotate(-0.015); x.strokeStyle = rgba(c, 0.55); x.lineWidth = 6; rr(-484, -126, 968, 252, 10); x.stroke(); x.restore();
}

// ---------- world ----------
const ROAD = 1155, HIP = [470, 600], LT = 280, LS = 300;
const PEG = { A: [560, 860], r: 0.12 }, DOWN = { A: [720, 1112], r: 0 }, BURN = { A: [615, 1098], r: -0.1 }, TOEHIT = { A: [735, 1094], r: 0.18 };
function knee(A) {
  const dx = A[0] - HIP[0], dy = A[1] - HIP[1]; let d = Math.hypot(dx, dy); d = Math.min(d, LT + LS - 1);
  const a = (LT * LT - LS * LS + d * d) / (2 * d), h = Math.sqrt(Math.max(0, LT * LT - a * a));
  const ux = dx / d, uy = dy / d; const P = [HIP[0] + a * ux, HIP[1] + a * uy];
  const k1 = [P[0] - h * uy, P[1] + h * ux], k2 = [P[0] + h * uy, P[1] - h * ux];
  return k1[0] > k2[0] ? k1 : k2;   // the knee bends forward
}
// speed of the bike (0 stopped .. 1 riding) and how far it has rolled, integrated over the timeline
function speed(t) {
  const { id, u } = sceneOf(t);
  if (id === "s1") return 1;
  if (id === "s2") return 1 - sm(-0.1, at("s2", "down"), u);
  if (id === "s3" || id === "s4" || id === "s5") return 0;
  if (id === "s6") return sm(0, 0.9, u);
  return 0.55;
}
function rolled(t) { let s = 0; for (let k = 0; k < t; k += 1 / 60) s += speed(k) * 620 / 60; return s; }

function sky(off, light) {
  const g = x.createLinearGradient(0, 0, 0, ROAD); g.addColorStop(0, "#3f8fa6"); g.addColorStop(1, "#7cc3c9");
  x.fillStyle = g; x.fillRect(-400, -400, 1900, ROAD + 400);
  // sun with paper rays
  x.save(); x.translate(150, 560); x.rotate(off * 0.0006);
  for (let i = 0; i < 10; i++) { x.rotate(Math.PI / 5); paper(() => { x.beginPath(); x.moveTo(-14, -95); x.lineTo(0, -140 - 14 * light); x.lineTo(14, -95); x.closePath(); }, "#ffd34d", { sh: 0.5, j: 40 + i }); }
  x.restore();
  paper(() => { x.beginPath(); x.arc(150, 560, 78 + 6 * light, 0, Math.PI * 2); }, "#ffd34d", { j: 39 });
  // far and near paper buildings (parallax)
  [[0.18, "#5f8f99", 260, 11], [0.42, "#4a7781", 170, 23]].forEach(([k, c, hmax, seed]) => {
    for (let i = -2; i < 10; i++) {
      const wdt = 150, X = ((i * wdt - off * k) % (wdt * 9) + wdt * 9) % (wdt * 9) - 250, hgt = 90 + hmax * rnd(seed + ((i % 9) + 9) % 9);
      paper(() => { x.beginPath(); x.rect(X, ROAD - hgt, wdt - 14, hgt + 10); }, c, { sh: 0.5, j: seed + i });
    }
  });
  // road
  x.fillStyle = "#3b3d45"; x.fillRect(-400, ROAD, 1900, 1200);
  paper(() => { x.beginPath(); x.rect(-400, ROAD - 4, 1900, 22); }, "#8b8f99", { sh: 0.4, j: 5 });
  for (let i = -2; i < 12; i++) { const X = ((i * 160 - off) % 1760 + 1760) % 1760 - 300; paper(() => { x.beginPath(); x.rect(X, 1290, 90, 16); }, "#e8e2d0", { sh: 0.4, j: 60 + i }); }
  for (let i = 0; i < 26; i++) { const X = ((i * 77 - off) % 1430 + 1430) % 1430 - 200; x.fillStyle = "rgba(255,255,255,0.08)"; x.fillRect(X, 1200 + 60 * rnd(i), 8, 5); }
}
function trafficLight(state) {
  paper(() => { x.beginPath(); x.rect(872, 700, 18, ROAD - 700); }, "#30343d", { j: 70 });
  paper(() => { rr(832, 520, 96, 230, 18); }, "#22252c", { j: 71 });
  [["#ff3b30", 0, 565], ["#ffc43d", 1, 635], ["#3dff8a", 2, 705]].forEach(([c, i, y]) => {
    const on = state === i;
    x.save(); if (on) { x.shadowColor = c; x.shadowBlur = 40; }
    x.fillStyle = on ? c : mix(c, "#22252c", 0.75); x.beginPath(); x.arc(880, y, 26, 0, Math.PI * 2); x.fill(); x.restore();
  });
}
function bikeBody(roll, heat) {
  // rear wheel
  const WC = [205, 1045];
  paper(() => { x.beginPath(); x.arc(WC[0], WC[1], 110, 0, Math.PI * 2); }, "#15161b", { j: 80 });
  x.save(); x.translate(WC[0], WC[1]); x.rotate(roll / 110);
  x.fillStyle = "#5a5f6b"; x.beginPath(); x.arc(0, 0, 74, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "#9aa0ab"; x.lineWidth = 9; for (let i = 0; i < 5; i++) { x.rotate((Math.PI * 2) / 5); x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 70); x.stroke(); }
  x.fillStyle = "#c9ced6"; x.beginPath(); x.arc(0, 0, 18, 0, Math.PI * 2); x.fill();
  x.restore();
  // fender, swingarm, frame
  paper(() => { x.beginPath(); x.arc(WC[0], WC[1], 128, Math.PI * 1.05, Math.PI * 1.75); x.arc(WC[0], WC[1], 112, Math.PI * 1.75, Math.PI * 1.05, true); x.closePath(); }, BIKE, { j: 81 });
  limb(WC, [560, 930], 34, "#3a4352", 82);
  limb([300, 640], WC, 26, "#3a4352", 83);
  // engine, tank, seat
  paper(() => rr(470, 700, 300, 220, 30), "#3b4250", { j: 84 });
  x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 6; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(500, 735 + i * 42); x.lineTo(740, 735 + i * 42); x.stroke(); }
  paper(() => { x.beginPath(); x.moveTo(560, 690); x.quadraticCurveTo(580, 560, 720, 560); x.lineTo(860, 575); x.quadraticCurveTo(900, 640, 870, 700); x.closePath(); }, BIKE, { j: 85 });
  paper(() => { x.beginPath(); x.moveTo(280, 640); x.quadraticCurveTo(300, 600, 360, 598); x.lineTo(580, 610); x.quadraticCurveTo(600, 640, 570, 652); x.lineTo(300, 660); x.closePath(); }, "#1b1d22", { j: 86 });
  // header + muffler (glows when hot)
  const pc = heat > 0 ? mix(METAL, "#ff4a2a", heat) : METAL;
  limb([560, 915], [628, 960], 30, pc, 87);
  paper(() => { x.save(); x.translate(440, 962); x.rotate(-0.05); rr(-190, -28, 380, 56, 26); x.restore(); }, pc, { j: 88 });
  if (heat > 0) {
    x.save(); x.globalAlpha = heat; x.shadowColor = "#ff4a2a"; x.shadowBlur = 40; x.fillStyle = rgba("#ff7a40", 0.35);
    x.save(); x.translate(440, 962); x.rotate(-0.05); rr(-190, -28, 380, 56, 26); x.fill(); x.restore(); x.restore();
  }
}
function heatWaves(a, tq) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = RED; x.lineWidth = 8; x.lineCap = "round";
  for (let i = 0; i < 4; i++) {
    const X0 = 320 + i * 80, ph = tq * 5 + i;
    x.beginPath(); for (let k = 0; k <= 10; k++) { const yy = 920 - k * 11 - (ph % 1) * 20; const xx = X0 + 10 * Math.sin(k * 0.9 + ph * 2); k ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke();
  }
  x.restore();
}
function pegAndLever(press, hi) {
  paper(() => rr(578, 896, 50, 20, 8), "#9aa0ab", { j: 90 });
  x.save(); x.translate(632, 940); x.rotate(-0.12 + 0.16 * press);
  paper(() => { rr(0, -8, 92, 16, 8); }, hi > 0 ? mix("#9aa0ab", GREEN, hi) : "#9aa0ab", { j: 91 });
  paper(() => { rr(74, -14, 26, 24, 8); }, hi > 0 ? mix("#7c828d", GREEN, hi) : "#7c828d", { j: 92 });
  x.restore();
}
// footwear in the foot frame (ankle at 0,0, toes along +x, sole at y=42)
function bareFoot() {
  paper(() => { x.beginPath(); x.moveTo(-30, -34); x.lineTo(-42, 26); x.quadraticCurveTo(-42, 42, -24, 42); x.lineTo(150, 42); x.quadraticCurveTo(170, 40, 162, 22); x.lineTo(118, 8); x.quadraticCurveTo(60, -14, 26, -36); x.closePath(); }, SKIN, { j: 100 });
  x.fillStyle = "#d99872"; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(150 - i * 14, 30 - i * 2, 8 - i, 0, Math.PI * 2); x.fill(); }
}
function flipFlop(dx, rot) {
  x.save(); x.translate(dx, 0); x.rotate(rot);
  paper(() => rr(-46, 42, 214, 13, 6), RED, { j: 101 });
  x.strokeStyle = mix(RED, INK, 0.25); x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.moveTo(118, 40); x.lineTo(60, 2); x.moveTo(118, 40); x.lineTo(40, 30); x.stroke();
  x.restore();
}
function bootFoot(tread, vents, tq) {
  paper(() => { x.beginPath(); x.moveTo(-44, -60); x.lineTo(40, -60); x.lineTo(44, -22); x.quadraticCurveTo(80, -14, 140, 6); x.quadraticCurveTo(178, 18, 172, 42); x.lineTo(-50, 42); x.closePath(); }, VIOLET, { j: 102 });
  paper(() => rr(-54, 40, 232, 22, 8), "#1c1a26", { j: 103 });
  if (tread > 0) { x.fillStyle = rgba(GREEN, tread); for (let i = 0; i < 9; i++) x.fillRect(-44 + i * 24, 56, 12, 8); }
  x.strokeStyle = "rgba(255,255,255,0.45)"; x.lineWidth = 5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(52 + i * 22, -10 + i * 6); x.lineTo(64 + i * 22, 2 + i * 6); x.stroke(); }
  if (vents > 0) {
    x.fillStyle = rgba(WHITE, 0.85 * vents); for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-24 + (i % 3) * 22, -40 + Math.floor(i / 3) * 22, 5, 0, Math.PI * 2); x.fill(); }
  }
}
function leg(pose, wear, o = {}) {
  const { slip = 0, slipRot = 0, tread = 0, vents = 0, ankleHi = 0, burn = 0, flipK = 1, tq = 0 } = o;
  const A = pose.A, K = knee(A);
  // jacket + thigh
  paper(() => { x.beginPath(); x.moveTo(372, 650); x.lineTo(560, 640); x.lineTo(548, 430); x.lineTo(392, 420); x.closePath(); }, JACKET, { j: 110 });
  limb(HIP, K, 96, wear === "boot" ? PANTS : SHORTS, 111);
  // shin + foot, flipped like a card when the footwear changes
  const sx = Math.abs(flipK) < 0.04 ? 0.04 : flipK;
  x.save(); x.translate(A[0], A[1]); x.scale(1, 1); x.translate(-A[0], -A[1]);
  limb(K, A, 74, wear === "boot" ? PANTS : SKIN, 112);
  if (burn > 0) {
    const B = L2(K, A, 0.55);
    x.save(); const g = x.createRadialGradient(B[0], B[1], 4, B[0], B[1], 60); g.addColorStop(0, rgba("#ff3020", 0.9 * burn)); g.addColorStop(1, rgba("#ff3020", 0)); x.fillStyle = g; x.beginPath(); x.arc(B[0], B[1], 60, 0, Math.PI * 2); x.fill(); x.restore();
  }
  if (wear === "boot") limb(A, L2(A, K, 0.42), 92, VIOLET, 113);
  x.save(); x.translate(A[0], A[1]); x.rotate(pose.r); x.scale(sx, 1);
  if (wear === "boot") bootFoot(tread, vents, tq);
  else { if (slip < 1) flipFlop(slip * 120, slipRot); bareFoot(); }
  x.restore();
  if (wear === "boot" && ankleHi > 0) { x.save(); x.globalAlpha = ankleHi; x.strokeStyle = GREEN; x.lineWidth = 10; x.setLineDash([18, 12]); x.beginPath(); x.ellipse(A[0] + 6, A[1] - 20, 78, 70, 0, 0, Math.PI * 2); x.stroke(); x.restore(); }
  x.restore();
  return { A, K };
}
function star(X, Y, s, c) {
  if (s <= 0) return;
  paper(() => { x.beginPath(); for (let i = 0; i < 16; i++) { const r = (i % 2 ? 26 : 62) * s, an = (i / 16) * Math.PI * 2; i ? x.lineTo(X + r * Math.cos(an), Y + r * Math.sin(an)) : x.moveTo(X + r * Math.cos(an), Y + r * Math.sin(an)); } x.closePath(); }, c, { j: 130 });
}
function airArrows(a, tq) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = GREEN; x.lineWidth = 9; x.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const ph = (tq * 1.4 + i / 3) % 1, X = 420 + ph * 380, Y = 1000 + i * 34;
    x.beginPath(); x.moveTo(X - 70, Y); x.lineTo(X, Y); x.moveTo(X - 16, Y - 14); x.lineTo(X, Y); x.lineTo(X - 16, Y + 14); x.stroke();
  }
  x.restore();
}

// camera per line (centre + zoom), eased in over 0.35 s at each line start, never a whip
const CAM = { s1: [540, 900, 1.0], s2: [590, 930, 1.06], s3: [620, 990, 1.18], s4: [590, 880, 1.12], s5a: [660, 1010, 1.12], s5b: [640, 900, 1.24], s6: [560, 900, 1.02], s7: [540, 900, 1.0], s8: [540, 900, 1.0] };
function camFor(id, u) {
  if (id === "s5") return u < at("s5", "protect") - 0.15 ? CAM.s5a : CAM.s5b;
  return CAM[id];
}

function frame(t) {
  const tq = Math.floor(t * 15 + 1e-6) / 15;   // stop-motion clock for everything that moves
  STEP = Math.round(tq * 15);
  const { id, u, d } = sceneOf(t);
  const uq = u - (t - tq);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);

  // camera: blend from the camera 0.35 s ago
  // smooth: average of the camera over the last 0.35 s
  let cam;
  { let ax = 0, ay = 0, az = 0, n = 0; for (let k = 0; k <= 7; k++) { const tt = Math.max(0, tq - k * 0.05), s = sceneOf(tt), cc = camFor(s.id, s.u); ax += cc[0]; ay += cc[1]; az += cc[2]; n++; } cam = [ax / n, ay / n, az / n]; }
  const push = 1 + 0.03 * cl(uq / Math.max(1, d));
  const Z = cam[2] * push;
  x.save(); x.translate(540, 900); x.scale(Z, Z); x.translate(-cam[0], -cam[1]);
  const S2 = (p) => [(p[0] - cam[0]) * Z + 540, (p[1] - cam[1]) * Z + 900];

  const off = rolled(tq);
  let light = 2, heat = 0, press = 0, leverHi = 0, sunK = 0;
  if (id === "s2") light = uq < at("s2", "foot") - 0.4 ? 1 : 0;
  if (id === "s3" || id === "s4" || id === "s5") light = 0;
  if (id === "s3") heat = sm(at("s3", "hot") - 0.2, at("s3", "pipe"), uq);
  if (id === "s6") sunK = flash(uq, at("s6", "hot")) ;
  if (id === "s5") { press = sm(at("s5", "gear") - 0.1, at("s5", "gear") + 0.15, uq); leverHi = sm(at("s5", "gear") - 0.2, at("s5", "gear"), uq); }

  sky(off, sunK);
  trafficLight(light);
  bikeBody(off, heat);
  if (id === "s3") heatWaves(sm(at("s3", "hot") - 0.1, at("s3", "pipe"), uq), tq);
  pegAndLever(press, leverHi);

  const L = [];
  if (id === "s1") {
    const Fl = at("s1", "flip");
    leg(PEG, "flip", { tq });
    L.push(() => { const p = S2([640, 980]); tag("FLIP-FLOPS", p[0], p[1] + 90, RED, sm(Fl - 0.1, Fl + 0.2, u)); });
  }
  if (id === "s2") {
    const Dn = at("s2", "down"), Sa = at("s2", "sandal"), Sl = at("s2", "slips");
    const k = sm(at("s2", "foot") - 0.1, Dn + 0.25, uq);
    const pose = { A: L2(PEG.A, DOWN.A, k), r: lerp(PEG.r, DOWN.r, k) };
    const slip = sm(Sl - 0.15, Sl + 0.25, uq);
    pose.A = [pose.A[0] + 6 * slip, pose.A[1] + 10 * slip];
    leg(pose, "flip", { slip: slip * 0.85, slipRot: 0.25 * slip, tq });
    L.push(() => { const p = S2([760, 1060]); tag("FOOT DOWN", p[0] - 170, p[1] - 330, RED, sm(Dn - 0.1, Dn + 0.2, u)); });
    L.push(() => { const p = S2([840, 1150]); tag("SLIPS", p[0], p[1] - 60, RED, sm(Sl - 0.1, Sl + 0.2, u)); });
    void Sa;
  }
  if (id === "s3") {
    const To = at("s3", "toes"), Hi = at("s3", "hit"), Bu = at("s3", "burns"), Le = at("s3", "leg");
    // the sandal lies on the road ahead
    x.save(); x.translate(870, ROAD - 14); x.rotate(0.05); paper(() => rr(-100, 0, 200, 13, 6), RED, { j: 140 }); x.restore();
    const k1 = sm(0, Hi, uq), k2 = sm(at("s3", "hot") - 0.1, Bu + 0.1, uq);
    const p1 = { A: L2(DOWN.A, TOEHIT.A, k1), r: lerp(DOWN.r, TOEHIT.r, k1) };
    const pose = { A: L2(p1.A, BURN.A, k2), r: lerp(p1.r, BURN.r, k2) };
    leg(pose, "flip", { slip: 1, burn: sm(Bu - 0.1, Bu + 0.15, uq), tq });
    const toe = [TOEHIT.A[0] + 150 * Math.cos(TOEHIT.r) - 42 * Math.sin(TOEHIT.r), TOEHIT.A[1] + 150 * Math.sin(TOEHIT.r) + 42 * Math.cos(TOEHIT.r)];
    star(toe[0] + 10, ROAD + 4, back(Hi - 0.05, Hi + 0.25, uq) * (1 - sm(Hi + 0.5, Hi + 0.8, uq)), "#ffd34d");
    L.push(() => { const p = S2(toe); tag("TOES", p[0], p[1] - 150, RED, sm(To - 0.05, To + 0.2, u) * (1 - sm(Bu - 0.2, Bu, u))); });
    L.push(() => { const p = S2([640, 960]); tag("BURN", p[0] - 220, p[1] - 220, RED, sm(Bu - 0.1, Bu + 0.2, u)); });
    L.push(() => stamp("x", 820, 1110, back(Le, Le + 0.3, u) * 0.6, RED));
    void Le;
  }
  if (id === "s4") {
    const Ri = at("s4", "riding"), Co = at("s4", "cover"), An = at("s4", "ankles");
    const fk = Math.cos(Math.PI * sm(0, 0.45, uq));                     // 1 -> -1: card flip
    const wear = fk > 0 ? "flip" : "boot";
    const k = sm(0, 0.4, uq);
    const pose = { A: L2(BURN.A, PEG.A, k), r: lerp(BURN.r, PEG.r, k) };
    leg(pose, wear, { slip: wear === "flip" ? 1 : 0, flipK: Math.abs(fk), ankleHi: sm(Co - 0.1, An, uq), tq });
    L.push(() => { const p = S2([600, 860]); tag("RIDING SHOES", p[0] + 90, p[1] + 230, VIOLET, sm(Ri - 0.1, Ri + 0.2, u)); });
    L.push(() => { const p = S2([560, 840]); tag("ANKLE COVERED", p[0] - 40, p[1] - 220, GREEN, sm(An - 0.15, An + 0.15, u)); });
  }
  if (id === "s5") {
    const Gr = at("s5", "grip"), Pr = at("s5", "protect"), Ge = at("s5", "gear");
    const kd = sm(0, 0.35, uq), ku = sm(Pr - 0.35, Pr, uq);
    const p1 = { A: L2(PEG.A, DOWN.A, kd), r: lerp(PEG.r, DOWN.r, kd) };
    const pose = { A: L2(p1.A, PEG.A, ku), r: lerp(p1.r, PEG.r, ku) + 0.06 * press };
    pose.A = [pose.A[0] + 4 * press, pose.A[1] + 6 * press];
    leg(pose, "boot", { tread: sm(Gr - 0.15, Gr + 0.1, uq), tq });
    if (uq < Pr) L.push(() => { const p = S2([760, 1150]); tag("HARD SOLE GRIPS", p[0] - 80, p[1] - 380, GREEN, sm(Gr - 0.1, Gr + 0.2, u) * (1 - sm(Pr - 0.3, Pr - 0.1, u))); });
    L.push(() => { const p = S2([700, 935]); tag("GEAR LEVER", p[0], p[1] + 170, GREEN, sm(Ge - 0.1, Ge + 0.2, u)); });
    L.push(() => { const p = S2([600, 860]); tag("PROTECTED", p[0] - 100, p[1] - 230, VIOLET, sm(Pr - 0.05, Pr + 0.2, u)); });
  }
  if (id === "s6") {
    const Li = at("s6", "light"), Br = at("s6", "breathe");
    leg(PEG, "boot", { vents: sm(Li - 0.1, Li + 0.2, uq), tq });
    airArrows(sm(Br - 0.3, Br, uq), tq);
    L.push(() => tag("LIGHT", 300, 1000, VIOLET, sm(Li - 0.1, Li + 0.2, u)));
    L.push(() => tag("BREATHES", 690, 1130, GREEN, sm(Br - 0.15, Br + 0.15, u)));
    L.push(() => stamp("v", 820, 700, back(Br + 0.15, Br + 0.45, u) * 0.6, GREEN));
  }
  if (id === "s7" || id === "s8") leg(PEG, "boot", { tq });
  x.restore();
  L.forEach((f) => f());

  if (id !== "s7" && id !== "s8") banner(["s1", "s2", "s3"].includes(id) ? RED : GREEN);
  if (id === "s1") words(["NEVER RIDE", "IN FLIP-FLOPS"], RED, 372, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "flip"))));
  if (id === "s2") words(["FOOT DOWN,", "SANDAL SLIPS"], RED, 372, 0.0, 1, 150, flash(u, at("s2", "slips")) * 0.6);
  if (id === "s3") words(["TOES HIT,", "PIPE BURNS"], RED, 372, 0.0, 1, 160, flash(u, at("s3", "burns")) * 0.6);
  if (id === "s4") words(["COVER", "YOUR ANKLES"], GREEN, 372, 0.0, 1, 160, flash(u, at("s4", "ankles")) * 0.6);
  if (id === "s5") words(["HARD SOLES", "THAT GRIP"], GREEN, 372, 0.0, 1, 160, flash(u, at("s5", "grip")) * 0.6);
  if (id === "s6") words(["LIGHT SHOES", "THAT BREATHE"], GREEN, 372, 0.0, 1, 150, flash(u, at("s6", "breathe")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(14,16,22,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["FEET MATTER."], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["BOOTS,", "EVERY RIDE."], ORANGE, 930, at("s7", "boots") - 0.05, 1, 160, flash(u, at("s7", "boots")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(14,16,22,0.88)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["flip-flops-paper"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
