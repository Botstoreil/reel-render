// NEVER SIT INTO YOUR KNEES (YogaFlow). Chair pose on a mat, side view from +x (the face toward -z).
// s1 standing, drops into the WRONG chair on "drop": hips high, knees far past the toes, red rings on the knees.
// s2 red ring on the high hips ("hips"), red toe line shows the knees past the toes ("forward"), knee pulse on "load".
// s3 the heels lift off the mat (foot tilts), red ring on the heel.
// s4 hips sit back on "hips" into the RIGHT chair; a ghost chair glows behind on "chair". s5 green ring on the heel
// ("heels"), the toes lift a little on "toes". s6 green toe line (knee over the foot) on "knees", green lines along
// the arms beside the ears on "arms". s7-s8 calm wide hold. Joints posed explicitly (y, z) and blended like cobra-neck.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s1: S.s1[0], pose: g("s1", "pose"), drop: g("s1", "drop"), weight1: g("s1", "weight"), knees1: g("s1", "knees"),
  s2: S.s2[0], hips2: g("s2", "hips"), high: g("s2", "high"), forward: g("s2", "forward"), load: g("s2", "load"),
  s3: S.s3[0], heels3: g("s3", "heels"), lift3: g("s3", "lift"),
  s4: S.s4[0], hips4: g("s4", "hips"), back4: g("s4", "back"), chair: g("s4", "chair"), behind: g("s4", "behind"),
  s5: S.s5[0], heels5: g("s5", "heels"), toes: g("s5", "toes"),
  s6: S.s6[0], knees6: g("s6", "knees"), feet: g("s6", "feet"), arms: g("s6", "arms"), ears: g("s6", "ears"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.8, 0.012, 2.2, 0, 0.006, 0, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.2, 0.4, 0.014, 0, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.2, -0.4, 0.014, 0, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, -1.2, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, -1.2, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, 0); floorGlow.set(0.6);

// ---------- the person ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const FEET = [LKn.children[1], RKn.children[1]];
const Lsh = spine.children[2], Rsh = spine.children[3];
const Lel = Lsh.children[1], Rel = Rsh.children[1];
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0), XA = V3(1, 0, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion(), qF = new THREE.Quaternion();
const d = V3(0, 0, 0), d2 = V3(0, 0, 0);

// key poses: [y, z] for hand, elbow, shoulder, hip, knee, foot (shin end). Built from the limb lengths (thigh 0.45,
// shin 0.46) so the feet stay on the mat: foot at z 0; the toes reach to z ~ -0.19.
const POSE = {
  stand: { HAND: [0.89, 0.0],   ELB: [1.21, 0.0],   SHO: [1.51, 0.0],   HIP: [0.95, 0.0],   KNEE: [0.5, 0.0],    FOOT: [0.04, 0.0] },
  // hips high, shins 40 deg forward (knees far past the toes), torso almost upright, arms up and forward
  wrong: { HAND: [1.9, -0.26],  ELB: [1.59, -0.18], SHO: [1.29, -0.11], HIP: [0.737, -0.007], KNEE: [0.392, -0.296], FOOT: [0.04, 0.0] },
  // hips back and low (thigh ~25 deg), shins 22 deg (knee over the toes), torso 35 deg forward, arms along the torso
  right: { HAND: [1.614, -0.463], ELB: [1.352, -0.279], SHO: [1.106, -0.107], HIP: [0.637, 0.236], KNEE: [0.467, -0.172], FOOT: [0.04, 0.0] },
};
const J = {}; for (const n of ["HAND", "ELB", "SHO", "HIP", "KNEE", "FOOT"]) J[n] = V3(0, 0, 0);
const tmp = V3(0, 0, 0);
function blend(seq) {
  for (const n in J) {
    const [y0, z0] = POSE[seq[0][0]][n]; J[n].set(0, y0, z0);
    for (let i = 1; i < seq.length; i++) { const [y, z] = POSE[seq[i][0]][n]; tmp.set(0, y, z); J[n].lerp(tmp, seq[i][1]); }
  }
}
function applyPose(t, heel, toe) {
  const br = 0.004 * Math.sin(t * 1.6);
  hips.position.set(0, J.HIP.y + br + 0.07 * heel, J.HIP.z);
  d.subVectors(J.SHO, J.HIP).normalize(); spine.quaternion.setFromUnitVectors(UP, d);
  d.subVectors(J.KNEE, J.HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.FOOT, J.KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  // feet: flat on the mat in world space; heel > 0 lifts the heel (toes stay down), toe > 0 lifts the toes a little
  qF.setFromAxisAngle(XA, -0.6 * heel + 0.22 * toe);
  for (const f of FEET) f.quaternion.copy(qb).invert().multiply(qF);
  qs.copy(spine.quaternion).invert();
  d.subVectors(J.ELB, J.SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.HAND, J.ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  P.head.quaternion.identity();
  P.g.updateMatrixWorld(true);
}

// ---------- ghost chair behind (s4) ----------
const chairM = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
const CHAIR = new THREE.Group(); scene.add(CHAIR); CHAIR.position.set(0, 0, 0.42);
CHAIR.add(box(0.5, 0.04, 0.42, 0, 0.5, 0, chairM, false));
CHAIR.add(box(0.5, 0.5, 0.04, 0, 0.75, 0.2, chairM, false));
for (const [x, z] of [[-0.22, -0.18], [0.22, -0.18], [-0.22, 0.18], [0.22, 0.18]]) CHAIR.add(box(0.04, 0.5, 0.04, x, 0.25, z, chairM, false));

// ---------- guides ----------
const OFF = V3(0.3, 0, 0); // floats on the camera side of the body
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 8, 40), m); o.rotation.y = Math.PI / 2; o.renderOrder = 21; scene.add(o); return o; };
const kneeRing = ringOf(RED, 0.09), hipRing = ringOf(RED, 0.11), heelRing = ringOf(RED, 0.07);
const heelGood = ringOf(GREEN, 0.07);
const toeLineR = beam(RED, 1.0, 0.025), toeLineG = beam(GREEN, 1.0, 0.025), hipArrow = beam(GREEN, 0.6, 0.03);
const armL = beam(GREEN, 1.0, 0.025);
const KN = V3(0, 0, 0), A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), HEEL = V3(0, 0, 0);

