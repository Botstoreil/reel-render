// Red Pen reel 09: never sign up for a medical credit card at the front desk. Ask for the hospital plan first.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER TAKE THE MEDICAL CARD");
cap("s2", "deferred", [["DEFERRED", 1], ["INTEREST", 1]], RED);
cap("s3", "charged", [["CHARGED BACK", 1], ["TO DAY ONE", 1]], RED);
cap("s4", "payment", [["ASK FOR THEIR", 1], ["PAYMENT PLAN", 1]], GREEN);
cap("s5", "interest", [["ANY INTEREST?", 1]], GREEN);
cap("s6", "promotion", [["READ THE", 1], ["END DATE", 1]], VIOLET, { y: 0.66 });
endCard([["HOSPITAL PLAN FIRST", 1], ["READ BEFORE YOU SIGN", 1]]);

const SH = [
  { at: 0, cam: Ph.wide },
  { at: s("s2"), cam: E.face }, { at: g("s2", "deferred") - 0.15, cam: E.screen },
  { at: s("s3"), cam: E.wide },
  { at: s("s4"), cam: Ph.close }, { at: g("s4", "payment") - 0.15, cam: Ph.wide },
  { at: s("s5"), cam: M.onB }, { at: g("s5", "interest") - 0.15, cam: M.wide },
  { at: s("s6"), cam: I.close }, { at: g("s6", "read") - 0.15, cam: I.wide },
  { at: s("s7"), cam: M.wide },
];

run("medical-credit-card", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: "0% FOR 12 MO", stamp: "READ TERMS", stampHex: VIOLET, tear: 0 });
  E.set(t, { label: "INTEREST", hex: RED, slump: 0.7, type: 0.2, p: ((t - s("s2")) % 5) / 5 });
  Ph.set(t, { phone: 1, shrug: t > s("s2") && wrong ? 0.4 : 0 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

