// side-stand (Apex 29, TikTok) - X-RAY SIDE VIEW style: a dark scanner screen, the bike drawn as a glowing x-ray outline
// in profile, the side stand lit up like the bone in the picture. Wrong: rider jumps on, rides off with the stand out,
// "some bikes stall" (engine icon cuts), on others the stand digs into the road (sparks, the bike jolts). Right: sit,
// kick it up, look down and check it is folded (scanner ring + tick), then start and pull away. Time only from hf-seek.
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
const RED = "#ff4d5e", GREEN = "#3dffa0", VIOLET = "#a98bff", ORANGE = "#ffa733", WHITE = "#f2f6ff", INK = "#04121a", CYAN = "#5ff3ff", AMBER = "#ffb300";
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
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1360);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.fillStyle = "rgba(4,18,26,0.92)"; rr(-w / 2, -h / 2, w, h, 14); x.fill();
  glow(color, 20, () => { x.strokeStyle = color; x.lineWidth = 5; rr(-w / 2, -h / 2, w, h, 14); x.stroke(); });
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(4,18,26,0.9)"; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill();
  glow(c, 24, () => { x.strokeStyle = c; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 66, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 20; x.lineCap = "round"; x.beginPath();
    if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
    x.stroke(); });
  x.restore();
}

// ---------- scanner background ----------
const GY = 1120, SC = 1.3, TY = 1192;   // TY: label row between the road and the caption pill
function scanner(dist, t) {
  x.fillStyle = "#020a10"; x.fillRect(0, 0, 1080, 1920);
  const vg = x.createRadialGradient(540, 980, 150, 540, 980, 1000); vg.addColorStop(0, "rgba(40,170,200,0.22)"); vg.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = vg; x.fillRect(0, 0, 1080, 1920);
  // grid scrolls with the ride
  x.strokeStyle = "rgba(95,243,255,0.07)"; x.lineWidth = 2;
  const off = -(dist % 90);
  for (let X = off; X < 1080; X += 90) { x.beginPath(); x.moveTo(X, 540); x.lineTo(X, 1420); x.stroke(); }
  for (let Y = 540; Y <= 1420; Y += 90) { x.beginPath(); x.moveTo(0, Y); x.lineTo(1080, Y); x.stroke(); }
  // far posts (parallax)
  for (let i = -1; i < 6; i++) {
    const X = ((i * 330 - dist * 0.5) % 1650 + 1650) % 1650 - 200;
    x.strokeStyle = "rgba(95,243,255,0.16)"; x.lineWidth = 6; x.beginPath(); x.moveTo(X, GY); x.lineTo(X, GY - 520); x.lineTo(X + 60, GY - 520); x.stroke();
  }
  // road
  glow(CYAN, 16, () => { x.strokeStyle = rgba(CYAN, 0.8); x.lineWidth = 5; x.beginPath(); x.moveTo(0, GY); x.lineTo(1080, GY); x.stroke(); });
  x.fillStyle = "rgba(95,243,255,0.06)"; x.fillRect(0, GY, 1080, 170);
  x.strokeStyle = "rgba(95,243,255,0.35)"; x.lineWidth = 5;
  for (let X = -((dist * 1.0) % 160); X < 1080; X += 160) { x.beginPath(); x.moveTo(X, GY + 60); x.lineTo(X + 80, GY + 60); x.stroke(); }
  // scan line sweep
  const sy = 540 + ((t * 260) % 900);
  const sg = x.createLinearGradient(0, sy - 40, 0, sy + 4); sg.addColorStop(0, "rgba(95,243,255,0)"); sg.addColorStop(1, "rgba(95,243,255,0.14)");
  x.fillStyle = sg; x.fillRect(0, sy - 40, 1080, 44);
}

