// oil-strip (Apex 13, TikTok) - TOY BRICKS style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-toy-bricks.mjs).
// Glossy studded bricks in three.js, soft studio light, 12 fps stop-motion steps for the set. Generic toy bricks only.
// A brick road to a junction. Wrong: a red bike rides down the dark oily centre strip, stops on it, foot down, slides.
// Right: a violet bike rides the clean tyre tracks, stops with its foot on dry road, keeps off the rainbow shine in the rain.
// Travel is toward -z (the junction). Time only from hf-seek.
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
scene.background = new THREE.Color(0xdfe9f5);
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
const C = { red: 0xd62828, blue: 0x1f5fd6, yellow: 0xf6b700, green: 0x2ea043, white: 0xf5f5f2, violet: 0x7c5cff, dark: 0x22222a, grey: 0x6b6f78, road: 0x575b63, grass: 0x5bb04a, sky: 0x8ec5f0, orange: 0xff7a00, tan: 0xd9c7a0 };
function shade(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function brick(w, h, d, mat, studs = true) {
  const m0 = typeof mat === "number" ? plastic(mat) : mat;
  const g = new THREE.Group();
  const m = shade(new THREE.Mesh(rbox(w - 0.02, h, d - 0.02), m0));
  m.position.y = h / 2; g.add(m);
  if (studs) {
    const nx = Math.max(1, Math.round(w / P)), nz = Math.max(1, Math.round(d / P));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const s = shade(new THREE.Mesh(studGeo, m0));
      s.position.set((i - (nx - 1) / 2) * (w / nx), h + 0.085, (j - (nz - 1) / 2) * (d / nz));
      g.add(s);
    }
  }
  return g;
}
function at3(o, x, y, z) { o.position.set(x, y, z); return o; }

// ---------- the set: grass baseplate, a brick road to a junction ----------
const RY = 0.24;               // road surface height
const STOPZ = -4.3;            // stop line
const TRK = 1.3;               // tyre tracks at x = +-TRK
{
  const NX = 26, NZ = 22, w = NX * P, d = NZ * P;
  const plate = shade(new THREE.Mesh(rbox(w, 0.32, d), plastic(C.grass)));
  plate.position.set(0, -0.16, 0); scene.add(plate);
  const inst = new THREE.InstancedMesh(studGeo, plastic(C.grass), NX * NZ);
  const M = new THREE.Matrix4(); let n = 0;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const X = (i - (NX - 1) / 2) * P, Z = (j - (NZ - 1) / 2) * P;
    if (Math.abs(X) < 3.3 || (Z < -4.4 && Z > -7.6)) continue; // no studs under the road
    M.makeTranslation(X, 0.085, Z); inst.setMatrixAt(n++, M);
  }
  inst.count = n; inst.receiveShadow = true; scene.add(inst);
  // smooth road tiles: our lane and the cross street
  scene.add(at3(brick(6.4, RY, 17.6, C.road, false), 0, 0, 0.2 + 1.6));
  scene.add(at3(brick(20.8, RY, 3.2, C.road, false), 0, 0, -6.0));
  // white edge lines + stop line
  scene.add(at3(brick(0.16, 0.03, 14.9, C.white, false), -3.0, RY, 3.15));
  scene.add(at3(brick(0.16, 0.03, 14.9, C.white, false), 3.0, RY, 3.15));
  scene.add(at3(brick(6.0, 0.03, 0.34, C.white, false), 0, RY, STOPZ));
  for (let i = 0; i < 6; i++) scene.add(at3(brick(0.9, 0.03, 0.16, C.white, false), -9 + i * 3.6, RY, -6.0));
  // traffic light on the right corner, red on
  const pole = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 12), plastic(C.dark))); pole.position.set(3.7, 1.6, -4.5); scene.add(pole);
  scene.add(at3(brick(0.5, 1.3, 0.4, C.dark, false), 3.7, 3.2, -4.5));
  const lampR = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 10), new THREE.MeshStandardMaterial({ color: 0x400000, emissive: 0xff2020, emissiveIntensity: 2.4 }));
  lampR.position.set(3.7, 4.2, -4.28); scene.add(lampR);
  [3.8, 3.4].forEach((y) => { const l = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 10), plastic(0x333333)); l.position.set(3.7, y, -4.28); scene.add(l); });
  // a few bushes on the grass
  [[-5.0, 2.0], [5.0, 3.5], [-5.4, -2.5], [5.6, -1.6], [-4.6, 6.0]].forEach(([bx, bz]) => {
    scene.add(at3(brick(1.6, 0.8, 1.6, C.green), bx, 0, bz));
    scene.add(at3(brick(0.8, 0.6, 0.8, C.green), bx, 0.8, bz));
  });
}

