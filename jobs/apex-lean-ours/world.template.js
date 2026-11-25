// Staggered formation reel. Kit = shared bike/road/camera code (kit.js).
import { THREE, S, LEAD, at, g, sm, flash, pulse, scene, bloom, glow, box, VIOLET, ORANGE, RED, GREEN, mFrame,
  textPlane, hud, label, patch, beam, makeBike, pathState, shoot, sceneOf, run } from "./kit.js";

scene.fog.density = 0.011;
const LW = 3.6, V = 11, R = 38;
const T3 = S.s3[0];                                   // formation part starts here (cut)
const Tb = g("s6", "corners") + 0.5;                  // leader enters the bend
const Sb = V * Tb;                                    // bend starts at this distance

// road centerline by distance s (straight down -z, then a left-hand bend); o = offset to the right
const C = (s) => {
  if (s <= Sb) return [0, -s, 0];
  const a = (s - Sb) / R;
  return [-R * (1 - Math.cos(a)), -Sb - R * Math.sin(a), a];
};
const P = (s, o) => { const [x, z, a] = C(s); return [x + o * Math.cos(a), z - o * Math.sin(a)]; };

// ---------- road: asphalt, edges, centre dashes, lamps along the path ----------
const mAs = new THREE.MeshStandardMaterial({ color: 0x0f0c2c, roughness: 0.9 });
function ribbon(o0, o1, s0, s1, mat, y = 0.004, step = 1) {
  const pos = [], idx = [];
  let n = 0;
  for (let s = s0; s <= s1; s += step, n++) { const A = P(s, o0), B = P(s, o1); pos.push(A[0], y, A[1], B[0], y, B[1]); if (n) { const k = 2 * n; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.material.side = THREE.DoubleSide; scene.add(m); return m;
}
const S0 = -80, S1 = Sb + R * 2.2;
ribbon(-LW - 0.5, LW + 0.5, S0, S1, mAs);
ribbon(-LW - 0.34, -LW - 0.26, S0, S1, mFrame, 0.02, 0.5);
ribbon(LW + 0.26, LW + 0.34, S0, S1, mFrame, 0.02, 0.5);
const mDash = glow(VIOLET, 1.1);
for (let s = S0; s < S1; s += 4) ribbon(-0.06, 0.06, s, s + 1.6, mDash, 0.012, 0.4);
for (let s = S0, i = 0; s < S1; s += 20, i++) {
  const sd = i % 2 ? -1 : 1, [x, z] = P(s, sd * (LW + 1.6)), [x2, z2] = P(s, sd * (LW + 1.2));
  scene.add(box(0.1, 4, 0.1, x, 2, z, mFrame, false), box(0.12, 0.08, 0.12, x2, 4, z2, glow(VIOLET, 2.0), false));
}

// ---------- riders ----------
const N = 4, bikes = Array.from({ length: N }, () => makeBike());
const OL = 0.8, OR = 2.8, OC = 1.6;
// part A (s1-s2): two pairs side by side; the left bike of the front pair swerves into the right one
const Tsw = g("s2", "moves") - 0.1, Tcr = g("s2", "crash") - 0.15;
const crashS = (T, base) => (T < Tcr ? V * T : V * Tcr + V * 0.55 * (1 - Math.exp(-(T - Tcr) / 0.55))) - base;
const brakeS = (T, base) => (T < Tcr + 0.1 ? V * T : V * (Tcr + 0.1) + V * 0.9 * (1 - Math.exp(-(T - Tcr - 0.1) / 0.9))) - base;
const pathA = [
  (T) => P(crashS(T, 0), OL + 1.05 * sm(Tsw, Tsw + 0.55, T)),
  (T) => P(crashS(T, 0), OR + 0.25 * sm(Tcr, Tcr + 0.4, T)),
  (T) => P(brakeS(T, 9), OL),
  (T) => P(brakeS(T, 9), OR),
];
// part B (s3-s7): staggered, riders 2-4 ride up from behind one by one; single file before the bend
const show = [null, g("s4", "next"), g("s4", "left"), g("s4", "right", 2)];
const sf = (T) => sm(S.s6[0] - 0.3, g("s6", "single") + 1.4, T);
const sB = (i, T) => V * T - (6 + 5 * sf(T)) * i - (i ? 22 * (1 - sm(show[i] - 0.5, show[i] + 0.7, T)) : 0);
const oB = (i, T) => { const o = i % 2 ? OR : OL; return o + (OC - o) * sf(T); };
const pathB = Array.from({ length: N }, (_, i) => (T) => P(sB(i, T), oB(i, T)));
const partA = (T) => T < T3;
const bikeP = (i) => (T) => (partA(T) ? pathA[i] : pathB[i])(T);
const st = (i, T) => pathState(bikeP(i), T);
const fall = (i, T) => (partA(T) && i < 2 ? (i ? 1 : -1) * 1.3 * sm(Tcr - 0.05, Tcr + 0.7, T) : 0);

// debris that makes the front-left rider move
const crate = box(0.7, 0.35, 0.7, 0, 0.18, 0, glow(ORANGE, 1.4));
const [dx, dz] = P(V * (Tsw + 0.3), OL); crate.position.set(dx, 0.18, dz); scene.add(crate);
const debrisZone = patch(1.4, 1.4, ORANGE, 1.2); debrisZone.position.set(dx, 0.03, dz);

// overlays
const tNever = textPlane([["NEVER SIDE BY SIDE", 104, 256]], 2, RED, 2.0);
const tRoom = textPlane([["NO ROOM TO SWERVE", 88, 256]], 2, RED, 2.0);
const tCrash = textPlane([["BOTH DOWN", 150, 256]], 2, RED, 2.0);
const tStag = textPlane([["STAGGERED", 170, 256]], 2, ORANGE, 2.0);
const tLeft = textPlane([["LEADER: LEFT", 150, 256]], 2, ORANGE, 2.0);
const tSwerve = textPlane([["SPACE TO SWERVE", 100, 256]], 2, GREEN, 1.2);
const tView = textPlane([["CLEAR VIEW AHEAD", 100, 256]], 2, GREEN, 1.2);
const tSingle = textPlane([["SINGLE FILE", 170, 256]], 2, ORANGE, 2.0);
const tEnd = textPlane([["STAGGER THE STRAIGHTS.", 76, 150], ["SINGLE FILE", 130, 290], ["IN THE BENDS.", 116, 410]], 2, ORANGE, 2.2);
const nums = ["1", "2", "3", "4"].map((n) => textPlane([[n, 300, 256]], 2, ORANGE, 2.0));
const squeeze = patch(1.0, 2.6, RED, 1.6);
const space = Array.from({ length: N }, () => patch(1.3, 3.4, GREEN, 0.6));
const sight = Array.from({ length: N }, () => beam(GREEN, 0.9, 0.03));
const thirds = [patch(1.8, 60, ORANGE, 0.5), patch(1.8, 60, ORANGE, 0.5)];
const vA = new THREE.Vector3(), vB = new THREE.Vector3();

// ---------- shots ----------
const lead = (T) => st(0, T), mid = (T) => pathState((u) => P(partA(u) ? V * u - 4 : sB(1, u) - 2, 1.8), T);
const SH = [
  // hook: low behind the two pairs, two abreast
  { at: 0, f: mid, noRot: 1, K: [[0, [3.2, 2.4, 13, -0.4, 0.8, -4, 50]], [2.2, [2.6, 2.9, 11.5, -0.4, 0.8, -4, 50]]] },
  // s2: ahead looking back at the front pair, the debris between them and us
  { at: S.s2[0], f: lead, noRot: 1, K: [[0, [3.4, 3.4, -9, -0.6, 0.6, 1, 52]], [1.5, [3.0, 3.6, -8, -0.6, 0.6, 1, 52]]] },
  // the crash: high and close
  { at: Tsw - 0.35, f: lead, noRot: 1, K: [[0, [6.5, 7, 2, 0.8, 0, -2.5, 56]], [2.5, [6.5, 8, 0, 0.8, 0, -1, 54]]] },
  // s3: top-down over the lane, the leader on the left third
  { at: T3, f: lead, noRot: 1, K: [[0, [5, 14, 7, 1.6, 0, -3, 50]], [3.0, [5.5, 16, 10, 1.6, 0, 0, 50]]] },
  // s4: higher, the formation fills in behind him
  { at: S.s4[0], f: lead, noRot: 1, K: [[0, [6, 18, 12, 1.6, 0, 6, 50]], [3.3, [6, 22, 18, 1.6, 0, 9, 50]]] },
  // s5: chase from behind the group, sight lines past the rider ahead
  { at: S.s5[0], f: mid, noRot: 1, K: [[0, [3.5, 6.5, 22, 0.3, 0.6, -8, 50]], [3.3, [3.0, 7.5, 24, 0.3, 0.6, -8, 50]]] },
  // s6-s7: high behind, turning with the group through the bend
  { at: S.s6[0], f: mid, K: [[0, [3, 11, 22, 0, 0, -10, 52]], [5.5, [2, 15, 26, 0, 0, -12, 52]]] },
];

run("staggered-world", (t) => {
  const { id, u } = sceneOf(t);
  const sts = bikes.map((b, i) => { const s = st(i, t); if (s) s.lean = Math.max(-1.4, Math.min(1.4, s.lean + fall(i, t))); if (partA(t) && i < 2) s.h += (i ? -0.7 : 0.5) * sm(Tcr, Tcr + 0.9, t); return s; });
  bikes.forEach((b, i) => {
    const vis = !partA(t) && i ? sm(show[i] - 0.5, show[i] - 0.3, t) > 0 : true;
    b.set(vis ? sts[i] : null, bikeP(i), t, { hex: id === "s6" || id === "s7" ? GREEN : id === "s1" || id === "s2" ? RED : VIOLET });
    b.sig(0, t);
  });
  const { punch } = shoot(SH, t);
  let spike = 0;

  crate.visible = id === "s1" || id === "s2"; debrisZone.set(id === "s2" ? sm(at("s2", "swerve") - 0.2, at("s2", "swerve"), u) * 0.8 : 0);

  // part A: side by side, no room, crash
  hud(tNever, 0, 0.62, 0.66, id === "s1" ? sm(at("s1", "never") - 0.1, at("s1", "never") + 0.15, u) : 0);
  const gap = (sts[0] && sts[1]) ? [(sts[0].x + sts[1].x) / 2, (sts[0].z + sts[1].z) / 2] : [0, 0];
  squeeze.position.set(gap[0], 0.03, gap[1]);
  squeeze.set(id === "s1" ? sm(at("s1", "side") - 0.1, at("s1", "side") + 0.2, u) : id === "s2" ? 1 - sm(at("s2", "moves"), at("s2", "moves") + 0.3, u) : 0);
  hud(tRoom, 0, 0.62, 0.66, id === "s2" ? pulse(u, at("s2", "room") - 0.1, at("s2", "crash") - 0.1) : 0);
  hud(tCrash, 0, 0.62, 0.62, id === "s2" ? sm(at("s2", "crash") - 0.1, at("s2", "crash") + 0.1, u) : 0);
  spike += id === "s2" ? flash(u, at("s2", "crash")) * 0.8 : 0;
  spike += id === "s1" ? flash(u, at("s1", "never")) * 0.4 : 0;

  // part B: lane thirds, leader left, numbers
  const L = sts[0];
  if (L) [OL, OR].forEach((o, k) => { const [x, z] = P(V * t + 20, o); thirds[k].position.set(x, 0.025, z); thirds[k].rotation.z = 0; });
  thirds[0].set(id === "s3" ? sm(at("s3", "left") - 0.1, at("s3", "left") + 0.2, u) : id === "s4" ? 0.6 : 0);
  thirds[1].set(id === "s4" ? sm(at("s4", "right") - 0.1, at("s4", "right") + 0.2, u) * 0.6 : 0);
  hud(tStag, 0, 0.62, 0.6, id === "s3" ? pulse(u, at("s3", "staggered") - 0.1, at("s3", "leader") - 0.1) : 0);
  hud(tLeft, 0, 0.62, 0.62, id === "s3" ? sm(at("s3", "leader") - 0.1, at("s3", "leader") + 0.15, u) : 0);
  nums.forEach((m, i) => {
    const s = sts[i], a = (id === "s3" && i === 0) ? sm(at("s3", "leader"), at("s3", "leader") + 0.2, u) : id === "s4" ? sm(show[i] ? show[i] - S.s4[0] - LEAD : 0, (show[i] ? show[i] - S.s4[0] - LEAD : 0) + 0.2, u) : 0;
    if (s) label(m, s.x, 3.4, s.z, 2.2, a); else label(m, 0, 0, 0, 1, 0);
  });

  // s5: everyone has an empty half-lane beside them and a view past the rider ahead
  sts.forEach((s, i) => {
    const sp = space[i];
    if (s) { const [x, z] = P(sB(i, t), i % 2 ? OL : OR); sp.position.set(x, 0.03, z); }
    sp.set(id === "s5" ? sm(at("s5", "space") - 0.1 + 0.08 * i, at("s5", "space") + 0.2 + 0.08 * i, u) * (1 - sm(at("s5", "clear") - 0.1, at("s5", "clear") + 0.2, u) * 0.5) : 0);
    const a = id === "s5" ? sm(at("s5", "view") - 0.15, at("s5", "view") + 0.2, u) : 0;
    if (s && a > 0) { bikes[i].visor.getWorldPosition(vA); const [x, z] = P(sB(0, t) + 26, i % 2 ? OR : OL); vB.set(x, 1.0, z); vA.lerp(vB, 0.3 / vA.distanceTo(vB)); }
    sight[i].set(vA, vB, a * 0.8);
  });
  hud(tSwerve, 0, 0.62, 0.66, id === "s5" ? pulse(u, at("s5", "space") - 0.1, at("s5", "clear") - 0.15) : 0);
  hud(tView, 0, 0.62, 0.66, id === "s5" ? sm(at("s5", "clear") - 0.1, at("s5", "clear") + 0.15, u) : 0);

  hud(tSingle, 0, 0.62, 0.6, id === "s6" ? sm(at("s6", "single") - 0.1, at("s6", "single") + 0.15, u) : 0);
  hud(tEnd, 0, 0.58, 0.86, id === "s7" ? sm(at("s7", "stagger") - 0.1, at("s7", "stagger") + 0.15, u) : 0);
  bloom.strength = 1.0 + 1.2 * punch * punch + spike;
});
