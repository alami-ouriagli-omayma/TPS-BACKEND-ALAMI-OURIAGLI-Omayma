<template>
  <div class="events-container">
    <div class="container-full">
      <div class="header-section">
        <h2> Événements à venir</h2>
        <p class="description">Votez pour les événements qui vous intéressent</p>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Chargement des événements...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-text"> {{ error }}</p>
        <button @click="retryLoad" class="btn-retry">Réessayer</button>
      </div>

      <div v-else-if="events.length === 0" class="no-events">
        <p>Aucun événement disponible pour le moment</p>
        <button @click="retryLoad" class="btn-retry">Actualiser</button>
      </div>

      <div v-else class="events-row">
        <div v-for="event in events" :key="event.id" class="event-card">
          <div class="event-image">
            <img :src="event.img || 'https://via.placeholder.com/400x200'" :alt="event.title" />
            <div class="event-badge" :class="{ 'free': event.isFree }">
              {{ event.isFree ? 'Gratuit' : (event.price || 0) + ' DH' }}
            </div>
          </div>

          <div class="event-content">
            <h3>{{ event.title }}</h3>
            <p class="event-description">{{ event.description }}</p>
            
            <div class="event-date">
              📅 {{ formatDate(event.date) }}
            </div>

            <div class="vote-section">
              <div class="vote-stats">
                <div class="stat yes">
                  <span class="icon">👍</span>
                  <span class="count">{{ event.yesVotes || 0 }}</span>
                </div>
                <div class="stat no">
                  <span class="icon">👎</span>
                  <span class="count">{{ event.noVotes || 0 }}</span>
                </div>
              </div>

              <div class="vote-buttons">
                <button 
                  @click="vote(event.id, 'yes')"
                  :class="{ 'active': userVotes[event.id] === 'yes' }"
                  :disabled="votingEvent === event.id"
                  class="btn-vote yes-btn"
                >
                  {{ userVotes[event.id] === 'yes' ? '✓ Oui' : 'Oui' }}
                </button>
                <button 
                  @click="vote(event.id, 'no')"
                  :class="{ 'active': userVotes[event.id] === 'no' }"
                  :disabled="votingEvent === event.id"
                  class="btn-vote no-btn"
                >
                  {{ userVotes[event.id] === 'no' ? '✓ Non' : 'Non' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  doc,
  deleteDoc,
  increment,
  onSnapshot
} from 'firebase/firestore';

export default {
  name: 'EventList',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const events = ref([]);
    const userVotes = ref({});
    const loading = ref(true);
    const error = ref('');
    const votingEvent = ref(null);

    const formatDate = (dateString) => {
      try {
        const options = { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
      } catch (e) {
        return dateString;
      }
    };

    const loadEvents = () => {
      try {
        const eventsRef = collection(db, 'events');
        
        onSnapshot(eventsRef, 
          (snapshot) => {
            console.log('Nombre d\'événements reçus:', snapshot.docs.length);
            events.value = snapshot.docs.map(doc => {
              const data = doc.data();
              console.log('Événement:', data);
              return {
                id: doc.id,
                ...data
              };
            });
            loading.value = false;
            error.value = '';
          },
          (err) => {
            console.error('Erreur Firestore:', err);
            error.value = 'Erreur de chargement: ' + err.message;
            loading.value = false;
          }
        );
      } catch (err) {
        console.error('Erreur lors de la connexion:', err);
        error.value = 'Impossible de se connecter à Firebase';
        loading.value = false;
      }
    };

    const loadUserVotes = async () => {
      try {
        const votesRef = collection(db, 'votes');
        const q = query(votesRef, where('userId', '==', props.user.uid));
        const snapshot = await getDocs(q);
        
        const votes = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          votes[data.eventId] = data.vote;
        });
        
        userVotes.value = votes;
      } catch (err) {
        console.error('Erreur de chargement des votes:', err);
      }
    };

    const retryLoad = () => {
      loading.value = true;
      error.value = '';
      loadEvents();
      loadUserVotes();
    };

    const vote = async (eventId, voteType) => {
      votingEvent.value = eventId;
      const previousVote = userVotes.value[eventId];

      try {
        const votesRef = collection(db, 'votes');
        const q = query(
          votesRef, 
          where('userId', '==', props.user.uid),
          where('eventId', '==', eventId)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const voteDoc = snapshot.docs[0];
          
          if (previousVote === voteType) {
            await deleteDoc(doc(db, 'votes', voteDoc.id));
            
            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
              [voteType === 'yes' ? 'yesVotes' : 'noVotes']: increment(-1)
            });
            
            delete userVotes.value[eventId];
          } else {
            await updateDoc(doc(db, 'votes', voteDoc.id), {
              vote: voteType,
              createdAt: new Date().toISOString()
            });

            const eventRef = doc(db, 'events', eventId);
            await updateDoc(eventRef, {
              [previousVote === 'yes' ? 'yesVotes' : 'noVotes']: increment(-1),
              [voteType === 'yes' ? 'yesVotes' : 'noVotes']: increment(1)
            });

            userVotes.value[eventId] = voteType;
          }
        } else {
          await addDoc(votesRef, {
            eventId,
            userId: props.user.uid,
            vote: voteType,
            createdAt: new Date().toISOString()
          });

          const eventRef = doc(db, 'events', eventId);
          await updateDoc(eventRef, {
            [voteType === 'yes' ? 'yesVotes' : 'noVotes']: increment(1)
          });

          userVotes.value[eventId] = voteType;
        }
      } catch (error) {
        console.error('Erreur lors du vote:', error);
        alert('Erreur lors du vote: ' + error.message);
      } finally {
        votingEvent.value = null;
      }
    };

    onMounted(() => {
      loadEvents();
      loadUserVotes();
    });

    return {
      events,
      userVotes,
      loading,
      error,
      votingEvent,
      formatDate,
      vote,
      retryLoad
    };
  }
};
</script>

