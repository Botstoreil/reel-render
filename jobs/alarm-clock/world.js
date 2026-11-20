// NEVER IGNORE THE BEDSIDE CLOCK (Hidden Cam). Hotel room, same set as lights-off / usb-charger.
// s1 guest walks into the room, the clock on the right nightstand faces the bed. s2 red: "plugged in" the cord
// glows red, "points straight at you" a red view cone from the clock to the bed. s3 close: a red ring on the tiny lens.
// s4 green: guest leans in, close on the clock face, ring on the "dark hole / glass dot". s5 room dims a little,
// phone flashlight on the clock, glint at "glint". s6 "unplug": the plug leaves the wall, the display goes dark;
// "turn it to face the wall": the clock turns around, green patch. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], plugged: g("s2", "plugged"), points: g("s2", "points"), you: g("s2", "you"),
  s3: S.s3[0], hide: g("s3", "hide"), tiny: g("s3", "tiny"), camera: g("s3", "camera"),
  s4: S.s4[0], closely: g("s4", "closely"), hole: g("s4", "hole"), glass: g("s4", "glass"), dot: g("s4", "dot"),
  s5: S.s5[0], fl: g("s5", "flashlight"), watch: g("s5", "watch"), glint: g("s5", "glint"),
  s6: S.s6[0], unplug: g("s6", "unplug"), turn: g("s6", "turn"), face: g("s6", "face"), wall: g("s6", "wall"),
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
// one lamp on the left nightstand (the clock lives on the right one)
const mLamp = glow(0xffd8a0, 1.1);
scene.add(tube([-1.42, 0.55, -2.82], [-1.42, 0.95, -2.82], 0.025, mat(0x15123f)));
{ const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.2, 24, 1, true), mLamp); shade.position.set(-1.42, 1.02, -2.82); scene.add(shade); }
const mCeil = glow(0xfff0d8, 0.8);
scene.add(box(0.9, 0.04, 0.9, 0, 3.2, -1.2, mCeil, false));
const mGlass = glow(0x6a7cff, 0.7);
scene.add(box(1.3, 1.4, 0.02, 2.9, 1.65, -2.94, mGlass, false));
door(-2.7, -2.9, 0);

// ---------- the clock on the right nightstand, angled at the bed ----------
const CLK = V3(1.3, 0.64, -2.68), AIM = -0.6; // faces (-0.56, 0, 0.83): toward the bed
const clk = new THREE.Group(); clk.position.copy(CLK); clk.rotation.y = AIM; scene.add(clk);
clk.add(box(0.42, 0.18, 0.14, 0, 0, 0, mat(0x1d1950, 0.12)));
// display (canvas) on the front face
const dispMat = (() => {
  const c = document.createElement("canvas"); c.width = 256; c.height = 100; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 100); x.fillStyle = "#fff"; x.font = "900 78px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("23:47", 128, 54);
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false });
})();
const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.11), dispMat); disp.position.set(-0.04, -0.01, 0.0715); clk.add(disp);
// the tiny lens: top right of the face
const LENS_L = V3(0.155, 0.05, 0.072);
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false })); lens.position.copy(LENS_L); clk.add(lens);
const LENS = V3(0, 0, 0);
const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(RED).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0 });
const ring = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.004, 8, 40), ringMat); ring.position.copy(LENS_L).add(V3(0, 0, 0.003)); clk.add(ring);
const okMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0 });
const okRing = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.004, 8, 40), okMat); okRing.position.copy(LENS_L).add(V3(0, 0, 0.004)); clk.add(okRing);
// cord + plug to a wall socket behind the nightstand
const SOCK = V3(1.62, 0.36, -2.94);
scene.add(box(0.1, 0.14, 0.02, SOCK.x, SOCK.y, SOCK.z, mat(0xd8d4ff, 0.2), false));
const mCord = mat(0x2a2470, 0.2);
const plug = box(0.05, 0.06, 0.05, SOCK.x, SOCK.y, SOCK.z + 0.035, mCord); scene.add(plug);
const cord = tube([1.45, 0.58, -2.78], [SOCK.x, SOCK.y, SOCK.z + 0.06], 0.008, mCord); scene.add(cord);

