// NEVER IGNORE THE AIR VENT (Hidden Cam). Hotel room, an air vent high on the back wall over the bed.
// s1 guest walks in, camera pushes toward the vent. s2 green checks on the lamp and the clock, red cross on the vent (skipped).
// s3 close on the slats: a red lens between them, then a red view cone onto the bed. s4 room lights dim, guest walks to
// stand under the vent (green floor patch). s5 flashlight beam sweeps the slats side to side. s6 the beam stops on the
// lens: glint. Red cross = don't touch, phone up = photo, green check = report. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip, icon, pop } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], lamp: g("s2", "lamp"), clock: g("s2", "clock"), skip: g("s2", "skip"),
  s3: S.s3[0], slats: g("s3", "slats"), lens: g("s3", "lens"), faces: g("s3", "faces"), bed: g("s3", "bed"),
  s4: S.s4[0], off: g("s4", "off"), stand: g("s4", "stand"), under: g("s4", "under"),
  s5: S.s5[0], shine: g("s5", "shine"), flashlight: g("s5", "flashlight"), slowly: g("s5", "slowly"), side: g("s5", "side"),
  s6: S.s6[0], glint: g("s6", "glint"), touch: g("s6", "touch"), photo: g("s6", "photo"), report: g("s6", "report"),
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
// lamp on the right nightstand
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade);
const LAMP = V3(1.42, 1.45, -2.82);
// alarm clock on the left nightstand: dark body, glowing digit bars
const CLK = V3(-1.3, 0.62, -2.62);
scene.add(box(0.3, 0.14, 0.1, CLK.x, CLK.y, CLK.z, mat(0x15123f, 0.1)));
const mDig = glow(0x66ffd0, 1.4);
for (let i = 0; i < 4; i++) scene.add(box(0.035, 0.07, 0.004, CLK.x - 0.09 + i * 0.06 + (i > 1 ? 0.012 : 0), CLK.y, CLK.z + 0.052, mDig, false));
door(2.9, -2.9, 0);
scene.add(box(10, 0.05, 0.06, 0, 3.17, -2.9, glow(0x8a80ff, 0.9), false)); // ceiling trim
scene.add(box(10, 0.04, 0.04, 0, 0.04, -2.9, glow(0x8a80ff, 0.6), false)); // skirting

// ---------- the air vent high over the bed: frame, dark duct, six slats, a lens in one gap ----------
const DET = V3(0, 2.6, -2.92);
const vent = new THREE.Group(); vent.position.copy(DET); scene.add(vent);
vent.add(box(0.74, 0.4, 0.02, 0, 0, 0, mat(0x0a0820, 0.05), false)); // dark duct behind
const mFrame = mat(0xf0eeff, 0.35);
vent.add(box(0.78, 0.035, 0.04, 0, 0.2, 0.02, mFrame), box(0.78, 0.035, 0.04, 0, -0.2, 0.02, mFrame));
vent.add(box(0.035, 0.4, 0.04, -0.375, 0, 0.02, mFrame), box(0.035, 0.4, 0.04, 0.375, 0, 0.02, mFrame));
for (const y of [-0.15, -0.09, -0.03, 0.03, 0.09, 0.15]) { const s = box(0.72, 0.026, 0.012, 0, y, 0.025, mFrame, false); s.rotation.x = -0.35; vent.add(s); }
const ventRing = box(0.82, 0.44, 0.004, 0, 0, 0.005, glow(VIOLET, 0.0), false); vent.add(ventRing);
const LENS = DET.clone().add(V3(0.13, -0.06, 0.02));
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
{ const l = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 12), lensMat); l.position.copy(LENS); scene.add(l); }
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const glD = new THREE.Group(); glD.position.copy(LENS).add(V3(0, 0, 0.04)); scene.add(glD);
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
const BEDC = V3(0, 0.6, -1.5);
const coneD = cone(RED, 1.0);
const bedRed = patch(1.6, 1.7, RED, 1.2); bedRed.position.set(0, 0.65, -1.75);
const STAND = [1.2, -1.35];
const floorGreen = patch(0.9, 0.9, GREEN, 1.2); floorGreen.position.set(STAND[0], 0.04, STAND[1]);
const beamCone = cone(WHITE, 0.9);
const spotDisk = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
spotDisk.renderOrder = 7; scene.add(spotDisk);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- icons ----------
const icLamp = icon("check", GREEN, { size: 0.4 });
const icClk = icon("check", GREEN, { size: 0.4 });
const icSkip = icon("cross", RED, { size: 0.45 });
const icTouch = icon("cross", RED, { size: 0.42 });
const icCheck = icon("check", GREEN, { size: 0.45 });

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [2.9, 1.4], SPOT1 = [0.5, 0.3];
const tArr = S.s1[0] + 2.0;
const hp = V3(0, 0, 0);

