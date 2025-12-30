<template>
  <div>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border"></div>
    </div>

    <div v-else-if="discussion">
      <!-- Discussion principale -->
      <div class="card shadow mb-4">
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <div>
            <h4 class="mb-1">{{ discussion.title }}</h4>
            <small>
              <i class="bi bi-folder"></i> {{ discussion.categoryName }}
            </small>
          </div>
          <div v-if="canModerate" class="dropdown">
            <button 
              class="btn btn-sm btn-light" 
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="deleteDiscussion">
                  <i class="bi bi-trash"></i> Supprimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="card-body">
          <div class="d-flex align-items-start mb-3">
            <div class="avatar bg-secondary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" 
                 style="width: 50px; height: 50px;">
              {{ getInitials(discussion.authorName) }}
            </div>
            <div>
              <strong>{{ discussion.authorName }}</strong>
              <div class="text-muted small">
                {{ formatDate(discussion.createdAt) }}
              </div>
            </div>
          </div>
          <div class="discussion-content">
            {{ discussion.content }}
          </div>
        </div>
      </div>

      <!-- Réponses -->
      <div class="card shadow mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-chat-left-text"></i> 
            {{ replies.length }} réponse{{ replies.length > 1 ? 's' : '' }}
          </h5>
        </div>
        <div class="card-body">
          <div v-if="replies.length === 0" class="text-center text-muted py-4">
            Aucune réponse pour le moment. Soyez le premier à répondre !
          </div>
          <div v-else>
            <ReplyCard 
              v-for="reply in replies" 
              :key="reply.id"
              :reply="reply"
              @delete="deleteReply"
              @update="updateReply"
              @report="reportReply"
            />
          </div>
        </div>
      </div>

      <!-- Formulaire de réponse -->
      <div v-if="authStore.isAuthenticated" class="card shadow">
        <div class="card-header">
          <h5 class="mb-0">Répondre à cette discussion</h5>
        </div>
        <div class="card-body">
          <div v-if="replyError" class="alert alert-danger">
            {{ replyError }}
          </div>
          <form @submit.prevent="submitReply">
            <div class="mb-3">
              <textarea 
                v-model="replyContent" 
                class="form-control" 
                rows="4"
                placeholder="Écrivez votre réponse..."
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="submitting"
            >
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-send"></i> Publier la réponse
            </button>
          </form>
        </div>
      </div>

      <div v-else class="card shadow">
        <div class="card-body text-center">
          <p class="mb-3">Connectez-vous pour participer à la discussion</p>
          <router-link to="/login" class="btn btn-primary">
            <i class="bi bi-box-arrow-in-right"></i> Se connecter
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="alert alert-warning">
      <i class="bi bi-exclamation-triangle"></i> Discussion introuvable.
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  doc, getDoc, collection, query, where, orderBy, 
  getDocs, addDoc, deleteDoc, updateDoc, serverTimestamp, increment 
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/store/auth'
import ReplyCard from '@/components/ReplyCard.vue'

export default {
  name: 'Discussion',
  components: {
    ReplyCard
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    
    const discussion = ref(null)
    const replies = ref([])
    const loading = ref(true)
    const replyContent = ref('')
    const submitting = ref(false)
    const replyError = ref('')

    const fetchDiscussion = async () => {
      try {
        const docRef = doc(db, 'discussions', route.params.id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          discussion.value = {
            id: docSnap.id,
            ...docSnap.data()
          }
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        loading.value = false
      }
    }

    const fetchReplies = async () => {
      try {
        const q = query(
          collection(db, 'replies'),
          where('discussionId', '==', route.params.id),
          orderBy('createdAt', 'asc')
        )
        const snapshot = await getDocs(q)
        replies.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Erreur:', error)
      }
    }

    const submitReply = async () => {
      try {
        submitting.value = true
        replyError.value = ''

        const replyData = {
          content: replyContent.value,
          discussionId: route.params.id,
          authorId: authStore.user.uid,
          authorName: authStore.userProfile.displayName,
          createdAt: serverTimestamp(),
          edited: false
        }

        await addDoc(collection(db, 'replies'), replyData)
        
        await updateDoc(doc(db, 'discussions', route.params.id), {
          repliesCount: increment(1),
          updatedAt: serverTimestamp()
        })

        replyContent.value = ''
        await fetchReplies()
      } catch (error) {
        replyError.value = 'Erreur lors de l\'envoi de la réponse.'
      } finally {
        submitting.value = false
      }
    }

    const deleteReply = async (replyId) => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) {
        try {
          await deleteDoc(doc(db, 'replies', replyId))
          await updateDoc(doc(db, 'discussions', route.params.id), {
            repliesCount: increment(-1)
          })
          await fetchReplies()
        } catch (error) {
          console.error('Erreur:', error)
        }
      }
    }

    const updateReply = async ({ id, content }) => {
      try {
        await updateDoc(doc(db, 'replies', id), {
          content,
          edited: true,
          editedAt: serverTimestamp()
        })
        await fetchReplies()
      } catch (error) {
        console.error('Erreur:', error)
      }
    }

    const deleteDiscussion = async () => {
      if (confirm('Êtes-vous sûr de vouloir supprimer cette discussion ?')) {
        try {
          await deleteDoc(doc(db, 'discussions', route.params.id))
          
          await updateDoc(doc(db, 'categories', discussion.value.categoryId), {
            count: increment(-1)
          })
          
          router.push('/')
        } catch (error) {
          console.error('Erreur:', error)
        }
      }
    }

    const reportReply = async (replyId) => {
      try {
        await addDoc(collection(db, 'reports'), {
          replyId,
          discussionId: route.params.id,
          reportedBy: authStore.user.uid,
          reportedAt: serverTimestamp(),
          status: 'pending'
        })
        alert('Le contenu a été signalé aux modérateurs.')
      } catch (error) {
        console.error('Erreur:', error)
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
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }

    const canModerate = computed(() => {
      return authStore.user?.uid === discussion.value?.authorId || authStore.isModerator
    })

    onMounted(() => {
      fetchDiscussion()
      fetchReplies()
    })

    return {
      authStore,
      discussion,
      replies,
      loading,
      replyContent,
      submitting,
      replyError,
      canModerate,
      submitReply,
      deleteReply,
      updateReply,
      deleteDiscussion,
      reportReply,
      getInitials,
      formatDate
    }
  }
}
</script>

<style scoped>
.discussion-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>