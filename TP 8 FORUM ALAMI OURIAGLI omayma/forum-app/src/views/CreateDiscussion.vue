<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow">
        <div class="card-header bg-primary text-white">
          <h4 class="mb-0"><i class="bi bi-plus-circle"></i> Créer une nouvelle discussion</h4>
        </div>
        <div class="card-body">
          <div v-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <form @submit.prevent="createDiscussion">
            <div class="mb-3">
              <label for="category" class="form-label">Catégorie *</label>
              <select 
                v-model="form.categoryId" 
                class="form-select" 
                id="category"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                <option 
                  v-for="category in categories" 
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label for="title" class="form-label">Titre *</label>
              <input 
                v-model="form.title" 
                type="text" 
                class="form-control" 
                id="title"
                placeholder="Donnez un titre clair à votre discussion"
                required
                maxlength="200"
              >
              <small class="text-muted">{{ form.title.length }}/200 caractères</small>
            </div>

            <div class="mb-3">
              <label for="content" class="form-label">Contenu *</label>
              <textarea 
                v-model="form.content" 
                class="form-control" 
                id="content"
                rows="8"
                placeholder="Décrivez votre question ou votre idée en détail..."
                required
              ></textarea>
            </div>

            <div class="d-flex justify-content-between">
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="$router.push('/')"
              >
                <i class="bi bi-x-lg"></i> Annuler
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                <i class="bi bi-send"></i> Publier la discussion
              </button>
            </div>
          </form>
        </div>
      </div>

      <div class="card mt-3">
        <div class="card-body">
          <h6 class="card-title"><i class="bi bi-lightbulb"></i> Conseils pour créer une bonne discussion</h6>
          <ul class="mb-0">
            <li>Choisissez un titre clair et descriptif</li>
            <li>Soyez précis dans votre description</li>
            <li>Utilisez une catégorie appropriée</li>
            <li>Restez respectueux envers les autres membres</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, getDocs, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/auth'

export default {
  name: 'CreateDiscussion',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    
    const form = ref({
      title: '',
      content: '',
      categoryId: ''
    })
    
    const categories = ref([])
    const loading = ref(false)
    const error = ref('')

    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'))
        categories.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err)
      }
    }

    const createDiscussion = async () => {
      try {
        loading.value = true
        error.value = ''

        const selectedCategory = categories.value.find(c => c.id === form.value.categoryId)

        const discussionData = {
          title: form.value.title,
          content: form.value.content,
          categoryId: form.value.categoryId,
          categoryName: selectedCategory?.name || '',
          authorId: authStore.user.uid,
          authorName: authStore.userProfile.displayName,
          repliesCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        const docRef = await addDoc(collection(db, 'discussions'), discussionData)
        
        await updateDoc(doc(db, 'categories', form.value.categoryId), {
          count: increment(1)
        })

        router.push(`/discussion/${docRef.id}`)
      } catch (err) {
        error.value = 'Erreur lors de la création de la discussion.'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchCategories()
    })

    return {
      form,
      categories,
      loading,
      error,
      createDiscussion
    }
  }
}
</script>