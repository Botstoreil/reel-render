// NEVER SKIP THE BATHROOM (Hidden Cam). Bathroom on the left (shower corner, toilet), bedroom past a divider on the right.
// s1 wide bathroom, title. s2 guest checks the bed with the phone (bedroom shot), then on "then" walks into the shower;
// red patch on the shower floor at "look". s3 red rings pop on the hook, the vent and the air freshener on their words,
// red view cones from all three to the shower on "face". s4 guest outside, green floor patches on the shower ("shower")
// and the toilet ("toilet"). s5 room dims, phone flashlight sweeps hook -> freshener, glint on the freshener's tiny hole.
// s6 tape covers the hole ("cover"), phone flash ("photos"), phone screen turns green ("tell"). s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, shoot, run } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, room, solid, unclip } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  s2: S.s2[0], bedroom: g("s2", "bedroom"), then: g("s2", "then"), shower2: g("s2", "shower"), second: g("s2", "second"), look: g("s2", "look"),
  s3: S.s3[0], hooks: g("s3", "hooks"), vents: g("s3", "vents"), air: g("s3", "air"), face: g("s3", "face"),
  s4: S.s4[0], points: g("s4", "points"), shower4: g("s4", "shower"), toilet: g("s4", "toilet"),
  s5: S.s5[0], fl: g("s5", "flashlight"), holes: g("s5", "holes"), shiny: g("s5", "shiny"), dots: g("s5", "dots"),
  s6: S.s6[0], cover: g("s6", "cover"), photos: g("s6", "photos"), tell: g("s6", "tell"), platform: g("s6", "platform"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- bathroom: left wall, tiles, shower corner, toilet ----------
scene.add(box(0.1, 3.2, 6, -2.5, 1.6, 0, solid(0x15123f), false));
const mTile = glow(0x8a80ff, 0.35);
for (let y = 0.4; y < 2.6; y += 0.4) scene.add(box(1.55, 0.008, 0.01, -1.68, y, -2.94, mTile, false));
for (let x = -2.4; x <= -0.9; x += 0.38) scene.add(box(0.008, 2.4, 0.01, x, 1.2, -2.94, mTile, false));
const tray = box(1.55, 0.08, 1.0, -1.68, 0.04, -2.45, mat(0xe8e4ff, 0.15)); scene.add(tray);
const mGlassS = new THREE.MeshBasicMaterial({ color: new THREE.Color(VIOLET).multiplyScalar(0.5), transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide });
const glassSide = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0), mGlassS); glassSide.rotation.y = Math.PI / 2; glassSide.position.set(-0.9, 1.05, -2.6); scene.add(glassSide);
scene.add(box(0.02, 2.0, 0.02, -0.9, 1.05, -2.2, glow(WHITE, 0.6), false));
// shower head on the back wall
scene.add(tube([-1.68, 1.4, -2.94], [-1.68, 2.15, -2.94], 0.015, mat(0xd8d4ff, 0.3)));
scene.add(tube([-1.68, 2.15, -2.94], [-1.68, 2.15, -2.7], 0.015, mat(0xd8d4ff, 0.3)));
{ const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.04, 20), mat(0xd8d4ff, 0.4)); hd.position.set(-1.68, 2.12, -2.66); scene.add(hd); }
const showerRed = patch(1.4, 0.9, RED, 1.0); showerRed.position.set(-1.68, 0.1, -2.45);
const showerOk = patch(1.4, 0.9, GREEN, 1.0); showerOk.position.set(-1.68, 0.1, -2.45);
// toilet against the back wall, front faces +z
const toilet = new THREE.Group(); toilet.position.set(0.95, 0, -2.6); scene.add(toilet);
toilet.add(box(0.42, 0.42, 0.55, 0, 0.21, 0.05, mat(0xf0eeff, 0.15)));
toilet.add(box(0.44, 0.04, 0.5, 0, 0.44, 0.08, mat(0x9a90ff, 0.25)));
toilet.add(box(0.44, 0.42, 0.18, 0, 0.62, -0.22, mat(0xf0eeff, 0.15)));
solid(toilet);
const toiletOk = patch(0.75, 0.9, GREEN, 1.0); toiletOk.position.set(0.95, 0.03, -2.45);
// divider wall to the bedroom
scene.add(box(0.1, 2.6, 1.6, 1.45, 1.3, -2.2, solid(0x221d5a), false));

