/* ===========================
   PWA INSTALL HANDLER
=========================== */

let deferredPrompt = null;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  if (installBtn) {
    installBtn.classList.remove("hidden");

    installBtn.addEventListener("click", async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      installBtn.classList.add("hidden");
      console.log("PWA install:", outcome);
    });
  }
});

/* ===========================
   ONLINE / OFFLINE UX
=========================== */

const offlineBanner = document.getElementById("offlineBanner");

function updateConnectionStatus() {
  if (!navigator.onLine) {
    offlineBanner?.classList.remove("hidden");
  } else {
    offlineBanner?.classList.add("hidden");
  }
}

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
updateConnectionStatus();

/* ===========================
   SERVICE WORKER REGISTRATION
=========================== */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.error("SW registration failed:", err));
  });
}

/* ===========================
   PUSH NOTIFICATIONS (READY)
=========================== */

async function enablePushNotifications() {
  if (!("Notification" in window)) return alert("Notifications not supported");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification("GitHub Analyzer", {
      body: "Push notifications enabled!",
      icon: "assets/icons/icon-192.png",
      badge: "assets/icons/icon-96.png"
    });
  });
}

/* ===========================
   EXPORT FOR UI
=========================== */
window.enablePushNotifications = enablePushNotifications;
