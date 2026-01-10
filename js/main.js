/* =========================================================
   ELEMENTS
========================================================= */

const input = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");

/* =========================================================
   STATE
========================================================= */

let searchHistory =
  JSON.parse(localStorage.getItem("gh_history")) || [];

/* =========================================================
   INIT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  ui.renderHistory(searchHistory);
  handleURLQuery();
  monitorOffline();
});

/* =========================================================
   SEARCH HANDLERS
========================================================= */

searchBtn.addEventListener("click", () => {
  startSearch(input.value.trim());
});

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    startSearch(input.value.trim());
  }
});

window.addEventListener("historySelect", e => {
  startSearch(e.detail);
});

/* =========================================================
   MAIN SEARCH FLOW
========================================================= */

async function startSearch(username) {
  if (!username) {
    ui.showError("Please enter a GitHub username.");
    return;
  }

  ui.clearUI();
  ui.showError("");

  try {
    const profile = await api.getUserProfile(username);
    const repos = await api.getUserRepos(username);

    saveHistory(username);

    const repoStats = api.calculateRepoStats(repos);
    const languages = api.calculateLanguages(repos);
    const activityScore = api.calculateActivityScore(profile, repos);

    ui.renderProfile(profile);
    ui.renderStats(profile, repoStats, activityScore);
    ui.renderRepos(repos);
    renderLanguageChart(languages);
    generateAIInsights(profile, repoStats, activityScore);
  } catch (err) {
    ui.showError(err.message);
  }
}

/* =========================================================
   HISTORY
========================================================= */

function saveHistory(username) {
  if (searchHistory.includes(username)) return;

  searchHistory.unshift(username);
  searchHistory = searchHistory.slice(0, 5);
  localStorage.setItem("gh_history", JSON.stringify(searchHistory));
  ui.renderHistory(searchHistory);
}

/* =========================================================
   URL QUERY SUPPORT
========================================================= */

function handleURLQuery() {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");
  if (user) {
    input.value = user;
    startSearch(user);
  }
}

/* =========================================================
   OFFLINE MONITOR
========================================================= */

function monitorOffline() {
  ui.toggleOffline(!navigator.onLine);

  window.addEventListener("online", () => {
    ui.toggleOffline(false);
  });

  window.addEventListener("offline", () => {
    ui.toggleOffline(true);
  });
}

/* =========================================================
   AI INSIGHTS (CLIENT LOGIC)
========================================================= */

function generateAIInsights(profile, repoStats, score) {
  const el = document.getElementById("aiInsights");

  let insight = "This developer shows ";

  if (score > 80) insight += "very high activity and strong engagement.";
  else if (score > 40)
    insight += "consistent activity with steady growth.";
  else insight += "light but focused contribution patterns.";

  insight += ` With ${repoStats.totalRepos} public repositories and ${profile.followers} followers, this profile demonstrates `;

  insight +=
    repoStats.totalStars > 100
      ? "high community appreciation."
      : "room for broader visibility.";

  el.innerHTML = `
    <h3>AI Insights</h3>
    <p>${insight}</p>
  `;
}

/* =========================================================
   PDF EXPORT
========================================================= */

window.exportPDF = function () {
  const app = document.getElementById("app");

  const opt = {
    margin: 0.4,
    filename: "github-profile-report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
  };

  html2pdf().set(opt).from(app).save();
};
