// dark-visor (Apex 31, TikTok) - HELMET POV style: we look out through the rider's eyeport (helmet rim, bars and a
// glowing speedo at the bottom) at a road in perspective. Wrong: a tinted visor at sunset, the light fades, the road
// goes black and a pothole hides in it until it is too late. Right: a clear visor or a drop-down sun shade, pull over
// before sunset and swap, and at night the clear visor plus the headlight show the road, the edges and the potholes.
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
const D = document.createElement("canvas"); D.width = 1080; D.height = 1920;
const d = D.getContext("2d");
const RED = "#ff4d5e", GREEN = "#3dffa0", VIOLET = "#a98bff", ORANGE = "#ffa733", WHITE = "#f2f6ff", INK = "#0b0a14";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], cl(k))).toString(16).padStart(2, "0")).join(""); }
function rr(c, X, Y, w, h, r, keep = false) { if (!keep) c.beginPath(); c.moveTo(X + r, Y); c.arcTo(X + w, Y, X + w, Y + h, r); c.arcTo(X + w, Y + h, X, Y + h, r); c.arcTo(X, Y + h, X, Y, r); c.arcTo(X, Y, X + w, Y, r); c.closePath(); }

// ---------- text ----------
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
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - kk) * 30); x.scale(0.5 + 0.5 * kk, 0.5 + 0.5 * kk); x.globalAlpha = a * o;
      x.lineWidth = Math.max(12, px * 0.16); x.strokeStyle = INK; x.strokeText(q, 0, 0);
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
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1360);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  rr(x, -w / 2, -h / 2, w, h, 18); x.fillStyle = "rgba(11,10,20,0.92)"; x.fill();
  x.strokeStyle = color; x.lineWidth = 5; x.stroke();
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fillStyle = INK; x.fill();
  x.strokeStyle = c; x.lineWidth = 12; x.stroke();
  x.lineWidth = 20; x.lineCap = "round"; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke();
  x.restore();
}

// ---------- the world through the eyeport ----------
const HY = 780;                       // horizon
const EY0 = 170, EY1 = 1590;          // eyeport top / bottom
const RW = 620;                       // road half width (px at the bottom row)
const TY = 1160;                      // tag row
const sy = (z) => HY + 1140 / z;      // depth -> screen row
const sx = (wx, y, rx) => 540 + (wx - rx) * (y - HY) / 1140;

function sky(night, sunK) {
  const g = x.createLinearGradient(0, EY0, 0, HY);
  g.addColorStop(0, mix("#3a2b6e", "#04050d", night));
  g.addColorStop(0.6, mix("#c4507a", "#0a0c22", night));
  g.addColorStop(1, mix("#ff9a3d", "#141634", night));
  x.fillStyle = g; x.fillRect(0, 0, 1080, HY + 2);
  if (night > 0.3) for (let i = 0; i < 60; i++) {
    x.globalAlpha = cl((night - 0.3) * 1.6) * (0.4 + 0.6 * rnd(i + 9));
    x.fillStyle = WHITE; x.fillRect(rnd(i) * 1080, EY0 + rnd(i + 40) * (HY - EY0 - 60), 3, 3);
  }
  x.globalAlpha = 1;
  if (sunK > 0) {   // sun sinking into the horizon
    const cy = HY + 30 - 150 * sunK, r = 95;
    x.save(); x.beginPath(); x.rect(0, 0, 1080, HY); x.clip();
    const sg = x.createRadialGradient(720, cy, 10, 720, cy, r * 2.6);
    sg.addColorStop(0, "rgba(255,220,140,0.95)"); sg.addColorStop(0.35, "rgba(255,150,70,0.55)"); sg.addColorStop(1, "rgba(255,120,60,0)");
    x.fillStyle = sg; x.fillRect(0, 0, 1080, HY);
    x.beginPath(); x.arc(720, cy, r, 0, Math.PI * 2); x.fillStyle = "#ffd27a"; x.fill();
    x.restore();
  }
  // hills
  x.beginPath(); x.moveTo(0, HY);
  for (let X = 0; X <= 1080; X += 40) x.lineTo(X, HY - 40 - 50 * Math.abs(Math.sin(X * 0.007 + 1.3)) - 20 * rnd(Math.floor(X / 40)));
  x.lineTo(1080, HY); x.closePath(); x.fillStyle = mix("#3b1e4a", "#06070f", night); x.fill();
}

