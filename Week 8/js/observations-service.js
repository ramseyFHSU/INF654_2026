// Firestore CRUD functions for FieldSync observations.

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { db } from "./firebase-config.js";

const observationsRef = collection(db, "observations");

// CREATE
export async function createObservation(formData) {
  const observation = {
    title: formData.title.trim(),
    category: formData.category,
    location: formData.location.trim(),
    notes: formData.description.trim(),
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  return addDoc(observationsRef, observation);
}

// READ - one-time read example.
export async function loadObservationsOnce() {
  const q = query(observationsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

// READ - real-time listener used by the app.
export function watchObservations(onData, onError) {
  const q = query(observationsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const observations = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      onData(observations);
    },
    onError,
  );
}

// UPDATE
export async function updateObservation(id, changes) {
  const observationRef = doc(db, "observations", id);

  return updateDoc(observationRef, {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

// DELETE
export async function deleteObservation(id) {
  const observationRef = doc(db, "observations", id);
  return deleteDoc(observationRef);
}
