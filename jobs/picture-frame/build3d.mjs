// 3D version: index.html (one three.js canvas, world.js) + compositions/captions.html (white pill), from word timings.
// Run: node build3d.mjs
import fs from "node:fs";

const W = JSON.parse(fs.readFileSync("assets/words.json", "utf8"));
const LEAD = 0.05, TAIL = 0.12;
const BRAND = fs.existsSync("brand.json") ? JSON.parse(fs.readFileSync("brand.json", "utf8")) : {};

const LAST = Object.keys(W).at(-1);
let t = 0;
const S = {};
for (const id of Object.keys(W)) {
  const dur = +(W[id].dur + LEAD + (id === LAST ? 1.2 : TAIL)).toFixed(3);
  S[id] = [+t.toFixed(3), dur];
  t += dur;
}
const TOTAL = +t.toFixed(3);

// whisper mishears the first word of a line; take it from SCRIPT.txt
const SCRIPT = Object.fromEntries(fs.readFileSync("SCRIPT.txt", "utf8").trim().split("\n").map((l) => l.split("|")));
const fixFirst = (id, txt) => { const f = SCRIPT[id].split(" ")[0]; return f.toLowerCase().replace(/[^a-z]/g, "") === txt.toLowerCase().replace(/[^a-z]/g, "") ? f : txt.replace(/^the$/i, f); };
// captions: 1-3 words per pill (max ~16 chars so it clears the IG buttons on the right), broken at punctuation
const groups = [];
for (const id of Object.keys(W)) {
  const off = S[id][0] + LEAD;
  let g = [];
  W[id].words.forEach((w, i) => {
    const text = i === 0 ? fixFirst(id, w.text) : w.text;
    if (g.length && [...g.map((x) => x.text), text].join(" ").length > 18) { groups.push(g); g = []; }  // close the pill before it gets too wide
    g.push({ text, start: off + w.start, end: off + w.end });
    if (g.length === 3 || /[.,?!]$/.test(w.text) || i === W[id].words.length - 1) { groups.push(g); g = []; }
  });
}
let capHtml = "", capJs = "";
groups.forEach((g, gi) => {
  const gs = Math.max(0, g[0].start - 0.04);
  const ge = groups[gi + 1] ? Math.min(groups[gi + 1][0].start - 0.04, g.at(-1).end + 0.5) : g.at(-1).end + 0.4;
  const text = g.map((w) => w.text).join(" ").replace(/[.,]$/, "");
  capHtml += `    <div id="cg${gi}" class="cg"><span id="cp${gi}" class="pill">${text}</span></div>\n`;
  capJs += `    tl.set("#cg${gi}", { visibility: "visible" }, ${gs.toFixed(3)});
    tl.fromTo("#cp${gi}", { scale: 0.86 }, { scale: 1, duration: 0.1, ease: "back.out(2.2)" }, ${gs.toFixed(3)});
    tl.set("#cg${gi}", { visibility: "hidden" }, ${ge.toFixed(3)});\n`;
});
fs.writeFileSync("compositions/captions.html", `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .cg { position: absolute; left: 0; right: 0; top: 1240px; display: flex; justify-content: center; visibility: hidden; }
    .pill { display: inline-block; background: #ffffff; color: #0b0920; font: 800 60px Inter, sans-serif; letter-spacing: -0.01em; padding: 16px 38px 20px; border-radius: 999px; box-shadow: 0 0 40px rgba(170, 150, 255, 0.55); white-space: nowrap; }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">
${capHtml}  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
${capJs}    tl.set({}, {}, ${TOTAL});
    window.__timelines["captions"] = tl;
  </script>
</template>
`);

const vo = Object.keys(W).map((id) => `      <audio id="vo-${id}" class="clip" src="assets/vo/${id}.wav" data-start="${(S[id][0] + LEAD).toFixed(3)}" data-duration="${W[id].dur}" data-track-index="3" data-volume="1"></audio>`).join("\n");
fs.writeFileSync("index.html", `<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <script type="importmap">
      { "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.181.2/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.181.2/examples/jsm/"
      } }
    </script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #080622; }
      #world { position: absolute; inset: 0; width: 1080px; height: 1920px; display: block; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
      <div id="stage" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="1" style="position:absolute;inset:0"><canvas id="world" width="1080" height="1920" data-layout-allow-overflow></canvas></div>
      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 10"></div>
${vo}
    </div>
    <script>
      window.__EV = ${JSON.stringify({ S, W, LEAD, BRAND })};
      const tl = gsap.timeline({ paused: true });
      tl.set({}, {}, ${TOTAL});
      window.__timelines["main"] = tl;
    </script>
    <script type="module" src="world.js"></script>
  </body>
</html>
`);
console.log("total", TOTAL, "pills", groups.length);
