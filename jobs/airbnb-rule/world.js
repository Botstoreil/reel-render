// NEVER ACCEPT AN INDOOR CAMERA (Hidden Cam 09). Rental bedroom: bed left, shelf with a tiny camera on the back wall, shower, door right.
// s1 wide rental bedroom, red ring on the shelf camera ("cameras"), red sight lines to the bed ("never").
// s2 close on the camera ("2024", "inside"), then a living room set: a camera on the TV stand, red ring ("living").
// s3 outside the front door: doorbell camera + outdoor camera, violet rings ("doorbell", "outdoor"), door frame glows ("listed").
// s4 over the guest's shoulder at home: phone screen lights green on "camera" (reading the listing), violet on "book".
// s5 the guest walks in the rental door ("arrive") toward the bed; green zone on the bed ("bed"), on the shower ("shower").
// s6 guest at the shelf, phone up, photo flash ("photograph"), phone screen green ("report"), ring turns green.
// s7-s8 calm wide of the bedroom.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, beam, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  cameras: g("s1", "cameras"), never: g("s1", "never"),
  s2: S.s2[0], y2024: g("s2", "2024"), inside: g("s2", "inside"), living: g("s2", "living"),
  s3: S.s3[0], doorbell: g("s3", "doorbell"), outdoor: g("s3", "outdoor"), allowed: g("s3", "allowed"), listed: g("s3", "listed"),
  s4: S.s4[0], read: g("s4", "read"), camera4: g("s4", "camera"), book: g("s4", "book"),
  s5: S.s5[0], arrive: g("s5", "arrive"), faces: g("s5", "faces"), bed: g("s5", "bed"), shower: g("s5", "shower"),
  s6: S.s6[0], photograph: g("s6", "photograph"), report: g("s6", "report"), airbnb: g("s6", "airbnb"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- rental bedroom: bed (left), shelf with the camera (back wall), shower, door (right) ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.6, 0.3, 2.0, -2.6, 0.2, -1.95, mat(0x4a40c0)));
bed.add(box(1.5, 0.2, 1.9, -2.6, 0.45, -1.93, mat(0xe8e4ff, 0.12)));
bed.add(box(0.6, 0.12, 0.3, -2.95, 0.6, -2.7, mat(0xffffff, 0.2), false), box(0.6, 0.12, 0.3, -2.25, 0.6, -2.7, mat(0xffffff, 0.2), false));
bed.add(box(1.6, 0.9, 0.08, -2.6, 0.7, -2.95, mat(0x2e2890)));
solid(bed);
const SHELF = V3(-0.4, 1.25, -2.85);
scene.add(box(0.7, 0.04, 0.24, SHELF.x, SHELF.y, SHELF.z, mat(0x6a5cff, 0.3), false));
scene.add(box(0.12, 0.18, 0.1, SHELF.x + 0.24, SHELF.y + 0.11, SHELF.z, mat(0xd8d4ff, 0.2), false)); // a book next to it
const dr = door(2.4, -2.95, 0); solid(dr);
scene.add(box(0.5, 0.04, 0.5, 0, 3.15, -1.6, glow(0xfff0d8, 0.8), false));
// shower: glass box with a frame and a shower head, between the shelf and the door
const SHW = V3(1.05, 0, -2.5);
const glass = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(0.35), transparent: true, opacity: 0.22, depthWrite: false });
scene.add(box(0.9, 2.0, 0.9, SHW.x, 1.0, SHW.z, glass, false));
const mShw = glow(VIOLET, 0.7);
for (const [dx, dz] of [[-0.45, 0.45], [0.45, 0.45]]) scene.add(tube([SHW.x + dx, 0, SHW.z + dz], [SHW.x + dx, 2.0, SHW.z + dz], 0.02, mShw));
scene.add(tube([SHW.x - 0.45, 2.0, SHW.z + 0.45], [SHW.x + 0.45, 2.0, SHW.z + 0.45], 0.02, mShw));
scene.add(tube([SHW.x, 1.9, SHW.z - 0.42], [SHW.x, 1.9, SHW.z - 0.2], 0.02, glow(WHITE, 0.8)), box(0.16, 0.03, 0.16, SHW.x, 1.88, SHW.z - 0.18, glow(WHITE, 1.0), false));

