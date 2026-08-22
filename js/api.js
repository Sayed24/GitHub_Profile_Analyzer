(function (global) {
  "use strict";

  const BASE_URL = "https://api.github.com";
  const CACHE_PREFIX = "ghpa:api:";
  const CACHE_INDEX_KEY = "ghpa:api:index";
  const PROFILE_TTL = 15 * 60 * 1000;
  const REPOS_TTL = 15 * 60 * 1000;
  const EVENTS_TTL = 8 * 60 * 1000;
  const MAX_CACHE_ENTRIES = 24;
  const MAX_REPO_PAGES = 3;

  let rateLimit = { remaining: null, limit: null, reset: null };

  class GitHubAPIError extends Error {
    constructor(message, status, details) {
      super(message);
      this.name = "GitHubAPIError";
      this.status = status || 0;
      this.details = details || null;
    }
  }

  function cacheKey(key) {
    return `${CACHE_PREFIX}${key}`;
  }

  function getCached(key) {
    try {
      const raw = localStorage.getItem(cacheKey(key));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.data ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function touchCacheIndex(key) {
    try {
      const current = GHUtils.readStorage(CACHE_INDEX_KEY, []).filter((item) => item !== key);
      current.unshift(key);
      const keep = current.slice(0, MAX_CACHE_ENTRIES);
      const remove = current.slice(MAX_CACHE_ENTRIES);
      remove.forEach((item) => localStorage.removeItem(cacheKey(item)));
      GHUtils.writeStorage(CACHE_INDEX_KEY, keep);
    } catch (_) {
      // Cache cleanup is best-effort only.
    }
  }

  function setCached(key, data) {
    try {
      localStorage.setItem(cacheKey(key), JSON.stringify({ savedAt: Date.now(), data }));
      touchCacheIndex(key);
    } catch (_) {
      // Storage can be full/disabled; network functionality must continue.
    }
  }

  function updateRateLimit(headers) {
    if (!headers) return;
    const remaining = headers.get("x-ratelimit-remaining");
    const limit = headers.get("x-ratelimit-limit");
    const reset = headers.get("x-ratelimit-reset");
    if (remaining != null) rateLimit.remaining = Number(remaining);
    if (limit != null) rateLimit.limit = Number(limit);
    if (reset != null) rateLimit.reset = Number(reset) * 1000;
  }

  function makeError(response, payload) {
    const status = response.status;
    const resetText = rateLimit.reset ? GHUtils.formatDate(rateLimit.reset, { hour: "numeric", minute: "2-digit" }) : "later";
    if (status === 404) return new GitHubAPIError("That GitHub username was not found.", status, payload);
    if (status === 403 && rateLimit.remaining === 0) return new GitHubAPIError(`GitHub’s public API rate limit has been reached. It resets around ${resetText}. Cached profiles still work.`, status, payload);
    if (status === 401) return new GitHubAPIError("GitHub rejected the API request. Please try again later.", status, payload);
    if (status >= 500) return new GitHubAPIError("GitHub is temporarily unavailable. Try again shortly.", status, payload);
    return new GitHubAPIError(payload && payload.message ? payload.message : `GitHub API request failed (${status}).`, status, payload);
  }

  async function requestJSON(path, options) {
    const opts = options || {};
    const key = opts.cacheKey || path;
    const ttl = Number(opts.ttl) || PROFILE_TTL;
    const cached = getCached(key);
    const fresh = cached && Date.now() - cached.savedAt < ttl;

    if (fresh && !opts.forceRefresh) {
      return { data: cached.data, source: "cache", stale: false };
    }

    try {
      const response = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        signal: opts.signal,
        cache: "default"
      });

      updateRateLimit(response.headers);
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw makeError(response, payload);
      setCached(key, payload);
      return { data: payload, source: "network", stale: false };
    } catch (error) {
      if (error && error.name === "AbortError") throw error;
      if (cached) return { data: cached.data, source: "cache", stale: true };
      if (!navigator.onLine) throw new GitHubAPIError("You’re offline and this profile is not cached yet. Connect once to analyze it.", 0);
      if (error instanceof GitHubAPIError) throw error;
      throw new GitHubAPIError("The request could not reach GitHub. Check your connection and try again.", 0, error);
    }
  }

  async function getUser(username, options) {
    const result = await requestJSON(`/users/${encodeURIComponent(username)}`, {
      cacheKey: `user:${username.toLowerCase()}`,
      ttl: PROFILE_TTL,
      signal: options && options.signal,
      forceRefresh: options && options.forceRefresh
    });
    return result;
  }

  async function getRepos(username, options) {
    const all = [];
    const sources = [];
    let stale = false;

    for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
      const result = await requestJSON(`/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}&sort=updated`, {
        cacheKey: `repos:${username.toLowerCase()}:${page}`,
        ttl: REPOS_TTL,
        signal: options && options.signal,
        forceRefresh: options && options.forceRefresh
      });
      const pageData = Array.isArray(result.data) ? result.data : [];
      all.push(...pageData);
      sources.push(result.source);
      stale = stale || result.stale;
      if (pageData.length < 100) break;
    }

    return { data: all, source: sources.every((s) => s === "cache") ? "cache" : "network", stale };
  }

  async function getEvents(username, options) {
    const result = await requestJSON(`/users/${encodeURIComponent(username)}/events/public?per_page=100`, {
      cacheKey: `events:${username.toLowerCase()}`,
      ttl: EVENTS_TTL,
      signal: options && options.signal,
      forceRefresh: options && options.forceRefresh
    });
    return { data: Array.isArray(result.data) ? result.data : [], source: result.source, stale: result.stale };
  }

  async function getProfileBundle(username, options) {
    const normalized = GHUtils.normalizeUsername(username);
    if (!normalized) throw new GitHubAPIError("Enter a valid GitHub username or GitHub profile URL.", 400);

    const userResult = await getUser(normalized, options);
    const [reposResult, eventsResult] = await Promise.all([
      getRepos(normalized, options),
      getEvents(normalized, options).catch((error) => {
        if (error && error.name === "AbortError") throw error;
        return { data: [], source: "unavailable", stale: false };
      })
    ]);

    const metrics = GHUtils.calculateMetrics(userResult.data, reposResult.data, eventsResult.data);
    const health = GHUtils.calculateHealth(userResult.data, metrics);
    const score = GHUtils.calculatePortfolioScore(userResult.data, metrics, health);
    const insights = GHUtils.generateInsights(userResult.data, metrics, health, score);

    return {
      username: normalized,
      user: userResult.data,
      repos: reposResult.data,
      events: eventsResult.data,
      metrics,
      health,
      score,
      insights,
      meta: {
        fromCache: [userResult, reposResult, eventsResult].some((item) => item && item.source === "cache"),
        stale: [userResult, reposResult, eventsResult].some((item) => item && item.stale),
        rateLimit: { ...rateLimit }
      }
    };
  }

  function getRateLimit() {
    return { ...rateLimit };
  }

  function clearApiCache() {
    try {
      const keys = GHUtils.readStorage(CACHE_INDEX_KEY, []);
      keys.forEach((key) => localStorage.removeItem(cacheKey(key)));
      localStorage.removeItem(CACHE_INDEX_KEY);
    } catch (_) {
      // no-op
    }
  }

  global.GitHubAPI = {
    GitHubAPIError,
    getUser,
    getRepos,
    getEvents,
    getProfileBundle,
    getRateLimit,
    clearApiCache
  };
})(window);
