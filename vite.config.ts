import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: "/9digger.github.io/",
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
    open: true,
    port: 8000,
  },
});
