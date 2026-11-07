// Light or dark reading theme for Ground School and the feedback page. Light is the default.
// The choice is kept in this browser. A tiny inline script in each page's <head> applies it
// before the first paint, so the page does not flash dark then light.
const KEY = "runway-zero-theme";

export function setUpThemeToggle() {
  const btn = document.getElementById("gs-theme") as HTMLButtonElement | null;
  if (!btn) return;
  const root = document.documentElement;
  const label = () => {
    const dark = root.dataset.theme === "dark";
    btn.textContent = dark ? "Light mode" : "Dark mode";
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
  });
  label();
}
