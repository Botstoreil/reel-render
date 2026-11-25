// tailgater (Apex 24, TikTok) - BLUEPRINT style: a technical drawing on blue grid paper, white line-art vehicles in side
// view, measured gaps drawn as dimension lines. Wrong: a car sits on your tail, you speed up and close the gap to the car
// in front; it brakes and you are squeezed. Right: open a bigger gap in front, tap the brake light early so the driver
// backs off, then (plan view) move over and let them pass. Time only from hf-seek.
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
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const RED = "#ff4a5a", GREEN = "#3ff08a", VIOLET = "#a78bff", ORANGE = "#ff9a2a", WHITE = "#ffffff", INK = "#06204a", LINE = "#e8f1ff";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const MONO = (px) => `700 ${px}px "JetBrains Mono", Menlo, monospace`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };

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
// a stamped label box (drafting style)
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 46, h = px * 1.55, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1200);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = color; x.fillRect(-w / 2, -h / 2, w, h);
  x.strokeStyle = WHITE; x.lineWidth = 3; x.strokeRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14);
  x.fillStyle = INK; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1200);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.strokeStyle = c; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.fillStyle = rgba(c, 0.25); x.fill();
  x.strokeStyle = c; x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- blueprint paper ----------
function paper(scroll) {
  x.fillStyle = "#0c3a78"; x.fillRect(-200, -200, 1480, 2400);
  const vg = x.createRadialGradient(540, 900, 200, 540, 900, 1300); vg.addColorStop(0, "rgba(40,110,200,0.35)"); vg.addColorStop(1, "rgba(0,10,40,0.5)");
  x.fillStyle = vg; x.fillRect(-200, -200, 1480, 2400);
  const o = ((-scroll % 40) + 40) % 40;
  for (let X = -40 + o; X < 1140; X += 40) { const major = Math.round((X - o) / 40) % 5 === 0; x.strokeStyle = `rgba(200,225,255,${major ? 0.16 : 0.07})`; x.lineWidth = major ? 2 : 1; x.beginPath(); x.moveTo(X, -200); x.lineTo(X, 2200); x.stroke(); }
  for (let Y = 0; Y < 2000; Y += 40) { const major = (Y / 40) % 5 === 0; x.strokeStyle = `rgba(200,225,255,${major ? 0.16 : 0.07})`; x.lineWidth = major ? 2 : 1; x.beginPath(); x.moveTo(-200, Y); x.lineTo(1280, Y); x.stroke(); }
  // title block, bottom-left corner like a real drawing sheet
  x.save(); x.strokeStyle = "rgba(220,235,255,0.35)"; x.lineWidth = 3; x.strokeRect(40, 40, 1000, 1840); x.restore();
}
const GY = 1000; // road line (side view)
function road(scroll) {
  x.strokeStyle = LINE; x.lineWidth = 6; x.beginPath(); x.moveTo(40, GY); x.lineTo(1040, GY); x.stroke();
  x.strokeStyle = "rgba(232,241,255,0.45)"; x.lineWidth = 3;
  const o = ((-scroll % 60) + 60) % 60;
  for (let X = 40 + o; X < 1040; X += 60) { x.beginPath(); x.moveTo(X, GY + 4); x.lineTo(X - 24, GY + 30); x.stroke(); }    // hatching under the road
}
function strokeFill(c, a = 0.14) { x.fillStyle = rgba(c, a); x.fill(); x.strokeStyle = c; x.lineWidth = 5; x.stroke(); }
// car in side view: (X = rear bumper, faces right), L length
function car(X, c, o = {}) {
  const { brake = 0, head = 0, L = 250, spin = 0 } = o;
  const H = 70, y0 = GY - 30;
  x.save(); x.lineJoin = "round";
  x.beginPath(); x.moveTo(X, y0); x.lineTo(X, y0 - H + 10); x.lineTo(X + L * 0.22, y0 - H); x.lineTo(X + L * 0.34, y0 - H - 52); x.lineTo(X + L * 0.72, y0 - H - 52);
  x.lineTo(X + L * 0.84, y0 - H); x.lineTo(X + L, y0 - H + 18); x.lineTo(X + L, y0); x.closePath(); strokeFill(c);
  x.beginPath(); x.moveTo(X + L * 0.38, y0 - H - 6); x.lineTo(X + L * 0.42, y0 - H - 44); x.lineTo(X + L * 0.54, y0 - H - 44); x.lineTo(X + L * 0.54, y0 - H - 6); x.closePath(); x.strokeStyle = c; x.lineWidth = 3; x.stroke();
  x.beginPath(); x.moveTo(X + L * 0.58, y0 - H - 6); x.lineTo(X + L * 0.58, y0 - H - 44); x.lineTo(X + L * 0.69, y0 - H - 44); x.lineTo(X + L * 0.78, y0 - H - 6); x.closePath(); x.stroke();
  for (const wx of [X + L * 0.2, X + L * 0.8]) {
    x.beginPath(); x.arc(wx, GY - 30, 30, 0, Math.PI * 2); strokeFill(c, 0.25);
    x.save(); x.translate(wx, GY - 30); x.rotate(spin); x.strokeStyle = c; x.lineWidth = 3; x.beginPath(); x.moveTo(-20, 0); x.lineTo(20, 0); x.moveTo(0, -20); x.lineTo(0, 20); x.stroke(); x.restore();
  }
  // brake light (rear) + headlight (front)
  x.fillStyle = brake > 0 ? "#ff2338" : rgba(c, 0.4); if (brake > 0) { x.shadowColor = "#ff2338"; x.shadowBlur = 50 * brake; }
  x.fillRect(X - 6, y0 - H + 12, 14, 24); x.shadowBlur = 0;
  if (head > 0) { const g = x.createLinearGradient(X + L, 0, X + L + 220, 0); g.addColorStop(0, `rgba(255,245,200,${0.6 * head})`); g.addColorStop(1, "rgba(255,245,200,0)");
    x.fillStyle = g; x.beginPath(); x.moveTo(X + L, y0 - H + 22); x.lineTo(X + L + 220, y0 - H - 20); x.lineTo(X + L + 220, y0 + 20); x.lineTo(X + L, y0 - 10); x.closePath(); x.fill(); }
  x.restore();
}
// motorcycle + rider, side view: X = rear tyre contact, faces right
const BL = 190;
function moto(X, c, o = {}) {
  const { brake = 0, spin = 0, lean = 0 } = o;
  const r = 34, wy = GY - r, ax = X + r, fx = X + BL - r;
  x.save(); x.lineJoin = "round"; x.lineCap = "round";
  for (const wx of [ax, fx]) { x.beginPath(); x.arc(wx, wy, r, 0, Math.PI * 2); strokeFill(c, 0.2);
    x.save(); x.translate(wx, wy); x.rotate(spin); x.strokeStyle = c; x.lineWidth = 3; x.beginPath(); x.moveTo(-r + 6, 0); x.lineTo(r - 6, 0); x.moveTo(0, -r + 6); x.lineTo(0, r - 6); x.stroke(); x.restore(); }
  x.strokeStyle = c; x.lineWidth = 6;
  x.beginPath(); x.moveTo(ax, wy); x.lineTo(X + 80, wy - 54); x.lineTo(X + 140, wy - 60); x.lineTo(fx, wy); x.stroke();          // frame
  x.beginPath(); x.moveTo(fx, wy); x.lineTo(fx - 24, wy - 86); x.stroke();                                                    // fork
  x.beginPath(); x.moveTo(X + 50, wy - 60); x.lineTo(X + 100, wy - 64); x.lineTo(X + 150, wy - 84); x.lineTo(X + 160, wy - 64); x.closePath(); strokeFill(c, 0.25); // tank+seat
  // tail light
  x.fillStyle = brake > 0 ? "#ff2338" : rgba(c, 0.5); if (brake > 0) { x.shadowColor = "#ff2338"; x.shadowBlur = 60 * brake; }
  x.fillRect(X + 14, wy - 72, 18, 14); x.shadowBlur = 0;
  if (brake > 0) { const g = x.createRadialGradient(X + 20, wy - 66, 4, X + 20, wy - 66, 120); g.addColorStop(0, `rgba(255,40,60,${0.55 * brake})`); g.addColorStop(1, "rgba(255,40,60,0)"); x.fillStyle = g; x.beginPath(); x.arc(X + 20, wy - 66, 120, 0, Math.PI * 2); x.fill(); }
  // rider
  x.save(); x.translate(X + 90, wy - 70); x.rotate(lean);
  x.strokeStyle = c; x.lineWidth = 16;
  x.beginPath(); x.moveTo(0, 0); x.lineTo(34, 40); x.lineTo(54, 52); x.stroke();     // leg
  x.beginPath(); x.moveTo(0, 0); x.lineTo(26, -78); x.stroke();                       // torso
  x.lineWidth = 12; x.beginPath(); x.moveTo(26, -70); x.lineTo(62, -40); x.lineTo(86, -20); x.stroke(); // arm to bars
  x.beginPath(); x.arc(36, -104, 30, 0, Math.PI * 2); strokeFill(c, 0.3);             // helmet
  x.restore();
  x.restore();
}
// dimension line with end ticks and a measured label
function dim(x1, x2, y, c, a, label) {
  if (a <= 0 || x2 - x1 < 2) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 4;
  x.beginPath(); x.moveTo(x1, y - 24); x.lineTo(x1, y + 24); x.moveTo(x2, y - 24); x.lineTo(x2, y + 24); x.moveTo(x1, y); x.lineTo(x2, y); x.stroke();
  const ah = Math.min(18, (x2 - x1) / 3);
  x.beginPath(); x.moveTo(x1, y); x.lineTo(x1 + ah, y - 10); x.lineTo(x1 + ah, y + 10); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(x2, y); x.lineTo(x2 - ah, y - 10); x.lineTo(x2 - ah, y + 10); x.closePath(); x.fill();
  if (label) { x.font = MONO(34); x.textAlign = "center"; x.textBaseline = "bottom"; x.fillText(label, cl((x1 + x2) / 2, 120, 900), y - 14); }
  x.restore();
}
function speedLines(X, a) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = LINE; x.lineWidth = 4; x.lineCap = "round"; for (let i = 0; i < 4; i++) { const y = GY - 40 - i * 34; x.beginPath(); x.moveTo(X - 30 - i * 14, y); x.lineTo(X - 110 - i * 14, y); x.stroke(); } x.restore(); }