// ---------- the three things that face the shower ----------
// hook (back wall, right of the shower), vent (high on the back wall), air freshener (shelf, turned toward the shower)
const HOOK = V3(-0.55, 1.65, -2.93), VENT = V3(-0.45, 2.2, -2.93); // round 2: vent lower, out of the title band
scene.add(box(0.08, 0.12, 0.02, HOOK.x, HOOK.y, HOOK.z, mat(0xd8d4ff, 0.35), false));
scene.add(tube([HOOK.x, HOOK.y - 0.02, HOOK.z + 0.01], [HOOK.x, HOOK.y + 0.02, HOOK.z + 0.1], 0.012, mat(0xd8d4ff, 0.35)));
scene.add(box(0.36, 0.24, 0.03, VENT.x, VENT.y, VENT.z, mat(0xc8c4ff, 0.25), false));
for (let i = -2; i <= 2; i++) scene.add(box(0.3, 0.012, 0.01, VENT.x, VENT.y + i * 0.04, VENT.z + 0.02, mat(0x15123f, 0.05), false));
scene.add(box(0.36, 0.03, 0.16, 0.3, 1.38, -2.9, mat(0x4a40c0), false)); // shelf
const AIM = -0.7; // faces (-0.64, 0, 0.76): toward the shower
const fr = new THREE.Group(); fr.position.set(0.3, 1.395, -2.88); fr.rotation.y = AIM; scene.add(fr);
{ const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 24), mat(0xf4f2ff, 0.2)); c.position.y = 0.1; fr.add(c); }
{ const c = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.05, 24), mat(0x6a5cff, 0.4)); c.position.y = 0.225; fr.add(c); }
const LENS_L = V3(0, 0.15, 0.046);
const lensM = new THREE.Mesh(new THREE.SphereGeometry(0.007, 14, 10), new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false })); lensM.position.copy(LENS_L); fr.add(lensM);
const tape = box(0.06, 0.04, 0.008, 0, 0.15, 0.05, mat(0x3dd68c, 0.5), false); fr.add(tape);
const LENS = V3(0, 0, 0);
function ringOf(hex, r) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, depthTest: false });
  const o = new THREE.Mesh(new THREE.TorusGeometry(r, 0.006, 8, 40), m); o.renderOrder = 21; return o;
}
const rHook = ringOf(RED, 0.11); rHook.position.copy(HOOK).add(V3(0, 0, 0.06)); scene.add(rHook);
const rVent = ringOf(RED, 0.24); rVent.position.copy(VENT).add(V3(0, 0, 0.04)); scene.add(rVent);
const rFr = ringOf(RED, 0.16); rFr.position.set(0, 0.12, 0.08); fr.add(rFr);
const okRing = ringOf(GREEN, 0.03); okRing.position.copy(LENS_L).add(V3(0, 0, 0.006)); fr.add(okRing);

// red view cones from each object to the shower, flashlight cone, glint
function cone(hex, k) {
  const geo = new THREE.ConeGeometry(1, 1, 32, 1, true); geo.translate(0, -0.5, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  m.renderOrder = 6; m.visible = false; scene.add(m);
  const down = V3(0, -1, 0), d = V3(0, 0, 0);
  m.set = (A, B, r, a) => { m.visible = a > 0.01; if (!m.visible) return; d.subVectors(B, A); const L = d.length(); m.position.copy(A); m.quaternion.setFromUnitVectors(down, d.normalize()); m.scale.set(r, L, r); m.material.opacity = a; };
  return m;
}
const cones = [cone(RED, 1.1), cone(RED, 1.1), cone(RED, 1.1)], beamCone = cone(WHITE, 0.9);
const SHOWER = V3(-1.6, 1.15, -2.3);
const mGl = new THREE.MeshBasicMaterial({ color: new THREE.Color(WHITE).multiplyScalar(2.4), toneMapped: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const gl = new THREE.Group(); scene.add(gl);
gl.add(new THREE.Mesh(new THREE.SphereGeometry(0.01, 12, 10), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.004, 0.002), mGl), new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.14, 0.002), mGl));

