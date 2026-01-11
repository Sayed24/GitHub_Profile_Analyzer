/* ===============================
   DOM REFERENCES
================================ */
const app = document.getElementById("app");
const loader = document.getElementById("loader");

/* ===============================
   LOADER
================================ */
function showLoader() {
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  if (loader) loader.style.display = "none";
}

/* ===============================
   CLEAR UI
================================ */
function clearApp() {
  app.innerHTML = "";
}

/* ===============================
   PROFILE HEADER
================================ */
function renderProfileHeader(user, score) {
  const header = document.createElement("section");
  header.className = "profile-header";

  header.innerHTML = `
    <div class="profile-avatar">
      <img src="${user.avatar_url}" alt="${user.login}" />
    </div>

    <div class="profile-meta">
      <h2>${user.name || user.login}</h2>
      <p class="username">@${user.login}</p>
      <p class="bio">${user.bio || "No bio provided."}</p>

      <div class="stats">
        <span>👥 ${user.followers} Followers</span>
        <span>📦 ${user.public_repos} Repos</span>
        <span>⭐ Score: ${score}/100</span>
      </div>
    </div>
  `;

  app.appendChild(header);
}

/* ===============================
   AI INSIGHTS CARD
   (FIXED overflow & responsive)
================================ */
function renderAIInsights(text) {
  const section = document.createElement("section");
  section.className = "card ai-card";

  section.innerHTML = `
    <h3>🧠 AI Insights</h3>
    <p>${text}</p>
  `;

  app.appendChild(section);
}

/* ===============================
   REPOSITORY GRID
   (Perfect spacing & wrapping)
================================ */
function renderRepositories(repos) {
  const section = document.createElement("section");
  section.className = "repo-section";

  section.innerHTML = `<h3>📂 Repositories</h3>`;

  const grid = document.createElement("div");
  grid.className = "repo-grid";

  repos.forEach(repo => {
    const card = document.createElement("div");
    card.className = "repo-card";

    card.innerHTML = `
      <h4>${repo.name}</h4>
      <p>${repo.description || "No description."}</p>
      <div class="repo-meta">
        <span>⭐ ${repo.stargazers_count}</span>
        <span>🍴 ${repo.forks_count}</span>
        <span>${repo.language || "N/A"}</span>
      </div>
    `;

    grid.appendChild(card);
  });

  section.appendChild(grid);
  app.appendChild(section);
}

/* ===============================
   PROFILE PAGE RENDER
================================ */
function renderProfile(data) {
  clearApp();
  hideLoader();

  renderProfileHeader(data.user, data.aiScore);
  renderAIInsights(data.insights);
  renderRepositories(data.repos);
}

/* ===============================
   COMPARISON VIEW
================================ */
function renderComparison(left, right) {
  clearApp();
  hideLoader();

  const wrapper = document.createElement("section");
  wrapper.className = "compare-wrapper";

  wrapper.innerHTML = `
    <div class="compare-col">
      <h3>${left.user.login}</h3>
      <p>Score: ${left.aiScore}</p>
      <p>${left.insights}</p>
    </div>

    <div class="compare-col">
      <h3>${right.user.login}</h3>
      <p>Score: ${right.aiScore}</p>
      <p>${right.insights}</p>
    </div>
  `;

  app.appendChild(wrapper);
}

/* ===============================
   ERROR UI
================================ */
function renderError(message) {
  hideLoader();
  clearApp();

  const error = document.createElement("div");
  error.className = "error";

  error.innerHTML = `
    <h3>⚠️ Error</h3>
    <p>${message}</p>
  `;

  app.appendChild(error);
}
