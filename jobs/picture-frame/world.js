// NEVER IGNORE THE PICTURE FRAME (Hidden Cam 12). Hotel room: bed on the back wall, front wall (z = +2.75) with a dresser
// and a wall shelf; a standing picture frame on the shelf faces the bed. A tiny glass dot in the picture is the lens.
// s1 from the bed: the frame on the shelf looks back. s2 close on the dresser: a small frame, a clock and a wall charger,
// red ring on each as the voice names it, then they all look normal. s3 from behind the bed: the shelf frame swings,
// red sight line to the bed. s4 close on the frame: violet ring on a tiny hole, green ring on the glass dot.
// s5 lights off, flashlight from the guest's phone, the dot glints. s6 the frame is laid face down. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, VIOLET, RED, GREEN, WHITE, mSolid, beam, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, face, phone, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.016;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LIGHTS = scene.children.filter((o) => o.isLight).map((l) => [l, l.intensity]);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], frames: g("s2", "frames"), clocks: g("s2", "clocks"), chargers: g("s2", "chargers"), completely: g("s2", "completely"),
  s3: S.s3[0], point: g("s3", "point"), anywhere: g("s3", "anywhere"), likes: g("s3", "likes"),
  s4: S.s4[0], hole: g("s4", "hole"), glass: g("s4", "glass"),
  s5: S.s5[0], lights: g("s5", "lights"), flashlight: g("s5", "flashlight"), glint: g("s5", "glint"),
  s6: S.s6[0], lay: g("s6", "lay"), down: g("s6", "down"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- bed against the back wall ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.6, 0.3, 2.0, 0, 0.2, -1.95, mat(0x4a40c0)));
bed.add(box(1.5, 0.2, 1.9, 0, 0.45, -1.93, mat(0xe8e4ff, 0.12)));
bed.add(box(0.6, 0.12, 0.3, -0.35, 0.6, -2.7, mat(0xffffff, 0.2), false), box(0.6, 0.12, 0.3, 0.35, 0.6, -2.7, mat(0xffffff, 0.2), false));
bed.add(box(1.6, 0.9, 0.08, 0, 0.7, -2.95, mat(0x2e2890)));
solid(bed);
scene.add(box(0.45, 0.5, 0.4, -1.2, 0.25, -2.6, mat(0x5a4ce0, 0.2))); // nightstand
const lamp = glow(0xfff0d8, 0.8);
scene.add(box(0.5, 0.04, 0.5, 0, 3.15, 0, lamp, false));

// ---------- front wall, dresser, shelf ----------
const FZ = 2.75;
scene.add(box(10, 3.2, 0.1, 0, 1.6, FZ + 0.05, mat(0x15123f, 0.1), false));
const dresser = box(1.8, 0.8, 0.45, -0.35, 0.4, FZ - 0.25, mat(0x4a40c0)); scene.add(dresser); solid(dresser);
scene.add(box(0.9, 0.04, 0.32, 1.3, 1.3, FZ - 0.16, mat(0x5a4fd0, 0.25))); // wall shelf

const lensMat = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(0x8fa0ff).multiplyScalar(1.0), toneMapped: false });
const dot = (r, m) => new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), m);

// the main frame: pivot at its bottom front edge, front faces -z (toward the room)
const FR = V3(1.3, 1.32, FZ - 0.24);
const frm = new THREE.Group(); frm.position.copy(FR); scene.add(frm);
const frmIn = new THREE.Group(); frmIn.position.set(0, 0, 0.02); frm.add(frmIn); // body sits just behind the pivot
frmIn.add(box(0.38, 0.48, 0.035, 0, 0.24, 0, mat(0xd8b46a, 0.3), false));
frmIn.add(box(0.3, 0.4, 0.005, 0, 0.24, -0.02, mat(0x3d7bff, 0.4), false)); // the picture
frmIn.add(box(0.12, 0.12, 0.004, -0.04, 0.2, -0.024, mat(0x6affc0, 0.35), false)); // a shape in the picture
frmIn.add(box(0.04, 0.3, 0.2, 0, 0.15, 0.1, mat(0x8a7a50, 0.15), false)); // the stand behind it
const lensM = lensMat();
const lens = dot(0.008, lensM); lens.position.set(0.07, 0.33, -0.024); frmIn.add(lens); // glass dot in the picture
const hole = dot(0.007, new THREE.MeshBasicMaterial({ color: 0x05030f })); hole.position.set(0.155, 0.04, -0.019); frmIn.add(hole); // tiny hole in the border
const H0 = face([FR.x, FR.z], [0, -1.95]);

