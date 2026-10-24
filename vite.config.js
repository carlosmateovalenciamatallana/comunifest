import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Comunifest',
        short_name: 'Comunifest',
        description: 'Somos una familia, un solo corazón.',
        theme_color: '#0f0f11',
        background_color: '#0f0f11',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-512x512.png', // Sigue usando el mismo nombre de archivo que tienes guardado
            sizes: '512x512',     // AQUÍ ESTÁ LA MAGIA: Le decimos su tamaño real
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ]
})