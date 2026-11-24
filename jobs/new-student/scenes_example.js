import { S, shoot, run, sm, bloom, RED, GREEN, VIOLET, ORANGE } from "./kit.js";
import { title, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear, walkOut } from "./scenes.js";
const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear(), O = walkOut();
title("NEVER WORK UNPAID");
endCard([["NO DEPOSIT", 1], ["NO EDIT", 1]]);
const s = (id) => S[id][0];
const SH = [
  { at: 0, cam: E.face }, { at: s("s2"), cam: E.screen }, { at: s("s3"), cam: Ph.wide }, { at: s("s3") + 1.5, cam: Ph.close },
  { at: s("s4"), cam: M.wide }, { at: s("s5"), cam: M.onA }, { at: s("s5") + 1.5, cam: M.onB },
  { at: s("s6"), cam: I.wide }, { at: s("s6") + 1.5, cam: I.close }, { at: s("s7"), cam: E.screen }, { at: s("s8"), cam: M.wide },
];
run("scenes-example", (t) => {
  E.set(t, { label: t < s("s2") ? "ROUGH CUT" : "FINAL CUT", p: (t % 6) / 6, hex: t < s("s2") ? RED : GREEN });
  Ph.set(t, { slump: 0.6 });
  M.set(t, { a: { argue: 1 }, b: { nod: 1 } });
  I.set(t, { tear: sm(s("s6") + 0.8, s("s6") + 2.2, t) });
  O.set(t, { t0: s("s6") + 2.4, t1: s("s6") + 4.6 });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