// ---------- s2 lineup on the dresser: small frame, clock, wall charger ----------
const DY = 0.8, DZ = FZ - 0.3;
const sf = new THREE.Group(); sf.position.set(-0.95, DY, DZ); scene.add(sf);
sf.add(box(0.24, 0.3, 0.03, 0, 0.15, 0, mat(0xd8b46a, 0.3), false), box(0.18, 0.24, 0.005, 0, 0.15, -0.018, mat(0xff5fa2, 0.35), false));
const CLK = V3(-0.4, DY + 0.13, DZ);
scene.add(box(0.3, 0.26, 0.1, CLK.x, CLK.y, CLK.z, mat(0x2a2470, 0.15), false), box(0.24, 0.12, 0.005, CLK.x, CLK.y + 0.03, CLK.z - 0.052, glow(0x7b5cff, 1.4), false));
const CHG = V3(0.15, DY + 0.25, FZ - 0.04);
scene.add(box(0.16, 0.2, 0.01, CHG.x, CHG.y, FZ - 0.005, mat(0xe8e4ff, 0.2), false)); // socket plate
scene.add(box(0.1, 0.1, 0.07, CHG.x, CHG.y, CHG.z - 0.03, mat(0xffffff, 0.35), false)); // charger cube

function ringOf(hex, r, at, tube = 0.01, k = 2) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 40), m); o.renderOrder = 21; o.position.copy(at); scene.add(o); return o;
}
const R2 = {
  frames: ringOf(RED, 0.19, V3(sf.position.x, DY + 0.15, DZ - 0.08)),
  clocks: ringOf(RED, 0.22, V3(CLK.x, CLK.y, CLK.z - 0.08)),
  chargers: ringOf(RED, 0.16, V3(CHG.x, CHG.y, CHG.z - 0.1)),
};
const rFrameBad = ringOf(RED, 0.36, V3(0, 0, 0));
const rHole = ringOf(VIOLET, 0.035, V3(0, 0, 0), 0.004, 1);
const rDot = ringOf(GREEN, 0.035, V3(0, 0, 0), 0.004, 1);
const rDown = ringOf(GREEN, 0.3, V3(FR.x, FR.y + 0.06, FR.z - 0.1), 0.008, 1); rDown.rotation.x = Math.PI / 2;

// red sight lines from the frame to the bed (s3)
const BED_PTS = [V3(-0.35, 0.65, -2.6), V3(0.2, 0.6, -1.8), V3(-0.3, 0.6, -1.1)];
const sight = BED_PTS.map(() => beam(RED, 1.6, 0.012));

// flashlight
const spot = new THREE.SpotLight(0xfff4e0, 0, 9, 0.22, 0.5, 1); scene.add(spot, spot.target);
const fBeam = beam(WHITE, 0.9, 0.05);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const BS = [1.15, -1.5], SHELF = [0.7, 2.0];
const hp = V3(0, 0, 0), lp = V3(0, 0, 0), hl = V3(0, 0, 0), fc = V3(0, 0, 0);

