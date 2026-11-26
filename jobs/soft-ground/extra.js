// Batch 12.11 helpers on top of kit.js: curved road track, passenger, standing person, fitted text, end card + CTA.
import { THREE, scene, camera, box, tube, glow, mFrame, mSolid, mEdge, VIOLET, ORANGE, RED, GREEN, WHITE, sm, hud, BRAND } from "./kit.js";

// ---------- track: segs [{len}] straight or [{len, R}] arc (R>0 left, R<0 right) -> C(s) = [x, z, heading] ----------
export function track(segs) {
  const step = (sg, d, x, z, a) => {
    if (!sg.R) return [x - Math.sin(a) * d, z - Math.cos(a) * d, a];
    const k = 1 / sg.R, b = a + k * d;
    return [x + (Math.cos(b) - Math.cos(a)) / k, z - (Math.sin(b) - Math.sin(a)) / k, b];
  };
  const st = []; let x = 0, z = 0, a = 0, s = 0;
  for (const sg of segs) { st.push({ s, x, z, a, sg }); [x, z, a] = step(sg, sg.len, x, z, a); s += sg.len; }
  st.push({ s, x, z, a, sg: { len: 1e9 } });
  const C = (q) => { let i = 0; while (i < st.length - 1 && q > st[i + 1].s) i++; const e = st[i]; return step(e.sg, q - e.s, e.x, e.z, e.a); };
  const P = (q, o = 0) => { const [cx, cz, h] = C(q); return [cx + o * Math.cos(h), cz - o * Math.sin(h)]; };
  return { C, P, len: s };
}

