const API_BASE = "https://api.github.com/users";
const res = await fetch(url);
checkRateLimit(res.headers);

async function fetchUser(username) {
  const res = await fetch(`${API_BASE}/${username}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

async function fetchRepos(username) {
  const res = await fetch(`${API_BASE}/${username}/repos?per_page=100`);
  if (!res.ok) throw new Error("Repos not found");
  return res.json();
}

function checkRateLimit(headers) {
  const remaining = headers.get("X-RateLimit-Remaining");
  if (remaining === "0") {
    throw new Error("GitHub API rate limit reached. Try later.");
  }
}
async function cachedFetch(key, fetchFn) {
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFn();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}