// flashlight path: s5 sweeps the slats side to side, s6 settles on the lens
const VL = DET.clone().add(V3(-0.28, -0.03, 0.03)), VR = DET.clone().add(V3(0.28, 0.02, 0.03));
const TK = [
  [T.shine, VL], [T.slowly, VR], [T.side + 0.15, VL], [T.s6 - 0.35, VR], [T.s6 + 0.05, LENS], [T.s7, LENS],
];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("NEVER IGNORE THE AIR VENT");
cap("s2", "lamp", "LAMP. CLOCK.", RED);
cap("s2", "skip", "SKIP THE VENT?", RED, { boom: 0.3 });
cap("s3", "slats", "BEHIND THE SLATS", RED, { boom: 0.4 });
cap("s3", "faces", "FACING THE BED", RED);
cap("s4", "off", "LIGHTS OFF", GREEN, { boom: 0.3 });
cap("s4", "stand", "STAND UNDER IT", GREEN);
cap("s5", "flashlight", "FLASHLIGHT IN", VIOLET, { boom: 0.3 });
cap("s5", "slowly", "SIDE TO SIDE", GREEN);
cap("s6", "glint", "SEE A GLINT?", WHITE, { boom: 0.4 });
cap("s6", "touch", "DON'T TOUCH IT", GREEN);
cap("s6", "photo", "TAKE A PHOTO", GREEN);
cap("s6", "report", "REPORT IT", GREEN);
endCard([["CHECK THE VENT", 1], ["EVERY ROOM", 1]]);

// ---------- shots: [camX, camY, camZ, lookX, lookY, lookZ, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const CLOSE = st([0.35, 2.42, -1.55, 0.05, 2.58, -2.9, 38], [0.3, 2.45, -1.8, 0.06, 2.58, -2.9, 36]);
const SH = [
  // hook: guest walks in, camera pushes toward the vent
  { at: 0, K: [[0, [0.6, 2.2, 4.6, 0, 1.6, -2.0, 52]], [2.2, [0.3, 2.3, 3.7, 0, 1.9, -2.3, 52]]] },
  // s2: the whole back wall: lamp, clock, vent
  { at: T.s2, K: st([0.3, 1.8, 2.5, 0, 1.4, -2.6, 55], [0.2, 1.8, 2.2, 0, 1.4, -2.6, 55]) },
  // s3 "slats": close on the vent, the lens between the slats
  { at: T.slats - 0.1, K: CLOSE },
  // "faces the bed": wide three-quarter, the vent sees the bed
  { at: T.faces - 0.1, K: st([2.8, 2.5, 1.6, 0, 1.6, -1.9, 54], [2.6, 2.6, 1.3, 0, 1.7, -1.9, 54]) },
  // s4: from the left-front, lights go down, guest walks to stand under the vent
  { at: T.s4, K: st([-2.4, 1.9, 2.4, 0.5, 1.3, -1.5, 52], [-2.25, 1.9, 2.15, 0.5, 1.3, -1.5, 52]) },
  // s5: behind the guest, beam on the slats
  { at: T.s5, K: st([2.5, 1.9, 0.6, 0.3, 2.1, -2.9, 50], [2.3, 1.95, 0.35, 0.25, 2.15, -2.9, 50]) },
  // "slowly": close on the vent, the spot slides along the slats
  { at: T.slowly - 0.1, K: CLOSE },
  // s6 "touch": side view of the guest, phone up
  { at: T.touch - 0.1, K: st([2.7, 1.75, -0.4, 0.8, 1.7, -1.9, 50], [2.6, 1.78, -0.6, 0.8, 1.7, -1.9, 50]) },
  // s7-s8: calm wide
  { at: T.s7 - 0.15, calm: 1, K: [[0, [0.3, 2.4, 4.2, -0.2, 1.1, -1.8, 52]], [5, [0.3, 2.5, 4.8, -0.2, 1.1, -1.8, 52]]] },
];

