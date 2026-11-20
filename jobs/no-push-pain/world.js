// NEVER TEACH "PUSH THROUGH PAIN" (YogaFlow, to teachers). Standing forward fold on a mat, side view (person faces -z).
// s1 the student folds, then on "push" forces deeper (hands toward the floor), red ring on the back of the thigh on "pain".
// s2 forces even more on "harder"; caption on "room". s3 the red ring flashes on "sharp" / "pinching" / "burning";
// on "back" the student comes out a little. s4 soft knees + long spine, green line along the back of the thigh on "strong".
// s5 comes out a little more on "coming out" (green arrow up). s6 violet blocks pop in, hands on them; on "straps" a violet
// strap from the hands to the feet. s7-s8 calm wide. Same rig as forward-fold (two-bone IK in the side plane).
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  push1: g("s1", "push"), pain: g("s1", "pain"),
  s2: S.s2[0], harder: g("s2", "harder"), room: g("s2", "room"),
  s3: S.s3[0], sharp: g("s3", "sharp"), pinching: g("s3", "pinching"), burning: g("s3", "burning"), back: g("s3", "back"), deeper: g("s3", "deeper"),
  s4: S.s4[0], strong: g("s4", "strong"), painful: g("s4", "painful"),
  s5: S.s5[0], coming: g("s5", "coming"), out: g("s5", "out"), allowed: g("s5", "allowed"),
  s6: S.s6[0], blocks: g("s6", "blocks"), straps: g("s6", "straps"), cue: g("s6", "cue"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.72, 0.012, 2.3, 0, 0.006, -0.3, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.3, 0.36, 0.014, -0.3, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.3, -0.36, 0.014, -0.3, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, 1.0, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, 1.0, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, -0.3); floorGlow.set(0.6);
// yoga blocks (pop in on "blocks")
const BZ = -0.62, blocks = [];
for (const x of [0.25, -0.25]) { const b = box(0.12, 0.23, 0.15, x, 0.115, BZ, mat(0x8a7cff, 0.45)); scene.add(b); blocks.push(b); }

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
// k: 0 = straight legs, hanging (forcing), 1 = soft knees, long spine. sink: forced deeper. up: came out a little.
function pose(k, sink, up, HT, t) {
  const br = 0.008 * Math.sin(t * 1.6);
  HIP.set(0, lerp(0.99, 0.84, k) + br, lerp(0.05, 0.12, k));
  hips.position.set(0, HIP.y, HIP.z);
  D.set(0, lerp(-0.62 - 0.3 * sink, -0.45, k) + 0.5 * up, lerp(-0.78 + 0.22 * sink, -0.88, k)).normalize();
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
  P.head.rotation.set(0.3 * sink * (1 - k), 0, 0);
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
const OFF = V3(0.32, 0, 0); // guides float just in front of the body, on the camera side
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), HT = V3(0, 0, 0), HAM = V3(0, 0, 0);
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 8, 40), m); o.renderOrder = 21; scene.add(o); return o; };
const painRing = ringOf(RED, 0.11), floorRing = ringOf(RED, 0.14);
const painMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.0), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
const painDot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), painMat); painDot.renderOrder = 21; scene.add(painDot);
const hamLine = beam(GREEN, 2.0, 0.026); hamLine.material.depthTest = false; hamLine.renderOrder = 20;
const upArrow = [beam(GREEN, 2.0, 0.026), beam(GREEN, 2.0, 0.026), beam(GREEN, 2.0, 0.026)];
for (const a of upArrow) { a.material.depthTest = false; a.renderOrder = 20; }
const strap = beam(VIOLET, 1.8, 0.02);
const blockMat = glow(VIOLET, 1.6);
for (const b of blocks) b.add(box(0.13, 0.004, 0.16, 0, 0.117, 0, blockMat, false));

