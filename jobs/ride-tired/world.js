// NEVER RIDE TIRED. Part A (s1-s3): a tired rider (head nodding) reacts late to the car braking ahead and stops too close;
// then one long blink (screen goes dark), the bike drifts off the road edge and goes down.
// Part B (s4-s5): the bike pulls into a green rest area, the rider gets off and stretches, drinks water, eats an apple.
// Part C (s6-s8): a rider drifting inside the lane signals, pulls over into a green rest area, and rests beside the bike.
import { THREE, S, g, sm, scene, camera, bloom, glow, VIOLET, RED, GREEN, patch, makeBike, makeCar, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays, buildRoad, SP, ride, downLean, makePerson, pose, ARM, dist } from "./extra.js";

scene.fog.density = 0.011;
const LANE = 1.8, REST = 5.0;
const T3 = S.s3[0], T4 = S.s4[0], T6 = S.s6[0];
const END = S.s8[0] + S.s8[1] + 1;
buildRoad(SP, -40, 700);
// park spots sit halfway between the right-side lamps (lamps every 20 m from s=-40, alternating sides)
const midLamp = (s) => s + ((((10 - ((s + 40) % 20)) % 20) + 20) % 20);

// ---------- part A1 (s1-s2): car ahead brakes on "late", the tired rider brakes only on "misses", stops too close ----------
const V = 10;
const Tlate = g("s2", "late"), Tmiss = g("s2", "misses"), Tcome = g("s2", "coming");
const vBikeA = (t) => (t < Tmiss ? V : V * Math.max(0, 1 - (t - Tmiss) / (Tcome + 0.25 - Tmiss)));
const vCar = (t) => (t < Tlate ? V : V * Math.max(0, 1 - (t - Tlate) / 0.7));
const DB = dist(vBikeA, 0, T3), DC = dist(vCar, 0, T3);
const TE = Tcome + 0.4;
const bikeA1 = (t) => 4 + DB(t);
const c0 = 4 + DB(TE) + 3.7 - DC(TE);
const carA = (t) => c0 + DC(t);
const fnA1 = (u) => SP(bikeA1(u), LANE);
const fnCar = (u) => SP(carA(u), LANE);
const close = patch(1.6, 1.4, RED, 1.4); close.position.set(LANE, 0.035, -(bikeA1(TE) + 2.0));

// ---------- part A3 (s3): long blink on "blink", drift right off the road, down on "off" ----------
const Tbl = g("s3", "blink"), Toff = g("s3", "off");
const v3 = (t) => (t < Toff ? V : V * Math.max(0, 1 - (t - Toff) / 1.0));
const D3 = dist(v3, T3, T4 + 0.5);
const bike3 = (t) => 140 + D3(t);
const x3 = (t) => LANE + (5.4 - LANE) * sm(Tbl, Toff + 0.1, t);
const fnA3 = (u) => SP(bike3(u), x3(u));

// ---------- part B (s4-s5): signal, pull into the rest area, stop by "get" ----------
const Tst = g("s4", "stop"), Tget = g("s4", "get"), Tstr = g("s4", "stretch");
const Tdr = g("s5", "drink"), Teat = g("s5", "eat");
const vB = (t) => (t < Tst ? 9 : 9 * Math.max(0, 1 - (t - Tst) / (Tget - Tst)));
const DBb = dist(vB, T4, T6);
const B0 = midLamp(260 + DBb(T6)) - DBb(T6), sB = B0 + DBb(T6);
const xB = (t) => LANE + (REST - LANE) * sm(T4 + 0.05, Tget - 0.25, t);
const fnB = (u) => SP(B0 + DBb(u), xB(u));
const restB = patch(2.6, 5.5, GREEN, 0.9); restB.position.set(REST + 0.4, 0.03, -sB);

// ---------- part C (s6-s8): drifting in the lane, then signal, pull over, rest ----------
const Tdft = g("s6", "drifting"), Tpull = g("s6", "pull"), Trest = g("s6", "rest");
const vC = (t) => (t < Tpull + 0.1 ? 9 : 9 * Math.max(0, 1 - (t - Tpull - 0.1) / (Trest + 0.5 - Tpull - 0.1)));
const DCc = dist(vC, T6, END);
const C0 = midLamp(480 + DCc(END)) - DCc(END), sC = C0 + DCc(END);
// round 2: amplitude 1.0 / period 1.2 s leaned the bike ~70 deg (looked like it was lying down); now ~25 deg
const drift = (t) => LANE + 0.45 * Math.sin((2 * Math.PI * (t - T6)) / 2.0) * sm(T6 + 0.1, Tdft + 0.2, t);
const xC = (t) => drift(t) + (REST - drift(t)) * sm(Tpull - 0.15, Trest + 0.25, t);
const fnC = (u) => SP(C0 + DCc(u), xC(u));
const restC = patch(2.6, 5.5, GREEN, 0.9); restC.position.set(REST + 0.4, 0.03, -sC);

