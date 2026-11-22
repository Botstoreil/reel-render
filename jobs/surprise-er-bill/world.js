// Red Pen reel 12: never pay a surprise out-of-network ER bill as is. Check the EOB; report extra charges.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER PAY A SURPRISE ER BILL");
cap("s2", "ER", [["ER DOCTOR", 1], ["OUT OF NETWORK", 1]], RED);
cap("s3", "much", [["FAR MORE THAN", 1], ["YOUR SHARE", 1]], RED, { y: 0.66 });
cap("s4", "EOB", [["CHECK", 1], ["YOUR EOB", 1]], GREEN);
cap("s5", "in-network", [["IN-NETWORK", 1], ["COST SHARING", 1]], GREEN);
cap("s6", "call", [["CALL THE", 1], ["HELP DESK", 1]], VIOLET);
endCard([["CHECK YOUR EOB", 1], ["REPORT THE EXTRA", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: M.onA }, { at: g("s2", "even") - 0.15, cam: M.wide },
  { at: s("s3"), cam: I.close }, { at: g("s3", "much") - 0.15, cam: I.wide },
  { at: s("s4"), cam: E.wide }, { at: g("s4", "EOB") - 0.15, cam: E.screen },
  { at: s("s5"), cam: E.face }, { at: g("s5", "federal") - 0.15, cam: E.wide },
  { at: s("s6"), cam: Ph.close }, { at: g("s6", "call") - 0.15, cam: Ph.wide },
  { at: s("s7"), cam: M.wide },
];

run("surprise-er-bill", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$6,300", stamp: "OUT OF NETWORK", stampHex: RED, tear: 0, slump: 0.5 });
  E.set(t, { label: "EOB", hex: GREEN, slump: 0, type: 0.8, p: ((t - s("s4")) % 4) / 4 });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

