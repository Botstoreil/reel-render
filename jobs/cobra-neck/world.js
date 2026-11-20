// NEVER CRANK YOUR NECK BACK (YogaFlow). Cobra on a mat, side view from +x (the face toward -z).
// s1 lying flat, pushes up on "crank": straight arms, head thrown back to the ceiling (red gaze line up).
// s2 red ring at the back of the neck on "squeezes". s3 red line along the straight arm, red patch on the low back.
// s4 elbows bend and stay close to the ribs (green dots on the elbows). s5 chest lifts on "chest" (green arrow from the
// sternum), gaze forward and down on "gaze" (green line from the eyes to the mat). s6 a green height band ("easy").
// s7-s8 calm wide low cobra. Joints are posed explicitly per key pose (y, z) and blended, like plank-wrists.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  crank: g("s1", "crank"), ceiling: g("s1", "ceiling"),
  s2: S.s2[0], throwing: g("s2", "throwing"), squeezes: g("s2", "squeezes"), neck: g("s2", "neck"),
  s3: S.s3[0], straight: g("s3", "straight"), arms: g("s3", "arms"), jams: g("s3", "jams"), low: g("s3", "low"),
  s4: S.s4[0], elbows: g("s4", "elbows"), bent: g("s4", "bent"), ribs: g("s4", "ribs"),
  s5: S.s5[0], lift: g("s5", "lift"), chest: g("s5", "chest"), gaze: g("s5", "gaze"), down: g("s5", "down"),
  s6: S.s6[0], high: g("s6", "high"), easy: g("s6", "easy"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.8, 0.012, 2.6, 0, 0.006, -0.1, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.6, 0.4, 0.014, -0.1, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.6, -0.4, 0.014, -0.1, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.2, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.2, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.1); floorGlow.set(0.6);

// ---------- the person ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const Lsh = spine.children[2], Rsh = spine.children[3];
const Lel = Lsh.children[1], Rel = Rsh.children[1];
for (const h of P.hands) h.children[0].visible = false;
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion();
const d = V3(0, 0, 0), d2 = V3(0, 0, 0);

// key poses: [y, z] for hand, elbow, shoulder, hip, knee, ankle (lying along z, face toward -z)
const POSE = {
  flat:  { HAND: [0.03, -0.45], ELB: [0.24, -0.33], SHO: [0.15, -0.5],  HIP: [0.12, 0.05], KNEE: [0.08, 0.48], FOOT: [0.05, 0.9] },
  wrong: { HAND: [0.03, -0.34], ELB: [0.3, -0.33],  SHO: [0.56, -0.31], HIP: [0.12, 0.05], KNEE: [0.08, 0.48], FOOT: [0.05, 0.9] },
  right: { HAND: [0.03, -0.5],  ELB: [0.15, -0.29], SHO: [0.36, -0.46], HIP: [0.12, 0.05], KNEE: [0.08, 0.48], FOOT: [0.05, 0.9] },
  low:   { HAND: [0.03, -0.48], ELB: [0.18, -0.3],  SHO: [0.25, -0.49], HIP: [0.12, 0.05], KNEE: [0.08, 0.48], FOOT: [0.05, 0.9] },
};
const J = {}; for (const n of ["HAND", "ELB", "SHO", "HIP", "KNEE", "FOOT"]) J[n] = V3(0, 0, 0);
const tmp = V3(0, 0, 0);
function blend(seq) {
  for (const n in J) {
    const [y0, z0] = POSE[seq[0][0]][n]; J[n].set(0, y0, z0);
    for (let i = 1; i < seq.length; i++) { const [y, z] = POSE[seq[i][0]][n]; tmp.set(0, y, z); J[n].lerp(tmp, seq[i][1]); }
  }
}
// head: world gaze direction blended between "thrown back" and "forward and down"; local -z (the eyes) -> gaze
const mL = new THREE.Matrix4(), O = V3(0, 0, 0);
const qBack = new THREE.Quaternion().setFromRotationMatrix(mL.lookAt(O, V3(0, 1, 0.25).normalize(), V3(0, 0, 1)));
const qFwd = new THREE.Quaternion().setFromRotationMatrix(mL.lookAt(O, V3(0, -0.45, -0.9).normalize(), V3(0, 1, 0)));
const qFlat = new THREE.Quaternion().setFromRotationMatrix(mL.lookAt(O, V3(0, -0.8, -0.6).normalize(), V3(0, 0.6, -0.8)));
const qH = new THREE.Quaternion(), qP = new THREE.Quaternion();
function applyPose(t, back, fwd) {
  const br = 0.004 * Math.sin(t * 1.6);
  hips.position.set(0, J.HIP.y, J.HIP.z);
  d.subVectors(J.SHO, J.HIP).normalize(); spine.quaternion.setFromUnitVectors(UP, d);
  d.subVectors(J.KNEE, J.HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.FOOT, J.KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  qs.copy(spine.quaternion).invert();
  d.subVectors(J.ELB, J.SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.HAND, J.ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  hips.position.y += br;
  P.g.updateMatrixWorld(true);
  qH.copy(qFlat).slerp(qBack, back).slerp(qFwd, fwd);
  P.head.parent.getWorldQuaternion(qP);
  P.head.quaternion.copy(qP.invert().multiply(qH));
  P.g.updateMatrixWorld(true);
}

// ---------- hand props flat on the mat ----------
const mSkin = new THREE.MeshStandardMaterial({ color: 0xd99a74, emissive: 0x4a2414, roughness: 0.6 });
function makeHand(s) {
  const G = new THREE.Group(); G.scale.setScalar(1.2); scene.add(G);
  G.add(box(0.09, 0.024, 0.1, 0, 0.012, 0, mSkin));
  [-0.2, -0.07, 0.07, 0.2].forEach((r, i) => { const piv = new THREE.Group(); piv.position.set((i - 1.5) * 0.024, 0.01, -0.05); piv.rotation.y = r * s; G.add(piv); piv.add(box(0.018, 0.018, 0.08, 0, 0, -0.04, mSkin)); });
  const th = new THREE.Group(); th.position.set(-s * 0.045, 0.01, -0.005); th.rotation.y = s * 0.6; G.add(th); th.add(box(0.02, 0.018, 0.06, 0, 0, -0.03, mSkin));
  return G;
}
const HANDS = [makeHand(1), makeHand(-1)], XS = [0.25, -0.25];

// ---------- guides ----------
const OFF = V3(0.34, 0, 0); // floats on the camera side of the body
const gazeLine = beam(RED, 2.2, 0.025), armLine = beam(RED, 2.2, 0.03), goodGaze = beam(GREEN, 1.3, 0.022), chestArrow = beam(GREEN, 0.8, 0.03);
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 40), m); o.rotation.y = Math.PI / 2; o.renderOrder = 21; scene.add(o); return o; };
const neckRing = ringOf(RED, 0.07), backRing = ringOf(RED, 0.09);
const elbDot = ringOf(GREEN, 0.04);
const band = patch(0.05, 1, GREEN, 1.0); band.rotation.set(0, Math.PI / 2, 0); // vertical band on the camera side: "easy height"
const NECK = V3(0, 0, 0), EYE = V3(0, 0, 0), A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), GZ = V3(0, 0, 0);

