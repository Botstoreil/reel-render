// dry-chain (Apex 34, TikTok) - MACRO MECHANICAL style: a smooth full-res close-up of a real drivetrain (rear sprocket,
// front sprocket, a roller chain whose links really run over the teeth), metal shading, shallow-focus bokeh behind,
// a macro camera that drifts between the links. Wrong: rusty, dry, noisy chain, it stretches (the lower run sags) and the
// sprocket teeth wear into hooks. Right: brush it clean, lube the inside of the warm lower run, wipe off the extra, check
// the slack with a ruler against the manual. Time only from hf-seek.
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
const RED = "#ff4d5e", GREEN = "#3dffa0", VIOLET = "#a98bff", ORANGE = "#ffa733", WHITE = "#f2f6ff", INK = "#0d0718", CYAN = "#5ff3ff", BLUE = "#6fb8ff";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], cl(k))).toString(16).padStart(2, "0")).join(""); }

// ---------- crisp text (screen space) ----------
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
      const s0 = t0 + wi * 0.07, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU), st = 0.5 + 0.5 * kk;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - kk) * 30); x.scale(st, st); x.globalAlpha = a * o;
      x.lineWidth = Math.max(12, px * 0.16); x.strokeStyle = INK; x.strokeText(q, 0, 0);
      x.fillStyle = "#2a0f3e"; x.fillText(q, 7, 7); x.strokeText(q, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(q, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 50) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 56, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1180);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.fillStyle = "rgba(13,7,24,0.94)"; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 18); x.fill();
  x.strokeStyle = color; x.lineWidth = 6; x.stroke();
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = INK; x.beginPath(); x.arc(0, 0, 84, 0, Math.PI * 2); x.fill();
  x.strokeStyle = c; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 22; x.lineCap = "round"; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke(); x.restore();
}

// ---------- drivetrain geometry (world units, y down) ----------
const NR = 40, NF = 15, PITCH = 28.3;
const R = (NR * PITCH) / (2 * Math.PI), r = (NF * PITCH) / (2 * Math.PI), D = 560;   // rear at (0,0), front at (D,0)
const B = Math.asin((R - r) / D), STR = D * Math.cos(B);
const segs = [STR, r * (Math.PI - 2 * B), STR, R * (Math.PI + 2 * B)];
const LEN = segs.reduce((a, b) => a + b, 0);
const NL = Math.round(LEN / PITCH), P = LEN / NL;
const topA = [R * Math.sin(B), -R * Math.cos(B)], topB = [D + r * Math.sin(B), -r * Math.cos(B)];
const botB = [D + r * Math.sin(B), r * Math.cos(B)], botA = [R * Math.sin(B), R * Math.cos(B)];
function onLoop(s, sag) {
  s = ((s % LEN) + LEN) % LEN;
  if (s < segs[0]) { const k = s / segs[0]; return [lerp(topA[0], topB[0], k), lerp(topA[1], topB[1], k)]; }
  s -= segs[0];
  if (s < segs[1]) { const a = -Math.PI / 2 + B + s / r; return [D + r * Math.cos(a), r * Math.sin(a)]; }
  s -= segs[1];
  if (s < segs[2]) { const k = s / segs[2]; return [lerp(botB[0], botA[0], k), lerp(botB[1], botA[1], k) + sag * Math.sin(Math.PI * k)]; }
  s -= segs[2];
  const a = Math.PI / 2 - B + s / R; return [R * Math.cos(a), R * Math.sin(a)];
}

