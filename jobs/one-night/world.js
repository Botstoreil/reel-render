// NEVER SKIP THE CHECK FOR ONE NIGHT (Hidden Cam). Hotel room with a glass shower on the left.
// s1 guest walks in with a small suitcase. s2 drops it, sits on the bed: "IT'S ONE NIGHT" bubble (red).
// s3 the smoke detector over the bed has a lens: red lens, red view cone onto the bed. s4 guest stands, clock icon,
// suitcase stays shut (green check). s5 green patch on the bed, then on the shower, then the flashlight sweeps the
// back wall. s6 the beam hits the detector lens: glint. Guest lifts the phone to the ear (call the front desk).
// s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip, icon, pop, bubble, say } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], think: g("s2", "think"), short: g("s2", "short"),
  s3: S.s3[0], all: g("s3", "all"), camera: g("s3", "camera"),
  s4: S.s4[0], five: g("s4", "five"), before: g("s4", "before"), unpack: g("s4", "unpack"),
  s5: S.s5[0], faces: g("s5", "faces"), bed: g("s5", "bed"), shower: g("s5", "shower"), sweep: g("s5", "sweep"),
  s6: S.s6[0], glint: g("s6", "glint"), call: g("s6", "call"), desk: g("s6", "desk"), room: g("s6", "room"),
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
door(2.9, -2.9, 0);
scene.add(box(10, 0.05, 0.06, 0, 3.17, -2.9, glow(0x8a80ff, 0.9), false)); // ceiling trim
scene.add(box(10, 0.04, 0.04, 0, 0.04, -2.9, glow(0x8a80ff, 0.6), false)); // skirting

// ---------- glass shower on the left: tray, two glass panels, a shower head ----------
const SHX = -3.0, SHZ = -2.2;
scene.add(box(1.4, 0.08, 1.4, SHX, 0.04, SHZ, mat(0xd8d4ff, 0.3)));
const mGlass = new THREE.MeshStandardMaterial({ color: 0x9fb4ff, emissive: 0x3a4aa0, transparent: true, opacity: 0.28, roughness: 0.1, depthWrite: false });
scene.add(box(1.4, 2.1, 0.02, SHX, 1.13, SHZ + 0.7, mGlass, false), box(0.02, 2.1, 1.4, SHX + 0.7, 1.13, SHZ, mGlass, false));
scene.add(box(1.42, 0.03, 0.03, SHX, 2.19, SHZ + 0.7, glow(0xb8c4ff, 1.2), false), box(0.03, 0.03, 1.42, SHX + 0.7, 2.19, SHZ, glow(0xb8c4ff, 1.2), false));
scene.add(tube([SHX, 2.3, -2.9], [SHX, 2.3, -2.6], 0.025, mat(0xd8d4ff, 0.3)));
scene.add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.04, 20), mat(0xf0eeff, 0.4)).translateX(SHX).translateY(2.27).translateZ(-2.55));

// ---------- the suitcase ----------
const suit = new THREE.Group(); scene.add(suit);
suit.add(box(0.42, 0.55, 0.2, 0, 0.3, 0, mat(0xff8a3d, 0.3)));
suit.add(box(0.2, 0.03, 0.03, 0, 0.6, 0, mat(0x15123f), false));
for (const x of [-0.14, 0.14]) suit.add(tube([x, 0.58, 0], [x, 0.6, 0], 0.015, mat(0x15123f)));
const SUIT_AT = V3(-1.25, 0, -0.55);

// ---------- the smoke detector high over the bed, a lens inside ----------
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
function glint(P) {
  const gq = new THREE.Group(); gq.position.copy(P).add(V3(0, 0, 0.03)); scene.add(gq);
  gq.add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.46, 0.002), mGl));
  gq.visible = false; return gq;
}
const DET = V3(0, 2.7, -2.92);
const det = new THREE.Group(); det.position.copy(DET); scene.add(det);
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 40), mat(0xf0eeff, 0.35)); body.rotation.x = Math.PI / 2; det.add(body);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 8, 40), glow(VIOLET, 1.6)); ring.position.z = 0.036; det.add(ring);
for (let i = -2; i <= 2; i++) det.add(box(0.14, 0.012, 0.004, -0.04, i * 0.035, 0.037, glow(0x2a2660, 1), false));
const LENS = DET.clone().add(V3(0.09, -0.07, 0.04));
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
{ const l = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), lensMat); l.position.copy(LENS); scene.add(l); }
const glD = glint(LENS);

