
// src/firebase.ts
import {initializeApp,getApps,getApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDlQb7bV2Aq8S1BpJMCe5-HmrsH815qF4g",
  authDomain: "coursematch-1cd8d.firebaseapp.com",
  projectId: "coursematch-1cd8d",
  storageBucket: "coursematch-1cd8d.firebasestorage.app",
  messagingSenderId: "169771640294",
  appId: "1:169771640294:web:7c8be62b2bda735a54e227",
  measurementId: "G-CYYT3LSWCS"
};

// Only initialize the app once (avoid the "duplicate app" error).
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Export whatever Firebase services you need:
export const auth = getAuth(app);
export const db=getFirestore(app);
// export const db = getFirestore(app); // if using Firestore
// export const analytics = getAnalytics(app); // etc.