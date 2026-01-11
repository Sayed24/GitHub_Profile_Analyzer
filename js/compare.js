/* =========================================================
   ELEMENTS
========================================================= */

const userAInput = document.getElementById("userA");
const userBInput = document.getElementById("userB");
const compareBtn = document.getElementById("compareBtn");
const errorEl = document.getElementById("compareError");

const profileAEl = document.getElementById("profileA");
const profileBEl = document.getElementById("profileB");
const statsAEl = document.getElementById("statsA");
const statsBEl = document.getElementById("statsB");
const winnerEl = document.getElementById("winnerCard");

let compareChart = null;

/* =========================================================
   EVENTS
========================================================= */

compareBtn.addEventListener("click", () => {
  startComparison(
    userAInput.value.trim(),
    userBInput.value.trim()
  );
});

/* =========================================================
   MAIN LOGIC
========================================================= */

async function startComparison(userA, userB) {
  errorEl.textContent = "";
  profileAEl.innerHTML = "";
  profileBEl.innerHTML = "";
  statsAEl.innerHTML = "";
  statsBEl.innerHTML = "";
  winnerEl.innerHTML = "<h3>🏆 Comparison Result</h3>";

  if (!userA || !userB) {
    errorEl.textContent = "Please enter both usernames.";
    return;
  }

  try {
    const [profileA, profileB] = await Promise.all([
      api.getUserProfile(userA),
      api.getUserProfile(userB)
    ]);

    const [reposA, reposB] = await Promise.all([
      api.getUserRepos(userA),
      api.getUserRepos(userB)
    ]);

    renderSideProfile(profileA, profileAEl);
    renderSideProfile(profileB, profileBEl);

    const statsA = api.calculateRepoStats(reposA);
    const statsB = api.calculateRepoStats(reposB);

    const scoreA = api.calculateActivityScore(profileA, reposA);
    const scoreB = api.calculateActivityScore(profileB, reposB);

    renderCompareStats(statsAEl, profileA, statsA, scoreA);
    renderCompareStats(statsBEl, profileB, statsB, scoreB);

    renderCompareChart(
      api.calculateLanguages(reposA),
      api.calculateLanguages(reposB),
      profileA.login,
      profileB.login
    );

    determineWinner(profileA, profileB, scoreA, scoreB);
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

/* =========================================================
   PROFILE CARD
========================================================= */

function renderSideProfile(profile, container) {
  container.innerHTML = `
    <div class="profile-header">
      <img src="${profile.avatar_url}" alt="Avatar" />
      <div>
        <h3>${profile.name || profile.login}</h3>
        <p class="muted">@${profile.login}</p>
      </div>
    </div>
  `;
}

/* =========================================================
   STATS
========================================================= */

function renderCompareStats(el, profile, stats, score) {
  el.innerHTML = "";

  const data = [
    ["Followers", profile.followers],
    ["Repos", stats.totalRepos],
    ["Stars", stats.totalStars],
    ["Forks", stats.totalForks],
    ["Activity", score]
  ];

  data.forEach(([label, value]) => {
    const div = document.createElement("div");
    div.className = "stat";
    div.innerHTML = `<h4>${label}</h4><span>${value}</span>`;
    el.appendChild(div);
  });
}

/* =========================================================
   LANGUAGE COMPARISON CHART
========================================================= */

function renderCompareChart(langA, langB, labelA, labelB) {
  const ctx = document.getElementById("compareChart");

  if (compareChart) compareChart.destroy();

  const labels = Array.from(
    new Set([...Object.keys(langA), ...Object.keys(langB)])
  );

  compareChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: labelA,
          data: labels.map(l => langA[l] || 0),
          backgroundColor: "#58a6ff"
        },
        {
          label: labelB,
          data: labels.map(l => langB[l] || 0),
          backgroundColor: "#7ee787"
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#c9d1d9" }
        }
      },
      scales: {
        x: { ticks: { color: "#8b949e" } },
        y: { ticks: { color: "#8b949e" } }
      }
    }
  });
}

/* =========================================================
   WINNER LOGIC
========================================================= */

function determineWinner(pA, pB, scoreA, scoreB) {
  let winner = "It's a tie!";

  if (scoreA > scoreB) winner = `${pA.login} wins 🏆`;
  else if (scoreB > scoreA) winner = `${pB.login} wins 🏆`;

  winnerEl.innerHTML += `<p>${winner}</p>`;
}
