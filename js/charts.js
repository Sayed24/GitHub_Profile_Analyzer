/* ===========================
   CHART CONFIG
=========================== */

let languageChart = null;

function generateColors(count) {
  const baseColors = [
    "#58a6ff", "#7ee787", "#f778ba",
    "#ffa657", "#d2a8ff", "#f85149",
    "#a371f7", "#39d353"
  ];

  return Array.from({ length: count }, (_, i) =>
    baseColors[i % baseColors.length]
  );
}

/* ===========================
   RENDER LANGUAGE CHART
=========================== */

function renderLanguageChart(languageStats) {
  const ctx = document.getElementById("languageChart");

  if (!ctx) return;

  if (languageChart) {
    languageChart.destroy();
  }

  const labels = Object.keys(languageStats);
  const values = Object.values(languageStats);

  if (!labels.length) {
    ctx.parentElement.innerHTML =
      `<div class="card">No language data available</div>`;
    return;
  }

  languageChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: generateColors(labels.length),
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#c9d1d9",
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: ctx =>
              `${ctx.label}: ${ctx.parsed}`
          }
        }
      }
    }
  });
}

/* ===========================
   RESIZE HANDLER
=========================== */

window.addEventListener("resize", () => {
  if (languageChart) {
    languageChart.resize();
  }
});

/* ===========================
   EXPORT
=========================== */

window.renderLanguageChart = renderLanguageChart;
