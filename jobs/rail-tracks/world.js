// rail-tracks (Apex 11, TikTok) - CHALKBOARD style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-chalkboard.js):
// a coach's chalk diagram, seen from above: road, railway tracks with their grooves, a motorcycle and its path.
// Wrong: the bike follows the bend and meets the rails at a shallow angle; zoom in, the front tyre drops into the
// groove beside the rail and gets steered. Right: use the lane to straighten up and cross square (90 deg), upright,
// steady throttle, no brakes on the rails; when wet, slow down in the zone before the tracks, not on them.
// Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

// chalk colours
const RED = "#ff8f8f", GREEN = "#a6f2b4", VIOLET = "#f4f1e6", ORANGE = "#ffc078", WHITE = "#ffffff", YELLOW = "#fff09a", BLUE = "#a8d8ff", BG = "#24432f";
const CX = 510;
const cv = document.getElementById("world");
const out = cv.getContext("2d");
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mk = () => { const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; return c; };
const boardC = mk(); {
  const b = boardC.getContext("2d"), r = rng(3);
  b.fillStyle = BG; b.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 46; i++) { b.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.022})`; b.beginPath(); b.ellipse(r() * 1080, r() * 1920, 80 + r() * 220, 30 + r() * 90, r() * 3, 0, Math.PI * 2); b.fill(); }
  b.fillStyle = "#7a5230"; b.fillRect(0, 0, 1080, 26); b.fillRect(0, 0, 26, 1920); b.fillRect(1054, 0, 26, 1920); b.fillRect(0, 1860, 1080, 60);
  b.fillStyle = "#5c3d22"; b.fillRect(0, 1860, 1080, 10);
  b.fillStyle = "#f4f1e6"; b.fillRect(300, 1872, 70, 14); b.fillStyle = "#ffc078"; b.fillRect(420, 1874, 50, 12);
}
const grainC = mk(); {
  const g = grainC.getContext("2d"), r = rng(9);
  for (let i = 0; i < 90000; i++) { g.fillStyle = `rgba(0,0,0,${0.35 + r() * 0.55})`; g.fillRect(Math.floor(r() * 1080), Math.floor(r() * 1920), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); }
}
const inkC = mk(), ink = inkC.getContext("2d");
const BR = [0x24, 0x43, 0x2f];
function boardOf(v) {
  if (typeof v !== "string") return v;
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  if (0.3 * r + 0.59 * g + 0.11 * b >= 70) return v;
  return `rgba(${BR[0]},${BR[1]},${BR[2]},${a})`;
}
const x = new Proxy(ink, {
  get(t, k) { const v = t[k]; return typeof v === "function" ? v.bind(t) : v; },
  set(t, k, v) { if (k === "fillStyle" || k === "strokeStyle") v = boardOf(v); t[k] = v; return true; },
});
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function glow() { x.shadowBlur = 0; }
function noGlow() { x.shadowBlur = 0; }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (840 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.05, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.32, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.12, curU);
      const s = 0.4 + 0.6 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.rotate((((wi + li * 3) * 7919) % 13 - 6) * 0.007); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
      x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * a;
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.strokeStyle = color; x.lineWidth = 22;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.beginPath();
  if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); }
  else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
  x.stroke(); x.restore();
}

// ---------- geometry (board px) ----------
const C = [540, 1000];                      // where both paths meet the tracks
const RA = -0.55;                           // rail direction angle
const RD = [Math.cos(RA), Math.sin(RA)], RN = [-Math.sin(RA), Math.cos(RA)];
const GAUGE = 62;                           // half the distance between the two rails
const V = [Math.sin(RA), -Math.cos(RA)];    // perpendicular to the rails, pointing up-left
const W8 = [0.6, -0.8];                     // heading of the bend at the tracks (about 22 deg to the rails)
const cub = (P, t) => { const m = 1 - t; return [0, 1].map((i) => m * m * m * P[0][i] + 3 * m * m * t * P[1][i] + 3 * m * t * t * P[2][i] + t * t * t * P[3][i]); };
function buildPath(P, tail) {
  const pts = [];
  for (let i = 0; i <= 120; i++) pts.push(cub(P, i / 120));
  for (let i = 1; i <= 40; i++) pts.push([C[0] + tail[0] * (i / 40), C[1] + tail[1] * (i / 40)]);
  const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1], pc = L[120] / tot;
  const pos = (p) => {
    const s = cl(p) * tot; let i = 1; while (i < L.length - 1 && L[i] < s) i++;
    const k = (s - L[i - 1]) / Math.max(1e-6, L[i] - L[i - 1]);
    const A = pts[i - 1], B = pts[i];
    return { X: lerp(A[0], B[0], k), Y: lerp(A[1], B[1], k), h: Math.atan2(B[1] - A[1], B[0] - A[0]) };
  };
  return { pts, pos, pc };
}
// road centre line = the wrong path (it just follows the bend)
const WRONG = buildPath([[400, 1660], [400, 1380], [C[0] - 120 * 1.4, C[1] + 160 * 1.4], C], [W8[0] * 420, W8[1] * 420]);
const RIGHT = buildPath([[600, 1680], [600, 1430], [C[0] - V[0] * 240, C[1] - V[1] * 240], C], [V[0] * 300, V[1] * 300]);

function strokePath(P, p0, p1, color, a, dash = [26, 22], lw = 9) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = lw; x.lineCap = "round"; x.setLineDash(dash);
  x.beginPath(); const n = P.pts.length;
  for (let i = Math.floor(p0 * (n - 1)); i <= Math.floor(p1 * (n - 1)); i++) { const q = P.pts[i]; i === Math.floor(p0 * (n - 1)) ? x.moveTo(q[0], q[1]) : x.lineTo(q[0], q[1]); }
  x.stroke(); x.restore();
}
function road(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.55; x.strokeStyle = VIOLET; x.lineWidth = 7; x.lineCap = "round";
  for (const side of [-1, 1]) {
    x.beginPath();
    WRONG.pts.forEach((q, i) => {
      const nx = i ? WRONG.pts[i][1] - WRONG.pts[i - 1][1] : WRONG.pts[1][1] - WRONG.pts[0][1];
      const ny = i ? -(WRONG.pts[i][0] - WRONG.pts[i - 1][0]) : -(WRONG.pts[1][0] - WRONG.pts[0][0]);
      const l = Math.hypot(nx, ny) || 1, o = 260 * side;
      const X = q[0] + (nx / l) * o, Y = q[1] + (ny / l) * o;
      i ? x.lineTo(X, Y) : x.moveTo(X, Y);
    });
    x.stroke();
  }
  x.restore();
}
// two rails with a groove beside each one (the gap a tyre can fall into), on sleepers
function rails(a, shine = 0, t = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  const L = 900;
  x.strokeStyle = mix("#c9a27a", WHITE, 0.15); x.lineWidth = 12;
  for (let s = -L; s <= L; s += 58) {
    const cx = C[0] + RD[0] * s, cy = C[1] + RD[1] * s;
    x.beginPath(); x.moveTo(cx - RN[0] * 100, cy - RN[1] * 100); x.lineTo(cx + RN[0] * 100, cy + RN[1] * 100); x.stroke();
  }
  for (const side of [-1, 1]) {
    const o = side * GAUGE;
    x.strokeStyle = VIOLET; x.lineWidth = 14;
    x.beginPath(); x.moveTo(C[0] + RN[0] * o - RD[0] * L, C[1] + RN[1] * o - RD[1] * L); x.lineTo(C[0] + RN[0] * o + RD[0] * L, C[1] + RN[1] * o + RD[1] * L); x.stroke();
    // groove: a thin second line just inside the rail
    const g = o - side * 20;
    x.lineWidth = 4; x.strokeStyle = mix(VIOLET, BG, 0.25);
    x.beginPath(); x.moveTo(C[0] + RN[0] * g - RD[0] * L, C[1] + RN[1] * g - RD[1] * L); x.lineTo(C[0] + RN[0] * g + RD[0] * L, C[1] + RN[1] * g + RD[1] * L); x.stroke();
  }
  if (shine > 0) {
    // wet glints sliding along the rails
    x.fillStyle = WHITE;
    for (let i = 0; i < 6; i++) {
      const s = ((i * 230 + t * 160) % 1400) - 700, side = i % 2 ? 1 : -1;
      x.globalAlpha = a * shine * 0.9;
      x.save(); x.translate(C[0] + RN[0] * side * GAUGE + RD[0] * s, C[1] + RN[1] * side * GAUGE + RD[1] * s); x.rotate(RA);
      x.fillRect(-30, -4, 60, 8); x.restore();
    }
  }
  x.restore();
}
// motorcycle seen from above, nose along +x; steer turns the front wheel
function bike(X, Y, h, s, a, c, steer = 0, lean = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(h + lean); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  x.strokeStyle = c; x.lineWidth = 8; x.fillStyle = "#16123a";
  rr(-118, -13, 64, 26, 12); x.fill(); x.stroke();                      // rear tyre
  x.save(); x.translate(80, 0); x.rotate(steer); rr(-32, -12, 64, 24, 11); x.fill(); x.stroke(); x.restore(); // front tyre
  x.beginPath(); x.ellipse(-8, 0, 72, 28, 0, 0, Math.PI * 2); x.fill(); x.stroke();   // body / tank / seat
  x.save(); x.translate(52, 0); x.rotate(steer * 0.8); x.beginPath(); x.moveTo(0, -54); x.lineTo(0, 54); x.stroke(); x.restore(); // bars
  x.fillStyle = c; x.beginPath(); x.arc(-24, 0, 24, 0, Math.PI * 2); x.fill();          // helmet
  x.restore();
}
function angleMark(h, r, color, a, txt, tx, ty) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 8; x.lineCap = "round";
  // arc from the rail direction to the path heading, around C
  const r0 = RA, r1 = h; x.beginPath(); x.arc(C[0], C[1], r, Math.min(r0, r1) - 0, Math.min(r0, r1) + Math.abs(r1 - r0) * a); x.stroke();
  x.restore();
  if (txt) tag(txt, tx, ty, color, a, 40);
}
function squareMark(color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 8; x.lineJoin = "round";
  const o = GAUGE + 6, k = 46;
  const p0 = [C[0] - RN[0] * o + RD[0] * k, C[1] - RN[1] * o + RD[1] * k];
  x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p0[0] - RN[0] * k, p0[1] - RN[1] * k); x.lineTo(p0[0] - RN[0] * k - RD[0] * k, p0[1] - RN[1] * k - RD[1] * k); x.stroke();
  x.restore();
}
function arrow(x0, y0, x1, y1, color, a, lw = 12) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.fillStyle = color; x.lineWidth = lw; x.lineCap = "round";
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
  const h = Math.atan2(y1 - y0, x1 - x0);
  x.beginPath(); x.moveTo(x1 + Math.cos(h) * 18, y1 + Math.sin(h) * 18); x.lineTo(x1 + Math.cos(h + 2.5) * 40, y1 + Math.sin(h + 2.5) * 40); x.lineTo(x1 + Math.cos(h - 2.5) * 40, y1 + Math.sin(h - 2.5) * 40); x.closePath(); x.fill();
  x.restore();
}
const rainR = rng(21); const RAIN = Array.from({ length: 70 }, () => [rainR() * 1080, rainR() * 1920, 0.6 + rainR() * 0.8]);
function rain(a, t) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.55; x.strokeStyle = BLUE; x.lineWidth = 4; x.lineCap = "round";
  for (const [rx, ry, sp] of RAIN) {
    const Y = (ry + t * 900 * sp) % 1500 + 420;
    x.beginPath(); x.moveTo(rx, Y); x.lineTo(rx - 10, Y + 34); x.stroke();
  }
  x.restore();
}
function zone(P, p0, p1, color, a, w = 120) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.3; x.strokeStyle = color; x.lineWidth = w; x.lineCap = "butt";
  x.beginPath(); const n = P.pts.length;
  for (let i = Math.floor(p0 * (n - 1)); i <= Math.floor(p1 * (n - 1)); i++) { const q = P.pts[i]; i === Math.floor(p0 * (n - 1)) ? x.moveTo(q[0], q[1]) : x.lineTo(q[0], q[1]); }
  x.stroke(); x.restore();
}

// ---------- one frame ----------
function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  let z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * cut * cut, fx = CX, fy = 1000;
  if (id === "s3") { z = lerp(1.6, 2.3, sm(0, 1.2, u)); fx = C[0]; fy = C[1]; }
  // the diagram sits 140 px higher so the bike stays clear of the caption pill (y 1240-1350)
  x.save(); x.translate(CX, 860); x.scale(z, z); x.translate(-fx, -fy);

  const wp = WRONG.pc, rp = RIGHT.pc;
  if (id === "s1") {
    const a = sm(-0.05, 0.3, u);
    road(a); rails(sm(at("s1", "railway") - 0.1, at("s1", "tracks") + 0.1, u));
    const p = lerp(0.2, wp * 0.6, sm(0.2, d, u));
    const B = WRONG.pos(p); bike(B.X, B.Y, B.h, 0.95, a, RED);
    const sl = sm(at("s1", "slant") - 0.1, at("s1", "slant") + 0.25, u);
    strokePath(WRONG, p, wp, RED, sl * 0.8);
    tag("RAILS", 830, 760, VIOLET, sm(at("s1", "tracks") - 0.05, at("s1", "tracks") + 0.2, u), 40);
  }
  if (id === "s2") {
    const a = sm(-0.05, 0.25, u);
    road(1); rails(1);
    const p = lerp(wp * 0.6, wp - 0.035, sm(0, at("s2", "bends") + 0.2, u));
    strokePath(WRONG, p, 1, RED, 0.75);
    const B = WRONG.pos(p); bike(B.X, B.Y, B.h, 0.95, a, RED);
    const A = sm(at("s2", "shallow") - 0.1, at("s2", "angle") + 0.15, u);
    angleMark(Math.atan2(W8[1], W8[0]), 150, RED, A, "SHALLOW ANGLE", 800, 1040);
    tag("THE BEND", 230, 1180, VIOLET, sm(at("s2", "way") - 0.1, at("s2", "bends") + 0.1, u), 40);
  }
  if (id === "s3") {
    // zoomed in at the tracks: the front tyre drops into the groove and is twisted along the rail
    rails(1); road(0.6);
    const D = sm(at("s3", "drops") - 0.05, at("s3", "drops") + 0.25, u);
    const St = sm(at("s3", "steered") - 0.1, at("s3", "away") + 0.15, u);
    const h0 = Math.atan2(W8[1], W8[0]);
    // front wheel centre reaches the near rail's groove
    const g = -GAUGE + 20; const gp = [C[0] + RN[0] * (g + 26) - RD[0] * 30, C[1] + RN[1] * (g + 26) - RD[1] * 30];
    const fx0 = gp[0] - Math.cos(h0) * 80 * 0.95 - Math.cos(h0) * 40 * (1 - D), fy0 = gp[1] - Math.sin(h0) * 80 * 0.95 - Math.sin(h0) * 40 * (1 - D);
    const steer = (RA - h0) * St * 1.1, yaw = -0.25 * St;
    bike(fx0 + 20 * St, fy0 + 30 * St, h0 + yaw, 0.95, 1, RED, steer, 0);
    if (D > 0) { x.save(); x.globalAlpha = D; x.strokeStyle = RED; x.lineWidth = 5; x.beginPath(); x.arc(gp[0], gp[1], 46, 0, Math.PI * 2); x.stroke(); x.restore(); }
    tag("GROOVE", 640, 1060, RED, sm(at("s3", "groove") - 0.1, at("s3", "groove") + 0.15, u), 26);
    arrow(gp[0] + 20, gp[1] - 50, gp[0] + 20 + RD[0] * 120, gp[1] - 50 + RD[1] * 120, RED, St, 8);
    stamp("x", 430, 1080, 0.5 * back(at("s3", "away") - 0.05, at("s3", "away") + 0.3, u), u > at("s3", "away") - 0.05 ? 1 : 0, RED);
  }
  if (id === "s4") {
    const a = sm(-0.05, 0.25, u);
    road(1); rails(1);
    strokePath(WRONG, 0.3, wp + 0.05, RED, 0.35 * (1 - sm(at("s4", "straighten"), at("s4", "bike") + 0.2, u) * 0.5));
    const Dr = sm(at("s4", "straighten") - 0.1, at("s4", "cross") + 0.2, u);
    strokePath(RIGHT, 0, lerp(0, rp + 0.12, Dr), GREEN, 0.9);
    const p = lerp(0.18, rp - 0.2, sm(0.1, d, u));
    const B = RIGHT.pos(p); bike(B.X, B.Y, B.h, 0.95, a, GREEN);
    const Sq = sm(at("s4", "square") - 0.1, at("s4", "square") + 0.2, u);
    squareMark(GREEN, Sq);
    tag("90°", 300, 900, GREEN, Sq, 48);
    stamp("v", 790, 1140, 0.5 * back(at("s4", "square"), at("s4", "square") + 0.3, u), u > at("s4", "square") ? 1 : 0, GREEN);
  }
  if (id === "s5") {
    road(1); rails(1);
    strokePath(RIGHT, 0, 1, GREEN, 0.5);
    const p = lerp(rp - 0.2, rp + 0.16, sm(0, d - 0.1, u));
    const B = RIGHT.pos(p); bike(B.X, B.Y, B.h, 0.95, 1, GREEN);
    tag("UPRIGHT", 240, 760, GREEN, sm(at("s5", "upright") - 0.1, at("s5", "upright") + 0.15, u), 40);
    tag("STEADY GAS", 790, 700, GREEN, sm(at("s5", "steady") - 0.1, at("s5", "throttle") + 0.1, u), 38);
    tag("NO BRAKES", 780, 1150, ORANGE, sm(at("s5", "braking") - 0.1, at("s5", "braking") + 0.15, u), 40);
    // upright gauge (rear view): a small tyre standing straight
    const G = sm(at("s5", "upright") - 0.1, at("s5", "upright") + 0.2, u);
    if (G > 0) { x.save(); x.globalAlpha = G; x.strokeStyle = GREEN; x.lineWidth = 8; x.beginPath(); x.arc(240, 900, 70, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); x.beginPath(); x.moveTo(240, 900); x.lineTo(240, 830); x.stroke(); x.restore(); }
  }
  if (id === "s6") {
    const W = sm(at("s6", "wet") - 0.15, at("s6", "wet") + 0.1, u);
    road(1); rails(1, W, u); rain(W, u);
    const Sz = sm(at("s6", "slow") - 0.1, at("s6", "before") + 0.1, u);
    zone(RIGHT, rp - 0.22, rp - 0.07, GREEN, Sz);
    const Nz = sm(at("s6", "not") - 0.1, at("s6", "them") + 0.1, u);
    zone(RIGHT, rp - 0.05, rp + 0.05, RED, Nz, 150);
    // fast, then slower in the green zone, then a steady crossing
    const k = cl(u / d), p = k < 0.35 ? lerp(0.2, rp - 0.22, k / 0.35) : k < 0.75 ? lerp(rp - 0.22, rp - 0.08, (k - 0.35) / 0.4) : lerp(rp - 0.08, rp + 0.05, (k - 0.75) / 0.25);
    const B = RIGHT.pos(p); bike(B.X, B.Y, B.h, 0.95, 1, GREEN);
    tag("SLOW HERE", 800, 1170, GREEN, Sz, 38);
    tag("NOT ON THEM", 800, 860, RED, Nz, 40);
    tag("WET", 250, 760, BLUE, W, 44);
  }
  if (id === "s7") {
    road(0.6); rails(0.7); strokePath(RIGHT, 0, 1, GREEN, 0.4);
    const B = RIGHT.pos(RIGHT.pc + 0.12); bike(B.X, B.Y, B.h, 0.95, 0.7, GREEN);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER CROSS", "AT A SLANT"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "slant"))));
  if (id === "s2") words(["SHALLOW", "ANGLE"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "shallow")) * 0.6);
  if (id === "s3") words(["THE GROOVE", "GRABS IT"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "groove")) * 0.6);
  if (id === "s4") words(["CROSS IT", "SQUARE"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "square")) * 0.6);
  if (id === "s5") words(["UPRIGHT", "NO BRAKES"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "braking")) * 0.6);
  if (id === "s6") words(["WET? SLOW", "DOWN FIRST"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "slow")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CROSS SQUARE."], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["NO BRAKES."], ORANGE, 880, at("s7", "bike") - 0.05, 1, 140, flash(u, at("s7", "brakes")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 110, 0, Math.PI * 2); x.stroke();
    x.fillStyle = VIOLET; x.beginPath(); x.arc(0, 0, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = GREEN; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 150, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}
function frame(t) {
  drawInk(t);
  ink.setTransform(1, 0, 0, 1, 0, 0);
  ink.save(); ink.globalCompositeOperation = "destination-out"; ink.drawImage(grainC, 0, 0); ink.restore();
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.drawImage(boardC, 0, 0);
  out.drawImage(inkC, 0, 0);
  const { u } = sceneOf(t);
  const e = sm(-LEAD, 0.3 - LEAD, u);
  if (e > 0 && e < 1) {
    const ex = lerp(-260, 1340, e), ey = lerp(1250, 600, e);
    out.save();
    const sg = out.createLinearGradient(ex - 700, 0, ex, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0.10)");
    out.fillStyle = sg; out.translate(ex, ey); out.rotate(-0.42); out.fillRect(-700, -110, 700, 220);
    out.fillStyle = "#3b3b46"; out.fillRect(-10, -120, 120, 240); out.fillStyle = "#b07a45"; out.fillRect(60, -120, 70, 240);
    out.restore();
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["rail-tracks-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
