// passenger-mount (Apex 18, TikTok) - CLAY style: plasticine figures and bike, seen from behind, warm studio backdrop,
// soft shading, thick dark outlines. Wrong: the red bike is on its stand, the rider is standing beside it, the
// passenger swings a leg over, the bike tips and goes down. Right: the rider gets on first, feet down, both brakes on;
// the passenger steps on the peg and swings over only when the rider says ready; gets off the same way after the OK.
// Time only from hf-seek.
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

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const RED = "#e8402f", GREEN = "#2fbf5a", VIOLET = "#7d5ce8", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#3a2012", AMBER = "#f0a020";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hex(a), B2 = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (830 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, p) => s + p * 1.06, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((p) => x.measureText(p).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.53;
    parts.forEach((p, i) => {
      const s0 = t0 + wi * 0.07, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - kk) * 30); x.scale(0.5 + 0.5 * kk, 0.5 + 0.5 * kk); x.globalAlpha = a * o;
      x.lineWidth = Math.max(12, px * 0.17); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// clay label: rounded pill, thick outline
function tag(txt, X, Y, color, a, px = 42) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 54, h = px * 1.7, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1360);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(58,32,18,0.25)"; rr(-w / 2 + 6, -h / 2 + 8, w, h, h / 2); x.fill();
  x.fillStyle = color; rr(-w / 2, -h / 2, w, h, h / 2); x.fill();
  x.strokeStyle = INK; x.lineWidth = 6; rr(-w / 2, -h / 2, w, h, h / 2); x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.fillStyle = c; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill();
  x.strokeStyle = INK; x.lineWidth = 9; x.stroke();
  x.strokeStyle = WHITE; x.lineWidth = 22; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- clay world ----------