// the tiny camera: black box, glass lens dot facing the room (+z)
const CAM0 = V3(SHELF.x - 0.08, SHELF.y + 0.06, SHELF.z + 0.02);
function spyCam(at, s = 1) {
  const G = new THREE.Group(); G.position.copy(at); scene.add(G);
  G.add(box(0.13 * s, 0.08 * s, 0.08 * s, 0, 0, 0, mat(0x1a1830, 0.1), false));
  const l = new THREE.Mesh(new THREE.SphereGeometry(0.018 * s, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(1.6), toneMapped: false }));
  l.position.set(0.02 * s, 0.005 * s, 0.042 * s); G.add(l); return G;
}
spyCam(CAM0);
function ringOf(hex, r, at) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 40), m); o.renderOrder = 21; o.position.copy(at); scene.add(o); return o;
}
const rBad = ringOf(RED, 0.13, V3(CAM0.x, CAM0.y, CAM0.z + 0.08));
const rOk = ringOf(GREEN, 0.13, V3(CAM0.x, CAM0.y, CAM0.z + 0.08));
// red sight lines from the camera to the bed
const BED_PTS = [V3(-2.95, 0.62, -2.6), V3(-2.4, 0.55, -1.9), V3(-2.7, 0.55, -1.2)];
const sight = BED_PTS.map(() => beam(RED, 1.6, 0.012));
const bedOk = patch(1.9, 2.3, GREEN, 1.0); bedOk.position.set(-2.6, 0.03, -1.95);
const shwOk = patch(1.1, 1.1, GREEN, 1.0); shwOk.position.set(SHW.x, 0.03, SHW.z);

// ---------- living room set (x = -12): TV wall, TV stand with a camera, sofa ----------
const LX = -12;
scene.add(box(6, 3.2, 0.1, LX, 1.6, -3.05, mat(0x15123f, 0.1), false));
for (let i = -3; i <= 3; i += 1) scene.add(box(0.015, 0.003, 6, LX + i, 0.002, 0, glow(VIOLET, 0.5), false));
scene.add(box(1.6, 0.9, 0.06, LX, 1.45, -2.95, mat(0x0c0a24, 0.05), false), box(1.5, 0.8, 0.01, LX, 1.45, -2.91, glow(0x3a3290, 0.6), false));
scene.add(box(1.8, 0.45, 0.4, LX, 0.225, -2.75, mat(0x4a40c0)));
const LCAM = V3(LX + 0.65, 0.53, -2.68); spyCam(LCAM);
const rLiv = ringOf(RED, 0.13, V3(LCAM.x, LCAM.y, LCAM.z + 0.08));
const sofa = new THREE.Group(); scene.add(sofa);
sofa.add(box(2.0, 0.4, 0.8, LX - 0.3, 0.25, -0.4, mat(0x6a5cff, 0.2)), box(2.0, 0.6, 0.2, LX - 0.3, 0.6, -0.05, mat(0x5a4ce0, 0.2)));
sofa.add(box(0.2, 0.55, 0.8, LX - 1.3, 0.35, -0.4, mat(0x5a4ce0, 0.2)), box(0.2, 0.55, 0.8, LX + 0.7, 0.35, -0.4, mat(0x5a4ce0, 0.2)));
scene.add(box(0.5, 0.04, 0.5, LX, 3.15, -1.2, glow(0xfff0d8, 0.8), false));

// ---------- outside the front door (x = 12): house front, door, doorbell camera, outdoor camera ----------
const OX = 12;
scene.add(box(6, 3.4, 0.1, OX, 1.7, -3.05, mat(0x2a2470, 0.12), false));
scene.add(box(6.4, 0.12, 0.6, OX, 3.4, -2.8, mat(0x6a5cff, 0.3), false)); // roof edge
const d2 = new THREE.Group(); d2.position.set(OX, 0, -2.97); scene.add(d2);
d2.add(box(1.0, 2.1, 0.08, 0, 1.05, 0, mat(0x3a30a8)), box(0.08, 0.04, 0.06, 0.38, 1.0, 0.06, glow(0xff6a1a, 2), false));
const mDoorF = glow(VIOLET, 0.4);
d2.add(tube([-0.55, 0, 0.06], [-0.55, 2.15, 0.06], 0.04, mDoorF), tube([0.55, 0, 0.06], [0.55, 2.15, 0.06], 0.04, mDoorF), tube([-0.55, 2.15, 0.06], [0.55, 2.15, 0.06], 0.04, mDoorF));
const BELL = V3(OX + 0.8, 1.2, -2.94);
const bell = new THREE.Group(); bell.position.copy(BELL); scene.add(bell);
bell.add(box(0.1, 0.2, 0.05, 0, 0, 0, mat(0x1a1830, 0.1), false));
const bl = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(1.6), toneMapped: false })); bl.position.set(0, 0.05, 0.03); bell.add(bl);
bell.add(box(0.05, 0.05, 0.02, 0, -0.05, 0.03, glow(VIOLET, 1.4), false));
const OUTC = V3(OX - 1.5, 2.8, -2.8);
scene.add(tube([OUTC.x, OUTC.y + 0.1, -2.98], [OUTC.x, OUTC.y + 0.1, OUTC.z], 0.02, mat(0x1a1830, 0.1)));
const oc = spyCam(OUTC, 1.8); oc.rotation.x = 0.35;
const rBell = ringOf(VIOLET, 0.17, V3(BELL.x, BELL.y, BELL.z + 0.08));
const rOut = ringOf(VIOLET, 0.24, V3(OUTC.x, OUTC.y, OUTC.z + 0.12));
scene.add(box(0.5, 0.04, 0.5, OX, 3.3, -1.8, glow(0xfff0d8, 0.6), false));

