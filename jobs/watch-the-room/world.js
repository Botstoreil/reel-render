// NEVER DEMO THE WHOLE CLASS (YogaFlow 12, to teachers). Three students on mats (face -z), the teacher on her mat at TZ facing them.
// s1 the teacher folds on her own mat with the class. s2 her eyes are on her own mat: a red beam from her head to her floor.
// s3 the middle student strains (shake, red gap lines, red spot) and nobody sees it. s4 the teacher demos the fold once and
// stands up on "stand". s5 she walks into the room, a green gaze beam jumps student to student on knees / backs / breath.
// s6 she talks (argue) and, on "eyes", a violet block pops under the middle student, she rests on it, green ring. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, beam, patch, mSolid, VIOLET, RED, GREEN, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, unclip } from "./parts.js";

scene.fog.density = 0.02;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  never: g("s1", "never"), whole: g("s1", "whole"),
  s2: S.s2[0], pose2: g("s2", "pose"), cant: g("s2", "can't"), students: g("s2", "students"),
  s3: S.s3[0], help: g("s3", "help"), unseen: g("s3", "unseen"),
  s4: S.s4[0], once: g("s4", "once"), stand: g("s4", "stand"),
  s5: S.s5[0], walk: g("s5", "walk"), knees: g("s5", "knees"), backs: g("s5", "backs"), breath: g("s5", "breath"),
  s6: S.s6[0], voice: g("s6", "voice"), eyes: g("s6", "eyes"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- set: three student mats (z = 0) and the teacher's mat (z = TZ) ----------
const XS = [-1.0, 0, 1.0], TZ = -2.3, BZ = -0.54;
function mat3(x, z) {
  scene.add(box(0.66, 0.012, 1.9, x, 0.006, z - 0.25, mat(0x5a4ccc, 0.3), false));
  scene.add(box(0.02, 0.004, 1.9, x + 0.33, 0.014, z - 0.25, glow(VIOLET, 1.2), false), box(0.02, 0.004, 1.9, x - 0.33, 0.014, z - 0.25, glow(VIOLET, 1.2), false));
}
for (const x of XS) mat3(x, 0);
mat3(0, TZ + 0.5);
const spot = patch(0.95, 2.1, RED, 0.7); spot.position.set(0, 0.025, -0.25);
const tSpot = patch(0.95, 2.1, RED, 0.5); tSpot.position.set(0, 0.025, TZ + 0.25); // the teacher's own mat glows red in s2
const green = XS.map((x) => { const p = patch(0.9, 2.1, GREEN, 0.45); p.position.set(x, 0.02, -0.25); return p; });

// violet blocks for the middle student (pop in on "eyes")
const vMat = mat(0x8a7cff, 0.5), vTop = glow(VIOLET, 1.5);
const mkBlock = (x, z) => { const b = box(0.12, 0.23, 0.15, x, 0.115, z, vMat); b.add(box(0.13, 0.004, 0.16, 0, 0.117, 0, vTop, false)); scene.add(b); return b; };
const mBlocks = [mkBlock(-0.29, BZ), mkBlock(0.29, BZ)];

// ---------- people ----------
const ST = [human({ hex: 0x2ad1c0, skin: 0xd99a74, phase: 0.2 }), human({ hex: 0xf06aa8, skin: 0xc68660, phase: 0.5 }), human({ hex: 0x5aa0ff, skin: 0xe0b08c, phase: 0.8 })];
const TE = human({ hex: 0xffd166, skin: 0xb87a56 });
const rig = (P) => { const hips = P.g.children[0], spine = hips.children[0]; return { spine, sh: [spine.children[2], spine.children[3]] }; };
const RIG = new Map([...ST, TE].map((P) => [P, rig(P)]));
function fold(P, a, reach = 0) {
  if (a < 0.001 && reach === 0) return;
  const R = RIG.get(P);
  R.spine.rotation.x = -a;
  R.sh.forEach((sh, i) => { sh.rotation.set(a + reach, 0, (i ? 1 : -1) * 0.05); sh.children[1].rotation.set(0.05, 0, 0); });
  P.head.rotation.x = -0.15 * Math.min(1, a);
}
const FOLD = 1.6;
// put each violet block right under the middle student's folded hands
ST[1].set({ x: 0, z: 0, h: 0 }); fold(ST[1], FOLD); ST[1].g.updateMatrixWorld(true);
ST[1].hands.forEach((hd, j) => { const v = V3(0, 0, 0); hd.getWorldPosition(v); const top = Math.min(0.28, Math.max(0.1, v.y - 0.06)); mBlocks[j].position.set(v.x, top / 2, v.z); mBlocks[j].userData.sy = top / 0.23; });
const popBlock = (b, k) => { b.visible = k > 0.01; const s = Math.max(0.01, k); b.scale.set(s, s * b.userData.sy, s); };

// ---------- guides ----------
const HW = [V3(0, 0, 0), V3(0, 0, 0)], HD = V3(0, 0, 0), TG = V3(0, 0, 0);
const gaps = [beam(RED, 2.2, 0.022), beam(RED, 2.2, 0.022)]; // middle student's hands to the floor
const redGaze = beam(RED, 2.2, 0.03), greenGaze = beam(GREEN, 3, 0.03);
const ringOf = (hex, r) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2.2), toneMapped: false, transparent: true, opacity: 0 }); const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 8, 40), m); o.rotation.x = -Math.PI / 2; scene.add(o); return o; };
const okRing = ringOf(GREEN, 0.4); okRing.position.set(0, 0.03, BZ);
const seeRing = ringOf(GREEN, 0.45); // follows the student the teacher is watching

