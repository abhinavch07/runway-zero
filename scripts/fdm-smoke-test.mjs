// Runs the JSBSim A320 stand-in model in Node for 60 seconds and prints the state.
// Used to check the flight model works before wiring it into the browser.
import { readFileSync } from "node:fs";
import { JSBSimSdk } from "@0x62/jsbsim-wasm";

const root = new URL("../public/jsbsim/", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

const wasmDir = new URL("../node_modules/@0x62/jsbsim-wasm/dist/wasm/", import.meta.url);
const sdk = await JSBSimSdk.create({
  moduleUrl: new URL("jsbsim_wasm.mjs", wasmDir),
  wasmUrl: new URL("jsbsim_wasm.wasm", wasmDir),
  log: { console: false },
});
sdk.writeDataFile("aircraft/A320/A320.xml", read("aircraft/A320/A320.xml"));
sdk.writeDataFile("engine/CFM56_5.xml", read("engine/CFM56_5.xml"));
sdk.writeDataFile("engine/direct.xml", read("engine/direct.xml"));
sdk.configurePaths({ aircraftPath: "aircraft", enginePath: "engine", systemsPath: "systems" });

if (!sdk.loadModel("A320")) throw new Error("A320 model failed to load");
sdk.setDt(1 / 120);

const ic = {
  "ic/lat-geod-deg": 28.5665,
  "ic/long-gc-deg": 77.1031,
  "ic/h-sl-ft": 3000,
  "ic/vc-kts": 220,
  "ic/psi-true-deg": 280,
  "ic/gamma-deg": 0,
};
for (const [k, v] of Object.entries(ic)) sdk.setPropertyValue(k, v);
sdk.runIc();
sdk.setPropertyValue("propulsion/set-running", -1);
sdk.setPropertyValue("gear/gear-cmd-norm", 0);
sdk.doTrim(1); // full trim at the start condition
for (let i = 0; i < 2; i++) sdk.setPropertyValue(`fcs/throttle-cmd-norm[${i}]`, sdk.getPropertyValue(`fcs/throttle-cmd-norm[${i}]`));

const show = (t) =>
  console.log(
    `t=${t.toFixed(0)}s alt=${sdk.getPropertyValue("position/h-sl-ft").toFixed(0)}ft ` +
      `kias=${sdk.getPropertyValue("velocities/vc-kts").toFixed(0)} ` +
      `pitch=${sdk.getPropertyValue("attitude/theta-deg").toFixed(1)} ` +
      `roll=${sdk.getPropertyValue("attitude/phi-deg").toFixed(1)} ` +
      `hdg=${sdk.getPropertyValue("attitude/psi-deg").toFixed(0)} ` +
      `n1=${sdk.getPropertyValue("propulsion/engine[0]/n1").toFixed(1)} ` +
      `thr=${sdk.getPropertyValue("fcs/throttle-cmd-norm[0]").toFixed(2)}`,
  );

const t0 = performance.now();
show(0);
for (let s = 1; s <= 60; s++) {
  for (let i = 0; i < 120; i++) sdk.run();
  if (s % 10 === 0) show(s);
}
console.log(`60 s of sim took ${(performance.now() - t0).toFixed(0)} ms of CPU`);
