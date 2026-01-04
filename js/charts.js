let chart;

function renderLanguageChart(repos) {
  const languages = {};

  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  const ctx = document.getElementById("languageChart");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(languages),
      datasets: [{
        data: Object.values(languages)
      }]
    }
  });

  document.getElementById("chartCard").classList.remove("hidden");
}
