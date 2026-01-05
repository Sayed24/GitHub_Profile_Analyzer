/* =========================
   Main App Controller
   ========================= */

const input = document.getElementById("usernameInput");
const button = document.getElementById("searchBtn");

const profileEl = document.getElementById("profile");
const statsEl = document.getElementById("stats");
const chartsSection = document.getElementById("chartsSection");
const contributionsEl = document.getElementById("contributions");
const insightsEl = document.getElementById("aiInsights");

/* ---------- Events ---------- */

button.addEventListener("click", () => {
  const username = input.value.trim();
  if (username) loadUser(username);
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    button.click();
  }
});

/* ---------- Core Logic ---------- */

async function loadUser(username) {
  resetUI();
  showLoading();

  try {
    const user = await getUser(username);
    const repos = await getRepos(username);

    renderProfile(user);

    const repoStats = calculateRepoStats(repos);
    renderStats(user, repoStats);

    const languages = calculateLanguages(repos);
    renderLanguageChart(languages);
    renderStarsChart(repos);
    show(chartsSection);

    const contributions = await getContributions(username);
    renderContributions(contributions);

    renderInsights(user, repos);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoading();
  }
}

/* ---------- UI States ---------- */

function resetUI() {
  hide(profileEl);
  hide(statsEl);
  hide(chartsSection);
  hide(contributionsEl);
  hide(insightsEl);
}

function showLoading() {
  button.textContent = "Analyzing...";
  button.disabled = true;
}

function hideLoading() {
  button.textContent = "Analyze";
  button.disabled = false;
}

function showError(msg) {
  alert(msg || "Something went wrong. Try again.");
}

/* ---------- Offline Indicator ---------- */

window.addEventListener("offline", () => {
  alert("You are offline. Showing cached data if available.");
});
