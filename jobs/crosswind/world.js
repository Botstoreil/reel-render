// crosswind (Apex 22, TikTok) - WATERCOLOR style: soft paint washes on cream paper, pencil double outlines, a rider seen
// from the front on a bridge, wind streaks from the left. Wrong: a gust hits, arms locked stiff, every gust goes into
// the steering and the bike wobbles. Right: loose arms, knees on the tank, lean a little into the wind and let the
// bike move; ride in the middle of the lane with room on both sides. Time only from hf-seek.
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
const RED = "#d8323f", GREEN = "#1f9e57", VIOLET = "#6b4fd8", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#2b2a33", AMBER = "#e0a020";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B2 = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };

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
      x.lineWidth = Math.max(12, px * 0.17); x.strokeStyle = "#fbf7ee"; x.strokeText(p, 0, 0);
      x.lineWidth = Math.max(5, px * 0.05); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// a wash behind a word, with a pencil box
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1360);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = color; rr(-w / 2, -h / 2, w, h, 14); x.fill();
  x.fillStyle = "rgba(255,255,255,0.16)"; rr(-w / 2 + 10, -h / 2 + 6, w - 30, h * 0.45, 10); x.fill();
  x.strokeStyle = INK; x.lineWidth = 2.5; rr(-w / 2 - 4, -h / 2 + 3, w + 6, h - 2, 14); x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.fillStyle = c; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill();
  x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.arc(4, -3, 82, 0, Math.PI * 2); x.stroke();
  x.strokeStyle = WHITE; x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- watercolor bridge ----------
