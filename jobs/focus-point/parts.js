// Reusable story parts (17.11): people with poses, office props, bubbles, icons, safe camera helpers.
// world.js builds the story from these instead of writing props from scratch.
import { THREE, scene, camera, box, tube, glow, mSolid, mEdge, VIOLET, ORANGE, RED, GREEN, WHITE, sm, label } from "./kit.js";

const solid = (hex) => { const m = mSolid.clone(); if (hex != null) { m.color.set(hex).multiplyScalar(0.55); m.emissive.set(hex).multiplyScalar(0.28); } return m; };
const limb = (len, r, mat) => { const G = new THREE.Group(); G.add(tube([0, 0, 0], [0, -len, 0], r, mat)); return G; };
const joint = (parent, x, y, z) => { const G = new THREE.Group(); G.position.set(x, y, z); parent.add(G); return G; };

// ---------- person: feet at y=0, faces -z, hex tints the shirt so two people never look alike ----------
// P.set({x, z, h, t, walk, point, argue, sit, type, phone, cheer, shrug, slump, look, k}) - every pose 0..1, they add up
export function human({ hex = VIOLET, skin = 0xe0a27c, phase = 0 } = {}) {
  const g = new THREE.Group(); scene.add(g);
  const hips = joint(g, 0, 0.95, 0), spine = joint(hips, 0, 0, 0);
  const mShirt = solid(hex), mPants = solid(0x2a2470), mSkin = new THREE.MeshStandardMaterial({ color: skin, emissive: 0x4a2414, roughness: 0.6 });
  spine.add(box(0.44, 0.58, 0.24, 0, 0.32, 0, mShirt));
  const neck = joint(spine, 0, 0.66, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 18, 14), mSkin); head.position.y = 0.12; neck.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), solid(0x1a1640)); hair.position.y = 0.14; hair.rotation.x = 0.25; neck.add(hair);
  const eyes = box(0.16, 0.035, 0.02, 0, 0.13, -0.135, glow(hex, 2.2), false); neck.add(eyes); // shows which way the face looks
  const arm = (s) => {
    const sh = joint(spine, s * 0.29, 0.56, 0); sh.add(limb(0.3, 0.07, mShirt));
    const el = joint(sh, 0, -0.3, 0); el.add(limb(0.28, 0.06, mSkin));
    const hand = joint(el, 0, -0.32, 0); hand.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mSkin));
    return { sh, el, hand };
  };
  const leg = (s) => {
    const th = joint(hips, s * 0.12, 0, 0); th.add(limb(0.45, 0.09, mPants));
    const kn = joint(th, 0, -0.45, 0); kn.add(limb(0.43, 0.075, mPants));
    kn.add(box(0.12, 0.08, 0.26, 0, -0.46, -0.06, solid(0x14102e), false));
    return { th, kn };
  };
  const L = arm(-1), R = arm(1), LL = leg(-1), RL = leg(1);
  const P = {
    g, head: neck, hands: [L.hand, R.hand], mats: { shirt: mShirt, eyes: eyes.material },
    // world position of the top of the head (for bubbles / tags)
    top(dy = 0.45) { const v = new THREE.Vector3(); neck.getWorldPosition(v); v.y += dy; return v; },
    hold(obj, side = 1) { (side > 0 ? R : L).hand.add(obj); obj.position.set(0, -0.04, -0.06); return obj; },
    set({ x = 0, z = 0, h = 0, t = 0, vis = true, walk = 0, point = 0, argue = 0, sit = 0, type = 0, phone = 0, cheer = 0, shrug = 0, slump = 0, look = 0, nod = 0 } = {}) {
      g.visible = vis; if (!vis) return;
      const w = (t + phase) * Math.PI * 2 * 1.6, sw = Math.sin(w) * walk, a = (t + phase) * 5.2;
      g.position.set(x, 0, z); g.rotation.set(0, h, 0);
      hips.position.y = 0.95 - 0.45 * sit + 0.03 * Math.abs(Math.sin(w)) * walk;
      LL.th.rotation.set(sw * 0.5 + sit * 1.57, 0, 0); RL.th.rotation.set(-sw * 0.5 + sit * 1.57, 0, 0);
      LL.kn.rotation.x = -Math.max(0, -Math.sin(w)) * 0.8 * walk - sit * 1.57; RL.kn.rotation.x = -Math.max(0, Math.sin(w)) * 0.8 * walk - sit * 1.57;
      spine.rotation.set(0.35 * slump + 0.1 * argue * Math.sin(a * 0.5) + 0.08 * type, 0, 0);
      neck.rotation.set(0.4 * slump + 0.35 * phone + 0.15 * nod * Math.sin(a * 1.4), -look * 0.7, 0);
      // arms: x = forward swing, z = out to the side (sign per side)
      const ar = (A, s, k) => {
        let fx = -sw * 0.4 * s, fz = 0.08, ex = 0.15;
        fx += point * (s > 0 ? 1.45 : 0); ex += point * (s > 0 ? -0.15 : 0);
        const gst = Math.sin(a + (s > 0 ? 0 : 2.1)); fx += argue * (0.7 + 0.45 * gst); ex += argue * (0.9 + 0.3 * gst); fz += argue * 0.25;
        fx += type * 0.55; ex += type * (0.95 + 0.06 * Math.sin(t * 22 + s));
        if (s > 0) { fx += phone * 0.45; ex += phone * 1.7; }
        fx += cheer * 2.9; fz += cheer * 0.25; ex += cheer * 0.2;
        fz += shrug * 0.6; ex += shrug * 1.4; fx += shrug * 0.2;
        A.sh.rotation.set(fx, 0, s * fz); A.el.rotation.set(ex, 0, 0);
      };
      ar(R, 1); ar(L, -1);
    },
  };
  P.set();
  SOLIDS.push(P.head); // unclip keeps the camera out of every head
  return P;
}
// walk between two points: returns {x, z, h, walk} for P.set; stands still outside [t0, t1]
export function walkPath([x0, z0], [x1, z1], t0, t1, t) {
  const k = sm(t0, t1, t), lin = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return { x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k, h: Math.atan2(-(x1 - x0), -(z1 - z0)), walk: lin > 0 && lin < 1 ? 1 : 0 };
}
// heading that makes a person at a face b
export const face = ([ax, az], [bx, bz]) => Math.atan2(-(bx - ax), -(bz - az));

