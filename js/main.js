/* =========================
   DOM ELEMENTS
========================= */
const form = document.getElementById("searchForm");
const input = document.getElementById("usernameInput");
const errorBox = document.getElementById("error");
const loader = document.getElementById("loader");

/* =========================
   UTILITIES
========================= */
function showLoader(show = true) {
  loader.style.display = show ? "block" : "none";
}

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = "block";
}

function clearError() {
  errorBox.textContent = "";
  errorBox.style.display = "none";
}
function exportPDF() {
  const element = document.getElementById("content");
  html2pdf().set({
    margin: 0.5,
    filename: "github-profile-report.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4" }
  }).from(element).save();
}

/* =========================
   SEARCH HISTORY
========================= */
function saveHistory(username) {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history = history.filter(u => u !== username);
  history.unshift(username);
  history = history.slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById("history");
  if (!container) return;

  const history = JSON.parse(localStorage.getItem("history")) || [];
  container.innerHTML = "";

  history.forEach(user => {
    const btn = document.createElement("button");
    btn.textContent = user;
    btn.onclick = () => loadProfile(user);
    container.appendChild(btn);
  });
}

/* =========================
   MAIN LOAD FLOW
========================= */
async function loadProfile(username) {
  if (!username) return;

  clearError();
  showLoader(true);

  try {
    const user = await cachedFetch(
      `user_${username}`,
      () => fetchUser(username)
    );

    const repos = await cachedFetch(
      `repos_${username}`,
      () => fetchRepos(username)
    );

    renderProfile(user);
    renderStats(user, repos);
    renderRepos(repos);
    renderLanguageChart(repos);
    renderStarsChart(repos);

    saveHistory(username);
    updateURL(username);
  } catch (err) {
    showError(err.message);
  } finally {
    showLoader(false);
  }
}

/* =========================
   URL PARAM SUPPORT
========================= */
function updateURL(username) {
  const url = new URL(window.location);
  url.searchParams.set("user", username);
  window.history.pushState({}, "", url);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const user = params.get("user");
  if (user) {
    input.value = user;
    loadProfile(user);
  }
}

/* =========================
   EVENTS
========================= */
form.addEventListener("submit", e => {
  e.preventDefault();
  loadProfile(input.value.trim());
});

document.addEventListener("DOMContentLoaded", () => {
  renderHistory();
  loadFromURL();
});
