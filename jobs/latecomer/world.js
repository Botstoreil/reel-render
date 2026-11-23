// latecomer (YogaFlow 29) - BLUEPRINT style (canvas kit from mat-space, YogaFlow 24). Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const back = (a, b, x) => { const t = cl((x - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff";
const CX = 510;
const cv = document.getElementById("world");
// BLUEPRINT style: deep blue drafting paper with a fine grid, every line drawn in thin chalk-white ink; red = wrong,
// green = right, amber = the rule. A wrapper maps every colour and line width as it is set.
const raw = cv.getContext("2d");
const PAPER = "#0b3a6e", GRID = "rgba(160,205,255,0.16)", INK = "#e9f3ff", BRED = "#ff6b5e", BGREEN = "#6dffa8", AMBER = "#ffc23a";
let drawK = 1;
function lineColor(v) {
  if (typeof v !== "string") return v;
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  const rgba = (h) => a < 1 ? `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})` : h;
  if (0.3 * r + 0.59 * g + 0.11 * b < 70) return `rgba(11,58,110,${a})`; // dark fills become paper
  if (r > g + 60 && r > b + 60) return rgba(g > 80 ? AMBER : BRED);
  if (g > r + 60 && g > b - 20) return rgba(BGREEN);
  return rgba(INK);
}
const x = new Proxy(raw, {
  get(t, k) {
    if (k === "stroke") return (...a) => { const L = 2600; t.setLineDash([L * drawK, L]); t.stroke(...a); t.setLineDash([]); };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  },
  set(t, k, v) {
    if (k === "fillStyle" || k === "strokeStyle") v = lineColor(v);
    else if (k === "lineWidth") v = Math.min(v, 7);
    else if (k === "shadowBlur") v = Math.min(v, 6);
    t[k] = v; return true;
  },
});
const FONT = (px) => `800 ${px}px Inter, Arial, sans-serif`;

function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function glow(c, b) { x.shadowColor = c; x.shadowBlur = b; }
function noGlow() { x.shadowBlur = 0; }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}
function paper() {
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  raw.save(); raw.strokeStyle = GRID; raw.lineWidth = 2;
  for (let X = 0; X <= 1080; X += 60) { raw.beginPath(); raw.moveTo(X, 0); raw.lineTo(X, 1920); raw.stroke(); }
  for (let Y = 0; Y <= 1920; Y += 60) { raw.beginPath(); raw.moveTo(0, Y); raw.lineTo(1080, Y); raw.stroke(); }
  raw.strokeStyle = "rgba(200,225,255,0.35)"; raw.lineWidth = 3; raw.strokeRect(40, 40, 1000, 1840);
  raw.restore();
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
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.globalAlpha = a * o;
      x.lineWidth = 7; x.strokeStyle = "#000000"; x.lineJoin = "round"; raw.strokeText(p, 0, 0);
      x.fillStyle = color; // round 2: a white mix read as amber in this palette; flash = a small scale pop instead
      if (flashK > 0.05) x.scale(1 + 0.06 * flashK, 1 + 0.06 * flashK);
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
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#080622"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function bubble(txt, X, Y, color, a, tx, ty, px = 52) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 70, h = px * 1.8, s = back(0, 1, a);
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#080622"; x.strokeStyle = color; x.lineWidth = 6;
  rr(-w / 2, -h / 2, w, h, 34); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-24, h / 2 - 4); x.lineTo((tx - X) * 0.35, (ty - Y) * 0.35); x.lineTo(16, h / 2 - 4); x.fill(); x.stroke();
  x.fillStyle = "#080622"; x.fillRect(-26, h / 2 - 12, 44, 10);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}

