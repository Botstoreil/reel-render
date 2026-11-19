// NEVER SIT IN A BLIND SPOT. Part A (s1-s3): bike rides beside the car's rear quarter (red zone), the mirror's view misses it,
// the car changes lanes into the bike. Part B (s4-s7): bike drops back out of the zone, a green sight line joins the rider and the mirror.
import { THREE, S, g, sm, scene, bloom, glow, box, VIOLET, RED, GREEN, patch, beam, makeBike, makeCar, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays, buildRoad, SP, ride, downLean } from "./extra.js";

scene.fog.density = 0.011;
const LC = -1.8, LB = 1.8;                // car in the left lane, bike in the right lane (same direction)
const T4 = S.s4[0];
const partA = (t) => t < T4;
buildRoad(SP, -40, 330);

const V = 10;
const carS = (t) => V * t + 6;
// ---------- part A: lane change into the bike ----------
const Tc = g("s3", "change") - 0.05, Thit = g("s3", "into") + 0.05;
const CX_HIT = LB - 0.93 - 0.32;                                  // car's right side touches the bike
const carXA = (t) => LC + (CX_HIT - LC) * sm(Tc, Thit, t) + 0.35 * sm(Thit, Thit + 0.8, t);
const BACK_A = 3.0;                                               // bike sits beside the car's rear quarter
const bikeSA = (t) => { if (t < Thit) return carS(t) - BACK_A; const d = Math.min(t - Thit, V / 12); return carS(Thit) - BACK_A + V * d - 6 * d * d; };
const bikeXA = (t) => LB + 1.3 * sm(Thit, Thit + 0.7, t);
// ---------- part B: drop back out of the blind spot ----------
const Td0 = g("s4", "drop") - 0.1, Td1 = g("s4", "ahead");
const bikeSB = (t) => carS(t) - BACK_A - 9 * sm(Td0, Td1, t);

const fnCarA = (u) => [carXA(u), -carS(u)], fnCarB = (u) => [LC, -carS(u)];
const fnBikeA = (u) => [bikeXA(u), -bikeSA(u)], fnBikeB = (u) => [LB, -bikeSB(u)];

// ---------- props ----------
const bike = makeBike(), car = makeCar({ driver: true });
const mMirror = glow(VIOLET, 1.2);
car.g.add(box(0.22, 0.14, 0.08, 1.02, 1.02, -0.72, mMirror, false), box(0.22, 0.14, 0.08, -1.02, 1.02, -0.72, mMirror, false));
const MIR = new THREE.Vector3(1.02, 1.02, -0.72);
const zone = patch(1.9, 4.6, RED, 1.2);                           // the blind spot: right lane, beside the rear quarter
const viewL = beam(VIOLET, 2, 0.035), viewR = beam(VIOLET, 2, 0.035); // what the mirror sees: a cone straight back
const sight = beam(GREEN, 2.4, 0.05);                             // rider <-> mirror
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- text ----------
title("NEVER SIT IN A BLIND SPOT");
cap("s2", "mirror", "CHECKS MIRROR", RED);
cap("s2", "sees", "SEES NOTHING", RED, { boom: 0.3 });
cap("s3", "change", "LANE CHANGE", RED);
cap("s3", "into", "CRASH", RED, { boom: 0.8 });
cap("s4", "drop", "DROP BACK", GREEN);
cap("s4", "ahead", "OR MOVE AHEAD", VIOLET);
cap("s4", "stay", "NOT BESIDE IT", VIOLET);
cap("s5", "face", "SEE THEIR FACE", GREEN);
cap("s6", "eyes", "SEE THEIR EYES", GREEN);
cap("s6", "see", "THEY SEE YOU", GREEN, { n: 2 });
endCard([["DON'T RIDE BESIDE", 1], ["BE SEEN", 1]]);