// sprocket: centre, radius (pitch line), teeth, angle, wear (0..1 hooked teeth), metal tone
function sprocket(cx, cy, RR, N, ang, wear, tone, holes) {
  x.save(); x.translate(cx, cy); x.rotate(ang);
  const g = x.createRadialGradient(-RR * 0.3, -RR * 0.3, RR * 0.1, 0, 0, RR * 1.1);
  g.addColorStop(0, mix(tone, WHITE, 0.35)); g.addColorStop(0.6, tone); g.addColorStop(1, mix(tone, INK, 0.55));
  x.fillStyle = g; x.beginPath();
  for (let i = 0; i < N; i++) {
    const a0 = (i / N) * Math.PI * 2, da = (Math.PI * 2) / N, hook = wear * da * 0.45;
    const root = RR - 9, tip = RR + 11 - wear * 4;
    x.lineTo(Math.cos(a0) * root, Math.sin(a0) * root);
    x.lineTo(Math.cos(a0 + da * 0.25) * root, Math.sin(a0 + da * 0.25) * root);
    x.lineTo(Math.cos(a0 + da * (0.42 - 0.12 * wear) - hook) * tip, Math.sin(a0 + da * (0.42 - 0.12 * wear) - hook) * tip);
    x.lineTo(Math.cos(a0 + da * (0.58 - 0.02 * wear) - hook * 1.3) * tip, Math.sin(a0 + da * (0.58 - 0.02 * wear) - hook * 1.3) * tip);
    x.lineTo(Math.cos(a0 + da * 0.75) * root, Math.sin(a0 + da * 0.75) * root);
  }
  x.closePath(); x.fill();
  x.strokeStyle = mix(tone, INK, 0.6); x.lineWidth = 3; x.stroke();
  if (holes) for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    x.fillStyle = "#120a22"; x.beginPath(); x.ellipse(Math.cos(a) * RR * 0.55, Math.sin(a) * RR * 0.55, RR * 0.17, RR * 0.11, a, 0, Math.PI * 2); x.fill();
  }
  x.fillStyle = mix(tone, INK, 0.4); x.beginPath(); x.arc(0, 0, RR * 0.26, 0, Math.PI * 2); x.fill();
  x.fillStyle = mix(tone, WHITE, 0.2);
  for (let i = 0; i < (holes ? 5 : 0); i++) { const a = (i / 5) * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * RR * 0.34, Math.sin(a) * RR * 0.34, 7, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = "#1a1030"; x.beginPath(); x.arc(0, 0, RR * 0.12, 0, Math.PI * 2); x.fill();
  x.restore();
}

// chain: offset along the loop, sag of the lower run, rust 0..1, shine 0..1 (lubed), grime 0..1
function chain(off, sag, rust, shine, t) {
  const pts = [];
  for (let i = 0; i <= NL; i++) pts.push(onLoop(i * P + off, sag));
  const plate = (i, outer) => {
    const [a, b] = [pts[i], pts[i + 1]], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ri = rnd(i * 7 + (outer ? 3 : 0)), base = outer ? "#a8b1c4" : "#7d8699";
    const c = mix(base, ri > 0.5 ? "#a4512a" : "#7a3a1e", rust * (0.6 + 0.4 * ri));
    x.save(); x.translate(a[0], a[1]); x.rotate(ang);
    const hgt = outer ? 25 : 20;
    const gr = x.createLinearGradient(0, -hgt / 2, 0, hgt / 2);
    gr.addColorStop(0, mix(c, WHITE, 0.25 + 0.35 * shine)); gr.addColorStop(0.5, c); gr.addColorStop(1, mix(c, INK, 0.5));
    x.fillStyle = gr; x.beginPath(); x.roundRect(-hgt / 2, -hgt / 2, len + hgt, hgt, hgt / 2); x.fill();
    if (outer) { x.fillStyle = mix(c, INK, 0.35); x.beginPath(); x.roundRect(len * 0.3, -3, len * 0.4, 6, 3); x.fill(); }
    if (rust > 0.2 && ri > 0.35) { x.fillStyle = `rgba(150,62,24,${0.8 * rust})`; x.beginPath(); x.arc(len * ri, (rnd(i) - 0.5) * 10, 3 + 5 * rust * ri, 0, Math.PI * 2); x.fill(); }
    if (shine > 0.05) {   // a glint that runs along the oiled plate
      const g = ((t * 0.9 + i * 0.07) % 1);
      x.fillStyle = `rgba(255,255,255,${0.55 * shine * Math.max(0, 1 - Math.abs(g - 0.5) * 4)})`;
      x.beginPath(); x.roundRect(len * g - 8, -hgt / 2 + 3, 16, 4, 2); x.fill();
    }
    x.restore();
  };
  for (let i = 0; i < NL; i += 2) plate(i, false);
  for (let i = 0; i < NL; i++) {   // rollers
    const [px, py] = pts[i];
    x.fillStyle = mix("#c9d0de", "#8a4424", rust * 0.8); x.beginPath(); x.arc(px, py, 9, 0, Math.PI * 2); x.fill();
    x.fillStyle = mix("#3a3550", "#4a2010", rust); x.beginPath(); x.arc(px, py, 4, 0, Math.PI * 2); x.fill();
  }
  for (let i = 1; i < NL; i += 2) plate(i, true);
  return pts;
}

