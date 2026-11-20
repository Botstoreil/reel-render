// NEVER SKIP WHAT FACES THE BED (Hidden Cam 10). Hotel room: bed against the back wall, a front wall (z = +2.75) with
// a dresser, clock, TV, picture frame and air vent all facing the bed; a smoke detector on the ceiling. The clock is the camera.
// s1 wide of the room from the front wall. s2 close on the clock (red ring on "camera"), then the view from the clock: red lines to the bed.
// s3 the guest stands by the bed and looks out (over the shoulder at the front wall); red lines back at him on "points".
// s4 violet rings pop on each object as the voice names it. s5 room lights dim on "lights", flashlight beam sweeps, the clock lens glints.
// s6 a cloth drops over the clock ("cover"), the frame turns to the wall ("turn"). s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, beam, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, face, phone, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.016;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LIGHTS = scene.children.filter((o) => o.isLight).map((l) => [l, l.intensity]);

// ---------- timing (every word copied from words.json) ----------
const T = {
  check1: g("s1", "check"), bed1: g("s1", "bed"),
  s2: S.s2[0], camera: g("s2", "camera"), clear: g("s2", "clear"), so: g("s2", "so"), see: g("s2", "see"),
  s3: S.s3[0], look: g("s3", "look"), points: g("s3", "points"), back: g("s3", "back"),
  s4: S.s4[0], smoke: g("s4", "smoke"), clocks: g("s4", "clocks"), tvs: g("s4", "tvs"), frames: g("s4", "frames"), air: g("s4", "air"),
  s5: S.s5[0], lights: g("s5", "lights"), flashlight: g("s5", "flashlight"),
  s6: S.s6[0], cover: g("s6", "cover"), turn: g("s6", "turn"), wall: g("s6", "wall"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- bed against the back wall (centre) ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.6, 0.3, 2.0, 0, 0.2, -1.95, mat(0x4a40c0)));
bed.add(box(1.5, 0.2, 1.9, 0, 0.45, -1.93, mat(0xe8e4ff, 0.12)));
bed.add(box(0.6, 0.12, 0.3, -0.35, 0.6, -2.7, mat(0xffffff, 0.2), false), box(0.6, 0.12, 0.3, 0.35, 0.6, -2.7, mat(0xffffff, 0.2), false));
bed.add(box(1.6, 0.9, 0.08, 0, 0.7, -2.95, mat(0x2e2890)));
solid(bed);
scene.add(box(0.45, 0.5, 0.4, -1.2, 0.25, -2.6, mat(0x5a4ce0, 0.2))); // nightstand
const lamp = glow(0xfff0d8, 0.8);
scene.add(box(0.5, 0.04, 0.5, 0, 3.15, 0, lamp, false));

// ---------- front wall (z = 2.75) facing the bed ----------
const FZ = 2.75;
scene.add(box(10, 3.2, 0.1, 0, 1.6, FZ + 0.05, mat(0x15123f, 0.1), false));
scene.add(box(1.8, 0.8, 0.45, -0.2, 0.4, FZ - 0.25, mat(0x4a40c0))); // dresser
// TV on the wall
const TV = V3(0.1, 1.55, FZ - 0.04);
scene.add(box(1.0, 0.6, 0.05, TV.x, TV.y, TV.z, mat(0x0c0a24, 0.05), false), box(0.92, 0.52, 0.01, TV.x, TV.y, TV.z - 0.03, glow(0x3a34a0, 0.9), false));
// clock on the dresser (the real camera: tiny lens under the face)
const CLK = V3(-0.65, 0.93, FZ - 0.3);
const clk = new THREE.Group(); clk.position.copy(CLK); scene.add(clk);
clk.add(box(0.3, 0.26, 0.1, 0, 0, 0, mat(0x2a2470, 0.15), false));
clk.add(box(0.24, 0.12, 0.005, 0, 0.03, -0.052, glow(0x7b5cff, 1.4), false)); // digital face
const lensM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(1.2), toneMapped: false });
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 8), lensM); lens.position.set(0, -0.08, -0.052); clk.add(lens);
// picture frame (turns to the wall in s6)
const FRM = V3(-1.2, 1.45, FZ - 0.04);
const frm = new THREE.Group(); frm.position.copy(FRM); scene.add(frm);
frm.add(box(0.6, 0.75, 0.04, 0, 0, 0, mat(0xd8b46a, 0.25), false), box(0.5, 0.65, 0.005, 0, 0, -0.022, mat(0x3d7bff, 0.35), false));
// air vent (high right)
const VNT = V3(1.25, 2.45, FZ - 0.02);
scene.add(box(0.6, 0.3, 0.03, VNT.x, VNT.y, VNT.z, mat(0x8a86b0, 0.2), false));
for (let i = -2; i <= 2; i++) scene.add(box(0.55, 0.02, 0.01, VNT.x, VNT.y + i * 0.055, VNT.z - 0.02, mat(0x1a1830, 0.05), false));
// smoke detector on the ceiling near the front wall
const SMK = V3(0.1, 3.0, 2.3);
const smkM = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 24), mat(0xe8e4ff, 0.3)); smkM.position.copy(SMK); scene.add(smkM);
scene.add(box(4, 0.05, 2.4, 0.5, 3.05, 1.6, mat(0x15123f, 0.05), false)); // a strip of ceiling to hang it from

