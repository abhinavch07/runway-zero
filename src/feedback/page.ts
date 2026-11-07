// Feedback page: shows what the visitor is reporting (from ?ref=) and embeds the Google Form.
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "../welcome/style.css";
import "../ground/style.css";
import "../ground/light.css";
import "./page.css";
import { setUpThemeToggle } from "../ground/theme";
import { FEEDBACK_FORM_URL } from "./config";

setUpThemeToggle();

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// Only short, plain references are shown, such as "m6-22" or "Ground School, Module 6".
const ref = (new URLSearchParams(location.search).get("ref") ?? "").slice(0, 80).replace(/[^\w ,.:/-]/g, "");

const refBox = document.getElementById("fb-ref")!;
if (ref) {
  refBox.hidden = false;
  refBox.innerHTML = `<p>You are reporting: <b>${esc(ref)}</b></p>
    <p class="gs-small">Please mention this in your message so we can find it quickly.</p>
    <button class="w-btn w-btn-quiet" id="fb-copy" type="button">Copy reference</button>`;
  document.getElementById("fb-copy")!.addEventListener("click", async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(ref);
      b.textContent = "Copied";
    } catch {
      b.textContent = "Copy failed, please type it";
    }
  });
}

const formBox = document.getElementById("fb-form")!;
const url = FEEDBACK_FORM_URL.trim();
if (/^https:\/\/docs\.google\.com\/forms\//.test(url) || /^https:\/\/forms\.gle\//.test(url)) {
  // Google shows the form inside a frame when the link ends with embedded=true.
  const embed = url.includes("docs.google.com") ? url + (url.includes("?") ? "&" : "?") + "embedded=true" : url;
  formBox.innerHTML = `<iframe src="${esc(embed)}" title="Feedback form" loading="lazy">Loading the form…</iframe>
    <p class="gs-small">Form not showing? <a href="${esc(url)}" target="_blank" rel="noopener">Open it in a new tab</a>.</p>`;
} else {
  formBox.innerHTML = `<div class="fb-soon"><h2>The form is being set up</h2><p>Please check back in a day or two. Thank you for wanting to help.</p></div>`;
}
