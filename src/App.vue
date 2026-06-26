<template>
  <div class="app-wrapper">
    <nav class="app-bar">
      <div class="nav-content">
        <!-- Logo / Marca -->
        <div class="nav-brand">
          <router-link to="/" class="brand-link" style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none;">
            <span class="material-icons brand-icon">eco</span>
            <span class="brand-name">Natü</span>
          </router-link>
        </div>
        
        <!-- Opciones Centrales y Derecha (Solo para registrados) -->
        <template v-if="authStore.token">
          <!-- Opciones Centrales (Estilo Twitter/FB) -->
          <div class="nav-center">
            <router-link to="/" class="nav-item" title="Inicio"><span class="material-icons">home</span></router-link>
            <!-- Futuros iconos centrales irían aquí -->
          </div>
          
          <!-- Acciones Derecha -->
          <div class="nav-actions">
            <router-link to="/create-post" class="btn btn-primary btn-sm" style="border-radius: var(--radius-full); padding: 0.4rem 1rem; display: flex; align-items: center; gap: 0.3rem;">
              <span class="material-icons icon-sm">add</span> Crear
            </router-link>
            <router-link to="/notifications" class="nav-icon-btn" title="Notificaciones"><span class="material-icons">notifications</span></router-link>
            <router-link to="/profile" class="nav-icon-btn" title="Perfil"><span class="material-icons">account_circle</span></router-link>
            <button @click="logout" class="nav-icon-btn text-danger" title="Cerrar Sesión" style="background: none; border: none; cursor: pointer;">
              <span class="material-icons">logout</span>
            </button>
          </div>
        </template>

        <!-- Visitantes (Sin login) -->
        <template v-else>
          <div class="nav-actions">
            <router-link to="/login" class="btn btn-secondary">Entrar</router-link>
            <router-link to="/register" class="btn btn-primary">Registro</router-link>
          </div>
        </template>
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
  font-size: 1.8rem;
  color: var(--primary);
}

.brand-name {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.4rem;
  color: var(--primary);
  letter-spacing: -0.5px;
}

.nav-center {
  display: flex;
  justify-content: center;
  flex: 1;
  gap: 2rem;
}

.nav-item {
  color: var(--text-muted);
  padding: 0.5rem 1rem;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.nav-item .material-icons {
  font-size: 1.8rem;
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

.nav-icon-btn {
  color: var(--text-main);
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.nav-icon-btn:hover {
  background-color: var(--border);
}

.nav-icon-btn.router-link-active {
  color: var(--primary);
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: row;
    justify-content: space-between;
    padding: 0.5rem 1rem;
  }
  
  .nav-center {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 0.5rem 0;
    justify-content: space-around;
    z-index: 1000;
  }
  
  .nav-actions {
    width: auto;
    border: none;
    padding: 0;
  }
  
  .brand-name {
    display: none; /* Hide text on mobile to save space */
  }
}
</style>
