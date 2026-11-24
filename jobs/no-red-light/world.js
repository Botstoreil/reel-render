// no-red-light (Hidden Cam 33): REALISTIC RENDER look, a hotel room at NIGHT (warm lamps, dark blue window).
// A USB charger in the wall socket by the desk faces the bed: no status light, only a lens.
// Screen text is a 2D overlay canvas. Time only from hf-seek. No CTA (s8 = share line).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const { S, W, LEAD } = window.__EV;
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
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };
const V = (a, b, c) => new THREE.Vector3(a, b, c);

// ---------- renderer ----------
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141c2b);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.03, 100);

const hemi = new THREE.HemisphereLight(0xffe9cc, 0x2a2018, 0.35); scene.add(hemi);
function lampLight(x, z) {
  const l = new THREE.PointLight(0xffb469, 9, 6, 1.5); l.position.set(x, 1.05, z); l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.002; scene.add(l); return l;
}
const lampL = lampLight(-0.75, -2.55), lampR = lampLight(2.05, -2.55);
const ceil = new THREE.PointLight(0xfff1dd, 6, 8, 1.4); ceil.position.set(0.4, 2.6, 0.2); scene.add(ceil);
const moon = new THREE.DirectionalLight(0x8fb0ff, 0.0); moon.position.set(-3, 3, -6); scene.add(moon);

