// cold-tyres (Apex 10, TikTok) - PIXEL ART style (kit: ~/jarvis-admin/tmp/studio/style-kits/style-pixel-art.js):
// a retro pseudo-3D road seen from behind the bike (16-bit racing-game look), drawn at 180x320, snapped to a small
// palette with ordered dithering, scaled up with hard pixels, stepping at 10 fps. The rear tyre's colour IS its
// temperature: ice blue when cold, orange when warm, with a tyre thermometer on the right.
// Wrong: lean hard into the first bend on cold tyres, grip drains, the rear slides out.
// Right: ride gently the first minutes, smooth throttle / soft brakes / easy lean while they warm, check pressure cold.
// Time only from hf-seek.
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
const hash = (n) => { const s = Math.sin(n * 12.9898 + 4.1) * 43758.5453; return s - Math.floor(s); };

const RED = "#ff2a3a", GREEN = "#3dff8a", VIOLET = "#a596ff", ORANGE = "#ff6a1a", WHITE = "#ffffff", YELLOW = "#ffd84a", ICE = "#5ab4ff", BG = "#080622";
const CX = 510;
const cv = document.getElementById("world");
const out = cv.getContext("2d");
const SW = 180, SH = 320, TW = 360, TH = 640; // scene res (1/6) and text res (1/3)
const lo = document.createElement("canvas"); lo.width = SW; lo.height = SH;
const tx = document.createElement("canvas"); tx.width = TW; tx.height = TH;
const sc = lo.getContext("2d", { willReadFrequently: true }), tc = tx.getContext("2d", { willReadFrequently: true });
let x = sc;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const PAL = ["#0b0820", "#1e1a4a", "#2f2a6e", "#4b3fa8", "#a596ff", "#ffffff", "#ff2a3a", "#8a1020", "#3dff8a", "#137a3d", "#ff6a1a",
  "#ffd84a", "#2a3a7a", "#6b7280", "#000000", "#5ab4ff", "#3a3f55", "#c9c3ff", "#0d4a2a"]
  .map((h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)));
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function nearest(r, g, b) { let bi = 0, bd = 1e9; for (let i = 0; i < PAL.length; i++) { const p = PAL[i], d = (p[0] - r) ** 2 * 0.3 + (p[1] - g) ** 2 * 0.59 + (p[2] - b) ** 2 * 0.11; if (d < bd) { bd = d; bi = i; } } return PAL[bi]; }
function quantize(ctx, w, h, text) {
  const im = ctx.getImageData(0, 0, w, h), D = im.data;
  for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
    const i = (y * w + X) * 4;
    if (text) { if (D[i + 3] < 120) { D[i + 3] = 0; continue; } const a = D[i + 3] / 255; D[i] /= a; D[i + 1] /= a; D[i + 2] /= a; D[i + 3] = 255; }
    const o = text ? 0 : (BAYER[(y & 3) * 4 + (X & 3)] - 7.5) * 4;
    const p = nearest(D[i] + o, D[i + 1] + o, D[i + 2] + o);
    D[i] = p[0]; D[i + 1] = p[1]; D[i + 2] = p[2];
  }
  ctx.putImageData(im, 0, 0);
}
function onText(fn) { const prev = x; x = tc; x.save(); x.setTransform(TW / 1080, 0, 0, TH / 1920, 0, 0); fn(); x.restore(); x = prev; }
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], cl(k)))).join(",")})`;
}

let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  onText(() => {
    x.save(); x.textAlign = "center"; x.textBaseline = "middle";
    const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (820 / x.measureText(L).width) * 100); });
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
        x.fillStyle = "#000000"; x.fillText(p, 9, 9);
        x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.8) : color;
        x.fillText(p, 0, 0);
        x.restore();
        X += ws[i] + sp; wi++;
      });
      y += px * 1.05;
    });
    x.restore();
  });
}
let zoomM = [1, 0, 0, 1, 0, 0];
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  const P = new DOMMatrix(zoomM).transformPoint(new DOMPoint(X, Y));
  onText(() => {
    x.save(); x.globalAlpha = cl(a); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
    const w = x.measureText(txt).width + 44, s = 0.6 + 0.4 * cl(a);
    const PX = cl(P.x, 60 + w / 2, 930 - w / 2), PY = cl(P.y, 560, 1190);
    x.translate(PX, PY); x.scale(s, s);
    x.fillStyle = "#0b0820"; x.fillRect(-w / 2, -px * 0.75, w, px * 1.5);
    x.lineWidth = 9; x.strokeStyle = color; x.strokeRect(-w / 2, -px * 0.75, w, px * 1.5);
    x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
  });
}

// ---------- world ----------
const HZ = 640; // horizon
// sky, sun, hills and the pseudo-3D road. curve > 0 bends right. travel scrolls the stripes.
function world(curve, travel, frost) {
  const sky = x.createLinearGradient(0, 0, 0, HZ);
  sky.addColorStop(0, "#0b0820"); sky.addColorStop(0.55, "#2f2a6e"); sky.addColorStop(1, "#6a5ad0");
  x.fillStyle = sky; x.fillRect(0, 0, 1080, HZ);
  // low morning sun
  const sx = 230 - curve * 160;
  x.fillStyle = ORANGE; x.beginPath(); x.arc(sx, HZ - 10, 92, Math.PI, 0); x.fill();
  x.fillStyle = YELLOW; x.beginPath(); x.arc(sx, HZ - 10, 58, Math.PI, 0); x.fill();
  // hills (parallax with the bend)
  const hx = -curve * 200;
  x.fillStyle = "#1e1a4a";
  x.beginPath(); x.moveTo(-200, HZ);
  for (let i = 0; i <= 12; i++) { const X = -200 + i * 130 + hx; x.lineTo(X, HZ - 60 - 70 * hash(i + 3)); }
  x.lineTo(1300, HZ); x.closePath(); x.fill();
  x.fillStyle = "#0d4a2a"; x.fillRect(0, HZ - 6, 1080, 12);
  // ground rows
  for (let y = HZ; y < 1920; y += 6) {
    const p = (y - HZ + 3) / (1920 - HZ), z = 1 / p;
    const half = 50 + 760 * p, cxr = CX + curve * 560 * (1 - p) * (1 - p);
    const seg = Math.floor(z * 2.2 + travel) & 1;
    x.fillStyle = seg ? "#137a3d" : "#0d4a2a"; x.fillRect(0, y, 1080, 6);
    if (frost > 0) {
      const k = Math.floor(z * 5 + travel * 2.27);
      const r1 = hash(k), r2 = hash(k + 77);
      x.fillStyle = mix("#137a3d", "#c9c3ff", frost);
      if (r1 < 0.55) x.fillRect(cxr - half * 1.15 - 20 - r1 * 500, y, 10 + 40 * p, 6);
      if (r2 < 0.55) x.fillRect(cxr + half * 1.15 + 20 + r2 * 500, y, 10 + 40 * p, 6);
    }
    const rw = half * 0.13;
    x.fillStyle = seg ? RED : WHITE; x.fillRect(cxr - half - rw, y, half * 2 + rw * 2, 6);
    x.fillStyle = seg ? "#3a3f55" : "#34394e"; x.fillRect(cxr - half, y, half * 2, 6);
    if (seg) { x.fillStyle = WHITE; x.fillRect(cxr - half * 0.025, y, half * 0.05, 6); }
  }
}
// the road centre at a screen row (for placing marks on the road)
const roadX = (y, curve) => { const p = (y - HZ + 3) / (1920 - HZ); return CX + curve * 560 * (1 - p) * (1 - p); };

// motorcycle + rider seen from behind. Origin = rear tyre contact point. lean in radians (+ = right).
// tcol = tyre colour (temperature), slide = 0..1 the rear steps out to the left, brake = tail light 0..1
function bike(X, Y, s, lean, col, tcol, slide = 0, brake = 0, spin = 0) {
  x.save(); x.translate(X, Y); x.rotate(lean); x.scale(s, s);
  // shadow
  x.fillStyle = "rgba(0,0,0,0.45)"; x.beginPath(); x.ellipse(0, 6, 110, 22, 0, 0, Math.PI * 2); x.fill();
  // rear tyre (steps out on a slide)
  x.save(); x.translate(-slide * 120, 0); x.rotate(-slide * 0.35);
  x.fillStyle = "#0b0820"; rr(-46, -200, 92, 204, 40); x.fill();
  x.fillStyle = tcol; rr(-34, -188, 68, 180, 30); x.fill();
  x.fillStyle = "rgba(11,8,32,0.55)";
  for (let i = 0; i < 4; i++) { const yy = -180 + ((i * 45 + spin * 45) % 180); x.fillRect(-34, yy, 68, 14); }
  x.restore();
  // fender + tail
  x.fillStyle = "#1e1a4a"; rr(-64, -262, 128, 74, 18); x.fill();
  x.fillStyle = col; x.beginPath(); x.moveTo(-130, -340); x.lineTo(130, -340); x.lineTo(78, -256); x.lineTo(-78, -256); x.closePath(); x.fill();
  x.fillStyle = mix("#8a1020", RED, 0.35 + 0.65 * brake); rr(-58, -318, 116, 30, 10); x.fill();
  if (brake > 0.3) { x.fillStyle = `rgba(255,80,90,${0.35 * brake})`; x.beginPath(); x.arc(0, -303, 110, 0, Math.PI * 2); x.fill(); }
  x.fillStyle = YELLOW; x.fillRect(-36, -250, 72, 34);
  // exhaust
  x.fillStyle = "#6b7280"; rr(82, -272, 62, 100, 24); x.fill();
  x.fillStyle = "#0b0820"; x.beginPath(); x.arc(113, -222, 20, 0, Math.PI * 2); x.fill();
  // legs + boots
  x.fillStyle = "#2f2a6e"; rr(-168, -352, 58, 176, 24); x.fill(); rr(110, -352, 58, 176, 24); x.fill();
  x.fillStyle = "#0b0820"; rr(-176, -200, 72, 44, 14); x.fill(); rr(104, -200, 72, 44, 14); x.fill();
  // torso
  x.fillStyle = "#1e1a4a"; rr(-128, -580, 256, 262, 64); x.fill();
  x.fillStyle = col; x.fillRect(-128, -486, 256, 34);
  // arms to the bars
  x.strokeStyle = "#1e1a4a"; x.lineWidth = 56; x.lineCap = "round";
  x.beginPath(); x.moveTo(-104, -540); x.lineTo(-206, -468); x.stroke();
  x.beginPath(); x.moveTo(104, -540); x.lineTo(206, -468); x.stroke();
  // bars + mirrors
  x.strokeStyle = "#6b7280"; x.lineWidth = 20;
  x.beginPath(); x.moveTo(-250, -462); x.lineTo(250, -462); x.stroke();
  x.lineWidth = 10; x.beginPath(); x.moveTo(-236, -470); x.lineTo(-262, -540); x.moveTo(236, -470); x.lineTo(262, -540); x.stroke();
  x.fillStyle = "#c9c3ff"; x.beginPath(); x.ellipse(-266, -556, 36, 24, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(266, -556, 36, 24, 0, 0, Math.PI * 2); x.fill();
  // helmet (back of it)
  x.fillStyle = WHITE; x.beginPath(); x.arc(0, -660, 92, 0, Math.PI * 2); x.fill();
  x.fillStyle = col; x.fillRect(-16, -752, 32, 176);
  x.fillStyle = "#c9c3ff"; x.beginPath(); x.arc(0, -660, 92, 0.15 * Math.PI, 0.85 * Math.PI); x.fill();
  x.restore();
}
// tyre thermometer on the right: k = 0..1 fill, colour by temperature
function therm(X, k, a) {
  if (a <= 0) return;
  const col = mix(ICE, ORANGE, sm(0.35, 0.8, k));
  x.save(); x.globalAlpha = a;
  x.fillStyle = WHITE; rr(X - 40, 690, 80, 420, 40); x.fill();
  x.fillStyle = "#1e1a4a"; rr(X - 28, 702, 56, 400, 28); x.fill();
  const top = lerp(1060, 720, cl(k));
  x.fillStyle = col; rr(X - 18, top, 36, 1100 - top, 18); x.fill();
  x.fillStyle = WHITE; x.beginPath(); x.arc(X, 1120, 66, 0, Math.PI * 2); x.fill();
  x.fillStyle = col; x.beginPath(); x.arc(X, 1120, 52, 0, Math.PI * 2); x.fill();
  x.fillStyle = WHITE; for (let i = 0; i < 5; i++) x.fillRect(X + 40, 760 + i * 70, 30, 10);
  x.restore();
}
// grip meter: 5 bars, level 0..1
function grip(X, Y, level, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a;
  for (let i = 0; i < 5; i++) {
    const on = (i + 0.5) / 5 <= level, bh = 40 + i * 30, bx = X + (i - 2.5) * 50;
    x.fillStyle = "#0b0820"; x.fillRect(bx - 6, Y - bh - 6, 48, bh + 12);
    x.fillStyle = on ? c : "#2f2a6e"; x.fillRect(bx, Y - bh, 36, bh);
  }
  x.restore();
}
function snowflake(X, Y, s, a, c = ICE) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.strokeStyle = c; x.lineWidth = 16; x.lineCap = "square";
  for (let i = 0; i < 3; i++) { x.rotate(Math.PI / 3); x.beginPath(); x.moveTo(-70, 0); x.lineTo(70, 0); x.moveTo(40, -22); x.lineTo(54, 0); x.lineTo(40, 22); x.moveTo(-40, -22); x.lineTo(-54, 0); x.lineTo(-40, 22); x.stroke(); }
  x.restore();
}
function clock(X, Y, s, a, c, ang) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = WHITE; x.beginPath(); x.arc(0, 0, 78, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#1e1a4a"; x.beginPath(); x.arc(0, 0, 62, 0, Math.PI * 2); x.fill();
  x.fillStyle = c; x.beginPath(); x.moveTo(0, 0); x.arc(0, 0, 62, -Math.PI / 2, -Math.PI / 2 + ang); x.closePath(); x.fill();
  x.strokeStyle = WHITE; x.lineWidth = 12; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(-Math.PI / 2 + ang) * 52, Math.sin(-Math.PI / 2 + ang) * 52); x.stroke();
  x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0 || s <= 0.01) return;
  x.save(); x.globalAlpha = cl(a); x.translate(X, Y); x.scale(s, s); x.lineCap = "square";
  x.fillStyle = "#0b0820"; x.beginPath(); x.arc(0, 0, 92, 0, Math.PI * 2); x.fill();
  x.strokeStyle = color; x.lineWidth = 22;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.beginPath();
  if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); }
  else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
  x.stroke(); x.restore();
}
// side-view wheel close-up with a pressure gauge on the valve (s6)
function wheelCloseup(u, tcol, G, needle, frostK) {
  const WX = 430, WY = 900;
  // garage floor + wall
  x.fillStyle = "#1e1a4a"; x.fillRect(0, 0, 1080, 1220);
  x.fillStyle = "#2a3a7a"; for (let X = 0; X < 1080; X += 180) x.fillRect(X, 0, 12, 1220);
  x.fillStyle = "#3a3f55"; x.fillRect(0, 1200, 1080, 720);
  x.fillStyle = "rgba(0,0,0,0.5)"; x.beginPath(); x.ellipse(WX, 1205, 300, 30, 0, 0, Math.PI * 2); x.fill();
  // tyre + rim + spokes
  x.fillStyle = "#0b0820"; x.beginPath(); x.arc(WX, WY, 310, 0, Math.PI * 2); x.fill();
  x.fillStyle = tcol; x.beginPath(); x.arc(WX, WY, 292, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#0b0820"; for (let i = 0; i < 24; i++) { const an = (i / 24) * Math.PI * 2; x.save(); x.translate(WX + Math.cos(an) * 270, WY + Math.sin(an) * 270); x.rotate(an); x.fillRect(-14, -10, 28, 20); x.restore(); }
  x.fillStyle = "#2f2a6e"; x.beginPath(); x.arc(WX, WY, 222, 0, Math.PI * 2); x.fill();
  x.strokeStyle = VIOLET; x.lineWidth = 22; x.beginPath(); x.arc(WX, WY, 210, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 26; for (let i = 0; i < 5; i++) { const an = (i / 5) * Math.PI * 2 + 0.3; x.beginPath(); x.moveTo(WX + Math.cos(an) * 60, WY + Math.sin(an) * 60); x.lineTo(WX + Math.cos(an) * 200, WY + Math.sin(an) * 200); x.stroke(); }
  x.fillStyle = "#6b7280"; x.beginPath(); x.arc(WX, WY, 66, 0, Math.PI * 2); x.fill();
  // frost specks on the tyre
  if (frostK > 0) { x.fillStyle = mix(tcol, WHITE, frostK); for (let i = 0; i < 16; i++) { const an = hash(i) * Math.PI * 2; x.fillRect(WX + Math.cos(an) * 282 - 8, WY + Math.sin(an) * 282 - 8, 18, 18); } }
  // valve on the rim (upper right) and the gauge pushed onto it
  const va = -0.85, vx = WX + Math.cos(va) * 205, vy = WY + Math.sin(va) * 205;
  x.strokeStyle = "#6b7280"; x.lineWidth = 18; x.beginPath(); x.moveTo(vx, vy); x.lineTo(vx + Math.cos(va) * 60, vy + Math.sin(va) * 60); x.stroke();
  if (G > 0) {
    const ex = vx + Math.cos(va) * 60, ey = vy + Math.sin(va) * 60;
    const gx = lerp(1150, 760, G), gy = lerp(520, 600, G);
    x.strokeStyle = "#0b0820"; x.lineWidth = 26; x.beginPath(); x.moveTo(ex, ey); x.quadraticCurveTo(ex + 80, ey - 10, gx - 60, gy + 40); x.stroke();
    x.strokeStyle = "#6b7280"; x.lineWidth = 14; x.stroke();
    x.fillStyle = WHITE; x.beginPath(); x.arc(gx, gy, 112, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#0b0820"; x.beginPath(); x.arc(gx, gy, 96, 0, Math.PI * 2); x.fill();
    // dial: red low arc, green ok arc
    x.lineWidth = 22;
    x.strokeStyle = RED; x.beginPath(); x.arc(gx, gy, 74, Math.PI * 0.8, Math.PI * 1.45); x.stroke();
    x.strokeStyle = GREEN; x.beginPath(); x.arc(gx, gy, 74, Math.PI * 1.55, Math.PI * 1.95); x.stroke();
    x.strokeStyle = "#6b7280"; x.beginPath(); x.arc(gx, gy, 74, Math.PI * 2.05, Math.PI * 2.2); x.stroke();
    const na = lerp(Math.PI * 0.85, Math.PI * 1.75, needle);
    x.strokeStyle = WHITE; x.lineWidth = 12; x.beginPath(); x.moveTo(gx, gy); x.lineTo(gx + Math.cos(na) * 70, gy + Math.sin(na) * 70); x.stroke();
    x.fillStyle = WHITE; x.beginPath(); x.arc(gx, gy, 16, 0, Math.PI * 2); x.fill();
    return [gx, gy];
  }
  return null;
}
// dark skid streaks behind the sliding rear tyre
function skid(X, Y, k) {
  if (k <= 0) return;
  x.save(); x.fillStyle = "#0b0820";
  for (let i = 0; i < 10; i++) { const f = i / 10; if (f > k) break; x.fillRect(X - 30 - f * 160 - 18, Y + f * 300, 26, 34); x.fillRect(X + 10 - f * 150, Y + f * 300 + 10, 20, 30); }
  x.restore();
}

// ---------- one frame ----------
function frame(t0) {
  const t = Math.floor(t0 * 10 + 1e-6) / 10; // 10 fps steps
  const { id, u, d } = sceneOf(t);
  curU = u;
  const U = (w, n) => at(id, w, n);
  x = sc;
  tc.setTransform(1, 0, 0, 1, 0, 0); tc.clearRect(0, 0, TW, TH);
  x.setTransform(SW / 1080, 0, 0, SH / 1920, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  let shx = 0, shy = 0, dim = 0;
  if (id === "s3") { const T = U("slide"); const sh = sm(T - 0.05, T + 0.05, u) * (1 - sm(T + 0.4, T + 1.0, u)) * 26; shx = Math.sin(u * 70) * sh; shy = Math.cos(u * 53) * sh; }
  x.save(); x.translate(CX + shx, 820 + shy); x.scale(z, z); x.translate(-CX, -820);
  zoomM = [z, 0, 0, z, CX - CX * z + shx, 820 - 820 * z + shy];
  const BX = 450, BY = 1180, BS = 0.68, TX = 860;

  if (id === "s1") {
    // cold morning, frost on the grass, setting off slowly; tyre ice blue
    const go = sm(0, d, u);
    world(0.12 * go, t * 2.2 * (0.35 + 0.65 * go), 1);
    bike(BX, BY, BS, 0.02 * Math.sin(u * 3), VIOLET, ICE, 0, 0, u * 2);
    therm(TX, 0.1, sm(U("cold") - 0.1, U("cold") + 0.2, u));
    snowflake(170, 780, back(U("cold") - 0.05, U("cold") + 0.35, u) * 0.9, sm(U("cold") - 0.05, U("cold") + 0.1, u));
    tag("COLD TYRES", TX - 40, 640, ICE, sm(U("cold", 2) - 0.1, U("cold", 2) + 0.15, u), 40);
  }
  if (id === "s2") {
    // first bend straight away: hard lean on cold (blue) tyres, bike in red
    const curve = 0.5 + 0.6 * sm(0, U("bend"), u);
    world(curve, 3.2 * t, 1);
    const L = sm(U("lean") - 0.1, U("hard") + 0.25, u);
    bike(BX, BY, BS, 0.62 * L, RED, ICE, 0, 0, u * 5);
    therm(TX, 0.12, 1);
    tag("HARD LEAN", BX - 200, 760, RED, sm(U("hard") - 0.05, U("hard") + 0.2, u), 42);
    tag("1ST BEND", BX - 40, 640, ORANGE, sm(U("first") - 0.05, U("bend") + 0.1, u), 40);
    tag("COLD TYRES", TX - 40, 640, ICE, 1, 40);
  }
  if (id === "s3") {
    // grip drains, then the rear steps out and slides
    const T = U("slide");
    world(1.1, 3.2 * t, 1);
    const G = sm(U("less") - 0.1, U("grip") + 0.1, u);
    const Sl = sm(T - 0.05, T + 0.35, u);
    const lean = 0.62 + 0.1 * Sl + 0.05 * Sl * Math.sin(u * 28);
    skid(BX, BY, Sl);
    bike(BX + 40 * Sl, BY, BS, lean, RED, ICE, Sl, 0, u * 5);
    grip(TX - 20, 1150, lerp(1, 0.22, G), sm(-0.05, 0.2, u), G > 0.5 ? RED : GREEN);
    tag("GRIP", TX - 20, 700, G > 0.5 ? RED : GREEN, sm(-0.05, 0.2, u), 42);
    tag("SLIDE!", BX - 140, 1100, RED, Sl, 52);
    stamp("x", BX + 120, 760, back(T, T + 0.35, u) * 0.75, sm(T - 0.02, T + 0.08, u), RED);
  }
  if (id === "s4") {
    // gentle: straight road, upright green bike, a clock for the first few minutes, tyre starts to warm
    world(0.0, 1.6 * t, 1);
    bike(BX, BY, BS, 0.02 * Math.sin(u * 2.5), GREEN, mix(ICE, ORANGE, 0.15 * sm(0, d, u)), 0, 0, u * 2.5);
    therm(TX, lerp(0.12, 0.3, sm(0, d, u)), 1);
    const C = sm(U("first") - 0.15, U("first") + 0.1, u);
    clock(150, 800, back(U("first") - 0.15, U("first") + 0.25, u) * 0.9, C, GREEN, 0.4 + 2.4 * sm(U("first"), d, u));
    tag("FIRST MINUTES", 230, 930, GREEN, sm(U("few") - 0.1, U("minutes") + 0.1, u), 40);
    tag("GENTLE", BX + 60, 600, GREEN, sm(U("gently") - 0.1, U("gently") + 0.15, u), 42);
  }
  if (id === "s5") {
    // smooth throttle -> soft brake (tail light) -> easy lean into a mild bend; the tyre warms from blue to orange
    const E = sm(U("easy") - 0.2, U("lean") + 0.2, u);
    world(0.45 * E, 1.9 * t, 1 - 0.6 * sm(U("warm") - 0.3, d, u));
    const W2 = sm(0.2, d, u);
    const brake = sm(U("soft") - 0.05, U("soft") + 0.1, u) * (1 - sm(U("and") - 0.05, U("and") + 0.15, u));
    bike(BX, BY, BS, 0.22 * E, GREEN, mix(ICE, ORANGE, sm(0.15, 1.0, W2)), 0, brake, u * 3);
    // smooth throttle: soft exhaust puffs
    const Th = sm(0, 0.15, u) * (1 - sm(U("soft") - 0.15, U("soft"), u));
    if (Th > 0) { x.save(); x.fillStyle = `rgba(201,195,255,${0.7 * Th})`; for (let i = 0; i < 3; i++) { const f = ((u * 1.2 + i / 3) % 1); x.beginPath(); x.arc(BX + 85 + f * 80, BY - 150 + f * 60, 20 + f * 26, 0, Math.PI * 2); x.fill(); } x.restore(); }
    therm(TX, lerp(0.3, 0.88, W2), 1);
    tag("WARMING UP", TX - 60, 640, u > U("warm") - 0.1 ? ORANGE : ICE, sm(U("while") - 0.1, U("while") + 0.15, u), 40);
  }
  if (id === "s6") {
    // close-up: pressure gauge on the valve, needle into green; the tyre is still cold (blue, frosty)
    const G = back(U("check") - 0.1, U("tyre") + 0.25, u);
    const N = sm(U("pressure") - 0.05, U("before") + 0.15, u);
    const Fk = sm(U("cold") - 0.25, U("cold") + 0.1, u);
    const g = wheelCloseup(u, ICE, cl(G, 0, 1.1), N, 0.3 + 0.6 * Fk);
    if (g) tag(N > 0.8 ? "OK" : "PSI", g[0], g[1] + 160, N > 0.8 ? GREEN : VIOLET, sm(U("pressure") - 0.1, U("pressure") + 0.1, u), 44);
    snowflake(170, 640, back(U("cold") - 0.2, U("cold") + 0.2, u) * 0.75, Fk);
    tag("STILL COLD", 430, 900, ICE, sm(U("still") - 0.1, U("cold") + 0.1, u), 44);
  }
  if (id === "s7" || id === "s8") {
    world(0.0, 1.6 * t, 0.3);
    bike(BX, BY, BS, 0.02 * Math.sin(u * 2), GREEN, ORANGE, 0, 0, u * 2.5);
    therm(TX, 0.88, 1);
    dim = id === "s7" ? 0.7 : 0.78;
  }
  x.restore();
  zoomM = [1, 0, 0, 1, 0, 0];
  if (dim > 0) { x.fillStyle = `rgba(8,6,34,${dim})`; x.fillRect(0, 0, 1080, 1920); }

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER PUSH ON", "COLD TYRES"], RED, 360, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, U("never")), flash(u, U("cold", 2))));
  if (id === "s2") words(["HARD LEAN", "ON COLD TYRES"], RED, 360, 0.0, 1, 150, flash(u, U("lean")) * 0.6);
  if (id === "s3") {
    const sw = U("rear") - 0.12;
    words(["LESS GRIP"], RED, 360, 0.0, 1 - sm(sw - 0.08, sw, u), 160, flash(u, U("grip")) * 0.6);
    words(["THE REAR", "SLIDES OUT"], RED, 360, sw, sm(sw - 0.05, sw, u), 150, flash(u, U("slide")) * 0.7);
  }
  if (id === "s4") words(["RIDE GENTLY", "AT FIRST"], GREEN, 360, 0.0, 1, 150, flash(u, U("gently")) * 0.6);
  if (id === "s5") {
    const s1 = U("soft") - 0.12, s2 = U("easy") - 0.12;
    words(["SMOOTH", "THROTTLE"], GREEN, 360, 0.0, 1 - sm(s1 - 0.08, s1, u), 150, flash(u, U("smooth")) * 0.5);
    words(["SOFT", "BRAKING"], GREEN, 360, s1, sm(s1 - 0.05, s1, u) * (1 - sm(s2 - 0.08, s2, u)), 150, flash(u, U("soft")) * 0.5);
    words(["EASY LEAN"], GREEN, 360, s2, sm(s2 - 0.05, s2, u), 160, flash(u, U("lean")) * 0.5);
  }
  if (id === "s6") {
    const sw = U("while") - 0.12;
    words(["CHECK", "PRESSURE"], VIOLET, 360, 0.0, 1 - sm(sw - 0.08, sw, u), 150, flash(u, U("pressure")) * 0.5);
    words(["WHILE STILL", "COLD"], GREEN, 360, sw, sm(sw - 0.05, sw, u), 150, flash(u, U("cold")) * 0.6);
  }
  if (id === "s7") {
    const sw = U("let") - 0.12;
    words(["COLD TYRES,", "EASY RIDE"], ORANGE, 820, 0.0, 1 - sm(sw - 0.08, sw, u), 160, flash(u, 0.05));
    words(["LET THEM", "WARM UP FIRST"], ORANGE, 820, sw, sm(sw - 0.05, sw, u), 150, flash(u, U("warm")));
  }
  if (id === "s8") {
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(Math.max(0.01, k), Math.max(0.01, k));
    // a pixel wheel badge
    x.fillStyle = "#0b0820"; x.beginPath(); x.arc(0, 0, 170, 0, Math.PI * 2); x.fill();
    x.fillStyle = ORANGE; x.beginPath(); x.arc(0, 0, 150, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#1e1a4a"; x.beginPath(); x.arc(0, 0, 100, 0, Math.PI * 2); x.fill();
    x.strokeStyle = VIOLET; x.lineWidth = 22; for (let i = 0; i < 5; i++) { const an = (i / 5) * Math.PI * 2 + u * 2; x.beginPath(); x.moveTo(Math.cos(an) * 30, Math.sin(an) * 30); x.lineTo(Math.cos(an) * 96, Math.sin(an) * 96); x.stroke(); }
    x.strokeStyle = GREEN; x.lineWidth = 16; x.beginPath(); x.arc(0, 0, 205, u * 2.5, u * 2.5 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 820, 0.15, 1, 130);
    words([c2], ORANGE, 960, 0.3, 1, 150, flash(u, U("apex")) * 0.5);
    tag("3 FREE RIDES A MONTH", CX, 1085, GREEN, sm(U("three") - 0.05, U("three") + 0.2, u), 46);
    if (BRAND.sub) tag(BRAND.sub, CX, 1185, VIOLET, sm(U("free") - 0.05, U("free") + 0.2, u), 46);
  }
  quantize(sc, SW, SH, false);
  quantize(tc, TW, TH, true);
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.imageSmoothingEnabled = false;
  out.clearRect(0, 0, 1080, 1920);
  out.drawImage(lo, 0, 0, 1080, 1920);
  out.drawImage(tx, 0, 0, 1080, 1920);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["cold-tyres-pixel"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
