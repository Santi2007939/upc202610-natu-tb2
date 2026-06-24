<template>
  <div class="app-wrapper">
    <nav class="app-bar">
      <div class="nav-content">
        <div class="nav-brand">
          <span class="material-icons brand-icon">eco</span>
          <span class="brand-name">Natü</span>
        </div>
        
        <div class="nav-links">
          <router-link to="/" class="nav-item"><span class="material-icons icon-sm">home</span> Inicio</router-link>
          <router-link to="/create-post" class="nav-item"><span class="material-icons icon-sm">add_circle</span> Crear</router-link>
        </div>
        
        <div class="nav-actions">
          <template v-if="authStore.token">
            <router-link to="/notifications" class="nav-item" title="Notificaciones"><span class="material-icons">notifications</span></router-link>
            <router-link to="/profile" class="nav-item" title="Perfil"><span class="material-icons">account_circle</span></router-link>
            <button @click="logout" class="btn btn-danger" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;">Cerrar Sesión</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-secondary">Entrar</router-link>
            <router-link to="/register" class="btn btn-primary">Registro</router-link>
          </template>
        </div>
      </div>
    </nav>

    <main class="main-container">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

function logout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-bar {
  background-color: var(--surface);
  box-shadow: var(--shadow-1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--primary);
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  color: var(--text-main);
  font-weight: 500;
  padding: 0.4rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.nav-item:hover, .nav-item.router-link-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    padding: 0.5rem;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-around;
    gap: 0;
  }
  
  .nav-actions {
    width: 100%;
    justify-content: center;
    border-top: 1px solid var(--border);
    padding-top: 0.5rem;
  }
}
</style>
