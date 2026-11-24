// outride-headlight (Apex 20, TikTok) - NIGHT RIDER POV style: first-person perspective down an unlit country road,
// the headlight pool on the asphalt, a bracket on the road that shows the stopping distance against the lit distance.
// Wrong: daytime speed, the stopping bracket runs past the end of the light; a deer appears in the beam and the bike
// cannot stop in time. Right: a speed where the stop fits inside the lit road; high beam when the road is empty,
// tail lights ahead; eyes at the edges, slow down early. Time only from hf-seek.
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
const RED = "#ff3d4f", GREEN = "#3dff8f", VIOLET = "#b39cff", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#04060c", AMBER = "#ffd24a";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B2 = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }

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
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 50) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 46, h = px * 1.55, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1360);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(4,6,12,0.86)"; rr(-w / 2, -h / 2, w, h, 12); x.fill();
  x.strokeStyle = color; x.lineWidth = 5; rr(-w / 2, -h / 2, w, h, 12); x.stroke();
  x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.fillStyle = "rgba(4,6,12,0.95)"; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.fill();
  x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- perspective ----------
const VY = 620, F = 9960, Z0 = 12, HW = 4;    // horizon y, focal, near offset, road half width (m)
const k = (z) => F / (z + Z0);                  // z=0 -> y 1450, z=25 -> 889, z=40 -> 811
const Y = (z) => VY + k(z);
const X = (lat, z) => 540 + lat * k(z) * 0.1265;
function night(t) {
  const g = x.createLinearGradient(0, 0, 0, VY); g.addColorStop(0, "#02030a"); g.addColorStop(1, "#0b1226");
  x.fillStyle = g; x.fillRect(-200, -200, 1480, VY + 200);
  // stars + tree line
  x.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 40; i++) { const sx = (i * 263) % 1080, sy = 80 + ((i * 137) % 520); x.globalAlpha = 0.25 + 0.25 * Math.sin(t * 2 + i); x.fillRect(sx, sy, 3, 3); }
  x.globalAlpha = 1;
  x.fillStyle = "#03050c"; x.beginPath(); x.moveTo(-200, VY + 4);
  for (let i = -200; i <= 1280; i += 40) x.lineTo(i, VY - 30 - 26 * Math.abs(Math.sin(i * 0.031)) - 14 * Math.abs(Math.sin(i * 0.11)));
  x.lineTo(1280, VY + 4); x.closePath(); x.fill();
  x.fillStyle = "#05070d"; x.fillRect(-200, VY, 1480, 1400);
}
function road(off, lit, hi) {
  // asphalt
  x.fillStyle = "#0c0e14"; x.beginPath(); x.moveTo(X(-HW, 400), Y(400)); x.lineTo(X(HW, 400), Y(400)); x.lineTo(X(HW, 0), Y(0)); x.lineTo(X(-HW, 0), Y(0)); x.closePath(); x.fill();
  // headlight pool: warm light fading out at 'lit' metres
  const g = x.createLinearGradient(0, Y(0), 0, Y(lit));
  g.addColorStop(0, `rgba(255,236,190,${0.55 + 0.1 * hi})`); g.addColorStop(0.75, `rgba(255,236,190,${0.30 + 0.1 * hi})`); g.addColorStop(1, "rgba(255,236,190,0)");
  x.save(); x.globalCompositeOperation = "lighter"; x.fillStyle = g;
  x.beginPath(); x.moveTo(X(-HW - 2, lit), Y(lit)); x.lineTo(X(HW + 2, lit), Y(lit)); x.lineTo(X(HW + 3, 0), Y(0)); x.lineTo(X(-HW - 3, 0), Y(0)); x.closePath(); x.fill(); x.restore();
  // edge lines and centre dashes, lit only where light reaches
  const vis = (z) => cl(1 - (z - lit) / 6, 0.06, 1);
  for (let z = 0; z < 120; z += 1.5) {
    const a = vis(z);
    x.strokeStyle = `rgba(240,240,230,${0.85 * a})`; x.lineWidth = Math.max(1, k(z) * 0.01);
    x.beginPath(); x.moveTo(X(-HW + 0.2, z), Y(z)); x.lineTo(X(-HW + 0.2, z + 1.5), Y(z + 1.5)); x.moveTo(X(HW - 0.2, z), Y(z)); x.lineTo(X(HW - 0.2, z + 1.5), Y(z + 1.5)); x.stroke();
  }
  for (let i = 0; i < 30; i++) {
    const z = i * 6 - (off % 6); if (z < 0) continue;
    const a = vis(z); x.fillStyle = `rgba(255,220,120,${0.85 * a})`;
    const z2 = z + 3; x.beginPath(); x.moveTo(X(-0.12, z), Y(z)); x.lineTo(X(0.12, z), Y(z)); x.lineTo(X(0.12, z2), Y(z2)); x.lineTo(X(-0.12, z2), Y(z2)); x.closePath(); x.fill();
  }
}
// a bracket on the right road edge from z=0 to z=len, with an end bar
function bracket(len, color, a, label) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.strokeStyle = color; x.lineWidth = 10; x.lineCap = "round"; x.shadowColor = color; x.shadowBlur = 18;
  x.beginPath(); for (let z = 0; z <= len; z += 0.5) { const px = X(HW + 0.8, z), py = Y(z); z === 0 ? x.moveTo(px, py) : x.lineTo(px, py); } x.stroke();
  x.lineWidth = 12; x.beginPath(); x.moveTo(X(-HW, len), Y(len)); x.lineTo(X(HW + 1.4, len), Y(len)); x.stroke();
  x.restore();
  if (label) { if (color === AMBER) tag(label, X(-HW, len) - 40, Y(len) - 60, color, a, 44); else tag(label, X(HW + 0.8, len) + 30, Y(len) - 60, color, a, 44); }
}
function deer(z, lat, a, lit) {
  if (a <= 0) return;
  const s = k(z) * 0.001, px = X(lat, z), py = Y(z);
  const lightK = cl(1 - (z - lit) / 4, 0.12, 1);
  x.save(); x.globalAlpha = a; x.translate(px, py); x.scale(s, s);
  x.fillStyle = mix("#1a120c", "#8a6a4a", lightK); x.strokeStyle = mix("#1a120c", "#3a2a1a", lightK); x.lineWidth = 16; x.lineCap = "round";
  x.beginPath(); x.moveTo(-90, -10); x.lineTo(-90, -150); x.moveTo(-50, -10); x.lineTo(-50, -150); x.moveTo(60, -10); x.lineTo(60, -150); x.moveTo(95, -10); x.lineTo(95, -150); x.stroke();
  x.beginPath(); x.ellipse(0, -190, 130, 60, 0, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.moveTo(90, -210); x.lineTo(140, -320); x.lineTo(185, -310); x.lineTo(130, -190); x.closePath(); x.fill();
  x.beginPath(); x.ellipse(170, -330, 40, 28, 0.3, 0, Math.PI * 2); x.fill();
  x.lineWidth = 8; x.beginPath(); x.moveTo(160, -355); x.lineTo(140, -420); x.lineTo(115, -440); x.moveTo(140, -420); x.lineTo(160, -455); x.moveTo(178, -355); x.lineTo(200, -425); x.stroke();
  x.fillStyle = "#eaffc0"; x.shadowColor = "#eaffc0"; x.shadowBlur = 30; x.beginPath(); x.arc(188, -336, 9, 0, Math.PI * 2); x.fill();
  x.restore();
}
function eyes(z, lat, a) {
  if (a <= 0) return;
  const s = k(z) * 0.0007, px = X(lat, z), py = Y(z) - 300 * s;
  x.save(); x.globalAlpha = a; x.fillStyle = "#eaffc0"; x.shadowColor = "#eaffc0"; x.shadowBlur = 26;
  x.beginPath(); x.arc(px - 22 * s * 4, py, Math.max(4, 12 * s * 4), 0, Math.PI * 2); x.arc(px + 22 * s * 4, py, Math.max(4, 12 * s * 4), 0, Math.PI * 2); x.fill(); x.restore();
}
function tails(z, a) {
  if (a <= 0) return;
  const px = X(0.8, z), py = Y(z) - 20;
  x.save(); x.globalAlpha = a; x.fillStyle = RED; x.shadowColor = RED; x.shadowBlur = 24;
  x.fillRect(px - 34, py, 16, 8); x.fillRect(px + 18, py, 16, 8); x.restore();
}
// cockpit in the foreground
function cockpit(speed, hi, brake) {
  x.save();
  x.fillStyle = "#07080c"; x.beginPath(); x.moveTo(-100, 1920); x.lineTo(-100, 1560); x.quadraticCurveTo(540, 1380, 1180, 1560); x.lineTo(1180, 1920); x.closePath(); x.fill();
  x.strokeStyle = "#1c2230"; x.lineWidth = 34; x.lineCap = "round"; x.beginPath(); x.moveTo(120, 1600); x.quadraticCurveTo(540, 1470, 960, 1600); x.stroke();
  x.fillStyle = "#0d1018"; x.beginPath(); x.arc(540, 1600, 110, Math.PI, 0); x.fill();
  x.strokeStyle = "#2b3346"; x.lineWidth = 6; x.beginPath(); x.arc(540, 1600, 100, Math.PI, 0); x.stroke();
  const ang = Math.PI + Math.PI * cl(speed);
  x.strokeStyle = speed > 0.6 ? RED : GREEN; x.lineWidth = 8; x.beginPath(); x.moveTo(540, 1600); x.lineTo(540 + Math.cos(ang) * 85, 1600 + Math.sin(ang) * 85); x.stroke();
  x.fillStyle = hi > 0.5 ? "#4aa8ff" : "#2a3040"; x.beginPath(); x.arc(420, 1560, 14, 0, Math.PI * 2); x.fill();
  if (brake > 0) { x.fillStyle = `rgba(255,61,79,${brake})`; x.beginPath(); x.arc(660, 1560, 14, 0, Math.PI * 2); x.fill(); }
  x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 900); x.scale(z, z); x.translate(-540, -900);
  night(t);
  const L = [];
  let off = 0, lit = 24, hi = 0, speed = 0.45, brake = 0;
  const GT = 0;

  if (id === "s1") {
    off = u * 18; speed = 0.5;
    road(off, lit, hi);
    L.push(() => tag("YOUR LIGHT", 300, 1120, AMBER, sm(at("s1", "lights") - 0.1, at("s1", "lights") + 0.2, u)));
    L.push(() => tag("DARK", 540, 780, "#8a94b0", sm(at("s1", "dark") - 0.1, at("s1", "dark") + 0.2, u)));
  }
  if (id === "s2") {
    off = u * 32; speed = 0.85;
    road(off, lit, hi);
    const Dy = at("s2", "daytime");
    L.push(() => bracket(42, RED, sm(Dy - 0.1, Dy + 0.4, u), "YOUR STOP"));
    L.push(() => bracket(lit, AMBER, sm(Dy + 0.4, Dy + 0.7, u) * 0.9, "YOU SEE"));
    L.push(() => tag("DAY SPEED", 300, 1180, RED, sm(Dy - 0.1, Dy + 0.2, u)));
  }
  if (id === "s3") {
    const Ap = at("s3", "appears"), Ti = at("s3", "time");
    const stop = sm(Ap, Ti + 0.4, u);
    off = 32 * u - 14 * u * stop; speed = lerp(0.85, 0.3, stop); brake = u > Ap + 0.1 ? 1 : 0;
    road(off, lit, hi);
    const dz = lerp(30, 6, sm(-0.2, Ti + 0.4, u));
    deer(dz, 0.6, sm(Ap - 0.3, Ap, u), lit);
    L.push(() => bracket(lerp(42, 30, stop), RED, sm(Ap, Ap + 0.3, u), "STILL MOVING"));
    L.push(() => mark("x", 300, 900, back(Ti, Ti + 0.3, u) * 0.6, u > Ti - 0.05 ? 1 : 0, RED));
    L.push(() => { x.save(); x.globalAlpha = 0.3 * flash(u, Ti + 0.05); x.fillStyle = RED; x.fillRect(-200, -200, 1480, 2400); x.restore(); });
  }
  if (id === "s4") {
    off = u * 14; speed = 0.4;
    road(off, lit, hi);
    const St = at("s4", "stop"), Li = at("s4", "lit");
    const len = lerp(42, 17, sm(0.1, St, u));
    L.push(() => bracket(len, len < lit ? GREEN : RED, 1, len < lit ? "YOUR STOP" : ""));
    L.push(() => bracket(lit, AMBER, sm(Li - 0.3, Li, u) * 0.9, "YOU SEE"));
    L.push(() => tag("SLOWER", 300, 1180, GREEN, sm(at("s4", "speed") - 0.1, at("s4", "speed") + 0.2, u)));
    L.push(() => mark("v", 300, 900, back(Li, Li + 0.3, u) * 0.5, u > Li - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s5") {
    const Hi = at("s5", "high"), Fo = at("s5", "follow");
    hi = sm(Hi - 0.1, Hi + 0.2, u) * (1 - sm(Fo - 0.3, Fo, u));
    lit = lerp(24, 55, hi);
    off = u * 16; speed = 0.45;
    road(off, lit, hi);
    tails(lerp(80, 60, sm(Fo - 0.3, d, u)), sm(Fo - 0.3, Fo, u));
    L.push(() => tag("HIGH BEAM", 300, 1180, VIOLET, sm(Hi - 0.1, Hi + 0.2, u) * (1 - sm(Fo - 0.3, Fo, u))));
    L.push(() => tag("FOLLOW THEIR LIGHTS", 540, 640, GREEN, sm(Fo - 0.1, Fo + 0.2, u)));
    L.push(() => tag("EMPTY ROAD", 800, 1180, GREEN, sm(at("s5", "empty") - 0.1, at("s5", "empty") + 0.2, u) * (1 - sm(Fo - 0.3, Fo, u))));
  }
  if (id === "s6") {
    const E = at("s6", "edges"), Ey = at("s6", "eyes"), Sl = at("s6", "slow");
    off = 16 * u - 6 * u * sm(Sl, d, u); speed = lerp(0.45, 0.28, sm(Sl, d, u)); brake = sm(Sl, Sl + 0.2, u) * 0.6;
    road(off, lit, hi);
    eyes(lerp(26, 20, sm(Ey - 0.3, d, u)), -HW - 1.6, sm(Ey - 0.3, Ey, u));
    L.push(() => { if (sm(E - 0.2, E, u) > 0) { x.save(); x.globalAlpha = 0.8 * sm(E - 0.2, E, u); x.strokeStyle = VIOLET; x.lineWidth = 6; x.setLineDash([16, 12]);
      x.beginPath(); x.moveTo(X(-HW - 3, 2), Y(2)); x.lineTo(X(-HW - 3, 40), Y(40)); x.moveTo(X(HW + 3, 2), Y(2)); x.lineTo(X(HW + 3, 40), Y(40)); x.stroke(); x.restore(); } });
    L.push(() => tag("WATCH THE EDGES", 540, 640, VIOLET, sm(E - 0.1, E + 0.2, u) * (1 - sm(Ey, Ey + 0.2, u))));
    L.push(() => tag("EYES", 260, 1000, GREEN, sm(Ey - 0.1, Ey + 0.2, u)));
    L.push(() => tag("SLOW DOWN EARLY", 700, 1180, GREEN, sm(Sl - 0.1, Sl + 0.2, u)));
  }
  if (id === "s7" || id === "s8") {
    off = u * 8 + (id === "s8" ? 20 : 0); speed = 0.35;
    road(off, lit, hi); bracket(17, GREEN, 0.7, "");
  }
  void GT;
  L.forEach((f) => f());
  cockpit(speed, hi, brake);
  x.restore();

  if (id === "s1") words(["NEVER OUTRIDE", "YOUR LIGHTS"], RED, 320, 0.0, 1, 160, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "faster"))));
  if (id === "s2") words(["DAYTIME SPEED", "IN THE DARK"], RED, 320, 0.0, 1, 150, flash(u, at("s2", "daytime")) * 0.6);
  if (id === "s3") words(["YOU CAN'T", "STOP IN TIME"], RED, 320, 0.0, 1, 160, flash(u, at("s3", "time")) * 0.6);
  if (id === "s4") words(["STOP INSIDE", "THE LIT ROAD"], GREEN, 320, 0.0, 1, 160, flash(u, at("s4", "lit")) * 0.6);
  if (id === "s5") words(["HIGH BEAM", "WHEN IT'S EMPTY"], GREEN, 320, 0.0, 1, 150, flash(u, at("s5", "high")) * 0.6);
  if (id === "s6") words(["WATCH FOR", "EYES"], GREEN, 320, 0.0, 1, 170, flash(u, at("s6", "eyes")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(4,6,12,0.72)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["STOP INSIDE", "YOUR LIGHT."], ORANGE, 560, 0.0, 1, 160, flash(u, 0.05));
    words(["SLOW DOWN", "AT NIGHT."], ORANGE, 930, at("s7", "slow") - 0.05, 1, 160, flash(u, at("s7", "slow")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(4,6,12,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const kk = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(kk, kk);
    const g = x.createRadialGradient(0, 0, 10, 0, 0, 170); g.addColorStop(0, "rgba(255,236,190,0.9)"); g.addColorStop(1, "rgba(255,236,190,0)");
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, 170, 0, Math.PI * 2); x.fill();
    x.strokeStyle = AMBER; x.lineWidth = 8; x.beginPath(); x.arc(0, 0, 90, 0, Math.PI * 2); x.stroke();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["outride-headlight-night-pov"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
