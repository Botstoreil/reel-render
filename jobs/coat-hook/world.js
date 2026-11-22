// coat-hook: CGI MOTION style (style test 22.11, style 9). Smooth three.js with physical materials, soft shadows,
// an environment light, depth-of-field feel (blurred edges, sharp centre), slow camera dollies. A hotel bathroom
// door with a metal coat hook. No real brands. Text is a full-res 2D overlay. Time only from hf-seek.
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
  x.filter = "blur(9px)"; x.drawImage(glc, 0, 0, 1080, 1920); x.filter = "none";
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
  const v = x.createRadialGradient(540, 960, 500, 540, 960, 1250);
  v.addColorStop(0, "rgba(10,8,20,0)"); v.addColorStop(1, `rgba(10,8,20,${0.55 + dim * 0.3})`);
  x.fillStyle = v; x.fillRect(0, 0, 1080, 1920);
  if (dim > 0) { x.fillStyle = `rgba(10,8,24,${dim})`; x.fillRect(0, 0, 1080, 1920); }
}

// ---------- world: a hotel bathroom corner ----------
const scene = new THREE.Scene();
const BGC = 0x24222c;
scene.background = new THREE.Color(BGC);
scene.fog = new THREE.Fog(BGC, 14, 40);
{
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.5;
}
const camera = new THREE.PerspectiveCamera(38, LW / LH, 0.05, 100);
const hemi = new THREE.HemisphereLight(0xfff4e8, 0x2a2430, 0.6); scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff0dc, 2.4);
key.position.set(-4, 7, 6); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
scene.add(key);
const fill = new THREE.PointLight(0x9fb8ff, 5, 14, 1.6); fill.position.set(4, 3, 4); scene.add(fill);
const torch = new THREE.SpotLight(0xfff6e0, 0, 12, 0.32, 0.6, 1.2); torch.castShadow = true; scene.add(torch); scene.add(torch.target);
const KEYI = 2.4;
const std = (hex, r = 0.55, extra = {}) => new THREE.MeshStandardMaterial({ color: hex, roughness: r, metalness: 0, ...extra });
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const add = (m, parent = scene) => { m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };

function tileTex() {
  const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
  g.fillStyle = "#cfd3d6"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#e9ecee" : "#e2e6e8"; g.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 6); t.colorSpace = THREE.SRGBColorSpace; return t;
}
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), std(0xffffff, 0.3, { map: tileTex() }));
  floor.material.map.repeat.set(30, 30);
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), std(0xffffff, 0.35, { map: tileTex() })); wall.position.set(0, 6, -5); wall.receiveShadow = true; scene.add(wall);
}

// the door (in the wall plane z=-4.9), with a metal coat hook
const doorG = new THREE.Group(); scene.add(doorG);
const DOOR_Z = -4.85;
{
  const fr = add(new THREE.Mesh(new RoundedBoxGeometry(2.4, 4.6, 0.16, 3, 0.04), std(0xf3efe9, 0.45)), doorG); fr.position.set(0, 2.3, 0);
  const pn = add(new THREE.Mesh(new RoundedBoxGeometry(2.0, 4.3, 0.12, 4, 0.03), std(0xb08a64, 0.42)), doorG); pn.position.set(0, 2.15, 0.06);
  for (const yy of [1.2, 3.1]) { const ins = add(new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.4, 0.05, 3, 0.02), std(0xa47f5a, 0.45)), doorG); ins.position.set(0, yy, 0.13); }
  const knob = add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 16), std(0xd0d0d4, 0.2, { metalness: 1 })), doorG); knob.position.set(0.8, 1.9, 0.2);
  doorG.position.set(0, 0, DOOR_Z);
}
// hook: plate + curved arm + a tiny dark dot (the lens) in the plate
const HOOK_Y = 3.45;
function makeHook(parent) {
  const g = new THREE.Group(); parent.add(g);
  const metal = new THREE.MeshPhysicalMaterial({ color: 0xc9cbd0, metalness: 1, roughness: 0.22, clearcoat: 0.6 });
  const plate = add(new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.34, 0.05, 4, 0.02), metal), g);
  const arm = add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 16, 40, Math.PI * 1.2), metal), g);
  arm.rotation.set(0, Math.PI / 2, -Math.PI / 2); arm.position.set(0, -0.08, 0.11);
  const tip = add(new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), metal), g); tip.position.set(0, 0.0, 0.2);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.014, 24), new THREE.MeshBasicMaterial({ color: 0x050505 })); dot.position.set(0, 0.1, 0.026); g.add(dot);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xff3040, transparent: true, opacity: 0 });
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.03, 24), ledMat); led.position.set(0, 0.1, 0.027); g.add(led);
  return { g, dot, led, ledMat };
}
const hook = makeHook(scene);
const extraHooks = [makeHook(scene), makeHook(scene)];

