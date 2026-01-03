let chart;

export function renderLanguageChart(repos) {
  const languages = {};
  repos.forEach(r => {
    if (r.language) {
      languages[r.language] = (languages[r.language] || 0) + 1;
    }
  });

  const ctx = document.createElement("canvas");
  document.getElementById("chart").innerHTML = "";
  document.getElementById("chart").appendChild(ctx);

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
}