// lay out rear car | gapR | bike | gapF | front car, fitted to the safe width
function layout(gapR, gapF) {
  const tot = 250 + gapR + BL + gapF + 250, s = Math.min(1, 860 / tot), x0 = 540 - (tot * s) / 2 - 30;
  return { s, x0, R: 0, B: 250 + gapR, F: 250 + gapR + BL + gapF };
}
function sideScene(t, id, u, o) {
  const { gapR, gapF, rc = RED, bc = RED, fc = LINE, rb = 0, bb = 0, fb = 0, head = 1, fast = 0 } = o;
  const Lx = layout(gapR, gapF);
  paper(t * (300 + 400 * fast));
  x.save(); x.translate(Lx.x0, GY); x.scale(Lx.s, Lx.s); x.translate(0, -GY);
  road(t * (300 + 400 * fast));
  const spin = t * 9;
  car(Lx.R, rc, { head, spin, brake: rb });
  moto(Lx.B, bc, { brake: bb, spin });
  speedLines(Lx.B, fast);
  car(Lx.F, fc, { brake: fb, spin });
  x.restore();
  const sx = (v) => Lx.x0 + v * Lx.s;
  return { sx, Lx };
}

// plan view for s6: two lanes from above, the bike moves over and the car goes by
function planScene(t, u, mv, ps) {
  paper(0);
  const LL = 300, LR = 800, MID = 550;
  x.save();
  x.strokeStyle = LINE; x.lineWidth = 6; x.beginPath(); x.moveTo(LL, 150); x.lineTo(LL, 1500); x.moveTo(LR, 150); x.lineTo(LR, 1500); x.stroke();
  x.setLineDash([50, 40]); x.lineDashOffset = -t * 500; x.lineWidth = 5; x.beginPath(); x.moveTo(MID, 150); x.lineTo(MID, 1500); x.stroke(); x.setLineDash([]);
  // bike: lane 1 centre 425 -> lane 2 centre 675
  const bx = lerp(425, 675, mv), by = 930;
  x.save(); x.translate(bx, by); x.rotate(0.25 * Math.sin(Math.PI * mv));
  rr(-26, -85, 52, 170, 24); strokeFill(VIOLET, 0.3); x.beginPath(); x.arc(0, -5, 30, 0, Math.PI * 2); strokeFill(VIOLET, 0.35);
  x.strokeStyle = VIOLET; x.lineWidth = 6; x.beginPath(); x.moveTo(-60, -60); x.lineTo(60, -60); x.stroke();
  x.restore();
  // car: starts behind in lane 1, then goes past
  const cy = lerp(1330, 380, ps);
  x.save(); x.translate(425, cy);
  rr(-62, -125, 124, 250, 30); strokeFill(RED, 0.18);
  x.strokeStyle = RED; x.lineWidth = 3; rr(-46, -70, 92, 60, 10); x.stroke(); rr(-46, 30, 92, 50, 10); x.stroke();
  x.restore();
  x.restore();
  return { bx, by, cy };
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  const L = [];

  if (id === "s1") {
    const Ta = at("s1", "tail"), Sp = at("s1", "speed");
    const gR = lerp(140, 26, sm(0, Ta + 0.2, u));
    const { sx, Lx } = sideScene(t, id, u, { gapR: gR, gapF: 230, head: 1 });
    L.push(() => dim(sx(Lx.R + 250), sx(Lx.B), 1110, RED, sm(Ta - 0.1, Ta + 0.2, u), "TOO CLOSE"));
    L.push(() => tag("TAILGATER", sx(Lx.R + 125), 700, RED, sm(at("s1", "car") - 0.05, at("s1", "car") + 0.25, u)));
    L.push(() => tag("SPEED UP?", sx(Lx.B + 95), 600, ORANGE, sm(Sp - 0.1, Sp + 0.2, u)));
  }
  if (id === "s2") {
    const Tw = at("s2", "twist"), Cl = at("s2", "close"), Fr = at("s2", "front");
    const k = sm(Tw, Fr + 0.2, u);
    const { sx, Lx } = sideScene(t, id, u, { gapR: 30, gapF: lerp(230, 30, k), fast: sm(Tw - 0.1, Tw + 0.2, u) });
    L.push(() => dim(sx(Lx.B + BL), sx(Lx.F), 1110, RED, sm(Cl - 0.2, Cl + 0.1, u), "GAP"));
    L.push(() => tag("THROTTLE", 300, 640, RED, sm(Tw - 0.1, Tw + 0.2, u)));
    L.push(() => tag("GAP SHRINKS", 700, 1190, RED, sm(Cl - 0.1, Cl + 0.2, u)));
  }
  if (id === "s3") {
    const Br = at("s3", "brakes"), Sq = at("s3", "squeezed"), No = at("s3", "nowhere");
    const sq = sm(Sq - 0.1, Sq + 0.3, u);
    const { sx, Lx } = sideScene(t, id, u, { gapR: lerp(30, 4, sq), gapF: lerp(30, 4, sq), fb: sm(Br - 0.1, Br + 0.1, u) * (0.75 + 0.25 * Math.sin(u * 20)), bb: sm(Br, Br + 0.2, u) });
    // squeeze arrows from both sides
    if (sq > 0) { x.save(); x.globalAlpha = sq; x.fillStyle = RED; x.strokeStyle = RED; x.lineWidth = 12;
      const bc = sx(Lx.B + BL / 2);
      for (const s of [-1, 1]) { const X0 = bc + s * (260 - 60 * sq); x.beginPath(); x.moveTo(X0 + s * 80, 760); x.lineTo(X0, 760); x.stroke(); x.beginPath(); x.moveTo(X0 - s * 6, 760); x.lineTo(X0 + s * 34, 730); x.lineTo(X0 + s * 34, 790); x.closePath(); x.fill(); }
      x.restore(); }
    L.push(() => tag("CAR BRAKES", 700, 620, RED, sm(Br - 0.1, Br + 0.2, u)));
    L.push(() => tag("SQUEEZED", 300, 1190, RED, sm(Sq - 0.1, Sq + 0.2, u)));
    L.push(() => mark("x", 820, 1140, back(No, No + 0.3, u) * 0.5, u > No - 0.05 ? 1 : 0, RED));
  }
  if (id === "s4") {
    const Bi = at("s4", "bigger"), Sm = at("s4", "smaller");
    const k = sm(Bi - 0.3, Bi + 0.6, u);
    const { sx, Lx } = sideScene(t, id, u, { gapR: 40, gapF: lerp(80, 380, k), rc: RED, bc: VIOLET, fc: LINE });
    L.push(() => dim(sx(Lx.B + BL), sx(Lx.F), 1110, GREEN, sm(Bi - 0.2, Bi + 0.1, u), "BIG GAP"));
    L.push(() => tag("MORE ROOM AHEAD", 540, 620, GREEN, sm(at("s4", "front") - 0.1, at("s4", "front") + 0.2, u)));
    L.push(() => mark("v", 820, 1180, back(Sm, Sm + 0.3, u) * 0.45, u > Sm - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s5") {
    const Ta = at("s5", "tap"), Ea = at("s5", "early"), Se = at("s5", "sees");
    const taps = (Math.max(0, Math.sin((u - Ta) * 16)) > 0.2 && u > Ta && u < Ea + 0.5) ? 1 : 0;
    const back_ = sm(Se - 0.1, Se + 0.6, u);
    const { sx, Lx } = sideScene(t, id, u, { gapR: lerp(40, 190, back_), gapF: 380, rc: RED, bc: VIOLET, fc: LINE, bb: taps });
    L.push(() => tag("TAP TAP", sx(Lx.B + 60), 680, VIOLET, sm(Ta - 0.1, Ta + 0.2, u)));
    L.push(() => dim(sx(Lx.R + 250), sx(Lx.B), 1110, GREEN, sm(Se - 0.1, Se + 0.3, u), "BACKS OFF"));
    L.push(() => tag("DRIVER SEES YOU", 540, 1200, GREEN, sm(at("s5", "driver") - 0.1, at("s5", "driver") + 0.2, u)));
  }
  if (id === "s6") {
    const Sa = at("s6", "safe"), Mo = at("s6", "move"), Pa = at("s6", "pass");
    const mv = sm(Mo - 0.1, Mo + 0.5, u), ps = sm(Mo + 0.3, d + 0.2, u);
    const p = planScene(t, u, mv, ps);
    L.push(() => tag("MOVE OVER", 760, 1200, GREEN, sm(Mo - 0.1, Mo + 0.2, u)));
    L.push(() => tag("LET THEM PASS", 540, 600, VIOLET, sm(Pa - 0.2, Pa + 0.1, u)));
    L.push(() => tag("SAFE?", 200, 1200, VIOLET, sm(Sa - 0.2, Sa + 0.1, u) * (1 - sm(Mo + 0.2, Mo + 0.4, u))));
  }
  if (id === "s7" || id === "s8") { planScene(t, u, 1, 1); }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER SPEED UP", "FOR A TAILGATER"], RED, 330, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "speed"))));
  if (id === "s2") words(["YOU CLOSE", "THE GAP"], RED, 330, 0.0, 1, 170, flash(u, at("s2", "gap")) * 0.6);
  if (id === "s3") words(["NOWHERE", "TO GO"], RED, 330, 0.0, 1, 170, flash(u, at("s3", "nowhere")) * 0.6);
  if (id === "s4") words(["BIGGER GAP", "IN FRONT"], GREEN, 330, 0.0, 1, 160, flash(u, at("s4", "bigger")) * 0.6);
  if (id === "s5") words(["TAP YOUR", "BRAKE LIGHT"], GREEN, 330, 0.0, 1, 160, flash(u, at("s5", "tap")) * 0.6);
  if (id === "s6") words(["LET THEM", "PASS"], GREEN, 330, 0.0, 1, 170, flash(u, at("s6", "pass")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(4,20,50,0.68)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["DON'T RACE", "THE TAILGATER."], ORANGE, 560, 0.0, 1, 150, flash(u, 0.05));
    words(["LET THEM", "GO."], ORANGE, 930, at("s7", "let") - 0.05, 1, 170, flash(u, at("s7", "let")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(4,20,50,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 600); x.scale(k * 0.9, k * 0.9); x.translate(-95, -GY + 60); moto(0, VIOLET, { spin: t * 6 }); x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["tailgater-blueprint"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
