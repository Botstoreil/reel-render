// squeeze-brake (Apex 14, TikTok) - PS2 LOW-POLY style (kit copy: ~/jarvis-admin/tmp/studio/style-kits/style-ps2-lowpoly.js).
// three.js low-poly models, flat shading, fog, rendered at 360x640, ordered-dithered to 5 bits per channel and scaled up
// with nearest neighbour; early-2000s chase-cam moves. No real game characters, logos or UI.
// Wrong: a red bike grabs the front brake in one go, the front wheel locks, the tyre skids and the bike goes down.
// Right: a violet bike squeezes then presses harder, uses the rear brake too, stops straight and upright, and looks at the
// space beside the car. Travel is toward -z. Time only from hf-seek.
import * as THREE from "three";

const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (a, b, v) => { const t = cl((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------- low-res renderer -> dither -> nearest-neighbour upscale ----------
const LW = 360, LH = 640;
const glc = document.createElement("canvas"); glc.width = LW; glc.height = LH;
const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(LW, LH, false);
const lo = document.createElement("canvas"); lo.width = LW; lo.height = LH;
const lx = lo.getContext("2d", { willReadFrequently: true });
const out = document.getElementById("world").getContext("2d");
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v / 16 - 0.5) * 8);
function present() {
  lx.drawImage(glc, 0, 0);
  const img = lx.getImageData(0, 0, LW, LH), p = img.data;
  for (let y = 0; y < LH; y++) for (let x0 = 0; x0 < LW; x0++) {
    const i = (y * LW + x0) * 4, b = BAYER[(y & 3) * 4 + (x0 & 3)];
    for (let c = 0; c < 3; c++) { const v = p[i + c] + b; p[i + c] = cl(Math.round(v / 8) * 8, 0, 255); }
  }
  lx.putImageData(img, 0, 0);
  out.imageSmoothingEnabled = false;
  out.drawImage(lo, 0, 0, 1080, 1920);
}

const scene = new THREE.Scene();
const SKY = 0x9cb8d8;
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 22, 60);
const camera = new THREE.PerspectiveCamera(46, 1080 / 1920, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x6a6250, 1.5));
const sun = new THREE.DirectionalLight(0xfff0d8, 1.9); sun.position.set(6, 10, 4); scene.add(sun);

// ---------- low-poly materials and shapes ----------
const matCache = {};
const lam = (hex, emissive = 0) => { const k = `${hex}|${emissive}`; return matCache[k] || (matCache[k] = new THREE.MeshLambertMaterial({ color: hex, flatShading: true, emissive })); };
const C = { red: 0xd02a2a, violet: 0x7c5cff, dark: 0x26262e, grey: 0x7a7f88, road: 0x4b4f57, line: 0xf2f2ea, yellow: 0xf2c200, blue: 0x2a62c9, green: 0x2fae4a, grass: 0x5d9a45, wall: 0xc9b79a, wall2: 0x9aa6b4, glass: 0x5a7da8, skin: 0xe0b48c };
function box(w, h, d, hex) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof hex === "number" ? lam(hex) : hex); }
function at3(o, x, y, z) { o.position.set(x, y, z); return o; }

