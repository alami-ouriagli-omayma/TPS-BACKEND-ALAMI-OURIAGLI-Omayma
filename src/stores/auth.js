import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const router = useRouter()

  // Vérifier si l'email est universitaire
  const isUniversityEmail = (email) => {
    return email.endsWith('@ensa-safi.ac.ma') || email.endsWith('@ensasafi.ac.ma')
  }

  // Inscription
  const register = async (email, password) => {
    error.value = null
    
    if (!isUniversityEmail(email)) {
      error.value = 'Vous devez utiliser une adresse email universitaire (@ensa-safi.ac.ma)'
      throw new Error(error.value)
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      router.push('/')
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          error.value = 'Cette adresse email est déjà utilisée'
          break
        case 'auth/weak-password':
          error.value = 'Le mot de passe doit contenir au moins 6 caractères'
          break
        case 'auth/invalid-email':
          error.value = 'Adresse email invalide'
          break
        default:
          error.value = 'Erreur lors de l\'inscription'
      }
      throw err
    }
  }

  // Connexion
  const login = async (email, password) => {
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      user.value = userCredential.user
      router.push('/')
    } catch (err) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          error.value = 'Email ou mot de passe incorrect'
          break
        case 'auth/invalid-email':
          error.value = 'Adresse email invalide'
          break
        default:
          error.value = 'Erreur lors de la connexion'
      }
      throw err
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null
      router.push('/login')
    } catch (err) {
      error.value = 'Erreur lors de la déconnexion'
      throw err
    }
  }

  // Observer les changements d'authentification
  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      loading.value = false
    })
  }

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    initAuth
  }
})