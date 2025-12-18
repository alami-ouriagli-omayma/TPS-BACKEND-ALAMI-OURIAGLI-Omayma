<template>
  <div class="home">
    <NavBar />
    
    <div class="container">
      <div class="header">
        <h2>Événements à venir</h2>
        <p>Votez pour les événements qui vous intéressent</p>
      </div>

      <div v-if="loading" class="loading">
        <p>Chargement des événements...</p>
      </div>

      <div v-else-if="events.length === 0" class="no-events">
        <p>Aucun événement disponible pour le moment.</p>
      </div>

      <div v-else class="events-grid">
        <EventCard 
          v-for="event in events" 
          :key="event.id" 
          :event="event" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'
import NavBar from '@/components/NavBar.vue'
import EventCard from '@/components/EventCard.vue'

const events = ref([])
const loading = ref(true)

const fetchEvents = async () => {
  try {
    const eventsRef = collection(db, 'events')
    const q = query(eventsRef, orderBy('date', 'asc'))
    const querySnapshot = await getDocs(q)
    
    events.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h2 {
  color: #333;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.header p {
  color: #666;
  font-size: 1.1rem;
}

.loading, .no-events {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

@media (max-width: 768px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
}
</style>