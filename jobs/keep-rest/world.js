// keep-rest: CGI MOTION style (style test 22.11, style 9). Smooth three.js with physical materials, soft shadows,
// an environment light, depth-of-field feel (blurred edges, sharp centre), slow camera dollies, realistic-ish
// proportions. No real brands or characters. Text is a full-res 2D overlay. Time only from hf-seek.
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
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

// ---------- renderer (half res, antialiased, smooth upscale) + DOF-feel compositing ----------
const LW = 540, LH = 960;
const out = document.getElementById("world");
const x = out.getContext("2d");
const glc = document.createElement("canvas"); glc.width = LW; glc.height = LH;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(LW, LH, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const sharp = document.createElement("canvas"); sharp.width = 1080; sharp.height = 1920;
const sx = sharp.getContext("2d");
function present(focusY = 1000, dim = 0) {
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.imageSmoothingEnabled = true; x.imageSmoothingQuality = "high";
  // blurred base (out of focus)
  x.filter = "blur(9px)"; x.drawImage(glc, 0, 0, 1080, 1920); x.filter = "none";
  // sharp centre band, feathered
  sx.globalCompositeOperation = "source-over"; sx.clearRect(0, 0, 1080, 1920);
  sx.imageSmoothingEnabled = true; sx.imageSmoothingQuality = "high";
  sx.drawImage(glc, 0, 0, 1080, 1920);
  sx.globalCompositeOperation = "destination-in";
  const g = sx.createLinearGradient(0, 0, 0, 1920);
  const f = cl(focusY / 1920, 0.25, 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(cl(f - 0.3), "rgba(0,0,0,0.15)"); g.addColorStop(cl(f - 0.14), "rgba(0,0,0,1)");
  g.addColorStop(cl(f + 0.14), "rgba(0,0,0,1)"); g.addColorStop(cl(f + 0.3), "rgba(0,0,0,0.15)"); g.addColorStop(1, "rgba(0,0,0,0)");
  sx.fillStyle = g; sx.fillRect(0, 0, 1080, 1920);
  sx.globalCompositeOperation = "source-over";
  x.drawImage(sharp, 0, 0);
  // vignette + film grain-free soft grade
  const v = x.createRadialGradient(540, 960, 500, 540, 960, 1250);
  v.addColorStop(0, "rgba(10,8,20,0)"); v.addColorStop(1, `rgba(10,8,20,${0.55 + dim * 0.3})`);
  x.fillStyle = v; x.fillRect(0, 0, 1080, 1920);
  if (dim > 0) { x.fillStyle = `rgba(10,8,24,${dim})`; x.fillRect(0, 0, 1080, 1920); }
}

// ---------- world: a warm yoga studio ----------
const scene = new THREE.Scene();
const BGC = 0x2c2436;
scene.background = new THREE.Color(BGC);
scene.fog = new THREE.Fog(BGC, 14, 40);
{
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;
}
const camera = new THREE.PerspectiveCamera(38, LW / LH, 0.1, 100);
const hemi = new THREE.HemisphereLight(0xffeedd, 0x2a2030, 0.6); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffd7a8, 2.6);
key.position.set(-5, 8, 5); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
scene.add(key);
const fill = new THREE.PointLight(0x9fb8ff, 6, 14, 1.6); fill.position.set(4, 3, 4); scene.add(fill);
const KEY0 = new THREE.Color(0xffd7a8), KEYI = 2.6;
const std = (hex, r = 0.55, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra });
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const add = (m) => { m.castShadow = true; m.receiveShadow = true; scene.add(m); return m; };

