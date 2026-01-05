/* =========================
   GitHub Analytics Pro
   API + Cache + Optimization
   ========================= */

const API_BASE = "https://api.github.com";
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// Optional token (DO NOT COMMIT REAL TOKEN)
const GITHUB_TOKEN = "";

/* =========================
   Headers
   ========================= */

function getHeaders() {
  const headers = {
    Accept: "application/vnd.github+json"
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

/* =========================
   Cache Helpers
   ========================= */

function getCache(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  if (Date.now() - parsed.time > CACHE_TTL) {
    localStorage.removeItem(key);
    return null;
  }
  return parsed.data;
}

function setCache(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({
      time: Date.now(),
      data
    })
  );
}

/* =========================
   Fetch Wrapper
   ========================= */

async function fetchWithCache(url, cacheKey) {
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const res = await fetch(url, {
    headers: getHeaders()
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }

  const data = await res.json();
  setCache(cacheKey, data);
  return data;
}

/* =========================
   API Methods
   ========================= */

async function getUser(username) {
  return fetchWithCache(
    `${API_BASE}/users/${username}`,
    `user_${username}`
  );
}

async function getRepos(username) {
  return fetchWithCache(
    `${API_BASE}/users/${username}/repos?per_page=100&sort=updated`,
    `repos_${username}`
  );
}

/* =========================
   Language Aggregation
   ========================= */

function calculateLanguages(repos) {
  const map = {};
  repos.forEach(repo => {
    if (repo.language) {
      map[repo.language] = (map[repo.language] || 0) + 1;
    }
  });
  return map;
}

/* =========================
   Repo Metrics
   ========================= */

function calculateRepoStats(repos) {
  let stars = 0;
  let forks = 0;

  repos.forEach(repo => {
    stars += repo.stargazers_count;
    forks += repo.forks_count;
  });

  const mostStarred = repos.reduce(
    (max, r) => (r.stargazers_count > max.stargazers_count ? r : max),
    repos[0] || {}
  );

  return {
    stars,
    forks,
    mostStarred
  };
}

/* =========================
   Contribution Graph Hook
   (Serverless-ready)
   ========================= */

async function getContributions(username) {
  /*
    Real scraping must be done server-side.
    This function expects a serverless endpoint later.
  */

  try {
    const res = await fetch(
      `https://your-serverless-endpoint.vercel.app/contributions?user=${username}`
    );

    if (!res.ok) throw new Error("Contribution fetch failed");

    return await res.json();
  } catch (err) {
    // Fallback dummy data (offline / demo)
    return Array.from({ length: 140 }, () =>
      Math.random() > 0.7
    );
  }
}