const GY = 1180, PX = 540;   // ground line, bike pivot x (tyre contact)
function studio() {
  const g = x.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, "#f6dfb9"); g.addColorStop(1, "#eab98a");
  x.fillStyle = g; x.fillRect(-200, -200, 1480, GY + 200);
  const f = x.createLinearGradient(0, GY, 0, 1920); f.addColorStop(0, "#c98a58"); f.addColorStop(1, "#a86c40");
  x.fillStyle = f; x.fillRect(-200, GY, 1480, 1000);
  x.strokeStyle = "rgba(58,32,18,0.35)"; x.lineWidth = 4; x.beginPath(); x.moveTo(-200, GY); x.lineTo(1280, GY); x.stroke();
}
// a clay blob: base colour + soft highlight + dark outline
function clay(pathFn, c, lw = 6) {
  pathFn(); x.fillStyle = c; x.fill();
  x.save(); x.clip(); x.globalAlpha = 0.35; x.fillStyle = WHITE; x.translate(-14, -16); pathFn(); x.globalAlpha = 0.18; x.fill(); x.restore();
  pathFn(); x.strokeStyle = INK; x.lineWidth = lw; x.stroke();
}
function limb(a, b, c, w) {
  x.lineCap = "round";
  x.strokeStyle = INK; x.lineWidth = w + 10; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
  x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
  x.strokeStyle = "rgba(255,255,255,0.25)"; x.lineWidth = w * 0.3; x.beginPath(); x.moveTo(a[0] - 6, a[1] - 4); x.lineTo(b[0] - 6, b[1] - 4); x.stroke();
}
function shadow(X, w, a = 0.28) { x.save(); x.fillStyle = `rgba(58,32,18,${a})`; x.beginPath(); x.ellipse(X, GY + 10, w, 18, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
// bike seen from behind; r = lean (+ = top to the right), stand = side stand down, brake = tail light
function bike(r, c, o = {}) {
  const { stand = 0, brake = 0 } = o;
  x.save(); x.translate(PX, GY); x.rotate(r); x.lineJoin = "round";
  // handlebar + mirrors (behind)
  limb([-170, -420], [170, -420], "#4a3a34", 18);
  limb([-150, -420], [-175, -500], "#4a3a34", 10); limb([150, -420], [175, -500], "#4a3a34", 10);
  clay(() => { x.beginPath(); x.ellipse(-182, -515, 30, 20, 0, 0, Math.PI * 2); }, "#8fb7d8", 5);
  clay(() => { x.beginPath(); x.ellipse(182, -515, 30, 20, 0, 0, Math.PI * 2); }, "#8fb7d8", 5);
  if (stand > 0) limb([-50, -110], [-50 - 80 * stand, -4], "#4a3a34", 14);
  // tyre
  clay(() => rr(-34, -190, 68, 190, 30), "#2b2523", 6);
  // body, tank sides, exhaust
  clay(() => rr(-200, -250, 70, 60, 26), "#9a9a9a", 5);
  clay(() => rr(-110, -330, 220, 150, 50), c, 6);
  clay(() => rr(-96, -372, 192, 54, 26), "#3b3330", 6);         // seat
  clay(() => rr(-60, -232, 120, 46, 12), "#f2e6c8", 5);          // plate
  // tail light
  x.save(); if (brake > 0) { x.shadowColor = "#ff2a10"; x.shadowBlur = 40 * brake; }
  clay(() => rr(-40, -300, 80, 26, 12), brake > 0 ? mix("#7a1a10", "#ff3a18", brake) : "#7a1a10", 5); x.restore();
  // pegs: rider (low) and passenger (higher, wider)
  limb([-70, -150], [-112, -150], "#4a3a34", 14); limb([70, -150], [112, -150], "#4a3a34", 14);
  limb([-80, -200], [-122, -200], "#6a5a54", 12); limb([80, -200], [122, -200], "#6a5a54", 12);
  x.restore();
}
// a clay person seen from behind
function person(P, shirt, helmet, o = {}) {
  const { a = 1 } = o;
  if (a <= 0) return;
  x.save(); x.globalAlpha = a;
  const [hx, hy] = P.hip, [Hx, Hy] = P.head;
  const sh = [[Hx - 62, Hy + 95], [Hx + 62, Hy + 95]];
  const knee = (f, side) => [lerp(hx + side * 34, f[0], 0.5) + side * 26, lerp(hy, f[1], 0.5) - 10];
  [[P.feet[0], -1], [P.feet[1], 1]].forEach(([f, side]) => {
    const k = knee(f, side), hp = [hx + side * 34, hy];
    limb(hp, k, "#34465e", 52); limb(k, f, "#34465e", 46);
    clay(() => { x.beginPath(); x.ellipse(f[0], f[1] - 8, 34, 20, 0, 0, Math.PI * 2); }, "#2b2523", 5);
  });
  clay(() => { x.beginPath(); x.moveTo(sh[0][0] - 10, sh[0][1] - 10); x.quadraticCurveTo(Hx, Hy + 70, sh[1][0] + 10, sh[1][1] - 10); x.lineTo(hx + 56, hy); x.quadraticCurveTo(hx, hy + 22, hx - 56, hy); x.closePath(); }, shirt, 6);
  [[sh[0], P.hands[0]], [sh[1], P.hands[1]]].forEach(([s0, h]) => {
    const el = [lerp(s0[0], h[0], 0.5) + (h[0] < s0[0] ? -14 : 14), lerp(s0[1], h[1], 0.5) + 10];
    limb(s0, el, shirt, 34); limb(el, h, shirt, 30);
    clay(() => { x.beginPath(); x.arc(h[0], h[1], 19, 0, Math.PI * 2); }, "#2b2523", 4);
  });
  clay(() => { x.beginPath(); x.arc(Hx, Hy, 64, 0, Math.PI * 2); }, helmet, 7);
  x.restore();
}
const lp = (A, B, k) => ({ hip: [lerp(A.hip[0], B.hip[0], k), lerp(A.hip[1], B.hip[1], k)], head: [lerp(A.head[0], B.head[0], k), lerp(A.head[1], B.head[1], k)], feet: A.feet.map((f, i) => [lerp(f[0], B.feet[i][0], k), lerp(f[1], B.feet[i][1], k)]), hands: A.hands.map((h, i) => [lerp(h[0], B.hands[i][0], k), lerp(h[1], B.hands[i][1], k)]) });
const stand = (X) => ({ hip: [X, 960], head: [X, 770], feet: [[X - 34, GY], [X + 34, GY]], hands: [[X - 70, 1010], [X + 70, 1010]] });
const R_SEAT = { hip: [540, 905], head: [540, 650], feet: [[400, GY], [680, GY]], hands: [[380, 765], [700, 765]] };
const P_PEG = { hip: [390, 900], head: [390, 710], feet: [[430, 982], [320, GY]], hands: [[450, 830], [500, 760]] };
const P_SWING = { hip: [500, 860], head: [490, 700], feet: [[430, 982], [640, 850]], hands: [[470, 820], [560, 760]] };
const P_SEAT = { hip: [540, 880], head: [540, 735], feet: [[430, 982], [650, 982]], hands: [[455, 870], [625, 870]] };
const W_SWING = { hip: [470, 880], head: [460, 700], feet: [[330, GY], [640, 870]], hands: [[420, 870], [590, 820]] };
const W_SIT = { hip: [540, 870], head: [540, 690], feet: [[440, 1000], [640, 990]], hands: [[450, 860], [630, 860]] };
const PSH = "#f2c230", PHE = "#f4f0e6", RSH = "#3f7fd8", RHE = "#2b2523";
const UPR = 0;

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  studio();
  const L = [];

  if (id === "s1") {
    shadow(PX, 150);
    bike(-0.09, RED, { stand: 1 });
    const wk = sm(0, 1.6, u);
    shadow(lerp(120, 250, wk), 70); person(stand(lerp(120, 250, wk)), PSH, PHE);
    shadow(820, 70); person(stand(820), RSH, RHE);
    L.push(() => tag("PASSENGER", 250, 600, AMBER, sm(at("s1", "passenger") - 0.1, at("s1", "passenger") + 0.2, u)));
    L.push(() => tag("RIDER", 820, 600, "#3f7fd8", sm(at("s1", "never") - 0.1, at("s1", "never") + 0.2, u)));
  }
  if (id === "s2") {
    const Sw = at("s2", "swing"), St = at("s2", "standing");
    const k = sm(Sw - 0.1, Sw + 1.1, u), r = lerp(-0.09, 0.04, sm(Sw + 0.6, d, u));
    shadow(PX, 150);
    bike(r, RED, { stand: 1 - sm(Sw + 0.6, d, u) });
    shadow(820, 70); person(stand(820), RSH, RHE);
    person(lp(stand(250), W_SWING, k), PSH, PHE);
    L.push(() => tag("STILL STANDING", 760, 600, RED, sm(St - 0.1, St + 0.2, u)));
  }
  if (id === "s3") {
    const Ti = at("s3", "tips"), Dn = at("s3", "down");
    const r = lerp(0.04, 1.28, Math.pow(sm(Ti - 0.25, Dn + 0.15, u), 1.6));
    shadow(PX + 200 * r, 150 + 120 * r);
    const rx = lerp(820, 930, sm(Ti, Ti + 0.4, u));
    person(stand(rx), RSH, RHE);
    x.save(); x.translate(PX, GY); x.rotate(r); x.translate(-PX, -GY);
    bike(0, RED);
    person(lp(W_SWING, W_SIT, sm(-0.2, Ti, u)), PSH, PHE);
    x.restore();
    L.push(() => tag("TIPS OVER", 300, 640, RED, sm(Ti - 0.1, Ti + 0.2, u)));
    L.push(() => mark("x", 300, 900, back(Dn, Dn + 0.3, u) * 0.7, u > Dn - 0.05 ? 1 : 0, RED));
    L.push(() => { x.save(); x.globalAlpha = 0.3 * flash(u, Dn + 0.15); x.fillStyle = RED; x.fillRect(-200, -200, 1480, 2400); x.restore(); });
  }
  if (id === "s4") {
    const On = at("s4", "first"), Ft = at("s4", "feet"), Br = at("s4", "brakes");
    const k = sm(0, On + 0.2, u);
    shadow(PX, 150);
    bike(lerp(-0.09, 0, k), VIOLET, { stand: 1 - k, brake: sm(Br - 0.1, Br + 0.1, u) });
    person(lp(stand(260), R_SEAT, k), RSH, RHE);
    shadow(170, 60); person(stand(170), PSH, PHE, { a: 0.95 });
    L.push(() => tag("RIDER FIRST", 760, 600, VIOLET, sm(On - 0.1, On + 0.2, u)));
    L.push(() => tag("FEET DOWN", 820, 1120, GREEN, sm(Ft - 0.1, Ft + 0.2, u)));
    L.push(() => tag("BOTH BRAKES", 760, 740, GREEN, sm(Br - 0.1, Br + 0.2, u)));
  }
  if (id === "s5") {
    const Pg = at("s5", "peg"), Rd = at("s5", "ready");
    shadow(PX, 150);
    bike(0, VIOLET, { brake: 1 });
    person(R_SEAT, RSH, RHE);
    const k1 = sm(Pg - 0.4, Pg + 0.1, u), k2 = sm(Rd + 0.05, Rd + 0.5, u), k3 = sm(Rd + 0.4, d + 0.1, u);
    let P = lp(stand(200), P_PEG, k1); if (k2 > 0) P = lp(P_PEG, P_SWING, k2); if (k3 > 0) P = lp(P_SWING, P_SEAT, k3);
    shadow(lerp(200, 540, k2), 60, 0.2); person(P, PSH, PHE);
    L.push(() => tag("PEG", 330, 1070, GREEN, sm(Pg - 0.1, Pg + 0.2, u)));
    L.push(() => tag("\"READY\"", 790, 600, VIOLET, sm(Rd - 0.15, Rd + 0.1, u)));
  }
  if (id === "s6") {
    const Ge = at("s6", "get"), Tl = at("s6", "tell");
    shadow(PX, 150);
    bike(0, VIOLET, { brake: 1 });
    person(R_SEAT, RSH, RHE);
    const k = sm(Tl + 0.1, d + 0.2, u);
    let P = P_SEAT; if (k > 0) P = k < 0.5 ? lp(P_SEAT, P_SWING, k * 2) : lp(P_SWING, P_PEG, (k - 0.5) * 2);
    person(P, PSH, PHE);
    L.push(() => tag("WAIT FOR OK", 300, 640, GREEN, sm(Ge - 0.1, Ge + 0.2, u) * (1 - sm(Tl, Tl + 0.2, u))));
    L.push(() => tag("\"OK\"", 790, 600, VIOLET, sm(Tl - 0.15, Tl + 0.1, u)));
    L.push(() => mark("v", 820, 900, back(Tl + 0.1, Tl + 0.4, u) * 0.55, u > Tl ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") {
    shadow(PX, 150); bike(0, VIOLET); person(R_SEAT, RSH, RHE); person(P_SEAT, PSH, PHE);
  }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER LET THEM", "GET ON FIRST"], RED, 330, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "climb"))));
  if (id === "s2") words(["YOU'RE STILL", "STANDING"], RED, 330, 0.0, 1, 160, flash(u, at("s2", "standing")) * 0.6);
  if (id === "s3") words(["THE BIKE", "GOES DOWN"], RED, 330, 0.0, 1, 160, flash(u, at("s3", "down")) * 0.6);
  if (id === "s4") words(["YOU GET", "ON FIRST"], GREEN, 330, 0.0, 1, 160, flash(u, at("s4", "first")) * 0.6);
  if (id === "s5") words(["THEY GET ON WHEN", "YOU SAY READY"], GREEN, 330, 0.0, 1, 150, flash(u, at("s5", "ready")) * 0.6);
  if (id === "s6") words(["OFF ONLY", "AFTER YOUR OK"], GREEN, 330, 0.0, 1, 160, flash(u, at("s6", "tell")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(58,32,18,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["RIDER", "ON FIRST."], ORANGE, 560, 0.0, 1, 170, flash(u, 0.05));
    words(["PASSENGER WAITS", "FOR YOUR OK."], ORANGE, 930, at("s7", "passenger") - 0.05, 1, 150, flash(u, at("s7", "passenger")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(58,32,18,0.78)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    clay(() => { x.beginPath(); x.arc(0, 0, 150, 0, Math.PI * 2); }, "#f6dfb9", 9);
    x.restore();
    if (k > 0.3) { x.save(); x.translate(CX - PX, 560 - 870); x.translate(PX, 870); x.scale(0.42, 0.42); x.translate(-PX, -870); x.globalAlpha = cl((k - 0.3) / 0.4); bike(0, VIOLET); x.restore(); }
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["passenger-mount-clay"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
