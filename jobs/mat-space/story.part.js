
// ---------- mat-space (YogaFlow 24) story ----------
const STAR = Object.assign({}, STAND, { kL: [-70, -95], fL: [-130, 0], kR: [70, -95], fR: [130, 0], eL: [-120, -330], hL: [-230, -335], eR: [120, -330], hR: [230, -335] });
const NARROW = Object.assign({}, STAND, { eL: [-40, -440], hL: [-8, -560], eR: [40, -440], hR: [8, -560] });
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
const FY = 1330; // floor of the side view
function sideMat(X, w, c, a = 1) { if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 5; rr(X - w / 2, FY, w, 20, 8); x.stroke(); x.restore(); }
function floorLine() { x.save(); x.strokeStyle = INKC; x.lineWidth = 3; x.beginPath(); x.moveTo(90, FY + 40); x.lineTo(990, FY + 40); x.stroke(); x.restore(); }
// ---- top-down floor plan: teacher at the front wall, two rows of mats, a head circle on each mat ----
const MW = 140, MH = 250, ROW1 = 860, ROW2 = 1170, WALL = 640;
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
    tag("EDGE TO EDGE", CX, FY + 130, RED, E, 44);
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
    tag("ARMS", 300, 900, RED, Ar, 42);
    tag("FEET", 720, 900, RED, Ft, 42);
    tag("NEIGHBOR HIT", CX, FY + 130, RED, sm(at("s2", "hit") - 0.1, at("s2", "neighbor") + 0.1, u), 44);
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
    tag("BACK ROW", 770, ROW2 + 190, RED, Bk, 40);
    tag("CAN'T SEE", CX, 1440, RED, sm(at("s3", "see") - 0.1, at("s3", "you") + 0.15, u), 48);
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
    tag("FLOOR", CX, ROW1 - 200, GREEN, sm(at("s4", "floor") - 0.1, at("s4", "floor") + 0.15, u), 40);
    mark("v", 820, 1400, back(at("s4", "mats") - 0.1, at("s4", "mats") + 0.25, u) * 0.5, u > at("s4", "mats") - 0.1 ? 1 : 0, GREEN);
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
    tag("STAGGER", 790, ROW2 + 190, GREEN, sm(at("s5", "stagger") - 0.05, at("s5", "stagger") + 0.2, u), 42);
    tag("EVERYONE SEES", CX, 1440, GREEN, sm(at("s5", "every") - 0.05, at("s5", "student") + 0.15, u), 44);
    void fromX;
  }
  if (id === "s6") {
    // still full: the class stays in narrow poses on the packed mats
    floorLine();
    const Nk = sm(at("s6", "pick") - 0.1, at("s6", "narrow") + 0.2, u);
    rowXs(4, 200).forEach((X) => { sideMat(X, 200, GREEN); person(X, FY, pose(STAND, NARROW, Nk), 0.5, GREEN); });
    tag("STILL FULL", CX, 620, VIOLET, sm(at("s6", "room") - 0.1, at("s6", "full") + 0.1, u), 44);
    tag("NARROW POSES", CX, FY + 130, GREEN, sm(at("s6", "narrow") - 0.15, at("s6", "narrow") + 0.15, u), 44);
    mark("v", 840, 760, back(at("s6", "narrow"), at("s6", "narrow") + 0.3, u) * 0.5, u > at("s6", "narrow") ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    const p = MW + 70;
    rowXs(3, p).forEach((X) => planMat(X, ROW1 + 100, GREEN, 0.5));
    rowXs(2, p).forEach((X) => planMat(X, ROW2 + 100, GREEN, 0.5));
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
