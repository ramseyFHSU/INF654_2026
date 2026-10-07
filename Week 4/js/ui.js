// FieldSync user interface setup
// This file only initializes Materialize components.
// PWA features and data storage will be added later.

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the mobile navigation menu.
  const mobileMenu = document.querySelector("#mobile-menu");

  M.Sidenav.init(mobileMenu, {
    edge: "right",
  });

  // Initialize the Add Observation side form.
  const observationForm = document.querySelector("#observation-form");

  M.Sidenav.init(observationForm, {
    edge: "left",
  });

  // Initialize Materialize select fields.
  const selectFields = document.querySelectorAll("select");
  M.FormSelect.init(selectFields);

  // Demo form behavior.
  // We are not storing observations yet.
  const addObservationForm = document.querySelector("#add-observation-form");

  addObservationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    M.toast({
      html: "Observation form is ready. We will store data in a later lesson.",
    });
  });
});
