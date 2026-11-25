// NEVER SLUMP TO SIT (YogaFlow, beginners). A person sits cross-legged on a mat, face toward -z.
// s1 slumped on the flat floor. s2 red dots on the high knees, red curved line along the rounded lower back.
// s3 red ache pulse on the low back, short fast red breath ring at the chest.
// s4 a folded blanket grows under the hips, the hips rise. s5 green hip->knee lines slope down, green straight spine line.
// s6 hands rest on the thighs, slow green breath ring. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  slump: g("s1", "slump"), floor: g("s1", "floor"),
  s2: S.s2[0], hips2: g("s2", "hips"), knees2: g("s2", "knees"), lower: g("s2", "lower"), rounds: g("s2", "rounds"),
  s3: S.s3[0], ache: g("s3", "ache"), breath3: g("s3", "breath"), short: g("s3", "short"),
  s4: S.s4[0], sit: g("s4", "sit"), edge: g("s4", "edge"), folded: g("s4", "folded"), blanket: g("s4", "blanket"),
  s5: S.s5[0], hips5: g("s5", "Hips"), knees5: g("s5", "knees"), spine: g("s5", "spine"), tall: g("s5", "tall"),
  s6: S.s6[0], hands: g("s6", "hands"), thighs: g("s6", "thighs"), breathe: g("s6", "breathe"), slowly: g("s6", "slowly"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: mat along z, a plant ----------
scene.add(box(0.95, 0.012, 1.9, 0, 0.006, -0.2, mat(0x6a5cff, 0.35), false));
scene.add(box(0.02, 0.004, 1.9, 0.475, 0.014, -0.2, glow(VIOLET, 1.4), false), box(0.02, 0.004, 1.9, -0.475, 0.014, -0.2, glow(VIOLET, 1.4), false));
scene.add(box(0.26, 0.3, 0.26, -1.1, 0.15, 0.6, mat(0x2a2470, 0.2)));
for (const [x, r] of [[0, 0], [-0.08, 0.4], [0.08, -0.4]]) { const l = box(0.06, 0.5, 0.02, -1.1 + x, 0.5, 0.6, glow(GREEN, 0.5), false); l.rotation.z = r; scene.add(l); }

// folded blanket: grows under the hips in s4 (sitting on its front edge, the rest behind)
const BH = 0.13;
const blanket = box(0.62, BH, 0.44, 0, BH / 2, 0.16, mat(0x2fb58a, 0.3)); scene.add(blanket);
const foldLine = box(0.62, 0.012, 0.012, 0, BH * 0.5, -0.06, glow(GREEN, 1.6), false); scene.add(foldLine);

// ---------- the person ----------
const P = human({ hex: 0x2ad1c0, skin: 0xd99a74 });
const hips = P.g.children[0], spine = hips.children[0], LTh = hips.children[1], RTh = hips.children[2];
const LKn = LTh.children[1], RKn = RTh.children[1];
const Lsh = spine.children[2], Rsh = spine.children[3];
const Lel = Lsh.children[1], Rel = Rsh.children[1];
const UP = V3(0, 1, 0), DOWN = V3(0, -1, 0);
const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), qs = new THREE.Quaternion();
const TORSO = 0.66, UPPER = 0.3, FORE = 0.32, THIGH = 0.45, SHIN = 0.46;
const HIP = V3(0, 0, 0), D = V3(0, 1, 0), N = V3(0, 0, 1);
const legs = [{ th: LTh, kn: LKn, s: -1 }, { th: RTh, kn: RKn, s: 1 }];
const arms = [{ sh: Lsh, el: Lel, s: -1 }, { sh: Rsh, el: Rel, s: 1 }];
for (const o of [...legs, ...arms]) { o.root = V3(0, 0, 0); o.mid = V3(0, 0, 0); o.end = V3(0, 0, 0); }
const d = V3(0, 0, 0), d2 = V3(0, 0, 0), u = V3(0, 0, 0), p = V3(0, 0, 0), tg = V3(0, 0, 0);
// 3D two-bone ik with a pole direction
function ik3(R, Tg, a, b, pole, out) {
  u.subVectors(Tg, R); const L0 = Math.max(1e-4, u.length()); u.divideScalar(L0);
  const L = Math.min(a + b - 1e-4, Math.max(Math.abs(a - b) + 1e-4, L0));
  const ca = (a * a + L * L - b * b) / (2 * a * L), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  p.copy(pole).addScaledVector(u, -pole.dot(u)).normalize();
  return out.copy(R).addScaledVector(u, a * ca).addScaledVector(p, a * sa);
}
const lerp = (a, b, k) => a + (b - a) * k;
const pole = V3(0, 0, 0);
// k: 0 = slumped on the flat floor (wrong), 1 = sitting tall on the blanket (right). hk: hands on thighs (s6)
function pose(k, hk, t) {
  const br = 0.006 * Math.sin(t * 1.6);
  hips.quaternion.identity();
  HIP.set(0, lerp(0.13, 0.13 + BH, k), 0.02);
  hips.position.copy(HIP);
  // spine: slumped leans back with the top falling back (rounded), tall = straight up
  D.set(0, 1, lerp(-0.5, 0.0, k)).normalize();
  spine.quaternion.setFromUnitVectors(UP, D);
  N.set(0, -D.z, D.y);
  // head: chin drops forward in the slump, level when tall
  P.head.rotation.set(lerp(-0.3, -0.04, k) + br * 2, 0, 0);
  P.g.updateMatrixWorld(true);
  // legs: thighs out and forward; knees high when the hips are tight and low, lower when the hips sit high
  const kneeY = lerp(0.4, 0.17, k) + br;
  for (const L of legs) {
    L.th.getWorldPosition(L.root);
    const dy = (kneeY - L.root.y) / THIGH, h = Math.sqrt(Math.max(0, 1 - dy * dy));
    d.set(L.s * 0.72, 0, -0.7).normalize().multiplyScalar(h); d.y = dy;
    L.mid.copy(L.root).addScaledVector(d, THIGH);
    tg.set(-L.s * 0.08, 0.06, -0.34 + L.s * 0.05);
    d2.subVectors(tg, L.mid).normalize();
    L.end.copy(L.mid).addScaledVector(d2, SHIN);
    qa.setFromUnitVectors(DOWN, d); qb.setFromUnitVectors(DOWN, d2);
    L.th.quaternion.copy(qa); L.kn.quaternion.copy(qa).invert().multiply(qb);
  }
  P.g.updateMatrixWorld(true);
  // arms: hands rest on the knees, then on the middle of the thighs
  qs.copy(spine.quaternion).invert();
  for (const A of arms) {
    A.sh.getWorldPosition(A.root);
    const Lg = legs[A.s < 0 ? 0 : 1];
    // slumped: hands hang on the shins; tall: on the knees; s6: on the middle of the thighs
    tg.lerpVectors(Lg.mid, Lg.end, 0.45 * (1 - k)); tg.y += 0.08;
    if (hk > 0) { d.lerpVectors(Lg.root, Lg.mid, 0.6); d.y += 0.09; tg.lerp(d, hk); }
    pole.set(A.s * 0.8, -0.2, 0.6);
    ik3(A.root, tg, UPPER, FORE, pole, A.mid);
    A.end.copy(tg);
    d.subVectors(A.mid, A.root).normalize(); qa.setFromUnitVectors(DOWN, d);
    d2.subVectors(A.end, A.mid).normalize(); qb.setFromUnitVectors(DOWN, d2);
    A.sh.quaternion.copy(qs).multiply(qa); A.el.quaternion.copy(qa).invert().multiply(qb);
  }
  P.g.updateMatrixWorld(true);
}

