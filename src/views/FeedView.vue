<template>
  <div class="feed-container">
    <div class="flex-between" style="margin-bottom: 2rem;">
      <h1>Feed de la Comunidad</h1>
    </div>

    <!-- Toast de Notificación -->
    <div v-if="toastMessage" class="toast-notification">
      {{ toastMessage }}
    </div>
    
    <div class="search-bar card">
      <input class="form-input" v-model="searchQuery" placeholder="Buscar por marca o ingredientes..." @keyup.enter="searchProducts" />
      <button class="btn btn-primary" @click="searchProducts" style="margin-top: 10px;">Buscar Productos</button>
    </div>
    
    <div v-if="loading" class="text-center" style="padding: 2rem;">
      <p class="text-muted">Cargando feed ecológico...</p>
    </div>
    <div v-else class="post-list">
      <div v-if="posts.length === 0" class="card text-center">No hay publicaciones recientes.</div>
      
      <div v-for="post in posts" :key="post._id" class="card post-card">
        <div class="post-header">
          <router-link v-if="post.user_id" :to="`/profile/${post.user_id._id}`" class="post-author">
            @{{ post.user_id.username }}
          </router-link>
          <span v-else class="post-author">@Usuario</span>
          <span class="text-muted" style="font-size: 0.85rem;">{{ new Date(post.created_at).toLocaleDateString() }}</span>
        </div>

        <h3 class="post-title">
          {{ post.title }} 
          <span v-if="post.is_alert" class="badge badge-alert"><span class="material-icons icon-sm" style="font-size: 1rem;">warning</span> ALERTA</span>
          <span v-else class="badge"><span class="material-icons icon-sm" style="font-size: 1rem;">eco</span> RESEÑA</span>
        </h3>
        
        <p class="post-content">{{ post.content }}</p>
        
        <div v-if="post.media" class="post-media">
          <img v-if="post.media.type === 'image'" :src="post.media.url" alt="Evidencia" class="media-img" />
          <video v-if="post.media.type === 'video'" :src="post.media.url" controls class="media-video"></video>
        </div>
        
        <div class="post-actions">
          <div class="vote-group" :class="{'has-voted': post.voted_by?.includes(authStore.user?._id)}">
            <button class="btn-icon vote-up" @click="vote(post._id, 'upvote')" title="Upvote">
              <span class="material-icons">thumb_up</span>
            </button>
            <span class="vote-count" :class="{'text-success': post.votes?.net_score > 0, 'text-danger': post.votes?.net_score < 0}">
              {{ post.votes?.net_score || 0 }}
            </span>
            <button class="btn-icon vote-down" @click="vote(post._id, 'downvote')" title="Downvote">
              <span class="material-icons">thumb_down</span>
            </button>
          </div>
          
          <router-link :to="`/post/${post._id}`" class="btn btn-secondary btn-sm">
            <span class="material-icons icon-sm">chat_bubble</span> Hilo de Comentarios
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const posts = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const toastMessage = ref('');

function showToast(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => { toastMessage.value = ''; }, 3000);
}

async function loadFeed() {
  loading.value = true;
  try {
    const res = await api.get('/posts/feed');
    posts.value = res.data;
  } catch (e) {
    console.error('Error cargando feed', e);
  } finally {
    loading.value = false;
  }
}

async function searchProducts() {
  if (!searchQuery.value) return loadFeed();
  try {
    const res = await api.get(`/products/search?q=${searchQuery.value}`);
    console.log('Resultados de productos:', res.data);
    alert('Busqueda realizada. Revisar consola para productos. (En integración total esto filtraría el feed)');
  } catch (e) {
    console.error(e);
  }
}

async function vote(postId: string, type: string) {
  try {
    const res = await api.post(`/posts/${postId}/vote`, { voteType: type });
    // Update local post score
    const index = posts.value.findIndex(p => p._id === postId);
    if (index !== -1) {
      posts.value[index].votes = res.data.votes;
      posts.value[index].voted_by = res.data.voted_by; // Update local voted_by array
    }
  } catch (e: any) {
    console.error(e);
    showToast(e.response?.data?.message || 'Error al votar');
  }
}

onMounted(() => {
  loadFeed();
});
</script>

<style scoped>
.feed-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-bar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.post-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.post-author {
  font-weight: 600;
  color: var(--primary);
}

.post-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 1.4rem;
  margin: 0;
}

.post-content {
  font-size: 1.05rem;
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-media {
  margin-top: 0.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  max-height: 400px;
  display: flex;
  justify-content: center;
  background: #000;
}

.media-img, .media-video {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border);
}

.vote-group {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background-color: var(--background);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-full);
  transition: all 0.3s ease;
}

.vote-group.has-voted {
  background-color: rgba(50, 72, 51, 0.1); /* Primary color low opacity */
  border: 1px solid var(--primary);
}

.vote-group.has-voted .btn-icon {
  color: var(--primary);
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.btn-icon:hover {
  transform: scale(1.1);
  background-color: rgba(0,0,0,0.05);
}

.vote-count {
  font-weight: 700;
  font-size: 1.1rem;
  min-width: 24px;
  text-align: center;
}

.text-success { color: var(--success); }
.text-danger { color: var(--danger); }
.text-center { text-align: center; }

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
}

.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: var(--danger);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-2);
  z-index: 1000;
  font-weight: 600;
  animation: slideIn 0.3s ease forwards;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
</style>
