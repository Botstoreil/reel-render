// mat-space (YogaFlow 24) - MINIMAL LINE style (kit from mirror-cues, YogaFlow 15). Time only from hf-seek.
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

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", SKY = "#7fd8ff", BG = "#080622";
const CX = 510;
const cv = document.getElementById("world");
// MINIMAL LINE style (style test 22.11, style 8): white paper, one thin black line that draws the scene, one accent
// colour (the old warm colours: wrong-way marks, title, end card), lots of empty space. The story code is unchanged:
// a thin wrapper maps every colour and line width as it is set.
const raw = cv.getContext("2d");
const PAPER = "#fbfaf7", INKC = "#121212", ACCENT = "#ff3b30";
let drawK = 1; // 0..1 how much of each line is drawn (draws itself at the start of every voice line)
function lineColor(v) {
  if (typeof v !== "string") return "rgba(0,0,0,0)"; // no gradients in this style
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  if (0.3 * r + 0.59 * g + 0.11 * b < 70) return `rgba(251,250,247,${a})`; // dark fills become paper
  if (r > g + 60 && r > b + 60) return a < 1 ? `rgba(255,59,48,${a})` : ACCENT; // red / orange = the accent
  return a < 1 ? `rgba(18,18,18,${a})` : INKC;
}
const x = new Proxy(raw, {
  get(t, k) {
    if (k === "stroke") return (...a) => { const L = 2600; t.setLineDash([L * drawK, L]); t.stroke(...a); t.setLineDash([]); };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  },
  set(t, k, v) {
    if (k === "fillStyle" || k === "strokeStyle") v = lineColor(v);
    else if (k === "lineWidth") v = Math.min(v, 5);
    else if (k === "shadowBlur") v = 0;
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
      glow(color, 30 + 40 * flashK); x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
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
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function bubble(txt, X, Y, color, a, tx, ty, px = 52) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 70, h = px * 1.8, s = back(0, 1, a);
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  glow(color, 30); x.fillStyle = "#14113a"; x.strokeStyle = color; x.lineWidth = 7;
  rr(-w / 2, -h / 2, w, h, 34); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-24, h / 2 - 4); x.lineTo((tx - X) * 0.35, (ty - Y) * 0.35); x.lineTo(16, h / 2 - 4); x.fill(); x.stroke();
  x.fillStyle = "#14113a"; x.fillRect(-26, h / 2 - 12, 44, 10); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}

// ---------- pictogram people ----------
const STAND = { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] };
// arm raise on the screen-LEFT side (sl) and screen-RIGHT side (sr), 0..1 each
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
  glow(color, 22); x.lineWidth = 34 * s;
  limb(color, "hip", "kR", "fR"); limb(color, "sh", "eR", "hR");
  x.lineWidth = 44 * s; limb(color, "sh", "hip");
  x.lineWidth = 34 * s; limb(color, "hip", "kL", "fL"); limb(color, "sh", "eL", "hL");
  const [hx, hy] = W2("head");
  x.fillStyle = color; x.beginPath(); x.arc(hx, hy, 40 * s, 0, Math.PI * 2); x.fill(); noGlow();
  if (o.face) { x.fillStyle = "#080622"; x.beginPath(); x.arc(hx - 13 * s, hy - 4 * s, 6 * s, 0, Math.PI * 2); x.arc(hx + 13 * s, hy - 4 * s, 6 * s, 0, Math.PI * 2); x.fill(); }
  x.restore();
  return W2;
}
function room() {
  // white paper and one floor line: the empty space is the style
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  x.save(); x.strokeStyle = INKC; x.lineWidth = 3; x.beginPath(); x.moveTo(90, 1110); x.lineTo(990, 1110); x.stroke(); x.restore();
}
function windowFrame(X, Y, a, k) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; glow(SKY, 20 + 30 * k); x.fillStyle = "#10204a"; x.strokeStyle = SKY; // Minimal Line: outline only (a lit fill turned into a black block) x.lineWidth = 10;
  rr(X - 90, Y - 150, 180, 300, 10); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(X, Y - 150); x.lineTo(X, Y + 150); x.moveTo(X - 90, Y); x.lineTo(X + 90, Y); x.stroke();
  x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; glow(c, 30); x.strokeStyle = c; x.lineWidth = 20;
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke(); x.beginPath();
  if (kind === "x") { x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); }
  else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}
