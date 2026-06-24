<template>
  <div class="create-container">
    <div class="flex-between" style="margin-bottom: 1.5rem;">
      <h1>Crear Publicación / Alerta</h1>
    </div>

    <div class="card">
      <form @submit.prevent="submitPost" class="create-form">
        
        <div class="form-group">
          <label class="form-label">Título</label>
          <input v-model="form.title" type="text" class="form-input" placeholder="Ej: Nueva certificación descubierta..." required />
        </div>
        
        <div class="form-group">
          <label class="form-label">Contenido</label>
          <textarea v-model="form.content" class="form-input" placeholder="Detalla tu reseña o alerta..." required></textarea>
        </div>

        <!-- Buscador de Productos -->
        <div v-if="!form.is_alert" class="search-section">
          <label class="form-label">Buscar Producto Certificado (Requerido)</label>
          <div style="display: flex; gap: 10px; margin-bottom: 1rem;">
            <input v-model="searchQuery" type="text" class="form-input" placeholder="Ej: Jabón de Avena..." @keyup.enter="searchProducts" />
            <button type="button" @click="searchProducts" class="btn btn-secondary">Buscar</button>
          </div>
          
          <div v-if="searchResults.length > 0" class="results-container">
            <p class="text-muted" style="margin-bottom: 0.5rem; font-weight: 500;">Selecciona un producto:</p>
            <div class="radio-group">
              <label v-for="prod in searchResults" :key="prod._id" class="radio-label">
                <input type="radio" :value="prod._id" v-model="form.product_id" name="product" />
                <span class="radio-text">{{ prod.name }} <span class="text-muted">({{ prod.brand }})</span></span>
              </label>
            </div>
          </div>

          <div class="alert-prompt">
            <p class="text-muted" style="margin-bottom: 0.5rem;">¿No encuentras el producto?</p>
            <button type="button" @click="forceAlert" class="btn btn-danger" style="width: 100%;">
              Reportar como producto no listado (Crear Alerta)
            </button>
          </div>
        </div>

        <!-- Formulario de Alerta -->
        <div v-if="form.is_alert" class="alert-section">
          <div class="flex-between">
            <h3 style="color: var(--danger); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><span class="material-icons">warning</span> Reportando Alerta de Greenwashing</h3>
            <button type="button" @click="cancelAlert" class="btn btn-secondary btn-sm">Volver a reseñas</button>
          </div>
          
          <div class="form-group">
            <label class="form-label" style="color: var(--danger);">Motivo de la sospecha</label>
            <input v-model="form.suspicious_product_data.reason" type="text" class="form-input alert-input" placeholder="Ej: Falso certificado ecológico en la etiqueta" required />
          </div>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label">Evidencia (Imagen)</label>
          <label class="custom-file-upload">
            <span class="material-icons">image</span> {{ file ? file.name : 'Subir imagen' }}
            <input type="file" @change="onFileChange" accept="image/*" />
          </label>
        </div>
        
        <button type="submit" :disabled="uploading" class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.8rem; font-size: 1.1rem;">
          {{ uploading ? 'Subiendo y Publicando...' : 'Publicar' }}
        </button>
      </form>
      
      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const form = reactive({
  title: '',
  content: '',
  is_alert: false,
  product_id: '',
  suspicious_product_data: { reason: '' }
});

const file = ref<File | null>(null);
const uploading = ref(false);
const error = ref('');

// Product Search State
const searchQuery = ref('');
const searchResults = ref<any[]>([]);

async function searchProducts() {
  if (!searchQuery.value) return;
  try {
    const res = await api.get(`/products/search?q=${searchQuery.value}`);
    searchResults.value = res.data;
  } catch (e) {
    console.error(e);
  }
}

function forceAlert() {
  form.is_alert = true;
  form.product_id = ''; // Limpiar si había algo
}

function cancelAlert() {
  form.is_alert = false;
  form.suspicious_product_data.reason = '';
}

function onFileChange(e: any) {
  file.value = e.target.files[0] || null;
}

async function submitPost() {
  if (!form.is_alert && !form.product_id) {
    error.value = "Debes seleccionar un producto o crear una alerta.";
    return;
  }

  uploading.value = true;
  error.value = '';
  try {
    let mediaData = null;

    if (file.value) {
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

      mediaData = {
        type: file.value.type.startsWith('video') ? 'video' : 'image',
        url: finalCdnUrl
      };
    }

    const postPayload: any = {
      title: form.title,
      content: form.content,
      is_alert: form.is_alert,
    };
    if (form.is_alert) {
      postPayload.suspicious_product_data = form.suspicious_product_data;
    } else {
      postPayload.product_id = form.product_id;
    }
    if (mediaData) {
      postPayload.media = mediaData;
    }

    await api.post('/posts', postPayload);
    router.push('/');
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Error al publicar';
  } finally {
    uploading.value = false;
  }
}
</script>

<style scoped>
.create-container {
  display: flex;
  flex-direction: column;
  max-width: 700px;
  margin: 0 auto;
}

.create-form {
  display: flex;
  flex-direction: column;
}

.search-section {
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: var(--background);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.results-container {
  background-color: var(--surface);
  padding: 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s;
}

.radio-label:hover {
  background-color: var(--background);
}

.radio-text {
  font-size: 1rem;
  color: var(--text-main);
}

.alert-prompt {
  border-top: 1px dashed var(--border);
  padding-top: 1.5rem;
}

.alert-section {
  margin-top: 1rem;
  padding: 1.5rem;
  background-color: rgba(211, 47, 47, 0.05);
  border: 1px solid var(--danger);
  border-radius: var(--radius-md);
}

.alert-input {
  border-color: rgba(211, 47, 47, 0.3);
}

.alert-input:focus {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.1);
}

.file-upload-wrapper {
  background-color: var(--background);
  border-radius: var(--radius-sm);
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
</style>