// the oily centre strip: dark, glossy
const oilMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0c12, roughness: 0.06, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02 });
const oil = new THREE.Group();
{
  const r = rng(5);
  for (let z = STOPZ + 0.5; z < 6.5; z += 0.8) {
    const w = 0.9 + 0.5 * r();
    const m = shade(new THREE.Mesh(rbox(w, 0.04, 0.84), oilMat)); m.position.set((r() - 0.5) * 0.25, RY + 0.02, z); oil.add(m);
  }
}
scene.add(oil);
// clean tyre tracks (green glow plates on the right way)
const trackMat = new THREE.MeshPhysicalMaterial({ color: C.green, roughness: 0.3, clearcoat: 0.85, transparent: true, opacity: 0, emissive: 0x1a7a30, emissiveIntensity: 0.4 });
const tracks = [-TRK, TRK].map((tx) => { const m = new THREE.Mesh(rbox(0.7, 0.03, 10.4), trackMat); m.position.set(tx, RY + 0.02, 1.0); m.visible = false; scene.add(m); return m; });
// rainbow shine on the oil in the rain
const bowCols = [0xff3b30, 0xff9500, 0xffd60a, 0x34c759, 0x0a84ff, 0x8e5cff];
const bow = bowCols.map((c, i) => {
  const m = new THREE.Mesh(rbox(0.16, 0.02, 7.6), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false }));
  m.position.set(-0.42 + i * 0.17, RY + 0.06, 1.4); m.visible = false; scene.add(m); return m;
});
// rain drops
const drops = []; { const r = rng(21); for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 6), new THREE.MeshBasicMaterial({ color: 0x6fb3ff, transparent: true, opacity: 0.8 })); m.userData = { x: (r() - 0.5) * 9, z: -5 + r() * 12, ph: r() }; m.visible = false; scene.add(m); drops.push(m); } }
// oil drips (fall from the car)
const drips = []; { const r = rng(9); for (let i = 0; i < 8; i++) { const m = shade(new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), oilMat)); m.userData = { x: (r() - 0.5) * 0.5, z: -3.4 + r() * 2.0, t: i * 0.12 }; m.visible = false; scene.add(m); drips.push(m); } }

