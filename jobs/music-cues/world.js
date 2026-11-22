// music-cues: EXPLAINER 3D style (YogaFlow style test 22.11, style 10). Bright clay/toy three.js: rounded soft
// shapes, matte clay with a faint fingerprint bump, blue sky and a simple clay city through the studio window,
// friendly clay people with dot eyes. A yoga class where the music buries the teacher's cues. No real brands,
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

// ---------- world: a bright clay yoga studio ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0ff);
const camera = new THREE.PerspectiveCamera(36, LW / LH, 0.05, 100);
const hemi = new THREE.HemisphereLight(0xcfeaff, 0xf2d6b0, 1.5); scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff3e0, 2.2);
key.position.set(-3, 8, 6); key.castShadow = true;
key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 8; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
Object.assign(key.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
scene.add(key);
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
const cap = (r, l, mat, parent = scene) => add(new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 8, 20), mat), parent);

const WALL_Z = -4;
{
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), clay(0xf0c79a)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  // wooden studio floor boards
  const bm = clay(0xe4b583);
  for (let i = 0; i < 9; i++) { const b = rbox(0.06, 0.01, 7.2, 0.005, bm); b.position.set(-2.8 + i * 0.7, 0.005, -0.4); b.castShadow = false; }
  const wm = clay(0xfff1dc);
  const WX = -1.3, WY = 2.4, WW = 2.4, WH = 1.6;
  const slab = (w, h, cx, cy) => { const m = rbox(w, h, 0.3, 0.05, wm); m.position.set(cx, cy, WALL_Z - 0.15); };
  slab(WX - WW / 2 + 5, 6, (-5 + WX - WW / 2) / 2, 3);
  slab(5 - (WX + WW / 2), 6, (WX + WW / 2 + 5) / 2, 3);
  slab(WW, WY - WH / 2, WX, (WY - WH / 2) / 2);
  slab(WW, 6 - (WY + WH / 2), WX, (WY + WH / 2 + 6) / 2);
  const fm = clay(0x7a5cff);
  for (const [w, h, cx, cy] of [[WW + 0.2, 0.12, WX, WY + WH / 2], [WW + 0.2, 0.16, WX, WY - WH / 2], [0.12, WH, WX - WW / 2, WY], [0.12, WH, WX + WW / 2, WY], [0.07, WH, WX, WY]]) { const f = rbox(w, h, 0.2, 0.04, fm); f.position.set(cx, cy, WALL_Z + 0.02); }
  const cityM = [0xff9f7a, 0xffd36e, 0x9ad0ff, 0xc6a6ff, 0x8fe0b0];
  for (let i = 0; i < 9; i++) { const h = 1.2 + ((i * 37) % 5) * 0.45; const b = rbox(0.9, h, 0.9, 0.18, clay(cityM[i % 5])); b.position.set(-4.2 + i * 0.85, 0.8 + h / 2, -9 - (i % 3) * 0.8); }
  const hill = add(new THREE.Mesh(new THREE.SphereGeometry(6, 32, 16), clay(0x86d27a))); hill.scale.set(2, 0.35, 1); hill.position.set(-1, -1.5, -11);
  for (const [cx, cy] of [[-2.6, 4.6], [0.4, 5.2]]) { const g = new THREE.Group(); for (const [dx, r] of [[0, 0.5], [0.5, 0.4], [-0.5, 0.38]]) { const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), clay(0xffffff, 1)); s.position.x = dx; g.add(s); } g.position.set(cx, cy, -12); scene.add(g); }
  // a potted plant in the corner
  const pot = add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 32), clay(0xff9f7a))); pot.position.set(-2.6, 0.2, -3.5);
  for (const [dx, dy, r] of [[0, 0.62, 0.26], [0.16, 0.8, 0.2], [-0.15, 0.78, 0.2], [0, 0.98, 0.17]]) ball(r, clay(0x5cc27a)).position.set(-2.6 + dx, dy, -3.5);
}

