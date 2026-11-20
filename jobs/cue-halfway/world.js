// NEVER CUE CHATURANGA TO THE FLOOR (YogaFlow, to teachers). A student in high plank on a mat, side view from +x
// (the face toward -z). s1 plank, then lowers all the way on "never"..."floor": shoulders drop below the elbows.
// s2 red line at elbow height on "elbows", red ring on the front of the shoulder on "shoulders". s3 the student repeats
// it (down, up, down) on "repeat". s4 back to plank, green line elbow -> ribs on "hugging". s5 lowers only halfway on
// "halfway": shoulders stop on the green elbow line. s6 knees down to the mat, then halfway on the knees. s7-s8 calm plank.
// Joints are posed explicitly per key pose (y, z) and blended (same rig as plank-wrists).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  never: g("s1", "never"), floor: g("s1", "floor"),
  s2: S.s2[0], past: g("s2", "past"), elbows2: g("s2", "elbows"), front: g("s2", "front"), shoulders: g("s2", "shoulders"),
  s3: S.s3[0], repeat: g("s3", "repeat"), every: g("s3", "every"), flow: g("s3", "flow"),
  s4: S.s4[0], elbows4: g("s4", "elbows"), hugging: g("s4", "hugging"),
  s5: S.s5[0], lower: g("s5", "lower"), halfway: g("s5", "halfway"), line: g("s5", "line"),
  s6: S.s6[0], knees: g("s6", "knees"), normal: g("s6", "normal"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.8, 0.012, 2.6, 0, 0.006, -0.1, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.6, 0.4, 0.014, -0.1, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.6, -0.4, 0.014, -0.1, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.2, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.2, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.1); floorGlow.set(0.6);

// ---------- the student ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const Lsh = spine.children[2], Rsh = spine.children[3];
const Lel = Lsh.children[1], Rel = Rsh.children[1];
for (const h of P.hands) h.children[0].visible = false; // the hand props below replace the ball hands
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion();
const d = V3(0, 0, 0), d2 = V3(0, 0, 0);

// key poses: [y, z] for hand, elbow, shoulder, hip, knee, ankle (bone lengths: arm 0.30 + 0.30, spine 0.56, legs 0.45 + 0.45)
const POSE = {
  plank:  { HAND: [0.06, -0.5], ELB: [0.36, -0.5], SHO: [0.66, -0.5], HIP: [0.44, 0.015], KNEE: [0.26, 0.43], FOOT: [0.08, 0.85] },
  floor:  { HAND: [0.06, -0.5], ELB: [0.36, -0.48], SHO: [0.18, -0.72], HIP: [0.142, -0.16], KNEE: [0.111, 0.288], FOOT: [0.08, 0.737] },
  half:   { HAND: [0.06, -0.5], ELB: [0.38, -0.5], SHO: [0.40, -0.80], HIP: [0.277, -0.254], KNEE: [0.179, 0.185], FOOT: [0.08, 0.624] },
  kneesH: { HAND: [0.06, -0.5], ELB: [0.37, -0.5], SHO: [0.38, -0.78], HIP: [0.30, -0.226], KNEE: [0.07, 0.16], FOOT: [0.32, 0.52] },
};
const J = {}; for (const n of ["HAND", "ELB", "SHO", "HIP", "KNEE", "FOOT"]) J[n] = V3(0, 0, 0);
const tmp = V3(0, 0, 0);
function blend(seq) {
  for (const n in J) {
    const [y0, z0] = POSE[seq[0][0]][n]; J[n].set(0, y0, z0);
    for (let i = 1; i < seq.length; i++) { const [y, z] = POSE[seq[i][0]][n]; tmp.set(0, y, z); J[n].lerp(tmp, seq[i][1]); }
  }
}
function applyPose(t) {
  const br = 0.006 * Math.sin(t * 1.6);
  hips.position.set(0, J.HIP.y + br, J.HIP.z);
  d.subVectors(J.SHO, J.HIP).normalize(); spine.quaternion.setFromUnitVectors(UP, d);
  d.subVectors(J.KNEE, J.HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.FOOT, J.KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  qs.copy(spine.quaternion).invert();
  d.subVectors(J.ELB, J.SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.HAND, J.ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  P.head.rotation.set(-0.35, 0, 0);
  P.g.updateMatrixWorld(true);
}

// ---------- hand props on the mat (palm + spread fingers) ----------
const mSkin = new THREE.MeshStandardMaterial({ color: 0xd99a74, emissive: 0x4a2414, roughness: 0.6 });
const SPREAD = [-0.32, -0.11, 0.11, 0.32];
for (const [x, s] of [[0.29, 1], [-0.29, -1]]) {
  const G = new THREE.Group(); G.scale.setScalar(1.25); G.position.set(x, 0.014, -0.48); scene.add(G);
  G.add(box(0.09, 0.024, 0.1, 0, 0.012, 0, mSkin));
  SPREAD.forEach((r, i) => { const piv = new THREE.Group(); piv.position.set((i - 1.5) * 0.03, 0.01, -0.05); piv.rotation.y = r * s; G.add(piv); piv.add(box(0.018, 0.018, 0.085, 0, 0, -0.0425, mSkin)); });
  const th = new THREE.Group(); th.position.set(-s * 0.045, 0.01, -0.005); th.rotation.y = s * 0.95; G.add(th); th.add(box(0.02, 0.018, 0.065, 0, 0, -0.0325, mSkin));
}

// ---------- guides (float on the camera side of the body) ----------
const OFF = V3(0.36, 0, 0);
const elbowBad = beam(RED, 2.0, 0.02), elbowOk = beam(GREEN, 1.3, 0.02), ribLine = beam(GREEN, 1.3, 0.025);
const shoRing = (() => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.008, 8, 40), m); o.rotation.y = Math.PI / 2; o.renderOrder = 21; scene.add(o); return o; })();
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0);

