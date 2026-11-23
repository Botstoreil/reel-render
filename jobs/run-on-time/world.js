// run-on-time (YogaFlow 28): TOY BRICKS style. A yoga studio built from glossy plastic studded bricks in three.js, soft
// studio light, 12 fps stop-motion steps. Generic blocky figures (no brand, logo or figure design). Wall clock tells the
// time; the class plan is a toy-plate bar on the overlay canvas. Screen text only on the overlay. Time only from hf-seek.
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
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };
const STEP = 12;
const q = (t) => Math.floor(t * STEP + 1e-6) / STEP;
const st = (k, n = 6) => Math.floor(cl(k) * n + 1e-6) / n;
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- renderer / studio ----------
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3ece2);
const camera = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b98f, 1.25));
const key = new THREE.DirectionalLight(0xfff3e0, 2.4);
key.position.set(7, 13, 10); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
key.shadow.bias = -0.0006; key.shadow.radius = 4;
scene.add(key);
const fillL = new THREE.DirectionalLight(0xdfe9ff, 0.7); fillL.position.set(-9, 6, 7); scene.add(fillL);

// ---------- bricks ----------
const P = 0.8;
const geoCache = {};
const rbox = (w, h, d) => { const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`; return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.06, w / 4, h / 4, d / 4))); };
const studGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 20);
const matCache = {};
const plastic = (hex) => matCache[hex] || (matCache[hex] = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.12 }));
const C = { red: 0xd62828, blue: 0x1f5fd6, yellow: 0xf6b700, green: 0x2ea043, white: 0xf5f5f2, brown: 0x8a5a2b, tan: 0xd9c7a0, cream: 0xf1e6cf, cream2: 0xe8d9bd, dark: 0x22222a, purple: 0x7c4dcc, orange: 0xf08a24, teal: 0x4fb3a5, pink: 0xe58fb0, violet: 0x9a86e0 };

function shade(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function brick(w, h, d, hex, studs = true) {
  const g = new THREE.Group();
  const m = shade(new THREE.Mesh(rbox(w - 0.02, h, d - 0.02), plastic(hex)));
  m.position.y = h / 2; g.add(m);
  if (studs) {
    const nx = Math.max(1, Math.round(w / P)), nz = Math.max(1, Math.round(d / P));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const s = shade(new THREE.Mesh(studGeo, plastic(hex)));
      s.position.set((i - (nx - 1) / 2) * (w / nx), h + 0.085, (j - (nz - 1) / 2) * (d / nz));
      g.add(s);
    }
  }
  return g;
}
function at3(o, x, y, z) { o.position.set(x, y, z); return o; }
const V = (a, b, c) => new THREE.Vector3(a, b, c);

// baseplate floor
{
  const NX = 26, NZ = 14, w = NX * P, d = NZ * P, cz = 0.9;
  const plate = shade(new THREE.Mesh(rbox(w, 0.32, d), plastic(C.tan)));
  plate.position.set(0, -0.16, cz); scene.add(plate);
  const inst = new THREE.InstancedMesh(studGeo, plastic(C.tan), NX * NZ);
  const M = new THREE.Matrix4(); let n = 0;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { M.makeTranslation((i - (NX - 1) / 2) * P, 0.085, cz + (j - (NZ - 1) / 2) * P); inst.setMatrixAt(n++, M); }
  inst.receiveShadow = true; scene.add(inst);
}
// back wall, staggered warm bricks
{
  const bw = 1.6, bh = 0.96, bd = 0.8, rows = 10, cols = 14;
  const inst = new THREE.InstancedMesh(rbox(bw - 0.03, bh - 0.03, bd), plastic(0xffffff), rows * (cols + 1));
  const M = new THREE.Matrix4(), col = new THREE.Color(); let n = 0; const r = rng(11);
  for (let y = 0; y < rows; y++) for (let c = 0; c <= cols; c++) {
    const xo = (c - cols / 2) * bw + (y % 2 ? bw / 2 : 0);
    M.makeTranslation(xo, y * bh + bh / 2, -3.0); inst.setMatrixAt(n, M);
    inst.setColorAt(n, col.set(r() < 0.5 ? C.cream : C.cream2)); n++;
  }
  inst.count = n; inst.receiveShadow = true; scene.add(inst);
}
// a plant in the corner (decor)
{
  const g = new THREE.Group();
  g.add(brick(0.8, 0.8, 0.8, C.orange));
  g.add(at3(brick(0.24, 1.4, 0.24, C.green, false), 0, 0.8, 0));
  g.add(at3(brick(0.8, 0.24, 0.24, C.green, false), 0.2, 1.7, 0));
  g.add(at3(brick(0.24, 0.24, 0.8, C.green, false), 0, 2.0, 0.1));
  g.position.set(-4.2, 0, -2.0); scene.add(g);
}

// ---------- mats + figures ----------
const MAT_TOP = 0.09, MAT_Z = 1.9;
const STUDENTS = [
  { x: -2.8, shirt: C.blue, skin: 0xf1c27d, mat: C.teal },
  { x: -0.6, shirt: C.orange, skin: 0xc68642, mat: C.pink },
  { x: 1.6, shirt: C.yellow, skin: 0xe0ac69, mat: C.violet },
];
STUDENTS.forEach((s) => scene.add(at3(brick(1.4, 0.09, 3.2, s.mat, false), s.x, 0, MAT_Z)));

function figure(shirt, skin, hair = C.dark, pants = 0x3b3b52) {
  const g = new THREE.Group();
  const leg = (sx) => { const L = new THREE.Group(); L.position.set(sx, 0.9, 0); L.add(at3(brick(0.34, 0.9, 0.4, pants, false), 0, -0.9, 0)); g.add(L); return L; };
  const legL = leg(-0.19), legR = leg(0.19);
  const up = new THREE.Group(); up.position.y = 0.9; g.add(up);
  up.add(brick(0.86, 0.8, 0.46, shirt, false));
  const head = shade(new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 14), plastic(skin))); head.position.y = 1.12; up.add(head);
  const cap = shade(new THREE.Mesh(new THREE.SphereGeometry(0.295, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), plastic(hair))); cap.position.set(0, 1.14, -0.02); up.add(cap);
  const arm = (sx) => {
    const A = new THREE.Group(); A.position.set(sx, 0.74, 0);
    A.add(at3(brick(0.22, 0.78, 0.26, shirt, false), 0, -0.78, 0));
    const hand = shade(new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), plastic(skin))); hand.position.y = -0.86; A.add(hand);
    up.add(A); return A;
  };
  const armL = arm(-0.55), armR = arm(0.55);
  g.userData = { legL, legR, up, armL, armR };
  return g;
}
function pose(f, { up = 0, bend = 0, walk = 0 } = {}) {
  const u = f.userData;
  u.armR.rotation.z = up * Math.PI * 0.92; u.armL.rotation.z = -up * Math.PI * 0.92;
  u.up.rotation.z = bend;
  u.legL.rotation.x = 0.5 * Math.sin(walk); u.legR.rotation.x = -0.5 * Math.sin(walk);
  u.armL.rotation.x = -0.4 * Math.sin(walk) * (1 - up); u.armR.rotation.x = 0.4 * Math.sin(walk) * (1 - up);
}
const figs = STUDENTS.map((s) => { const f = figure(s.shirt, s.skin); scene.add(f); return f; });
const teacher = figure(C.purple, 0xf1c27d, 0x5a3a1a);
const TEACH = V(3.9, 0, 0.2);
scene.add(teacher);

// stand (k=1) or lie on the back on the mat (k=0), head toward the wall
function lie(f, s, k) {
  const kk = st(k, 4);
  f.rotation.set(-Math.PI / 2 * (1 - kk), 0, 0);
  f.position.set(s.x, lerp(MAT_TOP + 0.24, MAT_TOP, kk), lerp(MAT_Z + 1.35, MAT_Z + 0.6, kk));
}

// ---------- wall clock ----------
const CLOCK = V(0.6, 4.4, -2.52), CR = 0.85;
const clockG = new THREE.Group(); clockG.position.copy(CLOCK); scene.add(clockG);
{
  const face = shade(new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, 0.12, 44), plastic(C.white))); face.rotation.x = Math.PI / 2; clockG.add(face);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const big = i === 0;
    const m = shade(new THREE.Mesh(new THREE.CylinderGeometry(big ? 0.11 : 0.06, big ? 0.11 : 0.06, 0.08, 14), plastic(big ? C.green : C.dark)));
    m.rotation.x = Math.PI / 2; m.position.set(Math.sin(a) * CR * 0.8, Math.cos(a) * CR * 0.8, 0.08); clockG.add(m);
  }
  const hub = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 14), plastic(C.red))); hub.rotation.x = Math.PI / 2; hub.position.z = 0.16; clockG.add(hub);
}
const rimMat = new THREE.MeshStandardMaterial({ color: C.dark, emissive: 0x000000, emissiveIntensity: 0, roughness: 0.3 });
const rim = shade(new THREE.Mesh(new THREE.TorusGeometry(CR, 0.12, 14, 48), rimMat)); rim.position.z = 0.04; clockG.add(rim);
const minPivot = new THREE.Group(); minPivot.position.z = 0.1; clockG.add(minPivot);
minPivot.add(brick(0.09, CR * 0.76, 0.05, C.dark, false));
const hourPivot = new THREE.Group(); hourPivot.position.z = 0.09; clockG.add(hourPivot);
hourPivot.add(brick(0.13, CR * 0.48, 0.05, C.dark, false));
function setClock(m) {
  minPivot.rotation.z = -(Math.PI * 2 * m) / 60;
  hourPivot.rotation.z = -(Math.PI * 2 * (7 + m / 60)) / 12;
}
function setRim(hex, k) { rimMat.emissive.setHex(hex); rimMat.emissiveIntensity = k; }

// sight cone (teacher -> clock)
function cone(hex) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.visible = false; m.renderOrder = 5; scene.add(m);
  const upv = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  m.set = (A, B, r0, r1, a) => {
    m.visible = a > 0.01; if (!m.visible) return;
    m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(r1, r0, 1, 24, 1, true);
    dir.copy(B).sub(A); const L = dir.length();
    m.position.copy(A).addScaledVector(dir, 0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(upv, dir.normalize());
    m.material.opacity = a;
  };
  return m;
}
const sight = cone(0x2ee66b);

// ---------- framing ----------
const tv = new THREE.Vector3();
function place(look, dir, dist) { camera.position.copy(look).addScaledVector(dir, dist); camera.lookAt(look); camera.updateMatrixWorld(); }
function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { tv.copy(p).project(camera); const X = (tv.x + 1) * 540, Y = (1 - tv.y) * 960; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); } return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
function boxPts(x0, x1, y0, y1, z0, z1) { const o = []; for (const X of [x0, x1]) for (const Y of [y0, y1]) for (const Z of [z0, z1]) o.push(new THREE.Vector3(X, Y, Z)); return o; }
function fit(pts, dirArr, box) {
  const dir = new THREE.Vector3(...dirArr).normalize();
  const look = new THREE.Vector3(); pts.forEach((p) => look.add(p)); look.multiplyScalar(1 / pts.length);
  const bw = box[2] - box[0], bh = box[3] - box[1], cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
  let dist = 12;
  for (let it = 0; it < 5; it++) {
    let lo = 2, hi = 80;
    for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; place(look, dir, mid); const b = bbox(pts); if (b.w <= bw && b.h <= bh) hi = mid; else lo = mid; }
    dist = hi; place(look, dir, dist);
    const b = bbox(pts), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, ppu = 960 / hh;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    look.addScaledVector(right, (b.cx - cx) / ppu).addScaledVector(up, -(b.cy - cy) / ppu);
  }
  return { look, dir, dist };
}
const ROOM = boxPts(-3.6, 4.4, 0, 5.3, -2.0, 3.6);
const SHOTS = {
  s1: () => fit(ROOM, [0.12, 0.35, 1], [90, 650, 940, 1220]),
  s2: () => fit(ROOM, [0.3, 0.3, 1], [90, 650, 940, 1220]),
  s3: () => fit(ROOM, [-0.25, 0.45, 1], [90, 650, 940, 1220]),
  s4: () => fit(ROOM, [0, 0.35, 1], [100, 720, 940, 1220]),
  s5: () => fit(boxPts(-0.8, 4.6, 0, 5.4, -2.6, 1.2), [-0.35, 0.12, 1], [120, 640, 930, 1190]),
  s6: () => fit(ROOM, [0.2, 0.35, 1], [100, 720, 940, 1220]),
  s7: () => fit(ROOM, [-0.12, 0.4, 1], [90, 740, 940, 1220]),
};
SHOTS.s8 = SHOTS.s7;
const shotCache = {};
function shoot(id, k) {
  const s = shotCache[id] || (shotCache[id] = SHOTS[id]());
  place(s.look, s.dir, s.dist * lerp(1.07, 1.0, k));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay text (toy plate labels) ----------
const ov = document.createElement("canvas");
ov.width = 1080; ov.height = 1920;
ov.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:2";
document.getElementById("stage").appendChild(ov);
const x = ov.getContext("2d");
const RED = "#e3242b", GREEN = "#1fae4b", ORANGE = "#ff7a00", WHITE = "#ffffff", INK = "#1b1b2f", VIOL = "#9b85ff", YEL = "#f6b700", BLUE = "#1f5fd6";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (820 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.54;
    parts.forEach((p, i) => {
      const s0 = t0 + wi * 0.08, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      const k = Math.floor(kk * 4 + 1e-6) / 4;
      x.save(); x.translate(X + ws[i] / 2, Y - (1 - k) * 60); x.globalAlpha = a * o;
      x.fillStyle = "rgba(27,27,47,0.35)"; x.fillText(p, 7, 9);
      x.lineWidth = Math.max(10, px * 0.15); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, "#ffffff", flashK * 0.7) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.08;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.5;
  X = cl(X, 60 + w / 2, 930 - w / 2); Y = cl(Y, 300, 1200);
  const s = 0.6 + 0.4 * Math.floor(a * 4) / 4;
  x.globalAlpha = a; x.textAlign = "center"; x.textBaseline = "middle";
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(27,27,47,0.3)"; rr(-w / 2 + 6, -h / 2 + 8, w, h, 10); x.fill();
  x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 6;
  [-w / 4, w / 4].forEach((sx) => { rr(sx - 22, -h / 2 - 14, 44, 18, 6); x.fill(); x.stroke(); });
  rr(-w / 2, -h / 2, w, h, 10); x.fill(); x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  for (const [lw, c] of [[44, INK], [26, color]]) {
    x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
    x.beginPath();
    if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); } else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
    x.stroke();
  }
  x.restore();
}
function ring(X, Y, r, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineWidth = 22; x.strokeStyle = INK; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 12; x.strokeStyle = color; x.stroke(); x.restore();
}
// one block of the class plan: a toy plate with two studs and a label
function block(X0, w, Y, h, color, label, a, dy = 0, rot = 0) {
  if (a <= 0 || w < 4) return;
  const s = 0.6 + 0.4 * Math.floor(cl(a) * 4) / 4;
  x.save(); x.globalAlpha = cl(a); x.translate(X0 + w / 2, Y + dy); x.rotate(rot); x.scale(s, s);
  x.fillStyle = "rgba(27,27,47,0.3)"; rr(-w / 2 + 6, -h / 2 + 8, w, h, 10); x.fill();
  x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 6;
  [-w / 4, w / 4].forEach((sx) => { rr(sx - 16, -h / 2 - 13, 32, 16, 5); x.fill(); x.stroke(); });
  rr(-w / 2 + 2, -h / 2, w - 4, h, 10); x.fill(); x.stroke();
  x.font = FONT(30); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = WHITE; x.fillText(label, 0, 2);
  x.restore();
}
// the plan bar. Units: 0..1 = the class, END line at 1. px = X0 + u * UW
const BX0 = 110, UW = 700, BY = 610, BH = 96;
const BW = 0.145, WARM = 0.22, FLOW0 = WARM, REST0 = WARM + 4 * BW; // rest = 0.8..1.0
function plan(o) {
  const { late = 0, ks = [1, 1, 1], drop = 0, close = 0, restOK = 0, a = 1 } = o;
  if (a <= 0) return;
  const px = (u) => BX0 + u * UW;
  const sh = BW * late; // everything is pushed right by the late minutes
  // END line
  x.save(); x.globalAlpha = a; x.strokeStyle = INK; x.lineWidth = 8; x.setLineDash([18, 12]);
  x.beginPath(); x.moveTo(px(1), BY - 90); x.lineTo(px(1), BY + 80); x.stroke(); x.restore();
  tag("END", px(1), BY - 112, INK, a, 30);
  if (late > 0) block(px(0), BW * UW * late, BY, BH, RED, "LATE", a * late);
  block(px(sh), WARM * UW, BY, BH, YEL, "WARM UP", a * ks[0]);
  for (let i = 0; i < 4; i++) {
    let u0 = FLOW0 + i * BW + sh;
    if (i === 3) u0 -= BW * close;
    if (i === 2) {
      if (drop >= 1) continue;
      block(px(u0), BW * UW, BY, BH, BLUE, "POSE", a * ks[1] * (1 - sm(0.7, 1, drop)), 700 * drop * drop, 0.9 * drop);
    } else block(px(u0), BW * UW, BY, BH, BLUE, "POSE", a * cl(ks[1] * 4 - i));
  }
  const r0 = REST0 + sh - BW * close;
  const restCol = late > 0 && close < 0.5 ? RED : GREEN;
  block(px(r0), (1 - REST0) * UW, BY, BH, restCol, "REST", a * ks[2]);
  if (restOK > 0) ring(px(r0 + (1 - REST0) / 2), BY, 92, restOK, GREEN);
}

// ---------- one frame ----------
function reset() {
  figs.forEach((f, i) => { const s = STUDENTS[i]; f.visible = true; lie(f, s, 1); pose(f); });
  teacher.position.copy(TEACH); teacher.rotation.set(0, -Math.PI / 2, 0); pose(teacher);
  setClock(50); setRim(0x000000, 0);
  sight.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0);
}
const head = (f) => { f.updateMatrixWorld(true); return f.userData.up.localToWorld(V(0, 1.12, 0.1)); };

function frame(t) {
  const tq = q(t);
  const { id, u: uq, d } = sceneOf(tq);
  reset();
  shoot(id, cl(uq / Math.max(0.5, d)));
  const U = (w, n) => at(id, w, n);

  if (id === "s1") {
    // class in a standing pose, the minute hand runs past the green 12 on "late"
    figs.forEach((f) => pose(f, { up: 1 }));
    pose(teacher, { up: 1 });
    const m = 52 + 9 * st(sm(0, U("late") + 0.05, uq), 9);
    setClock(m);
    if (m > 60) setRim(0xff1a1a, 1.6 + 1.5 * flash(uq, U("late") + 0.1));
  }
  if (id === "s2") {
    // one more pose (arms up), then another (side bend); the hand jumps 3 minutes each time
    const p1 = sm(U("one") - 0.05, U("pose") + 0.05, uq), p2 = sm(U("another") - 0.05, U("another") + 0.2, uq);
    figs.forEach((f) => pose(f, { up: st(p1, 3), bend: 0.35 * st(p2, 3) }));
    pose(teacher, { up: st(p1, 3), bend: 0.35 * st(p2, 3) });
    setClock(61 + 3 * st(sm(U("one") - 0.05, U("one") + 0.1, uq), 1) + 3 * st(sm(U("another") - 0.05, U("another") + 0.1, uq), 1));
    setRim(0xff1a1a, 1.6);
  }
  if (id === "s3") {
    // students in final rest, then they jump up on "short" and walk out on "leave"
    setClock(67 + 3 * st(cl(uq / 2.1), 3)); setRim(0xff1a1a, 1.6);
    const upK = sm(U("short") - 0.1, U("short") + 0.2, uq);
    const go = sm(U("leave") - 0.1, U("time") + 0.25, uq);
    figs.forEach((f, i) => {
      const s = STUDENTS[i];
      lie(f, s, upK);
      if (upK >= 1) {
        const g = st(go, 8);
        f.rotation.y = -Math.PI / 2 * st(sm(0, 0.15, go), 2);
        f.position.x = s.x - 3.2 * g;
        pose(f, { walk: go * 18 });
      }
    });
  }
  if (id === "s4") {
    // calm class on the mats while the plan is built
    setClock(40);
  }
  if (id === "s5") {
    setClock(45);
    // the teacher turns to the clock; a green line of sight on "see"
    const turn = st(sm(U("clock") - 0.05, U("where") + 0.1, uq), 4);
    teacher.rotation.y = lerp(-Math.PI / 2, -2.69, turn);
    const sk = sm(U("see") - 0.1, U("see") + 0.1, uq);
    sight.set(head(teacher), CLOCK.clone().add(V(0, 0, 0.2)), 0.08, 0.9, 0.35 * sk);
    setRim(0x22ff66, 1.4 * sk);
  }
  if (id === "s6") {
    // flowing, then down into final rest on "rest"
    setClock(55 + 3 * st(sm(0, U("final"), uq), 3));
    const r = sm(U("final") - 0.1, U("rest") + 0.1, uq);
    figs.forEach((f, i) => { lie(f, STUDENTS[i], 1 - r); pose(f, { up: 1 - st(r, 2) }); });
  }
  if (id === "s7" || id === "s8") {
    figs.forEach((f, i) => lie(f, STUDENTS[i], 0));
    setClock(id === "s7" ? 58 + 2 * st(sm(0, U("end"), uq), 2) : 60);
    setRim(0x22ff66, 1.2);
  }
  renderer.render(scene, camera);

  // ---------- overlay ----------
  const u = t - S[id][0] - LEAD; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const [kx, ky] = scr(CLOCK);
  if (id === "s1") {
    words(["NEVER RUN", "THE CLASS LATE"], RED, 420, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
    const lk = sm(at("s1", "late") - 0.05, at("s1", "late") + 0.15, u);
    ring(kx, ky, 120, lk, RED);
    tag("LATE!", kx + 230, ky, RED, lk, 46);
  }
  if (id === "s2") {
    const ak = sm(at("s2", "another") - 0.1, at("s2", "another"), u);
    words(["ONE MORE POSE"], RED, 420, 0.0, 1, 130, flash(u, at("s2", "pose")) * 0.6);
    words(["AND ANOTHER"], RED, 560, at("s2", "another") - 0.1, ak, 110);
    tag("+1 POSE", kx + 240, ky - 50, RED, sm(at("s2", "one") - 0.05, at("s2", "one") + 0.15, u), 40);
    tag("+1 MORE", kx + 240, ky + 60, RED, sm(at("s2", "another") - 0.05, at("s2", "another") + 0.15, u), 40);
  }
  if (id === "s3") {
    words(["REST CUT SHORT"], RED, 420, 0.0, 1, 130, flash(u, at("s3", "short")) * 0.6);
    const [mx, my] = scr(V(STUDENTS[1].x, 1.2, MAT_Z + 1.3));
    stamp("x", mx, my - 60, back(at("s3", "short") - 0.05, at("s3", "short") + 0.25, u) * 0.55, u > at("s3", "short") - 0.05 ? 1 : 0, RED);
    tag("NO FINAL REST", CX, 570, RED, sm(at("s3", "rest") - 0.05, at("s3", "rest") + 0.15, u), 40);
  }
  if (id === "s4") {
    words(["PLAN THE MINUTES"], GREEN, 400, 0.0, 1, 120, flash(u, at("s4", "minutes")) * 0.6);
    const k0 = sm(at("s4", "minutes") - 0.05, at("s4", "minutes") + 0.15, u);
    const k1 = sm(at("s4", "each") - 0.05, at("s4", "part") + 0.15, u);
    const k2 = sm(at("s4", "class") - 0.05, at("s4", "class") + 0.15, u);
    plan({ ks: [k0, k1, k2], a: sm(0.0, 0.2, u) });
  }
  if (id === "s5") {
    words(["CLOCK IN SIGHT"], GREEN, 420, 0.0, 1, 130, flash(u, at("s5", "see")) * 0.6);
    tag("CLOCK", kx, ky + 190, GREEN, sm(at("s5", "clock") - 0.05, at("s5", "clock") + 0.15, u), 42);
    ring(kx, ky, 125, sm(at("s5", "see") - 0.05, at("s5", "see") + 0.12, u), GREEN);
  }
  if (id === "s6") {
    const sw = at("s6", "never") - 0.05;
    words(["DROP A POSE"], GREEN, 400, 0.0, 1 - sm(sw - 0.1, sw, u), 130, flash(u, at("s6", "drop")) * 0.6);
    words(["KEEP THE REST"], GREEN, 400, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s6", "rest")) * 0.6);
    const late = sm(at("s6", "late") - 0.05, at("s6", "late") + 0.15, u);
    const drop = sm(at("s6", "drop"), at("s6", "pose") + 0.1, u);
    const close = sm(at("s6", "pose") + 0.05, at("s6", "pose") + 0.3, u);
    plan({ late, drop, close, restOK: sm(at("s6", "rest") - 0.05, at("s6", "rest") + 0.12, u) });
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.35)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["PLAN THE TIME.", "END ON TIME."], ORANGE, 520, 0.0, 1, 140, flash(u, 0.05) + flash(u, at("s7", "end")) * 0.6);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = Math.floor(back(0.0, 0.35, u) * 4 + 1e-6) / 4;
    // app mark: a violet toy plate with a seated figure
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, k), Math.max(0.01, k)); x.lineWidth = 10; x.strokeStyle = INK; x.lineJoin = "round";
    x.fillStyle = "#7c5cff"; rr(-130, -130, 260, 260, 40); x.fill(); x.stroke();
    x.fillStyle = VIOL; for (const sx of [-60, 60]) { rr(sx - 30, -152, 60, 24, 8); x.fill(); x.stroke(); }
    x.fillStyle = WHITE; x.beginPath(); x.arc(0, -58, 26, 0, Math.PI * 2); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(0, -28); x.lineTo(70, 60); x.lineTo(-70, 60); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(-95, 78); x.lineTo(95, 78); x.lineWidth = 14; x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOL, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["run-on-time-bricks"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
