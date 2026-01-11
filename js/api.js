/* ===============================
   API CONFIG
================================ */
const GITHUB_API = "https://api.github.com/users";

/* ===============================
   GLOBAL HELPERS
================================ */
async function safeFetch(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`GitHub API Error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/* ===============================
   USER PROFILE
================================ */
async function fetchUser(username) {
  return await safeFetch(`${GITHUB_API}/${username}`);
}

/* ===============================
   USER REPOSITORIES
================================ */
async function fetchRepos(username) {
  return await safeFetch(`${GITHUB_API}/${username}/repos?per_page=100`);
}

/* ===============================
   AI SCORING ENGINE
   (Expandable – deterministic)
================================ */
function calculateAIScore(user, repos) {
  let score = 0;

  score += Math.min(user.followers * 0.4, 30);
  score += Math.min(user.public_repos * 0.8, 25);

  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  score += Math.min(totalStars * 0.2, 25);

  if (user.bio) score += 5;
  if (user.blog) score += 5;
  if (user.twitter_username) score += 5;

  return Math.round(Math.min(score, 100));
}

/* ===============================
   AI INSIGHT GENERATOR
================================ */
function generateAIInsights(user, repos) {
  const insights = [];

  if (user.followers > 1000)
    insights.push("Strong community influence with high follower count.");

  if (user.public_repos > 20)
    insights.push("Highly active developer with many repositories.");

  const forked = repos.filter(r => r.fork).length;
  if (forked > repos.length / 2)
    insights.push("Most projects are forks — originality could improve.");

  const stars = repos.reduce((s, r) => s + r.stargazers_count, 0);
  if (stars > 500)
    insights.push("Projects receive solid community appreciation.");

  if (!user.bio)
    insights.push("Adding a bio would strengthen your profile.");

  if (!insights.length)
    insights.push("Balanced profile with steady activity.");

  return insights.join(" ");
}

/* ===============================
   FULL PROFILE LOAD
================================ */
async function loadFullProfile(username) {
  const [user, repos] = await Promise.all([
    fetchUser(username),
    fetchRepos(username),
  ]);

  const aiScore = calculateAIScore(user, repos);
  const insights = generateAIInsights(user, repos);

  return {
    user,
    repos,
    aiScore,
    insights,
  };
}

/* ===============================
   COMPARISON LOGIC
================================ */
async function compareUsers(userA, userB) {
  const [a, b] = await Promise.all([
    loadFullProfile(userA),
    loadFullProfile(userB),
  ]);

  return {
    left: a,
    right: b,
  };
}
