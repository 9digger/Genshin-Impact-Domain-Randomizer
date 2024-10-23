import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
  server: {
    host: '0.0.0.0',
    open: true,
    port: 8000,
  },
});