// ---------- vehicles ----------
const wheelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.24, 24);
function wheel(r = 1) { const g = new THREE.Group(); const t = shade(new THREE.Mesh(wheelGeo, plastic(C.dark))); t.rotation.z = Math.PI / 2; g.add(t); const hub = shade(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.26, 16), plastic(0xbfbfbf))); hub.rotation.z = Math.PI / 2; g.add(hub); g.scale.setScalar(r); return g; }
// car, nose toward -z
function makeCar(hex) {
  const g = new THREE.Group();
  g.add(at3(brick(1.9, 0.62, 3.0, hex, false), 0, 0.3, 0));
  g.add(at3(brick(1.6, 0.55, 1.5, hex), 0, 0.92, 0.25));
  g.add(at3(brick(1.62, 0.36, 0.08, 0x9fd3ff, false), 0, 1.0, -0.52)); // windscreen
  g.add(at3(brick(1.62, 0.32, 0.08, 0x9fd3ff, false), 0, 1.02, 1.02));
  [[-0.95, -1.0], [0.95, -1.0], [-0.95, 1.0], [0.95, 1.0]].forEach(([wx, wz]) => g.add(at3(wheel(0.95), wx, 0.33, wz)));
  const bl = new THREE.MeshStandardMaterial({ color: 0x400000, emissive: 0xff1010, emissiveIntensity: 0 });
  [-0.65, 0.65].forEach((bx) => { const l = new THREE.Mesh(rbox(0.36, 0.16, 0.06), bl); l.position.set(bx, 0.72, 1.52); g.add(l); });
  g.userData.bl = bl;
  scene.add(g); return g;
}
const carA = makeCar(C.blue);
const carB = makeCar(C.yellow);
// motorcycle + rider, nose toward -z; feet: L/R legs that swing out to the ground
function makeBike(hex) {
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  body.add(at3(wheel(1), 0, 0.33, -0.68));
  body.add(at3(wheel(1), 0, 0.33, 0.68));
  body.add(at3(brick(0.36, 0.34, 1.1, hex, false), 0, 0.42, 0));           // frame
  body.add(at3(brick(0.5, 0.3, 0.55, hex, false), 0, 0.72, -0.3));          // tank
  body.add(at3(brick(0.42, 0.14, 0.6, C.dark, false), 0, 0.74, 0.3));       // seat
  body.add(at3(brick(0.08, 0.5, 0.08, 0xbfbfbf, false), 0, 0.55, -0.68));   // fork
  body.add(at3(brick(0.86, 0.08, 0.1, C.dark, false), 0, 1.02, -0.62));     // bars
  const tl = new THREE.MeshStandardMaterial({ color: 0x400000, emissive: 0xff1010, emissiveIntensity: 0.4 });
  const tail = new THREE.Mesh(rbox(0.2, 0.1, 0.06), tl); tail.position.set(0, 0.86, 0.62); body.add(tail);
  // rider
  body.add(at3(brick(0.56, 0.62, 0.36, C.dark, false), 0, 0.88, 0.2));    // torso (jacket)
  const helm = shade(new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), plastic(hex))); helm.position.set(0, 1.74, 0.12); body.add(helm);
  const visor = shade(new THREE.Mesh(rbox(0.34, 0.12, 0.08), plastic(0x111111))); visor.position.set(0, 1.76, -0.1); body.add(visor);
  [-0.3, 0.3].forEach((ax) => { const a = shade(new THREE.Mesh(rbox(0.14, 0.14, 0.7), plastic(C.dark))); a.position.set(ax, 1.28, -0.3); a.rotation.x = 0.5; body.add(a); });
  const legs = [-1, 1].map((sd) => {
    const piv = new THREE.Group(); piv.position.set(0.2 * sd, 0.92, 0.18); body.add(piv);
    const l = shade(new THREE.Mesh(rbox(0.16, 0.86, 0.18), plastic(C.dark))); l.position.y = -0.43; piv.add(l);
    const boot = shade(new THREE.Mesh(rbox(0.2, 0.12, 0.3), plastic(0x111111))); boot.position.set(0, -0.86, -0.06); piv.add(boot);
    piv.userData.sd = sd; return piv;
  });
  g.userData = { body, legs };
  scene.add(g); return g;
}
const bikeW = makeBike(C.red);
const bikeR = makeBike(C.violet);
// leg k: 0 = on the peg, 1 = foot down on the road beside the bike
function feet(b, kL, kR) { b.userData.legs.forEach((p) => { const k = p.userData.sd < 0 ? kL : kR; p.rotation.x = lerp(-0.85, 0, k); p.rotation.z = p.userData.sd * lerp(0.15, 0.42, k); }); }

