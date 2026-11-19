// NEVER TAILGATE: the three-second gap. Part A (s1-s3): bike on the car's bumper, car brakes, slow-motion rear-end.
// Part B (s4-s7): pick a sign, car passes it, count 1-2-3, bike reaches it after three; rain doubles the gap.
import { THREE, S, g, sm, scene, bloom, glow, box, VIOLET, RED, GREEN, mFrame, patch, makeBike, makeCar, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays, buildRoad, SP, ride, downLean } from "./extra.js";

scene.fog.density = 0.011;
const LANE = 1.8;                         // right lane centre
const T4 = S.s4[0];                       // part B starts here (cut)
const partA = (t) => t < T4;
buildRoad(SP, -40, 470);

// ---------- part A physics (slow motion between the brake and the hit) ----------
const V = 12, A_CAR = 8, REACT = 0.6, A_BIKE = 7, PHYS = 1.1;
const Tb = g("s2", "brakes"), Tcr = g("s3", "hit");
const k = PHYS / (Tcr - Tb);
const tau = (t) => (t < Tb ? t : t < Tcr ? Tb + k * (t - Tb) : Tb + PHYS + (t - Tcr));
const brakeS = (T0, a) => (u) => { if (u <= T0) return V * u; const d = u - T0, ts = V / a; return V * T0 + (d < ts ? V * d - 0.5 * a * d * d : (V * V) / (2 * a)); };
const carPhys = brakeS(Tb, A_CAR), bikePhys = brakeS(Tb + REACT, A_BIKE);
const TAUcr = Tb + PHYS;
const D0 = bikePhys(TAUcr) - carPhys(TAUcr) + 3.0;           // bike front touches car rear exactly at the hit
const carA = (t) => (t < Tcr ? carPhys(tau(t)) : carPhys(TAUcr) + 1.2 * sm(Tcr, Tcr + 0.8, t));
const bikeA = (t) => (t < Tcr ? bikePhys(tau(t)) - D0 : bikePhys(TAUcr) - D0 + 0.5 * sm(Tcr, Tcr + 0.6, t));
const crashS = carPhys(TAUcr) - 2.15;

// ---------- part B: steady speed, car passes the sign, bike passes it after "three" ----------
const V2 = 8, SIGN = 310;
const Tp = g("s4", "passes"), Tq = g("s5", "three") + 0.25;
const GAP0 = V2 * (Tq - Tp);
const carB = (t) => SIGN + V2 * (t - Tp) + GAP0 * sm(g("s6", "rain"), S.s7[0] + 1.2, t);   // rain: the gap doubles
const bikeB = (t) => SIGN + V2 * (t - Tq);

const fnCarA = (u) => SP(carA(u), LANE), fnBikeA = (u) => SP(bikeA(u), LANE);
const fnCarB = (u) => SP(carB(u), LANE), fnBikeB = (u) => SP(bikeB(u), LANE);
const P0 = (s, o = LANE) => ({ x: o, z: -s, h: 0 });

// ---------- props ----------
const bike = makeBike(), car = makeCar();
const mBrake = glow(RED, 1);
car.g.add(box(0.46, 0.16, 0.06, -0.62, 0.74, 2.2, mBrake, false), box(0.46, 0.16, 0.06, 0.62, 0.74, 2.2, mBrake, false));
// the sign: post + glowing panel at the right roadside
const SX = 5.0, mSign = glow(GREEN, 1.2);
scene.add(box(0.14, 3.0, 0.14, SX, 1.5, -SIGN, mFrame, false), box(1.4, 0.9, 0.1, SX, 3.3, -SIGN, mSign));
const signLine = patch(7.4, 0.5, GREEN, 1.4); signLine.position.set(0, 0.03, -SIGN);
// gap patches: red (too close) and green (three seconds); length set by scale.y
const redGap = patch(2.2, 1, RED, 1.4), greenGap = patch(2.2, 1, GREEN, 0.9);
function gapPatch(p, sFront, sBack, a) { const len = Math.max(0.05, sFront - sBack); p.scale.set(1, len, 1); p.position.set(LANE, 0.03, -(sFront + sBack) / 2); p.set(a); }
// rain: seeded streaks around the bike
const NR = 420, rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.7, 0.025), glow(VIOLET, 1.0), NR);
rain.frustumCulled = false; scene.add(rain);
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const RD = Array.from({ length: NR }, () => [rnd() * 26 - 13, rnd() * 60 - 45, rnd() * 9, 14 + rnd() * 6]);
const mtx = new THREE.Matrix4();

// ---------- text ----------
title("NEVER TAILGATE");
cap("s2", "brakes", "CAR BRAKES", RED, { boom: 0.3 });
cap("s2", "close", "TOO CLOSE", RED);
cap("s3", "hit", "CRASH", RED, { boom: 0.8 });
cap("s4", "sign", "PICK A SIGN", GREEN);
cap("s4", "start", "START COUNTING", VIOLET);
cap("s5", "thousand", "1", GREEN, { n: 1 });
cap("s5", "two", "2", GREEN);
cap("s5", "three", "3 SECONDS", GREEN);
cap("s5", "back", "BACK OFF", VIOLET);
cap("s6", "rain", "RAIN OR NIGHT", VIOLET);
cap("s6", "double", "DOUBLE THE GAP", GREEN);
endCard([["THREE SECONDS", 1], ["MORE IN RAIN", 1]]);

