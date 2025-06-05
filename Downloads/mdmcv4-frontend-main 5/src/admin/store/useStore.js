import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // État global
      user: null,
      theme: 'dark',
      sidebarOpen: true,
      
      // Actions
      setUser: (user) => set({ user }),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      // SmartLinks
      smartlinks: [],
      setSmartlinks: (smartlinks) => set({ smartlinks }),
      addSmartlink: (smartlink) => set((state) => ({
        smartlinks: [...state.smartlinks, smartlink]
      })),
      updateSmartlink: (id, data) => set((state) => ({
        smartlinks: state.smartlinks.map((sl) =>
          sl.id === id ? { ...sl, ...data } : sl
        )
      })),
      deleteSmartlink: (id) => set((state) => ({
        smartlinks: state.smartlinks.filter((sl) => sl.id !== id)
      })),
      
      // Artistes
      artists: [],
      setArtists: (artists) => set({ artists }),
      addArtist: (artist) => set((state) => ({
        artists: [...state.artists, artist]
      })),
      updateArtist: (id, data) => set((state) => ({
        artists: state.artists.map((a) =>
          a.id === id ? { ...a, ...data } : a
        )
      })),
      deleteArtist: (id) => set((state) => ({
        artists: state.artists.filter((a) => a.id !== id)
      })),
      
      // Analytics
      analyticsPeriod: '7d',
      setAnalyticsPeriod: (period) => set({ analyticsPeriod }),
      selectedSmartlinks: [],
      setSelectedSmartlinks: (smartlinks) => set({ selectedSmartlinks: smartlinks }),
      
      // UI State
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, notification]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),
    }),
    {
      name: 'mdmc-admin-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        analyticsPeriod: state.analyticsPeriod,
      }),
    }
  )
);

export default useStore; 