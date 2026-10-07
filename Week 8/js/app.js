// FieldSync PWA + Firebase CRUD.
// This continues the earlier service worker/install code and adds Firestore CRUD.

import {
  createObservation,
  watchObservations,
  updateObservation,
  deleteObservation,
} from "./observations-service.js";

//service worker registration
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

// PWA:install button
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

//Firebase CRUD UI
const form = document.querySelector("#add-observation-form");
const list = document.querySelector("#observations-list");
const statusMessage = document.querySelector("#observation-status");
const countBadge = document.querySelector("#observation-count");
const formTitle = document.querySelector("#form-title");
const saveButton = document.querySelector("#save-observation");
const cancelEditButton = document.querySelector("#cancel-edit");
const observationFormPanel = document.querySelector("#observation-form");

let editingObservationId = null;
let currentObservations = [];

function showToast(message) {
  if (typeof M !== "undefined") {
    M.toast({ html: message });
  } else {
    console.log(message);
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryDetails(category) {
  const categories = {
    plant: {
      icon: "eco",
      iconClass: "green-text text-darken-2",
      labelClass: "green-text text-darken-3",
      label: "PLANT",
    },
    water: {
      icon: "water_drop",
      iconClass: "blue-text text-darken-2",
      labelClass: "blue-text text-darken-3",
      label: "WATER",
    },
    wildlife: {
      icon: "flutter_dash",
      iconClass: "amber-text text-darken-3",
      labelClass: "amber-text text-darken-4",
      label: "WILDLIFE",
    },
    trail: {
      icon: "terrain",
      iconClass: "brown-text text-darken-2",
      labelClass: "brown-text text-darken-3",
      label: "TRAIL",
    },
    other: {
      icon: "place",
      iconClass: "grey-text text-darken-2",
      labelClass: "grey-text text-darken-3",
      label: "OTHER",
    },
  };

  return categories[category] || categories.other;
}

function formatTimestamp(timestamp) {
  if (!timestamp || typeof timestamp.toDate !== "function") {
    return "Saving...";
  }

  return timestamp.toDate().toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderObservations(observations) {
  currentObservations = observations;

  if (!list || !statusMessage) return;

  list.innerHTML = "";
  countBadge.textContent = observations.length;

  if (observations.length === 0) {
    statusMessage.textContent = "No observations yet. Add the first one.";
    statusMessage.hidden = false;
    return;
  }

  statusMessage.hidden = true;

  observations.forEach((item) => {
    const category = categoryDetails(item.category);

    list.insertAdjacentHTML(
      "beforeend",
      `
        <article class="card-panel white observation-card">
          <div class="row valign-wrapper no-margin-bottom">
            <div class="col s3 m2 center-align">
              <i class="material-icons medium ${category.iconClass}">${category.icon}</i>
            </div>

            <div class="col s7 m8">
              <span class="${category.labelClass}"><strong>${category.label}</strong></span>
              <h5 class="black-text">${escapeHtml(item.title)}</h5>
              <p class="grey-text text-darken-1">${escapeHtml(item.notes || "")}</p>
              <p class="grey-text">
                <i class="material-icons tiny">place</i>
                ${escapeHtml(item.location || "No location")} &nbsp; | &nbsp;
                ${escapeHtml(formatTimestamp(item.createdAt))}
              </p>
            </div>

            <div class="col s2 m2 right-align">
              <button
                class="btn-flat edit-btn"
                type="button"
                data-id="${item.id}"
                aria-label="Edit ${escapeHtml(item.title)} observation"
              >
                <i class="material-icons blue-text text-darken-1">edit</i>
              </button>

              <button
                class="btn-flat delete-btn"
                type="button"
                data-id="${item.id}"
                aria-label="Delete ${escapeHtml(item.title)} observation"
              >
                <i class="material-icons grey-text text-darken-1">delete_outline</i>
              </button>
            </div>
          </div>
        </article>
      `,
    );
  });
}

function resetFormToCreateMode() {
  editingObservationId = null;

  if (!form) return;

  form.reset();
  formTitle.textContent = "Add New Observation";
  saveButton.innerHTML =
    'Add Observation <i class="material-icons right">save</i>';
  cancelEditButton.hidden = true;

  if (typeof M !== "undefined") {
    M.updateTextFields();

    const categorySelect = form.querySelector("#category");
    const selectInstance = M.FormSelect.getInstance(categorySelect);
    if (selectInstance) selectInstance.destroy();
    M.FormSelect.init(categorySelect);
  }
}

function startEdit(id) {
  const observation = currentObservations.find((item) => item.id === id);
  if (!observation || !form) return;

  editingObservationId = id;

  form.querySelector("#title").value = observation.title || "";
  form.querySelector("#category").value = observation.category || "";
  form.querySelector("#location").value = observation.location || "";
  form.querySelector("#description").value = observation.notes || "";

  formTitle.textContent = "Edit Observation";
  saveButton.innerHTML =
    'Save Changes <i class="material-icons right">save</i>';
  cancelEditButton.hidden = false;

  if (typeof M !== "undefined") {
    M.updateTextFields();
    M.textareaAutoResize(form.querySelector("#description"));
    const categorySelect = form.querySelector("#category");
    const selectInstance = M.FormSelect.getInstance(categorySelect);
    if (selectInstance) selectInstance.destroy();
    M.FormSelect.init(categorySelect);
    const panel = M.Sidenav.getInstance(observationFormPanel);
    if (panel) panel.open();
  }
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      title: form.querySelector("#title").value,
      category: form.querySelector("#category").value,
      location: form.querySelector("#location").value,
      notes: form.querySelector("#description").value,
    };

    try {
      saveButton.disabled = true;

      if (editingObservationId) {
        await updateObservation(editingObservationId, {
          title: formData.title.trim(),
          category: formData.category,
          location: formData.location.trim(),
          notes: formData.notes.trim(),
        });

        showToast("Observation updated in Firebase.");
      } else {
        await createObservation(formData);

        showToast("Observation saved to Firebase.");
      }

      resetFormToCreateMode();

      if (typeof M !== "undefined") {
        const panel = M.Sidenav.getInstance(observationFormPanel);

        if (panel) panel.close();
      }
    } catch (error) {
      console.error("Could not save observation:", error);

      showToast(
        "Could not save the observation. Check Firebase setup and rules.",
      );
    } finally {
      saveButton.disabled = false;
    }
  });
}

if (cancelEditButton) {
  cancelEditButton.addEventListener("click", () => {
    resetFormToCreateMode();
  });
}

if (list) {
  list.addEventListener("click", async (event) => {
    const editButton = event.target.closest(".edit-btn");
    if (editButton) {
      startEdit(editButton.dataset.id);
      return;
    }

    const deleteButton = event.target.closest(".delete-btn");
    if (!deleteButton) return;

    const id = deleteButton.dataset.id;
    const observation = currentObservations.find((item) => item.id === id);
    const title = observation?.title || "this observation";

    if (!window.confirm(`Delete ${title}?`)) return;

    try {
      deleteButton.disabled = true;
      await deleteObservation(id);
      showToast("Observation deleted from Firebase.");
    } catch (error) {
      console.error("Could not delete observation:", error);
      showToast("Could not delete the observation.");
      deleteButton.disabled = false;
    }
  });
}

//keep the UI synchronized with Firestore in real time.
watchObservations(
  (observations) => {
    renderObservations(observations);
  },
  (error) => {
    console.error("Could not load observations:", error);
    if (statusMessage) {
      statusMessage.hidden = false;
      statusMessage.textContent =
        "Could not load observations. Check the Firebase configuration and Firestore rules.";
    }
  },
);
