/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  rootDir: '..',
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/backend/src/__tests__/setupTestEnv.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/backend/tsconfig.test.json' }],
  },
  testMatch: ['**/backend/src/__tests__/**/*.test.ts'],
  verbose: true,
};