// ---------- shots ----------
const fBikeA = (t) => P0(bikeA(t)), fMidA = (t) => P0((bikeA(t) + carA(t)) / 2), fCrash = () => P0(crashS);
const fSign = () => P0(SIGN, SX), fBikeB = (t) => P0(bikeB(t));
const SH = [
  // hook: low behind the bike, the car's bumper right in front of it
  { at: 0, f: fBikeA, noRot: 1, K: [[0, [2.6, 2.0, 6.5, 0, 0.9, -7, 50]], [2.2, [1.8, 2.5, 5.4, 0, 0.9, -7, 50]]] },
  // s2: side view, brake lights and the shrinking gap
  { at: S.s2[0], f: fMidA, noRot: 1, K: [[0, [8, 3.0, 1.5, 0, 0.7, -0.5, 46]], [3.4, [6.8, 3.4, -0.5, 0, 0.7, -0.5, 46]]] },
  // the hit, high and close
  { at: Tcr - 0.35, f: fCrash, noRot: 1, K: [[0, [4.5, 4.0, 5.0, 0, 0.6, 0, 52]], [3.0, [5.5, 5.5, 2.5, 0, 0.4, 0, 52]]] },
  // s4: at the sign, looking back at the car coming
  { at: T4, f: fSign, noRot: 1, K: [[0, [1.8, 3.2, -9, -3.5, 1.2, 8, 52]], [2.5, [1.4, 3.0, -8, -3.5, 1.2, 8, 52]]] },
  // car passes the sign: high chase behind the bike, the whole gap in view
  { at: Tp - 0.25, f: fBikeB, noRot: 1, K: [[0, [3.0, 7.0, 9, 0, 0, -22, 50]], [4.2, [2.4, 9.0, 11, 0, 0, -24, 48]]] },
  // after "three": side-high at the sign as the bike crosses it
  { at: g("s5", "three") - 0.15, f: fSign, noRot: 1, K: [[0, [6, 5.5, 5, -3.2, 0.6, -2, 50]], [1.5, [6.5, 6, 3.5, -3.2, 0.6, -3, 50]]] },
  // "back off": chase again
  { at: g("s5", "back") - 0.1, f: fBikeB, noRot: 1, K: [[0, [2.4, 4.5, 8, 0, 1, -22, 50]], [1.2, [2.2, 5, 8.5, 0, 1, -22, 50]]] },
  // s6: rain, low chase, the car pulls away
  { at: S.s6[0], f: fBikeB, noRot: 1, K: [[0, [2.2, 3.2, 7.5, 0, 1.2, -20, 52]], [3.5, [2.0, 5.0, 10, 0, 1, -26, 50]]] },
  // s7-s8: calm, high behind
  { at: S.s7[0], f: fBikeB, noRot: 1, calm: 1, K: [[0, [2.0, 5.0, 10, 0, 1, -26, 50]], [5, [2.0, 9, 14, 0, 0, -30, 50]]] },
];

run("three-second-gap", (t) => {
  const A = partA(t);
  // vehicles
  const cs = A ? carA(t) : carB(t), bs = A ? bikeA(t) : bikeB(t);
  const cst = { x: LANE, z: -cs, h: 0 };
  car.set(cst);
  const braking = A && t >= Tb ? 1 : 0;
  mBrake.color.set(RED).multiplyScalar(1 + 3 * braking);
  ride(bike, A ? fnBikeA : fnBikeB, t, A ? RED : GREEN, A && t >= Tcr ? { lean: downLean(sm(Tcr, Tcr + 0.6, t), 1) } : {});
  bike.sig(0, t);

  // part A: the red gap between bumper and wheel
  const gapA = (carA(t) - 2.15) - (bikeA(t) + 0.85);
  gapPatch(redGap, carA(t) - 2.15, bikeA(t) + 0.85, A && t < Tcr && gapA > 0.1 ? sm(0.9, 1.4, t) : 0);

  // part B: sign, the line across the road when the car passes, the green gap after "three"
  const sp = A ? 0 : sm(g("s4", "sign") - 0.15, g("s4", "sign") + 0.2, t);
  mSign.color.set(GREEN).multiplyScalar(1.2 + 1.6 * sp);
  const crossA = Math.max(Math.exp(-Math.abs(t - Tp) / 0.25) * (t > Tp - 0.3 ? 1 : 0), Math.exp(-Math.abs(t - Tq) / 0.25) * (t > Tq - 0.3 ? 1 : 0));
  signLine.set(A ? 0 : 0.25 + 0.75 * crossA);
  gapPatch(greenGap, carB(t) - 2.15, bikeB(t) + 0.85, !A && t < S.s8[0] ? sm(g("s5", "three") - 0.1, g("s5", "three") + 0.3, t) : 0);

  // rain in s6-s7
  const ra = A ? 0 : sm(g("s6", "rain") - 0.15, g("s6", "rain") + 0.3, t);
  rain.visible = ra > 0.01;
  if (rain.visible) {
    const bz = -bikeB(t);
    RD.forEach(([x, z, y0, v], i) => { const y = 9 - ((y0 + v * t) % 9); mtx.makeTranslation(x, y, bz + z); mtx.multiply(new THREE.Matrix4().makeRotationX(0.15)); rain.setMatrixAt(i, mtx); });
    rain.instanceMatrix.needsUpdate = true;
  }
  scene.fog.density = 0.011 + 0.012 * ra;

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