// ground rings (where the foot goes)
function ringMesh(hex) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 10, 36), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = Math.PI / 2; m.visible = false; scene.add(m); return m; }
const ringG = ringMesh(0x22c55e), ringR = ringMesh(0xff2a2a);

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
const SHOTS = {
  s1: () => fit(boxPts(-3.2, 3.2, 0, 1.6, -5.0, 6.0), [0.25, 1.0, 1.1], [110, 640, 910, 1390]),
  s2: () => fit(boxPts(-2.2, 2.2, 0, 1.8, -4.6, 1.2), [0.7, 0.75, 1], [110, 660, 910, 1390]),
  s3: () => fit(boxPts(-1.9, 1.9, 0, 2.0, -1.2, 2.4), [0.95, 0.6, 0.8], [130, 660, 900, 1380]),
  s4: () => fit(boxPts(-3.2, 3.2, 0, 1.6, -4.5, 6.0), [-0.2, 1.0, 1.1], [110, 640, 910, 1390]),
  s5: () => fit(boxPts(-2.6, 1.0, 0, 2.0, -1.4, 1.8), [-0.8, 0.7, 0.9], [130, 660, 900, 1380]),
  s6: () => fit(boxPts(-3.0, 3.0, 0, 1.8, -3.0, 5.0), [0.15, 1.1, 1.0], [110, 660, 910, 1390]),
  s7: () => fit(boxPts(-3.2, 3.2, 0, 1.6, -5.0, 5.0), [0.3, 1.1, 1.0], [110, 820, 910, 1390]),
};
SHOTS.s8 = SHOTS.s7;
const shotCache = {};
function shoot(id, k) { const s = shotCache[id] || (shotCache[id] = SHOTS[id]()); place(s.look, s.dir, s.dist * lerp(1.07, 1.0, k)); }
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay text (toy plate labels) ----------
const ov = document.createElement("canvas");
ov.width = 1080; ov.height = 1920;
ov.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:2";
document.getElementById("stage").appendChild(ov);
const x = ov.getContext("2d");
const RED = "#e3242b", GREEN = "#1fae4b", ORANGE = "#ff7a00", WHITE = "#ffffff", INK = "#1b1b2f", VIO = "#7c5cff";
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
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.5, s = 0.6 + 0.4 * Math.floor(a * 4) / 4;
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 640, 1380);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(27,27,47,0.3)"; rr(-w / 2 + 6, -h / 2 + 8, w, h, 10); x.fill();
  x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 6;
  [-w / 4, w / 4].forEach((sx) => { rr(sx - 22, -h / 2 - 14, 44, 18, 6); x.fill(); x.stroke(); });
  rr(-w / 2, -h / 2, w, h, 10); x.fill(); x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  X = cl(X, 140, 880); Y = cl(Y, 680, 1340);
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
const CAR_STOP = STOPZ + 1.7; // car centre when its nose is at the stop line
function reset() {
  carA.position.set(0, RY, 30); carA.rotation.set(0, 0, 0); carA.userData.bl.emissiveIntensity = 0;
  carB.position.set(0, RY, 30); carB.userData.bl.emissiveIntensity = 0;
  for (const b of [bikeW, bikeR]) { b.position.set(0, RY, 40); b.rotation.set(0, 0, 0); b.userData.body.rotation.set(0, 0, 0); feet(b, 0, 0); }
  tracks.forEach((m) => (m.visible = false)); trackMat.opacity = 0;
  bow.forEach((m) => (m.visible = false));
  drops.forEach((m) => (m.visible = false)); drips.forEach((m) => (m.visible = false));
  ringG.visible = false; ringR.visible = false;
}
function showTracks(a) { trackMat.opacity = 0.55 * a; tracks.forEach((m) => (m.visible = a > 0.01)); }
function ring(m, X, Z, a) { m.visible = a > 0.01; m.position.set(X, RY + 0.05, Z); m.material.opacity = a; m.scale.setScalar(0.6 + 0.4 * a); }