// ---------- road ribbon along a track ----------
const mAs = new THREE.MeshStandardMaterial({ color: 0x0f0c2c, roughness: 0.9 });
export function ribbon(P, o0, o1, s0, s1, mat, y = 0.004, step = 1) {
  const pos = [], idx = [];
  let n = 0;
  for (let s = s0; s <= s1 + 1e-6; s += step, n++) { const A = P(s, o0), B = P(s, o1); pos.push(A[0], y, A[1], B[0], y, B[1]); if (n) { const k = 2 * n; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.material.side = THREE.DoubleSide; scene.add(m); return m;
}
// two-lane road: asphalt, edge lines (gaps = [[s0,s1,side]] leave the edge open, side -1 left / 1 right), centre dashes, lamps
export function buildRoad(P, s0, s1, { LW = 3.6, gaps = [], lamps = true, dashHex = VIOLET } = {}) {
  ribbon(P, -LW - 0.5, LW + 0.5, s0, s1, mAs);
  for (const sd of [-1, 1]) {
    let a = s0;
    for (const [g0, g1, gs] of gaps.filter((g) => g[2] === sd).sort((p, q) => p[0] - q[0])) { if (g0 > a) ribbon(P, sd * LW - 0.04, sd * LW + 0.04, a, g0, mFrame, 0.02, 0.5); a = g1; }
    if (a < s1) ribbon(P, sd * LW - 0.04 + sd * 0.3, sd * LW + 0.04 + sd * 0.3, a, s1, mFrame, 0.02, 0.5);
  }
  const mDash = glow(dashHex, 1.1);
  for (let s = s0; s < s1; s += 4) ribbon(P, -0.06, 0.06, s, s + 1.6, mDash, 0.012, 0.4);
  if (lamps) for (let s = s0, i = 0; s < s1; s += 20, i++) {
    const sd = i % 2 ? -1 : 1;
    if (gaps.some(([g0, g1, gs]) => gs === sd && s > g0 - 3 && s < g1 + 3)) continue;
    const [x, z] = P(s, sd * (LW + 1.6)), [x2, z2] = P(s, sd * (LW + 1.2));
    scene.add(box(0.1, 4, 0.1, x, 2, z, mFrame, false), box(0.12, 0.08, 0.12, x2, 4, z2, glow(VIOLET, 2.0), false));
  }
}

// ---------- materials for people ----------
export const mSkin = new THREE.MeshStandardMaterial({ color: 0xe0a27c, emissive: 0x5a2a1a, roughness: 0.6 });
const solid = () => mSolid.clone();

// ---------- passenger on the rear seat (adds to bike.lean). Pivot at the hips. ----------
export function addPillion(B) {
  const p = new THREE.Group(); p.position.set(0, 0.97, 0.6); B.lean.add(p);
  const mT = solid(), mL = solid(), mLow = solid(), mA = solid(), mF = solid();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.36, 4, 10), mT); torso.position.set(0, 0.34, 0.03); torso.rotation.x = -0.18;
  const headG = new THREE.Group(); headG.position.set(0, 0.7, -0.03);
  const mH = solid(), head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mH);
  const visor = box(0.22, 0.06, 0.03, 0, 0.01, -0.15, glow(VIOLET, 2), false);
  headG.add(head, visor);
  const thighs = [-1, 1].map((s) => tube([s * 0.14, 0, 0], [s * 0.19, -0.03, -0.34], 0.12, mL));
  const shins = [-1, 1].map((s) => tube([s * 0.19, -0.03, -0.34], [s * 0.23, -0.47, -0.14], 0.1, mLow));
  const feet = [-1, 1].map((s) => box(0.11, 0.08, 0.24, s * 0.24, -0.5, -0.2, mF));
  const waist = [-1, 1].map((s) => tube([s * 0.21, 0.54, 0.0], [s * 0.18, 0.16, -0.36], 0.08, mA));
  const rails = [-1, 1].map((s) => tube([s * 0.21, 0.54, 0.0], [s * 0.3, 0.02, 0.16], 0.08, mA));
  const knees = [-1, 1].map((s) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), glow(GREEN, 2.2)); k.position.set(s * 0.2, -0.03, -0.34); k.visible = false; return k; });
  const hands = [-1, 1].map((s) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), glow(GREEN, 2.2)); k.visible = false; return k; });
  p.add(torso, headG, ...thighs, ...shins, ...feet, ...waist, ...rails, ...knees, ...hands);
  rails.forEach((r) => (r.visible = false));
  const P = {
    g: p, headG, visor, torso, knees, hands, mats: { torso: mT, legs: mL, lower: mLow, arms: mA, feet: mF, head: mH },
    // counter: 0 = leans with the bike, 1 = stays upright (fights the lean); look: -1 left shoulder, 1 right, 0 straight
    set({ counter = 0, look = 0, grip = "waist", knees: kn = 0, handsGlow = 0, slide = 0 } = {}) {
      p.rotation.z = -B.lean.rotation.z * counter;
      headG.rotation.y = -look * 0.75; headG.position.x = look * 0.12; torso.position.x = look * 0.05;
      waist.forEach((w) => (w.visible = grip === "waist")); rails.forEach((r) => (r.visible = grip === "rails"));
      knees.forEach((k) => (k.visible = kn > 0.01, k.scale.setScalar(0.6 + 0.6 * kn)));
      hands.forEach((h, i) => { const s = i ? 1 : -1; h.visible = handsGlow > 0.01; h.scale.setScalar(0.6 + 0.6 * handsGlow); h.position.set(...(grip === "waist" ? [s * 0.18, 0.16, -0.36] : [s * 0.3, 0.02, 0.16])); });
      p.position.z = 0.6 - slide * 0.28; p.rotation.x = slide * 0.35;
    },
  };
  P.set();
  return P;
}

