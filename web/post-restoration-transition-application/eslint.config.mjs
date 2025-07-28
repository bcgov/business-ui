// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  files: ['**/*.ts', '**/*.vue'],
  rules: {
    'no-console': ['error', { allow: ['info', 'error', 'warn'] }],
    'no-debugger': 'off',
    'max-len': ['warn',
      {
        code: 120,
        ignoreRegExpLiterals: true,
        ignoreTrailingComments: true
      }
    ],
    'allow-parens': 'off',
    'curly': 'error',
    'import/order': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': 'error',
    'nuxt/nuxt-config-keys-order': 'off',
    'vue/max-attributes-per-line': ['error', { singleline: { max: 2 }, multiline: { max: 1 } }],
    'vue/multi-word-component-names': 'off',
    'vue/use-v-on-exact': 'off',
    'vue/array-bracket-spacing': 'warn',
    'vue/array-bracket-newline': 'warn',
    'vue/attributes-order': 'warn',
    'vue/comma-dangle': 'warn',
    'vue/component-api-style': 'error',
    'vue/html-indent': 'warn',
    'vue/script-indent': 'warn',
    '@stylistic/brace-style': 'off',
    '@stylistic/indent': 'off',
    '@stylistic/indent-binary-ops': 'off'
  }
})
