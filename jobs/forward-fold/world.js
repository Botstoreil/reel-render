// NEVER LOCK YOUR KNEES (YogaFlow). Standing forward fold on a mat, seen from the side (person faces -z).
// s1 straight locked legs, back rounded down (red knee ring on "knees"). s2 red locked-leg line, red arc over the rounded
// back, red glow at the low back on "low". s3 hands forced toward the floor (red ring on the floor), the back rounds more.
// s4 knees bend (green knee dots), hips hinge back (green hip dot). s5 belly toward the thighs, green long-spine line.
// s6 violet blocks pop in, hands rest on them; on "shins" the hands move to the shins. s7-s8 calm wide.
// Posed by hand with two-bone IK in the side plane (y, z).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  lock: g("s1", "lock"), knees1: g("s1", "knees"),
  s2: S.s2[0], locked: g("s2", "locked"), rounded: g("s2", "rounded"), low: g("s2", "low"),
  s3: S.s3[0], forcing: g("s3", "forcing"), floor: g("s3", "floor"), rounds: g("s3", "rounds"),
  s4: S.s4[0], bend: g("s4", "bend"), knees: g("s4", "knees"), hinge: g("s4", "hinge"), hips: g("s4", "hips"),
  s5: S.s5[0], belly: g("s5", "belly"), thighs: g("s5", "thighs"), spine: g("s5", "spine"), long: g("s5", "long"),
  s6: S.s6[0], blocks: g("s6", "blocks"), shins: g("s6", "shins"), far: g("s6", "far"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.72, 0.012, 2.3, 0, 0.006, -0.3, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.3, 0.36, 0.014, -0.3, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.3, -0.36, 0.014, -0.3, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.0, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.0, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.3); floorGlow.set(0.6);
// yoga blocks (pop in on "blocks")
const BZ = -0.72, blocks = [];
for (const x of [0.25, -0.25]) { const b = box(0.12, 0.15, 0.23, x, 0.075, BZ, mat(0x8a7cff, 0.45)); scene.add(b); blocks.push(b); }

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
// two-bone IK in the y-z plane: middle joint of a chain root -> target with lengths a, b; side = which way it bends
function ik(R, Tg, a, b, side, out) {
  const dz = Tg.z - R.z, dy = Tg.y - R.y, L0 = Math.max(1e-4, Math.hypot(dz, dy));
  const L = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, L0));
  const uz = dz / L0, uy = dy / L0, ca = (a * a + L * L - b * b) / (2 * a * L), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  out.set(R.x, R.y + a * (uy * ca + side * uz * sa), R.z + a * (uz * ca - side * uy * sa));
  return out;
}
const lerp = (a, b, k) => a + (b - a) * k;
// k: 0 = locked legs + rounded back hanging (wrong), 1 = soft knees, hips back, long spine (right)
// sink: the back rounds more (s3); hand: target for the hands
function pose(k, sink, HT, t) {
  const br = 0.008 * Math.sin(t * 1.6);
  // hips: high over the feet when locked, lower and back when the knees bend
  HIP.set(0, lerp(0.99, 0.8, k) + br, lerp(0.05, 0.14, k));
  hips.position.set(0, HIP.y, HIP.z);
  // torso direction: hanging and steep when wrong (steeper with sink), long and forward when right
  // (round 2: the wrong torso hangs further forward; round 1 hung it straight over the legs and hid the locked knees)
  D.set(0, lerp(-0.8 - 0.08 * sink, -0.53, k), lerp(-0.6 + 0.14 * sink, -0.85, k)).normalize();
  SHO.copy(HIP).addScaledVector(D, TORSO);
  spine.quaternion.setFromUnitVectors(UP, D);
  // back normal (away from the legs)
  N.set(0, -D.z, D.y);
  // legs: hip -> knee -> foot, knees bend forward (-z); locked = straight (the foot is at full reach)
  ik(HIP, FOOT, THIGH, SHIN, -1, KNEE);
  d.subVectors(KNEE, HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(FOOT, KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  // arms: shoulder -> elbow -> hand
  HAND.copy(HT); HAND.y = Math.max(0.07, HAND.y);
  ik(SHO, HAND, UPPER, FORE, -1, ELB);
  qs.copy(spine.quaternion).invert();
  d.subVectors(ELB, SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(HAND, ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  // head: hangs in line with the spine, a little more when forcing
  P.head.rotation.set(0.25 * sink * (1 - k), 0, 0);
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
const OFF = V3(0.32, 0, 0); // guides float just in front of the body, on the camera side
const arcN = 8, arc = Array.from({ length: arcN }, () => beam(RED, 2.4, 0.03));
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), MID = V3(0, 0, 0), HT = V3(0, 0, 0);
const legLine = beam(RED, 2.2, 0.03);
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0 }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 40), m); scene.add(o); return o; };
const kneeRing = ringOf(RED, 0.1), floorRing = ringOf(RED, 0.14);
const lowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.0), toneMapped: false, transparent: true, opacity: 0 });
const lowDot = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), lowMat); scene.add(lowDot);
const spineLine = beam(GREEN, 2.0, 0.026); spineLine.material.depthTest = false; spineLine.renderOrder = 20;
const bellyLine = beam(VIOLET, 2.0, 0.022); bellyLine.material.depthTest = false; bellyLine.renderOrder = 20;
const dotOf = (hex) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), m); o.renderOrder = 21; scene.add(o); return o; };
const kneeDot = dotOf(GREEN), hipDot = dotOf(GREEN);
const blockMat = glow(VIOLET, 1.6);
const blockEdges = blocks.map((b) => { const e = box(0.13, 0.004, 0.24, 0, 0.078, 0, blockMat, false); b.add(e); return e; });

