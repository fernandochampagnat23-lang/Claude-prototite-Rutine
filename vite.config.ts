import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// BASE_PATH permite publicar en GitHub Pages bajo /<repo>/. En Vercel o local queda en "/".
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      includeAssets: ['icons/favicon-32.png', 'icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'Rutina L5 · Gimnasio cuidando la espalda',
        short_name: 'Rutina L5',
        description: 'Seguimiento de rutina de gimnasio adaptada a protrusión discal L5-S1, con registro de dolor.',
        lang: 'es',
        dir: 'ltr',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0b0f14',
        theme_color: '#0b0f14',
        categories: ['health', 'fitness'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Todo se guarda en caché al instalar: la app funciona sin internet desde la primera carga.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,webp,gif,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: { host: true },
});