// ---------- text ----------
title("NEVER CRANK YOUR NECK BACK");
cap("s2", "throwing", "HEAD THROWN BACK", RED);
cap("s2", "squeezes", "NECK SQUEEZED", RED, { boom: 0.35 });
cap("s3", "straight", "STRAIGHT ARMS", RED);
cap("s3", "jams", "LOW BACK JAMMED", RED, { boom: 0.35 });
cap("s4", "elbows", "ELBOWS BENT", GREEN);
cap("s4", "ribs", "CLOSE TO RIBS", GREEN);
cap("s5", "chest", "LIFT YOUR CHEST", GREEN, { boom: 0.3 });
cap("s5", "gaze", "GAZE FORWARD + DOWN", GREEN);
cap("s6", "easy", "ONLY AS HIGH AS EASY", VIOLET);
endCard([["LONG NECK", 1], ["LIFT YOUR CHEST", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x ----------
const st = (a, b = a) => [[0, a], [3, b]];
const WIDE = st([4.3, 0.9, -0.3, 0, 0.3, -0.3, 46], [4.0, 0.88, -0.3, 0, 0.3, -0.3, 46]);
const UPPER = st([2.1, 0.6, -0.55, 0, 0.38, -0.45, 42], [1.95, 0.58, -0.55, 0, 0.38, -0.45, 42]);
// round 2: medium side shot so the whole arch + head + the red gaze line to the ceiling are in frame
const HEAD = st([2.25, 0.75, -0.5, 0, 0.62, -0.45, 42], [2.1, 0.74, -0.5, 0, 0.62, -0.45, 42]);
const SH = [
  { at: 0, K: [[0, [4.5, 0.9, -0.05, 0, 0.3, -0.1, 46]], [2.0, [4.2, 0.88, -0.05, 0, 0.3, -0.1, 46]]] },
  { at: T.ceiling - 0.2, K: UPPER },
  // s2: close on the head and neck
  { at: T.s2, K: HEAD },
  // s3: arm and low back
  { at: T.s3, K: st([2.5, 0.4, -0.1, 0, 0.3, -0.15, 44], [2.35, 0.4, -0.1, 0, 0.3, -0.15, 44]) },
  // s4: elbows bend, upper body
  { at: T.s4, K: UPPER },
  // s5: chest and gaze, head close
  { at: T.chest - 0.15, K: st([2.0, 0.62, -0.55, 0, 0.4, -0.45, 42], [1.9, 0.6, -0.55, 0, 0.4, -0.45, 42]) },
  // s6: wide side, the height band
  { at: T.s6, K: WIDE },
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.2, 0, 1.0, 0.0, 48]], [5, [4.0, 1.85, 0.2, 0, 1.05, 0.0, 48]]] },
];

