// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import TanStackRouterVite from "@tanstack/router-plugin/vite"; // <-- Zwróć uwagę na ścieżkę i BRAK klamer {}

export default defineConfig({
  plugins: [
    TanStackRouterVite(), // <-- Teraz powinno być czysto
    react(),
  ],
  server: {
    proxy: {
      // Każde zapytanie zaczynające się od /api (lub innej ścieżki)
      // Vite automatycznie prześle do Go na port 8080
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // Opcjonalnie: jeśli Twoje endpointy w Go nie mają prefixu /api
      },
    },
  },
});
