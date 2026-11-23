// gravel-corner (Apex 15, TikTok) - FLAT VECTOR style: top-down flat shapes, no outlines, soft long drop shadows,
// muted grass / asphalt / sand palette, rounded flat badges. The road bends right; bikes travel from the bottom to the
// top right. Wrong: a red bike sees the gravel late, grabs the brakes on the loose stones and slides out.
// Right: a violet bike looks far ahead, slows on clean road before the gravel, crosses upright with steady throttle and
// no braking, looks past the stones and leans again only on clean road. Time only from hf-seek.
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
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const RED = "#ff3b3b", GREEN = "#35d07f", VIOLET = "#8f72ff", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#14182a";
const GRASS = "#3f8f6a", ROAD = "#454b5c", ROAD_EDGE = "#5d6478", SAND = "#d9b779", SHADOW = "rgba(8,28,22,0.30)";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B2 = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }

// ---------- text (flat, bold, dark outline for legibility) ----------
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
      x.fillStyle = "rgba(0,0,0,0.35)"; x.fillText(p, 7, 9);
      x.lineWidth = Math.max(10, px * 0.15); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.5, s = 0.65 + 0.35 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 580, 1190); // above the caption pill (1240-1350)
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = SHADOW; rr(-w / 2 + 8, -h / 2 + 10, w, h, h / 2); x.fill();
  x.fillStyle = color; rr(-w / 2, -h / 2, w, h, h / 2); x.fill();
  x.fillStyle = color === WHITE ? INK : WHITE; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 600, 1170);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  x.fillStyle = SHADOW; x.beginPath(); x.arc(9, 12, 78, 0, Math.PI * 2); x.fill();
  x.fillStyle = c; x.beginPath(); x.arc(0, 0, 78, 0, Math.PI * 2); x.fill();
  x.strokeStyle = WHITE; x.lineWidth = 22; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- the bend (cubic bezier, board px) ----------
const P0 = [360, 1250], P1 = [360, 800], P2 = [540, 630], P3 = [920, 600];
function B(s) { const a = 1 - s; return [0, 1].map((i) => a * a * a * P0[i] + 3 * a * a * s * P1[i] + 3 * a * s * s * P2[i] + s * s * s * P3[i]); }
function D(s) { const a = 1 - s; return [0, 1].map((i) => 3 * a * a * (P1[i] - P0[i]) + 6 * a * s * (P2[i] - P1[i]) + 3 * s * s * (P3[i] - P2[i])); }
const heading = (s) => { const [dx, dy] = D(s); return Math.atan2(dy, dx); };
function pathS(s0, s1) { x.beginPath(); const n = 40; for (let i = 0; i <= n; i++) { const [px, py] = B(lerp(s0, s1, i / n)); i ? x.lineTo(px, py) : x.moveTo(px, py); } }
const RW = 170;
const GS = 0.5, GC = B(GS); // gravel centre on the bend
const SAMPLES = Array.from({ length: 60 }, (_, i) => B(i / 59));

// trees and bushes: flat circles with a long shadow, kept off the road
const TREES = [];
{
  const r = rng(11);
  for (let i = 0; i < 90 && TREES.length < 15; i++) {
    const X = 70 + r() * 900, Y = 560 + r() * 680, R = 34 + r() * 30;
    const dmin = Math.min(...SAMPLES.map(([sx, sy]) => Math.hypot(sx - X, sy - Y)));
    if (dmin < RW / 2 + R + 30) continue;
    if (X > 120 && X < 260 && Y > 950) continue; // keep the lean badge area clear
    if (TREES.some((t) => Math.hypot(t.X - X, t.Y - Y) < t.R + R + 12)) continue;
    TREES.push({ X, Y, R, c: r() > 0.5 ? "#2d7353" : "#28684b" });
  }
}
// gravel blob + stones
const BLOB = [], STONES = [];
{
  const r = rng(23), n = 16;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, R = 88 + r() * 34; BLOB.push([Math.cos(a) * R * 1.25, Math.sin(a) * R]); }
  const cols = ["#b8945a", "#eed29a", "#a0804d", "#c9a46a", "#f4e2b8"];
  for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.85; const R = 88; STONES.push({ X: Math.cos(a) * R * 1.25 * d, Y: Math.sin(a) * R * d, r: 4 + r() * 6, c: cols[Math.floor(r() * cols.length)] }); }
}
const ROT = heading(GS);

