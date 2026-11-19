// NEVER ROUND YOUR BACK (YogaFlow). Downward dog on a mat, seen from the side.
// s1 person in down dog, legs locked, on "round" the upper back humps up (red arc over the back).
// s2 red straight legs + red arc: "pull your back into a curve". s3 shoulders sink, red ring on the shoulders, head hangs.
// s4 knees bend (green knee dots). s5 hips lift up and back, the spine straightens: green line hip -> shoulder -> hand.
// s6 heels hover above the floor (violet gap marks), the green spine line pulses. s7-s8 calm wide.
// The person is posed by hand with two-bone IK in the side plane (y, z); hands at -z, feet at +z.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  round: g("s1", "round"), legs1: g("s1", "legs"),
  s2: S.s2[0], locked: g("s2", "locked"), pull: g("s2", "pull"), curve: g("s2", "curve"),
  s3: S.s3[0], drops: g("s3", "drops"), shoulders: g("s3", "shoulders"), struggle: g("s3", "struggle"),
  s4: S.s4[0], bend: g("s4", "bend"), knees: g("s4", "knees"),
  s5: S.s5[0], lift: g("s5", "lift"), hips: g("s5", "hips"), back: g("s5", "back"), spine: g("s5", "spine"), long: g("s5", "long"),
  s6: S.s6[0], heels: g("s6", "heels"), floor: g("s6", "floor"), longb: g("s6", "long"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a block, a plant ----------
scene.add(box(0.72, 0.012, 2.3, 0, 0.006, -0.05, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.3, 0.36, 0.014, -0.05, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.3, -0.36, 0.014, -0.05, glow(VIOLET, 1.4), false));
scene.add(box(0.15, 0.12, 0.23, -0.75, 0.06, -1.3, mat(0x8a7cff, 0.3)));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.3, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.3, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.05); floorGlow.set(0.6);

// ---------- the person ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const Lsh = spine.children[2], Rsh = spine.children[3];
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion();
const TORSO = 0.56, ARM = 0.62, THIGH = 0.45, SHIN = 0.46;
const HIP = V3(0, 0, 0), SHO = V3(0, 0, 0), HAND = V3(0, 0.06, -0.62), KNEE = V3(0, 0, 0), FOOT = V3(0, 0, 0), d = V3(0, 0, 0);
// two-bone IK in the y-z plane: middle joint of a chain root -> target with lengths a, b; side = which way it bends
function ik(R, Tg, a, b, side, out) {
  const dz = Tg.z - R.z, dy = Tg.y - R.y, L0 = Math.hypot(dz, dy);
  const L = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, L0));
  const uz = dz / L0, uy = dy / L0, ca = (a * a + L * L - b * b) / (2 * a * L), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  // n = u turned +90deg in (z, y): (-uy, uz)
  out.set(R.x, R.y + a * (uy * ca + side * uz * sa), R.z + a * (uz * ca - side * uy * sa));
  return out;
}
// k: 0 = rounded back + locked legs (wrong), 1 = knees bent, hips up and back, long spine (right); bend: knee bend 0..1
function pose(k, bend, sink, t) {
  const br = 0.012 * Math.sin(t * 1.6);
  // hips: low and tucked when wrong, up and back when right
  HIP.set(0, 0.8 + 0.1 * k + br, -0.02 + 0.2 * k);
  hips.position.set(0, HIP.y, HIP.z);
  // feet: flat when legs are locked, heels lifted when the knees bend
  FOOT.set(0, 0.06 + 0.07 * bend, 0.56 - 0.14 * bend);
  // torso + straight arm to the hand: rounded = the middle (shoulders) humps up; sink pulls the shoulders toward the floor
  ik(HIP, HAND, TORSO, ARM, -1, SHO);
  SHO.y -= 0.05 * sink;
  d.subVectors(SHO, HIP).normalize(); spine.quaternion.setFromUnitVectors(UP, d);
  // arms: straight from the shoulder to the hand
  qs.copy(spine.quaternion).invert();
  d.subVectors(HAND, SHO).normalize(); qb.setFromUnitVectors(DOWN, d);
  for (const sh of [Lsh, Rsh]) { sh.quaternion.copy(qs).multiply(qb); sh.children[1].rotation.set(0, 0, 0); }
  // legs: hip -> knee -> foot, knees bend toward the hands (-z); locked = straight line
  // (locked: the foot is at full reach, so the IK gives a straight leg)
  ik(HIP, FOOT, THIGH, SHIN, -1, KNEE);
  d.subVectors(KNEE, HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  const dShin = V3(0, 0, 0).subVectors(FOOT, KNEE).normalize(); qb.setFromUnitVectors(DOWN, dShin);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) {
    th.quaternion.copy(qa);
    kn.quaternion.copy(qa).invert().multiply(qb);
  }
  // head: in line with the arms when right, hanging when wrong
  P.head.rotation.set(-0.5 * (1 - k) - 0.25 * sink, 0, 0);
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
// red arc over the rounded back (a short polyline of beams through hip -> hump -> shoulder)
const arcN = 8, arc = Array.from({ length: arcN }, () => beam(RED, 2.4, 0.03));
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), MID = V3(0, 0, 0);
const legLine = beam(RED, 2.2, 0.03);
const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.012, 8, 40), ringMat); scene.add(ring);
const spineLine = beam(GREEN, 2.0, 0.026), armLine = beam(GREEN, 2.0, 0.026);
spineLine.material.depthTest = armLine.material.depthTest = false; spineLine.renderOrder = armLine.renderOrder = 20;
const dotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
const kneeDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), dotMat); kneeDot.renderOrder = 21; scene.add(kneeDot);
const gapMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0 });
const gap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.012, 0.05), gapMat); scene.add(gap);
const OFF = V3(0.32, 0, 0); // guides float just in front of the body, on the camera side

