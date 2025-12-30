<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>{{ isLogin ? 'Connexion' : 'Inscription' }}</h2>
      <p class="subtitle">
        {{ isLogin ? 'Connectez-vous avec votre email universitaire' : 'Créez votre compte étudiant' }}
      </p>

      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Email universitaire</label>
          <input
            type="email"
            v-model="email"
            placeholder="votre.nom@uca.ac.ma"
            required
          />
        </div>

        <div class="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            v-model="password"
            placeholder="Minimum 6 caractères"
            required
            minlength="6"
          />
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Chargement...' : (isLogin ? 'Se connecter' : "S'inscrire") }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </form>

      <div class="switch-mode">
        <p>
          {{ isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?" }}
          <button @click="toggleMode" class="link-btn">
            {{ isLogin ? "S'inscrire" : "Se connecter" }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';

export default {
  name: 'Login',
  emits: ['login'],
  setup(props, { emit }) {
    const email = ref('');
    const password = ref('');
    const isLogin = ref(true);
    const error = ref('');
    const success = ref('');
    const loading = ref(false);

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
      error.value = '';
      success.value = '';
    };

    const handleSubmit = async () => {
      error.value = '';
      success.value = '';
      loading.value = true;

      if (!email.value.endsWith('@uca.ac.ma')) {
        error.value = 'Veuillez utiliser votre email universitaire (@uca.ac.ma)';
        loading.value = false;
        return;
      }

      try {
        if (isLogin.value) {
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            email.value, 
            password.value
          );
          emit('login', userCredential.user);
          email.value = '';
          password.value = '';
        } else {
          await createUserWithEmailAndPassword(
            auth, 
            email.value, 
            password.value
          );
          
          await signOut(auth);
          
          success.value = 'Compte créé avec succès ! Veuillez vous connecter.';
          
          const savedEmail = email.value;
          email.value = '';
          password.value = '';
          
          setTimeout(() => {
            isLogin.value = true;
            success.value = '';
            email.value = savedEmail;
          }, 2000);
        }
      } catch (err) {
        switch (err.code) {
          case 'auth/email-already-in-use':
            error.value = 'Cet email est déjà utilisé';
            break;
          case 'auth/invalid-email':
            error.value = 'Email invalide';
            break;
          case 'auth/user-not-found':
            error.value = 'Utilisateur non trouvé';
            break;
          case 'auth/wrong-password':
            error.value = 'Mot de passe incorrect';
            break;
          case 'auth/weak-password':
            error.value = 'Le mot de passe doit contenir au moins 6 caractères';
            break;
          default:
            error.value = 'Erreur: ' + err.message;
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      password,
      isLogin,
      error,
      success,
      loading,
      toggleMode,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 1rem;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(59, 130, 246, 0.2);
  border: 2px solid #e0e7ff;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h2 {
  color: #3b82f6;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #64748b;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  color: #1e293b;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

input {
  width: 100%;
  padding: 0.9rem;
  border: 2px solid #e0e7ff;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 1rem;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff4757;
  background: #ffe0e3;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.success-message {
  color: #2ed573;
  background: #d4f8e8;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}

.switch-mode {
  margin-top: 1.5rem;
  text-align: center;
  color: #64748b;
}

.link-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.3rem;
}

.link-btn:hover {
  color: #1e40af;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.6rem;
  }
}
</style>