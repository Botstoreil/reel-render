// coast-clutch (Apex 26, TikTok) - CHALKBOARD style: a coach's chalk diagram on a green school board, a left bend seen
// from above, the bike drawn in chalk and moving along it, a clutch-lever pictogram and a gear box. Wrong: clutch held
// in all the way round, the bike runs wide and wobbles, no drive. Right: slow down and pick the gear before the bend,
// clutch out with a little throttle through it, roll on at the exit. Time only from hf-seek.
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
const RED = "#ff6f6f", GREEN = "#7dffb0", VIOLET = "#c3b0ff", ORANGE = "#ffb14a", WHITE = "#f4f6ef", INK = "#10251a", BOARD = "#1d4a33";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };

// chalk: stroke the same path three times with small fixed offsets and falling alpha
function chalk(build, c, w, seed = 1, a = 1) {
  if (a <= 0) return;
  x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = c;
  [[0, 0, 0.9, 1], [2.5, -1.5, 0.35, 0.7], [-2, 2, 0.25, 0.5]].forEach(([dx, dy, al, ww], i) => {
    x.save(); x.translate(dx * (0.6 + rnd(seed + i)), dy * (0.6 + rnd(seed + i + 9))); x.globalAlpha = al * a; x.lineWidth = w * ww; build(); x.stroke(); x.restore();
  });
  x.restore();
}

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
// chalk-boxed label
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1200);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.fillStyle = rgba(INK, 0.85); x.fillRect(-w / 2, -h / 2, w, h);
  chalk(() => { x.beginPath(); x.rect(-w / 2, -h / 2, w, h); }, color, 6, X);
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  chalk(() => { x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); }, c, 12, 5, a);
  chalk(() => { x.beginPath(); if (kind === "x") { x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); } else { x.moveTo(-38, 4); x.lineTo(-10, 32); x.lineTo(40, -28); } }, c, 20, 7, a);
  x.restore();
}

// ---------- board ----------
function board() {
  x.fillStyle = BOARD; x.fillRect(-200, -200, 1480, 2400);
  const vg = x.createRadialGradient(540, 900, 300, 540, 900, 1250); vg.addColorStop(0, "rgba(60,110,80,0.25)"); vg.addColorStop(1, "rgba(0,15,8,0.55)");
  x.fillStyle = vg; x.fillRect(-200, -200, 1480, 2400);
  // old erased chalk smudges (fixed)
  for (let i = 0; i < 16; i++) { x.fillStyle = `rgba(230,240,230,${0.025 + 0.03 * rnd(i)})`; x.beginPath(); x.ellipse(80 + 920 * rnd(i + 30), 150 + 1650 * rnd(i + 60), 120 + 160 * rnd(i + 90), 30 + 50 * rnd(i + 120), rnd(i + 150) * 3, 0, Math.PI * 2); x.fill(); }
  // wooden frame
  x.strokeStyle = "#6b4a2b"; x.lineWidth = 34; x.strokeRect(17, 17, 1046, 1886);
  x.strokeStyle = "#4a3119"; x.lineWidth = 6; x.strokeRect(34, 34, 1012, 1852);
}

