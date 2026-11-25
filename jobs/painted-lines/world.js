// painted-lines (Apex 23, TikTok) - RAIN TOP-DOWN style: a bird's-eye view of a wet night street, rain streaks and
// ripples, glossy asphalt, a zebra crossing and a metal cover, a motorcycle seen from above. Wrong: the rider brakes
// on the white stripes, the wet paint is slick and the front tyre slides. Right: brake before the lines on bare road,
// cross paint and covers upright and straight, stop with the tyres between the stripes. Time only from hf-seek.
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
const RED = "#ff3b4e", GREEN = "#2fe07a", VIOLET = "#8b6cff", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#0b0e16";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };

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
      x.shadowColor = rgba(color.startsWith("#") ? color : "#ffffff", 0.6); x.shadowBlur = 24;
      x.lineWidth = Math.max(12, px * 0.16); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.shadowBlur = 0;
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1200);
  x.translate(X, Y); x.scale(s, s);
  x.shadowColor = color; x.shadowBlur = 30; x.fillStyle = color; rr(-w / 2, -h / 2, w, h, h / 2); x.fill(); x.shadowBlur = 0;
  x.strokeStyle = "rgba(255,255,255,0.55)"; x.lineWidth = 3; rr(-w / 2, -h / 2, w, h, h / 2); x.stroke();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1200);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.shadowColor = c; x.shadowBlur = 40; x.fillStyle = c; x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
  x.strokeStyle = WHITE; x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- the wet street from above ----------
