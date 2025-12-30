<template>
  <div>
    <div class="jumbotron p-5 rounded mb-4">
      <h1 class="display-4">Bienvenue sur notre Forum</h1>
      <p class="lead">Partagez vos idées, posez vos questions et rejoignez la communauté</p>
      <div class="input-group mt-4">
        <input 
          v-model="searchQuery" 
          type="text" 
          class="form-control form-control-lg" 
          placeholder="Rechercher des discussions..."
          @keyup.enter="searchDiscussions"
        >
        <button class="btn btn-light btn-lg" @click="searchDiscussions">
          <i class="bi bi-search"></i> Rechercher
        </button>
      </div>
    </div>

    <div class="row">
      <div class="col-md-8">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3><i class="bi bi-chat-left-text"></i> Discussions récentes</h3>
          <div class="btn-group">
            <button 
              :class="['btn', 'btn-sm', filter === 'recent' ? 'btn-primary' : 'btn-outline-primary']"
              @click="filter = 'recent'"
            >
              <i class="bi bi-clock"></i> Récentes
            </button>
            <button 
              :class="['btn', 'btn-sm', filter === 'popular' ? 'btn-primary' : 'btn-outline-primary']"
              @click="filter = 'popular'"
            >
              <i class="bi bi-fire"></i> Populaires
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <div v-else-if="filteredDiscussions.length === 0" class="alert alert-info">
          <i class="bi bi-info-circle"></i> Aucune discussion trouvée.
        </div>

        <div v-else>
          <DiscussionCard 
            v-for="discussion in filteredDiscussions" 
            :key="discussion.id"
            :discussion="discussion"
          />
        </div>
      </div>

      <div class="col-md-4">
        <div class="card mb-3 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0"><i class="bi bi-folder-fill"></i> Catégories</h5>
          </div>
          <div class="list-group list-group-flush">
            <router-link 
              v-for="category in categories" 
              :key="category.id"
              :to="`/category/${category.id}`"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              <span>
                <i class="bi bi-folder"></i> {{ category.name }}
              </span>
              <span class="badge bg-primary rounded-pill">
                {{ category.count || 0 }}
              </span>
            </router-link>
          </div>
        </div>

        <div v-if="authStore.isAuthenticated" class="card shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-plus-circle-fill text-primary" style="font-size: 3rem;"></i>
            <h5 class="mt-3">Créer une discussion</h5>
            <p class="text-muted">Partagez vos idées avec la communauté</p>
            <router-link to="/create-discussion" class="btn btn-primary">
              <i class="bi bi-plus-lg"></i> Nouvelle discussion
            </router-link>
          </div>
        </div>

        <div v-else class="card shadow-sm">
          <div class="card-body text-center">
            <i class="bi bi-person-fill-add text-primary" style="font-size: 3rem;"></i>
            <h5 class="mt-3">Rejoignez-nous !</h5>
            <p class="text-muted">Inscrivez-vous pour participer</p>
            <router-link to="/signup" class="btn btn-primary">
              <i class="bi bi-person-plus"></i> S'inscrire
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/auth'
import DiscussionCard from '@/components/DiscussionCard.vue'

export default {
  name: 'Home',
  components: {
    DiscussionCard
  },
  setup() {
    const authStore = useAuthStore()
    const discussions = ref([])
    const categories = ref([])
    const loading = ref(true)
    const searchQuery = ref('')
    const filter = ref('recent')

    const fetchDiscussions = async () => {
      try {
        loading.value = true
        const q = query(
          collection(db, 'discussions'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
        const snapshot = await getDocs(q)
        discussions.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Erreur lors du chargement des discussions:', error)
      } finally {
        loading.value = false
      }
    }

    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'))
        categories.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error)
      }
    }

    const filteredDiscussions = computed(() => {
      let result = discussions.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(d => 
          d.title.toLowerCase().includes(query) || 
          d.content.toLowerCase().includes(query)
        )
      }

      if (filter.value === 'popular') {
        return [...result].sort((a, b) => (b.repliesCount || 0) - (a.repliesCount || 0))
      }

      return result
    })

    const searchDiscussions = () => {
      // La recherche est déjà gérée par le computed filteredDiscussions
    }

    onMounted(() => {
      fetchDiscussions()
      fetchCategories()
    })

    return {
      authStore,
      discussions,
      categories,
      loading,
      searchQuery,
      filter,
      filteredDiscussions,
      searchDiscussions
    }
  }
}
</script>