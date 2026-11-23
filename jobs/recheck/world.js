// recheck (Hidden Cam 25): TOY BRICKS style, built on shelf-check's set. Everything is built from glossy plastic studded bricks in
// three.js, soft studio light, bright primary colours, 12 fps stop-motion steps for the set. Generic toy bricks only:
// no brand name, logo or figure design. Screen text is a 2D overlay canvas (toy-plate labels). Time only from hf-seek.
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
const C = { red: 0xd62828, blue: 0x1f5fd6, yellow: 0xf6b700, green: 0x2ea043, white: 0xf5f5f2, brown: 0x8a5a2b, terra: 0xc0602a, tan: 0xd9c7a0, sky: 0x8ec5f0, sky2: 0x7db8ea, cream: 0xf1e6cf, dark: 0x22222a, grey: 0xa3a3a3 };

function shade(m) { m.castShadow = true; m.receiveShadow = true; return m; }
// a brick of size w x h x d (world units), bottom at y=0, studs on top laid on the stud grid
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

// lens: black ring + red glossy eye, facing +z of its parent
const lensMat = new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff1a1a, emissiveIntensity: 0, roughness: 0.15 });
function lens() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24), plastic(C.dark)); ring.rotation.x = Math.PI / 2; g.add(ring);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 12), lensMat); eye.position.z = 0.03; g.add(eye);
  g.scale.setScalar(0.001);
  return g;
}

// shelf on the wall
const SHELF_Y = 4.0, SHELF_Z = -1.8, TOP = SHELF_Y + 0.32;
const shelfG = new THREE.Group();
shelfG.add(at3(brick(4.8, 0.32, 1.6, C.brown), 0, SHELF_Y, SHELF_Z));
shelfG.add(at3(brick(0.4, 0.96, 0.8, C.dark, false), -1.8, SHELF_Y - 0.96, -2.2));
shelfG.add(at3(brick(0.4, 0.96, 0.8, C.dark, false), 1.8, SHELF_Y - 0.96, -2.2));
scene.add(shelfG);

// books: three tall slim bricks, spines face the room
const booksG = new THREE.Group();
[[-0.62, 1.3, C.red], [0, 1.55, C.blue], [0.62, 1.2, C.yellow]].forEach(([bx, h, c]) => booksG.add(at3(brick(0.58, h, 1.2, c, false), bx, 0, 0)));
const lensBooks = lens(); lensBooks.position.set(0, 1.05, 0.61); booksG.add(lensBooks);
scene.add(booksG);
// plant: pot + leaf pyramids
const plantG = new THREE.Group();
plantG.add(brick(0.8, 0.72, 0.8, C.terra));
const leafGeo = new THREE.ConeGeometry(0.42, 0.9, 4);
const leaves = [];
[[-0.28, 0.95, 0.1, -0.5], [0.28, 1.0, -0.05, 0.5], [0, 1.35, 0.05, 0]].forEach(([lx, ly, lz, rz]) => {
  const l = shade(new THREE.Mesh(leafGeo, plastic(C.green))); l.position.set(lx, ly, lz); l.rotation.set(0, Math.PI / 4, rz); l.userData.rz = rz; plantG.add(l); leaves.push(l);
});
scene.add(plantG);
// tissue box: white brick + a tuft; lenses on the front and the bottom, a hole on the bottom
const tissueG = new THREE.Group();
tissueG.add(brick(1.6, 0.8, 0.8, C.white, false));
const tuft = shade(new THREE.Mesh(rbox(0.5, 0.4, 0.08), plastic(0xffffff))); tuft.position.set(0, 0.95, 0); tuft.rotation.z = 0.15; tissueG.add(tuft);
const lensFront = lens(); lensFront.position.set(0.45, 0.42, 0.41); tissueG.add(lensFront);
const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 20), plastic(C.dark)); hole.position.set(-0.35, -0.012, 0.1); hole.scale.setScalar(0.001); tissueG.add(hole);
const lensBottom = lens(); lensBottom.rotation.x = Math.PI / 2; lensBottom.position.set(0.35, -0.03, 0.12); tissueG.add(lensBottom);
scene.add(tissueG);
// wire hanging from the lifted box (world space chain)
const wireBits = [];
for (let i = 0; i < 12; i++) { const b = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 10), plastic(C.dark))); b.visible = false; scene.add(b); wireBits.push(b); }

