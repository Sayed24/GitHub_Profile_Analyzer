(function (global) {
  "use strict";

  const HISTORY_KEY = "ghpa:history";
  const FAVORITES_KEY = "ghpa:favorites";
  const MAX_HISTORY = 5;
  const MAX_FAVORITES = 8;

  const state = {
    bundle: null,
    controller: null,
    history: [],
    favorites: []
  };

  function dom() {
    return {
      form: document.getElementById("searchForm"),
      input: document.getElementById("usernameInput"),
      clearHistory: document.getElementById("clearHistoryBtn"),
      repoSearch: document.getElementById("repoSearchInput"),
      languageFilter: document.getElementById("languageFilter"),
      repoSort: document.getElementById("repoSort")
    };
  }

  function readLists() {
    state.history = GHUtils.readStorage(HISTORY_KEY, []);
    state.favorites = GHUtils.readStorage(FAVORITES_KEY, []);
    if (!Array.isArray(state.history)) state.history = [];
    if (!Array.isArray(state.favorites)) state.favorites = [];
  }

  function persistHistory(username) {
    const canonical = String(username);
    state.history = [canonical, ...state.history.filter((item) => item.toLowerCase() !== canonical.toLowerCase())].slice(0, MAX_HISTORY);
    GHUtils.writeStorage(HISTORY_KEY, state.history);
    renderQuickAccess();
  }

  function toggleFavorite(username) {
    const exists = state.favorites.some((item) => item.toLowerCase() === username.toLowerCase());
    if (exists) state.favorites = state.favorites.filter((item) => item.toLowerCase() !== username.toLowerCase());
    else state.favorites = [username, ...state.favorites.filter((item) => item.toLowerCase() !== username.toLowerCase())].slice(0, MAX_FAVORITES);
    GHUtils.writeStorage(FAVORITES_KEY, state.favorites);
    renderQuickAccess();
    if (state.bundle) GHUI.renderProfile(state.bundle, isFavorite(state.bundle.user.login));
    bindProfileActions();
    GHUI.toast(exists ? "Removed from favorites." : "Saved to favorites.", exists ? "" : "success");
  }

  function isFavorite(username) {
    return state.favorites.some((item) => item.toLowerCase() === String(username).toLowerCase());
  }

  function renderQuickAccess() {
    GHUI.renderHistory(state.history, (username) => search(username));
    GHUI.renderFavorites(state.favorites, (username) => search(username));
  }

  function setUrl(username) {
    const url = new URL(global.location.href);
    url.searchParams.set("user", username);
    global.history.replaceState({ user: username }, "", url);
  }

  function clearUrl() {
    const url = new URL(global.location.href);
    url.searchParams.delete("user");
    global.history.replaceState({}, "", url);
  }

  function rateStatus(bundle) {
    GHUI.updateRateLimit(bundle && bundle.meta ? bundle.meta.rateLimit : GitHubAPI.getRateLimit());
  }

  function applyRepoView() {
    if (!state.bundle) return;
    const refs = dom();
    const repos = GHUtils.filterAndSortRepos(
      state.bundle.repos,
      refs.repoSearch ? refs.repoSearch.value : "",
      refs.languageFilter ? refs.languageFilter.value : "all",
      refs.repoSort ? refs.repoSort.value : "updated"
    );
    GHUI.renderRepos(repos, state.bundle.repos.length);
  }

  function renderBundle(bundle) {
    state.bundle = bundle;
    GHUI.renderProfile(bundle, isFavorite(bundle.user.login));
    GHUI.renderStats(bundle);
    GHUI.renderInsights(bundle);
    GHUI.renderHealth(bundle);
    GHUI.renderRepoFilters(bundle.repos);
    GHUI.renderActivity(bundle.events);
    GHCharts.renderLanguageChart(bundle.metrics.languages);
    GHCharts.renderStarsChart(bundle.repos);
    applyRepoView();
    bindProfileActions();
    GHUI.showDashboard(true);
    rateStatus(bundle);
  }

  async function search(rawInput, options) {
    const refs = dom();
    const username = GHUtils.normalizeUsername(rawInput == null ? refs.input.value : rawInput);
    if (!username) {
      GHUI.showError("Enter a valid GitHub username or paste a GitHub profile URL.", "Check the username");
      return;
    }

    if (state.controller) state.controller.abort();
    state.controller = new AbortController();

    GHUI.hideError();
    GHUI.showDashboard(false);
    GHUI.showSkeleton(true);
    GHUI.setSearchLoading(true);
    if (refs.input) refs.input.value = username;

    try {
      const bundle = await GitHubAPI.getProfileBundle(username, {
        signal: state.controller.signal,
        forceRefresh: Boolean(options && options.forceRefresh)
      });
      renderBundle(bundle);
      persistHistory(bundle.user.login);
      setUrl(bundle.user.login);

      if (bundle.meta.stale) GHUI.toast("Showing cached data because the latest network request was unavailable.", "");
      else if (bundle.meta.fromCache) GHUI.toast("Loaded quickly from the local cache.", "success");
    } catch (error) {
      if (error && error.name === "AbortError") return;
      state.bundle = null;
      GHUI.showDashboard(false);
      GHUI.showError(error && error.message ? error.message : "The profile could not be loaded.", "Unable to analyze profile");
      rateStatus(null);
    } finally {
      GHUI.showSkeleton(false);
      GHUI.setSearchLoading(false);
      state.controller = null;
    }
  }

  async function shareCurrentProfile() {
    if (!state.bundle) return;
    const url = new URL(global.location.href);
    url.searchParams.set("user", state.bundle.user.login);
    const value = url.toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: `${state.bundle.user.login} • GitHub Profile Analyzer`, text: `GitHub profile analysis for @${state.bundle.user.login}`, url: value });
      } else if (navigator.clipboard && global.isSecureContext) {
        await navigator.clipboard.writeText(value);
        GHUI.toast("Share link copied to the clipboard.", "success");
      } else {
        const input = document.createElement("textarea");
        input.value = value;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
        GHUI.toast("Share link copied to the clipboard.", "success");
      }
    } catch (error) {
      if (error && error.name !== "AbortError") GHUI.toast("The share action could not be completed.", "error");
    }
  }

  async function exportCurrentProfile() {
    if (!state.bundle) return;
    const dashboard = document.getElementById("dashboard");
    GHUI.toast("Preparing the profile report…", "", "PDF export");
    try {
      const mode = await GHUtils.exportElementAsPDF(dashboard, `${state.bundle.user.login}-github-analysis.pdf`);
      if (mode === "print") GHUI.toast("The PDF library was unavailable, so the browser print dialog opened. Choose Save as PDF.", "");
      else GHUI.toast("PDF report generated.", "success");
    } catch (error) {
      GHUI.toast(error.message || "The report could not be exported.", "error");
    }
  }

  function bindProfileActions() {
    const share = document.getElementById("shareProfileBtn");
    const favorite = document.getElementById("favoriteProfileBtn");
    const exportBtn = document.getElementById("exportPdfBtn");
    if (share) share.addEventListener("click", shareCurrentProfile);
    if (favorite && state.bundle) favorite.addEventListener("click", () => toggleFavorite(state.bundle.user.login));
    if (exportBtn) exportBtn.addEventListener("click", exportCurrentProfile);
  }

  function bindStaticEvents() {
    const refs = dom();
    if (refs.form) refs.form.addEventListener("submit", (event) => {
      event.preventDefault();
      search(refs.input.value);
    });

    if (refs.clearHistory) refs.clearHistory.addEventListener("click", () => {
      state.history = [];
      GHUtils.writeStorage(HISTORY_KEY, []);
      renderQuickAccess();
      GHUI.toast("Recent search history cleared.", "success");
    });

    [refs.repoSearch, refs.languageFilter, refs.repoSort].filter(Boolean).forEach((control) => {
      control.addEventListener(control.tagName === "INPUT" ? "input" : "change", applyRepoView);
    });

    global.addEventListener("ghpa:themechange", () => GHCharts.refreshForTheme());
    global.addEventListener("popstate", () => {
      const username = new URL(global.location.href).searchParams.get("user");
      if (username) search(username);
      else {
        if (refs.input) refs.input.value = "";
        state.bundle = null;
        GHUI.showDashboard(false);
        GHUI.hideError();
      }
    });
  }

  function init() {
    readLists();
    renderQuickAccess();
    bindStaticEvents();
    const params = new URL(global.location.href).searchParams;
    const initialUser = params.get("user");
    if (initialUser) search(initialUser);
    else {
      GHUI.showDashboard(false);
      GHUI.showSkeleton(false);
      GHUI.hideError();
      clearUrl();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.GHApp = { search, exportCurrentProfile, shareCurrentProfile };
})(window);
