// peak-last: PS2 LOW-POLY style (style test 22.11, style 7). three.js low-poly flat-shaded models, rendered at 360x640
// and scaled up 3x with no smoothing, ordered (Bayer) dither to 24 levels per channel, blob shadows, early-2000s
// game camera (swoop in on each cut, slow orbit). No real game characters, logos or UI. Text is a full-res 2D overlay
// in a chunky HUD style. Time only from hf-seek.
import * as THREE from "three";

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
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- low-res renderer -> dither -> 3x nearest upscale ----------
const LW = 360, LH = 640;
const out = document.getElementById("world");
const x = out.getContext("2d");
const glc = document.createElement("canvas"); glc.width = LW; glc.height = LH;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(LW, LH, false);
const low = document.createElement("canvas"); low.width = LW; low.height = LH;
const lx = low.getContext("2d", { willReadFrequently: true });
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const STEPV = 255 / 23;
function present() {
  lx.clearRect(0, 0, LW, LH);
  lx.drawImage(glc, 0, 0);
  const im = lx.getImageData(0, 0, LW, LH), d = im.data;
  for (let yy = 0; yy < LH; yy++) for (let xx = 0; xx < LW; xx++) {
    const i = (yy * LW + xx) * 4, b = (BAYER[(yy & 3) * 4 + (xx & 3)] / 16 - 0.47) * STEPV;
    d[i] = Math.round((d[i] + b) / STEPV) * STEPV;
    d[i + 1] = Math.round((d[i + 1] + b) / STEPV) * STEPV;
    d[i + 2] = Math.round((d[i + 2] + b) / STEPV) * STEPV;
  }
  lx.putImageData(im, 0, 0);
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.imageSmoothingEnabled = false;
  x.drawImage(low, 0, 0, 1080, 1920);
}

// ---------- world ----------
const scene = new THREE.Scene();
const BGC = 0x4a4170;
scene.background = new THREE.Color(BGC);
scene.fog = new THREE.Fog(BGC, 11, 26);
const camera = new THREE.PerspectiveCamera(48, LW / LH, 0.1, 100);
const hemi = new THREE.HemisphereLight(0xfff0dd, 0x403050, 1.7); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffe2b0, 2.1); key.position.set(4, 8, 6); scene.add(key);
const HEMI0 = new THREE.Color(0xfff0dd), KEY0 = new THREE.Color(0xffe2b0);
const lam = (hex) => new THREE.MeshLambertMaterial({ color: hex, flatShading: true });
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);

function planks() {
  const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d");
  const cols = ["#8a5a34", "#7d5130", "#946238", "#83552f"];
  for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(0, i * 8, 32, 8); g.fillStyle = "#5e3b20"; g.fillRect(0, i * 8 + 7, 32, 1); g.fillRect((i * 13 + 5) % 32, i * 8, 1, 8); }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.MeshLambertMaterial({ map: planks() }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const wall = box(36, 10, 0.3, lam(0x8f7fb0)); wall.position.set(0, 5, -4.6); scene.add(wall);
  const base = box(36, 0.25, 0.1, lam(0x3a2f55)); base.position.set(0, 0.12, -4.42); scene.add(base);
  for (const wx of [-4.2, 0, 4.2]) {
    const fr = box(1.9, 2.7, 0.08, lam(0x3a2f55)); fr.position.set(wx, 4.9, -4.42); scene.add(fr);
    const gl = box(1.6, 2.4, 0.06, new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); gl.position.set(wx, 4.9, -4.37); scene.add(gl);
    const bar = box(0.08, 2.4, 0.07, lam(0x3a2f55)); bar.position.set(wx, 4.9, -4.33); scene.add(bar);
  }
}