function ringOf(hex, r, at) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.01, 8, 40), m); o.renderOrder = 21; o.position.copy(at); scene.add(o); return o;
}
const rClkBad = ringOf(RED, 0.17, V3(CLK.x, CLK.y, CLK.z - 0.08));
const R = {
  smoke: ringOf(VIOLET, 0.24, V3(SMK.x, SMK.y - 0.06, SMK.z)),
  clocks: ringOf(VIOLET, 0.22, V3(CLK.x, CLK.y, CLK.z - 0.08)),
  tvs: ringOf(VIOLET, 0.42, V3(TV.x, TV.y, TV.z - 0.08)),
  frames: ringOf(VIOLET, 0.42, V3(FRM.x, FRM.y, FRM.z - 0.08)),
  air: ringOf(VIOLET, 0.36, V3(VNT.x, VNT.y, VNT.z - 0.08)),
};
R.smoke.rotation.x = Math.PI / 2;
const rClkOk = ringOf(GREEN, 0.27, V3(CLK.x, CLK.y, CLK.z - 0.12));
// where the red lines from the objects land in s3 (just below and in front of the viewer)
const EYE = V3(0.75, 1.25, -0.6);

// sight lines: clock -> bed (s2), objects -> guest (s3)
const BED_PTS = [V3(-0.35, 0.65, -2.6), V3(0.2, 0.6, -1.8), V3(-0.3, 0.6, -1.1)];
const sight = BED_PTS.map(() => beam(RED, 1.6, 0.012));
const SRC = [CLK, TV, FRM, VNT];
const back = SRC.map(() => beam(RED, 1.4, 0.01));
const bedBad = patch(1.9, 2.3, RED, 1.0); bedBad.position.set(0, 0.03, -1.95);

// cloth that drops over the clock in s6
const cloth = box(0.42, 0.36, 0.2, 0, 0, 0, mat(0x3dff8a, 0.35), false); scene.add(cloth);

// flashlight
const spot = new THREE.SpotLight(0xfff4e0, 0, 9, 0.22, 0.5, 1); scene.add(spot, spot.target);
const fBeam = beam(WHITE, 0.9, 0.05);

// ---------- the guest (stands by the bed, right side) ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const BS = [1.15, -1.5];
const hp = V3(0, 0, 0), tg = V3(0, 0, 0);

