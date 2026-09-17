/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH must match the GitHub Pages sub-path, e.g. "/spilab/".
const base = process.env.BASE_PATH ?? '/spilab/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
