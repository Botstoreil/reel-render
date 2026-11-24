// airbnb-friends (Hidden Cam 32): REALISTIC RENDER look (like Apex 171K): physically based materials, image based light,
// soft shadows, a light daytime rental flat. Sets: living room + bedroom (inside), front of the house (outside).
// Screen text is a 2D overlay canvas. Time only from hf-seek.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };
const V = (a, b, c) => new THREE.Vector3(a, b, c);

// ---------- renderer ----------
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfdbe6);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(38, 1080 / 1920, 0.05, 200);

const hemi = new THREE.HemisphereLight(0xf4f7ff, 0x8a7560, 0.55); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0dc, 2.2);
sun.position.set(-6, 9, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -14, right: 30, top: 12, bottom: -12, near: 1, far: 60 });
sun.shadow.bias = -0.0004; sun.shadow.radius = 5; scene.add(sun);
sun.target.position.set(4, 0, -1); scene.add(sun.target);
const lamp = new THREE.PointLight(0xffc98a, 0, 7, 1.6); lamp.position.set(4.3, 1.3, -2.6); scene.add(lamp);

// ---------- materials + textures ----------
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const woodTex = canvasTex(1024, 1024, (g, w, h) => {
  const r = rng(3); const rows = 8;
  for (let i = 0; i < rows; i++) {
    let x0 = -r() * 400;
    while (x0 < w) {
      const L = 300 + r() * 380, tone = 150 + r() * 40;
      g.fillStyle = `rgb(${tone + 20},${tone - 25},${tone - 70})`; g.fillRect(x0, i * h / rows, L, h / rows);
      for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(80,45,20,${0.05 + r() * 0.08})`; g.lineWidth = 1 + r() * 2; const y = i * h / rows + r() * h / rows; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + L / 3, y + 4 - r() * 8, x0 + 2 * L / 3, y + 4 - r() * 8, x0 + L, y); g.stroke(); }
      g.fillStyle = "rgba(40,25,10,0.5)"; g.fillRect(x0, i * h / rows, 2, h / rows);
      x0 += L;
    }
    g.fillStyle = "rgba(40,25,10,0.45)"; g.fillRect(0, i * h / rows, w, 2);
  }
}, [3, 3]);
const rugTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#d9cfbf"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "#8c7a63"; g.lineWidth = 14; g.strokeRect(30, 30, w - 60, h - 60);
  g.lineWidth = 4; g.strokeRect(60, 60, w - 120, h - 120);
  const r = rng(9); for (let i = 0; i < 6000; i++) { g.fillStyle = `rgba(90,70,50,${r() * 0.08})`; g.fillRect(r() * w, r() * h, 2, 2); }
});
const plasterTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#efeae2"; g.fillRect(0, 0, w, h);
  const r = rng(5); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,110,95,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 3, 3); }
}, [4, 2]);
const M = {
  floor: new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.55, metalness: 0 }),
  wall: new THREE.MeshStandardMaterial({ map: plasterTex, roughness: 0.92 }),
  facade: new THREE.MeshStandardMaterial({ color: 0xe8dcc6, roughness: 0.95 }),
  fabric: new THREE.MeshStandardMaterial({ color: 0x5f7187, roughness: 0.95 }),
  cushion: new THREE.MeshStandardMaterial({ color: 0xc9a46a, roughness: 0.95 }),
  oak: new THREE.MeshStandardMaterial({ color: 0xa8784a, roughness: 0.6 }),
  darkwood: new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 0.55 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf6f6f4, roughness: 0.35 }),
  linen: new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.9 }),
  duvet: new THREE.MeshStandardMaterial({ color: 0xb9c7d3, roughness: 0.9 }),
  black: new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.25, metalness: 0.2 }),
  glass: new THREE.MeshStandardMaterial({ color: 0xbfd8ee, roughness: 0.05, metalness: 0.1, emissive: 0xcfe4f7, emissiveIntensity: 0.6 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 0.7 }),
  pot: new THREE.MeshStandardMaterial({ color: 0xc46b45, roughness: 0.8 }),
  rug: new THREE.MeshStandardMaterial({ map: rugTex, roughness: 1 }),
  grass: new THREE.MeshStandardMaterial({ color: 0x6f9a4c, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xb8b2a8, roughness: 0.9 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: 0.3, metalness: 0.8 }),
  case_: new THREE.MeshStandardMaterial({ color: 0xe9e9e6, roughness: 0.4 }),
  suitR: new THREE.MeshStandardMaterial({ color: 0xb0302a, roughness: 0.45 }),
  suitB: new THREE.MeshStandardMaterial({ color: 0x24456b, roughness: 0.45 }),
  suitY: new THREE.MeshStandardMaterial({ color: 0xd9a531, roughness: 0.45 }),
};
const geoCache = {};
const rbg = (w, h, d, r) => { const k = [w, h, d, r].map((v) => v.toFixed(3)).join("|"); return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1))); };
function rb(w, h, d, mat, r = 0.03) { const m = new THREE.Mesh(rbg(w, h, d, r), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function put(o, x, y, z, parent = scene) { o.position.set(x, y, z); parent.add(o); return o; }

// ---------- INSIDE: living room (x -5..0.5) + bedroom (x 0.7..6) ----------
const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 9), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0.5, 0, 0.5); floor.receiveShadow = true; scene.add(floor);
put(rb(11.6, 3.0, 0.2, M.wall, 0.01), 0.5, 1.5, -4.1);                 // back wall
put(rb(0.2, 3.0, 9, M.wall, 0.01), -5.4, 1.5, 0.4);                    // left wall
put(rb(0.2, 3.0, 2.6, M.wall, 0.01), 0.6, 1.5, -2.8);                  // partition (back part)
put(rb(0.2, 0.6, 1.4, M.wall, 0.01), 0.6, 2.7, -0.8);                  // partition over the doorway
put(rb(0.2, 3.0, 3.2, M.wall, 0.01), 0.6, 1.5, 1.4);                   // partition (front part)
// living-room window on the back wall
put(rb(2.2, 1.5, 0.06, M.glass, 0.01), -2.6, 1.7, -3.98);
[[-2.6, 2.48, 2.3, 0.08], [-2.6, 0.92, 2.3, 0.08]].forEach(([x, y, w, h]) => put(rb(w, h, 0.12, M.white, 0.01), x, y, -3.95));
[[-3.73], [-1.47], [-2.6]].forEach(([x]) => put(rb(0.08, 1.6, 0.12, M.white, 0.01), x, 1.7, -3.95));
// rug, sofa, coffee table, plant
const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), M.rug); rug.rotation.x = -Math.PI / 2; rug.position.set(-2.5, 0.005, -1.0); rug.receiveShadow = true; scene.add(rug);
const sofa = new THREE.Group();
put(rb(2.6, 0.42, 0.95, M.fabric, 0.08), 0, 0.33, 0, sofa);
put(rb(2.6, 0.6, 0.22, M.fabric, 0.08), 0, 0.72, -0.4, sofa);
put(rb(0.22, 0.55, 0.95, M.fabric, 0.08), -1.25, 0.5, 0, sofa);
put(rb(0.22, 0.55, 0.95, M.fabric, 0.08), 1.25, 0.5, 0, sofa);
put(rb(1.15, 0.16, 0.7, M.fabric, 0.07), -0.58, 0.62, 0.08, sofa);
put(rb(1.15, 0.16, 0.7, M.fabric, 0.07), 0.58, 0.62, 0.08, sofa);
put(rb(0.45, 0.42, 0.14, M.cushion, 0.06), -0.85, 0.85, -0.2, sofa).rotation.z = 0.15;
[[-1.1, -0.35], [1.1, -0.35], [-1.1, 0.35], [1.1, 0.35]].forEach(([x, z]) => put(rb(0.06, 0.12, 0.06, M.darkwood, 0.01), x, 0.06, z, sofa));
put(sofa, -2.5, 0, -3.35);
const table = new THREE.Group();
put(rb(1.3, 0.06, 0.7, M.oak, 0.02), 0, 0.42, 0, table);
[[-0.58, -0.28], [0.58, -0.28], [-0.58, 0.28], [0.58, 0.28]].forEach(([x, z]) => put(rb(0.05, 0.4, 0.05, M.darkwood, 0.01), x, 0.2, z, table));
put(rb(0.36, 0.04, 0.26, M.white, 0.01), 0.25, 0.47, 0.05, table);
put(table, -2.5, 0, -1.25);
function plant(x, z, s = 1) {
  const g = new THREE.Group();
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.42, 24), M.pot), 0, 0.21, 0, g).castShadow = true;
  const r = rng(Math.round(x * 100 + z));
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.2 + r() * 0.12, 16, 12), M.leaf); l.scale.set(1, 1.5, 0.5); l.rotation.set(r() - 0.5, r() * 6, r() - 0.5); put(l, (r() - 0.5) * 0.4, 0.62 + r() * 0.5, (r() - 0.5) * 0.4, g).castShadow = true; }
  g.scale.setScalar(s); put(g, x, 0, z); return g;
}
plant(-4.7, -3.5, 1.1);
// bookshelf on the side wall: the INDOOR camera sits on it, looking at the sofa
const shelf = new THREE.Group();
put(rb(0.4, 2.0, 1.4, M.oak, 0.02), 0, 1.0, 0, shelf);
[0.5, 1.0, 1.5].forEach((y) => put(rb(0.36, 0.03, 1.32, M.darkwood, 0.005), 0.02, y, 0, shelf));
const br = rng(21);
for (let k = 0; k < 3; k++) { let z = -0.6; while (z < 0.55) { const t = 0.06 + br() * 0.05, h = 0.3 + br() * 0.12; put(rb(0.26, h, t, new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(br(), 0.35, 0.45), roughness: 0.8 }), 0.005), 0.04, 0.03 + k * 0.5 + h / 2 + (k ? 0.0 : 0.02), z + t / 2, shelf); z += t + 0.005; } }
put(shelf, -5.08, 0, -0.6);
function camBox() { // small white home camera with a black lens and a red LED
  const g = new THREE.Group();
  put(rb(0.16, 0.16, 0.12, M.case_, 0.03), 0, 0.08, 0, g);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 24), M.black); ring.rotation.x = Math.PI / 2; put(ring, 0, 0.09, 0.065, g);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff2020, emissiveIntensity: 2 })); put(led, 0.05, 0.14, 0.06, g);
  put(rb(0.1, 0.02, 0.1, M.case_, 0.008), 0, 0.0, 0, g);
  return g;
}
const indoorCam = camBox(); indoorCam.position.set(-4.95, 2.03, -0.6); indoorCam.rotation.y = Math.PI / 2 + 0.55; scene.add(indoorCam);
// suitcases by the entrance (the friends just arrived)
function suitcase(mat, h) { const g = new THREE.Group(); put(rb(0.45, h, 0.26, mat, 0.05), 0, h / 2 + 0.04, 0, g); put(rb(0.22, 0.04, 0.04, M.black, 0.01), 0, h + 0.2, 0, g); [-0.08, 0.08].forEach((x) => put(rb(0.02, 0.2, 0.02, M.metal, 0.005), x, h + 0.1, 0, g)); return g; }
put(suitcase(M.suitR, 0.68), -1.0, 0, 1.6).rotation.y = 0.3;
put(suitcase(M.suitB, 0.6), -0.5, 0, 1.9).rotation.y = -0.2;
put(suitcase(M.suitY, 0.5), -1.5, 0, 2.0).rotation.y = 0.6;

// bedroom
const bed = new THREE.Group();
put(rb(2.0, 0.35, 2.3, M.oak, 0.03), 0, 0.2, 0, bed);
put(rb(1.9, 0.25, 2.2, M.linen, 0.08), 0, 0.5, 0, bed);
put(rb(1.96, 0.1, 1.5, M.duvet, 0.05), 0, 0.66, 0.36, bed);
put(rb(0.75, 0.16, 0.42, M.linen, 0.08), -0.45, 0.72, -0.82, bed);
put(rb(0.75, 0.16, 0.42, M.linen, 0.08), 0.45, 0.72, -0.82, bed);
put(rb(2.1, 1.1, 0.1, M.darkwood, 0.03), 0, 0.55, -1.15, bed);
put(bed, 3.0, 0, -2.85);
const night = new THREE.Group();
put(rb(0.5, 0.5, 0.42, M.oak, 0.02), 0, 0.25, 0, night);
put(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.06, 0.32, 16), M.metal), 0.1, 0.66, -0.05, night);
const shade = put(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.2, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xf3e7cf, roughness: 0.9, side: THREE.DoubleSide, emissive: 0xffd9a0, emissiveIntensity: 0.15 })), 0.1, 0.88, -0.05, night);
// the alarm clock with a hidden lens (s6)
const clock = new THREE.Group();
put(rb(0.22, 0.12, 0.09, M.black, 0.02), 0, 0.06, 0, clock);
const digits = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.05), new THREE.MeshStandardMaterial({ color: 0x220000, emissive: 0xff4b2a, emissiveIntensity: 1.2 })); put(digits, 0, 0.07, 0.046, clock);
const clockLensMat = new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.05, metalness: 0.5 });
const clockLens = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), clockLensMat); put(clockLens, 0.085, 0.028, 0.047, clock);
put(clock, -0.12, 0.5, 0.06, night); clock.rotation.y = 0.35;
put(night, 4.45, 0, -3.55);
// bathroom door on the bedroom's right wall
put(rb(0.2, 3.0, 9, M.wall, 0.01), 6.3, 1.5, 0.4);
const bathDoor = put(rb(0.06, 2.1, 0.9, M.white, 0.02), 6.18, 1.05, -1.6);
put(new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), M.metal), 6.13, 1.0, -1.25);
plant(1.2, -3.6, 0.8);

// ---------- OUTSIDE: front of the house (x 18..28) ----------
const OX = 23;
const lawn = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), M.grass); lawn.rotation.x = -Math.PI / 2; lawn.position.set(OX, 0, 2); lawn.receiveShadow = true; scene.add(lawn);
const path = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 7), M.stone); path.rotation.x = -Math.PI / 2; path.position.set(OX, 0.01, 1.5); path.receiveShadow = true; scene.add(path);
put(rb(12, 4.2, 0.4, M.facade, 0.02), OX, 2.1, -2.2);
put(rb(1.1, 2.2, 0.08, new THREE.MeshStandardMaterial({ color: 0x2f4b3a, roughness: 0.5 }), 0.02), OX, 1.1, -1.98);
put(new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), M.metal), OX + 0.4, 1.05, -1.9);
put(rb(1.5, 0.1, 0.5, M.stone, 0.02), OX, 0.05, -1.7);
const winOut = put(rb(1.5, 1.2, 0.06, M.glass, 0.01), OX - 2.6, 1.8, -1.98);
put(rb(1.7, 0.1, 0.2, M.white, 0.01), OX - 2.6, 1.15, -1.9);
put(rb(1.5, 1.2, 0.06, M.glass, 0.01), OX + 2.6, 1.8, -1.98);
put(rb(1.7, 0.1, 0.2, M.white, 0.01), OX + 2.6, 1.15, -1.9);
plant(OX - 1.2, -1.5, 0.9); plant(OX + 1.2, -1.5, 0.9);
// outdoor bullet camera above the door, pointing down the path (away from the house)
const outCam = new THREE.Group();
put(rb(0.1, 0.1, 0.06, M.case_, 0.02), 0, 0, 0, outCam);
const arm = put(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 12), M.case_), 0, -0.02, 0.1, outCam); arm.rotation.x = Math.PI / 2;
const bullet = new THREE.Group(); put(bullet, 0, -0.04, 0.22, outCam);
const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 24), M.case_); bb.rotation.x = Math.PI / 2; bb.castShadow = true; bullet.add(bb);
const bl = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 20), M.black); bl.rotation.x = Math.PI / 2; bl.position.z = 0.13; bullet.add(bl);
bullet.rotation.x = 0.35;
put(outCam, OX, 2.55, -1.95);

// ---------- phone with torch ----------
const phone = new THREE.Group();
put(rb(0.09, 0.18, 0.012, M.black, 0.012), 0, 0, 0, phone);
const led = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4 })); led.position.set(0.025, 0.07, -0.007); led.rotation.y = Math.PI; phone.add(led);
const torch = new THREE.SpotLight(0xfff4e0, 0, 9, 0.32, 0.5, 1.3); torch.castShadow = true; torch.shadow.mapSize.set(1024, 1024);
torch.position.set(0.025, 0.07, -0.02); phone.add(torch); scene.add(torch.target);
phone.visible = false; scene.add(phone);

// ---------- view cones ----------
function cone(hex) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 1, true), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  m.visible = false; m.renderOrder = 5; scene.add(m);
  const up = V(0, 1, 0), dir = V(0, 0, 0);
  m.set = (A, B, r0, r1, a) => {
    m.visible = a > 0.01; if (!m.visible) return;
    m.geometry.dispose(); m.geometry = new THREE.CylinderGeometry(r1, r0, 1, 32, 1, true);
    dir.copy(B).sub(A); const L = dir.length();
    m.position.copy(A).addScaledVector(dir, 0.5); m.scale.set(1, L, 1); m.quaternion.setFromUnitVectors(up, dir.normalize());
    m.material.opacity = a;
  };
  return m;
}
const redCone = cone(0xff3030), greenCone = cone(0x30e070), redCone2 = cone(0xff3030);

// ---------- camera shots ----------
const SH = {
  s1: { from: V(1.2, 3.6, 5.2), to: V(-1.6, 0.8, -1.2), push: 0.08 },
  s2: { from: V(-0.4, 2.0, 1.4), to: V(-3.6, 1.2, -1.6), push: 0.1 },
  s3: { from: V(-2.6, 1.9, 0.6), to: V(-4.9, 1.85, -0.6), push: 0.12 },
  s4: { from: V(OX + 2.2, 1.6, 6.5), to: V(OX, 1.7, -1.2), push: 0.1 },
  s5: { from: V(1.4, 2.0, 1.6), to: V(3.9, 0.7, -2.6), push: 0.08 },
  s6: { from: V(3.4, 1.2, -1.6), to: V(4.33, 0.55, -3.5), push: 0.18 },
  s7: { from: V(1.2, 3.6, 5.2), to: V(-1.6, 0.8, -1.2), push: 0.04 },
};
SH.s8 = SH.s7;
function shoot(id, k) {
  const s = SH[id];
  camera.position.lerpVectors(s.from, s.to, s.push * sm(0, 1, k));
  camera.lookAt(s.to); camera.updateMatrixWorld();
}
const tv = V(0, 0, 0);
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay ----------
const ov = document.createElement("canvas");
ov.width = 1080; ov.height = 1920;
ov.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:2";
document.getElementById("stage").appendChild(ov);
const x = ov.getContext("2d");
const RED = "#ff3b3b", GREEN = "#2fd47a", ORANGE = "#ff8a1f", WHITE = "#ffffff", INK = "#0e1116", YELLOW = "#ffd23f";
const CX = 500;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
let curU = 0;
// big words: white plate-free text, heavy black outline + soft shadow, rises in word by word
function words(lines, color, cy, t0, a = 1, maxPx = 140, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (800 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.54;
    parts.forEach((p, i) => {
      const s0 = t0 + wi * 0.07, k = back(s0, s0 + 0.28, curU), o = sm(s0, s0 + 0.1, curU);
      const sc = 1 + 0.12 * flashK;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(sc, sc); x.globalAlpha = a * o;
      x.shadowColor = "rgba(0,0,0,0.45)"; x.shadowBlur = 24; x.shadowOffsetY = 6;
      x.lineWidth = Math.max(10, px * 0.16); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.shadowColor = "transparent"; x.fillStyle = color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.08;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 40) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 48, h = px * 1.55;
  X = cl(X, 60 + w / 2, 930 - w / 2); Y = cl(Y, 300, 1150);
  const s = 0.75 + 0.25 * back(0, 1, a);
  x.globalAlpha = Math.min(1, a * 1.4); x.textAlign = "center"; x.textBaseline = "middle";
  x.translate(X, Y); x.scale(s, s);
  x.shadowColor = "rgba(0,0,0,0.35)"; x.shadowBlur = 18; x.shadowOffsetY = 5;
  x.fillStyle = color; rr(-w / 2, -h / 2, w, h, h / 2); x.fill();
  x.shadowColor = "transparent"; x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  for (const [lw, c] of [[40, INK], [24, color]]) {
    x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
    x.beginPath();
    if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); } else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
    x.stroke();
  }
  x.restore();
}
function ring(X, Y, r, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineWidth = 18; x.strokeStyle = INK; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 10; x.strokeStyle = color; x.stroke(); x.restore();
}

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  const U = (w, n) => at(id, w, n);
  shoot(id, cl(u / Math.max(0.5, d)));
  // defaults: daylight on, no torch, no cones
  sun.intensity = 2.2; hemi.intensity = 0.55; scene.environmentIntensity = 1; lamp.intensity = 0;
  phone.visible = false; torch.intensity = 0; clockLensMat.emissiveIntensity = 0;
  redCone.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0); redCone2.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0); greenCone.set(V(0, 0, 0), V(0, 1, 0), 0, 0, 0);
  const camEye = indoorCam.localToWorld(V(0, 0.09, 0.08));

  if (id === "s2" || id === "s3") {
    // the indoor camera covers the sofa
    const a = id === "s2" ? sm(U("camera") - 0.1, U("camera") + 0.25, u) : 1;
    redCone.set(camEye, V(-2.5, 0.6, -2.6), 0.03, 1.4, 0.22 * a);
  }
  if (id === "s4") {
    const tip = bullet.localToWorld(V(0, 0, 0.14));
    const a = sm(U("outdoor") - 0.1, U("outdoor") + 0.3, u);
    greenCone.set(tip, V(OX, 0.0, 4.2), 0.03, 1.5, 0.25 * a);
    // "never look inside": a red cone toward the window, struck out
    const n = sm(U("never") - 0.1, U("never") + 0.15, u);
    redCone2.set(tip, winOut.position.clone().add(V(0, 0, 0.1)), 0.03, 0.5, 0.3 * n * (1 - sm(U("inside") + 0.1, U("inside") + 0.5, u) * 0.4));
  }
  if (id === "s5" || id === "s6") {
    // lights off, phone torch sweeps the room
    sun.intensity = 0.25; hemi.intensity = 0.12; scene.environmentIntensity = 0.18; lamp.intensity = 0;
    phone.visible = true; torch.intensity = 26 * (id === "s5" ? sm(U("sweep") - 0.2, U("sweep"), u) : 1);
    let aim;
    if (id === "s5") {
      const a = sm(U("sweep"), U("bathroom") + 0.3, u);
      const P = [V(2.2, 0.6, -2.6), V(3.4, 0.7, -3.4), V(4.4, 0.6, -3.5), V(6.1, 1.1, -1.6)];
      const f = a * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f));
      aim = P[i].clone().lerp(P[i + 1], sm(0, 1, f - i));
      phone.position.set(2.0, 1.25, -0.6);
    } else {
      const a = sm(0, U("camera") + 0.2, u);
      aim = V(3.9, 0.6, -3.3).lerp(V(4.33, 0.56, -3.49), a);
      phone.position.set(3.6, 1.0, -2.1);
      // the glint on the clock
      clockLensMat.emissiveIntensity = 6 * sm(U("camera") - 0.15, U("camera"), u) * (0.75 + 0.25 * Math.sin(u * 18));
    }
    phone.lookAt(aim); phone.rotateY(Math.PI);
    torch.target.position.copy(aim); torch.target.updateMatrixWorld();
  }
  renderer.render(scene, camera);

  // ---------- text ----------
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920); curU = u;
  if (id === "s1") {
    words(["BOOKING AN AIRBNB", "WITH FRIENDS?"], RED, 450, 0.0, 1, 140, flash(u, U("airbnb")));
    tag("SEND THEM THIS FIRST", CX, 1110, "#e0262e", sm(U("send") - 0.05, U("send") + 0.25, u), 46);
  }
  if (id === "s2") {
    words(["CAMERA IN THE", "LIVING ROOM?"], RED, 430, 0.0, 1, 130, flash(u, U("camera")) * 0.6);
    const [cx, cy] = scr(camEye);
    ring(cx, cy, 70, sm(U("camera") - 0.05, U("camera") + 0.15, u), RED);
    tag("IT'S IN THE LISTING", cx + 220, cy + 150, RED, sm(U("listing") - 0.1, U("listing") + 0.2, u), 40);
  }
  if (id === "s3") {
    words(["BANNED"], RED, 400, at("s3", "banned") - 0.1, 1, 170, flash(u, U("banned")));
    words(["SINCE 2024"], WHITE, 560, at("s3", "2024") - 0.1, 1, 110, flash(u, U("2024")) * 0.6);
    const [cx, cy] = scr(camEye);
    stamp("x", cx, cy, back(U("not") - 0.05, U("not") + 0.25, u) * 0.85, u > U("not") - 0.05 ? 1 : 0, RED);
    tag("EVEN SHARED ROOMS", CX, 1110, RED, sm(U("shared") - 0.1, U("shared") + 0.2, u), 44);
  }
  if (id === "s4") {
    words(["OUTDOOR CAMERA:", "ALLOWED"], GREEN, 440, 0.0, 1, 120, flash(u, U("allowed")) * 0.6);
    const [cx, cy] = scr(outCam.localToWorld(V(0, 0, 0)));
    tag("IN THE LISTING", cx, cy + 180, GREEN, sm(U("listing") - 0.1, U("listing") + 0.2, u), 40);
    const [wx, wy] = scr(winOut.position);
    stamp("x", wx, wy, back(U("inside") - 0.05, U("inside") + 0.25, u) * 0.55, u > U("inside") - 0.05 ? 1 : 0, RED);
    tag("NEVER INSIDE", wx + 40, wy + 150, RED, sm(U("never") - 0.1, U("never") + 0.2, u), 40);
  }
  if (id === "s5") {
    words(["SWEEP BEDROOMS", "AND BATHROOM"], GREEN, 430, 0.0, 1, 130, flash(u, U("sweep")) * 0.6);
    tag("PHONE TORCH", CX, 1110, GREEN, sm(U("torch") - 0.1, U("torch") + 0.2, u), 44);
  }
  if (id === "s6") {
    const sw = U("take") - 0.1;
    words(["FOUND ONE?"], RED, 420, 0.0, 1 - sm(sw - 0.1, sw, u), 150);
    words(["PHOTO IT", "REPORT IT"], GREEN, 430, sw, sm(sw - 0.05, sw, u), 140, flash(u, U("report")) * 0.6);
    const [lx, ly] = scr(clock.localToWorld(V(0.085, 0.028, 0.047)));
    ring(lx, ly, 60, sm(U("camera") - 0.05, U("camera") + 0.15, u), RED);
    // camera-shutter flash on "photos"
    const fl = flash(u, U("photos") + 0.1) * 0.35;
    if (fl > 0) { x.save(); x.fillStyle = `rgba(255,255,255,${fl})`; x.fillRect(0, 0, 1080, 1920); x.restore(); }
    tag("REPORT TO AIRBNB", CX, 1110, GREEN, sm(U("report") - 0.1, U("report") + 0.2, u), 44);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.45)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["NO CAMERAS INSIDE", "NOT IN LIVING ROOM"], ORANGE, 560, 0.0, 1, 130, flash(u, 0.05) + flash(u, at("s7", "not")) * 0.6);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.75)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    words([c1], WHITE, 700, 0.1, 1, 130);
    words([c2], YELLOW, 860, 0.25, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1040, GREEN, sm(0.5, 0.8, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["airbnb-friends-real"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
