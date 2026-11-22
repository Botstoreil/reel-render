// smart-display: PS2 LOW-POLY style (style test 22.11, style 7). three.js low-poly flat-shaded set, rendered at
// 360x640 and scaled up 3x with no smoothing, ordered (Bayer) dither to 24 levels per channel, blob shadows,
// early-2000s game camera (swoop in on each cut, slow orbit), the key spins like a pickup item. Generic device only:
// no brand, logo or real product design. Text is a full-res 2D HUD overlay. Time only from hf-seek.
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

// ---------- world: a bedroom wall, wooden floor ----------
const scene = new THREE.Scene();
const BGC = 0x2e2852;
scene.background = new THREE.Color(BGC);
scene.fog = new THREE.Fog(BGC, 9, 22);
const camera = new THREE.PerspectiveCamera(48, LW / LH, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xfff0dd, 0x302848, 1.6));
const keyL = new THREE.DirectionalLight(0xffe2b0, 2.0); keyL.position.set(4, 8, 6); scene.add(keyL);
const lam = (hex) => new THREE.MeshLambertMaterial({ color: hex, flatShading: true });
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
const Z0 = -3.6; // the set stands against the wall (wall face at z = -4.45)

function planks() {
  const c = document.createElement("canvas"); c.width = c.height = 32; const g = c.getContext("2d");
  const cols = ["#7a5030", "#6e472b", "#845735", "#744b2d"];
  for (let i = 0; i < 4; i++) { g.fillStyle = cols[i]; g.fillRect(0, i * 8, 32, 8); g.fillStyle = "#4e301b"; g.fillRect(0, i * 8 + 7, 32, 1); g.fillRect((i * 13 + 5) % 32, i * 8, 1, 8); }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), new THREE.MeshLambertMaterial({ map: planks() }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  const wall = box(36, 10, 0.3, lam(0x6f6496)); wall.position.set(0, 5, -4.6); scene.add(wall);
  const base = box(36, 0.22, 0.1, lam(0x2a2348)); base.position.set(0, 0.11, -4.42); scene.add(base);
  // a framed picture and a bed corner for the room
  const pf = box(1.5, 1.1, 0.06, lam(0x2a2348)); pf.position.set(-2.6, 3.0, -4.42); scene.add(pf);
  const pc = box(1.3, 0.9, 0.04, lam(0xc98f5a)); pc.position.set(-2.6, 3.0, -4.38); scene.add(pc);
  const bed = box(3.2, 0.6, 3.0, lam(0xe8e2f4)); bed.position.set(-3.1, 0.3, Z0 + 0.9); scene.add(bed);
  const blanket = box(3.24, 0.18, 2.0, lam(0x5a4fc0)); blanket.position.set(-3.1, 0.66, Z0 + 1.4); scene.add(blanket);
}

