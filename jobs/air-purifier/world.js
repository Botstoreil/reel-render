// air-purifier (Hidden Cam 26) - CHALKBOARD style (kit from rail-tracks / style-kits/style-chalkboard.js):
// chalk drawing of a hotel room from the front: a bed on the left, an air purifier on the floor facing it.
// Wrong: it points at the bed and a camera can sit inside, the lens behind the grille, hard to see.
// Right: lights off and look for a tiny light; torch across the grille for a glint; unsure = unplug it or turn it
// to face the wall. Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const back = (a, b, v) => { const t = cl((v - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

// chalk colours
const RED = "#ff8f8f", GREEN = "#a6f2b4", VIOLET = "#f4f1e6", ORANGE = "#ffc078", WHITE = "#ffffff", YELLOW = "#fff09a", BLUE = "#a8d8ff", BG = "#24432f";
const CX = 510;
const cv = document.getElementById("world");
const out = cv.getContext("2d");
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const mk = () => { const c = document.createElement("canvas"); c.width = 1080; c.height = 1920; return c; };
const boardC = mk(); {
  const b = boardC.getContext("2d"), r = rng(3);
  b.fillStyle = BG; b.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 46; i++) { b.fillStyle = `rgba(255,255,255,${0.012 + r() * 0.022})`; b.beginPath(); b.ellipse(r() * 1080, r() * 1920, 80 + r() * 220, 30 + r() * 90, r() * 3, 0, Math.PI * 2); b.fill(); }
  b.fillStyle = "#7a5230"; b.fillRect(0, 0, 1080, 26); b.fillRect(0, 0, 26, 1920); b.fillRect(1054, 0, 26, 1920); b.fillRect(0, 1860, 1080, 60);
  b.fillStyle = "#5c3d22"; b.fillRect(0, 1860, 1080, 10);
  b.fillStyle = "#f4f1e6"; b.fillRect(300, 1872, 70, 14); b.fillStyle = "#ffc078"; b.fillRect(420, 1874, 50, 12);
}
const grainC = mk(); {
  const g = grainC.getContext("2d"), r = rng(9);
  for (let i = 0; i < 90000; i++) { g.fillStyle = `rgba(0,0,0,${0.35 + r() * 0.55})`; g.fillRect(Math.floor(r() * 1080), Math.floor(r() * 1920), 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 2)); }
}
const inkC = mk(), ink = inkC.getContext("2d");
const BR = [0x24, 0x43, 0x2f];
function boardOf(v) {
  if (typeof v !== "string") return v;
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  if (0.3 * r + 0.59 * g + 0.11 * b >= 70) return v;
  return `rgba(${BR[0]},${BR[1]},${BR[2]},${a})`;
}
const x = new Proxy(ink, {
  get(t, k) { const v = t[k]; return typeof v === "function" ? v.bind(t) : v; },
  set(t, k, v) { if (k === "fillStyle" || k === "strokeStyle") v = boardOf(v); t[k] = v; return true; },
});
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (840 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.05, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.32, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.12, curU);
      const s = 0.4 + 0.6 * k;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.rotate((((wi + li * 3) * 7919) % 13 - 6) * 0.007); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
      x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.05;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * a;
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.strokeStyle = color; x.lineWidth = 22;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.beginPath();
  if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); }
  else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
  x.stroke(); x.restore();
}
function arrow(x0, y0, x1, y1, color, a, lw = 12) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.fillStyle = color; x.lineWidth = lw; x.lineCap = "round";
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
  const h = Math.atan2(y1 - y0, x1 - x0);
  x.beginPath(); x.moveTo(x1 + Math.cos(h) * 18, y1 + Math.sin(h) * 18); x.lineTo(x1 + Math.cos(h + 2.5) * 40, y1 + Math.sin(h + 2.5) * 40); x.lineTo(x1 + Math.cos(h - 2.5) * 40, y1 + Math.sin(h - 2.5) * 40); x.closePath(); x.fill();
  x.restore();
}