// ---------- text ----------
title("NEVER LOCK YOUR KNEES");
cap("s2", "locked", "LOCKED KNEES", RED);
cap("s2", "low", "INTO LOW BACK", RED, { boom: 0.3 });
cap("s3", "forcing", "FORCING THE FLOOR", RED);
cap("s3", "rounds", "ROUNDS YOU MORE", RED);
cap("s4", "bend", "SOFT KNEES", GREEN);
cap("s4", "hinge", "HINGE AT HIPS", GREEN);
cap("s5", "belly", "BELLY TO THIGHS", VIOLET);
cap("s5", "spine", "LONG SPINE", GREEN, { boom: 0.3 });
cap("s6", "blocks", "HANDS ON BLOCKS", VIOLET);
cap("s6", "shins", "OR ON SHINS", GREEN);
endCard([["SOFT KNEES", 1], ["HINGE FROM HIPS", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, the face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: wide side view, the whole fold
  // (round 2: low pure side views so the straight legs read and nothing reaches the title band)
  { at: 0, K: [[0, [3.6, 0.75, -0.15, 0, 0.55, -0.15, 46]], [2.0, [3.3, 0.72, -0.15, 0, 0.55, -0.15, 46]]] },
  // "lock": the straight legs and knees, side
  { at: T.lock - 0.15, K: st([2.5, 0.55, 0.15, 0, 0.55, 0.0, 44], [2.35, 0.55, 0.12, 0, 0.55, 0.0, 44]) },
  // s2: side, a little from behind the legs
  { at: T.s2, K: st([2.5, 0.6, 0.5, 0, 0.55, -0.05, 44], [2.35, 0.6, 0.45, 0, 0.55, -0.05, 44]) },
  { at: T.rounded - 0.15, K: st([2.5, 1.45, -0.9, 0, 0.6, -0.05, 44], [2.35, 1.4, -0.85, 0, 0.6, -0.05, 44]) },
  // "low": closer on the low back
  { at: T.low - 0.15, K: st([2.0, 1.35, -0.3, 0, 0.8, 0.0, 42], [1.9, 1.3, -0.28, 0, 0.8, 0.0, 42]) },
  // s3: low from the hands side, reaching for the floor
  // (round 2: pulled back and aimed higher; round 1 put the torso over "FORCING THE FLOOR")
  { at: T.s3, K: st([2.6, 0.6, -1.6, 0, 0.5, -0.25, 46], [2.45, 0.58, -1.5, 0, 0.5, -0.25, 46]) },
  { at: T.rounds - 0.15, K: st([3.2, 0.95, -0.1, 0, 0.5, -0.1, 46], [3.0, 0.92, -0.1, 0, 0.5, -0.1, 46]) },
  // s4: knees, three-quarter from behind the legs, then side for the hinge
  { at: T.s4, K: st([2.2, 0.7, 0.9, 0, 0.45, -0.05, 46], [2.05, 0.7, 0.85, 0, 0.45, -0.05, 46]) },
  { at: T.hinge - 0.15, K: st([3.0, 0.95, -0.15, 0, 0.5, -0.15, 46], [2.85, 0.92, -0.15, 0, 0.5, -0.15, 46]) },
  // s5: medium side, the belly near the thighs, the long spine
  { at: T.s5, K: st([2.6, 0.85, -0.15, 0, 0.5, -0.15, 44], [2.45, 0.82, -0.15, 0, 0.5, -0.15, 44]) },
  { at: T.spine - 0.15, K: st([3.1, 1.0, -0.2, 0, 0.5, -0.2, 46], [2.95, 0.98, -0.2, 0, 0.5, -0.2, 46]) },
  // s6: low three-quarter from the front, the blocks; then side for the shins
  { at: T.s6, K: st([2.5, 0.6, -1.7, 0, 0.45, -0.4, 46], [2.35, 0.58, -1.6, 0, 0.45, -0.4, 46]) },
  { at: T.shins - 0.15, K: st([2.5, 0.65, 0.1, 0, 0.38, -0.2, 44], [2.35, 0.62, 0.08, 0, 0.38, -0.2, 44]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.1, 0, 1.0, -0.15, 48]], [5, [4.0, 1.85, 0.1, 0, 1.05, -0.15, 48]]] },
];

