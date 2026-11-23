// rush-transitions (YogaFlow 26) - PIXEL ART style (kit from exit-cue, YogaFlow 21). The scene is drawn on a 180x320 canvas, snapped to a
// 16-colour palette with 4x4 ordered dithering and scaled up nearest-neighbour; text is drawn at 360x640 (chunky
// pixels) the same way. Everything steps at 10 fps; people have a 2-frame idle (breathing bob). Time only from hf-seek.
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

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", YELLOW = "#ffd84a", BG = "#0b0820";
const CX = 510, ZY = 900;
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
let zoomM = [1, 0, 0, 1, 0, 0];
const toScreen = (X, Y) => new DOMMatrix(zoomM).transformPoint(new DOMPoint(X, Y));

let curU = 0, IDLE = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  onText(() => {
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
// pixel label box, given in scene space (follows the zoom), clamped into the safe area
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  a = cl(a);
  const P = toScreen(X, Y);
  onText(() => {
    x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
    const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * a;
    const PX = Math.max(60 + w / 2, Math.min(930 - w / 2, P.x));
    x.translate(PX, P.y); x.scale(s, s);
    x.fillStyle = "#000000"; x.fillRect(-w / 2 + 9, -px * 0.75 + 9, w, px * 1.5);
    x.fillStyle = "#0b0820"; x.fillRect(-w / 2, -px * 0.75, w, px * 1.5);
    x.lineWidth = 9; x.strokeStyle = color; x.strokeRect(-w / 2, -px * 0.75, w, px * 1.5);
    x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
  });
}
// RPG-style speech box with a stepped tail toward (tX, tY)
function bubble(txt, X, Y, color, a, tX, tY, px = 52) {
  if (a <= 0) return;
  a = cl(a);
  const P = toScreen(X, Y), T = toScreen(tX, tY);
  onText(() => {
    x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
    const w = x.measureText(txt).width + 70, h = px * 1.8, s = back(0, 1, a);
    const PX = Math.max(60 + w / 2, Math.min(930 - w / 2, P.x));
    x.translate(PX, P.y); x.scale(s, s);
    const dx = (T.x - PX) * 0.3, dy = (T.y - P.y) * 0.3;
    x.fillStyle = "#14113a"; x.strokeStyle = color; x.lineWidth = 9;
    x.fillRect(-w / 2, -h / 2, w, h); x.strokeRect(-w / 2, -h / 2, w, h);
    x.fillStyle = color; for (let i = 1; i <= 3; i++) x.fillRect(dx * i / 3 - 12, h / 2 + dy * (i - 1) / 3, 24, 24);
    x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
  });
}

// ---------- pictogram people: joints in px, y up = negative, origin on the floor ----------
const P = {
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] },
  lunge: { head: [0, -400], sh: [0, -330], hip: [0, -170], kL: [-110, -110], fL: [-130, 0], kR: [90, -70], fR: [190, 0], eL: [-30, -450], hL: [-20, -560], eR: [30, -450], hR: [20, -560] },
  drop: { head: [-110, -250], sh: [-70, -220], hip: [0, -110], kL: [-60, -18], fL: [80, -8], kR: [-20, -18], fR: [120, -8], eL: [-110, -130], hL: [-140, -30], eR: [-60, -130], hR: [-90, -30] },
};
P.lungeLow = Object.assign({}, P.lunge, { eL: [-40, -255], hL: [-50, -180], eR: [40, -255], hR: [50, -180] });
P.wide = { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-60, -98], fL: [-120, 0], kR: [60, -98], fR: [140, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] };
// down dog (hands on the floor at the front, feet at the back), lunge with hands down, crooked landing
P.dog = { head: [150, -95], sh: [105, -160], hip: [-25, -310], kL: [-95, -150], fL: [-165, 0], kR: [-80, -150], fR: [-145, 0], eL: [150, -78], hL: [190, 0], eR: [160, -76], hR: [205, 0] };
P.lungeDown = { head: [150, -230], sh: [110, -270], hip: [-10, -160], kL: [-100, -90], fL: [-170, 0], kR: [120, -110], fR: [170, 0], eL: [150, -140], hL: [200, 0], eR: [160, -140], hR: [215, 0] };
P.crook = { head: [-80, -370], sh: [-55, -300], hip: [10, -165], kL: [-110, -95], fL: [-150, 0], kR: [160, -80], fR: [290, 0], eL: [-130, -250], hL: [-185, -190], eR: [40, -250], hR: [110, -310] };
const steps = (seq, k) => { const n = seq.length - 1, f = cl(k) * n, i = Math.min(n - 1, Math.floor(f)); return pose(seq[i], seq[i + 1], f - i); };
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
const UPPER = { head: 1, sh: 1, eL: 1, hL: 1, eR: 1, hR: 1 };
// a chunky pixel person: dark outline pass, then fill; skin-tone head with a hair cap; 2-frame breathing idle
function person(X, Y, p, s, color, o = {}) {
  const bob = (o.still ? 0 : IDLE) * 7;
  const W2 = (j) => [X + p[j][0] * s, Y + (p[j][1] + (UPPER[j] ? bob : 0)) * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "square"; x.lineJoin = "miter";
  const limb = (c, w, ...js) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  const far = mix(color, "#0b0820", 0.45);
  const O = "#000000";
  // outline
  limb(O, 50 * s, "hip", "kR", "fR"); limb(O, 50 * s, "sh", "eR", "hR"); limb(O, 64 * s, "sh", "hip");
  limb(O, 50 * s, "hip", "kL", "fL"); limb(O, 50 * s, "sh", "eL", "hL");
  const [hx, hy] = W2("head");
  x.fillStyle = O; x.fillRect(hx - 50 * s, hy - 50 * s, 100 * s, 100 * s);
  // fill
  limb(far, 34 * s, "hip", "kR", "fR"); limb(far, 34 * s, "sh", "eR", "hR");
  limb(color, 46 * s, "sh", "hip");
  limb(color, 34 * s, "hip", "kL", "fL"); limb(color, 34 * s, "sh", "eL", "hL");
  x.fillStyle = "#ffd8b0"; x.fillRect(hx - 38 * s, hy - 38 * s, 76 * s, 76 * s);
  x.fillStyle = "#1e1a4a"; x.fillRect(hx - 40 * s, hy - 42 * s, 80 * s, 28 * s);
  x.restore();
  return W2;
}
function mat(X, Y, w, a = 1, c = VIOLET) {
  x.save(); x.globalAlpha = a; x.fillStyle = "#000000"; x.fillRect(X - w / 2 - 6, Y - 6, w + 12, 36);
  x.fillStyle = mix(c, "#0b0820", 0.35); x.fillRect(X - w / 2, Y, w, 24); x.fillStyle = mix(c, "#ffffff", 0.2); x.fillRect(X - w / 2, Y, w, 7); x.restore();
}
// studio room: back wall, a dusk window with a moon, wooden floor planks, a plant in the corner
function room() {
  const wall = x.createLinearGradient(0, 0, 0, 1110);
  wall.addColorStop(0, "#1e1a4a"); wall.addColorStop(1, "#2f2a6e");
  x.fillStyle = wall; x.fillRect(0, 0, 1080, 1110);
  // window
  x.fillStyle = "#000000"; x.fillRect(680, 600, 300, 380);
  const sky = x.createLinearGradient(0, 620, 0, 960); sky.addColorStop(0, "#2a3a7a"); sky.addColorStop(1, "#ff6a1a");
  x.fillStyle = sky; x.fillRect(700, 620, 260, 340);
  x.fillStyle = "#ffd84a"; x.fillRect(880, 660, 44, 44);
  x.fillStyle = "#4b3fa8"; x.fillRect(824, 620, 12, 340); x.fillRect(700, 780, 260, 12);
  // floor
  const fl = x.createLinearGradient(0, 1110, 0, 1920); fl.addColorStop(0, "#4b3fa8"); fl.addColorStop(1, "#1e1a4a");
  x.fillStyle = fl; x.fillRect(0, 1110, 1080, 810);
  x.fillStyle = "#1e1a4a"; for (let i = 0; i < 7; i++) { const y = 1110 + i * i * 18; x.fillRect(0, y, 1080, 6); }
  x.fillStyle = "#000000"; x.fillRect(0, 1104, 1080, 12);
  // plant
  x.fillStyle = "#8a1020"; x.fillRect(80, 1000, 90, 110);
  x.fillStyle = "#137a3d"; x.fillRect(70, 880, 40, 120); x.fillRect(130, 840, 40, 160); x.fillRect(100, 920, 30, 80);
  x.fillStyle = "#3dff8a"; x.fillRect(130, 840, 18, 60); x.fillRect(70, 880, 18, 50);
}
function ring(X, Y, r, c, a) { if (a <= 0) return; x.save(); x.globalAlpha = cl(a); x.strokeStyle = "#000000"; x.lineWidth = 20; x.strokeRect(X - r, Y - r, 2 * r, 2 * r); x.strokeStyle = c; x.lineWidth = 10; x.strokeRect(X - r, Y - r, 2 * r, 2 * r); x.restore(); }
function arrow(x1, y1, x2, y2, k, c, a = 1) {
  if (a <= 0 || k <= 0) return;
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), an = Math.atan2(y2 - y1, x2 - x1);
  x.save(); x.globalAlpha = cl(a); x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 22; x.lineCap = "square";
  x.beginPath(); x.moveTo(x1, y1); x.lineTo(ex, ey); x.stroke();
  x.beginPath(); x.moveTo(ex + Math.cos(an) * 40, ey + Math.sin(an) * 40); x.lineTo(ex + Math.cos(an + 2.4) * 46, ey + Math.sin(an + 2.4) * 46); x.lineTo(ex + Math.cos(an - 2.4) * 46, ey + Math.sin(an - 2.4) * 46); x.closePath(); x.fill();
  x.restore();
}
function pauseSign(X, Y, s, a, c = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "#000000"; x.fillRect(-96, -96, 192, 192); x.fillStyle = c; x.fillRect(-84, -84, 168, 168);
  x.fillStyle = "#0b0820"; x.fillRect(-44, -48, 30, 96); x.fillRect(14, -48, 30, 96); x.restore();
}
function stepList(items, X, Y, color, lit, px = 40) {
  items.forEach((s, i) => tag(s, X, Y + i * px * 1.9, color, cl(lit - i), px));
}
// 8-bit hearts row: health that drops when a student crashes out of the pose
function hearts(X, Y, n, full, a = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a);
  for (let i = 0; i < n; i++) {
    const hx = X + i * 90;
    x.fillStyle = "#000000"; x.fillRect(hx - 6, Y - 6, 72, 66);
    x.fillStyle = i < full ? RED : "#2f2a6e";
    x.fillRect(hx, Y + 6, 60, 24); x.fillRect(hx + 6, Y, 18, 12); x.fillRect(hx + 36, Y, 18, 12); x.fillRect(hx + 12, Y + 30, 36, 12); x.fillRect(hx + 24, Y + 42, 12, 12);
  }
  x.restore();
}

