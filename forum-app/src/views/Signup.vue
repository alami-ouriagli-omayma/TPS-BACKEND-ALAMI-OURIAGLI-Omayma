<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body p-5">
          <h2 class="text-center mb-4">Inscription</h2>

          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form @submit.prevent="handleSignup">
            <div class="mb-3">
              <label for="displayName" class="form-label">Nom d'utilisateur</label>
              <input 
                v-model="form.displayName" 
                type="text" 
                class="form-control" 
                id="displayName"
                required
                minlength="3"
              >
              <small class="text-muted">Minimum 3 caractères</small>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input 
                v-model="form.email" 
                type="email" 
                class="form-control" 
                id="email"
                required
              >
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Mot de passe</label>
              <input 
                v-model="form.password" 
                type="password" 
                class="form-control" 
                id="password"
                required
                minlength="6"
              >
              <small class="text-muted">Minimum 6 caractères</small>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
              <input 
                v-model="form.confirmPassword" 
                type="password" 
                class="form-control" 
                id="confirmPassword"
                required
              >
            </div>

            <div class="mb-3 form-check">
              <input 
                v-model="form.acceptTerms" 
                type="checkbox" 
                class="form-check-input" 
                id="acceptTerms"
                required
              >
              <label class="form-check-label" for="acceptTerms">
                J'accepte les conditions d'utilisation
              </label>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-100"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              S'inscrire
            </button>
          </form>

          <div class="text-center mt-3">
            <p>
              Déjà un compte ? 
              <router-link to="/login" class="text-decoration-none">
                Se connecter
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Signup',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    })
    
    const loading = ref(false)
    const error = ref('')

    const handleSignup = async () => {
      try {
        loading.value = true
        error.value = ''

        if (form.value.password !== form.value.confirmPassword) {
          error.value = 'Les mots de passe ne correspondent pas.'
          return
        }

        if (!form.value.acceptTerms) {
          error.value = 'Vous devez accepter les conditions d\'utilisation.'
          return
        }

        await authStore.signup(
          form.value.email,
          form.value.password,
          form.value.displayName
        )
        
        router.push('/')
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          error.value = 'Cet email est déjà utilisé.'
        } else if (err.code === 'auth/weak-password') {
          error.value = 'Le mot de passe est trop faible.'
        } else {
          error.value = 'Une erreur est survenue lors de l\'inscription.'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleSignup
    }
  }
}
</script>