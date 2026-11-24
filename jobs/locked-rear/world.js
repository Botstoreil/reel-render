// locked-rear (Apex 19, TikTok) - X-RAY style: glowing translucent cyan/white scan of a bike from above on a black
// scan grid, an inset "wheel scan" that shows the rear wheel locked (red, still) or rolling (green, spinning).
// Wrong: rear locks in a hard stop, the back slides out, the rider releases the brake, the tyre grips at once and the
// bike is thrown over. Right: going straight, keep the rear locked until stopped; keep squeezing the front, eyes up,
// bars straight; better still, press the rear gently so it never locks. Time only from hf-seek.
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
const RED = "#ff4058", GREEN = "#40ff9a", VIOLET = "#b49bff", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#000814", CYAN = "#7fe8ff";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const MONO = (px) => `700 ${px}px "JetBrains Mono", "Courier New", monospace`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B2 = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }
const glow = (c, b = 18) => { x.shadowColor = c; x.shadowBlur = b; };

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
      glow(color, 18 + 26 * flashK);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// scan readout label: bracket corners, mono text
function tag(txt, X, Y, color, a, px = 50) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = MONO(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1360);
  x.translate(X, Y); x.scale(s, s);
  x.fillStyle = "rgba(0,10,24,0.88)"; x.fillRect(-w / 2, -h / 2, w, h);
  glow(color, 14); x.strokeStyle = color; x.lineWidth = 5;
  const c = 18; x.beginPath();
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { x.moveTo(sx * w / 2, sy * (h / 2 - c)); x.lineTo(sx * w / 2, sy * h / 2); x.lineTo(sx * (w / 2 - c), sy * h / 2); }
  x.stroke(); x.fillStyle = color; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  x.fillStyle = "rgba(0,10,24,0.95)"; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.fill();
  glow(c, 24); x.strokeStyle = c; x.lineWidth = 9; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- the scan ----------
