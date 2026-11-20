// Red Pen reel 02: never assume you owe the whole hospital bill. Ask for the financial assistance policy and apply before paying.
import { S, g, shoot, run, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
title("NEVER SKIP FINANCIAL AID");
cap("s2", "credit", [["ON A CREDIT CARD", 1]], RED);
cap("s3", "interest", [["DEBT WITH", 1], ["INTEREST", 1]], RED);
cap("s4", "ask", [["ASK FOR THE", 1], ["AID POLICY", 1]], GREEN);
cap("s5", "cut", [["CUT OR", 1], ["FORGIVEN", 1]], GREEN, { y: 0.42 });   // below the wall strip, like the end card
cap("s6", "Fill", [["FILL IN THE FORM", 1]], VIOLET);
endCard([["ASK FOR AID", 1], ["BEFORE YOU PAY", 1]]);

const s = (id) => S[id][0];
const SH = [
  { at: 0, cam: I.wide },                                                    // title sits above the head in the wide shot
  { at: s("s2"), cam: I.close }, { at: g("s2", "credit") - 0.15, cam: E.screen },
  { at: s("s3"), cam: E.face }, { at: g("s3", "interest") - 0.15, cam: E.screen },
  { at: s("s4"), cam: Ph.wide }, { at: s("s4") + 1.6, cam: Ph.close },
  { at: s("s5"), cam: M.wide }, { at: s("s5") + 1.5, cam: M.onA }, { at: g("s5", "cut") - 0.15, cam: M.wide },
  { at: s("s6"), cam: E.screen }, { at: s("s6") + 1.2, cam: E.wide },
  { at: s("s7"), cam: M.wide },                                              // calm set with no screen text behind the end card
];

run("ask-for-aid", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$9,300", stamp: "DUE NOW", stampHex: RED });
  E.set(t, {
    label: wrong ? "CARD DEBT" : "AID FORM", hex: wrong ? RED : GREEN, slump: wrong ? 0.7 : 0, type: wrong ? 0.2 : 0.9,
    p: wrong ? 0.2 : ((t - s("s6")) % 4) / 4,
  });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: t < g("s5", "cut") ? { point: 1 } : { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
