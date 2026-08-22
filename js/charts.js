(function (global) {
  "use strict";

  const instances = new Map();
  const palette = ["#58a6ff", "#3fb950", "#bc8cff", "#d29922", "#f85149", "#39c5cf", "#ff9bce", "#8b949e", "#79c0ff", "#56d364"];

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function chartAvailable() {
    return typeof global.Chart === "function";
  }

  function destroy(id) {
    const instance = instances.get(id);
    if (instance) instance.destroy();
    instances.delete(id);
  }

  function baseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 500 },
      plugins: {
        legend: {
          labels: {
            color: cssVar("--text-soft", "#c9d1d9"),
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 14,
            font: { size: 11, family: "system-ui" }
          }
        },
        tooltip: {
          backgroundColor: cssVar("--surface-3", "#1b2632"),
          titleColor: cssVar("--text", "#f0f6fc"),
          bodyColor: cssVar("--text-soft", "#c9d1d9"),
          borderColor: cssVar("--border-strong", "#30363d"),
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10,
          displayColors: true
        }
      }
    };
  }

  function showFallback(canvasId, fallbackId, rows, message) {
    const canvas = document.getElementById(canvasId);
    const fallback = document.getElementById(fallbackId);
    if (canvas) canvas.classList.add("is-hidden");
    if (!fallback) return;
    fallback.classList.remove("is-hidden");
    if (!rows || !rows.length) {
      fallback.textContent = message || "No chart data is available for this profile.";
      return;
    }
    fallback.innerHTML = `<div class="chart-legend-fallback">${rows.map((row) => `<div class="legend-row"><span>${GHUtils.escapeHTML(row.label)}</span><strong>${GHUtils.escapeHTML(row.value)}</strong></div>`).join("")}</div>`;
  }

  function prepareCanvas(canvasId, fallbackId) {
    const canvas = document.getElementById(canvasId);
    const fallback = document.getElementById(fallbackId);
    if (fallback) fallback.classList.add("is-hidden");
    if (canvas) canvas.classList.remove("is-hidden");
    return canvas;
  }

  function renderLanguageChart(languageMap) {
    const labels = Object.keys(languageMap || {});
    const values = Object.values(languageMap || {});
    const fallbackRows = labels.map((label, index) => ({ label, value: values[index] }));
    destroy("language");

    if (!labels.length || !chartAvailable()) {
      showFallback("languageChart", "languageFallback", fallbackRows, labels.length ? "Chart.js is unavailable; language totals are shown instead." : "No language metadata is available.");
      return;
    }

    const canvas = prepareCanvas("languageChart", "languageFallback");
    if (!canvas) return;
    const options = baseOptions();
    options.cutout = "68%";
    options.plugins.legend.position = "bottom";
    options.plugins.tooltip.callbacks = {
      label(context) {
        const total = values.reduce((a, b) => a + b, 0) || 1;
        const percent = Math.round((context.parsed / total) * 100);
        return ` ${context.label}: ${context.parsed} repos (${percent}%)`;
      }
    };

    instances.set("language", new Chart(canvas, {
      type: "doughnut",
      data: { labels, datasets: [{ data: values, backgroundColor: labels.map((_, i) => palette[i % palette.length]), borderWidth: 0, hoverOffset: 6 }] },
      options
    }));
  }

  function renderStarsChart(repos) {
    const top = [...(repos || [])].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0)).slice(0, 8);
    const rows = top.map((repo) => ({ label: repo.name, value: `${GHUtils.formatNumber(repo.stargazers_count)} stars` }));
    destroy("stars");

    if (!top.length || !chartAvailable()) {
      showFallback("starsChart", "starsFallback", rows, top.length ? "Chart.js is unavailable; repository totals are shown instead." : "No repositories are available for this chart.");
      return;
    }

    const canvas = prepareCanvas("starsChart", "starsFallback");
    if (!canvas) return;
    const options = baseOptions();
    options.indexAxis = "y";
    options.plugins.legend.display = false;
    options.scales = {
      x: { beginAtZero: true, grid: { color: cssVar("--border", "#30363d") }, ticks: { color: cssVar("--muted", "#8b949e"), precision: 0 } },
      y: { grid: { display: false }, ticks: { color: cssVar("--text-soft", "#c9d1d9"), callback(value) { const label = this.getLabelForValue(value); return label.length > 18 ? `${label.slice(0, 17)}…` : label; } } }
    };

    instances.set("stars", new Chart(canvas, {
      type: "bar",
      data: { labels: top.map((repo) => repo.name), datasets: [{ data: top.map((repo) => repo.stargazers_count || 0), backgroundColor: palette[0], borderRadius: 7, maxBarThickness: 22 }] },
      options
    }));
  }

  function renderCompareLanguageChart(leftMap, rightMap, leftLabel, rightLabel) {
    const labels = Array.from(new Set([...Object.keys(leftMap || {}), ...Object.keys(rightMap || {})])).sort((a, b) => {
      const totalA = (leftMap[a] || 0) + (rightMap[a] || 0);
      const totalB = (leftMap[b] || 0) + (rightMap[b] || 0);
      return totalB - totalA || a.localeCompare(b);
    }).slice(0, 12);
    destroy("compare-language");

    if (!labels.length || !chartAvailable()) {
      const rows = labels.map((label) => ({ label, value: `${leftLabel}: ${leftMap[label] || 0} • ${rightLabel}: ${rightMap[label] || 0}` }));
      showFallback("compareLanguageChart", "compareChartFallback", rows, labels.length ? "Chart.js is unavailable; language totals are shown instead." : "No language metadata is available for either profile.");
      return;
    }

    const canvas = prepareCanvas("compareLanguageChart", "compareChartFallback");
    if (!canvas) return;
    const options = baseOptions();
    options.plugins.legend.position = "bottom";
    options.scales = {
      x: { grid: { display: false }, ticks: { color: cssVar("--muted", "#8b949e"), maxRotation: 42, minRotation: 0 } },
      y: { beginAtZero: true, grid: { color: cssVar("--border", "#30363d") }, ticks: { color: cssVar("--muted", "#8b949e"), precision: 0 } }
    };

    instances.set("compare-language", new Chart(canvas, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: leftLabel, data: labels.map((label) => leftMap[label] || 0), backgroundColor: palette[0], borderRadius: 6, maxBarThickness: 26 },
          { label: rightLabel, data: labels.map((label) => rightMap[label] || 0), backgroundColor: palette[2], borderRadius: 6, maxBarThickness: 26 }
        ]
      },
      options
    }));
  }

  function refreshForTheme() {
    // Existing charts are re-rendered by app/theme listeners using stored data.
    instances.forEach((chart) => {
      if (!chart) return;
      const text = cssVar("--text-soft", "#c9d1d9");
      const muted = cssVar("--muted", "#8b949e");
      const border = cssVar("--border", "#30363d");
      if (chart.options.plugins && chart.options.plugins.legend) chart.options.plugins.legend.labels.color = text;
      if (chart.options.scales) {
        Object.values(chart.options.scales).forEach((scale) => {
          if (scale.ticks) scale.ticks.color = muted;
          if (scale.grid && scale.grid.display !== false) scale.grid.color = border;
        });
      }
      chart.update("none");
    });
  }

  global.GHCharts = { renderLanguageChart, renderStarsChart, renderCompareLanguageChart, refreshForTheme, destroy };
})(window);
