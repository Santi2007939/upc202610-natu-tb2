import { createRouter, createWebHistory } from 'vue-router';
import FeedView from '../views/FeedView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'feed',
      component: FeedView
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/create-post',
      name: 'create-post',
      component: () => import('../views/CreatePostView.vue')
    },
    {
      path: '/profile/:id?',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue')
    },
    {
      path: '/post/:id',
      name: 'post-detail',
      component: () => import('../views/PostDetailView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
});

// Guardián de navegación: Bloquear rutas privadas si no hay sesión
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register', '/not-found'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token'); // Verificamos directamente el token en LocalStorage

  if (authRequired && !loggedIn) {
    // Si la ruta requiere autenticación y no hay token, redirigir a Login
    return next('/login');
  }

  // De lo contrario, permitir el paso
  next();
});

export default router;