// ---------- cones and patches ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const BEDC = V3(0, 0.6, -1.6);
const coneD = cone(RED, 1.0);
const bedRed = patch(1.6, 1.7, RED, 1.2); bedRed.position.set(0, 0.65, -1.75);
const bedGreen = patch(1.6, 1.7, GREEN, 1.2); bedGreen.position.set(0, 0.66, -1.75);
const showerGreen = patch(1.3, 1.3, GREEN, 1.2); showerGreen.position.set(SHX, 0.1, SHZ);
const beamCone = cone(WHITE, 0.9);
const spotDisk = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
spotDisk.renderOrder = 7; scene.add(spotDisk);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- icons and bubble ----------
const icClock = icon("clock", GREEN, { size: 0.55 });
const icCheck = icon("check", GREEN, { size: 0.45 });
const icCross = icon("cross", RED, { size: 0.45 });
const bub = bubble("IT'S ONE NIGHT", RED, { size: 1.0 });

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const handle = P.hold(new THREE.Group(), -1);
const START = [2.9, 1.2], SPOT1 = [-0.75, -0.35]; // walks in from the door side, stops at the foot of the bed
const SIT = [-0.55, -0.75];
const tArr = S.s1[0] + 2.3;
const tSit0 = T.think - 0.3, tSit1 = T.think + 0.3, tUp0 = T.s4 - 0.1, tUp1 = T.s4 + 0.35;
const STAND2 = [0.2, 0.4];
const hp = V3(0, 0, 0);

// flashlight path (s5 sweep -> s6 hits the lens)
const WL = V3(-2.4, 1.5, -2.93), WR = V3(2.2, 1.6, -2.93);
const TK = [
  [T.sweep - 0.1, WL], [T.sweep + 0.6, V3(-0.6, 2.1, -2.93)], [T.s6 - 0.15, LENS], [T.s7, LENS],
];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("ONE NIGHT? NEVER SKIP THE CHECK");
cap("s2", "short", "TOO SHORT TO BOTHER?", RED);
cap("s3", "all", "ONE NIGHT IS ENOUGH", RED, { boom: 0.4 });
cap("s3", "camera", "FOR A HIDDEN CAMERA", RED);
cap("s4", "five", "ABOUT 5 MINUTES", GREEN, { boom: 0.3 });
cap("s4", "before", "BEFORE YOU UNPACK", GREEN);
cap("s5", "faces", "WHAT FACES THE BED", GREEN);
cap("s5", "shower", "AND THE SHOWER", GREEN);
cap("s5", "sweep", "FLASHLIGHT SWEEP", VIOLET, { boom: 0.3 });
cap("s6", "glint", "SEE A GLINT?", WHITE, { boom: 0.4 });
cap("s6", "call", "CALL THE FRONT DESK", GREEN);
cap("s6", "room", "ASK FOR A NEW ROOM", GREEN);
endCard([["ONE NIGHT", 1], ["FIVE MINUTES", 1]]);

// ---------- shots: [camX, camY, camZ, lookX, lookY, lookZ, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: guest walks in with the suitcase
  { at: 0, K: [[0, [0.6, 2.2, 4.6, 0, 1.3, -1.6, 52]], [2.5, [0.3, 2.1, 3.9, -0.3, 1.25, -1.6, 52]]] },
  // s2: sits on the bed, suitcase dropped, bubble
  // round 2: further back + lower look so the bubble sits mid-frame, under the top caption
  { at: T.s2, K: st([1.9, 1.5, 2.6, -0.5, 1.25, -0.9, 50], [1.75, 1.5, 2.3, -0.5, 1.25, -0.9, 50]) },
  // s3: wide three-quarter, the detector sees the bed
  { at: T.s3, K: st([2.8, 2.5, 1.6, 0, 1.7, -1.9, 54], [2.6, 2.6, 1.3, 0, 1.8, -1.9, 54]) },
  // "camera": close on the lens
  { at: T.camera - 0.1, K: st([0.35, 2.45, -1.7, 0.05, 2.65, -2.9, 36], [0.3, 2.48, -1.9, 0.06, 2.65, -2.9, 34]) },
  // s4: guest stands, clock + closed suitcase
  // round 2: from the left-front, so the guest (standing at 0.2, 0.4) never walks into the lens
  { at: T.s4, K: st([-2.4, 1.8, 2.4, -0.4, 1.1, -0.2, 52], [-2.25, 1.8, 2.15, -0.4, 1.1, -0.2, 52]) },
  // s5 "faces the bed": over the bed
  { at: T.faces - 0.1, K: st([1.8, 2.6, 0.9, 0, 0.6, -1.8, 50], [1.6, 2.7, 0.7, 0, 0.6, -1.8, 50]) },
  // "shower": the glass shower
  { at: T.shower - 0.1, K: st([-1.2, 1.9, 0.6, -3.0, 1.0, -2.2, 50], [-1.35, 1.85, 0.4, -3.0, 1.0, -2.2, 50]) },
  // "sweep": behind the guest, beam on the back wall
  { at: T.sweep - 0.1, K: st([1.0, 1.8, 2.8, -0.3, 1.8, -2.9, 58], [0.9, 1.8, 2.5, -0.2, 1.9, -2.9, 58]) },
  // s6 "glint": close on the detector
  { at: T.s6, K: st([0.35, 2.45, -1.6, 0.05, 2.65, -2.9, 38], [0.3, 2.48, -1.8, 0.06, 2.65, -2.9, 36]) },
  // "call the front desk": front three-quarter on the guest
  { at: T.call - 0.1, K: st([1.4, 1.6, -1.2, 0.2, 1.45, 0.4, 48], [1.3, 1.62, -1.05, 0.2, 1.45, 0.4, 48]) },
  // s7-s8: calm wide
  { at: T.s7 - 0.15, calm: 1, K: [[0, [0.3, 2.4, 4.2, -0.5, 0.9, -1.8, 52]], [5, [0.3, 2.5, 4.8, -0.5, 0.9, -1.8, 52]]] },
];

