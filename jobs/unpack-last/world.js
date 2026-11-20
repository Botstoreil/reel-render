// NEVER UNPACK FIRST (Hidden Cam 11). Same hotel room as face-the-bed: bed on the back wall, a bathroom door back-left,
// the front wall (z = +2.75) with the entry door (left), a dresser with a clock, a TV and an air vent.
// s1 the guest walks in and drops his suitcase on the bed; on "unpack" the lid opens and his things fly everywhere.
// s2 top view of the mess, red patch on "harder". s3 close on the clock: red ring + lens glint on "something",
// then he heads for the door through the mess on "leave". s4 reset: suitcase closed BY THE DOOR, green patch.
// s5 one slow sweep: green on the bed, green ring on the bathroom door, violet rings on the clock lens and the vent hole.
// s6 green floor on "clear", his things fly from the bag into two neat stacks on the dresser on "unpack". s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, face, walkPath, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.016;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  unpack1: g("s1", "unpack"),
  s2: S.s2[0], everywhere: g("s2", "everywhere"), room: g("s2", "room"), harder: g("s2", "harder"),
  s3: S.s3[0], something: g("s3", "something"), leave: g("s3", "leave"),
  s4: S.s4[0], bag: g("s4", "bag"), door: g("s4", "door"),
  s5: S.s5[0], slow: g("s5", "slow"), bed: g("s5", "bed"), bathroom: g("s5", "bathroom"), anything: g("s5", "anything"), lens: g("s5", "lens"), hole: g("s5", "hole"),
  s6: S.s6[0], clear: g("s6", "clear"), unpack6: g("s6", "unpack"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- bed against the back wall ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.6, 0.3, 2.0, 0, 0.2, -1.95, mat(0x4a40c0)));
bed.add(box(1.5, 0.2, 1.9, 0, 0.45, -1.93, mat(0xe8e4ff, 0.12)));
bed.add(box(0.6, 0.12, 0.3, -0.35, 0.6, -2.7, mat(0xffffff, 0.2), false), box(0.6, 0.12, 0.3, 0.35, 0.6, -2.7, mat(0xffffff, 0.2), false));
bed.add(box(1.6, 0.9, 0.08, 0, 0.7, -2.95, mat(0x2e2890)));
solid(bed);
scene.add(box(0.45, 0.5, 0.4, -1.2, 0.25, -2.6, mat(0x5a4ce0, 0.2))); // nightstand
const lamp = glow(0xfff0d8, 0.8);
scene.add(box(0.5, 0.04, 0.5, 0, 3.15, 0, lamp, false));

// bathroom door on the back wall (left), light under it
door(-2.6, -2.95, Math.PI);
scene.add(box(0.9, 0.03, 0.06, -2.6, 0.02, -2.88, glow(0xbfe8ff, 1.8), false));

// ---------- front wall (z = 2.75) ----------
const FZ = 2.75;
scene.add(box(10, 3.2, 0.1, 0, 1.6, FZ + 0.05, mat(0x15123f, 0.1), false));
door(-2.4, FZ - 0.02, 0); // entry door
const dresser = box(1.8, 0.8, 0.45, -0.2, 0.4, FZ - 0.25, mat(0x4a40c0)); scene.add(dresser); solid(dresser);
const TV = V3(0.2, 1.65, FZ - 0.04);
scene.add(box(1.2, 0.7, 0.05, TV.x, TV.y, TV.z, mat(0x0c0a24, 0.05), false), box(1.1, 0.62, 0.01, TV.x, TV.y, TV.z - 0.03, glow(0x2a2470, 0.6), false));
// clock on the dresser (tiny lens under the face)
const CLK = V3(-0.75, 0.93, FZ - 0.3);
const clk = new THREE.Group(); clk.position.copy(CLK); scene.add(clk);
clk.add(box(0.3, 0.26, 0.1, 0, 0, 0, mat(0x2a2470, 0.15), false));
clk.add(box(0.24, 0.12, 0.005, 0, 0.03, -0.052, glow(0x7b5cff, 1.4), false));
const lensM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(1.2), toneMapped: false });
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), lensM); lens.position.set(0, -0.08, -0.052); clk.add(lens);
// air vent (high right)
const VNT = V3(0.9, 2.3, FZ - 0.02);
scene.add(box(0.6, 0.3, 0.03, VNT.x, VNT.y, VNT.z, mat(0x8a86b0, 0.2), false));
for (let i = -2; i <= 2; i++) scene.add(box(0.55, 0.02, 0.01, VNT.x, VNT.y + i * 0.055, VNT.z - 0.02, mat(0x1a1830, 0.05), false));