// ---------- low-poly person (faces +x), joints in the sagittal plane ----------
const P = {
  stand: { b1: 0, b2: 0, n: 0, s: 0.08, e: 0.1, h: 0, k: 0, hx: 0 },
  reach: { b1: 0, b2: -0.05, n: -0.2, s: 3.0, e: 0.05, h: 0, k: 0, hx: 0 },
  half: { b1: 1.25, b2: 0.25, n: -0.6, s: 1.2, e: 0.1, h: 0.06, k: 0, hx: -0.06 },
  fold: { b1: 1.75, b2: 0.75, n: 0.3, s: 2.45, e: 0, h: 0.14, k: 0, hx: -0.14 },
  forced: { b1: 1.3, b2: 1.0, n: 0.7, s: 2.0, e: 0.15, h: -0.04, k: -0.12, hx: 0.04 },
};
const pose = (a, b, k) => { const o = {}; for (const j in a) o[j] = lerp(a[j], b[j], k); return o; };
const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
function limb(len, r, mat) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, len, 5), mat); m.position.y = -len / 2; return m; }
function makePerson() {
  const skin = lam(0xd9a37a), shirt = lam(0x7b6cff), pants = lam(0x2b2550), hair = lam(0x2a1a14);
  const root = new THREE.Group();
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.5, 8), blobMat); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.012; blob.scale.set(1.2, 0.6, 1); root.add(blob);
  const hip = new THREE.Group(); hip.position.y = 0.99; root.add(hip);
  const legs = [-0.11, 0.11].map((zo) => {
    const th = new THREE.Group(); th.position.z = zo; th.add(limb(0.48, 0.09, pants));
    const sh = new THREE.Group(); sh.position.y = -0.48; sh.add(limb(0.47, 0.07, pants));
    const ft = box(0.24, 0.07, 0.11, skin); ft.position.set(0.06, -0.475, 0); sh.add(ft);
    th.add(sh); hip.add(th); return { th, sh };
  });
  const t1 = new THREE.Group(); hip.add(t1);
  const m1 = box(0.27, 0.32, 0.36, pants); m1.position.y = 0.14; t1.add(m1);
  const t2 = new THREE.Group(); t2.position.y = 0.3; t1.add(t2);
  const m2 = box(0.29, 0.34, 0.42, shirt); m2.position.y = 0.16; t2.add(m2);
  const nk = new THREE.Group(); nk.position.y = 0.34; t2.add(nk);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.135, 0), skin); head.position.y = 0.15; nk.add(head);
  const cap = new THREE.Mesh(new THREE.IcosahedronGeometry(0.14, 0), hair); cap.position.set(-0.03, 0.19, 0); cap.scale.set(1, 0.7, 1); nk.add(cap);
  const nose = box(0.05, 0.05, 0.05, skin); nose.position.set(0.14, 0.14, 0); nk.add(nose);
  const arms = [-0.26, 0.26].map((zo) => {
    const ua = new THREE.Group(); ua.position.set(0, 0.3, zo); ua.add(limb(0.3, 0.065, shirt));
    const fa = new THREE.Group(); fa.position.y = -0.3; fa.add(limb(0.28, 0.05, skin));
    const hand = new THREE.Group(); hand.position.y = -0.3; fa.add(hand);
    ua.add(fa); t2.add(ua); return { ua, fa, hand };
  });
  scene.add(root);
  const wv = new THREE.Vector3();
  return {
    root, shirt,
    set(p) {
      hip.position.x = p.hx; t1.rotation.z = -p.b1; t2.rotation.z = -p.b2; nk.rotation.z = -p.n;
      arms.forEach((a) => { a.ua.rotation.z = p.s; a.fa.rotation.z = p.e; });
      legs.forEach((l) => { l.th.rotation.z = p.h; l.sh.rotation.z = -p.k; });
    },
    wp(name) {
      root.updateMatrixWorld(true);
      const o = { knee: legs[1].sh, shoulder: nk, hand: arms[1].hand, head }[name];
      return o.getWorldPosition(wv).clone();
    },
  };
}
const people = [makePerson(), makePerson(), makePerson()];
const C3 = { violet: 0x7b6cff, green: 0x2ecc71, red: 0xff2a3a, ice: 0x6ad6ff };

