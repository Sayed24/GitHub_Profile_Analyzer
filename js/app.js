/* ======================================
   APP ENTRY POINT
====================================== */
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

/* ======================================
   GLOBAL STATE
====================================== */
let currentUser = null;
let compareUser = null;

/* ======================================
   INIT
====================================== */
function initApp() {
  bindUIEvents();
  handleRouting();
}

/* ======================================
   UI EVENTS
====================================== */
function bindUIEvents() {
  const searchForm = document.getElementById("search-form");
  const compareBtn = document.getElementById("compare-btn");
  const logo = document.getElementById("logo");

  if (searchForm) {
    searchForm.addEventListener("submit", e => {
      e.preventDefault();
      const username = document.getElementById("username-input").value.trim();
      if (!username) return;
      navigateToProfile(username);
    });
  }

  if (compareBtn) {
    compareBtn.addEventListener("click", () => {
      const secondUser = prompt("Enter second GitHub username");
      if (!secondUser) return;
      navigateToCompare(currentUser, secondUser);
    });
  }

  /* CLICKABLE LOGO → DASHBOARD RESET */
  if (logo) {
    logo.addEventListener("click", () => {
      window.history.pushState({}, "", "/");
      resetDashboard();
    });
  }

  /* BROWSER NAV */
  window.addEventListener("popstate", handleRouting);
}

/* ======================================
   ROUTING
====================================== */
function handleRouting() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("user") && params.has("compare")) {
    loadComparison(
      params.get("user"),
      params.get("compare")
    );
    return;
  }

  if (params.has("user")) {
    loadProfile(params.get("user"));
    return;
  }

  resetDashboard();
}

/* ======================================
   NAVIGATION HELPERS
====================================== */
function navigateToProfile(username) {
  window.history.pushState({}, "", `?user=${username}`);
  loadProfile(username);
}

function navigateToCompare(userA, userB) {
  window.history.pushState(
    {},
    "",
    `?user=${userA}&compare=${userB}`
  );
  loadComparison(userA, userB);
}

/* ======================================
   LOAD PROFILE
====================================== */
async function loadProfile(username) {
  try {
    showLoader();
    currentUser = username;

    const data = await getFullProfile(username);
    renderProfile(data);
  } catch (err) {
    renderError(err.message || "Failed to load profile");
  }
}

/* ======================================
   LOAD COMPARISON
====================================== */
async function loadComparison(userA, userB) {
  try {
    showLoader();

    const [left, right] = await Promise.all([
      getFullProfile(userA),
      getFullProfile(userB)
    ]);

    renderComparison(left, right);
  } catch (err) {
    renderError("Comparison failed");
  }
}

/* ======================================
   RESET DASHBOARD
====================================== */
function resetDashboard() {
  clearApp();

  const welcome = document.createElement("section");
  welcome.className = "welcome";

  welcome.innerHTML = `
    <h2>GitHub Profile Analyzer</h2>
    <p>Search a GitHub username to analyze profile insights, repos, activity & AI score.</p>
  `;

  app.appendChild(welcome);
}
