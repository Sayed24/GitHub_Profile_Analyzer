(function (global) {
  "use strict";

  const state = { controller: null, left: null, right: null };

  function refs() {
    return {
      form: document.getElementById("compareForm"),
      leftInput: document.getElementById("userAInput"),
      rightInput: document.getElementById("userBInput"),
      button: document.getElementById("compareBtn"),
      results: document.getElementById("compareResults"),
      skeleton: document.getElementById("compareSkeleton"),
      error: document.getElementById("compareError"),
      errorMessage: document.getElementById("compareErrorMessage")
    };
  }

  function setLoading(loading) {
    const button = refs().button;
    if (button) {
      button.disabled = Boolean(loading);
      button.classList.toggle("is-loading", Boolean(loading));
    }
    const skeleton = refs().skeleton;
    if (skeleton) skeleton.classList.toggle("is-hidden", !loading);
  }

  function setError(message) {
    const { error, errorMessage } = refs();
    if (!error || !errorMessage) return;
    errorMessage.textContent = String(message || "Comparison failed.");
    error.classList.remove("is-hidden");
  }

  function clearError() {
    const error = refs().error;
    if (error) error.classList.add("is-hidden");
  }

  function setUrl(left, right) {
    const url = new URL(global.location.href);
    url.searchParams.set("a", left);
    url.searchParams.set("b", right);
    global.history.replaceState({ a: left, b: right }, "", url);
  }

  function render() {
    const { results } = refs();
    GHUI.renderComparisonSummary(state.left, state.right);
    GHUI.renderCompareProfile("profileA", state.left);
    GHUI.renderCompareProfile("profileB", state.right);
    GHCharts.renderCompareLanguageChart(state.left.metrics.languages, state.right.metrics.languages, state.left.user.login, state.right.user.login);
    GHUI.updateRateLimit(state.right.meta.rateLimit || state.left.meta.rateLimit);
    if (results) results.classList.remove("is-hidden");
  }

  async function compare(rawLeft, rawRight) {
    const leftName = GHUtils.normalizeUsername(rawLeft);
    const rightName = GHUtils.normalizeUsername(rawRight);
    if (!leftName || !rightName) {
      setError("Enter two valid GitHub usernames or GitHub profile URLs.");
      return;
    }
    if (leftName.toLowerCase() === rightName.toLowerCase()) {
      setError("Choose two different GitHub profiles for comparison.");
      return;
    }

    const r = refs();
    if (state.controller) state.controller.abort();
    state.controller = new AbortController();
    clearError();
    if (r.results) r.results.classList.add("is-hidden");
    if (r.leftInput) r.leftInput.value = leftName;
    if (r.rightInput) r.rightInput.value = rightName;
    setLoading(true);

    try {
      const [left, right] = await Promise.all([
        GitHubAPI.getProfileBundle(leftName, { signal: state.controller.signal }),
        GitHubAPI.getProfileBundle(rightName, { signal: state.controller.signal })
      ]);
      state.left = left;
      state.right = right;
      render();
      setUrl(left.user.login, right.user.login);
      if (left.meta.stale || right.meta.stale) GHUI.toast("At least one profile is using stale cached data because the network was unavailable.", "");
    } catch (error) {
      if (error && error.name === "AbortError") return;
      setError(error && error.message ? error.message : "The profiles could not be compared.");
    } finally {
      setLoading(false);
      state.controller = null;
    }
  }

  function init() {
    const r = refs();
    if (r.form) r.form.addEventListener("submit", (event) => {
      event.preventDefault();
      compare(r.leftInput.value, r.rightInput.value);
    });
    global.addEventListener("ghpa:themechange", () => GHCharts.refreshForTheme());

    const params = new URL(global.location.href).searchParams;
    const left = params.get("a");
    const right = params.get("b");
    if (left && right) compare(left, right);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.GHCompare = { compare };
})(window);