// ---------- text ----------
title("NEVER ROUND YOUR BACK");
cap("s2", "locked", "LOCKED LEGS", RED);
cap("s2", "curve", "BACK CURVES", RED, { boom: 0.3 });
cap("s3", "shoulders", "WEIGHT IN SHOULDERS", RED);
cap("s3", "struggle", "A STRUGGLE", RED);
cap("s4", "bend", "BEND YOUR KNEES", GREEN);
cap("s5", "lift", "HIPS UP AND BACK", GREEN);
cap("s5", "spine", "LONG SPINE", VIOLET, { boom: 0.3 });
cap("s6", "heels", "HEELS CAN LIFT", VIOLET);
cap("s6", "long", "LONG BACK FIRST", GREEN);
endCard([["BEND THE KNEES", 1], ["KEEP THE SPINE LONG", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, hands toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: wide side view, the whole pose
  // (round 2: pulled back and centred on the body; round 1 cut the head and hands off the right edge)
  { at: 0, K: [[0, [4.5, 1.1, -0.2, 0, 0.35, -0.2, 46]], [2.0, [4.2, 1.05, -0.2, 0, 0.35, -0.2, 46]]] },
  // "round": closer on the back, slightly above it, head and hands inside the frame
  { at: T.round - 0.15, K: st([3.0, 1.4, -0.3, 0, 0.5, -0.3, 44], [2.85, 1.35, -0.3, 0, 0.5, -0.3, 44]) },
  // s2: legs, from the feet side, three-quarter
  { at: T.s2, K: st([2.2, 0.75, 1.6, 0, 0.35, 0.1, 46], [2.0, 0.75, 1.5, 0, 0.35, 0.1, 46]) },
  { at: T.curve - 0.15, K: st([3.0, 1.4, -0.3, 0, 0.5, -0.3, 44], [2.85, 1.35, -0.3, 0, 0.5, -0.3, 44]) },
  // s3: from the hands side, low, the shoulders sinking toward the floor
  { at: T.s3, K: st([2.0, 0.55, -1.7, 0, 0.35, -0.35, 46], [1.85, 0.52, -1.6, 0, 0.35, -0.35, 46]) },
  { at: g("s3", "pose") - 0.1, K: st([3.4, 1.0, 0.15, 0, 0.32, -0.14, 46], [3.2, 0.98, 0.1, 0, 0.32, -0.14, 46]) },
  // s4: legs, three-quarter from behind the feet, the knees bend
  { at: T.s4, K: st([2.2, 0.75, 1.6, 0, 0.35, 0.1, 46], [2.05, 0.75, 1.5, 0, 0.35, 0.1, 46]) },
  // s5: wide side, hips lift, green spine line
  { at: T.s5, K: st([3.4, 1.05, 0.15, 0, 0.36, -0.14, 46], [3.1, 1.0, 0.1, 0, 0.36, -0.14, 46]) },
  // s6: the feet, heels hovering
  // (round 2: straight side view of the feet so the heel gap reads; round 1 sat behind the legs)
  { at: T.s6, K: st([2.1, 0.32, 0.45, 0, 0.22, 0.4, 34], [1.95, 0.32, 0.42, 0, 0.22, 0.4, 34]) },
  { at: T.longb - 0.15, K: st([3.3, 1.0, 0.15, 0, 0.36, -0.14, 46], [3.15, 1.0, 0.1, 0, 0.36, -0.14, 46]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.6, 0.2, 0, 0.9, -0.05, 48]], [5, [4.0, 1.75, 0.2, 0, 0.95, -0.05, 48]]] },
];

