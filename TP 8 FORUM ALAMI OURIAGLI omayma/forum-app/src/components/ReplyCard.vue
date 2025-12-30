<template>
  <div class="card mb-3">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="d-flex align-items-center">
          <div class="avatar bg-secondary text-white rounded-circle me-2 d-flex align-items-center justify-content-center" 
               style="width: 40px; height: 40px; font-size: 0.9rem;">
            {{ getInitials(reply.authorName) }}
          </div>
          <div>
            <strong>{{ reply.authorName }}</strong>
            <div class="text-muted small">
              {{ formatDate(reply.createdAt) }}
              <span v-if="reply.edited" class="ms-1 fst-italic">(modifié)</span>
            </div>
          </div>
        </div>
        
        <div v-if="canModify" class="dropdown">
          <button 
            class="btn btn-sm btn-link text-muted p-0" 
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" @click.prevent="startEdit">
                <i class="bi bi-pencil"></i> Modifier
              </a>
            </li>
            <li>
              <a class="dropdown-item text-danger" href="#" @click.prevent="$emit('delete', reply.id)">
                <i class="bi bi-trash"></i> Supprimer
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <div v-if="!isEditing" class="reply-content">
        {{ reply.content }}
      </div>
      
      <div v-else>
        <textarea 
          v-model="editContent" 
          class="form-control mb-2"
          rows="3"
        ></textarea>
        <button 
          class="btn btn-sm btn-primary me-2" 
          @click="saveEdit"
        >
          <i class="bi bi-check-lg"></i> Enregistrer
        </button>
        <button 
          class="btn btn-sm btn-secondary" 
          @click="cancelEdit"
        >
          <i class="bi bi-x-lg"></i> Annuler
        </button>
      </div>
      
      <div v-if="canReport && !canModify" class="mt-2">
        <a 
          href="#" 
          class="text-muted small text-decoration-none" 
          @click.prevent="$emit('report', reply.id)"
        >
          <i class="bi bi-flag"></i> Signaler
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/store/auth'

export default {
  name: 'ReplyCard',
  props: {
    reply: {
      type: Object,
      required: true
    }
  },
  emits: ['delete', 'report', 'update'],
  data() {
    return {
      isEditing: false,
      editContent: ''
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
    canModify() {
      return this.authStore.user?.uid === this.reply.authorId || this.authStore.isModerator
    },
    canReport() {
      return this.authStore.isAuthenticated && this.authStore.user?.uid !== this.reply.authorId
    }
  },
  methods: {
    getInitials(name) {
      if (!name) return '?'
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },
    formatDate(timestamp) {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return new Intl.DateTimeFormat('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    },
    startEdit() {
      this.isEditing = true
      this.editContent = this.reply.content
    },
    saveEdit() {
      this.$emit('update', { id: this.reply.id, content: this.editContent })
      this.isEditing = false
    },
    cancelEdit() {
      this.isEditing = false
      this.editContent = ''
    }
  }
}
</script>

<style scoped>
.reply-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>