// ---------- clay people (origin on the floor, facing +z) ----------
function makePerson(shirt, hair, skinHex = 0xffc9a0) {
  const g = new THREE.Group(); scene.add(g);
  const body = new THREE.Group(); body.position.y = 0.66; g.add(body);
  const pants = clay(0x34406b), skin = clay(skinHex), sh = clay(shirt);
  const legs = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.12, 0, 0); body.add(p); cap(0.095, 0.5, pants, p).position.y = -0.33; return p; });
  cap(0.26, 0.4, sh, body).position.y = 0.42;
  const arms = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.32, 0.72, 0); body.add(p); cap(0.075, 0.42, sh, p).position.y = -0.27; ball(0.075, skin, p).position.y = -0.55; return p; });
  const head = new THREE.Group(); head.position.y = 1.08; body.add(head);
  ball(0.26, skin, head);
  const hr = add(new THREE.Mesh(new THREE.SphereGeometry(0.275, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45), clay(hair)), head); hr.position.y = 0.02;
  for (const s of [-0.09, 0.09]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.034, 16, 12), new THREE.MeshBasicMaterial({ color: 0x15121a })); e.position.set(s, 0.03, 0.245); head.add(e); }
  const ck = clay(0xff9a8a); for (const s of [-0.15, 0.15]) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), ck); c.scale.set(1, 0.6, 0.4); c.position.set(s, -0.06, 0.22); head.add(c); }
  return { g, body, legs, arms, head, shirtMat: sh };
}
// poses: k blends are done by the caller; every call sets every joint
function poseStand(p) { p.body.position.y = 0.66; p.body.rotation.set(0, 0, 0); p.legs.forEach((l) => l.rotation.set(0, 0, 0)); p.arms.forEach((a, i) => a.rotation.set(0, 0, (i ? 1 : -1) * 0.14)); p.head.rotation.set(0, 0, 0); }
function poseSit(p) { p.body.position.y = 0.2; p.body.rotation.set(0, 0, 0); p.legs.forEach((l, i) => l.rotation.set(-Math.PI / 2, 0, (i ? 1 : -1) * 0.55)); p.arms.forEach((a, i) => a.rotation.set(-0.55, 0, (i ? 1 : -1) * 0.25)); p.head.rotation.set(0, 0, 0); }
function poseLunge(p, k) {
  // stand -> warrior lunge with both arms up
  p.body.position.y = lerp(0.66, 0.5, k); p.body.rotation.set(0, 0, 0);
  p.legs[0].rotation.set(lerp(0, -0.75, k), 0, 0); p.legs[1].rotation.set(lerp(0, 0.6, k), 0, 0);
  p.arms.forEach((a, i) => a.rotation.set(0, 0, (i ? 1 : -1) * lerp(0.14, Math.PI - 0.22, k)));
  p.head.rotation.set(0, 0, 0);
}
function poseWalk(p, ph, amp = 1) {
  poseStand(p);
  const s = Math.sin(ph) * 0.5 * amp;
  p.legs[0].rotation.x = s; p.legs[1].rotation.x = -s; p.arms[0].rotation.x = -s * 0.8; p.arms[1].rotation.x = s * 0.8;
  p.body.position.y = 0.66 + Math.abs(Math.cos(ph)) * 0.03 * amp;
}

const TEACH = V(0, 0, -2.6);
const teacher = makePerson(0x34c77b, 0x3a2a20);
const ROWS = [-0.6, 1.4], COLS = [-1.3, 0, 1.3];
const SHIRTS = [0xff8a6e, 0x5b8def, 0xffc94a, 0xc6a6ff, 0xff7fae, 0x67c3a6];
const HAIRS = [0x3a2a20, 0x8a5a2b, 0x1d1a24, 0xd9a24a, 0x3a2a20, 0x5a3320];
const students = [];
const matMat = clay(0x9a86ff), matHot = clay(0x7a5cff);
const mats = [];
ROWS.forEach((z, r) => COLS.forEach((cx, c) => {
  const i = r * 3 + c;
  const m = rbox(0.72, 0.035, 1.5, 0.017, matMat); m.position.set(cx, 0.018, z); mats.push(m);
  const p = makePerson(SHIRTS[i], HAIRS[i], i % 2 ? 0xe8a87c : 0xffc9a0);
  p.home = V(cx, 0, z); students.push(p);
}));
{ const m = rbox(0.72, 0.035, 1.5, 0.017, clay(0x34c77b)); m.position.set(TEACH.x, 0.018, TEACH.z); }

