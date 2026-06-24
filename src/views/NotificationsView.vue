<template>
  <div class="notifications-container">
    <div class="flex-between" style="margin-bottom: 1.5rem;">
      <h1>Notificaciones (RF-19)</h1>
    </div>

    <div v-if="loading" class="text-center text-muted" style="padding: 3rem;">
      Cargando notificaciones...
    </div>
    
    <div v-else class="notifications-list">
      <div v-if="notifications.length === 0" class="card text-center text-muted" style="padding: 3rem;">
        No tienes notificaciones nuevas.
      </div>
      
      <div v-for="notif in notifications" :key="notif._id" class="card notif-card">
        <div class="notif-content">
          <p class="notif-title">
            <span class="material-icons" style="font-size: 1.2rem; vertical-align: bottom;">chat_bubble</span> 
            <strong>Nuevo comentario</strong> en tu post 
            <em class="text-muted">"{{ notif.post_info[0]?.title || 'Publicación' }}"</em>
          </p>
          <p class="notif-message">"{{ notif.content }}"</p>
        </div>
        <router-link :to="`/post/${notif.post_id}`" class="btn btn-secondary btn-sm notif-action">
          Ver Comentario
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';

const notifications = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get('/users/me/notifications');
    notifications.value = res.data;
  } catch (e) {
    console.error('Error cargando notificaciones', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.notifications-container {
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notif-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid var(--primary);
  transition: transform 0.2s;
}

.notif-card:hover {
  transform: translateX(5px);
}

.notif-content {
  flex: 1;
}

.notif-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.05rem;
  color: var(--text-main);
}

.notif-message {
  margin: 0;
  font-style: italic;
  color: var(--text-muted);
  background-color: var(--background);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.notif-action {
  white-space: nowrap;
  margin-left: 1rem;
}

@media (max-width: 600px) {
  .notif-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .notif-action {
    margin-left: 0;
    width: 100%;
  }
}
</style>