function frame(t) {
  const tq = q(t);
  const { id, u: uq, d } = sceneOf(tq);
  reset();
  shoot(id, cl(uq / Math.max(0.5, d)));
  const U = (w, n) => at(id, w, n);

  if (id === "s1") {
    // the red bike rolls down the dark centre toward the junction; a car waits at the line
    carA.position.set(0, RY, CAR_STOP); carA.userData.bl.emissiveIntensity = 2;
    bikeW.position.set(0, RY, lerp(5.6, 0.6, sm(-0.2, d, uq)));
  }
  if (id === "s2") {
    // a car rolls up to the stop line and drips oil onto the centre
    const k = sm(-0.2, U("stop") + 0.35, uq);
    carA.position.set(0, RY, lerp(6, CAR_STOP, k)); carA.userData.bl.emissiveIntensity = 2 * k;
    const dt = U("drip");
    drips.forEach((m) => {
      const p = m.userData, f = cl((uq - dt - p.t) / 0.35);
      m.visible = uq > dt + p.t - 0.02;
      m.position.set(p.x, lerp(RY + 0.45, RY + 0.06, f), carA.position.z + (p.z - CAR_STOP) * 0.6);
      m.scale.set(1 + 1.6 * f, 1 - 0.7 * f, 1 + 1.6 * f);
    });
  }
  if (id === "s3") {
    // the red bike brakes on the strip, puts a foot down, and slides
    const stopK = sm(-0.2, U("brake") + 0.3, uq);
    bikeW.position.set(0, RY, lerp(2.6, 0.5, stopK));
    feet(bikeW, 0, sm(U("foot") - 0.15, U("foot") + 0.2, uq));
    const sl = sm(U("slides") - 0.1, U("slides") + 0.5, uq);
    bikeW.userData.body.rotation.z = -1.05 * sl;
    bikeW.position.x += 0.7 * sl; bikeW.rotation.y = 0.5 * sl;
    ringR.visible = false;
  }
  if (id === "s4") {
    const T = sm(U("tyre") - 0.15, U("tracks") + 0.2, uq);
    showTracks(T);
    carA.position.set(0, RY, CAR_STOP); carA.userData.bl.emissiveIntensity = 2;
    bikeR.position.set(-TRK, RY, lerp(6.0, 1.2, sm(-0.2, d, uq)));
  }
  if (id === "s5") {
    showTracks(1);
    carA.position.set(0, RY, CAR_STOP); carA.userData.bl.emissiveIntensity = 2;
    const stopK = sm(-0.2, U("stop") + 0.4, uq);
    bikeR.position.set(-TRK, RY, lerp(1.4, 0.3, stopK));
    const F = sm(U("foot") - 0.15, U("down") + 0.15, uq);
    feet(bikeR, F, 0);
    ring(ringG, -TRK - 0.48, 0.3, sm(U("dry") - 0.1, U("dry") + 0.15, uq));
    ring(ringR, 0.05, 0.3, sm(U("dark") - 0.1, U("dark") + 0.15, uq));
  }
  if (id === "s6") {
    showTracks(1);
    const R = sm(-0.3, U("rain") + 0.2, uq);
    drops.forEach((m) => { const p = m.userData; m.visible = R > 0.05; const f = (uq * 1.6 + p.ph) % 1; m.position.set(p.x, lerp(6, RY + 0.2, f), p.z); });
    const B = sm(U("rainbow") - 0.1, U("shine") + 0.15, uq);
    bow.forEach((m, i) => { m.visible = B > 0.01; m.material.opacity = 0.6 * B * (0.75 + 0.25 * Math.sin(uq * 5 + i)); });
    bikeR.position.set(-TRK, RY, lerp(5.0, -0.4, sm(-0.2, d, uq)));
  }
  if (id === "s7" || id === "s8") {
    showTracks(0.8);
    carA.position.set(0, RY, CAR_STOP); carA.userData.bl.emissiveIntensity = 2;
    bikeR.position.set(-TRK, RY, 0.3); feet(bikeR, 1, 0);
  }
  renderer.render(scene, camera);

  // ---------- overlay ----------
  const tt = sceneOf(t), u = tt.u; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const pin = (v, dy = 0) => { const [X, Y] = scr(v); return [X, Y + dy]; };
  if (id === "s1") {
    words(["NEVER RIDE", "THE MIDDLE"], RED, 430, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "middle"))));
    const [jx, jy] = pin(V(-1.6, RY, STOPZ - 0.4));
    tag("JUNCTION", jx, jy - 40, VIO, sm(at("s1", "junction") - 0.1, at("s1", "junction") + 0.2, u), 38);
    const [mx, my] = pin(V(0, RY, 3.5));
    tag("MIDDLE", mx + 170, my, RED, sm(at("s1", "middle") - 0.1, at("s1", "middle") + 0.2, u), 40);
  }
  if (id === "s2") {
    words(["OIL DRIPS", "IN THE CENTRE"], RED, 440, 0.0, 1, 140, flash(u, at("s2", "oil")) * 0.6);
    const [ox, oy] = pin(V(0, RY, -0.4));
    tag("OIL", ox, oy + 60, RED, sm(at("s2", "oil") - 0.05, at("s2", "oil") + 0.2, u), 44);
    tag("ALL DAY", 760, 700, RED, sm(at("s2", "all") - 0.1, at("s2", "day") + 0.1, u), 38);
  }
  if (id === "s3") {
    words(["FOOT DOWN.", "BIKE SLIDES."], RED, 430, 0.0, 1, 140, flash(u, at("s3", "slides")) * 0.6);
    const [fx, fy] = pin(V(0.6, RY, 0.5));
    tag("SLIPPERY", fx - 220, fy + 90, RED, sm(at("s3", "foot") - 0.05, at("s3", "foot") + 0.2, u), 38);
    const [sx, sy] = pin(V(0, 2.4, 0.5));
    const sT = at("s3", "slides");
    stamp("x", sx + 120, sy, back(sT, sT + 0.3, u) * 0.6, u > sT ? 1 : 0, RED);
  }
  if (id === "s4") {
    words(["RIDE THE", "TYRE TRACKS"], GREEN, 430, 0.0, 1, 150, flash(u, at("s4", "tracks")) * 0.6);
    const [tx, ty] = pin(V(TRK, RY, 3.5));
    tag("CLEAN", tx + 60, ty, GREEN, sm(at("s4", "clean") - 0.1, at("s4", "clean") + 0.2, u), 40);
  }
  if (id === "s5") {
    words(["FOOT ON", "DRY ROAD"], GREEN, 430, 0.0, 1, 150, flash(u, at("s5", "dry")) * 0.6);
    const [gx, gy] = pin(V(-TRK - 0.48, RY, 0.3));
    tag("DRY", gx, gy + 80, GREEN, sm(at("s5", "dry") - 0.1, at("s5", "dry") + 0.2, u), 42);
    const [rx, ry] = pin(V(0.1, RY, -0.6));
    tag("DARK STRIP", rx + 120, ry - 60, RED, sm(at("s5", "dark") - 0.1, at("s5", "strip") + 0.1, u), 38);
  }
  if (id === "s6") {
    words(["RAINBOW SHINE?", "KEEP OFF IT"], GREEN, 430, 0.0, 1, 140, flash(u, at("s6", "rainbow")) * 0.6);
    const [bx, by] = pin(V(0, RY, 2.2));
    tag("RAINBOW", bx + 160, by, RED, sm(at("s6", "rainbow") - 0.1, at("s6", "shine") + 0.1, u), 38);
    const kT = at("s6", "keep");
    const [vx, vy] = pin(V(-TRK, 2.4, 0.5));
    stamp("v", vx - 60, vy, back(kT, kT + 0.3, u) * 0.5, u > kT ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.35)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["RIDE THE TRACKS."], ORANGE, 430, 0.0, 1, 130, flash(u, 0.05));
    words(["KEEP OFF THE OIL."], ORANGE, 600, at("s7", "keep") - 0.05, 1, 130, flash(u, at("s7", "oily")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.floor(back(0.0, 0.35, u) * 4 + 1e-6) / 4;
    // a toy wheel seen from the side as the icon
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, k), Math.max(0.01, k)); x.rotate(u * 2); x.lineWidth = 10; x.strokeStyle = INK;
    x.fillStyle = "#22222a"; x.beginPath(); x.arc(0, 0, 130, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = "#bfbfbf"; x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = "#d62828"; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * 42, Math.sin(a) * 42, 13, 0, Math.PI * 2); x.fill(); }
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["oil-strip-bricks"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
