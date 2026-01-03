const BASE_URL = "https://api.github.com/users/";

export async function fetchUser(username) {
  const res = await fetch(`${BASE_URL}${username}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

export async function fetchRepos(username) {
  const res = await fetch(`${BASE_URL}${username}/repos?per_page=100`);
  return res.json();
}

