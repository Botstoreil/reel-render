// NEVER SHRUG IN DOWN DOG (YogaFlow). Downward dog on a mat, seen from the side (rig from down-dog-back).
// s1 down dog, on "shoulders"/"ears" the head sinks into the shoulders (red ring on the neck).
// s2 red clamp marks either side of the squeezed neck. s3 red glow on the wrists, weight drops into the hands.
// s4 violet finger dots + green push arrow from the hands up the arms. s5 green arrow shoulders -> hips, the shoulders slide back.
// s6 the neck grows long: green line hip -> shoulder -> head. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  shoulders1: g("s1", "shoulders"), ears1: g("s1", "ears"),
  s2: S.s2[0], shrug: g("s2", "shrug"), neck2: g("s2", "neck"), squeezed: g("s2", "squeezed"),
  s3: S.s3[0], wrists: g("s3", "wrists"), weight: g("s3", "weight"),
  s4: S.s4[0], spread: g("s4", "spread"), fingers: g("s4", "fingers"), press: g("s4", "press"), away4: g("s4", "away"),
  s5: S.s5[0], draw: g("s5", "draw"), back: g("s5", "back"), hips: g("s5", "hips"),
  s6: S.s6[0], neck6: g("s6", "neck"), long: g("s6", "long"), head: g("s6", "head"), hangs: g("s6", "hangs"),
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
const HEADW = V3(0, 0, 0);
function ik(R, Tg, a, b, side, out) {
  const dz = Tg.z - R.z, dy = Tg.y - R.y, L0 = Math.hypot(dz, dy);
  const L = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, L0));
  const uz = dz / L0, uy = dy / L0, ca = (a * a + L * L - b * b) / (2 * a * L), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  out.set(R.x, R.y + a * (uy * ca + side * uz * sa), R.z + a * (uz * ca - side * uy * sa));
  return out;
}
// shrug: 0..1 the shoulders ride up to the ears (head sinks into the torso, chest drops toward the floor)
// long: 0..1 the neck lengthens, head hangs freely between the arms
function pose(shrug, long, t) {
  const br = 0.012 * Math.sin(t * 1.6);
  HIP.set(0, 0.88 + br, 0.16);
  hips.position.set(0, HIP.y, HIP.z);
  FOOT.set(0, 0.09, 0.5);
  ik(HIP, HAND, TORSO, ARM, -1, SHO);
  SHO.y -= 0.06 * shrug;
  d.subVectors(SHO, HIP).normalize(); spine.quaternion.setFromUnitVectors(UP, d);
  qs.copy(spine.quaternion).invert();
  d.subVectors(HAND, SHO).normalize(); qb.setFromUnitVectors(DOWN, d);
  for (const sh of [Lsh, Rsh]) { sh.quaternion.copy(qs).multiply(qb); sh.children[1].rotation.set(0, 0, 0); }
  ik(HIP, FOOT, THIGH, SHIN, -1, KNEE);
  d.subVectors(KNEE, HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  const dShin = V3(0, 0, 0).subVectors(FOOT, KNEE).normalize(); qb.setFromUnitVectors(DOWN, dShin);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  // head: sinks into the shoulders when shrugged, extends when long
  P.head.position.set(0, 0.66 - 0.13 * shrug + 0.05 * long, 0);
  P.head.rotation.set(-0.15 * long, 0, 0);
  P.g.updateMatrixWorld(true);
  P.head.getWorldPosition(HEADW); HEADW.y += 0.0;
}

// ---------- guides ----------
const OFF = V3(0.32, 0, 0); // guides float just in front of the body, on the camera side
const rm = (hex, k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
const ringMat = rm(RED, 2.4);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.013, 8, 40), ringMat); ring.renderOrder = 22; scene.add(ring);
const clampA = beam(RED, 2.4, 0.03), clampB = beam(RED, 2.4, 0.03);
const wristMat = rm(RED, 2.0);
const wrist = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), wristMat); wrist.renderOrder = 22; scene.add(wrist);
const fingerMat = rm(VIOLET, 2.0);
const fingers = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), fingerMat); m.renderOrder = 22; scene.add(m); return m; });
const pushLine = beam(GREEN, 2.0, 0.03), pushHeadA = beam(GREEN, 2.0, 0.03), pushHeadB = beam(GREEN, 2.0, 0.03);
const backLine = beam(GREEN, 2.0, 0.03), backHeadA = beam(GREEN, 2.0, 0.03), backHeadB = beam(GREEN, 2.0, 0.03);
const neckLine = beam(GREEN, 2.0, 0.026), spineLine = beam(GREEN, 2.0, 0.026);
for (const b of [pushLine, pushHeadA, pushHeadB, backLine, backHeadA, backHeadB, neckLine, spineLine, clampA, clampB]) { b.material.depthTest = false; b.renderOrder = 20; }
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), A2 = V3(0, 0, 0), dir = V3(0, 0, 0), nrm = V3(0, 0, 0);
// arrow from a to b (in the y-z plane, on the camera side)
function arrow(line, ha, hb, a, b, op) {
  line.set(a, b, op);
  dir.subVectors(b, a).normalize(); nrm.set(0, -dir.z, dir.y);
  A2.copy(b).addScaledVector(dir, -0.09).addScaledVector(nrm, 0.06); ha.set(b, A2, op);
  A2.copy(b).addScaledVector(dir, -0.09).addScaledVector(nrm, -0.06); hb.set(b, A2, op);
}