// ---------- props ----------
function brush(X, Y, ang, k) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = k; x.translate(X, Y); x.rotate(ang);
  x.fillStyle = "#3dffa0"; x.beginPath(); x.roundRect(-20, -150, 40, 120, 14); x.fill();       // handle
  x.fillStyle = "#1c6b4a"; x.fillRect(-36, -34, 72, 22);                                         // head
  x.strokeStyle = "#e8f6ee"; x.lineWidth = 3;
  for (let i = -30; i <= 30; i += 6) { x.beginPath(); x.moveTo(i, -12); x.lineTo(i + 2, 6); x.stroke(); }
  x.restore();
}
function can(X, Y, ang, k, spray, t) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = k; x.translate(X, Y); x.rotate(ang); x.scale(0.75, 0.75);
  const g = x.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, "#5b3fd1"); g.addColorStop(0.45, "#b9a6ff"); g.addColorStop(1, "#3a2896");
  x.fillStyle = g; x.beginPath(); x.roundRect(-40, 0, 80, 190, 16); x.fill();
  x.fillStyle = "#1b1233"; x.fillRect(-26, -26, 52, 30); x.fillStyle = "#e8e4ff"; x.fillRect(-4, -60, 8, 38);  // cap + straw nozzle
  x.fillStyle = "#2a1c5c"; x.fillRect(-40, 70, 80, 46); x.fillStyle = CYAN; x.fillRect(-28, 86, 56, 12);
  if (spray > 0) for (let i = 0; i < 16; i++) {
    const q = (t * 2.2 + i / 16) % 1, sp = (rnd(i) - 0.5) * 40 * q;
    x.fillStyle = `rgba(95,243,255,${spray * (1 - q)})`; x.beginPath(); x.arc(sp, -64 - q * 120, 4 + 3 * rnd(i + 3), 0, Math.PI * 2); x.fill();
  }
  x.restore();
}
function rag(X, Y, k) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = k; x.translate(X, Y);
  x.fillStyle = "#f2e9d8"; x.beginPath(); x.moveTo(-70, -40); x.quadraticCurveTo(-20, -60, 60, -36); x.quadraticCurveTo(80, 10, 50, 46);
  x.quadraticCurveTo(-10, 60, -64, 38); x.quadraticCurveTo(-86, 0, -70, -40); x.fill();
  x.strokeStyle = "#c9bca2"; x.lineWidth = 3; x.beginPath(); x.moveTo(-40, -20); x.quadraticCurveTo(0, 0, 40, -10); x.moveTo(-36, 16); x.quadraticCurveTo(4, 30, 36, 20); x.stroke();
  x.fillStyle = "rgba(60,40,20,0.5)"; x.beginPath(); x.arc(10, 6, 16, 0, Math.PI * 2); x.fill();
  x.restore();
}
function ruler(X, Y, k, hi) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = k; x.translate(X, Y);
  x.fillStyle = "#f6e27a"; x.fillRect(-22, -160, 44, 320);
  x.fillStyle = "#3a2c10"; for (let i = -150; i <= 150; i += 15) x.fillRect(-22, i, i % 60 === 0 ? 24 : 12, 3);
  x.fillStyle = `rgba(61,255,160,${0.55 * hi})`; x.fillRect(-22, -30, 44, 60);
  x.restore();
}
function finger(X, Y, k) {
  if (k <= 0) return;
  x.save(); x.globalAlpha = k; x.translate(X, Y);
  x.fillStyle = "#d9a27a"; x.beginPath(); x.roundRect(-22, 0, 44, 200, 22); x.fill();
  x.fillStyle = "#f0c7a6"; x.beginPath(); x.roundRect(-14, 6, 28, 30, 10); x.fill();
  x.fillStyle = "#3f6fd8"; x.fillRect(-34, 150, 68, 80);
  x.restore();
}
function waves(X, Y, k, t, c) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    const q = (t * 1.8 + i / 3) % 1;
    x.globalAlpha = k * (1 - q); x.lineWidth = 10;
    x.beginPath(); x.arc(X, Y, 30 + q * 120, -Math.PI * 0.85, -Math.PI * 0.15); x.stroke();
  }
  x.restore();
}
function thermo(X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#e9e4ff"; x.beginPath(); x.roundRect(-14, -70, 28, 100, 14); x.fill();
  x.fillStyle = c; x.fillRect(-6, -40, 12, 60); x.beginPath(); x.arc(0, 36, 22, 0, Math.PI * 2); x.fill();
  x.restore();
}
function manual(X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#e9e4ff"; x.beginPath(); x.roundRect(-70, -90, 140, 180, 10); x.fill();
  x.fillStyle = c; x.fillRect(-70, -90, 22, 180);
  x.fillStyle = "#6d6788"; for (let k = 0; k < 5; k++) x.fillRect(-34, -60 + k * 26, 86, 8);
  x.restore();
}
function odo(X, Y, s, t) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#120a22"; x.beginPath(); x.roundRect(-130, -46, 260, 92, 14); x.fill();
  x.strokeStyle = GREEN; x.lineWidth = 6; x.stroke();
  const n = String(1200 + Math.floor(t * 40) % 600).padStart(5, "0");
  x.font = FONT(60); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = GREEN; x.fillText(n + " KM", 0, 4);
  x.restore();
}