// ---------- text ----------
title("NEVER DEMO THE WHOLE CLASS");
cap("s2", "can't", "CAN'T SEE THEM", RED);
cap("s3", "unseen", "GOES UNSEEN", RED, { boom: 0.3 });
cap("s4", "once", "DEMO ONCE", GREEN);
cap("s4", "stand", "THEN STAND UP", VIOLET);
cap("s5", "walk", "WALK THE ROOM", GREEN);
cap("s5", "knees", "KNEES BACKS BREATH", GREEN);
cap("s6", "voice", "TEACH BY VOICE", VIOLET);
cap("s6", "eyes", "EYES ON THEM", GREEN, { boom: 0.3 });
endCard([["SHOW IT ONCE", 1], ["WATCH THE ROOM", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: from the side, the teacher and the class all folded on their mats
  // (round 2: pulled back; round 1 cropped the students at the left edge)
  { at: 0, K: [[0, [5.8, 2.9, -1.1, 0, 0.55, -1.0, 46]], [2.6, [5.4, 2.75, -1.15, 0, 0.55, -1.0, 46]]] },
  // s2: on the teacher from her side, her red gaze stuck on her own mat (round 2: pulled back, her head was cut at the edge)
  { at: T.s2, K: st([3.5, 1.8, -3.5, -0.2, 0.55, -2.0, 46], [3.35, 1.75, -3.4, -0.2, 0.55, -2.0, 46]) },
  // s3: the middle student straining, from the front-left (tested camera from reel 11)
  { at: T.s3, K: st([-1.5, 1.35, -3.0, 0.1, 0.6, -0.4, 44], [-1.4, 1.3, -2.85, 0.1, 0.6, -0.4, 44]) },
  // s4: on the teacher from beside the class, she demos once and stands up (head room for standing)
  { at: T.s4, K: st([3.4, 1.8, -0.3, 0, 0.9, -2.1, 46], [3.25, 1.75, -0.4, 0, 0.9, -2.1, 46]) },
  // s5: high behind the class, she walks in among the mats
  // (round 2: look point raised so the far teacher sits below the caption, not under it)
  { at: T.s5, K: st([2.2, 3.4, 3.6, 0, 1.0, -1.0, 46], [2.0, 3.25, 3.35, 0, 1.0, -1.0, 46]) },
  // s6: wide three-quarter front, she talks and the middle student gets her block
  // (round 2: look point moved to -x so she is left of the like/share buttons)
  { at: T.s6, K: st([3.5, 2.2, -4.3, -0.55, 0.5, -0.6, 46], [3.3, 2.1, -4.1, -0.55, 0.5, -0.6, 46]) },
  // s7-s8: calm high front, people low under the end card
  { at: T.s7, calm: 1, K: [[0, [3.4, 3.4, -4.6, -0.45, 1.5, -0.8, 48]], [5, [3.7, 3.6, -5.0, -0.45, 1.55, -0.8, 48]]] },
];

run("watch-the-room", (t) => {
  // ---- teacher: folded on her mat from the start, demos once in s4, stands on "stand", walks in s5, talks in s6
  const HOME = [0, TZ], A = [0.55, -1.45], B = [-0.5, -1.45];
  let wp;
  if (t < T.s5) wp = { x: HOME[0], z: HOME[1], h: Math.PI, walk: 0 };
  else if (t < T.knees) wp = walkPath(HOME, A, T.s5, T.knees, t);
  else if (t < T.s6 + 0.2) { wp = walkPath(A, B, T.knees + 0.05, T.s6 + 0.2, t); }
  else wp = { x: B[0], z: B[1], h: face(B, [0, BZ]), walk: 0 };
  if (!wp.walk && t >= T.s5) { const k = sm(T.s6 + 0.2, T.s6 + 0.5, t); const d = Math.atan2(Math.sin(face(B, [0, BZ]) - Math.PI), Math.cos(face(B, [0, BZ]) - Math.PI)); wp.h = Math.PI + d * k; }
  const talk = sm(T.s6 - 0.05, T.s6 + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  TE.set({ ...wp, t, argue: talk * 0.7 });
  // in the fold from 0.2 s; in s4 she comes half up and folds again on "once" (the one demo), then stands up on "stand"
  const tFold = sm(0.2, 0.7, t) * (1 - 0.45 * sm(T.s4, T.s4 + 0.25, t) * (1 - sm(T.once - 0.2, T.once + 0.05, t))) * (1 - sm(T.stand - 0.1, T.stand + 0.3, t));
  fold(TE, FOLD * tFold);
  TE.g.updateMatrixWorld(true);
  TE.head.getWorldPosition(HD);

  // ---- students: fold with her in s1-s3, look up in s4, fold again in s5-s6; the middle one strains until her block
  const up = sm(T.s4 - 0.05, T.s4 + 0.3, t) * (1 - sm(T.s5 + 0.1, T.s5 + 0.5, t));
  const inFold = sm(0.35, 0.95, t) * (1 - up);
  const strain = sm(T.help - 0.4, T.help, t) * (1 - up) * (1 - sm(T.eyes - 0.1, T.eyes + 0.25, t));
  ST.forEach((P, i) => {
    P.set({ x: XS[i], z: 0, h: 0, t });
    if (i !== 1) { fold(P, FOLD * inFold); return; }
    const shake = 0.05 * Math.sin(t * 23) * strain;
    fold(P, inFold * (FOLD * (1 - strain) + 1.45 * strain) + shake, 0.25 * strain * inFold);
    P.g.updateMatrixWorld(true);
    const gk = sm(T.help, T.help + 0.2, t) * (1 - up) * (1 - sm(T.eyes - 0.1, T.eyes + 0.1, t));
    P.hands.forEach((h, j) => { h.getWorldPosition(HW[j]); const Bp = HW[j].clone(); Bp.y = 0.02; gaps[j].set(V3(HW[j].x, HW[j].y - 0.06, HW[j].z), Bp, gk * (0.8 + 0.6 * flash(t, T.unseen))); });
  });
  spot.set(sm(T.help - 0.1, T.help + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.15, t)) * (0.75 + 0.25 * Math.sin(t * 8)));

  // ---- s1-s3: her eyes stay on her own mat (red gaze to her floor, her mat glows red in s2)
  const rg = sm(T.pose2 - 0.2, T.pose2 + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.1, t));
  redGaze.set(HD.clone(), V3(0, 0.02, TZ + 0.55), rg * (0.8 + 0.6 * flash(t, T.cant)));
  tSpot.set(sm(T.cant - 0.15, T.cant + 0.1, t) * (1 - sm(T.s3 + 0.3, T.s3 + 0.6, t)) * (0.7 + 0.3 * flash(t, T.cant)));

  // ---- s5-s6: a green gaze beam from her head to the student she watches (knees -> left, backs -> right, breath + s6 -> middle)
  const who = t < T.backs ? 0 : t < T.breath ? 2 : 1;
  ST[who].g.updateMatrixWorld(true); ST[who].head.getWorldPosition(TG);
  const gg = sm(T.knees - 0.15, T.knees + 0.05, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  greenGaze.set(HD.clone(), TG.clone(), gg * (0.8 + 0.6 * (flash(t, T.knees) + flash(t, T.backs) + flash(t, T.breath) + flash(t, T.eyes))));
  seeRing.position.set(XS[who], 0.03, -0.25);
  seeRing.material.opacity = gg * (1 - sm(T.eyes, T.eyes + 0.2, t)) * (0.7 + 0.3 * Math.sin(t * 6));
  const gp = sm(T.walk - 0.1, T.walk + 0.2, t) * (1 - sm(T.s7, T.s7 + 0.4, t));
  green.forEach((p, i) => p.set(gp * (i === who ? 0.9 : 0.35)));

  // ---- s6 "eyes": the middle student gets her block, rests on it, green ring
  const bk = sm(T.eyes - 0.25, T.eyes, t);
  mBlocks.forEach((b) => popBlock(b, bk * (1 + 0.15 * flash(t, T.eyes))));
  vTop.color.set(VIOLET).multiplyScalar(1.2 + 1.0 * flash(t, T.eyes));
  okRing.material.opacity = sm(T.eyes, T.eyes + 0.2, t) * (1 - sm(T.s7 + 0.3, T.s7 + 0.8, t)) * (0.7 + 0.3 * Math.sin(t * 6));
  okRing.scale.setScalar(1 + 0.3 * flash(t, T.eyes));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
