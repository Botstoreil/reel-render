// bend-knees (YogaFlow 33): REALISTIC RENDER look (like Apex 171K), same daylight studio as new-student.
// One student side-on: straight-leg fold with a rounded back (wrong) vs bent knees, belly on thighs (right). s8 = brand CTA.
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
scene.background = new THREE.Color(0xe9e2d6);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const FOV = 40;
const camera = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.05, 200);

const hemi = new THREE.HemisphereLight(0xfff8ee, 0x8a7258, 0.6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0dc, 2.1);
sun.position.set(-5, 8, 6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 40 });
sun.shadow.bias = -0.0004; sun.shadow.radius = 5; scene.add(sun);
sun.target.position.set(0, 0, -1.5); scene.add(sun.target);

// ---------- materials + textures ----------
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const woodTex = canvasTex(1024, 1024, (g, w, h) => {
  const r = rng(7); const rows = 10;
  for (let i = 0; i < rows; i++) {
    let x0 = -r() * 400;
    while (x0 < w) {
      const L = 300 + r() * 380, tone = 175 + r() * 30;
      g.fillStyle = `rgb(${tone + 25},${tone - 10},${tone - 50})`; g.fillRect(x0, i * h / rows, L, h / rows);
      for (let k = 0; k < 12; k++) { g.strokeStyle = `rgba(110,70,35,${0.04 + r() * 0.07})`; g.lineWidth = 1 + r() * 2; const y = i * h / rows + r() * h / rows; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + L / 3, y + 4 - r() * 8, x0 + 2 * L / 3, y + 4 - r() * 8, x0 + L, y); g.stroke(); }
      g.fillStyle = "rgba(60,35,15,0.4)"; g.fillRect(x0, i * h / rows, 2, h / rows);
      x0 += L;
    }
    g.fillStyle = "rgba(60,35,15,0.35)"; g.fillRect(0, i * h / rows, w, 2);
  }
}, [3, 3]);
const plasterTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#f1ece3"; g.fillRect(0, 0, w, h);
  const r = rng(5); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,110,95,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 3, 3); }
}, [4, 2]);
const matTex = (hex) => canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = hex; g.fillRect(0, 0, w, h);
  const r = rng(11); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.06})`; g.fillRect(r() * w, r() * h, 2, 2); }
});
const std = (o) => new THREE.MeshStandardMaterial(o);
const M = {
  floor: std({ map: woodTex, roughness: 0.5, metalness: 0 }),
  wall: std({ map: plasterTex, roughness: 0.92 }),
  white: std({ color: 0xf6f6f4, roughness: 0.35 }),
  glass: std({ color: 0xd8e8f2, roughness: 0.05, metalness: 0.1, emissive: 0xe8f2fa, emissiveIntensity: 0.75 }),
  leaf: std({ color: 0x3f7a3a, roughness: 0.7 }),
  pot: std({ color: 0xd9cbb4, roughness: 0.8 }),
  oak: std({ color: 0xb08458, roughness: 0.6 }),
  cork: std({ color: 0xb98d5e, roughness: 0.9 }),
  bolster: std({ color: 0x5b6b8a, roughness: 0.95 }),
};

const geoCache = {};
const rbg = (w, h, d, r) => { const k = [w, h, d, r].map((v) => v.toFixed(3)).join("|"); return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1))); };
function rb(w, h, d, mat, r = 0.03) { const m = new THREE.Mesh(rbg(w, h, d, r), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function put(o, x, y, z, parent = scene) { o.position.set(x, y, z); parent.add(o); return o; }

// ---------- studio ----------
const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 2); floor.receiveShadow = true; scene.add(floor);
put(rb(16, 4.0, 0.2, M.wall, 0.01), 0, 2.0, -4.6);                       // back wall
put(rb(0.2, 4.0, 14, M.wall, 0.01), -4.2, 2.0, 1.0);                      // left wall
put(rb(0.2, 4.0, 14, M.wall, 0.01), 4.4, 2.0, 1.0);                       // right wall
// tall windows on the back wall
for (const wx of [-2.3, 0.0, 2.3]) {
  put(rb(1.7, 2.5, 0.06, M.glass, 0.01), wx, 1.85, -4.48);
  [[wx, 3.12, 1.8, 0.08], [wx, 0.58, 1.8, 0.08], [wx, 1.85, 1.8, 0.05]].forEach(([x, y, w, h]) => put(rb(w, h, 0.1, M.white, 0.01), x, y, -4.44));
  [wx - 0.88, wx + 0.88, wx].forEach((x) => put(rb(0.07, 2.6, 0.1, M.white, 0.01), x, 1.85, -4.44));
}
function plant(x, z, s = 1, seed = 1) {
  const g = new THREE.Group();
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.46, 24), M.pot), 0, 0.23, 0, g).castShadow = true;
  const r = rng(seed);
  for (let i = 0; i < 11; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.2 + r() * 0.12, 16, 12), M.leaf); l.scale.set(1, 1.6, 0.45); l.rotation.set(r() - 0.5, r() * 6, r() - 0.5); put(l, (r() - 0.5) * 0.45, 0.7 + r() * 0.65, (r() - 0.5) * 0.45, g).castShadow = true; }
  g.scale.setScalar(s); put(g, x, 0, z); return g;
}
plant(-3.6, -4.0, 1.1, 3); plant(3.7, -4.0, 1.0, 8); plant(-3.7, 0.5, 0.9, 13);
// shelf with rolled mats, cork blocks and a bolster on the right wall
const shelf = new THREE.Group();
put(rb(0.45, 1.2, 2.0, M.oak, 0.02), 0, 0.6, 0, shelf);
[0.4, 0.8].forEach((y) => put(rb(0.42, 0.03, 1.92, M.oak, 0.005), 0, y, 0, shelf));
const rollCols = [0x7f6fd6, 0x5aa58f, 0xc98b6b, 0x4f6d9a];
rollCols.forEach((c, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.62, 20), std({ color: c, roughness: 0.85 })); m.rotation.x = Math.PI / 2; m.castShadow = true; put(m, 0, 1.28, -0.7 + i * 0.16, shelf); m.rotation.set(0, 0, 0); m.position.y = 1.51; });
[0, 1, 2].forEach((i) => put(rb(0.22, 0.12, 0.3, M.cork, 0.02), 0, 0.88, 0.2 + i * 0.25, shelf));
const bol = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.6, 24), M.bolster); bol.rotation.x = Math.PI / 2; bol.castShadow = true; put(bol, 0, 0.53, -0.4, shelf);
put(shelf, 4.05, 0, -2.4);

// ---------- people (capsule mannequins, side profile, face local +x, feet at the origin) ----------
// pose joints [x forward, y up] in metres. Optional elR/hdR = the near (+z) arm on its own.
const STAND = { head: [0.02, 1.6], sh: [0, 1.42], hip: [0, 0.95], kn: [0.02, 0.5], ft: [0, 0.07], toe: [0.19, 0.04], el: [0.03, 1.15], hd: [0.05, 0.88] };
const UP = { ...STAND, el: [0.0, 1.7], hd: [0.02, 1.95] };
const FOLD = { head: [0.22, 0.33], sh: [0.2, 0.5], hip: [-0.1, 0.88], kn: [0.08, 0.48], ft: [0, 0.07], toe: [0.19, 0.04], el: [0.24, 0.27], hd: [0.26, 0.06] };
// wrong: locked straight legs, hips barely hinge, the back rounds and the head hangs toward the shins, hands short of the floor
const ROUND = { head: [0.04, 0.42], sh: [0.15, 0.57], hip: [-0.1, 0.93], kn: [0.01, 0.5], ft: [0, 0.07], toe: [0.19, 0.04], el: [0.18, 0.36], hd: [0.12, 0.17] };
// right: knees bent, belly resting on the thighs, long flat back, hands on the floor
const BENT = { head: [0.42, 0.52], sh: [0.28, 0.58], hip: [-0.18, 0.66], kn: [0.2, 0.45], ft: [0, 0.07], toe: [0.19, 0.04], el: [0.3, 0.32], hd: [0.33, 0.07] };
// then legs straightened a little, belly still on the thighs, the fold comes from the hips
const HALFSTR = { head: [0.34, 0.39], sh: [0.25, 0.51], hip: [-0.14, 0.79], kn: [0.13, 0.47], ft: [0, 0.07], toe: [0.19, 0.04], el: [0.27, 0.27], hd: [0.29, 0.07] };
const KEYS = ["head", "sh", "hip", "kn", "ft", "toe", "el", "hd", "elR", "hdR"];
function pose(a, b, k, arc = 0) {
  const o = {};
  for (const j of KEYS) {
    const A = a[j] || (j === "elR" ? a.el : j === "hdR" ? a.hd : null), B = b[j] || (j === "elR" ? b.el : j === "hdR" ? b.hd : null);
    if (!A || !B) continue;
    const bump = (j === "el" || j === "hd" || j === "elR" || j === "hdR") ? arc * Math.sin(Math.PI * k) : 0;
    o[j] = [lerp(A[0], B[0], k) + bump, lerp(A[1], B[1], k)];
  }
  return o;
}
const capCache = {};
const capGeo = (r, L) => { const k = r.toFixed(3) + "|" + L.toFixed(2); return capCache[k] || (capCache[k] = new THREE.CapsuleGeometry(r, Math.max(0.01, L), 5, 14)); };
const UPV = V(0, 1, 0), tmpD = V(0, 0, 0);
function seg(mesh, A, B, r) {
  tmpD.copy(B).sub(A); const L = Math.round(tmpD.length() * 100) / 100;
  mesh.geometry = capGeo(r, L);
  mesh.position.copy(A).addScaledVector(tmpD, 0.5);
  mesh.quaternion.setFromUnitVectors(UPV, tmpD.normalize());
}
function person(o) {
  const g = new THREE.Group();
  const shirt = std({ color: o.shirt, roughness: 0.85 }), pants = std({ color: o.pants, roughness: 0.9 });
  const skin = std({ color: o.skin, roughness: 0.6 }), hair = std({ color: o.hair, roughness: 0.75 });
  const mk = (mat) => { const m = new THREE.Mesh(capGeo(0.05, 0.1), mat); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const P = {
    torsoA: mk(shirt), torsoB: mk(shirt), shoulders: mk(shirt), pelvis: mk(pants), neck: mk(skin),
    thighL: mk(pants), thighR: mk(pants), shinL: mk(pants), shinR: mk(pants), footL: mk(skin), footR: mk(skin),
    uarmL: mk(shirt), uarmR: mk(shirt), farmL: mk(skin), farmR: mk(skin),
  };
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 24, 18), skin); head.castShadow = true; g.add(head);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.112, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55), hair); hairM.castShadow = true; g.add(hairM);
  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), hair); bun.castShadow = true; g.add(bun);
  const hands = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10), skin); m.castShadow = true; g.add(m); return m; });
  scene.add(g);
  let cur = STAND;
  const J = (p, j, z, dx = 0) => V(p[j][0] + dx, p[j][1], z);
  g.setPose = (p, shake = 0) => {
    cur = p;
    const sx = shake;
    const hipL = J(p, "hip", -0.1), hipR = J(p, "hip", 0.1);
    const shL = J(p, "sh", -0.17, sx), shR = J(p, "sh", 0.17, sx), shC = J(p, "sh", 0, sx);
    seg(P.torsoA, J(p, "hip", -0.07), J(p, "sh", -0.07, sx), 0.12);
    seg(P.torsoB, J(p, "hip", 0.07), J(p, "sh", 0.07, sx), 0.12);
    seg(P.shoulders, shL, shR, 0.075);
    seg(P.pelvis, hipL, hipR, 0.115);
    const hd = J(p, "head", 0, sx);
    seg(P.neck, shC, shC.clone().lerp(hd, 0.6), 0.05);
    head.position.copy(hd);
    const n = hd.clone().sub(shC).normalize();
    hairM.position.copy(hd).addScaledVector(n, 0.012); hairM.quaternion.setFromUnitVectors(UPV, n);
    bun.position.copy(hd).addScaledVector(n, 0.1).add(V(-0.05 * n.y, 0.05 * n.x, 0));
    seg(P.thighL, hipL, J(p, "kn", -0.1), 0.075); seg(P.thighR, hipR, J(p, "kn", 0.1), 0.075);
    seg(P.shinL, J(p, "kn", -0.1), J(p, "ft", -0.1), 0.058); seg(P.shinR, J(p, "kn", 0.1), J(p, "ft", 0.1), 0.058);
    seg(P.footL, J(p, "ft", -0.1), J(p, "toe", -0.1), 0.04); seg(P.footR, J(p, "ft", 0.1), J(p, "toe", 0.1), 0.04);
    const elR = p.elR ? "elR" : "el", hdR = p.hdR ? "hdR" : "hd";
    seg(P.uarmL, shL, J(p, "el", -0.22, sx), 0.05); seg(P.farmL, J(p, "el", -0.22, sx), J(p, "hd", -0.22), 0.042);
    seg(P.uarmR, shR, J(p, elR, 0.22, sx), 0.05); seg(P.farmR, J(p, elR, 0.22, sx), J(p, hdR, 0.22), 0.042);
    hands[0].position.copy(J(p, "hd", -0.22)); hands[1].position.copy(J(p, hdR, 0.22));
  };
  g.world = (j, z = 0) => { g.updateMatrixWorld(); return g.localToWorld(V(cur[j][0], cur[j][1], z)); };
  g.setPose(STAND);
  return g;
}
function mat(hex, x, z, dir = 1) { const m = put(rb(1.83, 0.008, 0.62, std({ map: matTex(hex), roughness: 0.95 }), 0.004), x + 0.6 * dir, 0.004, z); m.castShadow = false; return m; }

// student front and centre (faces +x, camera on her near side). One classmate behind in a calm fold for depth.
const ST = { x: 0, z: 0 }, CA = { x: -1.3, z: -2.2 };
mat("#5aa58f", ST.x - 0.35, ST.z); mat("#7f6fd6", CA.x - 0.35, CA.z);
const student = person({ shirt: 0xe07a5f, pants: 0x2d3142, skin: 0xd9a37e, hair: 0x3b2418 }); student.position.set(ST.x, 0, ST.z);
const clA = person({ shirt: 0x6b7fa8, pants: 0x3a3a3a, skin: 0xb07c58, hair: 0x1d1612 }); clA.position.set(CA.x, 0, CA.z);

// ---------- camera shots: target, half-height of the view in metres, side offset ----------
// the body sits in the lower-middle of the frame (floor near y=1250 px), the title above it
const TAN = Math.tan((FOV / 2) * Math.PI / 180);
const shot = (tx, ty, tz, halfH, side = 0, elev = 0.3, push = 0.08) => { const d = halfH / TAN; return { to: V(tx, ty, tz), from: V(tx + side * d, ty + elev * d, tz + d), push }; };
const SH = {
  s1: shot(0.15, 0.78, 0, 2.2, 0.06, 0.16, 0.07),
  s2: shot(0.12, 0.52, 0, 1.6, -0.1, 0.16, 0.1),
  s3: shot(0.05, 0.5, 0, 1.15, 0.18, 0.2, 0.14),
  s4: shot(0.1, 0.48, 0, 1.45, 0.1, 0.18, 0.1),
  s5: shot(0.08, 0.5, 0, 1.3, -0.18, 0.14, 0.1),
  s6: shot(0.0, 0.5, 0, 1.15, -0.06, 0.16, 0.12),
  s7: shot(0.15, 0.62, 0, 1.9, 0.05, 0.16, 0.03),
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
function words(lines, color, cy, t0, a = 1, maxPx = 140, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); const n = L.split(" ").length - 1; return Math.min(maxPx, (800 / (x.measureText(L).width + n * x.measureText(" ").width * 0.6)) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width * 1.6;
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
  X = cl(X, 60 + w / 2, 930 - w / 2); Y = cl(Y, 300, 1350);
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
// slow breath: rings that grow out of the chest and fade (period in seconds)
function breath(X, Y, u, a, color, period = 1.4) {
  if (a <= 0) return;
  x.save(); x.lineWidth = 9; x.strokeStyle = color;
  for (let i = 0; i < 2; i++) { const f = ((u / period) + i * 0.5) % 1; x.globalAlpha = a * (1 - f) * 0.9; x.beginPath(); x.arc(X, Y, 40 + 150 * f, 0, Math.PI * 2); x.stroke(); }
  x.restore();
}

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  const U = (w, n) => at(id, w, n);
  shoot(id, cl(u / Math.max(0.5, d)));
  student.position.set(ST.x, 0, ST.z); student.rotation.y = 0;
  clA.setPose(FOLD);

  if (id === "s1") {
    // reach up, then on "bend ... knees" fold the right way (a preview of the rule)
    const k = sm(0.0, 0.55, u), kf = sm(U("bend") - 0.1, U("knees") + 0.25, u);
    student.setPose(kf > 0 ? pose(UP, BENT, kf, 0.3) : pose(STAND, UP, k, 0.35));
    clA.setPose(pose(UP, FOLD, sm(U("forward"), U("bend") + 0.3, u), 0.3));
  }
  if (id === "s2") {
    // up again, then the straight-leg fold: legs lock on "straight", the back rounds on "rounds", hands reach on "reach"
    const k = sm(0.0, U("legs") + 0.1, u);
    const reach = sm(U("reach") - 0.1, U("floor"), u) * 0.03;
    const p = pose(UP, ROUND, k, 0.3);
    if (k >= 1) { p.hd = [p.hd[0], p.hd[1] - reach]; p.el = [p.el[0], p.el[1] - reach * 0.6]; }
    student.setPose(p);
  }
  if (id === "s3") {
    const strain = sm(U("pull") - 0.1, U("back"), u);
    student.setPose(ROUND, strain * 0.01 * Math.sin(u * 46));
  }
  if (id === "s4") {
    // knees bend on "bend your knees", the belly settles onto the thighs by "thighs"
    student.setPose(pose(ROUND, BENT, sm(U("bend") - 0.1, U("rests") + 0.1, u)));
  }
  if (id === "s5") {
    // hinge stays at the hips; legs straighten a little, slowly, on "straighten ... little"
    student.setPose(pose(BENT, HALFSTR, sm(U("straighten") - 0.05, U("little") + 0.2, u)));
  }
  if (id === "s6" || id === "s7" || id === "s8") {
    student.setPose(HALFSTR);
  }
  renderer.render(scene, camera);

  // ---------- text ----------
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920); curU = u;
  if (id === "s1") {
    words(["BEND YOUR", "KNEES"], RED, 420, 0.0, 1, 170, flash(u, U("bend")) + flash(u, U("knees")) * 0.6);
    const [kx, ky] = scr(student.world("kn", 0.1));
    ring(kx, ky, 64, sm(U("knees") - 0.05, U("knees") + 0.2, u), GREEN);
    tag("SOUNDS WRONG", CX, 1180, RED, sm(U("sounds") - 0.05, U("sounds") + 0.2, u) * (1 - sm(U("but") - 0.05, U("but") + 0.1, u)), 46);
    tag("BUT IT HELPS", CX, 1180, GREEN, sm(U("but") - 0.05, U("helps") + 0.1, u), 48);
  }
  if (id === "s2") {
    words(["STRAIGHT LEGS"], RED, 400, 0.0, 1, 140, flash(u, U("straight")) * 0.6);
    words(["ROUND BACK"], RED, 560, U("rounds") - 0.1, 1, 140, flash(u, U("rounds")) * 0.6);
    const [kx, ky] = scr(student.world("kn", 0.1));
    tag("TIGHT HAMSTRINGS", kx - 40, ky + 140, RED, sm(U("tight") - 0.1, U("hamstrings") + 0.1, u) * (1 - sm(U("reach") - 0.1, U("reach"), u)), 40);
    backLine(0.2, RED, sm(U("rounds") - 0.15, U("rounds") + 0.2, u));
    const [hx, hy] = scr(student.world("hd", 0.22));
    tag("CAN'T REACH", hx + 40, hy + 120, RED, sm(U("reach") - 0.05, U("floor") + 0.1, u), 40);
  }
  if (id === "s3") {
    words(["PULL IN", "YOUR BACK"], RED, 400, 0.0, 1, 150, flash(u, U("back")) * 0.7);
    backLine(0.2, RED, 1);
    const [bx, by] = backPeak(0.2);
    ring(bx, by, 80 * (1 + 0.08 * Math.sin(u * 14)), sm(U("lands") - 0.1, U("back") + 0.1, u), RED);
    tag("NOT YOUR LEGS", CX, 1180, RED, sm(U("not") - 0.05, U("legs") + 0.1, u), 44);
    stamp("x", 800, 1120, back(U("legs"), U("legs") + 0.3, u) * 0.5, u > U("legs") ? 1 : 0, RED);
  }
  if (id === "s4") {
    words(["BEND YOUR", "KNEES"], GREEN, 400, 0.0, 1, 160, flash(u, U("bend")) * 0.6);
    const [kx, ky] = scr(student.world("kn", 0.1));
    ring(kx, ky, 64, sm(U("bend") - 0.05, U("knees") + 0.2, u) * (1 - sm(U("belly") - 0.1, U("belly"), u)), GREEN);
    const [mx, my] = scr(student.world("hip", 0.12).lerp(student.world("kn", 0.12), 0.45));
    ring(mx, my - 20, 90, sm(U("belly") - 0.05, U("rests") + 0.1, u), GREEN);
    tag("BELLY ON THIGHS", mx + 20, my + 190, GREEN, sm(U("belly") - 0.05, U("thighs") + 0.1, u), 42);
    backLine(0.0, GREEN, sm(U("rests"), U("thighs") + 0.2, u));
  }
  if (id === "s5") {
    words(["FOLD FROM", "THE HIPS"], GREEN, 400, 0.0, 1, 160, flash(u, U("hips")) * 0.6);
    const [hx, hy] = scr(student.world("hip", 0.12));
    ring(hx, hy, 70, sm(U("hips") - 0.1, U("hips") + 0.15, u) * (1 - sm(U("slowly"), U("slowly") + 0.2, u)), GREEN);
    backLine(0.0, GREEN, 1);
    tag("STRAIGHTEN SLOWLY", CX, 1180, GREEN, sm(U("slowly") - 0.1, U("straighten") + 0.1, u) * (1 - sm(U("a") - 0.1, U("a"), u)), 42);
    tag("JUST A LITTLE", CX, 1180, GREEN, sm(U("a") - 0.1, U("little") + 0.1, u), 46);
  }
  if (id === "s6") {
    words(["STOP AT THE", "LEG STRETCH"], GREEN, 400, 0.0, 1, 150, flash(u, U("stop")) * 0.6);
    hamLine(GREEN, sm(U("legs") - 0.2, U("stretch") + 0.1, u), u);
    const [kx, ky] = scr(student.world("hip", 0.1).lerp(student.world("kn", 0.1), 0.5));
    tag("FEEL IT HERE", kx - 60, ky + 200, GREEN, sm(U("legs") - 0.1, U("stretch") + 0.1, u), 42);
    backLine(0.0, GREEN, 1);
    tag("NOT IN YOUR BACK", CX, 640, RED, sm(U("not") - 0.05, U("back", 2) + 0.1, u), 42);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.5)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["BEND FIRST"], ORANGE, 600, 0.0, 1, 160, flash(u, 0.05));
    words(["STRAIGHTEN", "SLOWLY"], WHITE, 820, U("straighten") - 0.05, 1, 130, flash(u, U("slowly")) * 0.6);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.75)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    words(["TRY IT WITH"], WHITE, 560, 0.0, 1, 110);
    words([c2], YELLOW, 720, 0.25, 1, 160);
    words([c1 + " FREE"], WHITE, 900, U("download") - 0.05, 1, 110);
    if (BRAND.sub) tag(BRAND.sub, CX, 1060, GREEN, sm(U("download") + 0.2, U("app") + 0.1, u), 50);
  }
}

// the line of the back, drawn just outside the torso: a bulge (metres) bows it outward = rounded back; 0 = long flat back
function backSide() {
  const hip = student.world("hip"), sh = student.world("sh"), kn = student.world("kn");
  const d = sh.clone().sub(hip).normalize();
  let n = V(-d.y, d.x, 0);
  if (n.dot(kn.clone().sub(hip)) > 0) n.negate();           // point away from the legs = the back side
  return { hip, sh, n };
}
function backPeak(bulge) {
  const { hip, sh, n } = backSide();
  return scr(hip.clone().lerp(sh, 0.45).addScaledVector(n, 0.16 + bulge));
}
function backLine(bulge, color, a) {
  if (a <= 0) return;
  const { hip, sh, n } = backSide();
  const off = 0.16;
  const [ax, ay] = scr(hip.clone().addScaledVector(n, off)), [bx, by] = scr(sh.clone().addScaledVector(n, off));
  const [cx, cy] = scr(hip.clone().lerp(sh, 0.45).addScaledVector(n, off + bulge * 2));
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  for (const [lw, c] of [[22, INK], [12, color]]) { x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo(cx, cy, bx, by); x.stroke(); }
  x.restore();
}
// glowing line along the back of the thigh (hamstring), pulsing
function hamLine(color, a, u) {
  if (a <= 0) return;
  const hip = student.world("hip", 0.1), kn = student.world("kn", 0.1);
  const d = kn.clone().sub(hip).normalize();
  let n = V(-d.y, d.x, 0);
  if (n.x > 0) n.negate();                                    // back of the leg faces -x
  const [ax, ay] = scr(hip.clone().addScaledVector(n, 0.09)), [bx, by] = scr(kn.clone().addScaledVector(n, 0.07));
  x.save(); x.globalAlpha = a; x.lineCap = "round";
  x.shadowColor = color; x.shadowBlur = 30 + 15 * Math.sin(u * 8);
  for (const [lw, c] of [[24, INK], [14, color]]) { x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); }
  x.restore();
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["bend-knees-real"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
