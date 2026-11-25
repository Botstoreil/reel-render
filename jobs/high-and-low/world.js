// NEVER CHECK ONLY AT EYE LEVEL (Hidden Cam). Hotel room.
// s1 guest walks in. s2 flashlight sweeps only the eye-level band (red), then stops. s3 a camera high in the smoke
// detector, and low in a wall socket (red lenses, red view cones onto the bed). s4 start high: detector + ceiling
// corners (green top band, glint). s5 go low: socket, charger, floor (green low band, glint). s6 eye level last,
// lights off, flashlight on. s7-s8 calm wide, three green bands.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], scan: g("s2", "scan"), ahead: g("s2", "ahead"), stop: g("s2", "stop"),
  s3: S.s3[0], camera: g("s3", "camera"), high: g("s3", "high"), low: g("s3", "low"),
  s4: S.s4[0], det: g("s4", "detector"), corners: g("s4", "corners"), ceiling: g("s4", "ceiling"),
  s5: S.s5[0], sockets: g("s5", "sockets"), chargers: g("s5", "chargers"), anything: g("s5", "anything"), floor: g("s5", "floor"),
  s6: S.s6[0], eye: g("s6", "eye"), lights: g("s6", "lights"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- the room: bed against the back wall, two nightstands, window with curtains, door ----------
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
// lamp on the right nightstand (goes out at "lights off")
const mLamp = glow(0xffd8a0, 1.3);
scene.add(tube([1.42, 0.55, -2.82], [1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(1.42, 1.02, -2.82); scene.add(shade);
// wall charger above the left nightstand
const CHG = V3(-1.3, 0.82, -2.88);
scene.add(box(0.14, 0.14, 0.02, -1.3, 0.82, -2.94, mat(0xd8d4ff, 0.2), false));
scene.add(box(0.08, 0.1, 0.06, -1.3, 0.82, -2.9, mat(0xffffff, 0.3)));
scene.add(tube([-1.3, 0.77, -2.88], [-1.25, 0.56, -2.8], 0.012, mat(0xffffff, 0.3)));
// window + curtains (right side of the back wall)
const WX = 2.9;
scene.add(box(1.3, 1.4, 0.02, WX, 1.65, -2.94, glow(0x6a7cff, 0.9), false));
scene.add(box(1.4, 0.06, 0.04, WX, 2.38, -2.92, mat(0x8a80ff, 0.4), false), box(1.4, 0.06, 0.04, WX, 0.92, -2.92, mat(0x8a80ff, 0.4), false));
for (const s of [-1, 1]) scene.add(box(0.7, 1.75, 0.05, WX + s * 0.95, 1.62, -2.85, mat(0x5a4fd0, 0.3)));
door(-2.7, -2.9, 0);
// ceiling line: a glowing trim along the top of the wall, so "ceiling corners" read
scene.add(box(10, 0.05, 0.06, 0, 3.17, -2.9, glow(0x8a80ff, 0.9), false));
scene.add(box(10, 0.04, 0.04, 0, 0.04, -2.9, glow(0x8a80ff, 0.6), false)); // skirting

// ---------- the smoke detector high over the bed, a lens inside ----------
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
function glint(P) {
  const gq = new THREE.Group(); gq.position.copy(P).add(V3(0, 0, 0.03)); scene.add(gq);
  gq.add(new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.01, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.46, 0.002), mGl));
  gq.visible = false; return gq;
}
const DET = V3(0, 2.7, -2.92);
const det = new THREE.Group(); det.position.copy(DET); scene.add(det);
const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.07, 40), mat(0xf0eeff, 0.35)); body.rotation.x = Math.PI / 2; det.add(body);
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.008, 8, 40), glow(VIOLET, 1.6)); ring.position.z = 0.036; det.add(ring);
for (let i = -2; i <= 2; i++) det.add(box(0.14, 0.012, 0.004, -0.04, i * 0.035, 0.037, glow(0x2a2660, 1), false));
const LENS = DET.clone().add(V3(0.09, -0.07, 0.04));
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
{ const l = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), lensMat); l.position.copy(LENS); scene.add(l); }
const glD = glint(LENS);

