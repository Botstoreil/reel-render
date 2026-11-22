// Red Pen reel 11: nonprofit hospitals must accept aid applications for at least 240 days from the first bill.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER THINK IT IS TOO LATE");
cap("s2", "passed", [["AID HAS", 1], ["PASSED?", 1]], RED);
cap("s3", "pay", [["PAYING WHAT", 1], ["YOU DID NOT OWE", 1]], RED, { y: 0.66 });
cap("s4", "first", [["FIND YOUR", 1], ["FIRST BILL DATE", 1]], GREEN);
cap("s5", "240", [["AT LEAST", 1], ["240 DAYS", 1]], GREEN);
cap("s6", "full", [["FULL APPLICATION", 1], ["KEEP A COPY", 1]], VIOLET);
endCard([["CHECK THE DATE", 1], ["APPLY IN 240 DAYS", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: E.face }, { at: g("s2", "chance") - 0.15, cam: E.screen },
  { at: s("s3"), cam: I.close }, { at: g("s3", "pay") - 0.15, cam: I.wide },
  { at: s("s4"), cam: E.wide }, { at: g("s4", "first") - 0.15, cam: E.screen },
  { at: s("s5"), cam: M.wide }, { at: g("s5", "applications"), cam: M.onA }, { at: g("s5", "240") - 0.15, cam: M.wide },
  { at: s("s6"), cam: E.screen },
  { at: s("s7"), cam: M.wide },
];

run("aid-window", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$9,400", stamp: "DUE NOW", stampHex: RED, tear: 0, slump: 0.5 });
  E.set(t, { label: wrong ? "TOO LATE?" : "DAY 240", hex: wrong ? RED : GREEN, slump: wrong ? 0.7 : 0, type: wrong ? 0.2 : 0.9, p: wrong ? 0.8 : ((t - s("s4")) % 4) / 4 });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

