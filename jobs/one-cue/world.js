// one-cue (YogaFlow 20) - TOY BRICKS style (style test, style 4). Same story, words and timing as world.flat.js.bak.
// Everything is glossy plastic studded bricks in three.js, soft studio light, 12 fps stop-motion steps for the set.
// Generic toy bricks only: no brand name, logo or figure design. Cues are bricks: two stack, the rest bounce off.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

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
const STEP = 12;
const q = (t) => Math.floor(t * STEP + 1e-6) / STEP;

// ---------- renderer / studio ----------
const canvas = document.getElementById("world");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(1080, 1920, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefe9fb);
const camera = new THREE.PerspectiveCamera(40, 1080 / 1920, 0.1, 200);
scene.add(new THREE.HemisphereLight(0xffffff, 0xc9b98f, 1.25));
const key = new THREE.DirectionalLight(0xfff3e0, 2.4);
key.position.set(7, 13, 10); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 50 });
key.shadow.bias = -0.0006; key.shadow.radius = 4;
scene.add(key);
const fillL = new THREE.DirectionalLight(0xdfe9ff, 0.7); fillL.position.set(-9, 6, 7); scene.add(fillL);

// ---------- bricks ----------
const P = 0.8;
const geoCache = {};
const rbox = (w, h, d) => { const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`; return geoCache[k] || (geoCache[k] = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.06, w / 4, h / 4, d / 4))); };
const studGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 20);
const matCache = {};
const plastic = (hex) => matCache[hex] || (matCache[hex] = new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.12 }));
const newPlastic = (hex) => new THREE.MeshPhysicalMaterial({ color: hex, roughness: 0.3, metalness: 0, clearcoat: 0.85, clearcoatRoughness: 0.12 });
const C = { red: 0xd62828, blue: 0x1f5fd6, yellow: 0xf6b700, green: 0x2ea043, white: 0xf5f5f2, violet: 0x7c5cff, orange: 0xff7a00, tan: 0xd9c7a0, lav: 0xd9d0ff, lav2: 0xc9bdf7, dark: 0x22222a, pink: 0xf28bb3 };
function shade(m) { m.castShadow = true; m.receiveShadow = true; return m; }
function brick(w, h, d, mat, studs = true) {
  const g = new THREE.Group();
  const m = shade(new THREE.Mesh(rbox(w - 0.02, h, d - 0.02), mat));
  m.position.y = h / 2; g.add(m);
  if (studs) {
    const nx = Math.max(1, Math.round(w / P)), nz = Math.max(1, Math.round(d / P));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const s = shade(new THREE.Mesh(studGeo, mat));
      s.position.set((i - (nx - 1) / 2) * (w / nx), h + 0.085, (j - (nz - 1) / 2) * (d / nz));
      g.add(s);
    }
  }
  return g;
}

// baseplate floor
{
  const NX = 22, NZ = 12, w = NX * P, d = NZ * P, cz = 1.9;
  const plate = shade(new THREE.Mesh(rbox(w, 0.32, d), plastic(C.tan)));
  plate.position.set(0, -0.16, cz); scene.add(plate);
  const inst = new THREE.InstancedMesh(studGeo, plastic(C.tan), NX * NZ);
  const M = new THREE.Matrix4(); let n = 0;
  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) { M.makeTranslation((i - (NX - 1) / 2) * P, 0.085, cz + (j - (NZ - 1) / 2) * P); inst.setMatrixAt(n++, M); }
  inst.receiveShadow = true; scene.add(inst);
}
// back wall: staggered lavender bricks, a window of sky bricks
{
  const bw = 1.6, bh = 0.96, bd = 0.8, rows = 10, cols = 12;
  const inst = new THREE.InstancedMesh(rbox(bw - 0.03, bh - 0.03, bd), plastic(0xffffff), rows * (cols + 1));
  const M = new THREE.Matrix4(), col = new THREE.Color(); let n = 0;
  for (let y = 0; y < rows; y++) for (let c = 0; c <= cols; c++) {
    const xo = (c - cols / 2) * bw + (y % 2 ? bw / 2 : 0);
    const win = y >= 4 && y <= 7 && xo > 3.4 && xo < 7.4;
    M.makeTranslation(xo, y * bh + bh / 2, -3.0); inst.setMatrixAt(n, M);
    inst.setColorAt(n, col.set(win ? 0x8ec5f0 : (c + y) % 3 ? C.lav : C.lav2)); n++;
  }
  inst.count = n; inst.receiveShadow = true; scene.add(inst);
}

// mats: flat plates
function makeMat() { const m = newPlastic(C.violet); const g = brick(3.2, 0.16, 1.6, m); scene.add(g); g.userData.m = m; return g; }
const mats = [makeMat(), makeMat()];

// ---------- brick figures (joints from the 2D poses, px -> world /100) ----------
const POSE = {
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  tree: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-110, -130], fL: [6, -70], kR: [8, -98], fR: [10, 0], eL: [-60, -430], hL: [-8, -540], eR: [60, -430], hR: [8, -540] },
};
POSE.treeLow = Object.assign({}, POSE.tree, { eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] });
function mixPose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
const SEGS = [["sh", "hip", 0.56, "body"], ["hip", "kL", 0.36, "thigh"], ["kL", "fL", 0.34, "shin"], ["hip", "kR", 0.36, "thigh"], ["kR", "fR", 0.34, "shin"], ["sh", "eL", 0.3, "body"], ["eL", "hL", 0.28, "body"], ["sh", "eR", 0.3, "body"], ["eR", "hR", 0.28, "body"]];
function makeFig() {
  const g = new THREE.Group(); scene.add(g);
  const mt = { body: newPlastic(C.violet), thigh: newPlastic(C.violet), shin: newPlastic(C.violet) };
  const segs = SEGS.map(([a, b, w, part]) => { const m = shade(new THREE.Mesh(rbox(w, 1, w), mt[part])); g.add(m); return { a, b, w, m }; });
  const head = new THREE.Group();
  head.add(shade(new THREE.Mesh(rbox(0.76, 0.7, 0.7), mt.body)));
  const st = shade(new THREE.Mesh(studGeo, mt.body)); st.position.y = 0.35 + 0.085; head.add(st);
  g.add(head);
  return { g, mt, segs, head };
}
const tv3a = new THREE.Vector3(), tv3b = new THREE.Vector3();
function setFig(f, p, X, Z, s, hex, o = {}) {
  f.g.visible = o.vis ?? true;
  f.g.position.set(X, 0, Z); f.g.rotation.set(0, 0, -(o.rot || 0));
  const J = (j, v) => v.set(p[j][0] * s / 100, -p[j][1] * s / 100, 0);
  f.mt.body.color.setHex(hex);
  f.mt.thigh.color.setHex((o.hiLegs || 0) > 0.5 ? C.yellow : hex);
  f.mt.shin.color.setHex((o.hiLegs || 0) > 0.5 || (o.hiFeet || 0) > 0.5 ? C.yellow : hex);
  for (const sg of f.segs) {
    J(sg.a, tv3a); J(sg.b, tv3b);
    const len = tv3a.distanceTo(tv3b) + sg.w * s * 0.6;
    sg.m.position.copy(tv3a).add(tv3b).multiplyScalar(0.5);
    sg.m.scale.set(s, len, s);
    sg.m.rotation.set(0, 0, Math.atan2(tv3b.y - tv3a.y, tv3b.x - tv3a.x) - Math.PI / 2);
  }
  J("head", tv3a); f.head.position.copy(tv3a); f.head.scale.setScalar(s);
}
const student = makeFig(), student2 = makeFig(), teacher = makeFig();

// cue bricks (2x1) and a breathing ring
const cueMats = [0, 1, 2, 3, 4].map(() => newPlastic(C.red));
const cues = cueMats.map((m) => { const g = brick(1.6, 0.96, 0.8, m); g.scale.setScalar(0.55); scene.add(g); return g; });
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.09, 12, 48), new THREE.MeshPhysicalMaterial({ color: C.green, roughness: 0.3, clearcoat: 0.85, transparent: true, opacity: 0.8 }));
ring.castShadow = true; scene.add(ring);

// ---------- framing ----------
const tv = new THREE.Vector3();
function place(look, dir, dist) { camera.position.copy(look).addScaledVector(dir, dist); camera.lookAt(look); camera.updateMatrixWorld(); }
function bbox(pts) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const p of pts) { tv.copy(p).project(camera); const X = (tv.x + 1) * 540, Y = (1 - tv.y) * 960; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); } return { x0, x1, y0, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; }
function boxPts(x0, x1, y0, y1, z0, z1) { const o = []; for (const X of [x0, x1]) for (const Y of [y0, y1]) for (const Z of [z0, z1]) o.push(new THREE.Vector3(X, Y, Z)); return o; }
function fit(pts, dirArr, box) {
  const dir = new THREE.Vector3(...dirArr).normalize();
  const look = new THREE.Vector3(); pts.forEach((p) => look.add(p)); look.multiplyScalar(1 / pts.length);
  const bw = box[2] - box[0], bh = box[3] - box[1], cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
  let dist = 12;
  for (let it = 0; it < 5; it++) {
    let lo = 2, hi = 80;
    for (let k = 0; k < 28; k++) { const mid = (lo + hi) / 2; place(look, dir, mid); const b = bbox(pts); if (b.w <= bw && b.h <= bh) hi = mid; else lo = mid; }
    dist = hi; place(look, dir, dist);
    const b = bbox(pts), hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * dist, ppu = 960 / hh;
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    look.addScaledVector(right, (b.cx - cx) / ppu).addScaledVector(up, -(b.cy - cy) / ppu);
  }
  return { look, dir, dist };
}
const ONE = boxPts(-2.0, 2.0, -0.1, 6.4, -0.8, 1.0);
const SHOTS = {
  s1: () => fit(boxPts(-3.0, 4.0, -0.1, 6.0, -0.8, 1.0), [0.25, 0.3, 1], [110, 640, 910, 1400]),
  s2: () => fit(boxPts(-2.6, 2.6, -0.1, 7.6, -0.8, 1.0), [0.1, 0.15, 1], [120, 600, 900, 1400]),
  s3: () => fit(ONE, [-0.25, 0.2, 1], [140, 620, 880, 1400]),
  s4: () => fit(boxPts(-2.0, 3.8, -0.1, 6.0, -0.8, 1.0), [0.12, 0.25, 1], [110, 620, 910, 1400]),
  s5: () => fit(ONE, [0.0, 0.18, 1], [150, 620, 870, 1400]),
  s6: () => fit(boxPts(-3.8, 3.8, -0.1, 5.6, -0.8, 1.0), [0.0, 0.25, 1], [90, 640, 930, 1400]),
  s7: () => fit(ONE, [-0.3, 0.35, 1], [190, 980, 830, 1450]),
};
SHOTS.s8 = SHOTS.s7;
const shotCache = {};
function shoot(id, k) { const s = shotCache[id] || (shotCache[id] = SHOTS[id]()); place(s.look, s.dir, s.dist * lerp(1.07, 1.0, k)); }
const scr = (v) => { tv.copy(v).project(camera); return [(tv.x + 1) * 540, (1 - tv.y) * 960]; };

// ---------- overlay text (toy plate labels) ----------
const ov = document.createElement("canvas");
ov.width = 1080; ov.height = 1920;
ov.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:2";
document.getElementById("stage").appendChild(ov);
const x = ov.getContext("2d");
const RED = "#e3242b", GREEN = "#1fae4b", ORANGE = "#ff7a00", WHITE = "#ffffff", INK = "#1b1b2f", YELLOW = "#ffd21f", VIOLET = "#7c5cff";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
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
      const s0 = t0 + wi * 0.08, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      const k = Math.floor(kk * 4 + 1e-6) / 4;
      x.save(); x.translate(X + ws[i] / 2, Y - (1 - k) * 60); x.globalAlpha = a * o;
      x.fillStyle = "rgba(27,27,47,0.35)"; x.fillText(p, 7, 9);
      x.lineWidth = Math.max(10, px * 0.15); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, "#ffffff", flashK * 0.7) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.08;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  X = cl(X, 140, 900); Y = cl(Y, 300, 1400);
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.5, s = 0.6 + 0.4 * Math.floor(a * 4) / 4;
  X = cl(X, 70 + w / 2, 950 - w / 2);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(27,27,47,0.3)"; rr(-w / 2 + 6, -h / 2 + 8, w, h, 10); x.fill();
  x.fillStyle = color; x.strokeStyle = INK; x.lineWidth = 6;
  [-w / 4, w / 4].forEach((sx) => { rr(sx - 22, -h / 2 - 14, 44, 18, 6); x.fill(); x.stroke(); });
  rr(-w / 2, -h / 2, w, h, 10); x.fill(); x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
  for (const [lw, c] of [[44, INK], [26, color]]) {
    x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
    x.beginPath();
    if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); } else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
    x.stroke();
  }
  x.restore();
}

// ---------- one frame ----------
const V = (a, b, c) => new THREE.Vector3(a, b, c);
const CUE_TXT = ["FEET!", "KNEES!", "HIPS!", "SHOULDERS!", "GAZE!"];
function reset() {
  [student, student2, teacher].forEach((f) => (f.g.visible = false));
  cues.forEach((c) => { c.visible = false; c.rotation.set(0, 0, 0); });
  ring.visible = false;
  mats.forEach((m) => { m.visible = false; m.userData.m.color.setHex(C.violet); });
}
function matAt(i, X, Z, hex) { const m = mats[i]; m.visible = true; m.position.set(X, 0, Z); m.userData.m.color.setHex(hex); }
function headTop(f) { return f.head.localToWorld(V(0, 0.9, 0)); }

function frame(t) {
  const tq = q(t);
  const { id, u: uq, d } = sceneOf(tq);
  reset();
  shoot(id, cl(uq / Math.max(0.5, d)));
  const U = (w, n) => at(id, w, n);
  const cuePos = [];

  if (id === "s1") {
    // the teacher fires five cue bricks at once; they swarm the student's head and she starts to wobble
    const St = U("stack");
    const wob = sm(St, St + 0.6, uq) * Math.sin(uq * 11) * 0.07;
    matAt(0, -1.2, 0, C.violet);
    setFig(student, POSE.tree, -1.2, 0, 0.95, sm(St, St + 0.5, uq) > 0.5 ? C.orange : C.violet, { rot: wob });
    setFig(teacher, POSE.stand, 2.9, 0.2, 0.9, C.red);
    student.g.updateMatrixWorld();
    const hp = headTop(student);
    cues.forEach((c, i) => {
      const k = sm(St + i * 0.1, St + i * 0.1 + 0.35, uq);
      if (k <= 0) return;
      c.visible = true;
      const ang = i / 5 * Math.PI * 2 + uq * 2.2;
      const tgt = V(hp.x + Math.cos(ang) * 1.5, hp.y + 0.2 + Math.sin(ang) * 0.8, 0.6);
      c.position.lerpVectors(V(2.9, 3.8, 0.3), tgt, k); c.position.y += Math.sin(Math.PI * k) * 1.2;
      c.rotation.set(0.3, uq * 3 + i, 0.4);
      cueMats[i].color.setHex(C.red);
      cuePos.push([c.position.clone(), k]);
    });
  }
  if (id === "s2") {
    // two green cue bricks stack on her head; three red ones bounce off and drop to the floor
    matAt(0, 0, 0, C.violet);
    setFig(student, POSE.treeLow, 0, 0, 1, C.violet);
    student.g.updateMatrixWorld();
    const hp = headTop(student);
    const O = U("one"), Tw = U("two"), Ti = U("time");
    [[O, 0], [Tw, 1]].forEach(([T, i]) => {
      const k = back(T - 0.1, T + 0.25, uq); if (uq < T - 0.1) return;
      const c = cues[i]; c.visible = true; cueMats[i].color.setHex(C.green);
      c.position.set(hp.x, hp.y - 0.1 + i * 0.6 + (1 - k) * 4, 0);
      cuePos.push([c.position.clone(), 1]);
    });
    [2, 3, 4].forEach((i, j) => {
      const T = Ti - 0.25 + j * 0.12; if (uq < T) return;
      const c = cues[i]; c.visible = true; cueMats[i].color.setHex(C.red);
      const fall = cl((uq - T) / 0.9), side = j - 1 || 0.6;
      const yTop = hp.y + 1.3;
      c.position.set(side * 0.4 + side * 2.6 * fall, yTop + 3 * (1 - cl((uq - T) / 0.25)) * (fall < 0.28 ? 1 : 0) + (fall < 0.28 ? 0 : -yTop * sm(0.28, 1, fall) + Math.sin(Math.PI * sm(0.28, 1, fall)) * 0.9), 0.4);
      c.position.y = Math.max(0, c.position.y);
      c.rotation.set(0, 0, side * fall * 2.5);
      cuePos.push([c.position.clone(), 1]);
    });
  }
  if (id === "s3") {
    // red cue bricks tumble around her head: noise. She wobbles.
    matAt(0, 0, 0, C.violet);
    const N = sm(U("noise") - 0.3, U("noise") + 0.1, uq);
    const Wb = sm(U("wobble") - 0.4, U("wobble"), uq);
    setFig(student, POSE.tree, 0, 0, 1, Wb > 0.3 || N > 0.5 ? C.orange : C.violet, { rot: (0.03 + 0.12 * Wb) * Math.sin(uq * 9) });
    student.g.updateMatrixWorld();
    const hp = headTop(student);
    cues.forEach((c, i) => {
      c.visible = N > 0.05; cueMats[i].color.setHex(C.red);
      const ang = i / 5 * Math.PI * 2 + uq * 3.4;
      c.position.set(hp.x + Math.cos(ang) * (1.3 + 0.4 * Math.sin(uq * 5 + i)) * N, hp.y + 0.3 + Math.sin(ang * 1.3) * 0.9, 0.5 + Math.sin(ang) * 0.5);
      c.rotation.set(uq * 4 + i, uq * 3, i);
    });
  }
  if (id === "s4") {
    // base first: feet light up, then legs; arms stay down. The teacher gives one cue at a time.
    matAt(0, 0, 0, C.green);
    const F = sm(U("feet") - 0.15, U("feet") + 0.1, uq), L = sm(U("legs") - 0.15, U("legs") + 0.1, uq);
    setFig(student, POSE.treeLow, 0, 0, 1, C.green, { hiFeet: F, hiLegs: L });
    setFig(teacher, POSE.stand, 2.9, 0.2, 0.75, C.red);
  }
  if (id === "s5") {
    // a breath to settle (the ring grows and shrinks), then the next cue: arms rise
    matAt(0, 0, 0, C.green);
    const Nx = sm(U("next") - 0.1, U("cue") + 0.4, uq);
    const Bk = sm(U("settle") - 0.2, U("settle") + 0.1, uq);
    setFig(student, mixPose(POSE.treeLow, POSE.tree, Nx), 0, 0, 1, C.green);
    ring.visible = Bk > 0.05;
    const br = 0.5 - 0.5 * Math.cos(uq * 2.6);
    ring.position.set(0, 2.6, 0.2); ring.scale.setScalar((2.0 + 0.6 * br) * Bk); ring.material.opacity = 0.75;
  }
  if (id === "s6") {
    // side 1: base only. side 2: the fine details get added
    matAt(0, -2.0, 0, C.green); matAt(1, 2.0, 0, C.green);
    setFig(student, POSE.tree, -2.0, 0, 0.85, C.green);
    setFig(student2, POSE.tree, 2.0, 0, 0.85, C.green);
  }
  if (id === "s7" || id === "s8") {
    matAt(0, 0, 0, C.green);
    setFig(student, POSE.tree, 0, 0, 1, C.green);
  }
  renderer.render(scene, camera);

  // ---------- overlay ----------
  const tt = sceneOf(t), u = tt.u; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, 1080, 1920);
  const pin = (v, dy = 0) => { const [X, Y] = scr(v); return [X, Y + dy]; };
  if (id === "s1") {
    words(["NEVER STACK", "FIVE CUES"], RED, 400, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
    cuePos.forEach(([p, k], i) => { const [X, Y] = pin(p, -70); tag(CUE_TXT[i], X, Y, RED, k > 0.6 ? 1 : 0, 32); });
    const [tx, ty] = pin(V(2.9, 0, 0.6));
    tag("5 CUES AT ONCE", tx - 60, ty + 70, RED, sm(at("s1", "five") - 0.1, at("s1", "five") + 0.1, u), 38);
  }
  if (id === "s2") {
    words(["ONE OR TWO", "AT A TIME"], RED, 400, 0.0, 1, 150, flash(u, at("s2", "two")) * 0.6);
    const hp = headTop(student);
    const [hx, hy] = pin(hp);
    tag("1. FEET", hx - 240, hy + 40, GREEN, sm(at("s2", "one") - 0.05, at("s2", "one") + 0.15, u), 40);
    tag("2. LEGS", hx + 240, hy - 40, GREEN, sm(at("s2", "two") - 0.05, at("s2", "two") + 0.15, u), 40);
    const Ti = at("s2", "time");
    stamp("x", hx + 250, hy + 420, back(Ti + 0.2, Ti + 0.45, u) * 0.6, u > Ti + 0.2 ? 1 : 0, RED);
  }
  if (id === "s3") {
    words(["THE REST", "IS NOISE"], RED, 400, 0.0, 1, 150, flash(u, at("s3", "noise")) * 0.6);
    const [hx, hy] = pin(headTop(student));
    tag("NOISE", hx - 230, hy - 120, RED, sm(at("s3", "noise") - 0.2, at("s3", "noise") + 0.1, u), 44);
    const [fx, fy] = pin(V(0, 0, 0.8));
    tag("WOBBLE", fx + 230, fy - 40, ORANGE, sm(at("s3", "wobble") - 0.3, at("s3", "wobble"), u), 44);
  }
  if (id === "s4") {
    words(["BASE FIRST"], GREEN, 400, 0.0, 1, 160, flash(u, at("s4", "base")) * 0.6);
    const F = sm(at("s4", "feet") - 0.15, at("s4", "feet") + 0.1, u), L = sm(at("s4", "legs") - 0.15, at("s4", "legs") + 0.1, u);
    const [fx, fy] = pin(V(0, 0.3, 0.8));
    tag("1. FEET", fx - 220, fy + 20, YELLOW, F, 42);
    const [kx, ky] = pin(V(-1.0, 1.4, 0.4));
    tag("2. LEGS", kx - 120, ky, YELLOW, L, 42);
    const [tx, ty] = pin(V(2.9, 3.6, 0.2));
    tag("FEET", tx, ty - 90, GREEN, F * (1 - L), 40);
    tag("NOW LEGS", tx - 40, ty - 90, GREEN, L, 40);
  }
  if (id === "s5") {
    words(["ONE BREATH", "TO SETTLE"], GREEN, 400, 0.0, 1, 150, flash(u, at("s5", "breath")) * 0.6);
    const Nx = sm(at("s5", "next") - 0.1, at("s5", "next") + 0.1, u);
    const [fx, fy] = pin(V(0, 0, 0.8));
    tag("BREATHE...", fx, fy + 70, GREEN, sm(at("s5", "breath") - 0.1, at("s5", "breath") + 0.1, u) * (1 - Nx), 42);
    const [hx, hy] = pin(V(0, 5.6, 0));
    tag("NOW ARMS UP", hx + 160, hy - 40, GREEN, Nx, 40);
  }
  if (id === "s6") {
    words(["DETAILS ON", "SIDE TWO"], GREEN, 400, 0.0, 1, 150, flash(u, at("s6", "second")) * 0.6);
    const D = sm(at("s6", "second") - 0.15, at("s6", "side", 1) + 0.2, u);
    const [ax, ay] = pin(V(-2.0, 0, 0.9)), [bx, by] = pin(V(2.0, 0, 0.9));
    tag("SIDE 1", ax, ay + 60, GREEN, 1, 40);
    tag("SIDE 2", bx, by + 60, YELLOW, sm(at("s6", "second") - 0.1, at("s6", "second") + 0.1, u), 40);
    const [px, py] = pin(V(-2.0, 2.5, 0.5));
    tag("BASE ONLY", px, py, GREEN, sm(0.1, 0.3, u) * (1 - D * 0.5), 36);
    const [gx, gy] = pin(V(2.0, 3.6, 0.5)), [sx, sy] = pin(V(2.0, 2.4, 0.5));
    tag("SOFT GAZE", gx, gy, YELLOW, sm(at("s6", "fine") - 0.1, at("s6", "fine") + 0.1, u), 34);
    tag("LONG SPINE", sx, sy, YELLOW, D, 34);
  }
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.25)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["ONE CUE."], ORANGE, 470, 0.0, 1, 170, flash(u, 0.05));
    words(["ONE BREATH."], ORANGE, 660, at("s7", "one", 2) - 0.05, 1, 170, flash(u, at("s7", "breath")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(20,24,44,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = Math.floor(back(0.0, 0.35, u) * 4 + 1e-6) / 4;
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, k), Math.max(0.01, k)); x.lineWidth = 10; x.strokeStyle = INK;
    x.fillStyle = VIOLET; x.beginPath(); x.arc(0, 0, 130, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = "#9b85ff"; for (const [sx, sy] of [[-45, -45], [45, -45], [-45, 45], [45, 45]]) { x.beginPath(); x.arc(sx, sy, 30, 0, Math.PI * 2); x.fill(); x.stroke(); }
    x.fillStyle = GREEN; x.beginPath(); x.arc(0, 0, 30, 0, Math.PI * 2); x.fill(); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], YELLOW, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["one-cue-bricks"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
