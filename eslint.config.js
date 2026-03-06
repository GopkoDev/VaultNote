import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  prettierConfig,
  // ─── Server ───────────────────────────────────────────────────────────────
  {
    files: ['server/src/**/*.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './server/tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  // ─── Client ───────────────────────────────────────────────────────────────
  {
    files: ['client/src/**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // ─── Ignores ──────────────────────────────────────────────────────────────
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/dist-ssr/**'],
  }
);