// ---------- text ----------
title("NEVER CUE CHATURANGA TO THE FLOOR");
cap("s2", "past", "PAST THE ELBOWS", RED);
cap("s2", "front", "FRONT OF SHOULDER", RED, { boom: 0.35 });
cap("s3", "repeat", "EVERY FLOW", RED);
cap("s4", "elbows", "ELBOWS IN", GREEN);
cap("s4", "hugging", "HUG THE RIBS", VIOLET, { boom: 0.3 });
cap("s5", "lower", "ONLY HALFWAY", GREEN, { boom: 0.3 });
cap("s5", "line", "ELBOWS IN LINE", VIOLET);
cap("s6", "knees", "KNEES DOWN", GREEN);
cap("s6", "normal", "A NORMAL CHOICE", VIOLET, { boom: 0.3 });
endCard([["ELBOWS IN", 1], ["LOWER HALFWAY", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, the face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const WIDE = (a, b) => st([a, 0.9, -0.05, 0, 0.35, -0.05, 46], [b, 0.88, -0.05, 0, 0.35, -0.05, 46]);
const ARM = st([2.0, 0.5, -0.6, 0, 0.3, -0.6, 42], [1.85, 0.48, -0.6, 0, 0.3, -0.6, 42]);
const SH = [
  // hook: wide side view, the whole plank, then lowering to the floor
  { at: 0, K: [[0, [4.5, 0.9, -0.05, 0, 0.35, -0.05, 46]], [3.4, [4.1, 0.86, -0.05, 0, 0.35, -0.05, 46]]] },
  // s2: close on the arm and shoulder
  { at: T.s2, K: ARM },
  { at: T.front - 0.15, K: st([1.6, 0.35, -0.8, 0, 0.24, -0.66, 38], [1.5, 0.34, -0.78, 0, 0.24, -0.66, 38]) },
  // s3: wide, down and up again
  { at: T.s3, K: WIDE(4.3, 4.0) },
  // s4: on the arm, elbow to ribs
  { at: T.s4, K: ARM },
  // s5: wide, then close on the halfway line
  { at: T.s5, K: st([4.2, 0.9, -0.2, 0, 0.35, -0.2, 46], [3.9, 0.88, -0.2, 0, 0.35, -0.2, 46]) },
  { at: T.halfway - 0.1, K: st([1.9, 0.48, -0.75, 0, 0.36, -0.7, 40], [1.8, 0.47, -0.74, 0, 0.36, -0.7, 40]) },
  // s6: wide, knees down
  { at: T.s6, K: st([4.2, 0.9, -0.32, 0, 0.35, -0.32, 46], [3.95, 0.88, -0.32, 0, 0.35, -0.32, 46]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.2, 0, 1.0, 0.0, 48]], [5, [4.0, 1.85, 0.2, 0, 1.05, 0.0, 48]]] },
];

run("cue-halfway", (t) => {
  P.set({ t });
  // wrong: down to the floor in s1, stays there in s2, repeats (up, down) in s3
  const down1 = sm(T.never - 0.05, T.floor, t);
  const rep = t < T.repeat ? 0 : 0.5 - 0.5 * Math.cos((t - T.repeat) * Math.PI * 2 / 0.9);
  const kF = t < T.s3 ? down1 : t < T.s4 ? (1 - sm(T.s3, T.s3 + 0.25, t) * 0) * (1 - rep) : 0;
  const up4 = sm(T.s4 - 0.1, T.s4 + 0.3, t);
  // right: halfway on "halfway" (s5), knees down + halfway in s6, back to plank at s7
  const kH = sm(T.lower - 0.05, T.halfway + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  const kK = sm(T.knees - 0.15, T.knees + 0.25, t) * (1 - sm(T.s7 + 0.1, T.s7 + 0.8, t));
  blend([["plank", 1], ["floor", t < T.s4 ? kF : kF * (1 - up4)], ["half", kH], ["kneesH", kK]]);
  applyPose(t);

  // s2: red line at elbow height, red ring on the front of the shoulder
  const eb = sm(T.past - 0.1, T.past + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4, t));
  A0.set(OFF.x, J.ELB.y, J.SHO.z - 0.25); A1.set(OFF.x, J.ELB.y, J.ELB.z + 0.25); elbowBad.set(A0, A1, eb * (0.8 + 0.2 * flash(t, T.elbows2)));
  shoRing.position.set(OFF.x, J.SHO.y + 0.02, J.SHO.z - 0.06);
  shoRing.material.opacity = sm(T.front - 0.1, T.front + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4, t)) * (0.65 + 0.35 * Math.sin(t * 9));
  shoRing.scale.setScalar(1 + 0.4 * flash(t, T.shoulders) + 0.3 * flash(t, T.every));

  // s4: green line elbow -> ribs
  const rl = sm(T.hugging - 0.1, T.hugging + 0.15, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.4, t));
  A0.copy(J.ELB).add(OFF); A1.copy(J.SHO).lerp(J.HIP, 0.35).add(OFF); ribLine.set(A0, A1, rl);

  // s5-s6: green line at elbow height, the shoulder stops on it
  const eo = sm(T.halfway - 0.1, T.halfway + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7, t));
  A0.set(OFF.x, J.ELB.y, J.SHO.z - 0.25); A1.set(OFF.x, J.ELB.y, J.ELB.z + 0.25); elbowOk.set(A0, A1, eo * (0.8 + 0.2 * flash(t, T.line)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
