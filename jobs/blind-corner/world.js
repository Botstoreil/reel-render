// NEVER CUT A BLIND CORNER. Part A (s1-s3): a left bend hidden behind a wall; the bike cuts across the centre line
// and an oncoming car comes round the bend in that lane. Part B (s4-s7): the same kind of bend, the bike stays in its
// own lane, turns in late once the exit is visible (green sight line), slow enough to stop in the visible road.
import { THREE, S, g, sm, scene, bloom, VIOLET, RED, GREEN, ORANGE, patch, beam, box, glow, mSolid, makeBike, makeCar, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays, buildRoad, track, ride } from "./extra.js";

scene.fog.density = 0.012;
const LANE = 1.8, LW = 3.6;
const T4 = S.s4[0];
const END = S.s8[0] + S.s8[1] + 1;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// two left bends, the second one for part B
const A0 = 30, B0 = 200, AL = 42, R = 24;
const TR = track([{ len: A0 }, { len: AL, R }, { len: B0 - A0 - AL }, { len: AL, R }, { len: 260 }]);
const P = TR.P;
buildRoad(P, -30, 470);
// the wall on the inside of each bend: this is what makes the corner blind
for (const c0 of [A0, B0]) for (let s = c0 - 6; s < c0 + AL + 4; s += 1.1) {
  const [x, z] = P(s, -(LW + 2.2));
  scene.add(box(1.15, 3.2, 1.15, x, 1.6, z, mSolid, true));
}
const W3 = (s, o, y = 0.1) => { const [x, z] = P(s, o); return v3(x, y, z); };

// ---------- part A ----------
const V = 10;
const Tcl = g("s2", "center"), Tcar = g("s3", "car"), Tln = g("s3", "lane");
const sA = (t) => { if (t < Tln) return V * t + 4; const d = Math.min(t - Tln, 0.9); return V * Tln + 4 + V * d - (V / 1.8) * d * d; };
// cut: drift across the centre line through the bend, swerve back after "lane"
const oA = (t) => LANE - 3.0 * sm(Tcl - 0.6, Tcl + 0.5, t) + 3.0 * sm(Tln + 0.1, Tln + 0.8, t);
const fnA = (u) => P(sA(u), oA(u));
// oncoming car in the left lane: 11 m ahead at "lane", then brakes to a stop
const VC = 9, GAP = 11;
const cS = (t) => { const base = sA(Tln) + GAP; if (t < Tln) return base + VC * (Tln - t); const d = Math.min(t - Tln, 0.8); return base - VC * d + (VC / 1.6) * d * d; };
const fnCar = (u) => { const q = cS(u), [x, z] = P(q, -LANE), h = TR.C(q)[2] + Math.PI; return [x, z, h]; };

// ---------- part B: same bend, own lane, late turn-in, slows ----------
const V2 = 9, Tsl = g("s6", "speed");
const speedB = (t) => V2 - 3.5 * sm(Tsl - 0.2, Tsl + 1.0, t);
const DT = 0.01, TAB = [0];
for (let t = T4; t < END; t += DT) TAB.push(TAB[TAB.length - 1] + speedB(t) * DT);
const SB0 = B0 - 22;
const sB = (t) => { const i = Math.max(0, (t - T4) / DT), k = Math.floor(i); const a = TAB[Math.min(k, TAB.length - 1)], b = TAB[Math.min(k + 1, TAB.length - 1)]; return SB0 + a + (b - a) * (i - k); };
// late turn-in: hold the outside of the lane, come to the middle of the lane on "lean"
const Tlean = g("s5", "lean");
const oB = (t) => LANE + 0.9 * sm(T4, T4 + 0.8, t) - 0.9 * sm(Tlean - 0.2, Tlean + 0.6, t);
const fnB = (u) => P(sB(u), oB(u));
// a car passes in its own lane during s6: no conflict
const cB = (t) => sB(S.s6[0]) + 30 - 11 * (t - S.s6[0]);
const fnCarB = (u) => { const q = cB(u), [x, z] = P(q, -LANE), h = TR.C(q)[2] + Math.PI; return [x, z, h]; };

// ---------- props ----------
const bike = makeBike();
const car = makeCar({ color: 0x7a2a3a });
const sight = beam(GREEN, 2.4, 0.05);
const mLane = glow(GREEN, 0.6), laneMarks = [];
for (let s = B0 - 14; s < B0 + AL + 8; s += 1.0) { const [x, z] = P(s, LANE); const [x2, z2] = P(s + 1, LANE); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.05), mLane); m.rotation.set(-Math.PI / 2, 0, Math.atan2(-(x2 - x), -(z2 - z))); m.position.set(x, 0.03, z); m.visible = false; scene.add(m); laneMarks.push([s, m]); }
const mStop = glow(VIOLET, 0.9), stopMarks = [];
for (let k = 0; k < 9; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.9), mStop); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); stopMarks.push(m); }
const xline = patch(0.5, 1, RED, 1.6);

