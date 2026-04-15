import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno desde archivos .env
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
  
  // Log para debug (se verá en el build log de Cloudflare)
  console.log('🔑 GEMINI_API_KEY configurada:', apiKey ? 'SÍ (longitud: ' + apiKey.length + ')' : 'NO ❌');
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey),
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