// ---------- text ----------
title("NEVER SAY PUSH THROUGH PAIN");
cap("s2", "harder", "PUSHING HARDER", RED);
cap("s2", "room", "TO KEEP UP", RED, { boom: 0.3 });
cap("s3", "sharp", "SHARP. PINCHING. BURNING.", RED);
cap("s3", "back", "= BACK OFF", GREEN, { boom: 0.35 });
cap("s4", "strong", "STRONG STRETCH", GREEN);
cap("s4", "painful", "NEVER PAINFUL", RED, { boom: 0.3 });
cap("s5", "coming", "COME OUT A LITTLE", GREEN);
cap("s5", "allowed", "ALWAYS ALLOWED", VIOLET, { boom: 0.3 });
cap("s6", "blocks", "BLOCKS + STRAPS", VIOLET);
cap("s6", "cue", "PART OF THE CUE", GREEN);
endCard([["STRONG IS FINE", 1], ["SHARP MEANS STOP", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, the face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: wide side view, the whole fold
  { at: 0, K: [[0, [3.6, 0.75, -0.15, 0, 0.55, -0.15, 46]], [2.0, [3.3, 0.72, -0.15, 0, 0.55, -0.15, 46]]] },
  // "pain": closer on the back of the thigh
  { at: T.pain - 0.2, K: st([2.4, 0.7, 0.4, 0, 0.6, 0.0, 44], [2.3, 0.7, 0.38, 0, 0.6, 0.0, 44]) },
  // s2: low from the hands side, forcing to the floor
  { at: T.s2, K: st([2.6, 0.6, -1.6, 0, 0.5, -0.25, 46], [2.45, 0.58, -1.5, 0, 0.5, -0.25, 46]) },
  // s3: close on the back of the thigh, then wide when backing off
  { at: T.s3, K: st([2.2, 0.75, 0.45, 0, 0.62, 0.02, 42], [2.1, 0.74, 0.42, 0, 0.62, 0.02, 42]) },
  { at: T.back - 0.15, K: st([3.2, 0.9, -0.15, 0, 0.55, -0.15, 46], [3.0, 0.88, -0.15, 0, 0.55, -0.15, 46]) },
  // s4: side, the green line on the back of the thigh
  { at: T.s4, K: st([2.6, 0.8, 0.2, 0, 0.6, -0.05, 44], [2.45, 0.78, 0.18, 0, 0.6, -0.05, 44]) },
  // s5: wide side, comes out a little
  { at: T.s5, K: st([3.3, 0.95, -0.2, 0, 0.6, -0.2, 46], [3.1, 0.92, -0.2, 0, 0.6, -0.2, 46]) },
  // s6: low three-quarter from the front, the blocks and the strap
  { at: T.s6, K: st([2.5, 0.65, -1.7, 0, 0.45, -0.35, 46], [2.35, 0.62, -1.6, 0, 0.45, -0.35, 46]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.1, 0, 1.0, -0.15, 48]], [5, [4.0, 1.85, 0.1, 0, 1.05, -0.15, 48]]] },
];