// ---------- the bike (local units, ground at y=0, x forward = right) ----------
const RW = [-170, -72], FW = [178, -72], WR = 72, PIV = [-50, -98];
const standTip = (a) => [PIV[0] - 100 * Math.sin(a), PIV[1] + 100 * Math.cos(a)];
function wheel(c, cx, cy, rot) {
  x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(cx, cy, WR, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, WR - 16, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 4; for (let k = 0; k < 5; k++) { const a = rot + (k * Math.PI * 2) / 5; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * (WR - 16), cy + Math.sin(a) * (WR - 16)); x.stroke(); }
  x.fillStyle = c; x.beginPath(); x.arc(cx, cy, 9, 0, Math.PI * 2); x.fill();
}
function rider(c, a, dy) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(0, dy);
  x.strokeStyle = c; x.lineWidth = 16; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.moveTo(-70, -205); x.lineTo(15, -335); x.stroke();                 // torso
  x.beginPath(); x.moveTo(5, -318); x.lineTo(75, -275); x.lineTo(112, -250); x.stroke(); // arm to bars
  x.beginPath(); x.moveTo(-70, -205); x.lineTo(30, -175); x.lineTo(-5, -100); x.stroke(); // leg to peg
  x.fillStyle = rgba(c, 0.25); x.beginPath(); x.arc(32, -378, 36, 0, Math.PI * 2); x.fill();
  x.lineWidth = 9; x.beginPath(); x.arc(32, -378, 36, 0, Math.PI * 2); x.stroke();     // helmet
  x.lineWidth = 7; x.beginPath(); x.moveTo(44, -382); x.lineTo(68, -382); x.stroke();    // visor
  x.restore();
}
// o: {c, standA, standC, standGlow, rot (wheel), tilt, pivot, riderA, riderDy, engine (0..1 glow), engineC}
function bike(o) {
  x.save(); x.translate(CX + (o.dx || 0), GY);
  x.scale(SC, SC);
  if (o.tilt) { const p = o.pivot || [0, 0]; x.translate(p[0], p[1]); x.rotate(o.tilt); x.translate(-p[0], -p[1]); }
  x.lineCap = "round"; x.lineJoin = "round";
  glow(o.c, 22, () => {
    wheel(o.c, RW[0], RW[1], o.rot); wheel(o.c, FW[0], FW[1], o.rot);
    x.strokeStyle = o.c; x.lineWidth = 9;
    x.beginPath(); x.moveTo(RW[0], RW[1]); x.lineTo(PIV[0] + 10, -112); x.stroke();          // swingarm
    x.beginPath(); x.moveTo(-10, -118); x.lineTo(118, -212); x.stroke();                    // frame
    x.beginPath(); x.moveTo(118, -212); x.lineTo(FW[0], FW[1]); x.stroke();                 // fork
    x.beginPath(); x.moveTo(-150, -180); x.lineTo(-20, -190); x.stroke();                   // seat
    x.beginPath(); x.moveTo(-25, -195); x.quadraticCurveTo(40, -250, 112, -215); x.lineTo(-25, -170); x.closePath(); x.stroke(); // tank
    x.beginPath(); x.moveTo(112, -232); x.lineTo(92, -262); x.stroke();                     // bars
    x.beginPath(); x.moveTo(-15, -92); x.lineTo(-215, -118); x.stroke();                    // exhaust
    x.beginPath(); x.moveTo(-150, -180); x.lineTo(-210, -160); x.stroke();                  // tail
    x.beginPath(); x.arc(150, -198, 16, 0, Math.PI * 2); x.stroke();                         // headlight
  });
  // engine block
  const ec = o.engineC || o.c;
  x.fillStyle = rgba(ec, 0.12 + 0.35 * (o.engine || 0)); rr(-62, -160, 112, 76, 14); x.fill();
  glow(ec, 10 + 30 * (o.engine || 0), () => { x.strokeStyle = ec; x.lineWidth = 6; rr(-62, -160, 112, 76, 14); x.stroke(); });
  // side stand (the "bone" of the x-ray)
  const tp = standTip(o.standA);
  glow(o.standC, 20 + 30 * (o.standGlow || 0), () => { x.strokeStyle = o.standC; x.lineWidth = 13 + 6 * (o.standGlow || 0); x.beginPath(); x.moveTo(PIV[0], PIV[1]); x.lineTo(tp[0], tp[1]); x.stroke();
    x.fillStyle = o.standC; x.beginPath(); x.ellipse(tp[0], tp[1], 15, 7, -o.standA, 0, Math.PI * 2); x.fill(); });
  rider(o.riderC || o.c, o.riderA || 0, o.riderDy || 0);
  x.restore();
  return [CX + (o.dx || 0) + tp[0] * SC, GY + tp[1] * SC];
}
function sparks(X, Y, k, t) {
  if (k <= 0) return;
  for (let i = 0; i < 26; i++) {
    const ph = (t * 3.2 + rnd(i)) % 1, a = Math.PI + 0.15 + rnd(i + 9) * 0.9, L = 40 + ph * (120 + rnd(i + 3) * 140);
    x.strokeStyle = rgba(i % 3 ? AMBER : WHITE, k * (1 - ph)); x.lineWidth = 4;
    x.beginPath(); x.moveTo(X + Math.cos(a) * (L - 26), Y - Math.abs(Math.sin(a)) * (L - 26) * 0.5); x.lineTo(X + Math.cos(a) * L, Y - Math.abs(Math.sin(a)) * L * 0.5); x.stroke();
  }
}
function puffs(k, t) {
  if (k <= 0) return;
  for (let i = 0; i < 5; i++) { const ph = (t * 1.4 + i / 5) % 1; x.fillStyle = rgba(CYAN, 0.18 * k * (1 - ph));
    x.beginPath(); x.arc(CX - 225 * SC - ph * 160, GY - 118 * SC - ph * 60, 18 + ph * 40, 0, Math.PI * 2); x.fill(); }
}
function engineIcon(X, Y, c, a, cut) {
  if (a <= 0) return;
  x.save(); x.translate(X, Y); x.globalAlpha = a;
  glow(c, 20, () => { x.strokeStyle = c; x.lineWidth = 8; x.lineJoin = "round";
    x.beginPath(); x.moveTo(-60, -20); x.lineTo(-30, -20); x.lineTo(-30, -40); x.lineTo(30, -40); x.lineTo(45, -20); x.lineTo(65, -20); x.lineTo(65, 35); x.lineTo(-60, 35); x.closePath(); x.stroke();
    if (cut) { x.lineWidth = 10; x.beginPath(); x.moveTo(-75, 55); x.lineTo(80, -60); x.stroke(); } });
  x.restore();
}
// integrate a speed curve v(u) from 0 to u
function integ(v, u) { let s = 0; for (let q = 0; q < u; q += 0.02) s += v(q) * 0.02; return s; }