// red "it points at you" view cone, glint, patches
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const viewCone = cone(RED, 1.1), beamCone = cone(WHITE, 0.9);
const BEDMID = V3(0.15, 0.7, -1.7);
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const gl = new THREE.Group(); scene.add(gl);
gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.16, 0.002), mGl));
const bedPatch = patch(1.6, 1.2, RED, 1.0); bedPatch.position.set(0.1, 0.62, -1.7);
const okPatch = patch(0.6, 0.45, GREEN, 1.2); okPatch.position.set(1.3, 0.56, -2.6);
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [0.6, 2.9], SPOT = [0.75, -0.9];
const tArr = S.s1[0] + 2.1, hFace = face(SPOT, [1.3, -2.68]);
const hp = V3(0, 0, 0);

// ---------- text ----------
title("NEVER IGNORE THE BEDSIDE CLOCK");
cap("s2", "plugged", "PLUGGED IN ALL NIGHT", RED);
cap("s2", "points", "POINTS AT YOUR BED", RED, { boom: 0.35 });
cap("s3", "hide", "EASY TO HIDE", RED);
cap("s3", "camera", "A TINY CAMERA", RED, { boom: 0.4 });
cap("s4", "closely", "LOOK CLOSELY", GREEN);
cap("s4", "hole", "DARK HOLE", GREEN);
cap("s4", "glass", "GLASS DOT", GREEN);
cap("s5", "flashlight", "FLASHLIGHT ON IT", VIOLET);
cap("s5", "glint", "WATCH FOR A GLINT", GREEN, { boom: 0.45 });
cap("s6", "unplug", "UNPLUG IT", GREEN);
cap("s6", "turn", "OR FACE THE WALL", GREEN, { boom: 0.35 });
endCard([["CHECK THE CLOCK", 1], ["TURN IT AWAY", 1]]);

// ---------- shots ----------
// close on the clock face: camera ~0.75 in front of it along its aim, a bit above
const CL = [CLK.x - 0.42, 0.8, CLK.z + 0.62, CLK.x, CLK.y, CLK.z];
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: room with the clock glowing on the right
  { at: 0, K: [[0, [0.2, 2.2, 4.4, 0.4, 1.0, -2.2, 50]], [2.5, [0.3, 2.1, 3.7, 0.5, 1.0, -2.2, 50]]] },
  // s2: "plugged in": medium on nightstand + cord; "points at you": wide over the bed, red cone
  { at: T.s2, K: st([0.5, 1.2, -1.2, 1.4, 0.55, -2.8, 44], [0.55, 1.2, -1.35, 1.4, 0.55, -2.8, 44]) },
  { at: T.points - 0.1, K: st([-1.2, 2.0, 0.6, 0.6, 0.6, -2.1, 50], [-1.1, 1.95, 0.4, 0.6, 0.6, -2.1, 50]) },
  // s3: close on the clock, red ring on the lens
  { at: T.s3, K: st([...CL.slice(0, 3), ...CL.slice(3), 36], [CL[0] + 0.03, CL[1], CL[2] - 0.08, ...CL.slice(3), 34]) },
  // s4: guest leans in (three-quarter from the left), then close on the face at "hole"
  { at: T.s4, K: st([-0.3, 1.7, 0.4, 1.1, 0.8, -2.3, 46], [-0.25, 1.68, 0.25, 1.1, 0.8, -2.3, 46]) },
  { at: T.hole - 0.2, K: st([CL[0] + 0.12, 0.74, CL[2] - 0.25, CLK.x + 0.08, CLK.y + 0.03, CLK.z, 32], [CL[0] + 0.14, 0.74, CL[2] - 0.3, CLK.x + 0.08, CLK.y + 0.03, CLK.z, 30]) },
  // s5: behind the guest, beam on the clock; glint close
  { at: T.s5, K: st([-0.1, 1.85, 0.9, 1.2, 0.75, -2.7, 50], [-0.05, 1.8, 0.7, 1.2, 0.75, -2.7, 50]) },
  { at: T.glint - 0.25, K: st([...CL.slice(0, 3), ...CL.slice(3), 34], [CL[0] + 0.03, CL[1], CL[2] - 0.06, ...CL.slice(3), 32]) },
  // s6: medium on nightstand: plug out, clock turns to the wall
  { at: T.s6, K: st([0.6, 1.3, -1.0, 1.35, 0.55, -2.75, 44], [0.62, 1.28, -1.15, 1.35, 0.55, -2.75, 44]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.2, 2.2, 4.2, 0.3, 1.3, -2.0, 52]], [5, [0.2, 2.5, 5.0, 0.3, 1.3, -2.0, 52]]] },
];