// ---------- standing person (feet at y=0, faces -z). armR/armL pivot at the shoulder ----------
export function makePerson() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body); scene.add(g);
  const mT = solid(), mL = solid(), mLow = solid(), mA = solid(), mF = solid(), mH = solid();
  const legs = [-1, 1].map((s) => tube([s * 0.12, 0.92, 0], [s * 0.13, 0.5, 0], 0.15, mL));
  const shins = [-1, 1].map((s) => tube([s * 0.13, 0.5, 0], [s * 0.13, 0.08, 0], 0.12, mLow));
  const feet = [-1, 1].map((s) => box(0.13, 0.09, 0.28, s * 0.13, 0.05, -0.05, mF));
  const torso = box(0.44, 0.6, 0.24, 0, 1.22, 0, mT);
  const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), mH); head.position.set(0, 1.7, 0);
  head.add(new THREE.LineSegments(new THREE.EdgesGeometry(head.geometry), mEdge));
  const visor = box(0.22, 0.06, 0.03, 0, 1.71, -0.14, glow(VIOLET, 2), false);
  const arm = (s) => { const a = new THREE.Group(); a.position.set(s * 0.29, 1.47, 0); a.add(tube([0, 0, 0], [0, -0.62, 0], 0.1, mA)); const h = box(0.1, 0.12, 0.1, 0, -0.68, 0, mA, false); a.add(h); a.userData.hand = h; return a; };
  const armL = arm(-1), armR = arm(1);
  body.add(...legs, ...shins, ...feet, torso, head, visor, armL, armR);
  return { g, body, armL, armR, head, visor, mats: { torso: mT, legs: mL, lower: mLow, arms: mA, feet: mF, head: mH } };
}

// ---------- text fitted to a 1024x512 canvas; lines = [text, rel size] ----------
export function fitText(lines, hex = ORANGE, k = 2.1, width = 2) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  const x = c.getContext("2d"); x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
  const L = lines.map((l) => (typeof l === "string" ? [l, 1] : l));
  const sizes = L.map(([t, r]) => { x.font = `900 100px Inter, Arial, sans-serif`; return Math.min(190 * r, (980 / x.measureText(t).width) * 100); });
  const tot = sizes.reduce((a, b) => a + b * 1.08, 0), sc = Math.min(1, 480 / tot);
  let y = 256 - (tot * sc) / 2;
  L.forEach(([t], i) => { const px = sizes[i] * sc; x.font = `900 ${px}px Inter, Arial, sans-serif`; x.fillText(t, 512, y + px * 0.54); y += px * 1.08; });
  const col = new THREE.Color(hex), lum = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b; // keep bright hues (green/white) under the bloom threshold
  const mat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: col.multiplyScalar(Math.min(k, 0.7 / lum)), transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 2), mat);
  m.renderOrder = 20; m.userData.w = width; m.userData.fill = (tot * sc) / 512; m.visible = false; scene.add(m); // fill = content height / plane height
  return m;
}

// ---------- s8 call to action: dark backdrop, brand.json cta (big) + sub (small) ----------
const back = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x080622, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
back.renderOrder = 30; back.visible = false; camera.add(back);
const tDl = fitText(BRAND.cta || ["FOLLOW", "FOR MORE"], ORANGE, 2.2), tBio = fitText([[BRAND.sub || "LINK IN BIO", 0.7]], WHITE, 1.15);
tDl.renderOrder = tBio.renderOrder = 31; // CTA covers world tags
const bar = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(ORANGE).multiplyScalar(1.6), transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
bar.renderOrder = 31; bar.visible = false; camera.add(bar);
// a = 0..1 fade-in, t = global time: backdrop goes dark fast, text slides up, then breathes so the end never freezes
export function cta(a, t = 0) {
  const ab = Math.min(1, a * 3); back.visible = bar.visible = a > 0.01; back.material.opacity = ab;
  const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2.1; back.position.set(0, 0, -2.1); back.scale.set(hh * 3, hh * 3, 1);
  const ta = sm(0.25, 1, a), up = (1 - ta) * -0.08, br = 1 + 0.025 * Math.sin(t * 3.2);
  hud(tDl, 0, 0.16 + up, 0.8 * br, ta); hud(tBio, 0, -0.2 + up, 0.6, ta);
  const hw2 = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2 * camera.aspect;
  bar.position.set(0, -0.1 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2, -2); bar.scale.set(hw2 * 1.1 * sm(0.5, 1, a) * (0.85 + 0.15 * Math.sin(t * 2.4) ** 2), 0.018, 1); bar.material.opacity = ta;
}

