// NEVER IGNORE THE POWER BANK (Hidden Cam 46). Built from motion-sensor (45): same room, chest and cameras, the wall
// sensor swapped for a white power bank standing upright on the tall bedside chest, plugged into a wall socket and turned
// to face the bed. The lens sits in the small dark strip at the top of its front; four blue charge dots below it blink
// while the guest walks in (s1-s2: "something a guest forgot").
// The bank is built in a group (front = local +z) that is turned with lookAt toward the bed, so every close shot and the
// flashlight sweep are placed in that group's own frame (W()).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip, icon, pop } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], temp: g("s2", "forgot"), never: g("s2", "nobody"),
  s3: S.s3[0], small: g("s3", "hidden"), box: g("s3", "inside"), lens: g("s3", "banks"), sees: g("s3", "aimed"), whole: g("s3", "bed"),
  s4: S.s4[0], off: g("s4", "off"), stand: g("s4", "stand"), front: g("s4", "front"),
  s5: S.s5[0], shine: g("s5", "shine"), flashlight: g("s5", "flashlight"), slowly: g("s5", "slowly"), side: g("s5", "side"),
  s6: S.s6[0], glint: g("s6", "glint"), status: g("s6", "spot"), touch: g("s6", "touch"), photo: g("s6", "photo"), report: g("s6", "report"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- the room: bed against the back wall, one nightstand on the right, door on the right ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.9, 0.3, 2.1, 0, 0.2, -1.9, mat(0x4a40c0)));
bed.add(box(1.8, 0.22, 2.0, 0, 0.46, -1.88, mat(0xe8e4ff, 0.12)));
bed.add(box(1.84, 0.06, 1.25, 0, 0.6, -1.42, mat(0x6a5cff, 0.22)));
bed.add(box(1.9, 1.0, 0.08, 0, 0.75, -2.9, mat(0x2e2890)));
for (const x of [-0.45, 0.45]) bed.add(box(0.7, 0.14, 0.4, x, 0.64, -2.6, mat(0xffffff, 0.15)));
solid(bed);
const NS = box(0.5, 0.55, 0.45, 1.3, 0.275, -2.7, mat(0x4a40c0)); scene.add(NS); solid(NS);
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade);
door(2.9, -2.9, 0);
scene.add(box(10, 0.05, 0.06, 0, 3.17, -2.9, glow(0x8a80ff, 0.9), false)); // ceiling trim
scene.add(box(10, 0.04, 0.04, 0, 0.04, -2.9, glow(0x8a80ff, 0.6), false)); // skirting

// ---------- the power bank: upright on a tall bedside chest left of the bed, turned toward the bed ----------
// Chest top at y 1.28. Bank body 0.09 x 0.16 x 0.03, so its centre is at y 1.36.
const DET = V3(-2.1, 1.36, -2.66);
scene.add(box(0.5, 1.28, 0.34, -2.1, 0.64, -2.72, mat(0x8a6a48, 0.16)));           // tall bedside chest
scene.add(box(0.44, 0.012, 0.005, -2.1, 0.95, -2.549, mat(0x5c3d22, 0.2), false)); // drawer line
scene.add(box(0.44, 0.012, 0.005, -2.1, 0.55, -2.549, mat(0x5c3d22, 0.2), false));
const th = new THREE.Group(); th.position.copy(DET); scene.add(th);
th.lookAt(V3(0.3, DET.y, -1.6)); th.updateMatrixWorld(true);
const W = (x, y, z) => th.localToWorld(V3(x, y, z));
const FWD = W(0, 0, 1).sub(DET), SIDE = W(-1, 0, 0).sub(DET); // SIDE = the bank's left, toward the room front
const mBody = mat(0xf2f0ff, 0.22), mEdge = mat(0xb8b4d8, 0.25), mDark = mat(0x0a0818, 0.02);
th.add(box(0.09, 0.16, 0.03, 0, 0, 0, mBody));                      // body
th.add(box(0.092, 0.006, 0.032, 0, -0.077, 0, mEdge, false));       // rubber foot line
th.add(box(0.07, 0.024, 0.004, 0, 0.055, 0.016, mDark));            // dark strip (top of the front)
const mDots = new THREE.MeshBasicMaterial({ color: 0x000820, toneMapped: false });
for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 10, 8), mDots); d.position.set(-0.024 + i * 0.016, 0.02, 0.016); th.add(d); }
// cable from the bank's foot, back along the chest top, up into a wall socket
const SOCK = V3(-1.82, 1.46, -2.88);
scene.add(box(0.08, 0.12, 0.02, SOCK.x, SOCK.y, SOCK.z, mat(0xf2f0ff, 0.2)));
const mCable = mat(0xeeeeff, 0.3);
const foot = W(0, -0.072, -0.016);
scene.add(tube([foot.x, 1.29, foot.z], [-2.0, 1.29, -2.84], 0.007, mCable));
scene.add(tube([-2.0, 1.29, -2.84], [SOCK.x - 0.01, SOCK.y - 0.03, -2.86], 0.007, mCable));
// highlight frame (violet) around the bank in s4-s6, just in front of it, hidden until it lights
const thRing = new THREE.Group(); th.add(thRing);
const mRing = glow(VIOLET, 0.0);
const RW = 0.17, RH = 0.25, RY = 0;
for (const [w, h, x, y] of [[RW, 0.008, 0, RY + RH / 2], [RW, 0.008, 0, RY - RH / 2], [0.008, RH, RW / 2, RY], [0.008, RH, -RW / 2, RY]])
  thRing.add(box(w, h, 0.003, x, y, 0.045, mRing, false));