// ---------- one frame ----------
function frame(t0) {
  const t = Math.floor(t0 * 10 + 1e-6) / 10;
  const { id, u, d } = sceneOf(t);
  curU = u;
  IDLE = Math.floor(t * 2) % 2;
  x = sc;
  tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, TW, TH);
  x.setTransform(SW / 1080, 0, 0, SH / 1920, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  if (id === "s8") { x.fillStyle = BG; x.fillRect(0, 0, 1080, 1920); } else room();
  x.save(); x.translate(CX, ZY); x.scale(z, z); x.translate(-CX, -ZY);
  zoomM = [z, 0, 0, z, CX - CX * z, ZY - ZY * z];

  if (id === "s1") {
    // a student in down dog jumps the front foot forward in one fast hop: speed streaks, colour turns red on "rush"
    const R = at("s1", "rush"), J = sm(R - 0.15, R + 0.2, u);
    const hop = Math.sin(Math.PI * J) * 90;
    mat(CX - 20, 1380, 500, 1);
    person(CX - 40, 1380 - hop, pose(P.dog, P.crook, J), 1.0, u > R - 0.1 ? RED : VIOLET, { still: J > 0.05 && J < 0.95 });
    tag("FAST FLOW", CX, 760, VIOLET, sm(at("s1", "flow") - 0.1, at("s1", "flow") + 0.15, u) * (1 - J), 46);
    arrow(220, 1000, 760, 1000, J, RED, J * (1 - sm(R + 0.6, R + 0.9, u)));
    tag("RUSH!", 800, 900, RED, sm(R + 0.05, R + 0.25, u), 50);
  }
  if (id === "s2") {
    // three students bounce dog -> lunge -> dog with no breath between; breath hearts drain
    const xs = [230, 520, 810];
    const J = at("s2", "jump"), L = at("s2", "lose");
    xs.forEach((X, i) => {
      const k = u < J - 0.1 ? 0 : (Math.abs(Math.floor((u - J) * 6 + i)) % 2);
      mat(X, 1300, 250, 1);
      person(X - 20, 1300 - (k ? 40 : 0), k ? P.lungeDown : P.dog, 0.6, RED, { still: true });
    });
    tag("POSE", 260, 820, RED, sm(at("s2", "pose") - 0.1, at("s2", "pose") + 0.1, u), 46);
    tag("TO POSE", 760, 820, RED, sm(at("s2", "pose", 2) - 0.1, at("s2", "pose", 2) + 0.1, u), 46);
    const left = u < L ? 3 : u < L + 0.25 ? 2 : u < at("s2", "breath") ? 1 : 0;
    hearts(CX - 130, 1380, 3, left, sm(at("s2", "and") - 0.1, at("s2", "and") + 0.1, u));
  }
  if (id === "s3") {
    // close on one landing: front foot off the mat, body leaning, next pose built on it
    mat(CX - 60, 1400, 420, 1);
    const Sp = person(CX - 120, 1400, P.crook, 1.05, RED, { still: true });
    const [fx, fy] = Sp("fR"), [hx, hy] = Sp("hip"), [sx, sy] = Sp("sh");
    const F = sm(at("s3", "wrong") - 0.1, at("s3", "wrong") + 0.1, u);
    const C = sm(at("s3", "crooked") - 0.1, at("s3", "crooked") + 0.1, u);
    const pulse = IDLE * 8;
    ring(fx, fy - 30, 60 + pulse, ORANGE, F); tag("OFF THE MAT", fx - 120, fy - 190, ORANGE, F, 40);
    ring(lerp(sx, hx, 0.5), lerp(sy, hy, 0.5), 80 + pulse, ORANGE, C); tag("CROOKED", sx - 20, sy - 200, ORANGE, C, 44);
    const N = sm(at("s3", "next") - 0.1, at("s3", "next") + 0.2, u);
    tag("NEXT POSE?", CX, 700, RED, N * (1 - C), 40);
  }
  if (id === "s4") {
    // teacher on the right calls the step; the student steps the right foot forward between the hands, slowly
    person(850, 1300, P.stand, 0.62, GREEN);
    bubble("STEP BY STEP", 680, 960, GREEN, sm(at("s4", "cue") - 0.1, at("s4", "cue") + 0.15, u), 830, 1020, 40);
    const k = sm(at("s4", "step", 3) - 0.05, at("s4", "forward") + 0.3, u);
    mat(360, 1420, 460, 1, GREEN);
    const Sp = person(380, 1420, pose(P.dog, P.lungeDown, k), 0.95, GREEN);
    const [fx] = Sp("fR");
    tag("RIGHT FOOT", 360, 720, GREEN, sm(at("s4", "right") - 0.1, at("s4", "right") + 0.1, u), 44);
    arrow(380 - 140, 1330, 380 + 160, 1330, sm(at("s4", "right"), at("s4", "forward") + 0.3, u), GREEN, 1 - sm(at("s4", "forward") + 0.3, at("s4", "forward") + 0.5, u) * 0.6);
    void fx;
  }
  if (id === "s5") {
    // one move = one breath: hands come off the floor and the body rises on the inhale
    const I = at("s5", "inhale"), R = at("s5", "rise");
    const k = sm(I - 0.05, R + 0.25, u);
    mat(CX, 1420, 460, 1, GREEN);
    const Sp = person(CX - 10, 1420, pose(P.lungeDown, P.lunge, k), 1.0, GREEN);
    const [hx, hy] = Sp("sh");
    tag("1 MOVE", 240, 720, GREEN, sm(at("s5", "move") - 0.1, at("s5", "move") + 0.1, u), 44);
    tag("= 1 BREATH", 240, 830, VIOLET, sm(at("s5", "breath") - 0.1, at("s5", "breath") + 0.1, u), 44);
    tag("INHALE", 800, 760, VIOLET, sm(I - 0.1, I + 0.1, u), 44);
    arrow(800, 1200, 800, 880, sm(I, R + 0.2, u), VIOLET, 1);
    void hx; void hy;
  }
  if (id === "s6") {
    // the student holds the lunge one breath longer while two slower students catch up
    const E = sm(at("s6", "extra") - 0.15, at("s6", "extra") + 0.1, u);
    mat(260, 1400, 300, 1, GREEN);
    person(250, 1400, P.lunge, 0.7, GREEN);
    const Rm = sm(at("s6", "room") - 0.1, at("s6", "needs") + 0.3, u);
    mat(620, 1400, 200, 1, VIOLET); mat(860, 1400, 200, 1, VIOLET);
    person(610, 1400, pose(P.lungeDown, P.lunge, Rm), 0.45, VIOLET);
    person(850, 1400, pose(P.dog, P.lungeDown, Rm), 0.45, VIOLET);
    const br = 1 + 0.15 * IDLE;
    ring(260, 760, 70 * br, GREEN, E);
    tag("+1 BREATH", 260, 900, GREEN, E, 44);
    tag("WAIT FOR THEM", 740, 1180, VIOLET, sm(at("s6", "room") - 0.1, at("s6", "room") + 0.1, u), 36);
  }
  if (id === "s7") {
    mat(CX, 1260, 300, 0.8, GREEN);
    person(CX, 1260, P.lunge, 0.6, GREEN);
  }
  x.restore();
  zoomM = [1, 0, 0, 1, 0, 0];

  if (id === "s1") words(["NEVER RUSH", "THE TRANSITIONS"], RED, 330, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "rush"))));
  if (id === "s2") words(["POSE TO POSE,", "NO BREATH"], RED, 330, 0.0, 1, 150, flash(u, at("s2", "breath")) * 0.6);
  if (id === "s3") words(["FEET LAND", "CROOKED"], RED, 330, 0.0, 1, 150, flash(u, at("s3", "crooked")) * 0.6);
  if (id === "s4") words(["STEP", "BY STEP"], GREEN, 330, 0.0, 1, 150, flash(u, at("s4", "step", 2)) * 0.6);
  if (id === "s5") words(["ONE MOVE,", "ONE BREATH"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "breath")) * 0.6);
  if (id === "s6") words(["ONE EXTRA", "BREATH"], GREEN, 330, 0.0, 1, 150, flash(u, at("s6", "extra")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SLOW THE MOVE."], ORANGE, 690, 0.0, 1, 150, flash(u, 0.05));
    words(["KEEP THE FLOW."], ORANGE, 880, at("s7", "keep") - 0.05, 1, 150, flash(u, at("s7", "flow")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.fillStyle = "#000000"; x.fillRect(-150, -150, 300, 300); x.fillStyle = VIOLET; x.fillRect(-138, -138, 276, 276);
    x.fillStyle = "#1e1a4a"; x.fillRect(-120, -120, 240, 240);
    x.restore();
    person(CX, 560 + 100 * k, P.sit, 0.62 * Math.max(0.01, k), VIOLET);
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
window.__hf.buildReady["rush-transitions-pixel"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
