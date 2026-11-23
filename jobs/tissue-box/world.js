// tissue-box (Hidden Cam 27) - PIXEL ART style (kit from peephole / style-kits/style-pixel-art.js): the scene is drawn
// on a 180x320 canvas, snapped to a 16-colour palette with 4x4 ordered dithering and scaled up nearest-neighbour; text
// is drawn at 360x640 the same way. Everything steps at 10 fps.
// A hotel room from the front: bed on the left, a desk on the right with a tissue box facing the bed.
// Wrong: a camera sits inside the box, the lens in a small hole in its side. Right: pick it up, look at every side,
// look for a hole / a wire / a box too heavy, torch on it and watch for a glint. Time only from hf-seek.
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
const SW = 180, SH = 320, TW = 360, TH = 640;
const lo = document.createElement("canvas"); lo.width = SW; lo.height = SH;
const tx = document.createElement("canvas"); tx.width = TW; tx.height = TH;
const sc = lo.getContext("2d", { willReadFrequently: true }), tc = tx.getContext("2d", { willReadFrequently: true });
let x = sc;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const PAL = ["#0b0820", "#1e1a4a", "#2f2a6e", "#4b3fa8", "#a596ff", "#ffffff", "#ff2a3a", "#8a1020", "#3dff8a", "#137a3d", "#ff6a1a", "#ffd84a", "#2a3a7a", "#6b7280", "#000000", "#c9c3ff"]
  .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function nearest(r, g, b) { let bi = 0, bd = 1e9; for (let i = 0; i < PAL.length; i++) { const p = PAL[i], d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11; if (d < bd) { bd = d; bi = i; } } return PAL[bi]; }
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
function onText(fn) { const prev = x; x = tc; x.save(); x.setTransform(TW / 1080, 0, 0, TH / 1920, 0, 0); fn(); x.restore(); x = prev; }
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
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
let zoomM = [1, 0, 0, 1, 0, 0];
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
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