// ---------- office props (y=0 floor, h = heading, front faces -z like people) ----------
const mWood = solid(0x5a4fd0), mDark = new THREE.MeshStandardMaterial({ color: 0x0c0a24, roughness: 0.4 });
function at(G, x, z, h) { G.position.set(x, 0, z); G.rotation.y = h; scene.add(G); return G; }
export function desk(x, z, h = 0, { w = 1.6, d = 0.8 } = {}) {
  const G = new THREE.Group(); G.add(box(w, 0.06, d, 0, 0.75, 0, mWood));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) G.add(box(0.06, 0.72, 0.06, sx * (w / 2 - 0.06), 0.36, sz * (d / 2 - 0.06), mWood, false));
  return at(G, x, z, h);
}
// chair: the sitter stands at the chair's spot facing the same way (P.set({x, z, h, sit: 1}))
export function chair(x, z, h = 0) {
  const G = new THREE.Group(); G.add(box(0.48, 0.06, 0.46, 0, 0.47, 0.05, mWood), box(0.48, 0.55, 0.05, 0, 0.78, 0.28, mWood));
  G.add(box(0.05, 0.45, 0.05, 0, 0.23, 0.05, mWood, false), box(0.5, 0.04, 0.5, 0, 0.03, 0.05, mWood, false));
  return at(G, x, z, h);
}
// text/colour canvas for screens (depth-tested, sits in the world)
function screenMat(lines, hex, bg) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 320; const x = c.getContext("2d");
  x.fillStyle = bg; x.fillRect(0, 0, 512, 320); x.fillStyle = "#" + new THREE.Color(hex).getHexString(); x.textAlign = "center"; x.textBaseline = "middle";
  const L = lines || []; L.forEach((t, i) => { x.font = `900 ${Math.min(110, 460 / Math.max(4, t.length) * 1.7)}px Inter, Arial, sans-serif`; x.fillText(t, 256, 160 + (i - (L.length - 1) / 2) * 110); });
  return new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), toneMapped: false, color: new THREE.Color(0xd0d0d0) });
}
// monitor on a desk top (put it at the desk's x,z,h): M.show(["TEXT"], hex) changes the screen
export function monitor(x, z, h = 0, { y = 0.78, w = 0.8 } = {}) {
  const G = new THREE.Group(), hh = w * 0.6;
  G.add(box(0.2, 0.02, 0.16, 0, y + 0.01, 0, mDark, false), box(0.04, 0.22, 0.04, 0, y + 0.12, 0.02, mDark, false), box(w + 0.06, hh + 0.06, 0.04, 0, y + 0.22 + hh / 2, 0, mDark));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(w, hh), screenMat([], VIOLET, "#1b1650")); scr.position.set(0, y + 0.22 + hh / 2, 0.025); G.add(scr); // faces +z, the sitter and the camera (round 7: it faced the wall, monitors read black)
  at(G, x, z, h);
  const cache = {};
  return { g: G, screen: scr, show(lines = [], hex = WHITE, bg = "#1b1650") { const k = lines.join("|") + hex + bg; scr.material = cache[k] || (cache[k] = screenMat(lines, hex, bg)); } };
}
// phone: hold it with P.hold(phone()); lit screen faces the holder's eyes
export function phone(hex = VIOLET) {
  const G = new THREE.Group(); G.add(box(0.08, 0.15, 0.012, 0, 0, 0, mDark, false));
  const s = box(0.07, 0.13, 0.002, 0, 0, 0.008, glow(hex, 1.6), false); G.add(s); G.rotation.x = -0.9; G.userData.screen = s; return G;
}
export function laptop(x, z, h = 0, { y = 0.78 } = {}) {
  const G = new THREE.Group(); G.add(box(0.5, 0.02, 0.34, 0, y + 0.01, 0, mDark, false));
  const lid = new THREE.Group(); lid.position.set(0, y + 0.02, 0.17); lid.rotation.x = -0.25; G.add(lid);
  lid.add(box(0.5, 0.32, 0.015, 0, 0.16, 0, mDark, false)); const s = box(0.46, 0.28, 0.002, 0, 0.16, -0.009, glow(VIOLET, 1.4), false); lid.add(s);
  at(G, x, z, h); G.userData.screen = s; return G;
}
export function door(x, z, h = 0) { const G = new THREE.Group(); G.add(box(1.0, 2.1, 0.08, 0, 1.05, 0, solid(0x3a30a8)), box(0.08, 0.04, 0.06, 0.38, 1.0, -0.06, glow(ORANGE, 2), false)); return at(G, x, z, h); }
// back wall + floor tiles for an indoor room (camera looks at -z)
export function room({ w = 10, d = 8, wallZ = -3, hex = VIOLET } = {}) {
  scene.add(box(w, 3.2, 0.1, 0, 1.6, wallZ, solid(0x15123f), false));
  const lines = new THREE.Group(); for (let i = -w / 2; i <= w / 2; i += 1) lines.add(box(0.015, 0.003, d, i, 0.002, wallZ + d / 2, glow(hex, 0.5), false));
  scene.add(lines); scene.fog.density = 0.02;
}

