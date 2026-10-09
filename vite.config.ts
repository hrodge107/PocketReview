import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'PocketReview phone setup',
        short_name: 'PocketReview',
        description: 'Local AI feasibility check for an offline photo reviewer.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#faf6ed',
        theme_color: '#faf6ed',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        cacheId: 'pocketreview-shell',
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  worker: { format: 'es' },
});
