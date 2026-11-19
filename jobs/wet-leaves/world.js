// NEVER BRAKE ON WET LEAVES. Part A (s1-s3): the bike brakes on a leaf patch and the front slides; then leans on leaves in a bend and goes down.
// Part B (s4-s7): a green sight line spots the leaves far ahead, the bike slows on clean road, rolls over them upright.
import { THREE, S, g, sm, scene, bloom, glow, VIOLET, RED, GREEN, ORANGE, patch, beam, makeBike, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays, buildRoad, SP, ride, downLean } from "./extra.js";

scene.fog.density = 0.011;
const LANE = 1.8;
const T4 = S.s4[0];
const partA = (t) => t < T4;
buildRoad(SP, -40, 360);
const END = S.s8[0] + S.s8[1] + 1;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- leaves: flat glowing pieces, seeded ----------
let seed = 5; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const PATCHES = [];
const NL = 900, leaves = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.22, 0.14), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide }), NL);
leaves.frustumCulled = false; scene.add(leaves);
const LCOL = [new THREE.Color(ORANGE).multiplyScalar(1.3), new THREE.Color(0xffb020).multiplyScalar(1.1), new THREE.Color(RED).multiplyScalar(1.0)];
let li = 0;
function leafPatch(s0, len, x, n) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let k = 0; k < n && li < NL; k++, li++) {
    e.set(-Math.PI / 2, 0, rnd() * 6.28); q.setFromEuler(e);
    m.compose(v3(x + (rnd() - 0.5) * 3.0, 0.02, -(s0 + rnd() * len)), q, v3(1, 1, 1));
    leaves.setMatrixAt(li, m); leaves.setColorAt(li, LCOL[Math.floor(rnd() * 3)]);
  }
  PATCHES.push([s0, len]);
}

// ---------- part A ----------
const V = 10;
const Tb = g("s2", "brake"), Tsl = g("s2", "slides");
const Tln = g("s3", "lean"), Tdn = g("s3", "down");
// distance: steady, a short slow-down after the slide, then the bend; slides to a stop after "down"
const bikeA = (t) => { const base = V * t + 4; if (t < Tdn) return base; const d = Math.min(t - Tdn, 1.4); return V * Tdn + 4 + V * d - (V / 2.8) * d * d; };
const bendX = (t) => LANE - 2.4 * sm(S.s3[0], Tdn + 0.3, t);   // a bend to the left in s3
const fnBikeA = (u) => SP(bikeA(u), bendX(u));
leafPatch(bikeA(Tb) - 1.0, 9, LANE, 260);
leafPatch(bikeA(Tln) - 3.0, 10, LANE - 1.6, 260);
const skid = patch(1.0, 3.0, RED, 1.4); skid.position.set(LANE, 0.035, -(bikeA(Tsl) + 0.6));

// ---------- part B: slow down on "slow", roll over the leaves upright ----------
const V2 = 9, Ts5 = g("s5", "slow"), B0 = 200;
const speedB = (t) => V2 - 4 * sm(Ts5, Ts5 + 1.3, t);
const DT = 0.01, TAB = [0];
for (let t = T4; t < END; t += DT) TAB.push(TAB[TAB.length - 1] + speedB(t) * DT);
const bikeB = (t) => { const i = Math.max(0, (t - T4) / DT), k = Math.floor(i); const a = TAB[Math.min(k, TAB.length - 1)], b = TAB[Math.min(k + 1, TAB.length - 1)]; return B0 + a + (b - a) * (i - k); };
const PB = bikeB(S.s6[0] + 0.15) + 0.9;
leafPatch(PB, 8, LANE, 300);
leaves.instanceMatrix.needsUpdate = true; if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
const fnBikeB = (u) => SP(bikeB(u), LANE);
const P0 = (s, o = LANE) => ({ x: o, z: -s, h: 0 });

// ---------- props ----------
const bike = makeBike();
const sight = beam(GREEN, 2.4, 0.05);
const clean = patch(2.4, 1, GREEN, 0.7);

