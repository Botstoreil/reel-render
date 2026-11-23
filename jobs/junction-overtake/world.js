// junction-overtake (Apex 16, TikTok) - BLUEPRINT style: engineering drawing on blueprint paper, white outline
// drawings on a blue grid, dashed construction lines, boxed technical labels. Top-down, right-hand traffic, travel UP.
// Wrong: a red bike pulls out to pass a slow car right at a side road on the left; the car turns left across its path
// and there is no room to stop. Right: a violet bike stays behind until past the junction, watches the indicator,
// wheels and driver's head, and later overtakes only on a clear straight with room to pull back in. Time only from hf-seek.
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
const RED = "#ff4d5a", GREEN = "#43f08a", VIOLET = "#b39cff", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#06203f", AMBER = "#ffc23d";
const PAPER = "#0f4c81", LINE = "rgba(235,245,255,0.92)";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const MONO = (px) => `700 ${px}px "JetBrains Mono", "Courier New", monospace`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B2 = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }

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
      x.lineWidth = Math.max(10, px * 0.15); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// technical label: dark box, coloured double outline, mono text
function tag(txt, X, Y, color, a, px = 38) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = MONO(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1190);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(6,32,63,0.92)"; x.fillRect(-w / 2, -h / 2, w, h);
  x.strokeStyle = color; x.lineWidth = 4; x.strokeRect(-w / 2, -h / 2, w, h);
  x.lineWidth = 1.5; x.strokeRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1170);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.fillStyle = "rgba(6,32,63,0.95)"; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.fill();
  x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- the drawing ----------
