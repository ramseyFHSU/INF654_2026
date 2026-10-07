// FieldSync user-interface setup.
// This file initializes Materialize components only.
// Firebase CRUD logic lives in app.js.

document.addEventListener("DOMContentLoaded", () => {
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
});
