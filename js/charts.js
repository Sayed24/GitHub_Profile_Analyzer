/* =========================
   Charts Rendering
   ========================= */

let languageChartInstance = null;
let starsChartInstance = null;

/* ---------- Helpers ---------- */

function destroyChart(chart) {
  if (chart) {
    chart.destroy();
  }
}

/* ---------- Language Usage Chart ---------- */

function renderLanguageChart(languageMap) {
  const ctx = document
    .getElementById("languageChart")
    .getContext("2d");

  const labels = Object.keys(languageMap);
  const data = Object.values(languageMap);

  destroyChart(languageChartInstance);

  languageChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#e6edf3"
          }
        }
      }
    }
  });
}

/* ---------- Stars Distribution ---------- */

function renderStarsChart(repos) {
  const ctx = document
    .getElementById("starsChart")
    .getContext("2d");

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  const labels = topRepos.map(r => r.name);
  const data = topRepos.map(r => r.stargazers_count);

  destroyChart(starsChartInstance);

  starsChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          data
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: "#e6edf3" }
        },
        y: {
          ticks: { color: "#e6edf3" }
        }
      }
    }
  });
}
