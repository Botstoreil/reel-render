// NEVER SKIP THE WI-FI SCAN (Hidden Cam). Hotel/Airbnb room, same set as usb-charger.
// s1 guest walks in with a phone, router on the right nightstand. s2 red: a hidden camera (in a wall charger) sends video
// packets to the router. s3 red: every device on the network lights up, the camera among them. s4 green: the guest's phone
// joins the Wi-Fi, a scan ring sweeps the room and rings each device. s5: the laptop matches (check), the charger does not
// (alert). s6: a clock camera with no Wi-Fi line stays dark to the scan, the guest checks it by hand. s7-s8 calm wide.
import { THREE, S, g, sm, flash, scene, bloom, glow, box, tube, VIOLET, RED, GREEN, WHITE, mSolid, patch, beam, shoot } from "./kit.js";
import { run } from "./kit.js";
import { cap, title, endCard, overlays } from "./extra.js";
import { human, walkPath, face, phone, door, room, solid, unclip, icon, pop, laptop } from "./parts.js";

room({ w: 10, d: 8, wallZ: -3 });
scene.fog.density = 0.018;
const mat = (hex, em = 0.25) => { const m = mSolid.clone(); m.color.set(hex).multiplyScalar(0.6); m.emissive.set(hex).multiplyScalar(em); return m; };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- timing (every word copied from words.json) ----------
const T = {
  wifi1: g("s1", "wifi"), s2: S.s2[0], hidden: g("s2", "hidden"), video: g("s2", "video"), wifi2: g("s2", "wifi"),
  s3: S.s3[0], show: g("s3", "show"), devices: g("s3", "devices"), network: g("s3", "network"),
  s4: S.s4[0], join: g("s4", "join"), scan: g("s4", "scan"), every: g("s4", "every"), connected: g("s4", "connected"), device4: g("s4", "device"),
  s5: S.s5[0], camera: g("s5", "camera"), match: g("s5", "match"), room5: g("s5", "room"),
  s6: S.s6[0], miss: g("s6", "miss"), offline: g("s6", "offline"), check: g("s6", "check"), room6: g("s6", "room"),
  s7: S.s7[0], s8: S.s8[0],
};

// ---------- the room ----------
const bed = new THREE.Group(); scene.add(bed);
bed.add(box(1.9, 0.3, 2.1, 0, 0.2, -1.9, mat(0x4a40c0)));
bed.add(box(1.8, 0.22, 2.0, 0, 0.46, -1.88, mat(0xe8e4ff, 0.12)));
bed.add(box(1.84, 0.06, 1.25, 0, 0.6, -1.42, mat(0x6a5cff, 0.22)));
bed.add(box(1.9, 1.0, 0.08, 0, 0.75, -2.9, mat(0x2e2890)));
for (const x of [-0.45, 0.45]) bed.add(box(0.7, 0.14, 0.4, x, 0.64, -2.6, mat(0xffffff, 0.15)));
solid(bed);
const NS = [-1.3, 1.3].map((x) => { const n = box(0.5, 0.55, 0.45, x, 0.275, -2.7, mat(0x4a40c0)); scene.add(n); return n; });
solid(...NS);
const WX = 2.9, mGlass = glow(0x6a7cff, 0.9);
scene.add(box(1.3, 1.4, 0.02, WX, 1.65, -2.94, mGlass, false));
for (const s of [-1, 1]) scene.add(box(0.7, 1.75, 0.05, WX + s * 0.95, 1.62, -2.85, mat(0x5a4fd0, 0.3)));
door(-2.7, -2.9, 0);

// ---------- router on the right nightstand: body, two antennas, blinking LEDs ----------
const RT = V3(1.3, 0.6, -2.7);
scene.add(box(0.38, 0.07, 0.24, RT.x, RT.y, RT.z, mat(0x1d1850, 0.2)));
for (const dx of [-0.13, 0.13]) scene.add(tube([RT.x + dx, RT.y + 0.03, RT.z - 0.1], [RT.x + dx * 1.3, RT.y + 0.32, RT.z - 0.12], 0.012, mat(0x1d1850, 0.2)));
const leds = [-0.1, -0.03, 0.04, 0.11].map((dx) => { const m = glow(GREEN, 1.6); scene.add(box(0.03, 0.012, 0.004, RT.x + dx, RT.y + 0.01, RT.z + 0.122, m, false)); return m; });
const RTX = V3(RT.x, RT.y + 0.06, RT.z);