// ---------- props ----------
const bike = makeBike();
const car = makeCar({ driver: true });
const P = makePerson();
const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.26, 14), glow(0x5ad8ff, 1.6));
bottle.position.set(0, -0.1, -0.07); P.armR.userData.hand.add(bottle);
const apple = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), glow(GREEN, 1.5));
apple.position.set(0, -0.1, -0.07); P.armL.userData.hand.add(apple);
// eyelid: a dark sheet in front of the lens for the long blink (not text)
const lid = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
lid.renderOrder = 18; lid.position.set(0, 0, -0.5); lid.scale.set(3, 3, 1); camera.add(lid);

// ---------- text ----------
title("NEVER RIDE TIRED");
cap("s2", "reacts", "REACTS LATE", RED);
cap("s2", "coming", "TOO CLOSE", RED, { boom: 0.5 });
cap("s3", "blink", "ONE LONG BLINK", RED);
cap("s3", "off", "OFF THE ROAD", RED, { boom: 0.8 });
cap("s4", "stop", ["STOP EVERY", "1-2 HOURS"], GREEN);
cap("s4", "get", "GET OFF", VIOLET);
cap("s4", "stretch", "STRETCH", GREEN);
cap("s5", "drink", "DRINK WATER", GREEN);
cap("s5", "eat", "EAT LIGHT", VIOLET);
cap("s6", "yawning", "YAWNING?", VIOLET);
cap("s6", "drifting", "DRIFTING?", VIOLET);
cap("s6", "pull", "PULL OVER", GREEN);
cap("s6", "rest", "REST", GREEN);
endCard([["FEEL TIRED? STOP.", 1], ["REST, THEN RIDE", 1]]);

// ---------- shots ----------
const at = (s, x) => ({ x, z: -s, h: 0 });
const fA1 = (t) => at(bikeA1(t), LANE), fA3 = (t) => at(bike3(t), LANE);
const fB = (t) => at(B0 + DBb(t), 3.4), fBp = () => at(sB, REST), fC = (t) => at(C0 + DCc(t), LANE), fC2 = (t) => at(C0 + DCc(t), 3.4), fCp = () => at(sC, REST);
const SH = [
  // hook: behind the tired rider at night, the car ahead
  { at: 0, f: fA1, noRot: 1, K: [[0, [1.6, 3.0, 7.5, 0, 0.9, -10, 50]], [S.s2[0], [1.4, 3.4, 7.0, 0, 0.9, -10, 50]]] },
  // s2: high left three-quarter, the car brakes, the gap shrinks
  // (round 1: from x -3.5 the bike sat half out of frame on the right)
  { at: S.s2[0], f: fA1, noRot: 1, K: [[0, [-2.0, 4.0, 6.0, 0.3, 0.6, -4, 50]], [1.2, [-2.2, 3.9, 5.4, 0.3, 0.6, -4, 50]]] },
  // late brake: high behind-right, bike stops right on the car's bumper
  { at: Tmiss, f: fA1, noRot: 1, K: [[0, [2.5, 5.5, 5.0, 0, 0.5, -4, 50]], [1.5, [2.2, 5.2, 4.4, 0, 0.5, -4, 50]]] },
  // s3: high behind, the road edge on the right
  { at: T3, f: fA3, noRot: 1, K: [[0, [0.5, 4.5, 8.5, 1.2, 0.4, -8, 52]], [1.4, [0.8, 5.0, 8.5, 1.6, 0.4, -8, 52]]] },
  // off the road: the bike down in the dirt
  { at: Toff - 0.05, f: fA3, noRot: 1, K: [[0, [0.0, 3.5, 6.5, 3.0, 0.4, -3, 50]], [1.5, [-0.5, 4.0, 7.5, 3.4, 0.3, -3, 50]]] },
  // s4: high behind, signal and pull into the green rest area
  { at: T4, f: fB, noRot: 1, K: [[0, [-1.0, 5.0, 9.0, 0, 0.4, -7, 50]], [1.4, [-0.5, 5.0, 8.0, 1.2, 0.4, -5, 50]]] },
  // get off and stretch: front view of the parked bike and the rider
  { at: Tget - 0.05, f: fBp, noRot: 1, K: [[0, [-2.2, 2.0, -4.8, 0.6, 1.1, 0, 46]], [1.6, [-1.8, 2.1, -4.3, 0.6, 1.15, 0, 46]]] },
  // s5: close on the rider, water then an apple
  { at: S.s5[0], f: fBp, noRot: 1, K: [[0, [0.4, 1.75, -3.0, 1.0, 1.45, 0.3, 42]], [1.8, [0.7, 1.8, -2.6, 1.0, 1.5, 0.3, 42]]] },
  // s6: behind, the bike wanders inside the lane
  { at: T6, f: fC, noRot: 1, K: [[0, [1.2, 4.5, 8.0, 0, 0.5, -8, 50]], [1.4, [1.0, 4.8, 8.0, 0.5, 0.5, -8, 50]]] },
  // pull over into the rest area
  { at: Tpull - 0.05, f: fC2, noRot: 1, K: [[0, [-1.5, 4.5, 8.5, 0.5, 0.4, -5, 50]], [1.5, [-1.0, 4.5, 7.0, 1.2, 0.4, -3, 50]]] },
  // s7-s8: calm, high behind-left over the parked bike and the resting rider
  { at: S.s7[0], f: fCp, noRot: 1, calm: 1, K: [[0, [-3.0, 4.5, 7.5, 0.5, 0.8, -1, 50]], [4, [-3.2, 6.5, 10, 0.5, 0.6, -2, 50]]] },
];

