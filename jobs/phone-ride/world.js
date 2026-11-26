// phone-ride (Apex 32, TikTok) - PHONE UI style: rider POV down a road, a phone on a handlebar mount. Wrong: a message
// pops up, the rider looks down (the phone fills the view: chat, keyboard, a thumb typing), two seconds blind, looks up
// and the car ahead has stopped. Right: route + music set while parked, messages wait (snoozed), voice only, and to use
// the phone: pull over, stop, then pick it up. Time only from hf-seek.
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
const RED = "#ff4d5e", GREEN = "#3dffa0", VIOLET = "#a98bff", ORANGE = "#ffa733", WHITE = "#f2f6ff", INK = "#0b0a14";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], cl(k))).toString(16).padStart(2, "0")).join(""); }
function rr(c, X, Y, w, h, r, keep = false) { if (!keep) c.beginPath(); c.moveTo(X + r, Y); c.arcTo(X + w, Y, X + w, Y + h, r); c.arcTo(X + w, Y + h, X, Y + h, r); c.arcTo(X, Y + h, X, Y, r); c.arcTo(X, Y, X + w, Y, r); c.closePath(); }

// ---------- text ----------
let curU = 0;
function words(lines, color, cy, t0, a = 1, maxPx = 150, flashK = 0) {
  if (a <= 0) return;
  x.save(); x.textAlign = "center"; x.textBaseline = "middle"; x.lineJoin = "round";
  const sizes = lines.map((L) => { x.font = FONT(100); return Math.min(maxPx, (830 / x.measureText(L).width) * 100); });
  const tot = sizes.reduce((s, q) => s + q * 1.06, 0);
  let y = cy - tot / 2, wi = 0;
  lines.forEach((L, li) => {
    const px = sizes[li]; x.font = FONT(px);
    const parts = L.split(" "), sp = x.measureText(" ").width;
    const ws = parts.map((q) => x.measureText(q).width), full = ws.reduce((s, w) => s + w, 0) + sp * (parts.length - 1);
    let X = CX - full / 2; const Y = y + px * 0.53;
    parts.forEach((q, i) => {
      const s0 = t0 + wi * 0.07, kk = back(s0, s0 + 0.3, curU), o = sm(s0, s0 + 0.1, curU);
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - kk) * 30); x.scale(0.5 + 0.5 * kk, 0.5 + 0.5 * kk); x.globalAlpha = a * o;
      x.lineWidth = Math.max(12, px * 0.16); x.strokeStyle = INK; x.strokeText(q, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.6) : color; x.fillText(q, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
const TY = 600;
function tag(txt, X, Y, color, a, px = 46) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1360);
  x.translate(X, Y); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  rr(x, -w / 2, -h / 2, w, h, 18); x.fillStyle = "rgba(11,10,20,0.92)"; x.fill();
  x.strokeStyle = color; x.lineWidth = 5; x.stroke();
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.fillStyle = INK; x.fill();
  x.strokeStyle = c; x.lineWidth = 12; x.stroke();
  x.lineWidth = 20; x.lineCap = "round"; x.beginPath();
  if (kind === "x") { x.moveTo(-30, -30); x.lineTo(30, 30); x.moveTo(30, -30); x.lineTo(-30, 30); } else { x.moveTo(-34, 4); x.lineTo(-10, 28); x.lineTo(36, -24); }
  x.stroke();
  x.restore();
}

// ---------- the road ahead (rider POV) ----------
const HY = 640;
const RW = 620;
const sy = (z) => HY + 1140 / z;
const sx = (wx, y, rx) => 540 + (wx - rx) * (y - HY) / 1140;

function sky() {
  const g = x.createLinearGradient(0, 0, 0, HY);
  g.addColorStop(0, "#1d2a5e"); g.addColorStop(0.7, "#4a5aa8"); g.addColorStop(1, "#8fa6e0");
  x.fillStyle = g; x.fillRect(0, 0, 1080, HY + 2);
  x.beginPath(); x.moveTo(0, HY);
  for (let X = 0; X <= 1080; X += 40) x.lineTo(X, HY - 30 - 40 * Math.abs(Math.sin(X * 0.006 + 0.7)));
  x.lineTo(1080, HY); x.closePath(); x.fillStyle = "#2c3366"; x.fill();
}
function road(dist, rx) {
  x.fillStyle = "#2f4a35"; x.fillRect(0, HY, 1080, 1920 - HY);
  x.beginPath(); x.moveTo(sx(-RW, HY, rx), HY); x.lineTo(sx(RW, HY, rx), HY); x.lineTo(sx(RW, 1920, rx), 1920); x.lineTo(sx(-RW, 1920, rx), 1920); x.closePath();
  x.fillStyle = "#4a4652"; x.fill();
  for (const s of [-1, 1]) {
    x.beginPath(); x.moveTo(sx(s * (RW - 30), HY + 2, rx), HY + 2); x.lineTo(sx(s * (RW - 30), 1920, rx), 1920);
    x.strokeStyle = "#d9dce6"; x.lineWidth = 12; x.stroke();
  }
  for (let k = 0; k < 14; k++) {
    const z0 = 0.8 + k * 3 - (dist % 3);
    if (z0 < 0.6) continue;
    const y0 = sy(z0 + 1.4), y1 = sy(z0);
    const w0 = 14 * (y0 - HY) / 1140 * 2, w1 = 14 * (y1 - HY) / 1140 * 2;
    x.beginPath(); x.moveTo(sx(0, y0, rx) - w0, y0); x.lineTo(sx(0, y0, rx) + w0, y0); x.lineTo(sx(0, y1, rx) + w1, y1); x.lineTo(sx(0, y1, rx) - w1, y1); x.closePath();
    x.fillStyle = "#f2d34a"; x.fill();
  }
  for (let k = 0; k < 8; k++) {
    const z = 1.1 + k * 5 - (dist % 5);
    if (z < 0.9) continue;
    const y = sy(z), s = (y - HY) / 1140;
    for (const sd of [-1, 1]) {
      const X = sx(sd * (RW + 110), y, rx);
      x.fillStyle = "#e6e6ea"; x.fillRect(X - 9 * s, y - 230 * s, 18 * s, 230 * s);
      x.fillStyle = sd < 0 ? "#ffb347" : "#ff4d5e"; x.fillRect(X - 9 * s, y - 210 * s, 18 * s, 34 * s);
    }
  }
}
// rear of the car ahead, sitting on the road at depth z
function car(wx, z, rx, brake) {
  const y = sy(z), s = (y - HY) / 1140, X = sx(wx, y, rx);
  const w = 200 * s, h = 300 * s;
  x.save();
  x.fillStyle = "rgba(0,0,0,0.35)"; x.beginPath(); x.ellipse(X, y, w * 1.1, 18 * s, 0, 0, Math.PI * 2); x.fill();
  // wheels
  x.fillStyle = "#111"; x.fillRect(X - w * 0.92, y - 50 * s, 46 * s, 50 * s); x.fillRect(X + w * 0.92 - 46 * s, y - 50 * s, 46 * s, 50 * s);
  // body + cabin
  rr(x, X - w, y - h * 0.62, w * 2, h * 0.5, 22 * s); x.fillStyle = "#3a6fd8"; x.fill();
  x.beginPath(); x.moveTo(X - w * 0.78, y - h * 0.6); x.lineTo(X - w * 0.6, y - h); x.lineTo(X + w * 0.6, y - h); x.lineTo(X + w * 0.78, y - h * 0.6); x.closePath(); x.fillStyle = "#2c56ad"; x.fill();
  x.beginPath(); x.moveTo(X - w * 0.66, y - h * 0.64); x.lineTo(X - w * 0.54, y - h * 0.94); x.lineTo(X + w * 0.54, y - h * 0.94); x.lineTo(X + w * 0.66, y - h * 0.64); x.closePath(); x.fillStyle = "#16203c"; x.fill();
  // plate
  x.fillStyle = "#e9e9ef"; x.fillRect(X - 44 * s, y - h * 0.3, 88 * s, 26 * s);
  // tail lights (brake glow)
  for (const sd of [-1, 1]) {
    const LX = X + sd * w * 0.78;
    if (brake > 0) {
      const g = x.createRadialGradient(LX, y - h * 0.45, 2, LX, y - h * 0.45, 120 * s * (1 + brake));
      g.addColorStop(0, `rgba(255,60,70,${0.9 * brake})`); g.addColorStop(1, "rgba(255,60,70,0)");
      x.fillStyle = g; x.fillRect(LX - 260 * s, y - h * 0.45 - 260 * s, 520 * s, 520 * s);
    }
    rr(x, LX - 26 * s, y - h * 0.52, 52 * s, 30 * s, 6 * s); x.fillStyle = brake > 0 ? mix("#8a1d26", "#ff5a66", brake) : "#8a1d26"; x.fill();
  }
  x.restore();
  return { X, y: y - h * 0.5, w, h };
}
function ring(p, c, a, t) {
  if (!p || a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = c; x.lineWidth = 9;
  x.beginPath(); x.ellipse(p.X, p.y, p.w * 1.5 + 8 * Math.sin(t * 9), p.h * 0.75 + 6 * Math.sin(t * 9), 0, 0, Math.PI * 2); x.stroke();
  x.restore();
}
function parkSign(rx, a) {
  if (a <= 0) return;
  const y = sy(2.4), s = (y - HY) / 1140, X = sx(RW + 260, y, rx);
  x.save(); x.globalAlpha = cl(a);
  x.fillStyle = "#bfc3cf"; x.fillRect(X - 7, y - 560 * s, 14, 560 * s);
  rr(x, X - 110 * s, y - 800 * s, 220 * s, 240 * s, 22 * s); x.fillStyle = "#1f5fd6"; x.fill(); x.strokeStyle = WHITE; x.lineWidth = 8 * s; x.stroke();
  x.font = FONT(190 * s); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = WHITE; x.fillText("P", X, y - 676 * s);
  x.restore();
}
function cockpit(t, moving) {
  const sh = moving ? Math.sin(t * 23) * 1.5 : 0;
  x.save(); x.translate(0, sh);
  x.fillStyle = "#121119";
  x.beginPath(); x.moveTo(60, 1920); x.lineTo(60, 1640); x.quadraticCurveTo(300, 1470, 430, 1490); x.lineTo(650, 1490); x.quadraticCurveTo(780, 1470, 1020, 1640); x.lineTo(1020, 1920); x.closePath(); x.fill();
  x.strokeStyle = "#2b2936"; x.lineWidth = 30; x.lineCap = "round";
  x.beginPath(); x.moveTo(90, 1560); x.lineTo(420, 1505); x.moveTo(660, 1505); x.lineTo(990, 1560); x.stroke();
  x.fillStyle = "#26232f"; rr(x, 40, 1515, 130, 76, 30); x.fill(); rr(x, 910, 1515, 130, 76, 30); x.fill();
  x.beginPath(); x.arc(540, 1580, 70, 0, Math.PI * 2); x.fillStyle = "#07070c"; x.fill();
  x.strokeStyle = "rgba(95,243,255,0.8)"; x.lineWidth = 6; x.stroke();
  x.restore();
}

// ---------- the phone ----------
// local coords: body 240 x 420, screen 216 x 392 centred at 0,0
const PW = 240, PH = 420, SW_ = 216, SH_ = 392;
const KEYS = [10, 9, 7];
function keyPos(i) { // i over 26 keys -> local centre
  let r = 0, n = i; while (r < 2 && n >= KEYS[r]) { n -= KEYS[r]; r++; }
  const kw = SW_ / 10.4, cnt = KEYS[r];
  return { X: -((cnt - 1) * kw) / 2 + n * kw, Y: 95 + r * 30 };
}
function phone(P, t) {
  const { cx, cy, sc, mount = 0 } = P;
  x.save();
  if (mount > 0) { // mount arm down to the bar
    x.globalAlpha = cl(mount); x.strokeStyle = "#1c1b24"; x.lineWidth = 34; x.lineCap = "round";
    x.beginPath(); x.moveTo(cx, cy + PH * sc * 0.4); x.lineTo(cx - 40, 1530); x.stroke(); x.globalAlpha = 1;
  }
  x.translate(cx, cy); x.scale(sc, sc);
  if (P.glow) { x.shadowColor = P.glow; x.shadowBlur = 40; }
  rr(x, -PW / 2, -PH / 2, PW, PH, 36); x.fillStyle = "#0c0c12"; x.fill();
  x.shadowBlur = 0;
  x.strokeStyle = P.edge || "#3a3a48"; x.lineWidth = P.edge ? 6 : 4; x.stroke();
  if (mount > 0) { // clamp jaws
    x.fillStyle = "#26252f"; x.fillRect(-PW / 2 - 10, -40, 14, 80); x.fillRect(PW / 2 - 4, -40, 14, 80);
  }
  x.save(); rr(x, -SW_ / 2, -SH_ / 2, SW_, SH_, 28); x.clip();
  screen(P, t);
  x.restore();
  // notch
  rr(x, -36, -SH_ / 2 + 6, 72, 18, 9); x.fillStyle = "#000"; x.fill();
  x.restore();
}
function navScreen(t, moving) {
  x.fillStyle = "#0f1a2e"; x.fillRect(-120, -210, 240, 420);
  // map blocks
  x.fillStyle = "#16243d";
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) rr(x, -100 + j * 55, -150 + i * 55 + ((moving ? t * 30 : 0) % 55), 44, 44, 6), x.fill();
  // route
  x.strokeStyle = GREEN; x.lineWidth = 12; x.lineCap = "round"; x.lineJoin = "round";
  x.beginPath(); x.moveTo(0, 170); x.lineTo(0, 10); x.quadraticCurveTo(0, -60, 60, -70); x.lineTo(120, -70); x.stroke();
  x.beginPath(); x.moveTo(0, 120); x.lineTo(-16, 150); x.lineTo(16, 150); x.closePath(); x.fillStyle = WHITE; x.fill();
  // header
  rr(x, -98, -170, 196, 46, 12); x.fillStyle = "#1d7a52"; x.fill();
  x.strokeStyle = WHITE; x.lineWidth = 6; x.beginPath(); x.moveTo(-74, -132); x.lineTo(-74, -154); x.lineTo(-56, -154); x.stroke();
  x.fillStyle = "rgba(255,255,255,0.85)"; rr(x, -40, -156, 110, 10, 5); x.fill(); rr(x, -40, -140, 70, 8, 4); x.fill();
}
function banner(k, color, moon) {
  if (k <= 0) return;
  const y = lerp(-260, -150, k);
  x.save(); x.globalAlpha = cl(k * 1.3);
  rr(x, -100, y - 34, 200, 70, 16); x.fillStyle = "rgba(240,242,250,0.96)"; x.fill();
  if (color) { x.strokeStyle = color; x.lineWidth = 5; x.stroke(); }
  x.beginPath(); x.arc(-70, y + 1, 18, 0, Math.PI * 2); x.fillStyle = moon ? "#5b5f7a" : "#2bd46b"; x.fill();
  if (moon) { x.beginPath(); x.arc(-66, y - 3, 12, 0, Math.PI * 2); x.fillStyle = "rgba(240,242,250,1)"; x.fill(); }
  else { x.fillStyle = WHITE; rr(x, -80, y - 7, 20, 14, 5); x.fill(); }
  x.fillStyle = "#1b1d2a"; rr(x, -42, y - 14, 120, 10, 5); x.fill();
  x.fillStyle = "#7a7e95"; rr(x, -42, y + 4, 90, 9, 4); x.fill();
  x.restore();
}
function chatScreen(typed, tap, P) {
  x.fillStyle = "#0b0b10"; x.fillRect(-120, -210, 240, 420);
  x.fillStyle = "#1a1a24"; x.fillRect(-120, -210, 240, 60);
  x.beginPath(); x.arc(-76, -170, 16, 0, Math.PI * 2); x.fillStyle = "#6c5ce7"; x.fill();
  x.fillStyle = "#cfd2e0"; rr(x, -50, -176, 80, 10, 5); x.fill();
  // incoming
  rr(x, -98, -130, 140, 52, 16); x.fillStyle = "#2a2a36"; x.fill();
  x.fillStyle = "#c9cbd8"; rr(x, -86, -116, 110, 9, 4); x.fill(); rr(x, -86, -100, 70, 9, 4); x.fill();
  // outgoing, grows while typing
  if (typed > 0) {
    const w = 40 + 110 * cl(typed);
    rr(x, 98 - w, -60, w, 44, 16); x.fillStyle = "#2bd46b"; x.fill();
    x.fillStyle = "#0b3a1e"; rr(x, 98 - w + 12, -43, w - 30, 9, 4); x.fill();
  }
  // text field
  rr(x, -98, 40, 196, 32, 14); x.fillStyle = "#1e1e28"; x.fill();
  // keyboard
  x.fillStyle = "#15151d"; x.fillRect(-120, 78, 240, 140);
  for (let i = 0; i < 26; i++) {
    const p = keyPos(i);
    rr(x, p.X - 9, p.Y - 12, 18, 24, 4); x.fillStyle = i === tap ? WHITE : "#3a3a48"; x.fill();
  }
  if (P.thumb >= 0) {
    const p = keyPos(P.thumb);
    x.save(); x.globalAlpha = 0.95;
    x.fillStyle = "#c98f6b"; x.beginPath(); x.ellipse(p.X + 30, p.Y + 70, 30, 70, -0.5, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#e0a98a"; x.beginPath(); x.ellipse(p.X + 8, p.Y + 14, 15, 18, -0.5, 0, Math.PI * 2); x.fill();
    x.restore();
  }
}
function setupScreen(a1, a2) {
  x.fillStyle = "#0b0b10"; x.fillRect(-120, -210, 240, 420);
  const card = (y, a, kind) => {
    if (a <= 0) return;
    x.save(); x.globalAlpha = cl(a); x.translate(0, (1 - cl(a)) * 30);
    rr(x, -98, y, 196, 150, 18); x.fillStyle = "#15151f"; x.fill(); x.strokeStyle = kind === "route" ? GREEN : VIOLET; x.lineWidth = 5; x.stroke();
    if (kind === "route") {
      x.strokeStyle = GREEN; x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.moveTo(-70, y + 120); x.quadraticCurveTo(-60, y + 40, 0, y + 60); x.quadraticCurveTo(50, y + 80, 60, y + 30); x.stroke();
      x.beginPath(); x.arc(60, y + 30, 10, 0, Math.PI * 2); x.fillStyle = RED; x.fill();
      x.beginPath(); x.arc(-70, y + 120, 9, 0, Math.PI * 2); x.fillStyle = WHITE; x.fill();
    } else {
      x.beginPath(); x.moveTo(-60, y + 45); x.lineTo(-60, y + 105); x.lineTo(-10, y + 75); x.closePath(); x.fillStyle = VIOLET; x.fill();
      x.fillStyle = VIOLET; for (let i = 0; i < 4; i++) { const hh = 20 + 30 * Math.abs(Math.sin(i * 1.7 + curU * 6)); x.fillRect(10 + i * 18, y + 100 - hh, 10, hh); }
    }
    x.restore();
  };
  card(-180, a1, "route");
  card(0, a2, "music");
}
function voiceScreen(k, t) {
  x.fillStyle = "#0b0b10"; x.fillRect(-120, -210, 240, 420);
  if (k <= 0) return;
  x.save(); x.globalAlpha = cl(k);
  for (let i = 0; i < 3; i++) {
    const r = 50 + ((t * 70 + i * 35) % 105);
    x.beginPath(); x.arc(0, 10, r, 0, Math.PI * 2); x.strokeStyle = `rgba(61,255,160,${0.6 * (1 - (r - 50) / 105)})`; x.lineWidth = 6; x.stroke();
  }
  x.beginPath(); x.arc(0, 10, 46, 0, Math.PI * 2); x.fillStyle = GREEN; x.fill();
  x.fillStyle = INK; rr(x, -13, -18, 26, 46, 13); x.fill();
  x.strokeStyle = INK; x.lineWidth = 6; x.beginPath(); x.arc(0, 12, 22, 0.1, Math.PI - 0.1); x.stroke();
  x.beginPath(); x.moveTo(0, 34); x.lineTo(0, 44); x.stroke();
  x.restore();
}
function screen(P, t) {
  if (P.mode === "chat") chatScreen(P.typed, P.tap, P);
  else if (P.mode === "setup") setupScreen(P.a1, P.a2);
  else if (P.mode === "voice") voiceScreen(P.voice, t);
  else navScreen(t, P.moving);
  banner(P.notif || 0, P.notifC, P.moon);
  if (P.dim) { x.fillStyle = `rgba(0,0,0,${P.dim})`; x.fillRect(-120, -210, 240, 420); }
}
const MOUNT = { cx: 760, cy: 1170, sc: 1 };
const LOOK = { cx: 540, cy: 990, sc: 1.75 };
const lookAt = (k) => ({ cx: lerp(MOUNT.cx, LOOK.cx, k), cy: lerp(MOUNT.cy, LOOK.cy, k), sc: lerp(MOUNT.sc, LOOK.sc, k), mount: 1 - k });

function frame(t) {
  const { id, u } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1; x.globalCompositeOperation = "source-over";
  const L = [];
  let dist = 12 * t, rx = 0, carZ = 3.2, brake = 0, shake = 0, look = 0, dim = 0, carRing = 0, moving = true, sign = 0;
  let P = { mode: "nav", moving: true };

  if (id === "s1") {
    const Me = at("s1", "message"), Ne = at("s1", "never"), Ph = at("s1", "phone");
    P.notif = back(0.05, 0.4, u); P.notifC = RED;
    P.glow = `rgba(255,77,94,${0.8 * (0.5 + 0.5 * Math.sin(u * 14))})`;
    L.push(() => tag("NEW MESSAGE", CX, TY, RED, sm(0.1, 0.35, u) * (1 - sm(Ph - 0.25, Ph - 0.05, u))));
    L.push(() => tag("HANDS OFF", CX, TY, RED, sm(Ph - 0.05, Ph + 0.2, u)));
    void Me; void Ne;
  }
  if (id === "s2") {
    const Lo = at("s2", "look"), Sc = at("s2", "screen"), Ty = at("s2", "type"), Th = at("s2", "thumb");
    look = sm(Lo - 0.05, Lo + 0.55, u);
    dim = 0.55 * look;
    const ty = cl((u - Ty) / 1.0);
    P = { mode: "chat", typed: ty, tap: u > Ty ? Math.floor(u * 9) % 26 : -1, thumb: u > Sc ? Math.floor(u * 9) % 26 : -1, edge: RED };
    L.push(() => tag("EYES ON THE PHONE", CX, TY, RED, sm(Lo - 0.05, Lo + 0.2, u) * (1 - sm(Ty - 0.25, Ty - 0.05, u))));
    L.push(() => tag("ONE THUMB", CX, TY, RED, sm(Ty - 0.05, Ty + 0.2, u)));
    void Th;
  }
  if (id === "s3") {
    const Tw = at("s3", "two"), No = at("s3", "nobody"), Ca = at("s3", "car"), St = at("s3", "stops");
    // still looking down, typing; at "car" the rider looks up and the car has stopped right there
    look = 1 - sm(Ca - 0.05, Ca + 0.2, u);
    dim = 0.55 * look;
    P = { mode: "chat", typed: 1, tap: look > 0.5 ? Math.floor(u * 9) % 26 : -1, thumb: look > 0.5 ? Math.floor(u * 9) % 26 : -1, edge: RED };
    // the car ahead brakes while we are blind, so it closes in
    brake = sm(No, No + 0.3, u);
    carZ = lerp(3.2, 1.25, sm(No, St + 0.2, u));
    const hit = St + 0.15;
    shake = u > hit && u < hit + 0.5 ? (1 - (u - hit) / 0.5) : 0;
    carRing = sm(Ca, Ca + 0.2, u);
    L.push(() => tag("2 SECONDS BLIND", CX, TY, RED, sm(Tw - 0.05, Tw + 0.2, u) * (1 - sm(Ca - 0.25, Ca - 0.05, u))));
    L.push(() => tag("CAR STOPPED!", CX, TY, RED, sm(Ca - 0.05, Ca + 0.2, u)));
    L.push(() => stamp("x", 800, 820, back(hit, hit + 0.3, u) * 0.75, RED));
    // a 2-second timer ring beside the phone while blind
    L.push(() => {
      const a = sm(Tw - 0.05, Tw + 0.15, u) * look;
      if (a <= 0) return;
      const k = cl((u - Tw) / 2.0);
      x.save(); x.globalAlpha = a; x.translate(210, 900);
      x.beginPath(); x.arc(0, 0, 78, 0, Math.PI * 2); x.fillStyle = "rgba(11,10,20,0.92)"; x.fill();
      x.beginPath(); x.arc(0, 0, 64, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); x.strokeStyle = RED; x.lineWidth = 12; x.stroke();
      x.font = FONT(54); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = RED; x.fillText(`${(2 * k).toFixed(1)}`, 0, 4);
      x.restore();
    });
  }
  if (id === "s4") {
    const Ro = at("s4", "route"), Mu = at("s4", "music"), Be = at("s4", "before");
    // parked: road still, phone held up in front
    dist = 12 * S.s4[0]; moving = false; carZ = 3.2;
    look = sm(0, 0.4, u) * 0.85;
    P = { mode: "setup", a1: back(Ro - 0.1, Ro + 0.25, u), a2: back(Mu - 0.1, Mu + 0.25, u), edge: GREEN, glow: "rgba(61,255,160,0.5)" };
    L.push(() => tag("SET THE ROUTE", CX, TY, GREEN, sm(Ro - 0.05, Ro + 0.2, u) * (1 - sm(Mu - 0.25, Mu - 0.05, u))));
    L.push(() => tag("SET THE MUSIC", CX, TY, VIOLET, sm(Mu - 0.05, Mu + 0.2, u) * (1 - sm(Be - 0.25, Be - 0.05, u))));
    L.push(() => tag("BEFORE YOU LEAVE", CX, TY, GREEN, sm(Be - 0.05, Be + 0.2, u)));
    L.push(() => stamp("v", 210, 900, back(Be + 0.1, Be + 0.4, u) * 0.6, GREEN));
  }
  if (id === "s5") {
    const Me = at("s5", "messages"), Wa = at("s5", "wait"), Vo = at("s5", "voice"), Mu = at("s5", "must");
    // riding again, phone on the mount: the message gets snoozed, then a voice command
    const inV = sm(Vo - 0.15, Vo + 0.1, u);
    P = inV < 0.5
      ? { mode: "nav", moving: true, notif: back(0.0, 0.3, u) * (1 - sm(Wa + 0.2, Wa + 0.6, u)), moon: u > Wa - 0.05, notifC: VIOLET }
      : { mode: "voice", voice: inV, edge: GREEN };
    L.push(() => tag("MESSAGES WAIT", CX, TY, VIOLET, sm(Me - 0.05, Me + 0.2, u) * (1 - sm(Vo - 0.25, Vo - 0.05, u))));
    L.push(() => tag("VOICE ONLY", CX, TY, GREEN, sm(Vo - 0.05, Vo + 0.2, u)));
    void Mu;
  }
  if (id === "s6") {
    const Ne = at("s6", "need"), Pu = at("s6", "pull"), Sa = at("s6", "safe"), St = at("s6", "stop");
    // slow down and roll onto the verge by a P sign, stop, then the phone comes up
    const t0 = S.s6[0] + LEAD + Pu, q = cl(t - t0, 0, 1.4);
    dist = 12 * t0 + 12 * (q - (q * q) / 2.8);
    moving = u < St + 0.2;
    rx = 520 * sm(Pu, Sa + 0.4, u);
    carZ = lerp(3.2, 9, sm(Pu, St, u));
    sign = sm(Pu, Pu + 0.4, u);
    look = sm(St, St + 0.3, u);
    P = { mode: "chat", typed: 0.6, tap: -1, thumb: -1, edge: look > 0.5 ? GREEN : null };
    if (look < 0.3) P = { mode: "nav", moving };
    L.push(() => tag("NEED THE PHONE?", CX, TY, VIOLET, sm(Ne - 0.05, Ne + 0.2, u) * (1 - sm(Pu - 0.25, Pu - 0.05, u))));
    L.push(() => tag("PULL OVER", CX, TY, GREEN, sm(Pu - 0.05, Pu + 0.2, u) * (1 - sm(St - 0.25, St - 0.05, u))));
    L.push(() => tag("STOP FIRST", CX, TY, GREEN, sm(St - 0.05, St + 0.2, u)));
    L.push(() => stamp("v", 210, 900, back(St + 0.1, St + 0.4, u) * 0.6, GREEN));
  }
  if (id === "s7" || id === "s8") { P = { mode: "nav", moving: true }; }

  // ---------- picture ----------
  x.fillStyle = "#050409"; x.fillRect(0, 0, 1080, 1920);
  x.save();
  if (shake > 0) x.translate(Math.sin(t * 70) * 26 * shake, Math.cos(t * 55) * 34 * shake);
  sky();
  road(dist, rx);
  if (sign > 0) parkSign(rx, sign);
  const cp = car(-150, carZ, rx, brake);
  if (dim > 0) { x.fillStyle = `rgba(5,4,9,${dim})`; x.fillRect(0, 0, 1080, 1920); }
  ring(cp, RED, carRing * (1 - shake * 0.3), t);
  cockpit(t, moving);
  const G = lookAt(look);
  phone(Object.assign({}, P, G), t);
  x.restore();

  L.forEach((f) => f());

  if (id === "s1") words(["NEVER TOUCH", "YOUR PHONE"], RED, 380, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "phone"))));
  if (id === "s2") words(["EYES", "DOWN..."], RED, 380, 0.0, 1, 170, flash(u, at("s2", "look")) * 0.6);
  if (id === "s3") words(["NOBODY", "WATCHING"], RED, 380, 0.0, 1, 170, flash(u, at("s3", "car")) * 0.6);
  if (id === "s4") words(["SET IT", "BEFORE YOU GO"], GREEN, 380, 0.0, 1, 150, flash(u, at("s4", "route")) * 0.6);
  if (id === "s5") words(["LET IT", "WAIT"], GREEN, 380, 0.0, 1, 170, flash(u, at("s5", "wait")) * 0.6);
  if (id === "s6") words(["PULL OVER", "FIRST"], GREEN, 380, 0.0, 1, 160, flash(u, at("s6", "pull")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,4,9,0.78)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["EYES ON", "THE ROAD."], ORANGE, 660, 0.0, 1, 150, flash(u, 0.05));
    words(["PHONE CAN WAIT."], ORANGE, 1000, at("s7", "phone") - 0.05, 1, 150, flash(u, at("s7", "phone")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(5,4,9,0.9)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], WHITE, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["phone-ride-ui"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
