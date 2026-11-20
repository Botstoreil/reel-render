// NEVER HOLD YOUR BREATH (YogaFlow 07). Same mat, person and side view (from +x, face toward -z) as chair-hips.
// The "hard pose" is a good chair pose (POSE.right from chair-hips).
// s1 stands, sits into the chair on "hard"; a breath ball in front of the chest turns red and freezes on "hold".
// s2 shoulders hike toward the ears, red rings on the shoulder ("shoulders") and the jaw ("jaw").
// s3 a red energy bar behind drains on "tire" ... "faster", the torso sags a little.
// s4 shoulders drop, ball turns green and breathes slowly; a green breath line from the nose in / out on "in" / "out".
// s5 exhale longer: the ball shrinks slowly, grows fast; the nose line stretches further on "exhale" / "longer".
// s6 eases half way out of the pose on "ease" (green arrow up from the hips). s7-s8 calm wide, still breathing.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s1: S.s1[0], hard: g("s1", "hard"), hold: g("s1", "hold"), breath1: g("s1", "breath"),
  s2: S.s2[0], tightens: g("s2", "tightens"), shoulders: g("s2", "shoulders"), jaw: g("s2", "jaw"),
  s3: S.s3[0], tire: g("s3", "tire"), faster: g("s3", "faster"),
  s4: S.s4[0], slowly: g("s4", "slowly"), inW: g("s4", "in"), outW: g("s4", "out"), nose: g("s4", "nose"),
  s5: S.s5[0], exhale: g("s5", "exhale"), longer: g("s5", "longer"), inhale: g("s5", "inhale"),
  s6: S.s6[0], ease: g("s6", "ease"), little: g("s6", "little"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.8, 0.012, 2.2, 0, 0.006, 0, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 2.2, 0.4, 0.014, 0, glow(VIOLET, 1.4), false), box(0.02, 0.004, 2.2, -0.4, 0.014, 0, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.0, 0.15, -1.2, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.0 + x, 0.5, -1.2, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }
const floorGlow = patch(1.6, 3.0, VIOLET, 0.5); floorGlow.position.set(0, 0.02, 0); floorGlow.set(0.6);

// ---------- the person (rig + poses from chair-hips) ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const FEET = [LKn.children[1], RKn.children[1]];
const Lsh = spine.children[2], Rsh = spine.children[3];
const Lel = Lsh.children[1], Rel = Rsh.children[1];
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0), XA = V3(1, 0, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion(), qF = new THREE.Quaternion();
const d = V3(0, 0, 0), d2 = V3(0, 0, 0);
const POSE = {
  stand: { HAND: [0.89, 0.0],   ELB: [1.21, 0.0],   SHO: [1.51, 0.0],   HIP: [0.95, 0.0],   KNEE: [0.5, 0.0],    FOOT: [0.04, 0.0] },
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
function applyPose(t) {
  hips.position.set(0, J.HIP.y, J.HIP.z);
  d.subVectors(J.SHO, J.HIP).normalize(); spine.quaternion.setFromUnitVectors(UP, d);
  d.subVectors(J.KNEE, J.HIP).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.FOOT, J.KNEE).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [th, kn] of [[LTh, LKn], [RTh, RKn]]) { th.quaternion.copy(qa); kn.quaternion.copy(qa).invert().multiply(qb); }
  qF.identity();
  for (const f of FEET) f.quaternion.copy(qb).invert().multiply(qF);
  qs.copy(spine.quaternion).invert();
  d.subVectors(J.ELB, J.SHO).normalize(); qa.setFromUnitVectors(DOWN, d);
  d2.subVectors(J.HAND, J.ELB).normalize(); qb.setFromUnitVectors(DOWN, d2);
  for (const [sh, el] of [[Lsh, Lel], [Rsh, Rel]]) { sh.quaternion.copy(qs).multiply(qa); el.quaternion.copy(qa).invert().multiply(qb); }
  P.head.quaternion.identity();
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
const OFF = V3(0.3, 0, 0); // floats on the camera side of the body
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 8, 40), m); o.rotation.y = Math.PI / 2; o.renderOrder = 21; scene.add(o); return o; };
const shRing = ringOf(RED, 0.09), jawRing = ringOf(RED, 0.08);
// breath ball in front of the chest (camera side): red + frozen while held, green + breathing after s4
const ballM = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
const ball = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), ballM); ball.renderOrder = 20; scene.add(ball);
const cR = new THREE.Color(RED).multiplyScalar(1.4), cG = new THREE.Color(GREEN).multiplyScalar(1.4);
// energy bar behind the person (s3): frame + red fill that drains
const BAR = { x: 0.3, z: 0.75, y0: 0.15, h: 1.0 };
const barFrame = beam(VIOLET, 0.5, 0.06), barFill = beam(RED, 1.2, 0.05);
// breath line from the nose (s4-s6), arrow up from the hips (s6)
const noseLine = beam(GREEN, 1.1, 0.02), upArrow = beam(GREEN, 0.7, 0.03);
const HEAD = V3(0, 0, 0), CH = V3(0, 0, 0), A0 = V3(0, 0, 0), A1 = V3(0, 0, 0);