// ---------- text ----------
title("NEVER SIT INTO YOUR KNEES");
cap("s2", "hips", "HIPS TOO HIGH", RED);
cap("s2", "forward", "KNEES PAST TOES", RED, { boom: 0.35 });
cap("s3", "heels", "HEELS LIFT", RED, { boom: 0.3 });
cap("s4", "hips", "SIT HIPS BACK", GREEN, { boom: 0.3 });
cap("s4", "chair", "CHAIR BEHIND YOU", GREEN);
cap("s5", "heels", "WEIGHT IN HEELS", GREEN);
cap("s6", "knees", "KNEES OVER FEET", GREEN);
cap("s6", "arms", "ARMS BY EARS", GREEN);
endCard([["HIPS BACK", 1], ["WEIGHT IN YOUR HEELS", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, a little in front ----------
const st = (a, b = a) => [[0, a], [3, b]];
const WIDE = st([4.0, 1.0, -0.9, 0, 0.85, 0, 46], [3.75, 1.0, -0.85, 0, 0.85, 0, 46]);
// round 2: round 1 was far too close (visible height ~0.45 x distance): head cut in s1-s2, feet shots only shins
const FEETS = st([2.9, 0.5, -0.7, 0, 0.32, -0.05, 42], [2.75, 0.5, -0.66, 0, 0.32, -0.05, 42]);
const SH = [
  // s1: whole body below the title band, the knee ring readable
  { at: 0, K: [[0, [6.6, 1.45, -1.5, 0, 1.25, 0, 46]], [2.6, [6.1, 1.4, -1.4, 0, 1.22, 0, 46]]] },
  // s2: hips down to the feet (hip ring + toe line)
  { at: T.s2, K: st([4.3, 0.75, -0.9, 0, 0.58, 0, 44], [4.05, 0.75, -0.85, 0, 0.58, 0, 44]) },
  { at: T.s3, K: FEETS },
  // s4: whole body + the ghost chair, hands below the title band
  { at: T.s4, K: st([5.8, 1.35, -0.6, 0, 1.12, 0.1, 46], [5.5, 1.33, -0.55, 0, 1.12, 0.1, 46]) },
  { at: T.s5, K: FEETS },
  { at: T.s6, K: WIDE },
  { at: T.s7, calm: 1, K: [[0, [4.8, 1.9, -1.9, 0, 1.3, 0, 48]], [5, [5.2, 2.0, -2.0, 0, 1.3, 0, 48]]] },
];

run("chair-hips", (t) => {
  P.set({ t });
  // stand -> wrong on "drop"; -> right on "hips" (s4)
  // the drop starts on "pose" so the bad chair is already there when "knees" is said
  const kW = sm(T.pose - 0.05, T.knees1 + 0.05, t);
  const kR = sm(T.hips4 - 0.1, T.back4 + 0.25, t);
  blend([["stand", 1], ["wrong", kW], ["right", kR]]);
  const heel = sm(T.heels3 - 0.1, T.lift3 + 0.1, t) * (1 - kR);
  const toe = sm(T.toes - 0.15, T.toes + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.3, t));
  applyPose(t, heel, toe);

  // knee / heel / toe tip positions (left leg, camera side is +x)
  LKn.getWorldPosition(KN);
  HEEL.set(0, -0.48, 0.06); LKn.localToWorld(HEEL);
  const toeZ = -0.19;
  // s1-s2: red ring on the knees on "knees", pulses on "load"
  kneeRing.position.copy(KN).add(OFF);
  kneeRing.material.opacity = sm(T.knees1 - 0.1, T.knees1 + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t)) * (0.7 + 0.3 * Math.sin(t * 9));
  kneeRing.scale.setScalar(1 + 0.5 * flash(t, T.load) + 0.3 * flash(t, T.knees1));
  // s2: red ring on the high hips
  hipRing.position.set(0.32, J.HIP.y + 0.05, J.HIP.z);
  hipRing.material.opacity = sm(T.hips2 - 0.1, T.hips2 + 0.1, t) * (1 - sm(T.forward - 0.2, T.forward + 0.1, t)) * (0.7 + 0.3 * Math.sin(t * 9));
  hipRing.scale.setScalar(1 + 0.4 * flash(t, T.high));
  // s2: red vertical toe line, the knee sits in front of it
  const tR = sm(T.forward - 0.1, T.forward + 0.15, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.15, t));
  A0.set(0.3, 0.02, toeZ); A1.set(0.3, 0.62, toeZ); toeLineR.set(A0, A1, tR);
  // s3: red ring on the lifted heel
  heelRing.position.copy(HEEL).add(OFF);
  heelRing.material.opacity = sm(T.heels3 - 0.1, T.heels3 + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)) * (0.7 + 0.3 * Math.sin(t * 9));
  // s4: green arrow from the hips back toward the ghost chair, the chair fades in on "chair"
  const hA = sm(T.hips4 - 0.05, T.hips4 + 0.2, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.2, t));
  A0.set(0.32, J.HIP.y, J.HIP.z - 0.05); A1.set(0.32, J.HIP.y - 0.02, J.HIP.z + 0.3); hipArrow.set(A0, A1, hA * (0.8 + 0.2 * flash(t, T.back4)));
  chairM.opacity = 0.35 * sm(T.chair - 0.1, T.chair + 0.2, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.3, t)) * (0.85 + 0.15 * flash(t, T.behind));
  // s5: green ring on the heel (weight in the heels)
  heelGood.position.copy(HEEL).add(OFF);
  heelGood.material.opacity = sm(T.heels5 - 0.1, T.heels5 + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t)) * (0.45 + 0.15 * Math.sin(t * 7)); // round 2: was blinding
  heelGood.scale.setScalar(1 + 0.4 * flash(t, T.heels5));
  // s6: green toe line (knee over the foot), green line along the arm beside the ear
  const tG = sm(T.knees6 - 0.1, T.knees6 + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  A0.set(0.3, 0.02, toeZ); A1.set(0.3, 0.62, toeZ); toeLineG.set(A0, A1, tG * (0.8 + 0.2 * flash(t, T.feet)));
  const aA = sm(T.arms - 0.1, T.arms + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  A0.copy(J.SHO).add(OFF); A1.copy(J.HAND).add(OFF); A1.y += 0.05; armL.set(A0, A1, aA * (0.8 + 0.2 * flash(t, T.ears)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
