// NEVER LET YOUR KNEE CAVE IN (YogaFlow). Warrior two on a mat.
// s1 person holds warrior two, on "cave" the front knee falls inward. s2 red line: shin twisted off the foot.
// s3 stance grows long and deep, knee caves more. s4 knee stacks over the ankle (green plumb line).
// s5 green line knee -> middle toes, outer edge of the foot lights up. s6 shorter stance, hips rise. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, WHITE, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  cave: g("s1", "cave"), s2: S.s2[0], inward: g("s2", "inward"), twists: g("s2", "twists"),
  s3: S.s3[0], stance: g("s3", "stance"), long: g("s3", "long"), deep: g("s3", "deep"),
  s4: S.s4[0], stack: g("s4", "stack"), ankle: g("s4", "ankle"),
  s5: S.s5[0], middle: g("s5", "middle"), press: g("s5", "press"), outer: g("s5", "outer"),
  s6: S.s6[0], shorten: g("s6", "shorten"), less: g("s6", "less"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: yoga mat, a block, a plant, soft floor glow ----------
scene.add(box(2.5, 0.012, 0.72, -0.1, 0.006, 0, mat(0x6a5cff, 0.35), false));
scene.add(box(2.5, 0.004, 0.02, -0.1, 0.014, 0.36, glow(VIOLET, 1.4), false), box(2.5, 0.004, 0.02, -0.1, 0.014, -0.36, glow(VIOLET, 1.4), false));
scene.add(box(0.23, 0.12, 0.15, -1.6, 0.06, -0.75, mat(0x8a7cff, 0.3)));
scene.add(box(0.26, 0.3, 0.26, 1.7, 0.15, 0.9, mat(0x2a2470, 0.2)));
for (const [x, z, r] of [[0, 0.13, 0], [-0.08, 0.1, 0.4], [0.08, 0.1, -0.4]]) { const l = box(0.06, 0.5, 0.02, 1.7 + x, 0.5, 0.9 + z * 0, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(3.2, 1.6, VIOLET, 0.5); floorGlow.position.set(-0.1, 0.02, 0); floorGlow.set(0.6);

// ---------- the person, posed into warrior two by hand (right leg forward, facing -z, gaze over the right hand) ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const Lsh = spine.children[2], Rsh = spine.children[3];
const DOWN = V3(0, -1, 0), qYaw = new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), -Math.PI / 2);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), K = V3(0, 0, 0), d = V3(0, 0, 0);
const ANK = V3(0, 0.07, 0), TOES = V3(0, 0.04, 0);
function pose(a, cave, t) {
  const hipY = 0.45 * Math.cos(a) + 0.5;
  hips.position.y = hipY;
  ANK.set(0.12 + 0.45 * Math.sin(a), 0.07, 0); TOES.set(ANK.x + 0.2, 0.04, -0.01);
  // front (right) thigh out to +x, caving rolls it toward -z
  RTh.rotation.set(cave, 0, a);
  // back (left) leg straight to the floor
  const tb = Math.acos(Math.min(1, (hipY - 0.04) / 0.95));
  LTh.rotation.set(0, 0, -tb); LKn.rotation.set(0, -0.35, 0); LKn.quaternion.setFromEuler(LKn.rotation);
  // front shin: from the knee down to the planted ankle, foot pointing +x
  P.g.updateMatrixWorld(true);
  RKn.getWorldPosition(K); d.subVectors(ANK, K); const L = d.length(); d.normalize();
  RTh.getWorldQuaternion(qa).invert();
  qb.setFromUnitVectors(DOWN, d).multiply(qYaw);
  RKn.quaternion.copy(qa.multiply(qb)); RKn.scale.set(1, (L + 0.03) / 0.46, 1);
  // arms out level, gaze over the front hand, a slow breath
  const br = 0.03 * Math.sin(t * 1.7);
  Rsh.rotation.set(0, 0, 1.57 + br); Lsh.rotation.set(0, 0, -1.57 - br);
  Rsh.children[1].rotation.set(0, 0, 0); Lsh.children[1].rotation.set(0, 0, 0);
  spine.rotation.set(0, 0, 0);
  P.head.rotation.set(0, -1.25, 0);
  P.g.updateMatrixWorld(true);
  RKn.getWorldPosition(K);
}

// ---------- guides ----------
const redShin = beam(RED, 2.4, 0.035);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0 }));
scene.add(ring);
const plumb = beam(GREEN, 2.4, 0.03), toeLine = beam(GREEN, 2.4, 0.03);
const mEdge = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0 });
const edge = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.025), mEdge); scene.add(edge);
const stancePatch = patch(1, 0.5, RED, 1.1), goodPatch = patch(1, 0.5, GREEN, 1.0);

