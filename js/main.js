const input = document.getElementById("usernameInput");
const btn = document.getElementById("searchBtn");
const loader = document.getElementById("loader");
const errorEl = document.getElementById("error");
const historyEl = document.getElementById("history");

btn.onclick = () => loadProfile(input.value);
input.addEventListener("keypress", e => {
  if (e.key === "Enter") loadProfile(input.value);
});

async function loadProfile(username) {
  if (!username) return;

  loader.classList.remove("hidden");
  errorEl.classList.add("hidden");

  try {
    const user = await fetchUser(username);
    const repos = await fetchRepos(username);

    showProfile(user);
    showStats(user, repos);
    showRepos(repos);
    renderLanguageChart(repos);

    saveHistory(username);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
}

function saveHistory(username) {
  let history = JSON.parse(localStorage.getItem("history") || "[]");
  history = [username, ...history.filter(u => u !== username)].slice(0, 5);
  localStorage.setItem("history", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("history") || "[]");
  historyEl.innerHTML = history.map(u =>
    `<button onclick="loadProfile('${u}')">${u}</button>`
  ).join("");
}

renderHistory();

const params = new URLSearchParams(window.location.search);
if (params.get("user")) loadProfile(params.get("user"));
