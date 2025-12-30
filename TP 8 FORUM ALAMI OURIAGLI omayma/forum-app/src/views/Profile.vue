<template>
  <div class="row">
    <div class="col-md-4">
      <div class="card shadow">
        <div class="card-body text-center">
          <div class="avatar bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" 
               style="width: 100px; height: 100px; font-size: 2rem;">
            {{ getInitials(authStore.userProfile?.displayName) }}
          </div>
          <h4>{{ authStore.userProfile?.displayName }}</h4>
          <p class="text-muted">{{ authStore.userProfile?.email }}</p>
          <span v-if="authStore.userProfile?.role === 'moderator'" class="badge bg-warning">
            Modérateur
          </span>
          <span v-if="authStore.userProfile?.role === 'admin'" class="badge bg-danger">
            Administrateur
          </span>
          <hr>
          <p class="text-muted small">
            Membre depuis {{ formatDate(authStore.userProfile?.createdAt) }}
          </p>
        </div>
      </div>
    </div>

    <div class="col-md-8">
      <div class="card shadow mb-3">
        <div class="card-header">
          <h5 class="mb-0">Modifier le profil</h5>
        </div>
        <div class="card-body">
          <div v-if="success" class="alert alert-success">
            Profil mis à jour avec succès !
          </div>
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form @submit.prevent="updateProfile">
            <div class="mb-3">
              <label for="displayName" class="form-label">Nom d'utilisateur</label>
              <input 
                v-model="form.displayName" 
                type="text" 
                class="form-control" 
                id="displayName"
              >
            </div>

            <div class="mb-3">
              <label for="bio" class="form-label">Biographie</label>
              <textarea 
                v-model="form.bio" 
                class="form-control" 
                id="bio"
                rows="4"
                maxlength="500"
              ></textarea>
              <small class="text-muted">{{ form.bio?.length || 0 }}/500 caractères</small>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Enregistrer
            </button>
          </form>
        </div>
      </div>

      <div class="card shadow">
        <div class="card-header">
          <h5 class="mb-0">Mes discussions</h5>
        </div>
        <div class="card-body">
          <div v-if="loadingDiscussions" class="text-center py-3">
            <div class="spinner-border spinner-border-sm"></div>
          </div>
          <div v-else-if="userDiscussions.length === 0" class="text-center text-muted py-3">
            Vous n'avez créé aucune discussion.
          </div>
          <div v-else class="list-group">
            <router-link 
              v-for="discussion in userDiscussions" 
              :key="discussion.id"
              :to="`/discussion/${discussion.id}`"
              class="list-group-item list-group-item-action"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ discussion.title }}</h6>
                  <small class="text-muted">
                    {{ formatDate(discussion.createdAt) }} • {{ discussion.repliesCount || 0 }} réponses
                  </small>
                </div>
                <span class="badge bg-primary">{{ discussion.categoryName }}</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const form = ref({
      displayName: '',
      bio: ''
    })
    const loading = ref(false)
    const success = ref(false)
    const error = ref('')
    const userDiscussions = ref([])
    const loadingDiscussions = ref(false)

    const updateProfile = async () => {
      try {
        loading.value = true
        success.value = false
        error.value = ''

        await authStore.updateUserProfile({
          displayName: form.value.displayName,
          bio: form.value.bio
        })

        success.value = true
        setTimeout(() => {
          success.value = false
        }, 3000)
      } catch (err) {
        error.value = 'Erreur lors de la mise à jour du profil.'
      } finally {
        loading.value = false
      }
    }

    const fetchUserDiscussions = async () => {
      try {
        loadingDiscussions.value = true
        const q = query(
          collection(db, 'discussions'),
          where('authorId', '==', authStore.user.uid),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        userDiscussions.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (err) {
        console.error('Erreur lors du chargement des discussions:', err)
      } finally {
        loadingDiscussions.value = false
      }
    }

    const getInitials = (name) => {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date)
    }

    onMounted(() => {
      if (authStore.userProfile) {
        form.value.displayName = authStore.userProfile.displayName || ''
        form.value.bio = authStore.userProfile.bio || ''
      }
      fetchUserDiscussions()
    })

    return {
      authStore,
      form,
      loading,
      success,
      error,
      userDiscussions,
      loadingDiscussions,
      updateProfile,
      getInitials,
      formatDate
    }
  }
}
</script>