const RL = 290, RR = 790, FX = 540, FY = 830, BS = 1.7;   // road edges, front wheel position on screen, bike scale
function scanBg(t, scroll) {
  x.fillStyle = "#020812"; x.fillRect(-200, -200, 1480, 2400);
  x.lineWidth = 1;
  for (let i = -200; i < 1300; i += 60) { x.strokeStyle = "rgba(127,232,255,0.07)"; x.beginPath(); x.moveTo(i, -200); x.lineTo(i, 2200); x.stroke(); }
  for (let j = -200 + (scroll % 60); j < 2200; j += 60) { x.strokeStyle = "rgba(127,232,255,0.07)"; x.beginPath(); x.moveTo(-200, j); x.lineTo(1300, j); x.stroke(); }
  x.save(); glow(CYAN, 14); x.strokeStyle = "rgba(127,232,255,0.7)"; x.lineWidth = 4;
  x.beginPath(); x.moveTo(RL, -200); x.lineTo(RL, 2200); x.moveTo(RR, -200); x.lineTo(RR, 2200); x.stroke();
  x.setLineDash([50, 50]); x.lineDashOffset = -scroll; x.strokeStyle = "rgba(127,232,255,0.35)"; x.beginPath(); x.moveTo(540, -200); x.lineTo(540, 2200); x.stroke(); x.setLineDash([]);
  x.restore();
  // scan bar
  const sy = 300 + ((t * 420) % 1300);
  const g = x.createLinearGradient(0, sy - 60, 0, sy); g.addColorStop(0, "rgba(127,232,255,0)"); g.addColorStop(1, "rgba(127,232,255,0.10)");
  x.fillStyle = g; x.fillRect(-200, sy - 60, 1480, 60);
}
// bike from above, translucent x-ray. yaw rotates the bike around its front wheel. rear/front: 0 rolling, 1 locked/braking
function bike(yaw, c, o = {}) {
  const { rear = 0, front = 0, a = 1 } = o;
  x.save(); x.globalAlpha = a; x.translate(FX, FY); x.scale(BS, BS); x.rotate(-Math.PI / 2 + yaw); x.translate(-82, 0);
  x.lineCap = "round"; x.lineJoin = "round";
  const wheel = (X, k, col) => { x.save(); glow(col, 24); x.fillStyle = mix("#0a2a3a", col, 0.35 + 0.4 * k); x.strokeStyle = col; x.lineWidth = 5; rr(X - 44, -15, 88, 30, 14); x.fill(); x.stroke(); x.restore(); };
  wheel(-92, rear, rear > 0.5 ? RED : GREEN);
  wheel(82, front, front > 0.5 ? GREEN : CYAN);
  x.save(); glow(c, 20); x.strokeStyle = c; x.fillStyle = "rgba(127,232,255,0.10)"; x.lineWidth = 5;
  x.beginPath(); x.ellipse(-8, 0, 62, 26, 0, 0, Math.PI * 2); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(-60, 0); x.lineTo(82, 0); x.stroke();                  // frame spine
  x.beginPath(); x.moveTo(40, -52); x.lineTo(40, 52); x.stroke();                // bars
  x.fillStyle = "rgba(255,255,255,0.18)"; x.beginPath(); x.arc(-22, 0, 22, 0, Math.PI * 2); x.fill(); x.stroke();   // rider helmet
  x.beginPath(); x.moveTo(-22, -20); x.lineTo(30, -46); x.moveTo(-22, 20); x.lineTo(30, 46); x.stroke();            // arms
  x.restore(); x.restore();
}
function rearPos(yaw) { const ang = -Math.PI / 2 + yaw; return [FX - Math.cos(ang) * 174 * BS, FY - Math.sin(ang) * 174 * BS]; }
function skid(yaw, len, color, a) {
  if (a <= 0 || len <= 2) return;
  const [rx, ry] = rearPos(yaw);
  x.save(); x.globalAlpha = a; glow(color, 12); x.strokeStyle = color; x.lineWidth = 18; x.lineCap = "round";
  x.beginPath(); x.moveTo(rx, ry); x.quadraticCurveTo(rx, ry + len * 0.5, FX, ry + len); x.stroke(); x.restore();
}
// inset wheel scan
function wheelScan(X, Y, spin, locked, a, label) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y);
  const col = locked ? RED : GREEN;
  x.fillStyle = "rgba(0,10,24,0.92)"; x.beginPath(); x.arc(0, 0, 112, 0, Math.PI * 2); x.fill();
  glow(col, 22); x.strokeStyle = col; x.lineWidth = 14; x.beginPath(); x.arc(0, 0, 92, 0, Math.PI * 2); x.stroke();
  x.lineWidth = 5; x.beginPath(); x.arc(0, 0, 50, 0, Math.PI * 2); x.stroke();
  x.save(); x.rotate(spin); x.lineWidth = 6; x.beginPath();
  for (let i = 0; i < 5; i++) { const g = (i / 5) * Math.PI * 2; x.moveTo(Math.cos(g) * 18, Math.sin(g) * 18); x.lineTo(Math.cos(g) * 84, Math.sin(g) * 84); }
  x.stroke(); x.restore();
  if (locked) { x.fillStyle = col; x.beginPath(); x.arc(0, -50, 14, 0, Math.PI * 2); x.fill(); }
  x.font = MONO(36); x.textAlign = "center"; x.fillStyle = col;
  const lw = x.measureText(label).width, lx = Math.min(0, 930 - X - lw / 2);
  if (label) { x.fillStyle = "rgba(0,10,24,0.88)"; x.fillRect(lx - lw / 2 - 12, 136, lw + 24, 50); x.fillStyle = col; }
  x.fillText(label, lx, 172);
  x.restore();
}
// brake pressure gauge (s6)
function gauge(X, Y, k, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = a; x.translate(X, Y);
  x.fillStyle = "rgba(0,10,24,0.92)"; x.fillRect(-60, -230, 120, 460);
  glow(CYAN, 10); x.strokeStyle = CYAN; x.lineWidth = 4; x.strokeRect(-60, -230, 120, 460);
  x.fillStyle = "rgba(255,64,88,0.35)"; x.fillRect(-56, -226, 112, 110);
  glow(RED, 10); x.strokeStyle = RED; x.lineWidth = 5; x.beginPath(); x.moveTo(-70, -116); x.lineTo(70, -116); x.stroke();
  x.font = MONO(28); x.textAlign = "center"; x.fillStyle = RED; x.fillText("LOCK", 0, -160);
  glow(GREEN, 18); x.fillStyle = GREEN; const hgt = 330 * k; x.fillRect(-46, 220 - hgt, 92, hgt);
  x.restore();
}
// distance covered for a ride at speed V that brakes from u0 and stops at u1
const travel = (u, V, u0, u1) => u < u0 ? V * u : V * u0 + V * (Math.min(u, u1) - u0) - (V / (2 * (u1 - u0))) * Math.pow(Math.min(u, u1) - u0, 2);

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 900); x.scale(z, z); x.translate(-540, -900);
  const L = [];
  let scroll = 0;

  if (id === "s1") {
    const Lk = at("s1", "locks");
    scroll = travel(u, 900, Lk - 0.2, d + 3);
    scanBg(t, scroll);
    const lk = u > Lk ? 1 : 0;
    skid(0, lk * (scroll - travel(Lk, 900, Lk - 0.2, d + 3)), RED, 0.8);
    bike(0, CYAN, { rear: lk });
    L.push(() => wheelScan(820, 640, lk ? 0 : u * 12, lk, sm(Lk - 0.3, Lk, u), lk ? "REAR LOCKED" : "REAR"));
    L.push(() => tag("SOUNDS WRONG", 300, 1180, ORANGE, sm(at("s1", "sounds") - 0.1, at("s1", "sounds") + 0.2, u)));
  }
  if (id === "s2") {
    const R = at("s2", "release"), Sl = at("s2", "slides");
    scroll = travel(u + 3, 900, 0, 6);
    scanBg(t, scroll);
    const yaw = 0.55 * sm(0, Sl + 0.3, u);
    skid(yaw, 380, RED, 0.8 * (1 - sm(R, R + 0.3, u) * 0.5));
    bike(yaw, RED, { rear: u < R ? 1 : 0 });
    L.push(() => wheelScan(820, 640, u < R ? 0 : (u - R) * 14, u < R, 1, u < R ? "REAR LOCKED" : "BRAKE RELEASED"));
    L.push(() => tag("SLIDING", 300, 1180, RED, sm(Sl - 0.1, Sl + 0.2, u)));
  }
  if (id === "s3") {
    const G = at("s3", "grips"), Th = at("s3", "throw");
    scroll = travel(u + 3.3, 900, 0, 6);
    scanBg(t, scroll);
    const snap = sm(G - 0.1, G + 0.25, u), tumble = sm(Th - 0.2, Th + 0.6, u);
    const yaw = lerp(0.55, -0.35, snap);
    skid(yaw, 300, RED, 0.6 * (1 - snap));
    x.save(); x.translate(FX - 80, FY + 90); x.rotate(2.6 * tumble); x.translate(-(FX - 80) + 260 * tumble, -(FY + 90) + 120 * tumble);
    bike(yaw, RED, { a: 1 });
    x.restore();
    L.push(() => wheelScan(820, 640, u * 14, false, 1 - sm(Th, Th + 0.3, u), "GRIPS AT ONCE"));
    L.push(() => tag("THROWN OVER", 300, 640, RED, sm(Th - 0.1, Th + 0.2, u)));
    L.push(() => mark("x", 300, 820, back(Th + 0.2, Th + 0.5, u) * 0.6, u > Th + 0.15 ? 1 : 0, RED));
    L.push(() => { x.save(); x.globalAlpha = 0.3 * flash(u, G + 0.05); x.fillStyle = RED; x.fillRect(-200, -200, 1480, 2400); x.restore(); });
  }
  if (id === "s4") {
    const Gs = at("s4", "going"), K = at("s4", "keep"), Sp = at("s4", "stop");
    scroll = travel(u, 900, -0.3, Sp + 0.2);
    scanBg(t, scroll);
    skid(0, cl(scroll * 0.5, 0, 520), RED, 0.7);
    bike(0, VIOLET, { rear: 1 });
    L.push(() => wheelScan(820, 640, 0, true, 1, "KEEP IT LOCKED"));
    L.push(() => tag("GOING STRAIGHT", 290, 1180, VIOLET, sm(Gs - 0.1, Gs + 0.2, u)));
    L.push(() => tag("STOPPED", 290, 640, GREEN, sm(Sp + 0.1, Sp + 0.3, u)));
    L.push(() => mark("v", 290, 860, back(Sp + 0.15, Sp + 0.45, u) * 0.5, u > Sp + 0.1 ? 1 : 0, GREEN));
    void K;
  }
  if (id === "s5") {
    const F = at("s5", "front"), Lo = at("s5", "look"), B = at("s5", "bars");
    scroll = travel(u, 700, -0.5, d + 0.2);
    scanBg(t, scroll);
    skid(0, cl(scroll * 0.5, 0, 480), RED, 0.6);
    // eyes up: a cone ahead of the bike
    const la = sm(Lo - 0.1, Lo + 0.2, u);
    if (la > 0) { x.save(); x.globalAlpha = 0.35 * la; const g = x.createLinearGradient(0, FY - 120, 0, FY - 560); g.addColorStop(0, GREEN); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(FX, FY - 110); x.lineTo(FX - 150, FY - 560); x.lineTo(FX + 150, FY - 560); x.closePath(); x.fill(); x.restore(); }
    bike(0, VIOLET, { rear: 1, front: sm(F - 0.1, F + 0.1, u) });
    L.push(() => tag("FRONT BRAKE", 290, 640, GREEN, sm(F - 0.1, F + 0.2, u)));
    L.push(() => tag("EYES UP", 800, 640, GREEN, sm(Lo - 0.1, Lo + 0.2, u)));
    L.push(() => tag("BARS STRAIGHT", 290, 1180, VIOLET, sm(B - 0.1, B + 0.2, u)));
  }
  if (id === "s6") {
    const P = at("s6", "press"), Ge = at("s6", "gently"), N = at("s6", "never");
    scroll = travel(u, 900, P, d + 1.5);
    scanBg(t, scroll);
    bike(0, VIOLET, { front: 1 });
    const k = 0.62 * sm(P - 0.1, Ge + 0.4, u) + 0.04 * Math.sin(u * 9) * sm(Ge, Ge + 0.3, u);
    L.push(() => gauge(820, 900, k, 1));
    L.push(() => wheelScan(300, 640, u * 12, false, 1, "STILL ROLLING"));
    L.push(() => tag("GENTLE", 300, 1180, GREEN, sm(Ge - 0.1, Ge + 0.2, u)));
    L.push(() => mark("v", 820, 560, back(N, N + 0.3, u) * 0.5, u > N - 0.05 ? 1 : 0, GREEN));
  }
  if (id === "s7" || id === "s8") {
    scanBg(t, 0); skid(0, 420, RED, 0.5); bike(0, VIOLET, { rear: 1 });
  }
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER LET GO OF", "A LOCKED REAR"], RED, 320, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "brake"))));
  if (id === "s2") words(["YOU LET", "THE BRAKE GO"], RED, 320, 0.0, 1, 160, flash(u, at("s2", "release")) * 0.6);
  if (id === "s3") words(["IT GRIPS AT ONCE", "AND THROWS YOU"], RED, 320, 0.0, 1, 150, flash(u, at("s3", "throw")) * 0.6);
  if (id === "s4") words(["GOING STRAIGHT?", "KEEP IT LOCKED"], GREEN, 320, 0.0, 1, 150, flash(u, at("s4", "keep")) * 0.6);
  if (id === "s5") words(["FRONT ON,", "EYES UP"], GREEN, 320, 0.0, 1, 160, flash(u, at("s5", "front")) * 0.6);
  if (id === "s6") words(["BETTER: PRESS", "IT GENTLY"], GREEN, 320, 0.0, 1, 150, flash(u, at("s6", "gently")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(0,8,20,0.74)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["REAR LOCKED,", "GOING STRAIGHT?"], ORANGE, 560, 0.0, 1, 150, flash(u, 0.05));
    words(["KEEP IT", "LOCKED."], ORANGE, 930, at("s7", "keep") - 0.05, 1, 170, flash(u, at("s7", "keep")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(0,8,20,0.86)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.scale(1, 1); x.globalAlpha = cl(k);
    wheelScan(CX, 560, u * 6, false, 1, "");
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["locked-rear-xray"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