const RL = 150, RR = 930;          // road edges
const ZY = 700, ZH = 240;          // zebra crossing (world y, top) and bar length along travel
const STOP = 1010;                 // stop line (world y)
const BAR = 70, PER = 130;         // bar width and period: a gap is centred on x=540, bars centred on 540 +- 65 + k*130
const barXs = []; for (let k = -3; k <= 2; k++) barXs.push(540 + 65 + k * PER);
const COVER = [540, 470];          // metal cover (world y)
function street(t, off, o = {}) {
  const { hotPaint = 0, greenZone = 0, gapGlow = 0 } = o;
  // pavement + kerbs
  x.fillStyle = "#151a24"; x.fillRect(-200, -200, 1480, 2400);
  x.fillStyle = "#1d2330"; for (let i = 0; i < 14; i++) { const y = ((i * 170 + off) % 2380) - 230; x.fillRect(20, y, 110, 160); x.fillRect(950, y, 110, 160); }
  // asphalt with a wet sheen
  const g = x.createLinearGradient(RL, 0, RR, 0);
  g.addColorStop(0, "#202634"); g.addColorStop(0.45, "#2a3344"); g.addColorStop(0.55, "#2c3548"); g.addColorStop(1, "#1e2431");
  x.fillStyle = g; x.fillRect(RL, -200, RR - RL, 2400);
  x.fillStyle = "#e9edf5"; x.fillRect(RL - 10, -200, 10, 2400); x.fillRect(RR, -200, 10, 2400);
  // streetlight reflections smeared on the wet road
  for (let i = 0; i < 4; i++) {
    const ly = ((i * 560 + off * 1.0) % 2240) - 200, lx = i % 2 ? 260 : 820;
    const rg = x.createRadialGradient(lx, ly, 10, lx, ly, 260); rg.addColorStop(0, "rgba(255,196,120,0.30)"); rg.addColorStop(1, "rgba(255,196,120,0)");
    x.fillStyle = rg; x.beginPath(); x.ellipse(lx, ly, 120, 300, 0, 0, Math.PI * 2); x.fill();
  }
  // green braking zone on bare road, before the stop line
  if (greenZone > 0) {
    x.save(); x.globalAlpha = greenZone;
    const zy0 = STOP + off + 30, zh = 330;
    x.fillStyle = rgba(GREEN, 0.22); x.fillRect(380, zy0, 320, zh);
    x.strokeStyle = GREEN; x.lineWidth = 6; x.setLineDash([26, 18]); x.strokeRect(380, zy0, 320, zh); x.setLineDash([]);
    x.restore();
  }
  // stop line + zebra bars
  x.fillStyle = "#f2f4f8"; x.fillRect(RL, STOP + off, RR - RL, 26);
  for (const bx of barXs) {
    const y0 = ZY + off;
    x.fillStyle = hotPaint > 0 ? mix("#f2f4f8", RED, hotPaint * 0.75) : "#f2f4f8";
    if (hotPaint > 0) { x.shadowColor = RED; x.shadowBlur = 30 * hotPaint; }
    rr(bx - BAR / 2, y0, BAR, ZH, 6); x.fill(); x.shadowBlur = 0;
    x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(bx - BAR / 2 + 8, y0 + 10, 12, ZH - 20);   // gloss on the paint
  }
  if (gapGlow > 0) { x.save(); x.globalAlpha = gapGlow; x.fillStyle = rgba(GREEN, 0.35); x.shadowColor = GREEN; x.shadowBlur = 30; x.fillRect(540 - 28, ZY + off, 56, ZH); x.restore(); }
  // metal cover
  const cy = COVER[1] + off;
  x.fillStyle = "#59606d"; x.beginPath(); x.arc(COVER[0], cy, 78, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "#8b93a1"; x.lineWidth = 5; for (let r = 20; r <= 70; r += 16) { x.beginPath(); x.arc(COVER[0], cy, r, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = "rgba(255,255,255,0.25)"; x.beginPath(); x.ellipse(COVER[0] - 25, cy - 25, 30, 14, -0.6, 0, Math.PI * 2); x.fill();
}
function rain(t) {
  x.save(); x.lineCap = "round";
  for (let i = 0; i < 70; i++) {
    const X = (i * 137.3) % 1080, Y = ((t * 2100 + i * 311) % 2300) - 200;
    x.strokeStyle = `rgba(190,215,255,${0.18 + 0.2 * ((i * 7) % 3) / 2})`; x.lineWidth = 2 + (i % 3);
    x.beginPath(); x.moveTo(X, Y); x.lineTo(X - 10, Y + 60); x.stroke();
  }
  for (let i = 0; i < 26; i++) {              // ripples on the road
    const k = (t * 1.6 + i * 0.37) % 1, X = RL + 30 + ((i * 263) % (RR - RL - 60)), Y = 300 + ((i * 419) % 1300);
    x.strokeStyle = `rgba(200,220,255,${0.45 * (1 - k)})`; x.lineWidth = 2;
    x.beginPath(); x.ellipse(X, Y, 8 + 40 * k, 4 + 18 * k, 0, 0, Math.PI * 2); x.stroke();
  }
  x.restore();
}
// motorcycle from above. (bx,by) = centre, rot = heading (0 = up), steer = bars, brake = tail light, slide = red front
function bike(bx, by, rot, c, o = {}) {
  const { steer = 0, brake = 0, slide = 0, light = 1 } = o;
  x.save(); x.translate(bx, by); x.rotate(rot);
  // headlight beam on the wet road
  if (light > 0) { const lg = x.createLinearGradient(0, -170, 0, -560); lg.addColorStop(0, "rgba(255,240,190,0.45)"); lg.addColorStop(1, "rgba(255,240,190,0)");
    x.fillStyle = lg; x.beginPath(); x.moveTo(-22, -170); x.lineTo(22, -170); x.lineTo(150, -560); x.lineTo(-150, -560); x.closePath(); x.fill(); }
  // shadow
  x.fillStyle = "rgba(0,0,0,0.45)"; x.beginPath(); x.ellipse(12, 14, 80, 200, 0, 0, Math.PI * 2); x.fill();
  // rear tyre
  x.fillStyle = "#0c0c10"; rr(-24, 60, 48, 118, 20); x.fill();
  // front tyre (turns with the bars)
  x.save(); x.translate(0, -118); x.rotate(steer);
  x.fillStyle = slide > 0 ? mix("#0c0c10", RED, slide) : "#0c0c10"; if (slide > 0) { x.shadowColor = RED; x.shadowBlur = 40 * slide; }
  rr(-20, -55, 40, 108, 18); x.fill(); x.shadowBlur = 0;
  x.strokeStyle = "#cfd5e0"; x.lineWidth = 10; x.lineCap = "round"; x.beginPath(); x.moveTo(-112, 22); x.lineTo(112, 22); x.stroke();  // bars
  x.restore();
  // body + tank + seat
  x.fillStyle = c; rr(-44, -110, 88, 200, 40); x.fill();
  x.fillStyle = "rgba(255,255,255,0.28)"; rr(-30, -100, 22, 120, 10); x.fill();
  x.fillStyle = "#14151c"; rr(-34, 10, 68, 90, 24); x.fill();
  // tail light
  x.fillStyle = brake > 0 ? "#ff2a3a" : "#7a1820"; if (brake > 0) { x.shadowColor = "#ff2a3a"; x.shadowBlur = 50 * brake; }
  rr(-26, 168, 52, 16, 6); x.fill(); x.shadowBlur = 0;
  if (brake > 0) { const bg = x.createRadialGradient(0, 200, 4, 0, 200, 140); bg.addColorStop(0, `rgba(255,40,60,${0.5 * brake})`); bg.addColorStop(1, "rgba(255,40,60,0)"); x.fillStyle = bg; x.beginPath(); x.arc(0, 200, 140, 0, Math.PI * 2); x.fill(); }
  // rider: shoulders, arms to the grips, helmet
  x.fillStyle = "#2c3446"; x.beginPath(); x.ellipse(0, 0, 78, 44, 0, 0, Math.PI * 2); x.fill();
  x.strokeStyle = "#2c3446"; x.lineWidth = 26; x.lineCap = "round";
  const gy = -96 + Math.sin(steer) * 0;
  for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 62, -6); x.lineTo(s * 92, -50); x.lineTo(s * 100 * Math.cos(steer) , gy + s * 100 * Math.sin(steer)); x.stroke(); }
  x.fillStyle = "#111318"; x.beginPath(); x.arc(0, -22, 44, 0, Math.PI * 2); x.fill();
  x.fillStyle = c; x.beginPath(); x.arc(0, -22, 44, Math.PI * 1.1, Math.PI * 1.9); x.lineTo(0, -22); x.closePath(); x.fill();
  x.fillStyle = "rgba(255,255,255,0.3)"; x.beginPath(); x.ellipse(-14, -40, 14, 8, -0.5, 0, Math.PI * 2); x.fill();
  x.restore();
}
function skid(x0, y0, x1, y1, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = rgba(RED, 0.8); x.lineWidth = 16; x.lineCap = "round"; x.shadowColor = RED; x.shadowBlur = 20;
  x.beginPath(); x.moveTo(x0, y0); x.quadraticCurveTo((x0 + x1) / 2 + 30, (y0 + y1) / 2, x1, y1); x.stroke(); x.restore();
}
function arrow(X, y0, y1, c, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 14; x.shadowColor = c; x.shadowBlur = 24; x.lineCap = "round";
  x.setLineDash([30, 22]); x.beginPath(); x.moveTo(X, y0); x.lineTo(X, y1 + 40); x.stroke(); x.setLineDash([]);
  x.beginPath(); x.moveTo(X, y1); x.lineTo(X - 34, y1 + 50); x.lineTo(X + 34, y1 + 50); x.closePath(); x.fill(); x.restore();
}

const WRONG_X = barXs[3];   // 605: a bar centre
const FRONT = 118 + 55;     // centre to front of the front tyre

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  const L = [];

  if (id === "s1") {
    // rolling toward the crossing: the street scrolls down under the bike
    const Pa = at("s1", "painted"), R0 = at("s1", "rain");
    const off = -380 + 300 * sm(-0.1, d, u);
    street(t, off, { hotPaint: sm(Pa - 0.1, Pa + 0.25, u) });
    bike(WRONG_X, 1180, 0, RED);
    rain(t);
    L.push(() => tag("WET ROAD", 280, 1180, "#3d7bd8", sm(R0 - 0.1, R0 + 0.25, u)));
    L.push(() => tag("PAINTED LINES", 700, 600, RED, sm(Pa - 0.1, Pa + 0.25, u)));
  }
  if (id === "s2") {
    // brakes and stops with the front tyre on a white bar
    const Cr = at("s2", "crossing"), Wh = at("s2", "white");
    const k = sm(0, Wh, u);
    const by = lerp(1260, ZY + 120 + FRONT - 30, 1 - Math.pow(1 - k, 2));
    street(t, 0, { hotPaint: sm(Wh - 0.1, Wh + 0.2, u) });
    bike(WRONG_X, by, 0, RED, { brake: sm(0.1, 0.4, u) });
    rain(t);
    L.push(() => tag("HARD BRAKE", 260, 1180, RED, sm(Cr - 0.1, Cr + 0.2, u)));
    L.push(() => tag("ON THE STRIPES", 640, 580, RED, sm(Wh - 0.1, Wh + 0.2, u)));
  }
  if (id === "s3") {
    // the front washes out on the slick paint
    const Sl = at("s3", "slick"), Fr = at("s3", "front"), Sd = at("s3", "slides");
    const sl = sm(Fr - 0.2, Sd + 0.3, u);
    street(t, 0, { hotPaint: 0.6 + 0.4 * Math.sin(u * 8) * 0.5 });
    const by0 = ZY + 120 + FRONT - 30;
    skid(WRONG_X, by0 - 118, WRONG_X + 150 * sl, by0 - 118 + 60 * sl, sl);
    bike(WRONG_X + 90 * sl, by0 + 40 * sl, 0.55 * sl, RED, { brake: 1, slide: sm(Fr - 0.1, Fr + 0.2, u), steer: -0.5 * sl });
    rain(t);
    L.push(() => tag("SLICK PAINT", 300, 560, RED, sm(Sl - 0.1, Sl + 0.2, u)));
    L.push(() => tag("FRONT SLIDES", 680, 1180, RED, sm(Sd - 0.1, Sd + 0.2, u)));
    L.push(() => mark("x", 230, 900, back(Sd + 0.1, Sd + 0.4, u) * 0.55, u > Sd ? 1 : 0, RED));
  }
  if (id === "s4") {
    // brake in the green zone on bare road, stop before the stop line
    const Br = at("s4", "braking"), Ba = at("s4", "bare");
    const k = sm(0.1, Ba + 0.2, u);
    const by = lerp(1560, STOP + 30 + FRONT, 1 - Math.pow(1 - k, 2));
    street(t, 0, { greenZone: sm(Br - 0.2, Br + 0.1, u) });
    bike(540, by, 0, VIOLET, { brake: sm(Br - 0.1, Br + 0.2, u) });
    rain(t);
    L.push(() => tag("BRAKE HERE", 760, 1120, GREEN, sm(Br - 0.1, Br + 0.2, u)));
    L.push(() => tag("BEFORE THE LINES", 540, 600, VIOLET, sm(at("s4", "before") - 0.1, at("s4", "before") + 0.2, u)));
  }
  if (id === "s5") {
    // cross the cover and the paint dead straight: the street scrolls under an upright bike
    const Up = at("s5", "upright"), St = at("s5", "straight");
    const off = lerp(200, 1250, sm(0, d, u));
    street(t, off, {});
    arrow(540, 1400, 560, GREEN, sm(St - 0.2, St + 0.1, u));
    bike(540, 1020, 0, VIOLET);
    rain(t);
    L.push(() => tag("UPRIGHT", 260, 640, GREEN, sm(Up - 0.1, Up + 0.2, u)));
    L.push(() => tag("BIKE STRAIGHT", 700, 1180, VIOLET, sm(St - 0.1, St + 0.2, u)));
  }
  if (id === "s6") {
    // stop with the tyres in the gap between two bars
    const Be = at("s6", "between"), No = at("s6", "not");
    const k = sm(0, Be, u);
    const by = lerp(1300, ZY + 60 + FRONT, 1 - Math.pow(1 - k, 2));
    street(t, 0, { gapGlow: sm(Be - 0.15, Be + 0.15, u) });
    bike(540, by, 0, VIOLET, { brake: sm(0.1, 0.4, u) * (1 - sm(Be + 0.4, Be + 0.8, u)) });
    rain(t);
    L.push(() => tag("BETWEEN STRIPES", 540, 580, GREEN, sm(Be - 0.1, Be + 0.2, u)));
    L.push(() => mark("v", 840, 1000, back(No, No + 0.3, u) * 0.5, u > No - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") { street(t, 0, { gapGlow: 0.6 }); bike(540, ZY + 60 + FRONT, 0, VIOLET); rain(t); }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER BRAKE", "ON WET PAINT"], RED, 330, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "painted"))));
  if (id === "s2") words(["BRAKING ON", "THE STRIPES"], RED, 330, 0.0, 1, 160, flash(u, at("s2", "stripes")) * 0.6);
  if (id === "s3") words(["THE FRONT", "SLIDES"], RED, 330, 0.0, 1, 170, flash(u, at("s3", "slides")) * 0.6);
  if (id === "s4") words(["BRAKE BEFORE", "THE LINES"], GREEN, 330, 0.0, 1, 160, flash(u, at("s4", "before")) * 0.6);
  if (id === "s5") words(["CROSS IT", "UPRIGHT"], GREEN, 330, 0.0, 1, 170, flash(u, at("s5", "upright")) * 0.6);
  if (id === "s6") words(["TYRES BETWEEN", "THE STRIPES"], GREEN, 330, 0.0, 1, 150, flash(u, at("s6", "between")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,10,18,0.66)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["WET PAINT", "IS SLIPPERY."], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05));
    words(["BRAKE ON", "BARE ROAD."], ORANGE, 930, at("s7", "brake") - 0.05, 1, 170, flash(u, at("s7", "brake")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,10,18,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    const rg = x.createRadialGradient(0, 0, 10, 0, 0, 170); rg.addColorStop(0, rgba(VIOLET, 0.9)); rg.addColorStop(1, rgba(VIOLET, 0));
    x.fillStyle = rg; x.beginPath(); x.arc(0, 0, 170, 0, Math.PI * 2); x.fill();
    x.restore();
    x.save(); x.translate(CX, 560); x.scale(k * 0.55, k * 0.55); bike(0, 0, 0, VIOLET, { light: 0 }); x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["painted-lines-rain-topdown"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
