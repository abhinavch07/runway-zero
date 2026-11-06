// Spoken radio messages with the browser's built-in voices (Web Speech API, free, no recordings).
// ATC uses an Indian English voice when the computer has one. The pilot uses a different voice.
// Text is turned into radio phraseology first: digits one by one, the phonetic alphabet, thousands.

const DIGIT = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "niner"];
const PHONETIC: Record<string, string> = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot", G: "Golf", H: "Hotel",
  I: "India", J: "Juliett", K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar", P: "Papa",
  Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey",
  X: "X-ray", Y: "Yankee", Z: "Zulu",
};

const digits = (n: string) => n.split("").map((d) => (d === "." ? "decimal" : DIGIT[Number(d)])).join(" ");
const spell = (s: string) =>
  s
    .split("")
    .map((ch) => (/\d/.test(ch) ? DIGIT[Number(ch)] : (PHONETIC[ch.toUpperCase()] ?? "")))
    .filter(Boolean)
    .join(" ");

/** Altitudes the radio way: 5000 = five thousand, 2500 = two thousand five hundred. */
function altitude(ft: number): string {
  const th = Math.floor(ft / 1000);
  const hu = Math.round((ft % 1000) / 100);
  return [th ? `${digits(String(th))} thousand` : "", hu ? `${digits(String(hu))} hundred` : ""].filter(Boolean).join(" ");
}

/** Turns a written message into how it is said on the radio. */
export function toPhraseology(text: string): string {
  return text
    .replace(/\bVT-([A-Z]{3})\b/g, (_m, r: string) => `Victor Tango ${spell(r)}`)
    .replace(/\bRZ(\d{3})\b/g, (_m, n: string) => `Romeo Zulu ${digits(n)}`)
    .replace(/\bTraining (\d+)\b/g, (_m, n: string) => `Training ${digits(n)}`)
    .replace(/\b(\d{3,5}) feet\b/g, (_m, n: string) => `${altitude(Number(n))} feet`)
    .replace(/\b(squawk|QNH|[Rr]unway(?: in use)?|[Tt]emperature|dew point) (\d+)\b/g, (_m, w: string, n: string) => `${w} ${digits(n)}`)
    .replace(/\b(\d{3}) degrees\b/g, (_m, n: string) => `${digits(n)} degrees`)
    .replace(/\b(\d{3}\.\d{1,3})\b/g, (_m, n: string) => digits(n))
    .replace(/\binformation ([A-Z])\b/gi, (_m, l: string) => `information ${PHONETIC[l.toUpperCase()]}`)
    .replace(/\bQNH\b/g, "Q N H")
    .replace(/\bATIS\b/g, "ay-tis");
}

export class RadioVoice {
  /** Set by the page from the sound button and volume. */
  enabled = () => true;
  volume = () => 1;
  private atc: SpeechSynthesisVoice | null = null;
  private pilot: SpeechSynthesisVoice | null = null;
  /** For tests: how many messages were spoken. */
  spoken = 0;

  constructor() {
    if (!("speechSynthesis" in window)) return;
    const pick = () => {
      const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith("en"));
      this.atc = voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang === "en-GB") ?? voices[0] ?? null;
      this.pilot = voices.find((v) => v !== this.atc && (v.lang === "en-GB" || v.lang === "en-US")) ?? voices.find((v) => v !== this.atc) ?? this.atc;
    };
    pick();
    speechSynthesis.addEventListener?.("voiceschanged", pick);
  }

  /** Stops whatever is being said (for example when the frequency changes). */
  stop() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  /** Says the messages one after the other. who: "atc" or "pilot" for each. */
  say(parts: { who: "atc" | "pilot"; text: string }[]) {
    if (!("speechSynthesis" in window) || !this.enabled()) return;
    for (const p of parts) {
      const u = new SpeechSynthesisUtterance(toPhraseology(p.text));
      const v = p.who === "atc" ? this.atc : this.pilot;
      if (v) u.voice = v;
      u.lang = v?.lang ?? "en-IN";
      u.rate = p.who === "atc" ? 1.05 : 1;
      u.pitch = p.who === "atc" ? 1 : 0.9;
      u.volume = Math.max(0, Math.min(1, this.volume()));
      speechSynthesis.speak(u);
      this.spoken++;
    }
  }
}
