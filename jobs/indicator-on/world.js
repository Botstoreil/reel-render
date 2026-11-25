// indicator-on (Apex 28, TikTok) - NIGHT DASHBOARD style: a glowing TFT screen in a bike's dash at night, the top half a
// top-down sat-nav map that follows the bike, the bottom strip the cluster (indicator lamps + the indicator switch).
// Wrong: the bike turns left, rides on still blinking left, a car waiting in a side street on the left thinks the bike
// is turning in and pulls out in front; hard stop. Right: check the switch after the turn, cancel it, the car waits,
// the bike passes; habit like the mirrors. Time only from hf-seek.
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
const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const RED = "#ff4d5e", GREEN = "#3dffa0", VIOLET = "#a98bff", ORANGE = "#ffa733", WHITE = "#f2f6ff", INK = "#060a14", AMBER = "#ffb300";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };
function glow(c, b, f) { x.save(); x.shadowColor = c; x.shadowBlur = b; f(); x.restore(); }

// ---------- text ----------
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
      x.shadowColor = color; x.shadowBlur = 18;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1200);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.fillStyle = "rgba(6,10,20,0.92)"; rr(-w / 2, -h / 2, w, h, 14); x.fill();
  glow(color, 20, () => { x.strokeStyle = color; x.lineWidth = 5; rr(-w / 2, -h / 2, w, h, 14); x.stroke(); });
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(6,10,20,0.9)"; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill();
  glow(c, 24, () => { x.strokeStyle = c; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 66, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 20; x.lineCap = "round"; x.beginPath();
    if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
    x.stroke(); });
  x.restore();
}