// ---------- the wall socket low on the wall, a pinhole lens in it ----------
const SOCK = V3(1.85, 0.3, -2.94);
scene.add(box(0.2, 0.2, 0.025, SOCK.x, SOCK.y, SOCK.z, mat(0xf0eeff, 0.35), false));
for (const dx of [-0.035, 0.035]) scene.add(box(0.018, 0.045, 0.004, SOCK.x + dx, SOCK.y + 0.02, -2.925, glow(0x0a0820, 1), false));
const SLENS = V3(SOCK.x, SOCK.y - 0.055, -2.92);
const sLensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
{ const l = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), sLensMat); l.position.copy(SLENS); scene.add(l); }
const glS = glint(SLENS);

// ---------- bands on the wall: eye level, high, low ----------
function band(w, h, y, hex) { const b = patch(w, h, hex, 1.1); b.rotation.x = 0; b.position.set(0, y, -2.88); return b; }
const bEyeR = band(5.0, 0.55, 1.55, RED), bEyeG = band(5.0, 0.55, 1.55, GREEN);
const bHigh = band(5.0, 0.55, 2.85, GREEN), bLow = band(5.0, 0.5, 0.27, GREEN);

// ---------- light cones: red camera views (s3), white phone flashlight ----------
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const BEDC = V3(0, 0.6, -1.6);
const coneD = cone(RED, 1.0), coneS = cone(RED, 1.0);
const bedPatch = patch(1.6, 1.7, RED, 1.2); bedPatch.position.set(0, 0.65, -1.75);
const beamCone = cone(WHITE, 0.9);
const spotDisk = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e0).multiplyScalar(1.1), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
spotDisk.renderOrder = 7; scene.add(spotDisk);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [-1.4, 2.8], SPOT = [0.7, 0.7];
const tArr = S.s1[0] + 2.2, hFace = face(SPOT, [0, -2.9]);
const hp = V3(0, 0, 0);

// flashlight path: eye level left->right (s2) | detector, ceiling corners (s4) | socket, charger, floor (s5) | eye level (s6)
const EYE_L = V3(-2.2, 1.55, -2.93), EYE_R = V3(2.2, 1.55, -2.93);
const CORN_L = V3(-1.5, 3.02, -2.93), CORN_R = V3(1.5, 3.02, -2.93), HIGH0 = V3(-0.6, 2.85, -2.93);
const FLOOR = V3(0.25, 0.02, -0.7);
const TK = [
  [T.scan - 0.1, EYE_L], [T.ahead + 0.2, EYE_R], [T.stop + 0.3, EYE_R],
  [T.s4 + 0.05, HIGH0], [T.det, LENS], [T.det + 0.35, LENS], [T.corners, CORN_L], [T.ceiling + 0.1, CORN_R],
  [T.s5 + 0.1, V3(1.4, 0.3, -2.93)], [T.sockets, SLENS], [T.sockets + 0.3, SLENS], [T.chargers, CHG], [T.floor - 0.15, FLOOR],
  [T.eye - 0.05, EYE_L], [T.s7 + 0.2, EYE_R],
];
function target(t) {
  if (t <= TK[0][0]) return TK[0][1].clone();
  for (let i = 0; i < TK.length - 1; i++) if (t < TK[i + 1][0]) return TK[i][1].clone().lerp(TK[i + 1][1], sm(TK[i][0], TK[i + 1][0], t));
  return TK.at(-1)[1].clone();
}

