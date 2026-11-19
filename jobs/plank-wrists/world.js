// NEVER SINK INTO YOUR WRISTS (YogaFlow). High plank on a mat, side view from +x (the face toward -z).
// s1 plank, shoulders slide forward past the hands on "sink". s2 red line shoulder -> heel of the hand, red pressure
// spot under the heel on "spot". s3 close on the hand: flat, closed fingers (red). s4 fingers fan out on "spread",
// shoulders move back over the wrists on "stack" (green vertical line). s5 green dots on the knuckles, violet on the
// finger pads, fingertips press on "gripping". s6 knees drop to the mat, then forearm plank. s7-s8 calm wide plank.
// Joints are posed explicitly per key pose (y, z) and blended; bones point along the joint-to-joint directions.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  sink: g("s1", "sink"), heel: g("s1", "heel"),
  s2: S.s2[0], weight: g("s2", "weight"), wrist: g("s2", "wrist"), pressure: g("s2", "pressure"), spot: g("s2", "spot"),
  s3: S.s3[0], closed: g("s3", "closed"), nothing: g("s3", "nothing"), load: g("s3", "load"),
  s4: S.s4[0], spread: g("s4", "spread"), wide: g("s4", "wide"), stack: g("s4", "stack"), wrists: g("s4", "wrists"),
  s5: S.s5[0], knuckles: g("s5", "knuckles"), pads: g("s5", "pads"), gripping: g("s5", "gripping"),
  s6: S.s6[0], still: g("s6", "still"), drop: g("s6", "drop"), knees: g("s6", "knees"), forearms: g("s6", "forearms"),
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
for (const h of P.hands) h.children[0].visible = false; // the hand props below replace the ball hands
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion();
const d = V3(0, 0, 0), d2 = V3(0, 0, 0);

// key poses: [y, z] for hand, elbow, shoulder, hip, knee, ankle
const POSE = {
  wrong:   { HAND: [0.06, -0.5], ELB: [0.33, -0.6], SHO: [0.58, -0.68], HIP: [0.40, -0.15], KNEE: [0.25, 0.27], FOOT: [0.08, 0.68] },
  right:   { HAND: [0.06, -0.5], ELB: [0.36, -0.5], SHO: [0.66, -0.5], HIP: [0.44, 0.015], KNEE: [0.26, 0.43], FOOT: [0.08, 0.85] },
  knees:   { HAND: [0.06, -0.5], ELB: [0.34, -0.49], SHO: [0.62, -0.48], HIP: [0.42, 0.0], KNEE: [0.07, 0.25], FOOT: [0.30, 0.62] },
  forearm: { HAND: [0.05, -0.77], ELB: [0.06, -0.45], SHO: [0.36, -0.45], HIP: [0.25, 0.10], KNEE: [0.165, 0.54], FOOT: [0.08, 0.98] },
};
const J = {}; for (const n of ["HAND", "ELB", "SHO", "HIP", "KNEE", "FOOT"]) J[n] = V3(0, 0, 0);
const tmp = V3(0, 0, 0);
// weights: list of [poseName, w]; applied in order as successive lerps
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
  P.head.rotation.set(-0.35, 0, 0); // look at the mat a little ahead
  P.g.updateMatrixWorld(true);
}

// ---------- hand props on the mat (palm + 4 fingers + thumb), one per side ----------
const mSkin = new THREE.MeshStandardMaterial({ color: 0xd99a74, emissive: 0x4a2414, roughness: 0.6 });
const HS = 1.25; // a little bigger than life so the fingers read
function makeHand(s) {
  const G = new THREE.Group(); G.scale.setScalar(HS); scene.add(G);
  G.add(box(0.09, 0.024, 0.1, 0, 0.012, 0, mSkin));                    // palm, heel at +z
  const fingers = [];
  for (let i = 0; i < 4; i++) {
    const piv = new THREE.Group(); piv.position.set((i - 1.5) * 0.022, 0.01, -0.05); G.add(piv);
    piv.add(box(0.018, 0.018, 0.085, 0, 0, -0.0425, mSkin));
    fingers.push(piv);
  }
  const th = new THREE.Group(); th.position.set(-s * 0.045, 0.01, -0.005); G.add(th);
  th.add(box(0.02, 0.018, 0.065, 0, 0, -0.0325, mSkin));
  return { G, fingers, th, s };
}
const HANDS = [makeHand(1), makeHand(-1)];
const XS = [0.29, -0.29];
const SPREAD = [-0.32, -0.11, 0.11, 0.32];
const dotOf = (hex, r = 0.012) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), m); o.renderOrder = 21; scene.add(o); return o; };
const knDots = [], padDots = [];
for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) { knDots.push(dotOf(GREEN)); padDots.push(dotOf(VIOLET)); }
const heelRings = HANDS.map(() => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.007, 8, 40), m); o.rotation.x = -Math.PI / 2; o.renderOrder = 21; scene.add(o); return o; });
const heelPatch = HANDS.map(() => { const p = patch(0.16, 0.12, RED, 1.4); return p; });

