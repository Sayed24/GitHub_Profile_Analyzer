import { fetchUser, fetchRepos } from "./api.js";
import { renderProfile, renderRepos } from "./ui.js";
import { renderLanguageChart } from "./charts.js";

document.getElementById("searchBtn").onclick = async () => {
  const username = document.getElementById("usernameInput").value;
  if (!username) return;

  try {
    const user = await fetchUser(username);
    const repos = await fetchRepos(username);

    renderProfile(user);
    renderRepos(repos);
    renderLanguageChart(repos);
    saveHistory(username);
  } catch (err) {
    alert(err.message);
  }
};

function saveHistory(user) {
  let h = JSON.parse(localStorage.getItem("history")) || [];
  h = [user, ...h.filter(u => u !== user)].slice(0, 5);
  localStorage.setItem("history", JSON.stringify(h));
}

