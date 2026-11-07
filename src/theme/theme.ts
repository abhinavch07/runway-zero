// Light or dark theme for the whole site. Light is the default.
// The choice is kept in this browser. A tiny inline script in each page's <head> applies it
// before the first paint, so the page does not flash one theme then the other.
// On cockpit pages only the surrounding panels change: the cockpit displays stay dark.
const KEY = "runway-zero-theme";

export function setUpThemeToggle() {
  const btn = document.getElementById("rz-theme") as HTMLButtonElement | null;
  if (!btn) return;
  const root = document.documentElement;
  // Cockpit top bars are tight, so they use a short label.
  const compact = btn.dataset.compact !== undefined;
  const label = () => {
    const dark = root.dataset.theme === "dark";
    btn.textContent = compact ? (dark ? "☀ Light" : "☾ Dark") : dark ? "Light mode" : "Dark mode";
    btn.title = dark ? "Switch to the light theme" : "Switch to the dark theme";
    btn.setAttribute("aria-pressed", String(dark));
  };
  btn.addEventListener("click", () => {
    const dark = root.dataset.theme !== "dark";
    if (dark) root.dataset.theme = "dark";
    else delete root.dataset.theme;
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      /* not saved, that is fine */
    }
    label();
    // Let pages redraw anything that depends on the theme.
    window.dispatchEvent(new Event("rz-theme"));
  });
  label();
}
