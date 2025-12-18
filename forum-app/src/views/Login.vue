<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body p-5">
          <h2 class="text-center mb-4">Connexion</h2>

          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin">
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
              >
            </div>

            <div class="mb-3 text-end">
              <a 
                href="#" 
                class="text-decoration-none" 
                @click.prevent="showResetModal = true"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <button 
              type="submit" 
              class="btn btn-primary w-100"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Se connecter
            </button>
          </form>

          <div class="text-center mt-3">
            <p>
              Pas encore de compte ? 
              <router-link to="/signup" class="text-decoration-none">
                S'inscrire
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de réinitialisation du mot de passe -->
    <div 
      v-if="showResetModal" 
      class="modal fade show d-block" 
      tabindex="-1"
      style="background-color: rgba(0,0,0,0.5);"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Réinitialiser le mot de passe</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="showResetModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="resetSuccess" class="alert alert-success">
              Un email de réinitialisation a été envoyé à votre adresse.
            </div>
            <div v-if="resetError" class="alert alert-danger">
              {{ resetError }}
            </div>
            <div class="mb-3">
              <label for="resetEmail" class="form-label">Email</label>
              <input 
                v-model="resetEmail" 
                type="email" 
                class="form-control" 
                id="resetEmail"
              >
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="showResetModal = false"
            >
              Fermer
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="handleResetPassword"
            >
              Envoyer
            </button>
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
  name: 'Login',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      email: '',
      password: ''
    })
    
    const loading = ref(false)
    const error = ref('')
    const showResetModal = ref(false)
    const resetEmail = ref('')
    const resetSuccess = ref(false)
    const resetError = ref('')

    const handleLogin = async () => {
      try {
        loading.value = true
        error.value = ''
        await authStore.login(form.value.email, form.value.password)
        router.push('/')
      } catch (err) {
        error.value = 'Email ou mot de passe incorrect.'
      } finally {
        loading.value = false
      }
    }

    const handleResetPassword = async () => {
      try {
        resetError.value = ''
        resetSuccess.value = false
        await authStore.resetPassword(resetEmail.value)
        resetSuccess.value = true
        resetEmail.value = ''
      } catch (err) {
        resetError.value = 'Erreur lors de l\'envoi de l\'email.'
      }
    }

    return {
      form,
      loading,
      error,
      showResetModal,
      resetEmail,
      resetSuccess,
      resetError,
      handleLogin,
      handleResetPassword
    }
  }
}
</script>