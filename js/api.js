/* ======================================
   GITHUB API CONFIG
====================================== */
const GITHUB_API = "https://api.github.com/users";

/* OPTIONAL: Add token to avoid rate limits
   const TOKEN = "YOUR_GITHUB_TOKEN";
*/

const headers = {
  Accept: "application/vnd.github+json"
  // Authorization: `token ${TOKEN}`
};

/* ======================================
   MAIN DATA FETCHER
====================================== */
async function getFullProfile(username) {
  if (!username) {
    throw new Error("Username is required");
  }

  const userRes = await fetch(`${GITHUB_API}/${username}`, { headers });
  if (!userRes.ok) {
    throw new Error("GitHub user not found");
  }

  const user = await userRes.json();

  const reposRes = await fetch(
    `${GITHUB_API}/${username}/repos?per_page=100&sort=updated`,
    { headers }
  );
  const repos = reposRes.ok ? await reposRes.json() : [];

  const aiScore = calculateAIScore(user, repos);
  const insights = generateAIInsights(user, repos, aiScore);

  return {
    user,
    repos,
    aiScore,
    insights
  };
}

/* ======================================
   AI SCORE LOGIC (0–100)
====================================== */
function calculateAIScore(user, repos) {
  let score = 0;

  score += Math.min(user.followers * 0.4, 30);
  score += Math.min(user.public_repos * 0.5, 25);

  const stars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
  score += Math.min(stars * 0.2, 25);

  const accountAgeYears =
    (Date.now() - new Date(user.created_at)) /
    (1000 * 60 * 60 * 24 * 365);

  score += Math.min(accountAgeYears * 4, 20);

  return Math.round(Math.min(score, 100));
}

/* ======================================
   AI INSIGHTS TEXT
====================================== */
function generateAIInsights(user, repos, score) {
  let level = "Beginner";

  if (score > 75) level = "Advanced Developer";
  else if (score > 50) level = "Intermediate Developer";

  return `
${user.login} shows strong GitHub activity with ${user.public_repos} public repositories
and ${user.followers} followers.

The account has accumulated ${repos.reduce(
    (s, r) => s + r.stargazers_count,
    0
  )} total stars, indicating community interest.

Based on repository activity, popularity, and account maturity,
this profile reflects an **${level}** level developer.
  `;
}