// ---------- bedroom past the divider ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.5, 0.3, 2.0, 3.1, 0.2, -1.95, mat(0x4a40c0)));
bed.add(box(1.4, 0.2, 1.9, 3.1, 0.45, -1.93, mat(0xe8e4ff, 0.12)));
bed.add(box(1.5, 0.9, 0.08, 3.1, 0.7, -2.95, mat(0x2e2890)));
solid(bed);
const mLamp = glow(0xffd8a0, 1.0);
scene.add(box(0.4, 0.04, 0.4, 0, 3.15, -1.8, glow(0xfff0d8, 0.8), false));
scene.add(box(0.5, 0.04, 0.5, 3.1, 3.15, -1.5, mLamp, false));
const LIGHTS = []; scene.traverse((o) => { if (o.isLight) LIGHTS.push([o, o.intensity]); });
const spot = new THREE.SpotLight(0xfff4e0, 0, 12, 0.2, 0.6, 1); scene.add(spot, spot.target);

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const BEDSPOT = [2.6, -0.5], IN0 = [0.7, -0.9], IN1 = [-1.55, -2.1], OUT = [0.0, -0.75];
const hp = V3(0, 0, 0), aimP = V3(0, 0, 0);

// ---------- text ----------
title("NEVER SKIP THE BATHROOM");
cap("s2", "bedroom", "BEDROOM: CHECKED", RED);
cap("s2", "shower", "SHOWER: NO LOOK", RED, { boom: 0.35 });
cap("s3", "hooks", "HOOKS + VENTS", RED);
cap("s3", "air", "AIR FRESHENERS", RED);
cap("s3", "face", "FACING THE SHOWER", RED, { boom: 0.4 });
cap("s4", "points", "WHAT POINTS AT", GREEN);
cap("s4", "shower", "THE SHOWER", GREEN);
cap("s4", "toilet", "THE TOILET", GREEN, { boom: 0.3 });
cap("s5", "flashlight", "FLASHLIGHT ON", VIOLET);
cap("s5", "holes", "SMALL HOLES", GREEN);
cap("s5", "shiny", "SHINY DOTS", GREEN, { boom: 0.4 });
cap("s6", "cover", "COVER IT", GREEN);
cap("s6", "photos", "TAKE PHOTOS", GREEN);
cap("s6", "tell", "TELL THE PLATFORM", GREEN, { boom: 0.3 });
endCard([["BEDROOM FIRST", 1], ["BATHROOM TOO", 1]]);

