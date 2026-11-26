// NEVER SKIP THE THERMOSTAT (Hidden Cam). Rental bedroom, a thermostat on the back wall left of the bed.
// s1 guest walks in, camera pushes toward the thermostat. s2 green check on the temperature display, red cross at "never"
// (never looked at again). s3 close on the box: a red lens in a tiny hole, then a wide red cone over the whole room.
// s4 lights dim, guest walks to stand in front of it (green floor patch). s5 flashlight from the side sweeps the front.
// s6 the beam stops on the hole: glint. Red cross = don't touch, phone up = photo, green check = report. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip, icon, pop } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], temp: g("s2", "temperature"), never: g("s2", "never"), again: g("s2", "again"),
  s3: S.s3[0], small: g("s3", "small"), box: g("s3", "box"), lens: g("s3", "lens"), sees: g("s3", "sees"), whole: g("s3", "whole"),
  s4: S.s4[0], off: g("s4", "off"), stand: g("s4", "stand"), front: g("s4", "front"),
  s5: S.s5[0], shine: g("s5", "shine"), flashlight: g("s5", "flashlight"), slowly: g("s5", "slowly"), side: g("s5", "side"),
  s6: S.s6[0], glint: g("s6", "glint"), hole: g("s6", "hole"), touch: g("s6", "touch"), photo: g("s6", "photo"), report: g("s6", "report"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- the room: bed against the back wall, two nightstands, door on the right ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.9, 0.3, 2.1, 0, 0.2, -1.9, mat(0x4a40c0)));
bed.add(box(1.8, 0.22, 2.0, 0, 0.46, -1.88, mat(0xe8e4ff, 0.12)));
bed.add(box(1.84, 0.06, 1.25, 0, 0.6, -1.42, mat(0x6a5cff, 0.22)));
bed.add(box(1.9, 1.0, 0.08, 0, 0.75, -2.9, mat(0x2e2890)));
for (const x of [-0.45, 0.45]) bed.add(box(0.7, 0.14, 0.4, x, 0.64, -2.6, mat(0xffffff, 0.15)));
solid(bed);
const NS = [-1.3, 1.3].map((x) => { const n = box(0.5, 0.55, 0.45, x, 0.275, -2.7, mat(0x4a40c0)); scene.add(n); return n; });
solid(...NS);
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade);
door(2.9, -2.9, 0);
scene.add(box(10, 0.05, 0.06, 0, 3.17, -2.9, glow(0x8a80ff, 0.9), false)); // ceiling trim
scene.add(box(10, 0.04, 0.04, 0, 0.04, -2.9, glow(0x8a80ff, 0.6), false)); // skirting

// ---------- the thermostat: white body, glowing temperature display, round dial, a tiny hole bottom right ----------
const DET = V3(-2.1, 1.45, -2.92);
const th = new THREE.Group(); th.position.copy(DET); scene.add(th);
th.add(box(0.26, 0.32, 0.045, 0, 0, 0.0, mat(0xf0eeff, 0.35)));
th.add(box(0.2, 0.08, 0.006, 0, 0.09, 0.026, mat(0x0a0820, 0.05), false)); // display glass
const mDig = glow(0x66ffd0, 1.5);
for (let i = 0; i < 2; i++) th.add(box(0.03, 0.05, 0.004, -0.03 + i * 0.045, 0.09, 0.031, mDig, false)); // "21"
th.add(box(0.012, 0.012, 0.004, 0.05, 0.105, 0.031, mDig, false)); // degree dot
const dial = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 12, 40), mat(0xb8b0ff, 0.3)); dial.position.set(0, -0.04, 0.03); th.add(dial);
const thRing = box(0.31, 0.37, 0.004, 0, 0, -0.02, glow(VIOLET, 0.0), false); th.add(thRing);
const LENS = DET.clone().add(V3(0.085, -0.115, 0.03));
{ const hole = new THREE.Mesh(new THREE.CircleGeometry(0.014, 20), new THREE.MeshBasicMaterial({ color: 0x000000 })); hole.position.copy(LENS).add(V3(0, 0, -0.001)); scene.add(hole); }
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
{ const l = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), lensMat); l.position.copy(LENS); scene.add(l); }
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const glD = new THREE.Group(); glD.position.copy(LENS).add(V3(0, 0, 0.03)); scene.add(glD);
glD.add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.46, 0.002), mGl));
glD.visible = false;

