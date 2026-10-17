import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Register a new user
      register: async ({ name, email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.register({ name, email, password });
          const { user, token } = res.data.data;
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { success: true };
        } catch (err) {
          let message = 'Registration failed';
          if (err.response?.data?.details?.length) {
            message = err.response.data.details.map((d) => d.message).join('. ');
          } else if (err.response?.data?.error) {
            message = err.response.data.error;
          } else if (err.code === 'ERR_NETWORK' || !err.response) {
            message = 'Cannot reach backend server. Please verify the server is running on http://localhost:5000.';
          } else if (err.message) {
            message = err.message;
          }
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Log in with email/password
      login: async ({ email, password }) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authAPI.login({ email, password });
          const { user, token } = res.data.data;
          set({ user, token, isAuthenticated: true, isLoading: false, error: null });
          return { success: true };
        } catch (err) {
          let message = 'Login failed';
          if (err.response?.data?.details?.length) {
            message = err.response.data.details.map((d) => d.message).join('. ');
          } else if (err.response?.data?.error) {
            message = err.response.data.error;
          } else if (err.code === 'ERR_NETWORK' || !err.response) {
            message = 'Cannot reach backend server. Please verify the server is running on http://localhost:5000.';
          } else if (err.message) {
            message = err.message;
          }
          set({ isLoading: false, error: message });
          return { success: false, error: message };
        }
      },

      // Fetch current user profile
      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await authAPI.getProfile();
          set({ user: res.data.data.user, isAuthenticated: true });
        } catch (err) {
          // Token expired or invalid
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      // Log out
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
