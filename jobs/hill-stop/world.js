// hill-stop (Apex 21, TikTok) - PAPER CUT-OUT style: layered paper hills with drop shadows, flat cut shapes, side view
// of a bike stopped on a steep uphill (facing right, so we see its right side: throttle hand and rear brake foot).
// Wrong: holds the hill on the front lever, lets go to twist the throttle, the bike rolls back, stalls and drops.
// Right: right foot holds the rear brake, left foot down, right hand free for the throttle; find the clutch bite,
// add throttle, ease off the rear brake and pull away uphill. Time only from hf-seek.
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
const RED = "#e83a3a", GREEN = "#1fae5b", VIOLET = "#7a5ae0", ORANGE = "#ff8a1a", WHITE = "#ffffff", INK = "#2a1a2e", AMBER = "#f2a516";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B2 = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B2[i], k))).join(",")})`; }
const paperShadow = (on = true) => { x.shadowColor = on ? "rgba(42,26,46,0.28)" : "transparent"; x.shadowOffsetX = on ? 7 : 0; x.shadowOffsetY = on ? 9 : 0; x.shadowBlur = on ? 4 : 0; };

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
      x.lineWidth = Math.max(14, px * 0.2); x.strokeStyle = WHITE; paperShadow(); x.strokeText(p, 0, 0); paperShadow(false);
      x.lineWidth = Math.max(8, px * 0.08); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
// paper label: a cut card with a white border and a shadow
function tag(txt, X, Y, color, a, px = 48) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = Math.min(1, a * 1.5); x.font = FONT(px); x.textAlign = "center"; x.textBaseline = "middle";
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 70 + w / 2, 930 - w / 2); Y = cl(Y, 520, 1360);
  x.translate(X, Y); x.rotate(-0.03); x.scale(s, s);
  paperShadow(); x.fillStyle = WHITE; rr(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 10); x.fill(); paperShadow(false);
  x.fillStyle = color; rr(-w / 2, -h / 2, w, h, 8); x.fill();
  x.fillStyle = WHITE; x.fillText(txt, 0, 3); x.restore();
}
function mark(kind, X, Y, s, a, c) {
  if (a <= 0 || s <= 0) return;
  X = cl(X, 120, 880); Y = cl(Y, 560, 1300);
  x.save(); x.globalAlpha = a; x.translate(X, Y); x.scale(s, s); x.lineCap = "round";
  paperShadow(); x.fillStyle = WHITE; x.beginPath(); x.arc(0, 0, 88, 0, Math.PI * 2); x.fill(); paperShadow(false);
  x.fillStyle = c; x.beginPath(); x.arc(0, 0, 76, 0, Math.PI * 2); x.fill();
  x.strokeStyle = WHITE; x.lineWidth = 20; x.beginPath();
  if (kind === "x") { x.moveTo(-32, -32); x.lineTo(32, 32); x.moveTo(32, -32); x.lineTo(-32, 32); } else { x.moveTo(-36, 4); x.lineTo(-10, 30); x.lineTo(38, -26); }
  x.stroke(); x.restore();
}

// ---------- paper world ----------
const SL = 0.24, G0 = 1170;                         // slope (rad), ground y at x=540
const gy = (X) => G0 - Math.tan(SL) * (X - 540);
function layer(color, base, amp, freq, ph) {
  paperShadow(); x.fillStyle = color; x.beginPath(); x.moveTo(-200, 2000);
  for (let i = -200; i <= 1280; i += 20) x.lineTo(i, base - amp * (0.6 * Math.sin(i * freq + ph) + 0.4 * Math.sin(i * freq * 2.3 + ph * 1.7)));
  x.lineTo(1280, 2000); x.closePath(); x.fill(); paperShadow(false);
}
function scenery(t) {
  const g = x.createLinearGradient(0, 0, 0, 1200); g.addColorStop(0, "#ffe9cf"); g.addColorStop(1, "#ffd3a8");
  x.fillStyle = g; x.fillRect(-200, -200, 1480, 2400);
  paperShadow(); x.fillStyle = "#ffb347"; x.beginPath(); x.arc(840, 560, 80, 0, Math.PI * 2); x.fill(); paperShadow(false);
  layer("#f7b58a", 780, 70, 0.006, 0.4);
  layer("#ec8e6e", 880, 60, 0.009, 2.1);
  // road (the steep hill), a paper strip
  paperShadow(); x.fillStyle = "#5a5470"; x.beginPath(); x.moveTo(-200, gy(-200)); x.lineTo(1280, gy(1280)); x.lineTo(1280, 2000); x.lineTo(-200, 2000); x.closePath(); x.fill(); paperShadow(false);
  x.fillStyle = "#7a7392"; x.beginPath(); x.moveTo(-200, gy(-200) + 40); x.lineTo(1280, gy(1280) + 40); x.lineTo(1280, 2000); x.lineTo(-200, 2000); x.closePath(); x.fill();
  x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 8; x.setLineDash([46, 34]);
  x.beginPath(); x.moveTo(-200, gy(-200) + 22); x.lineTo(1280, gy(1280) + 22); x.stroke(); x.setLineDash([]);
  // slope sign
  paperShadow(); x.fillStyle = "#ffd23d"; x.save(); x.translate(180, gy(180) - 260); x.rotate(Math.PI / 4); x.fillRect(-60, -60, 120, 120); x.restore(); paperShadow(false);
  x.fillStyle = "#4a3a20"; x.fillRect(176, gy(180) - 200, 8, 200);
  x.save(); x.translate(180, gy(180) - 260); x.fillStyle = INK; x.beginPath(); x.moveTo(-36, 26); x.lineTo(36, 26); x.lineTo(36, -26); x.closePath(); x.fill(); x.restore();
}
// side view bike + rider on the slope. p = x position of the bike centre; spin = wheel angle; o = poses / highlights
function bike(p, c, o = {}) {
  const { spin = 0, tip = 0, front = 0, rear = 0, thr = 0, clutch = 0, rfoot = "peg", lfoot = 1, alpha = 1 } = o;
  x.save(); x.globalAlpha = alpha; x.translate(p, gy(p)); x.rotate(-SL); x.scale(1, 1 - 0.62 * cl(tip)); x.lineCap = "round"; x.lineJoin = "round";
  const hl = (X, Y, col, k) => { if (k <= 0) return; x.save(); x.globalAlpha = alpha * k; x.fillStyle = col; x.shadowColor = col; x.shadowBlur = 30; x.beginPath(); x.arc(X, Y, 26, 0, Math.PI * 2); x.fill(); x.restore(); };
  // far-side (left) leg, darker, behind the bike
  if (lfoot > 0) { x.strokeStyle = "#2c3550"; x.lineWidth = 34; x.beginPath(); x.moveTo(-20, -165); x.lineTo(-5, -90); x.lineTo(-30, -6); x.stroke(); x.fillStyle = "#1e1e24"; rr(-62, -22, 66, 24, 10); x.fill(); }
  // wheels
  for (const wx of [-140, 140]) {
    paperShadow(); x.fillStyle = "#25222c"; x.beginPath(); x.arc(wx, -72, 72, 0, Math.PI * 2); x.fill(); paperShadow(false);
    x.fillStyle = "#cfc8d8"; x.beginPath(); x.arc(wx, -72, 34, 0, Math.PI * 2); x.fill();
    x.save(); x.translate(wx, -72); x.rotate(spin); x.strokeStyle = "#25222c"; x.lineWidth = 7; x.beginPath(); for (let i = 0; i < 3; i++) { const g = i * 2.094; x.moveTo(0, 0); x.lineTo(Math.cos(g) * 34, Math.sin(g) * 34); } x.stroke(); x.restore();
  }
  // body
  paperShadow(); x.fillStyle = c;
  x.beginPath(); x.moveTo(-150, -150); x.lineTo(-40, -175); x.lineTo(70, -215); x.lineTo(130, -200); x.lineTo(110, -120); x.lineTo(-20, -95); x.lineTo(-120, -110); x.closePath(); x.fill();
  x.fillStyle = "#2a2433"; x.beginPath(); x.moveTo(-160, -160); x.lineTo(-20, -180); x.lineTo(-10, -158); x.lineTo(-150, -142); x.closePath(); x.fill();   // seat
  x.fillStyle = "#8b8597"; rr(-170, -110, 120, 22, 10); x.fill();                                                                               // exhaust
  paperShadow(false);
  x.strokeStyle = "#3a3346"; x.lineWidth = 12; x.beginPath(); x.moveTo(140, -72); x.lineTo(100, -230); x.stroke();                             // fork
  x.lineWidth = 10; x.beginPath(); x.moveTo(96, -236); x.lineTo(70, -262); x.stroke();                                                         // bar
  // rider: torso, head (helmet), arm to the grip
  x.strokeStyle = "#3f6fc9"; x.lineWidth = 50; x.beginPath(); x.moveTo(-40, -185); x.lineTo(0, -300); x.stroke();
  paperShadow(); x.fillStyle = "#2a2433"; x.beginPath(); x.arc(14, -350, 44, 0, Math.PI * 2); x.fill(); paperShadow(false);
  x.fillStyle = "#9fd0ff"; x.beginPath(); x.arc(36, -350, 20, -0.9, 0.9); x.fill();
  x.strokeStyle = "#3f6fc9"; x.lineWidth = 28; x.beginPath(); x.moveTo(0, -290); x.lineTo(40, -240); x.lineTo(74, -258); x.stroke();
  // near (right) leg: on the rear brake pedal, or down on the road
  x.strokeStyle = "#34406a"; x.lineWidth = 36; x.beginPath(); x.moveTo(-40, -180);
  if (rfoot === "peg") { x.lineTo(20, -130); x.lineTo(-10, -70); } else { x.lineTo(10, -110); x.lineTo(-50, -8); }
  x.stroke(); x.fillStyle = "#1e1e24";
  if (rfoot === "peg") { rr(-40, -78, 66, 24, 10); x.fill(); } else { rr(-82, -24, 66, 24, 10); x.fill(); }
  // brake pedal + front lever + clutch hints
  x.strokeStyle = "#3a3346"; x.lineWidth = 8; x.beginPath(); x.moveTo(-10, -60); x.lineTo(30, -66); x.stroke();
  hl(78, -262, RED, front); hl(74, -258, GREEN, thr); hl(20, -64, GREEN, rear); hl(64, -276, VIOLET, clutch);
  x.restore();
}
const P0 = 560;

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  const z = 1 + 0.04 * cl(u / Math.max(1, d)) + 0.05 * Math.pow(1 - sm(-LEAD, 0.22 - LEAD, u), 2);
  x.save(); x.translate(540, 950); x.scale(z, z); x.translate(-540, -950);
  scenery(t);
  const L = [];

  if (id === "s1") {
    bike(P0, RED, { front: sm(at("s1", "front") - 0.1, at("s1", "front") + 0.1, u), rfoot: "down" });
    L.push(() => tag("STEEP HILL", 230, 640, AMBER, sm(at("s1", "steep") - 0.1, at("s1", "steep") + 0.2, u)));
    L.push(() => tag("FRONT BRAKE", 780, 700, RED, sm(at("s1", "front") - 0.1, at("s1", "front") + 0.2, u)));
  }
  if (id === "s2") {
    const Fr = at("s2", "front"), Go = at("s2", "go"), Tw = at("s2", "twist");
    const off = sm(Go - 0.05, Go + 0.1, u);
    bike(P0 - 30 * sm(Go, d + 0.5, u), RED, { front: (1 - off) * sm(Fr - 0.2, Fr, u), thr: sm(Tw - 0.1, Tw + 0.1, u), rfoot: "down", spin: 0.4 * sm(Go, d + 0.5, u) });
    L.push(() => tag("FRONT LEVER", 780, 700, RED, sm(Fr - 0.1, Fr + 0.2, u) * (1 - off)));
    L.push(() => tag("LET GO", 780, 700, RED, off));
    L.push(() => tag("THROTTLE", 780, 590, AMBER, sm(Tw - 0.1, Tw + 0.2, u)));
  }
  if (id === "s3") {
    const Ro = at("s3", "rolls"), St = at("s3", "stall"), Dr = at("s3", "drop");
    const roll = sm(-0.3, St + 0.2, u);
    const p = P0 - 30 - 180 * roll;
    bike(p, RED, { spin: 0.4 + 180 * roll / 72, rfoot: "down", tip: Math.pow(sm(Dr - 0.1, Dr + 0.5, u), 1.5), lfoot: 1 - sm(Dr, Dr + 0.2, u) });
    L.push(() => { const a = sm(Ro - 0.2, Ro + 0.1, u) * (1 - sm(St, St + 0.3, u)); if (a <= 0) return; x.save(); x.globalAlpha = a; x.strokeStyle = RED; x.lineWidth = 16; x.lineCap = "round";
      const ax = p - 220, ay = gy(ax) - 60; x.beginPath(); x.moveTo(ax + 140, ay - 140 * Math.tan(SL)); x.lineTo(ax, ay); x.lineTo(ax + 40, ay - 40); x.moveTo(ax, ay); x.lineTo(ax + 50, ay + 14); x.stroke(); x.restore(); });
    L.push(() => tag("ROLLS BACK", 280, 640, RED, sm(Ro - 0.1, Ro + 0.2, u)));
    L.push(() => tag("STALLS", 780, 640, RED, sm(St - 0.1, St + 0.2, u)));
    L.push(() => mark("x", 780, 860, back(Dr + 0.1, Dr + 0.4, u) * 0.6, u > Dr ? 1 : 0, RED));
  }
  if (id === "s4") {
    const Re = at("s4", "rear"), Ri = at("s4", "right");
    bike(P0, VIOLET, { rear: sm(Re - 0.1, Re + 0.1, u) });
    L.push(() => tag("REAR BRAKE", 280, 640, GREEN, sm(Re - 0.1, Re + 0.2, u)));
    L.push(() => tag("RIGHT FOOT", 780, 640, GREEN, sm(Ri - 0.1, Ri + 0.2, u)));
  }
  if (id === "s5") {
    const Le = at("s5", "left"), Fr = at("s5", "free"), Th = at("s5", "throttle");
    bike(P0, VIOLET, { rear: 1, thr: sm(Fr - 0.1, Fr + 0.1, u) });
    L.push(() => tag("LEFT FOOT DOWN", 300, 760,VIOLET, sm(Le - 0.1, Le + 0.2, u)));
    L.push(() => tag("HAND FREE", 780, 620, GREEN, sm(Fr - 0.1, Fr + 0.2, u)));
    L.push(() => tag("THROTTLE", 780, 760, GREEN, sm(Th - 0.1, Th + 0.2, u)));
  }
  if (id === "s6") {
    const Cl = at("s6", "clutch"), Ad = at("s6", "add"), Ea = at("s6", "ease");
    const go = sm(Ea + 0.1, d + 0.4, u);
    bike(P0 + 200 * go, VIOLET, { clutch: sm(Cl - 0.1, Cl + 0.1, u), thr: sm(Ad - 0.1, Ad + 0.1, u), rear: 1 - sm(Ea, Ea + 0.3, u), spin: -200 * go / 72, lfoot: 1 - sm(Ea + 0.2, Ea + 0.4, u) });
    L.push(() => tag("1 CLUTCH BITE", 300, 600, VIOLET, sm(Cl - 0.1, Cl + 0.2, u)));
    L.push(() => tag("2 THROTTLE", 300, 720, GREEN, sm(Ad - 0.1, Ad + 0.2, u)));
    L.push(() => tag("3 EASE OFF REAR", 300, 840, GREEN, sm(Ea - 0.1, Ea + 0.2, u)));
  }
  if (id === "s7" || id === "s8") bike(P0, VIOLET, { rear: 0.6 });
  L.forEach((f) => f());
  x.restore();

  if (id === "s1") words(["NEVER HOLD A HILL", "ON THE FRONT"], RED, 320, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "front"))));
  if (id === "s2") words(["LET GO TO", "TWIST THE THROTTLE"], RED, 320, 0.0, 1, 150, flash(u, at("s2", "go")) * 0.6);
  if (id === "s3") words(["IT ROLLS", "BACK"], RED, 320, 0.0, 1, 170, flash(u, at("s3", "rolls")) * 0.6);
  if (id === "s4") words(["HOLD IT ON", "THE REAR BRAKE"], GREEN, 320, 0.0, 1, 150, flash(u, at("s4", "rear")) * 0.6);
  if (id === "s5") words(["RIGHT HAND", "FREE"], GREEN, 320, 0.0, 1, 170, flash(u, at("s5", "free")) * 0.6);
  if (id === "s6") words(["BITE, THROTTLE,", "THEN EASE OFF"], GREEN, 320, 0.0, 1, 150, flash(u, at("s6", "ease")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(42,26,46,0.6)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["HOLD HILLS ON", "THE REAR BRAKE."], ORANGE, 560, 0.0, 1, 150, flash(u, 0.05));
    words(["RIGHT HAND", "FREE."], ORANGE, 930, at("s7", "right") - 0.05, 1, 170, flash(u, at("s7", "right")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(42,26,46,0.82)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    const k = Math.max(0.01, back(0.0, 0.35, u));
    x.save(); x.translate(CX, 560); x.scale(k, k);
    paperShadow(); x.fillStyle = "#ffd3a8"; x.beginPath(); x.arc(0, 0, 150, 0, Math.PI * 2); x.fill(); paperShadow(false);
    x.fillStyle = "#ec8e6e"; x.beginPath(); x.moveTo(-150, 40); x.lineTo(-40, -60); x.lineTo(30, 10); x.lineTo(90, -40); x.lineTo(150, 40); x.arc(0, 0, 150, 0.27, Math.PI - 0.27); x.closePath(); x.fill();
    x.restore();
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], RED, 985, 0.3, 1, 150);
    if (BRAND.sub) tag(BRAND.sub, CX, 1150, GREEN, sm(0.5, 0.75, u), 46);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["hill-stop-paper-cut"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