const RL = 380, RR = 700, MID = 540, LANE = 620, OPP = 460;   // road edges, centre line, our lane, oncoming lane
const JY0 = 800, JY1 = 930;                                     // side road on the left
function paper() {
  x.fillStyle = PAPER; x.fillRect(-200, -200, 1480, 2400);
  x.lineWidth = 1;
  for (let i = -200; i < 1300; i += 40) { x.strokeStyle = i % 200 === 0 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"; x.beginPath(); x.moveTo(i, -200); x.lineTo(i, 2200); x.stroke(); }
  for (let j = -200; j < 2200; j += 40) { x.strokeStyle = j % 200 === 0 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"; x.beginPath(); x.moveTo(-200, j); x.lineTo(1300, j); x.stroke(); }
}
function roads(sideA) {
  x.save(); x.strokeStyle = LINE; x.lineWidth = 4; x.lineCap = "round";
  const gap = sideA > 0.5;
  x.beginPath();
  x.moveTo(RR, 470); x.lineTo(RR, 1700);
  if (gap) { x.moveTo(RL, 470); x.lineTo(RL, JY0); x.moveTo(RL, JY1); x.lineTo(RL, 1700); } else { x.moveTo(RL, 470); x.lineTo(RL, 1700); }
  x.stroke();
  if (sideA > 0) {
    x.globalAlpha = sideA;
    x.beginPath(); x.moveTo(-60, JY0); x.lineTo(RL, JY0); x.moveTo(-60, JY1); x.lineTo(RL, JY1); x.stroke();
    x.setLineDash([24, 20]); x.lineWidth = 3; x.beginPath(); x.moveTo(-60, (JY0 + JY1) / 2); x.lineTo(RL - 10, (JY0 + JY1) / 2); x.stroke(); x.setLineDash([]);
    x.globalAlpha = 1;
  }
  x.setLineDash([34, 28]); x.lineWidth = 4; x.beginPath(); x.moveTo(MID, 470); x.lineTo(MID, 1700); x.stroke(); x.setLineDash([]);
  // dimension marks on the right edge (drawing look)
  x.lineWidth = 2; x.strokeStyle = "rgba(235,245,255,0.45)";
  for (let y = 520; y < 1200; y += 80) { x.beginPath(); x.moveTo(RR + 18, y); x.lineTo(RR + 34, y); x.stroke(); }
  x.restore();
}
// car seen from above; ang = heading (-PI/2 = up). blink: 0..1 left indicator, steer: front wheel angle
function car(X, Y, ang, c = LINE, o = {}) {
  const { a = 1, blink = 0, steer = 0, head = 0, brake = 0 } = o;
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(ang + Math.PI / 2); x.scale(0.8, 0.8);
  x.lineJoin = "round"; x.lineCap = "round"; x.strokeStyle = c; x.fillStyle = "rgba(255,255,255,0.07)"; x.lineWidth = 5;
  // wheels
  for (const [wx, wy, st] of [[-86, -70, steer], [86, -70, steer], [-86, 74, 0], [86, 74, 0]]) { x.save(); x.translate(wx, wy); x.rotate(st); x.strokeRect(-10, -24, 20, 48); x.restore(); }
  rr(-80, -120, 160, 240, 38); x.fill(); x.stroke();
  x.lineWidth = 3.5; rr(-60, -70, 120, 46, 14); x.stroke(); rr(-56, 52, 112, 34, 12); x.stroke();
  x.beginPath(); x.moveTo(-62, -18); x.lineTo(-62, 44); x.moveTo(62, -18); x.lineTo(62, 44); x.stroke();
  // driver (left seat) + head direction
  x.beginPath(); x.arc(-30, -4, 18, 0, Math.PI * 2); x.stroke();
  x.save(); x.translate(-30, -4); x.rotate(-head); x.beginPath(); x.moveTo(0, -18); x.lineTo(0, -34); x.stroke(); x.restore();
  if (blink > 0) { x.fillStyle = AMBER; x.globalAlpha = a * blink; rr(-82, -124, 28, 16, 5); x.fill(); rr(-82, 108, 28, 16, 5); x.fill(); x.globalAlpha = a; }
  if (brake > 0) { x.fillStyle = RED; x.globalAlpha = a * brake; rr(-40, 112, 26, 10, 4); x.fill(); rr(14, 112, 26, 10, 4); x.fill(); }
  x.restore();
}
function bike(X, Y, ang, c, o = {}) {
  const { a = 1, brake = 0 } = o;
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(ang); x.scale(0.62, 0.62); x.lineCap = "round"; x.lineJoin = "round";
  x.strokeStyle = c; x.lineWidth = 7; x.fillStyle = "rgba(6,32,63,0.9)";
  rr(-118, -13, 64, 26, 12); x.fill(); x.stroke();
  rr(48, -12, 64, 24, 11); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(-8, 0, 72, 28, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(52, -54); x.lineTo(52, 54); x.stroke();
  x.fillStyle = c; x.beginPath(); x.arc(-24, 0, 24, 0, Math.PI * 2); x.fill();
  if (brake > 0) { x.globalAlpha = a * brake; x.fillStyle = RED; x.beginPath(); x.arc(-134, 0, 15, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
const UP = -Math.PI / 2;
function dots(pts, color, a, k = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color;
  const segs = pts.length - 1, n = 16;
  for (let i = 1; i <= n * k; i++) { const f = (i / n) * segs, s = Math.min(segs - 1, Math.floor(f)), r = f - s; x.beginPath(); x.arc(lerp(pts[s][0], pts[s + 1][0], r), lerp(pts[s][1], pts[s + 1][1], r), 7, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
function box(X0, Y0, X1, Y1, color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 5; x.setLineDash([18, 12]); x.strokeRect(X0, Y0, X1 - X0, Y1 - Y0);
  x.fillStyle = color; x.globalAlpha = a * 0.12; x.fillRect(X0, Y0, X1 - X0, Y1 - Y0); x.restore();
}
function gapBar(X, y0, y1, color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 4;
  x.beginPath(); x.moveTo(X, y0); x.lineTo(X, y1); x.moveTo(X - 18, y0); x.lineTo(X + 18, y0); x.moveTo(X - 18, y1); x.lineTo(X + 18, y1); x.stroke(); x.restore();
}
// the turning car's path into the side road (quadratic)
const TP = [[LANE, 960], [LANE, 865], [250, 865]];
const qB = (f) => [0, 1].map((i) => (1 - f) * (1 - f) * TP[0][i] + 2 * (1 - f) * f * TP[1][i] + f * f * TP[2][i]);
const qA = (f) => { const d = [0, 1].map((i) => 2 * (1 - f) * (TP[1][i] - TP[0][i]) + 2 * f * (TP[2][i] - TP[1][i])); return Math.atan2(d[1], d[0]); };

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 900); x.scale(z, z); x.translate(-540, -900);
  paper();
  const sideA = id === "s6" ? 1 - sm(0.2, 0.6, u) : id === "s7" || id === "s8" ? 0 : 1;
  roads(sideA);
  const blinkOn = (uu) => (Math.sin(uu * 14) > 0 ? 1 : 0.1);
  const L = [];   // overlay jobs in board px

  if (id === "s1") {
    const k = cl((u + LEAD) / (d + LEAD));
    car(LANE, 1060 - 40 * k, UP);
    bike(LANE, 1215 - 40 * k, UP, RED);
    L.push(() => tag("SLOW CAR", 830, 1000, WHITE, sm(at("s1", "slow") - 0.1, at("s1", "slow") + 0.2, u)));
    L.push(() => tag("SIDE ROAD", 190, 760, WHITE, sm(at("s1", "side") - 0.1, at("s1", "side") + 0.2, u)));
  }
  let BX = 0, BY = 0;
  if (id === "s2") {
    const P = at("s2", "pull"), k = cl(u / d);
    const out = sm(P - 0.1, P + 0.5, u);
    BX = lerp(LANE, OPP, out); BY = lerp(1175, 1010, sm(P, d, u));
    const cy = lerp(1020, 960, k);
    car(LANE, cy, UP);
    dots([[LANE, 1175], [OPP, 1080], [OPP, 880]], RED, sm(P - 0.1, P + 0.2, u) * 0.8, sm(P - 0.1, P + 0.6, u));
    bike(BX, BY, UP - 0.25 * Math.sin(out * Math.PI), RED);
    L.push(() => tag("PASSING", 830, 1130, RED, sm(at("s2", "pass") - 0.1, at("s2", "pass") + 0.2, u)));
    L.push(() => box(RL - 300, JY0, RR, JY1, RED, sm(at("s2", "junction") - 0.15, at("s2", "junction") + 0.1, u)));
    L.push(() => tag("JUNCTION", 190, 740, RED, sm(at("s2", "junction") - 0.1, at("s2", "junction") + 0.2, u)));
  }
  if (id === "s3") {
    const T = at("s3", "turns"), f = sm(T - 0.15, T + 1.1, u);
    const [cx2, cy2] = qB(f);
    car(cx2, cy2, qA(Math.max(0.001, f)), LINE, { blink: blinkOn(u), steer: -0.45 * sm(T - 0.15, T + 0.2, u) });
    const st = sm(T + 0.2, at("s3", "stop"), u);
    BX = OPP; BY = lerp(1010, 975, st);
    bike(BX, BY, UP, RED, { brake: sm(T + 0.1, T + 0.3, u) });
    L.push(() => tag("TURNING", 830, 760, AMBER, sm(T - 0.1, T + 0.2, u)));
    const rT = at("s3", "room");
    L.push(() => tag("NO ROOM", 830, 1080, RED, sm(rT - 0.1, rT + 0.2, u)));
    const sT = at("s3", "stop");
    L.push(() => mark("x", 250, 1060, back(sT, sT + 0.3, u) * 0.6, u > sT - 0.05 ? 1 : 0, RED));
  }
  if (id === "s4") {
    const k = sm(0, d, u), cy = lerp(1040, 935, k);
    car(LANE, cy, UP, LINE, { brake: 0.6 });
    bike(LANE, cy + 180, UP, VIOLET);
    const J = sm(at("s4", "junction") - 0.25, at("s4", "junction") + 0.1, u);
    L.push(() => box(RL - 300, JY0, RR, JY1, GREEN, J));
    L.push(() => tag("WAIT", 190, 740, GREEN, J));
    L.push(() => gapBar(760, cy + 100, cy + 140, GREEN, sm(at("s4", "stay") - 0.1, at("s4", "stay") + 0.2, u)));
    L.push(() => tag("STAY BEHIND", 830, 1150, GREEN, sm(at("s4", "stay") - 0.1, at("s4", "stay") + 0.2, u)));
  }
  if (id === "s5") {
    const W2 = at("s5", "wheels"), H = at("s5", "head");
    car(LANE, 935, UP, LINE, { blink: blinkOn(u), steer: -0.42 * sm(W2 - 0.1, W2 + 0.25, u), head: 0.9 * sm(H - 0.1, H + 0.25, u), brake: 0.6 });
    bike(LANE, 1115, UP, VIOLET);
    L.push(() => tag("INDICATOR", 830, 760, AMBER, sm(at("s5", "indicator") - 0.1, at("s5", "indicator") + 0.2, u)));
    L.push(() => tag("WHEELS", 830, 860, VIOLET, sm(W2 - 0.1, W2 + 0.2, u)));
    L.push(() => tag("HEAD", 830, 960, VIOLET, sm(H - 0.1, H + 0.2, u)));
  }
  if (id === "s6") {
    { const f0 = sm(0, 0.5, u), [qx, qy] = qB(f0); car(qx, qy - 25, qA(Math.max(0.001, f0)), LINE, { a: 1 - sm(0.2, 0.55, u), blink: blinkOn(u) }); }
    const c2 = lerp(860, 800, cl(u / d));
    car(LANE, c2, UP, LINE, { a: sm(0.35, 0.7, u) });
    const C = at("s6", "clear"), R = at("s6", "room"), Pb = at("s6", "pull");
    const out = sm(C - 0.1, C + 0.4, u), inn = sm(Pb - 0.1, Pb + 0.45, u);
    BX = lerp(lerp(LANE, OPP, out), LANE, inn);
    BY = lerp(1115, 590, sm(C - 0.1, Pb + 0.3, u));
    L.push(() => box(RL + 6, 480, MID - 6, 1180, GREEN, sm(C - 0.2, C + 0.1, u) * (1 - sm(Pb, Pb + 0.4, u))));
    L.push(() => tag("CLEAR STRAIGHT", 300, 1150, GREEN, sm(C - 0.1, C + 0.2, u)));
    L.push(() => gapBar(770, 590 + 50, c2 - 100, GREEN, sm(R - 0.1, R + 0.2, u)));
    L.push(() => tag("ROOM", 850, 700, GREEN, sm(R - 0.1, R + 0.2, u)));
    bike(BX, BY, UP - 0.25 * Math.sin(out * Math.PI) + 0.25 * Math.sin(inn * Math.PI), VIOLET);
    const bT = at("s6", "back");
    L.push(() => mark("v", 250, 640, back(bT, bT + 0.3, u) * 0.5, u > bT - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") {
    car(LANE, 800, UP, LINE); bike(LANE, 590, UP, VIOLET);
  }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER OVERTAKE", "AT A JUNCTION"], RED, 320, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "overtake"))));
  if (id === "s2") words(["PASSING AT", "THE JUNCTION"], RED, 320, 0.0, 1, 150, flash(u, at("s2", "junction")) * 0.6);
  if (id === "s3") words(["IT TURNS.", "NO ROOM TO STOP."], RED, 320, 0.0, 1, 140, flash(u, at("s3", "room")) * 0.6);
  if (id === "s4") words(["STAY BEHIND", "PAST THE JUNCTION"], GREEN, 320, 0.0, 1, 140, flash(u, at("s4", "stay")) * 0.6);
  if (id === "s5") words(["WATCH THE", "CAR'S SIGNS"], GREEN, 320, 0.0, 1, 150, flash(u, at("s5", "watch")) * 0.6);
  if (id === "s6") words(["PASS ON A", "CLEAR STRAIGHT"], GREEN, 320, 0.0, 1, 140, flash(u, at("s6", "clear")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(4,22,44,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["NO PASSING", "AT JUNCTIONS."], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05));
    words(["WAIT FOR A", "CLEAR STRAIGHT."], ORANGE, 930, at("s7", "wait") - 0.05, 1, 150, flash(u, at("s7", "clear")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(4,22,44,0.85)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = LINE; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 130, 0, Math.PI * 2); x.stroke();
    x.setLineDash([14, 12]); x.beginPath(); x.arc(0, 0, 160, u * 2, u * 2 + 4.5); x.stroke(); x.setLineDash([]);
    x.beginPath(); x.moveTo(-180, 0); x.lineTo(180, 0); x.moveTo(0, -180); x.lineTo(0, 180); x.globalAlpha = 0.35; x.stroke();
    x.restore();
    if (k > 0.3) bike(CX, 560, UP, VIOLET, { a: cl((k - 0.3) / 0.4) });
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["junction-overtake-blueprint"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