const matMesh = (hex) => { const m = box(2.0, 0.05, 0.75, lam(hex)); m.position.y = 0.025; scene.add(m); return m; };
const mats = [matMesh(0x7b6cff), matMesh(0x2ecc71), matMesh(0x7b6cff)];

// plan cards: three slots + three cards
const slotMat = new THREE.MeshBasicMaterial({ color: 0x1a1640, transparent: true, opacity: 0.45, depthWrite: false });
const slots = [0, 1, 2].map(() => { const m = box(1.15, 0.66, 0.04, slotMat); scene.add(m); return m; });
const cards = [0, 1, 2].map(() => { const m = box(1.1, 0.62, 0.12, lam(0x7b6cff)); scene.add(m); return m; });
const CARD_Y = 2.4, CARD_X = [-1.3, 0, 1.3];

// energy bars
const NB = 26;
const barMat = lam(0xff2a3a);
const bars = Array.from({ length: NB }, () => { const m = box(0.15, 1, 0.3, barMat); scene.add(m); return m; });
const axes = [box(5.2, 0.05, 0.05, lam(0x1a1640)), box(0.05, 2.4, 0.05, lam(0x1a1640))];
axes.forEach((a) => scene.add(a));

// stairs
const stairs = [0.4, 0.9, 1.4].map((h) => { const m = box(1.6, h, 1.0, lam(0x2a8f5a)); scene.add(m); m.userData.h = h; return m; });
const STAIR_X = [-1.95, 0, 1.95];

// snow (low-poly flakes)
const snow = []; { const r = rng(5); for (let i = 0; i < 34; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06, 0), new THREE.MeshBasicMaterial({ color: 0xe8f6ff })); m.userData = { x: (r() - 0.5) * 4, z: (r() - 0.5) * 2, ph: r() * 3, sp: 0.5 + r() * 0.5 }; scene.add(m); snow.push(m); } }

// turntable for the end card
const table = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.18, 8), lam(0x3a2f55)); scene.add(table);

