// NEVER DESTROY A CAMERA YOU FIND (Hidden Cam 08). Hotel room: bed left, shelf with a tiny camera on the back wall, door right.
// s1 guest at the shelf, red ring on the camera ("camera"), rips it out ("rip"), throws it ("throw").
// s2 it smashes on the floor ("Breaking"), red pieces scatter. s3 host walks in the door, shrugs on "deny" (red patch).
// s4 camera back on the shelf intact; guest steps back, green ring ("Don't"), phone up, flash ("photos"), green zone ("where").
// s5 guest walks to the door ("Leave"), phone screen turns green ("report"). s6 hallway: a green door ("move"), guest walks to it ("safe").
// s7-s8 calm wide of the room, camera on the shelf with its green ring.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  camera: g("s1", "camera"), rip: g("s1", "rip"), throw: g("s1", "throw"),
  s2: S.s2[0], brk: g("s2", "breaking"), destroy: g("s2", "destroy"), proof: g("s2", "proof"),
  s3: S.s3[0], without: g("s3", "without"), host: g("s3", "host"), deny: g("s3", "deny"),
  s4: S.s4[0], dont: g("s4", "don't"), take: g("s4", "take"), photos: g("s4", "photos"), video: g("s4", "video"), where: g("s4", "where"),
  s5: S.s5[0], leave: g("s5", "leave"), report: g("s5", "report"), police: g("s5", "police"),
  s6: S.s6[0], ask: g("s6", "ask"), move: g("s6", "move"), somewhere: g("s6", "somewhere"), safe: g("s6", "safe"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- room: bed (left), shelf with the camera (back wall), door (right), lamp ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.6, 0.3, 2.0, -2.6, 0.2, -1.95, mat(0x4a40c0)));
bed.add(box(1.5, 0.2, 1.9, -2.6, 0.45, -1.93, mat(0xe8e4ff, 0.12)));
bed.add(box(1.6, 0.9, 0.08, -2.6, 0.7, -2.95, mat(0x2e2890)));
solid(bed);
const SHELF = V3(-0.4, 1.25, -2.85);
scene.add(box(0.7, 0.04, 0.24, SHELF.x, SHELF.y, SHELF.z, mat(0x6a5cff, 0.3), false));
scene.add(box(0.12, 0.18, 0.1, SHELF.x + 0.24, SHELF.y + 0.11, SHELF.z, mat(0xd8d4ff, 0.2), false)); // a book standing next to it
const dr = door(2.4, -2.95, 0); solid(dr);
scene.add(box(0.5, 0.04, 0.5, 0, 3.15, -1.6, glow(0xfff0d8, 0.8), false));

// the tiny camera: black box, glass lens dot facing the room (+z)
const CAM0 = V3(SHELF.x - 0.08, SHELF.y + 0.06, SHELF.z + 0.02);
const camG = new THREE.Group(); camG.position.copy(CAM0); scene.add(camG);
camG.add(box(0.13, 0.08, 0.08, 0, 0, 0, mat(0x1a1830, 0.1), false));
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.018, 14, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(1.6), toneMapped: false }));
lens.position.set(0.02, 0.005, 0.042); camG.add(lens);
function ringOf(hex, r) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 40), m); o.renderOrder = 21; return o;
}
const rBad = ringOf(RED, 0.13); rBad.position.copy(CAM0).add(V3(0, 0, 0.08)); scene.add(rBad);
const rOk = ringOf(GREEN, 0.13); rOk.position.copy(CAM0).add(V3(0, 0, 0.08)); scene.add(rOk);
const rWhere = ringOf(GREEN, 0.34); rWhere.position.copy(CAM0).add(V3(0.08, 0.02, 0.07)); scene.add(rWhere);
const shelfOk = patch(1.2, 0.9, GREEN, 1.0); shelfOk.position.set(SHELF.x, 0.03, -2.4);

