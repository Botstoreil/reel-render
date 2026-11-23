// stop-in-gear (Apex 12, TikTok) - MINIMAL LINE style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-minimal-line.js):
// white paper, one thin black line, one red accent. Top-down diagram of a lane at a red light; traffic moves UP.
// Wrong: the bike stops tight behind the car ahead, in neutral, not watching; a car behind comes in too fast and the
// bike is boxed in. Right: first gear, clutch in, a gap in front, brake light flashed, mirrors watched; when the car
// behind is not slowing, the bike rides into the space beside the car ahead. Time only from hf-seek.
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

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff";
const CX = 510;
const cv = document.getElementById("world");
const raw = cv.getContext("2d");
// INKC is a light colour on purpose: lineColor() maps every light non-red colour to the black line (#121212);
// passing #121212 itself would be read as a dark fill and turn into paper.
const PAPER = "#fbfaf7", INK_OUT = "#121212", INKC = "#a596ff", ACCENT = "#ff3b30";
let drawK = 1;
function lineColor(v) {
  if (typeof v !== "string") return "rgba(0,0,0,0)";
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  if (0.3 * r + 0.59 * g + 0.11 * b < 70) return `rgba(251,250,247,${a})`;
  if (r > g + 60 && r > b + 60) return a < 1 ? `rgba(255,59,48,${a})` : ACCENT;
  return a < 1 ? `rgba(18,18,18,${a})` : INK_OUT;
}
const x = new Proxy(raw, {
  get(t, k) {
    if (k === "stroke") return (...a) => { const L = 2600; t.setLineDash([L * drawK, L]); t.stroke(...a); t.setLineDash([]); };
    const v = t[k]; return typeof v === "function" ? v.bind(t) : v;
  },
  set(t, k, v) {
    if (k === "fillStyle" || k === "strokeStyle") v = lineColor(v);
    else if (k === "lineWidth") v = Math.min(v, 5);
    else if (k === "shadowBlur") v = 0;
    t[k] = v; return true;
  },
});
const FONT = (px) => `800 ${px}px Inter, Arial, sans-serif`;
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
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - k) * 40); x.scale(s, s); x.globalAlpha = a * o;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color;
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
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(8,6,34,0.92)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; x.strokeStyle = c; x.lineWidth = 20;
  x.fillStyle = "rgba(8,6,34,1)"; x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke(); x.beginPath();
  if (kind === "x") { x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); }
  else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- the street (board px), traffic moves up ----------
const LL = 300, LR = 740, STOP = 545;
const AHEAD = [560, 700];          // car ahead, waiting at the stop line
const BW = [560, 915];             // wrong: bike tight behind it, in the middle
const BRt = [400, 1010];           // right: bike back from it, on the left wheel track
const ESC = [400, 720];            // the space beside the car ahead

