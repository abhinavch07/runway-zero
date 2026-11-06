// Radio message box shared by both aircraft: shows what is heard on the active COM frequency.
// On the delivery or ground frequency, a lesson's clearance is given and the learner picks the
// correct read-back from three choices.
import { ATIS_TEXT, comStation, freqText } from "./training";
import { RadioVoice } from "./voice";
import { checkReadback, readbackItems, speechRecognition, type ReadbackResult, type SpeechRecognitionLike } from "./readback";

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
  private speaking = false;
  /** True once the correct read-back was picked or spoken. */
  readbackOk = false;
  // Speaking the read-back (Chrome and Edge).
  private rec: SpeechRecognitionLike | null = null;
  private listening = false;
  private spoken: (ReadbackResult & { heard: string }) | null = null;
  private spokenVer = 0;
  private micNote = "";
  private clearance: Clearance | null = null;
  private callsign = "";
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
    this.rec?.abort();
    this.listening = false;
    this.spoken = null;
    this.micNote = "";
    this.readbackOk = false;
    this.wrong = false;
    this.key = "";
    this.order = [0, 1, 2].sort(() => Math.random() - 0.5);
  }

  /** activeKHz = active COM frequency, or null when the radio has no power. */
  update(activeKHz: number | null, clearance: Clearance | null, callsign: string) {
    // Only the radio lessons (the ones with a clearance) speak. Elsewhere the box is text only.
    this.speaking = clearance !== null;
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
      this.clearance = clearance;
      this.callsign = callsign;
      const key = `clr-${this.readbackOk}-${this.wrong}-${this.listening}-${this.spokenVer}-${this.micNote}`;
      if (key === this.key) return;
      let body = `<div class="rb-msg"><b>ATC:</b> ${esc(clearance.atc)}</div>`;
      const negative = `${callsign}, negative. ${clearance.hint}`;
      const missed = this.spoken && !this.spoken.ok ? this.spoken.items.filter((i) => !i.ok).map((i) => i.kind) : [];
      const spokenNegative = `${callsign}, negative. Check the ${missed.length > 1 ? missed.slice(0, -1).join(", ") + " and " + missed[missed.length - 1] : missed[0]}.`;
      const byVoice = this.readbackOk && this.spoken?.ok;
      const speech: Speech = this.listening
        ? []
        : this.readbackOk
          ? byVoice
            ? [{ who: "atc", text: `${callsign}, read-back correct.` }]
            : [
                { who: "pilot", text: clearance.readbacks[0] },
                { who: "atc", text: `${callsign}, read-back correct.` },
              ]
          : missed.length
            ? [{ who: "atc", text: spokenNegative }]
            : this.wrong
              ? [{ who: "atc", text: negative }]
              : [{ who: "atc", text: clearance.atc }];
      if (this.readbackOk) {
        const said = byVoice ? this.spoken!.heard : clearance.readbacks[0];
        body += `<div class="rb-msg ok"><b>You:</b> ${esc(said)}</div><div class="rb-msg"><b>ATC:</b> ${esc(callsign)}, read-back correct.</div>`;
      } else {
        body += `<div class="rb-pick">Pick the correct read-back:</div>`;
        body += this.order
          .map((i, n) => `<button class="rb-opt" data-i="${i}" data-ctl="readback-${n}">${esc(clearance.readbacks[i])}</button>`)
          .join("");
        if (this.wrong && !missed.length) body += `<div class="rb-msg warn"><b>ATC:</b> Negative. ${esc(clearance.hint)}</div>`;
        body += this.speakHtml(missed.length ? spokenNegative : "");
      }
      this.key = "";
      this.render(key, head + body, speech);
      this.el.querySelectorAll<HTMLElement>(".rb-opt").forEach((b) =>
        b.addEventListener("click", () => {
          this.stopListening();
          if (b.dataset.i === "0") {
            this.readbackOk = true;
            this.spoken = null;
            this.onReadback?.();
          } else {
            // A second wrong pick does not change the box, so say "negative" again here.
            if (this.wrong) {
              this.voice.stop();
              this.voice.say([{ who: "atc", text: negative }]);
            }
            this.wrong = true;
            this.spoken = null;
            this.spokenVer++;
          }
        }),
      );
      this.el.querySelector(".rb-mic")?.addEventListener("click", () => (this.listening ? this.stopListening() : this.listen()));
      // Bring the Speak result into view: the box scrolls when the lesson column is short.
      if (this.listening || this.spoken || this.micNote || this.readbackOk) this.el.scrollTop = this.el.scrollHeight;
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

  /** The Speak button, what was heard, and which items were right. */
  private speakHtml(atcNegative: string): string {
    if (!speechRecognition()) return `<div class="rb-note">Or say it out loud: speaking your read-back works in Chrome and Edge.</div>`;
    let h = `<div class="rb-speak"><button class="rb-mic${this.listening ? " on" : ""}" data-ctl="readback-speak" title="Uses your microphone. The browser turns speech into text with its own online service (Google in Chrome, Microsoft in Edge). Runway Zero does not record or keep anything.">${
      this.listening ? "■ STOP" : "🎤 SPEAK"
    }</button><span>Say your read-back out loud, or pick one above</span></div>`;
    if (this.listening) h += `<div class="rb-heard">Listening. Say the whole read-back, then stop talking.</div>`;
    if (this.micNote) h += `<div class="rb-msg warn">${esc(this.micNote)}</div>`;
    const r = this.spoken;
    if (r && !this.listening) {
      h += `<div class="rb-heard"><b>Heard:</b> ${esc(r.heard || "nothing")}</div>`;
      h += `<ul class="rb-items">${r.items.map((i) => `<li class="${i.ok ? "ok" : "miss"}">${i.ok ? "✓" : "✗"} ${esc(i.label)}</li>`).join("")}</ul>`;
      if (atcNegative) h += `<div class="rb-msg warn"><b>ATC:</b> ${esc(atcNegative)}</div>`;
    }
    return h;
  }

  private listen() {
    const SR = speechRecognition();
    const clr = this.clearance;
    if (!SR || !clr) return;
    this.voice.stop();
    const rec = new SR();
    this.rec = rec;
    const lang = navigator.language || "en-US";
    rec.lang = lang.toLowerCase().startsWith("en") ? lang : "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 4;
    rec.continuous = true;
    const finals: string[][] = [];
    let interim = "";
    let silence = 0;
    rec.onresult = (e) => {
      finals.length = 0;
      interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finals.push(Array.from({ length: res.length }, (_, k) => res[k].transcript));
        else interim += res[0].transcript;
      }
      const text = finals.map((f) => f[0]).join(" ") + " " + interim;
      const el = this.el.querySelector(".rb-heard");
      if (el) el.innerHTML = `<b>Hearing:</b> ${esc(text.trim())}`;
      // Stop by itself after a short pause once something was said.
      clearTimeout(silence);
      silence = window.setTimeout(() => rec.stop(), 1800);
    };
    rec.onerror = (e) => {
      this.micNote =
        e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "The microphone is blocked. Allow it for this site in the browser's address bar, then press Speak again."
          : e.error === "no-speech"
            ? "Nothing was heard. Press Speak and try again, close to the microphone."
            : e.error === "network"
              ? "Speech recognition needs an internet connection in this browser."
              : e.error === "aborted"
                ? ""
                : `The microphone did not work (${e.error}). You can still pick the read-back above.`;
    };
    rec.onend = () => {
      clearTimeout(silence);
      if (this.rec !== rec) return;
      this.rec = null;
      this.listening = false;
      const said = finals.length ? finals.map((f) => f[0]).join(" ") + " " + interim : interim;
      if (said.trim()) {
        // Try the recogniser's other guesses too, one final part at a time.
        const guesses = new Set<string>([said]);
        const parts = finals.length ? finals : [[interim]];
        for (let k = 1; k < 4; k++) guesses.add(parts.map((f) => f[Math.min(k, f.length - 1)]).join(" ") + (finals.length ? " " + interim : ""));
        const items = readbackItems(clr.readbacks[0], this.callsign);
        const r = checkReadback([...guesses], items);
        this.spoken = r;
        this.micNote = "";
        if (r.ok) {
          this.readbackOk = true;
          this.onReadback?.();
        }
      }
      this.spokenVer++;
    };
    this.micNote = "";
    this.spoken = null;
    this.listening = true;
    this.spokenVer++;
    try {
      rec.start();
    } catch {
      this.listening = false;
      this.micNote = "The microphone could not start. Try again in a moment.";
    }
  }

  private stopListening() {
    if (this.rec && this.listening) this.rec.stop();
  }

  private render(key: string, html: string, speech: Speech) {
    if (key === this.key) return;
    this.key = key;
    // A new message replaces whatever was being said.
    this.voice.stop();
    if (speech.length && this.speaking) this.voice.say(speech);
    this.el.innerHTML = html;
    this.el.classList.toggle("hidden", key === "off");
  }
}
