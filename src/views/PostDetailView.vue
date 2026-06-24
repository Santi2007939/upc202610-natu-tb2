<template>
  <div class="detail-container">
    <!-- Encabezado del Producto/Post -->
    <div v-if="post" class="card post-hero">
      <div class="flex-between" style="margin-bottom: 1rem;">
        <h1 class="post-hero-title">
          <span v-if="post.is_alert" class="badge badge-alert" style="font-size: 1rem; padding: 0.3rem 0.8rem;"><span class="material-icons icon-sm">warning</span> Alerta de Greenwashing</span>
          <span v-else class="badge" style="font-size: 1rem; padding: 0.3rem 0.8rem;"><span class="material-icons icon-sm">eco</span> Reseña Comunitaria</span>
        </h1>
        
        <button 
          v-if="authStore.user && post.user_id && post.user_id._id === authStore.user._id" 
          @click="deletePost" 
          :disabled="isDeleting"
          class="btn btn-danger btn-sm">
          <span class="material-icons icon-sm">delete</span> {{ isDeleting ? 'Borrando...' : 'Eliminar' }}
        </button>
      </div>

      <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--text-main);">{{ post.title }}</h2>
      <p style="font-size: 1.15rem; line-height: 1.7; margin-bottom: 1.5rem;">{{ post.content }}</p>
      
      <!-- Simulación de Producto / Evidencia -->
      <div v-if="post.product_id" class="product-anchor">
        <span class="material-icons" style="font-size: 1.2rem; color: var(--primary); vertical-align: bottom;">sell</span> 
        <strong>Producto Anclado:</strong> 
        <span v-if="post.product_id.name">{{ post.product_id.name }} ({{ post.product_id.brand }})</span>
        <span v-else>{{ post.product_id }}</span>
      </div>
      
      <div v-if="post.media" class="media-container">
        <p class="text-muted" style="margin-bottom: 0.5rem; font-weight: 500;">Evidencia Adjunta:</p>
        <img v-if="post.media.type === 'image'" :src="post.media.url" class="media-preview" />
        <video v-if="post.media.type === 'video'" :src="post.media.url" controls class="media-preview"></video>
      </div>
    </div>
    <div v-else class="card text-center" style="padding: 3rem;">
      <p class="text-muted">Cargando información del post...</p>
    </div>

    <!-- Hilo de Comentarios -->
    <div class="comments-section">
      <h3 style="margin-bottom: 1.5rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span class="material-icons">forum</span> Hilo de Comentarios ({{ comments.length }})
      </h3>
      
      <div class="comments-list">
        <div v-if="comments.length === 0" class="text-center text-muted" style="padding: 2rem 0;">
          No hay comentarios aún. ¡Sé el primero!
        </div>
        
        <div v-for="comment in comments" :key="comment._id" class="comment-card" :class="{'nested-comment': comment.parent_comment_id}">
          <div class="comment-author">
            <router-link v-if="comment.user_id" :to="`/profile/${comment.user_id._id}`" class="author-link">
              @{{ comment.user_id.username }}
            </router-link>
            <span v-else>@Usuario</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          
          <button @click="setReply(comment)" class="btn btn-sm btn-secondary" style="margin-bottom: 0.5rem;">
            <span class="material-icons icon-sm">reply</span> Responder
          </button>
          
          <!-- Evidencia Multimedia en el Comentario -->
          <div v-if="comment.audio_evidence && comment.audio_evidence.url" class="comment-audio">
            <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 0.3rem; display: flex; align-items: center; gap: 0.3rem;"><span class="material-icons" style="font-size: 1rem;">mic</span> Nota de Voz:</p>
            <audio controls :src="comment.audio_evidence.url" style="height: 40px; width: 100%; max-width: 300px;"></audio>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Formulario para Añadir Comentario -->
    <div class="card add-comment-form" id="comment-form">
      <h4 style="margin-bottom: 1rem;">
        {{ replyTo ? `Respondiendo a @${replyTo.user_id?.username || 'Usuario'}` : 'Añadir un Comentario' }}
        <button v-if="replyTo" @click="replyTo = null" class="btn btn-sm btn-danger" style="margin-left: 1rem; padding: 0.2rem 0.5rem; font-size: 0.8rem;">Cancelar</button>
      </h4>
      <form @submit.prevent="addComment">
        <div class="form-group">
          <textarea class="form-input" v-model="newComment" placeholder="Escribe tu comentario aquí..." required></textarea>
        </div>
        
        <!-- Grabadora de Audio Nativa -->
        <div class="recorder-container">
          <p class="recorder-title" style="display: flex; align-items: center; gap: 0.3rem;"><span class="material-icons" style="font-size: 1rem;">mic</span> Grabar Nota de Voz (Opcional)</p>
          
          <div class="recorder-actions">
            <button type="button" @click="startRecording" :disabled="isRecording" class="btn btn-sm" :style="isRecording ? 'background: #ccc' : 'background: #d32f2f; color: white'">
              <span class="material-icons icon-sm">fiber_manual_record</span> Grabar
            </button>
            <button type="button" @click="stopRecording" :disabled="!isRecording" class="btn btn-secondary btn-sm">
              <span class="material-icons icon-sm">stop</span> Detener
            </button>
            <span v-if="isRecording" class="recording-indicator">Grabando...</span>
          </div>

          <div v-if="audioBlobUrl" class="audio-preview">
            <audio :src="audioBlobUrl" controls style="height: 40px;"></audio>
            <button type="button" @click="discardAudio" class="btn btn-danger btn-sm" style="padding: 0.2rem 0.5rem; font-size: 0.8rem;"><span class="material-icons icon-sm">delete</span> Descartar</button>
          </div>
        </div>

        <!-- Subida de Archivo (Alternativa) -->
        <div v-if="!audioBlobUrl && !isRecording" class="file-upload-container">
          <label class="form-label" style="font-size: 0.9rem;">O adjuntar una Imagen (Opcional):</label>
          <label class="custom-file-upload">
            <span class="material-icons">image</span> {{ file ? file.name : 'Subir imagen' }}
            <input type="file" @change="onFileChange" accept="image/*" />
          </label>
        </div>

        <button type="submit" :disabled="uploading" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
          {{ uploading ? 'Procesando y publicando...' : 'Publicar Comentario' }}
        </button>
      </form>
      <p v-if="error" style="color: var(--danger); margin-top: 1rem; text-align: center; font-weight: 500;">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const post = ref<any>(null);