// ---------- text ----------
title("NEVER IGNORE THE PICTURE FRAME");
cap("s2", "frames", "BUILT INTO FRAMES", RED);
cap("s2", "clocks", "CLOCKS + CHARGERS", RED);
cap("s2", "completely", "LOOK NORMAL", RED, { boom: 0.3 });
cap("s3", "point", "POINTS ANYWHERE", RED, { boom: 0.3 });
cap("s4", "hole", "TINY HOLE?", VIOLET);
cap("s4", "glass", "GLASS DOT?", GREEN, { boom: 0.3 });
cap("s5", "lights", "LIGHTS OFF", VIOLET);
cap("s5", "glint", "LOOK FOR A GLINT", GREEN, { boom: 0.3 });
cap("s6", "lay", "LAY IT FACE DOWN", GREEN, { boom: 0.3 });
endCard([["FACES THE BED?", 1], ["CHECK IT", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
const FC = [FR.x, FR.y + 0.24, FR.z]; // frame centre
const SH = [
  // s1: from the bed, the frame on the shelf looks back
  { at: 0, K: [[0, [0.4, 1.25, -1.3, FC[0], FC[1], FC[2], 40]], [2.3, [0.6, 1.3, -0.6, FC[0], FC[1], FC[2], 36]]] },
  // s2: close on the small frame, then the lineup
  { at: T.s2, K: st([-0.88, 1.2, 0.7, -0.95, 0.98, DZ, 40], [-0.86, 1.2, 0.85, -0.95, 0.98, DZ, 38]) },
  { at: T.clocks - 0.1, K: st([-0.4, 1.3, -0.6, -0.4, 0.95, DZ, 52], [-0.38, 1.3, -0.4, -0.4, 0.95, DZ, 50]) },
  // s3: from behind the bed, the frame up ahead swings, red lines to the bed
  { at: T.s3, K: st([0.4, 2.4, -2.5, 1.0, 1.0, 1.8, 50], [0.45, 2.35, -2.3, 1.0, 1.0, 1.8, 48]) },
  // s4: close on the frame, then closer on the picture
  { at: T.s4, K: st([FC[0] + 0.07, FC[1] + 0.1, 1.15, FC[0] + 0.06, FC[1] + 0.06, FC[2], 32], [FC[0] + 0.08, FC[1] + 0.1, 1.28, FC[0] + 0.06, FC[1] + 0.06, FC[2], 30]) },
  { at: T.glass - 0.1, K: st([FC[0] + 0.1, FC[1] + 0.08, 1.6, FC[0] + 0.05, FC[1] + 0.05, FC[2], 28], [FC[0] + 0.08, FC[1] + 0.08, 1.72, FC[0] + 0.05, FC[1] + 0.05, FC[2], 26]) },
  // s5: over the guest's shoulder at the shelf, then close on the glint
  { at: T.s5, K: st([1.65, 1.75, -2.45, FC[0], FC[1], FC[2], 40], [1.6, 1.72, -2.25, FC[0], FC[1], FC[2], 38]) },
  { at: T.glint - 0.15, K: st([FC[0] + 0.05, FC[1] + 0.05, 1.7, FC[0] + 0.05, FC[1] + 0.05, FC[2], 28], [FC[0] + 0.05, FC[1] + 0.05, 1.85, FC[0] + 0.05, FC[1] + 0.05, FC[2], 26]) },
  // s6: the shelf from the side, the frame goes face down
  { at: T.s6, K: st([2.2, 1.75, 1.1, FR.x, FR.y + 0.1, FR.z, 46], [2.1, 1.72, 1.3, FR.x, FR.y + 0.1, FR.z, 44]) },
  // s7-s8: calm wide of the bed
  { at: T.s7, calm: 1, K: [[0, [1.6, 2.1, 2.3, -0.2, 0.9, -1.9, 52]], [5, [1.5, 2.2, 2.4, -0.2, 0.9, -1.9, 52]]] },
];

run("picture-frame", (t) => {
  const pul = 0.8 + 0.2 * Math.sin(t * 8);

  // ---- the frame: swings in s3, laid face down in s6 ----
  const sw = sm(T.point - 0.1, T.anywhere, t) * (1 - sm(T.anywhere + 0.2, T.likes + 0.2, t));
  frm.rotation.set(-Math.PI / 2 * sm(T.lay - 0.05, T.down + 0.1, t), H0 + 0.7 * sw * Math.sin((t - T.point) * 4), 0);
  frm.updateMatrixWorld(true);
  lens.getWorldPosition(lp); hole.getWorldPosition(hl); fc.set(0, 0.24, -0.03); frmIn.localToWorld(fc);

  // ---- the guest: by the bed with the phone torch in s5, at the shelf in s6 ----
  const atShelf = t >= T.s6;
  const pos = atShelf ? SHELF : BS;
  const phU = sm(T.flashlight - 0.5, T.flashlight - 0.1, t) * (1 - sm(T.s6 - 0.1, T.s6, t));
  P.set({ x: pos[0], z: pos[1], h: face(pos, atShelf ? [FR.x, FR.z] : [FR.x, FZ]), t, vis: t >= T.s5 - 0.1 && t < T.s7, phone: phU, point: atShelf ? sm(T.lay - 0.2, T.lay + 0.1, t) : 0 });

  // ---- s2: red ring on each thing as it is named, all off on "completely" ----
  for (const k of Object.keys(R2)) {
    R2[k].material.opacity = sm(T[k] - 0.05, T[k] + 0.1, t) * (1 - sm(T.completely - 0.1, T.completely + 0.2, t)) * pul;
    R2[k].scale.setScalar(1 + 0.4 * flash(t, T[k]));
  }

  // ---- s3: red ring on the frame + red sight lines to the bed ----
  const s3a = sm(T.point - 0.1, T.point + 0.1, t) * (1 - sm(T.s4 - 0.1, T.s4, t));
  rFrameBad.position.copy(fc); rFrameBad.quaternion.copy(frm.quaternion); rFrameBad.material.opacity = s3a * pul;
  sight.forEach((b, i) => b.set(fc, BED_PTS[i], s3a * (0.75 + 0.25 * Math.sin(t * 9 + i))));

  // ---- s4: violet ring on the hole, green ring on the glass dot ----
  rHole.position.copy(hl); rHole.quaternion.copy(frm.quaternion);
  rHole.material.opacity = sm(T.hole - 0.05, T.hole + 0.1, t) * (1 - sm(T.s5 - 0.1, T.s5, t)) * pul; rHole.scale.setScalar(1 + 0.5 * flash(t, T.hole));
  rDot.position.copy(lp); rDot.quaternion.copy(frm.quaternion);
  rDot.material.opacity = sm(T.glass - 0.05, T.glass + 0.1, t) * (1 - sm(T.s5 - 0.1, T.s5, t)) * pul; rDot.scale.setScalar(1 + 0.5 * flash(t, T.glass));

  // ---- s5: lights off, torch on the frame, the dot glints ----
  const dark = sm(T.lights - 0.1, T.lights + 0.2, t) * (1 - sm(T.s6 - 0.2, T.s6 + 0.1, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - 0.55 * dark);
  lamp.color.set(0xfff0d8).multiplyScalar(0.8 * (1 - 0.9 * dark));
  P.hands[1].updateWorldMatrix(true, false); P.hands[1].getWorldPosition(hp);
  const fOn = sm(T.flashlight - 0.4, T.flashlight - 0.1, t) * (1 - sm(T.s6 - 0.2, T.s6, t));
  spot.intensity = 7 * fOn; spot.position.copy(hp); spot.target.position.copy(fc); spot.target.updateMatrixWorld();
  fBeam.set(hp, fc, 0.35 * fOn * (t < T.glint - 0.15 ? 1 : 0));
  ph.userData.screen.material.color.set(WHITE).multiplyScalar(1.4 + 2 * fOn);
  const glint = sm(T.glint - 0.2, T.glint, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t));
  lensM.color.set(0x8fa0ff).multiplyScalar(1.0 + 7 * glint * (0.8 + 0.2 * Math.sin(t * 14)));

  // ---- s6: green ring once it lies face down ----
  rDown.material.opacity = sm(T.down, T.down + 0.2, t) * (1 - sm(T.s7 - 0.1, T.s7, t)) * pul;

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