// ---------- guides ----------
const OFF = V3(0.27, 0, 0);
const A0 = V3(0, 0, 0), A1 = V3(0, 0, 0);
const dotOf = (hex, r = 0.045) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(1.6), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m); o.renderOrder = 21; scene.add(o); return o; };
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.4), toneMapped: false, transparent: true, opacity: 0, depthTest: false }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 8, 48), m); o.renderOrder = 22; scene.add(o); return o; };
const kneeDots = [dotOf(RED, 0.05), dotOf(RED, 0.05)];
// rounded back: a red arc of 4 segments behind the back
const arc = [0, 1, 2, 3].map(() => { const b = beam(RED, 2.2, 0.03); b.material.depthTest = false; b.renderOrder = 20; return b; });
const AP = [0, 1, 2, 3, 4].map(() => V3(0, 0, 0));
const ache = dotOf(RED, 0.07);
const chestRing = ringOf(RED, 0.26), calmRing = ringOf(GREEN, 0.26);
const spineLine = beam(GREEN, 2.0, 0.03); spineLine.material.depthTest = false; spineLine.renderOrder = 20;
const slope = [beam(GREEN, 2.0, 0.026), beam(GREEN, 2.0, 0.026)]; slope.forEach((b) => { b.material.depthTest = false; b.renderOrder = 20; });
const hipDot = dotOf(GREEN, 0.05);

