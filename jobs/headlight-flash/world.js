// headlight-flash (Apex 17, TikTok) - NEON NIGHT style: top-down city junction at night, glowing neon outlines on deep
// purple, light beams. Right-hand traffic. Near lane (y=955) runs RIGHT, far lane (y=825) runs LEFT.
// Wrong: a stopped car left of the side road flashes its lights; the red bike pulls out to turn left; a car hidden
// behind the stopped car swings out to overtake it and comes straight into the bike's path.
// Right: the violet bike treats the flash as a hint, creeps to where it can see past the car, looks both ways, waits
// for the overtaking car, and goes only when the road is clear. Time only from hf-seek.
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
const RED = "#ff3b5c", GREEN = "#3dffa0", VIOLET = "#b48cff", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#12002a", AMBER = "#ffd23d";
const CYAN = "#3de8ff", PINK = "#ff4fd8", NIGHT = "#0d0424";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B2 = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }
const glow = (c, b = 18) => { x.shadowColor = c; x.shadowBlur = b; };
const noGlow = () => { x.shadowBlur = 0; };

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
      x.lineWidth = Math.max(10, px * 0.15); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      glow(color, 22 + 30 * flashK);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// neon sign label
function tag(txt, X, Y, color, a, px = 40) {
  if (a <= 0) return;
  const m = x.getTransform(); X = m.a * X + m.e; Y = m.d * Y + m.f;
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 48, h = px * 1.55, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1360);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(18,0,42,0.88)"; rr(-w / 2, -h / 2, w, h, 16); x.fill();
  glow(color, 20); x.strokeStyle = color; x.lineWidth = 5; rr(-w / 2, -h / 2, w, h, 16); x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  const m = x.getTransform(); X = m.a * X + m.e; Y = m.d * Y + m.f;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.fillStyle = "rgba(18,0,42,0.95)"; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.fill();
  glow(c, 26); x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- the city ----------
