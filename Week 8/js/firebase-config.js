// Firebase project setup for FieldSync.
// Replace the placeholder values below with the configuration from
// Firebase Console -> Project settings -> Your apps -> Web app.

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