// bed: foot toward the wall, head toward the camera
const bedG = new THREE.Group();
bedG.add(brick(3.2, 0.5, 4.8, C.brown, false));
bedG.add(at3(brick(3.0, 0.45, 4.4, C.white, false), 0, 0.5, 0));
bedG.add(at3(brick(3.08, 0.2, 2.8, C.blue), 0, 0.95, -0.8));
bedG.add(at3(brick(2.0, 0.35, 0.9, C.white, false), 0, 0.95, 1.55));
bedG.add(at3(brick(3.2, 1.8, 0.4, C.brown), 0, 0, 2.4));
bedG.position.set(0, 0, 3.4);
scene.add(bedG);

// dresser with a sliding top drawer
const dresserG = new THREE.Group();
dresserG.add(brick(2.4, 2.6, 1.6, C.cream));
const drawerTop = new THREE.Group();
drawerTop.add(at3(brick(2.1, 0.9, 1.4, C.cream, false), 0, 0, 0));
drawerTop.add(at3(brick(2.2, 1.0, 0.14, C.yellow, false), 0, -0.05, 0.72));
const knob = shade(new THREE.Mesh(studGeo, plastic(C.dark))); knob.rotation.x = Math.PI / 2; knob.position.set(0, 0.45, 0.85); drawerTop.add(knob);
drawerTop.position.set(0, 1.55, 0.1);
dresserG.add(drawerTop);
dresserG.add(at3(brick(2.2, 1.0, 0.14, C.yellow, false), 0, 0.3, 0.82));
dresserG.position.set(4.4, 0, -1.8);
scene.add(dresserG);

// dust plates (wrong way: decor nobody touches)
const dust = []; { const r = rng(11); for (let i = 0; i < 16; i++) { const m = shade(new THREE.Mesh(rbox(0.22, 0.07, 0.22), plastic(C.grey))); m.userData = { x: (r() - 0.5) * 4.4, y: TOP + 0.3 + r() * 1.6, z: SHELF_Z + (r() - 0.3) * 1.2, s: 0.3 + r() * 0.5, ph: r() * 6 }; m.visible = false; scene.add(m); dust.push(m); } }

// sight cones (red = the shelf sees the bed, green = you check what sees the bed)
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
const greens = [cone(0x22c55e), cone(0x22c55e), cone(0x22c55e)];

