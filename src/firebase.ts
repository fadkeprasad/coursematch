// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDlQb7bV2Aq8S1BpJMCe5-HmrsH815qF4g",
  authDomain: "coursematch-1cd8d.firebaseapp.com",
  projectId: "coursematch-1cd8d",
  storageBucket: "coursematch-1cd8d.firebasestorage.app",
  messagingSenderId: "169771640294",
  appId: "1:169771640294:web:7c8be62b2bda735a54e227",
  measurementId: "G-CYYT3LSWCS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
