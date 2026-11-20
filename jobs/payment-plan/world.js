// Red Pen reel 05: never put a hospital bill on a credit card first. Ask for a payment plan.
import { S, g, shoot, run, sm, bloom, RED, GREEN, VIOLET } from "./kit.js";
import { title, cap, endCard, overlays } from "./extra.js";
import { editorDesk, phoneCall, meeting, invoiceTear } from "./scenes.js";

const E = editorDesk(), Ph = phoneCall(), M = meeting(), I = invoiceTear();
const s = (id) => S[id][0];

title("NEVER CHARGE IT TO A CARD");
cap("s2", "interest", [["INTEREST", 1], ["EVERY MONTH", 1]], RED);
cap("s3", "no", [["NO REASON", 1], ["TO NEGOTIATE", 1]], RED);
cap("s4", "payment", [["ASK FOR A", 1], ["PAYMENT PLAN", 1]], GREEN);
cap("s5", "no", [["NO INTEREST", 1]], GREEN);
cap("s6", "writing", [["GET THE PLAN", 1], ["IN WRITING", 1]], VIOLET, { y: 0.66 });
endCard([["ASK FOR A PLAN", 1], ["SKIP THE CARD", 1]]);

const SH = [
  { at: 0, cam: I.wide },
  { at: s("s2"), cam: E.face }, { at: g("s2", "interest") - 0.15, cam: E.screen },
  { at: s("s3"), cam: I.close }, { at: g("s3", "it") - 0.15, cam: E.wide },
  { at: s("s4"), cam: Ph.close }, { at: g("s4", "for") - 0.1, cam: Ph.wide },
  { at: s("s5"), cam: M.onB }, { at: g("s5", "with") - 0.1, cam: M.wide }, { at: g("s5", "Ask"), cam: M.onA },
  { at: s("s6"), cam: I.close }, { at: g("s6", "get") - 0.15, cam: I.wide },
  { at: s("s7"), cam: M.wide },
];

run("payment-plan", (t) => {
  const wrong = t < s("s4");
  I.set(t, { amount: wrong ? "$6,200" : "$150 / MO", stamp: wrong ? "PAID BY CARD" : "IN WRITING", stampHex: wrong ? RED : GREEN, tear: 0, cheer: wrong ? 0 : 1 });
  E.set(t, { label: "INTEREST", hex: RED, slump: 0.7, type: 0.2, p: ((t - s("s2")) % 5) / 5 });
  Ph.set(t, { phone: 1 });
  M.set(t, { a: { nod: 1 }, b: { nod: 1 } });
  const { punch } = shoot(SH, t);
  const spike = overlays(t);
  bloom.strength = 0.8 + 0.6 * punch * punch + spike;
});