// ---------- text ----------
title("NEVER CHECK ONLY AT EYE LEVEL");
cap("s2", "straight", "STRAIGHT AHEAD", RED);
cap("s2", "stop", "THEN STOP", RED);
cap("s3", "high", "HIGH UP", RED);
cap("s3", "smoke", "SMOKE DETECTOR", RED, { boom: 0.4 });
cap("s3", "low", "LOW DOWN", RED);
cap("s3", "wall", "WALL SOCKET", RED, { boom: 0.4 });
cap("s4", "start", "START HIGH", GREEN, { boom: 0.3 });
cap("s4", "detector", "DETECTOR", GREEN);
cap("s4", "corners", "CEILING CORNERS", GREEN);
cap("s5", "go", "GO LOW", VIOLET, { boom: 0.3 });
cap("s5", "sockets", "SOCKETS", GREEN);
cap("s5", "chargers", "CHARGERS", GREEN);
cap("s5", "anything", "NEAR THE FLOOR", GREEN);
cap("s6", "eye", "EYE LEVEL LAST", VIOLET);
cap("s6", "lights", "LIGHTS OFF", GREEN);
cap("s6", "flashlight", "FLASHLIGHT ON", GREEN);
endCard([["HIGH, THEN LOW", 1], ["THEN EYE LEVEL", 1]]);

// ---------- shots: [camX, camY, camZ, lookX, lookY, lookZ, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: the room, guest walks in
  { at: 0, K: [[0, [0.6, 2.2, 4.6, 0, 1.5, -2.0, 52]], [2.5, [0.4, 2.1, 3.9, 0, 1.55, -2.0, 52]]] },
  // s2: behind the guest, the beam sweeps only the red eye-level band
  { at: T.s2, K: st([1.3, 1.9, 3.0, 0, 1.55, -2.9, 56], [1.2, 1.85, 2.7, 0, 1.55, -2.9, 56]) },
  // "stop there": the guest lowers the phone, front three-quarter
  { at: T.stop - 0.1, K: st([2.4, 1.6, -1.3, 0.7, 1.35, 0.7, 50], [2.3, 1.62, -1.15, 0.7, 1.35, 0.7, 50]) },
  // s3 "camera ... high": wide three-quarter, detector cone onto the bed
  { at: T.camera - 0.1, K: st([2.8, 2.6, 1.4, 0, 2.0, -1.9, 52], [2.6, 2.7, 1.1, 0, 2.1, -1.9, 52]) },
  // "smoke detector": close on the lens
  { at: g("s3", "smoke") - 0.1, K: st([0.35, 2.45, -1.7, 0.05, 2.65, -2.9, 36], [0.3, 2.48, -1.9, 0.06, 2.65, -2.9, 34]) },
  // "low in a wall socket": close on the socket
  { at: T.low - 0.1, K: st([1.55, 0.62, -1.85, 1.85, 0.3, -2.9, 40], [1.6, 0.58, -2.0, 1.85, 0.3, -2.9, 38]) },
  // s4: low angle behind the guest, looking up the wall, beam on the green top band
  { at: T.s4, K: st([0.6, 1.5, 2.4, 0, 2.55, -2.9, 60], [0.55, 1.45, 2.1, 0, 2.6, -2.9, 60]) },
  // "detector": the glint
  { at: T.det - 0.05, K: st([-0.15, 2.4, -1.3, 0.05, 2.65, -2.9, 38], [-0.1, 2.45, -1.6, 0.06, 2.65, -2.9, 36]) },
  // "corners of the ceiling": back up, wall top
  { at: T.corners - 0.1, K: st([0.6, 1.6, 2.3, 0, 2.6, -2.9, 60], [0.5, 1.65, 2.6, 0, 2.65, -2.9, 60]) },
  // s5 "go low ... sockets": down at the socket
  { at: T.s5, K: st([1.4, 0.95, -0.8, 1.8, 0.35, -2.9, 44], [1.45, 0.85, -1.1, 1.8, 0.33, -2.9, 42]) },
  // "chargers": the wall charger
  { at: T.chargers - 0.1, K: st([-0.6, 1.1, -0.7, -1.3, 0.75, -2.88, 44], [-0.65, 1.05, -0.9, -1.3, 0.75, -2.88, 44]) },
  // "anything near the floor": the floor in front of the bed, beam pooled there
  { at: T.anything - 0.1, K: st([-1.2, 1.1, 1.3, 0.3, 0.15, -0.9, 52], [-1.1, 1.0, 1.1, 0.3, 0.15, -0.9, 52]) },
  // s6: behind the guest, eye-level band, lights go out
  { at: T.s6, K: st([1.3, 1.8, 3.0, 0, 1.55, -2.9, 56], [1.2, 1.75, 2.6, 0, 1.55, -2.9, 56]) },
  // s7-s8: calm wide, all three bands
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.0, 4.6, 0, 1.6, -2.0, 54]], [5, [0.3, 2.2, 5.3, 0, 1.6, -2.0, 54]]] },
];

