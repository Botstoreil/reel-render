// apex x WelcomeBikers: a mountain pass, a rider leaning through switchbacks, the lean measured live,
// every corner marked, the whole road coloured by lean, other riders on the same pass, end card + code.
import { THREE, S, g, at, sm, flash, scene, bloom, glow, box, VIOLET, ORANGE, RED, GREEN, WHITE,
  beam, patch, makeBike, pathState, shoot, sceneOf, run, local, mFrame } from "./kit.js";
import { track, buildRoad, title, cap, endCard, overlays } from "./extra.js";

// ---------- the pass ----------
const SEG = [
  { len: 30 }, { len: 52, R: 32 }, { len: 10 }, { len: 56, R: -30 }, { len: 8 }, { len: 60, R: 34 }, { len: 10 },
  { len: 55, R: -29 }, { len: 10 }, { len: 52, R: 36 }, { len: 10 }, { len: 58, R: -31 }, { len: 14 }, { len: 52, R: 30 }, { len: 40 },
];
const T = track(SEG);
const V = 15.5, S0 = 6;                       // speed m/s, start distance
const bikeFn = (u) => T.P(S0 + V * u, 1.6);  // rides the right lane
buildRoad(T.P, -40, T.len, { LW: 3.6, lamps: false });

// guard-rail posts along both edges
for (let s = 0; s < T.len; s += 6) for (const sd of [-1, 1]) {
  const [x, z] = T.P(s, sd * 5.2); scene.add(box(0.08, 0.7, 0.08, x, 0.35, z, mFrame, false));
}

// centreline samples (terrain + the top-down shot)
const CL = []; for (let s = -40; s <= T.len; s += 2) CL.push(T.P(s, 0));
let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9;
for (const [x, z] of CL) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); }
const MX = (minX + maxX) / 2, MZ = (minZ + maxZ) / 2;

// ---------- mountains: low-poly, flattened along the road, pale tops ----------
{
  const SZ = 760, N = 150, geo = new THREE.PlaneGeometry(SZ, SZ, N, N); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, col = [], c = new THREE.Color(), lo = new THREE.Color(0x15113f), hi = new THREE.Color(0xb9b0ff);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + MX, z = p.getZ(i) + MZ;
    let d = 1e9; for (const [cx, cz] of CL) { const q = (x - cx) ** 2 + (z - cz) ** 2; if (q < d) d = q; } d = Math.sqrt(d);
    const n = 0.55 * Math.sin(x * 0.021 + 1.3) * Math.cos(z * 0.017 - 0.4) + 0.3 * Math.sin(x * 0.047 - z * 0.031 + 2.1) + 0.15 * Math.sin(x * 0.11 + z * 0.09);
    const h = Math.max(0, (34 + 30 * n) * sm(12, 70, d) + 0.25 * Math.max(0, d - 70));
    p.setXYZ(i, x, h - 0.4, z);
    c.copy(lo).lerp(hi, sm(30, 70, h) * 0.85); col.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, emissive: 0x0b0828 })));
  scene.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(0.55), transparent: true, opacity: 0.18, toneMapped: false })));
}

// ---------- the rider ----------
const bike = makeBike();
const st = (u) => pathState(bikeFn, u);
const phone = box(0.15, 0.035, 0.26, 0.17, 1.04, 0.2, glow(GREEN, 2.6), false); bike.lean.add(phone);

// lean gauge in the world: vertical reference, the bike's axis, an arc between them
const vRef = beam(WHITE, 1.4, 0.035), vAxis = beam(GREEN, 2.4, 0.06);
const ARC = Array.from({ length: 14 }, () => beam(GREEN, 2.0, 0.05));
const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3(), vD = new THREE.Vector3();
function gauge(s, a, hex, wob = 0) {
  if (!s || a < 0.01) { vRef.set(vA, vA, 0); vAxis.set(vA, vA, 0); ARC.forEach((b) => b.set(vA, vA, 0)); return; }
  const l = s.lean + wob, L = 2.3, r = 1.25, base = local(s.x, s.z, s.h, 0, 0.05, 0);
  vA.set(base[0], 0.05, base[2]);
  const up = local(s.x, s.z, s.h, 0, L, 0), ax = local(s.x, s.z, s.h, -Math.sin(l) * L, Math.cos(l) * L, 0);
  vRef.set(vA, vB.set(up[0], up[1], up[2]), a * 0.9);
  vAxis.material.color.set(hex).multiplyScalar(2.6); vAxis.set(vA, vC.set(ax[0], ax[1], ax[2]), a);
  ARC.forEach((b, k) => {
    const f0 = k / ARC.length, f1 = (k + 1) / ARC.length;
    const p0 = local(s.x, s.z, s.h, -Math.sin(l * f0) * r, Math.cos(l * f0) * r, 0), p1 = local(s.x, s.z, s.h, -Math.sin(l * f1) * r, Math.cos(l * f1) * r, 0);
    b.material.color.set(hex).multiplyScalar(2.0); b.set(vC.set(p0[0], p0[1], p0[2]), vD.set(p1[0], p1[1], p1[2]), a * 0.9);
  });
}