run("air-vent", (t) => {
  // guest: walk in (s1), wait (s2-s3), walk to the side of the bed under the vent (s4), flashlight (s5-s6)
  const w = walkPath(START, SPOT1, 0.05, tArr, t);
  const go = walkPath(SPOT1, STAND, T.stand - 0.2, T.s5 - 0.1, t);
  let x = w.x, z = w.z, h = w.walk > 0.01 ? w.h : face(SPOT1, [0, -2.9]), walk = w.walk;
  if (t > T.stand - 0.2) { x = go.x; z = go.z; walk = go.walk; h = t < T.s5 - 0.1 ? go.h : face(STAND, [0.1, -2.9]); }
  const on = sm(T.shine - 0.2, T.shine + 0.1, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  P.set({ x, z, h, walk, t, vis: true, phone: on });

  // s2: checks on the lamp and the clock, the vent skipped
  const s2k = 1 - sm(T.s3 - 0.1, T.s3 + 0.2, t);
  pop(icLamp, LAMP, sm(T.lamp - 0.1, T.lamp + 0.2, t) * s2k);
  pop(icClk, V3(CLK.x, 1.05, CLK.z), sm(T.clock - 0.1, T.clock + 0.2, t) * s2k);
  pop(icSkip, DET.clone().add(V3(0, 0, 0.12)), sm(T.skip - 0.1, T.skip + 0.2, t) * s2k);

  // s3: red lens between the slats, red cone onto the bed
  const lk = sm(T.slats, T.lens, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  const cd = sm(T.faces - 0.1, T.bed, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  coneD.set(LENS, BEDC, 0.95, 0.22 * cd);
  bedRed.set(cd);
  const pulse = 0.75 + 0.25 * Math.sin(t * 9);
  lensMat.color.set(RED).multiplyScalar(2.2 * lk * pulse);

  // s4: lights down, green floor spot under the vent
  floorGreen.set(sm(T.under - 0.15, T.under + 0.15, t) * (1 - sm(T.shine, T.shine + 0.3, t)));
  const dim = 1 - 0.6 * sm(T.off - 0.1, T.off + 0.3, t) + 0.4 * sm(T.s7 - 0.2, T.s7 + 0.4, t);
  for (const [l, i0] of LIGHTS) l.intensity = i0 * dim;
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (0.25 + 0.75 * dim));
  ventRing.material.color.set(VIOLET).multiplyScalar(0.9 * sm(T.under - 0.1, T.under + 0.2, t) * (1 - sm(T.s7 - 0.2, T.s7, t)));

  // flashlight
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.14, 0.13 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).add(V3(0, 0, 0.03)); spotDisk.lookAt(hp); spotDisk.material.opacity = (t > T.s6 - 0.2 ? 0.08 : 0.28) * on;
  spot.intensity = (t > T.s6 - 0.2 ? 0.8 : 2.5) * on;
  spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();

  // s6: glint on the lens, cross over the guest at "touch", check at "report"
  const prox = Math.exp(-tg.distanceToSquared(LENS) / 0.01) * on;
  const a = 0.4 * prox * (0.75 + 0.6 * flash(t, T.glint + 0.1));
  glD.visible = a > 0.02; glD.scale.setScalar(Math.max(0.01, a * (1 + 0.15 * Math.sin(t * 17)))); glD.rotation.z = 0.3 * Math.sin(t * 1.3);
  const top = P.top(0.55);
  pop(icTouch, top, sm(T.touch - 0.1, T.touch + 0.2, t) * (1 - sm(T.photo - 0.1, T.photo + 0.1, t)));
  pop(icCheck, top, sm(T.report - 0.1, T.report + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
