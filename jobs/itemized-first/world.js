// Red Pen reel 01: never pay the first hospital bill. Ask for the itemized bill, then check every line.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
title("NEVER PAY THE FIRST BILL");
cap("s2", "summary", [["JUST A SUMMARY", 1]], RED);
cap("s3", "never", [["YOU NEVER SEE", 1], ["THE CHARGES", 1]], RED);
cap("s4", "ask", [["ASK FOR THE", 1], ["ITEMIZED BILL", 1]], GREEN);
cap("s5", "Check", [["CHECK EACH LINE", 1]], GREEN);
cap("s6", "Dispute", [["DISPUTE IT", 1], ["IN WRITING", 1]], VIOLET);
endCard([["ASK FOR ITEMIZED", 1], ["CHECK EVERY LINE", 1]]);

const s = (id) => S[id][0];
const TD = g("s6", "Dispute");      // the word that flips the stamp and starts the wide shot
const SH = [
  { at: 0, cam: I.wide },                                                   // title sits above the head in the wide shot
  { at: s("s2"), cam: I.close }, { at: g("s2", "summary") - 0.15, cam: I.wide },
  { at: s("s3"), cam: E.face }, { at: s("s3") + 1.2, cam: E.screen },
  { at: s("s4"), cam: Ph.wide }, { at: s("s4") + 1.5, cam: Ph.close },
  { at: s("s5"), cam: E.screen }, { at: s("s5") + 1.4, cam: E.wide },
  { at: s("s6"), cam: I.close }, { at: TD - 0.15, cam: I.wide },
  { at: s("s7"), cam: M.wide },                                             // calm set with no screen text behind the end card
];

run("itemized-first", (t) => {
  const wrong = t < s("s4");
  // The summary bill first; after the itemized bill shows a repeated charge, it is torn up.
  I.set(t, {
    amount: "$18,640", stamp: t < TD ? "DUE NOW" : "DISPUTE", stampHex: t < TD ? RED : GREEN,
    tear: sm(TD + 0.5, TD + 1.6, t), cheer: 1,
  });
  E.set(t, {
    label: wrong ? "PAID" : "ITEMIZED", hex: wrong ? RED : GREEN, slump: wrong ? 0.7 : 0, type: wrong ? 0.2 : 0.9,
    p: wrong ? 0.15 : ((t - s("s5")) % 4) / 4,
  });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});
