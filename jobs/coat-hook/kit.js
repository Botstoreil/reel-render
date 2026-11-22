// Shared reel kit (bike/rider/car/truck/road/text/camera) lifted from didnt-see-you + target-fixation.
// Time comes only from hf-seek / __hfThreeTime. Each reel's world.js imports this and adds its story.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
export { THREE };

export const { S, W, LEAD, BRAND = {} } = window.__EV;
export const IDS = Object.keys(S);
export const at = (id, word, n = 1) => {
  const hits = W[id].words.filter((w) => w.text.toLowerCase().replace(/[^a-z0-9']/g, "").startsWith(word.toLowerCase().replace(/[^a-z0-9']/g, "")));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
export const g = (id, word, n) => S[id][0] + LEAD + at(id, word, n); // global time of a word
export const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const clamp = THREE.MathUtils.clamp;
export const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
export const pulse = (u, a, b) => sm(a, a + 0.15, u) * (1 - sm(b, b + 0.25, u)); // on at a, off at b

// ---------- renderer ----------
const canvas = document.getElementById("world");
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
export const scene = new THREE.Scene();
const BG = 0x080622;
scene.background = new THREE.Color(BG);
scene.fog = new THREE.FogExp2(BG, 0.03);
export const camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.05, 600);
scene.add(camera);
scene.add(new THREE.HemisphereLight(0x8f7dff, 0x0a0820, 2.2));
const key = new THREE.DirectionalLight(0xd6ceff, 2.6); key.position.set(4, 8, -6); scene.add(key);
const fill = new THREE.DirectionalLight(0xb8aaff, 1.4); fill.position.set(-3, 5, 8); scene.add(fill);
export const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
export const bloom = new UnrealBloomPass(new THREE.Vector2(1080, 1920), 1.0, 0.55, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// glow = unlit, untonemapped, pushed above 1 so only it blooms
export const glow = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });
export const VIOLET = 0xa596ff, ORANGE = 0xff6a1a, RED = 0xff2a3a, GREEN = 0x3dff8a, WHITE = 0xffffff;
export const mFrame = glow(VIOLET, 1.5), mWheel = glow(VIOLET, 2.2), mHot = glow(ORANGE, 2.4);
export const mSolid = new THREE.MeshStandardMaterial({ color: 0x3a33a0, emissive: 0x1f1a5e, roughness: 0.55, metalness: 0.2 });
export const mEdge = new THREE.LineBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false });