// ---------- text ----------
title("NEVER LET YOUR KNEE CAVE IN");
cap("s2", "inward", "KNEE CAVES IN", RED);
cap("s2", "twists", "IT TWISTS", RED, { boom: 0.35 });
cap("s3", "long", "STANCE TOO LONG", RED);
cap("s3", "deep", "TOO DEEP", RED);
cap("s4", "stack", "STACK THE KNEE", GREEN);
cap("s4", "ankle", "OVER THE ANKLE", GREEN, { boom: 0.3 });
cap("s5", "middle", "MIDDLE TOES", GREEN);
cap("s5", "press", "PRESS OUTER EDGE", VIOLET);
cap("s6", "shorten", "SHORTEN STANCE", GREEN);
cap("s6", "less", "LESS DEPTH", VIOLET);
endCard([["KNEE OVER ANKLE", 1], ["TO MIDDLE TOES", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; the person faces -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: wide front, warrior two
  { at: 0, K: [[0, [0.5, 1.35, -3.6, 0, 0.95, 0, 48]], [2.0, [0.4, 1.25, -3.0, 0.05, 0.9, 0, 48]]] },
  // "cave": the knee from the front foot's side
  { at: T.cave - 0.15, K: st([2.0, 0.9, -0.95, 0.35, 0.45, 0, 42], [1.85, 0.85, -0.85, 0.35, 0.45, 0, 40]) },
  // s2: close from the front, the twisted shin
  { at: T.s2, K: st([0.75, 0.75, -1.55, 0.35, 0.42, 0, 44], [0.7, 0.72, -1.35, 0.35, 0.42, 0, 42]) },
  // s3: high three-quarter, the stance grows
  { at: T.s3, K: st([1.4, 2.3, -2.7, -0.1, 0.55, 0, 50], [1.2, 2.2, -2.4, -0.1, 0.55, 0, 50]) },
  // s4: front close, knee comes back over the ankle
  { at: T.s4, K: st([0.6, 0.8, -1.6, 0.35, 0.42, 0, 44], [0.55, 0.78, -1.45, 0.35, 0.42, 0, 42]) },
  // s5: from the front foot's side, knee -> middle toes, outer edge
  { at: T.s5, K: st([1.95, 0.85, -0.9, 0.38, 0.35, 0, 42], [1.8, 0.8, -0.75, 0.38, 0.33, 0, 40]) },
  // "press into the outer edge": low and close on the foot
  { at: T.press - 0.15, K: st([1.2, 0.45, 0.75, 0.42, 0.08, 0, 42], [1.1, 0.42, 0.65, 0.42, 0.08, 0, 40]) },
  // s6: wide front, shorter stance
  { at: T.s6, K: st([0.4, 1.3, -3.2, 0, 0.9, 0, 48], [0.35, 1.25, -2.9, 0, 0.9, 0, 48]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.3, 1.4, -3.4, 0, 1.0, 0, 50]], [5, [0.3, 1.6, -4.0, 0, 1.0, 0, 50]]] },
];

run("knee-cave", (t) => {
  // depth (front thigh angle) and cave (inward roll) per line
  const a = 0.95 + 0.2 * sm(T.long - 0.1, T.long + 0.4, t) + 0.15 * sm(T.deep - 0.1, T.deep + 0.4, t)
    - 0.3 * sm(T.stack - 0.05, T.ankle, t) - 0.2 * sm(T.shorten - 0.05, T.shorten + 0.5, t);
  const bad = sm(T.cave - 0.1, T.cave + 0.25, t) + 0.15 * sm(T.deep - 0.1, T.deep + 0.4, t);
  const cave = 0.42 * bad * (1 - sm(T.stack - 0.05, T.ankle, t));
  P.set({ t });
  pose(a, cave, t);

  // wrong: red shin line + ring on the knee
  const wr = sm(T.cave - 0.05, T.cave + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.25, t));
  redShin.set(K, ANK, wr);
  ring.position.copy(K); ring.lookAt(K.x + 1, K.y, K.z); ring.material.opacity = wr * (0.6 + 0.4 * Math.sin(t * 9));
  ring.scale.setScalar(1 + 0.4 * flash(t, T.twists));
  // stance too long: red floor zone between the feet
  const lfx = -0.12 - 0.95 * Math.sin(Math.acos(Math.min(1, (0.45 * Math.cos(a) + 0.46) / 0.95)));
  const span = Math.max(0.2, ANK.x - lfx);
  stancePatch.position.set((ANK.x + lfx) / 2, 0.03, 0); stancePatch.scale.set(span, 1, 1);
  stancePatch.set(sm(T.stance - 0.1, T.stance + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)));
  goodPatch.position.copy(stancePatch.position); goodPatch.scale.copy(stancePatch.scale);
  goodPatch.set(sm(T.shorten - 0.05, T.shorten + 0.3, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.3, t)));

  // right: plumb line knee -> ankle, then knee -> middle toes, outer edge glow
  const ok = sm(T.ankle - 0.35, T.ankle, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.3, t));
  plumb.set(K, V3(K.x, 0.02, K.z), ok * (0.8 + 0.4 * flash(t, T.ankle)));
  const tl = sm(T.middle - 0.15, T.middle + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  toeLine.set(K, TOES, tl);
  edge.position.set(ANK.x + 0.08, 0.03, 0.065);
  mEdge.opacity = sm(T.outer - 0.1, T.outer + 0.15, t) * (1 - sm(T.s6 + 0.3, T.s6 + 0.6, t)) * (0.75 + 0.25 * Math.sin(t * 8));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
