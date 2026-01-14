import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'www',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '../www-built',
    target: 'es2020',
    minify: 'terser'
  }
});