// bend path (travel up, then a left-hand bend, then left)
const P0 = [700, 1300], L1 = 370, RC = 320, CC = [380, 930], ARC = (Math.PI / 2) * RC, L3 = 360, TOT = L1 + ARC + L3;
function along(s, off = 0) {
  let p, h;
  if (s < L1) { p = [P0[0], P0[1] - s]; h = -Math.PI / 2; }
  else if (s < L1 + ARC) { const th = (s - L1) / RC; p = [CC[0] + RC * Math.cos(-th), CC[1] + RC * Math.sin(-th)]; h = -Math.PI / 2 - th; }
  else { p = [CC[0] - (s - L1 - ARC), CC[1] - RC]; h = Math.PI; }
  const nx = Math.cos(h + Math.PI / 2), ny = Math.sin(h + Math.PI / 2);
  return { X: p[0] + nx * off, Y: p[1] + ny * off, h };
}
function trace(off, s0 = 0, s1 = TOT) { x.beginPath(); for (let s = s0; s <= s1; s += 12) { const q = along(s, off); s === s0 ? x.moveTo(q.X, q.Y) : x.lineTo(q.X, q.Y); } }
function road() {
  chalk(() => trace(-90), WHITE, 9, 11);
  chalk(() => trace(90), WHITE, 9, 12);
  x.save(); x.setLineDash([34, 30]); chalk(() => trace(0), rgba(WHITE, 0.7), 5, 13); x.restore();
}
function bike(s, c, o = {}) {
  const { off = 0, wob = 0 } = o;
  const q = along(s, off);
  x.save(); x.translate(q.X, q.Y); x.rotate(q.h + Math.PI / 2 + wob);
  x.fillStyle = rgba(INK, 0.6); rr(-26, -96, 52, 196, 22); x.fill();
  chalk(() => rr(-11, -100, 22, 44, 10), c, 7, 21);
  chalk(() => rr(-11, 54, 22, 44, 10), c, 7, 22);
  chalk(() => rr(-22, -58, 44, 118, 18), c, 8, 23);
  chalk(() => { x.beginPath(); x.moveTo(-52, -52); x.lineTo(52, -52); }, c, 8, 24);
  chalk(() => { x.beginPath(); x.arc(0, 4, 21, 0, Math.PI * 2); }, c, 8, 25);
  x.restore();
  return q;
}
// clutch lever pictogram: pull 0 = open (lever out), 1 = pulled in
function lever(X, Y, pull, c, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y);
  chalk(() => { x.beginPath(); x.moveTo(-90, 0); x.lineTo(90, 0); }, WHITE, 10, 31);             // bar
  chalk(() => rr(-20, -18, 110, 36, 16), WHITE, 8, 32);                                          // grip
  x.save(); x.translate(-30, -26); x.rotate(lerp(-0.55, -0.06, pull));
  chalk(() => { x.beginPath(); x.moveTo(0, 0); x.lineTo(130, 0); }, c, 14, 33);                  // lever
  x.restore();
  x.restore();
}
function gearBox(X, Y, g, c, a, pop) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); const s = 1 + 0.25 * pop; x.scale(s, s);
  x.fillStyle = rgba(INK, 0.8); x.fillRect(-60, -75, 120, 150);
  chalk(() => { x.beginPath(); x.rect(-60, -75, 120, 150); }, c, 7, 41);
  x.font = FONT(100); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = c; x.fillText(String(g), 0, 6);
  x.restore();
}
function wobbleMarks(q, a, t) {
  if (a <= 0) return;
  for (let i = 0; i < 3; i++) {
    const r = 70 + i * 26 + 8 * Math.sin(t * 20 + i);
    chalk(() => { x.beginPath(); x.arc(q.X, q.Y, r, q.h + 0.6, q.h + 1.4); }, RED, 6, 50 + i, a);
    chalk(() => { x.beginPath(); x.arc(q.X, q.Y, r, q.h - 1.4, q.h - 0.6); }, RED, 6, 60 + i, a);
  }
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  board();
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  road();
  const L = [];

  if (id === "s1") {
    const Cl = at("s1", "clutch"), Co = at("s1", "coast");
    const s = lerp(0, 300, sm(0, d, u));
    bike(s, RED);
    L.push(() => lever(800, 640, sm(Cl - 0.1, Cl + 0.2, u), RED, sm(Cl - 0.3, Cl, u)));
    L.push(() => tag("CLUTCH IN", 790, 760, RED, sm(Cl - 0.05, Cl + 0.2, u)));
    L.push(() => tag("COASTING", 300, 1150, RED, sm(Co - 0.1, Co + 0.2, u)));
  }
  if (id === "s2") {
    const Ho = at("s2", "hold"), Ro = at("s2", "round");
    const s = lerp(300, 640, sm(0, d, u));
    const q = bike(s, RED, { off: 20 * sm(Ro, d, u) });
    L.push(() => lever(800, 640, 1, RED, 1));
    L.push(() => tag("HELD IN", 790, 760, RED, sm(Ho - 0.1, Ho + 0.2, u)));
    L.push(() => tag("ALL THE WAY ROUND", 420, 1170, RED, sm(Ro - 0.2, Ro + 0.1, u)));
    void q;
  }
  if (id === "s3") {
    const Lo = at("s3", "loose"), Dr = at("s3", "drive"), St = at("s3", "steady");
    const s = lerp(640, 960, sm(0, d, u));
    const wide = sm(0, d, u);
    const wob = 0.16 * Math.sin(u * 14) * sm(Lo - 0.2, Lo + 0.2, u);
    const q = bike(s, RED, { off: lerp(20, 120, wide), wob });
    wobbleMarks(q, sm(Lo - 0.2, Lo + 0.1, u), t);
    L.push(() => lever(800, 640, 1, RED, 1));
    L.push(() => tag("LOOSE", 560, 1000, RED, sm(Lo - 0.1, Lo + 0.2, u)));
    L.push(() => tag("NO DRIVE", 300, 1120, RED, sm(Dr - 0.1, Dr + 0.2, u)));
    L.push(() => mark("x", 160, 610, back(St, St + 0.3, u) * 0.55, u > St - 0.05 ? 1 : 0, RED));
  }
  if (id === "s4") {
    const Sl = at("s4", "slow"), Ge = at("s4", "gear"), Be = at("s4", "before");
    const s = lerp(0, 330, 1 - Math.pow(1 - sm(0, d, u), 2));
    // green racing line ahead
    x.save(); x.setLineDash([10, 22]); chalk(() => trace(-10, s + 110, TOT), GREEN, 7, 70, sm(0, 0.3, u)); x.restore();
    bike(s, VIOLET);
    L.push(() => tag("SLOW DOWN", 300, 1150, GREEN, sm(Sl - 0.1, Sl + 0.2, u)));
    L.push(() => gearBox(860, 900, u > Ge + 0.1 ? 2 : 3, GREEN, sm(Ge - 0.3, Ge, u), flash(u, Ge + 0.12)));
    L.push(() => tag("GEAR IN", 840, 1060, GREEN, sm(Ge - 0.05, Ge + 0.2, u)));
    L.push(() => tag("BEFORE THE BEND", 500, 640, VIOLET, sm(Be - 0.1, Be + 0.2, u)));
  }
  if (id === "s5") {
    const Ou = at("s5", "out"), Th = at("s5", "throttle"), Tu = at("s5", "turn");
    const s = lerp(330, 760, sm(0, d, u));
    x.save(); x.setLineDash([10, 22]); chalk(() => trace(-10, s + 110, TOT), GREEN, 7, 70); x.restore();
    const q = bike(s, VIOLET, { off: -10 });
    L.push(() => lever(800, 640, 1 - sm(Ou - 0.3, Ou + 0.1, u), GREEN, 1));
    L.push(() => tag("CLUTCH OUT", 790, 760, GREEN, sm(Ou - 0.1, Ou + 0.2, u)));
    L.push(() => tag("A LITTLE GAS", 330, 1150, VIOLET, sm(Th - 0.1, Th + 0.2, u)));
    L.push(() => gearBox(860, 900, 2, GREEN, 1, 0));
    // steady drive arrows behind the bike
    if (u > Th) chalk(() => { const b = along(Math.max(0, s - 120), -10); x.beginPath(); x.moveTo(b.X, b.Y); x.lineTo(q.X - Math.cos(q.h) * 60, q.Y - Math.sin(q.h) * 60); }, GREEN, 10, 80, sm(Th, Th + 0.3, u));
    void Tu;
  }
  if (id === "s6") {
    const Ro = at("s6", "roll"), Ex = at("s6", "exit");
    const s = lerp(760, TOT - 60, Math.pow(sm(0, d + 0.2, u), 1.6));
    x.save(); x.setLineDash([10, 22]); chalk(() => trace(-10, s + 110, TOT), GREEN, 7, 70); x.restore();
    const q = bike(s, VIOLET, { off: -10 });
    // speed lines (rolling on)
    for (let i = 0; i < 3; i++) chalk(() => { const b = along(Math.max(0, s - 110 - i * 30), -10 + (i - 1) * 30); const e = along(Math.max(0, s - 220 - i * 40), -10 + (i - 1) * 30); x.beginPath(); x.moveTo(b.X, b.Y); x.lineTo(e.X, e.Y); }, GREEN, 6, 90 + i, sm(Ro, Ro + 0.3, u));
    L.push(() => tag("ROLL ON", 330, 1150, GREEN, sm(Ro - 0.1, Ro + 0.2, u)));
    L.push(() => tag("EXIT", 180, 620, GREEN, sm(Ex - 0.15, Ex + 0.1, u)));
    L.push(() => mark("v", 820, 1100, back(Ex + 0.1, Ex + 0.4, u) * 0.55, u > Ex ? 1 : 0, GREEN));
    void q;
  }
  if (id === "s7") { bike(TOT - 60, VIOLET, { off: -10 }); }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER COAST", "THROUGH A BEND"], RED, 390, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "coast"))));
  if (id === "s2") words(["CLUTCH HELD", "ALL THE WAY"], RED, 390, 0.0, 1, 160, flash(u, at("s2", "clutch")) * 0.6);
  if (id === "s3") words(["NO DRIVE,", "NO GRIP"], RED, 390, 0.0, 1, 170, flash(u, at("s3", "drive")) * 0.6);
  if (id === "s4") words(["GEAR IN", "BEFORE THE BEND"], GREEN, 390, 0.0, 1, 150, flash(u, at("s4", "gear")) * 0.6);
  if (id === "s5") words(["CLUTCH OUT,", "A LITTLE GAS"], GREEN, 390, 0.0, 1, 150, flash(u, at("s5", "throttle")) * 0.6);
  if (id === "s6") words(["ROLL ON", "AT THE EXIT"], GREEN, 390, 0.0, 1, 160, flash(u, at("s6", "exit")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,24,15,0.70)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["GEAR IN", "BEFORE THE BEND."], ORANGE, 590, 0.0, 1, 150, flash(u, 0.05));
    words(["DRIVE", "THROUGH IT."], ORANGE, 960, at("s7", "drive") - 0.05, 1, 160, flash(u, at("s7", "drive")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,24,15,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 590); x.scale(k, k);
    x.translate(-along(0).X, -along(0).Y); bike(0, VIOLET); x.restore();
    words([c1], WHITE, 820, 0.15, 1, 130);
    words([c2], RED, 1000, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1160, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["coast-clutch-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
