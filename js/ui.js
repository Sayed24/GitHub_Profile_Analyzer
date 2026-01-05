/* =========================
   UI Rendering & Insights
   ========================= */

/* ---------- Helpers ---------- */

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString();
}

/* ---------- Animated Counter ---------- */

function animateCounter(el, target) {
  let current = 0;
  const duration = 800;
  const step = Math.max(1, Math.floor(target / (duration / 16)));

  function tick() {
    current += step;
    if (current >= target) {
      el.textContent = target.toLocaleString();
    } else {
      el.textContent = current.toLocaleString();
      requestAnimationFrame(tick);
    }
  }
  tick();
}

/* ---------- Profile ---------- */

function renderProfile(user) {
  const profile = document.getElementById("profile");

  profile.innerHTML = `
    <img src="${user.avatar_url}" alt="avatar" />
    <div class="profile-meta">
      <h2>${user.name || user.login}</h2>
      <p>@${user.login}</p>
      ${user.bio ? `<p>${user.bio}</p>` : ""}
      ${user.location ? `<p>📍 ${user.location}</p>` : ""}
      ${user.blog ? `<a href="${user.blog}" target="_blank">${user.blog}</a>` : ""}
    </div>
  `;

  show(profile);
}

/* ---------- Stats ---------- */

function renderStats(user, repoStats) {
  const stats = document.getElementById("stats");

  stats.innerHTML = `
    <div class="card stat">
      <h3 data-value="${user.public_repos}">0</h3>
      <span>Repos</span>
    </div>
    <div class="card stat">
      <h3 data-value="${user.followers}">0</h3>
      <span>Followers</span>
    </div>
    <div class="card stat">
      <h3 data-value="${user.following}">0</h3>
      <span>Following</span>
    </div>
    <div class="card stat">
      <h3 data-value="${repoStats.stars}">0</h3>
      <span>Stars</span>
    </div>
  `;

  stats.querySelectorAll("h3").forEach(el => {
    animateCounter(el, parseInt(el.dataset.value, 10));
  });

  show(stats);
}

/* ---------- Contributions ---------- */

function renderContributions(data) {
  const container = document.getElementById("contributions");

  container.innerHTML = `
    <h3>Recent Contributions</h3>
    <div class="contribution-grid">
      ${data
        .map(
          active =>
            `<div class="contribution-cell ${
              active ? "active" : ""
            }"></div>`
        )
        .join("")}
    </div>
  `;

  show(container);
}

/* ---------- AI-Based Insights ---------- */

function generateInsights(user, repos) {
  const insights = [];

  if (repos.length === 0) {
    insights.push("This user has no public repositories.");
  }

  if (user.followers > 500) {
    insights.push("Strong community presence with high follower count.");
  }

  const languages = {};
  repos.forEach(r => {
    if (r.language) {
      languages[r.language] = (languages[r.language] || 0) + 1;
    }
  });

  const topLang = Object.entries(languages).sort((a, b) => b[1] - a[1])[0];
  if (topLang) {
    insights.push(`Primary focus appears to be ${topLang[0]}.`);
  }

  const yearsOnGitHub =
    (Date.now() - new Date(user.created_at).getTime()) /
    (1000 * 60 * 60 * 24 * 365);

  if (yearsOnGitHub > 5) {
    insights.push("Long-term GitHub usage shows consistent experience.");
  }

  return insights;
}

function renderInsights(user, repos) {
  const container = document.getElementById("aiInsights");
  const insights = generateInsights(user, repos);

  container.innerHTML = `
    <h3>AI Insights</h3>
    <ul>
      ${insights.map(i => `<li>${i}</li>`).join("")}
    </ul>
  `;

  show(container);
}