// ---------- devices on the network ----------
// 1) hidden camera inside a spare USB wall charger over the left nightstand
const PLATE = V3(-1.3, 0.86, -2.94);
scene.add(box(0.16, 0.2, 0.02, PLATE.x, PLATE.y, PLATE.z, mat(0xd8d4ff, 0.2), false));
const CHG = V3(-1.3, 0.86, -2.87);
scene.add(box(0.12, 0.14, 0.1, CHG.x, CHG.y, CHG.z, mat(0xffffff, 0.32)));
const lensMat = new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false });
const lens = new THREE.Mesh(new THREE.SphereGeometry(0.011, 16, 12), lensMat); lens.position.set(CHG.x, CHG.y + 0.03, CHG.z + 0.052); scene.add(lens);
// 2) the guest's own laptop on the foot of the bed (a device you CAN match)
laptop(0.35, -1.25, 0, { y: 0.63 });
const LAP = V3(0.35, 0.85, -1.25);
// 3) an offline clock camera on the left nightstand (records to a card, no Wi-Fi)
const CLK = V3(-1.3, 0.62, -2.62);
scene.add(box(0.3, 0.14, 0.12, CLK.x, CLK.y, CLK.z - 0.04, mat(0x15123f, 0.1)));
{
  const c = document.createElement("canvas"); c.width = 256; c.height = 100; const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 256, 100); x.fillStyle = "#fff"; x.font = "900 78px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("23:47", 128, 54);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(VIOLET).multiplyScalar(1.3), toneMapped: false }));
  f.position.set(CLK.x, CLK.y, CLK.z + 0.025); scene.add(f);
}
const clkLens = new THREE.Mesh(new THREE.SphereGeometry(0.008, 12, 10), new THREE.MeshBasicMaterial({ color: 0x050410, toneMapped: false })); clkLens.position.set(CLK.x + 0.11, CLK.y + 0.045, CLK.z + 0.025); scene.add(clkLens);
const clkPatch = patch(0.6, 0.45, RED, 1.2); clkPatch.position.set(CLK.x, 0.56, CLK.z + 0.05);

// ---------- Wi-Fi links: a line from each device to the router, packets travelling along it ----------
function link(hex) {
  const b = beam(hex, 1.6, 0.008);
  const dots = [0, 1, 2].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), glow(hex, 2.2)); d.visible = false; scene.add(d); return d; });
  return { set(A, B, a, t, speed = 1.2) { b.set(A, B, 0.5 * a); dots.forEach((d, i) => { d.visible = a > 0.02; if (!d.visible) return; const u = (t * speed + i / 3) % 1; d.position.copy(A).lerp(B, u); d.scale.setScalar(0.4 + 0.6 * a); }); } };
}
const camLink = link(RED), lapLink = link(VIOLET), phLink = link(GREEN);

// scan ring from the router across the room
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
ring.rotation.x = -Math.PI / 2; scene.add(ring);
const devRing = () => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.007, 8, 40), new THREE.MeshBasicMaterial({ color: new THREE.Color(GREEN).multiplyScalar(2), toneMapped: false, transparent: true, opacity: 0 })); scene.add(m); return m; };
const rCam = devRing(), rLap = devRing(), rPh = devRing();

// icons over devices
const icAlert = icon("alert", RED, { size: 0.26 }), icCheck = icon("check", GREEN, { size: 0.24 }), icCross = icon("cross", RED, { size: 0.22 });
const icAlert2 = icon("alert", RED, { size: 0.22 });

// ---------- the guest ----------
const P = human({ hex: 0x3d7bff });
const ph = P.hold(phone(WHITE));
const START = [-0.4, 2.9], SPOT = [-0.3, 0.3];
const tArr = S.s1[0] + 1.9, hFace = face(SPOT, [0, -2.8]);
const hp = V3(0, 0, 0);
const flCone = beam(WHITE, 1.0, 0.05);