run("high-and-low", (t) => {
  // lights
  const dark = sm(T.lights - 0.05, T.lights + 0.3, t);
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - 0.72 * dark);
  mLamp.color.set(0xffd8a0).multiplyScalar(1.3 * (1 - 0.95 * dark));

  // guest
  const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
  const on1 = sm(T.scan - 0.3, T.scan, t) * (1 - sm(T.stop + 0.15, T.stop + 0.4, t));
  const on2 = sm(T.s4 - 0.25, T.s4 + 0.05, t);
  const on = Math.max(on1, on2);
  P.set({ x: w.x, z: w.z, h: w.h + (hFace - w.h) * k, walk: w.walk, t, vis: true, phone: Math.max(on, sm(T.s2 - 0.2, T.scan - 0.2, t) * (1 - sm(T.stop, T.stop + 0.4, t))), look: t > tArr && t < T.s2 ? 0.25 * Math.sin((t - tArr) * 1.6) : 0 });

  // bands
  bEyeR.set(sm(T.scan - 0.1, T.scan + 0.3, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.3, t)));
  bHigh.set(Math.max(sm(T.s4 - 0.1, T.s4 + 0.3, t) * (1 - sm(T.s5 - 0.1, T.s5 + 0.3, t)), 0.6 * sm(T.s7, T.s7 + 0.3, t)));
  bLow.set(Math.max(sm(T.s5 - 0.1, T.s5 + 0.3, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.3, t)), 0.6 * sm(T.s7 + 0.2, T.s7 + 0.5, t)));
  bEyeG.set(Math.max(sm(T.eye - 0.1, T.eye + 0.3, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)), 0.6 * sm(T.s7 + 0.5, T.s7 + 0.8, t)));

  // s3: the hidden cameras "see" the bed
  const endR = 1 - sm(T.s4 - 0.1, T.s4 + 0.3, t);
  const cd = sm(T.high - 0.1, T.high + 0.25, t) * endR, cs = sm(T.low - 0.1, T.low + 0.25, t) * endR;
  coneD.set(LENS, BEDC, 0.95, 0.22 * cd);
  coneS.set(SLENS, BEDC, 0.9, 0.22 * cs);
  bedPatch.set(Math.max(cd, cs));
  const pulse = 0.75 + 0.25 * Math.sin(t * 9);
  lensMat.color.set(RED).multiplyScalar(2.2 * cd * pulse);
  sLensMat.color.set(RED).multiplyScalar(2.4 * cs * pulse);

  // flashlight
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  const tg = target(t);
  beamCone.set(hp, tg, 0.22, 0.13 * on);
  spotDisk.visible = on > 0.01; spotDisk.position.copy(tg).add(V3(0, 0, 0.02)); spotDisk.lookAt(hp); spotDisk.material.opacity = 0.28 * on;
  spot.intensity = 4 * on; spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();

  // glints: each lens throws the flashlight back; both stay lit on the end card
  const endG = 0.55 * sm(T.s7, T.s7 + 0.4, t);
  for (const [gq, L, w0] of [[glD, LENS, T.det], [glS, SLENS, T.sockets]]) {
    const prox = Math.exp(-tg.distanceToSquared(L) / 0.02) * on;
    const a = Math.max(prox * (0.75 + 0.6 * flash(t, w0 + 0.1)), endG);
    gq.visible = a > 0.02; gq.scale.setScalar(Math.max(0.01, a * (1 + 0.15 * Math.sin(t * 17))));
    gq.rotation.z = 0.3 * Math.sin(t * 1.3);
  }

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