// ---------- shots: [cx, cy, cz, lookx, looky, lookz, fov] ----------
const st = (a, b = a) => [[0, a], [3, b]];
// close on the freshener: camera ~0.7 in front of it along its aim, a bit above
const FRC = [0.3 - 0.45, 1.65, -2.88 + 0.55, 0.3, 1.52, -2.88];
const SH = [
  // hook: wide bathroom, shower left, toilet right
  { at: 0, K: [[0, [-0.4, 1.9, 3.2, -0.5, 1.45, -2.4, 50]], [2.5, [-0.4, 1.85, 2.6, -0.5, 1.45, -2.4, 50]]] },
  // s2: bedroom, guest checks the bed; on "then" the bathroom, guest walks into the shower
  { at: T.s2, K: st([2.2, 1.9, 1.7, 3.0, 0.8, -1.9, 48], [2.3, 1.85, 1.5, 3.0, 0.8, -1.9, 48]) },
  // round 3: aim higher so the vent drops below the caption band
  { at: T.then - 0.05, K: st([-0.5, 1.9, 1.9, -1.0, 1.3, -2.2, 48], [-0.6, 1.85, 1.6, -1.1, 1.3, -2.2, 48]) },
  // s3: shower + hook + vent + freshener from the front right
  { at: T.s3, K: st([0.35, 1.8, 1.0, -0.6, 1.75, -2.6, 52], [0.3, 1.8, 0.8, -0.6, 1.75, -2.6, 52]) },
  // s4: guest in front, the shower and the toilet behind
  { at: T.s4, K: st([0.2, 2.3, 2.4, -0.3, 1.1, -2.2, 52], [0.2, 2.25, 2.1, -0.3, 1.1, -2.2, 52]) },
  // s5: flashlight sweep from the side, then close on the freshener for the holes / glint
  { at: T.s5, K: st([-1.3, 1.7, 0.6, 0.0, 1.4, -2.6, 50], [-1.2, 1.7, 0.5, 0.0, 1.4, -2.6, 50]) },
  { at: T.holes - 0.2, K: st([...FRC, 36], [FRC[0] + 0.03, FRC[1], FRC[2] - 0.06, ...FRC.slice(3), 34]) },
  // s6: close for "cover", medium on the guest with the phone for "photos" / "tell"
  { at: T.s6, K: st([...FRC, 38], [FRC[0] + 0.03, FRC[1], FRC[2] - 0.06, ...FRC.slice(3), 36]) },
  { at: T.photos + 0.05, K: st([-1.0, 1.75, 0.9, 0.1, 1.3, -1.6, 48], [-0.9, 1.72, 0.8, 0.1, 1.3, -1.6, 48]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.2, 2.2, 4.0, -0.2, 1.3, -2.2, 52]], [5, [0.2, 2.4, 4.8, -0.2, 1.3, -2.2, 52]]] },
];

