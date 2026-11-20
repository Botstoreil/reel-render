// NEVER BOUNCE INTO A STRETCH (YogaFlow 08). Standing forward fold on a mat, side view (person faces -z).
// s1 folds toward the toes; from "bounce" the torso bobs up and down fast. s2 keeps bouncing, the hamstring line on the back of
// the thigh turns red on "muscle" and pulses on "tighten". s3 bigger yanks on "pulling", red line flickers on "tight".
// s4 stands up a little, then folds down slowly ("down" -> "stretch"), the hamstring line turns green on "gentle".
// s5 holds still, five green breath dots pop one by one from "five". s6 sinks a little on "exhale" and "deeper".
// s7-s8 calm wide. Posed with two-bone IK in the side plane (y, z), adapted from forward-fold.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  toes: g("s1", "toes"), bounce: g("s1", "bounce"),
  s2: S.s2[0], muscle: g("s2", "muscle"), tighten: g("s2", "tighten"), protect: g("s2", "protect"),
  s3: S.s3[0], pulling: g("s3", "pulling"), tight: g("s3", "tight"),
  s4: S.s4[0], down: g("s4", "down"), slowly: g("s4", "slowly"), gentle: g("s4", "gentle"), stretch: g("s4", "stretch"),
  s5: S.s5[0], hold: g("s5", "hold"), five: g("s5", "five"),
  s6: S.s6[0], exhale: g("s6", "exhale"), deeper: g("s6", "deeper"), only: g("s6", "only"), easy: g("s6", "easy"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.72, 0.012, 2.3, 0, 0.006, -0.3, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.3, 0.36, 0.014, -0.3, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.3, -0.36, 0.014, -0.3, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.0, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.0, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.3); floorGlow.set(0.6);
const floorRed = patch(1.6, 3.0, RED, 0.6); floorRed.position.set(0, 0.025, -0.3);