// ---------- background ----------
function bg(t) {
  const g = x.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, "#120826"); g.addColorStop(0.5, "#1c0d36"); g.addColorStop(1, "#0a0516");
  x.fillStyle = g; x.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 18; i++) {   // out-of-focus garage lights
    const X = rnd(i) * 1080 + Math.sin(t * 0.3 + i) * 12, Y = 200 + rnd(i + 9) * 1500, Rr = 30 + rnd(i + 4) * 90;
    const c = i % 3 === 0 ? "255,167,51" : i % 3 === 1 ? "169,139,255" : "95,243,255";
    const b = x.createRadialGradient(X, Y, 0, X, Y, Rr); b.addColorStop(0, `rgba(${c},0.16)`); b.addColorStop(1, `rgba(${c},0)`);
    x.fillStyle = b; x.beginPath(); x.arc(X, Y, Rr, 0, Math.PI * 2); x.fill();
  }
}

// ---------- camera keys per line: [u, cx, cy, zoom] ----------
const CAM = {
  s1: [[0, 140, -170, 2.4], [3, 230, -150, 2.1]],
  s2: [[0, 300, 0, 1.15], [3.2, 280, 10, 1.05]],
  s3: [[0, -40, -110, 1.9], [1.6, -20, -60, 1.6], [3.6, 260, 60, 1.1]],
  s4: [[0, 200, -235, 1.9], [3.5, 260, -215, 1.7]],          // r2: lower, the brush stays under the title
  s5: [[0, 160, 30, 1.35], [2.4, 210, 40, 1.3], [3.8, 260, 40, 1.25]],   // r2: wider, sprocket clear of the title
  s6: [[0, 290, 60, 1.25], [3.0, 290, 90, 1.4]],
  s7: [[0, 290, 0, 1.0], [3, 290, 0, 0.95]],
  s8: [[0, 290, 0, 0.95], [3.2, 290, 0, 0.9]],
};
function cam(id, u) {
  const K = CAM[id];
  let i = 0; while (i < K.length - 1 && u > K[i + 1][0]) i++;
  const A = K[i], Bk = K[Math.min(i + 1, K.length - 1)];
  const k = A === Bk ? 0 : sm(A[0], Bk[0], u);
  return [lerp(A[1], Bk[1], k), lerp(A[2], Bk[2], k), lerp(A[3], Bk[3], k)];
}
const W2S = (c, p) => [540 + (p[0] - c[0]) * c[2], 820 + (p[1] - c[1]) * c[2]];

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const L = [];
  const T6 = S.s6[0], T7 = S.s7[0];
  const off = 150 * Math.min(t, T6) + 150 * Math.max(0, t - T7);
  let rust = 0.85, shine = 0, sag = 14, wear = 0, noise = 0, grime = 0;
  let br = 0, brX = 0, cn = 0, spray = 0, rg = 0, rgX = 0, rl = 0, rlHi = 0, fg = 0, push = 0, th = 0, mn = 0, od = 0, gapMark = 0;
  const wrongTone = "#8c7f88", rightTone = "#b7bdd0";
  let tone = wrongTone;

  if (id === "s1") {
    const Ru = at("s1", "rusty"), Dr = at("s1", "dry");
    L.push(() => tag("RUSTY?", CX - 120, 1120, RED, sm(Ru - 0.1, Ru + 0.2, u) * (1 - sm(Dr - 0.2, Dr - 0.05, u))));
    L.push(() => tag("DRY", CX - 120, 1120, RED, sm(Dr - 0.1, Dr + 0.15, u)));
  }
  if (id === "s2") {
    const Ri = at("s2", "riding"), Dr = at("s2", "dry"), No = at("s2", "noisy");
    rust = 0.9; noise = sm(Dr - 0.2, Dr + 0.2, u);
    L.push(() => tag("STILL RIDING", CX - 60, 1120, RED, sm(Ri - 0.1, Ri + 0.2, u) * (1 - sm(No - 0.2, No - 0.05, u))));
    L.push(() => tag("SQUEAK SQUEAK", CX - 60, 1120, RED, sm(No - 0.1, No + 0.2, u)));
  }
  if (id === "s3") {
    const We = at("s3", "wears"), St = at("s3", "stretches"), Sp = at("s3", "sprockets");
    rust = 0.95; noise = 0.6;
    wear = sm(We - 0.1, We + 0.6, u) * 0.4 + sm(Sp - 0.2, Sp + 0.4, u) * 0.6;
    sag = lerp(14, 70, sm(St - 0.2, St + 0.6, u)); gapMark = sm(St, St + 0.3, u);
    L.push(() => tag("WEARS OUT FAST", CX - 60, 1120, RED, sm(We - 0.1, We + 0.2, u) * (1 - sm(St - 0.2, St - 0.05, u))));
    L.push(() => tag("STRETCHED", CX - 60, 1120, RED, sm(St - 0.1, St + 0.2, u) * (1 - sm(Sp - 0.2, Sp - 0.05, u))));
    L.push(() => tag("WORN SPROCKETS", CX - 60, 1120, RED, sm(Sp - 0.1, Sp + 0.2, u)));
    L.push(() => stamp("x", 790, 600, back(Sp + 0.2, Sp + 0.5, u) * 0.8, RED));
  }
  if (["s4", "s5", "s6", "s7", "s8"].includes(id)) { tone = rightTone; rust = 0; sag = 18; }
  if (id === "s4") {
    const Cl = at("s4", "clean"), Lu = at("s4", "lube"), Ev = at("s4", "every");
    rust = 0.85 * (1 - sm(Cl, Lu, u)); br = sm(Cl - 0.3, Cl, u) * (1 - sm(Lu + 0.2, Lu + 0.5, u)); brX = Math.sin(u * 14) * 60;
    grime = br; shine = sm(Lu, Lu + 0.5, u); od = back(Ev - 0.15, Ev + 0.2, u);
    L.push(() => tag("CLEAN IT FIRST", CX - 60, 1120, GREEN, sm(Cl - 0.1, Cl + 0.2, u) * (1 - sm(Lu - 0.2, Lu - 0.05, u))));
    L.push(() => tag("THEN LUBE", CX - 60, 1120, GREEN, sm(Lu - 0.1, Lu + 0.2, u) * (1 - sm(Ev - 0.2, Ev - 0.05, u))));
    L.push(() => tag("EVERY FEW 100 KM", CX - 60, 1120, VIOLET, sm(Ev - 0.1, Ev + 0.2, u)));
  }
  if (id === "s5") {
    const Wa = at("s5", "warm"), In = at("s5", "inside"), Wi = at("s5", "wipe");
    shine = 0.6 + 0.4 * sm(In, Wi, u); th = back(Wa - 0.15, Wa + 0.15, u) * (1 - sm(In - 0.3, In - 0.1, u));
    cn = sm(In - 0.4, In - 0.1, u) * (1 - sm(Wi - 0.3, Wi - 0.1, u)); spray = u > In - 0.1 && u < Wi - 0.2 ? 1 : 0;
    rg = sm(Wi - 0.2, Wi + 0.1, u); rgX = (u - Wi) * 120;
    L.push(() => tag("WHEN IT'S WARM", CX - 60, 1120, GREEN, sm(Wa - 0.1, Wa + 0.2, u) * (1 - sm(In - 0.2, In - 0.05, u))));
    L.push(() => tag("INSIDE OF LINKS", CX - 60, 1120, GREEN, sm(In - 0.1, In + 0.2, u) * (1 - sm(Wi - 0.2, Wi - 0.05, u))));
    L.push(() => tag("WIPE THE EXTRA", CX - 60, 1120, GREEN, sm(Wi - 0.1, Wi + 0.2, u)));
  }
  if (id === "s6") {
    const Sl = at("s6", "slack"), Nu = at("s6", "numbers"), Ma = at("s6", "manual");
    shine = 0.7; rl = sm(Sl - 0.3, Sl, u); fg = rl; push = Math.max(0, Math.sin((u - Sl) * 3.2)) * sm(Sl, Sl + 0.2, u);
    sag = 18 - 26 * push; rlHi = sm(Nu - 0.1, Nu + 0.2, u); mn = back(Nu - 0.15, Nu + 0.2, u);
    L.push(() => tag("CHECK THE SLACK", CX - 60, 1120, GREEN, sm(Sl - 0.1, Sl + 0.2, u) * (1 - sm(Nu - 0.2, Nu - 0.05, u))));
    L.push(() => tag("MATCH YOUR MANUAL", CX - 40, 1120, VIOLET, sm(Nu - 0.1, Nu + 0.2, u)));
    L.push(() => stamp("v", 715, 980, back(Ma, Ma + 0.3, u) * 0.7, GREEN));
  }
  if (id === "s7" || id === "s8") shine = 0.8;

  // ---------- draw ----------
  bg(t);
  const c = cam(id, u);
  x.save(); x.translate(540, 820); x.scale(c[2], c[2]); x.translate(-c[0], -c[1]);
  // swingarm silhouette behind the drivetrain
  x.fillStyle = "#24173d"; x.beginPath(); x.moveTo(-40, -50); x.lineTo(D + 20, -30); x.lineTo(D + 20, 30); x.lineTo(-40, 60); x.closePath(); x.fill();
  sprocket(0, 0, R, NR, off / R, wear, tone, true);
  sprocket(D, 0, r, NF, off / r, wear * 0.7, tone, false);
  const pts = chain(off, sag, rust, shine, t);
  // red marks on the stretched lower run
  if (gapMark > 0) for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]]; if (a[1] < R * 0.6 || a[0] < 60 || a[0] > D - 40) continue;
    x.strokeStyle = `rgba(255,77,94,${gapMark})`; x.lineWidth = 6; x.beginPath(); x.arc((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 20, 0, Math.PI * 2); x.stroke();
  }
  if (grime > 0) for (let i = 0; i < 14; i++) {   // rust flakes flying off the brush
    const q = (t * 2 + i / 14) % 1;
    x.fillStyle = `rgba(164,81,42,${grime * (1 - q)})`; x.beginPath(); x.arc(160 + brX + (rnd(i) - 0.5) * 160 * q, -R - 10 - q * 160, 5, 0, Math.PI * 2); x.fill();
  }
  brush(170 + brX, -R - 14, 0, br);
  can(220, 54, -2.6, cn, spray, t);   // r2: inside the loop, nozzle down onto the inner side of the lower run
  rag(140 + rgX, R + 12, rg);
  if (rl > 0) { ruler(D / 2 + 20, R * 0.9 + 6, rl, rlHi); finger(D / 2 - 30, R + sag + 22, fg); }
  x.restore();

  // screen-space effects
  if (noise > 0) { const [wx, wy] = W2S(c, [D / 2, -R]); waves(cl(wx, 160, 880), cl(wy, 560, 1300), noise, t, RED); }
  th > 0 && thermo(800, 640, th, ORANGE);
  mn > 0 && manual(850, 960, mn * 0.85, VIOLET);
  od > 0 && odo(700, 690, od, t);

  L.forEach((f) => f());

  if (id === "s1") words(["NEVER IGNORE", "A DRY CHAIN"], RED, 400, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "dry"))));
  if (id === "s2") words(["DRY AND", "NOISY"], RED, 400, 0.0, 1, 170, flash(u, at("s2", "noisy")) * 0.6);
  if (id === "s3") words(["WORN OUT", "FAST"], RED, 400, 0.0, 1, 170, flash(u, at("s3", "wears")) * 0.6);
  if (id === "s4") words(["CLEAN", "AND LUBE"], GREEN, 400, 0.0, 1, 170, flash(u, at("s4", "lube")) * 0.6);
  if (id === "s5") words(["LUBE IT", "WARM"], GREEN, 400, 0.0, 1, 170, flash(u, at("s5", "warm")) * 0.6);
  if (id === "s6") words(["CHECK", "THE SLACK"], GREEN, 400, 0.0, 1, 170, flash(u, at("s6", "slack")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(13,7,24,0.78)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["A QUIET CHAIN", "IS A HAPPY CHAIN."], ORANGE, 680, 0.0, 1, 130, flash(u, 0.05));
    words(["LUBE IT."], ORANGE, 1000, at("s7", "lube") - 0.05, 1, 170, flash(u, at("s7", "lube")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(13,7,24,0.9)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["dry-chain-macro"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
