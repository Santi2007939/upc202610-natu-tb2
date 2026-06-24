<template>
  <div class="profile-container">
    <div v-if="user" class="card profile-hero">
      <div class="profile-header">
        <div class="profile-avatar">
          {{ user.username.charAt(0).toUpperCase() }}
        </div>
        <div class="profile-info">
          <h1 class="profile-title">{{ isOwnProfile ? 'Mi Perfil' : `Perfil de ${user.username}` }}</h1>
          <p class="profile-username">@{{ user.username }}</p>
        </div>
      </div>

      <div class="profile-stats">
        <div class="stat-box">
          <span class="stat-label">Rol</span>
          <span class="badge" style="font-size: 0.9rem;">{{ user.role || 'Consumidor' }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">Reputación</span>
          <span class="stat-value text-success" style="font-size: 1.2rem; font-weight: bold;">{{ user.reputation_score || 0 }} pts</span>
        </div>
        <div v-if="user.badges && user.badges.length > 0" class="stat-box">
          <span class="stat-label">Medallas</span>
          <div class="badges-list">
            <span v-for="badge in user.badges" :key="badge" class="badge badge-alert" style="background-color: var(--secondary); color: var(--primary); border: none; display: flex; align-items: center; gap: 0.3rem;"><span class="material-icons" style="font-size: 1rem;">emoji_events</span> {{ badge }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="tabs-container">
      <button 
        @click="tab = 'posts'" 
        class="tab-btn"
        :class="{ active: tab === 'posts' }">
        {{ isOwnProfile ? 'Mis Publicaciones' : 'Publicaciones' }}
      </button>
      <button 
        @click="tab = 'comments'" 
        class="tab-btn"
        :class="{ active: tab === 'comments' }">
        {{ isOwnProfile ? 'Mis Comentarios' : 'Comentarios' }}
      </button>
    </div>
    
    <!-- Pestaña de Posts -->
    <div v-if="tab === 'posts'" class="tab-content">
      <div v-if="loadingPosts" class="text-center text-muted" style="padding: 2rem;">Cargando publicaciones...</div>
      <div v-else>
        <div v-if="posts.length === 0" class="card text-center text-muted">
          {{ isOwnProfile ? 'Aún no has creado' : 'El usuario no ha creado' }} ninguna publicación o alerta.
        </div>
        <div v-for="post in posts" :key="post._id" class="card post-card">
          <div class="flex-between" style="margin-bottom: 0.5rem;">
            <h3 class="post-title" style="font-size: 1.3rem;">
              {{ post.title }} 
              <span v-if="post.is_alert" class="badge badge-alert" style="font-size: 0.7rem; display: inline-flex; align-items: center; gap: 0.2rem;"><span class="material-icons" style="font-size: 0.8rem;">warning</span> Alerta</span>
            </h3>
            <button v-if="isOwnProfile" @click="deletePost(post._id)" class="btn-icon" :disabled="isDeleting === post._id" title="Eliminar Post" style="color: var(--danger);">
              <span class="material-icons">delete</span>
            </button>
          </div>
          <p class="post-content" style="margin-bottom: 1rem;">{{ post.content }}</p>
          <router-link :to="`/post/${post._id}`" class="btn btn-secondary btn-sm">Ver Hilo Completo</router-link>
        </div>
      </div>
    </div>
    
    <!-- Pestaña de Comentarios -->
    <div v-if="tab === 'comments'" class="tab-content">
      <div v-if="loadingComments" class="text-center text-muted" style="padding: 2rem;">Cargando comentarios...</div>
      <div v-else>
        <div v-if="comments.length === 0" class="card text-center text-muted">
          {{ isOwnProfile ? 'Aún no has comentado' : 'El usuario no ha comentado' }} en ningún post.
        </div>
        <div v-for="comment in comments" :key="comment._id" class="card comment-card">
          <p class="comment-content">{{ comment.content }}</p>
          <div v-if="comment.audio_evidence" class="media-attachment">
            <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.3rem;">Evidencia Adjunta:</p>
            <audio v-if="comment.audio_evidence.url.includes('.mp3') || comment.audio_evidence.url.includes('.webm') || comment.audio_evidence.url.includes('.mp4')" controls :src="comment.audio_evidence.url" style="height: 35px;"></audio>
            <img v-else :src="comment.audio_evidence.url" class="media-preview-sm" />
          </div>
          <router-link :to="`/post/${comment.post_id}`" class="post-link">Ir al Post Original ➔</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';

const route = useRoute();
const authStore = useAuthStore();
const user = ref<any>(null);
const tab = ref('posts');

const posts = ref<any[]>([]);
const comments = ref<any[]>([]);
const loadingPosts = ref(false);
const loadingComments = ref(false);
const isDeleting = ref<string | null>(null);

const targetUserId = computed(() => route.params.id || authStore.user?._id);
const isOwnProfile = computed(() => authStore.user && targetUserId.value === authStore.user._id);

async function deletePost(postId: string) {
  if (!confirm('¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.')) return;
  
  isDeleting.value = postId;
  try {
    await api.delete(`/posts/${postId}`);
    await loadUserPosts();
  } catch (e: any) {
    console.error('Error al eliminar post', e);
    alert(e.response?.data?.message || 'Error al eliminar el post');
  } finally {
    isDeleting.value = null;
  }
}

async function loadProfile() {
  if (targetUserId.value) {
    try {
      const res = await api.get(`/users/${targetUserId.value}/profile`);
      user.value = res.data;
    } catch (e) {
      console.error('Error cargando perfil', e);
      if (isOwnProfile.value) user.value = authStore.user;
    }
  }
}

async function loadUserPosts() {
  if (!targetUserId.value) return;
  loadingPosts.value = true;
  try {
    const res = await api.get(`/users/${targetUserId.value}/posts`);
    posts.value = res.data;
  } catch (e) {
    console.error('Error cargando historial de posts', e);
  } finally {
    loadingPosts.value = false;
  }
}

async function loadUserComments() {
  if (!targetUserId.value) return;
  loadingComments.value = true;
  try {
    const res = await api.get(`/users/${targetUserId.value}/comments`);
    comments.value = res.data;
  } catch (e) {
    console.error('Error cargando historial de comentarios', e);
  } finally {
    loadingComments.value = false;
  }
}

watch(tab, (newTab) => {
  if (newTab === 'posts' && posts.value.length === 0) {
    loadUserPosts();
  } else if (newTab === 'comments' && comments.value.length === 0) {
    loadUserComments();
  }
});

watch(() => route.params.id, () => {
  posts.value = [];
  comments.value = [];
  tab.value = 'posts';
  loadProfile();
  loadUserPosts();
});

onMounted(() => {
  loadProfile();
  loadUserPosts();
});
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-hero {
  border-top: 5px solid var(--primary);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background-color: var(--primary);
  color: var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-family: var(--font-heading);
  font-weight: bold;
}

.profile-title {
  margin: 0 0 0.2rem 0;
}

.profile-username {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin: 0;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.badges-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tabs-container {
  display: flex;
  gap: 1rem;
  border-bottom: 2px solid var(--border);
}

.tab-btn {
  background: none;
  border: none;
  padding: 0.8rem 1.5rem;
  font-family: var(--font-body);
  font-size: 1.05rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn:hover {
  color: var(--primary);
  background-color: rgba(50, 72, 51, 0.05);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.tab-btn.active {
  color: var(--primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--primary);
  border-radius: 3px 3px 0 0;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  border-left: 4px solid var(--primary);
}

.comment-content {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.media-attachment {
  background-color: var(--background);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  display: inline-block;
}

.media-preview-sm {
  max-width: 150px;
  border-radius: var(--radius-sm);
}

.post-link {
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.post-link:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .profile-stats {
    gap: 1rem;
    justify-content: space-between;
  }
}
</style>
