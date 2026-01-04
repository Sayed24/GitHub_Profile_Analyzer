const profileEl = document.getElementById("profile");
const statsEl = document.getElementById("stats");
const reposEl = document.getElementById("repos");

function showProfile(user) {
  profileEl.innerHTML = `
    <div class="card">
      <img src="${user.avatar_url}" width="100" style="border-radius:50%" />
      <h2>${user.name || ""}</h2>
      <p>@${user.login}</p>
      <p>${user.bio || ""}</p>
      <a href="${user.html_url}" target="_blank">View GitHub</a>
    </div>
    <button onclick="exportPDF()">Export PDF</button>
  `;
  profileEl.classList.remove("hidden");
}

function showStats(user, repos) {
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  statsEl.innerHTML = `
    <div class="stat">Repos<br><strong>${user.public_repos}</strong></div>
    <div class="stat">Followers<br><strong>${user.followers}</strong></div>
    <div class="stat">Following<br><strong>${user.following}</strong></div>
    <div class="stat">Stars<br><strong>${stars}</strong></div>
  `;
  statsEl.classList.remove("hidden");
}

function showRepos(repos) {
  reposEl.innerHTML = repos
    .sort((a,b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map(repo => `
      <div class="repo">
        <h4>${repo.name}</h4>
        <p>${repo.description || ""}</p>
        ⭐ ${repo.stargazers_count} • 🍴 ${repo.forks_count}
      </div>
    `).join("");
  reposEl.classList.remove("hidden");
}
function exportPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  pdf.text("GitHub Profile Report", 10, 10);
  pdf.text(document.getElementById("profile").innerText, 10, 20);
  pdf.save("github-profile.pdf");
}
