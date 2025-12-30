import { defineStore } from 'pinia'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/config'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isModerator: (state) => state.userProfile?.role === 'moderator' || state.userProfile?.role === 'admin',
    isAdmin: (state) => state.userProfile?.role === 'admin'
  },

  actions: {
    async signup(email, password, displayName) {
      try {
        this.error = null
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName })
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email,
          displayName,
          photoURL: null,
          role: 'user',
          createdAt: new Date(),
          bio: ''
        })
        
        return userCredential.user
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async login(email, password) {
      try {
        this.error = null
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        return userCredential.user
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async logout() {
      try {
        await signOut(auth)
        this.user = null
        this.userProfile = null
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async resetPassword(email) {
      try {
        await sendPasswordResetEmail(auth, email)
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async updateUserProfile(updates) {
      try {
        if (this.user) {
          await updateDoc(doc(db, 'users', this.user.uid), updates)
          this.userProfile = { ...this.userProfile, ...updates }
        }
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async fetchUserProfile(uid) {
      try {
        const docRef = doc(db, 'users', uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          this.userProfile = docSnap.data()
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    },

    initAuthListener() {
      onAuthStateChanged(auth, async (user) => {
        this.user = user
        if (user) {
          await this.fetchUserProfile(user.uid)
        } else {
          this.userProfile = null
        }
        this.loading = false
      })
    }
  }
})