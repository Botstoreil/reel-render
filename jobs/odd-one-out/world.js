// odd-one-out: EXPLAINER 3D style (style test 22.11, style 10). Bright clay/toy three.js: rounded soft shapes,
// matte clay materials with a faint fingerprint bump, blue sky and a simple clay city through the window, a friendly
// clay guest with dot eyes. A hotel bedroom where a USB charger with no phone is the odd one out. No real brands,
// no existing characters. Text is a full-res 2D overlay. Time only from hf-seek.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

// ---------- renderer (half res, antialiased, smooth upscale) ----------
const LW = 540, LH = 960;
const out = document.getElementById("world");
const x = out.getContext("2d");
const glc = document.createElement("canvas"); glc.width = LW; glc.height = LH;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(LW, LH, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
function present(dim = 0) {
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  x.drawImage(glc, 0, 0, 1080, 1920);
  const v = x.createRadialGradient(540, 960, 650, 540, 960, 1300);
  v.addColorStop(0, "rgba(20,30,60,0)"); v.addColorStop(1, `rgba(20,30,60,${0.28 + dim * 0.3})`);
  x.fillStyle = v; x.fillRect(0, 0, 1080, 1920);
  if (dim > 0) { x.fillStyle = `rgba(14,18,40,${dim})`; x.fillRect(0, 0, 1080, 1920); }
}

// ---------- world: a bright clay hotel bedroom ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0ff);
const camera = new THREE.PerspectiveCamera(36, LW / LH, 0.05, 100);
const hemi = new THREE.HemisphereLight(0xcfeaff, 0xf2d6b0, 1.5); scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff3e0, 2.2);
key.position.set(-3, 8, 6); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 8; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
scene.add(key);
const KEYI = 2.2, HEMII = 1.5;

// faint clay fingerprint bump shared by every material
const bump = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  g.fillStyle = "#808080"; g.fillRect(0, 0, 256, 256);
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) { const v = 110 + rnd() * 40; g.fillStyle = `rgba(${v},${v},${v},0.35)`; g.beginPath(); g.arc(rnd() * 256, rnd() * 256, 2 + rnd() * 7, 0, Math.PI * 2); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
})();
const clay = (hex, r = 0.9, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, bumpMap: bump, bumpScale: 0.6, ...extra });
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const add = (m, parent = scene) => { m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
const rbox = (w, h, d, r, mat, parent = scene) => add(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat), parent);