run("alarm-clock", (t) => {
  // room dims a little for the flashlight (s5), comes back at s7
  const dim = 0.55 * sm(T.s5 - 0.1, T.fl, t) * (1 - sm(T.s7, T.s7 + 0.5, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - dim);
  mLamp.color.set(0xffd8a0).multiplyScalar(1.1 * (1 - 0.8 * dim));
  mCeil.color.set(0xfff0d8).multiplyScalar(0.8 * (1 - 0.9 * dim));
  mGlass.color.set(0x6a7cff).multiplyScalar(0.7 * (1 - 0.6 * dim));

  // guest walks in, stands by the bed facing the clock, leans at s4
  const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
  const lean = sm(T.s4, T.closely, t) * (1 - sm(T.s6 + 0.3, T.s6 + 0.8, t));
  const ph1 = sm(T.s5 - 0.2, T.fl - 0.1, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.5, t));
  P.set({ x: w.x + 0.12 * lean, z: w.z - 0.25 * lean, h: w.h + (hFace - w.h) * k, walk: w.walk, t, vis: true, phone: ph1, look: 0 });

  // s6: plug out at "unplug" (display dark), clock turns to the wall at "turn"
  const out = sm(T.unplug, T.unplug + 0.3, t);
  plug.position.z = SOCK.z + 0.035 + 0.16 * out; plug.position.y = SOCK.y - 0.1 * out;
  dispMat.color.set(VIOLET).multiplyScalar(1.3 * (1 - out) + 0.02);
  const turn = sm(T.turn, T.wall, t);
  clk.rotation.y = AIM + (-Math.PI - AIM) * turn;
  clk.updateMatrixWorld(true); lens.getWorldPosition(LENS);

  // s2: cord glows red at "plugged", red view cone from the lens to the bed at "points"
  mCord.emissive.set(RED).multiplyScalar(0.9 * sm(T.plugged - 0.1, T.plugged + 0.15, t) * (1 - sm(T.points + 0.2, T.points + 0.5, t)) + 0.05);
  const vA = sm(T.points - 0.1, T.points + 0.2, t) * (1 - sm(T.s3 + 0.1, T.s3 + 0.4, t));
  viewCone.set(LENS, BEDMID, 0.75, 0.09 * vA);
  bedPatch.set(sm(T.you - 0.1, T.you + 0.1, t) * (1 - sm(T.s3, T.s3 + 0.3, t)));
  // s3 red ring on the lens; s4 green ring at "hole" / "dot"
  ringMat.opacity = sm(T.tiny - 0.1, T.tiny + 0.1, t) * (1 - sm(T.s4, T.s4 + 0.25, t)) * (0.8 + 0.2 * Math.sin(t * 8));
  okMat.opacity = sm(T.hole - 0.1, T.hole + 0.1, t) * (1 - sm(T.s5 + 0.2, T.s5 + 0.5, t)) * (0.85 + 0.15 * Math.sin(t * 8));

  // s5: flashlight from the phone onto the clock, glint at "glint"
  const on = sm(T.fl - 0.25, T.fl + 0.05, t) * (1 - sm(T.s6 - 0.05, T.s6 + 0.2, t));
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  beamCone.set(hp, LENS, 0.2, 0.06 * on);
  spot.intensity = 1.3 * on; spot.position.copy(hp); spot.target.position.copy(LENS); spot.target.updateMatrixWorld();
  const gA = on * sm(T.watch - 0.1, T.glint, t) * (0.55 + 0.45 * flash(t, T.glint));
  gl.visible = gA > 0.02; gl.position.copy(LENS).add(V3(-0.56 * 0.02, 0, 0.83 * 0.02));
  gl.scale.setScalar(Math.max(0.01, gA * (1 + 0.15 * Math.sin(t * 17)))); gl.rotation.z = 0.3 * Math.sin(t * 1.3);
  ph.userData.screen.material.color.set(WHITE).multiplyScalar(1.4 + 2 * flash(t, T.glint));
  okPatch.set(sm(T.wall - 0.1, T.wall + 0.2, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.2, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