// ---------- text ----------
title("NEVER SHRUG IN DOWN DOG");
cap("s1", "ears", "SHOULDERS TO EARS", RED);
cap("s2", "neck", "NECK SQUEEZED", RED, { boom: 0.3 });
cap("s3", "wrists", "WRISTS OVERLOADED", RED);
cap("s4", "spread", "SPREAD FINGERS", VIOLET);
cap("s4", "press", "PRESS FLOOR AWAY", GREEN, { boom: 0.3 });
cap("s5", "draw", "SHOULDERS TO HIPS", GREEN);
cap("s6", "neck", "LONG NECK", GREEN);
cap("s6", "head", "HEAD HANGS FREE", VIOLET);
endCard([["PRESS FLOOR AWAY", 1], ["SHOULDERS DOWN", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, hands toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  { at: 0, K: [[0, [4.5, 1.1, -0.2, 0, 0.35, -0.2, 46]], [2.0, [4.2, 1.05, -0.2, 0, 0.35, -0.2, 46]]] },
  // "shoulders": closer on the shoulders and head
  { at: T.shoulders1 - 0.15, K: st([2.6, 0.75, -0.55, 0, 0.45, -0.35, 42], [2.45, 0.72, -0.55, 0, 0.45, -0.35, 42]) },
  // s2: from the hands side, low, looking at the squeezed neck
  { at: T.s2, K: st([2.0, 0.55, -1.7, 0, 0.4, -0.35, 44], [1.85, 0.52, -1.6, 0, 0.4, -0.35, 44]) },
  { at: T.squeezed - 0.15, K: st([2.5, 0.7, -0.6, 0, 0.42, -0.35, 40], [2.35, 0.68, -0.6, 0, 0.42, -0.35, 40]) },
  // s3: the hands and wrists
  { at: T.s3, K: st([2.0, 0.45, -0.9, 0, 0.12, -0.6, 38], [1.85, 0.42, -0.9, 0, 0.12, -0.6, 38]) },
  // s4: hands close, then side view of the arms for the push arrow
  { at: T.s4, K: st([1.9, 0.5, -0.95, 0, 0.12, -0.6, 38], [1.8, 0.48, -0.95, 0, 0.12, -0.6, 38]) },
  { at: T.press - 0.15, K: st([3.2, 0.95, -0.25, 0, 0.4, -0.25, 44], [3.0, 0.92, -0.25, 0, 0.4, -0.25, 44]) },
  // s5: wide side, shoulders slide back toward the hips
  { at: T.s5, K: st([3.4, 1.05, 0.0, 0, 0.42, -0.14, 46], [3.15, 1.0, 0.0, 0, 0.42, -0.14, 46]) },
  // s6: the neck and head close, then wide
  { at: T.s6, K: st([2.6, 0.75, -0.55, 0, 0.45, -0.35, 42], [2.45, 0.72, -0.55, 0, 0.45, -0.35, 42]) },
  { at: T.head - 0.15, K: st([3.3, 1.0, 0.0, 0, 0.4, -0.14, 46], [3.15, 1.0, 0.0, 0, 0.4, -0.14, 46]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.6, 0.2, 0, 0.9, -0.05, 48]], [5, [4.0, 1.75, 0.2, 0, 0.95, -0.05, 48]]] },
];

