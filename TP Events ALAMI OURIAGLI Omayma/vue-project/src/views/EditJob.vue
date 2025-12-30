<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const jobId = route.params.id

// Champs du formulaire
const title = ref('')
const company = ref('')
const description = ref('')
const salary = ref('')
const experience = ref('')
const createdAt = ref('')

// Charger les données du job à modifier
onMounted(async () => {
  try {
    const res = await fetch(`http://localhost:3000/jobs/${jobId}`)
    const job = await res.json()
    title.value = job.title
    company.value = job.company
    description.value = job.description
    salary.value = job.salary
    experience.value = job.experience
    createdAt.value = job.createdAt
  } catch (err) {
    console.log('Erreur fetch job:', err)
  }
})

// Fonction pour mettre à jour le job
const updateJob = async () => {
  const updatedJob = {
    title: title.value,
    company: company.value,
    description: description.value,
    salary: Number(salary.value),
    experience: experience.value,
    createdAt: createdAt.value
  }

  try {
    await fetch(`http://localhost:3000/jobs/${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedJob)
    })
    alert('Job mis à jour avec succès !')
    router.push('/')  // retourne à Home.vue
  } catch (err) {
    console.log('Erreur PATCH:', err)
  }
}
</script>

<template>
  <div>
    <h1>Modifier le Job</h1>
    <form @submit.prevent="updateJob">
      <label>Titre :</label>
      <input v-model="title" required />

      <label>Entreprise :</label>
      <input v-model="company" required />

      <label>Description :</label>
      <textarea v-model="description" required></textarea>

      <label>Salaire :</label>
      <input v-model="salary" type="number" required />

      <label>Expérience :</label>
      <input v-model="experience" required />

      <label>Date de création :</label>
      <input v-model="createdAt" type="date" required />

      <button type="submit">Mettre à jour</button>
    </form>
  </div>
</template>

<style scoped>
form { display: flex; flex-direction: column; gap: 10px; max-width: 400px; }
label { font-weight: bold; }
button { width: 120px; margin-top: 10px; }
</style>