run("cobra-neck", (t) => {
  P.set({ t });
  // flat -> wrong on "crank"; -> low on "elbows"; -> right on "lift"; s6 a small rise and back on "high" .. "easy"
  const kW = sm(T.crank - 0.05, T.crank + 0.5, t) * (1 - sm(T.elbows - 0.1, T.bent + 0.15, t));
  const kL = sm(T.elbows - 0.1, T.bent + 0.15, t);
  const kR = sm(T.lift - 0.1, T.chest + 0.1, t);
  const rise = 0.35 * sm(T.high - 0.2, T.high + 0.15, t) * (1 - sm(T.easy - 0.1, T.easy + 0.3, t));
  blend([["flat", 1], ["wrong", kW], ["low", kL], ["right", kR], ["wrong", rise]]);
  const back = sm(T.crank, T.ceiling, t) * (1 - sm(T.elbows - 0.1, T.bent + 0.2, t));
  const fwd = sm(T.elbows - 0.1, T.bent + 0.2, t);
  applyPose(t, back, fwd);
  for (let k = 0; k < 2; k++) { HANDS[k].position.set(XS[k], 0.014, J.HAND.z + 0.03); HANDS[k].updateMatrixWorld(true); }

  P.head.getWorldPosition(NECK);
  EYE.set(0, 0.13, -0.135); P.head.localToWorld(EYE);
  // s1-s2: red gaze line from the eyes up to the ceiling
  const gA = sm(T.ceiling - 0.15, T.ceiling + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t));
  GZ.set(0, 0, -1).applyQuaternion(qH); A0.copy(EYE).add(OFF); A1.copy(A0).addScaledVector(GZ, 0.9);
  gazeLine.set(A0, A1, gA * (0.85 + 0.15 * Math.sin(t * 8)));
  // s2: red ring at the back of the neck
  neckRing.position.copy(NECK).add(OFF.clone().multiplyScalar(0.3)).add(V3(0, 0.02, 0.06));
  neckRing.material.opacity = sm(T.squeezes - 0.1, T.squeezes + 0.1, t) * (1 - sm(T.s3 + 0.2, T.s3 + 0.5, t)) * (0.7 + 0.3 * Math.sin(t * 9));
  neckRing.scale.setScalar(1 + 0.4 * flash(t, T.neck));
  // s3: red line along the straight arm, red ring on the low back
  const aA = sm(T.straight - 0.1, T.arms + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  A0.copy(J.SHO).add(OFF); A1.copy(J.HAND).add(OFF); armLine.set(A0, A1, aA);
  backRing.position.copy(J.HIP).lerp(J.SHO, 0.25).add(OFF.clone().multiplyScalar(0.3)).add(V3(0, 0.08, 0));
  backRing.material.opacity = sm(T.jams - 0.1, T.jams + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)) * (0.7 + 0.3 * Math.sin(t * 9));
  backRing.scale.setScalar(1 + 0.4 * flash(t, T.low));
  // s4: green ring on the elbow, close to the ribs
  elbDot.position.copy(J.ELB).add(OFF.clone().multiplyScalar(0.5));
  elbDot.material.opacity = sm(T.elbows - 0.05, T.elbows + 0.15, t) * (1 - sm(T.s5 + 0.1, T.s5 + 0.4, t)) * (0.8 + 0.2 * flash(t, T.ribs));
  // s5: green arrow up from the sternum on "chest"; green gaze line forward-down on "gaze"
  const cA = sm(T.chest - 0.1, T.chest + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  A0.copy(J.SHO).add(OFF); A0.y -= 0.04; A1.copy(A0); A1.y += 0.25; A1.z -= 0.04; chestArrow.set(A0, A1, cA * (0.8 + 0.2 * flash(t, T.chest)));
  const fA = sm(T.gaze - 0.1, T.gaze + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  A0.copy(EYE).add(OFF); A1.copy(A0).addScaledVector(GZ, 0.55); goodGaze.set(A0, A1, fA * (0.8 + 0.2 * flash(t, T.down)));
  // s6: green "easy" height band next to the shoulders
  band.position.set(0.36, 0.33, -0.46); band.scale.set(1, 0.32, 1);
  band.set(sm(T.s6, T.s6 + 0.3, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