run("bathroom", (t) => {
  // room dims for the flashlight (s5), back at s6 photos
  const dim = 0.55 * sm(T.s5 - 0.1, T.fl, t) * (1 - sm(T.s6 + 0.2, T.s6 + 0.6, t));
  for (const [l, i0] of LIGHTS) l.intensity = i0 * (1 - dim);
  mTile.color.set(0x8a80ff).multiplyScalar(0.35 * (1 - 0.7 * dim));
  mLamp.color.set(0xffd8a0).multiplyScalar(1.0 * (1 - 0.8 * dim));

  // guest: by the bed until "then"; walks into the shower; s4 onward stands in the middle facing the back wall
  let x, z, h, walk = 0;
  if (t < T.then - 0.05) { x = BEDSPOT[0]; z = BEDSPOT[1]; h = face(BEDSPOT, [3.1, -1.9]); }
  else if (t < T.s4) {
    const w = walkPath(IN0, IN1, T.then, T.second + 0.1, t); x = w.x; z = w.z; walk = w.walk;
    h = w.h + (Math.PI - w.h) * sm(T.second + 0.05, T.look + 0.3, t); // arrives, turns to face out
  } else {
    x = OUT[0]; z = OUT[1];
    const hS = face(OUT, [-1.6, -2.4]), hF = face(OUT, [0.3, -2.88]);
    h = hS + (hF - hS) * sm(T.fl - 0.3, T.holes, t);
  }
  const phU = sm(T.s2, T.s2 + 0.3, t) * (1 - sm(T.then - 0.2, T.then, t)) + sm(T.s5 - 0.2, T.fl - 0.1, t);
  P.set({ x, z, h, walk, t, vis: true, phone: Math.min(1, phU), look: 0 });

  // s2: red patch on the shower floor and the glass at "look"
  const noLook = sm(T.look - 0.15, T.look + 0.1, t) * (1 - sm(T.s3 + 0.1, T.s3 + 0.4, t));
  showerRed.set(noLook);
  mGlassS.color.set(VIOLET).multiplyScalar(0.5).lerp(new THREE.Color(RED), 0.8 * noLook);
  // s3: red rings on their words, red cones to the shower on "face"
  const off3 = 1 - sm(T.s4 - 0.1, T.s4 + 0.2, t), pul = 0.8 + 0.2 * Math.sin(t * 8);
  rHook.material.opacity = sm(T.hooks - 0.05, T.hooks + 0.1, t) * off3 * pul; rHook.scale.setScalar(1 + 0.4 * flash(t, T.hooks));
  rVent.material.opacity = sm(T.vents - 0.05, T.vents + 0.1, t) * off3 * pul; rVent.scale.setScalar(1 + 0.4 * flash(t, T.vents));
  rFr.material.opacity = sm(T.air - 0.05, T.air + 0.1, t) * off3 * pul; rFr.scale.setScalar(1 + 0.4 * flash(t, T.air));
  fr.updateMatrixWorld(true); lensM.getWorldPosition(LENS);
  const cA = sm(T.face - 0.1, T.face + 0.2, t) * off3;
  cones[0].set(HOOK.clone().add(V3(0, 0, 0.08)), SHOWER, 0.45, 0.08 * cA);
  cones[1].set(VENT.clone().add(V3(0, 0, 0.05)), SHOWER, 0.55, 0.08 * cA);
  cones[2].set(LENS, SHOWER, 0.5, 0.08 * cA);
  // s4: green patches on the shower floor and in front of the toilet
  const off4 = 1 - sm(T.s5 - 0.1, T.s5 + 0.2, t);
  showerOk.set(sm(T.shower4 - 0.1, T.shower4 + 0.1, t) * off4);
  toiletOk.set(sm(T.toilet - 0.1, T.toilet + 0.1, t) * off4);

  // s5: flashlight from the phone sweeps hook -> freshener, glint on the hole at "shiny"
  const on = sm(T.fl - 0.25, T.fl + 0.05, t) * (1 - sm(T.s6 - 0.05, T.s6 + 0.2, t));
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);
  aimP.copy(HOOK).lerp(LENS, sm(T.fl + 0.2, T.holes, t));
  beamCone.set(hp, aimP, 0.2, 0.06 * on);
  spot.intensity = 1.3 * on; spot.position.copy(hp); spot.target.position.copy(aimP); spot.target.updateMatrixWorld();
  const gA = on * sm(T.holes, T.shiny, t) * (0.55 + 0.45 * flash(t, T.shiny));
  gl.visible = gA > 0.02; gl.position.copy(LENS).add(V3(-0.64 * 0.01, 0, 0.76 * 0.01));
  gl.scale.setScalar(Math.max(0.01, 0.6 * gA * (1 + 0.15 * Math.sin(t * 17)))); gl.rotation.z = 0.3 * Math.sin(t * 1.3);

  // s6: tape slides over the hole at "cover" (green ring), phone flash at "photos", screen green at "tell"
  const cov = sm(T.cover - 0.2, T.cover + 0.1, t);
  tape.visible = cov > 0.01; tape.position.set(0, 0.15 + 0.12 * (1 - cov), 0.05); tape.scale.setScalar(Math.max(0.01, cov));
  okRing.material.opacity = sm(T.cover + 0.1, T.cover + 0.3, t) * (1 - sm(T.s7 - 0.1, T.s7 + 0.2, t));
  const fl6 = flash(t, T.photos + 0.2);
  // round 2: the photo flash lights the freshener (was invisible behind the guest)
  if (fl6 > 0.01) { spot.intensity = 5 * fl6; spot.position.copy(hp); spot.target.position.copy(LENS); spot.target.updateMatrixWorld(); }
  const grn = sm(T.tell - 0.1, T.tell + 0.2, t) * (1 - sm(T.s8 - 0.2, T.s8 + 0.2, t));
  ph.userData.screen.material.color.set(WHITE).lerp(new THREE.Color(GREEN), grn).multiplyScalar(1.4 + 2 * flash(t, T.shiny) + 2.5 * fl6);

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