// ---------- guides ----------
const OFF = V3(0.36, 0, 0); // floats on the camera side of the body
const loadLine = beam(RED, 2.2, 0.03), stackLine = beam(GREEN, 1.3, 0.025); // (round 1: green at 2.2 bloomed white)
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0), W = V3(0, 0, 0);

// ---------- text ----------
title("NEVER SINK INTO YOUR WRISTS");
cap("s2", "weight", "WEIGHT IN WRIST", RED);
cap("s2", "spot", "ONE SMALL SPOT", RED, { boom: 0.35 });
cap("s3", "closed", "CLOSED FINGERS", RED);
cap("s3", "nothing", "NOTHING SHARES IT", RED);
cap("s4", "spread", "SPREAD WIDE", GREEN);
cap("s4", "stack", "STACK SHOULDERS", GREEN, { boom: 0.3 });
cap("s5", "knuckles", "PRESS KNUCKLES", GREEN);
cap("s5", "pads", "FINGER PADS", VIOLET);
cap("s5", "gripping", "GRIP THE MAT", GREEN, { boom: 0.3 });
cap("s6", "still", "STILL SORE?", VIOLET);
cap("s6", "knees", "KNEES DOWN", GREEN);
cap("s6", "forearms", "OR FOREARMS", VIOLET);
endCard([["SPREAD FINGERS", 1], ["PRESS KNUCKLES", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; side view from +x, the face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
// (round 1: hand cams looked down at the bright mat, red titles on violet were unreadable -> low cams, dark backdrop above)
const HANDCAM = [[0, [0.95, 0.24, -1.05, 0.25, 0.1, -0.5, 36]], [3, [0.88, 0.23, -1.0, 0.25, 0.1, -0.5, 36]]];
const FRONT = [[0, [0.65, 0.22, -1.25, 0.27, 0.1, -0.55, 36]], [3, [0.6, 0.21, -1.2, 0.27, 0.1, -0.55, 36]]];
const SH = [
  // hook: wide side view, the whole plank
  // (round 1: head cut off at the right edge -> farther back, aimed at the middle of the body)
  { at: 0, K: [[0, [4.5, 0.9, -0.05, 0, 0.35, -0.05, 46]], [2.0, [4.2, 0.88, -0.05, 0, 0.35, -0.05, 46]]] },
  // "sink": closer on shoulders and hands
  { at: T.sink - 0.15, K: st([2.2, 0.55, -0.7, 0, 0.35, -0.55, 42], [2.05, 0.55, -0.68, 0, 0.35, -0.55, 42]) },
  // s2: side on the arm, the red load line
  { at: T.s2, K: st([2.0, 0.5, -0.5, 0, 0.32, -0.55, 44], [1.9, 0.48, -0.5, 0, 0.32, -0.55, 44]) },
  // "pressure ... spot": close on the hand, the heel
  { at: T.pressure - 0.15, K: HANDCAM },
  // s3: from the front, the flat closed hand
  { at: T.s3, K: FRONT },
  // s4: front on the hands, fingers fan out
  { at: T.s4, K: FRONT },
  // "stack": side, shoulders over wrists
  { at: T.stack - 0.15, K: st([2.2, 0.55, -0.5, 0, 0.36, -0.5, 44], [2.05, 0.55, -0.5, 0, 0.36, -0.5, 44]) },
  // s5: close on the hand, knuckles and pads
  { at: T.s5, K: HANDCAM },
  { at: T.gripping - 0.15, K: FRONT },
  // s6: wide side, knees drop, then forearms (round 1: head cut off -> farther, aimed at the body middle)
  { at: T.s6, K: st([4.2, 0.85, -0.05, 0, 0.3, -0.05, 46], [4.0, 0.83, -0.05, 0, 0.3, -0.05, 46]) },
  // s7-s8: calm wide, person low in frame under the end card
  { at: T.s7, calm: 1, K: [[0, [3.6, 1.7, 0.2, 0, 1.0, 0.0, 48]], [5, [4.0, 1.85, 0.2, 0, 1.05, 0.0, 48]]] },
];

run("plank-wrists", (t) => {
  P.set({ t });
  // pose: start a little sunk, sink fully on "sink"; back over the wrists on "stack";
  // knees down on "drop"; forearms on "forearms"; back to the high plank at s7
  const w0 = 0.45 + 0.55 * sm(T.sink - 0.05, T.sink + 0.4, t);
  const kR = sm(T.stack - 0.1, T.wrists + 0.1, t);
  const kK = sm(T.drop - 0.05, T.knees + 0.15, t) * (1 - sm(T.forearms - 0.35, T.forearms + 0.05, t));
  const kF = sm(T.forearms - 0.35, T.forearms + 0.05, t) * (1 - sm(T.s7 + 0.2, T.s7 + 0.9, t));
  blend([["right", 1], ["wrong", w0 * (1 - kR)], ["knees", kK], ["forearm", kF]]);
  applyPose(t);

  // hands: fingers closed (wrong) -> spread on "spread"; fingertips grip on "gripping"; forearm plank = loose fists
  const sp = sm(T.spread - 0.05, T.wide + 0.1, t) * (1 - 0.6 * kF);
  const grip = sm(T.gripping - 0.1, T.gripping + 0.15, t) * (1 - sm(T.s6, T.s6 + 0.3, t));
  for (let k = 0; k < 2; k++) {
    const H = HANDS[k];
    H.G.position.set(XS[k], 0.014, J.HAND.z + 0.02);
    H.G.rotation.y = 0;
    H.fingers.forEach((f, i) => { f.position.x = (i - 1.5) * (0.022 + 0.008 * sp); f.rotation.set(-0.25 * grip, SPREAD[i] * sp * H.s, 0); });
    H.th.rotation.y = H.s * (0.05 + 0.9 * sp);
    H.G.updateMatrixWorld(true);
    // dots: knuckles (finger bases) and pads (finger tips)
    const kd = sm(T.knuckles - 0.1, T.knuckles + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
    const pd = sm(T.pads - 0.1, T.pads + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
    H.fingers.forEach((f, i) => {
      const a = knDots[k * 4 + i], b = padDots[k * 4 + i];
      f.localToWorld(a.position.set(0, 0.012, -0.005)); a.material.opacity = kd * (0.8 + 0.2 * flash(t, T.knuckles));
      f.localToWorld(b.position.set(0, 0.012, -0.075)); b.material.opacity = pd * (0.8 + 0.4 * flash(t, T.gripping));
    });
    // heel: red ring + pressure patch (s1 "heel" -> end of s3)
    const hr = Math.max(sm(T.heel - 0.1, T.heel + 0.15, t) * (1 - sm(T.weight - 0.2, T.weight, t)), sm(T.spot - 0.15, T.spot + 0.1, t)) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
    H.G.localToWorld(heelRings[k].position.set(0, 0.03, 0.035));
    heelRings[k].material.opacity = hr * (0.65 + 0.35 * Math.sin(t * 9));
    heelRings[k].scale.setScalar((1 + 0.4 * flash(t, T.spot)) / 1);
    heelPatch[k].position.set(XS[k], 0.016, J.HAND.z + 0.06);
    heelPatch[k].set(sm(T.pressure - 0.1, T.pressure + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)));
  }

  // red load line: shoulder -> heel of the hand (s2); green stack line: shoulder straight down to the wrist (s4-s5)
  const ll = sm(T.weight - 0.1, T.weight + 0.15, t) * (1 - sm(T.pressure - 0.15, T.pressure, t));
  A0.copy(J.SHO).add(OFF); W.copy(J.HAND).add(OFF); W.z += 0.06; loadLine.set(A0, W, ll * (0.85 + 0.15 * Math.sin(t * 8)));
  const sl = sm(T.stack - 0.05, T.stack + 0.2, t) * (1 - sm(T.s5 - 0.05, T.s5 + 0.2, t));
  A1.copy(J.HAND).add(OFF); A0.set(A1.x, J.SHO.y, J.SHO.z); stackLine.set(A0, A1, sl * (0.8 + 0.2 * flash(t, T.wrists)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
