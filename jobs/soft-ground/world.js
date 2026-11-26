// soft-ground (Apex 33, TikTok) - INK SKETCH style: cream paper, a black ink pen line that "boils" at 8 fps,
// watercolour washes for red/green. The bike is drawn FROM BEHIND so its lean on the side stand reads.
// Wrong: parked on grass / hot tar, rider walks away, the stand sinks slowly and the bike tips over.
// Right: firm flat ground; or a flat plate / can lid under the stand; leave it in gear, check it is steady, walk away.
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
const rnd = (i) => { const v = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
const sceneOf = (t) => { let id = IDS[0]; for (const k of IDS) if (t >= S[k][0]) id = k; return { id, u: t - S[id][0] - LEAD, d: S[id][1] }; };
const on = (id, w, u, a = 0.1, b = 0.2, n = 1) => sm(at(id, w, n) - a, at(id, w, n) + b, u);

const cv = document.getElementById("world");
const x = cv.getContext("2d");
const PAPER = "#f3ead8", INK = "#1d1a16", RED = "#d32f3c", GREEN = "#1e8f4e", ORANGE = "#e2700c", WHITE = "#ffffff", GREY = "#8a8174";
const CX = 510;
const FONT = (px) => `900 ${px}px Inter, Arial, sans-serif`;
const hx = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a, b, k) { const A = hx(a), B = hx(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; }
const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };
function rr(X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }

let curU = 0, BOIL = 0;
// a hand-drawn line: two slightly offset passes that change 8 times a second
function pen(pts, c = INK, w = 7, closed = false) {
  for (let pass = 0; pass < 2; pass++) {
    x.save(); x.strokeStyle = c; x.lineWidth = pass ? w * 0.45 : w; x.lineCap = "round"; x.lineJoin = "round"; x.globalAlpha = pass ? 0.55 : 1;
    x.beginPath();
    pts.forEach((p, i) => { const j = (BOIL * 31 + i * 7 + pass * 13); const dx = (rnd(j) - 0.5) * 4, dy = (rnd(j + 1) - 0.5) * 4; i ? x.lineTo(p[0] + dx, p[1] + dy) : x.moveTo(p[0] + dx, p[1] + dy); });
    if (closed) x.closePath();
    x.stroke(); x.restore();
  }
}
function penCircle(X, Y, r, c = INK, w = 7) { const p = []; for (let i = 0; i <= 18; i++) { const a = (i / 18) * Math.PI * 2; p.push([X + Math.cos(a) * r, Y + Math.sin(a) * r]); } pen(p, c, w); }
function wash(f, c, a = 0.35) { x.save(); x.fillStyle = rgba(c, a); f(); x.fill(); x.restore(); }

// ---------- text ----------
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
      x.save(); x.translate(X + ws[i] / 2, Y + (1 - kk) * 30); x.rotate((((wi + li * 3) * 7919) % 13 - 6) * 0.006); x.scale(0.5 + 0.5 * kk, 0.5 + 0.5 * kk); x.globalAlpha = a * o;
      x.lineWidth = Math.max(10, px * 0.12); x.strokeStyle = INK; x.strokeText(p, 0, 0);
      x.fillStyle = flashK > 0.05 ? mix(color, WHITE, flashK * 0.5) : color; x.fillText(p, 0, 0);
      x.restore();
      X += ws[i] + sp; wi++;
    });
    y += px * 1.06;
  });
  x.restore();
}
function tag(txt, X, Y, color, a, px = 44) {
  if (a <= 0) return;
  x.save(); x.font = FONT(px);
  const w = x.measureText(txt).width + 50, h = px * 1.6, s = 0.7 + 0.3 * back(0, 1, a);
  X = cl(X, 80 + w / 2, 925 - w / 2); Y = cl(Y, 560, 1215);
  x.translate(X, Y); x.rotate(((txt.length * 37) % 7 - 3) * 0.01); x.scale(s, s); x.globalAlpha = Math.min(1, a * 1.5);
  x.fillStyle = PAPER; rr(-w / 2, -h / 2, w, h, 12); x.fill();
  x.fillStyle = rgba(color, 0.18); rr(-w / 2, -h / 2, w, h, 12); x.fill();
  pen([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], color, 5, true);
  x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = color; x.fillText(txt, 0, 3);
  x.restore();
}
function stamp(kind, X, Y, s, c) {
  if (s <= 0) return;
  x.save(); x.translate(X, Y); x.scale(s, s);
  x.fillStyle = PAPER; x.beginPath(); x.arc(0, 0, 78, 0, Math.PI * 2); x.fill();
  wash(() => { x.beginPath(); x.arc(0, 0, 70, 0, Math.PI * 2); }, c, 0.22);
  penCircle(0, 0, 66, c, 10);
  if (kind === "x") { pen([[-30, -30], [30, 30]], c, 16); pen([[30, -30], [-30, 30]], c, 16); } else pen([[-34, 4], [-10, 28], [36, -24]], c, 16);
  x.restore();
}

