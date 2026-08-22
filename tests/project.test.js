const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("required production files exist", () => {
  [
    "index.html", "compare.html", "offline.html", "manifest.webmanifest", "service-worker.js",
    "css/styles.css", "js/utils.js", "js/api.js", "js/charts.js", "js/ui.js", "js/theme.js", "js/pwa.js", "js/app.js", "js/compare.js"
  ].forEach((file) => assert.equal(fs.existsSync(path.join(root, file)), true, `${file} should exist`));
});

test("dashboard contains IDs required by app.js", () => {
  const html = read("index.html");
  ["searchForm", "usernameInput", "searchBtn", "dashboard", "profileCard", "statsGrid", "reposGrid", "themeToggle"].forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`), `${id} missing from index.html`);
  });
});

test("comparison page contains IDs required by compare.js", () => {
  const html = read("compare.html");
  ["compareForm", "userAInput", "userBInput", "compareBtn", "compareResults", "profileA", "profileB", "compareLanguageChart"].forEach((id) => {
    assert.match(html, new RegExp(`id=["']${id}["']`), `${id} missing from compare.html`);
  });
});

test("manifest and service worker use repository-relative paths", () => {
  const manifest = JSON.parse(read("manifest.webmanifest"));
  assert.equal(manifest.scope, "./");
  assert.match(manifest.start_url, /^\.\//);
  const sw = read("service-worker.js");
  assert.doesNotMatch(sw, /["']\/index\.html["']/);
});