export function box(w, h, d, x, y, z, mat = mSolid, edges = true) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (edges) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), mEdge));
  return m;
}
export function tube(a, b, r, mat) { // thin box from point a to point b
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const m = new THREE.Mesh(new THREE.BoxGeometry(r, r, A.distanceTo(B)), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5);
  m.lookAt(B);
  return m;
}
// lines: [[text, px, y]] on a 1024x512 canvas; plane is width x width/2
export function textPlane(lines, width, hex = VIOLET, k = 2.2) {
  const c = document.createElement("canvas");
  c.width = 1024; c.height = 512;
  const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
  lines.forEach(([txt, px, y]) => { x.font = `900 ${px}px Inter, Arial, sans-serif`; x.fillText(txt, 512, y); });
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(hex).multiplyScalar(k), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 2), mat);
  m.renderOrder = 20; m.userData.w = width; m.visible = false;
  scene.add(m);
  return m;
}
// screen-space placement: sx,sy in -1..1 (y up), wFrac = fraction of screen width, a = opacity
export function hud(m, sx, sy, wFrac, a = 1) {
  m.visible = a > 0.01;
  if (!m.visible) return;
  if (m.parent !== camera) camera.add(m);
  const d = 2, hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * d, hw = hh * camera.aspect;
  const f = m.userData.fill;
  if (f) { // safe zone (17.11): text stays in x 60..940 px and y 250..1220 px of the 1080x1920 frame
    wFrac = Math.min(wFrac, 0.815); const half = wFrac * 540, hc = (f * wFrac * 540) / 2;
    const px = THREE.MathUtils.clamp((sx + 1) * 540, 60 + half, 940 - half), py = THREE.MathUtils.clamp(((1 - sy) / 2) * 1920, 250 + hc, 1220 - hc);
    sx = px / 540 - 1; sy = 1 - (py / 1920) * 2;
  }
  m.position.set(sx * hw, sy * hh, -d);
  m.quaternion.identity();
  m.scale.setScalar((wFrac * 2 * hw) / m.userData.w * (0.9 + 0.1 * a));
  m.material.opacity = a;
}
// world-space label that faces the camera
export function label(m, x, y, z, s, a = 1) {
  m.visible = a > 0.01;
  if (!m.visible) return;
  if (m.parent !== scene) scene.add(m);
  m.position.set(x, y, z); m.quaternion.copy(camera.quaternion); m.scale.setScalar(s * (0.85 + 0.15 * a)); m.material.opacity = a;
}
// flat additive glow patch on the ground (blind zones, lit road...)
export function patch(w, d, hex, k = 1) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
  m.rotation.x = -Math.PI / 2; m.position.y = 0.03; m.renderOrder = 5;
  const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, d)), new THREE.LineBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k * 2), toneMapped: false, transparent: true, opacity: 0 }));
  m.add(e); m.userData.e = e;
  scene.add(m);
  m.set = (a) => { m.visible = a > 0.01; mat.opacity = 0.35 * a; e.material.opacity = a; };
  m.set(0);
  return m;
}
// glowing beam between two points (gaze / sight lines)
export function beam(hex, k = 2, r = 0.03) {
  const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
  m.visible = false; scene.add(m);
  m.set = (A, B, a = 1) => { m.visible = a > 0.01; if (!m.visible) return; m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.set(r, r, Math.max(0.01, A.distanceTo(B))); m.lookAt(B); mat.opacity = a; };
  return m;
}

// ---------- floor + roads ----------
const grid = new THREE.GridHelper(600, 300, 0x2c2478, 0x1c1752);
grid.material.toneMapped = false;
scene.add(grid);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: 0x07051c }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.01;
scene.add(floor);
export const mAsph = new THREE.MeshStandardMaterial({ color: 0x0f0c2c, roughness: 0.9 });
// straight road along z: lanes of width lw, centred at x=cx, from z0 (near, +) to z1 (far, -)
export function road({ lanes = 1, lw = 3.5, cx = 0, z0 = 60, z1 = -400, lamps = true } = {}) {
  const r = new THREE.Group(), w = lanes * lw, len = z0 - z1;
  const a = new THREE.Mesh(new THREE.PlaneGeometry(w + 1, len), mAsph); a.rotation.x = -Math.PI / 2; a.position.set(cx, 0.004, (z0 + z1) / 2);
  r.add(a, tube([cx - w / 2 - 0.3, 0.02, z0], [cx - w / 2 - 0.3, 0.02, z1], 0.07, mFrame), tube([cx + w / 2 + 0.3, 0.02, z0], [cx + w / 2 + 0.3, 0.02, z1], 0.07, mFrame));
  const n = Math.ceil(len / 4);
  for (let l = 1; l < lanes; l++) {
    const d = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.01, 1.6), glow(VIOLET, 1.1), n);
    for (let i = 0; i < n; i++) d.setMatrixAt(i, new THREE.Matrix4().makeTranslation(cx - w / 2 + l * lw, 0.012, z0 - i * 4));
    r.add(d);
  }
  if (lamps) for (let z = z0, i = 0; z > z1; z -= 20, i++) { const x = cx + (i % 2 ? -1 : 1) * (w / 2 + 1.6); r.add(box(0.1, 4, 0.1, x, 2, z, mFrame, false), box(0.9, 0.08, 0.2, x - Math.sign(x - cx) * 0.4, 4, z, glow(VIOLET, 2.0), false)); }
  scene.add(r);
  return r;
}

