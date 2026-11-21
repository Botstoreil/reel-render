// vents: 2D Canvas reel (flat neon illustrations + kinetic text), same look as mirror-myth. Time only from hf-seek.
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
  x.translate(X, Y); x.scale(s, s);
  glow(color, 24); x.fillStyle = "rgba(8,6,34,0.85)"; rr(-w / 2, -px * 0.75, w, px * 1.5, px * 0.75); x.fill();
  x.lineWidth = 5; x.strokeStyle = color; x.stroke(); noGlow();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}

// ---------- props ----------
function room(dark) {
  const gr = x.createRadialGradient(CX, 820, 80, CX, 820, 1100);
  gr.addColorStop(0, "#1a1650"); gr.addColorStop(1, BG);
  x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
  // wall panels
  x.save(); x.globalAlpha = 0.12 * (1 - dark); x.strokeStyle = VIOLET; x.lineWidth = 2;
  for (let X = 60; X < 1100; X += 240) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, 1920); x.stroke(); }
  x.restore();
  if (dark > 0) { x.fillStyle = `rgba(2,1,10,${0.72 * dark})`; x.fillRect(0, 0, 1080, 1920); }
}
// wall vent: frame + slats; inside(cb) draws what sits behind the slats
function vent(X, Y, w, h, a = 1, rim = VIOLET, inside = null) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a;
  glow(rim, 34); x.fillStyle = "#0b0920"; x.strokeStyle = rim; x.lineWidth = 12;
  rr(X - w / 2, Y - h / 2, w, h, 22); x.fill(); x.stroke(); noGlow();
  if (inside) { x.save(); rr(X - w / 2 + 10, Y - h / 2 + 10, w - 20, h - 20, 14); x.clip(); inside(); x.restore(); }
  const n = Math.max(4, Math.round(h / 52)), gap = (h - 40) / n;
  for (let i = 0; i < n; i++) {
    const y = Y - h / 2 + 24 + i * gap;
    const g = x.createLinearGradient(0, y, 0, y + gap * 0.55);
    g.addColorStop(0, "#5a64b8"); g.addColorStop(1, "#262a66");
    x.fillStyle = g; rr(X - w / 2 + 22, y, w - 44, gap * 0.55, 6); x.fill();
  }
  x.restore();
}
function camIcon(X, Y, s, a, color = RED, blink = 1) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(color, 30); x.fillStyle = "#1c0c18"; x.lineWidth = 8; x.strokeStyle = color;
  rr(-90, -55, 180, 110, 22); x.fill(); x.stroke();
  x.beginPath(); x.arc(0, 0, 38, 0, Math.PI * 2); x.stroke();
  x.fillStyle = color; x.beginPath(); x.arc(0, 0, 18, 0, Math.PI * 2); x.fill();
  x.globalAlpha = a * blink; x.beginPath(); x.arc(64, -36, 10, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
function lens(X, Y, s, a, color = RED) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(color, 30); x.fillStyle = "#12060e"; x.strokeStyle = color; x.lineWidth = 6;
  x.beginPath(); x.arc(0, 0, 30, 0, Math.PI * 2); x.fill(); x.stroke();
  x.fillStyle = color; x.beginPath(); x.arc(0, 0, 12, 0, Math.PI * 2); x.fill();
  x.fillStyle = WHITE; x.beginPath(); x.arc(-6, -6, 4, 0, Math.PI * 2); x.fill();
  noGlow(); x.restore();
}
function stamp(kind, X, Y, s, a, color) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  glow(color, 30); x.strokeStyle = color; x.lineWidth = 22;
  x.beginPath(); x.arc(0, 0, 80, 0, Math.PI * 2); x.stroke();
  x.beginPath();
  if (kind === "x") { x.moveTo(-40, -40); x.lineTo(40, 40); x.moveTo(40, -40); x.lineTo(-40, 40); }
  else if (kind === "?") { x.font = FONT(120); x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText("?", 0, 6); }
  else { x.moveTo(-42, 4); x.lineTo(-12, 34); x.lineTo(44, -30); }
  x.stroke(); noGlow(); x.restore();
}
function phone(X, Y, s, a, rot = 0, lamp = 0) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.rotate(rot); x.scale(s, s);
  glow(VIOLET, 26); x.fillStyle = "#14123a"; x.strokeStyle = VIOLET; x.lineWidth = 8;
  rr(-80, -150, 160, 300, 28); x.fill(); x.stroke(); noGlow();
  x.fillStyle = "#26225e"; rr(-62, -118, 124, 236, 14); x.fill();
  if (lamp > 0) { x.globalAlpha = a; glow(WHITE, 60 * lamp); x.fillStyle = WHITE; x.beginPath(); x.arc(0, -120, 16, 0, Math.PI * 2); x.fill(); noGlow(); }
  x.restore();
}
function lampProp(X, Y, s, a, c = VIOLET) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#1a1648"; x.lineJoin = "round";
  x.beginPath(); x.moveTo(-70, -40); x.lineTo(70, -40); x.lineTo(45, -140); x.lineTo(-45, -140); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(0, -40); x.lineTo(0, 90); x.stroke();
  rr(-60, 90, 120, 26, 12); x.fill(); x.stroke();
  noGlow(); x.restore();
}
function charger(X, Y, s, a, c = VIOLET) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s);
  glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#1a1648";
  rr(-60, -70, 120, 140, 20); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-25, -70); x.lineTo(-25, -110); x.moveTo(25, -70); x.lineTo(25, -110); x.stroke();
  x.fillStyle = c; rr(-24, 10, 48, 18, 6); x.fill();
  noGlow(); x.restore();
}
function furn(kind, X, Y, s, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); glow(c, 26); x.strokeStyle = c; x.lineWidth = 10; x.fillStyle = "#15123c"; x.lineCap = "round";
  if (kind === "bed") {
    rr(-110, -10, 220, 60, 12); x.fill(); x.stroke();
    rr(-110, -60, 60, 50, 12); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(-110, 50); x.lineTo(-110, 80); x.moveTo(110, 50); x.lineTo(110, 80); x.stroke();
  } else if (kind === "shower") {
    x.beginPath(); x.moveTo(-60, 90); x.lineTo(-60, -80); x.lineTo(20, -80); x.lineTo(20, -50); x.stroke();
    x.beginPath(); x.moveTo(-20, -50); x.lineTo(60, -50); x.stroke();
    x.lineWidth = 6; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-10 + i * 20, -30); x.lineTo(-16 + i * 20, 10); x.stroke(); }
  } else {
    rr(-120, -20, 240, 60, 16); x.fill(); x.stroke();
    rr(-120, -70, 240, 50, 16); x.fill(); x.stroke();
    rr(-150, -40, 40, 80, 14); x.fill(); x.stroke(); rr(110, -40, 40, 80, 14); x.fill(); x.stroke();
  }
  noGlow(); x.restore();
}
function walker(X, Y, s, a, ph) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.strokeStyle = WHITE; x.lineWidth = 16; x.lineCap = "round"; glow(WHITE, 16);
  x.beginPath(); x.arc(0, -150, 34, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(0, -112); x.lineTo(0, 10); x.stroke();
  const sw = Math.sin(ph) * 0.5;
  [[sw, 1], [-sw, -1]].forEach(([an]) => { x.beginPath(); x.moveTo(0, 10); x.lineTo(Math.sin(an) * 90, 10 + Math.cos(an) * 90); x.stroke(); });
  [[-sw], [sw]].forEach(([an]) => { x.beginPath(); x.moveTo(0, -90); x.lineTo(Math.sin(an) * 70, -90 + Math.cos(an) * 70); x.stroke(); });
  noGlow(); x.restore();
}
function beamTo(x0, y0, x1, y1, w, a, c) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = 0.4 * a; const gr = x.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)");
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  x.fillStyle = gr; x.beginPath(); x.moveTo(x0 + nx * 12, y0 + ny * 12); x.lineTo(x1 + nx * w, y1 + ny * w); x.lineTo(x1 - nx * w, y1 - ny * w); x.lineTo(x0 - nx * 12, y0 - ny * 12); x.closePath(); x.fill();
  x.restore();
}

