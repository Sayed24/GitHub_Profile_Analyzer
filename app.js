/* ============================
   GLOBAL STATE & CONSTANTS
============================ */
const API_BASE = "https://api.github.com/users";
const MAX_REPOS = 5;

const elements = {
  searchInput: document.getElementById("usernameInput"),
  searchBtn: document.getElementById("searchBtn"),
  loading: document.getElementById("loading"),
  container: document.getElementById("profileContainer"),
  themeToggle: document.getElementById("themeToggle"),
  logo: document.getElementById("logo")
};

/* ============================
   INIT
============================ */
init();

function init() {
  restoreTheme();
  bindEvents();
  loadUserFromURL();
}

/* ============================
   EVENT BINDINGS
============================ */
function bindEvents() {
  elements.searchBtn.addEventListener("click", handleSearch);
  elements.searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleSearch();
  });

  elements.themeToggle.addEventListener("click", toggleTheme);

  elements.logo.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

/* ============================
   SEARCH HANDLER
============================ */
async function handleSearch() {
  const username = elements.searchInput.value.trim();
  if (!username) return alert("Please enter a GitHub username");

  setLoading(true);
  clearUI();

  try {
    const profile = await fetchJSON(`${API_BASE}/${username}`);
    const repos = await fetchJSON(`${API_BASE}/${username}/repos?per_page=100`);

    renderProfile(profile);
    renderRepos(repos);
    renderAI(profile, repos);

    updateURL(username);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

/* ============================
   FETCH HELPER
============================ */
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) throw new Error("User not found");
    if (res.status === 403) throw new Error("API rate limit exceeded");
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

/* ============================
   UI RENDERERS
============================ */
function renderProfile(user) {
  const card = document.createElement("div");
  card.className = "card profile-card";

  card.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}">
    <div class="profile-info">
      <h2>${user.name || user.login}</h2>
      <p>${user.bio || "No bio available"}</p>
      <div class="stats">
        <div><span>${user.followers}</span><br>Followers</div>
        <div><span>${user.following}</span><br>Following</div>
        <div><span>${user.public_repos}</span><br>Repos</div>
      </div>
    </div>
  `;

  elements.container.appendChild(card);
}

function renderRepos(repos) {
  const sorted = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, MAX_REPOS);

  const card = document.createElement("div");
  card.className = "card repos-card";

  card.innerHTML = `
    <h3>Top Repositories</h3>
    <ul>
      ${sorted.map(repo => `
        <li>
          <strong>${repo.name}</strong><br>
          ⭐ ${repo.stargazers_count} • 🍴 ${repo.forks_count}
        </li>
      `).join("")}
    </ul>
  `;

  elements.container.appendChild(card);
}

function renderAI(user, repos) {
  const score = calculateAIScore(user, repos);
  const insight = generateInsight(score);

  const card = document.createElement("div");
  card.className = "card ai-card";

  card.innerHTML = `
    <h3>AI Developer Insight</h3>
    <div class="ai-score">
      <span>Score</span>
      <span>${score}/100</span>
    </div>
    <p>${insight}</p>
  `;

  elements.container.appendChild(card);
}

/* ============================
   AI LOGIC (CLIENT-SIDE)
============================ */
function calculateAIScore(user, repos) {
  let score = 0;

  score += Math.min(user.followers, 30);
  score += Math.min(user.public_repos * 2, 30);
  score += Math.min(
    repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    40
  );

  return Math.min(score, 100);
}

function generateInsight(score) {
  if (score > 80) return "Elite open-source contributor with strong influence.";
  if (score > 60) return "Highly active developer with solid public presence.";
  if (score > 40) return "Growing GitHub profile with consistent contributions.";
  return "Early-stage profile — keep building and contributing!";
}

/* ============================
   THEME
============================ */
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

function restoreTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
}

/* ============================
   UTILITIES
============================ */
function setLoading(state) {
  elements.loading.classList.toggle("hidden", !state);
}

function clearUI() {
  elements.container.innerHTML = "";
}

function showError(msg) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `<p style="color:red;">${msg}</p>`;
  elements.container.appendChild(div);
}

function updateURL(username) {
  history.replaceState(null, "", `?user=${username}`);
}

function loadUserFromURL() {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");
  if (user) {
    elements.searchInput.value = user;
    handleSearch();
  }
}