<style scoped>
.events-container {
  padding: 2rem 0;
  background: white;
  min-height: calc(100vh - 100px);
}

.container-full {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.header-section h2 {
  color: #3b82f6;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.description {
  color: #64748b;
  font-size: 1.1rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: #3b82f6;
}

.spinner {
  border: 4px solid rgba(59, 130, 246, 0.3);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  padding: 4rem;
}

.error-text {
  color: #ff4757;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.btn-retry {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-retry:hover {
  background: #1e40af;
  transform: translateY(-2px);
}

.no-events {
  text-align: center;
  padding: 4rem;
  color: #64748b;
  font-size: 1.2rem;
}

.no-events .btn-retry {
  margin-top: 1rem;
}

.events-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin: 0 auto;
}

.event-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
  border: 2px solid #e0e7ff;
  transition: all 0.3s;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.event-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ff4757;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
}

.event-badge.free {
  background: #2ed573;
}

.event-content {
  padding: 1.5rem;
}

h3 {
  color: #3b82f6;
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
}

.event-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.event-date {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e7ff;
}

.vote-section {
  margin-top: 1.5rem;
}

.vote-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat .icon {
  font-size: 2rem;
}

.stat .count {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat.yes .count {
  color: #2ed573;
}

.stat.no .count {
  color: #ff4757;
}

.vote-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.btn-vote {
  padding: 0.9rem;
  border: 2px solid;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.yes-btn {
  background: white;
  color: #2ed573;
  border-color: #2ed573;
}

.yes-btn:hover:not(:disabled) {
  background: #2ed573;
  color: white;
}

.yes-btn.active {
  background: #2ed573;
  color: white;
}

.no-btn {
  background: white;
  color: #ff4757;
  border-color: #ff4757;
}

.no-btn:hover:not(:disabled) {
  background: #ff4757;
  color: white;
}

.no-btn.active {
  background: #ff4757;
  color: white;
}

.btn-vote:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .events-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .events-row {
    grid-template-columns: 1fr;
  }

  .header-section h2 {
    font-size: 2rem;
  }

  .container-full {
    padding: 0 1rem;
  }
}
</style>