const test = require("node:test");
const assert = require("node:assert/strict");
const utils = require("../js/utils.js");

test("normalizeUsername accepts usernames and GitHub profile URLs", () => {
  assert.equal(utils.normalizeUsername("octocat"), "octocat");
  assert.equal(utils.normalizeUsername("@Sayed24"), "Sayed24");
  assert.equal(utils.normalizeUsername("https://github.com/octocat/"), "octocat");
  assert.equal(utils.normalizeUsername("not valid username!"), "");
});

test("calculateLanguageStats counts primary repository languages", () => {
  const repos = [
    { language: "JavaScript" },
    { language: "HTML" },
    { language: "JavaScript" },
    { language: null }
  ];
  assert.deepEqual(utils.calculateLanguageStats(repos), { JavaScript: 2, HTML: 1 });
});

test("filterAndSortRepos filters by text and language without mutating source", () => {
  const repos = [
    { name: "alpha", description: "Weather app", language: "JavaScript", stargazers_count: 2, forks_count: 0, updated_at: "2026-01-01", topics: ["api"] },
    { name: "beta", description: "Data scripts", language: "Python", stargazers_count: 7, forks_count: 2, updated_at: "2026-02-01", topics: [] },
    { name: "gamma", description: "Another API", language: "JavaScript", stargazers_count: 4, forks_count: 1, updated_at: "2026-03-01", topics: ["api"] }
  ];
  const result = utils.filterAndSortRepos(repos, "api", "JavaScript", "stars");
  assert.deepEqual(result.map((r) => r.name), ["gamma", "alpha"]);
  assert.deepEqual(repos.map((r) => r.name), ["alpha", "beta", "gamma"]);
});

test("portfolio score stays inside 0-100", () => {
  const user = { name: "Dev", bio: "Bio", location: "CA", blog: "example.com", company: "Example", hireable: true, followers: 500, following: 10, public_repos: 50, created_at: "2018-01-01T00:00:00Z" };
  const repos = [{ stargazers_count: 500, forks_count: 20, language: "JavaScript", fork: false, archived: false, pushed_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
  const events = [{ type: "PushEvent", created_at: new Date().toISOString() }];
  const metrics = utils.calculateMetrics(user, repos, events);
  const health = utils.calculateHealth(user, metrics);
  const score = utils.calculatePortfolioScore(user, metrics, health);
  assert.ok(score >= 0 && score <= 100);
});

test("activity heatmap returns the requested number of weeks", () => {
  const events = [{ type: "PushEvent", created_at: new Date().toISOString() }];
  const heatmap = utils.buildActivityHeatmap(events, 12);
  assert.equal(heatmap.weeks.length, 12);
  assert.equal(heatmap.weeks.flat().length, 84);
  assert.ok(heatmap.totalEvents >= 1);
});
