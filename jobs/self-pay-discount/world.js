// Red Pen reel 13: uninsured patients ask for the self-pay discount and the posted cash price before paying.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER SKIP THE SELF-PAY PRICE");
cap("s2", "full", [["FULL LIST", 1], ["PRICES", 1]], RED);
cap("s3", "more", [["MORE THAN", 1], ["OTHERS PAY", 1]], RED, { y: 0.66 });
cap("s4", "self-pay", [["ASK FOR A", 1], ["SELF-PAY DISCOUNT", 1]], GREEN);
cap("s5", "cash", [["THEIR POSTED", 1], ["CASH PRICE", 1]], GREEN);
cap("s6", "writing", [["IN WRITING", 1], ["BEFORE YOU PAY", 1]], VIOLET, { y: 0.66 });
endCard([["ASK FOR SELF-PAY", 1], ["GET IT IN WRITING", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: I.close }, { at: g("s2", "full") - 0.15, cam: E.screen },
  { at: s("s3"), cam: E.face }, { at: g("s3", "more") - 0.15, cam: E.screen },
  { at: s("s4"), cam: Ph.close }, { at: g("s4", "self-pay") - 0.15, cam: Ph.wide },
  { at: s("s5"), cam: M.onB }, { at: g("s5", "cash") - 0.15, cam: M.wide },
  { at: s("s6"), cam: I.close }, { at: g("s6", "writing") - 0.15, cam: I.wide },
  { at: s("s7"), cam: M.wide },
];

run("self-pay-discount", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: wrong ? "$11,200" : "$6,100", stamp: wrong ? "DUE NOW" : "AGREED", stampHex: wrong ? RED : GREEN, tear: 0, cheer: wrong ? 0 : 1 });
  E.set(t, { label: "LIST PRICE", hex: RED, slump: 0.7, type: 0.2, p: 0.3 });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