// ---------- corners: a patch at every apex, lit as the rider passes ----------
const CORNERS = [];
{ let s = 0; for (const sg of SEG) { if (sg.R) CORNERS.push({ s: s + sg.len / 2, left: sg.R > 0 }); s += sg.len; } }
CORNERS.forEach((c) => {
  const [x, z] = T.P(c.s, 1.6), h = T.C(c.s)[2];
  c.m = patch(3.0, 6, c.left ? GREEN : VIOLET, 1.6); c.m.position.set(x, 0.03, z); c.m.rotation.z = h;
  c.t = (c.s - S0) / V;
});

// ---------- the whole road coloured by lean (s5) ----------
const leanAt = (s) => { let q = 0; for (const sg of SEG) { if (s >= q && s < q + sg.len) return sg.R ? Math.atan((V * V) / (9.8 * Math.abs(sg.R))) : 0; q += sg.len; } return 0; };
const ROUTE = (() => {
  const pos = [], colr = [], idx = [], c = new THREE.Color(), cold = new THREE.Color(0x4f7cff), warm = new THREE.Color(0xffc23a), hot = new THREE.Color(ORANGE);
  let n = 0;
  for (let s = 0; s <= T.len; s += 1, n++) {
    let l = 0; for (let k = -6; k <= 6; k++) l += leanAt(s + k); l /= 13;   // ease the colour into and out of each bend
    const d = THREE.MathUtils.radToDeg(l);
    c.copy(cold).lerp(warm, sm(5, 28, d)).lerp(hot, sm(28, 40, d)).multiplyScalar(2.2);
    const A = T.P(s, -3.4), B = T.P(s, 3.4); pos.push(A[0], 0.06, A[1], B[0], 0.06, B[1]); colr.push(c.r, c.g, c.b, c.r, c.g, c.b);
    if (n) { const k = 2 * n; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
  }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.Float32BufferAttribute(colr, 3)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false, transparent: true, depthWrite: false, depthTest: false, fog: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.frustumCulled = false; m.visible = false; scene.add(m); m.userData.n = idx.length; return m;
})();

// ---------- other riders on the same pass (s6-s8) ----------
const GH = [{ o: -1.6, lag: -14, v: 0.94, hex: RED }, { o: 1.6, lag: 10, v: 0.97, hex: VIOLET }, { o: -1.6, lag: 24, v: 0.9, hex: VIOLET }];
const ghosts = GH.map((q) => ({ ...q, b: makeBike(), fn: (u) => T.P(S0 + V * S.s6[0] + q.lag + V * q.v * (u - S.s6[0]), q.o) }));

// ---------- words on screen ----------
title("HOW FAR DO YOU LEAN?");
cap("s2", "guess", "GUESSING?", RED, { until: ["s2", "was"] });
cap("s2", "was", "SMOOTH OR SCARY?", RED);
cap("s3", "phone", "PHONE IN POCKET", GREEN, { until: ["s3", "apex"] });
cap("s3", "apex", "LIVE LEAN", GREEN);
cap("s4", "every", "EVERY CORNER", VIOLET, { until: ["s4", "left"] });
cap("s4", "left", "LEFT AND RIGHT", GREEN, { until: ["s4", "measured"] });
const MAX4 = (() => { let m = 0; for (let u = S.s4[0]; u < S.s4[0] + S.s4[1]; u += 0.05) { const s = st(u); if (s) m = Math.max(m, Math.abs(s.lean)); } return Math.round(THREE.MathUtils.radToDeg(m)); })();
cap("s4", "measured", `${MAX4}° LEAN`, GREEN);
cap("s5", "coloured", "COLOURED BY LEAN", VIOLET);
cap("s6", "race", "RACE THE PASS", GREEN);
endCard([["KNOW YOUR LEAN", 1], ["RIDE IT BETTER", 1]]);

// ---------- shots ----------
const B = (t) => st(t);
const topCam = (k) => {
  const H = Math.max((maxZ - minZ) / (2 * Math.tan(THREE.MathUtils.degToRad(25))), (maxX - minX) / (2 * Math.tan(THREE.MathUtils.degToRad(25)) * 0.5625)) * 1.08;
  return [MX, H * k, MZ + H * 0.18 * k, MX, 0, MZ - 4, 50];
};
const lerpA = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);
const SH = [
  // s1: low front three-quarter, the rider coming at us into the first bend
  { at: 0, f: B, K: [[0, [3.2, 1.3, -7.5, 0, 0.9, 0, 42]], [2.9, [2.4, 1.6, -6.2, 0, 0.9, 0, 44]]] },
  // s2: straight behind, leaned over, the gauge guessing in red
  { at: S.s2[0], f: B, K: [[0, [0, 1.5, 5.6, 0, 1.0, -2, 44]], [2.7, [0.4, 1.8, 6.4, 0, 1.0, -2, 44]]] },
  // s3: close on the hip pocket, then the gauge goes green
  { at: S.s3[0], f: B, K: [[0, [3.4, 2.6, 2.8, 0.1, 0.9, -0.4, 40]], [1.7, [3.0, 2.9, 3.6, 0.1, 0.9, -0.6, 42]]] },
  { at: g("s3", "apex") - 0.15, f: B, K: [[0, [0, 1.5, 5.4, 0, 1.0, -2, 44]], [1.5, [0, 1.7, 6.2, 0, 1.0, -2, 46]]] },
  // s4: higher chase, corners lighting up
  { at: S.s4[0], f: B, K: [[0, [0, 6.5, 13, 0, 0, -14, 50]], [2.5, [0, 8.5, 16, 0, 0, -16, 50]]] },
  // s5: rise to the whole pass from above
  { at: S.s5[0], cam: (t, su) => {
    const s = st(t), ch = local(s.x, s.z, s.h, 0, 8.5, 16), lk = local(s.x, s.z, s.h, 0, 0, -16);
    return lerpA([ch[0], ch[1], ch[2], lk[0], lk[1], lk[2], 50], topCam(1 + 0.04 * su), sm(0, 1.3, su));
  } },
  // s6: wide chase with the other riders around
  { at: S.s6[0], f: B, K: [[0, [5, 4.5, 12, 0, 0.6, -10, 52]], [1.9, [3.5, 5, 13, 0, 0.6, -10, 52]]] },
  // s7-s8: calm, high behind, rolling up the pass
  { at: S.s7[0], f: B, calm: 1, K: [[0, [0, 10, 20, 0, 0, -22, 52]], [6, [0, 13, 24, 0, 0, -26, 52]]] },
];

