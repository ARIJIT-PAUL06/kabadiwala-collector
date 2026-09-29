// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text'],
              message: 'Do not import Text directly from react-native. Use Text from src/ui/Text instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/ui/Text.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