const RT = 760, RB = 1020, MIDY = 890, LA = 825, LB = 955;   // main road top/bottom, centre line, far lane, near lane
const SL = 470, SR = 650, BXc = 560;                         // side road edges, bike x
const BLOCKS = [[-60, 380, 300, 320], [270, 380, 330, 320], [630, 380, 520, 320], [-60, 1060, 500, 360], [690, 1060, 460, 360], [-60, 1460, 500, 400], [690, 1460, 460, 400]];
function city(t) {
  const g = x.createLinearGradient(0, 300, 0, 1700); g.addColorStop(0, "#1a0638"); g.addColorStop(1, NIGHT);
  x.fillStyle = g; x.fillRect(-200, -200, 1480, 2400);
  // roofs with neon trim and lit windows (deterministic)
  BLOCKS.forEach(([X, Y, w, h], i) => {
    x.save(); x.fillStyle = "rgba(40,12,80,0.85)"; rr(X, Y, w, h, 18); x.fill();
    glow(i % 2 ? PINK : CYAN, 14); x.strokeStyle = i % 2 ? "rgba(255,79,216,0.55)" : "rgba(61,232,255,0.5)"; x.lineWidth = 3; rr(X, Y, w, h, 18); x.stroke(); noGlow();
    for (let a = 0; a < 6; a++) for (let b = 0; b < 4; b++) {
      const on = ((i * 7 + a * 3 + b * 5) % 4) !== 0, fl = 0.55 + 0.25 * Math.sin(t * 1.3 + i + a * 2 + b);
      if (!on) continue;
      x.fillStyle = `rgba(255,${200 + ((a + b) % 3) * 20},140,${0.18 * fl})`;
      x.fillRect(X + 26 + a * (w - 52) / 6, Y + 30 + b * (h - 60) / 4, (w - 52) / 6 - 12, (h - 60) / 4 - 16);
    }
    x.restore();
  });
  // asphalt
  x.fillStyle = "#170a2e"; x.fillRect(-200, RT, 1480, RB - RT); x.fillRect(SL, RB - 2, SR - SL, 900);
  x.save(); x.lineCap = "round"; glow(CYAN, 16); x.strokeStyle = CYAN; x.lineWidth = 5;
  x.beginPath(); x.moveTo(-200, RT); x.lineTo(1280, RT); x.moveTo(-200, RB); x.lineTo(SL, RB); x.lineTo(SL, 1900); x.moveTo(SR, 1900); x.lineTo(SR, RB); x.lineTo(1280, RB); x.stroke();
  glow(PINK, 14); x.strokeStyle = PINK; x.lineWidth = 5; x.setLineDash([40, 30]); x.beginPath(); x.moveTo(-200, MIDY); x.lineTo(1280, MIDY); x.stroke(); x.setLineDash([]);
  // give-way line at the side road mouth
  x.strokeStyle = "rgba(255,255,255,0.7)"; x.lineWidth = 5; noGlow(); x.setLineDash([14, 12]); x.beginPath(); x.moveTo(SL + 8, RB + 12); x.lineTo(SR - 8, RB + 12); x.stroke(); x.setLineDash([]);
  x.restore();
}
// car from above; ang = heading. front points along ang.
function car(X, Y, ang, c, o = {}) {
  const { a = 1, blink = 0, brake = 0 } = o;
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(ang + Math.PI / 2); x.scale(0.72, 0.72);
  x.lineJoin = "round"; x.lineCap = "round";
  x.fillStyle = "rgba(20,4,40,0.95)"; rr(-80, -120, 160, 240, 38); x.fill();
  glow(c, 22); x.strokeStyle = c; x.lineWidth = 6; rr(-80, -120, 160, 240, 38); x.stroke();
  x.lineWidth = 4; rr(-60, -70, 120, 46, 14); x.stroke(); rr(-56, 52, 112, 34, 12); x.stroke();
  x.fillStyle = "rgba(255,250,220,0.95)"; glow(WHITE, 16); rr(-66, -126, 34, 12, 5); x.fill(); rr(32, -126, 34, 12, 5); x.fill();
  if (blink > 0) { x.fillStyle = AMBER; glow(AMBER, 20); x.globalAlpha = a * blink; rr(-82, -124, 22, 16, 5); x.fill(); x.globalAlpha = a; }
  if (brake > 0) { x.fillStyle = RED; glow(RED, 24); x.globalAlpha = a * brake; rr(-62, 112, 34, 12, 4); x.fill(); rr(28, 112, 34, 12, 4); x.fill(); }
  x.restore();
}
// headlight beams in front of a car; k = brightness (flash)
function beams(X, Y, ang, k, len = 300) {
  if (k <= 0.02) return;
  x.save(); x.translate(X, Y); x.rotate(ang); x.globalCompositeOperation = "lighter";
  for (const off of [-30, 30]) {
    const g = x.createLinearGradient(80, 0, 80 + len, 0);
    g.addColorStop(0, `rgba(255,250,210,${0.75 * k})`); g.addColorStop(1, "rgba(255,250,210,0)");
    x.fillStyle = g; x.beginPath(); x.moveTo(84, off); x.lineTo(84 + len, off - 70); x.lineTo(84 + len, off + 70); x.closePath(); x.fill();
  }
  x.restore();
}
function bike(X, Y, ang, c, o = {}) {
  const { a = 1, brake = 0, head = 0 } = o;
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(ang); x.scale(0.6, 0.6); x.lineCap = "round"; x.lineJoin = "round";
  x.fillStyle = "rgba(20,4,40,0.95)"; glow(c, 22); x.strokeStyle = c; x.lineWidth = 8;
  rr(-118, -13, 64, 26, 12); x.fill(); x.stroke();
  rr(48, -12, 64, 24, 11); x.fill(); x.stroke();
  x.beginPath(); x.ellipse(-8, 0, 72, 28, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(52, -54); x.lineTo(52, 54); x.stroke();
  // rider helmet, visor shows where they look
  x.fillStyle = c; x.beginPath(); x.arc(-24, 0, 24, 0, Math.PI * 2); x.fill();
  x.save(); x.translate(-24, 0); x.rotate(head); x.fillStyle = WHITE; noGlow(); rr(8, -12, 14, 24, 6); x.fill(); x.restore();
  if (brake > 0) { x.globalAlpha = a * brake; x.fillStyle = RED; glow(RED, 26); x.beginPath(); x.arc(-134, 0, 15, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
// rider's view: a cone from (X,Y) toward angle ang, length len
function sight(X, Y, ang, len, color, a, spread = 0.22) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a * 0.5; x.translate(X, Y); x.rotate(ang);
  const g = x.createLinearGradient(0, 0, len, 0); g.addColorStop(0, color); g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.lineTo(len, -len * spread); x.lineTo(len, len * spread); x.closePath(); x.fill();
  x.globalAlpha = a; glow(color, 16); x.strokeStyle = color; x.lineWidth = 3; x.setLineDash([12, 10]);
  x.beginPath(); x.moveTo(0, 0); x.lineTo(len, 0); x.stroke(); x.restore();
}
function zone(X0, Y0, X1, Y1, color, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; glow(color, 20); x.strokeStyle = color; x.lineWidth = 6; x.setLineDash([20, 12]); rr(X0, Y0, X1 - X0, Y1 - Y0, 20); x.stroke();
  noGlow(); x.fillStyle = color; x.globalAlpha = a * 0.14; rr(X0, Y0, X1 - X0, Y1 - Y0, 20); x.fill(); x.restore();
}
function dots(pts, color, a, k = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.fillStyle = color; glow(color, 14);
  const segs = pts.length - 1, n = 16;
  for (let i = 1; i <= n * k; i++) { const f = (i / n) * segs, s = Math.min(segs - 1, Math.floor(f)), r = f - s; x.beginPath(); x.arc(lerp(pts[s][0], pts[s + 1][0], r), lerp(pts[s][1], pts[s + 1][1], r), 8, 0, Math.PI * 2); x.fill(); }
  x.restore();
}
function lamp(X, Y, a, k) {   // a small traffic light, green lit
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(k, k);
  x.fillStyle = "rgba(20,4,40,0.95)"; rr(-46, -120, 92, 240, 22); x.fill(); glow(CYAN, 12); x.strokeStyle = CYAN; x.lineWidth = 4; rr(-46, -120, 92, 240, 22); x.stroke();
  [["rgba(255,59,92,0.25)", -72], ["rgba(255,210,61,0.25)", 0], [GREEN, 72]].forEach(([c, y], i) => { x.fillStyle = c; if (i === 2) glow(GREEN, 30); else noGlow(); x.beginPath(); x.arc(0, y, 28, 0, Math.PI * 2); x.fill(); });
  x.restore();
}
const UP = -Math.PI / 2, RIGHT = 0, LEFT = Math.PI;
const SCX = 330;                 // stopped car x (left of the side road, facing right)
const blinkFlash = (u, T) => (u > T && u < T + 0.9 ? (Math.sin((u - T) * 22) > 0 ? 1 : 0.15) : 0);

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  const ZM = 1.55;   // camera close on the junction
  x.save(); x.translate(540, 900); x.scale(z * ZM, z * ZM); x.translate(-540, -960);
  city(t);
  const L = [];

  if (id === "s1" || id === "s2" || id === "s3") {
    // stopped car + hidden car behind it
    const F = id === "s1" ? blinkFlash(u, at("s1", "flashes") - 0.05) : id === "s2" ? blinkFlash(u, -0.3) * 0.7 : 0;
    beams(SCX, LB, RIGHT, 0.15 + 0.85 * F);
    car(SCX, LB, RIGHT, CYAN, { brake: 0.5 });
  }
  if (id === "s1") {
    const k = cl((u + LEAD) / (d + LEAD));
    car(110 + 20 * k, LB, RIGHT, RED, { a: 0.9 });
    bike(BXc, 1120, UP, RED, { head: -0.6 * sm(0.4, 1.0, u) });
    sight(BXc, 1100, Math.atan2(LB - 1100, SCX + 90 - BXc), 210, RED, sm(at("s1", "never") - 0.2, at("s1", "never") + 0.2, u));
    L.push(() => tag("FLASH", 330, 1110, AMBER, sm(at("s1", "flashes") - 0.1, at("s1", "flashes") + 0.2, u)));
    L.push(() => tag("BLOCKS YOUR VIEW", 770, 1150, RED, sm(at("s1", "trust") - 0.1, at("s1", "trust") + 0.2, u)));
  }
  if (id === "s2") {
    const P = at("s2", "pull");
    car(130 + 25 * cl(u / d), LB, RIGHT, RED, { a: 0.9 });
    const by = lerp(1120, 960, sm(P - 0.05, d + 0.2, u));
    bike(BXc, by, UP, RED);
    dots([[BXc, 1120], [BXc, 900], [480, LA]], RED, sm(P - 0.1, P + 0.2, u) * 0.8, sm(P - 0.1, P + 0.6, u));
    L.push(() => tag("PULLING OUT", 790, 1150, RED, sm(P - 0.1, P + 0.2, u)));
    L.push(() => tag("WAVED ON", 300, 1110, AMBER, sm(at("s2", "waved") - 0.1, at("s2", "waved") + 0.2, u)));
  }
  if (id === "s3") {
    const C = at("s3", "comes"), Pt = at("s3", "path"), St = at("s3", "straight");
    // hidden car swings out into the far lane and races past the stopped car
    const sw = sm(-0.1, C + 0.1, u), run = sm(0.2, Pt, u), stop = sm(Pt, Pt + 0.3, u);
    const hx = lerp(155, 450, run * (1 - 0.06 * stop)), hy = lerp(LB, LA, sw);
    car(hx, hy, RIGHT - 0.35 * Math.sin(sw * Math.PI), RED, { brake: stop });
    // bike crosses the near lane, starts the left turn, then brakes in the far lane
    const bk = sm(-0.2, St, u);
    const bx = lerp(BXc, 540, bk), by = lerp(960, 850, bk);
    bike(bx, by, UP - 0.45 * bk, RED, { brake: sm(St - 0.1, St + 0.1, u) });
    L.push(() => tag("HIDDEN CAR", 210, 720, RED, sm(at("s3", "see") - 0.1, at("s3", "see") + 0.2, u)));
    L.push(() => mark("x", 450, 640, back(Pt, Pt + 0.3, u) * 0.6, u > Pt - 0.05 ? 1 : 0, RED));
    L.push(() => { if (u > Pt - 0.05) { x.save(); x.globalAlpha = 0.35 * flash(u, Pt + 0.05); x.fillStyle = RED; x.fillRect(-200, -200, 1480, 2400); x.restore(); } });
  }
  if (id === "s4") {
    const H = at("s4", "hint"), G = at("s4", "green");
    beams(SCX, LB, RIGHT, 0.15 + 0.85 * blinkFlash(u, at("s4", "flash") - 0.05));
    car(SCX, LB, RIGHT, CYAN, { brake: 0.5 });
    car(120, LB, RIGHT, WHITE, { a: 0.7 });
    bike(BXc, 1120, UP, VIOLET, { brake: 0.6 });
    L.push(() => tag("JUST A HINT", 330, 1110, AMBER, sm(H - 0.15, H + 0.15, u)));
    L.push(() => lamp(800, 1180, sm(G - 0.3, G - 0.1, u), 0.8));
    L.push(() => mark("x", 800, 1180, back(G + 0.1, G + 0.4, u) * 0.55, u > G ? 1 : 0, RED));
    L.push(() => tag("WAIT", 560, 1300, VIOLET, sm(0.1, 0.4, u)));
  }
  if (id === "s5") {
    const Lk = at("s5", "look"), Pa = at("s5", "past"), Bo = at("s5", "both"), M = at("s5", "move");
    beams(SCX, LB, RIGHT, 0.15);
    car(SCX, LB, RIGHT, CYAN, { brake: 0.5 });
    const by = lerp(1120, 1050, sm(0, 0.6, u));
    bike(BXc, by, UP, VIOLET, { brake: 0.6, head: lerp(-0.9, 0.9, sm(Bo - 0.1, Bo + 0.3, u)) * sm(Lk - 0.1, Lk + 0.2, u) });
    // overtaking car is now visible to the rider: it comes past in the far lane
    const run = sm(Pa - 0.4, M + 0.4, u);
    car(lerp(150, 1150, run), lerp(LB, LA, sm(Pa - 0.4, Pa, u)), RIGHT, WHITE, { a: 1 - sm(M + 0.1, M + 0.3, u) });
    sight(BXc, by - 20, Math.atan2(LA - by, 120 - BXc), 470, GREEN, sm(Lk - 0.1, Lk + 0.15, u) * (1 - sm(Bo, Bo + 0.25, u)));
    sight(BXc, by - 20, Math.atan2(LA - by, 1000 - BXc), 470, GREEN, sm(Bo, Bo + 0.25, u));
    L.push(() => tag("CAR COMING", 230, 690, GREEN, sm(Pa - 0.1, Pa + 0.2, u) * (1 - sm(M, M + 0.3, u))));
    L.push(() => tag("BOTH WAYS", 800, 1180, VIOLET, sm(Bo - 0.1, Bo + 0.2, u)));
  }
  if (id === "s6") {
    const G = at("s6", "go"), C = at("s6", "clear");
    car(SCX, LB, RIGHT, CYAN, { brake: 0.5 });
    L.push(() => zone(SL - 120, RT + 8, SR + 40, RB + 40, GREEN, sm(0, 0.3, u)));
    const go = sm(C - 0.2, d + 0.3, u);
    const bx = lerp(BXc, 470, sm(0.5, 1, go)), by = lerp(1050, LA, sm(0, 0.7, go));
    bike(bx, by, UP - 1.2 * sm(0.4, 1, go), VIOLET);
    dots([[BXc, 1050], [BXc, 900], [430, LA]], GREEN, sm(C - 0.3, C, u) * 0.8, sm(C - 0.3, C + 0.4, u));
    L.push(() => tag("ROAD CLEAR", 820, 1150, GREEN, sm(C - 0.1, C + 0.2, u)));
    L.push(() => mark("v", 830, 640, back(G, G + 0.3, u) * 0.5, u > G - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") {
    car(SCX, LB, RIGHT, CYAN, { brake: 0.4 }); bike(BXc, 1080, UP, VIOLET);
  }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER TRUST", "A FLASH"], RED, 320, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "flash", 2))));
  if (id === "s2") words(["HE WAVED", "YOU ON"], RED, 320, 0.0, 1, 160, flash(u, at("s2", "waved")) * 0.6);
  if (id === "s3") words(["A CAR YOU", "COULDN'T SEE"], RED, 320, 0.0, 1, 150, flash(u, at("s3", "path")) * 0.6);
  if (id === "s4") words(["A HINT, NOT A", "GREEN LIGHT"], GREEN, 320, 0.0, 1, 150, flash(u, at("s4", "hint")) * 0.6);
  if (id === "s5") words(["LOOK PAST", "THE CAR"], GREEN, 320, 0.0, 1, 160, flash(u, at("s5", "past")) * 0.6);
  if (id === "s6") words(["GO ONLY", "WHEN IT'S CLEAR"], GREEN, 320, 0.0, 1, 150, flash(u, at("s6", "clear")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(13,4,36,0.74)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["A FLASH IS", "NOT A PROMISE."], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05));
    words(["CHECK THE", "ROAD YOURSELF."], ORANGE, 930, at("s7", "check") - 0.05, 1, 150, flash(u, at("s7", "check")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(13,4,36,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(PINK, 24); x.strokeStyle = PINK; x.lineWidth = 6; x.beginPath(); x.arc(0, 0, 130, 0, Math.PI * 2); x.stroke();
    glow(CYAN, 20); x.strokeStyle = CYAN; x.setLineDash([14, 12]); x.beginPath(); x.arc(0, 0, 160, u * 2, u * 2 + 4.5); x.stroke(); x.setLineDash([]);
    x.restore();
    if (k > 0.3) bike(CX, 560, UP, VIOLET, { a: cl((k - 0.3) / 0.4) });
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["headlight-flash-neon-night"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
