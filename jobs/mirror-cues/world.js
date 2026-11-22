// mirror-cues: 2D Canvas reel (flat pictogram people + kinetic text), same look as ask-first. Time only from hf-seek.
// Camera = a student's seat: the teacher faces us, so the teacher's own LEFT arm is on screen RIGHT.
// Students in the front row are seen from behind: their own left is on screen LEFT.
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

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", SKY = "#7fd8ff", BG = "#080622";
const CX = 510;
const cv = document.getElementById("world");
// MINIMAL LINE style (style test 22.11, style 8): white paper, one thin black line that draws the scene, one accent
// colour (the old warm colours: wrong-way marks, title, end card), lots of empty space. The story code is unchanged:
// a thin wrapper maps every colour and line width as it is set.
const raw = cv.getContext("2d");
const PAPER = "#fbfaf7", INKC = "#121212", ACCENT = "#ff3b30";
let drawK = 1; // 0..1 how much of each line is drawn (draws itself at the start of every voice line)
function lineColor(v) {
  if (typeof v !== "string") return "rgba(0,0,0,0)"; // no gradients in this style
  let r, g, b, a = 1;
  if (/^#[0-9a-f]{6}$/i.test(v)) { r = parseInt(v.slice(1, 3), 16); g = parseInt(v.slice(3, 5), 16); b = parseInt(v.slice(5, 7), 16); }
  else { const m = v.match(/rgba?\(([^)]+)\)/); if (!m) return v; [r, g, b, a = 1] = m[1].split(",").map(Number); }
  if (0.3 * r + 0.59 * g + 0.11 * b < 70) return `rgba(251,250,247,${a})`; // dark fills become paper
  if (r > g + 60 && r > b + 60) return a < 1 ? `rgba(255,59,48,${a})` : ACCENT; // red / orange = the accent
  return a < 1 ? `rgba(18,18,18,${a})` : INKC;
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
function glow(c, b) { x.shadowColor = c; x.shadowBlur = b; }
function noGlow() { x.shadowBlur = 0; }
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
      glow(color, 30 + 40 * flashK); x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
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
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function bubble(txt, X, Y, color, a, tx, ty, px = 52) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 70, h = px * 1.8, s = back(0, 1, a);
  X = Math.min(X, 930 - w / 2); X = Math.max(X, 60 + w / 2);
  x.translate(X, Y); x.scale(s, s);
  glow(color, 30); x.fillStyle = "#14113a"; x.strokeStyle = color; x.lineWidth = 7;
  rr(-w / 2, -h / 2, w, h, 34); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-24, h / 2 - 4); x.lineTo((tx - X) * 0.35, (ty - Y) * 0.35); x.lineTo(16, h / 2 - 4); x.fill(); x.stroke();
  x.fillStyle = "#14113a"; x.fillRect(-26, h / 2 - 12, 44, 10); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}

// ---------- pictogram people ----------
const STAND = { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] };
// arm raise on the screen-LEFT side (sl) and screen-RIGHT side (sr), 0..1 each
function raise(sl, sr) {
  return Object.assign({}, STAND, {
    eL: [lerp(-34, -80, sl), lerp(-260, -420, sl)], hL: [lerp(-38, -96, sl), lerp(-185, -520, sl)],
    eR: [lerp(34, 80, sr), lerp(-260, -420, sr)], hR: [lerp(38, 96, sr), lerp(-185, -520, sr)],
  });
}
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s * (o.sx ?? 1), Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, ...js) => { x.strokeStyle = c; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  glow(color, 22); x.lineWidth = 34 * s;
  limb(color, "hip", "kR", "fR"); limb(color, "sh", "eR", "hR");
  x.lineWidth = 44 * s; limb(color, "sh", "hip");
  x.lineWidth = 34 * s; limb(color, "hip", "kL", "fL"); limb(color, "sh", "eL", "hL");
  const [hx, hy] = W2("head");
  x.fillStyle = color; x.beginPath(); x.arc(hx, hy, 40 * s, 0, Math.PI * 2); x.fill(); noGlow();
  if (o.face) { x.fillStyle = "#080622"; x.beginPath(); x.arc(hx - 13 * s, hy - 4 * s, 6 * s, 0, Math.PI * 2); x.arc(hx + 13 * s, hy - 4 * s, 6 * s, 0, Math.PI * 2); x.fill(); }
  x.restore();
  return W2;
}
function room() {
  // white paper and one floor line: the empty space is the style
  raw.fillStyle = PAPER; raw.fillRect(0, 0, 1080, 1920);
  x.save(); x.strokeStyle = INKC; x.lineWidth = 3; x.beginPath(); x.moveTo(90, 1110); x.lineTo(990, 1110); x.stroke(); x.restore();
}
function windowFrame(X, Y, a, k) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; glow(SKY, 20 + 30 * k); x.fillStyle = "#10204a"; x.strokeStyle = SKY; // Minimal Line: outline only (a lit fill turned into a black block) x.lineWidth = 10;
  rr(X - 90, Y - 150, 180, 300, 10); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(X, Y - 150); x.lineTo(X, Y + 150); x.moveTo(X - 90, Y); x.lineTo(X + 90, Y); x.stroke();
  x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; glow(c, 30); x.strokeStyle = c; x.lineWidth = 20;
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke(); x.beginPath();
  if (kind === "x") { x.moveTo(-34, -34); x.lineTo(34, 34); x.moveTo(34, -34); x.lineTo(-34, 34); }
  else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}
