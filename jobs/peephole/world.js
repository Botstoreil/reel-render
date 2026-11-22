// peephole: PIXEL ART style (style test 22.11, style 5). The scene is drawn on a 180x320 canvas, snapped to a 16-colour
// palette with 4x4 ordered dithering and scaled up nearest-neighbour; text is drawn at 360x640 (chunky pixels) the
// same way. Everything steps at 10 fps. Time only from hf-seek.
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
const out = cv.getContext("2d");
const SW = 180, SH = 320, TW = 360, TH = 640; // scene res (1/6) and text res (1/3)
const lo = document.createElement("canvas"); lo.width = SW; lo.height = SH;
const tx = document.createElement("canvas"); tx.width = TW; tx.height = TH;
const sc = lo.getContext("2d", { willReadFrequently: true }), tc = tx.getContext("2d", { willReadFrequently: true });
let x = sc; // current drawing context (scene by default, text canvas inside words/tag/ttext)
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const PAL = ["#0b0820", "#1e1a4a", "#2f2a6e", "#4b3fa8", "#a596ff", "#ffffff", "#ff2a3a", "#8a1020", "#3dff8a", "#137a3d", "#ff6a1a", "#ffd84a", "#2a3a7a", "#6b7280", "#000000", "#c9c3ff"]
  .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function nearest(r, g, b) { let bi = 0, bd = 1e9; for (let i = 0; i < PAL.length; i++) { const p = PAL[i], d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11; if (d < bd) { bd = d; bi = i; } } return PAL[bi]; }