const VPX = 540, VPY = 700, GY = 1230;
// a soft blot: several offset translucent circles (deterministic)
function blot(X, Y, r, color, a) { for (let i = 0; i < 5; i++) { x.fillStyle = rgba(color, a * (0.5 - i * 0.07)); x.beginPath(); x.arc(X + Math.sin(i * 2.3) * r * 0.2, Y + Math.cos(i * 1.7) * r * 0.15, r * (1 - i * 0.12), 0, Math.PI * 2); x.fill(); } }
function wash(path, color, a = 0.55) {
  path(); x.fillStyle = rgba(color, a); x.fill();
  x.save(); x.translate(3, -2); path(); x.fillStyle = rgba(color, a * 0.35); x.fill(); x.restore();
  x.strokeStyle = rgba("#2b2a33", 0.75); x.lineWidth = 2.5; path(); x.stroke();
  x.save(); x.translate(4, 3); x.strokeStyle = rgba("#2b2a33", 0.25); x.lineWidth = 1.5; path(); x.stroke(); x.restore();
}
function paper(t) {
  x.fillStyle = "#f6f0e2"; x.fillRect(-200, -200, 1480, 2400);
  blot(240, 520, 300, "#9cc7e8", 0.5); blot(820, 600, 260, "#b7d6ef", 0.45); blot(560, 380, 220, "#f2c9a0", 0.35);
  // water under the bridge
  blot(140, 1500, 360, "#5c9cc8", 0.35); blot(940, 1550, 340, "#5c9cc8", 0.35);
  // deck, converging
  wash(() => { x.beginPath(); x.moveTo(VPX - 40, VPY); x.lineTo(VPX + 40, VPY); x.lineTo(1150, 1500); x.lineTo(-70, 1500); x.closePath(); }, "#8d8a96", 0.5);
  // lane lines
  x.strokeStyle = "rgba(255,255,255,0.9)"; x.lineWidth = 7; x.setLineDash([40, 40]); x.lineDashOffset = -t * 400;
  for (const s of [-1, 1]) { x.beginPath(); x.moveTo(VPX + s * 14, VPY); x.lineTo(540 + s * 330, 1500); x.stroke(); }
  x.setLineDash([]);
  // railings + suspension cables
  for (const s of [-1, 1]) {
    x.strokeStyle = rgba("#c24a3a", 0.8); x.lineWidth = 10; x.beginPath(); x.moveTo(VPX + s * 40, VPY - 20); x.lineTo(540 + s * 620, 1380); x.stroke();
    x.lineWidth = 4; for (let i = 0; i < 9; i++) { const k = i / 9, px = lerp(VPX + s * 40, 540 + s * 620, k * k), py = lerp(VPY - 20, 1380, k * k); x.beginPath(); x.moveTo(px, py); x.lineTo(px + s * 10, py - 60 - 200 * k * k); x.stroke(); }
    x.strokeStyle = rgba("#c24a3a", 0.55); x.lineWidth = 6; x.beginPath(); x.moveTo(VPX + s * 30, VPY - 140); x.quadraticCurveTo(540 + s * 240, 900, 540 + s * 700, 520); x.stroke();
  }
}
// wind streaks from the left; g = gust strength 0..1
function wind(t, g) {
  if (g <= 0) return;
  x.save(); x.lineCap = "round";
  for (let i = 0; i < 14; i++) {
    const y = 600 + ((i * 97) % 700), sp = 900 + (i % 4) * 220, X0 = ((t * sp + i * 311) % 1500) - 300;
    x.strokeStyle = rgba("#4f7fb8", (0.25 + 0.45 * g) * (0.6 + 0.4 * Math.sin(i))); x.lineWidth = 4 + 6 * g;
    x.beginPath(); x.moveTo(X0, y); x.bezierCurveTo(X0 + 80, y - 18 * g, X0 + 160, y + 18 * g, X0 + 220 + 120 * g, y); x.stroke();
  }
  x.restore();
}
// rider from the front. lean = whole bike (+ = top to the right), bars = steering wobble, arms: 0 stiff..1 loose, knees: grip highlight
function rider(c, o = {}) {
  const { lean = 0, bars = 0, arms = 0, knees = 0, stiffHl = 0 } = o;
  x.save(); x.translate(540, GY); x.rotate(lean); x.translate(-540, -GY);
  // tyre + fork
  wash(() => rr(510, 1000, 60, 230, 26), "#2b2a33", 0.85);
  x.save(); x.translate(540, 830); x.rotate(bars); x.translate(-540, -830);
  wash(() => { x.beginPath(); x.moveTo(480, 1010); x.lineTo(600, 1010); x.lineTo(580, 880); x.lineTo(500, 880); x.closePath(); }, "#5a5866", 0.7);
  wash(() => { x.beginPath(); x.ellipse(540, 930, 150, 95, 0, Math.PI, 0); x.lineTo(690, 960); x.lineTo(390, 960); x.closePath(); }, c, 0.7);     // fairing
  wash(() => { x.beginPath(); x.arc(540, 915, 40, 0, Math.PI * 2); }, "#f6e7a6", 0.9);                                                           // headlight
  x.strokeStyle = rgba("#2b2a33", 0.9); x.lineWidth = 14; x.lineCap = "round"; x.beginPath(); x.moveTo(365, 830); x.lineTo(715, 830); x.stroke(); // bars
  x.restore();
  // legs, knees on the tank (in) or out
  const kin = lerp(118, 72, knees);
  for (const s of [-1, 1]) {
    x.strokeStyle = rgba("#3b4a6a", 0.8); x.lineWidth = 46; x.lineCap = "round";
    x.beginPath(); x.moveTo(540 + s * 50, 840); x.lineTo(540 + s * kin, 960); x.lineTo(540 + s * 120, 1090); x.stroke();
    if (knees > 0) blot(540 + s * kin, 960, 46, "#1f9e57", 0.9 * knees);
  }
  wash(() => rr(470, 870, 140, 90, 30), c, 0.75);                                                                                                // tank
  // torso + head
  wash(() => { x.beginPath(); x.moveTo(450, 860); x.lineTo(630, 860); x.lineTo(625, 680); x.quadraticCurveTo(540, 630, 455, 680); x.closePath(); }, "#3f7fc9", 0.6);
  wash(() => { x.beginPath(); x.arc(540, 585, 70, 0, Math.PI * 2); }, "#2b2a33", 0.8);
  wash(() => rr(492, 565, 96, 40, 16), "#8fd0ff", 0.85);
  // arms: stiff = straight shoulder->grip; loose = elbows bent down and out
  const hands = [[365 + 25, 830 + Math.sin(bars) * -40], [715 - 25, 830 + Math.sin(bars) * 40]];
  [[-1, hands[0]], [1, hands[1]]].forEach(([s, h]) => {
    const sh = [540 + s * 80, 690];
    const el = [lerp((sh[0] + h[0]) / 2, 540 + s * 175, arms), lerp((sh[1] + h[1]) / 2, 790, arms)];
    x.strokeStyle = stiffHl > 0 ? mix("#3f7fc9", RED, stiffHl) : rgba("#3f7fc9", 0.8); x.lineWidth = 34; x.lineCap = "round"; x.lineJoin = "round";
    x.beginPath(); x.moveTo(sh[0], sh[1]); x.lineTo(el[0], el[1]); x.lineTo(h[0], h[1]); x.stroke();
    if (arms > 0.5) blot(el[0], el[1], 34, "#1f9e57", 0.7 * (arms - 0.5) * 2);
  });
  x.restore();
}
function zones(a) {
  if (a <= 0) return;
  for (const s of [-1, 1]) { x.save(); x.globalAlpha = a; wash(() => { x.beginPath(); x.moveTo(540 + s * 190, 1500); x.lineTo(540 + s * 320, 1500); x.lineTo(VPX + s * 14, VPY + 40); x.lineTo(VPX + s * 8, VPY + 40); x.closePath(); }, "#1f9e57", 0.35); x.restore(); }
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  paper(t);
  const L = [];

  if (id === "s1") {
    wind(t, 0.4 + 0.3 * sm(at("s1", "wind") - 0.2, at("s1", "wind") + 0.2, u));
    rider(RED, { lean: -0.04, arms: 0.2 });
    L.push(() => tag("SIDE WIND", 260, 1360,"#4f7fb8", sm(at("s1", "side") - 0.1, at("s1", "side") + 0.2, u)));
    L.push(() => tag("SOUNDS WRONG", 760, 1360,ORANGE, sm(at("s1", "sounds") - 0.1, at("s1", "sounds") + 0.2, u)));
  }
  if (id === "s2") {
    const G = at("s2", "gust"), Lk = at("s2", "lock");
    const g = sm(G - 0.1, G + 0.2, u);
    wind(t, 0.4 + 0.6 * g);
    const st = sm(Lk - 0.1, Lk + 0.2, u);
    rider(RED, { lean: -0.03 + 0.05 * g * Math.sin(u * 9), arms: lerp(0.2, 0, st), stiffHl: st });
    L.push(() => tag("GUST", 230, 640, "#4f7fb8", sm(G - 0.1, G + 0.2, u)));
    L.push(() => tag("STIFF ARMS", 800, 640, RED, sm(Lk - 0.1, Lk + 0.2, u)));
  }
  if (id === "s3") {
    const St = at("s3", "steering"), Wo = at("s3", "wobbles");
    wind(t, 0.9);
    const wob = sm(St - 0.3, Wo, u);
    rider(RED, { lean: 0.08 * wob * Math.sin(u * 13), bars: 0.16 * wob * Math.sin(u * 16 + 0.6), arms: 0, stiffHl: 1 });
    L.push(() => tag("INTO THE STEERING", 540, 640, RED, sm(St - 0.1, St + 0.2, u)));
    L.push(() => tag("WOBBLE", 800, 1360,RED, sm(Wo - 0.1, Wo + 0.2, u)));
    L.push(() => mark("x", 240, 900, back(Wo + 0.1, Wo + 0.4, u) * 0.55, u > Wo ? 1 : 0, RED));
  }
  if (id === "s4") {
    const Re = at("s4", "relax"), Kn = at("s4", "knees");
    wind(t, 0.8);
    rider(VIOLET, { lean: -0.05 + 0.015 * Math.sin(u * 5), arms: sm(Re - 0.1, Re + 0.4, u), knees: sm(Kn - 0.1, Kn + 0.2, u) });
    L.push(() => tag("LOOSE ARMS", 800, 640, GREEN, sm(Re - 0.1, Re + 0.2, u)));
    L.push(() => tag("KNEES ON TANK", 300, 1360,GREEN, sm(Kn - 0.1, Kn + 0.2, u)));
  }
  if (id === "s5") {
    const Le = at("s5", "lean"), Mv = at("s5", "move");
    wind(t, 0.8);
    const ln = sm(Le - 0.1, Le + 0.5, u);
    rider(VIOLET, { lean: -0.05 - 0.09 * ln + 0.03 * sm(Mv - 0.2, Mv, u) * Math.sin(u * 6), arms: 1, knees: 1 });
    L.push(() => tag("LEAN INTO IT", 260, 640, VIOLET, sm(Le - 0.1, Le + 0.2, u)));
    L.push(() => tag("LET IT MOVE", 800, 1360,GREEN, sm(Mv - 0.1, Mv + 0.2, u)));
  }
  if (id === "s6") {
    const Mi = at("s6", "middle"), Ro = at("s6", "room");
    wind(t, 0.7);
    L.push(() => zones(sm(Ro - 0.2, Ro + 0.1, u)));
    rider(VIOLET, { lean: -0.12, arms: 1, knees: 1 });
    L.push(() => tag("MIDDLE OF LANE", 540, 640, VIOLET, sm(Mi - 0.1, Mi + 0.2, u)));
    L.push(() => tag("ROOM", 180, 1360,GREEN, sm(Ro - 0.1, Ro + 0.2, u)));
    L.push(() => tag("ROOM", 900, 1360,GREEN, sm(Ro - 0.1, Ro + 0.2, u)));
    L.push(() => mark("v", 860, 900, back(Ro + 0.2, Ro + 0.5, u) * 0.5, u > Ro + 0.1 ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") { wind(t, 0.5); rider(VIOLET, { lean: -0.1, arms: 1, knees: 1 }); }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER GRIP HARDER", "IN WIND"], RED, 320, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "grip"))));
  if (id === "s2") words(["ARMS LOCKED", "STIFF"], RED, 320, 0.0, 1, 170, flash(u, at("s2", "stiff")) * 0.6);
  if (id === "s3") words(["THE BIKE", "WOBBLES"], RED, 320, 0.0, 1, 170, flash(u, at("s3", "wobbles")) * 0.6);
  if (id === "s4") words(["LOOSE ARMS,", "TIGHT KNEES"], GREEN, 320, 0.0, 1, 160, flash(u, at("s4", "knees")) * 0.6);
  if (id === "s5") words(["LEAN A LITTLE", "INTO THE WIND"], GREEN, 320, 0.0, 1, 150, flash(u, at("s5", "lean")) * 0.6);
  if (id === "s6") words(["ROOM ON", "BOTH SIDES"], GREEN, 320, 0.0, 1, 170, flash(u, at("s6", "room")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(43,42,51,0.62)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["LOOSE ARMS,", "TIGHT KNEES."], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05));
    words(["LET THE", "BIKE MOVE."], ORANGE, 930, at("s7", "let") - 0.05, 1, 170, flash(u, at("s7", "let")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(43,42,51,0.84)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    blot(0, 0, 160, "#9cc7e8", 0.9); blot(30, 20, 110, "#6b4fd8", 0.6);
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["crosswind-watercolor"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