const comments = ref<any[]>([]);
const newComment = ref('');
const replyTo = ref<any>(null);

function setReply(comment: any) {
  replyTo.value = comment;
  document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
}

// Variables para la API de Grabación de Audio
const isRecording = ref(false);
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<BlobPart[]>([]);
const audioBlob = ref<Blob | null>(null);
const audioBlobUrl = ref<string | null>(null);

// Variables para el Archivo tradicional
const file = ref<File | null>(null);

const uploading = ref(false);
const error = ref('');
const isDeleting = ref(false);

function onFileChange(e: any) {
  file.value = e.target.files[0] || null;
}

// Inicializar la grabación desde el micrófono del usuario
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.value = new MediaRecorder(stream);
    
    audioChunks.value = [];
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      const mimeType = mediaRecorder.value?.mimeType || 'audio/webm';
      audioBlob.value = new Blob(audioChunks.value, { type: mimeType });
      audioBlobUrl.value = URL.createObjectURL(audioBlob.value);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
  } catch (err) {
    console.error("No se pudo acceder al micrófono:", err);
    alert("Por favor, permite el acceso al micrófono de tu navegador.");
  }
}

function stopRecording() {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
    isRecording.value = false;
  }
}

function discardAudio() {
  audioBlob.value = null;
  if (audioBlobUrl.value) {
    URL.revokeObjectURL(audioBlobUrl.value);
    audioBlobUrl.value = null;
  }
  audioChunks.value = [];
}

