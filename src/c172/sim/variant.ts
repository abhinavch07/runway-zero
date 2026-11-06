// The light aircraft that share the glass-cockpit page: the Cessna 172 and the Piper PA-28.
// Each variant sets its model files, fuel selector, flap stages, priming and lower-panel extras.
import type { FuelSel } from "./types.ts";

export type GaId = "c172" | "pa28";

export interface GaVariant {
  id: GaId;
  /** Shown in the top bar and the picker. Generic type names, no makers' branding. */
  name: string;
  /** JSBSim model directory and the files the worker loads. */
  model: string;
  modelFiles: string[];
  /** Fuel selector positions from left to right on the panel. */
  fuelSel: FuelSel[];
  /** Where the selector sits at a cold start. */
  coldFuelSel: FuelSel;
  /** Has a separate fuel shutoff valve (C172). */
  fuelShutoff: boolean;
  /** Has a standby battery for the PFD. */
  stbyBatt: boolean;
  /** Primes with a hand primer (PA-28). Otherwise the electric fuel pump primes (C172). */
  primer: boolean;
  /** Flap stages in degrees. The last one is full flap. */
  flapDeg: number[];
  /** Default callsign for the radio box. */
  callsign: string;
}

export const GA_VARIANTS: Record<GaId, GaVariant> = {
  c172: {
    id: "c172",
    name: "Cessna 172",
    model: "c172p",
    modelFiles: ["aircraft/c172p/c172p.xml", "engine/eng_io320.xml", "engine/prop_75in2f.xml"],
    fuelSel: ["LEFT", "BOTH", "RIGHT"],
    coldFuelSel: "BOTH",
    fuelShutoff: true,
    stbyBatt: true,
    primer: false,
    flapDeg: [0, 10, 20, 30],
    callsign: "VT-RZA",
  },
  pa28: {
    id: "pa28",
    name: "PA-28",
    model: "pa28",
    modelFiles: ["aircraft/pa28/pa28.xml", "engine/engIO360C.xml", "engine/prop_75in2f.xml"],
    fuelSel: ["OFF", "LEFT", "RIGHT"],
    coldFuelSel: "LEFT",
    fuelShutoff: false,
    stbyBatt: true,
    primer: true,
    flapDeg: [0, 10, 25, 40],
    callsign: "VT-RZP",
  },
};
