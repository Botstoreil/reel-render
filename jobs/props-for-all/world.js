// NEVER SINGLE OUT ONE STUDENT (YogaFlow 11, to teachers). A class: three students on mats facing the teacher (-z).
// s1 the teacher walks in holding a red block and puts it down only in front of the middle student on "struggles".
// s2 red spotlight ring around the middle student on "out", the other two turn to look, the middle one drops the head.
// s3 the block slides off the mat on "skip"; on "strain" all three fold with straight legs, hands short of the floor
// (red gap lines, flash on "reach"). s4 the teacher talks; violet blocks pop in on every mat on "blocks", green patches.
// s5 the teacher folds onto her own blocks on "yourself". s6 everyone folds onto their blocks on "choice". s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  block1: g("s1", "block"), student: g("s1", "student"), struggles: g("s1", "struggles"),
  s2: S.s2[0], out: g("s2", "out"), punishment: g("s2", "punishment"),
  s3: S.s3[0], skip: g("s3", "skip"), strain: g("s3", "strain"), reach: g("s3", "reach"),
  s4: S.s4[0], everyone: g("s4", "everyone"), blocks: g("s4", "blocks"), before: g("s4", "before"),
  s5: S.s5[0], block5: g("s5", "block"), yourself: g("s5", "yourself"),
  s6: S.s6[0], choice: g("s6", "choice"), whole: g("s6", "whole"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: three student mats (z = 0) and the teacher's mat (z = TZ), all along z ----------
const XS = [-1.0, 0, 1.0], TZ = -2.3, BZ = -0.54; // BZ: where the hands land in the fold (in front of the feet)
function mat3(x, z) {
  scene.add(box(0.66, 0.012, 1.9, x, 0.006, z - 0.25, mat(0x5a4ccc, 0.3), false));
  scene.add(box(0.02, 0.004, 1.9, x + 0.33, 0.014, z - 0.25, glow(VIOLET, 1.2), false), box(0.02, 0.004, 1.9, x - 0.33, 0.014, z - 0.25, glow(VIOLET, 1.2), false));
}
for (const x of XS) mat3(x, 0);
mat3(0, TZ + 0.5);
const green = XS.map((x) => { const p = patch(0.9, 2.1, GREEN, 0.45); p.position.set(x, 0.02, -0.25); return p; });
const spot = patch(0.95, 2.1, RED, 0.7); spot.position.set(0, 0.025, -0.25);

// violet blocks: two per student (pop in on "blocks") + two for the teacher (pop in on s5 "block")
const vMat = mat(0x8a7cff, 0.5), vTop = glow(VIOLET, 1.5);
const mkBlock = (x, z, m = vMat, top = vTop) => { const b = box(0.12, 0.23, 0.15, x, 0.115, z, m); b.add(box(0.13, 0.004, 0.16, 0, 0.117, 0, top, false)); scene.add(b); return b; };
const sBlocks = XS.map((x) => [mkBlock(x - 0.29, BZ), mkBlock(x + 0.29, BZ)]);
const tBlocks = [mkBlock(-0.29, TZ - BZ), mkBlock(0.29, TZ - BZ)];
// the one red block: in the teacher's hand, then on the floor in front of the middle student
const rMat = mat(RED, 0.6), rTop = glow(RED, 1.6);
const redFloor = mkBlock(0, BZ - 0.05, rMat, rTop);
const redHeld = box(0.12, 0.23, 0.15, 0, 0, 0, rMat); redHeld.add(box(0.13, 0.004, 0.16, 0, 0.117, 0, rTop, false));

// ---------- people ----------
const ST = [human({ hex: 0x2ad1c0, skin: 0xd99a74, phase: 0.2 }), human({ hex: 0xf06aa8, skin: 0xc68660, phase: 0.5 }), human({ hex: 0x5aa0ff, skin: 0xe0b08c, phase: 0.8 })];
const TE = human({ hex: 0xe8e4ff, skin: 0xb87a56 });
TE.hold(redHeld, 1); redHeld.position.set(0, -0.06, -0.1);
const rig = (P) => { const hips = P.g.children[0], spine = hips.children[0]; return { spine, sh: [spine.children[2], spine.children[3]] }; };
const RIG = new Map([...ST, TE].map((P) => [P, rig(P)]));
// standing forward fold with straight legs: a = fold angle (rad), reach = arms further forward
function fold(P, a, reach = 0) {
  if (a < 0.001 && reach === 0) return;
  const R = RIG.get(P);
  R.spine.rotation.x = -a;
  R.sh.forEach((sh, i) => { sh.rotation.set(a + reach, 0, (i ? 1 : -1) * 0.05); sh.children[1].rotation.set(0.05, 0, 0); });
  P.head.rotation.x = -0.15 * Math.min(1, a);
}
const HW = [V3(0, 0, 0), V3(0, 0, 0)];

// ---------- guides ----------
const gaps = ST.map(() => [beam(RED, 2.2, 0.022), beam(RED, 2.2, 0.022)]);
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0 }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 8, 40), m); o.rotation.x = -Math.PI / 2; scene.add(o); return o; };
const okRings = XS.map((x) => { const o = ringOf(GREEN, 0.3); o.position.set(x, 0.03, BZ); return o; });
const tRing = ringOf(GREEN, 0.3); tRing.position.set(0, 0.03, TZ - BZ);