function ringOf(hex, r, at) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 8, 40), m); o.renderOrder = 21; o.position.copy(at); scene.add(o); return o;
}
const rClkBad = ringOf(RED, 0.22, V3(CLK.x, CLK.y, CLK.z - 0.08));
const rBath = ringOf(GREEN, 0.75, V3(-2.6, 1.05, -2.85));
const rLens = ringOf(VIOLET, 0.22, V3(CLK.x, CLK.y, CLK.z - 0.08));
const rHole = ringOf(VIOLET, 0.36, V3(VNT.x, VNT.y, VNT.z - 0.08));
const bedOk = patch(1.7, 2.1, GREEN, 0.9); bedOk.position.set(0, 0.58, -1.93);
const mess = patch(4.2, 3.6, RED, 0.8); mess.position.set(0, 0.03, -1.2);
const bagOk = patch(0.9, 0.7, GREEN, 1.1); bagOk.position.set(-1.6, 0.03, 2.35);
const allOk = patch(5.5, 5.0, GREEN, 0.5); allOk.position.set(-0.3, 0.03, 0);

// ---------- suitcases: flat on the bed (s1-s3), standing closed by the door (s4+) ----------
const caseM = mat(0xff8a3d, 0.35), handleM = glow(WHITE, 1.4);
const flat = new THREE.Group(); flat.position.set(0.15, 0.6, -1.1); scene.add(flat);
flat.add(box(0.75, 0.12, 0.5, 0, 0.06, 0, caseM));
const lid = new THREE.Group(); lid.position.set(0, 0.12, -0.25); flat.add(lid);
lid.add(box(0.75, 0.1, 0.5, 0, 0.05, 0.25, caseM));
const stand = new THREE.Group(); stand.position.set(-1.6, 0, 2.35); scene.add(stand);
stand.add(box(0.5, 0.7, 0.26, 0, 0.42, 0, caseM), box(0.2, 0.03, 0.03, 0, 0.82, 0, handleM, false));
for (const sx of [-0.18, 0.18]) stand.add(box(0.05, 0.07, 0.05, sx, 0.04, 0, mat(0x14102e, 0.05), false));

// ---------- his things: 8 folded clothes ----------
const HEX = [0x3d7bff, 0xe8e4ff, 0xff5fa2, 0x3dd6ff, 0xffd23d, 0x9a7bff, 0x6affc0, 0xff9a5a];
const MESS = [[-0.4, 0.6, -2.1], [0.45, 0.6, -1.65], [-0.3, 0.6, -1.25], [0.95, 0.04, -0.7], [-1.05, 0.04, -0.9], [0.25, 0.04, 0.1], [-1.2, 0.53, -2.6], [-0.9, 0.04, 0.6]].map((p) => V3(...p));
const NEAT = HEX.map((_, i) => V3(i < 4 ? 0.2 : 0.55, 0.84 + (i % 4) * 0.065, FZ - 0.3));
const items = HEX.map((h) => { const o = box(0.32, 0.06, 0.24, 0, 0, 0, mat(h, 0.35), false); scene.add(o); return o; });
const fly = (o, a, b, k, spin) => { o.position.copy(a).lerp(b, k); o.position.y += 0.7 * Math.sin(Math.PI * k); o.rotation.set(0, spin * (1 - k), spin * 0.5 * Math.sin(Math.PI * k)); };
const FROM_BED = V3(0.15, 0.75, -1.1), FROM_BAG = V3(-1.6, 0.8, 2.35);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const STOP1 = [0.8, -0.55], DOOR_IN = [-1.9, 1.95], BAG_SPOT = [-0.7, 1.9], SWEEP = [0.9, -0.9], DRESS = [0.7, 1.9];