run("ride-tired", (t) => {
  const part = t < T3 ? 1 : t < T4 ? 3 : t < T6 ? 2 : 4;
  const fn = part === 1 ? fnA1 : part === 3 ? fnA3 : part === 2 ? fnB : fnC;
  const extra = {};
  // down in the dirt after "off" (falls to the right)
  if (part === 3 && t >= Toff) extra.lean = downLean(sm(Toff + 0.05, Toff + 0.45, t), -1);
  const parked = (part === 2 && t > Tget) || (part === 4 && t > Trest + 0.5);
  if (parked) extra.trail = false;
  ride(bike, fn, t, part === 1 || part === 3 ? RED : part === 4 && t < Tpull ? VIOLET : GREEN, extra);
  // turn signal while pulling over
  const sigOn = (part === 2 && t > Tst - 0.25 && t < Tget) || (part === 4 && t > Tpull - 0.2 && t < Trest + 0.6);
  bike.sig(sigOn ? 1 : 0, t);

  // tired head: slow nods in s1-s2, drops on the blink; tips back on "Yawning"
  let hx = 0;
  if (part === 1) hx = -0.28 * (0.5 + 0.5 * Math.sin(t * 3.5)) * sm(0.3, 0.8, t);
  if (part === 3) hx = -0.5 * sm(Tbl - 0.05, Tbl + 0.2, t);
  if (part === 4) hx = 0.35 * sm(T6, T6 + 0.2, t) * (1 - sm(T6 + 0.6, T6 + 0.9, t)) - 0.2 * sm(T6 + 0.9, Tdft, t) * (1 - sm(Tpull - 0.2, Tpull, t));
  bike.headG.rotation.x = hx;

  // car ahead (part A1 only); red patch in the too-small gap
  car.set(part === 1 ? { x: LANE, z: -carA(t), h: 0 } : null);
  close.set(part === 1 ? sm(Tcome - 0.1, Tcome + 0.15, t) : 0);

  // long blink: dark sheet in front of the lens
  lid.material.opacity = part === 3 ? 0.93 * sm(Tbl - 0.05, Tbl + 0.12, t) * (1 - sm(Tbl + 0.55, Tbl + 0.75, t)) : 0;

  // rest areas
  restB.set(part === 2 ? sm(Tst - 0.1, Tst + 0.3, t) : 0);
  restC.set(part === 4 ? sm(Tpull - 0.1, Tpull + 0.3, t) : 0);

  // the rider off the bike
  const offB = part === 2 && t > Tget + 0.05, offC = part === 4 && t > Trest + 0.55;
  bike.rider.visible = !(offB || offC);
  if (offB) {
    const k = sm(Tget + 0.05, Tget + 0.45, t), up = sm(Tstr - 0.1, Tstr + 0.3, t) * (1 - sm(S.s5[0] - 0.15, S.s5[0] + 0.1, t));
    const drinkA = sm(Tdr - 0.1, Tdr + 0.25, t) * (1 - sm(Teat - 0.05, Teat + 0.2, t) * 0.5);
    const eatA = sm(Teat - 0.1, Teat + 0.25, t);
    pose(P, { x: REST + 0.95 * k, z: -sB + 0.3, h: 0, armR: Math.max(ARM.up * up, 1.95 * drinkA), armL: Math.max(ARM.up * up, 1.4 * eatA), hex: GREEN });
    bottle.visible = t > S.s5[0] - 0.05; apple.visible = t > Teat - 0.1;
  } else if (offC) {
    pose(P, { x: REST + 0.95 * sm(Trest + 0.55, Trest + 0.95, t), z: -sC + 0.3, h: Math.PI * 0.85, hex: GREEN });
    bottle.visible = false; apple.visible = false;
  } else pose(P, { vis: false });

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