// ---------- the room ----------
const FLOOR = 1180;
const BX = 720, BY = 885;               // tissue box centre (front view 240 x 130), sits on the desk top at 950
const HOLE = [BX - 70, BY + 18];        // lens hole in the box's front face (the face toward the bed)
const BED = [250, 1040];
function bg(dim = 0) {
  const gr = x.createRadialGradient(CX, 860, 80, CX, 860, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  if (dim > 0) { x.fillStyle = `rgba(2,1,10,${0.72 * dim})`; x.fillRect(0, 0, 1080, 1920); }
}
function floorLine(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.7; x.strokeStyle = VIOLET; x.lineWidth = 10;
  x.beginPath(); x.moveTo(40, FLOOR); x.lineTo(1000, FLOOR); x.stroke(); x.restore();
}
function bed(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 12; x.lineJoin = "round"; x.fillStyle = "#1e1a4a";
  rr(60, 820, 40, 360, 12); x.fill(); x.stroke();               // headboard
  rr(100, 1000, 330, 90, 22); x.fill(); x.stroke();              // mattress
  x.beginPath(); x.moveTo(110, 1090); x.lineTo(110, FLOOR); x.moveTo(420, 1090); x.lineTo(420, FLOOR); x.stroke();
  x.fillStyle = "#c9c3ff"; x.beginPath(); x.ellipse(170, 978, 56, 24, -0.1, 0, Math.PI * 2); x.fill(); // pillow
  x.restore();
}
function desk(a, c = VIOLET) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 12; x.fillStyle = "#2f2a6e";
  x.fillRect(540, 950, 400, 34); x.strokeRect(540, 950, 400, 34);
  x.beginPath(); x.moveTo(570, 984); x.lineTo(570, FLOOR); x.moveTo(910, 984); x.lineTo(910, FLOOR); x.stroke();
  x.restore();
}
// tissue box: front view; ang = spin (0 = front toward bed). cam = x-ray camera, hole = highlight 0..1, wire = cord 0..1
function tissueBox(X, Y, s, a, c = VIOLET, o = {}) {
  if (a <= 0) return;
  const { ang = 0, cam = 0, hole = 0, wire = 0, holeC = RED } = o;
  const sx = Math.cos(ang), front = sx >= 0, side = Math.abs(Math.sin(ang));
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  // tissue puff on top (does not squash)
  x.fillStyle = WHITE; x.beginPath();
  x.moveTo(-50, -62); x.quadraticCurveTo(-40, -130, 0, -110); x.quadraticCurveTo(30, -150, 52, -62); x.closePath(); x.fill();
  x.save(); x.scale(Math.max(0.12, Math.abs(sx) * 0.8 + 0.2 * side), 1);
  x.strokeStyle = c; x.lineWidth = 12; x.lineJoin = "round"; x.fillStyle = "#4b3fa8";
  rr(-120, -65, 240, 130, 10); x.fill(); x.stroke();
  // printed band so it reads as a tissue box
  x.fillStyle = "#1e1a4a"; x.fillRect(-120, -10, 240, 26);
  x.fillStyle = "#c9c3ff"; x.beginPath(); x.ellipse(70, 3, 26, 10, 0, 0, Math.PI * 2); x.fill();
  if (front) {
    // the hole on the front face
    const hx = HOLE[0] - BX, hy = HOLE[1] - BY;
    x.fillStyle = "#000000"; x.beginPath(); x.arc(hx, hy, 13, 0, Math.PI * 2); x.fill();
    if (hole > 0) { x.globalAlpha = a * hole; x.strokeStyle = holeC; x.lineWidth = 9; x.beginPath(); x.arc(hx, hy, 32, 0, Math.PI * 2); x.stroke(); x.globalAlpha = a; }
    if (cam > 0) {
      x.globalAlpha = a * cam; x.strokeStyle = RED; x.lineWidth = 9; x.fillStyle = "#8a1020";
      rr(hx - 10, hy - 34, 120, 62, 10); x.fill(); x.stroke();           // camera module behind the hole
      x.beginPath(); x.moveTo(hx + 110, hy); x.lineTo(hx + 150, hy + 30); x.stroke(); // its cable inside the box
      x.globalAlpha = a;
    }
  }
  x.restore();
  if (wire > 0) {
    x.save(); x.globalAlpha = a * wire; x.strokeStyle = RED; x.lineWidth = 10; x.lineCap = "round";
    x.beginPath(); x.moveTo(110, 50); x.quadraticCurveTo(170, 120, lerp(110, 210, wire), lerp(50, 150, wire)); x.stroke();
    x.fillStyle = RED; x.fillRect(lerp(110, 210, wire) - 14, lerp(50, 150, wire) - 6, 28, 30);
    x.restore();
  }
  x.restore();
}
function sightCone(a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.3; x.fillStyle = color;
  x.beginPath(); x.moveTo(HOLE[0], HOLE[1]); x.lineTo(BED[0] - 170, BED[1] - 100); x.lineTo(BED[0] + 60, BED[1] + 70); x.closePath(); x.fill();
  x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 10; x.setLineDash([30, 24]);
  x.beginPath(); x.moveTo(HOLE[0], HOLE[1]); x.lineTo(BED[0] - 20, BED[1] - 10); x.stroke();
  x.restore();
}
// a hand from below holding the box at (X, Y)
function hand(X, Y, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = "#c9c3ff"; x.strokeStyle = VIOLET; x.lineWidth = 10;
  rr(X - 70, Y + 60, 140, 70, 26); x.fill(); x.stroke();           // palm under the box
  rr(X - 50, Y + 120, 100, 200, 30); x.fill(); x.stroke();          // wrist / forearm going down
  rr(X + 62, Y + 20, 34, 80, 16); x.fill(); x.stroke();             // thumb at the side
  x.restore();
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
function torch(a, beam, tx0, ty0, toX, toY) {
  if (a <= 0) return;
  const h = Math.atan2(toY - ty0, toX - tx0), L = Math.hypot(toX - tx0, toY - ty0);
  x.save(); x.globalAlpha = a; x.translate(tx0, ty0); x.rotate(h);
  if (beam > 0) {
    x.save(); x.globalAlpha = a * beam * 0.45; x.fillStyle = YELLOW;
    x.beginPath(); x.moveTo(20, 0); x.lineTo(L + 40, -90); x.lineTo(L + 40, 90); x.closePath(); x.fill(); x.restore();
  }
  x.rotate(Math.PI / 2); x.strokeStyle = VIOLET; x.lineWidth = 10; x.fillStyle = "#1e1a4a";
  rr(-45, -10, 90, 170, 16); x.fill(); x.stroke();
  x.fillStyle = YELLOW; x.beginPath(); x.arc(0, 16, 12, 0, Math.PI * 2); x.fill();
  x.restore();
}
function glint(a, X, Y) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = WHITE; x.lineWidth = 10; x.lineCap = "round";
  const r = 60 * a;
  for (let i = 0; i < 4; i++) { const h = i * Math.PI / 4; x.beginPath(); x.moveTo(X - Math.cos(h) * r, Y - Math.sin(h) * r); x.lineTo(X + Math.cos(h) * r, Y + Math.sin(h) * r); x.stroke(); }
  x.fillStyle = WHITE; x.beginPath(); x.arc(X, Y, 14, 0, Math.PI * 2); x.fill();
  x.restore();
}
// down arrow = "too heavy"
function heavyArrow(X, Y, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = ORANGE; x.fillStyle = ORANGE; x.lineWidth = 14; x.lineCap = "round";
  x.beginPath(); x.moveTo(X, Y - 70); x.lineTo(X, Y + 30); x.stroke();
  x.beginPath(); x.moveTo(X - 40, Y + 20); x.lineTo(X, Y + 70); x.lineTo(X + 40, Y + 20); x.closePath(); x.fill();
  x.restore();
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
  let z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut, fx = CX, fy = 900;
  // close-ups keep the box between y 600 and 1150 on screen (title above, captions below)
  if (id === "s3") { z = lerp(1.3, 1.7, sm(0, d, u)); fx = HOLE[0] + 40; fy = BY - 10; }
  if (id === "s4" || id === "s5") { z = lerp(1.25, 1.35, sm(0, d, u)); fx = BX - 40; fy = BY - 40; }
  if (id === "s6") { z = 1.2; fx = BX - 20; fy = BY; }
  const dark = id === "s6" ? sm(-0.05, 0.25, u) : 0;
  bg(dark);
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-fx, -fy);
  zoomM = [z, 0, 0, z, CX - z * fx, 900 - z * fy];

  if (id === "s1") {
    const a = sm(-0.05, 0.3, u);
    floorLine(a); bed(a); desk(a);
    const B = back(at("s1", "tissue") - 0.1, at("s1", "box") + 0.2, u);
    tissueBox(BX, BY + (1 - B) * -200, 1, u > at("s1", "tissue") - 0.1 ? 1 : 0, VIOLET);
    sightCone(sm(at("s1", "facing") - 0.05, at("s1", "bed") + 0.1, u), RED);
    tag("TISSUE BOX", BX, 690, VIOLET, sm(at("s1", "box") - 0.05, at("s1", "box") + 0.2, u), 40);
  }
  if (id === "s2") {
    floorLine(1); bed(1); desk(1);
    const cam = sm(at("s2", "cameras") - 0.1, at("s2", "cameras") + 0.25, u);
    tissueBox(BX, BY, 1, 1, VIOLET, { cam, hole: cam });
    sightCone(0.7, RED);
    tag("CAMERA INSIDE", BX, 690, RED, sm(at("s2", "built") - 0.1, at("s2", "into") + 0.15, u), 40);
  }
  if (id === "s3") {
    floorLine(1); bed(1); desk(1);
    const H = sm(at("s3", "small") - 0.1, at("s3", "hole") + 0.1, u);
    const pulse = 0.6 + 0.4 * Math.sin(u * 10);
    tissueBox(BX, BY, 1, 1, VIOLET, { cam: 1 - sm(at("s3", "lens") + 0.2, at("s3", "hides") + 0.2, u), hole: Math.max(H * pulse, sm(at("s3", "lens") - 0.1, at("s3", "lens") + 0.1, u)) });
    tag("LENS", HOLE[0], HOLE[1] - 120, RED, sm(at("s3", "lens") - 0.1, at("s3", "lens") + 0.15, u), 26);
    tag("SMALL HOLE", HOLE[0] + 40, HOLE[1] + 100, RED, sm(at("s3", "side") - 0.1, at("s3", "side") + 0.15, u), 24);
  }
  if (id === "s4") {
    // a hand lifts the box and turns it: front, side, back, side, front
    floorLine(1); desk(1);
    const L = sm(at("s4", "pick") - 0.1, at("s4", "up") + 0.15, u);
    const Sp = sm(at("s4", "look") - 0.1, at("s4", "side") + 0.25, u);
    const Y = BY - 150 * L;
    hand(BX, Y, sm(at("s4", "pick") - 0.25, at("s4", "pick"), u));
    tissueBox(BX, Y, 1, 1, Sp > 0.02 ? GREEN : VIOLET, { ang: Sp * Math.PI * 2, hole: Sp > 0.95 ? 1 : 0, holeC: GREEN });
    tag("PICK IT UP", BX - 290, 760, GREEN, sm(at("s4", "pick") - 0.05, at("s4", "up") + 0.1, u), 30);
    tag("EVERY SIDE", BX - 290, 900, GREEN, sm(at("s4", "every") - 0.1, at("s4", "every") + 0.15, u), 30);
  }
  if (id === "s5") {
    // held box, checklist lands on hole, wire, heavy
    floorLine(1); desk(1);
    const Hv = sm(at("s5", "heavy") - 0.1, at("s5", "heavy") + 0.2, u);
    const Y = BY - 150 + 40 * Hv;
    hand(BX, Y, 1);
    const Ho = sm(at("s5", "hole") - 0.1, at("s5", "hole") + 0.15, u);
    const Wi = sm(at("s5", "wire") - 0.1, at("s5", "wire") + 0.25, u);
    tissueBox(BX, Y, 1, 1, GREEN, { hole: Ho, holeC: GREEN, wire: Wi });
    tag("HOLE?", HOLE[0] - 70, Y - 150, GREEN, Ho, 28);
    tag("WIRE?", BX + 190, Y - 150, GREEN, Wi, 28);
    heavyArrow(BX - 250, Y + 120, Hv);
    tag("TOO HEAVY?", BX - 250, Y - 60, ORANGE, Hv, 28);
  }
  if (id === "s6") {
    // dark room, torch from the right lands on the box, the hole flashes a glint
    floorLine(1); bed(1); desk(1);
    tissueBox(BX, BY, 1, 1, VIOLET);
    const Tn = sm(at("s6", "shine") - 0.15, at("s6", "torch"), u);
    const Bm = sm(at("s6", "torch") - 0.05, at("s6", "on") + 0.1, u);
    torch(Tn, Bm, 930, 640, HOLE[0], HOLE[1]);
    const G = sm(at("s6", "glint") - 0.15, at("s6", "glint") + 0.1, u);
    glint(G, HOLE[0], HOLE[1]);
    tag("GLINT = LENS", BX - 60, 1080, GREEN, G, 32);
    stamp("v", BX + 170, 1050, 0.5 * back(at("s6", "glint"), at("s6", "glint") + 0.3, u), u > at("s6", "glint") ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    floorLine(0.6); bed(0.7); desk(0.7); tissueBox(BX, BY, 1, 0.8, GREEN);
  }
  x.restore();
  zoomM = [1, 0, 0, 1, 0, 0];

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE TISSUE BOX"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "ignore"))));
  if (id === "s2") words(["CAMERAS", "HIDE INSIDE"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "tissue")) * 0.6);
  if (id === "s3") words(["A SMALL HOLE", "IN THE SIDE"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "hole")) * 0.6);
  if (id === "s4") words(["PICK IT UP.", "CHECK EVERY SIDE"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "every")) * 0.6);
  if (id === "s5") words(["HOLE? WIRE?", "TOO HEAVY?"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "heavy")) * 0.6);
  if (id === "s6") words(["TORCH ON IT.", "WATCH FOR A GLINT"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "glint")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CHECK THE BOX."], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["LOOK AT EVERY SIDE"], ORANGE, 880, at("s7", "look") - 0.05, 1, 130, flash(u, at("s7", "side")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
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
window.__hf.buildReady["tissue-box-pixel"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