const WALL_Z = -4;
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), clay(0xf0c79a)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const rug = rbox(2.6, 0.04, 1.8, 0.02, clay(0x7fc8a9)); rug.position.set(0.4, 0.02, -0.9);
  // back wall with a window hole: four slabs around the opening
  const wm = clay(0xfff1dc);
  const WX = -1.5, WY = 2.35, WW = 2.2, WH = 1.5;
  const slab = (w, h, cx, cy) => { const m = rbox(w, h, 0.3, 0.05, wm); m.position.set(cx, cy, WALL_Z - 0.15); };
  slab(WX - WW / 2 + 5, 6, (-5 + WX - WW / 2) / 2, 3);
  slab(5 - (WX + WW / 2), 6, (WX + WW / 2 + 5) / 2, 3);
  slab(WW, WY - WH / 2, WX, (WY - WH / 2) / 2);
  slab(WW, 6 - (WY + WH / 2), WX, (WY + WH / 2 + 6) / 2);
  const fm = clay(0x5b8def);
  for (const [w, h, cx, cy] of [[WW + 0.2, 0.12, WX, WY + WH / 2], [WW + 0.2, 0.16, WX, WY - WH / 2], [0.12, WH, WX - WW / 2, WY], [0.12, WH, WX + WW / 2, WY], [0.07, WH, WX, WY]]) { const f = rbox(w, h, 0.2, 0.04, fm); f.position.set(cx, cy, WALL_Z + 0.02); }
  // outside: a simple clay city on a hill under blue sky
  const cityM = [0xff9f7a, 0xffd36e, 0x9ad0ff, 0xc6a6ff, 0x8fe0b0];
  for (let i = 0; i < 9; i++) { const h = 1.2 + ((i * 37) % 5) * 0.45; const b = rbox(0.9, h, 0.9, 0.18, clay(cityM[i % 5])); b.position.set(-4.2 + i * 0.85, 0.8 + h / 2, -9 - (i % 3) * 0.8); }
  const hill = add(new THREE.Mesh(new THREE.SphereGeometry(6, 32, 16), clay(0x86d27a))); hill.scale.set(2, 0.35, 1); hill.position.set(-1, -1.5, -11); // round 1: hill filled the whole window green
  for (const [cx, cy] of [[-2.6, 4.6], [0.4, 5.2]]) { const g = new THREE.Group(); for (const [dx, r] of [[0, 0.5], [0.5, 0.4], [-0.5, 0.38]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), clay(0xffffff, 1)); s.position.x = dx; g.add(s); } g.position.set(cx, cy, -12); scene.add(g); }
}
// bed under the window
const bedG = new THREE.Group(); scene.add(bedG);
{
  rbox(2.0, 0.4, 2.6, 0.12, clay(0x9a6b4f), bedG).position.set(0, 0.2, 0);
  rbox(1.9, 0.3, 2.5, 0.14, clay(0xffffff), bedG).position.set(0, 0.55, 0);
  rbox(1.95, 0.14, 1.6, 0.07, clay(0xff7f6e), bedG).position.set(0, 0.74, 0.45);
  for (const s of [-0.45, 0.45]) rbox(0.75, 0.2, 0.45, 0.1, clay(0xfffaf0), bedG).position.set(s, 0.8, -0.9);
  rbox(2.1, 1.2, 0.18, 0.08, clay(0x9a6b4f), bedG).position.set(0, 0.6, -1.32);
  bedG.position.set(-1.5, 0, -2.5);
}
// nightstand + lamp + clock
const NS = V(0.7, 0, -3.55);
{
  rbox(0.9, 0.75, 0.6, 0.08, clay(0xd99a5e)).position.set(NS.x, 0.375, NS.z);
  const knob = add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), clay(0x6b4a2f))); knob.position.set(NS.x, 0.5, NS.z + 0.31);
}
const lampG = new THREE.Group(); scene.add(lampG);
{
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.08, 32), clay(0x4a6fd8)), lampG).position.y = 0.04;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 16), clay(0x4a6fd8)), lampG).position.y = 0.29;
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.24, 0.26, 32, 1, true), clay(0xffe07a, 0.9, { side: THREE.DoubleSide, emissive: 0x6a5000 })), lampG).position.y = 0.55;
  lampG.position.set(NS.x - 0.22, 0.75, NS.z - 0.05);
}
const clockG = new THREE.Group(); scene.add(clockG);
{
  rbox(0.32, 0.2, 0.14, 0.06, clay(0x67c3a6), clockG).position.y = 0.1;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.11), new THREE.MeshBasicMaterial({ color: 0x14302a })); face.position.set(0, 0.1, 0.072); clockG.add(face);
  const c = document.createElement("canvas"); c.width = 128; c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#14302a"; g.fillRect(0, 0, 128, 64); g.fillStyle = "#9dffd8"; g.font = "bold 44px Inter, Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("7:30", 64, 34);
  face.material.map = new THREE.CanvasTexture(c); face.material.color.set(0xffffff);
  clockG.position.set(NS.x + 0.2, 0.75, NS.z + 0.02);
}
// wall socket + the odd one out: a USB charger cube with a cable that goes nowhere
const SOCK = V(2.1, 0.55, WALL_Z + 0.01);
{
  rbox(0.34, 0.5, 0.05, 0.04, clay(0xffffff, 0.7)).position.copy(SOCK).add(V(0, 0, 0.025));
}
const chG = new THREE.Group(); scene.add(chG);
const chMat = clay(0xf7f7f2, 0.75);
const lensDot = new THREE.Mesh(new THREE.CircleGeometry(0.03, 32), new THREE.MeshBasicMaterial({ color: 0x0a0a10, transparent: true, opacity: 0 }));
const lensRing3 = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.012, 12, 40), new THREE.MeshBasicMaterial({ color: 0xff3b4a, transparent: true, opacity: 0 }));
{
  rbox(0.26, 0.26, 0.24, 0.06, chMat, chG).position.set(0, 0, 0.12);
  const port = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.035, 0.01, 2, 0.008), new THREE.MeshBasicMaterial({ color: 0x1a1a22 })); port.position.set(0, -0.07, 0.245); chG.add(port);
  lensDot.position.set(0, 0.05, 0.243); chG.add(lensDot);
  lensRing3.position.set(0, 0.05, 0.245); chG.add(lensRing3);
  // a cable from the port that hangs down and ends in a loose plug on the floor
  const cur = new THREE.CatmullRomCurve3([V(0, -0.07, 0.25), V(0.02, -0.2, 0.36), V(0.06, -0.45, 0.42), V(0.12, -0.52, 0.55), V(0.22, -0.53, 0.68)]);
  add(new THREE.Mesh(new THREE.TubeGeometry(cur, 40, 0.014, 10, false), clay(0xfafafa, 0.6)), chG);
  rbox(0.05, 0.03, 0.09, 0.012, clay(0xd0d0d0, 0.6), chG).position.set(0.24, -0.53, 0.72);
}
function placeCharger(out = 0, turn = 0) {
  chG.position.copy(SOCK).add(V(0.55 * out, -0.41 * out, 0.4 * out)); // unplugged = set down on the floor, not floating
  chG.rotation.set(0, Math.PI * turn, 0);
  chG.updateMatrixWorld(true);
}
// a ghost phone (s2: "a charger with no phone")
const ghost = new THREE.Group(); scene.add(ghost);
{
  const geo = new RoundedBoxGeometry(0.34, 0.66, 0.05, 3, 0.05);
  ghost.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xff5a64, transparent: true, opacity: 0.18, depthWrite: false })));
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.34, 0.66, 0.05)), new THREE.LineDashedMaterial({ color: 0xff3b4a, dashSize: 0.05, gapSize: 0.035, transparent: true }));
  e.computeLineDistances(); ghost.add(e);
  ghost.position.set(SOCK.x - 0.6, 0.55, WALL_Z + 0.3);
}
// ceiling with two smoke detectors (s2)
const ceilG = new THREE.Group(); scene.add(ceilG);
const ledMats = [];
{
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), clay(0xfff6ea)); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 3.8, -2); ceil.receiveShadow = false; ceilG.add(ceil);
  for (const sx of [-0.65, 0.65]) {
    const d = new THREE.Group(); ceilG.add(d);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.1, 40), clay(0xffffff, 0.8)), d).position.y = -0.05;
    add(new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), clay(0xf1f1f1, 0.8)), d).position.y = -0.1;
    const lm = new THREE.MeshBasicMaterial({ color: 0xff2a3a }); ledMats.push(lm);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), lm); led.position.set(0.12, -0.3, 0.12); d.add(led);
    d.position.set(sx, 3.8, -2.4);
  }
}
// the guest: a friendly clay figure with dot eyes
const guest = new THREE.Group(); scene.add(guest);
const head = new THREE.Group();
{
  const shirt = clay(0x5b8def), skin = clay(0xffc9a0), pants = clay(0x34406b);
  for (const s of [-0.12, 0.12]) add(new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.5, 6, 16), pants), guest).position.set(s, 0.35, 0);
  add(new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.45, 8, 24), shirt), guest).position.y = 1.05;
  for (const s of [-1, 1]) { const a = add(new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.45, 6, 16), shirt), guest); a.position.set(s * 0.34, 1.05, 0.02); a.rotation.z = s * 0.18; }
  head.position.y = 1.72; guest.add(head);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.27, 32, 24), skin), head);
  const hair = add(new THREE.Mesh(new THREE.SphereGeometry(0.285, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), clay(0x3a2a20)), head); hair.position.y = 0.02;
  for (const s of [-0.09, 0.09]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0x15121a })); e.position.set(s, 0.03, 0.25); head.add(e); }
  const cheek = clay(0xff9a8a); for (const s of [-0.16, 0.16]) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), cheek); c.scale.set(1, 0.6, 0.4); c.position.set(s, -0.06, 0.23); head.add(c); }
  guest.position.set(0.55, 0, -1.2);
}
// view cone from the charger to the bed (s4)
const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0x3fd98a, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
cone.geometry.translate(0, -0.5, 0); cone.geometry.rotateX(-Math.PI / 2);
scene.add(cone);

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
    let lo = 0.2, hi = 60;
    for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; place(look, dir, mid); const b = bbox(pts); if (b.w <= bw && b.h <= bh) hi = mid; else lo = mid; }
    dist = hi; place(look, dir, dist);
    const b = bbox(pts), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, ppu = 960 / hh;
    const right = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 0), up = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 1);
    look.addScaledVector(right, (b.cx - cx) / ppu).addScaledVector(up, -(b.cy - cy) / ppu);
  }
  return { look, dir, dist };
}
const WIDE = boxPts(-2.6, 2.4, 0, 3.1, WALL_Z, -0.6);
const CH = boxPts(SOCK.x - 0.2, SOCK.x + 0.2, SOCK.y - 0.28, SOCK.y + 0.25, WALL_Z, WALL_Z + 0.3);
const SHOTS = {
  s1: () => fit(WIDE, [0.18, 0.32, 1], [70, 600, 1010, 1440]),
  s2: () => fit(boxPts(-1.0, 1.0, 3.4, 3.8, -2.75, -2.05), [0, -0.75, 1], [130, 640, 950, 1240]),
  s2b: () => fit(boxPts(SOCK.x - 0.8, SOCK.x + 0.4, 0.0, 0.9, WALL_Z, WALL_Z + 0.75), [0.05, 0.2, 1], [130, 620, 950, 1420]),
  s3: () => fit(CH, [0.22, 0.08, 1], [230, 620, 850, 1250]),
  s4: () => fit(WIDE, [-0.22, 0.42, 1], [70, 620, 1010, 1440]),
  s5: () => fit(CH, [-0.25, 0.1, 1], [250, 640, 830, 1250]),
  s6: () => fit(boxPts(SOCK.x - 0.4, SOCK.x + 0.8, 0.0, 0.9, WALL_Z, WALL_Z + 0.9), [0.3, 0.15, 1], [140, 600, 940, 1300]),
  s7: () => fit(WIDE, [0.0, 0.3, 1], [70, 600, 1010, 1440]),
  s8: () => fit(CH, [0.1, 0.1, 1], [380, 350, 700, 710]),
};
const ORBIT = { s1: 0.16, s2: 0.2, s2b: 0.12, s3: 0.14, s4: -0.14, s5: 0.12, s6: -0.1, s7: 0.08, s8: 0.3 };
const shotCache = {};
const yAxis = V(0, 1, 0);
function shoot(key, u, d) {
  const s = shotCache[key] || (shotCache[key] = SHOTS[key]());
  const k = sm(-0.2, Math.max(0.6, d) + 0.2, u);
  const dir = s.dir.clone().applyAxisAngle(yAxis, lerp(-0.5, 0.5, k) * ORBIT[key]);
  place(s.look, dir, s.dist * lerp(1.06, 0.98, k));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay ----------
const RED = "#ff4d5a", GREEN = "#2fd27a", BLUE = "#3d6fe0", ORANGE = "#ff8a2a", WHITE = "#ffffff", INK = "#14183a";
const CX = 540;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
let curU = 0;
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (860 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.06, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.53;
    parts.forEach((p, i) => {
      const s0 = t0 + wi * 0.07, k = back(s0, s0 + 0.35, curU), o = sm(s0, s0 + 0.14, curU);
      const s = 0.55 + 0.45 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 30); x.scale(s, s); x.globalAlpha = a * o;
      x.shadowColor = "rgba(20,24,58,0.45)"; x.shadowBlur = 0; x.shadowOffsetY = 10;
      x.lineWidth = Math.max(10, px * 0.13); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.shadowColor = "transparent"; x.shadowOffsetY = 0;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(p, 0, 0);
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
  const w = x.measureText(txt).width + 54, h = px * 1.6, s = 0.6 + 0.4 * back(0, 1, cl(a));
  X = cl(X, 70 + w / 2, 1010 - w / 2); Y = cl(Y, 300, 1440);
  x.translate(X, Y); x.scale(s, s);
  x.shadowColor = "rgba(20,24,58,0.35)"; x.shadowOffsetY = 8;
  x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h / 2); x.fillStyle = color; x.fill();
  x.shadowColor = "transparent"; x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function qmark(X, Y, s, a, c) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s);
  x.beginPath(); x.arc(0, 0, 62, 0, Math.PI * 2); x.fillStyle = c; x.shadowColor = "rgba(20,24,58,0.35)"; x.shadowOffsetY = 8; x.fill();
  x.shadowColor = "transparent"; x.lineWidth = 7; x.strokeStyle = INK; x.stroke();
  x.fillStyle = WHITE; x.font = FONT(86); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("?", 0, 5); x.restore();
}
function lensRing(X, Y, r, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineCap = "round";
  x.strokeStyle = INK; x.lineWidth = 34; x.beginPath(); x.moveTo(X + r * 0.72, Y + r * 0.72); x.lineTo(X + r * 1.55, Y + r * 1.55); x.stroke();
  x.strokeStyle = c; x.lineWidth = 22; x.stroke();
  x.strokeStyle = INK; x.lineWidth = 22; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
  x.strokeStyle = c; x.lineWidth = 13; x.stroke();
  x.restore();
}

