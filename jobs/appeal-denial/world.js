// Red Pen reel 10: never accept a denied claim. Read the reason and appeal in writing.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER ACCEPT A DENIAL");
cap("s2", "coding", [["A CODING", 1], ["MISTAKE?", 1]], RED);
cap("s3", "share", [["THEIR SHARE", 1], ["BECOMES YOURS", 1]], RED, { y: 0.66 });
cap("s4", "reason", [["READ THE", 1], ["REASON", 1]], GREEN);
cap("s5", "180", [["180 DAYS", 1], ["TO APPEAL", 1]], GREEN);
cap("s6", "writing", [["APPEAL IN", 1], ["WRITING", 1]], VIOLET);
endCard([["READ THE REASON", 1], ["APPEAL IN WRITING", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: E.face }, { at: g("s2", "coding") - 0.15, cam: E.screen },
  { at: s("s3"), cam: I.close }, { at: g("s3", "insurer's") - 0.15, cam: I.wide },
  { at: s("s4"), cam: E.wide }, { at: g("s4", "reason") - 0.15, cam: E.screen },
  { at: s("s5"), cam: E.face }, { at: g("s5", "180") - 0.15, cam: E.screen },
  { at: s("s6"), cam: M.onA }, { at: g("s6", "send") - 0.15, cam: M.wide },
  { at: s("s7"), cam: M.wide },
];

run("appeal-denial", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$7,850", stamp: "DENIED", stampHex: RED, tear: 0, slump: 0.5 });
  E.set(t, { label: wrong ? "DENIED" : "APPEAL", hex: wrong ? RED : GREEN, slump: wrong ? 0.6 : 0, type: wrong ? 0.2 : 0.9, p: wrong ? 0.3 : ((t - s("s4")) % 4) / 4 });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

