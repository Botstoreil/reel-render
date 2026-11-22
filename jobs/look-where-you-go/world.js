// look-where-you-go (Apex 07, TikTok) - COMIC ART style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-comic-art.js):
// cream page, one panel per line that slams in, thick ink outlines, flat colours, halftone, onomatopoeia.
// Story: top-down road; the rider's gaze is a cone. Wrong: stare at the pothole, ride into it. Right: look past it, ride around it.
// Time only from hf-seek.
const { S, W, LEAD, BRAND = {} } = window.__EV;
const IDS = Object.keys(S);
const at = (id, word, n = 1) => {
  const k = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
  const hits = W[id].words.filter((w) => k(w.text).startsWith(k(word)));
  if (!hits[n - 1]) throw new Error(`no word ${id}/${word}#${n}`);
  return hits[n - 1].start;
};
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const back = (a, b, x) => { const t = cl((x - a) / (b - a)); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const flash = (u, T) => Math.max(0, 1 - Math.abs(u - T) / 0.25);
const lerp = (a, b, k) => a + (b - a) * k;
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };

const cv = document.getElementById("world");
const x = cv.getContext("2d");

// ===================== STYLE KIT: COMIC ART =====================
const RED = "#e8202a", GREEN = "#17b866", VIOLET = "#6c55ff", ORANGE = "#ff7a00", YELLOW = "#ffd21a", WHITE = "#ffffff";
const INK = "#111111", PAPER = "#fbf1d8", NIGHT = "#161a3d";
const CX = 510, TAU = Math.PI * 2;
const PX0 = 50, PY0 = 545, PW = 900, PH = 670;
const FONT = (px) => `italic 900 ${px}px Inter, Arial, sans-serif`;
let curU = 0;
const hs = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`;
}
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function circ(X, Y, r) { x.beginPath(); x.arc(X, Y, r, 0, TAU); }
function ink(lw = 10) { x.strokeStyle = INK; x.lineWidth = lw; x.lineJoin = "round"; x.lineCap = "round"; }
function shape(path, color, lw = 10) { path(); x.fillStyle = color; x.fill(); ink(lw); path(); x.stroke(); }
function halftone(X, Y, w, h, color, gap = 22, maxR = 7, dir = "br", a = 1) {
  x.save(); x.globalAlpha *= a; x.fillStyle = color;
  x.beginPath(); x.rect(X, Y, w, h); x.clip();
  for (let j = 0, py = Y; py < Y + h + gap; py += gap, j++) {
    for (let px = X + (j % 2) * gap / 2; px < X + w + gap; px += gap) {
      let k;
      if (dir === "b") k = (py - Y) / h;
      else if (dir === "c") k = Math.hypot((px - X - w / 2) / (w / 2), (py - Y - h / 2) / (h / 2)) * 0.75;
      else k = ((px - X) / w + (py - Y) / h) / 2;
      const r = maxR * cl(k);
      if (r > 0.6) { x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
    }
  }
  x.restore();
}
function shade(path, box, color = INK, a = 0.28, gap = 16, maxR = 6, dir = "br") {
  x.save(); path(); x.clip();
  const [X, Y, w, h] = box;
  halftone(X, Y, w, h, color, gap, maxR, dir, a); x.restore();
}
function page(bg = PAPER, dots = "#f2b9a8") {
  x.fillStyle = bg; x.fillRect(0, 0, 1080, 1920);
  halftone(0, 0, 1080, 1920, dots, 30, 9, "c", 0.55);
}
function panelBg(bg) {
  x.fillStyle = INK; x.fillRect(PX0 + 16, PY0 + 16, PW, PH);
  x.fillStyle = bg; x.fillRect(PX0, PY0, PW, PH);
  halftone(PX0, PY0, PW, PH, mix(bg, INK, 0.22), 22, 8, "br", 0.9);
}
function panelClip() { x.beginPath(); x.rect(PX0, PY0, PW, PH); x.clip(); }
function panelBorder() { ink(14); x.lineCap = "butt"; x.strokeRect(PX0, PY0, PW, PH); }
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((Ln) => { x.font = FONT(100); return Math.min(maxPx, (800 / x.measureText(Ln).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.08, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((Ln, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = Ln.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.52;
    parts.forEach((p, i) => {
      const k = back(t0 + wi * 0.07, t0 + wi * 0.07 + 0.3, curU), o = sm(t0 + wi * 0.07, t0 + wi * 0.07 + 0.1, curU);
      const s = 0.3 + 0.7 * k, rot = (wi % 2 ? 1 : -1) * 0.035;
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 30); x.rotate(rot); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = INK; x.fillText(p, 8, 9);
      x.lineWidth = Math.max(8, px * 0.13); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, YELLOW, flashK * 0.7) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.08;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 46, s = 0.5 + 0.5 * cl(back(0, 1, a));
  x.translate(X, Y); x.rotate(-0.03); x.scale(s, s); x.globalAlpha = cl(a * 2);
  x.fillStyle = INK; x.fillRect(-w / 2 + 7, -px * 0.75 + 7, w, px * 1.5);
  x.fillStyle = color; x.fillRect(-w / 2, -px * 0.75, w, px * 1.5); ink(6); x.strokeRect(-w / 2, -px * 0.75, w, px * 1.5);
  x.lineWidth = 7; x.strokeText(txt, 0, 3); x.fillStyle = WHITE; x.fillText(txt, 0, 3);
  x.restore();
}
function burst(txt, X, Y, k, rot = -0.12, px = 92, fillC = YELLOW, txtC = RED) {
  if (k <= 0.01) return;
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(k, k);
  x.font = FONT(px); const w = x.measureText(txt).width;
  const R1 = w * 0.62 + 40, R2 = R1 * 0.72, n = 14;
  const star = () => { x.beginPath(); for (let i = 0; i <= n * 2; i++) { const an = (i / (n * 2)) * TAU, r = (i % 2 ? R2 : R1) * (1 + (hs(i + px) - 0.5) * 0.18); const yy = Math.sin(an) * r * 0.62; i ? x.lineTo(Math.cos(an) * r, yy) : x.moveTo(Math.cos(an) * r, yy); } x.closePath(); };
  x.save(); x.translate(10, 12); star(); x.fillStyle = INK; x.fill(); x.restore();
  shape(star, fillC, 9);
  x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  x.lineWidth = px * 0.16; x.strokeStyle = INK; x.strokeText(txt, 0, 4); x.fillStyle = txtC; x.fillText(txt, 0, 4);
  x.restore();
}
const pop = (u, t0, hold = 99) => (u < t0 ? 0 : back(t0, t0 + 0.28, u) * (1 - sm(t0 + hold, t0 + hold + 0.2, u)));
function speed(X, Y, r0, r1, n, a, seed = 1, color = INK) {
  if (a <= 0) return;
  x.save(); x.globalAlpha *= a; ink(6); x.strokeStyle = color;
  for (let i = 0; i < n; i++) { const an = (i / n) * TAU + hs(i + seed) * 0.2, rr0 = r0 * (0.9 + hs(i * 3 + seed) * 0.3); x.beginPath(); x.moveTo(X + Math.cos(an) * rr0, Y + Math.sin(an) * rr0); x.lineTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); x.stroke(); }
  x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  shape(() => circ(0, 0, 80), color, 10);
  x.beginPath();
  if (kind === "x") { x.moveTo(-36, -36); x.lineTo(36, 36); x.moveTo(36, -36); x.lineTo(-36, 36); }
  else { x.moveTo(-38, 4); x.lineTo(-10, 32); x.lineTo(40, -28); }
  x.strokeStyle = INK; x.lineWidth = 30; x.stroke(); x.strokeStyle = WHITE; x.lineWidth = 16; x.stroke();
  x.restore();
}
// flat comic sight cone from the rider's eyes, ink dashed edges
function gaze(x0, y0, x1, y1, w, a, c) {
  if (a <= 0) return;
  const dx = x1 - x0, dy = y1 - y0, Ln = Math.hypot(dx, dy) || 1, nx = -dy / Ln, ny = dx / Ln;
  const cone = () => { x.beginPath(); x.moveTo(x0 + nx * 10, y0 + ny * 10); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 10, y0 - ny * 10); x.closePath(); };
  x.save(); x.globalAlpha *= 0.55 * a; cone(); x.fillStyle = c; x.fill(); x.restore();
  x.save(); x.globalAlpha *= 0.85 * a; ink(5); x.setLineDash([24, 14]); cone(); x.stroke(); x.restore();
}
// ===================== end of kit =====================

// ---------- props ----------
const ROAD_L = CX - 280, ROAD_R = CX + 280, TOP = 470, BOT = 1240;
function road(scroll, tint = "#8e94a8") {
  x.fillStyle = tint; x.fillRect(ROAD_L, TOP, ROAD_R - ROAD_L, BOT - TOP);
  halftone(ROAD_L, TOP, ROAD_R - ROAD_L, BOT - TOP, mix(tint, INK, 0.3), 18, 5, "c", 0.7);
  ink(10); x.beginPath(); x.moveTo(ROAD_L, TOP); x.lineTo(ROAD_L, BOT); x.moveTo(ROAD_R, TOP); x.lineTo(ROAD_R, BOT); x.stroke();
  // lane marks scroll toward the viewer (we ride up the page)
  const off = scroll % 140;
  for (const lx of [ROAD_L + 34, ROAD_R - 34]) {
    for (let y = TOP - 140 + off; y < BOT; y += 140) shape(() => rr(lx - 9, y, 18, 70, 6), WHITE, 5);
  }
}
function pothole(X, Y, s, a = 1, hot = 0) {
  if (a <= 0 || s <= 0) return;
  x.save(); x.globalAlpha *= a; x.translate(X, Y); x.scale(s, s);
  const blob = () => { x.beginPath(); const n = 18; for (let i = 0; i <= n; i++) { const an = (i / n) * TAU, r = 1 + (hs(i * 7 + 3) - 0.5) * 0.35; const px = Math.cos(an) * 92 * r, py = Math.sin(an) * 58 * r; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.closePath(); };
  if (hot > 0) { x.save(); x.globalAlpha *= hot; x.translate(0, 0); x.scale(1.35, 1.45); blob(); x.fillStyle = RED; x.fill(); x.restore(); }
  shape(blob, "#3a3030", 9);
  shade(blob, [-100, -64, 200, 128], "#000000", 0.6, 12, 6, "b");
  ink(5); x.beginPath(); x.moveTo(90, -10); x.lineTo(125, -28); x.lineTo(140, -12); x.moveTo(-88, 20); x.lineTo(-122, 34); x.stroke();
  x.restore();
}
// top-down motorcycle + rider; heading rot (0 = up the page), head turn hr (relative), colour c
function bike(X, Y, rot, c, hr = 0, s = 1) {
  x.save(); x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  shape(() => rr(-17, 58, 34, 82, 14), "#222", 7); // rear tyre
  shape(() => rr(-15, -142, 30, 76, 13), "#222", 7); // front tyre
  shape(() => rr(-40, -78, 80, 168, 32), c, 9); // body + tank
  shade(() => rr(-40, -78, 80, 168, 32), [-40, -78, 80, 168], INK, 0.3, 12, 5);
  ink(12); x.beginPath(); x.moveTo(-70, -66); x.lineTo(70, -66); x.stroke(); // handlebar
  shape(() => circ(-74, -66, 11), "#222", 5); shape(() => circ(74, -66, 11), "#222", 5);
  // rider: shoulders + arms to the bars
  ink(14); x.beginPath(); x.moveTo(-46, 6); x.lineTo(-66, -60); x.moveTo(46, 6); x.lineTo(66, -60); x.stroke();
  shape(() => { x.beginPath(); x.ellipse(0, 12, 58, 30, 0, 0, TAU); }, "#2b2f45", 8);
  // helmet + visor (points where the head looks)
  x.save(); x.translate(0, -4); x.rotate(hr);
  shape(() => circ(0, 0, 34), WHITE, 8);
  x.beginPath(); x.arc(0, 0, 26, -Math.PI / 2 - 0.85, -Math.PI / 2 + 0.85); x.strokeStyle = INK; x.lineWidth = 14; x.lineCap = "round"; x.stroke();
  x.restore();
  x.restore();
}
// the eyes' world position for a bike at (X, Y) with heading rot
const eyes = (X, Y, rot) => [X + Math.sin(rot) * 30, Y - 4 - Math.cos(rot) * 30];

// ---------- one frame ----------
const PANEL = { s1: "#ffe27a", s2: "#ffd38a", s3: "#ffb0bd", s4: "#b6f2c8", s5: "#a8e6ff", s6: "#b6f2c8", s7: "#ffe27a" };
const BY = 1030; // bike screen row
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over"; x.setLineDash([]);
  x.clearRect(0, 0, 1080, 1920);
  if (id === "s8") return cta(u);

  page(PAPER);
  const slam = sm(-LEAD, 0.2 - LEAD, u), sgn = IDS.indexOf(id) % 2 ? 1 : -1;
  const z = 1 + 0.03 * cl(u / Math.max(1, d));
  x.save();
  x.translate(CX, 880); x.scale(1 + 0.1 * (1 - slam), 1 + 0.1 * (1 - slam)); x.rotate(sgn * 0.05 * (1 - slam)); x.translate(-CX, -880);
  panelBg(PANEL[id]);

  let scroll = t * 520;
  let inner = () => {}, over = () => {};
  if (id === "s1") {
    const P = back(at("s1", "pothole") - 0.05, at("s1", "pothole") + 0.3, u);
    const py = lerp(620, 700, cl(u / d));
    inner = () => {
      road(scroll);
      pothole(CX + 90, py, P, 1, flash(u, at("s1", "never")));
      bike(CX - 120, BY, 0, VIOLET, 0);
    };
    over = () => tag("POTHOLE", CX + 90, py - 120, RED, sm(at("s1", "pothole"), at("s1", "pothole") + 0.2, u));
  }
  if (id === "s2") {
    const py = lerp(700, 800, cl(u / d));
    const L = sm(at("s2", "lock") - 0.1, at("s2", "lock") + 0.15, u);
    const F = sm(at("s2", "bike") - 0.1, at("s2", "eyes", 2) + 0.2, u);
    const bx = lerp(CX - 120, CX + 40, F), rot = 0.22 * F * (1 - sm(0.85, 1, F) * 0.5);
    const hr = 0.35 * L;
    inner = () => {
      road(scroll);
      pothole(CX + 90, py, 1, 1, 0.6 * L);
      const [ex, ey] = eyes(bx, BY, rot);
      gaze(ex, ey, CX + 90, py, 70, L, "#ff8a95");
      bike(bx, BY, rot, VIOLET, hr);
    };
    over = () => {
      tag("EYES LOCKED", CX - 200, 640, RED, L, 40);
      if (F > 0.05) { ink(10); x.strokeStyle = RED; x.setLineDash([]); x.beginPath(); x.moveTo(CX - 120, BY + 150); x.quadraticCurveTo(CX - 110, BY - 40, bx, BY - 60 * F); x.stroke(); }
    };
  }
  if (id === "s3") {
    const hit = at("s3", "thing");
    const app = sm(0, hit, u);
    const py = lerp(800, BY - 110, app);
    const I = sm(hit - 0.05, hit + 0.05, u);
    const sh = I * (1 - sm(hit + 0.1, hit + 0.8, u)) * Math.sin(u * 70) * 12;
    const bx = lerp(CX + 40, CX + 90, app);
    inner = () => {
      road(scroll * (1 - I * 0.9) + I * hit * 520);
      pothole(CX + 90, py, 1, 1, 0.7);
      const [ex, ey] = eyes(bx, BY, 0.1);
      gaze(ex, ey, CX + 90, py, 70, 1 - I, "#ff8a95");
      x.save(); x.translate(sh, -sh * 0.5); x.rotate(I * 0.06 * Math.sin(u * 40));
      bike(bx, BY, 0.1 * (1 - I), I > 0.5 ? RED : VIOLET, 0.3);
      x.restore();
      speed(CX + 90, BY - 110, 150, 700, 30, I * 0.8, 4);
    };
    over = () => {
      burst("BANG!", CX - 150, 700, pop(u, hit - 0.03), -0.14, 96);
      stamp("x", CX + 270, 1120, back(hit + 0.25, hit + 0.55, u) * 0.6, u > hit + 0.25 ? 1 : 0, RED);
    };
  }
  if (id === "s4") {
    const py = lerp(560, 660, cl(u / d));
    const sp = sm(at("s4", "spot") - 0.05, at("s4", "spot") + 0.15, u);
    const mv = sm(at("s4", "move") - 0.05, at("s4", "clear") + 0.1, u);
    const tx = lerp(CX + 90, CX - 150, mv), ty = lerp(py, 520, mv);
    const path = sm(at("s4", "clear") - 0.1, at("s4", "past") + 0.2, u);
    inner = () => {
      road(scroll);
      pothole(CX + 90, py, 0.85, 1, 0);
      if (path > 0) {
        x.save(); x.setLineDash([30, 18]); x.lineWidth = 16; x.strokeStyle = INK;
        const N = 30; x.beginPath();
        for (let i = 0; i <= N * path; i++) { const k = i / N; const yy = lerp(BY - 150, 480, k); const xx = CX + 20 - 190 * Math.sin(Math.PI * cl(k * 1.15)); i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
        x.stroke(); x.strokeStyle = GREEN; x.lineWidth = 9; x.stroke(); x.restore();
      }
      const [ex, ey] = eyes(CX + 20, BY, 0);
      gaze(ex, ey, tx, ty, 75, sp, mv > 0.5 ? "#a8f5c0" : "#fff3a0");
      bike(CX + 20, BY, 0, mv > 0.5 ? GREEN : VIOLET, lerp(0.15 * sp, -0.35, mv));
    };
    over = () => {
      tag("SPOTTED", CX + 90, py - 110, VIOLET, sp * (1 - mv), 40);
      tag("CLEAR LINE", CX - 170, 600, GREEN, sm(at("s4", "clear") - 0.05, at("s4", "clear") + 0.2, u), 42);
    };
  }
  if (id === "s5") {
    // closer on the rider: the head turns first, the eyes go to the gap
    const T = sm(at("s5", "turn") - 0.05, at("s5", "head") + 0.15, u);
    const L = sm(at("s5", "look") - 0.1, at("s5", "look") + 0.15, u);
    inner = () => {
      x.save(); x.translate(CX, 880); x.scale(1.5, 1.5); x.translate(-CX, -880 - 60);
      road(scroll * 1.0);
      pothole(CX + 90, 650, 0.8, 1, 0);
      const [ex, ey] = eyes(CX + 20, BY, 0);
      gaze(ex, ey, CX - 160, 520, 60, Math.max(T * 0.6, L), "#a8f5c0");
      bike(CX + 20, BY, -0.05 * L, GREEN, -0.55 * T);
      x.restore();
    };
    over = () => {
      tag("HEAD FIRST", CX + 200, 1120, VIOLET, T, 40);
      tag("GO HERE", CX - 220, 640, GREEN, L, 42);
    };
  }
  if (id === "s6") {
    const p = sm(0, at("s6", "it") + 0.15, u);
    const py = lerp(560, 1260, p);
    const off = Math.sin(Math.PI * cl(p / 1.15));
    const bx = CX + 20 - 200 * off;
    const rot = -0.32 * Math.cos(Math.PI * cl(p / 1.15)) * (p < 1 ? 1 : 0);
    const A = sm(at("s6", "around") - 0.05, at("s6", "around") + 0.2, u);
    inner = () => {
      road(scroll);
      pothole(CX + 90, py, 0.85, 1, 0);
      // green trail behind the bike
      x.save(); x.lineWidth = 14; x.strokeStyle = GREEN; x.globalAlpha = 0.85; x.beginPath();
      for (let i = 0; i <= 20; i++) { const q = cl(p - i * 0.03); const o = Math.sin(Math.PI * cl(q / 1.15)); const yy = BY + i * 520 * 0.03 * (at("s6", "it") + 0.15); const xx = CX + 20 - 200 * o; i ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }
      x.stroke(); x.restore();
      const [ex, ey] = eyes(bx, BY, rot);
      gaze(ex, ey, lerp(CX - 170, CX + 20, p), 480, 70, 1, "#a8f5c0");
      bike(bx, BY, rot, GREEN, rot * 0.6);
    };
    over = () => {
      burst("SMOOTH!", CX + 200, 660, pop(u, at("s6", "smooth") + 0.05, 0.9), 0.12, 78, YELLOW, GREEN);
      stamp("v", CX + 280, 1110, back(at("s6", "around"), at("s6", "around") + 0.3, u) * 0.6, A, GREEN);
    };
  }
  if (id === "s7") {
    inner = () => {
      road(scroll);
      pothole(CX + 90, lerp(1180, 1300, cl(u / d)), 0.85, 1, 0);
      const [ex, ey] = eyes(CX - 60, BY, 0);
      gaze(ex, ey, CX - 60, 470, 80, 1, "#a8f5c0");
      bike(CX - 60, BY, 0, GREEN, 0);
    };
  }

  x.save(); panelClip();
  x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880);
  inner();
  x.restore();
  panelBorder();
  x.save(); x.translate(CX, 880); x.scale(z, z); x.translate(-CX, -880); over(); x.restore();
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER STARE", "AT THE POTHOLE"], RED, 375, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") {
    const sw = at("s2", "bike") - 0.15;
    words(["EYES LOCK ON"], RED, 380, 0.0, 1 - sm(sw - 0.1, sw, u), 135);
    words(["BIKE FOLLOWS"], RED, 380, sw, sm(sw - 0.05, sw, u), 135, flash(u, at("s2", "follows")) * 0.6);
  }
  if (id === "s3") words(["STRAIGHT", "INTO IT"], RED, 375, 0.0, 1, 140, flash(u, at("s3", "thing")) * 0.7);
  if (id === "s4") {
    const sw = at("s4", "move") - 0.15;
    words(["SPOT IT EARLY"], GREEN, 380, 0.0, 1 - sm(sw - 0.1, sw, u), 135);
    words(["LOOK PAST IT"], GREEN, 380, sw, sm(sw - 0.05, sw, u), 135, flash(u, at("s4", "clear")) * 0.6);
  }
  if (id === "s5") words(["TURN YOUR HEAD"], GREEN, 380, 0.0, 1, 130, flash(u, at("s5", "head")) * 0.6);
  if (id === "s6") {
    const sw = at("s6", "bike") - 0.15;
    words(["SMOOTH INPUTS"], GREEN, 380, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["AROUND IT"], GREEN, 380, sw, sm(sw - 0.05, sw, u), 140, flash(u, at("s6", "around")) * 0.6);
  }
  if (id === "s7") {
    words(["BIKE GOES"], ORANGE, 700, 0.0, 1, 150, flash(u, 0.05));
    words(["WHERE YOU LOOK"], ORANGE, 890, at("s7", "where") - 0.05, 1, 130, flash(u, at("s7", "look", 2)));
  }
}
// s8 brand card: night halftone page, a wheel badge, comic letters, the free-tier tag
function cta(u) {
  page(NIGHT, "#2c3480");
  speed(CX, 520, 170, 1100, 36, 0.35 * sm(0, 0.3, u), 5, ORANGE);
  const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
  const k = back(0.0, 0.35, u);
  x.save(); x.translate(CX, 520); x.scale(k, k); x.rotate(u * 2.2);
  shape(() => circ(0, 0, 120), "#222", 12);
  shape(() => circ(0, 0, 78), ORANGE, 7);
  ink(9); for (let i = 0; i < 6; i++) { const an = (i / 6) * TAU; x.beginPath(); x.moveTo(Math.cos(an) * 22, Math.sin(an) * 22); x.lineTo(Math.cos(an) * 74, Math.sin(an) * 74); x.stroke(); }
  shape(() => circ(0, 0, 24), WHITE, 6);
  x.restore();
  words([c1], WHITE, 760, 0.15, 1, 130);
  words([c2], ORANGE, 910, 0.3, 1, 170, flash(u, at("s8", "apex")) * 0.5);
  tag("3 FREE RIDES A MONTH", CX, 1060, GREEN, sm(at("s8", "three") - 0.05, at("s8", "three") + 0.2, u), 46);
  if (BRAND.sub) tag(BRAND.sub, CX, 1170, VIOLET, sm(at("s8", "free") - 0.05, at("s8", "free") + 0.2, u), 46);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["look-where-you-go-comic"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
