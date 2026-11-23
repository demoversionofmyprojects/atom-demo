import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — щоб збірку можна було розмістити в будь-якій підпапці хостингу
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { host: true, port: 5173 },
});