// ---------- the set: a city street, a car stopped ahead ----------
const ROAD_W = 8;
{
  scene.add(at3(box(60, 0.1, 80, C.grass), 0, -0.06, -10));
  scene.add(at3(box(ROAD_W, 0.04, 80, C.road), 0, 0, -10));
  [-1, 1].forEach((sd) => scene.add(at3(box(2.4, 0.18, 80, 0xa9a59c), sd * (ROAD_W / 2 + 1.2), 0.09, -10))); // pavements
  [-1, 1].forEach((sd) => scene.add(at3(box(0.14, 0.02, 80, C.line), sd * (ROAD_W / 2 - 0.3), 0.03, -10)));
  for (let z = 24; z > -50; z -= 3.2) scene.add(at3(box(0.14, 0.02, 1.6, C.line), 1.6, 0.03, z)); // lane dashes (our lane is x < 1.6)
  const r = rng(3);
  for (const sd of [-1, 1]) for (let z = 20; z > -50; z -= 5.5) {
    const h = 3 + r() * 6, w = 3.5 + r() * 2;
    const b = at3(box(w, h, 4.6, r() > 0.5 ? C.wall : C.wall2), sd * (ROAD_W / 2 + 2.6 + w / 2), h / 2, z); scene.add(b);
    for (let wy = 1.2; wy < h - 0.6; wy += 1.5) scene.add(at3(box(0.05, 0.7, 2.8, C.glass), sd * (ROAD_W / 2 + 2.57), wy, z));
    if (r() > 0.55) { // a low-poly tree on the pavement
      const tz = z - 2.6;
      scene.add(at3(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.4, 5), lam(0x6b4a2a)), sd * (ROAD_W / 2 + 1.6), 0.8, tz));
      scene.add(at3(new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.9, 6), lam(0x3e8a3a)), sd * (ROAD_W / 2 + 1.6), 2.3, tz));
    }
  }
}
// blob shadow (the era's dark disc under each vehicle)
const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false });
function blob(w, d) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.5, 8), blobMat); m.rotation.x = -Math.PI / 2; m.scale.set(w, d, 1); m.position.y = 0.035; return m; }

// ---------- vehicles ----------
const CARZ = -10.4, CARX = 0;
function makeCar(hex) {
  const g = new THREE.Group();
  g.add(blob(2.4, 4.2));
  g.add(at3(box(1.9, 0.6, 3.6, hex), 0, 0.55, 0));
  g.add(at3(box(1.6, 0.55, 1.9, hex), 0, 1.12, 0.2));
  g.add(at3(box(1.62, 0.42, 0.05, C.glass), 0, 1.12, 1.16));
  g.add(at3(box(1.62, 0.42, 0.05, C.glass), 0, 1.12, -0.76));
  [[-0.95, -1.15], [0.95, -1.15], [-0.95, 1.15], [0.95, 1.15]].forEach(([wx, wz]) => { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 8), lam(C.dark)); w.rotation.z = Math.PI / 2; g.add(at3(w, wx, 0.36, wz)); });
  const bl = new THREE.MeshLambertMaterial({ color: 0x501010, emissive: 0x000000, flatShading: true });
  [-0.68, 0.68].forEach((bx) => g.add(at3(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.06), bl), bx, 0.72, 1.82)));
  g.userData.bl = bl;
  scene.add(g); return g;
}
const car = makeCar(C.blue);
car.position.set(CARX, 0, CARZ);

