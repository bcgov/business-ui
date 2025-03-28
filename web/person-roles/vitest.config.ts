import { createResolver } from 'nuxt/kit'
import { defineVitestConfig } from '@nuxt/test-utils/config'

const { resolve } = createResolver(import.meta.url)

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    dir: 'tests',
    coverage: {
      provider: 'v8',
      reportsDirectory: resolve('./tests/unit/coverage'), // This ensures an absolute path,
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
    environmentOptions: {
      nuxt: {
        rootDir: resolve('./'),
        domEnvironment: 'happy-dom'
      }
    },
    setupFiles: resolve('./tests/unit/setup.ts'),
    globals: true
  }
})