const ROW = [220, 510, 800], TY = 1080, SY = 1620;
// front row of students (backs to us): sl/sr = which screen side they raise
function students(sl, sr, c, a = 1) { ROW.forEach((X) => person(X, SY, raise(sl, sr), 0.5, mix(c, "#080622", 0.25), { a })); }


// ---------- mat-space (YogaFlow 24) story ----------
const STAR = Object.assign({}, STAND, { kL: [-70, -95], fL: [-130, 0], kR: [70, -95], fR: [130, 0], eL: [-120, -330], hL: [-230, -335], eR: [120, -330], hR: [230, -335] });
const NARROW = Object.assign({}, STAND, { eL: [-40, -440], hL: [-8, -560], eR: [40, -440], hR: [8, -560] });
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
const FY = 1080; // floor of the side view (round 2: was 1330, under the caption band)
function sideMat(X, w, c, a = 1) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 5; rr(X - w / 2, FY, w, 20, 8); x.stroke(); x.restore(); }
function floorLine() { x.save(); x.strokeStyle = INKC; x.lineWidth = 3; x.beginPath(); x.moveTo(90, FY + 40); x.lineTo(990, FY + 40); x.stroke(); x.restore(); }
// ---- top-down floor plan: teacher at the front wall, two rows of mats, a head circle on each mat ----
const MW = 140, MH = 250, ROW1 = 770, ROW2 = 1080, WALL = 610; // round 2: back row was under the caption band
function planMat(X, Y, c, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 5; rr(X - MW / 2, Y - MH / 2, MW, MH, 10); x.stroke();
  x.fillStyle = c; x.beginPath(); x.arc(X, Y - 40, 30, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(X - 46, Y + 20); x.lineTo(X + 46, Y + 20); x.lineWidth = 5; x.stroke();
  x.restore();
}
function frontWall(a = 1, c = VIOLET) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = INKC; x.lineWidth = 4; x.beginPath(); x.moveTo(110, WALL); x.lineTo(910, WALL); x.stroke();
  x.fillStyle = c; x.beginPath(); x.arc(CX, WALL - 60, 34, 0, Math.PI * 2); x.fill(); x.restore();
  tag("TEACHER", CX + 190, WALL - 60, c, a, 34);
}
function rowXs(n, pitch, off = 0) { return Array.from({ length: n }, (_, i) => CX + (i - (n - 1) / 2) * pitch + off); }
function sight(X, y0, y1, c, k, blocked) {
  if (k <= 0) return;
  x.save(); x.strokeStyle = c; x.lineWidth = 5; x.setLineDash([14, 12]);
  x.beginPath(); x.moveTo(X, y0); x.lineTo(X, lerp(y0, y1, k)); x.stroke(); x.restore();
  if (blocked && k > 0.98) mark("x", X, y1 + 10, 0.34, 1, RED);
}
function hand(X, Y, s, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.strokeStyle = GREEN; x.lineWidth = 5; x.lineCap = "round";
  rr(-18, -10, 36, 50, 12); x.stroke();
  [-14, -5, 4, 13].forEach((fx, i) => { x.beginPath(); x.moveTo(fx, -10); x.lineTo(fx, -42 - (i === 1 || i === 2 ? 8 : 0)); x.stroke(); });
  x.beginPath(); x.moveTo(-18, 14); x.lineTo(-34, -6); x.stroke();
  x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  drawK = sm(-LEAD, 0.75, u);
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    // four students slide together until the mats touch, edge to edge
    floorLine();
    const P1 = sm(at("s1", "pack") - 0.2, at("s1", "mats") + 0.2, u);
    const pitch = lerp(250, 200, P1);
    rowXs(4, pitch).forEach((X, i) => { sideMat(X, 200, VIOLET); person(X, FY, STAND, 0.5, VIOLET); });
    const E = sm(at("s1", "edge") - 0.1, at("s1", "edge", 2) + 0.1, u);
    rowXs(3, 200).forEach((X) => { if (E > 0) { x.save(); x.globalAlpha = E; x.strokeStyle = RED; x.lineWidth = 5; x.beginPath(); x.arc(X, FY + 10, 34, 0, Math.PI * 2); x.stroke(); x.restore(); } });
    tag("EDGE TO EDGE", CX, FY + 95, RED, E, 44);
    tag("FULL CLASS", CX, 620, VIOLET, sm(0.0, at("s1", "class") + 0.15, u) * (1 - sm(at("s1", "never") - 0.1, at("s1", "never") + 0.1, u)), 44);
  }
  if (id === "s2") {
    // everyone opens into a wide pose: hands and feet hit the neighbour
    floorLine();
    const Wd = sm(at("s2", "wide") - 0.1, at("s2", "poses") + 0.2, u);
    const xs = rowXs(4, 200);
    xs.forEach((X) => { sideMat(X, 200, VIOLET); person(X, FY, pose(STAND, STAR, Wd), 0.5, Wd > 0.6 ? RED : VIOLET); });
    const Ar = sm(at("s2", "arms") - 0.05, at("s2", "arms") + 0.2, u), Ft = sm(at("s2", "feet") - 0.05, at("s2", "feet") + 0.2, u);
    rowXs(3, 200).forEach((X) => { mark("x", X, FY - 168, back(0, 1, Ar) * 0.3, Ar > 0 ? 1 : 0, RED); mark("x", X, FY - 20, back(0, 1, Ft) * 0.3, Ft > 0 ? 1 : 0, RED); });
    tag("ARMS", 300, 700, RED, Ar, 42);
    tag("FEET", 720, 700, RED, Ft, 42);
    tag("NEIGHBOR HIT", CX, FY + 95, RED, sm(at("s2", "hit") - 0.1, at("s2", "neighbor") + 0.1, u), 44);
  }
  if (id === "s3") {
    // floor plan: back row sits right behind the front row; every view is blocked by a head
    const a = sm(-0.05, 0.3, u);
    frontWall(a);
    const xs = rowXs(3, MW + 10);
    xs.forEach((X) => planMat(X, ROW1, VIOLET, a));
    const Bk = sm(at("s3", "back") - 0.1, at("s3", "row") + 0.1, u);
    xs.forEach((X) => planMat(X, ROW2, RED, Bk));
    const S3 = sm(at("s3", "can't") - 0.15, at("s3", "see") + 0.1, u);
    xs.forEach((X) => sight(X, ROW2 - 80, ROW1 + 10, RED, S3, true));
    tag("BACK ROW", 175, ROW2, RED, Bk, 40);
  }
  if (id === "s4") {
    // the mats spread apart: one hand of floor between them
    const G = sm(at("s4", "leave") - 0.05, at("s4", "width") + 0.2, u);
    frontWall(1, GREEN);
    const p = MW + lerp(10, 70, G);
    const xs = rowXs(3, p);
    xs.forEach((X) => planMat(X, ROW1, GREEN));
    const Hd = sm(at("s4", "hand's") - 0.1, at("s4", "width") + 0.1, u);
    [CX - p / 2, CX + p / 2].forEach((X) => hand(X, ROW1 + 20, 0.9, Hd));
    tag("HAND'S WIDTH", CX, ROW1 + 230, GREEN, sm(at("s4", "width") - 0.1, at("s4", "width") + 0.15, u), 44);
    tag("FLOOR", CX, ROW1 - 150, GREEN, sm(at("s4", "floor") - 0.1, at("s4", "floor") + 0.15, u), 40);
    mark("v", 820, 1120,back(at("s4", "mats") - 0.1, at("s4", "mats") + 0.25, u) * 0.5, u > at("s4", "mats") - 0.1 ? 1 : 0, GREEN);
  }
  if (id === "s5") {
    // back row slides half a mat: every student looks through a gap to the front
    frontWall(1, GREEN);
    const p = MW + 70;
    rowXs(3, p).forEach((X) => planMat(X, ROW1, GREEN));
    const St = sm(at("s5", "stagger") - 0.05, at("s5", "rows") + 0.25, u);
    const back2 = rowXs(2, p).map((X) => X + 0); // two back mats sit in the gaps
    const fromX = rowXs(2, p, -p / 2 + p / 2);
    back2.forEach((X, i) => planMat(lerp(rowXs(3, p)[i], X, St), ROW2, GREEN));
    const Sg = sm(at("s5", "see") - 0.15, at("s5", "front") + 0.2, u);
    back2.forEach((X) => sight(X, ROW2 - 80, WALL + 6, GREEN, Sg * St, false));
    tag("STAGGER", 150, ROW2, GREEN, sm(at("s5", "stagger") - 0.05, at("s5", "stagger") + 0.2, u), 40);
    void fromX;
  }
  if (id === "s6") {
    // still full: the class stays in narrow poses on the packed mats
    floorLine();
    const Nk = sm(at("s6", "pick") - 0.1, at("s6", "narrow") + 0.2, u);
    rowXs(4, 200).forEach((X) => { sideMat(X, 200, GREEN); person(X, FY, pose(STAND, NARROW, Nk), 0.5, GREEN); });
    tag("STILL FULL", CX, 620, VIOLET, sm(at("s6", "room") - 0.1, at("s6", "full") + 0.1, u), 44);
    tag("NARROW POSES", CX, FY + 95, GREEN, sm(at("s6", "narrow") - 0.15, at("s6", "narrow") + 0.15, u), 44);
    mark("v", 840, 760, back(at("s6", "narrow"), at("s6", "narrow") + 0.3, u) * 0.5, u > at("s6", "narrow") ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    const p = MW + 70;
    rowXs(3, p).forEach((X) => planMat(X, ROW1 + 260, GREEN, 0.4)); // round 3: below the end card
  }
  x.restore();

  if (id === "s1") words(["NEVER PACK MATS", "EDGE TO EDGE"], RED, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["ARMS AND FEET", "HIT THE NEIGHBOR"], RED, 340, 0.0, 1, 140, flash(u, at("s2", "hit")) * 0.6);
  if (id === "s3") words(["THE BACK ROW", "CAN'T SEE YOU"], RED, 340, 0.0, 1, 140, flash(u, at("s3", "see")) * 0.6);
  if (id === "s4") words(["LEAVE A", "HAND'S WIDTH"], GREEN, 340, 0.0, 1, 140, flash(u, at("s4", "width")) * 0.6);
  if (id === "s5") words(["STAGGER", "THE ROWS"], GREEN, 340, 0.0, 1, 140, flash(u, at("s5", "stagger")) * 0.6);
  if (id === "s6") words(["PICK NARROW", "POSES"], GREEN, 340, 0.0, 1, 140, flash(u, at("s6", "narrow")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["GIVE SPACE."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["GIVE A VIEW."], ORANGE, 880, at("s7", "give", 2) - 0.05, 1, 160, flash(u, at("s7", "view")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 120, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = GREEN; glow(GREEN, 30); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 155, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    person(CX, 560 + 95 * k, STAND, 0.45 * Math.max(0.001, k), VIOLET);
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["mat-space-minimal-line"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