thRing.material = mRing;
// the lens: a tiny dot in the dark strip
const LENS = W(0, 0.055, 0.02);
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
{ const l = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 16, 12), lensMat); l.position.set(0, 0.055, 0.019); th.add(l); }
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const glD = new THREE.Group(); glD.position.set(0, 0.055, 0.045); th.add(glD);
glD.add(new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.008, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.36, 0.002), mGl));
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
const ROOMC = V3(0.3, 0.5, -1.6);
const coneD = cone(RED, 1.0);
const roomRed = patch(2.4, 2.4, RED, 1.0); roomRed.position.set(0.0, 0.7, -1.7); // over the bed
const sp = DET.clone().addScaledVector(FWD, 1.0);
const STAND = [sp.x, sp.z];
const floorGreen = patch(0.9, 0.9, GREEN, 1.2); floorGreen.position.set(STAND[0], 0.04, STAND[1]);
const beamCone = cone(WHITE, 0.9);
const spotDisk = new THREE.Mesh(new THREE.CircleGeometry(0.06, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
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

// flashlight path: s5 sweeps across the lower front, side to side and back, and reaches the dark strip only in s6.
// Sweep points are 0.11 below the lens (prox ~0.007 at most, under the 0.02 glint threshold).
const FL = W(-0.035, -0.055, 0.02), FR = W(0.035, -0.055, 0.02);
const TK = [
  [T.shine, FL], [T.slowly, FR], [T.side + 0.15, FL], [T.s6 - 0.35, FR], [T.s6 + 0.05, LENS], [T.s7, LENS],
];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("NEVER IGNORE THE POWER BANK");
cap("s2", "forgot", "JUST LEFT BEHIND?", RED);
cap("s2", "nobody", "NOBODY LOOKS TWICE", RED, { boom: 0.3 });
cap("s3", "hidden", "HIDDEN CAMERAS", RED, { boom: 0.4 });
cap("s3", "fake", "FAKE POWER BANKS", RED);
cap("s3", "aimed", "AIMED AT THE BED", RED);
cap("s4", "off", "LIGHTS OFF", GREEN, { boom: 0.3 });
cap("s4", "stand", "STAND IN FRONT", GREEN);
cap("s5", "flashlight", "FLASHLIGHT ACROSS IT", VIOLET, { boom: 0.3 });
cap("s5", "slowly", "SLOWLY, FROM THE SIDE", GREEN);
cap("s6", "spot", "GLINT IN A DARK SPOT", VIOLET, { boom: 0.4 });
cap("s6", "touch", "DON'T TOUCH IT", GREEN);
cap("s6", "photo", "TAKE A PHOTO", GREEN);
cap("s6", "report", "REPORT IT", GREEN);
endCard([["CHECK THE CHARGERS", 1], ["EVERY STAY", 1]]);

// ---------- shots: [camX, camY, camZ, lookX, lookY, lookZ, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const shotAt = (fwd, side, up, fov, look = DET) => { const c = DET.clone().addScaledVector(FWD, fwd).addScaledVector(SIDE, side); return [c.x, c.y + up, c.z, look.x, look.y + 0.005, look.z, fov]; };
const CLOSE = st(shotAt(0.75, 0.1, 0.09, 40), shotAt(0.6, 0.08, 0.07, 40));
const SH = [
  // hook: guest walks in, camera pushes toward the chest
  { at: 0, K: [[0, [0.2, 2.2, 4.6, -1.2, 1.25, -2.3, 52]], [2.2, [-0.3, 2.0, 3.6, -1.4, 1.25, -2.4, 52]]] },
  // s2: the chest, the bank on it and the bed
  { at: T.s2, K: st([-0.6, 1.75, 0.8, -1.6, 1.15, -2.5, 50], [-0.7, 1.72, 0.5, -1.6, 1.15, -2.5, 50]) },
  // s3 "hidden cameras": close on the bank, the lens in the dark strip
  { at: T.small - 0.1, K: CLOSE },
  // "aimed at the bed": wide from the right front, the red cone from the bank onto the bed
  { at: T.sees - 0.1, K: st([2.8, 2.6, 2.2, -0.8, 1.0, -1.6, 56], [2.6, 2.7, 1.9, -0.8, 1.0, -1.6, 56]) },
  // s4: from the right front, lights go down, guest walks to stand in front of it
  { at: T.s4, K: st([1.6, 1.9, 1.8, -1.5, 1.2, -2.3, 52], [1.45, 1.9, 1.55, -1.5, 1.2, -2.3, 52]) },
  // s5: behind and to the side of the guest, beam onto the bank
  { at: T.s5, K: st(shotAt(1.9, 0.5, 0.45, 50), shotAt(1.75, 0.45, 0.42, 50)) },
  // "slowly": close on the bank from its left side, away from the guest
  { at: T.slowly - 0.1, K: st(shotAt(0.3, 0.6, 0.08, 40), shotAt(0.28, 0.52, 0.07, 40)) },
  // s6 "touch": side view of the guest, phone up
  { at: T.touch - 0.1, K: st([0.6, 1.8, -0.3, -1.6, 1.4, -2.4, 54], [0.5, 1.82, -0.5, -1.6, 1.4, -2.4, 54]) },
  // s7-s8: calm wide
  { at: T.s7 - 0.15, calm: 1, K: [[0, [0.0, 2.5, 4.2, -0.6, 0.9, -1.8, 52]], [5, [0.0, 2.6, 4.8, -0.6, 0.9, -1.8, 52]]] },
];

run("power-bank", (t) => {
  // guest: walk in (s1), wait (s2-s3), walk to stand in front of the bank (s4), flashlight (s5-s6)
  const w = walkPath(START, SPOT1, 0.05, tArr, t);
  const go = walkPath(SPOT1, STAND, T.stand - 0.2, T.s5 - 0.1, t);
  let x = w.x, z = w.z, h = w.walk > 0.01 ? w.h : face(SPOT1, [DET.x, DET.z]), walk = w.walk;
  if (t > T.stand - 0.2) { x = go.x; z = go.z; walk = go.walk; h = t < T.s5 - 0.1 ? go.h : face(STAND, [DET.x, DET.z]); }
  const on = sm(T.shine - 0.2, T.shine + 0.1, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  P.set({ x, z, h, walk, t, vis: true, phone: on });

  // charge dots blink blue one after another while the guest walks in (s1 to the end of s2), off after
  const dotsOn = t < T.s3 ? 1 : 0;
  const lit = Math.floor(t * 2.5) % 5;
  mDots.color.set(0x3aa0ff).multiplyScalar(dotsOn * (lit > 0 ? 2.0 : 0.3) + 0.04);

  // s2: check at "forgot", cross at "nobody"
  const s2k = 1 - sm(T.s3 - 0.1, T.s3 + 0.2, t);
  const icTop = DET.clone().add(V3(0, 0.3, 0.05));
  pop(icTemp, icTop, sm(T.temp - 0.1, T.temp + 0.2, t) * (1 - sm(T.never - 0.15, T.never, t)) * s2k);
  pop(icNever, icTop, sm(T.never - 0.1, T.never + 0.2, t) * s2k);

  // s3: red lens in the strip, red cone onto the bed
  const lk = sm(T.box, T.lens, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  const cd = sm(T.sees - 0.1, T.whole, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  coneD.set(LENS, ROOMC, 1.3, 0.16 * cd);
  roomRed.set(0.8 * cd);
  const pulse = 0.75 + 0.25 * Math.sin(t * 9);
  lensMat.color.set(RED).multiplyScalar(2.4 * lk * pulse);

  // s4: lights down, green floor spot in front of it
  floorGreen.set(sm(T.front - 0.15, T.front + 0.15, t) * (1 - sm(T.shine, T.shine + 0.3, t)));
  const dim = 1 - 0.6 * sm(T.off - 0.1, T.off + 0.3, t) + 0.4 * sm(T.s7 - 0.2, T.s7 + 0.4, t);
  for (const [l, i0] of LIGHTS) l.intensity = i0 * dim;
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (0.25 + 0.75 * dim));
  const ringK = 0.9 * sm(T.front - 0.1, T.front + 0.2, t) * (1 - sm(T.s7 - 0.2, T.s7, t));
  thRing.visible = ringK > 0.02;
  thRing.material.color.set(VIOLET).multiplyScalar(ringK);

  // flashlight
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.08, 0.07 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).addScaledVector(FWD, 0.01); spotDisk.lookAt(hp); spotDisk.material.opacity = 0.05 * on;
  spot.intensity = (t > T.s6 - 0.2 ? 0.4 : 1.0) * on;
  spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();

  // s6: glint in the strip, cross over the guest at "touch", check at "report"
  const prox = Math.exp(-tg.distanceToSquared(LENS) / 0.003) * on;
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
