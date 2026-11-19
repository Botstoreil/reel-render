// NEVER TRUST THE FIRST RAIN. Part A (s1-s3): rain, oil patches rise on the road, hard brake on the slick, the tyre slides out.
// Part B (s4-s7): slower, a bigger green gap to the car, gentle upright braking, the bike steers off a painted arrow and a metal cover.
import { THREE, S, g, sm, scene, bloom, glow, box, VIOLET, RED, GREEN, ORANGE, patch, makeBike, makeCar, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays, buildRoad, SP, ride, downLean } from "./extra.js";

scene.fog.density = 0.02;
const LANE = 1.8;
const T4 = S.s4[0];
const partA = (t) => t < T4;
buildRoad(SP, -40, 330);
const END = S.s8[0] + S.s8[1] + 1;

// ---------- part A: steady, then a hard brake on "brake", the front slides out on "slides" ----------
const V = 11, DEC = 6;
const Tbr = g("s3", "brake"), Tsl = g("s3", "slides");
const bikeA = (t) => { if (t < Tbr) return V * t + 4; const d = Math.min(t - Tbr, V / DEC); return V * Tbr + 4 + V * d - 0.5 * DEC * d * d; };
const bikeXA = (t) => LANE + 0.9 * sm(Tsl, Tsl + 0.8, t);
const slideS = bikeA(Tsl);

// ---------- part B: a calmer pace, gentle braking from "brake" in s5 ----------
const V2 = 7, Tb5 = g("s5", "brake"), B0 = 190;
const speedB = (t) => V2 - 3 * sm(Tb5, Tb5 + 1.3, t);
const DT = 0.01, TAB = [0];
for (let t = T4; t < END; t += DT) TAB.push(TAB[TAB.length - 1] + speedB(t) * DT);
const bikeB = (t) => { const i = Math.max(0, (t - T4) / DT), k = Math.floor(i); const a = TAB[Math.min(k, TAB.length - 1)], b = TAB[Math.min(k + 1, TAB.length - 1)]; return B0 + a + (b - a) * (i - k); };
const GAP = (t) => 8 + 9 * sm(g("s4", "bigger") - 0.2, g("s4", "gap") + 0.4, t);
const carB = (t) => bikeB(t) + GAP(t);
// s6 hazards in the bike's lane, it moves left of them
const S6 = S.s6[0], PAINT = bikeB(S6) + 6.5, COVER = bikeB(S6) + 11.5;
const bikeXB = (t) => LANE - 0.95 * sm(S6, g("s6", "painted") + 0.1, t);

const fnBikeA = (u) => SP(bikeA(u), bikeXA(u)), fnBikeB = (u) => SP(bikeB(u), bikeXB(u));
const P0 = (s, o = LANE) => ({ x: o, z: -s, h: 0 });

// ---------- props ----------
const bike = makeBike(), car = makeCar();
// oil patches: seeded along part A's road
let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const OIL = [];
for (let s = 10; s < 125; s += 5.5) { const p = patch(0.9 + rnd() * 0.9, 1.4 + rnd() * 1.6, ORANGE, 0.7); p.position.set(LANE + (rnd() - 0.5) * 2.4, 0.03, -(s + rnd() * 2)); p.rotation.z = rnd() * 1.2; OIL.push(p); }
const skid = patch(1.2, 4.2, RED, 1.4); skid.position.set(LANE + 0.4, 0.035, -(slideS + 1.2));
// green gap between bike and car (part B)
const gapP = patch(2.2, 1, GREEN, 0.9);
function gapPatch(p, sFront, sBack, x, a) { const len = Math.max(0.05, sFront - sBack); p.scale.set(1, len, 1); p.position.set(x, 0.03, -(sFront + sBack) / 2); p.set(a); }
// painted arrow (long bar + head) and a round metal cover
const mPaint = glow(0xffffff, 0.9), mCover = glow(VIOLET, 1.0);
scene.add(box(0.35, 0.02, 3.2, LANE, 0.02, -PAINT, mPaint, false), box(1.0, 0.02, 0.35, LANE, 0.02, -(PAINT + 1.7), mPaint, false));
const cover = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 28), mCover); cover.position.set(LANE, 0.02, -COVER); scene.add(cover);
// rain around the camera's subject
const NR = 480, rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 0.7, 0.022), glow(VIOLET, 1.0), NR);
rain.frustumCulled = false; scene.add(rain);
const RD = Array.from({ length: NR }, () => [rnd() * 26 - 13, rnd() * 60 - 45, rnd() * 9, 14 + rnd() * 6]);
const mtx = new THREE.Matrix4(), tilt = new THREE.Matrix4().makeRotationX(0.15);

// ---------- text ----------
title("NEVER TRUST THE FIRST RAIN");
cap("s2", "oil", "OIL + DUST", RED);
cap("s2", "slick", "SLICK ROAD", RED, { boom: 0.3 });
cap("s3", "brake", "HARD BRAKE", RED);
cap("s3", "slides", "SLIDES OUT", RED, { boom: 0.8 });
cap("s4", "slow", "SLOW DOWN", GREEN);
cap("s4", "bigger", "BIGGER GAP", GREEN);
cap("s5", "early", "BRAKE EARLY", GREEN);
cap("s5", "upright", "BIKE UPRIGHT", VIOLET);
cap("s6", "painted", "AVOID PAINT", RED);
cap("s6", "metal", "AND METAL", RED);
cap("s6", "slippery", "MOST SLIPPERY", VIOLET);
endCard([["FIRST RAIN", 1], ["SLOW + SMOOTH", 1]]);

