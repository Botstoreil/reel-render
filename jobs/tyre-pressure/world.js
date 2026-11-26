// tyre-pressure (Apex 30, TikTok) - RETRO PIXEL style: the whole picture is drawn on a 270x480 pixel canvas and blown up
// x4 with no smoothing (synthwave sky, pixel sun, pixel skyline), text drawn crisp on top. Wrong: a kick says "hard",
// the rider rides off, the gauge shows LOW, the bike turns slowly, the tread wears, the tyre heats up. Right: a gauge on
// both tyres once a week, check cold against the manual, add air until the needle sits in the green, cap back on.
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
const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const P = document.createElement("canvas"); P.width = 270; P.height = 480;
const p = P.getContext("2d");
const RED = "#ff4d5e", GREEN = "#3dffa0", VIOLET = "#a98bff", ORANGE = "#ffa733", WHITE = "#f2f6ff", INK = "#12051f", CYAN = "#5ff3ff", AMBER = "#ffb300", BLUE = "#6fb8ff";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], cl(k))).toString(16).padStart(2, "0")).join(""); }

// ---------- crisp text on top (full res) ----------
let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (830 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, q) => s + q * 1.06, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((q) => x.measureText(q).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.53;
    parts.forEach((q, i) => {
      const s0 = t0 + wi * 0.07, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      // pixel-step pop: snap the scale to 4 steps so it moves like a sprite
      const st = Math.round((0.5 + 0.5 * kk) * 8) / 8;
      x.save(); x.translate(Math.round(X + ws[i] / 2), Math.round(Y + (1 - kk) * 30)); x.scale(st, st); x.globalAlpha = a * o;
      x.lineWidth = Math.max(12, px * 0.16); x.strokeStyle = INK; x.strokeText(q, 0, 0);
      x.fillStyle = "#3a0d4a"; x.fillText(q, 8, 8);
      x.strokeText(q, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(q, 0, 0);
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
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = Math.round((0.7 + 0.3 * back(0, 1, a)) * 8) / 8;
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1360);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.fillStyle = "#3a0d4a"; x.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
  x.fillStyle = "rgba(18,5,31,0.95)"; x.fillRect(-w / 2, -h / 2, w, h);
  x.strokeStyle = color; x.lineWidth = 6; x.strokeRect(-w / 2, -h / 2, w, h);
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#3a0d4a"; x.fillRect(-72, -72, 160, 160);
  x.fillStyle = INK; x.fillRect(-80, -80, 160, 160);
  x.strokeStyle = c; x.lineWidth = 12; x.strokeRect(-68, -68, 136, 136);
  x.lineWidth = 22; x.lineCap = "square"; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke();
  x.restore();
}

// ---------- pixel helpers (low-res canvas) ----------
const px = (X, Y, w, h, c) => { p.fillStyle = c; p.fillRect(Math.round(X), Math.round(Y), w, h); };
function line(x0, y0, x1, y1, c, w = 2) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  p.fillStyle = c;
  for (let i = 0; i <= n; i++) p.fillRect(Math.round(lerp(x0, x1, i / n) - w / 2), Math.round(lerp(y0, y1, i / n) - w / 2), w, w);
}
function disc(cx, cy, r, c) { p.fillStyle = c; for (let dy = -r; dy <= r; dy++) { const h = Math.floor(Math.sqrt(r * r - dy * dy)); p.fillRect(Math.round(cx - h), Math.round(cy + dy), 2 * h + 1, 1); } }

// ---------- world ----------
const GY = 292;              // ground row (full res 1168)
const TY = 1192;             // tag row (full res)
function bg(t, dist) {
  const bands = ["#140a2c", "#1b0d38", "#241044", "#2f1450", "#3c185a", "#4b1c63", "#5e216b", "#742872"];
  bands.forEach((c, i) => px(0, i * 36.5, 270, 37, c));
  for (let i = 0; i < 40; i++) {
    const X = Math.floor(rnd(i) * 270), Y = Math.floor(rnd(i + 50) * 200);
    const tw = Math.sin(t * 3 + i * 1.7) > 0.3 ? "#f2f6ff" : "#8a74c9";
    px(X, Y, 1, 1, tw);
  }
  // pixel sun with synthwave stripes
  const sx = 150, sy = 236, sr = 46;
  for (let dy = -sr; dy <= 0; dy++) {
    const yy = sy + dy; if (dy > -18 && ((yy >> 1) % 3 === 0)) continue;
    const h = Math.floor(Math.sqrt(sr * sr - dy * dy));
    px(sx - h, yy, 2 * h + 1, 1, mix("#ffd24a", "#ff4d7a", (dy + sr) / sr));
  }
  // clouds drift
  for (let i = 0; i < 3; i++) {
    const X = ((i * 110 + t * 5) % 380) - 60, Y = 150 + i * 22;
    px(X, Y, 34, 3, "#8e3f8a"); px(X + 6, Y - 3, 20, 3, "#8e3f8a");
  }
  // skyline (parallax)
  for (let i = 0; i < 16; i++) {
    const w = 14 + Math.floor(rnd(i + 7) * 16), h = 18 + Math.floor(rnd(i + 21) * 46);
    const X = (((i * 26 - dist * 0.3) % 416) + 416) % 416 - 40;
    px(X, GY - h, w, h, "#1c0b30");
    for (let k = 0; k < h - 8; k += 7) if (rnd(i * 13 + k) > 0.55) px(X + 3 + (k % 2) * 5, GY - h + 4 + k, 2, 2, "#ffb347");
  }
  // road
  px(0, GY, 270, 2, "#ff5fd2");
  px(0, GY + 2, 270, 40, "#24123a");
  for (let X = -((dist) % 40); X < 270; X += 40) px(X, GY + 18, 20, 3, "#f2c94c");
  px(0, GY + 42, 270, 480 - GY - 42, "#160a26");
  for (let k = 0; k < 6; k++) px(0, GY + 50 + k * 14, 270, 1, "#2a1444");
}

// tyre: cx, ground row, radius, squash (px flattened), rotation, treadK (1 new..0 bald), heat (0..1), outline colour
function tyre(cx, gy, R, sq, rot, treadK = 1, heat = 0, edge = "#9b95b8") {
  const cy = gy - R + sq;
  const rub = mix("#3a3648", "#c8323f", heat * 0.7), blk = mix("#221f2c", "#7a1820", heat * 0.6);
  for (let dy = -R; dy <= R - sq; dy++) {
    for (let dx = -Math.ceil(R * 1.4); dx <= Math.ceil(R * 1.4); dx++) {
      const bot = Math.max(0, dy) / R, wide = 1 + (sq / R) * 1.6 * bot * bot;
      const d = Math.sqrt((dx / wide) * (dx / wide) + dy * dy);
      if (d > R) continue;
      const q = d / R, a = Math.atan2(dy, dx) + rot;
      let c;
      if (q > 0.95) c = (dx + dy < -R * 0.4) ? edge : "#0c0814";
      else if (q > 0.8) c = (Math.floor(((a / (Math.PI * 2)) * 28 + 100)) % 2 && treadK > 0.15 && rnd(Math.floor(a * 9)) < treadK + 0.2) ? blk : rub;
      else if (q > 0.62) c = rub;
      else if (q > 0.56) c = "#d9e1ee";
      else if (q > 0.16) { const sp = ((a / (Math.PI * 2)) * 5 % 1 + 1) % 1; c = sp < 0.12 ? "#a7b0c4" : "#170f25"; }
      else c = "#d9e1ee";
      px(cx + dx, cy + dy, 1, 1, c);
    }
  }
  return cy;
}
// dial gauge, v in 0..1 (low red < 0.5, green 0.5..0.72, amber above)
function gauge(cx, cy, R, v, ring, unknown, t) {
  disc(cx, cy, R + 3, ring);
  disc(cx, cy, R, "#120a20");
  const A0 = Math.PI * 0.8, A1 = Math.PI * 2.2;
  for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
    const d = Math.sqrt(dx * dx + dy * dy); if (d < R - 8 || d > R - 3) continue;
    let a = Math.atan2(dy, dx); if (a < A0 - 0.01) a += Math.PI * 2;
    const k = (a - A0) / (A1 - A0); if (k < 0 || k > 1) continue;
    px(cx + dx, cy + dy, 1, 1, k < 0.5 ? "#ff4d5e" : k < 0.72 ? "#3dffa0" : "#ffb300");
  }
  if (unknown) {
    const on = Math.floor(t * 4) % 2 === 0;
    if (on) { px(cx - 6, cy - 12, 12, 4, WHITE); px(cx + 4, cy - 10, 4, 10, WHITE); px(cx - 2, cy - 2, 6, 4, WHITE); px(cx - 2, cy + 2, 4, 6, WHITE); px(cx - 2, cy + 11, 4, 4, WHITE); }
    return;
  }
  const a = A0 + cl(v) * (A1 - A0);
  line(cx, cy, cx + Math.cos(a) * (R - 9), cy + Math.sin(a) * (R - 9), WHITE, 3);
  disc(cx, cy, 4, "#ff5fd2");
}
// side-view pixel bike facing right. c = body colour
function bike(bx, gy, c, sq, rot, riderA, heat = 0) {
  const R = 20, rx = bx - 40, fx = bx + 40;
  tyre(rx, gy, R, sq, rot, 1, heat); tyre(fx, gy, R, sq, rot, 1, heat);
  const hy = gy - R + sq;
  line(rx, hy, bx - 6, gy - 34, "#7d7896", 4);                 // swingarm
  line(bx + 26, gy - 66, fx, hy, "#a7b0c4", 4);                 // fork
  px(bx - 16, gy - 50, 30, 20, "#4a4560"); px(bx - 12, gy - 46, 22, 4, "#6d6788"); // engine
  line(bx - 10, gy - 34, bx - 50, gy - 40, "#8d8aa3", 4);       // exhaust
  px(bx - 14, gy - 66, 40, 14, c); px(bx - 6, gy - 70, 26, 4, c);   // tank
  px(bx - 40, gy - 64, 28, 6, "#1d1428");                       // seat
  px(bx - 54, gy - 62, 16, 5, c);                               // tail
  px(bx - 58, gy - 62, 4, 4, "#ff4d5e");                        // tail light
  px(bx + 26, gy - 66, 8, 8, "#ffe27a");                        // headlight
  line(bx + 22, gy - 70, bx + 16, gy - 80, "#d9e1ee", 3);       // bars
  if (riderA > 0) {
    const pc = "#2b2340", hc = c;
    line(bx - 24, gy - 64, bx - 2, gy - 62, pc, 6); line(bx - 2, gy - 62, bx - 4, gy - 42, pc, 5);  // leg
    line(bx - 22, gy - 66, bx - 4, gy - 98, pc, 8);                                                 // torso
    line(bx - 4, gy - 94, bx + 16, gy - 80, pc, 4);                                                 // arm
    disc(bx + 2, gy - 108, 9, hc); px(bx + 4, gy - 111, 8, 4, "#12051f");                           // helmet + visor
  }
}
function boot(X, Y) {   // a boot pointing left, toe at (X, Y)
  px(X + 14, Y - 70, 14, 60, "#2b2340");          // shin
  px(X, Y - 14, 30, 14, "#5a3a24"); px(X, Y - 2, 30, 4, "#2a1a10");
}
function heatWaves(cx, top, k, t) {
  if (k <= 0) return;
  for (let i = 0; i < 4; i++) for (let s = 0; s < 22; s++) {
    const ph = (t * 1.6 + i * 0.25) % 1, yy = top - s * 2 - ph * 14;
    if (rnd(i * 31 + s) > k) continue;
    px(cx - 36 + i * 24 + Math.round(Math.sin(s * 0.6 + t * 8 + i) * 3), yy, 2, 2, s % 3 ? "#ff7a3d" : "#ffd24a");
  }
}
function snowflake(cx, cy, c) { line(cx - 10, cy, cx + 10, cy, c, 3); line(cx, cy - 10, cx, cy + 10, c, 3); line(cx - 7, cy - 7, cx + 7, cy + 7, c, 2); line(cx - 7, cy + 7, cx + 7, cy - 7, c, 2); }
function thermo(cx, cy, lvl, c) { px(cx - 4, cy - 18, 8, 26, "#d9e1ee"); px(cx - 2, cy - 16, 4, 22, "#120a20"); px(cx - 2, cy + 6 - 22 * lvl, 4, 22 * lvl, c); disc(cx, cy + 10, 6, c); }
function calendar(cx, cy, ticks, c) {
  px(cx - 22, cy - 18, 44, 36, "#e9e4ff"); px(cx - 22, cy - 18, 44, 8, c);
  px(cx - 14, cy - 22, 3, 6, "#120a20"); px(cx + 11, cy - 22, 3, 6, "#120a20");
  for (let i = 0; i < 7; i++) { const X = cx - 19 + (i % 4) * 10, Y = cy - 6 + Math.floor(i / 4) * 11; px(X, Y, 8, 8, i < ticks ? c : "#b9b2d8"); }
}
function manual(cx, cy, c) {
  px(cx - 20, cy - 24, 40, 48, "#e9e4ff"); px(cx - 20, cy - 24, 6, 48, c);
  for (let k = 0; k < 4; k++) px(cx - 10, cy - 14 + k * 9, 24, 3, "#6d6788");
  px(cx - 10, cy + 13, 14, 4, c);
}
function arcArrow(cx, cy, k, c) {   // slow curve arrow over the bike
  const n = Math.floor(26 * k);
  for (let i = 0; i < n; i++) { const a = Math.PI * 1.15 + (i / 26) * Math.PI * 0.7; if (i % 4 < 3) px(cx + Math.cos(a) * 60, cy + Math.sin(a) * 26 + 26, 4, 4, c); }
  if (k > 0.95) { const a = Math.PI * 1.85, X = cx + Math.cos(a) * 60, Y = cy + Math.sin(a) * 26 + 26; px(X - 2, Y - 6, 6, 4, c); px(X + 2, Y - 2, 6, 4, c); px(X - 2, Y + 2, 6, 4, c); }
}

