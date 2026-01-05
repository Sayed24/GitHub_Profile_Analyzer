/* =========================
   CHART REFERENCES
========================= */
let languageChart = null;
let starsChart = null;

/* =========================
   LANGUAGE DATA
========================= */
function getLanguageStats(repos) {
  const stats = {};
  repos.forEach(repo => {
    if (!repo.language) return;
    stats[repo.language] = (stats[repo.language] || 0) + 1;
  });
  return stats;
}

/* =========================
   STARS DATA
========================= */
function getStarsStats(repos) {
  return repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10);
}

/* =========================
   LANGUAGE CHART
========================= */
function renderLanguageChart(repos) {
  const ctx = document.getElementById("languageChart");
  if (!ctx) return;

  if (languageChart) languageChart.destroy();

  const data = getLanguageStats(repos);

  languageChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.values(data)
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

/* =========================
   STARS CHART
========================= */
function renderStarsChart(repos) {
  const ctx = document.getElementById("starsChart");
  if (!ctx) return;

  if (starsChart) starsChart.destroy();

  const topRepos = getStarsStats(repos);

  starsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: topRepos.map(r => r.name),
      datasets: [
        {
          data: topRepos.map(r => r.stargazers_count)
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