// ---------- text ----------
title("NEVER HOLD YOUR BREATH");
cap("s2", "shoulders", "SHOULDERS TIGHTEN", RED);
cap("s2", "jaw", "JAW CLENCHES", RED, { boom: 0.35 });
cap("s3", "tire", "TIRE OUT FASTER", RED, { boom: 0.35 });
cap("s4", "slowly", "BREATHE SLOWLY", GREEN);
cap("s4", "nose", "THROUGH THE NOSE", GREEN);
cap("s5", "exhale", "LONGER EXHALE", GREEN, { boom: 0.3 });
cap("s6", "ease", "EASE OUT A LITTLE", GREEN);
endCard([["KEEP BREATHING", 1], ["OR EASE OFF", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, a little in front ----------
const st = (a, b = a) => [[0, a], [3, b]];
const BODY = st([5.8, 1.35, -0.6, 0, 1.12, 0.1, 46], [5.5, 1.33, -0.55, 0, 1.12, 0.1, 46]);
const UPPER = st([2.9, 1.4, -1.0, 0, 1.15, -0.1, 42], [2.7, 1.4, -0.95, 0, 1.15, -0.1, 42]);
const SH = [
  { at: 0, K: [[0, [6.6, 1.45, -1.5, 0, 1.25, 0, 46]], [2.6, [6.1, 1.4, -1.4, 0, 1.22, 0, 46]]] },
  { at: T.s2, K: UPPER },
  { at: T.s3, K: st([5.2, 1.3, 0.6, 0, 1.0, 0.3, 46], [5.0, 1.3, 0.55, 0, 1.0, 0.3, 46]) }, // body + the bar behind
  { at: T.s4, K: UPPER },
  { at: T.s5, K: st([3.1, 1.35, -1.3, 0, 1.15, -0.25, 42], [2.9, 1.35, -1.25, 0, 1.15, -0.25, 42]) },
  { at: T.s6, K: BODY },
  { at: T.s7, calm: 1, K: [[0, [4.8, 1.9, -1.9, 0, 1.3, 0, 48]], [5, [5.2, 2.0, -2.0, 0, 1.3, 0, 48]]] },
];

// breathing phase: 0 = empty, 1 = full. s4 even ~2 s cycle; from s5 inhale 0.8 s, exhale 1.4 s (exhale longer)
function breath(t) {
  if (t < T.s5) { return 0.5 - 0.5 * Math.cos((t - T.s4) * Math.PI); }
  const c = 2.2, u = ((t - T.s5) % c + c) % c;
  return u < 1.4 ? 1 - sm(0, 1.4, u) : sm(1.4, 2.2, u);
}

run("breath", (t) => {
  P.set({ t });
  const kIn = sm(T.hard - 0.15, T.hold, t);           // stand -> chair on "hard"
  const kOut = 0.45 * sm(T.ease - 0.1, T.little, t);    // half way back up on "ease"
  blend([["stand", 1], ["right", kIn * (1 - kOut)]]);
  // tension: shoulders up toward the ears from "tightens" to s4; a small sag while tiring (s3)
  const tense = sm(T.tightens - 0.1, T.shoulders + 0.1, t) * (1 - sm(T.s4, T.slowly, t));
  const sag = sm(T.tire, T.faster + 0.2, t) * (1 - sm(T.s4, T.slowly, t));
  for (const n of ["SHO", "ELB", "HAND"]) J[n].y += 0.07 * tense - 0.06 * sag;
  J.HIP.y -= 0.03 * sag;
  applyPose(t);

  P.head.getWorldPosition(HEAD);
  CH.copy(J.HIP).lerp(J.SHO, 0.7); CH.x = 0.28;

  // breath ball: red and frozen (tiny tremble) on "hold" to s4, then green and breathing
  const held = sm(T.hold - 0.1, T.breath1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  const free = sm(T.s4 - 0.1, T.s4 + 0.2, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.3, t));
  const b = breath(t);
  ball.position.copy(CH);
  ball.scale.setScalar(held > free ? 0.075 + 0.002 * Math.sin(t * 40) : 0.06 + 0.06 * b);
  ballM.color.copy(held > free ? cR : cG);
  ballM.opacity = 0.55 * Math.max(held, free);

  // s2: red rings on the shoulder and the jaw
  const off2 = 1 - sm(T.s3 - 0.1, T.s3 + 0.2, t), pul = 0.7 + 0.3 * Math.sin(t * 9);
  shRing.position.set(0.3, J.SHO.y + 0.02, J.SHO.z); shRing.material.opacity = sm(T.shoulders - 0.1, T.shoulders + 0.1, t) * off2 * pul;
  shRing.scale.setScalar(1 + 0.4 * flash(t, T.shoulders));
  jawRing.position.copy(HEAD).add(OFF); jawRing.position.y -= 0.08; jawRing.position.z -= 0.04;
  jawRing.material.opacity = sm(T.jaw - 0.1, T.jaw + 0.1, t) * off2 * pul; jawRing.scale.setScalar(1 + 0.4 * flash(t, T.jaw));

  // s3: energy bar drains from full to a quarter
  const bA = sm(T.s3 - 0.1, T.s3 + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  const lvl = 1 - 0.75 * sm(T.tire, T.faster + 0.25, t);
  A0.set(BAR.x, BAR.y0, BAR.z); A1.set(BAR.x, BAR.y0 + BAR.h, BAR.z); barFrame.set(A0, A1, 0.4 * bA);
  A1.set(BAR.x + 0.01, BAR.y0 + BAR.h * lvl, BAR.z); barFill.set(A0, A1, bA * (0.8 + 0.2 * flash(t, T.faster)));

  // s4-s6: green breath line out of the nose, as long as the exhale is far along
  const nA = sm(T.inW - 0.15, T.inW + 0.1, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  A0.copy(HEAD).add(V3(0.05, -0.04, -0.12));
  A1.copy(A0).add(V3(0, -0.06, -0.08 - 0.4 * (1 - b)));
  noseLine.set(A0, A1, nA * (0.8 + 0.2 * flash(t, T.longer)));

  // s6: green arrow up from the hips while easing out
  const uA = sm(T.ease - 0.1, T.ease + 0.15, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  A0.set(0.32, J.HIP.y, J.HIP.z); A1.set(0.32, J.HIP.y + 0.35, J.HIP.z); upArrow.set(A0, A1, uA);

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
