/* =========================
   GITHUB API CONFIG
========================= */
const API_BASE = "https://api.github.com/users";

const GITHUB_TOKEN = ""; // optional personal token

function getHeaders() {
  return GITHUB_TOKEN
    ? { Authorization: `token ${GITHUB_TOKEN}` }
    : {};
}

/* =========================
   RATE LIMIT CHECK
========================= */
function checkRateLimit(headers) {
  const remaining = headers.get("X-RateLimit-Remaining");
  if (remaining === "0") {
    throw new Error("GitHub API rate limit reached. Try again later.");
  }
}

/* =========================
   CACHED FETCH
========================= */
async function cachedFetch(key, fetchFn) {
  const cached = localStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached);
  }
  const data = await fetchFn();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

/* =========================
   FETCH USER
========================= */
async function fetchUser(username) {
  const res = await fetch(`${API_BASE}/${username}`);
  checkRateLimit(res.headers);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

/* =========================
   FETCH REPOS
========================= */
async function fetchRepos(username) {
  const res = await fetch(`${API_BASE}/${username}/repos?per_page=100`);
  checkRateLimit(res.headers);
  if (!res.ok) throw new Error("Repositories not found");
  return res.json();
}
