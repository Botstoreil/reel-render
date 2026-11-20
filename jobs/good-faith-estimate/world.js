// Red Pen reel 07: uninsured or self-pay patients ask for a Good Faith Estimate before booking care.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER BOOK WITHOUT A PRICE");
cap("s2", "bill", [["THE BILL CAN", 1], ["BE ANYTHING", 1]], RED);
cap("s3", "nothing", [["NOTHING TO", 1], ["COMPARE", 1]], RED);
cap("s4", "Good", [["GOOD FAITH", 1], ["ESTIMATE", 1]], GREEN);
cap("s5", "give", [["THEY MUST", 1], ["GIVE ONE", 1]], GREEN);
cap("s6", "file", [["$400 OVER?", 1], ["DISPUTE IT", 1]], VIOLET, { y: 0.66 });
endCard([["GET THE ESTIMATE", 1], ["KEEP IT", 1]]);

const SH = [
  { at: 0, cam: Ph.wide },
  { at: s("s2"), cam: E.face }, { at: g("s2", "the") - 0.15, cam: E.screen },
  { at: s("s3"), cam: E.wide },
  { at: s("s4"), cam: Ph.close }, { at: g("s4", "Good") - 0.15, cam: Ph.wide },
  { at: s("s5"), cam: M.wide }, { at: g("s5", "patients"), cam: M.onA }, { at: g("s5", "or"), cam: M.onB },
  { at: s("s6"), cam: I.close }, { at: g("s6", "you") - 0.15, cam: I.wide },
  { at: s("s7"), cam: M.wide },
];

run("good-faith-estimate", (t) => {
  I.set(t, { amount: "$2,400", stamp: "IN WRITING", stampHex: GREEN, tear: 0 });
  E.set(t, { label: "NO PRICE", hex: RED, slump: 0.7, type: 0.2, p: 0.25 });
  Ph.set(t, { phone: 1, shrug: t > s("s2") && t < s("s4") ? 0.5 : 0 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

