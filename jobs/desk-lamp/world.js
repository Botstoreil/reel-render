// desk-lamp (Hidden Cam 28): 2D Canvas reel, MINIMAL LINE style (infrastructure from slow-scan). Time only from hf-seek.
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
// desk-lamp (Hidden Cam 28) - MINIMAL LINE style (kit from slow-scan). A hotel room from the front: bed on the left,
// a desk on the right with an angled desk lamp whose head points at the bed. Wrong: a camera sits in the lamp base,
// and with the light on the glare hides the tiny lens. Right: lamp off, look at the base and the neck, check for a
// small hole or a light that stays on, unsure = turn the lamp away from the bed.
function room(dim = 0) {
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  if (dim > 0) { raw.fillStyle = `rgba(18,18,18,${0.07 * dim})`; raw.fillRect(0, 0, 1080, 1920); }
}
function sparkle(X, Y, r, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.fillStyle = c;
  x.beginPath(); for (let i = 0; i < 8; i++) { const R = i % 2 ? r * 0.22 : r; const A = (i / 8) * Math.PI * 2; x.lineTo(Math.cos(A) * R, Math.sin(A) * R); } x.closePath(); x.fill();
  x.restore();
}
const FLOOR = 1180;
const BASE = [720, 925];                // lamp base centre (200 x 40)
const HOLE = [672, 926];                // tiny lens hole in the front of the base
const ELBOW = [800, 760], PIV = [690, 680];
const BED = [250, 1040];
const A_BED = Math.atan2(BED[1] - PIV[1], BED[0] - PIV[0]); // head toward the bed
const A_WALL = -0.25;                                       // head turned to the right wall
function floorLine(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 5;
  x.beginPath(); x.moveTo(40, FLOOR); x.lineTo(1000, FLOOR); x.stroke(); x.restore();
}
function bed(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 5; x.lineJoin = "round"; x.fillStyle = BG;
  rr(60, 820, 40, 360, 12); x.fill(); x.stroke();
  rr(100, 1000, 330, 90, 22); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(110, 1090); x.lineTo(110, FLOOR); x.moveTo(420, 1090); x.lineTo(420, FLOOR); x.stroke();
  x.beginPath(); x.ellipse(170, 978, 56, 24, -0.1, 0, Math.PI * 2); x.stroke();
  x.restore();
}
function desk(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 5; x.fillStyle = BG;
  x.fillRect(560, 945, 380, 30); x.strokeRect(560, 945, 380, 30);
  x.beginPath(); x.moveTo(590, 975); x.lineTo(590, FLOOR); x.moveTo(910, 975); x.lineTo(910, FLOOR); x.stroke();
  x.restore();
}
// the lamp; ang = head direction; on = light 0..1; cam = x-ray camera in the base; ring = highlight on the hole;
// led = small light that stays on (on the neck joint); c = line colour
function lamp(a, o = {}) {
  if (a <= 0) return;
  const { ang = A_BED, on = 0, cam = 0, ring = 0, led = 0, c = VIOLET, ringC = RED, t = 0 } = o;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 5; x.lineCap = "round"; x.lineJoin = "round"; x.fillStyle = BG;
  rr(BASE[0] - 100, BASE[1] - 20, 200, 40, 16); x.fill(); x.stroke();                 // base
  x.beginPath(); x.moveTo(BASE[0] + 30, BASE[1] - 20); x.lineTo(ELBOW[0], ELBOW[1]); x.lineTo(PIV[0], PIV[1]); x.stroke(); // neck
  x.beginPath(); x.arc(ELBOW[0], ELBOW[1], 14, 0, Math.PI * 2); x.fill(); x.stroke();   // joint
  // the hole in the base
  x.fillStyle = INKC; x.beginPath(); x.arc(HOLE[0], HOLE[1], 6, 0, Math.PI * 2); x.fill();
  if (cam > 0) {
    x.save(); x.globalAlpha = a * cam; x.strokeStyle = RED; x.lineWidth = 5;
    rr(HOLE[0] - 14, HOLE[1] - 14, 96, 28, 8); x.stroke();
    x.beginPath(); x.arc(HOLE[0], HOLE[1], 12, 0, Math.PI * 2); x.stroke(); x.restore();
  }
  if (ring > 0) { x.save(); x.globalAlpha = a * ring; x.strokeStyle = ringC; x.lineWidth = 5; x.beginPath(); x.arc(HOLE[0], HOLE[1], 30, 0, Math.PI * 2); x.stroke(); x.restore(); }
  if (led > 0) {
    x.save(); x.globalAlpha = a * led * (0.75 + 0.25 * Math.sin(t * 9)); x.fillStyle = RED;
    x.beginPath(); x.arc(ELBOW[0] + 26, ELBOW[1] - 4, 8, 0, Math.PI * 2); x.fill();
    x.globalAlpha = a * led * 0.3; x.beginPath(); x.arc(ELBOW[0] + 26, ELBOW[1] - 4, 22, 0, Math.PI * 2); x.fill(); x.restore();
  }
  // head
  x.save(); x.translate(PIV[0], PIV[1]); x.rotate(ang);
  if (on > 0) {
    x.save(); x.globalAlpha = a * on * 0.13; x.fillStyle = YELLOW;
    x.beginPath(); x.moveTo(110, -55); x.lineTo(480, -220); x.lineTo(480, 220); x.lineTo(110, 55); x.closePath(); x.fill(); x.restore();
  }
  x.strokeStyle = c; x.fillStyle = BG;
  x.beginPath(); x.moveTo(0, -24); x.lineTo(110, -62); x.lineTo(110, 62); x.lineTo(0, 24); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.arc(-8, 0, 24, 0, Math.PI * 2); x.fill(); x.stroke();
  x.restore();
  x.restore();
}
function sightCone(a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.3; x.fillStyle = color;
  x.beginPath(); x.moveTo(HOLE[0], HOLE[1]); x.lineTo(BED[0] - 170, BED[1] - 90); x.lineTo(BED[0] + 60, BED[1] + 60); x.closePath(); x.fill();
  x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 5; x.setLineDash([24, 18]);
  x.beginPath(); x.moveTo(HOLE[0], HOLE[1]); x.lineTo(BED[0] - 20, BED[1] - 10); x.stroke();
  x.restore();
}
// magnifier circle drawn around a point
function lens(X, Y, R, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = GREEN; x.lineWidth = 5; x.lineCap = "round";
  x.beginPath(); x.arc(X, Y, R * a, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(X + R * 0.72, Y + R * 0.72); x.lineTo(X + R * 1.3, Y + R * 1.3); x.stroke();
  x.restore();
}

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  drawK = lerp(0.4, 1, sm(-LEAD, 0.5, u));
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  let z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut, fx = CX, fy = 900;
  if (id === "s3") { z = lerp(1.15, 1.3, sm(0, d, u)); fx = 700; fy = 820; }
  if (id === "s4" || id === "s5") { z = lerp(1.3, 1.4, sm(0, d, u)); fx = 740; fy = 820; }
  room(id === "s4" || id === "s5" ? 0.8 : 0);
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-fx, -fy);
  const a0 = lerp(0.55, 1, sm(-LEAD, 0.15, u));

  if (id === "s1") {
    floorLine(a0); bed(a0); desk(a0);
    const Tn = sm(at("s1", "turned") - 0.05, at("s1", "toward") + 0.15, u);
    lamp(a0, { ang: lerp(-1.2, A_BED, Tn) });
    sightCone(sm(at("s1", "toward") - 0.05, at("s1", "bed") + 0.1, u), RED);
    tag("DESK LAMP", 760, 590, VIOLET, sm(at("s1", "lamp") - 0.05, at("s1", "lamp") + 0.2, u), 40);
  }
  if (id === "s2") {
    floorLine(1); bed(1); desk(1);
    const cam = sm(at("s2", "cameras") - 0.1, at("s2", "cameras") + 0.25, u);
    lamp(1, { cam, ring: cam });
    sightCone(0.7, RED);
    tag("CAMERA IN THE BASE", 700, 1060, RED, sm(at("s2", "bases") - 0.15, at("s2", "bases") + 0.1, u), 38);
  }
  if (id === "s3") {
    floorLine(1); bed(1); desk(1);
    const On = sm(at("s3", "light") - 0.1, at("s3", "on") + 0.1, u);
    lamp(1, { on: On });
    const G = sm(at("s3", "glare") - 0.1, at("s3", "glare") + 0.15, u);
    if (G > 0) { x.save(); x.globalAlpha = G; x.strokeStyle = INKC; x.lineWidth = 4; x.lineCap = "round";
      for (let i = 0; i < 12; i++) { const h = i * Math.PI / 6, r0 = 70, r1 = 70 + 70 * G * (i % 2 ? 0.6 : 1); x.beginPath(); x.moveTo(PIV[0] - 60 + Math.cos(h) * r0, PIV[1] + 50 + Math.sin(h) * r0); x.lineTo(PIV[0] - 60 + Math.cos(h) * r1, PIV[1] + 50 + Math.sin(h) * r1); x.stroke(); }
      x.restore(); }
    tag("GLARE", 470, 640, RED, G, 40);
    const L = sm(at("s3", "tiny") - 0.1, at("s3", "lens") + 0.1, u);
    if (L > 0) { x.save(); x.globalAlpha = L; x.strokeStyle = RED; x.lineWidth = 5; x.beginPath(); x.arc(HOLE[0], HOLE[1], 26, 0, Math.PI * 2); x.stroke(); x.restore(); }
    tag("TINY LENS", HOLE[0] - 170, 925, RED, L, 36);
  }
  if (id === "s4") {
    floorLine(1); desk(1);
    const Off = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.1, u);
    lamp(1, { on: 1 - Off, c: Off > 0.5 ? GREEN : VIOLET });
    tag("LAMP OFF", 560, 640, GREEN, Off, 34);
    lens(BASE[0] - 30, BASE[1], 90, sm(at("s4", "base") - 0.1, at("s4", "base") + 0.2, u));
    tag("BASE", BASE[0] - 240, 925, GREEN, sm(at("s4", "base") - 0.05, at("s4", "base") + 0.2, u), 32);
    lens(ELBOW[0], ELBOW[1], 70, sm(at("s4", "neck") - 0.1, at("s4", "neck") + 0.2, u));
    tag("NECK", ELBOW[0] + 20, 650, GREEN, sm(at("s4", "neck") - 0.05, at("s4", "neck") + 0.2, u), 32);
  }
  if (id === "s5") {
    floorLine(1); desk(1);
    const H = sm(at("s5", "small") - 0.1, at("s5", "hole") + 0.1, u);
    const Ld = sm(at("s5", "light") - 0.1, at("s5", "light") + 0.15, u);
    lamp(1, { ring: H, ringC: RED, led: Ld, t: u, c: GREEN });
    tag("SMALL HOLE?", HOLE[0] - 95, 860, RED, H, 30);
    tag("LIGHT STAYS ON?", 760, 640, RED, sm(at("s5", "stays") - 0.1, at("s5", "on") + 0.1, u), 30);
  }
  if (id === "s6") {
    floorLine(1); bed(1); desk(1);
    const Tu = sm(at("s6", "turn") - 0.05, at("s6", "away") + 0.15, u);
    lamp(1, { ang: lerp(A_BED, A_WALL, Tu), c: Tu > 0.5 ? GREEN : VIOLET });
    sightCone(0.7 * (1 - Tu), RED);
    tag("AWAY FROM THE BED", 700, 590, GREEN, sm(at("s6", "away") - 0.1, at("s6", "bed") + 0.1, u), 38);
    stamp("v", 260, 760, 0.8 * back(at("s6", "bed"), at("s6", "bed") + 0.3, u), u > at("s6", "bed") ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    floorLine(0.1); bed(0.1); desk(0.1);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE DESK LAMP"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "ignore"))));
  if (id === "s2") words(["CAMERAS IN", "LAMP BASES"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "bases")) * 0.6);
  if (id === "s3") words(["THE GLARE", "HIDES THE LENS"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "glare")) * 0.6);
  if (id === "s4") words(["LAMP OFF.", "BASE AND NECK"], GREEN, 330, 0.0, 1, 150, flash(u, at("s4", "off")) * 0.6);
  if (id === "s5") words(["A HOLE?", "A LIGHT ON?"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "hole")) * 0.6);
  if (id === "s6") words(["NOT SURE?", "TURN IT AWAY"], GREEN, 330, 0.0, 1, 150, flash(u, at("s6", "turn")) * 0.6);
  if (id === "s7") {
    words(["CHECK THE LAMP."], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["TURN IT AWAY."], ORANGE, 880, at("s7", "turn") - 0.05, 1, 140, flash(u, at("s7", "away")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
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

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["desk-lamp-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