run("down-dog-back", (t) => {
  // wrong -> right
  const k = sm(T.lift - 0.05, T.back + 0.1, t);
  const bend = sm(T.bend - 0.05, T.knees + 0.25, t);
  const sink = sm(T.drops - 0.1, T.shoulders + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  // before "round" the pose is neutral-ish (a little rounded), on "round" it humps fully
  P.set({ t });
  pose(k, bend, sink, t);

  // wrong: red arc over the back, red locked legs, red ring on the shoulders
  const wr = sm(T.round - 0.05, T.round + 0.25, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.25, t));
  A0.copy(HIP).add(OFF); A1.copy(SHO).add(OFF);
  // hump: the arc bulges up away from the hip-shoulder line
  const len = A0.distanceTo(A1), hump = 0.09 * (1 - k) * (0.9 + 0.3 * flash(t, T.curve));
  const prev = V3(0, 0, 0), cur = V3(0, 0, 0);
  for (let i = 0; i < arcN; i++) {
    const u0 = i / arcN, u1 = (i + 1) / arcN;
    prev.lerpVectors(A0, A1, u0); prev.y += hump * Math.sin(Math.PI * u0) + 0.08;
    cur.lerpVectors(A0, A1, u1); cur.y += hump * Math.sin(Math.PI * u1) + 0.08;
    arc[i].set(prev, cur, wr * (0.85 + 0.15 * Math.sin(t * 8)));
  }
  const lg = sm(T.locked - 0.1, T.locked + 0.15, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t));
  MID.copy(HIP).add(OFF); A0.copy(FOOT).add(OFF);
  legLine.set(MID, A0, lg);
  const rg = sm(T.shoulders - 0.1, T.shoulders + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  ring.position.copy(SHO).add(OFF); ring.lookAt(ring.position.x + 1, ring.position.y, ring.position.z);
  ringMat.opacity = rg * (0.6 + 0.4 * Math.sin(t * 9)); ring.scale.setScalar(1 + 0.3 * flash(t, T.struggle));

  // right: knee dot, then the long spine line hip -> shoulder -> hand
  kneeDot.position.copy(KNEE).add(OFF);
  dotMat.opacity = sm(T.knees - 0.1, T.knees + 0.15, t) * (1 - sm(T.s5 + 0.3, T.s5 + 0.6, t));
  kneeDot.visible = dotMat.opacity > 0.01;
  // (off during the heels close-up, it blew out the frame in round 1)
  const ok = sm(T.spine - 0.15, T.spine + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.3, t)) * (1 - sm(T.s6 - 0.12, T.s6, t) * (1 - sm(T.longb - 0.15, T.longb + 0.05, t)));
  const okA = ok * (0.85 + 0.4 * flash(t, T.long) + 0.4 * flash(t, T.longb));
  A0.copy(HIP).add(OFF); A1.copy(SHO).add(OFF); MID.copy(HAND).add(OFF);
  spineLine.set(A0, A1, okA); armLine.set(A1, MID, okA);
  // heels: a violet bar under the lifted heel
  gap.position.set(0.12, 0.02, FOOT.z + 0.08);
  gapMat.opacity = sm(T.heels - 0.1, T.heels + 0.15, t) * (1 - sm(T.longb - 0.2, T.longb, t)) * (0.75 + 0.25 * Math.sin(t * 8));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
