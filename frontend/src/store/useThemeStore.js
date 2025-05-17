import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('soc-theme') || 'night',
  setTheme: (theme) => {
    localStorage.setItem('soc-theme', theme)
    set({ theme })
  }
}))