// smash: pieces on the floor
const FLOOR = V3(0.75, 0.05, -1.35);
const PIECES = [];
for (let i = 0; i < 9; i++) {
  const a = i * 2.4 + 0.3, sp = 0.35 + 0.12 * ((i * 7) % 4);
  const p = box(0.03 + 0.012 * (i % 3), 0.02, 0.03 + 0.01 * ((i + 1) % 3), 0, 0, 0, mat(i % 3 ? 0x1a1830 : RED, i % 3 ? 0.1 : 0.7), false);
  p.userData = { dx: Math.cos(a) * sp, dz: Math.sin(a) * sp, r: a }; p.visible = false; scene.add(p); PIECES.push(p);
}
const smashRed = patch(1.2, 1.0, RED, 1.0); smashRed.position.set(FLOOR.x, 0.02, FLOOR.z);
const hostRed = patch(0.9, 0.9, RED, 1.0);

// flash light for the photos
const spot = new THREE.SpotLight(0xfff4e0, 0, 8, 0.25, 0.6, 1); scene.add(spot, spot.target);

// ---------- hallway set (x = 12): wall, floor lines, a green door ----------
const HX = 12;
scene.add(box(6, 3.2, 0.1, HX, 1.6, -3.05, mat(0x15123f, 0.1), false));
for (let i = -3; i <= 3; i += 1) scene.add(box(0.015, 0.003, 6, HX + i, 0.002, 0, glow(VIOLET, 0.5), false));
const d2 = new THREE.Group(); d2.position.set(HX + 0.8, 0, -2.97); scene.add(d2);
d2.add(box(1.0, 2.1, 0.08, 0, 1.05, 0, mat(0x3a30a8)));
const mFrame = glow(GREEN, 0.3);
d2.add(tube([-0.55, 0, 0.06], [-0.55, 2.15, 0.06], 0.05, mFrame), tube([0.55, 0, 0.06], [0.55, 2.15, 0.06], 0.05, mFrame), tube([-0.55, 2.15, 0.06], [0.55, 2.15, 0.06], 0.05, mFrame));
const safeOk = patch(1.4, 1.6, GREEN, 1.0); safeOk.position.set(HX + 0.8, 0.03, -2.1);
scene.add(box(0.5, 0.04, 0.5, HX, 3.15, -1.2, glow(0xfff0d8, 0.8), false));

// ---------- people ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const H = human({ hex: 0xff9a3d, phase: 0.4 });
const G1 = [0.3, -2.25], G4 = [0.05, -1.35], DOORF = [2.25, -2.3], HALL0 = [HX - 1.1, -0.5], HALL1 = [HX + 0.65, -2.25];
const HOST0 = [2.4, -2.7], HOST1 = [1.35, -1.85];
const hp = V3(0, 0, 0), cp = V3(0, 0, 0);

