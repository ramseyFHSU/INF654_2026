// FieldSync PWA setup: service worker registration and install UI.

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("FieldSync service worker scope:", registration.scope);
    } catch (error) {
      console.error("FieldSync service worker registration failed:", error);
    }
  });
}

let installPrompt = null;
const installButton = document.querySelector("#installApp");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPrompt = event;

  if (installButton) {
    installButton.hidden = false;
  }
});

if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    console.log("Install choice:", result.outcome);

    installPrompt = null;
    installButton.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  installPrompt = null;
  if (installButton) installButton.hidden = true;
  console.log("FieldSync was installed.");
});