// ---------- map (world units = px) ----------
// main road vertical at x=0, bottom road horizontal at y=0, a side street joins the main road from the left at y=-900.
const RW = 80, SIDE = -900;
const R = 120, C = [-80 - 0, -80], L1 = 620, ARC = (Math.PI / 2) * R, X0 = -700;
function along(s) {
  if (s < L1) return { X: X0 + s, Y: 40, h: 0 };
  if (s < L1 + ARC) { const th = (s - L1) / R; return { X: C[0] + R * Math.sin(th), Y: C[1] + R * Math.cos(th), h: -th }; }
  return { X: 40, Y: -80 - (s - L1 - ARC), h: -Math.PI / 2 };
}
const yToS = (Y) => L1 + ARC + (-80 - Y);
// the car: waits in the side street (heading east), pulls out turning left onto the main road (heading north)
const CR = 210, CC = [-170, SIDE + 40 - CR];
function carAt(k) {   // 0 = waiting at the line, 1 = merged in front of the bike
  const th = k * (Math.PI / 2);
  if (k <= 0) return { X: -170, Y: SIDE + 40, h: 0 };
  return { X: CC[0] + CR * Math.sin(th), Y: CC[1] + CR * Math.cos(th), h: -th };
}
const inRoad = (X, Y, m = 0) => Math.abs(X) < RW + m || (Math.abs(Y) < RW + m) || (Math.abs(Y - SIDE) < RW + m && X < 0);
function map(cam, t) {
  x.fillStyle = "#0b1122"; x.fillRect(cam[0] - 900, cam[1] - 900, 1800, 1800);
  // blocks with lit windows
  const B = 230;
  for (let i = Math.floor((cam[0] - 700) / B); i <= Math.floor((cam[0] + 700) / B); i++) for (let j = Math.floor((cam[1] - 700) / B); j <= Math.floor((cam[1] + 700) / B); j++) {
    const bx = i * B + 15, by = j * B + 15, bw = B - 30, bh = B - 30;
    let hit = false; for (let a = 0; a <= 4 && !hit; a++) for (let b = 0; b <= 4 && !hit; b++) if (inRoad(bx + (bw * a) / 4, by + (bh * b) / 4, 22)) hit = true;
    if (hit) continue;
    x.fillStyle = "#18213a"; rr(bx, by, bw, bh, 14); x.fill();
    x.strokeStyle = "rgba(120,150,255,0.18)"; x.lineWidth = 3; rr(bx, by, bw, bh, 14); x.stroke();
    for (let k = 0; k < 6; k++) { const r = rnd(i * 31 + j * 17 + k); if (r < 0.55) continue; x.fillStyle = r > 0.85 ? "rgba(255,210,120,0.55)" : "rgba(150,190,255,0.35)"; x.fillRect(bx + 20 + (k % 3) * 55, by + 30 + Math.floor(k / 3) * 70, 30, 34); }
  }
  // roads
  x.fillStyle = "#232a3d";
  x.fillRect(-RW, cam[1] - 900, RW * 2, 1800);
  x.fillRect(cam[0] - 900, -RW, 1800, RW * 2);
  x.fillRect(cam[0] - 900, SIDE - RW, Math.max(0, -RW - cam[0] + 900 + 2), RW * 2);
  // centre dashes
  x.save(); x.strokeStyle = "rgba(240,240,255,0.55)"; x.lineWidth = 6; x.setLineDash([40, 40]);
  x.beginPath(); x.moveTo(0, cam[1] + 900); x.lineTo(0, RW); x.moveTo(0, -RW); x.lineTo(0, SIDE + RW); x.moveTo(0, SIDE - RW); x.lineTo(0, cam[1] - 900);
  x.moveTo(cam[0] - 900, 0); x.lineTo(-RW, 0); x.moveTo(RW, 0); x.lineTo(cam[0] + 900, 0);
  x.moveTo(cam[0] - 900, SIDE); x.lineTo(-RW, SIDE); x.stroke(); x.restore();
  // stop line of the side street
  x.fillStyle = "rgba(240,240,255,0.8)"; x.fillRect(-RW - 16, SIDE, 12, RW);
}
function bikeIcon(p, c, blinkOn, brake = 0) {
  x.save(); x.translate(p.X, p.Y); x.rotate(p.h);   // heading along +x
  // headlight cone
  const g = x.createLinearGradient(30, 0, 330, 0); g.addColorStop(0, "rgba(255,250,220,0.35)"); g.addColorStop(1, "rgba(255,250,220,0)");
  x.fillStyle = g; x.beginPath(); x.moveTo(40, 0); x.lineTo(330, -90); x.lineTo(330, 90); x.closePath(); x.fill();
  glow(c, 26, () => { x.fillStyle = c; rr(-56, -20, 112, 40, 18); x.fill(); });
  x.fillStyle = INK; rr(-24, -12, 44, 24, 10); x.fill();
  x.strokeStyle = c; x.lineWidth = 8; x.lineCap = "round"; x.beginPath(); x.moveTo(36, -38); x.lineTo(36, 38); x.stroke();   // bars
  if (brake > 0) glow(RED, 30, () => { x.fillStyle = rgba(RED, brake); x.fillRect(-62, -12, 10, 24); });
  if (blinkOn) glow(AMBER, 34, () => { x.fillStyle = AMBER; x.beginPath(); x.arc(40, -42, 11, 0, Math.PI * 2); x.arc(-52, -26, 10, 0, Math.PI * 2); x.fill(); });
  x.restore();
}
function carIcon(p, c, a = 1) {
  if (a <= 0) return;
  x.save(); x.translate(p.X, p.Y); x.rotate(p.h); x.globalAlpha = a;
  const g = x.createLinearGradient(80, 0, 360, 0); g.addColorStop(0, "rgba(255,250,220,0.3)"); g.addColorStop(1, "rgba(255,250,220,0)");
  x.fillStyle = g; x.beginPath(); x.moveTo(80, -30); x.lineTo(360, -110); x.lineTo(360, 110); x.lineTo(80, 30); x.closePath(); x.fill();
  glow(c, 26, () => { x.fillStyle = c; rr(-85, -45, 170, 90, 22); x.fill(); });
  x.fillStyle = "rgba(6,10,20,0.75)"; rr(-30, -36, 70, 72, 12); x.fill();
  x.restore();
}