// ---------- text ----------
// round 2: no s1 caps (they replaced the title 0.3 s after it appeared)
title("NEVER DESTROY A CAMERA");
cap("s2", "destroy", "PROOF: DESTROYED", RED, { boom: 0.4 });
cap("s3", "without", "NO PROOF", RED);
cap("s3", "deny", "HOST DENIES IT", RED, { boom: 0.35 });
cap("s4", "don't", "DON'T TOUCH IT", GREEN);
cap("s4", "photos", "TAKE PHOTOS", GREEN);
cap("s4", "video", "AND A VIDEO", VIOLET);
cap("s4", "where", "OF WHERE IT IS", GREEN, { boom: 0.3 });
cap("s5", "leave", "LEAVE THE ROOM", GREEN);
cap("s5", "report", "REPORT IT", VIOLET);
cap("s5", "platform", "PLATFORM + POLICE", GREEN, { boom: 0.3 });
cap("s6", "ask", "ASK TO MOVE", GREEN);
cap("s6", "somewhere", "SOMEWHERE SAFE", GREEN, { boom: 0.3 });
endCard([["DON'T TOUCH IT", 1], ["DOCUMENT IT", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // s1 (round 2): from the front left, the guest stands right of the shelf so the camera is not hidden behind the back
  { at: 0, K: [[0, [-1.3, 1.7, -0.3, -0.1, 1.3, -2.6, 44]], [2.5, [-1.15, 1.68, -0.6, -0.1, 1.3, -2.6, 44]]] },
  // the throw: wider, the floor in frame
  { at: T.throw - 0.1, K: st([1.9, 1.6, 1.0, 0.3, 0.6, -1.8, 50], [1.8, 1.5, 0.8, 0.4, 0.5, -1.6, 50]) },
  // s2: close on the broken pieces
  { at: T.brk + 0.05, K: st([1.45, 0.95, 0.05, 0.75, 0.1, -1.35, 44], [1.35, 0.85, -0.15, 0.75, 0.1, -1.35, 42]) },
  // s3: host in the door, guest in the left foreground
  { at: T.s3, K: st([-1.3, 1.75, 0.9, 1.3, 1.2, -2.1, 48], [-1.1, 1.7, 0.6, 1.3, 1.2, -2.0, 48]) },
  // s4: camera back on the shelf; over the guest's shoulder, then close on the camera for the photos
  // round 2: from the left side, so the guest's back no longer fills the frame and hides the camera
  // round 3: aim further left, the camera sat half outside the left edge
  { at: T.s4, K: st([-1.3, 1.6, -1.0, -0.5, 1.3, -2.7, 42], [-1.2, 1.58, -1.15, -0.5, 1.3, -2.7, 42]) },
  { at: T.photos - 0.05, K: st([-1.0, 1.45, -1.6, -0.5, 1.3, -2.75, 38], [-0.95, 1.44, -1.7, -0.5, 1.3, -2.75, 36]) },
  { at: T.where - 0.1, K: st([-1.3, 1.65, -0.7, -0.4, 1.15, -2.6, 46], [-1.2, 1.63, -0.85, -0.4, 1.15, -2.6, 46]) },
  // s5: wide, guest walks to the door
  { at: T.s5, K: st([-1.3, 1.9, 1.6, 1.2, 1.1, -2.2, 50], [-1.0, 1.85, 1.2, 1.4, 1.1, -2.3, 50]) },
  // s6: hallway, the green door
  { at: T.s6, K: st([HX - 1.6, 1.8, 1.7, HX + 0.5, 1.2, -2.4, 48], [HX - 1.4, 1.75, 1.3, HX + 0.6, 1.2, -2.5, 48]) },
  // s7-s8: calm wide of the room
  { at: T.s7, calm: 1, K: [[0, [0.2, 2.1, 3.0, -0.3, 1.3, -2.5, 50]], [5, [0.2, 2.3, 3.8, -0.3, 1.3, -2.5, 50]]] },
];

run("found-one", (t) => {
  // ---- guest ----
  let x, z, h, walk = 0, point = 0, phU = 0, slump = 0;
  if (t < T.s3) {
    [x, z] = G1;
    const hC = face(G1, [CAM0.x, CAM0.z]), hF = face(G1, [FLOOR.x, FLOOR.z]);
    h = hC + (hF - hC) * sm(T.rip + 0.15, T.throw, t);
    point = sm(T.rip - 0.3, T.rip, t) * (1 - sm(T.throw + 0.1, T.throw + 0.35, t));
    slump = 0.4 * sm(T.brk, T.brk + 0.3, t);
  } else if (t < T.s4) {
    [x, z] = G1; h = face(G1, HOST1);
  } else if (t < T.s5) {
    [x, z] = G4; h = face(G4, [CAM0.x, CAM0.z]);
    phU = sm(T.take - 0.15, T.photos - 0.1, t);
  } else if (t < T.s6) {
    const w = walkPath(G4, DOORF, T.leave, T.report + 0.5, t); x = w.x; z = w.z; walk = w.walk; h = w.h; phU = 1;
  } else {
    const w = walkPath(HALL0, HALL1, T.move, T.safe + 0.15, t); x = w.x; z = w.z; walk = w.walk; h = w.h; phU = 1 - sm(T.move, T.move + 0.3, t);
  }
  P.set({ x, z, h, walk, t, vis: true, point, phone: phU, slump });

  // ---- host: walks in through the door in s3, shrugs on "deny" ----
  const hostOn = t >= T.s3 && t < T.s4;
  const hw = walkPath(HOST0, HOST1, T.s3, T.host + 0.15, t);
  const hh = t > T.host + 0.15 ? face(HOST1, G1) : hw.h;
  H.set({ x: hw.x, z: hw.z, h: hh, walk: hw.walk, t, vis: hostOn, shrug: sm(T.deny - 0.2, T.deny + 0.1, t) });
  hostRed.position.set(HOST1[0], 0.02, HOST1[1]); hostRed.set(hostOn ? sm(T.deny - 0.1, T.deny + 0.1, t) : 0);

  // ---- the camera: on the shelf, ripped into the hand, thrown, smashed; back on the shelf from s4 ----
  P.hands[1].updateWorldMatrix(true, false); P.hands[1].getWorldPosition(hp);
  camG.visible = true; camG.rotation.set(0, 0, 0);
  if (t < T.rip) camG.position.copy(CAM0);
  else if (t < T.throw) camG.position.copy(CAM0).lerp(hp, sm(T.rip, T.rip + 0.25, t));
  else if (t < T.brk) {
    const u = Math.min(1, (t - T.throw) / (T.brk - T.throw)), e = u * u;
    camG.position.copy(hp).lerp(FLOOR, e); camG.position.y += 0.35 * Math.sin(Math.PI * u);
    camG.rotation.set(u * 6, u * 4, 0);
  } else if (t < T.s4) camG.visible = false;
  else camG.position.copy(CAM0);
  const broken = t >= T.brk && t < T.s4;
  for (const p of PIECES) {
    p.visible = broken; if (!broken) continue;
    const k = 1 - Math.exp(-(t - T.brk) * 5);
    p.position.set(FLOOR.x + p.userData.dx * k, 0.012, FLOOR.z + p.userData.dz * k); p.rotation.y = p.userData.r + k * 2;
  }
  smashRed.set(sm(T.brk - 0.05, T.brk + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.2, t)));

  // rings: red on "camera" until the rip; green from "Don't" to the end; big green on "where"
  const pul = 0.8 + 0.2 * Math.sin(t * 8);
  rBad.position.copy(CAM0).add(V3(0, 0, 0.08));
  rBad.material.opacity = sm(T.camera - 0.05, T.camera + 0.1, t) * (1 - sm(T.rip, T.rip + 0.15, t)) * pul; rBad.scale.setScalar(1 + 0.4 * flash(t, T.camera));
  rOk.material.opacity = sm(T.dont - 0.05, T.dont + 0.15, t) * (t < T.s6 || t >= T.s7 ? 1 : 0) * pul; rOk.scale.setScalar(1 + 0.4 * flash(t, T.dont));
  rWhere.material.opacity = sm(T.where - 0.1, T.where + 0.1, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t)) * pul;
  shelfOk.set(sm(T.where - 0.1, T.where + 0.1, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t)));

  // photo flashes at "photos" and a second one on "video"; phone screen green on "report"
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(cp);
  const fl = Math.max(flash(t, T.photos + 0.1), 0.7 * flash(t, T.photos + 0.45));
  spot.intensity = 6 * fl; spot.position.copy(cp); spot.target.position.copy(CAM0); spot.target.updateMatrixWorld();
  const grn = sm(T.report - 0.1, T.report + 0.2, t) * (1 - sm(T.s6 + 0.3, T.s6 + 0.6, t));
  const vio = sm(T.video - 0.1, T.video + 0.1, t) * (1 - sm(T.s5 - 0.1, T.s5, t));
  ph.userData.screen.material.color.set(WHITE).lerp(new THREE.Color(VIOLET), vio).lerp(new THREE.Color(GREEN), grn).multiplyScalar(1.4 + 2.5 * fl);

  // hallway door lights up green on "move", floor patch on "safe"
  const dA = sm(T.move - 0.15, T.move + 0.15, t);
  mFrame.color.set(GREEN).multiplyScalar(0.3 + 1.4 * dA);
  safeOk.set(sm(T.somewhere - 0.1, T.safe, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