// door in the back wall, left of the shelf (hinge on its left edge, swings into the room)
const DOOR_X = -4.6;
scene.add(at3(brick(2.1, 3.9, 0.12, C.dark, false), DOOR_X, 0, -2.52));
const doorG = new THREE.Group();
doorG.add(at3(brick(1.95, 3.75, 0.16, C.yellow, false), 0.975, 0, 0));
const dKnob = shade(new THREE.Mesh(studGeo, plastic(C.dark))); dKnob.rotation.x = Math.PI / 2; dKnob.position.set(1.65, 1.8, 0.12); doorG.add(dKnob);
doorG.position.set(DOOR_X - 0.975, 0, -2.42);
scene.add(doorG);
// footprints from the door to the shelf
const prints = [];
for (let i = 0; i < 8; i++) {
  const k = i / 7, side = i % 2 ? 1 : -1;
  const m = shade(new THREE.Mesh(rbox(0.32, 0.06, 0.5), plastic(C.grey)));
  m.position.set(lerp(DOOR_X, -1.0, k) + side * 0.18, 0.03, lerp(-1.6, 0.6, k)); m.rotation.y = 1.02; m.visible = false;
  scene.add(m); prints.push(m);
}
// the new object that appears on the dresser: a dark box with a small display and a lens
const newG = new THREE.Group();
newG.add(brick(1.2, 0.8, 0.8, C.dark));
newG.add(at3(brick(0.5, 0.26, 0.04, C.sky, false), -0.25, 0.3, 0.41));
const lensNew = lens(); lensNew.position.set(0.32, 0.42, 0.42); newG.add(lensNew);
const NEW_HOME = new THREE.Vector3(4.4, 2.6, -1.5);
scene.add(newG);

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
const SHELF_PTS = boxPts(-2.5, 2.5, SHELF_Y - 0.9, TOP + 1.7, -2.6, -1.0);
const BED_PTS = boxPts(-1.6, 1.6, 0, 1.8, 1.0, 5.8);
const ROOM_PTS = boxPts(-2.6, 5.7, 0, TOP + 1.7, -2.6, 1.6);
const CLOSE_PTS = boxPts(0.6, 5.7, 0.6, TOP + 1.6, -2.6, -0.6);
const SHOTS = {
  s1: () => fit([...ROOM_PTS, ...BED_PTS], [0.45, 0.55, 1], [130, 660, 900, 1390]),
  s2: () => fit(boxPts(-5.9, 2.6, 0, TOP + 1.5, -2.6, 0.8), [0.3, 0.25, 1], [110, 640, 920, 1390]),
  s3: () => fit(CLOSE_PTS, [0.1, 0.25, 1], [110, 640, 910, 1390]),
  s4: () => fit(ROOM_PTS, [0.1, 0.25, 1], [250, 700, 830, 1300]),
  s5: () => fit(ROOM_PTS, [0.1, 0.25, 1], [150, 880, 890, 1380]),
  s6: () => fit(CLOSE_PTS, [-0.1, 0.25, 1], [110, 640, 910, 1390]),
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
      // words snap in like bricks clicking into place (stepped)
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
// a label printed on a 1xN plate, with two studs on top
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  X = cl(X, 140, 900); Y = cl(Y, 300, 1380);
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.5, s = 0.6 + 0.4 * Math.floor(a * 4) / 4;
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

// ---------- one frame ----------
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const HOME = { books: V(-1.6, TOP, SHELF_Z), plant: V(0, TOP, SHELF_Z), tissue: V(1.6, TOP, SHELF_Z) };
function reset() {
  booksG.position.copy(HOME.books); booksG.rotation.set(0, 0, 0); booksG.scale.setScalar(1); booksG.visible = true;
  plantG.position.copy(HOME.plant); plantG.visible = true;
  tissueG.position.copy(HOME.tissue); tissueG.rotation.set(0, 0, 0); tissueG.visible = true;
  [lensBooks, lensFront, lensBottom].forEach((l) => l.scale.setScalar(0.001)); hole.scale.setScalar(0.001); lensMat.emissiveIntensity = 0;
  wireBits.forEach((b) => (b.visible = false)); dust.forEach((d) => (d.visible = false));
  redCone.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0); greens.forEach((g) => g.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0));
  drawerTop.position.z = 0.1; bedG.visible = true;
}
function setLens(l, k) { l.scale.setScalar(Math.max(0.001, k)); lensMat.emissiveIntensity = Math.max(lensMat.emissiveIntensity, 2.2 * k); }