// ---------- wheel ----------
const mRubber = new THREE.MeshStandardMaterial({ color: 0x0d0b22, roughness: 0.8 });
export function wheel(fat) { // fat tire + glowing rim + cast 5-spoke hub, radius 0.33
  const w = new THREE.Group(), side = (o) => { o.rotation.y = Math.PI / 2; return o; };
  w.add(side(new THREE.Mesh(new THREE.TorusGeometry(0.255, fat, 12, 48), mRubber)));
  w.add(side(new THREE.Mesh(new THREE.TorusGeometry(0.255 + fat * 0.9, 0.014, 6, 48), mWheel)));
  w.add(side(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.022, 8, 40), mWheel)));
  for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.19, 0.035), mFrame); s.position.y = 0.095; const p = new THREE.Group(); p.rotation.x = (i * 2 * Math.PI) / 5; p.add(s); w.add(p); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, fat * 2.2, 16), glow(VIOLET, 2.2)); hub.rotation.z = Math.PI / 2; w.add(hub);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.01, 32), glow(ORANGE, 1.4)); disc.rotation.z = Math.PI / 2; disc.position.x = fat * 1.15; w.add(disc);
  return w;
}

// ---------- motorcycle + rider (faces -z, contact at y=0) ----------
export function makeBike({ trailHex = VIOLET } = {}) {
  const bike = new THREE.Group(), lean = new THREE.Group();
  bike.rotation.order = "YXZ";
  bike.add(lean); scene.add(bike);
  const rearW = wheel(0.12); rearW.position.set(0, 0.33, 0.68); lean.add(rearW);
  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), mSolid); tank.scale.set(0.5, 0.36, 0.7); tank.position.set(0, 0.92, -0.2);
  tank.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.SphereGeometry(0.5, 8, 4)), mEdge));
  lean.add(tank, box(0.3, 0.09, 0.5, 0, 0.86, 0.3), box(0.2, 0.12, 0.3, 0, 0.9, 0.62));
  const tail = box(0.12, 0.05, 0.03, 0, 0.92, 0.78, glow(RED, 3), false); lean.add(tail);
  lean.add(box(0.44, 0.4, 0.5, 0, 0.44, -0.08));
  for (let i = 0; i < 4; i++) lean.add(box(0.5, 0.025, 0.06, 0, 0.32 + i * 0.08, -0.36, mFrame, false));
  lean.add(tube([0.12, 0.3, -0.2], [0.16, 0.25, 0.3], 0.07, mFrame), tube([0.16, 0.25, 0.3], [0.17, 0.5, 0.75], 0.11, mSolid));
  lean.add(box(0.12, 0.12, 0.03, 0.17, 0.5, 0.77, mHot, false));
  lean.add(tube([0, 0.5, 0.15], [0, 0.33, 0.68], 0.07, mFrame), tube([0, 0.86, -0.45], [0, 0.45, 0.1], 0.06, mFrame));
  lean.add(tube([0.07, 0.55, 0.35], [0.07, 0.82, 0.5], 0.05, mHot));
  const fork = new THREE.Group(); fork.position.set(0, 0.95, -0.52); lean.add(fork);
  fork.add(tube([-0.13, 0.05, 0], [-0.13, -0.62, -0.16], 0.08, mFrame), tube([0.13, 0.05, 0], [0.13, -0.62, -0.16], 0.08, mFrame), box(0.36, 0.06, 0.12, 0, 0.06, 0, mFrame, false));
  lean.add(tube([0, 0.95, -0.52], [0, 0.88, -0.3], 0.1, mFrame));
  const frontW = wheel(0.1); frontW.position.set(0, -0.62, -0.16); fork.add(frontW);
  fork.add(box(0.3, 0.03, 0.34, 0, -0.27, -0.12, mSolid));
  const cowl = box(0.32, 0.26, 0.14, 0, 0.0, -0.1); cowl.rotation.x = -0.35; fork.add(cowl);
  const hlight = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 24), glow(WHITE, 1.8)); hlight.rotation.x = Math.PI / 2; hlight.position.set(0, 0.0, -0.19); fork.add(hlight);
  fork.add(box(0.7, 0.035, 0.035, 0, 0.12, 0.05, mFrame, false));
  fork.add(box(0.13, 0.05, 0.05, -0.39, 0.12, 0.05, glow(VIOLET, 2.4), false), box(0.13, 0.05, 0.05, 0.39, 0.12, 0.05, glow(VIOLET, 2.4), false));
  // small round mirrors on stalks
  const mirL = new THREE.Group(), mirR = new THREE.Group();
  for (const [m, s] of [[mirL, -1], [mirR, 1]]) { m.add(tube([s * 0.25, 0.12, 0.05], [s * 0.33, 0.36, 0.02], 0.02, mFrame), box(0.14, 0.09, 0.02, s * 0.35, 0.39, 0.02, glow(VIOLET, 2.0), false)); fork.add(m); }
  const rider = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.42, 4, 10), mSolid); torso.position.set(0, 1.28, 0.16); torso.rotation.x = -0.55;
  const headG = new THREE.Group(); headG.position.set(0, 1.62, -0.04);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mSolid); head.position.set(0, 0.04, -0.04);
  const visor = box(0.22, 0.06, 0.03, 0, 0.05, -0.18, glow(VIOLET, 2), false);
  headG.add(head, visor);
  rider.add(torso, headG, box(0.12, 0.12, 0.45, -0.16, 0.95, 0.18), box(0.12, 0.12, 0.45, 0.16, 0.95, 0.18),
    tube([-0.2, 1.42, 0.02], [-0.37, 1.08, -0.45], 0.08, mSolid), tube([0.2, 1.42, 0.02], [0.37, 1.08, -0.45], 0.08, mSolid),
    tube([-0.2, 0.95, -0.04], [-0.24, 0.42, 0.14], 0.1, mSolid), tube([0.2, 0.95, -0.04], [0.24, 0.42, 0.14], 0.1, mSolid),
    box(0.11, 0.08, 0.24, -0.25, 0.38, 0.08), box(0.11, 0.08, 0.24, 0.25, 0.38, 0.08),
    box(0.1, 0.09, 0.1, -0.39, 1.07, -0.47), box(0.1, 0.09, 0.1, 0.39, 1.07, -0.47));
  lean.add(box(0.62, 0.03, 0.05, 0, 0.34, 0.1, mFrame, false));
  lean.add(rider);
  // signal lights (blink with sig(k))
  const mSig = glow(ORANGE, 0.4), sigL = box(0.08, 0.06, 0.06, -0.18, 0.86, 0.8, mSig, false), sigR = box(0.08, 0.06, 0.06, 0.18, 0.86, 0.8, mSig.clone(), false);
  const sigFL = box(0.07, 0.05, 0.06, -0.22, 0.0, -0.12, mSig.clone(), false), sigFR = box(0.07, 0.05, 0.06, 0.22, 0.0, -0.12, mSig.clone(), false);
  lean.add(sigL, sigR); fork.add(sigFL, sigFR);
  // trail
  const TN = 90, trailGeo = new THREE.BufferGeometry();
  trailGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TN * 6), 3));
  trailGeo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TN * 6), 3));
  const idx = []; for (let i = 0; i < TN - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  trailGeo.setIndex(idx);
  const trail = new THREE.Mesh(trailGeo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  trail.frustumCulled = false; scene.add(trail);
  const col = new THREE.Color();
  const B = {
    g: bike, lean, fork, rearW, frontW, rider, headG, visor, hlight, mirL, mirR, trail, tail,
    // st from pathState; fn = the same path function (for the trail), u = its time
    set(st, fn, u, { hex = trailHex, pitch = 0, trailOn = true } = {}) {
      bike.visible = !!st; trail.visible = !!st && trailOn;
      if (!st) return;
      bike.position.set(st.x, 0.68 * Math.sin(-Math.min(0, pitch)), st.z);
      bike.rotation.set(pitch, st.h, 0);
      lean.rotation.z = st.lean; fork.rotation.y = -st.steer;
      rearW.rotation.x = frontW.rotation.x = st.z / 0.33;
      if (!trail.visible) return;
      const P = trailGeo.attributes.position.array, C = trailGeo.attributes.color.array;
      for (let k = 0; k < TN; k++) {
        const s2 = pathState(fn, u - k * 0.035) || st;
        const [rx, , rz] = local(s2.x, s2.z, s2.h, 0, 0, 0.68), nx = Math.cos(s2.h) * 0.06, nz = -Math.sin(s2.h) * 0.06;
        P.set([rx - nx, 0.015, rz - nz, rx + nx, 0.015, rz + nz], k * 6);
        col.set(hex).multiplyScalar(2.4 * (1 - k / TN) ** 1.6);
        C.set([col.r, col.g, col.b, col.r, col.g, col.b], k * 6);
      }
      trailGeo.attributes.position.needsUpdate = trailGeo.attributes.color.needsUpdate = true;
    },
    sig(side, t) { // side -1 left, 1 right, 0 off; t = time for blink
      const on = side !== 0 && Math.floor(t * 3) % 2 === 0;
      for (const [m, s] of [[sigL, -1], [sigFL, -1], [sigR, 1], [sigFR, 1]]) m.material.color.set(ORANGE).multiplyScalar(on && (s === side || side === 2) ? 4 : 0.4); // side 2 = hazards
    },
  };
  return B;
}

// ---------- car (faces -z): body, tapered cabin, glass, 4 wheels (front ones steer), lights ----------
export function makeCar({ driver = false, color = 0x5246c8 } = {}) {
  const c = new THREE.Group();
  const mBody = new THREE.MeshStandardMaterial({ color, emissive: new THREE.Color(color).multiplyScalar(0.48), roughness: 0.45, metalness: 0.3 });
  c.add(box(1.86, 0.58, 4.3, 0, 0.6, 0, mBody));
  const cg = new THREE.BoxGeometry(1.62, 0.56, 2.2), p = cg.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * 0.88); p.setZ(i, p.getZ(i) * 0.6 + 0.15); }
  cg.computeVertexNormals();
  const cab = new THREE.Mesh(cg, mBody); cab.position.set(0, 1.17, 0.25);
  cab.add(new THREE.LineSegments(new THREE.EdgesGeometry(cg), mEdge)); c.add(cab);
  const mGlass = glow(VIOLET, 0.9); mGlass.side = THREE.DoubleSide;
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.72), mGlass); ws.position.set(0, 1.19, -0.57); ws.rotation.x = -0.79 + Math.PI; c.add(ws);
  c.add(box(0.02, 0.3, 1.4, -0.79, 1.19, 0.35, mGlass, false), box(0.02, 0.3, 1.4, 0.79, 1.19, 0.35, mGlass, false));
  c.add(box(1.92, 0.12, 0.12, 0, 0.36, -2.17, mFrame, false), box(1.92, 0.12, 0.12, 0, 0.36, 2.17, mFrame, false));
  const mHead = glow(0xfff4e8, 0.9);
  c.add(box(0.44, 0.13, 0.04, -0.6, 0.72, -2.16, mHead, false), box(0.44, 0.13, 0.04, 0.6, 0.72, -2.16, mHead, false));
  const mTail = glow(RED, 2.6);
  c.add(box(0.4, 0.12, 0.04, -0.62, 0.74, 2.16, mTail, false), box(0.4, 0.12, 0.04, 0.62, 0.74, 2.16, mTail, false));
  const wheels = [], front = [];
  for (const [x, z] of [[-0.93, -1.4], [0.93, -1.4], [-0.93, 1.4], [0.93, 1.4]]) {
    const pv = new THREE.Group(); pv.position.set(x, 0.355, z); c.add(pv);
    const w = wheel(0.1); pv.add(w); wheels.push(w); if (z < 0) front.push(pv);
  }
  let drv = null;
  if (driver) { drv = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), new THREE.MeshStandardMaterial({ color: 0xc9bfff, emissive: 0x4a3fb0 })); drv.position.set(-0.4, 1.25, 0.4); c.add(drv); }
  scene.add(c);
  return {
    g: c, wheels, front, driver: drv,
    set(st, steer = 0) {
      c.visible = !!st; if (!st) return;
      c.position.set(st.x, 0, st.z); c.rotation.y = st.h;
      const d = -(st.x * Math.sin(st.h) + st.z * Math.cos(st.h));
      wheels.forEach((w) => (w.rotation.x = -d / 0.355));
      front.forEach((f) => (f.rotation.y = steer));
    },
  };
}

