// Ready-made, camera-tested sets for people reels (a person at the computer reads as a real scene; two people at a board looked fake).
// Each set lives at its own x (OX) so they never see each other; fog hides the rest. world.js builds the ones it needs,
// calls X.set(t, {...}) every frame and uses only X's cameras in SH: { at: S.s2[0], cam: X.wide }.
import { THREE, scene, box, glow, VIOLET, ORANGE, RED, GREEN, WHITE } from "./kit.js";
import { human, desk, chair, monitor, door, walkPath } from "./parts.js";

const mat = (hex, e = 0.25) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6, metalness: 0.1, emissive: new THREE.Color(hex).multiplyScalar(e) });
const mWall = mat(0x15123f, 0.3), mFloor = mat(0x0d0b2a, 0.2);
const drift = (c, su, k = 0.05) => [c[0], c[1], c[2] - k * Math.min(su, 4), c[3], c[4], c[5], c[6]]; // slow push-in, never frozen
const canvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; };
const tex = (c) => new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), toneMapped: false, transparent: true, side: THREE.DoubleSide });
const css = (hex) => "#" + new THREE.Color(hex).getHexString();

// floor, back wall (z -3) and optional front wall (z +3) with neon strips, so every camera has a backdrop
function set_(OX, { front = false, hex = VIOLET } = {}) {
  scene.add(box(8, 0.02, 8, OX, -0.01, 0, mFloor, false), box(8, 3.2, 0.1, OX, 1.6, -3, mWall, false), box(8, 0.03, 0.03, OX, 2.4, -2.94, glow(hex, 1.2), false));
  for (let i = -3; i <= 3; i++) scene.add(box(0.015, 0.003, 8, OX + i, 0.002, 0, glow(hex, 0.45), false));
  if (front) scene.add(box(8, 3.2, 0.1, OX, 1.6, 3, mWall, false), box(8, 0.03, 0.03, OX, 2.4, 2.94, glow(hex, 1.2), false));
  scene.fog.density = 0.028;
}

// editing timeline on a 512x320 screen: label on top, 3 tracks of clips, playhead at p (0..1)
function timeline(label, p, hex) {
  const [c, x] = canvas(512, 320);
  x.fillStyle = "#120f38"; x.fillRect(0, 0, 512, 320);
  x.fillStyle = css(hex); x.font = "900 64px Inter, Arial, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, 256, 58);
  const clips = [[[0.02, 0.3], [0.34, 0.62], [0.66, 0.97]], [[0.08, 0.45], [0.5, 0.8]], [[0.02, 0.97]]], cols = ["#7b6cff", "#ff8a3d", "#3dd68c"];
  clips.forEach((row, r) => row.forEach(([a, b]) => { x.fillStyle = cols[r]; x.fillRect(16 + a * 480, 130 + r * 56, (b - a) * 480 - 4, 42); }));
  x.fillStyle = "#ffffff"; x.fillRect(16 + p * 480, 112, 5, 190);
  return tex(c);
}

// 1. EDITOR AT THE DESK: one person seated at a monitor with an editing timeline.
//    face: from beside the monitor, sees the editor's face and the screen's back. screen: over the editor's shoulder onto the timeline.
//    set(t, { type 0..1, slump, look, label: "ROUGH CUT" (<= 10 letters), p: playhead 0..1, hex: label colour })
export function editorDesk({ OX = 0, shirt = ORANGE } = {}) {
  set_(OX, { front: true });
  const P = human({ hex: shirt }), z = 0.35;
  desk(OX, -0.15, 0, { w: 1.4, d: 0.7 }); chair(OX, z, 0);
  const M = monitor(OX + 0.12, -0.3, 0, { w: 0.9 }), cache = {};
  return {
    P, M,
    set(t, { type = 0.8, slump = 0, look = 0, label = "EDIT", p = 0.3, hex = WHITE } = {}) {
      P.set({ x: OX, z, h: 0, t, sit: 1, type, slump, look });
      const k = label + "|" + Math.round(p * 40) + "|" + hex; M.screen.material = cache[k] || (cache[k] = timeline(label, Math.round(p * 40) / 40, hex));
    },
    face: (t, su) => drift([OX - 2.0, 1.5, -1.25, OX - 0.1, 1.1, z, 46], -su),
    screen: (t, su) => drift([OX - 0.95, 1.8, 2.0, OX + 0.12, 1.15, -0.3, 42], su),
    wide: (t, su) => drift([OX + 1.7, 1.55, 2.1, OX, 1.0, -0.1, 46], su),
  };
}

// 2. PHONE CALL: one person standing, phone at the ear, facing the camera. say() a bubble beside them.
//    set(t, { phone 0..1, argue, slump, shrug, look })
export function phoneCall({ OX = 30, shirt = VIOLET, phoneHex = VIOLET } = {}) {
  set_(OX);
  scene.add(box(1.4, 1.0, 0.05, OX - 0.9, 1.6, -2.9, glow(0x2a2470, 1.0), false)); // window
  const P = human({ hex: shirt }), ph = new THREE.Group();
  ph.add(box(0.075, 0.15, 0.012, 0, 0, 0, mat(0x111111, 0), false), box(0.065, 0.13, 0.004, 0, 0, -0.008, glow(phoneHex, 1.4), false));
  P.hold(ph);
  return {
    P,
    set(t, { phone = 1, argue = 0, slump = 0, shrug = 0, look = 0 } = {}) { P.set({ x: OX, z: 0, h: Math.PI - 0.25, t, phone, argue, slump, shrug, look }); },
    wide: (t, su) => drift([OX + 0.4, 1.5, 3.8, OX, 1.25, 0, 46], su),
    close: (t, su) => drift([OX + 0.3, 1.6, 2.7, OX, 1.4, 0, 42], su, 0.04),
  };
}