const WR = 0.34;
function wheel() {
  const g = new THREE.Group();
  const tyre = new THREE.Mesh(new THREE.CylinderGeometry(WR, WR, 0.2, 10), lam(0x1a1a1f)); tyre.rotation.z = Math.PI / 2; g.add(tyre);
  const spin = new THREE.Group(); g.add(spin);
  [0, Math.PI / 2].forEach((a) => { const s = box(0.24, 0.08, 0.5, C.yellow); s.rotation.x = a; spin.add(s); });
  g.userData.spin = spin; return g;
}
// motorcycle + rider, nose toward -z. body pivots on the ground line so a fall lays it on its side.
function makeBike(hex) {
  const g = new THREE.Group();
  const sh = blob(0.9, 2.0); g.add(sh);
  const body = new THREE.Group(); g.add(body);
  const rearW = at3(wheel(), 0, WR, 0.68); body.add(rearW);
  const front = new THREE.Group(); front.position.set(0, 0, -0.6); body.add(front);
  const frontW = at3(wheel(), 0, WR, -0.1); front.add(frontW);
  front.add(at3(box(0.07, 0.62, 0.07, 0xc0c0c0), 0, 0.62, -0.06));      // fork
  front.add(at3(box(0.86, 0.07, 0.09, C.dark), 0, 1.0, 0.02));           // bars
  const lever = at3(box(0.24, 0.04, 0.05, 0xd8d8d8), 0.3, 1.0, -0.08); front.add(lever); // front brake lever (right bar)
  body.add(at3(box(0.34, 0.32, 1.1, hex), 0, 0.46, 0));                   // frame
  body.add(at3(box(0.5, 0.3, 0.55, hex), 0, 0.74, -0.28));                // tank
  body.add(at3(box(0.4, 0.12, 0.62, C.dark), 0, 0.74, 0.3));              // seat
  const tl = new THREE.MeshLambertMaterial({ color: 0x501010, emissive: 0x000000, flatShading: true });
  body.add(at3(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.06), tl), 0, 0.84, 0.66));
  // rider
  body.add(at3(box(0.54, 0.62, 0.34, C.dark), 0, 1.12, 0.18));           // torso
  const head = new THREE.Group(); head.position.set(0, 1.62, 0.1); body.add(head);
  head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.25, 0), lam(hex)));
  head.add(at3(box(0.34, 0.12, 0.1, 0x111111), 0, 0.02, -0.2));
  [-0.28, 0.28].forEach((ax) => { const a = box(0.13, 0.13, 0.66, C.dark); a.position.set(ax, 1.18, -0.24); a.rotation.x = 0.55; body.add(a); });
  const legs = [-1, 1].map((sd) => {
    const piv = new THREE.Group(); piv.position.set(0.2 * sd, 0.92, 0.18); body.add(piv);
    piv.add(at3(box(0.15, 0.84, 0.17, C.dark), 0, -0.42, 0));
    piv.add(at3(box(0.19, 0.11, 0.3, 0x111111), 0, -0.84, -0.06));
    piv.userData.sd = sd; return piv;
  });
  g.userData = { body, front, frontW, rearW, head, legs, tl, lever, sh };
  scene.add(g); return g;
}
const bikeW = makeBike(C.red);
const bikeR = makeBike(C.violet);
function feet(b, kL, kR) { b.userData.legs.forEach((p) => { const k = p.userData.sd < 0 ? kL : kR; p.rotation.x = lerp(-0.85, 0, k); p.rotation.z = p.userData.sd * lerp(0.15, 0.42, k); }); }
function pose(b, x, z, spinF, spinR) { b.position.set(x, 0, z); b.userData.frontW.userData.spin.rotation.x = spinF; b.userData.rearW.userData.spin.rotation.x = spinR; }

// ---------- road marks and markers ----------
const skidMat = new THREE.MeshBasicMaterial({ color: 0x0c0c0c, transparent: true, opacity: 0.85, depthWrite: false });
const skid = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.01, 1), skidMat); skid.visible = false; scene.add(skid);
function ringMesh(hex) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 6, 14), new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); return m; }
const ringRear = ringMesh(0x22c55e); // around the rear wheel (vertical)
const ringGap = ringMesh(0x22c55e); ringGap.rotation.x = Math.PI / 2; ringGap.scale.setScalar(1.6);
const beamMat = (hex) => new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0, depthWrite: false });
const laneBeam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 1), beamMat(0x22c55e)); laneBeam.visible = false; scene.add(laneBeam);
const upLine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.6, 0.06), beamMat(0x22c55e)); upLine.visible = false; scene.add(upLine);
function rayMesh(hex) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 6), beamMat(hex)); m.visible = false; scene.add(m); return m; }
const eyeG = rayMesh(0x22c55e), eyeR = rayMesh(0xff3030);
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
function ray(m, A, B, a) {
  m.visible = a > 0.01; m.material.opacity = 0.9 * a; if (!m.visible) return;
  _a.copy(B).sub(A); const L = _a.length();
  m.position.copy(A).addScaledVector(_a, 0.5); m.scale.set(1, L, 1);
  m.quaternion.setFromUnitVectors(_up, _a.normalize());
}
// sparks when the red bike goes down
const sparks = []; { const r = rng(17); for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd24a : 0xff7a1a })); m.userData = { vx: (r() - 0.2) * 2.2, vy: 1 + r() * 2, vz: (r() - 0.5) * 1.4, d: r() * 0.25 }; m.visible = false; scene.add(m); sparks.push(m); } }