function woodTex() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
  const cols = ["#9a6a43", "#8f6240", "#a57249", "#93653f", "#8a5d3a", "#a06e46"];
  for (let i = 0; i < 8; i++) {
    g.fillStyle = cols[i % cols.length]; g.fillRect(0, i * 64, 512, 64);
    for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(60,35,18,${0.05 + 0.05 * ((k * 7) % 3)})`; g.lineWidth = 1; g.beginPath(); const yy = i * 64 + ((k * 37) % 62) + 1; g.moveTo(0, yy); g.bezierCurveTo(170, yy + 3, 340, yy - 3, 512, yy); g.stroke(); }
    g.fillStyle = "rgba(40,22,10,0.55)"; g.fillRect(0, i * 64 + 62, 512, 2); g.fillRect((i * 173 + 90) % 512, i * 64, 2, 64);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), std(0xffffff, 0.38, { map: woodTex() }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), std(0xd9cfc4, 0.9)); wall.position.set(0, 6, -5); wall.receiveShadow = true; scene.add(wall);
  const skirt = add(new THREE.Mesh(new THREE.BoxGeometry(40, 0.18, 0.06), std(0xefe8e0, 0.5))); skirt.position.set(0, 0.09, -4.96);
  for (const wx of [-4.5, 0, 4.5]) {
    const fr = add(new THREE.Mesh(new RoundedBoxGeometry(2.3, 3.4, 0.12, 3, 0.04), std(0x2e2a2c, 0.4))); fr.position.set(wx, 4.6, -4.93);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 3.2), new THREE.MeshBasicMaterial({ color: 0xffe2b8 })); gl.position.set(wx, 4.6, -4.86); scene.add(gl);
  }
  // a plant in the corner
  const pot = add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.5, 32), std(0xc9b8a6, 0.7))); pot.position.set(-3.2, 0.25, -3.6);
  for (let i = 0; i < 9; i++) { const lf = add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), std(0x3f7a4a, 0.6))); lf.scale.set(0.5, 1.4, 0.25); const a = i * 0.7; lf.position.set(-3.2 + Math.cos(a) * 0.18, 0.75 + (i % 3) * 0.18, -3.6 + Math.sin(a) * 0.18); lf.rotation.set(Math.sin(a) * 0.5, a, Math.cos(a) * 0.5); }
}

// ---------- person (faces +x). Seated frame: root at floor, legs forward, b1 = trunk tilt (-PI/2 lying, 0 sitting) ----------
function limb(len, r, mat) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 6, 16), mat); m.position.y = -len / 2; m.castShadow = true; m.receiveShadow = true; return m; }
function makePerson(shirtHex) {
  const skin = std(0xc98e6a, 0.5), shirt = std(shirtHex, 0.7), pants = std(0x2d2a3a, 0.75), hair = std(0x2b1d17, 0.8);
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const hip = new THREE.Group(); hip.position.y = 0.95; body.add(hip);
  const legs = [-0.1, 0.1].map((zo) => {
    const th = new THREE.Group(); th.position.z = zo; th.add(limb(0.46, 0.085, pants));
    const sh = new THREE.Group(); sh.position.y = -0.46; sh.add(limb(0.46, 0.065, pants));
    const ft = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.07, 0.09, 2, 0.03), skin); ft.position.set(0.06, -0.47, 0); ft.castShadow = true; sh.add(ft);
    th.add(sh); hip.add(th); return { th, sh };
  });
  const t1 = new THREE.Group(); hip.add(t1);
  const pel = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.08, 6, 16), pants); pel.rotation.x = Math.PI / 2; pel.scale.set(0.85, 1, 1); pel.position.y = 0.06; pel.castShadow = true; t1.add(pel);
  const t2 = new THREE.Group(); t2.position.y = 0.22; t1.add(t2);
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.22, 8, 20), shirt); chest.scale.set(0.8, 1, 1.15); chest.position.y = 0.2; chest.castShadow = true; t2.add(chest);
  const nk = new THREE.Group(); nk.position.y = 0.46; t2.add(nk);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 16), skin); neck.position.y = 0.02; nk.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 24), skin); head.scale.set(1, 1.15, 0.95); head.position.set(0.01, 0.17, 0); head.castShadow = true; nk.add(head);
  const hr = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hr.scale.set(1.02, 1.12, 0.98); hr.position.set(-0.01, 0.185, 0); hr.rotation.z = 0.35; nk.add(hr);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 16), hair); bun.position.set(-0.11, 0.25, 0); nk.add(bun);
  const arms = [-0.21, 0.21].map((zo) => {
    const ua = new THREE.Group(); ua.position.set(0, 0.36, zo); ua.add(limb(0.29, 0.05, skin));
    const fa = new THREE.Group(); fa.position.y = -0.29; fa.add(limb(0.27, 0.042, skin));
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), skin); hand.position.y = -0.29; hand.scale.set(0.8, 1.2, 0.6); fa.add(hand);
    ua.add(fa); t2.add(ua); return { ua, fa };
  });
  scene.add(root);
  const wv = new THREE.Vector3();
  return {
    root, body, shirt, chest,
    // p: b1 trunk tilt, n neck, s shoulder, e elbow, h hip (+ = thigh forward), k knee, seated (0 standing / 1 floor)
    set(p) {
      t1.rotation.z = -p.b1; t2.rotation.z = -(p.b2 || 0); nk.rotation.z = -(p.n || 0);
      arms.forEach((a, i) => { a.ua.rotation.z = p.s + (i ? p.sw || 0 : -(p.sw || 0)); a.fa.rotation.z = p.e; });
      legs.forEach((l, i) => { l.th.rotation.z = p.h + (i ? -(p.lw || 0) : p.lw || 0); l.sh.rotation.z = -p.k; });
      body.position.y = -(p.seat || 0) * 0.87;
    },
    wp(name) { root.updateMatrixWorld(true); return ({ head }[name] || head).getWorldPosition(wv).clone(); },
  };
}
const P = {
  stand: { b1: 0, n: 0, s: 0.06, e: 0.12, h: 0, k: 0, seat: 0 },
  lie: { b1: -Math.PI / 2, n: 0.1, s: 0.12, e: 0, h: Math.PI / 2, k: 0, seat: 1 },
  sit: { b1: -0.05, n: 0.1, s: 0.25, e: 0.6, h: Math.PI / 2, k: 0.15, seat: 1 },
};
const pose = (a, b, k) => { const o = {}; for (const j in a) o[j] = lerp(a[j], b[j] ?? a[j], k); return o; };
const C3 = { violet: 0x7b6cff, green: 0x2fbf71, red: 0xe5484d, orange: 0xff8a1a, sand: 0xe9dccb };
const people = [makePerson(C3.violet), makePerson(C3.violet), makePerson(C3.violet)];

const mats = [0, 1].map(() => add(new THREE.Mesh(new RoundedBoxGeometry(2.0, 0.035, 0.68, 2, 0.015), std(C3.green, 0.85))));
const pillow = add(new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.1, 0.5, 4, 0.05), std(0xf2ece4, 0.9)));
const blanket = add(new THREE.Mesh(new RoundedBoxGeometry(0.75, 0.06, 0.62, 4, 0.03), std(0xc9a98a, 0.95)));

// class plan blocks
const blockGeo = new RoundedBoxGeometry(1, 0.62, 0.62, 5, 0.09);
const blocks = Array.from({ length: 5 }, () => add(new THREE.Mesh(blockGeo, new THREE.MeshPhysicalMaterial({ color: C3.violet, roughness: 0.35, clearcoat: 0.8, clearcoatRoughness: 0.2 }))));
const shelf = add(new THREE.Mesh(new RoundedBoxGeometry(5.6, 0.12, 1.0, 3, 0.04), std(0xefe6da, 0.45)));
const dome = new THREE.Mesh(new RoundedBoxGeometry(1.25, 0.95, 0.95, 5, 0.12), new THREE.MeshPhysicalMaterial({ color: 0xdfffee, roughness: 0.05, transmission: 0.9, thickness: 0.3, transparent: true, opacity: 0.55 }));
scene.add(dome);

// wall clock
const clockG = new THREE.Group(); scene.add(clockG);
{
  const face = add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.08, 64), std(0xfaf6f0, 0.3)));
  face.rotation.x = Math.PI / 2; clockG.add(face);
  const rim = add(new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 16, 64), std(0x2e2a2c, 0.3, { metalness: 0.4 }))); clockG.add(rim);
  for (let i = 0; i < 12; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.03, i % 3 ? 0.06 : 0.12, 0.02), std(0x2e2a2c)); const a = (i / 12) * Math.PI * 2; tk.position.set(Math.sin(a) * 0.5, Math.cos(a) * 0.5, 0.05); tk.rotation.z = -a; clockG.add(tk); }
}
const hourH = new THREE.Group(), minH = new THREE.Group();
{
  const hm = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.3, 0.02, 2, 0.01), std(0x2e2a2c)); hm.position.y = 0.13; hourH.add(hm);
  const mm = new THREE.Mesh(new RoundedBoxGeometry(0.035, 0.45, 0.02, 2, 0.01), std(C3.orange, 0.4)); mm.position.y = 0.2; minH.add(mm);
  hourH.position.z = 0.06; minH.position.z = 0.075; clockG.add(hourH); clockG.add(minH);
}

// door (right side wall-ish, facing camera)
const doorG = new THREE.Group(); scene.add(doorG);
const doorPanel = new THREE.Group();
{
  const fr = add(new THREE.Mesh(new RoundedBoxGeometry(1.35, 2.35, 0.12, 3, 0.03), std(0xefe8e0, 0.5))); fr.position.y = 1.17; doorG.add(fr);
  const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.18), new THREE.MeshBasicMaterial({ color: 0xfff1d6 })); hole.position.set(0, 1.09, 0.065); doorG.add(hole);
  const pn = add(new THREE.Mesh(new RoundedBoxGeometry(1.1, 2.18, 0.06, 3, 0.02), std(0x8a6a50, 0.5))); pn.position.set(0.55, 1.09, 0); doorPanel.add(pn);
  doorPanel.position.set(-0.55, 0, 0.1); doorG.add(doorPanel);
}

// turntable for the end card
const table = add(new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.14, 64), new THREE.MeshPhysicalMaterial({ color: 0x2b2440, roughness: 0.3, clearcoat: 1 })));

// ---------- camera: fit points into a screen box, then a slow dolly + drift ----------
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
// [points, direction, screen box, orbit amount, focus y]
const PLAN_PTS = () => boxPts(-2.8, 2.8, 0.9, 2.0, -0.5, 0.5);
const CLOCK_Y = 2.7;
const SHOTS = {
  s1: () => fit(boxPts(-2.8, 2.8, 0.9, 3.1, -0.5, 0.5), [0.25, 0.18, 1], [70, 560, 1010, 1110]),
  s2: () => fit(boxPts(-1.1, 1.1, 0, 0.5, -0.4, 0.4), [0.35, 0.7, 1], [130, 900, 950, 1300]),
  s3: () => fit(boxPts(-2.4, 2.4, 0, 2.4, -0.3, 0.3), [-0.15, 0.22, 1], [100, 640, 940, 1420]),
  s4: () => fit(PLAN_PTS(), [-0.2, 0.25, 1], [70, 760, 1010, 1110]),
  s5: () => fit(boxPts(-2.8, 2.8, 0.9, 3.1, -0.5, 0.5), [0.2, 0.2, 1], [70, 560, 1010, 1100]),
  s6: () => fit(boxPts(-1.1, 1.1, 0, 1.0, -0.4, 0.4), [0.3, 0.45, 1], [140, 820, 940, 1360]),
  s7: () => fit(boxPts(-1.1, 1.1, 0, 0.5, -0.4, 0.4), [0.1, 1.2, 1], [180, 1000, 900, 1400]),
  s8: () => fit(boxPts(-0.6, 0.6, 0, 1.0, -0.6, 0.6), [0, 0.3, 1], [400, 380, 680, 760]),
};
const ORBIT = { s1: 0.14, s2: 0.18, s3: -0.12, s4: 0.12, s5: -0.12, s6: 0.16, s7: 0.1, s8: 0 };
const shotCache = {};
const yAxis = V(0, 1, 0);
function shoot(id, u, d) {
  const s = shotCache[id] || (shotCache[id] = SHOTS[id]());
  const k = sm(-0.2, Math.max(0.6, d) + 0.2, u);
  const dir = s.dir.clone().applyAxisAngle(yAxis, lerp(-0.5, 0.5, k) * ORBIT[id]);
  place(s.look, dir, s.dist * lerp(1.07, 0.99, k));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay (full res, clean CGI titles) ----------
const RED = "#ff5a5f", GREEN = "#46e08f", VIOLET = "#a596ff", ORANGE = "#ffa040", WHITE = "#ffffff", INK = "#120e1c";
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
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 30); x.globalAlpha = a * o;
      x.shadowColor = "rgba(0,0,0,0.55)"; x.shadowBlur = 30; x.shadowOffsetY = 8;
      x.lineWidth = Math.max(8, px * 0.1); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.shadowColor = "transparent";
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.7) : color; x.fillText(p, 0, 0);
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
  const w = x.measureText(txt).width + 50, h = px * 1.55, s = 0.85 + 0.15 * cl(a);
  X = cl(X, 70 + w / 2, 1010 - w / 2); Y = cl(Y, 300, 1440);
  x.translate(X, Y + (1 - cl(a)) * 16); x.scale(s, s);
  x.shadowColor = "rgba(0,0,0,0.5)"; x.shadowBlur = 24; x.shadowOffsetY = 6;
  x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h / 2); x.fillStyle = "rgba(18,14,28,0.82)"; x.fill();
  x.shadowColor = "transparent"; x.lineWidth = 5; x.strokeStyle = color; x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function lockIcon(X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s);
  x.shadowColor = "rgba(0,0,0,0.5)"; x.shadowBlur = 20;
  x.lineWidth = 14; x.strokeStyle = c; x.beginPath(); x.arc(0, -30, 34, Math.PI, 0); x.lineTo(34, 0); x.moveTo(-34, 0); x.lineTo(-34, -30); x.stroke();
  x.beginPath(); x.roundRect(-52, -4, 104, 80, 16); x.fillStyle = c; x.fill();
  x.shadowColor = "transparent"; x.fillStyle = INK; x.beginPath(); x.arc(0, 26, 11, 0, Math.PI * 2); x.fill(); x.fillRect(-5, 30, 10, 26);
  x.restore();
}

// ---------- one frame ----------
const SHIRT = (q, hex) => q.shirt.color.set(hex);
function reset() {
  people.forEach((p) => { p.root.visible = false; p.root.position.set(0, 0, 0); p.root.rotation.set(0, 0, 0); p.root.scale.setScalar(1); p.set(P.stand); SHIRT(p, C3.violet); p.chest.scale.set(0.8, 1, 1.15); });
  mats.forEach((m) => { m.visible = false; m.scale.setScalar(1); m.rotation.set(0, 0, 0); });
  pillow.visible = blanket.visible = false;
  blocks.forEach((m) => { m.visible = false; m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1); });
  shelf.visible = false; dome.visible = false; clockG.visible = false; doorG.visible = false; table.visible = false;
  key.color.copy(KEY0); key.intensity = KEYI; hemi.intensity = 0.6;
}
const putMat = (i, X, Z, hex) => { const m = mats[i]; m.visible = true; m.position.set(X, 0.018, Z); m.material.color.set(hex); return m; };
const putPerson = (i, X, Z, p, hex) => { const q = people[i]; q.root.visible = true; q.root.position.set(X, 0, Z); q.set(p); SHIRT(q, hex); return q; };
// a lying student centred on a mat: root x so the body (hip at root) is centred
function lying(i, X, Z, hex, p = P.lie) { const q = putPerson(i, X - 0.1, Z, p, hex); pillow.visible = true; pillow.position.set(X - 0.95, 0.07, Z); return q; }
// plan row: items [{c, w, dx, dy, rot, a}] centred on the shelf at y
function planRow(items, y = 1.4) {
  shelf.visible = true; shelf.position.set(0, y - 0.37, 0);
  const gap = 0.12, tot = items.reduce((s, it) => s + it.w, 0) + gap * (items.length - 1);
  let X = -tot / 2; const pos = [];
  items.forEach((it, i) => {
    const m = blocks[i]; const a = it.a ?? 1;
    m.visible = a > 0.01; m.material.color.set(it.c);
    m.scale.set(it.w, 1, 1).multiplyScalar(Math.max(0.001, a));
    m.position.set(X + it.w / 2 + (it.dx || 0), y + (it.dy || 0), 0);
    m.rotation.set(0, 0, it.rot || 0);
    pos.push(m.position.clone()); X += it.w + gap;
  });
  return pos;
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  shoot(id, u, d);
  const U = (w, n) => at(id, w, n);
  const L = {};
  let focusY = 1000, dim = 0;

  if (id === "s1") {
    clockG.visible = true; clockG.position.set(0.4, CLOCK_Y, -0.3); clockG.scale.setScalar(0.8);
    const spin = u * 9; minH.rotation.z = -spin; hourH.rotation.z = -spin / 12;
    const fall = sm(U("rest") - 0.05, U("save") + 0.25, u);
    L.pos = planRow([
      { c: C3.violet, w: 1.35 }, { c: C3.violet, w: 1.2 }, { c: C3.violet, w: 1.0 },
      { c: fall > 0.05 ? C3.red : C3.green, w: 0.95, dx: 0.9 * fall, dy: -2.2 * fall * fall, rot: -1.3 * fall, a: 1 },
    ]);
    L.fall = fall; focusY = 880;
  }
  if (id === "s2") {
    const br = 0.5 + 0.5 * Math.sin(u * 2.4);
    putMat(0, 0, 0, C3.green);
    const q = lying(0, 0, 0, C3.green, { ...P.lie, s: 0.18 });
    q.chest.scale.set(0.8 + 0.05 * br, 1, 1.15 + 0.03 * br);
    blanket.visible = true; blanket.position.set(0.55, 0.13, 0);
    const calm = sm(U("quiet") - 0.3, U("land") + 0.2, u);
    key.intensity = KEYI * lerp(1, 0.7, calm); key.color.set(0xffd7a8).lerp(new THREE.Color(0xffb27a), calm);
    L.calm = calm; focusY = 1100;
  }
  if (id === "s3") {
    doorG.visible = true; doorG.position.set(2.1, 0, -0.6);
    const open = sm(U("sends") - 0.3, U("sends"), u); doorPanel.rotation.y = -1.4 * open;
    const go = sm(U("sends") - 0.1, U("rush") + 0.25, u);
    [0, 1, 2].forEach((i) => {
      const k = cl(go * 1.35 - i * 0.18);
      const X = lerp(-2.2 + i * 0.75, 2.1, k), Z = lerp(0.4 - i * 0.15, -0.6, k);
      const sw = Math.sin(u * 13 + i * 1.7) * Math.min(1, k * 8) * (1 - sm(0.9, 1, k));
      const q = putPerson(i, X, Z, { ...P.stand, b1: 0.12 * Math.min(1, k * 6), n: -0.1, s: 0.06, sw: 0.55 * sw, e: 0.5, lw: 0.5 * sw, k: 0.2 * Math.abs(sw) }, C3.red);
      q.root.position.y = 0.03 * Math.abs(sw);
      q.root.visible = k < 0.98;
      q.root.rotation.y = Math.atan2(-(Z - (0.4 - i * 0.15)), 4.3 - (-2.2 + i * 0.75)) * 0.6;
    });
    L.go = go; focusY = 1050;
  }
  if (id === "s4") {
    const R = back(U("last") - 0.1, U("minutes") + 0.1, u);
    L.pos = planRow([{ c: C3.violet, w: 1.35 }, { c: C3.violet, w: 1.2 }, { c: C3.violet, w: 1.0 }, { c: C3.green, w: 0.95, a: cl(R) }]);
    const D = sm(U("protected") - 0.25, U("protected") + 0.15, u);
    dome.visible = D > 0.01; dome.position.copy(L.pos[3]).add(V(0, 1.6 * (1 - D) + 0.02, 0)); dome.material.opacity = 0.55 * D;
    L.D = D; focusY = 900;
  }
  if (id === "s5") {
    clockG.visible = true; clockG.position.set(1.9, CLOCK_Y, -0.3); clockG.scale.setScalar(0.8);
    const spin = u * 6; minH.rotation.z = -spin; hourH.rotation.z = -spin / 12;
    const pop = sm(U("pose") - 0.1, U("middle") + 0.2, u);
    const close = sm(U("middle") + 0.05, U("instead") + 0.25, u);
    L.pos = planRow([
      { c: C3.violet, w: 1.0, dx: 0.42 * close }, { c: C3.violet, w: 0.85, dx: 0.42 * close },
      { c: pop > 0.08 ? C3.orange : C3.violet, w: 0.85, dy: 2.4 * pop * pop, rot: 0.5 * pop, a: 1 - sm(0.8, 1, pop) },
      { c: C3.violet, w: 1.0, dx: -0.42 * close }, { c: C3.green, w: 0.95, dx: -0.42 * close },
    ]);
    L.pop = pop; L.close = close; focusY = 880;
  }
  if (id === "s6") {
    const k1 = sm(U("come") - 0.15, U("up") + 0.15, u), k2 = sm(U("slowly") - 0.05, U("end") + 0.35, u);
    putMat(0, 0, 0, C3.green);
    const p = pose(P.lie, P.sit, k2);
    const q = lying(0, 0, 0, C3.green, p);
    q.root.rotation.x = 0.85 * k1 * (1 - k2);
    q.root.position.z = -0.12 * k1 * (1 - k2);
    focusY = 1100;
  }
  if (id === "s7") {
    putMat(0, 0, 0, C3.green);
    lying(0, 0, 0, C3.green, { ...P.lie, s: 0.18 });
    blanket.visible = true; blanket.position.set(0.55, 0.13, 0);
    key.intensity = KEYI * 0.6; dim = 0.45; focusY = 1200;
  }
  if (id === "s8") {
    table.visible = true; table.position.set(0, 0.07, 0);
    const q = putPerson(0, 0.05, 0, P.sit, C3.violet);
    q.root.position.y = 0.14; q.root.rotation.y = 0.6 + u * 0.9;
    dim = 0.35; focusY = 560;
  }
  scene.traverse((o) => { if (o.isMesh && o.material && o.material.transparent && o !== dome) o.castShadow = false; });
  renderer.render(scene, camera);
  present(focusY, dim);

  // ---------- overlay ----------
  if (id === "s1") {
    const [cx, cy] = scr(V(0.4, CLOCK_Y, -0.3));
    tag("RUNNING LATE", cx - 300, cy, ORANGE, sm(0, 0.3, u), 40);
    const names = ["WARM UP", "FLOW", "PEAK", "REST"];
    L.pos.forEach((p, i) => { const [X, Y] = scr(p); tag(names[i], X, Y, i === 3 ? (L.fall > 0.05 ? RED : GREEN) : VIOLET, (i === 3 ? 1 - sm(0.4, 0.8, L.fall) : 1) * sm(0.05, 0.35, u), 30); });
    words(["NEVER CUT", "THE FINAL REST"], RED, 380, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, U("never"))));
  }
  if (id === "s2") {
    tag("QUIET MOMENT", CX, 640, GREEN, sm(U("quiet") - 0.05, U("moment") + 0.1, u), 44);
    tag("TO LAND", CX, 1420, GREEN, sm(U("land") - 0.1, U("land") + 0.15, u), 44);
    words(["THE REST", "IS THE LANDING"], GREEN, 380, 0.0, 1, 140, flash(u, U("land")) * 0.6);
  }
  if (id === "s3") {
    tag("IN A RUSH", CX, 1400, RED, sm(U("rush") - 0.1, U("rush") + 0.15, u), 44);
    words(["SKIP IT =", "RUSHED EXIT"], RED, 380, 0.0, 1, 140, flash(u, U("rush")) * 0.6);
  }
  if (id === "s4") {
    const names = ["WARM UP", "FLOW", "PEAK", "REST"];
    L.pos.forEach((p, i) => { const [X, Y] = scr(p); tag(names[i], X, Y, i === 3 ? GREEN : VIOLET, i === 3 ? sm(U("last"), U("five"), u) : sm(-0.05, 0.25, u), 30); });
    const [rx, ry] = scr(L.pos[3]);
    tag("LAST 5 MIN", rx, ry - 150, GREEN, sm(U("five") - 0.1, U("minutes") + 0.1, u), 36);
    lockIcon(rx, ry - 300, 0.8 * back(U("protected") - 0.1, U("protected") + 0.3, u), L.D, GREEN);
    words(["PROTECT THE", "LAST 5 MINUTES"], GREEN, 380, 0.0, 1, 140, flash(u, U("protected")) * 0.6);
  }
  if (id === "s5") {
    const [cx, cy] = scr(V(1.9, CLOCK_Y, -0.3));
    tag("RUN OVER?", cx - 330, cy, ORANGE, sm(U("run") - 0.1, U("over") + 0.1, u), 40);
    const names = ["WARM", "POSE", "POSE", "PEAK", "REST"];
    L.pos.forEach((p, i) => { if (i === 2 && L.pop > 0.3) return; const [X, Y] = scr(p); tag(names[i], X, Y, i === 4 ? GREEN : VIOLET, sm(-0.05, 0.25, u), 26); });
    tag("CUT FROM THE MIDDLE", CX, 1180, ORANGE, sm(U("middle") - 0.05, U("middle") + 0.2, u), 40);
    words(["CUT A POSE", "INSTEAD"], GREEN, 380, 0.0, 1, 140, flash(u, U("instead")) * 0.6);
  }
  if (id === "s6") {
    tag("COME UP SLOWLY", CX, 700, GREEN, sm(U("clear") - 0.15, U("cue") + 0.1, u), 50);
    words(["CUE THE", "WAY UP"], GREEN, 380, 0.0, 1, 150);
  }
  if (id === "s7") {
    words(["PROTECT"], ORANGE, 700, 0.0, 1, 170, flash(u, 0.05));
    words(["THE REST."], ORANGE, 890, U("rest") - 0.1, 1, 170, flash(u, U("rest")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.4, u);
    x.save(); x.translate(CX, 565); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    x.shadowColor = VIOLET; x.shadowBlur = 40; x.strokeStyle = VIOLET; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 220, 0, Math.PI * 2); x.stroke();
    x.shadowColor = GREEN; x.strokeStyle = GREEN; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 250, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 900, 0.15, 1, 130);
    words([c2], VIOLET, 1050, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1210, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["keep-rest-cgi"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
