export function renderProfile(user) {
  document.getElementById("profile").innerHTML = `
    <div class="card">
      <img src="${user.avatar_url}" width="80"/>
      <h2>${user.name || ""}</h2>
      <p>@${user.login}</p>
      <p>${user.bio || ""}</p>
    </div>
  `;
}

export function renderRepos(repos) {
  const recent = repos.slice(0, 5);
  document.getElementById("repos").innerHTML = recent.map(repo => `
    <div class="card">
      <h3>${repo.name}</h3>
      <p>${repo.description || ""}</p>
      ⭐ ${repo.stargazers_count}
    </div>
  `).join("");
}

