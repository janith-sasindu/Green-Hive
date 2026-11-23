/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // These tests cover plain TypeScript rules, not React Native components, so no Expo preset is needed
  transform: { '^.+\.ts$': ['ts-jest', { diagnostics: false, tsconfig: { module: 'commonjs', esModuleInterop: true, jsx: 'react' } }] },
};