// ---------- dash cluster (screen space) ----------
function arrowLamp(X, Y, dir, on) {
  x.save(); x.translate(X, Y); x.scale(dir, 1);
  x.beginPath(); x.moveTo(-48, 0); x.lineTo(-4, -40); x.lineTo(-4, -18); x.lineTo(46, -18); x.lineTo(46, 18); x.lineTo(-4, 18); x.lineTo(-4, 40); x.closePath();
  if (on) glow(AMBER, 40, () => { x.fillStyle = AMBER; x.fill(); }); else { x.fillStyle = "#2a2f3d"; x.fill(); }
  x.restore();
}
function switchPic(X, Y, pos, hi, a = 1) {   // pos: -1 left on, 0 centre (off); hi = highlight colour amount
  x.save(); x.translate(X, Y); x.globalAlpha = a;
  const c = hi > 0 ? mix("#8a93ad", GREEN, hi) : "#8a93ad";
  x.strokeStyle = c; x.lineWidth = 6; rr(-110, -34, 220, 68, 34); x.stroke();
  x.fillStyle = "rgba(255,255,255,0.08)"; rr(-110, -34, 220, 68, 34); x.fill();
  if (hi > 0) glow(GREEN, 30 * hi, () => { x.strokeStyle = rgba(GREEN, hi); x.lineWidth = 6; rr(-110, -34, 220, 68, 34); x.stroke(); });
  const kx = pos * 62;
  x.fillStyle = c; x.beginPath(); x.arc(kx, 0, 26, 0, Math.PI * 2); x.fill();
  x.restore();
}
function mirrorPic(X, Y, ok, a) {
  if (a <= 0) return;
  x.save(); x.translate(X, Y); x.globalAlpha = a;
  x.strokeStyle = "#8a93ad"; x.lineWidth = 8; x.beginPath(); x.moveTo(0, 30); x.lineTo(-10, 0); x.stroke();
  x.fillStyle = "#8a93ad"; x.beginPath(); x.ellipse(-20, -22, 40, 26, -0.3, 0, Math.PI * 2); x.fill();
  if (ok > 0) glow(GREEN, 20, () => { x.strokeStyle = GREEN; x.lineWidth = 10; x.lineCap = "round"; x.globalAlpha = a * ok; x.beginPath(); x.moveTo(30, -10); x.lineTo(44, 6); x.lineTo(72, -26); x.stroke(); });
  x.restore();
}

