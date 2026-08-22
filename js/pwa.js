(function (global) {
  "use strict";

  let deferredInstallPrompt = null;
  let registration = null;

  function showInstallButton(show) {
    const button = document.getElementById("installBtn");
    if (button) button.classList.toggle("is-hidden", !show);
  }

  function updateConnectionUI() {
    const banner = document.getElementById("offlineBanner");
    if (banner) banner.classList.toggle("is-hidden", navigator.onLine);
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;
    try {
      registration = await navigator.serviceWorker.register("./service-worker.js", { scope: "./" });
      return registration;
    } catch (error) {
      console.warn("Service worker registration failed:", error);
      return null;
    }
  }

  async function installApp() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      showInstallButton(false);
      if (global.GHUI) GHUI.toast(choice.outcome === "accepted" ? "App installation started." : "Installation was dismissed.", choice.outcome === "accepted" ? "success" : "");
      return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const message = isIOS
      ? "On iPhone/iPad, open the Share menu in Safari and choose Add to Home Screen."
      : "Your browser will show an install option when the PWA install criteria are available.";
    if (global.GHUI) GHUI.toast(message, "", "Install app");
  }

  async function enableNotifications() {
    if (!("Notification" in global)) {
      if (global.GHUI) GHUI.toast("This browser does not support notifications.", "error");
      return;
    }
    if (!global.isSecureContext) {
      if (global.GHUI) GHUI.toast("Notifications require HTTPS or localhost.", "error");
      return;
    }

    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") {
      if (global.GHUI) GHUI.toast("Notification permission was not granted.", "");
      return;
    }

    const sw = registration || ("serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => null) : null);
    const options = {
      body: "Notifications are enabled for GitHub Profile Analyzer.",
      icon: "./assets/icons/icon-192.png",
      badge: "./assets/icons/icon-192.png",
      tag: "ghpa-notifications-enabled",
      data: { url: "./index.html" }
    };

    try {
      if (sw && sw.showNotification) await sw.showNotification("GitHub Analyzer", options);
      else new Notification("GitHub Analyzer", options);
      if (global.GHUI) GHUI.toast("Notifications are enabled. Remote push delivery would require a push backend.", "success");
    } catch (error) {
      if (global.GHUI) GHUI.toast("Notification permission is enabled, but the confirmation notification could not be shown.", "error");
    }
  }

  function bindUI() {
    const install = document.getElementById("installBtn");
    const notify = document.getElementById("notifyBtn");
    if (install) install.addEventListener("click", installApp);
    if (notify) notify.addEventListener("click", enableNotifications);
  }

  function init() {
    updateConnectionUI();
    bindUI();
    registerServiceWorker();

    global.addEventListener("online", () => {
      updateConnectionUI();
      if (global.GHUI) GHUI.toast("Connection restored.", "success");
    });
    global.addEventListener("offline", updateConnectionUI);

    global.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      showInstallButton(true);
    });
    global.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      showInstallButton(false);
      if (global.GHUI) GHUI.toast("GitHub Analyzer was installed successfully.", "success");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  global.GHPWA = { installApp, enableNotifications, updateConnectionUI };
})(window);
