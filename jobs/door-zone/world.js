// door-zone (Apex 09, TikTok) - EXPLAINER 3D style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-explainer-3d.js):
// bright clay/toy three.js street, soft sun, rounded shapes. A row of parked cars on the right.
// Wrong: the rider hugs the cars, a driver opens a door without looking, the bike hits it.
// Right: a full door's width of space, watch heads / brake lights / wheels, cover brakes, slow past the row.
// Time only from hf-seek.
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

// ---------- world: a bright clay street ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0ff);
scene.fog = new THREE.Fog(0x8fd0ff, 30, 70);
const camera = new THREE.PerspectiveCamera(48, LW / LH, 0.05, 150);
const hemi = new THREE.HemisphereLight(0xcfeaff, 0xf2d6b0, 1.5); scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff3e0, 2.2);
key.position.set(-6, 12, 4); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 8; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 });
scene.add(key); scene.add(key.target);
const KEYI = 2.2, HEMII = 1.5;

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
const ball = (r, mat, parent = scene) => add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat), parent);
const capsule = (r, l, mat, parent = scene) => add(new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, 20), mat), parent);
const cyl = (r0, r1, h, mat, parent = scene) => add(new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 28), mat), parent);

// layout: traffic runs toward -z. Our lane x -1.75..1.45, parked cars at x=2.45, curb at 3.5, oncoming lane x<-1.75.
const CARX = 2.45, CAR_SIDE = CARX - 0.9, CURB = 3.5;
{
  const road = new THREE.Mesh(new THREE.PlaneGeometry(14, 140), clay(0x5d6680)); road.rotation.x = -Math.PI / 2; road.position.set(-1, 0, -40); road.receiveShadow = true; scene.add(road);
  const walkM = clay(0xf1e2c8);
  rbox(5, 0.16, 140, 0.05, walkM).position.set(CURB + 2.5, 0.08, -40);
  rbox(5, 0.16, 140, 0.05, walkM).position.set(-8.6, 0.08, -40);
  const lineM = clay(0xffffff, 0.7);
  for (let z = 14; z > -90; z -= 3.2) rbox(0.14, 0.02, 1.6, 0.01, lineM).position.set(-1.75, 0.01, z);
  rbox(0.1, 0.02, 120, 0.01, lineM).position.set(1.45, 0.01, -40);
  const bc = [0xff9f7a, 0xffd36e, 0x9ad0ff, 0xc6a6ff, 0x8fe0b0, 0xffb3c7];
  for (let i = 0; i < 16; i++) {
    const h = 3 + ((i * 37) % 5) * 1.1;
    rbox(4.2, h, 5.4, 0.3, clay(bc[i % 6])).position.set(9.2, h / 2, 10 - i * 6);
    const h2 = 3.5 + ((i * 53) % 4) * 1.2;
    rbox(4.2, h2, 5.4, 0.3, clay(bc[(i + 3) % 6])).position.set(-12, h2 / 2, 10 - i * 6);
  }
  const trunk = clay(0x9a6a44), leaf = clay(0x5cc27a);
  for (let i = 0; i < 12; i++) {
    const z = 7 - i * 8;
    cyl(0.12, 0.15, 1.6, trunk).position.set(CURB + 0.7, 0.9, z);
    ball(0.85, leaf).position.set(CURB + 0.7, 2.3, z);
    cyl(0.12, 0.15, 1.6, trunk).position.set(-7, 0.9, z - 4);
    ball(0.85, leaf).position.set(-7, 2.3, z - 4);
  }
  for (const [cx, cy, cz] of [[-6, 16, -60], [6, 18, -70], [0, 21, -80]]) { const g = new THREE.Group(); for (const [dx, r] of [[0, 2.2], [2, 1.7], [-2, 1.6]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), clay(0xffffff, 1)); s.position.x = dx; g.add(s); } g.position.set(cx, cy, cz); scene.add(g); }
}
// door-zone strip and the safe path (flat glowing patches on the road)
const zoneMat = new THREE.MeshBasicMaterial({ color: 0xff4d5a, transparent: true, opacity: 0, depthWrite: false });
const zone = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 34), zoneMat); zone.rotation.x = -Math.PI / 2; zone.position.set(CAR_SIDE - 0.525, 0.02, -8); scene.add(zone);
const pathMat = new THREE.MeshBasicMaterial({ color: 0x2fd27a, transparent: true, opacity: 0, depthWrite: false });
const pathM = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 40), pathMat); pathM.rotation.x = -Math.PI / 2; pathM.position.set(-0.4, 0.021, -12); scene.add(pathM);