// ---------- at home (x = 24): the guest reading the listing on the phone ----------
const HX = 24;
scene.add(box(6, 3.2, 0.1, HX, 1.6, -3.05, mat(0x15123f, 0.1), false));
for (let i = -3; i <= 3; i += 1) scene.add(box(0.015, 0.003, 6, HX + i, 0.002, 0, glow(VIOLET, 0.5), false));
scene.add(box(0.5, 0.04, 0.5, HX, 3.15, -1.2, glow(0xfff0d8, 0.8), false));
const homeOk = patch(1.0, 1.0, GREEN, 1.0); homeOk.position.set(HX, 0.03, -1.6);

// flash light for the photos
const spot = new THREE.SpotLight(0xfff4e0, 0, 8, 0.25, 0.6, 1); scene.add(spot, spot.target);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const G1 = [0.6, -1.0], HOME = [HX, -1.6], DOORF = [2.25, -2.3], BEDSIDE = [-1.35, -1.5], G6 = [0.05, -1.35];
const cp = V3(0, 0, 0);

// ---------- text ----------
title("NEVER ACCEPT AN INDOOR CAMERA");
cap("s2", "2024", "BANNED SINCE 2024", RED, { boom: 0.35 });
cap("s2", "inside", "INSIDE THE HOME", RED);
cap("s2", "living", "EVEN LIVING ROOM", RED, { boom: 0.3 });
cap("s3", "doorbell", "OUTDOOR CAMS", RED);
cap("s3", "listed", "MUST BE LISTED", RED, { boom: 0.3 });
cap("s4", "read", "READ THE LISTING", GREEN);
cap("s4", "before", "BEFORE YOU BOOK", VIOLET, { boom: 0.3 });
cap("s5", "check", "WHAT FACES THE BED", GREEN);
cap("s5", "shower", "AND THE SHOWER", VIOLET, { boom: 0.3 });
cap("s6", "photograph", "PHOTOGRAPH IT", GREEN);
cap("s6", "report", "REPORT TO AIRBNB", VIOLET, { boom: 0.3 });
endCard([["INSIDE CAMS BANNED", 1], ["REPORT THEM", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // s1: wide rental bedroom, slow push toward the shelf
  { at: 0, K: [[0, [0.6, 2.0, 2.6, -1.0, 1.0, -2.2, 52]], [3.6, [0.3, 1.85, 1.6, -1.0, 1.0, -2.3, 50]]] },
  // s2: close on the camera
  { at: T.s2, K: st([0.2, 1.5, -1.2, -0.45, 1.25, -2.85, 40], [0.05, 1.48, -1.45, -0.45, 1.25, -2.85, 38]) },
  // s2 "living": the living room, camera on the TV stand
  { at: T.living - 0.1, K: st([LX + 1.9, 1.5, 0.9, LX + 0.2, 0.8, -2.5, 46], [LX + 1.7, 1.45, 0.6, LX + 0.3, 0.8, -2.5, 46]) },
  // s3: outside the front door
  { at: T.s3, K: st([OX + 0.4, 1.7, 1.9, OX - 0.2, 1.7, -2.8, 50], [OX + 0.3, 1.65, 1.4, OX - 0.2, 1.7, -2.8, 50]) },
  // s4: over the guest's shoulder, the phone
  { at: T.s4, K: st([HX + 0.45, 1.75, -0.55, HX + 0.05, 1.1, -2.1, 40], [HX + 0.4, 1.72, -0.7, HX + 0.05, 1.1, -2.1, 38]) },
  // s5: wide, the guest walks in to the bed
  { at: T.s5, K: st([0.6, 2.1, 2.3, -0.6, 0.9, -2.1, 52], [0.4, 2.0, 2.0, -0.8, 0.9, -2.1, 52]) },
  // s6: from the left side, the guest photographs the camera (proven framing from found-one)
  { at: T.s6, K: st([-1.3, 1.6, -1.0, -0.5, 1.3, -2.7, 42], [-1.2, 1.58, -1.15, -0.5, 1.3, -2.7, 42]) },
  // s7-s8: calm wide of the room
  { at: T.s7, calm: 1, K: [[0, [0.2, 2.1, 3.0, -0.3, 1.3, -2.5, 50]], [5, [0.2, 2.3, 3.8, -0.3, 1.3, -2.5, 50]]] },
];

run("airbnb-rule", (t) => {
  // ---- guest ----
  let x, z, h, walk = 0, phU = 0, vis = true, shrug = 0;
  if (t < T.s3) { // in the bedroom, looking at the shelf camera
    [x, z] = G1; h = face(G1, [CAM0.x, CAM0.z]); shrug = 0.6 * sm(T.never - 0.2, T.never + 0.2, t) * (1 - sm(T.s2 - 0.2, T.s2, t));
    vis = t < T.living - 0.1;
  } else if (t < T.s4) { vis = false; [x, z] = G1; h = 0; }
  else if (t < T.s5) { [x, z] = HOME; h = 0; phU = 1; }
  else if (t < T.s6) {
    const w = walkPath(DOORF, BEDSIDE, T.arrive - 0.2, T.bed, t); x = w.x; z = w.z; walk = w.walk; h = w.h;
    if (t > T.bed) h = face(BEDSIDE, [SHW.x, SHW.z]) * sm(T.shower - 0.4, T.shower, t) + face(BEDSIDE, [-2.6, -1.9]) * (1 - sm(T.shower - 0.4, T.shower, t));
  } else { [x, z] = G6; h = face(G6, [CAM0.x, CAM0.z]); phU = sm(T.s6, T.photograph - 0.1, t); }
  P.set({ x, z, h, walk, t, vis, phone: phU, shrug });

  // ---- red rings + sight lines on the rental camera (s1-s2), living-room camera on "living" ----
  const pul = 0.8 + 0.2 * Math.sin(t * 8);
  rBad.material.opacity = sm(T.cameras - 0.05, T.cameras + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3, t)) * pul; rBad.scale.setScalar(1 + 0.4 * flash(t, T.cameras));
  const sA = sm(T.never - 0.1, T.never + 0.2, t) * (1 - sm(T.s2 - 0.1, T.s2 + 0.1, t)) + sm(T.inside - 0.1, T.inside + 0.1, t) * (1 - sm(T.living - 0.2, T.living, t));
  sight.forEach((b, i) => b.set(CAM0, BED_PTS[i], Math.min(1, sA) * (0.75 + 0.25 * Math.sin(t * 9 + i))));
  rLiv.material.opacity = sm(T.living - 0.05, T.living + 0.15, t) * (1 - sm(T.s3 - 0.1, T.s3, t)) * pul; rLiv.scale.setScalar(1 + 0.4 * flash(t, T.living + 0.05));

  // ---- outside: violet rings on the doorbell and outdoor cameras; door frame glows on "listed" ----
  rBell.material.opacity = sm(T.doorbell - 0.05, T.doorbell + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4, t)) * pul; rBell.scale.setScalar(1 + 0.4 * flash(t, T.doorbell));
  rOut.material.opacity = sm(T.outdoor - 0.05, T.outdoor + 0.15, t) * (1 - sm(T.s4 - 0.1, T.s4, t)) * pul; rOut.scale.setScalar(1 + 0.4 * flash(t, T.outdoor));
  mDoorF.color.set(VIOLET).multiplyScalar(0.4 + 1.6 * sm(T.listed - 0.15, T.listed + 0.1, t));

  // ---- phone: green on "camera" (s4), violet on "book"; photo flash on "photograph"; green on "report" ----
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(cp);
  const fl = Math.max(flash(t, T.photograph + 0.1), 0.7 * flash(t, T.photograph + 0.45));
  spot.intensity = 6 * fl; spot.position.copy(cp); spot.target.position.copy(CAM0); spot.target.updateMatrixWorld();
  const g4 = sm(T.camera4 - 0.15, T.camera4 + 0.05, t) * (1 - sm(T.book - 0.1, T.book, t));
  const v4 = sm(T.book - 0.1, T.book + 0.05, t) * (1 - sm(T.s5 - 0.1, T.s5, t));
  const grn = Math.max(g4, sm(T.report - 0.1, T.report + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7, t)));
  ph.userData.screen.material.color.set(WHITE).lerp(new THREE.Color(VIOLET), v4).lerp(new THREE.Color(GREEN), grn).multiplyScalar(1.4 + 2.5 * fl + 0.6 * flash(t, T.camera4));
  homeOk.set(sm(T.book - 0.1, T.book + 0.1, t) * (1 - sm(T.s5 - 0.1, T.s5, t)));

  // ---- s5: green zones on the bed and the shower ----
  bedOk.set(sm(T.bed - 0.1, T.bed + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)));
  shwOk.set(sm(T.shower - 0.1, T.shower + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)));
  mShw.color.set(VIOLET).multiplyScalar(0.7 + 1.2 * sm(T.shower - 0.1, T.shower + 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6 + 0.1, t)));

  // ---- s6 onward: green ring on the camera ----
  rOk.material.opacity = sm(T.photograph - 0.1, T.photograph + 0.1, t) * pul; rOk.scale.setScalar(1 + 0.4 * flash(t, T.photograph));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