// ================= batch 12.11 story helpers =================
import { S, W, LEAD, IDS, g, flash, label, makeBike, pathState, bloom } from "./kit.js";
export const END = (id) => S[id][0] + S[id][1];
// words of s1..s8 lines; tag = small label that floats above things
export const tag = (txt, hex = ORANGE, k = 2.0) => fitText([txt], hex, k);
// split a long title over two lines
function split(t) { if (t.length <= 16) return [t]; const w = t.split(" "); let best = 1, bd = 1e9; for (let i = 1; i < w.length; i++) { const d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length); if (d < bd) { bd = d; best = i; } } return [w.slice(0, best).join(" "), w.slice(best).join(" ")]; }

// ---- screen captions keyed to words: one slot at the top, newest wins ----
const CAPS = [], BOOMS = [];
export function cap(id, word, lines, hex = ORANGE, { n = 1, until = null, untilN = 1, y = 0.62, w = 0.7, boom = 0 } = {}) {
  const m = fitText(typeof lines === "string" ? [lines] : lines, hex, 2.1);
  const st = g(id, word, n) - 0.1, en = until ? (Array.isArray(until) ? g(until[0], until[1], untilN) - 0.1 : END(until)) : END(id);
  CAPS.push({ m, st, en, y, w }); if (boom) BOOMS.push([st + 0.1, boom]);
  return m;
}
export const boom = (id, word, k = 0.8, n = 1) => BOOMS.push([g(id, word, n), k]);
export function title(text) {
  const has = W.s1.words.some((w) => /^never/i.test(w.text)), T = has ? g("s1", "never") : S.s1[0] + 0.3; // script may not say "never"
  const w0 = W.s1.words[0].text.replace(/[^a-z0-9']/gi, ""), m = cap("s1", has ? "never" : w0, split(text), RED, { until: "s1", w: 0.84, y: 0.6 });
  CAPS.at(-1).st = Math.min(T - 0.1, 0.9); BOOMS.push([T, 0.45]); return m;
}
// end card: big answer in a dark panel so it never fights the scene
export function endCard(lines) { const f = W.s7.words[0].text; const m = cap("s7", f.replace(/[^a-z0-9']/gi, ""), lines.map((l) => (Array.isArray(l) ? l : [l, 1])), ORANGE, { y: 0.4, w: 0.8 }); CAPS.at(-1).panel = true; return m; }
const panel = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x0a0828, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false }));
panel.renderOrder = 19; panel.visible = false;

// ---------- "COMMENT <WORD>" sticker (brand.json "comment": {"word","badge","at"}): big card early, then a small pill top-right ----------
function stickerCanvas(word, badge, small) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512; const x = c.getContext("2d");
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect(X, Y, w, h, r); };
  const Y0 = small ? 180 : 150, H = small ? 150 : 210;
  x.fillStyle = "rgba(14,12,40,0.92)"; rr(40, Y0, 944, H, 40); x.fill(); x.strokeStyle = "rgba(160,140,255,0.6)"; x.lineWidth = 4; x.stroke();
  const ic = H - 50, iy = Y0 + 25; x.fillStyle = "#7b5cff"; rr(70, iy, ic, ic, 28); x.fill(); // app icon
  x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = `900 ${ic * 0.6}px Inter, Arial, sans-serif`; x.fillText("A", 70 + ic / 2, iy + ic / 2 + 4);
  x.textAlign = "left"; x.fillStyle = "#a8a4c8"; x.font = `700 ${small ? 34 : 40}px Inter, Arial, sans-serif`; x.fillText("COMMENT", 100 + ic, Y0 + H * 0.3);
  x.fillStyle = "#fff"; x.font = `900 ${small ? 76 : 104}px Inter, Arial, sans-serif`; x.fillText(word, 98 + ic, Y0 + H * 0.66);
  const bx = 900, by = Y0 + H / 2; x.fillStyle = "#4f7cff"; x.beginPath(); x.arc(bx, by, H * 0.26, 0, 7); x.fill(); // send button
  x.fillStyle = "#fff"; x.beginPath(); x.moveTo(bx - 18, by - 16); x.lineTo(bx + 22, by); x.lineTo(bx - 18, by + 16); x.lineTo(bx - 8, by); x.fill();
  if (badge && !small) { x.font = `900 40px Inter, Arial, sans-serif`; const w = x.measureText(badge).width + 50; x.fillStyle = "#fff"; rr(984 - w, Y0 - 34, w, 66, 33); x.fill(); x.fillStyle = "#3d2bd6"; x.textAlign = "center"; x.fillText(badge, 984 - w / 2, Y0 - 1); }
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xb8b8b8, transparent: true, toneMapped: false, depthWrite: false, depthTest: false, fog: false })); // dimmed under the bloom threshold
  m.renderOrder = 25; m.userData.w = 2; m.visible = false; scene.add(m); return m;
}
const CM = BRAND.comment, stBig = CM && stickerCanvas(CM.word, CM.badge, false), stSmall = CM && stickerCanvas(CM.word, null, true);
// shown from CM.at s (default 3) as a big card for 3.5 s, then a small pill top-right until the end card
function sticker(t, endT) {
  if (!CM) return; const T0 = CM.at ?? 3, T1 = T0 + 3.5, out = 1 - sm(endT - 0.2, endT, t);
  hud(stBig, 0, 0.87, 0.8, sm(T0, T0 + 0.25, t) * (1 - sm(T1, T1 + 0.25, t)) * out);
  hud(stSmall, 0.52, 0.9, 0.42, sm(T1, T1 + 0.25, t) * out);
}
// call every frame; returns the bloom spike
export function overlays(t) {
  let best = null;
  for (const c of CAPS) { c.m.visible = false; if (t >= c.st && t < c.en && (!best || c.st >= best.st)) best = c; }
  panel.visible = false;
  if (best) {
    const a = sm(best.st, best.st + 0.15, t) * (1 - sm(best.en - 0.12, best.en, t)); hud(best.m, 0, best.y, best.w, a);
    if (best.panel && best.m.visible) { // panel behind the end card, sized to the clamped text
      if (panel.parent !== camera) camera.add(panel);
      const s = best.m.scale.x * best.m.userData.w; panel.position.copy(best.m.position); panel.position.z -= 0.01;
      panel.scale.set(s * 1.08, s * 0.5 * best.m.userData.fill + 0.12, 1); panel.material.opacity = 0.82 * a; panel.visible = true;
    }
  }
  cta(S.s8 ? sm(S.s8[0] - 0.1, S.s8[0] + 0.6, t) : 0, t);
  sticker(t, S.s7 ? S.s7[0] : 1e9);
  let spike = 0; for (const [T, k] of BOOMS) spike += flash(t, T) * k;
  return spike;
}
// a world-space tag above a point (bike / person)
export function tagAt(m, x, y, z, a, s = 1.6) { label(m, x, y, z, s, a); }