// ---------- clay cars (origin on the road, facing -z) ----------
const glassM = new THREE.MeshStandardMaterial({ color: 0x9fd6ff, roughness: 0.15, metalness: 0, transparent: true, opacity: 0.38, depthWrite: false });
const tyreM = clay(0x23263a), hubM = clay(0xdfe4ee), skinM = clay(0xffc9a0), hairM = clay(0x3a2a20);
function makeCar(hex, driver = false) {
  const g = new THREE.Group(); scene.add(g);
  const body = clay(hex);
  rbox(1.8, 0.62, 4.2, 0.24, body, g).position.set(0, 0.58, 0);
  rbox(1.62, 0.1, 2.0, 0.05, body, g).position.set(0, 1.42, 0.25);
  for (const [px, pz] of [[-0.74, -0.7], [0.74, -0.7], [-0.74, 1.2], [0.74, 1.2]]) rbox(0.1, 0.5, 0.12, 0.04, body, g).position.set(px, 1.15, pz);
  const gl = new THREE.Mesh(new RoundedBoxGeometry(1.58, 0.52, 1.96, 3, 0.12), glassM); gl.position.set(0, 1.13, 0.25); g.add(gl);
  const wheels = [];
  for (const [px, pz] of [[-0.86, -1.35], [0.86, -1.35], [-0.86, 1.35], [0.86, 1.35]]) {
    const w = new THREE.Group(); w.position.set(px, 0.34, pz); g.add(w);
    const t = cyl(0.34, 0.34, 0.26, tyreM, w); t.rotation.z = Math.PI / 2;
    const h = cyl(0.15, 0.15, 0.28, hubM, w); h.rotation.z = Math.PI / 2;
    wheels.push(w);
  }
  const blM = new THREE.MeshStandardMaterial({ color: 0x9a2030, emissive: 0xff2a3a, emissiveIntensity: 0, roughness: 0.5 });
  for (const s of [-0.6, 0.6]) rbox(0.38, 0.14, 0.06, 0.03, blM, g).position.set(s, 0.72, 2.11);
  for (const s of [-0.6, 0.6]) rbox(0.36, 0.14, 0.06, 0.03, clay(0xfff6c8), g).position.set(s, 0.68, -2.11);
  // driver's door (left side, hinge at the front edge)
  const hinge = new THREE.Group(); hinge.position.set(-0.93, 0, -0.95); g.add(hinge);
  const dm = clay(new THREE.Color(hex).multiplyScalar(0.92).getHex());
  rbox(0.08, 0.58, 1.12, 0.04, dm, hinge).position.set(0, 0.6, 0.56);
  const dwin = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.4, 0.95, 2, 0.03), glassM); dwin.position.set(0, 1.1, 0.6); hinge.add(dwin);
  rbox(0.06, 0.06, 0.95, 0.02, dm, hinge).position.set(0, 1.32, 0.6);
  let head = null;
  if (driver) {
    head = new THREE.Group(); head.position.set(-0.4, 1.12, -0.1); g.add(head);
    ball(0.2, skinM, head);
    const hr = add(new THREE.Mesh(new THREE.SphereGeometry(0.212, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.45), hairM), head); hr.position.y = 0.02;
    for (const s of [-0.07, 0.07]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 8), new THREE.MeshBasicMaterial({ color: 0x15121a })); e.position.set(s, 0.03, -0.19); head.add(e); }
    capsule(0.2, 0.25, clay(0x5b8def), g).position.set(-0.4, 0.78, -0.05);
  }
  return { g, hinge, wheels, blM, head };
}
const CARZ = [2, -3, -8, -13, -18];
const CAR_COL = [0x67c3a6, 0xff8a6e, 0x5b8def, 0xffc94a, 0xc6a6ff];
const cars = CARZ.map((z, i) => { const c = makeCar(CAR_COL[i], i >= 1 && i <= 3); c.home = V(CARX, 0, z); return c; });
const DOOR = cars[1], BRK = cars[2], OUTC = cars[3];
const oncoming = makeCar(0xff7fae, true); oncoming.g.rotation.y = Math.PI;
const doorEnd = (c) => c.hinge.localToWorld(V(0, 0.6, 1.12));