function road(dist, rx, night, hiEdges, hiLane) {
  // verge
  x.fillStyle = mix("#3d3a2c", "#0b0c10", night); x.fillRect(0, HY, 1080, 1920 - HY);
  // asphalt
  x.beginPath(); x.moveTo(sx(-RW, HY, rx), HY); x.lineTo(sx(RW, HY, rx), HY); x.lineTo(sx(RW, 1920, rx), 1920); x.lineTo(sx(-RW, 1920, rx), 1920); x.closePath();
  x.fillStyle = mix("#4a4652", "#24232b", night); x.fill();
  // edge lines
  for (const s of [-1, 1]) {
    x.beginPath(); x.moveTo(sx(s * (RW - 30), HY + 2, rx), HY + 2); x.lineTo(sx(s * (RW - 30), 1920, rx), 1920);
    x.strokeStyle = hiEdges > 0 ? mix("#d9dce6", GREEN, hiEdges) : "#d9dce6"; x.lineWidth = 12 + 10 * hiEdges; x.stroke();
  }
  // centre dashes
  for (let k = 0; k < 14; k++) {
    const z0 = 0.8 + k * 3 - (dist % 3);
    if (z0 < 0.6) continue;
    const y0 = sy(z0 + 1.4), y1 = sy(z0);
    const w0 = 14 * (y0 - HY) / 1140 * 2, w1 = 14 * (y1 - HY) / 1140 * 2;
    x.beginPath(); x.moveTo(sx(0, y0, rx) - w0, y0); x.lineTo(sx(0, y0, rx) + w0, y0); x.lineTo(sx(0, y1, rx) + w1, y1); x.lineTo(sx(0, y1, rx) - w1, y1); x.closePath();
    x.fillStyle = hiLane > 0 ? mix("#f2d34a", GREEN, hiLane) : "#f2d34a"; x.fill();
  }
  // reflector posts on both sides
  for (let k = 0; k < 8; k++) {
    const z = 1.1 + k * 5 - (dist % 5);
    if (z < 0.9) continue;
    const y = sy(z), s = (y - HY) / 1140;
    for (const sd of [-1, 1]) {
      const X = sx(sd * (RW + 110), y, rx);
      x.fillStyle = mix("#e6e6ea", "#3a3a44", night * 0.6); x.fillRect(X - 9 * s, y - 230 * s, 18 * s, 230 * s);
      x.fillStyle = sd < 0 ? "#ffb347" : "#ff4d5e"; x.fillRect(X - 9 * s, y - 210 * s, 18 * s, 34 * s);
    }
  }
}