const H1 = V3(0, 0, 0), H2 = V3(0, 0, 0), H3 = V3(0, 0, 0), H4 = V3(0, 0, 0);
run("no-push-pain", (t) => {
  // forcing: on "push" (s1), more on "harder" (s2), ends on "back" (s3)
  const end = 1 - sm(T.back - 0.1, T.back + 0.4, t);
  const sink = (0.6 * sm(T.push1 - 0.1, T.pain, t) + 0.4 * sm(T.harder - 0.1, T.harder + 0.4, t)) * end;
  const fo = sm(T.push1 - 0.05, T.pain + 0.1, t) * end;
  const k = sm(T.s4 - 0.1, T.strong + 0.2, t);
  // comes out a little on "back", more on "coming out", settles down onto the blocks in s6
  const up = (0.25 * sm(T.back - 0.05, T.back + 0.45, t) * (1 - sm(T.s4, T.s4 + 0.5, t))
    + 0.3 * sm(T.coming - 0.05, T.out + 0.3, t)) * (1 - 0.6 * sm(T.s6 - 0.1, T.blocks + 0.2, t));
  const onB = sm(T.blocks - 0.15, T.blocks + 0.25, t);
  P.set({ t });
  pose(k, sink, up, HAND, t);
  H1.set(0, SHO.y - 0.48, SHO.z - 0.06);   // hanging
  H2.set(0, 0.06, SHO.z - 0.1);            // forcing to the floor
  H3.set(0, SHO.y - 0.42, SHO.z - 0.18);   // relaxed
  H4.set(0, 0.27, BZ);                     // on the blocks
  HT.copy(H1).lerp(H2, fo).lerp(H3, Math.max(k, 1 - end)).lerp(H4, onB);
  pose(k, sink, up, HT, t);

  // blocks pop in
  const bk = sm(T.blocks - 0.3, T.blocks, t);
  for (const b of blocks) { b.visible = bk > 0.01; b.scale.setScalar(Math.max(0.01, bk * (1 + 0.15 * flash(t, T.blocks)))); }
  blockMat.color.set(VIOLET).multiplyScalar(1.2 + 1.0 * flash(t, T.blocks));

  // the back of the thigh (hamstring), on the camera side
  HAM.lerpVectors(HIP, KNEE, 0.5); HAM.z += 0.08; HAM.add(OFF);
  // red: pain ring + dot on the hamstring (s1 "pain" to s3 "back"), flashes on each pain word
  const pr = sm(T.pain - 0.1, T.pain + 0.15, t) * (1 - sm(T.back + 0.1, T.back + 0.35, t));
  const fl = flash(t, T.pain) + flash(t, T.sharp) + flash(t, T.pinching) + flash(t, T.burning) + 0.6 * flash(t, T.harder);
  painRing.position.copy(HAM); painRing.lookAt(HAM.x + 1, HAM.y, HAM.z);
  painRing.material.opacity = pr * (0.6 + 0.4 * Math.sin(t * 10)); painRing.scale.setScalar(1 + 0.45 * fl);
  painDot.position.copy(HAM); painMat.opacity = pr * (0.5 + 0.4 * Math.sin(t * 10)); painDot.scale.setScalar(1 + 0.6 * fl);
  // red ring on the floor where the hands are forced (s2)
  floorRing.position.set(OFF.x * 0.5, 0.03, H2.z); floorRing.rotation.set(-Math.PI / 2, 0, 0);
  floorRing.material.opacity = sm(T.s2 - 0.1, T.s2 + 0.2, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.1, t)) * (0.6 + 0.4 * Math.sin(t * 9));

  // green: line along the back of the thigh in s4 ("strong")
  const hl = sm(T.strong - 0.1, T.strong + 0.15, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.15, t));
  A0.copy(HIP).add(OFF); A0.z += 0.08; A1.copy(KNEE).add(OFF); A1.z += 0.08;
  hamLine.set(A0, A1, hl * (0.85 + 0.3 * flash(t, T.strong)));
  // green arrow up over the back on "coming out" (s5)
  const ua = sm(T.coming - 0.1, T.coming + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t));
  const tip = V3(0, 0, 0).copy(HIP).lerp(SHO, 0.5).addScaledVector(N, 0.3).add(OFF), base = tip.clone(); base.y -= 0.0; tip.y += 0.3 * (1 + 0.15 * flash(t, T.out));
  upArrow[0].set(base, tip, ua);
  A0.copy(tip).add(V3(0, -0.08, 0.07)); upArrow[1].set(tip, A0, ua);
  A1.copy(tip).add(V3(0, -0.08, -0.07)); upArrow[2].set(tip, A1, ua);
  // violet strap from the hands to the front of the feet (s6 "straps")
  const sp = sm(T.straps - 0.1, T.straps + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7, t));
  A0.copy(HAND); A0.x = 0.12; A1.set(0.12, 0.03, FOOT.z - 0.14); strap.set(A0, A1, sp * (0.85 + 0.3 * flash(t, T.straps)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