// ---------- clay motorcycle + rider (origin on the road, facing -z) ----------
const bike = new THREE.Group(); scene.add(bike);
const bikeBody = clay(0x7a5cff);
const rearLight = new THREE.MeshStandardMaterial({ color: 0x9a2030, emissive: 0xff2a3a, emissiveIntensity: 0, roughness: 0.5 });
{
  for (const z of [-0.72, 0.72]) {
    const w = add(new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.1, 14, 36), tyreM), bike); w.rotation.y = Math.PI / 2; w.position.set(0, 0.41, z);
    const h = cyl(0.12, 0.12, 0.14, hubM, bike); h.rotation.z = Math.PI / 2; h.position.set(0, 0.41, z);
  }
  rbox(0.3, 0.34, 1.1, 0.1, bikeBody, bike).position.set(0, 0.74, 0.02);
  rbox(0.4, 0.26, 0.55, 0.12, bikeBody, bike).position.set(0, 0.98, -0.2);
  rbox(0.3, 0.1, 0.6, 0.05, clay(0x23263a), bike).position.set(0, 0.94, 0.32);
  const fork = capsule(0.045, 0.5, hubM, bike); fork.position.set(0, 0.72, -0.62); fork.rotation.x = -0.35;
  const bar = capsule(0.035, 0.62, clay(0x23263a), bike); bar.position.set(0, 1.12, -0.5); bar.rotation.z = Math.PI / 2;
  ball(0.09, clay(0xfff6c8), bike).position.set(0, 0.95, -0.74);
  rbox(0.2, 0.1, 0.06, 0.03, rearLight, bike).position.set(0, 0.88, 0.98);
  const jacket = clay(0x34406b), pants = clay(0x23263a);
  const torso = capsule(0.19, 0.36, jacket, bike); torso.position.set(0, 1.36, 0.14); torso.rotation.x = -0.4;
  const helm = ball(0.2, clay(0xffffff), bike); helm.position.set(0, 1.8, -0.06);
  const visor = add(new THREE.Mesh(new THREE.SphereGeometry(0.205, 24, 12, Math.PI * 0.75, Math.PI * 0.5, Math.PI * 0.35, Math.PI * 0.3), clay(0x23263a, 0.3)), bike); visor.position.copy(helm.position);
  for (const s of [-1, 1]) {
    const arm = capsule(0.065, 0.42, jacket, bike); arm.position.set(s * 0.24, 1.33, -0.24); arm.rotation.x = -1.05; arm.rotation.z = s * -0.15;
    const leg = capsule(0.08, 0.38, pants, bike); leg.position.set(s * 0.2, 0.86, 0.08); leg.rotation.x = 1.25;
  }
}

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
  for (let it = 0; it < 4; it++) {
    let lo = 0.5, hi = 80;
    for (let k = 0; k < 26; k++) { const mid = (lo + hi) / 2; place(look, dir, mid); const b = bbox(pts); if (b.w <= bw && b.h <= bh) hi = mid; else lo = mid; }
    dist = hi; place(look, dir, dist);
    const b = bbox(pts), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, ppu = 960 / hh;
    const right = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 0), up = V(0, 0, 0).setFromMatrixColumn(camera.matrixWorld, 1);
    look.addScaledVector(right, (b.cx - cx) / ppu).addScaledVector(up, -(b.cy - cy) / ppu);
  }
  return { look, dir, dist };
}
const BOX = [110, 620, 920, 1190];
const bikePts = (bx, bz) => boxPts(bx - 0.35, bx + 0.35, 0, 2.0, bz - 1.0, bz + 1.0);
const carPts = (c) => boxPts(CARX - 0.95, CARX + 0.95, 0, 1.5, c.home.z - 2.1, c.home.z + 2.1);
// frozen camera per line: fitted once to the line's start and end framing, then eased between them
const camCache = {};
function shoot(id, u, d, A, B, dir, box = BOX) {
  const c = camCache[id] || (camCache[id] = { a: fit(A, dir, box), b: fit(B, dir, box) });
  const k = sm(-0.1, Math.max(0.6, d), u);
  const look = c.a.look.clone().lerp(c.b.look, k);
  place(look, c.a.dir, lerp(c.a.dist, c.b.dist, k));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay (clay sticker look) ----------
const RED = "#ff4d5a", GREEN = "#2fd27a", VIOLET = "#7a5cff", ORANGE = "#ff8a2a", WHITE = "#ffffff", INK = "#14183a";
const CX = 520;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
let curU = 0;
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
function words(lines, color, cy, t0, a = 1, maxPx = 140, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (820 / x.measureText(L).width) * 100); });
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
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 600, 1180);
  x.translate(X, Y); x.scale(s, s);
  x.shadowColor = "rgba(20,24,58,0.35)"; x.shadowOffsetY = 8;
  x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h / 2); x.fillStyle = color; x.fill();
  x.shadowColor = "transparent"; x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fillStyle = c; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
  x.strokeStyle = WHITE; x.lineWidth = 18; x.beginPath(); x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); x.stroke();
  x.restore();
}
function cross(X, Y, s, a, c = RED) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fillStyle = c; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
  x.strokeStyle = WHITE; x.lineWidth = 18; x.beginPath(); x.moveTo(-28, -28); x.lineTo(28, 28); x.moveTo(28, -28); x.lineTo(-28, 28); x.stroke();
  x.restore();
}
function ring(X, Y, r, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineWidth = 16; x.strokeStyle = INK; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 8; x.strokeStyle = c; x.stroke(); x.restore();
}
// a measuring arrow between two screen points (draws on with a)
function measure(x0, y0, x1, y1, a, c) {
  if (a <= 0) return;
  const X1 = lerp(x0, x1, cl(a)), Y1 = lerp(y0, y1, cl(a));
  x.save(); x.lineCap = "round"; x.lineJoin = "round";
  for (const [w, col] of [[18, INK], [9, c]]) {
    x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(X1, Y1); x.stroke();
    const ang = Math.atan2(Y1 - y0, X1 - x0);
    for (const [px, py, an] of [[x0, y0, ang + Math.PI], [X1, Y1, ang]]) { x.beginPath(); x.moveTo(px + Math.cos(an + 2.5) * 30, py + Math.sin(an + 2.5) * 30); x.lineTo(px, py); x.lineTo(px + Math.cos(an - 2.5) * 30, py + Math.sin(an - 2.5) * 30); x.stroke(); }
  }
  x.restore();
}
function bars(X, Y, level, a, c, s = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineJoin = "round";
  for (let i = 0; i < 5; i++) {
    const on = (i + 0.5) / 5 <= level, bh = (28 + i * 20) * s, bw = 24 * s, bx = X + (i - 2.5) * 32 * s;
    x.beginPath(); x.roundRect(bx, Y - bh, bw, bh, 7 * s);
    x.fillStyle = on ? c : "rgba(255,255,255,0.85)"; x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  }
  x.font = FONT(34); x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = 9; x.strokeStyle = INK;
  x.strokeText("SPEED", X - 16 * s, Y + 34); x.fillStyle = c; x.fillText("SPEED", X - 16 * s, Y + 34);
  x.restore();
}