// ---------- text ----------
title("NEVER SKIP THE WI-FI SCAN");
cap("s2", "hidden", "HIDDEN CAMERAS", RED, { boom: 0.4 });
cap("s2", "video", "SEND VIDEO", RED);
cap("s2", "wifi", "OVER WI-FI", RED);
cap("s3", "show", "THEY SHOW UP", RED, { boom: 0.3 });
cap("s3", "network", "ON THE NETWORK", RED);
cap("s4", "join", "JOIN THE WI-FI", GREEN);
cap("s4", "scan", "SCAN EVERY DEVICE", VIOLET, { boom: 0.35 });
cap("s5", "camera", "CAMERA NAME?", GREEN, { boom: 0.3 });
cap("s5", "match", "NO MATCH?", GREEN);
cap("s6", "miss", "SCANS CAN MISS", VIOLET);
cap("s6", "offline", "OFFLINE CAMS", VIOLET);
cap("s6", "check", "CHECK THE ROOM", GREEN, { boom: 0.3 });
endCard([["JOIN THE WI-FI", 1], ["SCAN IT FIRST", 1]]);

// ---------- shots ----------
const st = (a, b = a) => [[0, a], [3, b]];
const SH = [
  // hook: the room, guest walks in looking at the phone
  { at: 0, K: [[0, [0.6, 2.2, 4.4, 0.0, 1.0, -2.2, 50]], [2.2, [0.4, 2.1, 3.6, 0.0, 1.0, -2.2, 50]]] },
  // "Wi-Fi": the router
  { at: T.wifi1 - 0.15, K: st([0.95, 1.05, -1.75, 1.3, 0.7, -2.7, 40], [1.0, 1.02, -1.9, 1.3, 0.7, -2.7, 38]) },
  // s2 "hidden cameras": the charger, red lens
  { at: T.hidden - 0.05, K: st([-1.05, 0.95, -2.05, -1.3, 0.86, -2.88, 32], [-1.08, 0.93, -2.15, -1.3, 0.86, -2.88, 30]) },
  // "video over the Wi-Fi": wide across the bed head, red packets charger -> router
  { at: T.video - 0.1, K: st([0.0, 1.5, -0.6, 0.0, 0.75, -2.75, 52], [0.0, 1.45, -0.8, 0.0, 0.75, -2.75, 52]) },
  // s3: high three-quarter, every device lights up
  { at: T.s3, K: st([2.4, 2.4, 1.3, -0.2, 0.75, -2.0, 50], [2.2, 2.35, 1.0, -0.2, 0.75, -2.0, 50]) },
  // s4: behind the guest, the phone joins, scan ring sweeps
  { at: T.s4, K: st([0.5, 1.9, 2.0, 0.0, 0.85, -2.3, 50], [0.4, 1.85, 1.7, 0.0, 0.85, -2.3, 50]) },
  // "every connected device": higher, see the ring cross the room
  { at: T.every - 0.1, K: st([0.0, 2.9, 0.9, 0.0, 0.5, -2.0, 52], [0.0, 2.8, 0.7, 0.0, 0.5, -2.0, 52]) },
  // s5 "camera name": close on the charger with the alert
  { at: T.camera - 0.15, K: st([-0.95, 1.05, -1.75, -1.3, 0.95, -2.88, 38], [-1.0, 1.03, -1.85, -1.3, 0.95, -2.88, 36]) },
  // "can't match ... in the room": laptop matched (check), charger not (cross)
  { at: T.match - 0.2, K: st([0.6, 1.6, 0.4, -0.4, 0.8, -2.2, 50], [0.5, 1.55, 0.2, -0.4, 0.8, -2.2, 50]) },
  // s6 "miss ... offline": the clock camera, no line to the router
  { at: T.miss - 0.1, K: st([-0.95, 0.95, -1.8, -1.3, 0.66, -2.66, 38], [-1.0, 0.93, -1.9, -1.3, 0.66, -2.66, 36]) },
  // "check the room": guest's flashlight on the nightstand
  { at: T.check - 0.15, K: st([0.6, 1.8, 1.6, -0.9, 0.75, -2.6, 46], [0.5, 1.75, 1.4, -0.9, 0.75, -2.6, 46]) },
  // s7-s8: calm wide
  { at: T.s7, calm: 1, K: [[0, [0.3, 2.2, 4.2, -0.2, 1.4, -2.0, 52]], [5, [0.3, 2.5, 5.0, -0.2, 1.4, -2.0, 52]]] },
];