// ---- straight-road helpers: road along -z, s = distance, o = lateral offset (right +) ----
export const SP = (s, o = 0) => [o, -s];
export const fixed = (s, o) => () => [o, -s];
// bike group: makes n bikes; set(i, fn, t, hex)
export function bikes(n, opt) { return Array.from({ length: n }, () => makeBike(opt)); }
export function ride(B, fn, t, hex, extra = {}) {
  const st = fn ? pathState(fn, t) : null;
  if (st && extra.lean != null) st.lean += extra.lean;
  if (st && extra.h != null) st.h += extra.h;
  if (st && extra.still) { st.v = 0; }
  B.set(st, fn, t, { hex, trailOn: extra.trail !== false });
  if (st && extra.down != null) { // tipped over: rider hidden, bike on its side
    B.rider.visible = extra.down < 0.5;
  } else B.rider.visible = true;
  return st;
}
// lay a bike flat (lean +-1.45) with a slide; k 0..1
export const downLean = (k, side = 1) => side * 1.45 * k;

// ---- person pose: x,z, facing h (0 = -z), lie 0..1 (on their back), arms in radians (raise forward/up) ----
export function pose(P, { x = 0, z = 0, h = 0, lie = 0, armR = 0, armL = 0, vis = true, hex = null } = {}) {
  P.g.visible = vis; if (!vis) return;
  P.g.position.set(x, 0.18 * lie, z); P.g.rotation.set(0, h, 0);
  P.body.rotation.set(-Math.PI / 2 * lie, 0, 0); P.body.position.set(0, 0, 0);
  P.armR.rotation.set(armR, 0, 0); P.armL.rotation.set(armL, 0, 0);
  if (hex != null) for (const k of ["torso", "legs"]) P.mats[k].emissive.set(hex).multiplyScalar(0.35);
}
// arm angle that points forward and down (hazard signal) / straight out / up
export const ARM = { down: 0, out: Math.PI / 2, point: 1.2, up: Math.PI * 0.95, wave: 2.6 };
// distance travelled under a speed profile v(t) (numeric, 0.01 s), D(t0) = 0
export function dist(v, t0, t1) {
  const dt = 0.01, n = Math.ceil((t1 - t0) / dt) + 2, A = new Float64Array(n);
  for (let i = 1; i < n; i++) A[i] = A[i - 1] + v(t0 + (i - 0.5) * dt) * dt;
  return (t) => { const f = Math.min(n - 1.0001, Math.max(0, (t - t0) / dt)), i = Math.floor(f); return A[i] + (A[i + 1] - A[i]) * (f - i) + (t > t0 + (n - 1.0001) * dt ? v(t1) * (t - t0 - (n - 1.0001) * dt) : 0) + (t < t0 ? v(t0) * (t - t0) : 0); };
}
// ---- rider hand / foot signals: replaces the static arm (or shin+foot) on one side while active ----
// set({ arm: -1|1|0, armA: 0 down .. PI/2 out sideways, armF: forward tilt, leg: -1|1|0, legA, glow: 0..1 })
export function limbs(B) {
  const r = B.rider, ch = r.children, mk = (y0, len, s) => { const G = new THREE.Group(); G.add(tube([0, 0, 0], [0, -len, 0], s, mSolid)); const e = box(0.12, 0.12, 0.12, 0, -len - 0.04, 0, glow(ORANGE, 0.6), false); G.add(e); G.userData.e = e; G.visible = false; r.add(G); return G; };
  const arms = { "-1": mk(0, 0.6, 0.08), "1": mk(0, 0.6, 0.08) }, legs = { "-1": mk(0, 0.55, 0.1), "1": mk(0, 0.55, 0.1) };
  arms["-1"].position.set(-0.2, 1.42, 0.02); arms["1"].position.set(0.2, 1.42, 0.02);
  legs["-1"].position.set(-0.2, 0.95, -0.04); legs["1"].position.set(0.2, 0.95, -0.04);
  return { set({ arm = 0, armA = 0.6, armF = 0.2, leg = 0, legA = 0.7, glow: gl = 1 } = {}) {
    for (const s of [-1, 1]) {
      const a = arms[s], l = legs[s], ia = s < 0 ? 4 : 5;
      a.visible = arm === s; ch[ia].visible = ch[ia + 6].visible = arm !== s;
      if (a.visible) { a.rotation.set(armF, 0, s * armA); a.userData.e.material.color.set(ORANGE).multiplyScalar(0.6 + 3 * gl); }
      l.visible = leg === s; ch[ia + 2].visible = ch[ia + 4].visible = leg !== s;
      if (l.visible) { l.rotation.set(-0.15, 0, s * legA); l.userData.e.material.color.set(ORANGE).multiplyScalar(0.6 + 3 * gl); }
    }
  } };
}
