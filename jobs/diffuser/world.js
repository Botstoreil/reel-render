// NEVER SKIP THE AROMA DIFFUSER (Hidden Cam 42). Built from router-check (41): same room and cameras, the router
// swapped for an aroma diffuser on a tall bedside chest left of the bed. Notes below are from 41.
// (41) Rental bedroom, a Wi-Fi router on a wall shelf left of the bed.
// Built from the wall-speaker reel (40, 2 review rounds): same room, same cameras, the speaker swapped for a flat
// router with two antennas and a row of blinking blue status lights; the lens is a dark dot right of the lights.
// s1 guest walks in. s2 green check at "password", red cross at "nobody". s3 close: red lens, then a wide red cone
// over the bed. s6: the status lights blink, the glint stays steady.
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
  s2: S.s2[0], temp: g("s2", "decor"), never: g("s2", "nobody"),
  s3: S.s3[0], small: g("s3", "hidden"), box: g("s3", "built"), lens: g("s3", "diffusers"), sees: g("s3", "aimed"), whole: g("s3", "bed"),
  s4: S.s4[0], off: g("s4", "off"), stand: g("s4", "stand"), front: g("s4", "front"),
  s5: S.s5[0], shine: g("s5", "shine"), flashlight: g("s5", "flashlight"), slowly: g("s5", "slowly"), side: g("s5", "side"),
  s6: S.s6[0], glint: g("s6", "glint"), status: g("s6", "status"), touch: g("s6", "touch"), photo: g("s6", "photo"), report: g("s6", "report"),
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

// ---------- the aroma diffuser: on a tall bedside chest left of the bed. White cylinder + dome, a dark front band
// with ONE blue status light; the lens is a dark dot in the band under it. Soft mist rises from the top.
// DET = the front point of the diffuser body (cylinder centre is 0.1 behind it).
const DET = V3(-2.1, 1.36, -2.74);
const R0 = 0.1, DH = 0.16;
scene.add(box(0.5, 1.28, 0.34, -2.1, 0.64, -2.72, mat(0x8a6a48, 0.16)));           // tall bedside chest
scene.add(box(0.44, 0.012, 0.005, -2.1, 0.95, -2.549, mat(0x5c3d22, 0.2), false)); // drawer line
scene.add(box(0.44, 0.012, 0.005, -2.1, 0.55, -2.549, mat(0x5c3d22, 0.2), false));
const th = new THREE.Group(); th.position.copy(DET); scene.add(th);
{ const c = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 0.82, R0, DH, 40), mat(0xe8e4ff, 0.14)); c.position.set(0, 0, -R0); th.add(c); }
{ const d = new THREE.Mesh(new THREE.SphereGeometry(R0 * 0.82, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf4f0ff, 0.16)); d.position.set(0, DH / 2, -R0); th.add(d); }
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 0.93, R0 * 0.965, 0.05, 40, 1, true), mat(0x15123f, 0.06)); b.position.set(0, -0.02, -R0 + 0.001); th.add(b); }
const mLed = glow(0x6ad0ff, 1.0); const LEDS = [mLed];
th.add(box(0.03, 0.008, 0.004, 0, 0.02, 0.004, mLed, false));
// mist: soft rising puffs over the top
const mMist = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(0.5), toneMapped: false, transparent: true, opacity: 0.12, depthWrite: false });
const MIST = [0, 1, 2, 3].map((i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05 + i * 0.012, 14, 10), mMist); th.add(m); return m; });
// highlight frame (violet) hugging the front of the diffuser in s4-s6 (in front of it, hidden until it lights)
const thRing = new THREE.Group(); th.add(thRing);
const mRing = glow(VIOLET, 0.0);
const RW = 2 * R0 + 0.06, RH = DH + R0 * 0.82 + 0.06, RY = 0.03;
for (const [w, h, x, y] of [[RW, 0.012, 0, RY + RH / 2], [RW, 0.012, 0, RY - RH / 2], [0.012, RH, RW / 2, RY], [0.012, RH, -RW / 2, RY]])
  thRing.add(box(w, h, 0.004, x, y, 0.02, mRing, false));
thRing.material = mRing;
const LENS = DET.clone().add(V3(0, -0.025, 0.004));
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
// r2: the sweep stays left of the lens (it reached x 0.17 and the glint fired during "slowly", before s6)
const FL = DET.clone().add(V3(-0.17, 0.06, 0.03)), FR = DET.clone().add(V3(-0.09, 0.08, 0.03));
const TK = [
  [T.shine, FL], [T.slowly, FR], [T.side + 0.15, FL], [T.s6 - 0.35, FR], [T.s6 + 0.05, LENS], [T.s7, LENS],
];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("NEVER SKIP THE AROMA DIFFUSER");
cap("s2", "decor", "JUST DECOR?", RED);
cap("s2", "nobody", "NOBODY LOOKS TWICE", RED, { boom: 0.3 });
cap("s3", "hidden", "HIDDEN CAMERAS", RED, { boom: 0.4 });
cap("s3", "built", "BUILT INTO DIFFUSERS", RED);
cap("s3", "aimed", "AIMED AT THE BED", RED);
cap("s4", "off", "LIGHTS OFF", GREEN, { boom: 0.3 });
cap("s4", "stand", "STAND IN FRONT", GREEN);
cap("s5", "flashlight", "FLASHLIGHT ON IT", VIOLET, { boom: 0.3 });
cap("s5", "slowly", "SLOWLY, FROM THE SIDE", GREEN);
cap("s6", "status", "NOT A STATUS LED", VIOLET, { boom: 0.4 });
cap("s6", "touch", "DON'T TOUCH IT", GREEN);
cap("s6", "photo", "TAKE A PHOTO", GREEN);
cap("s6", "report", "REPORT IT", GREEN);
endCard([["CHECK THE DIFFUSER", 1], ["EVERY STAY", 1]]);

