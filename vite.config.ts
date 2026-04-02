import { defineConfig } from 'vite';

export default defineConfig({
  base:   '/cork-cycle-adventure/',
  server: { port: 3000 },
  build:  { target: 'esnext' },
});