// ---------- shots ----------
const fBikeA = (t) => P0(bikeA(t)), fSlide = () => P0(slideS), fBikeB = (t) => P0(bikeB(t));
const SH = [
  // hook: low behind the bike in the rain
  { at: 0, f: fBikeA, noRot: 1, K: [[0, [2.4, 2.2, 6.2, 0, 0.9, -7, 50]], [S.s2[0], [1.8, 2.6, 5.2, 0, 0.9, -7, 50]]] },
  // s2: high behind, the orange patches spread on the road ahead
  { at: S.s2[0], f: fBikeA, noRot: 1, K: [[0, [3.0, 6.5, 7.5, 0.5, 0, -9, 50]], [3.0, [2.6, 7.2, 7.0, 0.5, 0, -10, 50]]] },
  // s3: high and close at the slide spot
  { at: Tbr - 0.3, f: fSlide, noRot: 1, K: [[0, [5.0, 4.5, 7.0, 0, 0.5, 0, 52]], [3.0, [5.5, 5.5, 4.0, 0.4, 0.3, 0, 52]]] },
  // s4: high chase, the whole green gap to the car
  { at: T4, f: fBikeB, noRot: 1, K: [[0, [2.6, 8.0, 15, 0, 0, -7, 50]], [2.0, [2.4, 8.6, 16, 0, 0, -8, 50]]] },
  // s5: low side, the bike stays upright while it slows
  { at: S.s5[0], f: fBikeB, noRot: 1, K: [[0, [5.0, 2.4, 3.0, 0, 0.8, -2, 48]], [2.2, [5.0, 2.6, 1.5, 0, 0.8, -2.5, 48]]] },
  // s6: high behind, the arrow and the cover ahead, the bike passes left of them
  { at: S6, f: fBikeB, noRot: 1, K: [[0, [3.2, 6.5, 8.0, 0.4, 0, -8, 50]], [3.2, [3.0, 7.0, 7.5, 0.4, 0, -8, 50]]] },
  // s7-s8: calm, high behind
  { at: S.s7[0], f: fBikeB, noRot: 1, calm: 1, K: [[0, [2.0, 6.5, 13, 0, 0.5, -10, 50]], [5, [2.0, 9, 16, 0, 0, -12, 50]]] },
];

run("first-rain", (t) => {
  const A = partA(t);
  // car only in part B, ahead in the same lane
  car.g.visible = !A;
  if (!A) car.set({ x: LANE, z: -carB(t), h: 0 });
  const down = A && t >= Tsl ? sm(Tsl, Tsl + 0.5, t) : 0;
  const st = ride(bike, A ? fnBikeA : fnBikeB, t, A ? RED : GREEN, down > 0 ? { lean: downLean(down, 1) } : {});
  bike.sig(0, t);

  // oil rises on "oil", strongest around "slick"
  const oa = A ? sm(g("s2", "oil") - 0.15, g("s2", "oil") + 0.4, t) * (0.7 + 0.3 * Math.max(0, 1 - Math.abs(t - g("s2", "slick")) / 0.6)) : 0;
  OIL.forEach((p) => p.set(oa));
  skid.set(A && t >= Tsl ? sm(Tsl, Tsl + 0.3, t) : 0);

  // part B: the green gap, the hazards flash red on their words
  gapPatch(gapP, carB(t) - 2.15, bikeB(t) + 0.85, LANE, !A && t < S6 ? sm(g("s4", "bigger") - 0.1, g("s4", "bigger") + 0.3, t) : 0);
  const pf = !A ? Math.max(0, 1 - Math.abs(t - g("s6", "painted") - 0.2) / 0.7) + 0.6 * Math.max(0, 1 - Math.abs(t - g("s6", "slippery") - 0.2) / 0.7) : 0;
  const cf = !A ? Math.max(0, 1 - Math.abs(t - g("s6", "metal") - 0.2) / 0.7) + 0.6 * Math.max(0, 1 - Math.abs(t - g("s6", "slippery") - 0.2) / 0.7) : 0;
  mPaint.color.set(0xffffff).lerp(new THREE.Color(RED), Math.min(1, pf)).multiplyScalar(0.9 + 1.6 * Math.min(1, pf));
  mCover.color.set(VIOLET).lerp(new THREE.Color(RED), Math.min(1, cf)).multiplyScalar(1.0 + 1.8 * Math.min(1, cf));

  // rain the whole time, around the bike
  if (st) {
    const bz = st.z;
    RD.forEach(([x, z, y0, v], i) => { const y = 9 - ((y0 + v * t) % 9); mtx.makeTranslation(x, y, bz + z); mtx.multiply(tilt); rain.setMatrixAt(i, mtx); });
    rain.instanceMatrix.needsUpdate = true;
  }

  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
