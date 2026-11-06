// Radio message box shared by both aircraft: shows what is heard on the active COM frequency.
// On the delivery or ground frequency, a lesson's clearance is given and the learner picks the
// correct read-back from three choices.
import { ATIS_TEXT, comStation, freqText } from "./training";
import { RadioVoice } from "./voice";

export interface Clearance {
  /** Who gives the clearance. */
  station: "delivery" | "ground";
  /** What ATC says. */
  atc: string;
  /** The correct read-back first. The choices are shuffled when shown. */
  readbacks: [string, string, string];
  /** Shown after a wrong pick, to explain the mistake. */
  hint: string;
}

type Speech = { who: "atc" | "pilot"; text: string }[];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export class RadioBox {
  readonly el: HTMLElement;
  private key = "";
  private order: number[] = [0, 1, 2];
  private wrong = false;
  /** True once the correct read-back was picked. */
  readbackOk = false;
  onReadback?: () => void;
  /** Speaks what is heard. The page sets voice.enabled and voice.volume from the sound button. */
  readonly voice = new RadioVoice();

  constructor(parent: HTMLElement) {
    this.el = document.createElement("div");
    this.el.id = "radio-box";
    this.el.className = "hidden";
    parent.appendChild(this.el);
  }

  reset() {
    this.voice.stop();
    this.readbackOk = false;
    this.wrong = false;
    this.key = "";
    this.order = [0, 1, 2].sort(() => Math.random() - 0.5);
  }

  /** activeKHz = active COM frequency, or null when the radio has no power. */
  update(activeKHz: number | null, clearance: Clearance | null, callsign: string) {
    if (activeKHz === null) {
      this.render("off", "", []);
      return;
    }
    const st = comStation(activeKHz);
    const head = `<div class="rb-head">COM ${freqText(activeKHz)} · ${st ? esc(st.name) : "no station"}</div>`;
    if (!st) {
      this.render(`none-${activeKHz}`, head + `<div class="rb-msg dim">Nothing heard on this frequency.</div>`, []);
      return;
    }
    if (st.kind === "atis") {
      this.render(`atis`, head + `<div class="rb-msg">${esc(ATIS_TEXT)}</div>`, [
        { who: "atc", text: ATIS_TEXT },
      ]);
      return;
    }
    if (clearance && st.kind === clearance.station) {
      const key = `clr-${this.readbackOk}-${this.wrong}`;
      if (key === this.key) return;
      let body = `<div class="rb-msg"><b>ATC:</b> ${esc(clearance.atc)}</div>`;
      const negative = `${callsign}, negative. ${clearance.hint}`;
      const speech: Speech = this.readbackOk
        ? [
            { who: "pilot", text: clearance.readbacks[0] },
            { who: "atc", text: `${callsign}, read-back correct.` },
          ]
        : this.wrong
          ? [{ who: "atc", text: negative }]
          : [{ who: "atc", text: clearance.atc }];
      if (this.readbackOk) {
        body += `<div class="rb-msg ok"><b>You:</b> ${esc(clearance.readbacks[0])}</div><div class="rb-msg"><b>ATC:</b> ${esc(callsign)}, read-back correct.</div>`;
      } else {
        body += `<div class="rb-pick">Pick the correct read-back:</div>`;
        body += this.order
          .map((i, n) => `<button class="rb-opt" data-i="${i}" data-ctl="readback-${n}">${esc(clearance.readbacks[i])}</button>`)
          .join("");
        if (this.wrong) body += `<div class="rb-msg warn"><b>ATC:</b> Negative. ${esc(clearance.hint)}</div>`;
      }
      this.key = "";
      this.render(key, head + body, speech);
      this.el.querySelectorAll<HTMLElement>(".rb-opt").forEach((b) =>
        b.addEventListener("click", () => {
          if (b.dataset.i === "0") {
            this.readbackOk = true;
            this.onReadback?.();
          } else {
            // A second wrong pick does not change the box, so say "negative" again here.
            if (this.wrong) {
              this.voice.stop();
              this.voice.say([{ who: "atc", text: negative }]);
            }
            this.wrong = true;
          }
        }),
      );
      return;
    }
    const idle =
      st.kind === "tower"
        ? `${callsign}, hold position. Contact ground for your clearance.`
        : `${callsign}, standby.`;
    this.render(`idle-${st.kind}`, head + `<div class="rb-msg"><b>ATC:</b> ${esc(idle)}</div>`, [
      { who: "atc", text: idle },
    ]);
  }

  private render(key: string, html: string, speech: Speech) {
    if (key === this.key) return;
    this.key = key;
    // A new message replaces whatever was being said.
    this.voice.stop();
    if (speech.length) this.voice.say(speech);
    this.el.innerHTML = html;
    this.el.classList.toggle("hidden", key === "off");
  }
}
