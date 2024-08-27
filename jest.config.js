module.exports = {
    testEnvironment: 'node',
    verbose: true,
    coverageDirectory: './coverage/',
    collectCoverage: true,
    testTimeout: 30000,
    testMatch: ['**/tests/**/*.test.js'],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/"
  ],
  };
  