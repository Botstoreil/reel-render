// slow-scan: 2D Canvas reel (flat neon illustrations + kinetic text), same look as vents / light-bulb / smart-display. Time only from hf-seek.
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

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", YELLOW = "#ffd84a", BG = "#080622";
const CX = 510;
const cv = document.getElementById("world");
// MINIMAL LINE style (style test 22.11, style 8): white paper, one thin black line that draws the scene, one accent
// colour (the old warm colours: wrong-way marks, title, end card), lots of empty space. The story code is unchanged:
// a thin wrapper maps every colour and line width as it is set. Light (beam, glint) becomes a soft grey wash.
const raw = cv.getContext("2d");
const PAPER = "#fbfaf7", INKC = "#121212", ACCENT = "#ff3b30";
let drawK = 1; // 0..1 how much of each line is drawn (draws itself at the start of every voice line)
function rgbaOf(v) {
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return null; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  return [r, g, b, a];
}
function lineColor(v) {
  if (typeof v !== "string") return v; // gradients are already mapped when they are made
  const c = rgbaOf(v); if (!c) return v;
  const [r, g, b, a] = c;
  if (0.3 * r + 0.59 * g + 0.11 * b < 70) return `rgba(251,250,247,${a})`; // dark fills become paper
  if (r > g + 60 && r > b + 60) return a < 1 ? `rgba(255,59,48,${a})` : ACCENT; // red / orange = the accent
  return a < 1 ? `rgba(18,18,18,${a})` : INKC;
}
function washColor(v) {
  const c = typeof v === "string" ? rgbaOf(v) : null; if (!c) return "rgba(18,18,18,0)";
  const [r, g, b, a] = c;
  if (a === 0 || 0.3 * r + 0.59 * g + 0.11 * b < 70) return "rgba(18,18,18,0)";
  if (r > g + 60 && r > b + 60 && g < 150) return `rgba(255,59,48,${0.35 * a})`;
  return `rgba(18,18,18,${0.16 * a})`;
}
// keep the real CanvasGradient (the canvas rejects proxies), only remap its colour stops
function wrapGrad(gr) { const add = gr.addColorStop.bind(gr); gr.addColorStop = (o, c) => add(o, washColor(c)); return gr; }
const x = new Proxy(raw, {
  get(t, k) {
    if (k === "stroke") return (...a) => { const L = 2600; t.setLineDash([L * drawK, L]); t.stroke(...a); t.setLineDash([]); };
    if (k === "createRadialGradient" || k === "createLinearGradient") return (...a) => { const g = t[k](...a); return wrapGrad(g); };
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
  x.translate(X, Y); x.scale(s, s);
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  glow(color, 30); x.strokeStyle = color; x.lineWidth = 22;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.beginPath();
  if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); }
  else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
  x.stroke(); noGlow(); x.restore();
}