// 3. MEETING: two people seated across a small table, both turned toward the camera (A left, B right).
//    set(t, { a: {argue, point, shrug, slump, nod, cheer}, b: {...} })
export function meeting({ OX = 60, shirtA = ORANGE, shirtB = VIOLET } = {}) {
  set_(OX);
  const A = human({ hex: shirtA }), B = human({ hex: shirtB, phase: 1.3 }), hA = -Math.PI / 2 - 0.45, hB = Math.PI / 2 + 0.45;
  desk(OX, -0.1, 0, { w: 0.8, d: 0.6 }); chair(OX - 0.62, 0, hA); chair(OX + 0.62, 0, hB);
  return {
    A, B,
    set(t, { a = {}, b = {} } = {}) { A.set({ x: OX - 0.62, z: 0, h: hA, t, sit: 1, ...a }); B.set({ x: OX + 0.62, z: 0, h: hB, t, sit: 1, ...b }); },
    wide: (t, su) => drift([OX, 1.7, 4.3, OX, 1.05, 0, 46], su),
    onA: (t, su) => drift([OX + 0.3, 1.45, 2.6, OX - 0.55, 1.15, 0, 42], su, 0.03),
    onB: (t, su) => drift([OX - 0.3, 1.45, 2.6, OX + 0.55, 1.15, 0, 42], su, 0.03),
  };
}

// 4. TEARING THE INVOICE: one person standing behind a paper invoice held at chest height; tear 0..1 rips it in two.
//    set(t, { tear 0..1, amount: "$2,400", stamp: "UNPAID", stampHex: RED, cheer, argue })
function invoiceTex(amount, stamp, stampHex) {
  const [c, x] = canvas(512, 704);
  x.fillStyle = "#f3f1ff"; x.fillRect(0, 0, 512, 704); x.textAlign = "center"; x.textBaseline = "middle";
  x.fillStyle = "#1b1650"; x.font = "900 58px Inter, Arial, sans-serif"; x.fillText("HOSPITAL LETTER", 256, 90);
  x.fillStyle = "#b9b4dd"; for (let i = 0; i < 5; i++) x.fillRect(60, 190 + i * 52, 392 - (i % 2) * 90, 18);
  x.fillStyle = "#1b1650"; x.font = "900 96px Inter, Arial, sans-serif"; x.fillText(amount, 256, 500);
  if (stamp) { x.save(); x.translate(256, 620); x.rotate(-0.12); x.strokeStyle = x.fillStyle = css(stampHex); x.lineWidth = 10; x.strokeRect(-200, -50, 400, 100); x.font = "900 72px Inter, Arial, sans-serif"; x.fillText(stamp, 0, 4); x.restore(); }
  return new THREE.CanvasTexture(c);
}
export function invoiceTear({ OX = 90, shirt = VIOLET } = {}) {
  set_(OX);
  const P = human({ hex: shirt }), W = 0.42, H = 0.58, cache = {};
  const half = (s) => { const g = new THREE.PlaneGeometry(W / 2, H); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) + (s > 0 ? 1 : 0)) / 2); const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x9a98b0, transparent: true, side: THREE.DoubleSide })); scene.add(m); return m; };
  const L = half(-1), R = half(1);
  return {
    P,
    set(t, { tear = 0, amount = "$2,400", stamp = "UNPAID", stampHex = RED, cheer = 0, argue = 0 } = {}) {
      P.set({ x: OX, z: 0, h: Math.PI, t, type: 0.7 * (1 - tear), cheer: cheer * tear, argue });
      const k = amount + stamp + stampHex, map = cache[k] || (cache[k] = invoiceTex(amount, stamp, stampHex));
      for (const [m, s] of [[L, -1], [R, 1]]) {
        m.material.map = map; m.material.opacity = 1 - Math.max(0, tear - 0.7) / 0.3; m.visible = m.material.opacity > 0.01;
        m.position.set(OX + s * (W / 4 + 0.12 * tear), 1.18 - 0.35 * tear * tear, 0.42 + 0.05 * tear);
        m.rotation.set(0, 0, -s * 0.6 * tear);
      }
    },
    wide: (t, su) => drift([OX + 0.3, 1.5, 3.6, OX, 1.25, 0.2, 46], su),
    close: (t, su) => drift([OX + 0.15, 1.4, 2.3, OX, 1.25, 0.4, 42], su, 0.03),
  };
}

// 5. WALKING OUT: one person walks from the middle to a glowing EXIT door on the right and goes through it.
//    set(t, { t0, t1 }) walks between t0 and t1; after t1 the person is gone and the door stays. slump / cheer optional.
export function walkOut({ OX = 120, shirt = VIOLET } = {}) {
  set_(OX);
  const P = human({ hex: shirt }), D = [OX + 1.3, -1.4];
  door(D[0], D[1], -Math.PI / 2 + 0.2);
  scene.add(box(0.5, 0.18, 0.04, D[0], 2.3, D[1], glow(GREEN, 1.4), false));
  return {
    P,
    set(t, { t0 = 0, t1 = 2, slump = 0, cheer = 0 } = {}) {
      const w = walkPath([OX - 0.5, 0.5], [D[0] - 0.2, D[1] + 0.1], t0, t1, t);
      P.set({ x: w.x, z: w.z, h: t < t0 ? Math.PI - 0.4 : w.h, t, walk: w.walk, vis: t < t1 + 0.15, slump, cheer });
    },
    wide: (t, su) => drift([OX - 0.3, 1.5, 3.0, OX + 0.4, 1.15, -0.4, 46], su),
    close: (t, su) => drift([OX - 0.6, 1.55, 2.8, OX - 0.3, 1.3, 0.3, 42], su, 0.03),
  };
}
