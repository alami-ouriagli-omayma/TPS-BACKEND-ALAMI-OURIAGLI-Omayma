<template>
  <footer class="bg-dark text-white mt-5 py-4">
    <div class="container text-center">
      <p class="mb-2">&copy; 2024 Forum Communautaire. Tous droits réservés.</p>
      <p class="mb-0">
        <a href="#" class="text-white text-decoration-none me-3">
          <i class="bi bi-info-circle"></i> À propos
        </a>
        <a href="#" class="text-white text-decoration-none me-3">
          <i class="bi bi-envelope"></i> Contact
        </a>
        <a href="#" class="text-white text-decoration-none">
          <i class="bi bi-file-text"></i> Conditions d'utilisation
        </a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
footer a:hover {
  opacity: 0.8;
}
</style>