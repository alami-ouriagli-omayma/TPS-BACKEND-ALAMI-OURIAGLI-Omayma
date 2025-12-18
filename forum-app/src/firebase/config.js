import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// COLLEZ ICI VOTRE CONFIGURATION FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBkWywak8hj8N-8HBOKOfrpKH_kdnxQun4",
  authDomain: "forum-vue-app.firebaseapp.com",
  projectId: "forum-vue-app",
  storageBucket: "forum-vue-app.firebasestorage.app",
  messagingSenderId: "447735466836",
  appId: "1:447735466836:web:d7ac5d10bea14c474756c1"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
