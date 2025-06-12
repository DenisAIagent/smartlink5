import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../config/constants';

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // État de l'authentification
        auth: {
          isAuthenticated: false,
          user: null,
          role: null,
        },

        // État de l'interface utilisateur
        ui: {
          theme: 'light',
          language: 'fr',
          notifications: [],
          isLoading: false,
          sidebarOpen: false,
        },

        // État du cache
        cache: {
          data: new Map(),
          timestamp: Date.now(),
        },

        // Actions d'authentification
        setAuth: (auth) => set((state) => ({ auth: { ...state.auth, ...auth } })),
        clearAuth: () => set((state) => ({ auth: { isAuthenticated: false, user: null, role: null } })),

        // Actions UI
        setTheme: (theme) => set((state) => ({ ui: { ...state.ui, theme } })),
        setLanguage: (language) => set((state) => ({ ui: { ...state.ui, language } })),
        addNotification: (notification) => 
          set((state) => ({ 
            ui: { 
              ...state.ui, 
              notifications: [...state.ui.notifications, { ...notification, id: Date.now() }] 
            } 
          })),
        removeNotification: (id) =>
          set((state) => ({
            ui: {
              ...state.ui,
              notifications: state.ui.notifications.filter((n) => n.id !== id),
            },
          })),
        setLoading: (isLoading) => set((state) => ({ ui: { ...state.ui, isLoading } })),
        toggleSidebar: () => set((state) => ({ ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } })),

        // Actions de cache
        setCacheData: (key, data) =>
          set((state) => ({
            cache: {
              ...state.cache,
              data: new Map(state.cache.data).set(key, {
                data,
                timestamp: Date.now(),
              }),
            },
          })),
        getCacheData: (key) => {
          const cache = get().cache;
          const cachedItem = cache.data.get(key);
          if (!cachedItem) return null;

          const isExpired = Date.now() - cachedItem.timestamp > 5 * 60 * 1000; // 5 minutes
          if (isExpired) {
            cache.data.delete(key);
            return null;
          }

          return cachedItem.data;
        },
        clearCache: () =>
          set((state) => ({
            cache: {
              data: new Map(),
              timestamp: Date.now(),
            },
          })),
      }),
      {
        name: STORAGE_KEYS.APP_STATE,
        partialize: (state) => ({
          ui: {
            theme: state.ui.theme,
            language: state.ui.language,
          },
        }),
      }
    )
  )
);

export default useStore; 