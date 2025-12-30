// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";          // ← indispensable
import { getFirestore } from "firebase/firestore"; // ← indispensable

const firebaseConfig = {
  apiKey: "AIzaSyC7xfnTXSvk4Bpsjp5sViQfcMq6UBwEzAI",           // ← remplace par ta config
  authDomain: "voting-app-9494b.firebaseapp.com",
  projectId: "voting-app-9494b",
  storageBucket: "ensa-vote.appspot.com",
  messagingSenderId: "618845159254",
  appId: "1:618845159254:web:82f33d74650d600999a0f7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);      // ← export nommé 'auth'
export const db = getFirestore(app);   // ← export nommé 'db'


