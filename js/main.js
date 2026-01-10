/* ===========================
   DOM REFERENCES
=========================== */

const searchInput = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");
const historyContainer = document.getElementById("history");

/* ===========================
   SEARCH HANDLER
=========================== */

async function searchUser(username) {
  if (!username) return;

  clearError();

  try {
    // PROFILE
    const user = await getUser(username);
    renderProfile(user);

    // REPOS
    const repos = await getRepos(username);
    renderRepos(repos);

    // TOTALS
    const totals = await getRepoTotals(username);

    // ACTIVITY
    const activityScore = calculateActivityScore(user, repos);
    renderStats(user, totals, activityScore);

    // LANGUAGES
    const languages = await getLanguageStats(username);
    renderLanguageChart(languages);

    // AI INSIGHTS
    renderAIInsights(user, repos);

    // SAVE HISTORY
    saveHistory(username);

    // UPDATE URL
    updateURL(username);

  } catch (err) {
    showError(err.message || "Something went wrong");
  }
}

/* ===========================
   EVENTS
=========================== */

searchBtn.addEventListener("click", () => {
  searchUser(searchInput.value.trim());
});

searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchUser(searchInput.value.trim());
  }
});

/* ===========================
   SEARCH HISTORY
=========================== */

function saveHistory(username) {
  let history = JSON.parse(localStorage.getItem("gh-history")) || [];

  history = history.filter(u => u !== username);
  history.unshift(username);

  if (history.length > 5) history.length = 5;

  localStorage.setItem("gh-history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("gh-history")) || [];

  historyContainer.innerHTML = history
    .map(
      user => `
      <button class="ghost-btn" onclick="searchUser('${user}')">
        ${user}
      </button>
    `
    )
    .join("");
}

/* ===========================
   URL PARAM SUPPORT
=========================== */

function updateURL(username) {
  const url = new URL(window.location);
  url.searchParams.set("user", username);
  history.replaceState(null, "", url);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");

  if (user) {
    searchInput.value = user;
    searchUser(user);
  }
}

/* ===========================
   OFFLINE UX
=========================== */

window.addEventListener("offline", () => {
  showError("You are offline. Showing cached data if available.");
});

/* ===========================
   INIT
=========================== */

renderHistory();
loadFromURL();
