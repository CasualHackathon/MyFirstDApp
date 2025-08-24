import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  // 基础 JavaScript 推荐规则
  js.configs.recommended,

  // TypeScript 文件配置
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        global: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-undef': 'off', // TypeScript 处理
    },
  },

  // 忽略的文件和目录
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'out/**',
      '.next/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
    ],
  },
];