// ---------- one frame ----------
function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  const dark = id === "s4" ? sm(at("s4", "off") - 0.05, at("s4", "lights"), u) : id === "s5" ? 1 : id === "s7" ? 0.6 : 0;
  room(dark);
  x.save(); x.translate(CX, 820); x.scale(z, z); x.translate(-CX, -820);

  if (id === "s1") {
    const a = sm(-0.05, 0.3, u);
    const peek = sm(at("s1", "small") - 0.1, at("s1", "cameras") + 0.1, u);
    vent(CX, 880, 560, 460, a, peek > 0.5 ? RED : VIOLET, () => {
      camIcon(CX + 60, lerp(1100, 900, peek), 1.1, peek, RED, 0.5 + 0.5 * Math.sin(u * 14));
    });
    tag("COMMON SPOT", CX, 1190, RED, sm(at("s1", "common") - 0.1, at("s1", "common") + 0.15, u));
  }
  if (id === "s2") {
    const a = sm(-0.05, 0.25, u);
    const l = back(at("s2", "lamps") - 0.15, at("s2", "lamps") + 0.2, u), c = back(at("s2", "chargers") - 0.15, at("s2", "chargers") + 0.2, u);
    lampProp(200, 960, 1, a, l > 0.5 ? GREEN : VIOLET);
    charger(470, 990, 0.9, a, c > 0.5 ? GREEN : VIOLET);
    vent(790, 900, 260, 230, a, u > at("s2", "vent") - 0.1 ? RED : VIOLET);
    stamp("v", 200, 690, l * 0.6, u > at("s2", "lamps") - 0.15 ? 1 : 0, GREEN);
    stamp("v", 470, 690, c * 0.6, u > at("s2", "chargers") - 0.15 ? 1 : 0, GREEN);
    // person walks right past the vent
    const wk = sm(at("s2", "walk") - 0.1, at("s2", "vent") + 0.3, u);
    walker(lerp(80, 1000, wk), 1270, 0.8, sm(at("s2", "walk") - 0.2, at("s2", "walk"), u), u * 9);
    tag("MISSED", 790, 1060, RED, sm(at("s2", "vent") - 0.05, at("s2", "vent") + 0.2, u));
  }
  if (id === "s3") {
    const sl = sm(at("s3", "between") - 0.1, at("s3", "slats"), u);
    vent(CX, 860, 640, 540, 1, RED, () => {
      x.fillStyle = "#06040f"; x.fillRect(0, 0, 1080, 1920);
      x.strokeStyle = "rgba(255,42,58,0.25)"; x.lineWidth = 2;
      for (let X = CX - 300; X < CX + 320; X += 40) { x.beginPath(); x.moveTo(X, 590); x.lineTo(X, 1130); x.stroke(); }
    });
    // the lens sits in a gap between two slats
    const L = back(at("s3", "lens") - 0.1, at("s3", "lens") + 0.25, u);
    const gy = 590 + 24 + 3 * ((540 - 40) / Math.round(540 / 52)) - 18;
    lens(CX + 120, gy, L * 1.1, u > at("s3", "lens") - 0.1 ? 1 : 0);
    if (sl > 0) { x.save(); x.globalAlpha = sl; glow(RED, 20); x.strokeStyle = RED; x.lineWidth = 6; x.setLineDash([14, 10]); x.beginPath(); x.arc(CX + 120, gy, 70, 0, Math.PI * 2); x.stroke(); x.restore(); }
    tag("TINY LENS", CX + 120, gy + 130, RED, sm(at("s3", "tiny") - 0.05, at("s3", "tiny") + 0.2, u), 40);
  }
  if (id === "s4") {
    const on = sm(at("s4", "shine") - 0.1, at("s4", "flashlight"), u);
    vent(CX, 800, 560, 440, 1, on > 0.5 ? GREEN : VIOLET);
    const sw = sm(at("s4", "off") - 0.05, at("s4", "off") + 0.15, u), sa = 1 - sm(at("s4", "shine") - 0.3, at("s4", "shine"), u);
    if (sa > 0) { x.save(); x.globalAlpha = sa; x.translate(880, 560); glow(VIOLET, 20); x.fillStyle = "#1c1850"; x.strokeStyle = VIOLET; x.lineWidth = 6; rr(-45, -75, 90, 150, 16); x.fill(); x.stroke(); x.fillStyle = sw > 0.5 ? "#555" : "#ffe9a8"; rr(-18, lerp(-50, 6, sw), 36, 44, 8); x.fill(); x.restore(); }
    const ph = sm(at("s4", "shine") - 0.2, at("s4", "flashlight"), u);
    const PX = lerp(1000, 700, ph), PY = lerp(1500, 1250, ph);
    beamTo(PX - 30, PY - 130, CX, 800, 260, on * (0.8 + 0.2 * Math.sin(u * 7)), WHITE);
    phone(PX, PY, 0.9, sm(at("s4", "shine") - 0.3, at("s4", "shine"), u), -0.5, on);
  }
  if (id === "s5") {
    const gr = x.createRadialGradient(CX, 820, 0, CX, 820, 460); gr.addColorStop(0, "rgba(255,255,255,0.28)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    const G = sm(at("s5", "glint") - 0.1, at("s5", "glint") + 0.1, u), Wr = sm(at("s5", "wire") - 0.15, at("s5", "belong"), u);
    vent(CX, 820, 700, 600, 1, GREEN, () => {
      x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
      if (Wr > 0) { // a wire snaking behind the slats
        x.save(); glow(RED, 20); x.strokeStyle = RED; x.lineWidth = 10; x.lineCap = "round";
        x.beginPath(); const N = 40; for (let i = 0; i <= N * Wr; i++) { const k = i / N; const X = lerp(CX - 330, CX + 110, k), Y = 1080 - 260 * k + 40 * Math.sin(k * 9); i ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); x.restore();
      }
    });
    if (G > 0) {
      const p = 0.7 + 0.3 * Math.sin(u * 16);
      x.save(); x.globalAlpha = G; glow(WHITE, 70 * p); x.fillStyle = WHITE; x.beginPath(); x.arc(CX + 130, 700, 14 * p + 6, 0, Math.PI * 2); x.fill();
      x.strokeStyle = WHITE; x.lineWidth = 5; for (let i = 0; i < 4; i++) { const an = i * Math.PI / 2 + u; x.beginPath(); x.moveTo(CX + 130 + Math.cos(an) * 34, 700 + Math.sin(an) * 34); x.lineTo(CX + 130 + Math.cos(an) * (60 + 20 * p), 700 + Math.sin(an) * (60 + 20 * p)); x.stroke(); }
      x.restore();
      tag("GLINT", CX + 130, 580, GREEN, G, 40);
    }
    tag("WIRE", CX - 200, 1180, RED, Wr, 40);
  }
  if (id === "s6") {
    // floor plan: vent on the top wall, beams to what it faces
    const a = sm(-0.05, 0.25, u);
    x.save(); x.globalAlpha = a; glow(VIOLET, 20); x.strokeStyle = VIOLET; x.lineWidth = 8; rr(130, 560, 760, 700, 24); x.stroke(); x.restore();
    vent(CX, 580, 200, 70, a, GREEN);
    const items = [["bed", 280, 1050], ["shower", 760, 1080], ["couch", 520, 900]];
    items.forEach(([k, X, Y]) => {
      const w = at("s6", k === "couch" ? "couch" : k);
      const b = back(w - 0.1, w + 0.2, u);
      beamTo(CX, 610, X, Y - 40, 70, sm(w - 0.15, w + 0.1, u), GREEN);
      furn(k, X, Y, b * 0.9, u > w - 0.1 ? 1 : 0, GREEN);
    });
  }
  if (id === "s7") {
    vent(CX, 860, 520, 420, 0.6, GREEN);
    beamTo(820, 1300, CX, 860, 240, 0.8, WHITE);
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER SKIP", "THE VENTS"], RED, 380, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))));
  if (id === "s2") {
    const sw = at("s2", "then") - 0.1;
    words(["LAMP. CHARGER."], GREEN, 380, at("s2", "lamps") - 0.15, 1 - sm(sw - 0.1, sw, u), 130);
    words(["VENT? SKIPPED"], RED, 380, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s2", "vent")));
  }
  if (id === "s3") words(["FITS IN", "THE SLATS"], RED, 340, 0.0, 1, 140, flash(u, at("s3", "slats")) * 0.6);
  if (id === "s4") {
    const sw = at("s4", "shine") - 0.15;
    words(["LIGHTS OFF"], GREEN, 360, at("s4", "off") - 0.1, 1 - sm(sw - 0.1, sw, u), 140);
    words(["LIGHT THE SLATS"], GREEN, 360, sw, sm(sw - 0.05, sw, u), 130, flash(u, at("s4", "flashlight")) * 0.6);
  }
  if (id === "s5") words(["GLINT? WIRE?"], GREEN, 360, 0.0, 1, 140, flash(u, at("s5", "glint")) * 0.6);
  if (id === "s6") words(["WHAT DOES IT FACE"], GREEN, 380, 0.0, 1, 120);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["LIGHT EVERY VENT"], ORANGE, 690, 0.0, 1, 140, flash(u, 0.05));
    words(["EVERY ROOM"], ORANGE, 880, at("s7", "every", 2) - 0.05, 1, 150, flash(u, at("s7", "room")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(8,6,34,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "HIDDEN CAM"] = BRAND.cta || [];
    const k = back(0.0, 0.35, u);
    x.save(); x.translate(CX, 560); x.scale(k, k);
    glow(VIOLET, 40); x.strokeStyle = VIOLET; x.lineWidth = 12; x.beginPath(); x.arc(0, 0, 110, 0, Math.PI * 2); x.stroke();
    x.fillStyle = VIOLET; x.beginPath(); x.arc(0, 0, 46, 0, Math.PI * 2); x.fill();
    x.strokeStyle = GREEN; glow(GREEN, 30); x.lineWidth = 10; x.beginPath(); x.arc(0, 0, 150, u * 3, u * 3 + 1.4); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["vents-2d"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
