// NEVER STRETCH DEEP FIRST (YogaFlow, beginners). Standing forward fold on a mat, side view (person faces -z).
// Rig from forward-fold (proven). s1 deep locked fold. s2 red line + red dot on the back of the legs ("muscles").
// s3 hands forced to the floor (red floor ring), red pulse at the back of the thigh on "pulls".
// s4 knees bend, torso rises to a half hang, hands on the knees (green knee dot). s5 each breath lowers the torso a little
// (green spine line, violet depth steps). s6 calm green ring at the back of the thigh: a stretch, not a pull. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  deepest: g("s1", "deepest"),
  s2: S.s2[0], cold: g("s2", "cold"), muscles: g("s2", "muscles"), big: g("s2", "big"), mix: g("s2", "mix"),
  s3: S.s3[0], force: g("s3", "force"), floor: g("s3", "floor"), legs: g("s3", "legs"), pulls: g("s3", "pulls"),
  s4: S.s4[0], small: g("s4", "small"), bend: g("s4", "bend"), knees: g("s4", "knees"), halfway: g("s4", "halfway"),
  s5: S.s5[0], breathe: g("s5", "breathe"), breath: g("s5", "breath"), lower: g("s5", "lower"),
  s6: S.s6[0], stop: g("s6", "stop"), stretch: g("s6", "stretch"), pull: g("s6", "pull"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.72, 0.012, 2.3, 0, 0.006, -0.3, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.3, 0.36, 0.014, -0.3, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.3, -0.36, 0.014, -0.3, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.0, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.0, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.3); floorGlow.set(0.6);

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
// k: 0 = locked legs, deep hanging fold (wrong), 1 = soft knees (right)
// dp: depth of the right pose, 0 = half hang (torso near flat), 1 = a little lower; sink: forcing (s3)
function pose(k, dp, sink, HT, t) {
  const br = 0.008 * Math.sin(t * 1.6);
  HIP.set(0, lerp(0.99, lerp(0.86, 0.82, dp), k) + br, lerp(0.05, 0.12, k));
  hips.position.set(0, HIP.y, HIP.z);
  const ry = lerp(-0.22, -0.72, dp), rz = lerp(-0.97, -0.69, dp);
  D.set(0, lerp(-0.8 - 0.08 * sink, ry, k), lerp(-0.6 + 0.14 * sink, rz, k)).normalize();
  SHO.copy(HIP).addScaledVector(D, TORSO);
  spine.quaternion.setFromUnitVectors(UP, D);
  N.set(0, -D.z, D.y);
  ik(HIP, FOOT, THIGH, SHIN, -1, KNEE);
  d.subVectors(KNEE, HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(FOOT, KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  HAND.copy(HT); HAND.y = Math.max(0.07, HAND.y);
  ik(SHO, HAND, UPPER, FORE, -1, ELB);
  qs.copy(spine.quaternion).invert();
  d.subVectors(ELB, SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(HAND, ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  P.head.rotation.set(0.25 * sink * (1 - k) - 0.25 * k * (1 - dp), 0, 0);
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
const OFF = V3(0.32, 0, 0);
const HAM = V3(0, 0, 0), A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), HT = V3(0, 0, 0);
const legLine = beam(RED, 2.2, 0.03);
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0 }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 40), m); scene.add(o); return o; };
const floorRing = ringOf(RED, 0.14), okRing = ringOf(GREEN, 0.1);
const hamMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.0), toneMapped: false, transparent: true, opacity: 0 });
const hamDot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), hamMat); scene.add(hamDot);
const spineLine = beam(GREEN, 2.0, 0.026); spineLine.material.depthTest = false; spineLine.renderOrder = 20;
const dotOf = (hex) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), m); o.renderOrder = 21; scene.add(o); return o; };
const kneeDot = dotOf(GREEN);
// three violet depth steps beside the head: they light one by one as the breath takes the body lower
const steps = [0, 1, 2].map(() => dotOf(VIOLET));

