// helmet-strap (Apex 25, TikTok) - COMIC BOOK style: halftone dot backgrounds, thick black ink outlines, flat colours,
// a framed panel and burst shapes. A rider's head in profile, open-face helmet. Wrong: strap left open, flapping on the
// ride, in a fall the helmet comes off. Right: close it every time, snug with two fingers under the chin, try to roll it
// off and it stays. Time only from hf-seek.
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
const RED = "#ff3b4e", GREEN = "#2fe07f", VIOLET = "#9b7bff", ORANGE = "#ff9a2a", WHITE = "#ffffff", INK = "#111018", YEL = "#ffd83a";
const SKIN = "#f2b48a", JACKET = "#2a2f45";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const ink = (fill, lw = 8) => { if (fill) { x.fillStyle = fill; x.fill(); } x.strokeStyle = INK; x.lineWidth = lw; x.stroke(); };

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
      x.lineWidth = Math.max(14, px * 0.18); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// comic caption box
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1330);
  x.translate(X, Y); x.rotate(-0.03); x.scale(s, s);
  x.fillStyle = INK; x.fillRect(-w / 2 + 10, -h / 2 + 10, w, h);
  x.fillStyle = color; x.fillRect(-w / 2, -h / 2, w, h);
  x.strokeStyle = INK; x.lineWidth = 6; x.strokeRect(-w / 2, -h / 2, w, h);
  x.fillStyle = INK; x.fillText(txt, 0, 3); x.restore();
}
function burst(X, Y, R, a, c = YEL) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(back(0, 1, a), back(0, 1, a));
  x.beginPath(); const n = 14;
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? R * 0.62 : R, an = (i / (n * 2)) * Math.PI * 2; x.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
  x.closePath(); ink(c, 8); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); ink(c, 10);
  x.strokeStyle = INK; x.lineWidth = 22; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- halftone panel ----------
function panel(bg, dot, t, ox = 760, oy = 700) {
  x.fillStyle = bg; x.fillRect(-200, -200, 1480, 2400);
  const drift = (t * 14) % 36;
  x.fillStyle = dot;
  for (let Y = -36; Y < 1960; Y += 36) for (let X = -36; X < 1120; X += 36) {
    const px = X + ((Y / 36) % 2 ? 18 : 0) - drift, d = Math.hypot(px - ox, Y - oy), r = cl(13 - d / 95, 2, 13);
    x.beginPath(); x.arc(px, Y, r, 0, Math.PI * 2); x.fill();
  }
  x.strokeStyle = INK; x.lineWidth = 16; x.strokeRect(36, 36, 1008, 1848);
}
function speedLines(t, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  for (let i = 0; i < 14; i++) {
    const y = 620 + i * 58, L = 160 + (i * 97) % 220, xs = 1100 - ((t * 1500 + i * 173) % 1500);
    x.strokeStyle = i % 2 ? WHITE : INK; x.lineWidth = i % 2 ? 12 : 7;
    x.beginPath(); x.moveTo(xs, y); x.lineTo(xs + L, y); x.stroke();
  }
  x.restore();
}