// pothole at world x, depth z. returns its screen centre and size
function pothole(wx, z, rx) {
  if (z < 0.75) return null;
  const y = sy(z), s = (y - HY) / 1140, X = sx(wx, y, rx), w = 230 * s, h = 70 * s;
  x.beginPath(); x.ellipse(X, y, w, h, 0, 0, Math.PI * 2); x.fillStyle = "#2f2d35"; x.fill();
  x.beginPath(); x.ellipse(X, y + h * 0.15, w * 0.82, h * 0.7, 0, 0, Math.PI * 2); x.fillStyle = "#131217"; x.fill();
  return { X, y, w, h };
}
function ring(p, c, a, t) {
  if (!p || a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 9;
  x.beginPath(); x.ellipse(p.X, p.y, p.w * 1.3 + 8 * Math.sin(t * 9), p.h * 1.6 + 6 * Math.sin(t * 9), 0, 0, Math.PI * 2); x.stroke();
  x.restore();
}

// darkness with a headlight pool cut out of it
function darkness(night, hl, rx) {
  if (night <= 0.01) return;
  d.setTransform(1, 0, 0, 1, 0, 0); d.globalCompositeOperation = "source-over"; d.clearRect(0, 0, 1080, 1920);
  d.fillStyle = `rgba(2,2,8,${0.86 * night})`; d.fillRect(0, 0, 1080, 1920);
  if (hl > 0) {
    d.globalCompositeOperation = "destination-out";
    const cx = 540 - rx * 0.4;
    d.save(); d.translate(cx, 1380); d.scale(1.45, 1);
    const g = d.createRadialGradient(0, 0, 20, 0, 0, 480);
    g.addColorStop(0, `rgba(0,0,0,${0.95 * hl})`); g.addColorStop(0.6, `rgba(0,0,0,${0.7 * hl})`); g.addColorStop(1, "rgba(0,0,0,0)");
    d.fillStyle = g; d.beginPath(); d.arc(0, 0, 480, 0, Math.PI * 2); d.fill(); d.restore();
    // long beam toward the horizon
    d.beginPath(); d.moveTo(cx - 420, 1500); d.lineTo(cx - 60, HY + 40); d.lineTo(cx + 60, HY + 40); d.lineTo(cx + 420, 1500); d.closePath();
    const g2 = d.createLinearGradient(0, 1500, 0, HY);
    g2.addColorStop(0, `rgba(0,0,0,${0.75 * hl})`); g2.addColorStop(1, "rgba(0,0,0,0)");
    d.fillStyle = g2; d.fill();
    d.globalCompositeOperation = "source-over";
  }
  x.drawImage(D, 0, 0);
}

// tinted visor over the eyeport, from the top down to vEdge
function visorTint(k, vEdge) {
  if (k <= 0 || vEdge <= EY0) return;
  x.save(); x.beginPath(); x.rect(0, 0, 1080, vEdge); x.clip();
  x.fillStyle = `rgba(22,14,6,${0.66 * k})`; x.fillRect(0, 0, 1080, 1920);
  x.fillStyle = `rgba(90,60,20,${0.12 * k})`; x.fillRect(0, 0, 1080, 1920);
  // glints so it reads as a visor surface
  x.globalAlpha = 0.07 * k; x.fillStyle = WHITE;
  x.beginPath(); x.moveTo(120, EY0); x.lineTo(300, EY0); x.lineTo(60, 900); x.lineTo(-120, 900); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(380, EY0); x.lineTo(430, EY0); x.lineTo(190, 900); x.lineTo(140, 900); x.closePath(); x.fill();
  x.restore();
  if (vEdge < EY1) {   // the visor's bottom edge while it lifts
    x.save(); x.strokeStyle = "rgba(255,210,150,0.85)"; x.lineWidth = 10;
    x.beginPath(); x.moveTo(0, vEdge + 40); x.quadraticCurveTo(540, vEdge - 50, 1080, vEdge + 40); x.stroke(); x.restore();
  }
}

function cockpit(t, rx, glow) {
  // bars and a glowing speedo at the bottom of the eyeport
  const sh = Math.sin(t * 23) * 1.5;
  x.save(); x.translate(-rx * 0.03, sh);
  x.fillStyle = "#121119";
  x.beginPath(); x.moveTo(90, 1600); x.quadraticCurveTo(300, 1450, 430, 1470); x.lineTo(650, 1470); x.quadraticCurveTo(780, 1450, 990, 1600); x.closePath(); x.fill();
  x.strokeStyle = "#2b2936"; x.lineWidth = 26; x.lineCap = "round";
  x.beginPath(); x.moveTo(120, 1520); x.lineTo(420, 1480); x.moveTo(660, 1480); x.lineTo(960, 1520); x.stroke();
  // gloves on the grips
  x.fillStyle = "#26232f"; rr(x, 70, 1475, 120, 70, 28); x.fill(); rr(x, 890, 1475, 120, 70, 28); x.fill();
  // speedo
  x.beginPath(); x.arc(540, 1530, 70, 0, Math.PI * 2); x.fillStyle = "#07070c"; x.fill();
  x.strokeStyle = `rgba(95,243,255,${0.5 + 0.5 * glow})`; x.lineWidth = 6; x.stroke();
  x.beginPath(); x.moveTo(540, 1530); x.lineTo(540 + Math.cos(-2.1 + 0.9) * 55, 1530 + Math.sin(-2.1 + 0.9) * 55); x.strokeStyle = ORANGE; x.lineWidth = 6; x.stroke();
  x.restore();
}

function helmetRim() {
  x.save();
  x.beginPath(); x.rect(0, 0, 1080, 1920);
  rr(x, 30, EY0, 1020, EY1 - EY0, 230, true);
  x.fillStyle = "#050409"; x.fill("evenodd");
  rr(x, 30, EY0, 1020, EY1 - EY0, 230); x.strokeStyle = "#2a2733"; x.lineWidth = 16; x.stroke();
  rr(x, 44, EY0 + 14, 992, EY1 - EY0 - 28, 216); x.strokeStyle = "rgba(0,0,0,0.55)"; x.lineWidth = 30; x.stroke();
  x.restore();
}

// ---------- icons for s4 ----------
function visorIcon(cx, cy, s, a) {
  if (a <= 0) return;
  x.save(); x.translate(cx, cy); x.scale(s, s); x.globalAlpha = cl(a);
  x.beginPath(); x.moveTo(-150, 40); x.quadraticCurveTo(-160, -90, 0, -100); x.quadraticCurveTo(160, -90, 150, 40); x.quadraticCurveTo(0, 0, -150, 40); x.closePath();
  x.fillStyle = "rgba(170,225,255,0.5)"; x.fill(); x.strokeStyle = "#dff3ff"; x.lineWidth = 9; x.stroke();
  x.strokeStyle = "rgba(255,255,255,0.8)"; x.lineWidth = 7; x.lineCap = "round";
  x.beginPath(); x.moveTo(-90, -40); x.lineTo(-50, -75); x.moveTo(-60, -20); x.lineTo(-30, -45); x.stroke();
  x.restore();
}
function helmetIcon(cx, cy, s, a, shade) {
  if (a <= 0) return;
  x.save(); x.translate(cx, cy); x.scale(s, s); x.globalAlpha = cl(a);
  // shell, facing right
  x.beginPath(); x.arc(0, 0, 125, Math.PI * 0.55, Math.PI * 2.15); x.lineTo(110, 80); x.lineTo(-30, 120); x.closePath();
  x.fillStyle = VIOLET; x.fill(); x.strokeStyle = "#d9ccff"; x.lineWidth = 6; x.stroke();
  // eyeport (clear visor)
  x.save(); x.beginPath(); x.moveTo(20, -50); x.quadraticCurveTo(120, -55, 128, 0); x.lineTo(118, 40); x.quadraticCurveTo(60, 45, 20, 35); x.closePath();
  x.fillStyle = "#cfefff"; x.fill(); x.clip();
  // drop-down sun shade slides down inside the eyeport
  const yy = lerp(-110, 0, cl(shade));
  x.beginPath(); x.moveTo(15, yy - 50); x.quadraticCurveTo(120, yy - 55, 130, yy); x.lineTo(125, yy + 14); x.quadraticCurveTo(60, yy + 10, 15, yy + 8); x.closePath();
  x.fillStyle = "#4a3214"; x.fill();
  x.restore();
  x.beginPath(); x.moveTo(20, -50); x.quadraticCurveTo(120, -55, 128, 0); x.lineTo(118, 40); x.quadraticCurveTo(60, 45, 20, 35); x.closePath();
  x.strokeStyle = "#bfe6ff"; x.lineWidth = 6; x.stroke();
  // switch on the side
  x.beginPath(); x.arc(-20, -70, 12, 0, Math.PI * 2); x.fillStyle = GREEN; x.fill();
  x.restore();
}
function sunIcon(cx, cy, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(cx, cy); x.scale(0.6 + 0.4 * a, 0.6 + 0.4 * a);
  x.beginPath(); x.arc(0, 0, 26, 0, Math.PI * 2); x.fillStyle = ORANGE; x.fill();
  x.strokeStyle = ORANGE; x.lineWidth = 7; x.lineCap = "round";
  for (let i = 0; i < 8; i++) { const q = (i / 8) * Math.PI * 2; x.beginPath(); x.moveTo(Math.cos(q) * 38, Math.sin(q) * 38); x.lineTo(Math.cos(q) * 52, Math.sin(q) * 52); x.stroke(); }
  x.restore();
}

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
  const L = [];
  let night = 0.2, sunK = 0.6, tint = 1, vEdge = EY1 + 60, hl = 0, rx = 0, dist = 14 * t, shake = 0;
  let hole = null, holeRing = 0, holeC = RED, holes2 = null, hiEdges = 0, hiLane = 0, panel = 0, dim = 0;

  if (id === "s1") {
    const Su = at("s1", "sun"), Ne = at("s1", "never"), Da = at("s1", "dark");
    night = lerp(0.05, 0.2, sm(0, 3.6, u)); sunK = lerp(0.75, 0.45, sm(0, 3.6, u));
    L.push(() => tag("SUN GOING DOWN?", CX, TY, RED, sm(Su + 0.1, Su + 0.35, u) * (1 - sm(Da - 0.25, Da - 0.05, u))));
    L.push(() => tag("DARK VISOR", CX, TY, RED, sm(Da - 0.05, Da + 0.2, u)));
    void Ne;
  }
  if (id === "s2") {
    const Fa = at("s2", "fades"), Ti = at("s2", "tinted");
    night = lerp(0.25, 0.75, sm(Fa - 0.3, Fa + 1.0, u)); sunK = lerp(0.4, 0.0, sm(0, Fa + 0.9, u)); hl = sm(Fa, Fa + 0.6, u) * 0.4;
    L.push(() => tag("LIGHT FADES", CX, TY, RED, sm(Fa - 0.05, Fa + 0.2, u) * (1 - sm(Ti - 0.25, Ti - 0.05, u))));
    L.push(() => tag("STILL TINTED", CX, TY, RED, sm(Ti - 0.05, Ti + 0.2, u)));
  }
  if (id === "s3") {
    const Da = at("s3", "darker"), Mi = at("s3", "miss"), Po = at("s3", "pothole"), Ah = at("s3", "ahead");
    night = lerp(0.8, 1, sm(Da - 0.3, Da + 0.4, u)); sunK = 0; hl = 0.4;
    // the pothole comes straight at us and passes under the front wheel just after "ahead"
    const hit = Ah + 0.35;
    const z = lerp(14, 0.8, cl(u / hit) ** 1.6);
    hole = { wx: -40, z };
    holeRing = sm(Po - 0.05, Po + 0.15, u) * (1 - sm(hit, hit + 0.2, u));
    shake = u > hit - 0.05 && u < hit + 0.45 ? (1 - (u - hit) / 0.5) : 0;
    L.push(() => tag("CAN'T SEE", CX, TY, RED, sm(Da - 0.05, Da + 0.2, u) * (1 - sm(Po - 0.25, Po - 0.05, u))));
    L.push(() => tag("POTHOLE!", CX, TY, RED, sm(Po - 0.05, Po + 0.2, u)));
    L.push(() => stamp("x", 800, 650, back(hit, hit + 0.3, u) * 0.75, RED));
    void Mi;
  }
  if (id === "s4") {
    const Cl = at("s4", "clear"), He = at("s4", "helmet"), Dr = at("s4", "drop"), Su = at("s4", "sun");
    night = 0.45; sunK = 0.15; hl = 0.3; dim = 0.35;
    panel = sm(0, 0.35, u);
    const vA = back(Cl - 0.15, Cl + 0.2, u), hA = back(He - 0.15, He + 0.2, u);
    const shade = sm(Dr - 0.05, Dr + 0.45, u) * (1 - sm(Su + 0.35, Su + 0.75, u));
    L.push(() => {
      if (panel <= 0) return;
      x.save(); x.globalAlpha = panel;
      rr(x, 90, 600, 840, 500, 40); x.fillStyle = "rgba(11,10,20,0.9)"; x.fill(); x.strokeStyle = GREEN; x.lineWidth = 5; x.stroke();
      x.restore();
      visorIcon(300, 870, 0.95, vA);
      if (hA > 0) {
        x.save(); x.globalAlpha = cl(hA); x.font = FONT(56); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = WHITE; x.fillText("OR", 500, 850); x.restore();
      }
      helmetIcon(720, 860, 0.95, hA, shade);
      sunIcon(830, 690, sm(Su - 0.1, Su + 0.2, u) * hA);
    });
    L.push(() => tag("CLEAR VISOR", CX, TY, GREEN, sm(Cl - 0.05, Cl + 0.2, u) * (1 - sm(He - 0.25, He - 0.05, u))));
    L.push(() => tag("DROP-DOWN SHADE", CX, TY, VIOLET, sm(He - 0.05, He + 0.2, u)));
  }
  if (id === "s5") {
    const Be = at("s5", "before"), Pu = at("s5", "pull"), Ov = at("s5", "over"), Sw = at("s5", "switch"), Cl = at("s5", "clear");
    night = 0.12; sunK = 0.5;
    // slow down and roll onto the verge
    const t0 = S.s5[0] + LEAD + Pu, q = cl(t - t0, 0, 1.2);
    dist = 14 * t0 + 14 * (q - (q * q) / 2.4);
    rx = 560 * sm(Pu, Ov + 0.6, u);
    // the tinted visor lifts away, then the clear one is down
    vEdge = lerp(EY1 + 60, EY0 - 80, sm(Sw - 0.05, Cl + 0.1, u));
    L.push(() => tag("BEFORE SUNSET", CX, TY, GREEN, sm(Be - 0.05, Be + 0.2, u) * (1 - sm(Pu - 0.25, Pu - 0.05, u))));
    L.push(() => tag("PULL OVER", CX, TY, GREEN, sm(Pu - 0.05, Pu + 0.2, u) * (1 - sm(Sw - 0.25, Sw - 0.05, u))));
    L.push(() => tag("SWITCH TO CLEAR", CX, TY, GREEN, sm(Sw - 0.05, Sw + 0.2, u)));
  }
  if (["s6", "s7", "s8"].includes(id)) { night = 1; sunK = 0; tint = 0; hl = 1; }
  if (id === "s6") {
    const Ro = at("s6", "road"), Ed = at("s6", "edges"), Po = at("s6", "potholes"), Ea = at("s6", "easy");
    hiLane = sm(Ro - 0.05, Ro + 0.2, u); hiEdges = sm(Ed - 0.05, Ed + 0.2, u);
    // two potholes ahead, the rider steers round the near one
    const z1 = lerp(10, 3.6, sm(0, 3.2, u)), z2 = lerp(15, 6.5, sm(0, 3.2, u));
    holes2 = [{ wx: -60, z: z1 }, { wx: 330, z: z2 }];
    rx = 170 * sm(Po + 0.1, Po + 1.0, u);
    holeRing = sm(Po - 0.05, Po + 0.2, u); holeC = GREEN;
    L.push(() => tag("THE ROAD", CX, TY, GREEN, hiLane * (1 - sm(Ed - 0.25, Ed - 0.05, u))));
    L.push(() => tag("THE EDGES", CX, TY, GREEN, hiEdges * (1 - sm(Po - 0.25, Po - 0.05, u))));
    L.push(() => tag("THE POTHOLES", CX, TY, GREEN, holeRing * (1 - sm(Ea - 0.25, Ea - 0.05, u))));
    L.push(() => tag("EASY TO SEE", CX, TY, GREEN, sm(Ea - 0.05, Ea + 0.2, u)));
    L.push(() => stamp("v", 800, 650, back(Ea, Ea + 0.3, u) * 0.75, GREEN));
  }
  if (id === "s7" || id === "s8") { hiEdges = 1; hiLane = 0.5; }

  // ---------- picture ----------
  x.fillStyle = "#050409"; x.fillRect(0, 0, 1080, 1920);
  x.save();
  if (shake > 0) x.translate(Math.sin(t * 70) * 26 * shake, Math.cos(t * 55) * 34 * shake);
  sky(night, sunK);
  road(dist, rx, night, hiEdges, hiLane);
  let hp = null;
  if (hole) hp = pothole(hole.wx, hole.z, rx);
  const hps = holes2 ? holes2.map((h) => pothole(h.wx, h.z, rx)) : [];
  darkness(night, hl, rx);
  // under a tinted visor the dark goes darker still
  visorTint(tint, vEdge);
  if (dim > 0) { x.fillStyle = `rgba(5,4,9,${dim})`; x.fillRect(0, 0, 1080, 1920); }
  if (hp) ring(hp, holeC, holeRing, t);
  hps.forEach((p) => ring(p, holeC, holeRing, t));
  // clear visor glints once it is down
  if (tint === 0 || vEdge < EY0) {
    x.save(); x.globalAlpha = 0.05; x.fillStyle = WHITE;
    x.beginPath(); x.moveTo(140, EY0); x.lineTo(260, EY0); x.lineTo(40, 820); x.lineTo(-80, 820); x.closePath(); x.fill(); x.restore();
  }
  cockpit(t, rx, hl);
  x.restore();
  helmetRim();

  L.forEach((f) => f());

  if (id === "s1") words(["NEVER RIDE AT NIGHT", "WITH A DARK VISOR"], RED, 410, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "dark"))));
  if (id === "s2") words(["THE LIGHT", "FADES..."], RED, 410, 0.0, 1, 170, flash(u, at("s2", "fades")) * 0.6);
  if (id === "s3") words(["YOU CAN'T", "SEE IT"], RED, 410, 0.0, 1, 170, flash(u, at("s3", "pothole")) * 0.6);
  if (id === "s4") words(["CARRY A", "CLEAR VISOR"], GREEN, 410, 0.0, 1, 160, flash(u, at("s4", "clear")) * 0.6);
  if (id === "s5") words(["SWITCH", "BEFORE SUNSET"], GREEN, 410, 0.0, 1, 150, flash(u, at("s5", "switch")) * 0.6);
  if (id === "s6") words(["NOW YOU", "SEE IT ALL"], GREEN, 410, 0.0, 1, 170, flash(u, at("s6", "easy")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,4,9,0.78)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["DARK VISOR", "BY DAY."], ORANGE, 660, 0.0, 1, 150, flash(u, 0.05));
    words(["CLEAR AT NIGHT."], ORANGE, 1000, at("s7", "clear") - 0.05, 1, 150, flash(u, at("s7", "clear")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(5,4,9,0.9)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["dark-visor-pov"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
