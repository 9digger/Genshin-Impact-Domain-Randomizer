import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  assetsInclude: [
    '**/*.png',
    '**/*.svg',
    '**/*.woff',
    '**/*.woff2',
  ],
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
    open: true,
    port: 8000,
  },
});
