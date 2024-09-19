module.exports = {
  // Set this to true to stop ESLint from looking for configuration files in parent folders
  root: true,

  // Define the environments where the code will run
  env: {
    node: true,
    browser: true,
    es2021: true,
    jest: true,
  },

  // Extend from recommended rule sets
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],

  // Specify the parser for TypeScript
  parser: '@typescript-eslint/parser',

  // Set parsing options
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },

  // List of ESLint plugins to use
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],

  // ESLint rules configuration
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },

  // Settings for specific plugins
  settings: {
    react: {
      version: 'detect',
    },
  },

  // Overrides for specific file patterns
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};