// ---------- one frame ----------
function reset() {
  ceilG.visible = false; ghost.visible = false; cone.visible = false; guest.visible = true;
  chMat.color.set(0xf7f7f2); chMat.emissive.set(0x000000);
  lensDot.material.opacity = 0; lensRing3.material.opacity = 0;
  placeCharger(0, 0);
  guest.rotation.set(0, 0.35, 0); head.rotation.set(0, 0, 0);
  key.intensity = KEYI; hemi.intensity = HEMII;
}
const CHP = () => chG.localToWorld(V(0, 0, 0.25));
const LENSP = () => chG.localToWorld(V(0, 0.05, 0.25));

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  const U = (w, n) => at(id, w, n);
  let dim = 0;
  const L = {};
  let shotKey = id;
  if (id === "s2" && u >= U("charger") - 0.12) shotKey = "s2b";
  shoot(shotKey, u, d);
  // gentle idle bob for the guest
  guest.position.y = 0.015 * Math.sin(t * 3.1);

  if (id === "s1") {
    const B = sm(U("belong") - 0.15, U("belong") + 0.1, u);
    chMat.color.set(0xf7f7f2).lerp(new THREE.Color(0xff6b74), B);
    const p = 1 + 0.25 * Math.sin(Math.PI * sm(U("belong") - 0.1, U("belong") + 0.4, u));
    chG.scale.setScalar(p);
    head.rotation.y = 0.55 * sm(U("thing") - 0.2, U("belong"), u);
    L.B = B;
  } else chG.scale.setScalar(1);
  if (id === "s2") {
    ceilG.visible = shotKey === "s2";
    head.rotation.x = -0.45; // the guest looks up at the detectors
    const blink = (u * 2) % 1 > 0.5 ? 1 : 0;
    ledMats[0].color.set(blink ? 0xff2a3a : 0x55151a); ledMats[1].color.set(blink ? 0x55151a : 0xff2a3a);
    if (shotKey === "s2b") {
      ghost.visible = true;
      const G = sm(U("no") - 0.1, U("phone") + 0.1, u);
      ghost.children[0].material.opacity = 0.2 * G; ghost.children[1].material.opacity = G;
      ghost.position.y = 0.55 + 0.03 * Math.sin(u * 4);
      chMat.color.set(0xff6b74);
    }
  }
  if (id === "s3") {
    chMat.color.set(0xff8a90);
    const Lk = sm(U("hide") - 0.05, U("camera") + 0.1, u);
    lensDot.material.opacity = Lk; lensRing3.material.opacity = Lk;
    lensRing3.scale.setScalar(1 + 0.25 * Math.sin(u * 8) * Lk);
    guest.visible = false;
  }
  if (id === "s4") {
    const F = sm(U("faces") - 0.25, U("faces") + 0.2, u);
    head.rotation.y = lerp(-0.4, 0.6, sm(U("why") - 0.2, U("why") + 0.6, u));
    const src = CHP(), target = V(-1.5, 0.75, -2.0);
    cone.visible = F > 0.01; cone.material.opacity = 0.22 * F;
    cone.position.copy(src); cone.lookAt(target);
    const len = src.distanceTo(target);
    cone.scale.set(0.75 * F, 0.75 * F, len * F);
    if (F > 0.5) chMat.color.set(0xa8f0c8);
    L.F = F;
  }
  if (id === "s5") {
    lensDot.material.opacity = 0.9 * sm(U("plugged") - 0.1, U("plugged") + 0.15, u);
    L.M = sm(U("look") - 0.05, U("closer") + 0.15, u);
    guest.visible = false;
  }
  if (id === "s6") {
    const O = sm(U("unplug") - 0.05, U("unplug") + 0.35, u);
    const T = sm(U("turn") - 0.05, U("wall") + 0.1, u);
    placeCharger(O, T);
    lensDot.material.opacity = 0.9;
    guest.visible = false;
  }
  if (id === "s7") { dim = 0.45; key.intensity = KEYI * 0.8; }
  if (id === "s8") { dim = 0.6; guest.visible = false; lensDot.material.opacity = 0.9; chG.rotation.y = 0.5 * Math.sin(u * 1.4); }
  renderer.render(scene, camera);
  present(dim);

  // ---------- overlay ----------
  if (id === "s1") {
    const [cx2, cy2] = scr(CHP());
    qmark(cx2, cy2 - 150, back(U("belong") - 0.05, U("belong") + 0.3, u), L.B, RED);
    words(["NEVER IGNORE", "THE ODD ONE OUT"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, U("never"))));
  }
  if (id === "s2") {
    const ch = U("charger");
    if (shotKey === "s2") {
      tag("SMALL ROOM", CX, 1360, RED, sm(U("small") - 0.1, U("room") + 0.1, u), 46);
      words(["TWO DETECTORS?"], RED, 360, 0.0, 1, 130, flash(u, U("two")) * 0.6);
    } else {
      const [gx, gy] = scr(ghost.position);
      tag("NO PHONE", gx, gy + 230, RED, sm(U("phone") - 0.1, U("phone") + 0.15, u), 44);
      words(["NO PHONE?"], RED, 360, ch - 0.05, 1, 150, flash(u, U("phone")) * 0.6);
    }
  }
  if (id === "s3") {
    tag("NOBODY NEEDS IT", CX, 1400, RED, sm(U("nobody") - 0.1, U("needs") + 0.1, u) * (1 - sm(U("easy") - 0.1, U("easy"), u)), 44);
    tag("EASY HIDING SPOT", CX, 1400, RED, sm(U("easy") - 0.05, U("place") + 0.1, u), 44);
    words(["EASY PLACE", "TO HIDE"], RED, 360, 0.0, 1, 150, flash(u, U("camera")) * 0.6);
  }
  if (id === "s4") {
    const pts = [clockG.localToWorld(V(0, 0.3, 0)), lampG.localToWorld(V(0, 0.8, 0)), chG.localToWorld(V(0, 0.25, 0.12))];
    pts.forEach((p, i) => {
      const [X, Y] = scr(p); const t0 = U("why") - 0.05 + i * 0.14;
      qmark(X, Y - 70, 0.75 * back(t0, t0 + 0.3, u), sm(t0, t0 + 0.1, u) * (1 - 0.6 * L.F * (i < 2 ? 1 : 0)), i === 2 ? GREEN : BLUE);
    });
    tag("WHAT IT FACES", CX, 1400, GREEN, L.F, 44);
    words(["WHY IS", "IT HERE?"], GREEN, 360, 0.0, 1, 150, flash(u, U("why")) * 0.6);
  }
  if (id === "s5") {
    const [dx, dy] = scr(LENSP());
    lensRing(lerp(dx + 260, dx, L.M), lerp(dy + 330, dy, L.M), 95, L.M, GREEN);
    tag("DON'T NEED IT?", CX, 1400, GREEN, sm(U("need") - 0.15, U("need") + 0.1, u), 46);
    words(["LOOK", "CLOSER"], GREEN, 360, 0.0, 1, 150, flash(u, U("closer")) * 0.6);
  }
  if (id === "s6") {
    tag("OR TURN IT TO THE WALL", CX, 1400, GREEN, sm(U("turn") - 0.1, U("wall") + 0.1, u) * (1 - sm(U("tell") - 0.2, U("tell"), u)), 40);
    tag("TELL THE HOST", CX, 1400, GREEN, sm(U("tell") - 0.05, U("host") + 0.15, u), 50);
    words(["UNPLUG IT"], GREEN, 360, 0.0, 1, 160, flash(u, U("unplug")) * 0.6);
  }
  if (id === "s7") {
    words(["DOESN'T BELONG?"], ORANGE, 690, 0.0, 1, 130, flash(u, 0.05));
    words(["LOOK CLOSER."], ORANGE, 880, U("look") - 0.05, 1, 150, flash(u, U("closer")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = back(0.0, 0.4, u);
    x.save(); x.translate(CX, 530); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    x.strokeStyle = INK; x.lineWidth = 22; x.beginPath(); x.arc(0, 0, 220, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "#8fb0ff"; x.lineWidth = 12; x.stroke();
    x.strokeStyle = GREEN; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.arc(0, 0, 252, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 870, 0.15, 1, 130);
    words([c2], "#8fb0ff", 1020, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1165, GREEN, sm(0.5, 0.75, u), 50); // clear of the caption pill at ~1290
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["odd-one-out-explainer3d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
