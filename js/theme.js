(function (global) {
  "use strict";

  const STORAGE_KEY = "ghpa:theme";
  const root = document.documentElement;

  function systemTheme() {
    return global.matchMedia && global.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function readSavedTheme() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (_) {
      return null;
    }
  }

  function updateThemeColor(theme) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#ffffff" : "#0d1117");
  }

  function applyTheme(theme, persist) {
    const next = theme === "light" ? "light" : "dark";
    root.dataset.theme = next;
    updateThemeColor(next);
    if (persist) {
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* no-op */ }
    }
    global.dispatchEvent(new CustomEvent("ghpa:themechange", { detail: { theme: next } }));
    return next;
  }

  function toggleTheme() {
    return applyTheme(root.dataset.theme === "light" ? "dark" : "light", true);
  }

  function init() {
    applyTheme(readSavedTheme() || systemTheme(), false);
    const button = document.getElementById("themeToggle");
    if (button) button.addEventListener("click", toggleTheme);

    const media = global.matchMedia && global.matchMedia("(prefers-color-scheme: light)");
    if (media && media.addEventListener) {
      media.addEventListener("change", () => {
        if (!readSavedTheme()) applyTheme(systemTheme(), false);
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.GHTheme = { applyTheme, toggleTheme, current: () => root.dataset.theme || "dark" };
})(window);
