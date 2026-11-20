// NEVER CHECK ONLY WITH YOUR EYES (Hidden Cam 07). Hotel room, same set as lights-off.
// s1 guest walks into a bright room. s2 night falls, close on a small black box on the wall over the left nightstand:
// its infrared LEDs glow faint red and a red cone floods the bed ("infrared"). s3 wide from behind the guest, the cone
// is gone, guest shrugs: "looks dark and empty". s4 lights off, phone up, screen violet ("camera").
// s5 a violet phone-camera cone sweeps window -> bed -> walls. s6 the cone reaches the box, close: the LEDs show as
// bright purple dots ("purple"), green ring + patch ("check"). s7-s8 calm wide in the dark.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], night: g("s2", "night"), light2: g("s2", "light"), ir2: g("s2", "infrared"), see: g("s2", "see"),
  s3: S.s3[0], dark: g("s3", "dark"), empty: g("s3", "empty"),
  s4: S.s4[0], off: g("s4", "lights"), phoneW: g("s4", "phone"), camera4: g("s4", "camera"),
  s5: S.s5[0], slowly: g("s5", "slowly"), around: g("s5", "around"), bed: g("s5", "bed"), walls: g("s5", "walls"),
  s6: S.s6[0], cameras6: g("s6", "cameras"), ir6: g("s6", "infrared"), purple: g("s6", "purple"), dots: g("s6", "dots"), check: g("s6", "check"),
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
// lamp on the right nightstand, ceiling light
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
{ const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade); }
const mCeil = glow(0xfff0d8, 0.9);
scene.add(box(0.9, 0.04, 0.9, 0, 3.2, -1.2, mCeil, false));
// window
const WX = 2.9, mGlass = glow(0x6a7cff, 0.9);
scene.add(box(1.3, 1.4, 0.02, WX, 1.65, -2.94, mGlass, false));
for (const s of [-1, 1]) scene.add(box(0.35, 1.75, 0.05, WX + s * 0.83, 1.62, -2.85, mat(0x5a4fd0, 0.3)));
door(-2.7, -2.9, 0);

// ---------- the night-vision camera: small black box on a wall shelf over the left nightstand ----------
const CX = -1.3, CY = 1.5;
scene.add(box(0.3, 0.025, 0.14, CX, CY - 0.075, -2.9, mat(0x4a40c0), false)); // shelf
const cam = new THREE.Group(); cam.position.set(CX, CY, -2.86); cam.rotation.y = 0.35; scene.add(cam); // turned toward the bed
cam.add(box(0.16, 0.12, 0.09, 0, 0, 0, mat(0x3a3670, 0.25))); // round 2: lighter, it read as a black hole in the dark
const LENS_L = V3(0, 0, 0.047);
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false })); lens.position.copy(LENS_L); cam.add(lens);
// six IR LEDs around the lens: dull red to the eye (s2), bright purple through the phone camera (s6)
const mLed = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x200a14), toneMapped: false });
// round 2: was additive x2.2 and read as big white blobs -> plain violet, smaller
const mLedGlow = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xb04dff).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, depthWrite: false });
const leds = [];
for (let i = 0; i < 6; i++) {
  const a = (i / 6) * Math.PI * 2, x = 0.036 * Math.cos(a), y = 0.036 * Math.sin(a);
  const d = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), mLed); d.position.set(x, y, 0.046); cam.add(d);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 10), mLedGlow); h.position.set(x, y, 0.05); cam.add(h); leds.push(h);
}
const LENS = V3(0, 0, 0);
function ringOf(hex, r) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.005, 8, 40), m); o.renderOrder = 21; return o;
}
const redRing = ringOf(RED, 0.075); redRing.position.set(0, 0, 0.06); cam.add(redRing);
const okRing = ringOf(GREEN, 0.075); okRing.position.set(0, 0, 0.06); cam.add(okRing);
const camPatch = patch(0.6, 0.45, GREEN, 1.2); camPatch.position.set(-1.3, 0.56, -2.45);
const missPatch = patch(0.8, 0.6, RED, 1.2);