// ---------- shots (keys local to the followed point, world axes) ----------
const P0 = (s, o) => ({ x: o, z: -s, h: 0 });
const fCar = (t) => P0(carS(t), LC), fBikeA = (t) => P0(bikeSA(t), LB), fBikeB = (t) => P0(bikeSB(t), LB);
const SH = [
  // hook: behind and above the bike, the car ahead-left, bike beside its rear
  { at: 0, f: fBikeA, noRot: 1, K: [[0, [0.6, 3.4, 7.0, -1.6, 0.8, -2.5, 50]], [2.4, [0.2, 3.8, 6.2, -1.6, 0.8, -2.5, 50]]] },
  // s2: high, right-rear of the car: the mirror cone goes straight back, the bike sits outside it in red
  { at: S.s2[0], f: fCar, noRot: 1, K: [[0, [5.5, 6.5, 7.5, 1.4, 0.5, 1.8, 50]], [2.0, [5.0, 7.0, 6.5, 1.4, 0.5, 1.8, 50]]] },
  // s3: front-right, high: the car swings over into the bike
  { at: Tc - 0.25, f: fCar, noRot: 1, K: [[0, [5.0, 5.0, -4.0, 1.6, 0.5, 2.2, 52]], [2.0, [5.8, 5.8, -2.5, 1.8, 0.4, 2.2, 52]]] },
  // s4: high chase behind both: the bike falls back out of the red zone
  { at: T4, f: fCar, noRot: 1, K: [[0, [3.0, 7.5, 13, 1.2, 0, -1, 50]], [3.0, [3.4, 8.5, 16, 1.4, 0, -2, 50]]] },
  // s5: over the rider's shoulder, looking up the lane at the car's right mirror
  { at: S.s5[0], f: fBikeB, noRot: 1, K: [[0, [0.5, 2.1, 2.6, -2.4, 1.0, -11, 44]], [2.3, [0.4, 2.0, 1.8, -2.4, 1.0, -11, 40]]] },
  // s6: high side view: the green line runs both ways between rider and mirror
  { at: S.s6[0], f: fCar, noRot: 1, K: [[0, [6.5, 5.5, 6.0, 1.5, 0.6, 4.5, 52]], [1.8, [7.0, 6.0, 7.0, 1.5, 0.6, 4.5, 52]]] },
  // s7-s8: calm, high behind
  { at: S.s7[0], f: fCar, noRot: 1, calm: 1, K: [[0, [2.5, 8.5, 17, 1.0, 0, -2, 50]], [5, [2.5, 10, 20, 1.0, 0, -4, 50]]] },
];

run("blind-spot", (t) => {
  const A = partA(t);
  // car
  const fc = A ? fnCarA : fnCarB;
  const p = fc(t), p1 = fc(t + 0.02), m1 = fc(t - 0.02);
  const h = Math.atan2(-(p1[0] - m1[0]), -(p1[1] - m1[1]));
  car.set({ x: p[0], z: p[1], h }, 0);
  car.g.updateMatrixWorld(true);
  const mir = car.g.localToWorld(MIR.clone());

  // bike
  const down = A && t >= Thit ? sm(Thit, Thit + 0.5, t) : 0;
  const st = ride(bike, A ? fnBikeA : fnBikeB, t, A ? RED : GREEN, down > 0 ? { lean: downLean(down, 1) } : {});
  bike.sig(0, t);

  // blind-spot zone beside the rear quarter (right lane)
  const zs = carS(t) - BACK_A;
  zone.position.set(LB, 0.03, -zs);
  const zA = A ? sm(g("s1", "blind") - 0.1, g("s1", "blind") + 0.25, t) * (t < Thit + 0.4 ? 1 : 1 - sm(Thit + 0.4, Thit + 0.8, t))
    : 0.35 + 0.65 * Math.max(0, 1 - Math.abs(t - g("s4", "stay") - 0.3) / 0.6);
  zone.set(t < S.s7[0] ? zA : 0);

  // mirror cone: straight back from the right mirror, the bike outside it
  const vc = A ? sm(g("s2", "checks") - 0.1, g("s2", "mirror"), t) * (1 - sm(Tc - 0.1, Tc + 0.2, t)) : 0;
  viewL.set(mir, v3(mir.x - 0.7, 0.6, mir.z + 15), vc);
  viewR.set(mir, v3(mir.x + 1.4, 0.6, mir.z + 15), vc);
  mMirror.color.set(VIOLET).multiplyScalar(1.2 + 2.0 * vc + (A ? 0 : 1.5 * sm(g("s5", "mirror") - 0.1, g("s5", "mirror") + 0.2, t)));

  // green sight line rider <-> mirror, from "face" to the end card
  const sa = A ? 0 : sm(g("s5", "face") - 0.15, g("s5", "face") + 0.2, t) * (1 - sm(S.s7[0], S.s7[0] + 0.3, t));
  const pulseEyes = A ? 0 : Math.max(0, 1 - Math.abs(t - g("s6", "see", 2)) / 0.4);
  if (st) sight.set(v3(st.x, 1.55, st.z), mir, sa * (0.8 + 0.4 * pulseEyes));
  if (car.driver) car.driver.material.emissive.set(A ? 0x4a3fb0 : new THREE.Color(0x4a3fb0).lerp(new THREE.Color(GREEN), 0.7 * sm(g("s6", "eyes") - 0.1, g("s6", "eyes") + 0.2, t) * (1 - sm(S.s7[0], S.s7[0] + 0.3, t))));

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
