import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'logo.png', 'icon-192x192.png', 'icon-512x512.png'],
        workbox: {
          globPatterns: mode === 'production' ? ['**/*.{js,css,html,ico,png,svg}'] : [],
          maximumFileSizeToCacheInBytes: 3000000
        },
        manifest: {
          name: 'MemoryOS',
          short_name: 'MemoryOS',
          description: 'Your Immersive Knowledge Galaxy',
          start_url: '/login',
          theme_color: '#7F5AF0',
          background_color: '#000000',
          display: 'standalone',
          orientation: 'portrait',
          categories: ['productivity', 'utilities'],
          shortcuts: [
            {
              name: 'New Memory',
              short_name: 'New',
              description: 'Quickly save a new memory',
              url: '/save',
              icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'View Galaxy',
              short_name: 'Galaxy',
              description: 'Open your Knowledge Galaxy',
              url: '/galaxy',
              icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
            }
          ],
          icons: [
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
  }
})