// ---------- the room (board px; the world is drawn 100 px higher on screen) ----------
const FLOOR = 1220;
const P = [640, 960];                 // purifier centre (front view, 260 x 520)
const LENS = [P[0] + 38, P[1] + 34];  // lens behind the grille
const BED = [260, 1090];              // middle of the mattress
function room(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.6; x.strokeStyle = VIOLET; x.lineWidth = 6; x.lineCap = "round";
  x.beginPath(); x.moveTo(60, FLOOR); x.lineTo(1000, FLOOR); x.stroke();
  // wall socket
  rr(890, 1110, 70, 90, 12); x.stroke();
  x.beginPath(); x.moveTo(912, 1140); x.lineTo(912, 1160); x.moveTo(938, 1140); x.lineTo(938, 1160); x.stroke();
  x.restore();
}
function bed(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 8; x.lineCap = "round"; x.lineJoin = "round";
  rr(70, 900, 34, 320, 12); x.stroke();                        // headboard
  rr(104, 1050, 330, 90, 22); x.stroke();                      // mattress
  x.beginPath(); x.moveTo(110, 1140); x.lineTo(110, FLOOR); x.moveTo(424, 1140); x.lineTo(424, FLOOR); x.stroke();
  x.beginPath(); x.ellipse(170, 1028, 56, 24, -0.1, 0, Math.PI * 2); x.stroke(); // pillow
  x.strokeStyle = BLUE; x.lineWidth = 6;                       // blanket
  x.beginPath(); x.moveTo(240, 1052); x.quadraticCurveTo(330, 1030, 432, 1060); x.stroke();
  x.restore();
}
// purifier; turn 0..1 = rotate on the spot to face the wall (shows its plain back)
function purifier(a, c = VIOLET, turn = 0, cam = 0, dot = 0, t = 0) {
  if (a <= 0) return;
  const ang = turn * Math.PI, sx = Math.cos(ang), front = sx >= 0;
  x.save(); x.globalAlpha = a; x.translate(P[0], P[1]); x.scale(Math.max(0.06, Math.abs(sx)), 1);
  x.strokeStyle = c; x.lineWidth = 8; x.lineCap = "round"; x.lineJoin = "round";
  x.fillStyle = BG; rr(-130, -260, 260, 520, 46); x.fill(); x.stroke();
  if (front) {
    rr(-76, -226, 152, 70, 16); x.stroke();                     // display
    x.save(); x.fillStyle = c; x.font = FONT(40); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("24", -18, -190); x.restore();
    x.beginPath(); x.arc(46, -191, 10, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 6;
    for (let yy = -110; yy <= 200; yy += 30) { x.beginPath(); x.moveTo(-92, yy); x.lineTo(92, yy); x.stroke(); } // grille
    if (cam > 0) {
      // x-ray: a small camera module behind the grille
      x.save(); x.globalAlpha = a * cam; x.strokeStyle = RED; x.lineWidth = 7;
      rr(LENS[0] - P[0] - 58, LENS[1] - P[1] - 34, 116, 68, 12); x.stroke();
      x.beginPath(); x.arc(LENS[0] - P[0], LENS[1] - P[1], 20, 0, Math.PI * 2); x.stroke();
      x.restore();
    }
    if (dot > 0) {
      x.save(); x.globalAlpha = a * dot * (0.75 + 0.25 * Math.sin(t * 9)); x.fillStyle = RED;
      x.beginPath(); x.arc(LENS[0] - P[0] + 44, LENS[1] - P[1] - 20, 9, 0, Math.PI * 2); x.fill();
      x.globalAlpha = a * dot * 0.35; x.beginPath(); x.arc(LENS[0] - P[0] + 44, LENS[1] - P[1] - 20, 24, 0, Math.PI * 2); x.fill();
      x.restore();
    }
  } else {
    x.lineWidth = 6;
    for (let xx = -70; xx <= 70; xx += 35) { x.beginPath(); x.moveTo(xx, -180); x.lineTo(xx, 120); x.stroke(); } // back vents
    rr(-40, 160, 80, 50, 10); x.stroke();                       // filter door
  }
  x.restore();
}
function cord(a, unplug = 0) {
  if (a <= 0) return;
  const end = [lerp(925, 840, unplug), lerp(1150, 1205, unplug)];
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 6; x.lineCap = "round";
  x.beginPath(); x.moveTo(P[0] + 110, P[1] + 250); x.quadraticCurveTo(820, FLOOR + 4, end[0], end[1]); x.stroke();
  x.fillStyle = VIOLET; x.fillRect(end[0] - 16, end[1] - 22, 32, 40);
  x.restore();
}
function sightCone(a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.28; x.fillStyle = color;
  x.beginPath(); x.moveTo(LENS[0], LENS[1]); x.lineTo(BED[0] - 160, BED[1] - 110); x.lineTo(BED[0] + 40, BED[1] + 90); x.closePath(); x.fill();
  x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 6; x.setLineDash([22, 18]);
  x.beginPath(); x.moveTo(LENS[0], LENS[1]); x.lineTo(BED[0] - 30, BED[1]); x.stroke();
  x.restore();
}
function bulb(a, on) {
  if (a <= 0) return;
  const B = [250, 720];
  x.save(); x.globalAlpha = a; x.strokeStyle = on > 0.5 ? YELLOW : VIOLET; x.lineWidth = 7; x.lineCap = "round";
  x.beginPath(); x.moveTo(B[0], 600); x.lineTo(B[0], B[1] - 46); x.stroke();
  x.beginPath(); x.arc(B[0], B[1], 40, 0, Math.PI * 2); x.stroke();
  if (on > 0) {
    x.globalAlpha = a * on; x.strokeStyle = YELLOW;
    for (let i = 0; i < 8; i++) { const h = i * Math.PI / 4; x.beginPath(); x.moveTo(B[0] + Math.cos(h) * 60, B[1] + Math.sin(h) * 60); x.lineTo(B[0] + Math.cos(h) * 92, B[1] + Math.sin(h) * 92); x.stroke(); }
  }
  x.restore();
}
function dim(k) { if (k <= 0) return; x.save(); x.fillStyle = `rgba(0,0,0,${0.62 * k})`; x.fillRect(-400, 0, 1900, 2400); x.restore(); }
// phone torch held at the right, beam across the grille
function torch(a, beam) {
  if (a <= 0) return;
  const T = [880, 760], h = Math.atan2(LENS[1] - T[1], LENS[0] - T[0]);
  x.save(); x.globalAlpha = a; x.translate(T[0], T[1]); x.rotate(h);
  if (beam > 0) {
    x.save(); x.globalAlpha = a * beam * 0.35; x.fillStyle = YELLOW;
    x.beginPath(); x.moveTo(10, 0); x.lineTo(320, -95); x.lineTo(320, 95); x.closePath(); x.fill(); x.restore();
  }
  x.rotate(Math.PI / 2); x.strokeStyle = VIOLET; x.lineWidth = 8; x.fillStyle = BG;
  rr(-40, -10, 80, 150, 16); x.fill(); x.stroke();
  x.fillStyle = YELLOW; x.beginPath(); x.arc(0, 14, 9, 0, Math.PI * 2); x.fill();
  x.restore();
}
function glint(a, X, Y) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = WHITE; x.lineWidth = 7; x.lineCap = "round";
  const r = 46 * a;
  for (let i = 0; i < 4; i++) { const h = i * Math.PI / 4; x.beginPath(); x.moveTo(X - Math.cos(h) * r, Y - Math.sin(h) * r); x.lineTo(X + Math.cos(h) * r, Y + Math.sin(h) * r); x.stroke(); }
  x.fillStyle = WHITE; x.beginPath(); x.arc(X, Y, 10, 0, Math.PI * 2); x.fill();
  x.restore();
}
function fanIcon(a, X, Y) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = VIOLET; x.lineWidth = 7;
  x.beginPath(); x.arc(X, Y, 62, 0, Math.PI * 2); x.stroke();
  for (let i = 0; i < 3; i++) { const h = i * 2.09; x.beginPath(); x.ellipse(X + Math.cos(h) * 30, Y + Math.sin(h) * 30, 26, 12, h, 0, Math.PI * 2); x.stroke(); }
  x.beginPath(); x.moveTo(X, Y + 62); x.lineTo(X, Y + 130); x.moveTo(X - 40, Y + 130); x.lineTo(X + 40, Y + 130); x.stroke();
  x.restore();
}