const A_DOWN = 0.2, A_RIDE = 0.5, A_UP = 1.5;
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  let dist = 0, o = { c: RED, standA: A_DOWN, standC: RED, standGlow: 0, rot: 0, riderA: 0, engine: 0 }, puffK = 0;
  let spark = 0, tipS = null, ring = 0, ringOk = 0;
  const L = [];

  if (id === "s1") {
    const St = at("s1", "stand");
    o.standGlow = flash(u, St) + 0.5 * sm(St - 0.2, St + 0.2, u);
    L.push((tp) => tag("SIDE STAND DOWN", tp[0] + 60, TY, RED, sm(St - 0.1, St + 0.2, u)));
  }
  if (id === "s2") {
    const Ju = at("s2", "jump"), Sa = at("s2", "start"), Pu = at("s2", "pull"), Sti = at("s2", "still");
    o.riderA = sm(Ju - 0.1, Ju + 0.15, u); o.riderDy = -70 * (1 - back(Ju - 0.05, Ju + 0.35, u));
    o.engine = sm(Sa, Sa + 0.2, u) * (0.6 + 0.4 * Math.sin(u * 40)); puffK = sm(Sa, Sa + 0.3, u);
    o.standA = lerp(A_DOWN, A_RIDE, sm(Pu - 0.1, Pu + 0.3, u));
    dist = u > Pu ? 260 * (u - Pu) * (u - Pu) : 0;
    o.standGlow = sm(Sti - 0.2, Sti + 0.1, u);
    L.push(() => engineIcon(790, 640, RED, sm(Sa - 0.1, Sa + 0.15, u) * (1 - sm(Sti - 0.3, Sti - 0.1, u)), false));
    L.push((tp) => tag("STILL OUT", tp[0] + 40, TY, RED, sm(Sti - 0.1, Sti + 0.2, u)));
  }
  if (id === "s3") {
    const St = at("s3", "stall"), Ot = at("s3", "others"), Dg = at("s3", "digs"), Le = at("s3", "left");
    const v = (q) => (q < St ? 520 : q < Ot ? 520 * (1 - sm(St, St + 0.35, q)) : q < Dg ? 520 * sm(Ot, Ot + 0.3, q) : 520 * (1 - sm(Dg, Dg + 0.5, q)));
    dist = 2 * 260 * 0 + 900 + integ(v, u);
    o.riderA = 1; o.standGlow = sm(Dg - 0.2, Dg, u);
    const stalled = u >= St && u < Ot;
    o.engine = stalled ? 0 : 0.7; puffK = stalled ? 0 : 1;
    o.standA = lerp(A_RIDE, A_DOWN - 0.05, sm(Dg - 0.15, Dg, u));
    const jolt = back(Dg, Dg + 0.3, u) * (1 - 0.4 * sm(Dg + 0.6, Dg + 1.4, u));
    o.tilt = -0.1 * jolt + (u > Dg ? 0.012 * Math.sin(u * 60) * (1 - sm(Dg, Dg + 1, u)) : 0);
    o.pivot = standTip(A_DOWN - 0.05);
    spark = sm(Dg - 0.05, Dg + 0.1, u) * (1 - sm(Dg + 0.9, Dg + 1.5, u));
    L.push(() => engineIcon(790, 640, RED, sm(St - 0.1, St + 0.15, u) * (1 - sm(Ot - 0.1, Ot + 0.1, u)), true));
    L.push(() => tag("SOME BIKES STALL", CX, TY, RED, sm(St - 0.1, St + 0.2, u) * (1 - sm(Ot - 0.15, Ot, u))));
    L.push((tp) => tag("DIGS INTO THE ROAD", tp[0] + 80, TY, RED, sm(Dg - 0.1, Dg + 0.2, u)));
    L.push(() => stamp("x", 800, 760, back(Le - 0.1, Le + 0.2, u) * 0.7, RED));
  }
  if (id === "s4" || id === "s5" || id === "s6" || id === "s7" || id === "s8") { o.c = VIOLET; o.standC = VIOLET; o.riderA = 1; o.riderC = VIOLET; }
  if (id === "s4") {
    const Si = at("s4", "sit"), Ki = at("s4", "kick");
    o.riderA = sm(Si - 0.15, Si + 0.15, u); o.riderDy = -40 * (1 - sm(Si - 0.15, Si + 0.3, u));
    const up = sm(Ki, Ki + 0.35, u);
    o.standA = lerp(A_DOWN, A_UP, up); o.standC = up > 0.5 ? GREEN : VIOLET; o.standGlow = flash(u, Ki + 0.2);
    L.push(() => tag("SIT ON IT", CX, TY, VIOLET, sm(Si - 0.1, Si + 0.2, u) * (1 - sm(Ki - 0.2, Ki, u))));
    L.push((tp) => tag("KICK IT UP", tp[0] - 40, TY, GREEN, sm(Ki - 0.05, Ki + 0.25, u)));
  }
  if (id === "s5") {
    const Lo = at("s5", "look"), Fo = at("s5", "folded");
    o.standA = A_UP; o.standC = GREEN; o.standGlow = sm(Fo - 0.1, Fo + 0.2, u);
    ring = sm(Lo - 0.1, Lo + 0.3, u); ringOk = sm(Fo - 0.1, Fo + 0.2, u);
    L.push((tp) => tag("FOLDED UP", tp[0] + 40, TY, GREEN, ringOk));
    L.push(() => stamp("v", 800, 760, back(Fo, Fo + 0.3, u) * 0.7, GREEN));
  }
  if (id === "s6") {
    const Sa = at("s6", "start"), Pu = at("s6", "pull");
    o.standA = A_UP; o.standC = GREEN;
    o.engine = sm(Sa, Sa + 0.2, u) * (0.6 + 0.4 * Math.sin(u * 40)); o.engineC = GREEN; puffK = sm(Sa, Sa + 0.3, u);
    dist = u > Pu ? 300 * (u - Pu) * (u - Pu) : 0;
    L.push(() => engineIcon(790, 640, GREEN, sm(Sa - 0.1, Sa + 0.15, u), false));
    L.push(() => stamp("v", 800, 820, back(Pu + 0.2, Pu + 0.5, u) * 0.7, GREEN));
  }
  if (id === "s7" || id === "s8") { o.standA = A_UP; o.standC = GREEN; o.engine = 0.6; o.engineC = GREEN; puffK = 1; dist = 900 + 500 * u; }

  o.rot = dist / (WR * SC);
  scanner(dist, t);
  puffs(puffK, t);
  tipS = bike(o);
  sparks(tipS[0], tipS[1], spark, t);
  if (ring > 0) {
    x.save(); x.globalAlpha = ring; const R = 150 * (1.4 - 0.4 * ring), c = ringOk > 0.5 ? GREEN : CYAN;
    glow(c, 26, () => { x.strokeStyle = c; x.lineWidth = 8; x.setLineDash([26, 16]); x.lineDashOffset = -t * 60; x.beginPath(); x.arc(tipS[0] + 70, tipS[1] - 10, R, 0, Math.PI * 2); x.stroke(); });
    x.restore();
  }
  L.forEach((f) => f(tipS));

  if (id === "s1") words(["NEVER RIDE OFF", "WITH THE STAND DOWN"], RED, 380, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "stand"))));
  if (id === "s2") words(["STAND", "STILL OUT"], RED, 380, 0.0, 1, 170, flash(u, at("s2", "still")) * 0.6);
  if (id === "s3") words(["STAND", "DIGS IN"], RED, 380, 0.0, 1, 170, flash(u, at("s3", "digs")) * 0.6);
  if (id === "s4") words(["KICK IT", "UP FIRST"], GREEN, 380, 0.0, 1, 170, flash(u, at("s4", "kick")) * 0.6);
  if (id === "s5") words(["LOOK DOWN.", "CHECK IT."], GREEN, 380, 0.0, 1, 170, flash(u, at("s5", "folded")) * 0.6);
  if (id === "s6") words(["THEN", "PULL AWAY"], GREEN, 380, 0.0, 1, 170, flash(u, at("s6", "pull")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(2,10,16,0.76)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["STAND UP", "BEFORE YOU ROLL."], ORANGE, 680, 0.0, 1, 150, flash(u, 0.05));
    words(["EVERY TIME."], ORANGE, 1000, at("s7", "every") - 0.05, 1, 170, flash(u, at("s7", "every")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(2,10,16,0.88)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["side-stand-xray"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
