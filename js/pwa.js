/* =========================================================
   SERVICE WORKER REGISTRATION
========================================================= */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(reg => {
        console.log("Service Worker registered:", reg.scope);
      })
      .catch(err => {
        console.error("Service Worker registration failed:", err);
      });
  });
}

/* =========================================================
   PWA INSTALL PROMPT
========================================================= */

let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("PWA installed");
  }

  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

/* =========================================================
   PUSH NOTIFICATIONS
========================================================= */

window.enablePushNotifications = async function () {
  if (!("Notification" in window)) {
    alert("Notifications not supported");
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    new Notification("GitHub Analyzer", {
      body: "Push notifications enabled!",
      icon: "assets/icons/icon-192.png"
    });
  }
};

/* =========================================================
   OFFLINE UX ENHANCEMENTS
========================================================= */

window.addEventListener("offline", () => {
  console.warn("App is offline");
});

window.addEventListener("online", () => {
  console.info("App is online");
});

/* =========================================================
   CACHE STRATEGY INFO (DEBUG)
========================================================= */

if (navigator.serviceWorker?.controller) {
  navigator.serviceWorker.addEventListener("message", event => {
    console.log("SW Message:", event.data);
  });
}
