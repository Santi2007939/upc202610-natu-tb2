<template>
  <div class="not-found-container card text-center">
    <div class="icon-container">
      <span class="material-icons" style="font-size: 5rem; color: var(--primary);">eco</span>
    </div>
    <h1 style="font-size: 4rem; margin: 0; color: var(--primary);">404</h1>
    <h2>Ups... ¡Parece que te has perdido en el bosque!</h2>
    <p class="text-muted" style="margin-bottom: 2rem;">La página que estás buscando no existe o ha sido movida.</p>
    
    <router-link to="/" class="btn btn-primary" style="padding: 0.8rem 2rem; font-size: 1.1rem;">
      <span class="material-icons" style="margin-right: 0.5rem;">home</span> Volver al Inicio
    </router-link>
  </div>
</template>

<style scoped>
.not-found-container {
  max-width: 600px;
  margin: 4rem auto;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.icon-container {
  background-color: var(--secondary);
  border-radius: 50%;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}
</style>
