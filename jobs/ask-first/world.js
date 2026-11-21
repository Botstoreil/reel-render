// ask-first: 2D Canvas reel (flat pictogram people + kinetic text). Time only from hf-seek.
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

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", BG = "#080622";
const CX = 510;
const cv = document.getElementById("world");
const x = cv.getContext("2d");
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;

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
// speech bubble with a tail pointing at (tx, ty)
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

// ---------- pictogram people: joints in px, y up = negative, origin on the floor ----------
const P = {
  dog: { head: [-125, -95], sh: [-80, -140], hip: [30, -235], kL: [92, -118], fL: [150, 0], kR: [104, -118], fR: [168, 0], eL: [-112, -72], hL: [-150, 0], eR: [-100, -72], hR: [-136, 0] },
  stand: { head: [0, -410], sh: [0, -335], hip: [0, -190], kL: [-14, -98], fL: [-24, 0], kR: [14, -98], fR: [24, 0], eL: [-34, -260], hL: [-38, -185], eR: [34, -260], hR: [38, -185] },
  sit: { head: [0, -285], sh: [0, -215], hip: [0, -70], kL: [-100, -38], fL: [30, -18], kR: [100, -38], fR: [-30, -18], eL: [-66, -130], hL: [-88, -50], eR: [66, -130], hR: [88, -50] },
};
function pose(a, b, k) { const o = {}; for (const j in a) o[j] = [lerp(a[j][0], b[j][0], k), lerp(a[j][1], b[j][1], k)]; return o; }
function with_(p, ch) { return Object.assign({}, p, ch); }
// draw a person; returns world positions of the joints (for pointing at them)
function person(X, Y, p, s, color, o = {}) {
  const W2 = (j) => [X + p[j][0] * s, Y + p[j][1] * s];
  const a = o.a ?? 1;
  if (a <= 0) return W2;
  x.save(); x.globalAlpha = a; x.lineCap = "round"; x.lineJoin = "round";
  const limb = (c, ...js) => { x.strokeStyle = c; x.beginPath(); js.forEach((j, i) => { const [px, py] = W2(j); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); };
  const far = mix(color, "#080622", 0.35);
  glow(color, 22); x.lineWidth = 34 * s;
  limb(far, "hip", "kR", "fR"); limb(far, "sh", "eR", "hR");
  x.lineWidth = 44 * s; limb(color, "sh", "hip");
  x.lineWidth = 34 * s; limb(color, "hip", "kL", "fL"); limb(color, "sh", "eL", "hL");
  const [hx, hy] = W2("head");
  x.fillStyle = color; x.beginPath(); x.arc(hx, hy, 40 * s, 0, Math.PI * 2); x.fill(); noGlow();
  if (o.closed) { x.strokeStyle = "#080622"; x.lineWidth = 6 * s; x.beginPath(); x.arc(hx - 13 * s, hy - 2 * s, 9 * s, 0.2, Math.PI - 0.2); x.stroke(); x.beginPath(); x.arc(hx + 13 * s, hy - 2 * s, 9 * s, 0.2, Math.PI - 0.2); x.stroke(); }
  x.restore();
  return W2;
}
function mat(X, Y, w, a = 1, c = VIOLET) {
  x.save(); x.globalAlpha = a; glow(c, 26); x.fillStyle = mix(c, "#080622", 0.55); rr(X - w / 2, Y, w, 22, 11); x.fill(); x.restore();
}
function room() {
  const gr = x.createRadialGradient(CX, 820, 80, CX, 820, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  // studio floor
  x.save(); x.globalAlpha = 0.18; x.strokeStyle = VIOLET; x.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const y = 1110 + i * i * 9; x.beginPath(); x.moveTo(0, y); x.lineTo(1080, y); x.stroke(); }
  for (let i = -8; i <= 8; i++) { x.beginPath(); x.moveTo(CX + i * 60, 1110); x.lineTo(CX + i * 220, 1920); x.stroke(); }
  x.restore();
}
function ring(X, Y, r, c, a) { if (a <= 0) return; x.save(); x.globalAlpha = a; glow(c, 30); x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); x.stroke(); x.restore(); }
function burst(X, Y, c, a, u) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; glow(c, 24); x.strokeStyle = c; x.lineWidth = 9; x.lineCap = "round";
  for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 + (i - 2.5) * 0.42, r0 = 60 + 6 * Math.sin(u * 20 + i), r1 = r0 + 40 * a; x.beginPath(); x.moveTo(X + Math.cos(an) * r0, Y + Math.sin(an) * r0); x.lineTo(X + Math.cos(an) * r1, Y + Math.sin(an) * r1); x.stroke(); }
  x.restore();
}
function check(X, Y, s, a, c = GREEN) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round"; glow(c, 30); x.strokeStyle = c; x.lineWidth = 20;
  x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); x.stroke(); x.restore();
}
// a standing teacher on the floor at (TX, Y), right hand on (tx, ty)
function arm(tx, ty, a, c, TX, Y, s) {
  if (a <= 0) return;
  const rx = (tx - TX) / s, ry = (ty - Y) / s;
  const p = with_(P.stand, { eR: [rx * 0.5, (-335 + ry) / 2 - 20], hR: [rx, ry] });
  person(TX, Y, p, s, c, { a });
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  room();
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);

  if (id === "s1") {
    mat(640, 1060, 420);
    const st = person(640, 1060, P.dog, 1, VIOLET);
    const walk = sm(0, at("s1", "touch") - 0.2, u), sw = Math.sin(u * 9) * (1 - walk) * 0.9;
    const reach = sm(at("s1", "touch") - 0.35, at("s1", "touch"), u);
    const [hx, hy] = st("hip");
    const tp = with_(P.stand, { fL: [-24 + 40 * sw, 0], fR: [24 - 40 * sw, 0], kL: [-14 + 20 * sw, -98], kR: [14 - 20 * sw, -98] });
    const TX = lerp(120, 330, walk);
    const rp = with_(tp, { eR: [lerp(34, 120, reach), lerp(-260, -320, reach)], hR: [lerp(38, (hx - TX) / 1.0, reach), lerp(-185, hy - 1060, reach)] });
    person(TX, 1060, rp, 1, RED);
    ring(hx, hy, 70 + 10 * Math.sin(u * 10), RED, sm(at("s1", "touch") - 0.05, at("s1", "touch") + 0.15, u));
  }
  if (id === "s2") {
    const push = sm(at("s2", "adjustment") - 0.1, at("s2", "adjustment") + 0.3, u);
    const sp = with_(P.dog, { hip: [30 + 22 * push, -235 + 30 * push] });
    mat(600, 1080, 520);
    const st = person(600, 1080, sp, 1.35, VIOLET);
    const [hx, hy] = st("hip");
    arm(hx - 10, hy - 20, 1, RED, 880, 1080, 1.0);
    const [ex, ey] = st("head");
    const f = sm(at("s2", "different") - 0.15, at("s2", "different") + 0.1, u);
    burst(ex, ey, RED, f, u);
    tag("FEELS WRONG", ex + 40, ey - 150, RED, f, 42);
    tag("LOOKS FINE", 280, 560, VIOLET, sm(at("s2", "looks") - 0.15, at("s2", "looks") + 0.1, u), 42);
  }
  if (id === "s3") {
    const xs = [200, 500, 790];
    xs.forEach((X, i) => mat(X, 1060, 220, 1));
    const ps = xs.map((X, i) => person(X, 1060, P.dog, 0.55, i === 1 ? VIOLET : mix(VIOLET, "#080622", 0.3)));
    const [hx, hy] = ps[1]("hip");
    arm(hx - 5, hy - 10, 1, RED, 620, 1060, 0.55);
    const [ex, ey] = ps[1]("head");
    const b = sm(at("s3", "won't") - 0.2, at("s3", "won't") + 0.1, u);
    bubble("NO", ex + 20, ey - 200, RED, b, ex, ey - 40, 70);
    if (b > 0.5) { // the "no" stays unsaid: struck out
      const k = sm(at("s3", "say") - 0.05, at("s3", "no") + 0.1, u);
      x.save(); glow(RED, 20); x.strokeStyle = RED; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); const bx = Math.max(Math.min(ex + 20, 930 - 90), 150); x.moveTo(bx - 70, ey - 160); x.lineTo(bx - 70 + 140 * k, ey - 240); x.stroke(); x.restore();
    }
    // the room watching: little eyes over the others
    const w = sm(at("s3", "front") - 0.15, at("s3", "front") + 0.1, u);
    [0, 2].forEach((i) => { const [qx, qy] = ps[i]("head"); tag("?", qx, qy - 110, RED, w * 0.9, 40); });
  }
  if (id === "s4") {
    const xs = [230, 510, 790];
    const closed = u > at("s4", "closed") - 0.1;
    const up = sm(at("s4", "hands") - 0.1, at("s4", "up") + 0.1, u);
    xs.forEach((X, i) => {
      mat(X, 1080, 240, 1, GREEN);
      const raise = i !== 1 ? up : 0;
      const p = with_(P.sit, { eR: [lerp(66, 70, raise), lerp(-130, -320, raise)], hR: [lerp(88, 80, raise), lerp(-50, -420, raise)] });
      const W2 = person(X, 1080, p, 0.8, i === 1 ? VIOLET : GREEN, { closed });
      if (i !== 1) tag("NO TOUCH", X, 1080 - 430 * 0.8 - 70, GREEN, sm(at("s4", "no") - 0.1, at("s4", "touch") + 0.1, u), 36);
    });
    bubble("EYES CLOSED", CX, 560, GREEN, sm(at("s4", "eyes") - 0.2, at("s4", "eyes") + 0.1, u) * (1 - sm(at("s4", "no") - 0.25, at("s4", "no") - 0.1, u)), CX, 700, 46);
  }
  if (id === "s5") {
    mat(650, 1070, 400, 1);
    const st = person(650, 1070, P.dog, 1, VIOLET);
    person(250, 1070, P.stand, 1, GREEN);
    bubble("MAY I ADJUST?", 380, 560, VIOLET, sm(at("s5", "may") - 0.15, at("s5", "may") + 0.15, u), 250, 650, 54);
    const [hx, hy] = st("hip");
    ring(hx, hy, 66 + 8 * Math.sin(u * 10), GREEN, sm(at("s5", "hips") - 0.1, at("s5", "hips") + 0.1, u));
    const [ex, ey] = st("head");
    check(ex + 30, ey - 120, back(at("s5", "hips") + 0.05, at("s5", "hips") + 0.3, u) * 0.7, sm(at("s5", "hips"), at("s5", "hips") + 0.1, u));
  }
  if (id === "s6") {
    const lift = sm(at("s6", "fixes") - 0.2, at("s6", "fixes") + 0.35, u);
    const sp = with_(P.dog, { hip: [30, -235 - 55 * lift], kL: [92, -125 - 10 * lift], kR: [104, -125 - 10 * lift] });
    mat(650, 1070, 400, 1, GREEN);
    const st = person(650, 1070, sp, 1, lift > 0.5 ? GREEN : VIOLET);
    person(250, 1070, P.stand, 1, GREEN);
    const v = sm(at("s6", "verbal") - 0.2, at("s6", "verbal") + 0.1, u);
    bubble("LIFT YOUR HIPS", 360, 560, GREEN, v, 250, 650, 52);
    // sound waves from the teacher
    if (v > 0) { x.save(); x.globalAlpha = v; glow(GREEN, 20); x.strokeStyle = GREEN; x.lineWidth = 7; for (let i = 0; i < 3; i++) { const r = 30 + i * 26 + ((u * 60) % 26); x.beginPath(); x.arc(270, 660, r, -0.6, 0.6); x.stroke(); } x.restore(); }
    const [hx, hy] = st("hip");
    if (lift > 0.05) { x.save(); x.globalAlpha = lift; glow(GREEN, 26); x.strokeStyle = GREEN; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.moveTo(hx + 90, hy + 110); x.lineTo(hx + 90, hy - 10); x.moveTo(hx + 60, hy + 20); x.lineTo(hx + 90, hy - 10); x.lineTo(hx + 120, hy + 20); x.stroke(); x.restore(); }
    tag("NO HAND NEEDED", 600, 1200, GREEN, sm(at("s6", "need") - 0.15, at("s6", "need") + 0.1, u), 42);
  }
  if (id === "s7") {
    mat(CX, 1130, 260, 0.6, GREEN);
    person(CX, 1130, P.sit, 0.5, GREEN, { closed: true, a: 0.7 });
  }
  x.restore();

  if (id === "s1") words(["NEVER TOUCH", "WITHOUT ASKING"], RED, 380, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") words(["FEELS DIFFERENT"], RED, 360, 0.0, 1, 130, flash(u, at("s2", "different")) * 0.6);
  if (id === "s3") words(["THEY WON'T SAY NO"], RED, 360, 0.0, 1, 120);
  if (id === "s4") {
    const sw = at("s4", "hands") - 0.1;
    words(["ASK THE CLASS"], GREEN, 360, 0.0, 1 - sm(sw - 0.1, sw, u), 130);
    words(["HANDS UP"], GREEN, 360, sw, sm(sw - 0.05, sw, u), 150);
  }
  if (id === "s5") words(["ASK AGAIN"], VIOLET, 360, 0.0, 1, 150);
  if (id === "s6") words(["VERBAL CUE FIRST"], GREEN, 360, 0.0, 1, 130);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["ASK FIRST."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["EVERY TIME."], ORANGE, 880, at("s7", "every") - 0.05, 1, 160, flash(u, at("s7", "time")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 120, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = GREEN; glow(GREEN, 30); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 155, u * 2, u * 2 + 1.4); x.stroke();
    x.restore();
    person(CX, 560 + 95 * k, P.sit, 0.62 * k, VIOLET, { closed: true });
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["ask-first-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
