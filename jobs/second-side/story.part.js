
// ---------- second-side (YogaFlow 23) story ----------
const mirror = (p) => { const o = {}; for (const j in p) o[j] = [-p[j][0], p[j][1]]; return o; };
const LUNGE2 = mirror(P.lunge);
// a small breath counter: n dots, the first k lit
function dots(X, Y, n, k, c, a = 1) {
  for (let i = 0; i < n; i++) {
    const cx = X + (i - (n - 1) / 2) * 52, on = cl(k - i);
    draw(C(cx, Y, 16), mix(c, BG, 0.4), 5, a, 300 + i, { a, blur: 8, amp: 1 });
    if (on > 0) { fill(C(cx, Y, 13, 0, 1), c, a * on); }
  }
}
function card(X, Y, w, h, c, p, seed) {
  fill(R(X, Y, w, h, 26), "rgba(10,10,30,0.88)", cl(p * 3));
  draw(R(X, Y, w, h, 26), c, 7, p, seed, { closed: true });
}
function line(txt, X, Y, c, k, px = 50) {
  if (k <= 0) return;
  x.save(); x.font = FONT(px); x.textAlign = "left"; x.textBaseline = "middle"; x.shadowColor = c; x.shadowBlur = 16; x.fillStyle = c;
  const n = Math.ceil(txt.length * cl(k)); x.fillText(txt.slice(0, n), X, Y); x.restore();
}