// ---------- cones: red infrared flood (s2), violet phone-camera view (s5-s6) ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const irCone = cone(RED, 1.0), viewCone = cone(VIOLET, 1.1);
const BEDC = V3(0.1, 0.55, -1.5);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
// sweep path of the phone camera: window -> bed (at "bed") -> right wall -> the box (at "cameras")
const SW = [V3(2.7, 1.5, -2.9), V3(0.0, 0.6, -1.7), V3(1.0, 1.7, -2.9), V3(-0.2, 1.8, -2.9), V3(-1.3, 1.5, -2.82)];
const tgt = V3(0, 0, 0);
function sweep(u) { const n = SW.length - 1, f = Math.min(n - 1e-6, Math.max(0, u) * n), i = Math.floor(f); return tgt.copy(SW[i]).lerp(SW[i + 1], sm(0, 1, f - i)); }

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [-0.4, 2.9], SPOT = [-0.2, 0.4];
const tArr = S.s1[0] + 1.9, hFace = face(SPOT, [-1.3, -2.9]);
missPatch.position.set(SPOT[0], 0.03, SPOT[1]);
const hp = V3(0, 0, 0);

// ---------- text ----------
title("NEVER CHECK ONLY WITH YOUR EYES");
cap("s2", "infrared", "INFRARED LIGHT", RED);
cap("s2", "see", "INVISIBLE TO YOU", RED, { boom: 0.35 });
cap("s3", "dark", "LOOKS DARK", RED);
cap("s3", "empty", "AND EMPTY", RED, { boom: 0.35 });
cap("s4", "lights", "LIGHTS OFF", GREEN);
cap("s4", "camera", "PHONE CAMERA ON", VIOLET);
cap("s5", "slowly", "SWEEP SLOWLY", GREEN);
cap("s5", "bed", "BED + WALLS", GREEN);
cap("s6", "infrared", "SEES INFRARED", VIOLET);
cap("s6", "purple", "PURPLE DOTS", VIOLET, { boom: 0.45 });
cap("s6", "check", "CHECK THEM", GREEN);
endCard([["LIGHTS OFF", 1], ["THROUGH THE CAMERA", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
// round 2: was 0.8 m away at fov 36-38 and the box filled the frame -> 1.4 m, fov 44
const CLOSE = [-0.75, 1.68, -1.55, -1.3, 1.45, -2.86];
const SH = [
  // hook: bright room, guest walks in
  { at: 0, K: [[0, [0.6, 2.2, 4.4, -0.4, 1.1, -2.2, 50]], [2.5, [0.4, 2.1, 3.7, -0.5, 1.1, -2.2, 50]]] },
  // s2: close on the box, then wide on "light" so the red cone over the bed reads
  { at: T.s2, K: st([...CLOSE, 44], [CLOSE[0] + 0.03, CLOSE[1], CLOSE[2] - 0.1, ...CLOSE.slice(3), 42]) },
  { at: T.light2 - 0.05, K: st([1.4, 2.0, 1.2, -0.4, 0.9, -2.2, 50], [1.3, 1.95, 1.0, -0.4, 0.9, -2.2, 50]) },
  // s3: three-quarter from the right, guest and the dark room
  // round 2: was right behind the guest and the shrug arms filled the frame -> wider, from the right
  { at: T.s3, K: st([1.7, 2.0, 2.8, -0.4, 1.0, -2.0, 50], [1.6, 1.95, 2.6, -0.4, 1.0, -2.0, 50]) },
  // s4: wide, lights go out, phone comes up
  { at: T.s4, K: st([0.9, 2.0, 2.6, -0.2, 1.1, -1.8, 50], [0.8, 1.95, 2.3, -0.2, 1.1, -1.8, 50]) },
  // s5: behind the guest, the violet cone sweeps the room
  { at: T.s5, K: st([1.4, 2.0, 2.5, 0.0, 1.1, -2.6, 54], [1.3, 1.95, 2.2, -0.2, 1.1, -2.6, 54]) },
  // s6: close on the box: purple dots
  { at: T.cameras6 - 0.1, K: st([...CLOSE, 42], [CLOSE[0] + 0.03, CLOSE[1], CLOSE[2] - 0.12, ...CLOSE.slice(3), 38]) },
  // "check": medium, box in the middle, green patch below (round 2: box sat behind the caption)
  { at: T.check - 0.05, K: st([-0.2, 1.75, -0.4, -1.3, 1.25, -2.8, 46], [-0.25, 1.72, -0.55, -1.3, 1.25, -2.8, 46]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.2, 4.2, -0.3, 1.4, -2.0, 52]], [5, [0.3, 2.5, 5.0, -0.3, 1.4, -2.0, 52]]] },
];

run("ir-lights", (t) => {
  // light: bright, night dims it at "night", off at "lights" (s4), a soft room back at s8
  const dim = 0.45 * sm(T.night - 0.05, T.night + 0.4, t);
  const off = sm(T.off - 0.05, T.off + 0.3, t);
  const dark = Math.max(dim, off) * (1 - 0.5 * sm(T.s8, T.s8 + 0.6, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1.15 - 0.85 * dark);
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (1 - 0.95 * dark));
  mCeil.color.set(0xfff0d8).multiplyScalar(0.9 * (1 - 0.97 * dark));
  mGlass.color.set(0x6a7cff).multiplyScalar(0.9 * (1 - 0.7 * dark));

  // the box and its lens
  cam.updateMatrixWorld(true); lens.getWorldPosition(LENS);

  // s2: LEDs faint red, red infrared cone over the bed; gone at s3 "dark" (you can't see it)
  const ir = sm(T.light2 - 0.1, T.ir2, t) * (1 - sm(T.dark - 0.1, T.dark + 0.2, t));
  irCone.set(LENS, BEDC, 1.3, 0.07 * ir);
  mLed.color.set(0x200a14).lerp(new THREE.Color(RED), 0.5 * ir);
  redRing.material.opacity = sm(T.night, T.night + 0.2, t) * (1 - sm(T.light2 + 0.1, T.light2 + 0.4, t)) * (0.8 + 0.2 * Math.sin(t * 8));
  missPatch.set(sm(T.empty - 0.05, T.empty + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)));

  // guest: walks in, faces the box; shrugs on "empty"; phone up on "phone"; turns with the sweep in s5
  const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
  const on = sm(T.phoneW - 0.2, T.camera4, t) * (1 - sm(T.s7, T.s7 + 0.3, t));
  const u = sm(T.slowly, T.cameras6, t);
  const B = sweep(u);
  const hSweep = face(SPOT, [B.x, B.z]);
  const sw = sm(T.s5 - 0.2, T.slowly + 0.2, t);
  let h = w.h + (hFace - w.h) * k; h = h + (hSweep - h) * sw;
  const shrug = sm(T.empty - 0.2, T.empty + 0.1, t) * (1 - sm(T.s4, T.s4 + 0.3, t));
  P.set({ x: w.x, z: w.z, h, walk: w.walk, t, vis: true, phone: on, shrug, look: 0 });

  // s5-s6: violet phone-camera cone sweeps the room and lands on the box at "cameras"
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  // round 2: cone fades once it lands on the box (its base read as a dark disc in the close-ups)
  viewCone.set(hp, B, 0.35, 0.06 * on * sm(T.s5 - 0.2, T.slowly, t) * (1 - sm(T.cameras6 - 0.3, T.cameras6 - 0.1, t))); // round 3: gone before the cut to the close-up (dark disc in round 2)
  // s6: the LEDs show as bright purple dots through the phone camera at "purple"
  const pur = sm(T.ir6, T.purple, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.3, t));
  const pz = (0.7 + 0.3 * flash(t, T.dots)) * pur;
  mLedGlow.opacity = pz;
  for (const l of leds) l.scale.setScalar(Math.max(0.01, 0.8 + 0.3 * pz + 0.08 * Math.sin(t * 9)));
  okRing.material.opacity = sm(T.check - 0.05, T.check + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  camPatch.set(sm(T.check - 0.05, T.check + 0.25, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.2, t)));
  // round 2: screen dark until the phone is up (it glowed white from the first frame)
  ph.userData.screen.material.color.set(VIOLET).multiplyScalar(0.05 + on * (1.35 + 2 * flash(t, T.purple)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
