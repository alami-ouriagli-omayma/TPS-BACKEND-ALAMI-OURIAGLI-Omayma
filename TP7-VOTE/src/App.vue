<template>
  <div id="app">
    <header class="header">
      <div class="container">
        <h1>🎓 ENSA Safi - Événements</h1>
        <button v-if="user" @click="logout" class="btn-logout">
          Déconnexion ({{ user.email }})
        </button>
      </div>
    </header>

    <main class="main-content">
      <Login v-if="!user" @login="handleLogin" />
      <EventList v-else :user="user" />
    </main>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Login from './components/Login.vue';
import EventList from './components/EventList.vue';

export default {
  name: 'App',
  components: {
    Login,
    EventList
  },
  setup() {
    const user = ref(null);

    onMounted(() => {
      onAuthStateChanged(auth, (currentUser) => {
        user.value = currentUser;
      });
    });

    const handleLogin = (loggedUser) => {
      user.value = loggedUser;
    };

    const logout = async () => {
      try {
        await signOut(auth);
        user.value = null;
      } catch (error) {
        console.error('Erreur de déconnexion:', error);
      }
    };

    return {
      user,
      handleLogin,
      logout
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  min-height: 100vh;
}

.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h1 {
  color: #3b82f6;
  font-size: 1.8rem;
}

.btn-logout {
  background: #ff4757;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: #ee5a6f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.main-content {
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.3rem;
  }

  .btn-logout {
    padding: 0.5rem 0.8rem;
    font-size: 0.8rem;
  }

  .container {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>