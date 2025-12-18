<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="category">
      <div class="card bg-primary text-white mb-4">
        <div class="card-body">
          <h2><i class="bi bi-folder-fill"></i> {{ category.name }}</h2>
          <p class="mb-0">{{ category.description }}</p>
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4>{{ discussions.length }} discussion{{ discussions.length > 1 ? 's' : '' }}</h4>
        <div class="btn-group">
          <button 
            :class="['btn', 'btn-sm', sortBy === 'recent' ? 'btn-primary' : 'btn-outline-primary']"
            @click="sortBy = 'recent'"
          >
            <i class="bi bi-clock"></i> Récentes
          </button>
          <button 
            :class="['btn', 'btn-sm', sortBy === 'popular' ? 'btn-primary' : 'btn-outline-primary']"
            @click="sortBy = 'popular'"
          >
            <i class="bi bi-fire"></i> Populaires
          </button>
        </div>
      </div>

      <div v-if="sortedDiscussions.length === 0" class="alert alert-info">
        <i class="bi bi-info-circle"></i> Aucune discussion dans cette catégorie.
      </div>

      <DiscussionCard 
        v-for="discussion in sortedDiscussions" 
        :key="discussion.id"
        :discussion="discussion"
      />
    </div>

    <div v-else class="alert alert-warning">
      <i class="bi bi-exclamation-triangle"></i> Catégorie introuvable.
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'
import DiscussionCard from '@/components/DiscussionCard.vue'

export default {
  name: 'Category',
  components: {
    DiscussionCard
  },
  setup() {
    const route = useRoute()
    const category = ref(null)
    const discussions = ref([])
    const loading = ref(true)
    const sortBy = ref('recent')

    const fetchCategory = async () => {
      try {
        const docRef = doc(db, 'categories', route.params.id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          category.value = {
            id: docSnap.id,
            ...docSnap.data()
          }
        }
      } catch (error) {
        console.error('Erreur:', error)
      }
    }

    const fetchDiscussions = async () => {
      try {
        const q = query(
          collection(db, 'discussions'),
          where('categoryId', '==', route.params.id),
          orderBy('createdAt', 'desc')
        )
        const snapshot = await getDocs(q)
        discussions.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        loading.value = false
      }
    }

    const sortedDiscussions = computed(() => {
      if (sortBy.value === 'popular') {
        return [...discussions.value].sort((a, b) => 
          (b.repliesCount || 0) - (a.repliesCount || 0)
        )
      }
      return discussions.value
    })

    onMounted(async () => {
      await fetchCategory()
      await fetchDiscussions()
    })

    return {
      category,
      discussions,
      loading,
      sortBy,
      sortedDiscussions
    }
  }
}
</script>