// the TFT screen
const SX0 = 90, SY0 = 560, SW = 840, SH = 640, MAPH = 470;
function bezel() {
  x.fillStyle = "#04060d"; x.fillRect(0, 0, 1080, 1920);
  const vg = x.createRadialGradient(540, 880, 200, 540, 880, 1100); vg.addColorStop(0, "rgba(40,60,120,0.35)"); vg.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = vg; x.fillRect(0, 0, 1080, 1920);
  x.fillStyle = "#0d111c"; rr(SX0 - 30, SY0 - 30, SW + 60, SH + 60, 46); x.fill();
  glow("#3a6bff", 30, () => { x.strokeStyle = "rgba(90,130,255,0.55)"; x.lineWidth = 4; rr(SX0 - 30, SY0 - 30, SW + 60, SH + 60, 46); x.stroke(); });
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  bezel();

  const blink = (t * 1.6) % 1 < 0.5;
  let s = 0, ind = true, car = 0, brake = 0, bikeC = RED, carC = RED, sw = -1, swHi = 0, carA = 1;
  const yJ = yToS(SIDE + 40 + 240);       // bike position when the car pulls out
  if (id === "s1") s = lerp(260, L1 + ARC + 120, sm(-0.05, d, u));
  if (id === "s2") s = lerp(L1 + ARC + 120, yJ - 120, cl(u / d));
  if (id === "s3") {
    const Pu = at("s3", "pulls"), Fr = at("s3", "front");
    s = yJ - 120 + 120 * cl(u / Pu) + 110 * (1 - Math.pow(1 - sm(Pu, Fr + 0.25, u), 2));
    car = sm(Pu - 0.1, Fr + 0.2, u); brake = sm(Pu, Pu + 0.15, u);
  }
  if (id === "s4" || id === "s5" || id === "s6" || id === "s7" || id === "s8") { bikeC = VIOLET; carC = "#c9d2e6"; }
  if (id === "s4") { s = lerp(L1 + ARC + 60, L1 + ARC + 300, cl(u / d)); swHi = sm(at("s4", "switch") - 0.15, at("s4", "switch") + 0.1, u); }
  if (id === "s5") {
    const Ca = at("s5", "cancel");
    s = lerp(L1 + ARC + 300, yJ - 60, cl(u / d));
    const off = sm(Ca + 0.05, Ca + 0.25, u); sw = -1 + off; ind = off < 0.5; swHi = 1 - sm(Ca + 0.6, Ca + 1.2, u);
  }
  if (id === "s6") { s = lerp(yJ - 60, yJ + 520, sm(0, d + 0.4, u)); sw = 0; ind = false; }
  if (id === "s7" || id === "s8") { s = yJ + 600 + 200 * u; sw = 0; ind = false; carA = 1; }
  const bp = along(s);

  // map window (follows the bike, bike sits low in the window so the road ahead shows)
  const MZ = 1.3 + (id === "s3" ? 0.1 * sm(at("s3", "pulls") - 0.3, at("s3", "pulls") + 0.3, u) : 0);
  const cam = [bp.X + (id === "s1" ? -60 * (1 - sm(0, d, u)) : 0), bp.Y - 100];
  x.save(); rr(SX0, SY0, SW, MAPH, 30); x.clip();
  x.translate(SX0 + SW / 2, SY0 + MAPH / 2 + 40); x.scale(MZ, MZ); x.translate(-cam[0], -cam[1]);
  map(cam, t);
  // skid marks (s3)
  if (id === "s3" && brake > 0) { x.strokeStyle = rgba(RED, 0.6 * brake); x.lineWidth = 8; x.beginPath(); const a0 = along(yJ + 10); x.moveTo(a0.X - 6, a0.Y); x.lineTo(bp.X - 6, bp.Y + 50); x.stroke(); }
  carIcon(carAt(car), carC, carA);
  bikeIcon(bp, bikeC, ind && blink, brake);
  const toS = (p) => [SX0 + SW / 2 + (p.X - cam[0]) * MZ, SY0 + MAPH / 2 + 40 + (p.Y - cam[1]) * MZ];
  x.restore();
  // scan lines
  x.save(); x.globalAlpha = 0.06; x.fillStyle = "#000"; for (let yy = SY0; yy < SY0 + MAPH; yy += 6) x.fillRect(SX0, yy, SW, 2); x.restore();

  // cluster strip
  const CY = SY0 + MAPH + (SH - MAPH) / 2 + 4;
  x.fillStyle = "#070a13"; rr(SX0, SY0 + MAPH + 12, SW, SH - MAPH - 12, 30); x.fill();
  arrowLamp(SX0 + 110, CY, 1, ind && blink);
  arrowLamp(SX0 + SW - 110, CY, -1, false);
  switchPic(CX, CY, sw, swHi);

  const L = [];
  if (id === "s1") {
    const Bl = at("s1", "blinking"), In = at("s1", "indicator");
    L.push(() => tag("BLINKING", SX0 + 150, CY - 120, RED, sm(In - 0.1, In + 0.2, u)));
    void Bl;
  }
  if (id === "s2") {
    const St = at("s2", "still"), Lo = at("s2", "long");
    const bs = toS(bp);
    L.push(() => tag("STILL ON", bs[0] - 230, bs[1] - 40, RED, sm(St - 0.1, St + 0.2, u)));
    L.push(() => tag("LONG AFTER THE TURN", CX, 640, RED, sm(Lo - 0.1, Lo + 0.2, u)));
  }
  if (id === "s3") {
    const Th = at("s3", "thinks"), Pu = at("s3", "pulls"), Yo = at("s3", "you", 2);
    const cs = toS(carAt(car));
    L.push(() => tag("THINKS YOU TURN", cs[0] + 120, cs[1] - 120, RED, sm(Th - 0.1, Th + 0.2, u) * (1 - sm(Pu - 0.15, Pu - 0.02, u))));
    L.push(() => tag("PULLS OUT", cs[0] + 200, cs[1] - 120, RED, sm(Pu - 0.05, Pu + 0.2, u)));
    L.push(() => stamp("x", 780, 960, back(Yo - 0.1, Yo + 0.2, u) * 0.6, RED));
  }
  if (id === "s4") {
    const Sw = at("s4", "switch"), Ch = at("s4", "check");
    L.push(() => tag("CHECK", CX, CY - 110, GREEN, sm(Ch - 0.1, Ch + 0.2, u) * (1 - sm(Sw - 0.2, Sw, u))));
    L.push(() => tag("YOUR SWITCH", CX, CY - 110, GREEN, sm(Sw - 0.1, Sw + 0.2, u)));
  }
  if (id === "s5") {
    const Ca = at("s5", "cancel"), Do = at("s5", "done");
    const cs = toS(carAt(0));
    L.push(() => tag("OFF", CX, CY - 110, GREEN, sm(Ca + 0.05, Ca + 0.3, u)));
    L.push(() => tag("CAR WAITS", cs[0] + 130, cs[1] - 110, VIOLET, sm(Do - 0.4, Do - 0.1, u)));
  }
  if (id === "s6") {
    const Ha = at("s6", "habit"), Mi = at("s6", "mirrors");
    L.push(() => { mirrorPic(SX0 + 230, 700, sm(Mi - 0.1, Mi + 0.2, u), sm(Mi - 0.4, Mi - 0.1, u)); });
    L.push(() => tag("EVERY TURN", CX + 120, 700, GREEN, sm(Ha - 0.1, Ha + 0.2, u)));
    L.push(() => stamp("v", 780, 960, back(Mi + 0.1, Mi + 0.4, u) * 0.6, GREEN));
  }
  L.forEach((f) => f());

  if (id === "s1") words(["NEVER LEAVE", "YOUR INDICATOR ON"], RED, 380, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "indicator"))));
  if (id === "s2") words(["STILL", "SIGNALLING LEFT"], RED, 380, 0.0, 1, 150, flash(u, at("s2", "signalling")) * 0.6);
  if (id === "s3") words(["DRIVER", "PULLS OUT"], RED, 380, 0.0, 1, 170, flash(u, at("s3", "pulls")) * 0.6);
  if (id === "s4") words(["CHECK", "YOUR SWITCH"], GREEN, 380, 0.0, 1, 160, flash(u, at("s4", "switch")) * 0.6);
  if (id === "s5") words(["TURN DONE,", "CANCEL IT"], GREEN, 380, 0.0, 1, 160, flash(u, at("s5", "cancel")) * 0.6);
  if (id === "s6") words(["MAKE IT", "A HABIT"], GREEN, 380, 0.0, 1, 170, flash(u, at("s6", "habit")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(4,6,13,0.74)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["TURN DONE?"], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["INDICATOR", "OFF."], ORANGE, 930, at("s7", "indicator") - 0.05, 1, 170, flash(u, at("s7", "indicator")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(4,6,13,0.88)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["indicator-on-dash"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