// (shelf-check's original frame, kept for reference only; not called)
function frameShelfCheck(t) {
  const tq = q(t);
  const { id, u: uq, d } = sceneOf(tq);
  reset();
  shoot(id, cl(uq / Math.max(0.5, d)));
  const U = (w, n) => at(id, w, n);

  if (id === "s1") {
    const FB = sm(U("faces") - 0.1, U("bed") + 0.1, uq);
    redCone.set(V(0, TOP + 0.8, SHELF_Z + 0.4), V(0, 1.2, 3.6), 0.35, 1.9, 0.32 * FB);
    leaves.forEach((l) => (l.rotation.z = l.userData.rz + 0.06 * Math.sin(uq * 6)));
  }
  if (id === "s2") {
    // each object drops onto the shelf on its word, then a lens shows on the last word
    const drop = (g, w) => { const k = back(U(w) - 0.05, U(w) + 0.3, uq); g.visible = uq > U(w) - 0.05; g.position.y += (1 - k) * 2.2; };
    drop(booksG, "books"); drop(plantG, "plants"); drop(tissueG, "tissue");
    const LK = sm(U("camera") - 0.15, U("camera") + 0.15, uq);
    setLens(lensBooks, LK); setLens(lensFront, LK);
  }
  if (id === "s3") {
    const DK = sm(U("touches") - 0.3, U("touches") + 0.1, uq);
    dust.forEach((m) => { const p = m.userData; m.visible = DK > 0.01; m.position.set(p.x, p.y - ((uq * p.s + p.ph) % 1.4) * DK, p.z); m.rotation.y = p.ph + uq; });
  }
  if (id === "s4") {
    const VK = sm(U("clear") - 0.15, U("view") + 0.3, uq);
    const eyeP = V(0, 1.6, 4.7);
    [HOME.books, HOME.plant, HOME.tissue].forEach((h, i) => greens[i].set(eyeP, V(h.x, h.y + 0.7, h.z + 0.5), 0.12, 0.55, 0.38 * VK * sm(i * 0.12, i * 0.12 + 0.2, VK + 0.2)));
  }
  if (id === "s5") {
    const lift = sm(U("lift") - 0.1, U("object") + 0.2, uq);
    tissueG.position.y += 1.3 * lift; tissueG.rotation.x = -0.95 * lift;
    setLens(lensFront, 0);
    hole.scale.setScalar(Math.max(0.001, sm(U("hole") - 0.1, U("hole") + 0.1, uq)));
    setLens(lensBottom, sm(U("lens") - 0.1, U("lens") + 0.15, uq));
    const Wr = sm(U("wire") - 0.1, U("wire") + 0.35, uq);
    const p0 = tissueG.localToWorld(V(0.7, 0.05, -0.35));
    wireBits.forEach((b, i) => { const k = i / wireBits.length; b.visible = Wr > k; b.position.set(p0.x + 0.1 * i, p0.y - 0.19 * i + 0.006 * i * i, p0.z + 0.02 * i); b.rotation.z = 0.45; });
  }
  if (id === "s6") {
    const R = sm(U("turn") - 0.05, U("wall") + 0.1, uq);
    tissueG.rotation.y = Math.PI * R;
    setLens(lensFront, 1 - R);
    const M = sm(U("move") - 0.05, U("drawer") + 0.15, uq);
    const open = sm(U("move") - 0.25, U("move") + 0.05, uq) * (1 - sm(U("drawer") + 0.2, U("drawer") + 0.45, uq));
    drawerTop.position.z = 0.1 + 0.95 * open;
    const into = V(4.4, 1.75, -1.8 + 0.1 + 0.95);
    const hop = Math.sin(Math.PI * cl(M)) * 1.6;
    booksG.position.lerpVectors(HOME.books, into, M); booksG.position.y += hop;
    booksG.scale.setScalar(lerp(1, 0.7, M));
    booksG.visible = M < 0.97 || open > 0.15;
  }
  if (id === "s7" || id === "s8") {
    [HOME.books, HOME.plant, HOME.tissue].forEach((h, i) => greens[i].set(V(0, 1.6, 4.7), V(h.x, h.y + 0.7, h.z + 0.5), 0.12, 0.55, id === "s7" ? 0.28 : 0.15));
    tissueG.rotation.y = Math.PI;
  }
  renderer.render(scene, camera);

  // ---------- overlay ----------
  const tt = sceneOf(t), u = tt.u; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const pin = (v, dy = 0) => { const [X, Y] = scr(v); return [X, Y + dy]; };
  if (id === "s1") words(["NEVER IGNORE", "THE SHELF"], RED, 430, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") {
    words(["EASY PLACES", "TO TUCK A CAMERA"], RED, 440, 0.0, 1, 130, flash(u, at("s2", "camera")) * 0.6);
    const [bx, by] = pin(V(HOME.books.x, TOP - 0.5, SHELF_Z + 0.8)), [px, py] = pin(V(0, TOP - 0.5, SHELF_Z + 0.8)), [tx, ty] = pin(V(HOME.tissue.x, TOP - 0.5, SHELF_Z + 0.8));
    tag("BOOKS", bx, by + 40, RED, sm(at("s2", "books") - 0.05, at("s2", "books") + 0.2, u), 38);
    tag("PLANTS", px, py + 40, RED, sm(at("s2", "plants") - 0.05, at("s2", "plants") + 0.2, u), 38);
    tag("TISSUES", tx, ty + 40, RED, sm(at("s2", "tissue") - 0.05, at("s2", "tissue") + 0.2, u), 38);
  }
  if (id === "s3") {
    words(["NOBODY", "CHECKS IT"], RED, 430, 0.0, 1, 150, flash(u, at("s3", "checks")) * 0.6);
    const [bx, by] = pin(V(HOME.books.x, TOP - 0.5, SHELF_Z + 0.8));
    tag("NOT TOUCHED", bx + 40, by + 50, RED, sm(at("s3", "touches") - 0.1, at("s3", "touches") + 0.2, u), 38);
    const [sx, sy] = pin(V(HOME.tissue.x, TOP + 0.6, SHELF_Z + 0.6));
    stamp("x", sx, sy, back(at("s3", "checks") - 0.1, at("s3", "checks") + 0.25, u) * 0.7, u > at("s3", "checks") - 0.1 ? 1 : 0, RED);
  }
  if (id === "s4") {
    words(["STAND AT", "THE BED"], GREEN, 400, 0.0, 1, 140, flash(u, at("s4", "bed")) * 0.6);
    const [vx, vy] = pin(V(0, TOP + 2.0, SHELF_Z));
    tag("CLEAR VIEW?", vx, vy, GREEN, sm(at("s4", "view") - 0.05, at("s4", "view") + 0.2, u), 44);
  }
  if (id === "s5") {
    words(["LIFT IT.", "LOOK UNDER."], GREEN, 420, 0.0, 1, 140, flash(u, at("s5", "lift")) * 0.6);
    const [hx, hy] = pin(tissueG.localToWorld(V(-0.35, 0, 0.1))), [lx, ly] = pin(tissueG.localToWorld(V(0.35, 0, 0.12)));
    const [wx, wy] = pin(tissueG.localToWorld(V(0.7, 0, -0.35)));
    tag("HOLE?", hx - 150, hy + 120, GREEN, sm(at("s5", "hole") - 0.05, at("s5", "hole") + 0.2, u), 40);
    tag("WIRE?", wx + 150, wy + 200, GREEN, sm(at("s5", "wire") - 0.05, at("s5", "wire") + 0.2, u), 40);
    tag("LENS?", lx + 60, ly - 150, RED, sm(at("s5", "lens") - 0.05, at("s5", "lens") + 0.2, u), 40);
  }
  if (id === "s6") {
    const sw = at("s6", "move") - 0.15;
    words(["TURN IT"], GREEN, 420, 0.0, 1 - sm(sw - 0.1, sw, u), 140);
    words(["OR PUT IT AWAY"], GREEN, 420, sw, sm(sw - 0.05, sw, u), 130);
    const [tx, ty] = pin(V(HOME.tissue.x, TOP - 0.4, SHELF_Z + 0.8));
    tag("FACE THE WALL", tx, ty + 40, GREEN, sm(at("s6", "wall") - 0.1, at("s6", "wall") + 0.2, u), 36);
    const [dx, dy] = pin(V(4.4, 3.0, -1.0));
    stamp("v", dx, dy - 60, back(at("s6", "drawer") + 0.1, at("s6", "drawer") + 0.4, u) * 0.55, u > at("s6", "drawer") + 0.1 ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.35)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CHECK WHAT", "CAN SEE THE BED"], ORANGE, 520, 0.0, 1, 140, flash(u, 0.05) + flash(u, at("s7", "bed")) * 0.6);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = Math.floor(back(0.0, 0.35, u) * 4 + 1e-6) / 4;
    // a round 2x2 brick seen from above as the icon
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

// ---------- recheck story ----------
const MOVED = { x: 1.35, ry: -0.45 };
function resetR() {
  reset();
  doorG.rotation.y = 0;
  prints.forEach((p) => (p.visible = false));
  newG.visible = false; newG.position.copy(NEW_HOME); newG.rotation.set(0, 0, 0); lensNew.scale.setScalar(0.001);
}
// room changed while you were out: tissue box moved, a new object on the dresser
function changed(kMove = 1, kNew = 1) {
  tissueG.position.x = lerp(HOME.tissue.x, MOVED.x, kMove); tissueG.rotation.y = MOVED.ry * kMove;
  newG.visible = kNew > 0.01; newG.position.y = NEW_HOME.y + (1 - kNew) * 2.4;
  lensNew.scale.setScalar(Math.max(0.001, kNew));
}
const wiggle = (u) => leaves.forEach((l) => (l.rotation.z = l.userData.rz + 0.06 * Math.sin(u * 6)));

// the day-one photo: the s5 framing of the untouched room, rendered once
const SNAP = [150, 880, 740, 500];
let snapC = null;
function snapshot() {
  if (snapC) return;
  resetR();
  const s = shotCache.s5 || (shotCache.s5 = SHOTS.s5());
  place(s.look, s.dir, s.dist);
  renderer.render(scene, camera);
  snapC = document.createElement("canvas"); snapC.width = SNAP[2]; snapC.height = SNAP[3];
  snapC.getContext("2d").drawImage(canvas, SNAP[0], SNAP[1], SNAP[2], SNAP[3], 0, 0, SNAP[2], SNAP[3]);
}
function polaroid(cx, cy, sc, a, label, rot = -0.04) {
  if (a <= 0 || !snapC || sc <= 0.01) return;
  const w = SNAP[2] * sc, h = SNAP[3] * sc, b = 16, bb = 64;
  x.save(); x.globalAlpha = a; x.translate(cx, cy); x.rotate(rot);
  x.fillStyle = "rgba(27,27,47,0.35)"; x.fillRect(-w / 2 - b + 10, -h / 2 - b + 14, w + 2 * b, h + b + bb);
  x.fillStyle = WHITE; x.strokeStyle = INK; x.lineWidth = 6;
  x.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + b + bb); x.strokeRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + b + bb);
  x.drawImage(snapC, -w / 2, -h / 2, w, h);
  x.font = FONT(Math.max(24, 44 * sc / 0.5)); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = INK;
  x.fillText(label, 0, h / 2 + bb / 2);
  x.restore();
}
function ring(X, Y, r, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineWidth = 22; x.strokeStyle = INK; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 12; x.strokeStyle = color; x.stroke(); x.restore();
}

