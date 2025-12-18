<template>
  <div id="app">
    <Navbar />
    <main class="container mt-4">
      <router-view v-if="!authStore.loading" />
      <div v-else class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script>
import { onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(() => {
      authStore.initAuthListener()
    })

    return {
      authStore
    }
  }
}
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