// cardboard box (s2)
const boxG = new THREE.Group(); scene.add(boxG);
const flaps = [];
{
  const card = std(0xc39a68, 0.85);
  const bx = add(new THREE.Mesh(new RoundedBoxGeometry(1.4, 0.8, 1.0, 3, 0.03), card), boxG); bx.position.y = 0.4;
  for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * 0.7, 0.8, 0); const f = add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.02, 1.0), card), piv); f.position.x = -s * 0.35; boxG.add(piv); flaps.push({ piv, s }); }
  const tape = add(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.81, 1.01), std(0xd8c8a0, 0.5)), boxG); tape.position.y = 0.4;
}
// shower + bed (s3)
const showerG = new THREE.Group(); scene.add(showerG);
{
  const tray = add(new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.12, 1.6, 3, 0.03), std(0xf4f4f4, 0.2)), showerG); tray.position.y = 0.06;
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.4, 1.6), new THREE.MeshPhysicalMaterial({ color: 0xdff4ff, roughness: 0.05, transmission: 0.9, transparent: true, opacity: 0.35 })); glass.position.set(0.8, 1.32, 0); showerG.add(glass);
  const pipe = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.3, 16), std(0xcfd2d6, 0.2, { metalness: 1 })), showerG); pipe.position.set(-0.7, 1.3, -0.7);
  const head = add(new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.06, 32), std(0xcfd2d6, 0.2, { metalness: 1 })), showerG); head.position.set(-0.5, 2.45, -0.55); head.rotation.z = -0.4;
}
const bedG = new THREE.Group(); scene.add(bedG);
{
  const base = add(new THREE.Mesh(new RoundedBoxGeometry(2.2, 0.45, 3.0, 3, 0.05), std(0x5a4a40, 0.6)), bedG); base.position.y = 0.23;
  const mat = add(new THREE.Mesh(new RoundedBoxGeometry(2.1, 0.3, 2.9, 5, 0.12), std(0xf6f3ee, 0.9)), bedG); mat.position.y = 0.6;
  const duvet = add(new THREE.Mesh(new RoundedBoxGeometry(2.15, 0.12, 1.9, 5, 0.06), std(0x7b6cff, 0.85)), bedG); duvet.position.set(0, 0.78, 0.5);
  for (const s of [-0.5, 0.5]) { const pl = add(new THREE.Mesh(new RoundedBoxGeometry(0.8, 0.18, 0.5, 4, 0.08), std(0xffffff, 0.9)), bedG); pl.position.set(s, 0.84, -1.1); }
}
// view cone from the hook (s3)
const cone = new THREE.Mesh(new THREE.ConeGeometry(1, 1, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3b40, transparent: true, opacity: 0.18, side: THREE.DoubleSide, depthWrite: false }));
cone.geometry.translate(0, -0.5, 0); cone.geometry.rotateX(-Math.PI / 2); // apex at origin, opens along +z
scene.add(cone);
// towel (s6) + coat (s7)
const towel = add(new THREE.Mesh(new RoundedBoxGeometry(0.85, 1.2, 0.08, 4, 0.035), std(0xf2f0ea, 0.98)));
const coatG = new THREE.Group(); scene.add(coatG);
{
  const body = add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.55, 1.6, 32, 1, true), std(0x2f4a6a, 0.85, { side: THREE.DoubleSide })), coatG); body.position.y = -0.85;
  const col = add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 12, 32), std(0x2f4a6a, 0.85)), coatG); col.rotation.x = Math.PI / 2; col.position.y = -0.08;
}
// phone (flashlight) for s5
const phone = add(new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.85, 0.05, 4, 0.04), std(0x1b1b20, 0.3, { metalness: 0.3 })));
const table = add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 0.12, 64), new THREE.MeshPhysicalMaterial({ color: 0x2b2440, roughness: 0.3, clearcoat: 1 })));

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
const HZ = DOOR_Z + 0.15; // hook plate z
const SHOTS = {
  s1: () => fit(boxPts(-1.2, 1.2, 0, 4.6, HZ, HZ + 0.2), [0.25, 0.05, 1], [200, 520, 880, 1500]),
  s2: () => fit(boxPts(-1.4, 1.4, 0, 2.6, -0.5, 0.5), [0.2, 0.35, 1], [130, 640, 950, 1460]),
  s3: () => fit(boxPts(-3.6, 3.6, 0, 3.8, -4.9, 2.2), [0.0, 0.75, 1], [90, 600, 990, 1460]),
  s4: () => fit(boxPts(-0.15, 0.15, HOOK_Y - 0.22, HOOK_Y + 0.2, HZ, HZ + 0.22), [0.18, 0.05, 1], [240, 760, 840, 1420]),
  s5: () => fit(boxPts(-0.3, 0.3, HOOK_Y - 0.3, HOOK_Y + 0.25, HZ, HZ + 0.25), [-0.15, 0.05, 1], [200, 760, 880, 1300]),
  s6: () => fit(boxPts(-0.8, 0.8, HOOK_Y - 1.4, HOOK_Y + 0.4, HZ, HZ + 0.3), [0.2, 0.05, 1], [160, 640, 920, 1380]),
  s7: () => fit(boxPts(-0.8, 0.8, HOOK_Y - 1.8, HOOK_Y + 0.4, HZ, HZ + 0.5), [-0.2, 0.05, 1], [200, 640, 880, 1450]),
  s8: () => fit(boxPts(-0.4, 0.4, 0, 0.6, -0.4, 0.4), [0, 0.35, 1], [400, 400, 680, 740]),
};
const ORBIT = { s1: 0.14, s2: 0.16, s3: -0.1, s4: 0.12, s5: -0.08, s6: 0.12, s7: 0.1, s8: 0 };
const shotCache = {};
const yAxis = V(0, 1, 0);
function shoot(id, u, d) {
  const s = shotCache[id] || (shotCache[id] = SHOTS[id]());
  const k = sm(-0.2, Math.max(0.6, d) + 0.2, u);
  const dir = s.dir.clone().applyAxisAngle(yAxis, lerp(-0.5, 0.5, k) * ORBIT[id]);
  place(s.look, dir, s.dist * lerp(1.07, 0.99, k));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay ----------
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
function lensRing(X, Y, r, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.shadowColor = "rgba(0,0,0,0.5)"; x.shadowBlur = 20;
  x.strokeStyle = c; x.lineWidth = 12; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke();
  x.lineCap = "round"; x.lineWidth = 22; x.beginPath(); x.moveTo(X + r * 0.72, Y + r * 0.72); x.lineTo(X + r * 1.5, Y + r * 1.5); x.stroke();
  x.restore();
}
function sparkle(X, Y, R, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.globalCompositeOperation = "lighter";
  const g = x.createRadialGradient(X, Y, 0, X, Y, R * 2.2); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,240,200,0.6)"); g.addColorStop(1, "rgba(255,240,200,0)");
  x.fillStyle = g; x.fillRect(X - R * 2.2, Y - R * 2.2, R * 4.4, R * 4.4);
  x.strokeStyle = "rgba(255,255,255,0.9)"; x.lineWidth = 4; x.beginPath(); x.moveTo(X - R * 1.8, Y); x.lineTo(X + R * 1.8, Y); x.moveTo(X, Y - R * 1.8); x.lineTo(X, Y + R * 1.8); x.stroke();
  x.restore();
}

