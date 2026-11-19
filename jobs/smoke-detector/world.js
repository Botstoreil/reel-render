// NEVER TRUST THE SMOKE DETECTOR (Hidden Cam). Hotel room.
// s1 guest walks in, the detector on the wall over the bed. s2 red sight cone from the detector onto the bed: a hidden camera.
// s3 lights off, curtains close. s4 phone flashlight sweeps the detector, the clock, the charger.
// s5 the lens throws back a sharp glint. s6 don't touch, take a photo, walk out the door. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  smoke: g("s1", "smoke"), s2: S.s2[0], aimed: g("s2", "aimed"), hide: g("s2", "hide"),
  s3: S.s3[0], turn: g("s3", "turn"), close: g("s3", "close"),
  s4: S.s4[0], fl: g("s4", "flashlight"), det: g("s4", "detector"), clk: g("s4", "clock"), chg: g("s4", "chargers"),
  s5: S.s5[0], glint: g("s5", "glint"), look: g("s5", "look"),
  s6: S.s6[0], photo: g("s6", "photo"), leave: g("s6", "leave"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- the room: bed against the back wall, two nightstands, window with curtains, door ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.9, 0.3, 2.1, 0, 0.2, -1.9, mat(0x4a40c0)));            // frame
bed.add(box(1.8, 0.22, 2.0, 0, 0.46, -1.88, mat(0xe8e4ff, 0.12)));    // mattress (top 0.57)
bed.add(box(1.84, 0.06, 1.25, 0, 0.6, -1.42, mat(0x6a5cff, 0.22)));   // blanket
bed.add(box(1.9, 1.0, 0.08, 0, 0.75, -2.9, mat(0x2e2890)));           // headboard
for (const x of [-0.45, 0.45]) bed.add(box(0.7, 0.14, 0.4, x, 0.64, -2.6, mat(0xffffff, 0.15)));
solid(bed);
const NS = [-1.3, 1.3].map((x) => { const n = box(0.5, 0.55, 0.45, x, 0.275, -2.7, mat(0x4a40c0)); scene.add(n); return n; });
solid(...NS);

// alarm clock on the right nightstand
const CLK = V3(1.3, 0.62, -2.66);
scene.add(box(0.34, 0.14, 0.12, 1.3, 0.62, -2.72, mat(0x15123f, 0.1)));
{
  const c = document.createElement("canvas"); c.width = 256; c.height = 100; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 100); x.fillStyle = "#fff"; x.font = "900 78px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("23:47", 128, 54);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.117), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false }));
  f.position.set(1.3, 0.62, -2.655); scene.add(f);
}
// lamp on the right nightstand (goes out at "turn off the lights")
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade);
// wall charger above the left nightstand, cable down to a phone-sized pad
const CHG = V3(-1.3, 0.82, -2.88);
scene.add(box(0.14, 0.14, 0.02, -1.3, 0.82, -2.94, mat(0xd8d4ff, 0.2), false));
scene.add(box(0.08, 0.1, 0.06, -1.3, 0.82, -2.9, mat(0xffffff, 0.3)));
scene.add(tube([-1.3, 0.77, -2.88], [-1.25, 0.56, -2.8], 0.012, mat(0xffffff, 0.3)));
// window + curtains (right side of the back wall)
const WX = 2.9, mGlass = glow(0x6a7cff, 0.9);
scene.add(box(1.3, 1.4, 0.02, WX, 1.65, -2.94, mGlass, false));
scene.add(box(1.4, 0.06, 0.04, WX, 2.38, -2.92, mat(0x8a80ff, 0.4), false), box(1.4, 0.06, 0.04, WX, 0.92, -2.92, mat(0x8a80ff, 0.4), false));
const curt = [-1, 1].map((s) => { const c = box(0.7, 1.75, 0.05, WX + s * 0.95, 1.62, -2.85, mat(0x5a4fd0, 0.3)); scene.add(c); return c; });
// door (left), with a frame that glows green when the guest walks out
door(-2.7, -2.9, 0);
const mDoor = glow(GREEN, 0);
scene.add(box(1.16, 0.06, 0.03, -2.7, 2.14, -2.88, mDoor, false), box(0.06, 2.14, 0.03, -3.28, 1.07, -2.88, mDoor, false), box(0.06, 2.14, 0.03, -2.12, 1.07, -2.88, mDoor, false));
// suitcase next to the guest's spot
scene.add(box(0.42, 0.62, 0.24, 1.35, 0.31, 1.0, mat(0x2a2470, 0.2)));

