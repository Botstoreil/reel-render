// Red Pen reel 08: never pay a debt collector on the first call. Get the notice in writing and check it.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER PAY ON THE FIRST CALL");
cap("s2", "even", [["IS IT EVEN", 1], ["YOUR DEBT?", 1]], RED);
cap("s3", "before", [["PAID BEFORE", 1], ["YOU CHECKED", 1]], RED);
cap("s4", "send", [["ASK FOR IT", 1], ["IN WRITING", 1]], GREEN);
cap("s5", "amount", [["THE AMOUNT AND", 1], ["WHO YOU OWE", 1]], GREEN, { y: 0.66 });
cap("s6", "dispute", [["DISPUTE IN", 1], ["30 DAYS", 1]], VIOLET);
endCard([["NOTICE IN WRITING", 1], ["CHECK THEN PAY", 1]]);

const SH = [
  { at: 0, cam: Ph.wide },
  { at: s("s2"), cam: Ph.close }, { at: g("s2", "or") - 0.15, cam: E.screen },
  { at: s("s3"), cam: E.face }, { at: g("s3", "and") - 0.1, cam: E.wide },
  { at: s("s4"), cam: Ph.wide },
  { at: s("s5"), cam: I.close }, { at: g("s5", "with") - 0.15, cam: I.wide },
  { at: s("s6"), cam: M.onA }, { at: g("s6", "dispute") - 0.15, cam: M.wide },
  { at: s("s7"), cam: M.wide },
];

run("collector-call", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "$1,280", stamp: "CHECK IT", stampHex: GREEN, tear: 0 });
  E.set(t, { label: "WHO OWES?", hex: RED, slump: 0.7, type: 0.1, p: 0.2 });
  Ph.set(t, { phone: 1, shrug: t > s("s2") && wrong ? 0.5 : 0 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