// ---------- materials ----------
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const carpetTex = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = "#6b5a4c"; g.fillRect(0, 0, w, h);
  const r = rng(7); for (let i = 0; i < 26000; i++) { const v = 70 + r() * 60; g.fillStyle = `rgba(${v + 30},${v + 10},${v - 10},0.25)`; g.fillRect(r() * w, r() * h, 2, 2); }
  g.strokeStyle = "rgba(40,30,22,0.25)"; g.lineWidth = 3; for (let k = 0; k < w; k += 64) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + 64, h); g.stroke(); }
}, [5, 5]);
const wallTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#d8cbb8"; g.fillRect(0, 0, w, h);
  const r = rng(5); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(100,85,65,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 3, 3); }
  for (let x = 0; x < w; x += 32) { g.fillStyle = "rgba(120,100,80,0.05)"; g.fillRect(x, 0, 14, h); }
}, [5, 2]);
const M = {
  carpet: new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 1 }),
  wall: new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 }),
  walnut: new THREE.MeshStandardMaterial({ color: 0x5a3b26, roughness: 0.5 }),
  oak: new THREE.MeshStandardMaterial({ color: 0x9c7450, roughness: 0.55 }),
  linen: new THREE.MeshStandardMaterial({ color: 0xf3f0ea, roughness: 0.9 }),
  throw_: new THREE.MeshStandardMaterial({ color: 0x7a2f33, roughness: 0.95 }),
  head: new THREE.MeshStandardMaterial({ color: 0x3d4a57, roughness: 0.95 }),
  white: new THREE.MeshStandardMaterial({ color: 0xf1f1ee, roughness: 0.4 }),
  plastic: new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.3 }),
  black: new THREE.MeshStandardMaterial({ color: 0x0f1114, roughness: 0.25, metalness: 0.2 }),
  metal: new THREE.MeshStandardMaterial({ color: 0xb9a27a, roughness: 0.3, metalness: 0.85 }),
  curtain: new THREE.MeshStandardMaterial({ color: 0x8a7a63, roughness: 1, side: THREE.DoubleSide }),
  night: new THREE.MeshStandardMaterial({ color: 0x1b2a45, emissive: 0x24365a, emissiveIntensity: 0.6, roughness: 0.1 }),
  shade: new THREE.MeshStandardMaterial({ color: 0xf6e7c8, roughness: 0.9, side: THREE.DoubleSide, emissive: 0xffc27a, emissiveIntensity: 0.9 }),
  case_: new THREE.MeshStandardMaterial({ color: 0x2b2f36, roughness: 0.5 }),
};
const geoCache = {};
const rbg = (w, h, d, r) => { const k = [w, h, d, r].map((v) => v.toFixed(3)).join("|"); return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1))); };
function rb(w, h, d, mat, r = 0.03) { const m = new THREE.Mesh(rbg(w, h, d, r), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function put(o, x, y, z, parent = scene) { o.position.set(x, y, z); parent.add(o); return o; }

// ---------- the room: back wall z=-3, left wall x=-2.6, right wall x=3.2 ----------
const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), M.carpet); floor.rotation.x = -Math.PI / 2; floor.position.set(0.3, 0, 0.5); floor.receiveShadow = true; scene.add(floor);
put(rb(6.0, 2.8, 0.2, M.wall, 0.01), 0.3, 1.4, -3.1);
put(rb(0.2, 2.8, 7, M.wall, 0.01), -2.7, 1.4, 0.4);
put(rb(0.2, 2.8, 7, M.wall, 0.01), 3.3, 1.4, 0.4);
// window (night city blue) on the back wall left of the bed, with curtains that close in s5
put(rb(1.2, 1.5, 0.04, M.night, 0.01), -1.75, 1.55, -2.98);
put(rb(1.45, 0.06, 0.1, M.white, 0.01), -1.75, 2.33, -2.95);
const curtL = put(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.2, 8, 1), M.curtain), -2.35, 1.35, -2.9);
const curtR = put(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.2, 8, 1), M.curtain), -1.15, 1.35, -2.9);
[curtL, curtR].forEach((c) => { const p = c.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 28) * 0.03); c.geometry.computeVertexNormals(); c.castShadow = true; });
// bed (headboard on the back wall), throw at the foot
const bed = new THREE.Group();
put(rb(1.9, 0.32, 2.15, M.walnut, 0.03), 0, 0.18, 0, bed);
put(rb(1.85, 0.26, 2.1, M.linen, 0.08), 0, 0.46, 0, bed);
put(rb(1.9, 0.08, 1.45, M.linen, 0.04), 0, 0.62, 0.3, bed);
put(rb(1.94, 0.06, 0.55, M.throw_, 0.03), 0, 0.67, 0.72, bed);
put(rb(0.72, 0.16, 0.42, M.linen, 0.08), -0.44, 0.68, -0.78, bed);
put(rb(0.72, 0.16, 0.42, M.linen, 0.08), 0.44, 0.68, -0.78, bed);
put(rb(2.3, 1.2, 0.12, M.head, 0.05), 0, 0.75, -1.12, bed);
put(bed, 0.65, 0, -1.85);
function nightstand(x) {
  const g = new THREE.Group();
  put(rb(0.5, 0.52, 0.42, M.walnut, 0.02), 0, 0.26, 0, g);
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.07, 0.3, 16), M.metal), 0, 0.67, 0, g);
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.17, 0.22, 24, 1, true), M.shade), 0, 0.9, 0, g);
  return put(g, x, 0, -2.55);
}
nightstand(-0.75); nightstand(2.05);
// desk on the left wall with a chair, a hotel folder and a water bottle
const desk = new THREE.Group();
put(rb(0.6, 0.05, 1.3, M.oak, 0.01), 0, 0.75, 0, desk);
[[-0.25, -0.6], [0.25, -0.6], [-0.25, 0.6], [0.25, 0.6]].forEach(([x, z]) => put(rb(0.04, 0.73, 0.04, M.walnut, 0.005), x, 0.365, z, desk));
put(rb(0.24, 0.02, 0.32, M.case_, 0.005), 0.05, 0.785, 0.3, desk);
put(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.24, 16), new THREE.MeshStandardMaterial({ color: 0x9fc4dd, roughness: 0.05, transparent: true, opacity: 0.6 })), 0.05, 0.895, -0.35, desk);
put(desk, -2.27, 0, -0.1);
const chair = new THREE.Group();
put(rb(0.45, 0.06, 0.45, M.head, 0.03), 0, 0.46, 0, chair);
put(rb(0.06, 0.5, 0.45, M.head, 0.03), 0.22, 0.72, 0, chair);
[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([x, z]) => put(rb(0.03, 0.44, 0.03, M.metal, 0.005), x, 0.22, z, chair));
put(chair, -1.75, 0, 0.25).rotation.y = 0.25;
// wall socket on the left wall above the desk + the USB charger with a pinhole lens (no LED at all)
put(rb(0.03, 0.12, 0.2, M.white, 0.01), -2.585, 1.02, -0.45);
const charger = new THREE.Group();
put(rb(0.045, 0.052, 0.052, M.plastic, 0.008), 0, 0, 0, charger);
const lensMat = new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.05, metalness: 0.6 });
const lens = new THREE.Mesh(new THREE.CircleGeometry(0.0035, 16), lensMat); lens.rotation.y = Math.PI / 2; put(lens, 0.0232, 0.008, 0, charger);
put(rb(0.004, 0.006, 0.016, M.black, 0.001), 0.0232, -0.012, 0, charger); // USB port slot
put(charger, -2.545, 1.02, -0.4);
charger.rotation.y = -0.35;
const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-2.52, 1.0, -0.4), V(-2.45, 0.86, -0.35), V(-2.3, 0.78, -0.25)]), 20, 0.004, 6), M.white); scene.add(cable);
// TV on the wall facing the bed (front wall is behind the camera, so a wall-mounted TV sits on the right wall)
put(rb(0.06, 0.62, 1.05, M.black, 0.01), 3.17, 1.35, -0.6);