// ---------- the speaker on the floor, front right ----------
const SPK = V(1.95, 0, -3.25);
const spkG = new THREE.Group(); scene.add(spkG);
const spkMat = clay(0x34406b);
const cones = [];
{
  rbox(0.62, 1.15, 0.5, 0.09, spkMat, spkG).position.y = 0.575;
  for (const [y, r] of [[0.38, 0.2], [0.85, 0.12]]) {
    const ring = add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 12, 40), clay(0x9a86ff)), spkG); ring.position.set(0, y, 0.255);
    const cn = add(new THREE.Mesh(new THREE.SphereGeometry(r * 0.92, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), clay(0x1d2038)), spkG);
    cn.rotation.x = Math.PI / 2; cn.scale.set(1, 0.35, 1); cn.position.set(0, y, 0.24); cones.push(cn);
  }
  spkG.position.copy(SPK); spkG.rotation.y = -0.45;
}
const SPKTOP = () => spkG.localToWorld(V(0, 1.2, 0));

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
const WIDE = boxPts(-2.0, 2.3, 0, 2.1, -3.5, 2.0);
const SHOTS = {
  s1: () => fit(WIDE, [0.3, 0.55, 1], [70, 600, 1010, 1440]),
  s2: () => fit(boxPts(-1.8, 1.7, 0, 2.1, -2.9, 0.1), [-1, 0.55, -0.32], [90, 640, 990, 1360]),
  s3: () => fit(boxPts(-1.8, 2.3, 0, 1.4, -3.4, 2.1), [0.3, 0.65, 1], [90, 620, 990, 1440]),
  s4: () => fit(boxPts(-1.6, 1.6, 0, 2.1, -3.2, 2.7), [1, 0.6, 0.2], [70, 620, 1010, 1440]),
  s5: () => fit(boxPts(-0.5, 2.3, 0, 2.2, -3.6, -2.2), [0.05, 0.3, 1], [130, 600, 950, 1420]),
  s6: () => fit(boxPts(-1.8, 1.8, 0, 2.6, -1.4, 2.2), [0.45, 0.5, 1], [70, 680, 1010, 1440]),
  s7: () => fit(WIDE, [0.0, 0.5, 1], [70, 600, 1010, 1440]),
  s8: () => fit(boxPts(-1.8, 1.8, 0, 1.4, -1.3, 2.1), [0.2, 0.6, 1], [150, 300, 930, 760]),
};
const ORBIT = { s1: 0.16, s2: 0.12, s3: 0.14, s4: -0.12, s5: 0.12, s6: -0.12, s7: 0.08, s8: 0.3 };
const shotCache = {};
const yAxis = V(0, 1, 0);
function shoot(key, u, d) {
  const s = shotCache[key] || (shotCache[key] = SHOTS[key]());
  const k = sm(-0.2, Math.max(0.6, d) + 0.2, u);
  const dir = s.dir.clone().applyAxisAngle(yAxis, lerp(-0.5, 0.5, k) * ORBIT[key]);
  place(s.look, dir, s.dist * lerp(1.06, 0.98, k));
}
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };
const headP = (p, up = 0) => p.head.localToWorld(V(0, up, 0));

// ---------- overlay (clay sticker look: white/colour fill, dark ink outline) ----------
const RED = "#ff4d5a", GREEN = "#2fd27a", VIOLET = "#7a5cff", ORANGE = "#ff8a2a", WHITE = "#ffffff", INK = "#14183a";
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
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 300, 1420);
  x.translate(X, Y); x.scale(s, s);
  x.shadowColor = "rgba(20,24,58,0.35)"; x.shadowOffsetY = 8;
  x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, h / 2); x.fillStyle = color; x.fill();
  x.shadowColor = "transparent"; x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
