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

document.getElementById("compareBtn").onclick = compareProfiles;

async function compareProfiles() {
  const a = document.getElementById("userA").value;
  const b = document.getElementById("userB").value;
  if (!a || !b) return;

  const res = document.getElementById("compareResult");
  res.classList.remove("hidden");
  res.innerHTML = "Loading...";

  try {
    const [user1, user2] = await Promise.all([fetchUser(a), fetchUser(b)]);

    const winner = user1.followers > user2.followers ? a : b;

    res.innerHTML = `
      ${compareCard(user1, winner)}
      ${compareCard(user2, winner)}
    `;
  } catch {
    res.innerHTML = "Comparison failed";
  }
}

function compareCard(user, winner) {
  return `
    <div class="compare-card ${user.login === winner ? "winner" : ""}">
      <h3>${user.login}</h3>
      <p>Followers: ${user.followers}</p>
      <p>Repos: ${user.public_repos}</p>
    </div>
  `;
}