// ---------- cones and patches ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const ROOMC = V3(0.6, 0.3, -0.6);
const coneD = cone(RED, 1.0);
const roomRed = patch(3.6, 3.2, RED, 1.0); roomRed.position.set(0.4, 0.04, -1.2);
const STAND = [-1.6, -1.85];
const floorGreen = patch(0.9, 0.9, GREEN, 1.2); floorGreen.position.set(STAND[0], 0.04, STAND[1]);
const beamCone = cone(WHITE, 0.9);
const spotDisk = new THREE.Mesh(new THREE.CircleGeometry(0.08, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
spotDisk.renderOrder = 7; scene.add(spotDisk);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- icons ----------
const icTemp = icon("check", GREEN, { size: 0.36 });
const icNever = icon("cross", RED, { size: 0.42 });
const icTouch = icon("cross", RED, { size: 0.42 });
const icCheck = icon("check", GREEN, { size: 0.45 });

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [2.9, 1.4], SPOT1 = [-0.6, 0.6];
const tArr = S.s1[0] + 2.0;
const hp = V3(0, 0, 0);

// flashlight path: s5 sweeps across the front, s6 settles on the hole
const FL = DET.clone().add(V3(-0.1, 0.08, 0.03)), FR = DET.clone().add(V3(0.1, -0.06, 0.03));
const TK = [
  [T.shine, FL], [T.slowly, FR], [T.side + 0.15, FL], [T.s6 - 0.35, FR], [T.s6 + 0.05, LENS], [T.s7, LENS],
];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("NEVER SKIP THE THERMOSTAT");
cap("s2", "temperature", "JUST THE TEMPERATURE?", RED);
cap("s2", "never", "THEN NEVER AGAIN", RED, { boom: 0.3 });
cap("s3", "small", "A SMALL BOX", RED, { boom: 0.4 });
cap("s3", "lens", "A TINY LENS", RED);
cap("s3", "sees", "SEES THE WHOLE ROOM", RED);
cap("s4", "off", "LIGHTS OFF", GREEN, { boom: 0.3 });
cap("s4", "stand", "STAND IN FRONT", GREEN);
cap("s5", "flashlight", "FLASHLIGHT ON IT", VIOLET, { boom: 0.3 });
cap("s5", "slowly", "SLOWLY, FROM THE SIDE", GREEN);
cap("s6", "glint", "A GLINT IN A HOLE?", WHITE, { boom: 0.4 });
cap("s6", "touch", "DON'T TOUCH IT", GREEN);
cap("s6", "photo", "TAKE A PHOTO", GREEN);
cap("s6", "report", "REPORT IT", GREEN);
endCard([["CHECK THE THERMOSTAT", 1], ["EVERY STAY", 1]]);

// ---------- shots: [camX, camY, camZ, lookX, lookY, lookZ, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const CLOSE = st([-1.85, 1.42, -1.85, -2.08, 1.45, -2.92, 36], [-1.88, 1.43, -2.05, -2.08, 1.45, -2.92, 34]);
const SH = [
  // hook: guest walks in, camera pushes toward the thermostat
  { at: 0, K: [[0, [0.2, 2.1, 4.6, -1.0, 1.4, -2.2, 52]], [2.2, [-0.3, 2.0, 3.6, -1.2, 1.4, -2.4, 52]]] },
  // s2: the back wall: thermostat and the bed
  { at: T.s2, K: st([-0.7, 1.7, 1.6, -1.2, 1.3, -2.6, 52], [-0.8, 1.65, 1.3, -1.3, 1.3, -2.6, 52]) },
  // s3 "small box": close on the thermostat, the lens in the hole
  { at: T.small - 0.1, K: CLOSE },
  // "sees the whole room": wide from the right front, the red cone fills the room
  { at: T.sees - 0.1, K: st([2.8, 2.6, 2.2, -0.8, 1.0, -1.2, 56], [2.6, 2.7, 1.9, -0.8, 1.0, -1.2, 56]) },
  // s4: from the right front, lights go down, guest walks to stand in front of it
  { at: T.s4, K: st([1.6, 1.8, 1.8, -1.4, 1.2, -1.9, 52], [1.45, 1.8, 1.55, -1.4, 1.2, -1.9, 52]) },
  // s5: behind and right of the guest, beam onto the thermostat
  { at: T.s5, K: st([0.4, 1.8, -0.5, -1.9, 1.4, -2.9, 50], [0.25, 1.8, -0.7, -1.9, 1.4, -2.9, 50]) },
  // "slowly": close on the thermostat, the spot slides across the front
  { at: T.slowly - 0.1, K: CLOSE },
  // s6 "touch": side view of the guest, phone up
  { at: T.touch - 0.1, K: st([0.6, 1.7, -0.3, -1.7, 1.5, -2.3, 54], [0.5, 1.72, -0.5, -1.7, 1.5, -2.3, 54]) },
  // s7-s8: calm wide
  { at: T.s7 - 0.15, calm: 1, K: [[0, [0.0, 2.5, 4.2, -0.6, 0.8, -1.8, 52]], [5, [0.0, 2.6, 4.8, -0.6, 0.8, -1.8, 52]]] },
];

run("thermostat", (t) => {
  // guest: walk in (s1), wait (s2-s3), walk to stand in front of the thermostat (s4), flashlight (s5-s6)
  const w = walkPath(START, SPOT1, 0.05, tArr, t);
  const go = walkPath(SPOT1, STAND, T.stand - 0.2, T.s5 - 0.1, t);
  let x = w.x, z = w.z, h = w.walk > 0.01 ? w.h : face(SPOT1, [DET.x, DET.z]), walk = w.walk;
  if (t > T.stand - 0.2) { x = go.x; z = go.z; walk = go.walk; h = t < T.s5 - 0.1 ? go.h : face(STAND, [DET.x, DET.z]); }
  const on = sm(T.shine - 0.2, T.shine + 0.1, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  P.set({ x, z, h, walk, t, vis: true, phone: on });

  // s2: check on the temperature, cross at "never"
  const s2k = 1 - sm(T.s3 - 0.1, T.s3 + 0.2, t);
  const icTop = DET.clone().add(V3(0, 0.36, 0.1));
  pop(icTemp, icTop, sm(T.temp - 0.1, T.temp + 0.2, t) * (1 - sm(T.never - 0.15, T.never, t)) * s2k);
  pop(icNever, icTop, sm(T.never - 0.1, T.never + 0.2, t) * s2k);

  // s3: red lens in the hole, red cone over the whole room
  const lk = sm(T.box, T.lens, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  const cd = sm(T.sees - 0.1, T.whole, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  coneD.set(LENS, ROOMC, 2.0, 0.16 * cd);
  roomRed.set(0.8 * cd);
  const pulse = 0.75 + 0.25 * Math.sin(t * 9);
  lensMat.color.set(RED).multiplyScalar(2.4 * lk * pulse);

  // s4: lights down, green floor spot in front of it
  floorGreen.set(sm(T.front - 0.15, T.front + 0.15, t) * (1 - sm(T.shine, T.shine + 0.3, t)));
  const dim = 1 - 0.6 * sm(T.off - 0.1, T.off + 0.3, t) + 0.4 * sm(T.s7 - 0.2, T.s7 + 0.4, t);
  for (const [l, i0] of LIGHTS) l.intensity = i0 * dim;
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (0.25 + 0.75 * dim));
  thRing.material.color.set(VIOLET).multiplyScalar(0.9 * sm(T.front - 0.1, T.front + 0.2, t) * (1 - sm(T.s7 - 0.2, T.s7, t)));

  // flashlight
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.12, 0.13 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).add(V3(0, 0, 0.03)); spotDisk.lookAt(hp); spotDisk.material.opacity = (t > T.s6 - 0.2 ? 0.08 : 0.28) * on;
  spot.intensity = (t > T.s6 - 0.2 ? 0.8 : 2.5) * on;
  spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();

  // s6: glint in the hole, cross over the guest at "touch", check at "report"
  const prox = Math.exp(-tg.distanceToSquared(LENS) / 0.006) * on;
  const a = 0.4 * prox * (0.75 + 0.6 * flash(t, T.glint + 0.1));
  glD.visible = a > 0.02; glD.scale.setScalar(Math.max(0.01, a * (1 + 0.15 * Math.sin(t * 17)))); glD.rotation.z = 0.3 * Math.sin(t * 1.3);
  const top = P.top(0.45);
  pop(icTouch, top, sm(T.touch - 0.1, T.touch + 0.2, t) * (1 - sm(T.photo - 0.1, T.photo + 0.1, t)));
  pop(icCheck, top, sm(T.report - 0.1, T.report + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