// ---------- outline people (blueprint: drawn, not filled) ----------
const STAND = { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] };
const UP = Object.assign({}, STAND, { eL: [-40, -440], hL: [-30, -560], eR: [40, -440], hR: [30, -560] });
const WALK = (k) => Object.assign({}, STAND, { kL: [-30 + 30 * Math.sin(k), -98], fL: [-50 * Math.sin(k), 0], kR: [30 - 30 * Math.sin(k), -98], fR: [50 * Math.sin(k), 0], hL: [-38 - 30 * Math.sin(k), -185], hR: [38 + 30 * Math.sin(k), -185] });
// child's pose, facing screen-right: hips back on the heels, chest down, arms long on the floor
const CHILD = { head: [125, -40], sh: [70, -62], hip: [-55, -85], kL: [20, -18], fL: [-85, -8], kR: [20, -18], fR: [-85, -8], eL: [150, -22], hL: [225, -12], eR: [150, -22], hR: [225, -12] };
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function raise(sl, sr) {
  return Object.assign({}, STAND, {
    eL: [lerp(-34, -80, sl), lerp(-260, -420, sl)], hL: [lerp(-38, -96, sl), lerp(-185, -520, sl)],
    eR: [lerp(34, 80, sr), lerp(-260, -420, sr)], hR: [lerp(38, 96, sr), lerp(-185, -520, sr)],
  });
}
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s * (o.sx ?? 1), Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, ...js) => { x.strokeStyle = c; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  glow(color, 6); x.lineWidth = 7;
  limb(color, "hip", "kR", "fR"); limb(color, "sh", "eR", "hR");
  limb(color, "sh", "hip");
  limb(color, "hip", "kL", "fL"); limb(color, "sh", "eL", "hL");
  const [hx, hy] = W2("head");
  x.strokeStyle = color; x.beginPath(); x.arc(hx, hy, 40 * s, 0, Math.PI * 2); x.stroke(); noGlow();
  x.restore();
  return W2;
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.strokeStyle = c; x.lineWidth = 7;
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke(); x.beginPath();
  if (kind === "x") { x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); }
  else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}
function qmark(X, Y, a, c = RED, px = 90) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = c; x.fillText("?", X, Y); x.restore();
}

// ---------- side view: floor, mats, door ----------
const FY = 1080, SC = 0.5;
const CLASS = [450, 640, 830];
function floorLine() { x.save(); x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.moveTo(90, FY + 40); x.lineTo(990, FY + 40); x.stroke(); x.restore(); }
function sideMat(X, w, c, a = 1) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 5; rr(X - w / 2, FY + 6, w, 20, 8); x.stroke(); x.restore(); }
function door(open, c = WHITE) {
  x.save(); x.strokeStyle = c; x.lineWidth = 6; x.strokeRect(100, FY - 320, 150, 360);
  x.beginPath(); x.moveTo(100, FY - 320); x.lineTo(100 + 150 * (1 - 0.7 * open), FY - 320 + 40 * open); x.lineTo(100 + 150 * (1 - 0.7 * open), FY + 40 - 40 * open); x.lineTo(100, FY + 40); x.stroke();
  x.restore();
}
function rolledMat(X, k, c) {
  // a rolled mat that unrolls to the right as k goes 0..1
  x.save(); x.strokeStyle = c; x.lineWidth = 5;
  const len = 180 * k, r = 22 * (1 - k) + 6;
  x.beginPath(); x.arc(X + len, FY + 16 - r + 10, r, 0, Math.PI * 2); x.stroke();
  if (len > 2) { rr(X - 10, FY + 6, len + 10, 20, 8); x.stroke(); }
  x.restore();
}
function classFlow(c, k = 1) { CLASS.forEach((X) => { sideMat(X, 160, c); person(X, FY, pose(STAND, UP, k), SC, c); }); }

