import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // En Cloudflare, las env vars están en process.env
  const apiKey = process.env.GEMINI_API_KEY || '';
  
  // Log para debug (se verá en el build log de Cloudflare)
  console.log('🔑 GEMINI_API_KEY configurada:', apiKey ? 'SÍ (longitud: ' + apiKey.length + ')' : 'NO ❌');
  
  return {
    plugins: [react()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    publicDir: 'public',
  };
});