// ---------- paper + ground ----------
const GY = 1130, SC = 1.15, TY = 1200;
function paper() {
  x.fillStyle = PAPER; x.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(120,95,60,${0.03 + rnd(i) * 0.04})`; x.beginPath(); x.arc(rnd(i + 1) * 1080, rnd(i + 2) * 1920, 1 + rnd(i + 3) * 3, 0, Math.PI * 2); x.fill(); }
  // faint ruled sketchbook lines
  x.strokeStyle = "rgba(60,90,140,0.07)"; x.lineWidth = 2; for (let Y = 120; Y < 1900; Y += 64) { x.beginPath(); x.moveTo(0, Y); x.lineTo(1080, Y); x.stroke(); }
}
// kind: "grass" | "tar" | "firm"; dent = how deep the stand has pushed in at sx
function ground(kind, a, sx, dent = 0) {
  if (kind === "firm") {
    wash(() => { x.beginPath(); x.rect(60, GY, 900, 70); }, GREY, 0.25 * a);
    pen([[60, GY], [960, GY]], INK, 8);
    for (let X = 160; X < 960; X += 200) pen([[X, GY + 4], [X - 20, GY + 66]], INK, 4);
    return;
  }
  const c = kind === "tar" ? INK : GREEN;
  // the line dips where the stand pushes in
  const pts = []; for (let X = 60; X <= 960; X += 20) pts.push([X, GY + dent * Math.exp(-Math.pow((X - sx) / 34, 2))]);
  pen(pts, INK, 8);
  if (kind === "tar") {
    wash(() => { x.beginPath(); x.rect(60, GY, 900, 70); }, INK, 0.28 * a);
    for (let i = 0; i < 3; i++) { const X = 230 + i * 260, ph = (curU * 0.8 + i * 0.3) % 1; x.save(); x.globalAlpha = a * (1 - ph); pen([[X, GY - 30 - ph * 80], [X + 14, GY - 50 - ph * 80], [X, GY - 70 - ph * 80], [X + 14, GY - 90 - ph * 80]], ORANGE, 5); x.restore(); }
  } else {
    wash(() => { x.beginPath(); x.rect(60, GY, 900, 70); }, GREEN, 0.25 * a);
    for (let i = 0; i < 26; i++) { const X = 75 + i * 34 + rnd(i) * 10, h = 22 + rnd(i + 5) * 22, sw = 4 * Math.sin(curU * 2 + i);
      if (Math.abs(X - sx) < 30 && dent > 4) continue;
      x.save(); x.globalAlpha = a; pen([[X, GY + 2], [X + sw - 6, GY - h]], c, 5); pen([[X + 8, GY + 2], [X + 12 + sw, GY - h * 0.8]], c, 5); x.restore(); }
  }
}

// ---------- the bike from behind (local units, tyre contact at 0,0, y up negative) ----------
const PIV = [-48, -170];   // side stand pivot (rider's left = screen left from behind)
// th: lean in radians (negative = top to the left). Returns the world point of a local point.
function W2(p, th, s = SC, ox = CX) { const c = Math.cos(th), si = Math.sin(th); return [ox + (p[0] * c - p[1] * si) * s, GY + (p[0] * si + p[1] * c) * s]; }
function bike(th, o = {}) {
  const ox = o.ox ?? CX, s = o.s ?? SC;
  x.save(); x.translate(ox, GY); x.rotate(th); x.scale(s, s);
  // tyre
  wash(() => rr(-34, -230, 68, 230, 30), INK, 0.55);
  pen([[-34, -200], [-34, -20], [-20, 0], [20, 0], [34, -20], [34, -200], [20, -230], [-20, -230]], INK, 8, true);
  for (let k = 0; k < 5; k++) pen([[-18, -40 - k * 38], [18, -55 - k * 38]], INK, 4);
  // rear fender + number plate
  pen([[-50, -250], [0, -275], [50, -250]], INK, 7);
  wash(() => rr(-56, -312, 112, 46, 6), WHITE, 0.9);
  pen([[-56, -312], [56, -312], [56, -266], [-56, -266]], INK, 6, true);
  // tail light
  wash(() => rr(-40, -352, 80, 26, 8), RED, 0.75);
  pen([[-40, -352], [40, -352], [40, -326], [-40, -326]], INK, 5, true);
  // seat / body block
  pen([[-80, -360], [-95, -420], [95, -420], [80, -360]], INK, 8, true);
  wash(() => { x.beginPath(); x.moveTo(-80, -360); x.lineTo(-95, -420); x.lineTo(95, -420); x.lineTo(80, -360); x.closePath(); }, o.body || GREY, 0.3);
  // exhaust on the right
  pen([[52, -170], [118, -200], [130, -235]], INK, 9);
  // tank top, bars and mirrors
  pen([[-60, -420], [-50, -455], [50, -455], [60, -420]], INK, 7);
  pen([[-190, -470], [-60, -462], [60, -462], [190, -470]], INK, 9);
  pen([[-175, -470], [-200, -530]], INK, 5); penCircle(-205, -548, 20, INK, 5);
  pen([[175, -470], [200, -530]], INK, 5); penCircle(205, -548, 20, INK, 5);
  // footpegs
  pen([[-34, -150], [-90, -150]], INK, 7); pen([[34, -150], [90, -150]], INK, 7);
  x.restore();
}
// stand from the pivot (on the bike) to a tip in world space
function stand(th, tip, c, glowK = 0) {
  const p = W2(PIV, th);
  if (glowK > 0) { x.save(); x.globalAlpha = glowK * 0.5; x.strokeStyle = rgba(c, 0.45); x.lineWidth = 34; x.lineCap = "round"; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(tip[0], tip[1]); x.stroke(); x.restore(); }
  pen([p, tip], c, 13);
  pen([[tip[0] - 18, tip[1]], [tip[0] + 14, tip[1]]], c, 9);
}
// lean that puts the stand tip on the ground (y = GY + depth) at a fixed length
const SL = 205 * SC;
function standTipFor(th, depth) {
  const p = W2(PIV, th), dy = GY + depth - p[1];
  const dx = Math.sqrt(Math.max(0, SL * SL - dy * dy));
  return [p[0] - dx, GY + depth];
}
const LEAN = -0.2;
// a walker seen from the side (s2/s6), going right
function walker(X, c, k) {
  if (k <= 0) return;
  const st = Math.sin(curU * 9) * 0.5, Y = GY;
  x.save(); x.globalAlpha = cl(k);
  pen([[X, Y - 200], [X, Y - 330]], c, 12);
  penCircle(X + 4, Y - 372, 32, c, 9);
  pen([[X, Y - 200], [X + 70 * Math.sin(st), Y - 100], [X + 110 * Math.sin(st), Y]], c, 11);
  pen([[X, Y - 200], [X - 70 * Math.sin(st), Y - 100], [X - 110 * Math.sin(st), Y]], c, 11);
  pen([[X, Y - 310], [X + 60 * Math.sin(-st), Y - 240], [X + 80 * Math.sin(-st), Y - 180]], c, 9);
  pen([[X, Y - 310], [X - 60 * Math.sin(-st), Y - 240], [X - 80 * Math.sin(-st), Y - 180]], c, 9);
  x.restore();
}
function plate(X, Y, c, a, lid = false) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a);
  if (lid) { wash(() => { x.beginPath(); x.ellipse(X, Y - 6, 62, 10, 0, 0, Math.PI * 2); }, GREY, 0.5); pen([[X - 62, Y - 6], [X - 50, Y - 14], [X + 50, Y - 14], [X + 62, Y - 6], [X + 50, Y + 2], [X - 50, Y + 2]], c, 6, true); }
  else { wash(() => rr(X - 80, Y - 14, 160, 14, 3), c, 0.5); pen([[X - 80, Y - 14], [X + 80, Y - 14], [X + 80, Y], [X - 80, Y]], c, 6, true); }
  x.restore();
}
function gearIcon(X, Y, c, a) {
  if (a <= 0) return;
  x.save(); x.globalAlpha = cl(a); x.fillStyle = PAPER; x.beginPath(); x.arc(X, Y, 70, 0, Math.PI * 2); x.fill();
  const p = []; for (let i = 0; i <= 32; i++) { const A = (i / 32) * Math.PI * 2 + curU * 0.6, r = i % 4 < 2 ? 58 : 46; p.push([X + Math.cos(A) * r, Y + Math.sin(A) * r]); }
  pen(p, c, 7); penCircle(X, Y, 18, c, 7); x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  curU = u; BOIL = Math.floor(t * 8);
  x.setTransform(1, 0, 0, 1, 0, 0);
  paper();
  const zoom = 1 + 0.04 * cl(u / Math.max(1, d));
  x.save(); x.translate(CX, 900); x.scale(zoom, zoom); x.translate(-CX, -900);
  let th = LEAN, depth = 0, kind = "grass", gA = 1, sc = INK, sg = 0, bodyC = GREY;
  const L = [];

  if (id === "s1") {
    const Ta = on("s1", "tar", u, 0.05, 0.3);
    kind = Ta > 0.5 ? "tar" : "grass"; gA = Ta > 0.5 ? Ta : 1;
    sc = u > at("s1", "soft") - 0.1 ? RED : INK; sg = flash(u, at("s1", "soft") + 0.1);
    L.push(() => tag("GRASS", 250, TY, GREEN, on("s1", "grass", u, 0.05, 0.2) * (1 - Ta)));
    L.push(() => tag("HOT TAR", 250, TY, INK, Ta));
    L.push(() => tag("SOFT GROUND", 760, TY, RED, on("s1", "soft", u, 0.05, 0.2)));
  }
  if (id === "s2") {
    kind = "tar"; sc = RED; sg = on("s2", "stand", u, 0.05, 0.3) * (0.6 + 0.4 * Math.sin(u * 8));
    const Wa = at("s2", "walk");
    L.push(() => walker(lerp(700, 1080, sm(Wa - 0.3, Wa + 1.2, u)), INK, 1));
    L.push(() => tag("SIDE STAND", 240, TY, RED, on("s2", "stand", u, 0.05, 0.2)));
  }
  if (id === "s3") {
    kind = "tar"; sc = RED;
    const Si = at("s3", "sinks"), Ti = at("s3", "tips");
    depth = 46 * sm(Si - 0.1, Ti, u);
    th = LEAN - 0.22 * sm(Si - 0.1, Ti, u);
    const fall = sm(Ti - 0.05, Ti + 0.5, u);
    th = lerp(th, -1.48, fall * fall) + 0.04 * Math.sin(Math.PI * cl((u - Ti - 0.5) / 0.25)) * (u > Ti + 0.5 ? 1 : 0);
    sg = sm(Si - 0.1, Si + 0.2, u) * (1 - fall);
    L.push(() => tag("SINKS", 230, TY, RED, on("s3", "sinks", u, 0.05, 0.2) * (1 - fall)));
    L.push(() => tag("TIPS OVER", 760, 640, RED, on("s3", "tips", u, 0.05, 0.2)));
    L.push(() => stamp("x", 790, 800, back(at("s3", "over") - 0.05, at("s3", "over") + 0.3, u) * 0.75, RED));
  }
  if (id === "s4") {
    const Fi = on("s4", "firm", u, 0.05, 0.4);
    kind = Fi > 0.5 ? "firm" : "tar"; gA = 1; sc = Fi > 0.5 ? GREEN : INK; bodyC = GREEN;
    L.push(() => tag("FIRM", 230, TY, GREEN, on("s4", "firm", u, 0.05, 0.2)));
    L.push(() => tag("FLAT", 760, TY, GREEN, on("s4", "flat", u, 0.05, 0.2)));
    L.push(() => stamp("v", 790, 680, back(at("s4", "whenever"), at("s4", "whenever") + 0.3, u) * 0.7, GREEN));
  }
  if (id === "s5") {
    kind = "tar"; sc = GREEN; bodyC = GREEN;
    const Pl = on("s5", "plate", u, 0.1, 0.5), Li = on("s5", "lid", u, 0.05, 0.3), Un = on("s5", "under", u, 0.05, 0.3);
    depth = -14 * Pl;   // the stand rests on top of the plate
    L.push((tip) => plate(lerp(-120, tip[0], Pl), GY, GREEN, sm(0, 0.2, u), Li > 0.5 && Li < 1.01 && u < at("s5", "under") - 0.1));
    L.push(() => tag("FLAT PLATE", 260, 640, GREEN, Pl * (1 - Li)));
    L.push(() => tag("CAN LID", 260, 640, GREEN, Li * (1 - Un)));
    L.push(() => tag("UNDER THE STAND", 300, TY, GREEN, Un));
    L.push(() => stamp("v", 790, 680, back(at("s5", "stand"), at("s5", "stand") + 0.3, u) * 0.7, GREEN));
  }
  if (id === "s6") {
    kind = "tar"; sc = GREEN; bodyC = GREEN; depth = -14;
    const Ge = at("s6", "gear"), Ch = at("s6", "check"), Wa = at("s6", "walk");
    th = LEAN + 0.03 * Math.sin((u - Ch) * 16) * sm(Ch, Ch + 0.1, u) * (1 - sm(Ch + 0.3, Ch + 0.9, u));
    L.push((tip) => plate(tip[0], GY, GREEN, 1));
    L.push(() => gearIcon(800, 680, GREEN, on("s6", "gear", u, 0.05, 0.25) * (1 - sm(Ch - 0.1, Ch + 0.1, u))));
    L.push(() => tag("IN GEAR", 790, 800, GREEN, sm(Ge - 0.05, Ge + 0.2, u) * (1 - sm(Ch - 0.1, Ch + 0.1, u))));
    L.push(() => tag("STEADY", 790, 680, GREEN, on("s6", "steady", u, 0.05, 0.2)));
    L.push(() => walker(lerp(720, 1080, sm(Wa - 0.2, Wa + 1.0, u)), GREEN, sm(Wa - 0.3, Wa, u)));
  }
  if (id === "s7" || id === "s8") { kind = "tar"; sc = GREEN; bodyC = GREEN; depth = -14; L.push((tip) => plate(tip[0], GY, GREEN, 1)); }

  ground(kind, gA, standTipFor(th, Math.max(0, depth))[0], Math.max(0, depth));
  let tip = standTipFor(th, depth);
  if (id === "s3") {
    // while falling the stand moves with the bike (rigid), from where it was when the fall began
    const Ti = at("s3", "tips"), th0 = LEAN - 0.22, t0 = standTipFor(th0, 46);
    if (u > Ti - 0.05) {
      const c = Math.cos(th0), si = Math.sin(th0), dx = (t0[0] - CX) / SC, dy = (t0[1] - GY) / SC;
      tip = W2([dx * c + dy * si, -dx * si + dy * c], th);
    }
  }
  L.filter((f, i) => i === 0 && (id === "s5" || id === "s6" || id === "s7" || id === "s8")).forEach((f) => f(tip));
  stand(th, tip, sc, sg);
  bike(th, { body: bodyC });
  L.forEach((f, i) => { if (i === 0 && (id === "s5" || id === "s6" || id === "s7" || id === "s8")) return; f(tip); });
  x.restore();

  if (id === "s1") words(["NEVER PARK", "ON SOFT GROUND"], RED, 380, 0.0, 1, 150, Math.max(flash(u, 0.05), flash(u, at("s1", "never")), flash(u, at("s1", "soft"))));
  if (id === "s2") words(["YOU WALK", "AWAY"], RED, 380, 0.0, 1, 170, flash(u, at("s2", "walk")) * 0.6);
  if (id === "s3") words(["IT SINKS.", "IT TIPS."], RED, 380, 0.0, 1, 170, flash(u, at("s3", "tips")) * 0.6);
  if (id === "s4") words(["FIRM AND", "FLAT GROUND"], GREEN, 380, 0.0, 1, 170, flash(u, at("s4", "firm")) * 0.6);
  if (id === "s5") words(["PLATE UNDER", "THE STAND"], GREEN, 380, 0.0, 1, 170, flash(u, at("s5", "plate")) * 0.6);
  if (id === "s6") words(["IN GEAR.", "CHECK IT."], GREEN, 380, 0.0, 1, 170, flash(u, at("s6", "check")) * 0.6);
  if (id === "s7") {
    x.save(); x.fillStyle = rgba(PAPER, 0.8); x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["SOFT GROUND", "SINKS."], ORANGE, 640, 0.0, 1, 150, flash(u, 0.05));
    words(["USE A PLATE."], ORANGE, 960, at("s7", "use") - 0.05, 1, 160, flash(u, at("s7", "plate")));
  }
  if (id === "s8") {
    x.save(); x.fillStyle = rgba(PAPER, 0.9); x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "APEX"] = BRAND.cta || [];
    words([c1], INK, 720, 0.1, 1, 130);
    words([c2], RED, 920, 0.25, 1, 170);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["soft-ground-ink"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