// speech bubble pointing at (tx, ty)
function bubble(txt, X, Y, color, a, tx, ty, px = 50) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const w = x.measureText(txt).width + 70, h = px * 1.8, s = back(0, 1, cl(a));
  X = cl(X, 70 + w / 2, 930 - w / 2);
  x.translate(X, Y); x.scale(s, s);
  const tx2 = (tx - X) * 0.5, ty2 = (ty - Y) * 0.5;
  x.shadowColor = "rgba(20,24,58,0.35)"; x.shadowOffsetY = 8;
  x.fillStyle = WHITE; x.strokeStyle = INK; x.lineWidth = 7;
  x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 34); x.fill();
  x.beginPath(); x.moveTo(-26, h / 2 - 6); x.lineTo(tx2, ty2); x.lineTo(20, h / 2 - 6); x.fill();
  x.shadowColor = "transparent";
  x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 34); x.stroke();
  x.beginPath(); x.moveTo(-26, h / 2 - 2); x.lineTo(tx2, ty2); x.lineTo(20, h / 2 - 2); x.stroke();
  x.fillStyle = WHITE; x.fillRect(-24, h / 2 - 12, 42, 12);
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function note(X, Y, s, a, c, rot = 0) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.rotate(rot); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  const path = () => { x.beginPath(); x.ellipse(-30, 30, 26, 19, -0.4, 0, Math.PI * 2); x.moveTo(76, 14); x.ellipse(50, 14, 26, 19, -0.4, 0, Math.PI * 2); };
  x.strokeStyle = INK; x.lineWidth = 26; x.beginPath(); x.moveTo(-6, 26); x.lineTo(-6, -70); x.lineTo(74, -86); x.lineTo(74, 10); x.stroke();
  path(); x.lineWidth = 12; x.stroke();
  x.strokeStyle = c; x.lineWidth = 12; x.beginPath(); x.moveTo(-6, 26); x.lineTo(-6, -70); x.lineTo(74, -86); x.lineTo(74, 10); x.stroke();
  path(); x.fillStyle = c; x.fill();
  x.restore();
}
function notes(X, Y, k, a, c, u, n = 6, spread = 1) {
  for (let i = 0; i < n; i++) {
    const ph = (u * 0.6 + i / n) % 1;
    const nx = X + Math.cos(i * 2.1) * (50 + 220 * ph) * spread, ny = Y - 30 - 260 * ph * spread + Math.sin(u * 4 + i) * 14;
    note(nx, Math.max(500, ny), (0.42 + 0.45 * k) * (0.8 + 0.2 * Math.sin(i)), a * (1 - ph * 0.6), c, Math.sin(u * 3 + i) * 0.25);
  }
}
// clay volume bars (level 0..1), base centre at (X, Y)
function bars(X, Y, level, a, c, s = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineJoin = "round";
  for (let i = 0; i < 5; i++) {
    const on = (i + 0.5) / 5 <= level, bh = (28 + i * 20) * s, bw = 24 * s, bx = X + (i - 2.5) * 32 * s;
    x.beginPath(); x.roundRect(bx, Y - bh, bw, bh, 7 * s);
    x.fillStyle = on ? c : "rgba(255,255,255,0.85)"; x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
  }
  x.restore();
}
function slider(X, Y, w, level, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineCap = "round";
  x.strokeStyle = INK; x.lineWidth = 32; x.beginPath(); x.moveTo(X - w / 2, Y); x.lineTo(X + w / 2, Y); x.stroke();
  x.strokeStyle = WHITE; x.lineWidth = 20; x.stroke();
  x.strokeStyle = c; x.beginPath(); x.moveTo(X - w / 2, Y); x.lineTo(X - w / 2 + w * level, Y); x.stroke();
  x.fillStyle = WHITE; x.strokeStyle = INK; x.lineWidth = 7; x.beginPath(); x.arc(X - w / 2 + w * level, Y, 32, 0, Math.PI * 2); x.fill(); x.stroke();
  x.font = FONT(40); x.textAlign = "right"; x.textBaseline = "middle"; x.lineWidth = 10; x.strokeText("VOL", X - w / 2 - 34, Y + 2); x.fillStyle = c; x.fillText("VOL", X - w / 2 - 34, Y + 2);
  x.restore();
}
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fillStyle = c; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
  x.strokeStyle = WHITE; x.lineWidth = 18; x.beginPath(); x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); x.stroke();
  x.restore();
}
function waves(X, Y, a, c, u, dir = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineCap = "round";
  for (let i = 0; i < 3; i++) { const r = 28 + i * 24 + ((u * 60) % 24); const a0 = dir > 0 ? -0.6 : Math.PI - 0.6; x.strokeStyle = INK; x.lineWidth = 14; x.beginPath(); x.arc(X, Y, r, a0, a0 + 1.2); x.stroke(); x.strokeStyle = c; x.lineWidth = 7; x.stroke(); }
  x.restore();
}
function dashed(x0, y0, x1, y1, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.lineCap = "round"; x.setLineDash([22, 18]);
  x.strokeStyle = INK; x.lineWidth = 16; x.beginPath(); x.moveTo(x0, y0); x.lineTo(lerp(x0, x1, a), lerp(y0, y1, a)); x.stroke();
  x.strokeStyle = c; x.lineWidth = 8; x.stroke(); x.restore();
}

