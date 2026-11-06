// Spoken read-back checker: typical speech-to-text output for each lesson's clearance.
// Run with: node scripts/readback-test.ts
import { checkReadback, readbackItems, reduce } from "../src/radio/readback.ts";

const cases: [string, string, string, boolean][] = [
  ["Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, Training 123.", "Training 123",
    "cleared to Mumbai via runway two eight R Z one zero one climb five thousand feet squawk four five two one training one two three", true],
  ["Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, Training 123.", "Training 123",
    "cleared to Mumbai via runway 28 RZ 101 climb 5000 ft squawk 4521 training 123", true],
  ["Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, Training 123.", "Training 123",
    "cleared to Mumbai via runway 28 romeo zulu 101 climb 5,000 feet squawk 45 21 training 123", true],
  ["Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, Training 123.", "Training 123",
    "cleared to Mumbai runway 28 RZ101 climb 3000 feet squawk 4521 training 123", false],
  ["Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, Training 123.", "Training 123",
    "cleared to Mumbai runway 28 RZ101 climb 5000 feet squawk 4251 training 123", false],
  ["Cleared to Mumbai via runway 28, RZ101, climb 5000 feet, squawk 4521, Training 123.", "Training 123",
    "cleared to Mumbai runway 28 RZ101 climb 5000 feet squawk 4521", false],
  ["Cleared to the training area via runway 28, climb 2500 feet, squawk 4521, VT-RZA.", "VT-RZA",
    "cleared to the training area via runway 2 8 climb two thousand five hundred feet squawk four five two one victor tango romeo zulu alpha", true],
  ["Cleared to the training area via runway 28, climb 2500 feet, squawk 4521, VT-RZA.", "VT-RZA",
    "cleared to training area runway 28 climb 2500 feet squawk 4521 VT RZA", true],
  ["Cleared to the training area via runway 28, climb 2500 feet, squawk 4521, VT-RZA.", "VT-RZA",
    "cleared to the training area via runway 28 climb two five zero zero feet squawk niner five two one VT RZA", false],
  ["Cleared to the training area via runway 28, climb 2500 feet, squawk 4521, VT-RZP.", "VT-RZP",
    "cleared to the training area via runway 28 climb 2500 feet squawk 4521 victor tango romeo zulu papa", true],
];
let bad = 0;
for (const [correct, cs, heard, want] of cases) {
  const r = checkReadback([heard], readbackItems(correct, cs));
  const pass = r.ok === want;
  if (!pass) bad++;
  console.log(`${pass ? "PASS" : "FAIL"} want ${want ? "ok " : "bad"} | ${r.items.map((i) => `${i.label}${i.ok ? " ✓" : " ✗"}`).join(", ")}`);
  if (!pass) console.log("   reduced:", reduce(heard));
}
process.exit(bad ? 1 : 0);