// ---------- text ----------
title("NEVER STRETCH DEEP FIRST");
cap("s2", "cold", "COLD MUSCLES", RED);
cap("s2", "big", "BIG STRETCH FAST", RED, { boom: 0.3 });
cap("s3", "force", "FORCING THE FLOOR", RED);
cap("s3", "legs", "LEGS PULL HARD", RED, { boom: 0.3 });
cap("s4", "small", "START SMALL", GREEN);
cap("s4", "halfway", "HANG HALFWAY", VIOLET);
cap("s5", "breathe", "BREATHE SLOWLY", GREEN);
cap("s5", "breath", "A LITTLE LOWER", VIOLET);
cap("s6", "stop", "STRETCH NOT PULL", GREEN, { boom: 0.3 });
endCard([["START SMALL", 1], ["GO DEEPER SLOWLY", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, the face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  { at: 0, K: [[0, [3.6, 0.75, -0.15, 0, 0.55, -0.15, 46]], [2.0, [3.3, 0.72, -0.15, 0, 0.55, -0.15, 46]]] },
  // s2: side, a little from behind the legs (the back of the legs reads)
  { at: T.s2, K: st([2.5, 0.6, 0.5, 0, 0.55, -0.05, 44], [2.35, 0.6, 0.45, 0, 0.55, -0.05, 44]) },
  { at: T.big - 0.15, K: st([2.5, 0.75, -0.1, 0, 0.55, -0.05, 44], [2.35, 0.72, -0.1, 0, 0.55, -0.05, 44]) },
  // s3: low from the hands side, reaching for the floor, then the back of the legs
  { at: T.s3, K: st([2.6, 0.6, -1.6, 0, 0.5, -0.25, 46], [2.45, 0.58, -1.5, 0, 0.5, -0.25, 46]) },
  { at: T.legs - 0.15, K: st([2.2, 0.6, 0.6, 0, 0.6, 0.05, 42], [2.05, 0.6, 0.55, 0, 0.6, 0.05, 42]) },
  // s4: knees bend, then side for the half hang
  { at: T.s4, K: st([2.2, 0.7, 0.9, 0, 0.45, -0.05, 46], [2.05, 0.7, 0.85, 0, 0.45, -0.05, 46]) },
  { at: T.halfway - 0.15, K: st([3.0, 0.95, -0.15, 0, 0.55, -0.15, 46], [2.85, 0.92, -0.15, 0, 0.55, -0.15, 46]) },
  // s5: medium side while the body lowers
  { at: T.s5, K: st([2.8, 0.9, -0.2, 0, 0.55, -0.2, 46], [2.6, 0.85, -0.2, 0, 0.5, -0.2, 46]) },
  // s6: the back of the thigh, calm green
  { at: T.s6, K: st([2.5, 0.4, 0.15, 0, 0.4, 0.0, 42], [2.35, 0.4, 0.12, 0, 0.4, 0.0, 42]) },
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.1, 0, 1.0, -0.15, 48]], [5, [4.0, 1.85, 0.1, 0, 1.05, -0.15, 48]]] },
];

