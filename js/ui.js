/* ===========================
   UI HELPERS
=========================== */

function qs(id) {
  return document.getElementById(id);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function animateCounter(el, target) {
  let start = 0;
  const duration = 800;
  const step = Math.max(1, Math.floor(target / (duration / 16)));

  function update() {
    start += step;
    if (start >= target) {
      el.textContent = target;
    } else {
      el.textContent = start;
      requestAnimationFrame(update);
    }
  }
  update();
}

/* ===========================
   ERROR & EMPTY STATES
=========================== */

function showError(message) {
  qs("error").innerHTML = `
    <div class="card">
      <strong style="color:var(--danger)">⚠ ${message}</strong>
    </div>
  `;
}

function clearError() {
  qs("error").innerHTML = "";
}

/* ===========================
   PROFILE RENDER
=========================== */

function renderProfile(user) {
  qs("profile").innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}" />
    <div>
      <h2>${user.name || user.login}</h2>
      <p>@${user.login}</p>
      ${user.bio ? `<p>${user.bio}</p>` : ""}
      <p>
        ${user.location ? `📍 ${user.location}` : ""}
        ${user.company ? ` • 🏢 ${user.company}` : ""}
      </p>
      <p>
        <a href="${user.html_url}" target="_blank">GitHub Profile</a>
      </p>
      <p>Joined ${formatDate(user.created_at)}</p>
    </div>
  `;
}

/* ===========================
   STATS
=========================== */

function renderStats(user, totals, activityScore) {
  qs("stats").innerHTML = `
    <div class="stats-grid">
      <div class="stat">
        <strong id="repoCount">0</strong>
        <span>Repositories</span>
      </div>
      <div class="stat">
        <strong id="followers">0</strong>
        <span>Followers</span>
      </div>
      <div class="stat">
        <strong id="stars">0</strong>
        <span>Stars</span>
      </div>
      <div class="stat">
        <strong id="activity">0</strong>
        <span>Activity Score</span>
      </div>
    </div>
  `;

  animateCounter(qs("repoCount"), user.public_repos);
  animateCounter(qs("followers"), user.followers);
  animateCounter(qs("stars"), totals.stars);
  animateCounter(qs("activity"), activityScore);
}

/* ===========================
   REPOSITORIES
=========================== */

function renderRepos(repos) {
  if (!repos.length) {
    qs("repos").innerHTML = `<div class="card">No repositories found</div>`;
    return;
  }

  qs("repos").innerHTML = repos
    .slice(0, 5)
    .map(
      repo => `
      <div class="card">
        <h3>
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
        </h3>
        <p>${repo.description || "No description"}</p>
        <p>
          ${repo.language || "—"} • ⭐ ${repo.stargazers_count}
          • 🍴 ${repo.forks_count}
        </p>
        <p>Updated ${formatDate(repo.updated_at)}</p>
      </div>
    `
    )
    .join("");
}

/* ===========================
   AI INSIGHTS (BASIC)
=========================== */

function renderAIInsights(user, repos) {
  const insights = [];

  if (user.followers > 1000) insights.push("Strong community presence");
  if (repos.length > 30) insights.push("Highly active developer");
  if (repos.some(r => r.language === "JavaScript"))
    insights.push("JavaScript-focused profile");

  qs("aiInsights").innerHTML = `
    <ul>
      ${insights.map(i => `<li>${i}</li>`).join("") || "<li>No insights yet</li>"}
    </ul>
  `;
}

/* ===========================
   EXPORTS
=========================== */

window.renderProfile = renderProfile;
window.renderStats = renderStats;
window.renderRepos = renderRepos;
window.renderAIInsights = renderAIInsights;
window.showError = showError;
window.clearError = clearError;