// ---------- canvas sprites: speech bubbles and icons (always on top, face the camera) ----------
function sprite(draw, w = 1, hex = WHITE, k = 1.2) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const x = c.getContext("2d"); draw(x);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: new THREE.Color(hex).multiplyScalar(k), transparent: true, depthTest: false, depthWrite: false, toneMapped: false, fog: false }));
  m.renderOrder = 18; m.visible = false; m.userData.w = w; scene.add(m); return m;
}
// speech bubble: text in a rounded bubble with a tail; border/tail in the speaker's colour so two speakers read apart
export function bubble(text, hex = WHITE, { size = 1.1 } = {}) {
  const col = "#" + new THREE.Color(hex).getHexString();
  return sprite((x) => {
    x.fillStyle = "rgba(10,8,34,0.92)"; x.strokeStyle = col; x.lineWidth = 14;
    x.beginPath(); x.roundRect(24, 90, 464, 260, 60); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(200, 343); x.lineTo(170, 440); x.lineTo(280, 343); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle";
    const words = text.split(" "), lines = text.length > 12 ? [words.slice(0, Math.ceil(words.length / 2)).join(" "), words.slice(Math.ceil(words.length / 2)).join(" ")] : [text];
    lines.forEach((l, i) => { let px = 96; x.font = `900 ${px}px Inter, Arial, sans-serif`; while (x.measureText(l).width > 410) x.font = `900 ${(px -= 4)}px Inter, Arial, sans-serif`; x.fillText(l, 256, 220 + (i - (lines.length - 1) / 2) * px * 1.05); });
  }, size, WHITE, 1.0);
}
// show a bubble above a person (a = 0..1)
export function say(B, P, a, dy = 0.55, s = 1) { const v = P.top(dy); label(B, v.x, v.y, v.z, B.userData.w * s, a); }
// icons: clock, doc, check, cross, alert, money, mail, chat, heart, star, calendar, user
export function icon(kind, hex = ORANGE, { size = 0.7, k = 1.6 } = {}) {
  return sprite((x) => {
    x.strokeStyle = x.fillStyle = "#fff"; x.lineWidth = 34; x.lineCap = x.lineJoin = "round"; x.textAlign = "center"; x.textBaseline = "middle";
    const P = new Path2D();
    if (kind === "clock") { x.beginPath(); x.arc(256, 256, 190, 0, 7); x.stroke(); x.beginPath(); x.moveTo(256, 256); x.lineTo(256, 130); x.moveTo(256, 256); x.lineTo(350, 300); x.stroke(); }
    else if (kind === "doc") { x.beginPath(); x.moveTo(130, 60); x.lineTo(310, 60); x.lineTo(390, 140); x.lineTo(390, 452); x.lineTo(130, 452); x.closePath(); x.stroke(); x.lineWidth = 24; for (const y of [210, 290, 370]) { x.beginPath(); x.moveTo(190, y); x.lineTo(330, y); x.stroke(); } }
    else if (kind === "check") { x.lineWidth = 60; x.beginPath(); x.moveTo(110, 270); x.lineTo(215, 375); x.lineTo(410, 150); x.stroke(); }
    else if (kind === "cross") { x.lineWidth = 60; x.beginPath(); x.moveTo(130, 130); x.lineTo(382, 382); x.moveTo(382, 130); x.lineTo(130, 382); x.stroke(); }
    else if (kind === "calendar") { x.strokeRect(90, 110, 332, 320); x.beginPath(); x.moveTo(90, 200); x.lineTo(422, 200); x.moveTo(180, 70); x.lineTo(180, 140); x.moveTo(332, 70); x.lineTo(332, 140); x.stroke(); }
    else if (kind === "mail") { x.strokeRect(70, 130, 372, 252); x.beginPath(); x.moveTo(70, 130); x.lineTo(256, 280); x.lineTo(442, 130); x.stroke(); }
    else if (kind === "chat") { x.beginPath(); x.roundRect(70, 90, 372, 260, 60); x.stroke(); x.beginPath(); x.moveTo(160, 350); x.lineTo(130, 440); x.lineTo(240, 350); x.stroke(); }
    else if (kind === "user") { x.beginPath(); x.arc(256, 180, 90, 0, 7); x.stroke(); x.beginPath(); x.arc(256, 470, 170, Math.PI, 0); x.stroke(); }
    else { const glyph = { alert: "!", money: "$", heart: "♥", star: "★" }[kind] || kind; x.beginPath(); x.arc(256, 256, 200, 0, 7); x.stroke(); x.font = `900 280px Inter, Arial, sans-serif`; x.fillText(glyph, 256, 270); }
  }, size, hex, k);
}
// world-space icon / tag that pops in (scale overshoot) at point v (THREE.Vector3 or [x,y,z])
export function pop(m, v, a, s = 1) { const [x, y, z] = Array.isArray(v) ? v : [v.x, v.y, v.z]; label(m, x, y, z, m.userData.w * s * (a < 1 ? 0.6 + 0.55 * Math.sin(a * 2.2) : 1), a); }