// ---------- one frame ----------
function reset() {
  teacher.g.visible = true; teacher.g.position.copy(TEACH); teacher.g.rotation.set(0, 0, 0); poseStand(teacher);
  students.forEach((p) => { p.g.visible = true; p.g.position.copy(p.home); p.g.rotation.set(0, Math.PI, 0); poseSit(p); });
  mats.forEach((m) => { m.material = matMat; });
  spkG.scale.setScalar(1); spkMat.color.set(0x34406b); cones.forEach((c) => c.scale.set(1, 0.35, 1));
  key.intensity = KEYI; hemi.intensity = HEMII;
}
function thump(u, k) { const b = 0.5 + 0.5 * Math.sin(u * 14); cones.forEach((c) => c.scale.set(1 + 0.08 * b * k, 0.35 + 0.25 * b * k, 1 + 0.08 * b * k)); }

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  const U = (w, n) => at(id, w, n);
  let dim = 0;
  const L = {};
  shoot(id, u, d);
  // small idle breathing so no shot freezes
  students.forEach((p, i) => { p.body.position.y += 0.012 * Math.sin(t * 2.6 + i); });

  if (id === "s1") {
    const Dn = sm(U("drown") - 0.1, U("out") + 0.15, u);
    spkG.scale.setScalar(1 + 0.3 * Dn);
    spkMat.color.set(0x34406b).lerp(new THREE.Color(0xff5a64), Dn);
    thump(u, 0.6 + Dn);
    teacher.arms[1].rotation.set(-0.3, 0, 1.2); // a cueing gesture
    students.forEach((p, i) => { p.head.rotation.y = 0.35 * Dn * Math.sin(t * 3 + i); });
    L.Dn = Dn;
  }
  if (id === "s2") {
    thump(u, 1);
    const Wt = sm(U("watch") - 0.15, U("neighbor") + 0.1, u);
    const mid = students[1];
    mid.head.rotation.y = 0.95 * Wt;
    mid.body.rotation.y = 0.25 * Wt;
    teacher.arms[1].rotation.set(-0.3, 0, 1.2);
    L.Wt = Wt;
  }
  if (id === "s3") {
    thump(u, 1);
    L.Bk = sm(U("back") - 0.15, U("row") + 0.1, u);
    L.Ls = sm(U("least") - 0.15, U("least") + 0.15, u);
    for (let i = 3; i < 6; i++) students[i].head.rotation.z = 0.25 * L.Ls * (i % 2 ? 1 : -1); // straining to hear
  }
  if (id === "s4") {
    // before class: empty room. The teacher walks down the side lane to the back and listens.
    students.forEach((p) => { p.g.visible = false; });
    const Wk = sm(U("stand") - 0.25, U("back") + 0.25, u);
    const Ck = sm(U("check") - 0.1, U("volume") + 0.2, u);
    const LANE = -0.65;
    teacher.g.position.set(lerp(TEACH.x, LANE, sm(0, 0.25, Wk)), 0, lerp(TEACH.z, 2.5, Wk));
    if (Wk > 0.01 && Wk < 0.99) poseWalk(teacher, u * 9);
    teacher.g.rotation.y = Math.PI * sm(U("and") - 0.05, U("check"), u); // turns to face the front
    if (Ck > 0) { teacher.arms[0].rotation.set(0, 0, -lerp(0.14, 2.55, Ck)); teacher.head.rotation.z = -0.2 * Ck; }
    thump(u, 1);
    L.Ck = Ck;
  }
  if (id === "s5") {
    thump(u, lerp(1, 0.35, sm(U("words") - 0.1, U("words") + 0.2, u)));
    teacher.arms[1].rotation.set(-0.3, 0, 1.2);
    students.forEach((p) => { p.g.visible = false; });
  }
  if (id === "s6") {
    const Dn = sm(U("down") - 0.1, U("down") + 0.25, u);
    const Mv = sm(U("new") - 0.1, U("poses") + 0.6, u);
    const Up = sm(U("back") - 0.05, U("up") + 0.3, u);
    students.forEach((p, i) => {
      const k = cl(Mv * 1.4 - (i % 3) * 0.15);
      poseLunge(p, k);
      if (k > 0.97) mats[i].material = matHot;
    });
    poseLunge(teacher, cl(Mv * 1.2));
    thump(u, lerp(1, 0.25, Dn) + 0.75 * Up);
    L.level = 0.85 - 0.6 * Dn + 0.5 * Up; L.Dn = Dn; L.Up = Up;
  }
  if (id === "s7") { dim = 0.45; key.intensity = KEYI * 0.8; thump(u, 0.4); }
  if (id === "s8") { dim = 0.6; students.forEach((p, i) => { p.head.rotation.x = 0.1 * Math.sin(u * 2 + i); }); }
  renderer.render(scene, camera);
  present(dim);

  // ---------- overlay ----------
  if (id === "s1") {
    const [sx, sy] = scr(SPKTOP());
    notes(sx, sy, L.Dn, sm(U("music") - 0.2, U("music") + 0.1, u), L.Dn > 0.5 ? RED : VIOLET, u, 4 + Math.round(5 * L.Dn), 1 + 0.5 * L.Dn);
    const [hx, hy] = scr(headP(teacher, 0.3));
    bubble("BREATHE IN", hx - 120, hy - 120, GREEN, sm(0.05, 0.4, u) * (1 - 0.85 * L.Dn), hx, hy, 46);
    tag("CAN'T HEAR YOU", CX, 1400, RED, sm(U("cues") - 0.15, U("cues") + 0.1, u), 46);
    words(["NEVER LET MUSIC", "DROWN YOUR CUES"], RED, 360, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, U("never"))));
  }
  if (id === "s2") {
    const [sx, sy] = scr(SPKTOP());
    notes(sx, sy, 0.6, 1, RED, u, 5, 0.9);
    const [ax, ay] = scr(headP(students[1], 0.05)), [bx2, by2] = scr(headP(students[0], 0.05));
    dashed(ax, ay, bx2, by2, L.Wt, RED);
    const [qx, qy] = scr(headP(students[1], 0.5));
    tag("?", qx, qy - 40, RED, sm(U("hear") - 0.1, U("hear") + 0.15, u), 56);
    tag("COPIES THE NEIGHBOR", CX, 1400, RED, L.Wt, 42);
    words(["THEY WATCH", "THE NEIGHBOR"], RED, 360, 0.0, 1, 140, flash(u, U("neighbor")) * 0.6);
  }
  if (id === "s3") {
    const [fx, fy] = scr(V(0, 1.6, ROWS[0])), [bx3, by3] = scr(V(0, 1.6, ROWS[1]));
    const [sx, sy] = scr(SPKTOP());
    notes(sx, sy, 0.5, 1, VIOLET, u, 4, 0.7);
    bars(Math.min(fx + 260, 840), fy, 1, 1, GREEN, 0.8);
    bars(Math.min(bx3 + 300, 840), by3, lerp(0.6, 0.2, L.Ls), L.Bk, L.Ls > 0.5 ? RED : ORANGE, 0.8);
    tag("HEARS LEAST", bx3, Math.min(by3 + 80, 1180), RED, L.Ls, 42);
    words(["THE BACK ROW", "HEARS LEAST"], RED, 360, 0.0, 1, 140, flash(u, U("least")) * 0.6);
  }
  if (id === "s4") {
    const [hx, hy] = scr(headP(teacher, 0.35));
    bars(hx + 150, hy - 10, lerp(0.2, 0.75, L.Ck), sm(U("check") - 0.2, U("check"), u), L.Ck > 0.6 ? GREEN : ORANGE, 0.8);
    check(hx - 110, hy - 90, back(U("yourself") - 0.05, U("yourself") + 0.3, u) * 0.6, sm(U("yourself") - 0.05, U("yourself") + 0.1, u));
    tag("BEFORE CLASS", CX, 1400, GREEN, sm(0.0, 0.3, u), 44);
    words(["CHECK FROM", "THE BACK"], GREEN, 360, 0.0, 1, 150, flash(u, U("check")) * 0.6);
  }
  if (id === "s5") {
    const Wd = sm(U("words") - 0.1, U("words") + 0.2, u);
    const Tk = sm(U("talk") - 0.15, U("talk") + 0.1, u);
    const [sx, sy] = scr(SPKTOP());
    bubble("LA LA LA", sx - 60, sy - 150, RED, sm(U("songs") - 0.15, U("songs") + 0.15, u), sx, sy, 48);
    if (Wd > 0) { x.save(); x.lineCap = "round"; x.strokeStyle = INK; x.lineWidth = 26; x.beginPath(); x.moveTo(sx - 250, sy - 110); x.lineTo(lerp(sx - 250, sx + 130, Wd), lerp(sy - 110, sy - 200, Wd)); x.stroke(); x.strokeStyle = RED; x.lineWidth = 14; x.stroke(); x.restore(); }
    notes(sx, sy + 40, 0.4, Wd, GREEN, u, 5, 0.6);
    tag("NO LYRICS", sx - 40, sy - 290, GREEN, Wd, 42);
    const [hx, hy] = scr(headP(teacher, 0.0));
    waves(hx + 40, hy, Tk, GREEN, u);
    tag("YOUR CUES", hx - 60, hy - 170, GREEN, Tk, 42);
    words(["SONGS", "WITHOUT WORDS"], GREEN, 360, 0.0, 1, 150, flash(u, U("words")) * 0.6);
  }
  if (id === "s6") {
    slider(CX + 50, 580, 560, L.level, 1, L.Up > 0.5 ? GREEN : (L.Dn > 0.5 ? ORANGE : VIOLET));
    students.slice(0, 3).forEach((p, i) => {
      const [hx, hy] = scr(headP(p, 0.9));
      const t0 = U("everyone") - 0.05 + i * 0.1;
      check(hx, hy, back(t0, t0 + 0.3, u) * 0.4, sm(t0, t0 + 0.1, u));
    });
    tag("NEW POSE", CX, 1400, ORANGE, sm(U("new") - 0.1, U("new") + 0.15, u) * (1 - L.Up), 44);
    tag("EVERYONE IN", CX, 1400, GREEN, L.Up, 44);
    words(["DOWN FOR", "NEW POSES"], GREEN, 360, 0.0, 1, 150, flash(u, U("down")) * 0.6);
  }
  if (id === "s7") {
    words(["CUES FIRST."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["MUSIC SECOND."], ORANGE, 880, U("music") - 0.05, 1, 140, flash(u, U("second")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.4, u);
    x.save(); x.translate(CX, 530); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    x.strokeStyle = INK; x.lineWidth = 22; x.beginPath(); x.arc(0, 0, 220, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "#b3a4ff"; x.lineWidth = 12; x.stroke();
    x.strokeStyle = GREEN; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.arc(0, 0, 252, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 870, 0.15, 1, 130);
    words([c2], "#b3a4ff", 1020, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1165, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["music-cues-explainer3d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
