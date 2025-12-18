<template>
  <div class="event-card">
    <img v-if="event.img" :src="event.img" :alt="event.title" class="event-image" />
    <div class="event-content">
      <h3>{{ event.title }}</h3>
      <p class="description">{{ event.description }}</p>
      
      <div class="event-info">
        <p class="date"> {{ formatDate(event.date) }}</p>
        <p class="price" :class="{ free: event.isFree }">
          {{ event.isFree ? ' Gratuit !!' : ` ${event.Price} DH` }}
        </p>
      </div>

      <div class="votes-display">
        <div class="vote-count yes">
          <span class="icon">interesse</span>
          <span class="count">{{ event.yesVotes || 0 }}</span>
        </div>
        <div class="vote-count no">
          <span class="icon">non interesse</span>
          <span class="count">{{ event.noVotes || 0 }}</span>
        </div>
      </div>

      <div class="vote-buttons">
        <button 
          @click="vote('yes')" 
          :disabled="hasVoted || voting"
          :class="{ active: userVote === 'yes' }"
          class="btn-vote btn-yes"
        >
          {{ userVote === 'yes' ? '✓ Voté Oui' : 'Voter Oui' }}
        </button>
        <button 
          @click="vote('no')" 
          :disabled="hasVoted || voting"
          :class="{ active: userVote === 'no' }"
          class="btn-vote btn-no"
        >
          {{ userVote === 'no' ? '✓ Voté Non' : 'Voter Non' }}
        </button>
      </div>

      <p v-if="hasVoted" class="voted-message">
        Vous avez déjà voté pour cet événement !
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { doc, updateDoc, increment, collection, query, where, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
})

const authStore = useAuthStore()
const hasVoted = ref(false)
const userVote = ref(null)
const voting = ref(false)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const checkUserVote = async () => {
  if (!authStore.user) return

  try {
    const votesRef = collection(db, 'votes')
    const q = query(
      votesRef,
      where('eventId', '==', props.event.id),
      where('userId', '==', authStore.user.uid)
    )
    
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      hasVoted.value = true
      userVote.value = querySnapshot.docs[0].data().vote
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du vote:', error)
  }
}

const vote = async (voteType) => {
  if (!authStore.user || hasVoted.value || voting.value) return

  voting.value = true

  try {
    // Ajouter le vote dans la collection votes
    await addDoc(collection(db, 'votes'), {
      eventId: props.event.id,
      userId: authStore.user.uid,
      vote: voteType,
      createdAt: new Date().toISOString()
    })

    // Mettre à jour le compteur dans l'événement
    const eventRef = doc(db, 'events', props.event.id)
    const updateField = voteType === 'yes' ? 'yesVotes' : 'noVotes'
    
    await updateDoc(eventRef, {
      [updateField]: increment(1),
      updatedAt: new Date().toISOString()
    })

    hasVoted.value = true
    userVote.value = voteType

    // Mettre à jour localement
    if (voteType === 'yes') {
      props.event.yesVotes = (props.event.yesVotes || 0) + 1
    } else {
      props.event.noVotes = (props.event.noVotes || 0) + 1
    }

  } catch (error) {
    console.error('Erreur lors du vote:', error)
    alert('Erreur lors du vote. Veuillez réessayer.')
  } finally {
    voting.value = false
  }
}

onMounted(() => {
  checkUserVote()
})
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.event-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.event-content {
  padding: 1.5rem;
}

h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.4rem;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.event-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.date, .price {
  font-size: 0.9rem;
  color: #555;
}

.price.free {
  color: #10b981;
  font-weight: 600;
}

.votes-display {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.vote-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
}

.vote-count .icon {
  font-size: 1.5rem;
}

.vote-count.yes .count {
  color: #10b981;
  font-weight: 600;
}

.vote-count.no .count {
  color: #ef4444;
  font-weight: 600;
}

.vote-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-vote {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
}

.btn-yes {
  background: #10b981;
  color: white;
}

.btn-yes:hover:not(:disabled) {
  background: #059669;
}

.btn-no {
  background: #ef4444;
  color: white;
}

.btn-no:hover:not(:disabled) {
  background: #dc2626;
}

.btn-vote:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-vote.active {
  opacity: 0.8;
  cursor: not-allowed;
}

.voted-message {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  font-style: italic;
}
</style>