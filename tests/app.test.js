/* =========================================================
   GITHUB ANALYZER — BASIC TESTS
========================================================= */

describe("GitHub Analyzer — API Utilities", () => {

  test("calculateLanguages aggregates correctly", () => {
    const repos = [
      { language: "JavaScript" },
      { language: "JavaScript" },
      { language: "Python" },
      { language: null }
    ];

    const result = api.calculateLanguages(repos);

    expect(result).toEqual({
      JavaScript: 2,
      Python: 1
    });
  });

  test("calculateRepoStats totals stars and forks", () => {
    const repos = [
      { stargazers_count: 5, forks_count: 2 },
      { stargazers_count: 3, forks_count: 1 }
    ];

    const stats = api.calculateRepoStats(repos);

    expect(stats.totalRepos).toBe(2);
    expect(stats.totalStars).toBe(8);
    expect(stats.totalForks).toBe(3);
  });

  test("calculateActivityScore returns a number", () => {
    const profile = {
      created_at: "2019-01-01T00:00:00Z",
      followers: 10
    };

    const repos = new Array(10).fill({});

    const score = api.calculateActivityScore(profile, repos);

    expect(typeof score).toBe("number");
    expect(score).toBeGreaterThan(0);
  });

});
