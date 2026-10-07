# FieldSync - Firebase CRUD Update

This project starts from the existing FieldSync PWA and adds Firebase Cloud Firestore CRUD operations without redesigning the application.

## What changed

- Kept the existing FieldSync PWA structure and Materialize UI.
- Kept the manifest, install prompt, service worker caching, dynamic caching, and offline fallback.
- Replaced the three hard-coded observation cards with Firestore records.
- Connected the existing Add Observation form to Firestore.
- Added Create, Read, Update, and Delete operations.
- Added real-time reading with `onSnapshot()`.
- Added Edit and Delete buttons to each observation card.
- Added `firebase-config.js` and `observations-service.js`.
- Bumped the service worker cache version to `v2` so the updated JavaScript is not hidden by the old cache.

## 1. Create the Firebase project

1. Open Firebase Console.
2. Create a project.
3. Register a Web app.
4. Create a Cloud Firestore database.

## 2. Add your Firebase configuration

Open:

`js/firebase-config.js`

Replace the placeholder values in `firebaseConfig` with the values Firebase gives you.

## 3. Firestore collection

The app uses this collection:

`observations`

A document contains:

- `title`
- `category`
- `location`
- `notes`
- `status`
- `createdAt`
- `updatedAt`

Firestore creates the collection automatically the first time a document is added.

## 4. Classroom Firestore rules

The included `firestore.rules` file contains open read/write access for the CRUD lesson only.

```text
allow read, write: if true;
```

Do not use this rule in a production application. Authentication and safer rules should be added in the next stage.

## 5. Run with a local web server

Do not double-click `index.html`. Run the project from a local development server so ES modules, the service worker, and Firebase work correctly.

Examples:

- VS Code Live Server
- `npx serve`
- another localhost server

## CRUD mapping

- Create -> `addDoc()`
- Read -> `onSnapshot()` (plus a `getDocs()` example in the service file)
- Update -> `updateDoc()`
- Delete -> `deleteDoc()`

## Important PWA note

This lesson stores data in Cloud Firestore, but it does not yet enable Firestore persistent offline storage. The service worker continues to cache application files, not Firestore database responses. Persistent offline Firestore data and sync behavior can be added in the next lesson.