// ---------- motion (analytic, so every frame is the same on every seek) ----------
// WRONG: constant speed, the grab, a locked-wheel skid, a fall.
const V0 = 3.0;
const G2 = at("s2", "grab"), L2 = at("s2", "lock");
const z1 = (u) => lerp(8.0, 0.0, cl(u / S.s1[1]));
const zW = (u) => { // s2 time
  if (u < G2) return -V0 * u;
  const tt = u - G2; return -V0 * G2 - (V0 * tt - 0.5 * 1.3 * tt * tt);
};
const Z3 = zW(S.s2[1] - LEAD);
const zW3 = (u) => { const tt = cl(u, 0, 1.6); return Z3 - (1.0 * tt - 0.32 * tt * tt); };
const LOCKZ = zW(L2) - 0.7;
// RIGHT: constant speed, then a progressive squeeze to a straight stop behind the car.
const ZR0 = 8.0, ZSTOP = CARZ + 3.5;  // front tyre ~0.6 behind the car's bumper
const SQ = at("s4", "squeeze");
const RT = S.s4[1] + S.s5[1] - 0.6;          // time from s4 start to the stop
const zR = (tau) => { // tau = time since s4 start
  const v = (ZR0 - ZSTOP) / (SQ + (2 * (RT - SQ)) / 3);            // pre-brake speed so it stops exactly at ZSTOP
  if (tau < SQ) return ZR0 - v * tau;
  const z0 = ZR0 - v * SQ, T = RT - SQ, k = cl((tau - SQ) / T);
  // progressive: decel grows with time (light squeeze first, then harder): distance = v*T*(k - k^3/3) * (3/2)/... normalised
  const f = (s) => s - (s * s * s) / 3;                          // v(s) = 1 - s^2, normalised
  return z0 - (z0 - ZSTOP) * f(k) / f(1);
};
const brakeR = (tau) => tau < SQ ? 0 : lerp(0.3, 0.92, sm(SQ, at("s4", "harder") + 0.3, tau)) * (tau > RT + 0.2 ? 0.6 : 1);