// ---------- semi truck (faces -z): cab with big side mirrors + long box trailer ----------
export function makeTruck() {
  const t = new THREE.Group();
  const mBody = new THREE.MeshStandardMaterial({ color: 0x4a40c0, emissive: 0x231c70, roughness: 0.5, metalness: 0.3 });
  const mTr = new THREE.MeshStandardMaterial({ color: 0x2c2680, emissive: 0x17134a, roughness: 0.6 });
  // cab: front face at z=-1.6 (hood + box)
  t.add(box(2.5, 1.3, 1.4, 0, 1.25, -1.0, mBody), box(2.5, 1.9, 2.0, 0, 2.55, 0.0, mBody));
  const mGlass = glow(VIOLET, 0.9); mGlass.side = THREE.DoubleSide;
  t.add(box(2.2, 0.8, 0.03, 0, 2.9, -1.01, mGlass, false));
  t.add(box(0.03, 0.7, 0.9, -1.26, 2.9, -0.4, mGlass, false), box(0.03, 0.7, 0.9, 1.26, 2.9, -0.4, mGlass, false));
  t.add(box(2.6, 0.2, 0.15, 0, 0.6, -1.72, mFrame, false));
  const mHead = glow(0xfff4e8, 1.0);
  t.add(box(0.5, 0.2, 0.05, -0.85, 1.2, -1.71, mHead, false), box(0.5, 0.2, 0.05, 0.85, 1.2, -1.71, mHead, false));
  // driver's head behind the left windscreen
  const drv = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshStandardMaterial({ color: 0xc9bfff, emissive: 0x4a3fb0 })); drv.position.set(-0.6, 2.85, -0.3); t.add(drv);
  // west-coast mirrors on arms, both sides
  const mMir = glow(VIOLET, 2.2), mirrors = [];
  for (const s of [-1, 1]) {
    t.add(tube([s * 1.25, 2.5, -0.9], [s * 1.62, 2.6, -1.0], 0.06, mFrame));
    const m = box(0.36, 0.75, 0.1, s * 1.8, 2.6, -1.0, mMir.clone(), false); t.add(m); mirrors.push(m); // glass faces the rear
  }
  // chassis + trailer (13.5 long, 4.0 tall)
  t.add(box(1.2, 0.3, 6, 0, 0.75, 2.2, mFrame, false));
  t.add(box(2.6, 3.0, 13.5, 0, 2.65, 8.3, mTr));
  t.add(box(2.62, 0.08, 13.5, 0, 1.3, 8.3, glow(ORANGE, 1.6), false)); // reflective side stripe
  const mTail = glow(RED, 2.6);
  t.add(box(0.3, 0.2, 0.05, -1.1, 1.0, 15.06, mTail, false), box(0.3, 0.2, 0.05, 1.1, 1.0, 15.06, mTail, false));
  const wheels = [];
  for (const z of [-0.7, 2.6, 3.7, 12.2, 13.3]) for (const x of [-1.05, 1.05]) { const w = wheel(0.12); w.scale.setScalar(1.55); w.position.set(x, 0.51, z); t.add(w); wheels.push(w); }
  scene.add(t);
  return {
    g: t, mirrors, driver: drv,
    set(st) {
      t.visible = !!st; if (!st) return;
      t.position.set(st.x, 0, st.z); t.rotation.y = st.h;
      const d = -(st.x * Math.sin(st.h) + st.z * Math.cos(st.h));
      wheels.forEach((w) => (w.rotation.x = -d / 0.51));
    },
  };
}