run("apex-lean-world", (t) => {
  const { id, u } = sceneOf(t);
  const s = st(t);
  bike.set(s, bikeFn, t, { hex: id === "s2" ? RED : id === "s1" ? VIOLET : GREEN });
  bike.sig(0, t);
  const { punch } = shoot(SH, t);
  scene.fog.density = id === "s5" ? 0.0018 : id === "s7" || id === "s8" ? 0.007 : 0.011;

  phone.visible = t >= g("s3", "phone") - 0.1;
  phone.material.color.set(GREEN).multiplyScalar(2.2 + 2.5 * (id === "s3" ? flash(u, at("s3", "phone")) : 0));

  // gauge: red and wobbling while guessing, green and true once apex reads it
  const wob = 0.22 * Math.sin(t * 9.1) + 0.12 * Math.sin(t * 15.7);
  if (id === "s2") gauge(s, sm(at("s2", "guess") - 0.1, at("s2", "guess") + 0.2, u), RED, wob);
  else if (id === "s3") gauge(s, sm(at("s3", "apex") - 0.1, at("s3", "apex") + 0.2, u), GREEN);
  else gauge(s, 0, GREEN);

  // corners light up as they are ridden (s4), stay faint behind the other riders
  CORNERS.forEach((c) => c.m.set(id === "s4" ? sm(c.t - 0.3, c.t + 0.1, t) : id === "s6" ? 0.35 * sm(c.t - 0.3, c.t + 0.1, t) : 0));

  // the route fills in from the start of the pass to the end
  const rv = id === "s5" ? sm(at("s5", "whole") - 0.1, at("s5", "leaned") + 0.3, u) : 0;
  ROUTE.visible = rv > 0.001; ROUTE.geometry.setDrawRange(0, Math.floor((ROUTE.userData.n * rv) / 6) * 6);

  ghosts.forEach((q) => { const on = id === "s6" || id === "s7" || id === "s8"; q.b.set(on ? pathState(q.fn, t) : null, q.fn, t, { hex: q.hex }); q.b.sig(0, t); });

  const spike = overlays(t) + (id === "s3" ? flash(u, at("s3", "apex")) * 0.35 : 0);
  bloom.strength = id === "s5" ? 0.55 : Math.min(0.8 + 0.6 * punch * punch + spike, 2.2);
});