// ---------- phone with torch ----------
const phone = new THREE.Group();
put(rb(0.075, 0.155, 0.009, M.case_, 0.01), 0, 0, 0, phone);
const led = new THREE.Mesh(new THREE.CircleGeometry(0.006, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4 })); led.position.set(0.02, 0.06, -0.005); led.rotation.y = Math.PI; phone.add(led);
const torch = new THREE.SpotLight(0xfff4e0, 0, 8, 0.3, 0.5, 1.2); torch.castShadow = true; torch.shadow.mapSize.set(1024, 1024);
torch.position.set(0.02, 0.06, -0.02); phone.add(torch); scene.add(torch.target);
phone.visible = false; scene.add(phone);

// ---------- view cone (the lens sees the bed) ----------
const coneM = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
coneM.renderOrder = 5; scene.add(coneM);
const UP = V(0, 1, 0), DIR = V(0, 0, 0);
function coneSet(A, B, r0, r1, a) {
  coneM.visible = a > 0.01; if (!coneM.visible) return;
  coneM.geometry.dispose(); coneM.geometry = new THREE.CylinderGeometry(r1, r0, 1, 32, 1, true);
  DIR.copy(B).sub(A); const L = DIR.length();
  coneM.position.copy(A).addScaledVector(DIR, 0.5); coneM.scale.set(1, L, 1); coneM.quaternion.setFromUnitVectors(UP, DIR.normalize());
  coneM.material.opacity = a;
}