const H1 = V3(0, 0, 0), H2 = V3(0, 0, 0), H3 = V3(0, 0, 0), H4 = V3(0, 0, 0), H5 = V3(0, 0, 0);
run("forward-fold", (t) => {
  const k = sm(T.bend - 0.05, T.hips + 0.2, t);
  const sink = sm(T.forcing - 0.1, T.rounds + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  const fo = sm(T.forcing - 0.05, T.floor + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.3, t));
  const onB = sm(T.blocks - 0.15, T.blocks + 0.25, t), onS = sm(T.shins - 0.1, T.shins + 0.3, t);
  P.set({ t });
  // hand targets, from an approximate shoulder for this k (computed from the last pose: one frame lag is fine at 30 fps)
  pose(k, sink, HAND, t);
  H1.set(0, SHO.y - 0.48, SHO.z - 0.06);                 // hanging (wrong)
  H2.set(0, 0.06, SHO.z - 0.12);                         // forcing to the floor
  H3.set(0, SHO.y - 0.4, SHO.z - 0.2);                   // relaxed (right)
  H4.set(0, 0.21, BZ);                                   // on the blocks
  H5.lerpVectors(KNEE, FOOT, 0.45); H5.z -= 0.1;         // on the shins
  HT.copy(H1).lerp(H2, fo).lerp(H3, k).lerp(H4, onB).lerp(H5, onS);
  pose(k, sink, HT, t);

  // blocks pop in
  const bk = sm(T.blocks - 0.3, T.blocks, t);
  for (const b of blocks) { b.visible = bk > 0.01; b.scale.setScalar(Math.max(0.01, bk * (1 + 0.15 * flash(t, T.blocks)))); }
  blockMat.color.set(VIOLET).multiplyScalar(1.2 + 1.0 * flash(t, T.blocks));

  // wrong: red knee ring, red locked-leg line, red arc over the rounded back, red low-back glow, red floor ring
  const kr = sm(T.knees1 - 0.1, T.knees1 + 0.15, t) * (1 - sm(T.rounded - 0.1, T.rounded + 0.1, t));
  kneeRing.position.copy(KNEE).add(OFF); kneeRing.lookAt(kneeRing.position.x + 1, kneeRing.position.y, kneeRing.position.z);
  kneeRing.material.opacity = kr * (0.6 + 0.4 * Math.sin(t * 9)); kneeRing.scale.setScalar(1 + 0.3 * flash(t, T.knees1) + 0.3 * flash(t, T.locked));
  const lg = sm(T.locked - 0.1, T.locked + 0.15, t) * (1 - sm(T.rounded - 0.1, T.rounded + 0.1, t));
  MID.copy(HIP).add(OFF); A0.copy(FOOT).add(OFF); legLine.set(MID, A0, lg);
  const wr = sm(T.rounded - 0.05, T.rounded + 0.25, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.25, t));
  A0.copy(HIP).add(OFF).addScaledVector(N, 0.14); A1.copy(SHO).add(OFF).addScaledVector(N, 0.14);
  const hump = (0.09 + 0.05 * sink) * (1 - k) * (0.9 + 0.3 * flash(t, T.rounds));
  const prev = V3(0, 0, 0), cur = V3(0, 0, 0);
  for (let i = 0; i < arcN; i++) {
    const u0 = i / arcN, u1 = (i + 1) / arcN;
    prev.lerpVectors(A0, A1, u0).addScaledVector(N, hump * Math.sin(Math.PI * u0));
    cur.lerpVectors(A0, A1, u1).addScaledVector(N, hump * Math.sin(Math.PI * u1));
    arc[i].set(prev, cur, wr * (0.85 + 0.15 * Math.sin(t * 8)));
  }
  lowDot.position.copy(HIP).addScaledVector(D, 0.12).addScaledVector(N, 0.16).add(OFF);
  lowMat.opacity = sm(T.low - 0.1, T.low + 0.15, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t)) * (0.55 + 0.45 * Math.sin(t * 9));
  lowDot.scale.setScalar(1 + 0.5 * flash(t, T.low));
  floorRing.position.set(OFF.x * 0.5, 0.03, H2.z); floorRing.rotation.set(-Math.PI / 2, 0, 0);
  floorRing.material.opacity = sm(T.floor - 0.1, T.floor + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)) * (0.6 + 0.4 * Math.sin(t * 9));
  floorRing.scale.setScalar(1 + 0.3 * flash(t, T.floor));

  // right: knee dot, hip dot (the hinge), belly -> thigh line, long spine line
  kneeDot.position.copy(KNEE).add(OFF);
  kneeDot.material.opacity = sm(T.knees - 0.1, T.knees + 0.15, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t));
  hipDot.position.copy(HIP).add(OFF);
  hipDot.material.opacity = sm(T.hinge - 0.1, T.hinge + 0.15, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t)) * (0.8 + 0.4 * flash(t, T.hips));
  const bl = sm(T.belly - 0.1, T.belly + 0.15, t) * (1 - sm(T.spine - 0.15, T.spine + 0.1, t));
  A0.copy(HIP).addScaledVector(D, 0.3).addScaledVector(N, -0.12).add(OFF);
  A1.lerpVectors(HIP, KNEE, 0.6).add(OFF);
  bellyLine.set(A0, A1, bl * (0.85 + 0.3 * flash(t, T.thighs)));
  const ok = sm(T.spine - 0.15, T.spine + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  A0.copy(HIP).add(OFF).addScaledVector(N, 0.14); A1.copy(SHO).add(OFF).addScaledVector(N, 0.14);
  spineLine.set(A0, A1, ok * (0.85 + 0.4 * flash(t, T.long)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