// ---------- camera: early-2000s game chase cam ----------
function place(look, dir, dist) { camera.position.copy(look).addScaledVector(dir, dist); camera.lookAt(look); camera.updateMatrixWorld(); }
const SH = {
  s1: { dir: [0.22, 0.42, 1], dist: 8.0, ly: 0.9, dz: -0.8 },
  s2: { dir: [1, 0.38, -0.32], dist: 5.0, ly: 0.75, dz: -0.4 },
  s3: { dir: [1, 0.6, 0.45], dist: 6.5, ly: 0.5, dz: -0.6 },
  s4: { dir: [0.28, 0.45, 1], dist: 6.8, ly: 0.8, dz: -0.3 },
  s5: { dir: [1, 0.42, 0.42], dist: 6.0, ly: 0.8, dz: -0.8 },
  s6: { dir: [0.12, 0.95, 1], dist: 8.0, ly: 0.6, dz: -1.5 },
  s7: { dir: [0.5, 0.85, 1], dist: 10.0, ly: 0.8, dz: -1.6 },
};
SH.s8 = SH.s7;
const lookV = new THREE.Vector3(), dirV = new THREE.Vector3();
function shoot(id, bx, bz, k, sway = 0) {
  const s = SH[id];
  lookV.set(bx * 0.6, s.ly, bz + s.dz);
  dirV.set(s.dir[0] + sway, s.dir[1], s.dir[2]).normalize();
  place(lookV, dirV, s.dist * lerp(1.08, 1.0, k));
}
const tv = new THREE.Vector3();
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay text (crisp, full res, game-HUD look) ----------
const ov = document.createElement("canvas");
ov.width = 1080; ov.height = 1920;
ov.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:2";
document.getElementById("stage").appendChild(ov);
const x = ov.getContext("2d");
const RED = "#ff3434", GREEN = "#2fdc5f", ORANGE = "#ff8a00", WHITE = "#ffffff", INK = "#0e1020", VIO = "#8f72ff";
const CX = 510;
const FONT = (px) => `italic 900 ${px}px Inter, Arial, sans-serif`;
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (820 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.54;
    parts.forEach((p, i) => {
      const s0 = t0 + wi * 0.07, kk = back(s0, s0 + 0.28, curU), o = sm(s0, s0 + 0.08, curU);
      x.save(); x.translate(X + ws[i] / 2, Y); x.scale(lerp(1.6, 1, kk), lerp(1.6, 1, kk)); x.globalAlpha = a * o;
      x.fillStyle = "rgba(0,0,0,0.55)"; x.fillText(p, 8, 10);
      x.lineWidth = Math.max(10, px * 0.16); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      const gr = x.createLinearGradient(0, -px / 2, 0, px / 2);
      const top = flashK > 0.05 ? mix(color, "#ffffff", 0.35 + flashK * 0.5) : mix(color, "#ffffff", 0.35);
      gr.addColorStop(0, top); gr.addColorStop(0.55, color); gr.addColorStop(1, mix(color, "#000000", 0.25));
      x.fillStyle = gr; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.08;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 46, h = px * 1.45, s = 0.7 + 0.3 * a;
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 640, 1190); // stay above the caption pill (1240-1350)
  x.translate(X, Y); x.scale(s, s); x.transform(1, 0, -0.18, 1, 0, 0);
  x.fillStyle = "rgba(0,0,0,0.5)"; x.fillRect(-w / 2 + 7, -h / 2 + 8, w, h);
  const gr = x.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, mix(color, "#ffffff", 0.3)); gr.addColorStop(1, mix(color, "#000000", 0.3));
  x.fillStyle = gr; x.fillRect(-w / 2, -h / 2, w, h);
  x.strokeStyle = WHITE; x.lineWidth = 4; x.strokeRect(-w / 2, -h / 2, w, h);
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  X = cl(X, 140, 880); Y = cl(Y, 680, 1180);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "square"; x.lineJoin = "miter";
  for (const [lw, c] of [[44, INK], [26, color]]) {
    x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
    x.beginPath();
    if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); } else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
    x.stroke();
  }
  x.restore();
}
// game-style brake gauge (left side, inside the safe zone)
function gauge(level, color, a, label = "BRAKE") {
  if (a <= 0) return;
  const X = 96, Y0 = 690, H = 420, Wd = 64;
  x.save(); x.globalAlpha = a;
  x.fillStyle = "rgba(0,0,0,0.55)"; x.fillRect(X - 8, Y0 - 8, Wd + 16, H + 16);
  x.strokeStyle = WHITE; x.lineWidth = 4; x.strokeRect(X - 8, Y0 - 8, Wd + 16, H + 16);
  const segs = 12, filled = Math.round(level * segs);
  for (let i = 0; i < segs; i++) {
    const y = Y0 + H - (i + 1) * (H / segs) + 3;
    x.fillStyle = i < filled ? color : "rgba(255,255,255,0.12)"; x.fillRect(X, y, Wd, H / segs - 6);
  }
  x.font = FONT(34); x.textAlign = "center"; x.textBaseline = "middle"; x.lineWidth = 8; x.strokeStyle = INK;
  x.strokeText(label, X + Wd / 2 + 8, Y0 + H + 52); x.fillStyle = WHITE; x.fillText(label, X + Wd / 2 + 8, Y0 + H + 52);
  x.restore();
}

