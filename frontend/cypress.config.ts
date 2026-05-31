import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    env: {
      apiUrl: 'http://localhost:3001',
    },
    supportFile: 'cypress/support/e2e.ts',
  },
});
