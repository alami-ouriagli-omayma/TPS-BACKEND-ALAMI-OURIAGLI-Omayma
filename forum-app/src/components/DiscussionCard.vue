<template>
  <div class="card mb-3 shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start">
        <div class="flex-grow-1">
          <h5 class="card-title mb-2">
            <router-link 
              :to="`/discussion/${discussion.id}`" 
              class="text-decoration-none text-dark"
            >
              {{ discussion.title }}
            </router-link>
          </h5>
          <p class="card-text text-muted">
            {{ truncateContent(discussion.content) }}
          </p>
          
          <div class="d-flex align-items-center text-muted small flex-wrap gap-3">
            <span>
              <i class="bi bi-person-circle"></i> {{ discussion.authorName }}
            </span>
            <span>
              <i class="bi bi-folder"></i> {{ discussion.categoryName }}
            </span>
            <span>
              <i class="bi bi-chat-left-text"></i> {{ discussion.repliesCount || 0 }} réponse{{ (discussion.repliesCount || 0) > 1 ? 's' : '' }}
            </span>
            <span>
              <i class="bi bi-clock"></i> {{ formatDate(discussion.createdAt) }}
            </span>
          </div>
        </div>
        
        <span class="badge bg-primary ms-3">
          {{ discussion.categoryName }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscussionCard',
  props: {
    discussion: {
      type: Object,
      required: true
    }
  },
  methods: {
    truncateContent(content) {
      if (!content) return ''
      return content.length > 150 
        ? content.substring(0, 150) + '...' 
        : content
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
    }
  }
}
</script>

<style scoped>
.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.gap-3 {
  gap: 1rem;
}
</style>