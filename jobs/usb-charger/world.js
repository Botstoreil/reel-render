// NEVER IGNORE THE SPARE CHARGER (Hidden Cam). Hotel room, based on the smoke-detector set.
// s1 guest walks in, a spare USB wall charger plugged in over the left nightstand. s2 red: hidden cameras come built into
// chargers, clocks, plugs. s3 red sight cone from the charger onto the bed. s4 close: tiny hole / dark dot on the front.
// s5 lights off, flashlight on, the lens glints. s6 the charger is unplugged and turned to face the wall. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  charger: g("s1", "charger"), s2: S.s2[0], hidden: g("s2", "hidden"), chargers: g("s2", "chargers"), clocks: g("s2", "clocks"), plugs: g("s2", "plugs"), normal: g("s2", "normal"),
  s3: S.s3[0], points: g("s3", "points"), bed: g("s3", "bed"),
  s4: S.s4[0], hole: g("s4", "hole"), dot: g("s4", "dot"),
  s5: S.s5[0], lights: g("s5", "lights"), fl: g("s5", "flashlight"), lens: g("s5", "lens"), glint: g("s5", "glint"),
  s6: S.s6[0], unplug: g("s6", "unplug"), turn: g("s6", "turn"), wall: g("s6", "wall"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- the room: bed against the back wall, two nightstands, window, door ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.9, 0.3, 2.1, 0, 0.2, -1.9, mat(0x4a40c0)));
bed.add(box(1.8, 0.22, 2.0, 0, 0.46, -1.88, mat(0xe8e4ff, 0.12)));
bed.add(box(1.84, 0.06, 1.25, 0, 0.6, -1.42, mat(0x6a5cff, 0.22)));
bed.add(box(1.9, 1.0, 0.08, 0, 0.75, -2.9, mat(0x2e2890)));
for (const x of [-0.45, 0.45]) bed.add(box(0.7, 0.14, 0.4, x, 0.64, -2.6, mat(0xffffff, 0.15)));
solid(bed);
const NS = [-1.3, 1.3].map((x) => { const n = box(0.5, 0.55, 0.45, x, 0.275, -2.7, mat(0x4a40c0)); scene.add(n); return n; });
solid(...NS);

// alarm clock on the right nightstand (one of the "look normal" objects in s2)
const CLK = V3(1.3, 0.62, -2.66);
scene.add(box(0.34, 0.14, 0.12, 1.3, 0.62, -2.72, mat(0x15123f, 0.1)));
{
  const c = document.createElement("canvas"); c.width = 256; c.height = 100; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 100); x.fillStyle = "#fff"; x.font = "900 78px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("23:47", 128, 54);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.117), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false }));
  f.position.set(1.3, 0.62, -2.655); scene.add(f);
}
const clkRing = patch(0.5, 0.3, RED, 1.2); clkRing.position.set(1.3, 0.56, -2.6);
// lamp on the right nightstand (goes out at "lights off")
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade);
// window (right side of the back wall)
const WX = 2.9, mGlass = glow(0x6a7cff, 0.9);
scene.add(box(1.3, 1.4, 0.02, WX, 1.65, -2.94, mGlass, false));
for (const s of [-1, 1]) scene.add(box(0.7, 1.75, 0.05, WX + s * 0.95, 1.62, -2.85, mat(0x5a4fd0, 0.3)));
door(-2.7, -2.9, 0);
scene.add(box(0.42, 0.62, 0.24, 1.35, 0.31, 1.0, mat(0x2a2470, 0.2)));

// ---------- the spare USB wall charger over the left nightstand, a lens in its front ----------
const PLATE = V3(-1.3, 0.86, -2.94);
scene.add(box(0.16, 0.2, 0.02, PLATE.x, PLATE.y, PLATE.z, mat(0xd8d4ff, 0.2), false));       // wall socket plate
for (const dx of [-0.03, 0.03]) scene.add(box(0.012, 0.03, 0.004, PLATE.x + dx, PLATE.y, PLATE.z + 0.012, glow(0x15123f, 1), false));
const CHG0 = V3(-1.3, 0.86, -2.87), CHG1 = V3(-1.3, 0.615, -2.62);   // plugged in -> on the nightstand
const chg = new THREE.Group(); chg.position.copy(CHG0); scene.add(chg);
chg.add(box(0.12, 0.14, 0.1, 0, 0, 0, mat(0xffffff, 0.32)));
chg.add(box(0.06, 0.016, 0.004, 0, -0.035, 0.051, glow(0x2a2660, 1), false));              // USB slot
const LENS_L = V3(0.0, 0.03, 0.052);
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 12), lensMat); lens.position.copy(LENS_L); chg.add(lens);
const LENS = V3(0, 0, 0);
// ring that marks the dot in s4
const dotRing = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0 }));
dotRing.position.copy(LENS_L).add(V3(0, 0, 0.004)); chg.add(dotRing);
// glint on the lens
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const gl = new THREE.Group(); scene.add(gl);
gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.16, 0.002), mGl));
const chgPatch = patch(0.6, 0.45, GREEN, 1.2); chgPatch.position.set(-1.3, 0.56, -2.6);