const H1 = V3(0, 0, 0), H2 = V3(0, 0, 0), H3 = V3(0, 0, 0), H4 = V3(0, 0, 0);
run("start-small", (t) => {
  const k = sm(T.bend - 0.05, T.knees + 0.25, t);
  const sink = sm(T.force - 0.1, T.floor + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  const fo = sm(T.force - 0.05, T.floor + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  // depth: three small steps down during s5 (each breath a little lower)
  const dp = (sm(T.s5 + 0.1, T.s5 + 0.6, t) + sm(T.breath - 0.1, T.breath + 0.4, t) + sm(T.lower - 0.2, T.lower + 0.3, t)) / 3;
  P.set({ t });
  pose(k, dp, sink, HAND, t);
  H1.set(0, SHO.y - 0.48, SHO.z - 0.06);            // hanging (wrong)
  H2.set(0, 0.06, SHO.z - 0.12);                    // forcing to the floor
  H3.lerpVectors(HIP, KNEE, 0.95); H3.z -= 0.08;    // hands on the knees (half hang)
  H4.lerpVectors(KNEE, FOOT, 0.4); H4.z -= 0.1;     // hands on the shins (a little lower)
  HT.copy(H1).lerp(H2, fo).lerp(H3, k).lerp(H4, dp * k);
  pose(k, dp, sink, HT, t);

  // back of the thigh point (legs bend forward to -z, so the back of the legs is +z)
  HAM.lerpVectors(HIP, KNEE, 0.55); HAM.z += 0.1; HAM.add(OFF);

  // wrong: red line down the back of the legs + red dot (s2), red floor ring and a hard red pulse (s3)
  const lg = sm(T.muscles - 0.1, T.muscles + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  A0.copy(HIP).add(OFF); A0.z += 0.08; A1.copy(FOOT).add(OFF); A1.z += 0.06; A1.y += 0.08;
  legLine.set(A0, A1, lg * (0.8 + 0.3 * flash(t, T.mix) + 0.3 * flash(t, T.pulls)));
  hamDot.position.copy(HAM);
  hamMat.opacity = sm(T.muscles - 0.1, T.muscles + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)) * (0.55 + 0.45 * Math.sin(t * 9));
  hamDot.scale.setScalar(1 + 0.5 * flash(t, T.muscles) + 0.8 * flash(t, T.pulls) + 0.6 * flash(t, T.pulls + 0.3));
  floorRing.position.set(OFF.x * 0.5, 0.03, H2.z); floorRing.rotation.set(-Math.PI / 2, 0, 0);
  floorRing.material.opacity = sm(T.floor - 0.1, T.floor + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)) * (0.6 + 0.4 * Math.sin(t * 9));
  floorRing.scale.setScalar(1 + 0.3 * flash(t, T.floor));

  // right: knee dot (s4), long spine line + depth steps (s5), calm green ring on the back of the thigh (s6)
  kneeDot.position.copy(KNEE).add(OFF);
  kneeDot.material.opacity = sm(T.knees - 0.1, T.knees + 0.15, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t));
  const ok = sm(T.halfway - 0.15, T.halfway + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  A0.copy(HIP).add(OFF).addScaledVector(N, 0.14); A1.copy(SHO).add(OFF).addScaledVector(N, 0.14);
  spineLine.set(A0, A1, ok * (0.85 + 0.4 * flash(t, T.breath)));
  const stOn = 1 - sm(T.s6 - 0.1, T.s6 + 0.2, t);
  const stT = [T.s5 + 0.35, T.breath + 0.15, T.lower];
  // depth steps: a violet dot left at each level the shoulder passes (a trail going down)
  steps.forEach((s, i) => {
    if (t < stT[i]) s.position.copy(SHO).add(OFF);
    s.material.opacity = sm(stT[i] - 0.1, stT[i] + 0.1, t) * stOn * 0.9;
    s.scale.setScalar(1.3 * (1 + 0.6 * flash(t, stT[i])));
  });
  // fix (Ofir 25.11): the ring read as on the back. Put it low on the thigh (near the knee, below the torso
  // slab), draw it on top, and film s6 from the pure side so it sits on the leg.
  okRing.position.lerpVectors(HIP, KNEE, 0.78); okRing.position.z += 0.06; okRing.position.add(OFF);
  okRing.material.depthTest = false; okRing.renderOrder = 22;
  okRing.lookAt(okRing.position.x + 1, okRing.position.y, okRing.position.z);
  okRing.material.opacity = sm(T.stop - 0.1, T.stop + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)) * (0.75 + 0.25 * Math.sin(t * 3));
  okRing.scale.setScalar(0.85 * (1 + 0.3 * flash(t, T.stretch)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