// ---------- rider head (profile, faces right), local units ----------
const HX = 500, HY = 880, HS = 1.6;
const sx = (lx) => HX + lx * HS, sy = (ly) => HY + ly * HS;
function body() {
  rr(-175, 165, 320, 220, 70); ink(JACKET);
  x.beginPath(); x.moveTo(-40, 60); x.lineTo(32, 60); x.lineTo(38, 185); x.lineTo(-46, 185); x.closePath(); ink(SKIN);
}
function face() {
  x.beginPath(); x.arc(0, 0, 96, 0, Math.PI * 2); ink(SKIN);
  x.beginPath(); x.moveTo(92, -6); x.lineTo(120, 26); x.lineTo(94, 36); ink(SKIN, 7);       // nose
  x.fillStyle = INK; x.beginPath(); x.arc(60, -14, 9, 0, Math.PI * 2); x.fill();          // eye
  x.lineWidth = 7; x.beginPath(); x.moveTo(40, -36); x.lineTo(78, -40); x.stroke();        // brow
  x.beginPath(); x.moveTo(72, 62); x.quadraticCurveTo(88, 66, 96, 56); x.stroke();        // mouth
}
// strap state: k 0 open .. 1 closed, snug 0..1, sway (open flap)
function helmet(c, o = {}) {
  const { k = 0, snug = 0, sway = 0, fingers = 0, strapC = c } = o;
  // shell
  x.beginPath(); x.ellipse(-5, -18, 122, 116, 0, Math.PI * 0.6, Math.PI * 1.9);
  x.lineTo(30, -46); x.lineTo(2, 40); x.lineTo(-8, 78); x.closePath(); ink(c, 9);
  x.beginPath(); x.ellipse(-5, -18, 96, 90, 0, Math.PI * 1.08, Math.PI * 1.62); x.strokeStyle = WHITE; x.lineWidth = 10; x.lineCap = "round"; x.stroke();   // shine
  x.beginPath(); x.moveTo(84, -76); x.lineTo(156, -60); x.lineTo(104, -40); x.closePath(); ink(c, 7);                                                // peak
  x.beginPath(); x.arc(-8, 70, 9, 0, Math.PI * 2); ink("#cccccc", 5);                                                                                // rivet
  // fingers under the strap (drawn before the strap)
  if (fingers > 0) {
    const fx = lerp(260, 18, fingers);
    for (const fy of [102, 128]) { rr(fx, fy, 210, 24, 12); ink(SKIN, 6); }
    rr(fx + 190, 86, 120, 84, 32); ink(SKIN, 6);
  }
  // strap: anchor A (rivet) -> buckle Q -> chin C
  const A = [-8, 70], C = [70, 98];
  const Qc = [32, lerp(156, 128, snug)];
  const Qo = [-8 + sway * 1.6, 178 + Math.abs(sway) * 0.2];
  const Q = [lerp(Qo[0], Qc[0], k), lerp(Qo[1], Qc[1], k)];
  x.lineCap = "round"; x.lineJoin = "round";
  const strap = (pts) => { x.beginPath(); x.moveTo(...pts[0]); for (const p of pts.slice(1)) x.lineTo(...p); x.strokeStyle = INK; x.lineWidth = 22; x.stroke(); x.strokeStyle = strapC; x.lineWidth = 12; x.stroke(); };
  strap([A, [lerp(-8 + sway * 0.8, A[0] + (Q[0] - A[0]) * 0.5, k), lerp(126, A[1] + (Q[1] - A[1]) * 0.5, k)], Q]);
  const E = [lerp(84 + sway * 0.6, Q[0] + 14, k), lerp(170, Q[1], k)];
  strap([C, [lerp(80 + sway * 0.3, (C[0] + E[0]) / 2, k), lerp(134, (C[1] + E[1]) / 2, k)], E]);
  x.save(); x.translate(Q[0], Q[1]); x.rotate(lerp(sway * 0.01, -0.5, k)); rr(-18, -13, 36, 26, 6); ink("#d9d9e0", 6); x.restore();   // buckle
  return { Q, A, C };
}
// whole head: o.headT {dx,dy,rot}, o.helmT {dx,dy,rot} extra for the helmet only
function rider(c, o = {}) {
  const { bob = 0, hd = { dx: 0, dy: 0, rot: 0 }, hm = { dx: 0, dy: 0, rot: 0 } } = o;
  x.save(); x.translate(HX, HY + bob); x.scale(HS, HS);
  x.save(); x.translate(hd.dx * 0.4, hd.dy * 0.4); body(); x.restore();
  x.translate(hd.dx, hd.dy); x.rotate(hd.rot);
  face();
  x.save(); x.translate(hm.dx, hm.dy); x.rotate(hm.rot); const r = helmet(c, o); x.restore();
  x.restore();
  return r;
}
function hand(X, Y, rot, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(rot);
  for (let i = 0; i < 4; i++) { rr(60, -60 + i * 30, 90, 26, 13); ink("#3b3f58", 6); }
  rr(-90, -66, 170, 130, 36); ink("#3b3f58", 7);
  x.restore();
}
function arrowArc(cx, cy, r, a0, a1, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  x.beginPath(); x.arc(cx, cy, r, a0, a1); x.strokeStyle = INK; x.lineWidth = 26; x.stroke(); x.strokeStyle = c; x.lineWidth = 14; x.stroke();
  const ex = cx + Math.cos(a1) * r, ey = cy + Math.sin(a1) * r, tg = a1 + Math.PI / 2;
  x.beginPath(); x.moveTo(ex + Math.cos(tg) * 40, ey + Math.sin(tg) * 40); x.lineTo(ex + Math.cos(tg + 2.3) * 34, ey + Math.sin(tg + 2.3) * 34); x.lineTo(ex + Math.cos(tg - 2.3) * 34, ey + Math.sin(tg - 2.3) * 34); x.closePath(); ink(c, 6);
  x.restore();
}
function clock(X, Y, a, t) {
  if (a <= 0) return;
  const s = back(0, 1, a);
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); ink(WHITE, 9);
  x.strokeStyle = INK; x.lineWidth = 9; x.lineCap = "round";
  x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -46); x.stroke();
  const an = -Math.PI / 2 + t * 3; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(an) * 40, Math.sin(an) * 40); x.stroke();
  x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.05 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  const L = [];
  const bob = Math.sin(t * 5) * 6;

  if (id === "s1") {
    const Lv = at("s1", "leave"), Op = at("s1", "open");
    panel("#e85a6c", "#b8243a", t);
    const r = rider(RED, { bob, k: 0, sway: Math.sin(t * 4) * 8 });
    L.push(() => burst(sx(r.Q[0]) + 10, sy(r.Q[1]) + bob, 110, sm(Op - 0.15, Op + 0.1, u)));
    L.push(() => tag("OPEN", sx(r.Q[0]) + 10, sy(r.Q[1]) + bob, RED, sm(Op - 0.1, Op + 0.2, u), 54));
    L.push(() => tag("SHORT RIDE?", 300, 600, WHITE, sm(0, 0.25, u) * (1 - sm(Lv + 0.3, Lv + 0.5, u))));
  }
  if (id === "s2") {
    const Bu = at("s2", "buckle"), Lo = at("s2", "loose");
    panel("#ee7a68", "#c23a2e", t, 300, 900);
    speedLines(t, sm(0, 0.3, u));
    const sway = Math.sin(t * 17) * 26 * sm(0, 0.4, u);
    const r = rider(RED, { bob: Math.sin(t * 9) * 8, k: 0, sway });
    L.push(() => tag("RIDING OFF", 330, 600, WHITE, sm(at("s2", "ride") - 0.1, at("s2", "ride") + 0.2, u)));
    L.push(() => tag("LOOSE BUCKLE", sx(r.Q[0]) + 60, sy(r.Q[1]) + 110, RED, sm(Lo - 0.2, Lo + 0.1, u)));
    L.push(() => burst(sx(r.Q[0]), sy(r.Q[1]), 70, 0.6 * sm(Bu - 0.1, Bu + 0.1, u) * (0.6 + 0.4 * Math.sin(u * 14))));
  }
  if (id === "s3") {
    const Fa = at("s3", "fall"), Of = at("s3", "off"), Ro = at("s3", "road");
    panel("#d9475a", "#9e1a2c", t, 540, 1200);
    const fall = sm(Fa - 0.1, Ro + 0.15, u);
    const off = sm(Of - 0.25, Of + 0.5, u);
    // ground slab rises into view
    x.save(); x.beginPath(); x.rect(36, lerp(1500, 1230, fall), 1008, 700); ink("#3a3a46", 10);
    x.strokeStyle = WHITE; x.lineWidth = 14; x.setLineDash([90, 70]); x.beginPath(); x.moveTo(36, lerp(1560, 1290, fall)); x.lineTo(1044, lerp(1560, 1290, fall)); x.stroke(); x.restore();
    rider(RED, { k: 0, sway: Math.sin(t * 12) * 18, hd: { dx: 40 * fall, dy: 110 * fall, rot: 0.45 * fall }, hm: { dx: -150 * off, dy: -130 * off + 30 * off * off, rot: -0.9 * off } });
    L.push(() => burst(330, 640, 150, sm(Of - 0.05, Of + 0.15, u) * (1 - sm(Of + 0.6, Of + 0.9, u))));
    L.push(() => tag("HELMET OFF", 330, 640, RED, sm(Of - 0.05, Of + 0.2, u), 50));
    L.push(() => burst(640, 1250, 140, sm(Ro - 0.15, Ro + 0.05, u), "#ffffff"));
    L.push(() => mark("x", 780, 1180, back(Ro, Ro + 0.3, u) * 0.6, u > Ro - 0.05 ? 1 : 0, RED));
  }
  if (id === "s4") {
    const Cl = at("s4", "close"), St = at("s4", "strap"), Ev = at("s4", "every"), Mi = at("s4", "one");
    panel("#5fc98c", "#23874f", t);
    const k = sm(Cl - 0.1, St + 0.1, u);
    const r = rider(VIOLET, { bob: bob * 0.5, k, sway: (1 - k) * Math.sin(t * 4) * 8, strapC: GREEN });
    L.push(() => burst(sx(r.Q[0]), sy(r.Q[1]), 120, sm(St - 0.05, St + 0.1, u) * (1 - sm(St + 0.5, St + 0.8, u))));
    L.push(() => tag("CLICK", sx(r.Q[0]), sy(r.Q[1]), GREEN, sm(St - 0.05, St + 0.15, u) * (1 - sm(St + 0.5, St + 0.8, u)), 56));
    L.push(() => tag("EVERY TIME", 330, 610, GREEN, sm(Ev - 0.1, Ev + 0.2, u)));
    L.push(() => clock(790, 1180, sm(Mi - 0.2, Mi + 0.2, u), u));
    L.push(() => tag("EVEN 1 MINUTE", 330, 1165, VIOLET, sm(Mi - 0.1, Mi + 0.2, u)));
  }
  if (id === "s5") {
    const Pu = at("s5", "pull"), Sn = at("s5", "snug"), Tw = at("s5", "two"), Fi = at("s5", "fingers");
    panel("#62cf93", "#25905a", t, 700, 1000);
    const snug = sm(Pu, Sn + 0.2, u), fin = sm(Tw - 0.1, Fi + 0.4, u);
    const r = rider(VIOLET, { k: 1, snug, fingers: fin, strapC: GREEN });
    L.push(() => tag("PULL SNUG", 320, 610, GREEN, sm(Pu - 0.1, Pu + 0.2, u)));
    L.push(() => tag("TWO FINGERS", 300, 1165, VIOLET, sm(Tw - 0.1, Tw + 0.2, u)));
    L.push(() => mark("v", 850, 1240, back(Fi + 0.3, Fi + 0.6, u) * 0.5, u > Fi + 0.25 ? 1 : 0, GREEN));
  }
  if (id === "s6") {
    const Ro = at("s6", "roll"), No = at("s6", "not"), Mo = at("s6", "move");
    panel("#9384e8", "#5b40cf", t, 300, 800);
    const push = sm(Ro - 0.15, Ro + 0.2, u) * (1 - sm(No, No + 0.3, u));
    const wob = 0.06 * Math.sin((u - Ro) * 18) * push;
    rider(VIOLET, { k: 1, snug: 1, strapC: GREEN, hm: { dx: 0, dy: 0, rot: wob } });
    hand(sx(-115) + 14 * push, sy(-95) + 10 * push, 0.5, sm(Ro - 0.3, Ro, u) * (1 - sm(Mo + 0.1, Mo + 0.4, u)));
    L.push(() => arrowArc(HX - 10, HY - 30, 300, Math.PI * 1.15, Math.PI * 1.15 + 0.9 * sm(Ro - 0.1, Ro + 0.4, u), sm(Ro - 0.2, Ro, u) * (1 - sm(No, No + 0.2, u)), WHITE));
    L.push(() => tag("TRY TO ROLL IT", 360, 600, VIOLET, sm(at("s6", "try") - 0.1, at("s6", "try") + 0.2, u)));
    L.push(() => tag("IT STAYS", 300, 1165, GREEN, sm(No - 0.1, No + 0.2, u)));
    L.push(() => mark("v", 830, 1180, back(Mo, Mo + 0.3, u) * 0.55, u > Mo - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") { panel("#9384e8", "#5b40cf", t, 300, 800); if (id === "s7") rider(VIOLET, { bob: bob * 0.4, k: 1, snug: 1, strapC: GREEN }); }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER LEAVE", "THE STRAP OPEN"], RED, 400, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "open"))));
  if (id === "s2") words(["BUCKLE", "HANGING LOOSE"], RED, 400, 0.0, 1, 160, flash(u, at("s2", "loose")) * 0.6);
  if (id === "s3") words(["THE HELMET", "COMES OFF"], RED, 400, 0.0, 1, 160, flash(u, at("s3", "off")) * 0.6);
  if (id === "s4") words(["CLOSE IT", "EVERY TIME"], GREEN, 400, 0.0, 1, 160, flash(u, at("s4", "close")) * 0.6);
  if (id === "s5") words(["SNUG:", "TWO FINGERS"], GREEN, 400, 0.0, 1, 160, flash(u, at("s5", "fingers")) * 0.6);
  if (id === "s6") words(["IT SHOULD", "NOT MOVE"], GREEN, 400, 0.0, 1, 170, flash(u, at("s6", "not")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(10,8,30,0.70)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CLOSE IT", "EVERY RIDE."], ORANGE, 590, 0.0, 1, 160, flash(u, 0.05));
    words(["TWO FINGERS,", "SNUG."], ORANGE, 960, at("s7", "two") - 0.05, 1, 160, flash(u, at("s7", "two")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(10,8,30,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k * 0.95, k * 0.95); helmet(VIOLET, { k: 1, snug: 1, strapC: GREEN }); x.restore();
    words([c1], WHITE, 820, 0.15, 1, 130);
    words([c2], RED, 1000, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1160, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["helmet-strap-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