// ---------- camera helpers (return [cx,cy,cz, lx,ly,lz, fov] for a shot's cam: (t, su) => ...) ----------
// side-on two-shot: both people in frame, each on their own side, camera on the -z side of the pair by default
export function twoShot(A, B, { dist = 1.0, height = 1.5, look = 1.25, side = 1, fov = 46, drift = 0, su = 0 } = {}) {
  const a = A.g.position, b = B.g.position, mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2, dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz) || 1;
  // 9:16 is only ~27 deg wide at fov 46 (round 7: people 2.2 m apart sat cut on both edges): back off until both are in the middle 70%
  const tH = Math.tan(fov * Math.PI / 360) * camera.aspect;
  const nx = -dz / L * side, nz = dx / L * side, D = Math.max(1.6 + L * 1.1 * dist, L / 2 / (0.7 * tH)) + drift * su * 0.12;
  return [mx + nx * D, height, mz + nz * D, mx, look, mz, fov];
}
// medium close-up of one person from the front-ish (off = sideways offset), always outside the head
export function closeOn(P, { dist = 1.6, height = 1.55, off = 0.5, fov = 42, look = 1.35, su = 0, drift = 0.05 } = {}) {
  const p = P.g.position, h = P.g.rotation.y, D = dist - drift * su;
  const fx = -Math.sin(h), fz = -Math.cos(h); // the way they face
  return [p.x + fx * D + Math.cos(h) * off, height, p.z + fz * D - Math.sin(h) * off, p.x, look - 0.45 * (P.g.position.y < 0 ? 0 : 0), p.z, fov];
}
// over-the-shoulder of P looking at target [x, y, z]
export function overShoulder(P, [tx, ty, tz], { back = 0.9, up = 0.45, side = 0.35, fov = 44 } = {}) {
  const p = P.g.position, h = P.g.rotation.y, fx = -Math.sin(h), fz = -Math.cos(h);
  return [p.x - fx * back + Math.cos(h) * side, 1.6 + up, p.z - fz * back - Math.sin(h) * side, tx, ty, tz, fov];
}
// keep the camera out of solid things: solid(obj...) once, unclip() every frame right after shoot()
const SOLIDS = [], bx = new THREE.Box3(), cp = new THREE.Vector3();
export const solid_ = (...objs) => SOLIDS.push(...objs);
export { solid_ as solid };
export function unclip(margin = 0.3) {
  cp.copy(camera.position); cp.y = Math.max(cp.y, 0.25);
  for (const o of SOLIDS) {
    if (!o.visible) continue; bx.setFromObject(o).expandByScalar(margin);
    if (!bx.containsPoint(cp)) continue;
    const opts = [[cp.x - bx.min.x, "x", bx.min.x], [bx.max.x - cp.x, "x", bx.max.x], [bx.max.y - cp.y, "y", bx.max.y], [cp.z - bx.min.z, "z", bx.min.z], [bx.max.z - cp.z, "z", bx.max.z]].sort((p, q) => p[0] - q[0]);
    cp[opts[0][1]] = opts[0][2];
  }
  if (!cp.equals(camera.position)) { const d = new THREE.Vector3(); camera.getWorldDirection(d); const tgt = camera.position.clone().add(d); camera.position.copy(cp); camera.lookAt(tgt); camera.updateMatrixWorld(true); }
}
export { RED, GREEN, ORANGE, VIOLET, WHITE };
