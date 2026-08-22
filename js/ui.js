(function (global) {
  "use strict";

  const icons = {
    check: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
    map: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    company: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 21V7l8-4v18M12 9h8v12M8 9h.01M8 13h.01M8 17h.01M16 13h.01M16 17h.01"/></svg>',
    link: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7-7l-1.2 1.2M14 11a5 5 0 0 0-7.1-.1l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></svg>',
    calendar: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>',
    external: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></svg>',
    star: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>',
    fork: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="6" cy="4" r="2"/><circle cx="18" cy="4" r="2"/><circle cx="12" cy="20" r="2"/><path d="M6 6v3c0 2 2 3 6 3s6-1 6-3V6M12 12v6"/></svg>',
    repo: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Z"/><path d="M6 16h12M8 8h6"/></svg>',
    users: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>',
    pulse: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 12h4l2-6 4 12 2-6h6"/></svg>',
    clock: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    share: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg>',
    heart: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    pdf: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 13h6M9 17h6"/></svg>',
    github: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.49 0-.24-.01-1.05-.02-1.9-2.78.62-3.37-1.2-3.37-1.2-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.64-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.92c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z"/></svg>'
  };

  function el(id) { return document.getElementById(id); }

  function setSearchLoading(loading, buttonId) {
    const button = el(buttonId || "searchBtn");
    if (!button) return;
    button.disabled = Boolean(loading);
    button.classList.toggle("is-loading", Boolean(loading));
  }

  function showSkeleton(show, id) {
    const node = el(id || "skeletonPanel");
    if (node) node.classList.toggle("is-hidden", !show);
  }

  function showDashboard(show) {
    const node = el("dashboard");
    if (node) node.classList.toggle("is-hidden", !show);
  }

  function hideError(panelId) {
    const panel = el(panelId || "errorPanel");
    if (panel) panel.classList.add("is-hidden");
  }

  function showError(message, title, panelId, messageId) {
    const panel = el(panelId || "errorPanel");
    const titleNode = el("errorTitle");
    const messageNode = el(messageId || "errorMessage");
    if (!panel || !messageNode) return;
    if (titleNode && title) titleNode.textContent = title;
    messageNode.textContent = String(message || "Something went wrong.");
    panel.classList.remove("is-hidden");
  }

  function animateNumber(node, value) {
    if (!node) return;
    const target = Number(value) || 0;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || target === 0) {
      node.textContent = GHUtils.formatNumber(target);
      return;
    }
    const start = performance.now();
    const duration = 650;
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = GHUtils.formatNumber(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderProfile(bundle, favorite) {
    const container = el("profileCard");
    if (!container) return;
    const { user } = bundle;
    const website = GHUtils.sanitizeUrl(user.blog);
    const joined = GHUtils.formatDate(user.created_at);
    const meta = [];
    if (user.location) meta.push(`<span class="profile-meta-item">${icons.map}${GHUtils.escapeHTML(user.location)}</span>`);
    if (user.company) meta.push(`<span class="profile-meta-item">${icons.company}${GHUtils.escapeHTML(user.company)}</span>`);
    if (website) meta.push(`<span class="profile-meta-item">${icons.link}<a href="${GHUtils.escapeHTML(website)}" target="_blank" rel="noopener noreferrer">${GHUtils.escapeHTML(user.blog)}</a></span>`);
    meta.push(`<span class="profile-meta-item">${icons.calendar}Joined ${GHUtils.escapeHTML(joined)}</span>`);

    container.innerHTML = `
      <div class="profile-avatar-wrap">
        <img class="profile-avatar" src="${GHUtils.escapeHTML(user.avatar_url)}" alt="${GHUtils.escapeHTML(user.login)} GitHub avatar" width="110" height="110" loading="eager" decoding="async" />
        <span class="profile-status-dot" title="Public GitHub profile">${icons.check}</span>
      </div>
      <div class="profile-content">
        <div class="profile-title-row">
          <h2>${GHUtils.escapeHTML(user.name || user.login)}</h2>
          <a class="profile-handle" href="${GHUtils.escapeHTML(user.html_url)}" target="_blank" rel="noopener noreferrer">@${GHUtils.escapeHTML(user.login)}</a>
        </div>
        <p class="profile-bio">${GHUtils.escapeHTML(user.bio || "No public bio provided.")}</p>
        <div class="profile-meta-list">${meta.join("")}</div>
      </div>
      <div class="profile-actions">
        <a class="action-button" href="${GHUtils.escapeHTML(user.html_url)}" target="_blank" rel="noopener noreferrer">${icons.github}<span>GitHub</span></a>
        <button id="shareProfileBtn" class="action-button" type="button">${icons.share}<span>Share</span></button>
        <button id="favoriteProfileBtn" class="action-button ${favorite ? "is-favorite" : ""}" type="button" aria-pressed="${favorite ? "true" : "false"}">${icons.heart}<span>${favorite ? "Saved" : "Favorite"}</span></button>
        <button id="exportPdfBtn" class="action-button" type="button">${icons.pdf}<span>Export PDF</span></button>
      </div>`;
  }

  function renderStats(bundle) {
    const grid = el("statsGrid");
    if (!grid) return;
    const { user, metrics, score } = bundle;
    const stats = [
      { label: "Public repos", value: metrics.publicRepos, caption: `${metrics.analyzedRepos} analyzed`, icon: icons.repo },
      { label: "Followers", value: user.followers, caption: `${GHUtils.formatNumber(user.following)} following`, icon: icons.users },
      { label: "Total stars", value: metrics.totalStars, caption: `${GHUtils.formatNumber(metrics.totalForks)} forks`, icon: icons.star },
      { label: "Portfolio score", value: score, caption: "public signals / 100", icon: icons.pulse },
      { label: "GitHub age", value: Math.max(0, Math.round(metrics.accountAgeYears * 10) / 10), display: `${metrics.accountAgeYears.toFixed(1)}y`, caption: `${metrics.avgReposPerYear.toFixed(1)} repos/year`, icon: icons.clock },
      { label: "Languages", value: metrics.languageCount, caption: "primary repo languages", icon: icons.repo },
      { label: "Recent events", value: metrics.recent30, caption: "public events / 30d", icon: icons.pulse },
      { label: "Original repos", value: metrics.originalRepos, caption: `${metrics.archivedRepos} archived`, icon: icons.fork }
    ];
    grid.innerHTML = stats.map((stat, index) => `
      <article class="card metric-card">
        <div class="metric-top"><span>${GHUtils.escapeHTML(stat.label)}</span><span class="metric-icon">${stat.icon}</span></div>
        <div>
          <div class="metric-value" data-counter="${index}" data-value="${GHUtils.escapeHTML(stat.display || stat.value)}">0</div>
          <div class="metric-caption">${GHUtils.escapeHTML(stat.caption)}</div>
        </div>
      </article>`).join("");

    stats.forEach((stat, index) => {
      const node = grid.querySelector(`[data-counter="${index}"]`);
      if (stat.display) node.textContent = stat.display;
      else animateNumber(node, stat.value);
    });
  }

  function renderInsights(bundle) {
    const list = el("smartInsights");
    const scoreBadge = el("portfolioScoreBadge");
    if (scoreBadge) scoreBadge.textContent = `${bundle.score}/100`;
    if (!list) return;
    list.innerHTML = bundle.insights.map((item) => `
      <div class="insight-item">
        <span class="insight-bullet">${icons.pulse}</span>
        <div><strong>${GHUtils.escapeHTML(item.title)}</strong><p>${GHUtils.escapeHTML(item.text)}</p></div>
      </div>`).join("");
  }

  function renderHealth(bundle) {
    const container = el("healthSignals");
    if (!container) return;
    const rows = [
      ["Profile completeness", bundle.health.profileCompleteness],
      ["Recent activity", bundle.health.activity],
      ["Community traction", bundle.health.traction],
      ["Technology breadth", bundle.health.diversity],
      ["Maintenance", bundle.health.maintenance]
    ];
    container.innerHTML = rows.map(([label, value]) => `
      <div class="health-row">
        <div class="health-label"><span>${GHUtils.escapeHTML(label)}</span><span>${value}%</span></div>
        <div class="health-track"><div class="health-fill" style="--value:${value}%"></div></div>
      </div>`).join("");
  }

  function renderRepoFilters(repos) {
    const select = el("languageFilter");
    if (!select) return;
    const current = select.value || "all";
    const languages = [...new Set((repos || []).map((repo) => repo.language).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    select.innerHTML = `<option value="all">All languages</option>${languages.map((lang) => `<option value="${GHUtils.escapeHTML(lang)}">${GHUtils.escapeHTML(lang)}</option>`).join("")}`;
    if (["all", ...languages].includes(current)) select.value = current;
  }

  function renderRepos(repos, analyzedTotal) {
    const grid = el("reposGrid");
    const empty = el("repoEmptyState");
    const label = el("repoCountLabel");
    if (!grid || !empty) return;
    if (label) label.textContent = `${repos.length} shown from ${analyzedTotal} analyzed public repositories.`;

    if (!repos.length) {
      grid.innerHTML = "";
      empty.classList.remove("is-hidden");
      return;
    }
    empty.classList.add("is-hidden");
    grid.innerHTML = repos.map((repo) => {
      const topics = Array.isArray(repo.topics) ? repo.topics.slice(0, 3) : [];
      const tags = [repo.language, ...topics].filter(Boolean).slice(0, 4);
      return `
        <article class="card repo-card">
          <div class="repo-top">
            <a class="repo-name" href="${GHUtils.escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer">${GHUtils.escapeHTML(repo.name)}</a>
            <a class="repo-external" href="${GHUtils.escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${GHUtils.escapeHTML(repo.name)} on GitHub">${icons.external}</a>
          </div>
          <p class="repo-description">${GHUtils.escapeHTML(repo.description || "No repository description provided.")}</p>
          <div class="repo-tags">${tags.map((tag) => `<span class="repo-tag">${GHUtils.escapeHTML(tag)}</span>`).join("")}</div>
          <div class="repo-footer">
            <div class="repo-stats">
              <span class="repo-stat">${icons.star}${GHUtils.formatNumber(repo.stargazers_count)}</span>
              <span class="repo-stat">${icons.fork}${GHUtils.formatNumber(repo.forks_count)}</span>
            </div>
            <span title="${GHUtils.escapeHTML(GHUtils.formatDate(repo.updated_at))}">Updated ${GHUtils.escapeHTML(GHUtils.timeAgo(repo.updated_at))}</span>
          </div>
        </article>`;
    }).join("");
  }

  function renderActivity(events) {
    const container = el("activityHeatmap");
    const summary = el("activitySummary");
    if (!container) return;
    const heatmap = GHUtils.buildActivityHeatmap(events, 12);
    container.innerHTML = `<div class="heatmap">${heatmap.weeks.map((week) => `<div class="heatmap-week">${week.map((day) => `<span class="heatmap-cell" data-level="${day.level}" title="${GHUtils.escapeHTML(GHUtils.formatDate(day.date))}: ${day.count} public event${day.count === 1 ? "" : "s"}"></span>`).join("")}</div>`).join("")}</div>`;
    if (summary) summary.innerHTML = `<span class="summary-pill">${heatmap.totalEvents} events</span><span class="summary-pill">${heatmap.activeDays} active days</span>`;
  }

  function renderHistory(items, onSelect) {
    const list = el("historyList");
    if (!list) return;
    if (!items.length) { list.innerHTML = '<span class="empty-inline">No recent searches yet.</span>'; return; }
    list.innerHTML = "";
    items.forEach((username) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "history-chip";
      button.textContent = `@${username}`;
      button.addEventListener("click", () => onSelect(username));
      list.appendChild(button);
    });
  }

  function renderFavorites(items, onSelect) {
    const list = el("favoritesList");
    const count = el("favoriteCount");
    if (count) count.textContent = String(items.length);
    if (!list) return;
    if (!items.length) { list.innerHTML = '<span class="empty-inline">Star a profile to keep it here.</span>'; return; }
    list.innerHTML = "";
    items.forEach((username) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "favorite-chip";
      button.textContent = `★ ${username}`;
      button.addEventListener("click", () => onSelect(username));
      list.appendChild(button);
    });
  }

  function updateRateLimit(rate) {
    const node = el("rateLimitLabel");
    if (!node) return;
    if (!rate || rate.remaining == null || rate.limit == null) { node.textContent = "API status: ready"; return; }
    node.textContent = `API: ${rate.remaining}/${rate.limit} requests remaining`;
  }

  function toast(message, type, title) {
    const region = el("toastRegion");
    if (!region) return;
    const node = document.createElement("div");
    node.className = `toast ${type || ""}`.trim();
    node.innerHTML = `<div><strong>${GHUtils.escapeHTML(title || (type === "error" ? "Error" : "GitHub Analyzer"))}</strong><div>${GHUtils.escapeHTML(message)}</div></div>`;
    region.appendChild(node);
    setTimeout(() => node.remove(), 3800);
  }

  function renderCompareProfile(containerId, bundle) {
    const container = el(containerId);
    if (!container) return;
    const { user, metrics, score } = bundle;
    container.innerHTML = `
      <div class="compare-profile-top">
        <img class="profile-avatar" src="${GHUtils.escapeHTML(user.avatar_url)}" alt="${GHUtils.escapeHTML(user.login)} avatar" width="82" height="82" />
        <div class="compare-profile-copy"><h2>${GHUtils.escapeHTML(user.name || user.login)}</h2><a href="${GHUtils.escapeHTML(user.html_url)}" target="_blank" rel="noopener noreferrer">@${GHUtils.escapeHTML(user.login)}</a></div>
      </div>
      <div class="compare-score-box"><span>Portfolio score</span><strong>${score}/100</strong></div>
      <div class="compare-stat-list">
        <div class="compare-stat"><span>Public repos</span><strong>${GHUtils.formatNumber(metrics.publicRepos)}</strong></div>
        <div class="compare-stat"><span>Followers</span><strong>${GHUtils.formatNumber(user.followers)}</strong></div>
        <div class="compare-stat"><span>Stars analyzed</span><strong>${GHUtils.formatNumber(metrics.totalStars)}</strong></div>
        <div class="compare-stat"><span>Forks analyzed</span><strong>${GHUtils.formatNumber(metrics.totalForks)}</strong></div>
        <div class="compare-stat"><span>Languages</span><strong>${GHUtils.formatNumber(metrics.languageCount)}</strong></div>
        <div class="compare-stat"><span>Recent events</span><strong>${GHUtils.formatNumber(metrics.recent30)}</strong></div>
      </div>
      <p class="compare-insight">${GHUtils.escapeHTML(bundle.insights[0] ? bundle.insights[0].text : "No additional public activity insight is available.")}</p>`;
  }

  function renderComparisonSummary(left, right) {
    const container = el("comparisonSummary");
    if (!container) return;
    const diff = Math.abs(left.score - right.score);
    let result = "Scores are tied";
    let copy = `Both profiles score ${left.score}/100 using the same public-signal heuristic.`;
    if (left.score !== right.score) {
      const leader = left.score > right.score ? left : right;
      result = `${leader.user.login} leads by ${diff}`;
      copy = `${leader.user.login} currently has the higher public portfolio signal score. Use the component metrics—not the winner label—to understand why.`;
    }
    container.innerHTML = `
      <div class="summary-avatar-pair"><img src="${GHUtils.escapeHTML(left.user.avatar_url)}" alt="" /><img src="${GHUtils.escapeHTML(right.user.avatar_url)}" alt="" /></div>
      <div class="summary-copy"><h2>${GHUtils.escapeHTML(left.user.login)} vs ${GHUtils.escapeHTML(right.user.login)}</h2><p>${GHUtils.escapeHTML(copy)}</p></div>
      <span class="summary-result">${GHUtils.escapeHTML(result)}</span>`;
  }

  global.GHUI = {
    icons,
    el,
    setSearchLoading,
    showSkeleton,
    showDashboard,
    hideError,
    showError,
    renderProfile,
    renderStats,
    renderInsights,
    renderHealth,
    renderRepoFilters,
    renderRepos,
    renderActivity,
    renderHistory,
    renderFavorites,
    updateRateLimit,
    toast,
    renderCompareProfile,
    renderComparisonSummary
  };
})(window);