// ---------- camera shots ----------
const LENS = () => charger.localToWorld(V(0.0232, 0.008, 0));
const SH = {
  s1: { from: V(2.5, 2.0, 2.9), to: V(-0.7, 0.85, -1.3), push: 0.1 },
  s2: { from: V(1.6, 1.62, 1.1), to: V(-2.3, 1.0, -0.4), push: 0.12 },
  s3: { from: V(-1.85, 1.12, 0.35), to: V(-2.54, 1.02, -0.4), push: 0.15 },
  s4: { from: V(-2.15, 1.06, 0.05), to: V(-2.54, 1.02, -0.4), push: 0.3 },
  s5: { from: V(2.3, 1.85, 2.7), to: V(-1.0, 0.9, -1.3), push: 0.06 },
  s6: { from: V(1.4, 1.35, 0.2), to: V(-2.1, 0.95, -0.7), push: 0.1 },
  s7: { from: V(2.5, 2.0, 2.9), to: V(-0.7, 0.85, -1.3), push: 0.04 },
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
  // defaults: lamps on, curtains open, no torch, no cone
  lampL.intensity = lampR.intensity = 9; ceil.intensity = 6; hemi.intensity = 0.35; scene.environmentIntensity = 0.45; moon.intensity = 0;
  M.shade.emissiveIntensity = 0.9; M.night.emissiveIntensity = 0.6;
  curtL.position.x = -2.35; curtR.position.x = -1.15;
  phone.visible = false; torch.intensity = 0; lensMat.emissiveIntensity = 0;
  coneSet(V(0, 0, 0), V(0, 1, 0), 0, 0, 0);

  const dark = id === "s5" || id === "s6" || id === "s7" || id === "s8";
  if (dark) {
    const k = id === "s5" ? sm(U("lights") - 0.1, U("lights") + 0.25, u) : 1;
    lampL.intensity = lampR.intensity = 9 * (1 - k); ceil.intensity = 6 * (1 - k);
    M.shade.emissiveIntensity = 0.9 * (1 - k) + 0.02;
    hemi.intensity = 0.35 - 0.3 * k; scene.environmentIntensity = 0.45 - 0.38 * k; moon.intensity = 0.25 * k;
    const c = id === "s5" ? sm(U("curtains") - 0.2, U("curtains") + 0.5, u) : 1;
    curtL.position.x = -2.35 + 0.3 * c; curtR.position.x = -1.15 - 0.3 * c; M.night.emissiveIntensity = 0.6 * (1 - 0.8 * c);
  }
  if (id === "s5" || id === "s6") {
    phone.visible = true; torch.intensity = 45 * (id === "s5" ? sm(U("sweep") - 0.2, U("sweep"), u) : 1);
    let aim;
    if (id === "s5") {
      const a = sm(U("sweep"), U("slowly") + 0.4, u);
      const P = [V(2.0, 0.7, -2.6), V(0.6, 0.7, -2.2), V(-1.4, 0.9, -1.2), V(-2.45, 1.0, -0.4)];
      const f = a * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f));
      aim = P[i].clone().lerp(P[i + 1], sm(0, 1, f - i));
      phone.position.set(1.3, 1.3, 1.2);
      lensMat.emissiveIntensity = 5 * sm(U("slowly"), U("slowly") + 0.3, u);
    } else {
      aim = V(-2.2, 1.0, -0.2).lerp(LENS(), sm(0, U("glint") + 0.1, u));
      phone.position.set(1.05, 1.32, 0.45);
      lensMat.emissiveIntensity = 7 * sm(U("glint") - 0.15, U("glint"), u) * (0.75 + 0.25 * Math.sin(u * 18)) + 2;
      const cA = sm(U("faces") - 0.1, U("bed") + 0.2, u);
      coneSet(LENS(), V(0.65, 0.65, -1.9), 0.01, 0.9, 0.2 * cA);
    }
    phone.lookAt(aim); phone.rotateY(Math.PI);
    torch.target.position.copy(aim); torch.target.updateMatrixWorld();
  }
  if (id === "s7" || id === "s8") lensMat.emissiveIntensity = 3;
  renderer.render(scene, camera);

  // ---------- text ----------
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920); curU = u;
  if (id === "s1") {
    words(["NO RED LIGHT", "DOESN'T MEAN", "NO CAMERA"], RED, 470, 0.0, 1, 140, flash(u, U("camera")));
    tag("SOUNDS WRONG. IT'S TRUE.", CX, 1110, "#e0262e", sm(U("sounds") - 0.05, U("sounds") + 0.25, u), 44);
  }
  if (id === "s2") {
    words(["BLINKING LIGHT?"], WHITE, 420, 0.0, 1, 130);
    tag("NONE", CX - 150, 640, GREEN, sm(U("none") - 0.1, U("none") + 0.2, u), 54);
    tag("SAFE...?", CX + 150, 640, ORANGE, sm(U("relax") - 0.1, U("relax") + 0.2, u), 54);
  }
  if (id === "s3") {
    words(["NO STATUS LIGHT"], RED, 400, 0.0, 1, 130, flash(u, U("status")) * 0.6);
    words(["OR SWITCHED OFF"], WHITE, 560, U("switched") - 0.1, 1, 110, flash(u, U("switched")) * 0.6);
    const [cx, cy] = scr(charger.localToWorld(V(0.03, 0.05, 0)));
    tag("STILL RECORDING", cx, cy - 200, RED, sm(U("but") - 0.1, U("but") + 0.3, u), 40);
  }
  if (id === "s4") {
    const [lx, ly] = scr(LENS());
    words(["LOOK FOR THE LENS"], GREEN, 400, 0.0, 1, 130, flash(u, U("lens")) * 0.6);
    ring(lx, ly, 70, sm(U("lens") - 0.05, U("lens") + 0.15, u), GREEN);
    words(["NOT THE LIGHT"], RED, 1450, U("not") - 0.1, 1, 110, flash(u, U("light")) * 0.6);
  }
  if (id === "s5") {
    words(["LIGHTS OFF", "TORCH ON"], GREEN, 430, 0.0, 1, 140, flash(u, U("torch")) * 0.6);
    tag("SWEEP SLOWLY", CX, 1110, GREEN, sm(U("slowly") - 0.1, U("slowly") + 0.2, u), 46);
  }
  if (id === "s6") {
    const [lx, ly] = scr(LENS());
    words(["A SMALL", "BRIGHT GLINT"], YELLOW, 420, 0.0, 1, 140, flash(u, U("glint")) * 0.6);
    ring(lx, ly, 60, sm(U("glint") - 0.05, U("glint") + 0.15, u), RED);
    tag("FACES THE BED?", CX, 1110, RED, sm(U("faces") - 0.1, U("faces") + 0.2, u), 46);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.45)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["NO LIGHT", "IS NOT PROOF"], ORANGE, 520, 0.0, 1, 140, flash(u, 0.05));
    words(["FIND THE LENS"], GREEN, 820, U("find") - 0.1, 1, 120, flash(u, U("lens")) * 0.6);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SEND THIS TO"], WHITE, 680, 0.05, 1, 120);
    words(["THE FRIEND WHO", "TRAVELS THE MOST"], YELLOW, 880, U("friend") - 0.1, 1, 130, flash(u, U("travels")) * 0.5);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["no-red-light-real"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
