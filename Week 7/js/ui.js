// FieldSync user-interface setup.
// Observation persistence is intentionally NOT implemented yet.

document.addEventListener("DOMContentLoaded", () => {
  // Materialize is loaded from a CDN in this teaching project.
  // If it is unavailable, keep the page readable instead of throwing errors.
  if (typeof M === "undefined") {
    console.warn("Materialize did not load. Basic HTML is still available.");
    return;
  }

  const mobileMenu = document.querySelector("#mobile-menu");
  if (mobileMenu) {
    M.Sidenav.init(mobileMenu, { edge: "right" });
  }

  const observationForm = document.querySelector("#observation-form");
  if (observationForm) {
    M.Sidenav.init(observationForm, { edge: "left" });
  }

  const selectFields = document.querySelectorAll("select");
  if (selectFields.length > 0) {
    M.FormSelect.init(selectFields);
  }

  const addObservationForm = document.querySelector("#add-observation-form");
  if (addObservationForm) {
    addObservationForm.addEventListener("submit", (event) => {
      event.preventDefault();

      M.toast({
        html: "The form works. IndexedDB/offline observation storage comes next.",
      });
    });
  }
});
