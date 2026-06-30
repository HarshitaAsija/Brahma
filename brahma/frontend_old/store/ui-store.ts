import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))