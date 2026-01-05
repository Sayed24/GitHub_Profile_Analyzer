/* =========================
   ELEMENT REFERENCES
========================= */
const profileEl = document.getElementById("profile");
const statsEl = document.getElementById("stats");
const reposEl = document.getElementById("repos");

/* =========================
   PROFILE RENDER
========================= */
function showProfile(user) {
  profileEl.innerHTML = `
    <section class="card glass">
      <img src="${user.avatar_url}" width="100" alt="Avatar">
      <h2>${user.name || ""}</h2>
      <p>@${user.login}</p>
      <p>${user.bio || ""}</p>

      <p>
        ${user.location ? `📍 ${user.location}<br>` : ""}
        ${user.company ? `🏢 ${user.company}<br>` : ""}
        ${user.blog ? `<a href="${user.blog}" target="_blank">🔗 Website</a><br>` : ""}
      </p>

      <div style="margin-top:0.5rem;">
        <button onclick="exportPDF()">Export PDF</button>
        <button onclick="toggleFavorite()">⭐ Favorite</button>
        <button onclick="copyLink()">Share</button>
      </div>
    </section>
  `;
  profileEl.classList.remove("hidden");
}

/* =========================
   ACTIVITY SCORE
========================= */
function calculateActivityScore(user, repos) {
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const forks = repos.reduce((a, r) => a + r.forks_count, 0);
  const years = Math.max(
    1,
    (Date.now() - new Date(user.created_at)) / 31536000000
  );

  return Math.round((stars + forks + user.followers) / years);
}

/* =========================
   ANIMATED COUNTER
========================= */
function animateValue(el, start, end, duration = 800) {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* =========================
   STATS RENDER
========================= */
function showStats(user, repos) {
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const activity = calculateActivityScore(user, repos);

  statsEl.innerHTML = `
    <div class="stat">Repos<br><strong>${user.public_repos}</strong></div>
    <div class="stat">Followers<br><strong>${user.followers}</strong></div>
    <div class="stat">Following<br><strong>${user.following}</strong></div>
    <div class="stat">Stars<br><strong>${stars}</strong></div>
    <div class="stat">Activity<br><strong>${activity}</strong></div>
  `;

  statsEl.classList.remove("hidden");

  statsEl.querySelectorAll("strong").forEach(el => {
    animateValue(el, 0, Number(el.textContent));
  });
}

/* =========================
   REPOS RENDER
========================= */
function showRepos(repos) {
  reposEl.innerHTML = repos
    .slice(0, 12)
    .map(
      repo => `
      <div class="repo">
        <h4>${repo.name}</h4>
        <p>${repo.description || ""}</p>
        <p>
          ⭐ ${repo.stargazers_count} &nbsp;
          🍴 ${repo.forks_count}<br>
          ${repo.language || "Unknown"}
        </p>
      </div>
    `
    )
    .join("");

  reposEl.classList.remove("hidden");
}

/* =========================
   PDF EXPORT
========================= */
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text("GitHub Profile Report", 10, 10);
  pdf.text(profileEl.innerText, 10, 20);
  pdf.save("github-profile-report.pdf");
}

/* =========================
   SHARE LINK
========================= */
function copyLink() {
  const username = document.getElementById("usernameInput").value;
  const url = `${location.origin}${location.pathname}?user=${username}`;
  navigator.clipboard.writeText(url);
  alert("Profile link copied!");
}
function animateCounter(el, target) {
  let start = 0;
  const duration = 800;
  const step = Math.max(1, Math.floor(target / (duration / 16)));

  function update() {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString();
    } else {
      el.textContent = start.toLocaleString();
      requestAnimationFrame(update);
    }
  }
  update();
}
