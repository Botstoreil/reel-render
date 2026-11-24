// no-wifi (Hidden Cam 34): REALISTIC RENDER look, a Scandinavian rental bedroom at GOLDEN HOUR (low warm sun, long
// shadows, pale oak, sage bedding). Bed on the left wall; across the room on the right wall a dresser with the router,
// an alarm clock and a USB charger in the socket, and a smoke detector high on the wall: all of them face the bed.
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
scene.background = new THREE.Color(0xe8c9a0);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.03, 100);

const hemi = new THREE.HemisphereLight(0xffe4c4, 0x6b5038, 0.5); scene.add(hemi);
// low golden sun from the window side (front-left), long shadows across the floor and the right wall
const sun = new THREE.DirectionalLight(0xffb36b, 2.6);
sun.position.set(-6, 3.2, 3.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 0.5, far: 30 });
sun.shadow.bias = -0.0005; sun.shadow.radius = 4; scene.add(sun);
sun.target.position.set(1.5, 0.6, -1); scene.add(sun.target);
const fill = new THREE.PointLight(0xfff0de, 2.5, 7, 1.5); fill.position.set(0, 2.5, 0.5); scene.add(fill);

// ---------- materials ----------
function canvasTex(w, h, draw, rep = [1, 1]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 8; return t;
}
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const oakTex = canvasTex(1024, 1024, (g, w, h) => {
  const r = rng(17); const rows = 7;
  for (let i = 0; i < rows; i++) {
    let x0 = -r() * 500;
    while (x0 < w) {
      const L = 420 + r() * 420, tone = 200 + r() * 25;
      g.fillStyle = `rgb(${tone + 12},${tone - 8},${tone - 38})`; g.fillRect(x0, i * h / rows, L, h / rows);
      for (let k = 0; k < 10; k++) { g.strokeStyle = `rgba(130,95,60,${0.04 + r() * 0.06})`; g.lineWidth = 1 + r() * 2; const y = i * h / rows + r() * h / rows; g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + L / 3, y + 4 - r() * 8, x0 + 2 * L / 3, y + 4 - r() * 8, x0 + L, y); g.stroke(); }
      g.fillStyle = "rgba(90,60,30,0.3)"; g.fillRect(x0, i * h / rows, 2, h / rows);
      x0 += L;
    }
    g.fillStyle = "rgba(90,60,30,0.3)"; g.fillRect(0, i * h / rows, w, 2);
  }
}, [2.5, 2.5]);
const wallTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#f3efe8"; g.fillRect(0, 0, w, h);
  const r = rng(5); for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,110,95,${r() * 0.045})`; g.fillRect(r() * w, r() * h, 3, 3); }
}, [4, 2]);
const knitTex = canvasTex(256, 256, (g, w, h) => {
  g.fillStyle = "#e9e2d4"; g.fillRect(0, 0, w, h);
  g.strokeStyle = "rgba(150,135,110,0.35)"; g.lineWidth = 3;
  for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 8, y + 12); g.lineTo(x + 16, y); g.stroke(); }
}, [3, 3]);
const std = (o) => new THREE.MeshStandardMaterial(o);
const M = {
  floor: std({ map: oakTex, roughness: 0.45 }),
  wall: std({ map: wallTex, roughness: 0.92 }),
  oak: std({ color: 0xcaa57a, roughness: 0.55 }),
  white: std({ color: 0xf4f3ef, roughness: 0.35 }),
  plastic: std({ color: 0xf6f6f3, roughness: 0.3 }),
  linen: std({ color: 0xf2efe8, roughness: 0.9 }),
  sage: std({ color: 0x9bab8c, roughness: 0.95 }),
  knit: std({ map: knitTex, roughness: 1 }),
  black: std({ color: 0x15171b, roughness: 0.3, metalness: 0.2 }),
  graphite: std({ color: 0x2b2f36, roughness: 0.45 }),
  metal: std({ color: 0xbfc3c8, roughness: 0.3, metalness: 0.8 }),
  sky: std({ color: 0xffc98a, emissive: 0xffb877, emissiveIntensity: 0.9, roughness: 0.1 }),
  leaf: std({ color: 0x4f7d45, roughness: 0.7 }),
  pot: std({ color: 0xe2d6c3, roughness: 0.85 }),
  pcb: std({ color: 0x1f6b3a, roughness: 0.5 }),
};
const geoCache = {};
const rbg = (w, h, d, r) => { const k = [w, h, d, r].map((v) => v.toFixed(3)).join("|"); return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.1, h / 2.1, d / 2.1))); };
function rb(w, h, d, mat, r = 0.03) { const m = new THREE.Mesh(rbg(w, h, d, r), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function put(o, x, y, z, parent = scene) { o.position.set(x, y, z); parent.add(o); return o; }

// ---------- the room: back wall z=-3, left wall x=-2.7, right wall x=2.7 ----------
const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), M.floor); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, 0.5); floor.receiveShadow = true; scene.add(floor);
put(rb(5.8, 2.9, 0.2, M.wall, 0.01), 0, 1.45, -3.1);
put(rb(0.2, 2.9, 7, M.wall, 0.01), -2.8, 1.45, 0.4);
put(rb(0.2, 2.9, 7, M.wall, 0.01), 2.8, 1.45, 0.4);
// window on the back wall with the evening sky
put(rb(1.5, 1.6, 0.04, M.sky, 0.01), -0.7, 1.6, -2.98);
[[-0.7, 2.43, 1.62, 0.07], [-0.7, 0.77, 1.62, 0.07]].forEach(([x, y, w, h]) => put(rb(w, h, 0.1, M.white, 0.01), x, y, -2.95));
[-1.48, 0.08, -0.7].forEach((x) => put(rb(0.06, 1.7, 0.1, M.white, 0.01), x, 1.6, -2.95));
// bed: headboard on the left wall, the foot toward the middle of the room
const bed = new THREE.Group();
put(rb(2.1, 0.3, 1.7, M.oak, 0.03), 0, 0.17, 0, bed);
put(rb(2.05, 0.24, 1.65, M.linen, 0.08), 0, 0.43, 0, bed);
put(rb(1.45, 0.08, 1.72, M.sage, 0.04), 0.3, 0.58, 0, bed);
put(rb(0.5, 0.06, 1.75, M.knit, 0.03), 0.8, 0.63, 0, bed);
put(rb(0.4, 0.15, 0.62, M.linen, 0.08), -0.78, 0.63, -0.38, bed);
put(rb(0.4, 0.15, 0.62, M.linen, 0.08), -0.78, 0.63, 0.38, bed);
put(rb(0.1, 1.0, 1.8, M.oak, 0.04), -1.07, 0.6, 0, bed);
put(bed, -1.62, 0, -1.0);
put(rb(0.42, 0.5, 0.4, M.oak, 0.02), -2.35, 0.25, -2.25);   // bedside table
function plant(x, z, s = 1, seed = 1) {
  const g = new THREE.Group();
  put(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.38, 24), M.pot), 0, 0.19, 0, g).castShadow = true;
  const r = rng(seed);
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.17 + r() * 0.1, 16, 12), M.leaf); l.scale.set(1, 1.6, 0.45); l.rotation.set(r() - 0.5, r() * 6, r() - 0.5); put(l, (r() - 0.5) * 0.4, 0.6 + r() * 0.55, (r() - 0.5) * 0.4, g).castShadow = true; }
  g.scale.setScalar(s); put(g, x, 0, z); return g;
}
plant(0.6, -2.6, 1.0, 4);
// dresser against the right wall (faces -x, toward the bed)
const DX = 2.42;
put(rb(0.5, 0.85, 1.4, M.oak, 0.02), DX, 0.425, -1.0);
[0.25, 0.6].forEach((y) => [-1.35, -0.65].forEach((z) => { put(rb(0.02, 0.3, 0.64, M.oak, 0.01), DX - 0.255, y, z); put(rb(0.03, 0.02, 0.12, M.metal, 0.005), DX - 0.27, y + 0.08, z); }));
// router (left on the dresser): body, two antennas, four LEDs, power cable down to the wall socket
const router = new THREE.Group();
put(rb(0.16, 0.04, 0.26, M.graphite, 0.012), 0, 0.02, 0, router);
[-0.08, 0.08].forEach((z) => { const a = put(rb(0.015, 0.17, 0.015, M.graphite, 0.006), 0.06, 0.12, z, router); a.rotation.z = -0.12; });
const ledMat = std({ color: 0x0a2a12, emissive: 0x29ff6a, emissiveIntensity: 2.2 });
const leds = [-0.075, -0.035, 0.005, 0.045].map((z) => put(new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.018), ledMat), -0.081, 0.025, z, router));
put(router, DX - 0.02, 0.85, -1.45);
// wall socket low on the right wall at the dresser's back end, and the router's plug
put(rb(0.03, 0.12, 0.12, M.white, 0.01), 2.69, 0.35, -1.88);
const plug = put(rb(0.05, 0.06, 0.05, M.graphite, 0.01), 2.65, 0.35, -1.88);
const cableCurve = (px) => new THREE.CatmullRomCurve3([V(DX + 0.05, 0.87, -1.55), V(DX + 0.2, 0.86, -1.7), V(2.64, 0.6, -1.82), V(px, 0.36, -1.88)]);
const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve(2.62), 24, 0.005, 6), M.black); scene.add(cable);
// alarm clock (right on the dresser): base + top shell that lifts to show the camera board and the memory card
const clock = new THREE.Group();
put(rb(0.12, 0.05, 0.24, M.white, 0.012), 0, 0.025, 0, clock);
const shell = put(new THREE.Group(), 0, 0.05, 0, clock);
put(rb(0.12, 0.06, 0.24, M.white, 0.012), 0, 0.03, 0, shell);
const digits = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.04), std({ color: 0x1a0800, emissive: 0xff8a2a, emissiveIntensity: 1.4 })); digits.rotation.y = -Math.PI / 2; put(digits, -0.061, 0.03, 0.01, shell);
const lensMat = std({ color: 0x050505, emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.05, metalness: 0.6 });
const lens = new THREE.Mesh(new THREE.CircleGeometry(0.0045, 16), lensMat); lens.rotation.y = -Math.PI / 2; put(lens, -0.0612, 0.03, -0.095, shell);
const board = put(rb(0.09, 0.006, 0.19, M.pcb, 0.002), 0, 0.055, 0, clock);
put(rb(0.02, 0.02, 0.02, M.black, 0.004), -0.03, 0.068, -0.085, clock);       // camera module behind the lens
const cardMat = std({ color: 0x1d3f8a, emissive: 0xff3b3b, emissiveIntensity: 0 });
const card = put(rb(0.03, 0.004, 0.04, cardMat, 0.002), 0.01, 0.062, 0.05, clock); // the memory card
const recMat = std({ color: 0x220000, emissive: 0xff2020, emissiveIntensity: 0 });
put(new THREE.Mesh(new THREE.SphereGeometry(0.004, 10, 8), recMat), 0.03, 0.062, -0.02, clock);
put(clock, DX - 0.05, 0.85, -0.62);
// USB charger in a second socket on the right wall, above the dresser end, facing the bed
put(rb(0.03, 0.12, 0.12, M.white, 0.01), 2.69, 1.08, -0.12);
const charger = new THREE.Group();
put(rb(0.052, 0.05, 0.05, M.plastic, 0.008), 0, 0, 0, charger);
put(new THREE.Mesh(new THREE.CircleGeometry(0.003, 12), lensMat.clone()), -0.0265, 0.008, 0, charger).rotation.y = -Math.PI / 2;
put(charger, 2.65, 1.08, -0.12);
// smoke detector high on the right wall
const smoke = new THREE.Group();
const sd = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.04, 32), M.plastic); sd.rotation.z = Math.PI / 2; sd.castShadow = true; smoke.add(sd);
const sdr = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.004, 8, 32), M.white); sdr.rotation.y = Math.PI / 2; sdr.position.x = -0.021; smoke.add(sdr);
put(smoke, 2.68, 2.3, -1.0);
// a framed print above the dresser for scale
put(rb(0.03, 0.5, 0.38, M.oak, 0.01), 2.69, 1.6, -1.55);
put(rb(0.01, 0.42, 0.3, std({ color: 0xd9a27a, roughness: 0.9 }), 0.005), 2.67, 1.6, -1.55);

// ---------- phone with torch ----------
const phone = new THREE.Group();
put(rb(0.075, 0.155, 0.009, M.graphite, 0.01), 0, 0, 0, phone);
const led = new THREE.Mesh(new THREE.CircleGeometry(0.006, 12), std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 4 })); led.position.set(0.02, 0.06, -0.005); led.rotation.y = Math.PI; phone.add(led);
const torch = new THREE.SpotLight(0xfff4e0, 0, 8, 0.28, 0.5, 1.2); torch.castShadow = true; torch.shadow.mapSize.set(1024, 1024);
torch.position.set(0.02, 0.06, -0.02); phone.add(torch); scene.add(torch.target);
phone.visible = false; scene.add(phone);

// ---------- view cone (the clock lens sees the bed) ----------
const coneM = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
coneM.renderOrder = 5; scene.add(coneM);
const UPV = V(0, 1, 0), DIR = V(0, 0, 0);
function coneSet(A, B, r0, r1, a) {
  coneM.visible = a > 0.01; if (!coneM.visible) return;
  coneM.geometry.dispose(); coneM.geometry = new THREE.CylinderGeometry(r1, r0, 1, 32, 1, true);
  DIR.copy(B).sub(A); const L = DIR.length();
  coneM.position.copy(A).addScaledVector(DIR, 0.5); coneM.scale.set(1, L, 1); coneM.quaternion.setFromUnitVectors(UPV, DIR.normalize());
  coneM.material.opacity = a;
}

// ---------- camera shots ----------
const W_ = (o, v = V(0, 0, 0)) => { o.updateMatrixWorld(); return o.localToWorld(v.clone()); };
const LENS = () => W_(shell, V(-0.0612, 0.03, -0.095));
const P_ROUTER = V(DX - 0.02, 0.9, -1.45), P_CLOCK = V(DX - 0.05, 0.9, -0.62), P_CHG = V(2.65, 1.08, -0.12), P_SMOKE = V(2.68, 2.3, -1.0);
const SH = {
  s1: { from: V(-1.5, 1.45, 0.7), to: V(2.2, 1.2, -0.95), push: 0.1 },        // from the bed, across to the dresser
  s2: { from: V(1.15, 1.18, -0.75), to: V(2.4, 0.72, -1.62), push: 0.14 },    // router + socket
  s3: { from: V(1.62, 1.12, -0.25), to: V(2.37, 0.9, -0.64), push: 0.18 },    // the clock, close
  s4: { from: V(0.2, 1.4, 0.6), to: V(2.35, 0.95, -1.05), push: 0.1 },        // router and clock together
  s5: { from: V(0.15, 1.45, 0.75), to: V(2.4, 1.3, -0.7), push: 0.05 },       // pans (aim set per frame)
  s6: { from: V(0.3, 1.35, 0.55), to: V(2.4, 1.1, -0.6), push: 0.08 },
  s7: { from: V(-1.5, 1.45, 0.7), to: V(2.2, 1.2, -0.95), push: 0.04 },
};
SH.s8 = SH.s7;
function shoot(id, k, aim = null) {
  const s = SH[id], to = aim || s.to;
  camera.position.lerpVectors(s.from, to, s.push * sm(0, 1, k));
  camera.lookAt(to); camera.updateMatrixWorld();
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
// wifi symbol with a slash (drawn, not 3D)
function wifiOff(X, Y, s, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  for (const [lw, c] of [[30, INK], [16, WHITE]]) {
    x.strokeStyle = c; x.lineWidth = lw;
    [70, 45, 20].forEach((r) => { x.beginPath(); x.arc(0, 30, r, -Math.PI * 0.78, -Math.PI * 0.22); x.stroke(); });
    x.fillStyle = c; x.beginPath(); x.arc(0, 30, lw / 2 + 2, 0, Math.PI * 2); x.fill();
  }
  x.strokeStyle = INK; x.lineWidth = 30; x.beginPath(); x.moveTo(-70, -50); x.lineTo(70, 60); x.stroke();
  x.strokeStyle = RED; x.lineWidth = 16; x.stroke();
  x.restore();
}

// ---------- one frame ----------
const BED = V(-1.4, 0.75, -1.0);
function frame(t) {
  const { id, u, d } = sceneOf(t);
  const U = (w, n) => at(id, w, n);
  const k = cl(u / Math.max(0.5, d));
  // defaults
  sun.intensity = 2.6; hemi.intensity = 0.5; fill.intensity = 2.5; scene.environmentIntensity = 1;
  phone.visible = false; torch.intensity = 0; lensMat.emissiveIntensity = 0; cardMat.emissiveIntensity = 0; recMat.emissiveIntensity = 0;
  shell.position.set(0, 0.05, 0); shell.rotation.set(0, 0, 0);
  coneSet(V(0, 0, 0), V(0, 1, 0), 0, 0, 0);
  // router power: on in s1 and in s2 until "unplug"; off from then on
  let pulled = 0;
  if (id === "s2") pulled = sm(U("unplug") - 0.05, U("router"), u);
  else if (id !== "s1") pulled = 1;
  const ledOn = id === "s1" ? 1 : id === "s2" ? 1 - sm(U("unplug") + 0.1, U("unplug") + 0.2, u) : 0;
  ledMat.emissiveIntensity = 2.2 * ledOn * (id === "s1" ? 0.85 + 0.15 * Math.sin(u * 20) : 1);
  plug.position.set(2.65 - 0.22 * pulled, 0.35 - 0.2 * pulled * pulled, -1.88 + 0.05 * pulled);
  cable.geometry.dispose(); cable.geometry = new THREE.TubeGeometry(cableCurve(plug.position.x - 0.03), 24, 0.005, 6);

  let aim = null;
  if (id === "s3") {
    // the top shell lifts and tilts away: camera board and the glowing memory card inside
    const o = sm(U("record") - 0.3, U("record") + 0.15, u);
    shell.position.set(0.02 * o, 0.05 + 0.1 * o, 0.06 * o); shell.rotation.x = -0.35 * o;
    cardMat.emissiveIntensity = 1.6 * sm(U("memory") - 0.1, U("memory") + 0.1, u);
    recMat.emissiveIntensity = 3 * (Math.sin(u * 8) > 0 ? 1 : 0.15) * sm(U("record") - 0.1, U("record"), u);
    coneSet(LENS(), BED, 0.01, 0.75, 0.18 * sm(U("hidden") - 0.1, U("cameras"), u));
  }
  if (id === "s5") {
    // pan: charger -> clock -> smoke detector, each landing on its word
    const a1 = sm(U("clocks") - 0.25, U("clocks"), u), a2 = sm(U("smoke") - 0.25, U("smoke"), u), a3 = sm(U("face") - 0.25, U("bed"), u);
    aim = P_CHG.clone().lerp(P_CLOCK, a1).lerp(P_SMOKE, a2).lerp(V(2.4, 1.4, -0.8), a3);
  }
  if (id === "s6") {
    // the room goes dim, the phone torch checks charger, clock, smoke detector; the clock lens throws a glint
    const dim = sm(0, 0.3, u);
    sun.intensity = 2.6 - 2.35 * dim; hemi.intensity = 0.5 - 0.42 * dim; fill.intensity = 2.5 * (1 - dim); scene.environmentIntensity = 1 - 0.82 * dim;
    phone.visible = true; torch.intensity = 55 * sm(U("torch") - 0.25, U("torch"), u);
    const b1 = sm(U("each") - 0.1, U("one") + 0.1, u), b2 = sm(U("watch") - 0.2, U("watch") + 0.15, u);
    const tgt = P_CHG.clone().lerp(P_SMOKE, b1).lerp(P_CLOCK, b2);
    phone.position.set(0.85, 1.25, -0.25); phone.lookAt(tgt); phone.rotateY(Math.PI);
    torch.target.position.copy(tgt); torch.target.updateMatrixWorld();
    lensMat.emissiveIntensity = 7 * sm(U("small") - 0.15, U("glint"), u) * (0.75 + 0.25 * Math.sin(u * 18));
    aim = V(2.45, 1.25, -0.6).lerp(V(2.4, 0.95, -0.62), b2);
  }
  shoot(id, k, aim);
  renderer.render(scene, camera);

  // ---------- text ----------
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920); curU = u;
  if (id === "s1") {
    const [rx, ry] = scr(P_ROUTER);
    words(["WI-FI OFF", "DOESN'T STOP IT"], RED, 430, 0.0, 1, 150, flash(u, U("wi-fi")) + flash(u, U("stop")) * 0.6);
    wifiOff(rx, ry - 150, 0.9 * back(U("wi-fi") - 0.1, U("wi-fi") + 0.25, u), sm(U("wi-fi") - 0.1, U("wi-fi"), u) * (1 - sm(U("hidden") - 0.1, U("hidden") + 0.1, u)));
    const [cx, cy] = scr(P_CLOCK);
    ring(cx, cy, 70, sm(U("camera") - 0.1, U("camera") + 0.15, u), RED);
    tag("SOUNDS WRONG. IT'S TRUE.", CX, 1250, "#e0262e", sm(U("sounds") - 0.05, U("sounds") + 0.25, u), 42);
  }
  if (id === "s2") {
    words(["UNPLUG", "THE ROUTER?"], RED, 420, 0.0, 1, 150, flash(u, U("unplug")) * 0.6);
    const [px, py] = scr(plug.position);
    ring(px, py, 60, sm(U("unplug") - 0.1, U("unplug") + 0.1, u) * (1 - sm(U("think") - 0.1, U("think"), u)), RED);
    tag("FEELS SAFE", CX, 1250, RED, sm(U("think") - 0.05, U("safe"), u), 46);
  }
  if (id === "s3") {
    words(["RECORDS TO A", "MEMORY CARD"], RED, 420, U("record") - 0.15, 1, 150, flash(u, U("memory")) * 0.6);
    const [mx, my] = scr(W_(card));
    ring(mx, my, 62, sm(U("memory") - 0.05, U("card") + 0.1, u), RED);
    tag("MEMORY CARD INSIDE", mx, my + 190, RED, sm(U("card") - 0.05, U("inside") + 0.1, u) * (1 - sm(U("no") - 0.05, U("no") + 0.1, u)), 42);
    tag("NO WI-FI NEEDED", mx, my + 190, RED, sm(U("no") - 0.05, U("needed"), u), 44);
  }
  if (id === "s4") {
    words(["FIND THE CAMERA", "NOT THE NETWORK"], GREEN, 430, 0.0, 1, 130, flash(u, U("camera")) * 0.6);
    const [cx, cy] = scr(P_CLOCK);
    ring(cx, cy, 70, sm(U("camera") - 0.1, U("camera") + 0.15, u), GREEN);
    const [rx, ry] = scr(P_ROUTER);
    stamp("x", rx, ry, back(U("network") - 0.1, U("network") + 0.2, u) * 0.5, u > U("network") - 0.1 ? 1 : 0, RED);
  }
  if (id === "s5") {
    words(["CHECK WHAT", "FACES THE BED"], GREEN, 420, 0.0, 1, 140, flash(u, U("face")) * 0.6);
    [[P_CHG, "chargers", "CHARGER"], [P_CLOCK, "clocks", "CLOCK"], [P_SMOKE, "smoke", "SMOKE DETECTOR"]].forEach(([p, w, label]) => {
      const [sx, sy] = scr(p); const a = sm(U(w) - 0.1, U(w) + 0.1, u);
      if (sy < 250 || sy > 1450 || sx < 40 || sx > 1040) return;
      ring(sx, sy, 62, a, GREEN);
      tag(label, sx, sy + 120, GREEN, a, 40);
    });
  }
  if (id === "s6") {
    words(["TORCH ON", "EACH ONE"], GREEN, 420, 0.0, 1, 150, flash(u, U("torch")) * 0.6);
    const [lx, ly] = scr(LENS());
    ring(lx, ly, 55, sm(U("glint") - 0.1, U("glint") + 0.1, u), RED);
    tag("A SMALL GLINT = A LENS", CX, 1250, GREEN, sm(U("small") - 0.1, U("glint") + 0.15, u), 42);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(10,14,22,0.5)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["NO WI-FI", "IS NOT SAFE"], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05) + flash(u, U("safe")) * 0.6);
    words(["FIND THE LENS"], WHITE, 820, U("find") - 0.05, 1, 120, flash(u, U("lens")) * 0.6);
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
window.__hf.buildReady["no-wifi-real"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
