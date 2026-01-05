async function compareUsers(user1, user2) {
  const container = document.getElementById("comparison");
  container.innerHTML = "<p>Loading comparison...</p>";

  try {
    const [u1, r1, u2, r2] = await Promise.all([
      fetchUser(user1),
      fetchRepos(user1),
      fetchUser(user2),
      fetchRepos(user2)
    ]);

    container.innerHTML = `
      <div class="compare-grid">
        ${renderCompareCard(u1, r1)}
        ${renderCompareCard(u2, r2)}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

function renderCompareCard(user, repos) {
  const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

  return `
    <div class="card">
      <img src="${user.avatar_url}" />
      <h3>${user.login}</h3>
      <p>Repos: <strong>${repos.length}</strong></p>
      <p>Stars: <strong>${stars}</strong></p>
      <p>Followers: <strong>${user.followers}</strong></p>
    </div>
  `;
}