// ---------- light cones: red camera view (s2-s3), white phone flashlight (s5) ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const camCone = cone(RED, 1.0), BEDC = V3(0, 0.6, -1.5);
const bedPatch = patch(1.6, 1.7, RED, 1.2); bedPatch.position.set(0, 0.65, -1.75);
const beamCone = cone(WHITE, 0.9);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [-0.4, 2.9], SPOT = [-0.4, 0.4];
const tArr = S.s1[0] + 2.2, hFace = face(SPOT, [-1.3, -2.9]);
const hp = V3(0, 0, 0);

// ---------- text ----------
title("NEVER IGNORE THE SPARE CHARGER");
cap("s2", "hidden", "HIDDEN CAMERAS", RED, { boom: 0.4 });
cap("s2", "chargers", "CHARGERS", RED);
cap("s2", "clocks", "CLOCKS", RED);
cap("s2", "plugs", "PLUGS", RED);
cap("s2", "normal", "LOOK NORMAL", RED);
cap("s3", "points", "POINTS AT THE BED?", RED, { boom: 0.35 });
cap("s4", "hole", "TINY HOLE", GREEN);
cap("s4", "dot", "DARK DOT", GREEN, { boom: 0.3 });
cap("s5", "lights", "LIGHTS OFF", GREEN);
cap("s5", "flashlight", "FLASHLIGHT ON", VIOLET);
cap("s5", "glint", "LENS GLINT", GREEN, { boom: 0.45 });
cap("s6", "still", "NOT SURE?", VIOLET);
cap("s6", "unplug", "UNPLUG IT", GREEN, { boom: 0.3 });
cap("s6", "face", "FACE THE WALL", GREEN);
endCard([["POINTS AT THE BED?", 1], ["CHECK IT FIRST", 1]]);

// ---------- shots ----------
const st = (a, b = a) => [[0, a], [3, b]];
const CLOSE = [-1.05, 0.93, -2.05, -1.3, 0.85, -2.88, 30];
const SH = [
  // hook: the room, guest walks in, charger over the left nightstand
  { at: 0, K: [[0, [0.6, 2.2, 4.4, -0.4, 1.1, -2.2, 50]], [2.5, [0.4, 2.1, 3.7, -0.5, 1.1, -2.2, 50]]] },
  // "charger": close on it
  { at: T.charger - 0.1, K: st([-0.85, 1.05, -1.6, -1.3, 0.85, -2.88, 38], [-0.95, 1.0, -1.85, -1.3, 0.85, -2.88, 36]) },
  // "hidden cameras ... chargers": the charger, red lens
  { at: T.hidden - 0.05, K: st(CLOSE, [-1.08, 0.92, -2.15, -1.3, 0.85, -2.88, 30]) },
  // "clocks": the clock on the other nightstand
  { at: T.clocks - 0.1, K: st([1.05, 0.95, -1.9, 1.3, 0.64, -2.7, 36], [1.1, 0.93, -2.0, 1.3, 0.64, -2.7, 34]) },
  // "plugs ... look normal": wide over the bed, both nightstands
  { at: T.plugs - 0.1, K: st([0.0, 1.9, 0.9, 0.0, 0.8, -2.7, 50], [0.0, 1.85, 0.6, 0.0, 0.8, -2.7, 50]) },
  // s3: high three-quarter, red sight cone from the charger onto the bed
  { at: T.s3, K: st([2.6, 2.4, 1.4, -0.5, 0.8, -1.9, 50], [2.4, 2.4, 1.1, -0.5, 0.8, -1.9, 50]) },
  // s4: close on the front, tiny dark dot
  // (round 1: too tight, the charger sat under the TINY HOLE title -> wider lens, look point raised so it sits lower)
  { at: T.s4, K: st([-1.08, 0.98, -2.1, -1.3, 0.95, -2.88, 36], [-1.1, 0.98, -2.2, -1.3, 0.95, -2.88, 34]) },
  // s5: behind the guest, lights off, the flashlight finds the charger
  { at: T.s5, K: st([0.6, 1.9, 2.2, -1.1, 0.9, -2.8, 48], [0.5, 1.85, 1.8, -1.1, 0.9, -2.8, 48]) },
  // "lens glint": close
  // (round 1: this shot BLOWN white -> farther, wider, and the glint/spot are toned down below)
  { at: T.lens - 0.15, K: st([-0.85, 1.05, -1.7, -1.3, 0.95, -2.88, 38], [-0.9, 1.04, -1.8, -1.3, 0.95, -2.88, 36]) },
  // s6: the charger comes out of the wall and turns to face it
  { at: T.unplug - 0.1, K: st([-0.55, 1.15, -1.4, -1.3, 0.72, -2.75, 40], [-0.6, 1.12, -1.55, -1.3, 0.7, -2.75, 40]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.2, 4.2, -0.3, 1.4, -2.0, 52]], [5, [0.3, 2.5, 5.0, -0.3, 1.4, -2.0, 52]]] },
];

