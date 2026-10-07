/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  // Types are checked by `npm run typecheck`; tests only transpile so they start quickly
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tests/tsconfig.json', diagnostics: false }] },
  // Points the app at the "_test" database before any module reads the environment
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  testTimeout: 30000,
};
