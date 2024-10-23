import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  base: "/Genshin-Impact-Domain-Randomizer/",
  build: {
    target: 'esnext',
  },
  server: {
    host: '0.0.0.0',
    open: true,
    port: 8000,
  },
});