// ---------- the smoke detector on the wall over the bed, a camera lens inside ----------
const DET = V3(0, 2.5, -2.92);
const det = new THREE.Group(); det.position.copy(DET); scene.add(det);
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 40), mat(0xf0eeff, 0.35)); body.rotation.x = Math.PI / 2; det.add(body);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 8, 40), glow(VIOLET, 1.6)); ring.position.z = 0.036; det.add(ring);
for (let i = -2; i <= 2; i++) det.add(box(0.14, 0.012, 0.004, -0.04, i * 0.035, 0.037, glow(0x2a2660, 1), false));
const LENS_L = V3(0.09, -0.07, 0.04), LENS = DET.clone().add(LENS_L);
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), lensMat); lens.position.copy(LENS_L); det.add(lens);
// glint: hot white core + 4-point star on the lens
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(3.2), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const gl = new THREE.Group(); gl.position.copy(LENS).add(V3(0, 0, 0.03)); scene.add(gl);
gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.46, 0.002), mGl));

// ---------- light cones: red camera view (s2), white phone flashlight (s4-s6) ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0); // apex at origin, opens to -y
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const camCone = cone(RED, 1.0), BEDC = V3(0, 0.6, -1.7);
const bedPatch = patch(1.6, 1.7, RED, 1.2); bedPatch.position.set(0, 0.65, -1.75);
const beamCone = cone(WHITE, 0.9);
const spotDisk = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
spotDisk.renderOrder = 7; scene.add(spotDisk);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [-1.4, 2.8], SPOT = [0.7, 0.7], DOORP = [-2.7, -2.2];
const tArr = S.s1[0] + 2.3, hFace = face(SPOT, [0, -2.9]), tOut = T.leave + 1.35;
const hp = V3(0, 0, 0);

// flashlight target: wall -> detector -> clock -> charger -> back to the detector
const WALL0 = V3(-0.9, 1.7, -2.93);
const TK = [[T.fl - 0.1, WALL0], [T.det, LENS], [T.clk, CLK], [T.chg, CHG], [T.s5 + 0.35, LENS]];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("NEVER TRUST THE SMOKE DETECTOR");
cap("s2", "aimed", "AIMED AT BED", RED);
cap("s2", "hide", "HIDDEN CAMERA", RED, { boom: 0.4 });
cap("s3", "turn", "LIGHTS OFF", GREEN);
cap("s3", "close", "CLOSE CURTAINS", GREEN);
cap("s4", "sweep", "FLASHLIGHT ON", VIOLET);
cap("s4", "detector", "DETECTOR", GREEN);
cap("s4", "clock", "CLOCK", GREEN);
cap("s4", "chargers", "CHARGERS", GREEN);
cap("s5", "lens", "CAMERA LENS", VIOLET);
cap("s5", "glint", "SHARP GLINT", GREEN, { boom: 0.45 });
cap("s5", "look", "LOOK FOR IT", GREEN);
cap("s6", "found", "FOUND ONE?", VIOLET);
cap("s6", "don't", "DON'T TOUCH", VIOLET);
cap("s6", "photo", "TAKE A PHOTO", GREEN, { boom: 0.3 });
cap("s6", "leave", "LEAVE THE ROOM", GREEN);
cap("s6", "report", "REPORT IT", GREEN);
endCard([["LIGHTS OFF", 1], ["FIND THE GLINT", 1]]);