// ---------- motion ----------
export const hdg = (dx, dz) => (Math.abs(dx) + Math.abs(dz) < 1e-6 ? 0 : Math.atan2(-dx, -dz));
// path fn: u -> [x, z] (or null). Returns position, heading, physical lean (from turn rate), steer.
export function pathState(fn, u) {
  if (!fn) return null;
  const e = 0.02, P = (k) => fn(u + k * e), hd = (a, b) => hdg(a[0] - b[0], a[1] - b[1]);
  const p0 = P(0); if (!p0) return null;
  const p1 = P(1) || p0, m1 = P(-1) || p0, p2 = P(2) || p1, m2 = P(-2) || m1, p3 = P(3) || p2;
  const v = Math.hypot(p1[0] - m1[0], p1[1] - m1[1]) / (2 * e);
  const dh = (hd(p2, p0) - hd(p0, m2)) / (2 * e), dh2 = (hd(p3, p1) - hd(p1, m1)) / (2 * e);
  const ln = Math.atan((v * dh) / 9.8);
  const st = clamp((0.25 * (Math.atan((v * dh2) / 9.8) - ln)) / (2 * e), -0.3, 0.3);
  const h = v < 0.05 ? (p0[2] ?? 0) : hd(p1, m1);
  return { x: p0[0], z: p0[1], h: p0[2] ?? h, lean: ln, steer: st, v };
}
export const local = (x, z, h, ox, oy, oz) => [x + ox * Math.cos(h) + oz * Math.sin(h), oy, z - ox * Math.sin(h) + oz * Math.cos(h)];

