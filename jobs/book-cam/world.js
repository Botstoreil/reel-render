// book-cam (Hidden Cam 31): TOY BRICKS style, built on shelf-check / recheck's set. Everything is built from glossy plastic
// studded bricks in three.js, soft studio light, bright primary colours, 12 fps stop-motion steps for the set. Generic toy
// bricks only: no brand name, logo or figure design. Screen text is a 2D overlay canvas (toy-plate labels). Time only from hf-seek.
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
const STEP = 12; // stop-motion: the set moves on 12 fps steps
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
scene.background = new THREE.Color(0xe6edf6);
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
const P = 0.8; // stud pitch
const geoCache = {};
const rbox = (w, h, d) => { const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`; return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.06, w / 4, h / 4, d / 4))); };
const studGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 20);
const matCache = {};
const plastic = (hex) => matCache[hex] || (matCache[hex] = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.12 }));
const C = { red: 0xd62828, blue: 0x1f5fd6, yellow: 0xf6b700, green: 0x2ea043, white: 0xf5f5f2, brown: 0x8a5a2b, terra: 0xc0602a, tan: 0xd9c7a0, sky: 0x8ec5f0, sky2: 0x7db8ea, cream: 0xf1e6cf, dark: 0x22222a, grey: 0xa3a3a3, purple: 0x7c4dcc, orange: 0xf08a24 };

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

// baseplate floor (instanced studs)
{
  const NX = 22, NZ = 12, w = NX * P, d = NZ * P, cz = 1.9;
  const plate = shade(new THREE.Mesh(rbox(w, 0.32, d), plastic(C.tan)));
  plate.position.set(0, -0.16, cz); scene.add(plate);
  const inst = new THREE.InstancedMesh(studGeo, plastic(C.tan), NX * NZ);
  const M = new THREE.Matrix4(); let n = 0;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { M.makeTranslation((i - (NX - 1) / 2) * P, 0.085, cz + (j - (NZ - 1) / 2) * P); inst.setMatrixAt(n++, M); }
  inst.receiveShadow = true; scene.add(inst);
}
// back wall of 2x1 bricks, staggered
{
  const bw = 1.6, bh = 0.96, bd = 0.8, rows = 9, cols = 12;
  const inst = new THREE.InstancedMesh(rbox(bw - 0.03, bh - 0.03, bd), plastic(0xffffff), rows * (cols + 1));
  const M = new THREE.Matrix4(), col = new THREE.Color(); let n = 0; const r = rng(7);
  for (let y = 0; y < rows; y++) for (let c = 0; c <= cols; c++) {
    const xo = (c - cols / 2) * bw + (y % 2 ? bw / 2 : 0);
    M.makeTranslation(xo, y * bh + bh / 2, -3.0); inst.setMatrixAt(n, M);
    inst.setColorAt(n, col.set(r() < 0.5 ? C.sky : C.sky2)); n++;
  }
  inst.count = n; inst.receiveShadow = true; scene.add(inst);
}

// lens: black ring + red glossy eye, facing +z of its parent. Each lens has its own glow material.
function lens(r = 0.13) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a1a, emissiveIntensity: 0, roughness: 0.15 });
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 24), plastic(C.dark)); ring.rotation.x = Math.PI / 2; g.add(ring);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(r * 0.58, 20, 12), mat); eye.position.z = 0.03; g.add(eye);
  g.userData.mat = mat;
  g.scale.setScalar(0.001);
  return g;
}
function setLens(l, k, glow = 2.2) { l.scale.setScalar(Math.max(0.001, k)); l.userData.mat.emissiveIntensity = glow * k; }

// shelf on the wall
const SHELF_Y = 4.0, SHELF_Z = -1.8, TOP = SHELF_Y + 0.32;
scene.add(at3(brick(4.8, 0.32, 1.6, C.brown), 0, SHELF_Y, SHELF_Z));
scene.add(at3(brick(0.4, 0.96, 0.8, C.dark, false), -1.8, SHELF_Y - 0.96, -2.2));
scene.add(at3(brick(0.4, 0.96, 0.8, C.dark, false), 1.8, SHELF_Y - 0.96, -2.2));

// a row of real books: slim tall bricks, spines face the room
const BT = 0.42, BD = 1.2;
[[-2.1, 1.4, C.blue], [-1.65, 1.2, C.yellow], [-0.35, 1.5, C.green], [0.1, 1.25, C.white], [0.55, 1.35, C.blue], [0.98, 1.1, C.orange]]
  .forEach(([bx, h, c]) => {
    const g = at3(brick(BT, h, BD, c, false), bx, TOP, SHELF_Z);
    // a pale band on the spine so each reads as a book
    g.add(at3(brick(BT * 0.8, 0.09, 0.03, 0xffffff, false), 0, h * 0.72, BD / 2));
    g.add(at3(brick(BT * 0.8, 0.09, 0.03, 0xffffff, false), 0, h * 0.2, BD / 2));
    scene.add(g);
  });

// the fake book: dark red, turned toward the bed. Built around its centre so it can tip over.
const FH = 1.3;
const FAKE_HOME = new THREE.Vector3(-1.0, TOP + FH / 2, SHELF_Z), FAKE_TURN = 0.45;
const fakeG = new THREE.Group();
fakeG.add(at3(brick(BT + 0.08, FH, BD, C.red, false), 0, -FH / 2, 0));
fakeG.add(at3(brick((BT + 0.08) * 0.8, 0.09, 0.03, C.yellow, false), 0, FH * 0.3, BD / 2));
fakeG.add(at3(brick((BT + 0.08) * 0.8, 0.09, 0.03, C.yellow, false), 0, -FH * 0.32, BD / 2));
const spineHole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 20), plastic(C.dark)); spineHole.rotation.x = Math.PI / 2; spineHole.position.set(0, FH * 0.08, BD / 2 + 0.01); spineHole.scale.setScalar(0.001); fakeG.add(spineHole);
const lensFake = lens(0.1); lensFake.position.set(0, FH * 0.08, BD / 2 + 0.03); fakeG.add(lensFake);
scene.add(fakeG);

// book box: three glued slim "books" on the right of the shelf, one lens in the middle spine
const boxG = new THREE.Group();
[[-0.4, C.green], [0, C.tan], [0.4, C.purple]].forEach(([bx, c]) => {
  const g = at3(brick(0.4, 1.15, BD, c, false), bx, 0, 0);
  g.add(at3(brick(0.32, 0.08, 0.03, 0xffffff, false), 0, 0.85, BD / 2));
  boxG.add(g);
});
const lensBox = lens(0.08); lensBox.position.set(0, 0.55, BD / 2 + 0.02); boxG.add(lensBox);
boxG.position.set(1.8, TOP, SHELF_Z);
scene.add(boxG);

// bed: foot toward the wall, head toward the camera
const bedG = new THREE.Group();
bedG.add(brick(3.2, 0.5, 4.8, C.brown, false));
bedG.add(at3(brick(3.0, 0.45, 4.4, C.white, false), 0, 0.5, 0));
bedG.add(at3(brick(3.08, 0.2, 2.8, C.blue, false), 0, 0.95, -0.8));
bedG.add(at3(brick(2.0, 0.35, 0.9, C.white, false), 0, 0.95, 1.55));
bedG.add(at3(brick(3.2, 1.8, 0.4, C.brown), 0, 0, 2.4));
bedG.position.set(0, 0, 3.4);
scene.add(bedG);
const BED_TOP = 1.15;

// dresser on the right (decor)
const dresserG = new THREE.Group();
dresserG.add(brick(2.4, 2.6, 1.6, C.cream));
dresserG.add(at3(brick(2.2, 1.0, 0.14, C.yellow, false), 0, 1.5, 0.82));
dresserG.add(at3(brick(2.2, 1.0, 0.14, C.yellow, false), 0, 0.3, 0.82));
dresserG.position.set(4.4, 0, -1.8);
scene.add(dresserG);

// a real book lying flat on the bed: pages block + back cover + front cover hinged on its left edge
const RB = { w: 1.3, d: 1.2 };
const realG = new THREE.Group();
realG.add(at3(brick(RB.w, 0.08, RB.d, C.blue, false), 0, 0, 0));
realG.add(at3(brick(RB.w - 0.1, 0.34, RB.d - 0.1, 0xffffff, false), 0.02, 0.08, 0));
const coverPivot = new THREE.Group(); coverPivot.position.set(-RB.w / 2, 0.42, 0);
coverPivot.add(at3(brick(RB.w, 0.08, RB.d, C.blue, false), RB.w / 2, 0, 0));
coverPivot.add(at3(brick(0.5, 0.03, 0.12, 0xffffff, false), RB.w / 2 + 0.1, 0.08, 0.2));
realG.add(coverPivot);
// a page that turns after the cover
const pagePivot = new THREE.Group(); pagePivot.position.set(-RB.w / 2 + 0.05, 0.42, 0);
pagePivot.add(at3(brick(RB.w - 0.1, 0.02, RB.d - 0.12, 0xfafaf0, false), (RB.w - 0.1) / 2, 0, 0));
realG.add(pagePivot);
const REAL_HOME = new THREE.Vector3(-0.8, BED_TOP + 0.02, 2.5);
scene.add(realG);
const FAKE_BED = new THREE.Vector3(0.85, BED_TOP + (BT + 0.08) / 2 + 0.02, 2.5);

// phone + torch beam (s6)
const phoneG = new THREE.Group();
phoneG.add(at3(brick(0.55, 1.0, 0.1, C.dark, false), 0, -0.5, 0));
const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff2a8, emissiveIntensity: 3 }));
bulb.position.set(0.12, 0.38, -0.07); phoneG.add(bulb);
phoneG.visible = false;
scene.add(phoneG);

// sight / light cones
function cone(hex) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 24, 1, true), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.visible = false; m.renderOrder = 5; scene.add(m);
  const up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
  m.set = (A, B, r0, r1, a) => {
    m.visible = a > 0.01; if (!m.visible) return;
    m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(r1, r0, 1, 24, 1, true);
    dir.copy(B).sub(A); const L = dir.length();
    m.position.copy(A).addScaledVector(dir, 0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(up, dir.normalize());
    m.material.opacity = a;
  };
  return m;
}
const redCone = cone(0xff2a2a);
const torchCone = cone(0xffe680);
// the bright spot the torch makes on the spines
const spotG = new THREE.Mesh(new THREE.CircleGeometry(0.42, 28), new THREE.MeshBasicMaterial({ color: 0xfff6c0, transparent: true, opacity: 0, depthWrite: false }));
spotG.renderOrder = 6; spotG.visible = false; scene.add(spotG);

// ---------- framing: fit a set of points into a screen box (px) along a view direction ----------
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
const SHELF_PTS = boxPts(-2.5, 2.5, SHELF_Y - 0.6, TOP + 1.6, -2.6, -1.0);
const BED_PTS = boxPts(-1.6, 1.6, 0, 1.8, 1.0, 5.8);
const ROOM_PTS = boxPts(-2.6, 5.7, 0, TOP + 1.7, -2.6, 1.6);
const SHOTS = {
  s1: () => fit([...ROOM_PTS, ...BED_PTS], [0.45, 0.55, 1], [130, 660, 900, 1390]),
  s2: () => fit(SHELF_PTS, [0.15, 0.2, 1], [110, 660, 920, 1390]),
  s3: () => fit(boxPts(-1.7, -0.3, TOP + 0.1, TOP + 1.4, -2.4, -1.2), [0.25, 0.12, 1], [230, 660, 850, 1380]),
  s4: () => fit([...boxPts(-2.5, 2.5, SHELF_Y - 0.3, TOP + 1.5, -2.6, -1.0), ...boxPts(-1.6, 1.6, BED_TOP, BED_TOP + 0.6, 1.9, 3.2)], [0.1, 0.45, 1], [130, 640, 910, 1390]),
  s5: () => fit(boxPts(-2.9, 1.7, BED_TOP, BED_TOP + 1.4, 1.8, 3.2), [0, 1.0, 1], [120, 720, 910, 1340]),
  s6: () => fit(boxPts(-2.5, 2.5, SHELF_Y - 0.4, TOP + 1.6, -2.6, 0.4), [-0.12, 0.18, 1], [110, 660, 920, 1390]),
  s7: () => fit([...ROOM_PTS, ...BED_PTS], [-0.45, 0.55, 1], [130, 780, 900, 1390]),
};
SHOTS.s8 = SHOTS.s7;
const shotCache = {};
function shoot(id, k) {
  const s = shotCache[id] || (shotCache[id] = SHOTS[id]());
  place(s.look, s.dir, s.dist * lerp(1.07, 1.0, k)); // slow push in over the line
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay text (toy plate labels) ----------
const ov = document.createElement("canvas");
ov.width = 1080; ov.height = 1920;
ov.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:2";
document.getElementById("stage").appendChild(ov);
const x = ov.getContext("2d");
const RED = "#e3242b", GREEN = "#1fae4b", ORANGE = "#ff7a00", WHITE = "#ffffff", INK = "#1b1b2f", YELLOW = "#ffd21f";
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
      const k = Math.floor(kk * 4 + 1e-6) / 4; // words snap in like bricks clicking into place
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
// a label printed on a 1xN plate, with two studs on top
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.5;
  X = cl(X, 60 + w / 2, 930 - w / 2); Y = cl(Y, 300, 1380);
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

// ---------- one frame ----------
const V = (a, b, c) => new THREE.Vector3(a, b, c);
function reset() {
  fakeG.position.copy(FAKE_HOME); fakeG.rotation.set(0, FAKE_TURN, 0); fakeG.visible = true;
  spineHole.scale.setScalar(0.001);
  setLens(lensFake, 0); setLens(lensBox, 0);
  realG.position.copy(REAL_HOME); realG.visible = false; coverPivot.rotation.z = 0; pagePivot.rotation.z = 0;
  phoneG.visible = false; spotG.visible = false;
  redCone.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0); torchCone.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0);
}
// the fake book lying flat on the bed, spine toward the camera
function fakeOnBed() { fakeG.position.copy(FAKE_BED); fakeG.rotation.set(0, 0, Math.PI / 2); }
const fakeSpine = () => fakeG.localToWorld(V(0, FH * 0.08, BD / 2 + 0.05));

function frame(t) {
  const tq = q(t);
  const { id, u: uq, d } = sceneOf(tq);
  reset();
  shoot(id, cl(uq / Math.max(0.5, d)));
  const U = (w, n) => at(id, w, n);

  if (id === "s1") {
    // the one book that is turned; on "bed" a red sight cone from its spine to the pillow
    const tw = sm(U("turned") - 0.1, U("toward") + 0.1, uq);
    fakeG.rotation.y = FAKE_TURN * (0.35 + 0.65 * st(tw, 4));
    const FB = sm(U("bed") - 0.15, U("bed") + 0.15, uq);
    redCone.set(fakeSpine(), V(0, 1.4, 4.4), 0.12, 1.5, 0.3 * FB);
    setLens(lensFake, 0.6 * sm(U("never") - 0.1, U("never") + 0.1, uq), 3);
  }
  if (id === "s2") {
    const FB = sm(U("fake") - 0.1, U("fake") + 0.15, uq);
    fakeG.position.z += 0.25 * st(FB, 3); // the fake book nudges forward on "fake"
    const BB = sm(U("boxes") - 0.1, U("boxes") + 0.15, uq);
    boxG.position.z = SHELF_Z + 0.25 * st(BB, 3);
  }
  if (id === "s3") {
    const HK = sm(U("hole") - 0.12, U("hole") + 0.1, uq);
    spineHole.scale.setScalar(Math.max(0.001, HK));
    setLens(lensFake, sm(U("lens") - 0.05, U("lens") + 0.2, uq), 2.2 + 2 * flash(uq, U("spine")));
  }
  if (id === "s4") {
    // take it down: slide out, hop, tip flat and land on the bed
    const out = sm(U("take") - 0.15, U("take") + 0.15, uq);
    const go = st(sm(U("book") - 0.05, U("down") + 0.3, uq), 8);
    const from = V(FAKE_HOME.x, FAKE_HOME.y, SHELF_Z + 0.6 * out);
    fakeG.position.lerpVectors(from, FAKE_BED, go); fakeG.position.y += Math.sin(Math.PI * go) * 1.2;
    fakeG.rotation.set(0, FAKE_TURN * (1 - go), (Math.PI / 2) * go);
    realG.visible = true;
    setLens(lensFake, 0.8, 1.2);
  }
  if (id === "s5") {
    realG.visible = true; fakeOnBed(); setLens(lensFake, 0.8, 1.2);
    // the real book opens on "opens"
    const op = st(sm(U("real") - 0.05, U("opens") + 0.15, uq), 6);
    coverPivot.rotation.z = Math.PI * 0.97 * op;
    pagePivot.rotation.z = Math.PI * 0.9 * st(sm(U("opens") + 0.1, U("camera"), uq), 4);
    // the camera box: heavy thud, then it will not open (shakes on "not open")
    const thud = flash(uq, U("heavy") + 0.1);
    fakeG.position.y -= 0.12 * thud;
    const shake = sm(U("will") - 0.05, U("will"), uq) * (1 - sm(U("open", 2) + 0.2, U("open", 2) + 0.35, uq));
    fakeG.rotation.y = 0.08 * Math.sin(uq * 40) * shake;
    fakeG.position.y += 0.06 * Math.abs(Math.sin(uq * 30)) * shake;
  }
  if (id === "s6") {
    // torch sweep along the spines from left to right; the book box glints on "glint"
    phoneG.visible = true;
    const sw = sm(U("shine") - 0.05, U("glint") + 0.05, uq);
    const tx = lerp(-2.2, 1.8, sw);
    // phone held low and to the left of the spot it lights, so it never covers a spine
    phoneG.position.set(tx - 1.1, SHELF_Y - 0.5, 0.9);
    phoneG.rotation.set(0.5, -0.5, -0.3);
    const tA = sm(U("shine") - 0.05, U("shine") + 0.15, uq);
    const spot = V(tx, TOP + 0.6, SHELF_Z + 0.63);
    torchCone.set(phoneG.localToWorld(V(0.12, 0.38, -0.1)), spot, 0.06, 0.5, 0.45 * tA);
    spotG.visible = tA > 0.01; spotG.position.copy(spot); spotG.material.opacity = 0.75 * tA;
    const g = sm(U("glint") - 0.08, U("glint") + 0.05, uq);
    setLens(lensBox, g, 2.2 + 3 * flash(uq, U("glint") + 0.05));
  }
  if (id === "s7" || id === "s8") {
    realG.visible = true; fakeOnBed(); coverPivot.rotation.z = Math.PI * 0.97;
  }
  renderer.render(scene, camera);

  // ---------- overlay ----------
  const u = t - S[id][0] - LEAD; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const pin = (v, dy = 0) => { const [X, Y] = scr(v); return [X, Y + dy]; };
  if (id === "s1") {
    words(["NEVER IGNORE", "THE BOOK"], RED, 430, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
    const [fx, fy] = pin(V(FAKE_HOME.x, TOP + FH + 0.5, SHELF_Z));
    tag("TURNED TO BED", fx + 80, fy - 20, RED, sm(at("s1", "turned") - 0.05, at("s1", "turned") + 0.2, u), 40);
  }
  if (id === "s2") {
    words(["FAKE BOOKS", "HIDE CAMERAS"], RED, 430, 0.0, 1, 140, flash(u, at("s2", "fake")) * 0.6);
    const [fx, fy] = pin(V(FAKE_HOME.x, TOP - 0.4, SHELF_Z + 0.8));
    tag("FAKE BOOK", fx, fy + 50, RED, sm(at("s2", "fake") - 0.05, at("s2", "fake") + 0.2, u), 40);
    const [bx, by] = pin(V(1.8, TOP - 0.4, SHELF_Z + 0.8));
    tag("BOOK BOX", bx, by + 50, RED, sm(at("s2", "boxes") - 0.05, at("s2", "boxes") + 0.2, u), 40);
  }
  if (id === "s3") {
    words(["A HOLE", "IN THE SPINE"], RED, 420, 0.0, 1, 150, flash(u, at("s3", "hole")) * 0.6);
    const [lx, ly] = pin(fakeSpine());
    ring(lx, ly, 95, sm(at("s3", "hole") - 0.05, at("s3", "hole") + 0.12, u), RED);
    tag("LENS", lx, ly + 170, RED, sm(at("s3", "lens") - 0.05, at("s3", "lens") + 0.2, u), 44);
  }
  if (id === "s4") {
    words(["TAKE IT DOWN"], GREEN, 420, 0.0, 1, 130, flash(u, at("s4", "down")) * 0.6);
    words(["OPEN IT"], GREEN, 560, at("s4", "open") - 0.1, sm(at("s4", "open") - 0.15, at("s4", "open") - 0.05, u), 120);
  }
  if (id === "s5") {
    const sw = at("s5", "camera") - 0.1;
    words(["REAL ONE", "OPENS"], GREEN, 420, 0.0, 1 - sm(sw - 0.1, sw, u), 140, flash(u, at("s5", "opens")) * 0.6);
    words(["CAMERA BOX", "WON'T"], GREEN, 420, sw, sm(sw - 0.05, sw, u), 140);
    const [rx, ry] = pin(V(REAL_HOME.x, BED_TOP + 0.5, REAL_HOME.z + 0.7));
    stamp("v", rx, ry - 20, back(at("s5", "opens") - 0.05, at("s5", "opens") + 0.25, u) * 0.5, u > at("s5", "opens") - 0.05 ? 1 : 0, GREEN);
    const [fx, fy] = pin(V(FAKE_BED.x, BED_TOP + 0.5, FAKE_BED.z + 0.7));
    tag("HOLLOW?", fx + 40, fy - 330, RED, sm(at("s5", "hollow") - 0.05, at("s5", "hollow") + 0.15, u), 38);
    tag("HEAVY?", fx + 40, fy - 245, RED, sm(at("s5", "heavy") - 0.05, at("s5", "heavy") + 0.15, u), 38);
    tag("WON'T OPEN?", fx + 10, fy - 160, RED, sm(at("s5", "not") - 0.05, at("s5", "not") + 0.15, u), 38);
    stamp("x", fx, fy - 20, back(at("s5", "open", 2) - 0.05, at("s5", "open", 2) + 0.25, u) * 0.5, u > at("s5", "open", 2) - 0.05 ? 1 : 0, RED);
  }
  if (id === "s6") {
    words(["SWEEP A LIGHT", "ON THE SPINES"], GREEN, 420, 0.0, 1, 130, flash(u, at("s6", "spines")) * 0.6);
    const [gx, gy] = pin(lensBox.localToWorld(V(0, 0, 0)));
    const gk = sm(at("s6", "glint") - 0.05, at("s6", "glint") + 0.12, u);
    ring(gx, gy, 85, gk, RED);
    tag("GLINT = LENS", gx - 120, gy + 170, RED, gk, 40);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.35)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["OPEN THE BOOK", "CHECK THE SPINE"], ORANGE, 520, 0.0, 1, 140, flash(u, 0.05) + flash(u, at("s7", "check")) * 0.6);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = Math.floor(back(0.0, 0.35, u) * 4 + 1e-6) / 4;
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, k), Math.max(0.01, k)); x.lineWidth = 10; x.strokeStyle = INK;
    x.fillStyle = "#7c5cff"; x.beginPath(); x.arc(0, 0, 130, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = "#9b85ff"; for (const [sx, sy] of [[-45, -45], [45, -45], [-45, 45], [45, 45]]) { x.beginPath(); x.arc(sx, sy, 30, 0, Math.PI * 2); x.fill(); x.stroke(); }
    x.fillStyle = INK; x.beginPath(); x.arc(0, 0, 34, 0, Math.PI * 2); x.fill(); x.fillStyle = "#ff2a2a"; x.beginPath(); x.arc(0, 0, 16, 0, Math.PI * 2); x.fill();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], YELLOW, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["book-cam-bricks"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
