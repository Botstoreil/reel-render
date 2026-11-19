// NEVER CHECK WITH THE LIGHTS ON (Hidden Cam). Hotel room, same set as usb-charger.
// s1 guest walks into a bright room. s2 red: close on the charger, a tiny lens ringed red, then it blends in.
// s3 the guest looks right at it, red ring fades: missed. s4 lights off, curtains close. s5 phone flashlight
// sweeps slowly across the room from the window side. s6 the beam reaches the charger, the lens glints, green.
// s7-s8 calm wide in the dark.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  lightsOn: g("s1", "lights"), s2: S.s2[0], bright: g("s2", "bright"), lensW: g("s2", "lens"), blends: g("s2", "blends"),
  s3: S.s3[0], look: g("s3", "look"), one: g("s3", "one"), miss: g("s3", "miss"),
  s4: S.s4[0], off: g("s4", "lights"), curtains: g("s4", "curtains"),
  s5: S.s5[0], fl: g("s5", "flashlight"), slowly: g("s5", "slowly"),
  s6: S.s6[0], camera: g("s6", "camera"), sharp: g("s6", "sharp"), glint: g("s6", "glint"), check: g("s6", "check"), sparkles: g("s6", "sparkles"),
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

// alarm clock on the right nightstand
scene.add(box(0.34, 0.14, 0.12, 1.3, 0.62, -2.72, mat(0x15123f, 0.1)));
{
  const c = document.createElement("canvas"); c.width = 256; c.height = 100; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 100); x.fillStyle = "#fff"; x.font = "900 78px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("23:47", 128, 54);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.117), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false }));
  f.position.set(1.3, 0.62, -2.655); scene.add(f);
}
// lamps on both nightstands (bright room, go out at "lights off")
const mLamp = glow(0xffd8a0, 1.3);
// (round 1: a second lamp at x=-1.5 blew out the charger close-ups and covered the titles -> right lamp only)
for (const x of [1.42]) {
  scene.add(tube([x, 0.55, -2.82], [x, 0.95, -2.82], 0.025, mat(0x15123f)));
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(x, 1.02, -2.82); scene.add(shade);
}
// ceiling light
const mCeil = glow(0xfff0d8, 0.9);
scene.add(box(0.9, 0.04, 0.9, 0, 3.2, -1.2, mCeil, false));
// window with two curtains that close at "curtains"
const WX = 2.9, mGlass = glow(0x6a7cff, 0.9);
scene.add(box(1.3, 1.4, 0.02, WX, 1.65, -2.94, mGlass, false));
const CUR = [-1, 1].map((s) => { const c = box(0.7, 1.75, 0.05, WX + s * 0.95, 1.62, -2.85, mat(0x5a4fd0, 0.3)); scene.add(c); return [c, s]; });
door(-2.7, -2.9, 0);
scene.add(box(0.42, 0.62, 0.24, 1.35, 0.31, 1.0, mat(0x2a2470, 0.2)));

// ---------- the USB wall charger over the left nightstand, a lens in its front ----------
const PLATE = V3(-1.3, 0.86, -2.94);
scene.add(box(0.16, 0.2, 0.02, PLATE.x, PLATE.y, PLATE.z, mat(0xd8d4ff, 0.2), false));
const chg = new THREE.Group(); chg.position.set(-1.3, 0.86, -2.87); scene.add(chg);
chg.add(box(0.12, 0.14, 0.1, 0, 0, 0, mat(0xffffff, 0.32)));
chg.add(box(0.06, 0.016, 0.004, 0, -0.035, 0.051, glow(0x2a2660, 1), false));
const LENS_L = V3(0.0, 0.03, 0.052);
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 12), new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false })); lens.position.copy(LENS_L); chg.add(lens);
const LENS = V3(0, 0, 0);
const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.004, 8, 40), ringMat);
ring.position.copy(LENS_L).add(V3(0, 0, 0.004)); chg.add(ring);
// glint
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const gl = new THREE.Group(); scene.add(gl);
gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.16, 0.002), mGl));
const chgPatch = patch(0.6, 0.45, GREEN, 1.2); chgPatch.position.set(-1.3, 0.56, -2.6);
const missPatch = patch(0.6, 0.45, RED, 1.2); missPatch.position.set(-1.3, 0.56, -2.6);

// ---------- flashlight cone ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const beamCone = cone(WHITE, 0.9);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);
// sweep path: window -> clock -> bed -> charger (arrives at "sharp")
const SW = [V3(2.6, 1.5, -2.9), V3(1.3, 0.65, -2.7), V3(0.0, 0.9, -2.85), V3(-1.3, 0.89, -2.82)];
const tgt = V3(0, 0, 0);
function sweep(u) { const n = SW.length - 1, f = Math.min(n - 1e-6, Math.max(0, u) * n), i = Math.floor(f); return tgt.copy(SW[i]).lerp(SW[i + 1], f - i); }

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [-0.4, 2.9], SPOT = [-0.4, 0.4];
const tArr = S.s1[0] + 2.2, hFace = face(SPOT, [-1.3, -2.9]);
const hp = V3(0, 0, 0);

// ---------- text ----------
title("NEVER CHECK WITH THE LIGHTS ON");
cap("s2", "bright", "BRIGHT ROOM", RED);
cap("s2", "lens", "TINY LENS", RED, { boom: 0.35 });
cap("s2", "blends", "BLENDS IN", RED);
cap("s3", "look", "LOOKED RIGHT AT IT", RED);
cap("s3", "miss", "STILL MISSED", RED, { boom: 0.35 });
cap("s4", "lights", "LIGHTS OFF", GREEN);
cap("s4", "curtains", "CURTAINS CLOSED", GREEN);
cap("s5", "flashlight", "FLASHLIGHT ON", VIOLET);
cap("s5", "slowly", "SWEEP SLOWLY", GREEN);
cap("s6", "glint", "SHARP GLINT", GREEN, { boom: 0.45 });
cap("s6", "check", "CHECK IT", GREEN);
endCard([["LIGHTS OFF", 1], ["FLASHLIGHT ON", 1]]);