run("one-night", (t) => {
  // guest: walk in, sit on the bed (s2-s3), stand up (s4), sweep (s5), call (s6)
  const w = walkPath(START, SPOT1, 0.05, tArr, t);
  const toSit = walkPath(SPOT1, SIT, tArr + 0.1, tSit0, t);
  const up = walkPath(SIT, STAND2, tUp0, tUp1 + 0.6, t);
  let x = w.x, z = w.z, h = w.h, walk = w.walk;
  if (t > tArr + 0.1) { x = toSit.x; z = toSit.z; h = toSit.h; walk = toSit.walk; }
  const sitK = sm(tSit0, tSit1, t) * (1 - sm(tUp0, tUp1, t));
  if (t > tSit0) h = face(SIT, [0, 2]) + Math.PI * 0; // sits facing the room (+z side) so the bed is behind
  if (t > tUp0) { x = up.x; z = up.z; walk = up.walk; h = t < tUp1 + 0.6 ? up.h : face(STAND2, [0, -2.9]); }
  const on = sm(T.sweep - 0.3, T.sweep, t) * (1 - sm(T.call - 0.3, T.call, t));
  const callK = sm(T.call - 0.2, T.call + 0.2, t) * (1 - sm(T.s7 + 0.3, T.s7 + 0.8, t));
  P.set({ x, z, h, walk, t, vis: true, sit: sitK, shrug: sm(T.short - 0.4, T.short, t) * (1 - sm(T.s3, T.s3 + 0.3, t)), phone: Math.max(on, sm(T.s5 - 0.2, T.s5 + 0.2, t) * (1 - sm(T.call, T.call + 0.2, t)), callK) });

  // suitcase: in the left hand until s2, then set down beside the bed and stays shut
  const dropK = sm(tArr - 0.2, tArr + 0.1, t);
  if (dropK < 1) { handle.updateWorldMatrix(true, false); handle.getWorldPosition(hp); suit.position.set(hp.x, Math.max(0, hp.y - 0.62), hp.z); suit.rotation.y = h; }
  if (dropK >= 1) { suit.position.copy(SUIT_AT); suit.rotation.y = 0.3; }

  // s2 bubble, s3 camera
  say(bub, P, sm(T.think - 0.1, T.think + 0.2, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t)), 0.45, 0.7);
  const cd = sm(T.s3 - 0.05, T.all + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  coneD.set(LENS, BEDC, 0.95, 0.22 * cd);
  bedRed.set(cd);
  const pulse = 0.75 + 0.25 * Math.sin(t * 9);
  lensMat.color.set(RED).multiplyScalar(2.2 * cd * pulse);

  // s4: clock above the guest, suitcase shut (cross at "unpack" means: don't open it yet)
  const top = P.top(0.55);
  pop(icClock, top, sm(T.five - 0.1, T.five + 0.25, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.2, t)));
  pop(icCross, V3(SUIT_AT.x, 0.95, SUIT_AT.z), sm(T.unpack - 0.1, T.unpack + 0.25, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.2, t)));

  // s5: what faces the bed, the shower
  bedGreen.set(sm(T.bed - 0.15, T.bed + 0.15, t) * (1 - sm(T.sweep - 0.1, T.sweep + 0.2, t)));
  showerGreen.set(sm(T.shower - 0.15, T.shower + 0.15, t) * (1 - sm(T.sweep - 0.1, T.sweep + 0.2, t)));

  // flashlight
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.22, 0.13 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).add(V3(0, 0, 0.02)); spotDisk.lookAt(hp); spotDisk.material.opacity = (t > T.s6 - 0.2 ? 0.08 : 0.28) * on;
  spot.intensity = (t > T.s6 - 0.2 ? 0.8 : 3) * on; // round 2: the close lens shot blew out to white spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();

  // s6 glint on the lens, then a green check over the guest at "new room"
  const prox = Math.exp(-tg.distanceToSquared(LENS) / 0.02) * on;
  const a = 0.4 * prox * (0.75 + 0.6 * flash(t, T.glint + 0.1));
  glD.visible = a > 0.02; glD.scale.setScalar(Math.max(0.01, a * (1 + 0.15 * Math.sin(t * 17)))); glD.rotation.z = 0.3 * Math.sin(t * 1.3);
  pop(icCheck, top, sm(T.room - 0.1, T.room + 0.25, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)));

  for (const [l, i0] of LIGHTS) l.intensity = i0;
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3);

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
