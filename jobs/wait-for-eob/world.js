// Red Pen reel 06: insured patients wait for the Explanation of Benefits before paying a hospital bill.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER PAY BEFORE THE EOB");
cap("s2", "claim", [["CLAIM NOT", 1], ["FINISHED", 1]], RED);
cap("s3", "more", [["YOU MAY", 1], ["OVERPAY", 1]], RED, { y: 0.66 });
cap("s4", "Explanation", [["WAIT FOR", 1], ["THE EOB", 1]], GREEN);
cap("s5", "owe", [["WHAT YOU OWE", 1]], GREEN);
cap("s6", "call", [["CALL AND", 1], ["ASK WHY", 1]], VIOLET);
endCard([["MATCH BILL TO EOB", 1], ["THEN PAY", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: I.close }, { at: g("s2", "before") - 0.15, cam: E.screen },
  { at: s("s3"), cam: I.wide },
  { at: s("s4"), cam: E.wide }, { at: g("s4", "Explanation") - 0.15, cam: E.screen },
  { at: s("s5"), cam: E.face }, { at: g("s5", "owe") - 0.15, cam: E.screen },
  { at: s("s6"), cam: Ph.close }, { at: g("s6", "call") - 0.15, cam: Ph.wide },
  { at: s("s7"), cam: M.wide },
];

run("wait-for-eob", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$3,900", stamp: "DUE NOW", stampHex: RED, tear: 0, slump: 0.5 });
  E.set(t, { label: wrong ? "CLAIM OPEN" : "EOB", hex: wrong ? RED : GREEN, slump: wrong ? 0.6 : 0, type: wrong ? 0.2 : 0.8, p: wrong ? 0.3 : ((t - s("s4")) % 4) / 4 });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