// ---------- shots: [camX, camY, camZ, lookX, lookY, lookZ, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const CLOSE = st([-1.75, 1.42, -1.3, -2.08, 1.42, -2.92, 40], [-1.8, 1.42, -1.5, -2.08, 1.42, -2.92, 40]);
const SH = [
  // hook: guest walks in, camera pushes toward the thermostat
  { at: 0, K: [[0, [0.2, 2.1, 4.6, -1.0, 1.4, -2.2, 52]], [2.2, [-0.3, 2.0, 3.6, -1.2, 1.4, -2.4, 52]]] },
  // s2: the back wall: thermostat and the bed
  { at: T.s2, K: st([-2.3, 1.7, 1.4, -1.5, 1.3, -2.6, 50], [-2.25, 1.68, 1.1, -1.5, 1.3, -2.6, 50]) },
  // s3 "small box": close on the thermostat, the lens in the hole
  { at: T.small - 0.1, K: CLOSE },
  // "sees the whole room": wide from the right front, the red cone fills the room
  { at: T.sees - 0.1, K: st([2.8, 2.6, 2.2, -0.8, 1.0, -1.2, 56], [2.6, 2.7, 1.9, -0.8, 1.0, -1.2, 56]) },
  // s4: from the right front, lights go down, guest walks to stand in front of it
  { at: T.s4, K: st([1.6, 1.8, 1.8, -1.4, 1.2, -1.9, 52], [1.45, 1.8, 1.55, -1.4, 1.2, -1.9, 52]) },
  // s5: behind and right of the guest, beam onto the thermostat
  { at: T.s5, K: st([0.4, 1.8, -0.5, -1.9, 1.4, -2.9, 50], [0.25, 1.8, -0.7, -1.9, 1.4, -2.9, 50]) },
  // "slowly": close on the thermostat FROM ITS LEFT (r3: the CLOSE camera sat behind the guest, whose body filled the frame)
  // wall-clock r2: pulled back to the s3 CLOSE distance (~1.6 m) - the round clock is bigger than the thermostat and
  // filled the top, so the violet s6 caption sat on the white face and could not be read
  // router r2: look target moved right onto the lens (the glint sat cut at the frame edge)
  { at: T.slowly - 0.1, K: st([-3.0, 1.5, -1.55, -1.98, 1.4, -2.85, 40], [-2.92, 1.48, -1.7, -1.98, 1.4, -2.85, 40]) },
  // s6 "touch": side view of the guest, phone up
  { at: T.touch - 0.1, K: st([0.6, 1.7, -0.3, -1.7, 1.5, -2.3, 54], [0.5, 1.72, -0.5, -1.7, 1.5, -2.3, 54]) },
  // s7-s8: calm wide
  { at: T.s7 - 0.15, calm: 1, K: [[0, [0.0, 2.5, 4.2, -0.6, 0.8, -1.8, 52]], [5, [0.0, 2.6, 4.8, -0.6, 0.8, -1.8, 52]]] },
];

run("diffuser", (t) => {
  // router status lights blink the whole reel (each its own rhythm); the lens never blinks
  LEDS.forEach((m, i) => m.color.set(0x6ad0ff).multiplyScalar(0.55 + 0.45 * Math.sin(t * 2.2)));
  MIST.forEach((m, i) => { const f = (t * 0.35 + i / 4) % 1; m.position.set(0.02 * Math.sin(t + i), DH / 2 + R0 * 0.7 + f * 0.35, -R0); m.scale.setScalar(0.6 + f * 1.6); });
  mMist.opacity = 0.1;
  // guest: walk in (s1), wait (s2-s3), walk to stand in front of the thermostat (s4), flashlight (s5-s6)
  const w = walkPath(START, SPOT1, 0.05, tArr, t);
  const go = walkPath(SPOT1, STAND, T.stand - 0.2, T.s5 - 0.1, t);
  let x = w.x, z = w.z, h = w.walk > 0.01 ? w.h : face(SPOT1, [DET.x, DET.z]), walk = w.walk;
  if (t > T.stand - 0.2) { x = go.x; z = go.z; walk = go.walk; h = t < T.s5 - 0.1 ? go.h : face(STAND, [DET.x, DET.z]); }
  const on = sm(T.shine - 0.2, T.shine + 0.1, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  P.set({ x, z, h, walk, t, vis: true, phone: on });

  // s2: check on the temperature, cross at "never"
  const s2k = 1 - sm(T.s3 - 0.1, T.s3 + 0.2, t);
  const icTop = DET.clone().add(V3(0, 0.44, 0.1));
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
  // r2: the frame is in front of the speaker (the clock's ring hid behind the face) - at zero it drew as a black box in s3
  const ringK = 0.9 * sm(T.front - 0.1, T.front + 0.2, t) * (1 - sm(T.s7 - 0.2, T.s7, t));
  thRing.visible = ringK > 0.02;
  thRing.material.color.set(VIOLET).multiplyScalar(ringK);

  // flashlight
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.1, 0.07 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).add(V3(0, 0, 0.03)); spotDisk.lookAt(hp); spotDisk.material.opacity = 0.05 * on; // r2: at 0.14 it read as a grey card beside the router in the side close-up
  spot.intensity = (t > T.s6 - 0.2 ? 0.4 : 1.0) * on;
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
