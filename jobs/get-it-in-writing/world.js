// Red Pen reel 03: never pay on a phone promise. Get the new amount in writing, then pay.
import { S, g, shoot, run, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
title("NEVER PAY ON A PROMISE");
cap("s2", "no", [["NO RECORD", 1]], RED);
cap("s3", "word", [["YOUR WORD", 1], ["VS THEIR COMPUTER", 1]], RED);
cap("s4", "put", [["GET IT", 1], ["IN WRITING", 1]], GREEN);
cap("s5", "settles", [["SETTLES", 1], ["THE BALANCE", 1]], GREEN, { y: 0.66 });
cap("s6", "after", [["PAY AFTER", 1], ["IT ARRIVES", 1]], VIOLET, { y: 0.66 });
endCard([["GET IT IN WRITING", 1], ["THEN PAY", 1]]);

const s = (id) => S[id][0];
const SH = [
  { at: 0, cam: Ph.wide },                                                   // the phone promise; title above the head
  { at: s("s2"), cam: Ph.close }, { at: g("s2", "no") - 0.15, cam: Ph.wide }, { at: g("s2", "Next") - 0.1, cam: E.screen },
  { at: s("s3"), cam: E.screen },
  { at: s("s4"), cam: Ph.wide }, { at: s("s4") + 1.2, cam: M.wide },
  { at: s("s5"), cam: I.close }, { at: g("s5", "settles") - 0.15, cam: I.wide },
  { at: s("s6"), cam: I.wide }, { at: s("s6") + 1.4, cam: M.wide },
  { at: s("s7"), cam: M.wide },                                              // calm set behind the end card
];

run("get-it-in-writing", (t) => {
  const wrong = t < s("s4");
  Ph.set(t, { phone: 1, shrug: t > s("s2") && wrong ? 0.5 : 0 });
  E.set(t, { label: "FULL BILL", hex: RED, slump: 0.7, type: 0.2, p: 0.2 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  I.set(t, { amount: "$4,650", stamp: "SETTLED", stampHex: GREEN, tear: 0 });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