function street(a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = INKC; x.lineWidth = 4; x.lineCap = "round";
  x.beginPath(); x.moveTo(LL, 540); x.lineTo(LL, 1560); x.moveTo(LR, 540); x.lineTo(LR, 1560); x.stroke();
  x.lineWidth = 5; x.beginPath(); x.moveTo(LL, STOP); x.lineTo(LR, STOP); x.stroke();
  // traffic light on the corner, red on (below the stop line so it stays clear of the title)
  x.lineWidth = 4; x.fillStyle = "rgba(8,6,34,1)"; rr(800, 570, 70, 180, 18); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(835, 750); x.lineTo(835, 820); x.stroke();
  x.fillStyle = RED; x.beginPath(); x.arc(835, 608, 20, 0, Math.PI * 2); x.fill();
  x.strokeStyle = INKC; x.lineWidth = 3;
  x.beginPath(); x.arc(835, 660, 20, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.arc(835, 712, 20, 0, Math.PI * 2); x.stroke();
  x.restore();
}
// car seen from above, nose up
function car(X, Y, a, c = INKC, brake = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.lineJoin = "round"; x.lineCap = "round";
  x.fillStyle = "rgba(8,6,34,1)"; x.strokeStyle = c; x.lineWidth = 5;
  rr(X - 80, Y - 120, 160, 240, 38); x.fill(); x.stroke();
  x.lineWidth = 4;
  rr(X - 60, Y - 70, 120, 46, 14); x.stroke();          // windscreen
  rr(X - 56, Y + 52, 112, 34, 12); x.stroke();          // rear window
  x.beginPath(); x.moveTo(X - 62, Y - 18); x.lineTo(X - 62, Y + 44); x.moveTo(X + 62, Y - 18); x.lineTo(X + 62, Y + 44); x.stroke();
  // mirrors
  x.beginPath(); x.moveTo(X - 80, Y - 40); x.lineTo(X - 98, Y - 46); x.moveTo(X + 80, Y - 40); x.lineTo(X + 98, Y - 46); x.stroke();
  if (brake > 0) { x.globalAlpha = a * brake; x.fillStyle = RED; rr(X - 66, Y + 108, 36, 12, 5); x.fill(); rr(X + 30, Y + 108, 36, 12, 5); x.fill(); }
  x.restore();
}
// motorcycle seen from above, nose up; light = rear brake light 0..1
function bike(X, Y, a, c = INKC, light = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(-Math.PI / 2); x.scale(0.72, 0.72); x.lineCap = "round"; x.lineJoin = "round";
  x.strokeStyle = c; x.lineWidth = 5; x.fillStyle = "rgba(8,6,34,1)";
  rr(-118, -13, 64, 26, 12); x.fill(); x.stroke();
  rr(48, -12, 64, 24, 11); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(-8, 0, 72, 28, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(52, -54); x.lineTo(52, 54); x.stroke();
  x.beginPath(); x.moveTo(52, -54); x.lineTo(40, -70); x.moveTo(52, 54); x.lineTo(40, 70); x.stroke(); // mirrors
  x.fillStyle = c; x.beginPath(); x.arc(-24, 0, 24, 0, Math.PI * 2); x.fill();
  if (light > 0) { x.globalAlpha = a * light; x.fillStyle = RED; x.beginPath(); x.arc(-132, 0, 16, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
function gear(txt, X, Y, color, a) {
  if (a <= 0) return;
  const s = back(0, 1, a);
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(8,6,34,1)"; x.strokeStyle = color; x.lineWidth = 5;
  x.beginPath(); x.arc(0, 0, 62, 0, Math.PI * 2); x.fill(); x.stroke();
  x.font = FONT(txt.length > 1 ? 44 : 64); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 4);
  x.font = FONT(20); x.fillText("GEAR", 0, -84);
  x.restore();
}
function gapBar(X, y0, y1, color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 5; x.lineCap = "round";
  x.beginPath(); x.moveTo(X, y0); x.lineTo(X, y1); x.moveTo(X - 20, y0); x.lineTo(X + 20, y0); x.moveTo(X - 20, y1); x.lineTo(X + 20, y1); x.stroke();
  x.restore();
}
function dots(x0, y0, x1, y1, color, a, k = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color;
  const n = 12;
  for (let i = 0; i <= n * k; i++) { const f = i / n; x.beginPath(); x.arc(lerp(x0, x1, f), lerp(y0, y1, f), 7, 0, Math.PI * 2); x.fill(); }
  // arrow head
  if (k > 0.95) { const h = Math.atan2(y1 - y0, x1 - x0); x.beginPath(); x.moveTo(x1 + Math.cos(h) * 30, y1 + Math.sin(h) * 30); x.lineTo(x1 + Math.cos(h + 2.5) * 30, y1 + Math.sin(h + 2.5) * 30); x.lineTo(x1 + Math.cos(h - 2.5) * 30, y1 + Math.sin(h - 2.5) * 30); x.closePath(); x.fill(); }
  x.restore();
}
function speed(X, Y, color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 5; x.lineCap = "round";
  for (const [dx, l] of [[-60, 110], [0, 160], [60, 110]]) { x.beginPath(); x.moveTo(X + dx, Y + 150); x.lineTo(X + dx, Y + 150 + l); x.stroke(); }
  x.restore();
}
function sight(X, Y, a) {
  // mirror sight lines from the bike back to the lane behind
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.8; x.fillStyle = INKC;
  for (const ex of [LL + 40, LR - 40]) for (let i = 1; i <= 8; i++) { const f = i / 8; x.beginPath(); x.arc(lerp(X, ex, f), lerp(Y + 40, 1330, f), 5, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
function eyesDown(X, Y, a, c) {
  // a little phone in the rider's hand, glowing
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 4; x.fillStyle = "rgba(8,6,34,1)";
  rr(X - 18, Y - 30, 36, 60, 8); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(X - 8, Y + 20); x.lineTo(X + 8, Y + 20); x.stroke();
  x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  drawK = sm(-LEAD, 0.7, u);
  x.setTransform(1, 0, 0, 1, 0, 0);
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  let z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * cut * cut, fx = CX, fy = 900;
  if (id === "s3") { z = lerp(1.0, 1.12, sm(0, d, u)); fy = 980; }
  // the diagram sits 100 px higher than the board so the cars stay clear of the caption pill (y 1240-1350)
  x.save(); x.translate(CX, 800); x.scale(z, z); x.translate(-fx, -fy);

  if (id === "s1") {
    const a = sm(-0.05, 0.3, u);
    street(a); car(AHEAD[0], AHEAD[1], a, INKC, 1);
    const Y = lerp(1120, BW[1], sm(0, at("s1", "light") + 0.2, u));
    bike(BW[0], Y, a, RED);
    gear("N", 830, 930, RED, sm(at("s1", "neutral") - 0.1, at("s1", "neutral") + 0.3, u));
    const E = sm(at("s1", "eyes") - 0.1, at("s1", "eyes") + 0.15, u);
    eyesDown(BW[0] - 50, Y + 20, E, RED);
    tag("EYES DOWN", 400, 1130, RED, E, 38);
  }
  if (id === "s2") {
    street(1); car(AHEAD[0], AHEAD[1], 1, INKC, 1);
    bike(BW[0], BW[1], 1, RED);
    eyesDown(BW[0] - 50, BW[1] + 20, 1, RED);
    const G = sm(at("s2", "right") - 0.1, at("s2", "behind") + 0.15, u);
    gapBar(670, 820, 835, RED, G);
    tag("NO GAP", 830, 800, RED, G, 40);
    gear("N", 830, 1000, RED, sm(at("s2", "neutral") - 0.15, at("s2", "neutral") + 0.2, u));
    tag("NOT WATCHING", 420, 1160, RED, sm(at("s2", "not") - 0.1, at("s2", "watching") + 0.1, u), 38);
  }
  if (id === "s3") {
    street(1); car(AHEAD[0], AHEAD[1], 1, INKC, 1);
    bike(BW[0], BW[1], 1, RED);
    const k = sm(0, at("s3", "fast") + 0.35, u);
    const CY = lerp(1700, 1150, k);
    car(BW[0], CY, 1, RED);
    speed(BW[0], CY, RED, k < 0.98 ? sm(0, 0.2, u) : 1 - sm(at("s3", "fast") + 0.35, at("s3", "fast") + 0.6, u));
    tag("TOO FAST", 820, 1260, RED, sm(at("s3", "fast") - 0.15, at("s3", "fast") + 0.1, u), 40);
    // boxed in: red brackets on both sides of the bike
    const B = sm(at("s3", "nowhere") - 0.1, at("s3", "nowhere") + 0.2, u);
    if (B > 0) {
      x.save(); x.globalAlpha = B; x.strokeStyle = RED; x.lineWidth = 5; x.lineCap = "round";
      x.beginPath(); x.moveTo(490, 830); x.lineTo(470, 830); x.lineTo(470, 1000); x.lineTo(490, 1000);
      x.moveTo(630, 830); x.lineTo(650, 830); x.lineTo(650, 1000); x.lineTo(630, 1000); x.stroke(); x.restore();
    }
    tag("NO WAY OUT", 300, 760, RED, B, 40);
    mark("x", 300, 920, back(at("s3", "go") - 0.05, at("s3", "go") + 0.3, u) * 0.6, u > at("s3", "go") - 0.05 ? 1 : 0, RED);
  }
  if (id === "s4") {
    const a = sm(-0.05, 0.25, u);
    street(1); car(AHEAD[0], AHEAD[1], 1, INKC, 1);
    const Y = lerp(1200, BRt[1], sm(0, at("s4", "stay") + 0.3, u));
    bike(BRt[0], Y, a, INKC);
    gear("1", 820, 960, INKC, sm(at("s4", "first") - 0.1, at("s4", "gear") + 0.2, u));
    tag("CLUTCH IN", 820, 1150, INKC, sm(at("s4", "clutch") - 0.1, at("s4", "clutch") + 0.15, u), 40);
    mark("v", 200, 1180, back(at("s4", "move") - 0.05, at("s4", "move") + 0.3, u) * 0.5, u > at("s4", "move") - 0.05 ? 1 : 0, INKC);
  }
  if (id === "s5") {
    street(1); car(AHEAD[0], AHEAD[1], 1, INKC, 1);
    const fl = sm(at("s5", "flash") - 0.05, at("s5", "flash"), u) * (1 - sm(at("s5", "watch") - 0.1, at("s5", "watch"), u));
    const blink = fl * (Math.sin((u - at("s5", "flash")) * 18) > 0 ? 1 : 0.15);
    bike(BRt[0], BRt[1], 1, INKC, blink);
    const G = sm(at("s5", "gap") - 0.1, at("s5", "gap") + 0.2, u);
    gapBar(330, 830, BRt[1] - 85, INKC, G);
    tag("GAP", 200, 900, INKC, G, 42);
    tag("BRAKE LIGHT", 820, 1130, RED, sm(at("s5", "flash") - 0.1, at("s5", "brake") + 0.1, u), 36);
    const M = sm(at("s5", "watch") - 0.1, at("s5", "mirrors") + 0.1, u);
    sight(BRt[0], BRt[1], M);
    car(560, 1480, sm(at("s5", "watch") - 0.2, at("s5", "watch") + 0.1, u), INKC);
    tag("MIRRORS", 830, 1290, INKC, M, 40);
    gear("1", 820, 900, INKC, 1);
  }
  if (id === "s6") {
    street(1); car(AHEAD[0], AHEAD[1], 1, INKC, 1);
    const k = sm(0, at("s6", "ahead") + 0.2, u);
    const CY = lerp(1560, 1150, k);
    car(BW[0], CY, 1, RED);
    speed(BW[0], CY, RED, 1 - sm(at("s6", "ahead"), at("s6", "ahead") + 0.3, u));
    tag("NOT SLOWING", 820, 1270, RED, sm(at("s6", "not") - 0.1, at("s6", "slowing") + 0.1, u), 36);
    const P = sm(at("s6", "ride") - 0.25, at("s6", "ride") + 0.15, u);
    dots(BRt[0], BRt[1] - 110, ESC[0], ESC[1] - 40, INKC, P, P);
    const m = sm(at("s6", "into") - 0.05, at("s6", "ahead") + 0.1, u);
    bike(BRt[0], lerp(BRt[1], ESC[1], m), 1, INKC, 0);
    tag("WAY OUT", 180, 760, INKC, sm(at("s6", "space") - 0.1, at("s6", "space") + 0.15, u), 40);
    mark("v", 180, 1000, back(at("s6", "ahead") - 0.05, at("s6", "ahead") + 0.3, u) * 0.5, u > at("s6", "ahead") - 0.05 ? 1 : 0, INKC);
  }
  if (id === "s7") {
    street(0.6); car(AHEAD[0], AHEAD[1], 0.6, INKC, 1); bike(BRt[0], BRt[1], 0.6, INKC);
  }
  x.restore();

  if (id === "s1") words(["NEVER WAIT", "IN NEUTRAL"], RED, 300, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "neutral"))));
  if (id === "s2") words(["TIGHT AND", "IN NEUTRAL"], RED, 300, 0.0, 1, 150, flash(u, at("s2", "neutral")) * 0.6);
  if (id === "s3") words(["NOWHERE", "TO GO"], RED, 300, 0.0, 1, 150, flash(u, at("s3", "nowhere")) * 0.6);
  if (id === "s4") words(["STAY IN", "FIRST GEAR"], GREEN, 300, 0.0, 1, 150, flash(u, at("s4", "first")) * 0.6);
  if (id === "s5") words(["GAP. LIGHT.", "MIRRORS."], GREEN, 300, 0.0, 1, 150, flash(u, at("s5", "mirrors")) * 0.6);
  if (id === "s6") words(["RIDE INTO", "THE SPACE"], GREEN, 300, 0.0, 1, 150, flash(u, at("s6", "space")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.75)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["STAY IN GEAR."], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["KEEP A WAY OUT."], ORANGE, 880, at("s7", "keep") - 0.05, 1, 140, flash(u, at("s7", "out")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.85)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    x.strokeStyle = INKC; x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 110, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = RED; x.beginPath(); x.arc(0, 0, 150, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    bike(CX, 560, k > 0.05 ? 1 : 0, INKC);
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, INKC, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["stop-in-gear-line"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
