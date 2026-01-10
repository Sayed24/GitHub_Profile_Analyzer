/* =========================================================
   API CONFIG
========================================================= */

const GITHUB_API = "https://api.github.com";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

// OPTIONAL: add your token for higher rate limits
// const GITHUB_TOKEN = "ghp_xxx";

/* =========================================================
   GENERIC FETCH WITH CACHE + RATE LIMIT
========================================================= */

async function fetchWithCache(url, cacheKey) {
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  const headers = {};
  if (typeof GITHUB_TOKEN !== "undefined") {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });

  if (res.status === 403) {
    throw new Error("API rate limit exceeded");
  }

  if (!res.ok) {
    throw new Error("GitHub user not found");
  }

  const data = await res.json();

  localStorage.setItem(
    cacheKey,
    JSON.stringify({ data, timestamp: Date.now() })
  );

  return data;
}

/* =========================================================
   FETCH USER PROFILE
========================================================= */

async function getUserProfile(username) {
  return fetchWithCache(
    `${GITHUB_API}/users/${username}`,
    `profile_${username}`
  );
}

/* =========================================================
   FETCH USER REPOS
========================================================= */

async function getUserRepos(username) {
  return fetchWithCache(
    `${GITHUB_API}/users/${username}/repos?per_page=100&sort=updated`,
    `repos_${username}`
  );
}

/* =========================================================
   LANGUAGE AGGREGATION
========================================================= */

function calculateLanguages(repos) {
  const languages = {};

  repos.forEach(repo => {
    if (!repo.language) return;
    languages[repo.language] =
      (languages[repo.language] || 0) + 1;
  });

  return languages;
}

/* =========================================================
   REPOSITORY STATISTICS
========================================================= */

function calculateRepoStats(repos) {
  let stars = 0;
  let forks = 0;
  let mostStarred = null;

  repos.forEach(repo => {
    stars += repo.stargazers_count;
    forks += repo.forks_count;

    if (
      !mostStarred ||
      repo.stargazers_count > mostStarred.stargazers_count
    ) {
      mostStarred = repo;
    }
  });

  return {
    totalRepos: repos.length,
    totalStars: stars,
    totalForks: forks,
    mostStarred
  };
}

/* =========================================================
   ACTIVITY SCORE (CUSTOM LOGIC)
========================================================= */

function calculateActivityScore(profile, repos) {
  const years =
    (Date.now() - new Date(profile.created_at)) /
    (1000 * 60 * 60 * 24 * 365);

  const repoRate = repos.length / Math.max(years, 1);
  const followerWeight = profile.followers * 0.2;

  return Math.round(repoRate * 10 + followerWeight);
}

/* =========================================================
   EXPORT
========================================================= */

window.api = {
  getUserProfile,
  getUserRepos,
  calculateLanguages,
  calculateRepoStats,
  calculateActivityScore
};
