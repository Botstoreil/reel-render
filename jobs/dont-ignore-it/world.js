// Red Pen reel 04: never ignore a hospital bill. Call early and ask for a hold.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER IGNORE THE BILL");
cap("s2", "collection", [["SENT TO", 1], ["COLLECTIONS", 1]], RED);
cap("s3", "harder", [["HARDER TO", 1], ["SORT OUT", 1]], RED);
cap("s4", "call", [["CALL THIS WEEK", 1]], GREEN);
cap("s5", "ask", [["ASK FOR", 1], ["A HOLD", 1]], GREEN);
cap("s6", "Write", [["WRITE IT DOWN", 1]], VIOLET);
endCard([["CALL EARLY", 1], ["ASK FOR A HOLD", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: I.close }, { at: g("s2", "collection") - 0.15, cam: E.screen },
  { at: s("s3"), cam: Ph.close }, { at: g("s3", "and") - 0.1, cam: E.wide },
  { at: s("s4"), cam: Ph.wide },
  { at: s("s5"), cam: M.onA }, { at: g("s5", "ask") - 0.15, cam: M.wide },
  { at: s("s6"), cam: E.screen },
  { at: s("s7"), cam: M.wide },
];

run("dont-ignore-it", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$12,480", stamp: "PAST DUE", stampHex: RED, tear: 0, slump: 0.6 });
  E.set(t, { label: wrong ? "PAST DUE" : "CALL LOG", hex: wrong ? RED : GREEN, slump: wrong ? 0.7 : 0, type: wrong ? 0.1 : 0.9, p: wrong ? 0.2 : ((t - s("s6")) % 3) / 3 });
  Ph.set(t, { phone: 1, shrug: wrong ? 0.5 : 0 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