function frame(t) {
  snapshot();
  const tq = q(t);
  const { id, u: uq, d } = sceneOf(tq);
  resetR();
  shoot(id, cl(uq / Math.max(0.5, d)));
  const U = (w, n) => at(id, w, n);
  wiggle(uq);

  if (id === "s2") {
    const open = sm(-0.05, 0.3, uq) * (1 - sm(U("out") - 0.1, U("out") + 0.25, uq));
    doorG.rotation.y = -1.3 * Math.floor(open * 6 + 1e-6) / 6;
    const P0 = U("come") - 0.25, P1 = U("out");
    prints.forEach((p, i) => (p.visible = uq > lerp(P0, P1, i / prints.length)));
  }
  if (id === "s3") {
    prints.forEach((p) => (p.visible = true));
    changed(sm(U("move") - 0.2, U("move") + 0.15, uq), back(U("new") - 0.1, U("new") + 0.3, uq) * (uq > U("new") - 0.1 ? 1 : 0));
    lensMat.emissiveIntensity = 2.2 * sm(U("appear") - 0.1, U("appear") + 0.2, uq);
  }
  if (id === "s4") { /* the untouched room, framed by the phone */ }
  if (id === "s5") {
    changed(1, 1);
    const open = sm(-0.05, 0.25, uq) * (1 - sm(U("compare") - 0.2, U("compare") + 0.1, uq));
    doorG.rotation.y = -1.3 * Math.floor(open * 6 + 1e-6) / 6;
    lensMat.emissiveIntensity = 1.2;
  }
  if (id === "s6") {
    changed(1, 1);
    const lift = sm(U("check") - 0.1, U("check") + 0.2, uq);
    const turn = sm(U("before") - 0.05, U("relax") + 0.05, uq);
    newG.position.y = NEW_HOME.y + 0.7 * lift * (1 - turn);
    newG.rotation.y = Math.PI * Math.floor(turn * 6 + 1e-6) / 6;
    lensMat.emissiveIntensity = (1 + 2.5 * flash(uq, U("again") + 0.1)) * (1 - turn);
  }
  if (id === "s7" || id === "s8") {
    changed(0, 0);
  }
  renderer.render(scene, camera);

  // ---------- overlay ----------
  const tt = sceneOf(t), u = tt.u; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const pin = (v, dy = 0) => { const [X, Y] = scr(v); return [X, Y + dy]; };
  const objTop = () => pin(newG.localToWorld(V(0, 1.1, 0)));
  if (id === "s1") {
    words(["NEVER ASSUME", "NOTHING CHANGED"], RED, 430, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
    const [rx, ry] = pin(V(0, TOP + 2.2, SHELF_Z));
    tag("DAY 1: CHECKED", rx, ry, GREEN, sm(at("s1", "day") - 0.05, at("s1", "day") + 0.2, u) * (1 - sm(at("s1", "assume"), at("s1", "assume") + 0.2, u) * 0.6), 44);
  }
  if (id === "s2") {
    words(["SOMEONE", "COMES IN"], RED, 430, 0.0, 1, 150, flash(u, at("s2", "come")) * 0.6);
    const [dx, dy] = pin(V(DOOR_X + 0.4, 4.4, -2.4));
    tag("CLEANERS", dx + 60, dy - 10, RED, sm(at("s2", "cleaners") - 0.05, at("s2", "cleaners") + 0.2, u), 38);
    tag("STAFF", dx + 60, dy + 70, RED, sm(at("s2", "staff") - 0.05, at("s2", "staff") + 0.2, u), 38);
    tag("HOST", dx + 60, dy + 150, RED, sm(at("s2", "host") - 0.05, at("s2", "host") + 0.2, u), 38);
    const [ox, oy] = pin(V(0.5, 1.0, 1.0));
    tag("YOU'RE OUT", ox + 120, oy + 120, RED, sm(at("s2", "out") - 0.1, at("s2", "out") + 0.15, u), 40);
  }
  if (id === "s3") {
    words(["THINGS", "CHANGE"], RED, 430, 0.0, 1, 150, flash(u, at("s3", "move")) * 0.6);
    const [tx, ty] = pin(V(MOVED.x, TOP - 0.5, SHELF_Z + 0.8));
    tag("MOVED", tx, ty + 40, RED, sm(at("s3", "move") - 0.05, at("s3", "move") + 0.2, u), 40);
    const [nx, ny] = objTop();
    tag("NEW?", nx, ny - 30, RED, sm(at("s3", "appear") - 0.1, at("s3", "appear") + 0.15, u), 44);
  }
  if (id === "s4") {
    words(["TAKE A PHOTO"], GREEN, 430, 0.0, 1, 130, flash(u, at("s4", "photo")) * 0.6);
    const shot = at("s4", "photo") + 0.1;
    const phoneA = 1 - sm(shot + 0.45, shot + 0.7, u);
    // phone frame around the room (camera view)
    if (phoneA > 0) {
      x.save(); x.globalAlpha = phoneA; x.lineWidth = 34; x.strokeStyle = INK; rr(190, 610, 700, 790, 70); x.stroke();
      x.lineWidth = 10; x.strokeStyle = "#3a3a55"; rr(208, 628, 664, 754, 54); x.stroke();
      x.fillStyle = INK; rr(470, 618, 140, 26, 13); x.fill();
      x.strokeStyle = WHITE; x.lineWidth = 8; x.lineCap = "round";
      for (const [cx2, cy2, sx, sy] of [[250, 690, 1, 1], [830, 690, -1, 1], [250, 1320, 1, -1], [830, 1320, -1, -1]]) { x.beginPath(); x.moveTo(cx2, cy2 + sy * 50); x.lineTo(cx2, cy2); x.lineTo(cx2 + sx * 50, cy2); x.stroke(); }
      x.fillStyle = WHITE; x.strokeStyle = INK; x.lineWidth = 8; x.beginPath(); x.arc(540, 1290, 44 * (1 - 0.15 * flash(u, shot)), 0, Math.PI * 2); x.fill(); x.stroke();
      x.restore();
    }
    const fl = Math.max(0, 1 - Math.abs(u - shot) / 0.18) * 0.5;
    if (fl > 0) { x.save(); x.fillStyle = `rgba(255,255,255,${fl})`; rr(208, 628, 664, 754, 54); x.fill(); x.restore(); }
    const pk = Math.floor(back(shot + 0.35, shot + 0.7, u) * 4 + 1e-6) / 4;
    polaroid(CX, 1000, 0.62 * pk, u > shot + 0.35 ? 1 : 0, "DAY 1", -0.05);
    tag("FIRST CHECK", CX, 1330, GREEN, sm(at("s4", "first") - 0.05, at("s4", "first") + 0.2, u), 40);
  }
  if (id === "s5") {
    words(["COMPARE IT"], GREEN, 360, 0.0, 1, 140, flash(u, at("s5", "compare")) * 0.6);
    polaroid(CX, 640, 0.42, 1, "DAY 1", -0.04);
    const [dx, dy] = pin(V(DOOR_X + 1.5, 3.2, -2.0));
    tag("BACK", cl(dx, 160, 400), dy, GREEN, sm(at("s5", "back") - 0.1, at("s5", "back") + 0.1, u) * (1 - sm(at("s5", "compare"), at("s5", "compare") + 0.2, u)), 38);
    const kk = sm(at("s5", "photo") - 0.1, at("s5", "photo") + 0.15, u);
    tag("SAME?", 900, 845, GREEN, kk, 40);
  }
  if (id === "s6") {
    words(["CHECK IT", "AGAIN"], GREEN, 420, 0.0, 1, 150, flash(u, at("s6", "check")) * 0.6);
    const [tx, ty] = pin(V(MOVED.x, TOP + 0.4, SHELF_Z + 0.4));
    ring(tx, ty, 120, sm(at("s6", "moved") - 0.05, at("s6", "moved") + 0.15, u), RED);
    tag("MOVED", tx, ty + 150, RED, sm(at("s6", "moved") - 0.05, at("s6", "moved") + 0.15, u), 36);
    const [nx, ny] = pin(newG.localToWorld(V(0, 0.4, 0)));
    ring(nx, ny, 120, sm(at("s6", "new") - 0.05, at("s6", "new") + 0.15, u), RED);
    const relaxed = at("s6", "relax");
    tag("NEW", nx, ny - 170, RED, sm(at("s6", "new") - 0.05, at("s6", "new") + 0.15, u) * (1 - sm(at("s6", "again") - 0.05, at("s6", "again") + 0.1, u)), 36);
    tag("LENS? TURN IT", nx - 60, ny - 170, GREEN, sm(at("s6", "again") - 0.05, at("s6", "again") + 0.1, u), 36);
    stamp("v", nx - 230, ny + 40, back(relaxed - 0.1, relaxed + 0.2, u) * 0.55, u > relaxed - 0.1 ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.35)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["PHOTO THE ROOM", "CHECK AGAIN"], ORANGE, 520, 0.0, 1, 140, flash(u, 0.05) + flash(u, at("s7", "check")) * 0.6);
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
window.__hf.buildReady["recheck-bricks"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