async function loadData() {
  const postId = route.params.id;
  try {
    // Usar el endpoint de feed ya que no tenemos GET /posts/:id expuesto al front (el server sí lo tiene, pero prefiero simular con el feed como antes si falla)
    const res = await api.get(`/posts/${postId}`);
    post.value = res.data;
  } catch (e) {
    console.warn('Fallback a feed', e);
    const feedRes = await api.get('/posts/feed');
    const foundPost = feedRes.data.find((p: any) => p._id === postId);
    if (foundPost) post.value = foundPost;
  }
  
  try {
    const res = await api.get(`/comments/post/${postId}`);
    comments.value = res.data;
  } catch (e) {
    console.error('Error cargando comentarios', e);
  }
}

async function deletePost() {
  if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;
  
  isDeleting.value = true;
  const postId = route.params.id;
  try {
    await api.delete(`/posts/${postId}`);
    router.push('/');
  } catch (e: any) {
    console.error('Error al eliminar post', e);
    alert(e.response?.data?.message || 'Error al eliminar el post');
    isDeleting.value = false;
  }
}

async function addComment() {
  uploading.value = true;
  error.value = '';
  const postId = route.params.id;

  try {
    let mediaUrl = null;

    if (audioBlob.value) {
      const ext = audioBlob.value.type.includes('mp4') ? 'mp4' : 'webm';
      const filename = `voice_note_${Date.now()}.${ext}`;

      const presignedRes = await api.post('/media/presigned-url', {
        filename: filename,
        contentType: audioBlob.value.type
      });
      const { uploadUrl, finalCdnUrl } = presignedRes.data;

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': audioBlob.value.type
        },
        body: audioBlob.value
      });

      mediaUrl = finalCdnUrl;
    } else if (file.value) {
      const presignedRes = await api.post('/media/presigned-url', {
        filename: file.value.name,
        contentType: file.value.type
      });
      const { uploadUrl, finalCdnUrl } = presignedRes.data;

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.value.type
        },
        body: file.value
      });

      mediaUrl = finalCdnUrl;
    }

    const payload: any = {
      post_id: postId,
      content: newComment.value
    };

    if (replyTo.value) {
      payload.parent_comment_id = replyTo.value._id;
    }

    if (mediaUrl) {
      payload.audio_evidence = { url: mediaUrl };
    }

    await api.post('/comments', payload);
    
    newComment.value = '';
    file.value = null;
    replyTo.value = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    
    discardAudio();
    loadData();
  } catch (e: any) {
    console.error(e);
    error.value = e.response?.data?.message || 'Error al publicar';
  } finally {
    uploading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post-hero {
  border-top: 4px solid var(--primary);
}

.post-hero-title {
  margin: 0;
}

.product-anchor {
  background-color: var(--background);
  padding: 0.8rem 1.2rem;
  border-radius: var(--radius-sm);
  margin-top: 1rem;
  border-left: 3px solid var(--primary);
}

.media-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--background);
  border-radius: var(--radius-md);
  text-align: center;
}

.media-preview {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-1);
}

.comments-section {
  margin-top: 1rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background-color: var(--surface);
  padding: 1.2rem;
  border-radius: var(--radius-md);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
  border-left: 4px solid var(--secondary);
}

.nested-comment {
  margin-left: 3rem;
  border-left: 3px solid var(--border);
  background-color: #F8F8F8;
  padding: 1rem;
}

@media (max-width: 600px) {
  .nested-comment {
    margin-left: 1rem;
  }
}

.comment-author {
  margin-bottom: 0.5rem;
}

.author-link {
  font-weight: 600;
  color: var(--primary);
  font-family: var(--font-heading);
}

.comment-content {
  color: var(--text-main);
  line-height: 1.5;
}

.comment-audio {
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px dashed var(--border);
}

.add-comment-form {
  background-color: #FAFAFA;
}

.recorder-container {
  border: 1px solid var(--border);
  padding: 1rem;
  border-radius: var(--radius-md);
  background-color: var(--surface);
  margin-bottom: 1rem;
}

.recorder-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.8rem;
}

.recorder-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.recording-indicator {
  color: var(--danger);
  font-weight: bold;
  animation: blink 1.5s infinite;
  font-size: 0.9rem;
}

.audio-preview {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-upload-container {
  padding: 0.5rem 0;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