// ---------- text ----------
title("NEVER BRAKE ON WET LEAVES");
cap("s2", "slippery", "SLIPPERY", RED);
cap("s2", "brake", "BRAKE ON THEM", RED);
cap("s2", "slides", "FRONT SLIDES", RED, { boom: 0.4 });
cap("s3", "lean", "LEAN ON THEM", RED);
cap("s3", "down", "DOWN", RED, { boom: 0.8 });
cap("s4", "far", "LOOK FAR AHEAD", GREEN);
cap("s4", "spot", "SPOT THEM EARLY", GREEN);
cap("s5", "slow", "SLOW DOWN", GREEN);
cap("s5", "clean", "ON CLEAN ROAD", VIOLET);
cap("s6", "upright", "STAY UPRIGHT", GREEN);
cap("s6", "sudden", "NO SUDDEN MOVES", VIOLET);
endCard([["BRAKE BEFORE", 1], ["CROSS UPRIGHT", 1]]);

// ---------- shots ----------
const fBikeA = (t) => P0(bikeA(t), bendX(t)), fBikeB = (t) => P0(bikeB(t));
const SH = [
  // hook: low behind the bike, the leaves ahead on the road
  { at: 0, f: fBikeA, noRot: 1, K: [[0, [2.4, 2.4, 6.4, 0, 0.6, -9, 50]], [S.s2[0], [1.8, 2.8, 5.4, 0, 0.6, -9, 50]]] },
  // s2: high three-quarter, close on the front wheel on the leaves
  { at: S.s2[0], f: fBikeA, noRot: 1, K: [[0, [4.5, 4.5, 4.5, 0, 0.4, -2, 50]], [3.0, [4.0, 4.2, 3.0, 0, 0.4, -2.5, 50]]] },
  // s3: high, outside the bend
  { at: S.s3[0], f: fBikeA, noRot: 1, K: [[0, [4.5, 5.5, 6.5, -1, 0.4, -3, 50]], [2.2, [5.0, 6.0, 5.0, -1, 0.4, -2, 50]]] },
  // s4: high behind, the green line reaches the leaves far ahead
  { at: T4, f: fBikeB, noRot: 1, K: [[0, [2.6, 7.0, 10, 0, 0, -22, 50]], [2.3, [2.4, 7.5, 11, 0, 0, -22, 50]]] },
  // s5: low side, the bike slows on clean road with the leaves just ahead
  { at: S.s5[0], f: fBikeB, noRot: 1, K: [[0, [4.8, 2.6, 3.0, 0, 0.6, -6, 48]], [2.3, [4.8, 2.6, 1.5, 0, 0.6, -6, 48]]] },
  // s6: high behind, upright over the leaves
  { at: S.s6[0], f: fBikeB, noRot: 1, K: [[0, [2.6, 5.5, 7.5, 0, 0.4, -7, 50]], [2.5, [2.4, 6.0, 8.0, 0, 0.4, -8, 50]]] },
  // s7-s8: calm, high behind
  { at: S.s7[0], f: fBikeB, noRot: 1, calm: 1, K: [[0, [2.0, 6.5, 13, 0, 0.5, -10, 50]], [5, [2.0, 9, 16, 0, 0, -12, 50]]] },
];

run("wet-leaves", (t) => {
  const A = partA(t);
  // s2: the front washes out (heading wobble) between "brake" and a moment after "slides"
  const wob = A && t >= Tb && t < S.s3[0] ? 0.22 * Math.sin((t - Tb) * 22) * sm(Tb, Tsl, t) * (1 - sm(Tsl + 0.3, S.s3[0], t)) : 0;
  const down = A && t >= Tdn ? sm(Tdn, Tdn + 0.5, t) : 0;
  const extra = {};
  if (wob) extra.h = wob;
  if (down > 0) extra.lean = downLean(down, -1);
  const st = ride(bike, A ? fnBikeA : fnBikeB, t, A ? RED : GREEN, extra);
  bike.sig(0, t);
  skid.set(A && t >= Tsl - 0.1 && t < S.s3[0] ? sm(Tsl - 0.1, Tsl + 0.2, t) : 0);

  // part B: sight line on "far" until s5 ends; clean road between bike and leaves glows in s5
  const sa = A ? 0 : sm(g("s4", "look") - 0.1, g("s4", "far") + 0.2, t) * (1 - sm(S.s5[0] + 0.6, S.s5[0] + 1.0, t));
  if (st) sight.set(v3(st.x, 1.55, st.z), v3(LANE, 0.1, -(PB + 3)), sa);
  if (!A && st) { const f = bikeB(t) + 0.9, len = Math.max(0.05, PB - f); clean.scale.set(1, len, 1); clean.position.set(LANE, 0.03, -(f + len / 2)); }
  clean.set(!A ? sm(g("s5", "slow") - 0.1, g("s5", "slow") + 0.3, t) * (1 - sm(S.s6[0], S.s6[0] + 0.3, t)) : 0);

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