function frame(t) {
  const { id, u, d } = sceneOf(t);
  NOW = t; curU = u;
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.shadowBlur = 0;
  x.clearRect(0, 0, 1080, 1920);
  const cut = 1 - sm(-LEAD, 0.22 - LEAD, u);
  const z = 1 + 0.035 * cl(u / Math.max(1, d)) + 0.05 * cut * cut;
  paper(id === "s7" ? 0.6 : 0);
  x.save(); x.translate(CX, 900); x.scale(z, z); x.translate(-CX, -900);
  const DIM = mix(VIOLET, BG, 0.25);

  if (id === "s1") {
    // side 1 done (check), side 2 mat stays empty and gets a red question mark
    floor(1290, pr(-0.05, 0.5));
    mat(290, 1260, 300, pr(0.0, 0.4), VIOLET, 11);
    person(290, 1260, P.lunge, 0.85, VIOLET, pr(0.05, 0.6), 12);
    tag("SIDE 1", 290, 760, VIOLET, sm(at("s1", "one-sided") - 0.1, at("s1", "one-sided") + 0.2, u), 44);
    stamp("v", 290, 900, 0.55, pr(at("s1", "pose") - 0.1, 0.4), GREEN);
    const F = sm(at("s1", "second") - 0.15, at("s1", "side") + 0.1, u);
    mat(740, 1260, 300, pr(0.1, 0.4), F > 0.5 ? RED : DIM, 13);
    tag("SIDE 2", 740, 760, RED, F, 44);
    tag("?", 740, 1000, RED, sm(at("s1", "forget") - 0.1, at("s1", "forget") + 0.2, u), 110);
  }
  if (id === "s2") {
    // a long flow as a strip of poses; the marker runs along it and loses its place
    const a = pr(-0.05, 0.4);
    card(70, 820, 880, 420, VIOLET, a, 21);
    const seq = [P.stand, P.lunge, P.lowlunge, P.sit, P.stand, LUNGE2];
    seq.forEach((p, i) => { const X = 155 + i * 142; person(X, 1150, p, 0.42, DIM, pr(0.0 + i * 0.06, 0.4), 22 + i * 10); });
    const run = sm(0.05, at("s2", "middle") + 0.1, u);
    const mx = lerp(150, 700, run);
    draw(L(mx, 860, mx, 1200), ORANGE, 8, a, 29, { amp: 1.5 });
    const Lt = sm(at("s2", "lose") - 0.1, at("s2", "track") + 0.15, u);
    tag("WHICH SIDE?", mx, 1350, RED, Lt, 44);
    tag("?", mx, 740, RED, Lt, 90);
    tag("LONG FLOW", CX, 820, VIOLET, sm(at("s2", "long") - 0.1, at("s2", "flow") + 0.1, u), 40);
  }
  if (id === "s3") {
    // a seesaw tips: side 1 heavy, side 2 light; the student leaves leaning
    const a = pr(-0.05, 0.4);
    const tip = 0.2 * sm(at("s3", "feeling") - 0.2, at("s3", "uneven") + 0.2, u);
    const cx = CX, cy = 1120, Ln = 380;
    const lx = cx - Math.cos(tip) * Ln, ly = cy + Math.sin(tip) * Ln, rx = cx + Math.cos(tip) * Ln, ry = cy - Math.sin(tip) * Ln;
    draw([[cx - 60, cy + 120], [cx, cy], [cx + 60, cy + 120]], VIOLET, 9, a, 31, { closed: true });
    draw(L(lx, ly, rx, ry), ORANGE, 12, a, 32);
    tag("SIDE 1", lx + 40, ly - 70, VIOLET, a, 40);
    tag("SIDE 2", rx - 40, ry - 70, RED, sm(at("s3", "students") - 0.1, at("s3", "leave") + 0.1, u), 40);
    floor(1430, a);
    const Lv = sm(at("s3", "leave") - 0.1, at("s3", "class") + 0.4, u);
    person(lerp(CX, 820, Lv), 1430, pose(P.stand, P.lean, sm(at("s3", "uneven") - 0.2, at("s3", "uneven") + 0.2, u)), 0.55, ORANGE, pr(0.0, 0.5), 35);
    tag("UNEVEN", CX, 760, RED, sm(at("s3", "uneven") - 0.1, at("s3", "uneven") + 0.15, u), 54);
  }
  if (id === "s4") {
    // the class plan: both sides written in
    const a = pr(-0.05, 0.4);
    card(110, 620, 800, 640, GREEN, a, 41);
    tag("CLASS PLAN", CX, 620, GREEN, cl(a * 2), 42);
    line("1. LUNGE - SIDE 1", 170, 760, VIOLET, sm(at("s4", "write") - 0.05, at("s4", "both") + 0.2, u));
    line("2. LUNGE - SIDE 2", 170, 870, GREEN, sm(at("s4", "both") - 0.05, at("s4", "sides") + 0.3, u));
    line("3. TWIST - SIDE 1", 170, 980, VIOLET, sm(at("s4", "into") - 0.05, at("s4", "your") + 0.25, u));
    line("4. TWIST - SIDE 2", 170, 1090, GREEN, sm(at("s4", "class") - 0.05, at("s4", "plan") + 0.25, u));
    stamp("v", 820, 1180, 0.45, pr(at("s4", "plan") - 0.05, 0.4), GREEN);
    floor(1430, a);
    person(CX, 1430, P.stand, 0.45, GREEN, pr(0.0, 0.5), 45);
  }
  if (id === "s5") {
    // the same pose on both sides, the same breath count under each
    floor(1300, pr(-0.05, 0.5));
    mat(290, 1270, 300, pr(0.0, 0.4), GREEN, 51); person(290, 1270, P.lunge, 0.8, GREEN, pr(0.0, 0.5), 52);
    mat(740, 1270, 300, pr(0.05, 0.4), GREEN, 53); person(740, 1270, LUNGE2, 0.8, GREEN, pr(0.05, 0.5), 54);
    const B = sm(at("s5", "number") - 0.1, at("s5", "side") + 0.2, u) * 5;
    dots(290, 1380, 5, B, GREEN); dots(740, 1380, 5, B, GREEN);
    tag("5 BREATHS", 290, 780, GREEN, sm(at("s5", "breaths") - 0.1, at("s5", "breaths") + 0.15, u), 40);
    tag("5 BREATHS", 740, 780, GREEN, sm(at("s5", "each") - 0.1, at("s5", "each") + 0.15, u), 40);
  }
  if (id === "s6") {
    // teacher says it out loud; an arrow carries the flow to side 2
    floor(1310, pr(-0.05, 0.5));
    person(220, 1280, with_(P.stand, { eR: [80, -330], hR: [150, -390] }), 0.85, GREEN, pr(-0.05, 0.5), 61);
    bubble("SAME FLOW, SECOND SIDE", 600, 720, GREEN, sm(at("s6", "same") - 0.25, at("s6", "flow") + 0.1, u), 260, 900, 42);
    tag("OUT LOUD", 260, 560, VIOLET, sm(at("s6", "out") - 0.1, at("s6", "loud") + 0.1, u), 40);
    const S2 = sm(at("s6", "second") - 0.15, at("s6", "side") + 0.2, u);
    mat(560, 1280, 220, 1, VIOLET, 62); person(560, 1280, P.lunge, 0.6, VIOLET, pr(0.05, 0.5), 63);
    arrow(660, 1050, 730, 1050, GREEN, S2, 64);
    mat(850, 1280, 220, S2, GREEN, 65); person(850, 1280, LUNGE2, 0.6, GREEN, S2, 66);
  }
  if (id === "s7") {
    mat(330, 1180, 240, 0.6, GREEN); person(330, 1180, P.lunge, 0.55, GREEN, 1, 71, { a: 0.7 });
    mat(700, 1180, 240, 0.6, GREEN); person(700, 1180, LUNGE2, 0.55, GREEN, 1, 72, { a: 0.7 });
  }
  x.restore();

  // ---------- screen text ----------
  if (id === "s1") words(["NEVER FORGET", "THE SECOND SIDE"], RED, 340, 0.0, 1, 140, Math.max(flash(u, 0.05), flash(u, at("s1", "never"))), at("s1", "never") - 0.1);
  if (id === "s2") words(["EASY TO", "LOSE TRACK"], RED, 340, 0.0, 1, 150, flash(u, at("s2", "lose")) * 0.6);
  if (id === "s3") words(["THEY LEAVE", "UNEVEN"], RED, 340, 0.0, 1, 150, flash(u, at("s3", "uneven")) * 0.6);
  if (id === "s4") words(["WRITE BOTH", "SIDES DOWN"], GREEN, 340, 0.0, 1, 150, flash(u, at("s4", "both")) * 0.6);
  if (id === "s5") words(["SAME BREATHS", "EACH SIDE"], GREEN, 340, 0.0, 1, 150, flash(u, at("s5", "same")) * 0.6);
  if (id === "s6") words(["SAY IT", "OUT LOUD"], GREEN, 340, 0.0, 1, 150, flash(u, at("s6", "loud")) * 0.6, at("s6", "loud") - 0.05);
  if (id === "s7") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.55)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    words(["FIRST SIDE."], ORANGE, 690, 0.0, 1, 160, flash(u, 0.05));
    words(["THEN SECOND."], ORANGE, 880, at("s7", "then") - 0.05, 1, 150, flash(u, at("s7", "second")), at("s7", "second") - 0.05);
  }
  if (id === "s8") {
    x.save(); x.fillStyle = "rgba(5,6,12,0.7)"; x.fillRect(0, 0, 1080, 1920); x.restore();
    const [c1 = "DOWNLOAD", c2 = "YOGAFLOW"] = BRAND.cta || [];
    draw(C(CX, 560, 120), VIOLET, 12, pr(0.0, 0.45), 261);
    draw(C(CX, 560, 155, u * 3, 0.23), GREEN, 10, 1, 262, { amp: 2 });
    person(CX, 560 + 95, P.sit, 0.62, VIOLET, pr(0.1, 0.5), 270, { closed: true });
    words([c1], WHITE, 800, 0.15, 1, 130);
    words([c2], VIOLET, 950, 0.3, 1, 150, 0, 0.6);
    if (BRAND.sub) tag(BRAND.sub, CX, 1110, GREEN, sm(0.5, 0.75, u), 50);
  }
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["second-side-glow-sketch"] = Promise.resolve().then(() => frame(window.__hfThreeTime || 0));
window.addEventListener("hf-seek", (e) => frame(e.detail.time));