// screen textures (low-res, nearest)
function screenTex(draw) {
  const c = document.createElement("canvas"); c.width = 160; c.height = 88; const g = c.getContext("2d");
  draw(g);
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const TEX = {
  clock: screenTex((g) => { g.fillStyle = "#24206a"; g.fillRect(0, 0, 160, 88); g.fillStyle = "#ffffff"; g.font = "900 40px Inter, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("10:24", 80, 38); g.fillStyle = "#a596ff"; g.font = "900 15px Inter, Arial, sans-serif"; g.fillText("SUNNY 24°", 80, 70); }),
  accounts: screenTex((g) => { g.fillStyle = "#24206a"; g.fillRect(0, 0, 160, 88); ["#ff6a1a", "#ffd84a", "#a596ff"].forEach((c, i) => { const X = 32 + i * 48; g.fillStyle = c; g.beginPath(); g.arc(X, 34, 12, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(X, 70, 18, Math.PI, 0); g.fill(); }); }),
  off: screenTex((g) => { g.fillStyle = "#07061a"; g.fillRect(0, 0, 160, 88); }),
};

// ---------- props ----------
const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
function makeDisplay() {
  const g = new THREE.Group(); // origin at the bottom centre, screen faces +z
  const frameM = lam(0x2a2660);
  const base = box(1.3, 0.42, 0.55, lam(0x1e1a40)); base.position.set(0, 0.21, 0); g.add(base);
  const grille = box(1.2, 0.3, 0.02, lam(0x3a3480)); grille.position.set(0, 0.21, 0.28); g.add(grille);
  const head = new THREE.Group(); head.position.set(0, 0.4, 0.06); head.rotation.x = -0.16; g.add(head);
  const fr = box(1.5, 0.95, 0.1, frameM); fr.position.y = 0.44; head.add(fr);
  const scrM = new THREE.MeshBasicMaterial({ map: TEX.clock });
  const sc = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.66), scrM); sc.position.set(0, 0.38, 0.052); head.add(sc);
  const lensM = new THREE.MeshLambertMaterial({ color: 0x05040f, emissive: 0x000000 });
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 8), lensM); lens.rotation.x = Math.PI / 2; lens.position.set(0, 0.81, 0.058); head.add(lens);
  const shut = box(0.17, 0.1, 0.025, lam(0x2ecc71)); shut.position.set(0.24, 0.81, 0.068); head.add(shut);
  for (let i = 0; i < 5; i++) { const l = box(1.2, 0.04, 0.01, lam(0x4b3fa8)); l.position.set(0, 0.2 + i * 0.13, -0.056); head.add(l); }
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.8, 8), blobMat); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.006; blob.scale.set(1, 0.5, 1); g.add(blob);
  scene.add(g);
  return {
    g, lens,
    set({ scr = "clock", red = 0, shutK = 0, turn = 0, frameHex = 0x2a2660 } = {}) {
      scrM.map = TEX[scr || "off"];
      lensM.emissive.setRGB(red * 1.0, red * 0.08, red * 0.1);
      shut.position.x = lerp(0.24, 0, shutK);
      g.rotation.y = Math.PI * turn;
      frameM.color.set(frameHex);
    },
    lensWorld() { g.updateMatrixWorld(true); return lens.getWorldPosition(V(0, 0, 0)); },
  };
}
const displays = [makeDisplay(), makeDisplay(), makeDisplay()];

const stand = new THREE.Group(); {
  const body = box(1.8, 1.1, 1.0, lam(0x5a3a22)); body.position.y = 0.55; stand.add(body);
  const top = box(1.9, 0.08, 1.06, lam(0x6e4a2c)); top.position.y = 1.12; stand.add(top);
  const dr = box(1.6, 0.03, 0.02, lam(0x2e1c10)); dr.position.set(0, 0.62, 0.51); stand.add(dr);
  const kn = box(0.16, 0.08, 0.06, lam(0xd8b060)); kn.position.set(0, 0.85, 0.52); stand.add(kn);
  scene.add(stand);
}
const STAND_TOP = 1.16;

// key: low-poly pickup that spins
const keyG = new THREE.Group(); {
  const m = lam(0xffd84a);
  const bow = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 4, 8), m); bow.position.x = -0.26; keyG.add(bow);
  const shaft = box(0.42, 0.07, 0.06, m); shaft.position.x = 0.1; keyG.add(shaft);
  const t1 = box(0.06, 0.12, 0.06, m); t1.position.set(0.2, -0.08, 0); keyG.add(t1);
  const t2 = box(0.06, 0.16, 0.06, m); t2.position.set(0.29, -0.1, 0); keyG.add(t2);
  scene.add(keyG);
}
// socket on the wall + plug + cable
const sockG = new THREE.Group(); {
  const plate = box(0.5, 0.7, 0.06, lam(0xe8e2f4)); sockG.add(plate);
  [-0.08, 0.08].forEach((dx) => { const h = box(0.05, 0.1, 0.02, lam(0x111111)); h.position.set(dx, 0, 0.035); sockG.add(h); });
  sockG.position.set(1.7, 0.75, -4.42); scene.add(sockG);
}
const plugG = new THREE.Group(); { const p = box(0.32, 0.28, 0.22, lam(0x2ecc71)); p.position.z = 0.11; plugG.add(p); scene.add(plugG); }
const cable = Array.from({ length: 14 }, () => { const m = box(0.06, 0.06, 0.06, lam(0x1a1a24)); scene.add(m); return m; });