run("wifi-scan", (t) => {
  // guest walks in and stays facing the bed
  const w = walkPath(START, SPOT, 0.05, tArr, t), k = sm(tArr - 0.1, tArr + 0.4, t);
  P.set({ x: w.x, z: w.z, h: w.h + (hFace - w.h) * k, walk: w.walk, t, vis: true, phone: 1, look: 0 });
  ph.updateWorldMatrix(true, false); ph.getWorldPosition(hp);

  // router LEDs blink
  leds.forEach((m, i) => m.color.set(GREEN).multiplyScalar(0.6 + 1.2 * (0.5 + 0.5 * Math.sin(t * (7 + i * 2.3) + i))));

  // s2-s3: camera sends red packets (it keeps sending until the end of s5)
  const camOn = sm(T.video - 0.1, T.video + 0.2, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t));
  camLink.set(lens.position, RTX, camOn, t, 1.5);
  lensMat.color.set(RED).multiplyScalar(2.2 * sm(T.hidden - 0.05, T.hidden + 0.2, t) * (1 - sm(T.s7, T.s7 + 0.4, t)) * (0.75 + 0.25 * Math.sin(t * 9)));

  // s3: the other devices on the network too
  const netOn = sm(T.devices - 0.1, T.devices + 0.25, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t));
  lapLink.set(LAP, RTX, netOn, t, 1.0);

  // s4: guest's phone joins (green line), the scan ring sweeps out from the router
  const joined = sm(T.join - 0.05, T.join + 0.3, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t));
  phLink.set(hp, RTX, joined, t, 1.3);
  ph.userData.screen.material.color.set(joined > 0.5 ? GREEN : WHITE).multiplyScalar(1.4 + flash(t, T.scan));
  const sw = sm(T.scan - 0.05, T.device4 + 0.3, t);
  ring.visible = sw > 0.001 && sw < 0.999; ring.position.set(RT.x, 0.62, RT.z); ring.scale.setScalar(0.1 + 3.6 * sw); ring.material.opacity = 0.9 * Math.sin(Math.PI * sw);
  // each device gets ringed as the scan finds it
  const ringOn = (m, v, t0, t1) => { const a = sm(t0 - 0.05, t0 + 0.15, t) * (1 - sm(t1, t1 + 0.3, t)); m.visible = a > 0.01; m.position.copy(v); m.lookAt(hp); m.material.opacity = a * (0.8 + 0.2 * Math.sin(t * 8)); };
  ringOn(rPh, hp, T.every, T.s5);
  ringOn(rLap, LAP, T.connected, T.s6);
  ringOn(rCam, V3(CHG.x, CHG.y, CHG.z + 0.06), T.device4, T.s6);

  // s5: alert over the charger at "camera", cross at "match"; check over the laptop at "room"
  const aCam = sm(T.camera - 0.05, T.camera + 0.2, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t));
  pop(icAlert, [CHG.x, CHG.y + 0.24, CHG.z + 0.05], aCam);
  pop(icCheck, [LAP.x, LAP.y + 0.3, LAP.z], sm(T.match - 0.05, T.match + 0.2, t) * (1 - sm(T.s6 + 0.1, T.s6 + 0.4, t)));

  // s6: the clock camera (no line) gets red, then the flashlight checks it
  const clkA = sm(T.offline - 0.1, T.offline + 0.2, t) * (1 - sm(T.s7, T.s7 + 0.4, t));
  clkPatch.set(clkA);
  pop(icAlert2, [CLK.x, CLK.y + 0.24, CLK.z], clkA);
  clkLens.material.color.set(RED).multiplyScalar(2.0 * clkA);
  pop(icCross, [(CLK.x + RT.x) / 2, 0.75, RT.z + 0.1], sm(T.offline - 0.05, T.offline + 0.2, t) * (1 - sm(T.check - 0.1, T.check + 0.1, t)));
  flCone.set(hp, V3(CLK.x, CLK.y, CLK.z), 0.35 * sm(T.check - 0.15, T.check + 0.1, t) * (1 - sm(T.s7, T.s7 + 0.4, t)));

  const { punch } = shoot(SH, t);
  unclip();
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
