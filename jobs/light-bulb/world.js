// light-bulb: 2D Canvas reel (flat neon illustrations + kinetic text), same look as vents / mirror-myth / peephole. Time only from hf-seek.
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

// chalk colours (the old neon names are kept so the story code stays the same)
const RED = "#ff8f8f", GREEN = "#a6f2b4", VIOLET = "#f4f1e6", ORANGE = "#ffc078", WHITE = "#ffffff", YELLOW = "#fff09a", BG = "#24432f";
const CX = 510;
const cv = document.getElementById("world");
const out = cv.getContext("2d");
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mk = () => { const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; return c; };
// the board: green slate, faint old smudges, wooden frame and chalk tray (outside the safe zone)
const boardC = mk(); {
  const b = boardC.getContext("2d"), r = rng(3);
  b.fillStyle = BG; b.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 46; i++) { b.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.022})`; b.beginPath(); b.ellipse(r() * 1080, r() * 1920, 80 + r() * 220, 30 + r() * 90, r() * 3, 0, Math.PI * 2); b.fill(); }
  b.fillStyle = "#7a5230"; b.fillRect(0, 0, 1080, 26); b.fillRect(0, 0, 26, 1920); b.fillRect(1054, 0, 26, 1920); b.fillRect(0, 1860, 1080, 60);
  b.fillStyle = "#5c3d22"; b.fillRect(0, 1860, 1080, 10);
  b.fillStyle = "#f4f1e6"; b.fillRect(300, 1872, 70, 14); b.fillStyle = "#ffc078"; b.fillRect(420, 1874, 50, 12);
}
// chalk grain: specks punched out of every stroke
const grainC = mk(); {
  const g = grainC.getContext("2d"), r = rng(9);
  for (let i = 0; i < 90000; i++) { g.fillStyle = `rgba(0,0,0,${0.35 + r() * 0.55})`; g.fillRect(Math.floor(r() * 1080), Math.floor(r() * 1920), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); }
}
// everything is drawn on the ink layer; dark fills become board colour (so shapes still hide what is behind them)
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
function glow(c, b) { x.shadowBlur = 0; } // chalk: no glow
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
  // the board itself is drawn under the ink layer; only the dim (lamp off) is drawn here
  if (dim > 0) { x.fillStyle = `rgba(2,1,10,${0.6 * dim})`; x.fillRect(0, 0, 1080, 1920); }
}
// a light bulb, base at (0,0) pointing down; lit 0..1, dot 0..1 (dark lens dot in the middle)
function bulb(X, Y, s, a, c, lit = 0, dot = 0, rot = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  if (lit > 0) { const g = x.createRadialGradient(0, -120, 10, 0, -120, 260); g.addColorStop(0, `rgba(255,216,74,${0.55 * lit})`); g.addColorStop(1, "rgba(255,216,74,0)"); x.fillStyle = g; x.fillRect(-260, -380, 520, 520); }
  glow(c, 28); x.strokeStyle = c; x.lineWidth = 9; x.fillStyle = lit > 0 ? mix("#1c1848", "#fff2b0", lit) : "#1c1848";
  x.beginPath(); x.moveTo(-40, 0); x.bezierCurveTo(-40, -50, -100, -80, -100, -150); x.arc(0, -150, 100, Math.PI, 0); x.bezierCurveTo(100, -80, 40, -50, 40, 0); x.closePath(); x.fill(); x.stroke();
  // screw base
  x.fillStyle = "#2a2660"; rr(-42, 0, 84, 60, 10); x.fill(); x.stroke();
  x.lineWidth = 5; for (let i = 1; i < 4; i++) { x.beginPath(); x.moveTo(-42, i * 15); x.lineTo(42, i * 15 - 6); x.stroke(); }
  noGlow();
  if (dot > 0) {
    x.globalAlpha = a * dot; x.fillStyle = "#03020a"; x.beginPath(); x.arc(0, -150, 22, 0, Math.PI * 2); x.fill();
    x.strokeStyle = RED; x.lineWidth = 4; x.beginPath(); x.arc(0, -150, 30, 0, Math.PI * 2); x.stroke();
  }
  x.restore();
}
// bedside lamp: base at (X,Y), shade on top; bulb shown under the shade
function lamp(X, Y, s, a, c, lit = 0, bulbC = VIOLET, dot = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#1a1540"; x.lineCap = "round";
  x.beginPath(); x.moveTo(0, -250); x.lineTo(0, -20); x.stroke();
  x.beginPath(); x.ellipse(0, 0, 110, 24, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  noGlow();
  // shade back fill, bulb (upright, peeking out of the open top), shade outline
  const shade = () => { x.beginPath(); x.moveTo(-110, -360); x.lineTo(-170, -230); x.lineTo(170, -230); x.lineTo(110, -360); x.closePath(); };
  shade(); x.globalAlpha = a * 0.35; x.fillStyle = "#1a1540"; x.fill(); x.globalAlpha = a;
  if (bulbC) bulb(0, -250, 0.5, 1, bulbC, lit, dot, 0);
  glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; shade(); x.stroke();
  noGlow(); x.restore();
}
function bed(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 24); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#16123a"; x.lineCap = "round";
  rr(-300, -60, 600, 150, 20); x.fill(); x.stroke();
  rr(-320, -230, 40, 330, 14); x.fill(); x.stroke();
  rr(-260, -110, 170, 60, 26); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-60, -60); x.quadraticCurveTo(120, -120, 300, -60); x.stroke();
  noGlow(); x.restore();
}
function nightstand(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 22); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#16123a";
  rr(-120, 0, 240, 200, 14); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-120, 90); x.lineTo(120, 90); x.stroke();
  noGlow(); x.restore();
}
function beamTo(x0, y0, x1, y1, w, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = 0.4 * a; const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  x.fillStyle = gr; x.beginPath(); x.moveTo(x0 + nx * 12, y0 + ny * 12); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 12, y0 - ny * 12); x.closePath(); x.fill();
  x.restore();
}
// shipping box with "ONLINE" label; open 0..1 flaps
function box(X, Y, s, a, c, open = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 24); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#2a1f3a"; x.lineCap = "round";
  rr(-170, -110, 340, 220, 12); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-170, -110); x.lineTo(-170 - 80 * open, -110 - 90 * open); x.moveTo(170, -110); x.lineTo(170 + 80 * open, -110 - 90 * open); x.stroke();
  noGlow(); x.fillStyle = c; x.font = FONT(48); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("ONLINE", 0, 10);
  x.restore();
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
// wall socket + plug; out 0..1 pulls the plug away
function socket(X, Y, s, a, c, out = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 24); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#16123a"; x.lineCap = "round";
  rr(-110, -150, 220, 300, 24); x.fill(); x.stroke();
  x.fillStyle = "#05040f"; x.beginPath(); x.arc(-34, 0, 14, 0, Math.PI * 2); x.arc(34, 0, 14, 0, Math.PI * 2); x.fill();
  const dx = 260 * out;
  x.fillStyle = "#2a2660"; rr(-70 + dx, -60, 140, 120, 22); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(70 + dx, 0); x.quadraticCurveTo(220 + dx, 0, 260 + dx, 200); x.stroke();
  noGlow(); x.restore();
}
function bubble(X, Y, s, a, c, txt) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 9; x.fillStyle = "#14402e";
  rr(-210, -80, 420, 160, 40); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-120, 80); x.lineTo(-160, 140); x.lineTo(-70, 80); x.fill(); x.stroke();
  noGlow(); x.fillStyle = c; x.font = FONT(54); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, 0, 4);
  x.restore();
}

// ---------- one frame ----------
function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  room(id === "s4" ? 0.6 : 0);
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);

  if (id === "s1") {
    // a lamp; the bulb pulses red on "light bulbs"
    const a = sm(-0.05, 0.3, u);
    const P = sm(at("s1", "light") - 0.1, at("s1", "bulbs") + 0.1, u);
    const pulse = P * (0.5 + 0.5 * Math.sin(u * 10));
    lamp(CX, 1500, 1.25, a, VIOLET, 0.6 * (1 - P), P > 0.5 ? RED : VIOLET);
    if (P > 0) { x.save(); x.globalAlpha = 0.35 * pulse; glow(RED, 60); x.strokeStyle = RED; x.lineWidth = 10; x.beginPath(); x.arc(CX, 1095, 150 + 20 * pulse, 0, Math.PI * 2); x.stroke(); x.restore(); }
    tag("RENTAL", CX + 260, 760, VIOLET, sm(0.05, 0.35, u), 40);
  }
  if (id === "s2") {
    // a box marked ONLINE opens, a bulb pops out and screws into a lamp
    const a = sm(-0.05, 0.25, u);
    const O = sm(at("s2", "sold") - 0.2, at("s2", "online"), u);
    box(270, 1300, 1, a, ORANGE, O);
    const fly = sm(at("s2", "and") - 0.1, at("s2", "screw") + 0.1, u);
    const sc = sm(at("s2", "screw"), at("s2", "normal") + 0.2, u);
    lamp(780, 1500, 1, a, VIOLET, 0, null);
    // flies from the box into the empty socket of the lamp (base at 780,1250), then twists in
    const bx = lerp(270, 780, fly), by = lerp(1190, 1250 - 40 * (1 - sc), fly) - Math.sin(fly * Math.PI) * 320;
    if (O > 0.3) bulb(bx, by, 0.5, 1, RED, 0, 0, Math.sin(sc * Math.PI * 6) * 0.12 * (1 - sc));
    tag("HAS A CAMERA", 270, 1500, RED, sm(at("s2", "online") - 0.05, at("s2", "online") + 0.25, u), 38);
    tag("NORMAL LAMP", 780, 1640, VIOLET, sm(at("s2", "normal") - 0.05, at("s2", "lamp") + 0.15, u), 38);
  }
  if (id === "s3") {
    // nightstand lamp beside the bed; a red sight cone falls over the bed on "clear view"
    const a = sm(-0.05, 0.25, u);
    nightstand(220, 1260, 1, a, VIOLET);
    lamp(220, 1260, 0.85, a, VIOLET, 0, RED);
    bed(650, 1350, 0.95, sm(at("s3", "bed") - 0.2, at("s3", "bed") + 0.1, u), VIOLET);
    const V = sm(at("s3", "clear") - 0.15, at("s3", "view") + 0.1, u);
    beamTo(220, 1000, 760, 1330, 260, V, RED);
    tag("CLEAR VIEW", 680, 1080, RED, V, 44);
  }
  if (id === "s4") {
    // room goes dark; big bulb close-up, lamp off; a dark dot appears in the middle
    const a = sm(-0.05, 0.25, u);
    const D = sm(at("s4", "dark") - 0.1, at("s4", "dot") + 0.15, u);
    const Wn = sm(at("s4", "warning") - 0.1, at("s4", "warning") + 0.2, u);
    bulb(CX, 1300, 2.2, a, Wn > 0.5 ? RED : VIOLET, 0, D);
    tag("LAMP OFF", CX, 1480, VIOLET, sm(at("s4", "lamp") - 0.1, at("s4", "off") + 0.1, u) * (1 - Wn), 44);
    tag("WARNING SIGN", CX, 1480, RED, Wn, 44);
    if (D > 0.5) { x.save(); x.globalAlpha = D; x.strokeStyle = RED; x.lineWidth = 6; glow(RED, 20); x.beginPath(); x.moveTo(CX + 70, 970); x.lineTo(CX + 240, 860); x.stroke(); x.restore(); tag("DARK DOT", CX + 260, 820, RED, D, 38); }
  }
  if (id === "s5") {
    // flashlight sweeps over the bulb; a glint appears and stays put while the beam moves
    const a = sm(-0.05, 0.25, u);
    const F = back(at("s5", "flashlight") - 0.15, at("s5", "flashlight") + 0.25, u);
    const sweep = Math.sin(u * 2.4) * 0.18;
    bulb(CX + 80, 1300, 1.8, a, VIOLET, 0, 0.6);
    flashlight(210, 1500, F, u > at("s5", "flashlight") - 0.15 ? 1 : 0, YELLOW, -0.55 + sweep);
    beamTo(270, 1460, CX + 80 + Math.sin(u * 2.4) * 160, 1030, 170, sm(at("s5", "on") - 0.1, at("s5", "on") + 0.2, u), YELLOW);
    const G = sm(at("s5", "glint") - 0.05, at("s5", "glint") + 0.15, u);
    sparkle(CX + 80, 1030, 46 + 10 * Math.sin(u * 14), G, WHITE);
    tag("STAYS PUT", CX + 80, 760, ORANGE, sm(at("s5", "stays") - 0.05, at("s5", "put") + 0.15, u), 44);
  }
  if (id === "s6") {
    // odd bulb -> plug pulled -> message to the host
    const a = sm(-0.05, 0.25, u);
    bulb(250, 980, 1, a, ORANGE, 0, 1);
    tag("ODD?", 250, 1080, ORANGE, sm(at("s6", "odd") - 0.1, at("s6", "odd") + 0.15, u), 40);
    const Uo = sm(at("s6", "unplug") - 0.05, at("s6", "unplug") + 0.3, u);
    socket(720, 940, 0.9, a, GREEN, Uo);
    const H = back(at("s6", "tell") - 0.1, at("s6", "host") + 0.2, u);
    bubble(CX, 1420, H, u > at("s6", "tell") - 0.1 ? 1 : 0, GREEN, "TELL THE HOST");
  }
  if (id === "s7") {
    lamp(CX, 1600, 1.1, 0.75, GREEN, 0, GREEN);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE LIGHT BULBS"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["CAMERA", "BULBS EXIST"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "camera")) * 0.6);
  if (id === "s3") words(["IT SEES", "THE BED"], RED, 360, 0.0, 1, 150, flash(u, at("s3", "clear")) * 0.6);
  if (id === "s4") words(["CHECK WITH", "THE LAMP OFF"], GREEN, 300, 0.0, 1, 150, flash(u, at("s4", "off")) * 0.6);
  if (id === "s5") words(["SHINE A", "FLASHLIGHT"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") words(["UNPLUG IT"], GREEN, 330, 0.0, 1, 160, flash(u, at("s6", "unplug")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["LAMP OFF."], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["LOOK CLOSER."], ORANGE, 880, at("s7", "look") - 0.05, 1, 130, flash(u, at("s7", "closer")));
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
function frame(t) {
  drawInk(t);
  // chalk grain
  ink.setTransform(1, 0, 0, 1, 0, 0);
  ink.save(); ink.globalCompositeOperation = "destination-out"; ink.drawImage(grainC, 0, 0); ink.restore();
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.drawImage(boardC, 0, 0);
  out.drawImage(inkC, 0, 0);
  // eraser wipe at the start of every line: a felt eraser sweeps across and leaves a pale smear
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
window.__hf.buildReady["light-bulb-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
