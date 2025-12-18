<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">
        <i class="bi bi-chat-dots-fill"></i> Forum Communautaire
      </router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-house-fill"></i> Accueil
            </router-link>
          </li>
          
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/create-discussion">
              <i class="bi bi-plus-circle-fill"></i> Nouvelle Discussion
            </router-link>
          </li>
          
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/profile">
              <i class="bi bi-person-fill"></i> Profil
            </router-link>
          </li>
          
          <li v-if="!authStore.isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/login">
              <i class="bi bi-box-arrow-in-right"></i> Connexion
            </router-link>
          </li>
          
          <li v-if="!authStore.isAuthenticated" class="nav-item">
            <router-link class="nav-link" to="/signup">
              <i class="bi bi-person-plus-fill"></i> Inscription
            </router-link>
          </li>
          
          <li v-if="authStore.isAuthenticated" class="nav-item">
            <a class="nav-link" href="#" @click.prevent="handleLogout">
              <i class="bi bi-box-arrow-right"></i> Déconnexion
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '@/store/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogout = async () => {
      try {
        await authStore.logout()
        router.push('/')
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      }
    }

    return {
      authStore,
      handleLogout
    }
  }
}
</script>

<style scoped>
.navbar-brand {
  font-size: 1.5rem;
}

.nav-link {
  transition: opacity 0.2s;
}

.nav-link:hover {
  opacity: 0.8;
}
</style>