run("shoulder-ears", (t) => {
  const shrug = sm(T.shoulders1 - 0.1, T.ears1 + 0.2, t) * (1 - sm(T.draw - 0.05, T.back + 0.2, t));
  const long = sm(T.neck6 - 0.1, T.long + 0.2, t);
  P.set({ t });
  pose(shrug, long, t);

  // wrong: red ring on the neck (s1-s2), clamp marks either side (s2), red wrists (s3)
  const wr = sm(T.ears1 - 0.1, T.ears1 + 0.15, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t));
  A0.lerpVectors(SHO, HEADW, 0.5).add(OFF);
  ring.position.copy(A0); ring.lookAt(A0.x + 1, A0.y, A0.z);
  ringMat.opacity = wr * (0.6 + 0.4 * Math.sin(t * 9)); ring.scale.setScalar(1 + 0.3 * flash(t, T.squeezed));
  const cl = sm(T.neck2 - 0.1, T.neck2 + 0.15, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t));
  const sq = 0.17 - 0.04 * flash(t, T.squeezed);
  A1.copy(A0).add(V3(0, sq, 0)); A2.copy(A0).add(V3(0, sq * 0.4, 0)); clampA.set(A1, A2, cl);
  A1.copy(A0).add(V3(0, -sq, 0)); A2.copy(A0).add(V3(0, -sq * 0.4, 0)); clampB.set(A1, A2, cl);
  const wm = sm(T.wrists - 0.1, T.wrists + 0.15, t) * (1 - sm(T.s4 - 0.05, T.s4 + 0.2, t));
  wrist.position.copy(HAND).add(V3(0.12, 0.0, 0.04));
  wristMat.opacity = wm * (0.55 + 0.35 * Math.sin(t * 9) + 0.3 * flash(t, T.weight));
  wrist.visible = wristMat.opacity > 0.01;

  // right: violet finger dots fan out (s4)
  const fo = sm(T.spread - 0.05, T.fingers + 0.1, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t));
  fingers.forEach((m, i) => { const a = (i - 2) * 0.32 * (0.4 + 0.6 * fo); m.position.set(0.12 + 0.09 * Math.sin(a), 0.03, HAND.z - 0.09 * Math.cos(a)); m.visible = fo > 0.01; });
  fingerMat.opacity = fo;
  // green push arrow: from the hands up the arm toward the hips
  const po = sm(T.press - 0.1, T.press + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  A0.copy(HAND).add(OFF).add(V3(0, 0.05, 0)); A1.lerpVectors(HAND, SHO, 0.85 + 0.1 * flash(t, T.away4)).add(OFF).add(V3(0, 0.05, 0));
  arrow(pushLine, pushHeadA, pushHeadB, A0.clone(), A1.clone(), po);
  // green arrow: shoulders back toward the hips
  const bo = sm(T.draw - 0.1, T.draw + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  A0.copy(SHO).add(OFF).add(V3(0, 0.14, 0)); A1.lerpVectors(SHO, HIP, 0.6 + 0.1 * flash(t, T.hips)).add(OFF).add(V3(0, 0.14, 0));
  arrow(backLine, backHeadA, backHeadB, A0.clone(), A1.clone(), bo);
  // long neck: green line hip -> shoulder -> head
  const lo = sm(T.long - 0.15, T.long + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.3, t));
  const loA = lo * (0.85 + 0.4 * flash(t, T.long) + 0.3 * flash(t, T.hangs));
  A0.copy(HIP).add(OFF); A1.copy(SHO).add(OFF); A2.copy(HEADW).add(OFF);
  spineLine.set(A0, A1, loA); neckLine.set(A1, A2, loA);

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
