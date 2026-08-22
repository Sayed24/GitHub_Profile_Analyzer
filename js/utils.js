(function (global) {
  "use strict";

  const DAY = 86400000;
  const YEAR = 365.25 * DAY;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, Number(value) || 0));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeUsername(input) {
    let value = String(input || "").trim();
    if (!value) return "";

    try {
      if (/^https?:\/\//i.test(value)) {
        const url = new URL(value);
        if (url.hostname.toLowerCase() === "github.com" || url.hostname.toLowerCase() === "www.github.com") {
          value = url.pathname.split("/").filter(Boolean)[0] || "";
        }
      }
    } catch (_) {
      // Keep the raw value and validate below.
    }

    value = value.replace(/^@/, "").replace(/\/$/, "").trim();
    return /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(value) ? value : "";
  }

  function formatNumber(value) {
    const num = Number(value) || 0;
    if (Math.abs(num) < 1000) return new Intl.NumberFormat().format(num);
    return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(num);
  }

  function formatDate(value, options) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    return new Intl.DateTimeFormat(undefined, options || { year: "numeric", month: "short", day: "numeric" }).format(date);
  }

  function timeAgo(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown";
    const delta = Date.now() - date.getTime();
    const abs = Math.abs(delta);
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (abs < 60 * 1000) return formatter.format(-Math.round(delta / 1000), "second");
    if (abs < 60 * 60 * 1000) return formatter.format(-Math.round(delta / (60 * 1000)), "minute");
    if (abs < DAY) return formatter.format(-Math.round(delta / (60 * 60 * 1000)), "hour");
    if (abs < 30 * DAY) return formatter.format(-Math.round(delta / DAY), "day");
    if (abs < YEAR) return formatter.format(-Math.round(delta / (30 * DAY)), "month");
    return formatter.format(-Math.round(delta / YEAR), "year");
  }

  function sanitizeUrl(value) {
    if (!value) return "";
    let raw = String(value).trim();
    if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
    try {
      const url = new URL(raw);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (_) {
      return "";
    }
  }

  function calculateLanguageStats(repos) {
    const map = {};
    (repos || []).forEach((repo) => {
      const language = repo && repo.language;
      if (!language) return;
      map[language] = (map[language] || 0) + 1;
    });
    return Object.fromEntries(Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])));
  }

  function calculateMetrics(user, repos, events) {
    const safeRepos = Array.isArray(repos) ? repos : [];
    const safeEvents = Array.isArray(events) ? events : [];
    const totalStars = safeRepos.reduce((sum, repo) => sum + (Number(repo.stargazers_count) || 0), 0);
    const totalForks = safeRepos.reduce((sum, repo) => sum + (Number(repo.forks_count) || 0), 0);
    const languages = calculateLanguageStats(safeRepos);
    const topRepo = [...safeRepos].sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))[0] || null;
    const accountAgeYears = Math.max(0, (Date.now() - new Date(user.created_at).getTime()) / YEAR);
    const avgReposPerYear = (Number(user.public_repos) || safeRepos.length) / Math.max(accountAgeYears, 1);
    const followerRatio = (Number(user.followers) || 0) / Math.max(Number(user.following) || 0, 1);
    const recent30 = safeEvents.filter((event) => Date.now() - new Date(event.created_at).getTime() <= 30 * DAY).length;
    const recent90 = safeEvents.filter((event) => Date.now() - new Date(event.created_at).getTime() <= 90 * DAY).length;
    const pushEvents = safeEvents.filter((event) => event.type === "PushEvent").length;
    const latestRepoPush = safeRepos.reduce((latest, repo) => {
      const time = new Date(repo.pushed_at || repo.updated_at || 0).getTime();
      return Math.max(latest, Number.isNaN(time) ? 0 : time);
    }, 0);
    const activeRecently = latestRepoPush ? Date.now() - latestRepoPush <= 90 * DAY : false;
    const originalRepos = safeRepos.filter((repo) => !repo.fork).length;
    const archivedRepos = safeRepos.filter((repo) => repo.archived).length;

    return {
      analyzedRepos: safeRepos.length,
      publicRepos: Number(user.public_repos) || safeRepos.length,
      totalStars,
      totalForks,
      topRepo,
      languages,
      languageCount: Object.keys(languages).length,
      accountAgeYears,
      avgReposPerYear,
      followerRatio,
      eventCount: safeEvents.length,
      recent30,
      recent90,
      pushEvents,
      latestRepoPush,
      activeRecently,
      originalRepos,
      archivedRepos
    };
  }

  function calculateHealth(user, metrics) {
    let profileCompleteness = 35;
    if (user.name) profileCompleteness += 10;
    if (user.bio) profileCompleteness += 20;
    if (user.location) profileCompleteness += 10;
    if (user.blog) profileCompleteness += 10;
    if (user.company) profileCompleteness += 10;
    if (user.hireable) profileCompleteness += 5;

    const activity = clamp(metrics.recent30 * 6 + (metrics.activeRecently ? 30 : 0) + Math.min(metrics.avgReposPerYear * 3, 25), 0, 100);
    const traction = clamp(Math.log10(metrics.totalStars + 1) * 28 + Math.log10((user.followers || 0) + 1) * 24 + Math.log10(metrics.totalForks + 1) * 18, 0, 100);
    const diversity = clamp(metrics.languageCount * 14 + Math.min(metrics.originalRepos, 6) * 3, 0, 100);
    const maintenance = clamp((metrics.activeRecently ? 55 : 15) + Math.min(metrics.recent90, 15) * 3, 0, 100);

    return {
      profileCompleteness: Math.round(clamp(profileCompleteness, 0, 100)),
      activity: Math.round(activity),
      traction: Math.round(traction),
      diversity: Math.round(diversity),
      maintenance: Math.round(maintenance)
    };
  }

  function calculatePortfolioScore(user, metrics, health) {
    const score =
      health.profileCompleteness * 0.18 +
      health.activity * 0.26 +
      health.traction * 0.24 +
      health.diversity * 0.12 +
      health.maintenance * 0.20;
    return Math.round(clamp(score, 0, 100));
  }

  function generateInsights(user, metrics, health, score) {
    const insights = [];
    const primaryLanguage = Object.keys(metrics.languages)[0];

    if (metrics.activeRecently) {
      insights.push({ title: "Current activity", text: `Public repositories show recent activity, with ${metrics.recent30} public event${metrics.recent30 === 1 ? "" : "s"} observed in the last 30 days.` });
    } else {
      insights.push({ title: "Activity cadence", text: "The analyzed public repositories do not show a push in the last 90 days. A fresh project update could make the profile feel more current." });
    }

    if (primaryLanguage) {
      const share = Math.round((metrics.languages[primaryLanguage] / Math.max(metrics.analyzedRepos, 1)) * 100);
      insights.push({ title: "Technical focus", text: `${primaryLanguage} is the most common primary language, appearing on about ${share}% of analyzed repositories with language metadata.` });
    } else {
      insights.push({ title: "Technical focus", text: "GitHub does not report a primary language for the analyzed public repositories." });
    }

    if (metrics.totalStars > 0 || metrics.totalForks > 0) {
      insights.push({ title: "Community traction", text: `The analyzed repositories have ${formatNumber(metrics.totalStars)} star${metrics.totalStars === 1 ? "" : "s"} and ${formatNumber(metrics.totalForks)} fork${metrics.totalForks === 1 ? "" : "s"} in total.` });
    } else {
      insights.push({ title: "Discoverability", text: "The analyzed repositories have not accumulated stars or forks yet. Strong READMEs, demos, topics, and screenshots can improve discoverability." });
    }

    if (health.profileCompleteness < 75) {
      const missing = [];
      if (!user.bio) missing.push("bio");
      if (!user.location) missing.push("location");
      if (!user.blog) missing.push("portfolio link");
      if (!user.company) missing.push("company");
      insights.push({ title: "Profile polish", text: `Profile completeness can improve${missing.length ? ` by adding ${missing.slice(0, 3).join(", ")}` : " with richer public profile details"}.` });
    } else {
      insights.push({ title: "Profile polish", text: "The public profile is well filled out, which helps recruiters quickly understand the developer behind the repositories." });
    }

    if (metrics.topRepo) {
      insights.push({ title: "Standout repository", text: `${metrics.topRepo.name} is the most-starred analyzed repository with ${formatNumber(metrics.topRepo.stargazers_count)} star${metrics.topRepo.stargazers_count === 1 ? "" : "s"}.` });
    }

    insights.push({ title: "Portfolio score", text: `The ${score}/100 score is a transparent heuristic based only on public profile completeness, recent public activity, repository traction, technology breadth, and maintenance signals—not a measure of coding ability.` });
    return insights.slice(0, 5);
  }

  function filterAndSortRepos(repos, query, language, sort) {
    const text = String(query || "").trim().toLowerCase();
    const lang = String(language || "all");
    const result = (Array.isArray(repos) ? repos : []).filter((repo) => {
      const matchesText = !text || [repo.name, repo.description, ...(repo.topics || [])].some((v) => String(v || "").toLowerCase().includes(text));
      const matchesLanguage = lang === "all" || repo.language === lang;
      return matchesText && matchesLanguage;
    });

    return result.sort((a, b) => {
      if (sort === "stars") return (b.stargazers_count || 0) - (a.stargazers_count || 0) || a.name.localeCompare(b.name);
      if (sort === "forks") return (b.forks_count || 0) - (a.forks_count || 0) || a.name.localeCompare(b.name);
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    });
  }

  function buildActivityHeatmap(events, weeks = 12) {
    const totalDays = weeks * 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today.getTime() - (totalDays - 1) * DAY);
    const counts = new Map();

    (events || []).forEach((event) => {
      const date = new Date(event.created_at);
      if (Number.isNaN(date.getTime())) return;
      date.setHours(0, 0, 0, 0);
      if (date < start || date > today) return;
      const key = date.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const days = [];
    for (let i = 0; i < totalDays; i += 1) {
      const date = new Date(start.getTime() + i * DAY);
      const key = date.toISOString().slice(0, 10);
      const count = counts.get(key) || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4;
      days.push({ date: key, count, level });
    }

    const weekRows = [];
    for (let i = 0; i < days.length; i += 7) weekRows.push(days.slice(i, i + 7));
    return { weeks: weekRows, totalEvents: [...counts.values()].reduce((a, b) => a + b, 0), activeDays: [...counts.values()].filter(Boolean).length };
  }

  function safeJSONParse(value, fallback) {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value == null ? fallback : safeJSONParse(value, fallback);
    } catch (_) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; }
  }

  function loadScript(src, globalName) {
    if (globalName && global[globalName]) return Promise.resolve(global[globalName]);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-dynamic-src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(globalName ? global[globalName] : true), { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.dynamicSrc = src;
      script.onload = () => resolve(globalName ? global[globalName] : true);
      script.onerror = () => reject(new Error(`Could not load ${src}`));
      document.head.appendChild(script);
    });
  }

  async function exportElementAsPDF(element, filename) {
    if (!element) throw new Error("Nothing is available to export.");
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js", "html2pdf");
      if (typeof global.html2pdf !== "function") throw new Error("PDF library unavailable");
      await global.html2pdf().set({
        margin: [0.35, 0.35, 0.45, 0.35],
        filename: filename || "github-profile-report.pdf",
        image: { type: "jpeg", quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#ffffff" },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] }
      }).from(element).save();
      return "download";
    } catch (error) {
      global.print();
      return "print";
    }
  }

  const api = {
    DAY,
    clamp,
    escapeHTML,
    normalizeUsername,
    formatNumber,
    formatDate,
    timeAgo,
    sanitizeUrl,
    calculateLanguageStats,
    calculateMetrics,
    calculateHealth,
    calculatePortfolioScore,
    generateInsights,
    filterAndSortRepos,
    buildActivityHeatmap,
    safeJSONParse,
    readStorage,
    writeStorage,
    loadScript,
    exportElementAsPDF
  };

  global.GHUtils = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