run("usb-charger", (t) => {
  // lights: off at "lights off" (s5), back to a soft room at s7
  const dark = sm(T.lights - 0.05, T.lights + 0.3, t) * (1 - 0.6 * sm(T.s7, T.s7 + 0.6, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - 0.72 * dark);
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (1 - 0.95 * dark));
  mGlass.color.set(0x6a7cff).multiplyScalar(0.9 * (1 - 0.7 * dark));

  // guest walks in and stays, facing the charger
  const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
  const ph1 = sm(T.s5 + 0.1, T.fl - 0.15, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.5, t));
  P.set({ x: w.x, z: w.z, h: w.h + (hFace - w.h) * k, walk: w.walk, t, vis: true, phone: ph1, look: 0 });

  // the charger: unplugged at "unplug", set on the nightstand, turned to face the wall at "turn"
  const up = sm(T.unplug - 0.05, T.unplug + 0.45, t);
  chg.position.copy(CHG0).lerp(CHG1, up);
  chg.position.z += 0.12 * Math.sin(Math.PI * up);
  chg.rotation.y = Math.PI * sm(T.turn, T.wall + 0.1, t);
  chgPatch.set(sm(T.wall, T.wall + 0.3, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.2, t)));
  chg.updateMatrixWorld(true); lens.getWorldPosition(LENS);

  // s2-s3: red lens, "looks normal" objects, the charger sees the bed
  const red = sm(T.hidden - 0.05, T.hidden + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  lensMat.color.set(RED).multiplyScalar(2.2 * red * (0.75 + 0.25 * Math.sin(t * 9)));
  clkRing.set(sm(T.clocks - 0.05, T.clocks + 0.2, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t)));
  const cv = sm(T.points - 0.1, T.points + 0.25, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t));
  camCone.set(LENS, BEDC, 0.95, 0.22 * cv);
  bedPatch.set(cv);

  // s4: ring around the dark dot
  dotRing.material.opacity = sm(T.dot - 0.1, T.dot + 0.15, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.2, t)) * (0.8 + 0.2 * Math.sin(t * 8));

  // s5: flashlight on the charger
  const on = sm(T.fl - 0.25, T.fl + 0.05, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.5, t));
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  beamCone.set(hp, LENS, 0.2, 0.07 * on);
  spot.intensity = 1.2 * on; spot.position.copy(hp); spot.target.position.copy(LENS); spot.target.updateMatrixWorld();
  const gA = on * (0.6 + 0.4 * flash(t, T.glint)) * (1 - up);
  gl.visible = gA > 0.02; gl.position.copy(LENS).add(V3(0, 0, 0.02));
  gl.scale.setScalar(Math.max(0.01, gA * (1 + 0.15 * Math.sin(t * 17)))); gl.rotation.z = 0.3 * Math.sin(t * 1.3);
  const shot = flash(t, T.glint);
  ph.userData.screen.material.color.set(WHITE).multiplyScalar(1.4 + 2 * shot);

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