// ---------- props ----------
function room(dim = 0) {
  // white paper and one floor line: the empty space is the style. "Lights off" = a faint grey wash.
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  if (dim > 0) { raw.fillStyle = `rgba(18,18,18,${0.07 * dim})`; raw.fillRect(0, 0, 1080, 1920); }
}
function flashlight(X, Y, s, a, c, rot = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(rot); x.scale(s, s); glow(c, 24); x.strokeStyle = c; x.lineWidth = 9; x.fillStyle = "#24205a";
  rr(-180, -34, 220, 68, 18); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(40, -34); x.lineTo(100, -60); x.lineTo(100, 60); x.lineTo(40, 34); x.closePath(); x.fill(); x.stroke();
  noGlow(); x.restore();
}
function sparkle(X, Y, r, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); glow(c, 40); x.fillStyle = c;
  x.beginPath(); for (let i = 0; i < 8; i++) { const R = i % 2 ? r * 0.22 : r; const A = (i / 8) * Math.PI * 2; x.lineTo(Math.cos(A) * R, Math.sin(A) * R); } x.closePath(); x.fill();
  noGlow(); x.restore();
}
function beamTo(x0, y0, x1, y1, w, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = 0.4 * a; const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  x.fillStyle = gr; x.beginPath(); x.moveTo(x0 + nx * 12, y0 + ny * 12); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 12, y0 - ny * 12); x.closePath(); x.fill();
  x.restore();
}
// light spot on the wall; stretch > 1 smears it sideways (a fast sweep)
function spot(X, Y, R, a, c, stretch = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(stretch, 1);
  const g = x.createRadialGradient(0, 0, 4, 0, 0, R); g.addColorStop(0, c); g.addColorStop(0.35, c); g.addColorStop(1, "rgba(0,0,0,0)");
  x.globalAlpha = a * 0.55; x.fillStyle = g; x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.fill();
  x.restore();
}
// wall shelf with a plant pot and a small decor box; the box hides a tiny lens at (LX, LY)
const LX = 700, LY = 1080;
function shelf(a, c, lensA = 0.35) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; glow(c, 22); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#16123a"; x.lineCap = "round";
  rr(150, 1160, 720, 34, 10); x.fill(); x.stroke();
  // plant pot
  x.beginPath(); x.moveTo(250, 1040); x.lineTo(270, 1160); x.lineTo(380, 1160); x.lineTo(400, 1040); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = GREEN; x.lineWidth = 8;
  [[-50, -120], [0, -150], [50, -115]].forEach(([dx, dy]) => { x.beginPath(); x.moveTo(325, 1040); x.quadraticCurveTo(325 + dx * 0.3, 1040 + dy * 0.6, 325 + dx, 1040 + dy); x.stroke(); });
  // books
  x.strokeStyle = c; x.lineWidth = 9;
  [[440, 70], [480, 60], [512, 80]].forEach(([bx, bh], i) => { rr(bx, 1160 - 130 - (i === 1 ? -20 : 0), 34, 130 + (i === 1 ? -20 : 0), 6); x.fill(); x.stroke(); });
  // decor box with the lens
  rr(600, 1010, 200, 150, 16); x.fill(); x.stroke();
  noGlow();
  x.globalAlpha = a * lensA; x.fillStyle = "#03020a"; x.beginPath(); x.arc(LX, LY, 10, 0, Math.PI * 2); x.fill();
  x.strokeStyle = c; x.lineWidth = 3; x.beginPath(); x.arc(LX, LY, 14, 0, Math.PI * 2); x.stroke();
  x.restore();
}
function eye(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 24); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#16123a";
  x.beginPath(); x.moveTo(-110, 0); x.quadraticCurveTo(0, -90, 110, 0); x.quadraticCurveTo(0, 90, -110, 0); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = c; x.beginPath(); x.arc(0, 0, 34, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#03020a"; x.beginPath(); x.arc(0, 0, 14, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
function ceilingLamp(X, Y, a, lit) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a;
  if (lit > 0) { const g = x.createRadialGradient(X, Y + 60, 10, X, Y + 60, 520); g.addColorStop(0, `rgba(255,216,74,${0.45 * lit})`); g.addColorStop(1, "rgba(255,216,74,0)"); x.fillStyle = g; x.fillRect(X - 520, Y - 460, 1040, 1040); }
  glow(lit > 0.5 ? YELLOW : VIOLET, 24); x.strokeStyle = lit > 0.5 ? YELLOW : VIOLET; x.lineWidth = 10; x.fillStyle = lit > 0.5 ? "#5a4a20" : "#16123a";
  x.beginPath(); x.moveTo(X, Y - 160); x.lineTo(X, Y - 40); x.stroke();
  x.beginPath(); x.moveTo(X - 130, Y + 50); x.lineTo(X - 70, Y - 40); x.lineTo(X + 70, Y - 40); x.lineTo(X + 130, Y + 50); x.closePath(); x.fill(); x.stroke();
  noGlow(); x.restore();
}
// switch on the wall; on 0..1
function lightSwitch(X, Y, a, c, on) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; glow(c, 22); x.strokeStyle = c; x.lineWidth = 9; x.fillStyle = "#16123a";
  rr(X - 60, Y - 90, 120, 180, 18); x.fill(); x.stroke();
  x.fillStyle = c; rr(X - 24, Y - 50 + 50 * (1 - on), 48, 50, 10); x.fill();
  noGlow(); x.restore();
}

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  drawK = lerp(0.4, 1, sm(-LEAD, 0.5, u)); // start 40% drawn: a 0-start left blank half-second frames at every cut
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  room(id === "s4" ? 0.8 * sm(at("s4", "off") - 0.05, at("s4", "off") + 0.2, u) : (id === "s8" ? 0 : 0.75));
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);

  if (id === "s1") {
    // dark room, a flashlight whips its light back and forth far too fast
    const a = sm(-0.05, 0.3, u);
    shelf(a, VIOLET);
    const F = sm(at("s1", "sweep") - 0.15, at("s1", "sweep"), u);
    const ph = (u * 2.6) % 1, sx = lerp(-150, 1230, ph < 0.5 ? ph * 2 : 2 - ph * 2);
    spot(sx, 1090, 170, F, mix(RED, WHITE, 0.3), 2.6);
    flashlight(CX, 1600, 1.1, a, VIOLET, Math.atan2(1090 - 1600, sx - CX));
    tag("TOO FAST", CX, 1420, RED, sm(at("s1", "fast") - 0.1, at("s1", "fast") + 0.15, u), 50);
  }
  if (id === "s2") {
    // eye + flashlight; the glint only lights up when the beam hits the lens from the right angle
    const a = sm(-0.05, 0.25, u);
    shelf(a, VIOLET);
    eye(240, 1560, 0.9, a, VIOLET); flashlight(270, 1450, 0.6, a, VIOLET, -0.9);
    const Ang = sm(at("s2", "right") - 0.35, at("s2", "right") + 0.05, u);
    const tx = lerp(980, LX, Ang), ty = lerp(760, LY, Ang);
    beamTo(320, 1400, tx, ty, 110, a, YELLOW);
    const G = sm(at("s2", "angle") - 0.1, at("s2", "angle") + 0.1, u);
    sparkle(LX, LY, 30 + 40 * G, G, WHITE);
    tag("RIGHT ANGLE", LX, 880, RED, G, 44);
  }
  if (id === "s3") {
    // one quick wave: the glint flickers for a moment and the light is already gone
    const a = sm(-0.05, 0.25, u);
    const p = sm(at("s3", "quick") - 0.05, at("s3", "skips") + 0.1, u);
    const sx = lerp(-150, 1230, p);
    shelf(a, VIOLET);
    spot(sx, 1090, 170, a * (p > 0 && p < 1 ? 1 : 0), mix(RED, WHITE, 0.3), 2.6);
    const near = Math.max(0, 1 - Math.abs(sx - LX) / 70);
    sparkle(LX, LY, 50, near, WHITE);
    const M = sm(at("s3", "past") - 0.1, at("s3", "past") + 0.15, u);
    x.save(); x.globalAlpha = M; glow(RED, 24); x.strokeStyle = RED; x.lineWidth = 8; x.setLineDash([18, 14]); x.beginPath(); x.arc(LX, LY, 70, 0, Math.PI * 2); x.stroke(); x.restore();
    tag("MISSED IT", LX, 900, RED, M, 46);
    stamp("x", 290, 1450, 0.9 * back(at("s3", "past") - 0.05, at("s3", "past") + 0.3, u), M, RED);
  }
  if (id === "s4") {
    // lights go off at the switch, then the flashlight comes up next to the eye
    const a = sm(-0.05, 0.25, u);
    const off = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.15, u);
    ceilingLamp(CX, 700, a * (1 - 0.6 * sm(at("s4", "hold") - 0.2, at("s4", "hold") + 0.2, u)), 1 - off);
    lightSwitch(870, 1000, a * (1 - sm(at("s4", "hold") - 0.2, at("s4", "hold") + 0.2, u)), off > 0.5 ? GREEN : VIOLET, 1 - off);
    tag("LIGHTS OFF", 870, 1150, GREEN, off * (1 - sm(at("s4", "hold") - 0.2, at("s4", "hold") + 0.2, u)), 40);
    const E = sm(at("s4", "hold") - 0.15, at("s4", "flashlight") + 0.1, u);
    const fy = lerp(1650, 1150, sm(at("s4", "flashlight") - 0.1, at("s4", "eye") + 0.1, u));
    eye(CX - 80, 1150, 1.1, E, GREEN);
    flashlight(CX + 180, fy, 0.75, E, GREEN, Math.PI);
    beamTo(CX + 100, fy, CX + 100 - 900, fy - 260, 150, E * sm(at("s4", "eye") - 0.1, at("s4", "eye") + 0.1, u), YELLOW);
    tag("NEXT TO YOUR EYE", CX, 1450, GREEN, sm(at("s4", "next") - 0.1, at("s4", "eye") + 0.1, u), 44);
  }
  if (id === "s5") {
    // the light spot crawls slowly in rows from the floor up the wall; it finds the glint on the shelf row
    const a = sm(-0.05, 0.25, u);
    shelf(a, VIOLET);
    const p = sm(at("s5", "move") - 0.05, at("s5", "high") + 0.3, u) * 4;
    const rows = [1450, 1270, 1090, 910];
    const pos = (q) => { const r = Math.min(3, Math.floor(q)), f = q - r; const X = r % 2 === 0 ? lerp(150, 870, f) : lerp(870, 150, f); return [X, rows[r]]; };
    x.save(); glow(GREEN, 14); x.fillStyle = GREEN;
    for (let q = 0; q < p; q += 0.05) { const [X, Y] = pos(q); x.globalAlpha = 0.35 * a; x.beginPath(); x.arc(X, Y, 6, 0, Math.PI * 2); x.fill(); }
    x.restore();
    const [SX, SY] = pos(Math.min(p, 3.999));
    spot(SX, SY, 130, a, mix(GREEN, WHITE, 0.4), 1);
    const G = Math.max(0, 1 - Math.hypot(SX - LX, SY - LY) / 120);
    sparkle(LX, LY, 54, Math.max(G, p > 2.76 * 1 ? 0.9 : 0), WHITE);
    tag("SLOWLY", 860, 1640, GREEN, sm(at("s5", "slowly") - 0.1, at("s5", "slowly") + 0.15, u), 46);
    tag("LOW TO HIGH", 300, 1640, GREEN, sm(at("s5", "low") - 0.1, at("s5", "high") + 0.1, u), 46);
  }
  if (id === "s6") {
    // looking through a paper tube: only one circle of the wall is visible, and the glint pops inside it
    const a = sm(-0.05, 0.25, u);
    shelf(a, VIOLET, 0.6);
    const T = sm(at("s6", "tube") - 0.3, at("s6", "tube") + 0.1, u);
    const R = lerp(900, 230, T);
    const dark = 0.35 + 0.6 * sm(at("s6", "block") - 0.1, at("s6", "out") + 0.15, u);
    x.save(); x.fillStyle = `rgba(2,1,10,${dark * T})`; x.beginPath(); x.rect(0, 0, 1080, 1920); x.arc(LX - 40, LY - 30, R, 0, Math.PI * 2, true); x.fill("evenodd"); x.restore();
    x.save(); x.globalAlpha = T; glow(ORANGE, 30); x.strokeStyle = "#c58a4a"; x.lineWidth = 34; x.beginPath(); x.arc(LX - 40, LY - 30, R + 17, 0, Math.PI * 2); x.stroke(); x.restore();
    spot(LX - 30, LY, 160, a * 0.8, mix(GREEN, WHITE, 0.4), 1);
    sparkle(LX, LY, 56, sm(at("s6", "rest") - 0.1, at("s6", "room") + 0.1, u), WHITE);
    tag("PAPER TUBE", CX, 1480, GREEN, sm(at("s6", "paper") - 0.1, at("s6", "tube") + 0.15, u), 48);
  }
  if (id === "s7") {
    shelf(0.6, GREEN, 0.6);
    sparkle(LX, LY, 40, 0.8, WHITE);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER SWEEP", "TOO FAST"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["ONLY AT THE", "RIGHT ANGLE"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "angle")) * 0.6);
  if (id === "s3") words(["TOO QUICK", "TO SEE IT"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "past")) * 0.6);
  if (id === "s4") words(["LIGHT BY", "YOUR EYE"], GREEN, 330, 0.0, 1, 150, flash(u, at("s4", "eye")) * 0.6);
  if (id === "s5") words(["SLOW,", "WALL BY WALL"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "slowly")) * 0.6);
  if (id === "s6") words(["USE A", "PAPER TUBE"], GREEN, 330, 0.0, 1, 150, flash(u, at("s6", "tube")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SLOW LIGHT."], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["SMALL GLINT."], ORANGE, 880, at("s7", "small") - 0.05, 1, 150, flash(u, at("s7", "glint")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 110, 0, Math.PI * 2); x.stroke();
    x.fillStyle = VIOLET; x.beginPath(); x.arc(0, 0, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = GREEN; glow(GREEN, 30); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 150, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["slow-scan-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
