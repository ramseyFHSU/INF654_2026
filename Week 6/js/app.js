if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("FieldSync service worker registered");
      console.log("Scope:", registration.scope);
    } catch (error) {
      console.error("Service worker registration failed!", error);
    }
  });
}
