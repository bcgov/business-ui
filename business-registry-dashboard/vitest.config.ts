import { fileURLToPath } from 'node:url'
import path from 'path'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    dir: 'tests',
    coverage: {
      provider: 'v8',
      reportsDirectory: path.resolve(__dirname, 'tests/coverage'), // This ensures an absolute path,
      include: [
        'pages/**',
        'layouts/**',
        'components/**',
        'composables/**',
        'utils/**',
        'services/**',
        'plugins/**',
        'stores/**'
      ]
    },
    includeSource: ['../pages/index.vue'],
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('./', import.meta.url)),
        domEnvironment: 'happy-dom'
        // overrides: {
        //   plugins: [
        //     mockedKeycloak, 'keycloak'
        //   ]
        // }
        // mock: {
        //   indexedDb: true,
        // },
      }
    },
    // setupFiles: './tests/setup/i18n.ts',
    globals: true
  }
})