// ---------- one frame ----------
function reset() {
  cars.forEach((c) => { c.g.position.copy(c.home); c.g.rotation.set(0, 0, 0); c.hinge.rotation.y = 0; c.wheels.forEach((w) => w.rotation.set(0, 0, 0)); c.blM.emissiveIntensity = 0; if (c.head) c.head.rotation.set(0, 0, 0); });
  oncoming.g.visible = false;
  bike.rotation.set(0, 0, 0); rearLight.emissiveIntensity = 0;
  zoneMat.opacity = 0; pathMat.opacity = 0;
  key.intensity = KEYI; hemi.intensity = HEMII;
}
function setBike(bx, bz, col) { bike.position.set(bx, 0, bz); bikeBody.color.set(col); key.position.set(bx - 6, 12, bz + 4); key.target.position.set(bx, 0, bz - 3); }

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  const U = (w, n) => at(id, w, n);
  let dim = 0;
  const L = {};
  let bx = 0, bz = 0;

  if (id === "s1") {
    bx = 0.95; bz = lerp(9, 6.5, cl(u / d));
    setBike(bx, bz, 0x7a5cff);
    L.Z = sm(U("close") - 0.15, U("doors") + 0.2, u);
    zoneMat.opacity = 0.45 * L.Z;
    DOOR.hinge.rotation.y = -0.18 * L.Z * (0.5 + 0.5 * Math.sin(u * 7)); // the door twitches: a hint of what is coming
    shoot(id, u, d, [...bikePts(bx, 9), ...carPts(cars[0]), ...carPts(cars[2])], [...bikePts(bx, 6.5), ...carPts(cars[1]), ...carPts(cars[2])], [-0.25, 0.75, 1]);
  }
  if (id === "s2") {
    const Hg = sm(U("hug") - 0.1, U("cars") + 0.1, u);
    bx = lerp(-0.3, 0.95, Hg); bz = lerp(8, 4.5, cl(u / d));
    setBike(bx, bz, Hg > 0.5 ? 0xff4d5a : 0x7a5cff);
    bike.rotation.z = 0.12 * Math.sin(Math.PI * Hg);
    oncoming.g.visible = true; oncoming.g.position.set(-3.5, 0, lerp(-16, 1, cl(u / d)));
    zoneMat.opacity = 0.45;
    L.Hg = Hg; L.Tr = sm(U("traffic") - 0.2, U("traffic") + 0.1, u);
    shoot(id, u, d, [...bikePts(0, 6), ...boxPts(-4.5, 3.3, 0, 1.5, -2, 4)], [...bikePts(0.95, 2.5), ...boxPts(-4.5, 3.3, 0, 1.5, -5, 1)], [0.15, 0.7, 1]);
  }
  if (id === "s3") {
    const T = U("right");
    const go = cl(u / T);
    // the open door's edge crosses x=0.95 at z~-3.62; the front tyre (bz-1.03) stops there
    bx = 0.95; bz = u < T ? lerp(4.5, -2.55, go - 0.25 * go * (1 - go)) : -2.55 + 0.18 * sm(T, T + 0.4, u);
    setBike(bx, bz, 0xff4d5a);
    const Op = back(U("opens") - 0.05, U("opens") + 0.45, u);
    DOOR.hinge.rotation.y = -1.05 * cl(Op, 0, 1.08);
    rearLight.emissiveIntensity = 2.2 * sm(U("looking") - 0.05, U("looking"), u);
    const I = sm(T - 0.04, T + 0.06, u);
    bike.rotation.z = -0.55 * I; bike.rotation.y = 0.25 * I;
    bike.position.y = 0.15 * Math.sin(Math.PI * sm(T, T + 0.35, u));
    zoneMat.opacity = 0.45 + 0.3 * flash(u, T);
    L.T = T; L.I = I; L.Op = Op;
    shoot(id, u, d, [...bikePts(0.95, 4.5), ...carPts(DOOR)], [...bikePts(0.95, -2.4), ...carPts(DOOR)], [-0.3, 0.6, 1]);
    const sh = (sm(T - 0.03, T + 0.03, u) - sm(T + 0.1, T + 0.6, u)) * 0.12;
    camera.position.x += Math.sin(u * 70) * sh; camera.position.y += Math.cos(u * 61) * sh;
  }
  if (id === "s4") {
    bx = -0.4; bz = lerp(3, -6.2, cl(u / d));
    setBike(bx, bz, 0x2fd27a);
    const Op = sm(U("full") - 0.1, U("door's") + 0.3, u);
    DOOR.hinge.rotation.y = -1.05 * Op;
    zoneMat.opacity = 0.35; pathMat.opacity = 0.5 * sm(0, 0.4, u);
    L.Op = Op; L.Wd = sm(U("width") - 0.1, U("between") + 0.2, u);
    shoot(id, u, d, [...bikePts(-0.4, 3), ...carPts(DOOR)], [...bikePts(-0.4, -6.2), ...carPts(DOOR)], [-0.15, 1.15, 0.9]);
  }
  if (id === "s5") {
    bx = -0.4; bz = lerp(-4, -10.5, cl(u / d));
    setBike(bx, bz, 0x2fd27a);
    pathMat.opacity = 0.5; zoneMat.opacity = 0.25;
    L.Hd = sm(U("heads") - 0.1, U("heads") + 0.15, u);
    L.Bl = sm(U("brake") - 0.1, U("brake") + 0.1, u);
    L.Wh = sm(U("wheels") - 0.1, U("out") + 0.15, u);
    DOOR.head.rotation.y = 0.5 * L.Hd * Math.sin(u * 3);
    BRK.blM.emissiveIntensity = 2.4 * L.Bl * (0.75 + 0.25 * Math.sin(u * 12));
    OUTC.wheels[0].rotation.y = OUTC.wheels[1].rotation.y = 0.5 * L.Wh;
    OUTC.g.rotation.y = 0.14 * sm(U("turning") - 0.1, U("out") + 0.3, u);
    OUTC.g.position.x = CARX - 0.25 * sm(U("turning") - 0.1, U("out") + 0.3, u);
    shoot(id, u, d, [...bikePts(-0.4, -4), ...carPts(DOOR), ...carPts(OUTC)], [...bikePts(-0.4, -10.5), ...carPts(BRK), ...carPts(OUTC)], [-0.3, 0.7, 1]);
  }
  if (id === "s6") {
    const k = cl(u / d);
    bx = -0.4; bz = lerp(-10, -15, k * (1 - 0.35 * k));
    setBike(bx, bz, 0x2fd27a);
    pathMat.opacity = 0.5; zoneMat.opacity = 0.25;
    OUTC.wheels[0].rotation.y = OUTC.wheels[1].rotation.y = 0.5; OUTC.g.rotation.y = 0.14; OUTC.g.position.x = CARX - 0.25;
    L.Cv = sm(U("cover") - 0.1, U("brakes") + 0.1, u);
    L.Sp = sm(U("speed") - 0.1, U("down") + 0.3, u);
    rearLight.emissiveIntensity = 1.4 * sm(U("down") - 0.1, U("down"), u) * (1 - sm(U("row"), d, u));
    shoot(id, u, d, [...bikePts(-0.4, -10), ...carPts(OUTC)], [...bikePts(-0.4, -15), ...carPts(cars[4])], [0.2, 0.65, 1]);
  }
  if (id === "s7" || id === "s8") {
    bx = -0.4; bz = lerp(-15, -17, cl(u / Math.max(1, d)));
    setBike(bx, bz, 0x2fd27a);
    pathMat.opacity = 0.5; zoneMat.opacity = 0.3;
    dim = id === "s7" ? 0.45 : 0.6;
    shoot(id, u, d, [...bikePts(-0.4, -15), ...carPts(cars[2]), ...carPts(cars[4])], [...bikePts(-0.4, -17), ...carPts(cars[2]), ...carPts(cars[4])], [-0.2, 0.9, 1]);
  }
  renderer.render(scene, camera);
  present(dim);

  // ---------- overlay ----------
  const bikeTop = scr(V(bx, 2.1, bz));
  if (id === "s1") {
    const [zx, zy] = scr(V(CAR_SIDE - 0.5, 0, 0));
    tag("DOOR ZONE", zx, zy - 40, RED, L.Z, 44);
    words(["NEVER RIDE IN", "THE DOOR ZONE"], RED, 400, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, U("never")), flash(u, U("doors"))));
  }
  if (id === "s2") {
    tag("TOO CLOSE", bikeTop[0] + 120, bikeTop[1] - 60, RED, sm(U("parked") - 0.1, U("parked") + 0.15, u) * L.Hg, 44);
    const [ox, oy] = scr(oncoming.g.localToWorld(V(0, 1.7, 0)));
    tag("TRAFFIC", ox, oy - 50, ORANGE, L.Tr, 40);
    words(["HUGGING THE", "PARKED CARS"], RED, 400, 0.0, 1, 140, flash(u, U("hug")) * 0.6);
  }
  if (id === "s3") {
    const [hx, hy] = scr(DOOR.head.localToWorld(V(0, 0.3, 0)));
    tag("DIDN'T LOOK", hx + 40, hy - 70, RED, sm(U("without") - 0.1, U("looking") + 0.1, u) * (1 - L.I), 40);
    const [ex, ey] = scr(doorEnd(DOOR));
    cross(ex, ey - 120, back(L.T, L.T + 0.35, u) * 0.75, L.I);
    tag("DOOR!", ex - 40, ey + 90, RED, L.I, 52);
    words(["A DOOR OPENS", "IN YOUR PATH"], RED, 400, 0.0, 1, 140, Math.max(flash(u, U("opens")), flash(u, L.T)) * 0.7);
  }
  if (id === "s4") {
    const zr = -3.95;
    const [ax, ay] = scr(V(CAR_SIDE, 0.05, zr)), [bx2, by2] = scr(V(-0.15, 0.05, zr));
    measure(ax, ay, bx2, by2, L.Wd, GREEN);
    tag("DOOR'S WIDTH", (ax + bx2) / 2, Math.max(ay, by2) + 80, GREEN, L.Wd, 42);
    check(bikeTop[0] - 120, bikeTop[1] - 40, back(U("cars") - 0.05, U("cars") + 0.3, u) * 0.6, sm(U("cars") - 0.05, U("cars") + 0.1, u));
    words(["LEAVE A", "DOOR'S WIDTH"], GREEN, 400, 0.0, 1, 140, flash(u, U("width")) * 0.6);
  }
  if (id === "s5") {
    const [hx, hy] = scr(DOOR.head.localToWorld(V(0, 0, 0)));
    ring(hx, hy, 46, L.Hd * (1 - L.Bl), GREEN);
    tag("HEAD IN SEAT", hx - 60, hy - 90, GREEN, L.Hd * (1 - L.Bl), 40);
    const [lx, ly] = scr(BRK.g.localToWorld(V(0, 0.72, 2.11)));
    ring(lx, ly, 60, L.Bl * (1 - L.Wh), GREEN);
    tag("BRAKE LIGHTS", lx - 60, ly - 100, GREEN, L.Bl * (1 - L.Wh), 40);
    const [wx, wy] = scr(OUTC.g.localToWorld(V(-0.86, 0.34, -1.35)));
    ring(wx, wy, 50, L.Wh, GREEN);
    tag("WHEELS OUT", wx - 60, wy - 100, GREEN, L.Wh, 40);
    const sw1 = U("brake") - 0.12, sw2 = U("wheels") - 0.12;
    words(["WATCH", "FOR HEADS"], GREEN, 400, 0.0, 1 - sm(sw1 - 0.08, sw1, u), 140, flash(u, U("heads")) * 0.6);
    words(["BRAKE", "LIGHTS"], GREEN, 400, sw1, sm(sw1 - 0.05, sw1, u) * (1 - sm(sw2 - 0.08, sw2, u)), 150, flash(u, U("brake")) * 0.6);
    words(["WHEELS", "TURNING OUT"], GREEN, 400, sw2, sm(sw2 - 0.05, sw2, u), 140, flash(u, U("wheels")) * 0.6);
  }
  if (id === "s6") {
    tag("COVER BRAKES", bikeTop[0] + 150, bikeTop[1] - 50, VIOLET, L.Cv, 40);
    bars(250, 1140, lerp(0.95, 0.45, L.Sp), sm(U("keep") - 0.2, U("keep"), u), L.Sp > 0.5 ? GREEN : ORANGE, 0.9);
    check(bikeTop[0] + 140, bikeTop[1] - 160, back(U("row") - 0.05, U("row") + 0.3, u) * 0.6, sm(U("row") - 0.05, U("row") + 0.1, u));
    const sw = U("keep") - 0.12;
    words(["COVER YOUR", "BRAKES"], VIOLET, 400, 0.0, 1 - sm(sw - 0.08, sw, u), 140);
    words(["SLOW DOWN", "PAST THE ROW"], GREEN, 400, sw, sm(sw - 0.05, sw, u), 140, flash(u, U("down")) * 0.6);
  }
  if (id === "s7") {
    const sw = U("watch") - 0.12;
    words(["GIVE DOORS", "SPACE."], ORANGE, 820, 0.0, 1 - sm(sw - 0.08, sw, u), 160, flash(u, 0.05));
    words(["WATCH FOR", "PEOPLE IN CARS"], ORANGE, 820, sw, sm(sw - 0.05, sw, u), 150, flash(u, U("people")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = back(0.0, 0.4, u);
    x.save(); x.translate(CX, 520); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    x.strokeStyle = INK; x.lineWidth = 22; x.beginPath(); x.arc(0, 0, 200, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = ORANGE; x.lineWidth = 12; x.stroke();
    x.strokeStyle = GREEN; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.arc(0, 0, 232, u * 2, u * 2 + 1.4); x.stroke();
    for (let i = 0; i < 6; i++) { const an = (i / 6) * Math.PI * 2 + u * 2; x.strokeStyle = INK; x.lineWidth = 18; x.beginPath(); x.moveTo(Math.cos(an) * 40, Math.sin(an) * 40); x.lineTo(Math.cos(an) * 150, Math.sin(an) * 150); x.stroke(); x.strokeStyle = WHITE; x.lineWidth = 9; x.stroke(); }
    x.restore();
    words([c1], WHITE, 820, 0.15, 1, 130);
    words([c2], ORANGE, 960, 0.3, 1, 150, flash(u, U("apex")) * 0.5);
    tag("3 FREE RIDES A MONTH", CX, 1085, GREEN, sm(U("three") - 0.05, U("three") + 0.2, u), 46);
    if (BRAND.sub) tag(BRAND.sub, CX, 1180, VIOLET, sm(U("free") - 0.05, U("free") + 0.2, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["door-zone-explainer3d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