// ---------- plan view (top-down) ----------
const MW = 130, MH = 230, ROW1 = 780, ROW2 = 1060, WALL = 620;
function planMat(X, Y, c, a = 1, dash = false) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 5; if (dash) raw.setLineDash([16, 12]);
  rr(X - MW / 2, Y - MH / 2, MW, MH, 10); dash ? raw.stroke() : x.stroke(); raw.setLineDash([]);
  if (!dash) { x.beginPath(); x.arc(X, Y - 40, 28, 0, Math.PI * 2); x.stroke(); }
  x.restore();
}
function frontWall(c = VIOLET, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.moveTo(110, WALL); x.lineTo(910, WALL); x.stroke();
  x.strokeStyle = c; x.beginPath(); x.arc(CX, WALL - 60, 32, 0, Math.PI * 2); x.stroke(); x.restore();
  tag("TEACHER", CX + 180, WALL - 60, c, a, 34);
}
function planDoor() { x.save(); x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.moveTo(110, 1180); x.lineTo(110, 1260); x.stroke(); x.beginPath(); x.arc(110, 1260, 80, -Math.PI / 2, 0); x.stroke(); x.restore(); }
const COLS = [CX - 230, CX, CX + 230];

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  drawK = sm(-LEAD, 0.6, u);
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  paper();
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    // class mid-flow with arms up; the door opens and a student walks in late
    floorLine();
    classFlow(VIOLET, 0.5 + 0.5 * Math.sin(u * 3));
    const Op = sm(0.0, at("s1", "walks"), u);
    door(Op);
    const Wk = sm(at("s1", "walks") - 0.1, at("s1", "late") + 0.3, u);
    person(lerp(175, 290, Wk), FY, WALK(u * 9 * (Wk < 1 ? 1 : 0)), SC, RED, { a: sm(0.05, 0.3, u) });
    tag("LATE", 290, FY - 290, RED, sm(at("s1", "late") - 0.1, at("s1", "late") + 0.15, u), 42);
    qmark(290, FY - 360, sm(at("s1", "lost") - 0.1, at("s1", "lost") + 0.1, u));
  }
  if (id === "s2") {
    // plan view: the late mat squeezes in between two mats, in the middle of the room
    frontWall(VIOLET);
    COLS.forEach((X) => planMat(X, ROW1, VIOLET));
    [COLS[0], COLS[2]].forEach((X) => planMat(X, ROW2, VIOLET));
    planDoor();
    const M = sm(at("s2", "roll") - 0.1, at("s2", "middle") + 0.1, u);
    const mx = lerp(170, CX, M), my = lerp(1220, ROW2, M);
    planMat(mx, my, RED);
    tag("MID-FLOW", CX, ROW1 - 170, RED, sm(at("s2", "flow") - 0.15, at("s2", "flow") + 0.1, u), 42);
    mark("x", CX + 120, ROW2 - 60, back(at("s2", "middle"), at("s2", "middle") + 0.3, u) * 0.35, u > at("s2", "middle") ? 1 : 0, RED);
  }
  if (id === "s3") {
    // side view: class keeps flowing in sync; the late student copies the wrong arm, then the other
    floorLine();
    classFlow(VIOLET, 1);
    sideMat(290, 160, RED);
    const sw = 0.5 + 0.5 * Math.sin(u * 5);
    person(290, FY, raise(sw, 1 - sw), SC, RED);
    bubble("WHERE ARE WE?", 330, FY - 470, RED, sm(at("s3", "idea") - 0.1, at("s3", "where") + 0.15, u), 290, FY - 300, 46);
    tag("GUESSING", 290, FY + 100, RED, sm(at("s3", "guess") - 0.1, at("s3", "guess") + 0.15, u), 42);
  }
  if (id === "s4") {
    // plan view: teacher points along a dashed path from the door to a free spot at the back
    frontWall(GREEN);
    COLS.forEach((X) => planMat(X, ROW1, VIOLET));
    [COLS[0], COLS[1]].forEach((X) => planMat(X, ROW2, VIOLET));
    planDoor();
    const Pt = sm(at("s4", "point") - 0.05, at("s4", "spot"), u);
    if (Pt > 0) {
      x.save(); x.strokeStyle = GREEN; x.lineWidth = 6; raw.setLineDash([18, 14]);
      x.beginPath(); x.moveTo(170, 1220); x.quadraticCurveTo(COLS[2] - 40, 1240, lerp(170, COLS[2], Pt), lerp(1220, ROW2 + 40, Pt)); raw.stroke(); raw.setLineDash([]); x.restore();
    }
    planMat(COLS[2], ROW2, GREEN, sm(at("s4", "free") - 0.1, at("s4", "free") + 0.1, u), true);
    // round 2: NEAR THE BACK sat under the caption band; it now replaces FREE SPOT in the same place
    const Nb = sm(at("s4", "near") - 0.1, at("s4", "near") + 0.05, u);
    tag("FREE SPOT", COLS[2], ROW2 - 160, GREEN, sm(at("s4", "free") - 0.1, at("s4", "spot") + 0.1, u) * (1 - Nb), 40);
    tag("NEAR THE BACK", COLS[2], ROW2 - 160, GREEN, sm(at("s4", "near") - 0.05, at("s4", "back") + 0.1, u), 40);
  }
  if (id === "s5") {
    // side view: the late student rests in child's pose at the back while the class keeps flowing
    floorLine();
    classFlow(VIOLET, 0.5 + 0.5 * Math.sin(u * 3));
    sideMat(270, 200, GREEN);
    const Ch = sm(at("s5", "simple") - 0.2, at("s5", "pose") + 0.2, u);
    person(230, FY, pose(STAND, CHILD, Ch), lerp(SC, 0.7, Ch), GREEN); // round 2: child's pose read too small at 0.5
    tag("ONE SIMPLE POSE", 290, FY - 300, GREEN, sm(at("s5", "simple") - 0.1, at("s5", "pose") + 0.1, u) * (1 - sm(at("s5", "child's") - 0.1, at("s5", "child's"), u)), 40);
    tag("CHILD'S POSE", 290, FY - 300, GREEN, sm(at("s5", "child's") - 0.05, at("s5", "child's") + 0.15, u), 44);
  }
  if (id === "s6") {
    // the next round starts: everyone, the late student too, rises together
    floorLine();
    const Rn = sm(at("s6", "next") - 0.1, at("s6", "round") + 0.25, u);
    CLASS.forEach((X) => { sideMat(X, 160, GREEN); person(X, FY, pose(STAND, UP, Rn), SC, GREEN); });
    sideMat(270, 200, GREEN);
    person(lerp(230, 270, Rn), FY, pose(CHILD, UP, Rn), lerp(0.7, SC, Rn), GREEN);
    // loop arrow = next round
    const La = sm(at("s6", "next") - 0.15, at("s6", "round"), u);
    if (La > 0) {
      x.save(); x.strokeStyle = GREEN; x.lineWidth = 7; x.lineCap = "round";
      // round 2: loop and tag side by side above the raised arms (they overlapped the heads)
      x.beginPath(); x.arc(CX + 250, 620, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.7 * La); x.stroke();
      if (La > 0.95) { const ax = CX + 250 + 70 * Math.cos(-Math.PI / 2 + Math.PI * 1.7), ay = 620 + 70 * Math.sin(-Math.PI / 2 + Math.PI * 1.7); x.beginPath(); x.moveTo(ax - 26, ay - 4); x.lineTo(ax, ay); x.lineTo(ax - 2, ay - 28); x.stroke(); }
      x.restore();
    }
    tag("NEXT ROUND", CX - 120, 620, GREEN, sm(at("s6", "round") - 0.1, at("s6", "round") + 0.15, u), 46);
    mark("v", 270, FY - 380, back(at("s6", "flow") - 0.1, at("s6", "flow") + 0.2, u) * 0.4, u > at("s6", "flow") - 0.1 ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    // round 2: no figures behind the end card (they cut through the words); the floor stays as a quiet line
    floorLine();
  }
  x.restore();

  if (id === "s1") words(["NEVER LEAVE A", "LATECOMER LOST"], RED, 360, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["A MAT IN THE", "MIDDLE OF A FLOW"], RED, 360, 0.0, 1, 130, flash(u, at("s2", "middle")) * 0.6);
  if (id === "s3") words(["SO THEY", "JUST GUESS"], RED, 360, 0.0, 1, 140, flash(u, at("s3", "guess")) * 0.6);
  if (id === "s4") words(["POINT TO", "A FREE SPOT"], GREEN, 360, 0.0, 1, 140, flash(u, at("s4", "free")) * 0.6);
  if (id === "s5") words(["START WITH", "CHILD'S POSE"], GREEN, 360, 0.0, 1, 140, flash(u, at("s5", "child's")) * 0.6);
  if (id === "s6") words(["BRING THEM IN", "NEXT ROUND"], GREEN, 360, 0.0, 1, 140, flash(u, at("s6", "round")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["WELCOME THEM."], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["THEN BRING", "THEM IN."], ORANGE, 930, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "in")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = VIOLET; x.lineWidth = 7; x.beginPath(); x.arc(0, 0, 120, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = GREEN; x.beginPath(); x.arc(0, 0, 155, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    person(CX, 560 + 95 * k, STAND, 0.45 * Math.max(0.001, k), VIOLET);
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["latecomer-blueprint"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
