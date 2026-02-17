import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🎯 BASE PATH per subfolder
  base: '/experiments/tropical-island/',
  
  // 📦 Build ottimizzato
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    
    // Chunk size warnings
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'react-vendor': ['react', 'react-dom'],
          'drei': ['@react-three/drei'],
          'fiber': ['@react-three/fiber'],
          'rapier': ['@react-three/rapier'],
        }
      }
    }
  }
});
