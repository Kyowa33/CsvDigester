import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // or 'prompt'
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{html,css,js,jsx,ts,tsx,ico,png,svg,json,webmanifest}'], 
      },
      manifest: {
        name: 'Offline CSV Digester',
        short_name: 'CsvDigester',
        description: 'Encrypt / Decrypt CSV files',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});