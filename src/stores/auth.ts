import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const storedUser = localStorage.getItem('user');
  const user = ref<any>(storedUser ? JSON.parse(storedUser) : null);

  function setToken(newToken: string) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function setUser(userData: any) {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, setToken, setUser, logout };
});