// close-up layout (low-res)
const TCX = 100, TR = 62, GX = 200, GYC = 222, GR = 34;
const valve = (cy) => [TCX + 26, cy - 26];
function hose(cy, c) {
  const [vx, vy] = valve(cy);
  for (let i = 0; i <= 30; i++) { const k = i / 30; const X = (1 - k) * (1 - k) * (GX - 26) + 2 * k * (1 - k) * (vx + 40) + k * k * (vx + 2); const Y = (1 - k) * (1 - k) * (GYC + 22) + 2 * k * (1 - k) * (vy - 50) + k * k * (vy - 8); px(X - 1, Y - 1, 3, 3, c); }
}

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const L = [];
  // shared state
  let mode = "close", dist = 0, sq = 3, treadK = 1, heat = 0, gv = 0.6, gShow = 0, gUnknown = false, ring = "#6d6788";
  let bx = 135, bikeC = "#ff4d5e", riderA = 1, bootK = -1, jig = 0, hoseK = 0, hoseC = "#6d6788", air = 0, capK = 1, pump = 0;
  let icon = null, arc = 0, waves = 0, rings = 0, okRing = 0;

  if (id === "s1") {
    const Fi = at("s1", "fine"), Pr = at("s1", "pressure"), Ey = at("s1", "eye");
    sq = 6; gShow = sm(Pr - 0.15, Pr + 0.1, u); gUnknown = true; ring = "#ff4d5e";
    L.push(() => tag("LOOKS FINE?", CX - 110, TY, RED, sm(Fi - 0.1, Fi + 0.2, u) * (1 - sm(Ey - 0.2, Ey, u))));
    L.push(() => tag("BY EYE?", CX - 110, TY, RED, sm(Ey - 0.1, Ey + 0.15, u)));
  }
  if (id === "s2") {
    const Ki = at("s2", "kick"), Ha = at("s2", "hard"), Ri = at("s2", "ride");
    sq = 6;
    const hit = Ki + 0.2;
    bootK = u < hit ? sm(Ki - 0.15, hit, u) : 1 - sm(hit + 0.1, hit + 0.5, u);
    jig = u > hit && u < hit + 0.3 ? (Math.floor(u * 30) % 2 ? 1 : -1) : 0;
    if (u >= Ri - 0.05) { mode = "ride"; const q = u - (Ri - 0.05); bx = 120 + 230 * q * q; dist = 200 * q * q; }
    L.push(() => tag("FEELS HARD", CX - 110, TY, RED, sm(Ha - 0.1, Ha + 0.2, u) * (u < Ri - 0.05 ? 1 : 0)));
    L.push(() => tag("RIDES OFF", CX, TY, RED, sm(Ri - 0.05, Ri + 0.2, u)));
  }
  if (id === "s3") {
    const Lo = at("s3", "low"), Tu = at("s3", "turns"), We = at("s3", "wears"), He = at("s3", "heats");
    sq = lerp(6, 15, sm(Lo - 0.1, Lo + 0.3, u)); gShow = 1; ring = "#ff4d5e"; gv = lerp(0.6, 0.22, sm(Lo - 0.1, Lo + 0.4, u));
    if (u >= Tu - 0.1 && u < We - 0.1) { mode = "ride"; bx = 135; dist = 400 + 18 * u; arc = sm(Tu, Tu + 1.0, u); }
    treadK = 1 - 0.85 * sm(We, We + 0.5, u); heat = sm(He - 0.05, He + 0.3, u); waves = heat;
    L.push(() => tag("LOW", CX - 110, TY, RED, sm(Lo - 0.05, Lo + 0.2, u) * (1 - sm(Tu - 0.2, Tu - 0.1, u))));
    L.push(() => tag("SLOW TURNS", CX, TY, RED, sm(Tu - 0.05, Tu + 0.2, u) * (1 - sm(We - 0.2, We - 0.1, u))));
    L.push(() => tag("WEARS + HEATS UP", CX - 60, TY, RED, sm(We - 0.05, We + 0.2, u)));
    L.push(() => stamp("x", 800, 600, back(He + 0.1, He + 0.4, u) * 0.7, RED));
  }
  if (["s4", "s5", "s6", "s7", "s8"].includes(id)) { bikeC = "#a98bff"; ring = "#3dffa0"; sq = 15; gv = 0.22; gShow = 1; hoseK = 1; hoseC = "#3dffa0"; }
  if (id === "s4") {
    const Ch = at("s4", "check"), Bo = at("s4", "both"), Ga = at("s4", "gauge"), We = at("s4", "week");
    gShow = sm(Ch - 0.1, Ch + 0.2, u); hoseK = 0;
    if (u >= Bo - 0.1 && u < Ga - 0.1) { mode = "ride"; bx = 135; riderA = 0; rings = sm(Bo - 0.1, Bo + 0.2, u); }
    if (u >= Ga - 0.1) hoseK = sm(Ga - 0.1, Ga + 0.2, u);
    if (u >= We - 0.15) icon = { k: "cal", a: back(We - 0.15, We + 0.15, u) };
    L.push(() => tag("USE A GAUGE", CX - 60, TY, GREEN, sm(Ch - 0.05, Ch + 0.2, u) * (1 - sm(Bo - 0.2, Bo - 0.1, u))));
    L.push(() => tag("BOTH TYRES", CX, TY, GREEN, sm(Bo - 0.05, Bo + 0.2, u) * (1 - sm(Ga - 0.2, Ga - 0.1, u))));
    L.push(() => tag("ONCE A WEEK", CX - 60, TY, GREEN, sm(We - 0.05, We + 0.2, u) + (u > Ga && u < We ? 0 : 0)));
  }
  if (id === "s5") {
    const Co = at("s5", "cold"), Be = at("s5", "before"), Nu = at("s5", "numbers");
    icon = u < Nu - 0.1 ? { k: "cold", a: back(Co - 0.15, Co + 0.15, u) } : { k: "book", a: back(Nu - 0.15, Nu + 0.15, u) };
    okRing = sm(Nu, Nu + 0.3, u);
    L.push(() => tag("CHECK COLD", CX - 60, TY, GREEN, sm(Co - 0.05, Co + 0.2, u) * (1 - sm(Be - 0.2, Be - 0.05, u))));
    L.push(() => tag("BEFORE YOU RIDE", CX - 40, TY, GREEN, sm(Be - 0.05, Be + 0.2, u) * (1 - sm(Nu - 0.2, Nu - 0.05, u))));
    L.push(() => tag("MATCH YOUR MANUAL", CX - 40, TY, VIOLET, sm(Nu - 0.05, Nu + 0.2, u)));
  }
  if (id === "s6") {
    const Ai = at("s6", "air"), Ri = at("s6", "right"), Re = at("s6", "refit"), Ca = at("s6", "caps");
    pump = 1; const fill = sm(Ai, Ri, u);
    sq = lerp(15, 3, fill); gv = lerp(0.22, 0.61, fill); air = u > Ai - 0.1 && u < Ri + 0.1 ? 1 : 0;
    capK = sm(Ca - 0.25, Ca + 0.05, u); hoseK = 1 - sm(Re - 0.2, Re, u);
    okRing = sm(Ri - 0.1, Ri + 0.2, u);
    L.push(() => tag("ADD AIR", CX - 60, TY, GREEN, sm(Ai - 0.05, Ai + 0.2, u) * (1 - sm(Ri - 0.2, Ri - 0.05, u))));
    L.push(() => tag("READS RIGHT", CX - 60, TY, GREEN, sm(Ri - 0.05, Ri + 0.2, u) * (1 - sm(Re - 0.2, Re - 0.05, u))));
    L.push(() => tag("CAP BACK ON", CX - 60, TY, GREEN, sm(Re - 0.05, Re + 0.2, u)));
    L.push(() => stamp("v", 800, 600, back(Ri, Ri + 0.3, u) * 0.7, GREEN));
  }
  if (id === "s7" || id === "s8") { mode = "ride"; bx = 135; sq = 3; dist = 600 + 70 * u; riderA = 1; }

  // ---------- draw the pixel picture ----------
  const rot = mode === "ride" ? -dist / 20 : 0;
  bg(t, dist);
  if (mode === "close") {
    const cy = tyre(TCX + jig, GY, TR, sq, 0.3, treadK, heat);
    heatWaves(TCX, cy - TR - 4, waves, t);
    const [vx, vy] = valve(cy);
    px(vx - 2, vy - 9, 5, 10, "#c9c9d6");                                   // valve stem
    if (capK > 0) px(vx - 3, vy - 13 - Math.round((1 - capK) * 18), 7, 5, "#1d1428");  // cap (falls on in s6)
    if (pump > 0) { px(GX - 14, GYC + 30, 28, GY - GYC - 30, "#3d2a5c"); px(GX - 14, GYC + 30, 28, 4, "#5a4380"); px(GX - 10, GY - 30, 20, 6, "#ff5fd2"); }
    if (hoseK > 0.5) hose(cy, hoseC);
    if (air > 0) for (let i = 0; i < 6; i++) {
      const k = ((t * 1.5 + i / 6) % 1), [hx2, hy2] = [lerp(GX - 26, vx + 2, k), lerp(GYC + 22, vy - 8, k) - Math.sin(k * Math.PI) * 30];
      px(hx2 - 2, hy2 - 2, 5, 5, CYAN);
    }
    if (gShow > 0.05) {
      const gy2 = GYC + Math.round((1 - gShow) * 300);
      gauge(GX, gy2, GR, gv + 0.01 * Math.sin(t * 9), ring, gUnknown, t);
      if (okRing > 0) for (let i = 0; i < 4; i++) { const a = Math.PI * 1.75 + i * 0.12; px(GX + Math.cos(a) * (GR + 9) - 2, GYC + Math.sin(a) * (GR + 9) - 2, 5, 5, GREEN); }
    }
    if (bootK >= 0) boot(TCX + TR + 2 + Math.round((1 - bootK) * 60), GY - 30);
  } else {
    bike(bx, GY, bikeC, mode === "ride" && id === "s3" ? 8 : sq * (20 / TR), rot, riderA, heat);
    if (arc > 0) arcArrow(bx + 10, 140, arc, "#ff4d5e");
    if (rings > 0) for (const wx of [bx - 40, bx + 40]) {
      const R = 26 + Math.round(3 * Math.sin(t * 10));
      for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; if (i % 2) px(wx + Math.cos(a) * R - 1, GY - 20 + Math.sin(a) * R - 1, 3, 3, GREEN); }
    }
  }
  if (icon && icon.a > 0) {
    const s = icon.a, cx = 200, cy = 158;
    p.save(); p.translate(cx, cy); p.scale(s, s); p.translate(-cx, -cy);
    if (icon.k === "cal") calendar(cx, cy, 1 + Math.floor(cl((t * 4) % 7, 0, 6)), GREEN);
    if (icon.k === "cold") { snowflake(cx - 14, cy, BLUE); thermo(cx + 14, cy, 0.25, BLUE); }
    if (icon.k === "book") manual(cx, cy, VIOLET);
    p.restore();
  }
  x.imageSmoothingEnabled = false;
  x.drawImage(P, 0, 0, 1080, 1920);
  // CRT scanlines
  x.fillStyle = "rgba(0,0,0,0.12)"; for (let Y = 0; Y < 1920; Y += 8) x.fillRect(0, Y, 1080, 3);

  L.forEach((f) => f());

  if (id === "s1") words(["NEVER GUESS", "YOUR TYRE PRESSURE"], RED, 400, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "guess"))));
  if (id === "s2") words(["IT FEELS", "HARD..."], RED, 400, 0.0, 1, 170, flash(u, at("s2", "hard")) * 0.6);
  if (id === "s3") words(["BUT IT", "IS LOW"], RED, 400, 0.0, 1, 170, flash(u, at("s3", "low")) * 0.6);
  if (id === "s4") words(["USE A", "GAUGE"], GREEN, 400, 0.0, 1, 170, flash(u, at("s4", "gauge")) * 0.6);
  if (id === "s5") words(["CHECK", "THEM COLD"], GREEN, 400, 0.0, 1, 170, flash(u, at("s5", "cold")) * 0.6);
  if (id === "s6") words(["ADD AIR", "TO THE NUMBER"], GREEN, 400, 0.0, 1, 150, flash(u, at("s6", "right")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(18,5,31,0.78)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["DON'T GUESS.", "USE A GAUGE."], ORANGE, 680, 0.0, 1, 150, flash(u, 0.05));
    words(["EVERY WEEK."], ORANGE, 1000, at("s7", "every") - 0.05, 1, 170, flash(u, at("s7", "every")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(18,5,31,0.9)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["tyre-pressure-pixel"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