// ---------- shots ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: bright room, guest walks in
  { at: 0, K: [[0, [0.6, 2.2, 4.4, -0.4, 1.1, -2.2, 50]], [2.5, [0.4, 2.1, 3.7, -0.5, 1.1, -2.2, 50]]] },
  // s2 "bright room": wide on the lit room
  { at: T.s2, K: st([0.0, 1.9, 0.9, 0.0, 0.9, -2.7, 50], [0.0, 1.85, 0.6, 0.0, 0.9, -2.7, 50]) },
  // "tiny lens ... blends": close on the charger
  { at: T.lensW - 0.1, K: st([-1.08, 0.98, -2.1, -1.3, 0.95, -2.88, 36], [-1.1, 0.98, -2.2, -1.3, 0.95, -2.88, 34]) },
  // s3: over the guest, looking right at it
  // (round 1: right behind the head, the head filled the frame -> three-quarter from the right, guest and charger both in)
  { at: T.s3, K: st([1.0, 1.7, 1.0, -0.9, 0.85, -1.7, 46], [0.9, 1.68, 0.8, -0.9, 0.85, -1.7, 46]) },
  // s4: wide, lights go out, curtains close
  { at: T.s4, K: st([0.9, 2.1, 2.6, 1.0, 1.2, -2.6, 52], [0.8, 2.0, 2.3, 1.0, 1.2, -2.6, 52]) },
  // s5: behind the guest, the beam sweeps from the window
  { at: T.s5, K: st([0.6, 1.9, 2.2, 0.3, 1.0, -2.8, 52], [0.5, 1.85, 1.9, -0.4, 1.0, -2.8, 52]) },
  // "sharp glint": close on the charger
  { at: T.sharp - 0.25, K: st([-0.85, 1.05, -1.7, -1.3, 0.95, -2.88, 38], [-0.9, 1.04, -1.8, -1.3, 0.95, -2.88, 36]) },
  // "check anything that sparkles": medium, green patch
  { at: T.check - 0.05, K: st([-0.4, 1.4, -0.9, -1.2, 0.8, -2.8, 44], [-0.45, 1.38, -1.05, -1.2, 0.8, -2.8, 44]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.2, 4.2, -0.3, 1.4, -2.0, 52]], [5, [0.3, 2.5, 5.0, -0.3, 1.4, -2.0, 52]]] },
];

run("lights-off", (t) => {
  // lights: bright until "lights off" (s4), then dark; a soft room comes back at s8
  const dark = sm(T.off - 0.05, T.off + 0.3, t) * (1 - 0.5 * sm(T.s8, T.s8 + 0.6, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1.15 - 0.85 * dark);
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (1 - 0.95 * dark));
  mCeil.color.set(0xfff0d8).multiplyScalar(0.9 * (1 - 0.97 * dark));
  // curtains slide shut at "curtains", window light goes
  const cl = sm(T.curtains - 0.15, T.curtains + 0.45, t);
  for (const [c, s] of CUR) c.position.x = WX + s * (0.95 - 0.6 * cl);
  mGlass.color.set(0x6a7cff).multiplyScalar(0.9 * (1 - 0.85 * cl));

  // guest walks in and stays, facing the charger
  const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
  const ph1 = sm(T.s5 - 0.2, T.fl - 0.1, t) * (1 - sm(T.s7, T.s7 + 0.3, t));
  P.set({ x: w.x, z: w.z, h: w.h + (hFace - w.h) * k, walk: w.walk, t, vis: true, phone: ph1, look: 0 });
  chg.updateMatrixWorld(true); lens.getWorldPosition(LENS);

  // s2-s3: red ring on the lens, fades at "blends" (blends in), back at "one", gone at "miss"
  const r1 = sm(T.lensW - 0.05, T.lensW + 0.2, t) * (1 - sm(T.blends, T.blends + 0.5, t));
  const r2 = sm(T.one - 0.1, T.one + 0.1, t) * (1 - sm(T.miss, T.miss + 0.35, t));
  ringMat.opacity = Math.max(r1, r2) * (0.8 + 0.2 * Math.sin(t * 8));
  missPatch.set(sm(T.miss - 0.05, T.miss + 0.2, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.2, t)));

  // s5-s6: flashlight on, slow sweep that reaches the charger at "sharp"
  const on = sm(T.fl - 0.25, T.fl + 0.05, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.3, t));
  const u = sm(T.fl, T.sharp - 0.1, t);
  const B = sweep(u);
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  beamCone.set(hp, B, 0.22, 0.05 * on); // (round 1: 0.08 greyed out the close-ups)
  spot.intensity = 1.2 * on; spot.position.copy(hp); spot.target.position.copy(B); spot.target.updateMatrixWorld();
  const hit = sm(0.85, 1.0, u);
  const gA = on * hit * (0.6 + 0.4 * flash(t, T.glint));
  gl.visible = gA > 0.02; gl.position.copy(LENS).add(V3(0, 0, 0.02));
  gl.scale.setScalar(Math.max(0.01, gA * (1 + 0.15 * Math.sin(t * 17)))); gl.rotation.z = 0.3 * Math.sin(t * 1.3);
  chgPatch.set(sm(T.check - 0.05, T.check + 0.25, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.2, t)));
  ph.userData.screen.material.color.set(WHITE).multiplyScalar(1.4 + 2 * flash(t, T.glint));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