// ---------- shots ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: the room, guest walks in, detector over the bed
  { at: 0, K: [[0, [0.6, 2.3, 4.6, 0, 1.35, -2.0, 50]], [2.5, [0.4, 2.2, 3.8, 0, 1.45, -2.0, 50]]] },
  // "smoke detector": close on it, headboard below
  { at: T.smoke - 0.1, K: st([0.25, 2.0, -0.4, 0, 2.3, -2.9, 42], [0.2, 2.05, -0.8, 0, 2.35, -2.9, 40]) },
  // s2: high three-quarter, red view cone from the detector onto the bed
  { at: T.s2, K: st([2.8, 2.8, 1.2, 0, 1.4, -1.9, 48], [2.5, 2.9, 0.8, 0, 1.45, -1.9, 48]) },
  // "hide a camera": the lens
  { at: T.hide - 0.1, K: st([0.35, 2.25, -1.7, 0.05, 2.45, -2.9, 36], [0.3, 2.28, -1.9, 0.06, 2.45, -2.9, 34]) },
  // s3: lights out, curtains close
  { at: T.s3, K: st([1.4, 2.1, 3.6, 1.6, 1.3, -2.6, 50], [1.3, 2.1, 3.1, 1.6, 1.3, -2.6, 50]) },
  // s4: behind the guest, the flashlight sweeps the wall
  { at: T.s4, K: st([1.3, 2.05, 2.9, 0, 1.4, -2.9, 54], [1.2, 2.0, 2.5, 0, 1.45, -2.9, 54]) },
  // "clock" then pan to "chargers"
  { at: T.clk - 0.15, K: [[0, [0.1, 1.15, -0.3, 1.3, 0.68, -2.75, 46]], [0.4, [0.1, 1.15, -0.3, 1.3, 0.68, -2.75, 46]], [1.0, [-0.4, 1.2, -0.3, -1.3, 0.75, -2.88, 46]], [1.8, [-0.4, 1.2, -0.4, -1.3, 0.76, -2.88, 46]]] },
  // s5: the beam hits the detector, the lens glints
  { at: T.s5, K: st([-0.15, 2.2, -1.3, 0.05, 2.45, -2.9, 36], [-0.1, 2.25, -1.65, 0.06, 2.45, -2.9, 34]) },
  // "look for it": behind the guest
  { at: T.look - 0.1, K: st([1.5, 1.95, 2.3, 0.1, 1.9, -2.9, 44], [1.4, 1.95, 2.0, 0.1, 1.95, -2.9, 44]) },
  // s6: the guest from the front, phone up, hands off
  { at: T.s6, K: st([1.75, 1.7, -0.75, 0.7, 1.5, 0.7, 46], [1.7, 1.72, -0.6, 0.7, 1.5, 0.7, 46]) },
  // "take a photo": over the shoulder at the detector
  { at: T.photo - 0.15, K: st([1.4, 1.9, 1.8, 0.1, 2.1, -2.9, 40], [1.35, 1.9, 1.6, 0.1, 2.15, -2.9, 40]) },
  // "leave the room": wide, the guest walks to the glowing door
  { at: T.leave - 0.1, K: st([0.5, 2.3, 4.2, -1.2, 1.2, -1.4, 54], [0.4, 2.35, 4.4, -1.3, 1.2, -1.5, 54]) },
  // s7-s8: calm wide, lights off
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.3, 4.4, -0.2, 1.3, -2.0, 52]], [5, [0.3, 2.6, 5.2, -0.2, 1.3, -2.0, 52]]] },
];

run("smoke-detector", (t) => {
  // lights
  const dark = sm(T.turn - 0.05, T.turn + 0.3, t);
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - 0.72 * dark);
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (1 - 0.95 * dark));
  const cl = sm(T.close - 0.05, T.close + 0.5, t);
  curt.forEach((c, i) => { c.position.x = WX + (i ? 1 : -1) * (0.95 - 0.62 * cl); });
  mGlass.color.set(0x6a7cff).multiplyScalar(0.9 * (1 - 0.8 * cl));

  // guest
  let st0;
  if (t < T.leave) {
    const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
    st0 = { x: w.x, z: w.z, h: w.h + (hFace - w.h) * k, walk: w.walk };
  } else st0 = walkPath(SPOT, DOORP, T.leave, tOut, t);
  const ph1 = sm(T.s4 - 0.2, T.fl - 0.15, t) * (1 - sm(T.leave - 0.1, T.leave + 0.2, t));
  P.set({ ...st0, t, vis: t < tOut + 0.15, phone: ph1, look: t > tArr && t < T.s4 ? 0.25 * Math.sin((t - tArr) * 1.6) : 0 });
  const shot = flash(t, T.photo + 0.05);
  ph.userData.screen.material.color.set(WHITE).multiplyScalar(1.4 + 4 * shot);
  mDoor.color.set(GREEN).multiplyScalar(1.8 * sm(T.leave, T.leave + 0.3, t) * (1 - sm(tOut + 0.3, T.s7 + 0.4, t)));

  // s2: the detector "sees" the bed
  const cv = sm(T.aimed - 0.1, T.aimed + 0.25, t) * (1 - sm(T.s3 + 0.1, T.s3 + 0.5, t));
  camCone.set(LENS, BEDC, 0.95, 0.22 * cv);
  bedPatch.set(cv);
  const red = sm(T.hide - 0.1, T.hide + 0.15, t) * (1 - sm(T.s3 + 0.1, T.s3 + 0.5, t));
  lensMat.color.set(RED).multiplyScalar(2.2 * red * (0.75 + 0.25 * Math.sin(t * 9)));

  // s4-s6: flashlight
  const on = sm(T.fl - 0.25, T.fl + 0.05, t) * (1 - sm(T.leave - 0.15, T.leave + 0.1, t));
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.22, 0.13 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).add(V3(0, 0, 0.02)); spotDisk.lookAt(hp); spotDisk.material.opacity = 0.55 * on;
  spot.intensity = 14 * on; spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();

  // glint: the lens throws the flashlight back
  const prox = Math.exp(-tg.distanceToSquared(LENS) / 0.02) * on;
  const gA = Math.max(prox * (0.75 + 0.6 * flash(t, T.glint)), 0.55 * sm(T.s7, T.s7 + 0.4, t));
  gl.visible = gA > 0.02; gl.scale.setScalar(Math.max(0.01, gA * (1 + 0.15 * Math.sin(t * 17))));
  gl.rotation.z = 0.3 * Math.sin(t * 1.3);

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