// ---------- camera: fit points into a screen box, then game-camera swoop + orbit ----------
const tv = new THREE.Vector3();
function place(look, dir, dist) { camera.position.copy(look).addScaledVector(dir, dist); camera.lookAt(look); camera.updateMatrixWorld(); }
function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { tv.copy(p).project(camera); const X = (tv.x + 1) * 540, Y = (1 - tv.y) * 960; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); } return { w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
function boxPts(x0, x1, y0, y1, z0, z1) { const o = []; for (const X of [x0, x1]) for (const Y of [y0, y1]) for (const Z of [z0, z1]) o.push(V(X, Y, Z)); return o; }
function fit(pts, dirArr, bx) {
  const dir = V(...dirArr).normalize();
  const look = V(0, 0, 0); pts.forEach((p) => look.add(p)); look.multiplyScalar(1 / pts.length);
  const bw = bx[2] - bx[0], bh = bx[3] - bx[1], cx = (bx[0] + bx[2]) / 2, cy = (bx[1] + bx[3]) / 2;
  let dist = 10;
  for (let it = 0; it < 5; it++) {
    let lo = 1, hi = 60;
    for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; place(look, dir, mid); const b = bbox(pts); if (b.w <= bw && b.h <= bh) hi = mid; else lo = mid; }
    dist = hi; place(look, dir, dist);
    const b = bbox(pts), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, ppu = 960 / hh;
    const right = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 0), up = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 1);
    look.addScaledVector(right, (b.cx - cx) / ppu).addScaledVector(up, -(b.cy - cy) / ppu);
  }
  return { look, dir, dist };
}
const SHOTS = {
  s1: () => fit(boxPts(-2.0, 2.0, 0, 2.75, -0.5, 0.5), [0.3, 0.2, 1], [110, 600, 910, 1400]),
  s2: () => fit(boxPts(-0.9, 1.3, 0, 1.6, -0.5, 0.5), [0.55, 0.25, 1], [150, 640, 900, 1390]),
  s3: () => fit(boxPts(-2.65, 2.65, 0, 2.3, -0.2, 0.2), [0.12, 0.12, 1], [110, 640, 910, 1360]),
  s4: () => fit(boxPts(-2.0, 2.0, 0, 2.75, -0.5, 0.5), [-0.3, 0.2, 1], [110, 600, 910, 1400]),
  s5: () => fit(boxPts(-2.8, 2.8, 0.2, 3.0, -0.6, 0.6), [0.18, 0.22, 1], [90, 620, 930, 1400]),
  s6: () => fit(boxPts(-1.2, 1.4, 0, 1.6, -1.7, 1.7), [0.4, 0.8, 1], [150, 640, 880, 1420]),
  s7: () => fit(boxPts(-1.2, 1.2, 0, 1.4, -0.5, 0.5), [0.6, 0.35, 1], [160, 1000, 880, 1500]),
  s8: () => fit(boxPts(-0.5, 0.5, 0, 1.95, -0.5, 0.5), [0, 0.12, 1], [430, 430, 590, 700]),
};
const shotCache = {};
const yAxis = V(0, 1, 0);
function shoot(id, u, d) {
  const s = shotCache[id] || (shotCache[id] = SHOTS[id]());
  const k = cl(u / Math.max(0.5, d));
  const swoop = 1 - sm(-LEAD, 0.35, u);
  const dir = s.dir.clone().applyAxisAngle(yAxis, lerp(-0.1, 0.12, k) + 0.35 * swoop * swoop);
  place(s.look, dir, s.dist * lerp(1.05, 1.0, k) * (1 + 0.25 * swoop * swoop));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- HUD overlay (full res) ----------
const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff8a1a", WHITE = "#ffffff", ICE = "#6ad6ff", INK = "#0b0820";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
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
      const s0 = t0 + wi * 0.07, k = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      const s = 0.5 + 0.5 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = "rgba(11,8,32,0.6)"; x.fillText(p, 8, 10);
      x.lineWidth = Math.max(10, px * 0.14); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.75) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 46, h = px * 1.5, s = 0.6 + 0.4 * cl(a);
  X = cl(X, 70 + w / 2, 940 - w / 2); Y = cl(Y, 300, 1420);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(0,0,0,0.45)"; x.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
  x.fillStyle = "rgba(11,8,32,0.9)"; x.fillRect(-w / 2, -h / 2, w, h);
  x.lineWidth = 6; x.strokeStyle = color; x.strokeRect(-w / 2, -h / 2, w, h);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  for (const [lw, col] of [[40, INK], [22, c]]) {
    x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 72, 0, Math.PI * 2); x.stroke(); x.beginPath();
    if (kind === "x") { x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
    x.stroke();
  }
  x.restore();
}
function burst(X, Y, c, a, u) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  for (const [lw, col] of [[18, INK], [9, c]]) {
    x.strokeStyle = col; x.lineWidth = lw;
    for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 + (i - 2.5) * 0.42, r0 = 60 + 6 * Math.sin(u * 20 + i), r1 = r0 + 40 * a; x.beginPath(); x.moveTo(X + Math.cos(an) * r0, Y + Math.sin(an) * r0); x.lineTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); x.stroke(); }
  }
  x.restore();
}
function ring(X, Y, r, c, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a;
  for (const [lw, col] of [[16, INK], [8, c]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke(); }
  x.restore();
}

// ---------- one frame ----------
function reset() {
  people.forEach((p) => { p.root.visible = false; p.root.position.set(0, 0, 0); p.root.rotation.set(0, 0, 0); p.root.scale.setScalar(1); p.set(P.stand); p.shirt.color.set(C3.violet); });
  mats.forEach((m) => { m.visible = false; m.scale.setScalar(1); });
  slots.forEach((m) => (m.visible = false)); cards.forEach((m) => (m.visible = false));
  bars.forEach((m) => (m.visible = false)); axes.forEach((m) => (m.visible = false));
  stairs.forEach((m) => (m.visible = false)); snow.forEach((m) => (m.visible = false));
  table.visible = false;
  hemi.color.copy(HEMI0); key.color.copy(KEY0);
}
function showPlan(fills) {
  CARD_X.forEach((cx, i) => {
    slots[i].visible = true; slots[i].position.set(cx, CARD_Y, -0.05);
    const f = fills[i];
    if (f && f.a > 0) { const c = cards[i]; c.visible = true; c.material.color.set(f.c); c.position.set(cx, CARD_Y + (1 - back(0, 1, f.a)) * 1.2, 0.02); c.rotation.y = (1 - cl(f.a)) * 1.2; }
  });
}
const putMat = (i, X, hex) => { const m = mats[i]; m.visible = true; m.position.x = X; m.position.z = 0; m.material.color.set(hex); return m; };
const putPerson = (i, X, Y, p, hex, s = 1) => { const q = people[i]; q.root.visible = true; q.root.position.set(X, Y, 0); q.root.scale.setScalar(Math.max(0.001, s)); q.set(p); q.shirt.color.set(hex); return q; };

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  shoot(id, u, d);
  const U = (w, n) => at(id, w, n);
  const lab = {};

  if (id === "s1") {
    const pk = sm(U("peak") - 0.15, U("pose") + 0.1, u);
    showPlan([{ c: C3.red, a: pk }, null, null]);
    putMat(0, -0.1, C3.violet);
    putPerson(0, -0.15, 0, P.stand, C3.violet);
  }
  if (id === "s2") {
    hemi.color.set(0xbfe4ff); key.color.set(0xa8d8ff);
    const f = sm(U("force") - 0.25, U("force") + 0.15, u);
    const tryF = sm(U("reach") - 0.2, U("shape") + 0.1, u);
    putMat(0, 0.1, C3.ice);
    lab.p = putPerson(0, 0, 0, pose(P.stand, P.forced, Math.max(tryF * 0.7, f)), new THREE.Color(C3.ice).lerp(new THREE.Color(C3.red), f).getHex());
    lab.f = f; lab.tryF = tryF;
    snow.forEach((m) => { const p = m.userData; m.visible = true; m.position.set(p.x, 3.2 - ((u * p.sp + p.ph) % 3.2), p.z); m.rotation.set(u * 2 + p.ph, u * 3, 0); });
  }
  if (id === "s3") {
    const draw = sm(0.1, U("turn") + 0.3, u);
    axes[0].visible = axes[1].visible = true; axes[0].position.set(0, 0.03, 0); axes[1].position.set(-2.6, 1.2, 0);
    bars.forEach((m, i) => {
      const k = i / (NB - 1); const drop = sm(0.08, 0.3, k);
      const h = lerp(1.9, 0.4, drop) + Math.sin(k * 18) * 0.06 * drop;
      const g = cl((draw - k) * 8);
      m.visible = g > 0.01; m.scale.y = Math.max(0.01, h * g); m.position.set(lerp(-2.4, 2.4, k), m.scale.y / 2, 0);
    });
  }
  if (id === "s4") {
    const pk = sm(U("peak") - 0.15, U("first") + 0.1, u);
    const bk = sm(U("backward") - 0.3, U("it") + 0.15, u);
    showPlan([0, 1, 2].map((i) => (i === 2 ? { c: C3.green, a: pk } : { c: C3.violet, a: sm(0.3 + (1 - i) * 0.3, 0.6 + (1 - i) * 0.3, bk) })));
    lab.pk = pk; lab.bk = bk;
    putMat(0, -0.1, C3.green);
    putPerson(0, -0.05, 0, pose(P.stand, P.fold, pk), C3.green);
  }
  if (id === "s5") {
    const k1 = sm(U("warm") - 0.1, U("up") + 0.2, u), k2 = sm(U("parts") - 0.1, U("needs") + 0.1, u), k3 = sm(U("step") - 0.15, U("time") + 0.1, u);
    stairs.forEach((m, i) => { m.visible = true; m.position.set(STAIR_X[i], m.userData.h / 2, 0); });
    const pop = (a) => back(a, a + 0.3, u);
    putPerson(0, STAIR_X[0] - 0.1, 0.4, pose(P.stand, P.reach, k1), C3.green, 0.85 * pop(-0.05));
    lab.p2 = putPerson(1, STAIR_X[1] - 0.1, 0.9, pose(P.stand, P.half, k2), C3.green, 0.85 * pop(U("exact") - 0.2));
    putPerson(2, STAIR_X[2] - 0.1, 1.4, pose(P.half, P.fold, k3), C3.green, 0.85 * pop(U("one") - 0.2));
  }
  if (id === "s6") {
    const E = back(U("easier") - 0.1, U("version") + 0.1, u), F = back(U("full") - 0.1, U("pose") + 0.1, u);
    // front mat = EASIER (lower on screen), back mat = FULL (higher on screen)
    const m0 = putMat(0, -0.2, C3.green); m0.position.z = 1.3; m0.scale.setScalar(Math.max(0.001, cl(E)));
    const m1 = putMat(1, 0.2, C3.violet); m1.position.z = -1.3; m1.scale.setScalar(Math.max(0.001, cl(F)));
    putPerson(0, -0.2, 0, P.half, C3.green, E).root.position.z = 1.3;
    putPerson(1, 0.2, 0, P.fold, C3.violet, F).root.position.z = -1.3;
  }
  if (id === "s7") {
    putMat(0, -0.1, C3.green);
    putPerson(0, -0.05, 0, P.fold, C3.green);
  }
  if (id === "s8") {
    table.visible = true; table.position.set(0, 0.09, 0);
    const q = putPerson(0, 0, 0.18, P.stand, C3.violet);
    q.root.rotation.y = u * 1.4;
  }
  renderer.render(scene, camera);
  present();

  // ---------- HUD ----------
  const pin = (v) => scr(v);
  if (id === "s1") {
    const [sx, sy] = pin(V(CARD_X[0], CARD_Y, 0));
    tag("PEAK", sx, sy, RED, sm(U("peak") - 0.05, U("peak") + 0.2, u), 40);
    mark("x", sx + 170, sy - 10, back(U("pose"), U("pose") + 0.3, u) * 0.6, u > U("pose") ? 1 : 0, RED);
    words(["NEVER OPEN WITH", "THE PEAK POSE"], RED, 380, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, U("never"))));
  }
  if (id === "s2") {
    const p = lab.p;
    tag("COLD BODY", 300, 560, ICE, sm(U("cold") - 0.05, U("bodies") + 0.1, u), 42);
    const [bx, by] = pin(p.wp("shoulder"));
    burst(bx - 20, by - 70, RED, lab.f, u);
    tag("FORCED", 760, 1040, RED, lab.f, 46);
    if (lab.tryF > 0.6) {
      const [hx, hy] = pin(p.wp("hand")), [, fy] = pin(V(p.wp("hand").x, 0, 0));
      x.save(); x.globalAlpha = lab.tryF; x.setLineDash([16, 12]);
      for (const [lw, col] of [[14, INK], [7, RED]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(hx + 30, hy + 10); x.lineTo(hx + 30, fy); x.stroke(); }
      x.restore();
    }
    words(["COLD BODIES", "FORCE IT"], RED, 360, 0.0, 1, 140, flash(u, U("force")) * 0.6);
  }
  if (id === "s3") {
    const [ax, ay] = pin(V(-1.9, 2.2, 0)), [bx, by] = pin(V(0.9, 0.9, 0)), [cx, cy] = pin(V(-1.2, -0.25, 0));
    tag("STRUGGLE", ax + 60, ay - 20, RED, sm(U("struggle") - 0.1, U("struggle") + 0.2, u), 42);
    tag("HARD TO TURN AROUND", bx, by - 60, RED, sm(U("turn") - 0.1, U("turn") + 0.2, u), 40);
    tag("CLASS ENERGY", cx, cy + 40, VIOLET, sm(-0.05, 0.25, u) * 0.85, 34);
    words(["A BAD START", "STICKS"], RED, 360, 0.0, 1, 140, flash(u, U("struggle")) * 0.6);
  }
  if (id === "s4") {
    const names = ["WARM UP", "BUILD", "PEAK"];
    const xs = CARD_X.map((cx) => pin(V(cx, CARD_Y, 0)));
    xs.forEach(([X, Y], i) => tag(names[i], X, Y, i === 2 ? GREEN : VIOLET, i === 2 ? lab.pk : sm(0.3 + (1 - i) * 0.3, 0.6 + (1 - i) * 0.3, lab.bk), 34));
    if (lab.bk > 0) {
      const ya = Math.max(xs[0][1], xs[2][1]) + 110, xa = xs[2][0], xb = lerp(xs[2][0], xs[0][0], lab.bk);
      x.save(); x.globalAlpha = lab.bk; x.lineCap = "round"; x.lineJoin = "round";
      for (const [lw, col] of [[22, INK], [11, GREEN]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(xa, ya); x.lineTo(xb, ya); x.moveTo(xb + 30, ya - 30); x.lineTo(xb, ya); x.lineTo(xb + 30, ya + 30); x.stroke(); }
      x.restore();
      tag("PLAN BACKWARD", CX, ya + 100, GREEN, sm(U("backward") - 0.1, U("backward") + 0.2, u), 42);
    }
    words(["PICK THE PEAK", "FIRST"], GREEN, 380, 0.0, 1, 140, flash(u, U("first")) * 0.6);
  }
  if (id === "s5") {
    const [kx, ky] = pin(lab.p2.wp("knee"));
    ring(kx, ky, 46 + 6 * Math.sin(u * 10), ORANGE, sm(U("parts") - 0.1, U("parts") + 0.15, u));
    const [hx, hy] = pin(V(0, 2.75, 0));
    tag("HAMSTRINGS", hx, hy - 20, ORANGE, sm(U("parts") - 0.05, U("pose") + 0.1, u), 38);
    const n = [[0, 0.4, -0.05], [1, 0.9, U("exact") - 0.1], [2, 1.4, U("one")]];
    n.forEach(([i, h, t0]) => { const [X, Y] = pin(V(STAIR_X[i], h - 0.12, 0.5)); if (i !== 1) tag(String(i + 1), X, Y, GREEN, sm(t0, t0 + 0.15, u), 40); else tag("2", X + 150, Y, GREEN, sm(t0, t0 + 0.15, u), 40); });
    words(["WARM UP", "WHAT IT NEEDS"], GREEN, 360, 0.0, 1, 140);
  }
  if (id === "s6") {
    const [ex, ey] = pin(V(1.4, 0.7, 1.3)), [fx, fy] = pin(V(1.6, 0.7, -1.3));
    tag("EASIER", ex + 90, ey, GREEN, sm(U("easier") - 0.05, U("easier") + 0.2, u), 42);
    tag("FULL", fx + 70, fy - 40, VIOLET, sm(U("full") - 0.05, U("full") + 0.2, u), 42);
    tag("IF READY", fx + 70, fy + 50, VIOLET, sm(U("ready") - 0.1, U("ready") + 0.15, u), 36);
    words(["OFFER TWO", "VERSIONS"], GREEN, 360, 0.0, 1, 140);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(11,8,32,0.5)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["BUILD UP."], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05));
    words(["THEN PEAK."], ORANGE, 750, U("then") - 0.05, 1, 160, flash(u, U("peak")));
  }
  if (id === "s8") {
    const g = x.createRadialGradient(CX, 565, 120, CX, 565, 900);
    g.addColorStop(0, "rgba(11,8,32,0.1)"); g.addColorStop(0.25, "rgba(11,8,32,0.72)"); g.addColorStop(1, "rgba(11,8,32,0.82)");
    x.save(); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 565); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    for (const [lw, col] of [[22, INK], [12, VIOLET]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 175, 0, Math.PI * 2); x.stroke(); }
    x.strokeStyle = GREEN; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 205, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 860, 0.15, 1, 130);
    words([c2], VIOLET, 1010, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1170, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["peak-last-ps2"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
