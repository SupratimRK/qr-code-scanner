import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true, // Expose to all network interfaces
    port: 5173, // Optional: specify a port (default is 5173)
    open: true, // Optional: open browser automatically
  },
});