// ---------- text ----------
title("NEVER CUT A BLIND CORNER");
cap("s2", "center", "OVER THE LINE", RED);
cap("s3", "car", "ONCOMING CAR", RED, { boom: 0.6 });
cap("s3", "lane", "IN ITS LANE", RED, { boom: 0.8 });
cap("s4", "own", "STAY IN YOUR LANE", GREEN);
cap("s4", "late", "TURN IN LATE", GREEN);
cap("s5", "exit", "SEE THE EXIT", GREEN);
cap("s5", "lean", "THEN LEAN IN", GREEN);
cap("s6", "stop", "STOP IN WHAT YOU SEE", VIOLET);
endCard([["STAY IN YOUR LANE", 1], ["STOP IN WHAT YOU SEE", 1]]);

// ---------- shots (camera keys local to the bike, no rotation: world axes) ----------
const head = (fn) => (t) => { const p = fn(t), q = fn(t + 0.05); return { x: p[0], z: p[1], h: Math.atan2(-(q[0] - p[0]), -(q[1] - p[1])) }; };
const fA = head(fnA), fB = head(fnB);
const SH = [
  // hook: low behind the bike, the wall hides the bend ahead
  { at: 0, f: fA, K: [[0, [0.6, 1.9, 5.5, 0, 1.0, -12, 52]], [S.s2[0], [0.4, 2.1, 5.0, 0, 1.0, -12, 52]]] },
  // s2: high behind, see the bike drift over the centre line
  { at: S.s2[0], f: fA, K: [[0, [1.5, 7.5, 9.0, -0.5, 0, -8, 50]], [2.3, [1.0, 8.0, 9.5, -1, 0, -9, 50]]] },
  // s3: over the bike, the car comes round the wall head-on
  { at: S.s3[0], f: fA, K: [[0, [2.5, 3.5, 6.0, -1, 0.8, -12, 50]], [2.2, [3.0, 4.0, 6.5, -1, 0.8, -8, 50]]] },
  // s4: high behind, the green lane ahead
  { at: T4, f: fB, K: [[0, [0.8, 7.0, 10, 0, 0, -16, 50]], [2.1, [0.5, 7.5, 10.5, -1, 0, -16, 50]]] },
  // s5: rider height behind, the exit opens up, sight line
  { at: S.s5[0], f: fB, K: [[0, [0.5, 2.4, 5.5, 0, 1.0, -12, 52]], [2.0, [0.3, 2.6, 5.5, -1, 1.0, -12, 52]]] },
  // s6: high, the stop zone ahead in the visible road, car passes in its lane
  { at: S.s6[0], f: fB, K: [[0, [3.0, 8.0, 8.0, 0, 0, -10, 50]], [2.6, [2.5, 8.5, 9.0, -1, 0, -11, 50]]] },
  // s7-s8: calm, high behind
  { at: S.s7[0], f: fB, calm: 1, K: [[0, [1.0, 7.0, 13, 0, 0.5, -10, 50]], [5, [1.0, 9.5, 16, 0, 0, -12, 50]]] },
];

run("blind-corner", (t) => {
  const A = t < T4;
  const st = ride(bike, A ? fnA : fnB, t, A ? RED : GREEN, {});
  bike.sig(0, t);

  // car: part A from the start of s3, part B in s6-s7
  if (A && t >= S.s3[0] - 0.3) car.set(require1(fnCar, t));
  else if (!A && t >= S.s6[0] && t < S.s8[0]) car.set(require1(fnCarB, t));
  else car.set(null);

  // red patch on the centre line while the bike is over it
  const over = A ? sm(Tcl - 0.2, Tcl + 0.2, t) * (1 - sm(Tln + 0.3, Tln + 0.7, t)) : 0;
  if (st) { xline.position.set(st.x, 0.035, st.z); xline.scale.set(1, 3, 1); xline.rotation.z = 0; }
  xline.set(over);

  // part B: own lane glows from "own" to the end of s5
  const la = !A ? sm(g("s4", "own") - 0.1, g("s4", "own") + 0.3, t) * (1 - sm(S.s6[0], S.s6[0] + 0.4, t)) : 0;
  for (const [s, m] of laneMarks) m.visible = la > 0.02 && s > sB(t) + 1;
  mLane.color.copy(new THREE.Color(GREEN).multiplyScalar(0.6 * la));
  // sight line to the exit on "exit"
  const sa = !A ? sm(g("s5", "exit") - 0.1, g("s5", "exit") + 0.3, t) * (1 - sm(S.s6[0] + 0.2, S.s6[0] + 0.6, t)) : 0;
  if (st) sight.set(v3(st.x, 1.55, st.z), W3(B0 + AL + 6, LANE, 0.2), sa);
  // s6: stop zone in the road you can see
  const za = !A ? sm(g("s6", "stop") - 0.1, g("s6", "stop") + 0.3, t) * (1 - sm(S.s7[0] + 0.3, S.s7[0] + 0.8, t)) : 0;
  stopMarks.forEach((m, k) => { const q = sB(t) + 2 + k; const [x, z] = P(q, oB(t)); m.position.set(x, 0.03, z); m.rotation.z = TR.C(q)[2]; m.visible = za > 0.02; });
  mStop.color.copy(new THREE.Color(VIOLET).multiplyScalar(0.9 * za));

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

function require1(fn, t) { const a = fn(t), b = fn(t + 0.02); return { x: a[0], z: a[1], h: a[2] }; }