// ---------- camera: K = [[t, [cx,cy,cz, lx,ly,lz, fov]]...] catmull-rom; f(u) -> {x,z,h} makes keys local to it ----------
export function keys(t, K) {
  if (t <= K[0][0]) return K[0][1];
  let i = 0;
  while (i < K.length - 2 && t > K[i + 1][0]) i++;
  const s = Math.min(1, (t - K[i][0]) / (K[i + 1][0] - K[i][0]));
  const p0 = (K[i - 1] || K[i])[1], p1 = K[i][1], p2 = K[i + 1][1], p3 = (K[i + 2] || K[i + 1])[1];
  return p1.map((_, j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * s + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * s * s + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * s * s * s));
}
// returns the cut punch (1 right after a cut -> 0)
export function shoot(SH, t) {
  let shot = SH[0];
  for (const s of SH) if (t >= s.at) shot = s;
  const su = t - shot.at;
  let [cx, cy, cz, lx, ly, lz, fov] = shot.cam ? shot.cam(t, su) : keys(su, shot.K);
  if (shot.f && !shot.cam) {
    const b = shot.f(t);
    if (b) { const h = shot.noRot ? 0 : b.h; [cx, , cz] = local(b.x, b.z, h, cx, cy, cz); [lx, , lz] = local(b.x, b.z, h, lx, ly, lz); }
  }
  const punch = shot.calm ? 0 : 1 - sm(0, 0.22, su);
  camera.position.set(cx, cy, cz);
  camera.lookAt(lx, ly, lz);
  camera.fov = fov + 12 * punch * punch;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  return { shot, su, punch };
}
export function sceneOf(t) { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD }; }
export function run(name, renderAt) {
  const draw = (t) => { renderAt(t); composer.render(); };
  window.__hf = window.__hf || {};
  window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady[name] = Promise.resolve().then(() => { const t0 = window.__hfThreeTime || 0; draw(t0); draw(t0); });
  window.addEventListener("hf-seek", (e) => draw(e.detail.time));
}