// snap a canvas to the palette; text = hard alpha (no soft edges), scene = ordered dither
function quantize(ctx, w, h, text) {
  const im = ctx.getImageData(0, 0, w, h), D = im.data;
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
    const i = (y * w + X) * 4;
    if (text) { if (D[i + 3] < 120) { D[i + 3] = 0; continue; } const a = D[i + 3] / 255; D[i] /= a; D[i + 1] /= a; D[i + 2] /= a; D[i + 3] = 255; }
    const o = text ? 0 : (BAYER[(y & 3) * 4 + (X & 3)] - 7.5) * 4;
    const p = nearest(D[i] + o, D[i + 1] + o, D[i + 2] + o);
    D[i] = p[0]; D[i + 1] = p[1]; D[i + 2] = p[2];
  }
  ctx.putImageData(im, 0, 0);
}
// text drawn on the chunky text canvas at full-frame coordinates
function onText(fn) { const prev = x; x = tc; x.save(); x.setTransform(TW / 1080, 0, 0, TH / 1920, 0, 0); fn(); x.restore(); x = prev; }
function ttext(txt, X, Y, px, color, a) {
  if (a <= 0) return;
  onText(() => { x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#000000"; x.fillText(txt, X + 6, Y + 6); x.fillStyle = color; x.fillText(txt, X, Y); });
}

function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function glow(c, b) { x.shadowBlur = 0; } // pixel art: no soft glow
function noGlow() { x.shadowBlur = 0; }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  onText(() => {
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (840 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.05, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width + px * 0.22;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.32, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.12, curU);
      const s = 0.4 + 0.6 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = "#000000"; x.fillText(p, 9, 9);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
      x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
  });
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  // tags live on the text canvas in full-frame coordinates; map from the zoomed scene space
  const P = new DOMMatrix(zoomM).transformPoint(new DOMPoint(X, Y));
  onText(() => {
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * a;
  x.translate(P.x, P.y); x.scale(s, s);
  x.fillStyle = "#0b0820"; x.fillRect(-w / 2, -px * 0.75, w, px * 1.5);
  x.lineWidth = 9; x.strokeStyle = color; x.strokeRect(-w / 2, -px * 0.75, w, px * 1.5);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
  });
}
let zoomM = [1, 0, 0, 1, 0, 0]; // the scene zoom, so tags drawn in scene code land in the right place

// ---------- props ----------
function room(dim = 0) {
  const gr = x.createRadialGradient(CX, 820, 80, CX, 820, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  x.save(); x.globalAlpha = 0.12; x.strokeStyle = VIOLET; x.lineWidth = 2;
  for (let X = 60; X < 1100; X += 240) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, 1920); x.stroke(); }
  x.restore();
  if (dim > 0) { x.fillStyle = `rgba(2,1,10,${0.6 * dim})`; x.fillRect(0, 0, 1080, 1920); }
}
// hotel door seen from inside; peephole at (X, Y+hy). note = 0..1 sticky note on it
function door(X, Y, s, a, c, note = 0, ph = VIOLET) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 28); x.strokeStyle = c; x.lineWidth = 11; x.fillStyle = "#15123c"; x.lineCap = "round";
  rr(-230, -480, 460, 960, 18); x.fill(); x.stroke();
  rr(-170, -400, 340, 300, 12); x.stroke(); rr(-170, -40, 340, 440, 12); x.stroke();
  // handle
  x.fillStyle = c; rr(140, 30, 70, 22, 11); x.fill();
  noGlow();
  peep(0, -250, 1, ph);
  if (note > 0) stickyNote(0, -250, note);
  x.restore();
}
function peep(X, Y, s, c) {
  x.save(); x.translate(X, Y); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 8;
  x.fillStyle = "#2a2660"; x.beginPath(); x.arc(0, 0, 34, 0, Math.PI * 2); x.fill(); x.stroke();
  x.fillStyle = "#05040f"; x.beginPath(); x.arc(0, 0, 16, 0, Math.PI * 2); x.fill();
  x.fillStyle = WHITE; x.globalAlpha *= 0.8; x.beginPath(); x.arc(-6, -6, 4, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
// yellow sticky note sliding in from upper right, k = 0..1
function stickyNote(X, Y, k) {
  const e = back(0, 1, k);
  x.save(); x.translate(lerp(X + 260, X, e), lerp(Y - 260, Y, e)); x.rotate(lerp(0.6, -0.06, e));
  glow(YELLOW, 30); x.fillStyle = YELLOW; x.fillRect(-70, -70, 140, 140); noGlow();
  x.fillStyle = "rgba(0,0,0,0.12)"; x.fillRect(-70, -70, 140, 30);
  x.restore();
}
// someone in the hallway: a simple head + shoulders silhouette
function person(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#1a1540";
  x.beginPath(); x.arc(0, -150, 80, 0, Math.PI * 2); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-170, 160); x.quadraticCurveTo(-170, -50, 0, -50); x.quadraticCurveTo(170, -50, 170, 160); x.closePath(); x.fill(); x.stroke();
  noGlow(); x.restore();
}
// reverse peephole viewer: a small tube held up to the door
function viewer(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 9; x.fillStyle = "#24205a";
  rr(-110, -36, 160, 72, 22); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(50, 0, 18, 36, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  x.fillStyle = c; x.beginPath(); x.ellipse(50, 0, 8, 18, 0, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
function beamTo(x0, y0, x1, y1, w, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = 0.4 * a; const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  x.fillStyle = gr; x.beginPath(); x.moveTo(x0 + nx * 12, y0 + ny * 12); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 12, y0 - ny * 12); x.closePath(); x.fill();
  x.restore();
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
// round "view through the peephole" lens: clear = sharp hallway, else blurry/dark
function fisheye(X, Y, R, a, clear, dark) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.beginPath(); x.arc(X, Y, R, 0, Math.PI * 2); x.clip();
  x.fillStyle = mix("#2a3a7a", "#05040f", dark); x.fillRect(X - R, Y - R, 2 * R, 2 * R);
  x.filter = clear < 1 ? `blur(${((1 - clear) * 2.5).toFixed(2)}px)` : "none";
  // hallway: floor + far door + light
  x.strokeStyle = mix("#a596ff", "#2a2660", dark); x.lineWidth = 8;
  x.beginPath(); x.moveTo(X - R, Y + R * 0.6); x.lineTo(X - R * 0.25, Y + R * 0.1); x.lineTo(X + R * 0.25, Y + R * 0.1); x.lineTo(X + R, Y + R * 0.6); x.stroke();
  x.fillStyle = mix("#3a3f9a", "#0a0820", dark); x.fillRect(X - R * 0.16, Y - R * 0.4, R * 0.32, R * 0.5);
  x.fillStyle = mix("#ffd84a", "#1a1640", dark); x.beginPath(); x.arc(X, Y - R * 0.65, R * 0.08, 0, Math.PI * 2); x.fill();
  x.filter = "none";
  const v = x.createRadialGradient(X, Y, R * 0.5, X, Y, R); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.8)"); x.fillStyle = v; x.fillRect(X - R, Y - R, 2 * R, 2 * R);
  x.restore();
  x.save(); x.globalAlpha = a; glow(VIOLET, 30); x.strokeStyle = VIOLET; x.lineWidth = 14; x.beginPath(); x.arc(X, Y, R, 0, Math.PI * 2); x.stroke(); x.restore();
}
function bell(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#1d1850";
  x.beginPath(); x.arc(0, 0, 90, Math.PI, 0); x.closePath(); x.fill(); x.stroke();
  rr(-120, 0, 240, 26, 10); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(0, -90); x.lineTo(0, -120); x.stroke(); x.fillStyle = c; x.beginPath(); x.arc(0, -126, 14, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
function keycard(X, Y, s, a, c, rot = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(rot); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 9; x.fillStyle = "#14402e";
  rr(-120, -75, 240, 150, 18); x.fill(); x.stroke();
  x.fillStyle = c; x.fillRect(-120, -40, 240, 26);
  const p = x.getTransform().transformPoint(new DOMPoint(0, 34));
  noGlow(); x.restore();
  ttext("NEW ROOM", p.x * (1080 / SW), p.y * (1920 / SH), 44 * s, c, a);
}

// ---------- one frame ----------
function frame(t0) {
  const t = Math.floor(t0 * 10 + 1e-6) / 10; // 10 fps steps
  const { id, u, d } = sceneOf(t);
  curU = u;
  x = sc;
  tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, TW, TH);
  x.setTransform(SW / 1080, 0, 0, SH / 1920, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  room(id === "s4" ? sm(at("s4", "blurry") - 0.1, at("s4", "dark") + 0.1, u) * 0.6 : 0);
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);
  zoomM = [z, 0, 0, z, CX - CX * z, 820 - 820 * z];

  if (id === "s1") {
    // the door; the peephole pulses red on "uncovered"
    const a = sm(-0.05, 0.3, u);
    const P = sm(at("s1", "peephole") - 0.1, at("s1", "peephole") + 0.15, u);
    door(CX, 1100, 0.95, a, P > 0.5 ? RED : VIOLET, 0, P > 0.5 ? RED : VIOLET);
    tag("NO COVER", CX + 230, 760, RED, sm(at("s1", "uncovered") - 0.05, at("s1", "uncovered") + 0.2, u), 40);
  }
  if (id === "s2") {
    // split: hallway side, a person holds a viewer up; a red sight line goes into the room
    const a = sm(-0.05, 0.25, u);
    x.save(); x.globalAlpha = a; glow(VIOLET, 18); x.strokeStyle = VIOLET; x.lineWidth = 14; x.beginPath(); x.moveTo(CX + 40, 560); x.lineTo(CX + 40, 1400); x.stroke(); x.restore();
    peep(CX + 40, 860, 1.3, RED);
    tag("OUTSIDE", 260, 560, VIOLET, a, 38); tag("YOUR ROOM", 820, 560, VIOLET, a, 38);
    const Pp = sm(at("s2", "someone") - 0.25, at("s2", "someone"), u);
    person(lerp(-120, 220, Pp), 1080, 1, Pp, VIOLET);
    const V = back(at("s2", "reversed") - 0.05, at("s2", "viewer") + 0.1, u);
    viewer(lerp(150, CX - 60, sm(at("s2", "viewer") - 0.1, at("s2", "can"), u)), 860, V, u > at("s2", "reversed") - 0.05 ? 1 : 0, RED);
    const L = sm(at("s2", "look") - 0.15, at("s2", "in") + 0.1, u);
    beamTo(CX + 60, 860, 1000, 1180, 260, L, RED);
    tag("THEY SEE IN", 780, 1430, RED, L, 42);
  }
  if (id === "s3") {
    // a row of doors, every peephole bare
    const a = sm(-0.05, 0.25, u);
    const NC = sm(at("s3", "cover") - 0.1, at("s3", "cover") + 0.2, u);
    [210, CX, 810].forEach((X, i) => {
      const k = back(at("s3", "peephole") - 0.15 + i * 0.12, at("s3", "peephole") + 0.2 + i * 0.12, u);
      door(X, 1040, 0.55 * Math.max(0.001, k), k > 0 ? a : 0, NC > 0.5 ? RED : VIOLET, 0, NC > 0.5 ? RED : VIOLET);
      stamp("x", X, 1500, back(at("s3", "cover") - 0.05 + i * 0.08, at("s3", "cover") + 0.25 + i * 0.08, u) * 0.5, u > at("s3", "cover") - 0.05 + i * 0.08 ? 1 : 0, RED);
    });
  }
  if (id === "s4") {
    // view through the peephole: clear hallway first, then it turns blurry and dark
    const a = sm(-0.05, 0.25, u);
    const B = sm(at("s4", "blurry") - 0.1, at("s4", "blurry") + 0.25, u), Dk = sm(at("s4", "dark") - 0.1, at("s4", "dark") + 0.25, u);
    fisheye(CX, 880, 360, a, 1 - B, Dk * 0.85);
    tag("CLEAR", CX, 1430, GREEN, sm(0.2, 0.5, u) * (1 - B), 44);
    tag("BLURRY OR DARK?", CX, 1430, ORANGE, B, 44);
  }
  if (id === "s5") {
    // sticky note slaps over the peephole
    const a = sm(-0.05, 0.25, u);
    const N = sm(at("s5", "sticky") - 0.2, at("s5", "note") + 0.05, u);
    door(CX, 1100, 0.95, a, N > 0.95 ? GREEN : VIOLET, N, VIOLET);
    // tape option: a strip that lands on "tape"
    const Tp = back(at("s5", "tape") - 0.1, at("s5", "tape") + 0.25, u);
    if (u > at("s5", "tape") - 0.1) { x.save(); x.translate(CX + 270, 1240); x.rotate(-0.25); x.scale(Tp, Tp); glow(WHITE, 20); x.fillStyle = "rgba(240,240,255,0.85)"; x.fillRect(-110, -30, 220, 60); x.restore(); }
    tag("OR TAPE", CX + 270, 1340, GREEN, sm(at("s5", "tape") - 0.05, at("s5", "tape") + 0.2, u), 38);
  }
  if (id === "s6") {
    // tampered peephole (scratched, crooked) -> front desk bell -> new keycard
    const a = sm(-0.05, 0.25, u);
    const T = sm(at("s6", "tampered") - 0.1, at("s6", "tampered") + 0.2, u);
    x.save(); x.globalAlpha = a; x.translate(300, 760); x.rotate(0.25 * T); peep(0, 0, 2.2, T > 0.5 ? ORANGE : VIOLET);
    x.strokeStyle = ORANGE; x.lineWidth = 6; x.globalAlpha = a * T; x.beginPath(); x.moveTo(-90, -70); x.lineTo(-40, -20); x.moveTo(60, 50); x.lineTo(100, 100); x.moveTo(70, -80); x.lineTo(40, -40); x.stroke(); x.restore();
    tag("TAMPERED?", 300, 960, ORANGE, T, 40);
    const Bl = back(at("s6", "front") - 0.1, at("s6", "desk") + 0.2, u);
    bell(780, 820, Bl, u > at("s6", "front") - 0.1 ? 1 : 0, GREEN);
    const ding = flash(u, at("s6", "desk") + 0.05);
    if (ding > 0) { x.save(); x.globalAlpha = ding; x.strokeStyle = GREEN; x.lineWidth = 6; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(780, 690, 40 + i * 30, Math.PI * 1.2, Math.PI * 1.8); x.stroke(); } x.restore(); }
    const K = back(at("s6", "another") - 0.1, at("s6", "room") + 0.2, u);
    keycard(CX, 1450, K * 1.2, u > at("s6", "another") - 0.1 ? 1 : 0, GREEN, -0.08);
  }
  if (id === "s7") {
    door(CX, 1150, 0.9, 0.8, GREEN, 1, VIOLET);
  }
  x.restore();
  zoomM = [1, 0, 0, 1, 0, 0];

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER LEAVE", "THE PEEPHOLE OPEN"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["IT CAN BE", "REVERSED"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "reversed")) * 0.6);
  if (id === "s3") words(["MOST HAVE", "NO COVER"], RED, 360, 0.0, 1, 150, flash(u, at("s3", "cover")) * 0.6);
  if (id === "s4") words(["LOOK FROM", "INSIDE"], GREEN, 300, 0.0, 1, 150, flash(u, at("s4", "inside")) * 0.6);
  if (id === "s5") words(["COVER IT"], GREEN, 340, 0.0, 1, 160, flash(u, at("s5", "note")) * 0.6);
  if (id === "s6") words(["ASK FOR", "ANOTHER ROOM"], GREEN, 330, 0.0, 1, 140, flash(u, at("s6", "another")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["TWO SECONDS"], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["ONE STICKY NOTE"], ORANGE, 880, at("s7", "one") - 0.05, 1, 130, flash(u, at("s7", "note")));
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
  // snap both layers to the palette and scale up with hard pixels
  quantize(sc, SW, SH, false);
  quantize(tc, TW, TH, true);
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.imageSmoothingEnabled = false;
  out.clearRect(0, 0, 1080, 1920);
  out.drawImage(lo, 0, 0, 1080, 1920);
  out.drawImage(tx, 0, 0, 1080, 1920);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["peephole-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