const ROW = [220, 510, 800], TY = 1080, SY = 1620;
// front row of students (backs to us): sl/sr = which screen side they raise
function students(sl, sr, c, a = 1) { ROW.forEach((X) => person(X, SY, raise(sl, sr), 0.5, mix(c, "#080622", 0.25), { a })); }

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  drawK = sm(-LEAD, 0.75, u);
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  room();
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    // teacher faces the class and lifts their OWN left arm (screen right) while saying "left"
    const r = sm(at("s1", "left") - 0.25, at("s1", "left") + 0.1, u);
    person(CX, TY, raise(0, r), 0.95, VIOLET, { face: true });
    bubble("LEFT ARM!", 760, 520, VIOLET, sm(at("s1", "cue") - 0.1, at("s1", "cue") + 0.15, u), CX + 60, 640, 50);
    mark("x", 260, 760, back(at("s1", "right") - 0.1, at("s1", "right") + 0.2, u) * 0.6, u > at("s1", "right") - 0.1 ? 1 : 0, RED);
    students(0, 0, VIOLET, sm(-0.05, 0.3, u));
  }
  if (id === "s2") {
    // labels: the teacher's LEFT is on the students' RIGHT side
    person(CX, TY, raise(0, 1), 0.95, VIOLET, { face: true });
    const L = sm(at("s2", "left") - 0.1, at("s2", "left") + 0.15, u), R = sm(at("s2", "right") - 0.1, at("s2", "right") + 0.15, u);
    tag("YOUR LEFT", 800, 560, VIOLET, L, 42);
    tag("= THEIR RIGHT", 800, 660, RED, R, 42);
    // arrow from the label down to the students' right side
    if (R > 0) { x.save(); x.globalAlpha = R; glow(RED, 20); x.strokeStyle = RED; x.lineWidth = 10; x.lineCap = "round"; x.beginPath(); x.moveTo(860, 720); x.lineTo(860, 1320); x.moveTo(830, 1290); x.lineTo(860, 1320); x.lineTo(890, 1290); x.stroke(); x.restore(); }
    students(0, 0, VIOLET);
    tag("STUDENTS", CX, 1700, VIOLET, 0.8, 34);
  }
  if (id === "s3") {
    // students copy the body: they raise the arm on the SAME screen side = their own right. Wrong arm.
    person(CX, TY, raise(0, 1), 0.95, VIOLET, { face: true });
    bubble("LEFT", 760, 520, VIOLET, sm(-0.05, 0.2, u), CX + 60, 640, 50);
    const c = sm(at("s3", "copy") - 0.15, at("s3", "copy") + 0.25, u);
    students(0, c, c > 0.5 ? RED : VIOLET);
    tag("THEIR RIGHT ARM", 760, 1250, RED, sm(at("s3", "body") - 0.1, at("s3", "body") + 0.2, u), 40);
    tag("NOT YOUR WORDS", 300, 1360, RED, sm(at("s3", "words") - 0.15, at("s3", "words") + 0.1, u), 38);
  }
  if (id === "s4") {
    // mirrored demo: teacher lifts their own RIGHT (screen left) while saying "left arm"; students copy = correct
    const r = sm(at("s4", "right") - 0.2, at("s4", "arm") + 0.1, u);
    person(CX, TY, raise(r, 0), 0.95, GREEN, { face: true });
    tag("YOUR RIGHT", 250, 560, GREEN, sm(at("s4", "right") - 0.05, at("s4", "right") + 0.2, u), 40);
    bubble("LEFT ARM", 760, 520, GREEN, sm(at("s4", "say") - 0.15, at("s4", "left") + 0.1, u), CX + 60, 640, 50);
    const c = sm(at("s4", "left") - 0.05, at("s4", "left") + 0.35, u);
    students(c, 0, GREEN);
    mark("v", 820, 1250, back(at("s4", "arm", 2), at("s4", "arm", 2) + 0.3, u) * 0.55, u > at("s4", "arm", 2) ? 1 : 0, GREEN);
  }
  if (id === "s5") {
    // landmark cue: "the arm closer to the window" (window on the screen-left wall)
    const wk = sm(at("s5", "window") - 0.2, at("s5", "window") + 0.1, u);
    windowFrame(110, 760, sm(-0.05, 0.3, u), wk);
    person(CX, TY, raise(0, 0), 0.95, GREEN, { face: true });
    tag("LANDMARKS", 790, 900, GREEN, sm(at("s5", "landmarks") - 0.1, at("s5", "landmarks") + 0.15, u), 42);
    bubble("ARM BY THE WINDOW", 640, 560, GREEN, sm(at("s5", "arm") - 0.15, at("s5", "closer") + 0.1, u), CX, 640, 44);
    const c = sm(at("s5", "window") - 0.05, at("s5", "window") + 0.3, u);
    students(c, 0, GREEN);
    if (c > 0.3) { x.save(); x.globalAlpha = c; glow(SKY, 20); x.strokeStyle = SKY; x.lineWidth = 6; x.setLineDash([16, 12]); x.beginPath(); x.moveTo(200, 900); x.lineTo(ROW[0] - 40, SY - 260); x.stroke(); x.restore(); }
  }
  if (id === "s6") {
    // teacher turns sideways (squash in x), everyone lifts the same side
    const tn = sm(at("s6", "turn") - 0.1, at("s6", "sideways") + 0.1, u);
    const sx = lerp(1, 0.3, tn);
    const r = sm(at("s6", "sees") - 0.2, at("s6", "same") + 0.1, u);
    person(CX, TY, raise(r, 0), 0.95, GREEN, { face: tn < 0.5, sx });
    tag("SIDEWAYS", 780, 560, GREEN, sm(at("s6", "sideways") - 0.1, at("s6", "sideways") + 0.2, u), 42);
    students(r, 0, GREEN);
    tag("SAME SIDE", CX, 1700, GREEN, sm(at("s6", "same") - 0.05, at("s6", "side", 2) + 0.15, u), 38);
  }
  if (id === "s7") {
    person(CX, TY, raise(0.6, 0), 0.8, GREEN, { face: true, a: 0.6 });
  }
  x.restore();

  if (id === "s1") words(["NEVER CUE", "YOUR OWN LEFT"], RED, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["YOUR LEFT", "IS THEIR RIGHT"], RED, 330, 0.0, 1, 140, flash(u, at("s2", "right")) * 0.6);
  if (id === "s3") words(["THEY COPY", "YOUR BODY"], RED, 330, 0.0, 1, 140, flash(u, at("s3", "copy")) * 0.6);
  if (id === "s4") words(["DEMO MIRRORED"], GREEN, 330, 0.0, 1, 130, flash(u, at("s4", "mirrored")) * 0.6);
  if (id === "s5") words(["CUE BY", "LANDMARKS"], GREEN, 260, 0.0, 1, 140);
  if (id === "s6") words(["OR TURN", "SIDEWAYS"], GREEN, 330, 0.0, 1, 140);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["THEIR LEFT."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["NOT YOURS."], ORANGE, 880, at("s7", "not") - 0.05, 1, 160, flash(u, at("s7", "yours")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 120, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = GREEN; glow(GREEN, 30); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 155, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    person(CX, 560 + 95 * k, STAND, 0.45 * Math.max(0.001, k), VIOLET);
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["mirror-cues-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