// ---------- camera ----------
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
    let lo = 0.5, hi = 60;
    for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; place(look, dir, mid); const b = bbox(pts); if (b.w <= bw && b.h <= bh) hi = mid; else lo = mid; }
    dist = hi; place(look, dir, dist);
    const b = bbox(pts), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, ppu = 960 / hh;
    const right = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 0), up = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 1);
    look.addScaledVector(right, (b.cx - cx) / ppu).addScaledVector(up, -(b.cy - cy) / ppu);
  }
  return { look, dir, dist };
}
const DT = STAND_TOP + 1.4; // top of a display on the stand
const SHOTS = {
  s1: () => fit(boxPts(-1.0, 1.0, 0, DT, Z0 - 0.5, Z0 + 0.5), [0.3, 0.22, 1], [130, 640, 900, 1400]),
  s2: () => fit(boxPts(-2.5, 2.5, 0, DT, Z0 - 0.5, Z0 + 0.5), [0.12, 0.25, 1], [100, 660, 920, 1380]),
  s3: () => fit(boxPts(-1.6, 1.0, 0, DT, Z0 - 0.5, Z0 + 0.9), [0.25, 0.2, 1], [110, 640, 910, 1400]),
  s4: () => fit(boxPts(-0.8, 0.8, STAND_TOP + 0.75, DT, Z0 - 0.1, Z0 + 0.3), [0.05, 0.08, 1], [110, 700, 910, 1250]),
  s5: () => fit(boxPts(-1.0, 1.0, STAND_TOP - 0.3, DT, Z0 - 0.5, Z0 + 0.5), [-0.3, 0.15, 1], [120, 660, 900, 1380]),
  s6: () => fit(boxPts(-1.4, 2.2, 0, DT, Z0 - 0.8, Z0 + 0.5), [0.2, 0.2, 1], [100, 660, 920, 1380]),
  s7: () => fit(boxPts(-1.0, 1.0, 0, DT, Z0 - 0.5, Z0 + 0.5), [0.45, 0.3, 1], [160, 1000, 880, 1550]),
  s8: () => fit(boxPts(-0.75, 0.75, 0, 1.4, -0.4, 0.4), [0, 0.15, 1], [400, 470, 620, 650]),
};
const shotCache = {};
const yAxis = V(0, 1, 0);
function shoot(id, u, d) {
  const s = shotCache[id] || (shotCache[id] = SHOTS[id]());
  const k = cl(u / Math.max(0.5, d));
  const swoop = 1 - sm(-LEAD, 0.35, u);
  const dir = s.dir.clone().applyAxisAngle(yAxis, lerp(-0.08, 0.1, k) + 0.35 * swoop * swoop);
  place(s.look, dir, s.dist * lerp(1.05, 1.0, k) * (1 + 0.25 * swoop * swoop));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- HUD overlay (full res) ----------
const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff8a1a", WHITE = "#ffffff", YELLOW = "#ffd84a", INK = "#0b0820";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
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
  X = cl(X, 70 + w / 2, 940 - w / 2); Y = cl(Y, 300, 1500);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(0,0,0,0.45)"; x.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
  x.fillStyle = "rgba(11,8,32,0.9)"; x.fillRect(-w / 2, -h / 2, w, h);
  x.lineWidth = 6; x.strokeStyle = color; x.strokeRect(-w / 2, -h / 2, w, h);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function ring(X, Y, r, c, a, handle = false) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  for (const [lw, col] of [[22, INK], [11, c]]) {
    x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
    if (handle) { x.lineWidth = lw * 1.8; x.beginPath(); x.moveTo(X + r * 0.72, Y + r * 0.72); x.lineTo(X + r * 1.3, Y + r * 1.3); x.stroke(); }
  }
  x.restore();
}
function line(X0, Y0, X1, Y1, c, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  for (const [lw, col] of [[16, INK], [7, c]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.moveTo(X0, Y0); x.lineTo(X1, Y1); x.stroke(); }
  x.restore();
}

// ---------- one frame ----------
function reset() {
  displays.forEach((dp) => { dp.g.visible = false; dp.g.position.set(0, STAND_TOP, Z0); dp.g.scale.setScalar(1); dp.set(); });
  stand.visible = false; stand.position.set(0, 0, Z0); stand.scale.set(1, 1, 1);
  keyG.visible = false; sockG.visible = false; plugG.visible = false; cable.forEach((m) => (m.visible = false));
}
const putDisplay = (i, X, s, o) => { const dp = displays[i]; dp.g.visible = s > 0.01; dp.g.position.set(X, STAND_TOP, Z0); dp.g.scale.setScalar(Math.max(0.001, s)); dp.set(o); return dp; };

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  shoot(id, u, d);
  const U = (w, n) => at(id, w, n);
  const L = {};
  stand.visible = id !== "s8";

  if (id === "s1") {
    const C = sm(U("camera") - 0.1, U("camera") + 0.15, u);
    L.C = C;
    L.dp = putDisplay(0, 0, 1, { red: C * (0.6 + 0.4 * Math.sin(u * 12)) });
  }
  if (id === "s2") {
    stand.scale.set(2.75, 1, 1);
    const Lk = sm(U("camera") - 0.1, U("built") + 0.1, u);
    L.Lk = Lk; L.dps = [];
    [-1.65, 0, 1.65].forEach((X, i) => {
      const k = back(U("smart") - 0.1 + i * 0.15, U("displays") + 0.25 + i * 0.15, u);
      L.dps.push(putDisplay(i, X, 0.85 * k, { scr: i === 1 ? "clock" : i === 0 ? "accounts" : "off", red: Lk }));
    });
  }
  if (id === "s3") {
    const Sg = sm(U("signed") - 0.25, U("signed") + 0.1, u);
    L.Sg = Sg;
    putDisplay(0, 0.2, 1, { scr: Sg > 0.3 ? "accounts" : "clock" });
    const Kk = back(U("rental") - 0.1, U("rental") + 0.25, u);
    keyG.visible = u > U("rental") - 0.1; keyG.position.set(-1.25, 1.75 + 0.06 * Math.sin(u * 4), Z0 + 0.9); keyG.rotation.set(0.2, u * 3, 0); keyG.scale.setScalar(Math.max(0.001, 1.5 * Kk));
  }
  if (id === "s4") {
    const F = sm(U("frame") - 0.1, U("above") + 0.1, u), Ln = sm(U("small") - 0.1, U("lens") + 0.1, u);
    L.F = F; L.Ln = Ln;
    L.dp = putDisplay(0, 0, 1, { red: Ln, frameHex: F > 0.5 ? 0x8a7a20 : 0x2a2660 });
  }
  if (id === "s5") {
    const Sh = sm(U("shutter") - 0.05, U("closed") + 0.15, u), Tn = sm(U("face") - 0.05, U("wall") + 0.25, u);
    L.Sh = Sh; L.Tn = Tn;
    L.dp = putDisplay(0, 0, 1, { shutK: Sh, turn: Tn });
  }
  if (id === "s6") {
    const Uo = sm(U("unplug") - 0.05, U("unplug") + 0.3, u);
    L.Uo = Uo;
    putDisplay(0, -0.2, 1, { scr: Uo > 0.5 ? "off" : "clock" });
    sockG.visible = plugG.visible = true;
    plugG.position.set(1.7 + 0.9 * Uo, 0.75 - 0.35 * Uo, -4.42 + 0.7 * Uo);
    const A = plugG.position.clone().add(V(0, 0, 0.12)), B = V(-0.2, STAND_TOP + 0.2, Z0 - 0.28);
    cable.forEach((m, i) => { const k = i / (cable.length - 1); m.visible = true; m.position.lerpVectors(A, B, k); m.position.y -= Math.sin(Math.PI * k) * (0.5 + 0.4 * Uo); if (m.position.y < 0.03) m.position.y = 0.03; });
  }
  if (id === "s7") putDisplay(0, 0, 1, { shutK: 1, scr: "off" });
  if (id === "s8") {
    const dp = displays[0]; dp.g.visible = true; dp.g.position.set(0, 0, 0); dp.set({ shutK: 0 }); dp.g.rotation.y = Math.sin(u * 1.6) * 0.6;
  }
  renderer.render(scene, camera);
  present();

  // ---------- HUD ----------
  if (id === "s1") {
    const [lx0, ly0] = scr(L.dp.lensWorld());
    line(lx0 + 20, ly0 - 10, lx0 + 170, ly0 - 120, RED, L.C);
    tag("CAMERA", lx0 + 260, ly0 - 150, RED, L.C, 40);
    words(["NEVER FORGET", "IT HAS A CAMERA"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, U("never"))));
  }
  if (id === "s2") {
    const [, ly0] = scr(L.dps[1].lensWorld());
    tag("BUILT IN", CX, ly0 - 110, RED, L.Lk, 44);
    words(["CAMERA", "BUILT IN"], RED, 340, 0.0, 1, 150, flash(u, U("camera")) * 0.6);
  }
  if (id === "s3") {
    const [kx, ky] = scr(keyG.position);
    tag("RENTAL", kx, ky + 120, YELLOW, sm(U("rental") - 0.05, U("rental") + 0.2, u), 38);
    const [sx, sy] = scr(V(0.2, STAND_TOP + 0.2, Z0 + 0.4));
    tag("WHO IS SIGNED IN?", sx, sy + 120, ORANGE, L.Sg, 42);
    const Q = back(U("control") - 0.05, U("control") + 0.3, u);
    if (u > U("control") - 0.05) {
      x.save(); x.translate(800, 1500); x.scale(Math.max(0.01, Q), Math.max(0.01, Q)); x.font = FONT(220); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
      x.lineWidth = 26; x.strokeStyle = INK; x.strokeText("?", 0, 0); x.fillStyle = ORANGE; x.fillText("?", 0, 0); x.restore();
    }
    words(["NOT YOUR", "ACCOUNT"], RED, 360, 0.0, 1, 150, flash(u, U("signed")) * 0.6);
  }
  if (id === "s4") {
    const [lx0, ly0] = scr(L.dp.lensWorld());
    const rx = lerp(lx0 - 280, lx0, L.Ln), ry = lerp(ly0 + 260, ly0, Math.max(L.F * 0.7, L.Ln));
    ring(rx, ry, 80, GREEN, sm(U("frame") - 0.2, U("frame"), u), true);
    tag("SMALL LENS", CX, ly0 - 150, RED, L.Ln, 44);
    words(["FIND", "THE LENS"], GREEN, 330, 0.0, 1, 150, flash(u, U("lens")) * 0.6);
  }
  if (id === "s5") {
    const [lx0, ly0] = scr(L.dp.lensWorld());
    tag("SHUTTER", lx0 + 120, ly0 - 120, GREEN, L.Sh * (1 - L.Tn), 40);
    tag("OR FACE THE WALL", CX, 1440, GREEN, L.Tn, 44);
    words(["CLOSE THE", "SHUTTER"], GREEN, 330, 0.0, 1, 150, flash(u, U("closed")) * 0.6);
  }
  if (id === "s6") {
    const [px0, py0] = scr(plugG.position);
    tag("UNPLUGGED", px0, py0 - 130, GREEN, L.Uo, 38);
    tag("FOR YOUR STAY", CX, 1440, GREEN, sm(U("stay") - 0.1, U("stay") + 0.2, u), 48);
    words(["UNPLUG IT"], GREEN, 330, 0.0, 1, 160, flash(u, U("unplug")) * 0.6);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(11,8,32,0.5)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SHUTTER CLOSED."], ORANGE, 560, 0.0, 1, 130, flash(u, 0.05));
    words(["UNPLUGGED."], ORANGE, 750, U("unplugged") - 0.05, 1, 150, flash(u, U("unplugged") + 0.1));
  }
  if (id === "s8") {
    const g = x.createRadialGradient(CX, 560, 130, CX, 560, 900);
    g.addColorStop(0, "rgba(11,8,32,0.1)"); g.addColorStop(0.25, "rgba(11,8,32,0.72)"); g.addColorStop(1, "rgba(11,8,32,0.82)");
    x.save(); x.fillStyle = g; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    for (const [lw, col] of [[22, INK], [12, VIOLET]]) { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 175, 0, Math.PI * 2); x.stroke(); }
    x.strokeStyle = GREEN; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 205, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 860, 0.15, 1, 130);
    words([c2], VIOLET, 1010, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1170, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["smart-display-ps2"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
