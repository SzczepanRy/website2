// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import TanStackRouterVite from '@tanstack/router-plugin/vite' // <-- Zwróć uwagę na ścieżkę i BRAK klamer {}

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // <-- Teraz powinno być czysto
    react(),
  ],
})