// ---------- text ----------
title("NEVER UNPACK FIRST");
cap("s2", "everywhere", "THINGS EVERYWHERE", RED);
cap("s2", "harder", "HARDER TO CHECK", RED, { boom: 0.3 });
cap("s3", "something", "FOUND SOMETHING?", RED);
cap("s3", "leave", "NOW LEAVE FAST", RED, { boom: 0.3 });
cap("s4", "bag", "BAG BY THE DOOR", GREEN, { boom: 0.3 });
cap("s5", "slow", "ONE SLOW SWEEP", VIOLET);
cap("s5", "bed", "BED + BATHROOM", GREEN);
cap("s5", "anything", "LENS OR HOLE", VIOLET, { boom: 0.3 });
cap("s6", "clear", "ALL CLEAR", GREEN);
cap("s6", "unpack", "NOW UNPACK", VIOLET, { boom: 0.3 });
endCard([["BAG BY THE DOOR", 1], ["CHECK, THEN UNPACK", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // s1: wide of the bed from the front-right, the guest walks in and drops the case
  { at: 0, K: [[0, [1.9, 2.0, 2.4, -0.1, 0.7, -1.6, 54]], [2.4, [1.6, 1.9, 2.0, -0.1, 0.7, -1.6, 52]]] },
  // s2: high view of the mess
  { at: T.s2, K: st([0.6, 2.9, 1.2, -0.1, 0.3, -1.3, 54], [0.5, 2.75, 0.9, -0.1, 0.3, -1.3, 52]) },
  // s3: close on the clock
  { at: T.s3, K: st([-0.45, 1.15, 1.35, -0.75, 0.93, FZ - 0.3, 38], [-0.5, 1.12, 1.55, -0.75, 0.93, FZ - 0.3, 34]) },
  // s3 "leave": from the back-right corner, he heads for the door through the mess
  { at: T.leave - 0.15, K: st([2.0, 1.9, -1.2, -1.4, 0.7, 1.8, 54], [1.85, 1.85, -1.0, -1.4, 0.7, 1.8, 52]) },
  // s4: the bag by the door
  { at: T.s4, K: st([-0.4, 1.5, 0.3, -1.9, 0.7, 2.4, 46], [-0.5, 1.45, 0.5, -1.9, 0.7, 2.4, 44]) },
  // s5: high wide, bed + bathroom door
  { at: T.s5, K: st([2.3, 2.5, 1.9, -0.8, 0.8, -1.5, 58], [2.1, 2.4, 1.6, -0.8, 0.8, -1.5, 56]) },
  // s5 "anything": the front wall, clock lens and vent
  { at: T.anything - 0.05, K: st([0.05, 1.5, -0.5, 0.05, 1.5, FZ, 56], [0.05, 1.5, -0.3, 0.05, 1.5, FZ, 54]) },
  // s6: back-right corner toward the door and the dresser
  { at: T.s6, K: st([2.0, 1.8, -1.0, -0.6, 0.9, 2.4, 52], [1.85, 1.75, -0.85, -0.6, 0.9, 2.4, 50]) },
  // s7-s8: calm wide of the bed
  { at: T.s7, calm: 1, K: [[0, [1.6, 2.1, 2.3, -0.2, 0.9, -1.9, 52]], [5, [1.5, 2.2, 2.4, -0.2, 0.9, -1.9, 52]]] },
];

run("unpack-last", (t) => {
  const pul = 0.8 + 0.2 * Math.sin(t * 8);
  const wrong = t < T.s4;

  // ---- the guest ----
  let pp;
  if (t < T.s3) {
    const w = walkPath([2.4, 0.7], STOP1, 0.1, T.unpack1 - 0.15, t);
    pp = { ...w, h: t < T.unpack1 - 0.15 ? w.h : face(STOP1, [0.15, -1.1]), shrug: sm(T.harder - 0.2, T.harder + 0.1, t) };
  } else if (t < T.s4) {
    const w = walkPath(STOP1, DOOR_IN, T.leave - 0.1, T.s4 + 0.2, t);
    pp = t < T.leave - 0.1 ? { x: STOP1[0], z: STOP1[1], h: face(STOP1, [CLK.x, CLK.z]), point: sm(T.something, T.something + 0.25, t) } : w;
  } else if (t < T.s5) {
    pp = { x: BAG_SPOT[0], z: BAG_SPOT[1], h: face(BAG_SPOT, [-1.6, 2.35]), point: sm(T.bag - 0.1, T.bag + 0.15, t) };
  } else if (t < T.s6) {
    const w = walkPath(BAG_SPOT, SWEEP, T.s5 + 0.05, T.bathroom + 0.1, t);
    pp = t < T.bathroom + 0.1 ? { ...w, phone: 0.0 } : { x: SWEEP[0], z: SWEEP[1], h: face(SWEEP, [0, FZ]), point: sm(T.lens - 0.2, T.lens + 0.1, t) };
  } else {
    const w = walkPath(SWEEP, DRESS, T.s6 + 0.05, T.unpack6, t);
    pp = { ...w, cheer: 0.5 * sm(T.clear - 0.1, T.clear + 0.15, t) * (1 - sm(T.clear + 0.3, T.clear + 0.5, t)) };
    if (t >= T.unpack6) pp.h = face(DRESS, [0.35, FZ]);
  }
  P.set({ walk: 0, ...pp, t, vis: t < T.s7 });

  // ---- suitcases ----
  flat.visible = wrong; stand.visible = !wrong;
  lid.rotation.x = -1.9 * sm(T.unpack1 - 0.1, T.unpack1 + 0.15, t);

  // ---- his things: burst onto the bed and floor (s1-s3), hidden in the bag (s4-s5), neat stacks (s6+) ----
  items.forEach((o, i) => {
    if (wrong) {
      const k = sm(T.unpack1 + i * 0.04, T.unpack1 + 0.45 + i * 0.04, t);
      o.visible = k > 0; fly(o, FROM_BED, MESS[i], k, 2.5 + i);
    } else {
      const k = sm(T.unpack6 + i * 0.06, T.unpack6 + 0.4 + i * 0.06, t);
      o.visible = k > 0; fly(o, FROM_BAG, NEAT[i], k, 1.5);
    }
  });

  // ---- wrong way: red mess, red ring + glint on the clock ----
  mess.set(sm(T.harder - 0.1, T.harder + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3, t)) + sm(T.leave - 0.1, T.leave + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4, t)));
  rClkBad.material.opacity = sm(T.something - 0.05, T.something + 0.1, t) * (1 - sm(T.leave - 0.2, T.leave - 0.1, t)) * pul;
  rClkBad.scale.setScalar(1 + 0.4 * flash(t, T.something));
  const glint = sm(T.something - 0.1, T.something + 0.1, t) * (1 - sm(T.s4 - 0.2, T.s4, t));
  lensM.color.set(0x8fa0ff).multiplyScalar(1.2 + 6 * glint * (0.8 + 0.2 * Math.sin(t * 14)));

  // ---- right way: bag by the door, the sweep, all clear ----
  bagOk.set(sm(T.bag - 0.1, T.bag + 0.1, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.1, t)));
  bedOk.set(sm(T.bed - 0.1, T.bed + 0.1, t) * (1 - sm(T.anything - 0.2, T.anything, t)));
  rBath.material.opacity = sm(T.bathroom - 0.05, T.bathroom + 0.1, t) * (1 - sm(T.anything - 0.2, T.anything, t)) * pul;
  rBath.scale.setScalar(1 + 0.3 * flash(t, T.bathroom));
  rLens.material.opacity = sm(T.lens - 0.05, T.lens + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)) * pul;
  rLens.scale.setScalar(1 + 0.4 * flash(t, T.lens));
  rHole.material.opacity = sm(T.hole - 0.05, T.hole + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)) * pul;
  rHole.scale.setScalar(1 + 0.4 * flash(t, T.hole));
  allOk.set(sm(T.clear - 0.1, T.clear + 0.15, t) * (1 - sm(T.s7 - 0.2, T.s7, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