// ---------- text ----------
title("NEVER SLUMP TO SIT");
cap("s2", "knees", "KNEES UP HIGH", RED);
cap("s2", "back", "BACK ROUNDS", RED, { boom: 0.3 });
cap("s3", "ache", "BACK ACHES", RED);
cap("s3", "short", "SHORT BREATH", RED, { boom: 0.3 });
cap("s4", "folded", "SIT ON A BLANKET", GREEN);
cap("s5", "Hips", "HIPS ABOVE KNEES", GREEN);
cap("s5", "spine", "SPINE TALL", VIOLET);
cap("s6", "hands", "HANDS ON THIGHS", GREEN);
cap("s6", "breathe", "BREATHE SLOWLY", VIOLET);
endCard([["LIFT THE HIPS", 1], ["THE BACK FOLLOWS", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov]; face toward -z ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // s1: front three-quarter, the slump reads
  { at: 0, K: [[0, [2.2, 0.95, -2.2, 0, 0.72, -0.05, 44]], [2.8, [2.0, 0.92, -2.0, 0, 0.72, -0.05, 44]]] },
  // s2: on the knees, then the side profile for the rounded back
  { at: T.s2, K: st([1.6, 0.75, -1.9, 0, 0.6, -0.2, 44], [1.5, 0.75, -1.8, 0, 0.6, -0.2, 44]) },
  { at: T.lower - 0.15, K: st([2.6, 0.8, 0.15, 0, 0.62, -0.18, 44], [2.45, 0.8, 0.15, 0, 0.62, -0.18, 44]) },
  // s3: side on the back and chest
  { at: T.s3, K: st([2.4, 0.85, 0.25, 0, 0.65, -0.2, 44], [2.3, 0.85, 0.2, 0, 0.65, -0.2, 44]) },
  // s4: wide three-quarter while the blanket comes in
  { at: T.s4, K: st([2.5, 0.95, -1.6, 0, 0.7, 0.0, 46], [2.35, 0.92, -1.5, 0, 0.7, 0.0, 46]) },
  // s5: side profile: hips above the knees, spine tall
  { at: T.s5, K: st([2.6, 0.75, -0.25, 0, 0.75, -0.05, 44], [2.45, 0.77, -0.25, 0, 0.78, -0.05, 44]) },
  // s6: front three-quarter, hands on thighs and the slow breath
  { at: T.s6, K: st([1.9, 1.0, -2.1, 0, 0.8, -0.05, 44], [1.8, 0.98, -2.0, 0, 0.8, -0.05, 44]) },
  { at: T.s7, calm: 1, K: [[0, [2.4, 1.5, -2.2, 0, 0.6, 0, 48]], [5, [2.7, 1.6, -2.4, 0, 0.6, 0, 48]]] },
];

run("sit-high", (t) => {
  const k = sm(T.folded - 0.05, T.blanket + 0.35, t);
  const hk = sm(T.hands - 0.1, T.thighs + 0.1, t);
  const bs = Math.max(0.01, k);
  blanket.scale.set(1, bs, 1); blanket.position.y = BH * bs / 2; blanket.visible = k > 0.01;
  foldLine.position.y = BH * bs - 0.01; foldLine.visible = k > 0.3;
  P.set({ t });
  pose(k, hk, t);

  const off = 1 - sm(T.s4 - 0.1, T.s4 + 0.2, t);
  // s2: red knee dots
  legs.forEach((L, i) => {
    kneeDots[i].position.copy(L.mid);
    kneeDots[i].material.opacity = sm(T.knees2 - 0.1, T.knees2 + 0.1, t) * off * (0.6 + 0.4 * Math.sin(t * 9));
    kneeDots[i].scale.setScalar(1 + 0.6 * flash(t, T.knees2));
  });
  // s2-s3: rounded back arc (bulges behind the lower back)
  const ar = sm(T.lower - 0.1, T.lower + 0.15, t) * off;
  AP.forEach((P5, i) => { const v = i / 4; P5.copy(HIP).addScaledVector(D, 0.06 + 0.56 * v).addScaledVector(N, 0.17 + 0.09 * Math.sin(Math.PI * v)).add(OFF.clone().multiplyScalar(0.3)); });
  arc.forEach((b, i) => b.set(AP[i], AP[i + 1], ar * (0.85 + 0.35 * flash(t, T.rounds) + 0.35 * flash(t, T.ache))));
  // s3: ache pulse on the low back, fast short red breath ring
  ache.position.copy(AP[1]);
  ache.material.opacity = sm(T.ache - 0.15, T.ache + 0.05, t) * off * (0.55 + 0.45 * Math.sin(t * 10));
  ache.scale.setScalar(1 + 0.8 * flash(t, T.ache));
  const chest = V3(0, 0, 0).copy(HIP).addScaledVector(D, 0.4);
  chestRing.position.copy(chest);
  chestRing.quaternion.setFromUnitVectors(V3(0, 0, 1), D);
  chestRing.material.opacity = sm(T.breath3 - 0.1, T.breath3 + 0.05, t) * off;
  chestRing.scale.setScalar(1.15 + 0.06 * Math.sin(t * 22));
  // s5: hip dot + green hip->knee lines sloping down, straight green spine line
  const s5 = sm(T.hips5 - 0.05, T.hips5 + 0.15, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.2, t));
  hipDot.position.copy(HIP); hipDot.material.opacity = s5;
  hipDot.scale.setScalar(1 + 0.6 * flash(t, T.hips5));
  legs.forEach((L, i) => slope[i].set(L.root, L.mid, s5 * (0.85 + 0.4 * flash(t, T.knees5))));
  const sp = sm(T.spine - 0.1, T.spine + 0.1, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t));
  A0.copy(HIP).addScaledVector(N, 0.2); A1.copy(HIP).addScaledVector(D, TORSO + 0.05).addScaledVector(N, 0.2);
  spineLine.set(A0, A1, sp * (0.85 + 0.4 * flash(t, T.tall)));
  // s6: slow calm breath ring
  calmRing.position.copy(chest); calmRing.quaternion.setFromUnitVectors(V3(0, 0, 1), D);
  calmRing.material.opacity = sm(T.breathe - 0.15, T.breathe + 0.1, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)) * 0.7;
  calmRing.scale.setScalar(1.15 + 0.12 * Math.sin(t * 2.4));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