function world(gravelA = 1) {
  x.fillStyle = GRASS; x.fillRect(-200, -200, 1480, 2400);
  // trees: shadows first, then crowns
  for (const t of TREES) { x.fillStyle = SHADOW; x.beginPath(); x.ellipse(t.X + 16, t.Y + 20, t.R, t.R * 0.9, 0, 0, Math.PI * 2); x.fill(); }
  for (const t of TREES) {
    x.fillStyle = t.c; x.beginPath(); x.arc(t.X, t.Y, t.R, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#4f9f78"; x.beginPath(); x.arc(t.X - t.R * 0.25, t.Y - t.R * 0.25, t.R * 0.55, 0, Math.PI * 2); x.fill();
  }
  // road: edge, asphalt, extensions past both ends, centre dashes
  x.lineCap = "butt"; x.lineJoin = "round";
  for (const [w, c] of [[RW + 18, ROAD_EDGE], [RW, ROAD]]) {
    x.strokeStyle = c; x.lineWidth = w;
    x.beginPath(); x.moveTo(P0[0], 1700); x.lineTo(P0[0], P0[1]); x.stroke();
    pathS(0, 1); x.stroke();
    x.beginPath(); x.moveTo(P3[0], P3[1]); x.lineTo(1250, P3[1] - 8); x.stroke();
  }
  x.save(); x.strokeStyle = "rgba(255,255,255,0.75)"; x.lineWidth = 7; x.setLineDash([38, 34]);
  x.beginPath(); x.moveTo(P0[0], 1700); x.lineTo(P0[0], P0[1]); x.stroke(); pathS(0, 1); x.stroke(); x.restore();
  // gravel
  if (gravelA > 0) {
    x.save(); x.globalAlpha = gravelA; x.translate(GC[0], GC[1]); x.rotate(ROT);
    x.fillStyle = SAND; x.beginPath(); BLOB.forEach(([bx, by], i) => (i ? x.lineTo(bx, by) : x.moveTo(bx, by))); x.closePath(); x.fill();
    for (const s of STONES) { x.fillStyle = s.c; x.beginPath(); x.arc(s.X, s.Y, s.r, 0, Math.PI * 2); x.fill(); }
    x.restore();
  }
}
function zone(s0, s1, color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.5; x.strokeStyle = color; x.lineWidth = RW - 20; x.lineCap = "round"; pathS(s0, s1); x.stroke(); x.restore();
}
// motorcycle seen from above, nose along `ang`
function bike(X, Y, ang, col, brake = 0, a = 1) {
  if (a <= 0) return;
  for (const pass of [0, 1]) {
    x.save(); x.globalAlpha = a; x.translate(X + (pass ? 0 : 12), Y + (pass ? 0 : 16)); x.rotate(ang + Math.PI / 2); x.scale(1.15, 1.15);
    const sh = pass === 0, f = (c) => (sh ? SHADOW : c);
    x.fillStyle = f("#1c1f29"); rr(-9, 26, 18, 38, 8); x.fill(); rr(-9, -66, 18, 36, 8); x.fill(); // tyres
    x.fillStyle = f(col); x.beginPath(); x.ellipse(0, -2, 21, 44, 0, 0, Math.PI * 2); x.fill();     // body
    x.fillStyle = f("#262a38"); rr(-34, -40, 68, 8, 4); x.fill();                                   // bars
    x.fillStyle = f("#262a38"); x.beginPath(); x.ellipse(0, 10, 28, 15, 0, 0, Math.PI * 2); x.fill(); // shoulders
    x.fillStyle = f("#f2f2f2"); x.beginPath(); x.arc(0, 4, 14, 0, Math.PI * 2); x.fill();           // helmet
    if (!sh) { x.fillStyle = col; rr(-8, -6, 16, 6, 3); x.fill(); }                                   // helmet stripe
    if (!sh && brake > 0) { x.globalAlpha = a * brake; x.fillStyle = "#ff2020"; rr(-11, 60, 22, 9, 4); x.fill(); x.fillStyle = "rgba(255,40,40,0.35)"; x.beginPath(); x.arc(0, 66, 26, 0, Math.PI * 2); x.fill(); }
    x.restore();
  }
}
// rear-view lean badge (bottom left of the board)
function leanBadge(lean, color, a, label = "LEAN") {
  if (a <= 0) return;
  const X = 175, Y = 1060;
  x.save(); x.globalAlpha = a; x.translate(X, Y);
  x.fillStyle = SHADOW; x.beginPath(); x.arc(8, 10, 96, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#1c2236"; x.beginPath(); x.arc(0, 0, 96, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#3a425c"; x.fillRect(-80, 52, 160, 8); // ground
  x.save(); x.translate(0, 52); x.rotate(lean);
  x.fillStyle = "#0c0e16"; rr(-9, -50, 18, 50, 8); x.fill();      // rear tyre
  x.fillStyle = color; rr(-22, -78, 44, 34, 10); x.fill();        // bike tail
  x.fillStyle = "#30364a"; rr(-20, -118, 40, 44, 12); x.fill();   // rider back
  x.fillStyle = "#f2f2f2"; x.beginPath(); x.arc(0, -132, 15, 0, Math.PI * 2); x.fill();
  x.restore();
  x.font = FONT(28); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = WHITE; x.fillText(label, 0, -70 + 0 * 1);
  x.restore();
}
function dots(A, Bp, color, a, k = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color;
  const n = 11;
  for (let i = 1; i <= n * k; i++) { const f = i / n; x.beginPath(); x.arc(lerp(A[0], Bp[0], f), lerp(A[1], Bp[1], f), 8, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
function spray(X, Y, ang, t0, u, n = 16) {
  const r = rng(7);
  for (let i = 0; i < n; i++) {
    const da = (r() - 0.5) * 1.6, sp = 160 + r() * 260, d = r() * 0.3, tt = u - t0 - d;
    if (tt <= 0 || tt > 0.9) { r(); continue; }
    const a2 = ang + Math.PI + da, X2 = X + Math.cos(a2) * sp * tt, Y2 = Y + Math.sin(a2) * sp * tt;
    x.fillStyle = r() > 0.5 ? "#eed29a" : "#b8945a"; x.globalAlpha = 1 - tt / 0.9;
    x.beginPath(); x.arc(X2, Y2, 7, 0, Math.PI * 2); x.fill(); x.globalAlpha = 1;
  }
}
function tyreMarks(s0, s1, a) {
  if (a <= 0 || s1 <= s0) return;
  x.save(); x.globalAlpha = a * 0.7; x.strokeStyle = "#1a1a1a"; x.lineWidth = 9; x.lineCap = "round"; pathS(s0, s1); x.stroke(); x.restore();
}

// ---------- motion ----------
const G2 = at("s2", "grab");
const sW2 = (u, d) => { const k = cl(u / d); return 0.16 + 0.29 * (1 - Math.pow(1 - k, 1.5)); };
const SL = at("s3", "slides");
const sR4 = (u, d) => { const k = cl(u / d); return 0.0 + 0.34 * (1 - (1 - k) * (1 - k)); };   // slows down to the gravel edge
const sR5 = (u, d) => 0.34 + 0.3 * cl(u / d);                                                 // steady across
const sR6 = (u, d) => 0.64 + 0.3 * cl(u / d);

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.045 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 900); x.scale(z, z); x.translate(-540, -900);
  world(1);
  let BX = 0, BY = 0;

  if (id === "s1") {
    const s = lerp(-0.05, 0.16, cl((u + LEAD) / (d + LEAD)));
    const [bx, by] = s < 0 ? [P0[0], P0[1] - s * 900] : B(s);
    bike(bx, by, s < 0 ? -Math.PI / 2 : heading(s), RED); BX = bx; BY = by;
  }
  if (id === "s2") {
    const s = sW2(u, d), [bx, by] = B(s), br = sm(G2 - 0.05, G2 + 0.05, u);
    tyreMarks(Math.max(0.16, sW2(G2, d)), s, br);
    bike(bx, by, heading(s), RED, br); BX = bx; BY = by;
    if (u > G2) spray(bx, by, heading(s), G2, u, 10);
  }
  if (id === "s3") {
    const s0 = 0.45 + 0.04 * sm(0, SL, u), [px, py] = B(s0), h = heading(s0);
    const f = sm(SL - 0.15, SL + 0.7, u);
    const tx = Math.cos(h), ty = Math.sin(h), nx = ty, ny = -tx; // tangent + outside of the right-hand bend
    const bx = px + tx * 130 * f + nx * 90 * f, by = py + ty * 130 * f + ny * 90 * f;
    tyreMarks(0.33, s0, 1);
    x.save(); x.globalAlpha = 0.7 * f; x.strokeStyle = "#1a1a1a"; x.lineWidth = 9; x.lineCap = "round";
    x.beginPath(); x.moveTo(px, py); x.lineTo(bx, by); x.stroke(); x.restore();
    spray(bx, by, h, SL - 0.1, u, 18);
    bike(bx, by, h - 1.4 * f, RED, 1); BX = bx; BY = by;
  }
  if (id === "s4") {
    const s = sR4(u, d), [bx, by] = B(Math.max(0, s));
    zone(0.17, 0.34, GREEN, sm(at("s4", "slow") - 0.15, at("s4", "slow") + 0.15, u));
    const L = sm(at("s4", "look") - 0.1, at("s4", "far") + 0.2, u);
    dots([bx, by - 40], [GC[0] - 10, GC[1] + 10], GREEN, L, L);
    bike(bx, by, heading(Math.max(0.001, s)), VIOLET, sm(at("s4", "slow") - 0.05, at("s4", "slow") + 0.1, u) * (1 - sm(at("s4", "reach"), at("s4", "reach") + 0.3, u)));
    BX = bx; BY = by;
  }
  if (id === "s5") {
    const s = sR5(u, d), [bx, by] = B(s);
    bike(bx, by, heading(s), VIOLET, 0); BX = bx; BY = by;
  }
  if (id === "s6") {
    const s = sR6(u, d), [bx, by] = B(s);
    zone(0.7, 0.98, GREEN, sm(at("s6", "clean") - 0.15, at("s6", "clean") + 0.15, u));
    const L = sm(at("s6", "look") - 0.1, at("s6", "past") + 0.2, u) * (1 - sm(at("s6", "lean") - 0.1, at("s6", "lean") + 0.2, u));
    dots([bx, by], B(0.86), GREEN, L, L);
    bike(bx, by, heading(s), VIOLET, 0); BX = bx; BY = by;
  }
  if (id === "s7" || id === "s8") {
    const [bx, by] = B(0.94); bike(bx, by, heading(0.94), VIOLET, 0);
  }
  x.restore();

  // ---------- overlay (screen space) ----------
  const toScr = (X, Y) => [540 + (X - 540) * z, 900 + (Y - 900) * z];
  if (id === "s1") {
    words(["NEVER BRAKE", "ON GRAVEL"], RED, 330, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "brake"))));
    const [gx, gy] = toScr(GC[0], GC[1]);
    tag("GRAVEL", gx + 230, gy + 10, ORANGE, sm(at("s1", "gravel") - 0.1, at("s1", "gravel") + 0.25, u), 42);
    tag("BEND AHEAD", 760, 1150, WHITE, sm(at("s1", "bend") - 0.1, at("s1", "bend") + 0.2, u) * (1 - sm(at("s1", "never") - 0.1, at("s1", "never") + 0.1, u)), 38);
  }
  if (id === "s2") {
    words(["SEEN LATE.", "BRAKES ON STONES."], RED, 330, 0.0, 1, 140, flash(u, at("s2", "grab")) * 0.6);
    const [bx, by] = toScr(BX, BY);
    tag("LATE", bx + 200, by + 60, RED, sm(at("s2", "late") - 0.1, at("s2", "late") + 0.2, u) * (1 - sm(G2 - 0.1, G2, u)), 40);
    tag("GRAB", bx + 200, by + 60, RED, sm(G2 - 0.05, G2 + 0.2, u), 44);
  }
  if (id === "s3") {
    words(["NO GRIP.", "THE BIKE SLIDES."], RED, 330, 0.0, 1, 140, flash(u, SL) * 0.6);
    leanBadge(1.25 * sm(SL - 0.1, SL + 0.6, u), RED, sm(0, 0.25, u));
    const [bx, by] = toScr(BX, BY);
    tag("NO GRIP", bx + 230, by + 130, RED, sm(at("s3", "grip") - 0.15, at("s3", "grip") + 0.15, u), 42);
    const oT = at("s3", "out");
    mark("x", bx + 200, by - 60, back(oT, oT + 0.3, u) * 0.6, u > oT ? 1 : 0, RED);
  }
  if (id === "s4") {
    words(["LOOK FAR.", "SLOW DOWN BEFORE."], GREEN, 330, 0.0, 1, 140, flash(u, at("s4", "slow")) * 0.6);
    const [gx, gy] = toScr(GC[0], GC[1]);
    tag("LOOK FAR", gx + 240, gy - 10, VIOLET, sm(at("s4", "look") - 0.1, at("s4", "look") + 0.2, u), 40);
    const [zx, zy] = toScr(...B(0.25));
    tag("SLOW HERE", zx + 250, zy + 40, GREEN, sm(at("s4", "slow") - 0.1, at("s4", "slow") + 0.2, u), 40);
  }
  if (id === "s5") {
    words(["CROSS IT", "UPRIGHT"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "upright")) * 0.6);
    leanBadge(0.03 * Math.sin(u * 5), GREEN, sm(at("s5", "upright") - 0.15, at("s5", "upright") + 0.1, u), "UPRIGHT");
    const [bx, by] = toScr(BX, BY);
    tag("STEADY GAS", bx + 250, by + 120, VIOLET, sm(at("s5", "steady") - 0.15, at("s5", "steady") + 0.15, u), 38);
    tag("NO BRAKES", bx + 250, by + 120 - 95, GREEN, sm(at("s5", "no") - 0.1, at("s5", "no") + 0.2, u), 38);
  }
  if (id === "s6") {
    words(["LEAN ONLY ON", "CLEAN ROAD"], GREEN, 330, 0.0, 1, 150, flash(u, at("s6", "clean")) * 0.6);
    const lk = sm(at("s6", "lean") - 0.1, at("s6", "lean") + 0.4, u);
    leanBadge(0.45 * lk, GREEN, 1);
    const [cx2, cy2] = toScr(...B(0.86));
    tag("LOOK PAST", cx2 - 60, cy2 + 150, VIOLET, sm(at("s6", "look") - 0.1, at("s6", "look") + 0.2, u) * (1 - sm(at("s6", "clean") - 0.1, at("s6", "clean"), u)), 40);
    tag("CLEAN ROAD", cx2 - 60, cy2 + 150, GREEN, sm(at("s6", "clean") - 0.1, at("s6", "clean") + 0.2, u), 40);
    const rT = at("s6", "road");
    mark("v", 760, 1060, back(rT, rT + 0.3, u) * 0.55, u > rT ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(12,18,30,0.66)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SLOW BEFORE", "GRAVEL."], ORANGE, 560, 0.0, 1, 165, flash(u, 0.05));
    words(["CROSS IT", "UPRIGHT."], ORANGE, 930, at("s7", "cross") - 0.05, 1, 165, flash(u, at("s7", "upright")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(12,18,30,0.82)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.fillStyle = SHADOW; x.beginPath(); x.arc(10, 14, 150, 0, Math.PI * 2); x.fill();
    x.fillStyle = GRASS; x.beginPath(); x.arc(0, 0, 150, 0, Math.PI * 2); x.fill(); x.clip();
    x.strokeStyle = ROAD; x.lineWidth = 70; x.beginPath(); x.arc(-150, 150, 190, -Math.PI / 2, 0); x.stroke();
    x.restore();
    if (k > 0.3) bike(CX + 40 * k - 40, 560, -Math.PI / 4 + u * 0.15, VIOLET, 0, cl((k - 0.3) / 0.4));
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["gravel-corner-flat"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
