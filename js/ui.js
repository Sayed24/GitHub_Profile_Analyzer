/* =========================================================
   ELEMENT REFERENCES
========================================================= */

const profileEl = document.getElementById("profile");
const statsEl = document.getElementById("stats");
const reposEl = document.getElementById("repos");
const errorEl = document.getElementById("error");
const historyEl = document.getElementById("history");
const offlineBanner = document.getElementById("offlineBanner");

/* =========================================================
   UTILITIES
========================================================= */

function clearUI() {
  profileEl.innerHTML = "";
  statsEl.innerHTML = "";
  reposEl.innerHTML = "";
  errorEl.textContent = "";
}

function showError(message) {
  errorEl.textContent = message;
}

function toggleOffline(isOffline) {
  offlineBanner.classList.toggle("hidden", !isOffline);
}

/* =========================================================
   PROFILE RENDER
========================================================= */

function renderProfile(profile) {
  profileEl.innerHTML = `
    <div class="profile-header">
      <img src="${profile.avatar_url}" alt="Avatar" />
      <div>
        <h2>${profile.name || profile.login}</h2>
        <p class="muted">@${profile.login}</p>
        ${profile.bio ? `<p>${profile.bio}</p>` : ""}
        <div class="profile-meta">
          ${profile.location ? `📍 ${profile.location}` : ""}
          ${profile.company ? `🏢 ${profile.company}` : ""}
          ${
            profile.blog
              ? `🔗 <a href="${profile.blog}" target="_blank">${profile.blog}</a>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

/* =========================================================
   STATS RENDER (ANIMATED)
========================================================= */

function animateCounter(el, value) {
  let start = 0;
  const duration = 600;
  const step = Math.max(1, value / (duration / 16));

  function update() {
    start += step;
    if (start >= value) {
      el.textContent = value;
    } else {
      el.textContent = Math.floor(start);
      requestAnimationFrame(update);
    }
  }
  update();
}

function renderStats(profile, repoStats, activityScore) {
  statsEl.innerHTML = "";

  const stats = [
    ["Followers", profile.followers],
    ["Following", profile.following],
    ["Public Repos", repoStats.totalRepos],
    ["Stars", repoStats.totalStars],
    ["Forks", repoStats.totalForks],
    ["Activity Score", activityScore]
  ];

  stats.forEach(([label, value]) => {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<h4>${label}</h4><span>0</span>`;
    statsEl.appendChild(stat);
    animateCounter(stat.querySelector("span"), value);
  });
}

/* =========================================================
   REPOS RENDER
========================================================= */

function renderRepos(repos) {
  reposEl.innerHTML = "";

  if (!repos.length) {
    reposEl.innerHTML =
      `<p class="muted">No public repositories found.</p>`;
    return;
  }

  repos.slice(0, 10).forEach(repo => {
    const div = document.createElement("div");
    div.className = "repo";
    div.innerHTML = `
      <h4>${repo.name}</h4>
      <p>${repo.description || "No description"}</p>
      <div class="meta">
        <span>⭐ ${repo.stargazers_count}</span>
        <span>🍴 ${repo.forks_count}</span>
        <span>${repo.language || "N/A"}</span>
      </div>
    `;
    reposEl.appendChild(div);
  });
}

/* =========================================================
   SEARCH HISTORY
========================================================= */

function renderHistory(items) {
  historyEl.innerHTML = "";

  items.forEach(user => {
    const btn = document.createElement("button");
    btn.textContent = user;
    btn.onclick = () =>
      window.dispatchEvent(
        new CustomEvent("historySelect", { detail: user })
      );
    historyEl.appendChild(btn);
  });
}

/* =========================================================
   EXPORT
========================================================= */

window.ui = {
  clearUI,
  showError,
  renderProfile,
  renderStats,
  renderRepos,
  renderHistory,
  toggleOffline
};