// ---------- one frame ----------
const V = (a, b, c) => new THREE.Vector3(a, b, c);
function reset() {
  for (const b of [bikeW, bikeR]) {
    b.position.set(0, 0, 60); b.rotation.set(0, 0, 0); b.userData.body.rotation.set(0, 0, 0); b.userData.body.position.set(0, 0, 0);
    b.userData.front.rotation.set(0, 0, 0); b.userData.head.rotation.set(0, 0, 0); b.userData.tl.emissive.setHex(0); b.userData.sh.visible = true; feet(b, 0, 0);
    b.userData.lever.rotation.set(0, 0, 0);
  }
  car.userData.bl.emissive.setHex(0xff2020);
  skid.visible = false; ringRear.visible = false; ringGap.visible = false; laneBeam.visible = false; upLine.visible = false;
  eyeG.visible = false; eyeR.visible = false; sparks.forEach((m) => (m.visible = false));
}
function ring(m, a) { m.visible = a > 0.01; m.material.opacity = a; }
const spinOf = (dist) => -dist / WR;
let BX = 0, BZ = 0;

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  reset();
  const U = (w, n) => at(id, w, n);
  const tau = t - S.s4[0] - LEAD;
  let sway = 0;

  if (id === "s1") {
    const z = z1(u); pose(bikeW, 0, z, spinOf(8 - z), spinOf(8 - z));
    const s = sm(U("stop") - 0.2, U("stop") + 0.1, u);
    car.userData.bl.emissive.setHex(s > 0.5 ? 0xff2020 : 0x000000);
    BX = 0; BZ = z; sway = 0.1 * Math.sin(u * 0.9);
  }
  if (id === "s2" || id === "s3") {
    const z = id === "s2" ? zW(u) : zW3(u);
    const dist = 8 - 0 + (0 - z); // total distance since s1 start
    const lockAt = zW(L2);
    const frontDist = id === "s2" && u < L2 ? dist : 8 + (0 - lockAt);
    pose(bikeW, 0, z, spinOf(frontDist), spinOf(dist));
    const grabK = id === "s2" ? sm(G2 - 0.04, G2 + 0.06, u) : 1;
    bikeW.userData.lever.rotation.y = -0.5 * grabK;
    bikeW.userData.tl.emissive.setHex(grabK > 0.5 ? 0xff2020 : 0);
    // skid mark from the lock point to the front wheel
    const fz = z - 0.7;
    if (id === "s3" || u > L2) { skid.visible = true; const L = Math.max(0.05, LOCKZ - fz); skid.scale.z = L; skid.position.set(0, 0.03, fz + L / 2); }
    if (id === "s2") { bikeW.userData.body.rotation.x = -0.06 * grabK; } // nose dive
    if (id === "s3") {
      const sk = sm(U("skids") - 0.25, U("skids") + 0.1, u);
      bikeW.userData.front.rotation.y = 0.55 * sk;                 // front tucks
      const f = sm(U("goes") - 0.15, U("down") + 0.12, u);
      bikeW.userData.body.rotation.z = -1.38 * f;                  // lowside onto its right
      bikeW.position.x = 0.5 * f; bikeW.rotation.y = 0.35 * f;
      bikeW.userData.sh.visible = f < 0.5;
      const T0 = U("down") - 0.1;
      sparks.forEach((m) => { const p = m.userData, tt = u - T0 - p.d; m.visible = tt > 0 && tt < 0.6; if (m.visible) m.position.set(bikeW.position.x + 0.6 + p.vx * tt, 0.1 + p.vy * tt - 4.9 * tt * tt * 1.4, z + p.vz * tt); });
    }
    BX = 0; BZ = z;
  }
  if (id === "s4" || id === "s5" || id === "s6" || id === "s7" || id === "s8") {
    const tt = Math.min(tau, RT);
    const z = zR(tt), dist = ZR0 - z;
    pose(bikeR, 0, z, spinOf(dist), spinOf(dist));
    const lvl = brakeR(tau);
    bikeR.userData.lever.rotation.y = -0.45 * lvl;
    bikeR.userData.tl.emissive.setHex(lvl > 0.05 ? 0xff2020 : 0);
    bikeR.userData.body.rotation.x = -0.035 * lvl;
    if (tau > RT - 0.1) feet(bikeR, sm(RT - 0.1, RT + 0.3, tau), 0);
    BX = 0; BZ = z;
    if (id === "s5") {
      const rr = sm(U("rear") - 0.1, U("rear") + 0.15, u);
      ring(ringRear, rr); ringRear.rotation.y = Math.PI / 2; ringRear.position.set(0, WR, z + 0.68);
      const st = sm(U("straight") - 0.15, U("straight") + 0.15, u);
      laneBeam.visible = st > 0.01; laneBeam.material.opacity = 0.6 * st;
      const L = Math.max(0.1, z - 0.7 - ZSTOP + 0.7 + 1.2); laneBeam.scale.z = L; laneBeam.position.set(0, 0.04, z - 0.7 - L / 2 + 0.6);
      const up = sm(U("upright") - 0.1, U("upright") + 0.15, u);
      upLine.visible = up > 0.01; upLine.material.opacity = 0.85 * up; upLine.position.set(0, 1.3, z - 0.2);
      sway = 0.12 * sm(0, d, u);
    }
    if (id === "s6") {
      const lk = sm(U("look") - 0.15, U("look") + 0.2, u);
      bikeR.userData.head.rotation.y = 0.55 * lk;                  // head turns left, to the space beside the car
      const gap = V(-2.3, 0.05, CARZ + 0.4);
      ring(ringGap, sm(U("look") - 0.05, U("stop") + 0.1, u)); ringGap.position.copy(gap);
      const eye = V(0, 1.62, z + 0.1);
      ray(eyeG, eye, gap, sm(U("look"), U("where") + 0.1, u));
      ray(eyeR, eye, V(0, 0.9, CARZ + 1.82), sm(U("not") - 0.1, U("not") + 0.1, u) * (0.6 + 0.4 * Math.sin(u * 20) ** 2));
    }
  }
  const k = cl(u / Math.max(0.5, d));
  shoot(id, BX, BZ, k, sway);
  renderer.render(scene, camera);
  present();

  // ---------- overlay ----------
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const pin = (v, dy = 0) => { const [X, Y] = scr(v); return [X, Y + dy]; };
  if (id === "s1") {
    words(["NEVER GRAB", "THE FRONT BRAKE"], RED, 430, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "grab")), flash(u, at("s1", "brake"))));
    const [cx2, cy2] = pin(V(0, 1.9, CARZ));
    tag("STOP FAST", cx2, cy2 - 30, VIO, sm(at("s1", "stop") - 0.1, at("s1", "stop") + 0.2, u), 40);
  }
  if (id === "s2") {
    words(["A SUDDEN GRAB", "LOCKS THE WHEEL"], RED, 430, 0.0, 1, 140, flash(u, at("s2", "lock")) * 0.6);
    gauge(sm(G2 - 0.04, G2 + 0.06, u), RED, sm(0.2, 0.5, u));
    tag("NO ABS", 760, 690, RED, sm(at("s2", "abs") - 0.1, at("s2", "abs") + 0.15, u), 38);
    const [fx, fy] = pin(V(0, WR, zW(u) - 0.7));
    tag("LOCKED", fx, fy + 120, RED, sm(L2 - 0.05, L2 + 0.2, u), 42);
  }
  if (id === "s3") {
    words(["FRONT SKIDS.", "BIKE GOES DOWN."], RED, 430, 0.0, 1, 140, flash(u, at("s3", "down")) * 0.6);
    gauge(1, RED, 1 - sm(0.4, 0.8, u));
    const [sx, sy] = pin(V(0, 0.05, LOCKZ - 0.6));
    tag("SKID", sx - 120, sy + 40, RED, sm(at("s3", "skids") - 0.1, at("s3", "skids") + 0.2, u), 40);
    const sT = at("s3", "down");
    const [bx, by] = pin(V(0.6, 1.4, zW3(u)));
    stamp("x", bx + 120, by - 40, back(sT, sT + 0.3, u) * 0.6, u > sT ? 1 : 0, RED);
  }
  if (id === "s4") {
    words(["SQUEEZE,", "THEN PRESS HARDER"], GREEN, 430, 0.0, 1, 140, flash(u, at("s4", "harder")) * 0.6);
    gauge(brakeR(tau), GREEN, sm(0.1, 0.4, u));
    tag("SQUEEZE", 700, 700, VIO, sm(at("s4", "squeeze") - 0.1, at("s4", "squeeze") + 0.2, u) * (1 - sm(at("s4", "press") - 0.1, at("s4", "press") + 0.1, u)), 40);
    tag("HARDER", 700, 700, GREEN, sm(at("s4", "harder") - 0.1, at("s4", "harder") + 0.2, u), 42);
  }
  if (id === "s5") {
    words(["REAR BRAKE TOO.", "STAY STRAIGHT."], GREEN, 430, 0.0, 1, 140, flash(u, at("s5", "straight")) * 0.6);
    gauge(brakeR(tau), GREEN, 1);
    const [rx, ry] = pin(V(0, WR, BZ + 0.68));
    tag("REAR", rx + 230, ry, GREEN, sm(at("s5", "rear") - 0.1, at("s5", "rear") + 0.2, u), 40);
    const [ux, uy] = pin(V(0, 2.6, BZ - 0.2));
    tag("UPRIGHT", ux, uy - 40, VIO, sm(at("s5", "upright") - 0.1, at("s5", "upright") + 0.2, u), 40);
  }
  if (id === "s6") {
    words(["LOOK WHERE", "YOU WANT TO STOP"], GREEN, 430, 0.0, 1, 140, flash(u, at("s6", "look")) * 0.6);
    const [gx, gy] = pin(V(-2.3, 0.05, CARZ + 0.4));
    tag("HERE", gx, gy + 70, GREEN, sm(at("s6", "stop") - 0.1, at("s6", "stop") + 0.2, u), 42);
    const nT = at("s6", "not");
    const [cx2, cy2] = pin(V(0.4, 1.6, CARZ));
    stamp("x", cx2 + 110, cy2 - 20, back(nT, nT + 0.3, u) * 0.45, u > nT ? 1 : 0, RED);
    const lT = at("s6", "look");
    stamp("v", gx - 40, gy - 150, back(lT, lT + 0.3, u) * 0.45, u > lT ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(10,14,34,0.58)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SQUEEZE,", "DON'T GRAB."], ORANGE, 520, 0.0, 1, 170, flash(u, 0.05));
    words(["STAY STRAIGHT.", "LOOK AHEAD."], ORANGE, 900, at("s7", "stay") - 0.05, 1, 150, flash(u, at("s7", "look")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(10,14,34,0.74)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const kk = back(0.0, 0.35, u);
    // a low-poly wheel as the icon (10-sided tyre, yellow spokes)
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, kk), Math.max(0.01, kk)); x.rotate(u * 2); x.lineWidth = 10; x.strokeStyle = INK;
    const poly = (r, n) => { x.beginPath(); for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); };
    x.fillStyle = "#1a1a1f"; poly(130, 10); x.fill(); x.stroke();
    x.fillStyle = "#8f72ff"; poly(70, 10); x.fill(); x.stroke();
    x.fillStyle = "#f2c200"; x.fillRect(-95, -14, 190, 28); x.fillRect(-14, -95, 28, 190);
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["squeeze-brake-ps2"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