// ---------- text ----------
title("NEVER SINGLE OUT ONE STUDENT");
cap("s2", "out", "SINGLED OUT", RED);
cap("s2", "punishment", "= PUNISHMENT", RED, { boom: 0.3 });
cap("s3", "skip", "BLOCK SKIPPED", RED);
cap("s3", "strain", "STRAINING", RED, { boom: 0.3 });
cap("s4", "everyone", "BLOCKS FOR ALL", GREEN);
cap("s4", "before", "BEFORE CLASS", VIOLET);
cap("s5", "yourself", "TEACHER USES ONE", GREEN);
cap("s6", "choice", "CHOICE FOR ALL", GREEN, { boom: 0.3 });
endCard([["PROPS FOR EVERYONE", 1], ["EVERY CLASS", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: behind and above the class, the teacher walks in with the red block
  { at: 0, K: [[0, [1.5, 2.1, 2.9, 0, 0.6, -1.0, 46]], [3.6, [1.2, 1.9, 2.5, 0, 0.6, -0.9, 46]]] },
  // "struggles": close on the middle student and the red block, from the front side
  { at: T.struggles - 0.15, K: st([1.0, 1.0, -1.9, 0, 0.75, -0.2, 44], [0.95, 0.98, -1.8, 0, 0.75, -0.2, 44]) },
  // s2: front of the class, the red spotlight and the two looking
  { at: T.s2, K: st([0.6, 1.45, -3.0, 0, 0.7, -0.2, 46], [0.55, 1.4, -2.8, 0, 0.7, -0.2, 46]) },
  // s3: three-quarter front, all three folding short of the floor
  { at: T.s3, K: st([1.9, 1.0, -2.2, 0, 0.5, -0.4, 46], [1.8, 0.98, -2.05, 0, 0.5, -0.4, 46]) },
  // s4: behind the class, blocks pop in on every mat
  { at: T.s4, K: st([1.4, 2.0, 2.6, 0, 0.45, -0.8, 46], [1.25, 1.9, 2.4, 0, 0.45, -0.8, 46]) },
  // s5: on the teacher from the class side, folding onto her blocks
  { at: T.s5, K: st([1.3, 1.0, -0.6, 0, 0.6, -2.0, 44], [1.2, 0.98, -0.7, 0, 0.6, -2.0, 44]) },
  // s6: wide three-quarter front, everyone on blocks
  { at: T.s6, K: st([2.0, 1.4, -2.6, 0, 0.5, -0.5, 46], [1.85, 1.35, -2.45, 0, 0.5, -0.5, 46]) },
  // s7-s8: calm wide, people low under the end card
  { at: T.s7, calm: 1, K: [[0, [2.4, 2.6, 2.6, 0, 1.2, -0.9, 48]], [5, [2.7, 2.8, 2.9, 0, 1.25, -0.9, 48]]] },
];

run("props-for-all", (t) => {
  // ---- teacher: walks in with the red block, puts it down on "struggles", walks back in s2, talks in s4, folds in s5-s6
  const putT = T.struggles + 0.1;
  let wp;
  if (t < putT) wp = walkPath([0, TZ], [0, -0.95], 0.3, T.student, t);
  else if (t < T.s2 + 0.5) wp = { x: 0, z: -0.95, h: Math.PI, walk: 0 };
  else { wp = walkPath([0, -0.95], [0, TZ], T.s2 + 0.5, T.s2 + 1.9, t); wp.h = wp.walk ? wp.h : Math.PI * sm(T.s2 + 1.9, T.s2 + 2.3, t) + 0 * (1 - sm(T.s2 + 1.9, T.s2 + 2.3, t)); }
  if (t >= T.s2 + 2.3) wp.h = Math.PI;
  const talk = sm(T.s4 - 0.1, T.s4 + 0.2, t) * (1 - sm(T.s5 - 0.15, T.s5 + 0.05, t));
  const bend = sm(putT - 0.35, putT, t) * (1 - sm(putT + 0.1, putT + 0.45, t)); // bends down to put the block on the floor
  TE.set({ ...wp, t, argue: talk * 0.7 });
  fold(TE, 1.1 * bend + 1.3 * sm(T.yourself - 0.25, T.yourself + 0.1, t));
  redHeld.visible = t < putT;
  const rf = sm(putT - 0.05, putT + 0.05, t);
  const slide = sm(T.skip - 0.05, T.skip + 0.35, t), fadeR = 1 - sm(T.strain - 0.1, T.strain + 0.2, t);
  redFloor.visible = rf > 0.01 && fadeR > 0.01;
  redFloor.position.set(0.55 * slide, 0.115, BZ - 0.05 + 0.15 * slide);
  redFloor.scale.setScalar(Math.max(0.01, rf * fadeR * (1 + 0.15 * flash(t, T.struggles))));
  rTop.color.set(RED).multiplyScalar(1.4 + 1.2 * flash(t, T.struggles) + 0.8 * flash(t, T.skip));

  // ---- students
  const look = sm(T.out - 0.2, T.out + 0.2, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t));
  const shame = sm(T.out - 0.1, T.out + 0.3, t) * (1 - sm(T.s3, T.s3 + 0.3, t));
  const strain = sm(T.strain - 0.2, T.strain + 0.2, t) * (1 - sm(T.s4 - 0.05, T.s4 + 0.35, t));
  const onB = sm(T.choice - 0.3, T.choice + 0.1, t);
  ST.forEach((P, i) => {
    P.set({ x: XS[i], z: 0, h: 0, t, look: i === 0 ? look : i === 2 ? -look : 0, nod: i === 1 ? 0 : 0.3 * look });
    const shake = 0.04 * Math.sin(t * 23 + i) * strain; // straining: a small shake
    fold(P, 1.45 * strain + 1.3 * onB + shake, 0.2 * strain);
    if (i === 1 && shame > 0.01) P.head.rotation.x = -0.5 * shame;
    P.g.updateMatrixWorld(true);
    // red gap lines: hands to the floor while straining
    P.hands.forEach((h, j) => { h.getWorldPosition(HW[j]); const B = HW[j].clone(); B.y = 0.02; gaps[i][j].set(V3(HW[j].x, HW[j].y - 0.06, HW[j].z), B, sm(T.strain, T.strain + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.1, t)) * (0.8 + 0.6 * flash(t, T.reach))); });
  });

  // ---- red spotlight on the middle student (s2), green patches + rings (s4, s6)
  spot.set(sm(T.out - 0.15, T.out + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.15, t)) * (0.75 + 0.25 * Math.sin(t * 8)));
  const gp = sm(T.everyone - 0.1, T.everyone + 0.2, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.1, t)) + sm(T.whole - 0.1, T.whole + 0.2, t) * (1 - sm(T.s7, T.s7 + 0.4, t));
  green.forEach((p) => p.set(gp * (0.8 + 0.2 * flash(t, T.everyone))));
  const bk = sm(T.blocks - 0.3, T.blocks, t);
  sBlocks.forEach((pair, i) => pair.forEach((b) => { const k = Math.max(0, Math.min(1, bk * 1.6 - i * 0.3)); b.visible = k > 0.01; b.scale.setScalar(Math.max(0.01, k * (1 + 0.15 * flash(t, T.blocks)))); }));
  const tb = sm(T.block5 - 0.25, T.block5, t);
  tBlocks.forEach((b) => { b.visible = tb > 0.01; b.scale.setScalar(Math.max(0.01, tb * (1 + 0.15 * flash(t, T.block5)))); });
  vTop.color.set(VIOLET).multiplyScalar(1.2 + 1.0 * flash(t, T.blocks) + 0.8 * flash(t, T.block5));
  const ok = sm(T.choice, T.choice + 0.2, t) * (1 - sm(T.s7 + 0.3, T.s7 + 0.8, t));
  okRings.forEach((o) => { o.material.opacity = ok * (0.7 + 0.3 * Math.sin(t * 6)); o.scale.setScalar(1 + 0.3 * flash(t, T.choice)); });
  tRing.material.opacity = sm(T.yourself, T.yourself + 0.2, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.5, t)) * (0.7 + 0.3 * Math.sin(t * 6));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