// ---------- text ----------
title("NEVER SKIP WHAT FACES THE BED");
cap("s2", "clear", "NEEDS A CLEAR VIEW", RED);
cap("s2", "see", "IT SEES THE BED", RED, { boom: 0.35 });
cap("s3", "stand", "STAND BY THE BED", RED);
cap("s3", "points", "WHAT POINTS BACK?", RED, { boom: 0.3 });
cap("s4", "smoke", "SMOKE DETECTORS", GREEN);
cap("s4", "clocks", "CLOCKS + TVS", VIOLET);
cap("s4", "frames", "FRAMES + VENTS", GREEN);
cap("s5", "lights", "LIGHTS OFF", VIOLET);
cap("s5", "flashlight", "FLASHLIGHT ON", GREEN, { boom: 0.3 });
cap("s6", "cover", "COVER IT", GREEN);
cap("s6", "turn", "OR TURN IT AWAY", VIOLET, { boom: 0.3 });
endCard([["WHERE YOU SLEEP", 1], ["CHECK WHAT SEES", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const CX = CLK.x, CY = CLK.y, CZ = CLK.z;
// the front wall from the middle of the room (no head in frame): frame, clock and TV all inside the safe zone
// (camera looks +z, so world -x is screen RIGHT: centre on x -0.6 keeps the frame left of x=940)
const WALL = [-0.45, 1.5, -1.5, -0.6, 1.35, FZ, 56], WALL2 = [-0.5, 1.48, -1.25, -0.6, 1.35, FZ, 55];
const SH = [
  // s1: wide of the bed from the front wall
  { at: 0, K: [[0, [1.6, 2.1, 2.3, -0.2, 0.7, -1.9, 52]], [2.4, [1.3, 1.95, 1.8, -0.2, 0.7, -1.9, 50]]] },
  // s2: close on the clock on the dresser
  { at: T.s2, K: st([CX - 0.3, 1.15, 1.35, CX, CY, CZ, 46], [CX - 0.25, 1.12, 1.5, CX, CY, CZ, 42]) },
  // s2 "so": the clock's view of the bed
  { at: T.so - 0.1, K: st([CX + 0.13, 1.22, 2.64, -0.1, 0.55, -1.9, 50], [CX + 0.15, 1.2, 2.58, -0.1, 0.55, -1.9, 48]) },
  // s3: the guest by the bed, seen from the dresser side, looking out
  { at: T.s3, K: st([-0.3, 1.85, 1.3, 1.0, 1.35, -1.5, 48], [-0.2, 1.82, 1.1, 1.0, 1.35, -1.5, 46]) },
  // s3 "points": the guest's view of the front wall; red lines come back at the viewer
  { at: T.points - 0.1, K: st([0.9, 1.6, -1.3, -0.3, 1.45, FZ, 60], [0.85, 1.58, -1.1, -0.3, 1.45, FZ, 58]) },
  // s4 one shot per thing named: smoke detector (ceiling), then clock + TV + frame, then the vent
  { at: T.s4 - 0.05, K: st([0.3, 1.9, 0.7, SMK.x, 2.95, SMK.z, 46], [0.28, 1.95, 0.85, SMK.x, 2.95, SMK.z, 44]) },
  { at: T.clocks - 0.05, K: st(WALL, WALL2) },
  { at: T.air - 0.05, K: st([0.75, 2.0, 0.6, VNT.x, 2.35, FZ, 46], [0.78, 2.02, 0.75, VNT.x, 2.35, FZ, 44]) },
  // s5: lights off on the wall, the flashlight sweep, then close on the clock glint
  { at: T.s5, K: st(WALL2, [-0.55, 1.45, -1.0, -0.6, 1.3, FZ, 54]) },
  { at: T.flashlight + 0.1, K: st([CX - 0.3, 1.1, 1.4, CX, CY, CZ, 38], [CX - 0.25, 1.08, 1.55, CX, CY, CZ, 36]) },
  // s6: the dresser and the frame (camera to the right so the cloth and the frame stay in frame and under the caption)
  { at: T.s6, K: st([0.1, 1.38, 0.75, -0.95, 1.3, FZ, 56], [0.05, 1.37, 0.9, -0.95, 1.3, FZ, 54]) },
  // s7-s8: calm wide of the bed
  { at: T.s7, calm: 1, K: [[0, [1.6, 2.1, 2.3, -0.2, 0.9, -1.9, 52]], [5, [1.5, 2.2, 2.4, -0.2, 0.9, -1.9, 52]]] },
];

run("face-the-bed", (t) => {
  const pul = 0.8 + 0.2 * Math.sin(t * 8);
  // ---- guest by the bed, looking out toward the front wall from s3 ----
  const hOut = face(BS, [0, FZ]);
  const phU = sm(T.flashlight - 0.5, T.flashlight - 0.1, t) * (1 - sm(T.s6 + 0.3, T.s6 + 0.6, t));
  P.set({ x: BS[0], z: BS[1], h: hOut, walk: 0, t, vis: t >= T.s3 - 0.1 && t < T.points - 0.1, phone: phU, point: sm(T.points - 0.2, T.points + 0.1, t) * (1 - sm(T.s4, T.s4 + 0.3, t)) });

  // ---- s2: red ring on the clock, red lines from the clock to the bed ----
  rClkBad.material.opacity = sm(T.camera - 0.05, T.camera + 0.1, t) * (1 - sm(T.so - 0.2, T.so - 0.1, t)) * pul; rClkBad.scale.setScalar(1 + 0.15 * flash(t, T.camera));
  const sA = sm(T.so - 0.1, T.so + 0.2, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.1, t));
  sight.forEach((b, i) => b.set(CLK, BED_PTS[i], sA * (0.75 + 0.25 * Math.sin(t * 9 + i))));
  bedBad.set(sm(T.see - 0.1, T.see + 0.1, t) * (1 - sm(T.s3 - 0.1, T.s3 + 0.1, t)));

  // ---- s3: red lines from the objects back to the guest's head on "points" ----
  const head = EYE;
  const bA = sm(T.points - 0.1, T.back, t) * (1 - sm(T.s4 - 0.1, T.s4 + 0.1, t));
  back.forEach((b, i) => b.set(SRC[i], head, bA * (0.7 + 0.3 * Math.sin(t * 9 + i))));

  // ---- s4: a violet ring on each object as it is named ----
  for (const k of Object.keys(R)) {
    const T0 = T[k];
    // smoke ring only in its own shot; the rest stay through s5 and go before the clock close-up
    const off = k === "smoke" ? T.clocks - 0.1 : T.flashlight;
    R[k].material.opacity = sm(T0 - 0.05, T0 + 0.1, t) * (1 - sm(off - 0.1, off + 0.05, t)) * pul;
    R[k].scale.setScalar(1 + 0.4 * flash(t, T0));
  }

  // ---- s5: lights off, flashlight sweep frame -> TV -> clock, the clock lens glints ----
  const dark = sm(T.lights - 0.1, T.lights + 0.2, t) * (1 - sm(T.s6 - 0.2, T.s6 + 0.1, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - 0.3 * dark);
  lamp.color.set(0xfff0d8).multiplyScalar(0.8 * (1 - 0.6 * dark));
  P.hands[1].updateWorldMatrix(true, false); P.hands[1].getWorldPosition(hp);
  const u = sm(T.flashlight - 0.3, T.flashlight + 0.4, t);
  tg.copy(FRM).lerp(TV, Math.min(1, u * 2)); if (u > 0.5) tg.copy(TV).lerp(CLK, (u - 0.5) * 2);
  const fOn = sm(T.flashlight - 0.4, T.flashlight - 0.1, t) * (1 - sm(T.s6 - 0.2, T.s6, t));
  spot.intensity = 7 * fOn; spot.position.copy(hp); spot.target.position.copy(tg); spot.target.updateMatrixWorld();
  fBeam.set(hp, tg, 0.35 * fOn * (t < T.flashlight + 0.1 ? 1 : 0));
  ph.userData.screen.material.color.set(WHITE).multiplyScalar(1.4 + 2 * fOn);
  const glint = sm(T.flashlight + 0.2, T.flashlight + 0.4, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.5, t));
  lensM.color.set(0x8fa0ff).multiplyScalar(1.2 + 6 * glint * (0.8 + 0.2 * Math.sin(t * 14)));

  // ---- s6: a cloth drops over the clock, the frame turns to the wall; green ring on the covered clock ----
  const c = sm(T.cover - 0.05, T.cover + 0.3, t);
  cloth.visible = t > T.cover - 0.1;
  cloth.position.set(CLK.x, CLK.y + 0.02 + 0.6 * (1 - c), CLK.z);
  frm.rotation.y = Math.PI * sm(T.turn - 0.05, T.wall, t);
  rClkOk.material.opacity = sm(T.cover + 0.2, T.cover + 0.4, t) * (1 - sm(T.s7 - 0.1, T.s7, t)) * pul;

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