// ---------- the person ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const Lsh = spine.children[2], Rsh = spine.children[3];
const Lel = Lsh.children[1], Rel = Rsh.children[1];
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion();
const TORSO = 0.56, UPPER = 0.3, FORE = 0.32, THIGH = 0.45, SHIN = 0.46;
const HIP = V3(0, 0, 0), SHO = V3(0, 0, 0), ELB = V3(0, 0, 0), HAND = V3(0, 0, 0), KNEE = V3(0, 0, 0), FOOT = V3(0, 0.08, 0);
const D = V3(0, 0, 0), N = V3(0, 0, 0), d = V3(0, 0, 0), d2 = V3(0, 0, 0);
function ik(R, Tg, a, b, side, out) {
  const dz = Tg.z - R.z, dy = Tg.y - R.y, L0 = Math.max(1e-4, Math.hypot(dz, dy));
  const L = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, L0));
  const uz = dz / L0, uy = dy / L0, ca = (a * a + L * L - b * b) / (2 * a * L), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  out.set(R.x, R.y + a * (uy * ca + side * uz * sa), R.z + a * (uz * ca - side * uy * sa));
  return out;
}
const lerp = (a, b, k) => a + (b - a) * k;
// f: fold depth, 0 = almost upright, 1 = deep fold (torso hanging toward the shins). Knees slightly soft throughout.
function pose(f) {
  HIP.set(0, lerp(0.97, 0.9, f), lerp(0.02, 0.1, f));
  hips.position.set(0, HIP.y, HIP.z);
  const th = lerp(0.35, 2.45, f); // angle of the torso from straight up
  D.set(0, Math.cos(th), -Math.sin(th)).normalize();
  SHO.copy(HIP).addScaledVector(D, TORSO);
  spine.quaternion.setFromUnitVectors(UP, D);
  N.set(0, -D.z, D.y);
  ik(HIP, FOOT, THIGH, SHIN, -1, KNEE);
  d.subVectors(KNEE, HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(FOOT, KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [t0, kn] of [[LTh, LKn], [RTh, RKn]]) { t0.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  // hands hang from the shoulders toward the toes, never through the floor
  HAND.set(0, Math.max(0.07, SHO.y - 0.58), Math.min(SHO.z - 0.04, -0.08));
  ik(SHO, HAND, UPPER, FORE, -1, ELB);
  qs.copy(spine.quaternion).invert();
  d.subVectors(ELB, SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(HAND, ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  P.head.rotation.set(0.15 * f, 0, 0);
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
const OFF = V3(0.32, 0, 0); // guides float just in front of the body, on the camera side
const hamRed = beam(RED, 2.4, 0.04), hamOk = beam(GREEN, 2.0, 0.034);
hamRed.material.depthTest = hamOk.material.depthTest = false; hamRed.renderOrder = hamOk.renderOrder = 20;
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0);
const dotOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m); o.renderOrder = 21; scene.add(o); return o; };
const breathDots = Array.from({ length: 5 }, () => dotOf(GREEN, 0.035));

// ---------- text ----------
title("NEVER BOUNCE INTO A STRETCH");
cap("s2", "bouncing", "BOUNCING", RED);
cap("s2", "tighten", "MUSCLE TIGHTENS", RED, { boom: 0.35 });
cap("s3", "pulling", "PULLING AGAINST", RED);
cap("s3", "tight", "A TIGHT MUSCLE", RED, { boom: 0.35 });
cap("s4", "down", "GO DOWN SLOWLY", GREEN);
cap("s4", "gentle", "GENTLE STRETCH", GREEN, { boom: 0.3 });
cap("s5", "hold", "HOLD STILL", GREEN);
cap("s5", "five", "FIVE SLOW BREATHS", VIOLET);
cap("s6", "exhale", "EXHALE DEEPER", GREEN);
cap("s6", "only", "ONLY IF EASY", VIOLET, { boom: 0.25 });
endCard([["NO BOUNCING", 1], ["SLOW AND STILL", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, the face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  { at: 0, K: [[0, [3.6, 0.85, -0.15, 0, 0.6, -0.15, 46]], [2.2, [3.3, 0.8, -0.15, 0, 0.6, -0.15, 46]]] },
  // s2: closer on the back of the thigh
  { at: T.s2, K: st([2.3, 0.75, 0.55, 0, 0.6, 0.0, 44], [2.15, 0.72, 0.5, 0, 0.6, 0.0, 44]) },
  // s3: side, wider, the yanks
  { at: T.s3, K: st([3.1, 0.9, -0.35, 0, 0.55, -0.15, 46], [2.95, 0.88, -0.3, 0, 0.55, -0.15, 46]) },
  // s4: side, the slow fold
  { at: T.s4, K: st([3.2, 0.95, -0.15, 0, 0.6, -0.15, 46], [3.0, 0.9, -0.15, 0, 0.6, -0.15, 46]) },
  { at: T.gentle - 0.15, K: st([2.3, 0.75, 0.5, 0, 0.55, 0.0, 44], [2.2, 0.72, 0.45, 0, 0.55, 0.0, 44]) },
  // s5: medium side, breath dots above the back
  { at: T.s5, K: st([2.9, 1.0, -0.2, 0, 0.65, -0.2, 46], [2.75, 0.98, -0.2, 0, 0.65, -0.2, 46]) },
  // s6: low three-quarter from the front, then side
  { at: T.s6, K: st([2.5, 0.7, -1.6, 0, 0.5, -0.3, 46], [2.35, 0.68, -1.5, 0, 0.5, -0.3, 46]) },
  { at: T.only - 0.15, K: st([3.0, 0.9, -0.2, 0, 0.55, -0.2, 46], [2.85, 0.88, -0.2, 0, 0.55, -0.2, 46]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.1, 0, 1.0, -0.15, 48]], [5, [4.0, 1.85, 0.1, 0, 1.05, -0.15, 48]]] },
];

run("no-bounce", (t) => {
  // fold depth
  let f;
  if (t < T.s4) {
    const base = lerp(0.2, 0.7, sm(0.1, T.toes, t));
    const amp = 0.16 * sm(T.bounce - 0.1, T.bounce + 0.1, t) + 0.1 * sm(T.pulling - 0.1, T.pulling + 0.1, t);
    f = base + amp * Math.abs(Math.sin(t * Math.PI * 2.4));
  } else {
    f = lerp(0.2, 0.78, sm(T.down - 0.05, T.stretch, t)) + 0.06 * sm(T.exhale, T.exhale + 0.5, t) + 0.06 * sm(T.deeper - 0.1, T.deeper + 0.4, t);
    f += 0.008 * Math.sin(t * 1.6) * sm(T.s5, T.s5 + 0.3, t); // breathing, no bouncing
  }
  P.set({ t });
  pose(f);

  // hamstring line on the back of the thigh: red and tight while bouncing, green from "gentle"
  A0.copy(HIP).add(OFF); A0.z += 0.1; A1.copy(KNEE).add(OFF); A1.z += 0.08;
  const bad = sm(T.muscle - 0.1, T.muscle + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  hamRed.set(A0, A1, bad * (0.7 + 0.3 * Math.sin(t * 14)) * (1 + 0.6 * flash(t, T.tighten) + 0.6 * flash(t, T.tight)));
  const good = sm(T.gentle - 0.1, T.gentle + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  hamOk.set(A0, A1, good * (0.85 + 0.15 * Math.sin(t * 2)));
  floorRed.set(0.5 * sm(T.bounce - 0.1, T.bounce + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)));

  // five breath dots above the back, one by one from "five"
  breathDots.forEach((o, i) => {
    const ti = T.five + i * 0.18;
    o.position.set(OFF.x, 1.42, -0.55 + i * 0.16);
    o.material.opacity = sm(ti - 0.05, ti + 0.08, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.5, t)) * (0.75 + 0.25 * Math.sin(t * 2 + i));
    o.scale.setScalar(1 + 0.6 * flash(t, ti));
  });

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