// ---------- one frame ----------
function drawInk(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  let z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * cut * cut, fx = CX, fy = 1000;
  if (id === "s3") { z = lerp(1.05, 1.25, sm(0, 1.2, u)); fx = LENS[0] - 20; fy = 1004; } // purifier top 700 -> 520 px, bottom 1220 -> 1170 px
  if (id === "s5") { z = lerp(1.0, 1.25, sm(0, d, u)); fx = 600; fy = 980; }
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-fx, -fy);

  if (id === "s1") {
    const a = sm(-0.05, 0.3, u);
    room(a); bed(sm(at("s1", "bed") - 0.3, at("s1", "bed"), u) * 0.6 + a * 0.4); cord(a);
    purifier(a);
    sightCone(sm(at("s1", "pointing") - 0.05, at("s1", "bed") + 0.1, u), RED);
    tag("AIR PURIFIER", 640, 640, VIOLET, sm(at("s1", "purifier") - 0.05, at("s1", "purifier") + 0.2, u), 40);
  }
  if (id === "s2") {
    room(1); bed(1); cord(1);
    const cam = sm(at("s2", "cameras") - 0.1, at("s2", "cameras") + 0.25, u);
    purifier(1, VIOLET, 0, cam);
    sightCone(0.6, RED);
    tag("CAMERA INSIDE", 640, 640, RED, sm(at("s2", "sold") - 0.1, at("s2", "inside") + 0.15, u), 40);
    fanIcon(sm(at("s2", "fans") - 0.1, at("s2", "fans") + 0.2, u), 860, 900);
  }
  if (id === "s3") {
    room(1); bed(1); cord(1);
    const cam = 1 - sm(at("s3", "lens") + 0.3, at("s3", "grille"), u) * 0.75;
    purifier(1, VIOLET, 0, cam);
    tag("LENS", LENS[0] + 110, LENS[1] - 70, RED, sm(at("s3", "lens") - 0.1, at("s3", "lens") + 0.15, u), 30);
    arrow(LENS[0] - 150, P[1] - 130, P[0] - 70, P[1] - 200, RED, sm(at("s3", "display") - 0.1, at("s3", "display") + 0.15, u), 8);
    tag("HARD TO SEE", P[0], P[1] + 110, RED, sm(at("s3", "grille") - 0.1, at("s3", "grille") + 0.15, u), 30);
  }
  if (id === "s4") {
    const off = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.15, u);
    room(1); bed(1); cord(1);
    purifier(1, VIOLET, 0, 0, 0, u);
    bulb(1, 1 - off);
    dim(off);
    bulb(off, 0);
    const D = sm(at("s4", "tiny") - 0.1, at("s4", "glowing") + 0.1, u);
    // the dot on top of the dimmed room
    if (D > 0) {
      x.save(); x.globalAlpha = D * (0.75 + 0.25 * Math.sin(u * 9)); x.fillStyle = RED;
      x.beginPath(); x.arc(LENS[0] + 44, LENS[1] - 20, 14, 0, Math.PI * 2); x.fill();
      x.globalAlpha = D * 0.35; x.beginPath(); x.arc(LENS[0] + 44, LENS[1] - 20, 36, 0, Math.PI * 2); x.fill(); x.restore();
    }
    tag("LIGHTS OFF", 250, 860, YELLOW, off, 36);
    tag("TINY LIGHT?", LENS[0] + 60, LENS[1] - 120, RED, D, 34);
    stamp("v", 880, 1090, 0.5 * back(at("s4", "light", 2), at("s4", "light", 2) + 0.3, u), u > at("s4", "light", 2) ? 1 : 0, GREEN);
  }
  if (id === "s5") {
    room(1); bed(1); cord(1);
    purifier(1);
    dim(1);
    purifier(0.55);
    const Tn = sm(at("s5", "shine") - 0.1, at("s5", "torch") + 0.1, u);
    const Bm = sm(at("s5", "torch") - 0.05, at("s5", "grille") + 0.05, u);
    torch(Tn, Bm);
    const G = sm(at("s5", "glint") - 0.1, at("s5", "glint") + 0.15, u);
    glint(G, LENS[0], LENS[1]);
    tag("GLINT = LENS", LENS[0] - 30, LENS[1] + 150, GREEN, G, 36);
    stamp("v", 300, 1100, 0.5 * back(at("s5", "glint"), at("s5", "glint") + 0.3, u), u > at("s5", "glint") ? 1 : 0, GREEN);
  }
  if (id === "s6") {
    room(1); bed(1);
    const Up = sm(at("s6", "unplug") - 0.05, at("s6", "unplug") + 0.25, u);
    cord(1 - sm(at("s6", "turn") - 0.1, at("s6", "turn"), u), Up);
    const Tu = sm(at("s6", "turn") - 0.05, at("s6", "face") + 0.1, u);
    purifier(1, GREEN, Tu);
    sightCone(0.6 * (1 - Tu), RED);
    tag("UNPLUG", 850, 1040, GREEN, Up, 38);
    tag("FACE THE WALL", 640, 640, GREEN, sm(at("s6", "face") - 0.1, at("s6", "wall") + 0.1, u), 40);
    stamp("v", 300, 820, 0.5 * back(at("s6", "wall"), at("s6", "wall") + 0.3, u), u > at("s6", "wall") ? 1 : 0, GREEN);
  }
  if (id === "s7") {
    room(0.6); bed(0.7); purifier(0.7, GREEN, 1);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER IGNORE", "THE PURIFIER"], RED, 340, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "ignore"))));
  if (id === "s2") words(["CAMERAS", "HIDE INSIDE"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "inside")) * 0.6);
  if (id === "s3") words(["BEHIND THE", "GRILLE"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "grille")) * 0.6);
  if (id === "s4") words(["LIGHTS OFF.", "LOOK FOR A DOT"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "tiny")) * 0.6);
  if (id === "s5") words(["TORCH ON", "THE GRILLE"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") words(["UNSURE? TURN IT", "TO THE WALL"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "wall")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["CHECK THE PURIFIER."], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["TURN IT AWAY."], ORANGE, 880, at("s7", "turn") - 0.05, 1, 140, flash(u, at("s7", "away")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 110, 0, Math.PI * 2); x.stroke();
    x.fillStyle = VIOLET; x.beginPath(); x.arc(0, 0, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = GREEN; x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 150, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}
function frame(t) {
  drawInk(t);
  ink.setTransform(1, 0, 0, 1, 0, 0);
  ink.save(); ink.globalCompositeOperation = "destination-out"; ink.drawImage(grainC, 0, 0); ink.restore();
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.drawImage(boardC, 0, 0);
  out.drawImage(inkC, 0, 0);
  const { u } = sceneOf(t);
  const e = sm(-LEAD, 0.3 - LEAD, u);
  if (e > 0 && e < 1) {
    const ex = lerp(-260, 1340, e), ey = lerp(1250, 600, e);
    out.save();
    const sg = out.createLinearGradient(ex - 700, 0, ex, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(1, "rgba(255,255,255,0.10)");
    out.fillStyle = sg; out.translate(ex, ey); out.rotate(-0.42); out.fillRect(-700, -110, 700, 220);
    out.fillStyle = "#3b3b46"; out.fillRect(-10, -120, 120, 240); out.fillStyle = "#b07a45"; out.fillRect(60, -120, 70, 240);
    out.restore();
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["air-purifier-chalk"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
