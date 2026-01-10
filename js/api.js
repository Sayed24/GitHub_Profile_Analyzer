/* ===========================
   API CONFIG
=========================== */

const API_BASE = "https://api.github.com";

/*
  OPTIONAL:
  Add your GitHub token for higher rate limits.
  This is SAFE for public demos but optional.
*/
const GITHUB_TOKEN = ""; // <-- optional

const headers = {
  Accept: "application/vnd.github+json"
};

if (GITHUB_TOKEN) {
  headers.Authorization = `token ${GITHUB_TOKEN}`;
}

/* ===========================
   GENERIC FETCH
=========================== */

async function apiFetch(url) {
  const res = await fetch(url, { headers });

  if (res.status === 404) throw new Error("User not found");
  if (res.status === 403) throw new Error("API rate limit exceeded");
  if (!res.ok) throw new Error("GitHub API error");

  return res.json();
}

/* ===========================
   USER DATA
=========================== */

async function getUser(username) {
  return apiFetch(`${API_BASE}/users/${username}`);
}

/* ===========================
   REPOSITORIES
=========================== */

async function getRepos(username) {
  return apiFetch(
    `${API_BASE}/users/${username}/repos?per_page=100&sort=updated`
  );
}

/* ===========================
   LANGUAGE STATS
=========================== */

async function getLanguageStats(username) {
  const repos = await getRepos(username);
  const totals = {};

  repos.forEach(repo => {
    if (!repo.language) return;
    totals[repo.language] = (totals[repo.language] || 0) + 1;
  });

  return totals;
}

/* ===========================
   STAR & FORK TOTALS
=========================== */

async function getRepoTotals(username) {
  const repos = await getRepos(username);

  return repos.reduce(
    (acc, repo) => {
      acc.stars += repo.stargazers_count;
      acc.forks += repo.forks_count;
      return acc;
    },
    { stars: 0, forks: 0 }
  );
}

/* ===========================
   MOST STARRED REPO
=========================== */

async function getTopRepo(username) {
  const repos = await getRepos(username);
  return repos.sort(
    (a, b) => b.stargazers_count - a.stargazers_count
  )[0];
}

/* ===========================
   ACTIVITY SCORE (CUSTOM)
=========================== */

function calculateActivityScore(user, repos) {
  const years =
    (Date.now() - new Date(user.created_at)) /
    (1000 * 60 * 60 * 24 * 365);

  const repoRate = repos.length / Math.max(years, 1);
  const score =
    repoRate * 10 +
    user.followers * 0.5 +
    repos.reduce((s, r) => s + r.stargazers_count, 0) * 0.2;

  return Math.round(score);
}

/* ===========================
   EXPORTS
=========================== */

window.getUser = getUser;
window.getRepos = getRepos;
window.getLanguageStats = getLanguageStats;
window.getRepoTotals = getRepoTotals;
window.getTopRepo = getTopRepo;
window.calculateActivityScore = calculateActivityScore;
