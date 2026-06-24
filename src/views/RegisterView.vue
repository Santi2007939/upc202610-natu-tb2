<template>
  <div class="auth-container">
    <div class="card auth-card">
      <div class="auth-header">
        <span class="material-icons auth-icon">person_add</span>
        <h1 class="auth-title">Crear Cuenta</h1>
        <p class="text-muted">Únete a la comunidad de Natü</p>
      </div>

      <form @submit.prevent="register" class="auth-form">
        <div class="form-group">
          <label class="form-label">Nombre de Usuario</label>
          <input v-model="username" type="text" class="form-input" placeholder="tu_usuario" required />
        </div>

        <div class="form-group">
          <label class="form-label">Correo Electrónico</label>
          <input v-model="email" type="email" class="form-input" placeholder="tu@email.com" required />
        </div>
        
        <div class="form-group">
          <label class="form-label">Contraseña</label>
          <input v-model="password" type="password" class="form-input" placeholder="••••••••" required />
        </div>
        
        <button type="submit" class="btn btn-primary auth-submit">
          <span class="material-icons icon-sm">person_add</span> Registrarse
        </button>
      </form>
      
      <p v-if="error" class="error-msg">{{ error }}</p>
      
      <div class="auth-footer">
        <p class="text-muted">¿Ya tienes una cuenta?</p>
        <router-link to="/login" class="btn btn-secondary btn-sm" style="width: 100%; margin-top: 0.5rem;">Iniciar Sesión</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref('');
const router = useRouter();
const authStore = useAuthStore();

async function register() {
  try {
    const res = await api.post('/auth/register', { username: username.value, email: email.value, password: password.value });
    authStore.setToken(res.data.token);
    authStore.setUser(res.data.user);
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Error al registrarse';
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  box-shadow: var(--shadow-2);
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-icon {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.auth-title {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.auth-submit {
  width: 100%;
  margin-top: 1rem;
  padding: 0.8rem;
  font-size: 1.1rem;
}

.error-msg {
  color: var(--danger);
  margin-top: 1rem;
  text-align: center;
  font-weight: 500;
  padding: 0.5rem;
  background-color: rgba(211, 47, 47, 0.1);
  border-radius: var(--radius-sm);
}

.auth-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  text-align: center;
}
</style>