// ---------- one frame ----------
function reset() {
  doorG.visible = false; hook.g.visible = false; extraHooks.forEach((h) => (h.g.visible = false));
  [hook, ...extraHooks].forEach((h) => { h.ledMat.opacity = 0; h.g.scale.setScalar(1); h.g.rotation.set(0, 0, 0); });
  boxG.visible = showerG.visible = bedG.visible = false; cone.visible = false; towel.visible = false; coatG.visible = false; phone.visible = false; table.visible = false;
  key.intensity = KEYI; hemi.intensity = 0.6; fill.intensity = 5; torch.intensity = 0; scene.environmentIntensity = 0.5;
}
const HOOKP = V(0, HOOK_Y, HZ);
const DOTP = V(0, HOOK_Y + 0.1, HZ + 0.03);
function showDoor() { doorG.visible = true; hook.g.visible = true; hook.g.position.copy(HOOKP); }

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  shoot(id, u, d);
  const U = (w, n) => at(id, w, n);
  const L = {};
  let focusY = 1000, dim = 0;

  if (id === "s1") {
    showDoor();
    const R = sm(U("ignore") - 0.1, U("ignore") + 0.15, u);
    hook.ledMat.opacity = R * (0.6 + 0.4 * Math.sin(u * 10));
    L.R = R; focusY = 700;
  }
  if (id === "s2") {
    boxG.visible = true; boxG.position.set(0, 0, 0);
    const O = sm(U("sold") - 0.1, U("online") + 0.1, u);
    flaps.forEach((f) => (f.piv.rotation.z = f.s * -2.1 * O));
    L.hp = [];
    [[-0.95, 1.9], [0, 2.25], [0.95, 1.9]].forEach(([X, Y], i) => {
      const h = i === 1 ? hook : extraHooks[i ? 1 : 0];
      const t0 = U("online") + i * 0.12, k = back(t0 - 0.05, t0 + 0.35, u);
      h.g.visible = u > t0 - 0.05; h.g.position.set(lerp(0, X, k), lerp(0.5, Y, k), 0);
      h.g.rotation.y = (1 - cl(k)) * 2.5; h.g.scale.setScalar(2.4);
      if (i === 1) h.ledMat.opacity = sm(U("other") - 0.1, U("other") + 0.1, u);
      L.hp.push(h.g.position.clone());
    });
    focusY = 1000;
  }
  if (id === "s3") {
    showDoor();
    showerG.visible = true; showerG.position.set(-2.3, 0, -1.2);
    bedG.visible = true; bedG.position.set(2.2, 0, 0.6);
    const Sh = sm(U("shower") - 0.2, U("shower") + 0.1, u), Bd = sm(U("bed") - 0.2, U("bed") + 0.1, u);
    const C = sm(U("faces") - 0.15, U("faces") + 0.1, u);
    const target = V(-2.3, 1.0, -1.2).lerp(V(2.2, 0.7, 0.6), Bd);
    cone.visible = C > 0.01; cone.material.opacity = 0.2 * C;
    // geometry: apex at the origin, opening along +z; lookAt turns +z toward the target
    cone.position.copy(DOTP); cone.lookAt(target);
    const len = DOTP.distanceTo(target);
    cone.scale.set(0.9 * C, 0.9 * C, len * C);
    hook.ledMat.opacity = C;
    L.Sh = Sh; L.Bd = Bd; focusY = 1050;
  }
  if (id === "s4") {
    showDoor();
    const Dt = sm(U("tiny") - 0.1, U("dot") + 0.1, u);
    hook.ledMat.opacity = 0; hook.dot.scale.setScalar(1 + 1.2 * Dt);
    L.M = sm(U("up") - 0.2, U("close") + 0.1, u); L.Dt = Dt; focusY = 1050;
  }
  if (id === "s5") {
    showDoor();
    key.intensity = 0.25; hemi.intensity = 0.08; fill.intensity = 0.3; scene.environmentIntensity = 0.06;
    const B = sm(U("shine") - 0.05, U("flashlight") + 0.1, u);
    const mv = sm(U("stays") - 0.2, U("put") + 0.3, u);
    const src = V(lerp(-0.7, 0.7, mv), HOOK_Y - 0.55, HZ + 1.1);
    torch.position.copy(src); torch.target.position.copy(DOTP); torch.intensity = 30 * B;
    phone.visible = true; phone.position.copy(src).add(V(0, -0.05, 0.05)); phone.lookAt(DOTP); phone.rotateX(Math.PI / 2);
    L.B = B; L.G = sm(U("glint") - 0.1, U("glint") + 0.1, u); dim = 0.1; focusY = 1000;
  }
  if (id === "s6") {
    showDoor();
    hook.dot.scale.setScalar(1.6);
    const Tw = sm(U("hang") - 0.1, U("towel") + 0.25, u);
    towel.visible = Tw > 0; towel.position.set(0, HOOK_Y - 0.45 + 1.6 * (1 - Tw) * (1 - Tw), HZ + 0.22); towel.rotation.z = 0.25 * (1 - Tw);
    focusY = 900;
  }
  if (id === "s7") {
    showDoor();
    const Cq = sm(U("hang") - 0.1, U("coat") + 0.15, u);
    coatG.visible = Cq > 0.01; coatG.position.set(0, HOOK_Y + 0.05 + 0.8 * (1 - Cq), HZ + 0.32);
    key.intensity = KEYI * 0.7; dim = 0.4; focusY = 1100;
  }
  if (id === "s8") {
    table.visible = true; table.position.set(0, 0.06, 0);
    hook.g.visible = true; hook.g.position.set(0, 0.4, 0); hook.g.scale.setScalar(1.6); hook.g.rotation.y = 0.5 + u * 0.9;
    dim = 0.35; focusY = 560;
  }
  renderer.render(scene, camera);
  present(focusY, dim);

  // ---------- overlay ----------
  if (id === "s1") {
    const [hx, hy] = scr(HOOKP);
    tag("BATHROOM", CX, 1430, VIOLET, sm(U("bathroom") - 0.1, U("bathroom") + 0.15, u), 44);
    tag("HOOK", hx, hy + 110, L.R > 0.5 ? RED : VIOLET, sm(0.1, 0.4, u), 34);
    words(["NEVER IGNORE", "THE HOOK"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, U("never"))));
  }
  if (id === "s2") {
    const [mx, my] = scr(L.hp[1]);
    tag("LOOKS NORMAL", CX, 1400, RED, sm(U("look", 1) - 0.05, U("look", 1) + 0.2, u), 46);
    tag("CAMERA", mx, my - 120, RED, sm(U("other") - 0.1, U("other") + 0.1, u), 34);
    words(["SOLD", "ONLINE"], RED, 360, 0.0, 1, 150, flash(u, U("online")) * 0.6);
  }
  if (id === "s3") {
    const [sx2, sy2] = scr(V(-2.3, 0, -1.2)), [bx2, by2] = scr(V(2.2, 0, 0.6));
    tag("SHOWER", sx2, sy2 + 70, RED, L.Sh * (1 - L.Bd), 42);
    tag("BED", bx2, by2 + 70, RED, L.Bd, 42);
    words(["IT FACES", "THE SHOWER"], RED, 360, 0.0, 1, 150, flash(u, U("shower")) * 0.6);
  }
  if (id === "s4") {
    const [dx, dy] = scr(DOTP);
    lensRing(lerp(dx + 260, dx, L.M), lerp(dy + 330, dy, L.M), 95, L.M, GREEN);
    tag("TINY HOLE", CX, 1440, GREEN, sm(U("hole") - 0.1, U("hole") + 0.1, u) * (1 - sm(U("dark") - 0.1, U("dark"), u)), 44);
    tag("DARK DOT", CX, 1440, GREEN, sm(U("dark") - 0.05, U("dot") + 0.1, u), 44);
    words(["LOOK UP", "CLOSE"], GREEN, 360, 0.0, 1, 150, flash(u, U("close")) * 0.6);
  }
  if (id === "s5") {
    const [dx, dy] = scr(DOTP);
    sparkle(dx, dy, 40 + 5 * Math.sin(u * 9), L.G * L.B);
    tag("STAYS PUT", CX, 1420, GREEN, sm(U("stays") - 0.1, U("put") + 0.1, u), 48);
    words(["LOOK FOR", "A GLINT"], GREEN, 360, 0.0, 1, 150, flash(u, U("glint")) * 0.6);
  }
  if (id === "s6") {
    tag("TELL THE HOST", CX, 1430, GREEN, sm(U("tell") - 0.05, U("tell") + 0.15, u), 50);
    words(["COVER IT"], GREEN, 360, 0.0, 1, 160, flash(u, U("towel")) * 0.6);
  }
  if (id === "s7") {
    words(["CHECK THE HOOK."], ORANGE, 690, 0.0, 1, 130, flash(u, 0.05));
    words(["THEN HANG YOUR COAT."], ORANGE, 880, U("then") - 0.05, 1, 130, flash(u, U("coat")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
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
window.__hf.buildReady["coat-hook-cgi"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
