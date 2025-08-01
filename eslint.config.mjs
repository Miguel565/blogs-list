import globals from 'globals'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import stylisticJs from '@stylistic/eslint-plugin-js'

export default defineConfig([
  js.configs.recommended,
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs', ecmaVersion: 'latest' } },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: globals.node, ecmaVersion: 'latest' },
    plugins: { '@stylistic/js': stylisticJs },
    rules: {
      //'@stylistic/js/indent': ['error', 2],
      '@stylistic/js/linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
      eqeqeq: 'error',
      'no-trailing-spaces': 'error',
      'object-curly-spacing': ['error', 'always'],
      'arrow-spacing': ['error', { before: true, after: true }],
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
])